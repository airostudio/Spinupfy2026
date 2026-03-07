/**
 * Dynamic Fallback Image System
 *
 * Fetches high-quality, relevant images from Unsplash as fallbacks
 * when AI image generation is skipped due to time constraints.
 *
 * This is much faster than DALL-E (< 1 second) and provides
 * contextually appropriate images for different business types.
 */

// Business-type specific search queries for high-quality fallback images
const FALLBACK_SEARCH_CONFIG: Record<string, {
  hero: string[]
  features: string[]
  team: string[]
  testimonial: string[]
  gallery: string[]
  cta: string[]
  product: string[]
  menu: string[]
}> = {
  // Restaurant & Food
  'restaurant': {
    hero: ['fine dining restaurant interior', 'gourmet food presentation', 'restaurant ambiance'],
    features: ['chef cooking kitchen', 'restaurant service', 'dining experience'],
    team: ['chef portrait professional', 'restaurant staff friendly', 'waiter professional'],
    testimonial: ['happy dining customer', 'restaurant guest satisfied', 'couple dining'],
    gallery: ['delicious food plating', 'restaurant dishes', 'cuisine photography'],
    cta: ['restaurant reservation', 'dining table elegant', 'welcome restaurant'],
    product: ['food menu item', 'dish presentation', 'appetizing meal'],
    menu: ['gourmet dish photography', 'restaurant food plating', 'chef special'],
  },
  'bakery': {
    hero: ['artisan bakery display', 'fresh bread pastries', 'bakery interior warm'],
    features: ['fresh baked goods', 'pastry selection', 'artisan bread'],
    team: ['baker portrait apron', 'pastry chef working', 'bakery team friendly'],
    testimonial: ['customer bakery happy', 'satisfied bakery customer', 'enjoying pastry'],
    gallery: ['beautiful pastries', 'bread varieties artisan', 'cake decoration'],
    cta: ['bakery order fresh', 'pastry display inviting', 'bakery warm welcome'],
    product: ['pastry item closeup', 'bread product', 'cake slice'],
    menu: ['bakery menu items', 'pastry selection', 'fresh bread display'],
  },
  'coffee': {
    hero: ['coffee shop interior cozy', 'barista making coffee', 'cafe ambiance'],
    features: ['espresso preparation', 'latte art', 'coffee beans roasting'],
    team: ['barista portrait friendly', 'cafe staff professional', 'coffee expert'],
    testimonial: ['customer enjoying coffee', 'cafe visitor happy', 'coffee lover'],
    gallery: ['coffee drinks variety', 'cafe interior', 'specialty coffee'],
    cta: ['coffee shop welcome', 'cafe cozy atmosphere', 'fresh coffee brewing'],
    product: ['coffee drink closeup', 'latte art beautiful', 'espresso shot'],
    menu: ['coffee menu drinks', 'cafe beverages', 'pastry and coffee'],
  },

  // Healthcare & Wellness
  'healthcare': {
    hero: ['modern medical facility', 'healthcare professional caring', 'clinic interior clean'],
    features: ['medical consultation', 'health checkup', 'patient care'],
    team: ['doctor portrait professional', 'medical team', 'nurse caring'],
    testimonial: ['patient satisfied healthcare', 'happy patient doctor', 'health success'],
    gallery: ['medical equipment modern', 'clinic rooms', 'healthcare facility'],
    cta: ['appointment booking medical', 'healthcare welcome', 'clinic reception'],
    product: ['medical services', 'health equipment', 'treatment room'],
    menu: ['healthcare services', 'medical procedures', 'health packages'],
  },
  'dental': {
    hero: ['modern dental clinic', 'dentist office clean', 'dental care professional'],
    features: ['dental examination', 'teeth cleaning', 'dental treatment'],
    team: ['dentist portrait friendly', 'dental team professional', 'dental hygienist'],
    testimonial: ['patient smile dental', 'happy dental patient', 'confident smile'],
    gallery: ['dental equipment modern', 'clinic interior', 'treatment room'],
    cta: ['dental appointment', 'smile consultation', 'dental care welcome'],
    product: ['dental treatment', 'oral care', 'teeth whitening'],
    menu: ['dental services', 'treatments offered', 'dental procedures'],
  },
  'eye-care': {
    hero: ['optical shop modern', 'eye care clinic', 'eyewear display boutique'],
    features: ['eye examination', 'vision testing', 'glasses fitting'],
    team: ['optometrist portrait', 'eye care professional', 'optical staff'],
    testimonial: ['satisfied optical customer', 'new glasses happy', 'vision improved'],
    gallery: ['designer eyewear display', 'frames collection', 'optical store'],
    cta: ['eye exam appointment', 'vision care', 'optical consultation'],
    product: ['eyeglasses frames', 'sunglasses display', 'contact lenses'],
    menu: ['eye care services', 'vision services', 'optical packages'],
  },
  'chiropractic': {
    hero: ['chiropractic clinic modern', 'wellness center', 'spinal care'],
    features: ['chiropractic adjustment', 'spine treatment', 'wellness therapy'],
    team: ['chiropractor professional', 'wellness practitioner', 'therapy team'],
    testimonial: ['patient wellness success', 'back pain relief', 'health improvement'],
    gallery: ['chiropractic clinic', 'treatment room', 'wellness facility'],
    cta: ['wellness appointment', 'health consultation', 'pain relief'],
    product: ['chiropractic treatment', 'wellness services', 'therapy session'],
    menu: ['chiropractic services', 'wellness packages', 'treatment options'],
  },
  'fitness': {
    hero: ['modern gym interior', 'fitness center', 'workout motivation'],
    features: ['personal training', 'group fitness class', 'gym equipment'],
    team: ['personal trainer portrait', 'fitness coach', 'gym instructor'],
    testimonial: ['fitness transformation', 'gym member happy', 'workout success'],
    gallery: ['gym equipment modern', 'fitness classes', 'workout space'],
    cta: ['gym membership', 'fitness journey start', 'workout motivation'],
    product: ['fitness program', 'training package', 'gym class'],
    menu: ['gym services', 'fitness programs', 'membership options'],
  },
  'spa': {
    hero: ['luxury spa interior', 'wellness retreat', 'relaxation spa'],
    features: ['spa treatment', 'massage therapy', 'facial treatment'],
    team: ['spa therapist professional', 'wellness expert', 'esthetician'],
    testimonial: ['spa client relaxed', 'wellness experience', 'rejuvenation'],
    gallery: ['spa treatment room', 'wellness products', 'relaxation space'],
    cta: ['spa booking', 'relaxation awaits', 'wellness escape'],
    product: ['spa treatment', 'massage service', 'facial package'],
    menu: ['spa services menu', 'treatments offered', 'wellness packages'],
  },

  // Professional Services
  'law-firm': {
    hero: ['law office professional', 'legal library', 'attorney office modern'],
    features: ['legal consultation', 'contract review', 'courtroom'],
    team: ['lawyer portrait professional', 'legal team', 'attorney confident'],
    testimonial: ['client legal success', 'case won celebration', 'satisfied client'],
    gallery: ['law office interior', 'legal books', 'professional office'],
    cta: ['legal consultation', 'attorney appointment', 'justice scales'],
    product: ['legal services', 'case review', 'consultation'],
    menu: ['legal services', 'practice areas', 'legal packages'],
  },
  'real-estate': {
    hero: ['luxury home interior', 'real estate modern', 'beautiful property'],
    features: ['house for sale', 'property viewing', 'home interior'],
    team: ['real estate agent professional', 'property consultant', 'realtor friendly'],
    testimonial: ['new homeowner happy', 'keys handover celebration', 'family new home'],
    gallery: ['luxury homes', 'property showcase', 'interior design'],
    cta: ['property search', 'dream home', 'real estate consultation'],
    product: ['property listing', 'home exterior', 'apartment modern'],
    menu: ['real estate services', 'property types', 'buying selling'],
  },
  'consulting': {
    hero: ['business consulting meeting', 'corporate office modern', 'strategy session'],
    features: ['business analysis', 'team meeting', 'presentation professional'],
    team: ['consultant portrait professional', 'business advisor', 'expert consultant'],
    testimonial: ['business success client', 'growth achievement', 'satisfied business owner'],
    gallery: ['corporate office', 'business meeting', 'professional workspace'],
    cta: ['business consultation', 'strategy meeting', 'growth opportunity'],
    product: ['consulting service', 'business workshop', 'strategy session'],
    menu: ['consulting services', 'business solutions', 'advisory packages'],
  },

  // Tech & Digital
  'tech-startup': {
    hero: ['tech startup office', 'modern workspace technology', 'innovation hub'],
    features: ['software development', 'tech innovation', 'coding programming'],
    team: ['tech founder portrait', 'developer team', 'startup team diverse'],
    testimonial: ['tech success story', 'startup achievement', 'happy tech client'],
    gallery: ['modern tech office', 'coding workspace', 'innovation space'],
    cta: ['technology solution', 'digital transformation', 'tech innovation'],
    product: ['software product', 'tech solution', 'digital service'],
    menu: ['tech services', 'software solutions', 'digital products'],
  },

  // Creative & Services
  'photography': {
    hero: ['photography studio professional', 'camera equipment', 'creative photography'],
    features: ['photo session', 'portrait photography', 'creative shoot'],
    team: ['photographer portrait', 'creative professional', 'photography artist'],
    testimonial: ['happy photography client', 'photo session success', 'portrait customer'],
    gallery: ['photography portfolio', 'stunning photos', 'creative work'],
    cta: ['photo session booking', 'capture memories', 'photography inquiry'],
    product: ['photography package', 'photo session', 'portrait service'],
    menu: ['photography services', 'session types', 'packages offered'],
  },
  'hair-salon': {
    hero: ['modern hair salon', 'salon interior stylish', 'hairstyling professional'],
    features: ['hair styling', 'hair coloring', 'salon treatment'],
    team: ['hairstylist portrait', 'salon team professional', 'beauty expert'],
    testimonial: ['hair transformation', 'satisfied salon client', 'new hairstyle happy'],
    gallery: ['hair styling results', 'salon interior', 'beauty transformation'],
    cta: ['salon appointment', 'hair consultation', 'beauty booking'],
    product: ['hair treatment', 'styling service', 'color service'],
    menu: ['salon services', 'hair treatments', 'beauty packages'],
  },

  // Trade & Services
  'plumbing': {
    hero: ['professional plumber working', 'plumbing service', 'home repair'],
    features: ['pipe repair', 'plumbing installation', 'water heater'],
    team: ['plumber portrait professional', 'service technician', 'repair expert'],
    testimonial: ['satisfied homeowner', 'repair success', 'happy customer service'],
    gallery: ['plumbing work', 'bathroom renovation', 'kitchen plumbing'],
    cta: ['plumbing emergency', 'service call', 'repair request'],
    product: ['plumbing service', 'repair work', 'installation'],
    menu: ['plumbing services', 'repair options', 'maintenance packages'],
  },
  'landscaping': {
    hero: ['beautiful garden landscape', 'landscaping professional', 'garden design'],
    features: ['lawn maintenance', 'garden planting', 'outdoor design'],
    team: ['landscaper portrait', 'garden team', 'outdoor professional'],
    testimonial: ['garden transformation', 'happy homeowner yard', 'landscaping success'],
    gallery: ['landscaping projects', 'garden designs', 'outdoor spaces'],
    cta: ['landscaping consultation', 'garden design', 'outdoor transformation'],
    product: ['landscaping service', 'garden maintenance', 'design project'],
    menu: ['landscaping services', 'maintenance plans', 'design packages'],
  },
}

// High-quality static fallbacks (used when Unsplash API is unavailable)
const STATIC_FALLBACKS = {
  hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop&q=80',
  features: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80',
  team: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
  testimonial: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80',
  gallery: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop&q=80',
  cta: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=900&fit=crop&q=80',
  product: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&q=80',
  menu: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80',
}

// Cache for fetched images to avoid duplicate API calls
const imageCache = new Map<string, { url: string; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get a relevant fallback image from Unsplash for a specific business type and section
 */
export async function getFallbackImage(
  businessType: string,
  sectionType: 'hero' | 'features' | 'team' | 'testimonial' | 'gallery' | 'cta' | 'product' | 'menu',
  index: number = 0
): Promise<string> {
  const cacheKey = `${businessType}-${sectionType}-${index}`

  // Check cache first
  const cached = imageCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.url
  }

  // Try to fetch from Unsplash
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    console.log('Unsplash API key not configured, using static fallback')
    return STATIC_FALLBACKS[sectionType] || STATIC_FALLBACKS.hero
  }

  try {
    // Get search queries for this business type and section
    const config = FALLBACK_SEARCH_CONFIG[businessType.toLowerCase()] || getDefaultQueries(businessType)
    const queries = config[sectionType] || config.hero

    // Select query based on index to get variety
    const query = queries[index % queries.length]

    // Determine orientation based on section type
    const orientation = ['hero', 'cta'].includes(sectionType) ? 'landscape' :
                       ['team', 'testimonial', 'product'].includes(sectionType) ? 'squarish' : 'landscape'

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=5`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
        // Short timeout for fallback images - we don't want to delay too long
        signal: AbortSignal.timeout(3000),
      }
    )

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data = await response.json()
    const results = data.results || []

    if (results.length > 0) {
      // Pick image based on index for variety, with quality parameters
      const photo = results[index % results.length]
      const imageUrl = getOptimizedUrl(photo, sectionType)

      // Cache the result
      imageCache.set(cacheKey, { url: imageUrl, timestamp: Date.now() })

      return imageUrl
    }
  } catch (error) {
    console.warn(`Failed to fetch fallback image from Unsplash: ${error}`)
  }

  // Return static fallback if Unsplash fails
  return STATIC_FALLBACKS[sectionType] || STATIC_FALLBACKS.hero
}

/**
 * Get multiple fallback images at once (more efficient for batch operations)
 */
export async function getFallbackImages(
  businessType: string,
  sectionType: 'hero' | 'features' | 'team' | 'testimonial' | 'gallery' | 'cta' | 'product' | 'menu',
  count: number
): Promise<string[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY

  if (!accessKey) {
    console.log('Unsplash API key not configured, using static fallbacks')
    return Array.from({ length: count }, () => STATIC_FALLBACKS[sectionType] || STATIC_FALLBACKS.hero)
  }

  try {
    // Get search queries for this business type and section
    const config = FALLBACK_SEARCH_CONFIG[businessType.toLowerCase()] || getDefaultQueries(businessType)
    const queries = config[sectionType] || config.hero
    const query = queries[0] // Use primary query for batch fetch

    // Determine orientation based on section type
    const orientation = ['hero', 'cta'].includes(sectionType) ? 'landscape' :
                       ['team', 'testimonial', 'product'].includes(sectionType) ? 'squarish' : 'landscape'

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=${Math.min(count + 2, 15)}`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
        signal: AbortSignal.timeout(5000),
      }
    )

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data = await response.json()
    const results = data.results || []

    if (results.length > 0) {
      // Map results to optimized URLs
      const images = results.slice(0, count).map((photo: any) => getOptimizedUrl(photo, sectionType))

      // If we don't have enough images, pad with duplicates or static fallback
      while (images.length < count) {
        images.push(images[images.length % results.length] || STATIC_FALLBACKS[sectionType])
      }

      return images
    }
  } catch (error) {
    console.warn(`Failed to fetch fallback images from Unsplash: ${error}`)
  }

  // Return static fallbacks if Unsplash fails
  return Array.from({ length: count }, () => STATIC_FALLBACKS[sectionType] || STATIC_FALLBACKS.hero)
}

/**
 * Get optimized Unsplash URL with appropriate dimensions
 */
function getOptimizedUrl(photo: any, sectionType: string): string {
  const baseUrl = photo.urls?.regular || photo.urls?.small || photo.urls?.raw

  if (!baseUrl) {
    return STATIC_FALLBACKS[sectionType as keyof typeof STATIC_FALLBACKS] || STATIC_FALLBACKS.hero
  }

  // Get dimensions based on section type
  const dimensions = {
    hero: { w: 1600, h: 900 },
    cta: { w: 1600, h: 900 },
    features: { w: 800, h: 600 },
    gallery: { w: 800, h: 600 },
    team: { w: 400, h: 400 },
    testimonial: { w: 400, h: 400 },
    product: { w: 800, h: 800 },
    menu: { w: 800, h: 600 },
  }

  const { w, h } = dimensions[sectionType as keyof typeof dimensions] || dimensions.features

  // If it's already an Unsplash URL, add optimization parameters
  if (baseUrl.includes('unsplash.com')) {
    const url = new URL(baseUrl)
    url.searchParams.set('w', w.toString())
    url.searchParams.set('h', h.toString())
    url.searchParams.set('fit', 'crop')
    url.searchParams.set('q', '80')
    return url.toString()
  }

  return baseUrl
}

/**
 * Generate default search queries for unknown business types
 */
function getDefaultQueries(businessType: string): typeof FALLBACK_SEARCH_CONFIG[string] {
  const typeLabel = businessType.replace(/-/g, ' ')

  return {
    hero: [`${typeLabel} business professional`, 'modern business workspace', 'professional office'],
    features: [`${typeLabel} services`, 'business services', 'professional work'],
    team: ['business professional portrait', 'team member professional', 'employee friendly'],
    testimonial: ['satisfied customer', 'happy client', 'business success'],
    gallery: [`${typeLabel} work`, 'professional portfolio', 'business showcase'],
    cta: ['business opportunity', 'professional success', 'modern office'],
    product: ['product professional', 'service offering', 'business product'],
    menu: ['services menu', 'offerings list', 'business options'],
  }
}

/**
 * Clear the image cache (useful for testing or memory management)
 */
export function clearImageCache(): void {
  imageCache.clear()
}
