# Migraine Pathway — Evidence Verification Dossier

**Date:** 2026-05-15
**Auditor:** evidence-verifier
**Method:** Systematic 8-PDF extraction with latest-wins resolution rule
**Source code audited:** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/pages/MigrainePathway.tsx`

---

## Section 0 — Publication-year ranking (latest-wins authority order)

| Rank | PDF | Year | Type | Authority weight |
|---|---|---|---|---|
| 1 (WINS on ED parenteral) | Robblee J, Minen MT, Friedman BW, et al. **2025 guideline update to acute treatment of migraine for adults in the emergency department: The American Headache Society evidence assessment of parenteral pharmacotherapies.** *Headache* 2026;66:53–76. DOI: 10.1111/head.70016 | 2026 (received 20 Oct 2025) | **Formal AHS evidence-based guideline** (AAN CPG Process Manual, PRISMA, PROSPERO-registered). | **Highest — supersedes 2016 Orr et al. guideline.** Cannot be overruled by Continuum reviews or AHS 2021 Consensus for **ED parenteral** questions. |
| 2 (WINS on outpatient acute & preventive integration) | Ailani J, Burch RC, Robbins MS. **The American Headache Society Consensus Statement: Update on integrating new migraine treatments into clinical practice.** *Headache* 2021;61:1021–1039. DOI: 10.1111/head.14153 | 2021 | **AHS Consensus Statement** — expert consensus, not a formal CPG. | Highest for outpatient acute treatment selection (triptan/gepant/ditan), integration of newer agents. Yields to Robblee 2025 for ED parenteral. |
| 3 | Burch RB. **Acute Treatment of Migraine.** *Continuum* 2024;30(2):344–363. | Apr 2024 | Continuum review (educational, peer-reviewed). | Tier-3 for guideline questions; valuable for pregnancy, refractory, CDS nuance. |
| 4 | Burish M. **Cluster Headache, SUNCT, and SUNA.** *Continuum* 2024;30(2):391–410. | Apr 2024 | Continuum review citing AHS + EFNS (Table 6-3). | Authoritative-by-proxy for cluster. |
| 5 | Rizzoli PB. **Medication-Overuse Headache.** *Continuum* 2024;30(2):379–390. | Apr 2024 | Continuum review citing Ashina 2023 + Diener S1. | Authoritative-by-proxy for MOH. |
| 6 | Goadsby PJ. **Indomethacin-Responsive Headache Disorders.** *Continuum* 2024;30(2):488–497. | Apr 2024 | Continuum review (ICHD-3 + author protocol). | Authoritative for indomethacin trial protocol. |
| 7 | Nahas SJ. **Cranial Neuralgias.** *Continuum* 2024;30(2):473–487. | Apr 2024 | Continuum review citing AAN/EFNS. | Tier-3 + ICHD-3 criteria. |
| 8 (mislabeled) | **Lipton RB. Preventive Treatment of Migraine.** *Continuum* 2024;30(2):364–378. (Filename `Continuum-Acute Treatment of Migraine.pdf` is wrong — this is the **preventive** chapter.) | Apr 2024 | Continuum review. | Adjacent — not relevant to acute pathway audit. |

**Latest-wins for ED parenteral acute migraine:** Robblee 2025 > AHS 2021 Consensus > Burch 2024 Continuum review.

---

## Section 1 — Canonical clinical-question framework (A–J)

### A. Migraine diagnosis (ICHD-3 — verbatim from AHS 2021 p.1022 Table 1)
- ≥5 attacks fulfilling B–D
- Attacks 4–72 h (untreated/unsuccessful)
- ≥2 of: unilateral, pulsating, moderate/severe, aggravated by routine activity
- ≥1 of: nausea/vomiting, OR photophobia AND phonophobia
- Not better accounted for by another diagnosis
- **Chronic migraine:** ≥15 headache days/month for >3 months with ≥8 migraine days.

### B. First-line outpatient acute (AHS 2021 + Burch 2024 — Robblee silent here)
- **AHS 2021 (p.1023 verbatim):** NSAIDs / non-opioid analgesics / acetaminophen / caffeine combos for mild-to-moderate; triptans / DHE / gepants / ditans for moderate-severe or NSAID-refractory mild-moderate.
- **Triptan doses (Burch Table 3-3, p.350–351):** Sumatriptan PO 25/50/100 mg, max 200 mg/24h; Sumatriptan SC 3/4/6 mg, max 12 mg SC/24h; Sumatriptan nasal 5/10/20 mg; Rizatriptan 5/10 mg; Eletriptan 20/40 mg; Zolmitriptan 2.5/5 mg; Almotriptan 12.5 mg; Frovatriptan 2.5 mg; Naratriptan 1/2.5 mg.
- **Gepants:** Ubrogepant 50/100 mg; Rimegepant 75 mg ODT.
- **Ditans:** Lasmiditan 50/100/200 mg, single dose, no driving for 8 h.

### C. ED parenteral refractory — DEFINITIVE per Robblee 2025

**Robblee 2025 Practice Recommendations (Table 3, p.72 — verbatim):**

| Level A — Must Offer | Level B — Should Offer | Level C — May Offer | Level C — May NOT Offer | Level A — Must NOT Offer |
|---|---|---|---|---|
| **Prochlorperazine IV 10–12.5 mg** | **Dexketoprofen IV 50 mg** | Acetylsalicylic acid IV | **Diphenhydramine IV 50 mg** (as primary analgesic) | **Hydromorphone IV 1 mg** |
| **Greater occipital nerve block (GONB)** 0.5–3 mL 0.5% bupivacaine or 1% lidocaine | **Ketorolac IV 30–60 mg** | Chlorpromazine IV 12.5–25 mg | Morphine IV | |
| | **Metoclopramide IV 10 mg** | **Dexamethasone IV 8–16 mg** (acute pain) | Octreotide SC/IV | |
| | **Sumatriptan SC 3–6 mg** | Diclofenac IM | Paracetamol/Acetaminophen IV | |
| | **Supraorbital nerve block (SONB)** | Dipyrone IV | | |
| | | Droperidol IM 2.75–8.25 mg | | |
| | | Haloperidol IV 5 mg | | |
| | | Valproate IV 400–1000 mg | | |

**Major changes from 2016 → 2025:**
- Prochlorperazine **upgraded** Level B → **Level A (Must Offer)**.
- GONB **new Level A (Must Offer)** — three positive Class I sham-controlled studies.
- Dexketoprofen / Ketorolac / SONB — new at Level B.
- Dexamethasone IV — Level U → Level C (acute pain); **separately retains Level B — Should Offer for recurrence prevention** (Robblee p.55: "This question is not addressed in this update because there is no new evidence that would alter this recommendation since 2016").
- Acetaminophen IV downgraded Level B → Level C may NOT offer.
- Lidocaine IV downgraded Level C → Level U.
- **Hydromorphone IV: NEW Level A — Must NOT Offer** (inferior to prochlorperazine, higher ED return rate, MOH risk).

### D. Status migrainosus (≥72 h)
- **Definition (ICHD-3, Burch p.358–359):** debilitating migraine ≥72 h.
- **Inpatient DHE protocol (Burch p.360):** DHE + metoclopramide IV q8h. Nagy 2011 Neurology: longer course > 2 days.
- **Robblee 2025 on DHE:** **Level U** in ED ("needs better quality ED-specific studies").

### E. Special populations
- **Pregnancy (Burch Table 3-5, p.356 — verbatim):**
  - **First line:** Acetaminophen, Cyclobenzaprine, Diphenhydramine, **Metoclopramide**, SC Lidocaine
  - **First line for rescue:** **Triptans**
  - **Second line:** Ibuprofen (2nd trimester only), Ondansetron, **Prednisone (rescue)**, Prochlorperazine
  - **Third line / avoid:** Oxycodone, Butalbital
  - **Always avoid:** Lasmiditan, Gepants, **Ergots and DHE**, Valproate (teratogenic)
- **Cardiovascular disease (AHS 2021 p.1025, Burch p.352):**
  - Triptans contraindicated: CAD, coronary vasospasm, ischemic stroke, poorly controlled HTN, hemiplegic migraine, brainstem aura
  - DHE contraindicated: CAD, PVD, poorly controlled HTN, other vasoconstrictors, within 24 h of triptan
  - **Gepants and lasmiditan — preferred in vascular disease (no vasoconstriction)**
- **Renal:** NSAIDs avoid; gepant dose limit with verapamil.

### F. Recurrence prevention after acute episode
- **Dexamethasone Level B — Should Offer (2016 retained per Robblee p.55).**
- Dose: **10 mg IV** (Burch Table 3-6); Robblee Table 2 lists 8–16 mg IV.
- The **recurrence prevention** indication is distinct from the **acute pain** indication (Level C in 2025).

### G. Red flags
- Standard ED practice: thunderclap, fever/meningismus, focal deficit, AMS, papilledema, new HA in pregnancy, immunocompromised.
- SNNOOP10 framework widely used; not required by any of these 8 PDFs.
- Current pathway's seven red flags are consistent with standard practice.

### H. Medication-Overuse Headache
- **ICHD-3 criteria (Rizzoli Table 5-1, p.380 — verbatim):**
  - ≥15 headache days/month in pre-existing headache disorder
  - Regular overuse >3 months
  - Not better accounted for by another ICHD-3 diagnosis
- **Thresholds (Rizzoli p.381):**
  - Combination analgesics / triptans / ergots / opioids / butalbital: **>10 days/month for >3 months**
  - Simple analgesics (NSAID / acetaminophen / aspirin): **>15 days/month for >3 months**
- **Treatment (p.385–386):** Withdraw overused medication + start prevention. Bridge: naproxen 550 mg BID 2–4 wks, prednisone taper 60 mg, IV DHE, IV valproate, IV prochlorperazine. Anti-CGRP mAbs and gepants effective even in MOH context.

### I. Cluster headache (routing — absent from MigrainePathway)
- **ICHD-3 (Burish Table 6-2, p.395):** Severe unilateral orbital/supraorbital/temporal pain, 15–180 min, ipsilateral autonomic features OR restlessness, every-other-day to 8/day.
- **First-line acute (Burish Table 6-3, p.400 — AHS Grade A):**
  - **Oxygen high-flow 6–12 L/min via NRB** (15 L/min may be more effective per p.401)
  - **Sumatriptan SC 6 mg**
  - **Zolmitriptan nasal 5–10 mg**
- **Bridge:** Prednisone 100 mg/day × 5 days then taper -20 mg q3d; or ipsilateral GON injection with steroid.
- **Preventive:** Verapamil 360 mg/day TID (up to 720+ mg, ECG monitoring).

### J. Other primary headache disorders needing routing
- **Paroxysmal hemicrania (Goadsby Table 11-2):** Indomethacin-responsive. Trial: 25 mg TID × 5–7 d → 50 mg TID × 5–7 d → 75 mg TID × 2 wks. Adult dose 150–225 mg/day.
- **Hemicrania continua (Goadsby Table 11-3):** Same indomethacin protocol.
- **Trigeminal neuralgia (Nahas Table 10-2):** Carbamazepine 300–800 mg/day (only FDA-approved); oxcarbazepine 600–1200 mg/day; opioids avoided. Acute exacerbations: IV fosphenytoin or IV lidocaine.
- **SUNCT/SUNA (Burish Table 6-1):** Managed with lamotrigine; do NOT respond to O2 or indomethacin.
- **Occipital neuralgia (Nahas Table 10-5):** Local anesthetic block confirms diagnosis.

---

## Section 4 — Codebase audit grid (MigrainePathway.tsx vs consolidated algorithm)

| Assertion | Line(s) | Per consolidated algorithm | Verdict | Severity |
|---|---|---|---|---|
| Red-flag screen (7 items) | 99–101, 362–369 | Consistent with standard ED practice | **CORRECT** | — |
| Default antiemetic: **metoclopramide** | 123 | Robblee 2025: **Prochlorperazine = Level A**, Metoclopramide = Level B. Default inverted. | **AGENT-CHOICE-OFF** | **HIGH** |
| Antiemetic options: metoclop / prochlor / ondansetron at 10 mg | 502, 514 | Prochlor 10–12.5 mg correct; metoclop 10 mg correct; ondansetron only as nausea adjunct (Burch p.353) | **PARTIALLY CORRECT** — ondansetron labeling acceptable | LOW |
| Diphenhydramine 25/50 mg as akathisia premed | 122, 489–491 | Robblee p.63: anticholinergic premed reduces EPS | **CORRECT** | — |
| Ketorolac dose options: **15 / 30 / 45 mg** | 124, 537–554 | Robblee 2025: **30–60 mg Level B**. 45 mg non-standard ED dose. | **AGENT-CHOICE-OFF (dose)** — replace 45 with **60** | MEDIUM |
| Ketorolac CI: pregnancy + GFR<50 | 162–165 | Standard | **CORRECT** | — |
| **Dexamethasone options: 4 / 10 mg** | 125, 570 | Robblee Table 2: 8–16 mg IV; 4 mg sub-therapeutic | **THRESHOLD-OFF** — replace 4 with **8**; consider adding 16 | MEDIUM |
| Dex framing: "Prevents recurrence within 72 h. Single dose only." | 564 | Matches Level B recurrence-prevention indication | **CORRECT** | — |
| Sumatriptan 6 mg SC, max 12 mg/24h | 255 | Burch Table 3-3 verbatim | **CORRECT** | — |
| Sumatriptan **disabled in pregnancy** | 169–175 | Burch 2024 Table 3-5: triptans are **first-line rescue** in pregnancy | **OVER-RESTRICTIVE** — downgrade to WARNING with rescue indication | MEDIUM |
| Magnesium 1/2 g IV "Beneficial for aura/photophobia" | 618, 624–628 | Robblee: Level U overall; "may be considered in aura"; Burch 1–2 g for aura | **CORRECT** | — |
| Valproate 500/1000 mg, max 3 doses, q8h | 257 | Robblee Table 2: 400–1000 mg Level C; ≥800 mg may perform better | **PARTIALLY CORRECT** — add 800 mg option | LOW |
| Valproate disabled in pregnancy + hepatic | 176–179 | Teratogenic; hepatotoxicity | **CORRECT** | — |
| Second-line rescue: **magnesium + valproate only** | 706–728 | Should also include chlorpromazine IV, DHE IV (inpatient), GONB | **MISSING-BRANCH** | MEDIUM |
| **GONB / SONB nowhere in pathway** | (absent) | **Robblee 2025: GONB Level A — Must Offer.** Three Class I trials. | **MISSING-BRANCH** | **HIGH** |
| Sumatriptan disabled in basilar migraine | 174 | Burch p.352: prohibition questioned by observational data but vasoconstrictor-free alternatives preferred | Conservative, acceptable | LOW |
| No cluster headache routing | (absent) | Burish 2024: O2 + sumatriptan SC + zolmitriptan nasal — very different | **MISSING-BRANCH** | MEDIUM |
| No MOH screening at discharge | (absent) | Rizzoli 2024 ICHD-3 criteria | **MISSING-BRANCH** | LOW–MEDIUM |
| No indomethacin-responsive differential | (absent) | Goadsby 2024 protocol | **MISSING-BRANCH** | LOW |
| No trigeminal neuralgia routing | (absent) | Nahas 2024 | **MISSING-BRANCH** | LOW |
| Disclaimer "AHS/AAN" citation | 776 | Should cite Robblee 2025 (Headache 2026;66:53–76) | **CITATION STALE** | LOW |

---

## Section 5 — Findings (severity-ordered)

### HIGH
1. **Missing Level A — Greater Occipital Nerve Block.** Robblee 2025 elevates GONB to Level A on three Class I trials. Zero mention in pathway.
2. **Antiemetic default inverted.** Pathway defaults to metoclopramide (Level B); should default to **prochlorperazine** (Level A).

### MEDIUM
3. **Ketorolac dose ceiling.** 45 mg → **60 mg** to match Robblee Level B ceiling and standard ED dosing.
4. **Dexamethasone low dose 4 mg sub-therapeutic.** → **8 mg** low end + keep 10 mg default + consider 16 mg.
5. **Sumatriptan-in-pregnancy over-restrictive.** Burch 2024 lists triptans as first-line rescue.
6. **Second-line rescue incomplete.** Missing chlorpromazine IV, DHE IV (inpatient), GONB-as-rescue.
7. **Cluster headache missing differential branch.** Patient with cluster routed through migraine cocktail misses Level A oxygen.

### LOW
8. Valproate 800 mg option absent.
9. MOH screening absent at discharge.
10. Indomethacin-responsive headache differential not routed.
11. Trigeminal neuralgia differential not routed.
12. Disclaimer citation stale (does not specifically cite Robblee 2025).

---

## Section 6 — Differential branches recommended

### B1. Cluster-headache flag (Burish 2024 Continuum 30(2):391–410)
Screen: unilateral orbital/supraorbital/temporal severe pain · 15–180 min · ipsilateral autonomic features (lacrimation, conjunctival injection, ptosis, miosis, nasal congestion) · restlessness/agitation · cycle pattern. If flagged → **"High-flow O2 6–12 L/min via NRB + SC sumatriptan 6 mg + zolmitriptan nasal 5–10 mg"** card (Burish Table 6-3).

### B2. MOH discharge screen (Rizzoli 2024 Continuum 30(2):379–390)
At Step 5: ≥15 HA days/month + acute med use >10 days/month (triptan/opioid/combo/ergot) OR >15 days/month (simple analgesic) for >3 months → counsel on MOH + outpatient HA follow-up + prevention initiation.

### B3. Indomethacin-trial flag (Goadsby 2024 Continuum 30(2):488–497)
Strictly side-locked unilateral pain · either ≥5/day 2–30 min (PH) OR continuous waxing/waning (HC) · cranial autonomic features → outpatient note: "Consider indomethacin trial: 25→50→75 mg TID with PPI."

### B4. Trigeminal-neuralgia route-out (Nahas 2024 Continuum 30(2):473–487)
Paroxysmal, electric-shock-like, trigeminal distribution, triggered by innocuous stimuli, seconds–2 min → "Likely trigeminal neuralgia — carbamazepine 300–800 mg/day; avoid opioids; outpatient neurology."

---

## Section 7 — Confidence statement

**Verification confidence: HIGH** for all findings on the consolidated migraine ED algorithm.

- All 8 PDFs read with full page coverage of relevant sections.
- Robblee 2025 Tables 2 + 3 captured verbatim with metadata: *Headache* 2026;66:53–76, DOI 10.1111/head.70016, AHS Special Interest Group Refractory Headache authorship, AAN CPG process, PROSPERO CRD42023432106.
- AHS 2021 Consensus (Ailani et al., *Headache* 2021;61:1021–1039, DOI 10.1111/head.14153) verified.
- Continuum 2024 articles verified (Burch, Burish, Rizzoli, Goadsby, Nahas) — all volume 30(2), April 2024.

**Caveats:**
- The mislabeled PDF #4 is the **Lipton Preventive Treatment** chapter (not relevant to acute pathway).
- Robblee 2025 is brand-new (published 2026); institutional adoption may lag.
- Burch 2024 pregnancy table (triptans first-line rescue) reflects Continuum review; some institutional protocols remain more restrictive.

---

## 7-line summary

**(a) PDF year ranking:** Robblee 2025 (AHS CPG) > Ailani AHS 2021 Consensus > Continuum 2024 chapters.

**(b) Canonical questions covered:** ICHD-3 dx · outpatient acute · ED parenteral (Robblee 2025 A/B/C) · status migrainosus · pregnancy · CV risk · recurrence prevention · red flags · MOH · cluster · indomethacin-responsive · cranial neuralgias.

**(c) Conflicts resolved:** Prochlor vs metoclop ranking (Robblee 2025: Prochlor Level A, Metoclop Level B); dex recurrence Level B retained from 2016 (Robblee defers); triptans in pregnancy (Burch 2024: first-line rescue — more lenient than pathway).

**(d) Codebase findings + severity:** 2 HIGH (missing GONB Level A; antiemetic default inverted), 5 MEDIUM (ketorolac dose ceiling, dex 4 mg sub-therapeutic, sumatriptan-pregnancy over-restrictive, second-line incomplete, cluster routing absent), 5 LOW (valproate 800 mg, MOH screen, indo route, TN route, stale citation).

**(e) Top 3 corrections:** (1) Add **Greater Occipital Nerve Block** Level A; (2) change antiemetic default → **prochlorperazine**; (3) update ketorolac dose set 15/30/**60** (drop 45) + dexamethasone set **8/10/16** (drop 4).

**(f) NOT-COVERED:** Pediatric migraine; ED-specific eptinezumab (Robblee: insufficient evidence); SPG block protocols (Robblee Level U); intranasal ketamine; psilocybin; CGRP mAbs in ED; SUNCT/SUNA acute protocols beyond lamotrigine.

**(g) Recommended new pathway branches:** B1 Cluster-headache flag (autonomic + restlessness → O2/sumatriptan SC card); B2 MOH discharge screen; B3 Indomethacin-trial flag; B4 Trigeminal-neuralgia route-out.
