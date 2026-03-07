-- Function to delete unpublished websites older than 7 days
CREATE OR REPLACE FUNCTION delete_expired_draft_websites()
RETURNS TABLE (deleted_count INTEGER) AS $$
DECLARE
  v_deleted_count INTEGER := 0;
BEGIN
  -- Delete unpublished websites older than 7 days
  -- CASCADE will handle related pages, sections, stores, etc.
  DELETE FROM websites
  WHERE published = false
    AND created_at < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION delete_expired_draft_websites IS 'Deletes unpublished websites older than 7 days to save storage costs on temporary DALL-E images';

-- Note: To set up automated cleanup, you can either:
-- 1. Use Supabase Edge Functions with pg_cron extension (requires Pro plan)
-- 2. Use an external cron job to call this function via RPC
-- 3. Call it manually from admin dashboard

-- Example manual call (for testing):
-- SELECT * FROM delete_expired_draft_websites();

-- To enable pg_cron (Supabase Pro plan required):
-- Run in SQL editor:
-- SELECT cron.schedule(
--   'delete-expired-drafts',
--   '0 2 * * *',  -- Run every day at 2 AM
--   $$SELECT delete_expired_draft_websites();$$
-- );
