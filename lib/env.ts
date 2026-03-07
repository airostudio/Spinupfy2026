import { z } from 'zod';

/**
 * Environment Variable Validation Schema
 *
 * This file validates all environment variables at build/runtime
 * to catch configuration errors early.
 */

// Server-side environment variables
const serverSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database & Supabase
  DATABASE_URL: z.string().url().min(1, 'DATABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1, 'NEXT_PUBLIC_SUPABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  OPENAI_ORG_ID: z.string().optional(),

  // Stripe (required for payments)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID_STARTER: z.string().optional(),
  STRIPE_PRICE_ID_PRO: z.string().optional(),
  STRIPE_PRICE_ID_ENTERPRISE: z.string().optional(),

  // Unsplash (optional)
  UNSPLASH_ACCESS_KEY: z.string().optional(),
  UNSPLASH_SECRET_KEY: z.string().optional(),

  // Redis (for caching and rate limiting)
  REDIS_URL: z.string().optional(),
  REDIS_TOKEN: z.string().optional(),

  // Sentry (for error tracking)
  SENTRY_DSN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  // Cloudflare (for custom domains)
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  CLOUDFLARE_ZONE_ID: z.string().optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),

  // Security
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters').optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  CSRF_SECRET: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).optional().default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).optional().default('60000'),
  RATE_LIMIT_MAX_REQUESTS_PER_DAY: z.string().transform(Number).pipe(z.number().positive()).optional().default('1000'),

  // File Upload
  MAX_FILE_SIZE_MB: z.string().transform(Number).pipe(z.number().positive()).optional().default('10'),
  ALLOWED_FILE_TYPES: z.string().optional().default('image/jpeg,image/png,image/gif,image/webp'),

  // Feature Flags
  ENABLE_PAYMENTS: z.string().transform(val => val === 'true').optional().default('false'),
  ENABLE_CUSTOM_DOMAINS: z.string().transform(val => val === 'true').optional().default('false'),
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').optional().default('false'),
  ENABLE_EMAIL_NOTIFICATIONS: z.string().transform(val => val === 'true').optional().default('false'),

  // Development
  ANALYZE_BUNDLE: z.string().transform(val => val === 'true').optional().default('false'),
  DEBUG_MODE: z.string().transform(val => val === 'true').optional().default('false'),
});

// Client-side environment variables (must start with NEXT_PUBLIC_)
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.preprocess(
    (val) => (!val || val === '' ? 'http://localhost:3000' : val),
    z.string().url()
  ),
  NEXT_PUBLIC_APP_NAME: z.string().default('AI Website Builder'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_WEBSITE_BASE_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

/**
 * Validate server-side environment variables
 * This runs on the server only
 */
export function validateServerEnv() {
  try {
    const parsed = serverSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => {
        return `  - ${err.path.join('.')}: ${err.message}`;
      }).join('\n');

      throw new Error(
        `❌ Invalid environment variables:\n${missingVars}\n\n` +
        `Please check your .env.local file and make sure all required variables are set.\n` +
        `See .env.example for reference.`
      );
    }
    throw error;
  }
}

/**
 * Validate client-side environment variables
 * This runs on both server and client
 */
export function validateClientEnv() {
  try {
    const parsed = clientSchema.parse({
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_WEBSITE_BASE_DOMAIN: process.env.NEXT_PUBLIC_WEBSITE_BASE_DOMAIN,
      NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    });
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => {
        return `  - ${err.path.join('.')}: ${err.message}`;
      }).join('\n');

      throw new Error(
        `❌ Invalid public environment variables:\n${missingVars}\n\n` +
        `Please check your .env.local file.`
      );
    }
    throw error;
  }
}

/**
 * Type-safe environment variables for server-side code
 * Usage: import { env } from '@/lib/env'
 */
export const env = typeof window === 'undefined'
  ? validateServerEnv()
  : {} as z.infer<typeof serverSchema>;

/**
 * Type-safe environment variables for client-side code
 * Usage: import { clientEnv } from '@/lib/env'
 */
export const clientEnv = validateClientEnv();

/**
 * Runtime configuration object with helper functions
 */
export const config = {
  // App
  app: {
    url: clientEnv.NEXT_PUBLIC_APP_URL,
    name: clientEnv.NEXT_PUBLIC_APP_NAME,
    env: env.NODE_ENV || 'development',
  },

  // Supabase
  supabase: {
    url: clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // OpenAI
  openai: {
    apiKey: env.OPENAI_API_KEY,
    orgId: env.OPENAI_ORG_ID,
  },

  // Feature flags
  features: {
    payments: env.ENABLE_PAYMENTS,
    customDomains: env.ENABLE_CUSTOM_DOMAINS,
    analytics: env.ENABLE_ANALYTICS,
    emailNotifications: env.ENABLE_EMAIL_NOTIFICATIONS,
  },

  // Rate limiting
  rateLimit: {
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequestsPerDay: env.RATE_LIMIT_MAX_REQUESTS_PER_DAY,
  },

  // File upload
  upload: {
    maxSizeMB: env.MAX_FILE_SIZE_MB,
    allowedTypes: env.ALLOWED_FILE_TYPES.split(','),
  },
} as const;

// Type exports
export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;
