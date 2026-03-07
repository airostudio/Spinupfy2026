'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface AboutSectionProps {
  content: {
    title: string;
    subtitle?: string;
    description: string;
    overview?: string;
    features?: Array<{ title: string; description: string; icon?: string }>;
    mission?: string;
    vision?: string;
    values?: Array<{ title: string; description: string; icon?: string }>;
    image?: string;
    stats?: Array<{ value: string; label: string }>;
  };
  editable?: boolean;
  onEdit?: () => void;
}

export function AboutSection({ content, editable, onEdit }: AboutSectionProps) {
  return (
    <section
      className="relative py-20 bg-white overflow-hidden"
      onClick={editable ? onEdit : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          {content.subtitle && (
            <span className="inline-block px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-4">
              {content.subtitle}
            </span>
          )}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content.title}
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            {content.description}
          </p>
        </motion.div>

        {/* Quick Overview */}
        {content.overview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl mx-auto mb-16 bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl border border-primary-100"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">✦</span> Quick Overview
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              {content.overview}
            </p>
          </motion.div>
        )}

        {/* Business Features */}
        {content.features && content.features.length > 0 && (
          <div className="mb-20">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900 text-center mb-4"
            >
              What We Offer
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 text-center mb-12 max-w-2xl mx-auto"
            >
              Key features and benefits that set us apart
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                >
                  {feature.icon && (
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl mb-4">
                      {feature.icon}
                    </div>
                  )}
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Image and Mission/Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Image */}
          {content.image && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src={content.image}
                alt="About us"
                fill
                className="object-cover"
              />
            </motion.div>
          )}

          {/* Mission & Vision */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            {content.mission && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">{content.mission}</p>
              </div>
            )}
            {content.vision && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">{content.vision}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Values */}
        {content.values && content.values.length > 0 && (
          <div className="mb-20">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900 text-center mb-12"
            >
              Our Values
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {value.icon && (
                    <div className="text-4xl mb-4">{value.icon}</div>
                  )}
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h4>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {content.stats && content.stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-12"
          >
            {content.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-100 text-sm uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
