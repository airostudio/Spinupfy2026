'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Flame, Leaf, Wheat, Star, ChefHat } from 'lucide-react'

interface MenuItem {
  name: string
  description: string
  price: number | string
  image?: string
  tags?: string[]
}

interface MenuCategory {
  name: string
  description?: string
  items: MenuItem[]
}

interface MenuSectionProps {
  content: {
    title?: string
    subtitle?: string
    categories: MenuCategory[]
    chefNote?: string
    dietaryInfo?: string
  }
  settings?: {
    layout?: 'categories' | 'grid' | 'list'
    showPrices?: boolean
    showImages?: boolean
    showTags?: boolean
    theme?: 'light' | 'dark'
  }
  editable?: boolean
  onEdit?: () => void
}

const tagIcons: Record<string, { icon: React.ElementType; color: string }> = {
  vegetarian: { icon: Leaf, color: 'text-green-500' },
  vegan: { icon: Leaf, color: 'text-green-600' },
  'gluten-free': { icon: Wheat, color: 'text-amber-500' },
  spicy: { icon: Flame, color: 'text-red-500' },
  popular: { icon: Star, color: 'text-yellow-500' },
  "chef's special": { icon: ChefHat, color: 'text-cyan-500' },
}

export function MenuSection({ content, settings, editable, onEdit }: MenuSectionProps) {
  const {
    title = 'Our Menu',
    subtitle,
    categories = [],
    chefNote,
    dietaryInfo,
  } = content

  const {
    layout = 'categories',
    showPrices = true,
    showImages = true,
    showTags = true,
    theme = 'light',
  } = settings || {}

  const [activeCategory, setActiveCategory] = useState(0)

  const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-white'
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const mutedClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const cardBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'

  const formatPrice = (price: number | string) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`
    }
    return price.startsWith('$') ? price : `$${price}`
  }

  return (
    <section
      className={`relative py-20 ${bgClass} overflow-hidden`}
      onClick={editable ? onEdit : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-4`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`text-xl ${mutedClass} leading-relaxed`}>
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Category Navigation */}
        {categories.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveCategory(index)
                }}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeCategory === index
                    ? 'bg-primary-500 text-white shadow-lg'
                    : `${cardBgClass} ${textClass} hover:bg-primary-100 hover:text-primary-700`
                }`}
              >
                {category.name}
              </button>
            ))}
          </motion.div>
        )}

        {/* Menu Items */}
        <AnimatePresence mode="wait">
          {categories.map((category, catIndex) => (
            catIndex === activeCategory && (
              <motion.div
                key={catIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Category Description */}
                {category.description && (
                  <p className={`text-center ${mutedClass} mb-8 max-w-2xl mx-auto`}>
                    {category.description}
                  </p>
                )}

                {/* Items Grid */}
                <div className={`grid gap-6 ${
                  showImages ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'
                }`}>
                  {category.items.map((item, itemIndex) => (
                    <motion.div
                      key={itemIndex}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: itemIndex * 0.05, duration: 0.4 }}
                      className={`rounded-2xl overflow-hidden border ${borderClass} ${cardBgClass} hover:shadow-xl transition-all group`}
                    >
                      {/* Item Image */}
                      {showImages && item.image && (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Tags Overlay */}
                          {showTags && item.tags && item.tags.length > 0 && (
                            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                              {item.tags.slice(0, 3).map((tag, tagIndex) => {
                                const tagConfig = tagIcons[tag.toLowerCase()]
                                const Icon = tagConfig?.icon
                                return (
                                  <span
                                    key={tagIndex}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm ${tagConfig?.color || 'text-gray-600'}`}
                                  >
                                    {Icon && <Icon className="w-3 h-3" />}
                                    <span className="capitalize">{tag}</span>
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Item Content */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`text-xl font-bold ${textClass} flex-1`}>
                            {item.name}
                          </h3>
                          {showPrices && (
                            <span className="text-primary-500 font-bold text-xl ml-4">
                              {formatPrice(item.price)}
                            </span>
                          )}
                        </div>

                        <p className={`${mutedClass} text-sm leading-relaxed`}>
                          {item.description}
                        </p>

                        {/* Tags (when no image) */}
                        {showTags && !showImages && item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.tags.map((tag, tagIndex) => {
                              const tagConfig = tagIcons[tag.toLowerCase()]
                              const Icon = tagConfig?.icon
                              return (
                                <span
                                  key={tagIndex}
                                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} ${tagConfig?.color || mutedClass}`}
                                >
                                  {Icon && <Icon className="w-3 h-3" />}
                                  <span className="capitalize">{tag}</span>
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Chef's Note */}
        {chefNote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`mt-16 p-8 rounded-2xl ${cardBgClass} border ${borderClass} text-center max-w-3xl mx-auto`}
          >
            <ChefHat className={`w-10 h-10 mx-auto mb-4 ${theme === 'dark' ? 'text-primary-400' : 'text-primary-500'}`} />
            <p className={`text-lg italic ${mutedClass}`}>
              &ldquo;{chefNote}&rdquo;
            </p>
            <p className={`mt-3 font-semibold ${textClass}`}>
              - The Chef
            </p>
          </motion.div>
        )}

        {/* Dietary Info */}
        {dietaryInfo && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={`mt-8 text-center text-sm ${mutedClass}`}
          >
            {dietaryInfo}
          </motion.p>
        )}
      </div>
    </section>
  )
}

export default MenuSection
