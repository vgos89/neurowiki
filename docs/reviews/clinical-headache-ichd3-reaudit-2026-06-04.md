# Clinical gate — ICHD-3 engine re-audit

**Decision:** findings-confirmed-with-amendments
**Reviewer:** clinical-reviewer (model: opus) — fresh context, no deference to the audit under review
**Date:** 2026-06-04
**Type:** Report-only clinical gate on a report-only audit. No engine, source, or test file changed.
**Gated artifact:** `docs/reviews/medsci-headache-ichd3-reaudit-2026-06-04.md`
**Engine audited:** `src/data/clinicHeadacheData.ts` (829 lines)

---

## Scope — what was read and independently re-derived

- `src/data/clinicHeadacheData.ts` in full (all 829 lines), including every phenotype's `criteria[]`, every `definitional` flag, the helper predicates (L186–190, L370–400), and the evaluator (L697–814) line by line.
- The medical-scientist re-audit (`medsci-headache-ichd3-reaudit-2026-06-04.md`) in full.
- The prior 4-lens audit (`headache-pathway-audit-2026-06-03.md`) for context on the A.4/D.5 "demote, don't delete" recommendation.

The drop-gate control flow (L736–743 → `continue` before L745–768) was re-derived independently, and each "vanishing scenario" chip-set was hand-traced through the evaluator to confirm the phenotype is removed before met/missing/strength compute. No web access: where a fidelity claim rests on verbatim guideline text that cannot be re-fetched read-only, it is ruled "consistent with clinical knowledge and internally coherent," not "independently re-fetched." That residual verbatim-transcription risk sits with the medical-scientist's source retrieval (they hold WebFetch) — the appropriate division of labor.

---

## Per-finding adjudication

### HIGH-1 — Drop-gate deletes the §X.5 near-misses — CONFIRMED. Mechanically true and clinically correct.

The drop-gate (L736–743) sets `definitionalFailed` on the first failed `definitional` criterion and `continue`s the phenotype loop; the met/missing arrays (L745–760) and strength assignment (L762–768) are downstream of that `continue`. So for any phenotype with a failed definitional criterion, the `metCount === total - 1 → 'probable'` branch (L766) is unreachable. The audit's claim that `probable` can never fire for a phenotype whose missing criterion is definitional is correct from the control flow.

The self-contradiction is real: `mig-A` is deliberately NOT definitional (L415–417) to keep the §1.5 path open, but `mig-B` (L419) and `mig-D` (L421) ARE definitional. Hand-trace of scenario 2 — chips `{attacks-gt-10, loc-unilateral, qual-pulsating, sev-severe, act-aggravated, sym-nausea-mild}`, no duration chip — `mig-A`/`mig-C`/`mig-D` all pass, `mig-B` fails (definitional) → migraine without aura is removed entirely. That patient is the textbook ICHD-3 §1.5.1 Probable migraine without aura, and the engine shows nothing. By construction, §1.5 is "all but one of A–D," so no single A–D criterion can be a hard drop without breaking §1.5.

Clinical ruling on demote-don't-delete: endorsed. (1) Demoting to `probable` and naming the missing criterion surfaces §1.5/§2.4/§3.5 — entities ICHD-3 defines precisely as "all but one criterion" — which is *more* faithful, not less. (2) Output is never a diagnosis (L17–18); a "Probable migraine · §1.5 — needs confirmation that attacks last 4–72 h" row tells the clinician the one question left, which is the product's purpose. (3) Silent deletion is the more dangerous failure mode: a false negative at a lookup step steers the clinician away from the right question with no trace.

Ruling on the carve-out boundary: agreed, with one substantive amendment. Keep hard SUPPRESS for `vm-A` (vertigo substrate; closes the V-reported phonophobia-only false-positive), the indomethacin `hiddenUntilTrial` gate (a test, not a near-miss), and the continuous-headache episodic-suppression rule (a contradiction, not a near-miss). Demote the feature/window near-miss criteria `mig-B`, `mig-D`, `tth-B`, `ctth-B`, `cluster-B`, `ph-B`, `sunct-B`.

AMENDMENT — the audit does not draw the gate-vs-near-miss line WITHIN the definitional set, and a literal reading of "demote any single definitional miss for phenotypes with a §X.5 counterpart" would wrongly demote two subclasses:
- **Chronicity thresholds `cm-A` (L594) and `ctth-A` (L475) must SUPPRESS, not demote.** "≥15 days/month for >3 months" defines chronicity; a 5–14-day patient is not "probable chronic" — they are a different entity (episodic). Demoting would surface "Probable chronic TTH" for a patient whose frequency places them elsewhere.
- **Exclusion criteria `tth-D` (L463) and `ctth-D` (L482) must SUPPRESS, not demote.** Their failure is positive evidence *for a different phenotype* (migraine-defining nausea/vomiting). Surfacing "Probable chronic TTH — needs you to confirm no vomiting" for a vomiting patient is clinically backwards.

The eventual rebuild must classify definitional criteria into **frequency/threshold/substrate gates** (suppress: `cm-A`, `ctth-A`, `vm-A`, indomethacin gate, continuous-contradiction) vs **feature/window near-miss criteria** (demote: `mig-B`, `mig-D`, `tth-B`, `ctth-B`, `cluster-B`, `ph-B`, `sunct-B`). "Demote on single definitional miss" is correct only for the second kind.

### HIGH-2 — `loc-unilateral` wired to §1.2 C aura-laterality — CONFIRMED. Severity: medium (not higher than HIGH-1).

`auraCharacteristicCount` (L391–398) adds `(has(s, 'loc-unilateral') ? 1 : 0)` for the 6th characteristic. `loc-unilateral` is the headache PAIN-location chip (L229), used as pain laterality in `migraineCharacterCount` (L375), `cluster-B` (L499), `hc-A` (L524), `ph-B` (L617), `sunct-B` (L641). ICHD-3 §1.2 C item 4 is a property of the aura symptom, not the headache. Confirmed semantic mismap. `aura-C` is not definitional (L439), so a mis-count cannot trigger the drop-gate; the ≥3-of-6 threshold flips only at the 2↔3 boundary for a patient with unilateral pain but bilateral aura (or vice versa) — uncommon. It nonetheless produces a wrong met-criterion audit-trail string, which is exactly the "show how you got there" surface the product is built around. Fix: dedicated `aura-symptom-unilateral` chip; stop borrowing `loc-unilateral`.

### MED-1 — `aura-A` admits a 1-attack patient — CONFIRMED. Medium-low.

`aura-A` (L437) is true on `attacks-lt-5 || attacks-5-to-10 || attacks-gt-10`; `attacks-lt-5` ("Fewer than 5," L200) includes 1 attack. `mig-A` (L418) excludes `attacks-lt-5`. The two migraine entries treat identical vocabulary differently; a 1-attack patient satisfies the §1.2 A "≥2 attacks" gate. Root cause is a chip-granularity gap (no "≥2" / "2–4" chip). Fix: split `attacks-lt-5` or add `attacks-ge-2`, or at minimum make `aura-A`'s `missingCriteria.description` flag the limit.

### MED-2 — VM stub omits criterion B (migraine history); `vm-B` mislabeled — CONFIRMED as a real gap, with an added guardrail.

The VM phenotype (L563–577) encodes 2 criteria. `vm-A` (L574) = `vest-vertigo-migrainous` (definitional). `vm-B` (L575) = `sym-photophobia || sym-phonophobia || aura-visual`. No chip anywhere expresses an established prior migraine diagnosis (full chip union L23–76 and all groups L194–352 checked). Clinically, vestibular migraine by definition requires a current/past history of migraine — the feature distinguishing it from BPPV, Menière, vestibular paroxysmia. So the labeled `vm-B` is the associated-features criterion (true criterion C), and the migraine-history criterion (true criterion B) is absent. A non-migraineur with vertigo + photophobia surfaces today as a 2/2 match (trace confirmed). `isAppendix: true` (L567) and the research-criteria framing (L283, L568) mitigate.

GUARDRAIL: this over-surfacing *worsens* under the demote fix unless handled. When criterion B (established migraine history) is added, it must be a SUPPRESS gate, not a demotable near-miss — same class as `vm-A`. VM requires both substrates (vertigo AND migraine history); neither is a "one tick short" feature. The label fix (`vm-B` should read as criterion C) needs no new source and should land now; the full 5-criterion Bárány expansion stays `blocked:source-not-resolved` pending Lempert 2012 (PMID 23142830).

### MED-3 — SUNCT/SUNA parent-level can't split subtypes; teach text over-promises — CONFIRMED, low-medium, acceptable.

`sunct-suna` (L633–645) is one phenotype; `sunct-C` (L642) = the single composite `sym-autonomic-ipsilateral` chip (no granular conjunctival-injection/lacrimation chips, confirmed L250–258). The engine cannot compute SUNCT (3.3.1) vs SUNA (3.3.2). The `teachPearl` (L638) promises the distinction anyway. Parent-level §3.3 matching is clinically valid and faithful; the only defect is the teach copy. This is C-clinical copy, not a logic error. Fix: add granular autonomic chips, or trim the teach text to say the tool surfaces the §3.3 parent and the subtype is a clinician call.

### LOW-1 — §1.1 C "moderate or severe" as one feature — CONFIRMED REFUTED (encoding correct).

`migraineCharacterCount` (L373–380) increments once on `sev-moderate || sev-severe` (L377). ICHD-3 §1.1 C item 3 is "moderate or severe pain intensity" — a single characteristic. Collapse is faithful; same pattern correctly applied to TTH (`sev-mild || sev-moderate`, L386). The candidate concern is correctly refuted.

### LOW-2 — §2.3 D nausea split (`ctth-D`) — CONFIRMED FAITHFUL.

`ctth-D` (L482) = `!sym-nausea-moderate-severe && !sym-vomiting && countOf(['sym-nausea-mild','sym-photophobia','sym-phonophobia']) <= 1`. Matches ICHD-3 §2.3 D (clause 1: ≤1 of photophobia/phonophobia/mild nausea; clause 2: no moderate/severe nausea, no vomiting). Episodic `tth-D` (L463) correctly excludes mild nausea entirely (§2.2 D). The two TTH-D criteria are correctly differentiated.

### LOW-3 — Definitional-flag sweep + the two intentional non-definitional choices — CONFIRMED SOUND, extended.

`mig-A` non-definitional (preserves §1.5) — correct. `cluster-D` / `ph-D` non-definitional (between-bouts bout-frequency un-surfaceable via chips) — correct and the right call for a clinic lookup tool. `tth-D` definitional with all-negative chips — safe, because the `hasPositiveEvidence` pre-gate (L725–729) prevents empty/exclusion-only input from reaching the drop-gate (traced). EXTENSION: the table marks `ctth-A`, `ctth-D`, `cm-A` "Correct" in isolation (true — they ARE gating), but under the proposed fix these must SUPPRESS, not demote (see HIGH-1 amendment). No per-flag cell disputed; the carve-out is extended to name chronicity thresholds and exclusion criteria as suppress-not-demote members.

### Evaluator-level mechanisms — independently spot-checked, all confirmed.

`hiddenUntilTrial` gate (L704); episodic suppression (L710–711, correctly excludes CM/HC/NDPH, includes PH+SUNCT); §2.3 Note 1 CM-suppresses-CTTH (L716–720, re-checks CM via `every(evaluate)`); strength-after-drop interaction (L762–768, the HIGH-1 mechanism). `PROBABLE_SECTION_FOR` (L666–676) correctly omits `chronic-migraine` and maps all four chapter-3 TACs to §3.5 — faithful, but its practical value is nullified by the drop-gate.

---

## Clinical-safety check on the proposed fix direction

Demoting definitional near-misses to "probable / considered — needs confirmation of [criterion]" does NOT create an unsafe false-positive surface, provided the gate-vs-near-miss split is enforced. Output is criterion-fulfilment, never a diagnosis (L17–18); the missing criterion is named; a labeled demoted near-miss is safer than the current silent deletion. The risk is not "demoting makes it unsafe" — it is "demoting the WRONG criteria (chronicity thresholds, exclusion criteria, substrate gates) surfaces phenotypes the patient definitionally cannot have."

Guardrails the eventual clinical-logic rebuild MUST keep (non-negotiable):

1. Keep as hard SUPPRESS gates — never demote: `vm-A`; the indomethacin `hiddenUntilTrial` gate (hc-D / ph-E); the episodic-suppression-on-`dur-continuous` rule; AND (amendment) chronicity thresholds `cm-A` / `ctth-A` and exclusion criteria `tth-D` / `ctth-D` / VM criterion-B-when-added. Demote ONLY `mig-B`, `mig-D`, `tth-B`, `ctth-B`, `cluster-B`, `ph-B`, `sunct-B`.
2. The SNNOOP10 red-flag short-circuit must render non-collapsibly on EVERY result (4-lens Finding A.1 patient-safety item). `anyRedFlagActive` (L363) exists; the rebuild must surface the dangerous-mimic backstop at the result, not only when a red-flag chip was pre-ticked. Independent of the drop→demote work; must not slip.
3. Never label the output a "diagnosis." The L17–18 output-language rule must survive across every new surface.
4. No calibrated "%" likelihood. A criteria-met fraction is not a diagnostic probability (4-lens Finding A.3); the demoted-near-miss surface shows "needs confirmation of [criterion]," not a percentage.
5. Preserve the dev-time invariant that every phenotype retains ≥1 definitional/gating criterion.
6. Fix HIGH-2 before the demoted aura-missing-criterion text ships, or the prompt will instruct a clinician to tick the pain-location chip to satisfy an aura characteristic.

---

## Anything the audit missed or mis-ranked

1. The one real gap: the audit does not draw the gate-vs-near-miss line within the definitional set; a literal reading of its carve-out would wrongly demote `ctth-A` (chronicity) and `ctth-D` / `tth-D` (exclusion). This is the reason the decision is `findings-confirmed-with-amendments`. It sharpens the fix so the rebuild does not trade one false-negative class for a new false-positive class.
2. MED-2 interaction under-stated: VM over-surfacing worsens under the demote fix unless criterion B is made a suppress-gate. Guardrail added.
3. No finding is over-ranked. HIGH-2 is correctly medium (non-definitional, threshold-boundary-only). HIGH-1 is the correct single most-important call.
4. Nothing the audit calls "faithful" is, on independent read, unfaithful — within the read-only limit that the deepest verbatim quotes (§1.2 C item 4, §3.2 PH A–E, Bárány VM) could not be re-fetched.

---

## Bottom line

The brain is NOT safe to ship as-is behind the queued screen rewrite. The drop→demote fix must land as part of the clinical-logic rebuild, before the new screen goes live on this engine. The engine is structurally faithful and substantially correct at the criterion level — but in its current drop-gated form it silently deletes the exact §1.5/§2.4/§3.5 near-misses the product exists to surface (HIGH-1), and the new screen would render that silent-deletion behavior to live users. None of the findings is patient-harmful in the strict sense (no diagnosis is declared, appendix entities are flagged, the missing criterion is shown) — but HIGH-1 defeats the stated purpose and must be fixed; HIGH-2 and the VM label are true fidelity defects to fix alongside; MED-1 and the granularity adds fold in; MED-3 and the description clarifications are copy.

Findings: confirmed, with the amendments above. Safe to act on as the evidence base for the clinical-logic rank-and-flag refactor (clinical-reviewer gating pre- and post-execution). The audit is the evidence; the rebuild is the change; the drop→demote fix is a precondition of that rebuild, not an optional enhancement.
