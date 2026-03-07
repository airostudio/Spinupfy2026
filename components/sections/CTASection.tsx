'use client';

import { Button } from '@/components/ui';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface CTASectionProps {
  content: {
    title: string;
    description: string;
    primaryCTA: { text: string; href: string };
    secondaryCTA?: { text: string; href: string };
    backgroundImage?: string;
  };
  editable?: boolean;
  onEdit?: () => void;
}

export function CTASection({ content, editable, onEdit }: CTASectionProps) {
  return (
    <section
      className="py-32 md:py-40 relative overflow-hidden"
      style={{
        background: `linear-gradient(to bottom right, var(--color-bg-secondary), var(--color-bg-primary))`
      }}
      onClick={editable ? onEdit : undefined}
    >
      {/* Background Image with Luxury Overlay */}
      {content.backgroundImage && (
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <Image
            src={content.backgroundImage}
            alt=""
            fill
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, var(--color-bg-primary), var(--color-bg-secondary))`
            }}
          />
        </div>
      )}

      {/* Content with Luxury Card */}
      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl p-12 md:p-20 shadow-luxury-xl relative overflow-hidden animate-scale-in"
          style={{
            background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`
          }}
        >
          {/* Elegant Decorative Blurs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -mr-36 -mt-36" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -ml-36 -mb-36" />
          <div
            className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{
              background: `radial-gradient(circle, var(--color-accent), transparent)`,
              transform: 'translate(-50%, -50%)'
            }}
          />

          <div className="relative z-10 text-center space-y-10">
            {/* Dramatic Title with Theme Font */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] text-shadow-lg animate-fade-in"
              style={{
                animationDelay: '0.2s',
                fontFamily: 'var(--font-heading)'
              }}
            >
              {content.title}
            </motion.h2>

            {/* Elegant Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-xl md:text-2xl lg:text-3xl text-white/95 max-w-3xl mx-auto leading-relaxed font-light text-shadow animate-fade-in"
              style={{
                animationDelay: '0.3s',
                fontFamily: 'var(--font-body)'
              }}
            >
              {content.description}
            </motion.p>

            {/* Premium CTA Buttons */}
            {(content.primaryCTA || content.secondaryCTA) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8 animate-slide-up"
                style={{ animationDelay: '0.4s' }}
              >
                {content.primaryCTA && (
                  <button
                    className="px-10 py-6 rounded-full font-semibold text-lg shadow-luxury-xl hover:shadow-luxury-xl hover:scale-105 transition-all duration-300"
                    style={{
                      backgroundColor: 'white',
                      color: 'var(--color-primary)'
                    }}
                    onClick={() => (window.location.href = content.primaryCTA.href)}
                    aria-label={content.primaryCTA.text}
                  >
                    {content.primaryCTA.text}
                    <ArrowRight className="inline-block w-5 h-5 ml-2" aria-hidden="true" />
                  </button>
                )}
                {content.secondaryCTA && (
                  <button
                    className="px-10 py-6 border-2 border-white/70 text-white hover:bg-white/10 backdrop-blur-sm rounded-full font-semibold text-lg hover:scale-105 transition-all duration-300"
                    onClick={() =>
                      (window.location.href = content.secondaryCTA!.href)
                    }
                  >
                    {content.secondaryCTA.text}
                  </button>
                )}
              </motion.div>
            )}

            {/* Luxury Stats Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-16 border-t border-white/20 animate-fade-in"
              style={{ animationDelay: '0.6s' }}
            >
              {[
                { label: 'Happy Clients', value: '5,000+' },
                { label: 'Projects Completed', value: '10,000+' },
                { label: 'Success Rate', value: '99%' },
              ].map((stat, index) => (
                <div key={index} className="text-center space-y-2">
                  <div
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-sm md:text-base text-white/90 tracking-wide uppercase"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Elegant Floating Shapes with Theme Colors */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-20 left-10 w-24 h-24 rounded-2xl opacity-10 blur-sm"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute bottom-20 right-10 w-28 h-28 rounded-2xl opacity-10 blur-sm"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />
    </section>
  );
}
