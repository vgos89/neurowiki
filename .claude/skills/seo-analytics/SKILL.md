---
name: seo-analytics
description: How to read NeuroWiki's GA4 + Google Search Console weekly reports, what patterns to act on vs ignore, decision thresholds, and the action-list template. Load whenever reading docs/seo-data/weekly/*.md, running npm run seo:weekly, investigating a page's performance, or proposing SEO actions from data.
---

# SEO Analytics — reading the data and acting on it

**Related skills:**
- `.claude/skills/seo-audit-execution/SKILL.md` — site-side SEO (structured data, metadata, keyword research, audits)
- `.claude/skills/routing/SKILL.md` — when SEO action requires a new route or manifest change
- `.claude/skills/compliance-public-medical/SKILL.md` — disclaimers + medical-claim accuracy bar that overrides any SEO consideration

Base directory: `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/.claude/skills/seo-analytics`

---

## When to load

- Reading any `docs/seo-data/weekly/*-report.md`
- Running `npm run seo:weekly`, `seo:fetch-ga4`, or `seo:fetch-gsc`
- Investigating "why isn't [page] ranking" or "what queries are people using"
- Proposing SEO improvements based on data (not based on intuition)
- Setting up GA4 events or adjusting event schema
- Triaging a sudden traffic drop or impression surge

Do NOT load this skill for:
- Static SEO audits with no data input — load `seo-audit-execution` instead
- Clinical-content decisions — those override SEO every time (§4 hierarchy)

---

## Where the data lives

```
docs/seo-data/
├── ga4/
│   └── YYYY-MM-DD.json        # raw GA4 snapshot (28d default window)
├── gsc/
│   └── YYYY-MM-DD.json        # raw Search Console snapshot (28d default)
└── weekly/
    └── YYYY-MM-DD-report.md   # synthesized markdown report (read this first)
```

The weekly markdown report is the primary read. Raw JSON is for drill-down or programmatic re-analysis.

GA4 snapshot fields: `topPages`, `sessionsBySource`, `events`, `dateRange`, `propertyId`.
GSC snapshot fields: `topQueries`, `topPages`, `sitemaps`, `siteUrl`, `dateRange`.

---

## The 6-step weekly read pattern

Do these in order. Each takes 2-5 minutes.

### 1. Traffic delta vs last week

Compare `topPages` total views and `sessionsBySource` sum against last week's report (`docs/seo-data/weekly/{prev}.md`). 

- **Up >20% WoW** — call out, attribute (which page or source drove it)
- **Down >20% WoW** — investigate (deploy regression? guideline update making us stale? competitor ranked?)
- **±20%** — noise, move on

### 2. Page-title sanity check

Scan the GA4 `topPages` table. **Any page appearing twice with different titles is a title-capture bug.** Should not happen post-2026-05-18 fix (commit 0f36624) — if you see it, the fix regressed.

### 3. GSC: top queries by clicks

For each top-10 query, ask:
- Is the landing page correct? (cross-reference `topPages` in GSC half)
- Is the title/description in `src/config/routeManifest.ts` matching the query intent?
- Are we ranking high enough to capture clicks? (CTR thresholds below)

### 4. GSC: opportunity queries (high impressions, low CTR)

This is the highest-leverage section. Filter `topQueries` for:
- `impressions >= 100` AND `ctr < 0.02` (2%)
- These are queries Google IS surfacing us for but clinicians aren't clicking

Action options per query:
1. **Rewrite title/description** in `routeManifest.ts` to better match query intent
2. **Improve content** if the page exists but doesn't answer the query well
3. **Create a dedicated page** if no current page targets this query
4. **Do nothing** if the query is wrong-audience (e.g., we surface for a lay-public query — don't chase it)

### 5. GA4: event funnel health

Cross-reference custom events. Expected ratios in a healthy week (calibrate after 4+ weeks of data):
- `calculator_used / page_view of /calculators/*` → engagement rate (target: >25%)
- `calculator_copied / calculator_used` → completion-to-export rate (target: >40%)
- `pathway_step_advanced (to 4) / pathway_step_advanced (to 2)` → workflow completion (target: >30%)
- `deep_learning_opened / page_view of guide pages` → study-mode engagement (signal of intent)
- `external_citation_clicked` → evidence-trust signal (any non-zero is good)
- `feedback_submitted` → very low frequency expected (1-5/week typical)
- `disclaimer_acknowledged` ≈ `first_visit` (sanity check — every new visitor should ack)

### 6. Source/medium drift

In `sessionsBySource`:
- `google / organic` — primary acquisition; track WoW
- `(direct) / (none)` — bookmarks, app, typed URL — track WoW
- `bing / organic` — secondary, smaller volume normal
- Anything else with >5 sessions — worth a glance. Bot referrals (cn.bing.com, wotbox.com, echonimo.com) are noise — ignore.

---

## Decision thresholds — when data triggers action

| Signal | Threshold | Action |
|---|---|---|
| CTR <2% with >100 impressions | Single query | Rewrite title/description in routeManifest |
| Page drops from position <5 → position >15 | 2 consecutive weeks | Investigate: recent content change? competitor? |
| New query with >50 impressions, no dedicated page | Any single occurrence | Content opportunity — propose new page (Class C-clinical) |
| Top page traffic drops >50% WoW | Single week | Check for deploy regression, guideline supersession |
| `calculator_used` zero for 7 days on a calc that previously had usage | 7d | Check that calculator is reachable + scoring still works |
| `disclaimer_acknowledged` >> `first_visit` | Persistent ratio | Disclaimer logic regression — fires multiple times per visitor |
| Sitemap last-submitted >30 days | Any | Re-submit via `seo:fetch-gsc` (the GSC client supports it) |
| Page in top-20 GA4 views but NOT in GSC topPages | Any | Indexability problem — investigate noindex / canonical issues |

---

## The quality bar — what we will NEVER do

Hard rules. No exceptions. Stronger than SEO ambition.

1. **No thin landing pages to chase keywords.** Every NeuroWiki page must serve clinician decision-making. "Stroke" alone is not a page; "Stroke Code Workflow for the ED" is.
2. **No keyword stuffing.** Titles and descriptions stay scannable and accurate. If the natural keyword fits, use it. If not, don't twist the copy.
3. **No clinical accuracy sacrificed for SEO.** Citation freshness (§13.6/13.7) overrides any "this title would rank better." If a thresholds claim is current, do not soften it to match a stale-but-popular query.
4. **No targeting lay-audience queries we can't responsibly answer.** "What is a stroke" → not our audience. Cede it. We serve clinicians.
5. **No metadata changes without clinical-reviewer if the page is `-clinical` and the description references a recommendation or threshold.** Title rewrites that change clinical meaning are Class E.
6. **No misleading meta-descriptions.** Description must accurately summarize what the page actually says — if a clinician clicks expecting X and finds Y, that's worse than a missed click.

---

## The weekly action-list template

Every analysis session ends with an actionable list. Use this format. Number items, rank by leverage (highest first).

```markdown
# SEO action list — week of YYYY-MM-DD

## Do this week (highest leverage)
1. [Class C] Rewrite title for /trials/extend-trial — current "EXTEND — Acute Reperfusion..."
   gets 320 impressions/15 clicks (CTR 4.7%, position 6.3). Query "extend trial stroke"
   ranks us position 4.1 with CTR 1.8% — title doesn't match query intent. Propose:
   "EXTEND Trial — Extended-Window IV tPA Up to 9 Hours · NeuroWiki"
2. ...

## Defer (worth doing, not urgent)
3. ...

## Ignore (data anomaly or off-strategy)
4. ...

## Investigate (need more data)
5. [Triage] /calculators/nihss dropped from position 8 → 14. Could be a competitor
   ranking; need to check next week's report before acting.
```

---

## Common pitfalls (learned the hard way)

- **GSC data has a 2-day delay.** Don't compare today's GSC numbers to last week's — compare matched windows.
- **GSC search analytics for newly-verified properties starts collecting AT verification.** First 7-14 days will have sparse data. Don't over-interpret early reports.
- **GA4 events take ~24h to appear in standard reports.** Use DebugView for real-time verification of new event firing. Don't conclude an event "isn't working" from same-day data.
- **Bot referrals are noise, not signal.** wotbox.com, cn.bing.com, echonimo.com — ignore in source/medium analysis.
- **A single page can appear in `topPages` under multiple titles if title-capture bug regressed.** That's a code bug to file, not a content issue.
- **`page_view` vs `engaged_session` count differently.** A clinician who bounces back fires page_view; an engaged one fires user_engagement too. Use `user_engagement / page_view` as a rough engagement rate.

---

## What the SEO manager owns (cross-reference with seo-audit-execution skill)

Pre-publish (always has owned):
- Route metadata (title, description) per `src/config/routeManifest.ts`
- JSON-LD structured data per `src/seo/schema.ts`
- Sitemap inclusion
- Indexability (`noindex` flags, robots.txt, meta robots)

Post-publish (new responsibility as of 2026-05-18):
- Weekly report read-through per the 6-step pattern above
- Producing the action-list using the template above
- Proposing single-PR actions for "do this week" items, batched as Class C
- Escalating "investigate" items to V if they involve clinical-content questions

---

## Required outputs every time this skill runs

When invoked during a weekly analysis or a "why isn't X ranking" question, the SEO manager must produce, in this order:

1. **One paragraph plain-English summary** for V — what got better, what got worse, what V needs to decide. Passes the C-suite test (CLAUDE.md §10.2).
2. **The action list** using the template above.
3. **Any class-flag escalations** — if any proposed action is Class C-clinical or higher, flag it explicitly so it goes through clinical-reviewer.

The technical detail (raw numbers, query-level breakdowns, citation IDs) belongs in the action-list entries' rationale, not in the plain-English summary.
