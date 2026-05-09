# Clinical Review — Full-Repo Audit

**Reviewer:** clinical-reviewer (claude-sonnet-4-6)  
**Date:** 2026-05-08  
**Scope:** Full-repo clinical safety audit (read-only). No files modified.  
**Decision:** approve-with-conditions — content is acceptable to keep shipped; new clinical content is blocked until citation registry ships or an interim sign-off path is explicitly documented.

## Overall Clinical Safety Rating: YELLOW

Content is largely clinically sound. The dominant risk is not individual bad claims but systematic absence of the citation governance infrastructure described in CLAUDE.md §13. All clinical content is ungoverned from a claim-mapping standpoint.

---

## Surfaces Reviewed

- `src/data/strokeClinicalPearls.ts`
- `src/data/guideContent.ts`
- `src/pages/guide/IvTpa.tsx` (head section)
- `src/data/ichScoreData.ts`
- `src/data/abcd2ScoreData.ts`
- `src/data/trialData.ts` (sample `bottomLine` fields)
- `src/data/aha2026StrokeGuideline.ts`
- `src/pages/EvtPathway.tsx` (head + disclaimer)
- `src/lib/citations/claims.ts`

---

## P0 — Claims Governance Gap (System-Wide)

**File:** `src/lib/citations/claims.ts`  
**Finding:** `CLAIM_REGISTRY` is an empty stub (`{}`). `registry.ts` does not exist. No `data-claim` attributes in JSX. Inline `/* claimId: */` comments in `trialData.ts` reference IDs that point nowhere. The entire §13.1–13.7 governance loop is non-functional.

**Clinical risk:** No automatic detection if (a) a claim's wording drifts from its source, (b) a `last_reviewed` window expires, or (c) a guideline supersedes a citation. CLAUDE.md §13.1 explicitly warns that hook-passing ≠ medically correct — right now the hook passes trivially because nothing is registered.

**Required actions before any new clinical content ships:**
1. State explicitly in `TASKS.md` that the claim registry is unimplemented and that all clinical edits require manual `medical-scientist` + `clinical-reviewer` sign-off via §17.2 artifact in lieu of automated checks.
2. Open a Class D-clinical task to populate `registry.ts` and migrate inline `claimId:` comments.
3. Until then, treat any `-clinical` PR as `blocked:awaiting-scanner-support` unless a full §17.2 clinical review artifact is written.

---

## P1 — Unsafe / Overconfident Clinical Claims

### F1. NINDS pearl — Part 2 caveat missing; editorial flourish as clinical fact (P1)
**Location:** `strokeClinicalPearls.ts:96–110`  
42.6% vs 27.2% favorable outcome presented without "Part 2 (efficacy cohort)" qualifier. sICH 6.4% without definitional window (symptomatic within 36h). "Still the foundation of acute stroke care" is editorial, tagged as evidence level A.  
**Action:** Add Part 2 qualifier; specify sICH window; move editorial language to commentary.

### F2. "Time Is Brain" neuron-loss and 4% delay figures presented as measured constants (P1)
**Location:** `strokeClinicalPearls.ts:48`, `:86–92`  
"1.9 million neurons die per minute" (Saver 2006 — model-derived, not measured). "Every 15-minute delay reduces probability by 4%" (Meretoja 2014 — pooled data, specific window only). Both stated as universal biological facts.  
**Action:** Attribute and add modeling caveat.

### F3. Stroke mimics pearl — "When in doubt, treat" exceeds AHA/ASA scope (P1)
**Location:** `strokeClinicalPearls.ts:189–198` (`stroke-mimics-safety`)  
"Don't delay tPA for extensive workup if stroke is likely" + "When in doubt, treat" are stronger than AHA/ASA which says "should not delay treatment to obtain ancillary testing in suspected mimics" — a narrower scope.  
**Action:** Soften to "do not delay tPA to rule out a mimic when stroke is the leading diagnosis." Remove imperative "treat."

### F4. DOAC pearl — Class III tag incompatible with permissive recommendation (P1) — BLOCK
**Location:** `strokeClinicalPearls.ts:166–176` (`doac-management-2026`)  
Pearl says *"may consider tPA"* if last dose >48h + normal renal function + normal drug-specific assays. Tags `evidenceClass: 'III'`. Class III means "no benefit" or "harm" — incompatible with a permissive recommendation. This is internally contradictory and would display an incorrect evidence badge to clinicians.  
**Action (block-level):** Re-tag — almost certainly Class IIb, Level C. Verify against AHA/ASA 2026 §4.6.

### F5. Pregnancy pearl — tiny case series presented with misleading precision (P1)
**Location:** `strokeClinicalPearls.ts:200–209`  
"~15 pregnant women treated, 2 sICH (13%), 8 healthy births (67%)" — presents case-series denominators as rate estimates.  
**Action:** Replace with "limited case-series data" and note n is too small for reliable rate estimation.

### F6. ECASS-III/3–4.5h window pearl — vague guideline attribution (P1)
**Location:** `guideContent.ts:59`  
"modern guidelines often permit treatment in these groups within 3-4.5h after individual risk assessment" — no named guideline, no jurisdiction, no version.  
**Action:** Replace with named 2026 AHA/ASA reference and the specific position on each ECASS-III exclusion carve-out.

---

## P1 — Calculator Safety Language

### F7. ICH Score — 100% mortality headline without sample-size badge (P2)
**Location:** `ichScoreData.ts:185`  
Score 5 and 6 display "100%" without inline small-sample badge. The comment notes score 5 = n=1 in derivation cohort and score 6 = extrapolated. A bedside user reading "100% 30-day mortality" may communicate this as deterministic.  
**Action:** Add small-sample badge ("n=1 derivation", "extrapolated") on the result card, not only in the drawer.

### F8. ABCD2 — tier-collapsing hides within-tier gradient; missing discrimination caveat (P1)
**Location:** `abcd2ScoreData.ts:56–60`, `:95–99`  
Three-tier risk values (1.0/4.1/8.1%) hide per-score gradient. Drawer text does not note ABCD2 has been criticized for poor discrimination (Wardlaw 2015) and AHA/ASA now favors urgent evaluation for all TIA regardless of score.  
**Action:** (a) Display per-score risk. (b) Add one-line caveat that ABCD2 has limited discrimination and does not replace urgent vascular workup.

### F9. Bare percentage headline stats — ambiguous without metric name (P2)
**Location:** `ichScoreData.ts:185` (`stat: \`${mortality}%\``), `abcd2ScoreData.ts:137`  
Headline stat renders as bare percentage ("72%", "8.1%") without metric label in the stat string itself.  
**Action:** Append metric to stat: "72% 30-day mortality" / "8.1% 2-day stroke risk."

### F10. Disclaimer uniformity across calculators (P2)
Some calculators include per-result disclaimer; global DisclaimerModal is one-time-accept. A clinician using the app months after accepting the modal may have no disclaimer visible at the bedside.  
**Action:** Audit every calculator for an in-result-card disclaimer; standardize wording.

---

## P1 — Trial Conclusion Wording

### F11. EXTEND, EAGLE, CHOICE bottomLines — appropriately hedged (Pass)
No action needed.

### F14. ESCAPE, EXTEND-IA, SWIFT PRIME — early-stopping bias caveat missing (P2)
**Location:** `trialData.ts:1101` (ESCAPE), `:1354` (EXTEND-IA), `:1468` (SWIFT PRIME)  
Large effect sizes with notation "stopped early" but no early-stopping bias caveat (Bassler 2010: trials stopped early may overestimate effect).  
**Action:** Add one caveat sentence noting that early-stopped trials may overestimate effect size.

---

## P1 — Guideline Recency

### F17. AHA/ASA 2026 file — content accuracy confirmed (Pass)
COR/LOE structure, IVT agent equivalence, BP thresholds, CMB tiers, COR 3:Harm for intensive BP post-EVT — all match known 2026 positions.  
**Caveat:** DOI `10.1161/STR.0000000000000513` may be a placeholder shared with the 2019 update. Verify resolution before citing.

### F19. Door-to-needle: IvTpa.tsx says <45 min; pearls say <60 min (P2)
**Location:** `IvTpa.tsx:38` vs `strokeClinicalPearls.ts:48`, `:336`  
Internal drift — same metric stated differently on the same clinical surface.  
**Action:** Pick one source of truth and propagate. If 45 min reflects 2026 update, update pearls.

---

## P1 — Missing Contraindication Caveats

### F20. IvTpa.tsx page lead — no contraindication preview above the fold (P2)
**Location:** `IvTpa.tsx:33–46`  
Dosing introduced without contraindication callout. Clinician landing on this page directly does not see absolute contraindications above the fold.  
**Action:** Add "see absolute contraindications below" callout near dosing block.

### F21. Tenecteplase "preferred for LVO" — recommendation-strength drift from AHA/ASA 2026 (P1) — BLOCK
**Location:** `IvTpa.tsx:62`  
"Non-inferior to alteplase; preferred for LVO when transferring for thrombectomy." AHA/ASA 2026 states equivalent first-line, not preferred. This is a never-drift category 1 violation (recommendation strength upgrade).  
**Action:** Change to "equivalent first-line per AHA/ASA 2026; commonly used for LVO transfer because of single-bolus convenience."

---

## EVT Pathway

### F22. ASPECTS thresholds and large-core evidence (Provisional Pass)
Status flag taxonomy (EVT Reasonable / BMT Preferred / High Uncertainty / Avoid EVT) signals appropriate hedging. Full decision logic not audited without reading the full 1,500+ line file. Provisional pass pending medical-scientist review.

### F23. EVT pathway disclaimer — appropriate (Pass)
"Decision Support Only. Always discuss with Vascular Neurology and the Neurointerventional team." Correct.

### F24. ESCAPE-MeVO / DISTAL synthesis wording (P2)
Population gap between the two trials (different occlusion sites, different reperfusion rates) is not visible in the synthesis. Acceptable, but flag for medical-scientist sign-off.

---

## Items that Must Be Resolved Before Any New Clinical Content Ships

**Block:**
1. **F4** — DOAC pearl Class III tag internally contradictory; will display wrong evidence badge. Re-tag immediately.
2. **F21** — Tenecteplase "preferred" wording exceeds AHA/ASA 2026 scope. Fix immediately.
3. **F1, F3, F6** — Three pearl-level wording violations (action verb, certainty, qualifier). Fix as Class C-clinical batch.
4. **Governance gap** — Every new clinical PR must carry a manual `clinical-PR<#>-<slug>.md` artifact until `registry.ts` ships.

**Approve with conditions (fix before next major content cycle):**
- F8, F9, F10 (calculator hedging and disclaimer uniformity)
- F14, F15 (early-stopping bias caveats)
- F19 (door-to-needle internal consistency)
- F20 (contraindication preview)

**Pass / no action:**
- ICH Score hedging (F7 aside from badge)
- EXTEND, EAGLE, CHOICE bottomLines
- AHA 2026 guideline content
- tPA window consistency (F18)
- EVT pathway disclaimer (F23)
