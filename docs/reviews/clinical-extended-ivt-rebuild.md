# Clinical review — Pattern A fix · ExtendedIVTPathway rebuild (Commit 2)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-17

## Scope
- Claims touched: CLIN-2 ExtendedIVT corpus (34 verbatim phrases — see audit table). **No change to claim text; render-surface change only** (in-flow Section 3 result cards → CalculatorDrawer State C children; auto-time-badges re-skinned to §4.7 Outcome Row anatomy).
- Citations affected: AHA/ASA 2026 §4.6.2 (agent choice), §4.6.3 Rec 1/2/3 (extended-window IVT), WAKE-UP (Thomalla NEJM 2018), THAWS (Koga Stroke 2020), EXTEND (Ma NEJM 2019), EPITHET (Davis Lancet Neurol 2008), ECASS-4 (Ringleb Int J Stroke 2019), TIMELESS (Albers NEJM 2024), TRACE-III (Xiong NEJM 2024). No citation record edits.
- Surfaces changed: static JSX (Section 3 decision card chrome), structured-data `result.reason`/`details` strings rendered into drawer State C children, auto-time-badge visual chrome (lines 889–904, 955–973).
- Evidence-verifier packet: `docs/evidence-packets/2026-05-15-extended-ivt-pathway-aha-2026-PDF-VERIFIED.md`.
- Trial-statistician report: not applicable.

## Semantic validity

**Q1 — CLIN-2 verbatim phrase preservation.** `result` useMemo at lines 376–475 is byte-for-byte unchanged; render target moves from in-flow card (lines 1192–1204) to `CalculatorDrawer` State C children. 34-phrase audit confirms all preserved by construction.

Full audit table (abbreviated; see review prompt for line citations):

| # | Phrase | Provenance |
|---|---|---|
| 1–7 | Standard / outside / lkw-required path verdicts | `result.reason`/`details` (useMemo untouched) |
| 8–13 | Path A WAKE-UP/THAWS criteria + DWI-FLAIR semantics | useMemo |
| 14–20 | Path B EXTEND core/mismatch criteria + B→EVT redirect | useMemo |
| 21–27 | Path C 9–24h LVO criteria + TRACE-III/TIMELESS framing | useMemo |
| 28 | WAKE-UP pearl ("Thomalla et al., NEJM 2018... 53.3% vs 41.8%") | `LearningPearl.content` prop |
| 29 | EXTEND pearl ("Ma et al., NEJM 2019... adjusted RR 1.44 (95% CI 1.01–2.06; P=0.04). NNT ≈ 17") | Pearl content prop |
| 30 | Path C Trials pearl ("TRACE-III's inclusion was restricted to ICA/M1/M2... TIMELESS... was negative when rapid EVT was available") | Pearl content prop |
| 31 | DWI-FLAIR / Late IVT vs Rapid EVT / Pathway Selection / Standard IVT Protocol pearls | Pearl content props |
| 32 | §4.6.2 TNK-preferred tooltip ("Within 4.5h of symptom recognition — §4.6.2 Rec 1 applies") | Static JSX `title` |
| 33 | §4.6.3 agent-neutral tooltip ("AHA 2026 §4.6.2 Rec 1 scopes TNK preference to <4.5h; §4.6.3 (4.5h+) is agent-neutral. Extended-window evidence (EXTEND, EPITHET, ECASS-4) is alteplase-based.") | Static JSX `title` |
| 34 | COR 2b advisory ("COR 2b — document shared decision-making with patient/surrogate before administration") | Static JSX |

**Cross-check against evidence packet:** WAKE-UP 53.3% vs 41.8% confirmed (p. e44); EXTEND 35.4% vs 29.5%, adjusted RR 1.44 (1.01–2.06), P=0.04 confirmed (p. e44); TRACE-III ICA/M1/M2 restriction confirmed (p. e45); TIMELESS negative-with-rapid-EVT framing confirmed (p. e45).

**Never-drift categories:** none touched. COR strengths, action verbs ("IVT is reasonable" / "may be considered" / "should not be endorsed"), qualifiers/gates (MCA-1/3, core <70 mL, mismatch >10 mL + ratio >1.2, all time windows), certainty markers, and temporal constraints preserved at source.

**Q2 — TRIALS registry byte-for-byte preservation.** Lines 50–58 verified, matches corrections from f6426a2 and c44f92f:
```
'WAKE-UP':  NEJM 2018, cor 2a
'THAWS':    Stroke 2020, cor 2a
'EXTEND':   NEJM 2019, cor 2a
'EPITHET':  Lancet Neurol 2008, cor —
'ECASS-4':  Int J Stroke 2019, cor —
'TIMELESS': NEJM 2024, cor —    (correctly NEGATIVE-not-2b)
'TRACE-III': NEJM 2024, cor 2b   (correctly maps §4.6.3 Rec 3 strength)
```
`trialList(names)` at lines 146–151 is a pure projection; round-trip preserved.

**Q3 — `getPathStage` + `result` useMemo preservation.** Lines 80–144 and 376–475 explicitly out-of-scope per architect condition 7. Path enum `'A' | 'B' | 'C-LVO'` and `IVTResultFull` shape unchanged. External `IVTResult` consumers will not regress.

**Q4 — Drawer States A + C only, no State B.** Re-checked `getPathStage` and `result` useMemo for any intermediate state where direction is determinable before all criteria complete. The redirect cases (`standard`/`outside`/`lkw-required`) produce terminal verdicts immediately on setup completion — these are not provisional reads. Path A/B/C proper `result` is `null` until full path-specific question chain completes. **There is no intermediate state where a clinician would benefit from a provisional read.** Absence of State B is clinically appropriate and legitimately differs from Tier 4 EVT in this respect.

`CalculatorDrawer` (lines 83/117/151) supports A→C transitions cleanly without state B being passed.

**Q5 — Auto-time-badge re-skin.** Wake-recognition badge (lines 889–904) and sleep-midpoint badge (lines 955–973) currently render emoji glyphs (✅/❌). Underlying calculations performed in earlier `useEffect` blocks (lines 280–305 timers + 308–311 auto-set `aRecognition`) — these are out-of-scope for this rebuild.

Clinical signal under re-skin: emerald/red color (token-cued) preserved; "Within window" / "Outside window" plain-text label preserved (encodes clinical signal — emoji is decorative); icon (`Check` / `AlertTriangle`) preserves binary good/bad semantic; numeric callouts (`{N} min since waking`, `{N}h elapsed`) preserve live count. Replacing emoji with Lucide icon at §4.7 Outcome Row anatomy retains all four signal carriers.

Acceptable provided icon + token-color BOTH render (icon-only fails fast scan; color-only fails accessibility).

## Citation accuracy

No citation records touched. All 34 CLIN-2 phrases trace to AHA/ASA 2026 §4.6.2/§4.6.3 plus underlying trials per evidence packet. Migration does not alter `quoted_text` or `last_reviewed`. TRIALS registry corrections (f6426a2, c44f92f) remain intact.

## Freshness

No `last_reviewed` refresh required. CLIN-1 remains deferred.

## Rationale

CLIN-2 preservation structurally sound: `getPathStage` and `result` useMemo out-of-scope (architect condition 7); TRIALS registry explicitly preserved (condition 5); pearl `content` props byte-for-byte copies during LearningPearl → PathwayLearningPearl primitive swap. Render-surface migration only.

Q4 (State A + C only) is clinically correct for ExtendedIVT — `result` only computes when full path-specific question chain completes, no intermediate informative state.

Q5 (auto-badge re-skin) acceptable provided icon + token-color both render.

Approve-with-conditions.

## Required follow-ups (conditions for approve)

1. **CLIN-2 verbatim verification pre-commit.** Re-grep the 34 phrases against post-rebuild `ExtendedIVTPathway.tsx`. Each must appear ≥1 at source-of-truth location. Record results inline in PR body under `CLIN-2 phrase verification` block. Orchestrator runs grep as pre-commit verification.

2. **TRIALS registry block-quote in PR body.** Per architect condition 5: include full TRIALS object (lines 50–58) verbatim in PR body under `TRIALS preservation` block.

3. **Auto-time-badge re-skin — both icon AND token color required.** Render Lucide icon (`Check` within, `AlertTriangle` outside) AND token-cued color (emerald-50/400 within, red-50/400 outside) AND existing plain-text label ("Within 4.5h — {N} min since waking" / "Outside window — {N} min since waking" / "Within 9h of sleep midpoint — {N}h elapsed" / "Outside EXTEND window — {N}h since sleep midpoint"). Three signal carriers, not two.

4. **Underlying calculation preserved unchanged.** State in PR body: "Auto-time calculation logic (lines 280–311) untouched — only visual chrome at 889–904 and 955–973 changes."

5. **State A / C-only drawer composition declared in PR body.** Per architect condition 2: state explicitly "Drawer renders State A (pending criteria) and State C (full verdict) only. No State B — `result` is `null` until path-specific criteria complete, so there is no provisional-verdict surface to render. This differs from Tier 4 EVT and is correct for ExtendedIVT."

6. **Pearl primitive swap preserves `content` prop verbatim.** Six `LearningPearl` call sites (lines 815, 913, 937, 995, 1037, 1064, 1256) become `PathwayLearningPearl`. Each `content` string copied byte-for-byte. Special attention to pearl #30 (Path C Trials at line 1064) — long multi-sentence content with trial-population qualifiers. Grep verification: "TRACE-III's inclusion was restricted to ICA/M1/M2" and "TIMELESS (NEJM 2024) was negative when rapid EVT was available" both present post-rebuild.

7. **Embedded-consumer regression check.** State in PR body: "External embedders consuming `IVTResult` are unaffected; result-object shape unchanged. `onResultChange` callback at lines 480–487 still receives unchanged `result.eligible`/`cor`/`path`/`trialsBasis`."

---

**Files inspected:**
- `docs/reviews/arch-extended-ivt-rebuild.md`
- `docs/reviews/clinical-pattern-a-fix-tier-4.md`, `clinical-pattern-a-fix-tier-5.md`
- `docs/evidence-packets/2026-05-15-extended-ivt-pathway-aha-2026-PDF-VERIFIED.md` (pp. e38–e45 PDF-verified)
- `src/pages/ExtendedIVTPathway.tsx` (full file scan; line citations in audit table)
- `src/components/calculators/CalculatorDrawer.tsx` (State A/B/C branches; confirms A→C transition without B)
