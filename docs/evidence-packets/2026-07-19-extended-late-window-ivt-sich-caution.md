# Evidence Packet — Extended / Late-Window IV Thrombolysis: Single sICH Caution

**Scope:** One guideline-anchored, window-agnostic symptomatic-intracranial-hemorrhage (sICH) caution displayed on every "Eligible" verdict of `src/pages/ExtendedIVTPathway.tsx` (Path A WAKE-UP/THAWS COR 2a; Path B EXTEND/EPITHET/ECASS-4 COR 2a; Path C-LVO TRACE-III COR 2b), plus a Path-C-only TRACE-III numeric line.
**Task class:** E (clinical logic / interpretation text). **Verifier:** evidence-verifier. **Date:** 2026-07-19.
**Overall confidence:** MEDIUM (primary full text PubMed/NCBI/NEJM blocked by session egress policy, HTTP 403; all trial figures secondary-source verified).

## 1. Canonical citation (anchor + supporting)

**Primary anchor (guideline):** Prabhakaran et al. *2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke.* Stroke. 2026;57. DOI 10.1161/STR.0000000000000513. PMID 41582814. In-repo validated reference: `src/data/aha2026StrokeGuideline.ts` (line 300 antiplatelet sICH increment; 331–347 extended/late-window recs; 398–408 sICH management).

**Supporting trials:** WAKE-UP (2018), THAWS (2020), EXTEND (2019), ECASS-4 (2019), EPITHET (2008), TRACE-III (2024), TIMELESS (2024). DOIs/PMIDs match trial names but could not be resolved to primary full text this session (403 via egress proxy); figures verified via secondary sources.

## 6. sICH context table (active vs control, with definition)

| Trial (agent) | sICH active | sICH control | Effect | Definition | PMID / DOI | Confidence |
|---|---|---|---|---|---|---|
| WAKE-UP (alteplase) | 2.0% | 0.4% | OR 4.95 (0.57–42.87), P=0.15 | PH2 + NIHSS ≥4, SITS-MOST-type (label UNVERIFIED) | 29766770 / 10.1056/NEJMoa1804355 | Med figure, Low label |
| THAWS (alteplase 0.6 mg/kg) | 1.4% (1/71) | 0% (0/60) | RR ∞, P=1.0 | SITS-MOST-type presumed (UNVERIFIED) | 32248771 / 10.1161/STROKEAHA.119.028127 | Med figure, Low label |
| EXTEND (alteplase) | 6.2% | 0.9% | adj RR 7.22 (0.97–53.54), P=0.053 | SITS-MOST (confirmed via secondary) | 31067369 / 10.1056/NEJMoa1813046 | Medium |
| ECASS-4 (alteplase) | ≈1.6% (1 event) | 0 | not powered; stopped early 119/264 | ECASS-III-type presumed (UNVERIFIED) | 30947642 / 10.1177/1747493019840938 | Low |
| EPITHET (alteplase) | not verified | not verified | — | — | 18296121 / 10.1016/S1474-4422(08)70044-9 | UNVERIFIED |
| **TRACE-III (tenecteplase 0.25 mg/kg)** | **3.0%** | **0.8%** | numerically higher, within 36 h | label UNVERIFIED to primary | 38884324 / 10.1056/NEJMoa2402980 | Med figure, Low label |
| TIMELESS (tenecteplase; 77% also EVT) | 3.2% (n=7) | 2.3% (n=5) | similar, NS | label UNVERIFIED; TNK+EVT population | 38329148 / 10.1056/NEJMoa2310392 | Med figure, Low label |

**Pooled 4.5–9h perfusion IPD (Campbell et al., Lancet 2019):** sICH ≈5% vs ≈0.7% (alteplase vs placebo). PMID 31128925 (verify at registration). Path B only.

**Range across paths:** active-arm sICH ~1.4%–6.2%; absolute increment ~1.4–5.3 pp under differing definitions/denominators. This spread is the quantitative proof that no single headline % is fair across all three eligible paths.

## 2. The ~0.9%–1.2% figure — quarantined

Confirmed at `aha2026StrokeGuideline.ts` line 300: this is the absolute increased sICH risk attributable to concomitant antiplatelet therapy in otherwise-eligible IVT patients — NOT the baseline thrombolysis sICH rate, NOT window-specific. Using it as the caution headline would be a block-worthy misrepresentation (understates observed active-arm sICH of 1.4%–6.2%). DO NOT use as the caution number.

## Recommended headline decision

No single sICH percentage is fair across all three eligible paths → recommend QUALITATIVE headline. Supported unanimously (active > control sICH in every trial) and window-agnostic. For Path C only, TRACE-III (~3% vs <1%) is a defensible, genuinely-tenecteplase, single-trial figure.

## Recommended caution strings (humanizer-safe, no em-dash)

- Shared (all eligible): "Thrombolysis in the extended and late windows (beyond 4.5 hours) carries a risk of symptomatic intracranial hemorrhage that rises with larger established infarct; confirm salvageable tissue and ensure expert oversight."
- Path C only: TRACE-III late-window tenecteplase sICH approximately 3% versus under 1% without thrombolysis.

## 9. NeuroWiki field mapping

- New claim `extended-ivt-sich-caution` → `['aha-asa-2026-4.6.1','aha-asa-2026-4.6.3','extend-trial-2019','wake-up-trial-2018','trace-iii-trial-2024']` (all reported already in registry.ts).
- Path C numeric line → claim on `trace-iii-trial-2024` (+ `aha-asa-2026-4.6.3`).
- Surface is clinical per `.claude/rules/clinical-surfaces.md`; tag rendered element with `data-claim`.
- NOT in registry (register only if cited): THAWS (32248771), ECASS-4 (30947642), EPITHET (18296121, verify), Campbell IPD (31128925, verify).
- Do NOT touch: TRIALS record, per-path result.details strings, the antiplatelet ~0.9–1.2% figure.

## 8. Expert / editorial context

Guideline incorporation confirmed: extended-window IVT COR 2a LOE B-R; late-window TNK-for-LVO COR 2b LOE B-R (§4.6.3). TIMELESS is the limiting/negative comparator (safe but not effective when EVT available). TRACE-III paired NEJM editorial and post-publication letters not retrievable this session (NEJM/PubMed 403); one critical appraisal located (PMID 39503377, not read to full text). HOPE (JAMA 2025, alteplase 4.5–24h, PMID 40773205) is emerging; flag for future re-review, does not change the qualitative caution.

## 10. Verification confidence — MEDIUM

- High: guideline anchor; antiplatelet ~0.9–1.2% scope; qualitative direction (active > control in all six trials).
- Not High: primary full text egress-blocked; trial figures rest on secondary sources.
- Low/UNVERIFIED: ECASS-4 exact %/denominator; EPITHET figures/IDs; named sICH definition labels for WAKE-UP/THAWS/TRACE-III/TIMELESS.
- **Downstream:** qualitative caution supported at Medium — may proceed to clinical-reviewer gate. Any numeric sICH headline beyond the named-trial TRACE-III line is blocked until primary full text is retrieved.
