'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Sparkles, ArrowRight, Star, Check, ChevronRight,
  Wand2, Palette, Globe, ShieldCheck, BarChart3, Layers,
  MessageSquare, Rocket, Clock, Zap,
} from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { ShowcaseSection, HowItWorksSection, VideoDemoSection } from '@/components/marketing'
import { createClient } from '@/lib/supabase'

const BUSINESS_TYPES = [
  'Coffee Shop',
  'Fitness Studio',
  'Law Firm',
  'Restaurant',
  'Real Estate Agency',
  'Hair Salon',
  'Dental Practice',
  'Consultant',
  'Yoga Studio',
  'Photography Studio',
]

const features = [
  {
    icon: Wand2,
    title: 'AI Website Builder',
    description: 'Describe your business in plain English. Our AI crafts a complete, professional website — pages, copy, images, and layout — in under 60 seconds. No templates to wrestle with.',
    color: '#7C35B8',
    tags: ['Auto-generated copy', 'Industry templates', 'Smart layout AI', 'Image generation'],
    wide: true,
  },
  {
    icon: MessageSquare,
    title: 'AI Content Writer',
    description: 'Auto-generate headlines, body copy, and CTAs perfectly tuned to your brand voice and audience.',
    color: '#B845A2',
  },
  {
    icon: Palette,
    title: 'Smart Design System',
    description: 'AI picks the perfect colour palette, typography, and layout to match your brand personality.',
    color: '#9B35B0',
  },
  {
    icon: BarChart3,
    title: 'Built-in SEO',
    description: 'Meta tags, structured data, sitemaps, and page speed optimisation — all automated, every time.',
    color: '#D46EBC',
  },
  {
    icon: Rocket,
    title: 'Instant Publishing',
    description: 'Go live on a free subdomain instantly, or connect your own domain in one click. SSL included.',
    color: '#7C35B8',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    description: 'SSL, DDoS protection, automatic backups, and 99.9% uptime SLA — baked in from day one.',
    color: '#B845A2',
    tags: ['99.9% Uptime', 'SSL Included', 'DDoS Protection', 'Auto Backups', 'GDPR Ready'],
    wide: true,
  },
  {
    icon: Layers,
    title: 'Visual Editor',
    description: 'Fine-tune any element with our pixel-perfect drag-and-drop editor. Everything updates in real-time.',
    color: '#9B35B0',
  },
]

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Owner, Bloom Floristry',
    avatar: '🌸',
    rating: 5,
    quote: 'I had a stunning website live in under 3 minutes. My bookings doubled within the first week. Spinupfy is an absolute game changer.',
  },
  {
    name: 'James Okafor',
    role: 'Founder, Apex Consulting',
    avatar: '💼',
    rating: 5,
    quote: 'The AI understood my business instantly. The copy it generated was better than anything I could have written myself. Incredible tool.',
  },
  {
    name: 'Priya Sharma',
    role: 'Chef & Owner, Spice Route',
    avatar: '🍛',
    rating: 5,
    quote: 'As someone with zero tech skills, I launched a beautiful restaurant website in minutes. My customers love it and so do I.',
  },
]

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for getting started',
    features: ['1 website', 'AI builder', 'Free subdomain', 'SSL included'],
    cta: 'Start for Free',
    href: '/create',
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/mo',
    description: 'For growing businesses',
    features: ['5 websites', 'Custom domain', 'Advanced SEO', 'Analytics dashboard'],
    cta: 'Get Started',
    href: '/pricing',
    popular: true,
  },
  {
    name: 'Agency',
    price: '$49',
    period: '/mo',
    description: 'For agencies & teams',
    features: ['Unlimited websites', 'White label', 'Priority support', 'Team access'],
    cta: 'Get Started',
    href: '/pricing',
  },
]

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [businessTypeIndex, setBusinessTypeIndex] = useState(0)

  useEffect(() => {
    checkAuthAndRedirect()
    const timeout = setTimeout(() => setCheckingAuth(false), 3000)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setBusinessTypeIndex(prev => (prev + 1) % BUSINESS_TYPES.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  async function checkAuthAndRedirect() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    }
    setCheckingAuth(false)
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-spinupfy-700/30 animate-ping" />
            <Sparkles className="w-14 h-14 relative z-10 animate-pulse" style={{ color: '#7C35B8' }} />
          </div>
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950" id="main-content">
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        aria-label="Hero"
        className="relative overflow-hidden pt-32 pb-24 sm:pb-36 px-6"
      >
        {/* Atmospheric gradient orbs */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(ellipse, #7C35B8 0%, transparent 70%)' }} />
          <div className="absolute top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-15"
            style={{ background: 'radial-gradient(ellipse, #B845A2 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 -left-32 w-[500px] h-[400px] rounded-full blur-3xl opacity-10"
            style={{ background: 'radial-gradient(ellipse, #5B1E90 0%, transparent 70%)' }} />
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          {/* Announcement badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 mb-8 backdrop-blur-sm"
            style={{ borderColor: 'rgba(124,53,184,0.4)', background: 'rgba(124,53,184,0.12)' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#B845A2' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#B845A2' }} />
            </span>
            <span className="text-sm font-medium" style={{ color: '#E89DD4' }}>
              Now powered by GPT-4o — smarter than ever
            </span>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: '#B845A2' }} />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.06] mb-6 text-white"
          >
            Your{' '}
            <span
              key={businessTypeIndex}
              className="animate-fade-in inline-block bg-spinupfy-gradient bg-clip-text text-transparent"
            >
              {BUSINESS_TYPES[businessTypeIndex]}
            </span>
            <br />
            Website, Built by AI
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Tell Spinupfy what you do. Our AI writes the copy, picks the design, and publishes a
            stunning website — in under 60 seconds. No code. No designers. No hassle.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link
              href="/create"
              className="group shine-effect inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-lg transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #7C35B8 0%, #B845A2 100%)',
                boxShadow: '0 8px 32px rgba(124,53,184,0.4)',
              }}
            >
              <Sparkles className="w-5 h-5" />
              Build My Website Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 glass hover:bg-white/15 rounded-xl font-semibold text-gray-200 transition-all duration-300"
            >
              See How It Works
            </Link>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['🧑‍💼', '👩‍🍳', '👨‍⚕️', '👩‍🎨', '🧑‍🔧'].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-gray-800 border-2 border-gray-950 flex items-center justify-center text-sm"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <span>10,000+ websites launched</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1">4.9 / 5 from 2,400+ reviews</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-green-400" />
              <span>
                Average build time:{' '}
                <strong className="text-green-400 font-semibold">58 seconds</strong>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────── */}
      <section
        aria-label="Industries we serve"
        className="py-10 border-y border-gray-800/60 bg-gray-900/30"
      >
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-600 mb-6">
            Trusted by businesses across every industry
          </p>
          <div className="flex flex-wrap justify-center items-center gap-5 sm:gap-10 opacity-50">
            {[
              '🏨 Hospitality',
              '🏥 Healthcare',
              '⚖️ Legal',
              '🏗️ Construction',
              '🎓 Education',
              '🛍️ Retail',
              '💆 Wellness',
              '🍽️ Food & Drink',
            ].map(industry => (
              <span key={industry} className="text-sm text-gray-400 font-medium whitespace-nowrap">
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOWCASE ─────────────────────────────────────────────── */}
      <ShowcaseSection />

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <div id="how-it-works">
        <HowItWorksSection />
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section id="features" aria-label="Features" className="py-24 md:py-32 px-6 bg-gray-950">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: '#B845A2' }}
            >
              Everything you need
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-4xl md:text-5xl font-extrabold text-white mb-4"
            >
              Powerful features.{' '}
              <span className="bg-spinupfy-gradient bg-clip-text text-transparent">
                Zero complexity.
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 max-w-2xl mx-auto"
            >
              Everything a professional web agency would build, delivered in seconds by AI.
            </motion.p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Wide card — AI Builder */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 glass-card rounded-3xl p-8 hover-lift group"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: 'rgba(124,53,184,0.15)' }}
              >
                <Wand2 className="w-7 h-7" style={{ color: '#7C35B8' }} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">AI Website Builder</h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Describe your business in plain English. Our AI crafts a complete, professional
                website — pages, copy, images, and layout — in under 60 seconds. No templates to
                wrestle with.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Auto-generated copy', 'Industry templates', 'Smart layout AI', 'Image generation'].map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium border"
                    style={{
                      background: 'rgba(124,53,184,0.12)',
                      borderColor: 'rgba(124,53,184,0.3)',
                      color: '#E89DD4',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* AI Content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="glass-card rounded-3xl p-8 hover-lift"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: 'rgba(184,69,162,0.15)' }}>
                <MessageSquare className="w-7 h-7" style={{ color: '#B845A2' }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Content Writer</h3>
              <p className="text-gray-400 leading-relaxed">
                Auto-generate headlines, body copy, and CTAs perfectly tuned to your brand voice
                and target audience.
              </p>
            </motion.div>

            {/* Smart Design */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-3xl p-8 hover-lift"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: 'rgba(155,53,176,0.15)' }}>
                <Palette className="w-7 h-7" style={{ color: '#9B35B0' }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Design System</h3>
              <p className="text-gray-400 leading-relaxed">
                AI picks the perfect colour palette, typography, and layout to match your brand
                personality.
              </p>
            </motion.div>

            {/* SEO */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="glass-card rounded-3xl p-8 hover-lift"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: 'rgba(212,110,188,0.15)' }}>
                <BarChart3 className="w-7 h-7" style={{ color: '#D46EBC' }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Built-in SEO</h3>
              <p className="text-gray-400 leading-relaxed">
                Meta tags, structured data, sitemaps, and page-speed optimisation — all automated,
                every time.
              </p>
            </motion.div>

            {/* Publishing */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-3xl p-8 hover-lift"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: 'rgba(124,53,184,0.15)' }}>
                <Rocket className="w-7 h-7" style={{ color: '#7C35B8' }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Publishing</h3>
              <p className="text-gray-400 leading-relaxed">
                Go live on a free subdomain instantly, or connect your own domain in one click.
                SSL included.
              </p>
            </motion.div>

            {/* Security — wide card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="md:col-span-2 glass-card rounded-3xl p-8 hover-lift flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(184,69,162,0.15)' }}>
                  <ShieldCheck className="w-7 h-7" style={{ color: '#B845A2' }} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Enterprise-Grade Security</h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  SSL certificates, DDoS protection, automatic backups, and a 99.9% uptime SLA —
                  rock-solid infrastructure so you never worry about downtime.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['99.9% Uptime', 'SSL Included', 'DDoS Protection', 'Auto Backups', 'GDPR Ready'].map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium border"
                      style={{
                        background: 'rgba(184,69,162,0.1)',
                        borderColor: 'rgba(184,69,162,0.3)',
                        color: '#E89DD4',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Visual Editor */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-3xl p-8 hover-lift"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: 'rgba(155,53,176,0.15)' }}>
                <Layers className="w-7 h-7" style={{ color: '#9B35B0' }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Visual Editor</h3>
              <p className="text-gray-400 leading-relaxed">
                Fine-tune any element with our pixel-perfect drag-and-drop editor. Everything
                updates in real-time.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── VIDEO DEMO ───────────────────────────────────────────── */}
      <VideoDemoSection />

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section aria-label="Customer testimonials" className="py-24 md:py-32 px-6 bg-gray-900/40">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-white mb-4"
            >
              Loved by{' '}
              <span className="bg-spinupfy-gradient bg-clip-text text-transparent">
                10,000+
              </span>{' '}
              businesses
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-xl text-gray-400"
            >
              Real results from real business owners
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.article
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-3xl p-8 hover-lift flex flex-col"
              >
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-gray-300 leading-relaxed mb-6 flex-1 text-[15px]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ───────────────────────────────────────── */}
      <section aria-label="Pricing" className="py-24 md:py-32 px-6 bg-gray-950">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-white mb-4"
            >
              Simple, transparent{' '}
              <span className="bg-spinupfy-gradient bg-clip-text text-transparent">pricing</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-xl text-gray-400"
            >
              Start free. Upgrade as you grow. Cancel anytime.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-8 flex flex-col ${
                  plan.popular
                    ? 'border-2'
                    : 'glass-card'
                }`}
                style={plan.popular ? {
                  background: 'linear-gradient(180deg, rgba(124,53,184,0.18) 0%, rgba(184,69,162,0.08) 100%)',
                  borderColor: 'rgba(124,53,184,0.6)',
                } : {}}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #7C35B8 0%, #B845A2 100%)' }}
                  >
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-500 text-sm">{plan.period}</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#B845A2' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    plan.popular ? 'text-white' : 'glass hover:bg-white/15 text-gray-200'
                  }`}
                  style={plan.popular ? {
                    background: 'linear-gradient(135deg, #7C35B8 0%, #B845A2 100%)',
                    boxShadow: '0 4px 20px rgba(124,53,184,0.35)',
                  } : {}}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/pricing"
              className="text-sm font-medium inline-flex items-center gap-1 transition-colors hover:opacity-80"
              style={{ color: '#B845A2' }}
            >
              View full pricing details <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section aria-label="Get started" className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center"
            style={{ background: 'linear-gradient(135deg, #5B1E90 0%, #7C35B8 40%, #B845A2 100%)' }}
          >
            {/* Background dot pattern */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)',
                backgroundSize: '28px 28px',
              }}
            />
            <div className="relative z-10">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">No credit card required</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                Your website is<br />58 seconds away
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
                Join 10,000+ business owners who launched their professional website with Spinupfy today.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-10 py-5 bg-white rounded-xl font-bold text-lg transition-all duration-300 hover:bg-purple-50 shine-effect"
                style={{ color: '#5B1E90', boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}
              >
                <Sparkles className="w-5 h-5" />
                Build My Website Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-white/55 text-sm mt-6">
                Free forever plan available · No setup fees · Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
