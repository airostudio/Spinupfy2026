/**
 * Link Validator Utility
 * Ensures all navigation links point to valid pages and fixes 404 errors
 */

interface Page {
  id: string
  slug: string
  path: string
  title: string
  sections?: any[]
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

interface Website {
  id: string
  name: string
  pages: Page[]
}

export interface LinkValidationResult {
  isValid: boolean
  originalHref: string
  correctedHref?: string
  reason?: string
}

/**
 * Validates a link href against available pages
 */
export function validateLink(href: string, pages: Page[]): LinkValidationResult {
  // Handle external links
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return { isValid: true, originalHref: href }
  }

  // Handle anchor links
  if (href.startsWith('#')) {
    return { isValid: true, originalHref: href }
  }

  // Normalize the href (remove leading slash)
  const normalizedHref = href.startsWith('/') ? href.substring(1) : href

  // Check if empty (home page)
  if (normalizedHref === '' || normalizedHref === '/') {
    const homePage = pages.find(p => p.slug === 'home' || p.slug === '')
    return {
      isValid: !!homePage,
      originalHref: href,
      correctedHref: homePage ? '/' : undefined,
      reason: homePage ? undefined : 'Home page not found',
    }
  }

  // Find matching page by slug or path
  const matchingPage = pages.find(
    p => p.slug === normalizedHref || p.path === href || p.path === `/${normalizedHref}`
  )

  if (matchingPage) {
    return { isValid: true, originalHref: href }
  }

  // Try to find a similar page
  const similarPage = pages.find(p =>
    p.slug.toLowerCase().includes(normalizedHref.toLowerCase()) ||
    normalizedHref.toLowerCase().includes(p.slug.toLowerCase())
  )

  if (similarPage) {
    return {
      isValid: false,
      originalHref: href,
      correctedHref: similarPage.path,
      reason: `Did you mean "${similarPage.slug}"?`,
    }
  }

  return {
    isValid: false,
    originalHref: href,
    reason: 'Page not found',
  }
}

/**
 * Fixes all broken links in a website
 * Returns the updated website and a report of fixes made
 */
export function fixBrokenLinks(website: Website): {
  website: Website
  fixes: Array<{ section: string; from: string; to: string }>
} {
  const fixes: Array<{ section: string; from: string; to: string }> = []

  // Process each page
  website.pages.forEach(page => {
    (page.sections ?? []).forEach(section => {
      // Fix navbar links
      if (section.type === 'NAVBAR' && section.content.links) {
        section.content.links = section.content.links.map((link: any) => {
          const validation = validateLink(link.href, website.pages)

          if (!validation.isValid && validation.correctedHref) {
            fixes.push({
              section: `${page.title} - Navbar`,
              from: link.href,
              to: validation.correctedHref,
            })
            return { ...link, href: validation.correctedHref }
          }

          return link
        })
      }

      // Fix CTA links
      if (section.content.primaryCTA?.href) {
        const validation = validateLink(section.content.primaryCTA.href, website.pages)

        if (!validation.isValid && validation.correctedHref) {
          fixes.push({
            section: `${page.title} - ${section.type}`,
            from: section.content.primaryCTA.href,
            to: validation.correctedHref,
          })
          section.content.primaryCTA.href = validation.correctedHref
        }
      }

      if (section.content.secondaryCTA?.href) {
        const validation = validateLink(section.content.secondaryCTA.href, website.pages)

        if (!validation.isValid && validation.correctedHref) {
          fixes.push({
            section: `${page.title} - ${section.type}`,
            from: section.content.secondaryCTA.href,
            to: validation.correctedHref,
          })
          section.content.secondaryCTA.href = validation.correctedHref
        }
      }

      // Fix button links in features, services, etc.
      if (section.content.items) {
        section.content.items.forEach((item: any) => {
          if (item.link || item.href) {
            const linkField = item.link ? 'link' : 'href'
            const validation = validateLink(item[linkField], website.pages)

            if (!validation.isValid && validation.correctedHref) {
              fixes.push({
                section: `${page.title} - ${section.type}`,
                from: item[linkField],
                to: validation.correctedHref,
              })
              item[linkField] = validation.correctedHref
            }
          }
        })
      }
    })
  })

  return { website, fixes }
}

/**
 * Creates missing pages for broken links
 */
export function createMissingPages(website: Website): {
  website: Website
  createdPages: Page[]
} {
  const createdPages: Page[] = []
  const allLinks = new Set<string>()

  // Collect all unique links
  website.pages.forEach(page => {
    page.sections?.forEach(section => {
      // Collect navbar links
      if (section.type === 'NAVBAR' && section.content.links) {
        section.content.links.forEach((link: any) => {
          if (link.href && !link.href.startsWith('http') && !link.href.startsWith('#')) {
            allLinks.add(link.href)
          }
        })
      }

      // Collect CTA links
      if (section.content.primaryCTA?.href) {
        allLinks.add(section.content.primaryCTA.href)
      }
      if (section.content.secondaryCTA?.href) {
        allLinks.add(section.content.secondaryCTA.href)
      }
    })
  })

  // Create pages for missing links
  allLinks.forEach(href => {
    const validation = validateLink(href, website.pages)

    if (!validation.isValid) {
      const slug = href.startsWith('/') ? href.substring(1) : href
      const title = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      const newPage: Page = {
        id: `page-${Date.now()}-${slug}`,
        title: title || 'New Page',
        slug,
        path: href.startsWith('/') ? href : `/${href}`,
        sections: [
          {
            id: `section-${Date.now()}`,
            type: 'HERO',
            content: {
              heading: title,
              description: `Welcome to the ${title} page`,
              primaryCTA: {
                text: 'Learn More',
                href: '#',
              },
            },
            styles: {
              backgroundColor: 'primary-500',
              textColor: 'white',
              padding: { top: 32, bottom: 32, left: 8, right: 8 },
            },
          },
        ],
        seo: {
          title,
          description: `${title} page`,
          keywords: [slug],
        },
      }

      website.pages.push(newPage)
      createdPages.push(newPage)
    }
  })

  return { website, createdPages }
}
