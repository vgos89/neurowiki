# AGENTS.md — Rules for Every Coding Agent

## Read First
Read docs/NEUROWIKI.md, docs/ROADMAP.md, and AGENTS.md completely before touching any file.

## Pre-flight Checklist (required before every task)
1. List every file you plan to touch
2. State which rules below apply
3. Performance check: new queries? hot path impact? computation memoized?
4. State what existing behavior could break
5. Wait for PM Agent approval before writing any code

## Core Rules
- Show diffs before applying. Wait for approval before applying.
- Run npm run build and npm run typecheck after every change — both must pass
- Never touch files outside the current task scope
- Never add dependencies without PM Agent approval
- Never change design tokens without PM Agent approval
- Never rebuild a component that already exists — check first
- Never commit with message "fix", "update", "debug", or "something"
- Commit messages must describe what changed and why

## Performance Rules
- No new computation inside render without memoization
- No large data imports on pages that don't need them
- Lazy-load any page chunk over 50 kB
- Never load trialData.ts on a page that does not show trials

## Design System Rules
- Colors: use only tokens defined in tailwind.config.js and CLAUDE.md
- Never use arbitrary Tailwind values like bg-[#123456]
- Never use inline styles for layout or color
- Spacing: use Tailwind scale only
- Typography: use only type scales defined in CLAUDE.md

## Content Rules
- Every clinical claim requires a source field: guideline name, year, URL
- No clinical content ships without a source
- Copy-to-EMR templates are locked — changes require PM Agent approval
- Never modify trialData.ts without explicit task assignment

## Forbidden Actions
- Never push if build fails
- Never push if typecheck fails
- Never commit secrets or API keys
- Never delete a page component without PM Agent confirmation

## Session End Checklist
1. npm run build — must pass
2. npm run typecheck — must pass
3. Commit with descriptive message
4. Push to main
5. Report: files changed, what changed, build result, commit hash
6. Update TASKS.md — move completed task to CONFIRMED CLEAN
7. Update docs/ROADMAP.md — check off completed item
8. Update docs/NEUROWIKI.md — add to fix history if relevant

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
