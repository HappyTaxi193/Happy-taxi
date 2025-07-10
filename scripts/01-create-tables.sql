-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(15) UNIQUE NOT NULL,
  role VARCHAR(10) CHECK (role IN ('user', 'driver', 'admin')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drivers table for additional driver information
CREATE TABLE IF NOT EXISTS drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  photograph_url TEXT,
  primary_phone VARCHAR(15) NOT NULL,
  secondary_phone VARCHAR(15),
  address TEXT NOT NULL,
  aadhaar_number VARCHAR(12) UNIQUE NOT NULL,
  driving_license_url TEXT NOT NULL,
  vehicle_number VARCHAR(20) NOT NULL,
  car_model VARCHAR(50) NOT NULL,
  car_make VARCHAR(50) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rides table
CREATE TABLE IF NOT EXISTS rides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  from_location VARCHAR(255) NOT NULL,
  to_location VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  seats_booked INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('confirmed', 'cancelled')) DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_verified ON drivers(is_verified);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ride_id ON bookings(ride_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Add password field to users table and create admin user
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create admin user (password: admin123)
INSERT INTO users (id, phone, role, password_hash) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '+91 99999 99999', 
  'admin', 
  '$2b$10$rQJ5qP8YgF0x8YgF0x8YgOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK'
) ON CONFLICT (phone) DO NOTHING;

-- Update policies to include password authentication
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- Create policies for drivers table
CREATE POLICY "Drivers can view their own data" ON drivers
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Drivers can update their own data" ON drivers
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Anyone can view verified drivers" ON drivers
  FOR SELECT USING (is_verified = true);

-- Create policies for rides table
CREATE POLICY "Anyone can view active rides" ON rides
  FOR SELECT USING (status = 'active');

CREATE POLICY "Drivers can manage their own rides" ON rides
  FOR ALL USING (driver_id IN (SELECT id FROM drivers WHERE user_id::text = auth.uid()::text));

-- Create policies for bookings table
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Drivers can view bookings for their rides" ON bookings
  FOR SELECT USING (ride_id IN (
    SELECT r.id FROM rides r 
    JOIN drivers d ON r.driver_id = d.id 
    WHERE d.user_id::text = auth.uid()::text
  ));
