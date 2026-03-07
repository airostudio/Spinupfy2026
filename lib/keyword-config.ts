/**
 * Centralized Keyword & Keyphrase Configuration
 *
 * This file serves as the single source of truth for:
 * - Detecting user intent from prompts
 * - Determining which pages to create
 * - Finding competitor/reference websites
 * - Matching business types to features
 *
 * The AI website builder uses this configuration to intelligently
 * interpret user prompts and create appropriate pages/features.
 */

// ============================================================
// PAGE TYPES & THEIR TRIGGER KEYWORDS
// ============================================================

export interface PageTypeConfig {
  // Page identification
  slug: string
  title: string
  description: string

  // Keywords that trigger this page type
  triggerKeywords: string[]      // Strong indicators - one match creates page
  triggerPhrases: string[]       // Multi-word phrases that trigger page
  supportingKeywords: string[]   // Weaker indicators - need multiple matches

  // Competitor research
  searchTerms: string[]          // Terms to find reference websites
  exampleSites: string[]         // Known good examples for inspiration

  // Page configuration
  requiredSections: string[]     // Sections that must be on this page
  optionalSections: string[]     // Sections that may be added based on context

  // CTA customization
  ctaText: string
  ctaSubtext: string
}

export const PAGE_TYPE_CONFIGS: Record<string, PageTypeConfig> = {
  // ============================================================
  // E-COMMERCE / SHOP PAGE
  // ============================================================
  shop: {
    slug: 'shop',
    title: 'Shop',
    description: 'Online store for selling products',

    triggerKeywords: [
      'shop', 'store', 'buy', 'purchase', 'sell', 'product', 'products',
      'merchandise', 'merch', 'ecommerce', 'e-commerce', 'retail',
      'catalog', 'inventory', 'cart', 'checkout', 'order', 'orders'
    ],
    triggerPhrases: [
      'sell online', 'online store', 'online shop', 'web store',
      'buy now', 'shop now', 'add to cart', 'shopping cart',
      'sell products', 'selling products', 'our products',
      'product catalog', 'product line', 'product range',
      'items for sale', 'products for sale', 'order online',
      'purchase online', 'digital storefront', 'online marketplace',
      'dropshipping', 'drop shipping', 'wholesale products',
      'retail store', 'boutique shop', 'gift shop'
    ],
    supportingKeywords: [
      'price', 'pricing', 'cost', 'shipping', 'delivery', 'stock',
      'available', 'collection', 'items', 'goods', 'vendor', 'supplier',
      'clothing', 'apparel', 'accessories', 'jewelry', 'gifts', 'gadgets',
      'electronics', 'handmade', 'crafts', 'artisan', 'fashion', 'brand'
    ],

    searchTerms: [
      'best ecommerce website design',
      'online store website examples',
      'product catalog website inspiration',
      'shopify store design examples',
      'retail website best practices'
    ],
    exampleSites: [
      'allbirds.com', 'glossier.com', 'everlane.com', 'warbyparker.com',
      'casper.com', 'away.com', 'brooklinen.com', 'outdoor-voices.com'
    ],

    requiredSections: ['STORE', 'FEATURES'],
    optionalSections: ['TESTIMONIALS', 'FAQ', 'TRUST_BADGES'],

    ctaText: 'Shop Now',
    ctaSubtext: 'Browse our collection'
  },

  // ============================================================
  // BOOKING / RESERVATION PAGE
  // ============================================================
  booking: {
    slug: 'book',
    title: 'Book',
    description: 'Appointment or reservation booking',

    triggerKeywords: [
      'book', 'booking', 'reserve', 'reservation', 'appointment',
      'schedule', 'scheduling', 'calendar', 'availability'
    ],
    triggerPhrases: [
      'book a table', 'reserve a table', 'make a reservation',
      'book an appointment', 'schedule an appointment',
      'book a session', 'reserve a spot', 'book a slot',
      'book a class', 'sign up for class', 'register for class',
      'book a consultation', 'schedule a consultation', 'free consultation',
      'book a call', 'schedule a call', 'book a demo', 'schedule a demo',
      'book a tour', 'schedule a tour', 'guided tour',
      'book a viewing', 'schedule a viewing', 'property tour',
      'book online', 'online booking', 'online reservation',
      'party size', 'number of guests', 'how many people'
    ],
    supportingKeywords: [
      'time', 'date', 'slot', 'available', 'availability', 'open',
      'confirm', 'confirmation', 'reminder', 'cancel', 'reschedule'
    ],

    searchTerms: [
      'best booking website design',
      'appointment scheduling website examples',
      'reservation system website inspiration',
      'restaurant booking website design',
      'salon booking page examples'
    ],
    exampleSites: [
      'calendly.com', 'acuityscheduling.com', 'resy.com', 'opentable.com',
      'mindbodyonline.com', 'vagaro.com', 'squareup.com/appointments'
    ],

    requiredSections: ['BOOKING'],
    optionalSections: ['FAQ', 'TESTIMONIALS', 'SERVICES'],

    ctaText: 'Book Now',
    ctaSubtext: 'Schedule your appointment'
  },

  // ============================================================
  // MENU PAGE (Restaurants, Cafes, Bars)
  // ============================================================
  menu: {
    slug: 'menu',
    title: 'Menu',
    description: 'Food and drink menu for restaurants',

    triggerKeywords: [
      'menu', 'dishes', 'cuisine', 'food', 'drinks', 'beverages',
      'appetizers', 'entrees', 'desserts', 'cocktails', 'wines'
    ],
    triggerPhrases: [
      'our menu', 'food menu', 'drink menu', 'full menu',
      'view menu', 'see our menu', 'browse menu',
      'lunch menu', 'dinner menu', 'breakfast menu', 'brunch menu',
      'tasting menu', 'prix fixe', 'a la carte',
      'specials menu', 'seasonal menu', 'daily specials',
      'wine list', 'cocktail menu', 'beer menu', 'drinks list',
      'kids menu', 'vegetarian menu', 'vegan options',
      'gluten free options', 'dietary options'
    ],
    supportingKeywords: [
      'dish', 'plate', 'course', 'starter', 'main', 'side',
      'ingredients', 'chef', 'kitchen', 'recipe', 'flavor'
    ],

    searchTerms: [
      'best restaurant menu website design',
      'food menu page examples',
      'restaurant website menu inspiration',
      'cafe menu design examples',
      'digital menu board design'
    ],
    exampleSites: [
      'elevenmadisonpark.com', 'nomacopenhagen.dk', 'thefrenchlaundry.com',
      'alinearestaurant.com', 'dishoom.com', 'shakeshack.com'
    ],

    requiredSections: ['MENU'],
    optionalSections: ['GALLERY', 'TESTIMONIALS', 'BOOKING'],

    ctaText: 'View Full Menu',
    ctaSubtext: 'Explore our dishes'
  },

  // ============================================================
  // SERVICES PAGE
  // ============================================================
  services: {
    slug: 'services',
    title: 'Services',
    description: 'Services offered by the business',

    triggerKeywords: [
      'services', 'service', 'offerings', 'solutions', 'packages',
      'what we do', 'how we help', 'expertise'
    ],
    triggerPhrases: [
      'our services', 'services we offer', 'what we offer',
      'service packages', 'service plans', 'pricing plans',
      'how we can help', 'what we do', 'our expertise',
      'professional services', 'consulting services',
      'full service', 'end to end', 'comprehensive services',
      'custom services', 'tailored services', 'bespoke services'
    ],
    supportingKeywords: [
      'provide', 'offer', 'deliver', 'specialize', 'expert',
      'professional', 'quality', 'trusted', 'experienced'
    ],

    searchTerms: [
      'best services page design',
      'professional services website examples',
      'service offerings page inspiration',
      'business services website design'
    ],
    exampleSites: [
      'mckinsey.com', 'deloitte.com', 'accenture.com', 'bain.com',
      'ideo.com', 'frogdesign.com', 'pentagram.com'
    ],

    requiredSections: ['SERVICES'],
    optionalSections: ['PRICING', 'TESTIMONIALS', 'FAQ', 'CTA'],

    ctaText: 'Explore Services',
    ctaSubtext: 'See how we can help'
  },

  // ============================================================
  // PORTFOLIO / GALLERY PAGE
  // ============================================================
  portfolio: {
    slug: 'portfolio',
    title: 'Portfolio',
    description: 'Showcase of work and projects',

    triggerKeywords: [
      'portfolio', 'work', 'projects', 'gallery', 'showcase',
      'case studies', 'examples', 'samples'
    ],
    triggerPhrases: [
      'our work', 'our portfolio', 'view our work', 'see our work',
      'project gallery', 'work samples', 'case studies',
      'featured projects', 'recent projects', 'past projects',
      'client work', 'design portfolio', 'photography portfolio',
      'before and after', 'project showcase', 'success stories'
    ],
    supportingKeywords: [
      'project', 'client', 'completed', 'delivered', 'created',
      'designed', 'built', 'developed', 'launched'
    ],

    searchTerms: [
      'best portfolio website design',
      'creative portfolio examples',
      'project showcase website inspiration',
      'agency portfolio design',
      'photographer portfolio website'
    ],
    exampleSites: [
      'behance.net', 'dribbble.com', 'awwwards.com', 'siteinspire.com',
      'squarespace.com/templates/portfolio', 'format.com'
    ],

    requiredSections: ['PORTFOLIO'],
    optionalSections: ['TESTIMONIALS', 'CTA', 'SERVICES'],

    ctaText: 'View Our Work',
    ctaSubtext: 'Browse our portfolio'
  },

  // ============================================================
  // BLOG / NEWS PAGE
  // ============================================================
  blog: {
    slug: 'blog',
    title: 'Blog',
    description: 'Articles, news, and updates',

    triggerKeywords: [
      'blog', 'news', 'articles', 'posts', 'updates', 'stories',
      'insights', 'resources', 'tips', 'guides'
    ],
    triggerPhrases: [
      'our blog', 'read our blog', 'latest news', 'latest updates',
      'industry news', 'company news', 'news and updates',
      'tips and tricks', 'how to guides', 'resources',
      'thought leadership', 'industry insights', 'expert advice',
      'learn more', 'educational content', 'tutorials'
    ],
    supportingKeywords: [
      'article', 'post', 'read', 'learn', 'discover', 'explore',
      'written', 'published', 'author', 'topic', 'category'
    ],

    searchTerms: [
      'best blog design examples',
      'company blog website inspiration',
      'content marketing blog design',
      'professional blog layout examples'
    ],
    exampleSites: [
      'stripe.com/blog', 'airbnb.com/blog', 'buffer.com/resources',
      'hubspot.com/blog', 'intercom.com/blog', 'medium.com'
    ],

    requiredSections: ['BLOG'],
    optionalSections: ['CTA', 'NEWSLETTER'],

    ctaText: 'Read Our Blog',
    ctaSubtext: 'Explore our latest articles'
  },

  // ============================================================
  // PRICING PAGE
  // ============================================================
  pricing: {
    slug: 'pricing',
    title: 'Pricing',
    description: 'Pricing plans and packages',

    triggerKeywords: [
      'pricing', 'prices', 'plans', 'packages', 'tiers',
      'cost', 'rates', 'fees', 'subscription'
    ],
    triggerPhrases: [
      'our pricing', 'pricing plans', 'view pricing', 'see pricing',
      'pricing packages', 'pricing tiers', 'price list',
      'how much', 'what does it cost', 'affordable pricing',
      'competitive pricing', 'transparent pricing',
      'subscription plans', 'monthly plans', 'annual plans',
      'free trial', 'free tier', 'starter plan', 'pro plan',
      'enterprise pricing', 'custom pricing', 'get a quote'
    ],
    supportingKeywords: [
      'plan', 'package', 'tier', 'level', 'option', 'includes',
      'features', 'unlimited', 'premium', 'basic', 'professional'
    ],

    searchTerms: [
      'best pricing page design',
      'saas pricing page examples',
      'pricing table design inspiration',
      'subscription pricing page examples'
    ],
    exampleSites: [
      'stripe.com/pricing', 'slack.com/pricing', 'notion.so/pricing',
      'figma.com/pricing', 'canva.com/pricing', 'mailchimp.com/pricing'
    ],

    requiredSections: ['PRICING'],
    optionalSections: ['FAQ', 'TESTIMONIALS', 'CTA'],

    ctaText: 'View Pricing',
    ctaSubtext: 'Find the right plan for you'
  },

  // ============================================================
  // CALCULATOR PAGE (Loans, Mortgages, ROI, etc.)
  // ============================================================
  calculator: {
    slug: 'calculator',
    title: 'Calculator',
    description: 'Interactive calculators for estimates',

    triggerKeywords: [
      'calculator', 'calculate', 'estimate', 'estimator',
      'quote', 'quoter', 'compute', 'figure out'
    ],
    triggerPhrases: [
      'loan calculator', 'mortgage calculator', 'payment calculator',
      'roi calculator', 'return calculator', 'investment calculator',
      'savings calculator', 'retirement calculator', 'compound interest',
      'get a quote', 'instant quote', 'free quote', 'price estimate',
      'cost calculator', 'budget calculator', 'affordability calculator',
      'how much can i afford', 'calculate your payment',
      'calculate your savings', 'see your rate', 'check your rate'
    ],
    supportingKeywords: [
      'rate', 'interest', 'payment', 'term', 'amount', 'down payment',
      'monthly', 'annual', 'total', 'estimate', 'projection'
    ],

    searchTerms: [
      'best calculator widget design',
      'mortgage calculator website examples',
      'loan calculator page design',
      'financial calculator UI inspiration'
    ],
    exampleSites: [
      'bankrate.com', 'nerdwallet.com', 'calculator.net',
      'zillow.com/mortgage-calculator', 'quickenloans.com'
    ],

    requiredSections: ['LOAN_CALCULATOR'],
    optionalSections: ['FAQ', 'CTA', 'TESTIMONIALS'],

    ctaText: 'Calculate Now',
    ctaSubtext: 'Get your instant estimate'
  },

  // ============================================================
  // CONTACT PAGE
  // ============================================================
  contact: {
    slug: 'contact',
    title: 'Contact',
    description: 'Contact information and form',

    triggerKeywords: [
      'contact', 'reach', 'email', 'phone', 'call', 'message',
      'location', 'address', 'directions', 'map'
    ],
    triggerPhrases: [
      'contact us', 'get in touch', 'reach out', 'send us a message',
      'how to reach us', 'find us', 'visit us', 'our location',
      'drop us a line', 'give us a call', 'email us',
      'contact form', 'inquiry form', 'request form',
      'office location', 'store location', 'opening hours', 'business hours'
    ],
    supportingKeywords: [
      'inquiry', 'question', 'help', 'support', 'assistance',
      'feedback', 'suggestion', 'request'
    ],

    searchTerms: [
      'best contact page design',
      'contact us page examples',
      'contact form design inspiration',
      'business contact page layout'
    ],
    exampleSites: [
      'apple.com/contact', 'google.com/contact', 'stripe.com/contact',
      'hubspot.com/contact'
    ],

    requiredSections: ['CONTACT'],
    optionalSections: ['MAP', 'FAQ'],

    ctaText: 'Contact Us',
    ctaSubtext: 'Get in touch with our team'
  },

  // ============================================================
  // ABOUT PAGE
  // ============================================================
  about: {
    slug: 'about',
    title: 'About',
    description: 'About the company/business',

    triggerKeywords: [
      'about', 'story', 'history', 'mission', 'vision', 'values',
      'team', 'founder', 'founders', 'who we are'
    ],
    triggerPhrases: [
      'about us', 'our story', 'who we are', 'our mission',
      'our vision', 'our values', 'our history', 'company history',
      'meet the team', 'our team', 'our founders', 'leadership team',
      'why choose us', 'what makes us different', 'our approach',
      'company culture', 'our philosophy', 'what we believe'
    ],
    supportingKeywords: [
      'founded', 'started', 'established', 'years', 'experience',
      'passionate', 'dedicated', 'committed', 'believe'
    ],

    searchTerms: [
      'best about page design',
      'company about us page examples',
      'about page website inspiration',
      'team page design examples'
    ],
    exampleSites: [
      'apple.com/about', 'airbnb.com/about', 'patagonia.com/our-story',
      'mailchimp.com/about', 'stripe.com/about'
    ],

    requiredSections: ['ABOUT'],
    optionalSections: ['TEAM', 'TIMELINE', 'VALUES', 'CTA'],

    ctaText: 'Learn More',
    ctaSubtext: 'Discover our story'
  },

  // ============================================================
  // EVENTS / TICKETS PAGE
  // ============================================================
  events: {
    slug: 'events',
    title: 'Events',
    description: 'Upcoming events and ticket sales',

    triggerKeywords: [
      'events', 'event', 'tickets', 'shows', 'concerts', 'performances',
      'workshops', 'seminars', 'webinars', 'conferences'
    ],
    triggerPhrases: [
      'upcoming events', 'our events', 'event calendar', 'events schedule',
      'buy tickets', 'get tickets', 'ticket sales', 'book tickets',
      'live events', 'virtual events', 'online events',
      'workshops and classes', 'upcoming workshops', 'register for event',
      'event registration', 'sign up for event', 'rsvp'
    ],
    supportingKeywords: [
      'date', 'time', 'venue', 'location', 'speaker', 'host',
      'attend', 'register', 'admission', 'entry'
    ],

    searchTerms: [
      'best events page design',
      'event listing website examples',
      'ticket sales page inspiration',
      'event calendar website design'
    ],
    exampleSites: [
      'eventbrite.com', 'meetup.com', 'ticketmaster.com',
      'universe.com', 'splash.com'
    ],

    requiredSections: ['EVENTS'],
    optionalSections: ['BOOKING', 'FAQ', 'TESTIMONIALS'],

    ctaText: 'View Events',
    ctaSubtext: 'See upcoming events'
  },

  // ============================================================
  // FAQ PAGE
  // ============================================================
  faq: {
    slug: 'faq',
    title: 'FAQ',
    description: 'Frequently asked questions',

    triggerKeywords: [
      'faq', 'faqs', 'questions', 'answers', 'help', 'support'
    ],
    triggerPhrases: [
      'frequently asked questions', 'common questions', 'questions and answers',
      'help center', 'support center', 'knowledge base',
      'how does it work', 'how to', 'getting started',
      'need help', 'have questions', 'learn more about'
    ],
    supportingKeywords: [
      'question', 'answer', 'ask', 'wonder', 'curious', 'explain',
      'understand', 'clarify', 'information'
    ],

    searchTerms: [
      'best faq page design',
      'faq section examples',
      'help center design inspiration',
      'knowledge base website design'
    ],
    exampleSites: [
      'stripe.com/docs', 'notion.so/help', 'slack.com/help',
      'dropbox.com/help', 'mailchimp.com/help'
    ],

    requiredSections: ['FAQ'],
    optionalSections: ['CONTACT', 'CTA'],

    ctaText: 'View FAQ',
    ctaSubtext: 'Find answers to common questions'
  },

  // ============================================================
  // TESTIMONIALS / REVIEWS PAGE
  // ============================================================
  testimonials: {
    slug: 'testimonials',
    title: 'Testimonials',
    description: 'Customer reviews and testimonials',

    triggerKeywords: [
      'testimonials', 'reviews', 'feedback', 'ratings', 'success stories',
      'case studies', 'results', 'outcomes'
    ],
    triggerPhrases: [
      'customer testimonials', 'client testimonials', 'what our customers say',
      'customer reviews', 'client reviews', 'customer feedback',
      'success stories', 'client success', 'case studies',
      'hear from our customers', 'real results', 'proven results'
    ],
    supportingKeywords: [
      'happy', 'satisfied', 'recommend', 'trust', 'love', 'amazing',
      'excellent', 'outstanding', 'fantastic', 'great experience'
    ],

    searchTerms: [
      'best testimonials page design',
      'customer reviews page examples',
      'testimonial section inspiration',
      'case studies page design'
    ],
    exampleSites: [
      'slack.com/customer-stories', 'hubspot.com/case-studies',
      'salesforce.com/customer-success-stories', 'zendesk.com/customer'
    ],

    requiredSections: ['TESTIMONIALS'],
    optionalSections: ['CTA', 'TRUST_BADGES'],

    ctaText: 'Read Reviews',
    ctaSubtext: 'See what our customers say'
  }
}

// ============================================================
// BUSINESS TYPE CONFIGURATIONS
// ============================================================

export interface BusinessTypeConfig {
  type: string
  aliases: string[]                 // Alternative names for this business type
  keywords: string[]                // Keywords that identify this business type
  defaultPages: string[]            // Pages created by default for this type
  optionalPages: string[]           // Pages that may be added based on context
  searchTerms: string[]             // Terms for finding competitor sites
  bookingType?: string              // Type of booking if applicable
  bookingTerminology?: {
    heading: string
    subheading: string
    buttonText: string
    dateLabel: string
    timeLabel: string
    guestLabel?: string
    partySize?: boolean
  }
}

export const BUSINESS_TYPE_CONFIGS: Record<string, BusinessTypeConfig> = {
  restaurant: {
    type: 'restaurant',
    aliases: ['eatery', 'dining', 'diner', 'bistro', 'brasserie', 'grill', 'steakhouse', 'pizzeria', 'trattoria'],
    keywords: ['restaurant', 'dining', 'food', 'eat', 'cuisine', 'chef', 'kitchen', 'dishes', 'meal', 'dinner', 'lunch'],
    defaultPages: ['about', 'menu', 'contact'],
    optionalPages: ['booking', 'gallery', 'events', 'blog'],
    searchTerms: ['best restaurant website design', 'restaurant website examples', 'fine dining website inspiration'],
    bookingType: 'table',
    bookingTerminology: {
      heading: 'Reserve Your Table',
      subheading: 'Book your dining experience',
      buttonText: 'Make Reservation',
      dateLabel: 'Date',
      timeLabel: 'Time',
      guestLabel: 'Party Size',
      partySize: true
    }
  },

  cafe: {
    type: 'cafe',
    aliases: ['coffee shop', 'coffeehouse', 'espresso bar', 'coffee bar', 'tea house', 'tea room'],
    keywords: ['cafe', 'coffee', 'espresso', 'latte', 'cappuccino', 'tea', 'pastry', 'bakery items'],
    defaultPages: ['about', 'menu', 'contact'],
    optionalPages: ['shop', 'blog', 'gallery'],
    searchTerms: ['best cafe website design', 'coffee shop website examples', 'cafe website inspiration'],
    bookingType: 'reservation',
    bookingTerminology: {
      heading: 'Reserve Your Spot',
      subheading: 'Book a table',
      buttonText: 'Reserve Now',
      dateLabel: 'Date',
      timeLabel: 'Time',
      guestLabel: 'Guests',
      partySize: true
    }
  },

  bakery: {
    type: 'bakery',
    aliases: ['patisserie', 'pastry shop', 'bread shop', 'cake shop', 'confectionery'],
    keywords: ['bakery', 'bread', 'pastry', 'cake', 'cookies', 'baked', 'fresh', 'artisan', 'homemade'],
    defaultPages: ['about', 'menu', 'contact'],
    optionalPages: ['shop', 'gallery', 'blog'],
    searchTerms: ['best bakery website design', 'bakery website examples', 'artisan bakery website inspiration']
  },

  bar: {
    type: 'bar',
    aliases: ['pub', 'tavern', 'lounge', 'nightclub', 'cocktail bar', 'wine bar', 'sports bar'],
    keywords: ['bar', 'drinks', 'cocktails', 'beer', 'wine', 'spirits', 'nightlife', 'happy hour'],
    defaultPages: ['about', 'menu', 'contact'],
    optionalPages: ['events', 'gallery', 'booking'],
    searchTerms: ['best bar website design', 'cocktail bar website examples', 'pub website inspiration'],
    bookingType: 'reservation',
    bookingTerminology: {
      heading: 'Reserve Your Spot',
      subheading: 'Book a table or area',
      buttonText: 'Make Reservation',
      dateLabel: 'Date',
      timeLabel: 'Time',
      guestLabel: 'Party Size',
      partySize: true
    }
  },

  salon: {
    type: 'salon',
    aliases: ['hair salon', 'beauty salon', 'nail salon', 'barbershop', 'barber'],
    keywords: ['salon', 'hair', 'haircut', 'styling', 'color', 'highlights', 'beauty', 'nails', 'manicure', 'pedicure'],
    defaultPages: ['about', 'services', 'contact'],
    optionalPages: ['booking', 'gallery', 'portfolio', 'pricing'],
    searchTerms: ['best salon website design', 'hair salon website examples', 'beauty salon website inspiration'],
    bookingType: 'appointment',
    bookingTerminology: {
      heading: 'Book Your Appointment',
      subheading: 'Schedule your visit',
      buttonText: 'Book Now',
      dateLabel: 'Preferred Date',
      timeLabel: 'Preferred Time'
    }
  },

  spa: {
    type: 'spa',
    aliases: ['day spa', 'wellness center', 'massage therapy', 'wellness spa', 'medspa', 'med spa'],
    keywords: ['spa', 'massage', 'wellness', 'relaxation', 'treatment', 'facial', 'body', 'therapy', 'rejuvenation'],
    defaultPages: ['about', 'services', 'contact'],
    optionalPages: ['booking', 'gallery', 'pricing', 'shop'],
    searchTerms: ['best spa website design', 'wellness spa website examples', 'day spa website inspiration'],
    bookingType: 'appointment',
    bookingTerminology: {
      heading: 'Book Your Treatment',
      subheading: 'Reserve your relaxation',
      buttonText: 'Book Treatment',
      dateLabel: 'Date',
      timeLabel: 'Time'
    }
  },

  fitness: {
    type: 'fitness',
    aliases: ['gym', 'fitness center', 'health club', 'workout studio', 'crossfit', 'bootcamp'],
    keywords: ['fitness', 'gym', 'workout', 'exercise', 'training', 'strength', 'cardio', 'health', 'fit'],
    defaultPages: ['about', 'services', 'contact'],
    optionalPages: ['booking', 'pricing', 'blog', 'shop'],
    searchTerms: ['best fitness website design', 'gym website examples', 'fitness center website inspiration'],
    bookingType: 'class',
    bookingTerminology: {
      heading: 'Book a Class',
      subheading: 'Reserve your spot',
      buttonText: 'Book Class',
      dateLabel: 'Class Date',
      timeLabel: 'Class Time'
    }
  },

  yoga: {
    type: 'yoga',
    aliases: ['yoga studio', 'pilates', 'pilates studio', 'meditation center', 'mindfulness'],
    keywords: ['yoga', 'pilates', 'meditation', 'mindfulness', 'stretch', 'breathe', 'zen', 'flow', 'balance'],
    defaultPages: ['about', 'services', 'contact'],
    optionalPages: ['booking', 'pricing', 'blog', 'shop'],
    searchTerms: ['best yoga studio website design', 'yoga website examples', 'wellness studio website inspiration'],
    bookingType: 'class',
    bookingTerminology: {
      heading: 'Book Your Session',
      subheading: 'Find your flow',
      buttonText: 'Reserve Spot',
      dateLabel: 'Session Date',
      timeLabel: 'Session Time'
    }
  },

  realEstate: {
    type: 'real-estate',
    aliases: ['realtor', 'real estate agent', 'property', 'realty', 'broker', 'estate agent'],
    keywords: ['real estate', 'property', 'homes', 'houses', 'listings', 'buy', 'sell', 'rent', 'mortgage', 'realtor'],
    defaultPages: ['about', 'services', 'portfolio', 'contact'],
    optionalPages: ['calculator', 'blog', 'testimonials'],
    searchTerms: ['best real estate website design', 'realtor website examples', 'property website inspiration'],
    bookingType: 'viewing',
    bookingTerminology: {
      heading: 'Schedule a Viewing',
      subheading: 'Book your property tour',
      buttonText: 'Schedule Viewing',
      dateLabel: 'Preferred Date',
      timeLabel: 'Preferred Time'
    }
  },

  lawFirm: {
    type: 'law-firm',
    aliases: ['attorney', 'lawyer', 'legal', 'law office', 'legal services', 'solicitor'],
    keywords: ['law', 'legal', 'attorney', 'lawyer', 'litigation', 'counsel', 'justice', 'court', 'case'],
    defaultPages: ['about', 'services', 'contact'],
    optionalPages: ['portfolio', 'blog', 'testimonials', 'faq'],
    searchTerms: ['best law firm website design', 'attorney website examples', 'legal website inspiration'],
    bookingType: 'consultation',
    bookingTerminology: {
      heading: 'Schedule a Consultation',
      subheading: 'Book your legal consultation',
      buttonText: 'Book Consultation',
      dateLabel: 'Preferred Date',
      timeLabel: 'Preferred Time'
    }
  },

  medical: {
    type: 'medical',
    aliases: ['doctor', 'clinic', 'healthcare', 'physician', 'medical practice', 'hospital'],
    keywords: ['medical', 'doctor', 'health', 'healthcare', 'clinic', 'patient', 'care', 'treatment', 'diagnosis'],
    defaultPages: ['about', 'services', 'contact'],
    optionalPages: ['booking', 'blog', 'testimonials', 'faq'],
    searchTerms: ['best medical website design', 'doctor website examples', 'healthcare website inspiration'],
    bookingType: 'appointment',
    bookingTerminology: {
      heading: 'Book an Appointment',
      subheading: 'Schedule your visit',
      buttonText: 'Request Appointment',
      dateLabel: 'Preferred Date',
      timeLabel: 'Preferred Time'
    }
  },

  dental: {
    type: 'dental',
    aliases: ['dentist', 'dental practice', 'dental clinic', 'orthodontist', 'oral health'],
    keywords: ['dental', 'dentist', 'teeth', 'oral', 'smile', 'cleaning', 'whitening', 'braces', 'implants'],
    defaultPages: ['about', 'services', 'contact'],
    optionalPages: ['booking', 'blog', 'testimonials', 'faq'],
    searchTerms: ['best dental website design', 'dentist website examples', 'dental practice website inspiration'],
    bookingType: 'appointment',
    bookingTerminology: {
      heading: 'Schedule Your Appointment',
      subheading: 'Book your dental visit',
      buttonText: 'Book Appointment',
      dateLabel: 'Preferred Date',
      timeLabel: 'Preferred Time'
    }
  },

  consulting: {
    type: 'consulting',
    aliases: ['consultant', 'advisory', 'business consulting', 'management consulting', 'strategy consulting'],
    keywords: ['consulting', 'consultant', 'strategy', 'advisory', 'business', 'management', 'solutions', 'expertise'],
    defaultPages: ['about', 'services', 'contact'],
    optionalPages: ['portfolio', 'blog', 'testimonials', 'pricing'],
    searchTerms: ['best consulting website design', 'business consultant website examples', 'advisory firm website inspiration'],
    bookingType: 'consultation',
    bookingTerminology: {
      heading: 'Book a Consultation',
      subheading: 'Schedule your free call',
      buttonText: 'Book Call',
      dateLabel: 'Preferred Date',
      timeLabel: 'Preferred Time'
    }
  },

  photography: {
    type: 'photography',
    aliases: ['photographer', 'photo studio', 'portrait', 'wedding photographer', 'event photographer'],
    keywords: ['photography', 'photographer', 'photo', 'portrait', 'wedding', 'event', 'shoot', 'session', 'capture'],
    defaultPages: ['about', 'portfolio', 'services', 'contact'],
    optionalPages: ['booking', 'blog', 'pricing', 'testimonials'],
    searchTerms: ['best photography website design', 'photographer portfolio examples', 'photography website inspiration'],
    bookingType: 'appointment',
    bookingTerminology: {
      heading: 'Book Your Session',
      subheading: 'Schedule your photoshoot',
      buttonText: 'Book Session',
      dateLabel: 'Session Date',
      timeLabel: 'Session Time'
    }
  },

  ecommerce: {
    type: 'ecommerce',
    aliases: ['online store', 'web store', 'shop', 'retail', 'boutique'],
    keywords: ['shop', 'store', 'buy', 'products', 'sell', 'ecommerce', 'online', 'cart', 'checkout'],
    defaultPages: ['about', 'shop', 'contact'],
    optionalPages: ['blog', 'faq', 'testimonials'],
    searchTerms: ['best ecommerce website design', 'online store examples', 'shopify website inspiration']
  },

  technology: {
    type: 'technology',
    aliases: ['tech', 'software', 'saas', 'startup', 'app', 'digital'],
    keywords: ['technology', 'tech', 'software', 'app', 'digital', 'platform', 'solution', 'innovation', 'startup'],
    defaultPages: ['about', 'services', 'contact'],
    optionalPages: ['pricing', 'blog', 'portfolio', 'faq'],
    searchTerms: ['best tech startup website design', 'saas website examples', 'software company website inspiration']
  },

  marketing: {
    type: 'marketing',
    aliases: ['digital marketing', 'marketing agency', 'advertising', 'creative agency', 'branding agency'],
    keywords: ['marketing', 'digital', 'advertising', 'branding', 'social media', 'seo', 'content', 'creative'],
    defaultPages: ['about', 'services', 'portfolio', 'contact'],
    optionalPages: ['blog', 'pricing', 'testimonials'],
    searchTerms: ['best marketing agency website design', 'digital agency website examples', 'creative agency website inspiration']
  },

  construction: {
    type: 'construction',
    aliases: ['contractor', 'builder', 'building', 'renovation', 'remodeling', 'home improvement'],
    keywords: ['construction', 'building', 'contractor', 'renovation', 'remodel', 'build', 'project', 'commercial', 'residential'],
    defaultPages: ['about', 'services', 'portfolio', 'contact'],
    optionalPages: ['blog', 'testimonials', 'faq'],
    searchTerms: ['best construction website design', 'contractor website examples', 'builder website inspiration']
  },

  hotel: {
    type: 'hotel',
    aliases: ['accommodation', 'lodging', 'resort', 'inn', 'bed and breakfast', 'motel', 'hostel'],
    keywords: ['hotel', 'stay', 'room', 'accommodation', 'booking', 'reservation', 'guest', 'amenities', 'hospitality'],
    defaultPages: ['about', 'contact'],
    optionalPages: ['booking', 'gallery', 'blog', 'events'],
    searchTerms: ['best hotel website design', 'boutique hotel website examples', 'accommodation website inspiration'],
    bookingType: 'reservation',
    bookingTerminology: {
      heading: 'Book Your Stay',
      subheading: 'Reserve your room',
      buttonText: 'Check Availability',
      dateLabel: 'Check-in',
      timeLabel: 'Check-out'
    }
  },

  wedding: {
    type: 'wedding',
    aliases: ['wedding planner', 'event planner', 'wedding venue', 'bridal'],
    keywords: ['wedding', 'bride', 'groom', 'ceremony', 'reception', 'venue', 'planner', 'bridal', 'engagement'],
    defaultPages: ['about', 'services', 'portfolio', 'contact'],
    optionalPages: ['pricing', 'blog', 'testimonials', 'gallery'],
    searchTerms: ['best wedding website design', 'wedding planner website examples', 'wedding venue website inspiration'],
    bookingType: 'consultation',
    bookingTerminology: {
      heading: 'Start Planning',
      subheading: 'Schedule your consultation',
      buttonText: 'Book Consultation',
      dateLabel: 'Preferred Date',
      timeLabel: 'Preferred Time'
    }
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Detect which pages should be created based on user prompt
 */
export function detectPagesFromPrompt(prompt: string): string[] {
  const promptLower = prompt.toLowerCase()
  const detectedPages: Set<string> = new Set()

  // Always include these core pages
  detectedPages.add('about')
  detectedPages.add('contact')

  // Check each page type config
  for (const [pageKey, config] of Object.entries(PAGE_TYPE_CONFIGS)) {
    // Skip about and contact as they're always included
    if (pageKey === 'about' || pageKey === 'contact') continue

    // Check trigger phrases (highest priority)
    for (const phrase of config.triggerPhrases) {
      if (promptLower.includes(phrase.toLowerCase())) {
        detectedPages.add(pageKey)
        break
      }
    }

    // Check trigger keywords
    if (!detectedPages.has(pageKey)) {
      for (const keyword of config.triggerKeywords) {
        if (promptLower.includes(keyword.toLowerCase())) {
          detectedPages.add(pageKey)
          break
        }
      }
    }

    // Check supporting keywords (need multiple matches)
    if (!detectedPages.has(pageKey)) {
      let matchCount = 0
      for (const keyword of config.supportingKeywords) {
        if (promptLower.includes(keyword.toLowerCase())) {
          matchCount++
        }
      }
      if (matchCount >= 3) {
        detectedPages.add(pageKey)
      }
    }
  }

  return Array.from(detectedPages)
}

/**
 * Detect business type from prompt
 */
export function detectBusinessType(prompt: string): string | null {
  const promptLower = prompt.toLowerCase()

  for (const [type, config] of Object.entries(BUSINESS_TYPE_CONFIGS)) {
    // Check aliases
    for (const alias of config.aliases) {
      if (promptLower.includes(alias.toLowerCase())) {
        return type
      }
    }

    // Check keywords
    let matchCount = 0
    for (const keyword of config.keywords) {
      if (promptLower.includes(keyword.toLowerCase())) {
        matchCount++
      }
    }
    if (matchCount >= 2) {
      return type
    }
  }

  return null
}

/**
 * Get search terms for competitor research
 */
export function getCompetitorSearchTerms(businessType: string, detectedPages: string[]): string[] {
  const searchTerms: string[] = []

  // Get business type search terms
  const businessConfig = BUSINESS_TYPE_CONFIGS[businessType]
  if (businessConfig) {
    searchTerms.push(...businessConfig.searchTerms)
  }

  // Get page-specific search terms
  for (const page of detectedPages) {
    const pageConfig = PAGE_TYPE_CONFIGS[page]
    if (pageConfig) {
      searchTerms.push(...pageConfig.searchTerms)
    }
  }

  // Remove duplicates and limit
  return [...new Set(searchTerms)].slice(0, 10)
}

/**
 * Get example sites for inspiration
 */
export function getExampleSites(businessType: string, detectedPages: string[]): string[] {
  const sites: string[] = []

  // Get page-specific example sites
  for (const page of detectedPages) {
    const pageConfig = PAGE_TYPE_CONFIGS[page]
    if (pageConfig && pageConfig.exampleSites) {
      sites.push(...pageConfig.exampleSites)
    }
  }

  // Remove duplicates and limit
  return [...new Set(sites)].slice(0, 15)
}

/**
 * Get booking configuration for a business type
 */
export function getBookingConfig(businessType: string): BusinessTypeConfig['bookingTerminology'] | null {
  const config = BUSINESS_TYPE_CONFIGS[businessType]
  return config?.bookingTerminology || null
}

/**
 * Get default pages for a business type
 */
export function getDefaultPages(businessType: string): string[] {
  const config = BUSINESS_TYPE_CONFIGS[businessType]
  return config?.defaultPages || ['about', 'contact']
}

/**
 * Get optional pages for a business type
 */
export function getOptionalPages(businessType: string): string[] {
  const config = BUSINESS_TYPE_CONFIGS[businessType]
  return config?.optionalPages || []
}

/**
 * Detect calculator type needed
 */
export function detectCalculatorType(prompt: string): 'loan' | 'mortgage' | 'roi' | 'savings' | 'quote' | null {
  const promptLower = prompt.toLowerCase()

  const calculatorPatterns: Record<string, string[]> = {
    loan: ['loan', 'lending', 'lender', 'personal loan', 'car loan', 'auto loan', 'business loan'],
    mortgage: ['mortgage', 'home loan', 'housing loan', 'property loan', 'real estate', 'realtor', 'home buying', 'refinance'],
    roi: ['investment', 'roi', 'return on investment', 'investor', 'portfolio', 'wealth management'],
    savings: ['savings', 'retirement', 'pension', '401k', 'ira', 'compound interest'],
    quote: ['insurance', 'quote', 'estimate', 'get a quote', 'instant quote']
  }

  for (const [type, patterns] of Object.entries(calculatorPatterns)) {
    for (const pattern of patterns) {
      if (promptLower.includes(pattern)) {
        return type as 'loan' | 'mortgage' | 'roi' | 'savings' | 'quote'
      }
    }
  }

  return null
}

/**
 * Get CTA text for a page type
 */
export function getPageCTA(pageSlug: string): { text: string; subtext: string } {
  const config = PAGE_TYPE_CONFIGS[pageSlug]
  if (config) {
    return { text: config.ctaText, subtext: config.ctaSubtext }
  }
  return { text: 'Learn More', subtext: 'Get started today' }
}
