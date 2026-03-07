/**
 * Business Types Configuration
 * Comprehensive list of 35+ business website types with color mood associations
 */

import { BusinessTypeConfig, BusinessTypeCategory } from '../types/business.types';

export const BUSINESS_TYPES: BusinessTypeConfig[] = [
  // Food & Beverage
  {
    id: 'restaurant',
    label: 'Restaurant',
    description: 'Full-service dining establishment',
    emoji: '🍽️',
    colorTheme: {
      primary: 'orange',
      secondary: 'red',
      accent: 'amber',
      background: 'slate',
      text: 'gray',
      mood: 'warm',
    },
    designSystem: {
      typography: {
        heading: 'Cormorant Garamond',
        body: 'Lato'
      },
      colors: {
        primaryHex: '#ea580c',
        secondaryHex: '#dc2626',
        accentHex: '#f59e0b'
      },
      style: {
        aesthetic: 'warm, inviting, culinary elegance with appetizing visuals',
        competitors: ['The French Laundry', 'Eleven Madison Park', 'Alinea'],
        imageStyle: 'mouth-watering food photography, elegant plating, ambient restaurant atmosphere'
      }
    },
    keywords: ['dining', 'food', 'menu', 'reservations', 'cuisine', 'chef', 'gourmet'],
    recommendedSections: ['HERO', 'ABOUT', 'SERVICES', 'GALLERY', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'bakery',
    label: 'Bakery',
    description: 'Artisan breads and pastries',
    emoji: '🥖',
    colorTheme: {
      primary: 'amber',
      secondary: 'orange',
      accent: 'rose',
      background: 'stone',
      text: 'slate',
      mood: 'warm',
    },
    keywords: ['bread', 'pastry', 'baking', 'artisan', 'fresh'],
    recommendedSections: ['HERO', 'GALLERY', 'SERVICES', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'coffee-shop',
    label: 'Coffee Shop',
    description: 'Café and coffee house',
    emoji: '☕',
    colorTheme: {
      primary: 'amber',
      secondary: 'stone',
      accent: 'orange',
      background: 'zinc',
      text: 'slate',
      mood: 'warm',
    },
    keywords: ['coffee', 'cafe', 'espresso', 'tea', 'cozy'],
    recommendedSections: ['HERO', 'SERVICES', 'GALLERY', 'ABOUT', 'CONTACT'],
  },
  {
    id: 'food-delivery',
    label: 'Food Delivery',
    description: 'Food delivery service',
    emoji: '🚚',
    colorTheme: {
      primary: 'red',
      secondary: 'orange',
      accent: 'yellow',
      background: 'slate',
      text: 'gray',
      mood: 'energetic',
    },
    keywords: ['delivery', 'fast', 'food', 'online ordering', 'convenience'],
    recommendedSections: ['HERO', 'FEATURES', 'SERVICES', 'PRICING', 'CTA', 'CONTACT'],
  },

  // Professional Services
  {
    id: 'law-firm',
    label: 'Law Firm',
    description: 'Legal services and attorneys',
    emoji: '⚖️',
    colorTheme: {
      primary: 'slate',
      secondary: 'blue',
      accent: 'amber',
      background: 'zinc',
      text: 'slate',
      mood: 'professional',
    },
    designSystem: {
      typography: {
        heading: 'Merriweather',
        body: 'Open Sans'
      },
      colors: {
        primaryHex: '#1e293b',
        secondaryHex: '#1e40af',
        accentHex: '#d97706'
      },
      style: {
        aesthetic: 'authoritative, trustworthy, professional with refined elegance',
        competitors: ['Skadden Arps', 'Baker McKenzie', 'Latham & Watkins'],
        imageStyle: 'professional law office photography, courtroom imagery, attorney portraits, scales of justice'
      }
    },
    keywords: ['legal', 'attorney', 'law', 'justice', 'counsel', 'litigation', 'corporate law'],
    recommendedSections: ['HERO', 'ABOUT', 'SERVICES', 'TEAM', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    description: 'Financial accounting services',
    emoji: '📊',
    colorTheme: {
      primary: 'slate',
      secondary: 'emerald',
      accent: 'blue',
      background: 'zinc',
      text: 'gray',
      mood: 'professional',
    },
    keywords: ['accounting', 'finance', 'tax', 'bookkeeping', 'CPA'],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TESTIMONIALS', 'CTA', 'CONTACT'],
  },
  {
    id: 'consulting',
    label: 'Consulting',
    description: 'Business consulting services',
    emoji: '💼',
    colorTheme: {
      primary: 'blue',
      secondary: 'slate',
      accent: 'cyan',
      background: 'zinc',
      text: 'gray',
      mood: 'professional',
    },
    keywords: ['consulting', 'strategy', 'business', 'advisor', 'expertise'],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TESTIMONIALS', 'TEAM', 'CONTACT'],
  },
  {
    id: 'financial',
    label: 'Financial Services',
    description: 'Financial planning and investment',
    emoji: '💰',
    colorTheme: {
      primary: 'emerald',
      secondary: 'blue',
      accent: 'teal',
      background: 'slate',
      text: 'gray',
      mood: 'trustworthy',
    },
    keywords: ['finance', 'investment', 'wealth', 'planning', 'advisor'],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TESTIMONIALS', 'CTA', 'CONTACT'],
  },
  {
    id: 'insurance',
    label: 'Insurance',
    description: 'Insurance services and coverage',
    emoji: '🛡️',
    colorTheme: {
      primary: 'blue',
      secondary: 'slate',
      accent: 'emerald',
      background: 'zinc',
      text: 'gray',
      mood: 'trustworthy',
    },
    keywords: ['insurance', 'coverage', 'protection', 'policy', 'claims'],
    recommendedSections: ['HERO', 'SERVICES', 'FEATURES', 'TESTIMONIALS', 'CTA', 'CONTACT'],
  },

  // Healthcare & Wellness
  {
    id: 'medical',
    label: 'Medical Practice',
    description: 'Healthcare and medical services',
    emoji: '🏥',
    colorTheme: {
      primary: 'blue',
      secondary: 'teal',
      accent: 'cyan',
      background: 'slate',
      text: 'gray',
      mood: 'trustworthy',
    },
    keywords: ['healthcare', 'medical', 'doctor', 'clinic', 'health'],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TEAM', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'dental',
    label: 'Dental Practice',
    description: 'Dental care and orthodontics',
    emoji: '🦷',
    colorTheme: {
      primary: 'cyan',
      secondary: 'blue',
      accent: 'teal',
      background: 'slate',
      text: 'gray',
      mood: 'trustworthy',
    },
    keywords: ['dental', 'dentist', 'orthodontics', 'teeth', 'smile'],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TEAM', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy',
    description: 'Pharmaceutical services',
    emoji: '💊',
    colorTheme: {
      primary: 'emerald',
      secondary: 'blue',
      accent: 'teal',
      background: 'slate',
      text: 'gray',
      mood: 'trustworthy',
    },
    keywords: ['pharmacy', 'medication', 'prescription', 'health', 'wellness'],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'CONTACT'],
  },
  {
    id: 'fitness',
    label: 'Fitness & Gym',
    description: 'Fitness center and training',
    emoji: '💪',
    colorTheme: {
      primary: 'red',
      secondary: 'orange',
      accent: 'zinc',
      background: 'slate',
      text: 'gray',
      mood: 'energetic',
    },
    keywords: ['fitness', 'gym', 'training', 'workout', 'health'],
    recommendedSections: ['HERO', 'SERVICES', 'PRICING', 'TEAM', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'yoga-studio',
    label: 'Yoga Studio',
    description: 'Yoga and meditation center',
    emoji: '🧘',
    colorTheme: {
      primary: 'teal',
      secondary: 'cyan',
      accent: 'emerald',
      background: 'stone',
      text: 'slate',
      mood: 'calm',
    },
    keywords: ['yoga', 'meditation', 'wellness', 'mindfulness', 'studio'],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'PRICING', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'eye-care',
    label: 'Eye Care & Optical',
    description: 'Optometry, ophthalmology, and eyewear services',
    emoji: '👁️',
    colorTheme: {
      primary: 'blue',
      secondary: 'cyan',
      accent: 'teal',
      background: 'slate',
      text: 'gray',
      mood: 'trustworthy',
    },
    designSystem: {
      typography: {
        heading: 'Inter',
        body: 'Inter'
      },
      colors: {
        primaryHex: '#2563eb',
        secondaryHex: '#06b6d4',
        accentHex: '#14b8a6'
      },
      style: {
        aesthetic: 'clean, professional, vision-focused with modern clinical design',
        competitors: ['LensCrafters', 'Warby Parker', 'Pearle Vision', 'Visionworks'],
        imageStyle: 'modern optical shop interior, eye exam equipment, stylish eyewear displays, professional optometrist with patient, vision care technology, designer frames and glasses'
      }
    },
    keywords: [
      'eye care', 'optical', 'optometry', 'optometrist', 'ophthalmology', 'ophthalmologist',
      'vision', 'vision care', 'eye doctor', 'eye exam', 'eye clinic', 'eye health',
      'glasses', 'eyeglasses', 'eyewear', 'frames', 'lenses', 'spectacles',
      'contact lenses', 'contacts', 'prescription glasses', 'sunglasses',
      'vision therapy', 'vision center', 'optical shop', 'optical store',
      'cataract', 'glaucoma', 'lasik', 'retina', 'cornea'
    ],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TEAM', 'TESTIMONIALS', 'GALLERY', 'CONTACT'],
  },
  {
    id: 'chiropractic',
    label: 'Chiropractic',
    description: 'Chiropractic and spinal care services',
    emoji: '🦴',
    colorTheme: {
      primary: 'emerald',
      secondary: 'teal',
      accent: 'blue',
      background: 'slate',
      text: 'gray',
      mood: 'trustworthy',
    },
    designSystem: {
      typography: {
        heading: 'Inter',
        body: 'Inter'
      },
      colors: {
        primaryHex: '#059669',
        secondaryHex: '#14b8a6',
        accentHex: '#3b82f6'
      },
      style: {
        aesthetic: 'wellness-focused, professional, healing with natural elements',
        competitors: ['The Joint Chiropractic', 'HealthSource Chiropractic'],
        imageStyle: 'chiropractor performing adjustment, modern chiropractic office, spine and wellness imagery, patient consultation, therapeutic treatment'
      }
    },
    keywords: [
      'chiropractic', 'chiropractor', 'spinal care', 'spine', 'back pain', 'neck pain',
      'adjustment', 'spinal adjustment', 'alignment', 'posture', 'wellness',
      'pain relief', 'sports chiropractic', 'rehabilitation'
    ],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TEAM', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'physical-therapy',
    label: 'Physical Therapy',
    description: 'Physical therapy and rehabilitation services',
    emoji: '🏃',
    colorTheme: {
      primary: 'blue',
      secondary: 'green',
      accent: 'cyan',
      background: 'slate',
      text: 'gray',
      mood: 'energetic',
    },
    designSystem: {
      typography: {
        heading: 'Inter',
        body: 'Inter'
      },
      colors: {
        primaryHex: '#3b82f6',
        secondaryHex: '#22c55e',
        accentHex: '#06b6d4'
      },
      style: {
        aesthetic: 'active, healing, movement-focused with professional clinical feel',
        competitors: ['ATI Physical Therapy', 'FYZICAL', 'Athletico'],
        imageStyle: 'physical therapist working with patient, rehabilitation exercises, therapy equipment, movement and mobility training, recovery sessions'
      }
    },
    keywords: [
      'physical therapy', 'physiotherapy', 'rehabilitation', 'rehab', 'PT',
      'physical therapist', 'sports therapy', 'injury recovery', 'mobility',
      'therapeutic exercise', 'manual therapy', 'orthopedic therapy', 'pain management'
    ],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TEAM', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'mental-health',
    label: 'Mental Health & Counseling',
    description: 'Therapy, counseling, and mental wellness services',
    emoji: '🧠',
    colorTheme: {
      primary: 'purple',
      secondary: 'blue',
      accent: 'teal',
      background: 'stone',
      text: 'slate',
      mood: 'calm',
    },
    designSystem: {
      typography: {
        heading: 'Lora',
        body: 'Open Sans'
      },
      colors: {
        primaryHex: '#7c3aed',
        secondaryHex: '#3b82f6',
        accentHex: '#14b8a6'
      },
      style: {
        aesthetic: 'calming, supportive, welcoming with warm professional atmosphere',
        competitors: ['BetterHelp', 'Talkspace', 'Headspace'],
        imageStyle: 'peaceful therapy office, calm consultation spaces, supportive counseling imagery, serene wellness environments, mindfulness and mental health'
      }
    },
    keywords: [
      'mental health', 'therapy', 'counseling', 'counselling', 'therapist',
      'psychologist', 'psychology', 'psychiatry', 'psychiatrist', 'mental wellness',
      'behavioral health', 'emotional health', 'psychotherapy', 'anxiety', 'depression'
    ],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TEAM', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'veterinary',
    label: 'Veterinary Clinic',
    description: 'Veterinary and animal healthcare services',
    emoji: '🐕',
    colorTheme: {
      primary: 'green',
      secondary: 'blue',
      accent: 'orange',
      background: 'slate',
      text: 'gray',
      mood: 'warm',
    },
    designSystem: {
      typography: {
        heading: 'Inter',
        body: 'Inter'
      },
      colors: {
        primaryHex: '#22c55e',
        secondaryHex: '#3b82f6',
        accentHex: '#f97316'
      },
      style: {
        aesthetic: 'caring, professional, pet-friendly with warm welcoming atmosphere',
        competitors: ['Banfield Pet Hospital', 'VCA Animal Hospitals', 'BluePearl'],
        imageStyle: 'veterinarian with pets, animal hospital interior, pet examination, caring vet staff, happy healthy pets, professional animal care'
      }
    },
    keywords: [
      'veterinary', 'vet', 'veterinarian', 'animal hospital', 'pet clinic',
      'pet care', 'animal care', 'pet health', 'animal health', 'pet medical',
      'dog', 'cat', 'pet wellness', 'animal wellness'
    ],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TEAM', 'TESTIMONIALS', 'CONTACT'],
  },

  // Beauty & Personal Care
  {
    id: 'beauty-spa',
    label: 'Beauty & Spa',
    description: 'Spa and beauty treatments',
    emoji: '💆',
    colorTheme: {
      primary: 'pink',
      secondary: 'rose',
      accent: 'teal',
      background: 'stone',
      text: 'slate',
      mood: 'elegant',
    },
    designSystem: {
      typography: {
        heading: 'Cinzel',
        body: 'Montserrat'
      },
      colors: {
        primaryHex: '#ec4899',
        secondaryHex: '#f43f5e',
        accentHex: '#14b8a6'
      },
      style: {
        aesthetic: 'serene, luxurious, calming with soft colors and elegant touches',
        competitors: ['Canyon Ranch', 'Spa at Four Seasons', 'Miraval'],
        imageStyle: 'tranquil spa environments, beauty treatments, relaxation imagery, zen aesthetics, soft natural lighting'
      }
    },
    keywords: ['spa', 'beauty', 'wellness', 'relaxation', 'treatments', 'massage', 'skincare'],
    recommendedSections: ['HERO', 'SERVICES', 'GALLERY', 'PRICING', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'hair-salon',
    label: 'Hair Salon',
    description: 'Hair styling and coloring',
    emoji: '💇',
    colorTheme: {
      primary: 'pink',
      secondary: 'rose',
      accent: 'amber',
      background: 'zinc',
      text: 'slate',
      mood: 'elegant',
    },
    keywords: ['hair', 'salon', 'styling', 'beauty', 'haircut'],
    recommendedSections: ['HERO', 'SERVICES', 'GALLERY', 'TEAM', 'PRICING', 'CONTACT'],
  },

  // Real Estate & Construction
  {
    id: 'real-estate',
    label: 'Real Estate',
    description: 'Property sales and leasing',
    emoji: '🏡',
    colorTheme: {
      primary: 'blue',
      secondary: 'slate',
      accent: 'amber',
      background: 'zinc',
      text: 'gray',
      mood: 'luxurious',
    },
    designSystem: {
      typography: {
        heading: 'Playfair Display',
        body: 'Inter'
      },
      colors: {
        primaryHex: '#1e3a5f',
        secondaryHex: '#334155',
        accentHex: '#d4af37'
      },
      style: {
        aesthetic: 'elegant, sophisticated, high-end luxury with modern sleek design',
        competitors: ['Sothebys Realty', 'Christie\'s Real Estate', 'Compass'],
        imageStyle: 'stunning full-width luxury property photography, architectural details, elegant interiors'
      }
    },
    keywords: ['real estate', 'property', 'homes', 'listings', 'agent', 'luxury', 'premium'],
    recommendedSections: ['HERO', 'SERVICES', 'PORTFOLIO', 'ABOUT', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'construction',
    label: 'Construction',
    description: 'Construction and building services',
    emoji: '🏗️',
    colorTheme: {
      primary: 'orange',
      secondary: 'slate',
      accent: 'blue',
      background: 'zinc',
      text: 'gray',
      mood: 'professional',
    },
    keywords: ['construction', 'building', 'contractor', 'renovation', 'commercial'],
    recommendedSections: ['HERO', 'SERVICES', 'PORTFOLIO', 'ABOUT', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'electrician',
    label: 'Electrician',
    description: 'Electrical services and repairs',
    emoji: '⚡',
    colorTheme: {
      primary: 'yellow',
      secondary: 'blue',
      accent: 'orange',
      background: 'slate',
      text: 'gray',
      mood: 'professional',
    },
    designSystem: {
      typography: {
        heading: 'Inter',
        body: 'Inter'
      },
      colors: {
        primaryHex: '#eab308',
        secondaryHex: '#3b82f6',
        accentHex: '#f97316'
      },
      style: {
        aesthetic: 'professional, trustworthy, safety-focused with modern clean design',
        competitors: ['Mister Sparky', 'Benjamin Franklin Plumbing', 'HomeAdvisor Pros'],
        imageStyle: 'professional electrician at work, home electrical panels, modern lighting installations, safety equipment, clean residential and commercial settings'
      }
    },
    keywords: ['electrician', 'electrical', 'wiring', 'electric', 'panel', 'circuit breaker', 'lighting', 'outlet', 'electrical repair', 'electrical installation', 'residential electrical', 'commercial electrical'],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TESTIMONIALS', 'CONTACT', 'CTA'],
  },
  {
    id: 'plumber',
    label: 'Plumber',
    description: 'Plumbing services and repairs',
    emoji: '🔧',
    colorTheme: {
      primary: 'blue',
      secondary: 'cyan',
      accent: 'slate',
      background: 'zinc',
      text: 'gray',
      mood: 'professional',
    },
    designSystem: {
      typography: {
        heading: 'Inter',
        body: 'Inter'
      },
      colors: {
        primaryHex: '#3b82f6',
        secondaryHex: '#06b6d4',
        accentHex: '#64748b'
      },
      style: {
        aesthetic: 'reliable, professional, clean and trustworthy service-focused design',
        competitors: ['Roto-Rooter', 'Benjamin Franklin Plumbing', 'Mr. Rooter'],
        imageStyle: 'professional plumber working, modern fixtures, pipes and plumbing systems, clean residential bathrooms and kitchens, professional tools and equipment'
      }
    },
    keywords: ['plumber', 'plumbing', 'drain', 'pipe', 'leak', 'water heater', 'faucet', 'toilet', 'sink', 'sewer', 'plumbing repair', 'emergency plumber', 'residential plumbing', 'commercial plumbing'],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TESTIMONIALS', 'CONTACT', 'CTA'],
  },
  {
    id: 'hvac',
    label: 'HVAC',
    description: 'Heating, ventilation, and air conditioning services',
    emoji: '❄️',
    colorTheme: {
      primary: 'sky',
      secondary: 'red',
      accent: 'slate',
      background: 'zinc',
      text: 'gray',
      mood: 'professional',
    },
    designSystem: {
      typography: {
        heading: 'Inter',
        body: 'Inter'
      },
      colors: {
        primaryHex: '#0ea5e9',
        secondaryHex: '#ef4444',
        accentHex: '#64748b'
      },
      style: {
        aesthetic: 'modern, comfortable, climate-focused with professional service design',
        competitors: ['Carrier', 'Trane', 'Lennox Dealers'],
        imageStyle: 'HVAC technician servicing units, modern air conditioning systems, heating equipment, clean home interiors with climate control, professional installation work'
      }
    },
    keywords: ['hvac', 'heating', 'cooling', 'air conditioning', 'furnace', 'ac repair', 'hvac installation', 'air conditioner', 'heater', 'ductwork', 'ventilation', 'climate control', 'ac service', 'heating repair'],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TESTIMONIALS', 'CONTACT', 'CTA'],
  },
  {
    id: 'roofer',
    label: 'Roofer',
    description: 'Roofing services and repairs',
    emoji: '🏠',
    colorTheme: {
      primary: 'slate',
      secondary: 'red',
      accent: 'orange',
      background: 'zinc',
      text: 'gray',
      mood: 'professional',
    },
    designSystem: {
      typography: {
        heading: 'Inter',
        body: 'Inter'
      },
      colors: {
        primaryHex: '#475569',
        secondaryHex: '#dc2626',
        accentHex: '#f97316'
      },
      style: {
        aesthetic: 'solid, dependable, protective service with professional craftsmanship',
        competitors: ['GAF Master Elite', 'CertainTeed SELECT ShingleMaster', 'Owens Corning Preferred Contractors'],
        imageStyle: 'professional roofers at work, quality roofing materials, residential homes with beautiful roofs, roofing installation and repair, safety equipment on job sites'
      }
    },
    keywords: ['roofer', 'roofing', 'roof repair', 'roof replacement', 'shingles', 'roof installation', 'leak repair', 'gutter', 'residential roofing', 'commercial roofing', 'roof inspection', 'storm damage'],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TESTIMONIALS', 'CONTACT', 'CTA'],
  },
  {
    id: 'interior-design',
    label: 'Interior Design',
    description: 'Interior design and decoration',
    emoji: '🛋️',
    colorTheme: {
      primary: 'slate',
      secondary: 'amber',
      accent: 'teal',
      background: 'stone',
      text: 'gray',
      mood: 'elegant',
    },
    keywords: ['interior design', 'decoration', 'home', 'style', 'modern'],
    recommendedSections: ['HERO', 'PORTFOLIO', 'SERVICES', 'ABOUT', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'landscaping',
    label: 'Landscaping',
    description: 'Landscape design and maintenance',
    emoji: '🌳',
    colorTheme: {
      primary: 'emerald',
      secondary: 'green',
      accent: 'lime',
      background: 'stone',
      text: 'slate',
      mood: 'natural',
    },
    keywords: ['landscaping', 'garden', 'outdoor', 'lawn', 'maintenance'],
    recommendedSections: ['HERO', 'SERVICES', 'GALLERY', 'ABOUT', 'TESTIMONIALS', 'CONTACT'],
  },

  // Technology & Digital
  {
    id: 'tech-saas',
    label: 'Tech/SaaS',
    description: 'Technology and software services',
    emoji: '💻',
    colorTheme: {
      primary: 'blue',
      secondary: 'cyan',
      accent: 'teal',
      background: 'slate',
      text: 'gray',
      mood: 'professional',
    },
    designSystem: {
      typography: {
        heading: 'Inter',
        body: 'Inter'
      },
      colors: {
        primaryHex: '#2563eb',
        secondaryHex: '#0ea5e9',
        accentHex: '#06b6d4'
      },
      style: {
        aesthetic: 'modern, clean, innovative tech-forward design with gradients',
        competitors: ['Stripe', 'Notion', 'Linear', 'Vercel'],
        imageStyle: 'sleek product screenshots, dashboard interfaces, modern tech illustrations, abstract gradients'
      }
    },
    keywords: ['technology', 'software', 'saas', 'app', 'platform', 'cloud', 'automation'],
    recommendedSections: ['HERO', 'FEATURES', 'PRICING', 'TESTIMONIALS', 'CTA', 'CONTACT'],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    description: 'Online retail store',
    emoji: '🛒',
    colorTheme: {
      primary: 'blue',
      secondary: 'orange',
      accent: 'green',
      background: 'slate',
      text: 'gray',
      mood: 'vibrant',
    },
    keywords: ['ecommerce', 'shop', 'store', 'online', 'retail'],
    recommendedSections: ['HERO', 'SERVICES', 'GALLERY', 'TESTIMONIALS', 'CTA', 'CONTACT'],
  },

  // Creative & Media
  {
    id: 'creative-agency',
    label: 'Creative Agency',
    description: 'Design and creative services',
    emoji: '🎨',
    colorTheme: {
      primary: 'cyan',
      secondary: 'teal',
      accent: 'orange',
      background: 'slate',
      text: 'gray',
      mood: 'creative',
    },
    designSystem: {
      typography: {
        heading: 'Space Grotesk',
        body: 'Inter'
      },
      colors: {
        primaryHex: '#0891b2',
        secondaryHex: '#14b8a6',
        accentHex: '#f97316'
      },
      style: {
        aesthetic: 'bold, creative, experimental with vibrant colors and unique layouts',
        competitors: ['Pentagram', 'IDEO', 'MetaLab', 'Clay'],
        imageStyle: 'creative work showcases, bold graphic designs, colorful branding projects, innovative campaigns'
      }
    },
    keywords: ['creative', 'design', 'agency', 'branding', 'digital', 'innovative', 'artistic'],
    recommendedSections: ['HERO', 'PORTFOLIO', 'SERVICES', 'ABOUT', 'TEAM', 'CONTACT'],
  },
  {
    id: 'marketing-agency',
    label: 'Marketing Agency',
    description: 'Marketing and advertising services',
    emoji: '📢',
    colorTheme: {
      primary: 'orange',
      secondary: 'blue',
      accent: 'cyan',
      background: 'slate',
      text: 'gray',
      mood: 'creative',
    },
    keywords: ['marketing', 'advertising', 'digital', 'agency', 'strategy'],
    recommendedSections: ['HERO', 'SERVICES', 'PORTFOLIO', 'ABOUT', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'photography',
    label: 'Photography',
    description: 'Professional photography services',
    emoji: '📷',
    colorTheme: {
      primary: 'slate',
      secondary: 'zinc',
      accent: 'amber',
      background: 'stone',
      text: 'gray',
      mood: 'minimal',
    },
    keywords: ['photography', 'photographer', 'photos', 'portrait', 'wedding'],
    recommendedSections: ['HERO', 'PORTFOLIO', 'SERVICES', 'ABOUT', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'music-entertainment',
    label: 'Music & Entertainment',
    description: 'Music and entertainment services',
    emoji: '🎵',
    colorTheme: {
      primary: 'blue',
      secondary: 'cyan',
      accent: 'orange',
      background: 'slate',
      text: 'gray',
      mood: 'vibrant',
    },
    keywords: ['music', 'entertainment', 'band', 'performance', 'events'],
    recommendedSections: ['HERO', 'PORTFOLIO', 'SERVICES', 'ABOUT', 'CONTACT'],
  },

  // Fashion & Retail
  {
    id: 'fashion',
    label: 'Fashion & Retail',
    description: 'Fashion and clothing retail',
    emoji: '👗',
    colorTheme: {
      primary: 'zinc',
      secondary: 'pink',
      accent: 'amber',
      background: 'slate',
      text: 'gray',
      mood: 'elegant',
    },
    keywords: ['fashion', 'retail', 'clothing', 'style', 'boutique'],
    recommendedSections: ['HERO', 'GALLERY', 'SERVICES', 'ABOUT', 'CONTACT'],
  },

  // Automotive
  {
    id: 'automotive',
    label: 'Automotive',
    description: 'Auto sales and services',
    emoji: '🚗',
    colorTheme: {
      primary: 'red',
      secondary: 'slate',
      accent: 'orange',
      background: 'zinc',
      text: 'gray',
      mood: 'energetic',
    },
    keywords: ['automotive', 'car', 'vehicle', 'dealership', 'service'],
    recommendedSections: ['HERO', 'SERVICES', 'GALLERY', 'ABOUT', 'TESTIMONIALS', 'CONTACT'],
  },

  // Hospitality & Travel
  {
    id: 'hospitality',
    label: 'Hotel & Hospitality',
    description: 'Hotels and accommodations',
    emoji: '🏨',
    colorTheme: {
      primary: 'blue',
      secondary: 'amber',
      accent: 'teal',
      background: 'stone',
      text: 'slate',
      mood: 'luxurious',
    },
    keywords: ['hotel', 'hospitality', 'accommodation', 'resort', 'booking'],
    recommendedSections: ['HERO', 'SERVICES', 'GALLERY', 'PRICING', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'travel-agency',
    label: 'Travel Agency',
    description: 'Travel planning and booking',
    emoji: '✈️',
    colorTheme: {
      primary: 'blue',
      secondary: 'orange',
      accent: 'teal',
      background: 'slate',
      text: 'gray',
      mood: 'vibrant',
    },
    keywords: ['travel', 'vacation', 'tourism', 'booking', 'adventure'],
    recommendedSections: ['HERO', 'SERVICES', 'GALLERY', 'TESTIMONIALS', 'CTA', 'CONTACT'],
  },

  // Logistics & Transportation
  {
    id: 'logistics',
    label: 'Logistics & Shipping',
    description: 'Freight, shipping, and logistics services',
    emoji: '🚢',
    colorTheme: {
      primary: 'blue',
      secondary: 'slate',
      accent: 'orange',
      background: 'zinc',
      text: 'gray',
      mood: 'professional',
    },
    designSystem: {
      typography: {
        heading: 'Inter',
        body: 'Inter'
      },
      colors: {
        primaryHex: '#1e40af',
        secondaryHex: '#475569',
        accentHex: '#f97316'
      },
      style: {
        aesthetic: 'professional, reliable, global reach with industrial efficiency',
        competitors: ['Maersk', 'DHL', 'FedEx Freight', 'UPS Supply Chain'],
        imageStyle: 'container ships at port, cargo logistics, warehouse operations, freight trucks, global supply chain, shipping containers'
      }
    },
    keywords: [
      'logistics', 'shipping', 'freight', 'cargo', 'supply chain', 'warehouse',
      'distribution', 'delivery', 'transport', 'container', 'port', 'maritime',
      'trucking', 'shipping routes', 'global logistics', 'fulfillment', 'tracking'
    ],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'FEATURES', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'transportation',
    label: 'Transportation Services',
    description: 'Passenger and freight transportation',
    emoji: '🚛',
    colorTheme: {
      primary: 'slate',
      secondary: 'blue',
      accent: 'amber',
      background: 'zinc',
      text: 'gray',
      mood: 'professional',
    },
    designSystem: {
      typography: {
        heading: 'Inter',
        body: 'Inter'
      },
      colors: {
        primaryHex: '#334155',
        secondaryHex: '#2563eb',
        accentHex: '#f59e0b'
      },
      style: {
        aesthetic: 'reliable, efficient, professional fleet management',
        competitors: ['J.B. Hunt', 'Schneider', 'Werner Enterprises'],
        imageStyle: 'professional trucks on highway, fleet of vehicles, transportation hub, cargo movement, road freight, delivery operations'
      }
    },
    keywords: [
      'transportation', 'trucking', 'freight', 'hauling', 'fleet', 'carrier',
      'haulage', 'road transport', 'heavy transport', 'commercial vehicles',
      'long haul', 'delivery service', 'cargo transport', 'logistics'
    ],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'FLEET', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'courier',
    label: 'Courier & Delivery',
    description: 'Same-day and express delivery services',
    emoji: '📦',
    colorTheme: {
      primary: 'orange',
      secondary: 'blue',
      accent: 'green',
      background: 'slate',
      text: 'gray',
      mood: 'energetic',
    },
    designSystem: {
      typography: {
        heading: 'Inter',
        body: 'Inter'
      },
      colors: {
        primaryHex: '#ea580c',
        secondaryHex: '#2563eb',
        accentHex: '#16a34a'
      },
      style: {
        aesthetic: 'fast, reliable, customer-focused delivery excellence',
        competitors: ['FedEx', 'UPS', 'DHL Express'],
        imageStyle: 'courier delivering package, delivery van, happy customer receiving package, express delivery operations, tracking technology'
      }
    },
    keywords: [
      'courier', 'delivery', 'express', 'same-day', 'package', 'parcel',
      'last mile', 'doorstep delivery', 'pickup', 'dispatch', 'tracking',
      'fast delivery', 'overnight shipping', 'local delivery'
    ],
    recommendedSections: ['HERO', 'SERVICES', 'FEATURES', 'PRICING', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'moving-company',
    label: 'Moving Company',
    description: 'Residential and commercial moving services',
    emoji: '🏠',
    colorTheme: {
      primary: 'blue',
      secondary: 'orange',
      accent: 'green',
      background: 'slate',
      text: 'gray',
      mood: 'trustworthy',
    },
    designSystem: {
      typography: {
        heading: 'Inter',
        body: 'Inter'
      },
      colors: {
        primaryHex: '#2563eb',
        secondaryHex: '#f97316',
        accentHex: '#22c55e'
      },
      style: {
        aesthetic: 'trustworthy, careful, stress-free relocation services',
        competitors: ['Two Men and a Truck', 'United Van Lines', 'Mayflower'],
        imageStyle: 'professional movers handling furniture, moving truck, happy family in new home, packing services, careful handling of belongings'
      }
    },
    keywords: [
      'moving', 'relocation', 'movers', 'packing', 'storage', 'household',
      'commercial moving', 'residential moving', 'long distance moving',
      'local moving', 'furniture moving', 'office relocation'
    ],
    recommendedSections: ['HERO', 'SERVICES', 'PRICING', 'TESTIMONIALS', 'ABOUT', 'CONTACT'],
  },

  // Events & Special Services
  {
    id: 'event-planning',
    label: 'Event Planning',
    description: 'Event planning and coordination',
    emoji: '🎉',
    colorTheme: {
      primary: 'blue',
      secondary: 'cyan',
      accent: 'amber',
      background: 'slate',
      text: 'gray',
      mood: 'creative',
    },
    keywords: ['events', 'planning', 'coordination', 'party', 'celebration'],
    recommendedSections: ['HERO', 'SERVICES', 'PORTFOLIO', 'ABOUT', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'wedding-planning',
    label: 'Wedding Planning',
    description: 'Wedding planning services',
    emoji: '💍',
    colorTheme: {
      primary: 'rose',
      secondary: 'pink',
      accent: 'amber',
      background: 'stone',
      text: 'slate',
      mood: 'elegant',
    },
    keywords: ['wedding', 'planning', 'bridal', 'ceremony', 'celebration'],
    recommendedSections: ['HERO', 'SERVICES', 'PORTFOLIO', 'ABOUT', 'TESTIMONIALS', 'CONTACT'],
  },

  // Education & Non-profit
  {
    id: 'education',
    label: 'Education',
    description: 'Educational services and schools',
    emoji: '🎓',
    colorTheme: {
      primary: 'blue',
      secondary: 'green',
      accent: 'amber',
      background: 'slate',
      text: 'gray',
      mood: 'trustworthy',
    },
    keywords: ['education', 'school', 'learning', 'training', 'courses'],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TEAM', 'TESTIMONIALS', 'CONTACT'],
  },
  {
    id: 'nonprofit',
    label: 'Non-profit',
    description: 'Non-profit organizations',
    emoji: '❤️',
    colorTheme: {
      primary: 'blue',
      secondary: 'green',
      accent: 'red',
      background: 'slate',
      text: 'gray',
      mood: 'trustworthy',
    },
    keywords: ['nonprofit', 'charity', 'organization', 'donation', 'community'],
    recommendedSections: ['HERO', 'ABOUT', 'SERVICES', 'TESTIMONIALS', 'CTA', 'CONTACT'],
  },

  // Pet Services
  {
    id: 'pet-services',
    label: 'Pet Services',
    description: 'Pet care and veterinary services',
    emoji: '🐾',
    colorTheme: {
      primary: 'orange',
      secondary: 'blue',
      accent: 'green',
      background: 'slate',
      text: 'gray',
      mood: 'warm',
    },
    keywords: ['pet', 'veterinary', 'grooming', 'care', 'animals'],
    recommendedSections: ['HERO', 'SERVICES', 'ABOUT', 'TEAM', 'TESTIMONIALS', 'CONTACT'],
  },

  // Personal & Portfolio
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Personal portfolio website',
    emoji: '📁',
    colorTheme: {
      primary: 'slate',
      secondary: 'blue',
      accent: 'cyan',
      background: 'zinc',
      text: 'gray',
      mood: 'minimal',
    },
    keywords: ['portfolio', 'personal', 'work', 'projects', 'showcase'],
    recommendedSections: ['HERO', 'PORTFOLIO', 'ABOUT', 'SERVICES', 'CONTACT'],
  },
  {
    id: 'personal-blog',
    label: 'Personal Blog',
    description: 'Personal blog and writing',
    emoji: '✍️',
    colorTheme: {
      primary: 'slate',
      secondary: 'blue',
      accent: 'orange',
      background: 'stone',
      text: 'gray',
      mood: 'minimal',
    },
    keywords: ['blog', 'personal', 'writing', 'content', 'articles'],
    recommendedSections: ['HERO', 'BLOG', 'ABOUT', 'NEWSLETTER', 'CONTACT'],
  },
];

// Category groupings for easier navigation
export const BUSINESS_CATEGORIES: BusinessTypeCategory[] = [
  {
    category: 'Food & Beverage',
    types: ['restaurant', 'bakery', 'coffee-shop', 'food-delivery'],
  },
  {
    category: 'Professional Services',
    types: ['law-firm', 'accounting', 'consulting', 'financial', 'insurance'],
  },
  {
    category: 'Healthcare & Wellness',
    types: ['medical', 'dental', 'eye-care', 'pharmacy', 'chiropractic', 'physical-therapy', 'mental-health', 'veterinary', 'fitness', 'yoga-studio'],
  },
  {
    category: 'Beauty & Personal Care',
    types: ['beauty-spa', 'hair-salon'],
  },
  {
    category: 'Real Estate & Construction',
    types: ['real-estate', 'construction', 'interior-design', 'landscaping'],
  },
  {
    category: 'Technology & Digital',
    types: ['tech-saas', 'ecommerce'],
  },
  {
    category: 'Creative & Media',
    types: ['creative-agency', 'marketing-agency', 'photography', 'music-entertainment'],
  },
  {
    category: 'Fashion & Retail',
    types: ['fashion'],
  },
  {
    category: 'Automotive',
    types: ['automotive'],
  },
  {
    category: 'Hospitality & Travel',
    types: ['hospitality', 'travel-agency'],
  },
  {
    category: 'Logistics & Transportation',
    types: ['logistics', 'transportation', 'courier', 'moving-company'],
  },
  {
    category: 'Home Services',
    types: ['electrician', 'plumber', 'hvac', 'roofer'],
  },
  {
    category: 'Events & Special Services',
    types: ['event-planning', 'wedding-planning'],
  },
  {
    category: 'Education & Non-profit',
    types: ['education', 'nonprofit'],
  },
  {
    category: 'Pet Services',
    types: ['pet-services'],
  },
  {
    category: 'Personal',
    types: ['portfolio', 'personal-blog'],
  },
];

// Helper functions
export function getBusinessTypeById(id: string): BusinessTypeConfig | undefined {
  return BUSINESS_TYPES.find((type) => type.id === id);
}

export function getBusinessTypesByCategory(category: string): BusinessTypeConfig[] {
  const categoryConfig = BUSINESS_CATEGORIES.find((cat) => cat.category === category);
  if (!categoryConfig) return [];

  return categoryConfig.types
    .map((typeId) => getBusinessTypeById(typeId))
    .filter((type): type is BusinessTypeConfig => type !== undefined);
}

export function searchBusinessTypes(query: string): BusinessTypeConfig[] {
  const lowerQuery = query.toLowerCase();
  return BUSINESS_TYPES.filter(
    (type) =>
      type.label.toLowerCase().includes(lowerQuery) ||
      type.description.toLowerCase().includes(lowerQuery) ||
      type.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
  );
}
