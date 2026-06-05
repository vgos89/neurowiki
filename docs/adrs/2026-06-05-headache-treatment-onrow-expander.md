# ADR: Headache treatment — on-row "Show management" expander (Stage One-b)

**Date:** 2026-06-05
**Status:** Accepted
**Class:** D-clinical (verbatim dosing relocation + one new safety caveat + display-policy change)
**Relates:** continues `docs/adrs/2026-06-05-headache-result-accordions-stage-one.md`; reviews `docs/reviews/arch-headache-treatment-onrow-expander-stage-one-b.md`, `docs/reviews/clinical-headache-treatment-onrow-expander.md` (pre-exec), `docs/reviews/clinical-headache-treatment-onrow-expander-postexec.md` (post-exec).

## Context

After the result diagnosis list became an accordion (commit c885da2), the per-phenotype treatment still rendered as an always-open wall below the list, for the top match only, and duplicated the criteria. V asked to move treatment off the default view and make it reachable per type. Most headache types have no separate treatment page to link to (only migraine has management pathways), so a true external link-out was not viable for the others. V chose an on-row "Show management" expander.

## Decision

1. **Treatment moves into a collapsed, opt-in "Show management" disclosure on each result row** — a native `<details>` inside the accordion row body, collapsed by default on every row (including the top match). New `src/components/pathways/headache/HeadacheManagement.tsx` holds the dosing cards keyed by `phenotypeId` (bespoke single-surface component; the JSX-per-phenotype is lifted **verbatim** from the page — restructuring to a data map was rejected to avoid transcribing ~20 reviewed dosing strings). `SectionHeader`/`Row` helpers moved with it (their only consumer).

2. **Display policy — management shown for ALL matches, not just strong ones (clinical-gate ruling).** The clinical-reviewer ruled "Policy B-with-conditions": management is available for every matched type including weak/`partial` matches (decision-support; the clinician selects by judgment), gated only by whether the phenotype *has* a card (10 of 11), never by a match-strength floor. The anti-anchoring guard is a fixed caveat — "Partial match — confirm the diagnosis before initiating. Criteria are not yet met for this phenotype; dosing is shown for reference." — rendered at the top of the management body **only when `matchStrength === 'partial'`**. (Chronic-migraine-"probable", displayed as "Partial" but a genuine probable match, correctly does NOT show the caveat — its criteria are met, only the "probable" label is uncodeable in ICHD-3.) The caveat is the single new clinical string, authored/confirmed by medical-scientist and registered as `clinic-headache-partial-match-caveat` → `ichd3-2018`.

3. **Criteria de-duplication via hidden literal markers.** The 8 ICHD-3 criteria cards are deleted from the page (criteria now render once, in the accordion row). The claims scanner matches only a **literal** `data-claim` (not `data-claim={expr}`), so the dynamic accordion `.map()` cannot carry the criteria tags. The 7 pure-criteria claims are kept as hidden literal `<span data-claim>` markers in `HeadacheResultList`; the ndph criteria claim (which bundles a management note) is tagged on its management card. Each of the 8 IDs renders exactly once (the migraine and tension claims are many-to-one, one marker each).

## Consequences

- The result is short by default; treatment is one tap away per type, with criteria shown once (the prior double-up is gone).
- Weak-match dosing is reachable but always preceded by the strength tag, the unmet-criteria list, and (on partial) the confirm-diagnosis caveat — anchoring mitigated by display context, not by withholding the reference.
- `HeadacheManagement` is bespoke (named); `MapperPanel`/general reuse not pursued.
- **Deferred (logged follow-up):** the relocated dosing cards keep their pre-existing `<div>`/`<span>` label-value markup and right-aligned values; a focused a11y/mobile pass should upgrade them to `<dl>/<dt>/<dd>` + `<h4>` section headers and improve 375px value wrapping. Held out of this increment to keep the clinical relocation byte-for-byte.
- **Rollback:** revert the page deletion (restore the inline block + the two helpers), delete `HeadacheManagement.tsx`, revert the `HeadacheResultList` disclosure/markers, and drop the caveat claim entry. Engine, drawer, questionnaire untouched.
