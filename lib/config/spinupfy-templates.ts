/**
 * Spinupfy Templates
 *
 * Every scenario where someone needs a temporary, time-boxed one-page website.
 * Templates are organised by category, each with rich design system definitions,
 * AI prompt hints, section recommendations, and pricing rate multipliers.
 */

export type SpinupfyTemplateId =
  // Events & Entertainment
  | 'event_flyer'
  | 'concert_show'
  | 'party_invite'
  | 'wedding_rsvp'
  | 'festival'
  | 'sports_event'
  | 'art_exhibition'
  | 'graduation_celebration'
  // Real Estate & Property
  | 'real_estate_listing'
  | 'open_house'
  | 'new_development'
  | 'vacation_rental'
  // Sales & Commerce
  | 'flash_sale'
  | 'popup_store'
  | 'garage_sale'
  | 'holiday_sale'
  | 'clearance_sale'
  | 'market_stall'
  // Services & Booking
  | 'booking_page'
  | 'food_truck'
  | 'seasonal_service'
  | 'popup_restaurant'
  // Community & Causes
  | 'fundraiser'
  | 'community_event'
  | 'charity_drive'
  | 'job_listing'
  // Launches & Campaigns
  | 'product_launch'
  | 'coming_soon'
  | 'contest_giveaway'
  | 'election_campaign'
  | 'crowdfunding'

export type SpinupfyCategory =
  | 'Events & Entertainment'
  | 'Real Estate & Property'
  | 'Sales & Commerce'
  | 'Services & Booking'
  | 'Community & Causes'
  | 'Launches & Campaigns'

export interface SpinupfyTemplate {
  id: SpinupfyTemplateId
  category: SpinupfyCategory
  label: string
  tagline: string          // Short, punchy description shown in the picker
  emoji: string
  description: string      // Longer description for the wizard step

  /** Keywords that trigger auto-selection of this template */
  matchKeywords: string[]

  /** Typical duration patterns (in days) — used for suggestions */
  typicalDurations: number[]

  /** Daily rate multiplier relative to base (1.0 = default) */
  priceMultiplier: number

  design: {
    primaryColor: string   // Tailwind color name
    accentColor: string
    backgroundColor: string
    textColor: string
    mood: string           // e.g. "vibrant, energetic"
    style: string          // e.g. "bold typography, dark background"
    fontHeading: string
    fontBody: string
    primaryHex: string
    accentHex: string
  }

  /** Ordered list of sections to generate */
  sections: string[]

  /** System-level prompt context injected into AI when generating this template */
  aiPromptContext: string

  /** Placeholder values to pre-fill the wizard with */
  wizardDefaults: {
    headline: string
    subheadline: string
    ctaText: string
    ctaSecondaryText?: string
  }

  /** Urgency features to enable */
  features: {
    countdown: boolean        // countdown timer widget
    rsvpForm: boolean         // RSVP / signup form
    mapEmbed: boolean         // Google Maps embed
    productGrid: boolean      // Product / item grid
    contactForm: boolean
    gallery: boolean
    testimonials: boolean
    videoHero: boolean
    priceTag: boolean         // Show a big price / deal tag
    socialShare: boolean
  }
}

export const SPINUPFY_TEMPLATES: SpinupfyTemplate[] = [
  // ──────────────────────────────────────────────
  //  EVENTS & ENTERTAINMENT
  // ──────────────────────────────────────────────
  {
    id: 'event_flyer',
    category: 'Events & Entertainment',
    label: 'Event Flyer',
    tagline: 'Turn your event into a stunning digital flyer',
    emoji: '🎉',
    description: 'Perfect for any type of event announcement — from corporate functions to birthday parties. Looks incredible on mobile and gets shared on social media.',
    matchKeywords: ['event', 'flyer', 'announcement', 'invite', 'celebration', 'gathering', 'meetup', 'seminar', 'workshop', 'conference'],
    typicalDurations: [3, 7, 14],
    priceMultiplier: 1.0,
    design: {
      primaryColor: 'violet',
      accentColor: 'pink',
      backgroundColor: 'gray-950',
      textColor: 'white',
      mood: 'vibrant, electric, exciting',
      style: 'dark background, neon-accented typography, glowing effects, bold layout',
      fontHeading: 'Bebas Neue',
      fontBody: 'Inter',
      primaryHex: '#7C3AED',
      accentHex: '#EC4899',
    },
    sections: ['HERO_COUNTDOWN', 'EVENT_DETAILS', 'SPEAKERS_LINEUP', 'VENUE_MAP', 'RSVP_FORM', 'SHARE'],
    aiPromptContext: 'Create a high-energy, visually striking one-page event flyer. Use bold headlines, a prominent countdown timer, and clear event details. The design should feel exciting and shareable. Include a strong CTA to RSVP or buy tickets.',
    wizardDefaults: {
      headline: 'You\'re Invited!',
      subheadline: 'Join us for an unforgettable evening',
      ctaText: 'RSVP Now',
      ctaSecondaryText: 'Add to Calendar',
    },
    features: { countdown: true, rsvpForm: true, mapEmbed: true, productGrid: false, contactForm: false, gallery: false, testimonials: false, videoHero: false, priceTag: false, socialShare: true },
  },
  {
    id: 'concert_show',
    category: 'Events & Entertainment',
    label: 'Concert / Show',
    tagline: 'Sell out your show with a killer landing page',
    emoji: '🎸',
    description: 'A rock-star-worthy page for concerts, comedy nights, live performances, and shows. Includes ticket links, artist lineup, and venue info.',
    matchKeywords: ['concert', 'show', 'gig', 'live music', 'band', 'performance', 'comedy', 'theater', 'theatre', 'stand-up', 'dj', 'rave', 'nightclub'],
    typicalDurations: [7, 14, 21],
    priceMultiplier: 1.1,
    design: {
      primaryColor: 'red',
      accentColor: 'amber',
      backgroundColor: 'zinc-950',
      textColor: 'white',
      mood: 'raw, edgy, loud, energetic',
      style: 'gritty dark aesthetic, distressed textures, oversized typography, spotlight effects',
      fontHeading: 'Oswald',
      fontBody: 'Roboto',
      primaryHex: '#DC2626',
      accentHex: '#F59E0B',
    },
    sections: ['HERO_VIDEO', 'ARTIST_LINEUP', 'TICKET_CTA', 'VENUE_DETAILS', 'SETLIST_PREVIEW', 'SHARE'],
    aiPromptContext: 'Design a bold, high-contrast concert/show page. Think venue poster meets premium digital experience. Artist names should dominate the hero. Ticket purchase CTA must be prominent. Include venue details and a map.',
    wizardDefaults: {
      headline: 'Live This Saturday',
      subheadline: 'One night only — get your tickets before they\'re gone',
      ctaText: 'Get Tickets',
    },
    features: { countdown: true, rsvpForm: false, mapEmbed: true, productGrid: false, contactForm: false, gallery: true, testimonials: false, videoHero: true, priceTag: true, socialShare: true },
  },
  {
    id: 'party_invite',
    category: 'Events & Entertainment',
    label: 'Party Invitation',
    tagline: 'Digital party invite people will actually open',
    emoji: '🎂',
    description: 'A beautiful, shareable party invite page. Works for birthdays, anniversaries, baby showers, graduation parties, and more.',
    matchKeywords: ['party', 'birthday', 'anniversary', 'baby shower', 'bridal shower', 'graduation party', 'retirement party', 'house warming', 'housewarming', 'bachelorette', 'bachelor'],
    typicalDurations: [3, 7, 14],
    priceMultiplier: 0.9,
    design: {
      primaryColor: 'pink',
      accentColor: 'yellow',
      backgroundColor: 'white',
      textColor: 'gray-900',
      mood: 'joyful, celebratory, warm, fun',
      style: 'confetti elements, bright accents, playful typography, card-like layout',
      fontHeading: 'Playfair Display',
      fontBody: 'Lato',
      primaryHex: '#EC4899',
      accentHex: '#EAB308',
    },
    sections: ['HERO_INVITE', 'PARTY_DETAILS', 'RSVP_FORM', 'GIFT_REGISTRY', 'LOCATION_MAP', 'SHARE'],
    aiPromptContext: 'Create a warm, joyful party invitation page. Use celebratory colors and playful design elements. The hero should immediately convey who the celebration is for. Make the RSVP form simple and prominent.',
    wizardDefaults: {
      headline: 'Join the Celebration!',
      subheadline: 'Let\'s celebrate together',
      ctaText: 'RSVP Now',
    },
    features: { countdown: true, rsvpForm: true, mapEmbed: true, productGrid: false, contactForm: false, gallery: true, testimonials: false, videoHero: false, priceTag: false, socialShare: true },
  },
  {
    id: 'wedding_rsvp',
    category: 'Events & Entertainment',
    label: 'Wedding RSVP',
    tagline: 'An elegant wedding site for your special day',
    emoji: '💍',
    description: 'A timeless, elegant wedding website with RSVP, venue details, accommodation info, and your love story — all on one beautiful page.',
    matchKeywords: ['wedding', 'rsvp', 'bride', 'groom', 'nuptials', 'ceremony', 'reception', 'matrimony', 'engagement party'],
    typicalDurations: [30, 60, 90],
    priceMultiplier: 1.2,
    design: {
      primaryColor: 'stone',
      accentColor: 'rose',
      backgroundColor: 'white',
      textColor: 'stone-800',
      mood: 'elegant, romantic, timeless, sophisticated',
      style: 'delicate serif typography, floral motifs, cream and blush palette, minimalist luxury',
      fontHeading: 'Cormorant Garamond',
      fontBody: 'Raleway',
      primaryHex: '#78716C',
      accentHex: '#F43F5E',
    },
    sections: ['HERO_COUPLE', 'OUR_STORY', 'CEREMONY_DETAILS', 'RSVP_FORM', 'VENUE_MAP', 'ACCOMMODATION', 'GIFT_REGISTRY'],
    aiPromptContext: 'Design an elegant, romantic wedding RSVP page. Use a sophisticated color palette of cream, blush, and gold. Script and serif typography. Include couple\'s names prominently in the hero. The page should feel like a luxury invitation.',
    wizardDefaults: {
      headline: 'We\'re Getting Married!',
      subheadline: 'Please join us to celebrate our love',
      ctaText: 'RSVP',
      ctaSecondaryText: 'View Details',
    },
    features: { countdown: true, rsvpForm: true, mapEmbed: true, productGrid: false, contactForm: true, gallery: true, testimonials: false, videoHero: false, priceTag: false, socialShare: true },
  },
  {
    id: 'festival',
    category: 'Events & Entertainment',
    label: 'Festival',
    tagline: 'Epic festival page with full lineup & schedule',
    emoji: '🎪',
    description: 'A multi-day festival, fair, or expo landing page. Perfect for music festivals, food festivals, art fairs, trade shows, and cultural events.',
    matchKeywords: ['festival', 'fair', 'expo', 'trade show', 'market', 'fete', 'carnival', 'food festival', 'art fair', 'cultural event'],
    typicalDurations: [14, 30, 60],
    priceMultiplier: 1.2,
    design: {
      primaryColor: 'orange',
      accentColor: 'teal',
      backgroundColor: 'yellow-50',
      textColor: 'gray-900',
      mood: 'vibrant, inclusive, community-driven, colorful',
      style: 'bold color blocks, playful hand-drawn elements, energetic typography',
      fontHeading: 'Poppins',
      fontBody: 'Source Sans Pro',
      primaryHex: '#F97316',
      accentHex: '#14B8A6',
    },
    sections: ['HERO_FESTIVAL', 'LINEUP_SCHEDULE', 'TICKET_PACKAGES', 'VENUE_MAP', 'FAQ', 'RSVP_FORM', 'SPONSORS'],
    aiPromptContext: 'Create a vibrant, inclusive festival landing page. Multiple color bands across sections. A bold headline announcing the event name. Schedule/lineup as a key section. Ticket packages with clear pricing tiers. FAQ for logistics.',
    wizardDefaults: {
      headline: 'The Festival Everyone\'s Talking About',
      subheadline: 'Three days of music, food, and community',
      ctaText: 'Get Tickets',
      ctaSecondaryText: 'View Lineup',
    },
    features: { countdown: true, rsvpForm: true, mapEmbed: true, productGrid: true, contactForm: false, gallery: true, testimonials: true, videoHero: false, priceTag: true, socialShare: true },
  },
  {
    id: 'sports_event',
    category: 'Events & Entertainment',
    label: 'Sports Event',
    tagline: 'Rally your fans with a sports event page',
    emoji: '🏆',
    description: 'Tournament brackets, race registrations, league signups, charity runs, or local sports events. Gets fans hyped and registrations rolling.',
    matchKeywords: ['tournament', 'race', 'marathon', 'triathlon', 'league', 'championship', 'match', 'game', 'sports', 'charity run', '5k', '10k', 'competition', 'playoffs'],
    typicalDurations: [7, 14, 30],
    priceMultiplier: 1.0,
    design: {
      primaryColor: 'blue',
      accentColor: 'green',
      backgroundColor: 'slate-900',
      textColor: 'white',
      mood: 'competitive, energetic, athletic, bold',
      style: 'sports design language, diagonal cuts, stats-forward layout, team colors',
      fontHeading: 'Rajdhani',
      fontBody: 'Inter',
      primaryHex: '#3B82F6',
      accentHex: '#10B981',
    },
    sections: ['HERO_SPORT', 'EVENT_DETAILS', 'REGISTRATION_CTA', 'SCHEDULE_BRACKET', 'VENUE_MAP', 'SPONSORS'],
    aiPromptContext: 'Design a high-energy sports event page. Bold athlete imagery or sport illustrations. Key stats and event details prominently displayed. Registration CTA with deadline urgency. Sponsors section at the bottom.',
    wizardDefaults: {
      headline: 'Game On',
      subheadline: 'Register now — spots are filling fast',
      ctaText: 'Register Now',
    },
    features: { countdown: true, rsvpForm: true, mapEmbed: true, productGrid: false, contactForm: false, gallery: true, testimonials: false, videoHero: false, priceTag: true, socialShare: true },
  },
  {
    id: 'art_exhibition',
    category: 'Events & Entertainment',
    label: 'Art Exhibition',
    tagline: 'A gallery-worthy page for your show or exhibition',
    emoji: '🎨',
    description: 'Perfect for artists, galleries, photographers, and sculptors hosting a show. Showcases your work beautifully with exhibition details and viewing hours.',
    matchKeywords: ['art', 'exhibition', 'gallery', 'show', 'opening', 'vernissage', 'photography', 'sculpture', 'installation', 'pop-up gallery', 'artist'],
    typicalDurations: [7, 14, 21],
    priceMultiplier: 1.0,
    design: {
      primaryColor: 'gray',
      accentColor: 'amber',
      backgroundColor: 'white',
      textColor: 'gray-900',
      mood: 'refined, minimalist, artistic, contemplative',
      style: 'gallery white walls aesthetic, generous whitespace, artwork-first layout, editorial typography',
      fontHeading: 'DM Serif Display',
      fontBody: 'DM Sans',
      primaryHex: '#6B7280',
      accentHex: '#F59E0B',
    },
    sections: ['HERO_GALLERY', 'ARTIST_STATEMENT', 'EXHIBITION_DETAILS', 'ARTWORK_GRID', 'OPENING_HOURS', 'VENUE_MAP', 'CONTACT'],
    aiPromptContext: 'Design a refined, minimalist art exhibition page. The artwork should be front and center. Large, breathing whitespace. Artist name and exhibition title in elegant serif typography. Viewing hours and venue prominently listed.',
    wizardDefaults: {
      headline: 'Opening Night',
      subheadline: 'A curated exhibition of original works',
      ctaText: 'View the Collection',
      ctaSecondaryText: 'Plan Your Visit',
    },
    features: { countdown: true, rsvpForm: true, mapEmbed: true, productGrid: false, contactForm: true, gallery: true, testimonials: false, videoHero: false, priceTag: false, socialShare: true },
  },
  {
    id: 'graduation_celebration',
    category: 'Events & Entertainment',
    label: 'Graduation Celebration',
    tagline: 'Celebrate this milestone in style',
    emoji: '🎓',
    description: 'A beautiful celebration page for graduation parties, ceremonies, and reunions. Share the good news and invite loved ones.',
    matchKeywords: ['graduation', 'grad party', 'class reunion', 'prom', 'senior', 'commencement', 'diploma'],
    typicalDurations: [3, 7, 14],
    priceMultiplier: 0.9,
    design: {
      primaryColor: 'blue',
      accentColor: 'gold',
      backgroundColor: 'slate-900',
      textColor: 'white',
      mood: 'proud, celebratory, nostalgic, optimistic',
      style: 'academic elegance meets modern celebration, gold accents, dark navy base',
      fontHeading: 'Merriweather',
      fontBody: 'Open Sans',
      primaryHex: '#1E3A8A',
      accentHex: '#D97706',
    },
    sections: ['HERO_GRAD', 'GRADUATE_SPOTLIGHT', 'PARTY_DETAILS', 'RSVP_FORM', 'PHOTO_GALLERY', 'SHARE'],
    aiPromptContext: 'Create a warm, proud graduation celebration page. Feature the graduate prominently. Academic colors (navy, gold) with modern touches. Party details clear and inviting. A photo gallery section for milestone moments.',
    wizardDefaults: {
      headline: 'We Did It!',
      subheadline: 'Please join us to celebrate this milestone',
      ctaText: 'RSVP',
    },
    features: { countdown: true, rsvpForm: true, mapEmbed: true, productGrid: false, contactForm: false, gallery: true, testimonials: false, videoHero: false, priceTag: false, socialShare: true },
  },

  // ──────────────────────────────────────────────
  //  REAL ESTATE & PROPERTY
  // ──────────────────────────────────────────────
  {
    id: 'real_estate_listing',
    category: 'Real Estate & Property',
    label: 'Property Listing',
    tagline: 'Sell faster with a dedicated property showcase',
    emoji: '🏡',
    description: 'A premium standalone listing page for a single property. Photos, specs, neighbourhood info, and a direct contact form — built to convert buyers.',
    matchKeywords: ['real estate', 'property', 'house for sale', 'listing', 'home sale', 'condo', 'apartment', 'mls', 'realtor', 'agent', 'property for sale'],
    typicalDurations: [30, 60, 90],
    priceMultiplier: 1.8,
    design: {
      primaryColor: 'slate',
      accentColor: 'emerald',
      backgroundColor: 'white',
      textColor: 'gray-900',
      mood: 'trustworthy, premium, aspirational, clean',
      style: 'luxury real estate aesthetic, full-bleed photography, specification tables, neighborhood lifestyle imagery',
      fontHeading: 'Playfair Display',
      fontBody: 'Inter',
      primaryHex: '#475569',
      accentHex: '#10B981',
    },
    sections: ['HERO_PROPERTY', 'PHOTO_GALLERY', 'PROPERTY_SPECS', 'FLOOR_PLAN', 'NEIGHBOURHOOD', 'AGENT_CONTACT', 'MAP'],
    aiPromptContext: 'Create a premium real estate listing page. Lead with a stunning full-screen property hero image. Include a scrollable photo gallery, detailed specs table (beds/baths/sqft/parking), neighborhood highlights, and an agent contact form. The design should convey trust and aspirational lifestyle.',
    wizardDefaults: {
      headline: 'Your Dream Home Awaits',
      subheadline: 'Schedule a private viewing today',
      ctaText: 'Book a Viewing',
      ctaSecondaryText: 'Download Brochure',
    },
    features: { countdown: false, rsvpForm: false, mapEmbed: true, productGrid: false, contactForm: true, gallery: true, testimonials: true, videoHero: true, priceTag: true, socialShare: true },
  },
  {
    id: 'open_house',
    category: 'Real Estate & Property',
    label: 'Open House',
    tagline: 'Drive walk-ins with an open house promo page',
    emoji: '🔑',
    description: 'A time-sensitive open house page with date/time, property highlights, and a registration form. Creates urgency and captures buyer leads.',
    matchKeywords: ['open house', 'viewing', 'showing', 'inspection day', 'property tour'],
    typicalDurations: [3, 7, 14],
    priceMultiplier: 1.5,
    design: {
      primaryColor: 'cyan',
      accentColor: 'orange',
      backgroundColor: 'white',
      textColor: 'gray-900',
      mood: 'welcoming, professional, urgent, bright',
      style: 'modern real estate, split-screen layout, key property stats front-and-center',
      fontHeading: 'Montserrat',
      fontBody: 'Inter',
      primaryHex: '#0891B2',
      accentHex: '#EA580C',
    },
    sections: ['HERO_OPENHOUSE', 'DATE_TIME_HIGHLIGHT', 'PROPERTY_HIGHLIGHTS', 'PHOTO_GALLERY', 'REGISTER_FORM', 'AGENT_INFO', 'MAP'],
    aiPromptContext: 'Design a compelling open house page with a clear date/time banner in the hero. Property highlights in a scannable grid. A lead capture form to register for the open house. Agent profile with contact details.',
    wizardDefaults: {
      headline: 'Open House This Weekend',
      subheadline: 'Come explore this beautiful property',
      ctaText: 'Register to Attend',
    },
    features: { countdown: true, rsvpForm: true, mapEmbed: true, productGrid: false, contactForm: true, gallery: true, testimonials: false, videoHero: false, priceTag: true, socialShare: true },
  },
  {
    id: 'new_development',
    category: 'Real Estate & Property',
    label: 'New Development',
    tagline: 'Launch your development project pre-sales',
    emoji: '🏗️',
    description: 'A launch page for new condo, townhome, or housing developments. Collect pre-sale registrations and build waitlist excitement.',
    matchKeywords: ['new development', 'pre-sale', 'presale', 'new build', 'condo launch', 'pre-construction', 'off-plan'],
    typicalDurations: [60, 90, 180],
    priceMultiplier: 2.0,
    design: {
      primaryColor: 'slate',
      accentColor: 'gold',
      backgroundColor: 'slate-950',
      textColor: 'white',
      mood: 'premium, aspirational, exclusive, modern',
      style: 'architectural rendering aesthetic, dark luxury theme, floor plan focus, VIP register wall',
      fontHeading: 'Raleway',
      fontBody: 'Inter',
      primaryHex: '#1E293B',
      accentHex: '#D97706',
    },
    sections: ['HERO_DEVELOPMENT', 'UNIT_TYPES', 'FEATURES_AMENITIES', 'FLOOR_PLANS', 'LOCATION', 'REGISTER_INTEREST', 'MAP'],
    aiPromptContext: 'Create a premium new real estate development landing page. Architectural renderings as hero. Unit types and starting prices. Amenities in an icon grid. Floor plan previews. VIP early registration form with exclusivity messaging.',
    wizardDefaults: {
      headline: 'Introducing a New Vision of Living',
      subheadline: 'Register now for VIP priority access',
      ctaText: 'Register Interest',
    },
    features: { countdown: true, rsvpForm: true, mapEmbed: true, productGrid: true, contactForm: true, gallery: true, testimonials: false, videoHero: true, priceTag: true, socialShare: true },
  },
  {
    id: 'vacation_rental',
    category: 'Real Estate & Property',
    label: 'Vacation Rental',
    tagline: 'Book out your property with a direct booking page',
    emoji: '🌴',
    description: 'A standalone booking page for Airbnb-style vacation rentals. Show off your property and capture direct bookings without platform fees.',
    matchKeywords: ['vacation rental', 'airbnb', 'vrbo', 'holiday let', 'short-term rental', 'cabin', 'beach house', 'cottage'],
    typicalDurations: [30, 60, 90],
    priceMultiplier: 1.5,
    design: {
      primaryColor: 'teal',
      accentColor: 'orange',
      backgroundColor: 'white',
      textColor: 'gray-900',
      mood: 'relaxed, inviting, aspirational, tropical',
      style: 'airbnb-inspired clean layout, lifestyle photography, amenity icons, review stars',
      fontHeading: 'Nunito',
      fontBody: 'Inter',
      primaryHex: '#0D9488',
      accentHex: '#EA580C',
    },
    sections: ['HERO_RENTAL', 'PHOTO_GALLERY', 'PROPERTY_HIGHLIGHTS', 'AMENITIES', 'BOOKING_FORM', 'REVIEWS', 'MAP'],
    aiPromptContext: 'Design a beautiful vacation rental page. Full-bleed hero with the property at its best. Photo gallery with multiple rooms. Amenities in icon grid. A booking/inquiry form with check-in/check-out dates. Guest reviews section.',
    wizardDefaults: {
      headline: 'Your Home Away from Home',
      subheadline: 'Book directly and save',
      ctaText: 'Check Availability',
    },
    features: { countdown: false, rsvpForm: false, mapEmbed: true, productGrid: false, contactForm: true, gallery: true, testimonials: true, videoHero: false, priceTag: true, socialShare: true },
  },

  // ──────────────────────────────────────────────
  //  SALES & COMMERCE
  // ──────────────────────────────────────────────
  {
    id: 'flash_sale',
    category: 'Sales & Commerce',
    label: 'Flash Sale',
    tagline: 'Limited-time deals that drive instant action',
    emoji: '⚡',
    description: 'A high-urgency flash sale page with countdown timer, featured deals, and frictionless checkout links. Works for any industry.',
    matchKeywords: ['flash sale', 'deal', 'limited time', 'discount', 'sale', 'offer', 'black friday', 'cyber monday', 'weekend sale', 'one day sale', '24 hour'],
    typicalDurations: [1, 3, 7],
    priceMultiplier: 1.3,
    design: {
      primaryColor: 'red',
      accentColor: 'yellow',
      backgroundColor: 'red-950',
      textColor: 'white',
      mood: 'urgent, high-energy, aggressive, exciting',
      style: 'sale-tag design language, bold price callouts, countdown timer dominant, dark red urgency',
      fontHeading: 'Black Han Sans',
      fontBody: 'Inter',
      primaryHex: '#DC2626',
      accentHex: '#EAB308',
    },
    sections: ['HERO_SALE_COUNTDOWN', 'FEATURED_DEALS', 'PRODUCT_GRID', 'URGENCY_STRIP', 'TERMS', 'CTA_FINAL'],
    aiPromptContext: 'Design an aggressive, high-urgency flash sale page. The countdown timer should dominate the hero. Bold red and yellow color scheme. Price comparisons showing discount amounts. Product grid with strikethrough original prices. A sticky "Shop Now" CTA.',
    wizardDefaults: {
      headline: 'FLASH SALE — Ends Tonight!',
      subheadline: 'Up to 70% off — while supplies last',
      ctaText: 'Shop Now',
    },
    features: { countdown: true, rsvpForm: false, mapEmbed: false, productGrid: true, contactForm: false, gallery: true, testimonials: false, videoHero: false, priceTag: true, socialShare: true },
  },
  {
    id: 'popup_store',
    category: 'Sales & Commerce',
    label: 'Pop-Up Store',
    tagline: 'Launch your temporary shop in minutes',
    emoji: '🏪',
    description: 'A complete pop-up shop landing page for your temporary retail location, online store, or limited collection. Includes product display and purchase links.',
    matchKeywords: ['popup store', 'pop up', 'pop-up shop', 'temporary store', 'limited collection', 'drop', 'limited release', 'trunk show'],
    typicalDurations: [7, 14, 30],
    priceMultiplier: 1.5,
    design: {
      primaryColor: 'indigo',
      accentColor: 'cyan',
      backgroundColor: 'white',
      textColor: 'gray-900',
      mood: 'modern, curated, exclusive, boutique',
      style: 'editorial retail aesthetic, clean product grid, lifestyle photography, brand story strip',
      fontHeading: 'Barlow Condensed',
      fontBody: 'Inter',
      primaryHex: '#4F46E5',
      accentHex: '#06B6D4',
    },
    sections: ['HERO_STORE', 'BRAND_STORY', 'PRODUCT_GRID', 'STORE_DETAILS', 'HOURS_LOCATION', 'SOCIAL_CTA'],
    aiPromptContext: 'Create a stylish pop-up store landing page. Brand story in a compelling hero. Product grid with pricing. Store location, hours, and directions. A "Follow us" social media strip. Exclusivity messaging throughout.',
    wizardDefaults: {
      headline: 'Open for a Limited Time',
      subheadline: 'Discover our exclusive collection',
      ctaText: 'Shop the Collection',
    },
    features: { countdown: true, rsvpForm: false, mapEmbed: true, productGrid: true, contactForm: false, gallery: true, testimonials: true, videoHero: false, priceTag: true, socialShare: true },
  },
  {
    id: 'garage_sale',
    category: 'Sales & Commerce',
    label: 'Garage / Yard Sale',
    tagline: 'Get more shoppers to your door',
    emoji: '🏷️',
    description: 'A simple, friendly page for garage sales, estate sales, moving sales, and yard sales. Share what\'s for sale and drive local traffic.',
    matchKeywords: ['garage sale', 'yard sale', 'estate sale', 'moving sale', 'rummage sale', 'jumble sale', 'car boot'],
    typicalDurations: [1, 3, 7],
    priceMultiplier: 0.7,
    design: {
      primaryColor: 'amber',
      accentColor: 'green',
      backgroundColor: 'yellow-50',
      textColor: 'gray-900',
      mood: 'friendly, casual, neighbourhood, cheerful',
      style: 'homey, hand-written font accents, photo-forward, friendly pricing tags',
      fontHeading: 'Pacifico',
      fontBody: 'Lato',
      primaryHex: '#D97706',
      accentHex: '#16A34A',
    },
    sections: ['HERO_SALE', 'ITEMS_PREVIEW', 'DATE_TIME_LOCATION', 'DIRECTIONS_MAP', 'CONTACT_SELLER'],
    aiPromptContext: 'Design a warm, inviting garage sale page. Friendly headline. Preview of items being sold in a photo grid. Clear date, time, and location details with a map embed. A "Contact the seller" form for pre-inquiries.',
    wizardDefaults: {
      headline: 'Big Garage Sale This Weekend!',
      subheadline: 'Furniture, electronics, clothes & more — all must go!',
      ctaText: 'Get Directions',
    },
    features: { countdown: true, rsvpForm: false, mapEmbed: true, productGrid: true, contactForm: true, gallery: true, testimonials: false, videoHero: false, priceTag: true, socialShare: true },
  },
  {
    id: 'holiday_sale',
    category: 'Sales & Commerce',
    label: 'Holiday Sale',
    tagline: 'Capture the holiday shopping rush',
    emoji: '🎄',
    description: 'A festive, conversion-optimised sale page for Christmas, Valentine\'s Day, Mother\'s Day, Thanksgiving, and every other shopping holiday.',
    matchKeywords: ['christmas sale', 'holiday sale', "valentine's", 'black friday', 'cyber monday', "mother's day", "father's day", 'thanksgiving', 'eid', 'diwali', 'hanukkah', 'new year sale'],
    typicalDurations: [7, 14, 30],
    priceMultiplier: 1.2,
    design: {
      primaryColor: 'red',
      accentColor: 'green',
      backgroundColor: 'white',
      textColor: 'gray-900',
      mood: 'festive, warm, joyful, gift-giving',
      style: 'holiday retail design, warm color palette, gift-tag elements, seasonal imagery',
      fontHeading: 'Josefin Sans',
      fontBody: 'Open Sans',
      primaryHex: '#DC2626',
      accentHex: '#16A34A',
    },
    sections: ['HERO_HOLIDAY', 'FEATURED_GIFTS', 'PRODUCT_GRID', 'SHIPPING_DEADLINE', 'CTA_FINAL'],
    aiPromptContext: 'Create a festive holiday sale page. Season-appropriate hero imagery. Featured gift guides. Product grid with holiday pricing. Shipping deadline countdown. "Shop the collection" CTA.',
    wizardDefaults: {
      headline: 'Give the Gift of Savings',
      subheadline: 'Our biggest holiday sale ever',
      ctaText: 'Shop Holiday Deals',
    },
    features: { countdown: true, rsvpForm: false, mapEmbed: false, productGrid: true, contactForm: false, gallery: true, testimonials: false, videoHero: false, priceTag: true, socialShare: true },
  },
  {
    id: 'clearance_sale',
    category: 'Sales & Commerce',
    label: 'Clearance Sale',
    tagline: 'Move old inventory fast with a clearance page',
    emoji: '🔖',
    description: 'A no-nonsense clearance page for end-of-season or end-of-line stock. High urgency, straightforward deals, focused conversion.',
    matchKeywords: ['clearance', 'liquidation', 'end of season', 'going out of business', 'closeout', 'stock clearance', 'inventory reduction'],
    typicalDurations: [3, 7, 14],
    priceMultiplier: 1.0,
    design: {
      primaryColor: 'orange',
      accentColor: 'slate',
      backgroundColor: 'orange-50',
      textColor: 'gray-900',
      mood: 'urgent, deal-focused, no-frills, action-oriented',
      style: 'warehouse sale aesthetic, bold price tags, high contrast, minimal decoration',
      fontHeading: 'Oswald',
      fontBody: 'Inter',
      primaryHex: '#EA580C',
      accentHex: '#64748B',
    },
    sections: ['HERO_CLEARANCE', 'DEAL_HIGHLIGHTS', 'PRODUCT_GRID', 'URGENCY_BAR', 'TERMS'],
    aiPromptContext: 'Design a high-urgency clearance sale page. Industrial/warehouse aesthetic. Massive bold price callouts. Items in a dense grid. Stock levels or quantity limited messages. No-frills but highly effective conversion design.',
    wizardDefaults: {
      headline: 'Final Clearance — Everything Must Go',
      subheadline: 'Up to 80% off — limited quantities available',
      ctaText: 'Shop Clearance',
    },
    features: { countdown: true, rsvpForm: false, mapEmbed: false, productGrid: true, contactForm: false, gallery: true, testimonials: false, videoHero: false, priceTag: true, socialShare: true },
  },
  {
    id: 'market_stall',
    category: 'Sales & Commerce',
    label: 'Market Stall',
    tagline: 'Tell your story and drive customers to your stall',
    emoji: '🛒',
    description: 'A page for market stalls, craft fair vendors, farmers market sellers, and flea market traders. Share your story, products, and where to find you.',
    matchKeywords: ['market stall', 'craft fair', 'farmers market', 'flea market', 'artisan market', 'vendor', 'hawker', 'stall'],
    typicalDurations: [1, 3, 7],
    priceMultiplier: 0.8,
    design: {
      primaryColor: 'green',
      accentColor: 'brown',
      backgroundColor: 'green-50',
      textColor: 'gray-900',
      mood: 'artisan, earthy, handcrafted, community',
      style: 'maker/artisan aesthetic, natural textures, warm photography, craft-fair charm',
      fontHeading: 'Libre Baskerville',
      fontBody: 'Open Sans',
      primaryHex: '#16A34A',
      accentHex: '#92400E',
    },
    sections: ['HERO_MAKER', 'MY_STORY', 'PRODUCTS_SHOWCASE', 'WHERE_TO_FIND_ME', 'CONTACT'],
    aiPromptContext: 'Design a warm, artisan market stall page. Maker story in the hero. Handcrafted product showcase. Where to find the stall (market name, dates, location). Contact for custom orders.',
    wizardDefaults: {
      headline: 'Handcrafted with Love',
      subheadline: 'Find us at the market this weekend',
      ctaText: 'See What\'s New',
    },
    features: { countdown: false, rsvpForm: false, mapEmbed: true, productGrid: true, contactForm: true, gallery: true, testimonials: true, videoHero: false, priceTag: true, socialShare: true },
  },

  // ──────────────────────────────────────────────
  //  SERVICES & BOOKING
  // ──────────────────────────────────────────────
  {
    id: 'booking_page',
    category: 'Services & Booking',
    label: 'Booking Page',
    tagline: 'Fill your calendar with a professional booking page',
    emoji: '📅',
    description: 'A polished booking page for any service provider — from photographers to cleaners to personal trainers. Shows your services, availability, and lets clients book online.',
    matchKeywords: ['booking', 'appointment', 'schedule', 'reserve', 'hire', 'photography', 'cleaning', 'personal trainer', 'massage', 'coach', 'tutoring', 'consultant'],
    typicalDurations: [30, 60, 90],
    priceMultiplier: 1.2,
    design: {
      primaryColor: 'blue',
      accentColor: 'teal',
      backgroundColor: 'white',
      textColor: 'gray-900',
      mood: 'professional, trustworthy, clean, approachable',
      style: 'service business design, testimonial-forward, booking widget prominence, professional headshots',
      fontHeading: 'Nunito Sans',
      fontBody: 'Inter',
      primaryHex: '#2563EB',
      accentHex: '#0D9488',
    },
    sections: ['HERO_SERVICE', 'SERVICES_LIST', 'HOW_IT_WORKS', 'TESTIMONIALS', 'BOOKING_FORM', 'FAQ', 'CONTACT'],
    aiPromptContext: 'Create a professional service booking page. Hero introduces the service provider. Services listed with pricing. "How it works" in 3 steps. Client testimonials. A prominent booking/contact form. FAQ for common questions.',
    wizardDefaults: {
      headline: 'Book Your Appointment Today',
      subheadline: 'Professional service tailored to your needs',
      ctaText: 'Book Now',
      ctaSecondaryText: 'View Services',
    },
    features: { countdown: false, rsvpForm: false, mapEmbed: true, productGrid: false, contactForm: true, gallery: true, testimonials: true, videoHero: false, priceTag: true, socialShare: false },
  },
  {
    id: 'food_truck',
    category: 'Services & Booking',
    label: 'Food Truck',
    tagline: 'Tell hungry customers where to find you',
    emoji: '🚚',
    description: 'A mouthwatering page for food trucks, pop-up restaurants, and mobile caterers. Weekly schedule, menu highlights, and where to find you.',
    matchKeywords: ['food truck', 'mobile restaurant', 'pop-up restaurant', 'catering', 'food cart', 'street food', 'mobile kitchen'],
    typicalDurations: [7, 14, 30],
    priceMultiplier: 1.0,
    design: {
      primaryColor: 'orange',
      accentColor: 'yellow',
      backgroundColor: 'gray-950',
      textColor: 'white',
      mood: 'appetizing, fun, street-food culture, vibrant',
      style: 'bold food truck aesthetic, chalkboard elements, vibrant food photography, schedule-forward',
      fontHeading: 'Alfa Slab One',
      fontBody: 'Roboto',
      primaryHex: '#EA580C',
      accentHex: '#EAB308',
    },
    sections: ['HERO_MENU', 'WEEKLY_SCHEDULE', 'MENU_HIGHLIGHTS', 'ABOUT_US', 'FIND_US_MAP', 'CATERING_CTA'],
    aiPromptContext: 'Create an appetizing food truck page. Bold food photography hero. Weekly schedule of locations. Menu highlights with prices. Map of usual spots. Catering booking CTA.',
    wizardDefaults: {
      headline: 'Find Us on the Street!',
      subheadline: 'Freshly made food wherever you are',
      ctaText: 'See This Week\'s Schedule',
    },
    features: { countdown: false, rsvpForm: false, mapEmbed: true, productGrid: true, contactForm: true, gallery: true, testimonials: true, videoHero: false, priceTag: true, socialShare: true },
  },
  {
    id: 'seasonal_service',
    category: 'Services & Booking',
    label: 'Seasonal Service',
    tagline: 'Capture leads for your seasonal business',
    emoji: '🌱',
    description: 'Perfect for seasonal businesses — lawn care, snow removal, holiday decorating, summer camps, tax preparation, and more. Capture leads before the rush.',
    matchKeywords: ['lawn care', 'snow removal', 'holiday decorating', 'summer camp', 'seasonal', 'tax preparation', 'christmas lights', 'pool opening', 'gutter cleaning'],
    typicalDurations: [30, 60, 90],
    priceMultiplier: 1.1,
    design: {
      primaryColor: 'green',
      accentColor: 'sky',
      backgroundColor: 'white',
      textColor: 'gray-900',
      mood: 'reliable, seasonal, community, outdoors',
      style: 'service company branding, seasonal imagery, trust signals, before/after or checklist layout',
      fontHeading: 'Raleway',
      fontBody: 'Open Sans',
      primaryHex: '#16A34A',
      accentHex: '#0EA5E9',
    },
    sections: ['HERO_SEASON', 'SERVICES', 'WHY_CHOOSE_US', 'TESTIMONIALS', 'BOOKING_FORM', 'SERVICE_AREA', 'FAQ'],
    aiPromptContext: 'Design a seasonal service business page. Seasonal-appropriate hero imagery. Services with a checklist or icon grid. Trust signals (years in business, reviews). Booking/estimate request form. Service area map.',
    wizardDefaults: {
      headline: 'Ready for This Season?',
      subheadline: 'Book early — slots fill up fast',
      ctaText: 'Get a Free Quote',
    },
    features: { countdown: false, rsvpForm: false, mapEmbed: true, productGrid: false, contactForm: true, gallery: true, testimonials: true, videoHero: false, priceTag: true, socialShare: false },
  },
  {
    id: 'popup_restaurant',
    category: 'Services & Booking',
    label: 'Pop-Up Restaurant',
    tagline: 'Build buzz for your exclusive dining experience',
    emoji: '🍽️',
    description: 'An exclusive dining event landing page — supper clubs, chef\'s table pop-ups, underground dinners. Creates mystique and drives reservations.',
    matchKeywords: ['supper club', 'chef table', 'pop up restaurant', 'pop-up dinner', 'underground dinner', 'private dining', 'exclusive dining', 'guest chef'],
    typicalDurations: [7, 14, 30],
    priceMultiplier: 1.4,
    design: {
      primaryColor: 'stone',
      accentColor: 'amber',
      backgroundColor: 'stone-950',
      textColor: 'white',
      mood: 'exclusive, sophisticated, gastronomic, intimate',
      style: 'dark luxury dining aesthetic, food as art photography, candlelit atmosphere, intimate typography',
      fontHeading: 'Cormorant Garamond',
      fontBody: 'Lato',
      primaryHex: '#78716C',
      accentHex: '#B45309',
    },
    sections: ['HERO_DINING', 'CHEF_STORY', 'MENU_PREVIEW', 'EXPERIENCE_DETAILS', 'RESERVATION_FORM', 'PAST_EVENTS_GALLERY'],
    aiPromptContext: 'Design an intimate, exclusive pop-up restaurant page. Dark, moody aesthetic. Chef biography with professional photo. Menu preview with descriptions. Experience details (seating times, dress code). Reservation form with date picker.',
    wizardDefaults: {
      headline: 'An Evening to Remember',
      subheadline: 'Reserve your seat at our exclusive dining experience',
      ctaText: 'Reserve Your Seat',
    },
    features: { countdown: true, rsvpForm: true, mapEmbed: true, productGrid: false, contactForm: true, gallery: true, testimonials: true, videoHero: false, priceTag: true, socialShare: true },
  },

  // ──────────────────────────────────────────────
  //  COMMUNITY & CAUSES
  // ──────────────────────────────────────────────
  {
    id: 'fundraiser',
    category: 'Community & Causes',
    label: 'Fundraiser',
    tagline: 'Rally support for your cause',
    emoji: '❤️',
    description: 'A compelling fundraiser page for any cause — medical bills, community projects, school programs, disaster relief, or personal emergencies.',
    matchKeywords: ['fundraiser', 'fundraising', 'donation', 'gofundme', 'crowdfund', 'cause', 'campaign', 'help', 'support', 'medical fund'],
    typicalDurations: [14, 30, 60],
    priceMultiplier: 0.8,
    design: {
      primaryColor: 'rose',
      accentColor: 'orange',
      backgroundColor: 'white',
      textColor: 'gray-900',
      mood: 'compassionate, urgent, hopeful, genuine',
      style: 'cause-driven storytelling, progress bar prominent, emotional imagery, clear donation CTA',
      fontHeading: 'Merriweather',
      fontBody: 'Inter',
      primaryHex: '#E11D48',
      accentHex: '#EA580C',
    },
    sections: ['HERO_CAUSE', 'THE_STORY', 'FUNDRAISING_GOAL', 'HOW_FUNDS_USED', 'DONATION_CTA', 'UPDATES', 'SHARE'],
    aiPromptContext: 'Create a heartfelt fundraiser page. Tell the story compellingly and with emotion in the hero section. A progress bar showing funds raised vs goal. Clear breakdown of how funds will be used. Multiple donation amounts as buttons. Social sharing encouragement.',
    wizardDefaults: {
      headline: 'Help Us Make a Difference',
      subheadline: 'Every contribution brings us closer to our goal',
      ctaText: 'Donate Now',
      ctaSecondaryText: 'Share This',
    },
    features: { countdown: false, rsvpForm: false, mapEmbed: false, productGrid: false, contactForm: true, gallery: true, testimonials: true, videoHero: false, priceTag: true, socialShare: true },
  },
  {
    id: 'community_event',
    category: 'Community & Causes',
    label: 'Community Event',
    tagline: 'Bring your community together',
    emoji: '🤝',
    description: 'A welcoming page for neighbourhood block parties, community clean-ups, school fairs, HOA events, and local gatherings.',
    matchKeywords: ['block party', 'neighborhood', 'community', 'school fair', 'HOA', 'local event', 'cleanup', 'neighbourhood watch', 'street party'],
    typicalDurations: [7, 14, 21],
    priceMultiplier: 0.8,
    design: {
      primaryColor: 'green',
      accentColor: 'blue',
      backgroundColor: 'white',
      textColor: 'gray-900',
      mood: 'welcoming, inclusive, community-focused, bright',
      style: 'friendly neighborhood aesthetic, illustrative elements, approachable typography',
      fontHeading: 'Nunito',
      fontBody: 'Open Sans',
      primaryHex: '#16A34A',
      accentHex: '#2563EB',
    },
    sections: ['HERO_COMMUNITY', 'ABOUT_THE_EVENT', 'ACTIVITIES_SCHEDULE', 'VOLUNTEER_SIGNUP', 'LOCATION_MAP', 'CONTACT'],
    aiPromptContext: 'Design a friendly, welcoming community event page. Illustrative or warm photographic hero. Event activities in a fun schedule layout. Volunteer signup form. Location with map. Organiser contact info.',
    wizardDefaults: {
      headline: 'Everyone\'s Invited!',
      subheadline: 'Join your neighbours for a great time',
      ctaText: 'Count Me In',
    },
    features: { countdown: true, rsvpForm: true, mapEmbed: true, productGrid: false, contactForm: true, gallery: false, testimonials: false, videoHero: false, priceTag: false, socialShare: true },
  },
  {
    id: 'charity_drive',
    category: 'Community & Causes',
    label: 'Charity Drive',
    tagline: 'Collect donations or goods for a worthy cause',
    emoji: '🎁',
    description: 'A professional charity page for donation drives, food drives, toy drives, and organised giving campaigns.',
    matchKeywords: ['charity', 'toy drive', 'food drive', 'clothing drive', 'donation drive', 'nonprofit', 'giving', 'philanthropy'],
    typicalDurations: [14, 30, 60],
    priceMultiplier: 0.7,
    design: {
      primaryColor: 'blue',
      accentColor: 'gold',
      backgroundColor: 'white',
      textColor: 'gray-900',
      mood: 'trustworthy, hopeful, professional, giving',
      style: 'non-profit design language, impact statistics, progress bars, testimonials from beneficiaries',
      fontHeading: 'Source Serif Pro',
      fontBody: 'Inter',
      primaryHex: '#1D4ED8',
      accentHex: '#D97706',
    },
    sections: ['HERO_CHARITY', 'IMPACT_STATS', 'HOW_TO_HELP', 'DONATION_DRIVE', 'TESTIMONIALS', 'SHARE'],
    aiPromptContext: 'Create a professional charity drive page. Impact statistics (items collected, people helped). Multiple ways to help (donate, volunteer, spread the word). Progress toward goal. Testimonials from beneficiaries or volunteers.',
    wizardDefaults: {
      headline: 'Together We Can Do More',
      subheadline: 'Your contribution makes a real difference',
      ctaText: 'Donate Now',
      ctaSecondaryText: 'Other Ways to Help',
    },
    features: { countdown: true, rsvpForm: false, mapEmbed: false, productGrid: false, contactForm: true, gallery: true, testimonials: true, videoHero: false, priceTag: false, socialShare: true },
  },
  {
    id: 'job_listing',
    category: 'Community & Causes',
    label: 'Job Listing / Hiring',
    tagline: 'Attract the best candidates with a dedicated hiring page',
    emoji: '💼',
    description: 'A professional hiring page for seasonal jobs, specific roles, or urgent staffing needs. Outperforms generic job board posts.',
    matchKeywords: ['hiring', 'job listing', 'job posting', 'now hiring', 'careers', 'job opening', 'vacancy', 'seasonal job', 'job ad'],
    typicalDurations: [14, 30, 60],
    priceMultiplier: 1.0,
    design: {
      primaryColor: 'blue',
      accentColor: 'cyan',
      backgroundColor: 'white',
      textColor: 'gray-900',
      mood: 'professional, welcoming, ambitious, corporate',
      style: 'HR/recruitment design language, company culture imagery, benefit icons, application CTA',
      fontHeading: 'IBM Plex Sans',
      fontBody: 'Inter',
      primaryHex: '#1D4ED8',
      accentHex: '#0891B2',
    },
    sections: ['HERO_HIRING', 'ABOUT_THE_ROLE', 'REQUIREMENTS', 'BENEFITS_PERKS', 'ABOUT_COMPANY', 'APPLY_FORM'],
    aiPromptContext: 'Design a professional job listing page. Company culture hero. Clear role description. Requirements in a bullet checklist. Benefits and perks in an icon grid. About the company section. Easy application form or link.',
    wizardDefaults: {
      headline: 'We\'re Hiring — Join Our Team',
      subheadline: 'Exciting opportunity for talented individuals',
      ctaText: 'Apply Now',
    },
    features: { countdown: true, rsvpForm: false, mapEmbed: false, productGrid: false, contactForm: true, gallery: true, testimonials: true, videoHero: false, priceTag: false, socialShare: true },
  },

  // ──────────────────────────────────────────────
  //  LAUNCHES & CAMPAIGNS
  // ──────────────────────────────────────────────
  {
    id: 'product_launch',
    category: 'Launches & Campaigns',
    label: 'Product Launch',
    tagline: 'Build hype and convert on day one',
    emoji: '🚀',
    description: 'A high-impact product launch page that builds hype, captures pre-orders, and converts on launch day. Built for physical products, apps, and services.',
    matchKeywords: ['product launch', 'launch', 'new product', 'release', 'debut', 'reveal', 'drop', 'new release', 'pre-order', 'pre order'],
    typicalDurations: [7, 14, 30],
    priceMultiplier: 1.6,
    design: {
      primaryColor: 'blue',
      accentColor: 'violet',
      backgroundColor: 'slate-950',
      textColor: 'white',
      mood: 'exciting, premium, futuristic, build-up',
      style: 'Apple-inspired product launch aesthetic, full-screen product imagery, feature breakdown, bold headlines',
      fontHeading: 'SF Pro Display (San Francisco)',
      fontBody: 'Inter',
      primaryHex: '#3B82F6',
      accentHex: '#7C3AED',
    },
    sections: ['HERO_LAUNCH', 'PRODUCT_FEATURES', 'HOW_IT_WORKS', 'SOCIAL_PROOF', 'PREORDER_CTA', 'FAQ'],
    aiPromptContext: 'Create a premium product launch page. Full-screen hero with a dramatic product reveal. Key features in a scrolling layout (feature + visual pairs). Social proof / beta testimonials. A prominent pre-order or "Buy Now" CTA. FAQ for common questions.',
    wizardDefaults: {
      headline: 'Something New is Coming',
      subheadline: 'The product that changes everything',
      ctaText: 'Pre-Order Now',
      ctaSecondaryText: 'Learn More',
    },
    features: { countdown: true, rsvpForm: false, mapEmbed: false, productGrid: false, contactForm: false, gallery: true, testimonials: true, videoHero: true, priceTag: true, socialShare: true },
  },
  {
    id: 'coming_soon',
    category: 'Launches & Campaigns',
    label: 'Coming Soon',
    tagline: 'Build your waitlist before you launch',
    emoji: '⏳',
    description: 'A sleek "coming soon" page to build anticipation and capture emails before your product, service, or brand officially launches.',
    matchKeywords: ['coming soon', 'launching soon', 'waitlist', 'notify me', 'early access', 'countdown', 'preview', 'teaser'],
    typicalDurations: [7, 14, 30, 60],
    priceMultiplier: 1.0,
    design: {
      primaryColor: 'indigo',
      accentColor: 'cyan',
      backgroundColor: 'slate-950',
      textColor: 'white',
      mood: 'mysterious, anticipatory, exclusive, sleek',
      style: 'minimal dark design, large countdown, single email capture CTA, brand logo prominent',
      fontHeading: 'Space Grotesk',
      fontBody: 'Inter',
      primaryHex: '#4F46E5',
      accentHex: '#06B6D4',
    },
    sections: ['HERO_COMING_SOON_COUNTDOWN', 'BRIEF_TEASER', 'EMAIL_SIGNUP', 'SOCIAL_LINKS'],
    aiPromptContext: 'Design an elegant coming soon page. Minimal layout. Large countdown timer. A brief teaser about what\'s coming. An email signup form with a compelling reason to join the waitlist. Social media links.',
    wizardDefaults: {
      headline: 'Something Big is Coming',
      subheadline: 'Be the first to know when we launch',
      ctaText: 'Notify Me',
    },
    features: { countdown: true, rsvpForm: true, mapEmbed: false, productGrid: false, contactForm: false, gallery: false, testimonials: false, videoHero: false, priceTag: false, socialShare: true },
  },
  {
    id: 'contest_giveaway',
    category: 'Launches & Campaigns',
    label: 'Contest / Giveaway',
    tagline: 'Run a viral giveaway that grows your audience',
    emoji: '🏅',
    description: 'A fun, shareable contest or giveaway page. Collect entries, explain prizes, and create viral sharing loops to grow your audience fast.',
    matchKeywords: ['giveaway', 'contest', 'sweepstakes', 'competition', 'win', 'prize', 'raffle', 'draw'],
    typicalDurations: [7, 14, 21],
    priceMultiplier: 1.0,
    design: {
      primaryColor: 'yellow',
      accentColor: 'purple',
      backgroundColor: 'yellow-50',
      textColor: 'gray-900',
      mood: 'exciting, fun, exclusive, viral',
      style: 'prize-showcase design, trophy/ribbon elements, entry form prominent, share mechanics visible',
      fontHeading: 'Poppins',
      fontBody: 'Inter',
      primaryHex: '#CA8A04',
      accentHex: '#7C3AED',
    },
    sections: ['HERO_PRIZE', 'HOW_TO_ENTER', 'PRIZE_DETAILS', 'ENTRY_FORM', 'TERMS', 'SHARE_TO_WIN'],
    aiPromptContext: 'Create an exciting contest/giveaway page. Prize prominently displayed in the hero. Clear entry instructions. Entry form. Terms. Share mechanics — "Share for extra entries". Countdown to winner announcement.',
    wizardDefaults: {
      headline: 'Enter to Win!',
      subheadline: 'Don\'t miss your chance to win amazing prizes',
      ctaText: 'Enter Now',
      ctaSecondaryText: 'Share for Extra Entries',
    },
    features: { countdown: true, rsvpForm: true, mapEmbed: false, productGrid: false, contactForm: false, gallery: true, testimonials: false, videoHero: false, priceTag: false, socialShare: true },
  },
  {
    id: 'election_campaign',
    category: 'Launches & Campaigns',
    label: 'Election Campaign',
    tagline: 'Win votes with a professional campaign page',
    emoji: '🗳️',
    description: 'A professional campaign page for local, state, or national political candidates. Shares your platform, collects volunteers, and drives donations.',
    matchKeywords: ['election', 'campaign', 'candidate', 'vote', 'political', 'politician', 'mayor', 'council', 'senator', 'ballot'],
    typicalDurations: [30, 60, 90],
    priceMultiplier: 1.5,
    design: {
      primaryColor: 'blue',
      accentColor: 'red',
      backgroundColor: 'white',
      textColor: 'gray-900',
      mood: 'trustworthy, patriotic, authoritative, hopeful',
      style: 'political campaign aesthetic, flag-inspired colors, candidate portrait, platform points',
      fontHeading: 'Libre Franklin',
      fontBody: 'Inter',
      primaryHex: '#1D4ED8',
      accentHex: '#DC2626',
    },
    sections: ['HERO_CANDIDATE', 'PLATFORM_ISSUES', 'ABOUT_THE_CANDIDATE', 'VOLUNTEER_SIGNUP', 'DONATE_CTA', 'ENDORSEMENTS', 'CONTACT'],
    aiPromptContext: 'Design a professional political campaign page. Candidate photo and name in the hero with a compelling tagline. Key platform issues in a policy grid. Candidate biography. Volunteer signup form. Donation CTA. Endorsements section.',
    wizardDefaults: {
      headline: 'A Candidate You Can Trust',
      subheadline: 'Together we can build a better community',
      ctaText: 'Get Involved',
      ctaSecondaryText: 'Donate',
    },
    features: { countdown: true, rsvpForm: true, mapEmbed: false, productGrid: false, contactForm: true, gallery: true, testimonials: true, videoHero: false, priceTag: false, socialShare: true },
  },
  {
    id: 'crowdfunding',
    category: 'Launches & Campaigns',
    label: 'Crowdfunding',
    tagline: 'Fund your dream with a world-class crowdfunding page',
    emoji: '💡',
    description: 'A Kickstarter/Indiegogo-style crowdfunding page for your business idea, creative project, or invention. Tells your story and drives backer commitments.',
    matchKeywords: ['crowdfunding', 'kickstarter', 'indiegogo', 'backers', 'funding', 'pledge', 'startup', 'invention', 'idea', 'project funding'],
    typicalDurations: [30, 60],
    priceMultiplier: 1.4,
    design: {
      primaryColor: 'emerald',
      accentColor: 'blue',
      backgroundColor: 'white',
      textColor: 'gray-900',
      mood: 'entrepreneurial, inspiring, ambitious, community-driven',
      style: 'Kickstarter-inspired layout, progress bar dominant, reward tiers, video-first hero',
      fontHeading: 'Space Grotesk',
      fontBody: 'Inter',
      primaryHex: '#059669',
      accentHex: '#2563EB',
    },
    sections: ['HERO_VIDEO', 'FUNDING_PROGRESS', 'THE_STORY', 'REWARD_TIERS', 'HOW_IT_WORKS', 'TEAM', 'UPDATES', 'FAQ'],
    aiPromptContext: 'Create a compelling crowdfunding page. Video hero telling the creator\'s story. Prominent funding progress bar. Reward tier tables (Early Bird, Standard, Premium). Team bios. FAQ. Updates section for campaign news.',
    wizardDefaults: {
      headline: 'Help Us Make This Real',
      subheadline: 'Back this project and be part of something special',
      ctaText: 'Back This Project',
      ctaSecondaryText: 'Learn More',
    },
    features: { countdown: true, rsvpForm: false, mapEmbed: false, productGrid: true, contactForm: false, gallery: true, testimonials: true, videoHero: true, priceTag: true, socialShare: true },
  },
]

// ──────────────────────────────────────────────
//  Template matching logic
// ──────────────────────────────────────────────

/**
 * Find the best template for a user's natural-language prompt.
 * Returns templates sorted by relevance score (highest first).
 */
export function matchTemplateToPrompt(prompt: string): SpinupfyTemplate[] {
  const lower = prompt.toLowerCase()

  const scored = SPINUPFY_TEMPLATES.map(template => {
    let score = 0

    // Keyword match scoring
    for (const keyword of template.matchKeywords) {
      if (lower.includes(keyword)) {
        score += keyword.split(' ').length  // multi-word keywords score higher
      }
    }

    // Partial word match fallback (category label, template label)
    if (lower.includes(template.label.toLowerCase())) score += 3
    if (lower.includes(template.category.toLowerCase())) score += 1

    return { template, score }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.template)
}

/**
 * Get all templates grouped by category.
 */
export function getTemplatesByCategory(): Record<SpinupfyCategory, SpinupfyTemplate[]> {
  const grouped: Record<string, SpinupfyTemplate[]> = {}
  for (const template of SPINUPFY_TEMPLATES) {
    if (!grouped[template.category]) grouped[template.category] = []
    grouped[template.category].push(template)
  }
  return grouped as Record<SpinupfyCategory, SpinupfyTemplate[]>
}

/**
 * Get a single template by id.
 */
export function getTemplate(id: SpinupfyTemplateId): SpinupfyTemplate | undefined {
  return SPINUPFY_TEMPLATES.find(t => t.id === id)
}

export const SPINUPFY_CATEGORIES: SpinupfyCategory[] = [
  'Events & Entertainment',
  'Real Estate & Property',
  'Sales & Commerce',
  'Services & Booking',
  'Community & Causes',
  'Launches & Campaigns',
]
