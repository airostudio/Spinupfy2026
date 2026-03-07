import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * All trackable API services
 */
export type ApiServiceType =
  | 'OPENAI_GPT4'
  | 'OPENAI_DALLE'
  | 'STRIPE'           // Payment processing fees
  | 'STRIPE_CONNECT'   // Connected account fees
  | 'UNSPLASH'         // Image API (free tier, but track for analytics)
  | 'CLOUDFLARE_R2'    // Storage costs
  | 'VERCEL'           // Serverless function invocations
  | 'PLESK'            // Domain/hosting management
  | 'EMAIL'            // Transactional email services

/**
 * API pricing information (2025 rates)
 */
export const API_PRICING = {
  // OpenAI
  OPENAI_GPT4: {
    inputPer1K: 0.01,      // $0.01 per 1K input tokens
    outputPer1K: 0.03,     // $0.03 per 1K output tokens
  },
  OPENAI_DALLE: {
    standard1024: 0.04,    // $0.04 per 1024x1024 image
    hd1792: 0.08,          // $0.08 per 1792x1024 HD image
  },
  // Stripe (2.9% + $0.30 per successful charge)
  STRIPE: {
    percentageFee: 0.029,  // 2.9%
    fixedFee: 0.30,        // $0.30 per transaction
  },
  // Stripe Connect (0.25% platform fee for Express accounts)
  STRIPE_CONNECT: {
    platformFee: 0.0025,   // 0.25%
  },
  // Unsplash (free for most use, production API may have costs)
  UNSPLASH: {
    perRequest: 0,         // Free tier
    productionPerRequest: 0.01,  // Production API
  },
  // Cloudflare R2 ($0.015 per GB storage, $0.36 per million Class A, $0.036 per million Class B)
  CLOUDFLARE_R2: {
    storagePerGB: 0.015,   // Per GB per month
    classAPerMillion: 0.36, // PUT, POST, LIST operations
    classBPerMillion: 0.036, // GET, HEAD operations
  },
  // Vercel (Pro plan: $20/mo + $0.60 per 100 GB-hrs)
  VERCEL: {
    perInvocation: 0.000001,  // Minimal per invocation
    perGBHour: 0.006,         // $0.60 per 100 GB-hrs
  },
  // Email (average transactional email cost)
  EMAIL: {
    perEmail: 0.001,       // ~$1 per 1000 emails
  },
  // Plesk/Domain (averaged annual cost per operation)
  PLESK: {
    domainCheck: 0.001,    // Domain availability check
    sslCert: 0,            // Let's Encrypt (free)
  },
}

/**
 * Track API usage cost in the database
 */
export async function trackApiCost(params: {
  userId: string
  service: ApiServiceType
  endpoint: string
  tokensUsed?: number
  imagesGenerated?: number
  requestData?: any
  success?: boolean
  errorMessage?: string
  transactionAmount?: number  // For Stripe fee calculation
  storageBytes?: number       // For R2 storage calculation
  operationType?: 'classA' | 'classB'  // For R2 operations
}) {
  const {
    userId,
    service,
    endpoint,
    tokensUsed = 0,
    imagesGenerated = 0,
    requestData,
    success = true,
    errorMessage,
    transactionAmount = 0,
    storageBytes = 0,
    operationType,
  } = params

  // Calculate cost based on service
  let costUsd = 0

  if (service === 'OPENAI_GPT4') {
    // GPT-4 Turbo pricing
    const inputTokens = tokensUsed * 0.5
    const outputTokens = tokensUsed * 0.5
    costUsd = (inputTokens * API_PRICING.OPENAI_GPT4.inputPer1K / 1000) +
              (outputTokens * API_PRICING.OPENAI_GPT4.outputPer1K / 1000)
  } else if (service === 'OPENAI_DALLE') {
    // DALL-E 3 pricing - assume HD images
    costUsd = imagesGenerated * API_PRICING.OPENAI_DALLE.hd1792
  } else if (service === 'STRIPE') {
    // Stripe payment processing fees
    if (transactionAmount > 0) {
      costUsd = (transactionAmount * API_PRICING.STRIPE.percentageFee) + API_PRICING.STRIPE.fixedFee
    }
  } else if (service === 'STRIPE_CONNECT') {
    // Stripe Connect platform fees
    if (transactionAmount > 0) {
      costUsd = transactionAmount * API_PRICING.STRIPE_CONNECT.platformFee
    }
  } else if (service === 'UNSPLASH') {
    // Unsplash is free tier, but track for analytics
    costUsd = API_PRICING.UNSPLASH.perRequest
  } else if (service === 'CLOUDFLARE_R2') {
    // R2 storage/operation costs
    if (storageBytes > 0) {
      const storageGB = storageBytes / (1024 * 1024 * 1024)
      costUsd = storageGB * API_PRICING.CLOUDFLARE_R2.storagePerGB
    } else if (operationType === 'classA') {
      costUsd = API_PRICING.CLOUDFLARE_R2.classAPerMillion / 1000000
    } else if (operationType === 'classB') {
      costUsd = API_PRICING.CLOUDFLARE_R2.classBPerMillion / 1000000
    }
  } else if (service === 'VERCEL') {
    // Vercel serverless invocation
    costUsd = API_PRICING.VERCEL.perInvocation
  } else if (service === 'EMAIL') {
    // Email costs
    costUsd = API_PRICING.EMAIL.perEmail
  } else if (service === 'PLESK') {
    // Plesk domain operations
    costUsd = API_PRICING.PLESK.domainCheck
  }

  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('api_usage')
      .insert({
        user_id: userId,
        service,
        endpoint,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        request_data: requestData,
        success,
        error_message: errorMessage,
      })

    if (error) {
      console.error('Error tracking API cost:', error)
    }

    return costUsd
  } catch (error) {
    console.error('Failed to track API cost:', error)
    return costUsd
  }
}

/**
 * Calculate estimated cost for website generation
 */
export function estimateGenerationCost() {
  // Actual costs based on current generation (updated Dec 2025):
  // - Content generation (GPT-4 Turbo): ~3000 tokens = $0.06
  // - Logo (DALL-E 3 1024x1024): 1 image = $0.04
  // - Hero image (DALL-E 3 HD 1792x1024): 1 image = $0.08
  // - Feature images (DALL-E 3 HD): 6 images = $0.48
  // - Team headshots (DALL-E 3 HD): 3 images = $0.24
  // - Product images (DALL-E 3 HD, if e-commerce): 3-6 images = $0.24-$0.48
  //
  // Total basic website: $0.90 (without e-commerce)
  // Total e-commerce website: $1.14-$1.38 (with 3-6 products)

  return {
    contentGeneration: 0.06,     // GPT-4 Turbo text generation
    logo: 0.04,                  // 1 logo image
    heroImage: 0.08,             // 1 hero image
    featureImages: 0.48,         // 6 feature images
    teamHeadshots: 0.24,         // 3 professional headshots (NEW)
    productImagesMin: 0.24,      // 3 product images (if e-commerce)
    productImagesMax: 0.48,      // 6 product images (if e-commerce)

    // Totals
    basicWebsite: 0.90,          // Without e-commerce
    ecommerceMin: 1.14,          // With 3 products
    ecommerceMax: 1.38,          // With 6 products
    bookingWebsite: 0.90,        // Booking system (same as basic)
  }
}
