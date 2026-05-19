/**
 * Vercel cron endpoint — daily TTL sweep on the `transfers` table.
 *
 * Why this exists:
 *   - Each transfer row is one-time-read (deleted on first successful fetch).
 *   - But rows whose sender never finishes the handoff sit there until they
 *     expire. We delete those after the 15-minute TTL has passed.
 *
 * Schedule (configured in vercel.json):
 *   "0 4 * * *" — once a day at 04:00 UTC
 *
 * Auth:
 *   Vercel automatically attaches Authorization: Bearer $CRON_SECRET to
 *   cron-triggered requests. The function rejects anything else.
 *
 * Service-role:
 *   Uses SUPABASE_SERVICE_ROLE_KEY (server-only env var). The anon key
 *   COULD theoretically do this too via the RLS delete policy, but service
 *   role is the correct choice for a privileged maintenance task.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth check — Vercel cron passes Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return res.status(500).json({ error: 'CRON_SECRET env var not set' });
  }
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({
      error: 'Missing env vars',
      missing: [
        !supabaseUrl && 'SUPABASE_URL',
        !serviceRoleKey && 'SUPABASE_SERVICE_ROLE_KEY',
      ].filter(Boolean),
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Delete expired rows
  const { data, error } = await supabase
    .from('transfers')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select('token');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({
    purged: data?.length ?? 0,
    sweptAt: new Date().toISOString(),
  });
}
