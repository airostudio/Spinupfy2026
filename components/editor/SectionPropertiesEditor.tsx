'use client'

import { useState, useEffect } from 'react'
import { Settings, Sparkles, Upload, Loader2, Plus, Trash2, MoveUp, MoveDown } from 'lucide-react'
import { useEditorStore, Section } from '@/lib/store/editor.store'
import { FooterEditor } from './FooterEditor'
import { HeaderEditor } from './HeaderEditor'
import { StoreSettingsEditor } from './StoreSettingsEditor'
import toast from 'react-hot-toast'

interface SectionPropertiesEditorProps {
  section: Section | null
  onUpdate: (updates: Partial<Section>) => void
}

export function SectionPropertiesEditor({ section, onUpdate }: SectionPropertiesEditorProps) {
  const [formData, setFormData] = useState<any>({})
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isGeneratingPage, setIsGeneratingPage] = useState<string | null>(null)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const { website, aiState } = useEditorStore()

  useEffect(() => {
    if (section) {
      setFormData(section.content || {})
    }
  }, [section])

  if (!section) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Select a section to edit its properties</p>
      </div>
    )
  }

  const handleChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    onUpdate({ content: newFormData })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, WebP, GIF, and SVG files are allowed')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsUploadingImage(true)
    const loadingToast = toast.loading('Uploading image...')

    try {
      const fd = new FormData()
      fd.append('file', file)
      if (website?.id) fd.append('websiteId', website.id)

      const response = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      handleChange('backgroundImage', data.url)
      toast.success('Image uploaded!', { id: loadingToast })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to upload image'
      console.error('Upload error:', msg)
      toast.error(msg, { id: loadingToast })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!website?.name) {
      toast.error('Please set a website name first')
      return
    }

    setIsGeneratingImage(true)
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: website.name,
          businessType: website.description || 'business',
          sectionType: 'HERO',
          description: formData.title || formData.description || '',
          style: 'photorealistic',
        }),
      })

      const data = await response.json()
      if (data.success) {
        handleChange('backgroundImage', data.data.url)
        toast.success('Image generated successfully!')
      } else {
        toast.error(data.error || 'Failed to generate image')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleGeneratePage = async (pageSlug: string, buttonText: string) => {
    if (!website?.id) {
      toast.error('Website not found')
      return
    }

    if (!pageSlug || pageSlug.trim() === '') {
      toast.error('Please enter a page link first')
      return
    }

    // Clean the slug (remove leading slash if present)
    const cleanSlug = pageSlug.startsWith('/') ? pageSlug.substring(1) : pageSlug

    setIsGeneratingPage(cleanSlug)
    const loadingToast = toast.loading(`Generating page: /${cleanSlug}...`)

    try {
      const response = await fetch('/api/ai/generate-single-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: website.id,
          slug: cleanSlug,
          context: {
            buttonText,
            websiteName: website.name,
            websiteType: website.description || 'general',
            brandName: website.brandName,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Page "/${cleanSlug}" generated successfully!`, { id: loadingToast })
      } else {
        toast.error(data.error || 'Failed to generate page', { id: loadingToast })
      }
    } catch (error) {
      toast.error('An error occurred while generating the page', { id: loadingToast })
    } finally {
      setIsGeneratingPage(null)
    }
  }

  const renderEditor = () => {
    switch (section.type.toUpperCase()) {
      case 'HERO':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Enter hero title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Enter subtitle..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none h-24 resize-none"
                placeholder="Enter description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">Primary CTA</label>
                <input
                  type="text"
                  value={formData.primaryCTA?.text || ''}
                  onChange={(e) =>
                    handleChange('primaryCTA', { ...formData.primaryCTA, text: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm mb-2"
                  placeholder="Button text"
                />
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.primaryCTA?.href || ''}
                    onChange={(e) =>
                      handleChange('primaryCTA', { ...formData.primaryCTA, href: e.target.value })
                    }
                    className="flex-1 px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
                    placeholder="Link (e.g., /services)"
                  />
                  <button
                    onClick={() =>
                      handleGeneratePage(
                        formData.primaryCTA?.href || '',
                        formData.primaryCTA?.text || 'Learn More'
                      )
                    }
                    disabled={
                      !formData.primaryCTA?.href ||
                      isGeneratingPage === (formData.primaryCTA?.href?.startsWith('/') ? formData.primaryCTA.href.substring(1) : formData.primaryCTA?.href)
                    }
                    className="px-3 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isGeneratingPage === (formData.primaryCTA?.href?.startsWith('/') ? formData.primaryCTA.href.substring(1) : formData.primaryCTA?.href) ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    AI Page
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Secondary CTA</label>
                <input
                  type="text"
                  value={formData.secondaryCTA?.text || ''}
                  onChange={(e) =>
                    handleChange('secondaryCTA', { ...formData.secondaryCTA, text: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm mb-2"
                  placeholder="Button text"
                />
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.secondaryCTA?.href || ''}
                    onChange={(e) =>
                      handleChange('secondaryCTA', { ...formData.secondaryCTA, href: e.target.value })
                    }
                    className="flex-1 px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
                    placeholder="Link (e.g., /contact)"
                  />
                  <button
                    onClick={() =>
                      handleGeneratePage(
                        formData.secondaryCTA?.href || '',
                        formData.secondaryCTA?.text || 'Contact Us'
                      )
                    }
                    disabled={
                      !formData.secondaryCTA?.href ||
                      isGeneratingPage === (formData.secondaryCTA?.href?.startsWith('/') ? formData.secondaryCTA.href.substring(1) : formData.secondaryCTA?.href)
                    }
                    className="px-3 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isGeneratingPage === (formData.secondaryCTA?.href?.startsWith('/') ? formData.secondaryCTA.href.substring(1) : formData.secondaryCTA?.href) ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    AI Page
                  </button>
                </div>
              </div>
            </div>

            {/* Background Image */}
            <div>
              <label className="block text-sm font-medium mb-2">Background Image</label>
              {formData.backgroundImage && (
                <div className="mb-2">
                  <img
                    src={formData.backgroundImage}
                    alt="Background"
                    className="w-full h-32 object-cover rounded-lg border border-gray-800"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  <div className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5">
                    {isUploadingImage ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    Upload
                  </div>
                </label>
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || aiState.isGenerating}
                  className="px-3 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isGeneratingImage ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  AI Generate
                </button>
              </div>
              <input
                type="text"
                value={formData.backgroundImage || ''}
                onChange={(e) => handleChange('backgroundImage', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-xs font-mono"
                placeholder="Or paste image URL..."
              />
            </div>

            {/* Image Position Control */}
            {formData.backgroundImage && (
              <div>
                <label className="block text-sm font-medium mb-2">Image Position</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleChange('imagePosition', 'side')}
                    className={`px-3 py-2 rounded text-xs font-medium transition-all ${
                      (formData.imagePosition === 'side' || !formData.imagePosition)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    Side
                  </button>
                  <button
                    onClick={() => handleChange('imagePosition', 'background')}
                    className={`px-3 py-2 rounded text-xs font-medium transition-all ${
                      formData.imagePosition === 'background'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    Background
                  </button>
                  <button
                    onClick={() => handleChange('imagePosition', 'background-opacity')}
                    className={`px-3 py-2 rounded text-xs font-medium transition-all ${
                      formData.imagePosition === 'background-opacity'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    Subtle BG
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formData.imagePosition === 'background-opacity' && '15% opacity behind content'}
                  {formData.imagePosition === 'background' && 'Full background with overlay'}
                  {(!formData.imagePosition || formData.imagePosition === 'side') && 'Split layout with side image'}
                </p>
              </div>
            )}
          </div>
        )

      case 'FEATURES':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Features</label>
                <button
                  onClick={() => {
                    const features = formData.features || []
                    handleChange('features', [...features, { title: '', description: '' }])
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Feature
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(formData.features || []).map((feature: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-900 rounded-lg border border-gray-800 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-400">Feature {index + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const features = [...(formData.features || [])]
                            if (index > 0) {
                              [features[index - 1], features[index]] = [features[index], features[index - 1]]
                              handleChange('features', features)
                            }
                          }}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const features = [...(formData.features || [])]
                            if (index < features.length - 1) {
                              [features[index], features[index + 1]] = [features[index + 1], features[index]]
                              handleChange('features', features)
                            }
                          }}
                          disabled={index === (formData.features || []).length - 1}
                          className="p-1 hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const features = (formData.features || []).filter((_: any, i: number) => i !== index)
                            handleChange('features', features)
                          }}
                          className="p-1 hover:bg-red-900/50 text-red-400 rounded"
                          title="Delete feature"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={feature.title || ''}
                      onChange={(e) => {
                        const features = [...(formData.features || [])]
                        features[index] = { ...features[index], title: e.target.value }
                        handleChange('features', features)
                      }}
                      placeholder="Feature title"
                      className="w-full px-2.5 py-1.5 bg-gray-800 rounded border border-gray-700 focus:border-primary-500 focus:outline-none text-sm"
                    />

                    <textarea
                      value={feature.description || ''}
                      onChange={(e) => {
                        const features = [...(formData.features || [])]
                        features[index] = { ...features[index], description: e.target.value }
                        handleChange('features', features)
                      }}
                      placeholder="Feature description"
                      className="w-full px-2.5 py-1.5 bg-gray-800 rounded border border-gray-700 focus:border-primary-500 focus:outline-none text-sm h-20 resize-none"
                    />

                    <input
                      type="text"
                      value={feature.image || ''}
                      onChange={(e) => {
                        const features = [...(formData.features || [])]
                        features[index] = { ...features[index], image: e.target.value }
                        handleChange('features', features)
                      }}
                      placeholder="Image URL (optional)"
                      className="w-full px-2.5 py-1.5 bg-gray-800 rounded border border-gray-700 focus:border-primary-500 focus:outline-none text-sm text-xs"
                    />
                  </div>
                ))}

                {(!formData.features || formData.features.length === 0) && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No features yet. Click "Add Feature" to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 'CTA':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Button</label>
                <input
                  type="text"
                  value={formData.primaryCTA?.text || ''}
                  onChange={(e) =>
                    handleChange('primaryCTA', { ...formData.primaryCTA, text: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm mb-2"
                  placeholder="Button text"
                />
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.primaryCTA?.href || ''}
                    onChange={(e) =>
                      handleChange('primaryCTA', { ...formData.primaryCTA, href: e.target.value })
                    }
                    className="flex-1 px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
                    placeholder="Link (e.g., /pricing)"
                  />
                  <button
                    onClick={() =>
                      handleGeneratePage(
                        formData.primaryCTA?.href || '',
                        formData.primaryCTA?.text || 'Get Started'
                      )
                    }
                    disabled={
                      !formData.primaryCTA?.href ||
                      isGeneratingPage === (formData.primaryCTA?.href?.startsWith('/') ? formData.primaryCTA.href.substring(1) : formData.primaryCTA?.href)
                    }
                    className="px-3 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isGeneratingPage === (formData.primaryCTA?.href?.startsWith('/') ? formData.primaryCTA.href.substring(1) : formData.primaryCTA?.href) ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    AI Page
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Secondary Button</label>
                <input
                  type="text"
                  value={formData.secondaryCTA?.text || ''}
                  onChange={(e) =>
                    handleChange('secondaryCTA', { ...formData.secondaryCTA, text: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm mb-2"
                  placeholder="Button text"
                />
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.secondaryCTA?.href || ''}
                    onChange={(e) =>
                      handleChange('secondaryCTA', { ...formData.secondaryCTA, href: e.target.value })
                    }
                    className="flex-1 px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
                    placeholder="Link (e.g., /demo)"
                  />
                  <button
                    onClick={() =>
                      handleGeneratePage(
                        formData.secondaryCTA?.href || '',
                        formData.secondaryCTA?.text || 'Learn More'
                      )
                    }
                    disabled={
                      !formData.secondaryCTA?.href ||
                      isGeneratingPage === (formData.secondaryCTA?.href?.startsWith('/') ? formData.secondaryCTA.href.substring(1) : formData.secondaryCTA?.href)
                    }
                    className="px-3 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isGeneratingPage === (formData.secondaryCTA?.href?.startsWith('/') ? formData.secondaryCTA.href.substring(1) : formData.secondaryCTA?.href) ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    AI Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'CONTACT':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none h-20 resize-none"
              />
            </div>
          </div>
        )

      case 'PRICING':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Pricing Plans</label>
                <button
                  onClick={() => {
                    const plans = formData.plans || []
                    handleChange('plans', [...plans, {
                      name: 'New Plan',
                      price: '$0',
                      period: 'month',
                      description: '',
                      features: [],
                      cta: { text: 'Get Started', href: '#' }
                    }])
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Plan
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(formData.plans || []).map((plan: any, planIndex: number) => (
                  <div key={planIndex} className="p-3 bg-gray-900 rounded-lg border border-gray-800 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-400">Plan {planIndex + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const plans = [...(formData.plans || [])]
                            if (planIndex > 0) {
                              [plans[planIndex - 1], plans[planIndex]] = [plans[planIndex], plans[planIndex - 1]]
                              handleChange('plans', plans)
                            }
                          }}
                          disabled={planIndex === 0}
                          className="p-1 hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const plans = [...(formData.plans || [])]
                            if (planIndex < plans.length - 1) {
                              [plans[planIndex], plans[planIndex + 1]] = [plans[planIndex + 1], plans[planIndex]]
                              handleChange('plans', plans)
                            }
                          }}
                          disabled={planIndex === (formData.plans || []).length - 1}
                          className="p-1 hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const plans = (formData.plans || []).filter((_: any, i: number) => i !== planIndex)
                            handleChange('plans', plans)
                          }}
                          className="p-1 hover:bg-red-900/50 text-red-400 rounded"
                          title="Delete plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={plan.name || ''}
                        onChange={(e) => {
                          const plans = [...(formData.plans || [])]
                          plans[planIndex] = { ...plans[planIndex], name: e.target.value }
                          handleChange('plans', plans)
                        }}
                        placeholder="Plan name"
                        className="w-full px-2.5 py-1.5 bg-gray-800 rounded border border-gray-700 focus:border-primary-500 focus:outline-none text-sm"
                      />

                      <input
                        type="text"
                        value={plan.badge || ''}
                        onChange={(e) => {
                          const plans = [...(formData.plans || [])]
                          plans[planIndex] = { ...plans[planIndex], badge: e.target.value }
                          handleChange('plans', plans)
                        }}
                        placeholder="Badge (optional)"
                        className="w-full px-2.5 py-1.5 bg-gray-800 rounded border border-gray-700 focus:border-primary-500 focus:outline-none text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={plan.price || ''}
                        onChange={(e) => {
                          const plans = [...(formData.plans || [])]
                          plans[planIndex] = { ...plans[planIndex], price: e.target.value }
                          handleChange('plans', plans)
                        }}
                        placeholder="Price (e.g. $99)"
                        className="w-full px-2.5 py-1.5 bg-gray-800 rounded border border-gray-700 focus:border-primary-500 focus:outline-none text-sm"
                      />

                      <input
                        type="text"
                        value={plan.period || ''}
                        onChange={(e) => {
                          const plans = [...(formData.plans || [])]
                          plans[planIndex] = { ...plans[planIndex], period: e.target.value }
                          handleChange('plans', plans)
                        }}
                        placeholder="Period (e.g. month)"
                        className="w-full px-2.5 py-1.5 bg-gray-800 rounded border border-gray-700 focus:border-primary-500 focus:outline-none text-sm"
                      />
                    </div>

                    <textarea
                      value={plan.description || ''}
                      onChange={(e) => {
                        const plans = [...(formData.plans || [])]
                        plans[planIndex] = { ...plans[planIndex], description: e.target.value }
                        handleChange('plans', plans)
                      }}
                      placeholder="Plan description"
                      className="w-full px-2.5 py-1.5 bg-gray-800 rounded border border-gray-700 focus:border-primary-500 focus:outline-none text-sm h-16 resize-none"
                    />

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Features</span>
                        <button
                          onClick={() => {
                            const plans = [...(formData.plans || [])]
                            const features = plans[planIndex].features || []
                            plans[planIndex] = { ...plans[planIndex], features: [...features, ''] }
                            handleChange('plans', plans)
                          }}
                          className="text-xs text-primary-400 hover:text-primary-300"
                        >
                          + Add
                        </button>
                      </div>
                      {(plan.features || []).map((feature: string, featureIndex: number) => (
                        <div key={featureIndex} className="flex gap-1 mb-1">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => {
                              const plans = [...(formData.plans || [])]
                              const features = [...(plans[planIndex].features || [])]
                              features[featureIndex] = e.target.value
                              plans[planIndex] = { ...plans[planIndex], features }
                              handleChange('plans', plans)
                            }}
                            placeholder="Feature"
                            className="flex-1 px-2 py-1 bg-gray-800 rounded border border-gray-700 focus:border-primary-500 focus:outline-none text-xs"
                          />
                          <button
                            onClick={() => {
                              const plans = [...(formData.plans || [])]
                              const features = (plans[planIndex].features || []).filter((_: any, i: number) => i !== featureIndex)
                              plans[planIndex] = { ...plans[planIndex], features }
                              handleChange('plans', plans)
                            }}
                            className="p-1 hover:bg-red-900/50 text-red-400 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
                      <input
                        type="text"
                        value={plan.cta?.text || ''}
                        onChange={(e) => {
                          const plans = [...(formData.plans || [])]
                          plans[planIndex] = {
                            ...plans[planIndex],
                            cta: { ...(plans[planIndex].cta || {}), text: e.target.value }
                          }
                          handleChange('plans', plans)
                        }}
                        placeholder="Button text"
                        className="w-full px-2.5 py-1.5 bg-gray-800 rounded border border-gray-700 focus:border-primary-500 focus:outline-none text-sm"
                      />

                      <input
                        type="text"
                        value={plan.cta?.href || ''}
                        onChange={(e) => {
                          const plans = [...(formData.plans || [])]
                          plans[planIndex] = {
                            ...plans[planIndex],
                            cta: { ...(plans[planIndex].cta || {}), href: e.target.value }
                          }
                          handleChange('plans', plans)
                        }}
                        placeholder="Button link"
                        className="w-full px-2.5 py-1.5 bg-gray-800 rounded border border-gray-700 focus:border-primary-500 focus:outline-none text-sm"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={plan.highlighted || false}
                        onChange={(e) => {
                          const plans = [...(formData.plans || [])]
                          plans[planIndex] = { ...plans[planIndex], highlighted: e.target.checked }
                          handleChange('plans', plans)
                        }}
                        className="rounded border-gray-700 bg-gray-800 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-gray-400">Highlight this plan</span>
                    </label>
                  </div>
                ))}

                {(!formData.plans || formData.plans.length === 0) && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No pricing plans yet. Click "Add Plan" to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 'FOOTER':
        return <FooterEditor section={section} onUpdate={onUpdate} />

      case 'HEADER':
        return (
          <HeaderEditor
            content={formData}
            onChange={(newContent) => {
              setFormData(newContent)
              onUpdate({ content: newContent })
            }}
          />
        )

      case 'STORE':
      case 'ADVANCED_STORE':
        return (
          <StoreSettingsEditor
            formData={formData}
            onUpdate={(field, value) => handleChange(field, value)}
            websiteId={website?.id}
          />
        )

      case 'ABOUT':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="About Us"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Our story..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none h-32 resize-none"
                placeholder="Tell your story..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => handleChange('image', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none font-mono text-xs"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stats (JSON)</label>
              <textarea
                value={JSON.stringify(formData.stats || [], null, 2)}
                onChange={(e) => {
                  try {
                    const stats = JSON.parse(e.target.value)
                    handleChange('stats', stats)
                    setJsonError(null)
                  } catch (err) {
                    setJsonError('Invalid JSON format')
                  }
                }}
                className={`w-full px-3 py-2 bg-gray-900 rounded-lg border focus:outline-none h-32 resize-none font-mono text-xs ${
                  jsonError ? 'border-red-500' : 'border-gray-800 focus:border-primary-500'
                }`}
                placeholder='[{"label": "Years", "value": "10+"}, ...]'
              />
              {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
            </div>
          </div>
        )

      case 'TEAM':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Our Team"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Meet the people behind our success"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Team Members (JSON)</label>
              <div className="text-xs text-gray-500 mb-2">Each member: name, role, bio, image, socials</div>
              <textarea
                value={JSON.stringify(formData.members || [], null, 2)}
                onChange={(e) => {
                  try {
                    const members = JSON.parse(e.target.value)
                    handleChange('members', members)
                    setJsonError(null)
                  } catch (err) {
                    setJsonError('Invalid JSON format')
                  }
                }}
                className={`w-full px-3 py-2 bg-gray-900 rounded-lg border focus:outline-none h-48 resize-none font-mono text-xs ${
                  jsonError ? 'border-red-500' : 'border-gray-800 focus:border-primary-500'
                }`}
              />
              {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
            </div>
          </div>
        )

      case 'SERVICES':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Our Services"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="What we offer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Services (JSON)</label>
              <div className="text-xs text-gray-500 mb-2">Each service: title, description, icon, price</div>
              <textarea
                value={JSON.stringify(formData.services || [], null, 2)}
                onChange={(e) => {
                  try {
                    const services = JSON.parse(e.target.value)
                    handleChange('services', services)
                    setJsonError(null)
                  } catch (err) {
                    setJsonError('Invalid JSON format')
                  }
                }}
                className={`w-full px-3 py-2 bg-gray-900 rounded-lg border focus:outline-none h-48 resize-none font-mono text-xs ${
                  jsonError ? 'border-red-500' : 'border-gray-800 focus:border-primary-500'
                }`}
              />
              {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
            </div>
          </div>
        )

      case 'TESTIMONIALS':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="What Our Clients Say"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Real feedback from real customers"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Testimonials (JSON)</label>
              <div className="text-xs text-gray-500 mb-2">Each: name, role, company, quote, image, rating</div>
              <textarea
                value={JSON.stringify(formData.testimonials || [], null, 2)}
                onChange={(e) => {
                  try {
                    const testimonials = JSON.parse(e.target.value)
                    handleChange('testimonials', testimonials)
                    setJsonError(null)
                  } catch (err) {
                    setJsonError('Invalid JSON format')
                  }
                }}
                className={`w-full px-3 py-2 bg-gray-900 rounded-lg border focus:outline-none h-48 resize-none font-mono text-xs ${
                  jsonError ? 'border-red-500' : 'border-gray-800 focus:border-primary-500'
                }`}
              />
              {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
            </div>
          </div>
        )

      case 'BOOKING':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Book an Appointment"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Schedule your visit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Available Services (JSON)</label>
              <textarea
                value={JSON.stringify(formData.services || [], null, 2)}
                onChange={(e) => {
                  try {
                    const services = JSON.parse(e.target.value)
                    handleChange('services', services)
                    setJsonError(null)
                  } catch (err) {
                    setJsonError('Invalid JSON format')
                  }
                }}
                className={`w-full px-3 py-2 bg-gray-900 rounded-lg border focus:outline-none h-32 resize-none font-mono text-xs ${
                  jsonError ? 'border-red-500' : 'border-gray-800 focus:border-primary-500'
                }`}
                placeholder='[{"name": "Consultation", "duration": 60, "price": 100}, ...]'
              />
              {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
            </div>
          </div>
        )

      case 'TRUST_BADGES':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Trusted By"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Badges (JSON)</label>
              <div className="text-xs text-gray-500 mb-2">Each badge: name, image, link (optional)</div>
              <textarea
                value={JSON.stringify(formData.badges || [], null, 2)}
                onChange={(e) => {
                  try {
                    const badges = JSON.parse(e.target.value)
                    handleChange('badges', badges)
                    setJsonError(null)
                  } catch (err) {
                    setJsonError('Invalid JSON format')
                  }
                }}
                className={`w-full px-3 py-2 bg-gray-900 rounded-lg border focus:outline-none h-32 resize-none font-mono text-xs ${
                  jsonError ? 'border-red-500' : 'border-gray-800 focus:border-primary-500'
                }`}
              />
              {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
            </div>
          </div>
        )

      case 'MOBILE_STICKY_CTA':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Button Text</label>
              <input
                type="text"
                value={formData.text || ''}
                onChange={(e) => handleChange('text', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Get Started"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Link</label>
              <input
                type="text"
                value={formData.href || ''}
                onChange={(e) => handleChange('href', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="/contact"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number (optional)</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
        )

      case 'LOAN_CALCULATOR':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Loan Calculator"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Calculate your monthly payments"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">Default Amount</label>
                <input
                  type="number"
                  value={formData.defaultLoanAmount || 10000}
                  onChange={(e) => handleChange('defaultLoanAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Amount</label>
                <input
                  type="number"
                  value={formData.maxLoanAmount || 100000}
                  onChange={(e) => handleChange('maxLoanAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">Default Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.defaultInterestRate || 5}
                  onChange={(e) => handleChange('defaultInterestRate', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Default Term (months)</label>
                <input
                  type="number"
                  value={formData.defaultLoanTerm || 12}
                  onChange={(e) => handleChange('defaultLoanTerm', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CTA Button Text</label>
              <input
                type="text"
                value={formData.ctaText || ''}
                onChange={(e) => handleChange('ctaText', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Apply Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CTA Link</label>
              <input
                type="text"
                value={formData.ctaHref || ''}
                onChange={(e) => handleChange('ctaHref', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="/apply"
              />
            </div>
          </div>
        )

      case 'FLOATING_CTA':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Button Text</label>
              <input
                type="text"
                value={formData.text || ''}
                onChange={(e) => handleChange('text', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Chat with us"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Link / Action</label>
              <input
                type="text"
                value={formData.href || ''}
                onChange={(e) => handleChange('href', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="/contact or tel:+1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <select
                value={formData.icon || 'message'}
                onChange={(e) => handleChange('icon', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
              >
                <option value="message">Message</option>
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>
        )

      case 'MENU':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Our Menu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Delicious options for everyone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Categories (JSON)</label>
              <div className="text-xs text-gray-500 mb-2">Each category: name, items (name, description, price, image)</div>
              <textarea
                value={JSON.stringify(formData.categories || [], null, 2)}
                onChange={(e) => {
                  try {
                    const categories = JSON.parse(e.target.value)
                    handleChange('categories', categories)
                    setJsonError(null)
                  } catch (err) {
                    setJsonError('Invalid JSON format')
                  }
                }}
                className={`w-full px-3 py-2 bg-gray-900 rounded-lg border focus:outline-none h-48 resize-none font-mono text-xs ${
                  jsonError ? 'border-red-500' : 'border-gray-800 focus:border-primary-500'
                }`}
              />
              {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
            </div>
          </div>
        )

      case 'GALLERY':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Gallery"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Our work in pictures"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Images (JSON)</label>
              <div className="text-xs text-gray-500 mb-2">Each image: url, alt, caption (optional)</div>
              <textarea
                value={JSON.stringify(formData.images || [], null, 2)}
                onChange={(e) => {
                  try {
                    const images = JSON.parse(e.target.value)
                    handleChange('images', images)
                    setJsonError(null)
                  } catch (err) {
                    setJsonError('Invalid JSON format')
                  }
                }}
                className={`w-full px-3 py-2 bg-gray-900 rounded-lg border focus:outline-none h-48 resize-none font-mono text-xs ${
                  jsonError ? 'border-red-500' : 'border-gray-800 focus:border-primary-500'
                }`}
              />
              {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
            </div>
          </div>
        )

      case 'PORTFOLIO':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Our Work"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Featured Projects"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Projects (JSON)</label>
              <div className="text-xs text-gray-500 mb-2">Each item: title, description, image, category, link</div>
              <textarea
                value={JSON.stringify(formData.items || [], null, 2)}
                onChange={(e) => {
                  try {
                    const items = JSON.parse(e.target.value)
                    handleChange('items', items)
                    setJsonError(null)
                  } catch (err) {
                    setJsonError('Invalid JSON format')
                  }
                }}
                className={`w-full px-3 py-2 bg-gray-900 rounded-lg border focus:outline-none h-48 resize-none font-mono text-xs ${
                  jsonError ? 'border-red-500' : 'border-gray-800 focus:border-primary-500'
                }`}
              />
              {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
            </div>
          </div>
        )

      case 'HOW_IT_WORKS':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="How It Works"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Simple steps to get started"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Steps (JSON)</label>
              <div className="text-xs text-gray-500 mb-2">Each step: title, description, icon (optional)</div>
              <textarea
                value={JSON.stringify(formData.steps || formData.features || [], null, 2)}
                onChange={(e) => {
                  try {
                    const steps = JSON.parse(e.target.value)
                    handleChange('steps', steps)
                    handleChange('features', steps)
                    setJsonError(null)
                  } catch (err) {
                    setJsonError('Invalid JSON format')
                  }
                }}
                className={`w-full px-3 py-2 bg-gray-900 rounded-lg border focus:outline-none h-48 resize-none font-mono text-xs ${
                  jsonError ? 'border-red-500' : 'border-gray-800 focus:border-primary-500'
                }`}
              />
              {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
            </div>
          </div>
        )

      case 'FAQ':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                placeholder="Frequently Asked Questions"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">FAQs (JSON)</label>
              <div className="text-xs text-gray-500 mb-2">Each item: question, answer</div>
              <textarea
                value={JSON.stringify(formData.items || [], null, 2)}
                onChange={(e) => {
                  try {
                    const items = JSON.parse(e.target.value)
                    handleChange('items', items)
                    setJsonError(null)
                  } catch (err) {
                    setJsonError('Invalid JSON format')
                  }
                }}
                className={`w-full px-3 py-2 bg-gray-900 rounded-lg border focus:outline-none h-48 resize-none font-mono text-xs ${
                  jsonError ? 'border-red-500' : 'border-gray-800 focus:border-primary-500'
                }`}
              />
              {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
            </div>
          </div>
        )

      default:
        // Generic editor for any section type that has content
        return (
          <div className="space-y-4">
            <div className="p-3 bg-gray-800/50 rounded-lg mb-4">
              <p className="text-xs text-gray-400">
                Editing <span className="text-primary-400 font-medium">{section.type}</span> section
              </p>
            </div>

            {/* Common fields */}
            {(formData.title !== undefined || section.type.includes('TITLE')) && (
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                  placeholder="Section title..."
                />
              </div>
            )}

            {formData.subtitle !== undefined && (
              <div>
                <label className="block text-sm font-medium mb-2">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
                  placeholder="Section subtitle..."
                />
              </div>
            )}

            {formData.description !== undefined && (
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none h-24 resize-none"
                  placeholder="Section description..."
                />
              </div>
            )}

            {/* Full JSON editor for all content */}
            <div>
              <label className="block text-sm font-medium mb-2">All Content (JSON)</label>
              <div className="text-xs text-gray-500 mb-2">Advanced: Edit all section data</div>
              <textarea
                value={JSON.stringify(formData, null, 2)}
                onChange={(e) => {
                  try {
                    const content = JSON.parse(e.target.value)
                    setFormData(content)
                    onUpdate({ content })
                    setJsonError(null)
                  } catch (err) {
                    setJsonError('Invalid JSON format')
                  }
                }}
                className={`w-full px-3 py-2 bg-gray-900 rounded-lg border focus:outline-none h-48 resize-none font-mono text-xs ${
                  jsonError ? 'border-red-500' : 'border-gray-800 focus:border-primary-500'
                }`}
              />
              {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">{section.type} Section</h3>
          <p className="text-xs text-gray-500 mt-0.5">Customize section content</p>
        </div>
        <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
          Order {section.order + 1}
        </span>
      </div>

      {renderEditor()}
    </div>
  )
}
