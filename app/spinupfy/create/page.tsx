'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowLeft, ArrowRight, Check, Loader2, User, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { SPINUPFY_TEMPLATES, SPINUPFY_CATEGORIES, getTemplatesByCategory, matchTemplateToPrompt, getTemplate } from '@/lib/config/spinupfy-templates'
import { TemplateCard } from '@/components/spinupfy/TemplateCard'
import { DateRangePicker } from '@/components/spinupfy/DateRangePicker'
import { PricingCalculator } from '@/components/spinupfy/PricingCalculator'
import type { SpinupfyTemplate } from '@/lib/config/spinupfy-templates'
import type { PricingBreakdown } from '@/lib/spinupfy-pricing'

type WizardStep = 'template' | 'details' | 'dates' | 'confirm'

const STEP_CONFIG: Array<{ key: WizardStep; label: string; desc: string }> = [
  { key: 'template', label: 'Choose Template', desc: 'What is your site for?' },
  { key: 'details',  label: 'Your Details',    desc: 'Site name & contact info' },
  { key: 'dates',    label: 'Set Dates',        desc: 'When should it be live?' },
  { key: 'confirm',  label: 'Review & Pay',     desc: 'Confirm and launch' },
]

function SpinupfyCreateWizardInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [step, setStep] = useState<WizardStep>('template')
  const [authLoading, setAuthLoading] = useState(true)

  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<SpinupfyTemplate | null>(null)
  const [activeCategory, setActiveCategory] = useState(SPINUPFY_CATEGORIES[0])
  const [promptInput, setPromptInput] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<SpinupfyTemplate[]>([])

  // Details
  const [siteName, setSiteName] = useState('')
  const [siteDescription, setSiteDescription] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  // Dates
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null)

  // Submission
  const [submitting, setSubmitting] = useState(false)

  const templatesByCategory = getTemplatesByCategory()

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login?redirect=/spinupfy/create'); return }
      setContactEmail(session.user.email || '')
      setAuthLoading(false)

      const templateId = searchParams.get('templateId')
      const prompt = searchParams.get('prompt')

      if (templateId) {
        const t = getTemplate(templateId as any)
        if (t) {
          setSelectedTemplate(t)
          setActiveCategory(t.category)
          setStep('details')
        }
      } else if (prompt) {
        setPromptInput(prompt)
        const matches = matchTemplateToPrompt(prompt)
        if (matches.length > 0) {
          setSelectedTemplate(matches[0])
          setActiveCategory(matches[0].category)
        }
        setAiSuggestions(matches.slice(0, 3))
        setStep('template')
      }
    }
    init()
  }, [])

  function handlePromptInput(val: string) {
    setPromptInput(val)
    if (val.length > 2) {
      const matches = matchTemplateToPrompt(val)
      setAiSuggestions(matches.slice(0, 3))
      if (matches.length > 0 && !selectedTemplate) {
        setSelectedTemplate(matches[0])
      }
    } else {
      setAiSuggestions([])
    }
  }

  function handleTemplateSelect(template: SpinupfyTemplate) {
    setSelectedTemplate(template)
    setActiveCategory(template.category)
  }

  function canAdvance(): boolean {
    switch (step) {
      case 'template': return !!selectedTemplate
      case 'details': return !!siteName.trim() && !!contactEmail.trim()
      case 'dates': return !!startDate && !!endDate && endDate > startDate
      case 'confirm': return !!pricing
      default: return false
    }
  }

  function advanceStep() {
    const order: WizardStep[] = ['template', 'details', 'dates', 'confirm']
    const idx = order.indexOf(step)
    if (idx < order.length - 1) setStep(order[idx + 1])
  }

  function retreatStep() {
    const order: WizardStep[] = ['template', 'details', 'dates', 'confirm']
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
    else router.push('/spinupfy')
  }

  async function handleSubmit() {
    if (!selectedTemplate || !startDate || !endDate || !pricing) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/spinupfy/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          name: siteName,
          description: siteDescription,
          prompt: promptInput,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          contactName,
          contactEmail,
          contactPhone,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create site')

      toast.success('Site created! Redirecting to editor...')
      router.push(`/editor/${data.site.id}?spinupfy=true&template=${selectedTemplate.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-spinupfy-600 animate-spin" />
      </div>
    )
  }

  const currentStepIndex = STEP_CONFIG.findIndex(s => s.key === step)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="border-b border-gray-800/60 px-6 py-4 flex items-center gap-4">
        <button
          onClick={retreatStep}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-700 hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            {STEP_CONFIG.map((s, i) => (
              <div key={s.key} className="flex items-center gap-1.5">
                <div className={`
                  flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all
                  ${i < currentStepIndex ? 'bg-green-500 text-white' :
                    i === currentStepIndex ? 'bg-spinupfy-700 text-white' :
                    'bg-gray-700 text-gray-500'}
                `}>
                  {i < currentStepIndex ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === currentStepIndex ? 'text-white font-medium' : 'text-gray-600'}`}>
                  {s.label}
                </span>
                {i < STEP_CONFIG.length - 1 && (
                  <div className={`h-px w-8 transition-colors ${i < currentStepIndex ? 'bg-green-500' : 'bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <img src="/spinupfy-icon.svg" alt="Spinupfy" className="w-6 h-6" />
          <span className="font-bold text-sm">Spinupfy</span>
        </div>
      </header>

      {/* Step content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Template ── */}
          {step === 'template' && (
            <motion.div
              key="template"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-black mb-2">What is your site for?</h1>
                <p className="text-gray-400">Describe it in your own words, or browse the templates below.</p>
              </div>

              {/* Smart prompt */}
              <div className="relative mb-6">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  value={promptInput}
                  onChange={e => handlePromptInput(e.target.value)}
                  placeholder="e.g. garage sale, open house, flash sale, wedding RSVP..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-spinupfy-700"
                />
              </div>

              {/* AI suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-spinupfy-500" /> AI suggestions
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {aiSuggestions.map(t => (
                      <TemplateCard
                        key={t.id}
                        template={t}
                        selected={selectedTemplate?.id === t.id}
                        onSelect={handleTemplateSelect}
                        compact
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Category browser */}
              <div>
                <div className="text-xs text-gray-500 mb-3">Or browse all templates</div>
                <div className="flex flex-wrap gap-2 mb-5">
                  {SPINUPFY_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                        activeCategory === cat
                          ? 'bg-spinupfy-700 border-spinupfy-600 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(templatesByCategory[activeCategory as keyof typeof templatesByCategory] || []).map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      selected={selectedTemplate?.id === template.id}
                      onSelect={handleTemplateSelect}
                    />
                  ))}
                </div>
              </div>

              {selectedTemplate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-spinupfy-950/40 border border-spinupfy-700/30 rounded-2xl flex items-center gap-4"
                >
                  <span className="text-3xl">{selectedTemplate.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{selectedTemplate.label} selected</div>
                    <div className="text-sm text-gray-400">{selectedTemplate.tagline}</div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Step 2: Details ── */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-8">
                <div className="text-3xl mb-2">{selectedTemplate?.emoji}</div>
                <h1 className="text-3xl font-black mb-2">Tell us about your site</h1>
                <p className="text-gray-400">This helps AI generate the right content for you.</p>
              </div>

              <div className="max-w-xl space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Site name <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={siteName}
                    onChange={e => setSiteName(e.target.value)}
                    placeholder={selectedTemplate?.wizardDefaults.headline || 'My Amazing Event'}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-spinupfy-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Brief description
                  </label>
                  <textarea
                    value={siteDescription}
                    onChange={e => setSiteDescription(e.target.value)}
                    rows={3}
                    placeholder={selectedTemplate?.wizardDefaults.subheadline || 'Tell us more about what this is for...'}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-spinupfy-700 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">The more detail you give, the better AI can customise your site.</p>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <div className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" /> Contact info for lifecycle emails
                  </div>
                  <p className="text-xs text-gray-500 mb-4">We'll email you before your site expires and if it's suspended.</p>

                  <div className="space-y-3">
                    <input
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-spinupfy-700 text-sm"
                    />
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-spinupfy-700 text-sm"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        value={contactPhone}
                        onChange={e => setContactPhone(e.target.value)}
                        placeholder="Phone (optional)"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-spinupfy-700 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Dates ── */}
          {step === 'dates' && (
            <motion.div
              key="dates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-black mb-2">When should your site be live?</h1>
                <p className="text-gray-400">Pick your start and end dates — pricing updates instantly.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartChange={setStartDate}
                    onEndChange={setEndDate}
                  />

                  {/* Quick picks */}
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-2">Quick picks</div>
                    <div className="flex flex-wrap gap-2">
                      {[1, 3, 7, 14, 30].map(days => (
                        <button
                          key={days}
                          onClick={() => {
                            const start = new Date(); start.setHours(0, 0, 0, 0)
                            const end = new Date(start); end.setDate(end.getDate() + days)
                            setStartDate(start); setEndDate(end)
                          }}
                          className="text-xs px-3 py-1.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                        >
                          {days === 1 ? '1 day' : days < 7 ? `${days} days` : days === 7 ? '1 week' : days === 14 ? '2 weeks' : '1 month'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <PricingCalculator
                    templateType={selectedTemplate?.id as any || 'event_flyer'}
                    startDate={startDate}
                    endDate={endDate}
                    onPricingReady={setPricing}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Confirm ── */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-black mb-2">Review your order</h1>
                <p className="text-gray-400">Everything look good? Let's build your site.</p>
              </div>

              <div className="max-w-xl space-y-4">
                {/* Summary card */}
                <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedTemplate?.emoji}</span>
                    <div>
                      <div className="font-bold text-white">{siteName}</div>
                      <div className="text-sm text-gray-400">{selectedTemplate?.label}</div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4 space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Live from</span>
                      <span className="text-white">{startDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expires</span>
                      <span className="text-white">{endDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-white">{pricing?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contact email</span>
                      <span className="text-white">{contactEmail}</span>
                    </div>
                  </div>

                  {pricing && (
                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Base price</span><span>${pricing.basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400 mb-3">
                        <span>Platform fee</span><span>${pricing.platformFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-white text-lg">
                        <span>Total</span><span>${pricing.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lifecycle explanation */}
                <div className="bg-spinupfy-950/20 border border-spinupfy-700/20 rounded-2xl p-4 text-sm text-gray-400 space-y-2">
                  <p className="font-medium text-spinupfy-300">What happens next:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>AI generates your site and opens it in the editor</li>
                    <li>Customize as you like, then publish</li>
                    <li>We email you 3 days and 1 day before expiry</li>
                    <li>You can extend anytime — just pay for the extra days</li>
                    <li>If not extended, site is suspended on expiry and deleted after 5 days</li>
                  </ol>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-spinupfy-700 to-spinupfy-500 hover:from-spinupfy-600 hover:to-spinupfy-400 disabled:opacity-50 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all"
                >
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Building your site...</>
                  ) : (
                    <><img src="/spinupfy-icon.svg" alt="" className="w-5 h-5" /> Build My Site — ${pricing?.totalPrice.toFixed(2)}</>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        {step !== 'confirm' && (
          <div className="flex justify-end mt-8">
            <button
              onClick={advanceStep}
              disabled={!canAdvance()}
              className="flex items-center gap-2 px-6 py-3 bg-spinupfy-700 hover:bg-spinupfy-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SpinupfyCreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-spinupfy-600 animate-spin" />
      </div>
    }>
      <SpinupfyCreateWizardInner />
    </Suspense>
  )
}
