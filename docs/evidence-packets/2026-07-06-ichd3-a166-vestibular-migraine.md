# Evidence packet — ICHD-3 §A1.6.6 Vestibular migraine (fix A-M1)

**Type:** diagnostic-criteria verification (not a trial).
**Prepared:** 2026-07-06 · evidence-verifier (WebFetch/PubMed) → orchestrator-curated.
**Confidence:** HIGH — ICHD-3 2018 PDF resolved and read verbatim (pp. 187, 193–195); criteria A–E + Notes 1–6 transcribed directly; Lempert 2012 primary confirmed via PubMed.

## 1. Source resolution
| Source | Identifier | Resolved | Gave |
|---|---|---|---|
| **ICHD-3 2018 (authoritative)** | Cephalalgia 2018;38(1):1–211. DOI 10.1177/0333102417738202. PDF at ichd-3.org/wp-content/uploads/2018/01/… | **YES** (PDF, page images pp.187/193–195 read verbatim) | Verbatim criteria A–E + Notes 1–6 |
| **Bárány/Lempert 2012 (origin consensus)** | Lempert T, et al. *J Vestib Res* 2012;22(4):167–172. DOI 10.3233/VES-2012-0453. PMID **23142830** | PARTIAL (PubMed abstract; confirms "moderate or severe," "5 minutes and 72 hours"; full-text mirror 404'd) | Citation + key thresholds; full text corroborated via ICHD-3 verbatim adoption |
| ichd-3.org HTML | — | NO (Cloudflare 403) — PDF used instead | n/a |

ICHD-3 §A1.6.6 is the verbatim adoption of the Lempert 2012 Bárány/IHS consensus; the two are textually identical for A–E.

## 2. Verbatim §A1.6.6 criteria (ICHD-3 2018 p.193)
- **A.** At least five episodes fulfilling criteria C and D.
- **B.** A current or past history of 1.1 Migraine without aura or 1.2 Migraine with aura.
- **C.** Vestibular symptoms of moderate or severe intensity, lasting between five minutes and 72 hours.
- **D.** At least half of episodes are associated with at least one of the following three migrainous features:
  1. headache with ≥2 of: a) unilateral location; b) pulsating quality; c) moderate or severe intensity; d) aggravation by routine physical activity;
  2. photophobia **and** phonophobia;
  3. visual aura.
- **E.** Not better accounted for by another ICHD-3 diagnosis or by another vestibular disorder.

**Structure: FIVE criteria (A–E).** A = ≥5-episode count; B = migraine history; C = intensity + duration; D = ≥50%-of-episodes migrainous feature; E = exclusion.

## 3. Operative definitions (Notes 3–4, the quantitative gates)
- **Note 3 (intensity):** *moderate* = "interfere with but do not prevent daily activities"; *severe* = "daily activities cannot be continued." Mild does not qualify.
- **Note 4 (duration):** 5 minutes to 72 hours; seconds-long recurrent attacks are defined as "the total period during which short attacks recur," then the 5 min–72 h test applies; core episode "rarely exceeds 72 hours."

## 4. Discrepancies found
### 4a. In-repo reference (`docs/2026_07_01/ichd3-criteria-verified-reference.md`) vs source
- Labeled criteria **A–D**; source is **A–E** (reference fused the count into A and merged the exclusion). Content faithful; structure mislabeled. Reference omitted Notes 3/4 operational definitions (supplied here). Reference correctly preserved "photophobia **and** phonophobia" (the AND).

### 4b. Prior code encoding vs source (all confirmed)
- **Section eyebrow said A1.6.5** (Alternating hemiplegia of childhood) — corrected to **A1.6.6**.
- **No ≥5-episode / intensity / duration / ≥50% gates** — all were missing (the over-call root cause).
- **`vm-B` used photophobia OR phonophobia** — criterion D.2 requires **AND**.
- **Feature conflation** — prior `vm-B` fired on the migraine-attack photophobia/phonophobia/aura chips, not on features accompanying the *vestibular episodes*.
- `vm-history` (criterion B) was faithful and is retained (renamed `vm-B`).

## 5. Encoding decision (design)
The ≥5-episode (A) and ≥50%-of-episodes (D) gates are **longitudinal** (attack-pattern), but the engine scores a single presentation. Resolution: **history-style chips**, exactly as migraine's `≥5 attacks` gate already works — additive, no structural ADR. All four core criteria (A–D) are encoded as **suppress-gates**, so VM surfaces only as `full` when the complete A–D picture is affirmed, else it is silently hidden. This is the conservative, over-call-proof shape appropriate for an appendix/research entity. **Probable vestibular migraine (§A1.6.6.1)** — the "meets 3 of A–D" near-miss — is intentionally **deferred to Track C** (its criteria were not in scope of this packet); adding it later would convert the relevant gates to demote-gates with a §A1.6.6.1 Probable home.

New chips: `vest-episodes-ge-5` (A), `vest-intensity-mod-severe` + `vest-duration-5min-72h` (C), `vest-migrainous-half` (D, a VM-specific composite that fixes the OR/AND error and the episode-vs-attack conflation). Criterion E delegated to the red-flag layer (consistent with the engine's per-phenotype-E convention).

## 6. Copyright / reproduction
ICHD-3 title page: "may be reproduced freely for scientific, educational or clinical uses … Reproduction … for commercial uses requires the Society's permission." Encoding the logic + short attributed quotes for a clinical-education tool is within the free grant. **Attribution:** ICHD-3 (Cephalalgia 2018;38(1):1–211) + Bárány/Lempert 2012 (J Vestib Res 2012;22:167–172). If NeuroWiki is a paid product, route the commercial-vs-educational determination to `compliance-legal`; encoding non-verbatim gate logic is lower-risk than reproducing the verbatim criteria block.
