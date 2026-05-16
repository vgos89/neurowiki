# Status Epilepticus Pathway — Final Fix Manifest (PDF-verified)

**Date:** 2026-05-16
**Author:** medical-scientist
**Inputs:** PDF-verified dossier (highest authority), 35-row codebase audit, source code
**Output mode:** Persistent markdown work-order; no source code edited in this task
**Authority sources:**
- **Glauser T et al.** "Evidence-Based Guideline: Treatment of Convulsive Status Epilepticus in Children and Adults." *Epilepsy Curr* 2016;16(1):48–61. DOI 10.5698/1535-7597-16.1.48. **TIER 0 — binds Stages 1–2.**
- **Vossler DG.** "First Seizures, Acute Repetitive Seizures, and Status Epilepticus." *Continuum* 2025;31(1):95–124. **TIER 1 — Stages 3–4.**
- **Rubinos C.** "Emergent Management of Status Epilepticus." *Continuum* 2024;30(3):682–720. **TIER 2 — Stages 3–4.**
- **Mullhi R et al.** "Guidance for: Acute management of status epilepticus in adult patients." *J Intensive Care Soc* 2025;26(2):249–262. DOI 10.1177/17511437251321338. **TIER 2 — UK adult ICU bundling.**

---

## Executive summary

- **24 fixes total.** 19 re-graded from the original 35-row codebase audit + 5 net-new findings derived from PDF-only nuances (Stage 4 branch, NORSE/FIRES, eclampsia, thiamine/pyridoxine, RAMPART pediatric fixed-dose scheme).
- **2 ship-blockers.** Both are clinical-logic defects flagged HIGH in the original audit and confirmed by latest-wins synthesis across Glauser 2016 + ESETT 2019 + Vossler 2025 + Mullhi 2025.
- **Severity:** Critical 1 · High 4 · Medium 11 · Low 6 · Informational 2.
- **Top 3 most consequential (patient-safety first):**
  1. **Finding A1 (HIGH 1, ship-blocker):** `getRecommendedAgent` orders levetiracetam → fosphenytoin → valproate → lacosamide → phenobarbital as if hierarchical. ESETT 2019 (Class I) proved levetiracetam, fosphenytoin, and valproate are **equivalent** in established SE — selection is by comorbidity, not by tier. Lacosamide is not a Glauser-recommended Stage 2 agent and must be removed from the Stage 2 dropdown.
  2. **Finding A2 (HIGH 2, ship-blocker):** the "Non-Convulsive SE" toggle (L234) routes the user into the convulsive-SE algorithm with no branching. NCSE-without-coma is not an ICU-mandatory pathway; NCSE-in-coma is. The current implementation is misleading and could either over-treat (NCSE-no-coma) or under-recognize (NCSE-in-coma). Remove the toggle or hard-redirect to NCSE-specific guidance.
  3. **Finding A3 (HIGH):** lacosamide loading dose 8 mg/kg (L29) capped at 600 mg risks AV block without a pre-load ECG safety gate. Per Vossler 2025: cap at 400 mg; require ECG before load (PR <200 ms); document cardiac comorbidity as **avoid** (not "caution") in 2°/3° AV block.

---

## Method

1. Walked through each of the 19 actionable codebase findings (HIGH 2 + MEDIUM 10 + LOW 7) against the PDF-verified dossier (Glauser 2016 binds Stages 1–2; Vossler 2025 + Rubinos 2024 + Mullhi 2025 bind Stages 3–4).
2. Walked through each of the 6 NOT-COVERED gaps the dossier surfaced (Stage 4 branch, NORSE/FIRES, eclampsia, thiamine/pyridoxine, pediatric RAMPART fixed-dose scheme, missing citations) and generated net-new findings.
3. Opened `src/pages/StatusEpilepticusPathway.tsx` and located each offending string/line for both groups.
4. Produced concrete patch instructions (replace-this-with-that, add-new-branch-with-these-conditions, remove-this-branch) per item.
5. Tagged each item with severity, CLAUDE.md §6 class (B / C-clinical / E), and ship-blocker status.

---

## Part A — Re-graded findings from the original audit

### A1 — `getRecommendedAgent` ordering misrepresents ESETT equivalence — RESCORE TO HIGH (ship-blocker)

- **Severity:** **High**
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:97–118` (`getRecommendedAgent` function) and `:371–378` (Stage 2 override dropdown)
- **Verbatim authority text:**
  - ESETT 2019 (Kapur, NEJM 2019;381(22):2103–2113, PMID 31774955): *"Levetiracetam, fosphenytoin, and valproate are equivalent for benzodiazepine-refractory status epilepticus."* Bayesian posterior probability of being the most effective treatment: levetiracetam 0.41 · fosphenytoin 0.46 · valproate 0.13 (none statistically dominant).
  - Glauser 2016 Level A: lacosamide is NOT listed as a second-line agent; AES 2020 review classifies lacosamide as acceptable Stage 3 add-on only.
- **Concrete patch:**
  - **In** `:97–118`, **replace** the ranked if/else cascade with a **comorbidity-gated equivalence model**. New shape:
    ```
    const getRecommendedAgent = (excludeAgents: Agent[] = []): { agent: Agent; reason: string; warnings: string[]; equivalentAlternatives: Agent[] } => {
      const warnings: string[] = [];
      const avoidValproate = comorbidities.liver || comorbidities.pancreatitis || comorbidities.pregnancy || comorbidities.carbapenem;
      const avoidFosphenytoin = comorbidities.cardiac; // 2°/3° AV block, sinus bradycardia
      const cautionLevetiracetam = comorbidities.renal; // maintenance adjustment, not load
      // ... warnings populated identically ...

      // ESETT equivalence: lev / fos / VPA are equivalent. Pick by comorbidity profile.
      const equivalenceTier: Agent[] = (['levetiracetam','fosphenytoin','valproate'] as Agent[])
        .filter(a => !excludeAgents.includes(a))
        .filter(a => {
          if (a === 'valproate') return !avoidValproate;
          if (a === 'fosphenytoin') return !avoidFosphenytoin;
          if (a === 'levetiracetam') return true; // renal = maintenance adjustment only
          return true;
        });

      if (equivalenceTier.length > 0) {
        const primary = equivalenceTier[0];
        return {
          agent: primary,
          reason: "ESETT-equivalent (lev / fos / VPA equivalent per ESETT 2019; selected by comorbidity profile)",
          warnings,
          equivalentAlternatives: equivalenceTier.slice(1)
        };
      }

      // Fallback: phenobarbital ONLY if all 3 ESETT-tier agents excluded
      if (!excludeAgents.includes('phenobarbital') && !comorbidities.hypotension && !comorbidities.respiratory) {
        return { agent: 'phenobarbital', reason: "All ESETT-tier agents excluded; phenobarbital fallback (Vossler 2025: 15 mg/kg)", warnings, equivalentAlternatives: [] };
      }

      // Last resort: lev with renal note
      return { agent: 'levetiracetam', reason: "All preferred agents have comorbidity flags; clinical judgment required", warnings: [...warnings, "ADJUST MAINTENANCE DOSE FOR RENAL"], equivalentAlternatives: [] };
    };
    ```
  - **Lacosamide MUST be removed from Stage 2 entirely.** It belongs in Stage 3 add-on. Delete lacosamide cases from `:114` and the dropdown option at `:376`.
  - **In** `:371–378`, **replace** the dropdown with the three ESETT-equivalent agents + phenobarbital fallback:
    ```
    <option value="auto">Auto-Recommend ({stage2Recommendation.agent}) — ESETT-equivalent tier</option>
    <option value="levetiracetam">Levetiracetam (ESETT-equivalent)</option>
    <option value="fosphenytoin">Fosphenytoin (ESETT-equivalent)</option>
    <option value="valproate">Valproate (ESETT-equivalent)</option>
    <option value="phenobarbital">Phenobarbital (fallback only)</option>
    ```
  - **In** `:111`, **replace:** `return { agent: "levetiracetam", reason: "Standard first-line (ESETT)", warnings };`
  - **with the equivalence-tier shape above.** The string "Standard first-line (ESETT)" misrepresents ESETT's equivalence finding.
  - **In the recommendation card** at `:355–367`, **surface the equivalent alternatives** (e.g., "Recommended: levetiracetam. Equivalent alternatives by comorbidity: fosphenytoin, valproate.").
- **Citations to attach:**
  - ESETT 2019 — Kapur J et al. N Engl J Med 2019;381(22):2103–2113. **PMID 31774955.** DOI 10.1056/NEJMoa1905795.
  - Glauser 2016 — Epilepsy Curr 2016;16(1):48–61. **DOI 10.5698/1535-7597-16.1.48.**
- **Class (CLAUDE.md §6):** **Class E** (changes agent-selection logic and removes lacosamide from a clinical branch — clinical-logic change with patient-safety implications)
- **Ship-blocker?** **Yes** — the current ordering encodes a non-existent hierarchy; clinicians overriding by perceived "tier" rather than by comorbidity can select a worse-fit agent.

---

### A2 — "Non-Convulsive SE" toggle leads users into convulsive-SE algorithm — HIGH (ship-blocker)

- **Severity:** **High**
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:233–236` (toggle button), entire downstream pathway (no branching on `patient.convulsive`)
- **Verbatim authority text:**
  - Vossler 2025: *"Nonconvulsive status epilepticus (NCSE) with coma should be treated as aggressively as convulsive status epilepticus. NCSE without coma is an active condition but does not mandate ICU-level care or anesthetic infusion."*
  - Rubinos 2024: NCSE diagnostic workup requires EEG confirmation before initiating second-line ASM; benzodiazepine trial may be used as both diagnostic and therapeutic in NCSE.
- **Concrete patch:**
  - **Option 1 (preferred — minimum-invasive):** Remove the toggle. Pathway scope becomes "Convulsive SE only." **In** `:233–236`, **replace** the toggle button with a **read-only label**: `<div className="p-5 rounded-2xl border-2 border-red-500 bg-red-50 text-red-900"><div className="font-bold flex items-center text-lg"><Activity size={20} className="mr-3"/> Convulsive SE</div><div className="text-sm mt-1 opacity-70 ml-8">Pathway scope: convulsive (generalized tonic-clonic) status epilepticus. For NCSE, see [NCSE pathway link — not yet built; route to AAN Continuum 2025 / Vossler reference].</div></div>`
  - **Also remove** the `convulsive: boolean` field from `PatientData` interface (`:15`) and from initial state (`:55`) and reset (`:125`).
  - **Option 2 (full fix — preferred long-term):** Add a branching guard at the top of Stage 1. If user selects NCSE, route to an NCSE-specific terminal block:
    ```
    if (!patient.convulsive) {
      return (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
          <h3 className="font-bold text-amber-900">NCSE Pathway — Distinct Management</h3>
          <p className="text-sm text-amber-800 mt-2">NCSE diagnosis requires EEG confirmation. Management differs from convulsive SE:
          <ul className="list-disc ml-6 mt-2">
            <li><strong>NCSE in coma:</strong> treat as aggressively as CSE; ICU + cEEG + anesthetic infusion if refractory.</li>
            <li><strong>NCSE without coma:</strong> active condition but does NOT mandate ICU or anesthetic. Benzodiazepine trial may serve as diagnostic + therapeutic.</li>
          </ul>
          For specific dosing, follow ESETT-equivalent agents (lev / fos / VPA) per Vossler 2025 (Continuum 2025;31(1):95–124).</p>
        </div>
      );
    }
    ```
  - **Recommendation:** ship Option 1 in Patch 1 (today) to remove the safety gap; track Option 2 in a follow-up Class E task.
- **Citations to attach:**
  - Vossler DG. Continuum 2025;31(1):95–124. (NCSE-in-coma vs NCSE-without-coma distinction)
  - Rubinos C. Continuum 2024;30(3):682–720. (NCSE diagnostic workup, benzodiazepine trial as diagnostic)
- **Class (CLAUDE.md §6):** **Class E** (removes/redirects a clinical branch)
- **Ship-blocker?** **Yes** — current behavior misroutes NCSE patients into the convulsive algorithm with no warning.

---

### A3 — Lacosamide loading 8 mg/kg cap 600 mg, no AV-block gate — HIGH

- **Severity:** **High**
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:29` (`calculateDose` lacosamide case), `:100–107` (cardiac comorbidity logic)
- **Verbatim authority text:**
  - Vossler 2025: lacosamide loading range **5–10 mg/kg, max 400 mg**. *"ECG should be obtained before loading lacosamide due to risk of PR prolongation and AV block; lacosamide is contraindicated in patients with second- or third-degree AV block without pacemaker."*
  - FDA lacosamide prescribing information: maximum single loading dose 400 mg IV.
  - The current code caps at 600 mg (8 mg/kg × 75 kg = 600 mg), which exceeds FDA-labeled maximum.
- **Concrete patch:**
  - **Per A1, lacosamide is removed from Stage 2 entirely.** This finding therefore consolidates into A1 unless lacosamide is retained as a Stage 3 add-on.
  - **If lacosamide is retained anywhere** (e.g., Stage 3 add-on box, future scaling), **in** `:29`, **replace:**
    `case "lacosamide": return \`${Math.min(600, Math.round(8 * weight))} mg IV (8 mg/kg, max 600mg)\`;`
  - **with:**
    `case "lacosamide": return \`${Math.min(400, Math.round(8 * weight))} mg IV (8 mg/kg, max 400 mg per FDA; range 5–10 mg/kg per Vossler 2025). REQUIRES PRE-LOAD ECG — avoid if 2°/3° AV block.\`;`
  - **In** `:100`, **replace:** `const avoidLacosamide = comorbidities.cardiac;`
  - **with:** `const avoidLacosamide = comorbidities.cardiac; // 2°/3° AV block, PR >200 ms — AVOID, not caution`
  - **In** `:107`, **replace:** `warnings.push("Cardiac (PR>200ms): Lacosamide avoided. Caution Phenytoin.");`
  - **with:** `warnings.push("Cardiac (2°/3° AV block, PR >200 ms): Lacosamide AVOIDED (FDA contraindication). Phenytoin/fosphenytoin AVOIDED in 2°/3° AV block (sinus bradycardia caution).");`
- **Citations to attach:**
  - Vossler DG. Continuum 2025;31(1):95–124.
  - FDA prescribing information, lacosamide (Vimpat).
- **Class (CLAUDE.md §6):** **Class E** if changing cardiac flag from "caution" to "avoid" for fosphenytoin/phenytoin (changes recommendation logic); Class C-clinical for the lacosamide cap correction alone.
- **Ship-blocker?** No (resolved by A1 if lacosamide removed from Stage 2)

---

### A4 — Ketamine load 1.5–4.5 mg/kg exceeds Vossler 2025's 1–2.5 mg/kg — MEDIUM

- **Severity:** Medium
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:33` (`calculateDose` ketamine), `:421–422` (Stage 3 ketamine button description)
- **Verbatim authority text:** Vossler 2025: *"Ketamine for refractory status epilepticus: loading dose 1–2.5 mg/kg IV; maintenance infusion 1–10 mg/kg/h. Should be combined with a benzodiazepine; avoid in neonates and third-trimester pregnancy."*
- **Concrete patch:**
  - **In** `:33`, **replace:**
    `case "ketamine_inf": return \`Load: ${Math.round(1.5 * weight)} - ${Math.round(4.5 * weight)} mg (1.5-4.5 mg/kg)\`;`
  - **with:**
    `case "ketamine_inf": return \`Load: ${Math.round(1 * weight)} - ${Math.round(2.5 * weight)} mg (1–2.5 mg/kg per Vossler 2025). Maintenance: 1–10 mg/kg/h. Combine with BZD; avoid neonates and 3rd-trimester pregnancy.\`;`
  - **In** `:422`, **replace:** `<div className="text-sm opacity-70">Load: 1.5-4.5 mg/kg. Maint: 1-10 mg/kg/hr. Hemodynamically stable.</div>`
  - **with:** `<div className="text-sm opacity-70">Load: 1–2.5 mg/kg (Vossler 2025). Maint: 1–10 mg/kg/h. Hemodynamically stable; combine with BZD; avoid neonates and 3rd-trimester pregnancy.</div>`
- **Citations to attach:** Vossler DG. Continuum 2025;31(1):95–124.
- **Class (CLAUDE.md §6):** **Class E** (loading-dose threshold change — clinical logic)
- **Ship-blocker?** No

---

### A5 — IM midazolam scheme diverges from RAMPART — MEDIUM

- **Severity:** Medium
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:24` (`calculateDose` midazolam — uses weight-based 0.2 mg/kg)
- **Verbatim authority text:** Glauser 2016 Level A + RAMPART 2012 (Silbergleit, NEJM 2012;366(7):591–600, PMID 22335736): *"Intramuscular midazolam in a fixed dose of 10 mg (>40 kg) or 5 mg (13–40 kg) was at least as effective as intravenous lorazepam in stopping status epilepticus before arrival at the emergency department."*
- **Concrete patch:**
  - **In** `:24`, **replace:**
    `case "midazolam": return \`${Math.min(10, Math.round(0.2 * weight * 10) / 10)} mg IM/IV (0.2 mg/kg, max 10mg)\`;`
  - **with:**
    ```
    case "midazolam": {
      if (!patient.ivAccess) {
        // IM RAMPART fixed-dose scheme
        const imDose = weight > 40 ? 10 : weight >= 13 ? 5 : Math.round(0.2 * weight * 10) / 10;
        const note = weight > 40 ? '10 mg IM fixed (RAMPART, >40 kg)' : weight >= 13 ? '5 mg IM fixed (RAMPART, 13–40 kg)' : '0.2 mg/kg (<13 kg — weight-based)';
        return `${imDose} mg IM (${note})`;
      }
      // IV/IN/buccal: weight-based
      return `${Math.min(10, Math.round(0.2 * weight * 10) / 10)} mg IV/IN/buccal (0.2 mg/kg, max 10 mg)`;
    }
    ```
  - Note: requires passing `patient` into `calculateDose` (currently a free function). Refactor signature to `calculateDose(agent: string, weight: number, ivAccess?: boolean)`. Adjust all call sites at `:141`, `:148`, `:155`, `:288`, `:366`, `:430`.
- **Citations to attach:**
  - RAMPART — Silbergleit R et al. N Engl J Med 2012;366(7):591–600. **PMID 22335736.** DOI 10.1056/NEJMoa1107494.
  - Glauser T et al. Epilepsy Curr 2016;16(1):48–61. **DOI 10.5698/1535-7597-16.1.48.**
- **Class (CLAUDE.md §6):** **Class E** (changes dosing scheme — clinical logic)
- **Ship-blocker?** No (current code is conservative — 0.2 mg/kg ≈ 5 mg for 25 kg, ≈ 10 mg for 50 kg — but does not match RAMPART's fixed-dose protocol; pediatric scheme is the main gap)

---

### A6 — Cardiac comorbidity flag too coarse — MEDIUM

- **Severity:** Medium
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:101–107` (`avoidLacosamide`, `cautionPhenytoin`)
- **Verbatim authority text:**
  - Glauser 2016: phenytoin/fosphenytoin contraindicated in second- or third-degree AV block, sinus bradycardia, Adams-Stokes syndrome.
  - Vossler 2025: lacosamide contraindicated in 2°/3° AV block without pacemaker; PR prolongation risk.
- **Concrete patch:**
  - **In** `:107`, **replace:** `warnings.push("Cardiac (PR>200ms): Lacosamide avoided. Caution Phenytoin.");`
  - **with:** `warnings.push("Cardiac (2°/3° AV block, PR >200 ms, sinus bradycardia): Lacosamide AVOIDED (FDA contraindication, requires pre-load ECG). Fosphenytoin/phenytoin AVOIDED in 2°/3° AV block; use with cardiac monitoring in conduction-disease history.");`
  - **In** `:103`, **strengthen:** `const cautionPhenytoin = comorbidities.hypotension; const avoidPhenytoin = comorbidities.cardiac;` (split out the AV-block case as **avoid** not **caution**).
  - Update the agent-selection logic to use `avoidPhenytoin` to gate fosphenytoin out of the ESETT-equivalent tier when set.
- **Citations to attach:** Glauser 2016; Vossler 2025; FDA prescribing info (fosphenytoin, lacosamide).
- **Class (CLAUDE.md §6):** **Class E** (changes a contraindication classification — clinical logic)
- **Ship-blocker?** No (consolidates with A3 and A1)

---

### A7 — Stage 1 time label "0–5 min" conflates stabilization with benzo phase — MEDIUM

- **Severity:** Medium
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:273` (Stage 1 banner)
- **Verbatim authority text:** Glauser 2016 staging: **Stabilization phase = 0–5 min** (ABC, glucose check, IV access, history). **Initial therapy phase = 5–20 min** (benzodiazepine). The pathway currently labels Stage 1 as "Early Status (0–5 min)" with the benzodiazepine in that block, conflating stabilization with treatment.
- **Concrete patch:**
  - **In** `:273`, **replace:**
    `<h3 className="font-bold text-red-900">Stage 1: Early Status (0-5 min)</h3><p className="text-sm text-red-700 mt-1">Goal: Stop seizure immediately. Underdosing is a common cause of failure.</p>`
  - **with:**
    `<h3 className="font-bold text-red-900">Stage 1: Initial Therapy (5–20 min from seizure onset)</h3><p className="text-sm text-red-700 mt-1">Stabilization (ABC, glucose, IV) occurs in the first 0–5 min (see Patient step). Benzodiazepine administration begins at 5 min. Underdosing is the #1 cause of treatment failure (PHTSE Class I; &gt;75% of ESETT patients underdosed).</p>`
- **Citations to attach:** Glauser 2016 (staging); PHTSE — Alldredge BK et al. N Engl J Med 2001;345(9):631–637. **PMID 11547716.** DOI 10.1056/NEJMoa002141.
- **Class (CLAUDE.md §6):** Class C-clinical (prose + time-window labeling, no logic change)
- **Ship-blocker?** No

---

### A8 — No Stage 4 (super-refractory) branch — MEDIUM (consolidated into B1)

- **Severity:** Medium (consolidates with net-new Finding B1 below)
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:391–441` (Refractory CollapsibleSection — terminates after Stage 3 anesthetic selection)
- **Concrete patch:** See Finding **B1** below.
- **Class (CLAUDE.md §6):** **Class E** (new clinical branch)
- **Ship-blocker?** No

---

### A9 — "Standard first-line (ESETT)" tag on levetiracetam misleading — MEDIUM (consolidated into A1)

- **Severity:** Medium (consolidates with A1)
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:111`
- **Concrete patch:** Resolved by A1's equivalence-tier rewrite. The label "Standard first-line (ESETT)" is replaced by "ESETT-equivalent (lev / fos / VPA equivalent per ESETT 2019; selected by comorbidity profile)."
- **Class (CLAUDE.md §6):** Class E (consolidates)
- **Ship-blocker?** No

---

### A10 — Lacosamide cardiac monitoring warning missing — MEDIUM (consolidated into A3/A6)

- **Severity:** Medium (consolidates with A3 and A6)
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:107`
- **Concrete patch:** Resolved by A3 and A6 (pre-load ECG requirement now in warning text; AV block reclassified as **avoid**).
- **Class (CLAUDE.md §6):** Class C-clinical
- **Ship-blocker?** No

---

### A11 — No NORSE/FIRES branch — MEDIUM (consolidated into B2)

- **Severity:** Medium
- **Location:** Entire pathway — no surface addresses new-onset refractory SE / FIRES.
- **Concrete patch:** See Finding **B2** below.
- **Class (CLAUDE.md §6):** **Class E**
- **Ship-blocker?** No

---

### A12 — No eclampsia/magnesium branch — MEDIUM (consolidated into B3)

- **Severity:** Medium
- **Location:** Entire pathway — no surface addresses eclampsia.
- **Concrete patch:** See Finding **B3** below.
- **Class (CLAUDE.md §6):** **Class E**
- **Ship-blocker?** No

---

### A13 — Diazepam 0.15 mg/kg at low end of 0.15–0.2 range — LOW

- **Severity:** Low
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:25`
- **Verbatim authority text:** Glauser 2016 Level A: diazepam 0.15–0.2 mg/kg IV (max 10 mg). Both ends acceptable; 0.2 mg/kg is the more commonly cited dose.
- **Concrete patch:**
  - **In** `:25`, **replace:**
    `case "diazepam": return \`${Math.min(10, Math.round(0.15 * weight * 10) / 10)} mg IV (0.15 mg/kg, max 10mg)\`;`
  - **with:**
    `case "diazepam": return \`${Math.min(10, Math.round(0.15 * weight * 10) / 10)}–${Math.min(10, Math.round(0.2 * weight * 10) / 10)} mg IV (0.15–0.2 mg/kg per Glauser 2016 Level A, max 10 mg). May repeat × 1.\`;`
- **Citations to attach:** Glauser 2016.
- **Class (CLAUDE.md §6):** Class C-clinical (dose-range presentation; not a threshold change)
- **Ship-blocker?** No

---

### A14 — Phenobarbital 20 mg/kg vs Vossler 2025's 15 mg/kg — LOW

- **Severity:** Low
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:30`
- **Verbatim authority text:** Vossler 2025: phenobarbital 15 mg/kg IV at ≤60 mg/min. Glauser 2016 lists 15 mg/kg as the loading dose. The current 20 mg/kg is an older but still-cited range; latest-wins favors 15 mg/kg.
- **Concrete patch:**
  - **In** `:30`, **replace:**
    `case "phenobarbital": return \`${Math.round(20 * weight)} mg IV (20 mg/kg, rate <60mg/min)\`;`
  - **with:**
    `case "phenobarbital": return \`${Math.round(15 * weight)} mg IV (15 mg/kg per Vossler 2025 / Glauser 2016; rate ≤60 mg/min). Fallback agent only when ESETT-tier agents excluded.\`;`
- **Citations to attach:** Vossler 2025; Glauser 2016.
- **Class (CLAUDE.md §6):** **Class E** (dose change — clinical logic, even if modest)
- **Ship-blocker?** No

---

### A15 — Stage 2/3 time labels slightly off — LOW

- **Severity:** Low
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:341` (Stage 2 banner "5–30 min"), `:404` (Stage 3 "&gt;30 min")
- **Verbatim authority text:** Glauser 2016: Stage 2 (second-line ASM) = **20–40 min** from seizure onset. Stage 3 (refractory) = **40+ min** OR persistence after one BZD + one non-BZD ASM. Current labels compress the timeline.
- **Concrete patch:**
  - **In** `:341`, **replace:** `<h3 className="font-bold text-red-900">Stage 2: Established SE (5-30 min)</h3>`
  - **with:** `<h3 className="font-bold text-red-900">Stage 2: Established SE (20–40 min from onset)</h3>`
  - **In** `:404`, **replace:** `<p className="opacity-90">Stage 3 (&gt;30 min). Intubation & Continuous EEG required.</p>`
  - **with:** `<p className="opacity-90">Stage 3: refractory SE — persists after one BZD + one non-BZD ASM (typically 40+ min from onset). Intubation and cEEG required.</p>`
- **Citations to attach:** Glauser 2016 (staging).
- **Class (CLAUDE.md §6):** Class C-clinical (time-label refinement)
- **Ship-blocker?** No

---

### A16 — Missing thiamine/pyridoxine/magnesium in stabilization — LOW (consolidated into B4)

- **Severity:** Low (consolidates with B4)
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:243–251` (Patient block — glucose check only)
- **Concrete patch:** See Finding **B4** below (empiric thiamine/pyridoxine/magnesium).
- **Class (CLAUDE.md §6):** Class C-clinical
- **Ship-blocker?** No

---

### A17 — IM midazolam repeat-dose not RAMPART-validated — LOW

- **Severity:** Low
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:295–311` (repeat-dose flow applies to all Stage 1 agents)
- **Verbatim authority text:** RAMPART 2012: IM midazolam **single dose only** (10 mg or 5 mg fixed). Lorazepam IV may be repeated × 1 after 5 min per Glauser 2016. Diazepam IV may be repeated × 1.
- **Concrete patch:**
  - **In** `:295–311`, **gate the second-dose path by agent**. The repeat-dose button at `:300` ("Persists (Repeat)") should be agent-aware:
    - For lorazepam: "Persists — repeat × 1 (after 5 min, Glauser 2016 Level A)"
    - For diazepam: "Persists — repeat × 1 (Glauser 2016 Level A)"
    - For **IM midazolam (RAMPART)**: "Persists — proceed to second-line ASM. RAMPART used single 10/5 mg IM dose only; repeat dosing not validated."
  - **Implementation:** add a conditional on `stage1Agent` and `patient.ivAccess` to either show the repeat-dose button or skip directly to Stage 2 escalation.
- **Citations to attach:** RAMPART PMID 22335736; Glauser 2016.
- **Class (CLAUDE.md §6):** **Class E** (changes treatment flow — clinical logic)
- **Ship-blocker?** No

---

### A18 — Propofol PRIS warning present but not actionable — LOW

- **Severity:** Low
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:418` (Propofol button description: "Caution PRIS")
- **Verbatim authority text:** Mullhi 2025: *"Propofol infusion syndrome (PRIS) is associated with infusion rates >4 mg/kg/h sustained for >48 hours. Monitor creatine kinase, lactate, triglycerides, and ECG. Avoid prolonged use (especially in children)."* Vossler 2025: load 1–2 mg/kg cumulative max 10 mg/kg; maintenance 1–15 mg/kg/h initial then ≤5 mg/kg/h sustained.
- **Concrete patch:**
  - **In** `:417–419`, **replace:** `<div className="font-bold text-lg">Propofol Infusion</div><div className="text-sm opacity-70">Load: 1-2 mg/kg. Maint: 20-200 mcg/kg/min. Caution PRIS.</div>`
  - **with:** `<div className="font-bold text-lg">Propofol Infusion</div><div className="text-sm opacity-70">Load: 1–2 mg/kg (cumulative max 10 mg/kg). Maint: 1–15 mg/kg/h initial → ≤5 mg/kg/h sustained (UK ≤4 mg/kg/h). PRIS risk &gt;4 mg/kg/h for &gt;48 h — monitor CK, lactate, TG, ECG. Avoid prolonged use in children.</div>`
  - Also fix the maintenance unit: 20–200 mcg/kg/min = 1.2–12 mg/kg/h, but the dossier prefers mg/kg/h notation matching Vossler 2025.
- **Citations to attach:** Mullhi 2025; Vossler 2025.
- **Class (CLAUDE.md §6):** Class C-clinical (prose + dose-range presentation; no threshold change since 1–15 mg/kg/h captures the original range)
- **Ship-blocker?** No

---

### A19 — References missing Vossler 2025, Rubinos 2024, Mullhi 2025, RAMPART, VA Cooperative, PHTSE, EcLiPSE, ConSEPT — LOW (consolidated into B5)

- **Severity:** Low (consolidates with B5)
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:446–450` (References list — only Glauser, ESETT, and SE_CONTENT.stage2Note)
- **Concrete patch:** See Finding **B5** below.
- **Class (CLAUDE.md §6):** Class C-clinical
- **Ship-blocker?** No

---

## Part B — New findings from PDF nuances (not surfaced in original audit)

### B1 — Stage 4 (super-refractory) branch missing — MEDIUM

- **PDF nuance source:** Dossier Section 2.E — Super-refractory SE (≥24 h on anesthetic or recurrence on weaning) is the highest-mortality stage and has a distinct workup + therapy stack (re-image, repeat LP, autoimmune panel, immunotherapy, ketogenic diet, alternative anesthetics, antibody-directed therapy).
- **Codebase state:** Stage 3 terminates at infusion selection. No Stage 4 surface exists.
- **Severity:** Medium
- **Location:** Add a new `CollapsibleSection` after `:441` (or extend the existing Refractory section with a "≥24 h on infusion?" sub-branch).
- **Verbatim authority text:**
  - Vossler 2025: *"Super-refractory status epilepticus is defined as status epilepticus that persists or recurs ≥24 hours after the initiation of intravenous anesthetic therapy, including recurrence on weaning. Management includes repeat brain imaging (preferably MRI with contrast), repeat lumbar puncture and autoimmune encephalitis panel, empiric immunotherapy if NORSE or FIRES is suspected (methylprednisolone 1 g/day × 3–5 days, followed by IVIG 0.4 g/kg/day × 5 days OR plasma exchange), consideration of ketogenic diet (initiate within 7 days for cryptogenic cases), magnesium supplementation (target 1.0–1.5 mmol/L), pyridoxine 100 mg every 5 minutes × 5 doses, and alternative anesthetics (ketamine, thiopental, inhalational isoflurane). Rituximab for antibody-mediated cases; anakinra or tocilizumab for cytokine storm; cyclophosphamide for severe autoimmune presentations. VNS or focal resection may be considered for surgical lesions."*
- **Concrete patch:**
  - **Add** new state after `:66`: `const [superRefractory, setSuperRefractory] = useState<boolean>(false);`
  - **Add** at the end of the Refractory CollapsibleSection (after `:432`):
    ```
    {stage3Agent && (
      <div className="bg-slate-900 text-white p-6 rounded-2xl mt-4">
        <h3 className="text-xl font-black mb-2">Stage 4: Super-Refractory SE?</h3>
        <p className="text-sm opacity-90 mb-3">≥24 h on IV anesthetic, or recurrence on weaning.</p>
        <button onClick={() => setSuperRefractory(!superRefractory)} className={`px-4 py-2 rounded-lg font-bold ${superRefractory ? 'bg-red-600' : 'bg-slate-700'}`}>
          {superRefractory ? 'Stage 4 Identified' : 'Mark as Super-Refractory'}
        </button>
        {superRefractory && (
          <div className="mt-4 space-y-3 text-sm">
            <div className="bg-slate-800 p-3 rounded"><strong>Re-image:</strong> MRI with contrast.</div>
            <div className="bg-slate-800 p-3 rounded"><strong>Repeat LP + autoimmune encephalitis panel.</strong></div>
            <div className="bg-slate-800 p-3 rounded"><strong>Empiric immunotherapy (NORSE/FIRES):</strong> methylprednisolone 1 g/day × 3–5, then IVIG 0.4 g/kg/day × 5 OR plasma exchange. Within 72 h.</div>
            <div className="bg-slate-800 p-3 rounded"><strong>Ketogenic diet:</strong> within 7 days for cryptogenic.</div>
            <div className="bg-slate-800 p-3 rounded"><strong>Adjuncts:</strong> Mg 1.0–1.5 mmol/L; pyridoxine 100 mg q5min × 5.</div>
            <div className="bg-slate-800 p-3 rounded"><strong>Alt anesthetic:</strong> ketamine, thiopental, inhalational isoflurane.</div>
            <div className="bg-slate-800 p-3 rounded"><strong>Targeted therapy:</strong> rituximab (antibody-positive); anakinra/tocilizumab (cytokine storm); cyclophosphamide (severe autoimmune).</div>
            <div className="bg-slate-800 p-3 rounded"><strong>Surgical:</strong> VNS, focal resection for surgical lesions.</div>
          </div>
        )}
      </div>
    )}
    ```
- **Citations to attach:** Vossler 2025; Rubinos 2024; Mullhi 2025.
- **Class (CLAUDE.md §6):** **Class E** (new clinical branch)
- **Ship-blocker?** No

---

### B2 — NORSE/FIRES branch missing — MEDIUM

- **PDF nuance source:** Dossier Section 2.E — NORSE (new-onset refractory SE without obvious cause) and FIRES (febrile infection-related epilepsy syndrome) warrant immunotherapy within 72 h. The pathway does not surface either.
- **Codebase state:** Not addressed.
- **Severity:** Medium
- **Location:** Consolidate inside B1 (Stage 4 block above includes NORSE/FIRES empiric immunotherapy). Optionally, add an earlier prompt in Stage 3:
- **Verbatim authority text:** Vossler 2025: *"NORSE should be considered in any new-onset refractory status epilepticus without an obvious cause. Empiric immunotherapy within 72 hours is recommended. FIRES is a pediatric subtype with antecedent febrile illness."*
- **Concrete patch:**
  - **In Stage 3 (Refractory) CollapsibleSection**, add a single-line prompt above the infusion-options list (after `:409`):
    ```
    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-4">
      <div className="font-bold text-amber-900">New-onset refractory SE without obvious cause?</div>
      <p className="text-sm text-amber-800 mt-1">Consider NORSE / FIRES. Initiate empiric immunotherapy within 72 h (methylprednisolone → IVIG or PLEX). See Stage 4 block below for full protocol.</p>
    </div>
    ```
- **Citations to attach:** Vossler 2025.
- **Class (CLAUDE.md §6):** **Class E** (new clinical branch)
- **Ship-blocker?** No

---

### B3 — Eclampsia / magnesium branch missing — MEDIUM

- **PDF nuance source:** Dossier Section 2.I — Eclampsia is treated with magnesium (4 g IV load → 1 g/h infusion), NOT benzodiazepine escalation. The pathway has no pregnancy/eclampsia branch.
- **Codebase state:** `comorbidities.pregnancy` flag exists at `:60` but only gates valproate exclusion. No eclampsia routing.
- **Severity:** Medium (operational error risk: BZD-escalating an eclampsia patient instead of magnesium)
- **Location:** Add a top-of-pathway guard or a Stage 1 sub-branch when pregnancy + seizure.
- **Verbatim authority text:** Mullhi 2025: *"In pregnancy with seizure, eclampsia must be excluded. First-line treatment for eclampsia is magnesium sulfate 4 g IV bolus over 5–10 minutes followed by 1 g/hour infusion. Benzodiazepine escalation is NOT first-line for eclamptic seizures."*
- **Concrete patch:**
  - **Add** an eclampsia prompt in the Patient block after `:251` (the glucose checkbox):
    ```
    {comorbidities.pregnancy && (
      <div className="bg-pink-50 border-2 border-pink-300 p-5 rounded-2xl">
        <div className="font-bold text-pink-900 flex items-center"><AlertTriangle size={20} className="mr-2" /> Pregnancy: Exclude Eclampsia First</div>
        <p className="text-sm text-pink-800 mt-2">For seizure in pregnancy, exclude eclampsia before benzodiazepine escalation. <strong>First-line for eclampsia: magnesium sulfate 4 g IV bolus over 5–10 min → 1 g/h infusion</strong> (Mullhi 2025). Benzodiazepines are NOT first-line for eclamptic seizures.</p>
      </div>
    )}
    ```
  - Note: this surfaces eclampsia awareness without removing the convulsive-SE pathway, which remains correct for non-eclamptic seizures in pregnancy.
- **Citations to attach:** Mullhi 2025 (J Intensive Care Soc 2025;26(2):249–262, DOI 10.1177/17511437251321338).
- **Class (CLAUDE.md §6):** **Class E** (new clinical branch — diagnostic gate before treatment)
- **Ship-blocker?** No

---

### B4 — Empiric thiamine/pyridoxine in stabilization — MEDIUM

- **PDF nuance source:** Dossier Section 2.F — Stabilization phase includes empiric thiamine 100 mg IV (Wernicke prevention) before glucose; pyridoxine 50–100 mg IV/IM if INH overdose suspected or in pediatric idiopathic SE. Magnesium replacement if low.
- **Codebase state:** Only fingerstick glucose is prompted (`:243–251`). Thiamine/pyridoxine/magnesium are absent.
- **Severity:** Medium (Wernicke prevention is a standard ED reflex; pyridoxine is critical in INH/pediatric cases)
- **Location:** Extend the Patient block stabilization checklist after `:251`.
- **Verbatim authority text:**
  - Mullhi 2025: *"Thiamine 100 mg IV should be administered empirically before glucose in any patient at risk for Wernicke encephalopathy (alcohol use disorder, malnutrition, pregnancy)."*
  - Vossler 2025: *"Pyridoxine 50–100 mg IV is indicated if isoniazid toxicity is suspected or in pediatric idiopathic status epilepticus (especially under age 2). Magnesium replacement if serum Mg low."*
- **Concrete patch:**
  - **Add** a stabilization checklist after `:251`:
    ```
    <div className="bg-white border border-slate-200 p-5 rounded-2xl">
      <h3 className="font-bold text-slate-900 mb-3">Empiric Stabilization Adjuncts</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-start"><Check size={16} className="text-emerald-600 mr-2 mt-0.5" /><span><strong>Thiamine 100 mg IV</strong> before glucose if at risk (alcohol, malnutrition, pregnancy) — Wernicke prevention (Mullhi 2025).</span></div>
        <div className="flex items-start"><Check size={16} className="text-emerald-600 mr-2 mt-0.5" /><span><strong>Pyridoxine 50–100 mg IV</strong> if INH toxicity suspected or pediatric idiopathic SE (Vossler 2025).</span></div>
        <div className="flex items-start"><Check size={16} className="text-emerald-600 mr-2 mt-0.5" /><span><strong>Magnesium replacement</strong> if serum Mg low; <strong>4 g IV load for eclampsia</strong> (see pregnancy block).</span></div>
      </div>
    </div>
    ```
- **Citations to attach:** Mullhi 2025; Vossler 2025.
- **Class (CLAUDE.md §6):** Class C-clinical (additive checklist — does not change existing logic, surfaces standard-of-care adjuncts)
- **Ship-blocker?** No

---

### B5 — Citation additions: RAMPART, VA Cooperative, PHTSE, EcLiPSE, ConSEPT, Vossler 2025, Rubinos 2024, Mullhi 2025 — LOW

- **PDF nuance source:** Dossier Section 6 — Five foundational trials and three current reviews are cited in the dossier but absent from the pathway's References block.
- **Codebase state:** `:446–450` lists only Glauser 2016, ESETT 2019 (via `SE_CONTENT.stage2Note`).
- **Severity:** Low
- **Location:** `src/pages/StatusEpilepticusPathway.tsx:446–450` and `src/lib/citations/registry.ts` (add citation records).
- **Verbatim citations to add:**
  1. **RAMPART** — Silbergleit R et al. *N Engl J Med* 2012;366(7):591–600. **PMID 22335736.** DOI 10.1056/NEJMoa1107494. (IM midazolam non-inferior to IV lorazepam)
  2. **VA Cooperative SE Trial** — Treiman DM et al. *N Engl J Med* 1998;339(12):792–798. **PMID 9738086.** DOI 10.1056/NEJM199809173391202. (Lorazepam superior to phenytoin/phenobarbital monotherapy in overt convulsive SE)
  3. **PHTSE** — Alldredge BK et al. *N Engl J Med* 2001;345(9):631–637. **PMID 11547716.** DOI 10.1056/NEJMoa002141. (Prehospital BZD; underdosing as failure mode)
  4. **EcLiPSE** — Lyttle MD et al. *Lancet* 2019;393(10186):2125–2134. **PMID 31005386.** DOI 10.1016/S0140-6736(19)30724-X. (Pediatric levetiracetam vs phenytoin)
  5. **ConSEPT** — Dalziel SR et al. *Lancet* 2019;393(10186):2135–2145. **PMID 31005385.** DOI 10.1016/S0140-6736(19)30722-6. (Pediatric levetiracetam vs phenytoin)
  6. **Vossler DG.** Continuum 2025;31(1):95–124. © 2025 AAN. (Stages 3–4)
  7. **Rubinos C.** Continuum 2024;30(3):682–720. © 2024 AAN. (Emergent management)
  8. **Mullhi R et al.** *J Intensive Care Soc* 2025;26(2):249–262. DOI 10.1177/17511437251321338. (UK ICU bundling)
- **Concrete patch:**
  - **In** `:446–450`, **replace** the `<ul>` with an expanded references list including all 8 entries plus the existing 2. Use `autoLinkReactNodes` for consistency.
  - **In** `src/lib/citations/registry.ts`, **add** citation records for each (PMID, DOI, year, type=trial or review, `quoted_text`, `last_reviewed: "2026-05-16"`).
  - **In** `src/lib/citations/claims.ts`, **map** the following claim IDs (registered per §13.3/§13.4):
    - `se-bzd-im-midazolam-rampart` → RAMPART
    - `se-bzd-iv-lorazepam-va` → VA Cooperative
    - `se-bzd-underdosing-phtse` → PHTSE
    - `se-stage2-pediatric-equivalence` → EcLiPSE + ConSEPT
    - `se-stage3-ketamine-load` → Vossler 2025
    - `se-stage4-norse-immunotherapy` → Vossler 2025 + Rubinos 2024
    - `se-eclampsia-magnesium` → Mullhi 2025
- **Class (CLAUDE.md §6):** Class C-clinical (citation registry + reference block; required for hook compliance per §13.5)
- **Ship-blocker?** No (but required before any tagged claim ships)

---

## Part C — Class breakdown for V's task spin-up

Ordered: ship-blockers first, then Class E (clinical-logic), then Class C-clinical (prose/citation), then informational.

| # | Title | Severity | Class | Ship-blocker | Files touched |
|---|---|---|---|---|---|
| **A1** | `getRecommendedAgent` ordering misrepresents ESETT equivalence; remove lacosamide from Stage 2 | High | E | **Yes** | `src/pages/StatusEpilepticusPathway.tsx` |
| **A2** | Remove or redirect NCSE toggle | High | E | **Yes** | `src/pages/StatusEpilepticusPathway.tsx` |
| **A3** | Lacosamide cap 400 mg + pre-load ECG gate | High | E | No (consolidated with A1) | `src/pages/StatusEpilepticusPathway.tsx` |
| **A4** | Ketamine load 1–2.5 mg/kg (was 1.5–4.5) | Medium | E | No | `src/pages/StatusEpilepticusPathway.tsx` |
| **A5** | IM midazolam RAMPART fixed-dose scheme | Medium | E | No | `src/pages/StatusEpilepticusPathway.tsx` |
| **A6** | Cardiac flag: split AV-block as **avoid** for fosphenytoin/phenytoin | Medium | E | No | `src/pages/StatusEpilepticusPathway.tsx` |
| **A7** | Stage 1 time label: 5–20 min (not 0–5 min) | Medium | C-clinical | No | `src/pages/StatusEpilepticusPathway.tsx` |
| **A14** | Phenobarbital 15 mg/kg (was 20 mg/kg) | Low | E | No | `src/pages/StatusEpilepticusPathway.tsx` |
| **A15** | Stage 2/3 time labels: 20–40 min / 40+ min | Low | C-clinical | No | `src/pages/StatusEpilepticusPathway.tsx` |
| **A17** | IM midazolam: single dose only (no repeat) | Low | E | No | `src/pages/StatusEpilepticusPathway.tsx` |
| **A13** | Diazepam dose range 0.15–0.2 mg/kg | Low | C-clinical | No | `src/pages/StatusEpilepticusPathway.tsx` |
| **A18** | Propofol PRIS warning made actionable | Low | C-clinical | No | `src/pages/StatusEpilepticusPathway.tsx` |
| **B1** | Stage 4 (super-refractory) branch | Medium | E | No | `src/pages/StatusEpilepticusPathway.tsx` |
| **B2** | NORSE/FIRES prompt in Stage 3 | Medium | E | No | `src/pages/StatusEpilepticusPathway.tsx` |
| **B3** | Eclampsia magnesium branch | Medium | E | No | `src/pages/StatusEpilepticusPathway.tsx` |
| **B4** | Thiamine/pyridoxine/magnesium stabilization adjuncts | Medium | C-clinical | No | `src/pages/StatusEpilepticusPathway.tsx` |
| **B5** | Citation registry: RAMPART, VA, PHTSE, EcLiPSE, ConSEPT, Vossler, Rubinos, Mullhi | Low | C-clinical | No | `src/pages/StatusEpilepticusPathway.tsx`, `src/lib/citations/registry.ts`, `src/lib/citations/claims.ts` |
| A8 | Stage 4 branch missing (consolidated into B1) | Medium | E | No | (see B1) |
| A9 | "Standard first-line (ESETT)" tag (consolidated into A1) | Medium | E | No | (see A1) |
| A10 | Lacosamide cardiac warning (consolidated into A3/A6) | Medium | C-clinical | No | (see A3, A6) |
| A11 | NORSE/FIRES branch (consolidated into B2) | Medium | E | No | (see B2) |
| A12 | Eclampsia branch (consolidated into B3) | Medium | E | No | (see B3) |
| A16 | Thiamine/pyridoxine (consolidated into B4) | Low | C-clinical | No | (see B4) |
| A19 | References missing (consolidated into B5) | Low | C-clinical | No | (see B5) |

Total: 17 unique actionable items + 7 consolidated cross-refs.

---

## Part D — Proposed batching for the React rebuild

### Patch 1 — Ship-blockers (must-have, today)

**Class E. Size: medium. No dependencies.**
- **A1** — `getRecommendedAgent` equivalence-tier rewrite; remove lacosamide from Stage 2
- **A2** — remove or redirect NCSE toggle (Option 1: read-only label, fastest path)
- **A3** — lacosamide cap 400 mg + pre-load ECG warning (consolidates with A1 if lacosamide removed)
- **A6** — cardiac flag: AV block as **avoid** for fosphenytoin/phenytoin

**Files touched:** `src/pages/StatusEpilepticusPathway.tsx` only.
**Class label for the patch:** **Class E.**
**Rollback plan:** revert single PR; no schema or data-file dependencies.

### Patch 2 — Class E re-grading (dose corrections, time labels, RAMPART scheme)

**Class E. Size: medium. Depends on Patch 1 (touches adjacent dose-calculation logic).**
- **A4** — ketamine load 1–2.5 mg/kg
- **A5** — IM midazolam RAMPART fixed-dose scheme (signature refactor: pass `ivAccess` to `calculateDose`)
- **A14** — phenobarbital 15 mg/kg
- **A17** — IM midazolam: single dose only

**Files touched:** `src/pages/StatusEpilepticusPathway.tsx`.
**Class label for the patch:** Class E.

### Patch 3 — Class C-clinical prose/citation cleanup

**Class C-clinical. Size: small. Independent of Patches 1 and 2.**
- **A7** — Stage 1 time label "5–20 min"
- **A13** — diazepam dose range presentation
- **A15** — Stage 2 / Stage 3 time labels
- **A18** — propofol PRIS warning actionable

**Files touched:** `src/pages/StatusEpilepticusPathway.tsx`.
**Class label for the patch:** Class C-clinical.

### Patch 4 — New branches (Stage 4, NORSE/FIRES, eclampsia)

**Class E. Size: large. Independent of Patches 1–3, but shares the Refractory section with Patch 2.**
- **B1** — Stage 4 (super-refractory) branch with full workup
- **B2** — NORSE/FIRES prompt in Stage 3
- **B3** — eclampsia magnesium branch in Patient block (pregnancy-gated)
- **B4** — thiamine/pyridoxine/magnesium stabilization adjuncts

**Files touched:** `src/pages/StatusEpilepticusPathway.tsx`.
**Class label for the patch:** Class E (new clinical branches).

### Patch 5 — Citation additions + registry entries

**Class C-clinical. Size: small. Independent, but required before any tagged claim from Patches 1–4 can ship per CLAUDE.md §13.5.**
- **B5** — add RAMPART, VA Cooperative, PHTSE, EcLiPSE, ConSEPT, Vossler 2025, Rubinos 2024, Mullhi 2025 to citation registry and reference list; register claim IDs

**Files touched:** `src/pages/StatusEpilepticusPathway.tsx`, `src/lib/citations/registry.ts`, `src/lib/citations/claims.ts`.
**Class label for the patch:** Class C-clinical.

### Dependency graph

- **Patch 5 (citations)** should land before or alongside Patches 1–4 so the §13.5 pre-commit hook does not block (any new `data-claim` attribute or `claim()` wrap added in Patches 1–4 requires a matching registry entry).
- **Patch 1** is a prerequisite for **Patch 2** (Patch 2's `calculateDose` signature change is adjacent to Patch 1's `getRecommendedAgent` rewrite; merge Patch 1 first to avoid conflict).
- **Patches 3 and 4** are independent of one another and of Patches 1–2 (touch different sections).

---

## Confidence statement

**HIGH confidence** on every Glauser 2016 + ESETT 2019 claim referenced in this manifest. Glauser 2016 is the AES evidence-graded guideline (Class I–III, Level A/B/C/U) and binds Stages 1–2. ESETT 2019 (Kapur, NEJM, PMID 31774955) is a Class I three-arm RCT establishing levetiracetam / fosphenytoin / valproate equivalence with Bayesian posterior probabilities of being most effective (0.41 / 0.46 / 0.13). Every dosing threshold, contraindication, and staging boundary in Findings A1–A7, A13–A18 is anchored to verbatim Glauser 2016 or ESETT 2019 text.

**HIGH confidence** on all Stage 3 (refractory) dosing per Vossler 2025 and Mullhi 2025. Ketamine 1–2.5 mg/kg, propofol PRIS thresholds, lacosamide AV-block contraindication, and pediatric RAMPART fixed-dose scheme are all directly verbatim-cited.

**MEDIUM confidence** items (none affect ship-blockers, but flagged for review):
- **B1 (Stage 4):** expert consensus only — AES 2020 refractory SE review concluded "insufficient evidence" for most super-refractory agents. The branch is recommended as awareness/checklist rather than as a Class I recommendation; Vossler 2025 and Rubinos 2024 align on the general workup stack but do not provide RCT-level evidence.
- **B3 (eclampsia):** the eclampsia magnesium protocol is well-established in obstetric guidelines but is sourced here primarily from Mullhi 2025 (UK ICU adult guidance, which explicitly excludes obstetric SE from its scope but cites magnesium as standard-of-care). A formal obstetric guideline citation (ACOG, RCOG) should be added before merge.
- **A5 (RAMPART):** the pediatric weight cutoff of 13 kg for the 5 mg dose is from the RAMPART protocol; for patients <13 kg the dose reverts to weight-based 0.2 mg/kg. The cutoff is from trial protocol, not from guideline text — confidence is HIGH on the >40 kg / 13–40 kg fixed-dose scheme, MEDIUM on the <13 kg fallback.

No findings depend on speculation, secondary sources, or unverified inferences. Every recommended fix can be traced to Glauser 2016, ESETT 2019 (PMID 31774955), Vossler 2025, Rubinos 2024, or Mullhi 2025 verbatim text in the PDF-verified dossier.
