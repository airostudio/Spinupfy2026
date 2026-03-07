'use client'

import { useState } from 'react'
import { X, Plus, Globe2 } from 'lucide-react'
import { Button } from '@/components/ui'
import type { ProductFormData, ProductCategory } from './ProductEditor'

// ============================================
// TYPES
// ============================================

interface SectionProps {
  formData: ProductFormData
  updateField: <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) => void
}

// ============================================
// CATEGORIES & TAGS SECTION
// ============================================

interface CategoriesSectionProps extends SectionProps {
  categories: ProductCategory[]
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
}

export function CategoriesSection({
  formData,
  updateField,
  categories,
  addTag,
  removeTag,
}: CategoriesSectionProps) {
  const [newTag, setNewTag] = useState('')

  function handleAddTag() {
    if (newTag.trim()) {
      addTag(newTag.trim())
      setNewTag('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Product Categories
        </label>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.category_ids?.includes(category.id)}
                onChange={e => {
                  const checked = e.target.checked
                  const currentIds = formData.category_ids || []
                  updateField(
                    'category_ids',
                    checked
                      ? [...currentIds, category.id]
                      : currentIds.filter(id => id !== category.id)
                  )
                }}
                className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-300">{category.name}</span>
            </label>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-gray-500">
              No categories available. Create categories in your store settings.
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Product Tags
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1 px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
            placeholder="Add a tag..."
          />
          <Button variant="outline" size="sm" onClick={handleAddTag}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags?.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-primary-100"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// SEO SECTION
// ============================================

interface SEOSectionProps extends SectionProps {
  addKeyword: (keyword: string) => void
  removeKeyword: (keyword: string) => void
}

export function SEOSection({
  formData,
  updateField,
  addKeyword,
  removeKeyword,
}: SEOSectionProps) {
  const [newKeyword, setNewKeyword] = useState('')

  function handleAddKeyword() {
    if (newKeyword.trim()) {
      addKeyword(newKeyword.trim())
      setNewKeyword('')
    }
  }

  // Calculate SEO score (simple heuristic)
  const getSEOScore = () => {
    let score = 0
    if (formData.meta_title && formData.meta_title.length >= 30 && formData.meta_title.length <= 60) score += 25
    if (formData.meta_description && formData.meta_description.length >= 120 && formData.meta_description.length <= 160) score += 25
    if (formData.focus_keyword) score += 15
    if (formData.meta_keywords && formData.meta_keywords.length >= 3) score += 15
    if (formData.slug && formData.slug.length > 0) score += 10
    if (formData.canonical_url) score += 10
    return score
  }

  const seoScore = getSEOScore()

  return (
    <div className="space-y-4">
      {/* SEO Score */}
      <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">SEO Score</span>
          <span className={`text-2xl font-bold ${
            seoScore >= 80 ? 'text-green-400' :
            seoScore >= 50 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {seoScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-900 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              seoScore >= 80 ? 'bg-green-500' :
              seoScore >= 50 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${seoScore}%` }}
          />
        </div>
      </div>

      {/* Meta Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          SEO Title (Meta Title)
        </label>
        <input
          type="text"
          value={formData.meta_title || ''}
          onChange={e => updateField('meta_title', e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
          placeholder="Enter SEO title..."
          maxLength={60}
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">Optimal: 30-60 characters</p>
          <p className={`text-xs ${
            (formData.meta_title?.length || 0) >= 30 && (formData.meta_title?.length || 0) <= 60
              ? 'text-green-400'
              : 'text-gray-500'
          }`}>
            {formData.meta_title?.length || 0}/60
          </p>
        </div>
      </div>

      {/* Meta Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Meta Description
        </label>
        <textarea
          value={formData.meta_description || ''}
          onChange={e => updateField('meta_description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
          placeholder="Enter meta description..."
          maxLength={160}
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">Optimal: 120-160 characters</p>
          <p className={`text-xs ${
            (formData.meta_description?.length || 0) >= 120 && (formData.meta_description?.length || 0) <= 160
              ? 'text-green-400'
              : 'text-gray-500'
          }`}>
            {formData.meta_description?.length || 0}/160
          </p>
        </div>
      </div>

      {/* Focus Keyword */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Focus Keyword
        </label>
        <input
          type="text"
          value={formData.focus_keyword || ''}
          onChange={e => updateField('focus_keyword', e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
          placeholder="Main keyword to rank for..."
        />
      </div>

      {/* Meta Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Meta Keywords
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newKeyword}
            onChange={e => setNewKeyword(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
            className="flex-1 px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
            placeholder="Add a keyword..."
          />
          <Button variant="outline" size="sm" onClick={handleAddKeyword}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.meta_keywords?.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
            >
              {keyword}
              <button
                onClick={() => removeKeyword(keyword)}
                className="hover:text-blue-100"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Recommended: 3-10 keywords relevant to this product
        </p>
      </div>

      {/* Canonical URL */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Canonical URL
        </label>
        <input
          type="url"
          value={formData.canonical_url || ''}
          onChange={e => updateField('canonical_url', e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
          placeholder="https://yourdomain.com/products/..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Prevent duplicate content issues by specifying the canonical URL
        </p>
      </div>
    </div>
  )
}

// ============================================
// GEOGRAPHIC TARGETING SECTION
// ============================================

export function GeoTargetingSection({ formData, updateField }: SectionProps) {
  const [newCountry, setNewCountry] = useState('')
  const [newRegion, setNewRegion] = useState('')
  const [newCity, setNewCity] = useState('')

  function addCountry() {
    if (newCountry.trim()) {
      updateField('target_countries', [...(formData.target_countries || []), newCountry.trim()])
      setNewCountry('')
    }
  }

  function removeCountry(country: string) {
    updateField('target_countries', formData.target_countries?.filter(c => c !== country) || [])
  }

  function addRegion() {
    if (newRegion.trim()) {
      updateField('target_regions', [...(formData.target_regions || []), newRegion.trim()])
      setNewRegion('')
    }
  }

  function removeRegion(region: string) {
    updateField('target_regions', formData.target_regions?.filter(r => r !== region) || [])
  }

  function addCity() {
    if (newCity.trim()) {
      updateField('target_cities', [...(formData.target_cities || []), newCity.trim()])
      setNewCity('')
    }
  }

  function removeCity(city: string) {
    updateField('target_cities', formData.target_cities?.filter(c => c !== city) || [])
  }

  return (
    <div className="space-y-4">
      {/* Enable Geo-Targeting */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.geo_targeting_enabled}
            onChange={e => updateField('geo_targeting_enabled', e.target.checked)}
            className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-300">
            Enable geographic targeting for this product
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-7">
          Limit product visibility to specific countries, regions, or cities
        </p>
      </div>

      {formData.geo_targeting_enabled && (
        <>
          {/* Target Countries */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Countries
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCountry}
                onChange={e => setNewCountry(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCountry())}
                className="flex-1 px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
                placeholder="e.g., United States, Canada, UK..."
              />
              <Button variant="outline" size="sm" onClick={addCountry}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.target_countries?.map((country, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                >
                  🌍 {country}
                  <button onClick={() => removeCountry(country)} className="hover:text-purple-100">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Target Regions/States */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Regions/States
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newRegion}
                onChange={e => setNewRegion(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addRegion())}
                className="flex-1 px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
                placeholder="e.g., California, Texas, Ontario..."
              />
              <Button variant="outline" size="sm" onClick={addRegion}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.target_regions?.map((region, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                >
                  📍 {region}
                  <button onClick={() => removeRegion(region)} className="hover:text-purple-100">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Target Cities */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Cities
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCity}
                onChange={e => setNewCity(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCity())}
                className="flex-1 px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
                placeholder="e.g., New York, Los Angeles, Toronto..."
              />
              <Button variant="outline" size="sm" onClick={addCity}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.target_cities?.map((city, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                >
                  🏙️ {city}
                  <button onClick={() => removeCity(city)} className="hover:text-purple-100">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================
// SOCIAL MEDIA SECTION (Open Graph & Twitter)
// ============================================

export function SocialMediaSection({ formData, updateField }: SectionProps) {
  return (
    <div className="space-y-6">
      {/* Open Graph */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-200">Open Graph (Facebook, LinkedIn)</h4>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            OG Title
          </label>
          <input
            type="text"
            value={formData.og_title || ''}
            onChange={e => updateField('og_title', e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
            placeholder={formData.name || 'Product title for social sharing...'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            OG Description
          </label>
          <textarea
            value={formData.og_description || ''}
            onChange={e => updateField('og_description', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
            placeholder={formData.description || 'Product description for social sharing...'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            OG Image URL
          </label>
          <input
            type="url"
            value={formData.og_image || ''}
            onChange={e => updateField('og_image', e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
            placeholder="https://yourdomain.com/images/product.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Recommended: 1200×630px
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            OG Type
          </label>
          <select
            value={formData.og_type || 'product'}
            onChange={e => updateField('og_type', e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
          >
            <option value="product">Product</option>
            <option value="website">Website</option>
            <option value="article">Article</option>
          </select>
        </div>
      </div>

      {/* Twitter Card */}
      <div className="space-y-4 pt-4 border-t border-gray-700">
        <h4 className="text-sm font-semibold text-gray-200">Twitter Card</h4>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Card Type
          </label>
          <select
            value={formData.twitter_card_type || 'summary_large_image'}
            onChange={e => updateField('twitter_card_type', e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
          >
            <option value="summary">Summary</option>
            <option value="summary_large_image">Summary Large Image</option>
            <option value="app">App</option>
            <option value="player">Player</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Twitter Title
          </label>
          <input
            type="text"
            value={formData.twitter_title || ''}
            onChange={e => updateField('twitter_title', e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
            placeholder={formData.name || 'Product title for Twitter...'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Twitter Description
          </label>
          <textarea
            value={formData.twitter_description || ''}
            onChange={e => updateField('twitter_description', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
            placeholder={formData.description || 'Product description for Twitter...'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Twitter Image URL
          </label>
          <input
            type="url"
            value={formData.twitter_image || ''}
            onChange={e => updateField('twitter_image', e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
            placeholder="https://yourdomain.com/images/product.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Recommended: 800×418px or 1200×628px
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// STRUCTURED DATA SECTION (Schema.org)
// ============================================

export function StructuredDataSection({ formData, updateField }: SectionProps) {
  return (
    <div className="space-y-4">
      {/* Enable Schema */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.schema_enabled}
            onChange={e => updateField('schema_enabled', e.target.checked)}
            className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-300">
            Enable Schema.org structured data
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-7">
          Helps search engines understand your product data for rich snippets
        </p>
      </div>

      {formData.schema_enabled && (
        <>
          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Brand
            </label>
            <input
              type="text"
              value={formData.brand || ''}
              onChange={e => updateField('brand', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
              placeholder="Enter brand name..."
            />
          </div>

          {/* GTIN (Global Trade Item Number) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              GTIN (UPC/EAN/ISBN)
            </label>
            <input
              type="text"
              value={formData.gtin || ''}
              onChange={e => updateField('gtin', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white font-mono"
              placeholder="Global Trade Item Number..."
            />
            <p className="text-xs text-gray-500 mt-1">
              UPC, EAN, ISBN, or other standard product identifier
            </p>
          </div>

          {/* MPN (Manufacturer Part Number) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              MPN (Manufacturer Part Number)
            </label>
            <input
              type="text"
              value={formData.mpn || ''}
              onChange={e => updateField('mpn', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white font-mono"
              placeholder="Manufacturer Part Number..."
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Product Condition
            </label>
            <select
              value={formData.condition || 'new'}
              onChange={e => updateField('condition', e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
            >
              <option value="new">New</option>
              <option value="refurbished">Refurbished</option>
              <option value="used">Used</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Availability Status
            </label>
            <select
              value={formData.availability || 'in_stock'}
              onChange={e => updateField('availability', e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
            >
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="preorder">Pre-order</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </>
      )}
    </div>
  )
}
