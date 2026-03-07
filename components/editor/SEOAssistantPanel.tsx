'use client'

import { useState } from 'react'
import { Search, Sparkles, Loader2, Check } from 'lucide-react'
import { useEditorStore } from '@/lib/store/editor.store'
import toast from 'react-hot-toast'

interface SEOAssistantPanelProps {
  businessName?: string
  businessType?: string
}

export function SEOAssistantPanel({ businessName, businessType }: SEOAssistantPanelProps) {
  const { selectedPageId, updatePage, aiState, setSEOData } = useEditorStore()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateSEO = async () => {
    if (!selectedPageId || !businessName || !businessType) {
      toast.error('Please select a page first')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/seo-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          businessType,
          pageTitle: 'Home', // This should be dynamic
          pageContent: 'Sample page content', // Should get actual page content
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSEOData(data.data)
        updatePage(selectedPageId, {
          metaTitle: data.data.metaTitle,
          metaDescription: data.data.metaDescription,
        })
        toast.success('SEO metadata generated!')
      } else {
        toast.error(data.error || 'Failed to generate SEO data')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-primary-400" />
        <h3 className="font-semibold">SEO Assistant</h3>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleGenerateSEO}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generate SEO Metadata
        </button>

        {aiState.seoData && (
          <div className="space-y-3 pt-3 border-t border-gray-800">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Meta Title</label>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 text-sm">
                {aiState.seoData.metaTitle}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Meta Description</label>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 text-sm">
                {aiState.seoData.metaDescription}
              </div>
            </div>

            {aiState.seoData.keywords && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Keywords</label>
                <div className="flex flex-wrap gap-1">
                  {aiState.seoData.keywords.slice(0, 10).map((keyword: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">SEO optimized and applied!</span>
            </div>
          </div>
        )}
      </div>

      {/* SEO Tips */}
      <div className="pt-4 border-t border-gray-800">
        <p className="text-xs font-medium text-gray-400 mb-2">SEO Best Practices</p>
        <ul className="space-y-1 text-xs text-gray-500">
          <li>• Use descriptive, keyword-rich titles (50-60 chars)</li>
          <li>• Write compelling meta descriptions (150-160 chars)</li>
          <li>• Include primary keywords naturally</li>
          <li>• Optimize images with alt text</li>
          <li>• Use proper heading hierarchy (H1, H2, H3)</li>
        </ul>
      </div>
    </div>
  )
}
