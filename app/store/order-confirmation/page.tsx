'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Package, Truck, Mail, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  total: number;
  createdAt: string;
  items: Array<{
    productName: string;
    variantTitle?: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  async function loadOrder() {
    try {
      const response = await fetch(`/api/store/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <button
            onClick={() => router.push('/')}
            className="text-primary-500 hover:text-primary-600"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-xl text-gray-600">Thank you for your purchase</p>
        </motion.div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b">
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-2xl font-bold">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    {item.variantTitle && (
                      <p className="text-sm text-gray-600">{item.variantTitle}</p>
                    )}
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="pt-4 border-t">
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Shipping Address
          </h2>
          <div className="text-gray-600">
            <p className="font-medium text-gray-900">{order.customerName}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        {/* Confirmation Email Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Confirmation Email Sent</h3>
              <p className="text-blue-800">
                We&apos;ve sent a confirmation email to <strong>{order.customerEmail}</strong> with
                your order details and tracking information.
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-lg font-semibold mb-4">What&apos;s Next?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Order Processing</h3>
                <p className="text-sm text-gray-600">
                  We&apos;re preparing your order for shipment. You&apos;ll receive an email when it ships.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Track Your Order</h3>
                <p className="text-sm text-gray-600">
                  Once shipped, you&apos;ll receive tracking information to monitor your delivery.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Order Receipt</h3>
                <p className="text-sm text-gray-600">
                  A detailed receipt has been sent to your email address.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-colors"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
