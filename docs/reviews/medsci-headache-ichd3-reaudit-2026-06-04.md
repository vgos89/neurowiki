# ICHD-3 Re-audit — Clinic Headache Pathway engine (verbatim line-by-line)

**Type:** Report-only audit. NOT a PR review. No engine, source, or test file changed. The only file written is this artifact.
**Reviewer:** medical-scientist (model: opus)
**Date:** 2026-06-04
**File audited:** `src/data/clinicHeadacheData.ts` — 829 lines, pure React-free TypeScript module (11 encoded phenotypes; `probable-migraine`/`probable-tth`/`probable-tac` exist in the `PhenotypeId` union but are NOT instantiated phenotypes — probable is a computed `matchStrength`, confirmed at L94–108 vs L402–646).
**Source of truth:** ICHD-3 (Cephalalgia 2018;38(1):1–211; PMID 29368949; DOI 10.1177/0333102417738202).

**ICHD-3 pages actually retrieved for this audit (verbatim, not from memory):**
- IHS official **ICHD-3 Pocket Version PDF** (ihs-headache.org/wp-content/uploads/2020/05/ICHD-3-Pocket-version.pdf) — read directly as PDF, pages 11–16. This is the authoritative source for the verbatim text of **1.1, 1.2, 1.3, 2.1/2.2/2.3, 3.1, 3.4, 4.10** quoted below. The pocket version omits 3.2 PH, 3.3 SUNCT/SUNA, and the Appendix, so those three were sourced separately.
- WebFetch of Neurotorium ICHD-3 slide deck — confirmed 1.1 and 1.2 verbatim (corroborates the pocket PDF).
- WebSearch verbatim snippets from ichd-3.org for **3.2 Paroxysmal hemicrania** (full A–F) and **3.3 SUNCT/SUNA** (B/C/D).
- WebFetch migrainedisorders.org — confirmed **3.3 SUNCT/SUNA criterion A** ("At least 20 attacks fulfilling criteria B–D").
- WebFetch PMC9491429 + migrainedisorders.org — confirmed **A1.6.6 Vestibular migraine** criterion B ("Current or past history of migraine with or without aura") and criterion C (50% + three migrainous-feature options).

**Could NOT fetch directly:** every direct WebFetch of an `ichd-3.org` HTML phenotype page truncated the content before the criteria box (the site's navigation chrome exceeds the fetch window). I worked around this with the IHS pocket PDF (authoritative, same committee, same text) plus corroborating mirrors, and I state per-phenotype which source carried each quote. No criterion below is quoted from memory.

---

## Verdict

**The brain is correctly mapped at the structural level and is substantially faithful at the criterion level — but it is NOT fit for the stated lookup goal in its current drop-gated form, and it carries two genuine semantic-mismap defects that can produce false-positive criterion counts.** The 2026-05-25 and 2026-05-27 fixes (add §1.3, add §3.2/§3.3, move NDPH to §4.10, move VM to §A1.6.6, split nausea for §2.3 D, drop `onset-single-sudden` from NDPH) all **landed faithfully** in the current code — I verified each against verbatim ICHD-3 and confirm they are correct. However: (1) the **definitional drop-gate is over-applied** — it deletes near-miss phenotypes that ICHD-3's own §X.5 "all-but-one" Probable framework is designed to surface, which directly defeats "let the clinician see which criteria the patient relates to"; the worst offenders are `mig-B`/`mig-D` (a migraine patient missing only duration or only the associated-symptom criterion vanishes with no trace, even though ICHD-3 §1.5 explicitly covers exactly that patient), plus the between-bouts cluster case the 2026-06-03 audit already flagged. (2) Two **chip-granularity false-positives** survive: `loc-unilateral` (pain laterality) is reused as the §1.2 C "aura symptom is unilateral" characteristic, and `attacks-lt-5` (which includes a 1-attack patient) satisfies the §1.2 A "≥2 attacks" gate. Neither is patient-harmful in isolation (aura over-count needs 3 of 6; the engine never declares a diagnosis), but both inflate the criterion count the clinician reads. I **agree with the 2026-06-03 "rank-and-flag / demote, don't delete" recommendation** and extend it: the fix must also cover `mig-B`/`mig-D`/`tth-B`, not just the TAC between-bouts criteria.

---

## Per-phenotype fidelity table

| # | Phenotype | ICHD-3 § | Faithful? | Specific issue (if any) |
|---|---|---|---|---|
| 1 | Migraine without aura | §1.1 | **yes-with-caveat** | Criteria A–D encoded correctly; "moderate or severe" = 1 feature is correct. Caveat: `mig-B` + `mig-D` flagged definitional → drop-gate deletes the §1.5-Probable near-miss the code elsewhere tries to preserve. |
| 2 | Migraine with aura | §1.2 | **no** | Two defects: (a) C-characteristic #4 "aura symptom unilateral" is wired to `loc-unilateral` = *pain* laterality (semantic mismap, can over-count C); (b) `aura-A` accepts `attacks-lt-5` (includes 1 attack) for a "≥2 attacks" gate (granularity false-positive). |
| 3 | Chronic migraine | §1.3 | **yes** | A/B/C encoded verbatim-faithful incl. the C.3 triptan/ergot disjunction. §2.3 Note 1 suppression correctly wired. No probable counterpart correctly omitted. |
| 4 | Frequent episodic TTH | §2.2 | **yes-with-caveat** | A/B/C/D faithful. Caveat: `tth-A` requires `attacks-gt-10` AND a freq chip AND ≥3-month pattern as conjunction — correct, but `tth-B` definitional drops a near-miss missing only duration. |
| 5 | Chronic TTH | §2.3 | **yes** | Criterion D fix (the ≤1-of-{mild-nausea,photo,phono} pool) landed verbatim-correct. This was the prior-audit's headline defect; it is now faithful. |
| 6 | Cluster headache | §3.1 | **yes-with-caveat** | A/B/C faithful; `cluster-D` correctly NOT definitional (between-bouts rationale holds). Caveat: `cluster-B` definitional → between-bouts patient who can't confirm 15–180 min is dropped (2026-06-03 finding, confirmed). |
| 7 | Paroxysmal hemicrania | §3.2 | **yes** | A–E faithful; indomethacin gate + `ph-D` non-definitional rationale both correct. |
| 8 | SUNCT/SUNA | §3.3 | **yes-with-caveat** | A–D faithful at the §3.3 parent level. Caveat: cannot distinguish SUNCT (needs conjunctival injection AND lacrimation) from SUNA — acceptable as parent, but the teach text over-promises subtype detail the engine can't compute. |
| 9 | Hemicrania continua | §3.4 | **yes** | A–D faithful; `dur-continuous` in hc-A is tighter than verbatim but defensible. `hc-C` omits "aggravation by movement" alternative — minor under-spec, safe. |
| 10 | NDPH | §4.10 | **yes** | Section correctly moved from the old §3.3 mislabel to §4.10. `onset-single-sudden` correctly removed from ndph-B disjunction. "Within 24 h" honestly flagged as non-chip-enforceable. |
| 11 | Vestibular migraine | §A1.6.6 | **yes-with-caveat** | Section number correct. Caveat: only 2 of 5 Bárány criteria encoded; **criterion B (migraine history) is entirely absent** and `vm-B`'s label/description don't match what ICHD-3 calls criterion B. `isAppendix` flag mitigates. |

---

## Findings, ranked by clinical severity

### PATIENT-SAFETY / HIGH

**None reach "patient-safety" in the strict sense** — the engine never declares a diagnosis (output-language rule, L17–18), every match is framed as criterion fulfilment, the clinician owns the diagnosis, and the appendix entity is flagged. The findings below are ranked HIGH because they either (a) defeat the product's stated purpose or (b) inflate a number the clinician reads and could anchor on.

---

#### HIGH-1 — The definitional drop-gate deletes the exact near-misses ICHD-3 §X.5 exists to surface (defeats the lookup goal)

- **ICHD-3 §1.5 Probable migraine (pocket PDF p. 26 region; Cephalalgia 2018 p. 26), verbatim intent:** "Attacks fulfilling **all but one** of criteria A–D for 1.1 Migraine without aura … and not fulfilling criteria for another headache disorder." (≤25-word quote of the operative clause: *"all but one of criteria A–D for 1.1 Migraine without aura"*.)
- **Engine encoding:** `mig-B` (duration 4–72 h) is `definitional: true` (L419); `mig-D` (associated symptoms) is `definitional: true` (L421). The drop-gate at **L736–743** fires `continue` if ANY definitional criterion fails, removing the phenotype before met/missing is ever computed (L745–760).
- **Why it's wrong:** the code went out of its way to keep `mig-A` **non**-definitional precisely so the §1.5 Probable path stays open (explicit comment L415–417). But `mig-B` and `mig-D` being definitional **re-closes that path** for the two most common near-misses. A patient with ≥5 attacks + unilateral + pulsating + nausea who simply did not tick the "4–72 h" duration chip fails `mig-B` → migraine without aura is **dropped entirely**, surfacing as neither full, probable, nor partial. That patient is the textbook ICHD-3 §1.5 Probable migraine. The internal rationale is self-contradictory: §1.5 covers "all but one of A–D," so NO single A–D criterion can be a hard drop-gate without breaking §1.5.
- **Concrete vanishing scenario:** Clinic patient, chips ticked: `attacks-gt-10`, `loc-unilateral`, `qual-pulsating`, `sev-severe`, `act-aggravated`, `sym-nausea-mild`. Duration not asked yet. Result: **migraine without aura does not appear at all** (mig-B definitional fails). The clinician sees no migraine row to "hone in" on — the opposite of the product goal.
- **Resolution:** demote, don't delete (the 2026-06-03 "rank-and-flag" recommendation, which I endorse and extend). For phenotypes whose §X.5 Probable counterpart exists (migraine, TTH, all four TACs), a **single** failed definitional criterion should yield `matchStrength: 'probable'` with the failed criterion shown in `missingCriteria`, not a drop. Reserve hard-drop for criteria with no §X.5 path or for true gates (the indomethacin `hiddenUntilTrial` chip, and the absence/exclusion criteria). Offending definitional flags to revisit: `mig-B`, `mig-D`, `tth-B`, `ctth-B`, `cluster-B`, `ph-B`, `sunct-B`. (Keep `vm-A` definitional — VM has no §X.5 and the V-reported phonophobia-only false-positive must stay closed.)

---

#### HIGH-2 — Candidate finding #1 CONFIRMED: §1.2 C characteristic 4 is wired to pain laterality, not aura-symptom laterality

- **ICHD-3 §1.2 C (IHS pocket PDF p. 11, verbatim):** criterion C is "At least three of the following six characteristics," item **4. "at least one aura symptom is unilateral."** (Corroborated verbatim by Neurotorium slide deck and ichd-3.org search snippet.)
- **Engine encoding:** `auraCharacteristicCount` (L391–398) computes 5 aura-specific characteristics from `aura-*` chips, then adds `(has(s, 'loc-unilateral') ? 1 : 0)` for the 6th. `loc-unilateral` is the **headache pain-location** chip ("Unilateral location," L229), defined and used everywhere else as pain laterality (it is a `mig-C` character feature at L370/375 and the `cluster-B`/`hc-A` location gate).
- **Why it's wrong:** ICHD-3 C#4 asks whether the **aura symptom** (e.g., the scintillating scotoma, the marching paraesthesia) is unilateral — a property of the neurological aura, not of the headache that follows. A patient with bilateral visual aura but unilateral headache pain would have C#4 **falsely counted as met**; a patient with unilateral aura but bilateral/holocranial pain would have it **falsely counted as not met**. Because C needs 3 of 6, a single mis-attributed characteristic can flip the `aura-C` threshold.
- **Severity:** moderate-leaning-high. It can over- or under-count `aura-C`, but `aura-C` is not flagged definitional, the engine never declares a diagnosis, and migraine-with-aura is rarely the actionable bedside call. Still, it is a true semantic mismap that surfaces a wrong criterion-met claim in the audit trail ("Criterion C ✓ — unilateral location").
- **Resolution:** add a dedicated chip `aura-symptom-unilateral` ("At least one aura symptom is one-sided") to the aura group and wire characteristic #4 to it; stop borrowing `loc-unilateral`. Until then, the teach/criterion text should not claim pain laterality satisfies an aura characteristic.

---

### MEDIUM

#### MED-1 — Candidate finding #2 CONFIRMED: `aura-A` lets a 1-attack patient satisfy "≥2 attacks"

- **ICHD-3 §1.2 A (IHS pocket PDF p. 11, verbatim):** "At least two attacks fulfilling criteria B and C."
- **Engine encoding:** `aura-A` (L437) evaluates true if `attacks-lt-5` OR `attacks-5-to-10` OR `attacks-gt-10`. `attacks-lt-5` is labeled "Fewer than 5 lifetime attacks so far" (L200) and explicitly includes a single attack (its teach text references "<5" and the §1.5 path).
- **Why it's a (minor) false-positive:** a patient with exactly 1 lifetime aura attack who selects `attacks-lt-5` will satisfy `aura-A` ("≥2 attacks"), which is false. Contrast with migraine-without-aura, where `mig-A` correctly requires `attacks-5-to-10`/`attacks-gt-10` and excludes `attacks-lt-5` (L418) — so the two migraine entries are **inconsistent** with each other on the same chip vocabulary.
- **Severity:** medium-low. The aura chips are behind a collapsed group; a true single-attack-aura presentation is uncommon at a classification step; and the engine never declares diagnosis. But it is a real granularity gap: the chip vocabulary cannot express "exactly 2–4 attacks," so `aura-A` was widened to `attacks-lt-5` to avoid dropping legitimate 2–4-attack aura patients — at the cost of also admitting 1-attack patients.
- **Resolution:** either split `attacks-lt-5` into `attacks-1` vs `attacks-2-to-4`, or add an `attacks-ge-2` chip for the aura gate. If neither, the `aura-A` `missingCriteria.description` should state the chip cannot distinguish 1 from 2–4 and the clinician must confirm ≥2 attacks from history (the same honesty pattern used for NDPH "within 24 h").

---

#### MED-2 — Candidate finding #5 PARTIAL: vestibular-migraine stub omits criterion B (migraine history) and `vm-B` is mislabeled

- **ICHD-3 / Bárány A1.6.6 (confirmed via PMC9491429 + migrainedisorders.org), verbatim criteria:** A — "At least 5 episodes with vestibular symptoms of moderate or severe intensity, lasting 5 minutes to 72 hours"; **B — "Current or past history of migraine with or without aura"**; C — "At least 50% of episodes are associated with at least one of [headache with ≥2 of 4 features / photophobia and phonophobia / visual aura]"; D — not better accounted for by another diagnosis.
- **Engine encoding:** only 2 criteria. `vm-A` (L574) = `vest-vertigo-migrainous` (definitional); `vm-B` (L575) = `sym-photophobia || sym-phonophobia || aura-visual`. The engine's `vm-B` is actually **criterion C** (migrainous features during episodes), mislabeled "B." The **true criterion B (a current/past migraine diagnosis)** is **not represented by any chip** — the engine cannot ask "does this patient have a migraine history?", which is the single most discriminating VM gate (VM by definition requires established migraine).
- **Why it matters for the lookup goal:** a non-migraineur with vertigo + photophobia would surface as a 100% VM "match" (2/2 criteria met) despite failing the absent criterion B. The `isAppendix: true` flag and the "research criteria" framing (L283, L568) mitigate misuse, and the V-reported phonophobia-only-no-vertigo false-positive is correctly closed by making `vm-A` definitional. But the stub can still over-surface VM in a non-migraineur.
- **Severity:** medium. Mitigated by appendix flagging; the prior 2026-05-25 audit already deferred the full 5-criterion expansion pending Lempert 2012 retrieval and that deferral is reasonable. The mislabel ("B" vs "C") is a real fidelity error in the surfaced text.
- **Resolution:** (a) relabel the existing `vm-B` to reflect ICHD-3 criterion C wording, or expand to the full 5-criterion set; (b) add a `migraine-history-established` chip wired to criterion B; (c) until expanded, the VM card should state explicitly "requires an established migraine diagnosis (ICHD-3 A1.6.6 criterion B) — confirm separately." This is the same source-retrieval blocker the prior audit logged; keep it deferred but fix the **label** now since that needs no new source.

---

#### MED-3 — Candidate finding #6 CONFIRMED (acceptable): SUNCT/SUNA parent-level cannot distinguish the subtypes, and the teach text over-promises

- **ICHD-3 §3.3 (criterion A confirmed via migrainedisorders.org: "At least 20 attacks fulfilling criteria B–D"; B/C/D confirmed via ichd-3.org search):** parent §3.3 requires ≥1 cranial autonomic symptom (criterion C). Subtypes: **SUNCT (3.3.1)** requires **both** conjunctival injection AND lacrimation; **SUNA (3.3.2)** has only one or neither.
- **Engine encoding:** single `sunct-suna` phenotype; `sunct-C` (L642) = `sym-autonomic-ipsilateral` (one composite autonomic chip). There is no chip for "conjunctival injection AND lacrimation specifically," so the engine **cannot** compute SUNCT vs SUNA.
- **Why parent-level is acceptable:** ICHD-3 §3.3 is a valid diagnostic level on its own; many clinicians code the parent and refine the subtype later. Surfacing the §3.3 parent is faithful. **But** the `teachPearl` (L638) tells the clinician "SUNCT (3.3.1) requires both conjunctival injection and lacrimation; SUNA (3.3.2) requires one or neither" — promising a distinction the engine then cannot make from the single autonomic chip. That is a mild expectation mismatch, not a fidelity error in the criteria themselves.
- **Severity:** medium-low. Parent-level matching is correct; the teach text is the only issue.
- **Resolution:** either add `autonomic-conjunctival-injection` + `autonomic-lacrimation` granular chips to enable the subtype split, or trim the teach text to say the tool surfaces the §3.3 parent and the SUNCT/SUNA subtype is a clinician determination. No criterion-logic change needed.

---

### LOW

#### LOW-1 — Candidate finding #3 REFUTED (encoding is correct): §1.1 C #3 "moderate or severe" is one feature

- **ICHD-3 §1.1 C (IHS pocket PDF p. 11, verbatim):** "Headache has at least two of the following four characteristics: 1. unilateral location 2. pulsating quality **3. moderate or severe pain intensity** 4. aggravation by or causing avoidance of routine physical activity."
- **Engine encoding:** `migraineCharacterCount` (L373–380) counts `sev-moderate OR sev-severe` as a **single** increment (L377). `MIGRAINE_C_CHARACTER` lists both severity chips (L370) but the counter collapses them.
- **Verdict:** **correct.** ICHD-3 lists "moderate or severe pain intensity" as one of the four characteristics (item 3), not as two. Collapsing `sev-moderate`/`sev-severe` to one count is verbatim-faithful. The candidate concern is refuted. (Same pattern correctly applied to TTH `sev-mild OR sev-moderate` at L386 for §2.2/2.3 C item 3 "mild or moderate intensity.")

---

#### LOW-2 — Candidate finding #4 CONFIRMED FAITHFUL: §2.3 D nausea split landed verbatim

- **ICHD-3 §2.3 D (IHS pocket PDF p. 13, verbatim):** "Both of the following: 1. no more than one of photophobia, phonophobia or mild nausea; 2. neither moderate or severe nausea nor vomiting."
- **Engine encoding:** `ctth-D` (L482) = `!has('sym-nausea-moderate-severe') && !has('sym-vomiting') && countOf(['sym-nausea-mild','sym-photophobia','sym-phonophobia']) <= 1`.
- **Verdict:** **faithful, verbatim-correct.** The ≤1 pool correctly combines mild nausea + photophobia + phonophobia (clause 1); the moderate/severe-nausea and vomiting exclusions are clause 2. This was the 2026-05-25 audit's flagged defect (old version only checked `!vomiting`); the fix is exactly right. Contrast with §2.2 episodic TTH D (L463) which correctly does NOT allow mild nausea (`!sym-nausea-mild`), matching the verbatim §2.2 D "no nausea or vomiting." The two TTH D criteria are correctly differentiated.

---

#### LOW-3 — Candidate finding #7: definitional-flag correctness sweep (mostly correct; two intentional non-definitional choices hold)

I checked every `definitional: true` flag against whether ICHD-3 treats that criterion as gating, and every documented intentional non-definitional choice. Results:

| Criterion | Flagged definitional? | ICHD-3 status | Verdict |
|---|---|---|---|
| `mig-A` (≥5 attacks) | No (intentional) | Gating, but §1.5 covers <5 | **Correct** — preserves §1.5 path. Rationale holds. |
| `mig-B`, `mig-D` | Yes | Gating in §1.1, but §1.5 = "all but one of A–D" | **Over-flagged** (see HIGH-1) — breaks §1.5 near-miss. |
| `aura-B` | Yes | Gating (no aura symptom = not aura) | Correct. |
| `tth-B`, `ctth-A`, `ctth-B`, `ctth-D` | Yes | Gating | Correct in isolation; `tth-B`/`ctth-B` participate in the drop-gate over-deletion (HIGH-1). |
| `tth-D` | Yes (all-negative chips) | Exclusion criterion | **Subtle but safe** — the `hasPositiveEvidence` gate (L727–729) prevents empty-input trivial match; documented at L457–462. Holds. |
| `cluster-B`, `cluster-C` | Yes | Gating | Correct; `cluster-B` participates in between-bouts deletion (HIGH-1 / 2026-06-03). |
| `cluster-D`, `ph-D` (bout frequency) | No (intentional) | Gating in ICHD-3 | **Correct** — between-bouts encounters cannot chip-surface bout frequency. Rationale holds and is the right call for a clinic lookup tool. |
| `hc-A`, `hc-C`, `hc-D` | Yes | Gating; hc-D also `hiddenUntilTrial` | Correct; hc-D double-enforced (idempotent, documented L527–528). |
| `ndph-A`, `ndph-B` | Yes | Gating | Correct. |
| `ph-B`, `ph-C`, `ph-E` | Yes | Gating; ph-E also `hiddenUntilTrial` | Correct. |
| `sunct-B`, `sunct-C` | Yes | Gating | Correct in isolation; `sunct-B` participates in HIGH-1. |
| `vm-A` | Yes | Gating (no vertigo = not VM) | **Correct** — closes the V-reported false-positive. Keep. |
| `cm-A`, `cm-B`, `cm-C` | Yes | Gating | Correct; `cm-B` "implies from cm-A in chip vocab" reasoning (L595–598) holds because chronicity chips presuppose attack count. |

**Net:** the only definitional-flag *error* is the §X.5-breaking over-flagging of `mig-B`/`mig-D` (and the collateral drop-gate participation of `tth-B`/`ctth-B`/`cluster-B`/`ph-B`/`sunct-B`). The two documented intentional non-definitional choices (`mig-A`; `cluster-D`/`ph-D`) are **both clinically correct** for this tool's purpose. The `tth-D` all-negative-chip definitional flag is safe because of the `hasPositiveEvidence` pre-gate.

---

## Evaluator-level logic verification (not per-criterion)

| Evaluator mechanism | Location | ICHD-3 basis | Verdict |
|---|---|---|---|
| `hiddenUntilTrial` gate | L704 | §3.2 E / §3.4 D indomethacin = definitional | **Correct.** PH + HC both gate on `indo-tried-complete`; typed-gate refactor is clean. |
| Episodic suppression on `dur-continuous` | L710–711 | Episodic entities (1.1/1.2/2.2/3.1) have pain-free intervals; PH/SUNCT are also short-attack episodic | **Correct.** List correctly **excludes** §1.3 CM, §3.4 HC, §4.10 NDPH (all continuous-compatible). PH + SUNCT correctly **included** (they are episodic short-attack disorders, not continuous). |
| §2.3 Note 1 (CM suppresses chronic TTH) | L716–720 | "When criteria for both 1.3 and 2.3 are met, code only 1.3" | **Correct and faithful.** Re-checks CM's full criteria via `every(evaluate)` before suppressing chronic TTH. |
| `hasPositiveEvidence` gate | L725–729 | Prevents exclusion-only criteria from trivially matching empty input | **Correct.** Necessary precondition for the `tth-D`/`ctth-D` all-negative criteria to be safe. |
| Definitional drop-gate | L736–743 | ICHD-3 gating criteria | **Over-applied** — see HIGH-1. The mechanism is sound; the *set of criteria it is applied to* is too broad and conflicts with §X.5. |
| Strength assignment (full / probable / partial / none) | L762–768 | §X.5 "all but one" = probable | Logic is correct **only for phenotypes that survive the drop-gate.** Because the drop-gate runs first (L743) and removes any phenotype with a failed definitional criterion, the `metCount === total - 1 → probable` branch can NEVER fire for a phenotype whose missing criterion is definitional. This is the mechanism by which HIGH-1 silently swallows §1.5/§2.4/§3.5 near-misses. |
| X.5 exclusion (full match suppresses all probable) | L797–802 | §1.5 B / §2.4 B / §3.5 B "not fulfilling criteria for another disorder" | **Correct.** Faithful to the exclusion clause. |
| Sort (full > probable > partial, then ratio) | L805–811 | Ranking for display | Correct. |

**`PROBABLE_SECTION_FOR` map (L666–676) — verified against ICHD-3:**
- §1.5 Probable migraine covers only §1.5.1/§1.5.2 → **§1.3 Chronic migraine correctly OMITTED** (no §1.5.3 exists; verified — there is no "Probable chronic migraine" entity in ICHD-3). The scope comment L652–660 is accurate.
- §2.4 Probable TTH → episodic-tth + chronic-tth both mapped. **Correct** (§2.4.1/§2.4.2/§2.4.3 exist).
- §3.5 Probable TAC → cluster + PH + SUNCT + HC all four mapped. **Correct** (§3.5.1–§3.5.4 exist; confirmed §3.5.4 Probable hemicrania continua is a real entity).
- **Map content is fully faithful.** Its practical value is, however, largely nullified by HIGH-1: because definitional drops pre-empt the `probable` strength for the most common near-misses, these §X.5 labels rarely get the chance to render.

---

## Lookup-use-case assessment (Job 2)

### Drop-vs-demote verdict: **the drop-gate must become demote-and-flag. I agree with the 2026-06-03 recommendation and extend its scope.**

The product goal — "help smartify the way people look up criteria their patient relates to," surfacing partial/near-miss matches so the clinician can hone in — is **structurally defeated** by the L736–743 drop-gate. A phenotype with a single failed definitional criterion is removed *before* `metCriteria`/`missingCriteria` are computed (L745–760), so the clinician sees neither the partial match nor the one criterion they'd need to confirm. Concrete vanishing scenarios:

1. **Cluster between bouts (the stated clinic use case).** Chips: `attacks-gt-10`, `loc-unilateral`, `loc-orbital-temporal`, `sev-severe`, `sym-autonomic-ipsilateral`. Cannot confirm 15–180 min attack length right now → `cluster-B` (definitional) fails → **cluster headache vanishes with no trace.** The clinician gets no "cluster — needs you to confirm attack length 15–180 min" prompt. (2026-06-03 finding A.4/D.5, **confirmed**.)
2. **Migraine missing only duration.** Chips: `attacks-gt-10`, `loc-unilateral`, `qual-pulsating`, `sev-severe`, `act-aggravated`, `sym-nausea-mild`. Duration chip not ticked → `mig-B` (definitional) fails → **migraine without aura vanishes.** This patient is ICHD-3 §1.5 Probable migraine — the engine should surface "Probable migraine · §1.5 — confirm attacks last 4–72 h," and instead shows nothing. (New in this audit; the most common real-world near-miss.)
3. **Chronic migraine missing only criterion C.** Chips: `freq-ge-15-per-month`, `pattern-ge-3-months`, `attacks-gt-10`. Has not yet ticked `migraine-features-ge-8-per-month` or `triptan-response-positive` → `cm-C` (definitional) fails → **chronic migraine vanishes.** The clinician gets no "Chronic migraine — needs ≥8 migraine-feature-days OR triptan response" prompt, which is exactly the criterion they should be asking about. (CM correctly has no §1.5.3 Probable, so the right surface here is a *partial* with `cm-C` listed in `missingCriteria`, not a probable.)

**Recommended shape (consistent with 2026-06-03 D.5):** add `definitionallyExcluded: boolean` + `exclusionReason?: string` to `PhenotypeMatch`; always compute met+missing regardless of definitional outcome; surface any phenotype with ≥1 positive contributing chip; let the page demote (gray "considered — needs confirmation of [criterion]") rather than delete. Keep the hard-drop only for: the `hiddenUntilTrial` indomethacin gate (a genuinely absent test, not a near-miss), the episodic-suppression-on-continuous rule (a contradiction, not a near-miss), and `vm-A` (closes the V-reported false-positive). This unifies the four-plus suppression mechanisms the L137–157 comment already warns about — the rebuild is the place to do it.

### met/missing surfacing adequacy

The `metCriteria` (with `contributingChipLabels`) and `missingCriteria` (with `description`) shape is **good and sufficient in principle** — it can tell the clinician both why a phenotype fits and what to confirm next. Two caveats:

- **The drop-gate prevents it from ever being seen for the highest-value near-misses** (HIGH-1). The data shape is right; the gate upstream throws it away.
- **One `missingCriteria.description` would mislead:** `aura-C`'s description (L439) lists "unilateral" among the six aura characteristics without clarifying it means *aura-symptom* unilaterality. Because the engine wires that characteristic to `loc-unilateral` (HIGH-2), a clinician reading "Criterion C — needs … unilateral …" could tick the pain-location chip and wrongly satisfy it. Fix HIGH-2 and this description self-corrects. Similarly, `aura-A`'s description (L437) says "≥2 attacks" while the chip set admits a 1-attack patient (MED-1) — the description should flag the chip-granularity limit.

### Chip-vocabulary gaps (features a clinician would want but cannot tick)

1. **Aura-symptom laterality** — no chip for "an aura symptom is one-sided" distinct from pain laterality (drives HIGH-2). **Add.**
2. **"≥2 attacks" / "2–4 attacks"** — the `attacks-*` chips jump from `<5` (includes 1) to `5–10`; no way to assert exactly the §1.2 A "≥2" gate without admitting 1-attack patients (MED-1). **Add `attacks-ge-2` or split `attacks-lt-5`.**
3. **Established migraine history** — no chip for "patient has a prior 1.1/1.2 migraine diagnosis," which is VM criterion B and also §1.3 CM criterion B's substance and §1.4.1 Status migrainosus's gate (MED-2; also flagged in 2026-05-25). **Add `migraine-history-established`.**
4. **SUNCT vs SUNA autonomic granularity** — only one composite `sym-autonomic-ipsilateral` chip; cannot express "conjunctival injection AND lacrimation" for the subtype split (MED-3). **Optional** — parent-level is defensible.
5. **Bárány VM full criteria** — `vest-attacks-ge-5`, `vest-dur-5min-to-72h`, `vest-mod-severe`, `vest-features-ge-50pct` (2026-05-25 list). **Deferred pending Lempert 2012** — reasonable.

No chip is **semantically mismapped** in the sense of "label says X, criterion uses it as Y" — **except** the `loc-unilateral` reuse for the §1.2 C aura characteristic (HIGH-2). That is the single chip-semantics defect. All other chips are used consistently with their labels.

---

## What the two prior audits missed or got stale on

**`medsci-headache-ichd3-audit-2026-05-25.md` (older commit, pre-fix):** Its recommendations were implemented and I confirm they **landed faithfully** — §1.3 CM (verbatim-correct incl. C.3 triptan disjunction and §2.3 Note 1 suppression), §3.2 PH (A–E correct), §3.3 SUNCT/SUNA (A–D correct at parent), NDPH moved to §4.10, VM moved to §A1.6.6, §2.3 D nausea split (verbatim-correct), `onset-single-sudden` dropped from NDPH. **What it did not anticipate:** that making `mig-B`/`mig-D` (and the new TAC `*-B` criteria) definitional, combined with the 2026-05-27 drop-gate, would **re-close the §1.5/§2.4/§3.5 Probable path it explicitly wanted to preserve.** The 2026-05-25 audit treated "add probable as first-class §X.5 labels" as a cosmetic relabel; it is now partially dead code because the drop-gate pre-empts the `probable` strength. It also did not flag the `loc-unilateral`-as-aura-characteristic mismap (HIGH-2) or the `aura-A` 1-attack granularity hole (MED-1) — both are pre-existing and survived the rebuild.

**`headache-pathway-audit-2026-06-03.md` (4-lens, yesterday):** Its clinical lens correctly judged the engine "largely faithful — a framing rebuild, not a logic rebuild," and its finding A.4/D.5 (drop silently deletes near-misses; recommend rank-and-flag) is **the single most important structural finding and I fully endorse it.** What its spot-check did **not** catch, because it was not a verbatim line-by-line re-verification: (1) the `loc-unilateral` semantic mismap in §1.2 C (HIGH-2) — it accepted the aura encoding as faithful; (2) the `aura-A` 1-attack false-positive (MED-1); (3) the vestibular-migraine **criterion mislabel** ("B" is actually ICHD-3 criterion C, and true criterion B is absent) (MED-2); (4) that the drop-gate's interaction with `mig-B`/`mig-D` specifically kills the §1.5 Probable-migraine path the codebase tried to keep open — its example was cluster between bouts, but the migraine-missing-duration case is far more common and equally affected. Its core verdict (rebuild framing + rank-and-flag, preserve the ICHD-3 brain) is correct; these four are the criterion-level specifics it left for exactly this re-audit.

---

## Routing

Report-only. No PR, no engine change, no test change. The baseline suite (66/66) was not touched.

Each finding that warrants a fix becomes a separately-governed clinical task:
- **HIGH-1** (drop→demote / §X.5 near-miss preservation) and the chip-granularity adds (HIGH-2, MED-1, MED-2) are **Class E** (clinical logic + evaluator output shape + chip vocabulary). They should fold into the Phase-2 evaluator rank-and-flag refactor the 2026-06-03 audit already scoped, with `evidence-verifier` not required (ICHD-3 criteria are verbatim-quoted here from the IHS pocket PDF) but `clinical-reviewer` gating pre- and post-execution.
- **MED-3** (SUNCT/SUNA teach text) and the `aura-C`/`aura-A` `missingCriteria.description` clarifications are **C-clinical** copy fixes.
- The Bárány VM full-criteria expansion remains **blocked:source-not-resolved** pending Lempert 2012 (J Vestib Res 2012;22:167–172; PMID 23142830) — unchanged from 2026-05-25.

This audit is the evidence; it is not the change.
