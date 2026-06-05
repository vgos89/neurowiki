# Clinical specification — headache engine rank-and-flag (drop→demote)

**Type:** Pre-execution clinical specification for a Class E change. Authoring only. No engine, source, or test file is changed by this document — it is the evidence base + per-criterion ruleset a `clinical-reviewer` gates in fresh context before any code is written.
**Author:** medical-scientist (model: opus)
**Date:** 2026-06-04
**Engine specified:** `src/data/clinicHeadacheData.ts` (829 lines)
**Source of truth:** ICHD-3 (Cephalalgia 2018;38(1):1–211; PMID 29368949; DOI 10.1177/0333102417738202; citation id `ichd3-2018`).

**Scope guardrail (hard):** This change is LOGIC + CHIP VOCABULARY only. It does NOT author result-screen wording, band words ("Leading/Possible/Less likely"), SNNOOP10/dangerous-mimic disclaimer prose, or citation-footer copy — those are a later, separate clinical step. Near-miss surfacing reuses the existing per-criterion `description` text already in the engine. Every criterion role and every new chip below traces to a specific ICHD-3 section.

---

## 0. ICHD-3 verbatim re-verification done for THIS spec (not inherited blind)

The prior re-audit (`medsci-headache-ichd3-reaudit-2026-06-04.md`) and its clinical gate (`clinical-headache-ichd3-reaudit-2026-06-04.md`) supply most verbatim quotes. I re-fetched the four quotes that are load-bearing for the demote ruling and the three corrections, because each one decides a gate class:

1. **§1.5 Probable migraine, criterion A (verbatim, ichd-3.org §1.5):** *"Attacks fulfilling all but one of criteria A–D for 1.1 Migraine without aura, or all but one of criteria A–C for 1.2 Migraine with aura,"* plus "not fulfilling ICHD-3 criteria for any other headache disorder" and "not better accounted for by another ICHD-3 diagnosis." → No single §1.1 A–D (or §1.2 A–C) criterion can be a hard drop without breaking §1.5. **This is the spine of the demote ruling.**
2. **§3.5 Probable TAC, criterion A (verbatim, ichd-3.org §3.5):** *"Headache attacks fulfilling all but one of criteria A–D for 3.1 Cluster headache, criteria A–E for 3.2 Paroxysmal hemicrania, criteria A–D for 3.3 SUNCT/SUNA, or criteria A–D for 3.4 Hemicrania continua,"* with the gloss "either have not had a sufficient number of typical attacks OR are missing one of the features." → confirms `cluster-B`, `ph-B`, `sunct-B` are demotable. Carries a subtle indomethacin interaction handled in §4 / decision 3 below.
3. **§1.2 C, item 4 (verbatim, confirmed via Neurotorium mirror + ichd-3.org search snippet):** the six characteristics are (1) ≥1 aura symptom spreads gradually over ≥5 min, (2) ≥2 symptoms in succession, (3) each symptom 5–60 min, **(4) at least one aura symptom is unilateral**, (5) ≥1 positive symptom, (6) aura accompanied/followed within 60 min by headache. Item 4 is a property of the **aura symptom**, not headache pain. → grounds correction 4a.
4. **A1.6.6 criterion B (verbatim, ichd-3.org appendix + corroborating mirror):** *"A current or past history of 1.1 Migraine without aura or 1.2 Migraine with aura."* → **Confirmed: the migraine-history requirement is carried by ICHD-3 A1.6.6 itself, not by the Bárány/Lempert 2012 consensus.** I agree with the task framing and do NOT flag a discrepancy. Correction 4c is correctly grounded in A1.6.6; no Bárány source is needed for it.

The `ichd-3.org` HTML phenotype pages still truncate before the criteria box on direct WebFetch (the prior audit's documented limitation reproduced); I confirmed each quote above via the page's own search-snippet text plus an independent mirror. No criterion below is quoted from memory.

---

## 1. Total per-criterion role classification (the deliverable core)

Every criterion of all 11 instantiated phenotypes is assigned exactly one role:

- **`scorable`** — counts toward met/total, NEVER gates. Its failure neither hides nor demotes; it only lowers the met fraction.
- **`demote-gate`** — failure keeps the phenotype but caps `matchStrength` at `probable` (if it is the only miss) / `partial` (if other criteria also miss) and lists the criterion in `missingCriteria`. ICHD-3 §X.5 "all but one" makes the single-miss case a named Probable entity.
- **`suppress-gate`** — failure HIDES the phenotype (the rank-and-flag equivalent of today's drop). Reserved for criteria whose failure is itself positive evidence for a DIFFERENT phenotype, or that define the phenotype's substrate/chronicity, or that are an absent confirmatory test.

**The governing principle (from the clinical gate's amendment, which I adopt and extend):** a criterion whose failure is positive evidence for a different phenotype, OR that defines the phenotype's substrate/chronicity, SUPPRESSES; a criterion that is a feature/window the patient simply has not confirmed yet DEMOTES.

### 1.1 Migraine without aura — §1.1

| Criterion | Line | Role | ICHD-3-grounded reason |
|---|---|---|---|
| `mig-A` (≥5 attacks) | L418 | **scorable** | Already intentionally non-gating (L415-417). §1.5.1 Probable migraine without aura explicitly covers <5 attacks; gating it would close the §1.5 path. Its miss simply lowers the fraction. |
| `mig-B` (duration 4–72 h) | L419 | **demote-gate** | §1.1 B is one of the four A–D criteria §1.5 says you may miss exactly one of. A patient missing only duration is the textbook §1.5.1. Feature/window not-yet-confirmed → demote. |
| `mig-C` (≥2 character features) | L420 | **scorable** | A graded count (≥2 of 4). Not a single yes/no gate; the engine never drops on it today, and §1.5 tolerates its miss. Keep as a score contributor. |
| `mig-D` (nausea/vomiting OR photo+phono) | L421 | **demote-gate** | §1.1 D is an A–D criterion; §1.5 covers its single miss. Associated-symptom window not-yet-confirmed → demote, not hide. |

**Suppress gate for §1.1:** none among the criteria. Resolved in decision 2 — the `hasPositiveEvidence` floor is the suppression floor, strengthened.

### 1.2 Migraine with aura — §1.2

| Criterion | Line | Role | Reason |
|---|---|---|---|
| `aura-A` (≥2 attacks) | L437 | **scorable** | §1.2 A is one of A–C; §1.5.2 covers its single miss. Note the granularity fix in correction 4b (it must stop accepting a 1-attack chip) — that is a contributing-chip change, not a role change. Stays scorable. |
| `aura-B` (≥1 reversible aura symptom) | L438 | **suppress-gate** | Aura is the **substrate** of "migraine with aura." No aura symptom at all = not an aura disorder; the patient is a different entity (e.g. migraine without aura). Substrate-absence → suppress, mirroring `vm-A`. |
| `aura-C` (≥3 of 6 characteristics) | L439 | **scorable** | A graded count; §1.5.2 tolerates its single miss ("all but one of A–C"). Today non-definitional. Keep scorable. (Correction 4a rewires its 6th characteristic off `loc-unilateral`.) |

### 1.3 Chronic migraine — §1.3

| Criterion | Line | Role | Reason |
|---|---|---|---|
| `cm-A` (≥15 days/mo for >3 mo) | L594 | **suppress-gate** | **Chronicity threshold.** A 5–14-day patient is not "probable chronic migraine" — they are episodic, a different entity. Demoting would surface a phenotype the frequency definitionally excludes. (Clinical-gate amendment, adopted.) Also: §1.3 has NO §1.5.3 Probable counterpart (verified), so a single miss has no Probable home. |
| `cm-B` (≥5 prior 1.1/1.2 attacks) | L599 | **scorable** | A "must have had" historical gate, but chronicity chips presuppose attack count (L595-598 reasoning holds), so in chip vocabulary it cannot independently fail when `cm-A` passes. No §1.5.3 to demote into. Leave as a score contributor; it never independently hides. |
| `cm-C` (≥8 migraine-feature days OR triptan-responsive) | L600 | **suppress-gate** | The criterion that distinguishes Chronic migraine from Chronic TTH. With no §1.5.3 Probable, a single `cm-C` miss has no "Probable chronic migraine" surface to land on; surfacing it as a near-miss would invent an ICHD-3 entity that does not exist. Its absence means the chronic-headache pattern is TTH-type, not migraine — i.e. positive evidence for §2.3. Suppress. The clinician still sees Chronic TTH (which will surface on the same chips), which is the correct steer. |

NOTE on `cm-C` as suppress vs the §3.5/§1.5 demote logic: the difference is that §1.1/§1.2/§3.1-3.4 each HAVE a §X.5 Probable entity, so a single feature miss is a named "Probable X." §1.3 does not. ICHD-3 deliberately omits Probable chronic migraine. Therefore the only faithful behaviors for a single §1.3 miss are full-match or suppress — never "Probable chronic migraine." This is why `cm-C` (and `cm-A`) suppress while their §1.1 analogues demote.

### 2.2 Frequent episodic TTH — §2.2

| Criterion | Line | Role | Reason |
|---|---|---|---|
| `tth-A` (≥10 episodes, 1–14 d/mo, ≥3 mo) | L454 | **scorable** | A conjunctive frequency/pattern criterion; §2.4.1 Probable episodic TTH covers its single miss ("all but one"). Keep as score contributor — its miss should demote at most, never hide, and since it is multi-part the cleanest encoding is scorable so a partial frequency picture still surfaces the phenotype. |
| `tth-B` (duration 30 min–7 d) | L455 | **demote-gate** | §2.2 B is an A–D criterion; §2.4 Probable TTH covers its single miss. Feature/window not-yet-confirmed → demote. |
| `tth-C` (≥2 character features) | L456 | **scorable** | Graded count (≥2 of 4); §2.4 tolerates single miss. Keep scorable. |
| `tth-D` (no nausea/vomiting; ≤1 photo/phono) | L463 | **suppress-gate** | **Exclusion criterion.** Its failure is positive evidence for a DIFFERENT phenotype: nausea/vomiting is migraine-defining (§1.1 D). Surfacing "Probable episodic TTH — confirm no vomiting" for a patient who actively HAS vomiting is clinically backwards. Suppress. (Clinical-gate amendment, adopted. The `hasPositiveEvidence` floor already prevents empty-input trivial match, L725-729.) |

### 2.3 Chronic TTH — §2.3

| Criterion | Line | Role | Reason |
|---|---|---|---|
| `ctth-A` (≥15 d/mo for >3 mo) | L475 | **suppress-gate** | **Chronicity threshold.** Same logic as `cm-A`: a sub-15-day patient is episodic, a different entity. §2.4 Probable TTH exists but a frequency that places the patient in episodic territory is not "probable chronic" — it is a different frequency band. Suppress. |
| `ctth-B` (hours to continuous) | L476 | **demote-gate** | §2.3 B is a duration A–D criterion; §2.4 covers its single miss. Feature/window not-yet-confirmed → demote. |
| `ctth-C` (≥2 character features) | L477 | **scorable** | Graded count; §2.4 tolerates single miss. Keep scorable. |
| `ctth-D` (≤1 of {mild nausea, photo, phono}; no mod/severe nausea; no vomiting) | L482 | **suppress-gate** | **Exclusion criterion.** Its failure (moderate/severe nausea or vomiting) is positive evidence for migraine (§1.1 D / chronic migraine §1.3). Same backwards-prompt problem as `tth-D`. Suppress. (Clinical-gate amendment, adopted.) |

### 3.1 Cluster headache — §3.1

| Criterion | Line | Role | Reason |
|---|---|---|---|
| `cluster-A` (≥5 attacks) | L498 | **scorable** | §3.5.1 Probable cluster covers attack-count shortfall ("have not had a sufficient number of typical attacks"). Keep as score contributor. |
| `cluster-B` (severe unilateral orbital/temporal, 15–180 min) | L499 | **demote-gate** | §3.1 B is an A–D criterion; §3.5.1 covers its single miss. **This is the stated clinic between-bouts use case:** a patient who cannot confirm 15–180 min attack length right now should surface as "Probable cluster — confirm attack length 15–180 min," not vanish. Feature/window not-yet-confirmed → demote. |
| `cluster-C` (autonomic OR restlessness) | L500 | **demote-gate** | §3.1 C is an A–D criterion; §3.5.1 covers its single miss. A clinic patient who has not yet reported autonomic features/restlessness should surface as a near-miss naming that criterion, not vanish. Feature not-yet-confirmed → demote. (Change from current `definitional:true`; see decision-3 note — `cluster-C` failure is NOT positive evidence for another phenotype, so it does not meet the suppress test.) |
| `cluster-D` (bout frequency) | L509 | **scorable** | Already intentionally non-gating (L501-508): between-bouts encounters cannot chip-surface bout frequency. Keep scorable. |

### 3.2 Paroxysmal hemicrania — §3.2 (gated by `hiddenUntilTrial: indo-tried-complete`)

| Criterion | Line | Role | Reason |
|---|---|---|---|
| `ph-A` (≥20 attacks) | L616 | **scorable** | §3.5.2 covers attack-count shortfall. Keep score contributor. |
| `ph-B` (severe unilateral orbital/temporal, 2–30 min) | L617 | **demote-gate** | §3.2 B is one of A–E; §3.5.2 covers its single miss. Feature/window not-yet-confirmed → demote (within the indomethacin gate; see decision 3). |
| `ph-C` (autonomic OR restlessness) | L618 | **demote-gate** | §3.2 C is one of A–E; §3.5.2 covers single miss. Not positive evidence for another phenotype → demote. (Change from current `definitional:true`.) |
| `ph-D` (>5/day for >half the time) | L624 | **scorable** | Already intentionally non-gating (L619-623): between-bouts bout-frequency un-surfaceable. Keep scorable. |
| `ph-E` (absolute indomethacin response) | L626 | **suppress-gate** | **Absent confirmatory test, double-enforced by `hiddenUntilTrial`.** Not a feature the patient "has not mentioned" — it is a therapeutic trial that either was done with complete response or was not. The phenotype is already hidden until `indo-tried-complete` (L704), so `ph-E` and the gate are idempotent. Keep as suppress so the invariant (decision in §6) sees a designated suppress path AND the gate. (See decision-3 note on the §3.5.2 "missing only indomethacin" edge case.) |

### 3.3 SUNCT/SUNA — §3.3

| Criterion | Line | Role | Reason |
|---|---|---|---|
| `sunct-A` (≥20 attacks) | L640 | **scorable** | §3.5.3 covers attack-count shortfall. Keep score contributor. |
| `sunct-B` (moderate-severe unilateral trigeminal, 1–600 sec) | L641 | **demote-gate** | §3.3 B is an A–D criterion; §3.5.3 covers its single miss. Feature/window not-yet-confirmed → demote. |
| `sunct-C` (≥1 ipsilateral autonomic feature) | L642 | **suppress-gate** | **Substrate of the phenotype.** SUNCT/SUNA are defined by cranial autonomic accompaniment (the "C/A" in the name). Zero autonomic features = not a SUNCT/SUNA — the very-short-attack picture without autonomic features points elsewhere (e.g. primary stabbing headache, trigeminal neuralgia). Substrate-absence → suppress. (See decision-3 note: this is the one TAC criterion I rule suppress rather than demote, and I flag the tension with §3.5.3's literal "all but one" for clinical-reviewer attention.) |
| `sunct-D` (≥1/day for >half active period) | L643 | **scorable** | Frequency criterion; same between-bouts rationale as `cluster-D`/`ph-D`. Keep scorable. |

### 3.4 Hemicrania continua — §3.4 (gated by `hiddenUntilTrial: indo-tried-complete`)

| Criterion | Line | Role | Reason |
|---|---|---|---|
| `hc-A` (continuous strictly unilateral, >3 mo) | L524 | **suppress-gate** | **Substrate + laterality + chronicity combined.** A non-unilateral or non-continuous headache is not hemicrania continua — it is a different entity (continuous bilateral → chronic TTH/NDPH territory). Substrate-defining → suppress. |
| `hc-B` (exacerbations ≥ moderate) | L525 | **scorable** | Already non-definitional today. §3.5.4 covers single miss. Keep score contributor. |
| `hc-C` (autonomic OR restlessness/movement) | L526 | **demote-gate** | §3.4 C is an A–D criterion; §3.5.4 covers single miss. Not positive evidence for another phenotype → demote. (Change from current `definitional:true`.) |
| `hc-D` (absolute indomethacin response) | L529 | **suppress-gate** | **Absent confirmatory test, double-enforced by `hiddenUntilTrial`** (L520, L527-528). Same logic as `ph-E`. Suppress. |

### 4.10 NDPH — §4.10

| Criterion | Line | Role | Reason |
|---|---|---|---|
| `ndph-A` (persistent >3 mo, continuous) | L544 | **suppress-gate** | **Substrate + chronicity.** Non-continuous or <3-month headache is not NDPH — it is by definition not "new daily persistent." Substrate-defining → suppress. |
| `ndph-B` (distinct remembered onset, continuous within 24 h) | L554 | **suppress-gate** | The single most discriminating NDPH feature: a clearly-remembered onset that became continuous within 24 h is the diagnostic signature; its absence means the headache is not NDPH but another chronic-daily pattern (chronic migraine/chronic TTH). **NDPH has NO §X.5 Probable counterpart in ICHD-3** (verified — §4.10 sits in chapter 4 "Other primary headache disorders," which has no Probable framework), so a single miss has no Probable home and must suppress, not demote. The "within 24 h" temporal limit remains non-chip-enforceable (honestly flagged in the existing description, L545-554) — clinician confirms from history. |

### A1.6.6 Vestibular migraine — appendix entity

| Criterion | Line | Role | Reason |
|---|---|---|---|
| `vm-A` (vertigo episodes with migrainous symptoms) | L574 | **suppress-gate** | **Vertigo substrate.** No vertigo = not vestibular migraine. Closes the V-reported phonophobia-only false-positive (2026-05-27). Keep suppress. VM is an appendix entity with no §X.5 — substrate-absence → suppress. |
| `vm-B` (migrainous features during episodes) | L575 | **scorable** | This is actually ICHD-3 A1.6.6 criterion **C** (associated features), mislabeled "B" — see correction 4c and MED-2. As a graded associated-feature criterion it is a score contributor, not a gate. Keep scorable. (Its LABEL/description must be corrected to reflect criterion C wording — copy-adjacent, handled in correction 4c.) |
| `vm-history` (NEW — current/past 1.1/1.2 migraine history) | new | **suppress-gate** | **A1.6.6 criterion B substrate.** VM by definition requires established migraine; this is the feature distinguishing it from BPPV, Menière, vestibular paroxysmia. Its absence means the patient cannot have VM regardless of vertigo. Substrate-defining, no §X.5, and the clinical gate's explicit guardrail (worsens over-surfacing under demote unless this is a hard gate) → suppress. (New chip specified in correction 4c.) |

### Role-classification summary (counts — 40 criteria total)

- **scorable (16):** `mig-A`, `mig-C`, `aura-A`, `aura-C`, `cm-B`, `tth-A`, `tth-C`, `ctth-C`, `cluster-A`, `cluster-D`, `ph-A`, `ph-D`, `hc-B`, `sunct-A`, `sunct-D`, `vm-B`.
- **demote-gate (10):** `mig-B`, `mig-D`, `tth-B`, `ctth-B`, `cluster-B`, `cluster-C`, `ph-B`, `ph-C`, `sunct-B`, `hc-C`.
- **suppress-gate (14):** `aura-B`, `cm-A`, `cm-C`, `tth-D`, `ctth-A`, `ctth-D`, `sunct-C`, `hc-A`, `hc-D`, `ph-E`, `ndph-A`, `ndph-B`, `vm-A`, `vm-history`.

(16 + 10 + 14 = 40 criteria across the 11 phenotypes, counting the new `vm-history`. Exact per-criterion roles are the per-phenotype tables above; the summary buckets are a cross-check, not the source of truth.)

**Changes from the current `definitional:true` set:** the demote-gates `mig-B`, `mig-D`, `tth-B`, `ctth-B`, `cluster-B`, `ph-B`, `sunct-B`, `hc-C` were all `definitional:true` and drop today; they now demote. Additionally `cluster-C` and `ph-C` move from `definitional:true` to demote-gate (their failure is not positive evidence for another phenotype). The suppress-gates retain hide behavior. `aura-B` was `definitional:true` and stays hide (now as suppress-gate). The provisional split in the task brief is **confirmed and completed** with these additions: `cluster-C`/`ph-C`/`hc-C` demote (the brief listed only the `*-B` criteria), `aura-B`/`sunct-C`/`ndph-A`/`ndph-B`/`cm-C` are named explicit suppress members (the brief's provisional list was partial), and `vm-history` is the new suppress gate.

---

## 2. §1.1-floor ruling (architect follow-up 5)

**Question:** under the demote split, §1.1 migraine-without-aura has both gating criteria (`mig-B`, `mig-D`) as demote, leaving NO suppress gate — so the only thing hiding it is the `hasPositiveEvidence` floor (≥1 positive contributing chip, L727-729). Is that floor an acceptable suppression floor, or does §1.1 need a designated suppress gate? Same question for §1.2 and §2.2.

### Ruling for §1.1: the `hasPositiveEvidence` floor is NOT sufficient as written. Strengthen it to a §1.1-specific minimum-evidence floor.

Clinical reasoning: the bare floor (any one contributing chip) would surface "Probable migraine" off a single incidental chip — e.g. `sym-nausea-mild` alone, or `loc-unilateral` alone. That is the exact false-positive class the 2026-05-27 definitional work was built to kill (the VM-on-phonophobia-alone bug). A migraine near-miss surfaced on one incidental symptom, with the headline "Probable migraine," would over-surface migraine at a lookup step and could anchor the clinician.

§1.1 has no chronicity or substrate criterion to serve as a natural suppress gate (unlike §1.3/§2.3 chronicity, §1.2/VM substrate). So the floor must do the suppression work — but it must be a **meaningful** floor, not "any one chip."

**Minimum positive evidence required before §1.1 surfaces as a near-miss:** the patient must have **BOTH (a) a pain-character feature that is migraine-pointing AND (b) at least one further migraine-pointing element**, where the migraine-pointing set is the union of the §1.1 C character features and the §1.1 D associated symptoms:

- Migraine-pointing chips = `{loc-unilateral, qual-pulsating, sev-moderate, sev-severe, act-aggravated}` (C features) ∪ `{sym-nausea-mild, sym-nausea-moderate-severe, sym-vomiting, sym-photophobia, sym-phonophobia}` (D symptoms).
- **Floor rule:** §1.1 surfaces only if **≥2 distinct migraine-pointing chips** are selected, of which **at least one is a §1.1 C character feature** (so that location/pulsating/severity/activity, the discriminating axis, is represented — not two associated-symptom chips alone, which overlap heavily with TTH).

Concretely: `loc-unilateral` + `qual-pulsating` surfaces §1.1 as a near-miss (two C features). `loc-unilateral` + `sym-nausea-mild` surfaces it (one C feature + one D symptom). `sym-nausea-mild` alone does NOT. `sym-photophobia` + `sym-phonophobia` alone does NOT (no C-axis feature; this pairing is also the TTH-overlap zone). `loc-unilateral` alone does NOT.

This is encodable as a per-phenotype floor predicate; the architect's strengthened invariant (follow-up 4/6) should accept "§1.1 is suppressed below its minimum-evidence floor" as the §1.1 suppression path in lieu of a suppress-gate criterion. **Encode the floor decision explicitly** (a named predicate on the phenotype, e.g. a `minEvidence` function or an equivalent), so the strengthened dev-time invariant can check that §1.1 has a suppression path and does not silently regress to "any one chip."

Why not just add a synthetic suppress-gate criterion to §1.1? Because there is no ICHD-3 §1.1 criterion that functions as a substrate/chronicity gate — inventing one (e.g. forcing `mig-C` to gate) would either break §1.5 (which tolerates a `mig-C` miss) or fabricate a non-ICHD-3 requirement. The floor is the faithful mechanism: it is a display-suppression threshold, not a claimed ICHD-3 criterion, and it surfaces nothing the engine labels a diagnosis.

### Ruling for §1.2 migraine-with-aura: floor NOT needed — `aura-B` is a designated suppress gate.

§1.2 has `aura-B` (≥1 reversible aura symptom) classified as suppress-gate. Aura is the substrate; no aura symptom = phenotype hidden. The `hasPositiveEvidence` floor plus `aura-B` suppress is sufficient. A patient cannot surface §1.2 on an incidental non-aura chip because `aura-B` requires an actual aura-type chip AND `aura-fully-reversible`. No §1.2-specific minimum-evidence floor required beyond the existing `hasPositiveEvidence` gate.

### Ruling for §2.2 episodic TTH: floor NOT needed — `tth-D` exclusion + `hasPositiveEvidence` floor suffice, but with one caveat for clinical-reviewer.

§2.2 has `tth-D` as a suppress-gate (exclusion). But note: `tth-D` fires TRUE on empty/symptom-absent input (no nausea, no vomiting, ≤1 photo/phono is trivially satisfied when none are selected). So `tth-D` does NOT by itself prevent a thin TTH near-miss. The `hasPositiveEvidence` floor (≥1 positive contributing chip across `tth-A`/`tth-B`/`tth-C`/`tth-D` contributing chips) is what prevents trivial surfacing.

The §2.2 contributing-chip set is large (attack/freq/pattern/duration/all four character features). A single chip like `loc-bilateral` alone would clear the bare floor and surface "Probable episodic TTH." This is LESS dangerous than the §1.1 case — TTH is the lower-acuity, less-anchoring call, and "bilateral pressing headache" is genuinely the TTH-pointing direction — but for symmetry and to avoid a one-chip near-miss, **I recommend (do not mandate) a parallel minimum-evidence floor for §2.2**: surface only if **≥2 distinct TTH-pointing chips** are selected, of which at least one is a §2.2 C character feature (`{loc-bilateral, qual-pressing-tightening, sev-mild, sev-moderate, act-not-aggravated}`). I mark this as a **clinical-reviewer decision** rather than asserting it, because unlike §1.1 (high anchoring risk, no substrate gate) the §2.2 case is borderline and the reviewer may reasonably accept the bare `hasPositiveEvidence` floor for TTH. Either choice is clinically defensible; I lean to the parallel floor for consistency with §1.1.

**Net §1.1-floor ruling:** §1.1 needs a strengthened minimum-evidence floor (≥2 migraine-pointing chips incl. ≥1 C feature) — encoded explicitly so the invariant accepts it. §1.2 and §2.2 are covered by existing suppress gates + `hasPositiveEvidence`, with an optional parallel §2.2 floor recommended for symmetry (reviewer's call).

---

## 3. Per-gate emit-or-drop for SUPPRESS gates (architect follow-up 7)

**Question:** when a suppress gate fails, should the phenotype be silently dropped, or EMITTED as a "considered and excluded — [reason]" item the screen can gray out? Architect hypothesis: EMIT for suppressions driven by positive contradicting evidence; DROP for substrate-absence suppressions. Confirm or revise per gate.

I confirm the architect's hypothesis and apply it per gate. The clinical principle: **emit "considered and set aside" only when the patient has positive evidence that actively contradicts the phenotype** (so the clinician benefits from seeing the engine reasoned about it and ruled it out); **drop silently when the phenotype's substrate is simply absent** (nothing meaningful to show — the phenotype was never on the table).

| Suppress gate | Failure mode | Emit or drop | Reason |
|---|---|---|---|
| `tth-D` (§2.2 exclusion) | Patient HAS nausea/vomiting (positive contradicting evidence) | **EMIT** (`definitionallyExcluded: true`, reason names the contradicting feature) | "Episodic TTH considered and set aside — nausea/vomiting present (migraine-defining)" is clinically useful: it tells the clinician the engine saw TTH-shaped pain but excluded it because of a migraine-pointing symptom, steering toward migraine. |
| `ctth-D` (§2.3 exclusion) | Patient HAS moderate/severe nausea or vomiting | **EMIT** | Same as `tth-D`. Useful "set aside because [contradicting feature]." |
| `cm-C` (§1.3, no migraine-feature days/triptan response) | Patient has chronic headache but it is TTH-type, not migraine-type | **EMIT** | The patient genuinely has ≥15 days/mo chronic headache (positive evidence) but it does not meet the migraine-feature threshold. "Chronic migraine considered and set aside — chronic pattern present but <8 migraine-feature-days and no triptan response; see Chronic TTH" is useful and steers correctly. (Borderline — it is partly substrate-shaped. I rule EMIT because the chronicity substrate IS present; only the migraine-character is absent, which is contradicting-evidence-shaped.) |
| `aura-B` (§1.2 substrate) | No aura symptom at all | **DROP** | Substrate absence. If the patient ticked no aura chip, "Migraine with aura considered and set aside — no aura" is noise; aura was never on the table. Silent drop. |
| `cm-A` / `ctth-A` (chronicity threshold) | Frequency is 5–14 d/mo (sub-chronic) | **DROP** | The patient is episodic, a different frequency band — not "chronic considered and excluded." Episodic TTH/migraine will surface on the same chips and is the correct steer. Showing "Chronic X excluded — not enough days" for an episodic patient is noise. Silent drop. |
| `sunct-C` (§3.3 substrate) | No autonomic features | **DROP** | Substrate absence (autonomic accompaniment defines SUNCT/SUNA). Nothing to show. |
| `hc-A` (§3.4 substrate/laterality/chronicity) | Not unilateral, or not continuous, or <3 mo | **DROP** | Substrate absence. Already gated by `hiddenUntilTrial` upstream anyway. |
| `hc-D` / `ph-E` (indomethacin) | Already hidden by `hiddenUntilTrial` until `indo-tried-complete` | **DROP (via the gate)** | The phenotype is not emitted until the gate chip is present; there is no "considered and excluded — no indomethacin response" surface because the phenotype is hidden, not evaluated-and-excluded. See the §3.5.2/§3.5.4 edge-case note below. |
| `ndph-A` / `ndph-B` (§4.10 substrate) | Not continuous, or no remembered abrupt onset | **DROP** | Substrate absence. Non-continuous headache was never NDPH-shaped. |
| `vm-A` (vertigo substrate) | No vertigo | **DROP** | Substrate absence — the architect's named example. Nothing meaningful to show. |
| `vm-history` (NEW, A1.6.6 B) | No established migraine history | **DROP** | Substrate absence (no prior migraine = VM definitionally impossible). The clinician selecting vertigo + photophobia but no migraine-history should simply not see VM — emitting "VM excluded — no migraine history" is borderline-useful but, because migraine history is a hard substrate (not a contradicting symptom), I rule DROP for consistency with `vm-A`. Flagged for reviewer (see §6) — this is the one DROP where an EMIT could be argued, since "you have vertigo + migraine features but no migraine history, so this is not VM" is arguably instructive. |

**Emit set (3):** `tth-D`, `ctth-D`, `cm-C` — all positive-contradicting-evidence suppressions.
**Drop set (the rest):** `aura-B`, `cm-A`, `ctth-A`, `sunct-C`, `hc-A`, `hc-D`, `ph-E`, `ndph-A`, `ndph-B`, `vm-A`, `vm-history` — all substrate-absence (or gate-hidden) suppressions.

**Implication for `definitionallyExcluded`:** the field is meaningful only for the EMIT set (it is `true` on emitted-but-set-aside matches). For the DROP set the phenotype never appears, so `definitionallyExcluded` is moot. This resolves the architect's follow-up-7 ambiguity ("`definitionallyExcluded` only has meaning if such phenotypes appear in output"): it appears in output ONLY for `tth-D`/`ctth-D`/`cm-C`-failed phenotypes. Each `continue`/emit site should carry a comment stating its emit-or-drop choice and why (architect's checkable requirement).

### Critical edge-case flag — §3.5.2 / §3.5.4 "missing only indomethacin" (for clinical-reviewer)

ICHD-3 §3.5 says Probable PH is "all but one of criteria **A–E** for 3.2" and Probable HC is "all but one of A–D for 3.4" — and criterion E (PH) / D (HC) IS the indomethacin response. So **a patient who meets every PH/HC criterion EXCEPT the indomethacin response is, by the literal §3.5 framework, §3.5.2 Probable paroxysmal hemicrania / §3.5.4 Probable hemicrania continua.**

The current engine cannot surface this: the `hiddenUntilTrial` gate hides PH/HC entirely until `indo-tried-complete` is selected (L704). So a patient with the full PH/HC picture but who has NOT yet had an indomethacin trial sees nothing — which is the same silent-deletion failure mode this whole change exists to fix, applied to the indomethacin gate.

**My ruling, flagged for clinical-reviewer confirmation:** keep the `hiddenUntilTrial` hard-hide for Phase 1 — do NOT surface §3.5.2/§3.5.4-missing-indomethacin as a near-miss yet — for two reasons: (1) the indomethacin response is a deliberate therapeutic test, not a passively-observed feature; surfacing "Probable PH — try indomethacin" edges toward a treatment recommendation, which is out of scope for this logic-only change and belongs to the later management-copy step; (2) the chip vocabulary has `indo-not-tried`/`indo-tried-partial`/`indo-tried-no-response`, so the engine CAN distinguish "not tried yet" from "tried, failed" — but acting on that distinction (surface a near-miss only when `indo-not-tried`, suppress when `indo-tried-no-response`) is a richer behavior that should be its own governed step. **I recommend logging this as a follow-up clinical task** ("surface §3.5.2/§3.5.4 indomethacin-pending near-miss") rather than bundling it here. If the clinical-reviewer judges the silent-deletion-of-indomethacin-pending-PH/HC unacceptable even for Phase 1, the minimal faithful fix is: when `indo-not-tried` is selected (not absent, not failed) AND all other PH/HC criteria pass, emit a demoted near-miss naming `ph-E`/`hc-D` as the missing criterion. I lean to deferring; I flag it because it is a real instance of the exact failure mode being fixed.

---

## 4. The three bundled accuracy corrections — exact chip changes with ICHD-3 sourcing

### 4a. Aura laterality — new chip, rewire §1.2 C characteristic 4

**Defect (HIGH-2, confirmed):** `auraCharacteristicCount` (L391-398) computes the 6th §1.2 C characteristic via `has(s, 'loc-unilateral')` — the headache PAIN-laterality chip (L229). ICHD-3 §1.2 C item 4 is "at least one aura symptom is unilateral" — a property of the aura symptom, not the headache.

**Exact §1.2 C characteristic list being counted against (verbatim-confirmed, §0 item 3):**
1. ≥1 aura symptom spreads gradually over ≥5 min → `aura-spread-ge-5min`
2. ≥2 aura symptoms in succession → `aura-multi-symptoms-succession`
3. each aura symptom lasts 5–60 min → `aura-each-5-to-60min`
4. **at least one aura symptom is unilateral → NEW chip `aura-symptom-unilateral`** (was `loc-unilateral`)
5. ≥1 positive aura symptom → `aura-positive-symptoms`
6. aura accompanied/followed within 60 min by headache → `aura-headache-within-60min`

**Fix:**
- **New chip:** `id: 'aura-symptom-unilateral'`, `label: 'At least one aura symptom is one-sided'`, placed in the `aura` chip group (group id `'aura'`, L261-279). Optional `teachWhenSelected`: "§1.2 C characteristic 4 — laterality of the aura itself (e.g. a one-sided visual or sensory disturbance), distinct from headache-pain location."
- Satisfies §1.2 C **characteristic 4** specifically.
- **Rewire `auraCharacteristicCount`:** replace `+ (has(s, 'loc-unilateral') ? 1 : 0)` with `+ (has(s, 'aura-symptom-unilateral') ? 1 : 0)`. Stop borrowing `loc-unilateral`.
- **Corrected count:** still **≥3 of 6** (`aura-C` threshold unchanged — only the source chip for characteristic 4 changes). Update `aura-C`'s `contributingChips` to swap `loc-unilateral` → `aura-symptom-unilateral`. Update `aura-C`'s `description` (L439) to read the 6th characteristic as "one aura symptom unilateral" without implying pain laterality (this self-corrects the misleading `missingCriteria.description` the prior audit flagged).
- **Type union:** add `'aura-symptom-unilateral'` to the `ChipId` union (L53-56 aura block).

**Source:** ICHD-3 §1.2 C item 4 (`ichd3-2018`). No source beyond ICHD-3 needed.

### 4b. Aura ≥2 attacks — minimal vocabulary addition

**Defect (MED-1, confirmed):** `aura-A` (L437) accepts `attacks-lt-5` ("Fewer than 5 lifetime attacks," L200), which includes a 1-attack patient, to satisfy §1.2 A "at least two attacks." `mig-A` (L418) correctly excludes `attacks-lt-5`. The two migraine entries are inconsistent on the same vocabulary.

**Existing attack-count chip vocabulary (inspected, L25):** `attacks-lt-5` | `attacks-5-to-10` | `attacks-gt-10` | `attacks-ge-20`. There is NO `attacks-2-to-4` granularity. The jump is from `<5` (includes 1) straight to `5–10`. So the vocabulary cannot currently express "≥2 attacks" without admitting 1-attack patients.

**Minimal vocabulary change (recommended):** add ONE chip `attacks-ge-2`, rather than splitting `attacks-lt-5` into `attacks-1` + `attacks-2-to-4`. Rationale for the single-chip choice over the split:
- The split (`attacks-1` / `attacks-2-to-4`) touches `mig-A`, `aura-A`, `cluster-A`, `ph-A`, `sunct-A` contributing-chip lists and the existing `attacks-lt-5` regression tests — larger blast radius.
- A single additive `attacks-ge-2` chip leaves all existing chips and their consumers untouched and adds exactly the gate §1.2 A needs.

**Exact change:**
- **New chip:** `id: 'attacks-ge-2'`, `label: 'At least 2 lifetime attacks'`, placed in the `pattern` group (id `'pattern'`, L195-223) adjacent to the other `attacks-*` chips. `teachWhenSelected`: "§1.2 A Migraine with aura requires ≥2 attacks (fewer than for §1.1's ≥5)."
- **Rewire `aura-A`** (L437): evaluate `has(s, 'attacks-ge-2') || has(s, 'attacks-5-to-10') || has(s, 'attacks-gt-10')` — i.e. **drop `attacks-lt-5`** from the disjunction and add `attacks-ge-2`. Update `contributingChips` to `['attacks-ge-2', 'attacks-5-to-10', 'attacks-gt-10']`.
- **Type union:** add `'attacks-ge-2'` to `ChipId` (L25 pattern block).
- **Picker note for the clinician:** because `attacks-ge-2` and `attacks-lt-5` can both be conceptually true for a 2–4-attack patient, the `attacks-ge-2` teach text should make clear it asserts the §1.2 A "≥2" gate specifically. (The picker may select both `attacks-lt-5` and `attacks-ge-2` for a 3-attack patient; that is fine — `aura-A` keys off `attacks-ge-2`, `mig-A` keys off the ≥5 chips, and a 3-attack patient correctly fails `mig-A` while passing `aura-A`.)

**Source:** ICHD-3 §1.2 A "At least two attacks fulfilling criteria B and C" (`ichd3-2018`). No source beyond ICHD-3 needed.

### 4c. Vestibular-migraine migraine-history gate — new chip, SUPPRESS gate

**Defect (MED-2, confirmed):** VM (L563-577) omits A1.6.6 criterion B entirely. The labeled `vm-B` (L575) is actually criterion C (associated migrainous features). No chip expresses an established prior migraine diagnosis.

**Confirmation the task asked for:** I confirm A1.6.6 criterion B carries the migraine-history requirement **directly** — verbatim "A current or past history of 1.1 Migraine without aura or 1.2 Migraine with aura" (§0 item 4, confirmed from ichd-3.org appendix + mirror). This does NOT come from Bárány/Lempert 2012; it is in ICHD-3 A1.6.6 itself. I do NOT flag a discrepancy and I do NOT expand into Bárány vestibular-symptom detail (out of scope, unchanged).

**Exact change:**
- **New chip:** `id: 'migraine-history-established'`, `label: 'Established current or past history of migraine (with or without aura)'`, placed in the `vestibular` group (id `'vestibular'`, L280-289) — or, since it is also reusable for §1.3 `cm-B` and future §1.4.1, a neutral placement in `vestibular` is fine for Phase 1. `teachWhenSelected`: "ICHD-3 A1.6.6 criterion B — vestibular migraine requires an established 1.1/1.2 migraine diagnosis; distinguishes it from BPPV, Menière, vestibular paroxysmia."
- **New criterion `vm-history`** on the VM phenotype: `label: 'Current or past history of 1.1 or 1.2 migraine'`, `description: 'ICHD-3 A1.6.6 B — a current or past history of 1.1 Migraine without aura or 1.2 Migraine with aura.'`, `evaluate: s => has(s, 'migraine-history-established')`, `contributingChips: ['migraine-history-established']`, **role: `suppress-gate`**.
- **Confirm SUPPRESS:** yes — its absence must HIDE VM (the clinical gate's explicit guardrail: VM over-surfaces under demote unless migraine history is a hard gate). DROP on failure (substrate-absence; see §3 table), with the one reviewer-flagged caveat that an EMIT could be argued.
- **Relabel existing `vm-B`** to reflect it is criterion C: `label: 'Migrainous features during ≥50% of vertigo episodes (A1.6.6 C)'`, `description` updated to A1.6.6 C wording. (Label/description only — `evaluate` and `contributingChips` unchanged; this is the copy-adjacent half of MED-2 that needs no new source and should land now.)
- **Type union:** add `'migraine-history-established'` to `ChipId`.
- **Out of scope (unchanged, remains `blocked:source-not-resolved`):** the full 5-criterion Bárány expansion (`vest-attacks-ge-5`, `vest-dur-5min-to-72h`, `vest-mod-severe`, `vest-features-ge-50pct`) pending Lempert 2012 (J Vestib Res 2012;22:167-172; PMID 23142830). This spec adds only criterion B, which is sourced from ICHD-3 directly.

**Source:** ICHD-3 A1.6.6 criterion B (`ichd3-2018`). No Bárány source needed for the history gate.

### New-chip summary (3 chips, all traced to ICHD-3 `ichd3-2018`)

| New chip | Group | Satisfies | Used by |
|---|---|---|---|
| `aura-symptom-unilateral` | `aura` | §1.2 C characteristic 4 | `aura-C` (via `auraCharacteristicCount`) |
| `attacks-ge-2` | `pattern` | §1.2 A "≥2 attacks" | `aura-A` |
| `migraine-history-established` | `vestibular` | A1.6.6 criterion B | new `vm-history` criterion |

All three are new `ChipId`s — each must be covered by the data-integrity test (every `contributingChip` resolves to a real chip; every chip referenced by ≥1 criterion) and the Stage One question-config drift-guard, per architect follow-up 6.

---

## 5. Show-vs-hide expectation table (the test contract)

For each phenotype, concrete chip sets that must now SURFACE as a demoted near-miss vs must stay HIDDEN. The regression tests are written against this; it is clinically confirmed below. Aligns with the architect's two-describe-block bifurcation (SUPPRESS gates stay-absent; DEMOTE gates now-present). Line references are to current `clinicHeadacheData.test.ts`.

### Must now SURFACE (demote — `matchStrength` `'probable'`, `definitionallyExcluded: false`, failed criterion in `missingCriteria`)

| # | Phenotype | Chip set | Failed criterion | Expected surface |
|---|---|---|---|---|
| S1 | §1.1 migraine missing only duration | `attacks-gt-10, loc-unilateral, qual-pulsating, sev-severe, act-aggravated, sym-nausea-mild` | `mig-B` (demote) | **Probable migraine · §1.5** — "confirm attacks last 4–72 h". (Was test:648-655 asserting ABSENT → now asserts present-as-probable.) |
| S2 | §1.1 migraine missing only associated symptoms | `attacks-gt-10, dur-4-to-72-hours, loc-unilateral, qual-pulsating, sev-severe` | `mig-D` (demote) | **Probable migraine · §1.5** — "confirm nausea/vomiting or photophobia+phonophobia". (Was test:657-664 ABSENT → present.) Note: passes §1.1 floor (≥2 C features: location+pulsating+severe). |
| S3 | §2.2 episodic TTH missing only duration | `attacks-gt-10, freq-1-4-per-month, pattern-ge-3-months, loc-bilateral, qual-pressing-tightening, sev-mild, act-not-aggravated` | `tth-B` (demote) | **Probable TTH · §2.4** — "confirm attack duration 30 min–7 d". (Was test:700-707 ABSENT → present.) |
| S4 | §3.1 cluster between bouts, attack-length unconfirmed | `attacks-gt-10, loc-unilateral, loc-orbital-temporal, sev-severe, sym-autonomic-ipsilateral, freq-cluster-bout` (no `dur-15-to-180-min`) | `cluster-B` (demote) | **Probable cluster · §3.5** — "confirm attack length 15–180 min". The stated clinic use case. (Was test:726-733 ABSENT → present.) |
| S5 | §1.2 migraine-with-aura missing only `aura-C` 3rd characteristic | `attacks-ge-2, aura-visual, aura-fully-reversible, aura-spread-ge-5min, aura-each-5-to-60min` (only 2 of 6 C characteristics) | `aura-C` (scorable — but with only 2 met it caps strength; if all else passes and aura-C is the sole miss → probable) | **Probable migraine with aura · §1.5**. Exercises the corrected `attacks-ge-2` and confirms aura surfaces. |
| S6 | §3.4 HC with indomethacin response, autonomic unconfirmed | `indo-tried-complete, loc-unilateral, dur-continuous, pattern-ge-3-months, sev-moderate` (no autonomic/restlessness) | `hc-C` (demote) | **Probable hemicrania continua · §3.5** — "confirm ipsilateral autonomic features or movement aggravation". (Gate `indo-tried-complete` present, so HC is emitted; `hc-C` now demotes instead of dropping.) |

### Must stay HIDDEN (suppress — phenotype absent OR emitted with `definitionallyExcluded: true`)

| # | Phenotype | Chip set | Suppress gate | Drop or emit |
|---|---|---|---|---|
| H1 | §2.2 episodic TTH, nausea present | `attacks-gt-10, freq-1-4-per-month, pattern-ge-3-months, dur-30min-to-7days, loc-bilateral, qual-pressing-tightening, sev-mild, act-not-aggravated, sym-vomiting` | `tth-D` (exclusion) | **EMIT** `definitionallyExcluded:true` "considered and set aside — vomiting present". Must NOT appear as an active match. (test:709-716 asserts not an active TTH match — refine to assert it is either absent OR emitted-excluded, NOT a `'full'`/`'probable'`/`'partial'` active match.) |
| H2 | §2.3 chronic TTH, vomiting present | `freq-ge-15-per-month, pattern-ge-3-months, dur-30min-to-7days, loc-bilateral, qual-pressing-tightening, sev-mild, act-not-aggravated, sym-vomiting` | `ctth-D` (exclusion) | **EMIT** excluded "vomiting present". Not an active match. |
| H3 | Chronic migraine, sub-chronic frequency | `freq-5-14-per-month, pattern-ge-3-months, attacks-gt-10, migraine-features-ge-8-per-month` | `cm-A` (chronicity) | **DROP** — absent (5–14 d/mo is episodic, not "probable chronic"). (test:674-680 stays asserting ABSENT — correct under suppress.) |
| H4 | Chronic TTH, sub-chronic frequency | `freq-5-14-per-month, pattern-ge-3-months, dur-30min-to-7days, loc-bilateral, qual-pressing-tightening, sev-mild, act-not-aggravated` | `ctth-A` (chronicity) | **DROP** — absent. (test:718-724 stays ABSENT — correct.) |
| H5 | VM, no vertigo | `sym-phonophobia, sym-photophobia, aura-visual` | `vm-A` (substrate) | **DROP** — absent. Closes V-reported false-positive. (test:636-639 stays ABSENT — correct.) |
| H6 | **VM, no migraine history (NEW gate)** | `vest-vertigo-migrainous, sym-phonophobia` (vertigo + feature present, but NO `migraine-history-established`) | `vm-history` (substrate) | **DROP** — absent. **This INVERTS current behavior:** test:641-644 today asserts VM SURFACES on `vest-vertigo-migrainous + sym-phonophobia`. Under the new gate it must NOT surface without migraine history. The test must be updated to add `migraine-history-established` to make VM surface, and a new test added asserting absence WITHOUT it. |
| H7 | §1.2 aura, no aura symptom | `attacks-ge-2, aura-spread-ge-5min, aura-each-5-to-60min, aura-positive-symptoms` (no aura-type chip, no `aura-fully-reversible`) | `aura-B` (substrate) | **DROP** — absent. (test:666-672 stays ABSENT — correct under suppress.) |
| H8 | §4.10 NDPH, not continuous | `onset-new-within-3-months, dur-30min-to-7days, pattern-ge-3-months` | `ndph-A` (substrate) | **DROP** — absent. (test:782-788 stays ABSENT — correct.) |
| H9 | §1.1 below evidence floor | `sym-nausea-mild` alone (one incidental D symptom, no C feature) | §1.1 minimum-evidence floor (decision 2) | **DROP** — absent. New test: a single incidental migraine-pointing chip must NOT surface "Probable migraine". |
| H10 | §3.3 SUNCT/SUNA, no autonomic | `attacks-ge-20, loc-unilateral, sev-severe, dur-1-to-600-sec, freq-ge-1-per-day` | `sunct-C` (substrate) | **DROP** — absent. (test:754-761 stays ABSENT — correct under suppress.) |
| H11 | §3.2 PH, indomethacin not tried | full PH picture but `indo-not-tried` (or no indo chip) | `hiddenUntilTrial` gate | **DROP** — absent (Phase 1; see §3 edge-case flag). (test:744-752 logic re indo gate holds.) |

### Critical test-contract callouts for the regression author

1. **The demote tests (S1–S6) invert from ABSENT→PRESENT.** Each must now assert `matchStrength === 'probable'`, `definitionallyExcluded === false`, and the failed criterion id in `missingCriteria`. Put them in the architect's `DEMOTE gates` describe block. Each inverted assertion carries a comment naming why it flipped.
2. **The suppress tests that STAY absent (H3, H4, H5, H7, H8, H10) keep their current assertions** — but move into the `SUPPRESS gates` describe block with a comment clarifying the absence is CORRECT (substrate/chronicity), not a demote bug. This is the architect's central anti-pattern guard: do not let a reviewer see "tests changed" and wave through a suppress-correct absence as if it were a demote regression.
3. **H1, H2 change shape:** from "not present" to "not an ACTIVE match (may be emitted as `definitionallyExcluded:true`)." Assert the phenotype, if present, has `definitionallyExcluded === true` and is not `'full'`/`'probable'`/`'partial'`-active.
4. **H6 is a genuine behavior inversion requiring a test rewrite:** the existing "VM surfaces on vertigo + phonophobia" test (test:641-644) becomes false under the new `vm-history` gate. Update it to include `migraine-history-established`, and add a new test asserting VM is ABSENT without it. This is the single most important new-gate regression — flag it prominently so it is not missed.
5. **The strengthened dev-time invariant** (architect follow-up 4): replace test:605-610 "every phenotype has ≥1 `definitional` criterion" with "every phenotype has ≥1 `role === 'suppress-gate'` criterion OR a `hiddenUntilTrial` gate OR (for §1.1) a registered minimum-evidence floor." Spot-check: §1.1 passes via the floor; §1.2 via `aura-B`; §1.3 via `cm-A`/`cm-C`; §2.2 via `tth-D`; §2.3 via `ctth-A`/`ctth-D`; §3.1 — see callout 6; §3.2/§3.4 via `ph-E`/`hc-D`+gate; §3.3 via `sunct-C`; §4.10 via `ndph-A`/`ndph-B`; VM via `vm-A`/`vm-history`.
6. **§3.1 cluster suppress-path check:** under my classification, cluster's criteria are `cluster-A` (scorable), `cluster-B` (demote), `cluster-C` (demote), `cluster-D` (scorable) — **zero suppress-gates and no `hiddenUntilTrial`.** This is the SAME no-suppress-gate gap the architect flagged for §1.1, now also true for §3.1. **I flag this for clinical-reviewer (see §6) and rule:** §3.1 needs a minimum-evidence floor of the same shape as §1.1 — surface only if ≥2 cluster-pointing chips incl. at least the unilateral-orbital location OR severe+short-duration pair. Cluster has no chronicity/substrate criterion to serve as a suppress gate (its substrate-like criterion, `cluster-B`, must demote for the between-bouts use case). The floor is the faithful suppression mechanism. This was NOT in the architect's follow-up 5 (which named only §1.1) — it is a consequence of my ruling that `cluster-C` demotes, and I surface it explicitly.

---

## 6. Items flagged for clinical-reviewer attention / evidence I could not fully verify

1. **§3.1 cluster has no suppress-gate under my classification** (callout 6) — parallel to the §1.1 gap. My ruling: add a §3.1 minimum-evidence floor. This extends architect follow-up 5 beyond §1.1. **Reviewer must confirm** the floor approach for §3.1 (and whether `cluster-C` should instead be suppress — I argue no, because its failure is not positive evidence for another phenotype and the between-bouts patient legitimately has not reported autonomic features yet, exactly the demote case).

2. **§2.2 optional parallel minimum-evidence floor** (decision 2) — I recommend but do not mandate it. Reviewer's call whether the bare `hasPositiveEvidence` floor is acceptable for TTH or whether the §1.1-style floor should apply for symmetry.

3. **§3.5.2/§3.5.4 "missing only indomethacin" silent deletion** (§3 edge-case flag) — the literal §3.5 framework makes a PH/HC patient missing only the indomethacin response a Probable TAC, but the `hiddenUntilTrial` gate hides them. My ruling: defer to a separate governed task (surfacing it edges toward a treatment recommendation, out of scope for logic-only). **Reviewer must confirm** the deferral is acceptable, or direct the minimal `indo-not-tried`-triggered near-miss.

4. **`vm-history` emit-vs-drop** (§3 table) — I ruled DROP for consistency with `vm-A`, but noted an EMIT could be argued ("vertigo + migraine features but no migraine history → not VM" is instructive). Reviewer may prefer EMIT. Low-stakes either way (VM is appendix-flagged).

5. **`cm-C` as suppress-with-EMIT** (§1, §3) — borderline classification: `cm-C`'s failure is partly substrate-shaped (chronicity present) and partly contradicting-evidence-shaped (not migraine-character). I ruled suppress+EMIT. Reviewer should sanity-check that "Chronic migraine considered and set aside — chronic pattern present but not migraine-type; see Chronic TTH" is the right steer and not over-clever. The safe fallback is suppress+DROP (silent), which loses the steer but is simpler.

6. **Evidence fully verified — nothing blocked.** All ICHD-3 criteria relied on are verbatim-confirmed from `ichd3-2018` (re-fetched the four load-bearing quotes for this spec; the rest inherited from the prior re-audit's IHS pocket PDF retrieval and spot-checked). The three new chips trace to §1.2 A, §1.2 C item 4, and A1.6.6 B respectively — all within ICHD-3, no external source required. The only `blocked:source-not-resolved` item is the full Bárány VM 5-criterion expansion (Lempert 2012, PMID 23142830) — UNCHANGED and explicitly out of scope for this change; this spec adds only A1.6.6 criterion B, which ICHD-3 carries directly.

7. **Output-language and safety invariants preserved** (restated for the reviewer's checklist): the engine still never declares a "diagnosis" (L17-18); near-miss surfaces show "needs confirmation of [criterion]" via existing `description` text, never a calibrated %; no band words / disclaimer prose authored here; the SNNOOP10 red-flag short-circuit and the dev-time "every phenotype retains a suppression path" invariant are preserved and strengthened. The strengthened invariant (callout 5) is the mechanical guarantee that no phenotype becomes pure-scorable+demote with no way to be hidden.

---

## Routing

Authoring spec only. No engine, source, or test file changed. Ready for `clinical-reviewer` pre-execution gate in fresh context (Class E requirement, CLAUDE.md §6 / §18 / §20). The reviewer produces `docs/reviews/clinical-headache-engine-rank-and-flag.md` with decision `approve`/`approve-with-conditions`/`block` before any code is written. The six flagged items in §6 are the decisions routed to that gate.
