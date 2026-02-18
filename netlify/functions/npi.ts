/**
 * Netlify Function — NPI Registry CORS Proxy
 * Route: /api/npi  (via netlify.toml redirect)
 *
 * The NPPES NPI Registry API does not send CORS headers, so browser
 * fetch calls fail. This function proxies requests server-side and
 * adds the appropriate CORS headers for the NeuroWiki frontend.
 */

import type { Handler, HandlerEvent } from '@netlify/functions';

const NPPES_BASE = 'https://npiregistry.cms.hhs.gov/api/';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export const handler: Handler = async (event: HandlerEvent) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // Forward all query params to NPPES
    const qs = event.rawQuery ? `?${event.rawQuery}` : '';
    const upstreamUrl = `${NPPES_BASE}${qs}`;

    const response = await fetch(upstreamUrl, {
      headers: { 'User-Agent': 'NeuroWiki/1.0' },
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'NPI lookup failed', detail: String(err) }),
    };
  }
};
