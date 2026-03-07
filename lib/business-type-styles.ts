// Business Type Style Configurations
// Each business type gets a tailored color palette and design approach

export interface BusinessTypeStyle {
  id: string
  label: string
  colors: {
    primary: string
    secondary: string
    accent: string
    textHeading: string
    textBody: string
    textMuted: string
    bgPrimary: string
    bgSecondary: string
  }
  fonts: {
    heading: string
    body: string
  }
  aesthetic: 'luxury' | 'modern' | 'playful' | 'professional' | 'creative'
  keywords: string[] // For AI to understand the vibe
}

export const businessTypeStyles: Record<string, BusinessTypeStyle> = {
  'real-estate': {
    id: 'real-estate',
    label: 'Real Estate',
    colors: {
      primary: '#1e3a5f', // Deep navy - trust and sophistication
      secondary: '#2c2c2c', // Charcoal
      accent: '#d4af37', // Elegant gold
      textHeading: '#ffffff',
      textBody: '#e5e7eb',
      textMuted: '#9ca3af',
      bgPrimary: '#ffffff',
      bgSecondary: '#f5f5f5',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    aesthetic: 'luxury',
    keywords: ['exclusive', 'premium', 'sophisticated', 'elegant', 'luxury living'],
  },

  'restaurant': {
    id: 'restaurant',
    label: 'Restaurant / Cafe',
    colors: {
      primary: '#8b4513', // Warm brown
      secondary: '#d2691e', // Chocolate
      accent: '#ff6b35', // Warm orange
      textHeading: '#2c1810',
      textBody: '#4a4a4a',
      textMuted: '#8a8a8a',
      bgPrimary: '#fffbf5',
      bgSecondary: '#f9f3e9',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lato',
    },
    aesthetic: 'luxury',
    keywords: ['delicious', 'artisan', 'crafted', 'authentic', 'fresh'],
  },

  'bakery': {
    id: 'bakery',
    label: 'Bakery / Pastry',
    colors: {
      primary: '#d4a574', // Warm golden
      secondary: '#8b6f47', // Coffee brown
      accent: '#f0e68c', // Light gold
      textHeading: '#3e2723',
      textBody: '#5d4037',
      textMuted: '#a1887f',
      bgPrimary: '#fffaf0',
      bgSecondary: '#fef5e7',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lato',
    },
    aesthetic: 'playful',
    keywords: ['delightful', 'handcrafted', 'fresh-baked', 'artisanal', 'sweet'],
  },

  'tech': {
    id: 'tech',
    label: 'Technology / SaaS',
    colors: {
      primary: '#2563eb', // Vibrant blue
      secondary: '#0ea5e9', // Sky blue
      accent: '#06b6d4', // Cyan
      textHeading: '#ffffff',
      textBody: '#e0e7ff',
      textMuted: '#93c5fd',
      bgPrimary: '#ffffff',
      bgSecondary: '#f8fafc',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    aesthetic: 'modern',
    keywords: ['innovative', 'cutting-edge', 'powerful', 'intelligent', 'next-generation'],
  },

  'education': {
    id: 'education',
    label: 'Education / School',
    colors: {
      primary: '#1e40af', // Academic blue
      secondary: '#0369a1', // Sky blue
      accent: '#f59e0b', // Warm amber
      textHeading: '#1e293b',
      textBody: '#334155',
      textMuted: '#64748b',
      bgPrimary: '#ffffff',
      bgSecondary: '#f1f5f9',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Inter',
    },
    aesthetic: 'professional',
    keywords: ['excellence', 'knowledge', 'growth', 'achievement', 'nurturing'],
  },

  'health': {
    id: 'health',
    label: 'Healthcare / Wellness',
    colors: {
      primary: '#059669', // Medical green
      secondary: '#0891b2', // Teal
      accent: '#10b981', // Light green
      textHeading: '#064e3b',
      textBody: '#374151',
      textMuted: '#6b7280',
      bgPrimary: '#ffffff',
      bgSecondary: '#f0fdf4',
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Inter',
    },
    aesthetic: 'professional',
    keywords: ['trusted', 'caring', 'professional', 'wellness', 'health'],
  },

  'creative': {
    id: 'creative',
    label: 'Creative / Agency',
    colors: {
      primary: '#0891b2', // Vibrant cyan
      secondary: '#0ea5e9', // Sky blue
      accent: '#f59e0b', // Orange
      textHeading: '#1f2937',
      textBody: '#4b5563',
      textMuted: '#9ca3af',
      bgPrimary: '#ffffff',
      bgSecondary: '#f0f9ff',
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Inter',
    },
    aesthetic: 'creative',
    keywords: ['bold', 'innovative', 'imaginative', 'dynamic', 'standout'],
  },

  'luxury': {
    id: 'luxury',
    label: 'Luxury Goods / Services',
    colors: {
      primary: '#0f172a', // Deep slate
      secondary: '#1e293b', // Dark gray
      accent: '#d4af37', // Gold
      textHeading: '#ffffff',
      textBody: '#e2e8f0',
      textMuted: '#94a3b8',
      bgPrimary: '#ffffff',
      bgSecondary: '#f8fafc',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    aesthetic: 'luxury',
    keywords: ['exclusive', 'refined', 'prestigious', 'bespoke', 'exceptional'],
  },

  'default': {
    id: 'default',
    label: 'General Business',
    colors: {
      primary: '#2563eb', // Blue
      secondary: '#0ea5e9', // Sky blue
      accent: '#06b6d4', // Cyan
      textHeading: '#ffffff',
      textBody: '#e5e7eb',
      textMuted: '#9ca3af',
      bgPrimary: '#ffffff',
      bgSecondary: '#f9fafb',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    aesthetic: 'modern',
    keywords: ['professional', 'reliable', 'quality', 'trusted', 'exceptional'],
  },
}

// Helper function to get style config by business type
export function getBusinessTypeStyle(businessType: string): BusinessTypeStyle {
  const normalizedType = businessType.toLowerCase().replace(/[^a-z]/g, '-')

  // Try to find exact match
  if (businessTypeStyles[normalizedType]) {
    return businessTypeStyles[normalizedType]
  }

  // Try to find partial match
  for (const [key, style] of Object.entries(businessTypeStyles)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return style
    }
  }

  // Return default if no match found
  return businessTypeStyles.default
}

// Helper to generate CSS variables from business type style
export function generateStyleVariables(style: BusinessTypeStyle): Record<string, string> {
  return {
    '--color-primary': style.colors.primary,
    '--color-secondary': style.colors.secondary,
    '--color-accent': style.colors.accent,
    '--color-text-heading': style.colors.textHeading,
    '--color-text-body': style.colors.textBody,
    '--color-text-muted': style.colors.textMuted,
    '--color-bg-primary': style.colors.bgPrimary,
    '--color-bg-secondary': style.colors.bgSecondary,
    '--font-heading': `'${style.fonts.heading}', system-ui, -apple-system, sans-serif`,
    '--font-body': `'${style.fonts.body}', system-ui, -apple-system, sans-serif`,
  }
}
