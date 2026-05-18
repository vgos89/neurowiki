/**
 * Vercel serverless function: weekly SEO fetch (GA4 + GSC) + report.
 *
 * STATUS: scaffolding shipped 2026-05-18. NOT yet wired into vercel.json
 * crons — gated on (1) OAuth app verification or (2) explicit V approval
 * for Testing-mode refresh-token risk (7-day expiry on inactivity).
 *
 * Required Vercel env vars before this can run:
 *   OAUTH_CLIENT_ID         — from oauth-credentials.json `.installed.client_id`
 *   OAUTH_CLIENT_SECRET     — from oauth-credentials.json `.installed.client_secret`
 *   OAUTH_REFRESH_TOKEN     — from .oauth-token.json `.refresh_token` (run seo:auth-login locally first)
 *   GA4_PROPERTY_ID         — numeric GA4 Property ID
 *   GSC_SITE_URL            — defaults to https://neurowiki.ai/
 *   CRON_SECRET             — random 32+ char string; Vercel cron passes this in Authorization header
 *
 * Optional (for auto-commit to repo):
 *   GITHUB_TOKEN            — PAT with repo:contents write to vgos89/neurowiki
 *
 * Manual trigger (for testing):
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://neurowiki.ai/api/seo-weekly
 *
 * Cron schedule (when wired): every Monday at 06:00 UTC (= 06:00 IST = 11:30 PM PT Sun)
 *   "0 6 * * 1"
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/webmasters',
];

function isoDateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

interface OAuthTokens {
  access_token: string;
  expires_in: number;
}

/**
 * Exchange a refresh token for a fresh access token. Stateless — no token
 * persistence needed inside the serverless function lifecycle.
 */
async function refreshAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<OAuthTokens> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OAuth refresh failed (${resp.status}): ${text}`);
  }

  return (await resp.json()) as OAuthTokens;
}

async function fetchGSC(accessToken: string, siteUrl: string, days = 28) {
  const startDate = isoDateNDaysAgo(days);
  const endDate = isoDateNDaysAgo(1);

  const baseHeaders = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const queryByKey = async (dimension: 'query' | 'page') => {
    const resp = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({ startDate, endDate, dimensions: [dimension], rowLimit: 100 }),
      }
    );
    if (!resp.ok) throw new Error(`GSC ${dimension} fetch failed: ${resp.status}`);
    return ((await resp.json()) as { rows?: unknown[] }).rows ?? [];
  };

  const [topQueries, topPages] = await Promise.all([
    queryByKey('query'),
    queryByKey('page'),
  ]);

  const sitemapsResp = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`,
    { headers: baseHeaders }
  );
  const sitemaps = sitemapsResp.ok
    ? ((await sitemapsResp.json()) as { sitemap?: unknown[] }).sitemap ?? []
    : [];

  return {
    fetchedAt: new Date().toISOString(),
    siteUrl,
    dateRange: { startDate, endDate },
    topQueries,
    topPages,
    sitemaps,
  };
}

async function fetchGA4(accessToken: string, propertyId: string, days = 28) {
  const startDate = isoDateNDaysAgo(days);
  const endDate = 'today';
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const baseHeaders = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const runReport = async (body: object) => {
    const resp = await fetch(url, { method: 'POST', headers: baseHeaders, body: JSON.stringify(body) });
    if (!resp.ok) throw new Error(`GA4 fetch failed: ${resp.status} — ${await resp.text()}`);
    return ((await resp.json()) as { rows?: unknown[] }).rows ?? [];
  };

  const [topPages, sessionsBySource, events] = await Promise.all([
    runReport({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'averageSessionDuration' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 50,
    }),
    runReport({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 25,
    }),
    runReport({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 30,
    }),
  ]);

  return {
    fetchedAt: new Date().toISOString(),
    propertyId,
    dateRange: { startDate, endDate },
    topPages,
    sessionsBySource,
    events,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth — Vercel cron passes Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return res.status(500).json({ error: 'CRON_SECRET env var not set' });
  }
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const clientId = process.env.OAUTH_CLIENT_ID;
    const clientSecret = process.env.OAUTH_CLIENT_SECRET;
    const refreshToken = process.env.OAUTH_REFRESH_TOKEN;
    const ga4PropertyId = process.env.GA4_PROPERTY_ID;
    const gscSiteUrl = process.env.GSC_SITE_URL || 'https://neurowiki.ai/';

    const missing = Object.entries({
      OAUTH_CLIENT_ID: clientId,
      OAUTH_CLIENT_SECRET: clientSecret,
      OAUTH_REFRESH_TOKEN: refreshToken,
      GA4_PROPERTY_ID: ga4PropertyId,
    })
      .filter(([, v]) => !v)
      .map(([k]) => k);
    if (missing.length > 0) {
      return res.status(500).json({ error: `Missing env vars: ${missing.join(', ')}` });
    }

    // 1. Get fresh access token
    const tokens = await refreshAccessToken(clientId!, clientSecret!, refreshToken!);

    // 2. Pull both data sources in parallel
    const [ga4, gsc] = await Promise.all([
      fetchGA4(tokens.access_token, ga4PropertyId!),
      fetchGSC(tokens.access_token, gscSiteUrl).catch(err => ({ error: err.message })),
    ]);

    // 3. Return a JSON envelope. Auto-commit to repo is deferred until
    //    GITHUB_TOKEN setup is approved (would use the GH Contents API
    //    to write docs/seo-data/{ga4,gsc,weekly}/ files).
    return res.status(200).json({
      fetchedAt: new Date().toISOString(),
      ga4,
      gsc,
      note: 'Auto-commit to repo not yet enabled. Run npm run seo:weekly locally to capture this snapshot to disk.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
