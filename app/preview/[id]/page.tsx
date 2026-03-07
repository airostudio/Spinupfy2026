'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Globe, Loader2, Eye, EyeOff, Check, Copy, ExternalLink, AlertCircle, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui'
import { PublishProgressModal } from '@/components/PublishProgressModal'
import {
  HeroSection,
  FeaturesSection,
  CTASection,
  ContactSection,
  PricingSection,
  HeaderSection,
  FooterSection,
  AboutSection,
  ServicesSection,
  TestimonialsSection,
  TeamSection,
  BookingSection,
  StoreSection,
  TrustBadgesSection,
  MobileStickyCtaSection,
  LoanCalculatorSection,
  FloatingCtaSection,
  MenuSection,
} from '@/components/sections'

export default function PreviewPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const websiteId = params.id as string

  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [website, setWebsite] = useState<any>(null)
  const [pages, setPages] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])

  useEffect(() => {
    loadWebsite()
  }, [websiteId])

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load website
      const { data: websiteData, error: websiteError } = await supabase
        .from('websites')
        .select('*')
        .eq('id', websiteId)
        .eq('user_id', user.id)
        .single()

      if (websiteError) throw websiteError

      // Load pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('pages')
        .select('*')
        .eq('website_id', websiteId)
        .order('order', { ascending: true })

      if (pagesError) throw pagesError

      // Load sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .in('page_id', (pagesData || []).map(p => p.id))
        .order('order', { ascending: true })

      if (sectionsError) throw sectionsError

      setWebsite(websiteData)
      setPages(pagesData || [])
      setSections(sectionsData || [])
    } catch (error) {
      console.error('Error loading website:', error)
      toast.error('Failed to load website')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  function handlePublish() {
    setShowPublishModal(true)
  }

  function handlePublishComplete(publishedUrl: string) {
    // Update local state
    setWebsite({ ...website, published: true, published_url: publishedUrl })
  }

  async function handleUnpublish() {
    try {
      const response = await fetch('/api/websites/publish', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to unpublish')
      }

      setWebsite({ ...website, published: false })
      toast.success('Website unpublished')
    } catch (error) {
      console.error('Error unpublishing website:', error)
      toast.error('Failed to unpublish website')
    }
  }

  const copyUrl = () => {
    const url = `${window.location.origin}/site/${website?.slug}`
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard!')
  }

  // Build menu items from sections for proper navigation
  const buildMenuItems = (sectionsList: any[]) => {
    const items: Array<{ label: string; href: string }> = [{ label: 'Home', href: '/' }]

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

    // Add anchor links for linkable sections
    const linkableSections = sectionsList.filter(s =>
      sectionTypeLabels[s.type] &&
      s.type !== 'HEADER' &&
      s.type !== 'FOOTER' &&
      s.type !== 'HERO' &&
      s.type !== 'CTA' &&
      s.type !== 'TRUST_BADGES' &&
      s.type !== 'MOBILE_STICKY_CTA' &&
      s.type !== 'FLOATING_CTA' &&
      s.visible
    )

    linkableSections.forEach(section => {
      const label = sectionTypeLabels[section.type] || section.type
      const anchor = section.type.toLowerCase().replace(/_/g, '-')
      if (!items.some(item => item.label === label)) {
        items.push({ label, href: `#${anchor}` })
      }
    })

    return items
  }

  // Track if we've rendered a hero for SEO heading hierarchy
  let hasRenderedHero = false

  // Generate anchor ID from section type
  const getSectionAnchorId = (type: string) => type.toLowerCase().replace(/_/g, '-')

  const renderSection = (section: any, menuItems: Array<{ label: string; href: string }>) => {
    if (!section.visible) return null

    // Inject menu items into header section
    const content = section.type === 'HEADER'
      ? { ...section.content, menuItems }
      : section.content

    const sectionProps = {
      content,
      editable: false,
    }

    // Generate anchor ID for this section
    const anchorId = getSectionAnchorId(section.type)

    // Wrapper to add anchor ID to sections
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
        return <HeaderSection key={section.id} {...sectionProps} />
      case 'HERO':
        const isFirstHero = !hasRenderedHero
        hasRenderedHero = true
        return withAnchor(<HeroSection {...sectionProps} isFirstSection={isFirstHero} />)
      case 'FEATURES':
        return withAnchor(<FeaturesSection {...sectionProps} settings={section.settings} />)
      case 'ABOUT':
        return withAnchor(<AboutSection {...sectionProps} />)
      case 'SERVICES':
        return withAnchor(<ServicesSection {...sectionProps} />)
      case 'TESTIMONIALS':
        return withAnchor(<TestimonialsSection {...sectionProps} />)
      case 'TEAM':
        return withAnchor(<TeamSection {...sectionProps} />)
      case 'CTA':
        return withAnchor(<CTASection {...sectionProps} />)
      case 'CONTACT':
        return withAnchor(<ContactSection {...sectionProps} />)
      case 'PRICING':
        return withAnchor(<PricingSection {...sectionProps} />)
      case 'BOOKING':
        return withAnchor(<BookingSection {...sectionProps} websiteId={websiteId} />)
      case 'STORE':
        return withAnchor(<StoreSection content={section.content} />)
      case 'TRUST_BADGES':
        return withAnchor(<TrustBadgesSection {...sectionProps} />)
      case 'MOBILE_STICKY_CTA':
        return <MobileStickyCtaSection key={section.id} {...sectionProps} />
      case 'LOAN_CALCULATOR':
        return withAnchor(
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
        )
      case 'FLOATING_CTA':
        return <FloatingCtaSection key={section.id} content={section.content} />
      case 'MENU':
        return withAnchor(<MenuSection content={section.content} settings={section.settings} />)
      case 'GALLERY':
        return withAnchor(
          <FeaturesSection content={{
            title: section.content?.title || 'Gallery',
            subtitle: section.content?.subtitle || '',
            features: (section.content?.images || []).map((img: any, idx: number) => ({
              title: img.alt || `Image ${idx + 1}`,
              description: img.caption || '',
              image: img.url || img,
            })),
          }} settings={{ layout: 'grid' }} />
        )
      case 'PORTFOLIO':
        return withAnchor(
          <FeaturesSection content={{
            title: section.content?.title || 'Our Work',
            subtitle: section.content?.subtitle || 'Featured Projects',
            features: (section.content?.items || []).map((item: any) => ({
              title: item.title,
              description: item.description,
              image: item.image,
            })),
          }} settings={{ layout: 'grid' }} />
        )
      case 'HOW_IT_WORKS':
        return withAnchor(<FeaturesSection {...sectionProps} settings={section.settings} />)
      case 'FAQ':
        return withAnchor(
          <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)' }}>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--color-text-heading, #1f2937)' }}>
                {section.content?.title || 'Frequently Asked Questions'}
              </h2>
              <div className="space-y-4">
                {(section.content?.items || []).map((item: any, idx: number) => (
                  <details key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <summary className="p-4 cursor-pointer font-medium" style={{ color: 'var(--color-text-heading, #1f2937)' }}>
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
        return <FooterSection key={section.id} {...sectionProps} />
      case 'ADVANCED_STORE':
        return withAnchor(<StoreSection content={section.content} />)
      default:
        console.warn(`Unknown section type: ${section.type}`)
        return null
    }
  }

  const homepage = pages.find(p => p.is_homepage)
  const homepageSections = sections
    .filter(s => s.page_id === homepage?.id && s.visible)
    .sort((a, b) => a.order - b.order)

  // Generate CSS variables for comprehensive theme color system and fonts
  const fontHeading = website?.theme?.fontHeading || 'Inter'
  const fontBody = website?.theme?.fontBody || 'Inter'

  const theme = website?.theme
  const themeStyles = (theme ? {
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
    '--font-heading': `'${fontHeading}', system-ui, -apple-system, sans-serif`,
    '--font-body': `'${fontBody}', system-ui, -apple-system, sans-serif`,
  } : {}) as React.CSSProperties

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading preview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Preview Header */}
      <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push(`/editor/${websiteId}`)}
            >
              Back to Editor
            </Button>
            <div className="h-6 w-px bg-gray-700" />
            <div>
              <h1 className="text-white font-semibold">{website?.name}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {website?.published ? (
                  <div className="flex items-center gap-1 text-green-400">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    Published
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    Draft
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {website?.published && (
              <>
                <div className="px-3 py-1.5 bg-white/5 rounded-lg flex items-center gap-2 text-sm text-gray-300">
                  <Globe className="w-4 h-4" />
                  <span className="max-w-xs truncate">{window.location.origin}/site/{website?.slug}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Copy className="w-4 h-4" />}
                  onClick={copyUrl}
                >
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ExternalLink className="w-4 h-4" />}
                  onClick={() => window.open(`/site/${website?.slug}`, '_blank')}
                >
                  Open
                </Button>
                <div className="h-6 w-px bg-gray-700" />
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<EyeOff className="w-4 h-4" />}
                  onClick={handleUnpublish}
                >
                  Unpublish
                </Button>
              </>
            )}
            {!website?.published && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Globe className="w-4 h-4" />}
                onClick={handlePublish}
              >
                Publish Website
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Temporary Images Warning (for unpublished sites) */}
      {!website?.published && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-200 mb-1">
                  Temporary Images - Publish to Save
                </h3>
                <p className="text-sm text-yellow-100/90">
                  Your images are temporary (DALL-E URLs expire in ~1 hour). <strong>Publish your website to save them permanently.</strong> Unpublished drafts older than 7 days are automatically deleted.
                </p>
              </div>
              <Clock className="w-5 h-5 text-yellow-500/60 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* Preview Content */}
      <main className="min-h-screen" style={themeStyles}>
        {homepageSections.length > 0 ? (
          <div>
            {(() => {
              // Build menu items once for all sections
              const menuItems = buildMenuItems(homepageSections)
              return homepageSections.map(section => renderSection(section, menuItems))
            })()}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Eye className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-400 mb-2">No Content Yet</h2>
              <p className="text-gray-500 mb-6">
                Add sections to your website in the editor first
              </p>
              <Button
                variant="primary"
                leftIcon={<ArrowLeft className="w-5 h-5" />}
                onClick={() => router.push(`/editor/${websiteId}`)}
              >
                Go to Editor
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Publish Progress Modal */}
      <PublishProgressModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        websiteId={websiteId}
        websiteName={website?.name || 'Your Website'}
        onPublishComplete={handlePublishComplete}
      />
    </div>
  )
}
