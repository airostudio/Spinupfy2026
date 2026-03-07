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

// GET - List all orders with pagination and filters
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
    const paymentStatus = searchParams.get('payment_status')
    const fulfillmentStatus = searchParams.get('fulfillment_status')
    const search = searchParams.get('search') || ''
    const storeId = searchParams.get('store_id')

    const offset = (page - 1) * limit

    let query = supabase
      .from('orders')
      .select(`
        *,
        store:stores(id, store_name, website_id),
        items:order_items(
          id,
          product_name,
          variant_title,
          quantity,
          price,
          total
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus)
    }

    if (fulfillmentStatus) {
      query = query.eq('fulfillment_status', fulfillmentStatus)
    }

    if (search) {
      query = query.or(`customer_email.ilike.%${search}%,customer_name.ilike.%${search}%,order_number.ilike.%${search}%`)
    }

    if (storeId) {
      query = query.eq('store_id', storeId)
    }

    const { data: orders, error: fetchError, count } = await query

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Get order statistics
    const [
      { count: totalOrders },
      { count: pendingOrders },
      { count: paidOrders },
      { count: unfulfilledOrders },
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('payment_status', 'pending'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('payment_status', 'paid'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('fulfillment_status', 'unfulfilled'),
    ])

    // Calculate total revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total')
      .eq('payment_status', 'paid')

    const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.total?.toString() || '0'), 0) || 0

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        stats: {
          totalOrders: totalOrders || 0,
          pendingOrders: pendingOrders || 0,
          paidOrders: paidOrders || 0,
          unfulfilledOrders: unfulfilledOrders || 0,
          totalRevenue,
        },
      },
    })
  } catch (error: any) {
    console.error('Error in admin orders GET:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update order status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { authorized, error, status, adminId } = await checkAdminAccess(supabase)

    if (!authorized) {
      return NextResponse.json({ error }, { status })
    }

    const body = await request.json()
    const { orderId, updates, notes } = body

    if (!orderId || !updates) {
      return NextResponse.json({ error: 'orderId and updates are required' }, { status: 400 })
    }

    // Get current order data
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchError || !currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Allowed fields to update
    const allowedFields = [
      'payment_status',
      'fulfillment_status',
      'tracking_number',
      'tracking_url',
      'carrier',
      'staff_note',
    ]

    const sanitizedUpdates: Record<string, any> = {}
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field]
      }
    }

    // Add fulfilled_at timestamp if marking as fulfilled
    if (updates.fulfillment_status === 'fulfilled' && currentOrder.fulfillment_status !== 'fulfilled') {
      sanitizedUpdates.fulfilled_at = new Date().toISOString()
    }

    // Add cancelled_at timestamp if marking as cancelled
    if (updates.fulfillment_status === 'cancelled' && currentOrder.fulfillment_status !== 'cancelled') {
      sanitizedUpdates.cancelled_at = new Date().toISOString()
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(sanitizedUpdates)
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log the action
    await logAdminAction(
      supabase,
      adminId!,
      'order_status_change',
      'order',
      orderId,
      {
        payment_status: currentOrder.payment_status,
        fulfillment_status: currentOrder.fulfillment_status,
      },
      sanitizedUpdates,
      notes || `Order ${currentOrder.order_number} updated`
    )

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    })
  } catch (error: any) {
    console.error('Error in admin orders PATCH:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
