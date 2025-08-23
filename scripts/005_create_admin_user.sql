-- Create a default admin user profile
-- This script should be run after the first admin user signs up
-- Replace 'admin@uiso2025.com' with the actual admin email

-- Update the first user to be admin (replace with actual admin user ID)
-- This is a template - you'll need to run this manually with the correct user ID
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@uiso2025.com';

-- Or create admin user if using direct database access:
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (gen_random_uuid(), 'admin@uiso2025.com', crypt('admin_password', gen_salt('bf')), NOW(), NOW(), NOW());

-- Note: For security, admin users should be created through the normal signup process
-- and then manually promoted to admin role in the database
