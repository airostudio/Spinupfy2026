'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { ArrowRight, Check } from 'lucide-react';

interface Service {
  title: string;
  description: string;
  features?: string[];
  image?: string;
  price?: string;
  icon?: string;
}

interface ServicesSectionProps {
  content: {
    title: string;
    subtitle?: string;
    description?: string;
    services: Service[];
  };
  editable?: boolean;
  onEdit?: () => void;
}

export function ServicesSection({ content, editable, onEdit }: ServicesSectionProps) {
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
          {content.description && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {content.description}
            </p>
          )}
        </motion.div>

        {/* Services Grid - 2 rows of 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all group"
            >
              {/* Service Image */}
              {service.image && (
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Service Content */}
              <div className="p-8">
                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-4">
                  {service.icon && (
                    <div className="text-4xl">{service.icon}</div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    {service.price && (
                      <div className="text-primary-600 font-bold text-lg">
                        {service.price}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                {service.features && service.features.length > 0 && (
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary-600" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA Button */}
                <Button
                  variant="outline"
                  className="w-full border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = '/contact';
                  }}
                >
                  Learn More
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-6">
            Need a custom solution? We&apos;re here to help.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
            rightIcon={<ArrowRight className="w-5 h-5" />}
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = '/contact';
            }}
          >
            Contact Us
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
