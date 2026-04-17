# ORCHESTRATION.md — Swarm Protocol

## What a swarm is
A swarm is one coordinated pass over a section of the app (calculators, pathways, trials, articles) in which multiple specialist agents sign off on the work before any code is written, and all five gates must pass before any code is committed.

## Swarm composition

### Core 7 (mandatory on every swarm)
1. UI Architect
2. Medical Scientist
3. Accessibility Specialist
4. Mobile-First Developer
5. Content Writer
6. Quality Assurance
7. SEO Specialist

### Contextual specialists (activated by task type)
- Calculator Engineer — calculator tasks
- Design Prototyper — when a new HTML mockup is needed
- Design Guardian — when a spec file is being created or changed
- Librarian — post-flight doc updates (runs on every swarm)
- Build Engineer — the executor (runs on every swarm; not a signer)

### Dormant specialists (activated by explicit PM request)
- Compliance & Legal — auth, privacy, legal-adjacent work
- Performance Optimizer — bundle, load time, Core Web Vitals work

## Swarm lifecycle

### 1. Task intake (human → PM Agent in chat)
Human describes what they want in natural language. PM Agent clarifies scope, identifies which section is affected, selects specialists.

### 2. Swarm prompt composition (PM Agent in chat)
PM Agent drafts a swarm prompt using the template below. Human approves or redlines.

### 3. Pre-flight (Build Engineer, in Claude Code)
Build Engineer reads all required files, spawns a sub-agent per required specialist via the Task tool, each sub-agent produces its sign-off section. Build Engineer synthesizes. Conflicts surface.

### 4. Conflict resolution (if conflicts)
Build Engineer stops, reports conflicts to PM Agent. PM Agent translates to human. Human decides. Decision goes into the spec's changelog. Build Engineer resumes.

### 5. Execution (Build Engineer)
Reference implementation first. All 5 gates run. If any fail, internal iteration until green. No return to PM until green.

### 6. Batch application (Build Engineer)
If the swarm covers multiple files, the reference implementation gets ported to remaining files in batch. All 5 gates re-run.

### 7. Post-flight (Librarian)
TASKS.md, ROADMAP.md, NEUROWIKI.md, and link-graph.json updated. Commit pushed. Single report returned to PM.

### 8. Verification (PM Agent → human)
PM Agent reviews report, surfaces anything ambiguous to human, human approves visually.

## Gate definitions

### Gate 1: Build + Typecheck
`npm run build` and `npm run typecheck` both pass with no warnings introduced by this swarm.

### Gate 2: Mobile QA + Desktop QA
Per AGENTS.md checklist — every page touched is verified at 375px and 1280px. Touch targets ≥44px on mobile. No horizontal scroll. Layout intact.

### Gate 3: Spec compliance self-check
Build Engineer re-reads the relevant spec file and diffs the implementation against it. Any deviation must be documented and approved or fixed.

### Gate 4: SEO validation
- Metadata present in routeMeta.ts for every new/changed route
- Structured data schema present and valid per section spec
- link-graph.json updated, no orphans, no broken references
- Canonical tags set
- Sitemap regenerated if routes added

### Gate 5: Regression matrix green
QA specialist lists every feature that could be affected by this swarm, tests each, reports. Matrix is a table in the pre-flight with status per feature.

## Swarm prompt template

Every swarm prompt given to Claude Code has this exact structure:

```
SWARM: [section] — [task summary]

READ FIRST (in this order)
1. AGENTS.md
2. ORCHESTRATION.md
3. agents/active/build-engineer.md
4. agents/active/orchestrator.md
5. docs/specs/[relevant spec].md
6. docs/specs/mockups/[relevant mockup].html
7. [each active agent .md for this swarm]
8. docs/link-graph.json

SECTION
[calculator | pathway | trial | article]

SPECIALISTS
Core 7 (mandatory):
  @ui-architect
  @medical-scientist
  @accessibility-specialist
  @mobile-first-developer
  @content-writer
  @quality-assurance
  @seo-specialist
Contextual:
  [activated specialists listed here]

SCOPE
Files to touch: [explicit list]
Files NOT to touch: [explicit exclusions]

REFERENCE IMPLEMENTATION
[Which file is the reference; rest of batch follows]

PRE-FLIGHT REQUIRED (produce before any code)
1. Each specialist's sign-off section (see Sign-off Template below)
2. Diff plan for reference file
3. Regression matrix
4. Spec citations (line numbers or section IDs)
5. Link graph impact

Do not write code until pre-flight is complete and returned.

EXECUTION (after pre-flight approved)
1. Reference file first
2. All 5 gates must pass
3. If gates fail, iterate internally — do not return
4. Batch apply to remaining files in scope
5. Re-run all gates across batch

POST-FLIGHT
1. Update TASKS.md, ROADMAP.md, NEUROWIKI.md (Librarian)
2. Update link-graph.json + regenerate LINK_GRAPH.md
3. Commit with descriptive message
4. Push to branch
5. Return single report: commit hash, files changed, gate results, spec compliance summary

DO NOT RETURN
Do not return with a result until all 5 gates pass on all files in scope. Internal iteration only. Claude Code is the executor, not the approver.
```

## Sign-off Template

Every specialist's section of the pre-flight follows this exact template:

```
@[specialist-name] — Sign-off
Spec cited: [file:line-range or file:section-id]
Scope for this specialist: [1-2 sentences]
Proposed changes: [bulleted list, specific]
Risks flagged: [anything that could break, or empty]
Dependencies on other specialists: [e.g. "Content Writer owns interpretation copy, I own the card anatomy"]
Status: ready | blocked | conflict
Conflict details (if status=conflict): [what and with whom]
```

## Conflict resolution protocol

If two specialists disagree in pre-flight:
1. Build Engineer stops immediately — no code written
2. Packages the conflict: "A proposed X, B proposed Y, here is the tradeoff"
3. Returns to PM Agent (in chat)
4. PM Agent translates and proposes resolution to human
5. Human decides
6. Decision is recorded in the relevant spec's changelog with date and reasoning
7. Build Engineer resumes with the decision

## Versioning

Specs are locked once approved. Changes require a new PM task. Every spec file has a changelog at the bottom; changes append dated entries. Never edit in place.
