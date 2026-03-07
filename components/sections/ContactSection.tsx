'use client';

import { useState } from 'react';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ContactSectionProps {
  content: {
    title: string;
    subtitle: string;
    email?: string;
    phone?: string;
    address?: string;
    responseTime?: string;
  };
  editable?: boolean;
  onEdit?: () => void;
}

export function ContactSection({
  content,
  editable,
  onEdit,
}: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editable) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
    setSubmitted(true);
    setLoading(false);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-dark)' }}
      onClick={editable ? onEdit : undefined}
      aria-labelledby="contact-heading"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--color-accent)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-semibold mb-4 text-sm md:text-base tracking-wide uppercase animate-fade-in"
            style={{
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-body)'
            }}
          >
            {content.subtitle}
          </motion.p>
          <motion.h2
            id="contact-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in"
            style={{
              color: 'var(--color-text-heading)',
              fontFamily: 'var(--font-heading)',
              animationDelay: '0.1s'
            }}
          >
            {content.title}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="animate-slide-in-left"
          >
            <div
              className="rounded-3xl p-8 md:p-10 shadow-luxury-xl border"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)'
              }}
            >
              {/* Success Message */}
              {submitted && (
                <div
                  className="mb-6 p-4 rounded-xl flex items-start gap-3"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                  role="alert"
                  aria-live="polite"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-green-500">Message Sent!</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      We&apos;ll get back to you within {content.responseTime || '24 hours'}.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-heading)' }}
                  >
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={editable}
                    placeholder="John Doe"
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-offset-0 disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-heading)',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-heading)' }}
                  >
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={editable}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-offset-0 disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-heading)',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-heading)' }}
                  >
                    Your Message *
                  </label>
                  <textarea
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    required
                    disabled={editable}
                    placeholder="Tell us about your project or question..."
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-offset-0 disabled:opacity-50 resize-none"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-heading)',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || editable}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-lg shadow-luxury-lg hover:shadow-luxury-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-button-text)'
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5" aria-hidden="true" />
                    </>
                  )}
                </button>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-4 pt-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" aria-hidden="true" />
                    Secure
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    {content.responseTime || '24hr response'}
                  </span>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8 animate-slide-in-right"
          >
            <div>
              <h3
                className="text-2xl md:text-3xl font-bold mb-4"
                style={{
                  color: 'var(--color-text-heading)',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                Get in Touch
              </h3>
              <p
                className="text-lg leading-relaxed mb-8"
                style={{
                  color: 'var(--color-text-body)',
                  fontFamily: 'var(--font-body)'
                }}
              >
                Have a question or want to work together? Feel free to reach out
                using the contact form or through any of the channels below.
              </p>
            </div>

            <div className="space-y-5">
              {content.email && (
                <a
                  href={`mailto:${content.email}`}
                  className="block p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-luxury-lg group"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}
                      aria-hidden="true"
                    >
                      <Mail className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: 'var(--color-text-heading)' }}
                      >
                        Email Us
                      </h4>
                      <p
                        className="group-hover:underline"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {content.email}
                      </p>
                    </div>
                  </div>
                </a>
              )}

              {content.phone && (
                <a
                  href={`tel:${content.phone}`}
                  className="block p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-luxury-lg group"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)' }}
                      aria-hidden="true"
                    >
                      <Phone className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <div>
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: 'var(--color-text-heading)' }}
                      >
                        Call Us
                      </h4>
                      <p
                        className="group-hover:underline"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        {content.phone}
                      </p>
                    </div>
                  </div>
                </a>
              )}

              {content.address && (
                <div
                  className="p-6 rounded-2xl border"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
                      aria-hidden="true"
                    >
                      <MapPin className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: 'var(--color-text-heading)' }}
                      >
                        Visit Us
                      </h4>
                      <p style={{ color: 'var(--color-text-body)' }}>
                        {content.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Trust Element */}
            <div
              className="p-6 rounded-2xl mt-8"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                opacity: 0.9
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center" aria-hidden="true">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">Quick Response Guarantee</p>
                  <p className="text-white/80 text-sm">We typically respond within {content.responseTime || '24 hours'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
