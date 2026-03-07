'use client';

/**
 * Color Customization Phase
 * Allows fine-tuning of color palette
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, RotateCcw, Check, Eye } from 'lucide-react';
import { useBuildGuidance } from '@/lib/store/build-guidance.store';
import { DESIGN_PRESETS } from '@/lib/config/design-presets';
import { HSLColor } from '@/lib/types/design-tokens.types';
import { hslToCssFunction, hslToHex } from '@/lib/utils/generate-css-variables';

// Simple color picker component
function ColorPicker({
  label,
  color,
  onChange,
}: {
  label: string;
  color: HSLColor;
  onChange: (color: HSLColor) => void;
}) {
  const hexValue = hslToHex(color);
  const [localHex, setLocalHex] = useState(hexValue);

  useEffect(() => {
    setLocalHex(hslToHex(color));
  }, [color]);

  const handleHexChange = (hex: string) => {
    setLocalHex(hex);
    // Convert hex to HSL
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / d + 2) / 6;
            break;
          case b:
            h = ((r - g) / d + 4) / 6;
            break;
        }
      }

      onChange({
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
      });
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={hexValue}
            onChange={(e) => handleHexChange(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-700 overflow-hidden"
            style={{ backgroundColor: hexValue }}
          />
        </div>
        <input
          type="text"
          value={localHex}
          onChange={(e) => handleHexChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export function ColorCustomizationPhase() {
  const {
    selectedPreset,
    designTokens,
    updateDesignTokens,
    resetToPreset,
    customizedColors,
    markPhaseComplete,
  } = useBuildGuidance();

  const presetData = selectedPreset ? DESIGN_PRESETS[selectedPreset] : null;

  useEffect(() => {
    markPhaseComplete('color-customization');
  }, [markPhaseComplete]);

  if (!presetData || !designTokens.colors) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Please select a design style first.</p>
      </div>
    );
  }

  const handleColorChange = (colorKey: string, newColor: HSLColor) => {
    if (!designTokens.colors) return;
    const newColors = {
      ...designTokens.colors,
      [colorKey]: newColor,
    } as typeof designTokens.colors;
    updateDesignTokens({ colors: newColors });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h3 className="text-lg font-semibold text-white">Customize Colors</h3>
          <p className="text-sm text-gray-400">Fine-tune your color palette</p>
        </div>
        {customizedColors && (
          <button
            onClick={resetToPreset}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </motion.div>

      {/* Color Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl border border-gray-700 overflow-hidden"
        style={{
          backgroundColor: hslToCssFunction(designTokens.colors.background),
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h4
            className="text-lg font-semibold"
            style={{
              color: hslToCssFunction(designTokens.colors.foreground),
              fontFamily: designTokens.typography?.primary?.family,
            }}
          >
            Preview Header
          </h4>
          <div
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: hslToCssFunction(designTokens.colors.primary),
              color: hslToCssFunction(designTokens.colors.primaryForeground),
            }}
          >
            Button
          </div>
        </div>
        <p
          className="text-sm mb-3"
          style={{
            color: hslToCssFunction(designTokens.colors.mutedForeground),
          }}
        >
          This is how your text will look with the selected colors.
        </p>
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: hslToCssFunction(designTokens.colors.card),
            borderColor: hslToCssFunction(designTokens.colors.border),
            borderWidth: '1px',
          }}
        >
          <span
            className="text-sm font-medium"
            style={{
              color: hslToCssFunction(designTokens.colors.accent),
            }}
          >
            Accent Color Text
          </span>
        </div>
      </motion.div>

      {/* Color Pickers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h4 className="text-sm font-medium text-gray-300">Main Colors</h4>

        <div className="grid grid-cols-2 gap-4">
          <ColorPicker
            label="Primary Color"
            color={designTokens.colors.primary}
            onChange={(c) => handleColorChange('primary', c)}
          />
          <ColorPicker
            label="Accent Color"
            color={designTokens.colors.accent}
            onChange={(c) => handleColorChange('accent', c)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ColorPicker
            label="Background"
            color={designTokens.colors.background}
            onChange={(c) => handleColorChange('background', c)}
          />
          <ColorPicker
            label="Text Color"
            color={designTokens.colors.foreground}
            onChange={(c) => handleColorChange('foreground', c)}
          />
        </div>
      </motion.div>

      {/* Quick palettes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h4 className="text-sm font-medium text-gray-300">Quick Palettes</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Original', preset: selectedPreset },
            { name: 'Navy & Gold', colors: { primary: { h: 210, s: 60, l: 20 }, accent: { h: 45, s: 80, l: 55 } } },
            { name: 'Forest', colors: { primary: { h: 150, s: 40, l: 25 }, accent: { h: 80, s: 50, l: 50 } } },
            { name: 'Coral', colors: { primary: { h: 15, s: 80, l: 50 }, accent: { h: 45, s: 90, l: 55 } } },
            { name: 'Slate', colors: { primary: { h: 215, s: 20, l: 25 }, accent: { h: 200, s: 70, l: 50 } } },
          ].map((palette) => (
            <button
              key={palette.name}
              onClick={() => {
                if (palette.preset) {
                  resetToPreset();
                } else if (palette.colors && designTokens.colors) {
                  const newColors = {
                    ...designTokens.colors,
                    ...palette.colors,
                  } as typeof designTokens.colors;
                  updateDesignTokens({ colors: newColors });
                }
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors border border-gray-700"
            >
              {palette.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-gray-500 text-center"
      >
        This step is optional. Your selected style already has great colors!
      </motion.p>
    </div>
  );
}

export default ColorCustomizationPhase;
