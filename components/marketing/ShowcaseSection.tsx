'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Check } from 'lucide-react'

const showcaseWebsites = [
  {
    id: 'apex-realty',
    name: 'The Apex',
    businessType: 'Luxury Real Estate',
    description: 'A 4,200 sq ft crown jewel on the 55th floor. Unobstructed 360° skyline views, private terrace, and bespoke finishes throughout.',
    colors: { primary: '#0d0d0d', accent: '#c9a84c' },
    stats: { buildTime: '2 minutes', sections: 6 },
    screenshot: '/samples/apex-realty.png',
    features: ['Private Viewing Booking', 'Property Gallery', 'Agent Contact']
  },
  {
    id: 'prestige-estates',
    name: 'PRESTIGE',
    businessType: 'Luxury Real Estate',
    description: 'Exclusive luxury estates from $6M to $10M in the world\'s most prestigious locations',
    colors: { primary: '#1a1a2e', accent: '#ffd700' },
    stats: { buildTime: '3 minutes', sections: 6 },
    screenshot: '/samples/prestige-real-estate.png',
    features: ['Property Gallery', 'Virtual Tours', 'Private Consultation']
  },
  {
    id: 'artisan-bakery',
    name: 'Artisan Bakery',
    businessType: 'Artisan Bakery',
    description: 'Handcrafted breads, pastries, and desserts baked fresh daily with the finest ingredients',
    colors: { primary: '#8B4513', accent: '#FF8C42' },
    stats: { buildTime: '2 minutes', sections: 5 },
    screenshot: '/samples/artisan-bakery.png',
    features: ['Menu Display', 'Online Ordering', 'Catering Services']
  },
  {
    id: 'pawfect-grooming',
    name: 'PawfectGrooming',
    businessType: 'Pet Grooming Services',
    description: 'Professional grooming services with love and care. Making tails wag since 2015',
    colors: { primary: '#20b2aa', accent: '#ff6b6b' },
    stats: { buildTime: '3 minutes', sections: 6 },
    screenshot: '/samples/pawfect-grooming.png',
    features: ['Service Bookings', 'Pet Care Tips', 'Testimonials']
  }
]

export function ShowcaseSection() {
  const [selectedWebsite, setSelectedWebsite] = useState(showcaseWebsites[0])

  return (
    <section className="py-24 md:py-32 bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            See What&apos;s Possible
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Real websites built with our AI in minutes
          </motion.p>
        </div>

        {/* Website Selector */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {showcaseWebsites.map((website) => (
            <button
              key={website.id}
              onClick={() => setSelectedWebsite(website)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedWebsite.id === website.id
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {website.name}
            </button>
          ))}
        </div>

        {/* Website Preview */}
        <motion.div
          key={selectedWebsite.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Browser Chrome Mockup */}
          <div className="bg-gray-900 flex items-center px-4 gap-2 h-9 border-b border-gray-700">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 text-center text-xs text-gray-400">
              {selectedWebsite.name}
            </div>
          </div>

          {/* Screenshot Preview — scrollable to show full-length pages */}
          <div className="w-full h-[480px] overflow-y-auto bg-white">
            <Image
              src={selectedWebsite.screenshot}
              alt={`${selectedWebsite.name} website preview`}
              width={1200}
              height={3000}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* Website Details */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedWebsite.name}</h3>
                <p className="text-gray-400">{selectedWebsite.businessType}</p>
              </div>
              <div className="flex gap-4">
                <div
                  className="w-12 h-12 rounded-full border-2 border-gray-700"
                  style={{ backgroundColor: selectedWebsite.colors.primary }}
                />
                <div
                  className="w-12 h-12 rounded-full border-2 border-gray-700"
                  style={{ backgroundColor: selectedWebsite.colors.accent }}
                />
              </div>
            </div>
            <p className="text-gray-300 mb-6">{selectedWebsite.description}</p>

            {/* Features */}
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-3">Key Features</div>
              <div className="flex flex-wrap gap-2">
                {selectedWebsite.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-sm flex items-center gap-2"
                  >
                    <Check className="w-3 h-3 text-green-400" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm border-t border-gray-700 pt-6">
              <div>
                <div className="text-gray-400">Build Time</div>
                <div className="text-white font-semibold">{selectedWebsite.stats.buildTime}</div>
              </div>
              <div>
                <div className="text-gray-400">Sections</div>
                <div className="text-white font-semibold">{selectedWebsite.stats.sections}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
          <div className="text-center p-6 bg-gray-800/50 rounded-xl">
            <div className="text-3xl font-bold text-white mb-2">100%</div>
            <div className="text-sm text-gray-400">AI Generated</div>
          </div>
          <div className="text-center p-6 bg-gray-800/50 rounded-xl">
            <div className="text-3xl font-bold text-white mb-2">3 min</div>
            <div className="text-sm text-gray-400">Average Build</div>
          </div>
          <div className="text-center p-6 bg-gray-800/50 rounded-xl">
            <div className="text-3xl font-bold text-white mb-2">100%</div>
            <div className="text-sm text-gray-400">Responsive</div>
          </div>
        </div>
      </div>
    </section>
  )
}
