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
      url: (savedUrl || envUrl || '').trim(),
      anonKey: (savedKey || envAnonKey || '').trim(),
    };
  } catch {
    return { url: (envUrl || '').trim(), anonKey: (envAnonKey || '').trim() };
  }
}

export function saveConfig(url: string, anonKey: string) {
  try {
    cachedClient = null;
    lastUsedUrl = '';
    lastUsedKey = '';

    const cleanUrl = url ? url.trim().replace(/\/+$/, '') : '';
    const cleanKey = anonKey ? anonKey.trim() : '';

    if (cleanUrl) localStorage.setItem('carestino_supabase_url', cleanUrl);
    else localStorage.removeItem('carestino_supabase_url');

    if (cleanKey) localStorage.setItem('carestino_supabase_anon_key', cleanKey);
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
  const { url, anonKey } = getSavedConfig();
  const supabase = getSupabase();
  if (!supabase || !url || !anonKey) {
    throw new Error('Supabase no está configurado. Por favor ingresá la URL del proyecto y la Anon Public Key.');
  }

  const redirectUrl = window.location.origin;

  // Use skipBrowserRedirect: true so we can guarantee the apikey query parameter is present in the redirect URL
  // This prevents Supabase's Kong gateway from rejecting the request with:
  // {"message":"No API key found in request","hint":"No `apikey` request header or url param was found."}
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        apikey: anonKey,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (data?.url) {
    let authUrl = data.url;
    // Guarantee apikey query parameter is present in the target authorization URL
    if (!authUrl.includes('apikey=')) {
      const sep = authUrl.includes('?') ? '&' : '?';
      authUrl = `${authUrl}${sep}apikey=${encodeURIComponent(anonKey)}`;
    }
    window.location.assign(authUrl);
    return data;
  }

  throw new Error('No se pudo generar la URL de autorización de Google.');
}

/**
 * Get active session
 */
export async function getAuthSession() {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Error fetching Supabase session:', error);
      return null;
    }
    return data.session;
  } catch (err) {
    console.warn('Failed to retrieve auth session:', err);
    return null;
  }
}

/**
 * Listen to auth state changes (login, logout, token refresh)
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const supabase = getSupabase();
  if (!supabase) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return () => {
    subscription.unsubscribe();
  };
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
