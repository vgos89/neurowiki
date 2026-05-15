---
name: incident
description: Triage a production incident — reproduce symptom, locate cause, decide revert vs hotfix, capture post-mortem. Loads engineering:incident-response skill for the structured response flow.
argument-hint: "<one-line symptom from V or user report>"
allowed-tools: Read, Grep, Glob, Edit, WebFetch, Bash(git log:*), Bash(git show:*), Bash(git diff:*), Bash(git revert:*), Bash(git status:*), Bash(git push:*), Bash(node:*), Bash(npm run:*), Bash(npx tsc:*)
---

Skip this command for: local dev errors, type-check failures during /build, or any pre-commit failure. /incident is for **post-merge production issues** — something is broken in users' hands at https://neurowiki.ai (or the staging Vercel preview).

If the issue is reported during an active /build session before the commit ships, fix in-flight rather than spinning up an incident.

## When to use

Examples that trigger /incident:
- "Articles don't open on the live site"
- "The bottom nav is broken for users"
- "Calculator scores are returning wrong values"
- "The /trials page is blank after the deploy"
- "Mobile drawer is overlapping content on real devices"
- "Production deploy failed / Vercel build error"

Examples that do NOT trigger /incident:
- "tsc is failing locally" → fix in current session
- "I haven't pushed yet but my changes don't work" → normal /build flow
- "This calculator's interpretation is wrong" → /build a Class E task
- "A trial citation is outdated" → /build a Class E-clinical task

## Behavior

Load the `engineering:incident-response` skill. Then run this structured flow:

### Phase 1 — Triage (30-60 seconds)

State the symptom verbatim as V reported it. Classify severity:

- **SEV1 — total outage**: site returns 5xx, all routes affected, or a core safety-critical surface (calculator returning wrong score, dosing display incorrect)
- **SEV2 — partial outage**: one major surface broken (e.g., articles don't open, trials page blank); other pages OK
- **SEV3 — degraded experience**: visual glitch, mobile-only issue, slow load, but no data integrity or safety impact
- **SEV4 — minor**: cosmetic, single page, edge case

State the severity in one line. Then proceed.

### Phase 2 — Reproduce (1-2 min)

Confirm the symptom from a server-side angle before assuming it's real:

```bash
# Check HTTP status + chunk reachability for affected route
node -e "fetch('https://neurowiki.ai/<route>').then(r => console.log('Status:', r.status))"

# Verify production main bundle hash matches latest dist/
ls dist/assets/ | grep -E "^index-" | head -2

# Check last 5 commits for what could have caused it
git log --oneline -5
```

If the server-side check returns 200 + valid chunks: the bug is browser-side (cache, JS runtime, CSS, hydration). Ask V to hard-refresh on their device. If still broken, proceed to Phase 3.

If the server-side check returns non-200 or chunks 404: the bug is deploy-side (Vercel build issue, missing chunk, route misconfig). Proceed to Phase 3 with deploy hypothesis.

### Phase 3 — Locate cause (2-5 min)

Inspect the **last 5 commits** (`git log --oneline -5`) for what could have touched the failing surface. Specifically:

- If `articles don't open` → inspect commits touching `src/pages/guide/`, `src/components/article/`, `src/components/hub/ToolRowCard.tsx`, or `src/App.tsx`
- If `calculator broken` → inspect commits touching the specific calculator file or shared `src/components/calculators/`
- If `nav / layout broken` → inspect commits touching `src/components/layout/`
- If `trial page broken` → inspect commits touching `src/pages/trials/TrialPageNew.tsx` or `src/components/trials/`
- If `Vercel build failed` → check `git log` for recent commits + run `npm run build` locally; the error is reproducible

For each suspect commit, `git show <sha> --stat` to see what changed. Cross-reference against the failing symptom.

### Phase 4 — Decide: revert vs hotfix

**Revert when:**
- The suspect commit is recent (last 1-3) and isolated
- The fix isn't obvious
- SEV1 or SEV2 with clinical impact
- It's a structural change (Class D/E) that requires V re-approval to redo correctly

```bash
git revert <sha> --no-edit
# Auto-creates a revert commit. Run gates + push.
```

Per CLAUDE.md §14 rollback protocol, also:
1. Create a post-mortem task in `TASKS.md` under `## POST-MORTEMS`
2. Create `docs/YYYY_MM_DD/post-mortem-<slug>.md` (use `docs/adrs/post-mortem-template.md`)
3. Mark the original commit's task status as `reverted`
4. For Class D/E or -clinical: gate re-enable on clinical-reviewer + system-architect sign-off

**Hotfix when:**
- The cause is a 1-3 line surgical fix (typo, missed import, wrong className)
- SEV3 or SEV4
- Reverting would lose more than it gains (e.g., undo a substantial feature for a single broken state)

Treat the hotfix as a Class B edit per CLAUDE.md §6 — make the change, run gates, push directly. State explicitly: "Hotfix in lieu of revert because: [reason]."

### Phase 5 — Verify in production

After revert or hotfix is pushed:

1. Wait for Vercel deploy (~60-180s typical)
2. WebFetch the affected route(s) — confirm symptom is gone
3. If V is in the chat: ask them to hard-refresh and confirm
4. If V is dark: log the verification result in the post-mortem and continue

### Phase 6 — Post-mortem (mandatory for SEV1/SEV2)

Use `docs/adrs/post-mortem-template.md`. Write to `docs/YYYY_MM_DD/post-mortem-<slug>.md` with:

- Timestamp of first report
- Timestamp of detection (when /incident was invoked)
- Timestamp of fix landed
- Symptom (verbatim)
- Suspected cause + verified cause
- Why the existing /build gates missed it
- Action items: hardening the gate that should have caught it
- Lessons learned

Append to `TASKS.md` `## POST-MORTEMS` section with a one-line reference to the post-mortem doc.

SEV3/SEV4: post-mortem is optional but a one-paragraph note in the audit trail is recommended.

---

## Failure behavior

**No argument** — "Usage: `/incident <symptom>`. State the symptom in one line." No action.

**Cannot reproduce server-side and V is dark** — Log the attempt + result. If the user-facing report stays open, defer until V can do a screen-share or paste console output. Don't blind-revert.

**Multiple suspect commits** — State them all. Don't auto-revert. Ask V which to focus on (or, if V is dark, pick the most-recent commit touching the failing surface and revert that one only).

**Gates fail during revert** — Diagnose the revert conflict. If the revert is structurally complex (commit was a foundational change with later commits depending on it), STOP and escalate to V. Don't force.

---

## Output format

- Plain text. No emoji.
- Phase headers (Phase 1, Phase 2, etc.) so V can see the flow.
- Severity classification on its own line.
- Each phase reports a concrete artifact: a hypothesis, a commit SHA, a gate result, a WebFetch status.
- Final report includes: which commit was reverted (or which hotfix shipped), the post-mortem doc path, and the live-verify timestamp.
