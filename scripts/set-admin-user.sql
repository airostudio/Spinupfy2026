-- Step 1: View all users to find your email
SELECT id, email, role, created_at FROM users ORDER BY created_at DESC;

-- Step 2: Remove all existing admin roles (reset to 'user')
UPDATE users SET role = 'user' WHERE role = 'admin';

-- Step 3: Set a specific user as admin by email
-- Replace 'your-email@example.com' with your actual email from the list above
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Or set by user ID if you know it
-- UPDATE users SET role = 'admin' WHERE id = 'your-user-id';

-- Step 4: Verify the update - you should see your user with role = 'admin'
SELECT id, email, role FROM users WHERE role = 'admin';
