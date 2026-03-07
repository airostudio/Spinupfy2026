import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - Validate a discount code
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { code, appliesTo = 'subscription', amount = 0 } = body

    if (!code) {
      return NextResponse.json({ error: 'Discount code is required' }, { status: 400 })
    }

    // Use the database function to validate
    const { data, error } = await supabase.rpc('validate_discount_code', {
      p_code: code.toUpperCase().trim(),
      p_user_id: user.id,
      p_applies_to: appliesTo,
    })

    if (error) {
      // If the function doesn't exist yet, fall back to manual validation
      if (error.code === '42883') {
        // Manual validation fallback
        const { data: discountCode, error: fetchError } = await supabase
          .from('platform_discount_codes')
          .select('*')
          .ilike('code', code.toUpperCase().trim())
          .eq('active', true)
          .single()

        if (fetchError || !discountCode) {
          return NextResponse.json({
            success: false,
            valid: false,
            message: 'Invalid or expired discount code',
          })
        }

        // Check if code is within valid date range
        const now = new Date()
        if (discountCode.starts_at && new Date(discountCode.starts_at) > now) {
          return NextResponse.json({
            success: false,
            valid: false,
            message: 'This discount code is not yet active',
          })
        }

        if (discountCode.ends_at && new Date(discountCode.ends_at) < now) {
          return NextResponse.json({
            success: false,
            valid: false,
            message: 'This discount code has expired',
          })
        }

        // Check applies_to
        if (discountCode.applies_to !== 'all' && discountCode.applies_to !== appliesTo) {
          return NextResponse.json({
            success: false,
            valid: false,
            message: `This code cannot be used for ${appliesTo}`,
          })
        }

        // Check usage limit
        if (discountCode.usage_limit && discountCode.usage_count >= discountCode.usage_limit) {
          return NextResponse.json({
            success: false,
            valid: false,
            message: 'This discount code has reached its usage limit',
          })
        }

        // Check per-user limit
        const { count: userUsageCount } = await supabase
          .from('discount_code_usage')
          .select('*', { count: 'exact', head: true })
          .eq('discount_code_id', discountCode.id)
          .eq('user_id', user.id)

        if (discountCode.per_user_limit && (userUsageCount || 0) >= discountCode.per_user_limit) {
          return NextResponse.json({
            success: false,
            valid: false,
            message: 'You have already used this discount code',
          })
        }

        // Check minimum purchase amount
        if (discountCode.minimum_purchase_amount && amount < discountCode.minimum_purchase_amount) {
          return NextResponse.json({
            success: false,
            valid: false,
            message: `Minimum purchase amount of $${discountCode.minimum_purchase_amount} required`,
          })
        }

        // Check first-time users only
        if (discountCode.first_time_users_only) {
          const { count: previousUsage } = await supabase
            .from('discount_code_usage')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          if (previousUsage && previousUsage > 0) {
            return NextResponse.json({
              success: false,
              valid: false,
              message: 'This code is only for first-time users',
            })
          }
        }

        // Calculate discount amount
        let discountAmount = 0
        if (discountCode.discount_type === 'percentage') {
          discountAmount = (amount * discountCode.discount_value) / 100
        } else if (discountCode.discount_type === 'fixed_amount') {
          discountAmount = Math.min(discountCode.discount_value, amount)
        }

        return NextResponse.json({
          success: true,
          valid: true,
          discount: {
            id: discountCode.id,
            code: discountCode.code,
            type: discountCode.discount_type,
            value: discountCode.discount_value,
            description: discountCode.description,
            discountAmount: discountAmount,
          },
          message: 'Discount code applied successfully',
        })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Process the result from the database function
    const result = data?.[0]

    if (!result?.valid) {
      return NextResponse.json({
        success: false,
        valid: false,
        message: result?.message || 'Invalid discount code',
      })
    }

    // Calculate discount amount based on type
    let discountAmount = 0
    if (result.discount_type === 'percentage') {
      discountAmount = (amount * result.discount_value) / 100
    } else if (result.discount_type === 'fixed_amount') {
      discountAmount = Math.min(result.discount_value, amount)
    }

    return NextResponse.json({
      success: true,
      valid: true,
      discount: {
        id: result.discount_id,
        type: result.discount_type,
        value: result.discount_value,
        discountAmount: discountAmount,
      },
      message: result.message,
    })
  } catch (error: any) {
    console.error('Error validating discount code:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
