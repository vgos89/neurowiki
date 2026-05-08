# NeuroWiki — CLAUDE.md (v3.1)

> Operating manual for this repo. Every Claude Code session reads this on startup. This file is the **contract** — changes are deliberate and committed. Task-specific notes live in `TASKS.md`. Architectural decisions live in `PRD.md` and `docs/adrs/`.

---

## 1. Product

**NeuroWiki** — evidence-based bedside clinical decision-support and learning platform for neurology residents, fellows, and attendings.

**Core surfaces:** dynamic clinical workflows (Stroke Code, EVT, seizure, headache, ICH) · medical calculators with guideline-linked interpretation (NIHSS, ASPECTS, ABCD2, HAS-BLED, GCS, ICH Score) · trial reference layer · Study Mode / Deep Learning pearls.

**Audience:** clinicians using the tool at the bedside. Speed, accuracy, and citation trail are non-negotiable.

**Stack:** Vite · React 18 + TypeScript · React Router 7 (library mode, SPA) · Tailwind + shadcn/ui · Material Icons · Vercel hosting (static build). External APIs: PubMed MCP, ClinicalTrials.gov.

**Routing:** Client-side, SPA. No file-based routing. Routes defined centrally in `src/router.tsx` (or the project's canonical route config — check there first before adding routes).

---

## 2. Enforcement taxonomy — what is actually real

Not every rule in this file has the same teeth. Before citing a rule, know where it lives.

| Layer | Where it lives | Teeth | Scope of enforcement |
|---|---|---|---|
| **Hook-enforced** | `.husky/`, `.claude/hooks/` | Hard — scripts fail, commit blocked | Repo-wide, cannot be skipped without disabling hook |
| **Frontmatter-enforced** | `.claude/agents/*.md` (`tools:`, `model:`) | Hard within invoked subagent | Local — the subagent cannot exceed its bounds, but see nuance below |
| **Slash-command-scoped** | `.claude/commands/*.md` | Hard within command execution | Only when the command is actually run |
| **CLAUDE.md convention** | This file | Soft — well-behaved agents follow it; nothing code-level prevents violation | System-wide, honor-based |

**Important nuance on frontmatter.** Frontmatter restrictions are enforced *within the subagent's execution context* — once invoked, `clinical-reviewer` cannot use `Write` because the tool isn't granted. But the orchestrator can choose *not* to invoke the restricted subagent at all, do the work itself, or delegate elsewhere. System-wide governance still depends on CLAUDE.md conventions being honored by the orchestrator. **Frontmatter is a local guarantee, not a global one.** Hooks are the only truly global, tool-agnostic enforcement.

**Rule of thumb:** if it's "must" in this file but not backed by a hook, treat it as a convention and expect human verification.

---

## 3. Document conflict hierarchy — when repo files disagree

Files in this repo can drift. When sources conflict, apply this order — higher beats lower:

1. **Most recent ADR** (`docs/adrs/`, dated) — architecture truth
2. **PRD.md** — product intent. Beats task-level notes for product questions.
3. **Most recent `TASKS.md` entry** — execution state. Does *not* override an ADR or PRD without an explicit update to that higher source first.
4. **CLAUDE.md** (this file) — governs process, not product or architecture truth
5. **In-session conversation / chat context** — transient. Never overrides any committed file.

**Same-level conflict — when two sources at the same tier disagree:**

- **Scope beats recency.** A narrower-scope source governs its domain. An ADR about calculator state management still governs calculators even if a more recent general-architecture ADR exists, unless the newer ADR explicitly supersedes the older one by ID.
- **Explicit supersession only.** A newer source overrides an older one at the same tier *only when it explicitly names the older one as superseded*. Implicit contradiction is not supersession — it's a conflict to escalate.
- **If scope is unclear, escalate before proceeding.** Do not average, synthesize, or pick the newer one by default.

**When sources conflict, escalate — do not silently pick.** The orchestrator states the conflict, shows both sources, asks V for resolution, and commits the resolution (new ADR, PRD update, or `TASKS.md` update) *before* proceeding with work.

---

## 4. Decision hierarchy — when agents disagree

Use this ranking to resolve conflicts between agents or between V and any agent. Higher beats lower, always.

1. **Clinical safety** — patient-impacting correctness, citation integrity, guideline currency
2. **Product spec** — what the user needs, per `PRD.md`
3. **Architectural consistency** — patterns, boundaries, long-term maintainability
4. **Testability** — can we verify this works and stays working
5. **UI polish** — aesthetics, micro-interactions, delight

Example: `ui-architect` wants a cleaner component shape; `medical-scientist` says the cleaner shape loses a guideline citation. Clinical safety wins.

---

## 5. Golden rules

1. **Plan before execute** for Class C/D/E (see §6). No code until V has seen and approved a plan.
2. **Chat thinks, Code executes, files remember.** Claude.ai chat is for strategy and translation. Claude Code executes. `CLAUDE.md`, `TASKS.md`, `PRD.md`, `.claude/` are the persistent memory. Never ask V to re-explain what's in the files — read them.
3. **Every output is bilingual.** Technical panel + English panel. See §10.
4. **Safety over speed.** Clinical tool. No fabricated claims. See §13.
5. **Silo wall.** This repo's agents, skills, lessons, and memory never cross over to Pager Flow, KinTrack, or Tidbit Health.
6. **Audit ≠ approval.** An external audit document — uploaded file, research PDF, external agent output, or prior-session findings — is a *hypothesis list*, not a pre-approved work order. It does not satisfy the §19 plan-and-approval gate. No file is touched until: (a) the orchestrator has classified the task and named the agents, (b) the relevant specialist agent has independently verified each finding, (c) a written plan with proposed diff has been presented to V, and (d) V has explicitly approved it in this session. "The audit says X is wrong" is not the same as "V has approved fixing X." This rule cannot be waived by the urgency of the findings or by the fact that a prior Claude session produced the audit.
7. **Claude owns the terminal. Always.** V is never asked to run a shell command, git command, npm script, or any terminal operation. After every Class B/C/D/E task: Claude runs all quality gates (§20) locally, Claude commits with a structured bilingual message, Claude pushes to the remote. If a command fails, Claude diagnoses and fixes it — never escalates terminal work to V. This applies without exception: no "could you run `npm run build`?", no "please push this branch", no "you'll need to run the migration script."

---

## 6. Task classes — the operating discipline

Not every task goes through the same machinery. Classify before acting.

| Class | Description | Plan? | Approval? | Subagents? | Artifacts required |
|---|---|---|---|---|---|
| **A — Question** | Explanation, clarification, code-reading, no change | No | No | Main session only | None |
| **B — Tiny Edit** | ≤5 lines, single file, obvious fix (typo, import, format) | No | No — proceed and report | Main session only | One-line PR title |
| **C — Scoped Feature** | Normal feature work, single area of code | Yes | Yes — plan approval | 1–2 primary | Bilingual PR, test for new logic, `TASKS.md` update |
| **D — High-Risk Change** | Crosses boundaries, refactor, breaking change, new dep, schema change | Yes — architect-reviewed | Yes — plan + architect sign-off | Architect + specialists, serial preferred | C artifacts + ADR + rollback note + migration plan if schema + architect review artifact (§17) |
| **E — Clinical Logic Change** | Algorithm thresholds, interpretation text, guideline updates, citation changes | Yes — full plan | Plan approval + pre-execution clinical-reviewer gate | Medical-scientist + clinical-reviewer + whoever else | C artifacts + citation record update + `last_reviewed` refresh + clinical review artifact (§17) + rollback plan |

**The `-clinical` flag.** Any C or D task that incidentally touches clinical content (even just copy) gets tagged `C-clinical` or `D-clinical`. Adds: citation trace for any clinical content touched + clinical-reviewer as PR gate + clinical review artifact required. Does *not* upgrade to Class E unless clinical *logic* itself is changing.

**Classification is the orchestrator's first move** on any task, stated explicitly: *"This is Class C-clinical. Here's why: …"*

### 6.1 Classification examples — canonical calls for this repo

Use these as calibration. When a task feels between two classes, map to the closest example and name the ambiguity.

**Class A — Question**
- *"Why does ASPECTS score use region-based scoring?"* — explanation only, no change.
- *"Walk me through how `CalculatorShell` passes state to children."* — code reading.

**Class B — Tiny Edit**
- *"Fix the typo in the stroke guide H1."* — one line, no clinical meaning change.
- *"Add missing import in `aspects.tsx`."* — mechanical, no behavior change.

**Class C — Scoped Feature**
- *"Add a 'copy to clipboard' button on the NIHSS result card."* — new UI, no clinical content.
- *"Add a filter on the trials page by year."* — data + UI, no clinical interpretation.

**Class C-clinical — Scoped Feature touching clinical copy**
- *"Add a tooltip on NIHSS item 5 explaining leg drift scoring."* — new clinical copy, needs citation.
- *"Update the 'What does a score of 6 mean?' card text in ASPECTS."* — clinical copy change, no threshold change.

**Class D — High-Risk Change**
- *"Refactor `CalculatorShell` to share a `useCalculatorState` hook with guide pages."* — cross-boundary, composability implications.
- *"Switch citation registry from flat object to typed module with lookups."* — schema change, touches many files.

**Class D-clinical — High-Risk, clinical-adjacent**
- *"Rename citation IDs from `aha-2024-*` to `aha-asa-2026-*` across the registry."* — touches many clinical files; no claim text changes.
- *"Migrate pearls data from TS arrays to a typed content module."* — structural, but every clinical pearl is in the blast radius.

**Class E — Clinical Logic Change**
- *"Change the ASPECTS cutoff for EVT candidacy from ≥6 to ≥7 per updated guideline."* — threshold change, clinical consequence.
- *"Update tPA window interpretation to reflect the 2026 AHA/ASA extension."* — clinical recommendation text changes.
- *"Add mRS ≥2 exclusion to EVT pathway based on new trial."* — new clinical logic branch.

**Hard cases and how to resolve them:**
- *"Update stroke guide wording from 'thrombolysis' to 'thrombolytic therapy' throughout."* — if no meaning change → **B**. If this wording change reflects a clinical nuance (e.g., specifying mechanism) → **C-clinical**. Ask before assuming.
- *"Fix the NIHSS scoring bug where item 9 returns wrong value."* — if the bug is a typo in a number → **C-clinical** (scoring is clinical logic). If the bug is structural (wrong variable reference) → **C** with `-clinical` flag only if the fix touches user-visible text.
- *"Swap a helper used by three calculators for a new shared one."* — **D** by default (composability). If any calculator's output text changes, **D-clinical**. If any scoring logic changes, **E**.
- *"Here is an external audit / research doc / prior-session findings. Execute the fixes."* — Never **Class B** regardless of how small each individual fix looks. Minimum **Class C** if source files are touched; **Class C-clinical** if any clinical data file is in scope (trialData.ts, trialCatalogMeta.ts, trialListData.ts, `src/lib/citations/`, etc.). The audit is *input to a plan*, not the plan itself. Apply §19 in full: classify → agent identification → plan + diff presented to V → V approval → delegate → execute. An external audit document does not satisfy the approval gate — V's explicit approval in this session does.

When a classification is genuinely ambiguous, orchestrator presents the two candidate classes with trade-offs and asks V to decide. Do not silently pick the lower class.

---

## 7. Task status lifecycle

`TASKS.md` is organized into named sections. Each section is the physical home for a category of work. Inline markers record the current state of individual items within a section.

### File sections — where work lives

| Section | What lives there |
|---|---|
| `## ACTIVE` | Currently in-progress work. Usually one item. Carries `[ACTIVE]` marker. |
| `## BLOCKED` | Items that cannot proceed. Each entry states the blocking reason explicitly. |
| `## PENDING` | Forward work, organized by layer (`L2`–`L5`) and priority (`P1`/`P2`). Open items use `[ ]`; completed items use `[x]` with commit SHA. |
| `## PARKING LOT` | Ideas deferred mid-session. Not yet triaged into PENDING. Entries carry a date and the task they were parked during. |
| `## CONFIRMED CLEAN` | Running log of merged work with commit hashes and QA results. Append-only; never edited after entry. |
| `## POST-MORTEMS` | Regressions that required rollback. Each entry links to a post-mortem doc. |

### Inline status markers

These markers appear inside entries, primarily within `## PENDING` items, to record state without moving the item between sections:

| Marker | Meaning |
|---|---|
| `[ACTIVE]` | Currently being worked (mirrors the `## ACTIVE` section for clarity) |
| `[ ]` | Open — not yet started |
| `[x]` | Done — merged, with commit SHA |
| `[SKIPPED BY AGREEMENT]` | Explicitly deferred with rationale recorded |
| `blocked:<reason>` | Cannot proceed (e.g., `blocked:awaiting-clinical-review`) |
| `reverted` | Shipped then rolled back (see §14); post-mortem required |

Transitions are stated explicitly. A task can sit at `blocked:awaiting-clinical-review` for days — that's a legitimate steady state, not a problem.

---

## 8. Session start — `/status` (triggered, not mandatory)

`/status` runs **automatically** when:
- It's been >24h since last activity in this repo, OR
- V opens the project without an immediately-stated task, OR
- V types `/status` explicitly.

It **skips** for:
- Single-question sessions (Class A)
- V-initiated Class B edits with explicit scope ("just fix the typo in X")
- Re-entry within the same work day on a known task

`/status` reads `PRD.md` and the `## ACTIVE`, `## BLOCKED`, `## PENDING`, and `## PARKING LOT` sections of `TASKS.md`. It reports: what's actively in progress, what's open (by layer and priority — §7), what's blocked and why, what's parked, and a recommended next task with one-sentence rationale. Then asks V to confirm or pick differently.

`## CONFIRMED CLEAN` is intentionally skipped — the running merge log is too long to summarize each session.

Rule of thumb: *if you don't know where you are, `/status`.* Not: *you must always `/status`.*

---

## 9. Focus discipline

V is prone to mid-session segues — new feature ideas, bugs spotted, tangential questions, user feedback. Four triggers, all common, all legitimate. None belong in the middle of another task.

- **`/focus`** — re-state current task goal and acceptance criteria. Refuse new scope. Ask if the new input should be parked.
- **`/park <short description>`** — append to the `## PARKING LOT` section of `TASKS.md` using the format `- [YYYY-MM-DD] <idea> (parked during: <task>)`. Return to current work.
- **Default posture:** if V mentions a new idea mid-task without using `/park`, *treat it as a park request*. Draft the parking-lot entry, show V for one-word approval, resume current task.
- **Exception:** production bug, clinical safety issue, regulatory concern — say so explicitly and ask V to confirm the pivot.

Never silently absorb scope.

---

## 10. Output format — bilingual, always

Every meaningful technical output follows this structure.

### Technical
```
[file path]
[code / diff / config block]
```

### English
- **What this does:** [one-sentence plain-language description]
- **Why:** [tied to the plan or a rule in this file]
- **What could break:** [honest risks, even small ones]
- **How to verify:** [what to click or test after merge]

For multi-file changes, group by file. For plans, lead with numbered English steps, then the technical scaffold. For Class A/B, a light bilingual gloss is fine — but never skip the English side.

---

## 11. Agent roster

All in `.claude/agents/`. Each has frontmatter-enforced scope: `name`, `description`, `tools:`, `model:`. Main session acts as **orchestrator** — plans, classifies, delegates.

**Role split — orchestrator vs architect.** Orchestrator = foreman: takes goal, picks crews, makes schedule. Architect = blueprint designer: *does this fit the existing structure, or are we building the third different way to do the same thing?* Orchestrator plans the work; architect reviews the shape of the plan on Class D/E before the work starts.

**Semantic review standard.** The definition of "approve" for clinical content — exact match, fair paraphrase, acceptable synthesis, block-on-evidence-conflict — lives in the `clinical-reviewer` agent brief, not in this file. CLAUDE.md assigns the responsibility; the agent file defines the standard.

### Core 6 — mandatory on every UI-touching swarm

| # | Agent | Scope | Tool bounds |
|---|---|---|---|
| 1 | `ui-architect` | Design system, layouts, component patterns, responsive behavior, shadcn/ui usage | Read, Write, Edit, Glob, Grep |
| 2 | `mobile-first-developer` | Mobile UX, 375px viewport QA, touch targets, safe-area. Signs off every UI PR. | Read, Write, Edit, Glob, Grep |
| 3 | `medical-scientist` | Clinical accuracy, guideline alignment, evidence grading, trial references. Owns semantic validity of claims. | Read, Write, Edit, WebFetch, WebSearch |
| 4 | `clinical-reviewer` | **Tripwire.** Final gate on Class E and any `-clinical`-flagged PR. Reviews semantic validity per standard defined in `.claude/agents/clinical-reviewer.md`. Can block merge. | Read, Grep, Glob (read-only) |
| 5 | `content-writer` | Educational prose, pearls, study-mode content, plain-language explanations | Read, Write, Edit |
| 6 | `quality-assurance` | Tests, validation, performance budgets, deployment checks | Read, Write, Edit, Bash |

### Contextual 8 — task-activated per brief

| # | Agent | Activates when | Tool bounds |
|---|---|---|---|
| 1 | `calculator-engineer` | Scoring logic, interpretation thresholds, clinical algorithm correctness | Read, Write, Edit, Bash |
| 2 | `design-prototyper` | New mockup needed at `docs/specs/mockups/` | Read, Write, Edit |
| 3 | `design-guardian` | `docs/specs/*.md` creation or change | Read, Write, Edit, Grep, Glob |
| 4 | `librarian` | Post-flight after every swarm | Read, Write, Edit, Grep, Glob |
| 5 | `accessibility-specialist` | Interactive UI, ARIA, keyboard nav, focus management | Read, Write, Edit, Glob, Grep |
| 6 | `seo-specialist` | New routes, `src/seo/`, structured data, metadata, pre-publish | Read, Write, Edit, Glob, Grep |
| 7 | `compliance-legal` | Auth flows, privacy/ToS, PHI paths, disclaimers, GDPR/CCPA | Read, Write, Edit, Glob, Grep |
| 8 | `system-architect` | Class D/E plan review; structural decisions, composability, duplication prevention | Read, Grep, Glob (read-only) |

### Meta 3 — not invoked as subagents

| # | Agent | Role |
|---|---|---|
| 1 | `pm-agent` | Chat-side PM in Claude.ai; human↔Claude Code translator |
| 2 | `orchestrator` | Swarm composition model; main Claude Code session absorbs this function |
| 3 | `build-engineer` | Claude Code IS the build engineer when running |

---

## 12. Skills library — on-demand knowledge

In `.claude/skills/`. Agents load via `skills:` frontmatter when the task touches the domain.

### Shipped

| Skill | Domain | Loaded by |
|---|---|---|
| `stroke-guidelines` | AHA/ASA 2026 + 2022 ICH guidelines, evidence classification, key trials | `medical-scientist` |
| `performance` | Core Web Vitals, bundle budgets, Lighthouse targets, network resilience | `quality-assurance`, `ui-architect` |

### Pending (not yet written)

- `humanizer` — prose style guide for `content-writer`
- Domain skills — calculator-specific guidelines, disease-area knowledge (ICH, seizure, headache)

---

## 13. Clinical safety — operational

### 13.1 Metadata validity ≠ medical validity — READ THIS FIRST

> **The pre-commit hook (§13.5) enforces *metadata completeness*: every claim has a registered ID, every citation exists, every `last_reviewed` is populated.**
>
> **It cannot enforce *semantic validity* — whether the claim text actually matches what the cited evidence says, whether the interpretation is fair, whether the guideline section is relevant, whether newer conflicting evidence exists.**
>
> **Semantic validity is the job of `medical-scientist` (authoring) and `clinical-reviewer` (gating). A green hook means the paperwork is in order. It does not mean the medicine is correct.**

Every session, every PR, every agent: internalize this. The hardest failure mode in clinical AI tools is confident-but-wrong. Hook-passing ≠ medically correct.

### 13.2 Citation schema

All clinical citations live in `src/lib/citations/`. Schema:

```typescript
// src/lib/citations/schema.ts
export type Citation = {
  id: string;                          // "aha-asa-stroke-2026-3.2"
  source: "guideline" | "trial" | "review" | "textbook";
  title: string;
  year: number;
  section?: string;                    // guidelines
  url?: string;
  pmid?: string;                       // trials
  last_reviewed: string;               // ISO date — YYYY-MM-DD
  review_window_months?: number;       // override default per source type (§13.7)
  quoted_text?: string;
};
```

All citations registered in `src/lib/citations/registry.ts`. Claims mapped to citation IDs in `src/lib/citations/claims.ts`:

```typescript
export const CLAIM_REGISTRY: Record<string, string[]> = {
  "tpa-window-4.5hr": ["aha-asa-stroke-2026-3.2"],
  "aspects-cutoff-6": ["aha-asa-stroke-2026-5.1", "desai-2020"],
  // ...
};
```

### 13.3 Claim surfaces — where claims can live

Clinical claims appear in many places, not just static JSX. **Any user-facing medical statement is a claim surface.** If a clinician reads it and could act on it, it needs tagging. Known surfaces in this codebase:

- Static JSX text (`<p>IV tPA is indicated...</p>`)
- String literals inside components (`const recommendation = "..."`)
- Structured data in `src/data/*.ts` and `src/data/trials/*.ts`
- Calculator interpretation output (strings returned from scoring functions)
- Template strings and interpolated copy
- Markdown content (if `.md` files render clinical content)
- Tooltip, modal, dialog text
- JSON content blobs
- Derived language assembled from multiple pieces (e.g., `${severity} stroke requires ${action}`)
- Chart labels, table cells, badge text

**When a new claim surface appears that is not covered by existing scanner handlers:**

1. The task is **blocked** until a tagging strategy is added for that surface.
2. `data-architect` owns extending the scanner (§13.5) with the new handler.
3. Content on an unrecognized claim surface **cannot merge**. This is a hard rule.
4. The task's status becomes `blocked:awaiting-scanner-support` until §13.4 is updated *and* the hook is updated *and* tested on the new surface.

This prevents false-sense-of-coverage — the biggest failure mode of automated claim checking.

### 13.4 Claim tagging by surface

Different surfaces, different tagging mechanisms. All converge on the same registry. The scanner ships in phases — some surfaces are Phase 1 (shipped), others are roadmap.

| Surface | Tagging method | Phase |
|---|---|---|
| Static JSX | `data-claim="claim-id"` attribute on the element | 1 |
| Structured data in `src/data/` | Adjacent `claimId: string` field on the object | 1 |
| Computed strings from functions | Wrap return with helper: `claim(text, "claim-id")` from `src/lib/citations/claim.ts` | 2 |
| Markdown | HTML comment preceding the clinical paragraph: `<!-- @claim: claim-id -->` | 2 |
| JSON content blobs | `claim_id` field alongside the text field | 2 |
| Template strings / derived language | Tag at the composition site, not the fragments | 3 |

The pre-commit hook scans all shipped phases. A new surface type requires a new tagging strategy added to the hook before claims can ship on that surface (§13.3).

### 13.5 Pre-commit hook — enforced

`.husky/pre-commit` runs `scripts/check-claims.ts`, which:
- Scans changed files for every tagging mechanism in §13.4 that is in its shipped phase
- Fails the commit if any tagged claim has no entry in `CLAIM_REGISTRY`
- Fails the commit if any mapped citation has no `last_reviewed` date
- Fails the commit if any citation is older than its review window (§13.7) and not marked `blocked:awaiting-review` in `TASKS.md`

This is the hard gate. "No fabricated claims" is enforced here — but only to the extent of metadata completeness (see §13.1).

**Hook-vs-CI split:** lightweight checks (registry lookup, `last_reviewed` presence, freshness-window comparison) run in pre-commit because they are fast and actionable at commit time. Heavier checks (full AST-based composition-site scanning, cross-file claim graph validation) move to pre-push or CI if they make pre-commit slow or flaky. Developer trust in the hook is the scarce resource; a slow hook gets disabled.

### 13.6 What `last_reviewed` means — the checklist

Refreshing `last_reviewed` is not a date flip. Before a reviewer can update the field, they must verify:

1. **Source still resolves** — URL or PMID still works, text unchanged from when cited
2. **Guideline version current** — year/section in citation matches current published version
3. **Dependent claims consistent** — all claims mapped to this citation still accurately reflect it
4. **No wording drift** — the claim text hasn't drifted from what the evidence actually says
5. **Newer evidence considered** — conflicting or updating literature reviewed and either incorporated or explicitly rejected with rationale
6. **Dual sign-off** — `medical-scientist` confirms semantic correctness; `clinical-reviewer` is the final gate

A `last_reviewed` refresh without this checklist completed is a governance violation. The `/audit-citations` command walks the reviewer through the checklist as a prompt and refuses to write the new date until all six are confirmed.

### 13.7 Freshness matrix by source type

Not all evidence ages equally. Default re-review windows:

| Source type | Default window | Rationale |
|---|---|---|
| Current clinical guidelines (AHA/ASA, AAN, ESO) | 6 months | Publication cycles, errata, focused updates |
| Rapidly evolving areas (thrombectomy indications, emerging therapies) | 3 months | High volatility |
| Management / treatment recommendations | 6 months | Evolve with new evidence |
| Drug dosing, contraindications | 6 months | FDA updates, safety signals |
| Calculator formulas (NIHSS, GCS, ASPECTS, mRS) | 24 months | Scoring itself is stable; interpretation may drift |
| Landmark trials (historical, foundational) | 36 months | Stable once established |

Per-citation override: a citation can carry `review_window_months` to override the default. Rationale for override required in citation comment.

### 13.8 Guideline currency

When a guideline is superseded, `medical-scientist` creates a Class E task: update citation, refresh `last_reviewed` via the §13.6 checklist, update or retire dependent claims, migration note in PR.

---

## 14. Rollback protocol

For Class D/E, a rollback plan is required in the PR body *before merge*. If a regression is detected post-merge:

1. **Immediate revert** — `git revert <merge-commit>` and push. If revert is not clean, proceed to step 2.
2. **Feature flag disable** — if the change is behind a flag, disable via config; users see previous behavior.
3. **Post-mortem task** — auto-created in `TASKS.md` under `## POST-MORTEMS` with timestamp, symptom, suspected cause. Status: `reverted`.
4. **Post-mortem doc** — `docs/YYYY_MM_DD/post-mortem-<slug>.md`. Template in `docs/adrs/post-mortem-template.md`.
5. **Re-enable gate** — `clinical-reviewer` + `system-architect` must both sign off (via §17 review artifacts) before the change re-enters.

---

## 15. Acceptance criteria — every Class C/D/E task

When a task is created or planned, `TASKS.md` entry must include:

The `Status:` field uses inline markers (see §7) — these are state labels written inside a `## PENDING` entry, not file section names.

```
### [Task slug] — Class [X][-clinical?]
- **Status:** planned | in_progress | blocked:<reason> | ready_for_review | ready_for_merge | merged | parked | reverted | archived
- **User-visible goal:** [one sentence, clinician's perspective]
- **Non-goals:** [what we're explicitly not doing]
- **Files likely touched:** [paths]
- **Acceptance checks:** [list — concrete, testable]
- **Clinical impact:** none / low / high
- **Rollback plan:** [required for D/E; "n/a" for C with no user-facing behavior]
```

Incomplete acceptance entries → orchestrator asks V to fill before planning.

---

## 16. Durable artifacts per class

What must exist after work is done, beyond the code itself:

| Class | Artifacts |
|---|---|
| A | None |
| B | One-line commit message · committed and pushed to remote |
| C | Bilingual PR description · test for new logic · `TASKS.md` status update · committed and pushed · PR opened |
| D | C artifacts + ADR in `docs/adrs/` + rollback note + migration plan (if schema) + **architect review artifact (§17)** |
| E | D artifacts + citation record update + `last_reviewed` refresh via §13.6 + **clinical review artifact (§17)** + rollback plan |

**Commit message format (all classes):**
```
<type>(<scope>): <imperative summary under 72 chars>

- <what changed, file-level>
- <what changed, file-level>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```
`type`: feat · fix · docs · refactor · test · chore · clinical  
`scope`: trials · calculator · pathway · guide · ui · data · ci

Claude writes and executes the commit and push. V is never asked to do this (§5 Rule 7).

If an artifact is missing, `/pr-ready` fails and reports what's missing.

---

## 17. Review artifact standards

Every Class D architect review and every Class E / `-clinical` clinical-reviewer review produces a standardized artifact in `docs/reviews/`. This makes reviews auditable and prevents pseudo-review.

### 17.1 Architect review — `docs/reviews/arch-PR<#>-<slug>.md`

```markdown
# Architect review — PR #<number>

**Decision:** approve | approve-with-conditions | block
**Reviewed:** plan only | plan + touched files | plan + implementation
**Reviewer:** system-architect (model: <model-name>)
**Date:** <YYYY-MM-DD>

## Rationale
[One paragraph — what's right, what's risky, what's the call.]

## Required follow-ups
- [list; can be empty]

## Blocking issues
[Only if decision is `block`. Each issue stated concretely with a resolution path.]
```

### 17.2 Clinical review — `docs/reviews/clinical-PR<#>-<slug>.md`

```markdown
# Clinical review — PR #<number>

**Decision:** approve | approve-with-conditions | block
**Reviewer:** clinical-reviewer (model: <model-name>)
**Date:** <YYYY-MM-DD>

## Scope
- Claims touched: [list of claim IDs]
- Citations affected: [list of citation IDs]
- Surfaces changed: [§13.3 categories]

## Semantic validity
[Confirmed / flagged items. This is the §13.1 work — does the claim text actually match the evidence? Review standard lives in .claude/agents/clinical-reviewer.md.]

## Citation accuracy
[Each citation checked for current version, correct section, accurate quote]

## Freshness
[For each citation: `last_reviewed` still within window (§13.7) → pass, or refresh required via §13.6]

## Rationale
[One paragraph.]

## Required follow-ups
- [list; can be empty]
```

**Missing review artifact → `/pr-ready` fails.** "Reviewed" in a comment is not enough; the artifact must exist in `docs/reviews/`.

---

## 18. Cost / latency / fan-out rules

- **Class A/B:** main session only. No subagent invocation.
- **Class C:** one primary agent. Secondary only if the plan genuinely crosses domains (e.g., calculator + UI).
- **Class D:** architect reviews plan (serial). Specialists execute (parallel if independent, serial if dependent).
- **Class E:** medical-scientist produces the claim + evidence; specialists execute; clinical-reviewer gates pre- and post-execution.
- **Parallel fan-out must be justified in the plan.** Default is serial.
- **Hooks run on critical paths only** — pre-commit, pre-push — not on every file edit.

---

## 19. Delegation protocol (class-aware)

When V describes a task, orchestrator:

0. **If the task originates from an external document** (uploaded audit, research file, prior-session findings, external agent output, or any source other than V's direct instruction in this session): treat every finding as a hypothesis, not a confirmed fix. Do not execute any finding without completing steps 1–6 below. The document is a briefing, not an approval. Violating this step is a protocol breach regardless of how obvious the fixes appear.
1. Classifies (A/B/C/D/E, with `-clinical` flag if applicable) and states it, referencing §6.1 examples if the call is non-obvious.
2. For A/B: proceeds or answers directly. Skip to step 7.
3. For C/D/E: identifies primary agent + secondaries, lists skills to load.
4. Produces a plan — English first (numbered), technical scaffold second.
5. For D/E: routes plan to `system-architect` for structural review (produces §17.1 artifact). For E: routes plan + evidence trace to `clinical-reviewer` for pre-execution approval.
6. **Waits for V's approval.** No code before approval on C/D/E.
7. Delegates with clear briefs.
8. Merges results. Runs quality gates (§20). Reports back bilingually.

---

## 20. Quality gates — before `/pr-ready` succeeds

Claude runs every gate. V is never asked to run any of these.

- All relevant tests pass (unit + e2e where they exist).
- `tsc --noEmit` passes with no new errors.
- `npm run build` succeeds (Vite production build).
- Claims hook passes (no unregistered claims; no missing `last_reviewed`; no stale-past-window citations).
- For `-clinical` or Class E: clinical review artifact (§17.2) exists and decision is `approve` or `approve-with-conditions`.
- For Class D/E: architect review artifact (§17.1) exists and decision is `approve` or `approve-with-conditions`.
- Durable artifacts checklist complete (§16).
- Bilingual PR description prepared — Technical summary + English summary.

If any gate fails, the PR does not open. Orchestrator **diagnoses and fixes the failure**, then re-runs the gate. Never asks V to investigate or fix a terminal failure.

**Post-gate execution (Claude-owned, no V involvement):**
1. `git add <specific files>` — stage only the changed files; never `git add -A` blindly
2. `git commit -m "..."` — bilingual message per §16 format
3. `git push` — push the branch to remote
4. For Class C+: open a PR with `gh pr create` using the bilingual description
5. Report the PR URL to V as the final deliverable

---

## 21. File conventions

```
src/
├── pages/                      # Page-level React components (see note below)
│   ├── guide/                  # Clinical workflow pages
│   └── calculators/            # Calculator pages
├── components/
│   ├── article/                # Article components (stroke/, etc.)
│   ├── calculators/            # Reusable calculator components
│   └── ui/                     # shadcn/ui primitives
├── data/
│   ├── trials/                 # Trial database
│   └── strokeClinicalPearls.ts
├── lib/
│   ├── citations/              # Citation schema + registry + claims + claim() helper
│   └── utils/
├── router.tsx                  # Central React Router 7 config
└── main.tsx                    # Vite entry point

docs/
├── adrs/                       # Architectural Decision Records
├── reviews/                    # Architect + clinical review artifacts (§17)
├── YYYY_MM_DD/                 # Dated work notes, post-mortems
└── post-mortem-template.md

.claude/
├── agents/                     # agent briefs (17 agents across Core 6 / Contextual 8 / Meta 3) + 2 skills; see §11–§12
├── skills/                     # On-demand knowledge bundles
├── commands/                   # Slash commands
└── hooks/                      # Pre-commit, pre-push enforcement scripts

.husky/                         # Git hooks
scripts/
└── check-claims.ts             # Pre-commit claim/citation validator

TASKS.md                        # Layered ledger: ACTIVE / BLOCKED / PENDING (L2-L5, P1-P2) / PARKING LOT / CONFIRMED CLEAN / POST-MORTEMS
PRD.md                          # Product decisions, appended with date
CLAUDE.md                       # This file
```

**Note on `src/pages/`:** despite the name, this is a Vite + React Router 7 SPA. `src/pages/` contains *page-level React components*, not Next.js pages. There is no file-based routing. If this naming causes confusion with agents that pattern-match on "pages" → Next.js, a future Class D refactor could rename to `src/routes/` or `src/views/`. Not urgent, but tracked as a `TASKS.md` item under "Future Refactors."

---

## 22. Slash commands — reference and failure behavior

Every command has defined happy path *and* failure behavior. Commands defined in `.claude/commands/`.

| Command | Happy path | On failure |
|---|---|---|
| `/status` | Report state, recommend next task | Missing `TASKS.md` → report absence, offer to create; skip recommendation |
| `/focus` | Re-state current task, refuse scope | No active task → ask V to pick or create one |
| `/park <idea>` | Append to parking lot, resume current task | `TASKS.md` not writable → console log + ask V to commit manually |
| `/classify <task>` | Assign class + flag, state reasoning (ref §6.1) | Ambiguous between classes → present the two candidates with trade-offs, ask V to decide |
| `/plan-feature <goal>` | Bilingual plan; route to architect if D/E | Missing acceptance criteria → ask V to fill template first |
| `/audit-citations` | List stale citations, create re-review tasks | Can't write `TASKS.md` → console report, ask V to commit manually |
| `/pr-ready` | Run gates, prepare bilingual PR description | Partial artifacts → list exactly what's missing, refuse to open PR |
| `/rollback <commit>` | Revert, flag-disable, post-mortem | Revert not clean → stop, escalate to V, no feature-flag action without explicit confirmation |

---

## 23. What this file is not

Not a place for in-progress notes, transient context, or task-specific work — those go in `TASKS.md`. This file is the **contract** for how work gets done. Changes are deliberate.

**If this file drifts from how we actually work, update it.** A contract that's silently violated is worse than no contract.
