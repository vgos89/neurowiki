# ADR-004 — Heidelberg severity mapping and scope-callout deviation

**Status:** Accepted
**Date:** 2026-04-21
**Deciders:** V (product) · medical-scientist (clinical) · system-architect (structural) · clinical-reviewer (prose-preservation gate)
**Task:** L5.5 Heidelberg Bleeding Classification rebuild (Class D-clinical)
**Supersedes:** n/a
**Related:** CALCULATOR_SPEC.md v1.1 §2 (Archetype 1), §4.5 (Important callout), §5 (drawer state), §6 (severity tokens), §8 (canonical calculator result); [arch-PR-heidelberg-rebuild.md](../reviews/arch-PR-heidelberg-rebuild.md); [clinical-PR-heidelberg-rebuild.md](../reviews/clinical-PR-heidelberg-rebuild.md)

## Context

Heidelberg Bleeding Classification (von Kummer et al. Stroke 2015;46(10):2981-6) is a classification tool, not a numeric risk score. The NeuroWiki calculator rebuild against CALCULATOR_SPEC.md v1.1 Archetype 1 surfaced two decisions that do not fit the spec's default anatomy:

1. The spec's drawer state machine (§5) and severity tokens (§6) assume a numeric score with low/moderate/high tiers. Heidelberg classes need a tier mapping for the drawer's visual tokens (border color, header background, chevron color) even though there is no native severity axis in the classification.

2. The existing calculator has a top-of-main amber scope callout warning that the tool is only for hemorrhagic transformation after reperfusion, not for spontaneous ICH location. Archetype 1 (§2) has no slot for this; the spec anatomy is sticky header → space-y-10 sections → footer → drawer.

Both decisions have clinical-safety implications. A misapplied tier mapping under-signals visual urgency at the bedside. A removed scope callout allows clinicians to apply the tool to a patient population for which it was never designed.

## Decisions

### Decision 1 — SEVERITY_MAP lives in the data module

The `HEIDELBERG_SEVERITY_MAP` constant is exported from `src/data/heidelbergBleedingData.ts` alongside the existing classification prose. The component imports it through the canonical `calculateHeidelberg()` function's return value.

**Chosen mapping** (medical-scientist-approved 2026-04-21, with one revision from the orchestrator's initial proposal):

| Class | Label | Severity | Rationale |
|---|---|---|---|
| 1a | HI1 — scattered petechiae | low | No mass effect; unlikely reperfusion-related; typically asymptomatic |
| 1b | HI2 — confluent petechiae | low | No mass effect; typically asymptomatic even when reperfusion-related |
| 1c | PH1 — hematoma <30%, no substantive mass effect | moderate | Parenchymal blood, probable reperfusion-related within 24h, but no mass effect |
| 2 | PH2 — hematoma ≥30% with mass effect | high | Recognized driver of neurologic deterioration per von Kummer 2015 |
| 3a | Remote parenchymal hematoma | high | Procedural complication concern (vessel perforation); remote location removes the "within ischemic bed" buffer |
| 3b | IVH | high | Hydrocephalus risk; may require EVD; time-critical finding |
| 3c | SAH | **high** (revised from moderate) | Post-reperfusion SAH mandates urgent differential (aneurysm rupture, procedural arterial injury, CAA) |
| 3d | SDH | moderate | Possible relatedness; surgical assessment needed but typically not a minutes-level deterioration driver in the reperfusion setting |

**Evidence base:** von Kummer et al. Stroke 2015;46(10):2981-6 (source classification); Fiorelli et al. Stroke 1999;30(11):2280-4 (ECASS foundational PH2 outcome data); Powers et al. AHA/ASA 2019 (and 2022/2026 successors) on post-reperfusion hemorrhage escalation triggers.

**Why the data module, not the component:** CALCULATOR_SPEC.md §8 requires that scoring and clinical-categorization logic live in the `src/data/*ScoreData.ts` file. Placing SEVERITY_MAP in the component would make Heidelberg the only Archetype 1 calculator that breaks this pattern. Co-locating the map with classification prose also reduces drift risk: if either the classification or the tier mapping is revised, both changes land in one file with one clinical-reviewer diff.

**What the mapping does and does not do:** The map drives *visual tokens only* — drawer border color (slate-200 / amber-200 / red-200), header background (white / amber-50 / red-50), and chevron color (slate-400 / amber-700 / red-600). It does NOT alter classification prose, management notes, citation, or any other clinical text. Clinical-reviewer Phase 3 and Phase 5 gates verify prose preservation byte-for-byte.

**Edge cases documented in the clinical review:**
- Tier reflects the *potential* significance of the imaging finding, not the patient's current exam state. An asymptomatic PH2 still earns a red border because the hematoma can drive deterioration over hours.
- A clinically worsening PH1 may feel more urgent than its amber tier implies — the SICH toggle and classification prose carry that nuance. The tier is a baseline visual anchor, not the full clinical picture.
- Large SDH with mass effect is a surgical emergency regardless of tier. That escalation is driven by the imaging read and the management-note prose, not the color token.

### Decision 2 — Scope callout retained as approved Archetype 1 deviation

The existing amber scope callout at the top of `<main>` is preserved verbatim. The callout reads:

> **Scope**
> This classification is for hemorrhagic transformation after ischemic stroke and reperfusion therapy (tPA or thrombectomy). It is not for spontaneous ICH location. Use brain imaging within 48 hours of reperfusion and as needed for new symptoms.

**V's decision rationale:** This is a misuse-prevention warning. A clinician applying Heidelberg to a patient with spontaneous ICH is using the wrong tool — the classification is defined specifically for post-reperfusion HT. The warning is clinical-safety critical and cannot live elsewhere (route metadata, drawer content after completion, documentation).

**Spec conformance:** CALCULATOR_SPEC.md v1.1 Archetype 1 (§2) anatomy does not include a slot between the sticky header and the first `<section>` for clinical-safety scope callouts. The spec is explicit: sticky header → space-y-10 sections → footer → drawer. This placement is a deviation.

**Anatomy (for future reuse):**

```html
<main class="max-w-2xl mx-auto px-5 pt-6 pb-4">
  <!-- Scope callout — Archetype 1 deviation. Reuses §4.5 "Important" anatomy
       in a top-of-main position. -->
  <div class="mb-6 pl-3 border-l-2 border-amber-400">
    <div class="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Scope</div>
    <p class="text-sm text-slate-700 leading-relaxed">{callout text}</p>
  </div>

  <div class="space-y-10">{standard sections}</div>
  {footer}
  {drawer spacer}
</main>
```

**Applicability criteria (when to use this deviation for future calculators):**
1. The calculator has a clinical-safety scope constraint that, if misapplied, could cause a patient-facing error (e.g., wrong tool for the condition).
2. The constraint must be visible *before* the user interacts with any input, not surfaced only in the drawer after completion.
3. The constraint is stable — not something that should be evaluated per-input or that would duplicate information from the calculator's interpretation.

**Current candidates for this pattern:**
- Heidelberg Bleeding Classification (applied here)
- Boston Criteria CAA (future: "Requires age ≥50 and T2*-weighted MRI")
- Any future calculator with a similar age / imaging / population gate

**Non-candidates (should not use this pattern):**
- Per-input clinical warnings → use §3.3 per-item warning pattern
- Results-time caveats → use §4.5 Important callout in drawer content
- Educational context → belongs in guide pages, not the calculator

**Spec amendment:** A future amendment to CALCULATOR_SPEC.md v1.x should add this pattern as an "Archetype 1+Scope" variant with the anatomy above. Until then, this ADR is the authoritative source.

## Consequences

**Positive:**
- Heidelberg ships compliant with CALCULATOR_SPEC v1.1 (no dark:, no border-2, Portal drawer, correct tokens) while preserving clinical-safety scope boundaries.
- SEVERITY_MAP pattern is reusable for future classification-style calculators (Boston Criteria, future CAA/vasculopathy classifiers).
- Scope callout pattern is documented and reusable; future calculators with similar constraints have a clear anatomy to follow.
- Data module stays the single source of truth for all clinical categorization, matching GCS and ICH Score patterns.

**Negative:**
- The Archetype 1 spec now has an unofficial deviation pattern that is not documented in the spec file itself. Mitigated by this ADR being linked from the architect review artifact and from the rebuild's PR description. Pending: spec amendment in v1.x.
- Non-numeric-score calculators will always need a severity-like map for drawer tokens — Heidelberg sets the pattern for this, but future classifiers may need their own rationale (documented per-calculator in data module comments and clinical review artifacts).

**Neutral:**
- The scope callout uses the §4.5 "Important" anatomy (`pl-3 border-l-2 border-amber-400`) in a new position. This reuse of an existing pattern in a new slot is arguably more consistent than inventing a new pattern class. Future calculators with similar clinical-safety constraints can adopt the same token set.

## Alternatives considered

**For Decision 1:**
- *In-component SEVERITY_MAP.* Rejected: violates §8 (data module owns scoring/categorization). Would make Heidelberg the only Archetype 1 calculator that breaks this pattern.
- *Additive data module export with full replacement of `classifyHeidelbergBleeding()`.* Rejected: modifying the existing API would violate the "preserve as-is" instruction from V. Additive-only extension is safer.
- *Migrate HeidelbergResult to canonical CalculatorResult shape.* Rejected per V's explicit "not in scope" instruction. Deferred to a future W5.x task if ever needed; the additive `calculateHeidelberg()` wrapper covers all rebuild requirements without touching the existing type.

**For Decision 2:**
- *Drop the scope callout.* Rejected by V on clinical-safety grounds.
- *Move the scope callout into the drawer's explanation field.* Rejected: the warning must be visible *before* the user interacts, not after they have selected a class. A user who has already categorized a spontaneous ICH as "Class 2 (PH2)" has already committed the misuse.
- *Show the scope callout only on first visit (localStorage flag).* Rejected: clinical-safety warnings should not be dismissible. The callout is lightweight (two sentences, inline, not a modal) and does not impede the primary task flow.
- *Add scope as a per-item warning on each class option.* Rejected: clutter, wrong pattern per §3.3 (per-item warnings are for within-scope nuances, not for scope itself).

## Follow-ups

- Propose spec amendment (future CALCULATOR_SPEC v1.x) to add "Archetype 1+Scope" as a formal variant with the anatomy documented in Decision 2.
- When Boston Criteria CAA rebuild reaches implementation, apply this pattern for its "Requires age ≥50" scope constraint and cross-reference this ADR.
- Propose in a future session: a Class C-clinical copy-polish task for `content-writer` to revise the awkward phrase "distinguish from aneurysm rupture if convexity/circumstantial" in class 3c's `clinicalSignificance` string. Flagged by clinical-reviewer Phase 3 as non-blocking; not in scope for this rebuild.
