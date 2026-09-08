---
description: The automated morning SEO run. Pulls all live data, writes the briefing and dashboard, drafts up to 3 snippet proposals, commits reports locally. Report-only, never pushes.
---

# Daily SEO Run — NeuroWiki

This is the unattended morning job for neurowiki.ai, ported from the Tidbit
pipeline (SEO-DAILY-PORT, 2026-09-07). It is written to be run by a scheduled
session with nobody watching, so it must never stall waiting for an answer.
When a decision needs V, the job records it in the briefing and moves on.

**Authority order:** `.claude/rules/seo-daily-governance.md` (the job's
contract) overrides this file; this file overrides habit. The one-sentence
contract: the job reads everything, writes only reports under `docs/seo*`,
suggests edits, and publishes nothing.

V is non-technical (CLAUDE.md §10.2). Every line V reads must be plain
English with the business consequence stated. No raw logs, no jargon.

## Step 1 — Pull the data

Run exactly one command:

```bash
bash scripts/seo/daily-run.sh
```

It loads `.env.local` itself when present, picks its own tier (daily every
day ~1 min; Monday extras ~4 min; first-Monday extras on top), and writes a
manifest to `docs/seo/runs/<date>/manifest.json`.

Read the manifest first. Each step is `ok`, `findings`, or `failed`.

- `findings` is normal and healthy: the script ran and has something to report.
- `failed` on `search-console` or `analytics` means there is not enough data
  to brief on. Write the briefing anyway, lead with the failure, skip the
  analysis sections.
- `failed` on `report-only-check` is the one red line: the run somehow
  changed a file outside `docs/seo*`. Do NOT commit anything. Lead the
  briefing with it and leave the working tree exactly as it is for V.
- `failed` on anything else: note it under "Ran into trouble" and carry on.

If a failure log mentions `invalid_grant`, `401`, or `unauthorized`: the
Google sign-in expired. One sentence in the briefing: V runs
`npm run seo:auth-login` (2-minute browser sign-in). Never attempt it
yourself; it needs V's Google login. If this recurs within ~10 days, add:
the Google Cloud consent screen should be published to Production.

## Step 2 — Read the alarm first

`docs/seo/anomaly-latest.md` outranks everything. Any ALARM line: lead the
briefing with it, skip optional work (proposals, indexing requests), state
plainly what V must do. Quiet = one line in the briefing: "No alarms."

## Step 3 — Settle experiments before proposing new ones

Open `docs/seo/rewrite-ledger.json`. For entries 14+ days old with
`"verdict": "pending"`, compare current 28-day GSC numbers for that page
(they are in `docs/seo/page-refresh/<today>.json`) against the entry's
baseline:

- CTR clearly up, or clicks appeared where there were none → set `"kept"`,
  note the numbers, mention the win in the briefing.
- CTR clearly down, or position dropped more than 3 spots → set
  `"recommend-revert"` and write a revert proposal (old wording restored)
  into today's proposals file. The job never reverts site code itself.
- Under ~10 impressions in both windows → `"inconclusive"`, wording stays.

Never propose a rewrite for a page that has a pending ledger entry.

## Step 4 — Draft proposals (the job's only "work product" beyond reports)

Read `docs/seo/page-refresh-latest.md`. From the top of the priority queue,
draft up to **3 snippet proposals** into `docs/seo/proposals/<date>.md`:

Open the file with the governance §3 standing header line, verbatim. For
each proposal: the page path, what the clinician sees today (current title +
description from the report), the proposed wording, the query it targets,
the evidence line (impressions, clicks, position), and the full list of
files and fields that hold the current wording (search for the exact
string; titles and descriptions are duplicated across the route manifest,
the route-meta module, and the structured-data module, and a clinical
proposal is applied to all copies or none). Rules, all mandatory
(governance §3): humanizer pass on drafted wording; no em-dash; title ≤60
chars; description 140-160; description must honestly summarize the page;
the clinical-wording label is the DEFAULT — it stays on unless the page is
on the governance safe list AND no §3 clinical category appears in the
current or proposed text. **No new clinical assertion:** proposed wording
may only re-arrange clinical content already published on the page it
targets; the job never introduces a clinical fact, number, trial name,
grade or indication that is not already on that page, and never answers a
clinical question from a search query — uncertain means no proposal. If
the character budget cannot be met without dropping a population, hedge,
time window, grade, trial-result word or eligibility qualifier, make no
proposal and say "cannot shorten without changing clinical meaning".
Check `docs/seo/proposal-rejections.json` and never re-offer declined
wording.

Mondays, also read `docs/seo/internal-links-latest.md` and add up to 3 link
suggestions (which under-linked page, which related page could mention it,
why a clinician would follow that link).

Skipping proposals is correct when: candidates have pending experiments,
alarms fired, or the data is too thin to argue from. Say so in one line.
"Nothing today" beats a weak proposal.

## Step 5 — Request indexing (best effort, Chrome only)

If Chrome tools are available AND signed into V's Google account: up to
**2 URLs per morning** from the newest indexation report's "Discovered, not
indexed" bucket, preferring pages a clinician would search for (calculators,
pathways, question pages). Track in `docs/seo/indexing-requests.json`
({url, date, status}); 14-day cooldown per URL; stop for the day on any
quota message. Without Chrome: skip silently and list the 2 URLs under
"What needs you" as one line each.

## Step 6 — Commit locally. NEVER push.

```bash
node scripts/seo/clinical-guard.mjs --check
git add docs/seo docs/seo-data
git commit -m "docs(seo): daily report <date> [report-only]

- reports, briefing, dashboard for <date>
- <n> proposals drafted (or: no proposals today)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

Never push, never deploy, never open a PR (standing exception to golden
rule 8, scoped to this commit format; V's next session pushes). If any hook
rejects the commit: do not retry, do not bypass; report the failing gate's
name in the briefing and leave the files staged. Record the commit SHA and
its file list in the briefing footer.

## Step 7 — Write the briefing

Write to `docs/seo/briefings/<date>.md` and copy to
`docs/seo/briefing-latest.md`. Structure:

```
# SEO briefing, <date>

**One line:** <up, flat, or down, and the single reason why>

## What I changed
<"Nothing on the site, by design" is the standard answer. List reports
 refreshed + proposals drafted. Each proposal: one line.>

## What needs you
<Numbered. Only things V must do by hand: approve a proposal, run the
 2-minute Google sign-in, look at an alarm. If nothing: "Nothing today.">

## Numbers
<Yesterday vs the 7-day average. Three numbers maximum. Skip any number too
 small to mean anything.>

## Watching
<Trending the wrong way but not yet actionable. Demoted repeat items live
 here as one line each.>

## Ran into trouble
<Failed steps in plain English. Omit the section when the run is clean.>
```

Under 400 words. Plain English per CLAUDE.md §10.2: no file paths, no tool
names, no jargon. Alarms first. Mondays: indexed count vs last Monday
(first Monday baseline gets set by the first weekly run). Footer line:
commit SHA + file count.

## Step 8 — Rebuild and republish V's dashboard

```bash
node scripts/seo/build-dashboard.mjs
```

Then republish `docs/seo/dashboard.html` with the Artifact tool to the SAME
URL every time: the `dashboardArtifactUrl` in `scripts/seo/config.mjs`.
Never publish without the `url` parameter (it would fork the page and break
V's bookmark); never publish to any other artifact URL (governance §7).
Include the regenerated dashboard.html in the commit (amend or commit before
Step 6's commit; order the steps so the commit includes it). If the Artifact
tool is unavailable in the session, say so in the chat summary; the page
shows yesterday until the next successful publish.

## Step 9 — Tell V

End with a 3-5 line chat summary in plain English: what the morning looks
like, what needs V (if anything), and that the dashboard is updated at its
usual address. A quiet morning is a good outcome and should read like one.

## Standing rules (governance file is authoritative)

- Report-only: no file outside `docs/seo/**` and `docs/seo-data/**`, ever.
- Never push; never deploy; never bypass a hook.
- 3 snippet proposals + 3 link suggestions per run, maximum.
- One experiment per page at a time; the job settles, V applies and reverts.
- Recommendations ignored three mornings collapse to one Watching line.
- Never invent a statistic, a citation, or a clinical claim. Prefer doing
  nothing over doing something you would need to explain away.
