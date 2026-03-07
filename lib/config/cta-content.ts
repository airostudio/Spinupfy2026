/**
 * Business-Type-Specific CTA Content Configuration
 * Maps business types to appropriate call-to-action text and icons
 */

export interface CtaContent {
  title: string
  subtitle: string
  primaryCta: {
    text: string
    href: string
    icon: 'calendar' | 'phone' | 'message' | 'arrow' | 'shop'
  }
  secondaryCta?: {
    text: string
    href: string
  }
}

export const BUSINESS_CTA_CONTENT: Record<string, CtaContent> = {
  // Food & Beverage
  'restaurant': {
    title: 'Hungry?',
    subtitle: 'Reserve your table for a memorable dining experience',
    primaryCta: {
      text: 'Book a Table',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'View Menu',
      href: '#menu',
    },
  },
  'bakery': {
    title: 'Craving Something Fresh?',
    subtitle: 'Order our artisan breads and pastries',
    primaryCta: {
      text: 'Order Now',
      href: '/contact',
      icon: 'shop',
    },
    secondaryCta: {
      text: 'See Our Menu',
      href: '#menu',
    },
  },
  'coffee-shop': {
    title: 'Need Your Coffee Fix?',
    subtitle: 'Drop by or order ahead for pickup',
    primaryCta: {
      text: 'Order Ahead',
      href: '/contact',
      icon: 'shop',
    },
    secondaryCta: {
      text: 'View Menu',
      href: '#menu',
    },
  },
  'food-delivery': {
    title: 'Hungry Now?',
    subtitle: 'Get your favorite meals delivered fast',
    primaryCta: {
      text: 'Order Now',
      href: '/order',
      icon: 'shop',
    },
    secondaryCta: {
      text: 'Browse Menu',
      href: '#menu',
    },
  },

  // Professional Services
  'law-firm': {
    title: 'Need Legal Guidance?',
    subtitle: 'Schedule a confidential consultation with our attorneys',
    primaryCta: {
      text: 'Free Consultation',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'Call Now',
      href: 'tel:',
    },
  },
  'accounting': {
    title: 'Tax Season Approaching?',
    subtitle: 'Get expert financial guidance for your business',
    primaryCta: {
      text: 'Schedule a Review',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'Our Services',
      href: '#services',
    },
  },
  'consulting': {
    title: 'Ready to Scale?',
    subtitle: 'Get strategic insights to grow your business',
    primaryCta: {
      text: 'Book a Strategy Call',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'Our Approach',
      href: '#services',
    },
  },
  'financial': {
    title: 'Plan Your Financial Future',
    subtitle: 'Expert wealth management and investment advice',
    primaryCta: {
      text: 'Free Consultation',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'Our Services',
      href: '#services',
    },
  },
  'insurance': {
    title: 'Protect What Matters',
    subtitle: 'Get a personalized insurance quote today',
    primaryCta: {
      text: 'Get a Quote',
      href: '/contact',
      icon: 'message',
    },
    secondaryCta: {
      text: 'Coverage Options',
      href: '#services',
    },
  },

  // Healthcare & Wellness
  'medical': {
    title: 'Your Health Matters',
    subtitle: 'Schedule an appointment with our care team',
    primaryCta: {
      text: 'Book Appointment',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'Call Us',
      href: 'tel:',
    },
  },
  'dental': {
    title: 'Time for a Checkup?',
    subtitle: 'Keep your smile healthy and bright',
    primaryCta: {
      text: 'Book Your Visit',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'Our Services',
      href: '#services',
    },
  },
  'pharmacy': {
    title: 'Need Your Prescription?',
    subtitle: 'Fast and reliable pharmacy services',
    primaryCta: {
      text: 'Transfer Prescription',
      href: '/contact',
      icon: 'message',
    },
    secondaryCta: {
      text: 'Contact Us',
      href: 'tel:',
    },
  },
  'fitness': {
    title: 'Ready to Transform?',
    subtitle: 'Start your fitness journey today',
    primaryCta: {
      text: 'Start Free Trial',
      href: '/contact',
      icon: 'arrow',
    },
    secondaryCta: {
      text: 'View Plans',
      href: '#pricing',
    },
  },
  'yoga-studio': {
    title: 'Find Your Balance',
    subtitle: 'Join our community and begin your practice',
    primaryCta: {
      text: 'Book a Class',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'Class Schedule',
      href: '#schedule',
    },
  },

  // Beauty & Personal Care
  'beauty-spa': {
    title: 'Time to Relax?',
    subtitle: 'Treat yourself to a rejuvenating experience',
    primaryCta: {
      text: 'Book Your Treatment',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'View Services',
      href: '#services',
    },
  },
  'hair-salon': {
    title: 'Ready for a New Look?',
    subtitle: 'Book your appointment with our stylists',
    primaryCta: {
      text: 'Book Now',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'Our Services',
      href: '#services',
    },
  },

  // Real Estate & Construction
  'real-estate': {
    title: 'Find Your Dream Home',
    subtitle: 'Let us help you discover the perfect property',
    primaryCta: {
      text: 'Schedule a Viewing',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'View Listings',
      href: '#listings',
    },
  },
  'construction': {
    title: 'Ready to Build?',
    subtitle: 'Get a free estimate for your project',
    primaryCta: {
      text: 'Get Free Estimate',
      href: '/contact',
      icon: 'message',
    },
    secondaryCta: {
      text: 'Our Projects',
      href: '#portfolio',
    },
  },
  'electrician': {
    title: 'Electrical Issues?',
    subtitle: 'Fast, reliable electrical services you can trust',
    primaryCta: {
      text: 'Get a Quote',
      href: '/contact',
      icon: 'phone',
    },
    secondaryCta: {
      text: 'Our Services',
      href: '#services',
    },
  },
  'plumber': {
    title: 'Plumbing Emergency?',
    subtitle: 'We\'re here to help 24/7',
    primaryCta: {
      text: 'Call Now',
      href: 'tel:',
      icon: 'phone',
    },
    secondaryCta: {
      text: 'Our Services',
      href: '#services',
    },
  },
  'hvac': {
    title: 'Stay Comfortable',
    subtitle: 'Heating and cooling solutions for your home',
    primaryCta: {
      text: 'Schedule Service',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'Our Services',
      href: '#services',
    },
  },
  'roofer': {
    title: 'Roof Concerns?',
    subtitle: 'Free inspections and honest estimates',
    primaryCta: {
      text: 'Free Inspection',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'Our Work',
      href: '#portfolio',
    },
  },
  'interior-design': {
    title: 'Transform Your Space',
    subtitle: 'Let\'s bring your vision to life',
    primaryCta: {
      text: 'Book Consultation',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'Our Portfolio',
      href: '#portfolio',
    },
  },
  'landscaping': {
    title: 'Elevate Your Outdoor Space',
    subtitle: 'Professional landscaping and maintenance',
    primaryCta: {
      text: 'Get Free Quote',
      href: '/contact',
      icon: 'message',
    },
    secondaryCta: {
      text: 'Our Work',
      href: '#gallery',
    },
  },

  // Technology & Digital
  'tech-saas': {
    title: 'Ready to Get Started?',
    subtitle: 'See how our platform can transform your workflow',
    primaryCta: {
      text: 'Start Free Trial',
      href: '/signup',
      icon: 'arrow',
    },
    secondaryCta: {
      text: 'Book a Demo',
      href: '/contact',
    },
  },
  'ecommerce': {
    title: 'Don\'t Miss Out!',
    subtitle: 'Shop our latest collection',
    primaryCta: {
      text: 'Shop Now',
      href: '/shop',
      icon: 'shop',
    },
    secondaryCta: {
      text: 'View Sale',
      href: '#sale',
    },
  },

  // Creative & Media
  'creative-agency': {
    title: 'Have a Project in Mind?',
    subtitle: 'Let\'s create something amazing together',
    primaryCta: {
      text: 'Start a Project',
      href: '/contact',
      icon: 'message',
    },
    secondaryCta: {
      text: 'Our Work',
      href: '#portfolio',
    },
  },
  'marketing-agency': {
    title: 'Ready to Grow?',
    subtitle: 'Let\'s amplify your brand\'s reach',
    primaryCta: {
      text: 'Get a Proposal',
      href: '/contact',
      icon: 'message',
    },
    secondaryCta: {
      text: 'Case Studies',
      href: '#portfolio',
    },
  },
  'photography': {
    title: 'Capture the Moment',
    subtitle: 'Book your photography session',
    primaryCta: {
      text: 'Book a Session',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'View Portfolio',
      href: '#portfolio',
    },
  },
  'music-entertainment': {
    title: 'Book Live Entertainment',
    subtitle: 'Make your event unforgettable',
    primaryCta: {
      text: 'Book Now',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'Watch Clips',
      href: '#portfolio',
    },
  },

  // Fashion & Retail
  'fashion': {
    title: 'Discover Your Style',
    subtitle: 'Shop the latest trends',
    primaryCta: {
      text: 'Shop Collection',
      href: '/shop',
      icon: 'shop',
    },
    secondaryCta: {
      text: 'New Arrivals',
      href: '#new',
    },
  },

  // Automotive
  'automotive': {
    title: 'Find Your Perfect Ride',
    subtitle: 'Browse our inventory or schedule a test drive',
    primaryCta: {
      text: 'Schedule Test Drive',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'View Inventory',
      href: '#inventory',
    },
  },

  // Hospitality & Travel
  'hospitality': {
    title: 'Plan Your Stay',
    subtitle: 'Experience comfort and luxury',
    primaryCta: {
      text: 'Book Now',
      href: '/booking',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'View Rooms',
      href: '#rooms',
    },
  },
  'travel-agency': {
    title: 'Dream Destination Awaits',
    subtitle: 'Let us plan your perfect getaway',
    primaryCta: {
      text: 'Plan My Trip',
      href: '/contact',
      icon: 'message',
    },
    secondaryCta: {
      text: 'Popular Destinations',
      href: '#destinations',
    },
  },

  // Events & Special Services
  'event-planning': {
    title: 'Planning an Event?',
    subtitle: 'Let us make it unforgettable',
    primaryCta: {
      text: 'Get a Quote',
      href: '/contact',
      icon: 'message',
    },
    secondaryCta: {
      text: 'Our Events',
      href: '#portfolio',
    },
  },
  'wedding-planning': {
    title: 'Your Dream Wedding Awaits',
    subtitle: 'Let us help you plan the perfect day',
    primaryCta: {
      text: 'Schedule Consultation',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'Our Weddings',
      href: '#portfolio',
    },
  },

  // Education & Non-profit
  'education': {
    title: 'Start Learning Today',
    subtitle: 'Enroll in our programs and unlock your potential',
    primaryCta: {
      text: 'Enroll Now',
      href: '/contact',
      icon: 'arrow',
    },
    secondaryCta: {
      text: 'View Courses',
      href: '#courses',
    },
  },
  'nonprofit': {
    title: 'Make a Difference',
    subtitle: 'Join us in creating positive change',
    primaryCta: {
      text: 'Donate Now',
      href: '/donate',
      icon: 'arrow',
    },
    secondaryCta: {
      text: 'Get Involved',
      href: '#volunteer',
    },
  },

  // Pet Services
  'pet-services': {
    title: 'Your Pet Deserves the Best',
    subtitle: 'Professional care for your furry friends',
    primaryCta: {
      text: 'Book Appointment',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'Our Services',
      href: '#services',
    },
  },

  // Personal & Portfolio
  'portfolio': {
    title: 'Like What You See?',
    subtitle: 'Let\'s discuss your project',
    primaryCta: {
      text: 'Get in Touch',
      href: '/contact',
      icon: 'message',
    },
    secondaryCta: {
      text: 'View Work',
      href: '#portfolio',
    },
  },
  'personal-blog': {
    title: 'Stay Updated',
    subtitle: 'Subscribe to get the latest posts',
    primaryCta: {
      text: 'Subscribe',
      href: '#newsletter',
      icon: 'arrow',
    },
    secondaryCta: {
      text: 'Latest Posts',
      href: '#blog',
    },
  },

  // Physiotherapy (from archetypes)
  'physiotherapy': {
    title: 'Move Better, Feel Better',
    subtitle: 'Expert physiotherapy for your recovery',
    primaryCta: {
      text: 'Book Assessment',
      href: '/contact',
      icon: 'calendar',
    },
    secondaryCta: {
      text: 'Our Treatments',
      href: '#services',
    },
  },
}

// Default CTA content for unknown business types
export const DEFAULT_CTA_CONTENT: CtaContent = {
  title: 'Ready to Get Started?',
  subtitle: 'Let\'s discuss how we can help you',
  primaryCta: {
    text: 'Contact Us',
    href: '/contact',
    icon: 'message',
  },
  secondaryCta: {
    text: 'Learn More',
    href: '#about',
  },
}

/**
 * Get CTA content for a specific business type
 * Falls back to default content if business type is not found
 */
export function getCtaContentForBusinessType(businessType?: string): CtaContent {
  if (!businessType) {
    return DEFAULT_CTA_CONTENT
  }

  // Normalize the business type (lowercase, handle common variations)
  const normalizedType = businessType.toLowerCase().trim()

  // Direct match
  if (BUSINESS_CTA_CONTENT[normalizedType]) {
    return BUSINESS_CTA_CONTENT[normalizedType]
  }

  // Try to find a partial match
  const partialMatch = Object.keys(BUSINESS_CTA_CONTENT).find(key =>
    normalizedType.includes(key) || key.includes(normalizedType)
  )

  if (partialMatch) {
    return BUSINESS_CTA_CONTENT[partialMatch]
  }

  return DEFAULT_CTA_CONTENT
}
