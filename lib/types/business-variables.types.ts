/**
 * Business Variables Types for Webese.ai
 * Template variables that get injected into generated websites
 */

// Address structure
export interface BusinessAddress {
  street?: string;
  suite?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  formatted?: string;  // Full formatted address
}

// Social media links
export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  pinterest?: string;
  yelp?: string;
  tripadvisor?: string;
  github?: string;
  dribbble?: string;
  behance?: string;
}

// Operating hours for a single day
export interface DayHours {
  open: string;   // e.g., "09:00"
  close: string;  // e.g., "17:00"
  closed?: boolean;
}

// Weekly operating hours
export interface OperatingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
  timezone?: string;
  note?: string;  // e.g., "Closed on public holidays"
}

// Service or product offering
export interface BusinessOffering {
  id: string;
  name: string;
  description: string;
  price?: string;
  priceNote?: string;  // e.g., "Starting from", "Per hour"
  image?: string;
  featured?: boolean;
  category?: string;
}

// Team member
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
  email?: string;
  linkedin?: string;
  featured?: boolean;
}

// Testimonial
export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating?: number;  // 1-5
  image?: string;
  featured?: boolean;
}

// FAQ item
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

// Gallery item
export interface GalleryItem {
  id: string;
  image: string;
  title?: string;
  description?: string;
  category?: string;
}

// Call to action
export interface CTAConfig {
  text: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: string;
  external?: boolean;
}

// Generated content from AI
export interface GeneratedContent {
  // Hero section
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroCTAPrimary: CTAConfig;
  heroCTASecondary?: CTAConfig;

  // About section
  aboutTitle: string;
  aboutSubtitle?: string;
  aboutContent: string;
  aboutHighlights?: string[];

  // Services section
  servicesTitle: string;
  servicesSubtitle?: string;
  servicesIntro?: string;

  // Contact section
  contactTitle: string;
  contactSubtitle?: string;
  contactIntro?: string;

  // Footer
  footerTagline?: string;

  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];

  // Stats (generated based on business type)
  stats?: {
    yearsExperience?: string;
    clientsServed?: string;
    projectsCompleted?: string;
    teamSize?: string;
    satisfaction?: string;
    custom?: { label: string; value: string }[];
  };
}

// Image assets
export interface BusinessImages {
  logo?: string;
  logoLight?: string;  // For dark backgrounds
  logoDark?: string;   // For light backgrounds
  favicon?: string;
  hero?: string;
  heroMobile?: string;
  about?: string;
  gallery?: string[];
  team?: string[];
  products?: string[];
  background?: string;
  ogImage?: string;  // Open Graph image
}

// Navigation item
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  icon?: string;
  external?: boolean;
  highlight?: boolean;
}

// Complete Business Variables
export interface BusinessVariables {
  // === Core Identity ===
  businessName: string;
  legalName?: string;
  tagline?: string;
  foundedYear?: string;

  // === Business Classification ===
  businessType: string;
  businessTypeLabel?: string;
  industry?: string;
  description: string;
  shortDescription?: string;

  // === Contact Information ===
  email?: string;
  phone?: string;
  alternatePhone?: string;
  fax?: string;
  whatsapp?: string;
  address?: BusinessAddress;

  // === Social Media ===
  social?: SocialLinks;

  // === Operating Hours ===
  hours?: OperatingHours;

  // === Unique Selling Points ===
  usps: string[];

  // === Target Audience ===
  targetAudience?: string;
  targetDemographic?: string;

  // === Services/Products ===
  offerings: BusinessOffering[];
  priceRange?: string;
  currency?: string;

  // === Team ===
  team?: TeamMember[];
  ownerName?: string;

  // === Testimonials ===
  testimonials?: Testimonial[];

  // === FAQs ===
  faqs?: FAQItem[];

  // === Gallery ===
  gallery?: GalleryItem[];

  // === Navigation ===
  navigation?: NavItem[];

  // === Images ===
  images?: BusinessImages;

  // === AI Generated Content ===
  generatedContent?: GeneratedContent;

  // === Metadata ===
  createdAt?: string;
  updatedAt?: string;
  locale?: string;
  timezone?: string;
}

// Partial type for updates
export type BusinessVariablesUpdate = Partial<BusinessVariables>;

// Extraction result from user input
export interface ExtractedBusinessInfo {
  businessName: string;
  businessType: string;
  description: string;
  inferredUSPs?: string[];
  inferredOfferings?: string[];
  inferredTargetAudience?: string;
  suggestedTaglines?: string[];
  confidence: number;  // 0-1
}

// Template context for variable injection
export interface TemplateContext {
  business: BusinessVariables;
  design: {
    tokens: import('./design-tokens.types').DesignTokens;
    preset: string;
  };
  images: BusinessImages;
  generated: GeneratedContent;
  meta: {
    buildDate: string;
    version: string;
    locale: string;
  };
}
