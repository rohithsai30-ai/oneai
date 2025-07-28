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
  BUSINESS_ONBOARDING: 'business_onboarding'
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
    const { data, error } = await supabase
      .from(TABLES.BUSINESS_ONBOARDING)
      .insert([onboarding])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting business onboarding:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
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
  }
};
