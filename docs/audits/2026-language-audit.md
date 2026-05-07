# Language Audit — trialData.ts — 2026-05-06

> **Scope:** Full scan of `src/data/trialData.ts` (9,181 lines) for em dashes, double-hyphen em-dash substitutes, AI-style phrasing, and sentence-level drift. Read-only — no changes made.
>
> **Project rule:** "No em dashes" in `bedsidePearl` and `bottomLineSummary` (explicit schema comments, trialData.ts lines 168–171). The broader project rule (CLAUDE.md §14) extends to all clinical prose.

---

## 1. Summary

| Category | Total Flags | Notes |
|---|---|---|
| **Em dash (`—`)** | ~95 in user-facing prose | Excludes type annotations, code comments, and schema JSDoc |
| **Double hyphen (`--`) as em dash** | ~40 in user-facing prose | Concentrated in W6.6.3 Batch 5C/5D sessions |
| **AI-style phrasing** | 9 instances | Primarily "essentially" used as statistical qualifier |
| **Sentence-level drift** | 4 flags | Borderline; PM triage recommended |

**Top 5 trials by flag count:**
1. destiny-ii-trial (~8 em-dash violations across bedsidePearl, cautions, proves, howToReadChart)
2. hamlet-trial (~5: bedsidePearl ×2, doesNotProve, howToReadChart ×2)
3. optimas-trial (~4: bedsidePearl, doesNotProve, howToReadChart ×2)
4. timing-trial (~4: bedsidePearl, howToReadChart ×3)
5. trace-iii-trial (~3: bedsidePearl, doesNotProve, cautions — all `—` not `--`)

**Pattern-level observation (most actionable):** The `--` pattern is a batch-level authoring artifact, not a per-trial error. Batches 5C and 5D (hemicraniectomy chain: DECIMAL, DESTINY, HAMLET, DESTINY II; and NOAC timing: TIMING, OPTIMAS) were authored in the same session and all use `--` systematically in `doesNotProve`, `cautions`, `bedsidePearl`, and `howToReadChart`. Fixing the source template would correct all instances from that batch. Similarly, TRACE-III and THAWS use `—` and appear to have been authored in a different session. Antiplatelet section (SOCRATES, SPS3, SPARCL, EAGLE, ESCAPE-NA1) also uses `--` consistently.

---

## 2. Em Dash Inventory (`—` literal character)

These are true em dashes (U+2014). Distinguish from en dashes (`–`, U+2013) used correctly in numeric ranges (e.g., "0.97–1.09"). Only prose-field violations listed.

### 2.1 bedsidePearl (explicit schema violation)

| Line | Trial | Flagged phrase |
|---|---|---|
| 4614 | thaws-trial | `...trial was stopped at 44% enrollment — findings are inconclusive.` |
| 4724 | trace-iii-trial | `...This is not a reason to delay EVT when it is available — TIMELESS showed no benefit...` |
| 8265 | timeless-trial | `...it is specifically negative for bridging tenecteplase — it adds nothing as a bridge...` |

### 2.2 howToInterpret.doesNotProve and cautions (explicit schema violation)

| Line | Trial | Field | Flagged phrase |
|---|---|---|---|
| 4721 | trace-iii-trial | doesNotProve | `...beneficial when EVT is available (see TIMELESS — neutral result in that population)` |
| 4722 | trace-iii-trial | cautions | `...This is not a "bridging" IVT-before-EVT trial — it is specifically for settings without EVT access.` |
| 4612 | thaws-trial | cautions | `...trial was stopped early following publication of WAKE-UP — not for safety reasons.` |

### 2.3 howToReadChart answers

| Line | Trial | Flagged phrase |
|---|---|---|
| 3649 | hamlet-trial | `Functional benefit — and strongest mortality benefit — was concentrated in patients operated within 48 hours` |
| 3748 | destiny-ii-trial | `Mortality was dramatically reduced: 33% vs 70% — a real, large survival benefit` |
| 3755 | destiny-ii-trial | `...0% of patients in either group achieved mRS 0-2 (good outcome — able to perform daily activities independently)` |
| 3763 | destiny-ii-trial | `...DESTINY II is a positive trial for preventing death — not a trial demonstrating functional recovery` |

### 2.4 pearls[] array entries

| Line | Trial | Flagged phrase |
|---|---|---|
| 433 | original-trial | `Noninferiority confirmed: RR 1.03 (95% CI 0.97–1.09) — noninferiority margin of 0.937 met` |
| 434 | original-trial | `Symptomatic ICH...in both groups (RR 1.01...) — identical safety profiles` |
| 435 | original-trial | `90-day mortality: 4.6% (TNK) vs 5.8% (alteplase) — numerically lower with TNK...` |
| 436 | original-trial | `Single-bolus advantage: Tenecteplase eliminates the 60-minute IV infusion pump requirement — practical for drip-and-ship...` |
| 2614 | choice-trial | `Small study stopped early — replication needed before routine use...` |
| 4070 | escape-mevo-trial | `No subgroup showed benefit — not younger patients, not higher NIHSS...` |
| 4174 | escape-mevo-trial | `No functional benefit (mRS 0-2: 41.6% vs 43.1%...) — 90-day mortality was higher with EVT` |
| 4300 | defuse-3-trial | `Late window: Along with DAWN, DEFUSE-3 shifted selection from time-based to tissue-based — perfusion mismatch over clock` |
| 4441 | select2-trial | `Large core: No longer an absolute contraindication — SELECT2 showed clear functional benefit...` |
| 5096 | chance-trial | `Benefit consistent across all subgroups — no significant interactions` |
| 5907 | elan-study | `Estimation trial (not superiority) — establishes safe range for practice` |
| 5910 | elan-study | `Symptomatic ICH: 0.2% in both groups — bleeding risk not increased with early treatment` |
| 5923 | elan-study | `Early DOAC initiation is safe — use if clinically indicated after imaging review` |

### 2.5 educationalContext and clinicalContext

| Line | Trial | Field | Flagged phrase |
|---|---|---|---|
| 5111 | chance-trial | educationalContext | `...long-term dual therapy — both decisions raised bleeding risk...` |

### 2.6 listDescription

| Line | Trial | Flagged phrase |
|---|---|---|
| 712 | eagle-trial | `IA tPA for central retinal artery occlusion — negative trial; stopped early for futility.` |
| 4080 | distal-trial | `EVT for medium and distal vessel occlusions — negative trial (NEJM 2025).` |
| 4243 | escape-mevo-trial | `EVT for medium vessel occlusion (MeVO) — no functional benefit, higher sICH and mortality (NEJM 2025).` |
| 5351 | sammpris-trial | `Intracranial stenting vs medical therapy for stenosis — medical management wins.` |
| 5575 | socrates-trial | `Ticagrelor vs aspirin monotherapy in acute ischemic stroke — not superior.` |
| 5683 | sps3-trial | `DAPT not beneficial in lacunar stroke — increased bleeding without stroke reduction.` |
| 4582 | thaws-trial | `Low-dose alteplase 0.6 mg/kg for MRI-selected unknown-onset stroke; stopped early after WAKE-UP — inconclusive.` |

> **Note on listDescription:** these are short display strings, not full clinical prose. Lower severity. PM should decide whether to standardize or leave.

---

## 3. Double-Hyphen Inventory (`--` used as em dash)

These are double hyphens serving as em-dash substitutes. All are rule violations in clinical prose fields. The `--` pattern is particularly prominent in the hemicraniectomy and NOAC timing batches.

### 3.1 bedsidePearl (schema violation — highest severity)

| Line | Trial | Flagged phrase |
|---|---|---|
| 754 | eagle-trial | `EAGLE definitively showed that IA tPA for CRAO causes significant harm...-- the procedure is not indicated for CRAO.` |
| 3363 | escape-na1-trial | `The alteplase-free subgroup signal is hypothesis-generating only -- do not alter thrombolysis decisions...` |
| 3474 | decimal-trial | `The pooled analysis (DECIMAL, DESTINY, HAMLET within 48 hours) provides the most reliable estimate...-- use it for family counseling.` |
| 3673 | hamlet-trial | `...functional benefit -- and the strongest mortality benefit -- is concentrated in patients operated within 48 hours.` |
| 3773 | destiny-ii-trial | `DESTINY II is a positive trial for survival and surgery is a legitimate option -- but it must be offered with the right framing.` |
| 3871 | timing-trial | `...This does not mandate same-day initiation -- the early window was days 1-4.` |
| 3970 | optimas-trial | `...This does not mandate same-day initiation -- individualize based on infarct size and hemorrhagic transformation risk.` |
| 5618 | socrates-trial | `SOCRATES showed ticagrelor monotherapy did not beat aspirin alone (P=0.07). The relevant question...is now DAPT composition -- CHANCE/POINT established...` |
| 5839 | sparcl-trial | `SPARCL established atorvastatin 80 mg as a standard in secondary stroke prevention -- but the hemorrhagic stroke signal (HR 1.66) is real...` |

### 3.2 howToInterpret.doesNotProve and cautions (schema violation)

| Line | Trial | Field | Flagged phrase |
|---|---|---|---|
| 3051 | bp-target-trial | doesNotProve | `...BP-TARGET was underpowered... -- only that SBP 100-129 mm Hg does not reduce radiographic iPH...` |
| 3257 | charm-trial | doesNotProve | `...nor does it definitively establish inefficacy -- the trial was substantially underpowered after early stopping.` |
| 3470 | decimal-trial | doesNotProve | `The primary endpoint -- mRS less than or equal to 3 at 6 months -- was not statistically significant in this sample` |
| 3569 | destiny-trial | doesNotProve | `The primary endpoint -- mRS 0-3 at 6 months -- was not statistically significant in this 32-patient sample` |
| 3669 | hamlet-trial | doesNotProve | `The primary endpoint -- mRS 0-3 at 1 year -- was not statistically significant overall...` |
| 3768 | destiny-ii-trial | proves | `...The trial proves that surgery prevents death and completely bedbound status in patients over 60 -- not that it restores function.` |
| 3770 | destiny-ii-trial | cautions | `...Most surgical survivors had severe disability (mRS 4), not moderate disability -- clinicians should not present this trial...` |
| 5729 | sps3-trial | doesNotProve | `It does not prove that any antiplatelet is ineffective in lacunar stroke -- aspirin monotherapy remains standard.` |

### 3.3 howToReadChart Q&A answers

| Line | Trial | Flagged phrase |
|---|---|---|
| 737 | eagle-trial | `What endpoint does this chart display -- and why not the primary?` |
| 2832 | enchanted-trial | `Surfacing the secondary ICH reduction as the main result would misrepresent the trial design... (secondary finding in a null primary trial)` — actually uses `--` |
| 2840 | enchanted-trial | `ENCHANTED reduced all-grade any-ICH, including small asymptomatic hemorrhagic transformation -- not specifically symptomatic or large ICH.` |
| 2942 | optimal-bp-trial | `...the intensive BP arm (SBP <140 mm Hg) achieved only 39.4% functional independence...-- the trial was substantially underpowered...` |
| 3037 | bp-target-trial | `The primary endpoint was any radiographic intraparenchymal hemorrhage (iPH)...-- not symptomatic ICH or functional outcome.` |
| 3460 | decimal-trial | `...the trial enrolled only 38 patients -- far too few for functional outcome detection.` |
| 3853 | timing-trial | `Early arm: 6.89%. Delayed arm: 8.68%...This is a noninferiority result -- early NOAC was not worse than delayed...` |
| 3856 | timing-trial | `Why is P=0.004 for NI -- how does that differ from P=0.05 for superiority?` |
| 3860 | timing-trial | `Zero symptomatic ICH in either arm -- what does that mean?` |
| 3952 | optimas-trial | `...The risk difference is 0.000 -- identical rates.` |
| 3956 | optimas-trial | `...Noninferiority was tested first, then superiority...superiority requires demonstrating...With identical event rates...there is no numerical advantage -- the trial met its primary NI objective...` |
| 5417 | weave-trial | `Study design: single-arm benchmark study -- does not establish superiority or non-inferiority to medical therapy` |
| 5499 | weave-trial | `...the upper CI bound (6.6%) exceeds it -- meaning the benchmark-met result has meaningful uncertainty at the boundary.` |
| 5602 | socrates-trial | `Ticagrelor 93.3% vs Aspirin 92.5% -- a 0.8 percentage-point difference that did not reach significance.` |
| 5716 | sps3-trial | `Annual recurrent stroke rate: DAPT 2.5% vs aspirin 2.7% per year -- a 0.2 percentage-point difference that was not significant (P=0.48).` |

---

## 4. AI-Style Phrasing Inventory

The content in trialData.ts is substantially cleaner than typical AI-generated text. The list below contains all verified instances. Confirmed-absent: "leverage," "delve," "pivotal," "groundbreaking," "paradigm-shifting," "navigate the complexities," "it's worth noting," "comprehensive," "revolutionize."

### 4a. "Essentially" as vague qualifier

Used in statistical contexts where "statistically indistinguishable" or "no meaningful difference" would be more precise. Eight occurrences.

| Line | Trial | Field | Context |
|---|---|---|---|
| 3037 | bp-target-trial | howToReadChart | `Both arms showed essentially identical iPH rates: 42% intensive versus 43% standard.` |
| 3041 | bp-target-trial | howToReadChart | `...the intensive BP arm had essentially the same odds of radiographic hemorrhage as the standard arm.` |
| 4062 | distal-trial | pearls | `Primary outcome p=0.50 (not significant) - essentially no difference between groups` |
| 4106 | distal-trial | howToReadChart | `mRS 0-2 rates were essentially equal: 56.5% (EVT) vs 54.7% (BMT).` |
| 4598 | thaws-trial | howToReadChart | `The two groups were essentially identical in outcomes.` |
| 6820 | enrich-trial | safetyProfile tooltip | `Overall 90-day mortality was essentially identical between groups.` |
| 6875 | enrich-trial | pearls | `In the target population, mRS 0-2 at 90 days was essentially unchanged: 51% vs 49%` |
| 7219 | aramis-trial | pearls | `Mortality at 90 days was essentially identical: 15.3% vs 15.4%` |

> **Triage:** These are borderline. "Essentially identical" is common clinical shorthand for "no clinically meaningful difference." Flag for review but do not treat as high priority.

### 4b. "Landmark" as hyperbole marker

| Line | Trial | Field | Context |
|---|---|---|---|
| 815 | mr-clean-trial | specialDesign | `'landmark-evt'` — code value, not prose; ignore |
| 8357 | trace-2-trial | howToReadChart | `Why is TRACE-2 considered a landmark trial for tenecteplase?` — question framing that reflects clinical consensus; acceptable |

> **Verdict:** Neither instance is a violation. "Landmark" in the Q&A question is describing a clinical designation, not asserting one.

### 4c. Other borderline instances

| Line | Trial | Field | Flag | Severity |
|---|---|---|---|---|
| 4897 | attention-trial | clinicalContext | `...ATTENTION (and BAOCHE) provided definitive evidence.` — "definitive" is strong; consider "demonstrated benefit" | Low |
| 5341 | sammpris-trial | pearls | `'Stenting is Dangerous: The trial was halted early because...'` — colon-prefix bullet style; editorially informal but not AI-style per se | Low |
| 5342 | sammpris-trial | pearls | `The "Control" group did surprisingly well compared to historical controls` — "surprisingly" is editorializing | Low |

---

## 5. Sentence-Level Drift (Marketing Copy)

Four instances that read as promotional or non-clinical in tone. PM should triage.

| Line | Trial | Field | Flagged text | Notes |
|---|---|---|---|---|
| 355 | ninds-trial | clinicalContext | `...established intravenous alteplase (tPA) as the first FDA-approved treatment for acute ischemic stroke.` | Accurate but reads like a press release opener. Acceptable in context — educational framing. |
| 5342 | sammpris-trial | pearls | `The "Control" group did surprisingly well compared to historical controls (WASID trial), proving that AMM...is a highly effective strategy` | "Proving" overstates; "demonstrating" is more precise. "Did surprisingly well" is informal. |
| 4501 | angel-aspect-trial | clinicalContext | `ANGEL-ASPECT complemented SELECT2 by investigating thrombectomy in patients with large infarct cores...` | "Complemented" is acceptable clinical framing. Lowest severity; likely fine. |
| 5077 | chance-trial | clinicalContext | `The mechanism: Aspirin and clopidogrel synergistically inhibit platelet aggregation through different mechanisms (COX-1 vs P2Y12 pathways). This dual inhibition is most beneficial when platelet activation is highest...` | Mixed metaphor ("synergistically...through different mechanisms"). Mechanistically accurate but slightly promotional in structure. |

---

## 6. Worst Offenders — Trials Needing Full Content Review

Ranked by total flag count across all em-dash and phrasing categories:

| Rank | Trial | Total flags | Primary violation |
|---|---|---|---|
| 1 | **destiny-ii-trial** | ~8 | `--` in bedsidePearl, cautions, proves; `—` in howToReadChart ×3 |
| 2 | **hamlet-trial** | ~5 | `--` in bedsidePearl ×2, doesNotProve; `—` in howToReadChart |
| 3 | **optimas-trial** | ~4 | `--` in bedsidePearl, doesNotProve, howToReadChart ×2 |
| 4 | **timing-trial** | ~4 | `--` in bedsidePearl, howToReadChart question labels ×3 |
| 5 | **trace-iii-trial** | ~3 | `—` in bedsidePearl, doesNotProve, cautions (all 3 schema-critical fields) |
| 6 | **decimal-trial** | ~3 | `--` in bedsidePearl, doesNotProve, howToReadChart |
| 7 | **bp-target-trial** | ~3 | `--` in doesNotProve, howToReadChart ×2 |
| 8 | **sparcl-trial** | ~2 | `--` in bedsidePearl; `—` implicit in other fields |
| 9 | **socrates-trial** | ~2 | `--` in bedsidePearl, howToReadChart |
| 10 | **escape-na1-trial** | ~2 | `--` in bedsidePearl, howToReadChart |

---

## 7. Pattern-Level Observations (Template-Source Issues)

These recurring patterns suggest they originated in a shared writing template or single-session authoring pass. Fixing the pattern once eliminates multiple instances.

### Pattern 1 — W6.6.3 Batch 5C/5D double-hyphen template (highest priority)

**Affected trials:** decimal-trial, destiny-trial, hamlet-trial, destiny-ii-trial, timing-trial, optimas-trial  
**Affected fields:** `doesNotProve`, `cautions`, `bedsidePearl`, `howToReadChart` answers  
**Pattern:** `"The primary endpoint -- mRS [X] at [Y] months -- was not statistically significant..."`  
**Fix:** Replace all `--` with `,` (recast the clause) or restructure the sentence to remove the parenthetical. This was a batch-wide authoring artifact from the W6.6.3 sessions (Batches 5C and 5D committed 2026-04-27).

### Pattern 2 — Antiplatelet section double-hyphen (second pass needed)

**Affected trials:** eagle-trial, escape-na1-trial, socrates-trial, sps3-trial, sparcl-trial  
**Affected fields:** `bedsidePearl`, `doesNotProve`, `howToReadChart`  
**Pattern:** `"[X] did not prove [Y] -- [Z] remains standard."` and `"[X] showed [Y] -- do not [Z]."`  
**Fix:** Same approach — restructure or use colon/period.

### Pattern 3 — TRACE-III / THAWS true em dash pattern

**Affected trials:** trace-iii-trial, thaws-trial  
**Affected fields:** `bedsidePearl`, `doesNotProve`, `cautions`  
**Pattern:** `"[Trial] is not [X] — it is specifically [Y]."` using `—`  
**Fix:** Replace with period + new sentence, or restructure.

### Pattern 4 — "Essentially identical/equal" statistical qualifier

**Affected trials:** bp-target-trial, distal-trial, thaws-trial, enrich-trial, aramis-trial  
**Affected fields:** `howToReadChart`, `pearls`, `safetyProfile` tooltip  
**Pattern:** `"[X]% vs [Y]% — essentially identical/equal/unchanged"`  
**Fix:** "statistically indistinguishable" or "no meaningful difference" for clinical precision.

### Pattern 5 — `-- [What does that mean?]` in howToReadChart questions

**Affected trials:** timing-trial (lines 3856, 3860), eagle-trial (line 737)  
**Pattern:** Q&A question uses `--` after a quoted value as a rhetorical separator  
**Fix:** Use a period or colon before the actual question text.

---

*Audit produced: 2026-05-06. Read-only scan. No changes made to trialData.ts or any other file.*
