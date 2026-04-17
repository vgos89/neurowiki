# Founder Audit — NeuroWiki Repo vs CLAUDE.md (v3.1)

> Hand this to Claude Code in the NeuroWiki repo. Claude Code walks the repo, checks each item against reality, and reports back with a concrete gap list + prioritized build order.
>
> **How to use:** in NeuroWiki repo, run:
>
> ```
> I want you to audit this repo against the CLAUDE.md contract.
> Read /audit/audit-checklist.md and go through every item.
> For each item: mark ✅ PASS, ⚠️ PARTIAL, or ❌ MISSING.
> Give evidence (file paths, line numbers, or "not found").
> Do NOT build anything. Just audit. Report at the end.
> ```
>
> Claude Code produces the audit. V reviews. Then V picks the build order.

---

## How to read each item

- **Item:** what is being audited
- **Spec reference:** which CLAUDE.md section defines it
- **How to verify:** the concrete check
- **Build cost if missing:** rough size of the gap — (S) minutes, (M) hours, (L) day+

---

## Tier 1 — Foundation files (nothing else works without these)

### 1.1 `CLAUDE.md` exists at repo root
- Spec: (meta)
- Verify: `ls CLAUDE.md`
- Build cost: n/a — you are handing it the file

### 1.2 `tasks.md` exists at repo root
- Spec: §7, §15, §19
- Verify: `ls tasks.md`. Content should have sections: Open Tasks, Parking Lot, Stale Content, Post-Mortems
- Build cost: S

### 1.3 `PRD.md` exists at repo root
- Spec: §3, §19
- Verify: `ls PRD.md`. Content should describe product intent, decisions, user model
- Build cost: M (real one; V needs to draft — Claude Code can scaffold)

### 1.4 `docs/adrs/` directory exists
- Spec: §3, §6 (Class D artifacts), §16
- Verify: `ls docs/adrs/`
- Build cost: S (create empty dir + ADR template)

### 1.5 `docs/reviews/` directory exists
- Spec: §17
- Verify: `ls docs/reviews/`
- Build cost: S

### 1.6 `.claude/` scaffold exists
- Spec: §11, §12, §22
- Verify: `ls .claude/agents/`, `ls .claude/skills/`, `ls .claude/commands/`, `ls .claude/hooks/`
- Build cost: S (just the directories)

---

## Tier 2 — Agent roster (§11)

For each of the 8 core agents, verify the file exists with correct frontmatter.

### 2.1 `.claude/agents/system-architect.md`
- Verify: exists; frontmatter has `name`, `description`, `tools: Read, Grep, Glob` (read-only), `model: opus`
- Build cost: S per agent

### 2.2 `.claude/agents/ui-architect.md`
- Verify: exists; tools include `Read, Write, Edit, Glob, Grep`

### 2.3 `.claude/agents/medical-scientist.md`
- Verify: exists; tools include `Read, Write, Edit, WebFetch, WebSearch`

### 2.4 `.claude/agents/calculator-engineer.md`
- Verify: exists; tools include `Read, Write, Edit, Bash`

### 2.5 `.claude/agents/data-architect.md`
- Verify: exists; tools include `Read, Write, Edit, Bash`; brief mentions ownership of claim-surface handlers (§13.3)

### 2.6 `.claude/agents/content-writer.md`
- Verify: exists; tools include `Read, Write, Edit`

### 2.7 `.claude/agents/qa-engineer.md`
- Verify: exists; tools include `Read, Write, Edit, Bash`

### 2.8 `.claude/agents/clinical-reviewer.md`
- Verify: exists; tools are read-only; brief defines the **semantic review standard** (exact match / fair paraphrase / acceptable synthesis / block-on-conflict)
- Build cost: M (this one is non-trivial — it encodes the actual clinical review rubric)

---

## Tier 3 — Skills library (§12)

For each skill, verify file exists in `.claude/skills/` with clear scope.

### 3.1 `seo-optimization` · 3.2 `accessibility` · 3.3 `compliance-legal` · 3.4 `performance` · 3.5 `error-handling` · 3.6 `api-integration` · 3.7 `analytics-insights` · 3.8 `onboarding-docs`
- Verify: each exists as `.claude/skills/<name>.md`
- `internationalization` — dormant; may be absent (spec says so)
- Build cost: S-M each (V has existing content in legacy `agents/*.md` files — can be migrated)

---

## Tier 4 — Slash commands (§22)

For each command, verify the markdown exists in `.claude/commands/` and implements both happy path and failure behavior.

### 4.1 `/status` · 4.2 `/focus` · 4.3 `/park` · 4.4 `/classify` · 4.5 `/plan-feature` · 4.6 `/audit-citations` · 4.7 `/pr-ready` · 4.8 `/rollback`
- Verify: each as `.claude/commands/<name>.md`
- Build cost: S-M each

---

## Tier 5 — Citation infrastructure (§13)

**This is the hardest tier. Most of the clinical-safety enforcement lives here.**

### 5.1 `src/lib/citations/schema.ts` exists with `Citation` type
- Spec: §13.2
- Verify: file exists, type matches spec (id, source, title, year, section, url, pmid, last_reviewed, review_window_months, quoted_text)
- Build cost: S

### 5.2 `src/lib/citations/registry.ts` exists with Citation[] data
- Verify: file exists, exports registered citations, types align with 5.1
- Build cost: M (real content — V has citations already in code; they need migration)

### 5.3 `src/lib/citations/claims.ts` exists with `CLAIM_REGISTRY` map
- Verify: file exists, exports `CLAIM_REGISTRY: Record<string, string[]>`
- Build cost: M (content migration)

### 5.4 `src/lib/citations/claim.ts` helper exists
- Spec: §13.4 (computed string tagging)
- Verify: exports `claim(text: string, claimId: string)` function
- Build cost: S

### 5.5 `scripts/check-claims.ts` pre-commit script exists
- Spec: §13.5
- Verify: file exists, scans Phase 1 surfaces (static JSX `data-claim`, structured data `claimId` fields), fails on unregistered claims, fails on missing `last_reviewed`, fails on stale-past-window
- Build cost: L (real implementation — start with Phase 1 only)

### 5.6 `.husky/pre-commit` runs the check-claims script
- Verify: `.husky/pre-commit` exists, contains `npx tsx scripts/check-claims.ts` (or equivalent)
- Build cost: S

### 5.7 Phase-1 claim surfaces audited in existing content
- Spec: §13.4 Phase 1
- Verify: sample 5 random clinical statements from `src/data/` and `src/pages/guide/`. Each should have `data-claim` (JSX) or `claimId` (data) tagging OR be queued as a `tasks.md` backfill task
- Build cost: L (content backfill — V schedules by Class E tasks)

---

## Tier 6 — Hooks and CI

### 6.1 `.husky/` installed and initialized
- Verify: `.husky/` exists, `npm run prepare` has been run; `.husky/_/husky.sh` exists
- Build cost: S

### 6.2 `.husky/pre-push` (optional, for heavier checks — §13.5)
- Spec: §13.5 hook-vs-CI split
- Verify: may be absent at Phase 1; noted as roadmap
- Build cost: S-M when added

### 6.3 CI pipeline runs build + tests on PR
- Spec: §20 (Quality gates)
- Verify: `.github/workflows/` or equivalent exists; runs `tsc --noEmit`, `npm run build`, tests
- Build cost: M if starting from scratch

---

## Tier 7 — Template files

### 7.1 `docs/adrs/post-mortem-template.md`
- Spec: §14
- Verify: file exists, includes sections: Timestamp, Symptom, Suspected cause, Timeline, Mitigation, Re-enable plan
- Build cost: S

### 7.2 `docs/adrs/adr-template.md`
- Spec: §6 (Class D), §16
- Verify: file exists, includes sections: Date, Context, Decision, Consequences, Scope
- Build cost: S

### 7.3 Review artifact templates (embedded in §17, but as standalone)
- Verify: architect and clinical-reviewer agent briefs contain the review-artifact template
- Build cost: S (covered by Tier 2 agent briefs)

---

## Tier 8 — Legacy cleanup (from Feb 2026 Cursor setup)

### 8.1 `.cursorrules` handling
- Options: delete (clean), keep dormant (fine — Claude Code ignores), or migrate content to new skills
- Build cost: S

### 8.2 `/agents/` (legacy, without `.claude/` prefix)
- Action: migrate content into `.claude/agents/` and `.claude/skills/` per new taxonomy; delete originals
- Build cost: M (content review + mapping)

---

## Audit report format

At the end of the walk, Claude Code produces a single report shaped like this:

```
# NeuroWiki Audit — <date>

## Summary
- ✅ PASS: <n>
- ⚠️ PARTIAL: <n>
- ❌ MISSING: <n>

## By tier
- Tier 1 (Foundation): <pass/partial/missing counts>
- Tier 2 (Agents): ...
- ...

## Gaps — prioritized build order

### Blocking (ship nothing else until these land)
1. <item + one-line rationale>
2. ...

### High-value next
1. <item>
...

### Roadmap (Phase 2+ of clinical scanner, etc.)
1. <item>
...

## Recommended first build session
<one concrete task V can do today to move the biggest rock>
```

---

## Success criteria

The audit is successful if V can look at the report and know:
- Exactly which parts of V3.1 are real in the repo
- Exactly which parts are missing
- Which gap to close first (and why)
- What Class E tasks need to be created for content backfill (Tier 5.7)

**The audit is not the build. The audit tells V what to build, in what order. Building happens in follow-up sessions, one gap at a time, each as a properly classified task in `tasks.md`.**
