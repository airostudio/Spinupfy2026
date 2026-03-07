'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getStripe, TAX_RATES, calculateTax } from '@/lib/stripe'
import { Header } from '@/components/layout/Header'
import { Loader2, CheckCircle, AlertCircle, Plus, Minus } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'

const plans = {
  basic: {
    name: 'Basic',
    monthly: 16.99,
    annual: 14.49,
    annualTotal: 173.88,
    websites: 1,
    seats: 1,
  },
  professional: {
    name: 'Professional',
    monthly: 26.99,
    annual: 22.49,
    annualTotal: 269.88,
    websites: 2,
    seats: 2,
  },
  agency: {
    name: 'Agency',
    monthly: 47.49,
    annual: 39.49,
    annualTotal: 473.88,
    websites: 100,
    seats: 5,
  },
}

interface CheckoutFormProps {
  planId: string
  billingCycle: string
}

function CheckoutForm({ planId, billingCycle }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setPaymentStatus('processing')

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setPaymentStatus('error')
        toast.error(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentStatus('success')
        toast.success('Payment successful!')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      }
    } catch (err) {
      setPaymentStatus('error')
      toast.error('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          'Complete Payment'
        )}
      </button>

      {paymentStatus === 'success' && (
        <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-400">Payment successful! Redirecting...</p>
        </div>
      )}

      {paymentStatus === 'error' && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">Payment failed. Please try again.</p>
        </div>
      )}
    </form>
  )
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [planId, setPlanId] = useState(searchParams.get('plan') || 'basic')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(
    (searchParams.get('billing') as 'monthly' | 'annual') || 'monthly'
  )
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [taxCode, setTaxCode] = useState('DEFAULT')
  const [extraWebsites, setExtraWebsites] = useState(0)
  const [extraSeats, setExtraSeats] = useState(0)
  const [totals, setTotals] = useState({
    baseAmount: 0,
    tax: 0,
    total: 0,
    taxName: 'No Tax',
    taxRate: 0,
  })

  const plan = plans[planId as keyof typeof plans]
  const basePrice = plan[billingCycle]

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please log in to continue with payment')
        router.push('/login?redirect=/payment')
        return
      }

      setIsAuthenticated(true)
      setCheckingAuth(false)
    }

    checkAuth()
  }, [])

  // Detect location and set tax code
  useEffect(() => {
    async function detectLocation() {
      try {
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()

        if (data.country_code === 'US') {
          setTaxCode(`US_${data.region_code}`)
        } else if (data.country_code === 'CA') {
          setTaxCode(`CA_${data.region_code}`)
        } else if (data.country_code === 'GB') {
          setTaxCode('GB')
        } else if (data.country_code === 'AU') {
          setTaxCode('AU')
        } else if (data.country_code === 'NZ') {
          setTaxCode('NZ')
        } else if (['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'].includes(data.country_code)) {
          setTaxCode(`EU_${data.country_code}`)
        }
      } catch (error) {
        console.error('Failed to detect location:', error)
      }
    }

    detectLocation()
  }, [])

  // Create payment intent when selections change (only if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      createPaymentIntent()
    }
  }, [planId, billingCycle, taxCode, extraWebsites, extraSeats, isAuthenticated])

  async function createPaymentIntent() {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle,
          taxCode,
          addons: {
            extraWebsites,
            extraSeats,
          },
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        // Authentication error - redirect to login
        toast.error('Your session has expired. Please log in again.')
        router.push('/login?redirect=/payment')
        return
      }

      if (data.success) {
        setClientSecret(data.data.clientSecret)
        setTotals({
          baseAmount: data.data.baseAmount,
          tax: data.data.tax,
          total: data.data.total,
          taxName: data.data.taxName,
          taxRate: data.data.taxRate,
        })
      } else {
        toast.error(data.error || 'Failed to initialize payment')
      }
    } catch (error) {
      console.error('Payment intent creation error:', error)
      toast.error('An error occurred while initializing payment')
    } finally {
      setLoading(false)
    }
  }

  const stripePromise = getStripe()

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-gray-400">Verifying authentication...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />

      <div className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2 text-center">Complete Your Purchase</h1>
          <p className="text-gray-400 text-center mb-12">
            Secure payment powered by Stripe
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                {/* Plan Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-3">Select Plan</label>
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="basic">Basic - {plan.name}</option>
                    <option value="corporate">Corporate</option>
                    <option value="agency">Agency</option>
                  </select>
                </div>

                {/* Billing Cycle */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-3">Billing Cycle</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`py-3 px-4 rounded-lg border transition-colors ${
                        billingCycle === 'monthly'
                          ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('annual')}
                      className={`py-3 px-4 rounded-lg border transition-colors ${
                        billingCycle === 'annual'
                          ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      Annual
                      <span className="ml-2 text-xs text-green-400">Save 10%</span>
                    </button>
                  </div>
                </div>

                {/* Add-ons */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-400">Add-ons</h3>

                  {/* Extra Websites */}
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Extra Websites</p>
                      <p className="text-sm text-gray-400">$7.99/month each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExtraWebsites(Math.max(0, extraWebsites - 1))}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-white font-semibold">{extraWebsites}</span>
                      <button
                        onClick={() => setExtraWebsites(extraWebsites + 1)}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Extra Seats */}
                  {(planId === 'corporate' || planId === 'agency') && (
                    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Extra Seats</p>
                        <p className="text-sm text-gray-400">$5.99/month each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setExtraSeats(Math.max(0, extraSeats - 1))}
                          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-white font-semibold">{extraSeats}</span>
                        <button
                          onClick={() => setExtraSeats(extraSeats + 1)}
                          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-800 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-400">
                    <span>{plan.name} Plan ({billingCycle})</span>
                    <span>${basePrice.toFixed(2)}</span>
                  </div>

                  {extraWebsites > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Extra Websites ({extraWebsites})</span>
                      <span>${(extraWebsites * 7.99).toFixed(2)}</span>
                    </div>
                  )}

                  {extraSeats > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Extra Seats ({extraSeats})</span>
                      <span>${(extraSeats * 5.99).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>${totals.baseAmount.toFixed(2)}</span>
                  </div>

                  {totals.tax > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>{totals.taxName} ({(totals.taxRate * 100).toFixed(2)}%)</span>
                      <span>${totals.tax.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xl font-bold text-white pt-3 border-t border-gray-800">
                    <span>Total</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Tax Location Info */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400">
                  Tax calculated based on your location: <span className="text-white font-medium">{totals.taxName}</span>
                </p>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Payment Details</h2>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'night',
                      variables: {
                        colorPrimary: '#6366f1',
                        colorBackground: '#111827',
                        colorText: '#f9fafb',
                        colorDanger: '#ef4444',
                        fontFamily: 'system-ui, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '8px',
                      },
                    },
                  }}
                >
                  <CheckoutForm planId={planId} billingCycle={billingCycle} />
                </Elements>
              ) : (
                <div className="text-center text-red-400 py-8">
                  Failed to initialize payment. Please refresh the page.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950">
          <Header />
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  )
}
