-- ============================================
-- Add comprehensive SEO fields for Week 1 SEO implementation
-- ============================================

-- Add SEO fields to websites table
ALTER TABLE websites
ADD COLUMN IF NOT EXISTS og_image TEXT,
ADD COLUMN IF NOT EXISTS og_type TEXT DEFAULT 'website',
ADD COLUMN IF NOT EXISTS twitter_card TEXT DEFAULT 'summary_large_image',
ADD COLUMN IF NOT EXISTS twitter_image TEXT,
ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- Add SEO fields to pages table
ALTER TABLE pages
ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT,
ADD COLUMN IF NOT EXISTS og_type TEXT DEFAULT 'article',
ADD COLUMN IF NOT EXISTS twitter_card TEXT DEFAULT 'summary_large_image',
ADD COLUMN IF NOT EXISTS twitter_image TEXT,
ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_websites_published ON websites(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_pages_is_homepage ON pages(is_homepage) WHERE is_homepage = true;

-- Add comment for documentation
COMMENT ON COLUMN websites.og_image IS 'Open Graph image URL for social media sharing (1200x630 recommended)';
COMMENT ON COLUMN websites.twitter_card IS 'Twitter card type: summary, summary_large_image, app, or player';
COMMENT ON COLUMN pages.og_image IS 'Page-specific Open Graph image URL (1200x630 recommended)';
COMMENT ON COLUMN pages.canonical_url IS 'Canonical URL to prevent duplicate content issues';
