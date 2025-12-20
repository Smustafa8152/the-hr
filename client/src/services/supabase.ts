import { createClient } from '@supabase/supabase-js';

// Get configuration from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hlcobldukxhxscqmvcgi.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsY29ibGR1a3hoc3hjcW12Y2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMzE4NDEsImV4cCI6MjA4MTgwNzg0MX0.zNhSF6Q5wGsC7bhL2TZLRmCqay_0JWTYD0xQuEzYcgA';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to check connection
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('employees').select('count').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};
