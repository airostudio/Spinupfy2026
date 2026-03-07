-- ============================================================
-- Spinupfy — Complete Database Setup
-- ============================================================
-- Self-contained: creates all prerequisite tables first,
-- then the Spinupfy-specific tables.
-- Safe to run on an existing Webese database (IF NOT EXISTS throughout).
--
-- Run this entire file in: Supabase Dashboard → SQL Editor → Run
-- ============================================================


-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ── Enums ────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE subscription_plan AS ENUM (
    'FREE', 'STARTER', 'PRO', 'ENTERPRISE',
    'BASIC', 'PROFESSIONAL', 'AGENCY'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE section_type AS ENUM (
    'HEADER', 'HERO', 'FEATURES', 'ABOUT', 'SERVICES', 'PRICING',
    'TESTIMONIALS', 'TEAM', 'PORTFOLIO', 'GALLERY',
    'CONTACT', 'CTA', 'FAQ', 'BLOG', 'NEWSLETTER',
    'FOOTER', 'STORE', 'CUSTOM',
    'BOOKING', 'TRUST_BADGES', 'MOBILE_STICKY_CTA',
    'LOAN_CALCULATOR', 'FLOATING_CTA', 'MENU', 'HOW_IT_WORKS'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE api_service AS ENUM (
    'OPENAI_GPT4', 'OPENAI_GPT35', 'OPENAI_DALLE',
    'UNSPLASH', 'STRIPE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add enum values that may be missing in existing installs
DO $$ BEGIN ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'TRUST_BADGES';     EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'HOW_IT_WORKS';      EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'MOBILE_STICKY_CTA'; EXCEPTION WHEN others THEN NULL; END $$;


-- ── Shared updated_at function ────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ── users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email                        TEXT UNIQUE NOT NULL,
  name                         TEXT,
  avatar_url                   TEXT,
  role                         TEXT NOT NULL DEFAULT 'user',
  plan                         subscription_plan NOT NULL DEFAULT 'FREE',
  plan_expires_at              TIMESTAMPTZ,
  stripe_customer_id           TEXT UNIQUE,
  stripe_subscription_id       TEXT UNIQUE,
  websites_created             INTEGER NOT NULL DEFAULT 0,
  ai_generations_used          INTEGER NOT NULL DEFAULT 0,
  ai_generations_limit         INTEGER NOT NULL DEFAULT 10,
  additional_seats             INTEGER NOT NULL DEFAULT 0,
  seats_updated_at             TIMESTAMPTZ,
  stripe_seats_subscription_id TEXT,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Users can read own data"   ON users FOR SELECT USING (auth.uid() = id);   EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);   EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── websites ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS websites (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT,
  slug                TEXT UNIQUE NOT NULL,
  website_type        TEXT,
  brand_name          TEXT,
  logo_url            TEXT,
  favicon             TEXT,
  theme               JSONB,
  published           BOOLEAN NOT NULL DEFAULT FALSE,
  published_at        TIMESTAMPTZ,
  published_url       TEXT,
  subdomain           TEXT UNIQUE,
  custom_domain       TEXT UNIQUE,
  plesk_subdomain_id  INTEGER,
  primary_color       TEXT DEFAULT '#3b82f6',
  accent_color        TEXT DEFAULT '#06b6d4',
  meta_title          TEXT,
  meta_description    TEXT,
  meta_keywords       TEXT,
  og_image            TEXT,
  og_type             TEXT DEFAULT 'website',
  twitter_card        TEXT DEFAULT 'summary_large_image',
  twitter_image       TEXT,
  canonical_url       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_websites_user_id       ON websites(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_slug          ON websites(slug);
CREATE INDEX IF NOT EXISTS idx_websites_subdomain     ON websites(subdomain);
CREATE INDEX IF NOT EXISTS idx_websites_custom_domain ON websites(custom_domain);
CREATE INDEX IF NOT EXISTS idx_websites_published_url ON websites(published_url);
CREATE INDEX IF NOT EXISTS idx_websites_published     ON websites(published) WHERE published = true;

ALTER TABLE websites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Users can read own websites"        ON websites FOR SELECT  USING (auth.uid() = user_id);           EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can create websites"          ON websites FOR INSERT  WITH CHECK (auth.uid() = user_id);      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update own websites"      ON websites FOR UPDATE  USING (auth.uid() = user_id);           EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can delete own websites"      ON websites FOR DELETE  USING (auth.uid() = user_id);           EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Anyone can read published websites" ON websites FOR SELECT  USING (published = true);               EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS update_websites_updated_at ON websites;
CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── pages ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id       UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL,
  path             TEXT NOT NULL DEFAULT '/',
  meta_title       TEXT,
  meta_description TEXT,
  meta_keywords    TEXT,
  og_image         TEXT,
  og_type          TEXT DEFAULT 'article',
  twitter_card     TEXT DEFAULT 'summary_large_image',
  twitter_image    TEXT,
  canonical_url    TEXT,
  "order"          INTEGER NOT NULL DEFAULT 0,
  is_homepage      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(website_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_pages_website_id  ON pages(website_id);
CREATE INDEX IF NOT EXISTS idx_pages_is_homepage ON pages(is_homepage) WHERE is_homepage = true;

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read pages in own websites" ON pages FOR SELECT USING (
    EXISTS (SELECT 1 FROM websites WHERE websites.id = pages.website_id AND websites.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert pages in own websites" ON pages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM websites WHERE websites.id = pages.website_id AND websites.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update pages in own websites" ON pages FOR UPDATE USING (
    EXISTS (SELECT 1 FROM websites WHERE websites.id = pages.website_id AND websites.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can delete pages in own websites" ON pages FOR DELETE USING (
    EXISTS (SELECT 1 FROM websites WHERE websites.id = pages.website_id AND websites.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── sections ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sections (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id    UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type       section_type NOT NULL,
  content    JSONB NOT NULL,
  settings   JSONB,
  "order"    INTEGER NOT NULL DEFAULT 0,
  visible    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sections_page_id ON sections(page_id);

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage sections in own websites" ON sections FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pages
      JOIN websites ON websites.id = pages.website_id
      WHERE pages.id = sections.page_id AND websites.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS update_sections_updated_at ON sections;
CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── api_usage ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_usage (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service       api_service NOT NULL,
  endpoint      TEXT NOT NULL,
  tokens_used   INTEGER NOT NULL DEFAULT 0,
  cost_usd      DECIMAL(10,6) NOT NULL DEFAULT 0.0,
  request_data  JSONB,
  response_data JSONB,
  success       BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_user_id    ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);

ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Users can read own api usage"   ON api_usage FOR SELECT USING (auth.uid() = user_id);   EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert own api usage" ON api_usage FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── domain_verifications ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS domain_verifications (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain             TEXT UNIQUE NOT NULL,
  verified           BOOLEAN NOT NULL DEFAULT FALSE,
  verification_token TEXT UNIQUE NOT NULL,
  txt_record         TEXT,
  cname_record       TEXT,
  ssl_enabled        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at        TIMESTAMPTZ
);

ALTER TABLE domain_verifications ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_domain_verifications_updated_at ON domain_verifications;
CREATE TRIGGER update_domain_verifications_updated_at BEFORE UPDATE ON domain_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── bookings ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id       UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  customer_name    VARCHAR(255) NOT NULL,
  customer_email   VARCHAR(255) NOT NULL,
  customer_phone   VARCHAR(50),
  booking_type     VARCHAR(50) NOT NULL,
  booking_date     DATE NOT NULL,
  booking_time     TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  number_of_people INTEGER DEFAULT 1,
  special_requests TEXT,
  notes            TEXT,
  status           VARCHAR(50) DEFAULT 'pending',
  confirmed_at     TIMESTAMPTZ,
  confirmed_by     UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_booking_status CHECK (status IN ('pending','confirmed','cancelled','completed','no-show'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_website_id     ON bookings(website_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status         ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date           ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Users can view bookings for their websites"   ON bookings FOR SELECT USING (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can manage bookings for their websites" ON bookings FOR ALL   USING (website_id IN (SELECT id FROM websites WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Anyone can create bookings"                   ON bookings FOR INSERT WITH CHECK (true);                                                          EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── user_sessions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_sessions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token  TEXT NOT NULL,
  device_id      TEXT,
  device_name    TEXT,
  browser        TEXT,
  os             TEXT,
  ip_address     INET,
  location       TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at     TIMESTAMPTZ,
  UNIQUE(user_id, session_token)
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id     ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active      ON user_sessions(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON user_sessions(last_active_at);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Users can view own sessions"   ON user_sessions FOR SELECT USING (auth.uid() = user_id);           EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can create own sessions" ON user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update own sessions" ON user_sessions FOR UPDATE USING (auth.uid() = user_id);           EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── seat_overage_alerts ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS seat_overage_alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seats_allowed   INTEGER NOT NULL,
  seats_in_use    INTEGER NOT NULL,
  overage_count   INTEGER NOT NULL,
  alert_type      TEXT NOT NULL DEFAULT 'warning',
  acknowledged    BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  action_taken    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE seat_overage_alerts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Users can view own alerts"   ON seat_overage_alerts FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update own alerts" ON seat_overage_alerts FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── seat_pricing ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seat_pricing (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  min_seats               INTEGER NOT NULL DEFAULT 1,
  max_seats               INTEGER,
  price_per_seat_monthly  DECIMAL(10,2) NOT NULL,
  price_per_seat_annual   DECIMAL(10,2) NOT NULL,
  stripe_price_id_monthly TEXT,
  stripe_price_id_annual  TEXT,
  is_active               BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO seat_pricing (min_seats, max_seats, price_per_seat_monthly, price_per_seat_annual)
VALUES (1,5,5.00,50.00),(6,20,4.00,40.00),(21,NULL,3.00,30.00)
ON CONFLICT DO NOTHING;

ALTER TABLE seat_pricing ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Authenticated users can view seat pricing" ON seat_pricing FOR SELECT USING (auth.role() = 'authenticated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── platform_discount_codes ───────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_discount_codes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                    TEXT NOT NULL UNIQUE,
  description             TEXT,
  discount_type           TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed_amount','free_trial_days','plan_upgrade')),
  discount_value          DECIMAL(10,2) NOT NULL,
  applies_to              TEXT NOT NULL DEFAULT 'subscription' CHECK (applies_to IN ('subscription','ecommerce','all')),
  applicable_plans        TEXT[],
  usage_limit             INTEGER,
  usage_count             INTEGER DEFAULT 0,
  per_user_limit          INTEGER DEFAULT 1,
  minimum_purchase_amount DECIMAL(10,2),
  first_time_users_only   BOOLEAN DEFAULT FALSE,
  starts_at               TIMESTAMPTZ DEFAULT NOW(),
  ends_at                 TIMESTAMPTZ,
  active                  BOOLEAN DEFAULT TRUE,
  created_by              UUID REFERENCES users(id),
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE platform_discount_codes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can manage discount codes" ON platform_discount_codes FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated users can read active discount codes" ON platform_discount_codes FOR SELECT USING (
    active = true AND auth.role() = 'authenticated'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── discount_code_usage ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS discount_code_usage (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID NOT NULL REFERENCES platform_discount_codes(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_for         TEXT NOT NULL CHECK (used_for IN ('subscription','order')),
  order_id         UUID,
  subscription_id  TEXT,
  discount_amount  DECIMAL(10,2) NOT NULL,
  used_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(discount_code_id, user_id, order_id),
  UNIQUE(discount_code_id, user_id, subscription_id)
);

ALTER TABLE discount_code_usage ENABLE ROW LEVEL SECURITY;


-- ── Storage buckets ───────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'website-images','website-images',true,10485760,
  ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads','uploads',true,52428800,
  ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/gif','application/pdf']
) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload images to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images"       ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images"       ON storage.objects;
DROP POLICY IF EXISTS "Public can view all images"              ON storage.objects;

CREATE POLICY "Users can upload images to their folder" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'website-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update their own images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'website-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete their own images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'website-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Public can view all images" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'website-images');


-- ============================================================
--  SPINUPFY TABLES
-- ============================================================

-- ── spinupfy_sites ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spinupfy_sites (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_id        UUID REFERENCES websites(id) ON DELETE SET NULL,

  template_type     TEXT NOT NULL CHECK (template_type IN (
                      'event_flyer','concert_show','party_invite','wedding_rsvp',
                      'festival','sports_event','art_exhibition','graduation_celebration',
                      'real_estate_listing','open_house','new_development','vacation_rental',
                      'flash_sale','popup_store','garage_sale','holiday_sale',
                      'clearance_sale','market_stall',
                      'booking_page','food_truck','seasonal_service','popup_restaurant',
                      'fundraiser','community_event','charity_drive','job_listing',
                      'product_launch','coming_soon','contest_giveaway',
                      'election_campaign','crowdfunding'
                    )),
  name              TEXT NOT NULL,
  description       TEXT,
  prompt            TEXT,
  custom_domain     TEXT,
  subdomain         TEXT UNIQUE,

  start_date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date          TIMESTAMPTZ NOT NULL,
  extended_count    INTEGER NOT NULL DEFAULT 0,
  original_end_date TIMESTAMPTZ,

  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                      'draft','payment_pending','active','suspended','deleted'
                    )),

  duration_days     INTEGER NOT NULL DEFAULT 1,
  base_price        NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'usd',
  stripe_payment_intent_id   TEXT,
  stripe_checkout_session_id TEXT,
  payment_status    TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN (
                      'unpaid','paid','refunded','waived'
                    )),

  reminder_3day_sent BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_1day_sent BOOLEAN NOT NULL DEFAULT FALSE,
  expiry_email_sent  BOOLEAN NOT NULL DEFAULT FALSE,

  contact_email     TEXT,
  contact_name      TEXT,
  contact_phone     TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at      TIMESTAMPTZ,
  suspended_at      TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_spinupfy_status_end_date ON spinupfy_sites(status, end_date);
CREATE INDEX IF NOT EXISTS idx_spinupfy_user_id         ON spinupfy_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_spinupfy_website_id      ON spinupfy_sites(website_id);

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

ALTER TABLE spinupfy_sites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Users can view their own Spinupfy sites"   ON spinupfy_sites FOR SELECT USING (auth.uid() = user_id);           EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert their own Spinupfy sites" ON spinupfy_sites FOR INSERT WITH CHECK (auth.uid() = user_id);      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update their own Spinupfy sites" ON spinupfy_sites FOR UPDATE USING (auth.uid() = user_id);           EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins can manage all Spinupfy sites" ON spinupfy_sites FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── spinupfy_extensions ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS spinupfy_extensions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spinupfy_site_id  UUID NOT NULL REFERENCES spinupfy_sites(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_end_date TIMESTAMPTZ NOT NULL,
  new_end_date      TIMESTAMPTZ NOT NULL,
  additional_days   INTEGER NOT NULL,
  additional_price  NUMERIC(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  payment_status    TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spinupfy_ext_site_id ON spinupfy_extensions(spinupfy_site_id);

ALTER TABLE spinupfy_extensions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Users can view their own extensions"   ON spinupfy_extensions FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert their own extensions" ON spinupfy_extensions FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── Comments ──────────────────────────────────────────────────
COMMENT ON TABLE spinupfy_sites      IS 'Time-limited one-page Spinupfy sites with full lifecycle management';
COMMENT ON TABLE spinupfy_extensions IS 'Audit log of date extensions for Spinupfy sites';
COMMENT ON COLUMN spinupfy_sites.status        IS 'Lifecycle: draft → payment_pending → active → suspended → deleted';
COMMENT ON COLUMN spinupfy_sites.duration_days IS 'Auto-computed from end_date - start_date by trigger';
COMMENT ON COLUMN spinupfy_sites.suspended_at  IS 'Set when site is suspended after end_date passes';
COMMENT ON COLUMN spinupfy_sites.deleted_at    IS 'Set after the 5-day grace period — site permanently removed';

-- ============================================================
-- Setup complete. Tables created (all IF NOT EXISTS):
--   Core:     users, websites, pages, sections, api_usage,
--             domain_verifications
--   Features: bookings, user_sessions, seat_overage_alerts,
--             seat_pricing, platform_discount_codes,
--             discount_code_usage
--   Spinupfy: spinupfy_sites, spinupfy_extensions
--   Storage:  website-images bucket, uploads bucket
-- ============================================================
