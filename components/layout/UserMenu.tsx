'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Settings, LogOut, ChevronDown, CreditCard, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface UserMenuProps {
  user: any
  mobile?: boolean
  isAdmin?: boolean
}

export function UserMenu({ user, mobile = false, isAdmin = false }: UserMenuProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully')
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  const handleBillingPortal = async () => {
    try {
      toast.loading('Opening billing portal...')
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success && data.url) {
        // Open Stripe customer portal in a new tab
        window.open(data.url, '_blank')
        toast.dismiss()
        toast.success('Billing portal opened')
      } else {
        toast.dismiss()
        toast.error(data.error || 'Failed to open billing portal')
      }
    } catch (error) {
      console.error('Billing portal error:', error)
      toast.dismiss()
      toast.error('Failed to open billing portal')
    }
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    const email = user?.email || ''
    return email.charAt(0).toUpperCase()
  }

  // Get display email (truncate if too long)
  const getDisplayEmail = () => {
    const email = user?.email || ''
    if (email.length > 25) {
      return email.substring(0, 22) + '...'
    }
    return email
  }

  if (mobile) {
    // Mobile version - stacked layout
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 px-3 py-2 bg-gray-800 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
            {getUserInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{getDisplayEmail()}</p>
            <p className="text-xs text-gray-400">Account</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors w-full"
        >
          <User className="w-4 h-4" />
          <span className="text-sm">Dashboard</span>
        </button>
        <button
          onClick={() => router.push('/settings')}
          className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors w-full"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </button>
        <button
          onClick={handleBillingPortal}
          className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors w-full"
        >
          <CreditCard className="w-4 h-4" />
          <span className="text-sm">Billing & Payments</span>
        </button>
        {isAdmin && (
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-3 px-3 py-2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-colors w-full"
          >
            <Shield className="w-4 h-4" />
            <span className="text-sm">Admin Dashboard</span>
          </button>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    )
  }

  // Desktop version - dropdown menu
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
          {getUserInitials()}
        </div>
        <span className="text-sm text-gray-300 max-w-[150px] truncate hidden lg:block">
          {getDisplayEmail()}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1">Personal Account</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                router.push('/dashboard')
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <User className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => {
                router.push('/settings')
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={() => {
                handleBillingPortal()
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Billing & Payments
            </button>
          </div>

          {/* Admin Link */}
          {isAdmin && (
            <div className="border-t border-gray-700 pt-2">
              <button
                onClick={() => {
                  router.push('/admin')
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </button>
            </div>
          )}

          {/* Logout */}
          <div className="border-t border-gray-700 pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
