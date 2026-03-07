'use client'

import { useState } from 'react'
import { X, Plus, FileText, UserPlus, MessageSquare, Calendar, ClipboardList, ShoppingCart, CreditCard, Mail, FileQuestion, LifeBuoy, Layout, Users, Briefcase, Star, Phone, DollarSign, Image, Calculator } from 'lucide-react'
import { FormTemplateSelector, FormTemplate, formTemplates } from '@/components/forms'

export interface SectionType {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'content' | 'interactive' | 'forms' | 'commerce'
  type: string // Database section type
  isForm?: boolean
}

interface AddSectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddSection: (sectionType: string, formTemplate?: FormTemplate) => void
}

// Available section types
export const sectionTypes: SectionType[] = [
  // Content Sections
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Large banner with headline and call-to-action',
    icon: Layout,
    category: 'content',
    type: 'HERO'
  },
  {
    id: 'features',
    name: 'Features',
    description: 'Showcase your product or service features',
    icon: Star,
    category: 'content',
    type: 'FEATURES'
  },
  {
    id: 'about',
    name: 'About',
    description: 'Tell your story and company background',
    icon: Briefcase,
    category: 'content',
    type: 'ABOUT'
  },
  {
    id: 'team',
    name: 'Team',
    description: 'Introduce your team members',
    icon: Users,
    category: 'content',
    type: 'TEAM'
  },
  {
    id: 'services',
    name: 'Services',
    description: 'List your services or offerings',
    icon: Briefcase,
    category: 'content',
    type: 'SERVICES'
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    description: 'Display customer reviews and feedback',
    icon: Star,
    category: 'content',
    type: 'TESTIMONIALS'
  },
  {
    id: 'cta',
    name: 'Call to Action',
    description: 'Encourage visitors to take action',
    icon: Plus,
    category: 'content',
    type: 'CTA'
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Image gallery or portfolio',
    icon: Image,
    category: 'content',
    type: 'GALLERY'
  },

  // Interactive Sections
  {
    id: 'contact',
    name: 'Contact',
    description: 'Simple contact information and form',
    icon: Phone,
    category: 'interactive',
    type: 'CONTACT'
  },
  {
    id: 'booking',
    name: 'Booking',
    description: 'Appointment or reservation system',
    icon: Calendar,
    category: 'interactive',
    type: 'BOOKING'
  },
  {
    id: 'calculator',
    name: 'Loan Calculator',
    description: 'Financial calculator for loans and mortgages',
    icon: Calculator,
    category: 'interactive',
    type: 'LOAN_CALCULATOR'
  },

  // Commerce Sections
  {
    id: 'pricing',
    name: 'Pricing',
    description: 'Display pricing plans and packages',
    icon: DollarSign,
    category: 'commerce',
    type: 'PRICING'
  },
  {
    id: 'store',
    name: 'Store',
    description: 'Product catalog and e-commerce',
    icon: ShoppingCart,
    category: 'commerce',
    type: 'STORE'
  },

  // Form Templates
  {
    id: 'form-contact',
    name: 'Contact Form',
    description: 'Simple contact form for inquiries',
    icon: FileText,
    category: 'forms',
    type: 'FORM',
    isForm: true
  },
  {
    id: 'form-registration',
    name: 'Event Registration',
    description: 'Register attendees for events',
    icon: UserPlus,
    category: 'forms',
    type: 'FORM',
    isForm: true
  },
  {
    id: 'form-feedback',
    name: 'Feedback Survey',
    description: 'Collect customer feedback',
    icon: MessageSquare,
    category: 'forms',
    type: 'FORM',
    isForm: true
  },
  {
    id: 'form-appointment',
    name: 'Appointment Booking',
    description: 'Schedule appointments',
    icon: Calendar,
    category: 'forms',
    type: 'FORM',
    isForm: true
  },
  {
    id: 'form-application',
    name: 'Job Application',
    description: 'Accept job applications',
    icon: ClipboardList,
    category: 'forms',
    type: 'FORM',
    isForm: true
  },
  {
    id: 'form-order',
    name: 'Order Form',
    description: 'Product order and shipping',
    icon: ShoppingCart,
    category: 'forms',
    type: 'FORM',
    isForm: true
  },
  {
    id: 'form-payment',
    name: 'Payment Form',
    description: 'Collect payment information',
    icon: CreditCard,
    category: 'forms',
    type: 'FORM',
    isForm: true
  },
  {
    id: 'form-newsletter',
    name: 'Newsletter Signup',
    description: 'Email list subscription',
    icon: Mail,
    category: 'forms',
    type: 'FORM',
    isForm: true
  },
  {
    id: 'form-quote',
    name: 'Quote Request',
    description: 'Get project details for quotes',
    icon: FileQuestion,
    category: 'forms',
    type: 'FORM',
    isForm: true
  },
  {
    id: 'form-support',
    name: 'Support Ticket',
    description: 'Customer support system',
    icon: LifeBuoy,
    category: 'forms',
    type: 'FORM',
    isForm: true
  }
]

export function AddSectionDialog({ isOpen, onClose, onAddSection }: AddSectionDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showFormSelector, setShowFormSelector] = useState(false)
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)

  if (!isOpen && !showFormSelector) return null

  const categories = [
    { id: 'all', label: 'All Sections' },
    { id: 'content', label: 'Content' },
    { id: 'interactive', label: 'Interactive' },
    { id: 'forms', label: 'Forms' },
    { id: 'commerce', label: 'Commerce' }
  ]

  const filteredSections = selectedCategory === 'all'
    ? sectionTypes
    : sectionTypes.filter(s => s.category === selectedCategory)

  const handleSectionClick = (section: SectionType) => {
    if (section.isForm) {
      // Show form template selector
      setShowFormSelector(true)
    } else {
      // Add regular section
      onAddSection(section.type)
      onClose()
    }
  }

  const handleFormTemplateSelect = (template: FormTemplate) => {
    onAddSection('FORM', template)
    setShowFormSelector(false)
    onClose()
  }

  // If showing form selector, render that instead
  if (showFormSelector) {
    return (
      <FormTemplateSelector
        isOpen={true}
        onClose={() => {
          setShowFormSelector(false)
          // Don't close main dialog, let user go back
        }}
        onSelect={handleFormTemplateSelect}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div
        className="w-full max-w-6xl max-h-[90vh] rounded-2xl border-2 shadow-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderColor: 'var(--color-border)'
        }}
      >
        {/* Header */}
        <div
          className="p-6 border-b-2 flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <h2
              className="text-3xl font-bold mb-2"
              style={{
                color: 'var(--color-text-heading)',
                fontFamily: 'var(--font-heading)'
              }}
            >
              Add a Section
            </h2>
            <p style={{ color: 'var(--color-text-body)' }}>
              Choose from content blocks, interactive features, and professional forms
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[var(--color-text-body)]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Category Filter */}
        <div
          className="p-4 border-b-2 overflow-x-auto"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex gap-2 min-w-max">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'shadow-md'
                    : 'hover:bg-white/5'
                }`}
                style={{
                  backgroundColor: selectedCategory === category.id
                    ? 'var(--color-primary)'
                    : 'var(--color-bg-card)',
                  color: selectedCategory === category.id
                    ? '#ffffff'
                    : 'var(--color-text-body)',
                  borderWidth: '2px',
                  borderColor: selectedCategory === category.id
                    ? 'var(--color-primary)'
                    : 'var(--color-border)'
                }}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sections Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSections.map(section => {
              const Icon = section.icon
              return (
                <div
                  key={section.id}
                  className="p-6 rounded-2xl border-2 cursor-pointer transition-all"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: hoveredSection === section.id
                      ? 'var(--color-primary)'
                      : 'var(--color-border)',
                    transform: hoveredSection === section.id ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: hoveredSection === section.id
                      ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                      : 'none'
                  }}
                  onMouseEnter={() => setHoveredSection(section.id)}
                  onMouseLeave={() => setHoveredSection(null)}
                  onClick={() => handleSectionClick(section)}
                >
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: hoveredSection === section.id
                        ? 'var(--color-primary)'
                        : 'var(--color-bg-muted)'
                    }}
                  >
                    <Icon
                      className={`w-7 h-7 ${
                        hoveredSection === section.id
                          ? 'text-white'
                          : 'text-[var(--color-primary)]'
                      }`}
                    />
                  </div>

                  {/* Name */}
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{
                      color: 'var(--color-text-heading)',
                      fontFamily: 'var(--font-heading)'
                    }}
                  >
                    {section.name}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-sm"
                    style={{ color: 'var(--color-text-body)' }}
                  >
                    {section.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
