/**
 * Store Settings Editor
 * Comprehensive settings panel for configuring the online store section
 * Features WooCommerce-like options and customization
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Store,
  Settings,
  Palette,
  Grid,
  List,
  Search,
  Filter,
  Heart,
  Eye,
  Star,
  Tag,
  Truck,
  Shield,
  CreditCard,
  Package,
  DollarSign,
  Percent,
  Globe,
  ShoppingCart,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { ProductEditor } from './ProductEditor';
import { AnimatePresence } from 'framer-motion';

interface StoreSettingsEditorProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
  websiteId?: string;
}

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
}

export function StoreSettingsEditor({ formData, onUpdate, websiteId }: StoreSettingsEditorProps) {
  const [sections, setSections] = useState<SettingsSection[]>([
    { id: 'general', title: 'General Settings', icon: Settings, isOpen: true },
    { id: 'display', title: 'Display Options', icon: Grid, isOpen: false },
    { id: 'features', title: 'Store Features', icon: Package, isOpen: false },
    { id: 'currency', title: 'Currency & Pricing', icon: DollarSign, isOpen: false },
    { id: 'shipping', title: 'Shipping & Trust', icon: Truck, isOpen: false },
  ]);

  // Product Editor state
  const [showProductEditor, setShowProductEditor] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isOpen: !s.isOpen } : s))
    );
  };

  const handleChange = (field: string, value: any) => {
    onUpdate(field, value);
  };

  // Currency options
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  ];

  return (
    <div className="space-y-3">
      {/* Store Header */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-lg border border-primary-500/30">
        <div className="w-10 h-10 bg-primary-500/30 rounded-lg flex items-center justify-center">
          <Store className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Online Store</h3>
          <p className="text-xs text-gray-400">Configure your store settings</p>
        </div>
      </div>

      {/* Settings Sections */}
      {sections.map((section) => (
        <div key={section.id} className="border border-gray-800 rounded-lg overflow-hidden">
          {/* Section Header */}
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between p-3 bg-gray-900/50 hover:bg-gray-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <section.icon className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium">{section.title}</span>
            </div>
            {section.isOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {/* Section Content */}
          {section.isOpen && (
            <div className="p-3 space-y-4 bg-gray-950/50">
              {/* General Settings */}
              {section.id === 'general' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Store Title
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
                      placeholder="Our Products"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Store Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle || ''}
                      onChange={(e) => handleChange('subtitle', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
                      placeholder="Discover our collection"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Store ID
                    </label>
                    <input
                      type="text"
                      value={formData.storeId || ''}
                      onChange={(e) => handleChange('storeId', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm font-mono"
                      placeholder="store-123"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Connect to an existing store or create a new one
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary-400" />
                      <span className="text-sm">Show Featured Only</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showFeaturedOnly || false}
                        onChange={(e) => handleChange('showFeaturedOnly', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </>
              )}

              {/* Display Options */}
              {section.id === 'display' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      Display Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'grid', label: 'Grid', icon: Grid },
                        { value: 'list', label: 'List', icon: List },
                        { value: 'masonry', label: 'Masonry', icon: Grid },
                      ].map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => handleChange('displayMode', mode.value)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                            formData.displayMode === mode.value
                              ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                              : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <mode.icon className="w-4 h-4" />
                          <span className="text-xs">{mode.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      Products Per Row
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[2, 3, 4].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleChange('productsPerRow', num)}
                          className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                            (formData.productsPerRow || 3) === num
                              ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                              : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          {num} Columns
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-primary-400" />
                      <span className="text-sm">Show Badges</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showBadges !== false}
                        onChange={(e) => handleChange('showBadges', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </>
              )}

              {/* Store Features */}
              {section.id === 'features' && (
                <>
                  {[
                    { key: 'enableSearch', label: 'Product Search', icon: Search },
                    { key: 'enableFilters', label: 'Category Filters', icon: Filter },
                    { key: 'enableWishlist', label: 'Wishlist', icon: Heart },
                    { key: 'enableQuickView', label: 'Quick View', icon: Eye },
                    { key: 'enableCompare', label: 'Product Compare', icon: Package },
                    { key: 'enableReviews', label: 'Reviews & Ratings', icon: Star },
                  ].map((feature) => (
                    <div
                      key={feature.key}
                      className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <feature.icon className="w-4 h-4 text-primary-400" />
                        <span className="text-sm">{feature.label}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData[feature.key] !== false}
                          onChange={(e) => handleChange(feature.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  ))}

                  <div className="mt-4 p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-primary-400">Pro Features</p>
                        <p className="text-xs text-gray-400 mt-1">
                          These features provide a WooCommerce-like shopping experience with
                          advanced filtering, wishlists, and product comparisons.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Currency & Pricing */}
              {section.id === 'currency' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Currency
                    </label>
                    <select
                      value={formData.currency || 'USD'}
                      onChange={(e) => {
                        const currency = currencies.find((c) => c.code === e.target.value);
                        handleChange('currency', e.target.value);
                        if (currency) {
                          handleChange('currencySymbol', currency.symbol);
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
                    >
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} - {currency.name} ({currency.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Price Display Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'symbol', label: '$99.99' },
                        { value: 'code', label: 'USD 99.99' },
                      ].map((format) => (
                        <button
                          key={format.value}
                          onClick={() => handleChange('priceFormat', format.value)}
                          className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                            (formData.priceFormat || 'symbol') === format.value
                              ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                              : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          {format.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-primary-400" />
                      <span className="text-sm">Show Sale Badges</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showSaleBadges !== false}
                        onChange={(e) => handleChange('showSaleBadges', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </>
              )}

              {/* Shipping & Trust */}
              {section.id === 'shipping' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Trust Badges (shown below products)
                    </label>
                    {[
                      { key: 'showFreeShipping', label: 'Free Shipping Badge', icon: Truck },
                      { key: 'showSecurePayment', label: 'Secure Payment Badge', icon: Shield },
                      { key: 'showEasyReturns', label: 'Easy Returns Badge', icon: Package },
                      { key: 'show247Support', label: '24/7 Support Badge', icon: CreditCard },
                    ].map((badge) => (
                      <div
                        key={badge.key}
                        className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <badge.icon className="w-4 h-4 text-primary-400" />
                          <span className="text-sm">{badge.label}</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData[badge.key] !== false}
                            onChange={(e) => handleChange(badge.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Free Shipping Threshold
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{formData.currencySymbol || '$'}</span>
                      <input
                        type="number"
                        value={formData.freeShippingThreshold || 50}
                        onChange={(e) => handleChange('freeShippingThreshold', parseFloat(e.target.value))}
                        className="flex-1 px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
                        placeholder="50"
                        min="0"
                        step="1"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Free shipping for orders above this amount
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          onClick={() => {
            setEditingProductId(undefined);
            setShowProductEditor(!showProductEditor);
          }}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            showProductEditor
              ? 'bg-primary-500 text-white'
              : 'bg-primary-500/20 hover:bg-primary-500/30 text-primary-400'
          }`}
        >
          <Plus className="w-4 h-4" />
          {showProductEditor ? 'Hide Editor' : 'Add Product'}
        </button>
        <button className="flex items-center justify-center gap-2 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors">
          <ShoppingCart className="w-4 h-4" />
          Manage Store
        </button>
      </div>

      {/* Product Editor - Expands downwards */}
      <AnimatePresence>
        {showProductEditor && formData.storeId && (
          <ProductEditor
            storeId={formData.storeId}
            productId={editingProductId}
            onSave={(product) => {
              console.log('Product saved:', product);
              setShowProductEditor(false);
              // Optionally refresh product list here
            }}
            onClose={() => setShowProductEditor(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default StoreSettingsEditor;
