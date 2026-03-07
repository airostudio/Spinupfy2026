import { Metadata } from 'next'

/**
 * SEO Metadata Generation Utilities
 * Provides comprehensive metadata for all pages with proper fallbacks
 */

interface SEOConfig {
  title?: string | null
  description?: string | null
  keywords?: string | null
  ogImage?: string | null
  ogType?: string | null
  twitterCard?: string | null
  twitterImage?: string | null
  canonicalUrl?: string | null
  siteName?: string
  locale?: string
}

/**
 * Generates comprehensive Next.js metadata with Open Graph and Twitter Cards
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords,
    ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    twitterImage,
    canonicalUrl,
    siteName = 'AI Website Builder',
    locale = 'en_US',
  } = config

  // Build title with fallback
  const metaTitle = title || 'AI Website Builder - Create Beautiful Websites in Seconds'
  const metaDescription = description || 'Build stunning websites using AI. Just tell us what you do and AI designs everything for you.'

  // Determine which image to use (prefer specific image types, fallback to ogImage)
  const finalOgImage = ogImage || '/og-default.jpg'
  const finalTwitterImage = twitterImage || ogImage || '/twitter-default.jpg'

  const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
  }

  // Add keywords if provided
  if (keywords) {
    metadata.keywords = keywords.split(',').map(k => k.trim())
  }

  // Open Graph metadata
  metadata.openGraph = {
    type: ogType as any,
    title: metaTitle,
    description: metaDescription,
    siteName,
    locale,
    images: [
      {
        url: finalOgImage,
        width: 1200,
        height: 630,
        alt: metaTitle,
      },
    ],
  }

  // Add canonical URL if provided
  if (canonicalUrl) {
    metadata.openGraph.url = canonicalUrl
    metadata.alternates = {
      canonical: canonicalUrl,
    }
  }

  // Twitter Card metadata
  metadata.twitter = {
    card: twitterCard as any,
    title: metaTitle,
    description: metaDescription,
    images: [finalTwitterImage],
  }

  return metadata
}

/**
 * Generates metadata for website pages
 */
export function generatePageMetadata(
  page: {
    title: string
    meta_title?: string | null
    meta_description?: string | null
    meta_keywords?: string | null
    og_image?: string | null
    og_type?: string | null
    twitter_card?: string | null
    twitter_image?: string | null
    canonical_url?: string | null
  },
  website: {
    name: string
    meta_title?: string | null
    meta_description?: string | null
    slug: string
  },
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
): Metadata {
  // Use page-specific metadata or fall back to website metadata
  const title = page.meta_title || page.title
  const fullTitle = `${title} | ${website.name}`
  const description = page.meta_description || website.meta_description
  const canonicalUrl = page.canonical_url || `${baseUrl}/site/${website.slug}`

  return generateMetadata({
    title: fullTitle,
    description,
    keywords: page.meta_keywords,
    ogImage: page.og_image,
    ogType: page.og_type || 'article',
    twitterCard: page.twitter_card,
    twitterImage: page.twitter_image,
    canonicalUrl,
    siteName: website.name,
  })
}

/**
 * Generates metadata for the website homepage
 */
export function generateWebsiteMetadata(
  website: {
    name: string
    description?: string | null
    meta_title?: string | null
    meta_description?: string | null
    meta_keywords?: string | null
    og_image?: string | null
    og_type?: string | null
    twitter_card?: string | null
    twitter_image?: string | null
    canonical_url?: string | null
    slug: string
  },
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
): Metadata {
  const title = website.meta_title || website.name
  const description = website.meta_description || website.description
  const canonicalUrl = website.canonical_url || `${baseUrl}/site/${website.slug}`

  return generateMetadata({
    title,
    description,
    keywords: website.meta_keywords,
    ogImage: website.og_image,
    ogType: website.og_type || 'website',
    twitterCard: website.twitter_card,
    twitterImage: website.twitter_image,
    canonicalUrl,
    siteName: website.name,
  })
}

/**
 * Generates basic metadata for application pages (non-website pages)
 */
export function generateAppMetadata(
  title: string,
  description?: string,
  additionalConfig?: Partial<SEOConfig>
): Metadata {
  return generateMetadata({
    title: `${title} | AI Website Builder`,
    description: description || 'Build stunning websites using AI',
    ...additionalConfig,
  })
}

/**
 * Sanitizes and validates SEO text to meet best practices
 */
export function sanitizeSEOText(text: string, maxLength: number): string {
  if (!text) return ''

  // Remove extra whitespace
  let sanitized = text.trim().replace(/\s+/g, ' ')

  // Truncate if too long, but try to break at word boundary
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
    const lastSpace = sanitized.lastIndexOf(' ')
    if (lastSpace > maxLength * 0.8) {
      sanitized = sanitized.substring(0, lastSpace)
    }
    sanitized += '...'
  }

  return sanitized
}

/**
 * Validates and ensures title meets SEO best practices
 */
export function optimizeTitle(title: string): string {
  const MAX_TITLE_LENGTH = 60
  return sanitizeSEOText(title, MAX_TITLE_LENGTH)
}

/**
 * Validates and ensures description meets SEO best practices
 */
export function optimizeDescription(description: string): string {
  const MAX_DESCRIPTION_LENGTH = 160
  return sanitizeSEOText(description, MAX_DESCRIPTION_LENGTH)
}

/**
 * Extracts and formats keywords from text
 */
export function extractKeywords(text: string, maxKeywords: number = 10): string {
  if (!text) return ''

  // Simple keyword extraction (in production, use more sophisticated NLP)
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3) // Filter out short words

  // Remove duplicates and limit count
  const uniqueWords = Array.from(new Set(words)).slice(0, maxKeywords)

  return uniqueWords.join(', ')
}
