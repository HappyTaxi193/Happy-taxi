-- Create admin user with hashed password
-- Password: admin123
INSERT INTO users (id, phone, role, password_hash) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '+91 99999 99999', 
  'admin', 
  '$2b$10$K8BEQNjvgojGlM0VoAQa4.rQJ5qP8YgF0x8YgOeKKKKKKKKKKKKKKK'
) ON CONFLICT (phone) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role;

-- Create some sample users for testing
INSERT INTO users (phone, role, password_hash) VALUES
  ('+91 98765 43210', 'user', '$2b$10$K8BEQNjvgojGlM0VoAQa4.rQJ5qP8YgF0x8YgOeKKKKKKKKKKKKKKK'),
  ('+91 98765 43211', 'user', '$2b$10$K8BEQNjvgojGlM0VoAQa4.rQJ5qP8YgF0x8YgOeKKKKKKKKKKKKKKK')
ON CONFLICT (phone) DO NOTHING;
