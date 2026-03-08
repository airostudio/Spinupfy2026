'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { Sparkles, Loader2 } from 'lucide-react'

const SP_GRAD = 'linear-gradient(135deg, #7C35B8 0%, #B845A2 100%)'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/create`,
          },
        })
        if (error) throw error
        toast.success('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Welcome back!')
        router.push('/create')
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white relative overflow-hidden">
      {/* Decorative orbs — same as main page */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(ellipse, #B845A2 0%, transparent 65%)' }}
      />
      <div
        className="pointer-events-none absolute top-0 left-0 w-[350px] h-[350px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse, #7C35B8 0%, transparent 65%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-8"
        style={{ background: 'radial-gradient(ellipse, #FAD8F0 0%, transparent 65%)' }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo / heading */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: SP_GRAD }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900">AI Website Builder</span>
          </Link>

          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-gray-500">
            {isSignUp
              ? 'Start building your website in minutes'
              : 'Sign in to continue building'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-spinupfy-700/5 p-8">
          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-spinupfy-700 focus:ring-2 focus:ring-spinupfy-700/15 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={11}
                aria-describedby="password-requirements"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-spinupfy-700 focus:ring-2 focus:ring-spinupfy-700/15 transition-all"
                placeholder="••••••••••••"
              />
              <p id="password-requirements" className="mt-1.5 text-xs text-gray-400">
                Minimum 11 characters required
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-spinupfy-700/25 hover:shadow-spinupfy-700/40 hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: SP_GRAD }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-medium text-spinupfy-700 hover:text-spinupfy-800 transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>

            <div>
              <Link href="/" className="text-sm text-gray-400 hover:text-gray-500 transition-colors">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
