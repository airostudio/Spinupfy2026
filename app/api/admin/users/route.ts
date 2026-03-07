import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper to check admin access
async function checkAdminAccess(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { authorized: false, error: 'Unauthorized', status: 401, user: null, adminId: null }
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'admin') {
    return { authorized: false, error: 'Admin access required', status: 403, user: null, adminId: null }
  }

  return { authorized: true, error: null, status: 200, user: userData, adminId: user.id }
}

// Log admin action
async function logAdminAction(
  supabase: any,
  adminId: string,
  actionType: string,
  targetType: string,
  targetId: string,
  oldValue: any,
  newValue: any,
  notes?: string
) {
  try {
    await supabase.from('admin_action_log').insert({
      admin_id: adminId,
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      old_value: oldValue,
      new_value: newValue,
      notes,
    })
  } catch (error) {
    console.error('Failed to log admin action:', error)
  }
}

// GET - List all users with pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { authorized, error, status } = await checkAdminAccess(supabase)

    if (!authorized) {
      return NextResponse.json({ error }, { status })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const plan = searchParams.get('plan') || ''
    const role = searchParams.get('role') || ''

    const offset = (page - 1) * limit

    let query = supabase
      .from('users')
      .select('id, email, name, plan, role, ai_generations_used, ai_generations_limit, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
    }

    if (plan) {
      query = query.eq('plan', plan)
    }

    if (role) {
      query = query.eq('role', role)
    }

    const { data: users, error: usersError, count } = await query

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    })
  } catch (error: any) {
    console.error('Error in admin users API:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update a user (plan, role, generation limits, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { authorized, error, status, adminId } = await checkAdminAccess(supabase)

    if (!authorized) {
      return NextResponse.json({ error }, { status })
    }

    const body = await request.json()
    const { userId, updates, notes } = body

    if (!userId || !updates) {
      return NextResponse.json({ error: 'userId and updates are required' }, { status: 400 })
    }

    // Get current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent modifying other admins (self-modification is allowed)
    if (currentUser.role === 'admin' && userId !== adminId) {
      return NextResponse.json({ error: 'Cannot modify other admin users' }, { status: 403 })
    }

    // Allowed fields to update
    const allowedFields = ['plan', 'role', 'ai_generations_used', 'ai_generations_limit', 'name']
    const sanitizedUpdates: Record<string, any> = {}

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field]
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(sanitizedUpdates)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log the action
    const actionTypes: Record<string, string> = {
      plan: 'user_plan_change',
      role: 'user_role_change',
      ai_generations_limit: 'user_generation_limit_change',
      ai_generations_used: 'user_generation_limit_change',
    }

    for (const field of Object.keys(sanitizedUpdates)) {
      if (actionTypes[field]) {
        await logAdminAction(
          supabase,
          adminId!,
          actionTypes[field],
          'user',
          userId,
          { [field]: currentUser[field] },
          { [field]: sanitizedUpdates[field] },
          notes
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
    })
  } catch (error: any) {
    console.error('Error in admin users PATCH:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a user
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { authorized, error, status, adminId } = await checkAdminAccess(supabase)

    if (!authorized) {
      return NextResponse.json({ error }, { status })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deleting admin users
    if (currentUser.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 })
    }

    // Delete user's websites first (cascade should handle related data)
    const { error: websitesError } = await supabase
      .from('websites')
      .delete()
      .eq('user_id', userId)

    if (websitesError) {
      console.error('Error deleting user websites:', websitesError)
    }

    // Delete user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Log the action
    await logAdminAction(
      supabase,
      adminId!,
      'user_delete',
      'user',
      userId,
      currentUser,
      null,
      'User deleted by admin'
    )

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error: any) {
    console.error('Error in admin users DELETE:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
