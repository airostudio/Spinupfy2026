/**
 * Dynamic Layout Generator
 *
 * Generates website layouts dynamically based on competitor research,
 * industry best practices, and business requirements.
 *
 * No more static layouts - every website is unique based on what
 * top performers in the industry are doing.
 */

import { CompetitorInsights } from './competitor-research'
import { BusinessAnalysis } from './business-analyzer'

export interface SectionConfig {
  type: string
  order: number
  visible: boolean
  layout?: string // Layout variant for the section
  settings?: Record<string, any>
}

export interface DynamicLayout {
  sections: SectionConfig[]
  theme: {
    style: 'minimal' | 'bold' | 'elegant' | 'playful' | 'corporate'
    colorScheme: 'light' | 'dark' | 'mixed'
    spacing: 'compact' | 'normal' | 'spacious'
  }
  navigation: {
    style: 'transparent' | 'solid' | 'floating'
    position: 'top' | 'side'
    sticky: boolean
  }
  hero: {
    style: 'fullscreen' | 'split' | 'centered' | 'video' | 'slider'
    imagePosition: 'background' | 'side' | 'overlay'
    ctaStyle: 'single' | 'dual' | 'form'
  }
  features: {
    layout: 'grid' | 'bento' | 'alternating' | 'cards' | 'icons'
    columns: 2 | 3 | 4
  }
}

/**
 * Industry-specific layout patterns based on research
 */
const INDUSTRY_LAYOUT_PATTERNS: Record<string, Partial<DynamicLayout>> = {
  'restaurant': {
    theme: { style: 'elegant', colorScheme: 'dark', spacing: 'spacious' },
    hero: { style: 'fullscreen', imagePosition: 'background', ctaStyle: 'dual' },
    features: { layout: 'grid', columns: 3 },
    sections: [
      { type: 'HEADER', order: -1, visible: true, settings: { transparent: true, sticky: true } },
      { type: 'HERO', order: 0, visible: true, layout: 'fullscreen' },
      { type: 'FEATURES', order: 1, visible: true, layout: 'grid' }, // Menu highlights
      { type: 'ABOUT', order: 2, visible: true, layout: 'split-image' },
      { type: 'GALLERY', order: 3, visible: true, layout: 'masonry' },
      { type: 'TESTIMONIALS', order: 4, visible: true, layout: 'featured' },
      { type: 'BOOKING', order: 5, visible: true, layout: 'side-panel' },
      { type: 'CONTACT', order: 6, visible: true },
      { type: 'FOOTER', order: 100, visible: true },
    ]
  },
  'tech-saas': {
    theme: { style: 'minimal', colorScheme: 'light', spacing: 'spacious' },
    hero: { style: 'split', imagePosition: 'side', ctaStyle: 'dual' },
    features: { layout: 'bento', columns: 3 },
    sections: [
      { type: 'HEADER', order: -1, visible: true, settings: { transparent: false, sticky: true } },
      { type: 'HERO', order: 0, visible: true, layout: 'split' },
      { type: 'FEATURES', order: 1, visible: true, layout: 'bento' },
      { type: 'HOW_IT_WORKS', order: 2, visible: true, layout: 'steps' },
      { type: 'PRICING', order: 3, visible: true, layout: 'cards' },
      { type: 'TESTIMONIALS', order: 4, visible: true, layout: 'grid' },
      { type: 'CTA', order: 5, visible: true, layout: 'centered' },
      { type: 'FAQ', order: 6, visible: true },
      { type: 'FOOTER', order: 100, visible: true },
    ]
  },
  'law-firm': {
    theme: { style: 'corporate', colorScheme: 'dark', spacing: 'normal' },
    hero: { style: 'centered', imagePosition: 'background', ctaStyle: 'single' },
    features: { layout: 'icons', columns: 3 },
    sections: [
      { type: 'HEADER', order: -1, visible: true, settings: { transparent: true, sticky: true } },
      { type: 'HERO', order: 0, visible: true, layout: 'centered' },
      { type: 'SERVICES', order: 1, visible: true, layout: 'cards' },
      { type: 'ABOUT', order: 2, visible: true, layout: 'stats' },
      { type: 'TEAM', order: 3, visible: true, layout: 'grid' },
      { type: 'TESTIMONIALS', order: 4, visible: true, layout: 'featured' },
      { type: 'CONTACT', order: 5, visible: true },
      { type: 'FOOTER', order: 100, visible: true },
    ]
  },
  'real-estate': {
    theme: { style: 'elegant', colorScheme: 'light', spacing: 'spacious' },
    hero: { style: 'fullscreen', imagePosition: 'background', ctaStyle: 'form' },
    features: { layout: 'cards', columns: 3 },
    sections: [
      { type: 'HEADER', order: -1, visible: true, settings: { transparent: true, sticky: true } },
      { type: 'HERO', order: 0, visible: true, layout: 'fullscreen-search' },
      { type: 'FEATURES', order: 1, visible: true, layout: 'cards' }, // Featured listings
      { type: 'ABOUT', order: 2, visible: true, layout: 'split-image' },
      { type: 'SERVICES', order: 3, visible: true, layout: 'icons' },
      { type: 'TESTIMONIALS', order: 4, visible: true, layout: 'slider' },
      { type: 'TEAM', order: 5, visible: true, layout: 'featured' },
      { type: 'CONTACT', order: 6, visible: true },
      { type: 'FOOTER', order: 100, visible: true },
    ]
  },
  'fitness': {
    theme: { style: 'bold', colorScheme: 'dark', spacing: 'compact' },
    hero: { style: 'video', imagePosition: 'background', ctaStyle: 'dual' },
    features: { layout: 'grid', columns: 4 },
    sections: [
      { type: 'HEADER', order: -1, visible: true, settings: { transparent: true, sticky: true } },
      { type: 'HERO', order: 0, visible: true, layout: 'video' },
      { type: 'FEATURES', order: 1, visible: true, layout: 'grid' }, // Class types
      { type: 'ABOUT', order: 2, visible: true, layout: 'stats' },
      { type: 'PRICING', order: 3, visible: true, layout: 'cards' },
      { type: 'TEAM', order: 4, visible: true, layout: 'carousel' }, // Trainers
      { type: 'TESTIMONIALS', order: 5, visible: true, layout: 'grid' },
      { type: 'BOOKING', order: 6, visible: true },
      { type: 'CONTACT', order: 7, visible: true },
      { type: 'FOOTER', order: 100, visible: true },
    ]
  },
  'beauty-spa': {
    theme: { style: 'elegant', colorScheme: 'light', spacing: 'spacious' },
    hero: { style: 'split', imagePosition: 'side', ctaStyle: 'single' },
    features: { layout: 'alternating', columns: 2 },
    sections: [
      { type: 'HEADER', order: -1, visible: true, settings: { transparent: true, sticky: true } },
      { type: 'HERO', order: 0, visible: true, layout: 'split' },
      { type: 'SERVICES', order: 1, visible: true, layout: 'cards' },
      { type: 'ABOUT', order: 2, visible: true, layout: 'story' },
      { type: 'GALLERY', order: 3, visible: true, layout: 'grid' },
      { type: 'PRICING', order: 4, visible: true, layout: 'menu' },
      { type: 'TESTIMONIALS', order: 5, visible: true, layout: 'featured' },
      { type: 'BOOKING', order: 6, visible: true },
      { type: 'CONTACT', order: 7, visible: true },
      { type: 'FOOTER', order: 100, visible: true },
    ]
  },
  'ecommerce': {
    theme: { style: 'minimal', colorScheme: 'light', spacing: 'compact' },
    hero: { style: 'slider', imagePosition: 'background', ctaStyle: 'dual' },
    features: { layout: 'grid', columns: 4 },
    sections: [
      { type: 'HEADER', order: -1, visible: true, settings: { transparent: false, sticky: true, showCart: true } },
      { type: 'HERO', order: 0, visible: true, layout: 'slider' },
      { type: 'STORE', order: 1, visible: true, layout: 'featured-products' },
      { type: 'FEATURES', order: 2, visible: true, layout: 'icons' }, // Benefits
      { type: 'TESTIMONIALS', order: 3, visible: true, layout: 'grid' },
      { type: 'CTA', order: 4, visible: true, layout: 'newsletter' },
      { type: 'FOOTER', order: 100, visible: true },
    ]
  },
  'creative-agency': {
    theme: { style: 'bold', colorScheme: 'mixed', spacing: 'spacious' },
    hero: { style: 'fullscreen', imagePosition: 'background', ctaStyle: 'single' },
    features: { layout: 'bento', columns: 3 },
    sections: [
      { type: 'HEADER', order: -1, visible: true, settings: { transparent: true, sticky: true } },
      { type: 'HERO', order: 0, visible: true, layout: 'statement' },
      { type: 'PORTFOLIO', order: 1, visible: true, layout: 'showcase' },
      { type: 'SERVICES', order: 2, visible: true, layout: 'bento' },
      { type: 'ABOUT', order: 3, visible: true, layout: 'team-focused' },
      { type: 'TESTIMONIALS', order: 4, visible: true, layout: 'featured' },
      { type: 'CTA', order: 5, visible: true, layout: 'bold' },
      { type: 'CONTACT', order: 6, visible: true },
      { type: 'FOOTER', order: 100, visible: true },
    ]
  },
  'photography': {
    theme: { style: 'minimal', colorScheme: 'dark', spacing: 'spacious' },
    hero: { style: 'fullscreen', imagePosition: 'background', ctaStyle: 'single' },
    features: { layout: 'grid', columns: 3 },
    sections: [
      { type: 'HEADER', order: -1, visible: true, settings: { transparent: true, sticky: true, minimal: true } },
      { type: 'HERO', order: 0, visible: true, layout: 'fullscreen' },
      { type: 'PORTFOLIO', order: 1, visible: true, layout: 'masonry' },
      { type: 'ABOUT', order: 2, visible: true, layout: 'minimal' },
      { type: 'SERVICES', order: 3, visible: true, layout: 'packages' },
      { type: 'TESTIMONIALS', order: 4, visible: true, layout: 'minimal' },
      { type: 'BOOKING', order: 5, visible: true },
      { type: 'CONTACT', order: 6, visible: true },
      { type: 'FOOTER', order: 100, visible: true },
    ]
  },
  'healthcare': {
    theme: { style: 'corporate', colorScheme: 'light', spacing: 'normal' },
    hero: { style: 'split', imagePosition: 'side', ctaStyle: 'dual' },
    features: { layout: 'icons', columns: 3 },
    sections: [
      { type: 'HEADER', order: -1, visible: true, settings: { transparent: false, sticky: true } },
      { type: 'HERO', order: 0, visible: true, layout: 'split' },
      { type: 'SERVICES', order: 1, visible: true, layout: 'cards' },
      { type: 'ABOUT', order: 2, visible: true, layout: 'stats' },
      { type: 'TEAM', order: 3, visible: true, layout: 'grid' },
      { type: 'TESTIMONIALS', order: 4, visible: true, layout: 'featured' },
      { type: 'BOOKING', order: 5, visible: true },
      { type: 'FAQ', order: 6, visible: true },
      { type: 'CONTACT', order: 7, visible: true },
      { type: 'FOOTER', order: 100, visible: true },
    ]
  }
}

/**
 * UX Best Practices Configuration
 * Based on latest 2024-2025 web design standards and research
 */
const UX_BEST_PRACTICES = {
  // Mobile-first considerations
  mobile: {
    touchTargetMinSize: 44, // pixels - minimum tap target size
    maxContentWidth: 600,   // mobile content width
    scrollIndicators: true, // show scroll hints
    stickyNav: true,        // sticky navigation on mobile
    bottomCTA: true         // sticky CTA at bottom for conversions
  },

  // Navigation UX
  navigation: {
    maxTopLevelItems: 7,    // 7±2 rule for cognitive load
    logoPosition: 'left',   // standard expectation
    ctaPosition: 'right',   // conversion-focused placement
    searchVisible: true,    // for content-heavy sites
    mobileMenu: 'hamburger' // standard mobile pattern
  },

  // Hero section UX
  hero: {
    clearValueProp: true,   // clear value proposition above fold
    singlePrimaryCTA: true, // one clear primary action
    maxCTAs: 2,            // don't overwhelm with choices
    contrastRatio: 4.5,     // WCAG AA standard
    loadTimeTarget: 3       // seconds - LCP target
  },

  // Content hierarchy
  content: {
    visualHierarchy: true,  // clear heading structure
    scannable: true,        // F-pattern / Z-pattern friendly
    whiteSpace: 'generous', // breathing room
    lineLength: { min: 45, max: 75 }, // characters per line
    paragraphLength: 3      // max sentences for web
  },

  // Conversion optimization
  conversion: {
    ctaAboveFold: true,     // primary CTA visible without scroll
    socialProof: 'early',   // testimonials/logos early in page
    trustSignals: true,     // badges, certifications, guarantees
    contactAccessible: true,// contact always 1-click away
    clearPricing: true      // transparent pricing if applicable
  },

  // Accessibility
  accessibility: {
    wcagLevel: 'AA',        // minimum compliance level
    focusIndicators: true,  // visible focus states
    altText: true,          // all images need alt text
    skipLinks: true,        // skip to main content
    colorContrast: 4.5      // text contrast ratio
  },

  // Performance
  performance: {
    lazyLoading: true,      // lazy load below-fold content
    criticalCSS: true,      // inline critical CSS
    imageOptimization: true,// WebP, responsive images
    cacheStrategy: true     // proper caching headers
  }
}

/**
 * Section order recommendations for optimal UX flow
 * Based on user attention patterns and conversion research
 */
const OPTIMAL_SECTION_ORDER = [
  { type: 'HEADER', order: -1, reason: 'Navigation always first' },
  { type: 'HERO', order: 0, reason: 'Value proposition above fold' },
  { type: 'FEATURES', order: 1, reason: 'Benefits after hook' },
  { type: 'SERVICES', order: 3, reason: 'What you offer' },
  { type: 'PORTFOLIO', order: 3, reason: 'Show don\'t tell' },
  { type: 'STORE', order: 3, reason: 'Products for ecommerce' },
  { type: 'ABOUT', order: 4, reason: 'Story builds connection' },
  { type: 'TEAM', order: 5, reason: 'Human element' },
  { type: 'PRICING', order: 5, reason: 'After value established' },
  { type: 'LOAN_CALCULATOR', order: 5, reason: 'Interactive engagement' },
  { type: 'TESTIMONIALS', order: 6, reason: 'Social proof before CTA' },
  { type: 'FAQ', order: 7, reason: 'Address objections' },
  { type: 'BOOKING', order: 8, reason: 'Conversion point' },
  { type: 'CTA', order: 8, reason: 'Final conversion push' },
  { type: 'CONTACT', order: 9, reason: 'Alternative conversion' },
  { type: 'FOOTER', order: 100, reason: 'Standard page end' },
  { type: 'FLOATING_CTA', order: 101, reason: 'Persistent conversion' },
  { type: 'MOBILE_STICKY_CTA', order: 102, reason: 'Mobile conversion' }
]

/**
 * Ensure section ordering follows UX best practices
 */
function ensureUXCompliantOrdering(sections: SectionConfig[]): SectionConfig[] {
  return sections.map(section => {
    const recommended = OPTIMAL_SECTION_ORDER.find(s => s.type === section.type)
    if (recommended && section.order !== recommended.order) {
      // Use recommended order if current order would disrupt UX flow
      // But don't override if there's a good reason (e.g., business-specific needs)
      if (section.order === 0 && section.type !== 'HERO') {
        return { ...section, order: recommended.order }
      }
    }
    return section
  }).sort((a, b) => a.order - b.order)
}

/**
 * Apply UX best practices to layout configuration
 */
function applyUXBestPractices(layout: DynamicLayout): DynamicLayout {
  const enhanced = { ...layout }

  // Ensure sections follow optimal ordering
  enhanced.sections = ensureUXCompliantOrdering(enhanced.sections)

  // Ensure hero has clear CTA
  if (!enhanced.hero.ctaStyle) {
    enhanced.hero.ctaStyle = 'dual' // Primary + Secondary CTA pattern
  }

  // Ensure navigation is sticky for better UX
  enhanced.navigation.sticky = true

  // Ensure proper spacing for readability
  if (enhanced.theme.spacing === 'compact') {
    // Compact spacing can hurt readability - use normal as minimum
    enhanced.theme.spacing = 'normal'
  }

  // Ensure mobile-friendly features are enabled
  const hasMobileCTA = enhanced.sections.some(s => s.type === 'MOBILE_STICKY_CTA')
  if (!hasMobileCTA) {
    enhanced.sections.push({
      type: 'MOBILE_STICKY_CTA',
      order: 102,
      visible: true,
      settings: { showAfterScroll: 300 }
    })
  }

  return enhanced
}

/**
 * Default layout for unknown business types
 */
const DEFAULT_LAYOUT: DynamicLayout = {
  theme: { style: 'minimal', colorScheme: 'light', spacing: 'normal' },
  navigation: { style: 'solid', position: 'top', sticky: true },
  hero: { style: 'centered', imagePosition: 'background', ctaStyle: 'dual' },
  features: { layout: 'grid', columns: 3 },
  sections: [
    { type: 'HEADER', order: -1, visible: true },
    { type: 'HERO', order: 0, visible: true },
    { type: 'FEATURES', order: 1, visible: true },
    { type: 'ABOUT', order: 2, visible: true },
    { type: 'TESTIMONIALS', order: 3, visible: true },
    { type: 'CTA', order: 4, visible: true },
    { type: 'CONTACT', order: 5, visible: true },
    { type: 'FOOTER', order: 100, visible: true },
  ]
}

/**
 * Generate dynamic layout based on competitor insights and business analysis
 */
export function generateDynamicLayout(params: {
  businessType: string
  businessAnalysis: BusinessAnalysis
  competitorInsights?: CompetitorInsights
}): DynamicLayout {
  const { businessType, businessAnalysis, competitorInsights } = params

  // Start with industry-specific base layout
  let baseLayout = INDUSTRY_LAYOUT_PATTERNS[businessType] || DEFAULT_LAYOUT
  let sections = [...(baseLayout.sections || DEFAULT_LAYOUT.sections)]

  // Adapt based on business analysis
  sections = adaptSectionsForBusiness(sections, businessAnalysis)

  // Adapt based on competitor insights if available
  if (competitorInsights) {
    sections = adaptSectionsForCompetitors(sections, competitorInsights)
  }

  // Determine theme based on analysis
  const theme = determineTheme(businessType, businessAnalysis, competitorInsights)

  // Configure hero style
  const hero = determineHeroStyle(businessType, businessAnalysis, competitorInsights)

  // Configure features layout
  const features = determineFeaturesLayout(businessType, businessAnalysis, competitorInsights)

  // Configure navigation
  const navigation = determineNavigation(businessType, theme)

  // Build initial layout
  const initialLayout: DynamicLayout = {
    sections: sections.sort((a, b) => a.order - b.order),
    theme,
    navigation,
    hero,
    features
  }

  // Apply UX best practices to ensure compliance with modern standards
  const uxOptimizedLayout = applyUXBestPractices(initialLayout)

  console.log(`Generated UX-compliant layout: ${uxOptimizedLayout.sections.length} sections, theme: ${uxOptimizedLayout.theme.style}, hero: ${uxOptimizedLayout.hero.style}`)

  return uxOptimizedLayout
}

/**
 * Adapt sections based on business analysis
 */
function adaptSectionsForBusiness(
  sections: SectionConfig[],
  analysis: BusinessAnalysis
): SectionConfig[] {
  const adapted = [...sections]

  // Add booking section if needed
  if (analysis.needsBooking && !adapted.find(s => s.type === 'BOOKING')) {
    adapted.push({
      type: 'BOOKING',
      order: 6,
      visible: true,
      layout: getBookingLayoutForType(analysis.bookingType || 'appointment')
    })
  }

  // Add store section if e-commerce needed
  if (analysis.needsEcommerce && !adapted.find(s => s.type === 'STORE')) {
    adapted.push({
      type: 'STORE',
      order: 2,
      visible: true,
      layout: 'featured-products'
    })
  }

  // Add pricing section if needed
  if (analysis.needsPricing && !adapted.find(s => s.type === 'PRICING')) {
    adapted.push({
      type: 'PRICING',
      order: 4,
      visible: true,
      layout: 'cards'
    })
  }

  // Add portfolio section if needed
  if (analysis.needsPortfolio && !adapted.find(s => s.type === 'PORTFOLIO')) {
    adapted.push({
      type: 'PORTFOLIO',
      order: 2,
      visible: true,
      layout: 'masonry'
    })
  }

  // Add services section if needed
  if (analysis.needsServices && !adapted.find(s => s.type === 'SERVICES')) {
    adapted.push({
      type: 'SERVICES',
      order: 3,
      visible: true,
      layout: 'cards'
    })
  }

  // Add team section for service businesses
  if (analysis.businessModel === 'B2C' && !adapted.find(s => s.type === 'TEAM')) {
    // Only add team for certain business types
    const teamBusinesses = ['law-firm', 'healthcare', 'real-estate', 'creative-agency', 'consulting']
    if (teamBusinesses.some(t => analysis.primaryCategory?.toLowerCase().includes(t))) {
      adapted.push({
        type: 'TEAM',
        order: 4,
        visible: true,
        layout: 'grid'
      })
    }
  }

  // Add loan calculator for finance/mortgage businesses
  if (analysis.needsCalculator && !adapted.find(s => s.type === 'LOAN_CALCULATOR')) {
    adapted.push({
      type: 'LOAN_CALCULATOR',
      order: 3, // After services/features
      visible: true,
      settings: {
        calculatorType: analysis.calculatorType || 'loan'
      }
    })
  }

  // Add floating CTA for service businesses that benefit from prominent CTAs
  if (analysis.consultationCta?.floatingCta && !adapted.find(s => s.type === 'FLOATING_CTA')) {
    adapted.push({
      type: 'FLOATING_CTA',
      order: 102, // After everything else
      visible: true,
      settings: {
        position: 'bottom-right',
        showAfterScroll: 400
      }
    })
  }

  // Add mobile sticky CTA for conversion
  adapted.push({
    type: 'MOBILE_STICKY_CTA',
    order: 101,
    visible: true,
    settings: {
      showAfterScroll: 300,
      ctaType: analysis.needsBooking ? 'calendar' : analysis.needsEcommerce ? 'shop' : 'arrow'
    }
  })

  return adapted
}

/**
 * Adapt sections based on competitor insights
 */
function adaptSectionsForCompetitors(
  sections: SectionConfig[],
  insights: CompetitorInsights
): SectionConfig[] {
  const adapted = [...sections]

  // Add sections that competitors commonly have
  for (const commonSection of insights.industryInsights.commonSections) {
    const sectionType = mapCommonSectionToType(commonSection)
    if (sectionType && !adapted.find(s => s.type === sectionType)) {
      adapted.push({
        type: sectionType,
        order: getOrderForSectionType(sectionType),
        visible: true
      })
    }
  }

  // Adjust layouts based on competitor patterns
  for (const section of adapted) {
    if (section.type === 'FEATURES' && insights.designPatterns.layoutStyles.includes('bento grid')) {
      section.layout = 'bento'
    }
    if (section.type === 'TESTIMONIALS' && insights.contentPatterns.testimonialStyles.includes('testimonials with photos')) {
      section.layout = 'featured'
    }
  }

  return adapted
}

/**
 * Determine theme based on various factors
 */
function determineTheme(
  businessType: string,
  analysis: BusinessAnalysis,
  insights?: CompetitorInsights
): DynamicLayout['theme'] {
  // Start with industry default
  const baseTheme = INDUSTRY_LAYOUT_PATTERNS[businessType]?.theme || DEFAULT_LAYOUT.theme

  // Adjust based on design mood from analysis
  let style = baseTheme.style
  switch (analysis.designMood) {
    case 'luxury':
      style = 'elegant'
      break
    case 'professional':
      style = 'corporate'
      break
    case 'friendly':
      style = 'playful'
      break
    case 'creative':
      style = 'playful'
      break
    case 'bold':
    case 'energetic':
      style = 'bold'
      break
    case 'minimal':
    case 'calm':
      style = 'minimal'
      break
  }

  // Adjust color scheme based on price point
  let colorScheme = baseTheme.colorScheme
  if (analysis.pricePoint === 'luxury' || analysis.pricePoint === 'premium') {
    colorScheme = 'dark'
  }

  // Use competitor insights if available
  if (insights?.designPatterns?.commonColors && insights.designPatterns.commonColors.length > 0) {
    // Check if competitors tend toward dark themes
    const darkColors = insights.designPatterns.commonColors.filter(c =>
      c.startsWith('#0') || c.startsWith('#1') || c.startsWith('#2')
    )
    if (darkColors.length > insights.designPatterns.commonColors.length / 2) {
      colorScheme = 'dark'
    }
  }

  return { style, colorScheme, spacing: baseTheme.spacing }
}

/**
 * Determine hero style
 */
function determineHeroStyle(
  businessType: string,
  analysis: BusinessAnalysis,
  insights?: CompetitorInsights
): DynamicLayout['hero'] {
  const baseHero = INDUSTRY_LAYOUT_PATTERNS[businessType]?.hero || DEFAULT_LAYOUT.hero

  // Adjust CTA style based on business needs
  let ctaStyle = baseHero.ctaStyle
  if (analysis.needsBooking) {
    ctaStyle = 'form' // Inline booking form
  } else if (analysis.needsEcommerce) {
    ctaStyle = 'dual' // Shop now + Learn more
  }

  // Adjust image position based on competitor patterns
  let imagePosition = baseHero.imagePosition
  if (insights?.designPatterns?.heroStyles?.includes('full-width hero image')) {
    imagePosition = 'background'
  }

  return { ...baseHero, ctaStyle, imagePosition }
}

/**
 * Determine features layout
 */
function determineFeaturesLayout(
  businessType: string,
  analysis: BusinessAnalysis,
  insights?: CompetitorInsights
): DynamicLayout['features'] {
  const baseFeatures = INDUSTRY_LAYOUT_PATTERNS[businessType]?.features || DEFAULT_LAYOUT.features

  // Use bento grid for modern tech companies
  if (businessType === 'tech-saas' || analysis.designMood === 'minimal') {
    return { layout: 'bento', columns: 3 }
  }

  // Use alternating layout for storytelling businesses
  if (analysis.designMood === 'luxury' || businessType === 'beauty-spa') {
    return { layout: 'alternating', columns: 2 }
  }

  // Check competitor patterns
  if (insights?.designPatterns?.layoutStyles?.includes('card-based layouts')) {
    return { layout: 'cards', columns: 3 }
  }

  return baseFeatures
}

/**
 * Determine navigation style
 */
function determineNavigation(
  businessType: string,
  theme: DynamicLayout['theme']
): DynamicLayout['navigation'] {
  // Transparent nav for dark themes with hero images
  const transparent = theme.colorScheme === 'dark' || theme.style === 'elegant'

  return {
    style: transparent ? 'transparent' : 'solid',
    position: 'top',
    sticky: true
  }
}

/**
 * Get booking layout based on booking type
 */
function getBookingLayoutForType(bookingType: string): string {
  switch (bookingType) {
    case 'table':
      return 'restaurant'
    case 'appointment':
      return 'calendar'
    case 'class':
      return 'schedule'
    case 'tour':
      return 'date-picker'
    default:
      return 'side-panel'
  }
}

/**
 * Map common section names to our section types
 */
function mapCommonSectionToType(sectionName: string): string | null {
  const mapping: Record<string, string> = {
    'about section': 'ABOUT',
    'services section': 'SERVICES',
    'contact section': 'CONTACT',
    'team section': 'TEAM',
    'portfolio section': 'PORTFOLIO',
    'blog section': 'BLOG',
    'testimonials section': 'TESTIMONIALS',
    'pricing section': 'PRICING',
    'faq section': 'FAQ',
    'gallery section': 'GALLERY',
    'image gallery section': 'GALLERY'
  }
  return mapping[sectionName.toLowerCase()] || null
}

/**
 * Get default order for a section type
 */
function getOrderForSectionType(type: string): number {
  const orderMap: Record<string, number> = {
    'HEADER': -1,
    'HERO': 0,
    'FEATURES': 1,
    'STORE': 1,
    'PORTFOLIO': 1,
    'ABOUT': 2,
    'SERVICES': 2,
    'HOW_IT_WORKS': 2,
    'TEAM': 3,
    'PRICING': 3,
    'GALLERY': 3,
    'TESTIMONIALS': 4,
    'BOOKING': 5,
    'CTA': 5,
    'FAQ': 6,
    'BLOG': 6,
    'CONTACT': 7,
    'FOOTER': 100
  }
  return orderMap[type] || 5
}

/**
 * Convert layout config to section content configuration
 */
export function applyLayoutToSections(
  layout: DynamicLayout,
  aiContent: any,
  businessAnalysis: BusinessAnalysis
): any[] {
  const sections: any[] = []

  for (const sectionConfig of layout.sections) {
    const section = buildSection(sectionConfig, layout, aiContent, businessAnalysis)
    if (section) {
      sections.push(section)
    }
  }

  return sections
}

/**
 * Build individual section with layout-specific configuration
 */
function buildSection(
  config: SectionConfig,
  layout: DynamicLayout,
  aiContent: any,
  analysis: BusinessAnalysis
): any | null {
  switch (config.type) {
    case 'HERO':
      return {
        type: 'HERO',
        order: config.order,
        visible: config.visible,
        content: aiContent.hero,
        settings: {
          layout: config.layout || layout.hero.style,
          imagePosition: layout.hero.imagePosition,
          ctaStyle: layout.hero.ctaStyle,
          fullHeight: layout.hero.style === 'fullscreen'
        }
      }

    case 'FEATURES':
      return {
        type: 'FEATURES',
        order: config.order,
        visible: config.visible,
        content: aiContent.features,
        settings: {
          layout: config.layout || layout.features.layout,
          columns: layout.features.columns
        }
      }

    case 'TESTIMONIALS':
      return {
        type: 'TESTIMONIALS',
        order: config.order,
        visible: config.visible,
        content: aiContent.testimonials,
        settings: {
          layout: config.layout || 'grid',
          showStats: true
        }
      }

    case 'PRICING':
      return analysis.needsPricing ? {
        type: 'PRICING',
        order: config.order,
        visible: config.visible,
        content: aiContent.pricing,
        settings: {
          layout: config.layout || 'cards',
          showGuarantee: true
        }
      } : null

    case 'BOOKING':
      return analysis.needsBooking ? {
        type: 'BOOKING',
        order: config.order,
        visible: config.visible,
        content: {
          heading: aiContent.booking?.heading || 'Book Your Appointment',
          subheading: aiContent.booking?.subheading || 'Reserve Your Spot',
          description: aiContent.booking?.description,
          bookingType: analysis.bookingType || 'appointment',
          buttonText: aiContent.booking?.buttonText || 'Confirm Booking'
        },
        settings: {
          layout: config.layout
        }
      } : null

    case 'STORE':
      return analysis.needsEcommerce ? {
        type: 'STORE',
        order: config.order,
        visible: config.visible,
        content: aiContent.store || {
          title: 'Our Products',
          subtitle: 'Featured Collection'
        },
        settings: {
          layout: config.layout || 'featured-products'
        }
      } : null

    case 'MOBILE_STICKY_CTA':
      return {
        type: 'MOBILE_STICKY_CTA',
        order: config.order,
        visible: config.visible,
        content: {
          primaryCTA: {
            text: analysis.needsBooking ? 'Book Now' : analysis.needsEcommerce ? 'Shop Now' : 'Get Started',
            href: analysis.needsBooking ? '#booking' : analysis.needsEcommerce ? '/shop' : '#contact',
            icon: analysis.needsBooking ? 'calendar' : analysis.needsEcommerce ? 'shop' : 'arrow'
          },
          showAfterScroll: config.settings?.showAfterScroll || 300
        }
      }

    default:
      // For other sections, return with default configuration
      return {
        type: config.type,
        order: config.order,
        visible: config.visible,
        content: aiContent[config.type.toLowerCase()] || {},
        settings: config.settings || {}
      }
  }
}
