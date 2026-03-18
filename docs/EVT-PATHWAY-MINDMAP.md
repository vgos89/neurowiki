# EVT Pathway Mind Map and Flow Chart

Source of truth: [src/pages/EvtPathway.tsx](/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/pages/EvtPathway.tsx)

These diagrams reflect the current coded logic in the EVT pathway, not a simplified textbook version.

## Mind Map

```mermaid
mindmap
  root((EVT Pathway))
    Entry
      Occlusion type
        LVO
          Basilar
          Anterior circulation
        MeVO
          Dominant M2
          Nondominant M2
          Codominant M2
          Distal MCA
          ACA
          PCA
    LVO hard stops
      No LVO
        Not Eligible
      Prestroke mRS >4
        Not Eligible
      Age <18
        Consult
      Missing mRS or NIHSS or time
        Incomplete
    LVO basilar 0 to 24h
      mRS 0 to 1 required
      pc-ASPECTS >=6 and NIHSS >=10
        Eligible
        Class I
      pc-ASPECTS >=6 and NIHSS 6 to 9
        Clinical Judgment
        Class IIb
      pc-ASPECTS >=6 and NIHSS <6
        Consult
      mRS >=2
        Not Eligible
      pc-ASPECTS <6
        Avoid EVT
    LVO anterior 0 to 6h
      NIHSS 0 to 5
        Clinical Judgment
      mRS 2 and ASPECTS >=6
        EVT Reasonable
      mRS 2 and ASPECTS <6
        Consult
      mRS 3 to 4 and ASPECTS >=6
        Clinical Judgment
      mRS 3 to 4 and ASPECTS <6
        Consult
      mRS 0 to 1 and ASPECTS 3 to 10
        Eligible
        Class I
      ASPECTS 0 to 2 and severe hypodensity >=26 mL
        Clinical Judgment
      ASPECTS 0 to 2 and age <80 and no mass effect and no severe hypodensity
        EVT Reasonable
      ASPECTS 0 to 2 otherwise
        Consult
    LVO anterior 6 to 24h
      mRS 2
        Not Eligible
      mRS 3 to 4
        Not Eligible
      ASPECTS >=6 and NIHSS >=6 and mRS 0 to 1
        Eligible
        Class I
      ASPECTS 3 to 5 and severe hypodensity >=26 mL
        Clinical Judgment
      ASPECTS 3 to 5 and age <80 and NIHSS >=6 and no mass effect and no severe hypodensity and mRS 0 to 1
        Eligible
        Class I
      DAWN criteria
        Eligible
      DEFUSE-3 criteria
        Eligible
      Core 50 to 100 mL
        Clinical Judgment
      Core >100 mL
        Avoid EVT
      Otherwise
        Not Eligible
    MeVO hard stops
      Baseline dependency
        Avoid EVT
      NIHSS <5 and non-disabling deficit
        Avoid EVT
      Unfavorable imaging
        Avoid EVT
    MeVO favorable path
      Dominant M2
        Disabling deficit or NIHSS >=5
        Technical feasibility yes
        EVT Reasonable
      Nondominant M2 or codominant M2 or distal MCA or ACA or PCA
        Avoid EVT
        Stent retriever Class III no benefit
      Technical feasibility no
        BMT Preferred
      Other remaining MeVO patterns
        BMT Preferred
```

## Flow Chart

```mermaid
flowchart TD
    A([Start]) --> B{Occlusion type}
    B -->|LVO| L0{LVO confirmed?}
    B -->|MeVO| M0[MeVO pathway]
    B -->|Unknown| Z0[No result yet]

    L0 -->|No| L0N[Not Eligible\nNo Large Vessel Occlusion]
    L0 -->|Yes| L1{Prestroke mRS}
    L1 -->|>4| L1N[Not Eligible\nPre-stroke disability]
    L1 -->|0-1 or 2 or 3-4| L2{Age}
    L2 -->|<18| L2N[Consult\nPediatric patient]
    L2 -->|18+| L3{Clinical data complete?}
    L3 -->|No| L3N[Incomplete]
    L3 -->|Yes| L4{LVO location}

    L4 -->|Basilar| B0{Prestroke mRS 0-1?}
    B0 -->|No| B0N[Not Eligible\nBasilar pathway limited to mRS 0-1]
    B0 -->|Yes| B1{pc-ASPECTS}
    B1 -->|<6| B1N[Avoid EVT]
    B1 -->|>=6| B2{NIHSS}
    B2 -->|>=10| B2Y[Eligible\nBasilar Class I]
    B2 -->|6-9| B2M[Clinical Judgment\nBasilar Class IIb]
    B2 -->|<6| B2L[Consult\nLow NIHSS basilar]

    L4 -->|Anterior| A1{Time window}

    A1 -->|0-6h| A2{ASPECTS available?}
    A2 -->|No| A2N[Not Eligible\nPending imaging]
    A2 -->|Yes| A3{NIHSS 0-5?}
    A3 -->|Yes| A3Y[Clinical Judgment\nLow NIHSS]
    A3 -->|No| A4{Prestroke mRS}
    A4 -->|mRS 2| A5{ASPECTS >=6?}
    A5 -->|Yes| A5Y[EVT Reasonable\nEarly mRS 2]
    A5 -->|No| A5N[Consult]
    A4 -->|mRS 3-4| A6{ASPECTS >=6?}
    A6 -->|Yes| A6Y[Clinical Judgment\nEarly mRS 3-4]
    A6 -->|No| A6N[Consult]
    A4 -->|mRS 0-1| A7{ASPECTS}
    A7 -->|3-10| A7Y[Eligible\nEarly Class I]
    A7 -->|0-2| A8{Severe CT hypodensity >=26 mL?}
    A8 -->|Yes| A8W[Clinical Judgment\nLarge-core warning]
    A8 -->|No| A9{Age <80 and no mass effect?}
    A9 -->|Yes| A9Y[EVT Reasonable\nVery large core Class IIa]
    A9 -->|No| A9N[Consult]

    A1 -->|6-24h| LW1{Prestroke mRS}
    LW1 -->|mRS 2| LW1N[Not Eligible]
    LW1 -->|mRS 3-4| LW1M[Not Eligible]
    LW1 -->|mRS 0-1| LW2{ASPECTS and NIHSS}
    LW2 -->|ASPECTS >=6 and NIHSS >=6| LW2Y[Eligible\nLate Class I]
    LW2 -->|ASPECTS 3-5| LW2A{Severe CT hypodensity >=26 mL?}
    LW2A -->|Yes| LW2W[Clinical Judgment\nLarge-core warning]
    LW2A -->|No| LW2B{Age <80 and no mass effect and NIHSS >=6?}
    LW2B -->|Yes| LW2M[Eligible\nLate Class I selected]
    LW2B -->|No| LW3{Core entered?}
    LW2 -->|Other| LW3
    LW3 -->|No| LW3N[Not Eligible\nPending imaging]
    LW3 -->|Yes| LW4{DAWN criteria?}
    LW4 -->|Yes| LW4Y[Eligible\nDAWN]
    LW4 -->|No| LW5{DEFUSE-3 criteria?}
    LW5 -->|Yes| LW5Y[Eligible\nDEFUSE-3]
    LW5 -->|No| LW6{Core volume}
    LW6 -->|50-100 mL| LW6M[Clinical Judgment\nLarge core]
    LW6 -->|>100 mL| LW6N[Avoid EVT]
    LW6 -->|Other| LW6O[Not Eligible\nNo target profile]

    M0 --> M1{Baseline dependent?}
    M1 -->|Yes| M1N[Avoid EVT]
    M1 -->|No| M2{NIHSS <5 and non-disabling?}
    M2 -->|Yes| M2N[Avoid EVT]
    M2 -->|No| M3{Favorable imaging / salvageable tissue?}
    M3 -->|No| M3N[Avoid EVT]
    M3 -->|Yes| M4{Location}
    M4 -->|Dominant M2| M5{Disabling deficit or NIHSS >=5 and technical feasible?}
    M5 -->|Yes| M5Y[EVT Reasonable]
    M5 -->|No| M5N[BMT Preferred]
    M4 -->|Nondominant M2 / codominant M2 / distal MCA / ACA / PCA| M4N[Avoid EVT\nStent retriever Class III no benefit]
    M4 -->|Other remaining pattern| M6{Technical feasible?}
    M6 -->|No| M6N[BMT Preferred]
    M6 -->|Yes| M6Y[BMT Preferred]
```

## Current Thinking Rationale

- The first split is by occlusion type: the component runs either `calculateLvoProtocol` or `calculateMevoProtocol`.
- Basilar LVO is a single `0–24h` branch in the code:
  - it requires baseline `mRS 0–1`
  - it uses `pc-ASPECTS >=6` as the imaging gate
  - it then stratifies by NIHSS (`>=10`, `6–9`, `<6`)
  - it does not use perfusion mismatch or late-window penumbra gating
- Early anterior LVO keeps the mRS-based early-window allowances (`mRS 2` and selected `mRS 3–4`) but now adds a severe-hypodensity warning branch for `ASPECTS 0–2`.
- Late anterior LVO now blocks `mRS 2` and `mRS 3–4` outright:
  - `ASPECTS >=6` with `NIHSS >=6` and `mRS 0–1` remains an immediate Class I approval
  - `ASPECTS 3–5` requires `age <80`, no significant mass effect, and no severe CT hypodensity `>=26 mL`
  - DAWN and DEFUSE-3 only become relevant when those ASPECTS-driven approvals do not trigger
- MeVO remains conservative:
  - selected dominant proximal M2 can still route to `EVT Reasonable`
  - nondominant/codominant M2 and more distal territories now explicitly reject stent-retriever EVT as `Class III: No Benefit`

## Implementation Notes

- The result model can return `Eligible`, `EVT Reasonable`, `Clinical Judgment`, `Consult`, `BMT Preferred`, `Avoid EVT`, `Not Eligible`, or `Incomplete`.
- `eligible: true` is still used for both strong recommendations and softer judgment pathways like `Clinical Judgment` or `EVT Reasonable`.
- The UI remains sectioned as `Triage -> Clinical -> Imaging -> Decision`, but the real decision engine is the two calculators:
  - LVO: [calculateLvoProtocol](/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/pages/EvtPathway.tsx#L140)
  - MeVO: [calculateMevoProtocol](/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/pages/EvtPathway.tsx#L381)
