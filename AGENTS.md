# AGENTS.md

> Reference stub. Agent briefs live in `.claude/agents/`. Full roster and tool bounds in CLAUDE.md §11.

## Agent categories

**Core 6** — mandatory on every UI-touching swarm:
`ui-architect` · `mobile-first-developer` · `medical-scientist` · `clinical-reviewer` · `content-writer` · `quality-assurance`

**Contextual 8** — task-activated per brief:
`calculator-engineer` · `design-prototyper` · `design-guardian` · `librarian` · `accessibility-specialist` · `seo-specialist` · `compliance-legal` · `system-architect`

**Meta 3** — documentation only, not invoked as subagents:
`pm-agent` · `orchestrator` · `build-engineer`

## Mobile / Desktop QA checklist (mobile-first-developer)

- [ ] 375px viewport (iPhone SE) — no horizontal overflow, no clipped text
- [ ] 428px viewport (large phone) — layout expands cleanly
- [ ] 768px viewport (tablet portrait) — breakpoint transitions correct
- [ ] Touch targets ≥ 44px on all interactive elements
- [ ] Safe-area insets applied on fixed bottom bars (iPhone notch/home indicator)
- [ ] No hover-only interactions (touch devices get nothing)
- [ ] Tab bar not obscured by drawers or modals
- [ ] Sticky headers remain visible while scrolling content
