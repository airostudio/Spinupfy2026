/**
 * Store Section Component
 * Displays products in a beautiful grid layout with cart functionality
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, X, Check, Grid, List as ListIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { StructuredData } from '@/components/StructuredData';
import { generateProductSchema } from '@/lib/structured-data';
import { getShimmerPlaceholder } from '@/lib/image-placeholder';

export interface StoreProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: Array<{
    url: string;
    altText?: string;
  }>;
  inStock: boolean;
  featured?: boolean;
  categories?: string[];
}

export interface StoreSectionContent {
  title?: string;
  subtitle?: string;
  storeId: string;
  displayMode?: 'grid' | 'list';
  showFeaturedOnly?: boolean;
  productsPerRow?: number;
}

export interface StoreSectionProps {
  content: StoreSectionContent;
  editable?: boolean;
  onEdit?: () => void;
}

interface CartItem {
  product: StoreProduct;
  quantity: number;
}

export function StoreSection({ content, editable, onEdit }: StoreSectionProps) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [content.storeId, content.showFeaturedOnly]);

  async function loadProducts() {
    try {
      const params = new URLSearchParams({
        storeId: content.storeId,
        status: 'active',
      });

      if (content.showFeaturedOnly) {
        params.append('featured', 'true');
      }

      const response = await fetch(`/api/store/products?${params}`);
      const data = await response.json();

      if (data.success) {
        // Transform to StoreProduct format
        const transformedProducts = data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compare_at_price,
          images: p.product_images?.map((img: any) => ({
            url: img.url,
            altText: img.alt_text,
          })) || [],
          inStock: p.track_inventory ? p.inventory_quantity > 0 : true,
          featured: p.featured,
          categories: p.product_category_relations?.map((rel: any) => rel.product_categories?.name) || [],
        }));

        setProducts(transformedProducts);

        // Extract unique categories
        const allCategories = transformedProducts.flatMap((p: StoreProduct) => p.categories || []);
        const uniqueCategories = Array.from(new Set(allCategories)).filter((c): c is string => typeof c === 'string');
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  function addToCart(product: StoreProduct) {
    const existingItem = cart.find(item => item.product.id === product.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }

    toast.success('Added to cart!');
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity === 0) {
      setCart(cart.filter(item => item.product.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  }

  function getCartTotal() {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  function handleCheckout() {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Navigate to checkout page with cart data
    const cartData = encodeURIComponent(JSON.stringify({
      storeId: content.storeId,
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    }));

    window.location.href = `/store/checkout?data=${cartData}`;
  }

  const gridCols = content.productsPerRow || 3;
  const gridClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[gridCols] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter(p => p.categories?.includes(selectedCategory))
    : products;

  if (loading) {
    return (
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="w-full h-64 bg-gray-200 rounded-lg mb-4" />
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {(content.title || content.subtitle) && (
          <div className="text-center mb-12">
            {content.subtitle && (
              <p className="text-primary-500 font-semibold mb-2">{content.subtitle}</p>
            )}
            {content.title && (
              <h2 className="text-4xl font-bold text-gray-900">{content.title}</h2>
            )}
          </div>
        )}

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        <div className={`grid ${gridClass} gap-8`}>
          {filteredProducts.map((product, index) => {
            // Generate Product schema for SEO
            const productSchema = generateProductSchema({
              name: product.name,
              description: product.description,
              image: product.images.map(img => img.url),
              sku: product.id,
              offers: {
                price: product.price,
                priceCurrency: 'USD',
                availability: product.inStock ? 'InStock' : 'OutOfStock',
                url: typeof window !== 'undefined' ? `${window.location.origin}/store/product/${product.slug}` : undefined,
              },
            });

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Product Schema for SEO */}
                <StructuredData data={productSchema} />
              {/* Product Image */}
              <Link href={`/store/product/${product.slug}`}>
                <div className="relative h-64 bg-gray-100 cursor-pointer group">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].altText || product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      placeholder="blur"
                      blurDataURL={getShimmerPlaceholder(400, 256)}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No image
                    </div>
                  )}

                  {/* Sale Badge */}
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Sale
                    </div>
                  )}

                  {/* Out of Stock Overlay */}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">Out of Stock</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-6">
                <Link href={`/store/product/${product.slug}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary-600 cursor-pointer transition-colors">
                    {product.name}
                  </h3>
                </Link>
                {product.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-lg text-gray-400 line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(product)}
                  disabled={!product.inStock}
                  className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </motion.div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {selectedCategory ? `No products found in "${selectedCategory}" category.` : 'No products available at the moment.'}
            </p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowCart(true)}
          className="fixed bottom-8 right-8 bg-primary-500 hover:bg-primary-600 text-white rounded-full p-4 shadow-lg flex items-center gap-2 z-40"
          aria-label={`View shopping cart with ${cart.length} item${cart.length !== 1 ? 's' : ''}`}
        >
          <ShoppingCart className="w-6 h-6" aria-hidden="true" />
          <span className="font-bold" aria-hidden="true">{cart.length}</span>
        </motion.button>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setShowCart(false)}>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            onClick={e => e.stopPropagation()}
            className="bg-white w-full max-w-md h-full overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Shopping Cart</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Close shopping cart"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.product.id} className="flex gap-4 border-b pb-4">
                    <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                      {item.product.images[0] && (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="object-cover rounded"
                          placeholder="blur"
                          blurDataURL={getShimmerPlaceholder(80, 80)}
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{item.product.name}</h4>
                      <p className="text-gray-600 mb-2">${item.product.price.toFixed(2)}</p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                          aria-label={`Decrease quantity of ${item.product.name}`}
                        >
                          <Minus className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <span className="w-8 text-center font-semibold" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                          aria-label={`Increase quantity of ${item.product.name}`}
                        >
                          <Plus className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold mb-6">
                  <span>Total:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
