-- Atomic AI usage increment function
-- Replaces the fetch-then-update pattern to avoid race conditions under concurrent load.

CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_new_count INT;
BEGIN
  UPDATE users
  SET ai_generations_used = COALESCE(ai_generations_used, 0) + 1,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING ai_generations_used INTO v_new_count;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_user_id;
  END IF;

  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
