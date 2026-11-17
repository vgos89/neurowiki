# CLINICAL CONTENT SPEC: IVT time-window chip on the patient panel (NIHSS calculator + Stroke Code step 1), wake-up entries
Class E. Routing: ready for clinical-reviewer. No source files edited.

What I checked: the PDF page e44 rendered as an image. The COR/LOE cells are §4.6.3 Rec 1 = 2a/B-R, Rec 2 = 2a/B-R, Rec 3 = 2b/B-R. I also read the reading-order extract, the correction summary packet, the registry records for 4.6.1, 4.6.2 and 4.6.3, PatientContextPanel.tsx lines 398-540, CodeModeStep1.tsx `WindowBadge`, and ExtendedIVTPathway.tsx lines 321-334, 464 and 1020-1031. I did NOT find the exact `ivt-window-4.5h` entry in claims.ts (I had no grep tool and did not read the whole file), and I did NOT read the `extend-trial-2019` or `wake-up-trial-2018` quoted_text. Item 6 gives the full replacement entry, so the implementer only has to swap it in. The open items list what the reviewer still has to check.

Verbatim source text (held first proof, §4.6.3):
- Rec 1 (COR 2a, LOE B-R): "In patients with AIS who (a) have unknown time of onset and are within 4.5 hours from symptom recognition and (b) have an MRI-DWI lesion smaller than one-third of the MCA territory and no marked signal change on FLAIR, IVT administered within 4.5 hours of stroke symptom recognition can be beneficial to improve functional outcomes."
- Rec 2 (COR 2a, LOE B-R): "In patients with AIS who have salvageable ischemic penumbra detected on automated perfusion imaging and who (a) awake with stroke symptoms within 9 hours from the midpoint of sleep or (b) are 4.5–9 hours from last known well, IV thrombolysis may be reasonable to improve functional outcomes."
- Rec 3 (COR 2b, LOE B-R): LVO, 4.5 to 24 h from onset or LKW, cannot receive EVT. This matters for the labels in item 2.
- §4.6.2 (registry quoted_text): "...presenting within 4.5 hours of symptom onset or last known well..."

Defects found in existing code (fix as part of this change):
- D1. The comment at PatientContextPanel.tsx ~411-414 says "§4.6.3 is the separate late-window TNK-for-LVO recommendation (4.5–24h), not this extended IVT window." That is wrong. §4.6.3 Rec 1 and Rec 2 ARE the extended 4.5–9 h and wake-up windows; Rec 3 is the 4.5–24 h LVO row, and it names no agent. Replacement comment: "Standard ≤4.5 h from LKW per AHA/ASA 2026 §4.6.1/§4.6.2. Extended tiers per §4.6.3 Rec 1 (wake-up, ≤4.5 h from symptom recognition, MRI DWI-FLAIR selected) and Rec 2 (≤9 h from sleep midpoint, or 4.5–9 h from LKW, perfusion selected). The chip states a time category only."
- D2. Stroke Code's label `Outside tPA window` is clinically inaccurate. Rec 3 keeps a 4.5–24 h IVT route open for some patients beyond 9 h, and "tPA" names one drug when either agent may be used. Retire it. Its aria-label "Within 4.5 hour tPA window" goes for the same reason.

1. THE RULE (one pure function, shared by both pages)
Inputs: asleepAt, wokeAt, now. Precondition: asleepAt ≤ wokeAt ≤ now. If the precondition fails, return null (no chip, no line).
Definitions: sleepMidpoint = asleepAt + (wokeAt − asleepAt)/2. Each elapsed value is whole minutes, floored and clamped at 0, the same as the existing `ivt` block: aMin = now − asleepAt, wMin = now − wokeAt, mMin = now − sleepMidpoint.
- `standard` if aMin ≤ 270. Grounds: §4.6.1/§4.6.2 ("within 4.5 hours of symptom onset or last known well"). For a wake-up patient, last asleep without symptoms is the LKW, so this is the same rule as any patient.
- else `extended` if wMin ≤ 270 [§4.6.3 Rec 1: unknown onset, within 4.5 h of symptom recognition] OR mMin ≤ 540 [§4.6.3 Rec 2(a): within 9 h of the midpoint of sleep].
- else `outside`.
Your proposal is CONFIRMED. All boundaries are inclusive (≤), which matches the witnessed rule and the Late-window IVT pathway (`minutesSinceWaking <= 270`, `hoursSinceMidpoint <= 9`).
Notes:
- Rec 2(b) (4.5–9 h from LKW) needs no clause. Because the sleep midpoint is never earlier than asleepAt, aMin ≤ 540 always implies mMin ≤ 540.
- The tiers always run in order standard → extended → outside, with no gap. At aMin = 271, wMin ≤ 270 must hold because wokeAt ≥ asleepAt.
- Witnessed LKW logic is unchanged: ≤270 min standard, ≤540 min extended, else outside.
- One tier or two: use ONE `extended` tier for both imaging routes. The chip states a time category, and the witnessed 4.5–9 h chip already omits its imaging requirement, so this keeps parity. The elapsed line (item 3) shows both wake-up clocks, so a clinician can see when only the MRI route (Rec 1) is still open. A distinct label for that case is listed in open item (c).
- `inWindow` (which gates the BP prompt and the countdown) is `tier === 'standard'` for wake-up entries too.

2. ONE LABEL SET (chip text; same classes and colours as the current NIHSS chip)
| Tier | Witnessed LKW | Wake-up entry | aria-label |
|---|---|---|---|
| standard | `Within 4.5h` (green) | `Within 4.5h` (green) | `Within 4.5 hours of last known well` |
| standard, final 30 min | `{N} min left` (amber) | `{N} min left` (amber) | `{N} minutes left in the 4.5 hour window` |
| extended | `4.5–9h window` (orange) | `Extended window` (orange) | witnessed: `4.5 to 9 hours from last known well`; wake-up: `Within 4.5 hours of waking or 9 hours of the sleep midpoint` |
| outside | `Beyond 9h` (rose) | `Beyond 9h` (rose) | witnessed: `More than 9 hours from last known well`; wake-up: `More than 4.5 hours since waking and more than 9 hours since the sleep midpoint` |
- Why wake-up gets different text in the extended tier: "4.5–9h window" reads as hours from LKW, and that is false for wake-up entries. In the long-sleep case (item 7, row 4) the patient is 17 h from last asleep. In the midpoint-exactly-9 h case (row 5) the patient is 13 h from last asleep.
- `Beyond 9h` stays true for wake-up entries: in the outside tier, both the sleep-midpoint clock and the last-asleep clock are past 9 h.
- Neither outside label says "outside" or "no IVT", because Rec 3 runs to 24 h.
- Stroke Code's `Extended window` (for witnessed patients) and `Outside tPA window` are retired. Stroke Code keeps its Check and AlertTriangle icons only if NIHSS gains them too: one look on both pages.
- Amber countdown: applies to wake-up entries in the standard tier only, counted against last asleep (the LKW clock): N = 270 − aMin, shown when N ≤ 30. There is no countdown in the extended tier for either entry type, which matches witnessed behaviour.

3. ELAPSED LINE (text-xs, beside the chip; reuses the existing `{h} h {m} min` / `{m} min` formatter)
- Witnessed: unchanged, `~{elapsed} since onset`.
- Wake-up, standard tier: `~{a} since last asleep`
- Wake-up, extended or outside tier: `~{w} since woke · ~{m} since sleep midpoint`
- Longest case is about 55 characters, for example "~4 h 29 min since woke · ~11 h 59 min since sleep midpoint". The container already has `flex-wrap`, so on a 390 px row the chip drops to a second line. That is acceptable, and every clock is still named.
- In the standard tier, the woke and sleep-midpoint clocks are left off on purpose: the LKW clock decides that tier.

4. THE SENTENCE
- KEEP `Wake-up or unknown onset, so time since onset is not shown.` exactly as it is when lkw is null and there is no wakeUp. That state includes wake-up patients whose times were not entered, so the wording is still accurate.
- When wakeUp is present: do not show the sentence. The item 3 line and the item 2 chip replace it, in the same slot directly under the Last known well row.

5. COPIED NIHSS NOTE: no change, as you proposed by default. The note records the absolute times; an elapsed figure would be stale as soon as it was pasted.

6. CLAIMS
Keep the single id `ivt-window-4.5h`: one chip element, tagged on both pages. Stroke Code's moved badge must gain `data-claim="ivt-window-4.5h"`; it is untagged today. Replacement entry (keep the existing `surfaces` value as it is):
- citation_ids: `['wake-up-trial-2018', 'extend-trial-2019', 'aha-asa-2026-4.6.1', 'aha-asa-2026-4.6.2', 'aha-asa-2026-4.6.3']` (trials first by year, then guidelines, per the ordering convention).
- description: `IV thrombolysis time-window chip on the patient panel (NIHSS calculator and Stroke Code step 1). States a time category only; never eligibility, grade or recommendation strength. Witnessed LKW: Within 4.5h when ≤4.5 h from LKW (AHA/ASA 2026 §4.6.1, §4.6.2); 4.5–9h window when >4.5 and ≤9 h (§4.6.3 Rec 2b, EXTEND); Beyond 9h otherwise. Wake-up entry: Within 4.5h when ≤4.5 h from last asleep without symptoms (the LKW); Extended window when ≤4.5 h from waking with symptoms (§4.6.3 Rec 1, WAKE-UP) or ≤9 h from the sleep midpoint (§4.6.3 Rec 2a, EXTEND); Beyond 9h otherwise. Time criteria are unchanged by the published correction (Stroke 2026;57(8):e461-e467).`
- `aha-asa-2026-4.6.3` MUST be added. It is the only guideline source for every non-standard tier, including the witnessed 4.5–9 h tier that already ships, so its absence is an existing gap. Its first-proof quoted_text contains, word for word, every time criterion this rule uses: "within 4.5 hours from symptom recognition", "within 9 hours from the midpoint of sleep", "4.5–9 hours from last known well". No quoted_text edit is needed.
- First proof vs corrected text: the correction changes Rec 2's population gate (not eligible for EVT) and its verb strength only. Rec 1, all time criteria, and §4.6.1 are untouched. The §4.6.2 change adds the 90 mg cap, which does not affect the 4.5 h wording. Every string in items 2 and 3 names a time window or a clock and never a strength, grade, verb or eligibility, so each one is equally true under both versions.
- Freshness: `aha-asa-2026-4.6.3` has a 3-month review window and was last reviewed 2026-09-01, so it goes stale on 2026-12-01. The hook will block once it lapses, so either ship before then or re-review it under §13.6 against the corrected final text.

7. BOUNDARY TEST CASES (same calendar night unless marked +1 day)
| # | asleepAt | wokeAt | now | aMin / wMin / mMin | Tier | Decided by |
|---|---|---|---|---|---|---|
| 1 | 14:00 | 15:00 | 17:30 | 210/150/180 | standard, `Within 4.5h` | LKW ≤270 (short nap) |
| 2 | 14:00 | 15:00 | 18:10 | 250/190/220 | standard, amber `20 min left` | LKW ≤270, countdown |
| 3 | 23:00 | 06:00 (+1) | 07:00 (+1) | 480/60/270 | extended | Rec 1 (wMin 60) and Rec 2a (mMin 270) |
| 4 | 20:00 | 10:00 (+1) | 13:00 (+1) | 1020/180/600 | extended | Rec 1 only (midpoint 03:00, 10 h) |
| 5 | 22:00 | 06:00 (+1) | 11:00 (+1) | 780/300/540 | extended | Rec 2a only, midpoint exactly 9 h (inclusive) |
| 6 | 22:00 | 06:00 (+1) | 11:01 (+1) | 781/301/541 | outside, `Beyond 9h` | both clocks expired |
| 7 | 20:00 | 10:00 (+1) | 14:30 (+1) | 1110/270/690 | extended | Rec 1, woke exactly 4.5 h (inclusive) |
| 8 | 20:00 | 10:00 (+1) | 14:31 (+1) | 1111/271/691 | outside | everything past |
| 9 | 01:00 | 03:00 | 05:30 | 270/150/210 | standard, amber `0 min left` | LKW exactly 4.5 h (inclusive) |
| 10 | 01:00 | 03:00 | 05:31 | 271/151/211 | extended | Rec 1 and Rec 2a (no gap after standard) |
| 11 | 22:00 | 06:00 (+1) | 12:00 (+1) | 840/360/600 | outside | everything expired |
| 12 | 06:00 | 05:00 | any | n/a | null (no chip, no line) | invalid order |
Witnessed regression checks: 270 min gives standard; 271 gives `4.5–9h window`; 540 gives `4.5–9h window`; 541 gives `Beyond 9h`.

8. OPEN ITEMS FOR THE MEDICAL-CONTENT REVIEWER
(a) Whether to show a chip at all for wake-up patients. Both wake-up routes require imaging (MRI DWI-FLAIR for Rec 1, automated perfusion for Rec 2a), and the chip does not say so. My position: show it, because the witnessed 4.5–9 h chip already sets this precedent and the request asks for parity. The Late-window IVT pathway is where imaging selection is worked through. Reviewer to confirm.
(b) First proof vs corrected text. The corrected Rec 2 excludes patients eligible for EVT. An EVT candidate at 6 h, or a wake-up EVT candidate, will still see an orange chip. That is a true time fact, but some may read it as a prompt to give lytic (the same exposure the witnessed chip already has today). Options: accept, or later add a separate EVT-gate note, which is out of scope here. The corrected verbatim Rec 2 text is not held; this spec relies only on its time criteria, which the correction summary says are unchanged.
(c) Label wording. (i) `Extended window` (wake-up) vs `4.5–9h window` (witnessed): two labels for one colour tier. The alternative is `Extended window` for both, which drops the number from witnessed entries; the line still shows the hours. (ii) Whether to give the Rec 1-only state (row 4: MRI route open, perfusion route closed) its own label, e.g. `Woke ≤4.5h`. I chose not to, to keep one tier, with the line showing both clocks instead. (iii) `Beyond 9h` for wake-up entries: true for the sleep-midpoint and last-asleep clocks, but it sits beside a woke clock that may read under 9 h. The alternative is `Past wake-up windows`.
(d) Clock reading for Rec 2(a). The guideline says "awake with stroke symptoms within 9 hours from the midpoint of sleep", which could be read as the time of waking rather than the time of treatment. This spec measures now against the midpoint (a stand-in for treatment time), the same as the Late-window IVT pathway. I believe this matches EXTEND's enrolment definition, but I have not verified it: please check it against the `extend-trial-2019` quoted_text, which I did not read.
(e) The BP prompt will now appear for wake-up patients in the standard tier, because `inWindow` uses the LKW clock. This matches V's "BP prompt only in the 4.5h window" direction. Confirm.
(f) The witnessed line says "since onset", but the clock is LKW, which is not necessarily onset. Not changed here; flagged only.
(g) The 4.6.3 citation goes stale on 2026-12-01 (see item 6).
(h) The code comment fix (D1) and retiring `Outside tPA window` (D2) are clinical-accuracy corrections bundled into this change. Confirm they belong in this PR.

Files for the implementer:
- /Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/components/shared/PatientContextPanel.tsx
- /Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/components/article/stroke/CodeModeStep1.tsx
- /Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/lib/citations/claims.ts
- /Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/lib/citations/registry.ts (read only; no edit needed)
- Source: /Users/vaibhav/Documents/NeuroWiki/Articles/Guidelines/2026-Guideline-for-acute-ischemic-stroke.pdf p.44 (first proof)
- Correction summary: /Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/evidence-packets/2026-11-16-ais-2026-guideline-correction-summary.md
Domain skill `stroke-guidelines` was loaded. Its "Wake-up strokes: Eligible if DWI-FLAIR mismatch" line has no 4.5 h-from-recognition qualifier and no perfusion route, so it is not a source and was not used.
