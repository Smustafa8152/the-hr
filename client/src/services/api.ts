import axios from 'axios';
import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
}

// Create axios instance for Supabase REST API
export const api = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1`,
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation' // Return the created/updated record
  }
});

// Helper for service role requests (admin only)
// Note: Both apikey and Authorization should use the service role key to bypass RLS
export const adminApi = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1`,
  headers: {
    'apikey': SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY, // Use service key if available
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
});

// Helper function to check if a token is a valid JWT
const isValidJWT = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

// Cache for Supabase session to avoid repeated async calls
let cachedSession: { access_token: string; expires_at: number } | null = null;
let sessionCacheTime = 0;
const SESSION_CACHE_DURATION = 60000; // 1 minute

// Add request interceptor to include access token for RLS
api.interceptors.request.use(
  config => {
    // First, check cached session (synchronous)
    const now = Date.now();
    if (cachedSession && now < sessionCacheTime) {
      if (isValidJWT(cachedSession.access_token)) {
        config.headers.Authorization = `Bearer ${cachedSession.access_token}`;
        return config;
      }
    }
    
    // Check sessionStorage/localStorage synchronously
    const accessToken = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
    if (accessToken && isValidJWT(accessToken) && accessToken !== SUPABASE_ANON_KEY) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      // Cache it
      cachedSession = { access_token: accessToken, expires_at: 0 };
      sessionCacheTime = now + SESSION_CACHE_DURATION;
      return config;
    }
    
    // If no valid token found, use default anon key (already set in default headers)
    // Don't try async Supabase session here to avoid breaking synchronous requests
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Periodically refresh Supabase session in background
setInterval(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token && isValidJWT(session.access_token)) {
      cachedSession = {
        access_token: session.access_token,
        expires_at: session.expires_at || 0
      };
      sessionCacheTime = Date.now() + SESSION_CACHE_DURATION;
    }
  } catch (error) {
    // Silently fail
  }
}, 30000); // Check every 30 seconds

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Log detailed error information
    if (error.response) {
      // Skip logging for 404 (Not Found) which often means missing table or record
      if (error.response.status !== 404) {
        console.error('API Error Response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
          config: {
            url: error.config.url,
            method: error.config.method,
            data: error.config.data
          }
        });
      }
    } else if (error.request) {
      console.error('API No Response:', error.request);
    } else {
      console.error('API Error Message:', error.message);
    }
    return Promise.reject(error);
  }
);
