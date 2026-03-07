/**
 * Content Templates for Business Types
 * Industry-specific prompts and content structures
 */

import { getBusinessTypeById, BUSINESS_TYPES } from './business-types';

export interface ContentTemplate {
  id: string;
  businessType: string;
  heroPrompts: string[];
  aboutPrompts: string[];
  servicesPrompts: string[];
  uspSuggestions: string[];
  ctaVariants: {
    primary: string[];
    secondary: string[];
  };
  sectionOrder: string[];
  keywords: string[];
}

/**
 * Industry-specific content templates with optimized prompts
 */
export const CONTENT_TEMPLATES: Record<string, ContentTemplate> = {
  // Real Estate
  'real-estate': {
    id: 'real-estate',
    businessType: 'real-estate',
    heroPrompts: [
      'Find your dream property with expert guidance',
      'Discover exceptional homes and investment opportunities',
      'Your trusted partner in real estate excellence',
    ],
    aboutPrompts: [
      'Highlight years of market experience and successful transactions',
      'Emphasize personalized approach to each client',
      'Showcase deep local market knowledge and expertise',
    ],
    servicesPrompts: [
      'Property buying and selling assistance',
      'Investment property consultation',
      'Market analysis and property valuation',
      'Negotiation and closing support',
    ],
    uspSuggestions: [
      'Award-winning real estate team',
      'Extensive local market expertise',
      'Personalized property matching service',
      'Virtual tours and digital closings',
      'Dedicated client support throughout the process',
    ],
    ctaVariants: {
      primary: ['View Properties', 'Schedule a Viewing', 'Find Your Home', 'Start Your Search'],
      secondary: ['Get Market Report', 'Free Consultation', 'Contact Agent', 'Learn More'],
    },
    sectionOrder: ['hero', 'properties', 'about', 'services', 'testimonials', 'contact'],
    keywords: ['real estate', 'homes', 'properties', 'buying', 'selling', 'investment', 'luxury'],
  },

  // Restaurant/Food
  'restaurant': {
    id: 'restaurant',
    businessType: 'restaurant',
    heroPrompts: [
      'Experience culinary excellence in every dish',
      'Where flavor meets ambiance',
      'Savor memorable dining experiences',
    ],
    aboutPrompts: [
      'Tell the story of the chef and culinary philosophy',
      'Highlight fresh, quality ingredients and sourcing',
      'Describe the unique dining atmosphere',
    ],
    servicesPrompts: [
      'Full dining experience with seasonal menus',
      'Private events and catering services',
      'Takeout and delivery options',
      'Wine pairing and tasting events',
    ],
    uspSuggestions: [
      'Farm-to-table fresh ingredients',
      'Award-winning chef creations',
      'Intimate dining atmosphere',
      'Locally sourced and sustainable',
      'Handcrafted cocktails and fine wines',
    ],
    ctaVariants: {
      primary: ['Reserve a Table', 'Book Now', 'View Menu', 'Order Online'],
      secondary: ['Private Events', 'Gift Cards', 'Contact Us', 'See Specials'],
    },
    sectionOrder: ['hero', 'menu', 'about', 'gallery', 'testimonials', 'contact'],
    keywords: ['restaurant', 'dining', 'cuisine', 'chef', 'menu', 'reservation', 'food'],
  },

  // Tech Startup
  'tech-startup': {
    id: 'tech-startup',
    businessType: 'tech-startup',
    heroPrompts: [
      'Transform your business with innovative technology',
      'The future of [industry] starts here',
      'Powering the next generation of digital success',
    ],
    aboutPrompts: [
      'Share the founding vision and mission',
      'Highlight the technical expertise of the team',
      'Describe the problem being solved and impact',
    ],
    servicesPrompts: [
      'Core product or platform features',
      'Integration and API capabilities',
      'Enterprise solutions and customization',
      'Support and implementation services',
    ],
    uspSuggestions: [
      'Cutting-edge AI/ML technology',
      'Seamless integration capabilities',
      '24/7 technical support',
      'Industry-leading security',
      'Scalable cloud infrastructure',
    ],
    ctaVariants: {
      primary: ['Get Started Free', 'Request Demo', 'Start Free Trial', 'See it in Action'],
      secondary: ['View Pricing', 'Documentation', 'Contact Sales', 'Watch Video'],
    },
    sectionOrder: ['hero', 'features', 'how-it-works', 'pricing', 'testimonials', 'faq', 'contact'],
    keywords: ['technology', 'software', 'platform', 'SaaS', 'innovation', 'digital', 'solution'],
  },

  // Healthcare/Medical
  'healthcare': {
    id: 'healthcare',
    businessType: 'healthcare',
    heroPrompts: [
      'Compassionate care for you and your family',
      'Your health is our priority',
      'Excellence in patient-centered healthcare',
    ],
    aboutPrompts: [
      'Highlight medical credentials and specializations',
      'Emphasize patient-first philosophy',
      'Describe modern facilities and equipment',
    ],
    servicesPrompts: [
      'Primary care and preventive medicine',
      'Specialty treatments and procedures',
      'Telehealth and virtual consultations',
      'Emergency and urgent care services',
    ],
    uspSuggestions: [
      'Board-certified medical professionals',
      'State-of-the-art medical facilities',
      'Same-day appointments available',
      'Comprehensive patient care',
      'Accepting most insurance plans',
    ],
    ctaVariants: {
      primary: ['Book Appointment', 'Schedule Visit', 'Find a Doctor', 'Request Consultation'],
      secondary: ['Patient Portal', 'Insurance Info', 'Contact Us', 'Learn More'],
    },
    sectionOrder: ['hero', 'services', 'doctors', 'about', 'testimonials', 'insurance', 'contact'],
    keywords: ['healthcare', 'medical', 'doctor', 'patient', 'care', 'health', 'wellness'],
  },

  // Law Firm
  'law-firm': {
    id: 'law-firm',
    businessType: 'law-firm',
    heroPrompts: [
      'Protecting your rights with experienced counsel',
      'Trusted legal advocacy when it matters most',
      'Excellence in legal representation',
    ],
    aboutPrompts: [
      'Highlight years of legal experience and case wins',
      'Emphasize commitment to client outcomes',
      'Describe areas of legal expertise',
    ],
    servicesPrompts: [
      'Personal injury and accident claims',
      'Business and corporate law',
      'Family law and estate planning',
      'Criminal defense representation',
    ],
    uspSuggestions: [
      'No fee unless we win',
      'Decades of combined experience',
      'Millions recovered for clients',
      'Personalized legal strategy',
      'Available 24/7 for emergencies',
    ],
    ctaVariants: {
      primary: ['Free Consultation', 'Contact Attorney', 'Get Legal Help', 'Schedule Call'],
      secondary: ['Case Results', 'Our Attorneys', 'Practice Areas', 'Learn More'],
    },
    sectionOrder: ['hero', 'practice-areas', 'attorneys', 'about', 'results', 'testimonials', 'contact'],
    keywords: ['attorney', 'lawyer', 'legal', 'law firm', 'counsel', 'litigation', 'justice'],
  },

  // Fitness/Gym
  'fitness': {
    id: 'fitness',
    businessType: 'fitness',
    heroPrompts: [
      'Transform your body and mind',
      'Your fitness journey starts here',
      'Achieve your goals with expert guidance',
    ],
    aboutPrompts: [
      'Share the gym philosophy and training approach',
      'Highlight trainer certifications and experience',
      'Describe the community and atmosphere',
    ],
    servicesPrompts: [
      'Personal training sessions',
      'Group fitness classes',
      'Nutrition coaching and meal planning',
      'Sports-specific training programs',
    ],
    uspSuggestions: [
      'Certified personal trainers',
      'State-of-the-art equipment',
      'Flexible membership options',
      'Results-driven programs',
      'Supportive fitness community',
    ],
    ctaVariants: {
      primary: ['Start Free Trial', 'Join Now', 'Get Started', 'Book a Class'],
      secondary: ['View Schedule', 'Tour Facility', 'Membership Options', 'Meet Trainers'],
    },
    sectionOrder: ['hero', 'programs', 'trainers', 'schedule', 'about', 'testimonials', 'pricing', 'contact'],
    keywords: ['fitness', 'gym', 'training', 'workout', 'health', 'personal trainer', 'exercise'],
  },

  // E-commerce/Retail
  'ecommerce': {
    id: 'ecommerce',
    businessType: 'ecommerce',
    heroPrompts: [
      'Discover products you will love',
      'Shop the latest collection',
      'Quality products, exceptional value',
    ],
    aboutPrompts: [
      'Tell the brand story and origins',
      'Highlight product quality and sourcing',
      'Describe commitment to customer satisfaction',
    ],
    servicesPrompts: [
      'Curated product collections',
      'Fast and free shipping options',
      'Easy returns and exchanges',
      'Personal shopping assistance',
    ],
    uspSuggestions: [
      'Free shipping on all orders',
      '30-day hassle-free returns',
      'Handpicked quality products',
      'Secure checkout guaranteed',
      'Loyalty rewards program',
    ],
    ctaVariants: {
      primary: ['Shop Now', 'Browse Collection', 'View Products', 'Start Shopping'],
      secondary: ['New Arrivals', 'Sale Items', 'Gift Cards', 'Contact Us'],
    },
    sectionOrder: ['hero', 'featured-products', 'categories', 'about', 'testimonials', 'newsletter', 'contact'],
    keywords: ['shop', 'buy', 'products', 'collection', 'sale', 'shipping', 'quality'],
  },

  // Photography
  'photography': {
    id: 'photography',
    businessType: 'photography',
    heroPrompts: [
      'Capturing moments that last forever',
      'Your story, beautifully told through images',
      'Professional photography for life s special moments',
    ],
    aboutPrompts: [
      'Share photography style and artistic vision',
      'Highlight experience and notable clients',
      'Describe the creative approach and process',
    ],
    servicesPrompts: [
      'Wedding and event photography',
      'Portrait and family sessions',
      'Commercial and product photography',
      'Editing and retouching services',
    ],
    uspSuggestions: [
      'Award-winning photography',
      'Personalized creative direction',
      'Fast delivery turnaround',
      'Full printing and album services',
      'On-location shoots available',
    ],
    ctaVariants: {
      primary: ['Book Session', 'Get Quote', 'View Portfolio', 'Schedule Shoot'],
      secondary: ['Gallery', 'Pricing', 'Contact', 'Learn More'],
    },
    sectionOrder: ['hero', 'gallery', 'services', 'about', 'testimonials', 'pricing', 'contact'],
    keywords: ['photography', 'photos', 'portrait', 'wedding', 'images', 'professional', 'creative'],
  },
};

/**
 * Get content template for a business type
 */
export function getContentTemplate(businessType: string): ContentTemplate | undefined {
  return CONTENT_TEMPLATES[businessType];
}

/**
 * Get default content template
 */
export function getDefaultContentTemplate(): ContentTemplate {
  return {
    id: 'default',
    businessType: 'default',
    heroPrompts: [
      'Welcome to our business',
      'Professional services you can trust',
      'Your success is our priority',
    ],
    aboutPrompts: [
      'Share company history and mission',
      'Highlight team expertise and values',
      'Describe commitment to customers',
    ],
    servicesPrompts: [
      'Core business services',
      'Consultation and support',
      'Custom solutions',
    ],
    uspSuggestions: [
      'Years of industry experience',
      'Customer-focused approach',
      'Quality guaranteed',
      'Competitive pricing',
      'Expert team',
    ],
    ctaVariants: {
      primary: ['Get Started', 'Contact Us', 'Learn More', 'Request Quote'],
      secondary: ['Our Services', 'About Us', 'Contact', 'Portfolio'],
    },
    sectionOrder: ['hero', 'services', 'about', 'testimonials', 'contact'],
    keywords: ['professional', 'services', 'quality', 'expert', 'business'],
  };
}

/**
 * Get content template or default
 */
export function getContentTemplateOrDefault(businessType: string): ContentTemplate {
  return getContentTemplate(businessType) || getDefaultContentTemplate();
}

/**
 * Generate prompt for specific content based on business type
 */
export function generateContentPrompt(
  businessType: string,
  sectionType: 'hero' | 'about' | 'services',
  businessName: string,
  description: string,
  tone: string
): string {
  const template = getContentTemplateOrDefault(businessType);
  const businessTypeConfig = getBusinessTypeById(businessType);

  const prompts = sectionType === 'hero'
    ? template.heroPrompts
    : sectionType === 'about'
      ? template.aboutPrompts
      : template.servicesPrompts;

  return `
Create ${sectionType} content for ${businessName}, a ${businessTypeConfig?.label || businessType} business.

Business Description: ${description}

Content Guidelines:
${prompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Tone: ${tone}
Keywords to include: ${template.keywords.join(', ')}

Make the content compelling, specific to the business, and optimized for conversion.
`;
}
