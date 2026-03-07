/**
 * Seat Management API
 *
 * Handles seat status, session management, and seat purchases
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  getSeatStatus,
  getActiveSessions,
  endSessionById,
  endOtherSessions,
  getUnacknowledgedAlerts,
  acknowledgeAlert,
  addSeats,
  getSeatPricing,
} from '@/lib/db/seat.service'

/**
 * GET /api/user/seats
 * Get current seat status, active sessions, and alerts
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const currentSessionToken = searchParams.get('sessionToken') || undefined

    // Get all data in parallel
    const [seatStatus, sessions, alerts, pricing] = await Promise.all([
      getSeatStatus(user.id),
      getActiveSessions(user.id, currentSessionToken),
      getUnacknowledgedAlerts(user.id),
      getSeatPricing(),
    ])

    return NextResponse.json({
      status: seatStatus,
      sessions,
      alerts,
      pricing,
    })
  } catch (error: any) {
    console.error('Error getting seat status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get seat status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/seats
 * Actions: end-session, end-other-sessions, acknowledge-alert, add-seats
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'end-session': {
        const { sessionId } = body
        if (!sessionId) {
          return NextResponse.json(
            { error: 'sessionId required' },
            { status: 400 }
          )
        }

        const success = await endSessionById(user.id, sessionId)
        if (!success) {
          return NextResponse.json(
            { error: 'Failed to end session' },
            { status: 500 }
          )
        }

        const newStatus = await getSeatStatus(user.id)
        return NextResponse.json({
          success: true,
          message: 'Session ended successfully',
          status: newStatus,
        })
      }

      case 'end-other-sessions': {
        const { currentSessionToken } = body
        if (!currentSessionToken) {
          return NextResponse.json(
            { error: 'currentSessionToken required' },
            { status: 400 }
          )
        }

        const count = await endOtherSessions(user.id, currentSessionToken)
        const newStatus = await getSeatStatus(user.id)

        return NextResponse.json({
          success: true,
          message: `Logged out ${count} other session(s)`,
          sessionsEnded: count,
          status: newStatus,
        })
      }

      case 'acknowledge-alert': {
        const { alertId, actionTaken } = body
        if (!alertId) {
          return NextResponse.json(
            { error: 'alertId required' },
            { status: 400 }
          )
        }

        const success = await acknowledgeAlert(user.id, alertId, actionTaken)
        if (!success) {
          return NextResponse.json(
            { error: 'Failed to acknowledge alert' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Alert acknowledged',
        })
      }

      case 'add-seats': {
        const { quantity, stripeSubscriptionId } = body
        if (!quantity || quantity < 1) {
          return NextResponse.json(
            { error: 'quantity must be at least 1' },
            { status: 400 }
          )
        }

        const result = await addSeats(user.id, quantity, stripeSubscriptionId)
        if (!result.success) {
          return NextResponse.json(
            { error: result.error },
            { status: 500 }
          )
        }

        const newStatus = await getSeatStatus(user.id)
        return NextResponse.json({
          success: true,
          message: `Added ${quantity} seat(s)`,
          newTotal: result.newTotal,
          status: newStatus,
        })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Error processing seat action:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process action' },
      { status: 500 }
    )
  }
}
