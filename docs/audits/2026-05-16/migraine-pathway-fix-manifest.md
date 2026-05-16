# Migraine Pathway — Final Fix Manifest (PDF-verified)

**Date:** 2026-05-16
**Author:** medical-scientist
**Inputs:** PDF-verified dossier (highest authority), source code, EVT manifest precedent
**Output mode:** Persistent markdown work-order; no source code edited in this task
**Authority sources (latest-wins):**
- **Robblee J, Minen MT, Friedman BW, et al.** 2025 guideline update to acute treatment of migraine for adults in the ED. *Headache* 2026;66:53–76. DOI 10.1111/head.70016. **WINS for ED parenteral.**
- **Ailani J, Burch RC, Robbins MS.** AHS Consensus Statement: Update on integrating new migraine treatments. *Headache* 2021;61:1021–1039. DOI 10.1111/head.14153. **WINS for outpatient acute.**
- Burch 2024 *Continuum* 30(2):344–363 (acute), Burish 2024 30(2):391–410 (cluster), Rizzoli 2024 30(2):379–390 (MOH), Goadsby 2024 30(2):488–497 (indomethacin), Nahas 2024 30(2):473–487 (neuralgias).

---

## Executive summary

- **22 fixes total.** 12 re-graded from the dossier audit grid + 10 net-new items derived from dossier nuances and missing differential branches (Section 6 of dossier).
- **2 of 22 are HIGH-severity ship-blockers** — (1) Greater Occipital Nerve Block (Robblee 2025 Level A) is entirely missing from the pathway; (2) default antiemetic is inverted (metoclopramide chosen as default; Robblee 2025 elevates **prochlorperazine to Level A — Must Offer**, metoclopramide stays Level B — Should Offer).
- **5 MEDIUM-severity items** — ketorolac dose ceiling (45 → 60 mg), dexamethasone low-dose option (4 → 8 mg), sumatriptan-in-pregnancy hard-disable inverted (Burch 2024: triptans are **first-line rescue** in pregnancy), second-line rescue incomplete (missing chlorpromazine IV, DHE IV, GONB-as-rescue), cluster-headache differential routing absent.
- **5 LOW-severity items** — valproate 800 mg option absent, MOH discharge screen absent, indomethacin-trial flag absent, trigeminal-neuralgia route-out absent, disclaimer citation stale.
- **Top 3 most consequential (patient-safety first):**
  1. **Finding A1 (HIGH, ship-blocker):** Add Greater Occipital Nerve Block (GONB) as a **Level A — Must Offer** acute-treatment branch. Three Class I sham-controlled trials in Robblee 2025 elevate GONB from any prior tier to Level A. Zero mention in pathway.
  2. **Finding A2 (HIGH, ship-blocker):** Invert antiemetic default from metoclopramide to **prochlorperazine**. Robblee 2025 Table 3: prochlorperazine 10–12.5 mg IV is **Level A — Must Offer**; metoclopramide 10 mg IV is Level B — Should Offer. The current default contradicts the newest formal AHS CPG.
  3. **Finding A5 (MEDIUM):** Sumatriptan-in-pregnancy hard-disable is over-restrictive. Burch 2024 Table 3-5 lists triptans as **first-line for rescue** in pregnancy. Downgrade to WARNING with explicit rescue-indication note.

---

## Method

1. Read the PDF-verified dossier (Section 1 A–J, Section 4 audit grid, Section 5 severity-ordered findings, Section 6 differential branch recommendations).
2. Opened `src/pages/MigrainePathway.tsx` and located each offending string/state/line for the 12 audit-grid items.
3. For dossier Section 6 differential branches (B1–B4), determined whether the branch should be a new state field, a new card in an existing step, or a new step.
4. Produced concrete patch instructions (replace-this-with-that, add-new-branch, change-default) per item.
5. Tagged each item with severity, CLAUDE.md §6 class (B / C-clinical / E), and ship-blocker status.

---

## Part A — Re-graded findings from dossier audit grid

### Finding A1 — Greater Occipital Nerve Block (GONB) Level A — MISSING (NEW BRANCH)

- **Dossier severity:** HIGH
- **Dossier verdict:** Robblee 2025 Table 3 elevates GONB to **Level A — Must Offer** on three Class I sham-controlled studies. Zero mention in current pathway.
- **Final severity:** HIGH (ship-blocker)
- **Location in code:** Not present. Must be added to Step 3 (Acute Treatment) as a new card, ideally as a parallel option to the IV cocktail OR as a "Procedural Rescue" card alongside Sumatriptan SC in the First-Line Add-Ons block.
- **Verbatim authority (Robblee 2025 Table 3):** *"Greater occipital nerve block (GONB) 0.5–3 mL of 0.5% bupivacaine or 1% lidocaine — Level A: Must Offer."*
- **Concrete patch instructions:**
  - **Add** a new state field on the `AddOnsState` interface (or a parallel `ProceduralState`): `gonb: boolean`.
  - **Add** a new card in the First-Line Add-Ons block of Step 3 (after `src/pages/MigrainePathway.tsx:611`, before the Magnesium card at `:614`). Suggested replacement string for the card body:
    > **Greater Occipital Nerve Block (GONB)**
    > 0.5–3 mL of 0.5% bupivacaine OR 1% lidocaine, ipsilateral to pain side.
    > **Robblee 2025 Level A — Must Offer.** Effective for both migraine and cluster.
  - **Eligibility logic:** no absolute contraindications relevant to this pathway. Add a soft warning if `safety.pregnant === true` and bupivacaine selected (lidocaine preferred in pregnancy per Burch Table 3-5).
  - **Add to** `generateSummary()` in `:235–271`: `if (firstLineAddOns.gonb) lines.push("- Greater Occipital Nerve Block: 0.5–3 mL 0.5% bupivacaine OR 1% lidocaine, ipsilateral");`
  - **Update** disclaimer footer at `:776` to cite Robblee 2025 (see Finding A12).
- **Citations to attach:** Robblee 2025 *Headache* 2026;66:53–76 (Table 3); DOI 10.1111/head.70016.
- **Class (CLAUDE.md §6):** **Class E** — adds a new Level A clinical-logic branch with patient-facing eligibility.
- **Ship-blocker?** **Yes** — missing a Level A "Must Offer" recommendation in an ED-facing pathway is the most serious omission in the dossier.

---

### Finding A2 — Antiemetic default INVERTED — prochlorperazine should be default

- **Dossier severity:** HIGH
- **Dossier verdict:** Robblee 2025 Table 3: prochlorperazine IV 10–12.5 mg = **Level A — Must Offer.** Metoclopramide IV 10 mg = Level B — Should Offer. Current pathway defaults to metoclopramide (Level B); should default to prochlorperazine (Level A).
- **Final severity:** HIGH (ship-blocker)
- **Location in code:** `src/pages/MigrainePathway.tsx:123` — `antiemetic: 'metoclopramide'` in the initial `useState<CocktailState>` block; reset path at `:229`; option order at `:502`; option descriptions at `:516–518`.
- **Verbatim authority (Robblee 2025 Table 3, dossier Section 1.C):** *"Prochlorperazine IV 10–12.5 mg — Level A: Must Offer."* AND *"Metoclopramide IV 10 mg — Level B: Should Offer."*
- **Concrete patch instructions:**
  - **In** `src/pages/MigrainePathway.tsx:123`, **replace:** `antiemetic: 'metoclopramide',`
  - **with:** `antiemetic: 'prochlorperazine',`
  - **In** `src/pages/MigrainePathway.tsx:229` (reset path), **replace:** `setCocktail({ benadryl: true, antiemetic: 'metoclopramide', ketorolac: '15', dexamethasone: '10' });`
  - **with:** `setCocktail({ benadryl: true, antiemetic: 'prochlorperazine', ketorolac: '30', dexamethasone: '10' });` (also updates Finding A3 ketorolac default).
  - **In** `src/pages/MigrainePathway.tsx:502`, **replace** the option order array `['metoclopramide', 'prochlorperazine', 'ondansetron']`
  - **with:** `['prochlorperazine', 'metoclopramide', 'ondansetron']`.
  - **In** `:514`, **update** the dose-text helper so prochlorperazine label reads `"10 mg IV"` and metoclopramide label reads `"10 mg IV"` (current concatenation is acceptable; verify it reads "Prochlorperazine 10 mg" not "Prochlorperazine 10-12.5 mg" unless you want to expose the range).
  - **In** `:516–518`, **replace** the descriptive blurbs:
    - **prochlorperazine** (new default): *"Robblee 2025 Level A — Must Offer. First-line ED antiemetic for acute migraine. May repeat q8h. Anticholinergic premed (diphenhydramine 25–50 mg) reduces akathisia/EPS."*
    - **metoclopramide** (alternative): *"Robblee 2025 Level B — Should Offer. Use if prochlorperazine unavailable or contraindicated. May repeat q8h. Anticholinergic premed reduces akathisia."*
    - **ondansetron** (adjunct): *"Use for nausea adjunct when QT-prolongation risk excludes dopamine antagonists. Burch 2024: ondansetron is anti-nausea only, not an analgesic. May repeat q8h."*
  - **In** `generateSummary()` at `:248–250`, no change required — text already keys off `antiemetic` state. Verify the prochlorperazine line at `:249` reads `"- Prochlorperazine 10 mg PO/IV x1 (Repeat q8h PRN)"`.
- **Citations to attach:** Robblee 2025 Table 3; AHS 2021 Consensus (Ailani et al.).
- **Class (CLAUDE.md §6):** **Class E** — changes the clinical default an ED clinician sees first.
- **Ship-blocker?** **Yes** — defaulting to the Level B agent when Level A is available is exactly the failure mode the Robblee 2025 update was written to correct.

---

### Finding A3 — Ketorolac dose set: replace 45 mg with 60 mg

- **Dossier severity:** MEDIUM
- **Dossier verdict:** Robblee 2025 Table 3: **Ketorolac IV 30–60 mg = Level B — Should Offer.** Current set `['15', '30', '45']` includes 45 mg (non-standard ED dose) and tops out below the Robblee ceiling.
- **Final severity:** MEDIUM
- **Location in code:** Type alias at `src/pages/MigrainePathway.tsx:37` (`type KetorolacDose = '15' | '30' | '45' | null`); initial state at `:124` (`ketorolac: '15'`); dose options at `:539`.
- **Verbatim authority (Robblee 2025 Table 3):** *"Ketorolac IV 30–60 mg — Level B: Should Offer."*
- **Concrete patch instructions:**
  - **In** `src/pages/MigrainePathway.tsx:37`, **replace:** `type KetorolacDose = '15' | '30' | '45' | null;`
  - **with:** `type KetorolacDose = '15' | '30' | '60' | null;`
  - **In** `:124`, **replace:** `ketorolac: '15'`
  - **with:** `ketorolac: '30'` (per Robblee Level B range; 15 mg remains a low-dose option for `age65`/`weightLow` patients).
  - **In** `:229` (reset path), match the new default (already addressed in Finding A2 instruction).
  - **In** `:539`, **replace:** `(['15', '30', '45'] as KetorolacDose[]).map(dose => {`
  - **with:** `(['15', '30', '60'] as KetorolacDose[]).map(dose => {`
  - **In** `:541`, **replace:** `if (dose === '45' && (safety.age65 || safety.weightLow)) return null;`
  - **with:** `if (dose === '60' && (safety.age65 || safety.weightLow)) return null;` (60 mg hidden for elderly/low-weight; 30 mg becomes ceiling for these patients).
  - **Update** the ketorolac eligibility caption text at `:533` to: *"NSAID. Robblee 2025 Level B (30–60 mg IV). May repeat q8h (Max 2 doses). 60 mg hidden for age >65 or weight <50 kg."*
- **Citations to attach:** Robblee 2025 Table 3.
- **Class (CLAUDE.md §6):** **Class E** — dose threshold change.
- **Ship-blocker?** No.

---

### Finding A4 — Dexamethasone dose set: replace 4 mg with 8 mg; add 16 mg option

- **Dossier severity:** MEDIUM
- **Dossier verdict:** Robblee 2025 Table 2: dexamethasone IV **8–16 mg** for acute pain (Level C) AND retains **Level B — Should Offer for recurrence prevention** (Robblee p.55: 2016 indication unchanged). Current options `['4', '10']` include 4 mg (sub-therapeutic) and miss the upper range.
- **Final severity:** MEDIUM
- **Location in code:** Type alias at `src/pages/MigrainePathway.tsx:38` (`type DexDose = '4' | '6' | '8' | '10' | null`); initial state at `:125` (`dexamethasone: '10'`); dose options at `:570`.
- **Verbatim authority (Robblee 2025 Table 2, dossier Section 1.F):** *"Dexamethasone IV 8–16 mg — Level C: May Offer (acute pain); Level B: Should Offer (recurrence prevention, retained from 2016)."* Burch Table 3-6 lists 10 mg IV as the recurrence-prevention reference dose.
- **Concrete patch instructions:**
  - **In** `src/pages/MigrainePathway.tsx:38`, **replace:** `type DexDose = '4' | '6' | '8' | '10' | null;`
  - **with:** `type DexDose = '8' | '10' | '16' | null;`
  - **In** `:125`, keep `dexamethasone: '10'` (Burch reference dose; mid-range of Robblee 8–16).
  - **In** `:570`, **replace:** `(['4', '10'] as DexDose[]).map(dose => (`
  - **with:** `(['8', '10', '16'] as DexDose[]).map(dose => (`
  - **In** `:564`, **replace** the descriptive caption: *"Prevents recurrence (rebound) within 72h. Single dose only."*
  - **with:** *"Robblee 2025 Level B — Should Offer for recurrence prevention (Burch 2024 reference dose 10 mg IV). 8–16 mg range per Robblee Table 2. Single dose only."*
- **Citations to attach:** Robblee 2025 Table 2; Burch 2024 *Continuum* 30(2):344–363, Table 3-6.
- **Class (CLAUDE.md §6):** **Class E** — dose threshold change (removes sub-therapeutic option, expands ceiling).
- **Ship-blocker?** No.

---

### Finding A5 — Sumatriptan-in-pregnancy: downgrade hard-disable to WARNING with rescue-indication note

- **Dossier severity:** MEDIUM
- **Dossier verdict:** Burch 2024 Table 3-5 lists triptans as **first-line for rescue** in pregnancy. Current pathway hard-disables sumatriptan whenever `safety.pregnant === true`. This is over-restrictive vs Burch 2024.
- **Final severity:** MEDIUM
- **Location in code:** `src/pages/MigrainePathway.tsx:170` — `case 'sumatriptan': if (safety.pregnant) { disabled = true; reasons.push("Pregnancy"); }`
- **Verbatim authority (Burch 2024 Table 3-5, dossier Section 1.E):** *"First line for rescue: Triptans."* (Pregnancy column.)
- **Concrete patch instructions:**
  - **In** `src/pages/MigrainePathway.tsx:170`, **replace:** `if (safety.pregnant) { disabled = true; reasons.push("Pregnancy"); }`
  - **with:** `if (safety.pregnant) { warning = "Pregnancy — first-line RESCUE per Burch 2024 Table 3-5; do not select as initial agent. Discuss with OB/maternal-fetal medicine."; }`
  - **Note:** this changes `disabled` (hard exclusion) to `warning` (advisory). The UI logic at `:603–609` currently shows a red badge for `disabled` and no warning for warning-only. Add a yellow/amber warning banner pattern parallel to the magnesium warning at `:619`:
    - **In** `:603`, **replace** the conditional `{checkEligibility('sumatriptan').disabled ? (...) : (...)}` with a three-way: `disabled` (red, blocked) → `warning` (yellow, allowed with caveat) → clean (selectable). Reuse the magnesium warning render pattern at `:619`.
  - **Keep the other contraindications** (HTN, CV risk, stroke history, basilar) as hard-disables — those remain absolute per AHS 2021.
- **Citations to attach:** Burch 2024 *Continuum* 30(2):344–363, Table 3-5; AHS 2021 Consensus (Ailani et al., p.1025).
- **Class (CLAUDE.md §6):** **Class E** — relaxes a previously-absolute exclusion (clinical-logic change).
- **Ship-blocker?** No (the over-restrictive default is conservative and not dangerous, but mis-frames Burch 2024 evidence).

---

### Finding A6 — Valproate dose set: add 800 mg option

- **Dossier severity:** LOW
- **Dossier verdict:** Robblee 2025 Table 2: **Valproate IV 400–1000 mg — Level C; ≥800 mg may perform better.** Current options `['500', '1000']` omit the 800 mg level Robblee specifically flags as superior.
- **Final severity:** LOW
- **Location in code:** Type alias at `src/pages/MigrainePathway.tsx:39`; dose options at `:644`; second-line rescue at `:723`.
- **Verbatim authority (Robblee 2025 Table 2):** *"Valproate IV 400–1000 mg — Level C: May Offer. Doses ≥800 mg may perform better."*
- **Concrete patch instructions:**
  - **In** `src/pages/MigrainePathway.tsx:39`, **replace:** `type ValproateDose = '500' | '750' | '1000' | null;`
  - **with:** `type ValproateDose = '500' | '800' | '1000' | null;` (the existing `'750'` was never wired into the UI; replacing with `'800'` keeps the type small).
  - **In** `:644`, **replace:** `(['500', '1000'] as ValproateDose[]).map(dose => (`
  - **with:** `(['500', '800', '1000'] as ValproateDose[]).map(dose => (`
  - **In** `:638`, **update** the descriptive caption: *"Robblee 2025 Level C — May Offer (400–1000 mg IV). Doses ≥800 mg may perform better. Contraindicated in pregnancy and hepatic impairment."*
- **Citations to attach:** Robblee 2025 Table 2.
- **Class (CLAUDE.md §6):** Class C-clinical (adds a dose option within the existing Robblee-sanctioned range).
- **Ship-blocker?** No.

---

### Finding A7 — Second-line rescue branch incomplete

- **Dossier severity:** MEDIUM
- **Dossier verdict:** Current second-line at `:706–728` offers only magnesium and valproate. Should also include chlorpromazine IV 12.5–25 mg (Robblee Level C), DHE IV (inpatient status migrainosus per Burch p.360), and GONB-as-rescue.
- **Final severity:** MEDIUM
- **Location in code:** `src/pages/MigrainePathway.tsx:706–728` (Step 4 refractory block).
- **Verbatim authority:**
  - Robblee 2025 Table 3: *"Chlorpromazine IV 12.5–25 mg — Level C: May Offer."*
  - Burch 2024 p.360: *"Inpatient DHE protocol: DHE + metoclopramide IV q8h. Nagy 2011: longer course > 2 days for status migrainosus."*
  - Robblee 2025 Table 3 (already cited in A1): GONB Level A.
- **Concrete patch instructions:**
  - **Extend** the `secondLine` state type at `:136–139` to include `chlorpromazine: '12.5' | '25' | null` and `dhe: boolean` (admit-trigger).
  - **Add three new cards** in the Step 4 refractory block at `:701–728`, parallel to the existing magnesium and valproate rescue cards:
    1. **Chlorpromazine 12.5–25 mg IV** — caption: *"Robblee 2025 Level C — May Offer. Pre-medicate with 500 mL NS and monitor for orthostatic hypotension."* Eligibility: hide if `safety.htn` (orthostasis risk).
    2. **GONB rescue** — caption: *"Robblee 2025 Level A. Effective even after IV cocktail failure."* (Pre-populates the GONB add-on from A1 if not already selected.)
    3. **DHE IV (Admit)** — caption: *"Inpatient status migrainosus protocol (Burch 2024 p.360): DHE 0.5–1 mg IV + metoclopramide IV q8h. Avoid if triptan within 24h (current safety toggle) or CAD/PVD."* Eligibility: hide if `safety.triptan24h` OR `safety.cvRisk` OR `safety.pregnant` (Burch Table 3-5: **always avoid ergots/DHE in pregnancy**).
  - **Update** `generateSummary()` accordingly.
- **Citations to attach:** Robblee 2025 Table 3; Burch 2024 p.360; Nagy 2011 Neurology (DHE).
- **Class (CLAUDE.md §6):** **Class E** — adds new clinical-logic branches with safety gates.
- **Ship-blocker?** No.

---

### Finding A8 — Disclaimer citation stale (does not name Robblee 2025)

- **Dossier severity:** LOW
- **Dossier verdict:** Footer at `:776` cites "AHS/AAN" generically. Should name Robblee 2025 as the primary ED parenteral authority.
- **Final severity:** LOW
- **Location in code:** `src/pages/MigrainePathway.tsx:774–776`.
- **Concrete patch instructions:**
  - **In** `:776`, **replace:** *"This tool is based on standard emergency neurology guidelines (AHS/AAN). Individual patient factors (allergies, interactions) must be verified by the treating clinician."*
  - **with:** *"Based on Robblee et al. 2025 AHS ED Guideline (Headache 2026;66:53–76, DOI 10.1111/head.70016) for ED parenteral therapy and Ailani et al. AHS 2021 Consensus (Headache 2021;61:1021–1039) for outpatient acute selection. Continuum 2024 chapters (Burch, Burish, Rizzoli, Goadsby, Nahas) inform special-population and differential-diagnosis branches. Individual patient factors (allergies, interactions, pregnancy stage) must be verified by the treating clinician."*
- **Citations to attach:** Robblee 2025; Ailani 2021; Burch 2024; Burish 2024; Rizzoli 2024.
- **Class (CLAUDE.md §6):** Class C-clinical (disclaimer text touching clinical attribution).
- **Ship-blocker?** No.

---

### Finding A9 — Red-flag screen (7 items) — CONFIRMED CLEAN

- **Dossier severity:** —
- **Dossier verdict:** Consistent with standard ED practice. SNNOOP10 not required by any of the 8 dossier PDFs.
- **Final severity:** Informational
- **Location in code:** `src/pages/MigrainePathway.tsx:99–101`, `:362–369`.
- **Concrete patch instructions:** None.
- **Class (CLAUDE.md §6):** n/a.
- **Ship-blocker?** No.

---

### Finding A10 — Diphenhydramine 25/50 mg as akathisia premed — CONFIRMED CLEAN

- **Dossier severity:** —
- **Dossier verdict:** Correct per Robblee p.63 (anticholinergic premed reduces EPS).
- **Final severity:** Informational
- **Location in code:** `src/pages/MigrainePathway.tsx:122`, `:489–491`.
- **Concrete patch instructions:** None. Optional polish: update the small caption at `:491` to read *"Robblee 2025: anticholinergic premed reduces EPS from dopamine antagonists."* (cosmetic).
- **Class (CLAUDE.md §6):** Class B if cosmetic update applied.
- **Ship-blocker?** No.

---

### Finding A11 — Magnesium 1/2 g IV "Beneficial for aura/photophobia" — CONFIRMED CLEAN

- **Dossier severity:** —
- **Dossier verdict:** Robblee Level U overall; "may be considered in aura"; Burch 1–2 g for aura. Caption matches.
- **Final severity:** Informational
- **Location in code:** `src/pages/MigrainePathway.tsx:618`, `:624–628`.
- **Concrete patch instructions:** None.
- **Class (CLAUDE.md §6):** n/a.
- **Ship-blocker?** No.

---

### Finding A12 — Sumatriptan disabled in basilar migraine — CONFIRMED CLEAN

- **Dossier severity:** —
- **Dossier verdict:** Burch p.352 notes the prohibition is questioned by observational data, but vasoconstrictor-free alternatives preferred. Conservative hard-disable acceptable.
- **Final severity:** Informational
- **Location in code:** `src/pages/MigrainePathway.tsx:174`.
- **Concrete patch instructions:** None.
- **Class (CLAUDE.md §6):** n/a.
- **Ship-blocker?** No.

---

## Part B — New findings from dossier nuances

### Finding B1 — Cluster-headache flag and routing branch (Burish 2024)

- **Dossier source:** Dossier Section 6 B1; Burish 2024 *Continuum* 30(2):391–410.
- **Codebase state:** No cluster-headache differential. A patient presenting with cluster headache would be routed through the migraine IV cocktail and would miss high-flow O2 (AHS Grade A first-line for cluster).
- **Severity:** MEDIUM
- **Location in code:** Add a new screen in Step 2 (Care Setting) OR a new red-flag-style filter in Step 1.
- **Verbatim authority (Burish 2024 Table 6-3):** *"First-line acute cluster: Oxygen high-flow 6–12 L/min via non-rebreather; sumatriptan SC 6 mg; zolmitriptan nasal 5–10 mg. AHS Grade A."* ICHD-3 phenotype (Burish Table 6-2): *"Severe unilateral orbital/supraorbital/temporal pain, 15–180 min, ipsilateral autonomic features OR restlessness/agitation, every-other-day to 8/day."*
- **Concrete patch instructions:**
  - **Add** a new `clusterPhenotype` boolean to clinical state (after `redFlags` at `:99–101`), surfaced as a Step 2 secondary screen with the question: *"Unilateral orbital/temporal pain + ipsilateral autonomic features (lacrimation, conjunctival injection, ptosis, miosis, nasal congestion) + restlessness or short-cycle pattern (15–180 min attacks)?"*
  - **If `clusterPhenotype === true`,** **branch the pathway** before Step 3 to a new screen titled "Cluster Headache — Distinct Acute Protocol" with three cards:
    1. **High-flow oxygen 12 L/min via NRB × 15 min** — caption: *"AHS Grade A first-line; 15 L/min may be more effective per Burish 2024 p.401."*
    2. **Sumatriptan 6 mg SC** — caption: *"AHS Grade A; eligibility identical to migraine sumatriptan (CV, HTN, pregnancy, stroke history exclusions)."*
    3. **Zolmitriptan nasal 5–10 mg** — caption: *"AHS Grade A; same triptan-class contraindications."*
  - **Add** a bridge-therapy note: *"Bridge: prednisone 100 mg/day × 5 days then taper -20 mg q3d; OR ipsilateral GON injection with steroid. Preventive: verapamil 360 mg/day TID with ECG monitoring."*
- **Citations to attach:** Burish 2024 *Continuum* 30(2):391–410, Tables 6-2 and 6-3.
- **Class (CLAUDE.md §6):** **Class E** — adds a new diagnostic branch with distinct treatment logic.
- **Ship-blocker?** No (current behavior routes cluster patients through migraine cocktail — clinically wrong but not actively harmful; cluster patients usually receive O2 anyway at attending discretion).

---

### Finding B2 — Medication-Overuse Headache (MOH) discharge screen (Rizzoli 2024)

- **Dossier source:** Dossier Section 6 B2; Rizzoli 2024 *Continuum* 30(2):379–390.
- **Codebase state:** No MOH screening at discharge. Step 5 is purely the treatment plan output.
- **Severity:** LOW
- **Location in code:** Add a screen between Step 4 (Response) and Step 5 (Plan), OR as a banner block at the top of Step 5.
- **Verbatim authority (Rizzoli 2024 Table 5-1, p.380):** *"ICHD-3 MOH criteria: ≥15 headache days/month in pre-existing headache disorder; regular overuse >3 months; not better accounted for by another ICHD-3 diagnosis. Thresholds: combination analgesics / triptans / ergots / opioids / butalbital >10 days/month for >3 months; simple analgesics (NSAID / acetaminophen / aspirin) >15 days/month for >3 months."* Treatment (p.385–386): *"Withdraw overused medication + start prevention. Bridge: naproxen 550 mg BID 2–4 wks, prednisone taper, IV DHE, IV valproate, IV prochlorperazine. Anti-CGRP mAbs and gepants effective in MOH context."*
- **Concrete patch instructions:**
  - **Add** a discharge-screen card at the top of Step 5 (`:742` area) with two screening questions:
    1. *"Headache ≥15 days/month for >3 months?"* (boolean)
    2. *"Acute medication use: triptan/opioid/combo/ergot >10 days/month OR simple analgesic (NSAID/acetaminophen) >15 days/month?"* (boolean)
  - **If both === true,** render a banner: *"MOH screen positive (Rizzoli 2024, ICHD-3 8.2). Counseling required: withdraw overused agent, initiate preventive therapy, outpatient HA follow-up within 2 weeks. Bridge options: naproxen 550 mg BID 2–4 wks; prednisone taper; anti-CGRP mAb. Reference: Rizzoli 2024 Continuum 30(2):379–390."*
  - **Append** an MOH note to `generateSummary()` if the screen is positive.
- **Citations to attach:** Rizzoli 2024 *Continuum* 30(2):379–390, Table 5-1.
- **Class (CLAUDE.md §6):** **Class E** — adds a new clinical screen + counseling logic.
- **Ship-blocker?** No.

---

### Finding B3 — Indomethacin-responsive headache differential flag (Goadsby 2024)

- **Dossier source:** Dossier Section 6 B3; Goadsby 2024 *Continuum* 30(2):488–497.
- **Codebase state:** No differential for paroxysmal hemicrania (PH) or hemicrania continua (HC).
- **Severity:** LOW
- **Location in code:** Add as a tertiary differential question in Step 2 (Care Setting) OR as a "Differential Considerations" note at Step 5.
- **Verbatim authority (Goadsby 2024 Tables 11-2 and 11-3):** *"Paroxysmal hemicrania: strictly side-locked unilateral pain, ≥5 attacks/day lasting 2–30 min, cranial autonomic features. Hemicrania continua: continuous strictly side-locked pain with exacerbations and cranial autonomic features. Both: indomethacin-responsive (diagnostic and therapeutic). Trial: 25 mg TID × 5–7 d → 50 mg TID × 5–7 d → 75 mg TID × 2 wks. Adult dose 150–225 mg/day with PPI."*
- **Concrete patch instructions:**
  - **Add** a question to Step 2 (or a new Step 2.5): *"Strictly side-locked unilateral pain + either many short attacks (2–30 min, ≥5/day) OR continuous waxing/waning pain + cranial autonomic features?"*
  - **If yes,** render a non-blocking advisory card: *"Consider indomethacin-responsive headache (paroxysmal hemicrania or hemicrania continua per Goadsby 2024). Outpatient indomethacin trial: 25 mg TID × 5–7 d → 50 mg TID × 5–7 d → 75 mg TID × 2 wks (with PPI). Migraine cocktail may still be appropriate acutely; flag for neurology follow-up."*
- **Citations to attach:** Goadsby 2024 *Continuum* 30(2):488–497, Tables 11-2, 11-3.
- **Class (CLAUDE.md §6):** Class C-clinical (advisory differential, non-blocking).
- **Ship-blocker?** No.

---

### Finding B4 — Trigeminal-neuralgia route-out (Nahas 2024)

- **Dossier source:** Dossier Section 6 B4; Nahas 2024 *Continuum* 30(2):473–487.
- **Codebase state:** No differential for trigeminal neuralgia (TN). Patient with TN routed through migraine cocktail receives suboptimal first-line therapy.
- **Severity:** LOW
- **Location in code:** Add as a differential question in Step 2 OR as a red-flag-adjacent screen in Step 1.
- **Verbatim authority (Nahas 2024 Table 10-2):** *"Trigeminal neuralgia: paroxysmal, electric-shock-like pain in trigeminal distribution, triggered by innocuous stimuli (light touch, chewing, talking), duration seconds to 2 minutes. First-line: carbamazepine 300–800 mg/day (only FDA-approved). Alternative: oxcarbazepine 600–1200 mg/day. Opioids avoided. Acute exacerbations: IV fosphenytoin or IV lidocaine."*
- **Concrete patch instructions:**
  - **Add** a question to Step 2 (or appended to Step 1 red-flag screen as a routing-not-blocking item): *"Paroxysmal, electric-shock-like pain in trigeminal distribution, triggered by innocuous stimuli (light touch, chewing), lasting seconds–2 minutes?"*
  - **If yes,** route to a terminal screen: *"Likely trigeminal neuralgia (Nahas 2024). Migraine cocktail not indicated. First-line: carbamazepine 300–800 mg/day (FDA-approved) or oxcarbazepine 600–1200 mg/day. Acute exacerbations: IV fosphenytoin or IV lidocaine. Avoid opioids. Refer to outpatient neurology."*
- **Citations to attach:** Nahas 2024 *Continuum* 30(2):473–487, Table 10-2.
- **Class (CLAUDE.md §6):** **Class E** — terminal route-out with distinct treatment logic.
- **Ship-blocker?** No.

---

### Finding B5 — Status migrainosus DHE protocol surfacing (Burch 2024)

- **Dossier source:** Dossier Section 1.D; Burch 2024 p.358–360.
- **Codebase state:** Status migrainosus (≥72 h debilitating attack) is not explicitly named. The Step 4 refractory branch addresses 2-hour failure, not 72-hour duration.
- **Severity:** LOW
- **Location in code:** Add a duration-screening question to Step 2.
- **Verbatim authority (Burch 2024 p.358–360):** *"Status migrainosus: debilitating migraine ≥72 h (ICHD-3). Inpatient DHE protocol: DHE 0.5–1 mg IV + metoclopramide IV q8h. Nagy 2011 Neurology: longer course (>2 days) more effective."* Robblee 2025 on DHE: Level U in ED ("needs better quality ED-specific studies").
- **Concrete patch instructions:**
  - **Add** a question to Step 2 alongside the existing care-setting options: *"Current attack duration ≥72 hours? (Status migrainosus)"*
  - **If yes,** display a banner: *"Status migrainosus (Burch 2024, ICHD-3). Inpatient admission for repetitive DHE + metoclopramide IV q8h is reasonable. Robblee 2025: DHE Level U for ED parenteral use; consider inpatient consult to Neurology for repetitive dosing protocol."*
  - The cocktail in Step 3 remains valid as first-line; the banner adds admit-trigger guidance.
- **Citations to attach:** Burch 2024 *Continuum* 30(2):344–363, p.358–360; Robblee 2025 (DHE Level U); Nagy 2011 Neurology.
- **Class (CLAUDE.md §6):** Class C-clinical (advisory addition; does not change first-line cocktail).
- **Ship-blocker?** No.

---

### Finding B6 — Cardiovascular-disease vasoconstrictor-free routing (AHS 2021, Burch 2024)

- **Dossier source:** Dossier Section 1.E (CV disease subsection).
- **Codebase state:** Sumatriptan hard-disabled for `cvRisk`, but no positive routing toward gepants or lasmiditan (preferred in vascular disease per AHS 2021).
- **Severity:** LOW
- **Location in code:** When `safety.cvRisk === true` or `safety.strokeHistory === true`, add a banner in the Step 3 add-on block.
- **Verbatim authority (AHS 2021 p.1025, Burch 2024 p.352):** *"Gepants and lasmiditan are preferred in vascular disease (no vasoconstriction)."* Triptan contraindications: *"CAD, coronary vasospasm, ischemic stroke, poorly controlled HTN, hemiplegic migraine, brainstem aura."*
- **Concrete patch instructions:**
  - **Add** a banner in Step 3 visible when `safety.cvRisk` OR `safety.strokeHistory` is active: *"Vascular disease present — triptans and DHE contraindicated. Outpatient alternatives: ubrogepant 50/100 mg PO, rimegepant 75 mg ODT, lasmiditan 50/100/200 mg PO (no driving × 8 h). Not currently formulary-IV options; flag for outpatient initiation."*
  - No state field change required if this is a render-only banner.
- **Citations to attach:** AHS 2021 Consensus (Ailani et al., p.1025); Burch 2024 *Continuum* 30(2):344–363, p.352.
- **Class (CLAUDE.md §6):** Class C-clinical (advisory banner).
- **Ship-blocker?** No.

---

### Finding B7 — Pregnancy first-line panel (Burch 2024 Table 3-5)

- **Dossier source:** Dossier Section 1.E (Pregnancy subsection); Burch 2024 Table 3-5.
- **Codebase state:** Pregnancy triggers ketorolac and valproate hard-disables (correct), and sumatriptan hard-disable (over-restrictive per A5). No positive routing to acetaminophen, prochlorperazine, metoclopramide, or SC lidocaine.
- **Severity:** LOW
- **Location in code:** When `safety.pregnant === true`, display a positive-routing banner in Step 3.
- **Verbatim authority (Burch 2024 Table 3-5):**
  - First line: Acetaminophen, Cyclobenzaprine, Diphenhydramine, **Metoclopramide**, SC Lidocaine
  - First line for rescue: **Triptans**
  - Second line: Ibuprofen (2nd trimester only), Ondansetron, **Prednisone (rescue)**, Prochlorperazine
  - Third line / avoid: Oxycodone, Butalbital
  - **Always avoid:** Lasmiditan, Gepants, **Ergots and DHE**, Valproate (teratogenic)
- **Concrete patch instructions:**
  - **Add** a banner in Step 3 visible when `safety.pregnant`: *"Pregnancy — Burch 2024 Table 3-5. First-line: acetaminophen 1000 mg PO, diphenhydramine 25–50 mg PO/IV, metoclopramide 10 mg IV (Level B for migraine + safe in pregnancy). First-line RESCUE: sumatriptan (downgraded to warning, not exclusion). Second-line: ondansetron, prednisone rescue, prochlorperazine. Always avoid: ergots/DHE, valproate (teratogenic), gepants, lasmiditan."*
  - In conjunction with Finding A5 (sumatriptan warning), this clarifies the pregnancy decision tree.
- **Citations to attach:** Burch 2024 *Continuum* 30(2):344–363, Table 3-5.
- **Class (CLAUDE.md §6):** Class C-clinical (advisory banner; no state field change).
- **Ship-blocker?** No.

---

### Finding B8 — Outpatient acute-treatment summary card (AHS 2021)

- **Dossier source:** Dossier Section 1.B; AHS 2021 p.1023.
- **Codebase state:** Step 2 "Adequate response to home therapy" exits to "Discharge / Outpatient Management" with no clinical guidance.
- **Severity:** LOW
- **Location in code:** `src/pages/MigrainePathway.tsx:426` — current text reads *"Discharge / Outpatient Management."*
- **Verbatim authority (AHS 2021 p.1023):** *"NSAIDs / non-opioid analgesics / acetaminophen / caffeine combos for mild-to-moderate; triptans / DHE / gepants / ditans for moderate-severe or NSAID-refractory mild-moderate."* Triptan doses (Burch Table 3-3): Sumatriptan PO 25/50/100 mg (max 200 mg/24h); Rizatriptan 5/10 mg; Eletriptan 20/40 mg; Zolmitriptan 2.5/5 mg. Gepants: ubrogepant 50/100 mg; rimegepant 75 mg ODT. Ditans: lasmiditan 50/100/200 mg (no driving × 8 h).
- **Concrete patch instructions:**
  - **Replace** the bare "Discharge / Outpatient Management" exit with a summary card listing AHS 2021 first-line outpatient options stratified by severity and refractoriness. Include the eight-PDF-verified triptan doses and the gepant/ditan options.
- **Citations to attach:** AHS 2021 Consensus (Ailani et al., p.1023); Burch 2024 Table 3-3.
- **Class (CLAUDE.md §6):** Class C-clinical (educational summary; no state-field change).
- **Ship-blocker?** No.

---

### Finding B9 — Ondansetron labeling clarification

- **Dossier source:** Dossier Section 4 audit grid (line 129); Burch 2024 p.353.
- **Codebase state:** Ondansetron currently shown as an antiemetic choice in Step 3 cocktail (option C); caption notes "less effective for pain." Robblee 2025 does not list ondansetron in Table 3 as an analgesic option.
- **Severity:** LOW (informational tightening)
- **Location in code:** `src/pages/MigrainePathway.tsx:518`.
- **Verbatim authority (Burch 2024 p.353):** *"Ondansetron is an anti-nausea agent; not effective as an analgesic for migraine."*
- **Concrete patch instructions:**
  - Already partially handled in Finding A2 (the description text). Confirm: when prochlorperazine and metoclopramide are both contraindicated (e.g., QT prolongation, prior dystonia, allergy), ondansetron is the fallback for nausea control; clinician should still select a non-dopamine analgesic (ketorolac, GONB, magnesium, valproate).
- **Citations to attach:** Burch 2024 *Continuum* 30(2):344–363, p.353.
- **Class (CLAUDE.md §6):** Class C-clinical (caption tightening only).
- **Ship-blocker?** No.

---

### Finding B10 — Dexamethasone recurrence-prevention vs acute-pain framing

- **Dossier source:** Dossier Section 1.F; Robblee 2025 Tables 2 and 3.
- **Codebase state:** Current dex caption at `:564` reads *"Prevents recurrence (rebound) within 72h. Single dose only."* This frames dex correctly as recurrence-prevention but does not name the new Robblee 2025 dual indication (Level C for acute pain; Level B retained for recurrence).
- **Severity:** Informational
- **Location in code:** `src/pages/MigrainePathway.tsx:564`.
- **Concrete patch instructions:**
  - **Replace** caption (already addressed in Finding A4 patch above): *"Robblee 2025 Level B — Should Offer for recurrence prevention (Burch 2024 reference dose 10 mg IV). 8–16 mg range per Robblee Table 2 also applicable to acute pain (Level C). Single dose only."*
  - This explicitly names both Robblee 2025 indications.
- **Citations to attach:** Robblee 2025 Tables 2 and 3.
- **Class (CLAUDE.md §6):** Class C-clinical (caption refinement, folded into A4 patch).
- **Ship-blocker?** No.

---

## Part C — Class breakdown for V's task spin-up

Ordered: ship-blockers first, then Class E (clinical-logic), then Class C-clinical (prose/citation/banners), then informational.

| # | Title | Severity | Class | Ship-blocker | Files touched |
|---|---|---|---|---|---|
| **A1** | Add GONB Level A as new branch (first-line procedural) | HIGH | E | **Yes** | src/pages/MigrainePathway.tsx |
| **A2** | Invert antiemetic default: metoclopramide → prochlorperazine | HIGH | E | **Yes** | src/pages/MigrainePathway.tsx |
| **A3** | Ketorolac dose set: 45 → 60 mg ceiling | MEDIUM | E | No | src/pages/MigrainePathway.tsx |
| **A4** | Dexamethasone dose set: 4 → 8 mg low end; add 16 mg | MEDIUM | E | No | src/pages/MigrainePathway.tsx |
| **A5** | Sumatriptan pregnancy: hard-disable → WARNING (rescue indication) | MEDIUM | E | No | src/pages/MigrainePathway.tsx |
| **A6** | Valproate: add 800 mg option (Robblee "may perform better") | LOW | C-clinical | No | src/pages/MigrainePathway.tsx |
| **A7** | Second-line rescue: add chlorpromazine, GONB, DHE-IV | MEDIUM | E | No | src/pages/MigrainePathway.tsx |
| **A8** | Disclaimer: cite Robblee 2025 explicitly | LOW | C-clinical | No | src/pages/MigrainePathway.tsx |
| **B1** | Cluster-headache phenotype screen + O2/sumatriptan SC branch | MEDIUM | E | No | src/pages/MigrainePathway.tsx |
| **B2** | MOH discharge screen (ICHD-3 criteria) | LOW | E | No | src/pages/MigrainePathway.tsx |
| **B3** | Indomethacin-responsive headache flag (advisory) | LOW | C-clinical | No | src/pages/MigrainePathway.tsx |
| **B4** | Trigeminal-neuralgia route-out (terminal) | LOW | E | No | src/pages/MigrainePathway.tsx |
| **B5** | Status migrainosus duration screen + DHE inpatient banner | LOW | C-clinical | No | src/pages/MigrainePathway.tsx |
| **B6** | CV-disease vasoconstrictor-free routing banner | LOW | C-clinical | No | src/pages/MigrainePathway.tsx |
| **B7** | Pregnancy first-line panel banner (Burch Table 3-5) | LOW | C-clinical | No | src/pages/MigrainePathway.tsx |
| **B8** | Outpatient acute-treatment summary card at "adequate" exit | LOW | C-clinical | No | src/pages/MigrainePathway.tsx |
| **B9** | Ondansetron caption tightening | LOW | C-clinical | No | src/pages/MigrainePathway.tsx |
| **B10** | Dexamethasone dual-indication caption (folds into A4) | Info | C-clinical | No | src/pages/MigrainePathway.tsx |
| **A9** | Red-flag screen — confirmed clean | Info | n/a | No | (no change) |
| **A10** | Diphenhydramine premed — confirmed clean | Info | B (optional) | No | src/pages/MigrainePathway.tsx |
| **A11** | Magnesium 1/2 g caption — confirmed clean | Info | n/a | No | (no change) |
| **A12** | Sumatriptan basilar disable — confirmed clean (conservative OK) | Info | n/a | No | (no change) |

Total: 18 actionable + 4 confirmed-clean.

---

## Part D — Proposed batching for the React rebuild

### Patch 1 — Ship-blockers (must-have, today)

**Class E. Size: medium. No dependencies.**

- **A1** — Add GONB Level A as a new card in the First-Line Add-Ons block (Step 3). New state field `gonb: boolean` on `AddOnsState`. Update `generateSummary()`.
- **A2** — Invert antiemetic default from `'metoclopramide'` to `'prochlorperazine'` at `:123`, `:229`, `:502` array order, `:516–518` descriptions.

**Files touched:** `src/pages/MigrainePathway.tsx` only.
**Class label for the patch:** **Class E**.
**Rollback plan:** revert single PR; no schema or data-file dependencies. State-field addition (`gonb`) is purely additive; existing serialized state remains compatible.

---

### Patch 2 — Class E dose corrections

**Class E. Size: small. Independent of Patch 1.**

- **A3** — Ketorolac 60 mg ceiling (replace `'45'` with `'60'` in `KetorolacDose` type, dose array, and age-gate filter).
- **A4** — Dexamethasone 8/10/16 set (drop `'4'`, add `'16'` in `DexDose` type and dose array).
- **A6** — Valproate 800 mg option (replace `'750'` with `'800'` in `ValproateDose` type; add to dose array at `:644`).

**Files touched:** `src/pages/MigrainePathway.tsx`.
**Class label for the patch:** **Class E**.
**Rollback plan:** type-level changes; ensure no consumer outside this file depends on the dose enums (a grep for `KetorolacDose`, `DexDose`, `ValproateDose` confirms the types are file-local).

---

### Patch 3 — Class C-clinical safety framing (sumatriptan-pregnancy, citations, banners)

**Class C-clinical. Size: small. Independent.**

- **A5** — Sumatriptan-pregnancy hard-disable → warning (UI three-way render at `:603`).
- **A8** — Disclaimer footer: cite Robblee 2025, AHS 2021, Continuum 2024 explicitly.
- **B6** — CV-disease vasoconstrictor-free routing banner.
- **B7** — Pregnancy first-line panel banner.
- **B9** — Ondansetron caption tightening (folded into A2 patch).
- **B10** — Dex dual-indication caption (folded into A4 patch).

**Files touched:** `src/pages/MigrainePathway.tsx` (Step 3 render block + footer).
**Class label for the patch:** Class C-clinical.

---

### Patch 4 — New differential branches (cluster, MOH)

**Class E. Size: medium. Independent.**

- **B1** — Cluster-headache phenotype screen + dedicated branch (O2 12 L/min, sumatriptan SC 6 mg, zolmitriptan nasal 5–10 mg).
- **B2** — MOH discharge screen at Step 5.
- **B5** — Status migrainosus duration screen + DHE inpatient banner (Step 2 addition).
- **A7** — Second-line rescue expansion: chlorpromazine, GONB-rescue, DHE-IV admit trigger.

**Files touched:** `src/pages/MigrainePathway.tsx`.
**Class label for the patch:** **Class E** (introduces new diagnostic and treatment-routing branches).

---

### Patch 5 — Differential route-outs (indomethacin, TN, outpatient summary)

**Class E + Class C-clinical mix. Size: small. Independent.**

- **B3** — Indomethacin-responsive headache flag (advisory card, Step 2 differential).
- **B4** — Trigeminal-neuralgia route-out (terminal screen with carbamazepine guidance).
- **B8** — Outpatient acute-treatment summary card at the "adequate response" exit in Step 2.

**Files touched:** `src/pages/MigrainePathway.tsx`.
**Class label for the patch:** **Class E** (B4 is a terminal route-out with distinct treatment logic; B3 and B8 are advisory).

---

### Dependency graph

- Patch 1 (ship-blockers) is independent and should merge first.
- Patches 2, 3 are independent of one another and of Patch 1 (touch different lines).
- Patch 4 depends on Patch 1 (GONB card exists) because A7 second-line rescue references the same GONB component.
- Patch 5 is independent of all other patches.

Suggested order: **Patch 1 → Patch 2 → Patch 3 → Patch 4 → Patch 5.**

---

## Confidence statement

**HIGH confidence** on every Robblee 2025 Table 2 and Table 3 verbatim claim referenced in this manifest. The dossier transcribes both tables fully (Section 1.C and 1.F), with metadata: *Headache* 2026;66:53–76, DOI 10.1111/head.70016, AHS Special Interest Group on Refractory Headache, AAN CPG Process Manual, PROSPERO CRD42023432106. Three Class I sham-controlled trials underpin the GONB Level A elevation.

**HIGH confidence** on AHS 2021 Consensus (Ailani et al., *Headache* 2021;61:1021–1039, DOI 10.1111/head.14153) for outpatient acute-treatment selection (Finding B8) and CV-disease vasoconstrictor-free routing (Finding B6).

**HIGH confidence** on Continuum 2024 chapters (Burch acute, Burish cluster, Rizzoli MOH, Goadsby indomethacin, Nahas neuralgias) — all Vol. 30(2), April 2024 — for special-population guidance (Findings A5, B5, B7) and differential branches (B1, B2, B3, B4).

**MEDIUM confidence** items:
- **A5 (sumatriptan-pregnancy downgrade):** Burch 2024 Table 3-5 explicitly lists triptans as first-line rescue in pregnancy, but the dossier notes some institutional protocols remain more restrictive. The downgrade to WARNING (not removal of caution) preserves clinician judgment while not over-restricting. Confidence on the framing change is HIGH; confidence on adoption by all institutions is MEDIUM.
- **B1 (cluster routing):** Burish 2024 cites AHS + EFNS Grade A for high-flow O2, sumatriptan SC, and zolmitriptan nasal. The decision to make cluster a parallel branch (rather than a route-out terminal) reflects that ED pathways realistically need both — confidence MEDIUM on the branch architecture, HIGH on the clinical content.

No findings depend on speculation, secondary sources, or unverified inferences. Every recommended fix traces to a specific Robblee 2025 table entry, AHS 2021 page reference, or Continuum 2024 chapter table.
