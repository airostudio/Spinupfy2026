'use client'

import { useState } from 'react'
import { Sparkles, Wand2, RefreshCw, Loader2, Send, Lightbulb } from 'lucide-react'
import { useEditorStore } from '@/lib/store/editor.store'
import toast from 'react-hot-toast'

interface AIAssistantPanelProps {
  businessName?: string
  businessType?: string
}

export function AIAssistantPanel({ businessName, businessType }: AIAssistantPanelProps) {
  const { selectedSectionId, selectedPageId, updateSection, setAIGenerating, aiState, website } = useEditorStore()

  // Get the selected section's type and content
  const getSelectedSection = () => {
    if (!website || !selectedPageId || !selectedSectionId) return null
    const page = website.pages.find(p => p.id === selectedPageId)
    if (!page) return null
    return page.sections.find(s => s.id === selectedSectionId)
  }
  const [websitePrompt, setWebsitePrompt] = useState('')
  const [sectionPrompt, setSectionPrompt] = useState('')
  const [tone, setTone] = useState<'professional' | 'casual' | 'friendly' | 'formal' | 'creative'>('professional')
  const [activeMode, setActiveMode] = useState<'website' | 'section'>('website')

  const examplePrompts = [
    "Make my website more modern and professional",
    "Change the color scheme to warm earth tones",
    "Add more engaging call-to-action buttons",
    "Simplify the language for a younger audience",
    "Make the hero section more impactful",
    "Add social proof and testimonials",
  ]

  const handleWebsiteAdjustment = async () => {
    if (!websitePrompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    if (!businessName) {
      toast.error('Website name not found')
      return
    }

    setAIGenerating(true)
    try {
      // This will be a new API endpoint for general website adjustments
      toast.success('Processing your request...')

      // For now, show a helpful message
      toast('AI website adjustments coming soon! For now, please use section-specific adjustments.', {
        icon: '🚀',
        duration: 4000,
      })

      setWebsitePrompt('')
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setAIGenerating(false)
    }
  }

  const handleSectionAdjustment = async () => {
    if (!selectedSectionId || !sectionPrompt.trim()) {
      toast.error('Please select a section and enter a prompt')
      return
    }

    if (!businessName || !businessType) {
      toast.error('Business information not found')
      return
    }

    const selectedSection = getSelectedSection()
    if (!selectedSection) {
      toast.error('Could not find selected section')
      return
    }

    setAIGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionType: selectedSection.type, // Use actual section type
          businessName,
          businessType,
          additionalContext: sectionPrompt,
          currentContent: selectedSection.content, // Pass current content for context
        }),
      })

      const data = await response.json()
      if (data.success) {
        updateSection(selectedSectionId, { content: data.data })
        toast.success('Section updated successfully!')
        setSectionPrompt('')
      } else {
        toast.error(data.error || 'Failed to update section')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setAIGenerating(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!selectedSectionId || !businessName || !businessType) {
      toast.error('Please select a section first')
      return
    }

    const selectedSection = getSelectedSection()
    if (!selectedSection) {
      toast.error('Could not find selected section')
      return
    }

    setAIGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          businessType,
          sectionType: selectedSection.type, // Use actual section type
          style: 'photorealistic',
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Only update backgroundImage, store's deep merge will preserve other content
        updateSection(selectedSectionId, {
          content: {
            backgroundImage: data.data.imageUrl,
          },
        })
        toast.success('Image generated successfully!')
      } else {
        toast.error(data.error || 'Failed to generate image')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setAIGenerating(false)
    }
  }

  const handleRefineContent = async (instruction: string) => {
    if (!selectedSectionId) {
      toast.error('Please select a section first')
      return
    }

    const selectedSection = getSelectedSection()
    if (!selectedSection) {
      toast.error('Could not find selected section')
      return
    }

    setAIGenerating(true)
    try {
      // Get actual content from the selected section
      const currentContent = selectedSection.content

      const response = await fetch('/api/ai/refine-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalContent: currentContent,
          sectionType: selectedSection.type,
          instruction,
          tone,
        }),
      })

      const data = await response.json()
      if (data.success && data.data) {
        // Apply the refined content to the section
        updateSection(selectedSectionId, { content: data.data })
        toast.success('Content refined successfully!')
      } else {
        toast.error(data.error || 'Failed to refine content')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setAIGenerating(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary-400" />
        <h3 className="font-semibold">AI Assistant</h3>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveMode('website')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeMode === 'website'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Adjust Website
        </button>
        <button
          onClick={() => setActiveMode('section')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeMode === 'section'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Adjust Section
        </button>
      </div>

      {/* Website Mode */}
      {activeMode === 'website' && (
        <div className="space-y-4">
          {/* Main Prompt Area */}
          <div>
            <label className="block text-sm font-medium mb-2">Tell AI what to change</label>
            <div className="relative">
              <textarea
                value={websitePrompt}
                onChange={(e) => setWebsitePrompt(e.target.value)}
                placeholder="E.g., Make my website more modern and professional with a blue color scheme..."
                className="w-full px-3 py-3 pr-12 bg-gray-900 rounded-lg border-2 border-gray-800 focus:border-primary-500 focus:outline-none text-sm h-32 resize-none"
              />
              <button
                onClick={handleWebsiteAdjustment}
                disabled={aiState.isGenerating || !websitePrompt.trim()}
                className="absolute bottom-3 right-3 p-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send prompt"
              >
                {aiState.isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <p className="text-xs font-medium text-gray-400">Example prompts:</p>
            </div>
            <div className="space-y-1">
              {examplePrompts.slice(0, 3).map((example, index) => (
                <button
                  key={index}
                  onClick={() => setWebsitePrompt(example)}
                  className="w-full text-left text-xs text-gray-400 hover:text-primary-400 transition-colors py-1 px-2 rounded hover:bg-gray-700/50"
                >
                  &ldquo;{example}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section Mode */}
      {activeMode === 'section' && (
        <div className="space-y-4">
          {!selectedSectionId && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-xs text-yellow-200">Click on a section in the canvas to select it first</p>
            </div>
          )}

          {/* Tone Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="formal">Formal</option>
              <option value="creative">Creative</option>
            </select>
          </div>

          {/* Section Prompt */}
          <div>
            <label className="block text-sm font-medium mb-2">Adjust this section</label>
            <div className="relative">
              <textarea
                value={sectionPrompt}
                onChange={(e) => setSectionPrompt(e.target.value)}
                placeholder="E.g., Make it more engaging, add statistics, focus on benefits..."
                className="w-full px-3 py-3 pr-12 bg-gray-900 rounded-lg border-2 border-gray-800 focus:border-primary-500 focus:outline-none text-sm h-24 resize-none"
                disabled={!selectedSectionId}
              />
              <button
                onClick={handleSectionAdjustment}
                disabled={aiState.isGenerating || !selectedSectionId || !sectionPrompt.trim()}
                className="absolute bottom-3 right-3 p-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Apply changes"
              >
                {aiState.isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Wand2 className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <button
              onClick={handleGenerateImage}
              disabled={aiState.isGenerating || !selectedSectionId}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              Generate Image
            </button>
          </div>

          {/* Content Refinement Options */}
          <div className="pt-4 border-t border-gray-800">
            <p className="text-sm font-medium mb-2">Quick Refinements</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRefineContent('Make it shorter and more concise')}
                disabled={aiState.isGenerating || !selectedSectionId}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition-colors disabled:opacity-50"
              >
                Make Shorter
              </button>
              <button
                onClick={() => handleRefineContent('Make it longer and more detailed')}
                disabled={aiState.isGenerating || !selectedSectionId}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition-colors disabled:opacity-50"
              >
                Make Longer
              </button>
              <button
                onClick={() => handleRefineContent('Simplify the language')}
                disabled={aiState.isGenerating || !selectedSectionId}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition-colors disabled:opacity-50"
              >
                Simplify
              </button>
              <button
                onClick={() => handleRefineContent('Make it more engaging and persuasive')}
                disabled={aiState.isGenerating || !selectedSectionId}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition-colors disabled:opacity-50"
              >
                More Engaging
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
