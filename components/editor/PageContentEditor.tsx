'use client'

import { useState, useEffect } from 'react'
import { FileText, Link, Search, ChevronDown, ChevronUp, Home } from 'lucide-react'
import { Page } from '@/lib/store/editor.store'

interface PageContentEditorProps {
  page: Page | null
  onUpdate: (updates: Partial<Page>) => void
}

export function PageContentEditor({ page, onUpdate }: PageContentEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    path: '',
    metaTitle: '',
    metaDescription: '',
  })

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || '',
        slug: page.slug || '',
        path: page.path || '',
        metaTitle: page.metaTitle || '',
        metaDescription: page.metaDescription || '',
      })
    }
  }, [page])

  if (!page) {
    return (
      <div className="p-4 border-b border-gray-800">
        <div className="text-center text-gray-500 py-4">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a page to edit</p>
        </div>
      </div>
    )
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    onUpdate({ [field]: value })
  }

  // Auto-generate slug from title if slug is empty
  const handleTitleChange = (value: string) => {
    handleChange('title', value)

    // Only auto-generate slug if it's currently empty or matches old auto-generated slug
    if (!formData.slug || formData.slug === generateSlug(formData.title)) {
      const newSlug = generateSlug(value)
      handleChange('slug', newSlug)

      // Also update path to match
      if (!page.isHomepage) {
        handleChange('path', `/${newSlug}`)
      }
    }
  }

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  return (
    <div className="border-b border-gray-800">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-400" />
          <span className="font-medium text-sm">Page Content</span>
          {page.isHomepage && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs">
              <Home className="w-3 h-3" />
              Home
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Page Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-300">
              Page Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
              placeholder="Enter page title..."
            />
          </div>

          {/* Page Slug & Path */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-300">
                <span className="flex items-center gap-1">
                  <Link className="w-3 h-3" />
                  Slug
                </span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm font-mono"
                placeholder="page-slug"
                disabled={page.isHomepage}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-300">
                Path
              </label>
              <input
                type="text"
                value={formData.path}
                onChange={(e) => handleChange('path', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm font-mono"
                placeholder="/path"
                disabled={page.isHomepage}
              />
            </div>
          </div>

          {/* SEO Section */}
          <div className="pt-2 border-t border-gray-800">
            <div className="flex items-center gap-1.5 mb-3">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">SEO</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-300">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => handleChange('metaTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
                  placeholder={formData.title || 'Page title for search engines...'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.metaTitle?.length || 0}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-300">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm h-20 resize-none"
                  placeholder="Describe this page for search engines..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.metaDescription?.length || 0}/160 characters
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
