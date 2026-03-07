import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper to check admin access
async function checkAdminAccess(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { authorized: false, error: 'Unauthorized', status: 401, adminId: null }
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'admin') {
    return { authorized: false, error: 'Admin access required', status: 403, adminId: null }
  }

  return { authorized: true, error: null, status: 200, adminId: user.id }
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

// GET - List all discount codes
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { authorized, error, status } = await checkAdminAccess(supabase)

    if (!authorized) {
      return NextResponse.json({ error }, { status })
    }

    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const appliesTo = searchParams.get('applies_to')

    let query = supabase
      .from('platform_discount_codes')
      .select(`
        *,
        creator:created_by(email),
        usage:discount_code_usage(count)
      `)
      .order('created_at', { ascending: false })

    if (active !== null) {
      query = query.eq('active', active === 'true')
    }

    if (appliesTo) {
      query = query.eq('applies_to', appliesTo)
    }

    const { data: discountCodes, error: fetchError } = await query

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Format the response
    const formattedCodes = discountCodes?.map((code: any) => ({
      ...code,
      creator_email: code.creator?.email || null,
      actual_usage_count: code.usage?.[0]?.count || 0,
    }))

    return NextResponse.json({
      success: true,
      data: formattedCodes,
    })
  } catch (error: any) {
    console.error('Error in discount codes GET:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new discount code
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { authorized, error, status, adminId } = await checkAdminAccess(supabase)

    if (!authorized) {
      return NextResponse.json({ error }, { status })
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = ['code', 'discount_type', 'discount_value']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Validate discount_type
    const validTypes = ['percentage', 'fixed_amount', 'free_trial_days', 'plan_upgrade']
    if (!validTypes.includes(body.discount_type)) {
      return NextResponse.json({ error: 'Invalid discount_type' }, { status: 400 })
    }

    // Validate applies_to
    const validAppliesTo = ['subscription', 'ecommerce', 'all']
    if (body.applies_to && !validAppliesTo.includes(body.applies_to)) {
      return NextResponse.json({ error: 'Invalid applies_to value' }, { status: 400 })
    }

    // Validate percentage is between 0 and 100
    if (body.discount_type === 'percentage' && (body.discount_value < 0 || body.discount_value > 100)) {
      return NextResponse.json({ error: 'Percentage must be between 0 and 100' }, { status: 400 })
    }

    // Check if code already exists
    const { data: existing } = await supabase
      .from('platform_discount_codes')
      .select('id')
      .ilike('code', body.code)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'A discount code with this code already exists' }, { status: 409 })
    }

    // Create the discount code
    const discountData = {
      code: body.code.toUpperCase().trim(),
      description: body.description || null,
      discount_type: body.discount_type,
      discount_value: body.discount_value,
      applies_to: body.applies_to || 'subscription',
      applicable_plans: body.applicable_plans || null,
      usage_limit: body.usage_limit || null,
      per_user_limit: body.per_user_limit || 1,
      minimum_purchase_amount: body.minimum_purchase_amount || null,
      first_time_users_only: body.first_time_users_only || false,
      starts_at: body.starts_at || new Date().toISOString(),
      ends_at: body.ends_at || null,
      active: body.active !== undefined ? body.active : true,
      created_by: adminId,
    }

    const { data: newCode, error: createError } = await supabase
      .from('platform_discount_codes')
      .insert(discountData)
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    // Log the action
    await logAdminAction(
      supabase,
      adminId!,
      'discount_code_create',
      'discount_code',
      newCode.id,
      null,
      discountData,
      `Created discount code: ${newCode.code}`
    )

    return NextResponse.json({
      success: true,
      data: newCode,
    })
  } catch (error: any) {
    console.error('Error in discount codes POST:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update a discount code
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { authorized, error, status, adminId } = await checkAdminAccess(supabase)

    if (!authorized) {
      return NextResponse.json({ error }, { status })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Get current code data
    const { data: currentCode, error: fetchError } = await supabase
      .from('platform_discount_codes')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentCode) {
      return NextResponse.json({ error: 'Discount code not found' }, { status: 404 })
    }

    // Allowed fields to update
    const allowedFields = [
      'description',
      'discount_type',
      'discount_value',
      'applies_to',
      'applicable_plans',
      'usage_limit',
      'per_user_limit',
      'minimum_purchase_amount',
      'first_time_users_only',
      'starts_at',
      'ends_at',
      'active',
    ]

    const sanitizedUpdates: Record<string, any> = {}
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field]
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Update the discount code
    const { data: updatedCode, error: updateError } = await supabase
      .from('platform_discount_codes')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log the action
    await logAdminAction(
      supabase,
      adminId!,
      'discount_code_update',
      'discount_code',
      id,
      currentCode,
      sanitizedUpdates,
      `Updated discount code: ${currentCode.code}`
    )

    return NextResponse.json({
      success: true,
      data: updatedCode,
    })
  } catch (error: any) {
    console.error('Error in discount codes PATCH:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a discount code
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { authorized, error, status, adminId } = await checkAdminAccess(supabase)

    if (!authorized) {
      return NextResponse.json({ error }, { status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Get current code data
    const { data: currentCode, error: fetchError } = await supabase
      .from('platform_discount_codes')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentCode) {
      return NextResponse.json({ error: 'Discount code not found' }, { status: 404 })
    }

    // Delete the discount code
    const { error: deleteError } = await supabase
      .from('platform_discount_codes')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Log the action
    await logAdminAction(
      supabase,
      adminId!,
      'discount_code_delete',
      'discount_code',
      id,
      currentCode,
      null,
      `Deleted discount code: ${currentCode.code}`
    )

    return NextResponse.json({
      success: true,
      message: 'Discount code deleted successfully',
    })
  } catch (error: any) {
    console.error('Error in discount codes DELETE:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
