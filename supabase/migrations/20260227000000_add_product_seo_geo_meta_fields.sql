-- Add SEO, GEO, and META tag fields to products table
-- This migration adds comprehensive fields for product optimization

-- ===========================================
-- SEO FIELDS
-- ===========================================

-- Add short description
ALTER TABLE products
ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Add SEO meta keywords (array)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS meta_keywords TEXT[];

-- Add focus keyword for SEO
ALTER TABLE products
ADD COLUMN IF NOT EXISTS focus_keyword TEXT;

-- Add canonical URL
ALTER TABLE products
ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- ===========================================
-- GEOGRAPHIC TARGETING FIELDS
-- ===========================================

-- Enable/disable geographic targeting
ALTER TABLE products
ADD COLUMN IF NOT EXISTS geo_targeting_enabled BOOLEAN DEFAULT FALSE;

-- Target countries (array of country names/codes)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS target_countries TEXT[];

-- Target regions/states (array)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS target_regions TEXT[];

-- Target cities (array)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS target_cities TEXT[];

-- ===========================================
-- OPEN GRAPH (Social Media) FIELDS
-- ===========================================

-- Open Graph title
ALTER TABLE products
ADD COLUMN IF NOT EXISTS og_title TEXT;

-- Open Graph description
ALTER TABLE products
ADD COLUMN IF NOT EXISTS og_description TEXT;

-- Open Graph image URL
ALTER TABLE products
ADD COLUMN IF NOT EXISTS og_image TEXT;

-- Open Graph type (product, website, article, etc.)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS og_type TEXT DEFAULT 'product';

-- ===========================================
-- TWITTER CARD FIELDS
-- ===========================================

-- Twitter card type
ALTER TABLE products
ADD COLUMN IF NOT EXISTS twitter_card_type TEXT DEFAULT 'summary_large_image'
  CHECK (twitter_card_type IN ('summary', 'summary_large_image', 'app', 'player'));

-- Twitter title
ALTER TABLE products
ADD COLUMN IF NOT EXISTS twitter_title TEXT;

-- Twitter description
ALTER TABLE products
ADD COLUMN IF NOT EXISTS twitter_description TEXT;

-- Twitter image URL
ALTER TABLE products
ADD COLUMN IF NOT EXISTS twitter_image TEXT;

-- ===========================================
-- SCHEMA.ORG STRUCTURED DATA FIELDS
-- ===========================================

-- Enable/disable schema.org structured data
ALTER TABLE products
ADD COLUMN IF NOT EXISTS schema_enabled BOOLEAN DEFAULT TRUE;

-- Brand name
ALTER TABLE products
ADD COLUMN IF NOT EXISTS brand TEXT;

-- GTIN (Global Trade Item Number - UPC/EAN/ISBN)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS gtin TEXT;

-- MPN (Manufacturer Part Number)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS mpn TEXT;

-- Product condition
ALTER TABLE products
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'new'
  CHECK (condition IN ('new', 'refurbished', 'used'));

-- Availability status for schema
ALTER TABLE products
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'in_stock'
  CHECK (availability IN ('in_stock', 'out_of_stock', 'preorder', 'discontinued'));

-- ===========================================
-- ADDITIONAL PRODUCT FIELDS
-- ===========================================

-- Product tags (array)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Dimensions
ALTER TABLE products
ADD COLUMN IF NOT EXISTS length DECIMAL(10,2);

ALTER TABLE products
ADD COLUMN IF NOT EXISTS width DECIMAL(10,2);

ALTER TABLE products
ADD COLUMN IF NOT EXISTS height DECIMAL(10,2);

ALTER TABLE products
ADD COLUMN IF NOT EXISTS dimension_unit TEXT DEFAULT 'in'
  CHECK (dimension_unit IN ('in', 'cm', 'ft', 'm'));

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Index for focus keyword searches
CREATE INDEX IF NOT EXISTS idx_products_focus_keyword ON products(focus_keyword);

-- Index for brand searches
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

-- Index for condition
CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition);

-- Index for availability
CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability);

-- GIN index for array searches (keywords, tags, countries)
CREATE INDEX IF NOT EXISTS idx_products_meta_keywords ON products USING GIN(meta_keywords);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_target_countries ON products USING GIN(target_countries);

-- ===========================================
-- COMMENTS FOR DOCUMENTATION
-- ===========================================

COMMENT ON COLUMN products.short_description IS 'Brief product description for listings';
COMMENT ON COLUMN products.meta_keywords IS 'SEO meta keywords array';
COMMENT ON COLUMN products.focus_keyword IS 'Primary SEO keyword to rank for';
COMMENT ON COLUMN products.canonical_url IS 'Canonical URL to prevent duplicate content';
COMMENT ON COLUMN products.geo_targeting_enabled IS 'Enable geographic targeting restrictions';
COMMENT ON COLUMN products.target_countries IS 'Array of target country names/codes';
COMMENT ON COLUMN products.target_regions IS 'Array of target regions/states';
COMMENT ON COLUMN products.target_cities IS 'Array of target cities';
COMMENT ON COLUMN products.og_title IS 'Open Graph title for social sharing';
COMMENT ON COLUMN products.og_description IS 'Open Graph description for social sharing';
COMMENT ON COLUMN products.og_image IS 'Open Graph image URL for social sharing';
COMMENT ON COLUMN products.og_type IS 'Open Graph type (product, website, article, etc.)';
COMMENT ON COLUMN products.twitter_card_type IS 'Twitter card type (summary, summary_large_image, etc.)';
COMMENT ON COLUMN products.twitter_title IS 'Twitter card title';
COMMENT ON COLUMN products.twitter_description IS 'Twitter card description';
COMMENT ON COLUMN products.twitter_image IS 'Twitter card image URL';
COMMENT ON COLUMN products.schema_enabled IS 'Enable Schema.org structured data output';
COMMENT ON COLUMN products.brand IS 'Product brand name for structured data';
COMMENT ON COLUMN products.gtin IS 'Global Trade Item Number (UPC/EAN/ISBN)';
COMMENT ON COLUMN products.mpn IS 'Manufacturer Part Number';
COMMENT ON COLUMN products.condition IS 'Product condition (new, refurbished, used)';
COMMENT ON COLUMN products.availability IS 'Product availability status for schema.org';
COMMENT ON COLUMN products.tags IS 'Product tags array for categorization';
COMMENT ON COLUMN products.length IS 'Product length dimension';
COMMENT ON COLUMN products.width IS 'Product width dimension';
COMMENT ON COLUMN products.height IS 'Product height dimension';
COMMENT ON COLUMN products.dimension_unit IS 'Unit for dimensions (in, cm, ft, m)';
