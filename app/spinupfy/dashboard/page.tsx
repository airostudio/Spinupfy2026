'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, Plus, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { SiteLifecycleCard } from '@/components/spinupfy/SiteLifecycleCard'

interface SpinupfySite {
  id: string
  name: string
  template_type: string
  subdomain: string
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'suspended' | 'deleted' | 'payment_pending'
  total_price: number
  currency: string
  created_at: string
}

const STATUS_FILTER_OPTIONS = [
  { key: 'all', label: 'All Sites' },
  { key: 'active', label: 'Live' },
  { key: 'draft', label: 'Drafts' },
  { key: 'suspended', label: 'Suspended' },
]

export default function SpinupfyDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [sites, setSites] = useState<SpinupfySite[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login?redirect=/spinupfy/dashboard'); return }
      await fetchSites()
    }
    init()
  }, [])

  async function fetchSites() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/spinupfy/status')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch')
      setSites(data.sites || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleExtend(siteId: string) {
    router.push(`/spinupfy/extend/${siteId}`)
  }

  const filteredSites = statusFilter === 'all'
    ? sites
    : sites.filter(s => s.status === statusFilter)

  const activeCount = sites.filter(s => s.status === 'active').length
  const suspendedCount = sites.filter(s => s.status === 'suspended').length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/spinupfy" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Spinupfy</span>
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-gray-400 text-sm">My Sites</span>
        </div>

        <Link
          href="/spinupfy/create"
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Site
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Stats strip */}
        {sites.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-white">{sites.length}</div>
              <div className="text-xs text-gray-400 mt-1">Total Sites</div>
            </div>
            <div className="bg-green-900/20 border border-green-700/30 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-green-400">{activeCount}</div>
              <div className="text-xs text-gray-400 mt-1">Live Now</div>
            </div>
            {suspendedCount > 0 && (
              <div className="bg-orange-900/20 border border-orange-700/30 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-orange-400">{suspendedCount}</div>
                <div className="text-xs text-gray-400 mt-1">Suspended</div>
              </div>
            )}
            {suspendedCount === 0 && (
              <div className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-gray-400">{sites.filter(s => s.status === 'draft').length}</div>
                <div className="text-xs text-gray-400 mt-1">Drafts</div>
              </div>
            )}
          </div>
        )}

        {/* Suspended warning */}
        {suspendedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-orange-900/20 border border-orange-600/30 rounded-2xl px-5 py-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-orange-300 font-medium text-sm">
                {suspendedCount} site{suspendedCount > 1 ? 's' : ''} suspended
              </p>
              <p className="text-orange-400/70 text-xs mt-1">
                Extend now to reactivate. Suspended sites are permanently deleted after 5 days.
              </p>
            </div>
          </motion.div>
        )}

        {/* Filter tabs */}
        {sites.length > 0 && (
          <div className="flex gap-2 mb-6">
            {STATUS_FILTER_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`text-sm px-3 py-1.5 rounded-xl border transition-colors ${
                  statusFilter === opt.key
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}

            <button
              onClick={fetchSites}
              className="ml-auto w-8 h-8 flex items-center justify-center rounded-xl border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchSites} className="text-sm text-blue-400 hover:text-blue-300">
              Try again
            </button>
          </div>
        ) : sites.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="text-6xl mb-6">⚡</div>
            <h2 className="text-2xl font-black mb-3">No sites yet</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Create your first temporary site — an event flyer, real estate listing, flash sale, and more. Live in 60 seconds.
            </p>
            <Link
              href="/spinupfy/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first site
            </Link>
          </motion.div>
        ) : filteredSites.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No {statusFilter} sites found.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSites.map((site, i) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <SiteLifecycleCard
                  site={site}
                  onExtend={handleExtend}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
