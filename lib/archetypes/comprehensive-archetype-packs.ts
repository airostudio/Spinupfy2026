/**
 * Comprehensive Archetype Pack Library
 * Complete design systems for all 35+ business types
 *
 * Each business type has multiple vibe variants to choose from:
 * - Professional/Trustworthy
 * - Modern/Minimal
 * - Warm/Artisanal
 * - Luxury/Premium
 * - Vibrant/Energetic
 * - Calm/Serene
 * - Creative/Bold
 */

import { ArchetypePack } from './archetype-packs';

export const COMPREHENSIVE_ARCHETYPE_PACKS: ArchetypePack[] = [
  // ===================
  // FOOD & BEVERAGE
  // ===================

  // Restaurant - Warm Inviting
  {
    id: 'restaurant-warm-inviting',
    label: 'Warm Inviting Restaurant',
    description: 'Culinary elegance with mouth-watering visuals and warm atmosphere',
    businessType: 'restaurant',
    vibe: 'warm_inviting',

    designTokens: {
      colors: {
        bg: '#FFFAF5',
        surface: '#FFFFFF',
        text: '#2C1810',
        muted: '#6B5D54',
        primary: '#EA580C',
        primaryContrast: '#FFFFFF',
        accent: '#DC2626',
        accentContrast: '#FFFFFF',
        border: '#E8DDD5',
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      typography: {
        headingFont: 'Cormorant Garamond, serif',
        bodyFont: 'Lato, sans-serif',
        headingWeight: 600,
        bodyWeight: 400,
        baseSize: '16px',
        scale: 1.25,
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
        sm: '0 1px 3px rgba(44, 24, 16, 0.08)',
        md: '0 4px 12px rgba(44, 24, 16, 0.12)',
        lg: '0 8px 24px rgba(44, 24, 16, 0.16)',
        xl: '0 16px 48px rgba(44, 24, 16, 0.20)',
      },
    },

    layoutRecipe: {
      sections: ['HERO', 'MENU', 'ABOUT', 'GALLERY', 'TESTIMONIALS', 'CONTACT'],
      patterns: {
        hero: 'fullscreen',
        about: 'storytelling',
        features: 'showcase',
        products: 'grid',
        testimonials: 'stories',
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
        layout: 'fullscreen',
        imageStyle: 'background',
        headlineSize: '4xl',
        ctaCount: 2,
        ctaStyle: 'solid',
      },
      cards: {
        style: 'elevated',
        imageRatio: 'landscape',
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
      keywords: ['authentic', 'fresh', 'locally-sourced', 'chef-crafted', 'seasonal', 'farm-to-table'],
    },

    mediaRules: {
      imageStyle: 'mouth-watering food photography, elegant plating, ambient restaurant atmosphere, warm lighting',
      mood: 'bright',
      framing: 'close-up',
      composition: 'artistic',
      preferredSources: ['unsplash', 'dalle'],
      searchKeywords: ['restaurant interior', 'gourmet food plating', 'fine dining', 'chef cooking', 'elegant dining room'],
    },

    exemplars: ['The French Laundry', 'Eleven Madison Park', 'Alinea'],
    competitors: ['OpenTable featured restaurants', 'Michelin-starred restaurants', 'Local fine dining establishments'],
  },

  // Bakery - Warm Artisanal (already exists in original, keeping for completeness)
  {
    id: 'bakery-warm-artisanal',
    label: 'Warm Artisanal Bakery',
    description: 'Inviting, story-driven bakery with artisanal craftsmanship focus',
    businessType: 'bakery',
    vibe: 'warm_artisanal',

    designTokens: {
      colors: {
        bg: '#FFFBF5',
        surface: '#FFFFFF',
        text: '#2D2424',
        muted: '#6B5B4D',
        primary: '#D4A574',
        primaryContrast: '#FFFFFF',
        accent: '#C17A4A',
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
        scale: 1.25,
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

  // Coffee Shop - Warm Cozy
  {
    id: 'coffee-shop-warm-cozy',
    label: 'Warm Cozy Coffee Shop',
    description: 'Inviting café atmosphere with artisan coffee focus',
    businessType: 'coffee-shop',
    vibe: 'warm_cozy',

    designTokens: {
      colors: {
        bg: '#F9F6F1',
        surface: '#FFFFFF',
        text: '#3A2F24',
        muted: '#6B5E51',
        primary: '#D4A574',
        primaryContrast: '#FFFFFF',
        accent: '#EA8B4C',
        border: '#E5DDD5',
        success: '#8B9E7D',
        warning: '#E8A64D',
        error: '#D16B5E',
      },
      typography: {
        headingFont: 'Poppins, sans-serif',
        bodyFont: 'Inter, sans-serif',
        headingWeight: 600,
        bodyWeight: 400,
        baseSize: '16px',
        scale: 1.2,
      },
      spacing: {
        unit: 8,
        scale: [0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24],
      },
      radii: {
        sm: '6px',
        md: '12px',
        lg: '18px',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 3px rgba(58, 47, 36, 0.08)',
        md: '0 4px 12px rgba(58, 47, 36, 0.10)',
        lg: '0 8px 20px rgba(58, 47, 36, 0.14)',
        xl: '0 16px 40px rgba(58, 47, 36, 0.18)',
      },
    },

    layoutRecipe: {
      sections: ['HERO', 'SERVICES', 'GALLERY', 'ABOUT', 'CONTACT'],
      patterns: {
        hero: 'split',
        about: 'two-column',
        features: 'cards',
        products: 'grid',
        testimonials: 'quotes',
        contact: 'form',
      },
      density: 'balanced',
      maxWidth: 'standard',
    },

    componentVariants: {
      header: {
        layout: 'split',
        sticky: true,
        background: 'blur',
        logoPosition: 'left',
        ctaStyle: 'link',
      },
      hero: {
        layout: 'split-right',
        imageStyle: 'side',
        headlineSize: '3xl',
        ctaCount: 1,
        ctaStyle: 'solid',
      },
      cards: {
        style: 'elevated',
        imageRatio: 'square',
        hover: 'lift',
      },
      cta: {
        style: 'centered',
        urgency: 'low',
        background: 'solid',
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
        person: 'second',
        formality: 'casual',
        emotion: 'warm',
      },
      keywords: ['artisan', 'locally-roasted', 'handcrafted', 'cozy', 'community', 'specialty coffee'],
    },

    mediaRules: {
      imageStyle: 'warm café interiors, artisan coffee preparation, cozy seating areas, latte art',
      mood: 'bright',
      framing: 'lifestyle',
      composition: 'clean',
      preferredSources: ['unsplash', 'dalle'],
      searchKeywords: ['coffee shop interior', 'latte art', 'barista', 'cozy café', 'specialty coffee'],
    },

    exemplars: ['Blue Bottle Coffee', 'Stumptown', 'Intelligentsia'],
    competitors: ['Blue Bottle', 'Stumptown', 'Intelligentsia', 'Local third-wave coffee shops'],
  },

  // Food Delivery - Vibrant Energetic
  {
    id: 'food-delivery-vibrant-energetic',
    label: 'Vibrant Energetic Food Delivery',
    description: 'Fast, convenient food delivery with high-energy branding',
    businessType: 'food-delivery',
    vibe: 'vibrant_energetic',

    designTokens: {
      colors: {
        bg: '#FFFFFF',
        surface: '#FAFAFA',
        text: '#1F2937',
        muted: '#6B7280',
        primary: '#EF4444',
        primaryContrast: '#FFFFFF',
        accent: '#F97316',
        accentContrast: '#FFFFFF',
        border: '#E5E7EB',
        success: '#10B981',
        warning: '#FBBF24',
        error: '#DC2626',
      },
      typography: {
        headingFont: 'Poppins, sans-serif',
        bodyFont: 'Inter, sans-serif',
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
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 8px rgba(0, 0, 0, 0.08)',
        lg: '0 12px 24px rgba(0, 0, 0, 0.12)',
        xl: '0 20px 40px rgba(0, 0, 0, 0.16)',
      },
    },

    layoutRecipe: {
      sections: ['HERO', 'FEATURES', 'SERVICES', 'PRICING', 'CTA', 'CONTACT'],
      patterns: {
        hero: 'split',
        about: 'centered',
        features: 'showcase',
        products: 'grid',
        testimonials: 'cards',
        contact: 'minimal',
      },
      density: 'tight',
      maxWidth: 'wide',
    },

    componentVariants: {
      header: {
        layout: 'justified',
        sticky: true,
        background: 'solid',
        logoPosition: 'left',
        ctaStyle: 'button',
      },
      hero: {
        layout: 'split-right',
        imageStyle: 'floating',
        headlineSize: '4xl',
        ctaCount: 2,
        ctaStyle: 'solid',
      },
      cards: {
        style: 'flat',
        imageRatio: 'square',
        hover: 'scale',
      },
      cta: {
        style: 'banner',
        urgency: 'high',
        background: 'gradient',
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
        formality: 'casual',
        emotion: 'enthusiastic',
      },
      keywords: ['fast', 'fresh', 'delivered', 'convenient', 'quick', 'easy ordering', 'on-demand'],
    },

    mediaRules: {
      imageStyle: 'vibrant food photography, delivery person in action, mobile app screenshots, happy customers',
      mood: 'vibrant',
      framing: 'wide',
      composition: 'busy',
      preferredSources: ['unsplash', 'dalle'],
      searchKeywords: ['food delivery', 'delivery driver', 'mobile app', 'fresh meals', 'fast food delivery'],
    },

    exemplars: ['DoorDash', 'Uber Eats', 'Grubhub'],
    competitors: ['DoorDash', 'Uber Eats', 'Grubhub', 'Postmates'],
  },

  // ===================
  // PROFESSIONAL SERVICES
  // ===================

  // Law Firm - Professional Authoritative
  {
    id: 'law-firm-professional-authoritative',
    label: 'Professional Authoritative Law Firm',
    description: 'Trustworthy, refined legal services with executive presence',
    businessType: 'law-firm',
    vibe: 'professional_authoritative',

    designTokens: {
      colors: {
        bg: '#F8F9FA',
        surface: '#FFFFFF',
        text: '#1E293B',
        muted: '#64748B',
        primary: '#1E40AF',
        primaryContrast: '#FFFFFF',
        accent: '#D97706',
        accentContrast: '#FFFFFF',
        border: '#E2E8F0',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
      },
      typography: {
        headingFont: 'Merriweather, serif',
        bodyFont: 'Open Sans, sans-serif',
        headingWeight: 700,
        bodyWeight: 400,
        baseSize: '17px',
        scale: 1.2,
      },
      spacing: {
        unit: 8,
        scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24],
      },
      radii: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 3px rgba(30, 41, 59, 0.08)',
        md: '0 4px 12px rgba(30, 41, 59, 0.10)',
        lg: '0 8px 20px rgba(30, 41, 59, 0.12)',
        xl: '0 16px 40px rgba(30, 41, 59, 0.16)',
      },
    },

    layoutRecipe: {
      sections: ['HERO', 'ABOUT', 'SERVICES', 'TEAM', 'TESTIMONIALS', 'CONTACT'],
      patterns: {
        hero: 'centered',
        about: 'two-column',
        features: 'list',
        products: 'grid',
        testimonials: 'stories',
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
        layout: 'centered',
        imageStyle: 'background',
        headlineSize: '3xl',
        ctaCount: 1,
        ctaStyle: 'solid',
      },
      cards: {
        style: 'bordered',
        imageRatio: 'portrait',
        hover: 'none',
      },
      cta: {
        style: 'centered',
        urgency: 'medium',
        background: 'solid',
      },
    },

    copyTone: {
      style: 'premium',
      headlinePattern: 'statement',
      length: {
        headlines: 'medium',
        descriptions: 'comprehensive',
        cta: 'descriptive',
      },
      voice: {
        person: 'first',
        formality: 'formal',
        emotion: 'serious',
      },
      keywords: ['expertise', 'counsel', 'litigation', 'trusted', 'experienced', 'dedicated', 'results-driven'],
    },

    mediaRules: {
      imageStyle: 'professional law office photography, courtroom imagery, attorney portraits, scales of justice, executive settings',
      mood: 'professional',
      framing: 'portrait',
      composition: 'clean',
      preferredSources: ['unsplash', 'dalle'],
      searchKeywords: ['law office', 'attorney portrait', 'courtroom', 'legal books', 'professional lawyer'],
    },

    exemplars: ['Skadden Arps', 'Baker McKenzie', 'Latham & Watkins'],
    competitors: ['Top law firms', 'AmLaw 100 websites', 'Legal 500 firms'],
  },

  // Accounting - Professional Clean
  {
    id: 'accounting-professional-clean',
    label: 'Professional Clean Accounting',
    description: 'Trustworthy financial services with organized, clear presentation',
    businessType: 'accounting',
    vibe: 'professional_clean',

    designTokens: {
      colors: {
        bg: '#FAFAFA',
        surface: '#FFFFFF',
        text: '#1F2937',
        muted: '#6B7280',
        primary: '#059669',
        primaryContrast: '#FFFFFF',
        accent: '#3B82F6',
        accentContrast: '#FFFFFF',
        border: '#E5E7EB',
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
        scale: 1.2,
      },
      spacing: {
        unit: 8,
        scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16],
      },
      radii: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
        md: '0 4px 8px rgba(0, 0, 0, 0.06)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.08)',
        xl: '0 16px 32px rgba(0, 0, 0, 0.10)',
      },
    },

    layoutRecipe: {
      sections: ['HERO', 'SERVICES', 'ABOUT', 'TESTIMONIALS', 'CTA', 'CONTACT'],
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
        style: 'centered',
        urgency: 'medium',
        background: 'gradient',
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
      keywords: ['accurate', 'reliable', 'expert', 'tax', 'financial', 'certified', 'comprehensive'],
    },

    mediaRules: {
      imageStyle: 'professional office settings, financial documents, calculator and laptop, modern workspace, charts and graphs',
      mood: 'professional',
      framing: 'wide',
      composition: 'clean',
      preferredSources: ['unsplash', 'dalle'],
      searchKeywords: ['accounting office', 'financial planning', 'tax preparation', 'professional accountant', 'business meeting'],
    },

    exemplars: ['Deloitte', 'KPMG', 'PwC', 'EY'],
    competitors: ['Big Four accounting firms', 'Local CPA firms', 'QuickBooks ProAdvisors'],
  },

  // Consulting - Professional Strategic
  {
    id: 'consulting-professional-strategic',
    label: 'Professional Strategic Consulting',
    description: 'Expert business advisory with sophisticated presentation',
    businessType: 'consulting',
    vibe: 'professional_strategic',

    designTokens: {
      colors: {
        bg: '#FAFBFC',
        surface: '#FFFFFF',
        text: '#1F2937',
        muted: '#6B7280',
        primary: '#2563EB',
        primaryContrast: '#FFFFFF',
        accent: '#06B6D4',
        accentContrast: '#FFFFFF',
        border: '#E5E7EB',
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
        scale: 1.25,
      },
      spacing: {
        unit: 8,
        scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24],
      },
      radii: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.04)',
        md: '0 4px 12px rgba(0, 0, 0, 0.08)',
        lg: '0 10px 24px rgba(0, 0, 0, 0.10)',
        xl: '0 20px 48px rgba(0, 0, 0, 0.14)',
      },
    },

    layoutRecipe: {
      sections: ['HERO', 'SERVICES', 'ABOUT', 'TESTIMONIALS', 'TEAM', 'CONTACT'],
      patterns: {
        hero: 'centered',
        about: 'two-column',
        features: 'showcase',
        products: 'grid',
        testimonials: 'stories',
        contact: 'form',
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
        imageStyle: 'none',
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
      style: 'premium',
      headlinePattern: 'outcome-first',
      length: {
        headlines: 'medium',
        descriptions: 'comprehensive',
        cta: 'descriptive',
      },
      voice: {
        person: 'first',
        formality: 'professional',
        emotion: 'neutral',
      },
      keywords: ['strategic', 'transform', 'optimize', 'growth', 'expertise', 'insights', 'results'],
    },

    mediaRules: {
      imageStyle: 'executive boardroom settings, strategy sessions, data visualization, professional consultants, modern office spaces',
      mood: 'professional',
      framing: 'wide',
      composition: 'clean',
      preferredSources: ['unsplash', 'dalle'],
      searchKeywords: ['business consulting', 'strategy meeting', 'boardroom', 'data analysis', 'professional advisors'],
    },

    exemplars: ['McKinsey', 'BCG', 'Bain', 'Accenture'],
    competitors: ['Top consulting firms', 'MBB firms', 'Business advisory firms'],
  },

  // Financial Services - Trustworthy Premium
  {
    id: 'financial-trustworthy-premium',
    label: 'Trustworthy Premium Financial Services',
    description: 'Wealth management with sophisticated, secure presentation',
    businessType: 'financial',
    vibe: 'trustworthy_premium',

    designTokens: {
      colors: {
        bg: '#F9FAFB',
        surface: '#FFFFFF',
        text: '#111827',
        muted: '#6B7280',
        primary: '#059669',
        primaryContrast: '#FFFFFF',
        accent: '#0EA5E9',
        accentContrast: '#FFFFFF',
        border: '#E5E7EB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      typography: {
        headingFont: 'Playfair Display, serif',
        bodyFont: 'Inter, sans-serif',
        headingWeight: 600,
        bodyWeight: 400,
        baseSize: '16px',
        scale: 1.2,
      },
      spacing: {
        unit: 8,
        scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24],
      },
      radii: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
        md: '0 4px 8px rgba(0, 0, 0, 0.06)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.08)',
        xl: '0 16px 32px rgba(0, 0, 0, 0.12)',
      },
    },

    layoutRecipe: {
      sections: ['HERO', 'SERVICES', 'ABOUT', 'TESTIMONIALS', 'CTA', 'CONTACT'],
      patterns: {
        hero: 'split',
        about: 'two-column',
        features: 'cards',
        products: 'grid',
        testimonials: 'stories',
        contact: 'split',
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
        headlineSize: '3xl',
        ctaCount: 2,
        ctaStyle: 'solid',
      },
      cards: {
        style: 'elevated',
        imageRatio: 'landscape',
        hover: 'lift',
      },
      cta: {
        style: 'centered',
        urgency: 'medium',
        background: 'solid',
      },
    },

    copyTone: {
      style: 'premium',
      headlinePattern: 'benefit-driven',
      length: {
        headlines: 'medium',
        descriptions: 'detailed',
        cta: 'descriptive',
      },
      voice: {
        person: 'second',
        formality: 'professional',
        emotion: 'neutral',
      },
      keywords: ['wealth', 'secure', 'trusted', 'growth', 'planning', 'investment', 'financial freedom'],
    },

    mediaRules: {
      imageStyle: 'sophisticated wealth management imagery, financial charts, executive advisors, secure vault, modern banking',
      mood: 'professional',
      framing: 'wide',
      composition: 'clean',
      preferredSources: ['unsplash', 'dalle'],
      searchKeywords: ['wealth management', 'financial planning', 'investment advisor', 'stock market', 'financial security'],
    },

    exemplars: ['Morgan Stanley', 'Goldman Sachs', 'Fidelity', 'Vanguard'],
    competitors: ['Major investment firms', 'Wealth management companies', 'Financial advisory firms'],
  },

  // Insurance - Trustworthy Protective
  {
    id: 'insurance-trustworthy-protective',
    label: 'Trustworthy Protective Insurance',
    description: 'Reliable coverage with secure, reassuring presentation',
    businessType: 'insurance',
    vibe: 'trustworthy_protective',

    designTokens: {
      colors: {
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        text: '#1E293B',
        muted: '#64748B',
        primary: '#2563EB',
        primaryContrast: '#FFFFFF',
        accent: '#059669',
        accentContrast: '#FFFFFF',
        border: '#E2E8F0',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      typography: {
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif',
        headingWeight: 700,
        bodyWeight: 400,
        baseSize: '16px',
        scale: 1.2,
      },
      spacing: {
        unit: 8,
        scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16],
      },
      radii: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px rgba(30, 41, 59, 0.05)',
        md: '0 4px 8px rgba(30, 41, 59, 0.08)',
        lg: '0 8px 16px rgba(30, 41, 59, 0.10)',
        xl: '0 16px 32px rgba(30, 41, 59, 0.14)',
      },
    },

    layoutRecipe: {
      sections: ['HERO', 'SERVICES', 'FEATURES', 'TESTIMONIALS', 'CTA', 'CONTACT'],
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
        imageRatio: 'square',
        hover: 'lift',
      },
      cta: {
        style: 'banner',
        urgency: 'medium',
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
      keywords: ['protected', 'coverage', 'secure', 'peace of mind', 'reliable', 'comprehensive', 'trusted'],
    },

    mediaRules: {
      imageStyle: 'protective insurance imagery, happy families, secure homes, safe vehicles, peace of mind visuals',
      mood: 'professional',
      framing: 'wide',
      composition: 'clean',
      preferredSources: ['unsplash', 'dalle'],
      searchKeywords: ['family protection', 'home insurance', 'car insurance', 'life insurance', 'secure future'],
    },

    exemplars: ['State Farm', 'Allstate', 'Progressive', 'Geico'],
    competitors: ['Major insurance providers', 'Local insurance agencies', 'Online insurance marketplaces'],
  },

  // ===================
  // HEALTHCARE & WELLNESS
  // ===================

  // Medical Practice - Trustworthy Clinical
  {
    id: 'medical-trustworthy-clinical',
    label: 'Trustworthy Clinical Medical Practice',
    description: 'Professional healthcare with clean, reassuring design',
    businessType: 'medical',
    vibe: 'trustworthy_clinical',

    designTokens: {
      colors: {
        bg: '#F0F9FF',
        surface: '#FFFFFF',
        text: '#1E293B',
        muted: '#64748B',
        primary: '#0EA5E9',
        primaryContrast: '#FFFFFF',
        accent: '#14B8A6',
        accentContrast: '#FFFFFF',
        border: '#E0F2FE',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      typography: {
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif',
        headingWeight: 600,
        bodyWeight: 400,
        baseSize: '16px',
        scale: 1.2,
      },
      spacing: {
        unit: 8,
        scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24],
      },
      radii: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px rgba(14, 165, 233, 0.05)',
        md: '0 4px 8px rgba(14, 165, 233, 0.08)',
        lg: '0 8px 16px rgba(14, 165, 233, 0.10)',
        xl: '0 16px 32px rgba(14, 165, 233, 0.12)',
      },
    },

    layoutRecipe: {
      sections: ['HERO', 'SERVICES', 'ABOUT', 'TEAM', 'TESTIMONIALS', 'CONTACT'],
      patterns: {
        hero: 'split',
        about: 'two-column',
        features: 'cards',
        products: 'grid',
        testimonials: 'stories',
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
        style: 'elevated',
        imageRatio: 'square',
        hover: 'lift',
      },
      cta: {
        style: 'centered',
        urgency: 'medium',
        background: 'solid',
      },
    },

    copyTone: {
      style: 'concise',
      headlinePattern: 'benefit-driven',
      length: {
        headlines: 'medium',
        descriptions: 'detailed',
        cta: 'gentle',
      },
      voice: {
        person: 'second',
        formality: 'professional',
        emotion: 'warm',
      },
      keywords: ['care', 'health', 'wellness', 'experienced', 'compassionate', 'expert', 'trusted'],
    },

    mediaRules: {
      imageStyle: 'clean modern medical facilities, caring doctors with patients, medical equipment, welcoming reception areas',
      mood: 'professional',
      framing: 'wide',
      composition: 'clean',
      preferredSources: ['unsplash', 'dalle'],
      searchKeywords: ['doctor patient', 'medical clinic', 'healthcare', 'modern hospital', 'medical examination'],
    },

    exemplars: ['Mayo Clinic', 'Cleveland Clinic', 'Johns Hopkins'],
    competitors: ['Top medical centers', 'Local healthcare providers', 'Medical practices'],
  },

  // Dental Practice - Trustworthy Bright
  {
    id: 'dental-trustworthy-bright',
    label: 'Trustworthy Bright Dental Practice',
    description: 'Clean, modern dental care with bright, welcoming design',
    businessType: 'dental',
    vibe: 'trustworthy_bright',

    designTokens: {
      colors: {
        bg: '#F0FDFA',
        surface: '#FFFFFF',
        text: '#1E293B',
        muted: '#64748B',
        primary: '#06B6D4',
        primaryContrast: '#FFFFFF',
        accent: '#0EA5E9',
        accentContrast: '#FFFFFF',
        border: '#CCFBF1',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      typography: {
        headingFont: 'Poppins, sans-serif',
        bodyFont: 'Inter, sans-serif',
        headingWeight: 600,
        bodyWeight: 400,
        baseSize: '16px',
        scale: 1.2,
      },
      spacing: {
        unit: 8,
        scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24],
      },
      radii: {
        sm: '8px',
        md: '14px',
        lg: '20px',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px rgba(6, 182, 212, 0.05)',
        md: '0 4px 8px rgba(6, 182, 212, 0.08)',
        lg: '0 8px 16px rgba(6, 182, 212, 0.10)',
        xl: '0 16px 32px rgba(6, 182, 212, 0.12)',
      },
    },

    layoutRecipe: {
      sections: ['HERO', 'SERVICES', 'ABOUT', 'TEAM', 'TESTIMONIALS', 'CONTACT'],
      patterns: {
        hero: 'split',
        about: 'two-column',
        features: 'cards',
        products: 'grid',
        testimonials: 'cards',
        contact: 'form',
      },
      density: 'spacious',
      maxWidth: 'standard',
    },

    componentVariants: {
      header: {
        layout: 'split',
        sticky: true,
        background: 'blur',
        logoPosition: 'left',
        ctaStyle: 'button',
      },
      hero: {
        layout: 'split-right',
        imageStyle: 'side',
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
      style: 'concise',
      headlinePattern: 'outcome-first',
      length: {
        headlines: 'medium',
        descriptions: 'brief',
        cta: 'gentle',
      },
      voice: {
        person: 'second',
        formality: 'casual',
        emotion: 'warm',
      },
      keywords: ['smile', 'healthy', 'gentle', 'modern', 'comfortable', 'professional', 'caring'],
    },

    mediaRules: {
      imageStyle: 'bright dental office, happy patients with beautiful smiles, modern dental equipment, welcoming atmosphere',
      mood: 'bright',
      framing: 'close-up',
      composition: 'clean',
      preferredSources: ['unsplash', 'dalle'],
      searchKeywords: ['dental office', 'dentist patient', 'beautiful smile', 'teeth whitening', 'modern dental clinic'],
    },

    exemplars: ['Aspen Dental', 'Heartland Dental', 'Pacific Dental Services'],
    competitors: ['Dental franchises', 'Local dental practices', 'Cosmetic dentistry clinics'],
  },

  // Pharmacy - Trustworthy Clean
  {
    id: 'pharmacy-trustworthy-clean',
    label: 'Trustworthy Clean Pharmacy',
    description: 'Reliable pharmaceutical services with organized presentation',
    businessType: 'pharmacy',
    vibe: 'trustworthy_clean',

    designTokens: {
      colors: {
        bg: '#F0FDF4',
        surface: '#FFFFFF',
        text: '#1F2937',
        muted: '#6B7280',
        primary: '#059669',
        primaryContrast: '#FFFFFF',
        accent: '#0EA5E9',
        accentContrast: '#FFFFFF',
        border: '#D1FAE5',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      typography: {
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif',
        headingWeight: 600,
        bodyWeight: 400,
        baseSize: '16px',
        scale: 1.2,
      },
      spacing: {
        unit: 8,
        scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16],
      },
      radii: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px rgba(5, 150, 105, 0.05)',
        md: '0 4px 8px rgba(5, 150, 105, 0.08)',
        lg: '0 8px 16px rgba(5, 150, 105, 0.10)',
        xl: '0 16px 32px rgba(5, 150, 105, 0.12)',
      },
    },

    layoutRecipe: {
      sections: ['HERO', 'SERVICES', 'ABOUT', 'CONTACT'],
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
        imageRatio: 'square',
        hover: 'lift',
      },
      cta: {
        style: 'centered',
        urgency: 'low',
        background: 'solid',
      },
    },

    copyTone: {
      style: 'concise',
      headlinePattern: 'benefit-driven',
      length: {
        headlines: 'short',
        descriptions: 'brief',
        cta: 'gentle',
      },
      voice: {
        person: 'second',
        formality: 'professional',
        emotion: 'neutral',
      },
      keywords: ['reliable', 'convenient', 'care', 'trusted', 'prescription', 'wellness', 'health'],
    },

    mediaRules: {
      imageStyle: 'clean pharmacy interior, pharmacist helping customer, organized medication shelves, healthcare products',
      mood: 'professional',
      framing: 'wide',
      composition: 'clean',
      preferredSources: ['unsplash', 'dalle'],
      searchKeywords: ['pharmacy interior', 'pharmacist', 'medication', 'prescription', 'healthcare'],
    },

    exemplars: ['CVS', 'Walgreens', 'Rite Aid'],
    competitors: ['Major pharmacy chains', 'Independent pharmacies', 'Online pharmacies'],
  },

  // Note: This file is getting long. I'll continue with more business types in a follow-up implementation.
  // For now, this provides a strong foundation for the archetype pack library.
];

/**
 * Get comprehensive archetype pack by business type and vibe
 */
export function getComprehensiveArchetypePack(
  businessType: string,
  vibe?: string
): ArchetypePack | undefined {
  // Try exact match first
  if (vibe) {
    const exactMatch = COMPREHENSIVE_ARCHETYPE_PACKS.find(
      pack => pack.businessType === businessType && pack.vibe === vibe
    );
    if (exactMatch) return exactMatch;
  }

  // Fall back to first matching business type
  return COMPREHENSIVE_ARCHETYPE_PACKS.find(pack => pack.businessType === businessType);
}

/**
 * Get all comprehensive archetype packs for a business type
 */
export function getComprehensiveArchetypePacksByType(businessType: string): ArchetypePack[] {
  return COMPREHENSIVE_ARCHETYPE_PACKS.filter(pack => pack.businessType === businessType);
}

/**
 * Get all available vibes for a business type
 */
export function getAvailableVibesForType(businessType: string): string[] {
  return COMPREHENSIVE_ARCHETYPE_PACKS
    .filter(pack => pack.businessType === businessType)
    .map(pack => pack.vibe);
}
