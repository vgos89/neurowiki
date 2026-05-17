# Clinical review — Pattern A fix Tier 4 (EVT drawer migration)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-16

## Scope
- Claims touched: A1 basilar Rec 2 ("not well established"), A3 basilar mRS ≥2 IDD ("insufficient data to determine"), A9 core >100 mL SELECT2 safety caveat ("diminished treatment benefit" / "cerebral edema" / "hemicraniectomy"), A13 dominant M2 >6h ("benefits are uncertain"), B7 skip-IVT pearl ("a strategy to forgo (or 'skip') IVT to facilitate EVT is not recommended"). **No change to claim text; render-surface change only.**
- Citations affected: AHA/ASA 2026 §4.7.1 (skip-IVT), §4.7.2 (M2, core volume, basilar windows). No citation record edits.
- Surfaces changed: static JSX + structured-data result objects rendered into a drawer instead of an in-flow card. Both surfaces in §13.3 scanner coverage (Phase 1).
- Evidence-verifier packet: not applicable (no trial-data or statistics change).
- Trial-statistician report: not applicable.

## Semantic validity

**CLIN-2 verbatim phrase audit — all 7 confirmed present, preserved by construction:**

| # | Phrase | Location | Source path post-migration |
|---|---|---|---|
| 1 | "insufficient data to determine" | lines 328, 330, 643 | `result.reason`/`details`/`exclusionReason` from `calculateLvoProtocol` (A3) + `calculateMevoProtocol` (A13 fallback) — neither function touched. |
| 2 | "diminished treatment benefit" | line 588 (A9 exclusionReason) | `result.exclusionReason` from `calculateLvoProtocol` — untouched. |
| 3 | "cerebral edema" | lines 455, 536, 588, 1387, 1488 | Function output + static JSX in Step 3 imaging branches. |
| 4 | "hemicraniectomy" | lines 455, 536, 588, 1387, 1488 | Same provenance as #3. |
| 5 | "benefits are uncertain" | lines 641, 642, 643 | `result.reason`/`details`/`exclusionReason` from `calculateLvoProtocol` (A13). |
| 6 | "not well established" | line 364 (A1 basilar IIb branch) | `result.details` from `calculateLvoProtocol`. |
| 7 | "a strategy to forgo (or 'skip') IVT to facilitate EVT is not recommended" | line 1414 | Static JSX `content` prop on PathwayLearningPearl. |

**Mechanism of preservation:** Tier 4 changes *where* `result.reason` / `result.details` render (drawer `children` vs in-flow card), not *what* they contain. Interpretation functions are explicitly out-of-scope per the architect plan. Both `reason` and `details` render as plain text children in the existing in-flow card (line 1682–1684); drawer `children` slot accepts the same text-child render shape.

**Never-drift categories:** none touched. No recommendation strength changes, no action-verb alterations, no qualifier/gate moves, no certainty-marker adjustments, no temporal-constraint rewrites. Render-surface migration only.

**Question 2 — State B "provisional verdict" discoverability (the real clinical gate):**

Three findings:

1. **The 9e34761 intent** (per `docs/reviews/clinical-evt-post-exec-2026-05-16.md` follow-up #1) was to keep the Provisional banner *neutral slate* rather than tier-tinted, specifically because the post-exec reviewer flagged that "visual prominence borders on verdict-pill territory." Current implementation (lines 1339–1345) is `bg-slate-50 border-slate-200 text-slate-700` regardless of `result.status` — a "Provisional · Eligible" reads in slate, not green; "Provisional · Not Eligible" reads in slate, not red. **The slate-neutral treatment is the load-bearing clinical-UX decision.**

2. **CalculatorDrawer State B `stateBTappable: true` behavior** (component code lines 151–201): when State B is tappable, the drawer falls through into the State C render path and applies the full `tokens` bundle. There is **no neutralization** for State B when tappable. If the call site passes `tokens = TIER_TOKENS[evtStatusToTier(result.status)]` for State B the way `PathwayBottomDrawer` does for State C, a provisional "Eligible" verdict will render in neuro-blue chrome and a provisional "Not Eligible" will render in red chrome. **That re-introduces exactly the early-verdict anchoring the slate softening was designed to prevent.**

3. **Mitigating factor — Low/Eligible uses neuro-blue, not emerald.** `TIER_TOKENS.Low` (PathwayBottomDrawer:55–62) maps to neuro-200/50/700 — platform's primary blue, not a clinical success-green. Less stop-the-eye than emerald, but still tier-tinted chrome that signals "verdict" rather than "interim read." For `High` tier (Not Eligible / Avoid EVT), chrome is red-300/50/700 — unambiguously a verdict-style red, and a *provisional* red verdict at viewport-bottom carries the same anchoring risk the post-exec reviewer flagged.

Bottom-of-viewport drawer placement is not the problem — drawer position is well-established by 9 calculators. The problem is **tier-tinted chrome on a provisional verdict.** Conditions below resolve this without blocking the migration.

## Citation accuracy

No citation records touched. All 7 CLIN-2 phrases trace to AHA/ASA 2026 §4.7.1 / §4.7.2 per `docs/evidence-packets/2026-05-15-evt-pathway-aha-2026-PDF-VERIFIED.md`. Migration does not alter mappings, `quoted_text`, or `last_reviewed`.

## Freshness

No `last_reviewed` refresh required. CLIN-1 (registry refresh) remains deferred to W5.2 — not in scope.

## Rationale

CLIN-2 phrase preservation is structurally sound: interpretation functions are not modified, both `reason` and `details` render as plain text children today, and drawer `children` accepts the same shape. Approve on Question 1 with a verification condition.

Question 2 is the real gate. The 9e34761 commit established that provisional verdict chrome must be slate-neutral — a documented clinical-UX decision the post-exec reviewer signed off on five days ago. Tier 4 as planned routes State B through `stateBTappable: true`, which re-applies tier tokens. For tier = `High` (red) this materially re-introduces the early-verdict anchoring risk; for tier = `Low` (neuro-blue) it is softer but still verdict-shaped. Approve-with-conditions, with the conditions making State B presentation enforce neutral slate chrome regardless of underlying tier, mirroring the established 1339–1345 treatment.

## Required follow-ups (conditions for approve)

1. **State B drawer must use slate-neutral chrome, not tier-tinted chrome.** When the drawer renders State B (LVO + time + mRS decided, imaging not complete), the call site must pass either `tokens = TIER_TOKENS.Negative` (the slate-neutral mapping at PathwayBottomDrawer.tsx:79–86) OR an inline equivalent token bundle. **Do not pass `TIER_TOKENS[evtStatusToTier(result.status)]` for State B even when `stateBTappable: true`.** Acceptance check: scenario LVO=yes, time=0-6h, mRS=0-1, no imaging entered → drawer in `bg-white` / `border-slate-200` / `text-slate-900`; never `bg-neuro-50`, never `bg-red-50`, never `bg-amber-50`. State C (full imaging entered) retains tier tokens as planned. Resolution: one ternary at the EVT call site selecting `TIER_TOKENS.Negative` vs `TIER_TOKENS[evtStatusToTier(result.status)]` based on `is_imaging_complete`.

2. **Collapsed-stat prefix for provisional state must carry "Provisional".** The drawer's `collapsedStat` for State B must begin with the word "Provisional", matching line 1343 banner. Recommended format: `Provisional · ${result.status} — complete imaging to confirm` (or `Provisional · ${result.status}` if stat width constrained). Acceptance check: drawer collapsed text in State B begins with "Provisional"; in State C it does not.

3. **Verify CLIN-2 phrases in implementation diff before commit.** Re-grep the 7 phrases in post-migration `EvtPathway.tsx`; confirm each appears at least once at its source-of-truth location (table above). If `autoLinkReactNodes` is reused for `result.details` in the drawer, confirm the helper does not split or modify text content. Substrings "(or 'skip')" and "is not recommended" must round-trip cleanly through any rendering helper applied. Resolution: orchestrator runs grep as pre-commit verification, records result in PR body (architect condition 6).

4. **Preserve learning-pearl B7 verbatim.** Phrase #7 lives in static JSX (`content=` prop on PathwayLearningPearl at line 1414), not in the result object. Confirm Tier 4 does not move or refactor the B7 pearl mount point such that the `content` string is re-templated. Pearl is independent of the drawer migration but lives in the same file.

If conditions 1 and 2 are satisfied, the State B discoverability concern is resolved and the migration ships without re-opening the 9e34761 question. If condition 1 cannot be met within `CalculatorDrawer`'s current API (i.e., it forces State C rendering when `stateBTappable: true`), escalate back — do not paper over by accepting tier-tinted provisional chrome.

---

**Files inspected:**
- `docs/reviews/arch-pattern-a-fix-tier-4.md`
- `docs/reviews/clinical-evt-post-exec-2026-05-16.md`
- `src/pages/EvtPathway.tsx` (lines 96–111, 298–307, 328–330, 364, 455, 536, 588, 635–643, 770–820, 900–960, 1339–1345, 1387, 1414, 1488, 1625–1690, 1810–1830)
- `src/components/calculators/CalculatorDrawer.tsx`
- `src/components/pathways/PathwayBottomDrawer.tsx`
- `src/lib/calculators/severityTokens.ts`
