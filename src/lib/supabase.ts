import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const looksConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) && /^https?:\/\//.test(supabaseUrl);

export const isSupabaseConfigured = looksConfigured;

export const supabase = looksConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
