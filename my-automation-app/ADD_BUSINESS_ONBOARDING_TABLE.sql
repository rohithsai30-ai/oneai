-- SQL to add business onboarding table to your Supabase database
-- Copy and paste this into your Supabase SQL Editor

-- Create business_onboarding table
CREATE TABLE business_onboarding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_type TEXT NOT NULL,
  industry TEXT NOT NULL,
  company_size TEXT NOT NULL,
  annual_revenue TEXT,
  business_goals TEXT[] NOT NULL DEFAULT '{}',
  pain_points TEXT[] NOT NULL DEFAULT '{}',
  current_tools TEXT[] NOT NULL DEFAULT '{}',
  budget_range TEXT,
  timeline TEXT NOT NULL,
  additional_info TEXT,
  onboarding_completed BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE business_onboarding ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for development)
CREATE POLICY "Allow all operations on business_onboarding" ON business_onboarding FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_business_onboarding_user_id ON business_onboarding(user_id);
CREATE INDEX idx_business_onboarding_created_at ON business_onboarding(created_at);
