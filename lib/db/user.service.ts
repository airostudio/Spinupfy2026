/**
 * User Database Service
 *
 * This service provides type-safe database operations for users using Supabase.
 */

import { supabase } from '../supabase';
import { PLAN_FEATURES, ADMIN_UNLIMITED, getWebsitesLimit, getGenerationsLimit, hasPlanFeature } from '../stripe-config';

export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'AGENCY';

/**
 * Create or update user (upsert)
 * This is typically called after Supabase authentication
 */
export async function upsertUser(data: {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}) {
  const { data: user, error } = await supabase
    .from('users')
    .upsert({
      id: data.id,
      email: data.email,
      name: data.name,
      avatar_url: data.avatarUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return user;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      *,
      websites (
        id,
        name,
        slug,
        published,
        created_at
      )
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return user;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) throw error;
  return user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    avatarUrl?: string;
  }
) {
  const updateData: { name?: string; avatar_url?: string } = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;

  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return user;
}

/**
 * Update user subscription
 */
export async function updateUserSubscription(
  userId: string,
  data: {
    plan: SubscriptionPlan;
    planExpiresAt?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }
) {
  const updateData: {
    plan: SubscriptionPlan;
    plan_expires_at?: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
  } = {
    plan: data.plan,
  };

  if (data.planExpiresAt !== undefined) {
    updateData.plan_expires_at = data.planExpiresAt.toISOString();
  }
  if (data.stripeCustomerId !== undefined) {
    updateData.stripe_customer_id = data.stripeCustomerId;
  }
  if (data.stripeSubscriptionId !== undefined) {
    updateData.stripe_subscription_id = data.stripeSubscriptionId;
  }

  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return user;
}

/**
 * Check if user can create more websites
 * Admin users bypass all limits
 */
export async function canCreateWebsite(userId: string): Promise<{
  canCreate: boolean;
  currentCount: number;
  limit: number;
  isAdmin: boolean;
  plan: string;
}> {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('plan, role')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return { canCreate: false, currentCount: 0, limit: 1, isAdmin: false, plan: 'FREE' };
  }

  // Admin users bypass all limits
  const isAdmin = user.role === 'admin';
  if (isAdmin) {
    return { canCreate: true, currentCount: 0, limit: ADMIN_UNLIMITED.websites, isAdmin: true, plan: user.plan || 'FREE' };
  }

  const { count, error: countError } = await supabase
    .from('websites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) {
    return { canCreate: false, currentCount: 0, limit: 1, isAdmin: false, plan: user.plan || 'FREE' };
  }

  const currentCount = count || 0;
  const limit = getWebsitesLimit(user.plan || 'FREE');

  return {
    canCreate: currentCount < limit,
    currentCount,
    limit,
    isAdmin: false,
    plan: user.plan || 'FREE',
  };
}

/**
 * Check if user can create more websites (simple boolean version for backward compatibility)
 * Admin users bypass all limits
 */
export async function canCreateWebsiteSimple(userId: string): Promise<boolean> {
  const result = await canCreateWebsite(userId);
  return result.canCreate;
}

/**
 * Check if user can generate AI content
 * Admin users bypass all limits
 * -1 for ai_generations_limit means unlimited
 */
export async function canGenerateAIContent(userId: string): Promise<{
  canGenerate: boolean;
  used: number;
  limit: number;
  remaining: number;
  isAdmin: boolean;
  isUnlimited: boolean;
}> {
  const { data: user, error } = await supabase
    .from('users')
    .select('ai_generations_used, ai_generations_limit, plan, role')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return { canGenerate: false, used: 0, limit: 0, remaining: 0, isAdmin: false, isUnlimited: false };
  }

  // Admin users bypass all limits
  const isAdmin = user.role === 'admin';
  if (isAdmin) {
    return {
      canGenerate: true,
      used: user.ai_generations_used || 0,
      limit: -1,
      remaining: -1,
      isAdmin: true,
      isUnlimited: true
    };
  }

  const used = user.ai_generations_used || 0;
  const limit = user.ai_generations_limit || getGenerationsLimit(user.plan || 'FREE');

  // -1 means unlimited
  const isUnlimited = limit === -1;
  const remaining = isUnlimited ? -1 : Math.max(0, limit - used);
  const canGenerate = isUnlimited || used < limit;

  return {
    canGenerate,
    used,
    limit,
    remaining,
    isAdmin: false,
    isUnlimited,
  };
}

/**
 * Check if user can generate AI content (simple boolean version for backward compatibility)
 */
export async function canGenerateAIContentSimple(userId: string): Promise<boolean> {
  const result = await canGenerateAIContent(userId);
  return result.canGenerate;
}

/**
 * Increment AI generation usage (atomic via Postgres function to prevent race conditions)
 * Run database/migrations/atomic-ai-usage-increment.sql in Supabase before using this.
 */
export async function incrementAIUsage(userId: string) {
  const { data: newCount, error } = await supabase
    .rpc('increment_ai_usage', { p_user_id: userId });

  if (error) throw error;
  return { ai_generations_used: newCount as number };
}

/**
 * Reset AI generation usage (called monthly for subscription renewals)
 */
export async function resetAIUsage(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .update({
      ai_generations_used: 0,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return user;
}

/**
 * Get user statistics — all independent queries run in parallel for performance
 */
export async function getUserStats(userId: string) {
  const [
    { data: user, error: userError },
    { count: totalWebsites, error: totalError },
    { count: publishedWebsites, error: publishedError },
    { data: apiCost, error: costError },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('websites').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('websites').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('published', true),
    supabase.from('api_usage').select('cost_usd').eq('user_id', userId),
  ]);

  if (userError) throw userError;
  if (!user) return null;
  if (totalError) throw totalError;
  if (publishedError) throw publishedError;
  if (costError) throw costError;

  const totalCost = (apiCost || []).reduce((sum, item) => sum + Number(item.cost_usd || 0), 0);
  const generationsUsed = user.ai_generations_used ?? 0;
  const generationsLimit = user.ai_generations_limit ?? 0;

  return {
    plan: user.plan,
    planExpiresAt: user.plan_expires_at,
    websitesCreated: totalWebsites || 0,
    publishedWebsites: publishedWebsites || 0,
    aiGenerationsUsed: generationsUsed,
    aiGenerationsLimit: generationsLimit,
    aiGenerationsRemaining: generationsLimit === -1 ? -1 : Math.max(0, generationsLimit - generationsUsed),
    totalApiCost: totalCost,
    createdAt: user.created_at,
  };
}

/**
 * Delete user and all associated data
 */
export async function deleteUser(userId: string) {
  // Supabase CASCADE deletes will handle websites, pages, sections, etc.
  const { data: user, error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return user;
}

/**
 * Check if a website is expired for free tier users
 * Free tier websites expire after 7 days
 */
export async function isWebsiteExpired(websiteId: string): Promise<{
  expired: boolean;
  expiresAt: Date | null;
  daysRemaining: number;
  userPlan: string;
}> {
  // Get website with user info
  const { data: website, error } = await supabase
    .from('websites')
    .select('id, created_at, user_id, users!inner(plan, role)')
    .eq('id', websiteId)
    .single();

  if (error || !website) {
    return { expired: false, expiresAt: null, daysRemaining: 0, userPlan: 'FREE' };
  }

  const websiteUser = website.users as unknown as { plan: string; role: string } | null;
  const userPlan = websiteUser?.plan || 'FREE';
  const isAdmin = websiteUser?.role === 'admin';

  // Admin and paid plans don't expire
  if (isAdmin || userPlan !== 'FREE') {
    return { expired: false, expiresAt: null, daysRemaining: -1, userPlan };
  }

  // Calculate expiration for free tier (7 days)
  const createdAt = new Date(website.created_at);
  const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const expired = now > expiresAt;
  const daysRemaining = expired ? 0 : Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

  return { expired, expiresAt, daysRemaining, userPlan };
}

/**
 * Get all expired websites for free tier users
 * These should be hidden from public view
 */
export async function getExpiredWebsites(): Promise<string[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get all websites from free tier users that are older than 7 days
  const { data: expiredWebsites, error } = await supabase
    .from('websites')
    .select('id, created_at, users!inner(plan, role)')
    .lte('created_at', sevenDaysAgo);

  if (error || !expiredWebsites) return [];

  type ExpiredWebsite = { id: string; created_at: string; users: { plan: string; role: string } | null };
  // Filter to only free tier users (not admin)
  return (expiredWebsites as unknown as ExpiredWebsite[])
    .filter((w) => {
      const user = w.users;
      return user?.plan === 'FREE' && user?.role !== 'admin';
    })
    .map((w) => w.id);
}

/**
 * Hide expired free tier websites
 * Called by a cron job or manually
 */
export async function hideExpiredWebsites(): Promise<number> {
  const expiredIds = await getExpiredWebsites();

  if (expiredIds.length === 0) return 0;

  // Update websites to set is_accessible = false
  const { error } = await supabase
    .from('websites')
    .update({ is_accessible: false })
    .in('id', expiredIds);

  if (error) {
    console.error('Error hiding expired websites:', error);
    return 0;
  }

  return expiredIds.length;
}

/**
 * Check user limits summary
 * Returns all limit information for a user
 */
export async function getUserLimits(userId: string): Promise<{
  plan: string;
  isAdmin: boolean;
  websites: { current: number; limit: number; canCreate: boolean };
  aiGenerations: { used: number; limit: number; remaining: number; isUnlimited: boolean };
  features: {
    customDomain: boolean;
    prioritySupport: boolean;
    websiteExpiration: number | null;
  };
}> {
  const [websiteResult, aiResult] = await Promise.all([
    canCreateWebsite(userId),
    canGenerateAIContent(userId),
  ]);

  const plan = websiteResult.plan;
  const planFeatures = PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.FREE;

  return {
    plan,
    isAdmin: websiteResult.isAdmin,
    websites: {
      current: websiteResult.currentCount,
      limit: websiteResult.limit,
      canCreate: websiteResult.canCreate,
    },
    aiGenerations: {
      used: aiResult.used,
      limit: aiResult.limit,
      remaining: aiResult.remaining,
      isUnlimited: aiResult.isUnlimited,
    },
    features: {
      customDomain: hasPlanFeature(plan, 'customDomain'),
      prioritySupport: hasPlanFeature(plan, 'prioritySupport'),
      websiteExpiration: planFeatures.websiteExpiration ?? null,
    },
  };
}
