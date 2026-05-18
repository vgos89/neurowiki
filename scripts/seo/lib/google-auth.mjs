/**
 * Shared Google service-account auth for GA4 + Search Console.
 *
 * Reads credentials from one of:
 *   1. GOOGLE_SERVICE_ACCOUNT_JSON env var (inline JSON — for Vercel)
 *   2. GOOGLE_APPLICATION_CREDENTIALS env var (path to JSON — for local)
 *   3. ./seo-credentials.json file at repo root (gitignored — for local dev)
 *
 * Setup guide for V: docs/seo-data/api-integration-setup.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/webmasters', // for submitting sitemaps + indexing requests
];

function loadCredentials() {
  // 1. Inline JSON (preferred for CI / Vercel)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (err) {
      throw new Error(
        `GOOGLE_SERVICE_ACCOUNT_JSON env var is not valid JSON: ${err.message}`
      );
    }
  }

  // 2. File path from env var (standard Google convention)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!fs.existsSync(credPath)) {
      throw new Error(
        `GOOGLE_APPLICATION_CREDENTIALS points to ${credPath} which does not exist.`
      );
    }
    return JSON.parse(fs.readFileSync(credPath, 'utf-8'));
  }

  // 3. Repo-root fallback (must be gitignored)
  const repoCredsPath = path.join(process.cwd(), 'seo-credentials.json');
  if (fs.existsSync(repoCredsPath)) {
    return JSON.parse(fs.readFileSync(repoCredsPath, 'utf-8'));
  }

  throw new Error(
    'No Google service account credentials found. See docs/seo-data/api-integration-setup.md for setup.'
  );
}

/**
 * Returns an authenticated GoogleAuth client + a JWT for direct API use.
 * Use the JWT for both GA4 Data API and Search Console API.
 */
export async function getGoogleAuthClient() {
  const credentials = loadCredentials();
  const jwtClient = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
  });
  await jwtClient.authorize();
  return { jwtClient, credentials };
}

/**
 * Read env-config values. Throws clear errors if missing.
 */
export function getSeoConfig() {
  const ga4PropertyId = process.env.GA4_PROPERTY_ID;
  const gscSiteUrl = process.env.GSC_SITE_URL || 'sc-domain:neurowiki.ai';

  if (!ga4PropertyId) {
    throw new Error(
      'GA4_PROPERTY_ID env var is required. See docs/seo-data/api-integration-setup.md step 4.'
    );
  }

  return { ga4PropertyId, gscSiteUrl };
}
