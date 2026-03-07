'use client';

import { motion } from 'framer-motion';
import { Shield, Award, Star, CheckCircle, Lock, TrendingUp } from 'lucide-react';

interface TrustBadge {
  icon: 'shield' | 'award' | 'star' | 'check' | 'lock' | 'trending';
  text: string;
  subtext?: string;
}

interface TrustBadgesSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    badges: TrustBadge[];
    logoWall?: {
      title: string;
      logos: Array<{ name: string; image?: string }>;
    };
  };
  editable?: boolean;
  onEdit?: () => void;
}

const iconMap = {
  shield: Shield,
  award: Award,
  star: Star,
  check: CheckCircle,
  lock: Lock,
  trending: TrendingUp,
};

export function TrustBadgesSection({ content, editable, onEdit }: TrustBadgesSectionProps) {
  return (
    <section
      className="relative py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
      onClick={editable ? onEdit : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {(content.title || content.subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {content.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {content.subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Trust Badges Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16"
        >
          {content.badges?.map((badge, index) => {
            const Icon = iconMap[badge.icon] || Shield;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-200 hover-lift"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {badge.text}
                </div>
                {badge.subtext && (
                  <div className="text-xs text-gray-600">{badge.subtext}</div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Logo Wall */}
        {content.logoWall && content.logoWall.logos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-center mb-8">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {content.logoWall.title}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {content.logoWall.logos.map((logo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                  className="grayscale hover:grayscale-0 transition-all duration-300 opacity-50 hover:opacity-100"
                >
                  {logo.image ? (
                    <img
                      src={logo.image}
                      alt={logo.name}
                      className="h-8 md:h-10 object-contain"
                    />
                  ) : (
                    <div className="px-6 py-3 bg-gray-100 rounded-lg">
                      <span className="text-lg font-bold text-gray-600">
                        {logo.name}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
