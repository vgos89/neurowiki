I now have the authoritative PDF pages 54-55 rendered visually. The §4.9 Hypnic headache criteria are fully legible and confirm the in-repo reference exactly. Let me confirm one label detail in the engine (sym-restlessness) and produce the packet.

The PDF resolved and I can read every criterion verbatim. I have everything needed. Here is the deliverable.

---

# EVIDENCE PACKET — ICHD-3 §4.9 Hypnic headache

**Packet type:** Diagnostic-criteria encoding (Class E, headache engine). Not a trial. Sections 1–7 of the trial template are N/A by design; the analogous "canonical citation," "verbatim criteria," "source resolution," "field mapping," and "confidence" sections are supplied.
**Date:** 2026-07-06
**Suggested filename (for the author who writes it):** `docs/evidence-packets/2026-07-06-ichd3-4-9-hypnic-headache.md`

---

## 1. Canonical citation

- **Title:** *Headache Classification Committee of the International Headache Society (IHS). The International Classification of Headache Disorders, 3rd edition (ICHD-3).*
- **Section:** **4.9 Hypnic headache** (within Part One, §4 "Other primary headache disorders")
- **Journal:** *Cephalalgia* **38(1): 1–211**, 2018. §4.9 appears on **pp. 54–55** (Cephalalgia paginated header: "54 Cephalalgia 38(1)" / "ICHD-3 55").
- **DOI:** 10.1177/0333102417738202
- **PMID:** 29368949
- **Copyright line on the source page (verbatim):** "© International Headache Society 2018"
- **Previously used terms (verbatim, p. 54):** "Hypnic headache syndrome; 'alarm clock' headache."

---

## 2. Verbatim criteria — §4.9 Hypnic headache (p. 54)

Quoted exactly from the official PDF, p. 54. Hyphenation from line-wrapping removed; wording, punctuation, symbols, and criterion order preserved.

**Description (p. 54, verbatim):**
> "Frequently recurring headache attacks developing only during sleep, causing wakening and lasting for up to four hours, without characteristic associated symptoms and not attributed to other pathology."

**Diagnostic criteria (p. 54, verbatim):**
> **A.** "Recurrent headache attacks fulfilling criteria B–E"
> **B.** "Developing only during sleep, and causing wakening"
> **C.** "Occurring on ≥10 days/month for >3 months"
> **D.** "Lasting from 15 minutes up to four hours after waking"
> **E.** "No cranial autonomic symptoms or restlessness"
> **F.** "Not better accounted for by another ICHD-3 diagnosis.¹˒²"

**Notes (p. 54, verbatim):**
> **Note 1:** "Distinction from one of the types or subtypes of 3. *Trigeminal autonomic cephalalgias*, especially 3.1 *Cluster headache*, is necessary for effective management."
> **Note 2:** "Other possible causes of headache developing during and causing wakening from sleep should be ruled out, with particular attention given to sleep apnoea, nocturnal hypertension, hypoglycaemia and medication overuse; intracranial disorders must also be excluded. However, the presence of sleep apnoea syndrome does not necessarily exclude the diagnosis of 4.9 *Hypnic headache*."

**Comments (p. 54, verbatim):**
> "A recent study has suggested these criteria, introduced in ICHD-3 beta, are more sensitive for 4.9 *Hypnic headache* than those of ICHD-II."

**Comments continued (p. 55, verbatim — clinically load-bearing detail):**
> "4.9 *Hypnic headache* usually begins after age 50 years, but may occur in younger people."
> "The pain is usually mild to moderate, but severe pain is reported by one-fifth of patients. Pain is bilateral in about two-thirds of cases. Attacks usually last from 15 to 180 minutes, but longer durations have been described."
> "Most cases are persistent, with daily or near daily headaches, but an episodic subtype (on <15 days/month) may occur."
> "Lithium, caffeine, melatonin and indomethacin have been effective treatments in several reported cases."

### Sub-form — §4.9.1 Probable hypnic headache (p. 55, verbatim)

> **A.** "Recurrent headache attacks fulfilling criteria B and C"
> **B.** "Developing only during sleep, and causing wakening"
> **C.** "Two only of the following:
>  1. occurring on ≥10 days/month for >3 months
>  2. lasting from 15 minutes up to four hours after waking
>  3. no cranial autonomic symptoms or restlessness"
> **D.** "Not fulfilling ICHD-3 criteria for any other headache disorder"
> **E.** "Not better accounted for by another ICHD-3 diagnosis"

**No other sub-forms exist.** §4.9 has exactly two entries in the classification: 4.9 (full) and 4.9.1 (Probable). There is no painful/painless split, no classical/idiopathic/secondary split (those apply to §13.1 Trigeminal neuralgia, not §4.9). The episodic vs. persistent distinction (<15 vs. ≥15 days/month) is mentioned in the Comments only and is **not separately coded**.

**Numeric watch-points (author must not paraphrase away):**
- Frequency threshold is **≥10 days/month** (criterion C) — **not** ≥15. The ≥15 boundary is only referenced in the Comments to describe the uncoded episodic subtype, and is not a diagnostic criterion.
- Duration is **15 minutes up to four hours** after waking (criterion D). The "15 to 180 minutes" figure in the p. 55 Comments is descriptive of typical attacks, **not** the criterion. Do not encode 180 min.
- Criterion E is a **combined** exclusion: "No cranial autonomic symptoms **or** restlessness" — a single criterion excluding both.

---

## 3. Source resolution

- **PDF resolved: YES.** The official IHS PDF was fetched (WebFetch could not parse the compressed binary as text, but the file was saved locally and the pages were rendered directly). URL fetched: `https://ichd-3.org/wp-content/uploads/2018/01/The-International-Classification-of-Headache-Disorders-3rd-Edition-2018.pdf`.
- **Pages read verbatim:** PDF/print **p. 54** (full §4.9 criteria A–F, Description, Notes 1–2, Comments) and **p. 55** (continued Comments + full §4.9.1 Probable A–E). Confirmed via the running header ("54 Cephalalgia 38(1)", "ICHD-3 55") — the brief's estimate of pp. 54–55 is exact.
- **Sub-source DOI/PMID:** journal DOI 10.1177/0333102417738202, PMID 29368949 (whole ICHD-3). §4.9 has no separate DOI/PMID.
- **Cross-check vs. in-repo reference** (`docs/2026_07_01/ichd3-criteria-verified-reference.md`, lines 192–202 and 930–946): the reference's transcription of §4.9 and §4.9.1 matches the authoritative PDF **exactly** on every criterion, threshold, and the two-of-three Probable structure. One purely cosmetic difference: the reference writes "up to 4 hours"; the PDF prints "up to four hours" (word form). No semantic drift. The PDF is treated as authoritative and both agree.
- **Registry citation ID:** the engine already registers this source as `ichd3-2018` (see `clinicHeadacheData.ts` header). No new citation registry entry is required; the existing `ichd3-2018` covers §4.9.

---

## 4. Engine chip mapping — `src/data/clinicHeadacheData.ts`

Read of the `ChipId` union, `HEADACHE_CHIP_GROUPS`, and the `Phenotype` / `Criterion` / `CriterionRole` model. `hypnic-headache` is **not** currently a `PhenotypeId` — this is a new phenotype (§4.9 is confirmed a GAP in the coverage audit, `ichd3-criteria-verified-reference.md` line 1030).

### 4a. Existing chips reusable for §4.9

| ICHD-3 §4.9 criterion | Existing chip(s) | Notes |
|---|---|---|
| C — "≥10 days/month for >3 months" (pattern-duration half) | `pattern-ge-3-months` | Reusable for the ">3 months" clause. |
| E — "No cranial autonomic symptoms or restlessness" | `sym-autonomic-ipsilateral`, `sym-restlessness` | Both already exist. E is a **suppress-gate** that fails if **either** is selected. |
| F — exclusion / secondary rule-out | red-flag layer (`rf-*` chips, e.g. `rf-older-age-onset`, `rf-painkiller-overuse`) + `anyRedFlagActive` | The secondary work-up (sleep apnoea, nocturnal HTN, hypoglycaemia, medication overuse, intracranial disorders) is handled by the global red-flag/secondary-workup layer, exactly as §4.10 NDPH criterion D is handled today. Not encoded as a per-phenotype `Criterion`. |

### 4b. NEW chips required

The engine has **no chip for the ≥10 days/month frequency**, **no chip for the 15 min–4 h duration window**, and **no chip for the "only during sleep, causing wakening" onset**. Confirmed by the reference's explicit warning (line 202): `freq-ge-15-per-month` is the wrong threshold, and `dur-15-to-180-min` caps at 180 min so must not be reused.

| Proposed chip id | Proposed label | Maps to §4.9 criterion | Chip group |
|---|---|---|---|
| `onset-only-during-sleep-waking` | "Attacks occur only during sleep and wake the patient" | **B** | Pattern (onset chips) |
| `freq-ge-10-per-month` | "10 or more headache days per month" | **C** (frequency half) | Pattern (frequency chips) |
| `dur-15min-to-4h` | "Attacks last 15 minutes up to 4 hours after waking" | **D** | Pattern (duration chips) |

`teachWhenSelected` copy is `content-writer`'s job, not this packet's. Note that `freq-ge-10-per-month` is genuinely new vocabulary and may be reusable by other future §4 entities; introduce it as a shared chip, not a hypnic-only one.

### 4c. Proposed criterion roles (author-facing recommendation; final role call is `clinical-reviewer`'s per §17.2)

| Criterion | Proposed `id` | Proposed `role` | Rationale (mapped to the engine's existing role semantics) |
|---|---|---|---|
| A (≥ B–E umbrella) | — | not encoded as a `Criterion` | Umbrella "fulfilling B–E" is structural; other §4 phenotypes (NDPH) do not encode the umbrella A as its own criterion. |
| B — only during sleep, causing wakening | `hypnic-B` | **suppress-gate (DROP)** | This is the diagnostic **substrate** of hypnic headache (a headache that is not sleep-bound and waking is not hypnic headache at all). Substrate-absence → suppress silently, mirroring `aura-B` / `ndph-B` treatment. |
| C — ≥10 days/month for >3 months | `hypnic-C` | **demote-gate** | Frequency/window a between-visit patient may not yet confirm; §4.9.1 Probable explicitly provides a home for missing exactly one of C/D/E (two-of-three). Demote, not suppress. |
| D — 15 min to 4 h after waking | `hypnic-D` | **demote-gate** | Same reasoning as C — one of the three two-of-three Probable slots. |
| E — no cranial autonomic symptoms or restlessness | `hypnic-E` | **suppress-gate (EMIT)** | An **exclusion** criterion whose failure is positive evidence for a **different** phenotype (autonomic features/restlessness point to §3 TACs, esp. 3.1 Cluster — the exact distinction Note 1 demands). Fails if `sym-autonomic-ipsilateral` OR `sym-restlessness` selected. EMIT so the result screen can surface "considered and set aside — autonomic/restlessness present," matching `tth-D`/`cm-C` EMIT semantics. **Caveat:** E is also one of the three Probable two-of-three slots, which pulls toward demote. This is a genuine role-design tension — resolve E's role (suppress-EMIT vs demote) with `clinical-reviewer` before encoding; both readings are defensible and the choice changes UX behavior. |
| F — not better accounted for by another ICHD-3 dx | — | not encoded as a `Criterion` | Handled by the global red-flag/secondary-workup layer, per the §4.10 NDPH precedent. |

### 4d. Gates, exclusions, red flags — explicit answers to the brief

- **`hiddenUntilTrial`-style gate:** NOT applicable to §4.9.** Unlike §3.2/§3.4 (indomethacin-response gate) or the ON nerve-block example, hypnic headache has **no confirmatory-test criterion**. Lithium/caffeine/melatonin/indomethacin are listed as *treatments* in the Comments (p. 55), **not** as diagnostic criteria — treatment response is explicitly **not** a criterion here (directly analogous to the brief's note that carbamazepine response is not a criterion for TN). Do **not** add a `hiddenUntilTrial` gate for hypnic headache.
- **Exclusion criterion:** Yes — criterion **E** (autonomic/restlessness) is the intra-phenotype exclusion (encode as a gate on `sym-autonomic-ipsilateral`/`sym-restlessness`), and criterion **F** is the global secondary-exclusion (red-flag layer).
- **Red-flag / imaging-refer:** Yes — Note 2 mandates ruling out sleep apnoea, nocturnal hypertension, hypoglycaemia, medication overuse, and **intracranial disorders** (→ neuroimaging/secondary workup). The onset-after-age-50 typicality (p. 55) intersects the existing `rf-older-age-onset` red flag — worth surfacing in teaching copy, but note that late onset is *typical* for hypnic headache and should not by itself block the phenotype.

### 4e. Structural classification — FLAT additive vs. subtype-hierarchy

**FLAT additive phenotype — Class E, NO structural change required.** §4.9 adds:
- one new `PhenotypeId` (`hypnic-headache`) to the union,
- one new `Phenotype` object to `HEADACHE_PHENOTYPES` with 3–4 `Criterion` objects,
- three new `ChipId`s + their chip definitions,
- (optionally) a §4.9.1 Probable handled by the existing Probable/two-of-three engine machinery, exactly as §4.7.1 and other §X.1 Probable forms are.

This fits the existing `Phenotype[]` + `Criterion[]` + `CriterionRole` model with zero schema change. It does **not** require the subtype-hierarchy layer — §4.9 has no nested classical/idiopathic/secondary or painful/painless children (contrast §13.1 TN, which would). The only design decision needing a reviewer call is criterion E's role (suppress-EMIT vs demote, §4c).

---

## 5. Copyright note (ICHD-3 educational-use grant + attribution)

- The source page carries "© International Headache Society 2018."
- IHS grants the ICHD-3 diagnostic criteria **free for use in clinical practice, teaching, and non-commercial research**; the classification text may be reproduced for educational/clinical purposes with attribution. Commercial reproduction, translation, or republication requires IHS permission.
- **Required attribution string for any surfaced §4.9 content:** *"Headache Classification Committee of the International Headache Society (IHS). The International Classification of Headache Disorders, 3rd edition. Cephalalgia 2018;38(1):1–211. © International Headache Society 2018."*
- This matches the existing in-repo citation `ichd3-2018` in `src/lib/citations/registry.ts` — reuse that ID; no new registry entry needed.

---

## 6. Verification confidence

**HIGH.**
- Official IHS PDF resolved; §4.9 criteria A–F, Notes 1–2, Comments, and §4.9.1 Probable A–E all read **verbatim** from the rendered source pages (p. 54–55), not from abstract or secondary transcription.
- Every criterion and numeric threshold (≥10 days/month, >3 months, 15 min–4 h, criterion E combined exclusion) confirmed directly against the authoritative page image.
- Independent cross-check against `docs/2026_07_01/ichd3-criteria-verified-reference.md` agrees exactly (only cosmetic "4 hours" vs "four hours").
- No fabricated criteria; no unresolved page.

**One open item flagged for the downstream authoring/review, not a block:** criterion E's engine role (suppress-gate EMIT vs demote-gate) is a genuine design choice — resolve with `clinical-reviewer` at the §17.2 gate before encoding. Everything else is unambiguous.

---

## 7. Files referenced (absolute paths)

- Authoritative source (saved PDF, pp. 54–55 read verbatim): `/Users/vaibhav/.claude/projects/-Users-vaibhav-Documents-NeuroWiki-Cursor-Neurowiki-neurowiki--claude-worktrees-vibrant-dewdney-4f0ed7/2eefee8c-e51f-4488-b574-6186fb6f76a0/tool-results/webfetch-1783339828666-pugwt6.pdf`
- In-repo cross-check reference: `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/2026_07_01/ichd3-criteria-verified-reference.md` (§4.9 at lines 192–202 and 930–946; coverage-audit row at line 1030)
- Engine data file to be edited by the author (not by this agent): `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/clinicHeadacheData.ts` (`ChipId` union lines 23–79; chip groups lines 234–411; `HEADACHE_PHENOTYPES` array; §4.10 NDPH precedent at lines 714–734)
- Citation registry (existing `ichd3-2018` ID; no change needed): `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/lib/citations/registry.ts`

**Note:** Sections 2, 8, 9 of the standard trial evidence-packet template (Population, Expert/editorial caveats, trial-field mapping) are **not applicable** — this is a classification-criteria encoding, not a clinical trial. §8's editorial/letters/guideline/meta-analysis requirements pertain to trial entries; ICHD-3 is itself the authoritative classification standard. This explicit non-applicability statement is provided in lieu of silent omission, per the §8 block-condition.