-- Migration: Add Seat Management System
-- Date: 2025-01-20
-- Description: Adds seat tracking for multi-user access control
--              Tracks active sessions and enforces seat limits per subscription tier

-- ============================================
-- ADD SEAT COLUMNS TO USERS TABLE
-- ============================================

-- Additional seats purchased beyond plan allocation
ALTER TABLE users
ADD COLUMN IF NOT EXISTS additional_seats INTEGER DEFAULT 0 NOT NULL;

-- Track when additional seats were purchased
ALTER TABLE users
ADD COLUMN IF NOT EXISTS seats_updated_at TIMESTAMPTZ;

-- Stripe price ID for additional seats (for subscription management)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_seats_subscription_id TEXT;

-- Comments
COMMENT ON COLUMN users.additional_seats IS 'Number of additional seats purchased beyond plan allocation';
COMMENT ON COLUMN users.seats_updated_at IS 'When additional seats were last modified';
COMMENT ON COLUMN users.stripe_seats_subscription_id IS 'Stripe subscription ID for additional seats purchase';

-- ============================================
-- USER SESSIONS TABLE
-- ============================================
-- Tracks active login sessions for seat enforcement

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session identification
  session_token TEXT NOT NULL,
  device_id TEXT,

  -- Device/browser info for display
  device_name TEXT,
  browser TEXT,
  os TEXT,
  ip_address INET,
  location TEXT,

  -- Session status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  last_active_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,

  -- Unique constraint: one session token per user
  UNIQUE(user_id, session_token)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON user_sessions(last_active_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at) WHERE expires_at IS NOT NULL;

-- Comments
COMMENT ON TABLE user_sessions IS 'Tracks active user sessions for seat limit enforcement';
COMMENT ON COLUMN user_sessions.session_token IS 'Unique session identifier from Supabase auth';
COMMENT ON COLUMN user_sessions.device_id IS 'Unique device identifier for distinguishing logins';
COMMENT ON COLUMN user_sessions.is_active IS 'Whether the session is currently active';
COMMENT ON COLUMN user_sessions.last_active_at IS 'Last time the session was used';

-- ============================================
-- SEAT OVERAGE ALERTS TABLE
-- ============================================
-- Tracks when users exceed their seat allocation

CREATE TABLE IF NOT EXISTS seat_overage_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Alert details
  seats_allowed INTEGER NOT NULL,
  seats_in_use INTEGER NOT NULL,
  overage_count INTEGER NOT NULL,

  -- Alert status
  alert_type TEXT NOT NULL DEFAULT 'warning', -- 'warning', 'exceeded', 'resolved'
  acknowledged BOOLEAN DEFAULT FALSE NOT NULL,
  acknowledged_at TIMESTAMPTZ,

  -- What action was taken
  action_taken TEXT, -- 'upgraded', 'purchased_seats', 'logged_out_sessions', 'ignored'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_seat_alerts_user ON seat_overage_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_seat_alerts_unack ON seat_overage_alerts(user_id, acknowledged) WHERE acknowledged = FALSE;

-- Comments
COMMENT ON TABLE seat_overage_alerts IS 'Records when users exceed their seat allocation';
COMMENT ON COLUMN seat_overage_alerts.alert_type IS 'Type of alert: warning (near limit), exceeded (over limit), resolved';

-- ============================================
-- ADDITIONAL SEATS PRICING TABLE
-- ============================================
-- Configurable pricing for additional seats

CREATE TABLE IF NOT EXISTS seat_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Pricing tiers
  min_seats INTEGER NOT NULL DEFAULT 1,
  max_seats INTEGER, -- NULL means unlimited
  price_per_seat_monthly DECIMAL(10, 2) NOT NULL,
  price_per_seat_annual DECIMAL(10, 2) NOT NULL,

  -- Stripe price IDs
  stripe_price_id_monthly TEXT,
  stripe_price_id_annual TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default seat pricing
INSERT INTO seat_pricing (min_seats, max_seats, price_per_seat_monthly, price_per_seat_annual)
VALUES
  (1, 5, 5.00, 50.00),      -- $5/seat/month or $50/seat/year for 1-5 seats
  (6, 20, 4.00, 40.00),     -- $4/seat/month for 6-20 seats (volume discount)
  (21, NULL, 3.00, 30.00)   -- $3/seat/month for 21+ seats (enterprise discount)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE seat_pricing IS 'Pricing configuration for additional seats';

-- ============================================
-- FUNCTIONS FOR SEAT MANAGEMENT
-- ============================================

-- Function to get total seats allowed for a user
CREATE OR REPLACE FUNCTION get_user_total_seats(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_plan TEXT;
  v_role TEXT;
  v_plan_seats INTEGER;
  v_additional_seats INTEGER;
BEGIN
  -- Get user's plan and additional seats
  SELECT plan, role, additional_seats
  INTO v_plan, v_role, v_additional_seats
  FROM users
  WHERE id = p_user_id;

  -- Admin gets unlimited
  IF v_role = 'admin' THEN
    RETURN 999999;
  END IF;

  -- Map plan to base seats
  v_plan_seats := CASE v_plan
    WHEN 'FREE' THEN 1
    WHEN 'BASIC' THEN 1
    WHEN 'PROFESSIONAL' THEN 2
    WHEN 'AGENCY' THEN 5
    ELSE 1
  END;

  RETURN v_plan_seats + COALESCE(v_additional_seats, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active session count for a user
CREATE OR REPLACE FUNCTION get_active_session_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM user_sessions
    WHERE user_id = p_user_id
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create new session (login)
CREATE OR REPLACE FUNCTION can_create_session(p_user_id UUID)
RETURNS TABLE(
  allowed BOOLEAN,
  current_sessions INTEGER,
  max_sessions INTEGER,
  overage INTEGER
) AS $$
DECLARE
  v_max_seats INTEGER;
  v_current_sessions INTEGER;
BEGIN
  v_max_seats := get_user_total_seats(p_user_id);
  v_current_sessions := get_active_session_count(p_user_id);

  RETURN QUERY SELECT
    v_current_sessions < v_max_seats AS allowed,
    v_current_sessions AS current_sessions,
    v_max_seats AS max_sessions,
    GREATEST(0, v_current_sessions - v_max_seats + 1) AS overage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record a new session
CREATE OR REPLACE FUNCTION record_session(
  p_user_id UUID,
  p_session_token TEXT,
  p_device_id TEXT DEFAULT NULL,
  p_device_name TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL,
  p_os TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_location TEXT DEFAULT NULL
)
RETURNS TABLE(
  session_id UUID,
  allowed BOOLEAN,
  current_sessions INTEGER,
  max_sessions INTEGER,
  is_over_limit BOOLEAN
) AS $$
DECLARE
  v_session_id UUID;
  v_can_create RECORD;
  v_max_seats INTEGER;
  v_current_sessions INTEGER;
BEGIN
  -- Check if can create session
  SELECT * INTO v_can_create FROM can_create_session(p_user_id);

  -- Update existing session or create new one
  INSERT INTO user_sessions (
    user_id,
    session_token,
    device_id,
    device_name,
    browser,
    os,
    ip_address,
    location,
    is_active,
    last_active_at,
    expires_at
  )
  VALUES (
    p_user_id,
    p_session_token,
    p_device_id,
    p_device_name,
    p_browser,
    p_os,
    p_ip_address,
    p_location,
    TRUE,
    NOW(),
    NOW() + INTERVAL '30 days'
  )
  ON CONFLICT (user_id, session_token)
  DO UPDATE SET
    last_active_at = NOW(),
    is_active = TRUE,
    device_name = COALESCE(EXCLUDED.device_name, user_sessions.device_name),
    browser = COALESCE(EXCLUDED.browser, user_sessions.browser),
    os = COALESCE(EXCLUDED.os, user_sessions.os),
    ip_address = COALESCE(EXCLUDED.ip_address, user_sessions.ip_address),
    location = COALESCE(EXCLUDED.location, user_sessions.location)
  RETURNING id INTO v_session_id;

  -- Get updated counts
  v_max_seats := get_user_total_seats(p_user_id);
  v_current_sessions := get_active_session_count(p_user_id);

  -- If over limit, create alert
  IF v_current_sessions > v_max_seats THEN
    INSERT INTO seat_overage_alerts (user_id, seats_allowed, seats_in_use, overage_count, alert_type)
    VALUES (p_user_id, v_max_seats, v_current_sessions, v_current_sessions - v_max_seats, 'exceeded');
  END IF;

  RETURN QUERY SELECT
    v_session_id AS session_id,
    v_can_create.allowed AS allowed,
    v_current_sessions AS current_sessions,
    v_max_seats AS max_sessions,
    v_current_sessions > v_max_seats AS is_over_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end a session (logout)
CREATE OR REPLACE FUNCTION end_session(p_user_id UUID, p_session_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_sessions
  SET is_active = FALSE
  WHERE user_id = p_user_id
    AND session_token = p_session_token;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end all sessions except current (force logout others)
CREATE OR REPLACE FUNCTION end_other_sessions(p_user_id UUID, p_current_session_token TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE user_sessions
  SET is_active = FALSE
  WHERE user_id = p_user_id
    AND session_token != p_current_session_token
    AND is_active = TRUE;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Mark expired sessions as inactive
  UPDATE user_sessions
  SET is_active = FALSE
  WHERE is_active = TRUE
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Delete very old inactive sessions (older than 90 days)
  DELETE FROM user_sessions
  WHERE is_active = FALSE
    AND last_active_at < NOW() - INTERVAL '90 days';

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update session activity (heartbeat)
CREATE OR REPLACE FUNCTION update_session_activity(p_user_id UUID, p_session_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_sessions
  SET last_active_at = NOW()
  WHERE user_id = p_user_id
    AND session_token = p_session_token
    AND is_active = TRUE;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can create own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on seat_overage_alerts
ALTER TABLE seat_overage_alerts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own alerts
CREATE POLICY "Users can view own alerts" ON seat_overage_alerts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can acknowledge their own alerts
CREATE POLICY "Users can update own alerts" ON seat_overage_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Seat pricing is readable by all authenticated users
ALTER TABLE seat_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view seat pricing" ON seat_pricing
  FOR SELECT USING (auth.role() = 'authenticated');
