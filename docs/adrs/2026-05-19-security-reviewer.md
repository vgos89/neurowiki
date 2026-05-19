# ADR — 2026-05-19 — Add `security-engineer` reviewer agent

**Status:** Accepted
**Class:** D (governance — agent roster + skills library + CLAUDE.md updates)
**Related PR:** main/`security-agent` commit set
**Related review:** `docs/reviews/arch-PR-security-agent.md`

## Context

Between 2026-05-05 and 2026-05-19 NeuroWiki shipped a real cryptographic and transient-data surface that previously did not exist in the codebase:

- `src/lib/crypto/caseCipher.ts` — AES-256-GCM + PBKDF2 (250,000 iterations, SHA-256) for client-side encryption of saved-case bundles before they cross the Supabase transient relay.
- `src/lib/supabase.ts` — anon-keyed Supabase browser client.
- `src/lib/cases/transfer.ts` — createTransfer / fetchTransfer (one-time-read + delete-on-read) on top of the Supabase `transfers` table.
- Supabase `transfers` table with Row Level Security policies for anonymous insert / select / delete + 15-minute TTL.
- `api/transfer-cleanup.ts` — Vercel cron at `0 4 * * *` using `SUPABASE_SERVICE_ROLE_KEY`, gated by `CRON_SECRET` bearer auth.
- `src/lib/cases/store.ts` — IndexedDB persistence of saved cases (initials-only by validation).

CLAUDE.md §11's existing reviewer-tier agents do not cover this surface:

- `compliance-legal` is scoped to HIPAA/GDPR/CCPA disclosure obligations and copy (privacy policy, terms, accessibility statement). It does not review cryptographic primitives, key derivation, or RLS scope.
- `system-architect` is scoped to module boundaries, composability, and duplication. It does not review primitive selection (PBKDF2 iteration count, IV management) or secret-handling discipline.
- `quality-assurance` runs build/typecheck/QA gates. It does not perform cryptographic review.

This is exactly the failure mode CLAUDE.md §13.1 warns about for clinical content — "metadata complete, semantics unchecked" — translated into security: hook-passing and architect-approved does not mean the encryption is correct, the RLS is scoped correctly, or the cron secret is rotated.

Additionally, the Save Case + Send-to-device features that introduced this surface have **not** been flagged for Privacy Policy or Terms review. The `/privacy` page does not yet disclose IndexedDB storage of initials + case payloads, nor the Supabase transient relay or its data-flow. Two compliance gaps shipped without a watchdog. This drift is CLAUDE.md §23 ("a contract silently violated is worse than no contract") in practice.

## Decision

1. **Add `security-engineer` reviewer agent** (read-only, opus, contextual). Owns cryptographic correctness, key derivation, IV/nonce management, RLS scope, secret rotation, transient-relay design patterns, anonymous-endpoint authorization. Produces findings; can block merge on cryptographic-correctness grounds. Reviewer-first like `clinical-reviewer`, `system-architect`, `compliance-legal`.

2. **Add `crypto-and-relay-security` skill** (renamed from `crypto-and-transient-data` per architect feedback — "relay-security" more accurately names the concern). Loaded by `security-engineer` primarily; loaded by `system-architect` when crypto is in scope; loaded by `compliance-legal` when reviewing disclosure of crypto features.

3. **Extend `librarian` post-flight with privacy-drift detection.** Explicit path allow-list — not narrative charter expansion. When a commit touches `src/lib/cases/**`, `src/lib/crypto/**`, `src/lib/supabase.ts`, `api/**`, `src/utils/analytics.ts`, or adds a new `localStorage` / `IndexedDB` key, librarian appends a `[P1] Privacy Policy review — <feature>` entry to TASKS.md PENDING. Detection only; never blocks merge.

4. **Update CLAUDE.md** in the same commit: §11 (agent roster), §12 (skills library), §16 (security-engineer sign-off as Class-D/D-clinical artifact when applicable), §19.0 (trigger map).

## Negative space — what this is NOT

Per architect condition, capture explicitly:

- **NOT a fold into `compliance-legal`.** Compliance-legal owns disclosure obligations (privacy policy text, ToS text, HIPAA/GDPR data-flow documentation). It does not — and should not be asked to — review whether PBKDF2 at 250k iterations is sufficient against current GPU attack costs, whether AES-GCM IV uniqueness is preserved across re-encrypts, or whether an RLS policy with `USING (true)` on a transient table is the right scope. Those are cryptographic-correctness questions, not disclosure questions. Folding them together dilutes both reviewer roles.

- **NOT a fold into `system-architect`.** Architect owns module boundaries and composability — "does this fit the existing structure, or are we building the third different way to do the same thing." It does not own primitive selection. Asking architect to also verify "is this the right cryptographic primitive" would be the same category mistake as asking architect to verify "is this clinical claim correct" — wrong reviewer for the question. Architect can flag *that* a primitive is being chosen and request security review; it should not *be* the security review.

- **NOT a fold into `quality-assurance`.** QA runs gates (tsc, build, claims, routes, mobile, desktop). Cryptographic review is not a gate that can run mechanically. It requires reasoned analysis of threat model, primitive choice, and operational discipline.

## Decision-hierarchy position (§4)

Security-engineer findings sit at:

- **Rank 1 — Clinical safety** when the issue is patient-impacting. Example: a transfer-relay compromise that allows a stranger to decrypt another clinician's saved-case bundle. A stranger reading "JD, NIHSS 14, LKW 06:42, BP 162/94, on warfarin" is a PHI-equivalent disclosure with potential harm; promote to clinical-safety tier.
- **Rank 3 — Architectural consistency** otherwise. Example: cron secret rotation cadence, RLS policy scope for non-PHI surfaces.

Routing rule for tri-overlap surfaces (`src/lib/supabase.ts`, `src/lib/cases/transfer.ts`, `src/lib/crypto/`, `api/`, RLS SQL):

> Run `security-engineer`, `system-architect`, and `compliance-legal` in parallel. Security-engineer owns cryptographic + RLS + secret-handling correctness; system-architect owns module boundaries and composability; compliance-legal owns disclosure obligations. Conflicts escalate per §4 — security-correctness findings that imply patient impact promote to clinical-safety tier and route to `clinical-reviewer` for ratification.

## Model and tools

- **Tools:** `Read, Grep, Glob` (read-only). Matches `clinical-reviewer`, `system-architect`, `compliance-legal` pattern. Hotfixes route to specialists per §17.
- **Model:** `opus`. Matches `clinical-reviewer` and `system-architect`. Activation rate is low (a few commits/month touch this surface); failure mode (subtle crypto error, RLS bypass, secret leak) rewards stronger reasoning. **Do not silently downgrade in cost reviews** — the rationale is the failure cost, not the activation rate.

## Trigger surface (full enumeration)

Activate `security-engineer` on a change touching ANY of:

- `src/lib/crypto/**`
- `src/lib/supabase.ts`
- `src/lib/cases/transfer.ts`
- `src/lib/cases/store.ts` (IndexedDB schema migrations affect TTL + plaintext exposure)
- `api/**`
- Any RLS SQL file (add / alter / drop policy)
- `vercel.json` cron schedule, header/CSP, or route rewrites
- `src/utils/analytics.ts` and any new analytics SDK init
- `.env.example` additions or any Vercel env-config change
- Service-worker registration or update logic (controls client-side cache)

Incident routing: `quality-assurance` remains primary on deploy/incident. Fan out to `security-engineer` **only** when the incident symptom touches the surfaces above. Do not auto-fan-out on every incident — dilutes signal.

## Rollback plan

The agent is read-only and the skill is documentation. Revert is a single commit deleting:

- `.claude/agents/security-engineer.md`
- `.claude/skills/crypto-and-relay-security/SKILL.md`
- `docs/adrs/2026-05-19-security-reviewer.md`
- `docs/reviews/arch-PR-security-agent.md`
- The §11 + §12 + §16 + §19.0 rows added to CLAUDE.md
- The privacy-drift subsection added to `.claude/agents/librarian.md`

No code-path change. No data migration. No user-visible behavior change.

## Consequences

**Positive**
- Crypto / RLS / cron / secret surface has a named owner. Future commits to these paths route through review by default rather than slipping past.
- Privacy Policy drift gets flagged mechanically at commit time, not discovered weeks later by external audit.
- The pattern (read-only reviewer + dedicated skill + trigger-map row) is the same as `clinical-reviewer` / `seo-specialist`, so it is learnable by future contributors without new conventions.

**Negative / costs**
- One additional agent for the orchestrator to remember to invoke when touching the listed paths. Mitigated by the §19.0 trigger map row.
- Opus model on activation means slightly higher cost per security-touching commit. Mitigated by the genuinely low activation rate (estimated <5 commits/month).
- The librarian's charter widens slightly (privacy-drift detection on top of doc coherence). Mitigated by enumerating the trigger paths explicitly rather than expanding charter prose.

## Out of scope for this ADR

- Authoring the Privacy Policy update for the Save Case + Send-to-device features — that becomes a `[P1] Privacy Policy update` TASKS.md entry that the librarian will emit on first post-flight after this commit lands.
- Reviewing the existing crypto stack against the new agent's standards — that becomes a separate `[P1] Initial security audit — case transfer stack` TASKS.md entry, executed in its own session with `security-engineer` invoked.
- Rotating `CRON_SECRET` or `SUPABASE_SERVICE_ROLE_KEY` — operational follow-up, owned by V outside this commit.
