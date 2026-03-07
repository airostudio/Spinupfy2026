-- Create bookings table for appointment/reservation system
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,

  -- Customer information
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),

  -- Booking details
  booking_type VARCHAR(50) NOT NULL, -- 'table', 'appointment', 'viewing', 'service', etc.
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  number_of_people INTEGER DEFAULT 1,

  -- Additional details
  special_requests TEXT,
  notes TEXT,

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed', 'no-show'
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by UUID REFERENCES users(id),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no-show'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_website_id ON bookings(website_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view bookings for their own websites
CREATE POLICY "Users can view bookings for their websites" ON bookings
  FOR SELECT
  USING (
    website_id IN (
      SELECT id FROM websites WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert bookings for their websites
CREATE POLICY "Users can manage bookings for their websites" ON bookings
  FOR ALL
  USING (
    website_id IN (
      SELECT id FROM websites WHERE user_id = auth.uid()
    )
  );

-- Policy: Anyone can create a booking (public form submission)
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

-- Add comments
COMMENT ON TABLE bookings IS 'Stores customer bookings/reservations for websites';
COMMENT ON COLUMN bookings.booking_type IS 'Type of booking: table, appointment, viewing, service, etc.';
COMMENT ON COLUMN bookings.status IS 'Current status of the booking';
COMMENT ON COLUMN bookings.duration_minutes IS 'Expected duration of the booking in minutes';
