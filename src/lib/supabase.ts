import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables or fallback local storage config
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Local storage override for testing credentials directly in the browser
export function getSavedConfig(): { url: string; anonKey: string } {
  try {
    const savedUrl = localStorage.getItem('carestino_supabase_url');
    const savedKey = localStorage.getItem('carestino_supabase_anon_key');
    return {
      url: savedUrl || envUrl,
      anonKey: savedKey || envAnonKey,
    };
  } catch {
    return { url: envUrl, anonKey: envAnonKey };
  }
}

export function saveConfig(url: string, anonKey: string) {
  try {
    if (url) localStorage.setItem('carestino_supabase_url', url.trim());
    else localStorage.removeItem('carestino_supabase_url');

    if (anonKey) localStorage.setItem('carestino_supabase_anon_key', anonKey.trim());
    else localStorage.removeItem('carestino_supabase_anon_key');
  } catch (e) {
    console.error('Error saving supabase config', e);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSavedConfig();
  if (!url || !anonKey) {
    return null;
  }

  if (cachedClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return cachedClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

/**
 * Trigger Google OAuth sign-in via Supabase
 */
export async function signInWithGoogle() {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase no está configurado. Por favor ingresá la URL y Anon Key.');
  }

  const redirectUrl = window.location.origin;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
}
