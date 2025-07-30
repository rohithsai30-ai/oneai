-- SQL to add IXP Wallet system tables to your Supabase database
-- Copy and paste this into your Supabase SQL Editor

-- Create IXP Wallet table
CREATE TABLE ixp_wallet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  subscription_tier TEXT CHECK (subscription_tier IN ('founder', 'growth', 'scale')) DEFAULT 'founder',
  monthly_allowance INTEGER NOT NULL DEFAULT 75,
  last_allowance_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create IXP Transactions table
CREATE TABLE ixp_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES ixp_wallet(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('credit', 'debit', 'allowance', 'purchase')) NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  service_type TEXT,
  reference_id TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed'
);

-- Create Payment History table
CREATE TABLE payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  stripe_payment_id TEXT,
  subscription_tier TEXT,
  ixp_credits_purchased INTEGER,
  description TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE ixp_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE ixp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for development)
CREATE POLICY "Allow all operations on ixp_wallet" ON ixp_wallet FOR ALL USING (true);
CREATE POLICY "Allow all operations on ixp_transactions" ON ixp_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on payment_history" ON payment_history FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_ixp_wallet_user_id ON ixp_wallet(user_id);
CREATE INDEX idx_ixp_transactions_user_id ON ixp_transactions(user_id);
CREATE INDEX idx_ixp_transactions_wallet_id ON ixp_transactions(wallet_id);
CREATE INDEX idx_ixp_transactions_created_at ON ixp_transactions(created_at);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_payment_history_created_at ON payment_history(created_at);

-- Create function to automatically create wallet for new users
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ixp_wallet (user_id, balance, total_earned, subscription_tier, monthly_allowance)
  VALUES (NEW.id, 75, 75, 'founder', 75);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create wallet when user signs up
CREATE TRIGGER trigger_create_user_wallet
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();
