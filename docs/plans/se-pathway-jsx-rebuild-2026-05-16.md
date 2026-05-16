# /build Plan — Status Epilepticus Pathway JSX Rebuild

**Date:** 2026-05-16
**Author:** orchestrator
**Class:** D-clinical with Class E aspects (2 ship-blockers are Class E)
**Scope:** Rewrite `src/pages/StatusEpilepticusPathway.tsx` using Pattern A primitives + new §4.7/§4.8 patterns, applying all 24 fix-manifest items in one atomic commit.

---

## English plan

1. **Replace `src/pages/StatusEpilepticusPathway.tsx`** with a new implementation matching Pattern A from the v3 EVT design + the SE-specific patterns from PATHWAY_SPEC §4.7 (Outcome row) and §4.8 (Dose result row).

2. **Reuse primitives from EVT rebuild** at `src/components/pathways/` (Rail, CategoryRow, BranchChip, CascadeNotice, LearningPearl). Do not re-fork. Compose with the SE-specific outcome-row + dose-result-row patterns from spec §4.7 + §4.8.

3. **Apply all 24 fix-manifest items** from `docs/audits/2026-05-16/status-epilepticus-pathway-fix-manifest.md` (17 unique actionable + 7 consolidated cross-refs):

   - **Patch 1 ship-blockers (Class E):**
     - **A1** Rewrite `getRecommendedAgent` to ESETT-equivalence tier gated by comorbidity. Remove agent hierarchy (lev / fos / VPA presented as equivalent options selected by patient context). Move lacosamide out of Stage 2 dropdown entirely — relocate to Stage 3 adjunct.
     - **A2** Remove the cosmetic-only "Non-Convulsive SE" toggle from `PatientData`. The toggle currently does nothing (clinicians selecting NCSE silently get convulsive-SE dosing — worse than a wrong branch). Replace with a terminal "Suspect NCSE → cEEG + NCSE-specific guidance" screen that routes out of the pathway.
     - **A3** Cap lacosamide loading at 400 mg per FDA label (down from 600 mg). Add pre-load ECG gate; reclassify 2°/3° AV block as **avoid** (not "caution") for fosphenytoin/phenytoin/lacosamide.
     - **A6** Add Stage 4 (super-refractory SE) branch with adjunct adjuncts placeholder (transfer-to-NCC + immunotherapy options).

   - **Patch 2 Class E doses + RAMPART refactor:**
     - **A4** IM midazolam fixed-dose scheme (RAMPART): 10 mg if >40 kg; 5 mg if 13–40 kg. Refactor `calculateDose` to accept `patient` parameter for weight-banded fixed-dose schemes.
     - **A5** Update interpretation function for ESETT-era equivalence — lev / fos / VPA listed as Tier-1 with no preference order in the recommendation function.
     - **A14** Update Stage 1 time-window label: separate "stabilization (0–5 min)" from "benzo administration (5–20 min)" per Glauser 2016 algorithm.
     - **A17** Lacosamide cardiac monitoring warning surfaced as a row-level safety note when lacosamide is selected.

   - **Patch 3 Class C-clinical prose/time labels:**
     - Stage time labels reconciled to Rubinos 2024 Fig 6-2 (Stage 2: 10–30 min; Stage 3: 30–60 min). Cite Vossler 2025 + Mullhi 2025 + Rubinos 2024 in disclaimer.
     - "Standard first-line (ESETT)" tag on levetiracetam → "ESETT-equivalent (lev/fos/VPA)" tag on all three.
     - Diazepam dose range widened to 0.15–0.2 mg/kg (was 0.15 only).

   - **Patch 4 new branches (Class E):**
     - **B1** Stage 4 super-refractory: transfer-to-tertiary-NCC + empiric immunotherapy / ketogenic / autoimmune workup options
     - **B2** NORSE/FIRES branch within Stage 3+
     - **B3** Eclampsia branch (pregnancy + seizure → magnesium 4 g IV load → 1 g/h)
     - **B4** Thiamine 100 mg IV + pyridoxine 100 mg IV empiric flags in stabilization

   - **Patch 5 citation registry:**
     - Add RAMPART (PMID 22335736), VA Cooperative SE (PMID 9738086), PHTSE (PMID 11547716), EcLiPSE (PMID 31005386), ConSEPT (PMID 31005385) to `src/lib/citations/registry.ts`. Verify ESETT entry (PMID 31774955) already present.

4. **UX workflow improvements** from SE UX audit (top 3 priorities):
   - **F-01 Persistent dose chip** — apply spec §4.8 (Dose result row) at the top of the active step. Computed dose stays visible without scrolling.
   - **F-05 Seizure onset time input** — add timestamp input at Stage 0 (stabilization); pathway auto-tracks minutes elapsed for stage transitions and displays it in the rail header.
   - **F-06 Benzo adequacy gate at Stage 2 entry** — confirm full weight-based first-line BZD dose was given before advancing. If under-dosed, surface a soft prompt "redose benzodiazepine first" before allowing Stage 2 escalation.
   - Apply spec §4.7 (Outcome row) at the end of each stage: "Seizures Stopped" / "Seizures Persist" buttons trigger either resolution or escalation.

5. **Apply round-7 a11y/mobile/UI consolidations** (same baseline as EVT rebuild): `text-slate-500` for readable text, 44×44 touch targets, `aria-live` cascade notice, `prefers-reduced-motion` guard, `:focus-visible` rings, completed rows as `<button>`.

6. **Quality gates** per CLAUDE.md §20: `tsc --noEmit`, `npm run build`, `npm run check:claims`, `npm run check:routes`, Gate 6 live-route verify post-deploy at `https://neurowiki.ai/pathways/se-pathway`.

7. **Commit + push** as one atomic change.

---

## Technical scaffold

**Files touched:**
- `src/pages/StatusEpilepticusPathway.tsx` — **full rewrite**
- `src/lib/citations/registry.ts` — add 5 trial citations + refresh `last_reviewed`
- `docs/specs/PATHWAY_SPEC.md` — §15 changelog bump (to v1.6 or v1.7 depending on EVT rebuild ordering)
- `src/pages/__tests__/StatusEpilepticusPathway.interpret.test.ts` — new (mirrors EVT test file)

**Files NOT touched:**
- Other pathways
- Trial data files
- Existing primitives in `src/components/pathways/` (consume only)

**Non-goals:**
- Do NOT extract a shared `usePathwayState` hook (per architect's ARCH-3 ruling on EVT — state shapes diverge per pathway).
- Do NOT add NORSE/FIRES full implementation; B2 lands as a routing card with outpatient/inpatient guidance — full NORSE workflow is a separate future task.
- Do NOT add pediatric-specific branching (pathway is adult-focused per Mullhi 2025; pediatric weight bands handled in calculateDose only).

**Primary agent:** `ui-architect` (file rewrite) + `medical-scientist` (clinical patches per fix manifest with verbatim citation preservation).

**Secondary at implementation:**
- `calculator-engineer` — `calculateDose` signature refactor to accept `patient` (Mullhi RAMPART scheme)
- `mobile-first-developer` — 44×44 + 375px sign-off
- `accessibility-specialist` — WCAG sign-off
- `content-writer` w/ `humanizer` — pearl prose + tooltip prose
- `quality-assurance` — gates 1–6

**Skills to load:**
- `design-tokens`, `accessibility-audit`, `humanizer`, `testing-patterns`, `engineering:code-review` (architect), `engineering:deploy-checklist` (QA)
- (No `stroke-guidelines` — SE uses different domain; reference Glauser/Vossler/Rubinos/Mullhi directly)

**Acceptance checks:**

1. `/pathways/se-pathway` renders and is interactive end-to-end (4 representative scenarios: refractory CSE Stage 3, NCSE-suspect route-out, pediatric IM midazolam fixed-dose, eclampsia magnesium branch).
2. All 24 fix-manifest items addressed (each with verbatim citation inline).
3. ESETT equivalence rewrite verified — `getRecommendedAgent` no longer presents agent hierarchy.
4. NCSE toggle removed; replaced with terminal route-out screen.
5. Lacosamide cap = 400 mg with pre-load ECG gate.
6. Stage 4 super-refractory branch present with NCC transfer guidance.
7. Spec §4.7 + §4.8 patterns implemented (Outcome row + Dose result row).
8. `tsc --noEmit` passes.
9. `npm run build` succeeds.
10. `npm run check:claims` passes (all clinical claims tagged per §13.4).
11. `npm run check:routes` passes (no route changes).
12. Gate 6 live verify passes.
13. Vitest unit test for `calculateLvoProtocol`-equivalent SE interpretation functions covering all 4 stages + comorbidity branches.
14. `last_reviewed: "2026-05-16"` refreshed on Glauser 2016 + Vossler 2025 + Rubinos 2024 + Mullhi 2025 citation records per §13.6.
15. Humanizer pass on all new prose; verbatim PDF clauses preserved.

**Clinical impact:** HIGH — both ship-blockers addressed. The "NCSE toggle does nothing" finding is particularly significant (it's a silent-mis-dosing bug, not a wrong-display bug).

**Rollback plan:**
- `git revert <merge-commit>`
- No data migration needed (stateless surface)
- If revert needed: `clinical-reviewer` + `system-architect` sign-off before re-enable

---

## Open question for V (asked already, pre-approved blanket)

V's pre-approval covers execution. The architect + clinical-reviewer gates run regardless.

---

## Status

Plan ready. Pending:
1. `system-architect` review (§17.1)
2. `clinical-reviewer` pre-execution gate (§17.2)
3. V's pre-approval covers post-gate execution
4. After both gates clear → dispatch implementation
