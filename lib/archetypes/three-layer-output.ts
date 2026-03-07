/**
 * Three-Layer Output System
 *
 * Generates deterministic website output in three structured layers:
 * 1. tokens.json - Design tokens (colors, fonts, spacing, shadows, radii)
 * 2. sections.schema.json - Ordered section list with content models
 * 3. components/* - React/Next components that consume tokens + schema
 *
 * This ensures world-class consistency by separating:
 * - Design (tokens)
 * - Content structure (schema)
 * - Presentation (components)
 */

import { ArchetypePack, DesignTokens, LayoutRecipe } from './archetype-packs';

// ===================
// LAYER 1: TOKENS.JSON
// ===================

export interface TokensOutput {
  colors: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    primary: string;
    primaryContrast: string;
    accent: string;
    accentContrast?: string;
    border?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
  typography: {
    fonts: {
      heading: string;
      body: string;
      mono?: string;
    };
    weights: {
      heading: number;
      body: number;
    };
    sizes: {
      base: string;
      scale: number;
      computed: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
        '5xl': string;
      };
    };
  };
  spacing: {
    unit: number;
    scale: number[];
    computed: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
  };
  radii: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

/**
 * Generate tokens.json from archetype pack
 */
export function generateTokens(archetypePack: ArchetypePack): TokensOutput {
  const { designTokens } = archetypePack;

  // Compute type sizes based on scale
  const baseSize = parseFloat(designTokens.typography.baseSize);
  const scale = designTokens.typography.scale;

  const typeSizes = {
    xs: `${(baseSize * Math.pow(scale, -2)).toFixed(2)}px`,
    sm: `${(baseSize * Math.pow(scale, -1)).toFixed(2)}px`,
    base: designTokens.typography.baseSize,
    lg: `${(baseSize * Math.pow(scale, 1)).toFixed(2)}px`,
    xl: `${(baseSize * Math.pow(scale, 2)).toFixed(2)}px`,
    '2xl': `${(baseSize * Math.pow(scale, 3)).toFixed(2)}px`,
    '3xl': `${(baseSize * Math.pow(scale, 4)).toFixed(2)}px`,
    '4xl': `${(baseSize * Math.pow(scale, 5)).toFixed(2)}px`,
    '5xl': `${(baseSize * Math.pow(scale, 6)).toFixed(2)}px`,
  };

  // Compute spacing values based on unit and scale
  const spacingComputed = {
    xs: `${designTokens.spacing.unit * 0.5}px`,
    sm: `${designTokens.spacing.unit * 1}px`,
    md: `${designTokens.spacing.unit * 2}px`,
    lg: `${designTokens.spacing.unit * 4}px`,
    xl: `${designTokens.spacing.unit * 6}px`,
    '2xl': `${designTokens.spacing.unit * 8}px`,
    '3xl': `${designTokens.spacing.unit * 12}px`,
    '4xl': `${designTokens.spacing.unit * 16}px`,
    '5xl': `${designTokens.spacing.unit * 24}px`,
  };

  return {
    colors: designTokens.colors,
    typography: {
      fonts: {
        heading: designTokens.typography.headingFont,
        body: designTokens.typography.bodyFont,
        mono: designTokens.typography.monoFont,
      },
      weights: {
        heading: designTokens.typography.headingWeight,
        body: designTokens.typography.bodyWeight,
      },
      sizes: {
        base: designTokens.typography.baseSize,
        scale: designTokens.typography.scale,
        computed: typeSizes,
      },
    },
    spacing: {
      unit: designTokens.spacing.unit,
      scale: designTokens.spacing.scale,
      computed: spacingComputed,
    },
    radii: designTokens.radii,
    shadows: designTokens.shadows,
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  };
}

// ===================
// LAYER 2: SECTIONS.SCHEMA.JSON
// ===================

export interface SectionSchema {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  settings: {
    pattern?: string;
    imageRatio?: string;
    columns?: number;
    density?: string;
    background?: string;
  };
  content: SectionContent;
}

export interface SectionContent {
  // Common fields
  heading?: string;
  subheading?: string;
  description?: string;

  // Hero-specific
  image?: {
    url: string;
    alt: string;
    style?: string;
  };
  cta?: Array<{
    text: string;
    url: string;
    style: 'primary' | 'secondary' | 'outline';
  }>;

  // Features/Services
  items?: Array<{
    icon?: string;
    title: string;
    description: string;
    image?: {
      url: string;
      alt: string;
    };
  }>;

  // Testimonials
  testimonials?: Array<{
    quote: string;
    author: string;
    role?: string;
    avatar?: string;
    rating?: number;
  }>;

  // Team
  team?: Array<{
    name: string;
    role: string;
    bio?: string;
    image?: string;
    social?: {
      linkedin?: string;
      twitter?: string;
    };
  }>;

  // Contact
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    hours?: string;
    form?: boolean;
    map?: {
      latitude: number;
      longitude: number;
    };
  };

  // Pricing
  plans?: Array<{
    name: string;
    price: string;
    period?: string;
    features: string[];
    highlighted?: boolean;
    cta: {
      text: string;
      url: string;
    };
  }>;
}

export interface SectionsSchemaOutput {
  sections: SectionSchema[];
  metadata: {
    businessType: string;
    vibe: string;
    archetypeId: string;
    generatedAt: string;
  };
}

/**
 * Generate sections.schema.json from archetype pack and content
 */
export function generateSectionsSchema(
  archetypePack: ArchetypePack,
  generatedContent: any
): SectionsSchemaOutput {
  const { layoutRecipe, componentVariants } = archetypePack;

  // Convert layout recipe sections to schema
  const sections: SectionSchema[] = layoutRecipe.sections.map((sectionType, index) => {
    return {
      id: `section-${index + 1}`,
      type: sectionType,
      order: index,
      visible: true,
      settings: getSectionSettings(sectionType, layoutRecipe, componentVariants),
      content: getSectionContent(sectionType, generatedContent),
    };
  });

  return {
    sections,
    metadata: {
      businessType: archetypePack.businessType,
      vibe: archetypePack.vibe,
      archetypeId: archetypePack.id,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Get section settings based on archetype configuration
 */
function getSectionSettings(
  sectionType: string,
  layoutRecipe: LayoutRecipe,
  componentVariants: any
): SectionSchema['settings'] {
  const settings: SectionSchema['settings'] = {};

  switch (sectionType) {
    case 'HERO':
      settings.pattern = componentVariants.hero.layout;
      settings.background = componentVariants.hero.imageStyle;
      break;
    case 'FEATURES':
    case 'SERVICES':
      settings.pattern = layoutRecipe.patterns.features;
      settings.columns = layoutRecipe.patterns.features === 'grid' ? 3 : 1;
      break;
    case 'ABOUT':
      settings.pattern = layoutRecipe.patterns.about;
      break;
    case 'TESTIMONIALS':
      settings.pattern = layoutRecipe.patterns.testimonials;
      break;
    case 'CONTACT':
      settings.pattern = layoutRecipe.patterns.contact;
      break;
    case 'GALLERY':
    case 'PORTFOLIO':
      settings.pattern = layoutRecipe.patterns.products;
      settings.imageRatio = componentVariants.cards.imageRatio;
      break;
  }

  settings.density = layoutRecipe.density;

  return settings;
}

/**
 * Get section content from generated AI content
 */
function getSectionContent(sectionType: string, generatedContent: any): SectionContent {
  // Extract relevant content for this section type
  // This would integrate with the AI content generation
  const content: SectionContent = {};

  // Example mapping (simplified)
  if (sectionType === 'HERO') {
    content.heading = generatedContent?.hero?.headline || '';
    content.subheading = generatedContent?.hero?.subheadline || '';
    content.image = generatedContent?.hero?.image;
    content.cta = generatedContent?.hero?.cta || [];
  } else if (sectionType === 'FEATURES' || sectionType === 'SERVICES') {
    content.heading = generatedContent?.features?.heading || '';
    content.items = generatedContent?.features?.items || [];
  } else if (sectionType === 'ABOUT') {
    content.heading = generatedContent?.about?.heading || '';
    content.description = generatedContent?.about?.description || '';
  } else if (sectionType === 'TESTIMONIALS') {
    content.heading = 'What Our Customers Say';
    content.testimonials = generatedContent?.testimonials || [];
  } else if (sectionType === 'CONTACT') {
    content.heading = 'Get In Touch';
    content.contact = generatedContent?.contact || {};
  }

  return content;
}

// ===================
// LAYER 3: COMPONENT MAPPING
// ===================

/**
 * Component registry mapping section types to React components
 * This provides the connection between schema and presentation
 */
export const COMPONENT_REGISTRY = {
  HEADER: 'HeaderSection',
  HERO: 'HeroSection',
  FEATURES: 'FeaturesSection',
  SERVICES: 'ServicesSection',
  ABOUT: 'AboutSection',
  TEAM: 'TeamSection',
  TESTIMONIALS: 'TestimonialsSection',
  GALLERY: 'FeaturesSection', // Maps to FeaturesSection with image grid
  PORTFOLIO: 'FeaturesSection',
  PRICING: 'PricingSection',
  CTA: 'CTASection',
  CONTACT: 'ContactSection',
  FOOTER: 'FooterSection',
  TRUST_BADGES: 'TrustBadgesSection',
  MENU: 'MenuSection',
  BOOKING: 'BookingSection',
  STORE: 'StoreSection',
  MOBILE_STICKY_CTA: 'MobileStickyCtaSection',
  FLOATING_CTA: 'FloatingCtaSection',
  LOAN_CALCULATOR: 'LoanCalculatorSection',
} as const;

/**
 * Generate component props from section schema
 */
export function generateComponentProps(section: SectionSchema, tokens: TokensOutput): any {
  return {
    id: section.id,
    type: section.type,
    content: section.content,
    settings: section.settings,
    tokens, // Pass design tokens to component
    editable: false, // Set to true in editor mode
  };
}

// ===================
// COMPLETE OUTPUT GENERATOR
// ===================

export interface ThreeLayerOutput {
  tokens: TokensOutput;
  schema: SectionsSchemaOutput;
  components: {
    registry: typeof COMPONENT_REGISTRY;
    props: Record<string, any>;
  };
}

/**
 * Generate complete three-layer output
 */
export function generateThreeLayerOutput(
  archetypePack: ArchetypePack,
  generatedContent: any
): ThreeLayerOutput {
  // Layer 1: Generate design tokens
  const tokens = generateTokens(archetypePack);

  // Layer 2: Generate sections schema
  const schema = generateSectionsSchema(archetypePack, generatedContent);

  // Layer 3: Generate component props
  const componentProps: Record<string, any> = {};
  schema.sections.forEach(section => {
    componentProps[section.id] = generateComponentProps(section, tokens);
  });

  return {
    tokens,
    schema,
    components: {
      registry: COMPONENT_REGISTRY,
      props: componentProps,
    },
  };
}

/**
 * Export tokens as CSS custom properties
 */
export function exportTokensAsCSS(tokens: TokensOutput): string {
  return `:root {
  /* Colors */
  --color-bg: ${tokens.colors.bg};
  --color-surface: ${tokens.colors.surface};
  --color-text: ${tokens.colors.text};
  --color-muted: ${tokens.colors.muted};
  --color-primary: ${tokens.colors.primary};
  --color-primary-contrast: ${tokens.colors.primaryContrast};
  --color-accent: ${tokens.colors.accent};
  --color-accent-contrast: ${tokens.colors.accentContrast || '#FFFFFF'};
  --color-border: ${tokens.colors.border || '#E5E7EB'};
  --color-success: ${tokens.colors.success || '#10B981'};
  --color-warning: ${tokens.colors.warning || '#F59E0B'};
  --color-error: ${tokens.colors.error || '#EF4444'};

  /* Typography */
  --font-heading: ${tokens.typography.fonts.heading};
  --font-body: ${tokens.typography.fonts.body};
  ${tokens.typography.fonts.mono ? `--font-mono: ${tokens.typography.fonts.mono};` : ''}
  --font-weight-heading: ${tokens.typography.weights.heading};
  --font-weight-body: ${tokens.typography.weights.body};

  /* Font Sizes */
  --text-xs: ${tokens.typography.sizes.computed.xs};
  --text-sm: ${tokens.typography.sizes.computed.sm};
  --text-base: ${tokens.typography.sizes.computed.base};
  --text-lg: ${tokens.typography.sizes.computed.lg};
  --text-xl: ${tokens.typography.sizes.computed.xl};
  --text-2xl: ${tokens.typography.sizes.computed['2xl']};
  --text-3xl: ${tokens.typography.sizes.computed['3xl']};
  --text-4xl: ${tokens.typography.sizes.computed['4xl']};
  --text-5xl: ${tokens.typography.sizes.computed['5xl']};

  /* Spacing */
  --spacing-xs: ${tokens.spacing.computed.xs};
  --spacing-sm: ${tokens.spacing.computed.sm};
  --spacing-md: ${tokens.spacing.computed.md};
  --spacing-lg: ${tokens.spacing.computed.lg};
  --spacing-xl: ${tokens.spacing.computed.xl};
  --spacing-2xl: ${tokens.spacing.computed['2xl']};
  --spacing-3xl: ${tokens.spacing.computed['3xl']};
  --spacing-4xl: ${tokens.spacing.computed['4xl']};
  --spacing-5xl: ${tokens.spacing.computed['5xl']};

  /* Radii */
  --radius-sm: ${tokens.radii.sm};
  --radius-md: ${tokens.radii.md};
  --radius-lg: ${tokens.radii.lg};
  --radius-full: ${tokens.radii.full};

  /* Shadows */
  --shadow-sm: ${tokens.shadows.sm};
  --shadow-md: ${tokens.shadows.md};
  --shadow-lg: ${tokens.shadows.lg};
  --shadow-xl: ${tokens.shadows.xl};

  /* Breakpoints */
  --breakpoint-sm: ${tokens.breakpoints.sm};
  --breakpoint-md: ${tokens.breakpoints.md};
  --breakpoint-lg: ${tokens.breakpoints.lg};
  --breakpoint-xl: ${tokens.breakpoints.xl};
  --breakpoint-2xl: ${tokens.breakpoints['2xl']};
}`;
}

/**
 * Export tokens as Tailwind config
 */
export function exportTokensAsTailwind(tokens: TokensOutput): string {
  return `module.exports = {
  theme: {
    extend: {
      colors: {
        bg: '${tokens.colors.bg}',
        surface: '${tokens.colors.surface}',
        text: '${tokens.colors.text}',
        muted: '${tokens.colors.muted}',
        primary: {
          DEFAULT: '${tokens.colors.primary}',
          contrast: '${tokens.colors.primaryContrast}',
        },
        accent: {
          DEFAULT: '${tokens.colors.accent}',
          contrast: '${tokens.colors.accentContrast || '#FFFFFF'}',
        },
        border: '${tokens.colors.border || '#E5E7EB'}',
        success: '${tokens.colors.success || '#10B981'}',
        warning: '${tokens.colors.warning || '#F59E0B'}',
        error: '${tokens.colors.error || '#EF4444'}',
      },
      fontFamily: {
        heading: [${tokens.typography.fonts.heading.split(',').map(f => `'${f.trim()}'`).join(', ')}],
        body: [${tokens.typography.fonts.body.split(',').map(f => `'${f.trim()}'`).join(', ')}],
        ${tokens.typography.fonts.mono ? `mono: [${tokens.typography.fonts.mono.split(',').map(f => `'${f.trim()}'`).join(', ')}],` : ''}
      },
      spacing: {
        xs: '${tokens.spacing.computed.xs}',
        sm: '${tokens.spacing.computed.sm}',
        md: '${tokens.spacing.computed.md}',
        lg: '${tokens.spacing.computed.lg}',
        xl: '${tokens.spacing.computed.xl}',
        '2xl': '${tokens.spacing.computed['2xl']}',
        '3xl': '${tokens.spacing.computed['3xl']}',
        '4xl': '${tokens.spacing.computed['4xl']}',
        '5xl': '${tokens.spacing.computed['5xl']}',
      },
      borderRadius: {
        sm: '${tokens.radii.sm}',
        md: '${tokens.radii.md}',
        lg: '${tokens.radii.lg}',
        full: '${tokens.radii.full}',
      },
      boxShadow: {
        sm: '${tokens.shadows.sm}',
        md: '${tokens.shadows.md}',
        lg: '${tokens.shadows.lg}',
        xl: '${tokens.shadows.xl}',
      },
    },
  },
};`;
}
