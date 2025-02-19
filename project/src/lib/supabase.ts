import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

// Configure Supabase client with retries and better error handling
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'flooring_crm_auth',
    storage: localStorage
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'flooring-crm'
    }
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase error:', error);
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return 'Database configuration is missing. Please check your environment variables.';
  }
  
  if (error?.message?.includes('Failed to fetch')) {
    return 'Unable to connect to the database. Please check your internet connection and try again.';
  }
  
  if (error?.code === 'PGRST116') {
    return 'No data found';
  }

  if (error?.code === '23505') {
    return 'A record with this information already exists';
  }

  if (error?.code === 'auth/invalid-email') {
    return 'Please enter a valid email address';
  }

  if (error?.code === 'auth/wrong-password') {
    return 'Invalid password';
  }

  if (error?.code === 'auth/user-not-found') {
    return 'No account found with this email';
  }
  
  return error?.message || 'An unexpected error occurred';
};

// Helper function to retry failed requests
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

// Helper function to check connection
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};

// Initialize connection handling
let reconnectTimeout: NodeJS.Timeout;

window.addEventListener('online', () => {
  clearTimeout(reconnectTimeout);
  reconnectTimeout = setTimeout(async () => {
    const isConnected = await checkSupabaseConnection();
    if (isConnected) {
      window.location.reload();
    }
  }, 2000);
});

window.addEventListener('offline', () => {
  clearTimeout(reconnectTimeout);
  console.warn('Lost internet connection - Supabase operations will be unavailable');
});