/**
 * Supabase browser client — uses the public anon key, gated by Row Level
 * Security policies on the `transfers` table.
 *
 * Server-side service_role usage lives in api/* serverless functions and
 * uses different env vars (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY without
 * the VITE_ prefix).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

/** Returns the Supabase client. Returns null when env vars aren't configured
 *  (lets the rest of the app keep working — relay UI just shows an error). */
export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        // We don't use Supabase Auth — the relay is anonymous + token-gated.
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}
