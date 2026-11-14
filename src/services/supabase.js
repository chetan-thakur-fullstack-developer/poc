import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  // Require a proper JWT anon key (starts with eyJ, >100 chars)
  // Reject service-role secrets (sb_secret_...) that cannot be used in browser clients
  const keyValid =
    Boolean(supabaseAnonKey) &&
    supabaseAnonKey.length > 100 &&
    supabaseAnonKey.startsWith('eyJ') &&
    !supabaseAnonKey.includes('your-anon-key');

  const urlValid =
    Boolean(supabaseUrl) &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co') &&
    !supabaseUrl.includes('your-project');

  return urlValid && keyValid;
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export const checkSupabaseConnection = async () => {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      message: 'Supabase credentials are not set in .env. Enter your SUPABASE_URL and SUPABASE_ANON_KEY to enable cloud sync.'
    };
  }

  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return {
        success: false,
        message: `Connected to Supabase project, but query returned: ${error.message}. Make sure you ran supabase_schema.sql in the SQL Editor.`
      };
    }
    return {
      success: true,
      message: 'Successfully connected to your Supabase project!'
    };
  } catch (err) {
    return {
      success: false,
      message: `Connection error: ${err.message}`
    };
  }
};
