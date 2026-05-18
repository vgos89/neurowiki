# SEO API integration — one-time setup for V

This is what enables "Claude has API access to GA4 + GSC for NeuroWiki." After this is set up, I can pull real GA4 metrics + Google Search Console queries on demand, generate weekly reports, and act on the data (submit sitemaps, request indexing, etc.).

You do this once. After that, the integration is automatic.

## Why OAuth (not service-account)

Originally this used a Google service account (the "robot identity" pattern). GA4 rejects service-account emails when the GA4 property is owned by a personal Google account (vs a Workspace organization) — the "This email doesn't match a Google Account" wall. OAuth user-auth sidesteps this entirely: the scripts authenticate **as you**, inheriting the access you already have as the property admin.

## What you've already done

If you got this far, you've already:
- Created the `neurowiki-seo` Google Cloud project
- Enabled the GA4 Data API and Search Console API
- Configured the OAuth consent screen (External, app name `neurowiki-seo`)
- Created an OAuth 2.0 Client ID of type **Desktop app** (`neurowiki-seo-oauth`)
- Downloaded the OAuth JSON and saved it as `oauth-credentials.json` at the repo root

## Two final pieces before the sign-in works

### A. Add yourself as a Test User on the consent screen

Because the app is in "Testing" mode (not published), Google blocks OAuth flows for anyone not on the test-user list. Even if you own the project.

1. Go to https://console.cloud.google.com/auth/audience (in the `neurowiki-seo` project)
2. Under **Test users**, click **+ Add users**
3. Enter your Google account email (the one that owns the GA4 property)
4. Save

### B. Make sure `GA4_PROPERTY_ID` is in `.env.local`

Find the numeric ID at: GA4 → Admin (bottom-left gear) → Property column → Property settings. It looks like `123456789`.

Add to `.env.local` at the repo root:

```
GA4_PROPERTY_ID=123456789
```

(Replace with your actual number.)

### Optional: GSC_SITE_URL override

The script defaults to `sc-domain:neurowiki.ai` for Search Console. If your GSC property is registered differently (e.g., `https://neurowiki.ai/` as a URL-prefix property instead of a Domain property), set:

```
GSC_SITE_URL=https://neurowiki.ai/
```

If it's already a Domain property and the default matches, skip this.

## Run the one-time sign-in

```bash
npm run seo:auth-login
```

What happens:
1. Script spins up a tiny local server on a free port
2. Your default browser opens to a Google sign-in page
3. You sign in as the Google account that owns the GA4 property
4. You consent to the requested scopes (Analytics read, Search Console read+write)
5. Google sends you back to the local server; the script captures the auth code
6. Refresh token gets saved to `.oauth-token.json` (gitignored)
7. Done. You can close the browser tab.

From now on, all the `seo:*` scripts auto-refresh the access token using the saved refresh token. No re-sign-in required (unless you revoke access at https://myaccount.google.com/permissions).

## Use it after setup

```bash
# Pull the last 28 days of Search Console data
npm run seo:fetch-gsc

# Pull the last 28 days of GA4 data
npm run seo:fetch-ga4

# Generate a plain-English weekly report from both
npm run seo:report

# All three in sequence (the standard weekly run)
npm run seo:weekly
```

Reports land in `docs/seo-data/weekly/{date}-report.md` — markdown tables with top queries, top pages, sessions by source, calculator-usage events. Both raw JSON snapshots (in `docs/seo-data/{ga4,gsc}/`) and the synthesized report get committed to the repo so you can read them on GitHub or on your phone via the docs/ folder.

## What this unlocks

**Read on demand:**
- Top 100 search queries you're appearing for, with clicks/impressions/CTR/avg position
- Top 50 pages by GA4 views, with sessions and average duration
- Source/medium breakdown — how clinicians actually find the site
- Custom event counts — which calculators get used, how often, by which user role
- Submitted sitemaps and their last-submission timestamps

**Act on the data:**
- Submit a new sitemap version after a deploy
- Request indexing for a specific URL (e.g., after a new pathway publishes)
- Programmatically reconcile route titles/descriptions against actual query performance

## Common gotchas

- **"Access blocked: neurowiki-seo has not completed the Google verification process"** — you didn't add yourself as a Test User (step A above), or the email you're signing in with doesn't match the test user you added.
- **"redirect_uri_mismatch"** — Google occasionally cares about the loopback port. Desktop apps are supposed to allow any loopback port automatically; if you hit this, paste the URL Google shows and tell me the exact mismatch text.
- **No refresh token returned (warning at end of auth-login)** — Google only issues a refresh token on first consent. To force a fresh one: revoke access at https://myaccount.google.com/permissions, then re-run `seo:auth-login`.
