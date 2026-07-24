# Clinical review — PR #<imaging-read-ct-head>

**Decision:** block
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-13

> Supersedes the 2026-07-09 review on this same module. The block is materially
> narrowed: the four primary-study citations are now genuinely confirmed and the
> remaining gate is confined to ~9 unconfirmable references, hard-anchored by a
> confirmed-wrong skull-fracture accession (NBK470349) and an open 65-95 vs 50-70 HU
> discrepancy.

## Scope
- Claims touched: 37 (unchanged set). Re-assessed this pass: the 6 claims underwritten by the now-confirmed primary studies (`ct-search-pattern-accuracy`, `ct-brain-stroke-window-benefit`, `ct-window-stroke-detection`, `ct-brain-aspects-regions`, `ct-brain-insular-ribbon`, `ct-brain-loss-graywhite-early-infarct`) plus the 2 narrowed claims (`ct-blood-hyperdense-mca-sign`, `ct-cisterns-tonsillar-herniation`).
- Citations affected: 4 now CONFIRMED (`perron-bcbvb-ct-1998`, `mainali-stroke-windows-2014`, `barber-aspects-2000`, `truwit-insular-ribbon-1990`); 9 still unconfirmed (`riascos-herniation-radiographics-2019`, `statpearls-ich-imaging`, `statpearls-epidural-hematoma`, `statpearls-skull-fracture`, and the 5 `radiopaedia-*` entries).
- Surfaces changed: Structured data in `src/data/imaging/ctHead.ts` (§13.4 DATA_SURFACE). No JSX / computed-string / markdown surfaces.
- Evidence-verifier packet: `docs/evidence-packets/imaging-read-ct-head.md`, plus the 2026-07-13 PubMed source-confirmation pass recorded in the registry.ts CT-head header comment.
- Trial-statistician report: not applicable (educational interpretation module).

## Semantic validity
The clinical content remains sound and every non-negotiable hedge is still honored. The two narrowings improved the module: neither introduces drift, and both REMOVE prior overclaim.
- `ct-blood-hyperdense-mca-sign` — dropped "specific but relatively insensitive"; now "reflects acute thrombus within the vessel and can be an early sign of large-vessel occlusion." The residual overclaim from the prior review is resolved. Semantic content CONFIRMED clean.
- `ct-cisterns-tonsillar-herniation` — dropped the unconfirmed ">5 mm" figure; now definitional (inferior tonsillar displacement through the foramen magnum, cisternal effacement). No false precision remains. CONFIRMED clean.

Never-drift scan on the two narrowed and six confirmed-source claims: no recommendation-strength, action-verb, qualifier, certainty-marker, or temporal drift. The narrowings only reduced strength of assertion, which is safe.

Two minor editorial notes (not blocks): `ct-brain-loss-graywhite-early-infarct` generalizes Truwit's insular-specific "<6 hours" finding ("before frank hypodensity" is standard teaching but not in the Truwit quote); `ct-brain-normal-graywhite` maps to Truwit as a soft anchor (his quote concerns loss, not the normal relationship). Both are definitional and correct; refine at next audit.

## Citation accuracy
**Four primary studies — CONFIRMED this pass (block lifts for these):**
1. `perron-bcbvb-ct-1998` — PMID corrected 9795316 → **9795317** (old ID was an unrelated cardiac-arrest paper). quoted_text now carries the mnemonic and verbatim 60% (95% CI 58-64) → 78% (95% CI 75-81, P<.001). Framed as educational interpretation accuracy. CONFIRMED; last_reviewed honestly refreshed to 2026-07-13.
2. `mainali-stroke-windows-2014` — PMID 24967315 confirmed; journal corrected to ISRN Neuroscience; quoted_text "18% versus 70%; P < 0.0001" verbatim, matches the rendered surfaces. CONFIRMED.
3. `barber-aspects-2000` — quoted_text "ten regions of interest" verbatim; the region enumeration is universally established ASPECTS content. CONFIRMED.
4. `truwit-insular-ribbon-1990` — quoted_text "MCA strokes less than 6 hours old, loss of ... insular ribbon" verbatim; resolves the prior gray-white-timing gap. CONFIRMED.

**Confirmation step is demonstrably working — two provenance errors caught:** (a) the wrong Perron PMID (→ unrelated cardiac-arrest paper) and (b) the wrong `statpearls-skull-fracture` accession (NBK470349 → unrelated EMS-sleep chapter). Both are the confident-but-wrong failure mode §13.1 warns about, surfaced by genuine source resolution.

**Nine citations still gate merge:**
- `statpearls-skull-fracture` — **accession NBK470349 CONFIRMED WRONG**; correct chapter not yet sourced. Mandatory block (conditions #3/#4). Underwrites 6 of 7 bone claims and co-anchors a 7th. Hardest gate.
- `statpearls-ich-imaging` (NBK553103) — accession resolves, but an **open 65-95 vs 50-70 HU discrepancy**: source-of-record reports ~65-95 HU; the quoted_text and `ct-blood-acute-hyperdense-range` surface teach ~50-70 HU. Condition #4 until reconciled. last_reviewed correctly NOT refreshed.
- `riascos-herniation-radiographics-2019` — PMID 31589570 + identity confirmed, but quoted_text/figures NOT verbatim-confirmed (RSNA egress-blocked). Condition #3. Underwrites the 4 herniation claims.
- `statpearls-epidural-hematoma` (NBK518982) — identity + core content confirmed via search; full quoted_text not verbatim. Condition #3.
- 5 `radiopaedia-*` — not indexed in PubMed, egress-blocked, quoted_text search-derived. Condition #3. Underwrite the remaining blood/cisterns/ventricles/windowing claims.

## Editorial / expert context
Not applicable — no new trial entry. `trialData.ts` / `trialListData.ts` / `trialCatalogMeta.ts` untouched; mandatory-block #8 does not apply. The Mainali "stroke-window terminology misnomer" critique remains correctly reflected as the misnomer hedge in `ct-window-stroke-detection`.

## Freshness
- The 4 confirmed primary studies are dated 2026-07-13, within the 36-month window (§13.7), and the date now reflects a genuinely completed §13.6 confirmation. PASS.
- The 9 unconfirmed citations remain at 2026-07-09; the team correctly did NOT refresh these. However the 2026-07-09 date still asserts a §13.6 completion that has not occurred for these entries (for `statpearls-skull-fracture`, step 1 has actively FAILED). The integrity gap persists for the 9.

## Rationale
The source-confirmation pass did real work: corrected a wrong Perron PMID, exposed a wrong skull-fracture accession, verbatim-confirmed all four primary studies with honest date refreshes, and narrowed two claims to remove overclaim. The block LIFTS for the portion underwritten solely by the four confirmed primary studies, and the two narrowings are semantically clean. But the module ships as one unit and ~9 citations remain unconfirmable in this environment, two with active known-defects that are independent mandatory blocks (the wrong `statpearls-skull-fracture` accession; the 65-95 vs 50-70 HU discrepancy). Conditions #3 and #4 mandate block and forbid approve-with-conditions, so the disposition for merge-to-main stays **block** — a much narrower, well-scoped block than the 2026-07-09 version. Hold at `blocked:awaiting-clinical-review`.

## Required follow-ups (the now-smaller block-lifting condition — 5 items, all provenance, none clinical)
- **[Hard gate]** Source the correct StatPearls Skull Fracture chapter to replace NBK470349, verbatim-confirm quoted_text, complete §13.6. Do not guess the accession.
- **[Hard gate]** Reconcile `statpearls-ich-imaging`: re-source the 50-70 HU range to a citation that states it, OR align the quoted_text and `ct-blood-acute-hyperdense-range` surface to the source's 65-95 HU. Complete §13.6.
- Verbatim-confirm `riascos-herniation-radiographics-2019` quoted_text (or narrow the four herniation claims), then honestly set last_reviewed.
- Verbatim-confirm `statpearls-epidural-hematoma` quoted_text and refresh last_reviewed.
- Resolve the 5 `radiopaedia-*` citations: obtain egress and verbatim-confirm, or re-source each to a PubMed-indexed reference (Radiopaedia is not PubMed-indexed). Complete §13.6.
- Editorial (non-blocking): refine `ct-brain-loss-graywhite-early-infarct` wording and the `ct-brain-normal-graywhite` → Truwit soft mapping at the same audit.
- On reopen, verify the Wikimedia photo assets (`status: 'pending'`) have confirmed bylines/licenses before public render.
