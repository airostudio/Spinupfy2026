/**
 * Intelligent Business Type Detector
 *
 * Automatically detects business type from user's description using
 * keyword matching, phrase analysis, and semantic understanding.
 * No more dropdown selection - the system figures it out.
 */

import { BUSINESS_TYPES } from './config/business-types'
import { BusinessTypeConfig } from './types/business.types'

export interface DetectionResult {
  primaryType: BusinessTypeConfig
  confidence: number // 0-1
  matchedKeywords: string[]
  alternativeTypes: Array<{
    type: BusinessTypeConfig
    confidence: number
    matchedKeywords: string[]
  }>
  detectedFeatures: {
    needsBooking: boolean
    needsEcommerce: boolean
    needsPortfolio: boolean
    needsPricing: boolean
    needsGallery: boolean
  }
}

// Extended keyword mappings for better detection
const EXTENDED_KEYWORDS: Record<string, string[]> = {
  'restaurant': [
    'restaurant', 'dining', 'food', 'menu', 'reservations', 'cuisine', 'chef', 'gourmet',
    'eat', 'dinner', 'lunch', 'breakfast', 'brunch', 'bistro', 'eatery', 'diner',
    'fine dining', 'casual dining', 'takeout', 'delivery', 'catering', 'bar', 'pub',
    'pizzeria', 'sushi', 'italian', 'mexican', 'chinese', 'indian', 'thai', 'japanese',
    'steakhouse', 'seafood', 'vegetarian', 'vegan', 'organic', 'farm to table'
  ],
  'bakery': [
    'bakery', 'bread', 'pastry', 'baking', 'artisan', 'fresh', 'cakes', 'cookies',
    'croissant', 'donuts', 'muffins', 'pies', 'tarts', 'desserts', 'patisserie',
    'cupcakes', 'wedding cakes', 'custom cakes', 'gluten free', 'sourdough'
  ],
  'coffee-shop': [
    'coffee', 'cafe', 'espresso', 'tea', 'cozy', 'latte', 'cappuccino', 'barista',
    'roast', 'beans', 'brew', 'coffeehouse', 'java', 'mocha', 'americano'
  ],
  'law-firm': [
    'law', 'legal', 'attorney', 'lawyer', 'justice', 'counsel', 'litigation',
    'corporate law', 'family law', 'criminal defense', 'personal injury', 'estate planning',
    'intellectual property', 'immigration', 'bankruptcy', 'real estate law', 'tax law',
    'employment law', 'business law', 'contract', 'lawsuit', 'court', 'legal services'
  ],
  'accounting': [
    'accounting', 'accountant', 'cpa', 'bookkeeping', 'tax', 'finance', 'audit',
    'payroll', 'financial statements', 'tax preparation', 'tax planning', 'quickbooks',
    'financial advisor', 'business accounting', 'small business accounting'
  ],
  'consulting': [
    'consulting', 'consultant', 'advisory', 'strategy', 'management consulting',
    'business consulting', 'it consulting', 'hr consulting', 'marketing consulting',
    'operations', 'transformation', 'optimization', 'advisor', 'expert'
  ],
  'medical': [
    'medical', 'healthcare', 'doctor', 'physician', 'clinic', 'health', 'hospital',
    'patient', 'diagnosis', 'treatment', 'medicine', 'family practice', 'internal medicine',
    'urgent care', 'pediatrics', 'dermatology', 'cardiology', 'orthopedic', 'surgery'
  ],
  'dental': [
    'dental', 'dentist', 'orthodontics', 'teeth', 'smile', 'oral', 'implants',
    'braces', 'invisalign', 'whitening', 'crown', 'root canal', 'cleaning',
    'cosmetic dentistry', 'pediatric dentistry', 'oral surgery'
  ],
  'eye-care': [
    'eye care', 'eyecare', 'optical', 'optometry', 'optometrist', 'ophthalmology', 'ophthalmologist',
    'vision care', 'vision center', 'eye doctor', 'eye clinic', 'eye exam', 'eye health',
    'glasses', 'eyeglasses', 'eyewear', 'frames', 'lenses', 'spectacles',
    'contact lenses', 'contacts', 'prescription glasses', 'sunglasses', 'designer frames',
    'vision therapy', 'optical shop', 'optical store', 'eyewear boutique', 'vision services',
    'cataract', 'glaucoma', 'lasik', 'retina', 'cornea', 'eye surgery', 'vision correction',
    'pediatric eye care', 'senior eye care', 'comprehensive eye exam', 'eye specialist'
  ],
  'chiropractic': [
    'chiropractic', 'chiropractor', 'spinal care', 'spine', 'back pain', 'neck pain',
    'spinal adjustment', 'adjustment', 'alignment', 'posture', 'sports chiropractic',
    'wellness center', 'pain relief', 'rehabilitation'
  ],
  'physical-therapy': [
    'physical therapy', 'physiotherapy', 'rehabilitation', 'rehab', 'PT', 'physical therapist',
    'sports therapy', 'occupational therapy', 'movement therapy', 'injury recovery',
    'pain management', 'mobility', 'flexibility', 'therapeutic exercise', 'manual therapy'
  ],
  'mental-health': [
    'mental health', 'psychology', 'psychiatry', 'therapy', 'counseling', 'counselling',
    'therapist', 'psychologist', 'psychiatrist', 'mental wellness', 'behavioral health',
    'emotional health', 'counseling services', 'psychotherapy', 'wellness counseling',
    'anxiety', 'depression', 'stress management', 'life coaching'
  ],
  'veterinary': [
    'veterinary', 'vet', 'veterinarian', 'animal hospital', 'pet clinic', 'pet care',
    'animal care', 'pet hospital', 'animal doctor', 'pet health', 'animal health',
    'veterinary clinic', 'veterinary care', 'pet wellness', 'animal wellness', 'pet medical'
  ],
  'fitness': [
    'fitness', 'gym', 'training', 'workout', 'exercise', 'personal trainer',
    'crossfit', 'weights', 'cardio', 'strength training', 'muscle', 'bootcamp',
    'hiit', 'bodybuilding', 'athletics', 'sports training', 'coaching'
  ],
  'yoga-studio': [
    'yoga', 'meditation', 'wellness', 'mindfulness', 'studio', 'pilates',
    'stretching', 'breathing', 'zen', 'relaxation', 'holistic', 'chakra',
    'vinyasa', 'hatha', 'hot yoga', 'restorative'
  ],
  'beauty-spa': [
    'spa', 'beauty', 'wellness', 'relaxation', 'treatments', 'massage',
    'skincare', 'facial', 'manicure', 'pedicure', 'waxing', 'body treatment',
    'aromatherapy', 'day spa', 'med spa', 'esthetician', 'rejuvenation'
  ],
  'hair-salon': [
    'hair', 'salon', 'styling', 'haircut', 'color', 'highlights', 'balayage',
    'blowout', 'extensions', 'keratin', 'barber', 'stylist', 'hairdresser'
  ],
  'real-estate': [
    'real estate', 'property', 'homes', 'listings', 'agent', 'realtor', 'broker',
    'buying', 'selling', 'rental', 'lease', 'apartment', 'condo', 'house',
    'commercial property', 'residential', 'investment property', 'mortgage'
  ],
  'construction': [
    'construction', 'building', 'contractor', 'renovation', 'remodeling',
    'commercial construction', 'residential construction', 'general contractor',
    'home builder', 'foundation', 'framing', 'drywall', 'carpentry'
  ],
  'electrician': [
    'electrician', 'electrical', 'electric', 'wiring', 'rewiring', 'circuit breaker',
    'electrical panel', 'lighting installation', 'outlet', 'switch', 'electrical repair',
    'electrical service', 'residential electrical', 'commercial electrical', 'electrical contractor',
    'licensed electrician', 'electrical work', 'power', 'voltage', 'electrical inspection',
    'ceiling fan installation', 'recessed lighting', 'electrical upgrade', 'generator installation'
  ],
  'plumber': [
    'plumber', 'plumbing', 'drain', 'pipe', 'piping', 'leak', 'water heater',
    'faucet', 'toilet', 'sink', 'sewer', 'plumbing repair', 'emergency plumber',
    'residential plumbing', 'commercial plumbing', 'plumbing service', 'drain cleaning',
    'water line', 'gas line', 'sump pump', 'garbage disposal', 'tankless water heater',
    'pipe repair', 'clogged drain', 'plumbing installation', 'bathroom plumbing', 'kitchen plumbing'
  ],
  'hvac': [
    'hvac', 'heating', 'cooling', 'air conditioning', 'furnace', 'ac repair',
    'hvac installation', 'air conditioner', 'heater', 'ductwork', 'ventilation',
    'climate control', 'ac service', 'heating repair', 'cooling system', 'heat pump',
    'central air', 'hvac maintenance', 'furnace repair', 'ac installation', 'indoor air quality',
    'thermostat', 'duct cleaning', 'hvac contractor', 'heating and cooling', 'hvac service'
  ],
  'roofer': [
    'roofer', 'roofing', 'roof repair', 'roof replacement', 'shingles', 'roof installation',
    'leak repair', 'gutter', 'residential roofing', 'commercial roofing', 'roof inspection',
    'storm damage', 'roof maintenance', 'metal roofing', 'flat roof', 'tile roof',
    'asphalt shingles', 'roof contractor', 'roofing service', 'gutter installation',
    'roof leak', 'emergency roof repair', 'roofing company', 'roof estimate'
  ],
  'interior-design': [
    'interior design', 'decoration', 'home design', 'interior decorator',
    'furniture', 'decor', 'staging', 'residential design', 'commercial design',
    'space planning', 'color consultation', 'redecorating'
  ],
  'landscaping': [
    'landscaping', 'garden', 'outdoor', 'lawn', 'maintenance', 'hardscape',
    'irrigation', 'tree service', 'planting', 'landscape design', 'lawn care',
    'patio', 'deck', 'outdoor living'
  ],
  'tech-saas': [
    'technology', 'software', 'saas', 'app', 'platform', 'cloud', 'automation',
    'ai', 'machine learning', 'data', 'analytics', 'api', 'integration',
    'startup', 'tech company', 'digital', 'solution', 'product', 'tool',
    'dashboard', 'crm', 'erp', 'workflow', 'productivity'
  ],
  'ecommerce': [
    'ecommerce', 'e-commerce', 'online store', 'shop', 'retail', 'selling online',
    'products', 'shopping', 'marketplace', 'dropshipping', 'inventory',
    'checkout', 'cart', 'orders', 'shipping'
  ],
  'creative-agency': [
    'creative', 'design', 'agency', 'branding', 'creative agency', 'design agency',
    'digital agency', 'graphic design', 'web design', 'logo', 'identity',
    'visual', 'creative studio', 'design studio', 'ux', 'ui'
  ],
  'marketing-agency': [
    'marketing', 'advertising', 'digital marketing', 'social media', 'seo',
    'ppc', 'content marketing', 'email marketing', 'brand strategy', 'campaigns',
    'lead generation', 'marketing agency', 'advertising agency', 'pr'
  ],
  'photography': [
    'photography', 'photographer', 'photos', 'portrait', 'wedding photography',
    'event photography', 'commercial photography', 'headshots', 'product photography',
    'photo studio', 'photoshoot', 'editing', 'lightroom'
  ],
  'hospitality': [
    'hotel', 'hospitality', 'accommodation', 'resort', 'booking', 'lodging',
    'inn', 'bed and breakfast', 'vacation rental', 'airbnb', 'guest house',
    'boutique hotel', 'luxury hotel'
  ],
  'travel-agency': [
    'travel', 'vacation', 'tourism', 'trip', 'adventure', 'tour', 'destination',
    'flight', 'cruise', 'package', 'travel agent', 'travel agency', 'itinerary'
  ],
  'event-planning': [
    'event', 'planning', 'coordination', 'party', 'celebration', 'corporate events',
    'conference', 'seminar', 'workshop', 'gala', 'fundraiser', 'event planner'
  ],
  'wedding-planning': [
    'wedding', 'bridal', 'ceremony', 'reception', 'wedding planner', 'bride',
    'groom', 'engagement', 'venue', 'catering', 'flowers', 'photography'
  ],
  'education': [
    'education', 'school', 'learning', 'training', 'courses', 'tutoring',
    'online courses', 'e-learning', 'academy', 'institute', 'certification',
    'teaching', 'instructor', 'classes', 'lessons'
  ],
  'nonprofit': [
    'nonprofit', 'charity', 'organization', 'donation', 'community', 'cause',
    'foundation', 'volunteer', 'fundraising', 'ngo', 'social impact', 'mission'
  ],
  'pet-services': [
    'pet', 'veterinary', 'grooming', 'dog', 'cat', 'animals', 'vet', 'boarding',
    'pet sitting', 'dog walking', 'pet store', 'animal hospital', 'pet care'
  ],
  'automotive': [
    'automotive', 'car', 'vehicle', 'auto', 'dealership', 'repair', 'mechanic',
    'service', 'oil change', 'tire', 'auto body', 'detailing', 'car wash'
  ],
  'financial': [
    'financial', 'investment', 'wealth', 'planning', 'advisor', 'portfolio',
    'retirement', 'insurance', 'stocks', 'bonds', 'mutual funds', 'financial planning'
  ],
  'insurance': [
    'insurance', 'coverage', 'policy', 'claims', 'life insurance', 'health insurance',
    'auto insurance', 'home insurance', 'business insurance', 'agent', 'broker'
  ],
  'fashion': [
    'fashion', 'clothing', 'style', 'boutique', 'apparel', 'designer', 'collection',
    'accessories', 'wardrobe', 'trend', 'runway', 'couture'
  ],
  'music-entertainment': [
    'music', 'entertainment', 'band', 'performance', 'dj', 'musician', 'concert',
    'venue', 'recording', 'studio', 'production', 'artist', 'live music'
  ],
  'portfolio': [
    'portfolio', 'personal', 'work', 'projects', 'showcase', 'freelance',
    'developer', 'designer', 'artist', 'creative', 'resume', 'cv'
  ],
  'personal-blog': [
    'blog', 'blogging', 'writing', 'content', 'articles', 'posts', 'personal brand',
    'lifestyle', 'influencer', 'thought leader', 'newsletter'
  ],
  'pharmacy': [
    'pharmacy', 'medication', 'prescription', 'drugstore', 'pharmacist',
    'medicine', 'health products', 'vitamins', 'supplements'
  ],
  'food-delivery': [
    'food delivery', 'delivery service', 'meal delivery', 'online ordering',
    'takeaway', 'delivery app', 'fast delivery', 'food service'
  ],
  'logistics': [
    'logistics', 'shipping', 'freight', 'cargo', 'supply chain', 'warehouse',
    'distribution', 'fulfillment', 'container', 'port', 'maritime', 'shipping routes',
    'global logistics', 'freight forwarding', 'cargo shipping', 'import', 'export',
    'supply chain management', 'inventory management', 'third party logistics', '3pl',
    'shipping company', 'freight company', 'cargo transport', 'sea freight', 'air freight',
    'ocean shipping', 'international shipping', 'customs', 'cross docking', 'warehousing'
  ],
  'transportation': [
    'transportation', 'trucking', 'freight', 'hauling', 'fleet', 'carrier',
    'haulage', 'road transport', 'heavy transport', 'commercial vehicles',
    'long haul', 'cargo transport', 'truck driver', 'cdl', 'tractor trailer',
    'semi truck', 'big rig', 'freight transport', 'over the road', 'otr',
    'less than truckload', 'ltl', 'full truckload', 'ftl', 'freight carrier'
  ],
  'courier': [
    'courier', 'express delivery', 'same day delivery', 'package delivery',
    'parcel', 'last mile', 'doorstep delivery', 'pickup and delivery', 'dispatch',
    'overnight shipping', 'local delivery', 'messenger', 'quick delivery',
    'express courier', 'document delivery', 'medical courier', 'bike messenger'
  ],
  'moving-company': [
    'moving', 'relocation', 'movers', 'packing', 'storage', 'household moving',
    'commercial moving', 'residential moving', 'long distance moving', 'local moving',
    'furniture moving', 'office relocation', 'moving services', 'moving company',
    'professional movers', 'loading and unloading', 'packing services', 'moving truck'
  ]
}

// Feature detection keywords
const FEATURE_KEYWORDS = {
  booking: [
    'appointment', 'booking', 'reservation', 'schedule', 'book online',
    'appointment scheduling', 'reserve', 'book a', 'make an appointment',
    'consultation', 'session', 'class booking'
  ],
  ecommerce: [
    'shop', 'store', 'sell', 'products', 'buy', 'purchase', 'ecommerce',
    'online store', 'shopping', 'cart', 'checkout', 'inventory', 'shipping',
    'order', 'merchandise', 'retail'
  ],
  portfolio: [
    'portfolio', 'work samples', 'projects', 'showcase', 'gallery', 'case studies',
    'our work', 'featured work', 'client work', 'past projects'
  ],
  pricing: [
    'pricing', 'prices', 'rates', 'cost', 'packages', 'plans', 'subscription',
    'membership', 'quote', 'estimate', 'fee', 'charge'
  ],
  gallery: [
    'gallery', 'photos', 'images', 'pictures', 'portfolio', 'showcase',
    'visual', 'album', 'photography'
  ]
}

/**
 * Detect business type from description
 */
export function detectBusinessType(
  description: string,
  businessName?: string
): DetectionResult {
  const textToAnalyze = `${businessName || ''} ${description}`.toLowerCase()
  const words = textToAnalyze.split(/\s+/)
  const phrases = extractPhrases(textToAnalyze)

  const scores: Array<{
    type: BusinessTypeConfig
    score: number
    matchedKeywords: string[]
  }> = []

  // Score each business type
  for (const businessType of BUSINESS_TYPES) {
    const allKeywords = [
      ...(businessType.keywords || []),
      ...(EXTENDED_KEYWORDS[businessType.id] || [])
    ]

    const matchedKeywords: string[] = []
    let score = 0

    for (const keyword of allKeywords) {
      const keywordLower = keyword.toLowerCase()

      // Exact phrase match (highest weight)
      if (textToAnalyze.includes(keywordLower)) {
        score += 10
        if (!matchedKeywords.includes(keyword)) {
          matchedKeywords.push(keyword)
        }

        // Bonus for keyword in business name
        if (businessName?.toLowerCase().includes(keywordLower)) {
          score += 5
        }
      }

      // Partial word match (lower weight)
      for (const word of words) {
        if (word.includes(keywordLower) || keywordLower.includes(word)) {
          if (word.length > 3) {
            score += 2
          }
        }
      }
    }

    // Bonus for industry-specific phrases
    for (const phrase of phrases) {
      for (const keyword of allKeywords) {
        if (phrase.includes(keyword.toLowerCase())) {
          score += 3
        }
      }
    }

    if (score > 0) {
      scores.push({ type: businessType, score, matchedKeywords })
    }
  }

  // Sort by score
  scores.sort((a, b) => b.score - a.score)

  // If no matches, default to 'consulting' as a generic business type
  if (scores.length === 0) {
    const defaultType = BUSINESS_TYPES.find(t => t.id === 'consulting') || BUSINESS_TYPES[0]
    return {
      primaryType: defaultType,
      confidence: 0.3,
      matchedKeywords: [],
      alternativeTypes: [],
      detectedFeatures: detectFeatures(textToAnalyze)
    }
  }

  // Calculate confidence (normalized score)
  const maxPossibleScore = 100 // Approximate max for well-matched description
  const topScore = scores[0]
  const confidence = Math.min(topScore.score / maxPossibleScore, 1)

  // Get alternative types (next 3 highest scoring)
  const alternativeTypes = scores.slice(1, 4).map(s => ({
    type: s.type,
    confidence: Math.min(s.score / maxPossibleScore, 1),
    matchedKeywords: s.matchedKeywords
  }))

  return {
    primaryType: topScore.type,
    confidence,
    matchedKeywords: topScore.matchedKeywords,
    alternativeTypes,
    detectedFeatures: detectFeatures(textToAnalyze)
  }
}

/**
 * Extract multi-word phrases from text
 */
function extractPhrases(text: string): string[] {
  const phrases: string[] = []
  const words = text.split(/\s+/)

  // Extract 2-word phrases
  for (let i = 0; i < words.length - 1; i++) {
    phrases.push(`${words[i]} ${words[i + 1]}`)
  }

  // Extract 3-word phrases
  for (let i = 0; i < words.length - 2; i++) {
    phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`)
  }

  return phrases
}

/**
 * Detect what features the business needs
 */
function detectFeatures(text: string): DetectionResult['detectedFeatures'] {
  const hasKeyword = (keywords: string[]) =>
    keywords.some(kw => text.includes(kw.toLowerCase()))

  return {
    needsBooking: hasKeyword(FEATURE_KEYWORDS.booking),
    needsEcommerce: hasKeyword(FEATURE_KEYWORDS.ecommerce),
    needsPortfolio: hasKeyword(FEATURE_KEYWORDS.portfolio),
    needsPricing: hasKeyword(FEATURE_KEYWORDS.pricing),
    needsGallery: hasKeyword(FEATURE_KEYWORDS.gallery)
  }
}

/**
 * Get business type by ID with fallback
 */
export function getBusinessTypeWithFallback(id: string): BusinessTypeConfig {
  return BUSINESS_TYPES.find(t => t.id === id) ||
         BUSINESS_TYPES.find(t => t.id === 'consulting') ||
         BUSINESS_TYPES[0]
}

/**
 * Quick detection for API use - returns just the type ID
 */
export function quickDetectBusinessType(
  description: string,
  businessName?: string
): string {
  const result = detectBusinessType(description, businessName)
  return result.primaryType.id
}

/**
 * Find the closest matching business type when the exact type is unknown
 * Uses multiple strategies: keyword matching, fuzzy string matching, and category-based fallbacks
 */
export function findClosestBusinessType(
  unknownType: string,
  description?: string
): { type: BusinessTypeConfig; confidence: number; matchMethod: string } {
  const normalizedInput = unknownType.toLowerCase().trim().replace(/-/g, ' ')

  // Strategy 1: Try exact ID match
  const exactIdMatch = BUSINESS_TYPES.find(
    (t) => t.id.toLowerCase() === normalizedInput.replace(/ /g, '-')
  )
  if (exactIdMatch) {
    return { type: exactIdMatch, confidence: 1, matchMethod: 'exact_id' }
  }

  // Strategy 2: Try label match
  const labelMatch = BUSINESS_TYPES.find(
    (t) => t.label.toLowerCase() === normalizedInput
  )
  if (labelMatch) {
    return { type: labelMatch, confidence: 1, matchMethod: 'exact_label' }
  }

  // Strategy 3: Keyword-based matching across all extended keywords
  let bestKeywordMatch: { type: BusinessTypeConfig; score: number } | null = null
  for (const businessType of BUSINESS_TYPES) {
    const allKeywords = [
      ...(businessType.keywords || []),
      ...(EXTENDED_KEYWORDS[businessType.id] || [])
    ]

    let score = 0
    for (const keyword of allKeywords) {
      const keywordLower = keyword.toLowerCase()
      if (normalizedInput.includes(keywordLower)) {
        score += 10
      }
      if (keywordLower.includes(normalizedInput)) {
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

  // Strategy 4: Fuzzy string matching using Levenshtein distance
  let bestFuzzyMatch: { type: BusinessTypeConfig; similarity: number } | null = null
  for (const businessType of BUSINESS_TYPES) {
    const labelSimilarity = calculateStringSimilarity(normalizedInput, businessType.label.toLowerCase())
    const idSimilarity = calculateStringSimilarity(normalizedInput, businessType.id.replace(/-/g, ' '))
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
    food: 'restaurant', dining: 'restaurant', meal: 'restaurant', eat: 'restaurant',
    cafe: 'coffee-shop', coffee: 'coffee-shop', bake: 'bakery', pastry: 'bakery',
    legal: 'law-firm', lawyer: 'law-firm', attorney: 'law-firm',
    finance: 'accounting', tax: 'accounting', money: 'financial', investment: 'financial',
    consult: 'consulting', advise: 'consulting', strategy: 'consulting',
    health: 'medical', doctor: 'medical', clinic: 'medical',
    teeth: 'dental', dentist: 'dental',
    // Eye care - CRITICAL: "eye care" must map to eye-care, NOT automotive
    'eye care': 'eye-care', 'eyecare': 'eye-care', optical: 'eye-care', optometry: 'eye-care',
    optometrist: 'eye-care', ophthalmology: 'eye-care', vision: 'eye-care', glasses: 'eye-care',
    eyewear: 'eye-care', eyeglasses: 'eye-care', spectacles: 'eye-care', lenses: 'eye-care',
    // Chiropractic and physical therapy
    chiropractic: 'chiropractic', chiropractor: 'chiropractic', spinal: 'chiropractic',
    'physical therapy': 'physical-therapy', physiotherapy: 'physical-therapy', rehab: 'physical-therapy',
    // Mental health
    'mental health': 'mental-health', therapy: 'mental-health', counseling: 'mental-health',
    psychologist: 'mental-health', psychiatry: 'mental-health', therapist: 'mental-health',
    // Veterinary
    veterinary: 'veterinary', veterinarian: 'veterinary', vet: 'veterinary',
    gym: 'fitness', workout: 'fitness', exercise: 'fitness',
    spa: 'beauty-spa', massage: 'beauty-spa', beauty: 'beauty-spa',
    hair: 'hair-salon', salon: 'hair-salon', barber: 'hair-salon',
    electric: 'electrician', plumb: 'plumber', pipe: 'plumber',
    heat: 'hvac', cooling: 'hvac', roof: 'roofer',
    build: 'construction', construct: 'construction', renovate: 'construction',
    landscape: 'landscaping', garden: 'landscaping', lawn: 'landscaping',
    tech: 'tech-saas', software: 'tech-saas', app: 'tech-saas', digital: 'tech-saas',
    design: 'creative-agency', creative: 'creative-agency', brand: 'creative-agency',
    marketing: 'marketing-agency', advertis: 'marketing-agency', seo: 'marketing-agency',
    property: 'real-estate', home: 'real-estate', house: 'real-estate',
    pet: 'pet-services', dog: 'pet-services', cat: 'pet-services', animal: 'pet-services',
    photo: 'photography', camera: 'photography',
    shop: 'ecommerce', store: 'ecommerce', sell: 'ecommerce', retail: 'ecommerce',
    hotel: 'hospitality', travel: 'travel-agency', vacation: 'travel-agency',
    event: 'event-planning', wedding: 'wedding-planning',
    school: 'education', learn: 'education', train: 'education',
    nonprofit: 'nonprofit', charity: 'nonprofit',
    // Logistics & Transportation
    logistics: 'logistics', shipping: 'logistics', freight: 'logistics', cargo: 'logistics',
    'supply chain': 'logistics', warehouse: 'logistics', distribution: 'logistics',
    container: 'logistics', maritime: 'logistics', port: 'logistics', import: 'logistics', export: 'logistics',
    'shipping routes': 'logistics', 'freight forwarding': 'logistics',
    trucking: 'transportation', hauling: 'transportation', fleet: 'transportation',
    'road transport': 'transportation', haulage: 'transportation', carrier: 'transportation',
    courier: 'courier', parcel: 'courier', 'express delivery': 'courier', 'same day': 'courier',
    'package delivery': 'courier', dispatch: 'courier', messenger: 'courier',
    moving: 'moving-company', relocation: 'moving-company', movers: 'moving-company',
    'moving company': 'moving-company', 'furniture moving': 'moving-company',
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
  const defaultType = BUSINESS_TYPES.find((t) => t.id === 'consulting') || BUSINESS_TYPES[0]
  return {
    type: defaultType,
    confidence: 0.3,
    matchMethod: 'default_fallback',
  }
}

/**
 * Calculate string similarity using Levenshtein distance (0-1 scale)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1

  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1

  // Calculate Levenshtein distance
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
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

  const distance = matrix[str2.length][str1.length]
  return 1 - distance / maxLength
}

/**
 * Check if a business type is known/valid in our system
 */
export function isKnownBusinessType(businessType: string): boolean {
  const normalizedInput = businessType.toLowerCase().trim().replace(/-/g, ' ')

  return BUSINESS_TYPES.some(
    (t) =>
      t.id.toLowerCase() === normalizedInput.replace(/ /g, '-') ||
      t.label.toLowerCase() === normalizedInput
  )
}
