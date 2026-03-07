/**
 * CSS Variable Generator for Design Tokens
 * Converts design tokens to CSS custom properties
 */

import {
  DesignTokens,
  HSLColor,
  BorderRadiusOption,
  SpacingOption,
  MaxWidthOption,
  AnimationDuration,
} from '../types/design-tokens.types';

/**
 * Convert HSL color object to CSS string
 */
export function hslToString(color: HSLColor): string {
  return `${color.h} ${color.s}% ${color.l}%`;
}

/**
 * Convert HSL color to full hsl() CSS function
 */
export function hslToCssFunction(color: HSLColor): string {
  return `hsl(${color.h} ${color.s}% ${color.l}%)`;
}

/**
 * Convert HSL color to hex (for meta tags, etc.)
 */
export function hslToHex(color: HSLColor): string {
  const { h, s, l } = color;
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Get border radius CSS value
 */
function getBorderRadiusValue(radius: BorderRadiusOption): string {
  const values: Record<BorderRadiusOption, string> = {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  };
  return values[radius] || '0.5rem';
}

/**
 * Get spacing multiplier value
 */
function getSpacingValue(spacing: SpacingOption): string {
  const values: Record<SpacingOption, string> = {
    compact: '0.75',
    normal: '1',
    spacious: '1.25',
    luxurious: '1.5',
  };
  return values[spacing] || '1';
}

/**
 * Get max width CSS value
 */
function getMaxWidthValue(maxWidth: MaxWidthOption): string {
  const values: Record<MaxWidthOption, string> = {
    narrow: '960px',
    normal: '1280px',
    wide: '1536px',
    full: '100%',
  };
  return values[maxWidth] || '1280px';
}

/**
 * Get animation duration CSS value
 */
function getAnimationDurationValue(duration: AnimationDuration): string {
  const values: Record<AnimationDuration, string> = {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    none: '0ms',
  };
  return values[duration] || '300ms';
}

/**
 * Generate CSS custom properties from design tokens
 */
export function generateCSSVariables(tokens: DesignTokens): string {
  const { colors, gradients, shadows, layout, animation } = tokens;

  return `
:root {
  /* ============================================ */
  /* COLOR TOKENS */
  /* ============================================ */
  --primary: ${hslToString(colors.primary)};
  --primary-foreground: ${hslToString(colors.primaryForeground)};
  --secondary: ${hslToString(colors.secondary)};
  --secondary-foreground: ${hslToString(colors.secondaryForeground)};
  --accent: ${hslToString(colors.accent)};
  --accent-foreground: ${hslToString(colors.accentForeground)};
  --background: ${hslToString(colors.background)};
  --foreground: ${hslToString(colors.foreground)};
  --muted: ${hslToString(colors.muted)};
  --muted-foreground: ${hslToString(colors.mutedForeground)};
  --border: ${hslToString(colors.border)};
  --card: ${hslToString(colors.card)};
  --card-foreground: ${hslToString(colors.cardForeground)};
  --destructive: ${hslToString(colors.destructive)};
  --destructive-foreground: ${hslToString(colors.destructiveForeground)};
  --ring: ${hslToString(colors.accent)};
  --input: ${hslToString(colors.border)};

  /* ============================================ */
  /* GRADIENT TOKENS */
  /* ============================================ */
  --gradient-primary: ${gradients.primary};
  --gradient-accent: ${gradients.accent};
  --gradient-overlay: ${gradients.overlay};
  --gradient-hero: ${gradients.hero};
  --gradient-subtle: ${gradients.subtle};

  /* ============================================ */
  /* SHADOW TOKENS */
  /* ============================================ */
  --shadow-sm: ${shadows.sm};
  --shadow-md: ${shadows.md};
  --shadow-lg: ${shadows.lg};
  --shadow-xl: ${shadows.xl};
  --shadow-card: ${shadows.card};
  --shadow-hover: ${shadows.hover};
  --shadow-inner: ${shadows.inner};

  /* ============================================ */
  /* LAYOUT TOKENS */
  /* ============================================ */
  --radius: ${getBorderRadiusValue(layout.borderRadius)};
  --radius-sm: calc(${getBorderRadiusValue(layout.borderRadius)} * 0.5);
  --radius-lg: calc(${getBorderRadiusValue(layout.borderRadius)} * 1.5);
  --radius-xl: calc(${getBorderRadiusValue(layout.borderRadius)} * 2);
  --spacing-multiplier: ${getSpacingValue(layout.spacing)};
  --max-width: ${getMaxWidthValue(layout.maxWidth)};

  /* ============================================ */
  /* ANIMATION TOKENS */
  /* ============================================ */
  --animation-duration: ${getAnimationDurationValue(animation.duration)};
  --animation-duration-fast: calc(${getAnimationDurationValue(animation.duration)} * 0.5);
  --animation-duration-slow: calc(${getAnimationDurationValue(animation.duration)} * 2);
  --animation-enabled: ${animation.enabled ? '1' : '0'};

  /* ============================================ */
  /* COMPONENT TOKENS */
  /* ============================================ */
  --hero-min-height: ${tokens.components.hero.minHeight};
  --hero-overlay-opacity: ${tokens.components.hero.overlayOpacity};
  --section-padding: calc(4rem * var(--spacing-multiplier));
  --card-padding: calc(1.5rem * var(--spacing-multiplier));
}
`.trim();
}

/**
 * Generate Google Fonts import statement
 */
export function generateGoogleFontsImport(tokens: DesignTokens): string {
  const fonts = new Set<string>();

  if (tokens.typography.primary.googleFontUrl) {
    fonts.add(tokens.typography.primary.googleFontUrl);
  }
  if (tokens.typography.secondary.googleFontUrl) {
    fonts.add(tokens.typography.secondary.googleFontUrl);
  }

  // Combine into a single import if both are Google Fonts
  const primaryFamily = encodeURIComponent(tokens.typography.primary.family);
  const secondaryFamily = encodeURIComponent(tokens.typography.secondary.family);
  const primaryWeights = tokens.typography.primary.weights.join(';');
  const secondaryWeights = tokens.typography.secondary.weights.join(';');

  return `@import url('https://fonts.googleapis.com/css2?family=${primaryFamily}:wght@${primaryWeights}&family=${secondaryFamily}:wght@${secondaryWeights}&display=swap');`;
}

/**
 * Generate typography CSS
 */
export function generateTypographyCSS(tokens: DesignTokens): string {
  const { typography } = tokens;

  return `
/* Typography */
:root {
  --font-primary: '${typography.primary.family}', ${typography.primary.fallback};
  --font-secondary: '${typography.secondary.family}', ${typography.secondary.fallback};
}

body {
  font-family: var(--font-secondary);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-primary);
}
`.trim();
}

/**
 * Generate utility classes for the design tokens
 */
export function generateUtilityClasses(tokens: DesignTokens): string {
  return `
/* Design Token Utility Classes */
.text-gradient-primary {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-accent {
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.bg-gradient-primary {
  background: var(--gradient-primary);
}

.bg-gradient-accent {
  background: var(--gradient-accent);
}

.bg-gradient-subtle {
  background: var(--gradient-subtle);
}

.shadow-card {
  box-shadow: var(--shadow-card);
}

.shadow-hover {
  box-shadow: var(--shadow-hover);
}

.hover-lift {
  transition: transform var(--animation-duration) ease, box-shadow var(--animation-duration) ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.hover-scale {
  transition: transform var(--animation-duration) ease;
}

.hover-scale:hover {
  transform: scale(1.02);
}

.hover-glow {
  transition: box-shadow var(--animation-duration) ease;
}

.hover-glow:hover {
  box-shadow: 0 0 20px hsl(var(--accent) / 0.4);
}

.glass {
  background: hsl(var(--background) / 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.glass-dark {
  background: hsl(var(--foreground) / 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Animation classes */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in var(--animation-duration-slow) ease-out forwards;
}

.animate-slide-up {
  animation: slide-up var(--animation-duration-slow) ease-out forwards;
}

.animate-scale-in {
  animation: scale-in var(--animation-duration) ease-out forwards;
}

/* Stagger animation delays */
.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
.stagger-4 { animation-delay: 0.4s; }
.stagger-5 { animation-delay: 0.5s; }
`.trim();
}

/**
 * Generate complete CSS from design tokens
 */
export function generateCompleteCSS(tokens: DesignTokens): string {
  const parts = [
    generateGoogleFontsImport(tokens),
    generateCSSVariables(tokens),
    generateTypographyCSS(tokens),
    generateUtilityClasses(tokens),
  ];

  return parts.join('\n\n');
}

/**
 * Generate inline style object for React components
 */
export function generateInlineStyles(tokens: DesignTokens): Record<string, string> {
  const { colors } = tokens;

  return {
    '--primary': hslToString(colors.primary),
    '--primary-foreground': hslToString(colors.primaryForeground),
    '--accent': hslToString(colors.accent),
    '--accent-foreground': hslToString(colors.accentForeground),
    '--background': hslToString(colors.background),
    '--foreground': hslToString(colors.foreground),
    '--card': hslToString(colors.card),
    '--card-foreground': hslToString(colors.cardForeground),
    '--border': hslToString(colors.border),
    '--muted': hslToString(colors.muted),
    '--muted-foreground': hslToString(colors.mutedForeground),
  };
}

/**
 * Generate meta theme color for mobile browsers
 */
export function generateThemeColor(tokens: DesignTokens): string {
  return hslToHex(tokens.colors.primary);
}

/**
 * Validate design tokens structure
 */
export function validateDesignTokens(tokens: unknown): tokens is DesignTokens {
  if (typeof tokens !== 'object' || tokens === null) {
    return false;
  }

  const t = tokens as Record<string, unknown>;

  // Check required top-level properties
  const requiredProps = ['id', 'name', 'typography', 'colors', 'gradients', 'shadows', 'layout', 'components', 'animation', 'mood'];
  for (const prop of requiredProps) {
    if (!(prop in t)) {
      console.warn(`Missing required property: ${prop}`);
      return false;
    }
  }

  return true;
}
