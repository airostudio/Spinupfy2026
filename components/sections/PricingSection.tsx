'use client';

import { Check, Sparkles, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: { text: string; href: string };
  badge?: string;
}

interface PricingSectionProps {
  content: {
    title: string;
    subtitle: string;
    description?: string;
    plans: PricingPlan[];
    guarantee?: string;
  };
  settings?: {
    layout?: 'cards' | 'comparison';
    showGuarantee?: boolean;
  };
  editable?: boolean;
  onEdit?: () => void;
}

export function PricingSection({
  content,
  settings,
  editable,
  onEdit,
}: PricingSectionProps) {
  const showGuarantee = settings?.showGuarantee !== false;

  return (
    <section
      className="py-24 md:py-32 relative overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, var(--color-bg-dark), var(--color-bg-primary))`
      }}
      onClick={editable ? onEdit : undefined}
      aria-labelledby="pricing-heading"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div
          className="absolute top-1/4 left-0 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
        <div
          className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full blur-3xl"
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
            id="pricing-heading"
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
          {content.description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed animate-fade-in"
              style={{
                color: 'var(--color-text-body)',
                fontFamily: 'var(--font-body)',
                animationDelay: '0.2s'
              }}
            >
              {content.description}
            </motion.p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className={`grid gap-8 ${
          content.plans.length === 2
            ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
            : content.plans.length >= 4
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-3'
        }`}>
          {content.plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${plan.highlighted ? 'md:-mt-4 md:mb-4 z-10' : ''}`}
            >
              <div
                className={`h-full rounded-3xl p-8 md:p-10 border-2 transition-all duration-300 hover:shadow-luxury-xl ${
                  plan.highlighted
                    ? 'shadow-luxury-xl'
                    : 'hover:scale-[1.02]'
                }`}
                style={{
                  backgroundColor: plan.highlighted
                    ? 'var(--color-bg-card)'
                    : 'var(--color-bg-card)',
                  borderColor: plan.highlighted
                    ? 'var(--color-primary)'
                    : 'var(--color-border)',
                  boxShadow: plan.highlighted
                    ? '0 0 40px rgba(139, 92, 246, 0.2)'
                    : undefined
                }}
              >
                {/* Badge */}
                {(plan.highlighted || plan.badge) && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white shadow-luxury"
                      style={{
                        background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
                      }}
                    >
                      <Sparkles className="w-4 h-4" aria-hidden="true" />
                      {plan.badge || 'Most Popular'}
                    </span>
                  </div>
                )}

                {/* Plan Name */}
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{
                    color: 'var(--color-text-heading)',
                    fontFamily: 'var(--font-heading)'
                  }}
                >
                  {plan.name}
                </h3>
                <p
                  className="mb-6 text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-5xl md:text-6xl font-bold"
                      style={{
                        color: 'var(--color-text-heading)',
                        fontFamily: 'var(--font-heading)'
                      }}
                    >
                      {plan.price}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      /{plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8" role="list" aria-label={`${plan.name} features`}>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                        style={{
                          backgroundColor: plan.highlighted
                            ? 'rgba(139, 92, 246, 0.2)'
                            : 'rgba(16, 185, 129, 0.15)'
                        }}
                        aria-hidden="true"
                      >
                        <Check
                          className="w-4 h-4"
                          style={{
                            color: plan.highlighted
                              ? 'var(--color-primary)'
                              : 'var(--color-success)'
                          }}
                        />
                      </div>
                      <span style={{ color: 'var(--color-text-body)' }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.cta.href}
                  className={`block w-full py-4 px-6 rounded-xl font-semibold text-lg text-center transition-all duration-300 hover:scale-[1.02] ${
                    plan.highlighted ? 'shadow-luxury-lg hover:shadow-luxury-xl' : ''
                  }`}
                  style={plan.highlighted ? {
                    background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                    color: 'var(--color-button-text)'
                  } : {
                    backgroundColor: 'transparent',
                    border: '2px solid var(--color-border)',
                    color: 'var(--color-text-heading)'
                  }}
                >
                  {plan.cta.text}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Guarantee Section */}
        {showGuarantee && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <div
              className="inline-flex items-center gap-6 px-8 py-4 rounded-2xl"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5" style={{ color: 'var(--color-success)' }} aria-hidden="true" />
                <span style={{ color: 'var(--color-text-body)' }}>
                  {content.guarantee || 'Money-back guarantee'}
                </span>
              </div>
              <div className="w-px h-6" style={{ backgroundColor: 'var(--color-border)' }} />
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5" style={{ color: 'var(--color-warning)' }} aria-hidden="true" />
                <span style={{ color: 'var(--color-text-body)' }}>
                  Cancel anytime
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
