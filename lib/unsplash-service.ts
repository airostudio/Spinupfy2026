/**
 * Unsplash Image Service
 *
 * Provides rapid, high-quality, business-relevant images from Unsplash
 * to dramatically reduce website generation time (from 5-10 min to < 3 min)
 *
 * Strategy:
 * - Primary: Use Unsplash for instant, professional stock photography
 * - Fallback: DALL-E for highly specific/branded content
 * - User Choice: Allow regeneration with AI later
 */

import { createApi } from 'unsplash-js'

// Initialize Unsplash API client
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
})

// Business-specific search queries for maximum relevance
const BUSINESS_IMAGE_QUERIES: Record<string, {
  hero: string[]
  about: string[]
  services: string[]
  team: string[]
  gallery: string[]
  features: string[]
}> = {
  restaurant: {
    hero: ['upscale restaurant interior', 'fine dining atmosphere', 'elegant restaurant setting'],
    about: ['chef cooking professional kitchen', 'culinary preparation', 'chef preparing food'],
    services: ['gourmet food plating', 'restaurant dish presentation', 'fine dining cuisine'],
    team: ['chef portrait professional', 'restaurant staff uniform', 'culinary team'],
    gallery: ['food photography artistic', 'restaurant dishes elegant', 'culinary presentation'],
    features: ['restaurant service', 'dining experience', 'culinary excellence']
  },
  bakery: {
    hero: ['artisan bakery interior', 'rustic bread shop', 'cozy bakery cafe'],
    about: ['baker kneading dough', 'artisan bread making', 'baker at work'],
    services: ['fresh croissants pastries', 'artisan bread loaves', 'bakery products'],
    team: ['baker portrait apron', 'bakery staff', 'artisan baker'],
    gallery: ['bread photography', 'pastry assortment', 'bakery goods display'],
    features: ['fresh baked goods', 'artisan bread', 'bakery craftsmanship']
  },
  'coffee-shop': {
    hero: ['specialty coffee shop interior', 'cozy cafe atmosphere', 'modern coffee bar'],
    about: ['barista making latte art', 'coffee preparation', 'espresso machine barista'],
    services: ['latte art coffee', 'specialty coffee drink', 'espresso preparation'],
    team: ['barista portrait professional', 'coffee shop staff', 'friendly barista'],
    gallery: ['coffee photography', 'latte art varieties', 'cafe atmosphere'],
    features: ['specialty coffee', 'coffee brewing', 'cafe culture']
  },
  'law-firm': {
    hero: ['law office interior elegant', 'professional legal office', 'prestigious law library'],
    about: ['attorney office work', 'lawyer consultation', 'legal professional'],
    services: ['legal consultation meeting', 'attorney client discussion', 'law office consultation'],
    team: ['attorney professional portrait', 'lawyer headshot', 'legal professional portrait'],
    gallery: ['law office interior', 'legal library books', 'professional office space'],
    features: ['legal services', 'attorney expertise', 'law office professional']
  },
  'tech-saas': {
    hero: ['modern tech office', 'collaborative workspace', 'innovation lab interior'],
    about: ['tech team collaboration', 'software development', 'agile team working'],
    services: ['laptop modern interface', 'software workspace', 'tech productivity'],
    team: ['tech professional portrait', 'software engineer', 'tech leader headshot'],
    gallery: ['modern office space', 'tech workspace', 'innovation center'],
    features: ['technology innovation', 'software development', 'digital solutions']
  },
  fitness: {
    hero: ['modern gym interior', 'fitness center equipment', 'gym workout space'],
    about: ['athlete training gym', 'fitness dedication', 'workout motivation'],
    services: ['personal training session', 'fitness coaching', 'gym workout'],
    team: ['personal trainer portrait', 'fitness coach professional', 'gym instructor'],
    gallery: ['gym equipment modern', 'fitness training', 'workout scenes'],
    features: ['fitness training', 'gym equipment', 'workout motivation']
  },
  'beauty-spa': {
    hero: ['luxury spa interior', 'serene spa room', 'wellness center tranquil'],
    about: ['spa treatment session', 'esthetician care', 'massage therapy'],
    services: ['spa facial treatment', 'massage therapy', 'skincare session'],
    team: ['spa therapist portrait', 'esthetician professional', 'wellness expert'],
    gallery: ['spa interior serene', 'wellness room', 'spa treatment room'],
    features: ['spa treatment', 'wellness therapy', 'relaxation spa']
  },
  'pet-services': {
    hero: ['happy dogs pet care', 'pet grooming salon', 'playful pets facility'],
    about: ['pet groomer working', 'dog grooming session', 'pet care professional'],
    services: ['dog grooming spa', 'pet bathing', 'dog haircut grooming'],
    team: ['pet groomer portrait', 'veterinarian professional', 'pet care specialist'],
    gallery: ['happy dogs portraits', 'cute pets', 'pet care facility'],
    features: ['pet grooming', 'dog care', 'pet services professional']
  },
  'real-estate': {
    hero: ['luxury home exterior', 'modern house architecture', 'dream home property'],
    about: ['real estate agent showing home', 'property tour', 'realtor with clients'],
    services: ['beautiful home interior', 'modern living room', 'luxury property'],
    team: ['real estate agent portrait', 'realtor professional', 'property agent headshot'],
    gallery: ['luxury homes', 'property photography', 'architectural beauty'],
    features: ['real estate professional', 'property showcase', 'home selling']
  },
  'hair-salon': {
    hero: ['modern hair salon interior', 'chic salon styling', 'contemporary beauty salon'],
    about: ['hairstylist cutting hair', 'salon styling work', 'hair professional'],
    services: ['hair styling session', 'salon haircut', 'hair color treatment'],
    team: ['hairstylist portrait professional', 'salon stylist', 'hair expert'],
    gallery: ['salon interior modern', 'hair styling', 'beauty salon'],
    features: ['hair styling professional', 'salon service', 'hair transformation']
  },
  consulting: {
    hero: ['modern corporate office', 'business consultation space', 'professional meeting room'],
    about: ['business consultant meeting', 'strategy session', 'corporate consulting'],
    services: ['business strategy presentation', 'consulting meeting', 'professional collaboration'],
    team: ['business consultant portrait', 'corporate professional', 'consultant headshot'],
    gallery: ['office interior modern', 'business workspace', 'corporate environment'],
    features: ['business consulting', 'strategy expertise', 'professional guidance']
  },
  default: {
    hero: ['modern business interior', 'professional workspace', 'contemporary office'],
    about: ['professional at work', 'business expertise', 'workplace dedication'],
    services: ['professional service delivery', 'quality work', 'business excellence'],
    team: ['professional portrait business', 'headshot corporate', 'business professional'],
    gallery: ['modern workspace', 'professional environment', 'business setting'],
    features: ['professional service', 'business quality', 'expert work']
  }
}

// Orientation preferences by section type
const ORIENTATION_PREFERENCES: Record<string, 'landscape' | 'portrait' | 'squarish'> = {
  hero: 'landscape',      // 16:9 for hero banners
  features: 'squarish',   // 1:1 for feature cards
  services: 'squarish',   // 1:1 for service cards
  about: 'landscape',     // Flexible for about sections
  team: 'portrait',       // Portrait for team headshots
  gallery: 'squarish',    // Square for galleries
  contact: 'landscape',   // Landscape for contact headers
  testimonials: 'squarish', // Square for testimonial cards
  cta: 'landscape'        // Landscape for CTA banners
}

export interface UnsplashImageResult {
  url: string
  downloadUrl: string
  altText: string
  photographer: string
  photographerUrl: string
  unsplashUrl: string
  width: number
  height: number
}

// Keywords to avoid in image descriptions (photography equipment, brands, etc.)
const PROHIBITED_KEYWORDS = [
  'camera', 'tripod', 'lens', 'photography', 'photographer', 'studio light',
  'umbrella light', 'softbox', 'reflector', 'flash', 'photo equipment',
  'apple', 'iphone', 'ipad', 'macbook', 'microsoft', 'google', 'nike',
  'samsung', 'logo', 'brand', 'branded'
]

/**
 * Filter out images that contain prohibited content
 */
function filterProhibitedImages(images: any[]): any[] {
  return images.filter(photo => {
    const description = (photo.alt_description || photo.description || '').toLowerCase()
    const tags = (photo.tags || []).map((t: any) => (t.title || t).toLowerCase())
    const allText = [description, ...tags].join(' ')

    // Check if any prohibited keyword is present
    const hasProhibited = PROHIBITED_KEYWORDS.some(keyword =>
      allText.includes(keyword.toLowerCase())
    )

    if (hasProhibited) {
      console.log(`🚫 Filtered out image with prohibited content: ${description}`)
      return false
    }

    return true
  })
}

/**
 * Search Unsplash for business-relevant images
 */
export async function searchUnsplashImages(params: {
  businessType: string
  sectionType: string
  query?: string
  count?: number
}): Promise<UnsplashImageResult[]> {
  const { businessType, sectionType, query, count = 3 } = params

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.warn('Unsplash API key not configured')
    return []
  }

  try {
    // Get business-specific queries
    const businessQueries = BUSINESS_IMAGE_QUERIES[businessType.toLowerCase()] || BUSINESS_IMAGE_QUERIES.default
    const sectionQueries = businessQueries[sectionType.toLowerCase() as keyof typeof businessQueries] || businessQueries.hero

    // Use custom query if provided, otherwise use first business-specific query
    const searchQuery = query || sectionQueries[0]

    // Get orientation preference
    const orientation = ORIENTATION_PREFERENCES[sectionType.toLowerCase()] || 'landscape'

    console.log(`🔍 Searching Unsplash: "${searchQuery}" (${orientation}, ${businessType})`)

    // Search Unsplash - request more than needed to account for filtering
    const result = await unsplash.search.getPhotos({
      query: searchQuery,
      page: 1,
      perPage: count * 3, // Request 3x to account for filtering
      orientation: orientation,
      contentFilter: 'high', // Filter out low-quality or inappropriate content
    })

    if (result.type === 'error') {
      console.error('Unsplash search error:', result.errors)
      return []
    }

    if (!result.response || result.response.results.length === 0) {
      console.warn(`No Unsplash results for: ${searchQuery}`)
      return []
    }

    // Filter out prohibited content (photography equipment, brand logos, etc.)
    const filteredPhotos = filterProhibitedImages(result.response.results)

    if (filteredPhotos.length === 0) {
      console.warn(`⚠️ All images filtered out due to prohibited content. Returning unfiltered results.`)
      // If filtering removes everything, use unfiltered (better than nothing)
    }

    const photosToUse = filteredPhotos.length > 0 ? filteredPhotos : result.response.results

    // Transform results (limit to requested count)
    const images: UnsplashImageResult[] = photosToUse.slice(0, count).map(photo => ({
      url: photo.urls.regular,
      downloadUrl: photo.links.download_location, // For tracking downloads
      altText: photo.alt_description || photo.description || `${sectionType} image for ${businessType}`,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      unsplashUrl: photo.links.html,
      width: photo.width,
      height: photo.height,
    }))

    console.log(`✅ Found ${images.length} Unsplash images for ${searchQuery} (${filteredPhotos.length} after filtering)`)

    return images
  } catch (error) {
    console.error('Unsplash API error:', error)
    return []
  }
}

/**
 * Get a single best-match image for a section
 */
export async function getUnsplashImageForSection(params: {
  businessType: string
  sectionType: string
  description?: string
}): Promise<UnsplashImageResult | null> {
  const images = await searchUnsplashImages({
    ...params,
    count: 1
  })

  return images[0] || null
}

/**
 * Track image download (required by Unsplash API guidelines)
 */
export async function trackUnsplashDownload(downloadUrl: string): Promise<void> {
  if (!process.env.UNSPLASH_ACCESS_KEY) return

  try {
    await fetch(downloadUrl, {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    })
  } catch (error) {
    console.error('Failed to track Unsplash download:', error)
  }
}

/**
 * Get multiple images for a section with fallback queries
 */
export async function getMultipleImages(params: {
  businessType: string
  sectionType: string
  count: number
}): Promise<UnsplashImageResult[]> {
  const { businessType, sectionType, count } = params

  // Try primary query
  let images = await searchUnsplashImages({ businessType, sectionType, count })

  // If not enough results, try alternative queries
  if (images.length < count) {
    const businessQueries = BUSINESS_IMAGE_QUERIES[businessType.toLowerCase()] || BUSINESS_IMAGE_QUERIES.default
    const sectionQueries = businessQueries[sectionType.toLowerCase() as keyof typeof businessQueries] || businessQueries.hero

    for (let i = 1; i < sectionQueries.length && images.length < count; i++) {
      const moreImages = await searchUnsplashImages({
        businessType,
        sectionType,
        query: sectionQueries[i],
        count: count - images.length
      })
      images = [...images, ...moreImages]
    }
  }

  return images.slice(0, count)
}

/**
 * Get curated collection for a business type
 * Returns a full set of images for hero, features, about, team, etc.
 */
export async function getCuratedBusinessImages(businessType: string): Promise<{
  hero: UnsplashImageResult | null
  features: UnsplashImageResult[]
  about: UnsplashImageResult | null
  team: UnsplashImageResult[]
  gallery: UnsplashImageResult[]
}> {
  const [hero, features, about, team, gallery] = await Promise.all([
    getUnsplashImageForSection({ businessType, sectionType: 'hero' }),
    getMultipleImages({ businessType, sectionType: 'features', count: 6 }),
    getUnsplashImageForSection({ businessType, sectionType: 'about' }),
    getMultipleImages({ businessType, sectionType: 'team', count: 4 }),
    getMultipleImages({ businessType, sectionType: 'gallery', count: 6 }),
  ])

  return { hero, features, about, team, gallery }
}
