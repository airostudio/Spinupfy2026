'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { SpinupfyTemplate } from '@/lib/config/spinupfy-templates'

interface TemplateCardProps {
  template: SpinupfyTemplate
  selected?: boolean
  onSelect: (template: SpinupfyTemplate) => void
  compact?: boolean
}

export function TemplateCard({ template, selected, onSelect, compact }: TemplateCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(template)}
      className={`
        relative w-full text-left rounded-2xl border-2 transition-all duration-200 cursor-pointer
        ${compact ? 'p-3' : 'p-5'}
        ${selected
          ? 'border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-500/20'
          : 'border-gray-700/60 bg-gray-800/40 hover:border-gray-500'
        }
      `}
    >
      {/* Selected checkmark */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
        >
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </motion.div>
      )}

      {/* Emoji */}
      <div className={`${compact ? 'text-2xl mb-1.5' : 'text-4xl mb-3'}`}>
        {template.emoji}
      </div>

      {/* Label */}
      <div className={`font-bold text-white ${compact ? 'text-sm' : 'text-base'}`}>
        {template.label}
      </div>

      {/* Tagline */}
      <div className={`text-gray-400 mt-1 leading-snug ${compact ? 'text-xs' : 'text-sm'}`}>
        {template.tagline}
      </div>

      {/* Typical duration tags */}
      {!compact && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {template.typicalDurations.slice(0, 3).map(days => (
            <span
              key={days}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-700/60 text-gray-300"
            >
              {days === 1 ? '1 day' : days < 7 ? `${days} days` : days === 7 ? '1 week' : days === 14 ? '2 weeks' : days === 30 ? '1 month' : `${days} days`}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  )
}
