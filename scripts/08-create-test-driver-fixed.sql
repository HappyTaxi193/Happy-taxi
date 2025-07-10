-- Delete any existing test driver data first
DELETE FROM drivers WHERE primary_phone = '+91 98765 54321';
DELETE FROM users WHERE phone = '+91 98765 54321';

-- Create a test driver user
INSERT INTO users (id, phone, role, password_hash) 
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '+91 98765 54321', 
  'driver', 
  'ZHJpdmVyMTIz'  -- base64 of 'driver123'
);

-- Create the driver profile for this user with unique Aadhaar
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
  '987654321098',  -- Different Aadhaar number
  'MH 01 AB 5678',
  'Swift Dzire',
  'Maruti Suzuki',
  'placeholder-license-url',
  'placeholder-photo-url',
  true  -- Pre-verified for testing
);

-- Verify the driver was created
SELECT u.phone, u.role, d.aadhaar_number, d.vehicle_number, d.is_verified 
FROM users u 
LEFT JOIN drivers d ON u.id = d.user_id 
WHERE u.phone = '+91 98765 54321';
