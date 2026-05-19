# Architect review — PR #security-agent

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-19

## Rationale

The plan adds a missing reviewer role that maps to a real, shipped surface (`src/lib/crypto/caseCipher.ts`, `src/lib/supabase.ts`, `src/lib/cases/transfer.ts`, `api/transfer-cleanup.ts`) — there is no agent today whose charter covers PBKDF2 iteration choice, AES-GCM IV management, RLS scope correctness, or cron-secret rotation, and that gap is exactly the §13.1-style "metadata green, semantics unchecked" failure mode applied to crypto instead of citations. The shape mirrors patterns already in the repo (read-only reviewer like `clinical-reviewer` and `system-architect`; sign-off block like `seo-specialist`; post-flight detection like `librarian`), so it does not introduce a third pattern. The skill is genuinely distinct from `engineering:code-review` — different audience, different content, different load-set — so keeping it separate is correct. Three conditions before this lands: (1) clarify the routing rule where security overlaps system-architect and compliance-legal so the orchestrator does not have to invent it per-PR; (2) keep the new agent read-only — the precedent (`clinical-reviewer`, `system-architect`, `compliance-legal`) is consistent and findings-first matches how this codebase treats reviewer-tier roles; (3) put the librarian's privacy-drift detection behind an explicit, narrow rule list rather than expanding the charter prose, so the watchdog role does not balloon.

## Required follow-ups

- **Routing rule for tri-overlap cases.** Add to the §19.0 trigger map (or to the new ADR's "Decision-hierarchy position" section) a concrete fan-out rule for surfaces that touch all three reviewers. Proposed wording: "For a change touching `src/lib/supabase.ts`, `src/lib/cases/transfer.ts`, `src/lib/crypto/`, `api/`, or RLS SQL, run reviewers in parallel: `security-engineer` owns cryptographic + RLS + secret-handling correctness; `system-architect` owns module boundaries and composability; `compliance-legal` owns disclosure obligations (privacy policy, ToS, HIPAA/GDPR data-flow). Conflicts escalate per §4 — security-correctness findings that imply patient impact promote to clinical-safety tier."
- **Keep `tools: Read, Grep, Glob` (read-only).** The plan's instinct is correct — every reviewer-tier agent in this repo is read-only (clinical-reviewer, system-architect, compliance-legal). Granting Write/Edit would break that pattern and create an exception that other agents will eventually cite to justify their own write access. Hotfixes route to a specialist (build-engineer/quality-assurance) per current §17 protocol.
- **Model: opus.** Matches `clinical-reviewer` and `system-architect`; activation rate is genuinely low, and the failure mode (subtle crypto error, RLS bypass) rewards stronger reasoning. Document the rationale in the ADR so future cost reviews do not silently downgrade it.
- **Librarian privacy-drift rule must be enumerated, not narrative.** Today `librarian.md` has a tight "Owns / Does not own / File scope" structure. Add a new subsection titled "Privacy-drift detection" with an explicit path allow-list (`src/lib/cases/**`, `src/lib/crypto/**`, `src/lib/supabase.ts`, `api/**`, `src/utils/analytics.ts`, any new `localStorage`/`IndexedDB` key) and the exact TASKS.md entry template. Do not let this leak into "compliance watchdog" generally — keep it mechanical pattern detection.
- **ADR must capture the negative space.** Explicitly record why this is NOT a fold into `compliance-legal` (compliance-legal owns disclosure, not cryptographic correctness) and NOT a fold into `system-architect` (architect owns shape/composability, not primitive selection). Otherwise future contributors will collapse them.
- **Tagging precedent for security review artifact.** Add an `### @security-engineer — Sign-off` block template to `.claude/agents/security-engineer.md` and reference it from §16's class-D/D-clinical artifact column when the change touches the listed paths. Parallel to the seo-specialist sign-off pattern.
- **Route this PR to `clinical-reviewer` for the §4-rank-1 framing.** The plan asserts that a transfer-relay compromise is patient-impacting and therefore sits inside "clinical safety" in §4. That framing is correct in my view, but `clinical-reviewer` should ratify it explicitly so the precedent is recorded — not just stated in the ADR by the architect.
- **Surfaces the plan should add to the security-engineer trigger list:**
  - `src/lib/cases/store.ts` — IndexedDB schema migrations are a security surface (malformed migrations can expose stale plaintext or break TTL assumptions).
  - `vercel.json` cron schedule, header/CSP config, route rewrites — schedule changes affect TTL guarantees.
  - Any SQL migration file (RLS policy add/alter/drop), wherever those live.
  - `src/utils/analytics.ts` and any new analytics SDK init — secret handling + PHI-leak surface.
  - Env-var additions to `.env.example` or any Vercel env config — new secrets are a security event.
  - Service-worker registration or update logic — controls what gets cached client-side.
- **Incident routing:** keep `quality-assurance` as primary on deploy/incident, add fan-out to `security-engineer` *only* when the incident symptom touches the security surface list. Do not auto-fan-out on every incident.
- **Composability note on the skill:** the proposed `crypto-and-transient-data` skill is correctly separate from `engineering:code-review`. Tighten the name to `crypto-and-relay-security` — "transient-data" reads like a data-modeling skill; "relay-security" names the actual concern (anonymous-insert + one-time-read + TTL + service-role boundary).
- **State locality / governance locality.** Migrate the agent row, skill row, and trigger-map row into CLAUDE.md in a single commit alongside the agent + skill + ADR — splitting governance updates across commits is the §3 "drift" failure mode this file warns against.

## Blocking issues

None. The plan names specific files, respects existing module boundaries, introduces no parallel implementation, and contains an explicit rollback exit (the agent is read-only, so revert is a single-commit deletion of `.claude/agents/security-engineer.md`, `.claude/skills/crypto-and-relay-security/SKILL.md`, the ADR, and the CLAUDE.md rows). Six files in the planned diff exceeds the §17.1 rubric-6 threshold of five, but the rollback path is trivial and stated, which satisfies the "high-cost reverts require a rollback note" condition.
