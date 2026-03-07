'use client'

import { useState } from 'react'
import { X, Search, Star, Zap, Package, ShoppingCart, Calendar, Users, TrendingUp, Image, MessageSquare, BarChart3, CheckCircle, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { EXTRAS_CATALOG, ExtraConfig, ExtraCategory } from '@/lib/extras/extras-catalog'
import toast from 'react-hot-toast'

interface ExtrasPanelProps {
  websiteId: string
  businessType?: string
  onClose: () => void
}

const categoryIcons: Record<ExtraCategory, any> = {
  booking: Calendar,
  ecommerce: ShoppingCart,
  scheduling: Calendar,
  engagement: MessageSquare,
  media: Image,
  community: Users,
  analytics: BarChart3,
}

const categoryNames: Record<ExtraCategory, string> = {
  booking: 'Bookings & Reservations',
  ecommerce: 'E-commerce & Sales',
  scheduling: 'Scheduling & Events',
  engagement: 'Engagement & Forms',
  media: 'Media & Galleries',
  community: 'Community & Reviews',
  analytics: 'Analytics & Insights',
}

export function ExtrasPanel({ websiteId, businessType = 'general', onClose }: ExtrasPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<ExtraCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExtra, setSelectedExtra] = useState<ExtraConfig | null>(null)

  // Filter extras based on category and search
  const filteredExtras = EXTRAS_CATALOG.filter(extra => {
    const matchesCategory = selectedCategory === 'all' || extra.category === selectedCategory
    const matchesSearch = searchQuery === '' ||
      extra.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      extra.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Get recommended extras for this business type
  const recommendedExtras = EXTRAS_CATALOG
    .filter(extra => (extra.relevanceByBusinessType[businessType] || 0) >= 7)
    .sort((a, b) => (b.relevanceByBusinessType[businessType] || 0) - (a.relevanceByBusinessType[businessType] || 0))
    .slice(0, 6)

  const handleInstallExtra = (extra: ExtraConfig) => {
    setSelectedExtra(extra)
  }

  const startWizard = async () => {
    if (!selectedExtra) return

    const loadingToast = toast.loading(`Installing ${selectedExtra.name}...`)

    try {
      const response = await fetch('/api/extras/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId,
          extra: selectedExtra,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Installation failed')
      }

      toast.success(
        `${selectedExtra.name} installed! ${data.addedPages?.length || 0} pages and ${data.addedSections?.length || 0} sections added.`,
        { id: loadingToast, duration: 5000 }
      )

      // Reload the page to show changes
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Installation error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to install extra',
        { id: loadingToast }
      )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-800"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-primary-500/10 to-accent-500/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package className="w-7 h-7 text-primary-400" />
              Extras & Add-ons
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Supercharge your website with powerful features
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search extras..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ExtraCategory | 'all')}
              className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Recommended Section */}
          {selectedCategory === 'all' && searchQuery === '' && recommendedExtras.length > 0 && (
            <div className="px-6 py-5 bg-gradient-to-br from-primary-500/5 to-accent-500/5 border-b border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-white">Recommended for Your Business</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recommendedExtras.map(extra => (
                  <ExtraCard
                    key={extra.id}
                    extra={extra}
                    onInstall={handleInstallExtra}
                    recommended
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Extras */}
          <div className="px-6 py-5">
            {filteredExtras.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No extras found</h3>
                <p className="text-gray-500">Try adjusting your search or filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExtras.map(extra => (
                  <ExtraCard
                    key={extra.id}
                    extra={extra}
                    onInstall={handleInstallExtra}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedExtra && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedExtra(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-800"
              >
                {/* Detail Header */}
                <div className="px-6 py-5 border-b border-gray-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">{selectedExtra.name}</h3>
                      <p className="text-gray-400">{selectedExtra.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedExtra(null)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-4">
                    {selectedExtra.pricing.free ? (
                      <span className="text-2xl font-bold text-green-400">Free</span>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">
                          ${selectedExtra.pricing.monthlyFee}
                        </span>
                        <span className="text-gray-400">/month</span>
                        {selectedExtra.pricing.transactionFee && (
                          <span className="text-sm text-gray-500">
                            + {selectedExtra.pricing.transactionFee}% per transaction
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="px-6 py-5">
                  <h4 className="text-lg font-semibold text-white mb-3">Features Included</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedExtra.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Setup Info */}
                <div className="px-6 py-5 bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Setup Time</p>
                      <p className="text-white font-medium">{selectedExtra.wizard.estimatedSetupTime}</p>
                    </div>
                    <button
                      onClick={startWizard}
                      className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary-500/50 transition-all flex items-center gap-2"
                    >
                      Install Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function ExtraCard({ extra, onInstall, recommended = false }: { extra: ExtraConfig; onInstall: (extra: ExtraConfig) => void; recommended?: boolean }) {
  const CategoryIcon = categoryIcons[extra.category]

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-gray-800 rounded-xl p-4 border transition-all cursor-pointer hover:border-primary-500 ${
        recommended ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-gray-700'
      }`}
      onClick={() => onInstall(extra)}
    >
      {/* Icon & Title */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <CategoryIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white text-sm line-clamp-1">{extra.name}</h4>
            <p className="text-xs text-gray-400">{categoryNames[extra.category]}</p>
          </div>
        </div>
        {recommended && (
          <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{extra.description}</p>

      {/* Pricing & CTA */}
      <div className="flex items-center justify-between">
        {extra.pricing.free ? (
          <span className="text-sm font-semibold text-green-400">Free</span>
        ) : (
          <span className="text-sm font-semibold text-white">
            ${extra.pricing.monthlyFee}/mo
          </span>
        )}
        <button className="text-xs px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-1">
          Install
          <Zap className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  )
}
