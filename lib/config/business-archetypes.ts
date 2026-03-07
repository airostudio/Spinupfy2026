/**
 * Business Archetypes Configuration
 * Comprehensive design systems keyed by business type + vibe
 *
 * Each Archetype Pack includes:
 * - Design tokens: colors, fonts, radii, shadows, spacing scale
 * - Layout recipe: common sections + ordering + patterns
 * - Component variants: header styles, hero templates, cards, CTAs
 * - Copy tone rules: writing style guidelines
 * - Media rules: image style, framing preferences
 * - Default services/offerings for the business type
 */

import { BusinessTypeId, ColorMood } from '../types/business.types';

// Design Token Types
export interface DesignTokens {
  colors: {
    // Primary palette
    primary: string;        // Main brand color hex
    primaryLight: string;   // Lighter variant
    primaryDark: string;    // Darker variant
    primaryContrast: string; // Text on primary

    // Secondary palette
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    secondaryContrast: string;

    // Accent
    accent: string;
    accentContrast: string;

    // Backgrounds
    background: string;     // Main bg
    surface: string;        // Cards, elevated elements
    surfaceAlt: string;     // Alternative surface

    // Text
    text: string;           // Primary text
    textMuted: string;      // Secondary text
    textHeading: string;    // Heading text

    // Borders
    border: string;
    borderLight: string;
  };

  typography: {
    headingFont: string;    // Google Font name
    bodyFont: string;       // Google Font name
    headingWeight: string;  // Font weight for headings
    bodyWeight: string;     // Font weight for body
  };

  spacing: {
    scale: 'compact' | 'normal' | 'spacious' | 'airy';
    sectionPadding: string; // e.g., 'py-16' or 'py-24'
    cardPadding: string;
    containerWidth: 'narrow' | 'normal' | 'wide' | 'full';
  };

  borders: {
    radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    style: 'solid' | 'subtle' | 'none';
  };

  shadows: {
    card: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hover: 'none' | 'lift' | 'glow' | 'spread';
  };
}

// Layout Recipe Types
export interface LayoutRecipe {
  sections: {
    type: string;
    required: boolean;
    order: number;
    defaultLayout?: string;
    notes?: string;
  }[];

  header: {
    style: 'transparent' | 'solid' | 'floating';
    sticky: boolean;
    logoPosition: 'left' | 'center';
    navStyle: 'inline' | 'dropdown' | 'mega';
    ctaStyle: 'button' | 'text' | 'icon' | 'none';
  };

  hero: {
    style: 'fullscreen' | 'split' | 'centered' | 'minimal' | 'video';
    imagePosition: 'background' | 'right' | 'left' | 'overlay';
    ctaStyle: 'single' | 'dual' | 'form';
    overlayOpacity?: number;
  };

  footer: {
    style: 'simple' | 'multi-column' | 'centered' | 'minimal';
    showSocial: boolean;
    showNewsletter: boolean;
  };
}

// Copy Tone Rules
export interface CopyToneRules {
  overall: 'professional' | 'friendly' | 'luxurious' | 'casual' | 'authoritative' | 'warm' | 'energetic';
  headlineStyle: 'benefit-focused' | 'emotional' | 'direct' | 'question' | 'statement';
  descriptionLength: 'short' | 'medium' | 'long';
  ctaStyle: 'action' | 'benefit' | 'urgency' | 'invitation';

  // Example phrases for this business type
  exampleHeadlines: string[];
  exampleCTAs: string[];

  // Words to use/avoid
  preferredWords: string[];
  avoidWords: string[];
}

// Media Rules
export interface MediaRules {
  imageStyle: 'professional' | 'lifestyle' | 'product' | 'artistic' | 'minimal' | 'vibrant';
  framing: 'close-up' | 'wide' | 'environmental' | 'detail' | 'people-focused';
  colorTreatment: 'natural' | 'moody' | 'bright' | 'muted' | 'high-contrast';
  preferredSubjects: string[];
  unsplashKeywords: string[];
}

// Default Services for Business Type
export interface DefaultService {
  title: string;
  description: string;
  icon: string;  // Lucide icon name
  features?: string[];
}

// Complete Archetype Pack
export interface ArchetypePack {
  id: string;
  businessType: BusinessTypeId;
  vibe: ColorMood;
  name: string;
  description: string;

  tokens: DesignTokens;
  layout: LayoutRecipe;
  copyTone: CopyToneRules;
  media: MediaRules;

  // Business-specific defaults
  defaultServices: DefaultService[];
  defaultNavItems: { label: string; href: string }[];
  defaultCTAText: string;
  defaultTagline: string;
}

// ============================================================================
// ARCHETYPE PACKS BY BUSINESS TYPE
// ============================================================================

export const BUSINESS_ARCHETYPES: Record<string, ArchetypePack> = {
  // ---------------------------------------------------------------------------
  // HEALTHCARE: Physiotherapy / Physical Therapy
  // ---------------------------------------------------------------------------
  'physiotherapy': {
    id: 'physiotherapy',
    businessType: 'medical',
    vibe: 'trustworthy',
    name: 'Healthcare Professional',
    description: 'Clean, trustworthy design for physical therapy and rehabilitation clinics',

    tokens: {
      colors: {
        primary: '#0891b2',      // Teal/cyan - healing, trust
        primaryLight: '#22d3ee',
        primaryDark: '#0e7490',
        primaryContrast: '#ffffff',
        secondary: '#1e40af',    // Deep blue - professionalism
        secondaryLight: '#3b82f6',
        secondaryDark: '#1e3a8a',
        secondaryContrast: '#ffffff',
        accent: '#10b981',       // Green - health, wellness
        accentContrast: '#ffffff',
        background: '#f8fafc',
        surface: '#ffffff',
        surfaceAlt: '#f1f5f9',
        text: '#1e293b',
        textMuted: '#64748b',
        textHeading: '#0f172a',
        border: '#e2e8f0',
        borderLight: '#f1f5f9',
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        headingWeight: '600',
        bodyWeight: '400',
      },
      spacing: {
        scale: 'spacious',
        sectionPadding: 'py-20',
        cardPadding: 'p-6',
        containerWidth: 'normal',
      },
      borders: {
        radius: 'lg',
        style: 'subtle',
      },
      shadows: {
        card: 'md',
        hover: 'lift',
      },
    },

    layout: {
      sections: [
        { type: 'HEADER', required: true, order: -1 },
        { type: 'HERO', required: true, order: 0, defaultLayout: 'split', notes: 'Show friendly practitioner image' },
        { type: 'TRUST_BADGES', required: false, order: 1, notes: 'Certifications, insurance accepted' },
        { type: 'SERVICES', required: true, order: 2, notes: 'Treatment types with clear descriptions' },
        { type: 'ABOUT', required: true, order: 3, notes: 'Team credentials and philosophy' },
        { type: 'TEAM', required: true, order: 4, notes: 'Licensed practitioners with credentials' },
        { type: 'TESTIMONIALS', required: true, order: 5, notes: 'Patient success stories' },
        { type: 'FAQ', required: false, order: 6, notes: 'Common questions about treatment' },
        { type: 'CTA', required: true, order: 7, notes: 'Book appointment CTA' },
        { type: 'CONTACT', required: true, order: 8 },
        { type: 'FOOTER', required: true, order: 1000 },
      ],
      header: {
        style: 'solid',
        sticky: true,
        logoPosition: 'left',
        navStyle: 'inline',
        ctaStyle: 'button',
      },
      hero: {
        style: 'split',
        imagePosition: 'right',
        ctaStyle: 'dual',
      },
      footer: {
        style: 'multi-column',
        showSocial: true,
        showNewsletter: false,
      },
    },

    copyTone: {
      overall: 'professional',
      headlineStyle: 'benefit-focused',
      descriptionLength: 'medium',
      ctaStyle: 'action',
      exampleHeadlines: [
        'Move Better, Live Better',
        'Expert Physical Therapy for Lasting Recovery',
        'Your Path to Pain-Free Living Starts Here',
        'Personalized Care for Every Body',
      ],
      exampleCTAs: [
        'Book Your Assessment',
        'Schedule Appointment',
        'Start Your Recovery',
        'Get Expert Help',
      ],
      preferredWords: ['recovery', 'wellness', 'expert', 'personalized', 'evidence-based', 'compassionate'],
      avoidWords: ['cheap', 'discount', 'quick fix', 'miracle'],
    },

    media: {
      imageStyle: 'professional',
      framing: 'people-focused',
      colorTreatment: 'bright',
      preferredSubjects: ['therapy sessions', 'rehabilitation exercises', 'clinic interior', 'happy patients'],
      unsplashKeywords: ['physical therapy', 'rehabilitation', 'physiotherapy', 'healthcare professional', 'wellness clinic'],
    },

    defaultServices: [
      {
        title: 'Manual Therapy',
        description: 'Hands-on techniques to reduce pain, improve mobility, and restore function through specialized manipulation and mobilization.',
        icon: 'Hand',
        features: ['Joint mobilization', 'Soft tissue massage', 'Trigger point therapy'],
      },
      {
        title: 'Sports Rehabilitation',
        description: 'Specialized recovery programs for athletes to return to peak performance after injury.',
        icon: 'Activity',
        features: ['Injury assessment', 'Performance training', 'Return-to-sport protocols'],
      },
      {
        title: 'Post-Surgery Recovery',
        description: 'Comprehensive rehabilitation programs following orthopedic and other surgical procedures.',
        icon: 'Heart',
        features: ['Joint replacements', 'Spinal surgery', 'ACL reconstruction'],
      },
      {
        title: 'Chronic Pain Management',
        description: 'Evidence-based approaches to manage and reduce persistent pain conditions.',
        icon: 'Shield',
        features: ['Pain education', 'Movement therapy', 'Lifestyle modification'],
      },
      {
        title: 'Balance & Fall Prevention',
        description: 'Improve stability and confidence with targeted balance training programs.',
        icon: 'Target',
        features: ['Balance assessment', 'Vestibular therapy', 'Strength training'],
      },
      {
        title: 'Workplace Ergonomics',
        description: 'Prevent and address work-related injuries through ergonomic assessment and education.',
        icon: 'Monitor',
        features: ['Workstation setup', 'Posture correction', 'Injury prevention'],
      },
    ],

    defaultNavItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' },
      { label: 'About Us', href: '/about' },
      { label: 'Our Team', href: '/team' },
      { label: 'Contact', href: '/contact' },
    ],

    defaultCTAText: 'Book Appointment',
    defaultTagline: 'Expert care for your recovery journey',
  },

  // ---------------------------------------------------------------------------
  // BAKERY: Warm Artisanal
  // ---------------------------------------------------------------------------
  'bakery.warm_artisanal': {
    id: 'bakery.warm_artisanal',
    businessType: 'bakery',
    vibe: 'warm',
    name: 'Warm Artisanal Bakery',
    description: 'Inviting, handcrafted feel for artisan bakeries',

    tokens: {
      colors: {
        primary: '#b45309',      // Warm amber/brown
        primaryLight: '#d97706',
        primaryDark: '#92400e',
        primaryContrast: '#ffffff',
        secondary: '#78350f',    // Deep brown
        secondaryLight: '#92400e',
        secondaryDark: '#451a03',
        secondaryContrast: '#ffffff',
        accent: '#dc2626',       // Warm red
        accentContrast: '#ffffff',
        background: '#fffbeb',   // Cream
        surface: '#ffffff',
        surfaceAlt: '#fef3c7',
        text: '#451a03',
        textMuted: '#78350f',
        textHeading: '#292524',
        border: '#fcd34d',
        borderLight: '#fef3c7',
      },
      typography: {
        headingFont: 'Playfair Display',
        bodyFont: 'Lato',
        headingWeight: '700',
        bodyWeight: '400',
      },
      spacing: {
        scale: 'spacious',
        sectionPadding: 'py-16',
        cardPadding: 'p-6',
        containerWidth: 'normal',
      },
      borders: {
        radius: 'lg',
        style: 'subtle',
      },
      shadows: {
        card: 'sm',
        hover: 'lift',
      },
    },

    layout: {
      sections: [
        { type: 'HEADER', required: true, order: -1 },
        { type: 'HERO', required: true, order: 0, defaultLayout: 'fullscreen', notes: 'Mouth-watering bakery imagery' },
        { type: 'FEATURES', required: true, order: 1, notes: 'Featured products or categories' },
        { type: 'ABOUT', required: true, order: 2, notes: 'Story of the bakery, tradition' },
        { type: 'GALLERY', required: true, order: 3, notes: 'Product photography' },
        { type: 'TESTIMONIALS', required: false, order: 4 },
        { type: 'CONTACT', required: true, order: 5, notes: 'Location, hours, order info' },
        { type: 'FOOTER', required: true, order: 1000 },
      ],
      header: {
        style: 'transparent',
        sticky: true,
        logoPosition: 'center',
        navStyle: 'inline',
        ctaStyle: 'button',
      },
      hero: {
        style: 'fullscreen',
        imagePosition: 'background',
        ctaStyle: 'dual',
        overlayOpacity: 0.4,
      },
      footer: {
        style: 'simple',
        showSocial: true,
        showNewsletter: true,
      },
    },

    copyTone: {
      overall: 'warm',
      headlineStyle: 'emotional',
      descriptionLength: 'short',
      ctaStyle: 'invitation',
      exampleHeadlines: [
        'Freshly Baked, Made with Love',
        'Artisan Breads & Pastries Since [Year]',
        'The Aroma of Tradition',
        'Handcrafted Daily, Just for You',
      ],
      exampleCTAs: [
        'Order Now',
        'View Our Menu',
        'Visit Us Today',
        'Pre-Order for Pickup',
      ],
      preferredWords: ['fresh', 'artisan', 'handcrafted', 'daily', 'traditional', 'homemade', 'locally sourced'],
      avoidWords: ['processed', 'mass-produced', 'artificial'],
    },

    media: {
      imageStyle: 'lifestyle',
      framing: 'close-up',
      colorTreatment: 'natural',
      preferredSubjects: ['fresh bread', 'pastries', 'bakery interior', 'baking process', 'ingredients'],
      unsplashKeywords: ['artisan bread', 'bakery', 'pastries', 'croissant', 'sourdough', 'baking'],
    },

    defaultServices: [
      {
        title: 'Artisan Breads',
        description: 'Traditional sourdough, baguettes, and specialty loaves baked fresh daily.',
        icon: 'Wheat',
      },
      {
        title: 'Pastries & Croissants',
        description: 'Flaky, buttery pastries and classic French croissants.',
        icon: 'Croissant',
      },
      {
        title: 'Custom Cakes',
        description: 'Beautiful celebration cakes for weddings, birthdays, and special occasions.',
        icon: 'Cake',
      },
      {
        title: 'Coffee & Beverages',
        description: 'Locally roasted coffee and specialty drinks to complement your treats.',
        icon: 'Coffee',
      },
    ],

    defaultNavItems: [
      { label: 'Home', href: '/' },
      { label: 'Our Breads', href: '/breads' },
      { label: 'Pastries', href: '/pastries' },
      { label: 'Custom Orders', href: '/custom-orders' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],

    defaultCTAText: 'Order Now',
    defaultTagline: 'Freshly baked with love, every single day',
  },

  // ---------------------------------------------------------------------------
  // RESTAURANT: Elegant Dining
  // ---------------------------------------------------------------------------
  'restaurant.elegant': {
    id: 'restaurant.elegant',
    businessType: 'restaurant',
    vibe: 'elegant',
    name: 'Elegant Restaurant',
    description: 'Sophisticated design for upscale dining establishments',

    tokens: {
      colors: {
        primary: '#1c1917',      // Rich black
        primaryLight: '#292524',
        primaryDark: '#0c0a09',
        primaryContrast: '#ffffff',
        secondary: '#78350f',    // Warm brown
        secondaryLight: '#92400e',
        secondaryDark: '#451a03',
        secondaryContrast: '#ffffff',
        accent: '#ca8a04',       // Gold
        accentContrast: '#000000',
        background: '#fafaf9',
        surface: '#ffffff',
        surfaceAlt: '#f5f5f4',
        text: '#1c1917',
        textMuted: '#57534e',
        textHeading: '#0c0a09',
        border: '#d6d3d1',
        borderLight: '#e7e5e4',
      },
      typography: {
        headingFont: 'Cormorant Garamond',
        bodyFont: 'Montserrat',
        headingWeight: '600',
        bodyWeight: '400',
      },
      spacing: {
        scale: 'airy',
        sectionPadding: 'py-24',
        cardPadding: 'p-8',
        containerWidth: 'narrow',
      },
      borders: {
        radius: 'none',
        style: 'subtle',
      },
      shadows: {
        card: 'none',
        hover: 'none',
      },
    },

    layout: {
      sections: [
        { type: 'HEADER', required: true, order: -1 },
        { type: 'HERO', required: true, order: 0, defaultLayout: 'fullscreen' },
        { type: 'ABOUT', required: true, order: 1, notes: 'Chef story, philosophy' },
        { type: 'MENU', required: true, order: 2 },
        { type: 'GALLERY', required: true, order: 3 },
        { type: 'TESTIMONIALS', required: false, order: 4 },
        { type: 'BOOKING', required: true, order: 5 },
        { type: 'CONTACT', required: true, order: 6 },
        { type: 'FOOTER', required: true, order: 1000 },
      ],
      header: {
        style: 'transparent',
        sticky: true,
        logoPosition: 'center',
        navStyle: 'inline',
        ctaStyle: 'text',
      },
      hero: {
        style: 'fullscreen',
        imagePosition: 'background',
        ctaStyle: 'single',
        overlayOpacity: 0.5,
      },
      footer: {
        style: 'centered',
        showSocial: true,
        showNewsletter: false,
      },
    },

    copyTone: {
      overall: 'luxurious',
      headlineStyle: 'emotional',
      descriptionLength: 'short',
      ctaStyle: 'invitation',
      exampleHeadlines: [
        'A Culinary Journey Awaits',
        'Where Every Meal Becomes a Memory',
        'Taste the Art of Fine Dining',
        'Excellence in Every Detail',
      ],
      exampleCTAs: [
        'Reserve a Table',
        'View Our Menu',
        'Book Your Experience',
        'Make a Reservation',
      ],
      preferredWords: ['curated', 'artisanal', 'seasonal', 'locally sourced', 'crafted', 'experience'],
      avoidWords: ['cheap', 'deal', 'fast', 'quick'],
    },

    media: {
      imageStyle: 'artistic',
      framing: 'close-up',
      colorTreatment: 'moody',
      preferredSubjects: ['plated dishes', 'ambient dining room', 'chef at work', 'ingredients'],
      unsplashKeywords: ['fine dining', 'gourmet food', 'restaurant interior', 'chef cooking', 'elegant dinner'],
    },

    defaultServices: [
      {
        title: 'Dinner Service',
        description: 'Experience our evening tasting menu featuring seasonal ingredients.',
        icon: 'UtensilsCrossed',
      },
      {
        title: 'Private Dining',
        description: 'Exclusive space for intimate gatherings and special celebrations.',
        icon: 'Users',
      },
      {
        title: 'Wine Pairing',
        description: 'Curated wine selections to complement each course.',
        icon: 'Wine',
      },
      {
        title: 'Chef\'s Table',
        description: 'An exclusive front-row seat to culinary artistry.',
        icon: 'ChefHat',
      },
    ],

    defaultNavItems: [
      { label: 'Home', href: '/' },
      { label: 'Menu', href: '/menu' },
      { label: 'About', href: '/about' },
      { label: 'Private Dining', href: '/private-dining' },
      { label: 'Reservations', href: '/reservations' },
      { label: 'Contact', href: '/contact' },
    ],

    defaultCTAText: 'Reserve a Table',
    defaultTagline: 'Where culinary artistry meets unforgettable moments',
  },

  // ---------------------------------------------------------------------------
  // LAW FIRM: Professional
  // ---------------------------------------------------------------------------
  'law-firm.professional': {
    id: 'law-firm.professional',
    businessType: 'law-firm',
    vibe: 'professional',
    name: 'Professional Law Firm',
    description: 'Authoritative, trustworthy design for legal practices',

    tokens: {
      colors: {
        primary: '#1e3a5f',      // Navy blue
        primaryLight: '#2563eb',
        primaryDark: '#1e3a8a',
        primaryContrast: '#ffffff',
        secondary: '#374151',    // Slate gray
        secondaryLight: '#4b5563',
        secondaryDark: '#1f2937',
        secondaryContrast: '#ffffff',
        accent: '#b45309',       // Gold/amber
        accentContrast: '#ffffff',
        background: '#f9fafb',
        surface: '#ffffff',
        surfaceAlt: '#f3f4f6',
        text: '#1f2937',
        textMuted: '#6b7280',
        textHeading: '#111827',
        border: '#e5e7eb',
        borderLight: '#f3f4f6',
      },
      typography: {
        headingFont: 'Merriweather',
        bodyFont: 'Open Sans',
        headingWeight: '700',
        bodyWeight: '400',
      },
      spacing: {
        scale: 'spacious',
        sectionPadding: 'py-20',
        cardPadding: 'p-8',
        containerWidth: 'normal',
      },
      borders: {
        radius: 'sm',
        style: 'solid',
      },
      shadows: {
        card: 'sm',
        hover: 'lift',
      },
    },

    layout: {
      sections: [
        { type: 'HEADER', required: true, order: -1 },
        { type: 'HERO', required: true, order: 0, defaultLayout: 'split' },
        { type: 'TRUST_BADGES', required: true, order: 1, notes: 'Bar associations, awards' },
        { type: 'SERVICES', required: true, order: 2, notes: 'Practice areas' },
        { type: 'ABOUT', required: true, order: 3 },
        { type: 'TEAM', required: true, order: 4, notes: 'Attorneys with credentials' },
        { type: 'TESTIMONIALS', required: true, order: 5, notes: 'Client testimonials' },
        { type: 'CTA', required: true, order: 6, notes: 'Free consultation CTA' },
        { type: 'CONTACT', required: true, order: 7 },
        { type: 'FOOTER', required: true, order: 1000 },
      ],
      header: {
        style: 'solid',
        sticky: true,
        logoPosition: 'left',
        navStyle: 'dropdown',
        ctaStyle: 'button',
      },
      hero: {
        style: 'split',
        imagePosition: 'right',
        ctaStyle: 'dual',
      },
      footer: {
        style: 'multi-column',
        showSocial: true,
        showNewsletter: false,
      },
    },

    copyTone: {
      overall: 'authoritative',
      headlineStyle: 'benefit-focused',
      descriptionLength: 'medium',
      ctaStyle: 'action',
      exampleHeadlines: [
        'Protecting Your Rights, Securing Your Future',
        'Experienced Legal Counsel You Can Trust',
        'Dedicated Advocates for Your Case',
        'Results-Driven Legal Representation',
      ],
      exampleCTAs: [
        'Schedule Free Consultation',
        'Contact Our Attorneys',
        'Get Legal Help Today',
        'Speak With a Lawyer',
      ],
      preferredWords: ['experienced', 'dedicated', 'trusted', 'results', 'advocacy', 'representation'],
      avoidWords: ['cheap', 'discount', 'guaranteed'],
    },

    media: {
      imageStyle: 'professional',
      framing: 'environmental',
      colorTreatment: 'natural',
      preferredSubjects: ['law office', 'attorneys', 'courtroom', 'legal documents'],
      unsplashKeywords: ['law firm', 'attorney', 'legal office', 'scales of justice', 'courtroom'],
    },

    defaultServices: [
      {
        title: 'Personal Injury',
        description: 'Aggressive representation for accident victims to secure maximum compensation.',
        icon: 'Shield',
        features: ['Auto accidents', 'Workplace injuries', 'Medical malpractice'],
      },
      {
        title: 'Family Law',
        description: 'Compassionate guidance through divorce, custody, and family matters.',
        icon: 'Users',
        features: ['Divorce', 'Child custody', 'Prenuptial agreements'],
      },
      {
        title: 'Criminal Defense',
        description: 'Vigorous defense of your rights in criminal proceedings.',
        icon: 'Scale',
        features: ['DUI defense', 'Felony charges', 'Misdemeanors'],
      },
      {
        title: 'Estate Planning',
        description: 'Protect your legacy with comprehensive estate planning services.',
        icon: 'FileText',
        features: ['Wills', 'Trusts', 'Probate'],
      },
      {
        title: 'Business Law',
        description: 'Strategic legal counsel for businesses of all sizes.',
        icon: 'Building',
        features: ['Contracts', 'Business formation', 'Litigation'],
      },
      {
        title: 'Real Estate Law',
        description: 'Expert guidance for property transactions and disputes.',
        icon: 'Home',
        features: ['Closings', 'Title issues', 'Landlord-tenant'],
      },
    ],

    defaultNavItems: [
      { label: 'Home', href: '/' },
      { label: 'Practice Areas', href: '/practice-areas' },
      { label: 'Our Attorneys', href: '/attorneys' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],

    defaultCTAText: 'Free Consultation',
    defaultTagline: 'Experienced legal counsel dedicated to your success',
  },

  // ---------------------------------------------------------------------------
  // TECH SAAS: Modern
  // ---------------------------------------------------------------------------
  'tech-saas.modern': {
    id: 'tech-saas.modern',
    businessType: 'tech-saas',
    vibe: 'professional',
    name: 'Modern SaaS',
    description: 'Clean, innovative design for software and technology companies',

    tokens: {
      colors: {
        primary: '#2563eb',      // Bright blue
        primaryLight: '#3b82f6',
        primaryDark: '#1d4ed8',
        primaryContrast: '#ffffff',
        secondary: '#7c3aed',    // Purple
        secondaryLight: '#8b5cf6',
        secondaryDark: '#6d28d9',
        secondaryContrast: '#ffffff',
        accent: '#06b6d4',       // Cyan
        accentContrast: '#ffffff',
        background: '#0f172a',   // Dark
        surface: '#1e293b',
        surfaceAlt: '#334155',
        text: '#f1f5f9',
        textMuted: '#94a3b8',
        textHeading: '#ffffff',
        border: '#334155',
        borderLight: '#475569',
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        headingWeight: '700',
        bodyWeight: '400',
      },
      spacing: {
        scale: 'spacious',
        sectionPadding: 'py-24',
        cardPadding: 'p-6',
        containerWidth: 'wide',
      },
      borders: {
        radius: 'xl',
        style: 'subtle',
      },
      shadows: {
        card: 'lg',
        hover: 'glow',
      },
    },

    layout: {
      sections: [
        { type: 'HEADER', required: true, order: -1 },
        { type: 'HERO', required: true, order: 0, defaultLayout: 'centered' },
        { type: 'TRUST_BADGES', required: true, order: 1, notes: 'Customer logos' },
        { type: 'FEATURES', required: true, order: 2, defaultLayout: 'bento' },
        { type: 'HOW_IT_WORKS', required: false, order: 3 },
        { type: 'PRICING', required: true, order: 4 },
        { type: 'TESTIMONIALS', required: true, order: 5 },
        { type: 'FAQ', required: false, order: 6 },
        { type: 'CTA', required: true, order: 7 },
        { type: 'FOOTER', required: true, order: 1000 },
      ],
      header: {
        style: 'floating',
        sticky: true,
        logoPosition: 'left',
        navStyle: 'inline',
        ctaStyle: 'button',
      },
      hero: {
        style: 'centered',
        imagePosition: 'background',
        ctaStyle: 'dual',
      },
      footer: {
        style: 'multi-column',
        showSocial: true,
        showNewsletter: true,
      },
    },

    copyTone: {
      overall: 'professional',
      headlineStyle: 'benefit-focused',
      descriptionLength: 'short',
      ctaStyle: 'action',
      exampleHeadlines: [
        'Ship faster. Build better.',
        'The modern way to [solve problem]',
        'Everything you need to [achieve outcome]',
        'Transform how you [do something]',
      ],
      exampleCTAs: [
        'Start Free Trial',
        'Get Started',
        'Try for Free',
        'Book a Demo',
      ],
      preferredWords: ['modern', 'fast', 'simple', 'powerful', 'seamless', 'automated'],
      avoidWords: ['complicated', 'legacy', 'outdated'],
    },

    media: {
      imageStyle: 'minimal',
      framing: 'detail',
      colorTreatment: 'high-contrast',
      preferredSubjects: ['product screenshots', 'dashboard UI', 'abstract gradients', 'tech illustrations'],
      unsplashKeywords: ['technology', 'software', 'computer', 'abstract gradient', 'modern office'],
    },

    defaultServices: [
      {
        title: 'Analytics Dashboard',
        description: 'Real-time insights and metrics at your fingertips.',
        icon: 'BarChart3',
      },
      {
        title: 'Automation',
        description: 'Streamline workflows and eliminate manual tasks.',
        icon: 'Zap',
      },
      {
        title: 'Integrations',
        description: 'Connect with your favorite tools seamlessly.',
        icon: 'Puzzle',
      },
      {
        title: 'Security',
        description: 'Enterprise-grade security for your data.',
        icon: 'Shield',
      },
    ],

    defaultNavItems: [
      { label: 'Home', href: '/' },
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Docs', href: '/docs' },
      { label: 'Contact', href: '/contact' },
    ],

    defaultCTAText: 'Start Free Trial',
    defaultTagline: 'The modern platform for modern teams',
  },

  // ---------------------------------------------------------------------------
  // DENTAL: Clean Professional
  // ---------------------------------------------------------------------------
  'dental.professional': {
    id: 'dental.professional',
    businessType: 'dental',
    vibe: 'trustworthy',
    name: 'Professional Dental Practice',
    description: 'Clean, welcoming design for dental clinics',

    tokens: {
      colors: {
        primary: '#0ea5e9',      // Sky blue
        primaryLight: '#38bdf8',
        primaryDark: '#0284c7',
        primaryContrast: '#ffffff',
        secondary: '#14b8a6',    // Teal
        secondaryLight: '#2dd4bf',
        secondaryDark: '#0d9488',
        secondaryContrast: '#ffffff',
        accent: '#22c55e',       // Green
        accentContrast: '#ffffff',
        background: '#f0fdfa',   // Light mint
        surface: '#ffffff',
        surfaceAlt: '#f0fdf4',
        text: '#1e293b',
        textMuted: '#64748b',
        textHeading: '#0f172a',
        border: '#e2e8f0',
        borderLight: '#f1f5f9',
      },
      typography: {
        headingFont: 'Poppins',
        bodyFont: 'Open Sans',
        headingWeight: '600',
        bodyWeight: '400',
      },
      spacing: {
        scale: 'spacious',
        sectionPadding: 'py-20',
        cardPadding: 'p-6',
        containerWidth: 'normal',
      },
      borders: {
        radius: 'xl',
        style: 'subtle',
      },
      shadows: {
        card: 'md',
        hover: 'lift',
      },
    },

    layout: {
      sections: [
        { type: 'HEADER', required: true, order: -1 },
        { type: 'HERO', required: true, order: 0, defaultLayout: 'split' },
        { type: 'SERVICES', required: true, order: 1 },
        { type: 'ABOUT', required: true, order: 2 },
        { type: 'TEAM', required: true, order: 3 },
        { type: 'TESTIMONIALS', required: true, order: 4 },
        { type: 'FAQ', required: false, order: 5 },
        { type: 'CTA', required: true, order: 6, notes: 'Book appointment' },
        { type: 'CONTACT', required: true, order: 7 },
        { type: 'FOOTER', required: true, order: 1000 },
      ],
      header: {
        style: 'solid',
        sticky: true,
        logoPosition: 'left',
        navStyle: 'inline',
        ctaStyle: 'button',
      },
      hero: {
        style: 'split',
        imagePosition: 'right',
        ctaStyle: 'dual',
      },
      footer: {
        style: 'multi-column',
        showSocial: true,
        showNewsletter: false,
      },
    },

    copyTone: {
      overall: 'friendly',
      headlineStyle: 'benefit-focused',
      descriptionLength: 'medium',
      ctaStyle: 'action',
      exampleHeadlines: [
        'Your Smile, Our Priority',
        'Gentle Care for the Whole Family',
        'Modern Dentistry with a Personal Touch',
        'Creating Beautiful Smiles Every Day',
      ],
      exampleCTAs: [
        'Book Your Visit',
        'Schedule Appointment',
        'Get Your Free Consultation',
        'Request Appointment',
      ],
      preferredWords: ['gentle', 'comfortable', 'family', 'modern', 'caring', 'expert'],
      avoidWords: ['painful', 'drill', 'expensive'],
    },

    media: {
      imageStyle: 'professional',
      framing: 'people-focused',
      colorTreatment: 'bright',
      preferredSubjects: ['smiling patients', 'dental team', 'modern clinic', 'dental equipment'],
      unsplashKeywords: ['dentist', 'dental clinic', 'smile', 'teeth', 'dental care'],
    },

    defaultServices: [
      {
        title: 'General Dentistry',
        description: 'Comprehensive care including cleanings, fillings, and preventive treatments.',
        icon: 'Stethoscope',
        features: ['Exams & cleanings', 'Fillings', 'Preventive care'],
      },
      {
        title: 'Cosmetic Dentistry',
        description: 'Transform your smile with whitening, veneers, and aesthetic treatments.',
        icon: 'Sparkles',
        features: ['Teeth whitening', 'Veneers', 'Bonding'],
      },
      {
        title: 'Orthodontics',
        description: 'Straighten your teeth with braces or clear aligners.',
        icon: 'AlignCenter',
        features: ['Braces', 'Invisalign', 'Retainers'],
      },
      {
        title: 'Emergency Care',
        description: 'Same-day appointments for urgent dental issues.',
        icon: 'AlertCircle',
        features: ['Toothaches', 'Broken teeth', 'Lost fillings'],
      },
      {
        title: 'Pediatric Dentistry',
        description: 'Gentle, kid-friendly dental care for your little ones.',
        icon: 'Baby',
        features: ['Child exams', 'Sealants', 'Fluoride treatments'],
      },
      {
        title: 'Implants & Restoration',
        description: 'Replace missing teeth with natural-looking implants and crowns.',
        icon: 'CircleDot',
        features: ['Dental implants', 'Crowns', 'Bridges'],
      },
    ],

    defaultNavItems: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' },
      { label: 'About Us', href: '/about' },
      { label: 'Our Team', href: '/team' },
      { label: 'Contact', href: '/contact' },
    ],

    defaultCTAText: 'Book Appointment',
    defaultTagline: 'Creating beautiful, healthy smiles for the whole family',
  },

  // ---------------------------------------------------------------------------
  // BEAUTY SPA: Luxurious
  // ---------------------------------------------------------------------------
  'beauty-spa.luxurious': {
    id: 'beauty-spa.luxurious',
    businessType: 'beauty-spa',
    vibe: 'elegant',
    name: 'Luxurious Spa & Wellness',
    description: 'Serene, sophisticated design for spas and wellness centers',

    tokens: {
      colors: {
        primary: '#be185d',      // Deep pink
        primaryLight: '#db2777',
        primaryDark: '#9d174d',
        primaryContrast: '#ffffff',
        secondary: '#14b8a6',    // Teal
        secondaryLight: '#2dd4bf',
        secondaryDark: '#0d9488',
        secondaryContrast: '#ffffff',
        accent: '#d4af37',       // Gold
        accentContrast: '#000000',
        background: '#fdf4ff',   // Light pink
        surface: '#ffffff',
        surfaceAlt: '#fce7f3',
        text: '#1f2937',
        textMuted: '#6b7280',
        textHeading: '#111827',
        border: '#f9a8d4',
        borderLight: '#fce7f3',
      },
      typography: {
        headingFont: 'Cinzel',
        bodyFont: 'Montserrat',
        headingWeight: '500',
        bodyWeight: '400',
      },
      spacing: {
        scale: 'airy',
        sectionPadding: 'py-24',
        cardPadding: 'p-8',
        containerWidth: 'narrow',
      },
      borders: {
        radius: 'lg',
        style: 'subtle',
      },
      shadows: {
        card: 'sm',
        hover: 'glow',
      },
    },

    layout: {
      sections: [
        { type: 'HEADER', required: true, order: -1 },
        { type: 'HERO', required: true, order: 0, defaultLayout: 'fullscreen' },
        { type: 'SERVICES', required: true, order: 1 },
        { type: 'GALLERY', required: true, order: 2 },
        { type: 'PRICING', required: false, order: 3 },
        { type: 'ABOUT', required: true, order: 4 },
        { type: 'TESTIMONIALS', required: true, order: 5 },
        { type: 'CTA', required: true, order: 6, notes: 'Book treatment' },
        { type: 'CONTACT', required: true, order: 7 },
        { type: 'FOOTER', required: true, order: 1000 },
      ],
      header: {
        style: 'transparent',
        sticky: true,
        logoPosition: 'center',
        navStyle: 'inline',
        ctaStyle: 'button',
      },
      hero: {
        style: 'fullscreen',
        imagePosition: 'background',
        ctaStyle: 'single',
        overlayOpacity: 0.3,
      },
      footer: {
        style: 'centered',
        showSocial: true,
        showNewsletter: true,
      },
    },

    copyTone: {
      overall: 'luxurious',
      headlineStyle: 'emotional',
      descriptionLength: 'medium',
      ctaStyle: 'invitation',
      exampleHeadlines: [
        'Discover Your Sanctuary',
        'Where Luxury Meets Wellness',
        'Indulge in Pure Relaxation',
        'Elevate Your Self-Care Ritual',
      ],
      exampleCTAs: [
        'Book Your Escape',
        'Reserve Your Treatment',
        'Begin Your Journey',
        'Schedule Your Visit',
      ],
      preferredWords: ['luxurious', 'serene', 'rejuvenating', 'indulgent', 'sanctuary', 'escape'],
      avoidWords: ['cheap', 'basic', 'simple', 'discount'],
    },

    media: {
      imageStyle: 'artistic',
      framing: 'environmental',
      colorTreatment: 'muted',
      preferredSubjects: ['spa treatments', 'peaceful interiors', 'products', 'relaxation'],
      unsplashKeywords: ['spa', 'wellness', 'massage', 'relaxation', 'beauty treatment', 'zen'],
    },

    defaultServices: [
      {
        title: 'Signature Massage',
        description: 'Customized massage therapy combining multiple techniques for ultimate relaxation.',
        icon: 'Hand',
        features: ['Swedish', 'Deep tissue', 'Hot stone'],
      },
      {
        title: 'Facial Treatments',
        description: 'Rejuvenating facial therapies tailored to your skin type.',
        icon: 'Sparkles',
        features: ['Anti-aging', 'Hydrating', 'Purifying'],
      },
      {
        title: 'Body Treatments',
        description: 'Luxurious body wraps and scrubs for silky smooth skin.',
        icon: 'Droplet',
        features: ['Body wraps', 'Exfoliation', 'Hydration'],
      },
      {
        title: 'Nail Services',
        description: 'Elegant manicures and pedicures with premium products.',
        icon: 'Gem',
        features: ['Manicure', 'Pedicure', 'Nail art'],
      },
      {
        title: 'Wellness Packages',
        description: 'Curated experiences combining multiple treatments.',
        icon: 'Gift',
        features: ['Half-day retreat', 'Full-day escape', 'Couples package'],
      },
      {
        title: 'Membership',
        description: 'Exclusive benefits and priority booking for members.',
        icon: 'Crown',
        features: ['Monthly treatments', 'Member discounts', 'Priority booking'],
      },
    ],

    defaultNavItems: [
      { label: 'Home', href: '/' },
      { label: 'Treatments', href: '/treatments' },
      { label: 'Packages', href: '/packages' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'About', href: '/about' },
      { label: 'Book Now', href: '/book' },
    ],

    defaultCTAText: 'Book Your Escape',
    defaultTagline: 'Your sanctuary for relaxation and renewal',
  },

  // ---------------------------------------------------------------------------
  // REAL ESTATE: Luxury
  // ---------------------------------------------------------------------------
  'real-estate.luxury': {
    id: 'real-estate.luxury',
    businessType: 'real-estate',
    vibe: 'luxurious',
    name: 'Luxury Real Estate',
    description: 'Sophisticated design for premium real estate agencies',

    tokens: {
      colors: {
        primary: '#1e3a5f',      // Navy
        primaryLight: '#2563eb',
        primaryDark: '#0f172a',
        primaryContrast: '#ffffff',
        secondary: '#1f2937',    // Charcoal
        secondaryLight: '#374151',
        secondaryDark: '#111827',
        secondaryContrast: '#ffffff',
        accent: '#d4af37',       // Gold
        accentContrast: '#000000',
        background: '#f8fafc',
        surface: '#ffffff',
        surfaceAlt: '#f1f5f9',
        text: '#1f2937',
        textMuted: '#6b7280',
        textHeading: '#0f172a',
        border: '#e5e7eb',
        borderLight: '#f3f4f6',
      },
      typography: {
        headingFont: 'Playfair Display',
        bodyFont: 'Inter',
        headingWeight: '600',
        bodyWeight: '400',
      },
      spacing: {
        scale: 'spacious',
        sectionPadding: 'py-24',
        cardPadding: 'p-8',
        containerWidth: 'wide',
      },
      borders: {
        radius: 'sm',
        style: 'subtle',
      },
      shadows: {
        card: 'lg',
        hover: 'lift',
      },
    },

    layout: {
      sections: [
        { type: 'HEADER', required: true, order: -1 },
        { type: 'HERO', required: true, order: 0, defaultLayout: 'fullscreen' },
        { type: 'SERVICES', required: true, order: 1 },
        { type: 'PORTFOLIO', required: true, order: 2, notes: 'Featured properties' },
        { type: 'ABOUT', required: true, order: 3 },
        { type: 'TEAM', required: false, order: 4 },
        { type: 'TESTIMONIALS', required: true, order: 5 },
        { type: 'CTA', required: true, order: 6 },
        { type: 'CONTACT', required: true, order: 7 },
        { type: 'FOOTER', required: true, order: 1000 },
      ],
      header: {
        style: 'transparent',
        sticky: true,
        logoPosition: 'left',
        navStyle: 'inline',
        ctaStyle: 'button',
      },
      hero: {
        style: 'fullscreen',
        imagePosition: 'background',
        ctaStyle: 'dual',
        overlayOpacity: 0.4,
      },
      footer: {
        style: 'multi-column',
        showSocial: true,
        showNewsletter: true,
      },
    },

    copyTone: {
      overall: 'luxurious',
      headlineStyle: 'emotional',
      descriptionLength: 'medium',
      ctaStyle: 'invitation',
      exampleHeadlines: [
        'Find Your Dream Home',
        'Luxury Living, Exceptional Service',
        'Where Dreams Meet Address',
        'Experience Extraordinary Living',
      ],
      exampleCTAs: [
        'View Properties',
        'Schedule a Showing',
        'Find Your Home',
        'Get in Touch',
      ],
      preferredWords: ['luxury', 'exclusive', 'prestigious', 'premier', 'exceptional', 'bespoke'],
      avoidWords: ['cheap', 'affordable', 'budget', 'fixer-upper'],
    },

    media: {
      imageStyle: 'professional',
      framing: 'wide',
      colorTreatment: 'natural',
      preferredSubjects: ['luxury homes', 'interiors', 'architecture', 'neighborhoods'],
      unsplashKeywords: ['luxury home', 'real estate', 'modern architecture', 'interior design', 'mansion'],
    },

    defaultServices: [
      {
        title: 'Buying',
        description: 'Find your perfect home with our expert guidance and market knowledge.',
        icon: 'Home',
      },
      {
        title: 'Selling',
        description: 'Maximize your property\'s value with our proven marketing strategies.',
        icon: 'DollarSign',
      },
      {
        title: 'Luxury Listings',
        description: 'Access exclusive luxury properties not available elsewhere.',
        icon: 'Crown',
      },
      {
        title: 'Market Analysis',
        description: 'Data-driven insights to inform your real estate decisions.',
        icon: 'TrendingUp',
      },
      {
        title: 'Relocation Services',
        description: 'Seamless transition support for relocating families.',
        icon: 'Truck',
      },
      {
        title: 'Property Management',
        description: 'Professional management for your investment properties.',
        icon: 'Settings',
      },
    ],

    defaultNavItems: [
      { label: 'Home', href: '/' },
      { label: 'Properties', href: '/properties' },
      { label: 'Services', href: '/services' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],

    defaultCTAText: 'View Properties',
    defaultTagline: 'Your trusted partner in luxury real estate',
  },

  // ---------------------------------------------------------------------------
  // FITNESS: Energetic
  // ---------------------------------------------------------------------------
  'fitness.energetic': {
    id: 'fitness.energetic',
    businessType: 'fitness',
    vibe: 'energetic',
    name: 'Energetic Fitness',
    description: 'Bold, motivating design for gyms and fitness centers',

    tokens: {
      colors: {
        primary: '#dc2626',      // Red
        primaryLight: '#ef4444',
        primaryDark: '#b91c1c',
        primaryContrast: '#ffffff',
        secondary: '#1f2937',    // Dark gray
        secondaryLight: '#374151',
        secondaryDark: '#111827',
        secondaryContrast: '#ffffff',
        accent: '#f59e0b',       // Orange
        accentContrast: '#000000',
        background: '#111827',   // Dark
        surface: '#1f2937',
        surfaceAlt: '#374151',
        text: '#f9fafb',
        textMuted: '#9ca3af',
        textHeading: '#ffffff',
        border: '#374151',
        borderLight: '#4b5563',
      },
      typography: {
        headingFont: 'Oswald',
        bodyFont: 'Roboto',
        headingWeight: '700',
        bodyWeight: '400',
      },
      spacing: {
        scale: 'normal',
        sectionPadding: 'py-16',
        cardPadding: 'p-6',
        containerWidth: 'wide',
      },
      borders: {
        radius: 'md',
        style: 'solid',
      },
      shadows: {
        card: 'lg',
        hover: 'glow',
      },
    },

    layout: {
      sections: [
        { type: 'HEADER', required: true, order: -1 },
        { type: 'HERO', required: true, order: 0, defaultLayout: 'fullscreen' },
        { type: 'SERVICES', required: true, order: 1, notes: 'Class types' },
        { type: 'FEATURES', required: true, order: 2, notes: 'Gym amenities' },
        { type: 'PRICING', required: true, order: 3 },
        { type: 'TEAM', required: false, order: 4, notes: 'Trainers' },
        { type: 'TESTIMONIALS', required: true, order: 5 },
        { type: 'CTA', required: true, order: 6, notes: 'Free trial' },
        { type: 'CONTACT', required: true, order: 7 },
        { type: 'FOOTER', required: true, order: 1000 },
      ],
      header: {
        style: 'solid',
        sticky: true,
        logoPosition: 'left',
        navStyle: 'inline',
        ctaStyle: 'button',
      },
      hero: {
        style: 'fullscreen',
        imagePosition: 'background',
        ctaStyle: 'single',
        overlayOpacity: 0.6,
      },
      footer: {
        style: 'simple',
        showSocial: true,
        showNewsletter: true,
      },
    },

    copyTone: {
      overall: 'energetic',
      headlineStyle: 'direct',
      descriptionLength: 'short',
      ctaStyle: 'urgency',
      exampleHeadlines: [
        'Transform Your Body. Transform Your Life.',
        'No Excuses. Just Results.',
        'Your Strongest Self Starts Here',
        'Push Limits. Break Barriers.',
      ],
      exampleCTAs: [
        'Start Free Trial',
        'Join Now',
        'Get Started Today',
        'Claim Your Spot',
      ],
      preferredWords: ['transform', 'results', 'strong', 'power', 'energy', 'achieve'],
      avoidWords: ['easy', 'lazy', 'minimal effort'],
    },

    media: {
      imageStyle: 'vibrant',
      framing: 'people-focused',
      colorTreatment: 'high-contrast',
      preferredSubjects: ['workouts', 'gym equipment', 'athletes', 'group classes'],
      unsplashKeywords: ['gym', 'fitness', 'workout', 'training', 'exercise', 'athlete'],
    },

    defaultServices: [
      {
        title: 'Personal Training',
        description: 'One-on-one coaching tailored to your fitness goals.',
        icon: 'User',
      },
      {
        title: 'Group Classes',
        description: 'High-energy classes including HIIT, spinning, and yoga.',
        icon: 'Users',
      },
      {
        title: 'Strength Training',
        description: 'Full weight room with premium equipment.',
        icon: 'Dumbbell',
      },
      {
        title: 'Cardio Zone',
        description: 'State-of-the-art cardio equipment.',
        icon: 'Heart',
      },
      {
        title: 'Nutrition Coaching',
        description: 'Expert guidance on diet and supplements.',
        icon: 'Apple',
      },
      {
        title: '24/7 Access',
        description: 'Train whenever fits your schedule.',
        icon: 'Clock',
      },
    ],

    defaultNavItems: [
      { label: 'Home', href: '/' },
      { label: 'Classes', href: '/classes' },
      { label: 'Membership', href: '/membership' },
      { label: 'Trainers', href: '/trainers' },
      { label: 'Contact', href: '/contact' },
    ],

    defaultCTAText: 'Start Free Trial',
    defaultTagline: 'Transform your body. Transform your life.',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get archetype pack by business type
 * Falls back to a similar archetype or creates a default one
 */
export function getArchetypeForBusiness(businessType: string, vibe?: ColorMood): ArchetypePack | undefined {
  // Direct match with vibe
  if (vibe) {
    const key = `${businessType}.${vibe}`;
    if (BUSINESS_ARCHETYPES[key]) {
      return BUSINESS_ARCHETYPES[key];
    }
  }

  // Direct match by business type
  if (BUSINESS_ARCHETYPES[businessType]) {
    return BUSINESS_ARCHETYPES[businessType];
  }

  // Try to find any archetype for this business type
  const matchingKey = Object.keys(BUSINESS_ARCHETYPES).find(key =>
    key.startsWith(businessType + '.') || key === businessType
  );

  if (matchingKey) {
    return BUSINESS_ARCHETYPES[matchingKey];
  }

  return undefined;
}

/**
 * Get archetype by detecting business type from description
 */
export function detectArchetypeFromDescription(description: string): ArchetypePack | undefined {
  const lowerDesc = description.toLowerCase();

  // Map keywords to archetype keys
  const keywordMappings: { keywords: string[]; archetypeKey: string }[] = [
    { keywords: ['physio', 'physical therapy', 'physiotherapy', 'rehabilitation', 'rehab'], archetypeKey: 'physiotherapy' },
    { keywords: ['bakery', 'bread', 'pastry', 'artisan baking'], archetypeKey: 'bakery.warm_artisanal' },
    { keywords: ['restaurant', 'dining', 'fine dining', 'cuisine'], archetypeKey: 'restaurant.elegant' },
    { keywords: ['law firm', 'attorney', 'lawyer', 'legal'], archetypeKey: 'law-firm.professional' },
    { keywords: ['saas', 'software', 'tech startup', 'platform', 'app'], archetypeKey: 'tech-saas.modern' },
    { keywords: ['dental', 'dentist', 'orthodont'], archetypeKey: 'dental.professional' },
    { keywords: ['spa', 'wellness', 'massage', 'beauty'], archetypeKey: 'beauty-spa.luxurious' },
    { keywords: ['real estate', 'property', 'homes for sale', 'realtor'], archetypeKey: 'real-estate.luxury' },
    { keywords: ['gym', 'fitness', 'workout', 'training'], archetypeKey: 'fitness.energetic' },
  ];

  for (const mapping of keywordMappings) {
    for (const keyword of mapping.keywords) {
      if (lowerDesc.includes(keyword)) {
        return BUSINESS_ARCHETYPES[mapping.archetypeKey];
      }
    }
  }

  return undefined;
}

/**
 * Generate CSS variables from design tokens
 */
export function tokensToCssVariables(tokens: DesignTokens): Record<string, string> {
  return {
    '--color-primary': tokens.colors.primary,
    '--color-primary-light': tokens.colors.primaryLight,
    '--color-primary-dark': tokens.colors.primaryDark,
    '--color-primary-contrast': tokens.colors.primaryContrast,
    '--color-secondary': tokens.colors.secondary,
    '--color-secondary-light': tokens.colors.secondaryLight,
    '--color-secondary-dark': tokens.colors.secondaryDark,
    '--color-accent': tokens.colors.accent,
    '--color-accent-contrast': tokens.colors.accentContrast,
    '--color-background': tokens.colors.background,
    '--color-surface': tokens.colors.surface,
    '--color-surface-alt': tokens.colors.surfaceAlt,
    '--color-text': tokens.colors.text,
    '--color-text-muted': tokens.colors.textMuted,
    '--color-text-heading': tokens.colors.textHeading,
    '--color-border': tokens.colors.border,
    '--color-border-light': tokens.colors.borderLight,
    '--font-heading': tokens.typography.headingFont,
    '--font-body': tokens.typography.bodyFont,
    '--font-weight-heading': tokens.typography.headingWeight,
    '--font-weight-body': tokens.typography.bodyWeight,
  };
}

/**
 * Get all available archetype keys
 */
export function getAvailableArchetypes(): string[] {
  return Object.keys(BUSINESS_ARCHETYPES);
}
