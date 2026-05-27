# Evidence Packet — Headache Primary-Trial Audit

**Date:** 2026-05-25
**Prepared by:** evidence-verifier agent (Opus 4.7)
**Scope:** Identify primary trials underlying the 10 headache-pathway claims currently citing Continuum reviews only. Continuum reviews remain in registry as **secondary** citations; primary trials are to be **added** to claim `citation_ids[]` arrays, not replacements.
**Verification confidence:** HIGH for all PMIDs/DOIs except where noted MEDIUM.

---

## Cross-cutting verification notes

PMID corrections from the orchestrator's initial brief (re-verified via PubMed direct fetch):
- Sumatriptan Cluster Headache Study Group NEJM 1991: PMID **1647496** (not 1647480)
- Aurora PREEMPT-1 Cephalalgia 2010: PMID **20647170** (not 20487038 — that's the Dodick pooled PREEMPT analysis in Headache 2010, also valid as separate citation)
- Diener PREEMPT-2 Cephalalgia 2010: PMID **20647171** (not 20487039)
- Tepper erenumab chronic migraine: PMID **28460892** (not 29128691)
- Silberstein HALO-CM fremanezumab NEJM 2017: PMID **29171818** (29171821 is Goadsby STRIVE episodic)
- Mulleners CONQUER galcanezumab Lancet Neurol 2020: DOI verified `10.1016/S1474-4422(20)30279-9`; **PMID `blocked:source-not-resolved`** (PubMed reCAPTCHA blocked re-resolution). Orchestrator: confirm PMID before merge.
- Dodick ubrogepant NEJM 2019: PMID **31800988** (not 31790566)
- Ailani atogepant NEJM 2021 ADVANCE: PMID **34407343** (not 34453881)
- Goadsby NEJM 2017 STRIVE (PMID 29171821) is **episodic-migraine erenumab**, NOT chronic. The correct chronic-migraine erenumab anchor is Tepper Lancet Neurol 2017 (PMID 28460892).

---

## Claim 1 — `clinic-headache-tension-acute-management`

**Primary citation to add: EFNS guideline on the treatment of tension-type headache (Bendtsen 2010)**
- Citation ID (proposed): `bendtsen-efns-tth-2010`
- Authors: Bendtsen L, Evers S, Linde M, Mitsikostas DD, Sandrini G, Schoenen J
- Journal: Eur J Neurol. 2010;17(11):1318-1325
- DOI: 10.1111/j.1468-1331.2010.03070.x
- PMID: **20482606**
- quoted_text: "Simple analgesics and non-steroidal anti-inflammatory drugs are recommended for the treatment of episodic tension-type headache. Combination analgesics containing caffeine are drugs of second choice. Triptans, muscle relaxants and opioids should not be used. It is crucial to avoid frequent and excessive use of analgesics to prevent the development of medication-overuse headache."
- last_reviewed: 2026-05-25
- review_window_months: 12

---

## Claim 2 — `clinic-headache-tension-preventive`

**Primary trial: Bendtsen, Jensen, Olesen 1996 — amitriptyline RCT in chronic TTH**
- Citation ID (proposed): `bendtsen-amitriptyline-tth-1996`
- Title: A non-selective (amitriptyline), but not a selective (citalopram), serotonin reuptake inhibitor is effective in the prophylactic treatment of chronic tension-type headache
- Authors: Bendtsen L, Jensen R, Olesen J
- Journal: J Neurol Neurosurg Psychiatry. 1996;61(3):285-290
- DOI: 10.1136/jnnp.61.3.285
- PMID: **8795600**
- quoted_text: "Although amitriptyline did not eliminate the headache, it provided a clinically important reduction of headache in the majority of otherwise treatment resistant patients. Amitriptyline, but not citalopram, is valuable in the prophylactic treatment of chronic tension type headache."
- last_reviewed: 2026-05-25
- review_window_months: 36

**Companion guideline: EFNS 2010** (same as Claim 1, `bendtsen-efns-tth-2010`) — establishes amitriptyline first-choice, mirtazapine/venlafaxine second-choice.

Note: Venlafaxine for TTH supported by Zissis 2007 Cephalalgia (PMID 17263767), not by a Bendtsen Zakrzewska 2010 reference (which does not exist as a venlafaxine TTH RCT).

---

## Claim 3 — `clinic-headache-cluster-acute-management`

**Primary trial A: Cohen JAMA 2009 — high-flow O₂ for cluster**
- Citation ID (proposed): `cohen-oxygen-cluster-2009`
- Title: High-flow oxygen for treatment of cluster headache: a randomized trial
- Authors: Cohen AS, Burns B, Goadsby PJ
- Journal: JAMA. 2009;302(22):2451-2457
- DOI: 10.1001/jama.2009.1855
- PMID: **19996400**
- quoted_text: "Treatment of patients with cluster headache at symptom onset using inhaled high-flow oxygen compared with placebo was more likely to result in being pain-free at 15 minutes." (Pain-free at 15 min: 78% oxygen vs 20% placebo; difference 58 pp, P<0.001; 12 L/min, 100% O₂ by face mask, 15 minutes.)
- last_reviewed: 2026-05-25
- review_window_months: 36

**Primary trial B: Sumatriptan Cluster Headache Study Group NEJM 1991 (SC sumatriptan)**
- Citation ID (proposed): `sumatriptan-cluster-1991`
- Title: Treatment of acute cluster headache with sumatriptan
- Authors: The Sumatriptan Cluster Headache Study Group (Ekbom K, primary)
- Journal: N Engl J Med. 1991;325(5):322-326
- DOI: 10.1056/NEJM199108013250505
- PMID: **1647496**
- quoted_text: "Sumatriptan is an effective and well-tolerated treatment for acute attacks of cluster headache." (Pain-free at 15 min: sumatriptan 6 mg SC 46% vs placebo 10%, P<0.001; n=49 crossover RCT.)
- last_reviewed: 2026-05-25
- review_window_months: 36

---

## Claim 4 — `clinic-headache-cluster-preventive`

**Primary trial A: Leone Neurology 2000 — verapamil for cluster (placebo-controlled RCT)**
- Citation ID (proposed): `leone-verapamil-cluster-2000`
- Title: Verapamil in the prophylaxis of episodic cluster headache: a double-blind study versus placebo
- Authors: Leone M, D'Amico D, Frediani F, Moschiano F, Grazzi L, Attanasio A, Bussone G
- Journal: Neurology. 2000;54(6):1382-1385
- DOI: 10.1212/wnl.54.6.1382
- PMID: **10746617**
- quoted_text: "There was a significant reduction in attack frequency and abortive agents consumption in the verapamil group compared with placebo, with only mild adverse effects."
- last_reviewed: 2026-05-25
- review_window_months: 36

**Primary trial B: Bussone Headache 1990 — lithium vs verapamil**
- Citation ID (proposed): `bussone-lithium-verapamil-cluster-1990`
- Title: Double blind comparison of lithium and verapamil in cluster headache prophylaxis
- Authors: Bussone G, Leone M, Peccarisi C, et al.
- Journal: Headache. 1990;30(7):411-417
- DOI: 10.1111/j.1526-4610.1990.hed3007411.x
- PMID: **2205598**
- quoted_text: "Both lithium carbonate and verapamil were effective in preventing CCH but verapamil caused fewer side effects and had a shorter latency period."
- last_reviewed: 2026-05-25
- review_window_months: 36

---

## Claim 5 — `clinic-headache-hc-indomethacin-protocol`

**Primary citation: Newman Lipton Solomon Neurology 1994**
- Citation ID (proposed): `newman-hc-indomethacin-1994`
- Title: Hemicrania continua: ten new cases and a review of the literature
- Authors: Newman LC, Lipton RB, Solomon S
- Journal: Neurology. 1994;44(11):2111-2114
- DOI: 10.1212/wnl.44.11.2111
- PMID: **7969968**
- quoted_text: "Accurate diagnosis is important as all forms are characterized by a dramatic and selective response to indomethacin."
- last_reviewed: 2026-05-25
- review_window_months: 36

---

## Claim 6 — `clinic-headache-ph-indomethacin-protocol`

**Primary citation: Antonaci Headache 1998 — 'indotest'**
- Citation ID (proposed): `antonaci-indotest-1998`
- Title: Chronic paroxysmal hemicrania and hemicrania continua. Parenteral indomethacin: the 'indotest'
- Authors: Antonaci F, Pareja JA, Caminero AB, Sjaastad O
- Journal: Headache. 1998;38(2):122-128
- DOI: 10.1046/j.1526-4610.1998.3802122.x
- PMID: **9529768**
- quoted_text: "The use of a test dosage of 50 mg of indomethacin IM ('indotest') gives a clear-cut answer and may be a useful tool in the diagnostic arsenal in every unilateral headache for a proper clinical assessment."
- last_reviewed: 2026-05-25
- review_window_months: 36

---

## Claim 7 — `clinic-headache-chronic-migraine-acute`

**Primary trial A: Lipton NEJM 2019 — rimegepant ACHIEVE-I**
- Citation ID (proposed): `lipton-rimegepant-acute-2019`
- Title: Rimegepant, an Oral Calcitonin Gene-Related Peptide Receptor Antagonist, for Migraine
- Authors: Lipton RB, Croop R, Stock EG, et al.
- Journal: N Engl J Med. 2019;381(2):142-149
- DOI: 10.1056/NEJMoa1811090
- PMID: **31291516**
- quoted_text: "Treatment of a migraine attack with the oral calcitonin gene-related peptide receptor antagonist rimegepant resulted in a higher percentage of patients who were free of pain and free from their most bothersome symptom than placebo." (Pain-free at 2h: 19.6% rimegepant vs 12.0% placebo; MBS-free: 37.6% vs 25.2%.)
- last_reviewed: 2026-05-25
- review_window_months: 36

**Primary trial B: Dodick NEJM 2019 — ubrogepant ACHIEVE-I**
- Citation ID (proposed): `dodick-ubrogepant-acute-2019`
- Title: Ubrogepant for the Treatment of Migraine
- Authors: Dodick DW, Lipton RB, Ailani J, Lu K, Finnegan M, Trugman JM, Szegedi A
- Journal: N Engl J Med. 2019;381(23):2230-2241
- DOI: 10.1056/NEJMoa1813049
- PMID: **31800988**
- quoted_text: "Among adults with migraine, acute treatment with ubrogepant at a dose of 50 mg or 100 mg resulted in significantly higher rates of pain freedom and absence of the most bothersome migraine-associated symptom 2 hours after the dose than placebo."
- last_reviewed: 2026-05-25
- review_window_months: 36

---

## Claim 8 — `clinic-headache-chronic-migraine-preventive`

**Primary trial A: Aurora PREEMPT 1 Cephalalgia 2010**
- Citation ID (proposed): `aurora-preempt-1-2010`
- Authors: Aurora SK, Dodick DW, Turkel CC, DeGryse RE, Silberstein SD, Lipton RB, Diener HC, Brin MF
- Journal: Cephalalgia. 2010;30(7):793-803
- DOI: 10.1177/0333102410364676
- PMID: **20647170**
- CAVEAT: PREEMPT 1 did not meet its primary endpoint (frequency of headache episodes). FDA chronic-migraine indication rests on pooled PREEMPT 1+2 (Dodick Headache 2010, PMID 20487038) and PREEMPT 2.
- quoted_text: "Significant reductions from baseline were observed for onabotulinumtoxinA for headache and migraine days, cumulative hours of headache on headache days and frequency of moderate/severe headache days, which in turn reduced the burden of illness in adults with disabling chronic migraine."
- last_reviewed: 2026-05-25
- review_window_months: 36

**Primary trial B: Diener PREEMPT 2 Cephalalgia 2010**
- Citation ID (proposed): `diener-preempt-2-2010`
- Journal: Cephalalgia. 2010;30(7):804-814
- DOI: 10.1177/0333102410364677
- PMID: **20647171**
- quoted_text: "The results of PREEMPT 2 demonstrate that onabotulinumtoxinA is effective for prophylaxis of headache in adults with chronic migraine. Repeated onabotulinumtoxinA treatments were safe and well tolerated."
- last_reviewed: 2026-05-25
- review_window_months: 36

**Primary trial B′ (pooled regulatory anchor): Dodick Headache 2010 — PREEMPT pooled**
- Citation ID (proposed): `dodick-preempt-pooled-2010`
- Journal: Headache. 2010;50(6):921-936
- DOI: 10.1111/j.1526-4610.2010.01678.x
- PMID: **20487038**

**Primary trial C: Tepper Lancet Neurology 2017 — erenumab for chronic migraine**
- Citation ID (proposed): `tepper-erenumab-chronic-2017`
- Journal: Lancet Neurol. 2017;16(6):425-434
- DOI: 10.1016/S1474-4422(17)30083-2
- PMID: **28460892**
- quoted_text: "In patients with chronic migraine, erenumab 70 mg and 140 mg reduced the number of monthly migraine days with a safety profile similar to placebo, providing evidence that erenumab could be a potential therapy for migraine prevention."
- last_reviewed: 2026-05-25
- review_window_months: 36

**Primary trial D: Silberstein NEJM 2017 — fremanezumab HALO-CM**
- Citation ID (proposed): `silberstein-fremanezumab-halo-cm-2017`
- Journal: N Engl J Med. 2017;377(22):2113-2122
- DOI: 10.1056/NEJMoa1709038
- PMID: **29171818**
- quoted_text: "Fremanezumab as a preventive treatment for chronic migraine resulted in a lower frequency of headache than placebo in this 12-week trial."
- last_reviewed: 2026-05-25
- review_window_months: 36

**Primary trial E: Mulleners CONQUER Lancet Neurology 2020 — galcanezumab**
- Citation ID (proposed): `mulleners-conquer-galcanezumab-2020`
- DOI: 10.1016/S1474-4422(20)30279-9
- PMID: **`blocked:source-not-resolved`** — orchestrator to confirm before merge
- quoted_text (MEDIUM confidence from search excerpt): "Galcanezumab was superior to placebo in preventive treatment of migraine and was safe and well tolerated in patients who had previous failures to standard-of-care preventive treatments."
- last_reviewed: 2026-05-25
- review_window_months: 36

**Primary trial F: Lipton PROMISE-2 Neurology 2020 — eptinezumab chronic migraine**
- Citation ID (proposed): `lipton-promise2-eptinezumab-2020`
- Journal: Neurology. 2020;94(13):e1365-e1377
- DOI: 10.1212/WNL.0000000000009169
- PMID: **32209650**
- quoted_text: "Eptinezumab (100 and 300 mg) significantly reduced MMDs from the day after IV administration through week 12, was well tolerated, and demonstrated an acceptable safety profile."
- last_reviewed: 2026-05-25
- review_window_months: 36

**Supportive guideline: Silberstein/Holland AAN-AHS 2012**
- Citation ID (proposed): `silberstein-aan-ahs-migraine-prevention-2012`
- Journal: Neurology. 2012;78(17):1337-1345
- DOI: 10.1212/WNL.0b013e3182535d20
- PMID: **22529202**
- quoted_text: "Divalproex sodium, sodium valproate, topiramate, metoprolol, propranolol, and timolol are effective for migraine prevention and should be offered to patients with migraine to reduce migraine attack frequency and severity (Level A). Frovatriptan is effective for prevention of menstrual migraine (Level A). Lamotrigine is ineffective for migraine prevention (Level A)."
- Caveat: Strictly applies to *episodic* migraine prevention.
- last_reviewed: 2026-05-25
- review_window_months: 12

---

## Claim 9 — `clinic-headache-sunct-lamotrigine`

**Primary citation A: D'Andrea Neurology 2001**
- Citation ID (proposed): `dandrea-lamotrigine-sunct-2001`
- Journal: Neurology. 2001;57(9):1723-1725
- DOI: 10.1212/wnl.57.9.1723
- PMID: **11706123**
- quoted_text: "Lamotrigine (125 to 200 mg daily) obtained complete remission in three patients and a substantial reduction (about 80%) of attack frequency in the other two. No adverse effects were noted."
- last_reviewed: 2026-05-25
- review_window_months: 36

**Primary citation B (supportive cohort): Cohen Matharu Goadsby Brain 2006**
- Citation ID (proposed): `cohen-sunct-suna-2006`
- Journal: Brain. 2006;129(Pt 10):2746-2760
- DOI: 10.1093/brain/awl202
- PMID: **16905753**
- quoted_text (MEDIUM confidence — abstract verified, full-text verbatim pending): "We propose a new set of diagnostic criteria for these syndromes to better encompass the clinical presentations and which include a wider range of attack length, wider trigeminal pain distribution, cutaneous triggering and lack of refractory period."
- last_reviewed: 2026-05-25
- review_window_months: 36

---

## Claim 10 — `clinic-headache-moh-gepant-safe`

Primary anchors: rimegepant + ubrogepant ACHIEVE programs (already cited in Claim 7) plus atogepant ADVANCE.

**Primary trial: Ailani NEJM 2021 — atogepant ADVANCE**
- Citation ID (proposed): `ailani-atogepant-advance-2021`
- Title: Atogepant for the Preventive Treatment of Migraine
- Authors: Ailani J, Lipton RB, Goadsby PJ, et al.
- Journal: N Engl J Med. 2021;385(8):695-706
- DOI: 10.1056/NEJMoa2035908
- PMID: **34407343**
- quoted_text: "Oral atogepant once daily was effective in reducing the number of migraine days and headache days over a period of 12 weeks."
- last_reviewed: 2026-05-25
- review_window_months: 36

`ailani-ahs-2021` (already in registry) remains the policy citation for "gepants do not cause MOH."

---

## Field mapping summary

For each claim, **append** new primary-trial citation IDs to the existing `citation_ids[]` array in `claims.ts`. **Do not remove** existing Continuum review IDs — they remain as secondary review citations. Each new citation also added to `registry.ts`. Recommended ordering: primary trials first, then guidelines, then Continuum reviews last.

19 new citations to add (1 marked `blocked:source-not-resolved` for PMID).

---

## Verification confidence

- **HIGH** for 17 of 19 citations
- **MEDIUM** for Mulleners CONQUER 2020 (PMID resolution pending), Cohen SUNCT/SUNA Brain 2006 (treatment-conclusion verbatim pending full-text)

## Blocking / non-block

**Not a block.** Two items carry orchestrator-confirmation flags. The brief's PMID errors on 7 trials corrected in this packet.
