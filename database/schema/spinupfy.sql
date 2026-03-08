-- ============================================================
-- Spinupfy Database Schema
-- Time-limited one-page sites: event flyers, real estate,
-- booking pages, pop-up stores, flash sales, and 25+ more.
--
-- Apply via Supabase migration:
--   supabase/migrations/20260307000000_create_spinupfy_tables.sql
-- ============================================================

-- ── spinupfy_sites ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spinupfy_sites (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_id        UUID REFERENCES websites(id) ON DELETE SET NULL,

  -- Template & content
  template_type     TEXT NOT NULL CHECK (template_type IN (
                      -- Events & Entertainment
                      'event_flyer', 'concert_show', 'party_invite', 'wedding_rsvp',
                      'festival', 'sports_event', 'art_exhibition', 'graduation_celebration',
                      -- Real Estate & Property
                      'real_estate_listing', 'open_house', 'new_development', 'vacation_rental',
                      -- Sales & Commerce
                      'flash_sale', 'popup_store', 'garage_sale', 'holiday_sale',
                      'clearance_sale', 'market_stall',
                      -- Services & Booking
                      'booking_page', 'food_truck', 'seasonal_service', 'popup_restaurant',
                      -- Community & Causes
                      'fundraiser', 'community_event', 'charity_drive', 'job_listing',
                      -- Launches & Campaigns
                      'product_launch', 'coming_soon', 'contest_giveaway',
                      'election_campaign', 'crowdfunding'
                    )),
  name              TEXT NOT NULL,
  description       TEXT,
  prompt            TEXT,                -- original user prompt used to generate
  custom_domain     TEXT,                -- optional custom domain
  subdomain         TEXT UNIQUE,         -- e.g. my-sale.spinupfy.io

  -- Date lifecycle
  start_date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date          TIMESTAMPTZ NOT NULL,
  extended_count    INTEGER NOT NULL DEFAULT 0,
  original_end_date TIMESTAMPTZ,         -- first end_date before any extensions

  -- Status: draft → payment_pending → active → suspended → deleted
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                      'draft', 'payment_pending', 'active', 'suspended', 'deleted'
                    )),

  -- Pricing & payment
  duration_days     INTEGER NOT NULL DEFAULT 1,   -- auto-computed by trigger
  base_price        NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'usd',
  stripe_payment_intent_id   TEXT,
  stripe_checkout_session_id TEXT,
  payment_status    TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN (
                      'unpaid', 'paid', 'refunded', 'waived'
                    )),

  -- Reminder flags
  reminder_3day_sent BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_1day_sent BOOLEAN NOT NULL DEFAULT FALSE,
  expiry_email_sent  BOOLEAN NOT NULL DEFAULT FALSE,

  -- Contact info for lifecycle emails
  contact_email     TEXT,
  contact_name      TEXT,
  contact_phone     TEXT,

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at      TIMESTAMPTZ,
  suspended_at      TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ
);

-- Indexes for fast lifecycle cron queries
CREATE INDEX IF NOT EXISTS idx_spinupfy_status_end_date
  ON spinupfy_sites(status, end_date);

CREATE INDEX IF NOT EXISTS idx_spinupfy_user_id
  ON spinupfy_sites(user_id);

CREATE INDEX IF NOT EXISTS idx_spinupfy_website_id
  ON spinupfy_sites(website_id);

-- Trigger: auto-compute duration_days on insert/update
CREATE OR REPLACE FUNCTION spinupfy_compute_duration()
RETURNS TRIGGER AS $$
BEGIN
  NEW.duration_days := GREATEST(1,
    EXTRACT(DAY FROM (NEW.end_date - NEW.start_date))::INTEGER
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS spinupfy_compute_duration_trigger ON spinupfy_sites;
CREATE TRIGGER spinupfy_compute_duration_trigger
  BEFORE INSERT OR UPDATE OF start_date, end_date ON spinupfy_sites
  FOR EACH ROW EXECUTE FUNCTION spinupfy_compute_duration();

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION spinupfy_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS spinupfy_set_updated_at_trigger ON spinupfy_sites;
CREATE TRIGGER spinupfy_set_updated_at_trigger
  BEFORE UPDATE ON spinupfy_sites
  FOR EACH ROW EXECUTE FUNCTION spinupfy_set_updated_at();

-- Row-level security
ALTER TABLE spinupfy_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own Spinupfy sites"
  ON spinupfy_sites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Spinupfy sites"
  ON spinupfy_sites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Spinupfy sites"
  ON spinupfy_sites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all Spinupfy sites"
  ON spinupfy_sites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ── spinupfy_extensions ──────────────────────────────────────
-- Audit log of every date extension with incremental pricing
CREATE TABLE IF NOT EXISTS spinupfy_extensions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spinupfy_site_id  UUID NOT NULL REFERENCES spinupfy_sites(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_end_date TIMESTAMPTZ NOT NULL,
  new_end_date      TIMESTAMPTZ NOT NULL,
  additional_days   INTEGER NOT NULL,
  additional_price  NUMERIC(10, 2) NOT NULL,
  stripe_payment_intent_id TEXT,
  payment_status    TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN (
                      'unpaid', 'paid', 'refunded'
                    )),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spinupfy_ext_site_id
  ON spinupfy_extensions(spinupfy_site_id);

ALTER TABLE spinupfy_extensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own extensions"
  ON spinupfy_extensions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own extensions"
  ON spinupfy_extensions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE spinupfy_sites IS 'Time-limited one-page Spinupfy sites with lifecycle management';
COMMENT ON TABLE spinupfy_extensions IS 'Audit log of date extensions for Spinupfy sites';
COMMENT ON COLUMN spinupfy_sites.status IS 'Lifecycle: draft → payment_pending → active → suspended → deleted';
COMMENT ON COLUMN spinupfy_sites.duration_days IS 'Auto-computed from end_date - start_date by trigger';
COMMENT ON COLUMN spinupfy_sites.reminder_3day_sent IS 'True after 3-day expiry reminder email sent';
COMMENT ON COLUMN spinupfy_sites.reminder_1day_sent IS 'True after 1-day expiry reminder email sent';
COMMENT ON COLUMN spinupfy_sites.suspended_at IS 'Timestamp when site was suspended after end_date';
COMMENT ON COLUMN spinupfy_sites.deleted_at IS 'Timestamp of permanent deletion after 5-day grace period';
