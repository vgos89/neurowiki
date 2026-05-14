# GSC MCP Setup — one-time walkthrough for V

**MCP server:** `suganthan-gsc-mcp` (npm, Node-based, v2.2.2+)
**Auth method:** OAuth (interactive, browser flow)
**Property:** https://neurowiki.ai (must be verified in your GSC account)
**Time required:** ~15 minutes
**Re-run:** never (token refresh is automatic)

This walkthrough is the canonical setup for the GSC integration agreed
2026-05-14. If anything below drifts from the upstream
`suganthan-gsc-mcp` README, the upstream README wins — file a parking
lot entry to update this doc.

---

## Step 1 — Verify neurowiki.ai in Search Console (skip if done)

You already have GSC + GA4 set up per CLAUDE.md compliance notes, so
this step is almost certainly complete. Confirm:

1. Open https://search.google.com/search-console
2. Property selector (top left) should show `https://neurowiki.ai`
3. Click **Settings → Ownership verification** — confirm you have at
   least one verification method active

If neurowiki.ai is not verified, follow Google's instructions to add
the property and verify ownership before continuing.

---

## Step 2 — Google Cloud project + enable Search Console API

This is the only step that takes real time.

1. Open https://console.cloud.google.com
2. **Top bar → project dropdown → New Project** (or use an existing
   project that's tied to neurowiki.ai)
   - Project name: `neurowiki-seo` (or whatever you prefer)
   - Click **Create**
3. With the new project selected, go to
   **APIs & Services → Library**
4. Search for **Google Search Console API**
5. Click it → **Enable**
6. Wait ~30 seconds for the API to become available

---

## Step 3 — Create OAuth credentials (Desktop application)

1. **APIs & Services → Credentials → + CREATE CREDENTIALS → OAuth client ID**
2. If prompted to **Configure consent screen** first:
   - **User type → External** (required for personal Google accounts)
   - **App name:** `NeuroWiki GSC Local`
   - **User support email:** info@tidbithealth.in
   - **Developer contact:** info@tidbithealth.in
   - **Scopes:** add the scope `https://www.googleapis.com/auth/webmasters.readonly`
   - **Test users:** add your own Google email (the one that owns
     the neurowiki.ai GSC property)
   - **Save and continue** through the rest of the screens
3. Back at **Credentials → CREATE OAUTH CLIENT ID**:
   - **Application type → Desktop app**
   - **Name:** `NeuroWiki MCP Local`
   - Click **Create**
4. A dialog appears with the client ID and secret. **DOWNLOAD JSON**
5. Save the downloaded file to:
   `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/seo-data/client_secrets.json`
6. Verify the file is gitignored:
   ```bash
   cd /Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki
   git check-ignore docs/seo-data/client_secrets.json
   # Should print: docs/seo-data/client_secrets.json (= it IS ignored)
   ```
   If git would track it, do not commit — fix the `.gitignore` first.

---

## Step 4 — Install + configure the MCP server

Open your Claude Code MCP config. Location depends on platform —
typically `~/.claude/claude.json` or `~/.claude/mcp-config.json`. If
you're not sure, ask Claude (in a fresh chat) "where is my MCP config
file?"

Add this entry under the `mcpServers` object:

```json
{
  "mcpServers": {
    "gsc": {
      "command": "npx",
      "args": ["-y", "suganthan-gsc-mcp"],
      "env": {
        "GSC_CREDENTIALS_PATH": "/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/seo-data/client_secrets.json",
        "GSC_TOKEN_PATH": "/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/seo-data/token.json"
      }
    }
  }
}
```

Notes:
- The exact env var names (`GSC_CREDENTIALS_PATH`, `GSC_TOKEN_PATH`)
  may differ in `suganthan-gsc-mcp` — check that package's README on
  first install. If different, update them and let me know so I patch
  this doc.
- `GSC_TOKEN_PATH` points to where the MCP will write the cached
  OAuth token after step 5. The path doesn't need to exist yet — it'll
  be created on first auth.
- Both paths are gitignored.

Save the config file. **Restart Claude Code** so it picks up the new
MCP server.

---

## Step 5 — First-run OAuth flow

1. In a Claude Code session, ask: "Can you connect to the GSC MCP and
   list my GSC properties?"
2. Claude calls the MCP → MCP detects no token exists → MCP opens
   your browser to Google's OAuth consent screen
3. Sign in with the Google account that owns neurowiki.ai in GSC
4. Approve the `webmasters.readonly` scope
5. Browser shows a "you may now close this tab" success page
6. Back in Claude Code, the MCP completes and returns your property
   list. You should see `https://neurowiki.ai` (or
   `sc-domain:neurowiki.ai` if you verified via domain property).
7. The MCP writes `token.json` to the path you set. This file is
   gitignored — never commit it.

Token refresh is automatic. You only do this OAuth dance once per
machine.

---

## Step 6 — Smoke test queries

Try these in a Claude Code session to confirm everything works:

1. **Top 20 queries last 28 days:** "Pull the top 20 queries for
   neurowiki.ai from the last 28 days, sorted by clicks."
2. **Position change on a known keyword:** "What's our average
   position for 'NIHSS calculator' over the last 28 days vs the
   previous 28 days?"
3. **Indexing recovery check (after the 2026-05-13 sitemap fix):**
   "Show clicks and impressions for `/pathways/evt` for the last 14
   days." (Expect rising numbers as Google re-crawls the corrected
   sitemap.)
4. **Page-level CTR:** "Top 10 pages by impressions with their CTR
   over the last 28 days."

If all four return real data, the MCP is wired up correctly.

---

## Step 7 — Tell Claude the MCP is live

When you've confirmed the smoke tests pass, ping me in a new session:
"GSC MCP is wired up." I'll:

1. Update `.claude/skills/seo-audit-execution/SKILL.md` §5 to mark the
   MCP as **available** (currently marked placeholder).
2. Re-run SEO Phase 2 keyword research with real GSC positions
   (replaces the SERP-snapshot estimates from 2026-05-13).
3. Re-prioritize the Phase 3 game plan against the authoritative
   position data.
4. Set up a weekly snapshot routine to `docs/seo-data/` so we have a
   diff trail of indexing recovery + ranking shifts.

---

## Troubleshooting

**"redirect_uri_mismatch" during OAuth flow**
→ The MCP launches a local HTTP server (usually `http://localhost:PORT`)
  for the OAuth callback. The port must match what's allowed in the
  OAuth client. Open the OAuth client in Google Cloud Console and add
  `http://localhost` to authorized redirect URIs.

**"access denied" / "your account is not a test user"**
→ The OAuth consent screen is in **Testing** status. Either add your
  Google email to **Test users** in the OAuth consent screen, or
  publish the consent screen (this app is for your personal use, so
  Testing is fine).

**"Search Console API has not been used in project ... before or it is
disabled"**
→ Step 2 didn't complete. Re-enable the API in Google Cloud Console.

**Token expired / refresh failed**
→ Delete `docs/seo-data/token.json` and re-run step 5. The MCP will
  re-trigger the OAuth flow.

**MCP doesn't appear in Claude Code**
→ Check your MCP config JSON is valid (no trailing commas). Restart
  Claude Code. Run `npx -y suganthan-gsc-mcp --help` in a terminal to
  confirm the package runs.

---

## Security checklist before you walk away

- [ ] `docs/seo-data/client_secrets.json` exists and is **gitignored**
- [ ] `docs/seo-data/token.json` does not yet exist (will be created
      after step 5)
- [ ] `git status` does NOT list either file as untracked
- [ ] OAuth scope is `webmasters.readonly` (read-only — MCP cannot
      mutate your GSC data)
- [ ] The Google account used owns or has at least "Restricted" access
      to neurowiki.ai in GSC

---

## What changes after the MCP is live

| Doc / file | Change |
|---|---|
| `.claude/skills/seo-audit-execution/SKILL.md` §5 | Mark MCP as **available**, document the actual tool names |
| `docs/seo-keyword-research.md` | Re-run Phase 2 with authoritative positions, replace "unknown" entries |
| `docs/seo-game-plan-2026.md` | Re-prioritize Phase 3 actions against real position data |
| `docs/seo-data/keyword-positions-YYYY-MM-DD.md` | New file — committed weekly snapshot summary |
| `docs/seo-data/token.json`, `client_secrets.json` | Live on your machine, gitignored |
