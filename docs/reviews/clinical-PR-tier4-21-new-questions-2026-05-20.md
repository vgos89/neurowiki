# Clinical review — PR # Tier 4 #21 seven new clinical questions (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

- **Claims touched:** none — metadata question authoring with `trialIds[]` arrays referencing existing catalog trials. No new clinical claims; no displayed numbers; no interpretation prose.
- **Surfaces changed:** `src/data/trial-questions.ts` — 7 new `TrialQuestion` entries appended to the `TRIAL_QUESTIONS` array (13 → 20 questions total).
- **Trial coverage unlocked:** 24 catalog trials now have an additional bedside-question home — closes the orphan-trial gaps for ASTER, ASTER2, COMPASS, CHOICE, RESCUE BT, ESCAPE-NA1 (now anchors B4), ESCAPE-MeVO, DISTAL, and several existing trials get additional question contexts.

## New questions (per audit Part B)

| ID | Text | Icon | Trials | Audit Part B # |
|---|---|---|---|---|
| `large-core-evt` | Should I do EVT for large-core stroke (low ASPECTS)? | target | 4 (LASTE, SELECT2, ANGEL-ASPECT, TENSION) | B1 |
| `late-window-selection` | Perfusion imaging or non-contrast CT for late-window selection? | target | 7 (DAWN, DEFUSE-3, EXTEND, LASTE, TENSION, SELECT2, ANGEL-ASPECT) | B2 |
| `aspiration-vs-stentriever` | Aspiration first or stent retriever first for thrombectomy? | layers | 3 (ASTER, COMPASS, ASTER2) | B3 |
| `evt-adjunct-pharmacotherapy` | Is neuroprotection or adjunct pharmacotherapy useful during EVT? | pill | 3 (ESCAPE-NA1, CHOICE, RESCUE BT) | B4 |
| `minor-stroke-choice` | Minor non-disabling stroke — alteplase, DAPT, or aspirin? | pill | 5 (CHANCE, POINT, PRISMS, ARAMIS, INSPIRES) | B5 |
| `mevo-distal-evt` | Does my MeVO or distal-occlusion patient benefit from EVT? | target | 2 (ESCAPE-MeVO, DISTAL) | B6 |
| `post-evt-bp-target` | What's the post-EVT blood pressure target? | waveform | 4 (ENCHANTED, BP-TARGET, BEST-II, OPTIMAL-BP) | B7 |

Total new question count: 7. Total new trial-question linkages: 28. All 24 underlying trials exist in the catalog and were verified before authoring.

## Semantic validity

Each question's trial set was checked against published primary frames:

- **B1 large-core-evt:** All four trials prespecified large-core or low-ASPECTS populations with mRS-based primary endpoints. LASTE was ordinal-shift / not-met by strict primary (corrected in commit `26eeb5c` to reflect the published frame); SELECT2 and ANGEL-ASPECT are ordinal-shift / met (per existing catalog data); TENSION is binary-superiority / met. The question correctly groups the four trials as evidence for the large-core EVT decision while preserving the design heterogeneity in the trial pages themselves.

- **B2 late-window-selection:** Two distinct imaging paradigms — perfusion/MRI mismatch (DAWN, DEFUSE-3, EXTEND) vs non-contrast CT or plain-CT large-core selection (LASTE, TENSION, SELECT2, ANGEL-ASPECT). The question correctly surfaces both paradigms; the bedside framing is "which imaging biomarker do I need?" not "which arm wins."

- **B3 aspiration-vs-stentriever:** Three RCTs (ASTER, COMPASS, ASTER2). ASTER and COMPASS were noninferiority designs; ASTER2 was combined-technique vs stent retriever. No claim of superiority for aspiration is made — the question correctly frames the choice as procedural preference within an established equivalence.

- **B4 evt-adjunct-pharmacotherapy:** Three negative-or-mixed pharmacologic-adjunct trials. ESCAPE-NA1 was binary-superiority / not-met for nerinetide overall; CHOICE was adjunctive IA alteplase post-EVT (stopped early); RESCUE BT showed a signal in non-large-artery atherosclerosis subgroup but missed the overall primary. The question correctly groups these as "evidence for/against pharmacologic adjuncts" rather than implying any has positive overall.

- **B5 minor-stroke-choice:** CHANCE/POINT (DAPT positive) anchor the "DAPT works" side; PRISMS (alteplase failed superiority vs aspirin with excess sICH) anchors the "alteplase may not help" side; ARAMIS (DAPT noninferior to alteplase) bridges both; INSPIRES extends to ≤72h atherosclerotic minor stroke. The bedside framing is honest: there is a trade-off and the question surfaces all three options.

- **B6 mevo-distal-evt:** The two 2024 trials that define the negative boundary of EVT — both did not meet primary outcomes. The question correctly frames the answer as "evidence currently does not support EVT for MeVO/distal occlusions" — a defensible bedside reading.

- **B7 post-evt-bp-target:** Four trials. ENCHANTED is included for the peri-thrombolysis BP framework reference (not strictly post-EVT — flagged below as a soft inclusion).

## Soft inclusions documented

1. **ENCHANTED in B7 post-evt-bp-target:** ENCHANTED's BP arm (Anderson Lancet 2019) tested BP lowering during IV alteplase, not specifically post-EVT. Included as the BP-control framework reference. Bedside-relevant because clinicians often extrapolate the ENCHANTED finding (no benefit + no harm from BP lowering during IVT) to post-EVT decisions. The question's `meta` describes the four-trial set as "across the post-EVT BP target question — and one harm signal" — the harm signal is OPTIMAL-BP, the framework reference is ENCHANTED. This is a defensible bedside grouping but not a strictly identical-population set. **Acceptable as a contextual inclusion.**

## Catalog gaps acknowledged

These are the orphan trials per audit Part C2 that are NOT yet anchored to any of the new questions:

- **SPARCL, SOCRATES, SPS3** — already cross-linked to existing Q6 dapt in commit `c8df865`. No new question needed.
- **RACECAT, TRIAGE-STROKE** — pairs with a future "Where should the ambulance go — drip-and-ship or mothership?" question; not yet built.
- **EAGLE** — CRAO not ischemic stroke; intentionally orphan per audit (leave for category-browse).

The audit identified 4 evidence gaps (PFO closure, DOAC head-to-heads, lacunar prevention, AVM management) where the catalog itself lacks trial entries. These remain catalog-bounded and are not addressable by adding more questions until trial entries land.

## Icon discipline

Every new question uses a `QuestionIconKey` from the existing union (`clock | target | pill | brain | waveform | layers`). No icon-set expansion needed. If a future question needs a new icon (e.g., audit's optional `imaging` for B2), that's a ui-architect task.

## Citation accuracy

No citations touched.

## Freshness

No `last_reviewed` refresh — no clinical claim asserted that wasn't already in the catalog.

## Quality gates

- `tsc --noEmit` → PASS
- `npm run build` → PASS (2.97s)
- `npm run check:claims` → PASS (no new claims to register)

## Rationale

Closes the second-largest catalog gap flagged by the overnight audit — the orphan-trial / no-question-home problem. The catalog had ~20 trials with no bedside question to surface them; after this commit, 24 of those trials have at least one home. The remaining orphans (RACECAT, TRIAGE-STROKE, EAGLE, and the catalog-bounded gaps) are documented above with disposition.

The Questions surface on `/trials/q/*` now spans 20 questions covering the major clinical decisions a stroke clinician makes at the bedside: when to give tPA, which thrombolytic, EVT yes/no, EVT vs bridging, large-core boundary, MeVO boundary, late-window imaging, aspiration vs stent retriever, neuroprotection adjuncts, basilar EVT, minor stroke choice, DAPT, anticoagulation timing, BP control across the timeline, ICH surgery, hemicraniectomy, MSU dispatch, and ICAS stenting. This is the bedside coverage the catalog needed to be useful as a clinical reference, not just a trial library.

## Required follow-ups

1. **SEO sweep** — 7 new routes (`/trials/q/large-core-evt`, `/trials/q/late-window-selection`, `/trials/q/aspiration-vs-stentriever`, `/trials/q/evt-adjunct-pharmacotherapy`, `/trials/q/minor-stroke-choice`, `/trials/q/mevo-distal-evt`, `/trials/q/post-evt-bp-target`) should be added to routeManifest.ts + sitemap.xml + JSON-LD MedicalIntervention/MedicalCondition structured data. The routes likely auto-resolve via a catch-all in `/trials/q/:id` — verify and add manifest entries if needed.

2. **Add RESCUE-Japan LIMIT to `large-core-evt`** once V's PDF lands and the trial entry is authored.

3. **Future B8 question** (per audit's optional suggestion): "Should I treat my unknown-onset/wake-up stroke patient with thrombolysis?" — WAKE-UP, THAWS, TWIST, EXTEND. Could be built when V is ready; lower priority.

4. **Future question for RACECAT + TRIAGE-STROKE** (per audit Part C2): "Where should the ambulance go — drip-and-ship or mothership?" prehospital-routing question.

## Blocking issues

None.
