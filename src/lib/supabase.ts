import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'placeholder';

if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.error('Supabase URL is missing. Please add VITE_SUPABASE_URL to your environment variables in the Settings menu.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to fetch a user profile from the 'users' table.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('uid', uid)
    .single();

  if (error || !data) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data as UserProfile;
}
