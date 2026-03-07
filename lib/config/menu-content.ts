/**
 * Business-Type-Specific Menu Configuration
 * Maps business types to appropriate navigation menu items
 * Ensures only relevant menu items are generated for each business type
 *
 * IMPORTANT: Menu items use anchor links (#section) for homepage sections
 * This allows smooth scrolling to sections on the same page
 */

export interface MenuItemConfig {
  label: string
  href: string
  children?: MenuItemConfig[]
}

export interface MenuConfig {
  menuItems: MenuItemConfig[]
  ctaText: string
  ctaHref: string
}

/**
 * Converts a section type to an anchor href
 * e.g., 'Services' -> '#services', 'About' -> '#about'
 */
export function toAnchorHref(label: string): string {
  return `#${label.toLowerCase().replace(/\s+/g, '-')}`
}

/**
 * Business-type-specific menu configurations
 * Each configuration provides relevant navigation for that business type
 *
 * IMPORTANT: All section hrefs use anchor links (#section) to link to sections on the homepage
 * This ensures proper navigation on single-page websites and smooth scrolling behavior
 */
export const BUSINESS_MENU_CONFIG: Record<string, MenuConfig> = {
  // Food & Beverage
  'restaurant': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Menu', href: '#menu' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Book a Table',
    ctaHref: '#booking',
  },
  'bakery': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Our Products', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Order Now',
    ctaHref: '#contact',
  },
  'coffee-shop': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Menu', href: '#menu' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Visit Us',
    ctaHref: '#contact',
  },
  'food-delivery': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Menu', href: '#menu' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Order Now',
    ctaHref: '#contact',
  },

  // Professional Services
  'law-firm': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Practice Areas', href: '#services' },
      { label: 'Our Team', href: '#team' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Free Consultation',
    ctaHref: '#contact',
  },
  'accounting': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Get Started',
    ctaHref: '#contact',
  },
  'consulting': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Book a Call',
    ctaHref: '#contact',
  },
  'financial': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Free Consultation',
    ctaHref: '#contact',
  },
  'insurance': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Coverage Options', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Get a Quote',
    ctaHref: '#contact',
  },

  // Healthcare & Wellness
  'medical': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'Our Team', href: '#team' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Book Appointment',
    ctaHref: '#booking',
  },
  'dental': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'Our Team', href: '#team' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Book Appointment',
    ctaHref: '#booking',
  },
  'pharmacy': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Contact Us',
    ctaHref: '#contact',
  },
  'fitness': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Programs', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Start Free Trial',
    ctaHref: '#booking',
  },
  'yoga-studio': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Classes', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Book a Class',
    ctaHref: '#booking',
  },

  // Beauty & Personal Care
  'beauty-spa': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Treatments', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Book Treatment',
    ctaHref: '#booking',
  },
  'hair-salon': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Book Now',
    ctaHref: '#booking',
  },

  // Real Estate & Construction
  'real-estate': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Properties', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'View Listings',
    ctaHref: '#services',
  },
  'construction': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'Projects', href: '#portfolio' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Get Estimate',
    ctaHref: '#contact',
  },
  'electrician': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Get a Quote',
    ctaHref: '#contact',
  },
  'plumber': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Call Now',
    ctaHref: '#contact',
  },
  'hvac': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Schedule Service',
    ctaHref: '#contact',
  },
  'roofer': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'Our Work', href: '#portfolio' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Free Inspection',
    ctaHref: '#contact',
  },
  'interior-design': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'Portfolio', href: '#portfolio' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Start Project',
    ctaHref: '#contact',
  },
  'landscaping': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Get Quote',
    ctaHref: '#contact',
  },

  // Technology & Digital
  'tech-saas': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Start Free Trial',
    ctaHref: '#contact',
  },
  'ecommerce': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Shop', href: '#store' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Shop Now',
    ctaHref: '#store',
  },

  // Creative & Media
  'creative-agency': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'Work', href: '#portfolio' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Start a Project',
    ctaHref: '#contact',
  },
  'marketing-agency': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'Case Studies', href: '#portfolio' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Get Proposal',
    ctaHref: '#contact',
  },
  'photography': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Portfolio', href: '#portfolio' },
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Book Session',
    ctaHref: '#booking',
  },
  'music-entertainment': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Book Now',
    ctaHref: '#booking',
  },

  // Fashion & Retail
  'fashion': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Shop', href: '#store' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Shop Now',
    ctaHref: '#store',
  },

  // Automotive
  'automotive': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Inventory', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'View Inventory',
    ctaHref: '#services',
  },

  // Hospitality & Travel
  'hospitality': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Rooms', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Book Now',
    ctaHref: '#booking',
  },
  'travel-agency': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Destinations', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Plan Trip',
    ctaHref: '#contact',
  },

  // Events & Special Services
  'event-planning': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'Portfolio', href: '#portfolio' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Get Quote',
    ctaHref: '#contact',
  },
  'wedding-planning': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'Portfolio', href: '#portfolio' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Book Consultation',
    ctaHref: '#booking',
  },

  // Education & Non-profit
  'education': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Programs', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Enroll Now',
    ctaHref: '#contact',
  },
  'nonprofit': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Our Mission', href: '#about' },
      { label: 'Programs', href: '#services' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Donate',
    ctaHref: '#contact',
  },

  // Pet Services
  'pet-services': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Book Now',
    ctaHref: '#booking',
  },

  // Personal & Portfolio
  'portfolio': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Work', href: '#portfolio' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Get in Touch',
    ctaHref: '#contact',
  },
  'personal-blog': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Blog', href: '#blog' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Subscribe',
    ctaHref: '#contact',
  },

  // Physiotherapy (from archetypes)
  'physiotherapy': {
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Treatments', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Book Assessment',
    ctaHref: '#booking',
  },
}

// Default menu for unknown business types
export const DEFAULT_MENU_CONFIG: MenuConfig = {
  menuItems: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],
  ctaText: 'Get Started',
  ctaHref: '#contact',
}

/**
 * Get menu configuration for a specific business type
 * Falls back to default config if business type is not found
 */
export function getMenuConfigForBusinessType(businessType?: string): MenuConfig {
  if (!businessType) {
    return DEFAULT_MENU_CONFIG
  }

  // Normalize the business type
  const normalizedType = businessType.toLowerCase().trim()

  // Direct match
  if (BUSINESS_MENU_CONFIG[normalizedType]) {
    return BUSINESS_MENU_CONFIG[normalizedType]
  }

  // Try to find a partial match
  const partialMatch = Object.keys(BUSINESS_MENU_CONFIG).find(key =>
    normalizedType.includes(key) || key.includes(normalizedType)
  )

  if (partialMatch) {
    return BUSINESS_MENU_CONFIG[partialMatch]
  }

  return DEFAULT_MENU_CONFIG
}

/**
 * Filter menu items to only include those with corresponding sections
 * This ensures menu items don't link to non-existent sections
 *
 * @param menuItems - The menu items to filter
 * @param availableSectionTypes - Array of section types (e.g., ['ABOUT', 'SERVICES', 'CONTACT'])
 */
export function filterMenuItemsForSections(
  menuItems: MenuItemConfig[],
  availableSectionTypes: string[]
): MenuItemConfig[] {
  // Convert section types to anchor format (e.g., 'ABOUT' -> '#about')
  const sectionAnchors = new Set(
    availableSectionTypes.map(s => `#${s.toLowerCase().replace(/_/g, '-')}`)
  )
  // Always allow these
  sectionAnchors.add('/')
  sectionAnchors.add('#hero') // Hero is always present

  return menuItems.filter(item => {
    // Always include Home
    if (item.href === '/') return true
    // Check if the section exists for anchor links
    if (item.href.startsWith('#')) {
      return sectionAnchors.has(item.href)
    }
    // Allow page paths (for multi-page sites)
    return true
  })
}

/**
 * Generate menu items dynamically from available sections
 * This is the preferred method for ensuring all sections are linked
 *
 * @param sectionTypes - Array of section types present on the page
 * @param businessType - Optional business type for context-aware labels
 */
export function generateMenuItemsFromSections(
  sectionTypes: string[],
  businessType?: string
): MenuItemConfig[] {
  const items: MenuItemConfig[] = [{ label: 'Home', href: '/' }]

  // Map section types to user-friendly labels
  const sectionLabels: Record<string, string> = {
    'ABOUT': 'About',
    'SERVICES': 'Services',
    'FEATURES': 'Features',
    'TEAM': 'Our Team',
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

  // Sections that should be in the menu
  const menuSections = ['ABOUT', 'SERVICES', 'FEATURES', 'TEAM', 'PRICING', 'PORTFOLIO', 'GALLERY', 'STORE', 'MENU', 'CONTACT']

  // Add menu items for available sections (in preferred order)
  menuSections.forEach(sectionType => {
    if (sectionTypes.includes(sectionType)) {
      const label = sectionLabels[sectionType] || sectionType
      const anchor = sectionType.toLowerCase().replace(/_/g, '-')
      items.push({ label, href: `#${anchor}` })
    }
  })

  return items
}
