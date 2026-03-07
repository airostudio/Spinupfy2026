'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Zap, Palette } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { ShowcaseSection, HowItWorksSection, VideoDemoSection } from '@/components/marketing'
import { createClient } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuthAndRedirect()

    // Fallback: ensure page shows after 3 seconds even if auth check fails
    const timeout = setTimeout(() => {
      setCheckingAuth(false)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [])

  async function checkAuthAndRedirect() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // User is logged in, redirect to dashboard
        router.push('/dashboard')
        return // Don't set checkingAuth to false, we're redirecting
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    }
    setCheckingAuth(false)
  }

  // Show loading state while checking auth
  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 pt-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-500/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm">Powered by AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Build a Beautiful Website in{' '}
            <span className="text-gradient">Seconds</span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Just tell us what you do — AI designs everything for you. From logos to layouts, we handle it all.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-xl font-semibold transition-colors glow"
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 glass hover:bg-white/20 rounded-xl font-semibold transition-colors"
            >
              See How It Works
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-gradient">10K+</div>
              <div className="text-sm text-gray-400">Websites Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient">30 sec</div>
              <div className="text-sm text-gray-400">Average Build Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient">4.9/5</div>
              <div className="text-sm text-gray-400">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section - Examples of AI-Generated Websites */}
      <ShowcaseSection />

      {/* How It Works Section - Step-by-step process */}
      <HowItWorksSection />

      {/* Video Demo Section - Watch it in action */}
      <VideoDemoSection />

      {/* Features Section */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Powerful Features, <span className="text-gradient">Zero Complexity</span>
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to create a professional website
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-2xl">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Content</h3>
              <p className="text-gray-400">
                Generate professional copy, headlines, and descriptions tailored to your business.
              </p>
            </div>

            <div className="glass p-8 rounded-2xl">
              <div className="w-12 h-12 bg-accent-500/20 rounded-xl flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-accent-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Logo Generator</h3>
              <p className="text-gray-400">
                Create unique, professional logos with AI in multiple styles and variations.
              </p>
            </div>

            <div className="glass p-8 rounded-2xl">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">
                Go from idea to published website in under a minute. No waiting, no hassle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
