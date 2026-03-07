-- ============================================
-- Migration: Add New Section Types to Enum
-- ============================================
-- Run this in your Supabase SQL Editor if you have an existing database
-- This adds the new section types needed for booking, trust badges, calculators, etc.

-- Add BOOKING type (for appointment/reservation booking)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'BOOKING' AND enumtypid = 'section_type'::regtype) THEN
    ALTER TYPE section_type ADD VALUE 'BOOKING';
  END IF;
END $$;

-- Add TRUST_BADGES type (for client logos, certifications, awards)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'TRUST_BADGES' AND enumtypid = 'section_type'::regtype) THEN
    ALTER TYPE section_type ADD VALUE 'TRUST_BADGES';
  END IF;
END $$;

-- Add MOBILE_STICKY_CTA type (for mobile bottom sticky call-to-action)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MOBILE_STICKY_CTA' AND enumtypid = 'section_type'::regtype) THEN
    ALTER TYPE section_type ADD VALUE 'MOBILE_STICKY_CTA';
  END IF;
END $$;

-- Add LOAN_CALCULATOR type (for mortgage/loan calculators)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'LOAN_CALCULATOR' AND enumtypid = 'section_type'::regtype) THEN
    ALTER TYPE section_type ADD VALUE 'LOAN_CALCULATOR';
  END IF;
END $$;

-- Add FLOATING_CTA type (for floating call-to-action buttons)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'FLOATING_CTA' AND enumtypid = 'section_type'::regtype) THEN
    ALTER TYPE section_type ADD VALUE 'FLOATING_CTA';
  END IF;
END $$;

-- Add MENU type (for restaurant menu sections)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MENU' AND enumtypid = 'section_type'::regtype) THEN
    ALTER TYPE section_type ADD VALUE 'MENU';
  END IF;
END $$;

-- Add HOW_IT_WORKS type (for process/steps sections)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'HOW_IT_WORKS' AND enumtypid = 'section_type'::regtype) THEN
    ALTER TYPE section_type ADD VALUE 'HOW_IT_WORKS';
  END IF;
END $$;

-- Verify the enum values after migration
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'section_type'::regtype ORDER BY enumsortorder;
