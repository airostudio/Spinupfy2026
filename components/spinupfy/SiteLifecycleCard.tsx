'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Clock, PauseCircle, Trash2, ExternalLink, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { getTemplate } from '@/lib/config/spinupfy-templates'

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
}

interface SiteLifecycleCardProps {
  site: SpinupfySite
  onExtend?: (siteId: string) => void
}

function useCountdown(endDate: string) {
  return useMemo(() => {
    const end = new Date(endDate)
    const now = new Date()
    const ms = end.getTime() - now.getTime()

    if (ms <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, urgency: 'expired' as const }

    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

    const urgency = days < 1 ? 'critical' : days < 3 ? 'warning' : 'normal'

    return { expired: false, days, hours, minutes, urgency: urgency as 'normal' | 'warning' | 'critical' }
  }, [endDate])
}

const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    dot: 'bg-gray-500',
    badge: 'bg-gray-800 text-gray-400 border-gray-700',
    icon: Clock,
  },
  payment_pending: {
    label: 'Awaiting Payment',
    dot: 'bg-yellow-400 animate-pulse',
    badge: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
    icon: Clock,
  },
  active: {
    label: 'Live',
    dot: 'bg-green-400 animate-pulse',
    badge: 'bg-green-900/40 text-green-300 border-green-700',
    icon: () => <img src="/spinupfy-icon.svg" className="w-3 h-3" alt="" />,
  },
  suspended: {
    label: 'Suspended',
    dot: 'bg-orange-400',
    badge: 'bg-orange-900/40 text-orange-300 border-orange-700',
    icon: PauseCircle,
  },
  deleted: {
    label: 'Deleted',
    dot: 'bg-red-500',
    badge: 'bg-red-900/40 text-red-400 border-red-800',
    icon: Trash2,
  },
}

const URGENCY_BAR = {
  normal:   'bg-green-500',
  warning:  'bg-yellow-500',
  critical: 'bg-red-500 animate-pulse',
  expired:  'bg-gray-600',
}

export function SiteLifecycleCard({ site, onExtend }: SiteLifecycleCardProps) {
  const template = getTemplate(site.template_type as any)
  const countdown = useCountdown(site.end_date)
  const config = STATUS_CONFIG[site.status] || STATUS_CONFIG.draft
  const StatusIcon = config.icon

  const start = new Date(site.start_date)
  const end = new Date(site.end_date)
  const totalMs = end.getTime() - start.getTime()
  const elapsedMs = Date.now() - start.getTime()
  const progressPct = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100))

  const liveUrl = `https://${site.subdomain}.spinupfy.io`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/60 border border-gray-700/60 rounded-2xl overflow-hidden"
    >
      {/* Progress bar */}
      {site.status === 'active' && (
        <div className="h-1 bg-gray-700">
          <div
            className={`h-full transition-all duration-300 ${URGENCY_BAR[countdown.urgency]}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{template?.emoji || '🌐'}</div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">{site.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{template?.label || site.template_type}</p>
            </div>
          </div>

          {/* Status badge */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${config.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            <StatusIcon className="w-3 h-3" />
            {config.label}
          </span>
        </div>

        {/* Countdown (active sites only) */}
        {site.status === 'active' && (
          <div className="mb-4">
            {countdown.expired ? (
              <div className="text-sm text-red-400 font-medium">Expiry processing...</div>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-gray-400 mr-1">Expires in</span>
                {countdown.days > 0 && (
                  <><span className={`text-lg font-bold ${countdown.urgency === 'critical' ? 'text-red-400' : countdown.urgency === 'warning' ? 'text-yellow-400' : 'text-white'}`}>{countdown.days}</span><span className="text-xs text-gray-400">d </span></>
                )}
                <span className={`text-lg font-bold ${countdown.urgency === 'critical' ? 'text-red-400' : countdown.urgency === 'warning' ? 'text-yellow-400' : 'text-white'}`}>{countdown.hours}</span>
                <span className="text-xs text-gray-400">h </span>
                <span className={`text-lg font-bold ${countdown.urgency === 'critical' ? 'text-red-400' : countdown.urgency === 'warning' ? 'text-yellow-400' : 'text-white'}`}>{countdown.minutes}</span>
                <span className="text-xs text-gray-400">m</span>
              </div>
            )}
            <div className="text-xs text-gray-500 mt-0.5">
              {start.toLocaleDateString()} → {end.toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Suspended: grace period warning */}
        {site.status === 'suspended' && (
          <div className="mb-4 bg-orange-900/20 border border-orange-700/40 rounded-xl px-4 py-3">
            <p className="text-sm text-orange-300 font-medium">Site suspended — extend to reactivate</p>
            <p className="text-xs text-orange-400/70 mt-1">Will be permanently deleted 5 days after suspension</p>
          </div>
        )}

        {/* Draft/payment pending */}
        {(site.status === 'draft' || site.status === 'payment_pending') && (
          <div className="mb-4 bg-gray-700/30 border border-gray-600/40 rounded-xl px-4 py-3">
            <p className="text-sm text-gray-300">Complete payment to go live</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {site.status === 'active' && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-spinupfy-700 hover:bg-spinupfy-600 text-white transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View Live
            </a>
          )}

          {(site.status === 'active' || site.status === 'suspended') && onExtend && (
            <button
              onClick={() => onExtend(site.id)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-green-700 hover:bg-green-600 text-white transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Extend
            </button>
          )}

          <Link
            href={`/spinupfy/manage/${site.id}`}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
          >
            Manage
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
