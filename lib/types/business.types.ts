/**
 * Business Website Types and Configuration
 * Defines types and interfaces for different business categories
 */

export type BusinessTypeId =
  | 'restaurant'
  | 'law-firm'
  | 'medical'
  | 'real-estate'
  | 'tech-saas'
  | 'creative-agency'
  | 'fitness'
  | 'beauty-spa'
  | 'education'
  | 'financial'
  | 'ecommerce'
  | 'photography'
  | 'construction'
  | 'automotive'
  | 'hospitality'
  | 'fashion'
  | 'nonprofit'
  | 'consulting'
  | 'marketing-agency'
  | 'pet-services'
  | 'food-delivery'
  | 'travel-agency'
  | 'wedding-planning'
  | 'music-entertainment'
  | 'interior-design'
  | 'dental'
  | 'insurance'
  | 'accounting'
  | 'landscaping'
  | 'event-planning'
  | 'bakery'
  | 'pharmacy'
  | 'coffee-shop'
  | 'yoga-studio'
  | 'hair-salon'
  | 'eye-care'
  | 'chiropractic'
  | 'physical-therapy'
  | 'mental-health'
  | 'veterinary'
  | 'portfolio'
  | 'personal-blog'
  | 'electrician'
  | 'plumber'
  | 'hvac'
  | 'roofer'
  | 'logistics'
  | 'transportation'
  | 'courier'
  | 'moving-company';

export type ColorMood =
  | 'professional' // Navy, gray, muted colors
  | 'vibrant' // Bright, bold colors
  | 'minimal' // Black, white, single accent
  | 'elegant' // Sophisticated, refined colors
  | 'warm' // Orange, red, brown tones
  | 'cool' // Blue, teal, green tones
  | 'energetic' // High contrast, bold colors
  | 'calm' // Soft, muted, peaceful colors
  | 'luxurious' // Gold, burgundy, rich colors
  | 'natural' // Earth tones, greens, browns
  | 'creative' // Multiple vibrant colors
  | 'trustworthy'; // Blue, green, stable colors

export interface ColorTheme {
  primary: string; // Main brand color (Tailwind color name)
  secondary: string; // Secondary color
  accent: string; // Accent/highlight color
  background: string; // Background color
  text: string; // Primary text color
  mood: ColorMood;
}

export interface DesignSystem {
  typography: {
    heading: string; // Font family for headings
    body: string; // Font family for body text
  };
  colors: {
    primaryHex: string; // Hex code for primary color
    secondaryHex: string; // Hex code for secondary color
    accentHex: string; // Hex code for accent color
  };
  style: {
    aesthetic: string; // Overall design aesthetic (e.g., "modern", "elegant", "minimalist")
    competitors?: string[]; // Popular competitor websites for inspiration
    imageStyle: string; // Style of imagery (e.g., "luxury properties", "professional headshots")
  };
}

export interface BusinessTypeConfig {
  id: BusinessTypeId;
  label: string;
  description: string;
  emoji: string;
  colorTheme: ColorTheme;
  designSystem?: DesignSystem; // Enhanced design system configuration
  keywords: string[]; // For SEO and categorization
  recommendedSections: string[]; // Section types that work well
}

export interface BusinessTypeCategory {
  category: string;
  types: BusinessTypeId[];
}
