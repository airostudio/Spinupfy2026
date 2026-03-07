-- ============================================
-- Supabase Migration for AI Website Builder
-- ============================================
-- This replaces Prisma schema with native Supabase tables
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE subscription_plan AS ENUM ('FREE', 'STARTER', 'PRO', 'ENTERPRISE');
CREATE TYPE section_type AS ENUM (
  'HEADER', 'HERO', 'FEATURES', 'ABOUT', 'SERVICES', 'PRICING',
  'TESTIMONIALS', 'TEAM', 'PORTFOLIO', 'GALLERY',
  'CONTACT', 'CTA', 'FAQ', 'BLOG', 'NEWSLETTER',
  'FOOTER', 'STORE', 'CUSTOM',
  -- New section types added for enhanced functionality
  'BOOKING', 'TRUST_BADGES', 'MOBILE_STICKY_CTA',
  'LOAN_CALCULATOR', 'FLOATING_CTA', 'MENU', 'HOW_IT_WORKS'
);
CREATE TYPE api_service AS ENUM (
  'OPENAI_GPT4', 'OPENAI_GPT35', 'OPENAI_DALLE',
  'UNSPLASH', 'STRIPE'
);

-- ============================================
-- USERS TABLE
-- ============================================
-- Extends Supabase auth.users with app-specific data

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,

  -- Role and permissions
  role TEXT DEFAULT 'user' NOT NULL,

  -- Subscription info
  plan subscription_plan DEFAULT 'FREE' NOT NULL,
  plan_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,

  -- Usage tracking
  websites_created INTEGER DEFAULT 0 NOT NULL,
  ai_generations_used INTEGER DEFAULT 0 NOT NULL,
  ai_generations_limit INTEGER DEFAULT 10 NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- WEBSITES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,

  -- Metadata
  website_type TEXT,
  brand_name TEXT,
  logo_url TEXT,
  favicon TEXT,

  -- Publishing
  published BOOLEAN DEFAULT FALSE NOT NULL,
  published_at TIMESTAMPTZ,
  subdomain TEXT UNIQUE,
  custom_domain TEXT UNIQUE,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,

  -- Theme & Styling (JSON)
  theme JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for websites
CREATE INDEX idx_websites_user_id ON websites(user_id);
CREATE INDEX idx_websites_slug ON websites(slug);
CREATE INDEX idx_websites_subdomain ON websites(subdomain);
CREATE INDEX idx_websites_custom_domain ON websites(custom_domain);

-- ============================================
-- PAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  path TEXT DEFAULT '/' NOT NULL,

  -- Page metadata
  meta_title TEXT,
  meta_description TEXT,

  -- Page order and structure
  "order" INTEGER DEFAULT 0 NOT NULL,
  is_homepage BOOLEAN DEFAULT FALSE NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(website_id, slug)
);

-- Indexes for pages
CREATE INDEX idx_pages_website_id ON pages(website_id);

-- ============================================
-- SECTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type section_type NOT NULL,

  -- Section content and configuration (JSON)
  content JSONB NOT NULL,
  settings JSONB,

  -- Layout
  "order" INTEGER DEFAULT 0 NOT NULL,
  visible BOOLEAN DEFAULT TRUE NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for sections
CREATE INDEX idx_sections_page_id ON sections(page_id);

-- ============================================
-- API USAGE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- API details
  service api_service NOT NULL,
  endpoint TEXT NOT NULL,

  -- Cost and tokens
  tokens_used INTEGER DEFAULT 0 NOT NULL,
  cost_usd DECIMAL(10, 6) DEFAULT 0.0 NOT NULL,

  -- Request metadata (JSON)
  request_data JSONB,
  response_data JSONB,
  success BOOLEAN DEFAULT TRUE NOT NULL,
  error_message TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for api_usage
CREATE INDEX idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at);

-- ============================================
-- DOMAIN VERIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS domain_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT UNIQUE NOT NULL,

  -- Verification status
  verified BOOLEAN DEFAULT FALSE NOT NULL,
  verification_token TEXT UNIQUE NOT NULL,

  -- DNS records
  txt_record TEXT,
  cname_record TEXT,

  -- SSL
  ssl_enabled BOOLEAN DEFAULT FALSE NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  verified_at TIMESTAMPTZ
);

-- ============================================
-- ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL,

  -- Visit data
  page_url TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,

  -- Engagement
  session_duration INTEGER,

  -- Timestamp
  visited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for analytics
CREATE INDEX idx_analytics_website_id ON analytics(website_id);
CREATE INDEX idx_analytics_visited_at ON analytics(visited_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domain_verifications_updated_at BEFORE UPDATE ON domain_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can read their own websites
CREATE POLICY "Users can read own websites" ON websites
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create websites
CREATE POLICY "Users can create websites" ON websites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own websites
CREATE POLICY "Users can update own websites" ON websites
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own websites
CREATE POLICY "Users can delete own websites" ON websites
  FOR DELETE USING (auth.uid() = user_id);

-- Anyone can read published websites
CREATE POLICY "Anyone can read published websites" ON websites
  FOR SELECT USING (published = true);

-- Users can manage pages in their websites
CREATE POLICY "Users can read pages in own websites" ON pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = pages.website_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert pages in own websites" ON pages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = pages.website_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pages in own websites" ON pages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = pages.website_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pages in own websites" ON pages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = pages.website_id
      AND websites.user_id = auth.uid()
    )
  );

-- Similar policies for sections
CREATE POLICY "Users can manage sections in own websites" ON sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pages
      JOIN websites ON websites.id = pages.website_id
      WHERE pages.id = sections.page_id
      AND websites.user_id = auth.uid()
    )
  );

-- API Usage policies
CREATE POLICY "Users can read own api usage" ON api_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api usage" ON api_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- COMPLETED
-- ============================================
-- Migration complete! Run this in Supabase SQL Editor
-- Then remove Prisma and use Supabase client for all operations
