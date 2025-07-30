import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  SUBMISSIONS: 'submissions',
  INTERACTIONS: 'interactions',
  USERS: 'users',
  BUSINESS_ONBOARDING: 'business_onboarding',
  IXP_WALLET: 'ixp_wallet',
  IXP_TRANSACTIONS: 'ixp_transactions',
  PAYMENT_HISTORY: 'payment_history'
} as const;

// Type definitions for database tables
export interface DatabaseSubmission {
  id: string;
  created_at: string;
  request_type: string;
  request_details: string;
  service: string;
  response_data: any;
  status: 'pending' | 'success' | 'error';
}

export interface DatabaseInteraction {
  id: string;
  created_at: string;
  action: string;
  service: string;
  response_data: any;
  status: 'pending' | 'success' | 'error';
}

export interface DatabaseUser {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  business_name: string;
  website?: string;
  phone?: string;
  password_hash: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface DatabaseBusinessOnboarding {
  id: string;
  created_at: string;
  user_id: string;
  business_type: string;
  industry: string;
  company_size: string;
  annual_revenue?: string;
  business_goals: string[];
  pain_points: string[];
  current_tools: string[];
  budget_range?: string;
  timeline: string;
  additional_info?: string;
  onboarding_completed: boolean;
}

export interface DatabaseIXPWallet {
  id: string;
  created_at: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  subscription_tier: 'founder' | 'growth' | 'scale';
  monthly_allowance: number;
  last_allowance_date: string;
}

export interface DatabaseIXPTransaction {
  id: string;
  created_at: string;
  user_id: string;
  wallet_id: string;
  type: 'credit' | 'debit' | 'allowance' | 'purchase';
  amount: number;
  description: string;
  service_type?: string;
  reference_id?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface DatabasePaymentHistory {
  id: string;
  created_at: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_id?: string;
  subscription_tier?: string;
  ixp_credits_purchased?: number;
  description: string;
}

// Helper functions for database operations
export const supabaseHelpers = {
  // Insert a new submission
  async insertSubmission(submission: Omit<DatabaseSubmission, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from(TABLES.SUBMISSIONS)
      .insert([submission])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting submission:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  },

  // Insert a new interaction
  async insertInteraction(interaction: Omit<DatabaseInteraction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from(TABLES.INTERACTIONS)
      .insert([interaction])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting interaction:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  },

  // Get all submissions
  async getSubmissions() {
    const { data, error } = await supabase
      .from(TABLES.SUBMISSIONS)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching submissions:', error);
      return { success: false, error: error.message, data: [] };
    }
    
    return { success: true, data: data || [] };
  },

  // Get all interactions
  async getInteractions() {
    const { data, error } = await supabase
      .from(TABLES.INTERACTIONS)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching interactions:', error);
      return { success: false, error: error.message, data: [] };
    }
    
    return { success: true, data: data || [] };
  },

  // Get all data (submissions and interactions)
  async getAllData() {
    const [submissionsResult, interactionsResult] = await Promise.all([
      this.getSubmissions(),
      this.getInteractions()
    ]);

    return {
      submissions: submissionsResult.data,
      interactions: interactionsResult.data,
      errors: [
        ...(submissionsResult.success ? [] : [submissionsResult.error]),
        ...(interactionsResult.success ? [] : [interactionsResult.error])
      ]
    };
  },

  // Insert a new user
  async insertUser(user: Omit<DatabaseUser, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert([user])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting user:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  },

  // Check if email already exists
  async checkEmailExists(email: string) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('id')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking email:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, exists: !!data };
  },

  // Get user by email
  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error getting user:', error);
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data };
  },

  // Insert business onboarding data
  async insertBusinessOnboarding(onboarding: Omit<DatabaseBusinessOnboarding, 'id' | 'created_at'>) {
    try {
      console.log('Attempting to insert business onboarding data:', onboarding);
      console.log('Table name:', TABLES.BUSINESS_ONBOARDING);
      
      const { data, error } = await supabase
        .from(TABLES.BUSINESS_ONBOARDING)
        .insert([onboarding])
        .select()
        .single();
      
      if (error) {
        console.error('Error inserting business onboarding:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return { success: false, error: error.message || 'Failed to save business onboarding data' };
      }
      
      console.log('Successfully inserted business onboarding:', data);
      return { success: true, data };
    } catch (err) {
      console.error('Unexpected error in insertBusinessOnboarding:', err);
      return { success: false, error: 'Unexpected error occurred while saving data' };
    }
  },

  // Get business onboarding by user ID
  async getBusinessOnboardingByUserId(userId: string) {
    const { data, error } = await supabase
      .from(TABLES.BUSINESS_ONBOARDING)
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error getting business onboarding:', error);
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data };
  },

  // Update business onboarding
  async updateBusinessOnboarding(id: string, updates: Partial<Omit<DatabaseBusinessOnboarding, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from(TABLES.BUSINESS_ONBOARDING)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating business onboarding:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  },

  // IXP Wallet Functions
  async createIXPWallet(userId: string, subscriptionTier: 'founder' | 'growth' | 'scale' = 'founder') {
    const tierAllowances = {
      founder: 75,
      growth: 150,
      scale: 350
    };
    
    const walletData = {
      user_id: userId,
      balance: tierAllowances[subscriptionTier],
      total_earned: tierAllowances[subscriptionTier],
      total_spent: 0,
      subscription_tier: subscriptionTier,
      monthly_allowance: tierAllowances[subscriptionTier],
      last_allowance_date: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLES.IXP_WALLET)
      .insert([walletData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating IXP wallet:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  },

  async getIXPWallet(userId: string) {
    const { data, error } = await supabase
      .from(TABLES.IXP_WALLET)
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error getting IXP wallet:', error);
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data };
  },

  async updateIXPBalance(userId: string, amount: number, type: 'credit' | 'debit', description: string, serviceType?: string) {
    // Get current wallet
    const walletResult = await this.getIXPWallet(userId);
    if (!walletResult.success || !walletResult.data) {
      return { success: false, error: 'Wallet not found' };
    }

    const wallet = walletResult.data;
    const newBalance = type === 'credit' ? wallet.balance + amount : wallet.balance - amount;
    
    if (type === 'debit' && newBalance < 0) {
      return { success: false, error: 'Insufficient IXP balance' };
    }

    // Update wallet balance
    const { data: updatedWallet, error: walletError } = await supabase
      .from(TABLES.IXP_WALLET)
      .update({
        balance: newBalance,
        total_earned: type === 'credit' ? wallet.total_earned + amount : wallet.total_earned,
        total_spent: type === 'debit' ? wallet.total_spent + amount : wallet.total_spent
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (walletError) {
      console.error('Error updating wallet balance:', walletError);
      return { success: false, error: walletError.message };
    }

    // Create transaction record
    const transactionData = {
      user_id: userId,
      wallet_id: wallet.id,
      type: type,
      amount: amount,
      description: description,
      service_type: serviceType,
      status: 'completed' as const
    };

    const { data: transaction, error: transactionError } = await supabase
      .from(TABLES.IXP_TRANSACTIONS)
      .insert([transactionData])
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      // Don't fail the whole operation for transaction logging
    }

    return { success: true, data: updatedWallet, transaction };
  },

  async getIXPTransactions(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from(TABLES.IXP_TRANSACTIONS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error getting IXP transactions:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  },

  async addPaymentHistory(paymentData: Omit<DatabasePaymentHistory, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from(TABLES.PAYMENT_HISTORY)
      .insert([paymentData])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding payment history:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  },

  async getPaymentHistory(userId: string) {
    return supabase
      .from(TABLES.PAYMENT_HISTORY)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching payment history:', error);
          return { success: false, error: error.message, data: null };
        }
        return { success: true, error: null, data };
      });
  },

  // Get business onboarding data (alias for convenience)
  getBusinessOnboarding(userId: string) {
    return this.getBusinessOnboardingByUserId(userId);
  },

  // Admin functions
  async getAllUsers() {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select(`
        id,
        full_name,
        email,
        business_name,
        role,
        status,
        created_at,
        ixp_wallet(balance),
        business_onboarding(onboarding_completed)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all users:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  },

  async updateUserRole(userId: string, role: string) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  },

  async updateUserStatus(userId: string, status: string) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user status:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  },

  async deleteUser(userId: string) {
    const { error } = await supabase
      .from(TABLES.USERS)
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: null };
  },

  async getAdminStats() {
    try {
      // Get user counts
      const { data: userStats, error: userError } = await supabase
        .from(TABLES.USERS)
        .select('id, status, created_at')
        .neq('role', 'admin');

      if (userError) {
        console.error('Error fetching user stats:', userError);
        return { success: false, error: userError.message };
      }

      // Get onboarding completion stats
      const { data: onboardingStats, error: onboardingError } = await supabase
        .from(TABLES.BUSINESS_ONBOARDING)
        .select('id, onboarding_completed');

      // Get IXP wallet stats
      const { data: walletStats, error: walletError } = await supabase
        .from(TABLES.IXP_WALLET)
        .select('balance');

      // Calculate stats
      const totalUsers = userStats?.length || 0;
      const activeUsers = userStats?.filter(u => u.status === 'active').length || 0;
      const completedOnboardings = onboardingStats?.filter(o => o.onboarding_completed).length || 0;
      const totalIXPCredits = walletStats?.reduce((sum, w) => sum + (w.balance || 0), 0) || 0;

      const stats = {
        totalUsers,
        activeUsers,
        totalRevenue: totalUsers * 299, // Estimated based on average plan
        totalIXPCredits,
        completedOnboardings,
        activeAutomations: Math.floor(totalUsers * 0.6) // Estimated
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error in getAdminStats:', error);
      return { success: false, error: 'Failed to fetch admin stats' };
    }
  },

  async logAdminAction(adminUserId: string, action: string, targetUserId?: string, details?: any) {
    const { data, error } = await supabase
      .from('admin_logs')
      .insert({
        admin_user_id: adminUserId,
        action,
        target_user_id: targetUserId,
        details,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging admin action:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }
};
