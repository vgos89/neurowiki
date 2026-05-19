# Clinical authoring — NIHSS plain-English score labels

**Date:** 2026-05-19
**Author:** medical-scientist
**Class:** C-clinical (paraphrasing standard NIHSS rubric; no threshold or recommendation change)
**Files touched:** `src/utils/nihssShortcuts.ts` (interface + 15 items)
**Source rubric:** NIH Stroke Scale (standard; the rubric strings already present in `detailedInfo` for each item)
**Routing:** ready for clinical-reviewer

---

## Purpose

Add a `plainOptions` field parallel to `rapidOptions` on every NIHSS item. The plain-English labels paraphrase the formal NIHSS rubric in everyday clinical language so a resident or student can see the score definitions at the bedside without reading the full NIH wording.

No thresholds change. No score boundaries change. The numeric scale, the count of options per item, and the UN handling on item 10 are preserved exactly. This is a paraphrase pass, not a clinical change.

---

## Side-by-side: rubric → plain-English label

### 1a. Level of Consciousness

| Score | NIHSS rubric (verbatim) | Plain-English label |
|---|---|---|
| 0 | Keenly responsive. | 0: Awake and alert |
| 1 | Drowsy/Somnolent but arouses to minor stimulation. | 1: Sleepy but wakes up easily |
| 2 | Obtunded; requires strong/painful stimulation to move. | 2: Hard to wake, needs strong stimulation |
| 3 | Reflex posturing only or totally unresponsive. | 3: No real response, may only posture |

### 1b. LOC Questions (month, age)

| Score | NIHSS rubric | Plain-English label |
|---|---|---|
| 0 | Both questions answered correctly. | 0: Got both right |
| 1 | One question answered correctly. | 1: Got one right |
| 2 | Neither question answered correctly. | 2: Got neither right |

### 1c. LOC Commands (open/close eyes, grip/release)

| Score | NIHSS rubric | Plain-English label |
|---|---|---|
| 0 | Both commands performed correctly. | 0: Did both correctly |
| 1 | One command performed correctly. | 1: Did one correctly |
| 2 | Neither command performed correctly. | 2: Did neither correctly |

### 2. Best Gaze

| Score | NIHSS rubric | Plain-English label |
|---|---|---|
| 0 | Normal. | 0: Eyes move normally |
| 1 | Partial gaze palsy OR overcomes deviation with oculocephalic maneuver. | 1: Eyes drift but can cross midline |
| 2 | Forced deviation (cannot overcome) OR total gaze paresis. | 2: Eyes stuck to one side |

### 3. Visual Fields

| Score | NIHSS rubric | Plain-English label |
|---|---|---|
| 0 | No visual loss. | 0: Sees in all directions |
| 1 | Partial hemianopia (e.g., quadrantanopia) or extinction. | 1: Misses one quadrant |
| 2 | Complete homonymous hemianopia. | 2: Misses a whole half |
| 3 | Bilateral blindness (cortical blindness). | 3: Blind on both sides |

### 4. Facial Palsy

| Score | NIHSS rubric | Plain-English label |
|---|---|---|
| 0 | Normal symmetry. | 0: Face moves evenly |
| 1 | Minor (flattened nasolabial fold, subtle asymmetry). | 1: Subtle droop or flat smile line |
| 2 | Partial (paralysis of lower face). | 2: Lower face droops |
| 3 | Complete (paralysis of upper AND lower face). | 3: Entire half of face paralyzed |

### 5a / 5b. Motor Arm (left / right)

Identical option set on both items (10-second hold).

| Score | NIHSS rubric | Plain-English label |
|---|---|---|
| 0 | Holds 10s. | 0: Holds arm up the full 10 seconds |
| 1 | Drifts before 10s but does not hit bed. | 1: Drifts down but does not hit bed |
| 2 | Falls to bed before 10s (some effort). | 2: Falls to bed, some effort against gravity |
| 3 | No effort against gravity (shrugs/movements on bed). | 3: Cannot lift, only moves along the bed |
| 4 | No movement. | 4: No movement at all |

### 6a / 6b. Motor Leg (left / right)

Identical option set on both items (5-second hold).

| Score | NIHSS rubric | Plain-English label |
|---|---|---|
| 0 | Holds 5s. | 0: Holds leg up the full 5 seconds |
| 1 | Drifts before 5s but does not hit bed. | 1: Drifts down but does not hit bed |
| 2 | Falls to bed before 5s. | 2: Falls to bed, some effort against gravity |
| 3 | No effort against gravity. | 3: Cannot lift, only moves along the bed |
| 4 | No movement. | 4: No movement at all |

### 7. Limb Ataxia

| Score | NIHSS rubric | Plain-English label |
|---|---|---|
| 0 | Absent. | 0: Movements look smooth |
| 1 | Present in one limb. | 1: Clumsy in one limb |
| 2 | Present in two or more limbs. | 2: Clumsy in two or more limbs |

### 8. Sensory

| Score | NIHSS rubric | Plain-English label |
|---|---|---|
| 0 | Normal. | 0: Feels pinprick the same on both sides |
| 1 | Mild/Moderate (feels less sharp/dull, but aware of touch). | 1: Pinprick feels duller on one side |
| 2 | Severe/Total (not aware of touch or bilateral loss). | 2: No feeling on one side, or both sides numb |

### 9. Best Language

| Score | NIHSS rubric | Plain-English label |
|---|---|---|
| 0 | Normal. | 0: Speaks and understands normally |
| 1 | Mild-Mod aphasia (loss of fluency/comprehension but ideas conveyed). | 1: Words come out, but some are wrong or missing |
| 2 | Severe aphasia (fragmentary expression, inference needed). | 2: Only bits of speech, you have to guess |
| 3 | Mute/Global (no usable speech/comprehension). | 3: No speech, no understanding |

### 10. Dysarthria

| Score | NIHSS rubric | Plain-English label |
|---|---|---|
| 0 | Normal. | 0: Speech sounds clear |
| 1 | Mild-Mod (slurring but understandable). | 1: Slurred but you can still understand |
| 2 | Severe (unintelligible or mute/anarthric). | 2: Too slurred to understand, or cannot speak |
| 9 (UN) | Intubated or physical barrier. | UN: Cannot test (intubated or barrier) |

### 11. Extinction / Inattention (Neglect)

| Score | NIHSS rubric | Plain-English label |
|---|---|---|
| 0 | No abnormality. | 0: Notices both sides equally |
| 1 | Visual, tactile, OR spatial inattention (extinction to double simultaneous stimulation). | 1: Ignores one side when both are tested at once |
| 2 | Profound hemi-inattention (does not recognize own hand or orients to only one side). | 2: Ignores one side completely, even their own arm |

---

## Edge cases and notes

- **Item 10 UN (untestable, score 9):** preserved exactly. The internal value remains `9` and is excluded from the total per the existing `calculateTotal` (skip on `v !== 9`). Plain-English label is "Cannot test (intubated or barrier)" — preserves the UN semantics without losing meaning.
- **Items 5a/5b and 6a/6b:** option text is identical on each side of the pair (left vs right arm; left vs right leg). This matches `rapidOptions`, which is also identical on each pair. The arm vs leg distinction is the 10s vs 5s hold time, which is preserved in the labels.
- **Item 9, score 3 (Mute/Global):** the rubric says "no usable speech/comprehension." The plain English compresses to "No speech, no understanding," which preserves both the expression and comprehension components.
- **Item 11, score 1:** the rubric covers three modalities (visual, tactile, OR spatial). The plain English ("Ignores one side when both are tested at once") captures the *test* signature (extinction to double simultaneous stimulation) rather than enumerating modalities — fair for a brief button label, since the modality detail is preserved in `detailedInfo` and the existing `plainEnglish` block.

## Items flagged for clinical-reviewer attention

- **Item 9 score 1 ("Mild-Mod aphasia").** The plain English ("Words come out, but some are wrong or missing") simplifies "loss of fluency/comprehension but ideas conveyed." This compression emphasizes expression and loses the explicit "ideas conveyed" framing. The accompanying `plainEnglish` block already covers comprehension testing, so a clinician scoring this won't miss the bilateral nature, but reviewer should confirm the brief label is acceptable.
- **Item 11 score 1 ("Partial").** As above — modality-list compressed to test signature. Reviewer should confirm.
- **Item 8 score 2 ("Severe/Total").** Rubric covers both "not aware of touch" and "bilateral loss." Plain English uses an "or" construction: "No feeling on one side, or both sides numb." Reviewer should confirm both clinical scenarios are still distinguishable to a bedside user.

No threshold or boundary changed. No new clinical recommendation. No new contraindication.

## Compliance check (humanizer)

- No em-dashes used in any plainOptions label.
- No banned signal phrases ("notably," "importantly," etc.).
- Active voice throughout.
- All labels 4–10 words (longest: item 5a/5b/6a/6b score 2 at 7 words).

## Source

NIH Stroke Scale, standard rubric (the same rubric already present in `detailedInfo` strings for each item in `src/utils/nihssShortcuts.ts`). No new citation introduced; this is paraphrase of existing on-file rubric language.

## Routing

ready for clinical-reviewer
