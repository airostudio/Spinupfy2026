'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Plus,
  Minus,
  X,
  Upload,
  Trash2,
  DollarSign,
  Tag,
  Image as ImageIcon,
  Globe,
  Search,
  BarChart3,
  Boxes,
  Truck,
  MapPin,
  Clock,
  Percent,
  Link2,
  FileText,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  AlertCircle,
  Check,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ProductImage {
  id?: string
  url: string
  alt_text?: string
  position: number
}

export interface ProductVariant {
  id?: string
  title: string
  sku?: string
  barcode?: string
  price: number
  compare_at_price?: number
  cost_per_item?: number
  inventory_quantity: number
  options: Record<string, string>
  position: number
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
}

export interface ProductFormData {
  // Basic Information
  name: string
  description?: string
  short_description?: string
  slug: string

  // Pricing
  price: number
  compare_at_price?: number
  cost_per_item?: number

  // Inventory
  sku?: string
  barcode?: string
  track_inventory: boolean
  inventory_quantity: number
  allow_backorder: boolean

  // Physical Properties
  weight?: number
  weight_unit: 'lb' | 'kg' | 'oz' | 'g'
  requires_shipping: boolean

  // Dimensions
  length?: number
  width?: number
  height?: number
  dimension_unit: 'in' | 'cm' | 'ft' | 'm'

  // Status & Visibility
  status: 'draft' | 'active' | 'archived'
  featured: boolean

  // SEO
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
  focus_keyword?: string
  canonical_url?: string

  // Geographic Targeting
  geo_targeting_enabled: boolean
  target_countries?: string[]
  target_regions?: string[]
  target_cities?: string[]

  // Open Graph (Social Media)
  og_title?: string
  og_description?: string
  og_image?: string
  og_type?: string

  // Twitter Card
  twitter_card_type?: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string

  // Schema.org Structured Data
  schema_enabled: boolean
  brand?: string
  gtin?: string
  mpn?: string
  condition?: 'new' | 'refurbished' | 'used'
  availability?: 'in_stock' | 'out_of_stock' | 'preorder' | 'discontinued'

  // Categories & Tags
  category_ids?: string[]
  tags?: string[]

  // Images
  images: ProductImage[]

  // Variants
  variants?: ProductVariant[]
  variant_options?: {
    name: string
    values: string[]
  }[]
}

interface ProductEditorProps {
  storeId: string
  productId?: string
  onSave?: (product: any) => void
  onClose?: () => void
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ProductEditor({ storeId, productId, onSave, onClose }: ProductEditorProps) {
  const [loading, setLoading] = useState(!!productId)
  const [saving, setSaving] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basic', 'pricing', 'inventory'])
  )
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    price: 0,
    track_inventory: true,
    inventory_quantity: 0,
    allow_backorder: false,
    weight_unit: 'lb',
    dimension_unit: 'in',
    requires_shipping: true,
    status: 'draft',
    featured: false,
    meta_keywords: [],
    geo_targeting_enabled: false,
    schema_enabled: true,
    condition: 'new',
    availability: 'in_stock',
    tags: [],
    images: [],
  })

  useEffect(() => {
    loadCategories()
    if (productId) {
      loadProduct()
    }
  }, [productId])

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !productId) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name, productId])

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('store_id', storeId)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  async function loadProduct() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          product_variants(*),
          product_category_relations(category_id)
        `)
        .eq('id', productId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          ...data,
          images: data.product_images || [],
          variants: data.product_variants || [],
          category_ids: data.product_category_relations?.map((r: any) => r.category_id) || [],
          meta_keywords: data.meta_keywords || [],
          tags: data.tags || [],
          target_countries: data.target_countries || [],
          target_regions: data.target_regions || [],
          target_cities: data.target_cities || [],
        })
      }
    } catch (error) {
      console.error('Error loading product:', error)
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  function toggleSection(section: string) {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  function updateField<K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function addImage(url: string, altText: string = '') {
    const newImage: ProductImage = {
      url,
      alt_text: altText,
      position: formData.images.length,
    }
    updateField('images', [...formData.images, newImage])
  }

  function removeImage(index: number) {
    updateField(
      'images',
      formData.images.filter((_, i) => i !== index)
    )
  }

  function addTag(tag: string) {
    if (tag && !formData.tags?.includes(tag)) {
      updateField('tags', [...(formData.tags || []), tag])
    }
  }

  function removeTag(tag: string) {
    updateField(
      'tags',
      formData.tags?.filter(t => t !== tag) || []
    )
  }

  function addKeyword(keyword: string) {
    if (keyword && !formData.meta_keywords?.includes(keyword)) {
      updateField('meta_keywords', [...(formData.meta_keywords || []), keyword])
    }
  }

  function removeKeyword(keyword: string) {
    updateField(
      'meta_keywords',
      formData.meta_keywords?.filter(k => k !== keyword) || []
    )
  }

  async function handleSave() {
    // Validation
    if (!formData.name) {
      toast.error('Product name is required')
      return
    }

    if (!formData.slug) {
      toast.error('Product slug is required')
      return
    }

    if (formData.price <= 0) {
      toast.error('Price must be greater than 0')
      return
    }

    setSaving(true)
    try {
      const productData = {
        store_id: storeId,
        name: formData.name,
        description: formData.description,
        short_description: formData.short_description,
        slug: formData.slug,
        price: formData.price,
        compare_at_price: formData.compare_at_price,
        cost_per_item: formData.cost_per_item,
        sku: formData.sku,
        barcode: formData.barcode,
        track_inventory: formData.track_inventory,
        inventory_quantity: formData.inventory_quantity,
        allow_backorder: formData.allow_backorder,
        weight: formData.weight,
        weight_unit: formData.weight_unit,
        requires_shipping: formData.requires_shipping,
        length: formData.length,
        width: formData.width,
        height: formData.height,
        dimension_unit: formData.dimension_unit,
        status: formData.status,
        featured: formData.featured,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords,
        focus_keyword: formData.focus_keyword,
        canonical_url: formData.canonical_url,
        geo_targeting_enabled: formData.geo_targeting_enabled,
        target_countries: formData.target_countries,
        target_regions: formData.target_regions,
        target_cities: formData.target_cities,
        og_title: formData.og_title,
        og_description: formData.og_description,
        og_image: formData.og_image,
        og_type: formData.og_type,
        twitter_card_type: formData.twitter_card_type,
        twitter_title: formData.twitter_title,
        twitter_description: formData.twitter_description,
        twitter_image: formData.twitter_image,
        schema_enabled: formData.schema_enabled,
        brand: formData.brand,
        gtin: formData.gtin,
        mpn: formData.mpn,
        condition: formData.condition,
        availability: formData.availability,
        tags: formData.tags,
      }

      let savedProduct
      if (productId) {
        // Update existing product
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId)
          .select()
          .single()

        if (error) throw error
        savedProduct = data
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        if (error) throw error
        savedProduct = data
      }

      // Save images
      if (savedProduct) {
        // Delete existing images if updating
        if (productId) {
          await supabase
            .from('product_images')
            .delete()
            .eq('product_id', productId)
        }

        // Insert new images
        if (formData.images.length > 0) {
          const imageData = formData.images.map((img, index) => ({
            product_id: savedProduct.id,
            url: img.url,
            alt_text: img.alt_text,
            position: index,
          }))

          await supabase.from('product_images').insert(imageData)
        }

        // Save category relations
        if (formData.category_ids && formData.category_ids.length > 0) {
          // Delete existing relations
          if (productId) {
            await supabase
              .from('product_category_relations')
              .delete()
              .eq('product_id', productId)
          }

          // Insert new relations
          const categoryData = formData.category_ids.map(categoryId => ({
            product_id: savedProduct.id,
            category_id: categoryId,
          }))

          await supabase.from('product_category_relations').insert(categoryData)
        }
      }

      toast.success(productId ? 'Product updated!' : 'Product created!')
      onSave?.(savedProduct)
    } catch (error: any) {
      console.error('Error saving product:', error)
      toast.error(error.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {productId ? 'Edit Product' : 'New Product'}
              </h3>
              <p className="text-sm text-gray-400">
                WooCommerce-style product management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              leftIcon={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              leftIcon={
                saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )
              }
            >
              {saving ? 'Saving...' : productId ? 'Update' : 'Create Product'}
            </Button>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-3">
          {/* Basic Information */}
          <CollapsibleSection
            title="Basic Information"
            icon={<FileText className="w-4 h-4" />}
            isExpanded={expandedSections.has('basic')}
            onToggle={() => toggleSection('basic')}
          >
            <BasicInformationSection
              formData={formData}
              updateField={updateField}
            />
          </CollapsibleSection>

          {/* Pricing */}
          <CollapsibleSection
            title="Pricing"
            icon={<DollarSign className="w-4 h-4" />}
            isExpanded={expandedSections.has('pricing')}
            onToggle={() => toggleSection('pricing')}
          >
            <PricingSection formData={formData} updateField={updateField} />
          </CollapsibleSection>

          {/* Inventory */}
          <CollapsibleSection
            title="Inventory & Stock"
            icon={<Boxes className="w-4 h-4" />}
            isExpanded={expandedSections.has('inventory')}
            onToggle={() => toggleSection('inventory')}
          >
            <InventorySection formData={formData} updateField={updateField} />
          </CollapsibleSection>

          {/* Shipping */}
          <CollapsibleSection
            title="Shipping & Dimensions"
            icon={<Truck className="w-4 h-4" />}
            isExpanded={expandedSections.has('shipping')}
            onToggle={() => toggleSection('shipping')}
          >
            <ShippingSection formData={formData} updateField={updateField} />
          </CollapsibleSection>

          {/* Images */}
          <CollapsibleSection
            title="Product Images"
            icon={<ImageIcon className="w-4 h-4" />}
            isExpanded={expandedSections.has('images')}
            onToggle={() => toggleSection('images')}
          >
            <ImagesSection
              formData={formData}
              updateField={updateField}
              addImage={addImage}
              removeImage={removeImage}
            />
          </CollapsibleSection>

          {/* Categories & Tags */}
          <CollapsibleSection
            title="Categories & Tags"
            icon={<Tag className="w-4 h-4" />}
            isExpanded={expandedSections.has('categories')}
            onToggle={() => toggleSection('categories')}
          >
            <CategoriesSection
              formData={formData}
              updateField={updateField}
              categories={categories}
              addTag={addTag}
              removeTag={removeTag}
            />
          </CollapsibleSection>

          {/* SEO */}
          <CollapsibleSection
            title="SEO Optimization"
            icon={<Search className="w-4 h-4" />}
            isExpanded={expandedSections.has('seo')}
            onToggle={() => toggleSection('seo')}
          >
            <SEOSection
              formData={formData}
              updateField={updateField}
              addKeyword={addKeyword}
              removeKeyword={removeKeyword}
            />
          </CollapsibleSection>

          {/* Geographic Targeting */}
          <CollapsibleSection
            title="Geographic Targeting"
            icon={<MapPin className="w-4 h-4" />}
            isExpanded={expandedSections.has('geo')}
            onToggle={() => toggleSection('geo')}
          >
            <GeoTargetingSection
              formData={formData}
              updateField={updateField}
            />
          </CollapsibleSection>

          {/* Social Media (Open Graph & Twitter) */}
          <CollapsibleSection
            title="Social Media"
            icon={<Globe className="w-4 h-4" />}
            isExpanded={expandedSections.has('social')}
            onToggle={() => toggleSection('social')}
          >
            <SocialMediaSection
              formData={formData}
              updateField={updateField}
            />
          </CollapsibleSection>

          {/* Structured Data (Schema.org) */}
          <CollapsibleSection
            title="Structured Data (Schema.org)"
            icon={<BarChart3 className="w-4 h-4" />}
            isExpanded={expandedSections.has('schema')}
            onToggle={() => toggleSection('schema')}
          >
            <StructuredDataSection
              formData={formData}
              updateField={updateField}
            />
          </CollapsibleSection>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800/30">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-primary-400">{icon}</div>
          <span className="font-medium text-white">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 border-t border-gray-700">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// IMPORT SECTION COMPONENTS
// ============================================

// Import section components from separate files
import {
  BasicInformationSection,
  PricingSection,
  InventorySection,
  ShippingSection,
  ImagesSection,
} from './ProductEditorSections'

import {
  CategoriesSection,
  SEOSection,
  GeoTargetingSection,
  SocialMediaSection,
  StructuredDataSection,
} from './ProductEditorAdvancedSections'
