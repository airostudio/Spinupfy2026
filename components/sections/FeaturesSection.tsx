'use client';

import { Card, CardContent } from '@/components/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  image?: string;
  number?: number;
  link?: string;
  linkText?: string;
}

interface FeaturesSectionProps {
  content: {
    title: string;
    subtitle: string;
    features: Feature[];
  };
  settings?: {
    layout?: 'grid' | 'list' | 'steps' | 'featured';
    variant?: 'benefits' | 'process';
    theme?: 'white' | 'dark';
  };
  editable?: boolean;
  onEdit?: () => void;
}

export function FeaturesSection({
  content,
  settings,
  editable,
  onEdit,
}: FeaturesSectionProps) {
  const layout = settings?.layout || 'featured';
  const variant = settings?.variant || 'features';

  return (
    <section
      className="py-24 md:py-32"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      onClick={editable ? onEdit : undefined}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Luxury Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-semibold mb-6 text-sm md:text-base tracking-wide uppercase animate-fade-in"
            style={{
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-body)'
            }}
          >
            {content.subtitle}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in"
            style={{
              color: 'var(--color-text-heading)',
              fontFamily: 'var(--font-heading)',
              animationDelay: '0.15s'
            }}
          >
            {content.title}
          </motion.h2>
        </div>

        {/* Features Grid - Luxury Layout */}
        {layout === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {content.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card
                  className="h-full border-2 shadow-luxury hover:shadow-luxury-lg transition-all duration-300 group"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <CardContent className="p-0">
                    {/* Image with Overlay */}
                    {feature.image && (
                      <div className="relative h-56 w-full overflow-hidden rounded-t-xl">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                    )}

                    <div className="p-8 space-y-4">
                      {/* Title with Theme Font */}
                      <h3
                        className="text-2xl md:text-3xl font-bold mb-4 transition-colors duration-300"
                        style={{
                          color: 'var(--color-text-heading)',
                          fontFamily: 'var(--font-heading)'
                        }}
                      >
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p
                        className="leading-relaxed mb-6"
                        style={{
                          color: 'var(--color-text-body)',
                          fontFamily: 'var(--font-body)'
                        }}
                      >
                        {feature.description}
                      </p>

                      {/* Learn More Link */}
                      {feature.link && (
                        <Link
                          href={feature.link}
                          className="inline-flex items-center gap-2 font-semibold hover:gap-4 transition-all duration-300"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          {feature.linkText || 'Learn More'}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Features List - Luxury Horizontal Layout */}
        {layout === 'list' && (
          <div className="space-y-8">
            {content.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="animate-slide-in-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card
                  className="border-2 shadow-luxury hover:shadow-luxury-lg transition-all duration-300 group"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-3 gap-0 items-center">
                      {/* Image */}
                      {feature.image && (
                        <div className="relative h-56 md:h-80 w-full overflow-hidden md:rounded-l-xl">
                          <Image
                            src={feature.image}
                            alt={feature.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                        </div>
                      )}

                      <div className="md:col-span-2 p-10 space-y-5">
                        {/* Title */}
                        <h3
                          className="text-3xl md:text-4xl font-bold mb-5 transition-colors duration-300"
                          style={{
                            color: 'var(--color-text-heading)',
                            fontFamily: 'var(--font-heading)'
                          }}
                        >
                          {feature.title}
                        </h3>

                        {/* Description */}
                        <p
                          className="text-lg md:text-xl leading-relaxed mb-6"
                          style={{
                            color: 'var(--color-text-body)',
                            fontFamily: 'var(--font-body)'
                          }}
                        >
                          {feature.description}
                        </p>

                        {/* Learn More Link */}
                        {feature.link && (
                          <Link
                            href={feature.link}
                            className="inline-flex items-center gap-2 text-lg font-semibold hover:gap-4 transition-all duration-300"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            {feature.linkText || 'Learn More'}
                            <ArrowRight className="w-5 h-5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Process Steps - Luxury Timeline */}
        {layout === 'steps' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative animate-scale-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <Card
                  className="h-full border-2 shadow-luxury hover:shadow-luxury-lg transition-all duration-300 group"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <CardContent className="p-8 text-center space-y-5">
                    {/* Elegant Step Number */}
                    {feature.number && (
                      <div
                        className="w-20 h-20 mx-auto mb-6 rounded-full text-white flex items-center justify-center text-3xl font-bold shadow-luxury"
                        style={{
                          background: `linear-gradient(to bottom right, var(--color-primary), var(--color-accent))`,
                          fontFamily: 'var(--font-heading)'
                        }}
                      >
                        {feature.number}
                      </div>
                    )}

                    {/* Image */}
                    {feature.image && (
                      <div className="relative h-36 w-full overflow-hidden rounded-xl mb-6">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}

                    {/* Title */}
                    <h3
                      className="text-xl md:text-2xl font-bold mb-4 transition-colors duration-300"
                      style={{
                        color: 'var(--color-text-heading)',
                        fontFamily: 'var(--font-heading)'
                      }}
                    >
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="leading-relaxed mb-5"
                      style={{
                        color: 'var(--color-text-body)',
                        fontFamily: 'var(--font-body)'
                      }}
                    >
                      {feature.description}
                    </p>

                    {/* Learn More Link */}
                    {feature.link && (
                      <Link
                        href={feature.link}
                        className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all duration-300"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {feature.linkText || 'Learn More'}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </CardContent>
                </Card>

                {/* Refined Connector Arrow */}
                {index < content.features.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2"
                    style={{ color: 'var(--color-primary)', opacity: 0.3 }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Featured Layout - Luxury Smart Layout */}
        {layout === 'featured' && (
          <div className="space-y-12">
            {content.features.length >= 6 ? (
              // 6+ features: Consistent rows of 3 with luxury styling
              <div className="space-y-12">
                {(() => {
                  const rows = [];
                  for (let i = 0; i < content.features.length; i += 3) {
                    const rowFeatures = content.features.slice(i, i + 3);
                    rows.push(
                      <div key={`row-${i}`} className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {rowFeatures.map((feature, idx) => (
                          <motion.div
                            key={`${i}-${idx}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            className="animate-fade-in"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                          >
                            <Card
                              className="h-full border-2 shadow-luxury hover:shadow-luxury-lg transition-all duration-300 group"
                              style={{
                                backgroundColor: 'var(--color-bg-card)',
                                borderColor: 'var(--color-border)'
                              }}
                            >
                              <CardContent className="p-0">
                                {feature.image && (
                                  <div className="relative h-56 w-full overflow-hidden rounded-t-xl">
                                    <Image
                                      src={feature.image}
                                      alt={feature.title}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                  </div>
                                )}
                                <div className="p-8 space-y-4">
                                  <h3
                                    className="text-2xl md:text-3xl font-bold mb-4 transition-colors duration-300"
                                    style={{
                                      color: 'var(--color-text-heading)',
                                      fontFamily: 'var(--font-heading)'
                                    }}
                                  >
                                    {feature.title}
                                  </h3>
                                  <p
                                    className="leading-relaxed mb-6"
                                    style={{
                                      color: 'var(--color-text-body)',
                                      fontFamily: 'var(--font-body)'
                                    }}
                                  >
                                    {feature.description}
                                  </p>

                                  {feature.link && (
                                    <Link
                                      href={feature.link}
                                      className="inline-flex items-center gap-2 font-semibold hover:gap-4 transition-all duration-300"
                                      style={{ color: 'var(--color-primary)' }}
                                    >
                                      {feature.linkText || 'Learn More'}
                                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                    </Link>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    );
                  }
                  return rows;
                })()}
              </div>
            ) : (
              // Less than 6 features: Use alternating pattern (1, 3) and (3, 1)
              <>
                {(() => {
                  const groups = [];
                  for (let i = 0; i < content.features.length; i += 4) {
                    const groupIndex = Math.floor(i / 4);
                    const isPatternA = groupIndex % 2 === 0;
                    const groupFeatures = content.features.slice(i, i + 4);

                    if (isPatternA) {
                      // Pattern A: 1 full-width, then 3 in row
                      groups.push(
                        <div key={`group-${i}`} className="space-y-8">
                          {groupFeatures[0] && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.5 }}
                            >
                              <Card
                                className="border-2 hover:shadow-luxury-xl transition-all duration-300 group"
                                style={{
                                  backgroundColor: 'var(--color-bg-card)',
                                  borderColor: 'var(--color-border)'
                                }}
                              >
                                <CardContent className="p-0">
                                  <div className="grid md:grid-cols-2 gap-0 items-center">
                                    {groupFeatures[0].image && (
                                      <div className="relative h-64 md:h-96 w-full overflow-hidden md:rounded-l-xl">
                                        <Image
                                          src={groupFeatures[0].image}
                                          alt={groupFeatures[0].title}
                                          fill
                                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                      </div>
                                    )}
                                    <div className="p-8 md:p-12">
                                      <h3
                                        className="text-3xl font-bold mb-6 transition-colors"
                                        style={{
                                          color: 'var(--color-text-heading)',
                                          fontFamily: 'var(--font-heading)'
                                        }}
                                      >
                                        {groupFeatures[0].title}
                                      </h3>
                                      <p
                                        className="leading-relaxed text-lg mb-8"
                                        style={{
                                          color: 'var(--color-text-body)',
                                          fontFamily: 'var(--font-body)'
                                        }}
                                      >
                                        {groupFeatures[0].description}
                                      </p>

                                      {groupFeatures[0].link && (
                                        <Link
                                          href={groupFeatures[0].link}
                                          className="inline-flex items-center gap-2 font-semibold transition-colors group-hover:gap-3 duration-300 text-lg"
                                          style={{ color: 'var(--color-primary)' }}
                                        >
                                          {groupFeatures[0].linkText || 'Learn More'}
                                          <ArrowRight className="w-5 h-5" aria-hidden="true" />
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )}
                          {groupFeatures.length > 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              {groupFeatures.slice(1, 4).map((feature, idx) => (
                                <motion.div
                                  key={`${i}-${idx + 1}`}
                                  initial={{ opacity: 0, y: 20 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.5, delay: (idx + 1) * 0.1 }}
                                >
                                  <Card
                                    className="h-full border-2 hover:shadow-luxury-xl transition-all duration-300 group"
                                    style={{
                                      backgroundColor: 'var(--color-bg-card)',
                                      borderColor: 'var(--color-border)'
                                    }}
                                  >
                                    <CardContent className="p-0">
                                      {feature.image && (
                                        <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                                          <Image
                                            src={feature.image}
                                            alt={feature.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                          />
                                        </div>
                                      )}
                                      <div className="p-8">
                                        <h3
                                          className="text-2xl font-bold mb-4 transition-colors"
                                          style={{
                                            color: 'var(--color-text-heading)',
                                            fontFamily: 'var(--font-heading)'
                                          }}
                                        >
                                          {feature.title}
                                        </h3>
                                        <p
                                          className="leading-relaxed mb-6"
                                          style={{
                                            color: 'var(--color-text-body)',
                                            fontFamily: 'var(--font-body)'
                                          }}
                                        >
                                          {feature.description}
                                        </p>

                                        {feature.link && (
                                          <Link
                                            href={feature.link}
                                            className="inline-flex items-center gap-2 font-semibold transition-colors group-hover:gap-3 duration-300"
                                            style={{ color: 'var(--color-primary)' }}
                                          >
                                            {feature.linkText || 'Learn More'}
                                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                          </Link>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      // Pattern B: 3 in row, then 1 full-width
                      groups.push(
                        <div key={`group-${i}`} className="space-y-8">
                          {groupFeatures.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              {groupFeatures.slice(0, 3).map((feature, idx) => (
                                <motion.div
                                  key={`${i}-${idx}`}
                                  initial={{ opacity: 0, y: 20 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                                >
                                  <Card
                                    className="h-full border-2 hover:shadow-luxury-xl transition-all duration-300 group"
                                    style={{
                                      backgroundColor: 'var(--color-bg-card)',
                                      borderColor: 'var(--color-border)'
                                    }}
                                  >
                                    <CardContent className="p-0">
                                      {feature.image && (
                                        <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                                          <Image
                                            src={feature.image}
                                            alt={feature.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                          />
                                        </div>
                                      )}
                                      <div className="p-8">
                                        <h3
                                          className="text-2xl font-bold mb-4 transition-colors"
                                          style={{
                                            color: 'var(--color-text-heading)',
                                            fontFamily: 'var(--font-heading)'
                                          }}
                                        >
                                          {feature.title}
                                        </h3>
                                        <p
                                          className="leading-relaxed mb-6"
                                          style={{
                                            color: 'var(--color-text-body)',
                                            fontFamily: 'var(--font-body)'
                                          }}
                                        >
                                          {feature.description}
                                        </p>

                                        {feature.link && (
                                          <Link
                                            href={feature.link}
                                            className="inline-flex items-center gap-2 font-semibold transition-colors group-hover:gap-3 duration-300"
                                            style={{ color: 'var(--color-primary)' }}
                                          >
                                            {feature.linkText || 'Learn More'}
                                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                          </Link>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ))}
                            </div>
                          )}
                          {groupFeatures[3] && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.5, delay: 0.3 }}
                            >
                              <Card
                                className="border-2 hover:shadow-luxury-xl transition-all duration-300 group"
                                style={{
                                  backgroundColor: 'var(--color-bg-card)',
                                  borderColor: 'var(--color-border)'
                                }}
                              >
                                <CardContent className="p-0">
                                  <div className="grid md:grid-cols-2 gap-0 items-center">
                                    {groupFeatures[3].image && (
                                      <div className="relative h-64 md:h-96 w-full overflow-hidden md:rounded-l-xl">
                                        <Image
                                          src={groupFeatures[3].image}
                                          alt={groupFeatures[3].title}
                                          fill
                                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                      </div>
                                    )}
                                    <div className="p-8 md:p-12">
                                      <h3
                                        className="text-3xl font-bold mb-6 transition-colors"
                                        style={{
                                          color: 'var(--color-text-heading)',
                                          fontFamily: 'var(--font-heading)'
                                        }}
                                      >
                                        {groupFeatures[3].title}
                                      </h3>
                                      <p
                                        className="leading-relaxed text-lg mb-8"
                                        style={{
                                          color: 'var(--color-text-body)',
                                          fontFamily: 'var(--font-body)'
                                        }}
                                      >
                                        {groupFeatures[3].description}
                                      </p>

                                      {groupFeatures[3].link && (
                                        <Link
                                          href={groupFeatures[3].link}
                                          className="inline-flex items-center gap-2 font-semibold transition-colors group-hover:gap-3 duration-300 text-lg"
                                          style={{ color: 'var(--color-primary)' }}
                                        >
                                          {groupFeatures[3].linkText || 'Learn More'}
                                          <ArrowRight className="w-5 h-5" aria-hidden="true" />
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )}
                        </div>
                      );
                    }
                  }
                  return groups;
                })()}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
