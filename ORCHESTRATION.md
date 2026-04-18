# ORCHESTRATION.md

> Reference stub. The full orchestration model lives in CLAUDE.md.

## Where the model lives

| Topic | Location |
|---|---|
| Task classes (A/B/C/D/E) | CLAUDE.md §6 |
| Agent roster | CLAUDE.md §11 |
| Skills library | CLAUDE.md §12 |
| Delegation protocol | CLAUDE.md §19 |
| Quality gates | CLAUDE.md §20 |
| Cost / fan-out rules | CLAUDE.md §18 |

## Quick reference

Main session acts as orchestrator. Classify first (§6), then delegate (§19). Core 6 agents are mandatory on every UI-touching swarm. Contextual agents activate per their brief. Meta agents are documentation only — not invoked as subagents.

See `.claude/agents/` for agent briefs and `.claude/skills/` for domain knowledge bundles.
