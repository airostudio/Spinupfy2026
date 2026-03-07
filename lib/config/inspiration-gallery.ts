/**
 * Inspiration Gallery Configuration
 * Curated examples and references for each business type
 */

export interface InspirationItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  tags: string[];
  colorPalette?: string[];
  features?: string[];
}

export interface BusinessInspiration {
  businessType: string;
  examples: InspirationItem[];
  designTips: string[];
  mustHaveFeatures: string[];
  layoutSuggestions: string[];
}

/**
 * Inspiration examples by business type
 */
export const BUSINESS_INSPIRATIONS: Record<string, BusinessInspiration> = {
  'real-estate': {
    businessType: 'real-estate',
    examples: [
      {
        id: 're-1',
        title: 'Luxury Property Showcase',
        description: 'Clean, elegant design with large property images and easy navigation',
        imageUrl: '/inspiration/real-estate-luxury.jpg',
        category: 'Luxury Real Estate',
        tags: ['luxury', 'elegant', 'dark theme', 'property grid'],
        colorPalette: ['#1a1f2e', '#c9a962', '#ffffff'],
        features: ['Property search', 'Virtual tours', 'Agent profiles'],
      },
      {
        id: 're-2',
        title: 'Modern Residential',
        description: 'Bright, welcoming design focused on family homes',
        imageUrl: '/inspiration/real-estate-modern.jpg',
        category: 'Residential',
        tags: ['modern', 'clean', 'light theme', 'family-friendly'],
        colorPalette: ['#ffffff', '#2563eb', '#1e293b'],
        features: ['Interactive map', 'Price filters', 'Mortgage calculator'],
      },
    ],
    designTips: [
      'Use high-quality property images as focal points',
      'Include clear CTAs for scheduling viewings',
      'Display agent contact info prominently',
      'Add trust indicators like certifications and reviews',
    ],
    mustHaveFeatures: [
      'Property search with filters',
      'High-resolution image galleries',
      'Contact forms for inquiries',
      'Agent profiles with credentials',
    ],
    layoutSuggestions: [
      'Hero with featured property or search',
      'Property grid with quick filters',
      'About section with team info',
      'Testimonials from happy clients',
    ],
  },

  'restaurant': {
    businessType: 'restaurant',
    examples: [
      {
        id: 'rest-1',
        title: 'Fine Dining Experience',
        description: 'Dark, sophisticated design highlighting food photography',
        imageUrl: '/inspiration/restaurant-fine.jpg',
        category: 'Fine Dining',
        tags: ['elegant', 'dark theme', 'food photography', 'reservation'],
        colorPalette: ['#0f0f0f', '#d4af37', '#f5f5f5'],
        features: ['Online reservation', 'Menu showcase', 'Chef story'],
      },
      {
        id: 'rest-2',
        title: 'Casual Eatery',
        description: 'Warm, inviting design with menu focus',
        imageUrl: '/inspiration/restaurant-casual.jpg',
        category: 'Casual Dining',
        tags: ['warm', 'friendly', 'menu-focused', 'location'],
        colorPalette: ['#fefce8', '#ea580c', '#1c1917'],
        features: ['Online ordering', 'Location map', 'Hours display'],
      },
    ],
    designTips: [
      'Food photography is essential - use professional shots',
      'Make reservation/ordering CTAs highly visible',
      'Display hours and location prominently',
      'Show the atmosphere through imagery',
    ],
    mustHaveFeatures: [
      'Menu display with prices',
      'Online reservation or ordering',
      'Location with directions',
      'Operating hours',
    ],
    layoutSuggestions: [
      'Hero with signature dish or interior',
      'Menu highlights or full menu',
      'About the chef/restaurant story',
      'Location and contact info',
    ],
  },

  'tech-startup': {
    businessType: 'tech-startup',
    examples: [
      {
        id: 'tech-1',
        title: 'SaaS Product Page',
        description: 'Clean, modern design with feature highlights and pricing',
        imageUrl: '/inspiration/tech-saas.jpg',
        category: 'SaaS',
        tags: ['modern', 'clean', 'gradient', 'feature-focused'],
        colorPalette: ['#0f172a', '#8b5cf6', '#f8fafc'],
        features: ['Feature grid', 'Pricing table', 'Demo request'],
      },
      {
        id: 'tech-2',
        title: 'Developer Tools',
        description: 'Dark theme with code snippets and technical details',
        imageUrl: '/inspiration/tech-dev.jpg',
        category: 'Developer Tools',
        tags: ['dark', 'technical', 'code-focused', 'documentation'],
        colorPalette: ['#09090b', '#22c55e', '#a1a1aa'],
        features: ['Code examples', 'API docs', 'GitHub integration'],
      },
    ],
    designTips: [
      'Use clear, benefit-focused headlines',
      'Show the product in action with screenshots or demos',
      'Include social proof (logos, testimonials)',
      'Make sign-up/trial CTAs prominent',
    ],
    mustHaveFeatures: [
      'Clear value proposition',
      'Feature overview with benefits',
      'Pricing information',
      'Demo or trial signup',
    ],
    layoutSuggestions: [
      'Hero with product screenshot and CTA',
      'Feature grid with icons',
      'How it works section',
      'Pricing comparison table',
    ],
  },

  'healthcare': {
    businessType: 'healthcare',
    examples: [
      {
        id: 'health-1',
        title: 'Medical Practice',
        description: 'Clean, trustworthy design with easy appointment booking',
        imageUrl: '/inspiration/healthcare-practice.jpg',
        category: 'Medical Practice',
        tags: ['professional', 'clean', 'trustworthy', 'accessible'],
        colorPalette: ['#ffffff', '#0ea5e9', '#0f172a'],
        features: ['Online booking', 'Doctor profiles', 'Services list'],
      },
    ],
    designTips: [
      'Use calming, professional colors',
      'Make appointment booking easy to find',
      'Display credentials and certifications',
      'Ensure accessibility compliance',
    ],
    mustHaveFeatures: [
      'Online appointment scheduling',
      'Provider/doctor profiles',
      'Services offered',
      'Insurance information',
    ],
    layoutSuggestions: [
      'Hero with welcoming message and booking CTA',
      'Services overview',
      'Doctor/provider profiles',
      'Patient testimonials',
    ],
  },

  'fitness': {
    businessType: 'fitness',
    examples: [
      {
        id: 'fit-1',
        title: 'Modern Gym',
        description: 'Bold, energetic design with membership focus',
        imageUrl: '/inspiration/fitness-gym.jpg',
        category: 'Gym',
        tags: ['bold', 'energetic', 'dark', 'motivational'],
        colorPalette: ['#18181b', '#f97316', '#ffffff'],
        features: ['Class schedule', 'Membership plans', 'Trainer profiles'],
      },
    ],
    designTips: [
      'Use action shots and motivational imagery',
      'Display class schedules clearly',
      'Highlight membership benefits',
      'Show trainer credentials',
    ],
    mustHaveFeatures: [
      'Class schedule/calendar',
      'Membership pricing',
      'Trainer information',
      'Free trial or tour booking',
    ],
    layoutSuggestions: [
      'Hero with action imagery and trial CTA',
      'Class types/programs',
      'Trainer showcase',
      'Membership comparison',
    ],
  },
};

/**
 * Get inspiration for a business type
 */
export function getBusinessInspiration(businessType: string): BusinessInspiration | undefined {
  return BUSINESS_INSPIRATIONS[businessType];
}

/**
 * Get design tips for a business type
 */
export function getDesignTips(businessType: string): string[] {
  return BUSINESS_INSPIRATIONS[businessType]?.designTips || [
    'Use high-quality, relevant images',
    'Keep navigation simple and intuitive',
    'Make contact information easy to find',
    'Include clear calls-to-action',
  ];
}

/**
 * Get must-have features for a business type
 */
export function getMustHaveFeatures(businessType: string): string[] {
  return BUSINESS_INSPIRATIONS[businessType]?.mustHaveFeatures || [
    'Clear contact information',
    'About section',
    'Services or products overview',
    'Call-to-action buttons',
  ];
}

/**
 * General design tips for all websites
 */
export const GENERAL_DESIGN_TIPS = [
  'Keep your design consistent across all pages',
  'Use whitespace effectively to improve readability',
  'Ensure your site loads quickly on all devices',
  'Make navigation intuitive with clear labels',
  'Use high-contrast text for accessibility',
  'Include social proof like reviews and testimonials',
  'Add clear calls-to-action on every page',
  'Optimize images for web performance',
];
