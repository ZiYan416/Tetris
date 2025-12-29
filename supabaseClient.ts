import { createClient } from '@supabase/supabase-js';

// Safely access environment variables
// (import.meta as any).env might be undefined if not running in a Vite environment
const env = (import.meta as any).env || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials missing! If you are running locally, ensure you have a .env file and are running via "npm run dev".');
}

// Create client with fallbacks to prevent crash
export const supabase = createClient(
    SUPABASE_URL || 'https://placeholder.supabase.co', 
    SUPABASE_ANON_KEY || 'placeholder'
);