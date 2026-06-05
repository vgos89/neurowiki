# Clinic Headache Pathway — max-effort audit (4 lenses)

**Type:** Audit (report-only). NOT a PR review. No code changed.
**Commissioned by:** V — "make it user-friendly / a real pathway; it must give a *probability* matched to ICHD-3, not definitively tell the user the diagnosis. Audit at max effort to find what prior Opus builds missed."
**Reviewers:** ui-architect (design) · mobile-first-developer (UI/UX usability) · medical-scientist (clinical content & accuracy) · system-architect (structure & governance). All run at model `opus`, in parallel, fresh-context.
**Synthesis:** orchestrator (PM).
**Date:** 2026-06-03
**Surface:** `/pathways/headache-clinic` — `src/pages/ClinicHeadachePathway.tsx` (~1085 lines) + `src/data/clinicHeadacheData.ts` (829 lines, pure evaluator).

---

## Root cause (all four lenses converge here)

**The pathway was built against the wrong contract.** Two headache-SPECIFIC specs exist and were clinical-reviewer-routed:
- `docs/specs/headache-pathway-pm-spec-2026-05-25.md` (UX/PM contract)
- `docs/specs/ichd3-classifier-spec.md` (clinical contract)

The live page header comment (lines 1–24) states it follows the **generic** `docs/specs/PATHWAY_SPEC.md` v1.5 + "EVT canary pattern" — and reuses the generic stroke/EVT pathway primitives verbatim. It cites **neither** headache-specific spec. The approving architect artifact (`docs/reviews/arch-headache-pathway-canonical-2026-05-25.md`) likewise chose PATHWAY_SPEC and never names the two headache specs.

Per CLAUDE.md §3 (scope beats recency; a generic source does not override a domain-specific one absent explicit supersession-by-ID), **the two headache-specific specs govern.** `PATHWAY_SPEC.md` (scope line 7) makes no precedence claim over them. The headache specs were authored, then **not implemented** — the page ships the stroke-triage interaction model wearing a headache label. This is the structural reason V keeps finding it "not a real pathway," and it is the parent of every finding below.

**Governance action required (V decision per §3):** confirm the two headache-specific specs govern, and commit that resolution before any rebuild code. V's commission ("use the PM spec… turn it into a pathway") already selects them; this records it.

---

## Findings by lens (ranked; file:line cited)

### A. Clinical content & accuracy — *the lens that answers V's core question*

> **Verdict: the tool currently oversteps toward "the answer," not "a probability to hone in on."** Compliant strings exist ("Features consistent with X", "the diagnosis remains a clinical judgement") but are subordinated to a confident, color-coded, percentage-bearing single-winner card.

1. **[PATIENT-SAFETY — blocks current build] The mandatory secondary-headache (SNNOOP10) disclaimer is missing from the result.** Spec §0.5/§5 require a non-collapsible dangerous-mimic backstop on *every* result. The full workup content (`workupNotesForFlags`, page lines ~1088–1115) renders **only when a red-flag chip was already ticked.** A clinician who completes the interview and lands on "Features consistent with Migraine without aura" sees only a one-line footer (line 773) — never the "exclude SAH / GCA / CVT / mass before accepting this" screen, at the exact moment it matters most.
2. **Single-winner card + no "reconsider" control = the anchoring trap V forbade.** The headline (lines 735–777) renders `topMatch` alone. The §0.4 equal-prominence "This doesn't match — reconsider" control does not exist anywhere in the file. The §0.3 top-2 side-by-side matched/unmatched table is not built.
3. **The "· NN%" is a criteria-checklist fraction mislabeled as a diagnostic likelihood.** `percent = round(criteriaMet / criteriaTotal * 100)` (lines 719, 791), shown in a box titled "Differential ranking" with "Higher percentages indicate stronger criterion fulfilment" (line 837). Not calibrated, not Bayesian, ignores pre-test probability, weights a met exclusion ("no vomiting") equal to a met pain feature. "Migraine without aura · 100%" reads as near-certainty. **Single most important framing fix: the percentage must go.**
4. **The definitional gate silently DROPS near-miss phenotypes** (lines 736–743: any failed `definitional` criterion → `continue`), discarding their unmatched criteria — contradicting §0.3/§3's requirement to show *why* a candidate doesn't fit. Concrete harm: a cluster patient seen **between bouts** (the stated clinic use case) who can't confirm 15–180-min attack length fails `cluster-B` and cluster headache **vanishes with no trace.** Resolution: demote ("considered — needs confirmation of [criterion]"), don't delete.
5. **The ICHD-3 engine itself is largely faithful** (the 2026-05-27 per-criterion definitional work and the 2026-05-25 Chronic-migraine §1.3 gap fix are genuinely good). Temporal constraints that chips can't represent (NDPH "within 24h"; bout frequency) are handled *honestly* — criterion text preserved, clinician-confirmation flagged. **This is a framing rebuild, not a logic rebuild.**
6. Minor: option labels leak guideline reasoning into patient-facing text (e.g. line 111); copy-to-clipboard string (line 317) drops the strength qualifier — a partial match copies identically to a full match.

### B. Design (visual / layout / spec-fidelity)

1. **[critical] The result lives in the wrong container.** The 6 approved mockups (frame5 lines 203–318, frame6 lines 270–357) put the entire result *inside* the bottom drawer (State C); the live page dumps all management into a static body `<section>` (lines 695–1038) and leaves the drawer nearly empty (fed only a summary, lines 371–390). This recreates the literal §4 anti-pattern "management as a static text block at the bottom of the page" (§5.5 violation).
2. **[critical] Single dominant headline + percentage bar reads as a diagnosis** (lines 713–777). One large emerald card + filled bar is the universal UI grammar for "you got it." Visual hierarchy fights the "consistent with" copy. No mockup contains this percentage card.
3. **[high] Question screens re-create the >5-equivalent-elements density anti-pattern** (§4 line 50). Step 3 = 4 category accordions that each expand to 3–4 option rows + completed rows + branch chips ⇒ 15+ selectable elements on one screen.
4. **[high] No dominant primary action anywhere** (§5.2). Zero forward CTAs — progression is implicit via accordion auto-collapse. The only colored button is header "Copy."
5. **[med-high] Differential ribbon (lines 784–840) + multi-diagnosis banner (lines 847–886) appear in NO mockup** — they stack up to six pseudo-percentage bars on the result.
6. **[med] Differential bar colored by `matchStrength`, not by value** (lines 725–729) — contradicts §7.3 (emerald ≥80 / amber 40–79 / slate <40) and breaks aria-live "differential while mapping."
7. **[med] `border-2` token violation** on result cards (lines 673, 736) — house style is single hairline `border`.
8. **[med] Cascade-clear notice is hard-wired under Step 1** (lines 430–440) regardless of which step was edited; Undo only dismisses (line 437), does not restore wiped downstream answers (§3.6 contract).

### C. UI/UX usability (interaction at the bedside, 375px)

1. **Single-question rule violated on every step** (§5.4) — it is a 9-field intake form wearing a pathway costume. Step 2 = 3 questions, Step 3 = 4, Step 4 = 2+.
2. **Red-flag screen is a 12-item tap-to-select pick-list** (`RED_FLAGS` lines 46–59 via `PathwayMultiCheckRow`) — should be read-then-decide: a readable list + two buttons ("None present — continue" / "One or more — workup") per §5.3. The mockup frame1 (lines 311–385) itself bakes in the wrong pattern, so the build was faithful to a broken mockup.
3. **Tap/time verdict: FAIL.** Fastest no-mistake path ≈ **19 taps** vs the ≤6-tap / ≤90-second budget (§3) — ~3× overrun; §4 ">2 minutes for Scenario B" violated.
4. **Result is a dense stack, not a fast read.** Phenotype appears in *two* places (body card + drawer) with different wording; clinician cannot answer "most-likely / runner-up / probability-not-verdict / what-next" in <5 s.
5. **Cascade-clear is brutal** because steps are bundled — one upstream edit wipes up to 8 selections (lines 280–308).
6. **Scenarios A (power-user fast-exit) and C (Teach mode) are entirely absent** from the build (§3/§5/§6).

### D. Structure & governance

1. **Spec-governance miss** (root cause, above) — the page is built to the wrong contract; resolve before code.
2. **The evaluator's drop-everything design actively blocks the spec's signature feature.** `evaluateHeadachePhenotypes()` (`clinicHeadacheData.ts:697–814`) runs **six sequential `continue` drop-gates** + two post-loop splices; each removes the phenotype *and its `missingCriteria`*. The §3 top-2-with-unmatched-criteria display is therefore unrecoverable from the current output shape.
3. **Suppression-mechanism sprawl past its own warning.** The code comment at lines 137–157 says "do NOT add a fifth suppression mechanism without considering unification first." The 2026-05-27 `definitional` gate was the fourth mechanism; the rebuild is where unification belongs.
4. **Separation of concerns is otherwise clean** — the evaluator is React-free/JSX-free (§17.1 hard rule), fully reusable by a new UI and by Vitest. Minor boundary leak: `displaySection`/`PROBABLE_SECTION_FOR` relabel logic (lines 780–782) is presentation policy living in the data layer — note, don't block.
5. **Recommended evaluator shape: stop dropping; rank-and-flag.** Add `definitionallyExcluded: boolean` + `exclusionReason?` to each `PhenotypeMatch`; always surface any phenotype with ≥1 positive contributing chip; compute met+missing criteria regardless of definitional outcome; *tag* rather than remove; the page decides display. This unifies the scattered gates into one tag-with-reason pass.

---

## Recommended path (PM synthesis + architect)

**Sequence: D-then-E. Page rewrite + evaluator refactor, not incremental patching.** The engine/ICHD-3 brain (criteria, citations, 14 `data-claim` IDs, chip vocabulary) is correct and is preserved.

- **Step 0 — Governance (V decision):** confirm the two headache-specific specs govern (§3); commit the resolution.
- **Phase 1 — Class D (structural + UX rebuild):** build **new, headache-only** UI primitives + one-question-per-screen flow + read-then-decide safety screen + result-in-drawer. **Blast-radius guard: do NOT edit the shared `src/components/pathways/Pathway*` primitives** — they are consumed by the Stroke Code / EVT / SE / Migraine pathways; forking new headache-only components sidesteps regression entirely. Plan + architect sign-off + V approval before code.
- **Phase 2 — Class E (clinical logic):** evaluator rank-and-flag refactor — kill the "%", surface top-2 side-by-side with matched **and** unmatched criteria, demote (don't delete) definitionally-excluded near-misses, add the equal-prominence "reconsider" control, render the SNNOOP10 disclaimer non-collapsibly on **every** result. medical-scientist authors; clinical-reviewer gates pre- and post-execution; preserve the dev-time assertion that every phenotype keeps ≥1 definitional criterion.

**One patient-safety item may warrant an interim fix ahead of the full rebuild:** the missing dangerous-mimic (SNNOOP10) disclaimer on the result (Finding A.1). Offered to V as a fast standalone safety patch vs. folding into Phase 2.

---

## What prior builds (2026-05-25 / 2026-05-27) missed

- Built to the generic chassis, not the product brief — the two headache specs + 6 approved mockups were bypassed; the architect artifact that approved the build never cited them.
- Over-built the wrong things (percentage engine, 5-row differential ribbon, multi-diagnosis banner — none in the mockups) while under-building the *requested* drawer-result, primary-action buttons, intro/power-user/Teach screens, and read-then-decide safety screen.
- No one verified the §0.3 top-2 display, the §0.4 reconsider control, or the §0.5 mandatory disclaimer were actually rendered. None were.
- The "NN%" was added per a 2026-05-25 V request for "percentage of which diagnosis the selection meets" — but no clinical review asked whether a criteria fraction is a defensible thing to label as a percentage in a clinical tool. It is not. The reviews validated metadata and per-criterion semantics; nobody reviewed whether *the number the user sees means what the user will think it means.*
