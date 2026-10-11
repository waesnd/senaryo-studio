import { createClient } from '@supabase/supabase-js';

let client;
export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || key.includes('...')) return false;
  try { return ['http:', 'https:'].includes(new URL(url).protocol); } catch { return false; }
}
export function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  if (!client) client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}
export const supabase = getSupabaseClient();
