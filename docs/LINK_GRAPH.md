# Link Graph

This file is auto-generated from docs/link-graph.json by every swarm. Do not edit directly.

Last regenerated: 2026-05-06 (guide-hub-5f swarm)

---

## Summary

| Type | Count |
|---|---|
| Hubs | 1 |
| Articles | 16 |
| Calculators | 5 |
| Trials | 26 |
| **Total nodes** | **48** |
| Stubs (not yet routable) | 4 |

---

## Hubs

| Node ID | Title | Route | Out | In |
|---|---|---|---|---|
| `hub/guide` | Neurology Guide Hub | `/guide` | 15 | 0 (nav-level) |

---

## Articles

| Node ID | Title | Route | References | Referenced by |
|---|---|---|---|---|
| `article/iv-tpa` | IV Thrombolytic Protocol | `/guide/iv-tpa` | article/stroke-basics, calc/nihss | hub/guide |
| `article/stroke-basics` | Stroke Basics | `/guide/stroke-basics` | — | article/iv-tpa |
| `article/thrombectomy` | Mechanical Thrombectomy | `/guide/thrombectomy` | — | hub/guide |
| `article/acute-stroke-mgmt` | Acute Stroke Management | `/guide/acute-stroke-mgmt` | — | hub/guide |
| `article/aha-2026-guideline` | 2026 AHA/ASA Stroke Guideline Mindmap | `/guide/aha-2026-guideline` | — | hub/guide |
| `article/status-epilepticus` | Status Epilepticus | `/guide/status-epilepticus` | — | hub/guide |
| `article/seizure-workup` | Seizure Workup | `/guide/seizure-workup` | — | hub/guide |
| `article/altered-mental-status` | Altered Mental Status | `/guide/altered-mental-status` | — | hub/guide |
| `article/meningitis` | Bacterial Meningitis | `/guide/meningitis` | — | hub/guide |
| `article/headache-workup` | Headache Workup | `/guide/headache-workup` | — | hub/guide |
| `article/vertigo` | Vertigo | `/guide/vertigo` | — | hub/guide |
| `article/weakness-workup` | Weakness Workup | `/guide/weakness-workup` | — | hub/guide |
| `article/gbs` | Guillain-Barre Syndrome | `/guide/gbs` | — | hub/guide |
| `article/myasthenia-gravis` | Myasthenia Gravis | `/guide/myasthenia-gravis` | — | hub/guide |
| `article/multiple-sclerosis` | Multiple Sclerosis | `/guide/multiple-sclerosis` | — | hub/guide |
| `article/ich-management` | ICH Management | `/guide/ich-management` | calc/ich-score, calc/gcs | hub/guide |

---

## Calculators

| Node ID | Title | Route | References | Referenced by |
|---|---|---|---|---|
| `calc/nihss` | NIHSS Calculator | `/calculators/nihss` | — | calc/gcs, calc/heidelberg, article/iv-tpa |
| `calc/gcs` | Glasgow Coma Scale | `/calculators/glasgow-coma-scale` | calc/ich-score, calc/nihss | calc/ich-score, article/ich-management, pathway/stroke/step-2 |
| `calc/ich-score` | ICH Score Calculator | `/calculators/ich-score` | trial/hemphill-2001, calc/gcs, calc/heidelberg, guideline/aha-ich-2022 | pathway/stroke/step-2, article/ich-management |
| `calc/heidelberg` | Heidelberg Bleeding Classification | `/calculators/heidelberg-bleeding-classification` | calc/nihss | calc/ich-score |
| `calc/abcd2` | ABCD² Score Calculator | `/calculators/abcd2-score` | — | — (pre-existing orphan) |

---

## Trials (26)

| Node ID | Route | Referenced by |
|---|---|---|
| `trial/right-2-trial` | `/trials/right-2-trial` | trial/mr-asap-trial (broken ref — mr-asap-trial has no node) |
| `trial/extend-trial` | `/trials/extend-trial` | — |
| `trial/wake-up-trial` | `/trials/wake-up-trial` | — |
| `trial/escape-mevo-trial` | `/trials/escape-mevo-trial` | — |
| `trial/elan-study` | `/trials/elan-study` | — |
| `trial/chance-trial` | `/trials/chance-trial` | — |
| `trial/point-trial` | `/trials/point-trial` | — |
| `trial/socrates-trial` | `/trials/socrates-trial` | — |
| `trial/sps3-trial` | `/trials/sps3-trial` | — |
| `trial/sparcl-trial` | `/trials/sparcl-trial` | — |
| `trial/thales-trial` | `/trials/thales-trial` | — |
| `trial/eagle-trial` | `/trials/eagle-trial` | — |
| `trial/best-msu-trial` | `/trials/best-msu-trial` | — |
| `trial/act-trial` | `/trials/act-trial` | — |
| `trial/aramis-trial` | `/trials/aramis-trial` | — |
| `trial/nor-test-trial` | `/trials/nor-test-trial` | — |
| `trial/nor-test-2-part-a-trial` | `/trials/nor-test-2-part-a-trial` | — |
| `trial/prisms-trial` | `/trials/prisms-trial` | — |
| `trial/prost-trial` | `/trials/prost-trial` | — |
| `trial/prost-2-trial` | `/trials/prost-2-trial` | — |
| `trial/raise-trial` | `/trials/raise-trial` | — |
| `trial/taste-trial` | `/trials/taste-trial` | — |
| `trial/thaws-trial` | `/trials/thaws-trial` | — |
| `trial/trace-2-trial` | `/trials/trace-2-trial` | — |
| `trial/trace-iii-trial` | `/trials/trace-iii-trial` | — |
| `trial/weave-trial` | `/trials/weave-trial` | — |

---

## Stubs (not yet routable)

Referenced by nodes above but not yet routable pages. Prevents orphan-check false positives.

| Stub ID | Referenced by |
|---|---|
| `pathway/stroke/step-2` | calc/gcs, calc/ich-score |
| `trial/hemphill-2001` | calc/ich-score |
| `guideline/aha-ich-2022` | calc/ich-score |
| `pathway/late-window-ivt` | trial/extend-trial |

---

## Known issues (pre-existing, not introduced by guide-hub-5f)

| Issue | Details |
|---|---|
| Broken reference | `trial/mr-asap-trial` referenced by `trial/right-2-trial` but has no node. Flagged for librarian follow-up. |
| Orphan calc | `calc/abcd2` has no inbound references. Pre-existing. |
| Orphan trials | 24 of 26 trial nodes have no inbound references. Trial-to-article cross-links not yet wired. |

---

## How to regenerate

The SEO Specialist regenerates this file from link-graph.json at the end of every swarm. If you see this file drift from the JSON, flag it immediately.
