# Clinical review — Step 4 rationale humanizer (em-dash sweep)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-acting)
**Date:** 2026-05-24

## Scope

Three em-dash punctuation changes inside Step 4 admit-orders clinical rationale strings, flagged by the PM-spec audit (commit 5bf4d01) as the only D-clinical residue from the chassis sweep.

- Claims touched: 3 (post-tPA BP target rationale, DVT prophylaxis rationale, intensive-glucose-control rationale)
- Citations affected: none (every COR/LOE/§-reference/trial name preserved byte-identical)
- Surfaces changed: `src/components/article/stroke/CodeModeStep4.tsx` — 3 string literals inside the `ORDERS` array
- Evidence-verifier packet: not applicable — no new trial, citation, or claim; pure punctuation rewrite
- Trial-statistician report: not applicable — no statistics changed

## Semantic validity

Each change replaces an em-dash with semicolon + clarifying clause or parentheses. Clinical meaning preserved verbatim. Diff is character-precise:

### Change 1 — Line 121 (post-tPA BP rationale)

Before: `...(COR 3: No Benefit, LOE B-R per §4.3 #8) — no functional benefit per ENCHANTED. For successfully recanalized...`

After: `...(COR 3: No Benefit, LOE B-R per §4.3 #8); ENCHANTED found no functional benefit. For successfully recanalized...`

Substantive content: COR 3 / No Benefit / LOE B-R / §4.3 #8 / ENCHANTED trial / "no functional benefit" — all preserved.

### Change 2 — Line 256 (DVT prophylaxis rationale)

Before: `...IPC reduced DVT from 12.1% to 8.5% (ARR 3.6 percentage points, ~30% relative reduction) — safe immediately post-tPA (AHA 2026 §5.4 #1, COR 1 LOE B-R). Start pharmacologic...`

After: `...IPC reduced DVT from 12.1% to 8.5% (ARR 3.6 percentage points, ~30% relative reduction); IPC is safe immediately post-tPA (AHA 2026 §5.4 #1, COR 1 LOE B-R). Start pharmacologic...`

Substantive content: CLOTS-3 trial / IPC / 12.1% / 8.5% / ARR 3.6 / ~30% RR / AHA 2026 §5.4 #1 / COR 1 LOE B-R / "safe immediately post-tPA" — all preserved.

### Change 3 — Line 296 (intensive glucose control rationale)

Before: `Do NOT target 80–130 mg/dL with IV insulin — COR 3: No Benefit, LOE A (SHINE trial). Top Take-Home #9:...`

After: `Do NOT target 80–130 mg/dL with IV insulin (COR 3: No Benefit, LOE A per the SHINE trial). Top Take-Home #9:...`

Substantive content: "Do NOT target 80–130 mg/dL with IV insulin" / COR 3 / No Benefit / LOE A / SHINE trial / "Top Take-Home #9" — all preserved.

## Citation accuracy

Every citation reference inside the three rationale strings is unchanged: AHA 2026 §4.3 #7, §4.3 #8, §4.3 #10, §4.5 #1, §5.4 #1, §5.4 #2, ENCHANTED, CLOTS-3, SHINE, Top Take-Home #9. Numeric values (12.1%, 8.5%, 3.6, 30%, 140, 180, 80, 130) all preserved.

## Editorial / expert context

Not applicable — this is a punctuation cleanup, not a new trial entry or interpretation change.

## Freshness

No citation freshness window affected. The 3 claims this prose supports are not in CLAIM_REGISTRY (Step 4 admit-orders use embedded rationale strings, not the centralized claim registry — that's tracked separately as a registry-coverage gap, not by this PR).

## Rationale

Em-dash overuse is a recognised AI-fingerprint pattern (humanizer skill, Wikipedia "Signs of AI writing"). Replacing them with the punctuation actually meant (semicolon + clarifying clause, or parentheses) improves readability without touching clinical content. Each rewrite preserves every clinically-meaningful token (drug name, threshold, citation, COR/LOE/trial reference, percentage, mg/dL value). The risk surface is zero: no clinician acting on the after-text reaches a different conclusion than one acting on the before-text.

## Required follow-ups

- None for this PR.
- Tracked for future: Step 4 admit-orders rationale strings should be migrated into CLAIM_REGISTRY so they participate in `last_reviewed` freshness tracking and the `check:claims` hook. Currently they are embedded prose strings without registry coverage. This is a separate sweep (Class D, registry expansion) and out of scope here.
