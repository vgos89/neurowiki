# Evidence Packet — Per-Arm Protocol Enrichment from Primary PDFs (5 pilot trials)

**Verifier:** evidence-verifier (Opus 4.8) · **Date:** 2026-06-08 · **Skill:** clinical-trial-audit
**Source:** Primary publication PDFs supplied by V (NINDS 1995, ECASS III 2008, ESCAPE 2015, DEFUSE-3 2018, DAWN 2018) — authoritative over the ClinicalTrials.gov terse arm labels used in the first pass.
**Scope:** Enrich `armDetails` (both arms; control arms were too thin) · verify eligibility vs papers (no rewrites) · resolve ESCAPE primary statistic · verify NINDS (Medium→High).
**Confidence:** HIGH for all five (page-cited transcription). Read-only; `medical-scientist` persists, `clinical-reviewer` gates.

> Cross-cutting: this packet enriches `armDetails` ONLY. Existing `fullEligibility`, `stats`, `effectSize`, `ordinalStats`, and interpretation text are NOT changed by the enrichment. The ESCAPE statistic (Task C) is a labeling clarification of an already-correct value, held for V sign-off — not shipped with the arm enrichment.

---

## TASK A — Enriched `armDetails[]` per trial (ready to transcribe)

### 1. NINDS (`ninds-trial`) — NEJM 1995 pp. 1581–1583
```ts
armDetails: [
  {
    arm: "IV Alteplase (t-PA)",
    role: "intervention",
    agent: "Alteplase (Activase, Genentech) — recombinant tissue plasminogen activator (t-PA)",
    dose: "0.9 mg/kg (maximum 90 mg)",
    route: "IV",
    frequency: "10% of the total dose as an IV bolus, then the remaining 90% as a constant IV infusion",
    duration: "60-minute infusion (remainder after bolus)",
    coInterventions: "Best medical care; protocol prohibited anticoagulants AND antiplatelet agents for 24 hours after treatment; blood pressure maintained within prespecified limits",
    note: "Dose/administration verbatim from NINDS NEJM 1995 p.1582 (Randomization and Treatment). Two-part design: Part 1 (n=291) and Part 2 (n=333); 624 total. The mandatory 24-h antithrombotic prohibition and BP control originated in this protocol. No NCT (1995 predates registry).",
  },
  {
    arm: "Placebo",
    role: "comparator",
    agent: "Matching placebo (supplied by Genentech)",
    dose: "Volume-matched to alteplase",
    route: "IV",
    frequency: "Identical 10% bolus then constant-infusion schedule",
    duration: "60-minute infusion",
    coInterventions: "Best medical care; identical 24-hour prohibition of anticoagulants and antiplatelet agents; same BP control",
    note: "Double-blind, placebo-controlled, 1:1, permuted-block randomization stratified by center and onset-to-treatment time (0–90 vs 91–180 min). Source: NINDS NEJM 1995 p.1582.",
  },
],
```

### 2. ECASS III (`ecass3-trial`) — NEJM 2008 pp. 1317–1320
Genuine enrichment: the **DVT-prophylaxis SC-heparin allowance** + full prohibited-concomitant list.
```ts
armDetails: [
  {
    arm: "IV Alteplase (rt-PA)",
    role: "intervention",
    agent: "Alteplase (Actilyse, Boehringer Ingelheim) — rt-PA",
    dose: "0.9 mg/kg (upper limit 90 mg)",
    route: "IV",
    frequency: "10% of the total dose as an IV bolus, then the remainder as a continuous IV infusion",
    duration: "60-minute infusion (remainder after bolus)",
    coInterventions: "Best medical care. For the first 24 h after study-drug completion, IV heparin, oral anticoagulants, aspirin, and volume expanders (hetastarch/dextrans) were prohibited; subcutaneous heparin ≤10,000 IU (or equivalent LMWH) was permitted for DVT prophylaxis.",
    note: "Dose/administration from Hacke NEJM 2008 p.1318–1319; concomitant-therapy rules from p.1320 (Concomitant Therapies). Block-of-four randomization via interactive voice system. Time window extended 3–4 h to 3–4.5 h by a May-2005 protocol amendment.",
  },
  {
    arm: "Placebo",
    role: "comparator",
    agent: "Matched placebo",
    dose: "Volume-matched to alteplase",
    route: "IV",
    frequency: "Identical bolus-then-infusion schedule",
    duration: "60-minute infusion",
    coInterventions: "Best medical care; same 24-hour prohibition (IV heparin, oral anticoagulants, aspirin, volume expanders) with the same SC-heparin DVT-prophylaxis exception",
    note: "Double-blind, parallel-group, 1:1. Source: Hacke NEJM 2008 p.1318–1320; CT.gov NCT00153036.",
  },
],
```

### 3. ESCAPE (`escape-trial`) — NEJM 2015 pp. 1019–1026 — HIGHEST-PRIORITY CONTROL ARM
```ts
armDetails: [
  {
    arm: "Rapid endovascular treatment + guideline-based care",
    role: "intervention",
    agent: "Mechanical thrombectomy with available thrombectomy devices. Retrievable (stent) retrievers were recommended; suction through a balloon guide catheter in the relevant ICA during thrombus retrieval was also recommended.",
    route: "Endovascular",
    frequency: "Single procedure preceded by cerebral angiogram. Workflow targets: study NCCT-to-groin-puncture ≤60 min; study NCCT-to-first-reperfusion (first reflow in the MCA) ≤90 min.",
    duration: "One-time procedure",
    coInterventions: "Guideline-based medical care, including IV alteplase within 4.5 h of onset if local guideline criteria were met (given in BOTH arms). General anesthesia was discouraged.",
    note: "Technique + workflow targets from Goyal NEJM 2015 p.1021 (Treatments / Participants). In practice: retrievable stents used in 130/151 (86.1%) procedures; of those, 100 (77.0%) Solitaire (Covidien); GA in 9.1%. Device-agnostic — no single brand mandated.",
  },
  {
    arm: "Guideline-based care (control)",
    role: "control",
    agent: "Current standard of care per Canadian or local acute-stroke management guidelines (no protocol-mandated thrombectomy)",
    route: "Medical",
    coInterventions: "Guideline-based medical care, including IV alteplase within 4.5 h of onset if local guideline criteria were met (given in BOTH arms)",
    note: "Control = current standard of care per Canadian/local acute-stroke guidelines (Goyal NEJM 2015 p.1021). Granular control-arm medical management (BP, glucose, antithrombotic) is in the Supplementary Appendix — see appendix-gap flag. IV alteplase actually given: control 78.7%, intervention 72.7% (Table 1). 18/150 control patients crossed over to EVT.",
  },
],
```
**APPENDIX-GAP (ESCAPE):** main text defers control-arm BP/glucose/antithrombotic targets to the Supplementary Appendix Methods. Not fabricated. Request the ESCAPE appendix for that granularity.

### 4. DEFUSE-3 (`defuse-3-trial`) — NEJM 2018 pp. 708–714
```ts
armDetails: [
  {
    arm: "Endovascular thrombectomy + standard medical therapy",
    role: "intervention",
    agent: "Thrombectomy with any FDA-approved thrombectomy device, at the neurointerventionalist's discretion. Carotid angioplasty ± stenting permitted for cervical ICA atherosclerotic stenosis/occlusion.",
    route: "Endovascular",
    frequency: "Single procedure, 6–16 h from last-known-well. Protocol required femoral puncture within 90 minutes after the end of qualifying imaging. General anesthesia discouraged. Intra-arterial t-PA not allowed.",
    duration: "One-time procedure",
    coInterventions: "Standard medical therapy per current AHA guidelines (BOTH groups). IV t-PA allowed only if begun within 4.5 h of onset.",
    note: "Technique, 90-min puncture target, GA-discouraged, no-IA-tPA, and AHA-guideline medical therapy in both groups from Albers NEJM 2018 p.710. Technical success = TICI 2b/3.",
  },
  {
    arm: "Standard medical therapy alone (control)",
    role: "control",
    agent: "Standard medical therapy per current AHA guidelines (no thrombectomy)",
    route: "Medical",
    coInterventions: "Standard medical therapy per current AHA guidelines (BOTH groups). IV t-PA allowed only if begun within 4.5 h of onset.",
    note: "Control = AHA-guideline standard medical therapy (Albers NEJM 2018 p.710). IV t-PA use low (intervention 11%, control 9%; Table 1). Source: NCT02586415.",
  },
],
```
**APPENDIX-GAP (DEFUSE-3):** body cites AHA guidelines generally; specific BP/glucose targets not enumerated in main text.

### 5. DAWN (`dawn-trial`) — NEJM 2018 pp. 11–21
```ts
armDetails: [
  {
    arm: "Trevo thrombectomy + standard medical care",
    role: "intervention",
    agent: "Trevo device (Stryker Neurovascular) — retrievable self-expanding stent retriever",
    route: "Endovascular (mechanical thrombectomy)",
    frequency: "Single procedure. Rescue reperfusion with OTHER devices or pharmacologic agents was not permitted. Concomitant cervical-ICA stenting not permitted; carotid angioplasty permitted only if needed for access.",
    duration: "One-time procedure",
    coInterventions: "Standard medical care per local guidelines (both arms). Patients NOT treated with IV alteplase could receive antiplatelet agents, startable within 24 h after randomization.",
    note: "Device, rescue-prohibition, stenting rules from Nogueira NEJM 2018 p.13 (Treatment). In practice 102/105 Trevo-only; GA 10%; mTICI 2b/3 success 84% (central)/82% (local). Trevo-only by protocol — does not generalize to other stent retrievers.",
  },
  {
    arm: "Standard medical care alone (control)",
    role: "control",
    agent: "Standard medical care per local guidelines (no thrombectomy; no intra-arterial therapy)",
    route: "Medical",
    coInterventions: "Standard medical care per local guidelines. Patients NOT treated with IV alteplase could receive antiplatelet agents, startable within 24 h after randomization.",
    note: "Control standard-care detail deferred to Suppl. Appendix Section S6 (Nogueira NEJM 2018 p.13). The antiplatelet-within-24-h allowance for non-alteplase patients IS in the main text. IV alteplase use low (intervention 5%, control 13%; Table 1). Source: NCT02142283.",
  },
],
```
**APPENDIX-GAP (DAWN):** control "standard medical care" specifics in Suppl. Appendix S6.

---

## TASK B — Eligibility verified against papers (NO rewrites needed)
No material conflicts in any of the five. The existing `fullEligibility` (registry/publication-sourced) stays verbatim. Two documented notes:
- **ESCAPE:** repo "NIHSS >5" is the protocol/registry definition of "disabling"; the NEJM body defines eligibility as "disabling ischemic stroke, Barthel ≥90" without a numeric NIHSS in the PARTICIPANTS paragraph. Not a conflict — registry text is correct and stays. Provenance note only.
- **DEFUSE-3 / DAWN:** body defers full enumerated criteria to the Supplementary Appendix; the CT.gov-sourced `fullEligibility` is consistent with the paper's stated core criteria. No conflict.

---

## TASK C — ESCAPE primary statistic (RESOLVED — premise was inverted)
**Source: ESCAPE / Goyal NEJM 2015 — PRIMARY OUTCOME text p.1024 + Table 2 p.1025 + SAP p.1022.**

- SAP p.1022 verbatim: "The primary analysis was unadjusted and was performed in the intention-to-treat population."
- Primary-outcome text p.1024 verbatim: "a common odds ratio … of 2.6 (95% confidence interval [CI], 1.7 to 3.8) favoring the intervention (P<0.001)."
- Table 2 p.1025: **Unadjusted (PRIMARY) common OR = 2.6 (1.7–3.8)**; **Adjusted (secondary) common OR = 3.1 (2.0–4.7)**.

**Therefore the repo's displayed `effectSize: 'OR 2.6'` / `ordinalStats { 2.6, 1.7, 3.8 }` / `howToInterpret.proves` are ALREADY CORRECT as the pre-specified primary.** The earlier flag (and WikiJournalClub's "3.1") was the *adjusted/secondary* estimate. **Do NOT swap 2.6 → 3.1.**

**Held for V sign-off (not shipped with arm enrichment):** the only worthwhile change is a clarifying label — annotate the 2.6 as "unadjusted, pre-specified primary" and optionally record the adjusted 3.1 (2.0–4.7) as the labeled secondary — to prevent a future editor from "correcting" it the wrong way. No displayed value changes.

Supporting secondary figures (confirmed, p.1024–1025): mRS 0–2 53.0% vs 29.3% (RR 1.8, 1.4–2.4); mortality 10.4% vs 19.0% (RR 0.5, 0.3–1.0, P=0.04); sICH 3.6% vs 2.7% (P=0.75); median CT-to-reperfusion 84 min.

---

## TASK D — NINDS verification (Medium → HIGH)
All `fullEligibility` items and per-arm dosing confirmed verbatim against NINDS NEJM 1995 p.1582 ("Selection of Patients" + "Randomization and Treatment"). Dose 0.9 mg/kg (max 90 mg), 10% bolus + 60-min infusion: exact. 24-h prohibition of anticoagulants AND antiplatelet agents + BP control: exact. 13/13 exclusion items and 4/4 inclusion items map to the paper. Primary endpoint (global statistic across 4 scales, global OR 1.7) already correctly documented in the repo. **NINDS upgraded Medium→High; no rewrites.**

---

## §8 editorial context
Not re-triggered: this is per-arm protocol enrichment of long-shipped entries, not a new-trial entry or Class E logic change (no primary result/endpoint/framework/guideline-class field changed; ESCAPE item confirms an existing value). Explicitly stated per the block condition rather than silently omitted.

## Persist plan
`medical-scientist`: replace `armDetails` on the 5 keys with the Task A blocks; do NOT touch eligibility/stats/interpretation. `clinical-reviewer` gates (-clinical). ESCAPE statistic label change held separately for V sign-off.
