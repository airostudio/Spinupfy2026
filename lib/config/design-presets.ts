/**
 * Design Presets for Webese.ai
 * Pre-configured design token sets for different business styles
 */

import {
  DesignTokens,
  DesignPresetId,
  HSLColor,
  DesignMood,
} from '../types/design-tokens.types';

// Helper to create HSL color
const hsl = (h: number, s: number, l: number): HSLColor => ({ h, s, l });

// Default tokens that all presets extend
const DEFAULT_TOKENS: Omit<DesignTokens, 'id' | 'name' | 'mood' | 'colors' | 'typography' | 'gradients'> = {
  version: '1.0.0',
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    card: '0 10px 30px -10px rgba(0, 0, 0, 0.15)',
    hover: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  layout: {
    borderRadius: 'md',
    spacing: 'normal',
    maxWidth: 'normal',
  },
  components: {
    header: {
      style: 'standard',
      sticky: true,
      blur: true,
      borderBottom: true,
    },
    hero: {
      style: 'centered',
      overlay: false,
      overlayOpacity: 0.4,
      textAlignment: 'center',
      minHeight: '100vh',
    },
    cards: {
      style: 'elevated',
      hoverEffect: 'lift',
      padding: 'normal',
    },
    buttons: {
      style: 'solid',
      roundness: 'rounded',
      uppercase: false,
      fontWeight: 'medium',
    },
    sections: {
      padding: 'normal',
      divider: 'none',
    },
  },
  animation: {
    enabled: true,
    duration: 'normal',
    style: 'smooth',
    pageTransitions: true,
    scrollAnimations: true,
  },
};

// ============================================
// DESIGN PRESETS
// ============================================

export const DESIGN_PRESETS: Record<DesignPresetId, DesignTokens> = {
  // ==========================================
  // LUXURY ELEGANCE
  // For: Real Estate, Law Firms, Financial Services, Hotels
  // ==========================================
  'luxury-elegance': {
    ...DEFAULT_TOKENS,
    id: 'luxury-elegance',
    name: 'Luxury Elegance',
    description: 'Sophisticated and refined, perfect for premium services',
    mood: 'luxury' as DesignMood,
    typography: {
      primary: {
        family: 'Playfair Display',
        weights: [400, 500, 600, 700],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
        fallback: 'Georgia, serif',
      },
      secondary: {
        family: 'Inter',
        weights: [300, 400, 500, 600],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap',
        fallback: 'system-ui, sans-serif',
      },
    },
    colors: {
      primary: hsl(210, 60, 15),           // Deep navy
      primaryForeground: hsl(0, 0, 100),
      secondary: hsl(0, 0, 96),
      secondaryForeground: hsl(210, 60, 15),
      accent: hsl(45, 75, 55),             // Elegant gold
      accentForeground: hsl(210, 60, 15),
      background: hsl(0, 0, 100),
      foreground: hsl(210, 60, 12),
      muted: hsl(0, 0, 96),
      mutedForeground: hsl(0, 0, 40),
      border: hsl(0, 0, 90),
      card: hsl(0, 0, 100),
      cardForeground: hsl(210, 60, 12),
      destructive: hsl(0, 84, 60),
      destructiveForeground: hsl(0, 0, 100),
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(210 60% 15%) 0%, hsl(210 40% 25%) 100%)',
      accent: 'linear-gradient(135deg, hsl(45 75% 55%) 0%, hsl(45 75% 65%) 100%)',
      overlay: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
      hero: 'linear-gradient(135deg, hsl(210 60% 15% / 0.9) 0%, hsl(210 40% 25% / 0.8) 100%)',
      subtle: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(0 0% 98%) 100%)',
    },
    layout: {
      borderRadius: 'sm',
      spacing: 'spacious',
      maxWidth: 'normal',
    },
    components: {
      ...DEFAULT_TOKENS.components,
      header: { style: 'transparent', sticky: true, blur: true, borderBottom: false },
      hero: { style: 'fullscreen', overlay: true, overlayOpacity: 0.5, textAlignment: 'center', minHeight: '100vh' },
      cards: { style: 'elevated', hoverEffect: 'lift', padding: 'spacious' },
      buttons: { style: 'solid', roundness: 'square', uppercase: true, fontWeight: 'medium' },
    },
    animation: {
      enabled: true,
      duration: 'slow',
      style: 'smooth',
      pageTransitions: true,
      scrollAnimations: true,
    },
  },

  // ==========================================
  // WARM ARTISAN
  // For: Bakeries, Cafes, Restaurants, Craft Businesses
  // ==========================================
  'warm-artisan': {
    ...DEFAULT_TOKENS,
    id: 'warm-artisan',
    name: 'Warm Artisan',
    description: 'Cozy and inviting, perfect for food & craft businesses',
    mood: 'warm' as DesignMood,
    typography: {
      primary: {
        family: 'Playfair Display',
        weights: [400, 600, 700],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap',
        fallback: 'Georgia, serif',
      },
      secondary: {
        family: 'Lato',
        weights: [300, 400, 700],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap',
        fallback: 'system-ui, sans-serif',
      },
    },
    colors: {
      primary: hsl(25, 60, 30),            // Rich brown
      primaryForeground: hsl(0, 0, 100),
      secondary: hsl(30, 20, 95),
      secondaryForeground: hsl(25, 60, 25),
      accent: hsl(35, 80, 50),             // Golden amber
      accentForeground: hsl(25, 60, 15),
      background: hsl(30, 30, 97),         // Creamy beige
      foreground: hsl(25, 40, 20),
      muted: hsl(30, 15, 93),
      mutedForeground: hsl(25, 20, 45),
      border: hsl(30, 20, 88),
      card: hsl(30, 25, 99),
      cardForeground: hsl(25, 40, 20),
      destructive: hsl(0, 70, 50),
      destructiveForeground: hsl(0, 0, 100),
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(25 60% 30%) 0%, hsl(25 50% 40%) 100%)',
      accent: 'linear-gradient(135deg, hsl(35 80% 50%) 0%, hsl(35 80% 60%) 100%)',
      overlay: 'linear-gradient(to bottom, rgba(50,30,20,0.3) 0%, rgba(50,30,20,0.6) 100%)',
      hero: 'linear-gradient(135deg, hsl(25 60% 30% / 0.8) 0%, hsl(30 40% 40% / 0.7) 100%)',
      subtle: 'linear-gradient(180deg, hsl(30 30% 97%) 0%, hsl(30 25% 94%) 100%)',
    },
    layout: {
      borderRadius: 'md',
      spacing: 'normal',
      maxWidth: 'normal',
    },
    components: {
      ...DEFAULT_TOKENS.components,
      header: { style: 'standard', sticky: true, blur: true, borderBottom: true },
      hero: { style: 'split', overlay: false, overlayOpacity: 0, textAlignment: 'left', minHeight: '80vh' },
      cards: { style: 'bordered', hoverEffect: 'lift', padding: 'normal' },
      buttons: { style: 'solid', roundness: 'rounded', uppercase: false, fontWeight: 'semibold' },
    },
    animation: {
      enabled: true,
      duration: 'normal',
      style: 'smooth',
      pageTransitions: true,
      scrollAnimations: true,
    },
  },

  // ==========================================
  // MODERN TECH
  // For: Tech Startups, SaaS, Digital Agencies, E-commerce
  // ==========================================
  'modern-tech': {
    ...DEFAULT_TOKENS,
    id: 'modern-tech',
    name: 'Modern Tech',
    description: 'Clean and innovative, perfect for tech companies',
    mood: 'tech' as DesignMood,
    typography: {
      primary: {
        family: 'Inter',
        weights: [400, 500, 600, 700, 800],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
        fallback: 'system-ui, sans-serif',
      },
      secondary: {
        family: 'Inter',
        weights: [300, 400, 500],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap',
        fallback: 'system-ui, sans-serif',
      },
    },
    colors: {
      primary: hsl(222, 84, 5),            // Near black
      primaryForeground: hsl(0, 0, 100),
      secondary: hsl(210, 40, 96),
      secondaryForeground: hsl(222, 47, 11),
      accent: hsl(250, 100, 65),           // Vibrant purple
      accentForeground: hsl(0, 0, 100),
      background: hsl(0, 0, 100),
      foreground: hsl(222, 84, 5),
      muted: hsl(210, 40, 96),
      mutedForeground: hsl(215, 16, 47),
      border: hsl(214, 32, 91),
      card: hsl(0, 0, 100),
      cardForeground: hsl(222, 84, 5),
      destructive: hsl(0, 84, 60),
      destructiveForeground: hsl(0, 0, 100),
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(222 84% 5%) 0%, hsl(250 60% 20%) 100%)',
      accent: 'linear-gradient(135deg, hsl(250 100% 65%) 0%, hsl(280 100% 60%) 100%)',
      overlay: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.9) 100%)',
      hero: 'linear-gradient(135deg, hsl(250 100% 65% / 0.1) 0%, hsl(280 100% 60% / 0.1) 100%)',
      subtle: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(210 40% 98%) 100%)',
    },
    layout: {
      borderRadius: 'lg',
      spacing: 'spacious',
      maxWidth: 'wide',
    },
    components: {
      ...DEFAULT_TOKENS.components,
      header: { style: 'minimal', sticky: true, blur: true, borderBottom: false },
      hero: { style: 'centered', overlay: false, overlayOpacity: 0, textAlignment: 'center', minHeight: '90vh' },
      cards: { style: 'glass', hoverEffect: 'scale', padding: 'spacious' },
      buttons: { style: 'gradient', roundness: 'pill', uppercase: false, fontWeight: 'semibold' },
    },
    animation: {
      enabled: true,
      duration: 'fast',
      style: 'bouncy',
      pageTransitions: true,
      scrollAnimations: true,
    },
  },

  // ==========================================
  // PROFESSIONAL CORPORATE
  // For: Consulting, B2B Services, Accounting, Insurance
  // ==========================================
  'professional-corporate': {
    ...DEFAULT_TOKENS,
    id: 'professional-corporate',
    name: 'Professional Corporate',
    description: 'Trustworthy and established, perfect for B2B services',
    mood: 'corporate' as DesignMood,
    typography: {
      primary: {
        family: 'Source Serif Pro',
        weights: [400, 600, 700],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;600;700&display=swap',
        fallback: 'Georgia, serif',
      },
      secondary: {
        family: 'Source Sans Pro',
        weights: [300, 400, 600],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600&display=swap',
        fallback: 'system-ui, sans-serif',
      },
    },
    colors: {
      primary: hsl(215, 50, 23),           // Corporate blue
      primaryForeground: hsl(0, 0, 100),
      secondary: hsl(210, 20, 96),
      secondaryForeground: hsl(215, 50, 20),
      accent: hsl(200, 70, 45),            // Teal accent
      accentForeground: hsl(0, 0, 100),
      background: hsl(0, 0, 100),
      foreground: hsl(215, 30, 20),
      muted: hsl(210, 15, 95),
      mutedForeground: hsl(215, 15, 50),
      border: hsl(210, 20, 88),
      card: hsl(0, 0, 100),
      cardForeground: hsl(215, 30, 20),
      destructive: hsl(0, 70, 50),
      destructiveForeground: hsl(0, 0, 100),
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(215 50% 23%) 0%, hsl(215 40% 33%) 100%)',
      accent: 'linear-gradient(135deg, hsl(200 70% 45%) 0%, hsl(200 70% 55%) 100%)',
      overlay: 'linear-gradient(to bottom, rgba(30,50,80,0.5) 0%, rgba(30,50,80,0.8) 100%)',
      hero: 'linear-gradient(135deg, hsl(215 50% 23% / 0.9) 0%, hsl(200 70% 45% / 0.7) 100%)',
      subtle: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(210 20% 97%) 100%)',
    },
    layout: {
      borderRadius: 'sm',
      spacing: 'normal',
      maxWidth: 'normal',
    },
    components: {
      ...DEFAULT_TOKENS.components,
      header: { style: 'standard', sticky: true, blur: false, borderBottom: true },
      hero: { style: 'split', overlay: true, overlayOpacity: 0.6, textAlignment: 'left', minHeight: '70vh' },
      cards: { style: 'bordered', hoverEffect: 'shadow', padding: 'normal' },
      buttons: { style: 'solid', roundness: 'square', uppercase: false, fontWeight: 'semibold' },
    },
    animation: {
      enabled: true,
      duration: 'normal',
      style: 'subtle',
      pageTransitions: false,
      scrollAnimations: true,
    },
  },

  // ==========================================
  // CREATIVE BOLD
  // For: Design Agencies, Marketing, Photography, Art
  // ==========================================
  'creative-bold': {
    ...DEFAULT_TOKENS,
    id: 'creative-bold',
    name: 'Creative Bold',
    description: 'Dynamic and impactful, perfect for creative agencies',
    mood: 'bold' as DesignMood,
    typography: {
      primary: {
        family: 'Poppins',
        weights: [400, 600, 700, 800],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap',
        fallback: 'system-ui, sans-serif',
      },
      secondary: {
        family: 'DM Sans',
        weights: [400, 500, 700],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap',
        fallback: 'system-ui, sans-serif',
      },
    },
    colors: {
      primary: hsl(0, 0, 8),               // Near black
      primaryForeground: hsl(0, 0, 100),
      secondary: hsl(0, 0, 95),
      secondaryForeground: hsl(0, 0, 10),
      accent: hsl(340, 90, 55),            // Hot pink
      accentForeground: hsl(0, 0, 100),
      background: hsl(0, 0, 100),
      foreground: hsl(0, 0, 8),
      muted: hsl(0, 0, 95),
      mutedForeground: hsl(0, 0, 40),
      border: hsl(0, 0, 88),
      card: hsl(0, 0, 100),
      cardForeground: hsl(0, 0, 8),
      destructive: hsl(0, 84, 60),
      destructiveForeground: hsl(0, 0, 100),
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(0 0% 8%) 0%, hsl(0 0% 20%) 100%)',
      accent: 'linear-gradient(135deg, hsl(340 90% 55%) 0%, hsl(20 100% 60%) 100%)',
      overlay: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)',
      hero: 'linear-gradient(135deg, hsl(340 90% 55% / 0.1) 0%, hsl(20 100% 60% / 0.1) 100%)',
      subtle: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(340 10% 98%) 100%)',
    },
    layout: {
      borderRadius: 'lg',
      spacing: 'spacious',
      maxWidth: 'wide',
    },
    components: {
      ...DEFAULT_TOKENS.components,
      header: { style: 'minimal', sticky: true, blur: true, borderBottom: false },
      hero: { style: 'fullscreen', overlay: false, overlayOpacity: 0, textAlignment: 'left', minHeight: '100vh' },
      cards: { style: 'flat', hoverEffect: 'scale', padding: 'spacious' },
      buttons: { style: 'solid', roundness: 'rounded', uppercase: true, fontWeight: 'bold' },
    },
    animation: {
      enabled: true,
      duration: 'fast',
      style: 'dramatic',
      pageTransitions: true,
      scrollAnimations: true,
    },
  },

  // ==========================================
  // NATURAL ORGANIC
  // For: Wellness, Yoga, Landscaping, Organic Products
  // ==========================================
  'natural-organic': {
    ...DEFAULT_TOKENS,
    id: 'natural-organic',
    name: 'Natural Organic',
    description: 'Earthy and calming, perfect for wellness businesses',
    mood: 'natural' as DesignMood,
    typography: {
      primary: {
        family: 'Cormorant Garamond',
        weights: [400, 500, 600, 700],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap',
        fallback: 'Georgia, serif',
      },
      secondary: {
        family: 'Nunito Sans',
        weights: [300, 400, 600],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600&display=swap',
        fallback: 'system-ui, sans-serif',
      },
    },
    colors: {
      primary: hsl(150, 30, 25),           // Forest green
      primaryForeground: hsl(0, 0, 100),
      secondary: hsl(90, 15, 95),
      secondaryForeground: hsl(150, 30, 20),
      accent: hsl(80, 50, 45),             // Sage green
      accentForeground: hsl(0, 0, 100),
      background: hsl(60, 20, 98),         // Warm off-white
      foreground: hsl(150, 20, 20),
      muted: hsl(80, 10, 94),
      mutedForeground: hsl(150, 10, 45),
      border: hsl(80, 15, 88),
      card: hsl(60, 15, 99),
      cardForeground: hsl(150, 20, 20),
      destructive: hsl(0, 60, 50),
      destructiveForeground: hsl(0, 0, 100),
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(150 30% 25%) 0%, hsl(150 25% 35%) 100%)',
      accent: 'linear-gradient(135deg, hsl(80 50% 45%) 0%, hsl(80 45% 55%) 100%)',
      overlay: 'linear-gradient(to bottom, rgba(40,60,50,0.3) 0%, rgba(40,60,50,0.6) 100%)',
      hero: 'linear-gradient(135deg, hsl(150 30% 25% / 0.7) 0%, hsl(80 50% 45% / 0.5) 100%)',
      subtle: 'linear-gradient(180deg, hsl(60 20% 98%) 0%, hsl(80 15% 95%) 100%)',
    },
    layout: {
      borderRadius: 'lg',
      spacing: 'spacious',
      maxWidth: 'normal',
    },
    components: {
      ...DEFAULT_TOKENS.components,
      header: { style: 'standard', sticky: true, blur: true, borderBottom: false },
      hero: { style: 'centered', overlay: true, overlayOpacity: 0.3, textAlignment: 'center', minHeight: '85vh' },
      cards: { style: 'flat', hoverEffect: 'lift', padding: 'spacious' },
      buttons: { style: 'solid', roundness: 'pill', uppercase: false, fontWeight: 'medium' },
    },
    animation: {
      enabled: true,
      duration: 'slow',
      style: 'smooth',
      pageTransitions: true,
      scrollAnimations: true,
    },
  },

  // ==========================================
  // MINIMAL CLEAN
  // For: Photography, Architecture, Minimalist Brands
  // ==========================================
  'minimal-clean': {
    ...DEFAULT_TOKENS,
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Simple and focused, perfect for portfolio sites',
    mood: 'minimal' as DesignMood,
    typography: {
      primary: {
        family: 'Libre Baskerville',
        weights: [400, 700],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap',
        fallback: 'Georgia, serif',
      },
      secondary: {
        family: 'Work Sans',
        weights: [300, 400, 500],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500&display=swap',
        fallback: 'system-ui, sans-serif',
      },
    },
    colors: {
      primary: hsl(0, 0, 10),              // Almost black
      primaryForeground: hsl(0, 0, 100),
      secondary: hsl(0, 0, 97),
      secondaryForeground: hsl(0, 0, 10),
      accent: hsl(0, 0, 30),               // Dark gray
      accentForeground: hsl(0, 0, 100),
      background: hsl(0, 0, 100),
      foreground: hsl(0, 0, 10),
      muted: hsl(0, 0, 96),
      mutedForeground: hsl(0, 0, 45),
      border: hsl(0, 0, 90),
      card: hsl(0, 0, 100),
      cardForeground: hsl(0, 0, 10),
      destructive: hsl(0, 70, 50),
      destructiveForeground: hsl(0, 0, 100),
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(0 0% 10%) 0%, hsl(0 0% 20%) 100%)',
      accent: 'linear-gradient(135deg, hsl(0 0% 30%) 0%, hsl(0 0% 40%) 100%)',
      overlay: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)',
      hero: 'transparent',
      subtle: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(0 0% 98%) 100%)',
    },
    layout: {
      borderRadius: 'none',
      spacing: 'luxurious',
      maxWidth: 'narrow',
    },
    components: {
      ...DEFAULT_TOKENS.components,
      header: { style: 'minimal', sticky: false, blur: false, borderBottom: false },
      hero: { style: 'minimal', overlay: false, overlayOpacity: 0, textAlignment: 'center', minHeight: '60vh' },
      cards: { style: 'flat', hoverEffect: 'none', padding: 'normal' },
      buttons: { style: 'outline', roundness: 'square', uppercase: true, fontWeight: 'normal' },
    },
    animation: {
      enabled: true,
      duration: 'slow',
      style: 'subtle',
      pageTransitions: true,
      scrollAnimations: false,
    },
  },

  // ==========================================
  // PLAYFUL VIBRANT
  // For: Kids, Fitness, Entertainment, Pet Services
  // ==========================================
  'playful-vibrant': {
    ...DEFAULT_TOKENS,
    id: 'playful-vibrant',
    name: 'Playful Vibrant',
    description: 'Fun and energetic, perfect for lifestyle brands',
    mood: 'playful' as DesignMood,
    typography: {
      primary: {
        family: 'Nunito',
        weights: [400, 600, 700, 800],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap',
        fallback: 'system-ui, sans-serif',
      },
      secondary: {
        family: 'Nunito',
        weights: [400, 600],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600&display=swap',
        fallback: 'system-ui, sans-serif',
      },
    },
    colors: {
      primary: hsl(260, 70, 55),           // Bright purple
      primaryForeground: hsl(0, 0, 100),
      secondary: hsl(180, 60, 95),
      secondaryForeground: hsl(260, 70, 40),
      accent: hsl(45, 100, 55),            // Bright yellow
      accentForeground: hsl(260, 70, 25),
      background: hsl(0, 0, 100),
      foreground: hsl(260, 40, 20),
      muted: hsl(260, 20, 96),
      mutedForeground: hsl(260, 15, 45),
      border: hsl(260, 20, 90),
      card: hsl(0, 0, 100),
      cardForeground: hsl(260, 40, 20),
      destructive: hsl(0, 84, 60),
      destructiveForeground: hsl(0, 0, 100),
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(260 70% 55%) 0%, hsl(300 70% 55%) 100%)',
      accent: 'linear-gradient(135deg, hsl(45 100% 55%) 0%, hsl(30 100% 55%) 100%)',
      overlay: 'linear-gradient(to bottom, rgba(100,50,150,0.3) 0%, rgba(100,50,150,0.6) 100%)',
      hero: 'linear-gradient(135deg, hsl(260 70% 55% / 0.1) 0%, hsl(45 100% 55% / 0.1) 100%)',
      subtle: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(260 20% 98%) 100%)',
    },
    layout: {
      borderRadius: 'xl',
      spacing: 'normal',
      maxWidth: 'normal',
    },
    components: {
      ...DEFAULT_TOKENS.components,
      header: { style: 'standard', sticky: true, blur: true, borderBottom: false },
      hero: { style: 'centered', overlay: false, overlayOpacity: 0, textAlignment: 'center', minHeight: '80vh' },
      cards: { style: 'elevated', hoverEffect: 'scale', padding: 'normal' },
      buttons: { style: 'gradient', roundness: 'pill', uppercase: false, fontWeight: 'bold' },
    },
    animation: {
      enabled: true,
      duration: 'fast',
      style: 'bouncy',
      pageTransitions: true,
      scrollAnimations: true,
    },
  },

  // ==========================================
  // SOPHISTICATED DARK
  // For: Nightlife, Music, Gaming, Premium Brands
  // ==========================================
  'sophisticated-dark': {
    ...DEFAULT_TOKENS,
    id: 'sophisticated-dark',
    name: 'Sophisticated Dark',
    description: 'Sleek dark theme, perfect for premium night brands',
    mood: 'sophisticated' as DesignMood,
    typography: {
      primary: {
        family: 'Montserrat',
        weights: [300, 400, 600, 700],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap',
        fallback: 'system-ui, sans-serif',
      },
      secondary: {
        family: 'Montserrat',
        weights: [300, 400, 500],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500&display=swap',
        fallback: 'system-ui, sans-serif',
      },
    },
    colors: {
      primary: hsl(0, 0, 98),              // Almost white (inverted)
      primaryForeground: hsl(0, 0, 8),
      secondary: hsl(240, 10, 15),
      secondaryForeground: hsl(0, 0, 90),
      accent: hsl(270, 100, 70),           // Electric purple
      accentForeground: hsl(0, 0, 100),
      background: hsl(240, 15, 8),         // Deep dark blue
      foreground: hsl(0, 0, 95),
      muted: hsl(240, 10, 15),
      mutedForeground: hsl(0, 0, 55),
      border: hsl(240, 10, 20),
      card: hsl(240, 12, 12),
      cardForeground: hsl(0, 0, 95),
      destructive: hsl(0, 84, 60),
      destructiveForeground: hsl(0, 0, 100),
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(0 0% 98%) 0%, hsl(0 0% 85%) 100%)',
      accent: 'linear-gradient(135deg, hsl(270 100% 70%) 0%, hsl(320 100% 60%) 100%)',
      overlay: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.9) 100%)',
      hero: 'linear-gradient(135deg, hsl(270 100% 70% / 0.1) 0%, hsl(320 100% 60% / 0.1) 100%)',
      subtle: 'linear-gradient(180deg, hsl(240 15% 8%) 0%, hsl(240 12% 12%) 100%)',
    },
    layout: {
      borderRadius: 'md',
      spacing: 'spacious',
      maxWidth: 'wide',
    },
    components: {
      ...DEFAULT_TOKENS.components,
      header: { style: 'transparent', sticky: true, blur: true, borderBottom: false },
      hero: { style: 'fullscreen', overlay: true, overlayOpacity: 0.6, textAlignment: 'center', minHeight: '100vh' },
      cards: { style: 'glass', hoverEffect: 'glow', padding: 'spacious' },
      buttons: { style: 'gradient', roundness: 'rounded', uppercase: true, fontWeight: 'semibold' },
    },
    animation: {
      enabled: true,
      duration: 'normal',
      style: 'smooth',
      pageTransitions: true,
      scrollAnimations: true,
    },
  },

  // ==========================================
  // FRIENDLY APPROACHABLE
  // For: Healthcare, Education, Non-profits, Community
  // ==========================================
  'friendly-approachable': {
    ...DEFAULT_TOKENS,
    id: 'friendly-approachable',
    name: 'Friendly Approachable',
    description: 'Welcoming and trustworthy, perfect for community services',
    mood: 'friendly' as DesignMood,
    typography: {
      primary: {
        family: 'Quicksand',
        weights: [400, 500, 600, 700],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap',
        fallback: 'system-ui, sans-serif',
      },
      secondary: {
        family: 'Open Sans',
        weights: [300, 400, 600],
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&display=swap',
        fallback: 'system-ui, sans-serif',
      },
    },
    colors: {
      primary: hsl(200, 80, 45),           // Friendly blue
      primaryForeground: hsl(0, 0, 100),
      secondary: hsl(200, 30, 96),
      secondaryForeground: hsl(200, 80, 35),
      accent: hsl(160, 70, 45),            // Teal green
      accentForeground: hsl(0, 0, 100),
      background: hsl(0, 0, 100),
      foreground: hsl(200, 30, 20),
      muted: hsl(200, 20, 96),
      mutedForeground: hsl(200, 15, 45),
      border: hsl(200, 20, 90),
      card: hsl(0, 0, 100),
      cardForeground: hsl(200, 30, 20),
      destructive: hsl(0, 70, 55),
      destructiveForeground: hsl(0, 0, 100),
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(200 80% 45%) 0%, hsl(200 70% 55%) 100%)',
      accent: 'linear-gradient(135deg, hsl(160 70% 45%) 0%, hsl(160 60% 55%) 100%)',
      overlay: 'linear-gradient(to bottom, rgba(50,100,150,0.3) 0%, rgba(50,100,150,0.6) 100%)',
      hero: 'linear-gradient(135deg, hsl(200 80% 45% / 0.1) 0%, hsl(160 70% 45% / 0.1) 100%)',
      subtle: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(200 30% 98%) 100%)',
    },
    layout: {
      borderRadius: 'lg',
      spacing: 'normal',
      maxWidth: 'normal',
    },
    components: {
      ...DEFAULT_TOKENS.components,
      header: { style: 'standard', sticky: true, blur: true, borderBottom: true },
      hero: { style: 'split', overlay: false, overlayOpacity: 0, textAlignment: 'left', minHeight: '75vh' },
      cards: { style: 'elevated', hoverEffect: 'lift', padding: 'normal' },
      buttons: { style: 'solid', roundness: 'rounded', uppercase: false, fontWeight: 'semibold' },
    },
    animation: {
      enabled: true,
      duration: 'normal',
      style: 'smooth',
      pageTransitions: true,
      scrollAnimations: true,
    },
  },
};

// ============================================
// BUSINESS TYPE TO PRESET MAPPING
// ============================================

export const BUSINESS_TYPE_PRESET_MAP: Record<string, DesignPresetId> = {
  // Luxury / High-end
  'real-estate': 'luxury-elegance',
  'law-firm': 'luxury-elegance',
  'financial': 'luxury-elegance',
  'investment': 'luxury-elegance',
  'hospitality': 'luxury-elegance',
  'jewelry': 'luxury-elegance',
  'luxury-retail': 'luxury-elegance',

  // Warm / Artisan
  'bakery': 'warm-artisan',
  'coffee-shop': 'warm-artisan',
  'restaurant': 'warm-artisan',
  'catering': 'warm-artisan',
  'florist': 'warm-artisan',
  'winery': 'warm-artisan',
  'brewery': 'warm-artisan',
  'food-truck': 'warm-artisan',

  // Tech / Modern
  'tech-startup': 'modern-tech',
  'saas': 'modern-tech',
  'ecommerce': 'modern-tech',
  'app-development': 'modern-tech',
  'it-services': 'modern-tech',
  'software': 'modern-tech',

  // Professional / Corporate
  'consulting': 'professional-corporate',
  'accounting': 'professional-corporate',
  'insurance': 'professional-corporate',
  'recruitment': 'professional-corporate',
  'business-services': 'professional-corporate',
  'manufacturing': 'professional-corporate',

  // Creative / Bold
  'creative-agency': 'creative-bold',
  'marketing-agency': 'creative-bold',
  'advertising': 'creative-bold',
  'branding': 'creative-bold',
  'video-production': 'creative-bold',
  'event-planning': 'creative-bold',

  // Natural / Organic
  'yoga-studio': 'natural-organic',
  'spa': 'natural-organic',
  'wellness': 'natural-organic',
  'landscaping': 'natural-organic',
  'organic-products': 'natural-organic',
  'health-food': 'natural-organic',
  'meditation': 'natural-organic',

  // Minimal / Clean
  'photography': 'minimal-clean',
  'architecture': 'minimal-clean',
  'interior-design': 'minimal-clean',
  'art-gallery': 'minimal-clean',
  'portfolio': 'minimal-clean',

  // Playful / Vibrant
  'fitness': 'playful-vibrant',
  'gym': 'playful-vibrant',
  'pet-services': 'playful-vibrant',
  'kids': 'playful-vibrant',
  'entertainment': 'playful-vibrant',
  'sports': 'playful-vibrant',
  'dance-studio': 'playful-vibrant',

  // Sophisticated / Dark
  'nightclub': 'sophisticated-dark',
  'bar': 'sophisticated-dark',
  'music': 'sophisticated-dark',
  'gaming': 'sophisticated-dark',
  'fashion': 'sophisticated-dark',

  // Friendly / Approachable
  'healthcare': 'friendly-approachable',
  'dental': 'friendly-approachable',
  'medical': 'friendly-approachable',
  'veterinary': 'friendly-approachable',
  'education': 'friendly-approachable',
  'nonprofit': 'friendly-approachable',
  'childcare': 'friendly-approachable',
  'church': 'friendly-approachable',
  'community': 'friendly-approachable',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get design preset for a business type
 */
export function getPresetForBusinessType(businessTypeId: string): DesignTokens {
  const presetId = BUSINESS_TYPE_PRESET_MAP[businessTypeId] || 'modern-tech';
  return DESIGN_PRESETS[presetId];
}

/**
 * Get preset by ID
 */
export function getPresetById(presetId: DesignPresetId): DesignTokens {
  return DESIGN_PRESETS[presetId];
}

/**
 * Get all preset options for UI selection
 */
export function getAllPresetOptions(): { id: DesignPresetId; name: string; description: string; mood: DesignMood }[] {
  return Object.entries(DESIGN_PRESETS).map(([id, preset]) => ({
    id: id as DesignPresetId,
    name: preset.name,
    description: preset.description || '',
    mood: preset.mood,
  }));
}

/**
 * Merge custom tokens with a preset
 */
export function mergeWithPreset(
  presetId: DesignPresetId,
  customTokens: Partial<DesignTokens>
): DesignTokens {
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
    components: {
      ...preset.components,
      ...(customTokens.components || {}),
    },
    layout: {
      ...preset.layout,
      ...(customTokens.layout || {}),
    },
  };
}

// ============================================
// INTELLIGENT PRESET SELECTION
// ============================================

/**
 * Keywords that suggest specific design moods
 */
const MOOD_KEYWORDS: Record<DesignMood, string[]> = {
  luxury: ['premium', 'exclusive', 'high-end', 'luxury', 'boutique', 'upscale'],
  warm: ['cozy', 'homemade', 'artisan', 'handcrafted', 'traditional', 'rustic', 'family', 'comfort'],
  tech: ['innovative', 'digital', 'smart', 'automated', 'platform', 'cloud', 'ai', 'saas'],
  corporate: ['enterprise', 'b2b', 'corporate', 'established', 'business'],
  bold: ['bold', 'dynamic', 'cutting-edge', 'disruptive', 'award-winning'],
  natural: ['organic', 'natural', 'sustainable', 'eco', 'green', 'wellness', 'holistic', 'mindful'],
  minimal: ['minimal', 'clean', 'simple', 'gallery', 'portfolio', 'architectural'],
  playful: ['fun', 'playful', 'energetic', 'exciting', 'vibrant', 'active', 'kids', 'pets'],
  sophisticated: ['sleek', 'night', 'exclusive', 'dark', 'club', 'lounge', 'refined'],
  friendly: ['friendly', 'welcoming', 'caring', 'community', 'trustworthy', 'helpful', 'supportive'],
  professional: ['professional', 'consulting', 'expert', 'reliable', 'trusted', 'experienced'],
  elegant: ['elegant', 'sophisticated', 'graceful', 'refined', 'tasteful', 'classy'],
  creative: ['creative', 'innovative', 'artistic', 'unique', 'original', 'imaginative'],
  modern: ['modern', 'contemporary', 'sleek', 'fresh', 'trendy', 'current'],
};

/**
 * Intelligently select the best preset based on business description
 */
export function selectPresetIntelligently(
  businessType: string,
  description: string
): DesignPresetId {
  const lowerDesc = description.toLowerCase();

  // First check if we have a direct business type mapping
  const directMapping = BUSINESS_TYPE_PRESET_MAP[businessType];
  if (directMapping) {
    // Check if the description suggests a different mood than the default
    for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
      const matchCount = keywords.filter(keyword => lowerDesc.includes(keyword)).length;
      if (matchCount >= 2) {
        // Find a preset that matches this mood
        const moodPreset = Object.entries(DESIGN_PRESETS).find(
          ([, preset]) => preset.mood === mood
        );
        if (moodPreset) {
          return moodPreset[0] as DesignPresetId;
        }
      }
    }
    return directMapping;
  }

  // If no direct mapping, analyze the description
  let bestMood: DesignMood = 'tech'; // Default
  let highestScore = 0;

  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    const score = keywords.filter(keyword => lowerDesc.includes(keyword)).length;
    if (score > highestScore) {
      highestScore = score;
      bestMood = mood as DesignMood;
    }
  }

  // Find a preset matching the best mood
  const matchingPreset = Object.entries(DESIGN_PRESETS).find(
    ([, preset]) => preset.mood === bestMood
  );

  return matchingPreset ? (matchingPreset[0] as DesignPresetId) : 'modern-tech';
}

/**
 * Get recommended presets for a business with reasoning
 */
export function getRecommendedPresets(
  businessType: string,
  description: string
): { presetId: DesignPresetId; reason: string; confidence: number }[] {
  const recommendations: { presetId: DesignPresetId; reason: string; confidence: number }[] = [];
  const lowerDesc = description.toLowerCase();

  // Check each mood for keyword matches
  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    const matchedKeywords = keywords.filter(keyword => lowerDesc.includes(keyword));
    if (matchedKeywords.length > 0) {
      const matchingPreset = Object.entries(DESIGN_PRESETS).find(
        ([, preset]) => preset.mood === mood
      );
      if (matchingPreset) {
        recommendations.push({
          presetId: matchingPreset[0] as DesignPresetId,
          reason: `Matches keywords: ${matchedKeywords.join(', ')}`,
          confidence: Math.min(matchedKeywords.length * 25, 100),
        });
      }
    }
  }

  // Always include the business type default
  const defaultPreset = BUSINESS_TYPE_PRESET_MAP[businessType];
  if (defaultPreset) {
    const existing = recommendations.find(r => r.presetId === defaultPreset);
    if (!existing) {
      recommendations.push({
        presetId: defaultPreset,
        reason: `Default for ${businessType} businesses`,
        confidence: 70,
      });
    }
  }

  // Sort by confidence
  return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

/**
 * Get typography pairing suggestions based on preset
 */
export function getTypographyPairings(presetId: DesignPresetId): {
  heading: string;
  body: string;
  accent?: string;
}[] {
  const preset = DESIGN_PRESETS[presetId];
  const baseHeading = preset.typography.primary.family;
  const baseBody = preset.typography.secondary.family;

  // Return the default pairing plus alternatives
  return [
    { heading: baseHeading, body: baseBody },
    // Alternative pairings based on mood
    ...(preset.mood === 'luxury' ? [
      { heading: 'Cormorant Garamond', body: 'Lato' },
      { heading: 'Bodoni Moda', body: 'Inter' },
    ] : []),
    ...(preset.mood === 'tech' ? [
      { heading: 'Space Grotesk', body: 'Inter' },
      { heading: 'Outfit', body: 'Plus Jakarta Sans' },
    ] : []),
    ...(preset.mood === 'warm' ? [
      { heading: 'Merriweather', body: 'Source Sans Pro' },
      { heading: 'Lora', body: 'Open Sans' },
    ] : []),
  ];
}

/**
 * Get complementary accent colors based on primary color
 */
export function getAccentColorSuggestions(primaryHSL: HSLColor): HSLColor[] {
  return [
    // Complementary
    { h: (primaryHSL.h + 180) % 360, s: primaryHSL.s, l: primaryHSL.l },
    // Split complementary
    { h: (primaryHSL.h + 150) % 360, s: primaryHSL.s, l: primaryHSL.l },
    { h: (primaryHSL.h + 210) % 360, s: primaryHSL.s, l: primaryHSL.l },
    // Triadic
    { h: (primaryHSL.h + 120) % 360, s: primaryHSL.s, l: primaryHSL.l },
    { h: (primaryHSL.h + 240) % 360, s: primaryHSL.s, l: primaryHSL.l },
  ];
}
