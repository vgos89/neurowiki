/**
 * Vercel Serverless Function — visitor country for consent gating.
 * Auto-routed by Vercel to: /api/geo
 *
 * Returns the visitor's country from Vercel's `x-vercel-ip-country` header so
 * the client can decide whether analytics needs opt-in consent (EU/EEA/UK/CH/BR)
 * or can default on with an opt-out (rest of world). The country-to-region
 * mapping lives client-side in src/lib/consent.ts as the single source of truth.
 *
 * The response is never cached (it is per-visitor) so a shared or CDN cache can
 * never serve one visitor's country to another. The static HTML is untouched
 * and stays fully cacheable.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const raw = req.headers['x-vercel-ip-country'];
  const country = typeof raw === 'string' && raw.length === 2 ? raw.toUpperCase() : null;
  return res.status(200).json({ country });
}
