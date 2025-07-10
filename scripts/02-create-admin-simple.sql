-- Simple admin creation without complex hashing
-- First ensure the password_hash column exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Delete existing admin if exists and recreate
DELETE FROM users WHERE phone = '+91 99999 99999';

-- Create admin user with simple hash (base64 of 'admin123')
INSERT INTO users (id, phone, role, password_hash) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '+91 99999 99999', 
  'admin', 
  'YWRtaW4xMjM='
);

-- Create test users
INSERT INTO users (phone, role, password_hash) VALUES
  ('+91 98765 43210', 'user', 'dGVzdDEyMw=='),
  ('+91 98765 43211', 'user', 'dGVzdDEyMw==')
ON CONFLICT (phone) DO NOTHING;
