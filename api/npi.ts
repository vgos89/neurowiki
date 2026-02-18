/**
 * Vercel Serverless Function — NPI Registry CORS Proxy
 * Auto-routed by Vercel to: /api/npi
 *
 * The NPPES NPI Registry API does not send CORS headers, so browser
 * fetch calls fail. This function proxies requests server-side.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const NPPES_BASE = 'https://npiregistry.cms.hhs.gov/api/';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Forward all query params to NPPES
    const params = new URLSearchParams(req.query as Record<string, string>);
    const upstreamUrl = `${NPPES_BASE}?${params.toString()}`;

    const response = await fetch(upstreamUrl, {
      headers: { 'User-Agent': 'NeuroWiki/1.0' },
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'NPI lookup failed', detail: String(err) });
  }
}
