/**
 * Web-Inspired Design Capture System
 *
 * Analyzes exemplar websites to extract:
 * - Color palettes (CSS + dominant colors)
 * - Layout signals (hero, sections, density, spacing)
 * - Typography patterns
 * - Component styles
 *
 * This system helps create design tokens from real-world examples
 */

import { DesignTokens, LayoutRecipe, ComponentVariants } from './archetype-packs';

// ===================
// TYPES
// ===================

export interface ExemplarWebsite {
  url: string;
  businessType: string;
  ranking: number; // 1-10 quality score
  notes?: string;
}

export interface CapturedPalette {
  dominant: string[];     // Top 5-8 dominant colors from screenshot
  css: string[];          // Colors extracted from CSS
  normalized: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    primary: string;
    primaryContrast: string;
    accent: string;
    accentContrast?: string;
    border?: string;
  };
  contrastValid: boolean; // WCAG validation
}

export interface LayoutSignals {
  hasHero: boolean;
  heroStyle: 'centered' | 'split' | 'fullscreen' | 'minimal';
  sections: Array<{
    type: string;
    pattern: string;
  }>;
  density: 'tight' | 'balanced' | 'spacious';
  spacing: {
    average: number;
    unit: number; // Detected base unit (4 or 8)
  };
  maxWidth: 'narrow' | 'standard' | 'wide' | 'full';
}

export interface TypographySignals {
  headingFont: string;
  bodyFont: string;
  headingWeight: number;
  scale: number; // Detected type scale
}

export interface CapturedDesign {
  palette: CapturedPalette;
  layout: LayoutSignals;
  typography: TypographySignals;
  exemplarUrl: string;
}

// ===================
// EXEMPLAR FINDER
// ===================

/**
 * Find exemplar websites for a business type + vibe
 * Uses search patterns to find high-quality examples
 */
export async function findExemplars(
  businessType: string,
  vibe: string,
  count: number = 10
): Promise<ExemplarWebsite[]> {
  // Search query patterns
  const searchQueries = [
    `best ${businessType} websites`,
    `${businessType} website design inspiration`,
    `${businessType} Shopify examples`,
    `${vibe} ${businessType} web design`,
    `award-winning ${businessType} websites`,
  ];

  // This would integrate with a real web search API
  // For now, return curated examples based on business type
  const curatedExemplars = getCuratedExemplars(businessType);

  return curatedExemplars.slice(0, count);
}

/**
 * Curated exemplar database for common business types
 */
function getCuratedExemplars(businessType: string): ExemplarWebsite[] {
  const exemplarDatabase: Record<string, ExemplarWebsite[]> = {
    'bakery': [
      { url: 'tartinebakery.com', businessType: 'bakery', ranking: 9, notes: 'Artisanal, warm aesthetic' },
      { url: 'levainbakery.com', businessType: 'bakery', ranking: 8, notes: 'Modern, product-focused' },
      { url: 'magnoliabakery.com', businessType: 'bakery', ranking: 8, notes: 'Classic, inviting' },
      { url: 'dominiqueansel.com', businessType: 'bakery', ranking: 9, notes: 'High-end, elegant' },
    ],
    'restaurant': [
      { url: 'elevenmadisonpark.com', businessType: 'restaurant', ranking: 10, notes: 'Luxury fine dining' },
      { url: 'alinearestaurant.com', businessType: 'restaurant', ranking: 9, notes: 'Modern minimalist' },
      { url: 'thefrenchlaundry.com', businessType: 'restaurant', ranking: 10, notes: 'Classic elegance' },
    ],
    'law-firm': [
      { url: 'skadden.com', businessType: 'law-firm', ranking: 9, notes: 'Corporate professional' },
      { url: 'bakermckenzie.com', businessType: 'law-firm', ranking: 9, notes: 'Global authority' },
      { url: 'lw.com', businessType: 'law-firm', ranking: 8, notes: 'Clean modern' },
    ],
    'tech-saas': [
      { url: 'stripe.com', businessType: 'tech-saas', ranking: 10, notes: 'Modern minimal perfection' },
      { url: 'linear.app', businessType: 'tech-saas', ranking: 10, notes: 'Sleek product-focused' },
      { url: 'notion.so', businessType: 'tech-saas', ranking: 9, notes: 'Friendly modern' },
      { url: 'vercel.com', businessType: 'tech-saas', ranking: 9, notes: 'Developer-focused' },
    ],
    'electrician': [
      { url: 'mistersparky.com', businessType: 'electrician', ranking: 7, notes: 'Professional trustworthy' },
      { url: 'homeadvisor.com/electrician', businessType: 'electrician', ranking: 6, notes: 'Service marketplace' },
    ],
    'plumber': [
      { url: 'rotorooter.com', businessType: 'plumber', ranking: 7, notes: 'Established brand' },
      { url: 'benjaminfranklinplumbing.com', businessType: 'plumber', ranking: 8, notes: 'Professional reliable' },
      { url: 'mrrooter.com', businessType: 'plumber', ranking: 7, notes: 'Clean modern' },
    ],
    'real-estate': [
      { url: 'sothebysrealty.com', businessType: 'real-estate', ranking: 10, notes: 'Luxury premium' },
      { url: 'christiesrealestate.com', businessType: 'real-estate', ranking: 10, notes: 'High-end elegance' },
      { url: 'compass.com', businessType: 'real-estate', ranking: 9, notes: 'Modern tech-forward' },
    ],
    'creative-agency': [
      { url: 'pentagram.com', businessType: 'creative-agency', ranking: 10, notes: 'Bold creative' },
      { url: 'ideo.com', businessType: 'creative-agency', ranking: 9, notes: 'Innovation-focused' },
      { url: 'metalab.com', businessType: 'creative-agency', ranking: 9, notes: 'Product design' },
    ],
    'beauty-spa': [
      { url: 'canyonranch.com', businessType: 'beauty-spa', ranking: 9, notes: 'Luxury wellness' },
      { url: 'miravalresorts.com', businessType: 'beauty-spa', ranking: 9, notes: 'Serene premium' },
    ],
  };

  return exemplarDatabase[businessType] || [];
}

// ===================
// COLOR EXTRACTION
// ===================

/**
 * Extract color palette from a website
 * Two-layer method: CSS scraping + screenshot dominant colors
 */
export async function extractPalette(url: string): Promise<CapturedPalette> {
  // Layer 1: CSS color scraping (fast)
  const cssColors = await extractCSSColors(url);

  // Layer 2: Screenshot dominant colors (robust)
  const dominantColors = await extractDominantColors(url);

  // Normalize to design tokens
  const normalized = normalizePalette([...cssColors, ...dominantColors]);

  // Validate contrast
  const contrastValid = validateContrast(normalized);

  return {
    dominant: dominantColors,
    css: cssColors,
    normalized,
    contrastValid,
  };
}

/**
 * Extract colors from CSS stylesheets
 */
async function extractCSSColors(url: string): Promise<string[]> {
  // This would use Puppeteer or similar to:
  // 1. Load the page
  // 2. Parse linked stylesheets
  // 3. Extract color values (hex, rgb, hsl)
  // 4. Parse inline styles and computed styles

  // Mock implementation - in production this would use real scraping
  return [
    '#FFFFFF', // background
    '#000000', // text
    '#2563EB', // primary (example)
    '#10B981', // accent (example)
  ];
}

/**
 * Extract dominant colors from screenshot
 * More robust method using actual visual analysis
 */
async function extractDominantColors(url: string): Promise<string[]> {
  // This would use Puppeteer to:
  // 1. Render page in headless browser
  // 2. Take screenshot of above-the-fold content
  // 3. Use color quantization algorithm (e.g., median cut, k-means)
  // 4. Extract 5-8 dominant colors

  // Mock implementation
  return [
    '#FAFAFA', // light background
    '#1F2937', // dark text
    '#3B82F6', // blue primary
    '#10B981', // green accent
    '#F59E0B', // amber warning
  ];
}

/**
 * Normalize extracted colors to design token structure
 */
function normalizePalette(colors: string[]): CapturedPalette['normalized'] {
  // Sort colors by luminance
  const sortedColors = colors.sort((a, b) => {
    return getLuminance(a) - getLuminance(b);
  });

  // Assign roles based on luminance and saturation
  const lightest = sortedColors[sortedColors.length - 1];
  const darkest = sortedColors[0];
  const mostSaturated = colors.sort((a, b) => getSaturation(b) - getSaturation(a))[0];
  const secondMostSaturated = colors.sort((a, b) => getSaturation(b) - getSaturation(a))[1];

  return {
    bg: lightest,
    surface: lightest,
    text: darkest,
    muted: adjustLuminance(darkest, 0.5),
    primary: mostSaturated,
    primaryContrast: getContrastingColor(mostSaturated),
    accent: secondMostSaturated,
    accentContrast: getContrastingColor(secondMostSaturated),
    border: adjustLuminance(lightest, 0.9),
  };
}

/**
 * Validate WCAG contrast ratios
 */
function validateContrast(palette: CapturedPalette['normalized']): boolean {
  // Check text on background
  const textBgContrast = getContrastRatio(palette.text, palette.bg);

  // Check primary on primary contrast
  const primaryContrast = getContrastRatio(palette.primary, palette.primaryContrast);

  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  return textBgContrast >= 4.5 && primaryContrast >= 4.5;
}

// ===================
// LAYOUT DETECTION
// ===================

/**
 * Detect layout signals from a website
 */
export async function detectLayout(url: string): Promise<LayoutSignals> {
  // This would use Puppeteer to:
  // 1. Analyze DOM structure
  // 2. Detect hero section (large image + headline + CTA)
  // 3. Identify section types (grid, cards, two-column, etc.)
  // 4. Measure spacing patterns

  // Mock implementation
  return {
    hasHero: true,
    heroStyle: 'centered',
    sections: [
      { type: 'HERO', pattern: 'centered' },
      { type: 'FEATURES', pattern: 'grid' },
      { type: 'ABOUT', pattern: 'two-column' },
      { type: 'TESTIMONIALS', pattern: 'cards' },
      { type: 'CTA', pattern: 'centered' },
    ],
    density: 'spacious',
    spacing: {
      average: 64,
      unit: 8,
    },
    maxWidth: 'standard',
  };
}

/**
 * Detect section density from spacing patterns
 */
function detectDensity(averageSpacing: number): 'tight' | 'balanced' | 'spacious' {
  if (averageSpacing < 48) return 'tight';
  if (averageSpacing < 80) return 'balanced';
  return 'spacious';
}

/**
 * Detect base spacing unit (4px or 8px)
 */
function detectSpacingUnit(spacingValues: number[]): number {
  // Find greatest common divisor
  const gcd = spacingValues.reduce((a, b) => {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  });

  // Most designs use 4px or 8px
  return gcd === 4 || gcd === 8 ? gcd : 8;
}

// ===================
// TYPOGRAPHY DETECTION
// ===================

/**
 * Detect typography patterns from a website
 */
export async function detectTypography(url: string): Promise<TypographySignals> {
  // This would use Puppeteer to:
  // 1. Extract computed font families
  // 2. Identify heading vs body fonts
  // 3. Measure font weights
  // 4. Calculate type scale ratio

  // Mock implementation
  return {
    headingFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    headingWeight: 700,
    scale: 1.25, // Major third
  };
}

/**
 * Calculate type scale from font sizes
 */
function calculateTypeScale(fontSizes: number[]): number {
  // Sort font sizes
  const sorted = fontSizes.sort((a, b) => a - b);

  // Calculate ratios between consecutive sizes
  const ratios = [];
  for (let i = 1; i < sorted.length; i++) {
    ratios.push(sorted[i] / sorted[i - 1]);
  }

  // Return average ratio
  return ratios.reduce((a, b) => a + b, 0) / ratios.length;
}

// ===================
// COMPLETE DESIGN CAPTURE
// ===================

/**
 * Capture complete design from an exemplar website
 */
export async function captureDesign(url: string): Promise<CapturedDesign> {
  const palette = await extractPalette(url);
  const layout = await detectLayout(url);
  const typography = await detectTypography(url);

  return {
    palette,
    layout,
    typography,
    exemplarUrl: url,
  };
}

/**
 * Convert captured design to design tokens
 */
export function capturedDesignToTokens(captured: CapturedDesign): DesignTokens {
  return {
    colors: {
      ...captured.palette.normalized,
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    typography: {
      headingFont: captured.typography.headingFont,
      bodyFont: captured.typography.bodyFont,
      headingWeight: captured.typography.headingWeight,
      bodyWeight: 400,
      baseSize: '16px',
      scale: captured.typography.scale,
    },
    spacing: {
      unit: captured.layout.spacing.unit,
      scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24],
    },
    radii: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px',
    },
    shadows: {
      sm: `0 1px 3px ${adjustAlpha(captured.palette.normalized.text, 0.08)}`,
      md: `0 4px 12px ${adjustAlpha(captured.palette.normalized.text, 0.12)}`,
      lg: `0 8px 24px ${adjustAlpha(captured.palette.normalized.text, 0.16)}`,
      xl: `0 16px 48px ${adjustAlpha(captured.palette.normalized.text, 0.20)}`,
    },
  };
}

// ===================
// COLOR UTILITIES
// ===================

/**
 * Calculate relative luminance (WCAG formula)
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate color saturation
 */
function getSaturation(hex: string): number {
  const rgb = hexToRgb(hex);
  const max = Math.max(...rgb);
  const min = Math.min(...rgb);
  return max === 0 ? 0 : (max - min) / max;
}

/**
 * Get contrasting color (white or black)
 */
function getContrastingColor(hex: string): string {
  const luminance = getLuminance(hex);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Adjust luminance of a color
 */
function adjustLuminance(hex: string, factor: number): string {
  const rgb = hexToRgb(hex);
  const adjusted = rgb.map(val => Math.round(val * factor));
  return rgbToHex(adjusted);
}

/**
 * Adjust alpha of a color
 */
function adjustAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

/**
 * Convert RGB to hex
 */
function rgbToHex(rgb: number[]): string {
  return '#' + rgb.map(val => {
    const hex = Math.max(0, Math.min(255, val)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}
