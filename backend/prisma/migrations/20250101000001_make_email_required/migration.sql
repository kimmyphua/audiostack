-- Make email field required
-- First, update any existing users with null email to have a proper email
UPDATE users SET email = 'admin@audiostack.com' WHERE username = 'admin' AND email IS NULL;
UPDATE users SET email = 'user_' || id || '@audiostack.com' WHERE email IS NULL;

-- Then make the email column NOT NULL
ALTER TABLE users ALTER COLUMN email SET NOT NULL; 