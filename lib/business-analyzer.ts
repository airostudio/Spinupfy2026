/**
 * Business Intelligence Analyzer
 * Analyzes business descriptions to determine optimal features, design, and functionality
 */

import {
  detectPagesFromPrompt,
  detectBusinessType as detectBusinessTypeFromKeywords,
  getCompetitorSearchTerms,
  getExampleSites,
  getBookingConfig,
  getDefaultPages,
  detectCalculatorType as detectCalculatorTypeFromKeywords,
  BUSINESS_TYPE_CONFIGS,
  PAGE_TYPE_CONFIGS
} from './keyword-config'

export interface BusinessAnalysis {
  // Core business classification
  primaryCategory: string
  subCategory: string
  businessModel: 'B2B' | 'B2C' | 'B2B2C' | 'D2C'

  // Feature detection
  needsEcommerce: boolean
  needsBooking: boolean
  needsPortfolio: boolean
  needsBlog: boolean
  needsServices: boolean
  needsPricing: boolean
  needsGallery: boolean
  needsTeam: boolean
  needsTestimonials: boolean
  needsFAQ: boolean
  needsCalculator: boolean
  calculatorType?: 'loan' | 'mortgage' | 'roi' | 'savings' | 'quote'

  // Consultation/CTA customization
  consultationCta: {
    title: string
    subtitle: string
    buttonText: string
    floatingCta?: boolean
  }

  // Booking specifics (if needed)
  bookingType?: 'appointment' | 'reservation' | 'table' | 'viewing' | 'consultation' | 'class' | 'ticket' | 'tour'
  bookingTerminology?: {
    heading: string
    subheading: string
    buttonText: string
    dateLabel: string
    timeLabel: string
    guestLabel?: string
    partySize?: boolean
  }

  // E-commerce specifics (if needed)
  storeType?: 'physical' | 'digital' | 'service' | 'mixed'
  productType?: string

  // Design recommendations
  designMood: 'luxury' | 'professional' | 'friendly' | 'energetic' | 'calm' | 'creative' | 'minimal' | 'bold'
  colorRecommendation: {
    primary: string
    secondary: string
    accent: string
    mood: string
  }

  // Content tone
  contentTone: 'formal' | 'professional' | 'conversational' | 'playful' | 'inspirational'

  // Target audience insights
  audienceType: string[]
  pricePoint: 'budget' | 'mid-range' | 'premium' | 'luxury'
}

// Calculator type patterns for detecting when calculators are needed
const CALCULATOR_PATTERNS = {
  loan: ['loan', 'lending', 'lender', 'personal loan', 'car loan', 'auto loan', 'business loan', 'small business loan'],
  mortgage: ['mortgage', 'home loan', 'housing loan', 'property loan', 'real estate', 'realtor', 'home buying', 'homebuyer', 'first home', 'refinance', 'refinancing'],
  roi: ['investment', 'roi', 'return on investment', 'investor', 'portfolio', 'wealth management', 'financial planning', 'stock', 'trading'],
  savings: ['savings', 'retirement', 'pension', '401k', '401(k)', 'ira', 'compound interest', 'nest egg'],
  quote: ['insurance', 'quote', 'estimate', 'pricing calculator', 'cost calculator', 'get a quote']
}

// CTA patterns based on business type
const CTA_PATTERNS: Record<string, { title: string; subtitle: string; buttonText: string }> = {
  mortgage: { title: 'Ready to Start Your Home Journey?', subtitle: 'Schedule a free, no-obligation consultation with our mortgage experts', buttonText: 'Get Pre-Approved Today' },
  realEstate: { title: 'Find Your Dream Home', subtitle: 'Schedule a free consultation with our experienced agents', buttonText: 'Schedule a Viewing' },
  finance: { title: 'Take Control of Your Financial Future', subtitle: 'Book a complimentary financial review with our advisors', buttonText: 'Get Free Consultation' },
  insurance: { title: 'Protect What Matters Most', subtitle: 'Get a personalized insurance quote in minutes', buttonText: 'Get Your Free Quote' },
  legal: { title: 'Get Expert Legal Advice', subtitle: 'Schedule a confidential consultation with our attorneys', buttonText: 'Book Free Consultation' },
  medical: { title: 'Your Health is Our Priority', subtitle: 'Schedule your appointment with our care team', buttonText: 'Book Appointment' },
  dental: { title: 'Smile with Confidence', subtitle: 'Schedule your dental checkup today', buttonText: 'Book Your Visit' },
  consulting: { title: 'Transform Your Business', subtitle: 'Book a strategy session with our expert consultants', buttonText: 'Schedule Free Call' },
  coaching: { title: 'Unlock Your Potential', subtitle: 'Start your journey with a discovery call', buttonText: 'Book Discovery Call' },
  fitness: { title: 'Start Your Fitness Journey', subtitle: 'Get a personalized workout plan from our trainers', buttonText: 'Book Free Session' },
  spa: { title: 'Treat Yourself to Relaxation', subtitle: 'Book your wellness experience today', buttonText: 'Reserve Your Spot' },
  salon: { title: 'Look and Feel Your Best', subtitle: 'Schedule your appointment with our stylists', buttonText: 'Book Appointment' },
  restaurant: { title: 'Savor Every Moment', subtitle: 'Reserve your table for an unforgettable dining experience', buttonText: 'Make Reservation' },
  ecommerce: { title: 'Shop Our Latest Collection', subtitle: 'Discover quality products with free shipping on orders over $50', buttonText: 'Shop Now' },
  photography: { title: 'Capture Your Special Moments', subtitle: 'Book a session with our professional photographers', buttonText: 'Book Your Shoot' },
  wedding: { title: 'Make Your Dream Wedding a Reality', subtitle: 'Schedule a consultation to start planning your perfect day', buttonText: 'Start Planning' },
  education: { title: 'Invest in Your Future', subtitle: 'Enroll today and take the first step toward your goals', buttonText: 'Enroll Now' },
  technology: { title: 'Ready to Innovate?', subtitle: 'Let\'s discuss how we can help transform your business', buttonText: 'Get Started' },
  marketing: { title: 'Grow Your Brand', subtitle: 'Get a free marketing audit and strategy session', buttonText: 'Get Free Audit' },
  construction: { title: 'Build Your Vision', subtitle: 'Request a free project estimate today', buttonText: 'Get Free Estimate' },
  cleaning: { title: 'Experience a Spotless Space', subtitle: 'Get a free quote for your home or business', buttonText: 'Get Free Quote' },
  landscaping: { title: 'Transform Your Outdoor Space', subtitle: 'Schedule a free consultation and design preview', buttonText: 'Get Free Design' },
  default: { title: 'Ready to Get Started?', subtitle: 'Contact us today for a free consultation', buttonText: 'Contact Us' }
}

// Business keyword patterns for intelligent detection
const BUSINESS_PATTERNS = {
  // E-commerce patterns - expanded for better detection
  ecommerce: {
    strong: [
      'online store', 'e-commerce', 'ecommerce', 'shop online', 'buy now', 'add to cart',
      'checkout', 'product catalog', 'sell online', 'online shop', 'web store', 'webshop',
      'shopping cart', 'merch', 'merchandise', 'dropship', 'dropshipping', 'retail store',
      'product line', 'selling products', 'sell products', 'our products', 'buy products',
      'shop now', 'order online', 'purchase online', 'items for sale', 'products for sale',
      'online retail', 'digital storefront', 'online marketplace', 'sell items'
    ],
    moderate: [
      'products', 'shop', 'store', 'merchandise', 'inventory', 'sell', 'purchase', 'order',
      'catalog', 'collection', 'items', 'goods', 'retail', 'wholesale', 'vendor', 'supplier',
      'clothing', 'apparel', 'accessories', 'jewelry', 'gifts', 'gadgets', 'electronics',
      'handmade', 'crafts', 'artisan', 'boutique', 'fashion', 'brand', 'product range'
    ],
    weak: ['buy', 'sale', 'price', 'cost', 'shipping', 'delivery', 'stock', 'available']
  },

  // Booking patterns by type
  booking: {
    appointment: ['appointment', 'schedule', 'book a session', 'consultation', 'meeting'],
    reservation: ['reservation', 'reserve', 'book a spot', 'hold'],
    table: ['book a table', 'reserve a table', 'dining reservation', 'party size', 'make a reservation'],
    viewing: ['schedule a viewing', 'property tour', 'home tour', 'see the property', 'visit'],
    consultation: ['free consultation', 'book a call', 'schedule a demo', 'talk to us'],
    class: ['book a class', 'sign up for class', 'register for', 'enroll', 'join a session'],
    ticket: ['tickets', 'book tickets', 'event tickets', 'admission', 'entry'],
    tour: ['book a tour', 'guided tour', 'schedule tour', 'experience']
  },

  // Business model patterns
  businessModel: {
    B2B: ['enterprise', 'business solutions', 'corporate', 'B2B', 'wholesale', 'business clients', 'companies', 'organizations'],
    B2C: ['customers', 'clients', 'individuals', 'personal', 'consumer', 'retail', 'public'],
    D2C: ['direct to consumer', 'factory direct', 'brand direct', 'manufacturer']
  },

  // Price point indicators
  pricePoint: {
    luxury: ['luxury', 'premium', 'exclusive', 'elite', 'high-end', 'bespoke', 'prestigious', 'finest', 'world-class'],
    premium: ['professional', 'quality', 'expert', 'specialized', 'curated', 'artisan'],
    midRange: ['affordable', 'value', 'competitive', 'fair', 'reasonable'],
    budget: ['cheap', 'discount', 'budget', 'economical', 'low-cost', 'bargain']
  },

  // Industry-specific booking terminology
  industryBooking: {
    restaurant: { heading: 'Reserve Your Table', subheading: 'Book Your Dining Experience', buttonText: 'Confirm Reservation', dateLabel: 'Date', timeLabel: 'Time', guestLabel: 'Party Size', partySize: true },
    cafe: { heading: 'Reserve Your Spot', subheading: 'Book a Table', buttonText: 'Reserve Now', dateLabel: 'Date', timeLabel: 'Time', guestLabel: 'Guests', partySize: true },
    salon: { heading: 'Book Your Appointment', subheading: 'Schedule Your Visit', buttonText: 'Book Now', dateLabel: 'Preferred Date', timeLabel: 'Preferred Time' },
    spa: { heading: 'Book Your Treatment', subheading: 'Reserve Your Relaxation', buttonText: 'Book Treatment', dateLabel: 'Date', timeLabel: 'Time' },
    dental: { heading: 'Schedule Your Appointment', subheading: 'Book Your Dental Visit', buttonText: 'Request Appointment', dateLabel: 'Preferred Date', timeLabel: 'Preferred Time' },
    medical: { heading: 'Book an Appointment', subheading: 'Schedule Your Visit', buttonText: 'Request Appointment', dateLabel: 'Preferred Date', timeLabel: 'Preferred Time' },
    fitness: { heading: 'Book a Class', subheading: 'Reserve Your Spot', buttonText: 'Book Class', dateLabel: 'Class Date', timeLabel: 'Class Time' },
    yoga: { heading: 'Book Your Session', subheading: 'Find Your Flow', buttonText: 'Reserve Spot', dateLabel: 'Session Date', timeLabel: 'Session Time' },
    realEstate: { heading: 'Schedule a Viewing', subheading: 'Book Your Property Tour', buttonText: 'Schedule Viewing', dateLabel: 'Preferred Date', timeLabel: 'Preferred Time' },
    hotel: { heading: 'Book Your Stay', subheading: 'Reserve Your Room', buttonText: 'Check Availability', dateLabel: 'Check-in', timeLabel: 'Check-out' },
    consulting: { heading: 'Book a Consultation', subheading: 'Schedule Your Free Call', buttonText: 'Book Call', dateLabel: 'Preferred Date', timeLabel: 'Preferred Time' },
    photography: { heading: 'Book Your Session', subheading: 'Schedule Your Photoshoot', buttonText: 'Book Session', dateLabel: 'Session Date', timeLabel: 'Session Time' },
    grooming: { heading: 'Book Your Pet\'s Appointment', subheading: 'Schedule Grooming Session', buttonText: 'Book Grooming', dateLabel: 'Appointment Date', timeLabel: 'Appointment Time' },
    vet: { heading: 'Schedule a Visit', subheading: 'Book Your Pet\'s Appointment', buttonText: 'Book Appointment', dateLabel: 'Preferred Date', timeLabel: 'Preferred Time' },
    auto: { heading: 'Book a Service', subheading: 'Schedule Your Appointment', buttonText: 'Book Service', dateLabel: 'Service Date', timeLabel: 'Drop-off Time' },
    tours: { heading: 'Book Your Tour', subheading: 'Reserve Your Experience', buttonText: 'Book Tour', dateLabel: 'Tour Date', timeLabel: 'Start Time', guestLabel: 'Number of Guests', partySize: true },
    events: { heading: 'Book Your Event', subheading: 'Reserve Your Date', buttonText: 'Check Availability', dateLabel: 'Event Date', timeLabel: 'Start Time', guestLabel: 'Expected Guests', partySize: true },
    default: { heading: 'Book an Appointment', subheading: 'Schedule Your Visit', buttonText: 'Book Now', dateLabel: 'Date', timeLabel: 'Time' }
  }
}

// Design mood mapping based on business type and keywords
const DESIGN_MOODS: Record<string, BusinessAnalysis['designMood']> = {
  'luxury': 'luxury',
  'premium': 'luxury',
  'exclusive': 'luxury',
  'elegant': 'luxury',
  'sophisticated': 'luxury',
  'professional': 'professional',
  'corporate': 'professional',
  'business': 'professional',
  'enterprise': 'professional',
  'friendly': 'friendly',
  'welcoming': 'friendly',
  'family': 'friendly',
  'community': 'friendly',
  'energetic': 'energetic',
  'dynamic': 'energetic',
  'active': 'energetic',
  'fitness': 'energetic',
  'calm': 'calm',
  'peaceful': 'calm',
  'wellness': 'calm',
  'spa': 'calm',
  'yoga': 'calm',
  'creative': 'creative',
  'artistic': 'creative',
  'innovative': 'creative',
  'design': 'creative',
  'minimal': 'minimal',
  'simple': 'minimal',
  'clean': 'minimal',
  'modern': 'minimal',
  'bold': 'bold',
  'striking': 'bold',
  'vibrant': 'bold'
}

// Business type to design mood mapping (fallback when no keywords found)
// This ensures variety even when users don't specify mood keywords
const BUSINESS_TYPE_MOODS: Record<string, BusinessAnalysis['designMood']> = {
  'restaurant': 'luxury',
  'bakery': 'friendly',
  'coffee-shop': 'minimal',
  'cafe': 'friendly',
  'bar': 'bold',
  'law-firm': 'professional',
  'consulting': 'professional',
  'real-estate': 'luxury',
  'beauty-spa': 'calm',
  'hair-salon': 'creative',
  'fitness': 'energetic',
  'gym': 'bold',
  'tech-saas': 'minimal',
  'creative-agency': 'creative',
  'photography': 'minimal',
  'pet-services': 'friendly',
  'hospitality': 'luxury',
  'healthcare': 'calm',
  'dental': 'professional',
  'medical': 'professional',
  'yoga': 'calm',
  'retail': 'friendly',
  'ecommerce': 'minimal',
  'construction': 'bold',
  'automotive': 'bold',
  'education': 'friendly',
  'nonprofit': 'friendly',
  'finance': 'professional',
  'insurance': 'professional',
  'travel': 'energetic',
  'wedding': 'luxury',
  'event': 'energetic',
  'music': 'creative',
  'art': 'creative',
  'fashion': 'bold',
  'food-truck': 'energetic',
  'catering': 'luxury',
  'cleaning': 'minimal',
  'landscaping': 'friendly',
  'plumbing': 'professional',
  'electrical': 'professional',
  'hvac': 'professional',
  'roofing': 'bold',
  'florist': 'calm',
  'jewelry': 'luxury',
  'bookstore': 'calm',
  'brewery': 'bold',
  'winery': 'luxury',
}

// Industry-specific color palettes for more variety
const INDUSTRY_COLOR_PALETTES: Record<string, BusinessAnalysis['colorRecommendation'][]> = {
  restaurant: [
    { primary: '#8B0000', secondary: '#2C1810', accent: '#D4AF37', mood: 'warm and inviting' },
    { primary: '#1A472A', secondary: '#2E5A3A', accent: '#C5A059', mood: 'organic and fresh' },
    { primary: '#1E3A5F', secondary: '#2C4A6E', accent: '#E8B86D', mood: 'modern bistro' },
    { primary: '#3C1414', secondary: '#5C2C2C', accent: '#FFD700', mood: 'upscale dining' },
  ],
  bakery: [
    { primary: '#8B6914', secondary: '#D4A574', accent: '#F5E6D3', mood: 'warm and artisanal' },
    { primary: '#E8B4B8', secondary: '#FFF5F5', accent: '#B76E79', mood: 'sweet and delicate' },
    { primary: '#6B4423', secondary: '#A67C52', accent: '#FFF8DC', mood: 'rustic and homemade' },
  ],
  'coffee-shop': [
    { primary: '#3C2415', secondary: '#5C3D2E', accent: '#C4A77D', mood: 'rich and aromatic' },
    { primary: '#2D4A3E', secondary: '#4A7C6F', accent: '#C9B89F', mood: 'eco-conscious craft' },
    { primary: '#4A3728', secondary: '#7A5C45', accent: '#E8DFD1', mood: 'cozy and inviting' },
  ],
  'law-firm': [
    { primary: '#1A365D', secondary: '#2A4A6E', accent: '#C9A227', mood: 'authoritative and trustworthy' },
    { primary: '#0D1B2A', secondary: '#1B2838', accent: '#A67C52', mood: 'prestigious and established' },
    { primary: '#2C3E50', secondary: '#34495E', accent: '#27AE60', mood: 'modern and progressive' },
  ],
  'real-estate': [
    { primary: '#1A2F4A', secondary: '#2E4A6B', accent: '#C9A227', mood: 'luxury and prestige' },
    { primary: '#0F4C5C', secondary: '#1A6B7F', accent: '#E8C07D', mood: 'coastal elegance' },
    { primary: '#2C1810', secondary: '#4A3728', accent: '#D4AF37', mood: 'warm sophistication' },
  ],
  fitness: [
    { primary: '#1A1A2E', secondary: '#16213E', accent: '#E94560', mood: 'high energy and powerful' },
    { primary: '#0F0F0F', secondary: '#1A1A1A', accent: '#00FF7F', mood: 'intense and modern' },
    { primary: '#1B4332', secondary: '#2D6A4F', accent: '#95D5B2', mood: 'natural strength' },
  ],
  'beauty-spa': [
    { primary: '#2D3436', secondary: '#636E72', accent: '#DFE6E9', mood: 'serene and luxurious' },
    { primary: '#6B5B95', secondary: '#B8A9C9', accent: '#FEE1E8', mood: 'relaxing and feminine' },
    { primary: '#1A3A3A', secondary: '#2D5A5A', accent: '#C9B89F', mood: 'zen and natural' },
  ],
  'tech-saas': [
    { primary: '#0F172A', secondary: '#1E293B', accent: '#3B82F6', mood: 'modern and innovative' },
    { primary: '#18181B', secondary: '#27272A', accent: '#0EA5E9', mood: 'cutting-edge tech' },
    { primary: '#1E1E2E', secondary: '#313244', accent: '#89DCEB', mood: 'sleek and minimal' },
  ],
  'creative-agency': [
    { primary: '#000000', secondary: '#1A1A1A', accent: '#FF6B6B', mood: 'bold and creative' },
    { primary: '#1A1A2E', secondary: '#16213E', accent: '#F8B500', mood: 'innovative and striking' },
    { primary: '#2C2C54', secondary: '#474787', accent: '#AAFF00', mood: 'artistic and unique' },
  ],
  healthcare: [
    { primary: '#0D7377', secondary: '#14919B', accent: '#D4F1F4', mood: 'trustworthy and caring' },
    { primary: '#1A4D5C', secondary: '#2E7889', accent: '#7FCDCD', mood: 'professional and calming' },
    { primary: '#14532D', secondary: '#166534', accent: '#BBF7D0', mood: 'healing and natural' },
  ],
  photography: [
    { primary: '#0A0A0A', secondary: '#171717', accent: '#FFFFFF', mood: 'minimal and artistic' },
    { primary: '#1C1C1C', secondary: '#2D2D2D', accent: '#C9A227', mood: 'dramatic and elegant' },
    { primary: '#1A1A2E', secondary: '#16213E', accent: '#E94560', mood: 'bold visual impact' },
  ],
  wedding: [
    { primary: '#4A4A4A', secondary: '#6B6B6B', accent: '#D4AF37', mood: 'elegant and timeless' },
    { primary: '#2C3E50', secondary: '#34495E', accent: '#F5E6D3', mood: 'romantic and refined' },
    { primary: '#3C1414', secondary: '#5C2C2C', accent: '#FFB6C1', mood: 'romantic and luxurious' },
  ],
}

/**
 * Analyzes a business description to determine optimal website features and design
 */
export function analyzeBusinessDescription(
  description: string,
  businessName: string,
  businessType?: string,
  features?: string[]
): BusinessAnalysis {
  const lowerDesc = description.toLowerCase()
  const lowerName = businessName.toLowerCase()
  const allText = `${lowerDesc} ${lowerName} ${features?.join(' ') || ''}`.toLowerCase()

  // Detect e-commerce need
  const ecommerceScore = calculatePatternScore(allText, BUSINESS_PATTERNS.ecommerce)
  const needsEcommerce = ecommerceScore >= 2 ||
    BUSINESS_PATTERNS.ecommerce.strong.some(p => allText.includes(p))

  // Detect booking type
  let needsBooking = false
  let bookingType: BusinessAnalysis['bookingType'] = undefined

  for (const [type, patterns] of Object.entries(BUSINESS_PATTERNS.booking)) {
    if (patterns.some(p => allText.includes(p))) {
      needsBooking = true
      bookingType = type as BusinessAnalysis['bookingType']
      break
    }
  }

  // Industry-based booking detection
  const industryBookingMap: Record<string, keyof typeof BUSINESS_PATTERNS.industryBooking> = {
    'restaurant': 'restaurant',
    'cafe': 'cafe',
    'coffee': 'cafe',
    'salon': 'salon',
    'hair': 'salon',
    'barber': 'salon',
    'spa': 'spa',
    'massage': 'spa',
    'beauty': 'spa',
    'dental': 'dental',
    'dentist': 'dental',
    'medical': 'medical',
    'doctor': 'medical',
    'clinic': 'medical',
    'healthcare': 'medical',
    'fitness': 'fitness',
    'gym': 'fitness',
    'yoga': 'yoga',
    'pilates': 'yoga',
    'real estate': 'realEstate',
    'property': 'realEstate',
    'realtor': 'realEstate',
    'hotel': 'hotel',
    'accommodation': 'hotel',
    'resort': 'hotel',
    'consulting': 'consulting',
    'consultant': 'consulting',
    'advisor': 'consulting',
    'photography': 'photography',
    'photographer': 'photography',
    'grooming': 'grooming',
    'pet grooming': 'grooming',
    'dog grooming': 'grooming',
    'veterinary': 'vet',
    'vet': 'vet',
    'auto': 'auto',
    'car service': 'auto',
    'mechanic': 'auto',
    'tour': 'tours',
    'travel': 'tours',
    'event': 'events',
    'wedding': 'events',
    'party': 'events'
  }

  let bookingIndustry: keyof typeof BUSINESS_PATTERNS.industryBooking = 'default'
  for (const [keyword, industry] of Object.entries(industryBookingMap)) {
    if (allText.includes(keyword)) {
      bookingIndustry = industry
      needsBooking = true
      break
    }
  }

  // Get booking terminology based on industry
  const bookingTerminology = needsBooking
    ? BUSINESS_PATTERNS.industryBooking[bookingIndustry] || BUSINESS_PATTERNS.industryBooking.default
    : undefined

  // Detect business model
  let businessModel: BusinessAnalysis['businessModel'] = 'B2C'
  for (const [model, patterns] of Object.entries(BUSINESS_PATTERNS.businessModel)) {
    if (patterns.some(p => allText.includes(p.toLowerCase()))) {
      businessModel = model as BusinessAnalysis['businessModel']
      break
    }
  }

  // Detect price point
  let pricePoint: BusinessAnalysis['pricePoint'] = 'mid-range'
  for (const [point, patterns] of Object.entries(BUSINESS_PATTERNS.pricePoint)) {
    if (patterns.some(p => allText.includes(p))) {
      pricePoint = point.replace('midRange', 'mid-range') as BusinessAnalysis['pricePoint']
      break
    }
  }

  // Detect design mood - with smart fallbacks for variety
  let designMood: BusinessAnalysis['designMood'] = 'professional'
  let moodFromKeyword = false

  // First, check for explicit mood keywords from user description
  for (const [keyword, mood] of Object.entries(DESIGN_MOODS)) {
    if (allText.includes(keyword)) {
      designMood = mood
      moodFromKeyword = true
      break
    }
  }

  // If no explicit mood keyword found, use business type mapping for variety
  if (!moodFromKeyword && businessType) {
    const businessTypeLower = businessType.toLowerCase()
    // Check exact match first
    if (BUSINESS_TYPE_MOODS[businessTypeLower]) {
      designMood = BUSINESS_TYPE_MOODS[businessTypeLower]
    } else {
      // Check partial match (e.g., 'italian-restaurant' contains 'restaurant')
      for (const [typeKey, mood] of Object.entries(BUSINESS_TYPE_MOODS)) {
        if (businessTypeLower.includes(typeKey) || typeKey.includes(businessTypeLower)) {
          designMood = mood
          break
        }
      }
    }
  }

  // Detect other features
  const needsPortfolio = ['portfolio', 'gallery', 'work', 'projects', 'showcase', 'case study'].some(k => allText.includes(k))
  const needsBlog = ['blog', 'news', 'articles', 'updates', 'insights', 'resources'].some(k => allText.includes(k))
  const needsServices = ['service', 'consultation', 'offering', 'solution', 'what we do'].some(k => allText.includes(k))
  const needsPricing = ['pricing', 'plans', 'packages', 'rates', 'cost', 'subscription'].some(k => allText.includes(k))
  const needsGallery = ['gallery', 'photos', 'images', 'portfolio', 'showcase', 'work'].some(k => allText.includes(k))
  const needsTeam = ['team', 'staff', 'experts', 'professionals', 'founders', 'leadership'].some(k => allText.includes(k))
  const needsTestimonials = true // Always include testimonials
  const needsFAQ = ['faq', 'questions', 'common questions', 'help', 'support'].some(k => allText.includes(k))

  // Detect content tone based on business model and mood
  let contentTone: BusinessAnalysis['contentTone'] = 'professional'
  if (businessModel === 'B2B') contentTone = 'formal'
  else if (designMood === 'friendly') contentTone = 'conversational'
  else if (designMood === 'creative' || designMood === 'energetic') contentTone = 'playful'
  else if (designMood === 'calm') contentTone = 'inspirational'

  // Detect user-specified color preferences from description
  const userColorPreference = detectColorPreferences(allText)

  // Generate color recommendation based on mood (with user preference override)
  const colorRecommendation = getColorRecommendation(designMood, pricePoint, userColorPreference, businessType)

  // Detect audience types
  const audienceType = detectAudienceTypes(allText)

  // Detect calculator needs
  const { needsCalculator, calculatorType } = detectCalculatorNeeds(allText)

  // Generate business-specific CTA
  const consultationCta = generateConsultationCta(allText, needsEcommerce, needsBooking, bookingIndustry)

  return {
    primaryCategory: businessType || 'general',
    subCategory: '',
    businessModel,
    needsEcommerce,
    needsBooking,
    needsPortfolio,
    needsBlog,
    needsServices,
    needsPricing,
    needsGallery,
    needsTeam,
    needsTestimonials,
    needsFAQ,
    needsCalculator,
    calculatorType,
    consultationCta,
    bookingType,
    bookingTerminology,
    storeType: needsEcommerce ? detectStoreType(allText) : undefined,
    designMood,
    colorRecommendation,
    contentTone,
    audienceType,
    pricePoint
  }
}

function calculatePatternScore(text: string, patterns: { strong: string[], moderate: string[], weak: string[] }): number {
  let score = 0
  patterns.strong.forEach(p => { if (text.includes(p)) score += 3 })
  patterns.moderate.forEach(p => { if (text.includes(p)) score += 2 })
  patterns.weak.forEach(p => { if (text.includes(p)) score += 1 })
  return score
}

function detectStoreType(text: string): 'physical' | 'digital' | 'service' | 'mixed' {
  const digitalKeywords = ['digital', 'download', 'software', 'ebook', 'course', 'subscription', 'membership']
  const physicalKeywords = ['shipping', 'delivery', 'physical', 'handmade', 'crafted']
  const serviceKeywords = ['service', 'consultation', 'session', 'appointment', 'booking']

  const hasDigital = digitalKeywords.some(k => text.includes(k))
  const hasPhysical = physicalKeywords.some(k => text.includes(k))
  const hasService = serviceKeywords.some(k => text.includes(k))

  if (hasDigital && hasPhysical) return 'mixed'
  if (hasDigital) return 'digital'
  if (hasService) return 'service'
  return 'physical'
}

/**
 * Color palette mapping for common color keywords
 */
const COLOR_PALETTE: Record<string, { primary: string; secondary: string; accent: string }> = {
  // Blues
  blue: { primary: '#2563EB', secondary: '#3B82F6', accent: '#60A5FA' },
  navy: { primary: '#1E3A8A', secondary: '#1E40AF', accent: '#3B82F6' },
  'dark blue': { primary: '#1E3A8A', secondary: '#1E40AF', accent: '#3B82F6' },
  'light blue': { primary: '#0EA5E9', secondary: '#38BDF8', accent: '#7DD3FC' },
  sky: { primary: '#0284C7', secondary: '#0EA5E9', accent: '#38BDF8' },
  cyan: { primary: '#0891B2', secondary: '#06B6D4', accent: '#22D3EE' },
  teal: { primary: '#0D9488', secondary: '#14B8A6', accent: '#2DD4BF' },

  // Greens
  green: { primary: '#16A34A', secondary: '#22C55E', accent: '#4ADE80' },
  'dark green': { primary: '#166534', secondary: '#15803D', accent: '#22C55E' },
  'light green': { primary: '#84CC16', secondary: '#A3E635', accent: '#BEF264' },
  emerald: { primary: '#059669', secondary: '#10B981', accent: '#34D399' },
  lime: { primary: '#65A30D', secondary: '#84CC16', accent: '#A3E635' },
  mint: { primary: '#10B981', secondary: '#34D399', accent: '#6EE7B7' },

  // Reds & Pinks
  red: { primary: '#DC2626', secondary: '#EF4444', accent: '#F87171' },
  'dark red': { primary: '#991B1B', secondary: '#B91C1C', accent: '#DC2626' },
  crimson: { primary: '#BE123C', secondary: '#E11D48', accent: '#F43F5E' },
  pink: { primary: '#DB2777', secondary: '#EC4899', accent: '#F472B6' },
  rose: { primary: '#E11D48', secondary: '#F43F5E', accent: '#FB7185' },
  magenta: { primary: '#C026D3', secondary: '#D946EF', accent: '#E879F9' },

  // Blues (replacing purples)
  purple: { primary: '#2563EB', secondary: '#3B82F6', accent: '#60A5FA' },
  'dark purple': { primary: '#1E40AF', secondary: '#1D4ED8', accent: '#2563EB' },
  violet: { primary: '#2563EB', secondary: '#3B82F6', accent: '#60A5FA' },
  lavender: { primary: '#3B82F6', secondary: '#60A5FA', accent: '#93C5FD' },
  indigo: { primary: '#4F46E5', secondary: '#6366F1', accent: '#818CF8' },

  // Oranges & Yellows
  orange: { primary: '#EA580C', secondary: '#F97316', accent: '#FB923C' },
  'burnt orange': { primary: '#C2410C', secondary: '#EA580C', accent: '#F97316' },
  amber: { primary: '#D97706', secondary: '#F59E0B', accent: '#FBBF24' },
  yellow: { primary: '#CA8A04', secondary: '#EAB308', accent: '#FACC15' },
  gold: { primary: '#B45309', secondary: '#D97706', accent: '#F59E0B' },
  coral: { primary: '#F43F5E', secondary: '#FB7185', accent: '#FDA4AF' },
  peach: { primary: '#FB923C', secondary: '#FDBA74', accent: '#FED7AA' },

  // Neutrals & Special
  black: { primary: '#18181B', secondary: '#27272A', accent: '#3F3F46' },
  'dark mode': { primary: '#18181B', secondary: '#27272A', accent: '#3B82F6' },
  dark: { primary: '#1F2937', secondary: '#374151', accent: '#6366F1' },
  gray: { primary: '#4B5563', secondary: '#6B7280', accent: '#9CA3AF' },
  grey: { primary: '#4B5563', secondary: '#6B7280', accent: '#9CA3AF' },
  slate: { primary: '#334155', secondary: '#475569', accent: '#64748B' },
  white: { primary: '#F8FAFC', secondary: '#F1F5F9', accent: '#3B82F6' },
  'light mode': { primary: '#FFFFFF', secondary: '#F8FAFC', accent: '#3B82F6' },
  monochrome: { primary: '#18181B', secondary: '#3F3F46', accent: '#71717A' },

  // Browns & Earth tones
  brown: { primary: '#78350F', secondary: '#92400E', accent: '#B45309' },
  beige: { primary: '#A8A29E', secondary: '#D6D3D1', accent: '#F5F5F4' },
  tan: { primary: '#A16207', secondary: '#CA8A04', accent: '#EAB308' },
  terracotta: { primary: '#C2410C', secondary: '#EA580C', accent: '#F97316' },
  earth: { primary: '#78350F', secondary: '#92400E', accent: '#059669' },
  natural: { primary: '#65A30D', secondary: '#84CC16', accent: '#A16207' },

  // Special combinations
  'black and gold': { primary: '#18181B', secondary: '#27272A', accent: '#D4AF37' },
  'blue and white': { primary: '#2563EB', secondary: '#FFFFFF', accent: '#60A5FA' },
  'red and black': { primary: '#DC2626', secondary: '#18181B', accent: '#EF4444' },
  'green and white': { primary: '#16A34A', secondary: '#FFFFFF', accent: '#4ADE80' },
  'blue and pink': { primary: '#2563EB', secondary: '#EC4899', accent: '#60A5FA' },
  'orange and black': { primary: '#EA580C', secondary: '#18181B', accent: '#FB923C' },
  'teal and coral': { primary: '#0D9488', secondary: '#F43F5E', accent: '#2DD4BF' },
  'navy and gold': { primary: '#1E3A8A', secondary: '#D4AF37', accent: '#3B82F6' },
  pastel: { primary: '#A78BFA', secondary: '#F9A8D4', accent: '#93C5FD' },
  neon: { primary: '#22D3EE', secondary: '#0EA5E9', accent: '#4ADE80' },
  earthy: { primary: '#78350F', secondary: '#65A30D', accent: '#A16207' },
  ocean: { primary: '#0284C7', secondary: '#0D9488', accent: '#38BDF8' },
  sunset: { primary: '#EA580C', secondary: '#DB2777', accent: '#FBBF24' },
  forest: { primary: '#166534', secondary: '#065F46', accent: '#22C55E' },
  vintage: { primary: '#78350F', secondary: '#A16207', accent: '#F5F5F4' },
  modern: { primary: '#18181B', secondary: '#3F3F46', accent: '#3B82F6' },
  minimalist: { primary: '#FFFFFF', secondary: '#F8FAFC', accent: '#18181B' },
  vibrant: { primary: '#DC2626', secondary: '#2563EB', accent: '#FBBF24' },
  elegant: { primary: '#1E3A8A', secondary: '#334155', accent: '#D4AF37' },
}

/**
 * Detect color scheme preferences from user description
 */
function detectColorPreferences(text: string): { primary?: string; secondary?: string; accent?: string } | null {
  const lowerText = text.toLowerCase()

  // Check for explicit color mentions with phrases
  const colorPhrases = [
    /(?:i want|we want|i like|we like|prefer|use|with|in)\s+([\w\s]+)\s+(?:color|colours?|theme|scheme|palette)/i,
    /(?:color|colours?|theme|scheme|palette)\s+(?:should be|is|of|in)\s+([\w\s]+)/i,
    /([\w\s]+)\s+(?:and|&)\s+([\w\s]+)\s+(?:color|colours?|theme)/i,
    /(?:make it|keep it|go with|stick with)\s+([\w\s]+)/i,
  ]

  for (const pattern of colorPhrases) {
    const match = lowerText.match(pattern)
    if (match) {
      const colorMention = match[1].trim()
      // Check if this matches a known color
      for (const [colorName, palette] of Object.entries(COLOR_PALETTE)) {
        if (colorMention.includes(colorName)) {
          return palette
        }
      }
    }
  }

  // Check for direct color keyword matches (longer phrases first)
  const sortedColors = Object.keys(COLOR_PALETTE).sort((a, b) => b.length - a.length)

  for (const colorName of sortedColors) {
    // Check for "X theme", "X color", "X scheme", "X style", or just the color name in context
    const patterns = [
      new RegExp(`${colorName}\\s+(?:theme|color|scheme|style|palette|design)`, 'i'),
      new RegExp(`(?:theme|color|scheme|style|palette|design)\\s+(?:is|should be|in)\\s+${colorName}`, 'i'),
      new RegExp(`(?:want|like|prefer|use)\\s+${colorName}`, 'i'),
      new RegExp(`(?:with|in)\\s+(?:a\\s+)?${colorName}\\s+(?:theme|style|look)`, 'i'),
    ]

    for (const pattern of patterns) {
      if (pattern.test(lowerText)) {
        return COLOR_PALETTE[colorName]
      }
    }
  }

  // Check for standalone color mentions that seem intentional
  for (const colorName of sortedColors) {
    if (colorName.length > 3) { // Skip very short color names to avoid false positives
      const regex = new RegExp(`\\b${colorName}\\b`, 'i')
      // Check if it appears with design/style related context
      if (regex.test(lowerText)) {
        // Verify it's in a relevant context (near design-related words)
        const contextWords = ['website', 'design', 'look', 'feel', 'brand', 'theme', 'style', 'color', 'aesthetic']
        const hasContext = contextWords.some(word => lowerText.includes(word))
        if (hasContext) {
          return COLOR_PALETTE[colorName]
        }
      }
    }
  }

  return null
}

function getColorRecommendation(
  mood: BusinessAnalysis['designMood'],
  pricePoint: BusinessAnalysis['pricePoint'],
  userColorPreference?: { primary?: string; secondary?: string; accent?: string } | null,
  businessType?: string
) {
  const colorSchemes: Record<string, BusinessAnalysis['colorRecommendation']> = {
    luxury: { primary: '#1A2942', secondary: '#2C3E50', accent: '#D4AF37', mood: 'sophisticated and premium' },
    professional: { primary: '#1E3A5F', secondary: '#334155', accent: '#3B82F6', mood: 'trustworthy and competent' },
    friendly: { primary: '#059669', secondary: '#10B981', accent: '#F59E0B', mood: 'warm and approachable' },
    energetic: { primary: '#DC2626', secondary: '#F97316', accent: '#FBBF24', mood: 'dynamic and exciting' },
    calm: { primary: '#0EA5E9', secondary: '#06B6D4', accent: '#14B8A6', mood: 'peaceful and serene' },
    creative: { primary: '#0891B2', secondary: '#EC4899', accent: '#F97316', mood: 'innovative and artistic' },
    minimal: { primary: '#18181B', secondary: '#3F3F46', accent: '#A1A1AA', mood: 'clean and modern' },
    bold: { primary: '#0F172A', secondary: '#1E293B', accent: '#EF4444', mood: 'striking and memorable' }
  }

  // If user specified colors, use those (highest priority)
  if (userColorPreference && userColorPreference.primary) {
    return {
      primary: userColorPreference.primary,
      secondary: userColorPreference.secondary || userColorPreference.primary,
      accent: userColorPreference.accent || colorSchemes[mood]?.accent || '#3B82F6',
      mood: 'custom color scheme as requested'
    }
  }

  // Try to use industry-specific color palette for more variety
  if (businessType) {
    const businessTypeLower = businessType.toLowerCase()
    // Look for industry palettes (check exact and partial matches)
    for (const [industry, palettes] of Object.entries(INDUSTRY_COLOR_PALETTES)) {
      if (businessTypeLower.includes(industry) || industry.includes(businessTypeLower)) {
        // Use a deterministic but varied selection based on business name hash
        // This ensures same business gets same colors, but different businesses get different ones
        const hash = businessTypeLower.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const selectedPalette = palettes[hash % palettes.length]
        return selectedPalette
      }
    }
  }

  // Adjust for luxury price point
  if (pricePoint === 'luxury' && mood !== 'luxury') {
    return { ...colorSchemes[mood], accent: '#D4AF37' } // Add gold accent for luxury
  }

  return colorSchemes[mood] || colorSchemes.professional
}

function detectAudienceTypes(text: string): string[] {
  const audiences: string[] = []

  const audiencePatterns: Record<string, string[]> = {
    'Families': ['family', 'families', 'kids', 'children', 'parents'],
    'Young Professionals': ['professional', 'career', 'young', 'millennial'],
    'Business Owners': ['business owner', 'entrepreneur', 'startup', 'company'],
    'Seniors': ['senior', 'elderly', 'retirement', 'mature'],
    'Students': ['student', 'college', 'university', 'school'],
    'Pet Owners': ['pet', 'dog', 'cat', 'animal'],
    'Homeowners': ['homeowner', 'property owner', 'home buyer'],
    'Health Conscious': ['health', 'wellness', 'fitness', 'organic', 'natural']
  }

  for (const [audience, patterns] of Object.entries(audiencePatterns)) {
    if (patterns.some(p => text.includes(p))) {
      audiences.push(audience)
    }
  }

  return audiences.length > 0 ? audiences : ['General Public']
}

/**
 * Detects if the business needs a calculator and which type
 */
function detectCalculatorNeeds(text: string): { needsCalculator: boolean; calculatorType?: BusinessAnalysis['calculatorType'] } {
  // Check for each calculator type, prioritizing more specific matches
  for (const [type, patterns] of Object.entries(CALCULATOR_PATTERNS)) {
    if (patterns.some(pattern => text.includes(pattern))) {
      return {
        needsCalculator: true,
        calculatorType: type as BusinessAnalysis['calculatorType']
      }
    }
  }

  // Additional finance-related detection
  const financeKeywords = ['finance', 'financial', 'bank', 'banking', 'credit', 'lending']
  if (financeKeywords.some(k => text.includes(k))) {
    return { needsCalculator: true, calculatorType: 'loan' }
  }

  return { needsCalculator: false }
}

/**
 * Generates business-specific consultation CTA content
 */
function generateConsultationCta(
  text: string,
  needsEcommerce: boolean,
  needsBooking: boolean,
  bookingIndustry: string
): BusinessAnalysis['consultationCta'] {
  // First, check for specific business type based on keywords
  const businessTypeKeywords: Record<string, string[]> = {
    mortgage: ['mortgage', 'home loan', 'housing loan', 'refinance'],
    realEstate: ['real estate', 'realtor', 'property', 'homes for sale', 'buying a home'],
    finance: ['financial', 'wealth', 'investment', 'financial advisor', 'financial planning'],
    insurance: ['insurance', 'coverage', 'policy', 'protect'],
    legal: ['law', 'lawyer', 'attorney', 'legal', 'litigation'],
    medical: ['medical', 'doctor', 'clinic', 'healthcare', 'physician'],
    dental: ['dental', 'dentist', 'orthodont', 'teeth'],
    consulting: ['consulting', 'consultant', 'advisory', 'strategy'],
    coaching: ['coach', 'coaching', 'mentor', 'life coach', 'business coach'],
    fitness: ['fitness', 'gym', 'trainer', 'workout', 'exercise'],
    spa: ['spa', 'massage', 'wellness', 'relaxation'],
    salon: ['salon', 'hair', 'beauty', 'barber', 'stylist'],
    restaurant: ['restaurant', 'dining', 'cuisine', 'chef', 'food'],
    photography: ['photography', 'photographer', 'photo', 'portrait'],
    wedding: ['wedding', 'bridal', 'bride', 'ceremony'],
    education: ['education', 'school', 'training', 'course', 'learn', 'teach'],
    technology: ['tech', 'software', 'app', 'digital', 'IT', 'development'],
    marketing: ['marketing', 'seo', 'advertising', 'branding', 'social media'],
    construction: ['construction', 'contractor', 'building', 'renovation', 'remodel'],
    cleaning: ['cleaning', 'maid', 'housekeeping', 'janitorial'],
    landscaping: ['landscaping', 'lawn', 'garden', 'outdoor']
  }

  // Find the best matching business type
  let detectedType = 'default'
  let maxMatches = 0

  for (const [type, keywords] of Object.entries(businessTypeKeywords)) {
    const matches = keywords.filter(k => text.includes(k)).length
    if (matches > maxMatches) {
      maxMatches = matches
      detectedType = type
    }
  }

  // If no specific type detected, use booking industry if available
  if (detectedType === 'default' && bookingIndustry !== 'default') {
    const industryToCta: Record<string, string> = {
      restaurant: 'restaurant',
      salon: 'salon',
      spa: 'spa',
      fitness: 'fitness',
      dental: 'dental',
      medical: 'medical',
      realEstate: 'realEstate',
      consulting: 'consulting',
      photography: 'photography'
    }
    detectedType = industryToCta[bookingIndustry] || 'default'
  }

  // If e-commerce and no other type, use ecommerce CTA
  if (detectedType === 'default' && needsEcommerce) {
    detectedType = 'ecommerce'
  }

  const ctaConfig = CTA_PATTERNS[detectedType] || CTA_PATTERNS.default

  return {
    title: ctaConfig.title,
    subtitle: ctaConfig.subtitle,
    buttonText: ctaConfig.buttonText,
    floatingCta: needsBooking || ['mortgage', 'realEstate', 'finance', 'insurance', 'legal', 'consulting'].includes(detectedType)
  }
}

/**
 * Gets the appropriate booking form configuration based on business analysis
 */
export function getBookingFormConfig(analysis: BusinessAnalysis) {
  if (!analysis.needsBooking || !analysis.bookingTerminology) {
    return null
  }

  return {
    type: analysis.bookingType || 'appointment',
    heading: analysis.bookingTerminology.heading,
    subheading: analysis.bookingTerminology.subheading,
    buttonText: analysis.bookingTerminology.buttonText,
    fields: {
      date: { label: analysis.bookingTerminology.dateLabel, required: true },
      time: { label: analysis.bookingTerminology.timeLabel, required: true },
      ...(analysis.bookingTerminology.partySize ? {
        guests: { label: analysis.bookingTerminology.guestLabel || 'Number of Guests', required: true }
      } : {})
    }
  }
}

// ============================================================
// ENHANCED KEYWORD-BASED DETECTION FUNCTIONS
// These use the centralized keyword-config.ts for comprehensive detection
// ============================================================

export interface EnhancedBusinessAnalysis extends BusinessAnalysis {
  // Detected pages based on keyword analysis
  detectedPages: string[]

  // Competitor research info
  competitorSearchTerms: string[]
  exampleSites: string[]

  // Enhanced business type detection
  detectedBusinessType: string | null
}

/**
 * Enhanced business analysis that uses the centralized keyword configuration
 * for intelligent page detection and competitor research
 */
export function analyzeBusinessEnhanced(params: {
  description: string
  businessName: string
  businessType?: string
}): EnhancedBusinessAnalysis {
  const { description, businessName, businessType } = params

  // First, run the standard analysis
  const baseAnalysis = analyzeBusinessDescription(
    description,
    businessName,
    businessType
  )

  // Combine all text for keyword detection
  const fullPrompt = `${businessName} ${description} ${businessType || ''}`.toLowerCase()

  // Detect pages from the prompt using keyword config
  const detectedPages = detectPagesFromPrompt(fullPrompt)

  // Detect business type using keyword config (more comprehensive)
  const detectedBusinessType = detectBusinessTypeFromKeywords(fullPrompt) || businessType || null

  // Get competitor research terms
  const competitorSearchTerms = getCompetitorSearchTerms(
    detectedBusinessType || 'general',
    detectedPages
  )

  // Get example sites for inspiration
  const exampleSites = getExampleSites(
    detectedBusinessType || 'general',
    detectedPages
  )

  // Override booking config if business type config has it
  if (detectedBusinessType) {
    const businessConfig = BUSINESS_TYPE_CONFIGS[detectedBusinessType]
    if (businessConfig?.bookingTerminology && !baseAnalysis.bookingTerminology) {
      baseAnalysis.needsBooking = true
      baseAnalysis.bookingType = businessConfig.bookingType as BusinessAnalysis['bookingType']
      baseAnalysis.bookingTerminology = businessConfig.bookingTerminology
    }
  }

  // Add default pages for the business type
  const defaultPages = detectedBusinessType ? getDefaultPages(detectedBusinessType) : []
  for (const page of defaultPages) {
    if (!detectedPages.includes(page)) {
      detectedPages.push(page)
    }
  }

  return {
    ...baseAnalysis,
    detectedPages,
    competitorSearchTerms,
    exampleSites,
    detectedBusinessType
  }
}

/**
 * Get pages that should be created based on business analysis and detected keywords
 */
export function getPagesToCreate(
  analysis: EnhancedBusinessAnalysis
): Array<{ slug: string; title: string; required: boolean }> {
  const pages: Array<{ slug: string; title: string; required: boolean }> = []

  for (const pageSlug of analysis.detectedPages) {
    const pageConfig = PAGE_TYPE_CONFIGS[pageSlug]
    if (pageConfig) {
      pages.push({
        slug: pageConfig.slug,
        title: pageConfig.title,
        required: ['about', 'contact'].includes(pageSlug)
      })
    }
  }

  // Ensure required pages are included
  const requiredPages = [
    { slug: 'about', title: 'About', required: true },
    { slug: 'contact', title: 'Contact', required: true }
  ]

  for (const required of requiredPages) {
    if (!pages.some(p => p.slug === required.slug)) {
      pages.push(required)
    }
  }

  // Add shop if ecommerce detected
  if (analysis.needsEcommerce && !pages.some(p => p.slug === 'shop')) {
    pages.push({ slug: 'shop', title: 'Shop', required: false })
  }

  // Add booking if needed
  if (analysis.needsBooking && !pages.some(p => p.slug === 'book')) {
    pages.push({ slug: 'book', title: 'Book', required: false })
  }

  // Add services if needed
  if (analysis.needsServices && !pages.some(p => p.slug === 'services')) {
    pages.push({ slug: 'services', title: 'Services', required: false })
  }

  // Add portfolio if needed
  if (analysis.needsPortfolio && !pages.some(p => p.slug === 'portfolio')) {
    pages.push({ slug: 'portfolio', title: 'Portfolio', required: false })
  }

  // Add blog if needed
  if (analysis.needsBlog && !pages.some(p => p.slug === 'blog')) {
    pages.push({ slug: 'blog', title: 'Blog', required: false })
  }

  // Add calculator page for financial services
  if (analysis.needsCalculator && !pages.some(p => p.slug === 'calculator')) {
    pages.push({ slug: 'calculator', title: 'Calculator', required: false })
  }

  return pages
}

// Re-export keyword config functions for convenience
export {
  detectPagesFromPrompt,
  getCompetitorSearchTerms,
  getExampleSites,
  getBookingConfig as getBookingConfigFromKeywords,
  getDefaultPages,
  detectCalculatorType as detectCalculatorTypeFromKeywords,
  BUSINESS_TYPE_CONFIGS,
  PAGE_TYPE_CONFIGS
} from './keyword-config'
