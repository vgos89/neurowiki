# SEO API integration — one-time setup for V

This is what enables the Tidbit-pattern "Claude has API access to GA4 + GSC for NeuroWiki." After this is set up, I can pull real GA4 metrics + Google Search Console queries on demand, generate weekly reports, and act on the data (submit sitemaps, request indexing, etc.).

You do this once. After that, the integration is automatic.

## What you're setting up (90-second mental model)

You'll create a **Google service account** — a special Google identity that represents this app, not a person. It gets read access (and limited write access) to your GA4 property and your Search Console property. The credentials live in one JSON file. That JSON file goes into a Vercel environment variable. From then on, the scripts in this repo can pull data + act on the two accounts without needing your password or 2FA.

## Five steps. Should take under 5 minutes.

### Step 1 — Create a Google Cloud project (or use existing)

1. Go to https://console.cloud.google.com.
2. Top bar, project dropdown → "New Project".
3. Name: `neurowiki-seo` (or any name — doesn't matter).
4. Wait ~30 seconds for project to create. Select it from the project dropdown.

### Step 2 — Enable the two APIs

1. Top bar search → type "Google Analytics Data API" → click the result → "Enable".
2. Top bar search → type "Search Console API" → click the result → "Enable".

(These are free for the volumes NeuroWiki uses.)

### Step 3 — Create a service account + download its key

1. Left sidebar → "IAM & Admin" → "Service Accounts" → "+ Create Service Account".
2. Name: `neurowiki-seo-bot`. Skip the optional grants screens. Click Done.
3. Click the new service account email in the list (looks like `neurowiki-seo-bot@neurowiki-seo.iam.gserviceaccount.com`).
4. Tab → "Keys" → "Add Key" → "Create new key" → "JSON" → Create. A file downloads. **This file is the credentials. Don't email it, don't paste it into chat.**

### Step 4 — Grant the service account access to GA4 + GSC

The service account exists but has no permissions yet. Add it as a viewer on both:

**GA4 (Google Analytics):**
1. Go to https://analytics.google.com → Admin (bottom left gear).
2. Property column → "Property access management".
3. "+" top right → "Add users".
4. Email = the service account email from step 3 (e.g., `neurowiki-seo-bot@neurowiki-seo.iam.gserviceaccount.com`).
5. Role = "Analyst" (or "Viewer" — Viewer is the minimum).
6. Add.
7. **While you're here, copy the GA4 Property ID** — it's the number in the top-right of the Property column, looks like `123456789`. You'll need it in step 5.

**Google Search Console:**
1. Go to https://search.google.com/search-console.
2. Select the NeuroWiki property.
3. Settings (left sidebar) → "Users and permissions" → "Add User".
4. Email = same service account email.
5. Permission = "Full" (needed for submit-sitemap and request-indexing endpoints; if you prefer read-only, use "Restricted").
6. Add.

### Step 5 — Drop the credentials into Vercel + locally

**For Vercel (production reports + cron):**
1. Vercel dashboard → NeuroWiki project → Settings → Environment Variables.
2. Add **two** variables:
   - Name: `GOOGLE_SERVICE_ACCOUNT_JSON` — Value: paste the entire contents of the JSON file from step 3.
   - Name: `GA4_PROPERTY_ID` — Value: the number from GA4 (step 4).
3. Apply to Production + Preview + Development. Save.

**For local dev (so you can run reports on your laptop):**
1. Save the JSON file as `seo-credentials.json` in the repo root (`/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/seo-credentials.json`).
2. That filename is already in `.gitignore` — it will never get committed.
3. Add to `.env.local` in the repo root: `GA4_PROPERTY_ID=123456789` (replace with your number).

Done. The integration is live.

## How to use it after setup

From the repo root:

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

## What this unlocks (Claude's "full control")

Once the integration is wired, I can:

**Read on demand:**
- Top 100 search queries you're appearing for, with clicks/impressions/CTR/avg position
- Top 50 pages by GA4 views, with sessions and average duration
- Source/medium breakdown — how clinicians actually find the site
- Custom event counts — which calculators get used, how often, by which user role
- Indexability status — which URLs Google has discovered vs indexed vs excluded

**Act on the data (write access):**
- Submit a new sitemap version after a deploy
- Request indexing for a specific URL (e.g., after you publish a new pathway)
- Programmatically reconcile the route manifest titles/descriptions against actual GSC keyword performance

**Automate (with cron):**
- Weekly report auto-generated and committed to the repo every Monday
- Alerts if a high-traffic page drops out of the index
- Trend tracking — week-over-week query growth/decline

## What I need from you before I can run anything

Just confirm when steps 1–5 are done. You don't have to share the JSON contents with me — I can run scripts that read it from the env var, and you can verify the first report worked.

If you'd rather I walk you through any single step in real-time, say so and I'll be more granular.
