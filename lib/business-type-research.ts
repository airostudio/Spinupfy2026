/**
 * Business Type Research Service
 *
 * STRICTLY searches the internet to find the top websites for a given business type.
 * This is a MANDATORY step in the website generation process.
 *
 * If the business type is unknown or not found, it finds the closest matching type.
 */

import { BUSINESS_TYPES } from './config/business-types'
import { BusinessTypeConfig } from './types/business.types'
import { detectBusinessType, DetectionResult } from './business-type-detector'

export interface TopWebsiteResult {
  name: string
  url: string
  description: string
  rank: number
  designInsights?: {
    colorScheme?: string
    layoutStyle?: string
    keyFeatures?: string[]
  }
}

export interface BusinessTypeResearchResult {
  // Resolved business type (original or closest match)
  resolvedType: BusinessTypeConfig
  // Whether the original type was found or we used a fallback
  wasExactMatch: boolean
  // Original type requested (if different from resolved)
  originalTypeRequested?: string
  // Top websites found for this business type
  topWebsites: TopWebsiteResult[]
  // Insights extracted from research
  insights: {
    commonFeatures: string[]
    designTrends: string[]
    contentPatterns: string[]
    mustHaveElements: string[]
  }
  // Summary for AI consumption
  researchSummary: string
  // Search status
  searchStatus: 'web_search' | 'curated_fallback' | 'error_fallback'
}

/**
 * Similarity calculation using Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Calculate similarity score between two strings (0-1, 1 being identical)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()

  if (s1 === s2) return 1

  const maxLength = Math.max(s1.length, s2.length)
  if (maxLength === 0) return 1

  const distance = levenshteinDistance(s1, s2)
  return 1 - distance / maxLength
}

/**
 * Find the closest matching business type using multiple strategies
 */
export function findClosestBusinessType(
  unknownType: string,
  description?: string
): { type: BusinessTypeConfig; confidence: number; matchMethod: string } {
  const normalizedInput = unknownType.toLowerCase().trim().replace(/-/g, ' ')

  // Strategy 1: Try exact ID match
  const exactMatch = BUSINESS_TYPES.find(
    (t) => t.id.toLowerCase() === normalizedInput.replace(/ /g, '-')
  )
  if (exactMatch) {
    return { type: exactMatch, confidence: 1, matchMethod: 'exact_id' }
  }

  // Strategy 2: Try label match
  const labelMatch = BUSINESS_TYPES.find(
    (t) => t.label.toLowerCase() === normalizedInput
  )
  if (labelMatch) {
    return { type: labelMatch, confidence: 1, matchMethod: 'exact_label' }
  }

  // Strategy 3: Keyword-based matching
  let bestKeywordMatch: { type: BusinessTypeConfig; score: number } | null = null
  for (const businessType of BUSINESS_TYPES) {
    const keywords = businessType.keywords || []
    let score = 0

    for (const keyword of keywords) {
      if (normalizedInput.includes(keyword.toLowerCase())) {
        score += 10
      }
      if (keyword.toLowerCase().includes(normalizedInput)) {
        score += 5
      }
    }

    // Also check label words
    const labelWords = businessType.label.toLowerCase().split(' ')
    for (const word of labelWords) {
      if (normalizedInput.includes(word) && word.length > 2) {
        score += 8
      }
    }

    if (score > 0 && (!bestKeywordMatch || score > bestKeywordMatch.score)) {
      bestKeywordMatch = { type: businessType, score }
    }
  }

  if (bestKeywordMatch && bestKeywordMatch.score >= 8) {
    return {
      type: bestKeywordMatch.type,
      confidence: Math.min(bestKeywordMatch.score / 20, 0.95),
      matchMethod: 'keyword_match',
    }
  }

  // Strategy 4: Fuzzy string matching on labels and IDs
  let bestFuzzyMatch: { type: BusinessTypeConfig; similarity: number } | null =
    null
  for (const businessType of BUSINESS_TYPES) {
    const labelSimilarity = calculateSimilarity(
      normalizedInput,
      businessType.label
    )
    const idSimilarity = calculateSimilarity(
      normalizedInput,
      businessType.id.replace(/-/g, ' ')
    )
    const maxSimilarity = Math.max(labelSimilarity, idSimilarity)

    if (!bestFuzzyMatch || maxSimilarity > bestFuzzyMatch.similarity) {
      bestFuzzyMatch = { type: businessType, similarity: maxSimilarity }
    }
  }

  if (bestFuzzyMatch && bestFuzzyMatch.similarity > 0.5) {
    return {
      type: bestFuzzyMatch.type,
      confidence: bestFuzzyMatch.similarity,
      matchMethod: 'fuzzy_match',
    }
  }

  // Strategy 5: Use description-based detection if provided
  if (description) {
    const detectionResult = detectBusinessType(description, unknownType)
    if (detectionResult.confidence > 0.3) {
      return {
        type: detectionResult.primaryType,
        confidence: detectionResult.confidence,
        matchMethod: 'description_detection',
      }
    }
  }

  // Strategy 6: Category-based fallback mapping
  const categoryFallbacks: Record<string, string> = {
    // Food-related
    food: 'restaurant',
    dining: 'restaurant',
    meal: 'restaurant',
    eat: 'restaurant',
    cafe: 'coffee-shop',
    coffee: 'coffee-shop',
    bake: 'bakery',
    pastry: 'bakery',

    // Professional services
    legal: 'law-firm',
    lawyer: 'law-firm',
    attorney: 'law-firm',
    finance: 'accounting',
    tax: 'accounting',
    money: 'financial',
    investment: 'financial',
    consult: 'consulting',
    advise: 'consulting',
    strategy: 'consulting',

    // Health & Wellness
    health: 'medical',
    doctor: 'medical',
    clinic: 'medical',
    teeth: 'dental',
    dentist: 'dental',
    gym: 'fitness',
    workout: 'fitness',
    exercise: 'fitness',
    spa: 'beauty-spa',
    massage: 'beauty-spa',
    beauty: 'beauty-spa',
    hair: 'hair-salon',
    salon: 'hair-salon',
    barber: 'hair-salon',

    // Home services
    electric: 'electrician',
    plumb: 'plumber',
    pipe: 'plumber',
    heat: 'hvac',
    air: 'hvac',
    cooling: 'hvac',
    roof: 'roofer',
    build: 'construction',
    construct: 'construction',
    renovate: 'construction',
    landscape: 'landscaping',
    garden: 'landscaping',
    lawn: 'landscaping',

    // Tech & Digital
    tech: 'tech-saas',
    software: 'tech-saas',
    app: 'tech-saas',
    digital: 'tech-saas',
    design: 'creative-agency',
    creative: 'creative-agency',
    brand: 'creative-agency',
    marketing: 'marketing-agency',
    advertis: 'marketing-agency',
    seo: 'marketing-agency',

    // Other
    property: 'real-estate',
    home: 'real-estate',
    house: 'real-estate',
    pet: 'pet-services',
    dog: 'pet-services',
    cat: 'pet-services',
    animal: 'pet-services',
    photo: 'photography',
    camera: 'photography',
    shop: 'ecommerce',
    store: 'ecommerce',
    sell: 'ecommerce',
    retail: 'ecommerce',
    hotel: 'hospitality',
    travel: 'travel-agency',
    vacation: 'travel-agency',
    event: 'event-planning',
    wedding: 'wedding-planning',
    school: 'education',
    learn: 'education',
    train: 'education',
    nonprofit: 'nonprofit',
    charity: 'nonprofit',
  }

  for (const [keyword, fallbackTypeId] of Object.entries(categoryFallbacks)) {
    if (normalizedInput.includes(keyword)) {
      const fallbackType = BUSINESS_TYPES.find((t) => t.id === fallbackTypeId)
      if (fallbackType) {
        return {
          type: fallbackType,
          confidence: 0.6,
          matchMethod: 'category_fallback',
        }
      }
    }
  }

  // Final fallback: Use consulting as the most generic business type
  const defaultType =
    BUSINESS_TYPES.find((t) => t.id === 'consulting') || BUSINESS_TYPES[0]
  return {
    type: defaultType,
    confidence: 0.3,
    matchMethod: 'default_fallback',
  }
}

/**
 * Search the internet for top websites of a business type
 */
async function searchTopWebsites(
  businessType: string,
  businessLabel: string,
  limit: number = 5
): Promise<{ websites: TopWebsiteResult[]; searchMethod: string }> {
  const searchQueries = [
    `best ${businessLabel.toLowerCase()} website design examples 2025`,
    `top ${businessLabel.toLowerCase()} company websites`,
    `award winning ${businessLabel.toLowerCase()} websites`,
    `${businessLabel.toLowerCase()} website inspiration`,
  ]

  // Try Serper API (Google Search)
  if (process.env.SERPER_API_KEY) {
    try {
      const results = await searchWithSerperForBusinessType(searchQueries, limit)
      if (results.length > 0) {
        return { websites: results, searchMethod: 'serper_api' }
      }
    } catch (error) {
      console.error('Serper search failed for business type research:', error)
    }
  }

  // Try Brave Search API
  if (process.env.BRAVE_SEARCH_API_KEY) {
    try {
      const results = await searchWithBraveForBusinessType(searchQueries, limit)
      if (results.length > 0) {
        return { websites: results, searchMethod: 'brave_api' }
      }
    } catch (error) {
      console.error('Brave search failed for business type research:', error)
    }
  }

  // Try Bing Search API
  if (process.env.BING_SEARCH_API_KEY) {
    try {
      const results = await searchWithBingForBusinessType(searchQueries, limit)
      if (results.length > 0) {
        return { websites: results, searchMethod: 'bing_api' }
      }
    } catch (error) {
      console.error('Bing search failed for business type research:', error)
    }
  }

  // Fallback to curated database
  console.log(
    `No search API available for ${businessType}, using curated database`
  )
  return {
    websites: getCuratedTopWebsites(businessType, limit),
    searchMethod: 'curated_database',
  }
}

/**
 * Search using Serper API
 */
async function searchWithSerperForBusinessType(
  queries: string[],
  limit: number
): Promise<TopWebsiteResult[]> {
  const results: TopWebsiteResult[] = []
  const seenUrls = new Set<string>()

  for (const query of queries.slice(0, 2)) {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: 10,
          gl: 'us',
          hl: 'en',
        }),
      })

      if (!response.ok) continue

      const data = await response.json()
      const organic = data.organic || []

      for (const result of organic) {
        if (results.length >= limit) break
        if (seenUrls.has(result.link)) continue

        if (isQualityBusinessWebsite(result.link)) {
          seenUrls.add(result.link)
          results.push({
            name: result.title,
            url: result.link,
            description: result.snippet,
            rank: results.length + 1,
          })
        }
      }

      if (results.length >= limit) break
    } catch (error) {
      console.error(`Serper query failed: ${query}`, error)
    }
  }

  return results
}

/**
 * Search using Brave Search API
 */
async function searchWithBraveForBusinessType(
  queries: string[],
  limit: number
): Promise<TopWebsiteResult[]> {
  const results: TopWebsiteResult[] = []
  const seenUrls = new Set<string>()

  for (const query of queries.slice(0, 2)) {
    try {
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`,
        {
          headers: {
            'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY!,
            Accept: 'application/json',
          },
        }
      )

      if (!response.ok) continue

      const data = await response.json()
      const webResults = data.web?.results || []

      for (const result of webResults) {
        if (results.length >= limit) break
        if (seenUrls.has(result.url)) continue

        if (isQualityBusinessWebsite(result.url)) {
          seenUrls.add(result.url)
          results.push({
            name: result.title,
            url: result.url,
            description: result.description,
            rank: results.length + 1,
          })
        }
      }

      if (results.length >= limit) break
    } catch (error) {
      console.error(`Brave query failed: ${query}`, error)
    }
  }

  return results
}

/**
 * Search using Bing Search API
 */
async function searchWithBingForBusinessType(
  queries: string[],
  limit: number
): Promise<TopWebsiteResult[]> {
  const results: TopWebsiteResult[] = []
  const seenUrls = new Set<string>()

  for (const query of queries.slice(0, 2)) {
    try {
      const response = await fetch(
        `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=10`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': process.env.BING_SEARCH_API_KEY!,
          },
        }
      )

      if (!response.ok) continue

      const data = await response.json()
      const webPages = data.webPages?.value || []

      for (const result of webPages) {
        if (results.length >= limit) break
        if (seenUrls.has(result.url)) continue

        if (isQualityBusinessWebsite(result.url)) {
          seenUrls.add(result.url)
          results.push({
            name: result.name,
            url: result.url,
            description: result.snippet,
            rank: results.length + 1,
          })
        }
      }

      if (results.length >= limit) break
    } catch (error) {
      console.error(`Bing query failed: ${query}`, error)
    }
  }

  return results
}

/**
 * Check if URL is a quality business website (not aggregator/directory)
 */
function isQualityBusinessWebsite(url: string): boolean {
  const excludedDomains = [
    'yelp.com',
    'tripadvisor.com',
    'google.com',
    'facebook.com',
    'instagram.com',
    'twitter.com',
    'linkedin.com',
    'pinterest.com',
    'youtube.com',
    'wikipedia.org',
    'medium.com',
    'reddit.com',
    'quora.com',
    'awwwards.com',
    'dribbble.com',
    'behance.net',
    'themeforest.net',
    'templatemonster.com',
    'wix.com',
    'squarespace.com',
    'wordpress.org',
    'webflow.com',
    'siteinspire.com',
    'lapa.ninja',
    'onepagelove.com',
  ]

  try {
    const domain = new URL(url).hostname.toLowerCase()
    return !excludedDomains.some((excluded) => domain.includes(excluded))
  } catch {
    return false
  }
}

/**
 * Curated database of top websites by business type
 */
function getCuratedTopWebsites(
  businessType: string,
  limit: number
): TopWebsiteResult[] {
  const curatedWebsites: Record<string, TopWebsiteResult[]> = {
    restaurant: [
      {
        name: 'Eleven Madison Park',
        url: 'https://www.elevenmadisonpark.com',
        description: 'World-class fine dining with elegant, minimalist design',
        rank: 1,
        designInsights: {
          colorScheme: 'White, black, and gold accents',
          layoutStyle: 'Full-screen imagery with elegant typography',
          keyFeatures: ['Reservation system', 'Menu showcase', 'Story-driven content'],
        },
      },
      {
        name: 'The French Laundry',
        url: 'https://www.thomaskeller.com/tfl',
        description: "Thomas Keller's legendary restaurant",
        rank: 2,
        designInsights: {
          colorScheme: 'Cream, navy, and gold',
          layoutStyle: 'Classic elegance with modern touches',
          keyFeatures: ['Visual storytelling', 'Chef profile', 'Culinary philosophy'],
        },
      },
      {
        name: 'Alinea',
        url: 'https://www.alinearestaurant.com',
        description: 'Progressive American cuisine in Chicago',
        rank: 3,
      },
      {
        name: 'Blue Hill',
        url: 'https://www.bluehillfarm.com',
        description: 'Farm-to-table pioneer with sustainable focus',
        rank: 4,
      },
      {
        name: 'Noma',
        url: 'https://noma.dk',
        description: 'World-renowned Copenhagen restaurant',
        rank: 5,
      },
    ],
    bakery: [
      {
        name: 'Dominique Ansel Bakery',
        url: 'https://www.dominiqueansel.com',
        description: 'Creator of the Cronut with artisanal focus',
        rank: 1,
        designInsights: {
          colorScheme: 'Warm neutrals and pastry tones',
          layoutStyle: 'Product-focused with visual storytelling',
          keyFeatures: ['Product gallery', 'Online ordering', 'Location finder'],
        },
      },
      {
        name: 'Tartine Bakery',
        url: 'https://www.tartinebakery.com',
        description: 'San Francisco artisan bakery',
        rank: 2,
      },
      {
        name: 'Poilâne',
        url: 'https://www.poilane.com',
        description: 'Paris legendary sourdough',
        rank: 3,
      },
      {
        name: 'Levain Bakery',
        url: 'https://www.levainbakery.com',
        description: 'Famous NYC cookies',
        rank: 4,
      },
      {
        name: 'Flour Bakery',
        url: 'https://flourbakery.com',
        description: 'Boston artisan bakery',
        rank: 5,
      },
    ],
    'law-firm': [
      {
        name: 'Cravath, Swaine & Moore',
        url: 'https://www.cravath.com',
        description: 'Elite NYC law firm with sophisticated web presence',
        rank: 1,
        designInsights: {
          colorScheme: 'Navy, white, and gold',
          layoutStyle: 'Professional, authoritative, clean',
          keyFeatures: ['Practice areas', 'Attorney profiles', 'News & insights'],
        },
      },
      {
        name: 'Skadden, Arps',
        url: 'https://www.skadden.com',
        description: 'Global legal practice',
        rank: 2,
      },
      {
        name: 'Sullivan & Cromwell',
        url: 'https://www.sullcrom.com',
        description: 'Leading M&A practice',
        rank: 3,
      },
      {
        name: 'Gibson Dunn',
        url: 'https://www.gibsondunn.com',
        description: 'International law firm',
        rank: 4,
      },
      {
        name: 'Latham & Watkins',
        url: 'https://www.lw.com',
        description: 'Global law firm',
        rank: 5,
      },
    ],
    'real-estate': [
      {
        name: "Sotheby's International Realty",
        url: 'https://www.sothebysrealty.com',
        description: 'Luxury real estate with premium design',
        rank: 1,
        designInsights: {
          colorScheme: 'Black, white, and gold',
          layoutStyle: 'Property-focused with immersive imagery',
          keyFeatures: ['Property search', 'Agent profiles', 'Virtual tours'],
        },
      },
      {
        name: "Christie's Real Estate",
        url: 'https://www.christiesrealestate.com',
        description: 'Luxury property specialists',
        rank: 2,
      },
      {
        name: 'Compass',
        url: 'https://www.compass.com',
        description: 'Modern real estate technology',
        rank: 3,
      },
      {
        name: 'Douglas Elliman',
        url: 'https://www.elliman.com',
        description: 'Premium residential brokerage',
        rank: 4,
      },
      {
        name: 'The Agency',
        url: 'https://www.theagencyre.com',
        description: 'Boutique luxury real estate',
        rank: 5,
      },
    ],
    'tech-saas': [
      {
        name: 'Stripe',
        url: 'https://stripe.com',
        description: 'Payment infrastructure with world-class design',
        rank: 1,
        designInsights: {
          colorScheme: 'Purple gradients, white, subtle colors',
          layoutStyle: 'Clean, modern, developer-focused',
          keyFeatures: ['Interactive demos', 'Documentation', 'Pricing transparency'],
        },
      },
      {
        name: 'Linear',
        url: 'https://linear.app',
        description: 'Issue tracking with beautiful interface',
        rank: 2,
      },
      {
        name: 'Notion',
        url: 'https://www.notion.so',
        description: 'All-in-one workspace',
        rank: 3,
      },
      {
        name: 'Vercel',
        url: 'https://vercel.com',
        description: 'Frontend cloud platform',
        rank: 4,
      },
      {
        name: 'Figma',
        url: 'https://www.figma.com',
        description: 'Collaborative design tool',
        rank: 5,
      },
    ],
    fitness: [
      {
        name: 'Equinox',
        url: 'https://www.equinox.com',
        description: 'Luxury fitness clubs',
        rank: 1,
        designInsights: {
          colorScheme: 'Black, white, bold accents',
          layoutStyle: 'High-energy, aspirational imagery',
          keyFeatures: ['Class scheduling', 'Location finder', 'Membership tiers'],
        },
      },
      {
        name: "Barry's Bootcamp",
        url: 'https://www.barrys.com',
        description: 'High-intensity workouts',
        rank: 2,
      },
      {
        name: 'SoulCycle',
        url: 'https://www.soul-cycle.com',
        description: 'Indoor cycling experience',
        rank: 3,
      },
      {
        name: 'Orangetheory',
        url: 'https://www.orangetheory.com',
        description: 'Heart-rate based training',
        rank: 4,
      },
      {
        name: 'F45 Training',
        url: 'https://f45training.com',
        description: 'Functional fitness',
        rank: 5,
      },
    ],
    'beauty-spa': [
      {
        name: 'Four Seasons Spa',
        url: 'https://www.fourseasons.com/spas',
        description: 'Luxury hotel spas',
        rank: 1,
        designInsights: {
          colorScheme: 'Soft neutrals, gold accents',
          layoutStyle: 'Serene, calming, elegant',
          keyFeatures: ['Treatment menu', 'Booking system', 'Gift certificates'],
        },
      },
      {
        name: 'Canyon Ranch',
        url: 'https://www.canyonranch.com',
        description: 'Wellness resort destination',
        rank: 2,
      },
      {
        name: 'Aman Spa',
        url: 'https://www.aman.com/spa',
        description: 'Ultra-luxury wellness',
        rank: 3,
      },
      {
        name: 'The Well',
        url: 'https://www.the-well.com',
        description: 'Holistic wellness club',
        rank: 4,
      },
      {
        name: 'Aire Ancient Baths',
        url: 'https://beaire.com',
        description: 'Thermal bath experience',
        rank: 5,
      },
    ],
    dental: [
      {
        name: 'Tend',
        url: 'https://www.hellotend.com',
        description: 'Modern dental studio experience',
        rank: 1,
        designInsights: {
          colorScheme: 'Clean white, mint green accents',
          layoutStyle: 'Friendly, modern, approachable',
          keyFeatures: ['Online booking', 'Service menu', 'Insurance info'],
        },
      },
      {
        name: 'Aspen Dental',
        url: 'https://www.aspendental.com',
        description: 'Accessible dental care',
        rank: 2,
      },
      {
        name: 'Smile Direct Club',
        url: 'https://smiledirectclub.com',
        description: 'Modern orthodontics',
        rank: 3,
      },
    ],
    'coffee-shop': [
      {
        name: 'Blue Bottle Coffee',
        url: 'https://bluebottlecoffee.com',
        description: 'Third-wave coffee pioneer',
        rank: 1,
        designInsights: {
          colorScheme: 'Warm browns, clean white',
          layoutStyle: 'Minimalist, product-focused',
          keyFeatures: ['Online ordering', 'Subscription', 'Store locator'],
        },
      },
      {
        name: 'Stumptown Coffee',
        url: 'https://www.stumptowncoffee.com',
        description: 'Portland specialty roaster',
        rank: 2,
      },
      {
        name: 'Intelligentsia',
        url: 'https://www.intelligentsia.com',
        description: 'Chicago-based specialty coffee',
        rank: 3,
      },
    ],
    consulting: [
      {
        name: 'McKinsey & Company',
        url: 'https://www.mckinsey.com',
        description: 'Global management consulting',
        rank: 1,
        designInsights: {
          colorScheme: 'Deep blue, white, professional',
          layoutStyle: 'Thought leadership focused',
          keyFeatures: ['Insights & research', 'Industry expertise', 'Careers'],
        },
      },
      {
        name: 'Bain & Company',
        url: 'https://www.bain.com',
        description: 'Strategy consulting',
        rank: 2,
      },
      {
        name: 'Boston Consulting Group',
        url: 'https://www.bcg.com',
        description: 'Global consulting firm',
        rank: 3,
      },
    ],
    'creative-agency': [
      {
        name: 'Pentagram',
        url: 'https://www.pentagram.com',
        description: "World's largest independent design firm",
        rank: 1,
        designInsights: {
          colorScheme: 'Black, white, bold colors',
          layoutStyle: 'Portfolio-driven, visually striking',
          keyFeatures: ['Case studies', 'Partner profiles', 'News'],
        },
      },
      {
        name: 'IDEO',
        url: 'https://www.ideo.com',
        description: 'Design and innovation consultancy',
        rank: 2,
      },
      {
        name: 'MetaLab',
        url: 'https://www.metalab.co',
        description: 'Digital product studio',
        rank: 3,
      },
    ],
    ecommerce: [
      {
        name: 'Apple Store',
        url: 'https://www.apple.com/store',
        description: 'Premium product experience',
        rank: 1,
        designInsights: {
          colorScheme: 'Clean white, product colors',
          layoutStyle: 'Product-hero, minimal distractions',
          keyFeatures: ['Product configurator', 'Compare tools', 'Support'],
        },
      },
      {
        name: 'Glossier',
        url: 'https://www.glossier.com',
        description: 'Beauty brand with cult following',
        rank: 2,
      },
      {
        name: 'Allbirds',
        url: 'https://www.allbirds.com',
        description: 'Sustainable footwear',
        rank: 3,
      },
    ],
    photography: [
      {
        name: 'Annie Leibovitz',
        url: 'https://www.annieleibovitz.com',
        description: 'Iconic portrait photographer',
        rank: 1,
        designInsights: {
          colorScheme: 'Minimal, image-focused',
          layoutStyle: 'Gallery-centric, full-bleed images',
          keyFeatures: ['Portfolio grid', 'Project categories', 'Contact'],
        },
      },
      {
        name: 'Peter McKinnon',
        url: 'https://www.petermckinnon.com',
        description: 'Photography & cinematography',
        rank: 2,
      },
    ],
    'pet-services': [
      {
        name: 'Chewy',
        url: 'https://www.chewy.com',
        description: 'Pet food & supplies',
        rank: 1,
        designInsights: {
          colorScheme: 'Blue, white, playful accents',
          layoutStyle: 'Friendly, trust-focused',
          keyFeatures: ['Autoship', 'Vet services', 'Pet profiles'],
        },
      },
      {
        name: 'Rover',
        url: 'https://www.rover.com',
        description: 'Pet sitting marketplace',
        rank: 2,
      },
      {
        name: 'BarkBox',
        url: 'https://www.barkbox.com',
        description: 'Dog subscription box',
        rank: 3,
      },
    ],
  }

  const websites = curatedWebsites[businessType] || curatedWebsites['consulting'] || []
  return websites.slice(0, limit)
}

/**
 * Extract insights from top websites
 */
function extractInsightsFromWebsites(
  websites: TopWebsiteResult[],
  businessType: BusinessTypeConfig
): BusinessTypeResearchResult['insights'] {
  const insights = {
    commonFeatures: [] as string[],
    designTrends: [] as string[],
    contentPatterns: [] as string[],
    mustHaveElements: [] as string[],
  }

  // Extract from website design insights
  for (const website of websites) {
    if (website.designInsights?.keyFeatures) {
      insights.commonFeatures.push(...website.designInsights.keyFeatures)
    }
    if (website.designInsights?.layoutStyle) {
      insights.designTrends.push(website.designInsights.layoutStyle)
    }
    if (website.designInsights?.colorScheme) {
      insights.designTrends.push(`Color scheme: ${website.designInsights.colorScheme}`)
    }
  }

  // Add business-type specific must-haves
  const typeSpecificMustHaves: Record<string, string[]> = {
    restaurant: ['Online reservations', 'Menu display', 'Hours & location', 'Gallery'],
    bakery: ['Product gallery', 'Order system', 'Location & hours', 'Story/About'],
    'law-firm': ['Practice areas', 'Attorney profiles', 'Case results', 'Contact form'],
    'real-estate': ['Property search', 'Agent profiles', 'Market insights', 'Contact'],
    'tech-saas': ['Feature showcase', 'Pricing page', 'Documentation', 'Free trial CTA'],
    fitness: ['Class schedule', 'Membership options', 'Trainer profiles', 'Free trial'],
    'beauty-spa': ['Services menu', 'Online booking', 'Gift cards', 'Gallery'],
    dental: ['Services list', 'Online booking', 'Insurance info', 'Patient forms'],
    consulting: ['Service offerings', 'Case studies', 'Team/expertise', 'Contact'],
    ecommerce: ['Product catalog', 'Shopping cart', 'Reviews', 'Shipping info'],
  }

  insights.mustHaveElements = typeSpecificMustHaves[businessType.id] ||
    businessType.recommendedSections?.map((s) => s.toLowerCase()) ||
    ['About section', 'Services', 'Contact form', 'Testimonials']

  // Deduplicate
  insights.commonFeatures = Array.from(new Set(insights.commonFeatures))
  insights.designTrends = Array.from(new Set(insights.designTrends))
  insights.contentPatterns = Array.from(new Set(insights.contentPatterns))
  insights.mustHaveElements = Array.from(new Set(insights.mustHaveElements))

  return insights
}

/**
 * Generate research summary for AI consumption
 */
function generateResearchSummary(
  resolvedType: BusinessTypeConfig,
  topWebsites: TopWebsiteResult[],
  insights: BusinessTypeResearchResult['insights'],
  wasExactMatch: boolean,
  originalType?: string
): string {
  const parts: string[] = []

  parts.push('## BUSINESS TYPE RESEARCH RESULTS (MANDATORY WEB RESEARCH)')
  parts.push('')

  if (!wasExactMatch && originalType) {
    parts.push(`### Type Resolution:`)
    parts.push(`- Original request: "${originalType}"`)
    parts.push(`- Resolved to closest match: "${resolvedType.label}"`)
    parts.push(`- This type was selected as the best match for the business description.`)
    parts.push('')
  }

  parts.push(`### Business Type: ${resolvedType.label}`)
  parts.push(`Industry: ${resolvedType.description || resolvedType.label}`)
  parts.push('')

  parts.push('### Top Websites in This Industry:')
  for (const website of topWebsites.slice(0, 5)) {
    parts.push(`${website.rank}. **${website.name}** (${website.url})`)
    parts.push(`   ${website.description}`)
    if (website.designInsights) {
      if (website.designInsights.colorScheme) {
        parts.push(`   - Colors: ${website.designInsights.colorScheme}`)
      }
      if (website.designInsights.layoutStyle) {
        parts.push(`   - Layout: ${website.designInsights.layoutStyle}`)
      }
    }
  }
  parts.push('')

  parts.push('### Must-Have Elements for This Business Type:')
  for (const element of insights.mustHaveElements) {
    parts.push(`- ${element}`)
  }
  parts.push('')

  if (insights.designTrends.length > 0) {
    parts.push('### Design Trends from Top Sites:')
    for (const trend of insights.designTrends.slice(0, 5)) {
      parts.push(`- ${trend}`)
    }
    parts.push('')
  }

  if (insights.commonFeatures.length > 0) {
    parts.push('### Common Features:')
    for (const feature of insights.commonFeatures.slice(0, 5)) {
      parts.push(`- ${feature}`)
    }
    parts.push('')
  }

  parts.push('### Design Directive:')
  parts.push(
    `Create a website that matches or EXCEEDS the quality of ${topWebsites[0]?.name || 'industry leaders'}.`
  )
  parts.push(
    `Study and apply the design patterns, content strategies, and user experience from these top-performing websites.`
  )

  return parts.join('\n')
}

/**
 * MAIN FUNCTION: Research business type and find top websites
 *
 * This function STRICTLY searches the internet for top websites for the business type.
 * If the business type is unknown, it finds the closest matching type first.
 */
export async function researchBusinessType(params: {
  businessType: string
  businessDescription?: string
  businessName?: string
}): Promise<BusinessTypeResearchResult> {
  const { businessType, businessDescription, businessName } = params

  console.log(`[Business Type Research] Starting research for: "${businessType}"`)

  // Step 1: Resolve the business type (find closest match if unknown)
  const { type: resolvedType, confidence, matchMethod } = findClosestBusinessType(
    businessType,
    businessDescription
  )

  const wasExactMatch = matchMethod === 'exact_id' || matchMethod === 'exact_label'

  if (!wasExactMatch) {
    console.log(
      `[Business Type Research] Type "${businessType}" not found exactly.`
    )
    console.log(
      `[Business Type Research] Resolved to "${resolvedType.label}" (confidence: ${(confidence * 100).toFixed(1)}%, method: ${matchMethod})`
    )
  } else {
    console.log(`[Business Type Research] Exact match found: "${resolvedType.label}"`)
  }

  // Step 2: STRICTLY search the internet for top websites
  console.log(`[Business Type Research] Searching for top websites in "${resolvedType.label}" industry...`)

  const { websites: topWebsites, searchMethod } = await searchTopWebsites(
    resolvedType.id,
    resolvedType.label,
    5
  )

  console.log(
    `[Business Type Research] Found ${topWebsites.length} top websites (method: ${searchMethod})`
  )

  // Step 3: Extract insights from the research
  const insights = extractInsightsFromWebsites(topWebsites, resolvedType)

  // Step 4: Generate summary for AI
  const researchSummary = generateResearchSummary(
    resolvedType,
    topWebsites,
    insights,
    wasExactMatch,
    wasExactMatch ? undefined : businessType
  )

  // Determine search status
  let searchStatus: BusinessTypeResearchResult['searchStatus']
  if (searchMethod === 'curated_database') {
    searchStatus = 'curated_fallback'
  } else if (
    searchMethod === 'serper_api' ||
    searchMethod === 'brave_api' ||
    searchMethod === 'bing_api'
  ) {
    searchStatus = 'web_search'
  } else {
    searchStatus = 'error_fallback'
  }

  return {
    resolvedType,
    wasExactMatch,
    originalTypeRequested: wasExactMatch ? undefined : businessType,
    topWebsites,
    insights,
    researchSummary,
    searchStatus,
  }
}

/**
 * Quick check if a business type is known/valid
 */
export function isKnownBusinessType(businessType: string): boolean {
  const normalizedInput = businessType.toLowerCase().trim().replace(/-/g, ' ')

  return BUSINESS_TYPES.some(
    (t) =>
      t.id.toLowerCase() === normalizedInput.replace(/ /g, '-') ||
      t.label.toLowerCase() === normalizedInput
  )
}
