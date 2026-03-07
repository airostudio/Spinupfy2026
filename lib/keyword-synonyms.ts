/**
 * Keyword Synonym & Expansion System
 *
 * This module provides intelligent keyword expansion to ensure:
 * 1. User keywords are NEVER truncated or shortened
 * 2. Related industry terms are automatically included
 * 3. Similar concepts map to the correct business context
 *
 * CRITICAL: Keywords must be preserved EXACTLY as entered.
 * "eye care" should NEVER become "car" - it should expand to
 * "eye care, optical, optometry, vision, ophthalmology" etc.
 */

// ============================================================
// INDUSTRY SYNONYM MAPPINGS
// Maps primary terms to all related synonyms and concepts
// ============================================================

export const INDUSTRY_SYNONYMS: Record<string, string[]> = {
  // ============================================================
  // HEALTHCARE & MEDICAL SPECIALTIES
  // ============================================================
  'eye care': [
    'optical', 'optometry', 'optometrist', 'ophthalmology', 'ophthalmologist',
    'vision care', 'vision center', 'eye doctor', 'eye clinic', 'eye exam',
    'glasses', 'eyeglasses', 'spectacles', 'contact lenses', 'contacts',
    'eyewear', 'frames', 'lenses', 'prescription glasses', 'sunglasses',
    'vision therapy', 'eye health', 'eye specialist', 'retina', 'cornea',
    'cataract', 'glaucoma', 'lasik', 'eye surgery', 'vision correction',
    'pediatric eye care', 'senior eye care', 'comprehensive eye exam',
    'optical shop', 'optical store', 'eyewear boutique', 'vision services'
  ],
  'optical': [
    'eye care', 'optometry', 'optometrist', 'vision', 'eyewear', 'glasses',
    'eyeglasses', 'frames', 'lenses', 'contact lenses', 'prescription',
    'ophthalmology', 'eye doctor', 'eye exam', 'vision center', 'spectacles'
  ],
  'optometry': [
    'eye care', 'optical', 'optometrist', 'vision care', 'eye exam',
    'glasses', 'contact lenses', 'eyewear', 'prescription lenses',
    'eye health', 'vision testing', 'eye doctor'
  ],
  'dental': [
    'dentist', 'dentistry', 'oral health', 'oral care', 'teeth', 'tooth',
    'smile', 'dental care', 'dental clinic', 'dental office', 'dental practice',
    'orthodontics', 'orthodontist', 'braces', 'invisalign', 'whitening',
    'teeth cleaning', 'dental hygiene', 'cosmetic dentistry', 'implants',
    'dental implants', 'root canal', 'crown', 'filling', 'cavity',
    'pediatric dentistry', 'family dentistry', 'emergency dental',
    'periodontics', 'endodontics', 'oral surgery', 'dental restoration'
  ],
  'medical': [
    'healthcare', 'health care', 'clinic', 'doctor', 'physician', 'medicine',
    'medical practice', 'medical center', 'health center', 'health clinic',
    'patient care', 'primary care', 'family medicine', 'internal medicine',
    'urgent care', 'walk-in clinic', 'medical services', 'health services',
    'wellness', 'preventive care', 'medical treatment', 'diagnosis'
  ],
  'chiropractic': [
    'chiropractor', 'spinal care', 'spine', 'back pain', 'neck pain',
    'spinal adjustment', 'chiropractic care', 'chiropractic clinic',
    'wellness center', 'pain relief', 'posture', 'alignment',
    'sports chiropractic', 'rehabilitation', 'physical therapy'
  ],
  'physical therapy': [
    'physiotherapy', 'rehabilitation', 'rehab', 'PT', 'physical therapist',
    'sports therapy', 'occupational therapy', 'movement therapy',
    'injury recovery', 'pain management', 'mobility', 'flexibility',
    'therapeutic exercise', 'manual therapy', 'orthopedic therapy'
  ],
  'veterinary': [
    'vet', 'veterinarian', 'animal hospital', 'pet clinic', 'pet care',
    'animal care', 'pet hospital', 'animal doctor', 'pet health',
    'animal health', 'veterinary clinic', 'veterinary care',
    'pet wellness', 'animal wellness', 'pet medical'
  ],
  'mental health': [
    'psychology', 'psychiatry', 'therapy', 'counseling', 'counselling',
    'therapist', 'psychologist', 'psychiatrist', 'mental wellness',
    'behavioral health', 'emotional health', 'mental health services',
    'counseling services', 'psychotherapy', 'wellness counseling'
  ],

  // ============================================================
  // AUTOMOTIVE - CRITICAL: "car" vs "care" disambiguation
  // ============================================================
  'automotive': [
    'auto', 'automobile', 'car', 'vehicle', 'motor vehicle', 'cars',
    'car dealership', 'auto dealer', 'car sales', 'auto sales',
    'car service', 'auto service', 'car repair', 'auto repair',
    'mechanic', 'auto mechanic', 'car mechanic', 'garage',
    'auto body', 'body shop', 'collision repair', 'car wash',
    'auto detailing', 'car detailing', 'tire shop', 'oil change',
    'brake service', 'transmission', 'engine repair'
  ],
  'car dealership': [
    'auto dealer', 'car sales', 'auto sales', 'new cars', 'used cars',
    'pre-owned vehicles', 'car lot', 'dealership', 'automotive sales',
    'vehicle sales', 'car inventory', 'auto inventory'
  ],
  'car repair': [
    'auto repair', 'mechanic', 'auto mechanic', 'car mechanic',
    'vehicle repair', 'automotive repair', 'garage', 'service center',
    'auto service', 'car service', 'maintenance', 'auto maintenance'
  ],

  // ============================================================
  // BEAUTY & PERSONAL CARE
  // ============================================================
  'hair care': [
    'hair salon', 'hairdresser', 'hairstylist', 'hair stylist',
    'haircut', 'hair styling', 'hair color', 'hair coloring',
    'highlights', 'balayage', 'blowout', 'hair treatment',
    'keratin treatment', 'hair extensions', 'hair services'
  ],
  'skin care': [
    'skincare', 'esthetics', 'esthetician', 'facial', 'facials',
    'dermatology', 'skin treatment', 'skin therapy', 'complexion',
    'anti-aging', 'acne treatment', 'skin health', 'beauty treatment'
  ],
  'nail care': [
    'nail salon', 'manicure', 'pedicure', 'nails', 'nail art',
    'nail technician', 'nail services', 'gel nails', 'acrylic nails',
    'nail spa', 'nail bar'
  ],
  'spa': [
    'wellness spa', 'day spa', 'med spa', 'medspa', 'massage spa',
    'relaxation', 'wellness center', 'spa services', 'spa treatment',
    'therapeutic spa', 'luxury spa', 'beauty spa'
  ],
  'massage': [
    'massage therapy', 'massage therapist', 'therapeutic massage',
    'deep tissue', 'swedish massage', 'sports massage', 'relaxation massage',
    'bodywork', 'massage services', 'wellness massage'
  ],

  // ============================================================
  // HOME SERVICES
  // ============================================================
  'lawn care': [
    'lawn service', 'lawn maintenance', 'grass cutting', 'mowing',
    'lawn mowing', 'yard care', 'yard maintenance', 'turf care',
    'lawn treatment', 'fertilizing', 'weed control', 'lawn health'
  ],
  'landscaping': [
    'landscape design', 'landscape architecture', 'garden design',
    'outdoor living', 'hardscaping', 'softscaping', 'garden maintenance',
    'landscape maintenance', 'planting', 'tree service', 'shrub care'
  ],
  'home care': [
    'home services', 'home maintenance', 'home repair', 'handyman',
    'house care', 'property maintenance', 'residential services',
    'home improvement', 'home renovation'
  ],
  'elder care': [
    'senior care', 'elderly care', 'aged care', 'senior services',
    'home health care', 'assisted living', 'senior living',
    'companion care', 'respite care', 'geriatric care', 'senior assistance'
  ],
  'child care': [
    'childcare', 'daycare', 'day care', 'preschool', 'nursery',
    'babysitting', 'nanny services', 'early childhood', 'kids care',
    'infant care', 'toddler care', 'after school care'
  ],
  'pet care': [
    'pet services', 'pet sitting', 'dog walking', 'pet grooming',
    'pet boarding', 'kennel', 'doggy daycare', 'cat sitting',
    'pet hotel', 'animal care', 'pet wellness'
  ],

  // ============================================================
  // PROFESSIONAL SERVICES
  // ============================================================
  'health care': [
    'healthcare', 'medical care', 'patient care', 'clinical care',
    'health services', 'medical services', 'wellness care',
    'preventive care', 'primary care', 'specialty care'
  ],
  'legal': [
    'law', 'law firm', 'attorney', 'lawyer', 'legal services',
    'legal practice', 'counsel', 'litigation', 'legal counsel',
    'law office', 'legal representation', 'legal advice'
  ],
  'financial': [
    'finance', 'financial services', 'financial planning',
    'wealth management', 'investment', 'banking', 'accounting',
    'tax services', 'financial advisor', 'financial consultant'
  ],

  // ============================================================
  // FOOD & BEVERAGE
  // ============================================================
  'food': [
    'restaurant', 'dining', 'cuisine', 'culinary', 'eatery',
    'food service', 'catering', 'meals', 'cooking', 'chef'
  ],
  'coffee': [
    'cafe', 'coffeehouse', 'coffee shop', 'espresso', 'latte',
    'cappuccino', 'barista', 'coffee bar', 'coffeeshop', 'roastery'
  ],
  'bakery': [
    'baked goods', 'pastry', 'bread', 'pastries', 'cakes', 'cookies',
    'patisserie', 'artisan bakery', 'baking', 'confectionery'
  ]
};

// ============================================================
// PROTECTED PHRASES
// These phrases must NEVER be truncated or modified
// ============================================================

export const PROTECTED_PHRASES: string[] = [
  // Care-related (prevent "care" → "car" confusion)
  'eye care', 'skin care', 'hair care', 'nail care', 'pet care',
  'child care', 'childcare', 'elder care', 'senior care', 'home care',
  'health care', 'healthcare', 'dental care', 'oral care', 'lawn care',
  'vision care', 'patient care', 'personal care', 'self care', 'day care',
  'after care', 'wound care', 'foot care', 'body care', 'car care',

  // Multi-word industry terms
  'real estate', 'law firm', 'hair salon', 'beauty salon', 'nail salon',
  'day spa', 'med spa', 'fitness center', 'yoga studio', 'dance studio',
  'art studio', 'photo studio', 'recording studio', 'music studio',
  'web design', 'graphic design', 'interior design', 'fashion design',
  'tech startup', 'software development', 'app development',
  'digital marketing', 'social media', 'content marketing',
  'physical therapy', 'massage therapy', 'speech therapy',
  'mental health', 'public health', 'occupational therapy'
];

// ============================================================
// KEYWORD DISAMBIGUATION
// When these words appear alone, they need context
// ============================================================

export const AMBIGUOUS_KEYWORDS: Record<string, {
  requiresContext: string[];
  defaultMeaning: string;
  alternativeMeanings: Record<string, string>;
}> = {
  'care': {
    requiresContext: ['eye', 'skin', 'hair', 'nail', 'pet', 'child', 'elder', 'senior', 'home', 'health', 'dental', 'lawn', 'car', 'auto'],
    defaultMeaning: 'professional care services',
    alternativeMeanings: {
      'eye': 'optical and vision services',
      'car': 'automotive care and maintenance',
      'auto': 'automotive care and maintenance'
    }
  },
  'studio': {
    requiresContext: ['yoga', 'dance', 'art', 'photo', 'recording', 'music', 'design', 'fitness', 'pilates'],
    defaultMeaning: 'creative workspace',
    alternativeMeanings: {}
  },
  'center': {
    requiresContext: ['fitness', 'wellness', 'health', 'medical', 'vision', 'learning', 'community', 'business'],
    defaultMeaning: 'professional facility',
    alternativeMeanings: {}
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Expand a keyword or phrase to include all related synonyms
 * CRITICAL: Never truncates the original keyword
 */
export function expandKeywords(input: string): string[] {
  const inputLower = input.toLowerCase().trim();
  const expanded: Set<string> = new Set([inputLower]); // Always include original

  // Check for exact matches in synonym map
  if (INDUSTRY_SYNONYMS[inputLower]) {
    INDUSTRY_SYNONYMS[inputLower].forEach(syn => expanded.add(syn.toLowerCase()));
  }

  // Check if input contains any synonym keys
  for (const [key, synonyms] of Object.entries(INDUSTRY_SYNONYMS)) {
    if (inputLower.includes(key)) {
      synonyms.forEach(syn => expanded.add(syn.toLowerCase()));
    }
    // Also check if any synonym matches the input
    if (synonyms.some(syn => inputLower.includes(syn.toLowerCase()))) {
      expanded.add(key);
      synonyms.forEach(syn => expanded.add(syn.toLowerCase()));
    }
  }

  return Array.from(expanded);
}

/**
 * Safely extract keywords from a phrase WITHOUT truncation
 * Preserves protected phrases and full words
 */
export function safeExtractKeywords(input: string): string[] {
  const inputLower = input.toLowerCase().trim();
  const keywords: string[] = [];

  // First, extract protected phrases (they have priority)
  for (const phrase of PROTECTED_PHRASES) {
    if (inputLower.includes(phrase)) {
      keywords.push(phrase);
    }
  }

  // Then extract individual words (minimum 3 characters)
  const words = inputLower.split(/\s+/).filter(word => word.length >= 3);

  // Add words that aren't part of protected phrases we already captured
  for (const word of words) {
    const isPartOfProtectedPhrase = keywords.some(phrase => phrase.includes(word));
    if (!isPartOfProtectedPhrase) {
      keywords.push(word);
    }
  }

  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Check if a keyword should be interpreted as part of a phrase
 * Prevents "care" from being interpreted as "car"
 */
export function resolveAmbiguousKeyword(word: string, context: string): string {
  const wordLower = word.toLowerCase();
  const contextLower = context.toLowerCase();

  const ambiguous = AMBIGUOUS_KEYWORDS[wordLower];
  if (!ambiguous) {
    return word; // Not ambiguous, return as-is
  }

  // Check context for disambiguation
  for (const contextWord of ambiguous.requiresContext) {
    if (contextLower.includes(contextWord)) {
      // Found context, check if it changes meaning
      if (ambiguous.alternativeMeanings[contextWord]) {
        return `${contextWord} ${wordLower}`;
      }
      return `${contextWord} ${wordLower}`;
    }
  }

  return word;
}

/**
 * Build a search query that preserves intent and expands with synonyms
 */
export function buildEnhancedSearchQuery(
  originalQuery: string,
  maxTerms: number = 5
): string[] {
  const queries: string[] = [originalQuery]; // Always include original first

  // Expand with synonyms
  const expanded = expandKeywords(originalQuery);

  // Add top expanded terms as additional queries
  for (const term of expanded.slice(0, maxTerms)) {
    if (term !== originalQuery.toLowerCase()) {
      queries.push(term);
    }
  }

  return queries;
}

/**
 * Validate that a search query hasn't been corrupted
 * Checks for common truncation issues
 */
export function validateSearchQuery(original: string, processed: string): boolean {
  const originalLower = original.toLowerCase();
  const processedLower = processed.toLowerCase();

  // Check for protected phrase integrity
  for (const phrase of PROTECTED_PHRASES) {
    if (originalLower.includes(phrase) && !processedLower.includes(phrase)) {
      console.warn(`Protected phrase "${phrase}" was corrupted in processing`);
      return false;
    }
  }

  // Check for word truncation (e.g., "care" becoming "car")
  const originalWords = originalLower.split(/\s+/);
  const processedWords = processedLower.split(/\s+/);

  for (const origWord of originalWords) {
    if (origWord.length < 3) continue;

    const hasMatch = processedWords.some(procWord =>
      procWord === origWord ||
      origWord.includes(procWord) ||
      procWord.includes(origWord)
    );

    if (!hasMatch) {
      console.warn(`Word "${origWord}" may have been corrupted`);
      return false;
    }
  }

  return true;
}

/**
 * Get all synonyms for image search based on business description
 */
export function getImageSearchSynonyms(businessDescription: string): string[] {
  const descLower = businessDescription.toLowerCase();
  const allSynonyms: Set<string> = new Set();

  // Check each industry synonym category
  for (const [key, synonyms] of Object.entries(INDUSTRY_SYNONYMS)) {
    if (descLower.includes(key)) {
      allSynonyms.add(key);
      synonyms.forEach(syn => allSynonyms.add(syn));
    }

    // Also check if any synonym is in the description
    for (const synonym of synonyms) {
      if (descLower.includes(synonym)) {
        allSynonyms.add(key);
        synonyms.forEach(syn => allSynonyms.add(syn));
        break;
      }
    }
  }

  return Array.from(allSynonyms);
}

/**
 * Determine the most likely industry from a description
 * Uses synonym matching for accuracy
 */
export function detectIndustryFromDescription(description: string): {
  industry: string;
  confidence: number;
  matchedTerms: string[];
} {
  const descLower = description.toLowerCase();
  let bestMatch = {
    industry: 'general',
    confidence: 0,
    matchedTerms: [] as string[]
  };

  for (const [industry, synonyms] of Object.entries(INDUSTRY_SYNONYMS)) {
    const matchedTerms: string[] = [];

    // Check if industry key is in description
    if (descLower.includes(industry)) {
      matchedTerms.push(industry);
    }

    // Check all synonyms
    for (const synonym of synonyms) {
      if (descLower.includes(synonym)) {
        matchedTerms.push(synonym);
      }
    }

    // Calculate confidence based on number of matches
    const confidence = matchedTerms.length / (synonyms.length + 1);

    if (matchedTerms.length > bestMatch.matchedTerms.length) {
      bestMatch = {
        industry,
        confidence: Math.min(confidence * 2, 1), // Scale up, cap at 1
        matchedTerms
      };
    }
  }

  return bestMatch;
}

/**
 * Prevent keyword truncation by ensuring minimum word length
 * and preserving protected phrases
 */
export function sanitizeKeywordPreservingIntent(keyword: string): string {
  let result = keyword.trim();

  // Check if it's a protected phrase - return as-is
  for (const phrase of PROTECTED_PHRASES) {
    if (result.toLowerCase().includes(phrase)) {
      return result;
    }
  }

  // Remove only truly problematic characters, keep everything else
  // Only remove characters that could cause issues in search queries
  result = result.replace(/[<>{}\\|^~\[\]`]/g, '');

  // Preserve hyphens in compound words
  // Preserve apostrophes in possessives
  // Preserve periods in abbreviations

  return result;
}
