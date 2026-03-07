'use client'

import { useState, useEffect, useMemo } from 'react'
import { ArrowRight, Phone, Calendar, ShoppingBag, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getCtaContentForBusinessType } from '@/lib/config/cta-content'

interface MobileStickyCtaSectionProps {
  content: {
    primaryCTA?: {
      text: string
      href: string
      icon?: 'arrow' | 'phone' | 'calendar' | 'shop'
    }
    secondaryCTA?: {
      text: string
      href: string
    }
    showAfterScroll?: number // pixels to scroll before showing
    businessType?: string
  }
  editable?: boolean
}

export function MobileStickyCtaSection({ content, editable }: MobileStickyCtaSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // Get business-type-specific defaults
  const businessTypeDefaults = useMemo(
    () => getCtaContentForBusinessType(content.businessType),
    [content.businessType]
  )

  // Use provided content or fall back to business-type-specific defaults
  const primaryCTA = content.primaryCTA ?? {
    text: businessTypeDefaults.primaryCta.text,
    href: businessTypeDefaults.primaryCta.href,
    icon: businessTypeDefaults.primaryCta.icon as 'arrow' | 'phone' | 'calendar' | 'shop',
  }

  const secondaryCTA = content.secondaryCTA ?? (businessTypeDefaults.secondaryCta ? {
    text: businessTypeDefaults.secondaryCta.text,
    href: businessTypeDefaults.secondaryCta.href,
  } : undefined)

  const showAfterScroll = content.showAfterScroll || 300 // Default: show after 300px scroll

  useEffect(() => {
    if (editable) return // Don't show in editor mode

    const handleScroll = () => {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Show CTA after scrolling past threshold, but hide near bottom of page
      const nearBottom = scrollY + viewportHeight >= documentHeight - 200

      if (scrollY > showAfterScroll && !nearBottom && !isDismissed) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [showAfterScroll, isDismissed, editable])

  const getIcon = () => {
    switch (primaryCTA.icon) {
      case 'phone':
        return <Phone className="w-5 h-5" aria-hidden="true" />
      case 'calendar':
        return <Calendar className="w-5 h-5" aria-hidden="true" />
      case 'shop':
        return <ShoppingBag className="w-5 h-5" aria-hidden="true" />
      default:
        return <ArrowRight className="w-5 h-5" aria-hidden="true" />
    }
  }

  // Only render on mobile (handled by CSS), don't render if dismissed or in editor
  if (isDismissed || editable) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-inset-bottom"
          style={{
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)'
          }}
          role="complementary"
          aria-label="Quick actions"
        >
          <div className="px-4 py-3">
            {/* Dismiss button */}
            <button
              onClick={() => setIsDismissed(true)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            <div className="flex items-center gap-3">
              {/* Primary CTA */}
              <Link
                href={primaryCTA.href}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  color: 'var(--color-button-text)'
                }}
              >
                {primaryCTA.text}
                {getIcon()}
              </Link>

              {/* Secondary CTA (optional) */}
              {secondaryCTA && (
                <Link
                  href={secondaryCTA.href}
                  className="py-3.5 px-4 rounded-xl font-semibold text-sm border border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  {secondaryCTA.text}
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
