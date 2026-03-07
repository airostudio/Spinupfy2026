-- ============================================================
-- Spinupfy Database Schema
-- Time-limited one-page sites: flyers, real estate, booking,
-- pop-up stores, and flash sales.
-- ============================================================

-- spinupfy_sites: core table tracking every Spinupfy site
CREATE TABLE IF NOT EXISTS spinupfy_sites (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_id        UUID REFERENCES websites(id) ON DELETE SET NULL,

  -- Template & content
  template_type     TEXT NOT NULL CHECK (template_type IN (
                      'event_flyer', 'real_estate', 'booking', 'popup_store', 'flash_sale'
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

  -- Status lifecycle: active → suspended → deleted
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                      'draft', 'active', 'suspended', 'deleted', 'payment_pending'
                    )),

  -- Pricing & payment
  duration_days     INTEGER NOT NULL GENERATED ALWAYS AS (
                      GREATEST(1, EXTRACT(DAY FROM (end_date - start_date))::INTEGER)
                    ) STORED,
  base_price        NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'usd',
  stripe_payment_intent_id  TEXT,
  stripe_checkout_session_id TEXT,
  payment_status    TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN (
                      'unpaid', 'paid', 'refunded', 'waived'
                    )),

  -- Reminder notifications
  reminder_3day_sent  BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_1day_sent  BOOLEAN NOT NULL DEFAULT FALSE,
  expiry_email_sent   BOOLEAN NOT NULL DEFAULT FALSE,

  -- Contact info for lifecycle emails
  contact_email     TEXT,
  contact_name      TEXT,
  contact_phone     TEXT,

  -- Metadata
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at      TIMESTAMPTZ,
  suspended_at      TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ
);

-- Index for fast lifecycle queries (cron jobs)
CREATE INDEX IF NOT EXISTS idx_spinupfy_status_end_date
  ON spinupfy_sites(status, end_date);

CREATE INDEX IF NOT EXISTS idx_spinupfy_user_id
  ON spinupfy_sites(user_id);

CREATE INDEX IF NOT EXISTS idx_spinupfy_website_id
  ON spinupfy_sites(website_id);

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

-- Admins can view all
CREATE POLICY "Admins can manage all Spinupfy sites"
  ON spinupfy_sites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_spinupfy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS spinupfy_updated_at ON spinupfy_sites;
CREATE TRIGGER spinupfy_updated_at
  BEFORE UPDATE ON spinupfy_sites
  FOR EACH ROW EXECUTE FUNCTION update_spinupfy_updated_at();

-- ============================================================
-- spinupfy_extensions: audit log of every date extension
-- ============================================================
CREATE TABLE IF NOT EXISTS spinupfy_extensions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spinupfy_site_id  UUID NOT NULL REFERENCES spinupfy_sites(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_end_date TIMESTAMPTZ NOT NULL,
  new_end_date      TIMESTAMPTZ NOT NULL,
  additional_days   INTEGER NOT NULL,
  additional_price  NUMERIC(10, 2) NOT NULL,
  stripe_payment_intent_id TEXT,
  payment_status    TEXT NOT NULL DEFAULT 'unpaid',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE spinupfy_extensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own extensions"
  ON spinupfy_extensions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own extensions"
  ON spinupfy_extensions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
