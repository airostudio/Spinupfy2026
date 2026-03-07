'use client';

import { Button } from '@/components/ui';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getGradientPlaceholder } from '@/lib/image-placeholder';

interface HeroSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    primaryCTA?: { text: string; href: string };
    secondaryCTA?: { text: string; href: string };
    backgroundImage?: string;
    logo?: string;
    imagePosition?: 'side' | 'background' | 'background-opacity'; // NEW: configurable positioning
  };
  editable?: boolean;
  onEdit?: () => void;
  isFirstSection?: boolean; // SEO: Determines if this should use H1 (only for first hero on page)
}

export function HeroSection({ content, editable, onEdit, isFirstSection = true }: HeroSectionProps) {
  // Use configured position, or default to 'background' if backgroundImage exists
  const imagePosition = content.imagePosition || (content.backgroundImage ? 'background' : 'side');

  // SEO: Use H1 only for the first hero section on the page
  const HeadingTag = isFirstSection ? 'h1' : 'h2';

  if (imagePosition === 'background' && content.backgroundImage) {
    // Full background hero with luxury styling
    return (
      <section
        className="relative h-screen min-h-[600px] w-full overflow-hidden"
        onClick={editable ? onEdit : undefined}
      >
        {/* Background Image with Luxury Gradient Overlay */}
        <div className="absolute inset-0">
          <Image
            src={content.backgroundImage}
            alt="Hero Background"
            fill
            className="object-cover"
            priority
            placeholder="blur"
            blurDataURL={getGradientPlaceholder()}
          />
          {/* Professional gradient overlay for depth and legibility */}
          <div className="absolute inset-0 gradient-overlay-dark" />
        </div>

        {/* Elegant decorative elements - using CSS animations for better performance */}
        <div
          className="absolute top-1/4 right-12 w-24 h-24 backdrop-blur-sm rounded-xl shadow-luxury-lg border border-white/10 animate-float"
          style={{
            zIndex: 1,
            backgroundColor: 'var(--color-primary)',
            opacity: 0.2
          }}
        />

        {/* Content with Professional Spacing */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 py-20">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Refined Badge with Accent Color */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass border text-white text-sm font-medium tracking-wide uppercase animate-fade-in">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--color-accent)' }}
              />
              <span>{content.subtitle}</span>
            </div>

            {/* Dramatic Luxury Typography - Reduced size to not overpower hero image */}
            <HeadingTag
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 text-shadow-lg animate-fade-in"
              style={{
                fontFamily: 'var(--font-heading)',
                animationDelay: '0.2s'
              }}
            >
              {content.title}
            </HeadingTag>

            {/* Elegant Description with Enhanced Legibility - Reduced size */}
            <p
              className="text-base md:text-lg lg:text-xl text-white/95 leading-relaxed max-w-3xl mx-auto font-light text-shadow animate-fade-in"
              style={{
                animationDelay: '0.4s',
                fontFamily: 'var(--font-body)'
              }}
            >
              {content.description}
            </p>

            {/* Premium CTA Buttons */}
            {(content.primaryCTA || content.secondaryCTA) && (
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4 animate-slide-up"
                style={{ animationDelay: '0.5s' }}
              >
                {content.primaryCTA && (
                  <button
                    className="px-10 py-5 rounded-full font-semibold text-lg shadow-luxury-xl hover:shadow-luxury-xl hover:scale-105 transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-button-text)'
                    }}
                    onClick={() => (window.location.href = content.primaryCTA!.href)}
                  >
                    {content.primaryCTA.text}
                    <ArrowRight className="inline-block w-5 h-5 ml-2" />
                  </button>
                )}
                {content.secondaryCTA && (
                  <button
                    className="px-10 py-5 border-2 border-white/60 text-white hover:bg-white/10 backdrop-blur-sm rounded-full font-semibold text-lg hover:scale-105 transition-all duration-300"
                    onClick={() =>
                      (window.location.href = content.secondaryCTA!.href)
                    }
                  >
                    {content.secondaryCTA.text}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Professional Scroll Indicator - CSS animation for better performance */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in opacity-70" style={{ animationDelay: '1s' }}>
            <ChevronDown className="w-8 h-8 text-white/70 animate-bounce" />
          </div>
        </div>
      </section>
    );
  }

  // Background with 15% opacity mode - Luxury variant
  if (imagePosition === 'background-opacity' && content.backgroundImage) {
    return (
      <section
        className="relative h-screen min-h-[600px] overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-dark)' }}
        onClick={editable ? onEdit : undefined}
      >
        {/* Subtle Background Image */}
        <div className="absolute inset-0">
          <Image
            src={content.backgroundImage}
            alt="Hero Background"
            fill
            className="object-cover opacity-15"
            priority
          />
        </div>

        {/* Content - Centered with Professional Spacing */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 py-20">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Refined Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass border text-white text-sm font-medium tracking-wide uppercase animate-fade-in">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--color-accent)' }}
              />
              <span>{content.subtitle}</span>
            </div>

            {/* Dramatic Typography with Theme Fonts - Reduced size */}
            <HeadingTag
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 animate-fade-in"
              style={{
                fontFamily: 'var(--font-heading)',
                animationDelay: '0.2s'
              }}
            >
              {content.title}
            </HeadingTag>

            {/* Elegant Description - Reduced size */}
            <p
              className="text-base md:text-lg lg:text-xl text-white/95 leading-relaxed max-w-3xl mx-auto font-light animate-fade-in"
              style={{
                animationDelay: '0.4s',
                fontFamily: 'var(--font-body)'
              }}
            >
              {content.description}
            </p>

            {/* Premium CTA Buttons */}
            {(content.primaryCTA || content.secondaryCTA) && (
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4 animate-slide-up"
                style={{ animationDelay: '0.5s' }}
              >
                {content.primaryCTA && (
                  <button
                    className="px-10 py-5 rounded-full font-semibold text-lg shadow-luxury-xl hover:shadow-luxury-xl hover:scale-105 transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-button-text)'
                    }}
                    onClick={() => (window.location.href = content.primaryCTA!.href)}
                  >
                    {content.primaryCTA.text}
                    <ArrowRight className="inline-block w-5 h-5 ml-2" />
                  </button>
                )}
                {content.secondaryCTA && (
                  <button
                    className="px-10 py-5 border-2 border-white/60 text-white hover:bg-white/10 backdrop-blur-sm rounded-full font-semibold text-lg hover:scale-105 transition-all duration-300"
                    onClick={() =>
                      (window.location.href = content.secondaryCTA!.href)
                    }
                  >
                    {content.secondaryCTA.text}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Professional Scroll Indicator - CSS animation for better performance */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in opacity-70" style={{ animationDelay: '1s' }}>
            <ChevronDown className="w-8 h-8 text-white/70 animate-bounce" />
          </div>
        </div>
      </section>
    );
  }

  // Split layout hero with luxury styling
  return (
    <section
      className="relative min-h-[700px] overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
      onClick={editable ? onEdit : undefined}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content with Professional Spacing */}
          <div className="space-y-8 animate-fade-in">
            {/* Refined Badge */}
            <div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border text-sm font-medium tracking-wide uppercase"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-primary)'
              }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--color-accent)' }}
              />
              <span>{content.subtitle}</span>
            </div>

            {/* Dramatic Typography - Reduced size */}
            <HeadingTag
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1]"
              style={{
                color: 'var(--color-text-heading)',
                fontFamily: 'var(--font-heading)'
              }}
            >
              {content.title}
            </HeadingTag>

            {/* Elegant Description - Reduced size */}
            <p
              className="text-base md:text-lg leading-relaxed max-w-xl animate-fade-in"
              style={{
                color: 'var(--color-text-body)',
                fontFamily: 'var(--font-body)',
                animationDelay: '0.2s'
              }}
            >
              {content.description}
            </p>

            {/* Premium CTA Buttons */}
            {(content.primaryCTA || content.secondaryCTA) && (
              <div className="flex flex-col sm:flex-row items-start gap-4 pt-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                {content.primaryCTA && (
                  <button
                    className="px-8 py-4 rounded-full font-semibold text-base shadow-luxury-lg hover:shadow-luxury-xl hover:scale-105 transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-button-text)'
                    }}
                    onClick={() => (window.location.href = content.primaryCTA!.href)}
                  >
                    {content.primaryCTA.text}
                    <ArrowRight className="inline-block w-5 h-5 ml-2" />
                  </button>
                )}
                {content.secondaryCTA && (
                  <button
                    className="px-8 py-4 border-2 rounded-full font-semibold text-base hover:scale-105 transition-all duration-300"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-body)',
                      backgroundColor: 'transparent'
                    }}
                    onClick={() =>
                      (window.location.href = content.secondaryCTA!.href)
                    }
                  >
                    {content.secondaryCTA.text}
                  </button>
                )}
              </div>
            )}

            {/* Trust Indicators with Theme Colors */}
            <div
              className="flex items-center gap-6 pt-6 border-t animate-fade-in"
              style={{ borderColor: 'var(--color-border)', animationDelay: '0.6s' }}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-white text-xs font-semibold shadow-luxury"
                    style={{
                      backgroundColor: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-accent)',
                      borderColor: 'var(--color-bg-primary)'
                    }}
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <span className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>
                  5,000+
                </span>{' '}
                happy customers
              </div>
            </div>
          </div>

          {/* Right Image with Enhanced Styling */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {content.backgroundImage && (
              <div className="relative rounded-3xl overflow-hidden shadow-luxury-xl">
                <Image
                  src={content.backgroundImage}
                  alt="Hero"
                  width={800}
                  height={600}
                  className="object-cover w-full h-full"
                  priority
                />
                {/* Subtle overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Background Elements with Theme Colors */}
      <div
        className="absolute top-0 right-0 w-1/3 h-full -z-10 blur-3xl opacity-30"
        style={{
          background: `linear-gradient(to bottom right, var(--color-primary), var(--color-accent))`
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-1/3 h-1/2 -z-10 blur-3xl opacity-20"
        style={{
          background: `linear-gradient(to top right, var(--color-accent), transparent)`
        }}
      />
    </section>
  );
}
