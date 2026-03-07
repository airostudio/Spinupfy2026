'use client';

/**
 * Design Tokens Context
 * Provides design tokens throughout the application
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DesignTokens, DesignPresetId } from '../types/design-tokens.types';
import { DESIGN_PRESETS } from '../config/design-presets';
import { generateCSSVariables, generateGoogleFontsImport } from '../utils/generate-css-variables';

interface DesignTokensContextValue {
  tokens: DesignTokens;
  presetId: DesignPresetId;
  setPreset: (presetId: DesignPresetId) => void;
  updateTokens: (updates: Partial<DesignTokens>) => void;
  resetToPreset: () => void;
  cssVariables: string;
  isCustomized: boolean;
}

const DesignTokensContext = createContext<DesignTokensContextValue | null>(null);

interface DesignTokensProviderProps {
  children: React.ReactNode;
  initialPreset?: DesignPresetId;
  initialTokens?: Partial<DesignTokens>;
}

export function DesignTokensProvider({
  children,
  initialPreset = 'modern-tech',
  initialTokens,
}: DesignTokensProviderProps) {
  const [presetId, setPresetId] = useState<DesignPresetId>(initialPreset);
  const [customTokens, setCustomTokens] = useState<Partial<DesignTokens>>(initialTokens || {});
  const [isCustomized, setIsCustomized] = useState(false);

  // Merge preset with custom tokens
  const tokens = useMemo((): DesignTokens => {
    const preset = DESIGN_PRESETS[presetId];
    return {
      ...preset,
      ...customTokens,
      colors: {
        ...preset.colors,
        ...(customTokens.colors || {}),
      },
      typography: {
        ...preset.typography,
        ...(customTokens.typography || {}),
      },
      layout: {
        ...preset.layout,
        ...(customTokens.layout || {}),
      },
      components: {
        ...preset.components,
        ...(customTokens.components || {}),
      },
      animation: {
        ...preset.animation,
        ...(customTokens.animation || {}),
      },
    };
  }, [presetId, customTokens]);

  // Generate CSS variables
  const cssVariables = useMemo(() => {
    return generateCSSVariables(tokens);
  }, [tokens]);

  // Inject CSS variables into document
  useEffect(() => {
    // Create or update style element
    let styleElement = document.getElementById('design-tokens-style');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'design-tokens-style';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = cssVariables;

    // Load Google Fonts
    const fontsImport = generateGoogleFontsImport(tokens);
    let fontsElement = document.getElementById('design-tokens-fonts');
    if (!fontsElement) {
      fontsElement = document.createElement('style');
      fontsElement.id = 'design-tokens-fonts';
      document.head.appendChild(fontsElement);
    }
    fontsElement.textContent = fontsImport;

    return () => {
      // Cleanup on unmount
      styleElement?.remove();
      fontsElement?.remove();
    };
  }, [cssVariables, tokens]);

  // Set preset
  const setPreset = (newPresetId: DesignPresetId) => {
    setPresetId(newPresetId);
    setCustomTokens({});
    setIsCustomized(false);
  };

  // Update tokens
  const updateTokens = (updates: Partial<DesignTokens>) => {
    setCustomTokens(prev => {
      const newTokens: Partial<DesignTokens> = {
        ...prev,
        ...updates,
      };
      // Only update colors if provided
      if (updates.colors) {
        newTokens.colors = prev.colors
          ? { ...prev.colors, ...updates.colors }
          : updates.colors;
      }
      return newTokens;
    });
    setIsCustomized(true);
  };

  // Reset to preset
  const resetToPreset = () => {
    setCustomTokens({});
    setIsCustomized(false);
  };

  const value: DesignTokensContextValue = {
    tokens,
    presetId,
    setPreset,
    updateTokens,
    resetToPreset,
    cssVariables,
    isCustomized,
  };

  return (
    <DesignTokensContext.Provider value={value}>
      {children}
    </DesignTokensContext.Provider>
  );
}

// Hook to use design tokens
export function useDesignTokens(): DesignTokensContextValue {
  const context = useContext(DesignTokensContext);
  if (!context) {
    throw new Error('useDesignTokens must be used within a DesignTokensProvider');
  }
  return context;
}

// Hook to get CSS variable value
export function useCSSVariable(variableName: string): string {
  const { tokens } = useDesignTokens();
  // This is a simplified version - in production you might want to
  // actually read from the computed style
  return `var(${variableName})`;
}
