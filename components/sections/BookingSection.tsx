'use client'

import { useState } from 'react'
import { Calendar, Clock, Users, Mail, Phone, User, MessageSquare, CheckCircle, Shield, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface BookingSectionProps {
  content: {
    heading?: string
    subheading?: string
    description?: string
    bookingType?: string // 'table', 'appointment', 'viewing', 'service', 'class', 'tour', 'consultation'
    buttonText?: string
    backgroundColor?: string
    textColor?: string
    primaryColor?: string
    features?: string[]
    confirmationTime?: string
  }
  editable?: boolean
  websiteId?: string
  onEdit?: (field: string, value: any) => void
}

export function BookingSection({ content, editable = false, websiteId, onEdit }: BookingSectionProps) {
  const {
    heading = 'Book Your Reservation',
    subheading = 'Reserve Your Spot',
    description = 'Fill out the form below to make a reservation. We\'ll confirm your booking shortly.',
    bookingType = 'table',
    buttonText = 'Confirm Booking',
    features = [],
    confirmationTime = '24 hours',
  } = content

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    bookingDate: '',
    bookingTime: '',
    numberOfPeople: 2,
    specialRequests: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editable) {
      toast('Preview mode - bookings disabled in editor', { icon: '👁️' })
      return
    }

    if (!websiteId) {
      toast.error('Website ID not found')
      return
    }

    // Validate required fields
    if (!formData.customerName || !formData.customerEmail || !formData.bookingDate || !formData.bookingTime) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteId,
          bookingType,
          ...formData,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
        toast.success('Booking request submitted successfully!')

        // Reset form
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          bookingDate: '',
          bookingTime: '',
          numberOfPeople: 2,
          specialRequests: '',
        })

        // Reset submitted state after 5 seconds
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        toast.error(data.error || 'Failed to submit booking')
      }
    } catch (error) {
      console.error('Booking submission error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  const getBookingLabel = () => {
    switch (bookingType) {
      case 'table':
        return 'Reserve a Table'
      case 'appointment':
        return 'Book an Appointment'
      case 'viewing':
        return 'Schedule a Viewing'
      case 'service':
        return 'Book a Service'
      default:
        return 'Make a Booking'
    }
  }

  const getPeopleLabel = () => {
    switch (bookingType) {
      case 'table':
        return 'Number of Guests'
      case 'viewing':
        return 'Number of Attendees'
      default:
        return 'Party Size'
    }
  }

  return (
    <section
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      aria-labelledby="booking-heading"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--color-accent)' }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          {editable ? (
            <>
              <input
                type="text"
                value={subheading}
                onChange={(e) => onEdit?.('subheading', e.target.value)}
                className="text-sm font-semibold uppercase tracking-wide mb-2 bg-transparent border-b text-center w-full max-w-md mx-auto"
                style={{ color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}
              />
              <input
                type="text"
                value={heading}
                onChange={(e) => onEdit?.('heading', e.target.value)}
                className="text-4xl md:text-5xl font-bold mb-4 bg-transparent border-b text-center w-full"
                style={{ color: 'var(--color-text-heading)', borderColor: 'var(--color-border)', fontFamily: 'var(--font-heading)' }}
              />
              <textarea
                value={description}
                onChange={(e) => onEdit?.('description', e.target.value)}
                className="max-w-2xl mx-auto bg-transparent border rounded-xl p-3 w-full"
                style={{ color: 'var(--color-text-body)', borderColor: 'var(--color-border)' }}
                rows={2}
              />
            </>
          ) : (
            <>
              <p
                className="text-sm font-semibold uppercase tracking-wide mb-4 animate-fade-in"
                style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
              >
                {subheading}
              </p>
              <h2
                id="booking-heading"
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in"
                style={{ color: 'var(--color-text-heading)', fontFamily: 'var(--font-heading)', animationDelay: '0.1s' }}
              >
                {heading}
              </h2>
              <p
                className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-in"
                style={{ color: 'var(--color-text-body)', fontFamily: 'var(--font-body)', animationDelay: '0.2s' }}
              >
                {description}
              </p>
            </>
          )}
        </motion.div>

        {/* Success Message */}
        {submitted && !editable && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 rounded-2xl flex items-start gap-4"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '2px solid rgba(16, 185, 129, 0.3)' }}
            role="alert"
            aria-live="polite"
          >
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-1">Booking Request Received!</h3>
              <p style={{ color: 'var(--color-text-body)' }}>
                Thank you for your reservation. We&apos;ll send a confirmation to your email within {confirmationTime}.
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl shadow-luxury-xl p-8 md:p-10 border"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="booking-name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-heading)' }}
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                      Full Name *
                    </span>
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => handleChange('customerName', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all focus:ring-2 focus:ring-offset-0"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-heading)' }}
                    placeholder="John Doe"
                    disabled={editable}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="booking-email"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-heading)' }}
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                      Email Address *
                    </span>
                  </label>
                  <input
                    id="booking-email"
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => handleChange('customerEmail', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all focus:ring-2 focus:ring-offset-0"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-heading)' }}
                    placeholder="john@example.com"
                    disabled={editable}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="booking-phone"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-heading)' }}
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                      Phone Number
                    </span>
                  </label>
                  <input
                    id="booking-phone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleChange('customerPhone', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all focus:ring-2 focus:ring-offset-0"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-heading)' }}
                    placeholder="+1 (555) 000-0000"
                    disabled={editable}
                  />
                </div>

                {/* Number of People */}
                <div>
                  <label
                    htmlFor="booking-people"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-heading)' }}
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                      {getPeopleLabel()}
                    </span>
                  </label>
                  <input
                    id="booking-people"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.numberOfPeople}
                    onChange={(e) => handleChange('numberOfPeople', parseInt(e.target.value))}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all focus:ring-2 focus:ring-offset-0"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-heading)' }}
                    disabled={editable}
                  />
                </div>

                {/* Date */}
                <div>
                  <label
                    htmlFor="booking-date"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-heading)' }}
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                      Preferred Date *
                    </span>
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    required
                    min={today}
                    value={formData.bookingDate}
                    onChange={(e) => handleChange('bookingDate', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all focus:ring-2 focus:ring-offset-0"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-heading)' }}
                    disabled={editable}
                  />
                </div>

                {/* Time */}
                <div>
                  <label
                    htmlFor="booking-time"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-heading)' }}
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                      Preferred Time *
                    </span>
                  </label>
                  <input
                    id="booking-time"
                    type="time"
                    required
                    value={formData.bookingTime}
                    onChange={(e) => handleChange('bookingTime', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all focus:ring-2 focus:ring-offset-0"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-heading)' }}
                    disabled={editable}
                  />
                </div>

                {/* Special Requests */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="booking-requests"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-heading)' }}
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                      Special Requests
                    </span>
                  </label>
                  <textarea
                    id="booking-requests"
                    value={formData.specialRequests}
                    onChange={(e) => handleChange('specialRequests', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all focus:ring-2 focus:ring-offset-0 resize-none"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-heading)' }}
                    placeholder="Any special requirements or requests?"
                    disabled={editable}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={submitting || editable}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-lg shadow-luxury-lg hover:shadow-luxury-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`, color: 'var(--color-button-text)' }}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" aria-hidden="true" />
                      {buttonText}
                    </>
                  )}
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <Shield className="w-4 h-4" aria-hidden="true" />
                  Secure
                </span>
                <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  Instant Confirmation
                </span>
                <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                  Free Cancellation
                </span>
              </div>
            </form>
          </motion.div>

          {/* Side Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Why Book With Us */}
            <div
              className="rounded-3xl p-8 border"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              <h3
                className="text-xl font-bold mb-6"
                style={{ color: 'var(--color-text-heading)', fontFamily: 'var(--font-heading)' }}
              >
                Why Book With Us
              </h3>
              <ul className="space-y-4">
                {(features.length > 0 ? features : [
                  'Instant confirmation',
                  'No hidden fees',
                  'Free cancellation up to 24h',
                  'Best price guarantee'
                ]).map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
                      aria-hidden="true"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <span style={{ color: 'var(--color-text-body)' }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Support */}
            <div
              className="rounded-3xl p-8"
              style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))` }}
            >
              <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Need Help?
              </h3>
              <p className="text-white/80 mb-6 text-sm">
                Our team is here to assist you with your booking. Don&apos;t hesitate to reach out!
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white">
                  <Phone className="w-5 h-5" aria-hidden="true" />
                  <span>Call us anytime</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                  <span>Email support</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
