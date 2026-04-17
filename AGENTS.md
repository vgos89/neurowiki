# AGENTS.md — NeuroWiki Swarm Entry Point

This file is the single entry point for every Claude Code session.

## Before touching any code
1. Read this file fully.
2. Read ORCHESTRATION.md fully.
3. Read every file in agents/active/ fully.
4. Read docs/NEUROWIKI.md, docs/ROADMAP.md, docs/TASKS.md.
5. For any UI work: read the relevant file in docs/specs/ and its mockup in docs/specs/mockups/.

## Core rules (apply to every session)
- No code until a swarm prompt is approved by the PM (human in chat).
- Every swarm must produce a pre-flight report before code.
- Every commit must pass all 5 gates: build, typecheck, Mobile QA, Desktop QA, spec compliance, SEO validation. (Listed as 5 but it's really 6 — build and typecheck count as one gate.)
- Never modify files outside the swarm's declared scope.
- Never invent medical content. Every clinical claim requires a cited source.
- Never use arbitrary Tailwind values. Tokens only.
- Copy-to-EMR templates are locked; changes require explicit PM approval.

## Gates (enforced before every commit)
1. Build + typecheck pass
2. Mobile QA (375px) + Desktop QA (1280px) pass
3. Spec compliance self-check pass
4. SEO validation pass (metadata, schema, link graph, no orphans)
5. Regression matrix green

Failure on any gate means Claude Code iterates internally. No result returns to PM until all gates are green.

## Swarm protocol
See ORCHESTRATION.md.

## Agent roster
See agents/README.md.

## What has been built
See docs/NEUROWIKI.md (fix history), docs/ROADMAP.md (5-layer plan), docs/TASKS.md (ledger).

## Mobile + Desktop QA Checklist (required before every commit touching UI)
- [ ] Open the changed page on mobile viewport (375px) — verify layout, no overflow, no broken elements
- [ ] Open the changed page on desktop viewport (1280px) — verify layout, sidebar, header
- [ ] Check both viewports in browser dev tools if physical device not available
- [ ] Navigation works on both viewports
- [ ] No horizontal scroll on mobile
- [ ] Touch targets minimum 44px on mobile
- [ ] Logo renders correctly in both nav positions (desktop sidebar + mobile header)
- [ ] No console errors on either viewport

This checklist is NON-NEGOTIABLE before any UI commit.
Claude Code must report: "Mobile QA: pass" and "Desktop QA: pass" before pushing.
