'use client';

/**
 * Design Style Phase
 * Allows users to select and customize their design preset
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Info } from 'lucide-react';
import { useBuildGuidance } from '@/lib/store/build-guidance.store';
import {
  DESIGN_PRESETS,
  BUSINESS_TYPE_PRESET_MAP,
  getAllPresetOptions,
} from '@/lib/config/design-presets';
import { DesignPresetId } from '@/lib/types/design-tokens.types';
import { hslToCssFunction } from '@/lib/utils/generate-css-variables';

export function DesignStylePhase() {
  const {
    businessVariables,
    selectedPreset,
    selectPreset,
    markPhaseComplete,
  } = useBuildGuidance();

  // Get recommended preset based on business type
  const recommendedPresetId = businessVariables.businessType
    ? BUSINESS_TYPE_PRESET_MAP[businessVariables.businessType] || 'modern-tech'
    : 'modern-tech';

  const presetOptions = getAllPresetOptions();

  // Auto-select recommended preset if none selected
  useEffect(() => {
    if (!selectedPreset && recommendedPresetId) {
      selectPreset(recommendedPresetId as DesignPresetId);
    }
  }, [recommendedPresetId, selectedPreset, selectPreset]);

  // Mark complete when preset is selected
  useEffect(() => {
    if (selectedPreset) {
      markPhaseComplete('design-style');
    }
  }, [selectedPreset, markPhaseComplete]);

  const handlePresetSelect = (presetId: DesignPresetId) => {
    selectPreset(presetId);
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <h3 className="text-lg font-semibold text-white mb-2">
          Choose Your Design Style
        </h3>
        <p className="text-sm text-gray-400">
          Select a visual style that best represents your brand personality
        </p>
      </motion.div>

      {/* Recommended Preset */}
      {recommendedPresetId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20"
        >
          <div className="flex items-center gap-2 text-primary-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI Recommended</span>
          </div>
          <p className="text-sm text-gray-300">
            Based on your {businessVariables.businessType?.replace(/-/g, ' ')} business, we recommend the{' '}
            <strong className="text-white">{DESIGN_PRESETS[recommendedPresetId as DesignPresetId]?.name}</strong> style.
          </p>
        </motion.div>
      )}

      {/* Preset Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {presetOptions.map((preset, index) => {
          const isSelected = selectedPreset === preset.id;
          const isRecommended = preset.id === recommendedPresetId;
          const presetData = DESIGN_PRESETS[preset.id];

          return (
            <motion.button
              key={preset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => handlePresetSelect(preset.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all text-left
                ${isSelected
                  ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                }
              `}
            >
              {/* Color preview */}
              <div className="flex gap-1.5 mb-3">
                <div
                  className="w-6 h-6 rounded-full shadow-inner"
                  style={{
                    backgroundColor: hslToCssFunction(presetData.colors.primary),
                  }}
                />
                <div
                  className="w-6 h-6 rounded-full shadow-inner"
                  style={{
                    backgroundColor: hslToCssFunction(presetData.colors.accent),
                  }}
                />
                <div
                  className="w-6 h-6 rounded-full shadow-inner border border-gray-600"
                  style={{
                    backgroundColor: hslToCssFunction(presetData.colors.background),
                  }}
                />
              </div>

              {/* Preset info */}
              <h4 className="font-medium text-white text-sm mb-1">
                {preset.name}
              </h4>
              <p className="text-xs text-gray-400 line-clamp-2">
                {preset.description}
              </p>

              {/* Typography preview */}
              <div className="mt-3 text-xs text-gray-500">
                <span style={{ fontFamily: presetData.typography.primary.family }}>
                  {presetData.typography.primary.family}
                </span>
              </div>

              {/* Badges */}
              <div className="absolute top-2 right-2 flex gap-1">
                {isRecommended && (
                  <span className="text-[10px] bg-primary-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                    Best Match
                  </span>
                )}
                {isSelected && (
                  <span className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Preview hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50"
      >
        <Info className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <p className="text-xs text-gray-400">
          You can customize colors in the next step, or continue with the selected style.
        </p>
      </motion.div>
    </div>
  );
}

export default DesignStylePhase;
