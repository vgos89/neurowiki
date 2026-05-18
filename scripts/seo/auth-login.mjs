/**
 * One-time OAuth sign-in for SEO scripts.
 *
 * What it does:
 *   1. Spins up a one-shot localhost listener on a free port
 *   2. Builds the Google OAuth URL with that loopback redirect
 *   3. Opens your default browser to the consent page
 *   4. Captures the auth code on the loopback, exchanges for tokens
 *   5. Writes refresh-token to .oauth-token.json (gitignored)
 *
 * After this runs once, fetch-ga4.mjs and fetch-gsc.mjs auto-refresh forever.
 *
 * Usage: npm run seo:auth-login
 */

import http from 'node:http';
import { exec } from 'node:child_process';
import { buildOAuth2Client, saveToken, SCOPES } from './lib/google-auth.mjs';

function openInBrowser(url) {
  const cmd = process.platform === 'darwin' ? 'open'
    : process.platform === 'win32' ? 'start ""'
    : 'xdg-open';
  exec(`${cmd} "${url}"`);
}

async function main() {
  // Step 1: start a one-shot localhost server on a free port
  const server = http.createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;

  // Step 2: build OAuth client with the loopback redirect_uri
  const oauth2Client = buildOAuth2Client();
  oauth2Client.redirectUri = redirectUri;
  // googleapis OAuth2 instances also keep redirect_uri internally; set both for safety
  oauth2Client._opts = oauth2Client._opts || {};
  oauth2Client._opts.redirectUri = redirectUri;

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',          // request a refresh token
    prompt: 'consent',                // force consent so we always get refresh_token
    scope: SCOPES,
    redirect_uri: redirectUri,
  });

  console.log(`\n[seo:auth-login] Opening your browser to sign in...`);
  console.log(`If it doesn't open, paste this URL manually:\n${authUrl}\n`);
  openInBrowser(authUrl);

  // Step 3: capture the code on the loopback
  const code = await new Promise((resolve, reject) => {
    server.on('request', (req, res) => {
      try {
        const url = new URL(req.url, `http://127.0.0.1:${port}`);
        if (url.pathname !== '/oauth2callback') {
          res.writeHead(404).end('Not found');
          return;
        }
        const error = url.searchParams.get('error');
        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' }).end(
            `<h1>Auth failed</h1><p>${error}</p>`
          );
          reject(new Error(`OAuth error: ${error}`));
          return;
        }
        const code = url.searchParams.get('code');
        if (!code) {
          res.writeHead(400).end('Missing code parameter');
          reject(new Error('Missing code parameter on loopback callback'));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(
          `<!doctype html><html><head><meta charset="utf-8"></head><body style="font-family:system-ui;padding:40px;text-align:center;">
            <h1 style="color:#1746A2;">NeuroWiki SEO — connected</h1>
            <p>You can close this tab and return to the terminal.</p>
          </body></html>`
        );
        resolve(code);
      } catch (err) {
        reject(err);
      }
    });
  });

  server.close();

  // Step 4: exchange code for tokens (using the same redirect_uri)
  const { tokens } = await oauth2Client.getToken({ code, redirect_uri: redirectUri });

  if (!tokens.refresh_token) {
    console.error(
      `\n[seo:auth-login] WARNING: no refresh_token returned.\n` +
      `Google only issues a refresh_token on first consent.\n` +
      `To force a fresh consent: revoke access at ` +
      `https://myaccount.google.com/permissions then re-run.\n`
    );
  }

  saveToken(tokens);
  console.log(`\n[seo:auth-login] ✓ Token saved to .oauth-token.json`);
  console.log(`[seo:auth-login] You can now run:`);
  console.log(`  npm run seo:fetch-gsc`);
  console.log(`  npm run seo:fetch-ga4`);
  console.log(`  npm run seo:weekly\n`);
}

main().catch(err => {
  console.error(`\n[seo:auth-login] FAILED:`, err.message);
  process.exit(1);
});
