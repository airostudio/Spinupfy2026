'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Sparkles, Clock, Shield, ArrowRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { SPINUPFY_CATEGORIES, SPINUPFY_TEMPLATES, getTemplatesByCategory } from '@/lib/config/spinupfy-templates'
import { TemplateCard } from '@/components/spinupfy/TemplateCard'
import type { SpinupfyTemplate } from '@/lib/config/spinupfy-templates'

const HERO_WORDS = ['Event', 'Listing', 'Sale', 'Pop-Up', 'Fundraiser', 'Campaign', 'Booking', 'Launch']

export default function SpinupfyLandingPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>(SPINUPFY_CATEGORIES[0])
  const [heroWordIndex, setHeroWordIndex] = useState(0)
  const [promptSuggestions, setPromptSuggestions] = useState<SpinupfyTemplate[]>([])
  const promptRef = useRef<HTMLInputElement>(null)
  const templatesByCategory = getTemplatesByCategory()

  // Cycle hero word
  useState(() => {
    const interval = setInterval(() => {
      setHeroWordIndex(i => (i + 1) % HERO_WORDS.length)
    }, 2000)
    return () => clearInterval(interval)
  })

  async function handlePromptChange(value: string) {
    setPrompt(value)
    if (value.length < 3) { setPromptSuggestions([]); return }

    try {
      const res = await fetch(`/api/spinupfy/create?prompt=${encodeURIComponent(value)}`)
      const data = await res.json()
      if (data.suggestions) {
        // Map ids back to full templates
        const matched = data.suggestions.map((s: { id: string }) =>
          SPINUPFY_TEMPLATES.find(t => t.id === s.id)
        ).filter(Boolean)
        setPromptSuggestions(matched as SpinupfyTemplate[])
      }
    } catch {
      // silent
    }
  }

  function handleTemplateSelect(template: SpinupfyTemplate) {
    router.push(`/spinupfy/create?templateId=${template.id}`)
  }

  function handlePromptSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return
    router.push(`/spinupfy/create?prompt=${encodeURIComponent(prompt)}`)
  }

  const STATS = [
    { value: '60s', label: 'Average build time' },
    { value: '30+', label: 'Site templates' },
    { value: '5 days', label: 'Grace period after expiry' },
    { value: '$0.69', label: 'Starting price/day' },
  ]

  const HOW_IT_WORKS = [
    {
      step: '01',
      title: 'Tell us what you need',
      description: 'Type what your site is for — a garage sale, concert, property listing, flash sale, or any of 30+ use cases. AI picks the perfect template instantly.',
      icon: Sparkles,
    },
    {
      step: '02',
      title: 'Customize in the editor',
      description: 'Your AI-generated site opens in our live editor. Tweak colors, text, images, and layout until it\'s exactly right. No code needed.',
      icon: Zap,
    },
    {
      step: '03',
      title: 'Pick your dates & go live',
      description: 'Choose when your site goes live and when it comes down. AI calculates a fair price based on your timeframe. Pay once, done.',
      icon: Clock,
    },
    {
      step: '04',
      title: 'We handle the rest',
      description: 'We email you reminders before expiry. If you extend, we adjust the timeline. If not, we suspend the site and delete it after 5 days.',
      icon: Shield,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">Spinupfy</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/spinupfy/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
            My Sites
          </Link>
          <Link
            href="/spinupfy/create"
            className="text-sm font-medium px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
          >
            Create Site
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6">
            <Zap className="w-3 h-3" />
            AI builds your site in under 60 seconds
          </div>

          <h1 className="text-5xl md:text-6xl font-black leading-none mb-4">
            Spin up your{' '}
            <span className="relative inline-block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={heroWordIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500"
                >
                  {HERO_WORDS[heroWordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            {' '}site
            <br />
            in 60 seconds.
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            A one-page website for anything temporary — pop-up stores, event flyers, real estate listings,
            flash sales, fundraisers, and 25+ more. Goes live when you want, disappears when you're done.
          </p>

          {/* Prompt input */}
          <form onSubmit={handlePromptSubmit} className="relative max-w-xl mx-auto">
            <div className="relative">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                ref={promptRef}
                value={prompt}
                onChange={e => handlePromptChange(e.target.value)}
                placeholder="I need a site for my garage sale this weekend..."
                className="w-full pl-12 pr-36 py-4 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm"
              />
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors"
              >
                Build it <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Live template suggestions */}
            <AnimatePresence>
              {promptSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden text-left"
                >
                  <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-700">AI suggests:</div>
                  {promptSuggestions.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTemplateSelect(t)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 transition-colors text-left"
                    >
                      <span className="text-2xl">{t.emoji}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{t.label}</div>
                        <div className="text-xs text-gray-400">{t.tagline}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Quick example prompts */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {[
              'garage sale', 'property listing', 'flash sale', 'wedding RSVP', 'fundraiser', 'product launch',
            ].map(ex => (
              <button
                key={ex}
                onClick={() => {
                  setPrompt(ex)
                  router.push(`/spinupfy/create?prompt=${encodeURIComponent(ex)}`)
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800/60 py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Template browser */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-3">30+ ready-made templates</h2>
          <p className="text-gray-400">Pick one or just describe what you need — AI will choose for you</p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {SPINUPFY_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm px-4 py-2 rounded-xl border transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {(templatesByCategory[activeCategory as keyof typeof templatesByCategory] || []).map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleTemplateSelect}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gray-900/40 border-y border-gray-800/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">How Spinupfy works</h2>
            <p className="text-gray-400">From idea to live site in under 5 minutes</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-5 p-6 rounded-2xl bg-gray-800/40 border border-gray-700/60"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-500 mb-1">Step {step.step}</div>
                    <h3 className="font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-black mb-4">
            Ready to spin up your site?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            No monthly subscription. No long-term commitment. Pay only for the time you need.
          </p>
          <Link
            href="/spinupfy/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20"
          >
            <Zap className="w-5 h-5" />
            Start for free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-gray-600 mt-4">No credit card required to start</p>
        </motion.div>
      </section>
    </div>
  )
}
