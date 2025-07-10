-- Create a test driver user
INSERT INTO users (id, phone, role, password_hash) 
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '+91 98765 54321', 
  'driver', 
  'ZHJpdmVyMTIz'  -- base64 of 'driver123'
) ON CONFLICT (phone) DO UPDATE SET 
  role = 'driver',
  password_hash = 'ZHJpdmVyMTIz';

-- Create the driver profile for this user
INSERT INTO drivers (
  id,
  user_id,
  primary_phone,
  secondary_phone,
  address,
  aadhaar_number,
  vehicle_number,
  car_model,
  car_make,
  driving_license_url,
  photograph_url,
  is_verified
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  '+91 98765 54321',
  '+91 98765 54322',
  '123 Test Street, Mumbai, Maharashtra 400001',
  '123456789012',
  'MH 01 AB 5678',
  'Swift Dzire',
  'Maruti Suzuki',
  'placeholder-license-url',
  'placeholder-photo-url',
  true  -- Pre-verified for testing
) ON CONFLICT (id) DO UPDATE SET
  is_verified = true;

-- Verify the driver was created
SELECT u.*, d.* FROM users u 
LEFT JOIN drivers d ON u.id = d.user_id 
WHERE u.role = 'driver';
