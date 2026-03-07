'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Phone, MessageCircle, ArrowRight, ShoppingBag } from 'lucide-react'
import { getCtaContentForBusinessType } from '@/lib/config/cta-content'

interface FloatingCtaProps {
  content: {
    title?: string
    subtitle?: string
    primaryCta?: {
      text: string
      href: string
      icon?: 'calendar' | 'phone' | 'message' | 'arrow' | 'shop'
    }
    secondaryCta?: {
      text: string
      href: string
    }
    showAfterScroll?: number // pixels to scroll before showing
    position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
    dismissible?: boolean
    businessType?: string
  }
  editable?: boolean
  onEdit?: () => void
}

const iconMap = {
  calendar: Calendar,
  phone: Phone,
  message: MessageCircle,
  arrow: ArrowRight,
  shop: ShoppingBag,
}

export function FloatingCtaSection({ content, editable, onEdit }: FloatingCtaProps) {
  // Get business-type-specific defaults
  const businessTypeDefaults = useMemo(
    () => getCtaContentForBusinessType(content.businessType),
    [content.businessType]
  )

  const {
    title = businessTypeDefaults.title,
    subtitle = businessTypeDefaults.subtitle,
    primaryCta = businessTypeDefaults.primaryCta,
    secondaryCta = content.secondaryCta ?? businessTypeDefaults.secondaryCta,
    showAfterScroll = 300,
    position = 'bottom-right',
    dismissible = true,
  } = content

  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > showAfterScroll && !isDismissed) {
        setIsVisible(true)
      } else if (window.scrollY <= showAfterScroll) {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [showAfterScroll, isDismissed])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
  }

  const positionClasses = {
    'bottom-right': 'right-4 md:right-8',
    'bottom-left': 'left-4 md:left-8',
    'bottom-center': 'left-1/2 -translate-x-1/2',
  }

  const Icon = primaryCta.icon ? iconMap[primaryCta.icon] : Calendar

  if (editable) {
    return (
      <div
        className="fixed bottom-20 right-8 z-40 cursor-pointer"
        onClick={onEdit}
      >
        <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800 max-w-sm hover:ring-2 hover:ring-primary-500/50">
          <p className="text-white font-semibold mb-1">{title}</p>
          <p className="text-gray-400 text-sm mb-4">{subtitle}</p>
          <div className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg">
            <Icon className="w-5 h-5" />
            <span className="font-medium">{primaryCta.text}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Click to edit floating CTA</p>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`fixed bottom-4 md:bottom-8 z-40 ${positionClasses[position]}`}
        >
          <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800 max-w-sm relative">
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-primary-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">{title}</h4>
                <p className="text-gray-400 text-sm mb-4">{subtitle}</p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={primaryCta.href}
                    className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    {primaryCta.text}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  {secondaryCta && (
                    <a
                      href={secondaryCta.href}
                      className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      {secondaryCta.text}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FloatingCtaSection
