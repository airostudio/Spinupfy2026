'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Lock, ShoppingCart, Tag, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CartItem {
  productId: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    images: { url: string; altText?: string }[];
  };
}

interface CheckoutData {
  storeId: string;
  items: CartItem[];
}

function CheckoutForm({ cartData }: { cartData: CheckoutData }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [shippingRates, setShippingRates] = useState<any[]>([]);

  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  });
  const [selectedShipping, setSelectedShipping] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [useShippingForBilling, setUseShippingForBilling] = useState(true);

  useEffect(() => {
    loadCartProducts();
    loadShippingRates();
  }, []);

  async function loadCartProducts() {
    try {
      const productIds = cartData.items.map(item => item.productId);
      const response = await fetch(`/api/store/products?ids=${productIds.join(',')}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load cart items');
    }
  }

  async function loadShippingRates() {
    try {
      const response = await fetch(`/api/store/shipping-rates?storeId=${cartData.storeId}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setShippingRates(data.data);
        setSelectedShipping(data.data[0].id);
      }
    } catch (error) {
      console.error('Error loading shipping rates:', error);
    }
  }

  async function applyDiscountCode() {
    try {
      const response = await fetch('/api/store/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: cartData.storeId,
          code: discountCode,
          subtotal: calculateSubtotal()
        })
      });

      const data = await response.json();

      if (data.success) {
        setAppliedDiscount(data.discount);
        toast.success('Discount code applied!');
      } else {
        toast.error(data.error || 'Invalid discount code');
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      toast.error('Failed to apply discount code');
    }
  }

  function calculateSubtotal() {
    return cartData.items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  function calculateShipping() {
    const rate = shippingRates.find(r => r.id === selectedShipping);
    if (!rate) return 0;

    if (rate.rate_type === 'flat') {
      return rate.flat_rate;
    }

    if (rate.rate_type === 'price_based' && rate.min_order_amount) {
      const subtotal = calculateSubtotal();
      return subtotal >= rate.min_order_amount ? 0 : rate.flat_rate;
    }

    return rate.flat_rate || 0;
  }

  function calculateDiscount() {
    if (!appliedDiscount) return 0;

    const subtotal = calculateSubtotal();

    if (appliedDiscount.discount_type === 'percentage') {
      return (subtotal * appliedDiscount.discount_value) / 100;
    }

    return appliedDiscount.discount_value;
  }

  function calculateTotal() {
    return calculateSubtotal() + calculateShipping() - calculateDiscount();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      // Create order on backend
      const orderResponse = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: cartData.storeId,
          items: cartData.items,
          customerEmail: email,
          customerName: name,
          customerPhone: phone,
          shippingAddress,
          billingAddress: useShippingForBilling ? shippingAddress : undefined,
          shippingRateId: selectedShipping,
          discountCode: appliedDiscount?.code,
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        orderData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name,
              email,
              address: {
                line1: shippingAddress.line1,
                line2: shippingAddress.line2,
                city: shippingAddress.city,
                state: shippingAddress.state,
                postal_code: shippingAddress.postalCode,
                country: shippingAddress.country,
              }
            }
          }
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        toast.success('Order placed successfully!');
        router.push(`/store/order-confirmation?orderId=${orderData.orderId}`);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  const subtotal = calculateSubtotal();
  const shipping = calculateShipping();
  const discount = calculateDiscount();
  const total = calculateTotal();

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left Column - Form */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your purchase</p>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Shipping Address
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Address Line 1</label>
                <input
                  type="text"
                  value={shippingAddress.line1}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={shippingAddress.line2}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Apt 4B"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="10001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <select
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Method */}
          {shippingRates.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>

              <div className="space-y-2">
                {shippingRates.map((rate) => (
                  <label
                    key={rate.id}
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={rate.id}
                        checked={selectedShipping === rate.id}
                        onChange={(e) => setSelectedShipping(e.target.value)}
                        className="w-4 h-4 text-primary-500"
                      />
                      <div>
                        <div className="font-medium">{rate.name}</div>
                        {rate.description && (
                          <div className="text-sm text-gray-600">{rate.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="font-semibold">
                      {rate.rate_type === 'price_based' && rate.min_order_amount && subtotal >= rate.min_order_amount
                        ? 'FREE'
                        : `$${(rate.flat_rate || 0).toFixed(2)}`}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Payment
            </h2>

            <div className="border rounded-lg p-4 bg-gray-50">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>

            <p className="text-sm text-gray-600 mt-4 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Your payment information is encrypted and secure
            </p>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            disabled={loading || !stripe}
            className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              `Place Order - $${total.toFixed(2)}`
            )}
          </button>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Order Summary
            </h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {cartData.items.map((item) => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;

                return (
                  <div key={item.productId} className="flex gap-4">
                    {product.product_images[0] && (
                      <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                        <Image
                          src={product.product_images[0].url}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="font-semibold">${(product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Discount Code */}
            <div className="mb-6 pb-6 border-b">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Discount Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  disabled={!!appliedDiscount}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  placeholder="Enter code"
                />
                <button
                  type="button"
                  onClick={applyDiscountCode}
                  disabled={!discountCode || !!appliedDiscount}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  Apply
                </button>
              </div>
              {appliedDiscount && (
                <p className="text-sm text-green-600 mt-2">
                  Discount applied: {appliedDiscount.code}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [cartData, setCartData] = useState<CheckoutData | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        setCartData(parsed);
      } catch (error) {
        console.error('Error parsing cart data:', error);
        toast.error('Invalid cart data');
      }
    }
  }, [searchParams]);

  if (!cartData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm cartData={cartData} />
    </Elements>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
