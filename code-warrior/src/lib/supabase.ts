import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const hasPublicSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

const resolvedPublicConfig = hasPublicSupabaseEnv
  ? { url: supabaseUrl, anonKey: supabaseAnonKey }
  : {
      // Allow production build to complete in preview environments with missing vars.
      // Runtime calls that depend on real credentials will still fail with clear errors.
      url: 'https://placeholder.supabase.co',
      anonKey: 'placeholder-anon-key',
    };

if (!hasPublicSupabaseEnv) {
  const details = {
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
  };

  if (process.env.NODE_ENV === 'production') {
    console.warn('Missing Supabase environment variables; using placeholder values for build.', details);
  } else {
    console.error('Missing Supabase environment variables:', details);
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
  }
}

// Client-side Supabase client (uses anon key)
export const supabase = createClient(resolvedPublicConfig.url, resolvedPublicConfig.anonKey);

// Server-side Supabase client (uses service role key for admin operations)
export const getServiceSupabase = () => {
  if (typeof window !== 'undefined') {
    throw new Error('getServiceSupabase() must only be called on the server');
  }

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
