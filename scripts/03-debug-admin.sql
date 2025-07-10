-- Check if admin user exists
SELECT * FROM users WHERE phone = '+91 99999 99999';

-- If no admin exists, create one
INSERT INTO users (id, phone, role, password_hash) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '+91 99999 99999', 
  'admin', 
  'YWRtaW4xMjM='
) ON CONFLICT (phone) DO UPDATE SET 
  role = 'admin',
  password_hash = 'YWRtaW4xMjM=';

-- Verify the admin user was created
SELECT * FROM users WHERE role = 'admin';
