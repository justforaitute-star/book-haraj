
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Safely access process.env to prevent ReferenceErrors in browsers
const getEnv = (key: string): string => {
  try {
    return (typeof process !== 'undefined' && process.env && process.env[key]) || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Only create the client if we have valid-looking credentials
// This prevents the library from throwing an error during module import
export const isConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
