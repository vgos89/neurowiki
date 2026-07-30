# Clinical review — §4.7.3 posterior-circulation guideline-mirror correction

**Decision:** approve-with-conditions (all conditions cleared before commit)
**Reviewer:** clinical-reviewer, two fresh-context rounds
**Date:** 2026-07-23

## Scope
- **Claims touched:** `basilar-evt-guideline-summary` (re-pointed to two citations).
- **Citations affected:** `aha-asa-2026-4.7.3` (quoted_text replaced, `last_reviewed` + `review_window_months` set), `aha-asa-2026-4.7.3-nihss-6-9` (new).
- **Surfaces changed:** the guideline mirror and its take-home array (rendered via the guideline mindmap), the mindmap node description, string literals feeding both the JSON-LD FAQPage and the visible FAQ accordion on `/pathways/evt`, the citation registry, the claim registry.
- **Evidence:** `docs/evidence-packets/2026-05-15-evt-pathway-aha-2026-PDF-VERIFIED.md` §4.7.3 + Figure 3 (page e61).

## The defect
`src/data/aha2026StrokeGuideline.ts` rendered §4.7.3 as two recommendations split by **time window** (COR 1 / LOE B-R within 6 hours; COR 2a / LOE B-R for 6 to 24 hours) and omitted PC-ASPECTS entirely.

The guideline stratifies by **stroke severity** across a single 24-hour window, and grades the main stratum **Level A**, not B-R:
- **COR 1 / LOE A** — basilar occlusion, baseline mRS 0 to 1, NIHSS ≥10, PC-ASPECTS ≥6, EVT within 24 hours from symptom onset is recommended.
- **COR 2b / LOE B-R** — same, NIHSS 6 to 9, effectiveness within 24 hours is not well established.

Figure 3 assigns basilar occlusion with prestroke mRS ≥2 to *insufficient data to determine*.

**Why it mattered beyond itself:** this file's own header designates it a validation reference that all stroke content must be checked against. During the trial-library audit it produced a **false positive** that nearly caused a correct Study Mode pearl (which rightly says Class 1, LOE A) to be downgraded. The yardstick was the thing that was wrong.

## What was corrected
The wrong split had propagated to four surfaces, all fixed:
1. The mirror's `posteriorCirculation` array, replaced with both recommendations verbatim at COR 1 / LOE A and COR 2b / LOE B-R.
2. The mirror's plain-language take-home line (a second location in the same file carrying the same defect).
3. The guideline mindmap node description. The node also renders the recommendation rows, so it inherits fix 1 automatically.
4. The public structured-data answer, where basilar had been bundled with the anterior-circulation 6-hour rule.

Round 1 blocked and found three more, two of them introduced by the fix itself:
- **Dropped eligibility gate.** Two newly authored strings omitted `baseline mRS 0 to 1`, extending a Class I recommendation to a population the guideline assigns to *insufficient data to determine*, and contradicting the EVT pathway calculator on the same site. Restored.
- **A public FAQ still said EVT "can be considered"** for basilar occlusion, the canonical Class IIb locution, on what is the strongest recommendation in the section. Rendered both as visible accordion text and as machine-readable JSON-LD. Corrected to the two-stratum statement.
- **The same FAQ still kept basilar inside the anterior 6h/6-24h architecture** with the population widened to mRS 0-2. Basilar split out into its own single 0-24 hour window with the correct gates.
- **The citation record was a paraphrase** that dropped the mRS gate, omitted the NIHSS 6-9 stratum entirely, and terminated `(Class I, Level A)` — a format the guideline card's anchored regex does not match, so the public card at `/trials/q/basilar-evt` rendered **no strength badge at all** and left the parenthetical dangling. Replaced with the packet's verbatim text plus a matching terminator, and the second stratum registered as its own citation.

**Registering two citations rather than concatenating was deliberate.** The card's regex reads only the last trailing parenthetical, so a concatenation would have badged the whole card COR 2b and buried the Class I stratum.

## Semantic validity
Both `quoted_text` strings were verified **character-exact** against the packet by anchored regex match in both files, with only the documented COR terminator appended. The badge regex was traced by hand and resolves them to COR 1 / LOE A and COR 2b / LOE B-R respectively; the strip regex removes exactly the terminator and cannot cross the parenthesis in "(mild ischemic damage)". Two rows on one card render Class I above Class IIb, each with its own population string and badge, which conveys the stratification rather than a contradiction.

All 21 files in `src/` mentioning basilar were checked. No surface still states the old 6h/6-24h COR split. Trial-window descriptions (ATTENTION ≤12 h, BAOCHE 6-24 h) are correct enrollment windows and were not flagged.

**Nothing downstream had been downgraded** on the strength of the wrong mirror. The trial pages, claim records and Study Mode pearls all asserted Class I / Level A throughout; only the yardstick was wrong.

## Freshness
Both citations `last_reviewed: 2026-07-23` with `review_window_months: 3` per §13.7 (thrombectomy indications are a rapidly evolving area), the stricter choice over the 6-month guideline default.

Refreshing was appropriate: this was not a date flip but a material replacement of the quoted text with PDF-verbatim source, plus registration of a second stratum. **Step 3 of the §13.6 checklist is recorded as PARTIAL, not complete** — four claims map to this citation and only `basilar-evt-guideline-summary` was re-pointed. The three Study Mode pearl claims assert Class 1 / LOE A without the baseline mRS 0-1 gate that the refreshed quoted_text now carries verbatim. That divergence is pre-existing, was exposed rather than created here, and is tracked as the highest-priority follow-up. The inline registry comment states this explicitly rather than implying all dependents passed.

## Condition status (all cleared before commit)
- **C1 CLEARED** — temporal anchor "from symptom onset" restored on the Class I stratum in both newly authored strings. The NIHSS 6-9 clauses were left unanchored, matching the source.
- **C2 CLEARED** — the §13.6 comment now enumerates all four dependent claims, marks step 3 PARTIAL, names the three divergent pearls, and records step 6 dual sign-off.
- **C3 CLEARED** — this artifact.
- **C4** — Gate 6 to confirm both rows on `/trials/q/basilar-evt` and the corrected FAQ text on `/pathways/evt`, after the full prerender window.

## Required follow-ups (tracked in TASKS.md)
- **`basilar-mrs-gate-followup` (highest priority).** Three Study Mode pearls plus three further public surfaces state the basilar Class I recommendation without the baseline mRS 0-1 gate: `strokeClinicalPearls.ts` (three strings), `guideContent.ts` ("Strong evidence for EVT up to 24 hours"), `pages/guide/Thrombectomy.tsx` ("Basilar: EVT up to 24 h", conspicuous because every sibling statement on that page carries COR and gates), and `seo/routeMeta.ts` (renders as a search-result snippet). This is the same clinical error class that justified the original block and now sits in direct tension with the verbatim quoted_text of its own mapped citation.
- Strength/label mismatch in the BAOCHE record: "EVT **is reasonable** for BAO 6-24h … (§4.7.3 **COR 1**)" pairs a Class IIa verb with a Class I label.
- The guideline card header renders "(N sections)" when two citations share a section; should read "recommendations".
- Add the guideline mirror and the SEO schema file to the humanizer scanner targets; both are rendered authored-prose surfaces currently outside the hook.
- Claim-surface tagging gap: neither the mirror's recommendation arrays nor its take-home array carries a `claimId`, and the take-home array is a flat `string[]` with no slot for one. Roughly 95 recommendations are affected. This is the mechanism by which a wrong recommendation sat undetected in a designated validation reference. Needs a tagging strategy for flat clinical string arrays.
- Wrong section number in an EVT pathway code comment (§4.7.2 cited for a §4.7.3 branch); comment only, not rendered.
- Migrate AHA-2026 citation URLs from the science-news landing page to the DOI (systemic across all AHA-2026 entries).
