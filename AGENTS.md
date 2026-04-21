# AGENTS.md — NeuroWiki

This project uses a multi-agent governance system. If you are an AI
coding agent (Codex, Claude Code, or otherwise), read this file
before doing any work.

## What this project is

NeuroWiki is a clinical decision-support web application for
neurologists and residents. Stack: Vite + React 18 + TypeScript +
React Router 7 + Tailwind + shadcn/ui, deployed on Vercel.

**This is production medical content used by clinicians.** Clinical
accuracy is not optional. Visual polish is important. Mistakes that
ship can affect real patient decisions.

## Governance — the short version

1. **Read CLAUDE.md before doing substantive work.** That document
   is the canonical governance. AGENTS.md (this file) is a pointer;
   CLAUDE.md is the contract.

2. **Every task is classified A through E.** Classes escalate the
   review requirements:
   - A: single-question / trivial
   - B: low-risk edit with explicit scope
   - C: code change with tests
   - D: structural change, schema migration, new dependencies
   - E: clinical content change

   Class D requires architect review. Class E additionally requires
   clinical-reviewer gate (pre- and post-execution). Appending
   `-clinical` to any class elevates the clinical-content gate.

3. **Never fabricate clinical information.** If a clinical claim
   needs a source, fetch the source. If the source is behind a
   paywall, ask the user (V) — do not invent quoted text. Sources
   fall into two tiers: open-access (fetch silently) and paywalled
   (ask V). See `.claude/agents/medical-scientist.md` for the full
   workflow.

4. **Read before you write.** Any file you plan to modify must be
   read in full first — not summarized, not inferred. Section-list
   summaries are not sufficient. This rule is non-negotiable.

5. **Bilingual reports on substantive changes.** Report what changed
   technically *and* in plain English — V is non-technical.

6. **Do not commit broken state.** Pre-commit hooks enforce
   `check:claims` and `check:routes`. If either fails, fix the
   cause, do not bypass with `--no-verify`.

## The agent roster

The project has 17 agent briefs in `.claude/agents/`. Each describes
a specialist role. For Codex usage, the most important ones to
understand are:

- **medical-scientist** — clinical content author. Extracts
  verbatim text from guidelines, trials, and primary literature.
  Never paraphrases. Never ships without source verification. See
  `.claude/agents/medical-scientist.md`.

- **clinical-reviewer** — clinical safety gate. Reviews every
  Class E and `-clinical` change against 5 never-drift categories:
  recommendation strength, action verbs, qualifiers and gates,
  certainty markers, temporal constraints. See
  `.claude/agents/clinical-reviewer.md`. This gate is **binding**.

- **system-architect** — structural/technical review gate for
  Class D work. Evaluates duplication risk, boundary integrity,
  composability, state locality, dependency weight, migration
  exit.

- **ui-architect / calculator-engineer / design-guardian** —
  UI/structural work specialists. Calculators conform to
  `docs/specs/CALCULATOR_SPEC.md` v1.1 (Archetype 1).

- **qa-engineer** — verification, build and typecheck gates, preview
  smoke testing.

Full roster with role responsibilities is in CLAUDE.md §11 / §12.

## The review artifact pattern

When a task requires architect or clinical review, produce a
Markdown review artifact in `docs/reviews/`:

- `arch-PR-<slug>.md` — architect review (§17.1 template)
- `clinical-PR-<slug>.md` — clinical review (§17.2 template)

Each artifact records decision (approve / approve-with-conditions /
block), rubric scores, rationale, required follow-ups, and
blocking issues. These artifacts are part of the permanent record
and ship with the PR.

ADRs live in `docs/adrs/` using `ADR-<number>-<slug>.md` format.

## The citation system

All clinical claims in the app are tracked via a registry in
`src/lib/citations/`:

- `schema.ts` — TypeScript types for citations and claims
- `registry.ts` — citation records with verbatim `quoted_text` and
  `last_reviewed` dates
- `claims.ts` — `CLAIM_REGISTRY` mapping claim IDs to citation IDs
- `claim.ts` — `claim(text, claimId)` helper for wrapping clinical
  prose at the rendering layer

The scanner `scripts/check-claims.ts` runs on every commit via the
pre-commit hook. It verifies:
1. Every claim tag resolves to a registered claim ID
2. Declared surfaces match actual tag locations (bidirectional)
3. Every citation's `last_reviewed` is within its
   `review_window_months` window

A commit with an unregistered claim ID or stale citation will be
blocked. Populating the registry is ongoing work — see TASKS.md
for W5.2+ status.

## The task tracking pattern

- **TASKS.md** — active work, blockers, parking lot, confirmed-
  clean commit log. Update before committing. Mark status as
  planned / in_progress / blocked / done.
- **PRD.md** — product requirements. Currently a stub.
- **Checkpoint commits** — when a multi-session task is paused,
  commit a TASKS.md checkpoint documenting open decisions and
  state. See existing `eb29cf1`, `dffce50` as patterns.

## Build, test, and verify

Before any commit:
- `npm run typecheck` (tsc --noEmit)
- `npm run check:claims` (citation scanner)
- `npm run check:routes` (route manifest validator)
- `npm run build` (production build)

The pre-commit hook runs check:claims + check:routes automatically
with `set -e`. Do not bypass.

## What NOT to do

- Do not fabricate quoted_text, last_reviewed dates, or citation
  fields. Ever.
- Do not modify clinical prose in data modules without
  clinical-reviewer pre-execution approval.
- Do not commit with the pre-commit hook disabled.
- Do not treat a paywalled source as "accessible" because the
  abstract is visible — abstracts are insufficient unless they
  contain the complete asserted text (see Hemphill 2001 counter-
  example in medical-scientist brief).
- Do not route a decision to the agent that authored the content
  being reviewed — the author/reviewer separation between
  medical-scientist and clinical-reviewer is intentional.
- Do not dismiss a pre-commit hook failure as a test issue. The
  hook catches real content drift.

## When you are unsure

Stop and ask V. This project prioritizes correctness over velocity.
If a clinical, architectural, or safety question is genuinely
unclear, ask. The governance exists to make wrong answers
expensive to commit — respect it.

---

**For full context**, the canonical governance is `CLAUDE.md` in
the project root. This AGENTS.md is a summary; CLAUDE.md is the
source of truth.
