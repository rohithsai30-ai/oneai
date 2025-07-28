// Data storage utility for R1 AI automation app
// Now uses Supabase for cloud database storage with localStorage fallback

import { supabaseHelpers } from '../lib/supabase';

export interface UserSubmission {
  id: string;
  timestamp: string;
  type: 'submission';
  requestType: string;
  requestDetails: string;
  service?: string;
  response?: any;
  status: 'pending' | 'success' | 'error';
}

export interface UserInteraction {
  id: string;
  timestamp: string;
  type: 'interaction';
  action: string;
  service: string;
  response?: any;
  status: 'pending' | 'success' | 'error';
}

export type DataEntry = UserSubmission | UserInteraction;

// localStorage keys
const STORAGE_KEYS = {
  SUBMISSIONS: 'r1ai_submissions',
  INTERACTIONS: 'r1ai_interactions',
  DRAFT_DATA: 'r1ai_draft_data'
};

// Client-side localStorage functions
export const localStorage = {
  // Save draft data (auto-save as user types)
  saveDraft: (data: { requestType?: string; requestDetails?: string }) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEYS.DRAFT_DATA, JSON.stringify({
          ...data,
          lastUpdated: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error saving draft to localStorage:', error);
      }
    }
  },

  // Load draft data
  loadDraft: (): { requestType?: string; requestDetails?: string; lastUpdated?: string } => {
    if (typeof window !== 'undefined') {
      try {
        const draft = window.localStorage.getItem(STORAGE_KEYS.DRAFT_DATA);
        return draft ? JSON.parse(draft) : {};
      } catch (error) {
        console.error('Error loading draft from localStorage:', error);
        return {};
      }
    }
    return {};
  },

  // Clear draft data
  clearDraft: () => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEYS.DRAFT_DATA);
      } catch (error) {
        console.error('Error clearing draft from localStorage:', error);
      }
    }
  },

  // Save submission to localStorage
  saveSubmission: (submission: UserSubmission) => {
    if (typeof window !== 'undefined') {
      try {
        const existing = window.localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
        const submissions = existing ? JSON.parse(existing) : [];
        submissions.push(submission);
        window.localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
      } catch (error) {
        console.error('Error saving submission to localStorage:', error);
      }
    }
  },

  // Save interaction to localStorage
  saveInteraction: (interaction: UserInteraction) => {
    if (typeof window !== 'undefined') {
      try {
        const existing = window.localStorage.getItem(STORAGE_KEYS.INTERACTIONS);
        const interactions = existing ? JSON.parse(existing) : [];
        interactions.push(interaction);
        window.localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(interactions));
      } catch (error) {
        console.error('Error saving interaction to localStorage:', error);
      }
    }
  },

  // Get all submissions
  getSubmissions: (): UserSubmission[] => {
    if (typeof window !== 'undefined') {
      try {
        const submissions = window.localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
        return submissions ? JSON.parse(submissions) : [];
      } catch (error) {
        console.error('Error getting submissions from localStorage:', error);
        return [];
      }
    }
    return [];
  },

  // Get all interactions
  getInteractions: (): UserInteraction[] => {
    if (typeof window !== 'undefined') {
      try {
        const interactions = window.localStorage.getItem(STORAGE_KEYS.INTERACTIONS);
        return interactions ? JSON.parse(interactions) : [];
      } catch (error) {
        console.error('Error getting interactions from localStorage:', error);
        return [];
      }
    }
    return [];
  }
};

// Supabase database functions
export const supabaseStorage = {
  // Save submission to Supabase
  saveSubmission: async (submission: Omit<UserSubmission, 'id' | 'timestamp'>): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
      const result = await supabaseHelpers.insertSubmission({
        request_type: submission.requestType,
        request_details: submission.requestDetails,
        service: submission.service || 'unknown',
        response_data: submission.response,
        status: submission.status
      });
      
      if (result.success) {
        return { success: true, id: result.data?.id };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error saving submission to Supabase:', error);
      return { success: false, error: 'Database error' };
    }
  },

  // Save interaction to Supabase
  saveInteraction: async (interaction: Omit<UserInteraction, 'id' | 'timestamp'>): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
      const result = await supabaseHelpers.insertInteraction({
        action: interaction.action,
        service: interaction.service,
        response_data: interaction.response,
        status: interaction.status
      });
      
      if (result.success) {
        return { success: true, id: result.data?.id };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error saving interaction to Supabase:', error);
      return { success: false, error: 'Database error' };
    }
  },

  // Get all data from Supabase
  getData: async (): Promise<{ submissions: UserSubmission[]; interactions: UserInteraction[] } | null> => {
    try {
      const result = await supabaseHelpers.getAllData();
      
      // Transform Supabase data to match our interface
      const submissions: UserSubmission[] = result.submissions.map(sub => ({
        id: sub.id,
        timestamp: sub.created_at,
        type: 'submission' as const,
        requestType: sub.request_type,
        requestDetails: sub.request_details,
        service: sub.service,
        response: sub.response_data,
        status: sub.status
      }));
      
      const interactions: UserInteraction[] = result.interactions.map(int => ({
        id: int.id,
        timestamp: int.created_at,
        type: 'interaction' as const,
        action: int.action,
        service: int.service,
        response: int.response_data,
        status: int.status
      }));
      
      return { submissions, interactions };
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
      return null;
    }
  }
};

// Combined storage functions (saves to both localStorage and Supabase)
export const dataStorage = {
  // Save submission with dual persistence (localStorage + Supabase)
  saveSubmission: async (submissionData: Omit<UserSubmission, 'id' | 'timestamp'>) => {
    const submission: UserSubmission = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...submissionData
    };

    // Save to localStorage immediately for instant feedback
    localStorage.saveSubmission(submission);

    // Save to Supabase (cloud database)
    const supabaseResult = await supabaseStorage.saveSubmission(submissionData);
    
    return { 
      localSuccess: true, 
      serverSuccess: supabaseResult.success,
      serverId: supabaseResult.id,
      error: supabaseResult.error 
    };
  },

  // Save interaction with dual persistence (localStorage + Supabase)
  saveInteraction: async (interactionData: Omit<UserInteraction, 'id' | 'timestamp'>) => {
    const interaction: UserInteraction = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...interactionData
    };

    // Save to localStorage immediately for instant feedback
    localStorage.saveInteraction(interaction);

    // Save to Supabase (cloud database)
    const supabaseResult = await supabaseStorage.saveInteraction(interactionData);
    
    return { 
      localSuccess: true, 
      serverSuccess: supabaseResult.success,
      serverId: supabaseResult.id,
      error: supabaseResult.error 
    };
  },

  // Get all data (prioritize Supabase, fallback to localStorage)
  getData: async (): Promise<{ submissions: UserSubmission[]; interactions: UserInteraction[] }> => {
    try {
      // Try to get data from Supabase first
      const supabaseData = await supabaseStorage.getData();
      
      if (supabaseData) {
        return supabaseData;
      } else {
        // Fallback to localStorage if Supabase fails
        console.warn('Supabase unavailable, using localStorage fallback');
        return {
          submissions: localStorage.getSubmissions(),
          interactions: localStorage.getInteractions()
        };
      }
    } catch (error) {
      console.error('Error getting data, using localStorage fallback:', error);
      return {
        submissions: localStorage.getSubmissions(),
        interactions: localStorage.getInteractions()
      };
    }
  }
};

// Legacy API storage (keeping for backward compatibility)
export const apiStorage = supabaseStorage;
