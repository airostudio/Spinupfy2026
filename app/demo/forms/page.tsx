'use client'

import { useState } from 'react'
import { FormTemplateSelector, FormTemplate, formTemplates } from '@/components/forms/FormTemplateSelector'
import { FormRenderer } from '@/components/forms/FormRenderer'
import { Plus, FileText, UserPlus, MessageSquare, Calendar, ClipboardList, ShoppingCart, CreditCard, Mail, FileQuestion, LifeBuoy } from 'lucide-react'

export default function FormsDemo() {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null)

  const handleSelectTemplate = (template: FormTemplate) => {
    setSelectedTemplate(template)
    setIsSelectorOpen(false)
  }

  const handleFormSubmit = (data: Record<string, any>) => {
    console.log('Form submitted:', data)
    // In production, this would send to an API endpoint
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contact': return FileText
      case 'registration': return UserPlus
      case 'survey': return MessageSquare
      case 'booking': return Calendar
      case 'business': return ClipboardList
      case 'ecommerce': return ShoppingCart
      default: return FileText
    }
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-bold mb-4"
            style={{
              color: 'var(--color-text-heading)',
              fontFamily: 'var(--font-heading)'
            }}
          >
            Professional Form Templates
          </h1>
          <p
            className="text-xl mb-8"
            style={{ color: 'var(--color-text-body)' }}
          >
            Choose from {formTemplates.length} professionally designed form templates, inspired by Jotform
          </p>
          <button
            onClick={() => setIsSelectorOpen(true)}
            className="px-8 py-4 rounded-lg font-semibold text-white inline-flex items-center gap-2 transition-all hover:shadow-lg transform hover:scale-105"
            style={{
              backgroundColor: 'var(--color-primary)',
              fontFamily: 'var(--font-heading)'
            }}
          >
            <Plus className="w-5 h-5" />
            Choose a Form Template
          </button>
        </div>

        {/* Selected Form or Template Gallery */}
        {selectedTemplate ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-bold"
                style={{
                  color: 'var(--color-text-heading)',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                Preview: {selectedTemplate.name}
              </h2>
              <button
                onClick={() => setIsSelectorOpen(true)}
                className="px-4 py-2 rounded-lg border-2 font-medium transition-all hover:bg-white/5"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-body)'
                }}
              >
                Change Template
              </button>
            </div>
            <FormRenderer
              template={selectedTemplate}
              onSubmit={handleFormSubmit}
            />
          </div>
        ) : (
          <>
            {/* Template Categories Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                { category: 'contact', label: 'Contact Forms', count: formTemplates.filter(t => t.category === 'contact').length },
                { category: 'registration', label: 'Registration Forms', count: formTemplates.filter(t => t.category === 'registration').length },
                { category: 'survey', label: 'Survey Forms', count: formTemplates.filter(t => t.category === 'survey').length },
                { category: 'booking', label: 'Booking Forms', count: formTemplates.filter(t => t.category === 'booking').length },
                { category: 'business', label: 'Business Forms', count: formTemplates.filter(t => t.category === 'business').length },
                { category: 'ecommerce', label: 'E-commerce Forms', count: formTemplates.filter(t => t.category === 'ecommerce').length }
              ].map(cat => {
                const Icon = getCategoryIcon(cat.category)
                return (
                  <div
                    key={cat.category}
                    className="p-6 rounded-2xl border-2"
                    style={{
                      backgroundColor: 'var(--color-bg-card)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: 'var(--color-primary-light)' }}
                    >
                      <Icon className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{
                        color: 'var(--color-text-heading)',
                        fontFamily: 'var(--font-heading)'
                      }}
                    >
                      {cat.label}
                    </h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                      {cat.count} template{cat.count !== 1 ? 's' : ''} available
                    </p>
                  </div>
                )
              })}
            </div>

            {/* All Templates Grid */}
            <h2
              className="text-3xl font-bold mb-6"
              style={{
                color: 'var(--color-text-heading)',
                fontFamily: 'var(--font-heading)'
              }}
            >
              All Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formTemplates.map(template => {
                const Icon = template.icon
                return (
                  <div
                    key={template.id}
                    className="p-6 rounded-2xl border-2 cursor-pointer transition-all hover:border-opacity-100 hover:shadow-lg"
                    style={{
                      backgroundColor: 'var(--color-bg-card)',
                      borderColor: 'var(--color-border)'
                    }}
                    onClick={() => {
                      setSelectedTemplate(template)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: 'var(--color-primary-light)' }}
                    >
                      <Icon className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{
                        color: 'var(--color-text-heading)',
                        fontFamily: 'var(--font-heading)'
                      }}
                    >
                      {template.name}
                    </h3>
                    <p
                      className="text-sm mb-3 line-clamp-2"
                      style={{ color: 'var(--color-text-body)' }}
                    >
                      {template.description}
                    </p>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {template.fields.length} fields
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Features Section */}
        <div
          className="mt-16 p-8 rounded-2xl border-2"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border)'
          }}
        >
          <h2
            className="text-3xl font-bold mb-6"
            style={{
              color: 'var(--color-text-heading)',
              fontFamily: 'var(--font-heading)'
            }}
          >
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Professional Design',
                description: 'Clean, modern layouts that match your website styling'
              },
              {
                title: 'Fully Responsive',
                description: 'Forms work perfectly on all devices and screen sizes'
              },
              {
                title: 'Easy Customization',
                description: 'Modify fields, labels, and styling after insertion'
              },
              {
                title: 'Validation Built-in',
                description: 'Required fields and input validation included'
              },
              {
                title: 'Multiple Field Types',
                description: 'Text, email, phone, textarea, select, radio, checkbox, file upload, and more'
              },
              {
                title: 'Instant Integration',
                description: 'One-click insertion into your website'
              }
            ].map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
                <div>
                  <h3
                    className="font-bold mb-1"
                    style={{ color: 'var(--color-text-heading)' }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{ color: 'var(--color-text-body)' }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Template Selector Modal */}
      <FormTemplateSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={handleSelectTemplate}
      />
    </div>
  )
}
