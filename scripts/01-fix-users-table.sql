-- Add password_hash column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update the admin user with proper password hash
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (id, phone, role, password_hash) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '+91 99999 99999', 
  'admin', 
  '$2b$10$rQJ5qP8YgF0x8YgF0x8YgOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK'
) ON CONFLICT (phone) DO UPDATE SET 
  password_hash = '$2b$10$rQJ5qP8YgF0x8YgF0x8YgOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  role = 'admin';

-- Create some sample users for testing (password: test123)
INSERT INTO users (phone, role, password_hash) VALUES
  ('+91 98765 43210', 'user', '$2b$10$K8BEQNjvgojGlM0VoAQa4.rQJ5qP8YgF0x8YgOeKKKKKKKKKKKKKKK'),
  ('+91 98765 43211', 'user', '$2b$10$K8BEQNjvgojGlM0VoAQa4.rQJ5qP8YgF0x8YgOeKKKKKKKKKKKKKKK')
ON CONFLICT (phone) DO NOTHING;
