-- Ecommerce Schema for AI Website Creator
-- This schema adds complete ecommerce functionality with Stripe Connect integration

-- Store Settings Table
-- Stores Stripe Connect account info and store configuration
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,

  -- Store Information
  store_name TEXT NOT NULL,
  store_description TEXT,
  currency TEXT NOT NULL DEFAULT 'usd',

  -- Stripe Connect Information
  stripe_account_id TEXT UNIQUE, -- Stripe Connect Express Account ID
  stripe_onboarding_completed BOOLEAN DEFAULT FALSE,
  stripe_charges_enabled BOOLEAN DEFAULT FALSE,
  stripe_payouts_enabled BOOLEAN DEFAULT FALSE,

  -- Platform Fee (1.632% as specified)
  platform_fee_percentage DECIMAL(5,3) DEFAULT 1.632,

  -- Store Settings
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  shipping_enabled BOOLEAN DEFAULT TRUE,
  inventory_tracking BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(website_id)
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,

  -- Product Information
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,

  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2), -- Original price for showing discounts
  cost_per_item DECIMAL(10,2), -- Cost basis for profit tracking

  -- Inventory
  sku TEXT,
  barcode TEXT,
  track_inventory BOOLEAN DEFAULT TRUE,
  inventory_quantity INTEGER DEFAULT 0,
  allow_backorder BOOLEAN DEFAULT FALSE,

  -- Physical Properties
  weight DECIMAL(10,2), -- in pounds or kg
  weight_unit TEXT DEFAULT 'lb',
  requires_shipping BOOLEAN DEFAULT TRUE,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  featured BOOLEAN DEFAULT FALSE,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(store_id, slug)
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  url TEXT NOT NULL,
  alt_text TEXT,
  position INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Categories Table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(store_id, slug)
);

-- Product-Category Relationship
CREATE TABLE IF NOT EXISTS product_category_relations (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,

  PRIMARY KEY (product_id, category_id)
);

-- Product Variants Table (for products with options like size, color)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  title TEXT NOT NULL, -- e.g., "Small / Red"
  sku TEXT,
  barcode TEXT,

  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  cost_per_item DECIMAL(10,2),

  inventory_quantity INTEGER DEFAULT 0,

  -- Variant options (stored as JSON)
  options JSONB, -- e.g., {"size": "Small", "color": "Red"}

  position INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,

  -- Order Number (human-readable)
  order_number TEXT NOT NULL UNIQUE,

  -- Customer Information
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,

  -- Shipping Address
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT DEFAULT 'US',

  -- Billing Address (if different)
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_postal_code TEXT,
  billing_country TEXT DEFAULT 'US',

  -- Order Totals
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  shipping_amount DECIMAL(10,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,

  -- Platform Fee Calculation
  platform_fee DECIMAL(10,2) NOT NULL, -- Our 1.632% fee
  merchant_payout DECIMAL(10,2) NOT NULL, -- Amount transferred to merchant

  -- Payment Information
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_transfer_id TEXT, -- Transfer to connected account
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),

  -- Order Status
  fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled', 'cancelled')),

  -- Tracking
  tracking_number TEXT,
  tracking_url TEXT,
  carrier TEXT,

  -- Notes
  customer_note TEXT,
  staff_note TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,

  -- Product snapshot at time of purchase
  product_name TEXT NOT NULL,
  variant_title TEXT,
  sku TEXT,

  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL, -- Price per unit at time of purchase
  total DECIMAL(10,2) NOT NULL, -- quantity * price

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipping Rates Table
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,

  name TEXT NOT NULL, -- e.g., "Standard Shipping", "Express"
  description TEXT,

  rate_type TEXT NOT NULL CHECK (rate_type IN ('flat', 'weight_based', 'price_based')),

  -- Flat rate
  flat_rate DECIMAL(10,2),

  -- Weight-based (price per lb/kg)
  weight_rate DECIMAL(10,2),
  min_weight DECIMAL(10,2),
  max_weight DECIMAL(10,2),

  -- Price-based (free shipping over X)
  min_order_amount DECIMAL(10,2),

  -- Geographic restrictions
  countries TEXT[], -- Array of country codes, empty = all countries

  active BOOLEAN DEFAULT TRUE,
  position INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discount Codes Table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,

  code TEXT NOT NULL,
  description TEXT,

  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,

  -- Usage limits
  usage_limit INTEGER, -- NULL = unlimited
  usage_count INTEGER DEFAULT 0,
  per_customer_limit INTEGER,

  -- Requirements
  minimum_purchase_amount DECIMAL(10,2),

  -- Validity
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(store_id, code)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Enable Row Level Security
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_category_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Stores
CREATE POLICY "Users can view their own stores" ON stores FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own stores" ON stores FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own stores" ON stores FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own stores" ON stores FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for Products (store owners can manage, public can view active products)
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Store owners can manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.user_id = auth.uid())
);

-- RLS Policies for Product Images
CREATE POLICY "Anyone can view product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Store owners can manage product images" ON product_images FOR ALL USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON stores.id = products.store_id
    WHERE products.id = product_images.product_id AND stores.user_id = auth.uid()
  )
);

-- RLS Policies for Orders
CREATE POLICY "Store owners can view their orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.user_id = auth.uid())
);
CREATE POLICY "Customers can view their orders" ON orders FOR SELECT USING (customer_email = auth.email());
CREATE POLICY "Store owners can manage orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.user_id = auth.uid())
);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipping_rates_updated_at BEFORE UPDATE ON shipping_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON discount_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inventory Management Functions
CREATE OR REPLACE FUNCTION decrement_product_inventory(product_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET inventory_quantity = inventory_quantity - quantity
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_variant_inventory(variant_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE product_variants
  SET inventory_quantity = inventory_quantity - quantity
  WHERE id = variant_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_product_inventory(product_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET inventory_quantity = inventory_quantity + quantity
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_variant_inventory(variant_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE product_variants
  SET inventory_quantity = inventory_quantity + quantity
  WHERE id = variant_id;
END;
$$ LANGUAGE plpgsql;
