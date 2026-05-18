/**
 * Shared Google OAuth user-auth for GA4 + Search Console.
 *
 * Why OAuth instead of service account: GA4 rejects service-account emails
 * with "doesn't match a Google Account" when the GA4 property is owned by
 * a personal Google account (vs a Workspace organization). OAuth user-auth
 * sidesteps this by authenticating AS the property owner.
 *
 * Two files involved:
 *   1. oauth-credentials.json — downloaded from Google Cloud Console
 *      (OAuth 2.0 Client ID, Desktop app type). Gitignored. Repo root.
 *   2. .oauth-token.json — refresh token, produced ONCE by running
 *      `npm run seo:auth-login`. Gitignored. Repo root.
 *
 * Setup guide: docs/seo-data/api-integration-setup.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

export const SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/webmasters', // submit sitemaps + request indexing
];

const OAUTH_CREDS_PATH = path.join(process.cwd(), 'oauth-credentials.json');
const TOKEN_PATH = path.join(process.cwd(), '.oauth-token.json');

function loadOAuthClientCreds() {
  if (!fs.existsSync(OAUTH_CREDS_PATH)) {
    throw new Error(
      `oauth-credentials.json not found at repo root.\n` +
      `Download from Google Cloud Console: APIs & Services → Credentials → ` +
      `your Desktop-app OAuth client → Download JSON.\n` +
      `See docs/seo-data/api-integration-setup.md`
    );
  }
  const raw = JSON.parse(fs.readFileSync(OAUTH_CREDS_PATH, 'utf-8'));
  // Google downloads as { installed: { client_id, client_secret, ... } } for desktop apps
  const creds = raw.installed || raw.web || raw;
  if (!creds.client_id || !creds.client_secret) {
    throw new Error(
      `oauth-credentials.json missing client_id or client_secret. ` +
      `Was this downloaded as a Desktop-app OAuth client?`
    );
  }
  return creds;
}

export function buildOAuth2Client() {
  const creds = loadOAuthClientCreds();
  // For Desktop-app flow we use a loopback redirect; auth-login.mjs spins up
  // a one-shot localhost listener on a free port and sets redirect_uri to match.
  return new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    creds.redirect_uris?.[0] || 'http://localhost'
  );
}

/**
 * Load the saved refresh-token. Throws with a clear pointer if not present.
 */
function loadSavedToken() {
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error(
      `No saved OAuth token found at ${TOKEN_PATH}.\n` +
      `Run \`npm run seo:auth-login\` once to authorize (opens a browser).`
    );
  }
  return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
}

export function saveToken(token) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
}

/**
 * Returns an authenticated OAuth2 client ready for GA4 + Search Console.
 * Used by fetch-ga4.mjs and fetch-gsc.mjs.
 */
export async function getGoogleAuthClient() {
  const oauth2Client = buildOAuth2Client();
  const token = loadSavedToken();
  oauth2Client.setCredentials(token);
  // googleapis auto-refreshes the access token using the refresh_token when needed.
  return { oauth2Client };
}

/**
 * Read env-config values. Throws clear errors if missing.
 */
export function getSeoConfig() {
  const ga4PropertyId = process.env.GA4_PROPERTY_ID;
  const gscSiteUrl = process.env.GSC_SITE_URL || 'https://neurowiki.ai/';

  if (!ga4PropertyId) {
    throw new Error(
      'GA4_PROPERTY_ID env var is required. ' +
      'Find it in GA4 → Admin → Property Settings (numeric ID). ' +
      'Add to .env.local: GA4_PROPERTY_ID=123456789'
    );
  }

  return { ga4PropertyId, gscSiteUrl };
}
