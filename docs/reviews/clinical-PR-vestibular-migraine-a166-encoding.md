# Clinical review — Vestibular migraine §A1.6.6 full encoding, Fix A-M1

**Decision:** approve-with-conditions (condition C1 applied pre-commit)
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-06
**Class:** E (diagnostic-logic change) · headache clinic pathway engine

## Scope
- **Claims touched:** `clinic-headache-ichd3-vestibular-migraine` (§A1.6.6), criteria A–D.
- **Citations affected:** ICHD-3 2018 (DOI 10.1177/0333102417738202) + Bárány/Lempert 2012 (DOI 10.3233/VES-2012-0453, PMID 23142830). No `last_reviewed` field was stamped by this change (see Freshness).
- **Surfaces changed:** structured data in `src/data/` — the `vestibular-migraine` phenotype criteria, four new `Chip` definitions, the vestibular chip-group eyebrow, and the vestibular branch question options.
- **Files:** `src/data/clinicHeadacheData.ts`, `src/data/headacheQuestions.ts`, `src/data/clinicHeadacheData.test.ts`.
- **Evidence-verifier packet:** `docs/evidence-packets/2026-07-06-ichd3-a166-vestibular-migraine.md` (ICHD-3 2018 PDF read verbatim, pp. 193–194; HIGH confidence).
- **Trial-statistician report:** not applicable.

## Semantic validity — PASS
Faithful encoding of §A1.6.6 A–D with Notes 3–4 (verified verbatim in the packet; the packet correctly identifies and corrects the in-repo reference's A–D mislabel — the criteria are A–E):
- **A (≥5 episodes):** `vm-A = vest-vertigo-migrainous && vest-episodes-ge-5`.
- **B (migraine history):** `vm-B = migraine-history-established` (BPPV/Menière discriminator preserved).
- **C (intensity + duration):** `vm-C = vest-intensity-mod-severe && vest-duration-5min-72h`; Note 3 (moderate = interferes / severe = prevents) and Note 4 (5 min–72 h, seconds-long summation) reproduced accurately in the chip teach text and criterion descriptions.
- **D (≥50% + feature set):** `vm-D = vest-migrainous-half`; the description and teach text spell out the inclusive-OR of the three sub-features and, critically, **photophobia AND phonophobia together** — the prior OR→AND error is corrected everywhere it matters.
- Section number corrected to **A1.6.6** across all claim surfaces (guarded by an existing test); the only remaining "A1.6.5" is an explanatory comment noting what A1.6.5 actually is.

**Design decision — validated.** All four criteria are `suppress-gate`; none are in `EMIT_CRITERION_IDS`, so any single miss hits the silent DROP branch and all-pass yields `metCount === total → full`. VM is therefore **binary: full when A–D all affirmed, else hidden**. The reviewer independently traced the engine (L991–1067) to confirm. Binary full/hidden is the correct conservative posture for an over-calling appendix/research entity; a Probable-VM (§A1.6.6.1) state is **not** required now and is properly deferred to Track C (its criteria were out of this packet's verify-scope; implementing it unsourced would itself be a violation).

**Over-call closure & conflation fix — PASS.** Tests assert VM drops with <5 episodes, without intensity/duration, without the ≥50% link, without vertigo, and without migraine history; the genuine path reaches `full`. Critically, `vm-D` uses the dedicated composite chip, not the migraine-attack photophobia/phonophobia chips — the test at the D-gate proves attack-level photo+phono does **not** satisfy `vm-D`, separating "photophobia during a headache" from "a migraine feature during ≥50% of vertigo episodes."

## Citation accuracy
Encoded against a resolved, verbatim-quoted source (ICHD-3 2018 PDF, pp. 193–194). No source, section, or quote is misrepresented; the change moves the engine into literal agreement with §A1.6.6.

## Freshness
No `last_reviewed` field was modified. This review covers the diagnostic-logic encoding against the evidence packet; it does not by itself satisfy a §13.6 refresh. No citation-registry date is stamped in this PR, so §13.6 is not triggered. (Follow-up: if a future PR stamps an ICHD-3 `last_reviewed`, run the six-step §13.6 checklist then.)

## Condition (applied before commit)
- **C1 — chip-label ≥2-features wording.** The `vest-migrainous-half` label compressed criterion D.1 ("headache with ≥2 of four characteristics") to bare "migraine-type headache," a data-entry-layer over-call risk (the teach text was correct, so logic was never affected). **Resolved:** both surfaces (`clinicHeadacheData.ts` chip def + `headacheQuestions.ts` branch option) now read "a migraine-type headache with ≥2 typical features, both light and sound sensitivity together, or visual aura." Re-verified: humanizer clean, 105 headache tests pass.

## Mandatory-block check
No conditions triggered. Source resolvable + verbatim-quoted (pass); `quoted_text` supports the claims (pass); never-drift categories (the ≥5 count, moderate/severe floor, 5 min–72 h window, ≥50% quantifier, AND-conjunction) all present and correctly gated.

## Rationale
A faithful, source-verified implementation of §A1.6.6 A–D that closes the reported over-call and the attack-vs-episode conflation, fixes the latent photophobia OR→AND error, and corrects the section number across all surfaces. The binary full/hidden behavior is the correct conservative posture for an appendix entity, and deferring Probable VM to a source-verified Track C is proper rather than a shortcut. The one editorial wording gap was corrected pre-commit as condition C1.

## Required follow-ups (non-blocking)
- **compliance-legal:** route the ICHD-3 copyright commercial-vs-educational determination (packet §6) if NeuroWiki is a paid product; confirm ICHD-3 + Bárány/Lempert 2012 attribution surfaces to the end user.
- **Track C:** Probable vestibular migraine (§A1.6.6.1) — source-verify its criteria in a new packet before converting the VM gates to demote-gates with a §A1.6.6.1 Probable home.

## Verification state at gate time
- `npx vitest run` → 211/211 (105 in the headache file incl. 4 new anti-over-call tests); `tsc --noEmit` clean; `check:claims` pass; `check:humanizer` PASS.
