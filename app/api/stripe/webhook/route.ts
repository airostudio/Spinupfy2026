import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getPlanFromPriceId, getGenerationsLimit } from '@/lib/stripe-config'
import { trackApiCost } from '@/lib/track-api-cost'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Disable body parsing, we need the raw body for signature verification
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session, supabase)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription, supabase)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription, supabase)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice, supabase)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice, supabase)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error?.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!customerId) return

  // Get the subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Get user by Stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Determine plan from subscription
  const plan = determinePlanFromSubscription(subscription)

  // Update user subscription details
  await supabase
    .from('users')
    .update({
      plan,
      stripe_subscription_id: subscriptionId,
      plan_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
      ai_generations_limit: getGenerationsLimit(plan),
    })
    .eq('id', user.id)

  console.log(`Checkout completed for user ${user.id}, plan: ${plan}`)
}

async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const customerId = subscription.customer as string

  // Get user by Stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!user) {
    console.error('User not found for customer:', customerId)
    return
  }

  const plan = determinePlanFromSubscription(subscription)
  const isActive = subscription.status === 'active' || subscription.status === 'trialing'

  // Update user subscription details
  await supabase
    .from('users')
    .update({
      plan: isActive ? plan : 'FREE',
      stripe_subscription_id: subscription.id,
      plan_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
      ai_generations_limit: isActive ? getGenerationsLimit(plan) : 10,
    })
    .eq('id', user.id)

  console.log(`Subscription updated for user ${user.id}, status: ${subscription.status}, plan: ${plan}`)
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const customerId = subscription.customer as string

  // Get user by Stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Revert to FREE plan
  await supabase
    .from('users')
    .update({
      plan: 'FREE',
      stripe_subscription_id: null,
      plan_expires_at: null,
      ai_generations_limit: 10,
    })
    .eq('id', user.id)

  console.log(`Subscription deleted for user ${user.id}, reverted to FREE plan`)
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: any
) {
  const customerId = invoice.customer as string
  const subscriptionId = invoice.subscription as string

  if (!subscriptionId) return

  // Get user by Stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!user) return

  // Get the subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId as string)
  const plan = determinePlanFromSubscription(subscription)

  // Update subscription period
  await supabase
    .from('users')
    .update({
      plan,
      plan_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('id', user.id)

  // Track Stripe payment processing cost (2.9% + $0.30)
  const amountPaid = (invoice.amount_paid || 0) / 100 // Convert from cents
  if (amountPaid > 0) {
    await trackApiCost({
      userId: user.id,
      service: 'STRIPE',
      endpoint: 'invoice.payment_succeeded',
      transactionAmount: amountPaid,
      requestData: {
        invoiceId: invoice.id,
        subscriptionId,
        plan,
        amount: amountPaid,
      },
      success: true,
    })
  }

  console.log(`Invoice paid for user ${user.id}, plan renewed`)
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: any
) {
  const customerId = invoice.customer as string

  // Get user by Stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!user) return

  console.log(`Payment failed for user ${user.id} (${user.email})`)
  // You could send an email notification here
}

function determinePlanFromSubscription(subscription: Stripe.Subscription): string {
  // Get the first price ID from the subscription
  const priceId = subscription.items.data[0]?.price.id

  // You can also check the subscription metadata
  if (subscription.metadata.plan) {
    return subscription.metadata.plan
  }

  // Use the helper function from stripe-config
  return getPlanFromPriceId(priceId)
}
