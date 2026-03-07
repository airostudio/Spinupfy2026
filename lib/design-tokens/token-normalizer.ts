/**
 * Design Token Normalizer and Validator
 * Converts extracted colors to design tokens with contrast validation
 */

import type { DesignTokens } from '../archetypes/archetype-packs';

/**
 * Color utility functions
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  // Convert to sRGB
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  // Linearize
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG contrast validation
 * AA: 4.5:1 for normal text, 3:1 for large text
 * AAA: 7:1 for normal text, 4.5:1 for large text
 */
export function meetsWCAG_AA(foreground: string, background: string, largeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

export function meetsWCAG_AAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Extract dominant colors from a palette
 * Simulates color extraction from screenshots
 */
export interface ExtractedPalette {
  dominant: string[];      // 5-7 dominant colors
  background: string;      // Likely background color
  foreground: string;      // Likely text color
  accent: string[];        // Accent colors
}

/**
 * Normalize extracted colors into design tokens
 */
export function normalizeToDesignTokens(extracted: ExtractedPalette): Partial<DesignTokens['colors']> {
  const { dominant, background, foreground, accent } = extracted;

  // Sort colors by luminance
  const sortedByLuminance = [...dominant].sort((a, b) => getLuminance(a) - getLuminance(b));

  // Identify lightest and darkest
  const lightest = sortedByLuminance[sortedByLuminance.length - 1];
  const darkest = sortedByLuminance[0];

  // Determine if light or dark theme
  const isLightTheme = getLuminance(background) > 0.5;

  // Build token mapping
  const tokens: Partial<DesignTokens['colors']> = {
    bg: background,
    surface: isLightTheme ? lightest : adjustLuminance(background, 0.05),
    text: foreground,
    muted: isLightTheme ? adjustLuminance(foreground, -0.3) : adjustLuminance(foreground, 0.3),
  };

  // Primary color (first accent or middle dominant color)
  const primary = accent[0] || sortedByLuminance[Math.floor(sortedByLuminance.length / 2)];
  tokens.primary = primary;

  // Ensure primary has good contrast
  tokens.primaryContrast = getBestContrast(primary, ['#FFFFFF', '#000000']);

  // Accent color (second accent or complementary)
  tokens.accent = accent[1] || getComplementary(primary);

  // Border color
  tokens.border = isLightTheme
    ? adjustLuminance(background, -0.1)
    : adjustLuminance(background, 0.1);

  // Semantic colors (defaults)
  tokens.success = '#10B981'; // Green
  tokens.warning = '#F59E0B'; // Amber
  tokens.error = '#EF4444';   // Red

  return tokens;
}

/**
 * Adjust luminance of a color
 */
function adjustLuminance(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (value: number) => {
    const adjusted = value + (amount * 255);
    return Math.max(0, Math.min(255, Math.round(adjusted)));
  };

  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}

/**
 * Get complementary color (opposite on color wheel)
 */
function getComplementary(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  // Simple complementary: invert hue
  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
}

/**
 * Get best contrast color from options
 */
function getBestContrast(background: string, options: string[]): string {
  let bestColor = options[0];
  let bestRatio = 0;

  for (const color of options) {
    const ratio = getContrastRatio(background, color);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestColor = color;
    }
  }

  return bestColor;
}

/**
 * Harmonize colors (slight hue/saturation normalization)
 */
export function harmonizePalette(colors: string[]): string[] {
  // This is a simplified version
  // In production, you'd use a proper color space (HSL/HSV) and adjust
  return colors.map(color => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    // Subtle saturation boost
    const factor = 1.05;
    return rgbToHex(
      Math.min(255, Math.round(rgb.r * factor)),
      Math.min(255, Math.round(rgb.g * factor)),
      Math.min(255, Math.round(rgb.b * factor))
    );
  });
}

/**
 * Validate design tokens
 */
export interface ValidationResult {
  valid: boolean;
  issues: string[];
  warnings: string[];
}

export function validateDesignTokens(tokens: DesignTokens): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check contrast ratios
  const textContrast = getContrastRatio(tokens.colors.text, tokens.colors.bg);
  if (textContrast < 4.5) {
    issues.push(`Text contrast ratio ${textContrast.toFixed(2)} is below WCAG AA (4.5:1)`);
  }

  const primaryContrast = getContrastRatio(tokens.colors.primaryContrast, tokens.colors.primary);
  if (primaryContrast < 4.5) {
    issues.push(`Primary button contrast ratio ${primaryContrast.toFixed(2)} is below WCAG AA`);
  }

  // Check for valid hex colors
  const colorKeys = Object.keys(tokens.colors) as Array<keyof typeof tokens.colors>;
  for (const key of colorKeys) {
    const color = tokens.colors[key];
    if (color && !hexToRgb(color)) {
      issues.push(`Invalid hex color for ${key}: ${color}`);
    }
  }

  // Warnings for suboptimal choices
  if (textContrast < 7) {
    warnings.push(`Text contrast ${textContrast.toFixed(2)} could be improved for AAA compliance (7:1)`);
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
  };
}

/**
 * Generate complete design tokens from a base palette
 */
export function generateDesignTokens(
  extractedPalette: ExtractedPalette,
  typography?: Partial<DesignTokens['typography']>
): DesignTokens {
  const colors = normalizeToDesignTokens(extractedPalette);

  return {
    colors: {
      bg: colors.bg || '#FFFFFF',
      surface: colors.surface || '#FFFFFF',
      text: colors.text || '#000000',
      muted: colors.muted || '#666666',
      primary: colors.primary || '#3B82F6',
      primaryContrast: colors.primaryContrast || '#FFFFFF',
      accent: colors.accent || '#10B981',
      border: colors.border || '#E5E7EB',
      success: colors.success || '#10B981',
      warning: colors.warning || '#F59E0B',
      error: colors.error || '#EF4444',
    },
    typography: {
      headingFont: typography?.headingFont || 'Inter, sans-serif',
      bodyFont: typography?.bodyFont || 'Inter, sans-serif',
      headingWeight: typography?.headingWeight || 700,
      bodyWeight: typography?.bodyWeight || 400,
      baseSize: typography?.baseSize || '16px',
      scale: typography?.scale || 1.25,
    },
    spacing: {
      unit: 8,
      scale: [0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24],
    },
    radii: {
      sm: '6px',
      md: '10px',
      lg: '16px',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.06)',
      md: '0 4px 12px rgba(0, 0, 0, 0.10)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.14)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.18)',
    },
  };
}
