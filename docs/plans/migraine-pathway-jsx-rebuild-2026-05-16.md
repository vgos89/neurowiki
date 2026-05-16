# /build Plan — Migraine Pathway JSX Rebuild

**Date:** 2026-05-16
**Author:** orchestrator
**Class:** D-clinical with Class E aspects (multiple ship-blockers + new branches)
**Scope:** Rewrite `src/pages/MigrainePathway.tsx` using Pattern A primitives + new §4.9/§4.10 patterns, applying all 22 fix-manifest items in one atomic commit.

---

## English plan

1. **Replace `src/pages/MigrainePathway.tsx`** with a new implementation:
   - **Pattern A 7-step hybrid model** (per UX audit Pattern A verdict): differential-routing screen (§4.10) → red flag check → triage by oral tolerance → cocktail assembly with live summary (§4.9) → safety screening → response check → discharge planning.
   - **Reuse primitives from EVT rebuild** at `src/components/pathways/`.
   - **Cocktail step** uses category-row accordions (one row per drug family, doses in accordion) — preserves migraine's parallel-selection model.

2. **Apply all 22 fix-manifest items** from `docs/audits/2026-05-16/migraine-pathway-fix-manifest.md`:

   - **Patch 1 ship-blockers (Class E):**
     - **A1** Add GONB (Greater Occipital Nerve Block) as new Level A "Must Offer" branch. State field: `gonb: boolean` on `AddOnsState`. Rendered as a category row with `Yes / No` outcome (1 mL of 1% lidocaine or 0.5% bupivacaine per side).
     - **A2** Flip antiemetic default from `metoclopramide` → `prochlorperazine` at `:123`, `:229`, `:502`. Rewrite descriptions at `:516–518` to reflect Robblee 2025 Level A.

   - **Patch 2 Class E doses:**
     - **A3** Ketorolac type: `'15' | '30' | '60'` (drop 45 mg — non-standard ED dose; replace with 60 mg per Robblee 2025 Level B ceiling).
     - **A4** Dexamethasone type: `'8' | '10' | '16'` (drop 4 mg — sub-therapeutic per Robblee Table 2 range 8–16 mg).
     - **A6** Valproate type: `'500' | '800' | '1000'` (replace unused 750 with 800 mg — Robblee notes ≥800 mg may perform better).

   - **Patch 3 Class C-clinical framing:**
     - **A5** Sumatriptan-in-pregnancy: downgrade hard-disable to WARNING with rescue-indication note (Burch 2024 Table 3-5: triptans first-line for rescue in pregnancy). Three-way render at `:603` parallel to magnesium warning at `:619`.
     - **A8 / B6 / B7** Disclaimer citation refresh: cite Robblee 2025 (*Headache* 2026;66:53–76, DOI 10.1111/head.70016) + AHS 2021 Consensus (Ailani et al.) + relevant Continuum 2024 chapters.

   - **Patch 4 new branches (Class E):**
     - **B1 Cluster-headache branch** — phenotype check (autonomic features + restlessness + 15–180 min unilateral) → Drawer State C terminal with verbatim cards: O2 6–12 L/min via NRB + SC sumatriptan 6 mg + zolmitriptan nasal 5–10 mg (Burish 2024 Grade A).
     - **B2 MOH discharge screen** — Step 5 check: ≥15 HA days/month + acute med use >10 days/month (triptan/opioid/combo/ergot) OR >15 days/month (simple analgesic) for >3 months → outpatient prevention + headache neurology referral.
     - **B5 Second-line rescue expansion** — add chlorpromazine 12.5–25 mg IV (Robblee Level C with hypotension/HTN gate), GONB-as-rescue, DHE-IV admit trigger (Burch p.360; gated by triptan-24h + cvRisk + pregnant).
     - **A7** Second-line rescue logic expansion to surface the above.

   - **Patch 5 differential route-outs (Class D-clinical, terminal cards):**
     - **B3 Indomethacin-responsive headache flag** (paroxysmal hemicrania / hemicrania continua) → outpatient indomethacin trial protocol (25→50→75 mg TID with PPI).
     - **B4 Trigeminal-neuralgia route-out** → carbamazepine 300–800 mg/day + opioid-avoidance note + outpatient neurology referral.
     - **B8** Apply spec §4.10 (Differential routing) at Step 0 to host B1 / B3 / B4 / B2-front.

3. **UX workflow improvements** from Migraine UX audit:
   - **Priority 1: Live cocktail summary in drawer** — apply spec §4.9. As clinician picks drugs across the cocktail step, the running list lives in the drawer State B (computing). Tap a chip to edit. Copy-all button generates clipboard-ready order set.
   - **Priority 2: Antiemetic default flip** (covered in Patch 1 A2) + Level A/B evidence badges visible on each drug row.
   - **Priority 3: Replace `alert()` on copy** with subtle toast notification (Class B one-liner).
   - **Priority 4: Pattern A 7-step rebuild** (the rewrite itself).
   - **Priority 5: GONB Level A** (covered in Patch 1 A1).
   - **Priority 6: Differential routing screen** (covered in Patch 5 B8 via spec §4.10).
   - **Color migration: `indigo-*` → `neuro-*` throughout** (9 spec-violation findings) — purple tokens replaced with site's cobalt brand.

4. **Apply round-7 a11y/mobile/UI consolidations** (baseline from EVT): `text-slate-500` for readable text, 44×44 touch targets, `aria-live` cascade notice, `prefers-reduced-motion` guard, `:focus-visible` rings, completed rows as `<button>`, header `max-w-2xl` (not `max-w-3xl`), drop fixed bottom footer bar.

5. **Quality gates** per CLAUDE.md §20: tsc, build, claims hook, route validator, Gate 6 live verify at `https://neurowiki.ai/pathways/migraine-pathway`.

6. **Commit + push** as one atomic change.

---

## Technical scaffold

**Files touched:**
- `src/pages/MigrainePathway.tsx` — **full rewrite**
- `src/lib/citations/registry.ts` — add Robblee 2025 + AHS 2021 Consensus + Continuum 2024 chapters
- `docs/specs/PATHWAY_SPEC.md` — §15 changelog bump
- `src/pages/__tests__/MigrainePathway.interpret.test.ts` — new

**Files NOT touched:**
- Other pathways
- Trial data files
- Existing primitives in `src/components/pathways/` (consume only)

**Non-goals:**
- Do NOT implement full cluster-headache workflow — B1 lands as a Drawer State C terminal card with the O2/SC sumatriptan/intranasal zolmitriptan triad and an outpatient-headache-neurology referral. Full cluster pathway = future task.
- Do NOT implement SUNCT/SUNA, paroxysmal hemicrania, hemicrania continua, or trigeminal neuralgia as full pathways. They land as terminal route-out cards.
- Do NOT add preventive migraine treatment selection (gepants for prevention, CGRP mAbs, anti-CGRP) — that's the Lipton 2024 chapter, outpatient-prevention, out of scope.
- Do NOT introduce pediatric migraine branching — adult pathway only (matches dossier scope).

**Primary agents:** `ui-architect` + `medical-scientist`. **Secondary:** `mobile-first-developer`, `accessibility-specialist`, `content-writer` w/ `humanizer`, `quality-assurance`.

**Skills to load:** `design-tokens`, `accessibility-audit`, `humanizer`, `testing-patterns`, `engineering:code-review`, `engineering:deploy-checklist`. (No `stroke-guidelines` — migraine uses headache-domain references directly: Robblee 2025, AHS 2021, Continuum 2024.)

**Acceptance checks:**

1. `/pathways/migraine-pathway` renders and is interactive end-to-end (5 representative scenarios: standard cocktail Eligible, cluster route-out with O2 card, MOH discharge screen, pregnancy-rescue triptan warning, GONB rescue path).
2. All 22 fix-manifest items addressed.
3. GONB Level A branch present with state + dose + safety gates.
4. Antiemetic default = prochlorperazine.
5. Indigo tokens fully replaced with neuro tokens.
6. `alert()` replaced with toast.
7. Spec §4.9 (Live cocktail summary in drawer State B) + §4.10 (Differential routing Step 0) implemented.
8. Test file covers cocktail assembly, safety-state cascades (existing strong UX preserved), differential-routing terminals.
9. `tsc --noEmit` + build + claims + routes + Gate 6 all pass.
10. `last_reviewed: "2026-05-16"` on Robblee 2025 + AHS 2021 + Continuum 2024 records per §13.6.
11. Humanizer pass on all new prose; verbatim AHS/Robblee phrases preserved.
12. Cluster terminal card content verbatim from Burish 2024 Grade A recommendations.

**Clinical impact:** HIGH — patient-safety-significant for two reasons: (a) GONB Level A "Must Offer" is currently not on offer, (b) cluster patients routed through migraine miss Level A oxygen.

**Rollback plan:**
- `git revert <merge-commit>`. Stateless. Clean.

---

## Status

Plan ready. Pending:
1. `system-architect` review (§17.1)
2. `clinical-reviewer` pre-execution gate (§17.2)
3. V's pre-approval covers post-gate execution
4. After both gates clear → dispatch implementation
