'use client'

import { useState } from 'react'
import { X, FileText, UserPlus, MessageSquare, Calendar, ClipboardList, ShoppingCart, CreditCard, Mail, FileQuestion, LifeBuoy, Check } from 'lucide-react'

export interface FormTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'contact' | 'registration' | 'survey' | 'booking' | 'business' | 'ecommerce'
  fields: FormField[]
  preview?: string
}

export interface FormField {
  id: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'time' | 'number' | 'file'
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  validation?: string
}

interface FormTemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (template: FormTemplate) => void
}

// Comprehensive form templates based on Jotform
export const formTemplates: FormTemplate[] = [
  {
    id: 'contact',
    name: 'Contact Form',
    description: 'Simple contact form for customer inquiries and communication',
    icon: FileText,
    category: 'contact',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'John Doe', required: true },
      { id: 'email', type: 'email', label: 'Email Address', placeholder: 'john@example.com', required: true },
      { id: 'phone', type: 'tel', label: 'Phone Number', placeholder: '+1 (555) 000-0000' },
      { id: 'subject', type: 'select', label: 'Subject', required: true, options: ['General Inquiry', 'Support', 'Sales', 'Partnership'] },
      { id: 'message', type: 'textarea', label: 'Message', placeholder: 'How can we help you?', required: true }
    ]
  },
  {
    id: 'registration',
    name: 'Event Registration',
    description: 'Register attendees for conferences, workshops, and events',
    icon: UserPlus,
    category: 'registration',
    fields: [
      { id: 'firstName', type: 'text', label: 'First Name', required: true },
      { id: 'lastName', type: 'text', label: 'Last Name', required: true },
      { id: 'email', type: 'email', label: 'Email Address', required: true },
      { id: 'company', type: 'text', label: 'Company/Organization' },
      { id: 'jobTitle', type: 'text', label: 'Job Title' },
      { id: 'phone', type: 'tel', label: 'Phone Number', required: true },
      { id: 'ticketType', type: 'radio', label: 'Ticket Type', required: true, options: ['General Admission', 'VIP', 'Student', 'Group (5+)'] },
      { id: 'dietary', type: 'select', label: 'Dietary Restrictions', options: ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher'] },
      { id: 'newsletter', type: 'checkbox', label: 'Subscribe to newsletter', options: ['Yes, send me updates'] }
    ]
  },
  {
    id: 'feedback',
    name: 'Feedback & Survey',
    description: 'Collect customer feedback and satisfaction ratings',
    icon: MessageSquare,
    category: 'survey',
    fields: [
      { id: 'name', type: 'text', label: 'Your Name', required: true },
      { id: 'email', type: 'email', label: 'Email Address', required: true },
      { id: 'rating', type: 'radio', label: 'How would you rate our service?', required: true, options: ['Excellent', 'Good', 'Average', 'Poor'] },
      { id: 'experience', type: 'textarea', label: 'Tell us about your experience', required: true },
      { id: 'recommend', type: 'radio', label: 'Would you recommend us to others?', required: true, options: ['Definitely', 'Probably', 'Not Sure', 'Probably Not'] },
      { id: 'improvements', type: 'textarea', label: 'What could we improve?' }
    ]
  },
  {
    id: 'appointment',
    name: 'Appointment Booking',
    description: 'Schedule appointments, consultations, and service bookings',
    icon: Calendar,
    category: 'booking',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', required: true },
      { id: 'email', type: 'email', label: 'Email Address', required: true },
      { id: 'phone', type: 'tel', label: 'Phone Number', required: true },
      { id: 'service', type: 'select', label: 'Service Type', required: true, options: ['Consultation', 'Follow-up', 'New Client', 'General Visit'] },
      { id: 'date', type: 'date', label: 'Preferred Date', required: true },
      { id: 'time', type: 'select', label: 'Preferred Time', required: true, options: ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'] },
      { id: 'notes', type: 'textarea', label: 'Additional Notes' }
    ]
  },
  {
    id: 'application',
    name: 'Job Application',
    description: 'Accept job applications and collect candidate information',
    icon: ClipboardList,
    category: 'business',
    fields: [
      { id: 'firstName', type: 'text', label: 'First Name', required: true },
      { id: 'lastName', type: 'text', label: 'Last Name', required: true },
      { id: 'email', type: 'email', label: 'Email Address', required: true },
      { id: 'phone', type: 'tel', label: 'Phone Number', required: true },
      { id: 'position', type: 'select', label: 'Position Applied For', required: true, options: ['Software Engineer', 'Product Manager', 'Designer', 'Marketing', 'Sales', 'Other'] },
      { id: 'experience', type: 'select', label: 'Years of Experience', required: true, options: ['0-2 years', '3-5 years', '6-10 years', '10+ years'] },
      { id: 'resume', type: 'file', label: 'Upload Resume', required: true },
      { id: 'coverLetter', type: 'textarea', label: 'Cover Letter' },
      { id: 'availability', type: 'select', label: 'Availability', options: ['Immediate', '2 Weeks', '1 Month', 'Negotiable'] }
    ]
  },
  {
    id: 'order',
    name: 'Order Form',
    description: 'Process product orders and collect shipping information',
    icon: ShoppingCart,
    category: 'ecommerce',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', required: true },
      { id: 'email', type: 'email', label: 'Email Address', required: true },
      { id: 'phone', type: 'tel', label: 'Phone Number', required: true },
      { id: 'product', type: 'select', label: 'Product', required: true, options: ['Product A', 'Product B', 'Product C', 'Custom Order'] },
      { id: 'quantity', type: 'number', label: 'Quantity', required: true },
      { id: 'address', type: 'textarea', label: 'Shipping Address', required: true },
      { id: 'city', type: 'text', label: 'City', required: true },
      { id: 'zipcode', type: 'text', label: 'ZIP/Postal Code', required: true },
      { id: 'specialInstructions', type: 'textarea', label: 'Special Instructions' }
    ]
  },
  {
    id: 'payment',
    name: 'Payment Form',
    description: 'Collect payment information for services and products',
    icon: CreditCard,
    category: 'ecommerce',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', required: true },
      { id: 'email', type: 'email', label: 'Email Address', required: true },
      { id: 'amount', type: 'number', label: 'Payment Amount', required: true },
      { id: 'paymentType', type: 'radio', label: 'Payment Method', required: true, options: ['Credit Card', 'PayPal', 'Bank Transfer'] },
      { id: 'description', type: 'textarea', label: 'Payment Description', required: true },
      { id: 'invoiceNumber', type: 'text', label: 'Invoice Number' }
    ]
  },
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    description: 'Build your email list with newsletter subscriptions',
    icon: Mail,
    category: 'contact',
    fields: [
      { id: 'firstName', type: 'text', label: 'First Name', required: true },
      { id: 'lastName', type: 'text', label: 'Last Name' },
      { id: 'email', type: 'email', label: 'Email Address', required: true },
      { id: 'interests', type: 'checkbox', label: 'Topics of Interest', options: ['Product Updates', 'Industry News', 'Special Offers', 'Events & Webinars'] },
      { id: 'frequency', type: 'radio', label: 'Email Frequency', options: ['Daily', 'Weekly', 'Monthly'] }
    ]
  },
  {
    id: 'quote',
    name: 'Quote Request',
    description: 'Get project details and provide custom quotes',
    icon: FileQuestion,
    category: 'business',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', required: true },
      { id: 'company', type: 'text', label: 'Company Name', required: true },
      { id: 'email', type: 'email', label: 'Email Address', required: true },
      { id: 'phone', type: 'tel', label: 'Phone Number', required: true },
      { id: 'service', type: 'select', label: 'Service Needed', required: true, options: ['Web Design', 'Development', 'Marketing', 'Consulting', 'Other'] },
      { id: 'budget', type: 'select', label: 'Budget Range', options: ['< $5,000', '$5,000 - $10,000', '$10,000 - $25,000', '$25,000+'] },
      { id: 'timeline', type: 'select', label: 'Project Timeline', options: ['Urgent (< 1 month)', '1-3 months', '3-6 months', 'Flexible'] },
      { id: 'details', type: 'textarea', label: 'Project Details', required: true }
    ]
  },
  {
    id: 'support',
    name: 'Support Ticket',
    description: 'Streamline customer support and issue tracking',
    icon: LifeBuoy,
    category: 'business',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', required: true },
      { id: 'email', type: 'email', label: 'Email Address', required: true },
      { id: 'accountId', type: 'text', label: 'Account/Customer ID' },
      { id: 'priority', type: 'radio', label: 'Priority Level', required: true, options: ['Low', 'Medium', 'High', 'Critical'] },
      { id: 'category', type: 'select', label: 'Issue Category', required: true, options: ['Technical Issue', 'Billing', 'Account Access', 'Feature Request', 'Other'] },
      { id: 'subject', type: 'text', label: 'Subject', required: true },
      { id: 'description', type: 'textarea', label: 'Describe the Issue', required: true },
      { id: 'attachment', type: 'file', label: 'Attach Screenshot/File' }
    ]
  }
]

export function FormTemplateSelector({ isOpen, onClose, onSelect }: FormTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)

  if (!isOpen) return null

  const categories = [
    { id: 'all', label: 'All Forms' },
    { id: 'contact', label: 'Contact' },
    { id: 'registration', label: 'Registration' },
    { id: 'survey', label: 'Survey' },
    { id: 'booking', label: 'Booking' },
    { id: 'business', label: 'Business' },
    { id: 'ecommerce', label: 'E-commerce' }
  ]

  const filteredTemplates = selectedCategory === 'all'
    ? formTemplates
    : formTemplates.filter(t => t.category === selectedCategory)

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
              Choose a Form Template
            </h2>
            <p style={{ color: 'var(--color-text-body)' }}>
              Select from professionally designed form templates, similar to Jotform
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

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => {
              const Icon = template.icon
              return (
                <div
                  key={template.id}
                  className="p-6 rounded-2xl border-2 cursor-pointer transition-all"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: hoveredTemplate === template.id
                      ? 'var(--color-primary)'
                      : 'var(--color-border)',
                    transform: hoveredTemplate === template.id ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: hoveredTemplate === template.id
                      ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                      : 'none'
                  }}
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  onClick={() => onSelect(template)}
                >
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: hoveredTemplate === template.id
                        ? 'var(--color-primary)'
                        : 'var(--color-bg-muted)'
                    }}
                  >
                    <Icon
                      className={`w-7 h-7 ${
                        hoveredTemplate === template.id
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
                    {template.name}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-sm mb-4 line-clamp-2"
                    style={{ color: 'var(--color-text-body)' }}
                  >
                    {template.description}
                  </p>

                  {/* Field Count */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {template.fields.length} fields
                    </span>
                    {hoveredTemplate === template.id && (
                      <div
                        className="flex items-center gap-1 text-sm font-medium"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        <Check className="w-4 h-4" />
                        Select
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t-2"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p
            className="text-sm text-center"
            style={{ color: 'var(--color-text-muted)' }}
          >
            All forms are fully customizable after insertion
          </p>
        </div>
      </div>
    </div>
  )
}
