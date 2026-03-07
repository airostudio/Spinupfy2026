'use client'

import { useState } from 'react'
import { Card, CardContent, Button } from '@/components/ui'
import { DNS_PRESETS, getDNSPresetsByCategory, DNSPreset } from '@/lib/dns-presets'
import { DNSPresetCard } from './DNSPresetCard'
import { Globe, Mail, Search } from 'lucide-react'

interface DNSConfigurationProps {
  domain?: string
  showHeader?: boolean
}

export function DNSConfiguration({ domain, showHeader = true }: DNSConfigurationProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'email'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedPreset, setExpandedPreset] = useState<string | null>(null)

  const categories = [
    { id: 'all' as const, label: 'All Presets', icon: Globe },
    { id: 'email' as const, label: 'Email Setup', icon: Mail },
  ]

  // Filter presets
  const filteredPresets = DNS_PRESETS.filter(preset => {
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory
    const matchesSearch = searchQuery === '' ||
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.provider.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const handlePresetClick = (presetId: string) => {
    setExpandedPreset(expandedPreset === presetId ? null : presetId)
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">DNS Configuration Presets</h2>
          <p className="text-gray-400">
            Pre-configured DNS records for common services like email forwarding, domain verification, and more.
          </p>
        </div>
      )}

      {/* Custom Domain Info */}
      {domain && (
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Configuring DNS for:</p>
                <p className="text-lg font-semibold text-white">{domain}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search presets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Presets List */}
      <div className="space-y-4">
        {filteredPresets.length === 0 ? (
          <Card variant="glass">
            <CardContent className="p-12 text-center">
              <p className="text-gray-400">No DNS presets found matching your criteria.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPresets.map((preset) => (
            <DNSPresetCard
              key={preset.id}
              preset={preset}
              domain={domain}
              isExpanded={expandedPreset === preset.id}
            />
          ))
        )}
      </div>

      {/* Help Section */}
      <Card variant="glass">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Need Help?</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <p>
              <strong className="text-gray-300">Where do I add DNS records?</strong><br />
              Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and navigate to the DNS Management section.
            </p>
            <p>
              <strong className="text-gray-300">How long does DNS propagation take?</strong><br />
              DNS changes typically take 1-24 hours to propagate, but can take up to 48 hours in some cases.
            </p>
            <p>
              <strong className="text-gray-300">Can I use multiple email services?</strong><br />
              No, you can only use one email forwarding service at a time. Adding multiple MX records from different services will cause conflicts.
            </p>
            <p>
              <strong className="text-gray-300">What if I don't have a custom domain?</strong><br />
              You can purchase a domain from registrars like GoDaddy, Namecheap, or Google Domains, then add the DNS records there.
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              💡 <strong>Pro Tip:</strong> Always backup your existing DNS records before making changes, and test thoroughly after DNS propagation is complete.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
