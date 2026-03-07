import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Service name helper functions for consistent filtering
const isGPTService = (service: string) =>
  service === 'openai' || service === 'OPENAI_GPT4' || service === 'gpt-4' || service === 'gpt4' || service === 'OPENAI_GPT35'
const isDALLEService = (service: string) =>
  service === 'dalle' || service === 'OPENAI_DALLE' || service === 'dall-e' || service === 'dalle-3'
const isStripeService = (service: string) =>
  service === 'STRIPE' || service === 'stripe'
const isStripeConnectService = (service: string) =>
  service === 'STRIPE_CONNECT' || service === 'stripe_connect'
const isUnsplashService = (service: string) =>
  service === 'UNSPLASH' || service === 'unsplash'
const isR2Service = (service: string) =>
  service === 'CLOUDFLARE_R2' || service === 'r2' || service === 'cloudflare'
const isVercelService = (service: string) =>
  service === 'VERCEL' || service === 'vercel'
const isPleskService = (service: string) =>
  service === 'PLESK' || service === 'plesk' || service === 'domain'
const isEmailService = (service: string) =>
  service === 'EMAIL' || service === 'email'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Verify user is authenticated and is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get time range from query params (default to 30 days)
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '30d'

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const dateThreshold = timeRange === '7d'
      ? sevenDaysAgo
      : timeRange === '30d'
      ? thirtyDaysAgo
      : timeRange === '90d'
      ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      : new Date(0)

    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, plan, role, ai_generations_used, ai_generations_limit, created_at')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('Error fetching users:', usersError)
    }

    const allUsers = users || []
    const totalUsers = allUsers.length
    const activeUsers = allUsers.filter(u => u.ai_generations_used > 0).length
    const paidUsers = allUsers.filter(u => u.plan && u.plan !== 'FREE').length

    // Fetch all stats in parallel
    const [
      { count: totalWebsites },
      { count: publishedWebsites },
      { count: totalPages },
      { count: totalSections },
      { count: totalStores },
      { count: totalProducts },
      { count: newUsersThisWeek },
      { count: newUsersThisMonth },
      { count: newWebsitesThisWeek },
      { count: newWebsitesThisMonth },
      { count: totalApiRequests },
    ] = await Promise.all([
      supabase.from('websites').select('*', { count: 'exact', head: true }),
      supabase.from('websites').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('pages').select('*', { count: 'exact', head: true }),
      supabase.from('sections').select('*', { count: 'exact', head: true }),
      supabase.from('stores').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
      supabase.from('websites').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('websites').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
      supabase.from('api_usage').select('*', { count: 'exact', head: true }),
    ])

    const draftWebsites = (totalWebsites || 0) - (publishedWebsites || 0)

    // Fetch API usage for cost calculation
    let apiQuery = supabase
      .from('api_usage')
      .select('service, cost_usd, created_at, request_data')
      .order('created_at', { ascending: false })

    if (timeRange !== 'all') {
      apiQuery = apiQuery.gte('created_at', dateThreshold.toISOString())
    }

    const { data: apiUsage, error: apiError } = await apiQuery.limit(500)

    if (apiError) {
      console.error('Error fetching API usage:', apiError)
    }

    // Calculate costs with comprehensive service name filtering
    const gpt4Cost = apiUsage?.filter(u => isGPTService(u.service))
      .reduce((sum, u) => sum + parseFloat(u.cost_usd?.toString() || '0'), 0) || 0

    const dalleCost = apiUsage?.filter(u => isDALLEService(u.service))
      .reduce((sum, u) => sum + parseFloat(u.cost_usd?.toString() || '0'), 0) || 0

    const stripeCost = apiUsage?.filter(u => isStripeService(u.service))
      .reduce((sum, u) => sum + parseFloat(u.cost_usd?.toString() || '0'), 0) || 0

    const stripeConnectCost = apiUsage?.filter(u => isStripeConnectService(u.service))
      .reduce((sum, u) => sum + parseFloat(u.cost_usd?.toString() || '0'), 0) || 0

    const unsplashCost = apiUsage?.filter(u => isUnsplashService(u.service))
      .reduce((sum, u) => sum + parseFloat(u.cost_usd?.toString() || '0'), 0) || 0

    const r2Cost = apiUsage?.filter(u => isR2Service(u.service))
      .reduce((sum, u) => sum + parseFloat(u.cost_usd?.toString() || '0'), 0) || 0

    const vercelCost = apiUsage?.filter(u => isVercelService(u.service))
      .reduce((sum, u) => sum + parseFloat(u.cost_usd?.toString() || '0'), 0) || 0

    const pleskCost = apiUsage?.filter(u => isPleskService(u.service))
      .reduce((sum, u) => sum + parseFloat(u.cost_usd?.toString() || '0'), 0) || 0

    const emailCost = apiUsage?.filter(u => isEmailService(u.service))
      .reduce((sum, u) => sum + parseFloat(u.cost_usd?.toString() || '0'), 0) || 0

    // Calculate totals by category
    const aiCost = gpt4Cost + dalleCost
    const paymentCost = stripeCost + stripeConnectCost
    const infrastructureCost = r2Cost + vercelCost + pleskCost
    const mediaCost = unsplashCost

    const totalCost = aiCost + paymentCost + infrastructureCost + mediaCost + emailCost

    // Get request counts per service
    const gpt4Requests = apiUsage?.filter(u => isGPTService(u.service)).length || 0
    const dalleRequests = apiUsage?.filter(u => isDALLEService(u.service)).length || 0
    const stripeRequests = apiUsage?.filter(u => isStripeService(u.service) || isStripeConnectService(u.service)).length || 0
    const unsplashRequests = apiUsage?.filter(u => isUnsplashService(u.service)).length || 0
    const r2Requests = apiUsage?.filter(u => isR2Service(u.service)).length || 0

    // Count unique generations
    const uniqueGenerations = new Set(
      apiUsage?.map(u => (u.request_data as any)?.websiteName || (u.request_data as any)?.businessName)
        .filter(Boolean)
    )

    const avgCostPerGeneration = uniqueGenerations.size > 0 ? totalCost / uniqueGenerations.size : 0

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          paid: paidUsers,
          conversionRate: totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : '0',
          activeRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0',
          newThisWeek: newUsersThisWeek || 0,
          newThisMonth: newUsersThisMonth || 0,
        },
        websites: {
          total: totalWebsites || 0,
          published: publishedWebsites || 0,
          drafts: draftWebsites,
          newThisWeek: newWebsitesThisWeek || 0,
          newThisMonth: newWebsitesThisMonth || 0,
        },
        costs: {
          total: totalCost,
          // AI costs
          gpt4: gpt4Cost,
          dalle: dalleCost,
          aiTotal: aiCost,
          // Payment processing costs
          stripe: stripeCost,
          stripeConnect: stripeConnectCost,
          paymentsTotal: paymentCost,
          // Infrastructure costs
          r2: r2Cost,
          vercel: vercelCost,
          plesk: pleskCost,
          infrastructureTotal: infrastructureCost,
          // Media costs
          unsplash: unsplashCost,
          mediaTotal: mediaCost,
          // Communications
          email: emailCost,
          // Metrics
          avgPerGeneration: avgCostPerGeneration,
          totalGenerations: uniqueGenerations.size,
          totalApiRequests: totalApiRequests || 0,
          // Request counts by service
          requestCounts: {
            gpt4: gpt4Requests,
            dalle: dalleRequests,
            stripe: stripeRequests,
            unsplash: unsplashRequests,
            r2: r2Requests,
          },
        },
        content: {
          pages: totalPages || 0,
          sections: totalSections || 0,
          stores: totalStores || 0,
          products: totalProducts || 0,
        },
        timeRange,
      },
    })
  } catch (error: any) {
    console.error('Error in admin stats API:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
