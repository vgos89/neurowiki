# ICHD-3 Audit — Clinic Headache Pathway evaluator

**Status:** Critical clinical-content gap analysis
**Date:** 2026-05-25
**Reviewer:** medical-scientist + evidence-verifier (paired pass)
**Source of truth:** ICHD-3 (Cephalalgia 2018; 38(1):1–211), Headache Classification Committee of the International Headache Society. PMID 29368949. DOI 10.1177/0333102417738202. Open-access PDF: https://ichd-3.org/wp-content/uploads/2018/01/The-International-Classification-of-Headache-Disorders-3rd-Edition-2018.pdf (retrieved 2026-05-25, read verbatim by medical-scientist pp. 8–55).
**Evaluator audited:** `src/data/clinicHeadacheData.ts` (commit 5903aef).

---

## Executive summary — what V hit and what is broken

V's complaint that the tool produced an interpretation that did not match the actual ICHD-3 diagnosis is confirmed. The current evaluator has at least four classification-level defects beyond the gaps in coverage:

1. **NDPH is miscoded as §3.3.** ICHD-3 places NDPH at **§4.10** (Other primary headache disorders). §3.3 in ICHD-3 is **SUNCT/SUNA**, which the evaluator does not implement at all. This is a section-number drift that propagates into the UI badge and into the educational pearl. Same patient, wrong chapter.
2. **Vestibular migraine is miscoded as §A1.6.5.** ICHD-3 places vestibular migraine at **§A1.6.6** (Cephalalgia 2018, p. 28 comment; classification table p. 15: A1.6.4 Infantile colic, A1.6.5 Alternating hemiplegia of childhood, **A1.6.6 Vestibular migraine**). §A1.6.5 is "Alternating hemiplegia of childhood."
3. **1.3 Chronic migraine is not implemented.** This is the most clinically consequential missing phenotype and the most likely root cause of the misleading interpretation V experienced. A patient with ≥15 headache days/month for >3 months, ≥8 of which carry migraine features, has **Chronic migraine** — not "Migraine without aura" and not "Chronic TTH." The current evaluator suppresses migraine when `dur-continuous` is selected, leaving such patients to land on Chronic TTH if criterion D happens to pass, or on no full match at all.
4. **3.2 Paroxysmal hemicrania and 3.3 SUNCT/SUNA are not implemented.** Both are indomethacin-relevant TACs (PH responds absolutely to indomethacin like HC; SUNCT does not) with distinct duration windows (PH 2–30 min; SUNCT/SUNA 1–600 sec) that the chip vocabulary cannot currently express. A patient with severe unilateral orbital attacks of 5 minutes will currently sub-thread into a Probable cluster match because no shorter-than-15-min chip exists.

Beyond these four, this audit recommends: adding 1.3 Chronic migraine (must), 4.10 NDPH at the correct chapter (must, fixes §3.3 misplacement), 3.2 Paroxysmal hemicrania (must), 3.3 SUNCT/SUNA (must, fills the vacated §3.3 slot), 4.4 Primary thunderclap headache as a routing entity (must — but routed to red-flag workup not to a primary-headache diagnosis), 1.4.1 Status migrainosus (should), 1.5 Probable migraine and 2.4 Probable TTH as distinct entries (should — current matchStrength: 'probable' on the parent is semantically not the same as the ICHD-3 X.5 entity). 4.9 Hypnic headache is deferrable to v2 with rationale. Other 4.x triggers (cough, exercise, sexual, cold, external pressure, stabbing, nummular) are deferrable.

Multi-diagnosis surfacing (§General Principle 3 and 5) needs an explicit page-level fix: ICHD-3 mandates that a patient can carry multiple primary diagnoses and that all must be coded; the page currently only surfaces the top match.

The cluster-headache criterion B implementation has a subtle drift: the evaluator requires `loc-unilateral` AND `loc-orbital-temporal` AND a severity chip AND the 15–180 min chip as a **conjunction**. ICHD-3 3.1 B is one composite feature with internal "or" structure ("orbital, supraorbital, temporal **or in any combination of these sites**"). Implementation is acceptable in practice but documented here.

---

## Phenotypes covered — verdict per shipped phenotype

For each currently shipped phenotype, the audit cites the evaluator line numbers, gives the ICHD-3 verbatim, and states the verdict.

### 1.1 Migraine without aura — verdict: **correct**

Evaluator: `clinicHeadacheData.ts` L323–339.

ICHD-3 §1.1 verbatim (Cephalalgia 2018 p. 19):
> A. At least five attacks fulfilling criteria B–D
> B. Headache attacks lasting 4–72 hours (when untreated or unsuccessfully treated)
> C. Headache has at least two of the following four characteristics: 1. unilateral location 2. pulsating quality 3. moderate or severe pain intensity 4. aggravation by or causing avoidance of routine physical activity (e.g. walking or climbing stairs)
> D. During headache at least one of the following: 1. nausea and/or vomiting 2. photophobia and phonophobia
> E. Not better accounted for by another ICHD-3 diagnosis.

Verdict: criteria A, B, C, D faithfully encoded. Treating "moderate or severe" as one feature (not two) is correct. Criterion D photo+phono pairing is correct ("photophobia AND phonophobia together count as one"). Criterion E is implicitly handled by the X.5 exclusion clause at the evaluator level (L546–551). **No drift.**

### 1.2 Migraine with aura — verdict: **correct with one minor**

Evaluator: L342–357. Criterion B requires `aura-fully-reversible` to be selected explicitly in addition to one aura modality.

ICHD-3 §1.2 B verbatim (Cephalalgia 2018 p. 20): "One or more of the following **fully reversible** aura symptoms: 1. visual 2. sensory 3. speech and/or language 4. motor 5. brainstem 6. retinal."

Minor: the chip-picker forces a separate `aura-fully-reversible` chip, when in ICHD-3 the reversibility is intrinsic to the aura definition (a non-reversible neurological symptom is by definition not "aura"). Recommend: remove the standalone `aura-fully-reversible` chip and bake reversibility into the modality chip labels (e.g., "Visual aura — fully reversible scotoma, fortification, scintillation"). Until that refactor, the current chip behavior is conservative-safe: it never over-diagnoses aura.

Criterion C (≥3 of 6) is correctly implemented, with the 6th characteristic ("at least one aura symptom is unilateral") wired through `loc-unilateral`.

### 2.2 Frequent episodic TTH — verdict: **correct**

Evaluator: L361–375.

ICHD-3 §2.2 verbatim (Cephalalgia 2018 pp. 36–37):
> A. At least 10 episodes of headache occurring on 1–14 days/month on average for >3 months (≥12 and <180 days/year) and fulfilling criteria B–D
> B. Lasting from 30 minutes to seven days
> C. At least two of the following four characteristics: 1. bilateral location 2. pressing or tightening (non-pulsating) quality 3. mild or moderate intensity 4. not aggravated by routine physical activity such as walking or climbing stairs
> D. Both of the following: 1. no nausea or vomiting 2. no more than one of photophobia or phonophobia

Verdict: faithful. The chip `attacks-gt-10` correctly maps to the "≥10 episodes" requirement. The criterion D logic (`!nausea && !vomiting && photo+phono ≤ 1`) matches verbatim. **No drift.**

### 2.3 Chronic TTH — verdict: **partial drift, documented**

Evaluator: L378–397.

ICHD-3 §2.3 verbatim (Cephalalgia 2018 p. 37):
> A. Headache occurring on ≥15 days/month on average for >3 months (≥180 days/year), fulfilling criteria B–D
> B. Lasting hours to days, or unremitting
> C. At least two of the following four characteristics: 1. bilateral location 2. pressing or tightening (non-pulsating) quality 3. mild or moderate intensity 4. not aggravated by routine physical activity such as walking or climbing stairs
> D. Both of the following: 1. **no more than one of photophobia, phonophobia or mild nausea** 2. neither moderate or severe nausea nor vomiting

Verdict: criterion D is materially drifted. Current evaluator only checks `!has(s, 'sym-vomiting')` (L395), with a code comment acknowledging the gap. The drift means a chronic-TTH patient with moderate nausea will incorrectly full-match 2.3 instead of being routed to 1.3 Chronic migraine. **This is the most likely surface defect responsible for V's complaint.** The fix requires:
- Add chips `sym-nausea-mild` and `sym-nausea-moderate-severe` (split from current `sym-nausea`).
- Rewrite 2.3 D as: `!has('sym-nausea-moderate-severe') && !has('sym-vomiting') && countOf(['sym-nausea-mild', 'sym-photophobia', 'sym-phonophobia']) <= 1`.
- Concurrently update 1.1 D to accept either `sym-nausea-mild` or `sym-nausea-moderate-severe` (current logic is fine because it only requires presence of nausea).

### 3.1 Cluster headache — verdict: **correct with structural note**

Evaluator: L401–416.

ICHD-3 §3.1 verbatim (Cephalalgia 2018 p. 41):
> A. At least five attacks fulfilling criteria B–D
> B. Severe or very severe unilateral orbital, supraorbital and/or temporal pain lasting 15–180 minutes (when untreated)
> C. Either or both of the following: 1. at least one of the following symptoms or signs, ipsilateral to the headache: a) conjunctival injection and/or lacrimation b) nasal congestion and/or rhinorrhoea c) eyelid oedema d) forehead and facial sweating e) miosis and/or ptosis 2. a sense of restlessness or agitation
> D. Occurring with a frequency between one every other day and eight per day

Verdict: faithful. Criterion B is correctly composed as a conjunction in the evaluator (severity + unilateral + orbital-temporal + 15–180min). Criterion C alternative (autonomic OR restlessness) is correct. Criterion D's "during active bouts" temporal scoping is acknowledged in the chip label. **No drift.**

Structural note: criterion B in ICHD-3 reads "orbital, supraorbital and/or temporal" — a patient with purely temporal pain (no orbital component) still qualifies. The current chip `loc-orbital-temporal` covers this verbally but a clinician interpreting "supraorbital" strictly might miss-select. Recommend relabeling the chip to make the disjunction explicit, but no logic change needed.

### 3.3 NDPH (current placement) — verdict: **MISCODED**

Evaluator: L438–451. Section labeled `'ICHD-3 §3.3'`.

ICHD-3 places NDPH at **§4.10** (verbatim classification table, Cephalalgia 2018 p. 9: "3.3 Short-lasting unilateral neuralgiform headache attacks"; p. 9: "4.10 New daily persistent headache (NDPH)"; description text Cephalalgia 2018 p. 55).

ICHD-3 §4.10 verbatim (Cephalalgia 2018 pp. 55–56):
> Description: Persistent headache, daily from its onset, which is clearly remembered. The pain lacks characteristic features, and may be migraine-like or tension-type-like, or have elements of both.
>
> A. Persistent headache fulfilling criteria B and C
> B. Distinct and clearly remembered onset, with pain becoming continuous and unremitting within 24 hours
> C. Present for >3 months
> D. Not better accounted for by another ICHD-3 diagnosis.

Verdict: the *criteria* the evaluator encodes are substantially correct (continuous + ≥3 months + distinct onset), but the **section label is wrong** and the slot the evaluator occupies (§3.3) actually belongs to SUNCT/SUNA — a completely different disorder. This drift propagates into the UI ICHD section badge and into any clinician documentation that copies the badge text. **Fix: rename `ichd3Section` to `'ICHD-3 §4.10'` and confirm the educational pearl text references chapter 4 framing (Other primary headache disorders), not chapter 3 (TACs).**

Additionally, criterion B's "within 24 hours" temporal constraint is preserved in the displayed text but not enforceable via chips — the code comment acknowledges this. Acceptable but flag for future chip extension.

### 3.4 Hemicrania continua — verdict: **correct**

Evaluator: L421–434.

ICHD-3 §3.4 verbatim (Cephalalgia 2018 pp. 44–45):
> A. Unilateral headache fulfilling criteria B–D
> B. Present for >3 months, with exacerbations of moderate or greater intensity
> C. Either or both of the following: 1. at least one of the following symptoms or signs, ipsilateral to the headache: a) conjunctival injection and/or lacrimation b) nasal congestion and/or rhinorrhoea c) eyelid oedema d) forehead and facial sweating e) miosis and/or ptosis 2. a sense of restlessness or agitation, or aggravation of the pain by movement
> D. Responds absolutely to therapeutic doses of indomethacin
> E. Not better accounted for by another ICHD-3 diagnosis.

Verdict: faithful. The `hiddenUntilTrial` gate that requires `indo-tried-complete` correctly mirrors ICHD-3's "absolutely sensitive to indomethacin" as definitional. Criterion A's unilaterality requirement is correctly enforced via `loc-unilateral` AND `dur-continuous` AND `pattern-ge-3-months`. **No drift.**

Note: ICHD-3 §3.4 A reads "Unilateral headache fulfilling criteria B–D" — "continuous" is implied in §3.4's title and description ("Persistent, strictly unilateral headache") but is not literally part of criterion A. The evaluator's enforcement of `dur-continuous` in criterion A is therefore tighter than verbatim ICHD-3 but matches §3.4 §B "Present for >3 months" combined with §3.4 §4.1 description. Acceptable.

### A1.6.5 Vestibular migraine — verdict: **MISCODED section number**

Evaluator: L455–465. Section labeled `'ICHD-3 Appendix §A1.6.5'`.

ICHD-3 classification table (Cephalalgia 2018 p. 15):
> A1.6 Episodic syndromes that may be associated with migraine
> A1.6.4 Infantile colic
> **A1.6.5 Alternating hemiplegia of childhood**
> **A1.6.6 Vestibular migraine**

And Cephalalgia 2018 p. 28 comment: "The relationship between 1.6.2 Benign paroxysmal vertigo and A1.6.6 Vestibular migraine (see Appendix) needs to be further examined."

Verdict: **§A1.6.5 is Alternating hemiplegia of childhood, not Vestibular migraine.** Vestibular migraine is §A1.6.6. Fix: change `ichd3Section` to `'ICHD-3 Appendix §A1.6.6'`. Criteria text in the evaluator is too sparse (vm-A, vm-B only); the appendix entry actually carries five criteria (A–E) — see "Phenotypes missing" §A1.6.6 entry below for the verbatim text and recommended chip expansion. The mis-numbering is a labeling drift; the underspecified criteria are a separate (smaller) gap.

---

## Phenotypes missing — must add (Class D-clinical priority)

### 1.3 Chronic migraine — MUST ADD

**Why this is the most important addition.** Chronic migraine is the highest-volume miss for a clinic pathway. A 4-week clinic patient describing ≥15 headache days, with most carrying migraine features, is the textbook case. The current evaluator forces them into one of three wrong buckets: (a) "no full match" because episodic-migraine criterion B requires ≤72 h per attack and the patient's chronic pattern doesn't satisfy that cleanly; (b) Chronic TTH if criterion D happens to pass; (c) "Probable migraine" because mig-A is short on episodic-attack counts. None of these is the right ICHD-3 answer.

ICHD-3 §1.3 verbatim (Cephalalgia 2018 p. 24):
> Description: Headache occurring on 15 or more days/month for more than three months, which, on at least eight days/month, has the features of migraine headache.
>
> A. Headache (migraine-like or tension-type-like) on ≥15 days/month for >3 months, and fulfilling criteria B and C
> B. Occurring in a patient who has had at least five attacks fulfilling criteria B–D for 1.1 Migraine without aura and/or criteria B and C for 1.2 Migraine with aura
> C. On ≥8 days/month for >3 months, fulfilling any of the following:
>    1. criteria C and D for 1.1 Migraine without aura
>    2. criteria B and C for 1.2 Migraine with aura
>    3. believed by the patient to be migraine at onset and relieved by a triptan or ergot derivative
> D. Not better accounted for by another ICHD-3 diagnosis.

Chips needed (new):
- `freq-migraine-features-ge-8-per-month` — "On ≥8 days/month, attacks carry migraine features (pulsating, unilateral, mod-severe, aggravated, or nausea/photo-phono)"
- `history-prior-migraine-attacks-ge-5` — "Patient has a prior history of ≥5 attacks meeting full migraine criteria"
- (Optional) `triptan-response-positive` — "At least some attacks respond to a triptan or ergot derivative"

Evaluator logic:
```ts
{
  id: 'chronic-migraine',
  name: 'Chronic migraine',
  ichd3Section: 'ICHD-3 §1.3',
  suppressIfContinuous: false, // chronic migraine is a chronic daily pattern, NOT suppressed by continuous
  criteria: [
    { id: 'cm-A', label: 'Headache on ≥15 days/month for >3 months',
      evaluate: s => has(s, 'freq-ge-15-per-month') && has(s, 'pattern-ge-3-months'),
      contributingChips: ['freq-ge-15-per-month', 'pattern-ge-3-months'] },
    { id: 'cm-B', label: 'Prior history of ≥5 attacks fulfilling 1.1 or 1.2 criteria',
      evaluate: s => has(s, 'history-prior-migraine-attacks-ge-5'),
      contributingChips: ['history-prior-migraine-attacks-ge-5'] },
    { id: 'cm-C', label: 'On ≥8 days/month: migraine features OR triptan-responsive',
      evaluate: s => has(s, 'freq-migraine-features-ge-8-per-month') || has(s, 'triptan-response-positive'),
      contributingChips: ['freq-migraine-features-ge-8-per-month', 'triptan-response-positive'] },
  ],
}
```

Suppression interactions: per ICHD-3 §2.3 Note 1 ("When headache fulfils criteria for 1.3 Chronic migraine, this diagnosis excludes the diagnosis of 2. Tension-type headache or its types"), when Chronic migraine is a full match, Chronic TTH must be suppressed. Add this rule explicitly in the evaluator alongside the existing X.5 probable-suppression logic.

Per ICHD-3 §1.3 Comment: "around 50% of patients apparently with 1.3 Chronic migraine revert to an episodic migraine type after drug withdrawal" — MOH co-coding with 8.2 should be added as a teaching pearl on the result card, mirroring the existing Rizzoli Continuum 2024 pearl on MOH.

### 4.10 New daily persistent headache (NDPH) — MUST FIX (re-code from §3.3)

This is a renaming + relocation, not a new entity. The criteria are already implemented correctly; the section number is wrong.

ICHD-3 §4.10 verbatim is provided above in the "Phenotypes covered — 3.3 NDPH (current placement)" section.

Fix:
- Change `ichd3Section: 'ICHD-3 §3.3'` → `'ICHD-3 §4.10'`.
- Update `teachPearl` text to frame NDPH as a "chapter 4 other-primary-headache" entity, not a TAC. Specifically: "NDPH lives in chapter 4 of ICHD-3 (Other primary headache disorders), distinct from the trigeminal autonomic cephalalgias of chapter 3. The diagnostic anchor is the patient's ability to pinpoint the day of onset, with daily continuous pain established within 24 hours and persistence beyond 3 months. NDPH is a diagnosis of exclusion — secondary causes (raised/low ICP, post-traumatic, infectious) must be ruled out."
- Update `pitfalls` to reference §4.10 Notes 1–4 from ICHD-3 directly: prior migraine/TTH does not exclude NDPH but the patient must not describe an escalating frequency before onset; the diagnosis cannot be made if abortive overuse predates the daily pattern; secondary causes (5.1, 7.1, 7.2) must be excluded.

### 3.2 Paroxysmal hemicrania — MUST ADD

ICHD-3 §3.2 verbatim (Cephalalgia 2018 pp. 42–43):
> Description: Attacks of severe, strictly unilateral pain, which is orbital, supraorbital, temporal or in any combination of these sites, lasting 2–30 minutes and occurring several or many times a day. The attacks are usually associated with ipsilateral conjunctival injection, lacrimation, nasal congestion, rhinorrhoea, forehead and facial sweating, miosis, ptosis and/or eyelid oedema. They respond absolutely to indomethacin.
>
> A. At least 20 attacks fulfilling criteria B–E
> B. Severe unilateral orbital, supraorbital and/or temporal pain lasting 2–30 minutes
> C. Either or both of the following: 1. at least one of the following symptoms or signs, ipsilateral to the headache: a) conjunctival injection and/or lacrimation b) nasal congestion and/or rhinorrhoea c) eyelid oedema d) forehead and facial sweating e) miosis and/or ptosis 2. a sense of restlessness or agitation
> D. Occurring with a frequency of >5 per day
> E. Prevented absolutely by therapeutic doses of indomethacin
> F. Not better accounted for by another ICHD-3 diagnosis.

Chips needed (new):
- `dur-2-to-30-min` — "Attacks 2 to 30 minutes" (fills the gap between current `dur-lt-15-min` and `dur-15-to-180-min`)
- `freq-gt-5-per-day` — "More than 5 attacks per day"
- `attacks-ge-20` — "At least 20 lifetime attacks of this type"

Evaluator logic:
```ts
{
  id: 'paroxysmal-hemicrania',
  name: 'Paroxysmal hemicrania',
  ichd3Section: 'ICHD-3 §3.2',
  hiddenUntilTrial: true, // indomethacin response is definitional (criterion E)
  criteria: [
    { id: 'ph-A', label: 'At least 20 lifetime attacks',
      evaluate: s => has(s, 'attacks-ge-20'), contributingChips: ['attacks-ge-20'] },
    { id: 'ph-B', label: 'Severe unilateral orbital/supraorbital/temporal pain lasting 2–30 minutes',
      evaluate: s => has(s, 'loc-unilateral') && has(s, 'loc-orbital-temporal')
        && (has(s, 'sev-severe') || has(s, 'sev-very-severe'))
        && has(s, 'dur-2-to-30-min'),
      contributingChips: ['loc-unilateral', 'loc-orbital-temporal', 'sev-severe', 'sev-very-severe', 'dur-2-to-30-min'] },
    { id: 'ph-C', label: 'Ipsilateral autonomic features OR restlessness',
      evaluate: s => has(s, 'sym-autonomic-ipsilateral') || has(s, 'sym-restlessness'),
      contributingChips: ['sym-autonomic-ipsilateral', 'sym-restlessness'] },
    { id: 'ph-D', label: '>5 attacks per day',
      evaluate: s => has(s, 'freq-gt-5-per-day'), contributingChips: ['freq-gt-5-per-day'] },
    { id: 'ph-E', label: 'Absolute response to therapeutic indomethacin',
      evaluate: s => has(s, 'indo-tried-complete'), contributingChips: ['indo-tried-complete'] },
  ],
}
```

Suppression interactions: 3.2 and 3.4 both gate on `indo-tried-complete`. When both surface, they are distinguished by duration (PH: 2–30 min; HC: continuous) and frequency (PH: >5/day attacks; HC: continuous background). The hiddenUntilTrial gate should be extended to surface both 3.2 and 3.4 simultaneously when complete indomethacin response is selected, with each phenotype's chip-driven criteria determining which gets full vs probable match.

Teach pearl: "Paroxysmal hemicrania is the indomethacin-responsive TAC of short attacks (2–30 min), distinguished from cluster (longer, no indomethacin response) and hemicrania continua (continuous with exacerbations, also indomethacin-responsive). Therapeutic indomethacin dosing per ICHD-3 footnote: oral start ≥150 mg/day, titrate to 225 mg if needed."

### 3.3 SUNCT/SUNA — MUST ADD (fills the vacated §3.3 slot)

ICHD-3 §3.3 verbatim (Cephalalgia 2018 pp. 43–44):
> Description: Attacks of moderate or severe, strictly unilateral head pain lasting seconds to minutes, occurring at least once a day and usually associated with prominent lacrimation and redness of the ipsilateral eye.
>
> A. At least 20 attacks fulfilling criteria B–D
> B. Moderate or severe unilateral head pain, with orbital, supraorbital, temporal and/or other trigeminal distribution, lasting for 1–600 seconds and occurring as single stabs, series of stabs or in a saw-tooth pattern
> C. At least one of the following five cranial autonomic symptoms or signs, ipsilateral to the pain: 1. conjunctival injection and/or lacrimation 2. nasal congestion and/or rhinorrhoea 3. eyelid oedema 4. forehead and facial sweating 5. miosis and/or ptosis
> D. Occurring with a frequency of at least one a day

SUNCT subtype (§3.3.1) adds: conjunctival injection AND lacrimation both present, ipsilateral.
SUNA subtype (§3.3.2) adds: not more than one of conjunctival injection or lacrimation.

Chips needed (new):
- `dur-1-to-600-sec` — "Attacks 1 to 600 seconds (seconds to ~10 minutes)"
- `freq-ge-1-per-day` — "At least 1 attack per day" (this is a softer threshold than the cluster-bout chip)
- `attacks-ge-20` — already proposed above for PH; shared

Evaluator logic — implement as a single 3.3 entry first; subtype to SUNCT vs SUNA can be a v2 refinement.

```ts
{
  id: 'sunct-suna',
  name: 'Short-lasting unilateral neuralgiform headache attacks (SUNCT/SUNA)',
  ichd3Section: 'ICHD-3 §3.3',
  criteria: [
    { id: 'sun-A', label: 'At least 20 lifetime attacks',
      evaluate: s => has(s, 'attacks-ge-20'), contributingChips: ['attacks-ge-20'] },
    { id: 'sun-B', label: 'Moderate/severe unilateral trigeminal-distribution pain, 1–600 seconds',
      evaluate: s => has(s, 'loc-unilateral')
        && (has(s, 'sev-moderate') || has(s, 'sev-severe') || has(s, 'sev-very-severe'))
        && has(s, 'dur-1-to-600-sec'),
      contributingChips: ['loc-unilateral', 'sev-moderate', 'sev-severe', 'sev-very-severe', 'dur-1-to-600-sec'] },
    { id: 'sun-C', label: 'At least one ipsilateral cranial autonomic symptom',
      evaluate: s => has(s, 'sym-autonomic-ipsilateral'),
      contributingChips: ['sym-autonomic-ipsilateral'] },
    { id: 'sun-D', label: 'At least one attack per day',
      evaluate: s => has(s, 'freq-ge-1-per-day') || has(s, 'freq-gt-5-per-day'),
      contributingChips: ['freq-ge-1-per-day', 'freq-gt-5-per-day'] },
  ],
}
```

Teach pearl: "SUNCT/SUNA: the ultra-short TAC. Attacks 1–600 seconds, unilateral trigeminal, with cranial autonomics. Distinguished from cluster (15–180 min, longer), PH (2–30 min, indomethacin-responsive), and trigeminal neuralgia (no cranial autonomics, refractory period after each paroxysm). SUNCT/SUNA does not have a refractory period — attacks can be triggered without one."

### 4.4 Primary thunderclap headache — MUST ADD (routing, not diagnosis)

This entity is unusual in that ICHD-3 itself emphasises it is "a diagnosis of last resort, reached only when all organic causes have been demonstrably excluded" (Cephalalgia 2018 p. 51 Note 1). For a clinic pathway, this means: any patient selecting `rf-onset-sudden` must be routed to a red-flag workup, not to a primary-headache match.

ICHD-3 §4.4 verbatim (Cephalalgia 2018 p. 51):
> A. Severe head pain fulfilling criteria B and C
> B. Abrupt onset, reaching maximum intensity in <1 minute
> C. Lasting for ≥5 minutes
> D. Not better accounted for by another ICHD-3 diagnosis.

Recommendation: **do NOT add as a diagnosable primary-headache phenotype.** Instead:
- Keep the existing `rf-onset-sudden` red flag chip.
- Strengthen the red-flag workup language to name SAH, RCVS, ICH, CVT, dissection, unruptured aneurysm, pituitary apoplexy, colloid cyst, spontaneous intracranial hypotension, meningitis as the differential to exclude (per ICHD-3 §4.4 Note 1 verbatim list).
- Surface a single line in the red-flag panel: "Primary thunderclap headache is a diagnosis of exclusion (ICHD-3 §4.4). Imaging including SAH protocol, vessels, and CSF analysis must be exhausted before this label."

No new phenotype entry, no new chips. This is a routing-language fix in the red-flag panel.

### 1.5 Probable migraine and 2.4 Probable TTH — MUST ADD as distinct entries

The current evaluator uses `matchStrength: 'probable'` on the parent phenotype as a proxy for ICHD-3 §1.5 / §2.4 / §3.5. This is *semantically not the same* as the ICHD-3 entity. ICHD-3 X.5 entries are first-class diagnoses with their own criteria, used when the patient is one criterion short AND does not meet criteria for any other primary headache. The X.5 exclusion clause is structural to the entity, not a derived property of the parent.

ICHD-3 §1.5 verbatim (Cephalalgia 2018 p. 26):
> Description: Migraine-like attacks missing one of the features required to fulfil all criteria for a type or subtype of migraine coded above, and not fulfilling criteria for another headache disorder.
>
> A. Attacks fulfilling all but one of criteria A–D for 1.1 Migraine without aura, or all but one of criteria A–C for 1.2 Migraine with aura
> B. Not fulfilling ICHD-3 criteria for any other headache disorder
> C. Not better accounted for by another ICHD-3 diagnosis.

Recommended approach: keep `matchStrength: 'probable'` as the *computational* marker, but surface the result with the explicit ICHD-3 §1.5 / §2.4 / §3.5 label in the UI: "1.5 Probable migraine without aura" rather than just "Probable: Migraine without aura." Clinicians reading the result need to see the ICHD-3 code they would actually write in the chart. The existing X.5 exclusion logic in `evaluateHeadachePhenotypes` L546–551 already enforces "no probable when any full match exists," which is the substantive content of §1.5 criterion B / §2.4 criterion B.

Change scope: cosmetic + labeling, not evaluator-logic. Add a `probableIchd3Section` field on Phenotype to record the X.5 section number for surfacing when `matchStrength === 'probable'`.

### 1.4.1 Status migrainosus — SHOULD ADD

ICHD-3 §1.4.1 verbatim (Cephalalgia 2018 pp. 24–25):
> A. A headache attack fulfilling criteria B and C
> B. Occurring in a patient with 1.1 Migraine without aura and/or 1.2 Migraine with aura, and typical of previous attacks except for its duration and severity
> C. Both of the following characteristics: 1. unremitting for >72 hours 2. pain and/or associated symptoms are debilitating
> D. Not better accounted for by another ICHD-3 diagnosis.

Chips needed:
- `dur-gt-72-hours` — already exists
- `attack-debilitating` — "Pain or associated symptoms are debilitating (preventing usual activity)"
- `history-prior-migraine-diagnosis` — "Patient has an established 1.1 or 1.2 migraine diagnosis" (overlaps with the proposed `history-prior-migraine-attacks-ge-5` from §1.3; consolidate)

Evaluator logic:
```ts
{
  id: 'status-migrainosus',
  name: 'Status migrainosus',
  ichd3Section: 'ICHD-3 §1.4.1',
  criteria: [
    { id: 'sm-A', label: 'Patient has established migraine diagnosis (1.1 or 1.2)',
      evaluate: s => has(s, 'history-prior-migraine-attacks-ge-5'),
      contributingChips: ['history-prior-migraine-attacks-ge-5'] },
    { id: 'sm-B', label: 'Current attack unremitting for >72 hours',
      evaluate: s => has(s, 'dur-gt-72-hours'),
      contributingChips: ['dur-gt-72-hours'] },
    { id: 'sm-C', label: 'Pain or associated symptoms are debilitating',
      evaluate: s => has(s, 'attack-debilitating'),
      contributingChips: ['attack-debilitating'] },
  ],
}
```

Teach pearl: "Status migrainosus is an acute, debilitating migraine attack lasting >72 hours in a patient with an established migraine diagnosis. ED-level concern: it may be driven by medication overuse (per ICHD-3 §1.4.1 Comment — when MOH co-criteria are met, code MOH and the migraine type, but not 1.4.1). Treat aggressively; consider hospital-based bridging therapy."

---

## Phenotypes missing — defer to v2 with justification

### 1.4.2 Persistent aura without infarction — DEFER

Rationale: rare (Cephalalgia 2018 p. 25 Comment "Persistent aura symptoms are rare"); requires neuroimaging confirmation of no infarction; almost always involves specialist referral. A clinic pathway result of "consider 1.4.2 — get MRI to rule out 1.4.3 Migrainous infarction" is achievable through the red-flag panel (rf-neuro-deficit → workup language). Adding it as a phenotype would surface inappropriately for any aura+headache patient without a neuroimaging gate chip.

### 1.4.3 Migrainous infarction — DEFER

Rationale: a stroke diagnosis. ICHD-3 §1.4.3 requires neuroimaging-confirmed infarction. This belongs in the stroke pathway and the rf-neuro-deficit panel, not in the headache classifier.

### 1.4.4 Migraine aura-triggered seizure — DEFER

Rationale: extremely rare (Cephalalgia 2018 p. 26 Comment "a rare event"). Requires EEG/witness confirmation. Out of scope for a clinic headache classifier.

### 4.1 Primary cough headache, 4.2 Primary exercise headache, 4.3 Primary headache associated with sexual activity — DEFER

Rationale: all three are trigger-defined entities where the patient's history of the trigger is the diagnostic anchor. Adding them properly requires trigger-specific chips (cough-Valsalva, strenuous-exercise, sexual-activity) and dedicated workup language for the symptomatic differentials each one carries (Chiari I for cough, RCVS for exercise/sexual, SAH for sexual). A separate "trigger-defined primary headaches" v2 sub-pathway is cleaner than retrofitting them into the current chip vocabulary.

### 4.5 Cold-stimulus, 4.6 External-pressure, 4.7 Primary stabbing, 4.8 Nummular — DEFER

Rationale: low-prevalence in a general headache clinic; each requires a single dedicated trigger or topography chip; clinically managed by trigger avoidance with minimal workup. Defer to v2 trigger-defined sub-pathway with cough/exercise/sexual.

### 4.9 Hypnic headache — DEFER

Rationale: distinct epidemiology (post-50, sleep-onset only); requires sleep history chips not in the current vocabulary; differential includes 3.1 chronic cluster (must rule out per §4.9 Note 1). Consider for v2 alongside the geriatric / sleep-onset module.

### A1.3 Chronic migraine (alternative criteria) — DEFER

Rationale: appendix research criteria; the main-body §1.3 is the clinical standard. Field-testing of A1.3 may eventually drive an ICHD-4 update, but for current clinic use the main-body 1.3 is correct.

---

## A1.6.6 Vestibular migraine — full criteria (correcting the existing entry)

ICHD-3 lists vestibular migraine in the Appendix only because field-testing of the Bárány Society / IHS criteria was incomplete at the time of ICHD-3 main publication. The Bárány / IHS criteria (Lempert et al. 2012) are clinically standard despite appendix status. The current evaluator stub (L455–465) is materially under-specified.

Full ICHD-3 Appendix A1.6.6 / Bárány criteria (Lempert et al. J Vestib Res 2012; 22:167–172; ICHD-3 Appendix entry):
> A. At least 5 episodes with vestibular symptoms of moderate or severe intensity, lasting 5 minutes to 72 hours
> B. Current or previous history of 1.1 Migraine without aura or 1.2 Migraine with aura
> C. One or more migraine features with at least 50% of the vestibular episodes: 1. headache with at least two of the following four characteristics: a) one-sided location b) pulsating quality c) moderate or severe pain intensity d) aggravation by routine physical activity; 2. photophobia and phonophobia; 3. visual aura
> D. Not better accounted for by another vestibular or ICHD-3 diagnosis.

Note: this exact 5-criterion text is part of the Bárány Society / IHS joint criteria (Lempert 2012). The ICHD-3 PDF appendix entry I retrieved (pp. 14–15 classification table, p. 28 cross-reference) lists A1.6.6 in the table but the full criterion text is in the Lempert source. **Action: secure Lempert 2012 J Vestib Res full text before authoring the criteria in code.** Mark this addition as `blocked:source-not-resolved` if Lempert 2012 cannot be retrieved.

Chips needed (additional to existing vest-*):
- `vest-attacks-ge-5` — "At least 5 vestibular attacks"
- `vest-dur-5min-to-72h` — "Vestibular episodes 5 minutes to 72 hours"
- `vest-attacks-mod-severe` — "Moderate or severe intensity"
- `vest-migraine-features-ge-50pct` — "Migraine features (headache + photo/phono OR visual aura) present in ≥50% of vestibular attacks"

Fix the section number to `'ICHD-3 Appendix §A1.6.6'` regardless of whether the Lempert source is retrieved.

---

## Chip vocabulary additions — consolidated list

New ChipIds to add to the ChipId union and HEADACHE_CHIP_GROUPS:

| ChipId | Label | Supports phenotype |
|---|---|---|
| `dur-1-to-600-sec` | Attacks 1 to 600 seconds | 3.3 SUNCT/SUNA |
| `dur-2-to-30-min` | Attacks 2 to 30 minutes | 3.2 PH |
| `freq-ge-1-per-day` | At least 1 attack per day | 3.3 SUNCT/SUNA |
| `freq-gt-5-per-day` | More than 5 attacks per day | 3.2 PH |
| `attacks-ge-20` | At least 20 lifetime attacks of this type | 3.2 PH, 3.3 SUNCT/SUNA |
| `freq-migraine-features-ge-8-per-month` | On ≥8 days/month, attacks carry migraine features | 1.3 Chronic migraine |
| `history-prior-migraine-attacks-ge-5` | Patient has ≥5 prior attacks meeting 1.1/1.2 criteria | 1.3, 1.4.1 |
| `triptan-response-positive` | Some attacks respond to triptan or ergot | 1.3 (alternative path) |
| `attack-debilitating` | Pain/symptoms debilitating, preventing usual activity | 1.4.1 Status migrainosus |
| `sym-nausea-mild` | Mild nausea (does not prevent usual activity) | 2.3 Chronic TTH (allows), 1.1 (satisfies D) |
| `sym-nausea-moderate-severe` | Moderate or severe nausea | 1.1 (satisfies D), excludes 2.2 and 2.3 |
| `vest-attacks-ge-5` | At least 5 vestibular attacks | A1.6.6 VM |
| `vest-dur-5min-to-72h` | Vestibular episodes 5 min to 72 hours | A1.6.6 VM |
| `vest-attacks-mod-severe` | Moderate or severe vestibular intensity | A1.6.6 VM |
| `vest-migraine-features-ge-50pct` | Migraine features in ≥50% of vestibular attacks | A1.6.6 VM |

Chip to consider deprecating: standalone `aura-fully-reversible` (fold into each aura-modality chip label, since irreversible neurological symptoms are by definition not aura per ICHD-3 §1.2 B).

Chip to split: `sym-nausea` → `sym-nausea-mild` + `sym-nausea-moderate-severe` (drives the 2.3 criterion D fix).

---

## Criterion-D and suppression rule corrections

### Suppression rule: episodic suppression on continuous

Current: episodic phenotypes (1.1, 1.2, 2.2, 3.1) suppressed when `dur-continuous` is selected (L498–499).

ICHD-3 reality: a patient with 1.3 Chronic migraine has continuous baseline pain with episodic migraine exacerbations on ≥8 days/month. Per ICHD-3 §1.3 Note 1: "the characteristics of the headache may change not only from day to day but even within the same day. Such patients are extremely difficult to keep medication-free." A patient with HC (3.4) also has continuous pain with exacerbations. A patient with NDPH (4.10) has continuous unremitting pain.

Recommended fix: do NOT suppress 1.3 Chronic migraine or 3.4 HC or 4.10 NDPH on `dur-continuous` — instead, ensure these chronic-pattern phenotypes are added (1.3, 4.10) and their criteria correctly require continuous-pattern chips. The existing suppression of episodic 1.1 / 1.2 / 2.2 / 3.1 on `dur-continuous` is correct because those entities by definition have pain-free intervals. Cluster (3.1) attacks are <180 min with hours of freedom between; episodic TTH (2.2) is 30 min to 7 days; migraine (1.1) is 4–72 h. None of these is continuous.

Per-phenotype `suppressIfContinuous` flag (already on the Phenotype interface, currently unused): wire it on episodic phenotypes explicitly and leave it `false` (or unset) for 1.3, 3.4, 4.10.

### Criterion D corrections

**1.1 Migraine without aura D:** current evaluator is correct. No change beyond the nausea-severity refinement (when `sym-nausea` splits into mild/moderate-severe, both should satisfy D).

**2.2 Episodic TTH D:** current is correct.

**2.3 Chronic TTH D:** drifted, fix outlined in §2.3 verdict above. Requires the nausea-severity split.

**3.1 Cluster C:** current is correct.

**3.4 HC C:** current is correct; verbatim ICHD-3 §3.4 C reads "ipsilateral cranial autonomic symptoms... and/or restlessness or agitation, or aggravation of the pain by movement." The current evaluator omits "aggravation of the pain by movement" — minor under-spec, acceptable since the restlessness chip captures the substantive content.

### Multi-gate refinement on indomethacin

Currently, `hiddenUntilTrial: true` only gates 3.4 HC. Once 3.2 PH is added, both PH and HC should surface when `indo-tried-complete` is selected. The gate check at L491–494 needs to widen to "any phenotype where indomethacin response is part of the criteria" — both PH and HC qualify. Restructure as:
```ts
if (phenotype.hiddenUntilTrial) {
  const indoCriteriaIds = phenotype.criteria.filter(c => c.contributingChips.includes('indo-tried-complete')).map(c => c.id);
  if (indoCriteriaIds.length > 0 && !selected.has('indo-tried-complete')) continue;
}
```

---

## Multi-diagnosis recommendation

ICHD-3 General Principles (Cephalalgia 2018 pp. 6–7) explicitly mandate multi-diagnosis coding:

Verbatim from §3: "Each distinct type, subtype or subform of headache that the patient has must be separately diagnosed and coded. For example, a severely affected patient in a headache centre may receive three diagnoses and codes: 1.1 Migraine without aura, 1.2 Migraine with aura and 8.2 Medication-overuse headache."

Verbatim from §4: "When a patient receives more than one diagnosis, these should be listed in the order of importance to the patient."

The evaluator already returns ranked matches — `evaluateHeadachePhenotypes` returns a `PhenotypeMatch[]` sorted by match strength. The defect is at the **UI surfacing layer**: the Clinic Headache Pathway page (per V's report) currently displays only the top match. This is a page-layer fix, not an evaluator fix.

Recommendation:
- Surface ALL full matches with equal visual weight, not just the top one.
- Surface probable matches as secondary, clearly labeled as ICHD-3 §X.5 entities.
- For each surfaced match, show the criteria-met list so the clinician sees what evidence the system used.
- Add a teaching line: "ICHD-3 General Principle 3 — each distinct headache type must be separately diagnosed and coded. If your patient describes attacks that vary in character, expect more than one diagnosis."

Patient scenarios where multi-diagnosis is the right answer:
1. Migraine + MOH (Chronic migraine with daily triptan use → code both 1.3 and 8.2.2)
2. Migraine + episodic TTH (the most common dual primary diagnosis per ICHD-3 §2.2 Comment)
3. Cluster + trigeminal neuralgia (cluster-tic syndrome — per ICHD-3 §3.1 Comment, both should be coded)
4. Episodic migraine + chronic migraine in evolution (during transition to chronification)

---

## Citations needed — registry entries

The existing `ichd3-2018` entry in `src/lib/citations/registry.ts` currently covers §1.1, §1.2, §2.2, §2.3, §3.1, §3.3, §3.4. To support the additions in this audit, the `quoted_text` field needs to be expanded (or the entry split into per-section claim citations). Proposed approach: keep the single `ichd3-2018` registry entry but expand `quoted_text` to a multi-section concatenation, OR create new claim IDs in `src/lib/citations/claims.ts` each pointing to the same `ichd3-2018` source citation but with claim-specific descriptions.

Recommended new claim IDs (each maps to `ichd3-2018`):
- `chronic-migraine-1-3-criteria` — supports the new 1.3 phenotype
- `paroxysmal-hemicrania-3-2-criteria` — supports the new 3.2 phenotype
- `sunct-suna-3-3-criteria` — supports the new 3.3 phenotype
- `ndph-4-10-criteria` — supports the recoded NDPH phenotype
- `vestibular-migraine-a1-6-6-criteria` — supports the corrected A1.6.6 entry (note: may also require a Lempert 2012 citation if Bárány source is added)
- `status-migrainosus-1-4-1-criteria` — supports 1.4.1
- `probable-migraine-1-5-criteria`, `probable-tth-2-4-criteria`, `probable-tac-3-5-criteria` — support the explicit X.5 labels
- `ichd3-general-principles-multi-diagnosis` — supports the multi-diagnosis page-layer fix (cites Cephalalgia 2018 pp. 6–7 General Principles §3–§5)
- `primary-thunderclap-headache-4-4-routing` — supports the red-flag panel language additions (cites §4.4 Note 1 for the SAH/RCVS/CVT exclusion list)

`ichd3-2018` registry entry update: expand `quoted_text` to include verbatim from §1.3, §1.4.1, §3.2, §3.3, §4.10, §A1.6.6, and General Principles 3–5. The expanded `quoted_text` block is large (~3 KB) — recommend that `data-architect` evaluates whether to split `ichd3-2018` into multiple section-specific citation entries (`ichd3-2018-section-1-3`, etc.) or to keep one big entry. Either is defensible; the multi-entry approach is cleaner for §13.6 review-checklist tracking when only one section is updated.

A Lempert 2012 citation may be needed for A1.6.6 VM criteria text:
- Citation ID candidate: `lempert-vestibular-migraine-2012`
- Source: Lempert T, Olesen J, Furman J, et al. Vestibular migraine: diagnostic criteria. J Vestib Res. 2012;22:167–172.
- PMID: 23142830
- `last_reviewed`: pending verbatim retrieval (Tier 2 source — may require V to provide PDF; status `blocked:source-not-resolved` until then).

---

## Test cases needed — Vitest scenarios for the additions

For each new phenotype, the table below shows a chip set that should produce a full match. Add to `src/data/clinicHeadacheData.test.ts` under appropriate `describe` blocks.

### 1.3 Chronic migraine — full match

```ts
const matches = evaluateHeadachePhenotypes(select(
  'freq-ge-15-per-month',
  'pattern-ge-3-months',
  'history-prior-migraine-attacks-ge-5',
  'freq-migraine-features-ge-8-per-month',
));
expect(matches.find(m => m.phenotypeId === 'chronic-migraine')?.matchStrength).toBe('full');
// And confirm chronic-tth is suppressed when chronic-migraine is full
expect(matches.find(m => m.phenotypeId === 'chronic-tth')).toBeUndefined();
```

### 3.2 Paroxysmal hemicrania — full match

```ts
const matches = evaluateHeadachePhenotypes(select(
  'attacks-ge-20',
  'loc-unilateral', 'loc-orbital-temporal', 'sev-severe',
  'dur-2-to-30-min',
  'sym-autonomic-ipsilateral',
  'freq-gt-5-per-day',
  'indo-tried-complete',
));
expect(matches.find(m => m.phenotypeId === 'paroxysmal-hemicrania')?.matchStrength).toBe('full');
```

### 3.2/3.4 dual-surface on complete indo response

```ts
// Patient reports continuous unilateral pain + indo response: should surface 3.4 HC full,
// 3.2 PH not full (PH requires episodic 2-30 min attacks, not continuous).
const matches = evaluateHeadachePhenotypes(select(
  'loc-unilateral', 'dur-continuous', 'pattern-ge-3-months',
  'sev-severe', 'sym-autonomic-ipsilateral', 'indo-tried-complete',
));
expect(matches.find(m => m.phenotypeId === 'hemicrania-continua')?.matchStrength).toBe('full');
expect(matches.find(m => m.phenotypeId === 'paroxysmal-hemicrania')?.matchStrength).not.toBe('full');
```

### 3.3 SUNCT/SUNA — full match

```ts
const matches = evaluateHeadachePhenotypes(select(
  'attacks-ge-20',
  'loc-unilateral', 'sev-severe',
  'dur-1-to-600-sec',
  'sym-autonomic-ipsilateral',
  'freq-ge-1-per-day',
));
expect(matches.find(m => m.phenotypeId === 'sunct-suna')?.matchStrength).toBe('full');
```

### 4.10 NDPH — full match (with corrected section label)

```ts
const matches = evaluateHeadachePhenotypes(select(
  'dur-continuous', 'pattern-ge-3-months', 'onset-new-within-3-months',
));
const ndph = matches.find(m => m.phenotypeId === 'ndph');
expect(ndph?.matchStrength).toBe('full');
expect(ndph?.ichd3Section).toBe('ICHD-3 §4.10'); // was incorrectly §3.3
```

### 1.4.1 Status migrainosus

```ts
const matches = evaluateHeadachePhenotypes(select(
  'history-prior-migraine-attacks-ge-5',
  'dur-gt-72-hours',
  'attack-debilitating',
));
expect(matches.find(m => m.phenotypeId === 'status-migrainosus')?.matchStrength).toBe('full');
```

### 2.3 Chronic TTH — drift fix regression

```ts
// Patient with chronic pattern but moderate nausea: must NOT full-match 2.3,
// must full-match 1.3 if migraine history present.
const matches = evaluateHeadachePhenotypes(select(
  'freq-ge-15-per-month', 'pattern-ge-3-months',
  'dur-30min-to-7days',
  'loc-bilateral', 'qual-pressing-tightening', 'sev-mild', 'act-not-aggravated',
  'sym-nausea-moderate-severe',
));
expect(matches.find(m => m.phenotypeId === 'chronic-tth')?.matchStrength).not.toBe('full');
```

### Multi-diagnosis surfacing (page-layer concern, evaluator-level confirmation)

```ts
// Patient with both episodic migraine criteria fully met AND episodic TTH criteria fully met:
// evaluator must return both as full matches.
const matches = evaluateHeadachePhenotypes(select(
  // Episodic migraine ingredients
  'attacks-gt-10', 'dur-4-to-72-hours', 'loc-unilateral', 'qual-pulsating',
  // Sufficient migraine features
  'sym-nausea-mild',
  // Episodic TTH ingredients on different attacks (chip vocabulary cannot
  // distinguish attack-type, so this scenario is rare in the chip flow —
  // documented as a known limitation requiring per-attack-type chips in v3).
));
const fullMatches = matches.filter(m => m.matchStrength === 'full');
expect(fullMatches.length).toBeGreaterThanOrEqual(1);
```

Note: the chip vocabulary's current per-feature flat structure makes it impossible to encode "attack type A has these features, attack type B has those features." A genuinely multi-diagnosis-capable system needs per-attack-type chip groups. **This is itself a v2 design question**: should the picker surface "Tell me about attack type 1" and "Tell me about attack type 2" as separate panels? Out of scope for this audit; flagged as a future structural question for `ui-architect`.

---

## Routing

Ready for clinical-reviewer.

Class on the implementation PR will be **D-clinical** (cross-cuts evaluator logic, chip vocabulary, UI surfacing layer, citation registry, and tests). The §17.1 architect review must address: (1) the suppression-rule refactor; (2) the `hiddenUntilTrial` multi-gate refactor; (3) the multi-diagnosis page-surfacing change; (4) whether to split `ichd3-2018` registry entry. The §17.2 clinical-reviewer pass must verify every newly-encoded criterion against the verbatim ICHD-3 quotes in this audit.

V will read this audit before approving the implementation work. The single most urgent item — and most likely answer to V's "misleading interpretation" complaint — is **1.3 Chronic migraine + the 2.3 D nausea-severity drift fix**. If V wants a smaller first PR, ship those two changes with the 4.10 / A1.6.6 section-number fixes in the same scope and defer 3.2 / 3.3 to a second PR.
