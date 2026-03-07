-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' NOT NULL;

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have 'user' role (if any exist)
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Add comment
COMMENT ON COLUMN users.role IS 'User role: user, admin';
