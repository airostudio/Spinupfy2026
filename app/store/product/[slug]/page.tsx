'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Minus, Plus, Check, Star, Truck, Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: Array<{ url: string; altText?: string }>;
  inStock: boolean;
  inventoryQuantity: number;
  variants?: Array<{
    id: string;
    title: string;
    price: number;
    options: any;
    inventoryQuantity: number;
  }>;
  storeId: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  async function loadProduct() {
    try {
      const response = await fetch(`/api/store/products/by-slug/${slug}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
        if (data.data.variants && data.data.variants.length > 0) {
          setSelectedVariant(data.data.variants[0].id);
        }
      } else {
        toast.error('Product not found');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  }

  function addToCart() {
    if (!product) return;

    const cartData = localStorage.getItem('cart');
    const cart = cartData ? JSON.parse(cartData) : { storeId: product.storeId, items: [] };

    const existingItem = cart.items.find((item: any) =>
      item.productId === product.id &&
      (!selectedVariant || item.variantId === selectedVariant)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId: product.id,
        variantId: selectedVariant,
        quantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Added to cart!');
  }

  function buyNow() {
    if (!product) return;

    const cartData = {
      storeId: product.storeId,
      items: [{
        productId: product.id,
        variantId: selectedVariant,
        quantity,
      }],
    };

    const encodedData = encodeURIComponent(JSON.stringify(cartData));
    router.push(`/store/checkout?data=${encodedData}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <button
            onClick={() => router.back()}
            className="text-primary-500 hover:text-primary-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentVariant = product.variants?.find(v => v.id === selectedVariant);
  const currentPrice = currentVariant?.price || product.price;
  const currentStock = currentVariant?.inventoryQuantity ?? product.inventoryQuantity;
  const isInStock = currentStock > 0;
  const discount = product.compareAtPrice && product.compareAtPrice > currentPrice
    ? Math.round(((product.compareAtPrice - currentPrice) / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Store
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square bg-white rounded-xl overflow-hidden shadow-lg"
            >
              {product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].altText || product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Image
                </div>
              )}

              {/* Sale Badge */}
              {discount && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                  {discount}% OFF
                </div>
              )}
            </motion.div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary-500 scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || `${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${currentPrice.toFixed(2)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                  <span className="text-2xl text-gray-400 line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {isInStock ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">In Stock ({currentStock} available)</span>
                  </div>
                ) : (
                  <div className="text-red-600 font-medium">Out of Stock</div>
                )}
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-3">Select Option</label>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      disabled={variant.inventoryQuantity === 0}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedVariant === variant.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${variant.inventoryQuantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="font-medium">{variant.title}</div>
                      <div className="text-sm text-gray-600">${variant.price.toFixed(2)}</div>
                      {variant.inventoryQuantity === 0 && (
                        <div className="text-xs text-red-600 mt-1">Out of Stock</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-gray-300"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Add to Cart Buttons */}
            <div className="space-y-3">
              <button
                onClick={addToCart}
                disabled={!isInStock}
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

              <button
                onClick={buyNow}
                disabled={!isInStock}
                className="w-full py-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-lg font-semibold text-lg transition-colors"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-primary-500" />
                <div>
                  <div className="font-medium text-sm">Free Shipping</div>
                  <div className="text-xs text-gray-600">On orders over $50</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary-500" />
                <div>
                  <div className="font-medium text-sm">Secure Checkout</div>
                  <div className="text-xs text-gray-600">Protected payments</div>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-6 border-t">
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <div className="prose prose-sm max-w-none text-gray-600">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
