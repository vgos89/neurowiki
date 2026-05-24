---
name: verify-calculator
description: Run a NeuroWiki calculator end-to-end and confirm scoring + UI wiring actually works in the browser. Load when implementing or changing any calculator (GCS, NIHSS, ASPECTS, ICH Score, ABCD2, HAS-BLED), when a calculator interpretation string changes, or when you need to verify a calculator regression before pushing. Closes the "score logic still right but UI wire dropped" failure class that tsc cannot see — exactly the bug pattern from the 2026-05-24 NIHSS exam-time / neuro-eval drift report.
disable-model-invocation: true
allowed-tools: Bash, Read
---

# Verify a calculator end-to-end

This skill exists because tsc + the claims hook + check:routes confirm *paperwork* — they do not confirm that a clinician clicking through the calculator gets the right number. Several recent bugs (NIHSS timestamp drift, hemicraniectomy synthesis pointing at the wrong guideline section, copy-template UI toggle wired to the wrong state) shipped green through every structural gate and were caught only by V doing a manual screenshot review.

Use this skill any time:
- A calculator's scoring function changed
- An interpretation string changed
- A calculator's copy-template text or template-toggle changed
- A new portal drawer, modal, or input control was added to a calculator
- A shared primitive (CalculatorShell, TimestampBubble, severity tokens) changed and any calculator consumes it
- You are about to push a commit touching `src/pages/*Calculator.tsx` or `src/components/calculators/**`

## The protocol

### 1. Identify the calculator(s) touched

```bash
git diff --name-only HEAD | grep -E '(Calculator\.tsx|components/calculators/)'
```

For each calculator file in the diff, run steps 2–5.

### 2. Start the local dev server (if not already running)

```bash
npm run dev &
# wait for "Local:" line, capture port — default 5173
```

If the port is already in use, the existing dev server is fine. Do not assume Vite picked a fresh port.

### 3. Drive the calculator with the Chrome MCP

Required: `mcp__Claude_in_Chrome__*` tools loaded. If unavailable, fall back to the manual checklist in §6 and ask V to confirm.

```
mcp__Claude_in_Chrome__navigate  →  http://localhost:5173/calculators/<slug>
mcp__Claude_in_Chrome__get_page_text  →  confirm calculator H1 renders
```

Then for each input, fire the interaction. Calculators use `<button role="radio">` for score selectors and `<button>` for toggles. Use `mcp__Claude_in_Chrome__find` to locate, then `mcp__Claude_in_Chrome__computer` to click.

### 4. Exercise the known-good scoring fixtures

Each calculator has a canonical fixture in `scripts/test-fixtures/`. Click the inputs in the fixture, then read the displayed score with `get_page_text` and compare to the expected score.

Calculator → fixture → expected score:

| Calculator | Fixture path | Expected score (all-default = lowest) |
|---|---|---|
| GCS | `scripts/test-fixtures/gcs-minimum.json` | 3 |
| GCS (all-max) | `scripts/test-fixtures/gcs-maximum.json` | 15 |
| NIHSS | `scripts/test-fixtures/nihss-zero.json` | 0 |
| ASPECTS | (manual: no regions selected) | 10 |
| ICH Score | `scripts/test-fixtures/ich-low.json` | 0 |
| ABCD2 | (manual: no risk factors) | 0 |

If a fixture file does not exist yet, build it on first use and check it in.

### 5. Verify the copy-to-clipboard template

Click the Copy button. Read the clipboard with `mcp__computer-use__read_clipboard`. Confirm:
- All clicked inputs appear in the template
- Timestamps (if any) match what was entered, in the right order, with the right field labels
- Any optional toggles (e.g., NIHSS "include LVO probability") are reflected in the copied text
- No raw object placeholders (`[object Object]`, `undefined`, `NaN`)

### 6. Manual fallback checklist (if Chrome MCP unavailable)

If you cannot drive the browser programmatically, write a short note to V with the URL and an itemized list of inputs to click. Do not push the commit until V has confirmed each item. Never report a calculator verified based on tsc alone.

## Reporting

After running, emit a single block to the orchestrator transcript:

```
[verify-calculator] <slug>: PASS — score X = expected, copy template matches.
```

Or, on failure:

```
[verify-calculator] <slug>: FAIL — <symptom>.
  Reproduce: <URL> + click sequence
  Likely cause: <file:line if findable>
```

A FAIL blocks the commit. Diagnose and fix; do not push around it.

## Why this skill is `disable-model-invocation: true`

Heavy. Starts a dev server, drives a browser, takes minutes per calculator. Only fire when explicitly invoked — never as a side effect of routine work.
