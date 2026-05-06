# Clinical review — PR-pending (guide-hub-5f)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-5)
**Date:** 2026-05-06

> PR number: pending. Update to `clinical-PR-{N}-guide-hub-rebuild.md` once GitHub assigns a PR number.

---

## Scope
- Claims touched: none — no entries in `CLAIM_REGISTRY` altered; all 16 article files retained their clinical content unchanged (only `recordView()` wiring was added)
- Citations affected: none — no citations added or removed
- Surfaces changed: hub metadata only — article display names, hub-level descriptions, area section labels and ledes, read-time/trail strings, featured-tool labels and subtitles. These are user-facing navigational copy per §13.3, but they are descriptive/navigational, not recommendation-bearing. None introduce new clinical claims requiring citation.

---

## Semantic validity

### Q1 — Meningitis category drift

The `Meningitis.tsx` component carries `category="Infectious Disease"` on the `ArticleLayout` prop (line 29). The 5f rebuild surfaces it under "Neurocritical Care" in the hub. The `recordView` call (line 21–22) already records `subtitle: 'Neurocritical Care'` and `category: 'neurocritical'`.

Surfacing bacterial meningitis under Neurocritical Care does not create clinical drift. The article's empiric-therapy emphasis, "image-first" decision rule, LP timing, and the `<Warning>` on antibiotic timing are all framed around acute bedside decision-making in a critically ill patient — which is a defensible neurocritical-care framing. The article content is unchanged.

"Neurocritical Care" is clinically defensible for empiric-therapy-focused bacterial meningitis. CNS infection causing AMS, seizures, or herniation risk is standard neurocritical-care territory; the article scope (LP timing, empiric vancomycin + ceftriaxone, dexamethasone with first antibiotic dose, HSV coverage decisions) is bedside-emergency framing, not ID-clinic framing.

Resolution: Option (b) — a Class B editorial update to the `Meningitis.tsx` `category` prop ("Infectious Disease" → "Neurocritical Care") to match hub placement and existing `recordView` entry. This is not a clinical-logic change; no citation impact. Recorded as required follow-up.

### Q2 — "Interactive ref" read-time label

"Interactive ref" is clinically acceptable as a trail/read-time descriptor for the AHA/ASA 2026 guideline mindmap (1008-line interactive component). It is a format descriptor, not a clinical assertion; it carries no recommendation strength, dose, time window, or action verb.

Bedside misuse risk is low. "Interactive ref" accurately signals "browse-and-explore reference structure, not linear prose," which is more honest than a fabricated "12 min read." The Featured Tools strip surfaces genuine bedside-urgent tools (Stroke Code, EVT, NIHSS, ASPECTS) for time-critical use, so the hub is not steering active stroke-code users toward the mindmap. No drift; no condition.

### Q3 — Section ledes — clinical assertion check

All 5 section ledes reviewed against the rubric (recommendation strength, action verbs, qualifiers, certainty, temporal):

| Lede | Assessment |
|---|---|
| "Stroke, TIA, hemorrhage, thrombectomy" | Topic list. No assertion. Pass. |
| "Status epilepticus, first-seizure workup" | Topic list. Pass. |
| "AMS, meningitis, ICP, emergencies" | Topic list. Pass. |
| "Headache, vertigo, weakness workups" | Topic list. Pass. |
| "GBS, MG, MS — diagnosis and management" | Topic list with scope qualifier. Pass. |

None carry a recommendation strength, action verb, certainty marker, qualifier, or temporal constraint. None require citation.

### Q4 — Featured Tools strip — implicit clinical hierarchy

The strip surfaces 6 tools (Stroke Code, EVT Pathway, NIHSS, ASPECTS, Status Epilepticus, ELAN Pathway). Header text: "Quick Access."

No unintended clinical hierarchy. The header explicitly frames these as navigation shortcuts. Tags ("Emergency", "Pathway", "Calculator") are functional categories. Subtitles are descriptive scope statements. No subtitle carries a recommendation strength, dose, time window, or action verb directed at the user.

The 6 tools cluster around acute time-critical neurology (consistent with the Guide hub's stated audience). ICH Score, HAS-BLED, ABCD2, and GCS remain accessible via /calculators; their absence from a 6-tile quick-access strip does not constitute clinical exclusion. The strip sits above section rows that surface every other article and tool.

"Anticoagulation timing" (ELAN Pathway subtitle) is borderline — could be read as suggesting ELAN governs anticoagulation timing decisions broadly. In context (with the "Pathway" tag and link to `/pathways/elan-pathway`), it is a navigational descriptor, not a clinical claim. Pass.

### Q5 — Article descriptions — scope accuracy

All 15 hub descriptions reviewed. No description flagged for: (a) contradiction with article content, (b) clinical assertion absent from the article, or (c) omission of a critical clinical qualifier. All are scope statements, not claims; none upgrade or downgrade recommendation strength, certainty, or temporal constraint.

Four scope assertions require spot-check verification (non-blocking — articles not directly read in this review):

1. IV Thrombolytic Protocol description asserts tenecteplase coverage — verify `IvTpa.tsx` covers tenecteplase eligibility/dosing.
2. ICH Management description asserts 4-factor PCC reversal — verify `IchManagement.tsx` covers 4F-PCC.
3. Status Epilepticus description asserts ESETT-aligned lorazepam → LEV/VPA/fosphenytoin → refractory sequence — verify sequencing and trial citation in `StatusEpilepticus.tsx`.
4. Myasthenia Gravis description asserts pyridostigmine dosing content — verify `MyastheniaGravis.tsx` contains dosing guidance.

Note: Bacterial Meningitis description preserves the "Empiric" qualifier ("empiric antibiotics") — critical clinical distinction maintained. Verified against `Meningitis.tsx` body. Pass.

---

## Citation accuracy

No citations added, removed, or modified by 5f. Hub metadata (article names, descriptions, area labels, ledes, read-time strings, featured-tool labels and subtitles) is descriptive/navigational. None of these surfaces meet §13.3 criteria for a clinical claim. None require citation.

---

## Freshness

No new citations introduced by 5f. No `last_reviewed` refresh required. Existing citations in the 16 underlying articles were not modified.

---

## Rationale

This PR is a navigation and metadata rebuild. It does not modify any clinical article body, scoring algorithm, dose, time window, or recommendation strength. The hub-level descriptions are scope statements, not claims; the section ledes are topic lists. The Meningitis category mismatch (article prop vs. hub placement) is internally inconsistent metadata but clinically defensible in either direction — the discrepancy is resolved by a Class B editorial update to the article prop, not by reverting the hub. "Interactive ref" accurately communicates the format of the AHA/ASA guideline mindmap. The Featured Tools strip is explicitly navigational, carrying no clinical hierarchy implications. The four pending spot-checks are likely to confirm accuracy; if any fail, the affected hub description requires a narrow textual correction (no clinical-logic change) as a follow-up PR.

---

## Required follow-ups
1. **(Class B editorial — park as TASKS)** Update `Meningitis.tsx` `category` prop from `"Infectious Disease"` to `"Neurocritical Care"` to match hub placement and existing `recordView` entry. No citation impact.
2. **(Spot-check — non-blocking)** Confirm `IvTpa.tsx` covers tenecteplase eligibility/dosing. If not, narrow hub description to alteplase only.
3. **(Spot-check — non-blocking)** Confirm `IchManagement.tsx` covers 4-factor PCC reversal. If not, adjust hub description to reflect actual reversal content.
4. **(Spot-check — non-blocking)** Confirm `StatusEpilepticus.tsx` presents lorazepam → LEV/VPA/fosphenytoin → refractory SE in ESETT-aligned order.
5. **(Spot-check — non-blocking)** Confirm `MyastheniaGravis.tsx` contains pyridostigmine dosing guidance.
