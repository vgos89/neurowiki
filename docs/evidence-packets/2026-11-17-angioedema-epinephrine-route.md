# Evidence packet: orolingual angioedema protocol, epinephrine route (2026-11-17)

**Change requested by V, 2026-11-17:** "Fix angioedema." Class E (drug route on a live bedside protocol).

## Source position

| Source | What it says about the epinephrine step (Table 6, row 9) | Status |
|---|---|---|
| Held guideline PDF, `Articles/Guidelines/2026-Guideline-for-acute-ischemic-stroke.pdf`, printed page e40 | 0.1% epinephrine (1 mg/mL), 0.3 mL, given "subcutaneously", or by nebulizer | FIRST PROOF (e00-e00). Superseded for this row. |
| Publisher correction, Stroke 2026;57(8):e461-e467, DOI 10.1161/STR.0000000000000530, item 10 | Same row, page e40: the route word is replaced with "intramuscularly". Concentration, volume and the nebulizer alternative are restated unchanged. | Current text of record. |

The correction notice names the page (e40), the table (Table 6) and the row (ninth), and gives the before and after sentences. The only word that differs between them is the route.

## How the correction was read

- Read in full on the publisher's site by the orchestrator on 2026-11-16 (summary: `docs/evidence-packets/2026-11-16-ais-2026-guideline-correction-summary.md`, item 10).
- Item 10 re-read on the publisher's site on 2026-11-17, immediately before this edit, by searching the page text for the row. Both readings agree.
- Automated fetches of the publisher page return HTTP 403, so no agent has read it independently. This is a single-reader finding, read twice. The held PDF page was re-extracted on 2026-11-17 and still shows the first-proof wording, which matches the "before" sentence in the notice word for word. That match is the cross-check that the notice and the held document describe the same row.

## What the live protocol said and now says

`src/components/article/stroke/OrolingualEdemaProtocolModal.tsx`, step "If progression":

- Before: Epinephrine 0.1% (1 mg/mL) 0.3 mL SC, OR 0.5 mg nebulized.
- After: Epinephrine 0.1% (1 mg/mL) 0.3 mL IM, OR 0.5 mg nebulized.

Nothing else in the protocol changes.

## Sweep of other surfaces

- The protocol modal is one component, opened from the NIHSS calculator, Stroke Code and the timestamp bubble. All three render the same text.
- `src/data/strokeGuidelineMindmapData.ts` mentions epinephrine with no route. No change.
- `src/data/aha2026StrokeGuideline.ts` (the in-repo mirror, not a source) already reads "0.3 mL IM". No change, and it was not used as evidence.
- No other file in `src/` carries the epinephrine dose or route (searched for epinephrine, adrenaline, "0.3 mL").
- Icatibant stays subcutaneous: the first proof says so and the correction does not touch it.

## Left as is, flagged for the reviewer

1. **Nebulizer wording.** The guideline row (before and after the correction) expresses the nebulized option with a unit that reads oddly for a dose. The live protocol says "0.5 mg nebulized", a pre-existing paraphrase. Not changed here.
2. **No claim tag.** The protocol steps are plain strings with no claim id and no registry citation. A registry record needs verbatim `quoted_text` from a held guideline PDF (CLAUDE.md §13.9), and the held PDF still carries the superseded sentence. Binding this protocol to a claim waits on the final published PDF being added to the Guidelines folder.
3. **Visible reference line** stays "AHA/ASA 2026, Table 6; Refs 53-54." The corrected online guideline is the guideline of record, so the reference is still accurate.
