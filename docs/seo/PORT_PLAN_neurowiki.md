# Port plan: Tidbit daily SEO routine → NeuroWiki (neurowiki.ai)

**Date:** 2026-09-07
**Status:** awaiting V approval (no implementation until approved)
**Task class:** D (new unattended automation crossing `scripts/`, `.claude/`, `docs/`; new scheduled job; governance implications). Not `-clinical`: the job is report-only and mechanically barred from clinical surfaces (§8 below). Architect review artifact: `docs/reviews/arch-PR-seo-daily-port.md`.
**Source system:** `/Users/vaibhav/Documents/Tidbit Health/Tidbit-Website` daily SEO job, in production since 2026-08. This plan copies it, parameterises it, and changes only what genuinely differs.

---

## 0. Decisions locked by V (interview, 2026-09-07)

| Question | V's answer |
|---|---|
| Target site | neurowiki.ai, this repo (the ".io" reference resolved to this site) |
| Autonomy | **Suggest only.** The job never edits site files. It drafts up to 3 ready-to-approve snippet rewordings per morning; V applies them in supervised sessions. |
| Push policy | **Never push.** Morning commits stay local; V's next supervised session pushes. Recorded as a deliberate exception to CLAUDE.md golden rule 8, scoped to this job only (ADR, §8.4). |
| Google Ads | No account. The Monday paid-terms routine and the Ads half of the Gemini loop are dropped, not stubbed. |

Answered from the repo (not asked): repo is git with full CLAUDE.md governance; content lives in typed TS data files (`src/config/routeManifest.ts`, `src/data/trial*.ts`) plus JSX pages prerendered to static HTML; Google credentials already exist and worked in May 2026; compliance surface is NeuroWiki's own clinical-claims regime (CLAUDE.md §13), which is stricter than Tidbit's and already hook-enforced.

---

## 1. What each side already has

**Tidbit brings** the orchestration and judgment layer: `daily-run.sh` (tier logic, manifest, findings-vs-failure semantics), the analysis scripts, the anomaly alarm, the rewrite-experiment ledger, the briefing format, the dashboard builder, the scheduled-task wrapper, and the governance pattern.

**NeuroWiki already has** the data layer the port would otherwise have to build:

- Working OAuth stack: `scripts/seo/lib/google-auth.mjs`, `npm run seo:auth-login`, credentials at repo root (`oauth-credentials.json`, `.oauth-token.json`, both gitignored).
- GSC property `https://neurowiki.ai/` (URL-prefix, apex host) with real data and the sitemap registered, 0 errors. GA4 property `367909578`, measurement live (`G-0PD4HYYNTP`) with a rich clinician-event schema.
- Fetchers writing raw snapshots to `docs/seo-data/{gsc,ga4}/` (dormant since 2026-05-22).
- A hook-enforced humanizer scanner, a clinical-surfaces no-touch list, `docs/link-graph.json`, a 182-URL sitemap, and full prerendered HTML for every route (crawlable content source).

The port therefore **revives NeuroWiki's dormant data layer and adds Tidbit's daily brain on top**. Nothing is rewritten that already works on either side.

---

## 2. Config extraction (one config, so site three is a config file)

New file `scripts/seo/config.mjs`, imported by every ported script. No domain, property ID, URL list, or output path is hardcoded anywhere else.

```js
export const SITE = {
  name: 'NeuroWiki',
  baseUrl: 'https://neurowiki.ai',            // apex: matches GSC property + Gate 6
  gscSiteUrl: process.env.GSC_SITE_URL || 'https://neurowiki.ai/',
  ga4PropertyId: process.env.GA4_PROPERTY_ID || '367909578',
  sitemapUrl: 'https://neurowiki.ai/sitemap.xml',
  sitemapUrlFloor: 160,                        // alarm if <loc> count drops below (182 today)
  homepageMarker: 'NeuroWiki',                 // anomaly "wrong content" check
  reportRoot: 'docs/seo',                      // briefings, analysis reports, runs/, dashboard
  rawDataRoot: 'docs/seo-data',                // existing raw GSC/GA4 snapshot convention, kept
  psiApiKey: process.env.PSI_API_KEY || null,  // optional; PageSpeed degrades gracefully
  conversionEvents: [                          // "clinician actions" for snapshot + dashboard
    'calculator_used', 'calculator_copied', 'pathway_step_advanced',
    'deep_learning_opened', 'external_citation_clicked', 'feedback_submitted',
  ],                                           // verified against src/utils/analytics.ts in step 3
  schemaCheckUrls: ['/', '/calculators', '/calculators/nihss', '/calculators/ich-score',
    '/pathways/stroke-code', '/guide/iv-tpa', '/trials', '/trials/sammpris-trial', '/privacy'],
  pagespeedUrls: ['/', '/calculators/nihss', '/pathways/stroke-code', '/trials'],
  dashboardArtifactUrl: null,   // set once at implementation step 7; the next site inherits the field, not a pasted URL
  kindOf: (path) => '…',        // path → kind classifier; the site-specific taxonomy lives HERE, not in shared scripts
}
```

Property ID and site URL are not secrets (both already appear in committed snapshots). **One config source (architect condition 4):** `getSeoConfig()` in `scripts/seo/lib/google-auth.mjs` is rewired to read `config.mjs`, so the kept fetchers and the ported scripts share one set of defaults and one failure mode; its current hardcoded apex fallback and its throw when `GA4_PROPERTY_ID` is unset both go away. `daily-run.sh` sources `.env.local` when present and invokes the fetchers with plain `node` (not the `--env-file=.env.local` npm scripts, which error when that file is missing), so `.env.local` becomes genuinely optional and only ever *needs* `PSI_API_KEY`.

**Auth:** a thin `scripts/seo/_auth.mjs` shim exports Tidbit's `makeAuth(scopes)` signature backed by the existing `lib/google-auth.mjs`. Ported scripts keep near-verbatim diffs, which is the point: fewer porting bugs.

---

## 3. Content-model adapter

**The interface** (what the analysis scripts consume):

```ts
type PageRecord = {
  url: string;          // absolute, apex host
  path: string;         // "/calculators/nihss"
  kind: 'calculator' | 'pathway' | 'guide' | 'trial' | 'question' | 'hub' | 'legal' | 'other';
  title: string | null;       // current <title> source of truth
  description: string | null; // current meta description
  lastmod: string | null;     // from public/sitemap.xml
  inSitemap: boolean;
}
```

**The NeuroWiki adapter** is `scripts/seo/lib/site-pages.ts`, run via `tsx` (precedent: `scripts/gen-trial-card-meta.ts` already imports from `src/` and runs in `prebuild`). Architect condition 3: it **consumes, never re-derives**:

1. `getRouteMeta(pathname)` from `src/seo/routeMeta.ts`: the exact title/description strings the site actually serves, for every route including trial and `/trials/q/*` question pages. No parallel derivation, so a snippet proposal can never quote a phantom "old wording" baseline.
2. `SITEMAP_ROUTES` from `src/seo/sitemapRoutes.ts` as the canonical path universe,
3. `public/sitemap.xml` only for `lastmod` and `inSitemap`.

Records are keyed on **path**, hosts normalized with the same apex/www normalizer `scripts/prerender.mjs` already uses, so GSC rows (apex) and sitemap rows (www today) join cleanly. `kind` is an opaque string produced by `config.kindOf(path)`: analysis scripts may group by it but never branch on NeuroWiki's member names (condition 8). The snapshot is emitted to `docs/seo/runs/<date>/pages-snapshot.json` (derived output lives with run artifacts, not among captured raw data; condition 13). Analysis scripts (plain `.mjs`) read the JSON. Cost: well under 150 lines, and it is the first thing built after credentials (solve the content coupling first, not last).

**Body text and internal links are not in data files** (they live in JSX), so the body-level source is the site's own prerendered HTML: a weekly crawler (§4, `crawl-links.mjs`) fetches every sitemap URL and extracts internal links. One crawler feeds three reports (dead links, orphan pages, link opportunities). `docs/link-graph.json` is used as a cross-check only.

---

## 4. Script-by-script fate

**Daily tier** (every morning, ~40s of scripts):

| Tidbit script | Fate | Note |
|---|---|---|
| `fetch-gsc.mjs` | keep NeuroWiki's | already writes `docs/seo-data/gsc/`; run with 28-day window |
| `daily-snapshot.mjs` | port | GA4 yesterday + 7-day; conversion-events section reads `config.conversionEvents` |
| `rank-deltas.mjs` | port | config only |
| `keyword-opportunities.mjs` | port | config only |
| `blog-refresh.mjs` | **rework → `page-refresh.mjs`** | joins GSC query+page data against the §3 adapter across all 182 pages. Same classifications (REWRITE_SNIPPET / STRIKING_DISTANCE / STALE via sitemap lastmod / INVISIBLE) and the cannibalization join, which ports unchanged. Output feeds *proposals*, never edits. |
| `internal-links.mjs` | **rework, suggest-only** | opportunities computed from the weekly crawl + indexation buckets (not-indexed pages with few inbound links); the morning agent drafts at most 3 link *proposals* in the briefing. No auto-apply: NeuroWiki links live in JSX, and V chose suggest-only. |
| `ai-traffic.mjs` | port | NeuroWiki's GA4 also has `traffic_source_type` / `ai_agent` custom dimensions to enrich later |
| `anomaly-check.mjs` | port | site-up, robots, sitemap floor 160, GSC sitemap errors, traffic/impressions collapse at the same 40% thresholds (self-gating on minimum volume, which matters at NeuroWiki's current traffic) |

**Weekly tier** (Mondays, ~4 min):

| Script | Fate | Note |
|---|---|---|
| `indexation-check.mjs` | **bucketing layer only** | NeuroWiki's `fetch-gsc-inspections.mjs` already loops URL Inspection at ~5.7 req/s (~35 s for 182 URLs) into `docs/seo-data/gsc/inspections/`; keep it, port only Tidbit's bucket/report layer on top. Step 1 verifies it inspects apex paths (today it may be inspecting www URLs against the apex property, which would return empty verdicts). Produces the bucket report the link planner and the Monday "indexed count vs last Monday" metric read. |
| `deadlinks.mjs` | **replace → `crawl-links.mjs`** | crawls live prerendered HTML of every sitemap URL: HEAD-checks every internal href (dead links), diffs sitemap vs link graph (orphan pages), ranks link opportunities. One crawler, three reports. |
| `schema-validator.mjs` | port | `config.schemaCheckUrls`; NeuroWiki JSON-LD comes from `src/seo/schema.ts` |
| `compliance-sweep.mjs` | **replace** | Tidbit's banned words are Tidbit's brand voice. NeuroWiki already hook-enforces its own (humanizer scanner, claims hook). The job's compliance piece becomes `clinical-guard.mjs`: fails loudly if the working tree touches anything outside `docs/seo/**` and `docs/seo-data/**` before commit. That is the mechanical enforcement of report-only. |
| `pagespeed.mjs` | port | `config.pagespeedUrls`; degrades to "skipped, rate limited" without `PSI_API_KEY` |
| `submit-sitemap.mjs` | port | resubmits `https://neurowiki.ai/sitemap.xml` (the registered, apex one) |

**Monthly tier** (first Monday): `monthly-rollup.mjs` (port), `keyword-research.mjs` (port), plus the browser-based AI-reputation check from the Tidbit procedure, adapted to NeuroWiki questions ("What is NeuroWiki and is it reliable?", "best NIHSS calculator online", "best stroke workflow tool for residents"). Best-effort, skips silently without Chrome.

**Utilities:** `inspect-url.mjs`, `list-sitemaps.mjs` ported; `audit-config.mjs` ported but not wired into any tier (on-demand). `oauth-setup.mjs` not ported: NeuroWiki keeps `npm run seo:auth-login`.

**Dropped outright:** `leads-check.mjs` (Tidbit-specific; also personal data, which this routine never touches on any site), `ads-terms-analyze.mjs` + Monday paid-terms browser pull + Ads "Ask Advisor" (no Ads account), the GA4/GSC Gemini-sidebar loop (needs a prompts file and adds browser surface; revisit after the routine is boring), the Monday competitor scan (no watchlist file exists; when V wants it, create `docs/COMPETITOR_WATCHLIST.md` with MDCalc / UpToDate / Medscape calculators and switch it on).

**Kept as procedure, adapted to suggest-only:** the rewrite ledger (§6), request-indexing (2 URLs/morning, 14-day cooldown, tracked in `docs/seo/indexing-requests.json`), the anomaly-first rule, the three-mornings-ignored demotion rule, the quiet-morning rule, the under-400-word briefing, the dashboard.

---

## 5. Orchestrator, cadence, manifest

`scripts/seo/daily-run.sh` ports intact: same manifest schema at `docs/seo/runs/<date>/manifest.json`, same findings-codes semantics (an exit 1 from anomaly or indexation is "ran, has findings", not a failure), same core-feed gate (search-console + analytics or no briefing), same `--weekly` / `--monthly` override flags, tiers decided by the script itself. New npm script: `"seo:daily": "bash scripts/seo/daily-run.sh"`.

---

## 6. The proposal ledger (Tidbit's rewrite ledger, suggest-only edition)

Every snippet rewording is still a measured 14-day experiment; only the actor changes.

- **Morning job:** drafts up to 3 proposals (evidence + old wording + new wording + target query, humanizer-passed, no em-dashes) into `docs/seo/proposals/<date>.md` and the briefing's to-do list.
- **V, in a supervised session:** approves; that session applies the edit under normal repo gates (Class B/C, or the Class E path if wording touches a clinical threshold), appends the ledger entry to `docs/seo/rewrite-ledger.json` with the GSC baseline, and pushes.
- **Morning job, 14+ days later:** settles the verdict from live GSC numbers (kept / recommend-revert / inconclusive). A revert is itself a proposal, never an unattended edit.
- One live experiment per page at a time; never re-propose wording V already rejected (rejections recorded in `docs/seo/proposal-rejections.json`, same pattern as Tidbit's link-rejections ledger).

---

## 7. Briefing and dashboard

Briefing format ports verbatim (One line / What I changed, where "nothing, by design" is the normal answer / What needs you / Numbers / Watching / Ran into trouble; under 400 words; C-suite voice per CLAUDE.md §10.2). Written to `docs/seo/briefings/<date>.md` + `briefing-latest.md`.

`build-dashboard.mjs` ports with NeuroWiki identity: **"NeuroWiki Growth Monitor"**, stat tiles = visitors yesterday (with the "still settling" honesty note), visitors this week, clinician actions (sum of `config.conversionEvents`), pages Google lists (of 182), proposals waiting + experiments running. The to-do list keeps the copy-a-fix-request buttons.

**Its own Artifact URL, created once at implementation step 7 and stored in `config.mjs` (`dashboardArtifactUrl`), which the procedure reads; the next site inherits the config field, not a copy-pasted URL. Publishing to Tidbit's URL (`fb267461-8757-41b3-a149-429fff5f9231`) is banned in the governance file by ID.** Distinct favicon so V's tabs are distinguishable at a glance, and the dashboard title derives from `SITE.name`.

---

## 8. Governance layer

New file **`.claude/rules/seo-daily-governance.md`** (CLAUDE.md tier), the file that says exactly what the job may do without V:

1. **Write allowlist:** `docs/seo/**` and `docs/seo-data/**`. Nothing else, ever: all of `src/`, `public/`, `scripts/`, `.claude/`, `TASKS.md`, config files are off-limits to the unattended job. Every clinical surface in `.claude/rules/clinical-surfaces.md` is therefore out of reach by construction. Enforced at **hook tier**, the only global tier per CLAUDE.md §2 (architect conditions 1-2): a new `.husky/pre-commit` check rejects any commit whose message matches the job's format if staged paths escape the allowlist. `clinical-guard.mjs` stays as the in-run early warning and diffs against a `git status --porcelain` baseline taken at run start, so work V left uncommitted overnight is distinguished from the job's own writes. The scoped `git add docs/seo docs/seo-data` (never `-A`) and this rule file are the convention layers above the hook. `--no-verify` cannot be blocked locally; the honest mitigation is that every briefing and manifest records the morning commit's SHA and exact committed paths.
2. **Never push, never deploy, never bypass a hook** (`--no-verify` banned; a pre-commit rejection is reported in the briefing and left staged). Commit format: `docs(seo): daily report <date> [report-only]` with the §16 `Co-Authored-By` trailer.
3. **Proposal rules:** max 3 snippet proposals + 3 link proposals per run; humanizer skill pass mandatory on drafted wording; em-dash (U+2014) banned, en-dash ranges allowed; title ≤60 chars, description 140-160; a proposal touching wording that states a dose, threshold, or recommendation is flagged "clinical wording: Class E path" in the proposal itself; descriptions must accurately summarize the page (the seo-analytics skill's quality bar, which overrides any SEO ambition).
4. **Standing exceptions, recorded in an ADR** (`docs/adrs/2026-09-07-seo-daily-routine.md`): the never-push exception to golden rule 8, scoped to this job's commits; the daily briefing supersedes the weekly `seo:weekly` report as the primary read. End state named (condition 9): after the three clean mornings, `seo:weekly` is renamed `seo:weekly:legacy` with a console banner pointing at the daily briefing, and `generate-weekly-report.mjs` + `audit.mjs` are retired in a follow-up commit rather than left as a third reporting pattern.
5. **Credentials:** stay at repo root, gitignored; never copied, moved, or printed; `invalid_grant`/401 means one line in the briefing telling V to run `npm run seo:auth-login`, never an unattended re-auth attempt.
6. **Silo:** the job never reads or writes the Tidbit repo, never publishes to Tidbit's dashboard URL, never touches Supabase, case data, or anything with personal data in it. NeuroWiki reports never contain Tidbit data, and vice versa.
7. **Escalation:** an anomaly ALARM leads the briefing and defers all optional work. A production-down symptom is reported for V to trigger `/incident` in a supervised session; the unattended job never reverts or hotfixes site code.
8. **Repetition demotion and the quiet morning:** a recommendation ignored three mornings running collapses to one line under Watching; "nothing needed doing" is a good morning and reads like one.
9. **External writes enumerated (condition 10):** the OAuth scope includes Search Console write access, so "report-only" must be stated for external state too. The job's permitted outbound writes are exactly two: the Monday sitemap resubmission, and up to 2 browser-based indexing requests per morning. Every other Google API call is read-only, and this allowlist sits in the governance file next to the path allowlist.
10. **Tier anchoring (conditions 12, 14):** CLAUDE.md gains an @-reference to this rule file in the same commit as the §16/§22 amendments, so it genuinely sits at CLAUDE.md tier. The ADR states the humanizer split plainly: proposals under `docs/seo/proposals/` are outside the humanizer scanner's directories, so the humanizer rule is convention tier while wording is a draft, and becomes hook tier the moment V applies it into `src/config/routeManifest.ts`. Because item 3's clinical-escalation boundary is clinical territory, `clinical-reviewer` gets a one-time read of this governance file before implementation step 6 ships it.

Small deliberate amendments to existing governance, shipped with this task: CLAUDE.md §16 scope list gains `seo`; §22 command table gains `/seo-daily`; the seo-analytics skill's "where the data lives" section points to the daily briefings.

---

## 9. Schedule

`~/.claude/scheduled-tasks/neurowiki-seo-daily/SKILL.md` (wrapper pointing at `.claude/commands/seo-daily.md`, same two-layer pattern as Tidbit), registered at **07:50 daily**, 36 minutes clear of Tidbit's 07:14 so the two jobs never contend for Google quota (separate Cloud projects anyway) or the same Chrome window.

---

## 10. Risk list, and what proves each one didn't happen

1. **The May refresh token is dead** (worst case: the Google Cloud consent app sits in "Testing" mode, where refresh tokens expire fast). *Proof:* implementation step 1 is a live GSC pull and a live GA4 pull before anything else is built. *Contingency:* V runs `npm run seo:auth-login` once (2 minutes, browser); if the app is in Testing mode, publish it to Production in the same console screen.
2. **Host mismatch quietly zeroes the data:** GSC property and Google's indexing use the apex host, but `public/sitemap.xml` lists `www.` URLs. The port pins everything to apex and the first briefing flags the sitemap host mismatch as a proposal for a supervised fix. *Proof:* step-1 pull returns rows; Monday indexation buckets are non-empty.
3. **Traffic too small to analyse:** May's 28-day window held 3 query rows. Tidbit's small-site thresholds (minimum 3 impressions to judge, collapse alarms self-gating on volume) port unchanged, and the quiet morning is the designed outcome. *Proof:* the first three briefings read sanely with no invented work.
4. **Monday runtime and quota:** URL inspection reuses the existing 175 ms-per-request loop (~35 s for 182 URLs, quota ceiling 2,000/day); the crawler HEAD-checks politely with delays. *Proof:* Monday manifest step durations.
5. **The repo's own pre-commit hook blocks the morning commit** (it runs typecheck + 10 checks even for docs-only commits, 1-3 minutes; a failure could come from unrelated repo debt). The job reports the exact failing gate in the briefing and leaves work staged. *Proof:* first commit passes; behavior on failure is specified, not improvised.
6. **Dashboard overwrite:** publishing without the `url` parameter forks the page; publishing to Tidbit's URL destroys the page V reads every morning. The NeuroWiki URL is created once, then hardcoded; Tidbit's URL is banned by ID in the governance file. *Proof:* two artifacts, two favicons, both loading on day one.
7. **Unattended scope creep, the failure mode the whole design guards against:** report-only is enforced by three independent layers (governance file, `clinical-guard.mjs` hard-fail, scoped `git add`). *Proof:* `clinical-guard` green in every manifest; any red aborts the commit and leads the briefing.

---

## 11. Implementation order (after V approves)

1. **Credentials and connectivity:** live GSC + GA4 pulls with the existing scripts; resolve risks 1-2 before writing any new file.
2. `config.mjs` + `_auth.mjs` shim.
3. Portable scripts, one at a time, each verified against live data: daily tier first, then Monday tier, then monthly.
4. Content adapter (`site-pages.ts`), then `page-refresh.mjs`, `crawl-links.mjs`, `clinical-guard.mjs`.
5. `daily-run.sh` with tier logic and manifest intact.
6. Procedure file `.claude/commands/seo-daily.md` + governance rule file (with a one-time `clinical-reviewer` read of its escalation clause) + the `.husky/pre-commit` allowlist check + ADR + CLAUDE.md amendments (§16 scope `seo`, §22 `/seo-daily` row, @-reference to the rule file).
7. Dashboard builder + first publish to a fresh NeuroWiki artifact URL; record the URL in `config.mjs`.
8. Scheduled task at 07:50 (the wrapper aborts if the procedure or governance file is missing, so a future revert fails closed) + one supervised full run. The port lands as a single revertable commit whose range the ADR records. Three consecutive clean mornings before anything else is layered on (and before any talk of a second site); at that mark, `seo:weekly` is retired per §8.4.

## 12. Acceptance checks (Definition of done)

- `bash scripts/seo/daily-run.sh` produces a manifest with `search-console` and `analytics` both `ok`.
- The morning job yields: a briefing under 400 words in plain English, a local commit touching only `docs/seo*` paths with all hooks passing, an updated dashboard at NeuroWiki's own artifact URL.
- `.claude/rules/seo-daily-governance.md` exists and names exactly what the job may change without V (nothing outside `docs/seo*`).
- `clinical-guard.mjs` proves zero writes to clinical surfaces on every run.
- Never pushed: `git log origin/main..main` shows only the job's report commits until V's next session pushes.

**Non-goals:** no site edits by the job (until V explicitly re-grades autonomy), no Ads work, no competitor scan, no Gemini loop, no rewrite of the existing `seo:weekly` scripts, no second site until three clean mornings.

**Rollback:** delete the scheduled task and revert the port commit. The job never pushed, so nothing user-facing ever changes; rollback is invisible to clinicians. The wrapper's fail-closed check (§11 step 8) covers the half of the rollback that lives outside git.

---

## 13. Architect review (2026-09-07)

Decision: **approve-with-conditions**, plan-only review, artifact at `docs/reviews/arch-PR-seo-daily-port.md`. All 14 conditions are adopted and folded into the sections above: config single-sourcing through `getSeoConfig()`, adapter consumes `routeMeta.ts`/`sitemapRoutes.ts` instead of re-deriving, URL-inspection reuse (and the www-vs-apex inspection bug to verify at step 1), hook-tier allowlist guard with a run-start baseline, external-write allowlist, dashboard URL in config, opaque `kind` classifier, `seo:weekly` retirement trigger, fail-closed scheduler wrapper, single revertable commit, CLAUDE.md @-reference for the rule file, derived-snapshot relocation, the humanizer tier note, and a one-time clinical-reviewer read of the escalation clause. No blocking issues.
