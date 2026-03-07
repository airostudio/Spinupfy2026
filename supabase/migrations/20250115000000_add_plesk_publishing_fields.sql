-- Add Plesk publishing fields to websites table
-- These fields support automatic subdomain creation and deployment

-- Add published_url field (the full URL where the site is published)
ALTER TABLE websites
ADD COLUMN IF NOT EXISTS published_url TEXT;

-- Add plesk_subdomain_id field (stores the Plesk subdomain ID for management)
ALTER TABLE websites
ADD COLUMN IF NOT EXISTS plesk_subdomain_id INTEGER;

-- Add primary_color and accent_color for website theming
ALTER TABLE websites
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#3b82f6';

ALTER TABLE websites
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#06b6d4';

-- Create index on published_url for faster lookups
CREATE INDEX IF NOT EXISTS idx_websites_published_url ON websites(published_url);

-- Add comment for documentation
COMMENT ON COLUMN websites.published_url IS 'The full public URL where the website is published (e.g., https://elephant-draw.webese.ai)';
COMMENT ON COLUMN websites.plesk_subdomain_id IS 'The Plesk subdomain ID for managing the hosting space';
COMMENT ON COLUMN websites.subdomain IS 'The subdomain name only (e.g., elephant-draw)';
