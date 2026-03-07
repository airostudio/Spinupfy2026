'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, TrendingDown, Clock, Shield, ChevronDown } from 'lucide-react'
import type { SpinupfyTemplateType } from '@/lib/spinupfy-pricing'
import type { PricingBreakdown } from '@/lib/spinupfy-pricing'

interface PricingCalculatorProps {
  templateType: SpinupfyTemplateType
  startDate: Date | null
  endDate: Date | null
  onPricingReady?: (pricing: PricingBreakdown | null) => void
}

const TIER_BADGE: Record<string, { label: string; color: string }> = {
  daily:    { label: 'Daily Rate',   color: 'bg-gray-700 text-gray-300' },
  weekly:   { label: '1-Week Deal',  color: 'bg-blue-800 text-blue-200' },
  biweekly: { label: '2-Week Deal',  color: 'bg-indigo-800 text-indigo-200' },
  monthly:  { label: 'Best Value',   color: 'bg-green-800 text-green-200' },
  custom:   { label: 'Custom',       color: 'bg-gray-700 text-gray-300' },
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

export function PricingCalculator({ templateType, startDate, endDate, onPricingReady }: PricingCalculatorProps) {
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null)
  const [loading, setLoading] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)

  const fetchPricing = useCallback(async () => {
    if (!startDate || !endDate || endDate <= startDate) {
      setPricing(null)
      onPricingReady?.(null)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/spinupfy/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      })
      const data = await res.json()
      if (data.pricing) {
        setPricing(data.pricing)
        onPricingReady?.(data.pricing)
      }
    } catch {
      // silent fail — pricing is shown inline
    } finally {
      setLoading(false)
    }
  }, [templateType, startDate, endDate, onPricingReady])

  useEffect(() => { fetchPricing() }, [fetchPricing])

  if (!startDate || !endDate || endDate <= startDate) {
    return (
      <div className="rounded-2xl border border-gray-700/60 bg-gray-800/30 p-5 text-center">
        <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Select your date range to see pricing</p>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="rounded-2xl border border-gray-700/60 bg-gray-800/30 p-6 flex items-center justify-center gap-3"
        >
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Calculating your price...</span>
        </motion.div>
      ) : pricing ? (
        <motion.div
          key="pricing"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-blue-500/30 bg-blue-950/20 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-blue-500/20">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_BADGE[pricing.tier].color}`}>
                    {TIER_BADGE[pricing.tier].label}
                  </span>
                  {pricing.recommended && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-800 text-amber-200">
                      ⭐ Recommended
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold text-white">
                  {formatPrice(pricing.totalPrice)}
                </div>
                <div className="text-sm text-gray-400 mt-0.5">
                  for {pricing.label} · {formatPrice(pricing.dailyRate)}/day
                </div>
              </div>
              <div className="text-right">
                {pricing.savingsVsDaily > 0 && (
                  <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                    <TrendingDown className="w-4 h-4" />
                    Save {formatPrice(pricing.savingsVsDaily)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* What's included */}
          <div className="p-5 space-y-2.5">
            <div className="flex items-start gap-2.5 text-sm text-gray-300">
              <Zap className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>AI builds your site in under 60 seconds</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-gray-300">
              <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Free hosting on spinupfy.io subdomain for {pricing.label}</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-gray-300">
              <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Email reminders before expiry · easy to extend</span>
            </div>
          </div>

          {/* Expandable breakdown */}
          <button
            onClick={() => setShowBreakdown(v => !v)}
            className="w-full px-5 pb-4 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
            {showBreakdown ? 'Hide' : 'Show'} price breakdown
          </button>

          <AnimatePresence>
            {showBreakdown && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 border-t border-blue-500/20 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Base price ({pricing.days} days × {formatPrice(pricing.dailyRate)})</span>
                    <span>{formatPrice(pricing.basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Platform fee (8%)</span>
                    <span>{formatPrice(pricing.platformFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white border-t border-gray-700 pt-2">
                    <span>Total</span>
                    <span>{formatPrice(pricing.totalPrice)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
