-- R1 AI Complete Database Setup
-- Run this entire script in your Supabase SQL Editor

-- Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS payment_history CASCADE;
DROP TABLE IF EXISTS ixp_transactions CASCADE;
DROP TABLE IF EXISTS ixp_wallet CASCADE;
DROP TABLE IF EXISTS business_onboarding CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS interactions CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;

-- Create submissions table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  request_type TEXT NOT NULL,
  request_details TEXT NOT NULL,
  service TEXT NOT NULL,
  response_data JSONB,
  status TEXT CHECK (status IN ('pending', 'success', 'error')) DEFAULT 'pending'
);

-- Create interactions table
CREATE TABLE interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action TEXT NOT NULL,
  service TEXT NOT NULL,
  response_data JSONB,
  status TEXT CHECK (status IN ('pending', 'success', 'error')) DEFAULT 'pending'
);

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  business_name TEXT,
  website TEXT,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'admin', 'super_admin')) DEFAULT 'user',
  status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_onboarding table (THIS IS THE KEY MISSING TABLE!)
CREATE TABLE business_onboarding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_type TEXT NOT NULL,
  industry TEXT NOT NULL,
  company_size TEXT NOT NULL,
  annual_revenue TEXT,
  business_goals TEXT[] DEFAULT '{}',
  pain_points TEXT[] DEFAULT '{}',
  current_tools TEXT[] DEFAULT '{}',
  budget_range TEXT,
  timeline TEXT NOT NULL,
  additional_info TEXT,
  onboarding_completed BOOLEAN DEFAULT false
);

-- Create IXP wallet table
CREATE TABLE ixp_wallet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  subscription_tier TEXT CHECK (subscription_tier IN ('founder', 'growth', 'scale')) DEFAULT 'founder',
  monthly_allowance INTEGER DEFAULT 100,
  last_allowance_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create IXP transactions table
CREATE TABLE ixp_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES ixp_wallet(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('credit', 'debit', 'allowance', 'purchase')) NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  service_type TEXT,
  reference_id TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed'
);

-- Create payment history table
CREATE TABLE payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  stripe_payment_id TEXT,
  subscription_tier TEXT,
  ixp_credits_purchased INTEGER,
  description TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_business_onboarding_user_id ON business_onboarding(user_id);
CREATE INDEX idx_ixp_wallet_user_id ON ixp_wallet(user_id);
CREATE INDEX idx_ixp_transactions_user_id ON ixp_transactions(user_id);
CREATE INDEX idx_ixp_transactions_wallet_id ON ixp_transactions(wallet_id);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_submissions_created_at ON submissions(created_at);
CREATE INDEX idx_interactions_created_at ON interactions(created_at);

-- Enable Row Level Security (recommended for production)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE ixp_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE ixp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for development)
-- Note: In production, you should create more restrictive policies
CREATE POLICY "Allow all operations on submissions" ON submissions FOR ALL USING (true);
CREATE POLICY "Allow all operations on interactions" ON interactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on business_onboarding" ON business_onboarding FOR ALL USING (true);
CREATE POLICY "Allow all operations on ixp_wallet" ON ixp_wallet FOR ALL USING (true);
CREATE POLICY "Allow all operations on ixp_transactions" ON ixp_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on payment_history" ON payment_history FOR ALL USING (true);

-- Create admin_analytics table for system metrics
CREATE TABLE admin_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value JSONB NOT NULL,
  date_recorded DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_logs table for audit trail
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES users(id),
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample admin user (password: admin123)
-- You should change this password in production!
INSERT INTO users (full_name, email, business_name, password_hash, role) VALUES 
('Admin User', 'admin@r1ai.com', 'R1 AI Admin', '$2b$10$1.XcZwhI92Qf90yRkfwwIuz4d6n/qt3Rsauym0j5pHCPWxQnBjqyC', 'admin');

-- Insert sample data for testing (optional)
-- You can uncomment these lines if you want test data

-- INSERT INTO users (full_name, email, business_name, password_hash) VALUES 
-- ('Test User', 'test@example.com', 'Test Business', '$2b$10$test.hash.here');

-- Success message
SELECT 'SUCCESS: All R1 AI database tables created successfully with admin functionality!' as message;
