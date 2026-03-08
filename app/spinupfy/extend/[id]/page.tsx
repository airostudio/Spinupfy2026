'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { DateRangePicker } from '@/components/spinupfy/DateRangePicker'
import { PricingCalculator } from '@/components/spinupfy/PricingCalculator'
import { getTemplate } from '@/lib/config/spinupfy-templates'
import type { PricingBreakdown } from '@/lib/spinupfy-pricing'

export default function ExtendSitePage() {
  const router = useRouter()
  const params = useParams()
  const siteId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [site, setSite] = useState<any>(null)
  const [newEndDate, setNewEndDate] = useState<Date | null>(null)
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const res = await fetch(`/api/spinupfy/status?id=${siteId}`)
      const data = await res.json()
      if (!res.ok || !data.site) { router.push('/spinupfy/dashboard'); return }

      setSite(data.site)
      // Default new end = current end + 7 days
      const currentEnd = new Date(data.site.end_date)
      const suggested = new Date(currentEnd)
      suggested.setDate(suggested.getDate() + 7)
      setNewEndDate(suggested)
      setLoading(false)
    }
    init()
  }, [siteId])

  async function handleExtend() {
    if (!newEndDate || !pricing) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/spinupfy/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, newEndDate: newEndDate.toISOString() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to extend')

      toast.success('Extension requested — complete payment to activate')
      router.push('/spinupfy/dashboard')
    } catch (err: any) {
      toast.error(err.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-spinupfy-600 animate-spin" />
      </div>
    )
  }

  const template = getTemplate(site?.template_type)
  const currentEnd = new Date(site.end_date)
  const currentEndMin = new Date(currentEnd); currentEndMin.setDate(currentEndMin.getDate() + 1)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800/60 px-6 py-4 flex items-center gap-4">
        <Link href="/spinupfy/dashboard" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-700 hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </Link>
        <div className="flex items-center gap-2">
          <img src="/spinupfy-icon.svg" alt="Spinupfy" className="w-6 h-6" />
          <span className="font-bold text-sm">Extend Site</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Site info */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-4xl">{template?.emoji || '🌐'}</span>
            <div>
              <h1 className="text-2xl font-black">{site.name}</h1>
              <p className="text-gray-400 text-sm">
                Currently expires: {currentEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <div className="flex items-center gap-1.5 mb-3">
                  <RefreshCw className="w-4 h-4 text-green-400" />
                  New expiry date
                </div>
              </label>

              {/* Simple date input for extension */}
              <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-5">
                <div className="flex flex-wrap gap-2 mb-4">
                  {[7, 14, 30, 60].map(days => {
                    const newEnd = new Date(currentEnd); newEnd.setDate(newEnd.getDate() + days)
                    return (
                      <button
                        key={days}
                        onClick={() => setNewEndDate(newEnd)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                          newEndDate && Math.round((newEndDate.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24)) === days
                            ? 'bg-spinupfy-700 border-spinupfy-600 text-white'
                            : 'bg-gray-700 border-gray-600 text-gray-400 hover:text-white'
                        }`}
                      >
                        +{days === 7 ? '1 week' : days === 14 ? '2 weeks' : days === 30 ? '1 month' : '2 months'}
                      </button>
                    )
                  })}
                </div>

                <div className="text-sm text-gray-400 mb-2">Or pick a custom date:</div>
                <input
                  type="date"
                  min={currentEndMin.toISOString().split('T')[0]}
                  value={newEndDate ? newEndDate.toISOString().split('T')[0] : ''}
                  onChange={e => setNewEndDate(e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-spinupfy-700 text-sm"
                />

                {newEndDate && (
                  <p className="text-xs text-green-400 mt-2">
                    New expiry: {newEndDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-300 mb-3">Extension cost</div>
              <PricingCalculator
                templateType={site.template_type as any}
                startDate={currentEnd}
                endDate={newEndDate}
                onPricingReady={setPricing}
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleExtend}
              disabled={!newEndDate || !pricing || submitting}
              className="w-full py-4 bg-gradient-to-r from-spinupfy-700 to-spinupfy-500 hover:from-spinupfy-600 hover:to-spinupfy-400 disabled:opacity-50 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                <><RefreshCw className="w-5 h-5" /> Extend {pricing ? `— $${pricing.totalPrice.toFixed(2)}` : ''}</>
              )}
            </button>
            <p className="text-xs text-center text-gray-500 mt-3">
              You'll be directed to complete payment. Your site activates immediately after payment.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
