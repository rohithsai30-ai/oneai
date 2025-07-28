-- Complete SQL to create all tables for R1 AI automation app
-- Copy and paste this into your Supabase SQL Editor

-- Create users table for Sign Up data
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  website TEXT,
  phone TEXT,
  password_hash TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'active'
);

-- Create submissions table for form submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  request_type TEXT NOT NULL,
  request_details TEXT NOT NULL,
  service TEXT NOT NULL,
  response_data JSONB,
  status TEXT CHECK (status IN ('pending', 'success', 'error')) DEFAULT 'pending'
);

-- Create interactions table for service usage tracking
CREATE TABLE IF NOT EXISTS interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action TEXT NOT NULL,
  service TEXT NOT NULL,
  response_data JSONB,
  status TEXT CHECK (status IN ('pending', 'success', 'error')) DEFAULT 'pending'
);

-- Enable Row Level Security for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for development)
-- Note: In production, you should create more restrictive policies
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on submissions" ON submissions FOR ALL USING (true);
CREATE POLICY "Allow all operations on interactions" ON interactions FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_submissions_created_at ON submissions(created_at);
CREATE INDEX idx_interactions_created_at ON interactions(created_at);
