/**
 * Unsplash Image Service
 *
 * Provides rapid, high-quality, business-relevant images from Unsplash.
 *
 * Strategy:
 * - Primary: Unsplash for instant, professional stock photography
 * - Quality: Raw imgix URLs at 2×–3× resolution with format optimisation
 * - Queries: Aesthetic editorial modifiers for Lovable-style visual quality
 */

import { createApi } from 'unsplash-js'

// Initialize Unsplash API client
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
})

// ─────────────────────────────────────────────────────────────────────────────
// QUALITY URL BUILDER
// Uses Unsplash's imgix pipeline on the raw URL for crisp, high-res output.
// This is the single biggest lever for "Lovable-quality" visuals.
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_IMAGE_PARAMS: Record<string, { w: number; h: number; q: number }> = {
  hero:         { w: 2400, h: 1350, q: 92 }, // 16:9, retina hero
  about:        { w: 1800, h: 1012, q: 90 }, // 16:9, wide
  services:     { w: 960,  h: 960,  q: 88 }, // 1:1 square card
  features:     { w: 960,  h: 960,  q: 88 }, // 1:1 square card
  gallery:      { w: 960,  h: 960,  q: 88 }, // 1:1 square
  team:         { w: 640,  h: 800,  q: 90 }, // portrait
  testimonials: { w: 800,  h: 800,  q: 88 }, // square avatar / bg
  contact:      { w: 1800, h: 900,  q: 88 }, // landscape
  cta:          { w: 2400, h: 1000, q: 90 }, // wide cinematic
}

function buildQualityUrl(rawUrl: string, sectionType: string): string {
  const key = sectionType.toLowerCase()
  const p = SECTION_IMAGE_PARAMS[key] || { w: 1600, h: 900, q: 88 }
  // imgix parameters: width, height, crop to fill, quality, auto format (WebP/AVIF)
  return `${rawUrl}&w=${p.w}&h=${p.h}&fit=crop&crop=focalpoint&q=${p.q}&auto=format&fm=webp&sat=5`
  // sat=5 gives a subtle vibrancy boost — same trick Lovable uses
}

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS-SPECIFIC SEARCH QUERIES
//
// Rule: every query ends with an aesthetic/editorial modifier.
// This is what separates generic stock from editorial-quality photography.
//
// Best modifiers (pick by mood):
//   editorial photography  → sharp, professional, magazine-worthy
//   luxury minimal         → premium, clean, uncluttered
//   cinematic lighting     → dramatic, immersive
//   warm natural light     → inviting, human, approachable
//   clean aesthetic        → minimal, modern
//   lifestyle photography  → authentic, relatable
// ─────────────────────────────────────────────────────────────────────────────
const BUSINESS_IMAGE_QUERIES: Record<string, {
  hero: string[]
  about: string[]
  services: string[]
  team: string[]
  gallery: string[]
  features: string[]
}> = {
  restaurant: {
    hero: [
      'fine dining restaurant interior warm lighting editorial',
      'upscale restaurant ambiance cinematic photography',
      'elegant dining room golden hour luxury minimal',
    ],
    about: [
      'executive chef plating dish professional kitchen editorial',
      'chef at work open kitchen warm natural light',
      'culinary artistry professional kitchen lifestyle photography',
    ],
    services: [
      'gourmet food plating overhead editorial photography',
      'restaurant signature dish close-up cinematic lighting',
      'fine dining cuisine beautiful presentation luxury',
    ],
    team: [
      'chef portrait professional confident warm light',
      'sommelier restaurant professional headshot clean background',
      'culinary professional portrait natural light editorial',
    ],
    gallery: [
      'food photography moody dark editorial',
      'restaurant dish artistic overhead luxury minimal',
      'culinary presentation award-winning photography',
    ],
    features: [
      'dining experience happy couple restaurant candid',
      'service excellence restaurant warm atmosphere lifestyle',
      'restaurant hospitality authentic moment editorial',
    ],
  },

  bakery: {
    hero: [
      'artisan bakery interior golden hour warm natural light',
      'rustic patisserie shop display editorial photography',
      'cozy bakery cafe morning light lifestyle',
    ],
    about: [
      'artisan baker hands shaping dough editorial close-up',
      'sourdough bread making authentic craft lifestyle photography',
      'pastry chef at work professional kitchen warm light',
    ],
    services: [
      'fresh croissants pastries golden sunlight editorial',
      'artisan bread assortment rustic editorial photography',
      'patisserie display luxury minimal clean aesthetic',
    ],
    team: [
      'baker portrait apron flour natural light warm',
      'pastry chef professional confident clean background',
      'artisan baker smiling professional editorial',
    ],
    gallery: [
      'bread photography artistic moody warm tones',
      'pastry close-up macro luxury editorial photography',
      'bakery goods flat lay minimal editorial',
    ],
    features: [
      'fresh baked bread hands rustic lifestyle photography',
      'morning coffee croissant cozy lifestyle editorial',
      'bakery craftsmanship authentic warm aesthetic',
    ],
  },

  'coffee-shop': {
    hero: [
      'specialty coffee shop interior moody warm cinematic',
      'third wave cafe aesthetic minimal natural light editorial',
      'modern coffee bar barista workflow lifestyle photography',
    ],
    about: [
      'barista latte art pour-over editorial close-up',
      'coffee preparation ritual specialty cafe lifestyle',
      'espresso extraction professional cinematic photography',
    ],
    services: [
      'specialty coffee drink latte art flat lay editorial',
      'pour-over coffee ritual warm light lifestyle photography',
      'espresso drink beautiful presentation minimal aesthetic',
    ],
    team: [
      'barista portrait professional warm smile cafe',
      'coffee professional confident natural light clean background',
      'specialty barista headshot editorial warm tones',
    ],
    gallery: [
      'coffee cup moody dark editorial photography',
      'cafe atmosphere candid lifestyle warm light',
      'latte art overhead minimal clean aesthetic',
    ],
    features: [
      'cafe culture community laptop work lifestyle editorial',
      'morning coffee ritual warm cozy lifestyle',
      'specialty coffee experience authentic candid',
    ],
  },

  'law-firm': {
    hero: [
      'prestigious law office interior elegant natural light editorial',
      'modern law firm meeting room luxury minimal clean',
      'law library books professional cinematic photography',
    ],
    about: [
      'attorney office desk confident professional editorial',
      'lawyer consultation handshake trust lifestyle photography',
      'legal professional at work natural light clean aesthetic',
    ],
    services: [
      'legal consultation meeting professional warm editorial',
      'attorney client discussion modern office lifestyle',
      'legal documents signing professional editorial',
    ],
    team: [
      'attorney professional portrait confident neutral background',
      'lawyer headshot business formal editorial photography',
      'legal professional portrait confident window light',
    ],
    gallery: [
      'law office interior elegant minimal editorial',
      'legal library classic books warm light editorial',
      'corporate meeting room modern luxury minimal',
    ],
    features: [
      'legal expertise handshake trust editorial lifestyle',
      'attorney working research professional warm light',
      'legal victory success confident professional editorial',
    ],
  },

  'tech-saas': {
    hero: [
      'modern tech office collaborative workspace editorial photography',
      'innovation lab interior minimal clean cinematic',
      'startup office creative workspace natural light lifestyle',
    ],
    about: [
      'diverse tech team collaborating whiteboard editorial',
      'software engineers working together open office lifestyle',
      'agile team sprint meeting energetic editorial',
    ],
    services: [
      'laptop modern dashboard minimal clean desk editorial',
      'developer workspace dual monitor clean aesthetic',
      'tech product demo professional editorial photography',
    ],
    team: [
      'tech professional portrait confident modern office editorial',
      'software engineer headshot warm natural light clean background',
      'startup founder portrait confident minimal editorial',
    ],
    gallery: [
      'modern office space minimal light editorial photography',
      'creative workspace inspiration board lifestyle editorial',
      'tech innovation interior clean aesthetic photography',
    ],
    features: [
      'technology success team high five editorial lifestyle',
      'digital transformation professional modern editorial',
      'software product results growth editorial photography',
    ],
  },

  fitness: {
    hero: [
      'luxury gym interior premium equipment editorial photography',
      'modern fitness center clean minimal cinematic lighting',
      'high-end gym workout space natural light editorial',
    ],
    about: [
      'personal training session athlete motivation editorial',
      'fitness coach client workout authentic lifestyle photography',
      'gym dedication training cinematic editorial photography',
    ],
    services: [
      'personal training one-on-one authentic lifestyle editorial',
      'group fitness class energy motivation editorial photography',
      'strength training technique professional editorial',
    ],
    team: [
      'personal trainer portrait confident athletic editorial',
      'fitness coach professional headshot natural light',
      'gym instructor portrait energetic clean background',
    ],
    gallery: [
      'gym equipment modern minimal editorial photography',
      'fitness training dynamic athletic cinematic',
      'workout achievement motivation editorial lifestyle',
    ],
    features: [
      'fitness results transformation before after editorial',
      'gym culture community authentic lifestyle photography',
      'athletic performance editorial cinematic photography',
    ],
  },

  'beauty-spa': {
    hero: [
      'luxury spa interior serene minimal natural light editorial',
      'wellness retreat tranquil room cinematic photography',
      'premium spa treatment room elegant calm editorial',
    ],
    about: [
      'esthetician facial treatment serene editorial photography',
      'spa therapist professional care authentic lifestyle',
      'massage therapy wellness calm editorial photography',
    ],
    services: [
      'luxury facial treatment close-up editorial photography',
      'massage therapy relaxation warm light lifestyle editorial',
      'skincare routine luxury minimal editorial photography',
    ],
    team: [
      'spa therapist portrait warm professional natural light',
      'esthetician professional headshot clean background serene',
      'wellness expert portrait confident calm editorial',
    ],
    gallery: [
      'spa interior serene minimal warm editorial photography',
      'wellness room candles luxury calm editorial',
      'beauty treatment detail macro editorial photography',
    ],
    features: [
      'spa relaxation glow skin results editorial lifestyle',
      'wellness experience authentic calm editorial photography',
      'beauty transformation confident woman editorial lifestyle',
    ],
  },

  'pet-services': {
    hero: [
      'happy dog portrait professional warm light editorial',
      'premium pet grooming salon clean minimal editorial',
      'playful pets facility bright editorial photography',
    ],
    about: [
      'pet groomer working dog gentle care editorial lifestyle',
      'dog grooming session professional authentic editorial',
      'veterinarian caring pet professional warm editorial',
    ],
    services: [
      'dog grooming spa fluffy clean editorial photography',
      'pet bathing adorable authentic lifestyle editorial',
      'dog haircut transformation before after editorial',
    ],
    team: [
      'pet groomer portrait warm smile natural light editorial',
      'veterinarian professional confident clean background',
      'pet care specialist portrait authentic editorial',
    ],
    gallery: [
      'happy dog portrait golden light editorial photography',
      'cute pets photogenic editorial warm light lifestyle',
      'pet portrait professional shallow depth of field editorial',
    ],
    features: [
      'happy pet owner with dog authentic lifestyle editorial',
      'dog park play authentic candid editorial photography',
      'pet care love bond authentic lifestyle editorial',
    ],
  },

  'real-estate': {
    hero: [
      'luxury home exterior architectural photography golden hour',
      'modern house architecture minimal editorial cinematic',
      'dream property exterior natural light editorial photography',
    ],
    about: [
      'real estate agent client home tour authentic lifestyle',
      'realtor keys handover happy clients editorial',
      'property consultation professional warm editorial photography',
    ],
    services: [
      'luxury home interior living room editorial photography',
      'modern kitchen interior minimal editorial clean aesthetic',
      'beautiful property staging editorial interior photography',
    ],
    team: [
      'real estate agent portrait confident professional editorial',
      'realtor headshot warm natural light clean background',
      'property agent professional portrait editorial',
    ],
    gallery: [
      'luxury homes architecture editorial photography',
      'property interior staging minimal editorial clean',
      'real estate exterior golden hour cinematic editorial',
    ],
    features: [
      'homeowner keys happiness authentic lifestyle editorial',
      'property investment success confident editorial',
      'dream home couple authentic lifestyle editorial photography',
    ],
  },

  'hair-salon': {
    hero: [
      'modern hair salon interior chic editorial photography',
      'luxury beauty salon minimal clean cinematic',
      'contemporary salon styling station editorial warm light',
    ],
    about: [
      'hairstylist at work client care editorial lifestyle',
      'salon styling professional authentic editorial photography',
      'hair professional passion craft editorial close-up',
    ],
    services: [
      'hair color transformation editorial close-up photography',
      'balayage highlight technique editorial salon photography',
      'haircut styling professional editorial warm light',
    ],
    team: [
      'hairstylist portrait confident professional editorial',
      'salon stylist headshot warm light natural clean background',
      'hair expert portrait authentic editorial photography',
    ],
    gallery: [
      'hair styling beautiful result editorial photography',
      'salon hair transformation editorial close-up',
      'hair color editorial portrait natural light',
    ],
    features: [
      'hair transformation confident client editorial lifestyle',
      'salon experience luxury authentic editorial photography',
      'beautiful hair result editorial portrait warm light',
    ],
  },

  consulting: {
    hero: [
      'modern corporate office boardroom editorial cinematic',
      'executive business consultation meeting editorial photography',
      'professional consulting firm interior minimal luxury editorial',
    ],
    about: [
      'business consultant strategy session whiteboard editorial',
      'executive consultation meeting room authentic lifestyle',
      'corporate team collaboration professional editorial',
    ],
    services: [
      'business strategy presentation professional editorial',
      'consulting meeting data analysis editorial lifestyle',
      'corporate problem solving team editorial photography',
    ],
    team: [
      'business consultant portrait confident professional editorial',
      'corporate executive headshot clean window light editorial',
      'management consultant portrait editorial warm light',
    ],
    gallery: [
      'corporate office interior modern minimal editorial',
      'business workspace executive editorial photography',
      'professional meeting room luxury editorial clean',
    ],
    features: [
      'business growth chart success editorial lifestyle',
      'consulting results achievement confident editorial',
      'business transformation strategy editorial photography',
    ],
  },

  // ── Event / Spinupfy-style business types ───────────────────────────────
  event: {
    hero: [
      'luxury event venue interior golden editorial photography',
      'event setup decor elegant cinematic editorial',
      'gala dinner venue warm lights editorial photography',
    ],
    about: [
      'event planner at work professional editorial lifestyle',
      'event coordinator team setup authentic editorial',
      'event production behind-the-scenes editorial photography',
    ],
    services: [
      'event decor florals luxury editorial photography',
      'event catering spread elegant editorial lifestyle',
      'event stage lighting cinematic editorial photography',
    ],
    team: [
      'event planner portrait professional warm editorial',
      'event coordinator headshot confident clean background',
      'event professional portrait editorial natural light',
    ],
    gallery: [
      'event photography candid moments editorial lifestyle',
      'gala event atmosphere editorial cinematic',
      'event details decor macro editorial photography',
    ],
    features: [
      'event success celebration guests authentic editorial',
      'corporate event networking professional editorial',
      'event experience luxury authentic editorial lifestyle',
    ],
  },

  default: {
    hero: [
      'professional business interior modern editorial photography',
      'contemporary workspace minimal clean cinematic editorial',
      'successful business atmosphere editorial lifestyle photography',
    ],
    about: [
      'professional at work authentic editorial lifestyle photography',
      'business expertise confidence warm natural light editorial',
      'workplace dedication professional editorial photography',
    ],
    services: [
      'professional service delivery editorial lifestyle photography',
      'quality work results authentic editorial photography',
      'business excellence professional editorial warm light',
    ],
    team: [
      'professional portrait confident natural light editorial',
      'business headshot warm clean background editorial',
      'corporate professional portrait editorial modern',
    ],
    gallery: [
      'modern workspace minimal editorial photography',
      'professional environment clean aesthetic editorial',
      'business setting editorial lifestyle photography',
    ],
    features: [
      'professional service experience authentic editorial',
      'business quality results editorial lifestyle photography',
      'expert work showcase editorial photography',
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// ORIENTATION PREFERENCES BY SECTION
// ─────────────────────────────────────────────────────────────────────────────
const ORIENTATION_PREFERENCES: Record<string, 'landscape' | 'portrait' | 'squarish'> = {
  hero:         'landscape',
  features:     'squarish',
  services:     'squarish',
  about:        'landscape',
  team:         'portrait',
  gallery:      'squarish',
  contact:      'landscape',
  testimonials: 'squarish',
  cta:          'landscape',
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

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT FILTER — no photography gear, brand logos
// ─────────────────────────────────────────────────────────────────────────────
const PROHIBITED_KEYWORDS = [
  'camera', 'tripod', 'lens', 'photographer', 'studio light',
  'umbrella light', 'softbox', 'reflector', 'flash', 'photo equipment',
  'apple', 'iphone', 'ipad', 'macbook', 'microsoft', 'google', 'nike',
  'samsung', 'logo', 'brand', 'branded',
]

function filterProhibitedImages(images: any[]): any[] {
  return images.filter(photo => {
    const description = (photo.alt_description || photo.description || '').toLowerCase()
    const tags = (photo.tags || []).map((t: any) => (t.title || t).toLowerCase())
    const allText = [description, ...tags].join(' ')
    const hasProhibited = PROHIBITED_KEYWORDS.some(kw => allText.includes(kw.toLowerCase()))
    if (hasProhibited) console.log(`🚫 Filtered out image: ${description.slice(0, 60)}`)
    return !hasProhibited
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE SEARCH
// ─────────────────────────────────────────────────────────────────────────────
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
    const businessQueries = BUSINESS_IMAGE_QUERIES[businessType.toLowerCase()] || BUSINESS_IMAGE_QUERIES.default
    const sectionQueries = businessQueries[sectionType.toLowerCase() as keyof typeof businessQueries] || businessQueries.hero
    const searchQuery = query || sectionQueries[0]
    const orientation = ORIENTATION_PREFERENCES[sectionType.toLowerCase()] || 'landscape'

    console.log(`🔍 Unsplash: "${searchQuery}" (${orientation}, ${businessType}/${sectionType})`)

    const result = await unsplash.search.getPhotos({
      query: searchQuery,
      page: 1,
      perPage: count * 4,   // request 4× to survive filtering
      orientation,
      orderBy: 'relevant',  // relevance-ranked results
      contentFilter: 'high',
    })

    if (result.type === 'error') {
      console.error('Unsplash search error:', result.errors)
      return []
    }

    if (!result.response || result.response.results.length === 0) {
      console.warn(`No Unsplash results for: ${searchQuery}`)
      return []
    }

    const filtered = filterProhibitedImages(result.response.results)
    const photosToUse = filtered.length > 0 ? filtered : result.response.results

    const images: UnsplashImageResult[] = photosToUse.slice(0, count).map(photo => ({
      // ← KEY CHANGE: use raw URL + imgix params for crisp high-resolution output
      url: buildQualityUrl(photo.urls.raw, sectionType),
      downloadUrl: photo.links.download_location,
      altText: photo.alt_description || photo.description || `${sectionType} image for ${businessType}`,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      unsplashUrl: photo.links.html,
      width: photo.width,
      height: photo.height,
    }))

    console.log(`✅ Unsplash: ${images.length} high-quality images for "${searchQuery}"`)
    return images

  } catch (error) {
    console.error('Unsplash API error:', error)
    return []
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export async function getUnsplashImageForSection(params: {
  businessType: string
  sectionType: string
  description?: string
}): Promise<UnsplashImageResult | null> {
  const images = await searchUnsplashImages({ ...params, count: 1 })
  return images[0] || null
}

export async function trackUnsplashDownload(downloadUrl: string): Promise<void> {
  if (!process.env.UNSPLASH_ACCESS_KEY) return
  try {
    await fetch(downloadUrl, {
      headers: { 'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
    })
  } catch (error) {
    console.error('Failed to track Unsplash download:', error)
  }
}

export async function getMultipleImages(params: {
  businessType: string
  sectionType: string
  count: number
}): Promise<UnsplashImageResult[]> {
  const { businessType, sectionType, count } = params
  let images = await searchUnsplashImages({ businessType, sectionType, count })

  if (images.length < count) {
    const businessQueries = BUSINESS_IMAGE_QUERIES[businessType.toLowerCase()] || BUSINESS_IMAGE_QUERIES.default
    const sectionQueries = businessQueries[sectionType.toLowerCase() as keyof typeof businessQueries] || businessQueries.hero

    for (let i = 1; i < sectionQueries.length && images.length < count; i++) {
      const more = await searchUnsplashImages({
        businessType,
        sectionType,
        query: sectionQueries[i],
        count: count - images.length,
      })
      images = [...images, ...more]
    }
  }

  return images.slice(0, count)
}

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
