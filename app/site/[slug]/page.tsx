'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams, notFound } from 'next/navigation'
import Head from 'next/head'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { StructuredData } from '@/components/StructuredData'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { generateOrganizationSchema, generateWebPageSchema } from '@/lib/structured-data'
import {
  HeroSection,
  FeaturesSection,
  CTASection,
  ContactSection,
  PricingSection,
  HeaderSection,
  FooterSection,
  StoreSection,
  AboutSection,
  TeamSection,
  ServicesSection,
  TestimonialsSection,
  BookingSection,
  TrustBadgesSection,
  MobileStickyCtaSection,
  LoanCalculatorSection,
  FloatingCtaSection,
  MenuSection,
} from '@/components/sections'

function PublicSiteContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const slug = params.slug as string
  const pagePath = searchParams.get('page') || '/'

  const [loading, setLoading] = useState(true)
  const [website, setWebsite] = useState<any>(null)
  const [pages, setPages] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState<any>(null)
  const [sections, setSections] = useState<any[]>([])

  useEffect(() => {
    loadWebsite()
  }, [slug, pagePath])

  // Load Google Fonts dynamically
  useEffect(() => {
    const fontHeading = website?.theme?.fontHeading || 'Inter'
    const fontBody = website?.theme?.fontBody || 'Inter'

    // Only load if fonts are set and different from default
    const fontsToLoad = new Set([fontHeading, fontBody])

    fontsToLoad.forEach(font => {
      if (font && font !== 'Inter') { // Inter is already loaded
        const fontName = font.replace(/ /g, '+')
        const linkId = `google-font-${fontName}`

        // Check if font is already loaded
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link')
          link.id = linkId
          link.rel = 'stylesheet'
          link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700;800;900&display=swap`
          document.head.appendChild(link)
        }
      }
    })
  }, [website?.theme?.fontHeading, website?.theme?.fontBody])

  async function loadWebsite() {
    try {
      // Load website by slug (must be published)
      const { data: websiteData, error: websiteError } = await supabase
        .from('websites')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (websiteError || !websiteData) {
        notFound()
        return
      }

      // Load all pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('pages')
        .select('*')
        .eq('website_id', websiteData.id)
        .order('order', { ascending: true })

      if (pagesError || !pagesData) {
        notFound()
        return
      }

      // Find current page by path
      const page = pagesData.find(p => p.path === pagePath) || pagesData.find(p => p.is_homepage)

      if (!page) {
        notFound()
        return
      }

      // Load sections for current page
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .eq('page_id', page.id)
        .eq('visible', true)
        .order('order', { ascending: true })

      if (sectionsError) throw sectionsError

      setWebsite(websiteData)
      setPages(pagesData)
      setCurrentPage(page)
      setSections(sectionsData || [])

      // Update page title and meta tags
      document.title = page.meta_title || websiteData.meta_title || websiteData.name

      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', page.meta_description || websiteData.meta_description || websiteData.description)
      }

      // Update Open Graph meta tags for social media sharing
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const pageUrl = `${baseUrl}/site/${slug}${page.path !== '/' ? `?page=${page.path}` : ''}`
      const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(page.meta_title || page.title)}&description=${encodeURIComponent(page.meta_description || websiteData.meta_description || '')}&brand=${encodeURIComponent(websiteData.brand_name || websiteData.name)}`

      // Update or create OG meta tags
      const updateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`)
        if (!meta) {
          meta = document.createElement('meta')
          meta.setAttribute('property', property)
          document.head.appendChild(meta)
        }
        meta.setAttribute('content', content)
      }

      updateMetaTag('og:title', page.meta_title || page.title)
      updateMetaTag('og:description', page.meta_description || websiteData.meta_description || websiteData.description)
      updateMetaTag('og:url', pageUrl)
      updateMetaTag('og:image', ogImageUrl)
      updateMetaTag('og:type', 'website')

      // Twitter Card tags
      const updateTwitterTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`)
        if (!meta) {
          meta = document.createElement('meta')
          meta.setAttribute('name', name)
          document.head.appendChild(meta)
        }
        meta.setAttribute('content', content)
      }

      updateTwitterTag('twitter:card', 'summary_large_image')
      updateTwitterTag('twitter:title', page.meta_title || page.title)
      updateTwitterTag('twitter:description', page.meta_description || websiteData.meta_description || websiteData.description)
      updateTwitterTag('twitter:image', ogImageUrl)
    } catch (error) {
      console.error('Error loading website:', error)
      notFound()
    } finally {
      setLoading(false)
    }
  }

  // Build navigation menu items from pages AND sections on homepage
  // This ensures all sections are accessible via the menu
  const buildMenuItems = () => {
    const items: Array<{ label: string; href: string }> = []

    // Add Home link first
    items.push({ label: 'Home', href: `/site/${slug}` })

    // Find homepage to get its sections
    const homePage = pages.find(p => p.is_homepage)
    const homePageId = homePage?.id

    // Get homepage sections to create anchor links
    // We need to fetch sections for the homepage if we're on it
    if (currentPage?.is_homepage && sections.length > 0) {
      // Map section types to user-friendly labels
      const sectionTypeLabels: Record<string, string> = {
        'ABOUT': 'About',
        'SERVICES': 'Services',
        'FEATURES': 'Features',
        'TEAM': 'Team',
        'TESTIMONIALS': 'Testimonials',
        'PRICING': 'Pricing',
        'CONTACT': 'Contact',
        'STORE': 'Shop',
        'BOOKING': 'Book Now',
        'PORTFOLIO': 'Portfolio',
        'GALLERY': 'Gallery',
        'FAQ': 'FAQ',
        'MENU': 'Menu',
      }

      // Add anchor links for linkable sections on homepage
      const linkableSections = sections.filter(s =>
        sectionTypeLabels[s.type] &&
        s.type !== 'HEADER' &&
        s.type !== 'FOOTER' &&
        s.type !== 'HERO' &&
        s.type !== 'CTA' &&
        s.type !== 'TRUST_BADGES' &&
        s.type !== 'MOBILE_STICKY_CTA' &&
        s.type !== 'FLOATING_CTA'
      )

      linkableSections.forEach(section => {
        const label = sectionTypeLabels[section.type] || section.type
        const anchor = section.type.toLowerCase().replace(/_/g, '-')
        // Don't add duplicates
        if (!items.some(item => item.label === label)) {
          items.push({ label, href: `#${anchor}` })
        }
      })
    }

    // Add non-homepage pages
    pages
      .filter(p => !p.is_homepage)
      .forEach(page => {
        // Don't duplicate if already added as section
        if (!items.some(item => item.label.toLowerCase() === page.title.toLowerCase())) {
          items.push({
            label: page.title,
            href: `/site/${slug}?page=${page.path}`,
          })
        }
      })

    return items
  }

  const menuItems = buildMenuItems()

  // Track if we've rendered a hero section for SEO heading hierarchy
  let hasRenderedHero = false

  // Generate anchor ID from section type (e.g., 'ABOUT' -> 'about', 'TRUST_BADGES' -> 'trust-badges')
  const getSectionAnchorId = (type: string) => type.toLowerCase().replace(/_/g, '-')

  const renderSection = (section: any) => {
    // Inject menu items into any HeaderSection
    const content = section.type === 'HEADER'
      ? { ...section.content, menuItems }
      : section.content

    const sectionProps = {
      content,
      editable: false,
    }

    // Generate anchor ID for this section
    const anchorId = getSectionAnchorId(section.type)

    // Wrapper component to add anchor ID to sections
    const withAnchor = (element: React.ReactNode, skipAnchor = false) => {
      if (skipAnchor) return element
      return (
        <div key={section.id} id={anchorId} className="scroll-mt-20">
          {element}
        </div>
      )
    }

    switch (section.type) {
      case 'HEADER':
        // Header doesn't need an anchor
        return <HeaderSection key={section.id} {...sectionProps} />
      case 'HERO':
        const isFirstHero = !hasRenderedHero
        hasRenderedHero = true
        return withAnchor(<HeroSection {...sectionProps} isFirstSection={isFirstHero} />)
      case 'FEATURES':
        return withAnchor(<FeaturesSection {...sectionProps} />)
      case 'ABOUT':
        return withAnchor(<AboutSection {...sectionProps} />)
      case 'TEAM':
        return withAnchor(<TeamSection {...sectionProps} />)
      case 'SERVICES':
        return withAnchor(<ServicesSection {...sectionProps} />)
      case 'TESTIMONIALS':
        return withAnchor(<TestimonialsSection {...sectionProps} />)
      case 'CTA':
        return withAnchor(<CTASection {...sectionProps} />)
      case 'CONTACT':
        return withAnchor(<ContactSection {...sectionProps} />)
      case 'PRICING':
        return withAnchor(<PricingSection {...sectionProps} />)
      case 'STORE':
        return withAnchor(<StoreSection {...sectionProps} />)
      case 'BOOKING':
        return withAnchor(<BookingSection {...sectionProps} websiteId={website.id} />)
      case 'FOOTER':
        // Footer doesn't need an anchor
        return <FooterSection key={section.id} {...sectionProps} />
      case 'TRUST_BADGES':
        return withAnchor(<TrustBadgesSection {...sectionProps} />)
      case 'MOBILE_STICKY_CTA':
        return <MobileStickyCtaSection key={section.id} {...sectionProps} />
      case 'LOAN_CALCULATOR':
        return withAnchor(
          <LoanCalculatorSection
            title={content?.title}
            subtitle={content?.subtitle}
            defaultLoanAmount={content?.defaultLoanAmount}
            defaultInterestRate={content?.defaultInterestRate}
            defaultLoanTerm={content?.defaultLoanTerm}
            maxLoanAmount={content?.maxLoanAmount}
            showBreakdown={section.settings?.showBreakdown}
            ctaText={content?.ctaText}
            ctaHref={content?.ctaHref}
            theme={section.settings?.theme}
            variant={section.settings?.variant}
          />
        )
      case 'FLOATING_CTA':
        return <FloatingCtaSection key={section.id} content={content} />
      case 'MENU':
        return withAnchor(<MenuSection content={content} settings={section.settings} />)
      case 'GALLERY':
        // Render gallery as features with image grid
        return withAnchor(
          <FeaturesSection content={{
            title: content?.title || 'Gallery',
            subtitle: content?.subtitle || '',
            features: (content?.images || []).map((img: any, idx: number) => ({
              title: img.alt || `Image ${idx + 1}`,
              description: img.caption || '',
              image: img.url || img,
            })),
          }} editable={false} />
        )
      case 'PORTFOLIO':
        // Render portfolio as features with project cards
        return withAnchor(
          <FeaturesSection content={{
            title: content?.title || 'Our Work',
            subtitle: content?.subtitle || 'Featured Projects',
            features: (content?.items || []).map((item: any) => ({
              title: item.title,
              description: item.description,
              image: item.image,
            })),
          }} editable={false} />
        )
      case 'HOW_IT_WORKS':
        return withAnchor(<FeaturesSection {...sectionProps} />)
      case 'FAQ':
        // Render FAQ with expandable items
        return withAnchor(
          <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)' }}>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--color-text-heading, #1f2937)', fontFamily: 'var(--font-heading)' }}>
                {content?.title || 'Frequently Asked Questions'}
              </h2>
              <div className="space-y-4">
                {(content?.items || []).map((item: any, idx: number) => (
                  <details key={idx} className="rounded-lg shadow-sm border" style={{ backgroundColor: 'var(--color-bg-card, white)', borderColor: 'var(--color-border, #e5e7eb)' }}>
                    <summary className="p-4 cursor-pointer font-medium" style={{ color: 'var(--color-text-heading, #1f2937)', fontFamily: 'var(--font-heading)' }}>
                      {item.question}
                    </summary>
                    <p className="px-4 pb-4" style={{ color: 'var(--color-text-body, #4b5563)', fontFamily: 'var(--font-body)' }}>{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )
      case 'ADVANCED_STORE':
        // Handle AdvancedStoreSection - render as regular StoreSection for compatibility
        return withAnchor(<StoreSection {...sectionProps} />)
      default:
        // For unknown section types, return null but log warning
        console.warn(`Unknown section type: ${section.type}`)
        return null
    }
  }

  // Check if there's a header section in the current page
  const hasHeaderSection = sections.some(s => s.type === 'HEADER')

  // Generate CSS variables for comprehensive theme color system and fonts
  const fontHeading = website?.theme?.fontHeading || 'Inter'
  const fontBody = website?.theme?.fontBody || 'Inter'

  const themeStyles = (website?.theme ? {
    // Brand Colors (handle both key formats for compatibility)
    '--color-primary': website.theme.primary || website.theme.primaryColor || '#2563eb',
    '--color-secondary': website.theme.secondary || website.theme.secondaryColor || '#0ea5e9',
    '--color-accent': website.theme.accent || website.theme.accentColor || '#06b6d4',

    // Text Colors - Dark text for light backgrounds (proper contrast)
    '--color-text-heading': website.theme.textHeading || '#111827',
    '--color-text-body': website.theme.textBody || '#374151',
    '--color-text-muted': website.theme.textMuted || '#6b7280',
    '--color-text-link': website.theme.textLink || '#2563eb',

    // Background Colors
    '--color-bg-primary': website.theme.bgPrimary || '#ffffff',
    '--color-bg-secondary': website.theme.bgSecondary || '#f9fafb',
    '--color-bg-dark': website.theme.bgDark || '#111827',
    '--color-bg-card': website.theme.bgCard || '#ffffff',

    // UI Colors
    '--color-border': website.theme.border || '#e5e7eb',
    '--color-success': website.theme.success || '#10b981',
    '--color-warning': website.theme.warning || '#f59e0b',
    '--color-error': website.theme.error || '#ef4444',
    '--color-button-text': website.theme.buttonText || '#ffffff',

    // Fonts
    '--font-heading': `'${fontHeading}', system-ui, -apple-system, sans-serif`,
    '--font-body': `'${fontBody}', system-ui, -apple-system, sans-serif`,
  } : {}) as React.CSSProperties

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Generate structured data for SEO
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || '')
  const pageUrl = `${baseUrl}/site/${slug}${pagePath !== '/' ? `?page=${pagePath}` : ''}`

  // Find contact section for additional data
  const contactSection = sections.find(s => s.type === 'CONTACT')

  // Generate Organization schema
  const organizationSchema = website ? generateOrganizationSchema({
    name: website.brand_name || website.name,
    url: `${baseUrl}/site/${slug}`,
    logo: website.theme?.logo,
    description: website.meta_description || website.description,
    contactPoint: contactSection?.content ? {
      email: contactSection.content.email,
      telephone: contactSection.content.phone,
      contactType: 'customer service',
    } : undefined,
  }) : null

  // Generate WebPage schema
  const webPageSchema = currentPage ? generateWebPageSchema({
    name: currentPage.meta_title || currentPage.title,
    description: currentPage.meta_description || website?.meta_description || '',
    url: pageUrl,
  }) : null

  // Generate breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: `/site/${slug}` },
  ]

  // Add current page if not homepage
  if (currentPage && !currentPage.is_homepage) {
    breadcrumbItems.push({
      name: currentPage.title,
      url: pageUrl,
    })
  }

  return (
    <>
      {/* Structured Data for SEO */}
      {organizationSchema && <StructuredData data={organizationSchema} />}
      {webPageSchema && <StructuredData data={webPageSchema} />}

      <div className="min-h-screen" style={themeStyles}>
        {/* Skip to main content - Accessibility */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        {/* Render navigation header if no header section exists in page */}
        {!hasHeaderSection && (
          <HeaderSection
            content={{
              logo: website?.theme?.logo,
              brandName: website?.brand_name || website?.name,
              menuItems,
              ctaText: 'Get Started',
              ctaHref: '/contact',
            }}
            editable={false}
          />
        )}

        {/* Breadcrumb Navigation - Only show on non-homepage pages */}
        {currentPage && !currentPage.is_homepage && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
        )}

        {/* Render all sections */}
        <main id="main-content">
          {sections.map(section => renderSection(section))}
        </main>
      </div>
    </>
  )
}

export default function PublicSitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <PublicSiteContent />
    </Suspense>
  )
}
