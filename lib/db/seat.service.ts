/**
 * Seat Management Service
 *
 * Handles seat/session tracking and enforcement for subscription plans.
 * Each plan has a seat limit, and users can purchase additional seats.
 */

import { supabase } from '../supabase'
import { PLAN_FEATURES, ADMIN_UNLIMITED } from '../stripe-config'

export interface SessionInfo {
  id: string
  deviceName?: string
  browser?: string
  os?: string
  ipAddress?: string
  location?: string
  lastActiveAt: Date
  createdAt: Date
  isCurrent: boolean
}

export interface SeatStatus {
  allowed: number
  inUse: number
  available: number
  planSeats: number
  additionalSeats: number
  isOverLimit: boolean
  overageCount: number
  isAdmin: boolean
  plan: string
}

export interface SeatAlert {
  id: string
  seatsAllowed: number
  seatsInUse: number
  overageCount: number
  alertType: 'warning' | 'exceeded' | 'resolved'
  acknowledged: boolean
  createdAt: Date
}

/**
 * Get seat allocation for a plan
 */
export function getPlanSeats(plan: string): number {
  const planFeatures = PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES]
  return (planFeatures as any)?.seats || 1
}

/**
 * Get user's current seat status
 */
export async function getSeatStatus(userId: string): Promise<SeatStatus> {
  // Get user info
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('plan, role, additional_seats')
    .eq('id', userId)
    .single()

  if (userError || !user) {
    return {
      allowed: 1,
      inUse: 0,
      available: 1,
      planSeats: 1,
      additionalSeats: 0,
      isOverLimit: false,
      overageCount: 0,
      isAdmin: false,
      plan: 'FREE',
    }
  }

  // Admin gets unlimited
  if (user.role === 'admin') {
    return {
      allowed: ADMIN_UNLIMITED.seats,
      inUse: 0,
      available: ADMIN_UNLIMITED.seats,
      planSeats: ADMIN_UNLIMITED.seats,
      additionalSeats: 0,
      isOverLimit: false,
      overageCount: 0,
      isAdmin: true,
      plan: user.plan || 'FREE',
    }
  }

  const planSeats = getPlanSeats(user.plan || 'FREE')
  const additionalSeats = user.additional_seats || 0
  const allowed = planSeats + additionalSeats

  // Count active sessions
  const { count, error: countError } = await supabase
    .from('user_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true)

  const inUse = count || 0
  const available = Math.max(0, allowed - inUse)
  const isOverLimit = inUse > allowed
  const overageCount = Math.max(0, inUse - allowed)

  return {
    allowed,
    inUse,
    available,
    planSeats,
    additionalSeats,
    isOverLimit,
    overageCount,
    isAdmin: false,
    plan: user.plan || 'FREE',
  }
}

/**
 * Record a new login session
 * Returns whether the login should be allowed
 */
export async function recordSession(params: {
  userId: string
  sessionToken: string
  deviceId?: string
  deviceName?: string
  browser?: string
  os?: string
  ipAddress?: string
  location?: string
}): Promise<{
  allowed: boolean
  sessionId: string | null
  seatStatus: SeatStatus
  requiresAction: boolean
  message?: string
}> {
  const { userId, sessionToken, ...deviceInfo } = params

  // Get current seat status
  const seatStatus = await getSeatStatus(userId)

  // Admin always allowed
  if (seatStatus.isAdmin) {
    const { data: session } = await supabase
      .from('user_sessions')
      .upsert({
        user_id: userId,
        session_token: sessionToken,
        ...deviceInfo,
        is_active: true,
        last_active_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      }, {
        onConflict: 'user_id,session_token',
      })
      .select('id')
      .single()

    return {
      allowed: true,
      sessionId: session?.id || null,
      seatStatus,
      requiresAction: false,
    }
  }

  // Check if this session already exists (refresh/re-login on same device)
  const { data: existingSession } = await supabase
    .from('user_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('session_token', sessionToken)
    .single()

  if (existingSession) {
    // Just update the existing session
    await supabase
      .from('user_sessions')
      .update({
        last_active_at: new Date().toISOString(),
        is_active: true,
        ...deviceInfo,
      })
      .eq('id', existingSession.id)

    return {
      allowed: true,
      sessionId: existingSession.id,
      seatStatus,
      requiresAction: false,
    }
  }

  // Check if we're at or over the limit
  if (seatStatus.inUse >= seatStatus.allowed) {
    // Over limit - create alert and allow but flag for action
    await supabase.from('seat_overage_alerts').insert({
      user_id: userId,
      seats_allowed: seatStatus.allowed,
      seats_in_use: seatStatus.inUse + 1,
      overage_count: (seatStatus.inUse + 1) - seatStatus.allowed,
      alert_type: 'exceeded',
    })

    // Still create the session but flag for action
    const { data: session } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        ...deviceInfo,
        is_active: true,
        last_active_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id')
      .single()

    // Update seat status after recording
    const updatedStatus = await getSeatStatus(userId)

    return {
      allowed: true, // Allow but require action
      sessionId: session?.id || null,
      seatStatus: updatedStatus,
      requiresAction: true,
      message: `You've exceeded your seat limit (${seatStatus.allowed} seats). Please upgrade your plan or purchase additional seats, or log out from other devices.`,
    }
  }

  // Within limit - create session normally
  const { data: session } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      session_token: sessionToken,
      ...deviceInfo,
      is_active: true,
      last_active_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id')
    .single()

  // Update seat status after recording
  const updatedStatus = await getSeatStatus(userId)

  return {
    allowed: true,
    sessionId: session?.id || null,
    seatStatus: updatedStatus,
    requiresAction: false,
  }
}

/**
 * End a session (logout)
 */
export async function endSession(userId: string, sessionToken: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('session_token', sessionToken)

  return !error
}

/**
 * End all other sessions (keep current one)
 */
export async function endOtherSessions(userId: string, currentSessionToken: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('user_id', userId)
    .neq('session_token', currentSessionToken)
    .eq('is_active', true)
    .select('id')

  if (error) return 0
  return data?.length || 0
}

/**
 * Get all active sessions for a user
 */
export async function getActiveSessions(userId: string, currentSessionToken?: string): Promise<SessionInfo[]> {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_active_at', { ascending: false })

  if (error || !data) return []

  return data.map(session => ({
    id: session.id,
    deviceName: session.device_name,
    browser: session.browser,
    os: session.os,
    ipAddress: session.ip_address,
    location: session.location,
    lastActiveAt: new Date(session.last_active_at),
    createdAt: new Date(session.created_at),
    isCurrent: session.session_token === currentSessionToken,
  }))
}

/**
 * End a specific session by ID
 */
export async function endSessionById(userId: string, sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('id', sessionId)

  return !error
}

/**
 * Update session activity (heartbeat)
 */
export async function updateSessionActivity(userId: string, sessionToken: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('session_token', sessionToken)
    .eq('is_active', true)

  return !error
}

/**
 * Get unacknowledged seat alerts for a user
 */
export async function getUnacknowledgedAlerts(userId: string): Promise<SeatAlert[]> {
  const { data, error } = await supabase
    .from('seat_overage_alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('acknowledged', false)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map(alert => ({
    id: alert.id,
    seatsAllowed: alert.seats_allowed,
    seatsInUse: alert.seats_in_use,
    overageCount: alert.overage_count,
    alertType: alert.alert_type,
    acknowledged: alert.acknowledged,
    createdAt: new Date(alert.created_at),
  }))
}

/**
 * Acknowledge a seat alert
 */
export async function acknowledgeAlert(userId: string, alertId: string, actionTaken?: string): Promise<boolean> {
  const { error } = await supabase
    .from('seat_overage_alerts')
    .update({
      acknowledged: true,
      acknowledged_at: new Date().toISOString(),
      action_taken: actionTaken,
    })
    .eq('user_id', userId)
    .eq('id', alertId)

  return !error
}

/**
 * Purchase additional seats
 */
export async function addSeats(userId: string, seatsToAdd: number, stripeSubscriptionId?: string): Promise<{
  success: boolean
  newTotal: number
  error?: string
}> {
  if (seatsToAdd <= 0) {
    return { success: false, newTotal: 0, error: 'Must add at least 1 seat' }
  }

  // Get current seats
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('additional_seats')
    .eq('id', userId)
    .single()

  if (fetchError || !user) {
    return { success: false, newTotal: 0, error: 'User not found' }
  }

  const currentAdditional = user.additional_seats || 0
  const newTotal = currentAdditional + seatsToAdd

  // Update user
  const updateData: any = {
    additional_seats: newTotal,
    seats_updated_at: new Date().toISOString(),
  }

  if (stripeSubscriptionId) {
    updateData.stripe_seats_subscription_id = stripeSubscriptionId
  }

  const { error: updateError } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)

  if (updateError) {
    return { success: false, newTotal: currentAdditional, error: 'Failed to update seats' }
  }

  // Resolve any overage alerts
  await supabase
    .from('seat_overage_alerts')
    .update({
      alert_type: 'resolved',
      acknowledged: true,
      acknowledged_at: new Date().toISOString(),
      action_taken: 'purchased_seats',
    })
    .eq('user_id', userId)
    .eq('acknowledged', false)

  return { success: true, newTotal }
}

/**
 * Get seat pricing
 */
export async function getSeatPricing(): Promise<{
  pricePerSeatMonthly: number
  pricePerSeatAnnual: number
}[]> {
  const { data, error } = await supabase
    .from('seat_pricing')
    .select('*')
    .eq('is_active', true)
    .order('min_seats', { ascending: true })

  if (error || !data || data.length === 0) {
    // Return default pricing if not configured
    return [{
      pricePerSeatMonthly: 5.00,
      pricePerSeatAnnual: 50.00,
    }]
  }

  return data.map(p => ({
    pricePerSeatMonthly: parseFloat(p.price_per_seat_monthly),
    pricePerSeatAnnual: parseFloat(p.price_per_seat_annual),
  }))
}

/**
 * Clean up expired sessions
 * Call this periodically (e.g., via cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  // Mark expired sessions as inactive
  const { data, error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('is_active', true)
    .lt('expires_at', new Date().toISOString())
    .select('id')

  if (error) return 0
  return data?.length || 0
}
