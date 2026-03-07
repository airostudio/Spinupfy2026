import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calculateTax } from '@/lib/stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, billingCycle, taxCode, addons } = body

    // Define pricing (includes Stripe fees: 2.9% + $0.30)
    const plans = {
      basic: {
        monthly: 16.99,
        annual: 173.88, // 10 months charged (2 months free)
      },
      professional: {
        monthly: 26.99,
        annual: 269.88, // 10 months charged (2 months free)
      },
      agency: {
        monthly: 47.49,
        annual: 473.88, // 10 months charged (2 months free)
      },
    }

    if (!plans[planId as keyof typeof plans]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Calculate base amount
    let baseAmount = plans[planId as keyof typeof plans][billingCycle as 'monthly' | 'annual']

    // Add add-ons if any
    if (addons) {
      if (addons.extraWebsites > 0) {
        baseAmount += addons.extraWebsites * 7.99
      }
      if (addons.extraSeats > 0) {
        baseAmount += addons.extraSeats * 5.99
      }
    }

    // Calculate tax
    const { tax, total, taxName, taxRate } = calculateTax(baseAmount, taxCode || 'DEFAULT')

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: user.id,
        planId,
        billingCycle,
        taxCode: taxCode || 'DEFAULT',
        baseAmount: baseAmount.toFixed(2),
        taxAmount: tax.toFixed(2),
        extraWebsites: addons?.extraWebsites || 0,
        extraSeats: addons?.extraSeats || 0,
      },
      description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan - ${billingCycle}`,
    })

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        baseAmount,
        tax,
        total,
        taxName,
        taxRate,
      },
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
