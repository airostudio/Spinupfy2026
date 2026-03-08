/**
 * Spinupfy Pricing Engine
 *
 * Calculates time-based pricing for temporary one-page sites.
 * Pricing tiers reward longer commitments with better daily rates.
 */

export type PricingTier = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom'

export interface PricingBreakdown {
  days: number
  tier: PricingTier
  dailyRate: number
  basePrice: number
  totalPrice: number    // basePrice + platform fee
  platformFee: number
  currency: 'usd'
  label: string         // human-friendly e.g. "3 weeks"
  savingsVsDaily: number // dollars saved vs buying daily
  recommended: boolean
  description: string
}

export interface PricingOptions {
  startDate: Date
  endDate: Date
  templateType: SpinupfyTemplateType
}

export type SpinupfyTemplateType =
  | 'event_flyer'
  | 'concert_show'
  | 'party_invite'
  | 'wedding_rsvp'
  | 'festival'
  | 'sports_event'
  | 'art_exhibition'
  | 'graduation_celebration'
  | 'real_estate_listing'
  | 'open_house'
  | 'new_development'
  | 'vacation_rental'
  | 'flash_sale'
  | 'popup_store'
  | 'garage_sale'
  | 'holiday_sale'
  | 'clearance_sale'
  | 'market_stall'
  | 'booking_page'
  | 'food_truck'
  | 'seasonal_service'
  | 'popup_restaurant'
  | 'fundraiser'
  | 'community_event'
  | 'charity_drive'
  | 'job_listing'
  | 'product_launch'
  | 'coming_soon'
  | 'contest_giveaway'
  | 'election_campaign'
  | 'crowdfunding'

// Base daily rates per template type (reflect value delivered)
// Multiplier applied on top of these based on template.priceMultiplier
const BASE_DAILY_RATE = 0.99  // default daily rate for all templates

// Per-template daily rate overrides (base × priceMultiplier from template config)
const BASE_DAILY_RATES: Record<SpinupfyTemplateType, number> = {
  event_flyer:           0.99,
  concert_show:          1.09,
  party_invite:          0.89,
  wedding_rsvp:          1.19,
  festival:              1.19,
  sports_event:          0.99,
  art_exhibition:        0.99,
  graduation_celebration:0.89,
  real_estate_listing:   1.79,
  open_house:            1.49,
  new_development:       1.99,
  vacation_rental:       1.49,
  flash_sale:            1.29,
  popup_store:           1.49,
  garage_sale:           0.69,
  holiday_sale:          1.19,
  clearance_sale:        0.99,
  market_stall:          0.79,
  booking_page:          1.19,
  food_truck:            0.99,
  seasonal_service:      1.09,
  popup_restaurant:      1.39,
  fundraiser:            0.79,
  community_event:       0.79,
  charity_drive:         0.69,
  job_listing:           0.99,
  product_launch:        1.59,
  coming_soon:           0.99,
  contest_giveaway:      0.99,
  election_campaign:     1.49,
  crowdfunding:          1.39,
}

// Volume discount multipliers per day-count bracket
const TIER_DISCOUNT: Array<{ minDays: number; multiplier: number; tier: PricingTier }> = [
  { minDays: 1,   multiplier: 1.00, tier: 'daily'     },  // no discount
  { minDays: 7,   multiplier: 0.85, tier: 'weekly'    },  // 15% off
  { minDays: 14,  multiplier: 0.75, tier: 'biweekly'  },  // 25% off
  { minDays: 30,  multiplier: 0.65, tier: 'monthly'   },  // 35% off
]

const PLATFORM_FEE_RATE = 0.08  // 8% platform fee (covers hosting + email + lifecycle)
const MIN_PRICE = 1.99           // floor price

function getTierDiscount(days: number) {
  // Find the best tier bracket that applies
  for (let i = TIER_DISCOUNT.length - 1; i >= 0; i--) {
    if (days >= TIER_DISCOUNT[i].minDays) return TIER_DISCOUNT[i]
  }
  return TIER_DISCOUNT[0]
}

function daysBetween(start: Date, end: Date): number {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
}

function humanLabel(days: number): string {
  if (days === 1) return '1 day'
  if (days < 7)   return `${days} days`
  if (days === 7)  return '1 week'
  if (days < 14)  return `${days} days`
  if (days === 14) return '2 weeks'
  if (days < 30)  return `${days} days`
  if (days === 30) return '1 month'
  const weeks = Math.round(days / 7)
  return `${weeks} weeks`
}

export function calculatePricing(options: PricingOptions): PricingBreakdown {
  const { startDate, endDate, templateType } = options
  const days = daysBetween(startDate, endDate)
  const { multiplier, tier } = getTierDiscount(days)

  const baseDailyRate = BASE_DAILY_RATES[templateType]
  const effectiveDailyRate = baseDailyRate * multiplier
  const basePrice = Math.max(MIN_PRICE, effectiveDailyRate * days)
  const platformFee = basePrice * PLATFORM_FEE_RATE
  const totalPrice = basePrice + platformFee

  const savingsVsDaily = (baseDailyRate * days) - basePrice

  const recommended = days >= 7 && days <= 30  // sweet spot

  const tierDescriptions: Record<PricingTier, string> = {
    daily:     'Pay as you go, full flexibility',
    weekly:    '15% off — great for short promotions',
    biweekly:  '25% off — ideal for two-week campaigns',
    monthly:   '35% off — best value for ongoing exposure',
    custom:    'Custom duration with volume pricing',
  }

  return {
    days,
    tier,
    dailyRate: effectiveDailyRate,
    basePrice: Math.round(basePrice * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    currency: 'usd',
    label: humanLabel(days),
    savingsVsDaily: Math.round(savingsVsDaily * 100) / 100,
    recommended,
    description: tierDescriptions[tier],
  }
}

/**
 * Suggest the best date range options for a given end-date target.
 * Returns 3 options: shortest sensible window, recommended, and max value.
 */
export function suggestPricingOptions(
  templateType: SpinupfyTemplateType,
  eventDate?: Date
): Array<{ label: string; days: number; endDate: Date; pricing: PricingBreakdown }> {
  const now = new Date()
  const target = eventDate || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  // How many days until the event?
  const daysToEvent = Math.max(1, daysBetween(now, target))

  const options: Array<{ label: string; days: number }> = []

  if (daysToEvent <= 3) {
    options.push({ label: `${daysToEvent} day${daysToEvent > 1 ? 's' : ''}`, days: daysToEvent })
    options.push({ label: '1 week', days: 7 })
    options.push({ label: '2 weeks', days: 14 })
  } else if (daysToEvent <= 7) {
    options.push({ label: `${daysToEvent} days (exact)`, days: daysToEvent })
    options.push({ label: '1 week', days: 7 })
    options.push({ label: '2 weeks', days: 14 })
  } else if (daysToEvent <= 14) {
    options.push({ label: '1 week', days: 7 })
    options.push({ label: `${daysToEvent} days (exact)`, days: daysToEvent })
    options.push({ label: '1 month', days: 30 })
  } else {
    options.push({ label: '2 weeks', days: 14 })
    options.push({ label: '1 month', days: 30 })
    options.push({ label: '2 months', days: 60 })
  }

  return options.map(({ label, days }) => {
    const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    return {
      label,
      days,
      endDate,
      pricing: calculatePricing({ startDate: now, endDate, templateType }),
    }
  })
}

/**
 * Calculate extension pricing: incremental cost to extend an existing site.
 */
export function calculateExtensionPrice(
  templateType: SpinupfyTemplateType,
  currentEndDate: Date,
  newEndDate: Date
): PricingBreakdown {
  return calculatePricing({
    startDate: currentEndDate,
    endDate: newEndDate,
    templateType,
  })
}

/**
 * Format a price for display.
 */
export function formatPrice(amount: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount)
}
