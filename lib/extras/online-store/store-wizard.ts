/**
 * Online Store Intelligent Wizard
 *
 * Comprehensive wizard that determines store requirements through intelligent questioning
 * and automatically configures the optimal e-commerce solution with sample products.
 */

export interface StoreWizardResponse {
  // Business Information
  businessName: string;
  businessType: 'physical_products' | 'digital_products' | 'services' | 'mixed';
  primaryCategory: string; // clothing, electronics, food, etc.
  targetAudience: string;

  // Product Strategy
  productCount: 'few' | 'medium' | 'many'; // <10, 10-100, 100+
  productTypes: string[]; // What kinds of products
  priceRange: { min: number; max: number };
  hasVariants: boolean; // Size, color, etc.

  // Fulfillment
  shippingMethod: 'physical' | 'digital' | 'pickup' | 'mixed';
  shippingRegions: 'local' | 'national' | 'international';
  inventoryTracking: boolean;

  // Features Needed
  needsSubscriptions: boolean;
  needsPreorders: boolean;
  needsWaitlist: boolean;
  needsWholesale: boolean;
  needsGiftCards: boolean;
  needsLoyaltyProgram: boolean;

  // Marketing
  needsDiscountCodes: boolean;
  needsAbandonedCart: boolean;
  needsEmailMarketing: boolean;
  needsProductReviews: boolean;

  // Design Preferences
  layoutStyle: 'grid' | 'list' | 'masonry' | 'minimal';
  colorScheme: string;
  showInventoryCount: boolean;
  enableQuickView: boolean;
}

export interface StoreConfiguration {
  // Generated from wizard responses
  features: string[];
  sampleProducts: Product[];
  collections: Collection[];
  shippingRules: ShippingRule[];
  taxSettings: TaxSettings;
  emailTemplates: EmailTemplate[];
  designConfig: DesignConfig;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number; // For sale pricing
  images: string[];
  category: string;
  tags: string[];
  variants?: ProductVariant[];
  inventory?: {
    sku: string;
    quantity: number;
    trackInventory: boolean;
    allowBackorders: boolean;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  isDigital: boolean;
  digitalFile?: {
    url: string;
    downloadLimit: number;
  };
}

export interface ProductVariant {
  id: string;
  name: string; // "Small / Red"
  options: { option: string; value: string }[]; // [{option: "Size", value: "Small"}, {option: "Color", value: "Red"}]
  price: number;
  sku: string;
  inventory: number;
  image?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  slug: string;
  products: string[]; // Product IDs
  image?: string;
  sortOrder: 'manual' | 'price_asc' | 'price_desc' | 'newest' | 'bestselling';
}

export interface ShippingRule {
  id: string;
  name: string;
  regions: string[]; // Country codes
  method: 'flat_rate' | 'calculated' | 'free' | 'pickup';
  rate?: number;
  freeShippingThreshold?: number;
  estimatedDays: { min: number; max: number };
}

export interface TaxSettings {
  enabled: boolean;
  includedInPrices: boolean;
  automaticCalculation: boolean;
  rules: Array<{
    region: string;
    rate: number;
  }>;
}

export interface EmailTemplate {
  type: 'order_confirmation' | 'shipping_notification' | 'delivery_confirmation' | 'abandoned_cart' | 'refund_processed';
  subject: string;
  body: string;
  enabled: boolean;
}

export interface DesignConfig {
  layout: 'grid' | 'list' | 'masonry' | 'minimal';
  gridColumns: 2 | 3 | 4;
  cardStyle: 'elevated' | 'bordered' | 'flat';
  showQuickView: boolean;
  showWishlist: boolean;
  showCompare: boolean;
  imageRatio: 'square' | 'portrait' | 'landscape';
  hoverEffect: 'zoom' | 'lift' | 'none';
}

/**
 * Intelligent wizard questions that adapt based on previous answers
 */
export const STORE_WIZARD_QUESTIONS = [
  // STEP 1: Business Basics
  {
    id: 'business-basics',
    title: 'Tell us about your store',
    description: 'We\'ll use this to create the perfect shopping experience',
    questions: [
      {
        id: 'businessName',
        question: 'What\'s your store name?',
        type: 'text',
        placeholder: 'e.g., Artisan Goods Co.',
        required: true,
      },
      {
        id: 'businessType',
        question: 'What will you sell?',
        type: 'radio',
        options: [
          { value: 'physical_products', label: 'Physical Products', description: 'Items that need to be shipped' },
          { value: 'digital_products', label: 'Digital Products', description: 'Downloads, courses, software' },
          { value: 'services', label: 'Services', description: 'Bookings, consultations, memberships' },
          { value: 'mixed', label: 'Mix of Products & Services', description: 'Combination of the above' },
        ],
        required: true,
      },
      {
        id: 'primaryCategory',
        question: 'What category best describes your products?',
        type: 'select',
        dependsOn: { businessType: ['physical_products', 'mixed'] },
        options: [
          { value: 'clothing', label: 'Clothing & Fashion' },
          { value: 'electronics', label: 'Electronics & Tech' },
          { value: 'food', label: 'Food & Beverage' },
          { value: 'home', label: 'Home & Garden' },
          { value: 'beauty', label: 'Beauty & Personal Care' },
          { value: 'sports', label: 'Sports & Outdoors' },
          { value: 'books', label: 'Books & Media' },
          { value: 'art', label: 'Art & Collectibles' },
          { value: 'jewelry', label: 'Jewelry & Accessories' },
          { value: 'toys', label: 'Toys & Games' },
          { value: 'handmade', label: 'Handmade & Crafts' },
          { value: 'other', label: 'Other' },
        ],
        required: true,
      },
      {
        id: 'targetAudience',
        question: 'Who are your customers?',
        type: 'text',
        placeholder: 'e.g., Eco-conscious millennials, Professional photographers, etc.',
        required: false,
      },
    ],
  },

  // STEP 2: Product Details
  {
    id: 'product-details',
    title: 'Your product catalog',
    description: 'Help us understand your inventory',
    questions: [
      {
        id: 'productCount',
        question: 'How many products will you start with?',
        type: 'radio',
        options: [
          { value: 'few', label: 'Just a few (1-10)', description: 'Perfect for artisans, makers' },
          { value: 'medium', label: 'Medium catalog (10-100)', description: 'Small to medium business' },
          { value: 'many', label: 'Large catalog (100+)', description: 'Established business' },
        ],
        required: true,
      },
      {
        id: 'hasVariants',
        question: 'Do your products have options like size, color, or style?',
        type: 'toggle',
        description: 'e.g., T-shirts in Small/Medium/Large, Shoes in different colors',
        defaultValue: false,
      },
      {
        id: 'priceRange',
        question: 'What\'s your typical price range?',
        type: 'range',
        fields: [
          { id: 'min', label: 'Lowest Price', prefix: '$', type: 'number' },
          { id: 'max', label: 'Highest Price', prefix: '$', type: 'number' },
        ],
        required: true,
      },
      {
        id: 'productTypes',
        question: 'What types of products will you offer? (Select all that apply)',
        type: 'multiselect',
        options: [], // Dynamically generated based on primaryCategory
        dependsOn: { primaryCategory: ['clothing', 'electronics', 'food', 'home', 'beauty'] },
      },
    ],
  },

  // STEP 3: Fulfillment & Shipping
  {
    id: 'fulfillment',
    title: 'Shipping & fulfillment',
    description: 'How will customers receive their orders?',
    questions: [
      {
        id: 'shippingMethod',
        question: 'How will you deliver products?',
        type: 'radio',
        dependsOn: { businessType: ['physical_products', 'mixed'] },
        options: [
          { value: 'physical', label: 'Ship to customers', description: 'USPS, UPS, FedEx, etc.' },
          { value: 'pickup', label: 'Local pickup only', description: 'Customers pick up in person' },
          { value: 'mixed', label: 'Both shipping & pickup', description: 'Offer both options' },
        ],
        required: true,
      },
      {
        id: 'shippingRegions',
        question: 'Where will you ship?',
        type: 'radio',
        dependsOn: { shippingMethod: ['physical', 'mixed'] },
        options: [
          { value: 'local', label: 'Local area only', description: 'Within my city/region' },
          { value: 'national', label: 'Nationwide', description: 'Across the country' },
          { value: 'international', label: 'International', description: 'Ship worldwide' },
        ],
        required: true,
      },
      {
        id: 'inventoryTracking',
        question: 'Do you need to track inventory?',
        type: 'toggle',
        description: 'Monitor stock levels and get low-stock alerts',
        defaultValue: true,
      },
    ],
  },

  // STEP 4: Advanced Features
  {
    id: 'advanced-features',
    title: 'Power up your store',
    description: 'Choose features that fit your business model',
    questions: [
      {
        id: 'needsSubscriptions',
        question: 'Offer subscription products?',
        type: 'toggle',
        description: 'Monthly/annual recurring products (boxes, memberships, etc.)',
        defaultValue: false,
      },
      {
        id: 'needsPreorders',
        question: 'Allow pre-orders for upcoming products?',
        type: 'toggle',
        description: 'Let customers order products before they\'re in stock',
        defaultValue: false,
      },
      {
        id: 'needsWholesale',
        question: 'Offer wholesale pricing for bulk buyers?',
        type: 'toggle',
        description: 'Separate pricing for B2B customers',
        defaultValue: false,
      },
      {
        id: 'needsGiftCards',
        question: 'Sell gift cards?',
        type: 'toggle',
        description: 'Let customers purchase digital gift cards',
        defaultValue: false,
      },
      {
        id: 'needsLoyaltyProgram',
        question: 'Reward loyal customers with points?',
        type: 'toggle',
        description: 'Points-based rewards program',
        defaultValue: false,
      },
    ],
  },

  // STEP 5: Marketing Tools
  {
    id: 'marketing',
    title: 'Marketing & growth',
    description: 'Tools to help you sell more',
    questions: [
      {
        id: 'needsDiscountCodes',
        question: 'Use discount codes & promotions?',
        type: 'toggle',
        description: 'Create coupon codes, percentage/dollar discounts, BOGO deals',
        defaultValue: true,
      },
      {
        id: 'needsAbandonedCart',
        question: 'Recover abandoned carts?',
        type: 'toggle',
        description: 'Automatically email customers who left items in cart',
        defaultValue: true,
      },
      {
        id: 'needsEmailMarketing',
        question: 'Build an email list?',
        type: 'toggle',
        description: 'Collect emails for newsletters and promotions',
        defaultValue: true,
      },
      {
        id: 'needsProductReviews',
        question: 'Allow customer reviews?',
        type: 'toggle',
        description: 'Let customers rate and review products',
        defaultValue: true,
      },
    ],
  },

  // STEP 6: Store Design
  {
    id: 'design',
    title: 'Customize your store\'s look',
    description: 'Make it match your brand',
    questions: [
      {
        id: 'layoutStyle',
        question: 'How should products be displayed?',
        type: 'visual-select',
        options: [
          { value: 'grid', label: 'Grid', image: '/images/layouts/grid.svg', description: 'Classic product grid' },
          { value: 'list', label: 'List', image: '/images/layouts/list.svg', description: 'Detailed list view' },
          { value: 'masonry', label: 'Masonry', image: '/images/layouts/masonry.svg', description: 'Pinterest-style' },
          { value: 'minimal', label: 'Minimal', image: '/images/layouts/minimal.svg', description: 'Clean & simple' },
        ],
        required: true,
      },
      {
        id: 'showInventoryCount',
        question: 'Show remaining stock to customers?',
        type: 'toggle',
        description: 'Display "Only 3 left!" messages to create urgency',
        defaultValue: false,
      },
      {
        id: 'enableQuickView',
        question: 'Enable quick product preview?',
        type: 'toggle',
        description: 'Customers can view product details without leaving the page',
        defaultValue: true,
      },
    ],
  },

  // STEP 7: Payment Setup
  {
    id: 'payment',
    title: 'Payment setup',
    description: 'Connect Stripe to start accepting payments',
    questions: [
      {
        id: 'stripeConnect',
        question: 'Connect your Stripe account',
        type: 'stripe-oauth',
        description: 'Secure payment processing with Stripe',
        features: [
          'Accept credit cards, Apple Pay, Google Pay',
          'Automatic payouts to your bank',
          'Built-in fraud protection',
          '2.9% + 30¢ per transaction',
        ],
        required: true,
      },
    ],
  },

  // STEP 8: Sample Products
  {
    id: 'sample-products',
    title: 'We\'ll create sample products',
    description: 'Based on your answers, we\'ll add example products to get you started',
    questions: [
      {
        id: 'useSampleProducts',
        question: 'Add sample products to your store?',
        type: 'toggle',
        description: 'We\'ll create realistic example products you can customize or delete',
        defaultValue: true,
      },
    ],
  },
];

/**
 * Generate intelligent sample products based on wizard responses
 */
export function generateSampleProducts(responses: StoreWizardResponse): Product[] {
  const products: Product[] = [];

  // Product templates by category
  const productTemplates: Record<string, Array<Partial<Product>>> = {
    clothing: [
      {
        name: 'Classic Cotton T-Shirt',
        description: 'Soft, breathable cotton tee perfect for everyday wear. Pre-shrunk and tagless for comfort.',
        price: 24.99,
        compareAtPrice: 34.99,
        category: 'Apparel',
        tags: ['cotton', 'casual', 'basics', 'unisex'],
        variants: responses.hasVariants ? [
          { id: '1', name: 'Small / Black', options: [{option: 'Size', value: 'Small'}, {option: 'Color', value: 'Black'}], price: 24.99, sku: 'TSH-SM-BLK', inventory: 50 },
          { id: '2', name: 'Medium / Black', options: [{option: 'Size', value: 'Medium'}, {option: 'Color', value: 'Black'}], price: 24.99, sku: 'TSH-MD-BLK', inventory: 75 },
          { id: '3', name: 'Large / Black', options: [{option: 'Size', value: 'Large'}, {option: 'Color', value: 'Black'}], price: 24.99, sku: 'TSH-LG-BLK', inventory: 60 },
          { id: '4', name: 'Small / White', options: [{option: 'Size', value: 'Small'}, {option: 'Color', value: 'White'}], price: 24.99, sku: 'TSH-SM-WHT', inventory: 45 },
          { id: '5', name: 'Medium / White', options: [{option: 'Size', value: 'Medium'}, {option: 'Color', value: 'White'}], price: 24.99, sku: 'TSH-MD-WHT', inventory: 80 },
          { id: '6', name: 'Large / White', options: [{option: 'Size', value: 'Large'}, {option: 'Color', value: 'White'}], price: 24.99, sku: 'TSH-LG-WHT', inventory: 55 },
        ] : undefined,
        inventory: !responses.hasVariants ? { sku: 'TSH-001', quantity: 150, trackInventory: responses.inventoryTracking, allowBackorders: false } : undefined,
      },
      {
        name: 'Premium Denim Jeans',
        description: 'High-quality denim with a comfortable stretch. Classic fit that works for any occasion.',
        price: 79.99,
        compareAtPrice: 120.00,
        category: 'Apparel',
        tags: ['denim', 'jeans', 'premium', 'stretch'],
      },
      {
        name: 'Cozy Knit Sweater',
        description: 'Ultra-soft knit sweater perfect for layering. Machine washable and pill-resistant.',
        price: 59.99,
        category: 'Apparel',
        tags: ['sweater', 'knitwear', 'cozy', 'winter'],
      },
    ],
    electronics: [
      {
        name: 'Wireless Bluetooth Earbuds',
        description: 'Premium sound quality with active noise cancellation. 24-hour battery life with charging case.',
        price: 89.99,
        compareAtPrice: 129.99,
        category: 'Audio',
        tags: ['bluetooth', 'wireless', 'earbuds', 'audio'],
      },
      {
        name: 'Smart Watch Series 5',
        description: 'Fitness tracking, heart rate monitoring, GPS, and smartphone notifications all in one sleek device.',
        price: 249.99,
        category: 'Wearables',
        tags: ['smartwatch', 'fitness', 'wearable', 'tech'],
      },
      {
        name: 'Portable Power Bank 20000mAh',
        description: 'High-capacity power bank with fast charging. Charges most phones 4-5 times.',
        price: 39.99,
        category: 'Accessories',
        tags: ['powerbank', 'charging', 'portable', 'battery'],
      },
    ],
    // Add more categories...
  };

  // Get templates for selected category
  const templates = productTemplates[responses.primaryCategory] || productTemplates['clothing'];

  // Generate products based on count preference
  const productLimit = responses.productCount === 'few' ? 3 : responses.productCount === 'medium' ? 6 : 10;

  templates.slice(0, productLimit).forEach((template, index) => {
    products.push({
      id: `product_${index + 1}`,
      name: template.name!,
      description: template.description!,
      price: adjustPriceToRange(template.price!, responses.priceRange),
      compareAtPrice: template.compareAtPrice ? adjustPriceToRange(template.compareAtPrice, responses.priceRange) : undefined,
      images: generatePlaceholderImages(responses.primaryCategory, template.name!),
      category: template.category!,
      tags: template.tags!,
      variants: template.variants,
      inventory: template.inventory,
      seo: {
        title: template.name!,
        description: template.description!,
        keywords: template.tags!,
      },
      isDigital: responses.businessType === 'digital_products',
      digitalFile: responses.businessType === 'digital_products' ? {
        url: '/downloads/sample.pdf',
        downloadLimit: 3,
      } : undefined,
    });
  });

  return products;
}

/**
 * Adjust price to fit within user's specified range
 */
function adjustPriceToRange(price: number, range: { min: number; max: number }): number {
  if (price < range.min) return range.min;
  if (price > range.max) return range.max;
  return price;
}

/**
 * Generate placeholder images based on category
 */
function generatePlaceholderImages(category: string, productName: string): string[] {
  // In production, use Unsplash API or DALL-E to generate relevant images
  return [
    `https://via.placeholder.com/800x800?text=${encodeURIComponent(productName)}`,
    `https://via.placeholder.com/800x800?text=${encodeURIComponent(productName)}+2`,
    `https://via.placeholder.com/800x800?text=${encodeURIComponent(productName)}+3`,
  ];
}

/**
 * Generate store configuration from wizard responses
 */
export function generateStoreConfiguration(responses: StoreWizardResponse): StoreConfiguration {
  return {
    features: determineFeatures(responses),
    sampleProducts: generateSampleProducts(responses),
    collections: generateCollections(responses),
    shippingRules: generateShippingRules(responses),
    taxSettings: generateTaxSettings(responses),
    emailTemplates: generateEmailTemplates(responses),
    designConfig: generateDesignConfig(responses),
  };
}

function determineFeatures(responses: StoreWizardResponse): string[] {
  const features: string[] = ['basic-cart', 'checkout', 'order-management'];

  if (responses.needsSubscriptions) features.push('subscriptions');
  if (responses.needsPreorders) features.push('pre-orders');
  if (responses.needsWholesale) features.push('wholesale-pricing');
  if (responses.needsGiftCards) features.push('gift-cards');
  if (responses.needsLoyaltyProgram) features.push('loyalty-points');
  if (responses.needsDiscountCodes) features.push('discount-codes');
  if (responses.needsAbandonedCart) features.push('abandoned-cart-recovery');
  if (responses.needsEmailMarketing) features.push('email-marketing');
  if (responses.needsProductReviews) features.push('product-reviews');
  if (responses.inventoryTracking) features.push('inventory-management');

  return features;
}

function generateCollections(responses: StoreWizardResponse): Collection[] {
  // Auto-create collections based on product types
  return [
    {
      id: 'collection_1',
      name: 'All Products',
      description: 'Browse our complete collection',
      slug: 'all',
      products: [],
      sortOrder: 'manual',
    },
    {
      id: 'collection_2',
      name: 'Best Sellers',
      description: 'Our most popular items',
      slug: 'best-sellers',
      products: [],
      sortOrder: 'bestselling',
    },
    {
      id: 'collection_3',
      name: 'New Arrivals',
      description: 'Just added to the shop',
      slug: 'new',
      products: [],
      sortOrder: 'newest',
    },
  ];
}

function generateShippingRules(responses: StoreWizardResponse): ShippingRule[] {
  if (responses.shippingMethod === 'pickup') {
    return [{
      id: 'pickup',
      name: 'Local Pickup',
      regions: ['US'],
      method: 'pickup',
      estimatedDays: { min: 0, max: 1 },
    }];
  }

  const rules: ShippingRule[] = [];

  if (responses.shippingRegions === 'local') {
    rules.push({
      id: 'local',
      name: 'Local Delivery',
      regions: ['US'],
      method: 'flat_rate',
      rate: 5.00,
      freeShippingThreshold: 50.00,
      estimatedDays: { min: 1, max: 3 },
    });
  } else if (responses.shippingRegions === 'national') {
    rules.push(
      {
        id: 'standard',
        name: 'Standard Shipping',
        regions: ['US'],
        method: 'flat_rate',
        rate: 8.99,
        freeShippingThreshold: 75.00,
        estimatedDays: { min: 5, max: 7 },
      },
      {
        id: 'expedited',
        name: 'Expedited Shipping',
        regions: ['US'],
        method: 'flat_rate',
        rate: 18.99,
        estimatedDays: { min: 2, max: 3 },
      }
    );
  } else {
    rules.push(
      {
        id: 'domestic',
        name: 'Domestic Shipping',
        regions: ['US'],
        method: 'calculated',
        estimatedDays: { min: 5, max: 10 },
      },
      {
        id: 'international',
        name: 'International Shipping',
        regions: ['*'],
        method: 'calculated',
        estimatedDays: { min: 10, max: 21 },
      }
    );
  }

  return rules;
}

function generateTaxSettings(responses: StoreWizardResponse): TaxSettings {
  return {
    enabled: true,
    includedInPrices: false,
    automaticCalculation: true,
    rules: [
      { region: 'US-CA', rate: 0.0725 }, // California
      { region: 'US-NY', rate: 0.08 },   // New York
      { region: 'US-TX', rate: 0.0625 }, // Texas
    ],
  };
}

function generateEmailTemplates(responses: StoreWizardResponse): EmailTemplate[] {
  return [
    {
      type: 'order_confirmation',
      subject: `Order Confirmed - ${responses.businessName}`,
      body: `Thank you for your order! We'll send you tracking information once your order ships.`,
      enabled: true,
    },
    {
      type: 'shipping_notification',
      subject: `Your order has shipped!`,
      body: `Great news! Your order is on its way. Track your package: {{tracking_link}}`,
      enabled: true,
    },
    {
      type: 'abandoned_cart',
      subject: `Did you forget something?`,
      body: `You left some items in your cart. Complete your purchase now!`,
      enabled: responses.needsAbandonedCart,
    },
  ];
}

function generateDesignConfig(responses: StoreWizardResponse): DesignConfig {
  return {
    layout: responses.layoutStyle,
    gridColumns: responses.layoutStyle === 'grid' ? 3 : 2,
    cardStyle: 'elevated',
    showQuickView: responses.enableQuickView,
    showWishlist: true,
    showCompare: false,
    imageRatio: responses.primaryCategory === 'clothing' ? 'portrait' : 'square',
    hoverEffect: 'lift',
  };
}
