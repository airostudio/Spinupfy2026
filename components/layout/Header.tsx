'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { UserMenu } from './UserMenu'

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('user')
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkUser()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserRole(session.user.id)
      } else {
        setUserRole('user')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserRole(session.user.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchUserRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setUserRole(data.role || 'user')
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  const handleLogoClick = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-6 py-[2px]">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center hover:opacity-90 transition-opacity py-[2px]"
          >
            <Image
              src="/spinupfy-logo.svg"
              alt="Spinupfy — AI Website Builder"
              width={200}
              height={55}
              className="h-11 md:h-12 w-auto object-contain"
              priority
            />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!loading && (
              <>
                {user ? (
                  // Logged in - show dashboard link and user menu
                  <>
                    <Link
                      href="/dashboard"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/content-writer"
                      className="transition-colors font-medium" style={{ color: '#D46EBC' }}
                    >
                      AI Writer
                    </Link>
                    {userRole === 'admin' && (
                      <Link
                        href="/admin"
                        className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
                      >
                        Admin
                      </Link>
                    )}
                    <UserMenu user={user} isAdmin={userRole === 'admin'} />
                  </>
                ) : (
                  // Not logged in - show login/signup
                  <>
                    <Link
                      href="#features"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Features
                    </Link>
                    <Link
                      href="/pricing"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Pricing
                    </Link>
                    <Link
                      href="/login"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/login"
                      className="px-6 py-2.5 rounded-lg font-semibold text-white transition-all duration-300" style={{ background: 'linear-gradient(135deg, #7C35B8 0%, #B845A2 100%)' }}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-800">
            <div className="flex flex-col gap-4">
              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="text-gray-300 hover:text-white transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/content-writer"
                        className="text-purple-400 hover:text-purple-300 transition-colors py-2 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        AI Writer
                      </Link>
                      {userRole === 'admin' && (
                        <Link
                          href="/admin"
                          className="text-orange-400 hover:text-orange-300 transition-colors py-2 font-medium"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Admin
                        </Link>
                      )}
                      <div className="border-t border-gray-800 pt-4">
                        <UserMenu user={user} mobile isAdmin={userRole === 'admin'} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="#features"
                        className="text-gray-300 hover:text-white transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Features
                      </Link>
                      <Link
                        href="/pricing"
                        className="text-gray-300 hover:text-white transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Pricing
                      </Link>
                      <Link
                        href="/login"
                        className="text-gray-300 hover:text-white transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/login"
                        className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-lg font-semibold text-white transition-colors text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
