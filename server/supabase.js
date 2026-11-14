import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseKey) &&
    !supabaseUrl.includes('your-project') &&
    !supabaseKey.includes('your-anon-key') &&
    !supabaseKey.includes('your-service-role')
  );
};

// Initialize Supabase Client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      }
    })
  : null;

export const getSupabaseStatus = () => {
  return {
    configured: isSupabaseConfigured(),
    url: supabaseUrl ? supabaseUrl.replace(/^(https?:\/\/[^.]+).*/, '$1.supabase.co') : 'Not Set',
    hasKey: Boolean(supabaseKey)
  };
};
