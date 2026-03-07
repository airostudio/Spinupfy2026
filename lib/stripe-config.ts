/**
 * Stripe Configuration
 *
 * This file contains Stripe price IDs and plan mappings.
 * Update these values with your actual Stripe price IDs from your Stripe Dashboard.
 */

export const STRIPE_PLANS = {
  BASIC: {
    name: 'Basic',
    monthly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY || 'price_basic_monthly',
      amount: 16.99, // Includes Stripe fees (2.9% + $0.30)
    },
    annual: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL || 'price_basic_annual',
      amount: 173.88, // 10 months charged (2 months free) + Stripe fees
    },
    features: {
      websites: 1,
      seats: 1,
      aiGenerations: -1, // Unlimited (enough for ongoing website maintenance)
      customDomain: true,
      prioritySupport: false,
      websiteExpiration: null, // No expiration
    },
  },
  PROFESSIONAL: {
    name: 'Professional',
    monthly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
      amount: 26.99, // Includes Stripe fees (2.9% + $0.30)
    },
    annual: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual',
      amount: 269.88, // 10 months charged (2 months free) + Stripe fees
    },
    features: {
      websites: 2,
      seats: 2,
      aiGenerations: -1, // Unlimited
      customDomain: true,
      prioritySupport: true,
      websiteExpiration: null, // No expiration
    },
  },
  AGENCY: {
    name: 'Agency',
    monthly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_MONTHLY || 'price_agency_monthly',
      amount: 47.49, // Includes Stripe fees (2.9% + $0.30)
    },
    annual: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_ANNUAL || 'price_agency_annual',
      amount: 473.88, // 10 months charged (2 months free) + Stripe fees
    },
    features: {
      websites: 100,
      seats: 5,
      aiGenerations: -1, // Unlimited
      customDomain: true,
      prioritySupport: true,
      websiteExpiration: null, // No expiration
    },
  },
}

export const PLAN_FEATURES = {
  FREE: {
    websites: 1,
    seats: 1,
    aiGenerations: 12, // Enough to get 1 website completed
    customDomain: false,
    prioritySupport: false,
    websiteExpiration: 7, // Website hidden after 7 days
  },
  BASIC: STRIPE_PLANS.BASIC.features,
  PROFESSIONAL: STRIPE_PLANS.PROFESSIONAL.features,
  AGENCY: STRIPE_PLANS.AGENCY.features,
}

// Admin role bypasses all limits
export const ADMIN_UNLIMITED = {
  websites: Infinity,
  seats: Infinity,
  aiGenerations: -1, // -1 means unlimited
  customDomain: true,
  prioritySupport: true,
  websiteExpiration: null,
}

export const PLAN_NAMES = {
  FREE: 'Free',
  BASIC: 'Basic',
  PROFESSIONAL: 'Professional',
  AGENCY: 'Agency',
} as const

/**
 * Map Stripe price IDs to plan names
 * This is used by the webhook to determine which plan a user has subscribed to
 */
export function getPlanFromPriceId(priceId: string): string {
  // Check all plans and their price IDs
  for (const [planName, planData] of Object.entries(STRIPE_PLANS)) {
    if (
      planData.monthly.priceId === priceId ||
      planData.annual.priceId === priceId
    ) {
      return planName
    }
  }

  // Default to STARTER if not found
  return 'STARTER'
}

/**
 * Get AI generations limit for a plan
 */
export function getGenerationsLimit(plan: string): number {
  const planFeatures = PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES]
  return planFeatures?.aiGenerations || 10
}

/**
 * Get website limit for a plan
 */
export function getWebsitesLimit(plan: string): number {
  const planFeatures = PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES]
  return planFeatures?.websites || 1
}

/**
 * Check if a plan has a specific feature
 */
export function hasPlanFeature(plan: string, feature: keyof typeof PLAN_FEATURES.FREE): boolean {
  const planFeatures = PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES]
  const value = planFeatures?.[feature]
  return typeof value === 'boolean' ? value : !!value
}

/**
 * Get seats limit for a plan
 */
export function getSeatsLimit(plan: string): number {
  const planFeatures = PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES]
  return planFeatures?.seats ?? 1
}

/**
 * Additional seats pricing
 */
export const SEAT_PRICING = {
  // Default pricing if not configured in database
  pricePerSeatMonthly: 5.00,
  pricePerSeatAnnual: 50.00,
  // Stripe price IDs (set these in your Stripe Dashboard)
  stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SEAT_MONTHLY || '',
  stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_SEAT_ANNUAL || '',
}
