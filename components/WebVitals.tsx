/**
 * Web Vitals Component
 * Tracks Core Web Vitals (LCP, FID, CLS, FCP, TTFB) for performance monitoring
 */

'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', {
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
        id: metric.id,
      })
    }

    // Send to analytics in production (optional - uncomment when ready)
    /*
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true,
      })
    }
    */

    // Alternative: Send to custom analytics endpoint
    /*
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      }),
    }).catch(console.error)
    */
  })

  return null
}
