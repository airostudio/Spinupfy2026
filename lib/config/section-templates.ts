/**
 * Section Templates Library - Professional Design Patterns
 * Pre-built section templates with modern, conversion-optimized designs
 * Inspired by top design agencies: Pentagram, IDEO, MetaLab, Stripe
 */

export type SectionType =
  | 'hero'
  | 'about'
  | 'services'
  | 'features'
  | 'gallery'
  | 'testimonials'
  | 'team'
  | 'pricing'
  | 'faq'
  | 'contact'
  | 'cta'
  | 'stats'
  | 'process'
  | 'trust'
  | 'benefits';

export type LayoutPattern =
  | 'centered'
  | 'left'
  | 'right'
  | 'split'
  | 'split-reverse'
  | 'grid'
  | 'cards'
  | 'bento'
  | 'masonry'
  | 'fullscreen'
  | 'zigzag'
  | 'overlap'
  | 'stacked'
  | 'floating';

export type SpacingScale = 'compact' | 'balanced' | 'spacious' | 'luxurious';
export type VisualWeight = 'light' | 'medium' | 'bold' | 'dramatic';

export interface SectionTemplate {
  id: string;
  type: SectionType;
  name: string;
  description: string;
  thumbnail?: string;
  layout: LayoutPattern;
  defaultContent: Record<string, any>;
  compatibleBusinessTypes?: string[];
  premium?: boolean;
  // New design system properties
  spacing?: SpacingScale;
  visualWeight?: VisualWeight;
  animation?: 'none' | 'fade' | 'slide' | 'scale' | 'stagger';
  backgroundStyle?: 'solid' | 'gradient' | 'pattern' | 'image' | 'mesh';
  cardStyle?: 'flat' | 'elevated' | 'bordered' | 'glass' | 'neumorphic';
  typographyScale?: 'compact' | 'standard' | 'large' | 'display';
}

// Design tokens for professional layouts
export const LAYOUT_DESIGN_TOKENS = {
  spacing: {
    compact: { section: '3rem', element: '1rem', card: '1.25rem' },
    balanced: { section: '5rem', element: '1.5rem', card: '1.5rem' },
    spacious: { section: '7rem', element: '2rem', card: '2rem' },
    luxurious: { section: '10rem', element: '3rem', card: '2.5rem' }
  },
  borderRadius: {
    sharp: '0',
    subtle: '0.375rem',
    rounded: '0.75rem',
    pill: '9999px'
  },
  shadows: {
    none: 'none',
    subtle: '0 1px 3px rgba(0,0,0,0.08)',
    medium: '0 4px 12px rgba(0,0,0,0.1)',
    elevated: '0 8px 30px rgba(0,0,0,0.12)',
    dramatic: '0 20px 60px rgba(0,0,0,0.15)'
  },
  maxWidths: {
    narrow: '800px',
    standard: '1200px',
    wide: '1400px',
    full: '100%'
  }
};

/**
 * Hero Section Templates - Conversion-Optimized Designs
 */
export const HERO_TEMPLATES: SectionTemplate[] = [
  {
    id: 'hero-centered',
    type: 'hero',
    name: 'Centered Hero',
    description: 'Classic centered layout with headline, description, and CTAs - best for brand-focused messaging',
    layout: 'centered',
    spacing: 'spacious',
    visualWeight: 'bold',
    animation: 'fade',
    backgroundStyle: 'gradient',
    typographyScale: 'display',
    defaultContent: {
      headline: '{{heroTitle}}',
      subheadline: '{{heroSubtitle}}',
      description: '{{heroDescription}}',
      primaryCta: { text: 'Get Started', href: '#contact', style: 'solid' },
      secondaryCta: { text: 'Learn More', href: '#about', style: 'outline' },
      backgroundType: 'gradient',
      textAlign: 'center',
      maxWidth: '800px',
      badge: { show: true, text: '{{trustBadge}}' }
    },
  },
  {
    id: 'hero-split',
    type: 'hero',
    name: 'Split Hero',
    description: 'Content on left, image on right - best for product/service showcase',
    layout: 'split',
    spacing: 'balanced',
    visualWeight: 'medium',
    animation: 'slide',
    typographyScale: 'large',
    defaultContent: {
      headline: '{{heroTitle}}',
      subheadline: '{{heroSubtitle}}',
      description: '{{heroDescription}}',
      primaryCta: { text: 'Get Started', href: '#contact', style: 'solid' },
      secondaryCta: { text: 'Watch Demo', href: '#demo', style: 'ghost' },
      image: '{{heroImage}}',
      imagePosition: 'right',
      imageStyle: 'rounded',
      contentWidth: '45%',
      features: ['{{feature1}}', '{{feature2}}', '{{feature3}}']
    },
  },
  {
    id: 'hero-fullscreen',
    type: 'hero',
    name: 'Fullscreen Hero',
    description: 'Full-viewport hero with stunning background - best for immersive experiences',
    layout: 'fullscreen',
    spacing: 'luxurious',
    visualWeight: 'dramatic',
    animation: 'fade',
    backgroundStyle: 'image',
    typographyScale: 'display',
    premium: true,
    defaultContent: {
      headline: '{{heroTitle}}',
      subheadline: '{{heroSubtitle}}',
      primaryCta: { text: 'Get Started', href: '#contact', style: 'solid', size: 'large' },
      secondaryCta: { text: 'Explore', href: '#about', style: 'outline' },
      backgroundImage: '{{heroBackground}}',
      overlayOpacity: 0.5,
      overlayGradient: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
      scrollIndicator: true,
      height: '100vh'
    },
  },
  {
    id: 'hero-floating',
    type: 'hero',
    name: 'Floating Card Hero',
    description: 'Modern design with floating content card over gradient - tech/SaaS style',
    layout: 'floating',
    spacing: 'spacious',
    visualWeight: 'medium',
    animation: 'scale',
    backgroundStyle: 'mesh',
    cardStyle: 'glass',
    typographyScale: 'large',
    compatibleBusinessTypes: ['tech-saas', 'consulting', 'creative-agency'],
    defaultContent: {
      headline: '{{heroTitle}}',
      subheadline: '{{heroSubtitle}}',
      primaryCta: { text: 'Start Free Trial', href: '#signup' },
      secondaryCta: { text: 'View Pricing', href: '#pricing' },
      floatingCard: true,
      backgroundMesh: true,
      trustLogos: ['{{logo1}}', '{{logo2}}', '{{logo3}}', '{{logo4}}'],
      socialProof: '{{socialProofText}}'
    },
  },
  {
    id: 'hero-asymmetric',
    type: 'hero',
    name: 'Asymmetric Hero',
    description: 'Bold asymmetric design with overlapping elements - creative/bold brands',
    layout: 'overlap',
    spacing: 'balanced',
    visualWeight: 'bold',
    animation: 'stagger',
    backgroundStyle: 'solid',
    typographyScale: 'display',
    premium: true,
    compatibleBusinessTypes: ['creative-agency', 'photography', 'fashion'],
    defaultContent: {
      headline: '{{heroTitle}}',
      subheadline: '{{heroSubtitle}}',
      primaryCta: { text: 'See Our Work', href: '#portfolio' },
      image: '{{heroImage}}',
      imageOverlap: '-20%',
      accentShape: true,
      accentColor: '{{accentColor}}'
    },
  },
  {
    id: 'hero-video',
    type: 'hero',
    name: 'Video Background Hero',
    description: 'Full-width hero with looping video background - high engagement',
    layout: 'centered',
    spacing: 'luxurious',
    visualWeight: 'dramatic',
    animation: 'fade',
    backgroundStyle: 'image',
    typographyScale: 'display',
    premium: true,
    defaultContent: {
      headline: '{{heroTitle}}',
      subheadline: '{{heroSubtitle}}',
      primaryCta: { text: 'Get Started', href: '#contact' },
      backgroundType: 'video',
      videoUrl: '{{videoUrl}}',
      overlayOpacity: 0.6,
      autoplay: true,
      muted: true,
      loop: true
    },
  },
  {
    id: 'hero-minimal',
    type: 'hero',
    name: 'Minimal Hero',
    description: 'Ultra-clean minimal design with focus on typography - luxury/professional',
    layout: 'centered',
    spacing: 'luxurious',
    visualWeight: 'light',
    animation: 'fade',
    backgroundStyle: 'solid',
    typographyScale: 'display',
    compatibleBusinessTypes: ['law-firm', 'consulting', 'financial'],
    defaultContent: {
      headline: '{{heroTitle}}',
      subheadline: '{{heroSubtitle}}',
      primaryCta: { text: 'Schedule Consultation', href: '#contact', style: 'underline' },
      backgroundColor: '#FAFAFA',
      textColor: '#1A1A1A',
      maxWidth: '900px',
      letterSpacing: 'tight'
    },
  },
];

/**
 * About Section Templates - Storytelling Designs
 */
export const ABOUT_TEMPLATES: SectionTemplate[] = [
  {
    id: 'about-story',
    type: 'about',
    name: 'Our Story',
    description: 'Narrative-focused about section with emotional connection',
    layout: 'split',
    spacing: 'spacious',
    visualWeight: 'medium',
    animation: 'slide',
    defaultContent: {
      title: '{{aboutTitle}}',
      subtitle: '{{aboutSubtitle}}',
      content: '{{aboutContent}}',
      highlights: '{{aboutHighlights}}',
      image: '{{aboutImage}}',
      imagePosition: 'right',
      stats: [
        { value: '{{stat1Value}}', label: '{{stat1Label}}' },
        { value: '{{stat2Value}}', label: '{{stat2Label}}' },
        { value: '{{stat3Value}}', label: '{{stat3Label}}' }
      ],
      quote: '{{founderQuote}}',
      quoteAuthor: '{{founderName}}'
    },
  },
  {
    id: 'about-mission',
    type: 'about',
    name: 'Mission & Vision',
    description: 'Focused on company mission, vision and values',
    layout: 'stacked',
    spacing: 'balanced',
    visualWeight: 'medium',
    animation: 'fade',
    cardStyle: 'bordered',
    defaultContent: {
      title: 'What We Stand For',
      missionTitle: 'Our Mission',
      missionText: '{{missionStatement}}',
      missionIcon: '🎯',
      visionTitle: 'Our Vision',
      visionText: '{{visionStatement}}',
      visionIcon: '🌟',
      valuesTitle: 'Our Values',
      values: [
        { name: 'Quality', description: '{{valueDesc1}}', icon: '✨' },
        { name: 'Innovation', description: '{{valueDesc2}}', icon: '💡' },
        { name: 'Integrity', description: '{{valueDesc3}}', icon: '🤝' },
        { name: 'Excellence', description: '{{valueDesc4}}', icon: '🏆' }
      ],
    },
  },
  {
    id: 'about-overview',
    type: 'about',
    name: 'Company Overview',
    description: 'Quick overview with key business features and highlights',
    layout: 'grid',
    spacing: 'balanced',
    visualWeight: 'light',
    animation: 'stagger',
    cardStyle: 'elevated',
    defaultContent: {
      title: 'About {{businessName}}',
      overview: '{{aboutOverview}}',
      features: '{{aboutFeatures}}',
      image: '{{aboutImage}}',
      badges: ['{{badge1}}', '{{badge2}}', '{{badge3}}']
    },
  },
  {
    id: 'about-timeline',
    type: 'about',
    name: 'Company Timeline',
    description: 'Shows company history and milestones with visual timeline',
    layout: 'centered',
    spacing: 'spacious',
    visualWeight: 'medium',
    animation: 'stagger',
    premium: true,
    defaultContent: {
      title: 'Our Journey',
      subtitle: 'From humble beginnings to where we are today',
      milestones: [
        { year: '{{year1}}', title: '{{milestone1Title}}', description: '{{milestone1Desc}}', icon: '🚀' },
        { year: '{{year2}}', title: '{{milestone2Title}}', description: '{{milestone2Desc}}', icon: '📈' },
        { year: '{{year3}}', title: '{{milestone3Title}}', description: '{{milestone3Desc}}', icon: '🏆' },
        { year: '{{year4}}', title: '{{milestone4Title}}', description: '{{milestone4Desc}}', icon: '🌟' },
      ],
      timelineStyle: 'vertical',
      showConnectors: true
    },
  },
  {
    id: 'about-zigzag',
    type: 'about',
    name: 'Zigzag Story',
    description: 'Alternating content and images for visual interest',
    layout: 'zigzag',
    spacing: 'spacious',
    visualWeight: 'medium',
    animation: 'slide',
    premium: true,
    defaultContent: {
      sections: [
        { title: '{{section1Title}}', content: '{{section1Content}}', image: '{{section1Image}}' },
        { title: '{{section2Title}}', content: '{{section2Content}}', image: '{{section2Image}}' },
        { title: '{{section3Title}}', content: '{{section3Content}}', image: '{{section3Image}}' }
      ]
    },
  },
];

/**
 * Services Section Templates - Service Showcase Designs
 */
export const SERVICES_TEMPLATES: SectionTemplate[] = [
  {
    id: 'services-grid',
    type: 'services',
    name: 'Services Grid',
    description: 'Clean grid layout showing all services with consistent cards',
    layout: 'grid',
    spacing: 'balanced',
    visualWeight: 'medium',
    animation: 'stagger',
    cardStyle: 'elevated',
    defaultContent: {
      title: '{{servicesTitle}}',
      subtitle: '{{servicesSubtitle}}',
      intro: '{{servicesIntro}}',
      columns: 3,
      showIcons: true,
      iconStyle: 'gradient',
      cardHover: 'lift',
      showCta: true,
      ctaText: 'Learn More'
    },
  },
  {
    id: 'services-cards',
    type: 'services',
    name: 'Service Cards',
    description: 'Elegant card-based service showcase with hover effects',
    layout: 'cards',
    spacing: 'spacious',
    visualWeight: 'medium',
    animation: 'stagger',
    cardStyle: 'glass',
    defaultContent: {
      title: '{{servicesTitle}}',
      subtitle: '{{servicesSubtitle}}',
      cardStyle: 'elevated',
      showPricing: false,
      showImage: true,
      imagePosition: 'top',
      cardHeight: 'equal'
    },
  },
  {
    id: 'services-bento',
    type: 'services',
    name: 'Bento Grid Services',
    description: 'Modern bento-box layout with varying card sizes',
    layout: 'bento',
    spacing: 'balanced',
    visualWeight: 'bold',
    animation: 'scale',
    cardStyle: 'flat',
    premium: true,
    compatibleBusinessTypes: ['tech-saas', 'creative-agency', 'consulting'],
    defaultContent: {
      title: '{{servicesTitle}}',
      subtitle: '{{servicesSubtitle}}',
      primaryService: { featured: true, large: true },
      secondaryServices: { size: 'medium' },
      tertiaryServices: { size: 'small' }
    },
  },
  {
    id: 'services-detailed',
    type: 'services',
    name: 'Detailed Services',
    description: 'Comprehensive service descriptions with images',
    layout: 'stacked',
    spacing: 'spacious',
    visualWeight: 'medium',
    animation: 'slide',
    defaultContent: {
      title: '{{servicesTitle}}',
      showImages: true,
      showPricing: true,
      ctaText: 'Get Quote',
      layout: 'alternating',
      showFeatures: true,
      showBenefits: true
    },
  },
  {
    id: 'services-tabs',
    type: 'services',
    name: 'Tabbed Services',
    description: 'Interactive tabs for service categories',
    layout: 'centered',
    spacing: 'balanced',
    visualWeight: 'medium',
    animation: 'fade',
    premium: true,
    defaultContent: {
      title: '{{servicesTitle}}',
      subtitle: '{{servicesSubtitle}}',
      tabStyle: 'pills',
      showImages: true,
      transitionStyle: 'fade'
    },
  },
  {
    id: 'services-showcase',
    type: 'services',
    name: 'Service Showcase',
    description: 'Large featured service with supporting items',
    layout: 'split',
    spacing: 'spacious',
    visualWeight: 'bold',
    animation: 'slide',
    defaultContent: {
      title: '{{servicesTitle}}',
      featuredService: '{{featuredService}}',
      featuredImage: '{{featuredServiceImage}}',
      supportingServices: '{{otherServices}}',
      showTestimonial: true
    },
  },
];

/**
 * Features Section Templates - Value Proposition Designs
 */
export const FEATURES_TEMPLATES: SectionTemplate[] = [
  {
    id: 'features-icons',
    type: 'features',
    name: 'Icon Features',
    description: 'Features with beautiful icons in a balanced grid',
    layout: 'grid',
    spacing: 'balanced',
    visualWeight: 'light',
    animation: 'stagger',
    defaultContent: {
      title: 'Why Choose Us',
      subtitle: 'Features that set us apart',
      columns: 3,
      iconStyle: 'gradient',
      iconSize: 'large',
      showDescription: true,
      alignment: 'center'
    },
  },
  {
    id: 'features-bento',
    type: 'features',
    name: 'Bento Features',
    description: 'Modern bento grid with 1 large + 3 small features',
    layout: 'bento',
    spacing: 'balanced',
    visualWeight: 'bold',
    animation: 'scale',
    cardStyle: 'elevated',
    defaultContent: {
      title: 'What Makes Us Different',
      subtitle: 'Our core strengths',
      primaryFeature: { size: 'large', showImage: true },
      secondaryFeatures: { size: 'small', showIcon: true },
      gridGap: '1.5rem'
    },
  },
  {
    id: 'features-split',
    type: 'features',
    name: 'Split Feature',
    description: 'Large image with feature list beside it',
    layout: 'split',
    spacing: 'spacious',
    visualWeight: 'medium',
    animation: 'slide',
    defaultContent: {
      title: 'Everything You Need',
      image: '{{featureImage}}',
      imagePosition: 'left',
      features: '{{featureList}}',
      showCheckmarks: true
    },
  },
  {
    id: 'features-checklist',
    type: 'features',
    name: 'Feature Checklist',
    description: 'Clean checklist of features in columns',
    layout: 'grid',
    spacing: 'balanced',
    visualWeight: 'light',
    animation: 'stagger',
    defaultContent: {
      title: 'What We Offer',
      subtitle: 'Comprehensive solutions',
      checkStyle: 'checkmark',
      checkColor: 'primary',
      columns: 2,
      showCategories: false
    },
  },
  {
    id: 'features-comparison',
    type: 'features',
    name: 'Feature Comparison',
    description: 'Before/after or comparison style features',
    layout: 'split',
    spacing: 'spacious',
    visualWeight: 'medium',
    animation: 'slide',
    premium: true,
    defaultContent: {
      title: 'The Difference We Make',
      beforeTitle: 'Without Us',
      afterTitle: 'With Us',
      comparisons: '{{comparisonList}}'
    },
  },
  {
    id: 'features-numbered',
    type: 'features',
    name: 'Numbered Features',
    description: 'Features with prominent step numbers',
    layout: 'stacked',
    spacing: 'balanced',
    visualWeight: 'medium',
    animation: 'stagger',
    defaultContent: {
      title: 'How We Deliver Excellence',
      showNumbers: true,
      numberStyle: 'circle',
      numberColor: 'primary',
      layout: 'horizontal'
    },
  },
];

/**
 * Testimonials Section Templates - Social Proof Designs
 */
export const TESTIMONIALS_TEMPLATES: SectionTemplate[] = [
  {
    id: 'testimonials-carousel',
    type: 'testimonials',
    name: 'Testimonial Carousel',
    description: 'Elegant rotating testimonial carousel with photos',
    layout: 'centered',
    spacing: 'spacious',
    visualWeight: 'medium',
    animation: 'fade',
    defaultContent: {
      title: 'What Our Clients Say',
      subtitle: 'Real stories from real customers',
      autoPlay: true,
      autoPlaySpeed: 5000,
      showRating: true,
      showPhoto: true,
      photoStyle: 'circle',
      showQuoteIcon: true,
      navigationStyle: 'dots',
      cardStyle: 'elevated'
    },
  },
  {
    id: 'testimonials-grid',
    type: 'testimonials',
    name: 'Testimonial Grid',
    description: 'Masonry-style grid of testimonial cards',
    layout: 'masonry',
    spacing: 'balanced',
    visualWeight: 'light',
    animation: 'stagger',
    cardStyle: 'bordered',
    defaultContent: {
      title: 'Loved by Our Customers',
      subtitle: 'See what people are saying',
      columns: 3,
      showRating: true,
      showPhoto: true,
      showDate: false,
      cardVariation: 'varied-heights'
    },
  },
  {
    id: 'testimonials-featured',
    type: 'testimonials',
    name: 'Featured Testimonial',
    description: 'Large featured testimonial with supporting quotes',
    layout: 'split',
    spacing: 'spacious',
    visualWeight: 'bold',
    animation: 'slide',
    premium: true,
    defaultContent: {
      title: 'What Our Customers Say',
      featuredTestimonial: '{{featuredTestimonial}}',
      featuredPhoto: '{{featuredPhoto}}',
      supportingQuotes: '{{supportingTestimonials}}',
      showVideo: false,
      backgroundImage: '{{testimonialBg}}'
    },
  },
  {
    id: 'testimonials-minimal',
    type: 'testimonials',
    name: 'Minimal Testimonials',
    description: 'Clean, text-focused testimonials without photos',
    layout: 'stacked',
    spacing: 'spacious',
    visualWeight: 'light',
    animation: 'fade',
    compatibleBusinessTypes: ['law-firm', 'consulting', 'financial'],
    defaultContent: {
      title: 'Client Feedback',
      showRating: false,
      showPhoto: false,
      showQuoteIcon: true,
      quoteStyle: 'italic',
      authorStyle: 'formal'
    },
  },
  {
    id: 'testimonials-video',
    type: 'testimonials',
    name: 'Video Testimonials',
    description: 'Video testimonials with thumbnails',
    layout: 'grid',
    spacing: 'balanced',
    visualWeight: 'bold',
    animation: 'scale',
    premium: true,
    defaultContent: {
      title: 'Hear From Our Clients',
      subtitle: 'Real stories, real results',
      columns: 3,
      showPlayButton: true,
      showDuration: true,
      thumbnailStyle: 'rounded'
    },
  },
  {
    id: 'testimonials-social',
    type: 'testimonials',
    name: 'Social Media Testimonials',
    description: 'Twitter/social media style testimonial cards',
    layout: 'masonry',
    spacing: 'balanced',
    visualWeight: 'light',
    animation: 'stagger',
    cardStyle: 'bordered',
    defaultContent: {
      title: 'What People Are Saying',
      showSocialIcon: true,
      showHandle: true,
      showDate: true,
      cardStyle: 'social'
    },
  },
];

/**
 * Contact Section Templates - Lead Generation Designs
 */
export const CONTACT_TEMPLATES: SectionTemplate[] = [
  {
    id: 'contact-form',
    type: 'contact',
    name: 'Contact Form',
    description: 'Conversion-optimized contact form with business info',
    layout: 'split',
    spacing: 'spacious',
    visualWeight: 'medium',
    animation: 'slide',
    defaultContent: {
      title: '{{contactTitle}}',
      subtitle: '{{contactSubtitle}}',
      intro: '{{contactIntro}}',
      formFields: ['name', 'email', 'phone', 'message'],
      showMap: false,
      showBusinessInfo: true,
      businessInfo: {
        phone: '{{phone}}',
        email: '{{email}}',
        address: '{{address}}',
        hours: '{{hours}}'
      },
      submitButtonText: 'Send Message',
      submitButtonStyle: 'solid'
    },
  },
  {
    id: 'contact-map',
    type: 'contact',
    name: 'Contact with Map',
    description: 'Contact form with interactive embedded map',
    layout: 'split',
    spacing: 'balanced',
    visualWeight: 'medium',
    animation: 'fade',
    defaultContent: {
      title: '{{contactTitle}}',
      showMap: true,
      mapPosition: 'right',
      mapStyle: 'modern',
      showMarker: true,
      formFields: ['name', 'email', 'message']
    },
  },
  {
    id: 'contact-minimal',
    type: 'contact',
    name: 'Minimal Contact',
    description: 'Ultra-clean contact with essential info only',
    layout: 'centered',
    spacing: 'luxurious',
    visualWeight: 'light',
    animation: 'fade',
    compatibleBusinessTypes: ['law-firm', 'consulting', 'creative-agency'],
    defaultContent: {
      title: 'Get in Touch',
      subtitle: 'We\'d love to hear from you',
      showForm: true,
      formStyle: 'minimal',
      formFields: ['name', 'email', 'message'],
      showSocialLinks: true
    },
  },
  {
    id: 'contact-booking',
    type: 'contact',
    name: 'Contact with Booking',
    description: 'Contact form with appointment booking option',
    layout: 'split',
    spacing: 'balanced',
    visualWeight: 'medium',
    animation: 'slide',
    premium: true,
    compatibleBusinessTypes: ['medical', 'dental', 'beauty-spa', 'consulting'],
    defaultContent: {
      title: 'Book Your Appointment',
      showCalendar: true,
      calendarPosition: 'right',
      formFields: ['name', 'email', 'phone', 'preferredDate', 'message'],
      showServiceSelect: true
    },
  },
];

/**
 * CTA Section Templates - Conversion Designs
 */
export const CTA_TEMPLATES: SectionTemplate[] = [
  {
    id: 'cta-simple',
    type: 'cta',
    name: 'Simple CTA',
    description: 'Clean, high-converting call-to-action banner',
    layout: 'centered',
    spacing: 'spacious',
    visualWeight: 'bold',
    animation: 'fade',
    backgroundStyle: 'gradient',
    defaultContent: {
      headline: '{{ctaHeadline}}',
      subheadline: '{{ctaSubheadline}}',
      buttonText: '{{ctaButtonText}}',
      buttonHref: '#contact',
      buttonStyle: 'solid',
      buttonSize: 'large',
      background: 'gradient',
      urgencyBadge: null
    },
  },
  {
    id: 'cta-split',
    type: 'cta',
    name: 'Split CTA',
    description: 'CTA with image or illustration on one side',
    layout: 'split',
    spacing: 'balanced',
    visualWeight: 'bold',
    animation: 'slide',
    backgroundStyle: 'solid',
    defaultContent: {
      headline: '{{ctaHeadline}}',
      subheadline: '{{ctaSubheadline}}',
      buttonText: '{{ctaButtonText}}',
      buttonHref: '#contact',
      image: '{{ctaImage}}',
      imagePosition: 'right',
      features: ['{{ctaFeature1}}', '{{ctaFeature2}}', '{{ctaFeature3}}']
    },
  },
  {
    id: 'cta-newsletter',
    type: 'cta',
    name: 'Newsletter CTA',
    description: 'Email signup with value proposition',
    layout: 'centered',
    spacing: 'balanced',
    visualWeight: 'medium',
    animation: 'fade',
    backgroundStyle: 'gradient',
    defaultContent: {
      headline: 'Stay Updated',
      subheadline: 'Get the latest updates, tips, and exclusive offers',
      placeholder: 'Enter your email address',
      buttonText: 'Subscribe Now',
      privacyText: 'We respect your privacy. Unsubscribe at any time.',
      showIncentive: true,
      incentiveText: '{{newsletterIncentive}}'
    },
  },
  {
    id: 'cta-urgency',
    type: 'cta',
    name: 'Urgency CTA',
    description: 'CTA with urgency elements for limited offers',
    layout: 'centered',
    spacing: 'balanced',
    visualWeight: 'dramatic',
    animation: 'scale',
    backgroundStyle: 'gradient',
    premium: true,
    defaultContent: {
      headline: '{{urgentHeadline}}',
      subheadline: '{{urgentSubheadline}}',
      buttonText: '{{urgentButtonText}}',
      buttonHref: '#contact',
      showCountdown: true,
      countdownEnd: '{{countdownDate}}',
      badge: '{{urgencyBadge}}',
      socialProof: '{{recentSignups}}'
    },
  },
  {
    id: 'cta-floating',
    type: 'cta',
    name: 'Floating Card CTA',
    description: 'Modern floating card design over gradient background',
    layout: 'floating',
    spacing: 'spacious',
    visualWeight: 'bold',
    animation: 'scale',
    backgroundStyle: 'mesh',
    cardStyle: 'glass',
    compatibleBusinessTypes: ['tech-saas', 'creative-agency'],
    defaultContent: {
      headline: '{{ctaHeadline}}',
      subheadline: '{{ctaSubheadline}}',
      primaryButton: { text: '{{primaryCtaText}}', href: '#signup' },
      secondaryButton: { text: '{{secondaryCtaText}}', href: '#demo' },
      trustElements: ['{{trust1}}', '{{trust2}}', '{{trust3}}']
    },
  },
];

/**
 * Stats Section Templates - Social Proof Designs
 */
export const STATS_TEMPLATES: SectionTemplate[] = [
  {
    id: 'stats-counters',
    type: 'stats',
    name: 'Counter Stats',
    description: 'Animated number counters that build trust',
    layout: 'grid',
    spacing: 'balanced',
    visualWeight: 'bold',
    animation: 'stagger',
    defaultContent: {
      title: 'By the Numbers',
      subtitle: 'Our track record speaks for itself',
      stats: [
        { label: 'Years Experience', value: '{{yearsExperience}}', suffix: '+', icon: '📅' },
        { label: 'Happy Clients', value: '{{clientsServed}}', suffix: '+', icon: '😊' },
        { label: 'Projects Completed', value: '{{projectsCompleted}}', suffix: '+', icon: '✅' },
        { label: 'Satisfaction Rate', value: '{{satisfaction}}', suffix: '%', icon: '⭐' },
      ],
      animated: true,
      animationDuration: 2000,
      showIcons: true,
      columns: 4
    },
  },
  {
    id: 'stats-banner',
    type: 'stats',
    name: 'Stats Banner',
    description: 'Compact stats banner for inline placement',
    layout: 'centered',
    spacing: 'compact',
    visualWeight: 'medium',
    animation: 'fade',
    backgroundStyle: 'gradient',
    defaultContent: {
      stats: [
        { value: '{{stat1Value}}', label: '{{stat1Label}}' },
        { value: '{{stat2Value}}', label: '{{stat2Label}}' },
        { value: '{{stat3Value}}', label: '{{stat3Label}}' },
      ],
      animated: true,
      showDividers: true
    },
  },
  {
    id: 'stats-cards',
    type: 'stats',
    name: 'Stats Cards',
    description: 'Stats in individual elevated cards',
    layout: 'grid',
    spacing: 'balanced',
    visualWeight: 'medium',
    animation: 'stagger',
    cardStyle: 'elevated',
    defaultContent: {
      title: 'Our Impact',
      stats: '{{statsArray}}',
      showIcons: true,
      showDescriptions: true,
      columns: 4
    },
  },
];

/**
 * Process/How It Works Section Templates
 */
export const PROCESS_TEMPLATES: SectionTemplate[] = [
  {
    id: 'process-steps',
    type: 'process',
    name: 'Step by Step Process',
    description: 'Visual numbered steps showing how things work',
    layout: 'stacked',
    spacing: 'spacious',
    visualWeight: 'medium',
    animation: 'stagger',
    defaultContent: {
      title: 'How It Works',
      subtitle: 'Simple steps to get started',
      steps: [
        { number: 1, title: '{{step1Title}}', description: '{{step1Desc}}', icon: '{{step1Icon}}' },
        { number: 2, title: '{{step2Title}}', description: '{{step2Desc}}', icon: '{{step2Icon}}' },
        { number: 3, title: '{{step3Title}}', description: '{{step3Desc}}', icon: '{{step3Icon}}' },
        { number: 4, title: '{{step4Title}}', description: '{{step4Desc}}', icon: '{{step4Icon}}' },
      ],
      showConnectors: true,
      numberStyle: 'circle',
      layout: 'horizontal'
    },
  },
  {
    id: 'process-timeline',
    type: 'process',
    name: 'Timeline Process',
    description: 'Vertical timeline showing process flow',
    layout: 'centered',
    spacing: 'spacious',
    visualWeight: 'medium',
    animation: 'stagger',
    premium: true,
    defaultContent: {
      title: 'Our Process',
      subtitle: 'From start to finish',
      steps: '{{processSteps}}',
      showConnectors: true,
      timelinePosition: 'center',
      showIcons: true
    },
  },
];

/**
 * Trust/Logos Section Templates
 */
export const TRUST_TEMPLATES: SectionTemplate[] = [
  {
    id: 'trust-logos',
    type: 'trust',
    name: 'Trust Logos',
    description: 'Client/partner logos marquee',
    layout: 'centered',
    spacing: 'compact',
    visualWeight: 'light',
    animation: 'fade',
    defaultContent: {
      title: 'Trusted By',
      logos: '{{trustLogos}}',
      showMarquee: true,
      grayscale: true,
      hoverColor: true
    },
  },
  {
    id: 'trust-badges',
    type: 'trust',
    name: 'Trust Badges',
    description: 'Certification and award badges',
    layout: 'centered',
    spacing: 'balanced',
    visualWeight: 'medium',
    animation: 'stagger',
    defaultContent: {
      title: 'Certifications & Awards',
      badges: '{{trustBadges}}',
      showDescriptions: true
    },
  },
];

/**
 * Gallery Section Templates
 */
export const GALLERY_TEMPLATES: SectionTemplate[] = [
  {
    id: 'gallery-masonry',
    type: 'gallery',
    name: 'Masonry Gallery',
    description: 'Pinterest-style masonry image layout',
    layout: 'masonry',
    spacing: 'compact',
    visualWeight: 'bold',
    animation: 'stagger',
    defaultContent: {
      title: 'Our Work',
      subtitle: 'Browse our portfolio',
      columns: 3,
      gutter: '1rem',
      showLightbox: true,
      showCaptions: true
    },
  },
  {
    id: 'gallery-grid',
    type: 'gallery',
    name: 'Grid Gallery',
    description: 'Clean uniform grid of images',
    layout: 'grid',
    spacing: 'balanced',
    visualWeight: 'medium',
    animation: 'stagger',
    defaultContent: {
      title: 'Gallery',
      columns: 4,
      aspectRatio: 'square',
      showLightbox: true,
      hoverEffect: 'zoom'
    },
  },
];

/**
 * Team Section Templates
 */
export const TEAM_TEMPLATES: SectionTemplate[] = [
  {
    id: 'team-grid',
    type: 'team',
    name: 'Team Grid',
    description: 'Team members in a clean grid',
    layout: 'grid',
    spacing: 'balanced',
    visualWeight: 'medium',
    animation: 'stagger',
    cardStyle: 'elevated',
    defaultContent: {
      title: 'Meet Our Team',
      subtitle: 'The people behind our success',
      columns: 4,
      showBio: true,
      showSocial: true,
      photoStyle: 'circle'
    },
  },
  {
    id: 'team-cards',
    type: 'team',
    name: 'Team Cards',
    description: 'Team members in detailed cards',
    layout: 'cards',
    spacing: 'spacious',
    visualWeight: 'medium',
    animation: 'stagger',
    cardStyle: 'bordered',
    defaultContent: {
      title: 'Our Leadership',
      columns: 3,
      showBio: true,
      showSocial: true,
      showQuote: true,
      photoStyle: 'rounded'
    },
  },
];

/**
 * Pricing Section Templates
 */
export const PRICING_TEMPLATES: SectionTemplate[] = [
  {
    id: 'pricing-cards',
    type: 'pricing',
    name: 'Pricing Cards',
    description: 'Side-by-side pricing tier cards',
    layout: 'grid',
    spacing: 'spacious',
    visualWeight: 'bold',
    animation: 'stagger',
    cardStyle: 'bordered',
    defaultContent: {
      title: 'Simple, Transparent Pricing',
      subtitle: 'Choose the plan that works for you',
      columns: 3,
      highlightPopular: true,
      showFeatures: true,
      showCta: true,
      billingToggle: true
    },
  },
  {
    id: 'pricing-comparison',
    type: 'pricing',
    name: 'Pricing Comparison',
    description: 'Detailed feature comparison table',
    layout: 'centered',
    spacing: 'balanced',
    visualWeight: 'medium',
    animation: 'fade',
    premium: true,
    defaultContent: {
      title: 'Compare Plans',
      showTable: true,
      showFeatureCategories: true,
      highlightDifferences: true
    },
  },
];

/**
 * FAQ Section Templates
 */
export const FAQ_TEMPLATES: SectionTemplate[] = [
  {
    id: 'faq-accordion',
    type: 'faq',
    name: 'FAQ Accordion',
    description: 'Expandable accordion-style FAQ',
    layout: 'centered',
    spacing: 'balanced',
    visualWeight: 'light',
    animation: 'fade',
    defaultContent: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions',
      expandFirst: true,
      showIcons: true,
      iconStyle: 'plus'
    },
  },
  {
    id: 'faq-grid',
    type: 'faq',
    name: 'FAQ Grid',
    description: 'Questions in a two-column grid',
    layout: 'grid',
    spacing: 'balanced',
    visualWeight: 'light',
    animation: 'stagger',
    defaultContent: {
      title: 'Common Questions',
      columns: 2,
      showCategories: true,
      expandable: false
    },
  },
];

/**
 * Benefits Section Templates
 */
export const BENEFITS_TEMPLATES: SectionTemplate[] = [
  {
    id: 'benefits-icons',
    type: 'benefits',
    name: 'Benefits with Icons',
    description: 'Key benefits with prominent icons',
    layout: 'grid',
    spacing: 'balanced',
    visualWeight: 'medium',
    animation: 'stagger',
    defaultContent: {
      title: 'Why Work With Us',
      subtitle: 'Benefits that make a difference',
      columns: 3,
      iconStyle: 'gradient',
      showDescription: true
    },
  },
  {
    id: 'benefits-split',
    type: 'benefits',
    name: 'Benefits Split',
    description: 'Benefits listed beside an image',
    layout: 'split',
    spacing: 'spacious',
    visualWeight: 'medium',
    animation: 'slide',
    defaultContent: {
      title: 'The Advantage',
      image: '{{benefitsImage}}',
      imagePosition: 'right',
      benefits: '{{benefitsList}}',
      showCheckmarks: true
    },
  },
];

/**
 * All section templates grouped by type
 */
export const ALL_SECTION_TEMPLATES: Record<SectionType, SectionTemplate[]> = {
  hero: HERO_TEMPLATES,
  about: ABOUT_TEMPLATES,
  services: SERVICES_TEMPLATES,
  features: FEATURES_TEMPLATES,
  gallery: GALLERY_TEMPLATES,
  testimonials: TESTIMONIALS_TEMPLATES,
  team: TEAM_TEMPLATES,
  pricing: PRICING_TEMPLATES,
  faq: FAQ_TEMPLATES,
  contact: CONTACT_TEMPLATES,
  cta: CTA_TEMPLATES,
  stats: STATS_TEMPLATES,
  process: PROCESS_TEMPLATES,
  trust: TRUST_TEMPLATES,
  benefits: BENEFITS_TEMPLATES,
};

/**
 * Get templates for a section type
 */
export function getTemplatesForSection(sectionType: SectionType): SectionTemplate[] {
  return ALL_SECTION_TEMPLATES[sectionType] || [];
}

/**
 * Get a specific template by ID
 */
export function getTemplateById(templateId: string): SectionTemplate | undefined {
  for (const templates of Object.values(ALL_SECTION_TEMPLATES)) {
    const found = templates.find(t => t.id === templateId);
    if (found) return found;
  }
  return undefined;
}

/**
 * Get recommended templates for a business type with intelligent matching
 */
export function getRecommendedTemplates(businessType: string): SectionTemplate[] {
  const recommended: SectionTemplate[] = [];

  // Add compatible templates
  for (const templates of Object.values(ALL_SECTION_TEMPLATES)) {
    for (const template of templates) {
      if (!template.compatibleBusinessTypes ||
          template.compatibleBusinessTypes.includes(businessType)) {
        if (!template.premium) {
          recommended.push(template);
        }
      }
    }
  }

  return recommended;
}

/**
 * Get the best template for a section type and business type
 */
export function getBestTemplate(sectionType: SectionType, businessType: string): SectionTemplate | undefined {
  const templates = getTemplatesForSection(sectionType);

  // First, try to find a template specifically compatible with this business type
  const compatible = templates.find(t =>
    t.compatibleBusinessTypes?.includes(businessType) && !t.premium
  );
  if (compatible) return compatible;

  // Otherwise, return the first non-premium template
  return templates.find(t => !t.premium);
}

/**
 * Get premium templates for upselling
 */
export function getPremiumTemplates(): SectionTemplate[] {
  const premium: SectionTemplate[] = [];

  for (const templates of Object.values(ALL_SECTION_TEMPLATES)) {
    for (const template of templates) {
      if (template.premium) {
        premium.push(template);
      }
    }
  }

  return premium;
}

/**
 * Get templates by visual weight for design consistency
 */
export function getTemplatesByVisualWeight(weight: VisualWeight): SectionTemplate[] {
  const matching: SectionTemplate[] = [];

  for (const templates of Object.values(ALL_SECTION_TEMPLATES)) {
    for (const template of templates) {
      if (template.visualWeight === weight) {
        matching.push(template);
      }
    }
  }

  return matching;
}

/**
 * Get a curated set of templates that work well together
 * This ensures visual consistency across the page
 */
export function getCuratedTemplateSet(businessType: string): Record<SectionType, SectionTemplate> {
  // Define optimal combinations based on business type
  const professionalTypes = ['law-firm', 'consulting', 'financial', 'accounting', 'insurance'];
  const creativeTypes = ['creative-agency', 'photography', 'fashion'];
  const techTypes = ['tech-saas', 'startup'];
  const warmTypes = ['restaurant', 'bakery', 'coffee-shop', 'pet-services'];

  let preferredWeight: VisualWeight = 'medium';
  let preferredSpacing: SpacingScale = 'balanced';

  if (professionalTypes.includes(businessType)) {
    preferredWeight = 'light';
    preferredSpacing = 'luxurious';
  } else if (creativeTypes.includes(businessType)) {
    preferredWeight = 'bold';
    preferredSpacing = 'spacious';
  } else if (techTypes.includes(businessType)) {
    preferredWeight = 'medium';
    preferredSpacing = 'balanced';
  } else if (warmTypes.includes(businessType)) {
    preferredWeight = 'medium';
    preferredSpacing = 'spacious';
  }

  const result: Partial<Record<SectionType, SectionTemplate>> = {};

  for (const [type, templates] of Object.entries(ALL_SECTION_TEMPLATES)) {
    // Find template matching preferred weight, or fallback to first available
    const match = templates.find(t =>
      t.visualWeight === preferredWeight &&
      t.spacing === preferredSpacing &&
      !t.premium &&
      (!t.compatibleBusinessTypes || t.compatibleBusinessTypes.includes(businessType))
    ) || templates.find(t => !t.premium);

    if (match) {
      result[type as SectionType] = match;
    }
  }

  return result as Record<SectionType, SectionTemplate>;
}
