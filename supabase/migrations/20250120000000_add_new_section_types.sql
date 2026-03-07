-- Migration: Add new section types to enum
-- Date: 2025-01-20
-- Description: Adds TRUST_BADGES, HOW_IT_WORKS, and MOBILE_STICKY_CTA section types
--              to support dynamic layout generation with modern UX patterns

-- Add new values to the section_type enum
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'TRUST_BADGES';
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'HOW_IT_WORKS';
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'MOBILE_STICKY_CTA';

-- Update comment to reflect all available section types
COMMENT ON TYPE section_type IS 'Types of sections available for websites. Includes: HEADER, HERO, FEATURES, ABOUT, SERVICES, PRICING, TESTIMONIALS, TEAM, PORTFOLIO, GALLERY, CONTACT, CTA, FAQ, BLOG, NEWSLETTER, STORE, BOOKING, TRUST_BADGES, HOW_IT_WORKS, MOBILE_STICKY_CTA';
