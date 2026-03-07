'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X, Users, LogOut, CreditCard, Monitor } from 'lucide-react'
import { Button } from '@/components/ui'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Session {
  id: string
  deviceName?: string
  browser?: string
  os?: string
  location?: string
  lastActiveAt: string
  isCurrent: boolean
}

interface SeatStatus {
  allowed: number
  inUse: number
  available: number
  planSeats: number
  additionalSeats: number
  isOverLimit: boolean
  overageCount: number
  plan: string
}

interface SeatAlert {
  id: string
  seatsAllowed: number
  seatsInUse: number
  overageCount: number
  alertType: 'warning' | 'exceeded' | 'resolved'
}

interface SeatLimitAlertProps {
  onClose?: () => void
  sessionToken?: string
}

export function SeatLimitAlert({ onClose, sessionToken }: SeatLimitAlertProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<SeatStatus | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [alerts, setAlerts] = useState<SeatAlert[]>([])
  const [endingSession, setEndingSession] = useState<string | null>(null)
  const [showSessions, setShowSessions] = useState(false)

  useEffect(() => {
    fetchSeatData()
  }, [])

  async function fetchSeatData() {
    try {
      const params = sessionToken ? `?sessionToken=${sessionToken}` : ''
      const response = await fetch(`/api/user/seats${params}`)
      const data = await response.json()

      if (response.ok) {
        setStatus(data.status)
        setSessions(data.sessions || [])
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Error fetching seat data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleEndSession(sessionId: string) {
    setEndingSession(sessionId)
    try {
      const response = await fetch('/api/user/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end-session',
          sessionId,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Session ended')
        setStatus(data.status)
        setSessions(prev => prev.filter(s => s.id !== sessionId))
      } else {
        toast.error(data.error || 'Failed to end session')
      }
    } catch (error) {
      toast.error('Failed to end session')
    } finally {
      setEndingSession(null)
    }
  }

  async function handleEndOtherSessions() {
    if (!sessionToken) {
      toast.error('Cannot identify current session')
      return
    }

    try {
      const response = await fetch('/api/user/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end-other-sessions',
          currentSessionToken: sessionToken,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(data.message)
        setStatus(data.status)
        setSessions(prev => prev.filter(s => s.isCurrent))
      } else {
        toast.error(data.error || 'Failed to end sessions')
      }
    } catch (error) {
      toast.error('Failed to end sessions')
    }
  }

  async function handleAcknowledgeAlert(alertId: string) {
    try {
      const response = await fetch('/api/user/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'acknowledge-alert',
          alertId,
          actionTaken: 'ignored',
        }),
      })

      if (response.ok) {
        setAlerts(prev => prev.filter(a => a.id !== alertId))
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    }
  }

  // Don't show if not over limit and no alerts
  if (!loading && !status?.isOverLimit && alerts.length === 0) {
    return null
  }

  if (loading) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">Seat Limit Exceeded</h2>
              <p className="text-sm text-gray-400">
                Using {status?.inUse || 0} of {status?.allowed || 0} seats
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Seat Usage</span>
              <span className="text-sm font-medium text-amber-400">
                {status?.overageCount || 0} over limit
              </span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all"
                style={{ width: `${Math.min(100, ((status?.inUse || 0) / (status?.allowed || 1)) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Plan: {status?.planSeats || 0} seats</span>
              {(status?.additionalSeats || 0) > 0 && (
                <span>+ {status?.additionalSeats} additional</span>
              )}
            </div>
          </div>

          {/* Message - Different based on plan */}
          <p className="text-sm text-gray-300">
            {status?.plan === 'BASIC' ? (
              <>
                Your <strong>Basic</strong> plan includes 1 seat (single device login).
                You&apos;re currently logged in on {status?.inUse || 0} devices.
                Upgrade to get more seats or log out from other devices.
              </>
            ) : status?.plan === 'FREE' ? (
              <>
                Your trial includes 1 seat. You&apos;re logged in on {status?.inUse || 0} devices.
                Please log out from other devices to continue.
              </>
            ) : (
              <>
                Your account is logged in on more devices than your plan allows.
                Please choose one of the following options:
              </>
            )}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {/* View/Manage Sessions */}
            <button
              onClick={() => setShowSessions(!showSessions)}
              className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-left"
            >
              <Monitor className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  Manage Active Sessions
                </div>
                <div className="text-xs text-gray-400">
                  Log out from other devices
                </div>
              </div>
              <Users className="w-4 h-4 text-gray-500" />
            </button>

            {/* Session List */}
            {showSessions && (
              <div className="bg-gray-800/30 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      session.isCurrent ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-700/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {session.deviceName || session.browser || 'Unknown Device'}
                        {session.isCurrent && (
                          <span className="ml-2 text-xs text-green-400">(Current)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {session.location || 'Unknown location'} • {
                          new Date(session.lastActiveAt).toLocaleDateString()
                        }
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEndSession(session.id)}
                        disabled={endingSession === session.id}
                        className="text-red-400 hover:text-red-300"
                      >
                        {endingSession === session.id ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                ))}

                {sessions.filter(s => !s.isCurrent).length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEndOtherSessions}
                    className="w-full mt-2"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out All Other Sessions
                  </Button>
                )}
              </div>
            )}

            {/* Upgrade Plan - Show specific upgrade path based on plan */}
            {status?.plan === 'BASIC' && (
              <button
                onClick={() => router.push('/pricing?highlight=professional')}
                className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-primary-500/20 to-accent-500/20 hover:from-primary-500/30 hover:to-accent-500/30 rounded-lg transition-colors text-left border border-primary-500/30"
              >
                <CreditCard className="w-5 h-5 text-primary-400" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white flex items-center gap-2">
                    Upgrade to Professional
                    <span className="px-2 py-0.5 bg-primary-500/30 rounded text-xs text-primary-300">Recommended</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    2 seats included • $26.99/month
                  </div>
                </div>
              </button>
            )}

            {status?.plan !== 'BASIC' && (
              <button
                onClick={() => router.push('/pricing')}
                className="w-full flex items-center gap-3 p-3 bg-primary-500/20 hover:bg-primary-500/30 rounded-lg transition-colors text-left border border-primary-500/30"
              >
                <CreditCard className="w-5 h-5 text-primary-400" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    Upgrade Your Plan
                  </div>
                  <div className="text-xs text-gray-400">
                    Get more seats with a higher tier
                  </div>
                </div>
              </button>
            )}

            {/* Purchase Additional Seats - Available for all paid plans */}
            {status?.plan !== 'FREE' && (
              <button
                onClick={() => router.push('/settings?tab=seats')}
                className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-left"
              >
                <Users className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    Purchase Additional Seats
                  </div>
                  <div className="text-xs text-gray-400">
                    $5/seat/month • Keep your current plan
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 bg-gray-800/30">
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                alerts.forEach(a => handleAcknowledgeAlert(a.id))
                onClose?.()
              }}
              className="flex-1"
            >
              Remind Me Later
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push('/pricing')}
              className="flex-1"
            >
              View Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to check if seat limit alert should be shown
 */
export function useSeatLimitCheck(sessionToken?: string) {
  const [showAlert, setShowAlert] = useState(false)
  const [status, setStatus] = useState<SeatStatus | null>(null)

  useEffect(() => {
    checkSeatStatus()
  }, [sessionToken])

  async function checkSeatStatus() {
    try {
      const params = sessionToken ? `?sessionToken=${sessionToken}` : ''
      const response = await fetch(`/api/user/seats${params}`)
      const data = await response.json()

      if (response.ok) {
        setStatus(data.status)
        // Show alert if over limit or has unacknowledged alerts
        if (data.status?.isOverLimit || (data.alerts?.length > 0)) {
          setShowAlert(true)
        }
      }
    } catch (error) {
      console.error('Error checking seat status:', error)
    }
  }

  return {
    showAlert,
    setShowAlert,
    status,
    refreshStatus: checkSeatStatus,
  }
}
