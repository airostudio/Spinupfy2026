-- ============================================
-- Membership Tiers System Migration
-- ============================================
-- Implements tiered subscription plans with Stripe integration

-- Update subscription plan enum to include all tiers
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'FREEMIUM';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'AGENCY';

-- ============================================
-- MEMBERSHIP TIERS TABLE
-- ============================================
-- Defines the features and limits for each tier

CREATE TABLE IF NOT EXISTS membership_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,

  -- Pricing
  monthly_price_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  yearly_price_usd DECIMAL(10, 2),
  yearly_discount_months INTEGER DEFAULT 0, -- Free months in first year

  -- Limits
  max_websites INTEGER NOT NULL DEFAULT 1,
  max_pages_per_website INTEGER, -- NULL = unlimited
  max_ai_generations_per_month INTEGER, -- NULL = unlimited

  -- Features
  trial_days INTEGER DEFAULT 0,
  can_export BOOLEAN DEFAULT FALSE,
  can_use_custom_domain BOOLEAN DEFAULT FALSE,
  includes_free_domain BOOLEAN DEFAULT FALSE,
  free_domain_type TEXT, -- 'subdomain' or 'com'
  priority_support BOOLEAN DEFAULT FALSE,

  -- Stripe IDs
  stripe_monthly_price_id TEXT,
  stripe_yearly_price_id TEXT,

  -- Display
  is_popular BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default membership tiers
INSERT INTO membership_tiers (
  id, name, display_name, description,
  monthly_price_usd, yearly_price_usd, yearly_discount_months,
  max_websites, max_pages_per_website, max_ai_generations_per_month,
  trial_days, can_export, can_use_custom_domain, includes_free_domain, free_domain_type,
  sort_order, is_popular
) VALUES
  -- Freemium Tier
  (
    'freemium', 'FREEMIUM', 'Freemium',
    'Perfect for trying out the platform with a single playground website',
    0.00, 0.00, 0,
    1, 1, 5, -- 1 website, 1 page, 5 AI generations/month
    0, FALSE, FALSE, TRUE, 'subdomain',
    1, FALSE
  ),
  -- Starter Tier (formerly Sole Trader)
  (
    'starter', 'STARTER', 'Starter',
    'Ideal for individuals and small businesses getting started',
    15.99, 159.90, 2, -- $15.99/mo, $159.90/yr (2 months free first year)
    1, NULL, NULL, -- 1 website, unlimited pages, unlimited AI
    7, TRUE, TRUE, TRUE, 'subdomain',
    2, FALSE
  ),
  -- Pro Tier
  (
    'pro', 'PRO', 'Pro',
    'For professionals managing multiple client projects',
    19.99, 199.90, 2, -- $19.99/mo, $199.90/yr (2 months free first year)
    5, NULL, NULL, -- 5 websites, unlimited pages, unlimited AI
    7, TRUE, TRUE, TRUE, 'subdomain',
    3, TRUE
  ),
  -- Enterprise Tier
  (
    'enterprise', 'ENTERPRISE', 'Enterprise',
    'For growing businesses with advanced needs',
    32.99, 395.88, 0, -- $32.99/mo, $395.88/yr (no free months)
    10, NULL, NULL, -- 10 websites, unlimited pages, unlimited AI
    7, TRUE, TRUE, TRUE, 'com',
    4, FALSE
  ),
  -- Agency Tier
  (
    'agency', 'AGENCY', 'Agency',
    'For agencies managing 25+ client websites',
    NULL, NULL, 0, -- Custom pricing - contact us
    25, NULL, NULL, -- 25+ websites, unlimited pages, unlimited AI
    0, TRUE, TRUE, TRUE, 'com',
    5, FALSE
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  monthly_price_usd = EXCLUDED.monthly_price_usd,
  yearly_price_usd = EXCLUDED.yearly_price_usd,
  yearly_discount_months = EXCLUDED.yearly_discount_months,
  max_websites = EXCLUDED.max_websites,
  max_pages_per_website = EXCLUDED.max_pages_per_website,
  max_ai_generations_per_month = EXCLUDED.max_ai_generations_per_month,
  trial_days = EXCLUDED.trial_days,
  can_export = EXCLUDED.can_export,
  can_use_custom_domain = EXCLUDED.can_use_custom_domain,
  includes_free_domain = EXCLUDED.includes_free_domain,
  free_domain_type = EXCLUDED.free_domain_type,
  sort_order = EXCLUDED.sort_order,
  is_popular = EXCLUDED.is_popular,
  updated_at = NOW();

-- ============================================
-- UPDATE USERS TABLE
-- ============================================

-- Add trial and subscription tracking fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_period TEXT; -- 'monthly' or 'yearly'
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_period_ends_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS websites_limit INTEGER DEFAULT 1;

-- Update default plan to FREEMIUM for new users
ALTER TABLE users ALTER COLUMN plan SET DEFAULT 'FREEMIUM';

-- ============================================
-- UPDATE WEBSITES TABLE
-- ============================================

-- Add trial and accessibility tracking
ALTER TABLE websites ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE websites ADD COLUMN IF NOT EXISTS is_accessible BOOLEAN DEFAULT TRUE;
ALTER TABLE websites ADD COLUMN IF NOT EXISTS inaccessible_reason TEXT;

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
-- Tracks Stripe subscription history and events

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Stripe data
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,

  -- Subscription details
  tier_id TEXT NOT NULL REFERENCES membership_tiers(id),
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', 'trialing', etc.
  period TEXT NOT NULL, -- 'monthly' or 'yearly'

  -- Dates
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  canceled_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user can create more websites
CREATE OR REPLACE FUNCTION can_create_website(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_websites_count INTEGER;
  v_websites_limit INTEGER;
BEGIN
  -- Get current website count and limit
  SELECT
    COUNT(*) INTO v_websites_count
  FROM websites
  WHERE user_id = p_user_id;

  SELECT
    websites_limit INTO v_websites_limit
  FROM users
  WHERE id = p_user_id;

  RETURN v_websites_count < v_websites_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to check if website is accessible
CREATE OR REPLACE FUNCTION is_website_accessible(p_website_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_accessible BOOLEAN;
  v_trial_ends_at TIMESTAMPTZ;
  v_user_subscription_status TEXT;
  v_user_plan subscription_plan;
BEGIN
  -- Get website and user info
  SELECT
    w.is_accessible,
    w.trial_ends_at,
    u.subscription_status,
    u.plan
  INTO
    v_is_accessible,
    v_trial_ends_at,
    v_user_subscription_status,
    v_user_plan
  FROM websites w
  JOIN users u ON w.user_id = u.id
  WHERE w.id = p_website_id;

  -- Freemium is always accessible
  IF v_user_plan = 'FREEMIUM' THEN
    RETURN TRUE;
  END IF;

  -- Check if in trial period
  IF v_trial_ends_at IS NOT NULL AND v_trial_ends_at > NOW() THEN
    RETURN TRUE;
  END IF;

  -- Check subscription status
  IF v_user_subscription_status = 'active' THEN
    RETURN TRUE;
  END IF;

  -- Otherwise not accessible
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to update website accessibility
CREATE OR REPLACE FUNCTION update_website_accessibility()
RETURNS TRIGGER AS $$
BEGIN
  -- Update is_accessible based on trial and subscription
  NEW.is_accessible := is_website_accessible(NEW.id);

  -- Set reason if not accessible
  IF NOT NEW.is_accessible THEN
    IF NEW.trial_ends_at IS NOT NULL AND NEW.trial_ends_at < NOW() THEN
      NEW.inaccessible_reason := 'trial_expired';
    ELSE
      NEW.inaccessible_reason := 'subscription_required';
    END IF;
  ELSE
    NEW.inaccessible_reason := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update website accessibility
DROP TRIGGER IF EXISTS trigger_update_website_accessibility ON websites;
CREATE TRIGGER trigger_update_website_accessibility
  BEFORE INSERT OR UPDATE ON websites
  FOR EACH ROW
  EXECUTE FUNCTION update_website_accessibility();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Membership tiers are publicly readable
CREATE POLICY "Membership tiers are publicly readable"
  ON membership_tiers FOR SELECT
  USING (TRUE);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only system can insert/update subscriptions (via Stripe webhooks)
CREATE POLICY "System can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE membership_tiers IS 'Defines subscription tiers, pricing, and feature limits';
COMMENT ON TABLE subscriptions IS 'Tracks Stripe subscriptions and payment history';
COMMENT ON COLUMN users.trial_ends_at IS 'When the user trial period ends (for paid tiers)';
COMMENT ON COLUMN users.subscription_status IS 'Current Stripe subscription status: active, canceled, past_due, etc.';
COMMENT ON COLUMN users.websites_limit IS 'Maximum websites allowed based on tier';
COMMENT ON COLUMN websites.trial_ends_at IS 'When this specific website trial ends';
COMMENT ON COLUMN websites.is_accessible IS 'Whether website is accessible (based on subscription/trial)';
COMMENT ON COLUMN websites.inaccessible_reason IS 'Why website is not accessible: trial_expired, subscription_required';
