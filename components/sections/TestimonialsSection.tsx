'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, Quote, CheckCircle } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  company?: string;
  content: string;
  rating?: number;
  image?: string;
  verified?: boolean;
}

interface TestimonialsSectionProps {
  content: {
    title: string;
    subtitle?: string;
    description?: string;
    items: Testimonial[];
    stats?: {
      rating?: string;
      reviews?: string;
      satisfaction?: string;
    };
  };
  settings?: {
    layout?: 'grid' | 'carousel' | 'featured';
    showStats?: boolean;
  };
  editable?: boolean;
  onEdit?: () => void;
}

export function TestimonialsSection({ content, settings, editable, onEdit }: TestimonialsSectionProps) {
  const layout = settings?.layout || 'grid';
  const showStats = settings?.showStats !== false;

  return (
    <section
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      onClick={editable ? onEdit : undefined}
      aria-labelledby="testimonials-heading"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div
          className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
        <div
          className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          {content.subtitle && (
            <span
              className="inline-block px-5 py-2.5 rounded-full text-sm font-semibold mb-6 animate-fade-in"
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                color: 'var(--color-primary)'
              }}
            >
              {content.subtitle}
            </span>
          )}
          <h2
            id="testimonials-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in"
            style={{
              color: 'var(--color-text-heading)',
              fontFamily: 'var(--font-heading)',
              animationDelay: '0.1s'
            }}
          >
            {content.title}
          </h2>
          {content.description && (
            <p
              className="text-lg md:text-xl leading-relaxed animate-fade-in"
              style={{
                color: 'var(--color-text-body)',
                fontFamily: 'var(--font-body)',
                animationDelay: '0.2s'
              }}
            >
              {content.description}
            </p>
          )}
        </motion.div>

        {/* Stats Bar */}
        {showStats && content.stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16 py-8 border-y"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {content.stats.rating && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-text-heading)' }}
                >
                  {content.stats.rating}
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Average Rating
                </p>
              </div>
            )}
            {content.stats.reviews && (
              <div className="text-center">
                <p
                  className="text-3xl font-bold mb-1"
                  style={{ color: 'var(--color-text-heading)' }}
                >
                  {content.stats.reviews}
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Happy Customers
                </p>
              </div>
            )}
            {content.stats.satisfaction && (
              <div className="text-center">
                <p
                  className="text-3xl font-bold mb-1"
                  style={{ color: 'var(--color-text-heading)' }}
                >
                  {content.stats.satisfaction}
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Satisfaction Rate
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Testimonials Grid */}
        <div
          className={`grid gap-8 ${
            layout === 'featured' && content.items.length > 0
              ? 'grid-cols-1 lg:grid-cols-12'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {content.items.map((testimonial, index) => {
            const isFeatured = layout === 'featured' && index === 0;

            return (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`rounded-3xl p-8 md:p-10 shadow-luxury hover:shadow-luxury-xl transition-all duration-300 relative border group ${
                  isFeatured ? 'lg:col-span-8 lg:row-span-2' : ''
                }`}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)'
                }}
              >
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity" aria-hidden="true">
                  <Quote
                    className={`${isFeatured ? 'w-24 h-24' : 'w-16 h-16'}`}
                    style={{ color: 'var(--color-primary)' }}
                  />
                </div>

                {/* Rating */}
                {testimonial.rating && (
                  <div className="flex gap-1 mb-5" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating!
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                )}

                {/* Content */}
                <blockquote
                  className={`leading-relaxed mb-8 relative z-10 ${
                    isFeatured ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
                  }`}
                  style={{
                    color: 'var(--color-text-body)',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  &quot;{testimonial.content}&quot;
                </blockquote>

                {/* Author */}
                <footer className="flex items-center gap-4 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  {testimonial.image ? (
                    <div className={`relative rounded-full overflow-hidden flex-shrink-0 ${isFeatured ? 'w-16 h-16' : 'w-14 h-14'}`}>
                      <Image
                        src={testimonial.image}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                        isFeatured ? 'w-16 h-16 text-xl' : 'w-14 h-14 text-lg'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
                      }}
                      aria-hidden="true"
                    >
                      {testimonial.name?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <cite
                        className={`font-bold not-italic ${isFeatured ? 'text-lg' : ''}`}
                        style={{ color: 'var(--color-text-heading)' }}
                      >
                        {testimonial.name}
                      </cite>
                      {testimonial.verified && (
                        <CheckCircle
                          className="w-4 h-4"
                          style={{ color: 'var(--color-primary)' }}
                          aria-label="Verified customer"
                        />
                      )}
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {testimonial.role}
                      {testimonial.company && `, ${testimonial.company}`}
                    </p>
                  </div>
                </footer>
              </motion.article>
            );
          })}

          {/* Side Stats Card for Featured Layout */}
          {layout === 'featured' && content.items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-4 rounded-3xl p-8 flex flex-col justify-center"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`
              }}
            >
              <div className="text-center text-white space-y-8">
                <div>
                  <p className="text-6xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    {content.stats?.reviews || '500+'}
                  </p>
                  <p className="text-white/80">Happy Customers</p>
                </div>
                <div className="w-16 h-px bg-white/30 mx-auto" />
                <div>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-6 h-6 fill-white text-white"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-white/80">
                    {content.stats?.rating || '4.9'} Average Rating
                  </p>
                </div>
                <div className="w-16 h-px bg-white/30 mx-auto" />
                <div>
                  <p className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    {content.stats?.satisfaction || '99%'}
                  </p>
                  <p className="text-white/80">Would Recommend</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
