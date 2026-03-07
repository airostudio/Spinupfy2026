/**
 * Archetype Pack System
 * Reusable design systems keyed by business type + vibe
 *
 * Each archetype pack includes:
 * - Design tokens (colors, fonts, spacing, shadows, radii)
 * - Layout recipes (section ordering and patterns)
 * - Component variants (header styles, hero templates, cards, CTAs)
 * - Copy tone rules (concise vs story-led vs premium)
 * - Media rules (image style, framing, mood)
 */

export interface DesignTokens {
  colors: {
    bg: string;           // Background
    surface: string;      // Cards, panels
    text: string;         // Primary text
    muted: string;        // Secondary text
    primary: string;      // Brand primary
    primaryContrast: string; // Text on primary
    accent: string;       // Accent color
    accentContrast?: string; // Text on accent
    border?: string;      // Border color
    success?: string;     // Success states
    warning?: string;     // Warning states
    error?: string;       // Error states
  };
  typography: {
    headingFont: string;  // Primary heading font family
    bodyFont: string;     // Body text font family
    monoFont?: string;    // Monospace font (optional)
    headingWeight: number; // 400-900
    bodyWeight: number;    // 400-700
    baseSize: string;      // Base font size (e.g., "16px")
    scale: number;         // Type scale ratio (e.g., 1.25 = major third)
  };
  spacing: {
    unit: number;         // Base spacing unit (typically 4 or 8)
    scale: number[];      // Spacing scale multipliers [0.5, 1, 2, 3, 4, 6, 8, 12, 16]
  };
  radii: {
    sm: string;           // Small radius (buttons, inputs)
    md: string;           // Medium radius (cards)
    lg: string;           // Large radius (modals)
    full: string;         // Full radius (pills, avatars)
  };
  shadows: {
    sm: string;           // Subtle shadow
    md: string;           // Card shadow
    lg: string;           // Modal/dropdown shadow
    xl: string;           // Dramatic shadow
  };
}

export interface LayoutRecipe {
  sections: string[];    // Ordered section types: ['HERO', 'FEATURES', 'ABOUT', ...]
  patterns: {
    hero: 'centered' | 'split' | 'fullscreen' | 'minimal';
    about: 'two-column' | 'centered' | 'storytelling';
    features: 'grid' | 'cards' | 'list' | 'showcase';
    products: 'grid' | 'masonry' | 'carousel' | 'categories';
    testimonials: 'cards' | 'carousel' | 'quotes' | 'stories';
    contact: 'form' | 'map' | 'split' | 'minimal';
  };
  density: 'tight' | 'balanced' | 'spacious'; // Vertical spacing between sections
  maxWidth: 'narrow' | 'standard' | 'wide' | 'full'; // Content container width
}

export interface ComponentVariants {
  header: {
    layout: 'centered' | 'split' | 'justified';
    sticky: boolean;
    background: 'transparent' | 'solid' | 'blur';
    logoPosition: 'left' | 'center';
    ctaStyle: 'button' | 'link' | 'none';
  };
  hero: {
    layout: 'centered' | 'split-left' | 'split-right' | 'fullscreen';
    imageStyle: 'background' | 'side' | 'floating' | 'none';
    headlineSize: 'xl' | '2xl' | '3xl' | '4xl';
    ctaCount: 1 | 2;
    ctaStyle: 'solid' | 'outline' | 'minimal';
  };
  cards: {
    style: 'elevated' | 'bordered' | 'flat';
    imageRatio: 'square' | 'landscape' | 'portrait' | 'none';
    hover: 'lift' | 'scale' | 'glow' | 'none';
  };
  cta: {
    style: 'banner' | 'centered' | 'split' | 'floating';
    urgency: 'low' | 'medium' | 'high';
    background: 'gradient' | 'solid' | 'image';
  };
}

export interface CopyToneRules {
  style: 'concise' | 'story-led' | 'premium' | 'playful' | 'technical';
  headlinePattern: 'outcome-first' | 'benefit-driven' | 'question' | 'statement';
  length: {
    headlines: 'short' | 'medium' | 'long'; // 3-6 words, 6-10 words, 10-15 words
    descriptions: 'brief' | 'detailed' | 'comprehensive';
    cta: 'urgent' | 'gentle' | 'descriptive';
  };
  voice: {
    person: 'first' | 'second' | 'third'; // we, you, they
    formality: 'casual' | 'professional' | 'formal';
    emotion: 'neutral' | 'warm' | 'enthusiastic' | 'serious';
  };
  keywords: string[]; // Industry-specific terminology to emphasize
}

export interface MediaRules {
  imageStyle: string; // Descriptive style (e.g., "warm, natural light food photography")
  mood: 'bright' | 'moody' | 'minimal' | 'vibrant' | 'professional';
  framing: 'close-up' | 'wide' | 'portrait' | 'product-focused' | 'lifestyle';
  composition: 'clean' | 'busy' | 'artistic' | 'documentary';
  preferredSources: ('unsplash' | 'dalle' | 'custom')[];
  searchKeywords: string[]; // Keywords for image searches
}

export interface ArchetypePack {
  id: string;
  label: string;
  description: string;
  businessType: string; // Links to business type ID
  vibe: string;         // e.g., 'warm_artisanal', 'modern_minimal', 'luxury_premium'

  // Core design system
  designTokens: DesignTokens;
  layoutRecipe: LayoutRecipe;
  componentVariants: ComponentVariants;
  copyTone: CopyToneRules;
  mediaRules: MediaRules;

  // Inspiration and references
  exemplars: string[];  // URLs or names of inspirational examples
  competitors: string[]; // Industry leaders for reference
}

// Pre-built archetype packs for common business types + vibes
export const ARCHETYPE_PACKS: ArchetypePack[] = [
  // BAKERY - Warm Artisanal
  {
    id: 'bakery-warm-artisanal',
    label: 'Warm Artisanal Bakery',
    description: 'Inviting, story-driven bakery with artisanal craftsmanship focus',
    businessType: 'bakery',
    vibe: 'warm_artisanal',

    designTokens: {
      colors: {
        bg: '#FFFBF5',           // Warm off-white
        surface: '#FFFFFF',
        text: '#2D2424',         // Dark brown
        muted: '#6B5B4D',        // Medium brown
        primary: '#D4A574',      // Warm golden
        primaryContrast: '#FFFFFF',
        accent: '#C17A4A',       // Terracotta
        border: '#E8DED2',
        success: '#7C9668',
        warning: '#D4A574',
        error: '#C15A4A',
      },
      typography: {
        headingFont: 'Cormorant Garamond, serif',
        bodyFont: 'Open Sans, sans-serif',
        headingWeight: 600,
        bodyWeight: 400,
        baseSize: '16px',
        scale: 1.25, // Major third
      },
      spacing: {
        unit: 8,
        scale: [0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24],
      },
      radii: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 3px rgba(45, 36, 36, 0.08)',
        md: '0 4px 12px rgba(45, 36, 36, 0.12)',
        lg: '0 8px 24px rgba(45, 36, 36, 0.16)',
        xl: '0 16px 48px rgba(45, 36, 36, 0.20)',
      },
    },

    layoutRecipe: {
      sections: ['HERO', 'FEATURES', 'ABOUT', 'GALLERY', 'TESTIMONIALS', 'CONTACT'],
      patterns: {
        hero: 'centered',
        about: 'storytelling',
        features: 'grid',
        products: 'grid',
        testimonials: 'quotes',
        contact: 'split',
      },
      density: 'spacious',
      maxWidth: 'standard',
    },

    componentVariants: {
      header: {
        layout: 'centered',
        sticky: true,
        background: 'blur',
        logoPosition: 'center',
        ctaStyle: 'button',
      },
      hero: {
        layout: 'centered',
        imageStyle: 'background',
        headlineSize: '3xl',
        ctaCount: 2,
        ctaStyle: 'solid',
      },
      cards: {
        style: 'elevated',
        imageRatio: 'square',
        hover: 'lift',
      },
      cta: {
        style: 'centered',
        urgency: 'medium',
        background: 'gradient',
      },
    },

    copyTone: {
      style: 'story-led',
      headlinePattern: 'outcome-first',
      length: {
        headlines: 'medium',
        descriptions: 'detailed',
        cta: 'gentle',
      },
      voice: {
        person: 'first',
        formality: 'casual',
        emotion: 'warm',
      },
      keywords: ['artisanal', 'fresh', 'handcrafted', 'daily', 'local', 'traditional', 'authentic'],
    },

    mediaRules: {
      imageStyle: 'warm, natural light food photography with soft focus, artisanal presentation',
      mood: 'bright',
      framing: 'close-up',
      composition: 'clean',
      preferredSources: ['unsplash', 'dalle'],
      searchKeywords: ['artisan bread', 'fresh pastries', 'bakery interior', 'handmade desserts', 'rustic baking'],
    },

    exemplars: ['Tartine Bakery', 'Levain Bakery', 'Magnolia Bakery'],
    competitors: ['Tartine', 'Levain', 'Magnolia', 'Dominique Ansel'],
  },

  // ELECTRICIAN - Professional Trustworthy
  {
    id: 'electrician-professional-trustworthy',
    label: 'Professional Trustworthy Electrician',
    description: 'Clean, safety-focused electrical services with professional credibility',
    businessType: 'electrician',
    vibe: 'professional_trustworthy',

    designTokens: {
      colors: {
        bg: '#F8FAFC',           // Light slate
        surface: '#FFFFFF',
        text: '#1E293B',         // Dark slate
        muted: '#64748B',        // Medium slate
        primary: '#EAB308',      // Yellow (electricity)
        primaryContrast: '#1E293B',
        accent: '#3B82F6',       // Blue (trust)
        border: '#E2E8F0',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      typography: {
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif',
        headingWeight: 700,
        bodyWeight: 400,
        baseSize: '16px',
        scale: 1.2, // Minor third
      },
      spacing: {
        unit: 8,
        scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16],
      },
      radii: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px rgba(30, 41, 59, 0.06)',
        md: '0 4px 8px rgba(30, 41, 59, 0.10)',
        lg: '0 8px 16px rgba(30, 41, 59, 0.12)',
        xl: '0 16px 32px rgba(30, 41, 59, 0.16)',
      },
    },

    layoutRecipe: {
      sections: ['HERO', 'SERVICES', 'ABOUT', 'TRUST_BADGES', 'TESTIMONIALS', 'CTA', 'CONTACT'],
      patterns: {
        hero: 'split',
        about: 'two-column',
        features: 'cards',
        products: 'grid',
        testimonials: 'cards',
        contact: 'form',
      },
      density: 'balanced',
      maxWidth: 'standard',
    },

    componentVariants: {
      header: {
        layout: 'split',
        sticky: true,
        background: 'solid',
        logoPosition: 'left',
        ctaStyle: 'button',
      },
      hero: {
        layout: 'split-right',
        imageStyle: 'side',
        headlineSize: '2xl',
        ctaCount: 2,
        ctaStyle: 'solid',
      },
      cards: {
        style: 'bordered',
        imageRatio: 'landscape',
        hover: 'lift',
      },
      cta: {
        style: 'banner',
        urgency: 'high',
        background: 'solid',
      },
    },

    copyTone: {
      style: 'concise',
      headlinePattern: 'benefit-driven',
      length: {
        headlines: 'short',
        descriptions: 'brief',
        cta: 'urgent',
      },
      voice: {
        person: 'second',
        formality: 'professional',
        emotion: 'neutral',
      },
      keywords: ['licensed', 'certified', 'safe', 'reliable', '24/7', 'emergency', 'expert', 'professional'],
    },

    mediaRules: {
      imageStyle: 'professional electrician at work, clean residential and commercial settings, safety equipment visible',
      mood: 'professional',
      framing: 'wide',
      composition: 'clean',
      preferredSources: ['unsplash', 'dalle'],
      searchKeywords: ['electrician working', 'electrical panel', 'lighting installation', 'home electrical', 'professional tradesman'],
    },

    exemplars: ['Mister Sparky', 'Benjamin Franklin Plumbing', 'HomeAdvisor Pro Pages'],
    competitors: ['Mister Sparky', 'HomeAdvisor', 'Angi'],
  },

  // TECH SAAS - Modern Minimal
  {
    id: 'tech-saas-modern-minimal',
    label: 'Modern Minimal SaaS',
    description: 'Clean, innovation-focused tech product with gradient accents',
    businessType: 'tech-saas',
    vibe: 'modern_minimal',

    designTokens: {
      colors: {
        bg: '#FAFAFA',
        surface: '#FFFFFF',
        text: '#18181B',         // Near black
        muted: '#71717A',        // Zinc 500
        primary: '#2563EB',      // Blue 600
        primaryContrast: '#FFFFFF',
        accent: '#06B6D4',       // Cyan 500
        border: '#E4E4E7',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      typography: {
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif',
        monoFont: 'JetBrains Mono, monospace',
        headingWeight: 700,
        bodyWeight: 400,
        baseSize: '16px',
        scale: 1.25,
      },
      spacing: {
        unit: 4,
        scale: [0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32],
      },
      radii: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.04)',
        md: '0 4px 12px rgba(0, 0, 0, 0.08)',
        lg: '0 12px 24px rgba(0, 0, 0, 0.12)',
        xl: '0 24px 48px rgba(0, 0, 0, 0.16)',
      },
    },

    layoutRecipe: {
      sections: ['HERO', 'FEATURES', 'HOW_IT_WORKS', 'PRICING', 'TESTIMONIALS', 'CTA'],
      patterns: {
        hero: 'centered',
        about: 'centered',
        features: 'showcase',
        products: 'grid',
        testimonials: 'cards',
        contact: 'minimal',
      },
      density: 'spacious',
      maxWidth: 'wide',
    },

    componentVariants: {
      header: {
        layout: 'justified',
        sticky: true,
        background: 'blur',
        logoPosition: 'left',
        ctaStyle: 'button',
      },
      hero: {
        layout: 'centered',
        imageStyle: 'floating',
        headlineSize: '4xl',
        ctaCount: 2,
        ctaStyle: 'solid',
      },
      cards: {
        style: 'flat',
        imageRatio: 'landscape',
        hover: 'glow',
      },
      cta: {
        style: 'centered',
        urgency: 'medium',
        background: 'gradient',
      },
    },

    copyTone: {
      style: 'concise',
      headlinePattern: 'outcome-first',
      length: {
        headlines: 'short',
        descriptions: 'brief',
        cta: 'urgent',
      },
      voice: {
        person: 'second',
        formality: 'professional',
        emotion: 'enthusiastic',
      },
      keywords: ['automate', 'streamline', 'efficient', 'powerful', 'modern', 'simple', 'scalable'],
    },

    mediaRules: {
      imageStyle: 'sleek product screenshots, dashboard interfaces, modern tech illustrations, abstract gradients',
      mood: 'minimal',
      framing: 'product-focused',
      composition: 'clean',
      preferredSources: ['dalle', 'custom'],
      searchKeywords: ['software dashboard', 'tech interface', 'modern app', 'gradient background', 'minimal tech'],
    },

    exemplars: ['Stripe', 'Linear', 'Vercel', 'Notion'],
    competitors: ['Stripe', 'Linear', 'Notion', 'Vercel'],
  },
];

// Professional design intelligence mappings
const BUSINESS_TYPE_VIBES: Record<string, string[]> = {
  // Food & Beverage
  restaurant: ['warm_inviting', 'modern_elegant', 'rustic_artisanal'],
  bakery: ['warm_artisanal', 'modern_minimal', 'french_patisserie'],
  'coffee-shop': ['warm_cozy', 'modern_industrial', 'scandinavian_minimal'],

  // Professional Services
  'law-firm': ['professional_authoritative', 'modern_trustworthy', 'classic_prestigious'],
  consulting: ['professional_strategic', 'modern_innovative', 'executive_premium'],
  accounting: ['professional_clean', 'trustworthy_organized', 'modern_efficient'],
  financial: ['trustworthy_premium', 'modern_sophisticated', 'classic_established'],

  // Healthcare
  medical: ['trustworthy_clinical', 'warm_caring', 'modern_innovative'],
  dental: ['trustworthy_bright', 'friendly_modern', 'premium_cosmetic'],

  // Technology
  'tech-saas': ['modern_minimal', 'innovative_bold', 'professional_clean'],

  // Creative
  'creative-agency': ['bold_creative', 'minimal_artistic', 'modern_edgy'],
  photography: ['minimal_gallery', 'bold_artistic', 'clean_professional'],

  // Home Services
  electrician: ['professional_trustworthy', 'friendly_reliable', 'premium_expert'],
  plumber: ['professional_trustworthy', 'friendly_reliable', 'premium_expert'],

  // Wellness
  'beauty-spa': ['serene_luxurious', 'modern_minimal', 'natural_organic'],
  fitness: ['energetic_bold', 'modern_motivating', 'premium_exclusive'],

  // Retail
  'pet-services': ['warm_playful', 'trustworthy_caring', 'premium_boutique'],
  'real-estate': ['premium_aspirational', 'modern_professional', 'luxury_exclusive'],
};

// Intelligent default vibe selection based on business characteristics
const DEFAULT_VIBE_RULES: Record<string, (description: string) => string> = {
  restaurant: (desc: string) => {
    const lower = desc.toLowerCase();
    if (lower.includes('fine dining') || lower.includes('upscale') || lower.includes('michelin')) return 'modern_elegant';
    if (lower.includes('farm') || lower.includes('rustic') || lower.includes('traditional')) return 'rustic_artisanal';
    return 'warm_inviting';
  },
  'law-firm': (desc: string) => {
    const lower = desc.toLowerCase();
    if (lower.includes('boutique') || lower.includes('startup') || lower.includes('tech')) return 'modern_trustworthy';
    if (lower.includes('established') || lower.includes('prestigious') || lower.includes('century')) return 'classic_prestigious';
    return 'professional_authoritative';
  },
  'tech-saas': (desc: string) => {
    const lower = desc.toLowerCase();
    if (lower.includes('enterprise') || lower.includes('security') || lower.includes('compliance')) return 'professional_clean';
    if (lower.includes('creative') || lower.includes('design') || lower.includes('innovative')) return 'innovative_bold';
    return 'modern_minimal';
  },
};

/**
 * Get archetype pack by business type and vibe
 */
export function getArchetypePack(businessType: string, vibe?: string): ArchetypePack | undefined {
  // Try exact match first
  if (vibe) {
    const exactMatch = ARCHETYPE_PACKS.find(
      pack => pack.businessType === businessType && pack.vibe === vibe
    );
    if (exactMatch) return exactMatch;
  }

  // Fall back to first matching business type
  return ARCHETYPE_PACKS.find(pack => pack.businessType === businessType);
}

/**
 * Get all archetype packs for a business type
 */
export function getArchetypePacksByType(businessType: string): ArchetypePack[] {
  return ARCHETYPE_PACKS.filter(pack => pack.businessType === businessType);
}

/**
 * Get archetype pack by ID
 */
export function getArchetypePackById(id: string): ArchetypePack | undefined {
  return ARCHETYPE_PACKS.find(pack => pack.id === id);
}

/**
 * Intelligently select the best vibe for a business type based on description
 */
export function selectBestVibe(businessType: string, description: string): string {
  // Check if we have intelligent rules for this business type
  const vibeSelector = DEFAULT_VIBE_RULES[businessType];
  if (vibeSelector) {
    return vibeSelector(description);
  }

  // Fall back to first available vibe
  const availableVibes = BUSINESS_TYPE_VIBES[businessType];
  return availableVibes?.[0] || 'modern_professional';
}

/**
 * Get available vibes for a business type
 */
export function getAvailableVibes(businessType: string): string[] {
  return BUSINESS_TYPE_VIBES[businessType] || ['modern_professional', 'warm_friendly', 'premium_elegant'];
}

/**
 * Generate design tokens from a base color
 * Useful for creating custom color schemes on the fly
 */
export function generateDesignTokensFromColor(primaryColor: string, mood: 'warm' | 'cool' | 'neutral' = 'neutral'): DesignTokens['colors'] {
  // This is a simplified version - in production would use proper color math
  const warmBg = '#FFFBF7';
  const coolBg = '#F8FAFC';
  const neutralBg = '#FAFAFA';

  return {
    bg: mood === 'warm' ? warmBg : mood === 'cool' ? coolBg : neutralBg,
    surface: '#FFFFFF',
    text: '#1F2937',
    muted: '#6B7280',
    primary: primaryColor,
    primaryContrast: '#FFFFFF',
    accent: primaryColor, // Would calculate complementary
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  };
}
