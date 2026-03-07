-- Platform-wide Admin Discount Codes
-- These are managed by admins and can be applied globally across all stores or for subscription discounts

-- Platform Discount Codes Table (admin-managed, platform-wide)
CREATE TABLE IF NOT EXISTS platform_discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Code Information
  code TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Discount Type and Value
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_trial_days', 'plan_upgrade')),
  discount_value DECIMAL(10,2) NOT NULL,

  -- Applies to (what this discount can be used for)
  applies_to TEXT NOT NULL DEFAULT 'subscription' CHECK (applies_to IN ('subscription', 'ecommerce', 'all')),

  -- Plan restrictions (NULL means all plans)
  applicable_plans TEXT[], -- e.g., {'BASIC', 'PROFESSIONAL'}

  -- Usage Limits
  usage_limit INTEGER, -- NULL = unlimited
  usage_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1, -- How many times a single user can use this

  -- Requirements
  minimum_purchase_amount DECIMAL(10,2),
  first_time_users_only BOOLEAN DEFAULT FALSE,

  -- Validity Period
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track discount code usage by users
CREATE TABLE IF NOT EXISTS discount_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID NOT NULL REFERENCES platform_discount_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Usage context
  used_for TEXT NOT NULL CHECK (used_for IN ('subscription', 'order')),
  order_id UUID, -- Reference to order if used for e-commerce
  subscription_id TEXT, -- Stripe subscription ID if used for subscription

  -- Discount applied
  discount_amount DECIMAL(10,2) NOT NULL,

  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(discount_code_id, user_id, order_id),
  UNIQUE(discount_code_id, user_id, subscription_id)
);

-- Admin action log for auditing
CREATE TABLE IF NOT EXISTS admin_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),

  -- Action details
  action_type TEXT NOT NULL CHECK (action_type IN (
    'user_plan_change',
    'user_role_change',
    'user_generation_limit_change',
    'user_delete',
    'discount_code_create',
    'discount_code_update',
    'discount_code_delete',
    'order_refund',
    'order_status_change'
  )),

  -- Target entity
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'discount_code', 'order')),
  target_id UUID NOT NULL,

  -- Change details
  old_value JSONB,
  new_value JSONB,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_platform_discount_codes_code ON platform_discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_platform_discount_codes_active ON platform_discount_codes(active);
CREATE INDEX IF NOT EXISTS idx_platform_discount_codes_applies_to ON platform_discount_codes(applies_to);
CREATE INDEX IF NOT EXISTS idx_discount_code_usage_user ON discount_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_code_usage_code ON discount_code_usage(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_log_admin ON admin_action_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_log_target ON admin_action_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_log_created ON admin_action_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE platform_discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_action_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_discount_codes
-- Admins can do everything
CREATE POLICY "Admins can manage platform discount codes" ON platform_discount_codes FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Anyone can view active discount codes (for applying them)
CREATE POLICY "Anyone can view active discount codes" ON platform_discount_codes FOR SELECT USING (
  active = TRUE AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at > NOW())
);

-- RLS Policies for discount_code_usage
CREATE POLICY "Admins can view all usage" ON discount_code_usage FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Users can view their own usage" ON discount_code_usage FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can insert their own usage" ON discount_code_usage FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- RLS Policies for admin_action_log
CREATE POLICY "Only admins can view action log" ON admin_action_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Only admins can insert action log" ON admin_action_log FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Updated_at trigger
CREATE TRIGGER update_platform_discount_codes_updated_at
  BEFORE UPDATE ON platform_discount_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate and apply discount code
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code TEXT,
  p_user_id UUID,
  p_applies_to TEXT DEFAULT 'subscription'
)
RETURNS TABLE (
  valid BOOLEAN,
  discount_id UUID,
  discount_type TEXT,
  discount_value DECIMAL,
  message TEXT
) AS $$
DECLARE
  v_discount RECORD;
  v_user_usage_count INTEGER;
BEGIN
  -- Find the discount code
  SELECT * INTO v_discount
  FROM platform_discount_codes
  WHERE UPPER(code) = UPPER(p_code)
    AND active = TRUE
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (ends_at IS NULL OR ends_at > NOW());

  IF v_discount IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 'Invalid or expired discount code'::TEXT;
    RETURN;
  END IF;

  -- Check applies_to
  IF v_discount.applies_to != 'all' AND v_discount.applies_to != p_applies_to THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 'This code cannot be used for ' || p_applies_to::TEXT;
    RETURN;
  END IF;

  -- Check usage limit
  IF v_discount.usage_limit IS NOT NULL AND v_discount.usage_count >= v_discount.usage_limit THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 'This discount code has reached its usage limit'::TEXT;
    RETURN;
  END IF;

  -- Check per-user limit
  SELECT COUNT(*) INTO v_user_usage_count
  FROM discount_code_usage
  WHERE discount_code_id = v_discount.id AND user_id = p_user_id;

  IF v_discount.per_user_limit IS NOT NULL AND v_user_usage_count >= v_discount.per_user_limit THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 'You have already used this discount code'::TEXT;
    RETURN;
  END IF;

  -- Check first-time users only
  IF v_discount.first_time_users_only THEN
    IF EXISTS (SELECT 1 FROM discount_code_usage WHERE user_id = p_user_id) THEN
      RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 'This code is only for first-time users'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Code is valid
  RETURN QUERY SELECT
    TRUE,
    v_discount.id,
    v_discount.discount_type,
    v_discount.discount_value,
    'Discount code applied successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record discount code usage
CREATE OR REPLACE FUNCTION record_discount_usage(
  p_discount_code_id UUID,
  p_user_id UUID,
  p_used_for TEXT,
  p_discount_amount DECIMAL,
  p_order_id UUID DEFAULT NULL,
  p_subscription_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert usage record
  INSERT INTO discount_code_usage (
    discount_code_id, user_id, used_for, discount_amount, order_id, subscription_id
  ) VALUES (
    p_discount_code_id, p_user_id, p_used_for, p_discount_amount, p_order_id, p_subscription_id
  );

  -- Increment usage count
  UPDATE platform_discount_codes
  SET usage_count = usage_count + 1
  WHERE id = p_discount_code_id;

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
