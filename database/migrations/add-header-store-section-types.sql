-- Migration: Add HEADER and STORE section types to enum
-- Date: 2025-12-11
-- Description: Adds HEADER and STORE to the section_type enum to support header navigation and ecommerce sections

-- Add new values to the section_type enum
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'HEADER';
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'STORE';
