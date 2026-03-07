/**
 * Helper functions for intelligent website generation
 * Ensures all links, buttons, and navigation are properly connected
 */

export interface PageInfo {
  title: string
  slug: string
  path: string
  order: number
}

export interface GenerationContext {
  businessName: string
  businessType: string
  description: string
  hasStore: boolean
  hasBooking: boolean
  hasPortfolio: boolean
  hasServices: boolean
  hasBlog: boolean
  hasGallery: boolean
}

/**
 * Generate intelligent menu items based on pages that will be created
 */
export function generateMenuItems(pages: PageInfo[]): Array<{ label: string; href: string }> {
  const menuItems: Array<{ label: string; href: string }> = []

  // Always include Home first
  menuItems.push({ label: 'Home', href: '/' })

  // Add other pages in order, excluding homepage
  pages
    .filter(page => !page.path.includes('homepage') && page.slug !== 'home')
    .sort((a, b) => a.order - b.order)
    .forEach(page => {
      menuItems.push({
        label: page.title,
        href: page.path
      })
    })

  return menuItems
}

/**
 * Determine the primary CTA link based on business context
 */
export function getPrimaryCTALink(context: GenerationContext): string {
  if (context.hasStore) {
    return '/shop'
  } else if (context.hasBooking) {
    return '/booking'
  } else if (context.hasServices) {
    return '/services'
  } else if (context.hasPortfolio) {
    return '/portfolio'
  }
  return '/contact'
}

/**
 * Get secondary CTA link
 */
export function getSecondaryCTALink(context: GenerationContext): string {
  // If primary is shop, secondary should be about
  if (context.hasStore) {
    return '/about'
  }
  // If we have services, learn more about them
  if (context.hasServices) {
    return '/services'
  }
  // Default to about
  return '/about'
}

/**
 * Intelligent detection of business needs from description
 */
export function analyzeBusinessNeeds(description: string, features?: string[]): {
  needsStore: boolean
  needsBooking: boolean
  needsServices: boolean
  needsPortfolio: boolean
  needsBlog: boolean
  needsGallery: boolean
  needsTestimonials: boolean
  needsTeam: boolean
  needsFAQ: boolean
} {
  const lowerDesc = description.toLowerCase()
  const featureText = features?.join(' ').toLowerCase() || ''
  const combined = `${lowerDesc} ${featureText}`

  // E-commerce keywords
  const storeKeywords = ['shop', 'buy', 'sell', 'product', 'store', 'purchase', 'cart', 'checkout', 'online store', 'e-commerce', 'ecommerce', 'for sale', 'merchandise']
  const needsStore = storeKeywords.some(keyword => combined.includes(keyword))

  // Booking keywords
  const bookingKeywords = ['book', 'reserve', 'reservation', 'appointment', 'booking', 'schedule', 'book a table', 'book now', 'make a reservation', 'schedule appointment']
  const needsBooking = bookingKeywords.some(keyword => combined.includes(keyword))

  // Services keywords
  const serviceKeywords = ['service', 'consultation', 'consulting', 'we offer', 'we provide', 'solutions', 'expertise']
  const needsServices = serviceKeywords.some(keyword => combined.includes(keyword))

  // Portfolio keywords
  const portfolioKeywords = ['portfolio', 'gallery', 'work', 'projects', 'showcase', 'our work', 'past projects', 'examples']
  const needsPortfolio = portfolioKeywords.some(keyword => combined.includes(keyword))

  // Blog keywords
  const blogKeywords = ['blog', 'news', 'articles', 'updates', 'insights', 'resources']
  const needsBlog = blogKeywords.some(keyword => combined.includes(keyword))

  // Gallery keywords (different from portfolio - more image-focused)
  const galleryKeywords = ['photo', 'photos', 'images', 'gallery', 'album', 'pictures']
  const needsGallery = galleryKeywords.some(keyword => combined.includes(keyword))

  // Testimonials (usually always good to have)
  const testimonialKeywords = ['review', 'testimonial', 'customer', 'client', 'feedback', 'success stor']
  const needsTestimonials = testimonialKeywords.some(keyword => combined.includes(keyword)) || true // Default true

  // Team keywords
  const teamKeywords = ['team', 'staff', 'our people', 'meet the', 'founder', 'leadership']
  const needsTeam = teamKeywords.some(keyword => combined.includes(keyword)) || needsServices

  // FAQ keywords
  const faqKeywords = ['faq', 'question', 'how do', 'how to', 'what is', 'common question']
  const needsFAQ = faqKeywords.some(keyword => combined.includes(keyword))

  return {
    needsStore,
    needsBooking,
    needsServices,
    needsPortfolio,
    needsBlog,
    needsGallery,
    needsTestimonials,
    needsTeam,
    needsFAQ
  }
}

/**
 * Get intelligent CTA text based on business type and context
 */
export function getCTAText(context: GenerationContext, position: 'primary' | 'secondary' = 'primary'): string {
  if (position === 'primary') {
    if (context.hasStore) {
      return 'Shop Now'
    } else if (context.hasBooking) {
      return 'Book Now'
    } else if (context.hasServices) {
      return 'View Services'
    } else if (context.hasPortfolio) {
      return 'See Our Work'
    }
    return 'Get Started'
  } else {
    if (context.hasStore) {
      return 'Learn More'
    } else if (context.hasServices) {
      return 'View Services'
    }
    return 'Contact Us'
  }
}

/**
 * Ensure all links in generated content point to actual pages
 * This function validates and corrects links
 */
export function validateAndCorrectLinks(content: any, pages: PageInfo[]): any {
  const validPaths = new Set(pages.map(p => p.path))

  // Add common valid paths
  validPaths.add('/')
  validPaths.add('/#features')
  validPaths.add('/#about')
  validPaths.add('/#contact')
  validPaths.add('/#services')
  validPaths.add('/#testimonials')

  function correctLink(href: string): string {
    // If it's a hash link, keep it
    if (href.startsWith('#')) {
      return href
    }

    // If it's a valid path, keep it
    if (validPaths.has(href)) {
      return href
    }

    // Try to find a similar path
    const path = href.replace(/^\//, '')
    for (const validPath of validPaths) {
      if (validPath.includes(path) || path.includes(validPath.replace('/', ''))) {
        return validPath
      }
    }

    // Default to contact if we can't find a match
    return '/contact'
  }

  // Recursively correct all href/link properties
  if (typeof content === 'object' && content !== null) {
    if (Array.isArray(content)) {
      return content.map(item => validateAndCorrectLinks(item, pages))
    }

    const corrected: any = {}
    for (const [key, value] of Object.entries(content)) {
      if (key === 'href' || key === 'link' || key === 'url') {
        corrected[key] = typeof value === 'string' ? correctLink(value) : value
      } else {
        corrected[key] = validateAndCorrectLinks(value, pages)
      }
    }
    return corrected
  }

  return content
}

/**
 * Get relevant pages that should be created based on business needs
 */
export function getRelevantPages(needs: ReturnType<typeof analyzeBusinessNeeds>): string[] {
  const pages = ['home', 'about', 'contact']

  if (needs.needsStore) pages.push('shop')
  if (needs.needsServices) pages.push('services')
  if (needs.needsPortfolio) pages.push('portfolio')
  if (needs.needsBlog) pages.push('blog')
  if (needs.needsBooking) pages.push('booking')
  if (needs.needsFAQ) pages.push('faq')

  return pages
}
