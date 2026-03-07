/**
 * Order Refund API
 * Handles partial and full refunds via Stripe
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, reason, notifyCustomer = true } = body

    // Get order with store info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        stores!inner (
          id,
          user_id,
          name,
          email
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify store ownership
    const storeData = Array.isArray(order.stores) ? order.stores[0] : order.stores
    if (!storeData || storeData.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if order is paid
    if (order.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Only paid orders can be refunded' }, { status: 400 })
    }

    // Check if already fully refunded
    const existingRefunds = order.refund_amount || 0
    const maxRefundable = order.total - existingRefunds

    if (maxRefundable <= 0) {
      return NextResponse.json({ error: 'Order has already been fully refunded' }, { status: 400 })
    }

    // Determine refund amount
    const refundAmount = amount ? Math.min(amount, maxRefundable) : maxRefundable
    const isFullRefund = refundAmount >= order.total - existingRefunds

    if (!order.stripe_payment_intent_id) {
      return NextResponse.json({ error: 'No payment found for this order' }, { status: 400 })
    }

    // Process refund via Stripe
    let stripeRefund: Stripe.Refund
    try {
      stripeRefund = await stripe.refunds.create({
        payment_intent: order.stripe_payment_intent_id,
        amount: Math.round(refundAmount * 100), // Convert to cents
        reason: reason === 'duplicate' ? 'duplicate' :
                reason === 'fraudulent' ? 'fraudulent' : 'requested_by_customer',
      })
    } catch (stripeError: any) {
      console.error('Stripe refund error:', stripeError)
      return NextResponse.json({
        error: stripeError.message || 'Failed to process refund with Stripe'
      }, { status: 500 })
    }

    // Update order in database
    const newRefundAmount = existingRefunds + refundAmount
    const newPaymentStatus = isFullRefund ? 'refunded' : 'paid' // Keep as paid for partial

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: newPaymentStatus,
        refund_amount: newRefundAmount,
        refunded_at: new Date().toISOString(),
        refund_reason: reason,
        stripe_refund_id: stripeRefund.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order:', updateError)
      // Note: Stripe refund was already processed at this point
    }

    // Log refund activity (fire and forget)
    supabase.from('order_activity_log').insert({
      order_id: orderId,
      user_id: user.id,
      action: 'refund',
      details: {
        amount: refundAmount,
        reason,
        stripeRefundId: stripeRefund.id,
        isFullRefund,
      },
    }).then(({ error }) => {
      if (error) console.log('Activity log not saved:', error)
    })

    // Send refund notification email (if enabled)
    if (notifyCustomer) {
      // This would integrate with the email service
      console.log(`Refund notification would be sent to ${order.customer_email}`)
    }

    return NextResponse.json({
      success: true,
      message: isFullRefund ? 'Order fully refunded' : 'Partial refund processed',
      refund: {
        id: stripeRefund.id,
        amount: refundAmount,
        status: stripeRefund.status,
        isFullRefund,
        totalRefunded: newRefundAmount,
        remainingAmount: order.total - newRefundAmount,
      },
    })
  } catch (error: any) {
    console.error('Error processing refund:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Get refund history for an order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get order with refund info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total,
        refund_amount,
        refunded_at,
        refund_reason,
        stripe_refund_id,
        payment_status,
        stores!inner (
          id,
          user_id
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify store ownership
    const store = Array.isArray(order.stores) ? order.stores[0] : order.stores
    if (!store || store.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      refund: {
        orderId: order.id,
        orderNumber: order.order_number,
        total: order.total,
        refundedAmount: order.refund_amount || 0,
        remainingAmount: order.total - (order.refund_amount || 0),
        refundedAt: order.refunded_at,
        reason: order.refund_reason,
        stripeRefundId: order.stripe_refund_id,
        status: order.payment_status,
        canRefund: order.payment_status === 'paid' && order.total > (order.refund_amount || 0),
      },
    })
  } catch (error: any) {
    console.error('Error getting refund info:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
