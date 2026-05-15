# Missing Trials Catalog — 2026-05-15

**Status:** read-only audit. 18 trials mentioned in source but ABSENT from `TRIAL_DATA`. Triage below; V picks which to author.

**Scope:** scanned `trialData.ts`, `trial-questions.ts`, `guideContent.ts`, `strokeClinicalPearls.ts`, `TrialPageNew.tsx` for trial acronym mentions. Cross-referenced against existing trial IDs (89 in catalog) and titles.

---

## High priority (V's W8.2 packets explicitly flagged these for future addition)

### 1. VISSIT
- **What:** Zaidat OO et al., JAMA 2015;313:1240–1248. Independent confirmation of SAMMPRIS harm — different (balloon-expandable Vitesse) stent, same direction. 30-day primary safety composite 24.1% (stent) vs 9.4% (medical); 30-day intracranial hemorrhage 8.6% vs 0%. Stopped early after SAMMPRIS results.
- **DOI:** 10.1001/jama.2015.1693 · **PMID:** 25803346 · **NCT:** NCT01717287
- **Why add:** referenced in SAMMPRIS pearls and ICAS-stenting question as confirming harm direction. Currently linked-but-unbacked.
- **Why important:** without VISSIT, the SAMMPRIS narrative reads as "one trial, Wingspan-specific." VISSIT shows the harm is the strategy, not the device.

### 2. CASSISS
- **What:** Gao P et al., JAMA 2022;328(6):534–542. Chinese RCT of stenting vs medical for symptomatic ICAS 70–99% at 1 year. n=380. No significant difference (8.0% vs 7.2% at 30d; 9.9% vs 9.0% at 1y). Confirms no benefit of routine stenting even in lower-medical-event-rate population.
- **DOI:** 10.1001/jama.2022.12000 · **PMID:** 35943338 · **NCT:** NCT01763320
- **Why add:** referenced in ICAS-stenting question. Strengthens the post-SAMMPRIS evidence base.

### 3. PHANTOM-S
- **What:** Ebinger M et al., JAMA 2014;311(16):1622–1630. Berlin STEMO process-feasibility study (precursor to B_PROUD). Showed thrombolysis rate and time-to-treatment improvements with MSU.
- **DOI:** 10.1001/jama.2014.2850 · **PMID:** 24756512
- **Why add:** B_PROUD packet flags this as the predecessor; would close the MSU evidence chain.

---

## Medium priority (commonly cited in trial-questions but absent)

### 4. NAVIGATE-ESUS
- **What:** Hart RG et al., NEJM 2018;378:2191–2201. Rivaroxaban vs aspirin for embolic stroke of undetermined source. Stopped early for harm (bleeding) + futility. n=7213.
- **DOI:** 10.1056/NEJMoa1802686 · **PMID:** 29766772
- **Why add:** referenced in anticoagulation question. ESUS evidence is incomplete without this.

### 5. RE-SPECT ESUS
- **What:** Diener HC et al., NEJM 2019;380:1906–1917. Dabigatran vs aspirin for ESUS. Similar negative result. n=5390.
- **DOI:** 10.1056/NEJMoa1813959 · **PMID:** 31091372

### 6. CRYSTAL-AF
- **What:** Sanna T et al., NEJM 2014;370:2478–2486. Long-term cardiac monitoring (3 years) vs standard for cryptogenic stroke. AF detection 12.4% vs 2.0% at 12 months.
- **DOI:** 10.1056/NEJMoa1313600 · **PMID:** 24963567
- **Why add:** referenced in stroke pearls; cornerstone of "look for occult AF" workup.

### 7. EMBRACE
- **What:** Gladstone DJ et al., NEJM 2014;370:2467–2477. 30-day vs 24-hour cardiac monitoring. AF detection 16.1% vs 3.2%.
- **DOI:** 10.1056/NEJMoa1311376 · **PMID:** 24963566

### 8. STROKE-AF
- **What:** Bernstein RA et al., JAMA 2021;325(21):2169–2177. Insertable loop recorder vs site-determined external monitoring for non-cryptogenic stroke subtypes. AF detection 12.1% vs 1.8% at 12 months.
- **DOI:** 10.1001/jama.2021.6470 · **PMID:** 34061145

---

## PFO closure (4-trial cluster — together they'd populate a "PFO closure" question)

### 9. RESPECT
- **What:** Saver JL et al., NEJM 2017;377:1022–1032 (10-year follow-up). PFO closure vs medical for cryptogenic stroke. HR 0.55 (95% CI 0.31–0.999) for recurrent stroke.
- **DOI:** 10.1056/NEJMoa1610057 · **PMID:** 28902593

### 10. CLOSE
- **What:** Mas JL et al., NEJM 2017;377:1011–1021. PFO closure + antiplatelet vs antiplatelet alone vs anticoagulation. HR 0.03 (CI 0.00–0.26) for closure vs antiplatelet.
- **DOI:** 10.1056/NEJMoa1705915 · **PMID:** 28902593

### 11. REDUCE
- **What:** Søndergaard L et al., NEJM 2017;377:1033–1042. PFO closure with Helex/Cardioform. HR 0.23 (CI 0.09–0.62).
- **DOI:** 10.1056/NEJMoa1707404 · **PMID:** 28902580

### 12. DEFENSE-PFO
- **What:** Lee PH et al., J Am Coll Cardiol 2018;71(20):2335–2342. PFO closure in high-risk PFO patients. HR 0.04 (CI 0.00–0.67).
- **DOI:** 10.1016/j.jacc.2018.02.046 · **PMID:** 29544871

---

## AF anticoagulation foundational (4-trial cluster)

### 13. ARISTOTLE
- **What:** Granger CB et al., NEJM 2011;365:981–992. Apixaban 5 mg BID vs warfarin in AF. Apixaban superior for stroke/SE (HR 0.79, P=0.01) AND major bleeding (HR 0.69, P<0.001).
- **DOI:** 10.1056/NEJMoa1107039 · **PMID:** 21870978

### 14. ROCKET-AF
- **What:** Patel MR et al., NEJM 2011;365:883–891. Rivaroxaban 20 mg QD vs warfarin in AF. Non-inferior for stroke/SE.
- **DOI:** 10.1056/NEJMoa1009638 · **PMID:** 21830957

### 15. ENGAGE AF-TIMI 48
- **What:** Giugliano RP et al., NEJM 2013;369:2093–2104. Edoxaban (high + low dose) vs warfarin in AF. Both NI; less bleeding.
- **DOI:** 10.1056/NEJMoa1310907 · **PMID:** 24251359

---

## ICH management (3-trial cluster)

### 16. INTERACT-2
- **What:** Anderson CS et al., NEJM 2013;368:2355–2365. Intensive (<140 mmHg) vs guideline (<180) BP lowering for acute ICH. Primary mortality/disability: OR 0.87 (P=0.06; just missed primary). mRS ordinal shift positive.
- **DOI:** 10.1056/NEJMoa1214609 · **PMID:** 23713578
- **Why add:** referenced in strokeClinicalPearls. Foundational for "BP <140 in ICH" practice.

### 17. ATACH-2
- **What:** Qureshi AI et al., NEJM 2016;375:1033–1043. Even more intensive (110–139) vs standard (140–179) for acute ICH. No benefit; possible renal harm.
- **DOI:** 10.1056/NEJMoa1603460 · **PMID:** 27276234

### 18. TICH-2
- **What:** Sprigg N et al., Lancet 2018;391:2107–2115. Tranexamic acid for ICH. Primary mRS not significant; reduced early death + hematoma expansion.
- **DOI:** 10.1016/S0140-6736(18)31033-X · **PMID:** 29778325

---

## Status epilepticus (1)

### 19. ESETT
- **What:** Kapur J et al., NEJM 2019;381:2103–2113. Levetiracetam vs fosphenytoin vs valproate for benzo-refractory SE. All ~ equally effective (~45-46% seizure cessation).
- **DOI:** 10.1056/NEJMoa1905795 · **PMID:** 31774955
- **Why add:** referenced in guideContent. Cornerstone for status epilepticus second-line choice.

---

## Other (lower priority — not in current question groupings)

### 20. WASID
- **What:** Chimowitz MI et al., NEJM 2005;352:1305–1316. Warfarin vs aspirin for symptomatic ICAS. Warfarin no benefit + more bleeding. Historical baseline for SAMMPRIS.
- **DOI:** 10.1056/NEJMoa043033 · **PMID:** 15800226

### 21. CREST
- **What:** Brott TG et al., NEJM 2010;363:11–23. CEA vs CAS for symptomatic + asymptomatic carotid stenosis.
- **DOI:** 10.1056/NEJMoa0912321 · **PMID:** 20505173

---

## Recommended order if you want me to author them

If you say "author these and add to catalog," I'd suggest this order based on user value:

**Batch 1 (highest impact, completes existing questions):** VISSIT, CASSISS, PHANTOM-S — fill gaps in already-shipped trial questions.

**Batch 2 (enables a "Cryptogenic stroke workup" question):** CRYSTAL-AF, EMBRACE, STROKE-AF, NAVIGATE-ESUS, RE-SPECT ESUS — 5 trials form a complete cluster.

**Batch 3 (enables a "PFO closure" question):** RESPECT, CLOSE, REDUCE, DEFENSE-PFO — 4 trials, clean cluster.

**Batch 4 (ICH cluster):** INTERACT-2, ATACH-2, TICH-2 — complements existing ICH-surgery question.

**Batch 5 (AF anticoagulant foundations):** ARISTOTLE, ROCKET-AF, ENGAGE AF-TIMI 48 — could pair with TIMING/OPTIMAS/ELAN.

**Batch 6 (singletons):** ESETT, WASID, CREST — useful but standalone.

Each trial entry takes ~30 min of authoring with evidence packet + my standard data shape (inclusion, exclusion, primary stats, safety, pearls, bedsidePearl, bottomLineSummary). Total ~10 hours for all 21 if I do them in sequence.

Need V to triage: **which batches do you want authored?** Reply with batch numbers (e.g. "1, 2, 4") and I'll spawn evidence-verifier agents for each in parallel.
