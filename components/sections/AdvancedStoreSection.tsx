/**
 * Advanced Store Section Component
 * Award-winning HTML5 online store with WooCommerce-like features
 * Features: Product variants, galleries, wishlist, filtering, search, reviews, and more
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Heart,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Share2,
  Check,
  Truck,
  Shield,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  Package,
  CreditCard,
  Clock,
  Bell,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getShimmerPlaceholder } from '@/lib/image-placeholder';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  inventoryQuantity: number;
  options: Record<string, string>; // e.g., { size: 'L', color: 'Blue' }
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
}

export interface AdvancedStoreProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  images: Array<{
    url: string;
    altText?: string;
  }>;
  inStock: boolean;
  featured?: boolean;
  categories?: string[];
  tags?: string[];
  variants?: ProductVariant[];
  options?: Array<{
    name: string;
    values: string[];
  }>;
  reviews?: ProductReview[];
  averageRating?: number;
  reviewCount?: number;
  sku?: string;
  weight?: string;
  dimensions?: string;
  relatedProducts?: string[];
}

export interface AdvancedStoreSectionContent {
  title?: string;
  subtitle?: string;
  storeId: string;
  displayMode?: 'grid' | 'list' | 'masonry';
  showFeaturedOnly?: boolean;
  productsPerRow?: 2 | 3 | 4;
  enableFilters?: boolean;
  enableSearch?: boolean;
  enableWishlist?: boolean;
  enableQuickView?: boolean;
  enableCompare?: boolean;
  enableReviews?: boolean;
  showBadges?: boolean;
  currency?: string;
  currencySymbol?: string;
}

export interface AdvancedStoreSectionProps {
  content: AdvancedStoreSectionContent;
  editable?: boolean;
  onEdit?: () => void;
}

interface CartItem {
  product: AdvancedStoreProduct;
  variant?: ProductVariant;
  quantity: number;
}

interface FilterState {
  priceMin?: number;
  priceMax?: number;
  categories: string[];
  inStockOnly: boolean;
  onSaleOnly: boolean;
  rating?: number;
}

// ============================================
// COMPONENT
// ============================================

export function AdvancedStoreSection({ content, editable, onEdit }: AdvancedStoreSectionProps) {
  // State
  const [products, setProducts] = useState<AdvancedStoreProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>(content.displayMode === 'list' ? 'list' : 'grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name' | 'rating' | 'newest'>('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    inStockOnly: false,
    onSaleOnly: false,
  });

  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Quick View & Compare
  const [quickViewProduct, setQuickViewProduct] = useState<AdvancedStoreProduct | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  // Product Gallery State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const currencySymbol = content.currencySymbol || '$';

  // ============================================
  // DATA LOADING
  // ============================================

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
        const transformedProducts: AdvancedStoreProduct[] = data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          shortDescription: p.short_description,
          price: p.price,
          compareAtPrice: p.compare_at_price,
          images: p.product_images?.map((img: any) => ({
            url: img.url,
            altText: img.alt_text,
          })) || [],
          inStock: p.track_inventory ? p.inventory_quantity > 0 : true,
          featured: p.featured,
          categories: p.product_category_relations?.map((rel: any) => rel.product_categories?.name) || [],
          tags: p.tags || [],
          variants: p.product_variants?.map((v: any) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            price: v.price,
            compareAtPrice: v.compare_at_price,
            inventoryQuantity: v.inventory_quantity,
            options: v.options || {},
          })) || [],
          options: p.options || [],
          averageRating: p.average_rating || 4.5,
          reviewCount: p.review_count || 0,
          sku: p.sku,
        }));

        setProducts(transformedProducts);

        // Extract unique categories
        const allCategories = transformedProducts.flatMap((p) => p.categories || []);
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

  // ============================================
  // FILTERING & SORTING
  // ============================================

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.categories?.some((c) => c.toLowerCase().includes(query)) ||
          p.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((p) =>
        p.categories?.some((c) => filters.categories.includes(c))
      );
    }

    // Price range filter
    if (filters.priceMin !== undefined) {
      result = result.filter((p) => p.price >= filters.priceMin!);
    }
    if (filters.priceMax !== undefined) {
      result = result.filter((p) => p.price <= filters.priceMax!);
    }

    // In stock filter
    if (filters.inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // On sale filter
    if (filters.onSaleOnly) {
      result = result.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
    }

    // Rating filter
    if (filters.rating) {
      result = result.filter((p) => (p.averageRating || 0) >= filters.rating!);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'newest':
        // Assuming newest products are at the end of the original array
        result.reverse();
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [products, searchQuery, filters, sortBy]);

  // ============================================
  // CART FUNCTIONS
  // ============================================

  const addToCart = useCallback((product: AdvancedStoreProduct, variant?: ProductVariant, qty: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          ((!variant && !item.variant) || (variant && item.variant?.id === variant.id))
      );

      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += qty;
        return newCart;
      }

      return [...prev, { product, variant, quantity: qty }];
    });
    toast.success(`${product.name} added to cart!`);
  }, []);

  const updateCartQuantity = useCallback((productId: string, variantId: string | undefined, newQty: number) => {
    setCart((prev) => {
      if (newQty <= 0) {
        return prev.filter(
          (item) =>
            !(item.product.id === productId && item.variant?.id === variantId)
        );
      }
      return prev.map((item) =>
        item.product.id === productId && item.variant?.id === variantId
          ? { ...item, quantity: newQty }
          : item
      );
    });
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = item.variant?.price || item.product.price;
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // ============================================
  // WISHLIST FUNCTIONS
  // ============================================

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        toast.success('Removed from wishlist');
        return prev.filter((id) => id !== productId);
      }
      toast.success('Added to wishlist');
      return [...prev, productId];
    });
  }, []);

  // ============================================
  // COMPARE FUNCTIONS
  // ============================================

  const toggleCompare = useCallback((productId: string) => {
    setCompareList((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 4) {
        toast.error('Maximum 4 products can be compared');
        return prev;
      }
      return [...prev, productId];
    });
  }, []);

  // ============================================
  // VARIANT SELECTION
  // ============================================

  const handleOptionChange = useCallback((optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  }, []);

  useEffect(() => {
    if (quickViewProduct?.variants && Object.keys(selectedOptions).length > 0) {
      const matchingVariant = quickViewProduct.variants.find((v) =>
        Object.entries(selectedOptions).every(([key, value]) => v.options[key] === value)
      );
      setSelectedVariant(matchingVariant || null);
    }
  }, [selectedOptions, quickViewProduct]);

  // ============================================
  // RENDER HELPERS
  // ============================================

  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[content.productsPerRow || 3];

  const formatPrice = (price: number) => `${currencySymbol}${price.toFixed(2)}`;

  const getDiscountPercentage = (price: number, compareAt: number) => {
    return Math.round(((compareAt - price) / compareAt) * 100);
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
                <div className="w-full aspect-square bg-gray-200 rounded-xl mb-4" />
                <div className="h-5 bg-gray-200 rounded-lg mb-2 w-3/4" />
                <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          {content.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary-600 font-semibold tracking-wide uppercase text-sm mb-2"
            >
              {content.subtitle}
            </motion.p>
          )}
          {content.title && (
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            >
              {content.title}
            </motion.h2>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-white rounded-2xl shadow-sm p-4">
          {/* Search */}
          {content.enableSearch !== false && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Filter Toggle */}
            {content.enableFilters !== false && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  showFilters
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {(filters.categories.length > 0 || filters.inStockOnly || filters.onSaleOnly) && (
                  <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                    {filters.categories.length + (filters.inStockOnly ? 1 : 0) + (filters.onSaleOnly ? 1 : 0)}
                  </span>
                )}
              </button>
            )}

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-gray-100 text-gray-700 pl-4 pr-10 py-2.5 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name A-Z</option>
                <option value="rating">Top Rated</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* View Mode */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setDisplayMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  displayMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  displayMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Categories */}
                  {categories.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Categories</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {categories.map((category) => (
                          <label key={category} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={filters.categories.includes(category)}
                              onChange={() => {
                                setFilters((prev) => ({
                                  ...prev,
                                  categories: prev.categories.includes(category)
                                    ? prev.categories.filter((c) => c !== category)
                                    : [...prev.categories, category],
                                }));
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                              {category}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Range */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceMin || ''}
                        onChange={(e) => setFilters((prev) => ({ ...prev, priceMin: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceMax || ''}
                        onChange={(e) => setFilters((prev) => ({ ...prev, priceMax: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Availability</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.inStockOnly}
                          onChange={() => setFilters((prev) => ({ ...prev, inStockOnly: !prev.inStockOnly }))}
                          className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-gray-600 group-hover:text-gray-900 transition-colors">In Stock Only</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.onSaleOnly}
                          onChange={() => setFilters((prev) => ({ ...prev, onSaleOnly: !prev.onSaleOnly }))}
                          className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-gray-600 group-hover:text-gray-900 transition-colors">On Sale</span>
                      </label>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Minimum Rating</h4>
                    <div className="space-y-2">
                      {[4, 3, 2, 1].map((rating) => (
                        <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="rating"
                            checked={filters.rating === rating}
                            onChange={() => setFilters((prev) => ({ ...prev, rating }))}
                            className="w-4 h-4 border-gray-300 text-primary-500 focus:ring-primary-500"
                          />
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="text-gray-600 text-sm ml-1">& up</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setFilters({ categories: [], inStockOnly: false, onSaleOnly: false })}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredAndSortedProducts.length}</span> products
          </p>
          {content.enableCompare !== false && compareList.length > 0 && (
            <button
              onClick={() => setShowCompare(true)}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <Eye className="w-4 h-4" />
              Compare ({compareList.length})
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div className={`grid ${displayMode === 'grid' ? gridColsClass : 'grid-cols-1'} gap-6`}>
          <AnimatePresence mode="popLayout">
            {filteredAndSortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  displayMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                }`}
              >
                {/* Product Image */}
                <div className={`relative ${displayMode === 'list' ? 'sm:w-64 flex-shrink-0' : ''}`}>
                  <div className={`relative ${displayMode === 'list' ? 'aspect-square sm:aspect-auto sm:h-full' : 'aspect-square'} bg-gray-100 overflow-hidden`}>
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].altText || product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        placeholder="blur"
                        blurDataURL={getShimmerPlaceholder(400, 400)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Package className="w-12 h-12" />
                      </div>
                    )}

                    {/* Badges */}
                    {content.showBadges !== false && (
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            -{getDiscountPercentage(product.price, product.compareAtPrice)}%
                          </span>
                        )}
                        {product.featured && (
                          <span className="bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                        {!product.inStock && (
                          <span className="bg-gray-800 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            Sold Out
                          </span>
                        )}
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {content.enableWishlist !== false && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product.id);
                          }}
                          className={`p-2.5 rounded-full shadow-lg transition-all ${
                            wishlist.includes(product.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white text-gray-600 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
                        </button>
                      )}
                      {content.enableQuickView !== false && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setQuickViewProduct(product);
                            setActiveImageIndex(0);
                            setSelectedOptions({});
                            setSelectedVariant(null);
                            setQuantity(1);
                          }}
                          className="p-2.5 bg-white text-gray-600 hover:text-primary-500 rounded-full shadow-lg transition-all"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      )}
                      {content.enableCompare !== false && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleCompare(product.id);
                          }}
                          className={`p-2.5 rounded-full shadow-lg transition-all ${
                            compareList.includes(product.id)
                              ? 'bg-primary-500 text-white'
                              : 'bg-white text-gray-600 hover:text-primary-500'
                          }`}
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className={`p-5 flex flex-col ${displayMode === 'list' ? 'flex-1' : ''}`}>
                  {/* Categories */}
                  {product.categories && product.categories.length > 0 && (
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      {product.categories[0]}
                    </p>
                  )}

                  <Link href={`/store/product/${product.slug}`}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  {content.enableReviews !== false && product.averageRating !== undefined && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.averageRating || 0)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        ({product.reviewCount || 0})
                      </span>
                    </div>
                  )}

                  {/* Description (List view only) */}
                  {displayMode === 'list' && product.shortDescription && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.shortDescription}
                    </p>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4 mt-auto">
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <ShoppingCart className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredAndSortedProducts.length === 0 && !loading && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({ categories: [], inStockOnly: false, onSaleOnly: false });
              }}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
            { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
            { icon: RefreshCw, title: 'Easy Returns', desc: '30-day guarantee' },
            { icon: Clock, title: '24/7 Support', desc: 'Always here to help' },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                <badge.icon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{badge.title}</p>
                <p className="text-gray-500 text-xs">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-primary-500 hover:bg-primary-600 text-white rounded-full p-4 shadow-2xl z-40 flex items-center gap-3"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="font-bold text-lg">{cartItemCount}</span>
          <span className="hidden sm:inline font-medium">
            {formatPrice(cartTotal)}
          </span>
        </motion.button>
      )}

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowCart(false)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Shopping Cart</h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={`${item.product.id}-${item.variant?.id}`} className="flex gap-4 pb-4 border-b border-gray-100">
                          <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                            {item.product.images[0] && (
                              <Image
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                width={80}
                                height={80}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 line-clamp-1">{item.product.name}</h4>
                            {item.variant && (
                              <p className="text-sm text-gray-500">
                                {Object.values(item.variant.options).join(' / ')}
                              </p>
                            )}
                            <p className="text-primary-600 font-semibold mt-1">
                              {formatPrice(item.variant?.price || item.product.price)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.variant?.id, item.quantity - 1)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Minus className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="w-8 text-center font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.variant?.id, item.quantity + 1)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Plus className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.variant?.id, 0)}
                            className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors self-start"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="text-green-600">Free</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-100">
                        <span>Total</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <button className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Proceed to Checkout
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setQuickViewProduct(null)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <div className="grid md:grid-cols-2 gap-0">
                {/* Product Gallery */}
                <div className="relative bg-gray-100 aspect-square md:aspect-auto">
                  {quickViewProduct.images.length > 0 ? (
                    <>
                      <Image
                        src={quickViewProduct.images[activeImageIndex]?.url || quickViewProduct.images[0].url}
                        alt={quickViewProduct.name}
                        fill
                        className="object-cover"
                      />
                      {/* Gallery Navigation */}
                      {quickViewProduct.images.length > 1 && (
                        <>
                          <button
                            onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : quickViewProduct.images.length - 1))}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setActiveImageIndex((prev) => (prev < quickViewProduct.images.length - 1 ? prev + 1 : 0))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          {/* Thumbnails */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {quickViewProduct.images.slice(0, 5).map((img, i) => (
                              <button
                                key={i}
                                onClick={() => setActiveImageIndex(i)}
                                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                                  activeImageIndex === i ? 'border-primary-500' : 'border-white/50'
                                }`}
                              >
                                <Image
                                  src={img.url}
                                  alt=""
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-6 md:p-8 overflow-y-auto max-h-[90vh] md:max-h-none">
                  <div className="mb-4">
                    {quickViewProduct.categories?.[0] && (
                      <p className="text-sm text-primary-600 font-medium mb-1">{quickViewProduct.categories[0]}</p>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{quickViewProduct.name}</h2>
                    {quickViewProduct.sku && (
                      <p className="text-sm text-gray-500">SKU: {quickViewProduct.sku}</p>
                    )}
                  </div>

                  {/* Rating */}
                  {quickViewProduct.averageRating !== undefined && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(quickViewProduct.averageRating || 0)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600">({quickViewProduct.reviewCount} reviews)</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(selectedVariant?.price || quickViewProduct.price)}
                    </span>
                    {(selectedVariant?.compareAtPrice || quickViewProduct.compareAtPrice) && (
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(selectedVariant?.compareAtPrice || quickViewProduct.compareAtPrice!)}
                      </span>
                    )}
                    {quickViewProduct.compareAtPrice && quickViewProduct.compareAtPrice > quickViewProduct.price && (
                      <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                        Save {getDiscountPercentage(quickViewProduct.price, quickViewProduct.compareAtPrice)}%
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {quickViewProduct.description}
                  </p>

                  {/* Options/Variants */}
                  {quickViewProduct.options && quickViewProduct.options.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {quickViewProduct.options.map((option) => (
                        <div key={option.name}>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            {option.name}
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {option.values.map((value) => (
                              <button
                                key={value}
                                onClick={() => handleOptionChange(option.name, value)}
                                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                                  selectedOptions[option.name] === value
                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                }`}
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-12 text-center text-xl font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-2 mb-6">
                    {quickViewProduct.inStock ? (
                      <>
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-green-600 font-medium">In Stock</span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-red-500" />
                        <span className="text-red-600 font-medium">Out of Stock</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        addToCart(quickViewProduct, selectedVariant || undefined, quantity);
                        setQuickViewProduct(null);
                      }}
                      disabled={!quickViewProduct.inStock}
                      className="flex-1 py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-200 disabled:text-gray-500 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(quickViewProduct.id)}
                      className={`p-4 rounded-xl border-2 transition-colors ${
                        wishlist.includes(quickViewProduct.id)
                          ? 'bg-red-50 border-red-200 text-red-500'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${wishlist.includes(quickViewProduct.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-4 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-primary-500" />
                      Free Shipping
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary-500" />
                      Secure Payment
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-primary-500" />
                      30-Day Returns
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notify Me Modal (for out of stock) */}
      {/* This would be a simple email capture modal - can be added as needed */}
    </section>
  );
}

export default AdvancedStoreSection;
