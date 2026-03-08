'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, LogOut, Wand2, ArrowRight, Check, Loader2, LayoutTemplate, Palette, Image, Zap, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { BUSINESS_TYPES } from '@/lib/config/business-types'
import { AIProgressBar } from '@/components/ui/AIProgressBar'
import { WebsiteImprovementProgress } from '@/components/ui/WebsiteImprovementProgress'

// Color mapping from Tailwind names to hex codes
const colorMap: Record<string, string> = {
  orange: '#F97316',
  red: '#EF4444',
  amber: '#F59E0B',
  yellow: '#EAB308',
  lime: '#84CC16',
  green: '#10B981',
  emerald: '#10B981',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  sky: '#0EA5E9',
  blue: '#3B82F6',
  indigo: '#6366F1',
  violet: '#2563EB',
  purple: '#1D4ED8',
  fuchsia: '#D946EF',
  pink: '#EC4899',
  rose: '#F43F5E',
  slate: '#64748B',
  gray: '#6B7280',
  zinc: '#71717A',
  neutral: '#737373',
  stone: '#78716C',
}

export default function CreatePage() {
  const router = useRouter()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'form' | 'generating' | 'success' | 'preparing-editor'>('form')
  const [generatingStep, setGeneratingStep] = useState(0)
  const [formData, setFormData] = useState({
    mode: 'create' as 'create' | 'improve',
    existingUrl: '',
    businessName: '',
    description: '',
    websiteType: '', // Empty = Auto-detect from description
    targetAudience: '',
    tone: 'professional' as 'professional' | 'casual' | 'friendly' | 'formal' | 'playful',
    fullReproduction: true, // Enable full website reproduction by default
  })

  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    }
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-spinupfy-700 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const generationSteps = [
    { icon: Sparkles, text: 'Researching top competitors in your industry...', duration: 3000 },
    { icon: Wand2, text: 'Analyzing business requirements & UX best practices...', duration: 2500 },
    { icon: Sparkles, text: 'Generating website content with AI...', duration: 4000 },
    { icon: Image, text: 'Designing hero image...', duration: 3000 },
    { icon: Image, text: 'Generating feature images...', duration: 5000 },
    { icon: Image, text: 'Creating professional team headshots...', duration: 4000 },
    { icon: LayoutTemplate, text: 'Building UX-optimized page structure...', duration: 3000 },
    { icon: Palette, text: 'Applying industry-standard design system...', duration: 2000 },
    { icon: Zap, text: 'Setting up database and pages...', duration: 4000 },
    { icon: Check, text: 'Finalizing your website...', duration: 2000 },
  ]

  // Helper function to format URL with https://
  const formatUrl = (url: string): string => {
    if (!url) return url
    const trimmed = url.trim()
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`
    }
    return trimmed
  }

  // Handle URL field blur to auto-format
  const handleUrlBlur = () => {
    if (formData.existingUrl) {
      const formatted = formatUrl(formData.existingUrl)
      if (formatted !== formData.existingUrl) {
        setFormData({ ...formData, existingUrl: formatted })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Format URL if in improve mode
    const submissionData = {
      ...formData,
      existingUrl: formData.mode === 'improve' ? formatUrl(formData.existingUrl) : formData.existingUrl,
    }

    // For improve mode, just show the improvement screen
    // The WebsiteImprovementProgress component handles the API call
    if (submissionData.mode === 'improve') {
      // Update form data with formatted URL before showing progress
      setFormData(submissionData)
      setStep('generating')
      return
    }

    // For create mode, continue with the existing flow
    setStep('generating')
    setGeneratingStep(0)

    // Animate through generation steps with realistic timing
    let currentStepIndex = 0
    let stepTimeouts: NodeJS.Timeout[] = []

    const advanceStep = (index: number) => {
      if (index < generationSteps.length) {
        setGeneratingStep(index)
        const nextTimeout = setTimeout(
          () => advanceStep(index + 1),
          generationSteps[index].duration
        )
        stepTimeouts.push(nextTimeout)
      }
    }

    // Start the step animation
    advanceStep(0)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      })

      const data = await response.json()

      // Clear all pending timeouts
      stepTimeouts.forEach(timeout => clearTimeout(timeout))

      if (data.success) {
        // Ensure we're at the final step
        setGeneratingStep(generationSteps.length - 1)

        // Brief pause to show completion checkmark
        setTimeout(() => {
          setStep('success')
          // Show success checkmark for 1 second
          setTimeout(() => {
            // Transition to preparing editor state
            setStep('preparing-editor')
            // Wait a bit while editor loads, then navigate
            setTimeout(() => {
              toast.success('Website created successfully!')
              router.push(`/editor/${data.data.websiteId}`)
            }, 1500)
          }, 1000)
        }, 1200)
      } else {
        setStep('form')
        toast.error(data.error || 'Failed to generate website')
      }
    } catch (error) {
      // Clear all pending timeouts
      stepTimeouts.forEach(timeout => clearTimeout(timeout))
      setStep('form')
      toast.error('An error occurred while generating your website')
    }
  }

  const handleImprovementComplete = (websiteId: string) => {
    setStep('success')
    // Show success checkmark for 1 second
    setTimeout(() => {
      // Transition to preparing editor state
      setStep('preparing-editor')
      // Wait while editor loads, then navigate
      setTimeout(() => {
        toast.success('Website improved successfully!')
        router.push(`/editor/${websiteId}`)
      }, 1500)
    }, 1000)
  }

  const handleImprovementError = (error: string) => {
    setStep('form')
    toast.error(error)
  }

  const selectedBusinessType = BUSINESS_TYPES.find(bt => bt.id === formData.websiteType)

  return (
    <div className="min-h-screen px-6 py-12 bg-white">
      {/* Header */}
      <div className="mx-auto max-w-6xl mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-spinupfy-700 transition-colors rounded-lg hover:bg-spinupfy-50"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-spinupfy-700 transition-colors rounded-lg hover:bg-spinupfy-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 rounded-full bg-spinupfy-50 border border-spinupfy-700/20 px-4 py-2 mb-6"
                >
                  <Sparkles className="w-4 h-4 text-spinupfy-700" />
                  <span className="text-sm font-medium text-spinupfy-700">
                    AI-Powered Website Builder
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-6xl font-bold mb-4 text-gray-900"
                >
                  Create Your{' '}
                  <span className="bg-gradient-to-r from-spinupfy-700 to-spinupfy-500 text-transparent bg-clip-text">
                    Dream Website
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-gray-500 max-w-2xl mx-auto"
                >
                  Tell us about your business and our AI will generate a stunning, professional website in seconds
                </motion.p>
              </div>

              {/* Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onSubmit={handleSubmit}
                className="bg-white border border-gray-100 shadow-lg shadow-spinupfy-700/5 p-8 md:p-10 rounded-3xl space-y-8"
              >
                {/* Mode Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    What would you like to do? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: 'create', existingUrl: '' })}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        formData.mode === 'create'
                          ? 'border-spinupfy-700 bg-spinupfy-50'
                          : 'border-gray-200 hover:border-spinupfy-700/30 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-spinupfy-100 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-spinupfy-700" />
                        </div>
                        <div className="font-semibold text-gray-900">Create New Website</div>
                      </div>
                      <p className="text-sm text-gray-400">
                        Generate a brand new website from scratch with AI
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: 'improve' })}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        formData.mode === 'improve'
                          ? 'border-spinupfy-500 bg-spinupfy-50'
                          : 'border-gray-200 hover:border-spinupfy-700/30 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-spinupfy-100 flex items-center justify-center">
                          <Wand2 className="w-5 h-5 text-spinupfy-500" />
                        </div>
                        <div className="font-semibold text-gray-900">Improve Existing Website</div>
                      </div>
                      <p className="text-sm text-gray-400">
                        Scan your current website and modernize it with AI
                      </p>
                    </button>
                  </div>
                </div>

                {/* Existing Website URL (only show if improve mode) */}
                {formData.mode === 'improve' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-gray-700">
                        Your Website URL *
                      </label>
                      <input
                        type="url"
                        value={formData.existingUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, existingUrl: e.target.value })
                        }
                        onBlur={handleUrlBlur}
                        placeholder="www.yourwebsite.com"
                        className="w-full px-4 py-4 bg-black/20 rounded-xl border border-white/10 focus:border-spinupfy-700 focus:ring-2 focus:ring-spinupfy-700/15 focus:outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        required={formData.mode === 'improve'}
                      />
                      <p className="mt-2 text-xs text-gray-400">
                        <span className="text-spinupfy-500">💡 Tip:</span> Enter your website URL (we&apos;ll automatically add https:// if needed)
                      </p>
                    </div>

                    {/* Full Reproduction Toggle */}
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-gray-700">
                        Reproduction Mode
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, fullReproduction: true })}
                          className={`p-5 rounded-xl border-2 transition-all text-left ${
                            formData.fullReproduction
                              ? 'border-spinupfy-500 bg-spinupfy-50'
                              : 'border-gray-200 hover:border-spinupfy-700/30 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-spinupfy-100 flex items-center justify-center">
                              <LayoutTemplate className="w-5 h-5 text-spinupfy-500" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">Full Reproduction</div>
                              <div className="text-xs text-spinupfy-500 font-medium">Recommended</div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400">
                            Crawl all pages (3 levels deep), preserve colors, images, menu structure, and reproduce the entire website
                          </p>
                          <ul className="mt-3 space-y-1">
                            <li className="text-xs text-gray-500 flex items-center gap-2">
                              <Check className="w-3 h-3 text-spinupfy-500" /> All pages reproduced
                            </li>
                            <li className="text-xs text-gray-500 flex items-center gap-2">
                              <Check className="w-3 h-3 text-spinupfy-500" /> Original colors & fonts preserved
                            </li>
                            <li className="text-xs text-gray-500 flex items-center gap-2">
                              <Check className="w-3 h-3 text-spinupfy-500" /> Images kept intact
                            </li>
                            <li className="text-xs text-gray-500 flex items-center gap-2">
                              <Check className="w-3 h-3 text-spinupfy-500" /> Menu structure preserved
                            </li>
                          </ul>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, fullReproduction: false })}
                          className={`p-5 rounded-xl border-2 transition-all text-left ${
                            !formData.fullReproduction
                              ? 'border-spinupfy-700 bg-spinupfy-50'
                              : 'border-gray-200 hover:border-spinupfy-700/30 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-spinupfy-100 flex items-center justify-center">
                              <Zap className="w-5 h-5 text-spinupfy-700" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">Quick Improvement</div>
                              <div className="text-xs text-spinupfy-700 font-medium">Faster</div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400">
                            Scan homepage only and create an improved single-page website with AI-generated content
                          </p>
                          <ul className="mt-3 space-y-1">
                            <li className="text-xs text-gray-500 flex items-center gap-2">
                              <Check className="w-3 h-3 text-spinupfy-700" /> Homepage only
                            </li>
                            <li className="text-xs text-gray-500 flex items-center gap-2">
                              <Check className="w-3 h-3 text-spinupfy-700" /> Faster processing
                            </li>
                            <li className="text-xs text-gray-500 flex items-center gap-2">
                              <Check className="w-3 h-3 text-spinupfy-700" /> AI-generated images
                            </li>
                          </ul>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    Business Name {formData.mode === 'create' ? '*' : '(optional)'}
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    placeholder={
                      formData.mode === 'improve'
                        ? 'Leave empty to auto-detect from your website'
                        : 'e.g., Sunrise Bakery'
                    }
                    className="w-full px-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-spinupfy-700 focus:ring-2 focus:ring-spinupfy-700/15 focus:outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    required={formData.mode === 'create'}
                  />
                </div>

                {/* Business Type - Optional with Auto-Detection */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Business Type (Optional)
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    <span className="text-spinupfy-700">✨ AI Auto-Detection:</span> Leave empty and we&apos;ll automatically detect your business type from your description
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, websiteType: '' })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.websiteType === ''
                          ? 'border-spinupfy-700 bg-spinupfy-50'
                          : 'border-gray-200 hover:border-spinupfy-700/30 bg-white'
                      }`}
                    >
                      <div className="text-2xl mb-2">🤖</div>
                      <div className="text-sm font-medium">Auto-Detect</div>
                    </button>
                    {BUSINESS_TYPES.slice(0, 5).map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, websiteType: type.id })}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          formData.websiteType === type.id
                            ? 'border-spinupfy-700 bg-spinupfy-50'
                            : 'border-gray-200 hover:border-spinupfy-700/30 bg-white'
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.emoji}</div>
                        <div className="text-sm font-medium">{type.label}</div>
                      </button>
                    ))}
                  </div>
                  <select
                    value={formData.websiteType}
                    onChange={(e) =>
                      setFormData({ ...formData, websiteType: e.target.value })
                    }
                    className="w-full px-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-spinupfy-700 focus:outline-none transition-all text-gray-900"
                  >
                    <option value="">🤖 Auto-Detect from Description</option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.emoji} {type.label}
                      </option>
                    ))}
                  </select>

                  {formData.websiteType === '' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-spinupfy-50 rounded-xl border border-spinupfy-700/20"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">🤖</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">AI Auto-Detection Enabled</h4>
                          <p className="text-sm text-gray-400">
                            Our AI will analyze your business description and automatically determine the best business category,
                            design style, and layout for your website. Just describe what you do!
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {selectedBusinessType && formData.websiteType !== '' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{selectedBusinessType.emoji}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{selectedBusinessType.label}</h4>
                          <p className="text-sm text-gray-400 mb-3">
                            {selectedBusinessType.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Theme:</span>
                            <div className="flex gap-1.5">
                              <div
                                className="w-6 h-6 rounded-full border-2 border-white/20"
                                style={{ backgroundColor: colorMap[selectedBusinessType.colorTheme.primary] || '#3B82F6' }}
                                title="Primary"
                              />
                              <div
                                className="w-6 h-6 rounded-full border-2 border-white/20"
                                style={{ backgroundColor: colorMap[selectedBusinessType.colorTheme.secondary] || '#10B981' }}
                                title="Secondary"
                              />
                              <div
                                className="w-6 h-6 rounded-full border-2 border-white/20"
                                style={{ backgroundColor: colorMap[selectedBusinessType.colorTheme.accent] || '#F59E0B' }}
                                title="Accent"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    Business Description {formData.mode === 'create' ? '*' : '(optional)'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder={
                      formData.mode === 'improve'
                        ? 'Add details to help AI better understand your business (or leave empty to auto-detect)'
                        : 'Describe your business, services, and what makes you unique...'
                    }
                    className="w-full px-4 py-4 bg-black/20 rounded-xl border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-white placeholder:text-gray-500 h-32 resize-none"
                    required={formData.mode === 'create'}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.mode === 'improve'
                      ? '💡 Optional: Additional context helps AI create more accurate content'
                      : 'Be specific - this helps us create better content for your website'}
                  </p>
                </div>

                {/* Optional Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                      Target Audience (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.targetAudience}
                      onChange={(e) =>
                        setFormData({ ...formData, targetAudience: e.target.value })
                      }
                      placeholder="e.g., Families, Young professionals"
                      className="w-full px-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-spinupfy-700 focus:ring-2 focus:ring-spinupfy-700/15 focus:outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                      Tone
                    </label>
                    <select
                      value={formData.tone}
                      onChange={(e) =>
                        setFormData({ ...formData, tone: e.target.value as any })
                      }
                      className="w-full px-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-spinupfy-700 focus:outline-none transition-all text-gray-900"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="playful">Playful</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-5 bg-spinupfy-gradient hover:opacity-90 rounded-xl font-bold text-lg text-white transition-all shadow-lg shadow-spinupfy-700/30 hover:shadow-spinupfy-700/50 flex items-center justify-center gap-3"
                >
                  <Wand2 className="w-5 h-5" />
                  Generate My Website
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.form>
            </motion.div>
          )}

          {step === 'generating' && formData.mode === 'improve' && (
            <WebsiteImprovementProgress
              websiteUrl={formData.existingUrl}
              onComplete={handleImprovementComplete}
              onError={handleImprovementError}
              formData={formData}
            />
          )}

          {step === 'generating' && formData.mode === 'create' && (
            <AIProgressBar
              progress={(generatingStep / (generationSteps.length - 1)) * 100}
              status="Crafting Your Digital Masterpiece"
              substatus={generationSteps[generatingStep]?.text || 'Processing...'}
              isComplete={generatingStep === generationSteps.length - 1}
            />
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="bg-white border border-gray-100 shadow-xl shadow-spinupfy-700/5 p-12 rounded-3xl max-w-2xl mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 mx-auto mb-8 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold mb-4 text-gray-900">Website Generated!</h2>
                <p className="text-gray-500 mb-8">
                  Your website has been created successfully
                </p>
              </div>
            </motion.div>
          )}

          {step === 'preparing-editor' && (
            <motion.div
              key="preparing-editor"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="bg-white border border-gray-100 shadow-xl shadow-spinupfy-700/5 p-12 rounded-3xl max-w-2xl mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{
                    scale: { type: 'spring', stiffness: 200, damping: 15 },
                    rotate: { duration: 2, repeat: Infinity, ease: 'linear' }
                  }}
                  className="w-20 h-20 mx-auto mb-8 bg-spinupfy-gradient rounded-full flex items-center justify-center"
                >
                  <Loader2 className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold mb-4 text-gray-900">Loading Editor</h2>
                <p className="text-gray-500 mb-8">
                  Preparing your website in the editor...
                </p>

                {/* Animated dots */}
                <div className="flex justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-spinupfy-700 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
