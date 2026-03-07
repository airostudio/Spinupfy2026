-- ============================================
-- Add role column to users table
-- ============================================
-- Run this in your Supabase SQL Editor to fix the admin page

-- Add role column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' NOT NULL;

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have 'user' role (if any have NULL)
UPDATE users SET role = 'user' WHERE role IS NULL;

-- ============================================
-- Set yourself as admin
-- ============================================
-- Replace 'your-email@example.com' with your actual email address

UPDATE users
SET role = 'admin'
WHERE email = 'typhoon.tall69@gmail.com'; -- Replace with your email

-- Verify the change
SELECT id, email, name, role, created_at
FROM users
WHERE role = 'admin';
