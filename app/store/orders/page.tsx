'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Search,
  Loader2,
  ShoppingBag,
  XCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase'

interface OrderItem {
  id: string
  product_name: string
  variant_title?: string
  quantity: number
  unit_price: number
  total: number
  product_image?: string
}

interface Order {
  id: string
  order_number: string
  created_at: string
  total: number
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  fulfillment_status: 'unfulfilled' | 'partial' | 'fulfilled' | 'cancelled'
  tracking_number?: string
  tracking_url?: string
  carrier?: string
  items: OrderItem[]
}

const statusConfig = {
  payment: {
    pending: { label: 'Payment Pending', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock },
    paid: { label: 'Paid', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle2 },
    failed: { label: 'Payment Failed', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle },
    refunded: { label: 'Refunded', color: 'text-gray-500', bg: 'bg-gray-500/10', icon: AlertCircle },
  },
  fulfillment: {
    unfulfilled: { label: 'Processing', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Package },
    partial: { label: 'Partially Shipped', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Truck },
    fulfilled: { label: 'Delivered', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle },
  },
}

function CustomerOrdersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const storeSlug = searchParams.get('store')

  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchEmail, setSearchEmail] = useState(email || '')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [storeName, setStoreName] = useState('')

  useEffect(() => {
    if (email && storeSlug) {
      loadOrders()
    } else {
      setLoading(false)
    }
  }, [email, storeSlug])

  async function loadOrders() {
    try {
      setLoading(true)
      setError(null)

      // Get store info
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id, name')
        .eq('slug', storeSlug)
        .single()

      if (storeError || !store) {
        setError('Store not found')
        return
      }

      setStoreName(store.name)

      // Get orders for this email
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          total,
          subtotal,
          tax_amount,
          shipping_amount,
          discount_amount,
          payment_status,
          fulfillment_status,
          tracking_number,
          tracking_url,
          carrier,
          order_items (
            id,
            product_name,
            variant_title,
            quantity,
            unit_price,
            total,
            product_image
          )
        `)
        .eq('store_id', store.id)
        .eq('customer_email', email)
        .order('created_at', { ascending: false })

      if (ordersError) {
        console.error('Error loading orders:', ordersError)
        setError('Failed to load orders')
        return
      }

      setOrders(ordersData?.map(order => ({
        ...order,
        items: order.order_items || [],
      })) || [])
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchEmail && storeSlug) {
      router.push(`/store/orders?email=${encodeURIComponent(searchEmail)}&store=${storeSlug}`)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Show email search form if no email provided
  if (!email || !storeSlug) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-800">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Track Your Orders</h1>
            <p className="text-gray-400">Enter your email to view your order history</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              leftIcon={<Search className="w-5 h-5" />}
            >
              Find My Orders
            </Button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            We'll show all orders associated with this email
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button variant="primary" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Order detail view
  if (selectedOrder) {
    const paymentStatus = statusConfig.payment[selectedOrder.payment_status]
    const fulfillmentStatus = statusConfig.fulfillment[selectedOrder.fulfillment_status]
    const PaymentIcon = paymentStatus.icon
    const FulfillmentIcon = fulfillmentStatus.icon

    return (
      <div className="min-h-screen bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedOrder(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Orders
          </button>

          {/* Order Header */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Order {selectedOrder.order_number}</h1>
                <p className="text-gray-400">Placed on {formatDate(selectedOrder.created_at)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${paymentStatus.bg} ${paymentStatus.color}`}>
                  <PaymentIcon className="w-4 h-4" />
                  {paymentStatus.label}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${fulfillmentStatus.bg} ${fulfillmentStatus.color}`}>
                  <FulfillmentIcon className="w-4 h-4" />
                  {fulfillmentStatus.label}
                </span>
              </div>
            </div>

            {/* Tracking Info */}
            {selectedOrder.tracking_number && (
              <div className="bg-gray-800 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Tracking Information</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{selectedOrder.tracking_number}</p>
                    {selectedOrder.carrier && (
                      <p className="text-gray-400 text-sm">{selectedOrder.carrier}</p>
                    )}
                  </div>
                  {selectedOrder.tracking_url && (
                    <a
                      href={selectedOrder.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                    >
                      Track Package
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <h3 className="text-lg font-semibold text-white mb-4">Items</h3>
            <div className="space-y-4">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-gray-800 rounded-xl">
                  {item.product_image && (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{item.product_name}</h4>
                    {item.variant_title && (
                      <p className="text-gray-400 text-sm">{item.variant_title}</p>
                    )}
                    <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">${item.total.toFixed(2)}</p>
                    <p className="text-gray-500 text-sm">${item.unit_price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-${selectedOrder.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>{selectedOrder.shipping_amount > 0 ? `$${selectedOrder.shipping_amount.toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax</span>
                  <span>${selectedOrder.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-gray-700">
                  <span>Total</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Orders list view
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Orders</h1>
          <p className="text-gray-400">
            {storeName && `Orders from ${storeName} • `}
            {email}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No orders found</h2>
            <p className="text-gray-400 mb-6">We couldn't find any orders for this email address.</p>
            <Button
              variant="outline"
              onClick={() => router.push(`/store/orders?store=${storeSlug}`)}
            >
              Try Different Email
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const paymentStatus = statusConfig.payment[order.payment_status]
              const fulfillmentStatus = statusConfig.fulfillment[order.fulfillment_status]
              const FulfillmentIcon = fulfillmentStatus.icon

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{order.order_number}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${fulfillmentStatus.bg} ${fulfillmentStatus.color}`}>
                          <FulfillmentIcon className="w-3 h-3" />
                          {fulfillmentStatus.label}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        {formatDate(order.created_at)} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item, i) => (
                          <span key={i} className="text-sm text-gray-500">
                            {item.product_name}{i < Math.min(order.items.length, 3) - 1 ? ', ' : ''}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-sm text-gray-500">+{order.items.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    {/* Price and Arrow */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">${order.total.toFixed(2)}</p>
                        <p className={`text-sm ${paymentStatus.color}`}>{paymentStatus.label}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function OrdersPageFallback() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading orders...</p>
      </div>
    </div>
  )
}

export default function CustomerOrdersPage() {
  return (
    <Suspense fallback={<OrdersPageFallback />}>
      <CustomerOrdersContent />
    </Suspense>
  )
}
