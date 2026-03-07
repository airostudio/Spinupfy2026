/**
 * Business Templates Configuration
 * Comprehensive templates for website generation based on business type
 * These templates provide the foundation for AI-generated websites
 */

export type LayoutType = 'modern-saas' | 'local-service' | 'ecommerce' | 'portfolio' | 'professional';

export interface ImageSubject {
  section: 'hero' | 'about' | 'services' | 'gallery' | 'team' | 'contact';
  prompt: string;
  style: 'ultra-realistic' | 'lifestyle' | 'product' | 'environmental';
}

export interface BusinessTemplate {
  id: string;
  name: string;
  category: string;
  layout: LayoutType;
  description: string;
  tone: string;
  ctaText: string;
  ctaSecondary?: string;
  painPoints: string[];
  heroHeadline: string;
  heroSubheadline: string;
  imageSubjects: ImageSubject[];
  suggestedPages: string[];
  enableStoreFramework?: boolean;
  specialFeatures?: string[];
  colorMood: 'warm' | 'cool' | 'neutral' | 'dark' | 'vibrant';
}

/**
 * Master System Prompt for AI Website Generation
 */
export const MASTER_SYSTEM_PROMPT = `**ROLE:** You are Airo Studio's elite website architect.
**TASK:** Generate a complete, professional website structure tailored to the business described.

**REQUIREMENTS:**
1. **Layout Selection:** Choose the most appropriate layout based on business type
2. **Structure:** Define all sections with compelling, conversion-focused content
3. **Tone:** Match the content tone to the business personality
4. **CTAs:** Create action-oriented calls-to-action
5. **SEO:** Include meta descriptions and keyword-optimized content

**OUTPUT:** Clean, structured JSON ready for the website builder.`;

/**
 * Layout Descriptions
 */
export const LAYOUT_DESCRIPTIONS: Record<LayoutType, string> = {
  'modern-saas': 'Modern, tech-forward design for startups, apps, and digital products. Focus on features, pricing, and demos.',
  'local-service': 'Location-focused design for trades, clinics, restaurants. Emphasis on maps, calls, and booking.',
  'ecommerce': 'Retail-optimized design for online stores and digital products. Triggers full store framework.',
  'portfolio': 'Visual-heavy design for photographers, designers, and creatives. Gallery-focused with minimal text.',
  'professional': 'Trust-building design for lawyers, finance, and corporate. Focus on credentials and authority.',
};

/**
 * Business Templates Database
 * These templates are matched based on business type input
 */
export const BUSINESS_TEMPLATES: BusinessTemplate[] = [
  // ============================================
  // Category A: Local Services & Trades
  // ============================================
  {
    id: 'plumbing',
    name: 'Plumbing & Gas Services',
    category: 'Local Services & Trades',
    layout: 'local-service',
    description: 'Reliable 24/7 emergency plumbing service in a metropolitan area. Focus on speed, trust, and upfront pricing.',
    tone: 'trustworthy, urgent, professional',
    ctaText: 'Request Urgent Quote',
    ctaSecondary: 'Call Now',
    painPoints: [
      'Burst pipes causing water damage to your home',
      'No hot water leaving your family uncomfortable',
      'Hidden leaks driving up your water bills',
    ],
    heroHeadline: 'Emergency Plumbing When You Need It Most',
    heroSubheadline: '24/7 rapid response. Upfront pricing. Licensed & insured professionals.',
    imageSubjects: [
      { section: 'hero', prompt: 'Professional plumber in clean uniform fixing modern kitchen sink, well-lit home interior, confident expression, high-quality tools visible', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Team of professional plumbers standing next to branded work van, residential neighborhood, friendly and approachable, uniforms with company logo', style: 'lifestyle' },
      { section: 'services', prompt: 'Close-up of hands repairing copper pipes with precision tools, water droplets, professional workmanship, macro detail', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Beautiful modern bathroom renovation, white subway tiles, chrome fixtures, natural light, before-after transformation feel', style: 'environmental' },
      { section: 'contact', prompt: 'Plumber shaking hands with happy homeowner at front door, residential setting, trust and satisfaction visible', style: 'lifestyle' },
    ],
    suggestedPages: ['Home', 'Services', 'Emergency Services', 'About Us', 'Contact'],
    specialFeatures: ['24/7 availability badge', 'Click-to-call button', 'Service area map'],
    colorMood: 'cool',
  },
  {
    id: 'landscaping',
    name: 'Landscaping & Garden Design',
    category: 'Local Services & Trades',
    layout: 'local-service',
    description: 'High-end residential garden design and maintenance. Visual-heavy, focusing on transformations and seasonal care.',
    tone: 'creative, professional, nature-inspired',
    ctaText: 'Book Consultation',
    ctaSecondary: 'View Our Work',
    painPoints: [
      'Overgrown yard diminishing your home\'s curb appeal',
      'Lack of outdoor living space for family gatherings',
      'High maintenance gardens consuming your weekends',
    ],
    heroHeadline: 'Transform Your Outdoor Space Into a Living Masterpiece',
    heroSubheadline: 'Award-winning garden design. Expert installation. Year-round maintenance.',
    imageSubjects: [
      { section: 'hero', prompt: 'Stunning luxury backyard garden at golden hour, manicured lawn, flowering perennials, stone pathway, outdoor seating area, professional landscaping', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Landscape designer reviewing plans with client in beautiful garden setting, tablet in hand, pointing at plant arrangements', style: 'lifestyle' },
      { section: 'services', prompt: 'Professional landscaper planting ornamental grasses, rich soil, gardening gloves, attention to detail, lush green surroundings', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Dramatic before-after split image of front yard transformation, from bare lawn to stunning landscape with mature plants', style: 'environmental' },
      { section: 'gallery', prompt: 'Elegant water feature with natural stone, koi pond, surrounded by Japanese maple and ornamental grasses, zen atmosphere', style: 'environmental' },
    ],
    suggestedPages: ['Home', 'Services', 'Portfolio', 'Seasonal Care', 'Contact'],
    specialFeatures: ['Before/after gallery', 'Seasonal service calendar', 'Free estimate form'],
    colorMood: 'warm',
  },
  {
    id: 'electrician',
    name: 'Electrician',
    category: 'Local Services & Trades',
    layout: 'local-service',
    description: 'Licensed residential and commercial electrician. Focus on safety, certification, and smart home installations.',
    tone: 'technical, trustworthy, safety-focused',
    ctaText: 'Get Free Estimate',
    ctaSecondary: 'Emergency Service',
    painPoints: [
      'Outdated electrical panels creating fire hazards',
      'Frequent circuit breaker trips disrupting your day',
      'Lack of outlets for modern device needs',
    ],
    heroHeadline: 'Safe, Reliable Electrical Solutions for Your Home',
    heroSubheadline: 'Licensed. Insured. Smart home specialists. Free safety inspections.',
    imageSubjects: [
      { section: 'hero', prompt: 'Professional electrician testing modern electrical panel with digital multimeter, safety glasses, clean work environment, LED lighting', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Certified electrician showing license credentials, professional workshop background, safety equipment visible', style: 'lifestyle' },
      { section: 'services', prompt: 'Hands installing smart home thermostat on wall, modern interior, precise wiring work, technology integration', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Beautiful modern kitchen with recessed LED lighting, under-cabinet lights, sleek electrical fixtures', style: 'environmental' },
      { section: 'contact', prompt: 'Electrician explaining work to homeowner with tablet showing electrical diagram, professional interaction', style: 'lifestyle' },
    ],
    suggestedPages: ['Home', 'Services', 'Smart Home', 'Safety Tips', 'Contact'],
    specialFeatures: ['License verification badge', 'Safety checklist download', 'Emergency hotline'],
    colorMood: 'cool',
  },
  {
    id: 'auto-mechanic',
    name: 'Auto Mechanic',
    category: 'Local Services & Trades',
    layout: 'local-service',
    description: 'Family-owned car repair shop. Trustworthy, honest, specializing in European cars.',
    tone: 'friendly, honest, expertise-focused',
    ctaText: 'Book Service',
    ctaSecondary: 'Get Quote',
    painPoints: [
      'Dealer prices draining your wallet for basic repairs',
      'Unclear diagnoses leaving you uncertain about real issues',
      'Long wait times disrupting your busy schedule',
    ],
    heroHeadline: 'Honest, Expert Car Care Your Family Can Trust',
    heroSubheadline: 'European car specialists. Transparent pricing. Same-day service available.',
    imageSubjects: [
      { section: 'hero', prompt: 'Professional auto mechanic inspecting luxury European car engine bay, clean organized workshop, diagnostic equipment, oil-stained hands showing real work', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Family of mechanics three generations standing proudly in front of classic auto shop, vintage and modern cars visible', style: 'lifestyle' },
      { section: 'services', prompt: 'Close-up of mechanic hands using precision torque wrench on engine, BMW or Mercedes visible, professional lighting', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Immaculate auto repair bay with lifts, organized tool walls, luxury vehicles being serviced, modern equipment', style: 'environmental' },
      { section: 'contact', prompt: 'Mechanic handing keys to smiling customer, service counter, friendly interaction, trust visible', style: 'lifestyle' },
    ],
    suggestedPages: ['Home', 'Services', 'European Specialists', 'Reviews', 'Book Online', 'Contact'],
    specialFeatures: ['Online booking calendar', 'Google Maps integration', 'Customer reviews widget'],
    colorMood: 'warm',
  },
  {
    id: 'residential-cleaning',
    name: 'Residential Cleaning',
    category: 'Local Services & Trades',
    layout: 'local-service',
    description: 'Eco-friendly home cleaning service for busy families. Subscription-based or one-off deep cleans.',
    tone: 'fresh, trustworthy, eco-conscious',
    ctaText: 'Book Now',
    ctaSecondary: 'Get Pricing',
    painPoints: [
      'Never enough time to deep clean your home properly',
      'Harsh chemicals unsafe for children and pets',
      'Inconsistent cleaning quality from other services',
    ],
    heroHeadline: 'A Sparkling Clean Home Without the Hassle',
    heroSubheadline: 'Eco-friendly products. Background-checked cleaners. 100% satisfaction guaranteed.',
    imageSubjects: [
      { section: 'hero', prompt: 'Bright, immaculate living room after professional cleaning, sunlight streaming through windows, plush white couch, gleaming hardwood floors', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Friendly cleaning team in matching uniforms with eco-friendly cleaning supplies, green cleaning products visible, professional and approachable', style: 'lifestyle' },
      { section: 'services', prompt: 'Close-up of hands wearing gloves using plant-based cleaning spray on kitchen counter, sparkling surface, natural ingredients visible', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Pristine bathroom with white marble, spotless mirrors, folded towels, spa-like cleanliness', style: 'environmental' },
      { section: 'contact', prompt: 'Happy family relaxing in freshly cleaned living room, children playing, pet on clean carpet, sense of relief and joy', style: 'lifestyle' },
    ],
    suggestedPages: ['Home', 'Services', 'Pricing', 'Eco Promise', 'Book Online', 'Contact'],
    specialFeatures: ['Instant quote calculator', 'Subscription packages', 'Eco-certification badge'],
    colorMood: 'cool',
  },

  // ============================================
  // Category B: Health, Beauty & Wellness
  // ============================================
  {
    id: 'dental-clinic',
    name: 'Dental Clinic',
    category: 'Health, Beauty & Wellness',
    layout: 'professional',
    description: 'Family dentistry focusing on cosmetic and restorative work. Tone is gentle, professional, and reassuring.',
    tone: 'gentle, professional, reassuring',
    ctaText: 'Book Appointment',
    ctaSecondary: 'New Patient Info',
    painPoints: [
      'Dental anxiety keeping you from getting needed care',
      'Embarrassment about your smile affecting confidence',
      'Finding a dentist the whole family can trust',
    ],
    heroHeadline: 'Beautiful Smiles for the Whole Family',
    heroSubheadline: 'Gentle, judgment-free care. State-of-the-art technology. Accepting new patients.',
    imageSubjects: [
      { section: 'hero', prompt: 'Warm, modern dental office reception area, natural light, calming blue and white decor, friendly receptionist greeting patient', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Compassionate dentist showing X-ray to patient on modern display, explaining procedure with smile, patient looking relieved', style: 'lifestyle' },
      { section: 'services', prompt: 'State-of-the-art dental chair and equipment, digital scanner, bright clinical lighting, spotlessly clean', style: 'ultra-realistic' },
      { section: 'team', prompt: 'Diverse dental team in scrubs standing together in modern clinic, friendly smiles, professional yet approachable', style: 'lifestyle' },
      { section: 'gallery', prompt: 'Close-up of perfect smile, white teeth, natural lighting, cosmetic dentistry result', style: 'ultra-realistic' },
    ],
    suggestedPages: ['Home', 'Services', 'New Patients', 'Meet the Team', 'Technology', 'Contact'],
    specialFeatures: ['Online appointment booking', 'Insurance checker', 'Virtual tour'],
    colorMood: 'cool',
  },
  {
    id: 'yoga-studio',
    name: 'Yoga & Pilates Studio',
    category: 'Health, Beauty & Wellness',
    layout: 'local-service',
    description: 'Boutique studio offering classes and workshops. Vibe is calm, minimal, and spiritual.',
    tone: 'calm, mindful, welcoming',
    ctaText: 'View Class Schedule',
    ctaSecondary: 'First Class Free',
    painPoints: [
      'Stress and anxiety overwhelming your daily life',
      'Chronic pain limiting your mobility and happiness',
      'Feeling disconnected from your body and mind',
    ],
    heroHeadline: 'Find Your Balance. Transform Your Life.',
    heroSubheadline: 'Yoga & Pilates for all levels. Intimate class sizes. Expert instructors.',
    imageSubjects: [
      { section: 'hero', prompt: 'Serene yoga studio with natural light streaming through large windows, minimalist decor, wood floors, plants, person in peaceful warrior pose', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Yoga instructor adjusting student\'s pose gently, soft natural lighting, peaceful atmosphere, connection and guidance', style: 'lifestyle' },
      { section: 'services', prompt: 'Small group pilates class on reformer machines, bright airy studio, focused movements, professional instruction', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Meditation corner with cushions, candles, indoor plants, bamboo elements, zen atmosphere', style: 'environmental' },
      { section: 'gallery', prompt: 'Morning yoga class silhouettes against sunrise through studio windows, peaceful group practice', style: 'environmental' },
    ],
    suggestedPages: ['Home', 'Classes', 'Schedule', 'Workshops', 'Membership', 'Contact'],
    specialFeatures: ['Class timetable widget', 'Online class booking', 'Membership pricing table'],
    colorMood: 'neutral',
  },
  {
    id: 'hair-salon',
    name: 'Hair Salon',
    category: 'Health, Beauty & Wellness',
    layout: 'portfolio',
    description: 'Trendy, urban hair salon specializing in color and cuts. Very visual, Instagram-style aesthetic.',
    tone: 'trendy, confident, artistic',
    ctaText: 'Book Your Look',
    ctaSecondary: 'View Portfolio',
    painPoints: [
      'Struggling to find a stylist who understands your vision',
      'Hair color that fades too quickly or looks unnatural',
      'Salons that feel intimidating or unwelcoming',
    ],
    heroHeadline: 'Where Art Meets Hair',
    heroSubheadline: 'Color specialists. Precision cuts. Walk in as you are, walk out as you dream.',
    imageSubjects: [
      { section: 'hero', prompt: 'Stunning hair color transformation, vibrant balayage, model with perfect blowout, salon mirror reflection, professional lighting', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Stylist with creative tattoos and perfect hair creating art on client, modern salon interior, artistic atmosphere', style: 'lifestyle' },
      { section: 'services', prompt: 'Close-up of colorist applying precision highlights with foils, color bowls visible, professional technique', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Collage of hair transformations, vivid colors, sleek cuts, diverse clients, Instagram-worthy results', style: 'product' },
      { section: 'team', prompt: 'Stylish diverse team of hairstylists in modern salon, industrial-chic interior, personality and creativity visible', style: 'lifestyle' },
    ],
    suggestedPages: ['Home', 'Services', 'Stylists', 'Gallery', 'Book Online', 'Contact'],
    specialFeatures: ['Stylist portfolio grid', 'Instagram feed integration', 'Online booking'],
    colorMood: 'dark',
  },
  {
    id: 'personal-trainer',
    name: 'Personal Trainer',
    category: 'Health, Beauty & Wellness',
    layout: 'local-service',
    description: 'High-energy fitness coaching for weight loss and muscle gain. Tone is motivational and results-driven.',
    tone: 'motivational, energetic, results-focused',
    ctaText: 'Start Your Transformation',
    ctaSecondary: 'View Success Stories',
    painPoints: [
      'Years of failed diets and wasted gym memberships',
      'Lack of accountability keeping you from your goals',
      'Confusion about what actually works for your body',
    ],
    heroHeadline: 'Your Transformation Starts Today',
    heroSubheadline: 'Personalized training. Proven results. Zero judgment.',
    imageSubjects: [
      { section: 'hero', prompt: 'Personal trainer high-fiving client after intense workout, gym setting, sweat visible, triumph and motivation, dramatic lighting', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Fit personal trainer demonstrating perfect form, motivating expression, professional gym equipment background', style: 'lifestyle' },
      { section: 'services', prompt: 'One-on-one training session with trainer guiding client through kettlebell exercise, form correction, focused intensity', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Before and after transformation photos, real results, dramatic body changes, inspirational comparisons', style: 'product' },
      { section: 'gallery', prompt: 'Group fitness class with trainer leading, energy and movement, diverse participants, motivating atmosphere', style: 'lifestyle' },
    ],
    suggestedPages: ['Home', 'Programs', 'Success Stories', 'About', 'Pricing', 'Contact'],
    specialFeatures: ['Before/after showcase', 'Free consultation form', 'Program packages'],
    colorMood: 'vibrant',
  },
  {
    id: 'spa-massage',
    name: 'Spa & Massage Therapy',
    category: 'Health, Beauty & Wellness',
    layout: 'professional',
    description: 'Luxury day spa offering relaxation and treatments. Vibe is dark mode, gold accents, serene.',
    tone: 'luxurious, serene, indulgent',
    ctaText: 'Book Treatment',
    ctaSecondary: 'Gift Cards',
    painPoints: [
      'Chronic stress and tension affecting your wellbeing',
      'Difficulty finding time for self-care in busy life',
      'Ordinary spas that feel rushed and impersonal',
    ],
    heroHeadline: 'Escape. Restore. Rejuvenate.',
    heroSubheadline: 'Luxury spa experiences. Expert therapists. Your sanctuary awaits.',
    imageSubjects: [
      { section: 'hero', prompt: 'Elegant spa treatment room with massage table, warm ambient lighting, candles, orchids, luxurious linens, dark sophisticated palette', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Serene spa reception with minimalist design, zen water feature, gold accents, ambient lighting', style: 'environmental' },
      { section: 'services', prompt: 'Skilled massage therapist hands working on client\'s back, hot stones, aromatic oils, peaceful expression', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Luxury facial treatment, gold serum application, pristine white towel, client in blissful relaxation', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Spa pool and relaxation area, indoor plants, mood lighting, champagne service, ultimate luxury', style: 'environmental' },
    ],
    suggestedPages: ['Home', 'Treatments', 'Packages', 'Gift Cards', 'About', 'Book Now'],
    specialFeatures: ['Gift card store', 'Treatment menu with pricing', 'Online booking'],
    enableStoreFramework: true,
    colorMood: 'dark',
  },

  // ============================================
  // Category C: Professional Services
  // ============================================
  {
    id: 'law-firm',
    name: 'Law Firm',
    category: 'Professional Services',
    layout: 'professional',
    description: 'Boutique law firm specializing in Family Law and Wills. Tone is authoritative, compassionate, and serious.',
    tone: 'authoritative, compassionate, trustworthy',
    ctaText: 'Schedule Consultation',
    ctaSecondary: 'Practice Areas',
    painPoints: [
      'Navigating complex legal processes during difficult times',
      'Fear of making costly mistakes without proper guidance',
      'Finding a lawyer who truly understands your situation',
    ],
    heroHeadline: 'Experienced Legal Advocacy When It Matters Most',
    heroSubheadline: 'Family law specialists. Compassionate counsel. Protecting what matters to you.',
    imageSubjects: [
      { section: 'hero', prompt: 'Distinguished law library with leather-bound books, wooden desk, scales of justice, warm lighting, prestigious atmosphere', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Senior attorney in elegant office meeting with clients, empathetic expression, professional attire, trust and expertise', style: 'lifestyle' },
      { section: 'services', prompt: 'Legal documents with fountain pen, law books, reading glasses, depth of field on contract details', style: 'ultra-realistic' },
      { section: 'team', prompt: 'Professional attorney team portrait in prestigious office setting, diverse group, confident and approachable', style: 'lifestyle' },
      { section: 'contact', prompt: 'Modern law firm conference room with city view, polished table, professional meeting setup', style: 'environmental' },
    ],
    suggestedPages: ['Home', 'Practice Areas', 'Attorneys', 'Case Results', 'Resources', 'Contact'],
    specialFeatures: ['Attorney bios', 'Practice area pages', 'Consultation scheduler'],
    colorMood: 'neutral',
  },
  {
    id: 'accounting-cpa',
    name: 'Accounting & CPA',
    category: 'Professional Services',
    layout: 'professional',
    description: 'Tax preparation and business advisory for small businesses. Tone is knowledgeable and secure.',
    tone: 'knowledgeable, trustworthy, precise',
    ctaText: 'Get Started',
    ctaSecondary: 'Tax Resources',
    painPoints: [
      'Fear of costly tax mistakes and IRS penalties',
      'No time to manage complex bookkeeping properly',
      'Missing deductions that could save you thousands',
    ],
    heroHeadline: 'Financial Clarity for Growing Businesses',
    heroSubheadline: 'Expert tax preparation. Strategic advisory. Peace of mind guaranteed.',
    imageSubjects: [
      { section: 'hero', prompt: 'Modern accounting office with dual monitors showing financial dashboards, organized desk, calculator, professional workspace', style: 'ultra-realistic' },
      { section: 'about', prompt: 'CPA reviewing financial documents with small business owner, explaining charts, collaborative atmosphere', style: 'lifestyle' },
      { section: 'services', prompt: 'Close-up of hands working on tax forms with calculator, laptop showing spreadsheet, organized paperwork', style: 'ultra-realistic' },
      { section: 'team', prompt: 'Accounting team in modern office, professional attire, diverse expertise, approachable experts', style: 'lifestyle' },
      { section: 'contact', prompt: 'Secure document filing system, financial records, modern office organization, trust and security', style: 'environmental' },
    ],
    suggestedPages: ['Home', 'Services', 'Industries', 'Resources', 'Client Portal', 'Contact'],
    specialFeatures: ['Tax resource blog', 'Client portal login', 'Free consultation form'],
    colorMood: 'cool',
  },
  {
    id: 'real-estate-agent',
    name: 'Real Estate Agent',
    category: 'Professional Services',
    layout: 'professional',
    description: 'Luxury property agent for high-net-worth individuals. Personal branding focus.',
    tone: 'sophisticated, exclusive, results-driven',
    ctaText: 'View Listings',
    ctaSecondary: 'Market Report',
    painPoints: [
      'Missing opportunities in the competitive luxury market',
      'Settling for agents who don\'t understand your standards',
      'Lack of discreet, white-glove service you deserve',
    ],
    heroHeadline: 'Exceptional Properties. Exceptional Service.',
    heroSubheadline: 'Luxury real estate specialist. Exclusive listings. Discretion guaranteed.',
    imageSubjects: [
      { section: 'hero', prompt: 'Stunning luxury home exterior at twilight, modern architecture, infinity pool, city lights in background, aspirational lifestyle', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Elegant real estate agent in designer attire showing luxury penthouse to sophisticated client, city skyline views', style: 'lifestyle' },
      { section: 'services', prompt: 'Luxury home staging, designer furniture, curated art, impeccable interior design, magazine-worthy space', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Drone aerial of luxury waterfront estate, private dock, manicured grounds, exclusive property', style: 'environmental' },
      { section: 'gallery', prompt: 'Modern penthouse living room with floor-to-ceiling windows, designer furniture, panoramic views', style: 'environmental' },
    ],
    suggestedPages: ['Home', 'Listings', 'Sold Properties', 'Market Report', 'About', 'Contact'],
    specialFeatures: ['Property listings integration', 'Market report download', 'Virtual tours'],
    colorMood: 'dark',
  },
  {
    id: 'consulting-agency',
    name: 'Business Consulting',
    category: 'Professional Services',
    layout: 'modern-saas',
    description: 'Business strategy consultants for startups. Modern, corporate, data-driven.',
    tone: 'strategic, innovative, results-oriented',
    ctaText: 'Request Demo',
    ctaSecondary: 'Case Studies',
    painPoints: [
      'Scaling challenges blocking your growth potential',
      'Making critical decisions without proper data',
      'Competitors outpacing you with better strategies',
    ],
    heroHeadline: 'Transform Data Into Decisions. Decisions Into Growth.',
    heroSubheadline: 'Strategic consulting for ambitious startups. Proven frameworks. Measurable results.',
    imageSubjects: [
      { section: 'hero', prompt: 'Modern consulting office with data visualization on large screen, diverse team in strategy session, glass walls, innovative atmosphere', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Consultant presenting growth charts to startup founders, whiteboard with strategy framework, engaged discussion', style: 'lifestyle' },
      { section: 'services', prompt: 'Close-up of business dashboard on laptop, KPI metrics, growth charts, data-driven insights', style: 'ultra-realistic' },
      { section: 'team', prompt: 'Dynamic consulting team in modern co-working space, laptops, whiteboards, collaborative energy', style: 'lifestyle' },
      { section: 'gallery', prompt: 'Sleek conference room with startup clients, presentation in progress, modern tech office environment', style: 'environmental' },
    ],
    suggestedPages: ['Home', 'Services', 'Case Studies', 'Insights', 'Team', 'Contact'],
    specialFeatures: ['Case study downloads', 'Whitepaper library', 'ROI calculator'],
    colorMood: 'cool',
  },

  // ============================================
  // Category D: Creative & Portfolio
  // ============================================
  {
    id: 'wedding-photographer',
    name: 'Wedding Photographer',
    category: 'Creative & Portfolio',
    layout: 'portfolio',
    description: 'Romantic, documentary-style wedding photography. Minimal text, maximum imagery.',
    tone: 'romantic, artistic, intimate',
    ctaText: 'Check Availability',
    ctaSecondary: 'View Galleries',
    painPoints: [
      'Fear of missing once-in-a-lifetime moments',
      'Generic posed photos that don\'t tell your story',
      'Finding a photographer who captures real emotion',
    ],
    heroHeadline: 'Your Love Story, Authentically Captured',
    heroSubheadline: 'Documentary wedding photography. Real moments. Timeless memories.',
    imageSubjects: [
      { section: 'hero', prompt: 'Intimate first dance moment, bride and groom foreheads touching, soft warm lighting, romantic bokeh, emotional and genuine', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Wedding photographer capturing candid moment, camera in action, wedding venue background, artistic perspective', style: 'lifestyle' },
      { section: 'gallery', prompt: 'Bride getting ready, natural light through window, delicate lace details, authentic moment of anticipation', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Wedding ceremony outdoors, golden hour lighting, guests in soft focus, couple exchanging vows, emotional', style: 'environmental' },
      { section: 'gallery', prompt: 'Black and white candid of laughing bride with bridesmaids, champagne toast, genuine joy and friendship', style: 'lifestyle' },
    ],
    suggestedPages: ['Home', 'Portfolio', 'About', 'Investment', 'Kind Words', 'Contact'],
    specialFeatures: ['Full-screen gallery', 'Investment/pricing info', 'Client testimonials'],
    colorMood: 'warm',
  },
  {
    id: 'interior-designer',
    name: 'Interior Designer',
    category: 'Creative & Portfolio',
    layout: 'portfolio',
    description: 'Modern residential interior designer. Sophisticated and chic.',
    tone: 'sophisticated, creative, refined',
    ctaText: 'Start Your Project',
    ctaSecondary: 'View Portfolio',
    painPoints: [
      'Rooms that feel disconnected and lack cohesion',
      'Wasting money on furniture that doesn\'t work together',
      'Unable to visualize your design potential alone',
    ],
    heroHeadline: 'Spaces That Inspire. Interiors That Transform.',
    heroSubheadline: 'Residential interior design. Curated aesthetics. Functional beauty.',
    imageSubjects: [
      { section: 'hero', prompt: 'Stunning modern living room, designer furniture, curated art collection, perfect lighting, architectural details, magazine cover worthy', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Interior designer reviewing fabric swatches with client, mood board visible, collaborative design process', style: 'lifestyle' },
      { section: 'gallery', prompt: 'Luxurious master bedroom, statement headboard, layered textures, ambient lighting, calm sophisticated palette', style: 'environmental' },
      { section: 'gallery', prompt: 'Modern kitchen renovation, marble counters, custom cabinetry, brass hardware, natural light', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Elegant dining room, designer chandelier, statement table, styled vignettes, entertaining-ready', style: 'environmental' },
    ],
    suggestedPages: ['Home', 'Portfolio', 'Services', 'Process', 'Press', 'Contact'],
    specialFeatures: ['Project case studies', 'Process timeline', 'Press mentions'],
    colorMood: 'neutral',
  },
  {
    id: 'graphic-designer',
    name: 'Graphic Design Freelancer',
    category: 'Creative & Portfolio',
    layout: 'portfolio',
    description: 'Bold, edgy freelance designer for tech brands. Portfolio grid is the main focus.',
    tone: 'bold, creative, modern',
    ctaText: 'Hire Me',
    ctaSecondary: 'View Work',
    painPoints: [
      'Generic design that fails to stand out in crowded markets',
      'Inconsistent branding confusing your audience',
      'Design agencies too expensive for your budget',
    ],
    heroHeadline: 'Design That Disrupts. Brands That Resonate.',
    heroSubheadline: 'Freelance designer for ambitious tech brands. Bold concepts. Pixel-perfect execution.',
    imageSubjects: [
      { section: 'hero', prompt: 'Bold brand identity mockup, vibrant colors, geometric patterns, tech product packaging, modern graphic design showcase', style: 'product' },
      { section: 'about', prompt: 'Creative designer workspace, large monitor with design software, inspiration boards, modern desk setup, personality visible', style: 'lifestyle' },
      { section: 'gallery', prompt: 'App UI design showcase, mobile screens floating, gradient backgrounds, clean interface design', style: 'product' },
      { section: 'gallery', prompt: 'Brand identity system, logo variations, color palette, typography, cohesive design system', style: 'product' },
      { section: 'gallery', prompt: 'Social media campaign designs, bold typography, vibrant gradients, modern marketing collateral', style: 'product' },
    ],
    suggestedPages: ['Home', 'Work', 'About', 'Services', 'Contact'],
    specialFeatures: ['Filterable portfolio grid', 'Case study pages', 'Contact form'],
    colorMood: 'vibrant',
  },

  // ============================================
  // Category E: Retail & Food
  // ============================================
  {
    id: 'coffee-roaster',
    name: 'Artisan Coffee Roaster',
    category: 'Retail & Food',
    layout: 'ecommerce',
    description: 'Selling coffee beans online and serving locally. Hipster, craft vibe.',
    tone: 'artisanal, authentic, passionate',
    ctaText: 'Shop Beans',
    ctaSecondary: 'Visit Cafe',
    painPoints: [
      'Stale grocery store coffee ruining your morning ritual',
      'Not knowing where your coffee comes from',
      'Missing the craft and story behind great coffee',
    ],
    heroHeadline: 'From Crop to Cup. Exceptional Coffee, Ethically Sourced.',
    heroSubheadline: 'Small-batch roasted. Direct trade. Shipped fresh to your door.',
    imageSubjects: [
      { section: 'hero', prompt: 'Close-up of espresso pour, rich crema, professional barista hands, steam rising, artisan coffee shop atmosphere', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Coffee roaster checking beans in vintage roasting machine, warehouse setting, craft and expertise visible', style: 'lifestyle' },
      { section: 'services', prompt: 'Cupping session with multiple coffee varieties, professional tasting notes, beans in ceramic bowls', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Cozy coffee shop interior, exposed brick, reclaimed wood, latte art being served', style: 'environmental' },
      { section: 'gallery', prompt: 'Coffee bean bags with artisan labels, variety of roasts, craft packaging design', style: 'product' },
    ],
    suggestedPages: ['Home', 'Shop', 'Our Beans', 'Cafe Menu', 'About', 'Subscribe'],
    enableStoreFramework: true,
    specialFeatures: ['Online store', 'Subscription option', 'Cafe menu page'],
    colorMood: 'warm',
  },
  {
    id: 'boutique-clothing',
    name: 'Boutique Clothing Store',
    category: 'Retail & Food',
    layout: 'ecommerce',
    description: 'Women\'s contemporary fashion. Minimalist, high-fashion style.',
    tone: 'sophisticated, curated, trend-forward',
    ctaText: 'Shop Collection',
    ctaSecondary: 'New Arrivals',
    painPoints: [
      'Fast fashion quality that falls apart after one wash',
      'Styles that don\'t flatter your body type',
      'Endless scrolling through overwhelming online stores',
    ],
    heroHeadline: 'Curated Style. Effortless Elegance.',
    heroSubheadline: 'Contemporary fashion for the modern woman. Thoughtfully selected. Impeccably made.',
    imageSubjects: [
      { section: 'hero', prompt: 'Editorial fashion photography, model in minimalist contemporary outfit, clean white background, high-fashion pose, designer clothing', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Boutique interior with curated clothing racks, minimalist display, natural light, editorial atmosphere', style: 'environmental' },
      { section: 'gallery', prompt: 'Lookbook flat lay, styled outfit with accessories, minimal background, perfect composition', style: 'product' },
      { section: 'gallery', prompt: 'Close-up of fabric texture, quality stitching, designer details, luxury material', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Model walking in urban setting, street style photography, contemporary fashion, aspirational lifestyle', style: 'lifestyle' },
    ],
    suggestedPages: ['Home', 'Shop All', 'New Arrivals', 'Lookbook', 'Size Guide', 'Contact'],
    enableStoreFramework: true,
    specialFeatures: ['Product catalog', 'Size guide', 'Lookbook gallery'],
    colorMood: 'neutral',
  },
  {
    id: 'pet-supplies',
    name: 'Pet Supplies Store',
    category: 'Retail & Food',
    layout: 'ecommerce',
    description: 'Fun, colorful brand selling organic dog treats and toys.',
    tone: 'playful, caring, trustworthy',
    ctaText: 'Shop Now',
    ctaSecondary: 'Subscribe & Save',
    painPoints: [
      'Worry about harmful ingredients in commercial pet food',
      'Running out of supplies at inconvenient times',
      'Finding quality products your picky pet will love',
    ],
    heroHeadline: 'Healthy Treats. Happy Pets. Peace of Mind.',
    heroSubheadline: 'Organic, all-natural pet supplies. Tail-wagging guaranteed.',
    imageSubjects: [
      { section: 'hero', prompt: 'Adorable golden retriever with healthy organic dog treats, colorful background, joyful expression, pet photography', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Founder with rescue dogs, organic treat ingredients visible, warm authentic moment, brand story', style: 'lifestyle' },
      { section: 'services', prompt: 'Colorful product flat lay, organic dog treats, eco-friendly toys, natural materials, playful arrangement', style: 'product' },
      { section: 'gallery', prompt: 'Happy dog playing with sustainable pet toy, park setting, action shot, joyful energy', style: 'lifestyle' },
      { section: 'gallery', prompt: 'Subscription box unboxing, excited dog watching, variety of treats and toys, surprise and delight', style: 'product' },
    ],
    suggestedPages: ['Home', 'Shop', 'Treats', 'Toys', 'Subscribe & Save', 'Our Story'],
    enableStoreFramework: true,
    specialFeatures: ['Subscription boxes', 'Product reviews', 'Ingredient transparency'],
    colorMood: 'vibrant',
  },
  {
    id: 'italian-bistro',
    name: 'Italian Bistro',
    category: 'Retail & Food',
    layout: 'local-service',
    description: 'Authentic, rustic Italian dining. Focus on atmosphere and ingredients.',
    tone: 'warm, authentic, inviting',
    ctaText: 'Reserve a Table',
    ctaSecondary: 'View Menu',
    painPoints: [
      'Generic Italian chains with no authenticity',
      'Finding restaurant quality for special occasions',
      'Craving real Italian flavors and atmosphere',
    ],
    heroHeadline: 'Authentic Italian. Made with Love.',
    heroSubheadline: 'Family recipes. Fresh ingredients. A taste of Italy in every bite.',
    imageSubjects: [
      { section: 'hero', prompt: 'Beautiful pasta dish being plated, chef hands, steam rising, fresh herbs garnish, restaurant kitchen action', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Italian family in rustic restaurant kitchen, grandmother and grandchildren, passing down recipes, warmth and heritage', style: 'lifestyle' },
      { section: 'services', prompt: 'Fresh handmade pasta, flour-dusted surface, authentic Italian ingredients, artisan preparation', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Cozy Italian restaurant interior, checkered tablecloths, wine bottles, warm lighting, romantic atmosphere', style: 'environmental' },
      { section: 'gallery', prompt: 'Antipasto board with Italian meats and cheeses, olives, focaccia, Mediterranean spread', style: 'product' },
    ],
    suggestedPages: ['Home', 'Menu', 'About', 'Private Events', 'Reservations', 'Contact'],
    specialFeatures: ['Menu with pricing', 'OpenTable integration', 'Gallery'],
    colorMood: 'warm',
  },
  {
    id: 'handmade-jewelry',
    name: 'Handmade Jewelry',
    category: 'Retail & Food',
    layout: 'ecommerce',
    description: 'Hand-crafted silver and gold jewelry. Elegant, delicate aesthetic.',
    tone: 'artisanal, elegant, personal',
    ctaText: 'Shop Collection',
    ctaSecondary: 'Custom Orders',
    painPoints: [
      'Mass-produced jewelry that everyone else has',
      'Pieces that tarnish or cause skin reactions',
      'Finding meaningful jewelry for special occasions',
    ],
    heroHeadline: 'Handcrafted. Timeless. Uniquely Yours.',
    heroSubheadline: 'Artisan jewelry made with precious metals. Each piece tells a story.',
    imageSubjects: [
      { section: 'hero', prompt: 'Delicate gold necklace on model\'s collarbone, soft lighting, subtle makeup, elegant jewelry photography', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Jewelry artisan at workbench, magnifying glass, precision tools, crafting delicate piece, hands at work', style: 'lifestyle' },
      { section: 'gallery', prompt: 'Jewelry collection flat lay on marble, gold and silver pieces, minimalist styling, high-end product photography', style: 'product' },
      { section: 'gallery', prompt: 'Close-up macro of ring details, gemstone setting, metal texture, craftsmanship visible', style: 'ultra-realistic' },
      { section: 'gallery', prompt: 'Model hands wearing stacked rings, natural light, lifestyle jewelry photography, aspirational', style: 'lifestyle' },
    ],
    suggestedPages: ['Home', 'Shop', 'Collections', 'Custom', 'Care Guide', 'About'],
    enableStoreFramework: true,
    specialFeatures: ['High-zoom product images', 'Custom order form', 'Size guide'],
    colorMood: 'neutral',
  },

  // ============================================
  // Category F: Tech & Startups
  // ============================================
  {
    id: 'mobile-app',
    name: 'Mobile App Landing Page',
    category: 'Tech & Startups',
    layout: 'modern-saas',
    description: 'A productivity app for students. Bright, punchy, mobile-first design.',
    tone: 'energetic, helpful, modern',
    ctaText: 'Download Free',
    ctaSecondary: 'Watch Demo',
    painPoints: [
      'Struggling to stay organized with scattered notes and tasks',
      'Missing deadlines because no single system works',
      'Wasting hours on inefficient study methods',
    ],
    heroHeadline: 'Study Smarter. Achieve More.',
    heroSubheadline: 'The productivity app designed for students. Free on iOS & Android.',
    imageSubjects: [
      { section: 'hero', prompt: 'Clean mobile app mockup on iPhone, colorful UI, student productivity app, floating device with subtle shadow', style: 'product' },
      { section: 'about', prompt: 'Diverse college students using app on phones, modern campus setting, collaborative study session', style: 'lifestyle' },
      { section: 'services', prompt: 'App feature screenshots, multiple screens showing functionality, colorful gradients, modern UI design', style: 'product' },
      { section: 'gallery', prompt: 'Student celebrating completed tasks, phone in hand, bright colorful environment, achievement moment', style: 'lifestyle' },
      { section: 'gallery', prompt: 'App icon and branding mockup, app store badges, colorful brand elements', style: 'product' },
    ],
    suggestedPages: ['Home', 'Features', 'Pricing', 'Download', 'Support', 'Blog'],
    specialFeatures: ['App store buttons', 'Feature screenshots', 'Pricing table'],
    colorMood: 'vibrant',
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity Firm',
    category: 'Tech & Startups',
    layout: 'modern-saas',
    description: 'B2B security solutions for enterprise. Dark, tech-heavy, neon accents.',
    tone: 'authoritative, technical, protective',
    ctaText: 'Request Demo',
    ctaSecondary: 'Security Assessment',
    painPoints: [
      'Constant threat of data breaches and ransomware',
      'Compliance requirements becoming more complex',
      'Existing security tools creating alert fatigue',
    ],
    heroHeadline: 'Enterprise Security. Zero Compromise.',
    heroSubheadline: 'Advanced threat protection. 24/7 monitoring. Fortune 500 trusted.',
    imageSubjects: [
      { section: 'hero', prompt: 'Dark cybersecurity operations center, multiple monitors with data visualizations, blue and green neon lighting, futuristic tech atmosphere', style: 'ultra-realistic' },
      { section: 'about', prompt: 'Security analyst team reviewing threat data, dark modern office, multiple screens, focused concentration', style: 'lifestyle' },
      { section: 'services', prompt: 'Abstract data protection visualization, encrypted data streams, shield iconography, dark background with cyan accents', style: 'product' },
      { section: 'gallery', prompt: 'Server room with security infrastructure, blue LED lighting, enterprise hardware, high-tech environment', style: 'environmental' },
      { section: 'team', prompt: 'Cybersecurity experts in modern tech office, professional yet approachable, diverse team', style: 'lifestyle' },
    ],
    suggestedPages: ['Home', 'Solutions', 'Industries', 'Resources', 'Partners', 'Contact'],
    specialFeatures: ['Trust logos', 'Demo request form', 'Compliance badges'],
    colorMood: 'dark',
  },
];

/**
 * Find template by business type ID
 */
export function getTemplateById(id: string): BusinessTemplate | undefined {
  return BUSINESS_TEMPLATES.find(t => t.id === id);
}

/**
 * Search templates by keyword or business type
 */
export function searchTemplates(query: string): BusinessTemplate[] {
  const lowerQuery = query.toLowerCase();
  return BUSINESS_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.category.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.id.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Find best matching template for a business description
 */
export function findBestTemplate(businessInput: string): BusinessTemplate | undefined {
  const input = businessInput.toLowerCase();

  // Score each template based on keyword matches
  const scored = BUSINESS_TEMPLATES.map(template => {
    let score = 0;

    // Check name match
    if (input.includes(template.name.toLowerCase())) score += 10;
    if (template.name.toLowerCase().includes(input)) score += 5;

    // Check ID match (like 'plumber', 'lawyer', etc.)
    if (input.includes(template.id)) score += 8;

    // Check category match
    if (input.includes(template.category.toLowerCase())) score += 3;

    // Check description keywords
    const descWords = template.description.toLowerCase().split(/\s+/);
    const inputWords = input.split(/\s+/);
    for (const word of inputWords) {
      if (word.length > 3 && descWords.some(d => d.includes(word))) {
        score += 2;
      }
    }

    return { template, score };
  });

  // Sort by score and return best match
  scored.sort((a, b) => b.score - a.score);

  // Only return if we have a reasonable match
  if (scored[0]?.score >= 3) {
    return scored[0].template;
  }

  return undefined;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): BusinessTemplate[] {
  return BUSINESS_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  return [...new Set(BUSINESS_TEMPLATES.map(t => t.category))];
}

/**
 * Get templates by layout type
 */
export function getTemplatesByLayout(layout: LayoutType): BusinessTemplate[] {
  return BUSINESS_TEMPLATES.filter(t => t.layout === layout);
}
