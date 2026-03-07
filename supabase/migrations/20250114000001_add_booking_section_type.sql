-- Add BOOKING to section_type enum
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'BOOKING';

-- Add comment
COMMENT ON TYPE section_type IS 'Types of sections available for websites, including BOOKING for reservation/appointment systems';
