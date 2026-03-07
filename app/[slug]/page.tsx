'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import {
  HeroSection,
  FeaturesSection,
  CTASection,
  AboutSection,
  ContactSection,
  ServicesSection,
  TestimonialsSection,
  TeamSection,
  HeaderSection,
  FooterSection,
  PricingSection,
  BookingSection,
  TrustBadgesSection,
  MobileStickyCtaSection,
  StoreSection,
  LoanCalculatorSection,
  FloatingCtaSection,
  MenuSection,
} from '@/components/sections'
import { generateMenuItemsFromSections } from '@/lib/config/menu-content'

interface PageData {
  id: string
  title: string
  slug: string
  website_id: string
  sections: Array<{
    id: string
    type: string
    content: any
    settings?: any
    order: number
    visible: boolean
  }>
  website: {
    id: string
    name: string
    logo_url?: string
    theme?: any
  }
}

export default function DynamicPage({ params }: { params: { slug: string } }) {
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadPage() {
      try {
        // Remove leading slash if present
        const cleanSlug = params.slug.replace(/^\//, '')

        // Fetch page from database
        const { data: page, error } = await supabase
          .from('pages')
          .select(`
            *,
            sections (*),
            website:websites (*)
          `)
          .eq('slug', cleanSlug)
          .single()

        if (error || !page) {
          console.error('Page not found:', error)
          notFound()
          return
        }

        setPageData(page as unknown as PageData)
      } catch (err) {
        console.error('Error loading page:', err)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!pageData) {
    notFound()
  }

  // Generate CSS variables for theme
  const theme = pageData.website?.theme
  const themeStyles = theme ? {
    // Brand Colors (handle both key formats for compatibility)
    '--color-primary': theme.primary || theme.primaryColor || '#2563eb',
    '--color-secondary': theme.secondary || theme.secondaryColor || '#0ea5e9',
    '--color-accent': theme.accent || theme.accentColor || '#06b6d4',

    // Text Colors
    '--color-text-heading': theme.textHeading || theme.textColor || '#111827',
    '--color-text-body': theme.textBody || '#374151',
    '--color-text-muted': theme.textMuted || '#6b7280',
    '--color-text-link': theme.textLink || theme.primary || theme.primaryColor || '#2563eb',
    '--color-text-primary': theme.textHeading || theme.textColor || '#1f2937',

    // Background Colors
    '--color-bg-primary': theme.bgPrimary || theme.backgroundColor || '#ffffff',
    '--color-bg-secondary': theme.bgSecondary || '#f9fafb',
    '--color-bg-dark': theme.bgDark || '#111827',
    '--color-bg-card': theme.bgCard || '#ffffff',
    '--color-bg-light': theme.bgLight || '#f9fafb',

    // UI Colors
    '--color-border': theme.border || '#e5e7eb',
    '--color-success': theme.success || '#10b981',
    '--color-warning': theme.warning || '#f59e0b',
    '--color-error': theme.error || '#ef4444',
    '--color-button-text': theme.buttonText || '#ffffff',

    // Fonts
    '--font-heading': theme.fontHeading ? `'${theme.fontHeading}', system-ui, -apple-system, sans-serif` : 'system-ui, -apple-system, sans-serif',
    '--font-body': theme.fontBody ? `'${theme.fontBody}', system-ui, -apple-system, sans-serif` : 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties : {} as React.CSSProperties

  // Sort sections by order
  const sortedSections = [...(pageData.sections || [])].sort((a, b) => a.order - b.order)

  // Track if we've rendered a hero section for SEO heading hierarchy
  let hasRenderedHero = false

  // Convert section type to anchor id (e.g., 'ABOUT' -> 'about', 'TRUST_BADGES' -> 'trust-badges')
  const getSectionAnchorId = (sectionType: string): string => {
    return sectionType.toLowerCase().replace(/_/g, '-')
  }

  // Generate menu items from available sections
  // This ensures navigation links match actual sections on the page
  const availableSectionTypes = sortedSections
    .filter(s => s.visible)
    .map(s => s.type)
  const dynamicMenuItems = generateMenuItemsFromSections(availableSectionTypes)

  // Render section based on type
  const renderSection = (section: any) => {
    if (!section.visible) return null

    const key = `${section.type}-${section.id}`
    const anchorId = getSectionAnchorId(section.type)

    switch (section.type) {
      case 'HEADER':
        // Inject dynamically generated menu items based on available sections
        const headerContent = {
          ...section.content,
          menuItems: section.content?.menuItems?.length > 0
            ? section.content.menuItems
            : dynamicMenuItems,
        }
        return <HeaderSection key={key} content={headerContent} />

      case 'HERO':
        const isFirstHero = !hasRenderedHero
        hasRenderedHero = true
        return (
          <div key={key} id={anchorId}>
            <HeroSection content={section.content} isFirstSection={isFirstHero} />
          </div>
        )

      case 'FEATURES':
        return (
          <div key={key} id={anchorId}>
            <FeaturesSection content={section.content} settings={section.settings} />
          </div>
        )

      case 'ABOUT':
        return (
          <div key={key} id={anchorId}>
            <AboutSection content={section.content} />
          </div>
        )

      case 'SERVICES':
        return (
          <div key={key} id={anchorId}>
            <ServicesSection content={section.content} />
          </div>
        )

      case 'TESTIMONIALS':
        return (
          <div key={key} id={anchorId}>
            <TestimonialsSection content={section.content} />
          </div>
        )

      case 'TEAM':
        return (
          <div key={key} id={anchorId}>
            <TeamSection content={section.content} />
          </div>
        )

      case 'CONTACT':
        return (
          <div key={key} id={anchorId}>
            <ContactSection content={section.content} />
          </div>
        )

      case 'CTA':
        return (
          <div key={key} id={anchorId}>
            <CTASection content={section.content} />
          </div>
        )

      case 'PRICING':
        return (
          <div key={key} id={anchorId}>
            <PricingSection content={section.content} />
          </div>
        )

      case 'BOOKING':
        return (
          <div key={key} id={anchorId}>
            <BookingSection content={section.content} />
          </div>
        )

      case 'TRUST_BADGES':
        return (
          <div key={key} id={anchorId}>
            <TrustBadgesSection content={section.content} />
          </div>
        )

      case 'STORE':
        return (
          <div key={key} id={anchorId}>
            <StoreSection content={section.content} />
          </div>
        )

      case 'MOBILE_STICKY_CTA':
        return (
          <div key={key} id={anchorId}>
            <MobileStickyCtaSection content={section.content} />
          </div>
        )

      case 'LOAN_CALCULATOR':
        return (
          <div key={key} id={anchorId}>
            <LoanCalculatorSection
              title={section.content?.title}
              subtitle={section.content?.subtitle}
              defaultLoanAmount={section.content?.defaultLoanAmount}
              defaultInterestRate={section.content?.defaultInterestRate}
              defaultLoanTerm={section.content?.defaultLoanTerm}
              maxLoanAmount={section.content?.maxLoanAmount}
              showBreakdown={section.settings?.showBreakdown}
              ctaText={section.content?.ctaText}
              ctaHref={section.content?.ctaHref}
              theme={section.settings?.theme}
              variant={section.settings?.variant}
            />
          </div>
        )

      case 'FLOATING_CTA':
        return (
          <div key={key} id={anchorId}>
            <FloatingCtaSection content={section.content} />
          </div>
        )

      case 'MENU':
        return (
          <div key={key} id={anchorId}>
            <MenuSection content={section.content} settings={section.settings} />
          </div>
        )

      case 'GALLERY':
        // Render gallery as a features section with grid layout
        return (
          <div key={key} id={anchorId}>
            <FeaturesSection content={{
              title: section.content?.title || 'Gallery',
              subtitle: section.content?.subtitle || '',
              features: (section.content?.images || []).map((img: any, idx: number) => ({
                title: img.alt || `Image ${idx + 1}`,
                description: img.caption || '',
                image: img.url || img,
              })),
            }} settings={{ layout: 'grid' }} />
          </div>
        )

      case 'PORTFOLIO':
        // Render portfolio as features with project cards
        return (
          <div key={key} id={anchorId}>
            <FeaturesSection content={{
              title: section.content?.title || 'Our Work',
              subtitle: section.content?.subtitle || 'Featured Projects',
              features: (section.content?.items || []).map((item: any) => ({
                title: item.title,
                description: item.description,
                image: item.image,
              })),
            }} settings={{ layout: 'grid' }} />
          </div>
        )

      case 'HOW_IT_WORKS':
        // HOW_IT_WORKS is already converted to FEATURES in dynamic builder
        return (
          <div key={key} id={anchorId}>
            <FeaturesSection content={section.content} settings={section.settings} />
          </div>
        )

      case 'FAQ':
        // Render FAQ as simple content section
        return (
          <section key={key} id={anchorId} className="py-16 px-4" style={{ backgroundColor: 'var(--color-bg-light, #f9fafb)' }}>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--color-text-primary, #1f2937)' }}>
                {section.content?.title || 'Frequently Asked Questions'}
              </h2>
              <div className="space-y-4">
                {(section.content?.items || []).map((item: any, idx: number) => (
                  <details key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <summary className="p-4 cursor-pointer font-medium" style={{ color: 'var(--color-text-primary, #1f2937)' }}>
                      {item.question}
                    </summary>
                    <p className="px-4 pb-4 text-gray-600">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )

      case 'FOOTER':
        return (
          <div key={key} id={anchorId}>
            <FooterSection content={section.content} />
          </div>
        )

      default:
        console.warn(`Unknown section type: ${section.type}`)
        return null
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)', ...themeStyles }}>
      {/* Skip to main content - Accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Render all sections */}
      <main id="main-content">
        {sortedSections.map(renderSection)}
      </main>

      {/* Footer */}
      <FooterSection
        content={{
          brandName: pageData.website.name,
          copyright: `© ${new Date().getFullYear()} ${pageData.website.name}. All rights reserved.`,
          logo: pageData.website.logo_url,
        }}
      />
    </div>
  )
}
