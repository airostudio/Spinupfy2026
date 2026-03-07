/**
 * Membership Tiers Configuration
 * Defines all subscription tiers, pricing, and feature limits
 */

export type TierId = 'freemium' | 'starter' | 'pro' | 'enterprise' | 'agency'

export interface MembershipTier {
  id: TierId
  name: string
  displayName: string
  description: string

  // Pricing
  monthlyPrice: number
  yearlyPrice: number | null
  yearlyDiscountMonths: number // Free months in first year

  // Limits
  maxWebsites: number
  maxPagesPerWebsite: number | null // null = unlimited
  maxAIGenerationsPerMonth: number | null // null = unlimited

  // Features
  trialDays: number
  canExport: boolean
  canUseCustomDomain: boolean
  includesFreeDomain: boolean
  freeDomainType: 'subdomain' | 'com' | null
  prioritySupport: boolean

  // Stripe
  stripeMonthlyPriceId?: string
  stripeYearlyPriceId?: string

  // Display
  isPopular: boolean
  isCustomPricing: boolean
  features: string[] // Feature bullets for pricing page
  ctaText: string
  ctaAction: 'signup' | 'contact'
}

/**
 * IMPORTANT: These tiers are now aligned with stripe-config.ts
 * Primary configuration is in /lib/stripe-config.ts
 * Tier mapping:
 *   freemium -> FREE (1 website, 12 AI generations, 7-day expiration)
 *   starter -> BASIC (1 website, 1 seat)
 *   pro -> PROFESSIONAL (2 websites, 2 seats)
 *   agency -> AGENCY (100 websites, 5 seats)
 */
export const MEMBERSHIP_TIERS: Record<TierId, MembershipTier> = {
  freemium: {
    id: 'freemium',
    name: 'FREE',
    displayName: 'Free',
    description: 'Perfect for trying out the platform with a single playground website',

    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyDiscountMonths: 0,

    maxWebsites: 1,
    maxPagesPerWebsite: null, // unlimited pages
    maxAIGenerationsPerMonth: 12, // Enough to get 1 website completed

    trialDays: 7, // Website expires after 7 days
    canExport: false,
    canUseCustomDomain: false,
    includesFreeDomain: true,
    freeDomainType: 'subdomain',
    prioritySupport: false,

    isPopular: false,
    isCustomPricing: false,
    features: [
      '1 playground website',
      'Unlimited pages',
      '12 AI generations',
      'Website available for 7 days',
      'webese.io subdomain',
      'Limited email support',
    ],
    ctaText: 'Start Free',
    ctaAction: 'signup',
  },

  starter: {
    id: 'starter',
    name: 'BASIC',
    displayName: 'Basic',
    description: 'Ideal for individuals and small businesses getting started',

    monthlyPrice: 16.99,
    yearlyPrice: 173.88, // 10 months (2 months free)
    yearlyDiscountMonths: 2,

    maxWebsites: 1,
    maxPagesPerWebsite: null, // unlimited
    maxAIGenerationsPerMonth: null, // unlimited

    trialDays: 0, // No expiration
    canExport: true,
    canUseCustomDomain: true,
    includesFreeDomain: true,
    freeDomainType: 'subdomain',
    prioritySupport: false,

    stripeMonthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY,
    stripeYearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL,

    isPopular: false,
    isCustomPricing: false,
    features: [
      '1 professional website',
      '1 seat',
      'Unlimited pages',
      'Unlimited AI generations',
      'No expiration',
      'Free webese.io domain',
      'Custom domain support',
      'Export & transfer',
      'Email support',
    ],
    ctaText: 'Get Started',
    ctaAction: 'signup',
  },

  pro: {
    id: 'pro',
    name: 'PROFESSIONAL',
    displayName: 'Professional',
    description: 'For professionals managing multiple client projects',

    monthlyPrice: 26.99,
    yearlyPrice: 269.88, // 10 months (2 months free)
    yearlyDiscountMonths: 2,

    maxWebsites: 2,
    maxPagesPerWebsite: null, // unlimited
    maxAIGenerationsPerMonth: null, // unlimited

    trialDays: 0, // No expiration
    canExport: true,
    canUseCustomDomain: true,
    includesFreeDomain: true,
    freeDomainType: 'subdomain',
    prioritySupport: true,

    stripeMonthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
    stripeYearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL,

    isPopular: true,
    isCustomPricing: false,
    features: [
      '2 professional websites',
      '2 seats',
      'Unlimited pages',
      'Unlimited AI generations',
      'No expiration',
      'Free webese.io domains',
      'Custom domain support',
      'Export & transfer',
      'Priority support',
      'Advanced analytics',
    ],
    ctaText: 'Get Started',
    ctaAction: 'signup',
  },

  enterprise: {
    id: 'enterprise',
    name: 'PROFESSIONAL',
    displayName: 'Professional Plus',
    description: 'For growing businesses with advanced needs',

    monthlyPrice: 26.99,
    yearlyPrice: 269.88,
    yearlyDiscountMonths: 2,

    maxWebsites: 2,
    maxPagesPerWebsite: null, // unlimited
    maxAIGenerationsPerMonth: null, // unlimited

    trialDays: 0,
    canExport: true,
    canUseCustomDomain: true,
    includesFreeDomain: true,
    freeDomainType: 'com',
    prioritySupport: true,

    stripeMonthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
    stripeYearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL,

    isPopular: false,
    isCustomPricing: false,
    features: [
      '2 professional websites',
      '2 seats',
      'Unlimited pages',
      'Unlimited AI generations',
      '1 FREE .com domain',
      'Custom domain support',
      'Export & transfer',
      'Priority support',
      'Advanced analytics',
    ],
    ctaText: 'Get Started',
    ctaAction: 'signup',
  },

  agency: {
    id: 'agency',
    name: 'AGENCY',
    displayName: 'Agency',
    description: 'For agencies managing large portfolios of client websites',

    monthlyPrice: 47.49,
    yearlyPrice: 473.88, // 10 months (2 months free)
    yearlyDiscountMonths: 2,

    maxWebsites: 100,
    maxPagesPerWebsite: null, // unlimited
    maxAIGenerationsPerMonth: null, // unlimited

    trialDays: 0, // No expiration
    canExport: true,
    canUseCustomDomain: true,
    includesFreeDomain: true,
    freeDomainType: 'com',
    prioritySupport: true,

    stripeMonthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_MONTHLY,
    stripeYearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_ANNUAL,

    isPopular: false,
    isCustomPricing: false,
    features: [
      '100 professional websites',
      '5 seats',
      'Unlimited pages',
      'Unlimited AI generations',
      'No expiration',
      'FREE .com domains',
      'Custom domain support',
      'Export & transfer',
      'Dedicated account manager',
      '24/7 priority support',
      'Advanced analytics',
      'White-label options',
      'Custom integrations',
      'SLA guarantee',
    ],
    ctaText: 'Get Started',
    ctaAction: 'signup',
  },
}

// Helper to get tier by ID
export function getTier(tierId: TierId): MembershipTier {
  return MEMBERSHIP_TIERS[tierId]
}

// Helper to get all tiers as array
export function getAllTiers(): MembershipTier[] {
  return Object.values(MEMBERSHIP_TIERS)
}

// Helper to get tiers for pricing page (exclude freemium)
export function getPricingTiers(): MembershipTier[] {
  return getAllTiers().filter(tier => tier.id !== 'freemium')
}

// Helper to check if user can create website
export function canCreateWebsite(currentCount: number, tier: TierId): boolean {
  const tierConfig = getTier(tier)
  return currentCount < tierConfig.maxWebsites
}

// Helper to check if user can add pages
export function canAddPage(currentCount: number, tier: TierId): boolean {
  const tierConfig = getTier(tier)
  if (tierConfig.maxPagesPerWebsite === null) return true // unlimited
  return currentCount < tierConfig.maxPagesPerWebsite
}

// Helper to check if user has AI generations left
export function hasAIGenerationsLeft(usedThisMonth: number, tier: TierId): boolean {
  const tierConfig = getTier(tier)
  if (tierConfig.maxAIGenerationsPerMonth === null) return true // unlimited
  return usedThisMonth < tierConfig.maxAIGenerationsPerMonth
}

// Helper to format price
export function formatPrice(price: number | null): string {
  if (price === null || price === 0) return 'Free'
  return `$${price.toFixed(2)}`
}

// Helper to calculate yearly savings
export function getYearlySavings(tier: TierId): number {
  const tierConfig = getTier(tier)
  if (!tierConfig.yearlyPrice) return 0

  const monthlyTotal = tierConfig.monthlyPrice * 12
  const savings = monthlyTotal - tierConfig.yearlyPrice
  return savings
}

// Helper to get savings percentage
export function getSavingsPercentage(tier: TierId): number {
  const tierConfig = getTier(tier)
  if (!tierConfig.yearlyPrice || tierConfig.monthlyPrice === 0) return 0

  const monthlyTotal = tierConfig.monthlyPrice * 12
  const savings = monthlyTotal - tierConfig.yearlyPrice
  return Math.round((savings / monthlyTotal) * 100)
}
