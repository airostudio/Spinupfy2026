'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { supabase } from '@/lib/supabase'
import { User, CreditCard, Bell, Shield, Loader2, ExternalLink, DollarSign, TrendingUp, Zap, Globe, ArrowRight } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import toast from 'react-hot-toast'

interface UserData {
  id: string
  email: string
  name?: string
  plan?: string
  websites_created?: number
  ai_generations_used?: number
  ai_generations_limit?: number
  created_at?: string
}

interface CostSummary {
  totalCost: number
  gpt4Cost: number
  dalleCost: number
  currentMonthCost: number
  totalGenerations: number
  avgCostPerGeneration: number
  totalRequests: number
}

interface UsageItem {
  service: string
  cost: number
  tokens: number
  websiteName: string
  endpoint: string
  createdAt: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [openingPortal, setOpeningPortal] = useState(false)
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null)
  const [recentUsage, setRecentUsage] = useState<UsageItem[]>([])
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [loadingCosts, setLoadingCosts] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  useEffect(() => {
    if (user) {
      loadCostsData()
    }
  }, [user, timeRange])

  async function loadUserData() {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login')
        return
      }

      // Try to get additional user data from users table
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: userData?.name,
        plan: userData?.plan || 'FREE',
        websites_created: userData?.websites_created || 0,
        ai_generations_used: userData?.ai_generations_used || 0,
        ai_generations_limit: userData?.ai_generations_limit || 10,
        created_at: authUser.created_at,
      })
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  async function loadCostsData() {
    setLoadingCosts(true)
    try {
      const response = await fetch(`/api/user/costs?range=${timeRange}`)
      const data = await response.json()

      if (data.success) {
        setCostSummary(data.data.summary)
        setRecentUsage(data.data.recentUsage)
      } else {
        console.error('Failed to load costs:', data.error)
      }
    } catch (error) {
      console.error('Error loading costs:', error)
      // Silently fail - costs are optional data
    } finally {
      setLoadingCosts(false)
    }
  }

  async function handleOpenBillingPortal() {
    setOpeningPortal(true)
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success && data.url) {
        // Open Stripe customer portal in a new tab
        window.open(data.url, '_blank')
        toast.success('Billing portal opened in new tab')
      } else {
        toast.error(data.error || 'Failed to open billing portal')
      }
    } catch (error) {
      console.error('Billing portal error:', error)
      toast.error('Failed to open billing portal')
    } finally {
      setOpeningPortal(false)
    }
  }

  function handleUpgradePlan() {
    // Redirect to pricing page to select a plan
    router.push('/pricing')
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-gray-400">Manage your account, billing, and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <Card variant="glass">
            <CardContent>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Account Information</h2>
                  <p className="text-sm text-gray-400">Your account details and usage</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white">
                    {user?.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Current Plan</label>
                  <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400">
                      {user?.plan || 'FREE'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Websites Created</label>
                  <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white">
                    {user?.websites_created || 0}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">AI Generations Used</label>
                  <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white">
                    {user?.ai_generations_used || 0} / {user?.ai_generations_limit || 10}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Member Since</label>
                  <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white">
                    {formatDate(user?.created_at)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage & Costs */}
          <Card variant="glass">
            <CardContent>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Usage & Costs</h2>
                  <p className="text-sm text-gray-400">Track your API usage and generation costs</p>
                </div>
              </div>

              {loadingCosts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
              ) : (
                <>
                  {/* Time Range Filter */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      { value: '7d' as const, label: 'Last 7 Days' },
                      { value: '30d' as const, label: 'Last 30 Days' },
                      { value: '90d' as const, label: 'Last 90 Days' },
                      { value: 'all' as const, label: 'All Time' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTimeRange(option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          timeRange === option.value
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Cost Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <p className="text-xs text-gray-400">Total Cost</p>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        ${costSummary?.totalCost.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : timeRange === '90d' ? 'Last 90 days' : 'All time'}
                      </p>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <p className="text-xs text-gray-400">GPT-4 Cost</p>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        ${costSummary?.gpt4Cost.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Content generation
                      </p>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <p className="text-xs text-gray-400">DALL-E Cost</p>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        ${costSummary?.dalleCost.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Image generation
                      </p>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-orange-400" />
                        <p className="text-xs text-gray-400">This Month</p>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        ${costSummary?.currentMonthCost.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Current billing cycle
                      </p>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-white mb-3">Cost Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                        <span className="text-sm text-gray-300">Total Generations</span>
                        <span className="text-sm font-semibold text-white">{costSummary?.totalGenerations || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                        <span className="text-sm text-gray-300">Avg Cost per Generation</span>
                        <span className="text-sm font-semibold text-green-400">
                          ${costSummary?.avgCostPerGeneration.toFixed(3) || '0.000'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                        <span className="text-sm text-gray-300">Total API Requests</span>
                        <span className="text-sm font-semibold text-white">{costSummary?.totalRequests || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Usage */}
                  {recentUsage.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-white mb-3">Recent Usage</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {recentUsage.slice(0, 10).map((usage, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg text-sm"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{usage.websiteName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(usage.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  usage.service.includes('GPT') || usage.service === 'openai'
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'bg-cyan-500/10 text-cyan-400'
                                }`}
                              >
                                {usage.service.includes('GPT') || usage.service === 'openai' ? 'GPT-4' : 'DALL-E'}
                              </span>
                              <span className="text-green-400 font-semibold min-w-[60px] text-right">
                                ${usage.cost.toFixed(4)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {costSummary?.totalCost === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No usage data for selected time range</p>
                      <p className="text-xs mt-1">Start creating websites to see your costs here</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Billing & Payments */}
          <Card variant="glass">
            <CardContent>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Subscription & Billing</h2>
                  <p className="text-sm text-gray-400">Manage your plan, payment methods, and billing</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Current Plan Display */}
                <div className="p-6 bg-gradient-to-br from-primary-500/10 to-accent-500/10 border-2 border-primary-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Current Plan</p>
                      <h3 className="text-2xl font-bold text-white">{user?.plan || 'FREE'} Plan</h3>
                    </div>
                    {user?.plan === 'FREE' && (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                        Limited Features
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Websites</p>
                      <p className="text-lg font-semibold text-white">
                        {user?.websites_created || 0} {user?.plan === 'FREE' ? '/ 1' : user?.plan === 'STARTER' ? '/ 5' : '/ Unlimited'}
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">AI Generations</p>
                      <p className="text-lg font-semibold text-white">
                        {user?.ai_generations_used || 0} / {user?.ai_generations_limit || 10}
                      </p>
                    </div>
                  </div>

                  {user?.plan === 'FREE' && (
                    <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-300 mb-3">
                        <strong>Upgrade to unlock:</strong>
                      </p>
                      <ul className="text-sm text-gray-400 space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> Unlimited websites
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> More AI generations
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> Custom domains
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> Priority support
                        </li>
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={user?.plan === 'FREE' ? handleUpgradePlan : handleOpenBillingPortal}
                    disabled={openingPortal}
                    isLoading={openingPortal}
                    leftIcon={<ExternalLink className="w-4 h-4" />}
                    className="w-full"
                    size="lg"
                  >
                    {user?.plan === 'FREE' ? 'Upgrade Plan' : 'Manage Subscription'}
                  </Button>
                </div>

                {/* Billing Portal Info */}
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary-400" />
                    {user?.plan === 'FREE' ? 'Stripe Checkout' : 'Stripe Customer Portal'}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {user?.plan === 'FREE'
                      ? 'Click "Upgrade Plan" to select your subscription and enter payment details through our secure Stripe checkout page.'
                      : 'The billing portal provides a secure way to manage all your subscription and payment needs:'}
                  </p>
                  {user?.plan !== 'FREE' && (
                    <ul className="text-sm text-gray-400 space-y-2 mb-4">
                      <li className="flex items-start gap-2">
                        <span className="text-primary-400 mt-0.5">•</span>
                        <span><strong className="text-gray-300">Change plans</strong> - Upgrade or downgrade your subscription</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-400 mt-0.5">•</span>
                        <span><strong className="text-gray-300">Update payment methods</strong> - Add or change credit cards</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-400 mt-0.5">•</span>
                        <span><strong className="text-gray-300">View billing history</strong> - Access all past invoices and receipts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-400 mt-0.5">•</span>
                        <span><strong className="text-gray-300">Cancel subscription</strong> - Manage or cancel your plan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-400 mt-0.5">•</span>
                        <span><strong className="text-gray-300">Download invoices</strong> - Get PDF receipts for accounting</span>
                      </li>
                    </ul>
                  )}

                  <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <span className="text-blue-400 text-lg">ℹ️</span>
                    <p className="text-sm text-blue-400">
                      All payment processing is handled securely by Stripe. Your payment information is never stored on our servers.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400">
                    <strong>Need help choosing a plan?</strong> Contact our support team at support@webese.ai
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DNS Configuration */}
          <Card variant="glass">
            <CardContent>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">DNS & Domain Configuration</h2>
                  <p className="text-sm text-gray-400">Configure email forwarding and DNS records for your custom domain</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <h3 className="font-medium text-white mb-2">Email Forwarding Presets</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Pre-configured DNS records for popular email services like Google Workspace, Microsoft 365, and Cloudflare Email Routing.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                      <p className="text-xs text-gray-500 mb-1">Google Workspace</p>
                      <p className="text-sm font-medium text-white">Gmail for Business</p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                      <p className="text-xs text-gray-500 mb-1">Microsoft 365</p>
                      <p className="text-sm font-medium text-white">Outlook Business</p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                      <p className="text-xs text-gray-500 mb-1">Cloudflare</p>
                      <p className="text-sm font-medium text-white">Free Email Routing</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => router.push('/settings/dns')}
                    className="w-full sm:w-auto"
                  >
                    Configure DNS Records
                  </Button>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h3 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    Why Configure Email Forwarding?
                  </h3>
                  <ul className="text-sm text-blue-400/80 space-y-1">
                    <li>• Use professional email addresses with your custom domain</li>
                    <li>• Forward emails to Gmail, Outlook, or other email providers</li>
                    <li>• Build trust with customers using branded email addresses</li>
                    <li>• Easy setup with step-by-step instructions and copy-paste DNS records</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card variant="glass">
            <CardContent>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Security</h2>
                  <p className="text-sm text-gray-400">Password and authentication settings</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <h3 className="font-medium text-white mb-1">Password</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Change your password or reset it if you&apos;ve forgotten it
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast('Password reset functionality coming soon', {
                        icon: 'ℹ️',
                      })
                    }}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card variant="glass">
            <CardContent>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Notifications</h2>
                  <p className="text-sm text-gray-400">Configure how you receive updates</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white mb-1">Email Notifications</h3>
                    <p className="text-sm text-gray-400">Receive updates about your websites and account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
