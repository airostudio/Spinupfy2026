/**
 * Extras & Add-ons Catalog
 *
 * Comprehensive catalog of installable features for websites.
 * Each extra is business-type aware and integrates with Stripe Connect.
 */

export type ExtraCategory =
  | 'booking'      // Reservations, appointments, accommodations
  | 'ecommerce'    // Products, tickets, memberships
  | 'scheduling'   // Classes, events, tours
  | 'engagement'   // Forms, quizzes, calculators
  | 'media'        // Galleries, videos, portfolios
  | 'community'    // Forums, reviews, testimonials
  | 'analytics';   // Tracking, reporting, insights

export type PaymentProvider = 'stripe' | 'none';

export interface ExtraConfig {
  id: string;
  name: string;
  description: string;
  category: ExtraCategory;
  icon: string; // Lucide icon name

  // Business type relevance (1-10 score)
  relevanceByBusinessType: Record<string, number>;

  // Payment integration
  requiresPayment: boolean;
  paymentProvider?: PaymentProvider;
  stripeConnectRequired?: boolean;

  // Technical requirements
  requiresDatabase: boolean;
  requiresEmailService: boolean;
  requiresCalendar: boolean;
  requiresFileStorage: boolean;

  // Pricing (for user)
  pricing: {
    free: boolean;
    monthlyFee?: number; // USD
    transactionFee?: number; // Percentage
    setupFee?: number; // One-time USD
  };

  // Features included
  features: string[];

  // Setup wizard configuration
  wizard: {
    steps: ExtraWizardStep[];
    estimatedSetupTime: string; // "5 minutes", "10 minutes", etc.
  };

  // Schema/data model
  dataModel: any; // Will be defined per extra

  // Component template
  componentTemplate: string; // Path to React component
}

export interface ExtraWizardStep {
  id: string;
  title: string;
  description: string;
  type: 'config' | 'design' | 'content' | 'payment' | 'review';
  fields: ExtraWizardField[];
  optional?: boolean;
}

export interface ExtraWizardField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'toggle' | 'color' | 'image' | 'textarea';
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: any;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// ===================
// EXTRAS CATALOG
// ===================

export const EXTRAS_CATALOG: ExtraConfig[] = [
  // ===================
  // BOOKING CATEGORY
  // ===================

  {
    id: 'accommodation-booking',
    name: 'Accommodation Booking System',
    description: 'Full-featured booking system for hotels, B&Bs, vacation rentals, and lodging properties',
    category: 'booking',
    icon: 'Hotel',

    relevanceByBusinessType: {
      'hospitality': 10,
      'travel-agency': 8,
      'real-estate': 6,
      'event-planning': 5,
    },

    requiresPayment: true,
    paymentProvider: 'stripe',
    stripeConnectRequired: true,

    requiresDatabase: true,
    requiresEmailService: true,
    requiresCalendar: true,
    requiresFileStorage: false,

    pricing: {
      free: false,
      monthlyFee: 29,
      transactionFee: 2.5,
      setupFee: 0,
    },

    features: [
      'Real-time availability calendar',
      'Multiple room types & rates',
      'Seasonal pricing & discounts',
      'Instant booking confirmation',
      'Guest management portal',
      'Automatic email notifications',
      'Stripe payment processing',
      'Cancellation policies',
      'Min/max night stays',
      'Check-in/out times',
      'Guest reviews & ratings',
      'Booking analytics dashboard',
    ],

    wizard: {
      estimatedSetupTime: '15 minutes',
      steps: [
        {
          id: 'property-info',
          title: 'Property Information',
          description: 'Tell us about your property',
          type: 'config',
          fields: [
            { id: 'propertyName', label: 'Property Name', type: 'text', required: true },
            { id: 'propertyType', label: 'Property Type', type: 'select', required: true, options: [
              { label: 'Hotel', value: 'hotel' },
              { label: 'Bed & Breakfast', value: 'bnb' },
              { label: 'Vacation Rental', value: 'vacation-rental' },
              { label: 'Hostel', value: 'hostel' },
              { label: 'Resort', value: 'resort' },
            ]},
            { id: 'address', label: 'Address', type: 'text', required: true },
            { id: 'checkinTime', label: 'Check-in Time', type: 'text', defaultValue: '3:00 PM' },
            { id: 'checkoutTime', label: 'Check-out Time', type: 'text', defaultValue: '11:00 AM' },
          ],
        },
        {
          id: 'rooms',
          title: 'Room Types',
          description: 'Set up your room types and pricing',
          type: 'config',
          fields: [
            { id: 'roomTypes', label: 'Room Types', type: 'textarea',
              placeholder: 'Example:\nStandard Room - $99/night - 2 guests\nDeluxe Suite - $149/night - 4 guests',
              required: true
            },
          ],
        },
        {
          id: 'policies',
          title: 'Booking Policies',
          description: 'Set your cancellation and booking rules',
          type: 'config',
          fields: [
            { id: 'cancellationPolicy', label: 'Cancellation Policy', type: 'select', options: [
              { label: 'Flexible (Free cancellation 24h before)', value: 'flexible' },
              { label: 'Moderate (Free cancellation 5 days before)', value: 'moderate' },
              { label: 'Strict (50% refund 7 days before, no refund after)', value: 'strict' },
              { label: 'Non-refundable', value: 'non-refundable' },
            ]},
            { id: 'minNights', label: 'Minimum Nights', type: 'number', defaultValue: 1 },
            { id: 'maxNights', label: 'Maximum Nights', type: 'number', defaultValue: 30 },
            { id: 'requireDeposit', label: 'Require Deposit', type: 'toggle', defaultValue: true },
          ],
        },
        {
          id: 'payment-setup',
          title: 'Payment Setup',
          description: 'Connect your Stripe account to accept payments',
          type: 'payment',
          fields: [
            { id: 'stripeConnect', label: 'Connect Stripe', type: 'text', required: true },
          ],
        },
        {
          id: 'design',
          title: 'Customize Design',
          description: 'Match your website\'s branding',
          type: 'design',
          fields: [
            { id: 'primaryColor', label: 'Primary Color', type: 'color' },
            { id: 'layout', label: 'Layout Style', type: 'select', options: [
              { label: 'Calendar View', value: 'calendar' },
              { label: 'List View', value: 'list' },
              { label: 'Grid View', value: 'grid' },
            ]},
          ],
        },
        {
          id: 'review',
          title: 'Review & Launch',
          description: 'Review your configuration and go live',
          type: 'review',
          fields: [],
        },
      ],
    },

    dataModel: {
      properties: { name: 'string', type: 'string', address: 'string' },
      roomTypes: { name: 'string', price: 'number', capacity: 'number', amenities: 'array' },
      bookings: { guestName: 'string', email: 'string', checkin: 'date', checkout: 'date', roomId: 'string', status: 'string', totalPrice: 'number' },
      availability: { roomId: 'string', date: 'date', available: 'boolean' },
    },

    componentTemplate: '/extras/AccommodationBooking.tsx',
  },

  {
    id: 'table-reservation',
    name: 'Table Reservation System',
    description: 'Restaurant table booking with party size, time slots, and special requests',
    category: 'booking',
    icon: 'UtensilsCrossed',

    relevanceByBusinessType: {
      'restaurant': 10,
      'bakery': 6,
      'coffee-shop': 7,
      'food-delivery': 3,
      'hospitality': 8,
    },

    requiresPayment: false, // Optional deposit
    paymentProvider: 'stripe',
    stripeConnectRequired: false,

    requiresDatabase: true,
    requiresEmailService: true,
    requiresCalendar: true,
    requiresFileStorage: false,

    pricing: {
      free: true,
      monthlyFee: 0,
      transactionFee: 0,
      setupFee: 0,
    },

    features: [
      'Real-time table availability',
      'Time slot management',
      'Party size customization',
      'Special requests & dietary needs',
      'SMS & email confirmations',
      'No-show protection (optional deposits)',
      'Floor plan visualization',
      'Wait list management',
      'Reservation history',
      'Peak hours management',
      'Table turn time optimization',
      'Guest preferences tracking',
    ],

    wizard: {
      estimatedSetupTime: '10 minutes',
      steps: [
        {
          id: 'restaurant-info',
          title: 'Restaurant Details',
          description: 'Basic information about your restaurant',
          type: 'config',
          fields: [
            { id: 'restaurantName', label: 'Restaurant Name', type: 'text', required: true },
            { id: 'cuisine', label: 'Cuisine Type', type: 'text' },
            { id: 'phone', label: 'Phone Number', type: 'text', required: true },
            { id: 'email', label: 'Email', type: 'text', required: true },
          ],
        },
        {
          id: 'tables',
          title: 'Table Configuration',
          description: 'Set up your tables and seating',
          type: 'config',
          fields: [
            { id: 'totalTables', label: 'Total Tables', type: 'number', required: true },
            { id: 'maxPartySize', label: 'Maximum Party Size', type: 'number', defaultValue: 8 },
            { id: 'tableSizes', label: 'Table Sizes', type: 'textarea',
              placeholder: '2-person tables: 5\n4-person tables: 8\n6-person tables: 3'
            },
          ],
        },
        {
          id: 'hours',
          title: 'Operating Hours',
          description: 'When do you accept reservations?',
          type: 'config',
          fields: [
            { id: 'openDays', label: 'Open Days', type: 'multiselect', options: [
              { label: 'Monday', value: 'mon' },
              { label: 'Tuesday', value: 'tue' },
              { label: 'Wednesday', value: 'wed' },
              { label: 'Thursday', value: 'thu' },
              { label: 'Friday', value: 'fri' },
              { label: 'Saturday', value: 'sat' },
              { label: 'Sunday', value: 'sun' },
            ]},
            { id: 'lunchStart', label: 'Lunch Start', type: 'text', defaultValue: '11:30 AM' },
            { id: 'lunchEnd', label: 'Lunch End', type: 'text', defaultValue: '2:30 PM' },
            { id: 'dinnerStart', label: 'Dinner Start', type: 'text', defaultValue: '5:00 PM' },
            { id: 'dinnerEnd', label: 'Dinner End', type: 'text', defaultValue: '10:00 PM' },
            { id: 'timeSlotInterval', label: 'Time Slot Interval (minutes)', type: 'number', defaultValue: 15 },
          ],
        },
        {
          id: 'policies',
          title: 'Reservation Policies',
          description: 'Set your booking rules',
          type: 'config',
          fields: [
            { id: 'requireDeposit', label: 'Require Deposit for Large Parties', type: 'toggle', defaultValue: false },
            { id: 'depositAmount', label: 'Deposit Amount (per person)', type: 'number', defaultValue: 20 },
            { id: 'largePartySize', label: 'Large Party Size (for deposit)', type: 'number', defaultValue: 6 },
            { id: 'cancellationWindow', label: 'Cancellation Window (hours)', type: 'number', defaultValue: 24 },
          ],
        },
        {
          id: 'design',
          title: 'Customize Appearance',
          description: 'Match your restaurant\'s style',
          type: 'design',
          fields: [
            { id: 'primaryColor', label: 'Primary Color', type: 'color' },
            { id: 'showFloorPlan', label: 'Show Floor Plan', type: 'toggle', defaultValue: false },
          ],
        },
        {
          id: 'review',
          title: 'Review & Activate',
          description: 'Review and activate your reservation system',
          type: 'review',
          fields: [],
        },
      ],
    },

    dataModel: {
      restaurant: { name: 'string', cuisine: 'string', phone: 'string', email: 'string' },
      tables: { tableNumber: 'number', capacity: 'number', location: 'string' },
      reservations: { guestName: 'string', email: 'string', phone: 'string', partySize: 'number', date: 'date', time: 'string', specialRequests: 'string', status: 'string' },
      timeSlots: { date: 'date', time: 'string', availableTables: 'number' },
    },

    componentTemplate: '/extras/TableReservation.tsx',
  },

  {
    id: 'ticket-sales',
    name: 'Ticket Sales & Event Registration',
    description: 'Sell tickets for concerts, shows, classes, tours, and events',
    category: 'ecommerce',
    icon: 'Ticket',

    relevanceByBusinessType: {
      'music-entertainment': 10,
      'event-planning': 10,
      'fitness': 8,
      'yoga-studio': 7,
      'education': 6,
      'travel-agency': 8,
      'creative-agency': 5,
    },

    requiresPayment: true,
    paymentProvider: 'stripe',
    stripeConnectRequired: true,

    requiresDatabase: true,
    requiresEmailService: true,
    requiresCalendar: true,
    requiresFileStorage: true, // For QR codes

    pricing: {
      free: false,
      monthlyFee: 19,
      transactionFee: 3.5,
      setupFee: 0,
    },

    features: [
      'Multiple ticket tiers (GA, VIP, etc.)',
      'Early bird & group discounts',
      'Capacity & sold-out management',
      'QR code ticket generation',
      'Mobile ticket delivery',
      'Check-in app for events',
      'Waitlist for sold-out events',
      'Refund management',
      'Real-time sales dashboard',
      'Attendee list export',
      'Custom ticket designs',
      'Seating chart (optional)',
    ],

    wizard: {
      estimatedSetupTime: '12 minutes',
      steps: [
        {
          id: 'event-info',
          title: 'Event Information',
          description: 'Tell us about your event',
          type: 'config',
          fields: [
            { id: 'eventName', label: 'Event Name', type: 'text', required: true },
            { id: 'eventType', label: 'Event Type', type: 'select', options: [
              { label: 'Concert/Show', value: 'concert' },
              { label: 'Workshop/Class', value: 'workshop' },
              { label: 'Tour/Experience', value: 'tour' },
              { label: 'Conference', value: 'conference' },
              { label: 'Sports Event', value: 'sports' },
              { label: 'Other', value: 'other' },
            ]},
            { id: 'eventDate', label: 'Event Date', type: 'text', required: true },
            { id: 'eventTime', label: 'Event Time', type: 'text', required: true },
            { id: 'venue', label: 'Venue/Location', type: 'text', required: true },
            { id: 'description', label: 'Event Description', type: 'textarea' },
          ],
        },
        {
          id: 'tickets',
          title: 'Ticket Types & Pricing',
          description: 'Set up your ticket tiers',
          type: 'config',
          fields: [
            { id: 'ticketTiers', label: 'Ticket Tiers', type: 'textarea', required: true,
              placeholder: 'General Admission - $25 - 200 tickets\nVIP - $75 - 50 tickets\nEarly Bird - $20 - 100 tickets (until Dec 1)'
            },
            { id: 'totalCapacity', label: 'Total Capacity', type: 'number', required: true },
            { id: 'enableGroupDiscounts', label: 'Enable Group Discounts', type: 'toggle', defaultValue: false },
          ],
        },
        {
          id: 'policies',
          title: 'Ticketing Policies',
          description: 'Set your refund and transfer policies',
          type: 'config',
          fields: [
            { id: 'refundPolicy', label: 'Refund Policy', type: 'select', options: [
              { label: 'Full refund up to 7 days before', value: 'flexible' },
              { label: 'Full refund up to 30 days before', value: 'moderate' },
              { label: 'No refunds', value: 'no-refund' },
              { label: 'Custom policy', value: 'custom' },
            ]},
            { id: 'allowTransfers', label: 'Allow Ticket Transfers', type: 'toggle', defaultValue: true },
            { id: 'requireIdAtEntry', label: 'Require ID at Entry', type: 'toggle', defaultValue: false },
          ],
        },
        {
          id: 'payment-setup',
          title: 'Payment Setup',
          description: 'Connect Stripe to accept ticket payments',
          type: 'payment',
          fields: [
            { id: 'stripeConnect', label: 'Connect Stripe', type: 'text', required: true },
          ],
        },
        {
          id: 'design',
          title: 'Ticket Design',
          description: 'Customize your tickets',
          type: 'design',
          fields: [
            { id: 'ticketColor', label: 'Ticket Color', type: 'color' },
            { id: 'logo', label: 'Event Logo', type: 'image' },
            { id: 'includeQRCode', label: 'Include QR Code', type: 'toggle', defaultValue: true },
          ],
        },
        {
          id: 'review',
          title: 'Review & Launch',
          description: 'Review and start selling tickets',
          type: 'review',
          fields: [],
        },
      ],
    },

    dataModel: {
      events: { name: 'string', type: 'string', date: 'date', time: 'string', venue: 'string', capacity: 'number', status: 'string' },
      ticketTiers: { eventId: 'string', name: 'string', price: 'number', quantity: 'number', sold: 'number' },
      tickets: { ticketId: 'string', eventId: 'string', tierId: 'string', buyerName: 'string', email: 'string', qrCode: 'string', checkedIn: 'boolean' },
      sales: { eventId: 'string', amount: 'number', ticketsSold: 'number', date: 'date' },
    },

    componentTemplate: '/extras/TicketSales.tsx',
  },

  {
    id: 'appointment-booking',
    name: 'Appointment Scheduling',
    description: 'Professional appointment booking for services, consultations, and meetings',
    category: 'scheduling',
    icon: 'Calendar',

    relevanceByBusinessType: {
      'beauty-spa': 10,
      'hair-salon': 10,
      'medical': 10,
      'dental': 10,
      'law-firm': 8,
      'consulting': 9,
      'accounting': 8,
      'fitness': 7,
      'photography': 7,
      'real-estate': 6,
    },

    requiresPayment: false,
    stripeConnectRequired: false,

    requiresDatabase: true,
    requiresEmailService: true,
    requiresCalendar: true,
    requiresFileStorage: false,

    pricing: {
      free: true,
      monthlyFee: 0,
      transactionFee: 0,
    },

    features: [
      'Real-time availability calendar',
      'Multiple staff/provider scheduling',
      'Service duration customization',
      'Buffer time between appointments',
      'Email & SMS reminders',
      'Recurring appointments',
      'Cancellation & rescheduling',
      'Client notes & history',
      'Google Calendar sync',
      'Timezone handling',
      'Waitlist for cancellations',
      'No-show tracking',
    ],

    wizard: {
      estimatedSetupTime: '8 minutes',
      steps: [
        {
          id: 'business-info',
          title: 'Business Information',
          description: 'Basic details about your business',
          type: 'config',
          fields: [
            { id: 'businessName', label: 'Business Name', type: 'text', required: true },
            { id: 'businessType', label: 'Business Type', type: 'select', options: [
              { label: 'Salon/Spa', value: 'salon' },
              { label: 'Medical/Dental', value: 'medical' },
              { label: 'Consulting', value: 'consulting' },
              { label: 'Legal Services', value: 'legal' },
              { label: 'Fitness/Training', value: 'fitness' },
              { label: 'Other', value: 'other' },
            ]},
            { id: 'timezone', label: 'Timezone', type: 'select', options: [
              { label: 'Eastern Time (ET)', value: 'America/New_York' },
              { label: 'Central Time (CT)', value: 'America/Chicago' },
              { label: 'Mountain Time (MT)', value: 'America/Denver' },
              { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
            ]},
          ],
        },
        {
          id: 'services',
          title: 'Services Offered',
          description: 'What services do you provide?',
          type: 'config',
          fields: [
            { id: 'services', label: 'Services & Durations', type: 'textarea', required: true,
              placeholder: 'Haircut - 45 minutes\nColor Treatment - 90 minutes\nConsultation - 30 minutes'
            },
          ],
        },
        {
          id: 'staff',
          title: 'Staff & Providers',
          description: 'Who provides these services?',
          type: 'config',
          fields: [
            { id: 'staffMembers', label: 'Staff Members', type: 'textarea',
              placeholder: 'Jane Smith - Stylist\nJohn Doe - Colorist'
            },
            { id: 'allowClientToChooseStaff', label: 'Allow Clients to Choose Staff', type: 'toggle', defaultValue: true },
          ],
        },
        {
          id: 'hours',
          title: 'Business Hours',
          description: 'When are you available?',
          type: 'config',
          fields: [
            { id: 'openDays', label: 'Open Days', type: 'multiselect', options: [
              { label: 'Monday', value: 'mon' },
              { label: 'Tuesday', value: 'tue' },
              { label: 'Wednesday', value: 'wed' },
              { label: 'Thursday', value: 'thu' },
              { label: 'Friday', value: 'fri' },
              { label: 'Saturday', value: 'sat' },
              { label: 'Sunday', value: 'sun' },
            ]},
            { id: 'startTime', label: 'Start Time', type: 'text', defaultValue: '9:00 AM' },
            { id: 'endTime', label: 'End Time', type: 'text', defaultValue: '6:00 PM' },
            { id: 'bufferTime', label: 'Buffer Between Appointments (minutes)', type: 'number', defaultValue: 15 },
          ],
        },
        {
          id: 'policies',
          title: 'Booking Policies',
          description: 'Set your cancellation and rescheduling rules',
          type: 'config',
          fields: [
            { id: 'cancellationWindow', label: 'Cancellation Window (hours)', type: 'number', defaultValue: 24 },
            { id: 'enableReminders', label: 'Send Appointment Reminders', type: 'toggle', defaultValue: true },
            { id: 'reminderTiming', label: 'Reminder Timing (hours before)', type: 'number', defaultValue: 24 },
          ],
        },
        {
          id: 'review',
          title: 'Review & Activate',
          description: 'Review and activate your booking system',
          type: 'review',
          fields: [],
        },
      ],
    },

    dataModel: {
      business: { name: 'string', type: 'string', timezone: 'string' },
      services: { name: 'string', duration: 'number', price: 'number' },
      staff: { name: 'string', email: 'string', services: 'array' },
      appointments: { clientName: 'string', email: 'string', phone: 'string', serviceId: 'string', staffId: 'string', date: 'date', time: 'string', status: 'string' },
      availability: { staffId: 'string', date: 'date', timeSlots: 'array' },
    },

    componentTemplate: '/extras/AppointmentBooking.tsx',
  },

  // Continue with more extras...
  // I'll add more in the next sections
];

/**
 * Get relevant extras for a business type
 */
export function getRelevantExtras(businessType: string, limit: number = 5): ExtraConfig[] {
  return EXTRAS_CATALOG
    .filter(extra => extra.relevanceByBusinessType[businessType] !== undefined)
    .sort((a, b) => {
      const scoreA = a.relevanceByBusinessType[businessType] || 0;
      const scoreB = b.relevanceByBusinessType[businessType] || 0;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

/**
 * Get all extras by category
 */
export function getExtrasByCategory(category: ExtraCategory): ExtraConfig[] {
  return EXTRAS_CATALOG.filter(extra => extra.category === category);
}

/**
 * Get extra by ID
 */
export function getExtraById(id: string): ExtraConfig | undefined {
  return EXTRAS_CATALOG.find(extra => extra.id === id);
}

/**
 * Get top recommended extras for business type
 */
export function getTopRecommendations(businessType: string): ExtraConfig[] {
  return getRelevantExtras(businessType, 3);
}
