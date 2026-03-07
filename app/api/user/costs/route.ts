import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get time range from query params (default to 30 days)
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '30d'

    const dateThreshold = timeRange === '7d'
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : timeRange === '30d'
      ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      : timeRange === '90d'
      ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      : new Date(0)

    // Fetch user's API usage
    let query = supabase
      .from('api_usage')
      .select('service, tokens_used, cost_usd, created_at, request_data, endpoint')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (timeRange !== 'all') {
      query = query.gte('created_at', dateThreshold.toISOString())
    }

    const { data: apiUsage, error } = await query.limit(100)

    if (error) {
      console.error('Error fetching API usage:', error)
      return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 })
    }

    // Calculate cost summary
    const gpt4Cost = apiUsage?.filter(u => u.service === 'OPENAI_GPT4' || u.service === 'openai')
      .reduce((sum, u) => sum + parseFloat(u.cost_usd.toString()), 0) || 0

    const dalleCost = apiUsage?.filter(u => u.service === 'OPENAI_DALLE' || u.service === 'dalle')
      .reduce((sum, u) => sum + parseFloat(u.cost_usd.toString()), 0) || 0

    const totalCost = gpt4Cost + dalleCost

    // Count unique generations (by website/business name)
    const uniqueWebsites = new Set(
      apiUsage?.map(u => (u.request_data as any)?.websiteName || (u.request_data as any)?.businessName)
        .filter(Boolean)
    )

    // Format recent usage
    const recentUsage = apiUsage?.slice(0, 20).map(u => ({
      service: u.service,
      cost: parseFloat(u.cost_usd.toString()),
      tokens: u.tokens_used || 0,
      websiteName: (u.request_data as any)?.websiteName || (u.request_data as any)?.businessName || 'N/A',
      endpoint: u.endpoint,
      createdAt: u.created_at,
    })) || []

    // Calculate current month costs
    const currentMonthStart = new Date()
    currentMonthStart.setDate(1)
    currentMonthStart.setHours(0, 0, 0, 0)

    const currentMonthCost = apiUsage?.filter(u => new Date(u.created_at) >= currentMonthStart)
      .reduce((sum, u) => sum + parseFloat(u.cost_usd.toString()), 0) || 0

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalCost,
          gpt4Cost,
          dalleCost,
          currentMonthCost,
          totalGenerations: uniqueWebsites.size,
          avgCostPerGeneration: uniqueWebsites.size > 0 ? totalCost / uniqueWebsites.size : 0,
          totalRequests: apiUsage?.length || 0,
        },
        recentUsage,
        timeRange,
      },
    })
  } catch (error: any) {
    console.error('Error in costs API:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
