'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface SubMenuItem {
  label: string
  href: string
}

interface MenuItem {
  label: string
  href: string
  children?: SubMenuItem[]
}

interface HeaderSectionProps {
  content: {
    logo?: string
    brandName?: string
    menuItems?: MenuItem[]
    ctaText?: string
    ctaHref?: string
  }
  editable?: boolean
  onEdit?: () => void
}

export function HeaderSection({ content, editable, onEdit }: HeaderSectionProps) {
  const {
    logo,
    brandName = 'Your Brand',
    menuItems = [],
    ctaText = 'Get Started',
    ctaHref = '#contact',
  } = content

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [mobileOpenDropdowns, setMobileOpenDropdowns] = useState<number[]>([])
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle Escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (openDropdown !== null) {
          setOpenDropdown(null)
        } else if (mobileMenuOpen) {
          setMobileMenuOpen(false)
          menuButtonRef.current?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileMenuOpen, openDropdown])

  // Focus first menu item when menu opens
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      const firstLink = mobileMenuRef.current.querySelector('a')
      firstLink?.focus()
    }
  }, [mobileMenuOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openDropdown !== null) {
        const target = e.target as HTMLElement
        if (!target.closest('.dropdown-container')) {
          setOpenDropdown(null)
        }
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openDropdown])

  const handleDropdownEnter = (index: number) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
    }
    setOpenDropdown(index)
  }

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null)
    }, 150)
  }

  const toggleMobileDropdown = (index: number) => {
    setMobileOpenDropdowns(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 ${
        editable ? 'cursor-pointer hover:ring-2 hover:ring-primary-500/50' : ''
      }`}
      onClick={editable ? onEdit : undefined}
    >
      <nav className="max-w-7xl mx-auto px-6 py-[2px]" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          {/* Logo - Left Side - Enlarged to fill header with 2px padding */}
          <div className="flex items-center gap-3">
            {logo && (
              <img
                src={logo}
                alt={`${brandName} logo`}
                className="h-16 w-auto object-contain"
              />
            )}
            <span className="text-xl font-bold text-white">{brandName}</span>
          </div>

          {/* Desktop Menu - Right Side */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="relative dropdown-container"
                onMouseEnter={() => item.children?.length ? handleDropdownEnter(index) : undefined}
                onMouseLeave={handleDropdownLeave}
              >
                {item.children && item.children.length > 0 ? (
                  // Menu item with dropdown
                  <>
                    <button
                      className="flex items-center gap-1 px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (editable) return
                        setOpenDropdown(openDropdown === index ? null : index)
                      }}
                      aria-expanded={openDropdown === index}
                      aria-haspopup="true"
                    >
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === index ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {openDropdown === index && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 py-2 bg-gray-800 rounded-xl shadow-xl border border-gray-700 min-w-[200px] z-50"
                          role="menu"
                        >
                          {item.children.map((child, childIndex) => (
                            <Link
                              key={childIndex}
                              href={child.href}
                              className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                              role="menuitem"
                              onClick={(e) => {
                                if (editable) e.preventDefault()
                                setOpenDropdown(null)
                              }}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  // Regular menu item
                  <Link
                    href={item.href}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    onClick={(e) => editable && e.preventDefault()}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            {ctaText && (
              <Link
                href={ctaHref}
                className="ml-4 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-lg font-semibold text-white transition-colors"
                onClick={(e) => editable && e.preventDefault()}
              >
                {ctaText}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            onClick={(e) => {
              e.stopPropagation()
              setMobileMenuOpen(!mobileMenuOpen)
            }}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              id="mobile-navigation-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-gray-800 overflow-hidden"
              role="menu"
              aria-label="Mobile navigation menu"
            >
              <div className="flex flex-col gap-1">
                {menuItems.map((item, index) => (
                  <div key={index}>
                    {item.children && item.children.length > 0 ? (
                      // Mobile dropdown
                      <>
                        <button
                          className="flex items-center justify-between w-full text-gray-300 hover:text-white transition-colors py-3 px-2 rounded-lg hover:bg-white/5"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!editable) toggleMobileDropdown(index)
                          }}
                          role="menuitem"
                          aria-expanded={mobileOpenDropdowns.includes(index)}
                        >
                          {item.label}
                          <ChevronDown className={`w-4 h-4 transition-transform ${mobileOpenDropdowns.includes(index) ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {mobileOpenDropdowns.includes(index) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pl-4 overflow-hidden"
                            >
                              {item.children.map((child, childIndex) => (
                                <Link
                                  key={childIndex}
                                  href={child.href}
                                  className="block text-gray-400 hover:text-white transition-colors py-2.5 px-2 rounded-lg hover:bg-white/5"
                                  role="menuitem"
                                  onClick={(e) => {
                                    if (editable) e.preventDefault()
                                    setMobileMenuOpen(false)
                                  }}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      // Regular mobile menu item
                      <Link
                        href={item.href}
                        className="text-gray-300 hover:text-white transition-colors py-3 px-2 block rounded-lg hover:bg-white/5"
                        role="menuitem"
                        onClick={(e) => {
                          if (editable) e.preventDefault()
                          setMobileMenuOpen(false)
                        }}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
                {ctaText && (
                  <Link
                    href={ctaHref}
                    className="mt-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg font-semibold text-white transition-colors text-center"
                    role="menuitem"
                    onClick={(e) => {
                      if (editable) e.preventDefault()
                      setMobileMenuOpen(false)
                    }}
                  >
                    {ctaText}
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
