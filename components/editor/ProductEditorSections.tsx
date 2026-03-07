'use client'

import { useState } from 'react'
import {
  Upload,
  Trash2,
  Plus,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui'
import Image from 'next/image'
import toast from 'react-hot-toast'
import type { ProductFormData, ProductImage, ProductCategory } from './ProductEditor'

// ============================================
// BASIC INFORMATION SECTION
// ============================================

interface SectionProps<T = ProductFormData> {
  formData: T
  updateField: <K extends keyof T>(field: K, value: T[K]) => void
}

export function BasicInformationSection({ formData, updateField }: SectionProps) {
  return (
    <div className="space-y-4">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Product Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={e => updateField('name', e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
          placeholder="Enter product name..."
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          URL Slug <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={e => updateField('slug', e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white font-mono"
          placeholder="product-url-slug"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          URL-friendly version of the product name
        </p>
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Short Description
        </label>
        <textarea
          value={formData.short_description || ''}
          onChange={e => updateField('short_description', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
          placeholder="Brief product description for listings..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Shown in product listings and previews
        </p>
      </div>

      {/* Full Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Full Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={e => updateField('description', e.target.value)}
          rows={6}
          className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
          placeholder="Detailed product description..."
        />
      </div>

      {/* Status & Featured */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={e => updateField('status', e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Featured Product
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={e => updateField('featured', e.target.checked)}
              className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-400">Show as featured</span>
          </label>
        </div>
      </div>
    </div>
  )
}

// ============================================
// PRICING SECTION
// ============================================

export function PricingSection({ formData, updateField }: SectionProps) {
  return (
    <div className="space-y-4">
      {/* Regular Price */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Regular Price <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            $
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={e => updateField('price', parseFloat(e.target.value))}
            className="w-full pl-8 pr-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      {/* Compare At Price (Sale Price) */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Compare-at Price
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            $
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.compare_at_price || ''}
            onChange={e =>
              updateField('compare_at_price', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            className="w-full pl-8 pr-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
            placeholder="0.00"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Original price (will show as crossed out)
        </p>
      </div>

      {/* Cost Per Item */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Cost per Item
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            $
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.cost_per_item || ''}
            onChange={e =>
              updateField('cost_per_item', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            className="w-full pl-8 pr-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
            placeholder="0.00"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Your cost basis (not shown to customers)
        </p>
      </div>

      {/* Profit Margin Display */}
      {formData.price > 0 && formData.cost_per_item && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Profit Margin:</span>
            <span className="text-green-400 font-semibold">
              ${(formData.price - formData.cost_per_item).toFixed(2)} (
              {(
                ((formData.price - formData.cost_per_item) / formData.price) *
                100
              ).toFixed(1)}
              %)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// INVENTORY SECTION
// ============================================

export function InventorySection({ formData, updateField }: SectionProps) {
  return (
    <div className="space-y-4">
      {/* SKU */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          SKU (Stock Keeping Unit)
        </label>
        <input
          type="text"
          value={formData.sku || ''}
          onChange={e => updateField('sku', e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white font-mono"
          placeholder="PRODUCT-SKU-001"
        />
      </div>

      {/* Barcode */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Barcode (ISBN, UPC, GTIN, etc.)
        </label>
        <input
          type="text"
          value={formData.barcode || ''}
          onChange={e => updateField('barcode', e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white font-mono"
          placeholder="123456789012"
        />
      </div>

      {/* Track Inventory */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.track_inventory}
            onChange={e => updateField('track_inventory', e.target.checked)}
            className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-300">Track inventory quantity</span>
        </label>
      </div>

      {/* Inventory Quantity */}
      {formData.track_inventory && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Inventory Quantity
          </label>
          <input
            type="number"
            min="0"
            value={formData.inventory_quantity}
            onChange={e =>
              updateField('inventory_quantity', parseInt(e.target.value))
            }
            className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Available units in stock
          </p>
        </div>
      )}

      {/* Allow Backorder */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.allow_backorder}
            onChange={e => updateField('allow_backorder', e.target.checked)}
            className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-300">
            Allow customers to purchase when out of stock
          </span>
        </label>
      </div>

      {/* Stock Status Indicator */}
      {formData.track_inventory && (
        <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Stock Status:</span>
            {formData.inventory_quantity > 10 ? (
              <span className="text-green-400 font-medium">In Stock</span>
            ) : formData.inventory_quantity > 0 ? (
              <span className="text-yellow-400 font-medium">Low Stock</span>
            ) : (
              <span className="text-red-400 font-medium">Out of Stock</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// SHIPPING SECTION
// ============================================

export function ShippingSection({ formData, updateField }: SectionProps) {
  return (
    <div className="space-y-4">
      {/* Requires Shipping */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.requires_shipping}
            onChange={e => updateField('requires_shipping', e.target.checked)}
            className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-300">
            This is a physical product (requires shipping)
          </span>
        </label>
      </div>

      {formData.requires_shipping && (
        <>
          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Weight
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.weight || ''}
                onChange={e =>
                  updateField('weight', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
                placeholder="0.00"
              />
              <select
                value={formData.weight_unit}
                onChange={e => updateField('weight_unit', e.target.value as any)}
                className="px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
              >
                <option value="lb">lb</option>
                <option value="oz">oz</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
              </select>
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dimensions (L × W × H)
            </label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.length || ''}
                onChange={e =>
                  updateField('length', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
                placeholder="Length"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.width || ''}
                onChange={e =>
                  updateField('width', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
                placeholder="Width"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.height || ''}
                onChange={e =>
                  updateField('height', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
                placeholder="Height"
              />
              <select
                value={formData.dimension_unit}
                onChange={e => updateField('dimension_unit', e.target.value as any)}
                className="px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
              >
                <option value="in">in</option>
                <option value="ft">ft</option>
                <option value="cm">cm</option>
                <option value="m">m</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================
// IMAGES SECTION
// ============================================

interface ImagesSectionProps extends SectionProps {
  addImage: (url: string, altText: string) => void
  removeImage: (index: number) => void
}

export function ImagesSection({
  formData,
  updateField,
  addImage,
  removeImage,
}: ImagesSectionProps) {
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.url) {
        addImage(data.url, file.name)
        toast.success('Image uploaded!')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  function handleAddUrl() {
    if (!imageUrl) {
      toast.error('Please enter an image URL')
      return
    }
    addImage(imageUrl, imageAlt)
    setImageUrl('')
    setImageAlt('')
    toast.success('Image added!')
  }

  async function handleGenerateImage() {
    if (!formData.name) {
      toast.error('Enter a product name first')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/build-guidance/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.name,
          businessType: 'product',
          sectionType: 'product',
          description: formData.description || formData.name,
        }),
      })

      const data = await response.json()
      if (data.success && data.data.url) {
        addImage(data.data.url, data.data.altText)
        toast.success('Image generated!')
      } else {
        throw new Error('Generation failed')
      }
    } catch (error) {
      toast.error('Failed to generate image')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {formData.images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {formData.images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-800 border border-gray-700"
            >
              <Image
                src={image.url}
                alt={image.alt_text || `Product image ${index + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeImage(index)}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Options */}
      <div className="space-y-3">
        {/* File Upload */}
        <div>
          <label className="block w-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className="w-full px-4 py-3 bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg hover:border-primary-500 transition-colors cursor-pointer text-center">
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary-500" />
              ) : (
                <>
                  <Upload className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    Click to upload image
                  </span>
                </>
              )}
            </div>
          </label>
        </div>

        {/* URL Input */}
        <div className="flex gap-2">
          <input
            type="url"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
            placeholder="Or paste image URL..."
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddUrl}
            disabled={!imageUrl}
          >
            Add URL
          </Button>
        </div>

        {/* AI Generate */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleGenerateImage}
          disabled={generating || !formData.name}
          leftIcon={
            generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )
          }
        >
          {generating ? 'Generating...' : 'Generate with AI'}
        </Button>
      </div>
    </div>
  )
}

// Continue in next part...
