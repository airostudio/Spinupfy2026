import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Check OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OpenAI API key not configured',
        balance: null,
        status: 'not_configured',
      })
    }

    // Fetch billing data from OpenAI API
    // Note: OpenAI doesn't have a direct balance API, but we can check subscription/usage
    const response = await fetch('https://api.openai.com/v1/dashboard/billing/subscription', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // If the billing endpoint fails, try a simple models endpoint to verify API key works
      const modelsResponse = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      })

      if (!modelsResponse.ok) {
        return NextResponse.json({
          error: 'Invalid or expired OpenAI API key',
          balance: null,
          status: 'invalid_key',
        })
      }

      return NextResponse.json({
        error: 'Unable to fetch billing data',
        balance: null,
        status: 'billing_unavailable',
        apiKeyValid: true,
      })
    }

    const billingData = await response.json()

    // Fetch usage data for current month
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const usageResponse = await fetch(
      `https://api.openai.com/v1/dashboard/billing/usage?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    let monthlyUsage = 0
    if (usageResponse.ok) {
      const usageData = await usageResponse.json()
      monthlyUsage = usageData.total_usage ? usageData.total_usage / 100 : 0 // Convert cents to dollars
    }

    // Calculate estimated balance
    // OpenAI provides hard_limit_usd and soft_limit_usd in subscription data
    const hardLimit = billingData.hard_limit_usd || 0
    const softLimit = billingData.soft_limit_usd || 0
    const estimatedBalance = hardLimit - monthlyUsage

    return NextResponse.json({
      balance: estimatedBalance,
      hardLimit,
      softLimit,
      monthlyUsage,
      status: estimatedBalance < 10 ? 'low' : estimatedBalance < 50 ? 'warning' : 'ok',
      apiKeyValid: true,
      lastChecked: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error checking OpenAI balance:', error)
    return NextResponse.json(
      {
        error: error?.message || 'Failed to check OpenAI balance',
        balance: null,
        status: 'error',
      },
      { status: 500 }
    )
  }
}
