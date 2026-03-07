'use client';

/**
 * Review Phase
 * Final review before generating the website
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Building,
  Palette,
  MessageSquare,
  Image,
  Check,
  ChevronRight,
  Edit2,
} from 'lucide-react';
import { useBuildGuidance } from '@/lib/store/build-guidance.store';
import { DESIGN_PRESETS } from '@/lib/config/design-presets';
import { getBusinessTypeById } from '@/lib/config/business-types';
import { hslToCssFunction } from '@/lib/utils/generate-css-variables';

export function ReviewPhase() {
  const {
    businessVariables,
    selectedPreset,
    designTokens,
    contentTone,
    imageSelections,
    setPhase,
    startGeneration,
  } = useBuildGuidance();

  const presetData = selectedPreset ? DESIGN_PRESETS[selectedPreset] : null;
  const businessType = businessVariables.businessType
    ? getBusinessTypeById(businessVariables.businessType)
    : null;

  const sections = [
    {
      id: 'business',
      icon: Building,
      title: 'Business Details',
      phase: 'business-details' as const,
      items: [
        { label: 'Name', value: businessVariables.businessName },
        { label: 'Type', value: businessType?.label },
        { label: 'Description', value: businessVariables.description?.slice(0, 100) + (businessVariables.description && businessVariables.description.length > 100 ? '...' : '') },
      ],
    },
    {
      id: 'design',
      icon: Palette,
      title: 'Design Style',
      phase: 'design-style' as const,
      items: [
        { label: 'Style', value: presetData?.name },
        { label: 'Mood', value: presetData?.mood },
      ],
      colors: designTokens.colors ? [
        designTokens.colors.primary,
        designTokens.colors.accent,
        designTokens.colors.background,
      ] : [],
    },
    {
      id: 'content',
      icon: MessageSquare,
      title: 'Content & Tone',
      phase: 'content-tone' as const,
      items: [
        { label: 'Tone', value: contentTone?.charAt(0).toUpperCase() + contentTone?.slice(1) },
        { label: 'Tagline', value: businessVariables.tagline || 'Auto-generated' },
      ],
    },
    {
      id: 'images',
      icon: Image,
      title: 'Images',
      phase: 'images' as const,
      items: [
        { label: 'Hero', value: imageSelections.selectedHero ? 'Selected' : 'Auto-select' },
        { label: 'About', value: imageSelections.selectedAbout ? 'Selected' : 'Auto-select' },
      ],
    },
  ];

  const handleEdit = (phase: typeof sections[0]['phase']) => {
    setPhase(phase);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-3">
          <Check className="w-6 h-6 text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Ready to Generate
        </h3>
        <p className="text-sm text-gray-400">
          Review your choices before we create your website
        </p>
      </motion.div>

      {/* Review Sections */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary-400" />
                  </div>
                  <h4 className="text-sm font-medium text-white">{section.title}</h4>
                </div>
                <button
                  onClick={() => handleEdit(section.phase)}
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-start justify-between">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-xs text-gray-300 text-right max-w-[60%]">
                      {item.value || '-'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Colors preview */}
              {section.colors && section.colors.length > 0 && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700/50">
                  <span className="text-xs text-gray-500">Colors:</span>
                  <div className="flex gap-1">
                    {section.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border border-gray-600"
                        style={{ backgroundColor: hslToCssFunction(color) }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* What happens next */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20"
      >
        <h4 className="text-sm font-medium text-white mb-2">What happens next?</h4>
        <ul className="space-y-2">
          {[
            'AI generates personalized content',
            'Professional images are selected',
            'Your website is built and styled',
            'You can edit everything afterwards',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
              <ChevronRight className="w-3 h-3 text-primary-400" />
              {item}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-gray-500 text-center"
      >
        Click &ldquo;Generate Website&rdquo; to create your site. You can edit everything after.
      </motion.p>
    </div>
  );
}

export default ReviewPhase;
