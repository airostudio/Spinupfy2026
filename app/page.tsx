'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Sparkles, ArrowRight, Star, Check, ChevronRight,
  Wand2, Palette, ShieldCheck, BarChart3, Layers,
  Rocket, Clock, Calendar,
} from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { ShowcaseSection, HowItWorksSection, VideoDemoSection } from '@/components/marketing'
import { createClient } from '@/lib/supabase'

const BUSINESS_TYPES = [
  { label: 'Pop-Up Shop',          icon: '🛍️' },
  { label: 'Conference & Summit',  icon: '🎤' },
  { label: 'Event Booking',        icon: '📅' },
  { label: 'Real Estate Agency',   icon: '🏡' },
  { label: 'Food & Drink Market',  icon: '🍜' },
  { label: 'Music Festival',       icon: '🎵' },
  { label: 'Wedding Venue',        icon: '💍' },
  { label: 'Trade Show Booth',     icon: '🏛️' },
  { label: 'Yoga Retreat',         icon: '🧘' },
  { label: 'Art Exhibition',       icon: '🎨' },
  { label: 'Networking Event',     icon: '🤝' },
  { label: 'Farmers Market',       icon: '🥕' },
  { label: 'Photography Studio',   icon: '📸' },
  { label: 'Masterclass',          icon: '📚' },
  { label: 'Fitness Studio',       icon: '💪' },
  { label: 'Charity Fundraiser',   icon: '❤️' },
]

const features = [
  {
    icon: Wand2,
    title: 'AI Website Builder',
    description:
      'Describe your event or business in plain English. Our AI crafts a complete, professional website — pages, copy, images, and layout — in under 60 seconds.',
    color: '#7C35B8',
    tags: ['Auto-generated copy', 'Event templates', 'Smart layout AI', 'Image generation'],
    wide: true,
  },
  {
    icon: Calendar,
    title: 'Event & Booking Pages',
    description:
      'Dedicated landing pages for pop-ups, conferences, and events — with registration forms, ticket links, and schedules built in.',
    color: '#B845A2',
  },
  {
    icon: Palette,
    title: 'Smart Design System',
    description:
      'AI picks the perfect colour palette, typography, and layout to match your brand and event vibe.',
    color: '#9B35B0',
  },
  {
    icon: BarChart3,
    title: 'Built-in SEO',
    description:
      'Meta tags, structured data, sitemaps, and page-speed optimisation — all automated so attendees can find you.',
    color: '#D46EBC',
  },
  {
    icon: Rocket,
    title: 'Instant Publishing',
    description:
      'Go live on a free subdomain instantly, or connect your own domain. SSL included. Share the link in minutes.',
    color: '#7C35B8',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    description:
      'SSL, DDoS protection, automatic backups, and 99.9% uptime — so your event page is always live when you need it.',
    color: '#B845A2',
    tags: ['99.9% Uptime', 'SSL Included', 'DDoS Protection', 'Auto Backups', 'GDPR Ready'],
    wide: true,
  },
  {
    icon: Layers,
    title: 'Visual Editor',
    description:
      'Fine-tune any element with our drag-and-drop editor. Change colours, text, images — all in real-time.',
    color: '#9B35B0',
  },
]

const useCases = [
  { icon: '🛍️', title: 'Pop-Up Shops', desc: 'Launch in hours, not days' },
  { icon: '🎤', title: 'Conferences', desc: 'Agendas, speakers & tickets' },
  { icon: '🏡', title: 'Real Estate', desc: 'Property listings & leads' },
  { icon: '🍜', title: 'Food Markets', desc: 'Menus, bookings & maps' },
  { icon: '🎵', title: 'Music Events', desc: 'Lineups & ticket sales' },
  { icon: '💍', title: 'Weddings', desc: 'RSVP & venue details' },
  { icon: '📸', title: 'Photography', desc: 'Portfolio & enquiries' },
  { icon: '📚', title: 'Masterclasses', desc: 'Registrations & info' },
]

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Owner, Bloom Pop-Up Market',
    avatar: '🌸',
    rating: 5,
    quote:
      'I had a stunning pop-up shop website live in under 3 minutes. My bookings doubled within the first week. Spinupfy is an absolute game changer.',
  },
  {
    name: 'James Okafor',
    role: 'Organiser, Summit Connect',
    avatar: '🎤',
    rating: 5,
    quote:
      'Built our conference website in minutes. Registration went up 40% compared to our old site. The AI understood our event instantly.',
  },
  {
    name: 'Priya Sharma',
    role: 'Chef & Owner, Spice Market',
    avatar: '🍜',
    rating: 5,
    quote:
      'As someone with zero tech skills, I launched a beautiful food market website in minutes. My customers love it and so do I.',
  },
]

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for one-off events',
    features: ['1 website', 'AI builder', 'Free subdomain', 'SSL included'],
    cta: 'Start for Free',
    href: '/create',
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/mo',
    description: 'For growing businesses',
    features: ['5 websites', 'Custom domain', 'Advanced SEO', 'Analytics'],
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

// Gradient string reused throughout
const SP_GRAD = 'linear-gradient(135deg, #7C35B8 0%, #B845A2 100%)'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [typeIndex, setTypeIndex] = useState(0)

  useEffect(() => {
    checkAuthAndRedirect()
    const timeout = setTimeout(() => setCheckingAuth(false), 3000)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTypeIndex(prev => (prev + 1) % BUSINESS_TYPES.length)
    }, 2600)
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
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-40"
              style={{ background: SP_GRAD }}
            />
            <Sparkles className="w-12 h-12 relative z-10 animate-pulse" style={{ color: '#7C35B8' }} />
          </div>
          <p className="text-gray-400 text-sm">Loading…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-gray-900" id="main-content">
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      <Header light />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        aria-label="Hero"
        className="relative overflow-hidden pt-32 pb-24 sm:pb-36 px-6"
        style={{ background: 'linear-gradient(180deg, #FDF5FB 0%, #ffffff 100%)' }}
      >
        {/* Soft decorative orbs */}
        <div aria-hidden="true" className="absolute inset-0 -z-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(ellipse, #B845A2 0%, transparent 65%)' }}
          />
          <div
            className="absolute top-60 -left-32 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
            style={{ background: 'radial-gradient(ellipse, #7C35B8 0%, transparent 65%)' }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(ellipse, #FAD8F0 0%, transparent 65%)' }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 mb-8"
            style={{ borderColor: 'rgba(124,53,184,0.25)', background: 'rgba(124,53,184,0.06)' }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                style={{ backgroundColor: '#B845A2' }}
              />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#B845A2' }} />
            </span>
            <span className="text-sm font-medium" style={{ color: '#7C35B8' }}>
              Now powered by GPT-4o — smarter than ever
            </span>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: '#B845A2' }} />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.06] mb-6 text-gray-900"
          >
            Instant websites for{' '}
            <br className="hidden sm:block" />
            <span
              key={typeIndex}
              className="animate-fade-in inline-block bg-clip-text text-transparent"
              style={{ backgroundImage: SP_GRAD }}
            >
              {BUSINESS_TYPES[typeIndex].icon} {BUSINESS_TYPES[typeIndex].label}
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Tell Spinupfy what you're running. Our AI writes the copy, picks the design, and
            publishes a stunning website — in under 60 seconds. No code. No designers. No hassle.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14"
          >
            <Link
              href="/create"
              className="group shine-effect inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-lg transition-all duration-300"
              style={{ background: SP_GRAD, boxShadow: '0 8px 32px rgba(124,53,184,0.35)' }}
            >
              <Sparkles className="w-5 h-5" />
              Build My Website Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-gray-700 bg-white border border-gray-200 hover:border-purple-300 hover:text-purple-700 transition-all duration-300 shadow-sm"
            >
              See How It Works
            </Link>
          </motion.div>

          {/* Social proof */}
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
                    className="w-7 h-7 rounded-full bg-purple-50 border-2 border-white flex items-center justify-center text-sm shadow-sm"
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
              <Clock className="w-4 h-4" style={{ color: '#B845A2' }} />
              <span>
                Average build: <strong style={{ color: '#7C35B8' }}>58 seconds</strong>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── USE CASES STRIP ──────────────────────────────────────── */}
      <section
        aria-label="What you can build"
        className="py-16 px-6 border-y border-gray-100 bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-10">
            Perfect for every event, business & pop-up
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center text-center p-5 rounded-2xl bg-gray-50 hover:bg-purple-50 border border-transparent hover:border-purple-100 transition-all duration-200 group"
              >
                <span className="text-3xl mb-3">{uc.icon}</span>
                <span className="text-sm font-semibold text-gray-800 group-hover:text-purple-800">{uc.title}</span>
                <span className="text-xs text-gray-400 mt-1">{uc.desc}</span>
              </motion.div>
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
      <section id="features" aria-label="Features" className="py-24 md:py-32 px-6 bg-white">
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
              className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
            >
              Powerful features.{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: SP_GRAD }}>
                Zero complexity.
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-500 max-w-2xl mx-auto"
            >
              Everything a professional web agency would build, delivered in seconds by AI.
            </motion.p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Wide — AI Builder */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 rounded-3xl p-8 hover-lift border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(124,53,184,0.1)' }}
              >
                <Wand2 className="w-7 h-7" style={{ color: '#7C35B8' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Website Builder</h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Describe your event or business in plain English. Our AI crafts a complete
                website — pages, copy, images, and layout — in under 60 seconds. No templates
                to wrestle with.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Auto-generated copy', 'Event templates', 'Smart layout AI', 'Image generation'].map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium border"
                    style={{ background: 'rgba(124,53,184,0.07)', borderColor: 'rgba(124,53,184,0.2)', color: '#7C35B8' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Event & Booking */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="rounded-3xl p-8 hover-lift border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(184,69,162,0.1)' }}>
                <Calendar className="w-7 h-7" style={{ color: '#B845A2' }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Event & Booking Pages</h3>
              <p className="text-gray-500 leading-relaxed">
                Dedicated landing pages for pop-ups, conferences, and events — with registration
                forms, ticket links, and schedules built in.
              </p>
            </motion.div>

            {/* Smart Design */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl p-8 hover-lift border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(155,53,176,0.1)' }}>
                <Palette className="w-7 h-7" style={{ color: '#9B35B0' }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Design System</h3>
              <p className="text-gray-500 leading-relaxed">
                AI picks the perfect colour palette, typography, and layout to match your brand
                and event vibe.
              </p>
            </motion.div>

            {/* SEO */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="rounded-3xl p-8 hover-lift border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(212,110,188,0.1)' }}>
                <BarChart3 className="w-7 h-7" style={{ color: '#D46EBC' }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Built-in SEO</h3>
              <p className="text-gray-500 leading-relaxed">
                Meta tags, structured data, sitemaps, and page-speed optimisation — so attendees
                and customers can find you on Google.
              </p>
            </motion.div>

            {/* Publishing */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl p-8 hover-lift border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(124,53,184,0.1)' }}>
                <Rocket className="w-7 h-7" style={{ color: '#7C35B8' }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Publishing</h3>
              <p className="text-gray-500 leading-relaxed">
                Go live on a free subdomain instantly, or connect your own domain in one click.
                SSL included. Share in minutes.
              </p>
            </motion.div>

            {/* Security — wide */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="md:col-span-2 rounded-3xl p-8 hover-lift border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(184,69,162,0.1)' }}>
                  <ShieldCheck className="w-7 h-7" style={{ color: '#B845A2' }} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Enterprise-Grade Security</h3>
                <p className="text-gray-500 leading-relaxed mb-4">
                  SSL, DDoS protection, automatic backups, and a 99.9% uptime SLA — so your event
                  or shop page is always live when people need it most.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['99.9% Uptime', 'SSL Included', 'DDoS Protection', 'Auto Backups', 'GDPR Ready'].map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium border"
                      style={{ background: 'rgba(184,69,162,0.07)', borderColor: 'rgba(184,69,162,0.2)', color: '#B845A2' }}
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
              className="rounded-3xl p-8 hover-lift border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(155,53,176,0.1)' }}>
                <Layers className="w-7 h-7" style={{ color: '#9B35B0' }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Visual Editor</h3>
              <p className="text-gray-500 leading-relaxed">
                Fine-tune any element with our drag-and-drop editor. Change colours, text, images
                — all updates in real-time.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── VIDEO DEMO ───────────────────────────────────────────── */}
      <VideoDemoSection />

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section
        aria-label="Customer testimonials"
        className="py-24 md:py-32 px-6"
        style={{ background: 'linear-gradient(180deg, #FDF5FB 0%, #ffffff 100%)' }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
            >
              Loved by{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: SP_GRAD }}>
                10,000+
              </span>{' '}
              businesses
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-xl text-gray-500"
            >
              Real results from real event organisers and business owners
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
                className="bg-white rounded-3xl p-8 hover-lift flex flex-col border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-gray-600 leading-relaxed mb-6 flex-1 text-[15px]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 border border-gray-100"
                    style={{ background: 'rgba(124,53,184,0.06)' }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ───────────────────────────────────────── */}
      <section aria-label="Pricing" className="py-24 md:py-32 px-6 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
            >
              Simple, transparent{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: SP_GRAD }}>
                pricing
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-xl text-gray-500"
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
                className={`relative rounded-3xl p-8 flex flex-col border shadow-sm ${
                  plan.popular
                    ? 'border-2 shadow-lg'
                    : 'border-gray-100 bg-white hover:shadow-md transition-shadow'
                }`}
                style={plan.popular ? {
                  background: 'linear-gradient(180deg, #FAE8F5 0%, #ffffff 100%)',
                  borderColor: '#7C35B8',
                } : {}}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold"
                    style={{ background: SP_GRAD }}
                  >
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-400 text-sm">{plan.period}</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#7C35B8' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300 shine-effect ${
                    plan.popular ? 'text-white' : 'text-gray-700 border border-gray-200 bg-white hover:border-purple-300 hover:text-purple-700'
                  }`}
                  style={plan.popular ? { background: SP_GRAD, boxShadow: '0 4px 20px rgba(124,53,184,0.3)' } : {}}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/pricing"
              className="text-sm font-medium inline-flex items-center gap-1 transition-colors hover:opacity-70"
              style={{ color: '#7C35B8' }}
            >
              View full pricing details <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section aria-label="Get started" className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center"
            style={{ background: SP_GRAD }}
          >
            {/* Dot pattern */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)',
                backgroundSize: '28px 28px',
              }}
            />
            <div className="relative z-10">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">No credit card required</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                Your website is<br />58 seconds away
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
                Join 10,000+ event organisers and business owners who launched with Spinupfy today.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-10 py-5 bg-white rounded-xl font-bold text-lg transition-all duration-300 hover:bg-purple-50 shine-effect"
                style={{ color: '#5B1E90', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}
              >
                <Sparkles className="w-5 h-5" />
                Build My Website Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-white/55 text-sm mt-6">
                Free forever plan · No setup fees · Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
