
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const getEnv = (key: string): string => {
  const searchKeys = [
    `VITE_${key}`,
    key,
    `REACT_APP_${key}`,
    `PUBLIC_${key}`
  ];

  // 1. Check import.meta.env (Vite standard)
  try {
    // @ts-ignore
    const metaEnv = (import.meta as any).env;
    if (metaEnv) {
      for (const sk of searchKeys) {
        if (metaEnv[sk]) return metaEnv[sk];
      }
    }
  } catch (e) {}

  // 2. Check process.env (Node/Webpack/CommonJS fallback)
  try {
    if (typeof process !== 'undefined' && process.env) {
      for (const sk of searchKeys) {
        // @ts-ignore
        if (process.env[sk]) return process.env[sk];
      }
    }
  } catch (e) {}

  // 3. Check window globals (Injection fallback)
  if (typeof window !== 'undefined') {
    const win = window as any;
    // Check window.ENV or window._env_ or just window
    const envSources = [win.ENV, win._env_, win.process?.env, win];
    for (const source of envSources) {
      if (!source) continue;
      for (const sk of searchKeys) {
        if (typeof source[sk] === 'string' && source[sk]) return source[sk];
      }
    }
  }

  return '';
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Log (masked) for debugging in browser console
if (typeof window !== 'undefined') {
  console.log('Supabase Detection:', {
    hasUrl: !!supabaseUrl,
    urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 10) + '...' : 'none',
    hasKey: !!supabaseAnonKey,
    keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 5) + '...' : 'none'
  });
}

export const isConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http')
);

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
