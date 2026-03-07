/**
 * API Usage Tracking Service
 *
 * This service tracks usage and costs for external APIs (OpenAI, Unsplash, Stripe, R2, etc.)
 */

import { supabase } from '../supabase';

export type ApiService =
  | 'OPENAI_GPT4'
  | 'OPENAI_GPT35'
  | 'OPENAI_DALLE'
  | 'STRIPE'
  | 'STRIPE_CONNECT'
  | 'UNSPLASH'
  | 'CLOUDFLARE_R2'
  | 'VERCEL'
  | 'PLESK'
  | 'EMAIL';

/**
 * Service display names for UI
 */
export const API_SERVICE_DISPLAY_NAMES: Record<ApiService, string> = {
  OPENAI_GPT4: 'OpenAI GPT-4',
  OPENAI_GPT35: 'OpenAI GPT-3.5',
  OPENAI_DALLE: 'OpenAI DALL-E',
  STRIPE: 'Stripe Payments',
  STRIPE_CONNECT: 'Stripe Connect',
  UNSPLASH: 'Unsplash Images',
  CLOUDFLARE_R2: 'Cloudflare R2',
  VERCEL: 'Vercel',
  PLESK: 'Plesk/Domain',
  EMAIL: 'Email Service',
};

/**
 * Service categories for grouping in UI
 */
export const API_SERVICE_CATEGORIES = {
  'AI Generation': ['OPENAI_GPT4', 'OPENAI_GPT35', 'OPENAI_DALLE'],
  'Payments': ['STRIPE', 'STRIPE_CONNECT'],
  'Media': ['UNSPLASH'],
  'Infrastructure': ['CLOUDFLARE_R2', 'VERCEL', 'PLESK'],
  'Communications': ['EMAIL'],
};

/**
 * Log API usage
 */
export async function logApiUsage(data: {
  userId: string;
  service: ApiService;
  endpoint: string;
  tokensUsed?: number;
  costUsd: number;
  requestData?: any;
  responseData?: any;
  success?: boolean;
  errorMessage?: string;
}) {
  const { data: usage, error } = await supabase
    .from('api_usage')
    .insert({
      user_id: data.userId,
      service: data.service,
      endpoint: data.endpoint,
      tokens_used: data.tokensUsed || 0,
      cost_usd: data.costUsd,
      request_data: data.requestData,
      response_data: data.responseData,
      success: data.success !== false,
      error_message: data.errorMessage,
    })
    .select()
    .single();

  if (error) throw error;
  return usage;
}

/**
 * Get user's API usage statistics
 */
export async function getUserApiUsage(
  userId: string,
  options?: {
    service?: ApiService;
    startDate?: Date;
    endDate?: Date;
  }
) {
  let query = supabase
    .from('api_usage')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.service) {
    query = query.eq('service', options.service);
  }

  if (options?.startDate) {
    query = query.gte('created_at', options.startDate.toISOString());
  }

  if (options?.endDate) {
    query = query.lte('created_at', options.endDate.toISOString());
  }

  const { data: usage, error } = await query;

  if (error) throw error;
  return usage || [];
}

/**
 * Get API usage summary
 */
export async function getApiUsageSummary(
  userId: string,
  options?: {
    service?: ApiService;
    startDate?: Date;
    endDate?: Date;
  }
) {
  const usage = await getUserApiUsage(userId, options);

  const totalRequests = usage.length;
  const totalTokens = usage.reduce((sum, item) => sum + (item.tokens_used || 0), 0);
  const totalCost = usage.reduce((sum, item) => sum + Number(item.cost_usd || 0), 0);

  return {
    totalRequests,
    totalTokens,
    totalCost,
  };
}

/**
 * Get API usage by service
 */
export async function getApiUsageByService(userId: string) {
  const { data: usage, error } = await supabase
    .from('api_usage')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;

  // Group by service manually
  const groupedByService: Record<string, { requests: number; tokens: number; cost: number }> = {};

  (usage || []).forEach((item) => {
    const service = item.service;
    if (!groupedByService[service]) {
      groupedByService[service] = { requests: 0, tokens: 0, cost: 0 };
    }
    groupedByService[service].requests += 1;
    groupedByService[service].tokens += item.tokens_used || 0;
    groupedByService[service].cost += Number(item.cost_usd || 0);
  });

  return Object.entries(groupedByService).map(([service, stats]) => ({
    service: service as ApiService,
    ...stats,
  }));
}

/**
 * Get recent API errors
 */
export async function getRecentApiErrors(userId: string, limit = 10) {
  const { data: errors, error } = await supabase
    .from('api_usage')
    .select('id, service, endpoint, error_message, created_at')
    .eq('user_id', userId)
    .eq('success', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return errors || [];
}

/**
 * Calculate AI API cost based on tokens
 * Pricing as of 2026 (update as needed)
 */
export function calculateOpenAICost(
  model: 'gpt-4.1' | 'gpt-4.1-mini' | 'gpt-4' | 'gpt-3.5-turbo' | 'dall-e-3' | 'claude-opus-4-6' | 'claude-sonnet-4-5-20250929',
  tokens?: number,
  images?: number
): number {
  if (model === 'dall-e-3') {
    // DALL-E 3: $0.04 per image (1024x1024 standard quality)
    return (images || 1) * 0.04;
  }

  if (!tokens) return 0;

  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4.1': {
      input: 0.002 / 1000, // $2.00 per 1M input tokens
      output: 0.008 / 1000, // $8.00 per 1M output tokens
    },
    'gpt-4.1-mini': {
      input: 0.0004 / 1000, // $0.40 per 1M input tokens
      output: 0.0016 / 1000, // $1.60 per 1M output tokens
    },
    'gpt-4': {
      input: 0.03 / 1000,
      output: 0.06 / 1000,
    },
    'gpt-3.5-turbo': {
      input: 0.0005 / 1000,
      output: 0.0015 / 1000,
    },
    'claude-opus-4-6': {
      input: 0.015 / 1000, // $15.00 per 1M input tokens
      output: 0.075 / 1000, // $75.00 per 1M output tokens
    },
    'claude-sonnet-4-5-20250929': {
      input: 0.003 / 1000, // $3.00 per 1M input tokens
      output: 0.015 / 1000, // $15.00 per 1M output tokens
    },
  };

  const modelPricing = pricing[model] || pricing['gpt-4.1'];

  // Estimate 50/50 split for input/output tokens
  const inputTokens = tokens * 0.5;
  const outputTokens = tokens * 0.5;

  const cost =
    inputTokens * modelPricing.input + outputTokens * modelPricing.output;

  return cost;
}
