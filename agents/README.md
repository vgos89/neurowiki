# Agent Registry

This folder contains the specialist persona files that power the NeuroWiki swarm system.

## Structure
- `active/` — agents that participate in swarms today
- `dormant/` — agents that exist for future activation (not loaded into swarms)

## Active agents — Core 7 (mandatory on every swarm)
1. ui-architect.md
2. medical-scientist.md
3. accessibility-specialist.md
4. mobile-first-developer.md
5. content-writer.md
6. quality-assurance.md
7. seo-specialist.md

## Active agents — Contextual (activated per task type)
8. calculator-engineer.md — calculator swarms
9. design-prototyper.md — new visual work, HTML mockup authoring
10. design-guardian.md — spec file ownership and change control
11. librarian.md — doc coherence, TASKS/ROADMAP/NEUROWIKI updates
12. build-engineer.md — Claude Code execution, swarm reception
13. pm-agent.md — PM in chat (not loaded by Claude Code; lives here for reference)
14. orchestrator.md — swarm composition logic (loaded by Build Engineer)

## Dormant agents (not loaded into swarms)
- compliance-legal.md — activates for auth, legal, privacy work
- performance-optimizer.md — activates for bundle/performance-focused tasks

## How to activate a dormant agent
Move the file from dormant/ to active/ and update this README. Requires PM approval per ORCHESTRATION.md.

## Who reads what
- Claude Code reads: every file in active/ at session start + files in dormant/ only when explicitly told
- The human PM (in chat) reads: all files, all the time
- The Orchestrator composes swarms by selecting from active/ based on task type
