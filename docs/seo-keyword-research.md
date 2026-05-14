# SEO Keyword Research — NeuroWiki (Phase 2)

**Date:** 2026-05-13
**Reviewer:** seo-specialist (model: claude-sonnet-4-6)
**Production URL:** https://neurowiki.ai
**Methodology:** Knowledge-based SERP landscape estimates derived from training data (cutoff August 2025). Live SERP snapshot verification was not possible — no WebSearch MCP was available in this session. **All positions are estimates only; GSC-authoritative follow-up required in Phase 2b.** No positions for neurowiki.ai can be confirmed without GSC data — all neurowiki.ai position fields are marked "unknown" unless there is strong evidence from external signals.
**Phase 2b:** V to run GSC API integration in the morning to replace estimates with authoritative position data.

---

## Executive summary

NeuroWiki's keyword opportunity is concentrated in two high-value zones: (1) clinical calculator queries where MDCalc is the dominant incumbent across all major tools (NIHSS, ASPECTS, ICH Score, GCS, ABCD2, HAS-BLED, CHA2DS2-VASc), and (2) trial summary queries where no single authoritative source dominates — Wikipedia, PubMed abstracts, and sponsor microsites split the landscape. The pathway and guideline clusters are dominated by society sources (AHA/ASA, AAN) and clinical reference platforms (UpToDate, BMJ Best Practice), making top-5 positioning unlikely in the near term but page-2 authority positioning achievable with the existing citation model. The long-tail clinical question cluster is the most immediately winnable — these queries have low competition from structured clinical decision tools and NeuroWiki's FAQ structured data gives it a real advantage for featured snippet capture. The highest-priority fix identified in Phase 1 (sitemap wrong paths for pathway routes) directly suppresses the EVT, ELAN, and status epilepticus pathway pages from indexing — these pages target some of the most clinician-searched pathway queries and are currently invisible to Googlebot.

---

## Cluster summaries

### Cluster 1 — Calculator-driven (~16 keywords)

**Strategic note:** MDCalc owns this cluster comprehensively. It ranks position 1–3 for virtually every clinical calculator query in neurology and medicine broadly. Its domain authority (DA ~70+), breadth of calculators, and massive citation backlink profile from medical literature make it the category incumbent. The competitive strategy for NeuroWiki is not to displace MDCalc for head-term traffic but to (a) rank alongside MDCalc for specialty-specific neurology calculators by leveraging structured data (SoftwareApplication + FAQPage schemas) for featured snippets and calculator-rich-result eligibility, (b) win on user experience for bedside clinicians who need faster, cleaner mobile interfaces, and (c) own the long-tail interpretation queries ("NIHSS score 6 meaning," "ASPECTS score 7 EVT eligible") where MDCalc's generic result pages are weak.

| Keyword | Top result (publisher) | Position estimate (neurowiki.ai) | Competitor type | Action |
|---|---|---|---|---|
| NIHSS calculator | MDCalc (mdcalc.com/calc/nihss) | unknown | MDCalc | (c) compete — structured data + FAQPage for interpretation queries |
| NIHSS scoring online | MDCalc | unknown | MDCalc | (c) compete — target interpretation long-tail alongside head term |
| ICH score calculator | MDCalc (mdcalc.com/calc/ich-score) | unknown | MDCalc | (c) compete — add FAQ structured data on mortality interpretation |
| ICH score mortality | MDCalc + Wikipedia | unknown | MDCalc + Wikipedia | (b) gap opportunity — FAQ/table showing mortality by score tier |
| ABCD2 score calculator | MDCalc | unknown | MDCalc | (c) compete — Phase 1 audit found calc/abcd2 orphaned in link graph; fix links first |
| ABCD2 TIA risk | MDCalc + UpToDate | unknown | MDCalc + clinical reference | (b) gap — "ABCD2 TIA risk stratification" long-tail FAQ target |
| HAS-BLED calculator | MDCalc | unknown | MDCalc | (c) compete — NeuroWiki's ELAN pathway context is unique differentiator |
| HAS-BLED score | MDCalc + ESC guidelines | unknown | MDCalc + society | (c) compete — bleed risk interpretation FAQs are a differentiator |
| CHADS-VASc calculator | MDCalc | unknown | MDCalc | (b) gap — /calculators/chads-vasc missing from sitemap (Phase 1 M1); fix sitemap first |
| CHA2DS2-VASc score | MDCalc + AHA/ASA | unknown | MDCalc + society | (b) gap — same as above; link graph node missing (Phase 1 L6) |
| ASPECTS score CT | MDCalc + Wikipedia | unknown | MDCalc + Wikipedia | (c) compete — ASPECTS is NeuroWiki's strongest differentiator given EVT pathway integration |
| ASPECTS scoring stroke | MDCalc + radiology resources | unknown | MDCalc + radiology | (c) compete — "ASPECTS score for thrombectomy" is winnable long-tail |
| RoPE score PFO | MDCalc | unknown | MDCalc | (b) gap — PFO closure + RoPE score integration is a clinical niche with weak competition |
| Boston criteria CAA | Academic papers + UpToDate | unknown | Academic + clinical reference | (b) gap opportunity — relatively low competition for structured clinical tool |
| Glasgow Coma Scale calculator | MDCalc (highest DA for GCS) | unknown | MDCalc | (c) compete — GCS is commodity; compete on mobile UX and bedside speed |
| Heidelberg bleeding classification | Academic papers + Wikipedia | unknown | Academic + Wikipedia | (b) gap — very low competition; NeuroWiki may be only dedicated calculator page |

**Cluster 1 priority actions:**
1. Fix CHA2DS2-VASc sitemap entry and link graph node (Phase 1 M1 + L6) — unblocks indexing for a top-10 calculator keyword.
2. Add FAQPage structured data to ICH Score, ABCD2, HAS-BLED, RoPE, Boston Criteria, Heidelberg calculator pages if not already present (Phase 1 audit confirmed some calculators have FAQs — verify completeness).
3. Target interpretation long-tail queries ("what does NIHSS score X mean", "ASPECTS score 7 thrombectomy eligible") with explicit FAQ entries.
4. Heidelberg and RoPE are potentially rankable without competing with MDCalc — low-competition specialist niches.

---

### Cluster 2 — Pathway / decision support (~9 keywords)

**Strategic note:** This cluster has heterogeneous competition. Generic stroke protocol queries (EVT eligibility, tPA eligibility) are dominated by society guidelines (AHA/ASA, ESO), UpToDate, and hospital system protocol pages. However, clinician-facing decision support tools are underrepresented in SERPs — MDCalc does not have pathway tools in the same sense NeuroWiki does, which creates a genuine differentiation opportunity. The critical Phase 1 blocker is that six pathway routes are submitted to Google under wrong URLs (sitemap H1 finding) — these pages cannot rank at all until that is fixed. Fixing the sitemap H1 is the single highest-ROI action for this cluster.

| Keyword | Top result (publisher) | Position estimate (neurowiki.ai) | Competitor type | Action |
|---|---|---|---|---|
| EVT eligibility criteria | AHA/ASA guidelines + UpToDate + academic review | unknown | Society + clinical reference | (b) gap — EVT pathway page unindexed due to sitemap bug (Phase 1 H1); fix sitemap first |
| thrombectomy criteria 2026 | AHA/ASA 2026 guidelines + academic centers | unknown | Society + academic | (b) gap — "2026" keyword is timely and aligned with NeuroWiki's guideline currency |
| tPA eligibility checklist | Hospital protocol pages + MDCalc + AHA/ASA | unknown | Hospital system + MDCalc + society | (c) compete — checklist format with FAQ schema is a strong position |
| stroke code protocol | Hospital systems + academic centers | unknown | Hospital system | (c) compete — /pathways/stroke-code missing from sitemap (Phase 1 M1); fix sitemap |
| extended window IVT criteria | AHA/ASA + academic review articles | unknown | Society + academic | (b) gap — late-window IVT pathway page is unindexed (sitemap bug) |
| wake-up stroke thrombolysis | Academic papers (WAKE-UP trial) + UpToDate | unknown | Academic + clinical reference | (b) gap — strong opportunity to own this query given WAKE-UP trial data integration |
| ELAN trial anticoagulation timing | Academic papers + cardiology resources | unknown | Academic | (b) gap — very low competition; ELAN pathway is potentially rankable position 1–3 |
| status epilepticus algorithm | AAN guidelines + eMedicine + UpToDate | unknown | Society + eMedicine | (c) compete — SE pathway unindexed (sitemap bug); fix sitemap, then compete with FAQ schema |
| GCA workup | eMedicine + UpToDate + ACR | unknown | Clinical reference + society | (b) gap — GCA pathway is a niche with moderate clinical interest |

**Cluster 2 priority actions:**
1. Fix the 6 sitemap wrong paths (Phase 1 H1) — this is the single action that unblocks EVT, ELAN, late-window IVT, SE, and migraine pathways from indexing. Without this, no ranking is possible for those pages.
2. Add /pathways/stroke-code to sitemap (Phase 1 M1).
3. Add pathways hub JSON-LD schema (Phase 1 M3) — enables rich results for the hub discovery page.
4. "ELAN trial anticoagulation timing" is a low-competition keyword where NeuroWiki could realistically rank page 1 given its dedicated ELAN pathway.

---

### Cluster 3 — Guideline / education (~4 keywords)

**Strategic note:** Society sources (AHA/ASA, AAN, ESO) will always rank above third-party clinical tools for their own guideline queries. Wikipedia and UpToDate rank below societies but above specialist tools. NeuroWiki's realistic goal for this cluster is page 2–3 positioning with strong authority signals, driving referral traffic from clinicians who have already found the guidelines and are searching for implementation tools. FAQ structured data and BreadcrumbList on guide pages are the main levers available without a fundamental authority building effort.

| Keyword | Top result (publisher) | Position estimate (neurowiki.ai) | Competitor type | Action |
|---|---|---|---|---|
| AHA ASA stroke guidelines 2026 | AHA/ASA official site (ahajournals.org) + Stroke journal | unknown | Society — dominant | (d) low priority head term; target derivative queries ("AHA 2026 EVT criteria summary") |
| stroke thrombolysis time window | AHA/ASA + UpToDate + academic review | unknown | Society + clinical reference | (b) gap — interpretive summary with FAQ schema could capture "what does the 4.5 hour window mean" type queries |
| ICH management 2022 guidelines | AHA/ASA + UpToDate + academic center protocol pages | unknown | Society + clinical reference | (b) gap — /guide/ich-management page can own interpretation queries if internal linking is strengthened |
| AAN status epilepticus guidelines | AAN official site + Neurology journal + eMedicine | unknown | Society — dominant | (d) low priority head term; target "status epilepticus first line treatment" instead |

**Cluster 3 priority actions:**
1. Do not target head-term guideline queries — society dominance is insurmountable in the near term.
2. Identify derivative queries from each guideline cluster (e.g., "when is EVT indicated per 2026 guidelines") and build FAQ structured data targeting those.
3. The /guide/aha-2026-guideline page is missing from sitemap (Phase 1 M1) — fix to enable indexing of the one guideline page that could rank for "AHA 2026 stroke guidelines summary."

---

### Cluster 4 — Trial summaries (~7 keywords)

**Strategic note:** This is NeuroWiki's highest-potential cluster for sustainable authority. Landmark trial queries (DAWN, DEFUSE-3, MR CLEAN, NINDS) are split across Wikipedia, PubMed abstracts, journal publisher pages, and academic center summaries — no single platform owns "trial summary" content the way MDCalc owns calculators. NeuroWiki's MedicalScholarlyArticle + BreadcrumbList structured data on trial pages is a structural advantage. The key gap is that most trial nodes are link graph orphans (Phase 1 M6) — they receive no PageRank flow from internal links. Fixing the link graph edges (connecting trials to pathways and guide articles) is the enabling action for this cluster.

| Keyword | Top result (publisher) | Position estimate (neurowiki.ai) | Competitor type | Action |
|---|---|---|---|---|
| DEFUSE-3 trial summary | Wikipedia + NEJM (nejm.org) + academic center | unknown | Wikipedia + journal | (c) compete — MedicalScholarlyArticle schema + strong internal links can rank against Wikipedia |
| DAWN trial inclusion criteria | Wikipedia + NEJM + AHA/ASA | unknown | Wikipedia + journal + society | (c) compete — "inclusion criteria" specificity is a clinician query MDCalc doesn't target |
| EXTEND trial results | Wikipedia + Lancet (thelancet.com) + academic | unknown | Wikipedia + journal | (c) compete — EXTEND is a Phase 1-audited page; fix orphan status in link graph |
| MR CLEAN trial | Wikipedia + NEJM + academic | unknown | Wikipedia + journal | (c) compete — landmark trial with high search volume; strong structured data opportunity |
| ENRICH trial ICH | Very low competition — academic press releases + trial registry | unknown | Academic + registry | (b) gap — potentially rankable position 1–5 given low competition for a recent ICH trial |
| ESCAPE trial | Wikipedia + NEJM + academic center | unknown | Wikipedia + journal | (c) compete — ESCAPE is a foundational EVT trial with sustained clinical interest |
| NINDS trial summary | Wikipedia + NEJM + AHA/ASA | unknown | Wikipedia + journal + society | (c) compete — high competition but foundational; MedicalScholarlyArticle schema differentiates |

**Cluster 4 priority actions:**
1. Fix link graph orphans for all trial nodes (Phase 1 M6) — this is the enabling action; without internal links, trial pages cannot accumulate PageRank.
2. Add outbound references from guide articles to related trials (Phase 1 M7) — e.g., article/thrombectomy → trial/dawn-trial, trial/defuse-3-trial, trial/escape-trial.
3. ENRICH trial is a current-year ICH trial with very low SERP competition — prioritize link graph wiring for this specific trial.
4. Target "inclusion criteria" and "eligibility criteria" long-tail variants of trial queries — these are clinician-specific and underserved by Wikipedia summaries.

---

### Cluster 5 — Long-tail clinical questions (~5 keywords)

**Strategic note:** This is the most immediately winnable cluster. Long-tail clinical questions have moderate-to-low competition (typically academic case reports, UpToDate, and eMedicine), and NeuroWiki's FAQPage structured data creates direct eligibility for Google's featured snippet (position 0) format. Clinicians searching these queries are high-intent users at the bedside — exactly NeuroWiki's target audience. Winning here drives direct tool adoption. The one prerequisite is that the underlying pages are indexed — again pointing back to the sitemap fixes.

| Keyword | Top result (publisher) | Position estimate (neurowiki.ai) | Competitor type | Action |
|---|---|---|---|---|
| how to score NIHSS in intubated patient | UpToDate + academic center protocols + NIHSS training materials | unknown | Clinical reference + training | (b) gap — high clinical value; FAQ entry on NIHSS calculator page would target this exactly |
| when to give tPA stroke | AHA/ASA + UpToDate + hospital system | unknown | Society + clinical reference | (b) gap — "when to give" framing is a decision-support query; FAQ schema on tPA pathway |
| what is ASPECTS score for thrombectomy | MDCalc + Wikipedia + academic radiology | unknown | MDCalc + Wikipedia | (b) gap — ASPECTS calculator + EVT pathway integration is unique to NeuroWiki; FAQ eligible |
| PFO closure RoPE score | Academic papers + UpToDate | unknown | Academic + clinical reference | (b) gap — low competition; RoPE calculator + FAQ schema could capture position 1 |
| stroke mimics on CT | Radiopaedia + academic radiology + eMedicine | unknown | Radiology reference | (d) low priority — NeuroWiki does not have a dedicated stroke mimics page; out of scope unless content is planned |

**Cluster 5 priority actions:**
1. Add FAQ entries targeting "how to score NIHSS in intubated patient" and "NIHSS aphasia scoring" — these are high-value, low-competition queries with direct tool adoption intent.
2. Add FAQ entry targeting "ASPECTS score for thrombectomy eligibility" on the ASPECTS calculator page — ties directly to EVT pathway.
3. Add FAQ entry on the RoPE score calculator for "PFO closure indications."
4. "Stroke mimics on CT" is out of scope — no existing page; park as a future content idea.

---

## Cross-cutting findings

### Where we're well-positioned (existing wins to defend)

- **ELAN pathway** — "ELAN trial anticoagulation timing" is a genuinely low-competition query. NeuroWiki's dedicated ELAN pathway page, once indexed (sitemap fix required), is positioned to rank page 1. No MDCalc equivalent. No society guideline page owns this query.
- **Heidelberg bleeding classification** — Very low SERP competition. NeuroWiki may be the only dedicated calculator page for this tool. Priority: verify FAQPage structured data is present, fix link graph node.
- **RoPE score PFO** — Moderate competition from MDCalc but low-competition for interpretation queries. NeuroWiki's integration with PFO closure clinical context is a differentiator.
- **ENRICH trial ICH** — Recent trial (2023) with very low established SERP competition. NeuroWiki's MedicalScholarlyArticle schema gives it a structural advantage here.
- **Boston Criteria CAA** — Specialist query with lower MDCalc presence. Neurologist-specific audience aligns well with NeuroWiki's user base.

### Where we should rank but don't (immediate fixes)

These gaps are primarily caused by the Phase 1 technical findings, not by content gaps:

1. **EVT pathway** — Unindexed due to sitemap wrong path (/calculators/evt-pathway vs /pathways/evt). Should rank for "EVT eligibility criteria," "thrombectomy criteria 2026," "what is ASPECTS score for thrombectomy."
2. **Status epilepticus pathway** — Unindexed (sitemap wrong path). Should rank for "status epilepticus algorithm," "status epilepticus first line treatment."
3. **Late-window IVT pathway** — Unindexed (sitemap wrong path). Should rank for "extended window IVT criteria," "wake-up stroke thrombolysis."
4. **ELAN pathway** — Unindexed (sitemap wrong path). Should rank for "ELAN trial anticoagulation timing."
5. **CHA2DS2-VASc calculator** — Missing from sitemap entirely (Phase 1 M1). Should rank for "CHADS-VASc calculator," "AF stroke risk calculator."
6. **AHA 2026 guideline page** — Missing from sitemap (Phase 1 M1). Should rank for "AHA ASA stroke guidelines 2026 summary."
7. **Stroke Code pathway** — Missing from sitemap (Phase 1 M1). Should rank for "stroke code protocol."

**These are not content gaps — they are indexing gaps caused by sitemap errors. Fixing the 7 sitemap entries from Phase 1 findings is the single highest-ROI action across all keyword clusters.**

### Authority opportunities (long-tail we can win with our citation model)

These require content additions (FAQ entries) rather than infrastructure fixes:

1. **"How to score NIHSS in intubated patient"** — No structured clinical decision tool owns this query. FAQ entry on NIHSS calculator page + citation to NIHSS administration guidelines.
2. **"ASPECTS score 7 thrombectomy eligible"** — Specific clinical decision query. FAQ on ASPECTS calculator page.
3. **"DAWN trial inclusion criteria"** and **"DEFUSE-3 trial eligibility"** — "Inclusion criteria" variant of trial queries is underserved. Add FAQ entries on trial pages.
4. **"ICH score mortality prediction"** — Tabular mortality data by score tier is scarcely indexed in FAQ format. ICH Score calculator FAQ opportunity.
5. **"ABCD2 score 4 TIA management"** — Score-level interpretation long-tail. ABCD2 FAQ opportunity.
6. **"HAS-BLED vs CHA2DS2-VASc anticoagulation"** — Clinical decision question that NeuroWiki's ELAN pathway is positioned to answer. Cross-linking ELAN + HAS-BLED + CHA2DS2-VASc would serve this.

### Out-of-scope or low-priority

- **"AHA ASA stroke guidelines 2026"** (head term) — Society dominance; target derivative queries instead.
- **"AAN status epilepticus guidelines"** (head term) — AAN.com will rank above NeuroWiki for its own branded guideline.
- **"Stroke mimics on CT"** — No existing NeuroWiki page; content gap, not an SEO gap. Park as future content.
- **"MR CLEAN trial"** head term — Wikipedia owns this; compete on "MR CLEAN trial eligibility criteria" instead.

---

## Recommendations for Phase 3 game plan

Ordered by estimated ROI and implementation complexity:

1. **Fix the 7 sitemap entry errors (Phase 1 H1 + M1) — highest priority.** Six wrong paths + three missing entries. This unblocks indexing for EVT, ELAN, SE, stroke-code, late-window IVT, CHA2DS2-VASc, and AHA 2026 guideline pages. No content change required. Estimated lift: significant for pathway cluster and calculator cluster. Complexity: S.

2. **Add FAQPage entries targeting bedside clinical questions.** Priority FAQ additions:
   - NIHSS: "How do I score NIHSS in an intubated patient?" + "What does NIHSS score [6/8/15] mean for stroke severity?"
   - ASPECTS: "What ASPECTS score is required for thrombectomy eligibility?" + "How is ASPECTS scored on CT?"
   - ICH Score: "What is the 30-day mortality for ICH Score [0/1/2/3]?"
   - RoPE: "When is PFO closure indicated based on RoPE score?"
   - ABCD2: "What ABCD2 score requires hospitalization after TIA?"
   These target featured snippet capture for high-intent bedside queries. Complexity: S per FAQ entry.

3. **Fix link graph orphans for trial nodes (Phase 1 M6) and dead-end guide articles (Phase 1 M7).** Wire DAWN, DEFUSE-3, ESCAPE, MR CLEAN, NINDS trials to the EVT pathway and thrombectomy guide article. Wire EXTEND and WAKE-UP to the late-window IVT pathway. This passes PageRank from the pathway pages (once indexed) to the trial pages. Complexity: M (link-graph.json edits + guide article internal links in JSX).

4. **Add pathways hub JSON-LD schema (Phase 1 M3).** Enables rich results for /pathways hub discovery. Direct eligibility for CollectionPage rich result. Complexity: S.

5. **Target "ELAN trial anticoagulation timing" specifically.** This is the most winnable page-1 opportunity across all clusters. Once the ELAN pathway is indexed (sitemap fix #1), the page needs: (a) FAQ entry on anticoagulation timing post-stroke with citation to ELAN study, (b) internal links from the ELAN trial page to the ELAN pathway, and (c) internal links from the CHA2DS2-VASc and HAS-BLED calculators to the ELAN pathway. Complexity: M total.

6. **Add OG image fallback for calculator and trial pages (Phase 1 M5).** Social share previews for calculator and trial pages currently show no image. Fix is one line in Seo.tsx. Complexity: S.

7. **Shorten 10 over-length title tags (Phase 1 M4).** Truncated titles reduce SERP click-through. Priority: ASPECTS (78 chars), Heidelberg (77 chars), Status Epilepticus (76 chars), E/M Billing (79 chars). Complexity: S per title.

8. **Build-time sitemap generation (Phase 1 M1/L4 combined).** Eliminates future sitemap drift and auto-populates lastmod from git timestamps. This is a Class D infrastructure task and should not block Phase 3 quick wins. Schedule as Phase 4. Complexity: M-L.

9. **Phase 2b GSC integration.** Replace all "unknown" position estimates in this document with GSC-authoritative data. Identify which pages are indexed, impressions, and average position per keyword. This will reprioritize the Phase 3 backlog with real data. Schedule for tomorrow morning.

---

## Appendix: keyword-to-page mapping

Quick reference for which NeuroWiki page should rank for each cluster:

| Keyword cluster | NeuroWiki page | Route | Indexed? |
|---|---|---|---|
| NIHSS calculator | NIHSS Calculator | /calculators/nihss | yes (sitemap entry present) |
| ICH score calculator | ICH Score Calculator | /calculators/ich-score | yes |
| ABCD2 score calculator | ABCD2 Calculator | /calculators/abcd2 | yes |
| HAS-BLED calculator | HAS-BLED Calculator | /calculators/has-bled | yes |
| CHADS-VASc calculator | CHA2DS2-VASc Calculator | /calculators/chads-vasc | NO — missing from sitemap |
| ASPECTS score | ASPECTS Calculator | /calculators/aspects | yes |
| RoPE score | RoPE Score Calculator | /calculators/rope-score | yes (if in sitemap — verify) |
| Boston criteria CAA | Boston Criteria Calculator | /calculators/boston-criteria | yes (if in sitemap — verify) |
| GCS calculator | Glasgow Coma Scale | /calculators/gcs | yes |
| Heidelberg classification | Heidelberg Calculator | /calculators/heidelberg | yes (if in sitemap — verify) |
| EVT eligibility criteria | EVT Eligibility Pathway | /pathways/evt | NO — wrong path in sitemap |
| tPA eligibility | Late Window IVT Pathway | /pathways/late-window-ivt | NO — wrong path in sitemap |
| ELAN anticoagulation | ELAN Pathway | /pathways/elan-pathway | NO — wrong path in sitemap |
| Status epilepticus | SE Pathway | /pathways/se-pathway | NO — wrong path in sitemap |
| Stroke code protocol | Stroke Code Pathway | /pathways/stroke-code | NO — missing from sitemap |
| AHA 2026 guidelines | AHA 2026 Guideline Mindmap | /guide/aha-2026-guideline | NO — missing from sitemap |
| DEFUSE-3 trial | DEFUSE-3 Trial Page | /trials/defuse-3 | yes (trial routes in sitemap) |
| DAWN trial | DAWN Trial Page | /trials/dawn | yes |
| EXTEND trial | EXTEND Trial Page | /trials/extend-trial | yes |
| MR CLEAN trial | MR CLEAN Trial Page | /trials/mr-clean | yes |
| ENRICH trial | ENRICH Trial Page | /trials/enrich | yes |
| ESCAPE trial | ESCAPE Trial Page | /trials/escape | yes |
| NINDS trial | NINDS Trial Page | /trials/ninds | yes |

**"NO" entries = Phase 1 sitemap fixes resolve these. Fixing 7 sitemap entries unblocks ~7 high-priority keyword targets.**

---

*Note: All SERP positions marked "unknown" throughout this document. Neurowiki.ai position data requires GSC API or live SERP verification (Phase 2b). Top result publisher attributions are based on historical SERP landscape knowledge as of August 2025 — live SERP composition should be verified in Phase 2b before committing to the Phase 3 prioritization order.*
