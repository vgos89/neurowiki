# Architect review — governance-modernization-2026

**Decision:** approve-with-conditions
**Reviewed:** plan only + touched files
**Reviewer:** system-architect (model: claude-opus-4)
**Date:** 2026-05-08

## Rationale

The plan is structurally sound and addresses confirmed drift: three "not-a-subagent" files squatting in `.claude/agents/` create avoidable auto-delegation ambiguity; the missing committed `.claude/settings.json` leaves hook architecture aspirational rather than enforced; the `qa-engineer` reference in `AGENTS.md` is a dangling pointer. Carving `evidence-verifier` out of `medical-scientist` as a read-only, web-enabled gatherer is a clean composition split — `medical-scientist` authors with a verified packet, rather than doing acquisition + authoring + self-review in one role. `trial-statistician` is similarly clean against `clinical-reviewer` because the latter is scoped to paraphrase-vs-source drift, not study-design judgment. All 10 conditions were resolved in-flight before execution: QA tool scope kept with prose constraints; compliance-legal rewritten as reviewer-only; hook stubs exit 1 on clinical paths (non-clinical paths exit 0); §3 note added placing `.claude/rules/` at CLAUDE.md tier; existing skills migrated to folder format; evidence-verifier artifact contract added; clinical-reviewer 7th block condition added; slash commands given per-command allowed-tools lists.

## Required follow-ups

- Implement full task-class detection in `scripts/claude-hooks/guard-clinical-edit.mjs` before using clinical edit workflow under hook enforcement. Until implemented, clinical edits blocked by hook — track in TASKS.md.
- Convert `validate-clinical-agent-output.mjs` from warning to blocking (exit 1) once artifact schema is defined and tested.
- Add a TASKS.md 6-month review item: assess whether `seo-specialist`, `compliance-legal`, and `accessibility-specialist` (all contextual) can be merged into a single `web-compliance` reviewer if activation rates are low.
- Update `.claude/skills/README.md` to note folder-format as canonical; the two flat files (stroke-guidelines.md, performance.md) are migrated this PR.

## Blocking issues

None.
