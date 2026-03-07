'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  Loader2, DollarSign, Users, Globe, Zap, TrendingUp, Calendar,
  Database, HardDrive, Trash2, AlertCircle, CheckCircle, XCircle,
  BarChart3, Activity, Clock, Shield, Settings, X, Eye, ChevronRight,
  FileText, Image as ImageIcon, CreditCard, Edit2, Save, Tag, ShoppingCart,
  Package, Percent, Plus, Copy, ToggleLeft, ToggleRight, Search, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

type TabType = 'overview' | 'users' | 'costs' | 'websites' | 'discounts' | 'orders' | 'system'

interface CostSummary {
  total_cost: number
  total_generations: number
  // AI costs
  gpt4_cost: number
  dalle_cost: number
  ai_total: number
  // Payment costs
  stripe_cost: number
  stripe_connect_cost: number
  payments_total: number
  // Infrastructure costs
  r2_cost: number
  vercel_cost: number
  plesk_cost: number
  infrastructure_total: number
  // Media costs
  unsplash_cost: number
  media_total: number
  // Email
  email_cost: number
  // Metrics
  avg_cost_per_generation: number
  // Request counts
  request_counts: {
    gpt4: number
    dalle: number
    stripe: number
    unsplash: number
    r2: number
  }
}

interface GenerationDetail {
  id: string
  user_email: string
  website_name: string
  service: string
  tokens_used: number
  cost_usd: number
  created_at: string
}

interface UserDetail {
  id: string
  email: string
  name: string | null
  plan: string
  role: string
  ai_generations_used: number
  ai_generations_limit: number
  created_at: string
  last_sign_in_at: string | null
}

interface WebsiteDetail {
  id: string
  name: string
  slug: string
  user_email: string
  published: boolean
  pages_count: number
  created_at: string
  published_at: string | null
}

interface SystemStats {
  total_websites: number
  published_websites: number
  total_pages: number
  total_sections: number
  total_stores: number
  total_products: number
  draft_websites: number
  expired_drafts: number
  new_users_this_week: number
  new_users_this_month: number
  new_websites_this_week: number
  new_websites_this_month: number
  total_api_requests: number
}

interface UserDrillDown {
  user: UserDetail
  websites: Array<{
    id: string
    name: string
    slug: string
    published: boolean
    created_at: string
    pages_count: number
  }>
  api_usage: Array<{
    service: string
    cost_usd: number
    created_at: string
    website_name: string
  }>
  total_cost: number
}

interface WebsiteDrillDown {
  website: WebsiteDetail & { user_id: string }
  pages: Array<{
    id: string
    title: string
    path: string
    is_homepage: boolean
    sections_count: number
  }>
  api_costs: Array<{
    service: string
    cost_usd: number
    created_at: string
  }>
  total_cost: number
}

interface DiscountCode {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed_amount' | 'free_trial_days' | 'plan_upgrade'
  discount_value: number
  applies_to: 'subscription' | 'ecommerce' | 'all'
  applicable_plans: string[] | null
  usage_limit: number | null
  usage_count: number
  per_user_limit: number
  minimum_purchase_amount: number | null
  first_time_users_only: boolean
  starts_at: string | null
  ends_at: string | null
  active: boolean
  created_at: string
  creator_email?: string
}

interface Order {
  id: string
  order_number: string
  customer_email: string
  customer_name: string | null
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  fulfillment_status: 'unfulfilled' | 'partial' | 'fulfilled' | 'cancelled'
  tracking_number: string | null
  created_at: string
  store: {
    id: string
    store_name: string
    website_id: string
  } | null
  items: Array<{
    id: string
    product_name: string
    variant_title: string | null
    quantity: number
    price: number
    total: number
  }>
}

interface OrderStats {
  totalOrders: number
  pendingOrders: number
  paidOrders: number
  unfulfilledOrders: number
  totalRevenue: number
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Data states
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null)
  const [recentGenerations, setRecentGenerations] = useState<GenerationDetail[]>([])
  const [users, setUsers] = useState<UserDetail[]>([])
  const [websites, setWebsites] = useState<WebsiteDetail[]>([])
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d')
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  // Drill-down states
  const [selectedUser, setSelectedUser] = useState<UserDrillDown | null>(null)
  const [selectedWebsite, setSelectedWebsite] = useState<WebsiteDrillDown | null>(null)
  const [loadingDrillDown, setLoadingDrillDown] = useState(false)

  // User edit states
  const [editingUser, setEditingUser] = useState<UserDetail | null>(null)
  const [editUserForm, setEditUserForm] = useState({
    plan: '',
    role: '',
    ai_generations_limit: 0,
  })
  const [savingUser, setSavingUser] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')

  // Discount codes states
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([])
  const [loadingDiscounts, setLoadingDiscounts] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null)
  const [discountForm, setDiscountForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_amount' | 'free_trial_days' | 'plan_upgrade',
    discount_value: 10,
    applies_to: 'subscription' as 'subscription' | 'ecommerce' | 'all',
    usage_limit: null as number | null,
    per_user_limit: 1,
    minimum_purchase_amount: null as number | null,
    first_time_users_only: false,
    starts_at: '',
    ends_at: '',
    active: true,
  })
  const [savingDiscount, setSavingDiscount] = useState(false)

  // Orders states
  const [orders, setOrders] = useState<Order[]>([])
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderStatusFilter, setOrderStatusFilter] = useState('')

  // OpenAI Balance states
  const [openaiBalance, setOpenaiBalance] = useState<{
    balance: number | null
    status: 'ok' | 'warning' | 'low' | 'error' | 'not_configured' | 'invalid_key'
    hardLimit?: number
    monthlyUsage?: number
    lastChecked?: string
    error?: string
  } | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadAdminData()
      checkOpenAIBalance()
    }
  }, [isAdmin, timeRange])

  // Check OpenAI balance every 5 minutes
  useEffect(() => {
    if (!isAdmin) return

    const interval = setInterval(() => {
      checkOpenAIBalance()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [isAdmin])

  async function checkAdminAccess() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Try to check role column
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      // If role column doesn't exist yet (error code 42703)
      if (error?.code === '42703') {
        // Temporarily allow access for development
        // In production, you should run the migration or check against specific admin emails
        console.warn('Role column does not exist. Please run the database migration.')
        toast.error('Admin access requires database migration. Please contact support.')
        router.push('/dashboard')
        return
      }

      if (error || !userData || userData.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.')
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  async function loadAdminData() {
    try {
      await Promise.all([
        loadCostData(),
        loadUserData(),
        loadWebsiteData(),
        loadSystemStats(),
        loadDiscountCodes(),
        loadOrders(),
      ])
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    }
  }

  async function checkOpenAIBalance() {
    if (loadingBalance) return

    setLoadingBalance(true)
    try {
      const response = await fetch('/api/admin/openai-balance')
      const data = await response.json()

      setOpenaiBalance(data)

      // Show toast if balance is critically low
      if (data.status === 'low' && data.balance !== null) {
        toast.error(`⚠️ OpenAI Balance Critical: $${data.balance.toFixed(2)} remaining!`, {
          duration: 10000,
          icon: '🚨',
        })
      }
    } catch (error) {
      console.error('Error checking OpenAI balance:', error)
      setOpenaiBalance({
        balance: null,
        status: 'error',
        error: 'Failed to check balance',
      })
    } finally {
      setLoadingBalance(false)
    }
  }

  async function loadCostData() {
    const dateThreshold = timeRange === '7d'
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : timeRange === '30d'
      ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      : new Date(0)

    let query = supabase
      .from('api_usage')
      .select('service, tokens_used, cost_usd, created_at, user_id, request_data')
      .order('created_at', { ascending: false })

    if (timeRange !== 'all') {
      query = query.gte('created_at', dateThreshold.toISOString())
    }

    const { data: apiUsage, error } = await query.limit(500)
    if (error) throw error

    // Fetch users for email lookup
    const userIds = [...new Set(apiUsage?.map(u => u.user_id) || [])]
    const { data: usersData } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds)

    const userEmailMap = new Map(usersData?.map(u => [u.id, u.email]) || [])

    // Support both old and new service naming conventions
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

    // Calculate costs for each service
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

    // Calculate category totals
    const aiTotal = gpt4Cost + dalleCost
    const paymentsTotal = stripeCost + stripeConnectCost
    const infrastructureTotal = r2Cost + vercelCost + pleskCost
    const mediaTotal = unsplashCost

    const totalCost = aiTotal + paymentsTotal + infrastructureTotal + mediaTotal + emailCost

    // Calculate request counts
    const gpt4Requests = apiUsage?.filter(u => isGPTService(u.service)).length || 0
    const dalleRequests = apiUsage?.filter(u => isDALLEService(u.service)).length || 0
    const stripeRequests = apiUsage?.filter(u => isStripeService(u.service) || isStripeConnectService(u.service)).length || 0
    const unsplashRequests = apiUsage?.filter(u => isUnsplashService(u.service)).length || 0
    const r2Requests = apiUsage?.filter(u => isR2Service(u.service)).length || 0

    const uniqueWebsites = new Set(apiUsage?.map(u => (u.request_data as any)?.websiteName || (u.request_data as any)?.businessName).filter(Boolean))

    setCostSummary({
      total_cost: totalCost,
      total_generations: uniqueWebsites.size || 0,
      // AI costs
      gpt4_cost: gpt4Cost,
      dalle_cost: dalleCost,
      ai_total: aiTotal,
      // Payment costs
      stripe_cost: stripeCost,
      stripe_connect_cost: stripeConnectCost,
      payments_total: paymentsTotal,
      // Infrastructure costs
      r2_cost: r2Cost,
      vercel_cost: vercelCost,
      plesk_cost: pleskCost,
      infrastructure_total: infrastructureTotal,
      // Media costs
      unsplash_cost: unsplashCost,
      media_total: mediaTotal,
      // Email
      email_cost: emailCost,
      // Metrics
      avg_cost_per_generation: uniqueWebsites.size > 0 ? totalCost / uniqueWebsites.size : 0,
      // Request counts
      request_counts: {
        gpt4: gpt4Requests,
        dalle: dalleRequests,
        stripe: stripeRequests,
        unsplash: unsplashRequests,
        r2: r2Requests,
      },
    })

    const generationDetails: GenerationDetail[] = apiUsage?.slice(0, 50).map(u => ({
      id: u.user_id,
      user_email: userEmailMap.get(u.user_id) || 'Unknown',
      website_name: (u.request_data as any)?.websiteName || (u.request_data as any)?.businessName || 'N/A',
      service: u.service,
      tokens_used: u.tokens_used || 0,
      cost_usd: parseFloat(u.cost_usd?.toString() || '0'),
      created_at: u.created_at,
    })) || []

    setRecentGenerations(generationDetails)
  }

  async function loadUserData() {
    try {
      // Try to get all columns (might not exist in older schemas)
      let { data: usersData, error } = await supabase
        .from('users')
        .select('id, email, name, plan, role, ai_generations_used, ai_generations_limit, created_at')
        .order('created_at', { ascending: false })

      // If any column doesn't exist (error 42703), try progressively simpler queries
      if (error?.code === '42703') {
        // Try without ai_generations columns
        const { data: usersDataNoGen, error: errorNoGen } = await supabase
          .from('users')
          .select('id, email, name, plan, role, created_at')
          .order('created_at', { ascending: false })

        if (errorNoGen?.code === '42703') {
          // Try with just basic columns
          const { data: usersDataBasic, error: errorBasic } = await supabase
            .from('users')
            .select('id, email, name, created_at')
            .order('created_at', { ascending: false })

          if (errorBasic) {
            console.error('Error loading basic user data:', errorBasic)
            throw errorBasic
          }

          usersData = usersDataBasic as any
        } else if (errorNoGen) {
          throw errorNoGen
        } else {
          usersData = usersDataNoGen as any
        }
        error = null
      }

      if (error) throw error

      const userDetails: UserDetail[] = usersData?.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name || null,
        plan: (u as any).plan || 'FREE',
        role: (u as any).role || 'user',
        ai_generations_used: (u as any).ai_generations_used || 0,
        ai_generations_limit: (u as any).ai_generations_limit || 10,
        created_at: u.created_at,
        last_sign_in_at: null,
      })) || []

      setUsers(userDetails)
    } catch (error) {
      console.error('Error loading user data:', error)
      throw error
    }
  }

  async function loadWebsiteData() {
    const { data: websitesData, error } = await supabase
      .from('websites')
      .select('id, name, slug, user_id, published, created_at, published_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    if (!websitesData || websitesData.length === 0) {
      setWebsites([])
      return
    }

    const userIds = [...new Set(websitesData.map(w => w.user_id))]
    const { data: usersData } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds)

    const userEmailMap = new Map(usersData?.map(u => [u.id, u.email]) || [])

    const websiteIds = websitesData.map(w => w.id)
    const { data: pagesData } = await supabase
      .from('pages')
      .select('website_id')
      .in('website_id', websiteIds)

    const pageCountMap = new Map<string, number>()
    pagesData?.forEach(p => {
      pageCountMap.set(p.website_id, (pageCountMap.get(p.website_id) || 0) + 1)
    })

    const websiteDetails: WebsiteDetail[] = websitesData.map(w => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      user_email: userEmailMap.get(w.user_id) || 'Unknown',
      published: w.published,
      pages_count: pageCountMap.get(w.id) || 0,
      created_at: w.created_at,
      published_at: w.published_at,
    }))

    setWebsites(websiteDetails)
  }

  async function loadSystemStats() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

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
    const { count: expiredDrafts } = await supabase
      .from('websites')
      .select('*', { count: 'exact', head: true })
      .eq('published', false)
      .lt('created_at', sevenDaysAgo.toISOString())

    setSystemStats({
      total_websites: totalWebsites || 0,
      published_websites: publishedWebsites || 0,
      total_pages: totalPages || 0,
      total_sections: totalSections || 0,
      total_stores: totalStores || 0,
      total_products: totalProducts || 0,
      draft_websites: draftWebsites,
      expired_drafts: expiredDrafts || 0,
      new_users_this_week: newUsersThisWeek || 0,
      new_users_this_month: newUsersThisMonth || 0,
      new_websites_this_week: newWebsitesThisWeek || 0,
      new_websites_this_month: newWebsitesThisMonth || 0,
      total_api_requests: totalApiRequests || 0,
    })
  }

  async function loadUserDrillDown(userId: string) {
    setLoadingDrillDown(true)
    try {
      // Get user details
      const user = users.find(u => u.id === userId)
      if (!user) return

      // Get user's websites
      const { data: userWebsites } = await supabase
        .from('websites')
        .select('id, name, slug, published, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Get pages count for each website
      const websiteIds = userWebsites?.map(w => w.id) || []
      const { data: pagesData } = await supabase
        .from('pages')
        .select('website_id')
        .in('website_id', websiteIds)

      const pageCountMap = new Map<string, number>()
      pagesData?.forEach(p => {
        pageCountMap.set(p.website_id, (pageCountMap.get(p.website_id) || 0) + 1)
      })

      // Get user's API usage
      const { data: apiUsage } = await supabase
        .from('api_usage')
        .select('service, cost_usd, created_at, request_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      const totalCost = apiUsage?.reduce((sum, u) => sum + parseFloat(u.cost_usd.toString()), 0) || 0

      setSelectedUser({
        user,
        websites: userWebsites?.map(w => ({
          ...w,
          pages_count: pageCountMap.get(w.id) || 0,
        })) || [],
        api_usage: apiUsage?.map(u => ({
          service: u.service,
          cost_usd: parseFloat(u.cost_usd.toString()),
          created_at: u.created_at,
          website_name: (u.request_data as any)?.websiteName || (u.request_data as any)?.businessName || 'N/A',
        })) || [],
        total_cost: totalCost,
      })
    } catch (error) {
      console.error('Error loading user details:', error)
      toast.error('Failed to load user details')
    } finally {
      setLoadingDrillDown(false)
    }
  }

  async function loadWebsiteDrillDown(websiteId: string, userId: string) {
    setLoadingDrillDown(true)
    try {
      // Get website details
      const { data: websiteData } = await supabase
        .from('websites')
        .select('id, name, slug, user_id, published, created_at, published_at')
        .eq('id', websiteId)
        .single()

      if (!websiteData) return

      // Get user email
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single()

      // Get website pages with section counts
      const { data: pagesData } = await supabase
        .from('pages')
        .select('id, title, path, is_homepage')
        .eq('website_id', websiteId)
        .order('is_homepage', { ascending: false })

      // Get section counts for each page
      const pageIds = pagesData?.map(p => p.id) || []
      const { data: sectionsData } = await supabase
        .from('sections')
        .select('page_id')
        .in('page_id', pageIds)

      const sectionCountMap = new Map<string, number>()
      sectionsData?.forEach(s => {
        sectionCountMap.set(s.page_id, (sectionCountMap.get(s.page_id) || 0) + 1)
      })

      // Get API costs for this website
      const { data: apiCosts } = await supabase
        .from('api_usage')
        .select('service, cost_usd, created_at, request_data')
        .eq('user_id', userId)

      // Filter costs related to this website
      const websiteCosts = apiCosts?.filter(c => {
        const websiteName = (c.request_data as any)?.websiteName || (c.request_data as any)?.businessName
        return websiteName === websiteData.name
      }) || []

      const totalCost = websiteCosts.reduce((sum, c) => sum + parseFloat(c.cost_usd.toString()), 0)

      setSelectedWebsite({
        website: {
          ...websiteData,
          user_email: userData?.email || 'Unknown',
          pages_count: pagesData?.length || 0,
        },
        pages: pagesData?.map(p => ({
          ...p,
          sections_count: sectionCountMap.get(p.id) || 0,
        })) || [],
        api_costs: websiteCosts.map(c => ({
          service: c.service,
          cost_usd: parseFloat(c.cost_usd.toString()),
          created_at: c.created_at,
        })),
        total_cost: totalCost,
      })
    } catch (error) {
      console.error('Error loading website details:', error)
      toast.error('Failed to load website details')
    } finally {
      setLoadingDrillDown(false)
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('Are you sure you want to delete this user? This will delete all their websites, pages, and data. This action cannot be undone.')) {
      return
    }

    setDeletingUserId(userId)
    try {
      const { error: websitesError } = await supabase
        .from('websites')
        .delete()
        .eq('user_id', userId)

      if (websitesError) throw websitesError

      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (userError) throw userError

      toast.success('User deleted successfully')
      await loadUserData()
      await loadWebsiteData()
      await loadSystemStats()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(error.message || 'Failed to delete user')
    } finally {
      setDeletingUserId(null)
    }
  }

  async function runCleanupDrafts() {
    if (!confirm('Run cleanup to delete all unpublished websites older than 7 days?')) {
      return
    }

    try {
      const { data, error } = await supabase.rpc('delete_expired_draft_websites')

      if (error) throw error

      const deletedCount = data?.[0]?.deleted_count || 0
      toast.success(`Cleanup complete! Deleted ${deletedCount} expired draft(s)`)
      await loadWebsiteData()
      await loadSystemStats()
    } catch (error: any) {
      console.error('Error running cleanup:', error)
      toast.error(error.message || 'Failed to run cleanup')
    }
  }

  // User edit functions
  async function openUserEdit(user: UserDetail) {
    setEditingUser(user)
    setEditUserForm({
      plan: user.plan,
      role: user.role,
      ai_generations_limit: user.ai_generations_limit,
    })
  }

  async function saveUserChanges() {
    if (!editingUser) return

    setSavingUser(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          updates: editUserForm,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user')
      }

      toast.success('User updated successfully')
      setEditingUser(null)
      await loadUserData()
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error(error.message || 'Failed to update user')
    } finally {
      setSavingUser(false)
    }
  }

  // Discount code functions
  async function loadDiscountCodes() {
    setLoadingDiscounts(true)
    try {
      const response = await fetch('/api/admin/discount-codes')
      const data = await response.json()

      if (!response.ok) {
        // Table might not exist yet
        if (data.error?.includes('does not exist')) {
          setDiscountCodes([])
          return
        }
        throw new Error(data.error || 'Failed to load discount codes')
      }

      setDiscountCodes(data.data || [])
    } catch (error: any) {
      console.error('Error loading discount codes:', error)
      setDiscountCodes([])
    } finally {
      setLoadingDiscounts(false)
    }
  }

  function openDiscountModal(discount?: DiscountCode) {
    if (discount) {
      setEditingDiscount(discount)
      setDiscountForm({
        code: discount.code,
        description: discount.description || '',
        discount_type: discount.discount_type,
        discount_value: discount.discount_value,
        applies_to: discount.applies_to,
        usage_limit: discount.usage_limit,
        per_user_limit: discount.per_user_limit,
        minimum_purchase_amount: discount.minimum_purchase_amount,
        first_time_users_only: discount.first_time_users_only,
        starts_at: discount.starts_at ? discount.starts_at.split('T')[0] : '',
        ends_at: discount.ends_at ? discount.ends_at.split('T')[0] : '',
        active: discount.active,
      })
    } else {
      setEditingDiscount(null)
      setDiscountForm({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 10,
        applies_to: 'subscription',
        usage_limit: null,
        per_user_limit: 1,
        minimum_purchase_amount: null,
        first_time_users_only: false,
        starts_at: '',
        ends_at: '',
        active: true,
      })
    }
    setShowDiscountModal(true)
  }

  async function saveDiscountCode() {
    setSavingDiscount(true)
    try {
      const url = '/api/admin/discount-codes'
      const method = editingDiscount ? 'PATCH' : 'POST'
      const body = editingDiscount
        ? { id: editingDiscount.id, ...discountForm }
        : discountForm

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save discount code')
      }

      toast.success(editingDiscount ? 'Discount code updated' : 'Discount code created')
      setShowDiscountModal(false)
      await loadDiscountCodes()
    } catch (error: any) {
      console.error('Error saving discount code:', error)
      toast.error(error.message || 'Failed to save discount code')
    } finally {
      setSavingDiscount(false)
    }
  }

  async function toggleDiscountActive(discount: DiscountCode) {
    try {
      const response = await fetch('/api/admin/discount-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: discount.id,
          active: !discount.active,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update discount code')
      }

      toast.success(`Discount code ${discount.active ? 'deactivated' : 'activated'}`)
      await loadDiscountCodes()
    } catch (error: any) {
      console.error('Error toggling discount:', error)
      toast.error(error.message || 'Failed to toggle discount code')
    }
  }

  async function deleteDiscountCode(id: string) {
    if (!confirm('Are you sure you want to delete this discount code?')) return

    try {
      const response = await fetch(`/api/admin/discount-codes?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete discount code')
      }

      toast.success('Discount code deleted')
      await loadDiscountCodes()
    } catch (error: any) {
      console.error('Error deleting discount:', error)
      toast.error(error.message || 'Failed to delete discount code')
    }
  }

  function copyDiscountCode(code: string) {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard')
  }

  // Orders functions
  async function loadOrders() {
    setLoadingOrders(true)
    try {
      let url = '/api/admin/orders?limit=100'
      if (orderSearchQuery) {
        url += `&search=${encodeURIComponent(orderSearchQuery)}`
      }
      if (orderStatusFilter) {
        url += `&payment_status=${orderStatusFilter}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        // Table might not exist yet
        if (data.error?.includes('does not exist')) {
          setOrders([])
          setOrderStats(null)
          return
        }
        throw new Error(data.error || 'Failed to load orders')
      }

      setOrders(data.data?.orders || [])
      setOrderStats(data.data?.stats || null)
    } catch (error: any) {
      console.error('Error loading orders:', error)
      setOrders([])
      setOrderStats(null)
    } finally {
      setLoadingOrders(false)
    }
  }

  async function updateOrderStatus(orderId: string, updates: { payment_status?: string; fulfillment_status?: string; tracking_number?: string }) {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      toast.success('Order updated successfully')
      await loadOrders()
    } catch (error: any) {
      console.error('Error updating order:', error)
      toast.error(error.message || 'Failed to update order')
    }
  }

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(userSearchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.ai_generations_used > 0).length
  const paidUsers = users.filter(u => u.plan !== 'FREE').length

  // Calculate users by tier
  const usersByTier = {
    FREE: users.filter(u => !u.plan || u.plan === 'FREE').length,
    BASIC: users.filter(u => u.plan === 'BASIC').length,
    PROFESSIONAL: users.filter(u => u.plan === 'PROFESSIONAL').length,
    AGENCY: users.filter(u => u.plan === 'AGENCY').length,
  }

  // Tier configuration for display
  const tierConfig = [
    { key: 'FREE', name: 'Free', color: 'gray', price: '$0' },
    { key: 'BASIC', name: 'Basic', color: 'blue', price: '$16.99/mo' },
    { key: 'PROFESSIONAL', name: 'Professional', color: 'cyan', price: '$26.99/mo' },
    { key: 'AGENCY', name: 'Agency', color: 'orange', price: '$47.49/mo' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">System overview and analytics</p>
        </div>

        {/* OpenAI Balance Alert */}
        {openaiBalance && (openaiBalance.status === 'low' || openaiBalance.status === 'warning' || openaiBalance.status === 'error' || openaiBalance.status === 'not_configured' || openaiBalance.status === 'invalid_key') && (
          <div className={`mb-6 rounded-xl border p-4 ${
            openaiBalance.status === 'low'
              ? 'bg-red-500/10 border-red-500/30 animate-pulse'
              : openaiBalance.status === 'warning'
              ? 'bg-yellow-500/10 border-yellow-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                openaiBalance.status === 'low' ? 'text-red-400' :
                openaiBalance.status === 'warning' ? 'text-yellow-400' :
                'text-red-400'
              }`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold ${
                    openaiBalance.status === 'low' ? 'text-red-300' :
                    openaiBalance.status === 'warning' ? 'text-yellow-300' :
                    'text-red-300'
                  }`}>
                    {openaiBalance.status === 'not_configured' && '⚠️ OpenAI API Key Not Configured'}
                    {openaiBalance.status === 'invalid_key' && '🚨 Invalid OpenAI API Key'}
                    {openaiBalance.status === 'low' && '🚨 CRITICAL: OpenAI Balance Very Low'}
                    {openaiBalance.status === 'warning' && '⚠️ OpenAI Balance Running Low'}
                    {openaiBalance.status === 'error' && '❌ Error Checking OpenAI Balance'}
                  </h3>
                  <button
                    onClick={checkOpenAIBalance}
                    disabled={loadingBalance}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    {loadingBalance ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </>
                    )}
                  </button>
                </div>

                {openaiBalance.status === 'not_configured' && (
                  <p className="text-sm text-gray-300">
                    The OPENAI_API_KEY environment variable is not set. Website generation will fail.
                    <br />
                    <span className="text-gray-400 mt-1 block">Add the API key in your Vercel dashboard → Settings → Environment Variables</span>
                  </p>
                )}

                {openaiBalance.status === 'invalid_key' && (
                  <p className="text-sm text-gray-300">
                    The OpenAI API key is invalid or has been revoked. Please update it immediately.
                    <br />
                    <span className="text-gray-400 mt-1 block">Get a new key from platform.openai.com/api-keys</span>
                  </p>
                )}

                {openaiBalance.status === 'low' && openaiBalance.balance !== null && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">
                      Current balance: <span className="font-bold text-red-300">${openaiBalance.balance.toFixed(2)}</span>
                      {openaiBalance.hardLimit && (
                        <> / ${openaiBalance.hardLimit.toFixed(2)} limit</>
                      )}
                    </p>
                    {openaiBalance.monthlyUsage !== undefined && (
                      <p className="text-sm text-gray-400">
                        This month's usage: ${openaiBalance.monthlyUsage.toFixed(2)}
                      </p>
                    )}
                    <p className="text-sm text-yellow-300 font-medium">
                      ⚠️ Add credits immediately to prevent service disruption!
                    </p>
                  </div>
                )}

                {openaiBalance.status === 'warning' && openaiBalance.balance !== null && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">
                      Current balance: <span className="font-bold text-yellow-300">${openaiBalance.balance.toFixed(2)}</span>
                      {openaiBalance.hardLimit && (
                        <> / ${openaiBalance.hardLimit.toFixed(2)} limit</>
                      )}
                    </p>
                    {openaiBalance.monthlyUsage !== undefined && (
                      <p className="text-sm text-gray-400">
                        This month's usage: ${openaiBalance.monthlyUsage.toFixed(2)}
                      </p>
                    )}
                    <p className="text-sm text-gray-400">
                      Consider adding more credits soon.
                    </p>
                  </div>
                )}

                {openaiBalance.error && (
                  <p className="text-sm text-gray-300">{openaiBalance.error}</p>
                )}

                {openaiBalance.lastChecked && (
                  <p className="text-xs text-gray-500 mt-2">
                    Last checked: {new Date(openaiBalance.lastChecked).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Hero Section - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Users Card */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-2xl p-6 border border-cyan-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-gray-300 text-sm font-medium uppercase tracking-wider">Total Users</h3>
              </div>
              <p className="text-5xl font-bold text-white mb-2">{totalUsers}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  <span className="text-gray-400">{activeUsers} active</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span className="text-gray-400">{paidUsers} paid</span>
                </span>
              </div>
            </div>
          </div>

          {/* Websites Card */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl p-6 border border-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-gray-300 text-sm font-medium uppercase tracking-wider">Websites</h3>
              </div>
              <p className="text-5xl font-bold text-white mb-2">{systemStats?.total_websites || 0}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  <span className="text-gray-400">{systemStats?.published_websites || 0} published</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <span className="text-gray-400">{systemStats?.draft_websites || 0} drafts</span>
                </span>
              </div>
            </div>
          </div>

          {/* API Costs Card */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl p-6 border border-green-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-gray-300 text-sm font-medium uppercase tracking-wider">Total API Costs</h3>
                </div>
                <button
                  onClick={() => setActiveTab('costs')}
                  className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors"
                >
                  View Details
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-5xl font-bold text-white mb-3">${costSummary?.total_cost?.toFixed(2) || '0.00'}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span className="text-gray-400">AI ${costSummary?.ai_total?.toFixed(2) || '0.00'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span className="text-gray-400">Payments ${costSummary?.payments_total?.toFixed(2) || '0.00'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                  <span className="text-gray-400">Infra ${costSummary?.infrastructure_total?.toFixed(2) || '0.00'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  <span className="text-gray-400">Media ${costSummary?.media_total?.toFixed(2) || '0.00'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-800 overflow-x-auto">
          <nav className="flex space-x-2 sm:space-x-4 min-w-max">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'discounts', label: 'Discounts', icon: Tag },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'costs', label: 'Costs', icon: DollarSign },
              { id: 'websites', label: 'Websites', icon: Globe },
              { id: 'system', label: 'System', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Growth Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <h3 className="text-gray-400 text-sm font-medium">New Users</h3>
                </div>
                <p className="text-2xl font-bold text-white">{systemStats?.new_users_this_week || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  This week ({systemStats?.new_users_this_month || 0} this month)
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <h3 className="text-gray-400 text-sm font-medium">New Websites</h3>
                </div>
                <p className="text-2xl font-bold text-white">{systemStats?.new_websites_this_week || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  This week ({systemStats?.new_websites_this_month || 0} this month)
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Total Generations</h3>
                </div>
                <p className="text-2xl font-bold text-white">{costSummary?.total_generations || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {systemStats?.total_api_requests || 0} API requests total
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Conversion Rate</h3>
                </div>
                <p className="text-2xl font-bold text-white">
                  {totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : '0'}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {paidUsers} of {totalUsers} users paid
                </p>
              </div>
            </div>

            {/* Secondary Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Active Rate</h3>
                </div>
                <p className="text-2xl font-bold text-white">
                  {totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0'}%
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Total Pages</h3>
                </div>
                <p className="text-2xl font-bold text-white">{systemStats?.total_pages || 0}</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <HardDrive className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Total Sections</h3>
                </div>
                <p className="text-2xl font-bold text-white">{systemStats?.total_sections || 0}</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Avg Cost/Gen</h3>
                </div>
                <p className="text-2xl font-bold text-white">
                  ${costSummary?.avg_cost_per_generation.toFixed(3) || '0.00'}
                </p>
              </div>
            </div>

            {/* Time Range Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === '7d'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === '30d'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setTimeRange('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All Time
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Cost Breakdown</h3>
                  <button
                    onClick={() => setActiveTab('costs')}
                    className="text-xs text-primary-400 hover:text-primary-300"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      AI Generation
                    </span>
                    <span className="text-white font-medium">${costSummary?.ai_total?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      Payments
                    </span>
                    <span className="text-white font-medium">${costSummary?.payments_total?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                      Infrastructure
                    </span>
                    <span className="text-white font-medium">${costSummary?.infrastructure_total?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                      Media & Email
                    </span>
                    <span className="text-white font-medium">${((costSummary?.media_total || 0) + (costSummary?.email_cost || 0)).toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-gray-400">Avg per Generation</span>
                    <span className="text-primary-400 font-medium">
                      ${costSummary?.avg_cost_per_generation?.toFixed(3) || '0.000'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">User Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Active Users</span>
                    <span className="text-white font-medium">{activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Paid Users</span>
                    <span className="text-white font-medium">{paidUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">New This Week</span>
                    <span className="text-white font-medium">{systemStats?.new_users_this_week || 0}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-gray-400">Conversion Rate</span>
                    <span className="text-primary-400 font-medium">
                      {totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : '0'}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Users by Tier */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Users by Tier</h3>
                <div className="space-y-3">
                  {tierConfig.map((tier) => {
                    const count = usersByTier[tier.key as keyof typeof usersByTier]
                    const percentage = totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : '0'
                    return (
                      <div key={tier.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            tier.color === 'gray' ? 'bg-gray-400' :
                            tier.color === 'blue' ? 'bg-blue-400' :
                            tier.color === 'purple' ? 'bg-cyan-400' :
                            'bg-orange-400'
                          }`}></span>
                          <span className="text-gray-400">{tier.name}</span>
                          <span className="text-xs text-gray-600">{tier.price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{count}</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                  <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-gray-400">Monthly Revenue</span>
                    <span className="text-green-400 font-medium">
                      ${((usersByTier.BASIC * 16.99) + (usersByTier.PROFESSIONAL * 26.99) + (usersByTier.AGENCY * 47.49)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
                </div>
                <p className="text-3xl font-bold text-white">{totalUsers}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Active Users</h3>
                </div>
                <p className="text-3xl font-bold text-white">{activeUsers}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Paid Users</h3>
                </div>
                <p className="text-3xl font-bold text-white">{paidUsers}</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by email or name..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
              </div>
              <button
                onClick={loadUserData}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">All Users</h2>
                <p className="text-sm text-gray-400 mt-1">Click edit to modify user plan, role, or generation limits</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Email</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Plan</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Role</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Generations</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Joined</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-sm font-medium text-white">{user.email}</div>
                              {user.name && (
                                <div className="text-xs text-gray-500">{user.name}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.plan === 'FREE'
                              ? 'bg-gray-700 text-gray-300'
                              : user.plan === 'PROFESSIONAL'
                              ? 'bg-blue-500/10 text-blue-400'
                              : user.plan === 'AGENCY'
                              ? 'bg-orange-500/10 text-orange-400'
                              : 'bg-cyan-500/10 text-cyan-400'
                          }`}>
                            {user.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-orange-500/10 text-orange-400'
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-300">
                          {user.ai_generations_used} / {user.ai_generations_limit}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => loadUserDrillDown(user.id)}
                              className="p-1.5 text-gray-400 hover:text-white transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openUserEdit(user)}
                              className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit user"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              disabled={deletingUserId === user.id || user.role === 'admin'}
                              className="p-1.5 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title={user.role === 'admin' ? 'Cannot delete admin users' : 'Delete user'}
                            >
                              {deletingUserId === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Costs Tab */}
        {activeTab === 'costs' && (
          <div className="space-y-6">
            {/* Time Range Filter */}
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === '7d'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === '30d'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => setTimeRange('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  All Time
                </button>
              </div>
              <a
                href="https://platform.openai.com/usage"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                View OpenAI Usage Dashboard
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Total Cost Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-900/50 to-gray-900 rounded-xl p-6 border border-green-800/50">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Total Cost</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  ${costSummary?.total_cost.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  <h3 className="text-gray-400 text-sm font-medium">AI Generation</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  ${costSummary?.ai_total?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  GPT-4 + DALL-E
                </p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Payments</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  ${costSummary?.payments_total?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Stripe fees
                </p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Avg/Generation</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  ${costSummary?.avg_cost_per_generation?.toFixed(3) || '0.000'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {costSummary?.total_generations || 0} generations
                </p>
              </div>
            </div>

            {/* Detailed Cost Breakdown by Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Generation Costs */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">AI Generation</h3>
                    <p className="text-sm text-gray-400">OpenAI GPT-4 & DALL-E</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold text-white">${costSummary?.ai_total?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <div>
                        <span className="text-sm text-white">GPT-4 Turbo</span>
                        <p className="text-xs text-gray-500">{costSummary?.request_counts?.gpt4 || 0} requests</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-blue-400">${costSummary?.gpt4_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-4 h-4 text-cyan-400" />
                      <div>
                        <span className="text-sm text-white">DALL-E 3</span>
                        <p className="text-xs text-gray-500">{costSummary?.request_counts?.dalle || 0} images</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-cyan-400">${costSummary?.dalle_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Payment Processing Costs */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Payment Processing</h3>
                    <p className="text-sm text-gray-400">Stripe transaction fees</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold text-white">${costSummary?.payments_total?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      <div>
                        <span className="text-sm text-white">Stripe Payments</span>
                        <p className="text-xs text-gray-500">{costSummary?.request_counts?.stripe || 0} transactions</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-indigo-400">${costSummary?.stripe_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-violet-400" />
                      <div>
                        <span className="text-sm text-white">Stripe Connect</span>
                        <p className="text-xs text-gray-500">Platform fees</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-violet-400">${costSummary?.stripe_connect_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Infrastructure Costs */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <HardDrive className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Infrastructure</h3>
                    <p className="text-sm text-gray-400">Storage, hosting & domains</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold text-white">${costSummary?.infrastructure_total?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="w-4 h-4 text-orange-400" />
                      <div>
                        <span className="text-sm text-white">Cloudflare R2</span>
                        <p className="text-xs text-gray-500">{costSummary?.request_counts?.r2 || 0} operations</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-orange-400">${costSummary?.r2_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-yellow-400" />
                      <div>
                        <span className="text-sm text-white">Vercel Hosting</span>
                        <p className="text-xs text-gray-500">Serverless functions</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-yellow-400">${costSummary?.vercel_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="text-sm text-white">Plesk/Domains</span>
                        <p className="text-xs text-gray-500">Domain management</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-amber-400">${costSummary?.plesk_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Media & Communications */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal-500/10 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Media & Communications</h3>
                    <p className="text-sm text-gray-400">Images & email services</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold text-white">${((costSummary?.media_total || 0) + (costSummary?.email_cost || 0)).toFixed(2)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-4 h-4 text-teal-400" />
                      <div>
                        <span className="text-sm text-white">Unsplash Images</span>
                        <p className="text-xs text-gray-500">{costSummary?.request_counts?.unsplash || 0} images (free tier)</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-teal-400">${costSummary?.unsplash_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="text-sm text-white">Email Service</span>
                        <p className="text-xs text-gray-500">Transactional emails</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-emerald-400">${costSummary?.email_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost by User */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Users by Cost</h3>
              <div className="space-y-3">
                {users
                  .slice(0, 10)
                  .map(user => {
                    const userCosts = recentGenerations
                      .filter(g => g.user_email === user.email)
                      .reduce((sum, g) => sum + g.cost_usd, 0)
                    return { user, cost: userCosts }
                  })
                  .filter(item => item.cost > 0)
                  .sort((a, b) => b.cost - a.cost)
                  .slice(0, 5)
                  .map(({ user, cost }) => (
                    <div
                      key={user.id}
                      className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                      onClick={() => loadUserDrillDown(user.id)}
                    >
                      <div>
                        <div className="text-sm font-medium text-white">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.plan} plan</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-green-400">${cost.toFixed(2)}</span>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* API Usage Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">API Usage Details</h2>
                <p className="text-sm text-gray-400 mt-1">Detailed breakdown of all API calls</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">User</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Website</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Service</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Tokens</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Cost</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {recentGenerations.length > 0 ? (
                      recentGenerations.map((gen, index) => (
                        <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-300">{gen.user_email}</td>
                          <td className="px-6 py-4 text-sm text-white font-medium">{gen.website_name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              gen.service === 'openai'
                                ? 'bg-blue-500/10 text-blue-400'
                                : 'bg-cyan-500/10 text-cyan-400'
                            }`}>
                              {gen.service === 'openai' ? 'GPT-4' : 'DALL-E'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-gray-300">
                            {gen.tokens_used.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-medium text-green-400">
                            ${gen.cost_usd.toFixed(4)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(gen.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No API usage data for selected time range
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Websites Tab */}
        {activeTab === 'websites' && (
          <div className="space-y-6">
            {/* Website Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Total</h3>
                </div>
                <p className="text-3xl font-bold text-white">{systemStats?.total_websites || 0}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Published</h3>
                </div>
                <p className="text-3xl font-bold text-white">{systemStats?.published_websites || 0}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Drafts</h3>
                </div>
                <p className="text-3xl font-bold text-white">{systemStats?.draft_websites || 0}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Expired</h3>
                </div>
                <p className="text-3xl font-bold text-white">{systemStats?.expired_drafts || 0}</p>
              </div>
            </div>

            {/* Websites Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">All Websites</h2>
                <p className="text-sm text-gray-400 mt-1">Click on a website to view detailed information</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Name</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Owner</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Pages</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Created</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Published</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {websites.map((website) => {
                      // Find user_id from websites data
                      const userEmail = website.user_email
                      const websiteOwner = users.find(u => u.email === userEmail)

                      return (
                        <tr
                          key={website.id}
                          className="hover:bg-gray-800/30 transition-colors cursor-pointer"
                          onClick={() => websiteOwner && loadWebsiteDrillDown(website.id, websiteOwner.id)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="text-sm font-medium text-white">{website.name}</div>
                                <div className="text-xs text-gray-500">/{website.slug}</div>
                              </div>
                              <Eye className="w-4 h-4 text-gray-500" />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">{website.user_email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              website.published
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {website.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-300">
                            {website.pages_count}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(website.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {website.published_at ? new Date(website.published_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Discounts Tab */}
        {activeTab === 'discounts' && (
          <div className="space-y-6">
            {/* Discount Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Tag className="w-5 h-5 text-green-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Active Codes</h3>
                </div>
                <p className="text-3xl font-bold text-white">{discountCodes.filter(d => d.active).length}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Percent className="w-5 h-5 text-blue-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Total Codes</h3>
                </div>
                <p className="text-3xl font-bold text-white">{discountCodes.length}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Total Uses</h3>
                </div>
                <p className="text-3xl font-bold text-white">{discountCodes.reduce((sum, d) => sum + d.usage_count, 0)}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Expired</h3>
                </div>
                <p className="text-3xl font-bold text-white">{discountCodes.filter(d => d.ends_at && new Date(d.ends_at) < new Date()).length}</p>
              </div>
            </div>

            {/* Create Button */}
            <div className="flex justify-end">
              <button
                onClick={() => openDiscountModal()}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Discount Code
              </button>
            </div>

            {/* Discount Codes Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Discount Codes</h2>
                <p className="text-sm text-gray-400 mt-1">Manage platform-wide discount codes and vouchers</p>
              </div>

              {loadingDiscounts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : discountCodes.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No discount codes yet</p>
                  <p className="text-sm text-gray-500 mt-1">Create your first discount code to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Code</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Type</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Value</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Applies To</th>
                        <th className="text-center px-6 py-3 text-xs font-medium text-gray-400 uppercase">Usage</th>
                        <th className="text-center px-6 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {discountCodes.map((discount) => {
                        const isExpired = discount.ends_at && new Date(discount.ends_at) < new Date()
                        const isNotStarted = discount.starts_at && new Date(discount.starts_at) > new Date()
                        return (
                          <tr key={discount.id} className="hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-mono font-medium text-white bg-gray-800 px-2 py-1 rounded">
                                  {discount.code}
                                </code>
                                <button
                                  onClick={() => copyDiscountCode(discount.code)}
                                  className="p-1 text-gray-400 hover:text-white transition-colors"
                                  title="Copy code"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                              {discount.description && (
                                <p className="text-xs text-gray-500 mt-1">{discount.description}</p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                discount.discount_type === 'percentage'
                                  ? 'bg-green-500/10 text-green-400'
                                  : discount.discount_type === 'fixed_amount'
                                  ? 'bg-blue-500/10 text-blue-400'
                                  : 'bg-purple-500/10 text-purple-400'
                              }`}>
                                {discount.discount_type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-white">
                              {discount.discount_type === 'percentage'
                                ? `${discount.discount_value}%`
                                : discount.discount_type === 'fixed_amount'
                                ? `$${discount.discount_value}`
                                : `${discount.discount_value} days`}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                discount.applies_to === 'subscription'
                                  ? 'bg-cyan-500/10 text-cyan-400'
                                  : discount.applies_to === 'ecommerce'
                                  ? 'bg-orange-500/10 text-orange-400'
                                  : 'bg-gray-700 text-gray-300'
                              }`}>
                                {discount.applies_to}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-gray-300">
                              {discount.usage_count} / {discount.usage_limit || '∞'}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {isExpired ? (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                                  Expired
                                </span>
                              ) : isNotStarted ? (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">
                                  Scheduled
                                </span>
                              ) : discount.active ? (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => toggleDiscountActive(discount)}
                                  className={`p-1.5 transition-colors ${
                                    discount.active
                                      ? 'text-green-400 hover:text-green-300'
                                      : 'text-gray-400 hover:text-gray-300'
                                  }`}
                                  title={discount.active ? 'Deactivate' : 'Activate'}
                                >
                                  {discount.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                </button>
                                <button
                                  onClick={() => openDiscountModal(discount)}
                                  className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteDiscountCode(discount.id)}
                                  className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Order Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Total Orders</h3>
                </div>
                <p className="text-3xl font-bold text-white">{orderStats?.totalOrders || 0}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Pending</h3>
                </div>
                <p className="text-3xl font-bold text-white">{orderStats?.pendingOrders || 0}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Paid</h3>
                </div>
                <p className="text-3xl font-bold text-white">{orderStats?.paidOrders || 0}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-orange-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Unfulfilled</h3>
                </div>
                <p className="text-3xl font-bold text-white">{orderStats?.unfulfilledOrders || 0}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Revenue</h3>
                </div>
                <p className="text-3xl font-bold text-white">${(orderStats?.totalRevenue || 0).toFixed(2)}</p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order #, email, or name..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
              </div>
              <select
                value={orderStatusFilter}
                onChange={(e) => { setOrderStatusFilter(e.target.value); loadOrders() }}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <button
                onClick={loadOrders}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {/* Orders Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Orders</h2>
                <p className="text-sm text-gray-400 mt-1">Manage e-commerce orders across all stores</p>
              </div>

              {loadingOrders ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No orders found</p>
                  <p className="text-sm text-gray-500 mt-1">Orders will appear here when customers make purchases</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Order</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Customer</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Store</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Total</th>
                        <th className="text-center px-6 py-3 text-xs font-medium text-gray-400 uppercase">Payment</th>
                        <th className="text-center px-6 py-3 text-xs font-medium text-gray-400 uppercase">Fulfillment</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Date</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-white">{order.order_number}</div>
                            <div className="text-xs text-gray-500">{order.items?.length || 0} item(s)</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">{order.customer_name || 'Guest'}</div>
                            <div className="text-xs text-gray-500">{order.customer_email}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {order.store?.store_name || 'Unknown Store'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-sm font-medium text-white">${order.total?.toFixed(2)}</div>
                            {order.discount_amount > 0 && (
                              <div className="text-xs text-green-400">-${order.discount_amount.toFixed(2)} discount</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.payment_status === 'paid'
                                ? 'bg-green-500/10 text-green-400'
                                : order.payment_status === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : order.payment_status === 'refunded'
                                ? 'bg-purple-500/10 text-purple-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}>
                              {order.payment_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.fulfillment_status === 'fulfilled'
                                ? 'bg-green-500/10 text-green-400'
                                : order.fulfillment_status === 'partial'
                                ? 'bg-blue-500/10 text-blue-400'
                                : order.fulfillment_status === 'cancelled'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {order.fulfillment_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-1.5 text-gray-400 hover:text-white transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {order.fulfillment_status === 'unfulfilled' && order.payment_status === 'paid' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, { fulfillment_status: 'fulfilled' })}
                                  className="p-1.5 text-green-400 hover:text-green-300 transition-colors"
                                  title="Mark as fulfilled"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            {/* System Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Total Pages</h3>
                </div>
                <p className="text-3xl font-bold text-white">{systemStats?.total_pages || 0}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <HardDrive className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Total Sections</h3>
                </div>
                <p className="text-3xl font-bold text-white">{systemStats?.total_sections || 0}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-5 h-5 text-green-500" />
                  <h3 className="text-gray-400 text-sm font-medium">Total Products</h3>
                </div>
                <p className="text-3xl font-bold text-white">{systemStats?.total_products || 0}</p>
              </div>
            </div>

            {/* Admin Tools */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Admin Tools</h2>

              <div className="space-y-4">
                {/* Cleanup Tool */}
                <div className="flex items-start justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium mb-1">Cleanup Expired Drafts</h3>
                    <p className="text-sm text-gray-400">
                      Delete unpublished websites older than 7 days to free up storage.
                      Currently {systemStats?.expired_drafts || 0} expired draft(s).
                    </p>
                  </div>
                  <button
                    onClick={runCleanupDrafts}
                    className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Run Cleanup
                  </button>
                </div>

                {/* Database Info */}
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="text-white font-medium mb-3">Database Statistics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Websites:</span>
                      <span className="text-white font-medium">{systemStats?.total_websites || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pages:</span>
                      <span className="text-white font-medium">{systemStats?.total_pages || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sections:</span>
                      <span className="text-white font-medium">{systemStats?.total_sections || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stores:</span>
                      <span className="text-white font-medium">{systemStats?.total_stores || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Products:</span>
                      <span className="text-white font-medium">{systemStats?.total_products || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Users:</span>
                      <span className="text-white font-medium">{totalUsers}</span>
                    </div>
                  </div>
                </div>

                {/* System Health */}
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="text-white font-medium mb-3">System Health</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Database Connection</span>
                      <span className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Healthy
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Storage Access</span>
                      <span className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Operational
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">API Services</span>
                      <span className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Drill-Down Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">User Details</h2>
                <p className="text-gray-400 mt-1">{selectedUser.user.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {loadingDrillDown ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Plan</div>
                      <div className="text-lg font-semibold text-white">{selectedUser.user.plan}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Role</div>
                      <div className="text-lg font-semibold text-white">{selectedUser.user.role}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Generations</div>
                      <div className="text-lg font-semibold text-white">
                        {selectedUser.user.ai_generations_used} / {selectedUser.user.ai_generations_limit}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Total Cost</div>
                      <div className="text-lg font-semibold text-green-400">${selectedUser.total_cost.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Websites */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Websites ({selectedUser.websites.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedUser.websites.length > 0 ? (
                        selectedUser.websites.map((website) => (
                          <div key={website.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                            <div>
                              <div className="text-sm font-medium text-white">{website.name}</div>
                              <div className="text-xs text-gray-500">/{website.slug} • {website.pages_count} pages</div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              website.published
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {website.published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No websites created yet</p>
                      )}
                    </div>
                  </div>

                  {/* API Usage History */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Recent API Usage ({selectedUser.api_usage.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedUser.api_usage.length > 0 ? (
                        selectedUser.api_usage.slice(0, 10).map((usage, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                            <div>
                              <div className="text-sm font-medium text-white">{usage.website_name}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(usage.created_at).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                usage.service === 'openai'
                                  ? 'bg-blue-500/10 text-blue-400'
                                  : 'bg-cyan-500/10 text-cyan-400'
                              }`}>
                                {usage.service === 'openai' ? 'GPT-4' : 'DALL-E'}
                              </span>
                              <span className="text-sm font-semibold text-green-400">${usage.cost_usd.toFixed(4)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No API usage recorded</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Website Drill-Down Modal */}
      {selectedWebsite && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Website Details</h2>
                <p className="text-gray-400 mt-1">{selectedWebsite.website.name}</p>
              </div>
              <button
                onClick={() => setSelectedWebsite(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {loadingDrillDown ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Website Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Owner</div>
                      <div className="text-sm font-semibold text-white truncate">{selectedWebsite.website.user_email}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Status</div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        selectedWebsite.website.published
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {selectedWebsite.website.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Pages</div>
                      <div className="text-lg font-semibold text-white">{selectedWebsite.pages.length}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Generation Cost</div>
                      <div className="text-lg font-semibold text-green-400">${selectedWebsite.total_cost.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Pages */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Pages ({selectedWebsite.pages.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedWebsite.pages.length > 0 ? (
                        selectedWebsite.pages.map((page) => (
                          <div key={page.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                            <div>
                              <div className="text-sm font-medium text-white">{page.title}</div>
                              <div className="text-xs text-gray-500">{page.path} • {page.sections_count} sections</div>
                            </div>
                            {page.is_homepage && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                                Homepage
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No pages found</p>
                      )}
                    </div>
                  </div>

                  {/* API Costs */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Generation Costs
                    </h3>
                    <div className="space-y-2">
                      {selectedWebsite.api_costs.length > 0 ? (
                        <>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="text-xs text-gray-400 mb-1">GPT-4 Cost</div>
                              <div className="text-lg font-semibold text-blue-400">
                                ${selectedWebsite.api_costs.filter(c => c.service === 'openai').reduce((sum, c) => sum + c.cost_usd, 0).toFixed(4)}
                              </div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="text-xs text-gray-400 mb-1">DALL-E Cost</div>
                              <div className="text-lg font-semibold text-cyan-400">
                                ${selectedWebsite.api_costs.filter(c => c.service === 'dalle').reduce((sum, c) => sum + c.cost_usd, 0).toFixed(4)}
                              </div>
                            </div>
                          </div>
                          {selectedWebsite.api_costs.slice(0, 5).map((cost, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                              <div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  cost.service === 'openai'
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'bg-cyan-500/10 text-cyan-400'
                                }`}>
                                  {cost.service === 'openai' ? 'GPT-4' : 'DALL-E'}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(cost.created_at).toLocaleString()}
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-green-400">${cost.cost_usd.toFixed(4)}</span>
                            </div>
                          ))}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No cost data available</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-lg w-full border border-gray-800">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Edit User</h2>
                <p className="text-gray-400 text-sm mt-1">{editingUser.email}</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Plan</label>
                <select
                  value={editUserForm.plan}
                  onChange={(e) => setEditUserForm({ ...editUserForm, plan: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="FREE">Free</option>
                  <option value="BASIC">Basic</option>
                  <option value="PROFESSIONAL">Professional</option>
                  <option value="AGENCY">Agency</option>
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Generation Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">AI Generation Limit</label>
                <input
                  type="number"
                  value={editUserForm.ai_generations_limit}
                  onChange={(e) => setEditUserForm({ ...editUserForm, ai_generations_limit: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Current usage: {editingUser.ai_generations_used}</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveUserChanges}
                disabled={savingUser}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {savingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Code Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingDiscount ? 'Edit Discount Code' : 'Create Discount Code'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">Configure your discount code settings</p>
              </div>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Code *</label>
                <input
                  type="text"
                  value={discountForm.code}
                  onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SAVE20"
                  disabled={!!editingDiscount}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 uppercase disabled:opacity-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={discountForm.description}
                  onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
                  placeholder="e.g., 20% off for new users"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Type and Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Discount Type *</label>
                  <select
                    value={discountForm.discount_type}
                    onChange={(e) => setDiscountForm({ ...discountForm, discount_type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount ($)</option>
                    <option value="free_trial_days">Free Trial Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Value *</label>
                  <input
                    type="number"
                    value={discountForm.discount_value}
                    onChange={(e) => setDiscountForm({ ...discountForm, discount_value: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max={discountForm.discount_type === 'percentage' ? 100 : undefined}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Applies To */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Applies To</label>
                <select
                  value={discountForm.applies_to}
                  onChange={(e) => setDiscountForm({ ...discountForm, applies_to: e.target.value as any })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="subscription">Subscriptions Only</option>
                  <option value="ecommerce">E-commerce Only</option>
                  <option value="all">All Purchases</option>
                </select>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Total Usage Limit</label>
                  <input
                    type="number"
                    value={discountForm.usage_limit || ''}
                    onChange={(e) => setDiscountForm({ ...discountForm, usage_limit: e.target.value ? parseInt(e.target.value) : null })}
                    min="0"
                    placeholder="Unlimited"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Per User Limit</label>
                  <input
                    type="number"
                    value={discountForm.per_user_limit}
                    onChange={(e) => setDiscountForm({ ...discountForm, per_user_limit: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Validity Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={discountForm.starts_at}
                    onChange={(e) => setDiscountForm({ ...discountForm, starts_at: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={discountForm.ends_at}
                    onChange={(e) => setDiscountForm({ ...discountForm, ends_at: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Minimum Purchase */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Purchase Amount ($)</label>
                <input
                  type="number"
                  value={discountForm.minimum_purchase_amount || ''}
                  onChange={(e) => setDiscountForm({ ...discountForm, minimum_purchase_amount: e.target.value ? parseFloat(e.target.value) : null })}
                  min="0"
                  step="0.01"
                  placeholder="No minimum"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Options */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discountForm.first_time_users_only}
                    onChange={(e) => setDiscountForm({ ...discountForm, first_time_users_only: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-300">First-time users only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discountForm.active}
                    onChange={(e) => setDiscountForm({ ...discountForm, active: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-300">Active</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveDiscountCode}
                disabled={savingDiscount || !discountForm.code || discountForm.discount_value <= 0}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {savingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingDiscount ? 'Update Code' : 'Create Code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Order {selectedOrder.order_number}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white ml-2">{selectedOrder.customer_name || 'Guest'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white ml-2">{selectedOrder.customer_email}</span>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Order Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Payment Status</label>
                    <select
                      value={selectedOrder.payment_status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, { payment_status: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Fulfillment Status</label>
                    <select
                      value={selectedOrder.fulfillment_status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, { fulfillment_status: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                    >
                      <option value="unfulfilled">Unfulfilled</option>
                      <option value="partial">Partial</option>
                      <option value="fulfilled">Fulfilled</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-white font-medium mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-white">{item.product_name}</div>
                        {item.variant_title && (
                          <div className="text-xs text-gray-500">{item.variant_title}</div>
                        )}
                        <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white">${item.price?.toFixed(2)} each</div>
                        <div className="text-sm font-medium text-green-400">${item.total?.toFixed(2)}</div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500 text-center py-4">No items</p>
                  )}
                </div>
              </div>

              {/* Order Totals */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">${selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Discount</span>
                      <span className="text-green-400">-${selectedOrder.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-white">${selectedOrder.shipping_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tax</span>
                    <span className="text-white">${selectedOrder.tax_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-700 flex justify-between">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-xl font-bold text-green-400">${selectedOrder.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
