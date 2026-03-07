'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { DNSConfiguration } from '@/components/dns/DNSConfiguration'
import { supabase } from '@/lib/supabase'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'
import Link from 'next/link'

export default function DNSSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userDomain, setUserDomain] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  async function loadUserData() {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login')
        return
      }

      // Try to get user's custom domain from their websites
      const { data: websites } = await supabase
        .from('websites')
        .select('custom_domain')
        .eq('user_id', authUser.id)
        .not('custom_domain', 'is', null)
        .limit(1)

      if (websites && websites.length > 0 && websites[0].custom_domain) {
        setUserDomain(websites[0].custom_domain)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading DNS settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Back Button */}
        <Link href="/settings">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="mb-6"
          >
            Back to Settings
          </Button>
        </Link>

        {/* DNS Configuration */}
        <DNSConfiguration domain={userDomain || undefined} showHeader={true} />
      </main>
    </div>
  )
}
