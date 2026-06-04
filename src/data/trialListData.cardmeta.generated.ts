// GENERATED FILE — DO NOT EDIT BY HAND.
// Source of truth: src/data/trialData.ts (TRIAL_DATA).
// Regenerate:  npx tsx scripts/gen-trial-card-meta.ts
// Drift guard: scripts/check-card-meta.ts (runs in pre-commit; fails on any diff).
//
// This lightweight projection lets TrialsPage and QuestionDetailPage render trial
// legend chips + stub-trial rows WITHOUT importing the ~928 KB trialData.ts chunk.

export interface TrialCardMeta {
  legend?: { finding?: string; bottomLineTag?: string; keyStat?: string };
  title: string;
  subtitle?: string;
  source?: string;
  /** TrialMetadata.trialDesign.timeline (flattened). */
  timeline?: string;
  listCategory?: 'thrombolysis' | 'thrombectomy' | 'antiplatelets' | 'carotid' | 'acute';
  listDescription?: string;
  bottomLineSummary?: string;
  doi?: string;
}

export const TRIAL_CARD_META: Record<string, TrialCardMeta> = {
  "act-trial": {
    "title": "AcT Trial",
    "legend": {
      "finding": "Tenecteplase 0.25 mg/kg non-inferior to alteplase in routine IVT within 4.5 h.",
      "bottomLineTag": "NI met",
      "keyStat": "RD +2.1%"
    },
    "subtitle": "Tenecteplase vs Alteplase in Canada",
    "source": "Menon BK, et al. (Lancet 2022)",
    "timeline": "Canada; December 2019 to January 2022",
    "listCategory": "thrombolysis",
    "listDescription": "Tenecteplase vs alteplase in routine Canadian stroke practice; non-inferiority confirmed.",
    "bottomLineSummary": "AcT showed non-inferiority of tenecteplase 0.25 mg/kg to alteplase 0.9 mg/kg for excellent 90-day outcome in routine Canadian stroke practice (36.9% vs 34.8%, RD +2.1 pp, 95% CI −1.4 to +5.6). The single-bolus advantage is validated without sacrificing efficacy or safety.",
    "doi": "10.1016/S0140-6736(22)01054-6"
  },
  "angel-aspect-trial": {
    "title": "ANGEL-ASPECT Trial",
    "legend": {
      "finding": "EVT improves ordinal mRS shift in broader large-core anterior LVO (ASPECTS 3–5 or core 70–100 mL).",
      "bottomLineTag": "gOR 1.37",
      "keyStat": "gOR 1.37 (P=0.004)"
    },
    "subtitle": "Large Core Thrombectomy (China)",
    "source": "Huo et al. (NEJM 2023;388(14):1272–1283)",
    "timeline": "Enrolled 2020-2022",
    "listCategory": "thrombectomy",
    "listDescription": "Large core thrombectomy; China cohort (ASPECTS 3–5 or core ≥70 mL).",
    "bottomLineSummary": "ANGEL-ASPECT validates SELECT2 in a Chinese population with broader volume criteria. Primary ordinal mRS shift: gOR 1.37 (95% CI 1.11–1.69, P=0.004). Secondary mRS 0–2: 30% vs 11.6% (NNT 5.4 from secondary). sICH 6.1% vs 2.7% (NS but trending). AHA/ASA 2026 §4.7.2 COR 1 (6–24h) / COR 2a (within 6h).",
    "doi": "10.1056/NEJMoa2213379"
  },
  "annexa-4-trial": {
    "title": "ANNEXA-4",
    "legend": {
      "finding": "Single-arm cohort: andexanet reduced anti-FXa by 92% with 82% hemostatic efficacy in FXa-inhibitor major bleeding.",
      "bottomLineTag": "FDA approval cohort",
      "keyStat": "82% hemostasis at 12 h"
    },
    "subtitle": "Andexanet Alfa for FXa-Inhibitor-Associated Major Bleeding (Single-Arm Cohort)",
    "source": "Connolly SJ, et al. for the ANNEXA-4 Investigators (NEJM 2019;380:1326-1335)",
    "timeline": "Enrolled April 2015 to May 2018; 30-day follow-up",
    "listCategory": "acute",
    "listDescription": "Single-arm cohort of 352 patients with acute major bleeding on FXa inhibitors (64% intracranial). Andexanet reduced anti-FXa activity by 92%; 82% achieved excellent or good hemostasis at 12 h. Supported FDA accelerated approval.",
    "bottomLineSummary": "ANNEXA-4 was the single-arm prospective cohort study of 352 patients with acute major bleeding within 18 h of an FXa-inhibitor dose that supported FDA accelerated approval of andexanet alfa in May 2018. Bleeding was 64% intracranial and 26% gastrointestinal. Anti-FXa activity fell a median of 92% with andexanet (95% CI 91-93% apixaban, 88-94% rivaroxaban). Excellent or good hemostatic efficacy at 12 h in 204/249 (82%). 30-day mortality 14%, thrombotic events 10%; causality not inferable from single-arm design. AHA/ASA 2022 ICH §5.2.2 graded andexanet Class IIa, Level B-NR on this evidence. The subsequent randomized ANNEXA-I (NEJM 2024) in ICH specifically confirmed hemostatic efficacy AND quantified an ischemic-stroke excess (6.5% vs 1.5%, NNH ~20).",
    "doi": "10.1056/NEJMoa1814051"
  },
  "annexa-i-trial": {
    "title": "ANNEXA-I Trial",
    "legend": {
      "finding": "Andexanet improves hemostatic surrogate but increases ischemic stroke; no functional or mortality benefit at 30 days.",
      "bottomLineTag": "NNT 8 / NNH 20",
      "keyStat": "+13.4 pp (4.6-22.2)"
    },
    "subtitle": "Andexanet Alfa for Factor Xa Inhibitor-Associated Acute Intracerebral Hemorrhage",
    "source": "Connolly SJ et al. (NEJM 2024;390(19):1745-1755)",
    "timeline": "Enrolled June 2019 to May 2023; stopped early for efficacy at pre-specified interim analysis",
    "listCategory": "acute",
    "listDescription": "First RCT of FXa-inhibitor reversal in acute ICH: hemostatic efficacy 67% vs 53% but ischemic stroke 6.5% vs 1.5%. DSMB-halted early.",
    "bottomLineSummary": "ANNEXA-I was the first randomized trial of an FXa-inhibitor antidote in acute intracerebral hemorrhage. Among 452 patients with ICH on apixaban, rivaroxaban, or edoxaban within 15 hours of last dose, andexanet improved a composite hemostatic-efficacy surrogate at 12 h compared with usual care (67.0% vs 53.1%; +13.4 pp, 95% CI 4.6-22.2, P=0.003; NNT 8). The DSMB halted the trial at the pre-specified interim analysis for efficacy. Anti-FXa activity fell 94.5% vs 26.9% with usual care. The hemostatic benefit was offset by a near-four-fold increase in ischemic stroke (6.5% vs 1.5%; NNH 20) and a significant increase in any thrombotic event (10.3% vs 5.6%, P=0.048). There was no functional benefit at 30 days (exploratory mRS 0-3 28.0% vs 31.0%) and no mortality benefit (27.8% vs 25.5%, P=0.51). The trial confirms hemostatic activity and clarifies the ischemic-stroke trade-off but does not resolve whether andexanet should be preferred over 4F-PCC, which 85.5% of usual-care patients received. Supports AHA/ASA 2022 ICH guideline Class IIa, Level B for FXa-inhibitor reversal; a focused guideline update incorporating ANNEXA-I is pending. Andexanet alfa was subsequently withdrawn from the US market: the FDA concluded its thromboembolic risks outweighed its benefits, AstraZeneca submitted a voluntary withdrawal, and US commercial sales ended December 22, 2025. As of late 2025, 4F-PCC 50 U/kg is the default FXa-inhibitor reversal in the United States; andexanet availability outside the US varies by formulary.",
    "doi": "10.1056/NEJMoa2313040"
  },
  "aramis-trial": {
    "title": "ARAMIS Trial",
    "legend": {
      "finding": "DAPT non-inferior to alteplase for minor nondisabling stroke at 90 d (93.8% vs 91.4%).",
      "bottomLineTag": "NI met",
      "keyStat": "RD +2.3%"
    },
    "subtitle": "Dual Antiplatelet Therapy vs Alteplase for Minor Nondisabling Stroke",
    "source": "Chen HS, et al. (JAMA 2023)",
    "timeline": "China; October 2018 to April 2022",
    "listCategory": "thrombolysis",
    "listDescription": "Dual antiplatelet therapy vs alteplase for minor nondisabling stroke; non-inferiority confirmed.",
    "bottomLineSummary": "In patients with minor nondisabling acute ischemic stroke, DAPT was non-inferior to IV alteplase for excellent 90-day outcome (93.8% vs 91.4%, RD +2.4 pp, NI P<0.001), with lower sICH (0.3% vs 0.9%). ARAMIS supports DAPT as an alternative to thrombolysis for clearly nondisabling deficits but does not displace alteplase for disabling stroke.",
    "doi": "10.1001/jama.2023.7827"
  },
  "aster-trial": {
    "title": "ASTER Trial",
    "legend": {
      "finding": "No significant difference between aspiration-first and stent-retriever-first reperfusion.",
      "bottomLineTag": "NS",
      "keyStat": "85.4% vs 83.1% (P=0.53)"
    },
    "subtitle": "Contact Aspiration vs Stent Retriever Revascularization",
    "source": "Lapergue et al. (JAMA 2017)",
    "timeline": "Enrolled 2015-2016",
    "listCategory": "thrombectomy",
    "listDescription": "Device-comparison trial showing no clear advantage for aspiration over stent retrievers.",
    "bottomLineSummary": "No significant difference between contact-aspiration first-line and stent-retriever first-line for end-of-procedure revascularization (85.4% vs 83.1%) or 90-day mRS 0-2 (45.3% vs 50.3%). Rescue stent retriever was used in 25.2% of the aspiration arm. Supports operator choice with readiness to switch.",
    "doi": "10.1001/jama.2017.9644"
  },
  "aster2-trial": {
    "title": "ASTER2 Trial",
    "legend": {
      "finding": "Routine combined aspiration + stent retriever did not improve near-total reperfusion.",
      "bottomLineTag": "NS",
      "keyStat": "+6.6% (P=0.17)"
    },
    "subtitle": "Combined Aspiration + Stent Retriever vs Stent Retriever Alone",
    "source": "Lapergue et al. (JAMA 2021)",
    "timeline": "Enrolled 2017-2018 with 12-month follow-up",
    "listCategory": "thrombectomy",
    "listDescription": "Technical EVT trial showing no clear final reperfusion advantage from upfront combined strategy.",
    "bottomLineSummary": "Routine first-pass combined aspiration plus stent retriever (BADDASS) did not significantly improve near-total reperfusion (64.5% vs 57.9%) or 90-day mRS 0-2 (48.5% vs 49.5%) compared to stent retriever alone. Combined technique took longer. Does not support routine first-pass combination; reserve for rescue.",
    "doi": "10.1001/jama.2021.13827"
  },
  "attention-trial": {
    "title": "ATTENTION Trial",
    "legend": {
      "finding": "EVT within 12 h for basilar artery occlusion (NIHSS ≥10) roughly halves mortality and doubles good outcome.",
      "bottomLineTag": "NNT 4",
      "keyStat": "+23% mRS 0–3"
    },
    "subtitle": "Basilar Artery EVT",
    "source": "Tao et al. (NEJM 2022)",
    "timeline": "Enrolled 2020-2021",
    "listCategory": "thrombectomy",
    "listDescription": "Basilar artery thrombectomy within 12 hours; China trial.",
    "bottomLineSummary": "ATTENTION establishes EVT for basilar artery occlusion within 12 hours. mRS 0–3 at 90 days: 46% vs 23% (adjusted RR 2.06, 95% CI 1.46–2.91, P<0.001; NNT 4.3). 90-day mortality 37% vs 55%. Chinese cohort with ~44% intracranial atherosclerosis. AHA/ASA 2026 §4.7.3 COR 1.",
    "doi": "10.1056/NEJMoa2206317"
  },
  "attest-2-trial": {
    "title": "ATTEST-2 Trial",
    "legend": {
      "finding": "Tenecteplase 0.25 mg/kg noninferior to alteplase in standard-window IVT (UK).",
      "bottomLineTag": "NI met",
      "keyStat": "OR 1.07"
    },
    "subtitle": "Tenecteplase vs Alteplase Within 4.5 Hours",
    "source": "Muir KW, et al. (Lancet Neurol 2024)",
    "timeline": "United Kingdom; January 2017 to May 2023",
    "bottomLineSummary": "In 1777 treated patients across 39 UK stroke centres, tenecteplase 0.25 mg/kg was noninferior to alteplase 0.9 mg/kg for 90-day mRS distribution (adjusted OR 1.07, 95% CI 0.90-1.27; NI p<0.0001). Superiority was not demonstrated. mRS 0-1 was achieved in 44% vs 42%. Mortality was approximately 8% in both groups. Together with AcT and TRACE-2, ATTEST-2 firmly establishes tenecteplase 0.25 mg/kg as a noninferior replacement for alteplase in standard-window IVT.",
    "doi": "10.1016/S1474-4422(24)00377-6"
  },
  "b-proud-trial": {
    "title": "B_PROUD Trial",
    "legend": {
      "finding": "MSU dispatch in urban EMS shifts ordinal mRS toward less disability vs conventional ambulance.",
      "bottomLineTag": "cOR 0.71",
      "keyStat": "cOR 0.71 (less mRS)"
    },
    "subtitle": "Mobile Stroke Unit Dispatch vs Conventional Ambulance in Berlin",
    "source": "Ebinger M, et al. (JAMA 2021;325(5):454–466)",
    "timeline": "Berlin, Germany; February 1, 2017 to October 30, 2019 (final inclusion target reached May 8, 2019)",
    "bottomLineSummary": "B_PROUD evaluates MSU dispatch in Berlin (quasi-experimental, allocation by MSU availability). Primary ordinal mRS shift: common OR 0.71 (95% CI 0.58–0.86, P<0.001). Median 90-day mRS 1 (MSU) vs 2 (conventional). Workflow gains: dispatch-to-tPA shortened by 26 min; thrombolysis use up 12 pp. No safety penalty. AHA/ASA 2026 §2.5 COR 1 for MSU systems.",
    "doi": "10.1001/jama.2020.26345"
  },
  "baoche-trial": {
    "title": "BAOCHE Trial",
    "legend": {
      "finding": "EVT 6–24 h for basilar artery occlusion improves mRS 0–3 vs medical therapy.",
      "bottomLineTag": "NNT 5",
      "keyStat": "+22% mRS 0–3"
    },
    "subtitle": "Basilar EVT 6-24 Hours",
    "source": "Jovin et al. (NEJM 2022)",
    "timeline": "Enrolled Aug 2016 – Jun 2021 (stopped early Apr 2022 for efficacy)",
    "listCategory": "thrombectomy",
    "listDescription": "Basilar EVT 6–24 hours with imaging selection.",
    "bottomLineSummary": "BAOCHE extends basilar EVT to 6–24 hours after last-known-well. mRS 0–3 at 90 days: 46% vs 24% (adjusted RR 1.81, 95% CI 1.26–2.60, P<0.001; NNT 4.5). Primary outcome amended mid-trial from mRS 0–4 (negative) to mRS 0–3 (positive). Stopped early at interim. AHA/ASA 2026 §4.7.3 COR 1.",
    "doi": "10.1056/NEJMoa2207576"
  },
  "basics-trial": {
    "title": "BASICS Trial",
    "legend": {
      "finding": "EVT ≤6 h for basilar artery occlusion vs medical care did not significantly improve mRS 0–3.",
      "bottomLineTag": "Neutral",
      "keyStat": "RR 1.18"
    },
    "subtitle": "Basilar Artery International Cooperation Study: EVT vs Best Medical Treatment",
    "source": "Langezaal et al. (NEJM 2021)",
    "timeline": "300 patients enrolled; full enrollment target achieved",
    "listCategory": "thrombectomy",
    "listDescription": "Multinational RCT of EVT for basilar artery occlusion within 6 hours. Primary (mRS 0-3 at 90 days): 44.2% EVT vs 37.7% medical (RR 1.18, CI 0.92–1.50, P=0.19). Statistically negative; CI did not rule out meaningful benefit. Preceded ATTENTION (2022).",
    "bottomLineSummary": "BASICS randomized 300 patients with basilar artery occlusion at international centers within 6 hours. Primary (mRS 0-3 at 90 days): 44.2% EVT vs 37.7% medical (RR 1.18, CI 0.92–1.50, P=0.19). Not significant but with wide CI not ruling out meaningful benefit. Mortality favored EVT numerically (38.0% vs 43.2%). sICH higher in EVT (4.5% vs 0.7%). ATTENTION (2022) subsequently demonstrated definitive benefit for basilar EVT.",
    "doi": "10.1056/NEJMoa2030297"
  },
  "best-ii-trial": {
    "title": "BEST-II Trial",
    "legend": {
      "finding": "Phase 2 futility: lower post-EVT BP targets unlikely to succeed in a future superiority trial.",
      "bottomLineTag": "Futility",
      "keyStat": "14–25% predicted success"
    },
    "subtitle": "Blood Pressure Targets After Successful Endovascular Therapy",
    "source": "Mistry et al. (JAMA 2023)",
    "timeline": "Three US comprehensive stroke centers, 2020-2022",
    "listCategory": "acute",
    "listDescription": "Phase 2 futility trial: lower post-EVT BP targets showed low predicted success (14-25%) vs <=180 mm Hg. JAMA 2023.",
    "bottomLineSummary": "Phase 2 futility trial testing three BP targets after successful EVT in 120 patients. The <=180 mm Hg arm had the highest utility-weighted mRS (0.58 vs 0.51 for <140 mm Hg). No lower target formally crossed the futility boundary, but predicted success in a future superiority trial was only 14-25%. OPTIMAL-BP later confirmed functional harm from SBP <140 mm Hg after EVT.",
    "doi": "10.1001/jama.2023.14330"
  },
  "best-msu-trial": {
    "title": "BEST-MSU Trial",
    "legend": {
      "finding": "Prehospital MSU care saves 36 min and improves outcomes in tPA-eligible stroke.",
      "bottomLineTag": "NNT 13",
      "keyStat": "uw-mRS OR 2.14"
    },
    "subtitle": "Mobile Stroke Units vs Standard EMS in Acute Stroke",
    "source": "Grotta JC, et al. (NEJM 2021)",
    "timeline": "United States; August 2014 to August 2020",
    "listCategory": "acute",
    "listDescription": "Prehospital mobile stroke unit vs standard EMS in tPA-eligible stroke; positive quasi-experimental study.",
    "bottomLineSummary": "In a quasi-experimental alternating-week study from Houston, mobile stroke unit care reduced onset-to-treatment time by 36 minutes and improved excellent functional outcome at 90 days in tPA-eligible patients (53.5% vs 45.5%, AOR 2.14, P<0.001). The benefit is time-mediated; the non-randomized design limits causal certainty.",
    "doi": "10.1056/NEJMoa2103879"
  },
  "best-trial": {
    "title": "BEST Trial",
    "legend": {
      "finding": "First RCT of basilar EVT, stopped early; crossover and slow enrollment limit conclusions.",
      "bottomLineTag": "Inconclusive",
      "keyStat": "OR 1.74"
    },
    "subtitle": "Basilar Artery Occlusion: Endovascular Intervention vs Standard Medical Treatment",
    "source": "Liu et al. (Lancet Neurol 2020)",
    "timeline": "Terminated early: 131 of 240 planned patients enrolled",
    "listCategory": "thrombectomy",
    "listDescription": "First RCT of EVT for basilar artery occlusion. ITT primary (mRS 0-3 at 90 days): 42% vs 32% (OR 1.74, CI 0.81–3.74, p=0.23). Terminated early for crossover and low enrollment. Preceded ATTENTION (2022).",
    "bottomLineSummary": "BEST was the first RCT for basilar EVT and was terminated early (131/240 patients) due to crossover and slow enrollment. ITT primary (mRS 0-3 at 90 days): 42% EVT vs 32% medical (OR 1.74, 95% CI 0.81–3.74, P=0.23), not significant. Per-protocol: OR 2.90 (1.20–7.03, P=0.016), nominally significant but requires cautious interpretation. ATTENTION (2022) provided definitive evidence for basilar EVT.",
    "doi": "10.1016/S1474-4422(19)30395-3"
  },
  "bp-target-trial": {
    "title": "BP-TARGET Trial",
    "legend": {
      "finding": "Intensive post-EVT BP (SBP 100–129) did not reduce radiographic hemorrhage.",
      "bottomLineTag": "NS",
      "keyStat": "aOR 0.96 (0.60–1.51)"
    },
    "subtitle": "Intensive vs Standard Blood Pressure Control After Successful EVT",
    "source": "Mazighi et al. (Lancet Neurol 2021)",
    "timeline": "Four academic stroke centers in France",
    "listCategory": "acute",
    "listDescription": "First RCT of post-EVT BP: intensive SBP 100-129 mm Hg did not reduce radiographic hemorrhage vs standard 130-185 mm Hg. Lancet Neurol 2021.",
    "bottomLineSummary": "First RCT of post-EVT BP management: 324 patients randomized to intensive (SBP 100-129 mm Hg) vs standard (130-185 mm Hg) at four French centers. Primary endpoint of any radiographic iPH at 24-36 hours was identical (42% vs 43%, aOR 0.96, P=0.84). Functional outcomes numerically favored standard management. No benefit from intensive BP lowering was demonstrated.",
    "doi": "10.1016/S1474-4422(20)30483-X"
  },
  "cast-trial": {
    "title": "CAST",
    "legend": {
      "finding": "Aspirin 160 mg/d started within 48h of acute ischaemic stroke reduces in-hospital mortality and combined death or non-fatal stroke.",
      "bottomLineTag": "6.8 / 1000",
      "keyStat": "3.3% vs 3.9%, 2p=0.04"
    },
    "subtitle": "Chinese Acute Stroke Trial: Aspirin 160 mg/day vs Placebo Within 48h of Acute Ischaemic Stroke (CAST Collaborative Group, 1997)",
    "source": "CAST Collaborative Group (Lancet 1997;349:1641-1649)",
    "timeline": "Enrolled November 1993 to March 1997; in-hospital outcome (up to 4 weeks); discharge forms available for 97.9% of randomised patients. Published Lancet 1997 June 7.",
    "listCategory": "antiplatelets",
    "listDescription": "Double-blind placebo-controlled trial (N=21,106 across 413 Chinese hospitals) of aspirin 160 mg/d vs placebo within 48h of acute ischaemic stroke. In-hospital mortality 3.3% vs 3.9% (2p=0.04); combined 4-week death or non-fatal stroke 5.3% vs 5.9% (2p=0.03).",
    "bottomLineSummary": "In 21,106 patients within 48h of acute ischaemic stroke, double-blind aspirin 160 mg/day vs placebo reduced in-hospital mortality (3.3% vs 3.9%, 2p=0.04) and combined 4-week death or non-fatal stroke (5.3% vs 5.9%, 2p=0.03; 6.8 fewer per 1000). Dead-or-dependent at discharge directionally favoured aspirin (30.5% vs 31.6%, 2p=0.08; trend). Foundational evidence (with IST) for the AHA/ASA Class I, Level A early-aspirin recommendation.",
    "doi": "10.1016/S0140-6736(97)04010-5"
  },
  "chance-2-trial": {
    "title": "CHANCE-2 Trial",
    "legend": {
      "finding": "Ticagrelor + aspirin in CYP2C19 loss-of-function carriers cuts 90-d stroke vs clopidogrel + aspirin.",
      "bottomLineTag": "NNT 63",
      "keyStat": "ARR 1.6%"
    },
    "subtitle": "Ticagrelor vs Clopidogrel DAPT in CYP2C19 Loss-of-Function Carriers",
    "source": "Wang Y, et al. (NEJM 2021)",
    "timeline": "Enrolled 2019–2021; published NEJM 2021",
    "listCategory": "antiplatelets",
    "listDescription": "Ticagrelor vs clopidogrel DAPT in CYP2C19 loss-of-function carriers. NNT=63. AHA 2026 COR 2b.",
    "bottomLineSummary": "CHANCE-2 tests genotype-guided DAPT in CYP2C19 LOF carriers (15-30% Europeans, 50-60% Asians). Stroke recurrence at 90 days: 6.0% (ticagrelor) vs 7.6% (clopidogrel), HR 0.77 (95% CI 0.64–0.94, P=0.008; NNT 63). Severe bleeding unchanged. AHA/ASA 2026 §4.8 COR 2b for confirmed LOF carriers.",
    "doi": "10.1056/NEJMoa2111749"
  },
  "chance-trial": {
    "title": "CHANCE Trial",
    "legend": {
      "finding": "Clopidogrel + aspirin × 21 d after minor stroke or high-risk TIA cuts 90-d stroke vs aspirin alone.",
      "bottomLineTag": "NNT 29",
      "keyStat": "ARR 3.5%"
    },
    "subtitle": "Clopidogrel with Aspirin in Acute Minor Stroke or Transient Ischemic Attack",
    "source": "Wang Y, Wang Y, Zhao X, et al. Clopidogrel with aspirin in acute minor stroke or transient ischemic attack. N Engl J Med. 2013;369(1):11-19.",
    "timeline": "Enrolled 2009-2012",
    "listCategory": "antiplatelets",
    "listDescription": "DAPT (clopidogrel + aspirin) after TIA/minor stroke; NNT=29. AHA 2026 COR 1.",
    "bottomLineSummary": "CHANCE showed that clopidogrel plus aspirin started within 24 hours of minor stroke or high-risk TIA reduced 90-day stroke recurrence by 32% (NNT 29) without increasing major hemorrhage. The 21-day dual therapy duration is the guideline standard; AHA/ASA 2026 rates this strategy Class I.",
    "doi": "10.1056/NEJMoa1215340"
  },
  "charisma-trial": {
    "title": "CHARISMA Trial",
    "legend": {
      "finding": "Aspirin+clopidogrel vs aspirin alone in stable CV disease/risk factors showed no benefit with more bleeding.",
      "bottomLineTag": "No benefit",
      "keyStat": "RR 0.93"
    },
    "subtitle": "Clopidogrel for High Atherothrombotic Risk and Ischemic Stabilization, Management, and Avoidance",
    "source": "Bhatt et al. (NEJM 2006)",
    "timeline": "15,603 patients; median 28-month follow-up",
    "listCategory": "antiplatelets",
    "listDescription": "Aspirin + clopidogrel vs aspirin alone for median 28 months in broad CV risk population: no overall benefit (6.8% vs 7.3%, RR 0.93, CI 0.83–1.05, P=0.22) and harm in asymptomatic subgroup. Preceded POINT (2018).",
    "bottomLineSummary": "CHARISMA enrolled 15,603 patients with established CV disease or multiple risk factors and compared aspirin+clopidogrel vs aspirin alone over median 28 months. Primary (MI/stroke/CV death): 6.8% vs 7.3% (RR 0.93, CI 0.83–1.05, P=0.22), not significant overall. Symptomatic subgroup: nominally favorable signal (RR 0.88, hypothesis-generating). Asymptomatic subgroup: excess harm (RR 1.20). Moderate bleeding doubled. POINT (2018) showed short-duration DAPT after minor stroke/TIA is beneficial.",
    "doi": "10.1056/NEJMoa060989"
  },
  "charm-trial": {
    "title": "CHARM Trial",
    "legend": {
      "finding": "IV glibenclamide did not improve mRS in large hemispheric infarct; trial underpowered after COVID stop.",
      "bottomLineTag": "NS",
      "keyStat": "cOR 1.17 (0.80–1.71)"
    },
    "subtitle": "Intravenous Glibenclamide for Cerebral Edema After Large Hemispheric Stroke",
    "source": "Sheth et al. (Lancet Neurol 2024)",
    "timeline": "143 stroke centers in 21 countries; stopped early for operational reasons",
    "listCategory": "acute",
    "listDescription": "Phase 3 glibenclamide for large hemispheric infarction: null primary (cOR 1.17, P=0.42); stopped early for COVID. Lancet Neurol 2024.",
    "bottomLineSummary": "Phase 3 double-blind trial of IV glibenclamide vs placebo for large hemispheric infarction in 535 patients across 143 centers. Stopped early for COVID-19. Primary outcome (mRS ordinal shift at 90 days, age 18-70) was null: cOR 1.17, 95% CI 0.80-1.71, P=0.42. Mortality numerically higher with glibenclamide; hypoglycemia 6% vs 2%. Findings are inconclusive due to underpowering from early stopping."
  },
  "choice-trial": {
    "title": "CHOICE Trial",
    "legend": {
      "finding": "Adjunct IA alteplase after successful EVT raised excellent outcome 40%→59% (small phase 2b).",
      "bottomLineTag": "+18 / 100",
      "keyStat": "aRD 18.4% (0.3–36.4)"
    },
    "subtitle": "Adjunct Intra-arterial Alteplase After Successful Thrombectomy",
    "source": "Renu et al. (JAMA 2022)",
    "timeline": "Enrolled 2018-2021; stopped early during the pandemic",
    "listCategory": "thrombectomy",
    "listDescription": "Post-thrombectomy adjunct IA alteplase trial suggesting better excellent outcomes.",
    "bottomLineSummary": "CHOICE was a small Phase 2b trial (N=121) suggesting that adjunct intra-arterial alteplase after successful thrombectomy improves excellent functional outcome (mRS 0 to 1) at 90 days from 40.4% to 59.0%. The trial stopped early during COVID, the confidence interval was wide, and replication is needed before routine use."
  },
  "close-trial": {
    "title": "CLOSE Trial",
    "legend": {
      "finding": "In cryptogenic stroke <60 with PFO + ASA or large shunt, PFO closure abolished recurrent stroke vs antiplatelet alone.",
      "bottomLineTag": "NNT 20",
      "keyStat": "HR 0.03 (0.00–0.26)"
    },
    "subtitle": "PFO Closure or Anticoagulation vs Antiplatelets for Cryptogenic Stroke (Mas et al., 2017)",
    "source": "Mas JL et al. (NEJM 2017;377:1011-1021)",
    "timeline": "Enrolled December 2007 to December 2016; mean follow-up 5.3 years",
    "listCategory": "antiplatelets",
    "listDescription": "Cryptogenic stroke <60y with PFO + ASA or large shunt: closure abolished recurrent stroke (0% vs 6.0%, HR 0.03, NNT 20 over 5y). AF excess.",
    "bottomLineSummary": "In 663 patients 16–60 with cryptogenic stroke and PFO with atrial septal aneurysm OR large interatrial shunt, transcatheter PFO closure + long-term antiplatelet reduced recurrent stroke from 6.0% to 0% over mean 5.3-year follow-up (HR 0.03, 95% CI 0.00–0.26, P<0.001; 5-year ARD 4.9 percentage points; NNT 20). Atrial fibrillation/flutter excess 4.6% vs 0.9% (P=0.02), largely transient periprocedural.",
    "doi": "10.1056/NEJMoa1705915"
  },
  "closure-i-trial": {
    "title": "CLOSURE I Trial",
    "legend": {
      "finding": "First major PFO closure RCT; STARFlex device did not reduce stroke/TIA recurrence vs medical therapy. Negative.",
      "bottomLineTag": "Primary not met",
      "keyStat": "HR 0.78 (0.45–1.35), P=0.37"
    },
    "subtitle": "STARFlex Device Closure vs Medical Therapy for Cryptogenic Stroke or TIA with PFO (Furlan et al., 2012)",
    "source": "Furlan AJ et al. (NEJM 2012;366:991-999)",
    "timeline": "Enrolled June 2003 to October 2008; published NEJM 2012",
    "listCategory": "antiplatelets",
    "listDescription": "First major PFO closure RCT (N=909, ages 18–60). STARFlex device + antithrombotic vs medical therapy in cryptogenic stroke/TIA. Primary 2-year composite not met (5.5% vs 6.8%, HR 0.78, P=0.37). AF excess 5.7% vs 0.7%. Negative result.",
    "bottomLineSummary": "In 909 patients ages 18–60 with cryptogenic stroke or TIA and PFO, transcatheter closure with the STARFlex device (NMT Medical, since withdrawn) + clopidogrel + aspirin vs medical therapy alone did not reduce the 2-year composite of stroke/TIA, 30-day all-cause death, or days 31–730 neurologic death (5.5% vs 6.8%, adjusted HR 0.78, 95% CI 0.45–1.35, P=0.37). New-onset atrial fibrillation 5.7% vs 0.7% (P<0.001); major vascular procedural complications 3.2%.",
    "doi": "10.1056/NEJMoa1009639"
  },
  "compass-trial": {
    "title": "COMPASS Trial",
    "legend": {
      "finding": "Aspiration-first was noninferior to stent-retriever-first for 90-day mRS 0–2.",
      "bottomLineTag": "Non-inferior",
      "keyStat": "52% vs 50% (Δ+2)"
    },
    "subtitle": "Aspiration First Pass vs Stent Retriever First Line",
    "source": "Turk et al. (Lancet 2019)",
    "timeline": "Conducted at 15 North American sites",
    "listCategory": "thrombectomy",
    "listDescription": "Device-strategy trial showing aspiration-first thrombectomy was noninferior to stent retrievers.",
    "bottomLineSummary": "Contact-aspiration as first-line technique was non-inferior to stent-retriever first-line for 90-day functional outcome in anterior circulation LVO. Aspiration produced lower first-pass reperfusion but equivalent clinical outcomes. Supports flexibility in initial technique choice.",
    "doi": "10.1016/S0140-6736(19)30297-1"
  },
  "crest-2-trial": {
    "title": "CREST-2 Trials",
    "legend": {
      "finding": "Stenting beat modern intensive medical management for asymptomatic ≥70% carotid stenosis (NNT 31). Endarterectomy did not.",
      "bottomLineTag": "NNT 31 / NS CEA",
      "keyStat": "CAS 2.8% vs 6.0% (P=0.02)"
    },
    "subtitle": "Stenting and Endarterectomy vs Intensive Medical Management for Asymptomatic Carotid Stenosis",
    "source": "Brott TG, et al. for the CREST-2 Investigators (NEJM 2026;394:219-231)",
    "timeline": "Enrolled December 2014 to early 2024; follow-up through July 2025",
    "listCategory": "carotid",
    "listDescription": "Two parallel RCTs in asymptomatic ≥70% carotid stenosis. Stenting beat modern intensive medical management (2.8% vs 6.0%, P=0.02, NNT 31). Endarterectomy did not (3.7% vs 5.3%, P=0.24).",
    "bottomLineSummary": "In asymptomatic ≥70% carotid stenosis, CREST-2 ran two parallel RCTs against modern intensive medical management (SBP <130, LDL <70, antithrombotic, coaching). Carotid-artery stenting reduced 4-year periprocedural stroke/death plus postprocedural ipsilateral stroke from 6.0% to 2.8% (ARD 3.2 pp, P=0.02, NNT 31). Carotid endarterectomy showed 3.7% vs 5.3% (P=0.24, not met).",
    "doi": "10.1056/NEJMoa2508800"
  },
  "crest-trial": {
    "title": "CREST Trial",
    "legend": {
      "finding": "Carotid stenting and endarterectomy yield equivalent composite stroke/MI/death in average-risk patients.",
      "bottomLineTag": "Equivalent",
      "keyStat": "7.2% vs 6.8%"
    },
    "subtitle": "Carotid Stenting versus Endarterectomy for Carotid-Artery Stenosis",
    "source": "Brott TG, Hobson RW 2nd, Howard G, et al. Stenting versus endarterectomy for treatment of carotid-artery stenosis. N Engl J Med. 2010;363(1):11–23.",
    "timeline": "Enrolled December 2000 – July 2008; median follow-up 2.5 years (planned to 4 years); primary results published NEJM July 2010",
    "listCategory": "carotid",
    "listDescription": "CAS vs CEA in average-risk carotid stenosis. No primary 4-yr difference; CAS↑stroke, CEA↑MI/cranial nerve palsy; age-dependent.",
    "bottomLineSummary": "CREST is the largest North American head-to-head trial of carotid stenting and endarterectomy in average-surgical-risk symptomatic and asymptomatic patients. The 4-year primary composite of periprocedural stroke, MI, or death plus 4-year ipsilateral stroke showed no significant difference (7.2% CAS vs 6.8% CEA, HR 1.11, 95% CI 0.81–1.51, P=0.51), superiority was not demonstrated for either approach. The clinical decision rests on the periprocedural component split: CAS roughly doubles stroke, CEA roughly doubles MI, and CEA accounts for nearly all cranial nerve palsy. Treatment effect varies by age (interaction P=0.02) with a crossover near 70 years. CREST does not address either approach versus intensive medical management, that question is the subject of CREST-2.",
    "doi": "10.1056/NEJMoa0912321"
  },
  "dawn-trial": {
    "title": "DAWN Trial",
    "legend": {
      "finding": "Thrombectomy to 24 h with clinical–core mismatch: 49% vs 13% independence, NNT 2.8.",
      "bottomLineTag": "+36 / 100",
      "keyStat": "NNT 2.8"
    },
    "subtitle": "Thrombectomy for Ischemic Stroke (6-24 Hours)",
    "source": "Nogueira et al. (NEJM 2018;378(1):11–21)",
    "timeline": "Enrolled 2014-2017",
    "listCategory": "thrombectomy",
    "listDescription": "Thrombectomy 6–24 hours with clinical–imaging mismatch.",
    "bottomLineSummary": "DAWN extends EVT to 24h after LKW for clinical-imaging mismatch patients (Trevo device). Primary uw-mRS Bayesian posterior P(superiority) >0.999. Coprimary mRS 0–2 binary: 49% vs 13% (derived NNT 2.8 from secondary, displayed with Bayesian annotation). Stopped early at 31 months. AHA/ASA 2026 §4.7.2 COR 1.",
    "doi": "10.1056/NEJMoa1706442"
  },
  "decimal-trial": {
    "title": "DECIMAL Trial",
    "legend": {
      "finding": "Hemicraniectomy within 30 h cuts mortality 52.8 pp in malignant MCA infarction (age <56).",
      "bottomLineTag": "−52.8 pp mortality",
      "keyStat": "ARR 52.8% mortality"
    },
    "subtitle": "Early Decompressive Craniectomy in Malignant MCA Infarction",
    "source": "Vahedi et al. (Stroke 2007)",
    "timeline": "France, 2001-2005; stopped early for pooled analysis",
    "listCategory": "acute",
    "bottomLineSummary": "Early hemicraniectomy (within 30-35 hours) reduces mortality by 52.8 percentage points in malignant MCA infarction in patients aged 18-55. The primary functional endpoint was not met due to small sample size. Most survivors remain severely disabled.",
    "doi": "10.1161/STROKEAHA.107.485235"
  },
  "defense-pfo-trial": {
    "title": "DEFENSE-PFO Trial",
    "legend": {
      "finding": "In cryptogenic stroke with HIGH-RISK PFO anatomy (ASA, hypermobility ≥10 mm, or PFO size ≥2 mm), closure markedly reduced 2-year stroke / vascular death / major bleeding vs medical therapy.",
      "bottomLineTag": "NNT 8 over 2y",
      "keyStat": "0% vs 12.9% at 2y (P=0.013)"
    },
    "subtitle": "Device Closure vs Medication for Cryptogenic Stroke Patients With High-Risk PFO Anatomy (Lee et al., 2018)",
    "source": "Lee PH et al. (JACC 2018;71:2335-2342)",
    "timeline": "Enrolled September 2011 to October 2017; 2-year follow-up; published JACC 2018",
    "listCategory": "antiplatelets",
    "listDescription": "Korean RCT (N=120) of PFO closure vs medical therapy in cryptogenic stroke patients with HIGH-RISK PFO anatomy (atrial septal aneurysm, hypermobility ≥10 mm, or PFO size ≥2 mm). 2-year primary composite 0% (closure) vs 12.9% (medical), P=0.013. Confirmed morphology-enrichment hypothesis.",
    "bottomLineSummary": "In 120 Korean patients (mean age 51.8 years) with cryptogenic ischemic stroke and HIGH-RISK PFO anatomy (atrial septal aneurysm, septal hypermobility with phasic excursion ≥10 mm, or PFO size ≥2 mm), transcatheter PFO closure plus antiplatelet/anticoagulant vs medication-only therapy reduced the 2-year composite of stroke, vascular death, or TIMI-defined major bleeding from 12.9% (6/60) to 0% (0/60); log-rank P=0.013. 2-year ischemic stroke rate 0% vs 10.5% (P=0.023). Procedural complications were nonfatal: AF n=2/60 (3.3%), pericardial effusion n=1/60, pseudoaneurysm n=1/60.",
    "doi": "10.1016/j.jacc.2018.02.046"
  },
  "defuse-3-trial": {
    "title": "DEFUSE 3 Trial",
    "legend": {
      "finding": "Perfusion-selected thrombectomy at 6–16 h triples functional independence (45% vs 17%).",
      "bottomLineTag": "+28 / 100",
      "keyStat": "NNT 3.6"
    },
    "subtitle": "Thrombectomy for Ischemic Stroke (6-16 Hours)",
    "source": "Albers et al. (NEJM 2018;378(8):708–718)",
    "timeline": "Enrolled 2016-2017",
    "listCategory": "thrombectomy",
    "listDescription": "Thrombectomy 6–16 hours with perfusion imaging selection.",
    "bottomLineSummary": "DEFUSE-3 extends EVT to 6–16h with RAPID perfusion selection. Primary ordinal mRS shift: common OR 2.77 (95% CI 1.63–4.70, P<0.001). Secondary mRS 0–2: 45% vs 17% (NNT 3.6). Stopped early at pre-specified interim. AHA/ASA 2026 §4.7.2 COR 1.",
    "doi": "10.1056/NEJMoa1713973"
  },
  "destiny-ii-trial": {
    "title": "DESTINY II Trial",
    "legend": {
      "finding": "Hemicraniectomy in patients 61–82 with malignant MCA infarction improves survival at the cost of severe disability.",
      "bottomLineTag": "+20 pp survival",
      "keyStat": "+20% survival"
    },
    "subtitle": "Hemicraniectomy in Older Patients With Malignant MCA Stroke",
    "source": "Juttler et al. (NEJM 2014)",
    "timeline": "Germany; patients aged 61-82 years",
    "listCategory": "acute",
    "bottomLineSummary": "DESTINY II randomized 112 patients aged 61-82 to early hemicraniectomy vs conservative intensive care. Primary endpoint (mRS 0-4 at 6 months) was met: 38% vs 18%, OR 2.91 (95% CI 1.06-7.49), P=0.04. Mortality was reduced: 33% vs 70%. But 0% of patients in either group achieved mRS 0-2 (independent function). Virtually all surgical survivors had mRS 4 (severe disability). The trial is positive for preventing death; it does not establish good functional recovery in this age group.",
    "doi": "10.1056/NEJMoa1311367"
  },
  "destiny-trial": {
    "title": "DESTINY Trial",
    "legend": {
      "finding": "Decompressive surgery improves survival in malignant MCA infarction (age <61); function not met.",
      "bottomLineTag": "+41 pp survival",
      "keyStat": "ARR 41% mortality"
    },
    "subtitle": "Decompressive Surgery for Malignant MCA Infarction",
    "source": "Juttler et al. (Stroke 2007)",
    "timeline": "Germany; stopped after pooled European data emerged",
    "listCategory": "acute",
    "bottomLineSummary": "Early hemicraniectomy reduces 30-day and 6-month mortality by approximately 41 percentage points in malignant MCA infarction in patients aged 18-60. The primary functional endpoint (mRS 0-3 at 6 months) was not met in this 32-patient trial. The pooled European analysis is the more reliable efficacy estimate."
  },
  "devt-trial": {
    "title": "DEVT Trial",
    "legend": {
      "finding": "Direct EVT met NI at a wide −10 pp margin after early stopping.",
      "bottomLineTag": "Non-inferior",
      "keyStat": "+7.7% (−2.9 to 18.2)"
    },
    "subtitle": "Direct EVT vs Alteplase Plus EVT",
    "source": "Zi et al. (JAMA 2021)",
    "timeline": "Enrolled 2018-2020; stopped early for efficacy",
    "listCategory": "thrombectomy",
    "listDescription": "Chinese direct-EVT trial meeting noninferiority against alteplase plus thrombectomy.",
    "bottomLineSummary": "Direct EVT met non-inferiority vs alteplase plus EVT at a -10 pp margin in 234 Chinese patients with proximal LVO. Trial was stopped early. The wide margin and early stopping mean the numerical advantage for direct EVT cannot be interpreted as superiority. Does not change guideline-recommended bridging therapy.",
    "doi": "10.1001/jama.2020.23523"
  },
  "direct-mt-trial": {
    "title": "DIRECT-MT Trial",
    "legend": {
      "finding": "Direct EVT met noninferiority vs bridging in Chinese centers; CI margin narrow.",
      "bottomLineTag": "Non-inferior",
      "keyStat": "cOR 1.07 (0.81–1.40)"
    },
    "subtitle": "Thrombectomy Alone vs Bridging Alteplase",
    "source": "Yang et al. (NEJM 2020)",
    "timeline": "Conducted at 41 tertiary centers",
    "listCategory": "thrombectomy",
    "listDescription": "Early direct-EVT noninferiority trial that intensified the bridge-vs-direct debate.",
    "bottomLineSummary": "Direct EVT was non-inferior to IV alteplase plus EVT for 90-day mRS shift in Chinese centers with rapid EVT access. The CI just cleared the pre-specified margin. Pre-EVT reperfusion was lower without alteplase. Does not establish superiority and does not generalize to drip-and-ship workflows.",
    "doi": "10.1056/NEJMoa2001123"
  },
  "direct-safe-trial": {
    "title": "DIRECT-SAFE Trial",
    "legend": {
      "finding": "Direct EVT did not meet NI vs bridging therapy across AU/NZ/China/Vietnam.",
      "bottomLineTag": "NI not met",
      "keyStat": "−5.1% (−15.4 to 5.3)"
    },
    "subtitle": "Direct EVT vs Bridging Therapy Within 4.5 Hours",
    "source": "Mitchell et al. (Lancet 2022)",
    "timeline": "Enrolled 2018-2021 across Australia, New Zealand, China, and Vietnam",
    "listCategory": "thrombectomy",
    "listDescription": "International direct-EVT trial that did not support skipping thrombolysis.",
    "bottomLineSummary": "International non-inferiority trial of direct EVT vs IV thrombolysis (alteplase or tenecteplase) plus EVT in LVO stroke within 4.5 hours. mRS 0-2 or pre-stroke baseline: 55.0% vs 61.4%; adjusted RD -5.1% (95% CI -15.4% to 5.3%). Non-inferiority not met (lower CI crossed -12 pp margin). sICH 1.0% in both arms.",
    "doi": "10.1016/S0140-6736(22)00564-5"
  },
  "distal-trial": {
    "title": "DISTAL Trial",
    "legend": {
      "finding": "EVT for medium/distal vessel occlusion did not improve outcome and trended toward harm.",
      "bottomLineTag": "Neutral",
      "keyStat": "aOR 0.90"
    },
    "subtitle": "EVT for Medium/Distal Vessel Occlusion Stroke",
    "source": "Psychogios M, Brehm A, et al. N Engl J Med. 2025;392(14):1374-1384",
    "timeline": "Dec 2021 – Jul 2024, 55 sites, 11 countries (mostly Europe)",
    "listCategory": "thrombectomy",
    "listDescription": "EVT for medium and distal vessel occlusions; negative trial (NEJM 2025).",
    "bottomLineSummary": "In 543 patients with medium or distal vessel occlusion (M2-M4, ACA, or PCA) treated within 24 hours, EVT plus best medical treatment did not improve 90-day mRS distribution versus medical treatment alone (cOR 0.90, 95% CI 0.67-1.22, p=0.50). Median mRS was 2.0 in both groups. Symptomatic ICH was more than doubled with EVT (5.9% vs 2.6%). Reperfusion was achieved in only 71.7% of EVT patients. Together with ESCAPE-MeVO, DISTAL argues strongly against routine EVT for unselected medium or distal vessel occlusions."
  },
  "eagle-trial": {
    "title": "EAGLE Trial",
    "legend": {
      "finding": "IA tPA for CRAO causes harm (37% adverse events incl. ICH) with no visual benefit.",
      "bottomLineTag": "Harm",
      "keyStat": "−2.9% visual benefit"
    },
    "subtitle": "Intra-Arterial tPA for Central Retinal Artery Occlusion",
    "source": "Schumacher et al. (Ophthalmology 2010)",
    "timeline": "Enrolled 2002-2007",
    "listCategory": "thrombolysis",
    "listDescription": "IA tPA for central retinal artery occlusion; negative trial; stopped early for futility.",
    "bottomLineSummary": "Local intra-arterial fibrinolysis for CRAO presenting within 20 hours showed no improvement in visual acuity compared with conservative treatment (primary P=0.69; secondary dichotomized endpoint 57.1% vs 60.0% with clinically meaningful improvement) and caused significantly more adverse events (37.1% vs 4.3%), including procedure-related intracranial hemorrhage. The DSMB stopped the trial at 84 patients for futility and safety. IA tPA is not recommended for CRAO.",
    "doi": "10.1016/j.ophtha.2010.03.061"
  },
  "ecass3-trial": {
    "title": "ECASS III Trial",
    "legend": {
      "finding": "Alteplase benefit extends from 3 h to 4.5 h after onset.",
      "bottomLineTag": "+7 / 100",
      "keyStat": "NNT 14"
    },
    "subtitle": "IV tPA for Acute Ischemic Stroke (3–4.5 Hours)",
    "source": "Hacke et al. (NEJM 2008)",
    "timeline": "Enrolled 2003-2007",
    "listCategory": "thrombolysis",
    "listDescription": "Extended IV tPA window to 4.5 hours; 52.4% vs 45.2% mRS 0-1.",
    "bottomLineSummary": "ECASS III extended the IV alteplase window from 3h to 4.5h for selected patients. Functional independence (mRS 0–1) at 90 days improved from 45.2% to 52.4% (NNT 14, P=0.04). Symptomatic ICH rose to 2.4% from 0.2% but mortality was unchanged. AHA/ASA 2026 §4.6.3 COR 2a for ECASS III-eligible patients.",
    "doi": "10.1056/NEJMoa0804656"
  },
  "elan-study": {
    "title": "ELAN Trial",
    "legend": {
      "finding": "Early DOAC start after AF-related stroke is non-inferior with reassuring safety (sICH 0.2% both arms).",
      "bottomLineTag": "NI met",
      "keyStat": "RD −1.18%"
    },
    "subtitle": "Early versus Later Anticoagulation for Stroke with Atrial Fibrillation",
    "source": "Fischer U, et al. N Engl J Med. 2023;388(26):2411-2421",
    "timeline": "Enrolled Nov 2017 – Sep 2022, 103 sites, 15 countries",
    "listCategory": "antiplatelets",
    "listDescription": "Early vs delayed DOAC in AF stroke: estimation trial supporting early initiation when imaging allows it.",
    "bottomLineSummary": "ELAN was an estimation trial showing that early DOAC initiation after AF-related ischemic stroke, timed by imaging-based severity classification, was not significantly more harmful than the traditional delayed approach. The primary composite event rate was 2.9% with early vs 4.1% with later initiation, with identical symptomatic ICH rates. The result supports early anticoagulation when clinically indicated and imaging permits.",
    "doi": "10.1056/NEJMoa2303048"
  },
  "enchanted-trial": {
    "title": "ENCHANTED Trial",
    "legend": {
      "finding": "Intensive post-alteplase BP lowering reduced any-ICH but did not improve 90-day disability.",
      "bottomLineTag": "NS",
      "keyStat": "cOR 1.01 (0.87–1.17)"
    },
    "subtitle": "Intensive Blood Pressure Reduction During IV Alteplase Treatment",
    "source": "Anderson et al. (Lancet 2019)",
    "timeline": "Conducted at 110 sites in 15 countries",
    "listCategory": "acute",
    "listDescription": "Null primary (mRS shift OR 1.01, P=0.87); secondary any-ICH reduced (14.8% vs 18.7%) but did not translate to functional benefit. Lancet 2019.",
    "bottomLineSummary": "Multicenter RCT in 2196 alteplase-eligible patients: intensive SBP target 130-140 mm Hg vs guideline less than 180 mm Hg for 72 hours. Primary outcome (mRS ordinal shift at 90 days) was null: OR 1.01, 95% CI 0.87-1.17, P=0.87. Pre-specified secondary any-ICH was reduced (14.8% vs 18.7%, P=0.014) but did not translate to functional benefit.",
    "doi": "10.1016/S0140-6736(19)30038-8"
  },
  "enrich-trial": {
    "title": "ENRICH Trial",
    "legend": {
      "finding": "Minimally invasive parafascicular surgery for lobar ICH 30–80 mL improves utility-weighted mRS at 180 d.",
      "bottomLineTag": "NNT 12",
      "keyStat": "0.458 vs 0.374"
    },
    "subtitle": "Minimally Invasive Surgical Evacuation of Intracerebral Hemorrhage",
    "source": "Pradilla G, et al. (NEJM 2024)",
    "timeline": "Enrolled Dec 1, 2016 – Aug 24, 2022; published NEJM April 2024",
    "listCategory": "acute",
    "listDescription": "First positive randomized minimally-invasive surgical ICH trial; 30-day mortality 9.3% vs 18.0% (Bayesian P>0.98). NEJM 2024.",
    "bottomLineSummary": "ENRICH is the first randomized supratentorial ICH evacuation trial to meet its prespecified primary endpoint. UW-mRS at 180d: difference +0.084 (95% CrI 0.005–0.163, posterior P(sup)=0.981). 30-day mortality 9.3% vs 18.0% (ARD -8.7 pp, posterior P=0.987). Bayesian RAR design (no frequentist p-value). AHA/ASA 2022 ICH Class IIb (pre-ENRICH); may prompt focused update.",
    "doi": "10.1056/NEJMoa2308440"
  },
  "escape-mevo-trial": {
    "title": "ESCAPE-MeVO Trial",
    "legend": {
      "finding": "Routine EVT for medium-vessel occlusion shows no functional benefit and higher sICH (5.4% vs 2.2%).",
      "bottomLineTag": "No benefit",
      "keyStat": "aRR 0.95"
    },
    "subtitle": "EVT for Medium Vessel Occlusions",
    "source": "Goyal et al. (NEJM 2025)",
    "timeline": "Enrolled 2019-2024",
    "listCategory": "thrombectomy",
    "listDescription": "EVT for medium vessel occlusion (MeVO); no functional benefit, higher sICH and mortality (NEJM 2025).",
    "bottomLineSummary": "ESCAPE-MeVO showed that EVT for medium vessel occlusion (M2, M3, ACA, PCA branches) did not improve the rate of excellent functional outcome (mRS 0-1) at 90 days compared with best medical management, and was associated with higher rates of symptomatic hemorrhage and 90-day mortality. Routine EVT for MeVO is not supported by this evidence."
  },
  "escape-na1-trial": {
    "title": "ESCAPE-NA1 Trial",
    "legend": {
      "finding": "Nerinetide during EVT did not improve 90-day independence overall.",
      "bottomLineTag": "NS",
      "keyStat": "aRR 1.04 (0.96–1.13)"
    },
    "subtitle": "Nerinetide Neuroprotection During EVT for Acute Ischemic Stroke",
    "source": "Hill et al. (Lancet 2020)",
    "timeline": "48 hospitals in 8 countries",
    "listCategory": "acute",
    "listDescription": "Nerinetide neuroprotection in EVT: null overall (mRS 0-2, 61.4% vs 59.2%, P=0.35). Alteplase-free subgroup interaction is hypothesis-generating only. Lancet 2020.",
    "bottomLineSummary": "Double-blind RCT of nerinetide in 1105 LVO stroke patients undergoing EVT within 12 hours. Primary endpoint (mRS 0-2 at 90 days) was null: 61.4% vs 59.2%, adjusted RR 1.04, P=0.35. A prespecified interaction showed numerically larger effect in alteplase-free patients (59.3% vs 49.8%), raising a hypothesis about alteplase-nerinetide interaction that requires dedicated confirmation.",
    "doi": "10.1016/S0140-6736(20)30258-0"
  },
  "escape-trial": {
    "title": "ESCAPE Trial",
    "legend": {
      "finding": "Small-core LVO thrombectomy raised independence to 53% vs 29%; mortality cut from 19% to 10%.",
      "bottomLineTag": "+24 / 100",
      "keyStat": "NNT 4.2 (mRS 0–2 secondary)"
    },
    "subtitle": "Rapid EVT for Small-Core LVO With Good Collaterals",
    "source": "Goyal et al. (NEJM 2015)",
    "timeline": "Stopped early for efficacy",
    "listCategory": "thrombectomy",
    "listDescription": "Fast thrombectomy trial using collateral-based CT selection and strict workflow targets.",
    "bottomLineSummary": "ESCAPE showed that rapid thrombectomy in patients with small infarct cores and good collaterals improves functional outcome and reduces mortality within a 12-hour window. Both effects were large enough to stop the trial early.",
    "doi": "10.1056/NEJMoa1414905"
  },
  "extend-ia-tnk-trial": {
    "title": "EXTEND-IA TNK Trial",
    "legend": {
      "finding": "TNK 0.25 mg/kg achieves more reperfusion before EVT than alteplase 0.9 mg/kg in LVO patients within 4.5h.",
      "bottomLineTag": "Superior",
      "keyStat": "22% vs 10% reperfusion"
    },
    "subtitle": "Tenecteplase versus Alteplase before Thrombectomy for Ischemic Stroke",
    "source": "Campbell BCV et al. (NEJM 2018;378(17):1573-1582)",
    "timeline": "Enrolled March 2015 to October 2017",
    "listCategory": "thrombectomy",
    "listDescription": "First head-to-head TNK vs alteplase in LVO-EVT: substantial reperfusion 22% vs 10%; NI and superiority both met.",
    "bottomLineSummary": "EXTEND-IA TNK was the first randomized trial to compare tenecteplase 0.25 mg/kg with alteplase 0.9 mg/kg as the IV thrombolytic agent before endovascular thrombectomy in patients with large-vessel occlusion within 4.5 hours. The primary endpoint was angiographic substantial reperfusion at initial angiographic assessment, a surrogate chosen because the trial was not powered for functional outcome against the EVT background. TNK achieved the primary in 22% vs 10% with alteplase (absolute difference 12 pp; P=0.002 for noninferiority, P=0.03 for superiority). Ordinal mRS shift at 90 days favored TNK (common OR 1.7, P=0.04); binary mRS 0-2 was directional but not significant. Symptomatic ICH 1% in both arms. The trial established TNK 0.25 mg/kg as the IVT agent of first choice in the LVO-EVT pathway, supports AHA/ASA 2026 §4.6.2 Class I Level A, and seeded the broader TNK lineage confirmed by AcT, TRACE-2, and ORIGINAL.",
    "doi": "10.1056/NEJMoa1716405"
  },
  "extend-ia-trial": {
    "title": "EXTEND-IA Trial",
    "legend": {
      "finding": "Perfusion-selected EVT after tPA raised independence from 40% to 71%.",
      "bottomLineTag": "+31 / 100",
      "keyStat": "NNT ~3 (mRS 0–2)"
    },
    "subtitle": "Perfusion-Selected EVT After Alteplase",
    "source": "Campbell et al. (NEJM 2015)",
    "timeline": "Stopped early for efficacy",
    "listCategory": "thrombectomy",
    "listDescription": "Perfusion-imaging thrombectomy trial showing major reperfusion and functional gains.",
    "bottomLineSummary": "EXTEND-IA established that adding Solitaire thrombectomy to alteplase in patients with perfusion-imaging mismatch dramatically improves reperfusion and early neurological recovery, with a large secondary gain in 90-day functional independence (71% vs 40%). The trial was stopped early after only 70 patients.",
    "doi": "10.1056/NEJMoa1414792"
  },
  "extend-trial": {
    "title": "EXTEND Trial",
    "legend": {
      "finding": "Alteplase 4.5–9 h with perfusion-selected imaging improves recovery.",
      "bottomLineTag": "+6 / 100",
      "keyStat": "NNT 17"
    },
    "subtitle": "tPA for Acute Ischemic Stroke (4.5-9 Hours)",
    "source": "Ma et al. (NEJM 2019)",
    "timeline": "Enrolled 2010-2018",
    "listCategory": "thrombolysis",
    "listDescription": "tPA 4.5–9h and wake-up stroke with perfusion mismatch selection.",
    "bottomLineSummary": "EXTEND showed that alteplase given 4.5 to 9 hours after stroke onset, or within 9 hours of the midpoint of sleep for wake-up stroke, improved excellent outcome at 90 days in patients selected by perfusion mismatch. The benefit was modest and the confidence interval was wide because the trial stopped early.",
    "doi": "10.1056/NEJMoa1813046"
  },
  "hamlet-trial": {
    "title": "HAMLET Trial",
    "legend": {
      "finding": "Hemicraniectomy up to 96 h cuts mortality 38 pp in malignant MCA infarction; no mRS ≤3 benefit.",
      "bottomLineTag": "−38 pp mortality",
      "keyStat": "ARR 38% mortality"
    },
    "subtitle": "Hemicraniectomy for Space-Occupying Hemispheric Infarction",
    "source": "Hofmeijer et al. (Lancet Neurol 2009)",
    "timeline": "Netherlands, 2002-2007",
    "listCategory": "acute",
    "bottomLineSummary": "HAMLET demonstrates mortality benefit from decompressive surgery up to 96 hours after malignant MCA infarction onset (38 percentage point case fatality reduction, P=0.002). The primary functional endpoint was neutral overall. Functional benefit is restricted to the within-48-hour window per pooled analysis.",
    "doi": "10.1016/S1474-4422(09)70047-X"
  },
  "ims-iii-trial": {
    "title": "IMS-III Trial",
    "legend": {
      "finding": "IMS-III stopped early for futility; IV tPA + endovascular therapy did not beat IV tPA alone (pre-modern EVT).",
      "bottomLineTag": "Neutral",
      "keyStat": "RR 1.05"
    },
    "subtitle": "Endovascular Therapy After IV Alteplase for Acute Ischemic Stroke",
    "source": "Broderick et al. (NEJM 2013)",
    "timeline": "Stopped early for futility; 656 of planned 900 enrolled",
    "listCategory": "thrombectomy",
    "listDescription": "First-generation endovascular therapy added to IV tPA: no benefit (mRS 0-2 40.8% vs 38.7%, RR 1.05, 95% CI 0.85-1.30). Stopped early for futility. Historical predecessor; ESCAPE (2015) established modern EVT.",
    "bottomLineSummary": "IMS-III stopped early for futility after enrolling 656 of 900 planned patients. In moderate-severe stroke (NIHSS >=8) treated with IV alteplase within 3 hours, adding endovascular therapy (mostly older coil-based devices, no mandatory vessel-occlusion confirmation) did not improve 90-day mRS 0-2: 40.8% vs 38.7% (adjusted RR 1.05, 95% CI 0.83-1.30). The trial predates modern stent retrievers and CTA-based patient selection.",
    "doi": "10.1056/NEJMoa1214300"
  },
  "inspires-trial": {
    "title": "INSPIRES Trial",
    "legend": {
      "finding": "Late-window DAPT (24–72 h) after atherosclerotic minor stroke/TIA cuts recurrent stroke.",
      "bottomLineTag": "NNT 53",
      "keyStat": "ARR 1.9%"
    },
    "subtitle": "DAPT for Atherosclerotic Minor Stroke or TIA Within 72 Hours",
    "source": "Gao Y, et al. (NEJM 2023)",
    "timeline": "Enrolled 2019–2023; published NEJM 2024",
    "listCategory": "antiplatelets",
    "listDescription": "DAPT for atherosclerotic minor stroke/TIA within 72 hours. NNT=53. AHA 2026 COR 2a.",
    "bottomLineSummary": "INSPIRES extends the DAPT initiation window to 72 hours for atherosclerotic minor stroke/TIA. New stroke at 90 days: 7.3% vs 9.2% (HR 0.79, 95% CI 0.66–0.94, P=0.008; NNT ≈ 53). Bleeding HR 2.08 (NNH ≈ 200). AHA/ASA 2026 §4.8 COR 2a.",
    "doi": "10.1056/NEJMoa2309137"
  },
  "interact4-trial": {
    "title": "INTERACT4 Trial",
    "legend": {
      "finding": "Prehospital BP lowering in undifferentiated stroke helps hemorrhagic and hurts ischemic patients (net null).",
      "bottomLineTag": "Neutral",
      "keyStat": "OR 1.00"
    },
    "subtitle": "Prehospital Blood-Pressure Reduction Before Stroke Type Is Known",
    "source": "INTERACT4 Investigators (NEJM 2024)",
    "timeline": "China; prehospital acute stroke network",
    "bottomLineSummary": "Prehospital IV blood-pressure reduction in undifferentiated acute stroke had no overall effect on 90-day functional outcome (cOR 1.00, 95% CI 0.87-1.15). The critical finding is the divergent subgroup effect: the intervention significantly reduced poor outcomes in hemorrhagic stroke (cOR 0.75, 95% CI 0.60-0.92) but significantly increased poor outcomes in ischemic stroke (cOR 1.30, 95% CI 1.06-1.60). Because nearly half the cohort had hemorrhagic stroke (unusually high for many EMS systems), the net result was null. In populations with a lower hemorrhagic fraction, the same intervention would likely cause net harm.",
    "doi": "10.1056/NEJMoa2314741"
  },
  "ist-trial": {
    "title": "IST",
    "legend": {
      "finding": "Aspirin within 48h of acute ischaemic stroke produces a small but real net benefit; routine heparin shows no net 6-month benefit.",
      "bottomLineTag": "11 / 1000",
      "keyStat": "2p=0.02 at 14 days"
    },
    "subtitle": "International Stroke Trial: Aspirin and/or Subcutaneous Heparin Within 48h of Acute Ischaemic Stroke (Sandercock et al., 1997)",
    "source": "Sandercock PAG et al. (Lancet 1997;349:1569-1581)",
    "timeline": "Enrolled January 1991 to May 1996; 6-month outcome 99.2% complete; 14-day outcome 99.99% complete. Published Lancet 1997 May 31.",
    "listCategory": "antiplatelets",
    "listDescription": "Factorial 2x2 trial (N=19,435; 36 countries) of aspirin 300 mg/d and/or subcutaneous heparin vs avoid, within 48h of acute ischaemic stroke. Aspirin reduced 14-day death or non-fatal recurrent stroke (11.3% vs 12.4%, 2p=0.02); heparin showed no net 6-month benefit and increased haemorrhagic stroke.",
    "bottomLineSummary": "In 19,435 patients within 48h of acute ischaemic stroke, aspirin 300 mg/day reduced 14-day death or non-fatal recurrent stroke (11.3% vs 12.4%, 2p=0.02) and 6-month death or dependence after adjustment for baseline prognosis (2p=0.03; 14 fewer per 1000). Subcutaneous unfractionated heparin showed no net 6-month benefit and increased 14-day haemorrhagic stroke (+8 per 1000). Foundational evidence (with CAST) for the AHA/ASA Class I, Level A early-aspirin recommendation.",
    "doi": "10.1016/S0140-6736(97)04011-7"
  },
  "laste-trial": {
    "title": "LASTE Trial",
    "legend": {
      "finding": "Large-core EVT (ASPECTS ≤5) shifted median mRS from 6 to 4 and cut mortality 55%→36%.",
      "bottomLineTag": "NNT 4 (mRS shift)",
      "keyStat": "gOR 1.63 (1.29–2.06)"
    },
    "subtitle": "Thrombectomy for Large Infarct of Unrestricted Size",
    "source": "Costalat et al. (NEJM 2024)",
    "timeline": "Stopped early after external positive large-core data",
    "listCategory": "thrombectomy",
    "listDescription": "Large-core thrombectomy trial showing better outcomes and lower mortality despite more bleeding.",
    "bottomLineSummary": "LASTE showed that thrombectomy benefits patients with large established infarcts (ASPECTS 5 or lower, with no lower bound) treated within 6.5 hours, shifting median 90-day mRS from 6 to 4 and lowering mortality from 55.5% to 36.1%, at the cost of more symptomatic hemorrhage."
  },
  "match-trial": {
    "title": "MATCH Trial",
    "legend": {
      "finding": "Adding aspirin to clopidogrel after recent stroke/TIA showed no benefit and increased life-threatening bleeding.",
      "bottomLineTag": "Harm signal",
      "keyStat": "RR 0.94"
    },
    "subtitle": "Management of Atherothrombosis with Clopidogrel in High-Risk Patients",
    "source": "Diener et al. (Lancet 2004)",
    "timeline": "7,599 patients enrolled; 18-month follow-up per patient",
    "listCategory": "antiplatelets",
    "listDescription": "Aspirin added to clopidogrel vs clopidogrel alone for 18 months after stroke/TIA: no efficacy benefit (15.7% vs 16.7%, RR 0.94, CI 0.84–1.05, P=0.244) and major bleeding doubled (2.6% vs 1.3%). Preceded POINT (2018).",
    "bottomLineSummary": "MATCH enrolled 7,599 patients with recent stroke/TIA on clopidogrel and randomized them to add aspirin vs continue clopidogrel alone for 18 months. No efficacy benefit: 15.7% vs 16.7% composite endpoint (RR 0.94, CI 0.84–1.05, P=0.244). Major bleeding doubled: 2.6% vs 1.3%. Established that long-duration DAPT after stroke causes net harm. POINT (2018) subsequently showed short-duration DAPT (21 days) is beneficial; duration is the key variable.",
    "doi": "10.1016/S0140-6736(04)16721-4"
  },
  "mistie-iii-trial": {
    "title": "MISTIE III Trial",
    "legend": {
      "finding": "Catheter-based clot lysis for ICH ≥30 mL did not improve mRS 0–3 at 1 year vs standard care.",
      "bottomLineTag": "Neutral",
      "keyStat": "OR 1.20"
    },
    "subtitle": "Minimally Invasive Surgery Plus rt-PA for ICH Evacuation",
    "source": "Hanley et al. (Lancet 2019)",
    "timeline": "506 patients; completed as planned; 1-year follow-up",
    "listDescription": "Image-guided catheter plus alteplase vs conservative management for ICH 30 mL or larger: no primary benefit (mRS 0-3 at 1 year 45% vs 41%, OR 1.20, CI 0.81–1.81, P=0.33). Pre-specified end-of-treatment hematoma ≤15 mL subgroup showed benefit. Preceded ENRICH (2024).",
    "bottomLineSummary": "MISTIE III enrolled 506 patients with ICH 30 mL or larger and tested catheter-based clot lysis vs standard care. Primary negative: mRS 0-3 at 1 year 45% vs 41% (OR 1.20, CI 0.81–1.81, P=0.33). Pre-specified end-of-treatment hematoma ≤15 mL subgroup showed benefit (OR ~1.79, CI 1.03–3.12). Established that greater hematoma reduction correlates with better outcomes. ENRICH (2024) achieved this more reliably with trans-sulcal surgical access.",
    "doi": "10.1016/S0140-6736(19)30195-3"
  },
  "mr-asap-trial": {
    "title": "MR ASAP Trial",
    "legend": {
      "finding": "Prehospital transdermal GTN for undifferentiated stroke shows no functional benefit.",
      "bottomLineTag": "No benefit",
      "keyStat": "OR 0.92"
    },
    "subtitle": "Prehospital Glyceryl Trinitrate Within 3 Hours of Presumed Stroke",
    "source": "van den Berg SA, et al. (Lancet Neurol 2022)",
    "timeline": "Netherlands; April 2018 to February 2021",
    "bottomLineSummary": "In ambulance-treated patients with presumed stroke within 3 hours of onset, prehospital transdermal glyceryl trinitrate did not improve 90-day mRS distribution (cOR 0.97, 95% CI 0.65-1.47 in target population). The trial was stopped after 380 randomizations due to a safety signal in ICH patients: early 7-day mortality was numerically higher with GTN in this subgroup. mRS 0-2 at 90 days was 51% vs 49% in the target population.",
    "doi": "10.1016/S1474-4422(22)00333-7"
  },
  "mr-clean-no-iv-trial": {
    "title": "MR CLEAN-NO IV Trial",
    "legend": {
      "finding": "Direct EVT was neither superior nor noninferior to alteplase + EVT in European direct presenters.",
      "bottomLineTag": "NI not met",
      "keyStat": "cOR 0.84 (0.62–1.15)"
    },
    "subtitle": "Direct EVT in European Alteplase-Eligible Patients",
    "source": "LeCouffe et al. (NEJM 2021)",
    "timeline": "Conducted across Europe",
    "listCategory": "thrombectomy",
    "listDescription": "European direct-EVT trial showing neither superiority nor noninferiority over bridging therapy.",
    "bottomLineSummary": "European trial of direct EVT vs alteplase 0.9 mg/kg plus EVT in direct presenters at EVT centers within 4.5 hours. Adjusted common OR 0.84 (95% CI 0.62-1.15, P = 0.28). Neither superiority nor non-inferiority of direct EVT was demonstrated. Point estimate favors bridging therapy.",
    "doi": "10.1056/NEJMoa2107727"
  },
  "mr-clean-trial": {
    "title": "MR CLEAN Trial",
    "legend": {
      "finding": "First positive EVT trial. Thrombectomy benefit in proximal LVO.",
      "bottomLineTag": "+13 / 100",
      "keyStat": "NNT 7 (mRS 0–2 secondary)"
    },
    "subtitle": "Intra-arterial Treatment for Anterior Circulation LVO",
    "source": "Berkhemer et al. (NEJM 2015)",
    "timeline": "Enrolled at 16 Dutch centers",
    "listCategory": "thrombectomy",
    "listDescription": "First modern positive thrombectomy trial for anterior circulation large-vessel occlusion.",
    "bottomLineSummary": "MR CLEAN was the first modern positive thrombectomy trial. In anterior circulation LVO treated within 6 hours, adding intra-arterial therapy to usual care raised functional independence from 19.1% to 32.6% and shifted the entire mRS distribution toward better outcomes.",
    "doi": "10.1056/NEJMoa1411587"
  },
  "mr-rescue-trial": {
    "title": "MR RESCUE Trial",
    "legend": {
      "finding": "Mechanical embolectomy (MERCI/Penumbra) vs standard care ≤8 h showed no benefit; pre-stent-retriever, no penumbra selection effect.",
      "bottomLineTag": "Neutral",
      "keyStat": "3.9 vs 3.9 mRS"
    },
    "subtitle": "Penumbral Imaging to Select Patients for Mechanical Embolectomy",
    "source": "Kidwell et al. (NEJM 2013)",
    "timeline": "118 patients; planned sample size achieved",
    "listCategory": "thrombectomy",
    "listDescription": "Penumbral imaging-guided mechanical embolectomy: mean mRS 3.9 vs 3.9 in embolectomy vs standard care (NS). Penumbral imaging did not identify benefiting patients. Historical predecessor. ESCAPE (2015) established modern EVT.",
    "bottomLineSummary": "MR RESCUE randomized 118 patients with proximal LVO stroke to mechanical embolectomy (MERCI or Penumbra) or standard care within 8 hours, stratified by penumbral imaging pattern. Mean mRS at 90 days was 3.9 in both arms. Penumbral imaging did not identify a benefiting subgroup (interaction p=0.56). Successful reperfusion was achieved in only 27% of the embolectomy arm, reflecting low first-generation device efficacy. The trial does not establish benefit or harm; its teaching value is illustrating why device generation and imaging selection were insufficient in the first-generation EVT era.",
    "doi": "10.1056/NEJMoa1212793"
  },
  "ninds-trial": {
    "title": "NINDS Trial",
    "legend": {
      "finding": "Alteplase within 3 h improves functional independence (42.6% vs 27.2% mRS 0–1).",
      "bottomLineTag": "+15 / 100",
      "keyStat": "NNT 6.5"
    },
    "subtitle": "IV tPA for Acute Ischemic Stroke (0-3 Hours)",
    "source": "The National Institute of Neurological Disorders and Stroke rt-PA Stroke Study Group (NEJM 1995)",
    "timeline": "Enrolled 1991-1994",
    "listCategory": "thrombolysis",
    "listDescription": "Foundational trial establishing IV tPA within 3 hours; 42.6% vs 27.2% favorable outcome.",
    "bottomLineSummary": "NINDS is the foundational trial for IV alteplase in acute ischemic stroke 0–3 hours from onset. Functional independence (mRS 0–1) at 90 days improved from 27.2% to 42.6% (Part 2 favorable global outcome OR 1.7, 95% CI 1.2–2.6). sICH 6.4% vs 0.6% (P<0.001); 90-day mortality unchanged. AHA/ASA 2026 §4.6.1 COR 1.",
    "doi": "10.1056/NEJM199512143332401"
  },
  "nor-test-2-part-a-trial": {
    "title": "NOR-TEST 2 (Part A)",
    "legend": {
      "finding": "Tenecteplase 0.4 mg/kg in moderate-severe stroke caused 6× more sICH and 3× more deaths vs alteplase.",
      "bottomLineTag": "Harm",
      "keyStat": "OR 0.45 mRS 0–1"
    },
    "subtitle": "Tenecteplase 0.4 mg/kg vs Alteplase in Moderate-Severe Stroke",
    "source": "Kvistad CE, et al. (Lancet Neurol 2022)",
    "timeline": "Norway; October 2019 to September 2021",
    "listCategory": "thrombolysis",
    "listDescription": "Tenecteplase 0.4 mg/kg vs alteplase in moderate-severe stroke; STOPPED FOR HARM; sICH 6x higher, mortality 3x higher.",
    "bottomLineSummary": "NOR-TEST 2 Part A was stopped early for harm after tenecteplase 0.4 mg/kg showed substantially worse outcomes than alteplase in moderate-severe stroke: mRS 0-1 32% vs 51%, sICH 6% vs 1%, and mortality 16% vs 5%. The 0.4 mg/kg dose is contraindicated. This trial does not affect the safety profile of tenecteplase 0.25 mg/kg.",
    "doi": "10.1016/S1474-4422(22)00124-7"
  },
  "nor-test-trial": {
    "title": "NOR-TEST Trial",
    "legend": {
      "finding": "Tenecteplase 0.4 mg/kg in predominantly mild stroke shows no benefit; cohort too mild to detect.",
      "bottomLineTag": "NS",
      "keyStat": "OR 1.08 (NS)"
    },
    "subtitle": "Tenecteplase 0.4 mg/kg vs Alteplase",
    "source": "Logallo N, et al. (Lancet Neurol 2017)",
    "timeline": "Norway; September 2012 to September 2016",
    "listCategory": "thrombolysis",
    "listDescription": "Tenecteplase 0.4 mg/kg vs alteplase; not superior in a predominantly mild-stroke cohort.",
    "bottomLineSummary": "NOR-TEST found tenecteplase 0.4 mg/kg was not superior to alteplase for mRS 0-1 at 3 months in a predominantly mild-stroke cohort (64% vs 63%, OR 1.08, P=0.52). The mild case mix limits interpretability, and the 0.4 mg/kg dose was subsequently shown harmful in moderate-severe stroke in NOR-TEST 2 Part A.",
    "doi": "10.1016/S1474-4422(17)30253-3"
  },
  "optimal-bp-trial": {
    "title": "OPTIMAL-BP Trial",
    "legend": {
      "finding": "STOPPED FOR HARM: SBP <140 after EVT cut independence 15 pp and raised malignant edema 8×.",
      "bottomLineTag": "Harm",
      "keyStat": "aOR 0.56 (0.33–0.96)"
    },
    "subtitle": "Intensive vs Conventional BP Lowering After EVT",
    "source": "Nam et al. (JAMA 2023)",
    "timeline": "19 South Korean stroke centers, 2020-2022",
    "listCategory": "acute",
    "listDescription": "STOPPED FOR SAFETY: intensive SBP <140 mm Hg after EVT reduced functional independence 15 pp and increased malignant edema 8-fold. JAMA 2023.",
    "bottomLineSummary": "OPTIMAL-BP randomized 306 patients to intensive BP management (SBP <140 mm Hg) vs conventional (140-180 mm Hg) for 24 hours after successful EVT at 19 South Korean centers. Stopped early by DSMB for safety: functional independence at 3 months was 39.4% vs 54.4% (P=0.03) and malignant cerebral edema was nearly 8-fold higher in the intensive arm. Do not target SBP below 140 mm Hg after successful thrombectomy.",
    "doi": "10.1001/jama.2023.14590"
  },
  "optimas-trial": {
    "title": "OPTIMAS Trial",
    "legend": {
      "finding": "Early DOAC (≤4 d) noninferior to delayed start after AF-related stroke in the largest trial to date.",
      "bottomLineTag": "NI met",
      "keyStat": "RD 0.000"
    },
    "subtitle": "Optimal Timing of DOACs After AF-Related Ischemic Stroke",
    "source": "Werring et al. (Lancet 2024)",
    "timeline": "100 UK hospitals, 2019-2024",
    "listCategory": "acute",
    "bottomLineSummary": "Largest trial of DOAC timing after AF-related stroke: 3621 patients at 100 UK hospitals. Early DOAC within 4 days was non-inferior to delayed (7-14 days) for the 90-day composite of recurrent stroke, sICH, or systemic embolism. Event rates were identical (3.3% vs 3.3%, risk difference 0.000, P for NI = 0.0003). Superiority not demonstrated. Provides the most robust evidence for early DOAC initiation in AF-related ischemic stroke. Published Lancet 2024."
  },
  "original-trial": {
    "title": "ORIGINAL Trial",
    "legend": {
      "finding": "Tenecteplase 0.25 mg/kg noninferior to alteplase within 4.5 h (mRS 0–1 72.7% vs 70.3%).",
      "bottomLineTag": "NI met",
      "keyStat": "RR 1.03 (0.97–1.09)"
    },
    "subtitle": "Tenecteplase vs Alteplase for Acute Ischemic Stroke (0–4.5 Hours)",
    "source": "Meng X et al. (JAMA 2024)",
    "timeline": "Enrolled July 2021 – July 2023",
    "listCategory": "thrombolysis",
    "listDescription": "Tenecteplase noninferior to alteplase for AIS within 4.5h; 72.7% vs 70.3% mRS 0–1 (JAMA 2024).",
    "bottomLineSummary": "ORIGINAL: TNK 0.25 mg/kg noninferior to alteplase 0.9 mg/kg in 1,465 Chinese patients with AIS within 4.5h. mRS 0–1 at 90 days 72.7% vs 70.3% (RR 1.03, 95% CI 0.97–1.09; NI margin 0.937 met). Identical sICH 1.2% in both arms. AHA/ASA 2026 §4.6.2 COR 1 equivalent alternatives.",
    "doi": "10.1001/jama.2024.14721"
  },
  "patch-trial": {
    "title": "PATCH Trial",
    "legend": {
      "finding": "Platelet transfusion in antiplatelet-associated ICH worsens 3-month outcome; AHA/ASA 2022 Class III Harm.",
      "bottomLineTag": "Harm",
      "keyStat": "aOR 2.05 (1.18-3.56)"
    },
    "subtitle": "Platelet Transfusion in Antiplatelet-Associated Spontaneous ICH",
    "source": "Baharoglu MI, et al. for the PATCH Investigators (Lancet 2016;387:2605-2613)",
    "timeline": "Enrolled February 2009 to October 2015; 3-month mRS follow-up",
    "listCategory": "acute",
    "listDescription": "Open-label RCT showing platelet transfusion INCREASED odds of death or dependence at 3 months in antiplatelet-associated ICH (adjusted common OR 2.05, P=0.0114). Establishes AHA/ASA 2022 Class III: Harm.",
    "bottomLineSummary": "PATCH randomized 190 adults with spontaneous supratentorial ICH on antiplatelet therapy within 6 hours of onset to platelet transfusion plus standard care vs standard care alone. Platelet transfusion increased the adjusted common odds of death or dependence at 3 months by ~2-fold (aOR 2.05, 95% CI 1.18-3.56, P=0.0114). Mortality 24% vs 17%; serious adverse events 42% vs 30%. The trial established AHA/ASA 2022 Class III: Harm against routine platelet transfusion in antiplatelet-associated ICH. Patients with planned neurosurgical evacuation were excluded; bridging platelet transfusion before craniotomy remains an off-trial decision.",
    "doi": "10.1016/S0140-6736(16)30392-0"
  },
  "pc-trial": {
    "title": "PC Trial",
    "legend": {
      "finding": "Second major PFO closure RCT; Amplatzer device did not reduce composite events vs medical therapy. Underpowered; negative primary.",
      "bottomLineTag": "Primary not met",
      "keyStat": "HR 0.63 (0.24–1.62), P=0.34"
    },
    "subtitle": "Percutaneous Closure of PFO with Amplatzer Occluder vs Medical Therapy in Cryptogenic Embolism (Meier et al., 2013)",
    "source": "Meier B et al. (NEJM 2013;368:1083-1091)",
    "timeline": "Enrolled February 2000 to February 2009; mean follow-up 4.1 years (closure) and 4.0 years (medical); published NEJM 2013",
    "listCategory": "antiplatelets",
    "listDescription": "European RCT (N=414, age <60) of Amplatzer PFO Occluder vs medical therapy after cryptogenic stroke, TIA, or peripheral embolism. Primary composite 3.4% vs 5.2% (HR 0.63, P=0.34). Underpowered (only 18 primary events). Negative.",
    "bottomLineSummary": "In 414 patients younger than 60 with PFO and prior ischemic stroke, TIA, or peripheral thromboembolic event of presumed paradoxical embolic origin, percutaneous closure with the Amplatzer PFO Occluder vs medical therapy (antiplatelet or anticoagulation per investigator) over mean ~4 years did not reduce the primary composite of death, nonfatal stroke, TIA, or peripheral embolism (3.4% vs 5.2%, HR 0.63, 95% CI 0.24–1.62, P=0.34). Underpowered: only 18 primary events accrued. Secondary nonfatal stroke 0.5% vs 2.4% (HR 0.20, P=0.14) and TIA 2.5% vs 3.3% (HR 0.71, P=0.56) numerically favored closure.",
    "doi": "10.1056/NEJMoa1211716"
  },
  "point-trial": {
    "title": "POINT Trial",
    "legend": {
      "finding": "DAPT (clopidogrel+aspirin) after minor stroke/TIA cuts ischemic events; major bleeding higher (0.9% vs 0.4%).",
      "bottomLineTag": "NNT 67",
      "keyStat": "ARR 1.5%"
    },
    "subtitle": "DAPT in International Population",
    "source": "Johnston et al. (NEJM 2018)",
    "timeline": "Enrolled 2010-2017",
    "listCategory": "antiplatelets",
    "listDescription": "Dual antiplatelet in TIA and minor stroke (Western population); confirms CHANCE but major hemorrhage higher at 90 days.",
    "bottomLineSummary": "POINT confirmed in an international population that clopidogrel plus aspirin reduces major ischemic events after TIA or minor stroke, but also showed significantly increased major hemorrhage with 90-day dual therapy. Together with CHANCE, it established that the optimal DAPT duration is 21 days rather than 90.",
    "doi": "10.1056/NEJMoa1800410"
  },
  "prisms-trial": {
    "title": "PRISMS Trial",
    "legend": {
      "finding": "Alteplase vs aspirin in minor nondisabling stroke shows no functional benefit and sICH 3.2% vs 0%.",
      "bottomLineTag": "No benefit",
      "keyStat": "RD −1.1%"
    },
    "subtitle": "Alteplase vs Aspirin in Minor Nondisabling Stroke",
    "source": "Khatri P, et al. (JAMA 2018)",
    "timeline": "United States; May 2014 to December 2016",
    "listCategory": "thrombolysis",
    "listDescription": "Alteplase vs aspirin for minor nondisabling stroke; no efficacy benefit with sICH signal; stopped early at 33%.",
    "bottomLineSummary": "PRISMS found no functional benefit of alteplase over aspirin in minor nondisabling stroke (78.2% vs 81.5%, adjusted RD −1.1%, NS) and a 3.2% sICH rate versus 0% for aspirin. The trial was stopped at 33% enrollment and results are inconclusive for the primary endpoint. The sICH signal supports caution about routine thrombolysis for clearly nondisabling deficits.",
    "doi": "10.1001/jama.2018.8496"
  },
  "profess-trial": {
    "title": "PRoFESS Trial",
    "legend": {
      "finding": "Aspirin+ER-dipyridamole and clopidogrel monotherapy are equivalent for long-term secondary stroke prevention.",
      "bottomLineTag": "Equivalent",
      "keyStat": "9.0% vs 8.8%"
    },
    "subtitle": "Aspirin + Extended-Release Dipyridamole vs Clopidogrel for Recurrent Stroke",
    "source": "Sacco RL, Diener HC, Yusuf S, et al. Aspirin and extended-release dipyridamole versus clopidogrel for recurrent stroke. N Engl J Med. 2008;359(12):1238–1251.",
    "timeline": "Enrolled Sep 2003 – Feb 2008; mean follow-up 2.5 years",
    "listCategory": "antiplatelets",
    "listDescription": "ASA + ER-dipyridamole vs clopidogrel monotherapy after stroke. NI margin not met; ICH higher with ASA–ERDP.",
    "bottomLineSummary": "PRoFESS is the head-to-head trial of two long-term monotherapies after non-cardioembolic ischemic stroke. Stroke recurrence rates were similar in both arms (9.0% ASA–ERDP vs 8.8% clopidogrel, HR 1.01, 95% CI 0.92–1.11), but the upper bound of the confidence interval crossed the prespecified noninferiority margin of 1.075, so noninferiority was not formally established. Intracranial hemorrhage was significantly higher with ASA–ERDP (HR 1.42) and discontinuation was higher (29.1% vs 22.6%). PRoFESS does not test short-course DAPT; that scenario is covered by CHANCE and POINT.",
    "doi": "10.1056/NEJMoa0805002"
  },
  "prost-2-trial": {
    "title": "PROST-2 Trial",
    "legend": {
      "finding": "Prourokinase non-inferior to alteplase with lower sICH (0.3% vs 1.3%) and major bleeding (0.5% vs 2.1%).",
      "bottomLineTag": "NI met",
      "keyStat": "RR 1.04"
    },
    "subtitle": "Large Phase 3 Prourokinase vs Alteplase Trial",
    "source": "PROST-2 Investigators (Lancet Neurol 2024)",
    "timeline": "China; January 2023 to March 2024",
    "listCategory": "thrombolysis",
    "listDescription": "Prourokinase vs alteplase (N=1552) within 4.5 hours; non-inferiority with better safety profile confirmed.",
    "bottomLineSummary": "PROST-2 demonstrated non-inferiority of prourokinase to alteplase for excellent 90-day outcome in EVT-ineligible stroke patients (72.0% vs 68.7%, RR 1.04, NI P<0.0001), with significantly lower sICH (0.3% vs 1.3%) and major bleeding (0.5% vs 2.1%). Results confirm and extend PROST, but are currently applicable only in China where prourokinase is approved.",
    "doi": "10.1016/S1474-4422(24)00436-8"
  },
  "prost-trial": {
    "title": "PROST Trial",
    "legend": {
      "finding": "rhPro-UK non-inferior to alteplase with much lower systemic bleeding (25.8% vs 42.2%).",
      "bottomLineTag": "NI met",
      "keyStat": "RD +0.9%"
    },
    "subtitle": "Recombinant Human Prourokinase vs Alteplase",
    "source": "PROST Investigators (JAMA Netw Open 2023)",
    "timeline": "China; May 2018 to May 2020",
    "listCategory": "thrombolysis",
    "listDescription": "Recombinant human prourokinase vs alteplase within 4.5 hours; non-inferiority confirmed with lower systemic bleeding.",
    "bottomLineSummary": "PROST demonstrated non-inferiority of rhPro-UK to alteplase for excellent 90-day outcome in acute ischemic stroke within 4.5 hours (65.2% vs 64.3%, RD +0.89 pp). Systemic bleeding was significantly lower with rhPro-UK (25.8% vs 42.2%). Results confirmed and expanded in PROST-2 (N=1552).",
    "doi": "10.1001/jamanetworkopen.2023.25415"
  },
  "racecat-trial": {
    "title": "RACECAT Trial",
    "legend": {
      "finding": "Bypassing the nearest center to speed thrombectomy did not improve population-level outcomes.",
      "bottomLineTag": "Neutral",
      "keyStat": "OR 1.03"
    },
    "subtitle": "Direct CSC Transport vs Local Stroke Center for Suspected LVO",
    "source": "Pérez de la Ossa N, et al. (JAMA 2022)",
    "timeline": "Catalonia, Spain; March 2017 to June 2020",
    "bottomLineSummary": "In a cluster-randomized nonurban Catalan stroke network, direct transport to a thrombectomy-capable CSC did not improve 90-day mRS distribution in ischemic stroke or TIA compared with nearest local stroke center first (adjusted cOR 1.03, 95% CI 0.82-1.29). More patients in the CSC-direct group underwent thrombectomy (48.8% vs 39.4%) but fewer received IVT (47.5% vs 60.4%). Mortality at 90 days was identical at approximately 27%. The trial was stopped early for futility.",
    "doi": "10.1001/jama.2022.4404"
  },
  "raise-trial": {
    "title": "RAISE Trial",
    "legend": {
      "finding": "Reteplase superior to alteplase for mRS 0–1 at 90 d (79.5% vs 70.4%; P=0.002).",
      "bottomLineTag": "NNT 11",
      "keyStat": "RR 1.13"
    },
    "subtitle": "Reteplase vs Alteplase for Acute Ischemic Stroke",
    "source": "Li S, et al. (NEJM 2024)",
    "timeline": "China; NEJM 2024",
    "listCategory": "thrombolysis",
    "listDescription": "Reteplase double-bolus vs alteplase; superior for mRS 0-1 but higher ICH and adverse event rates.",
    "bottomLineSummary": "RAISE demonstrated reteplase double-bolus was superior to alteplase for mRS 0-1 at 90 days in Chinese stroke patients within 4.5 hours (79.5% vs 70.4%, RR 1.13, P=0.002). Any intracranial hemorrhage was higher with reteplase (7.7% vs 4.9%). RAISE is provocative but requires independent replication before guideline adoption.",
    "doi": "10.1056/NEJMoa2400314"
  },
  "reduce-trial": {
    "title": "REDUCE Trial",
    "legend": {
      "finding": "In cryptogenic stroke 18–59 with PFO and clean antiplatelet comparator, Gore HELEX/Cardioform closure beat antiplatelet alone on clinical stroke.",
      "bottomLineTag": "NNT 28",
      "keyStat": "HR 0.23 (0.09–0.62)"
    },
    "subtitle": "PFO Closure with Gore HELEX/Cardioform vs Antiplatelet Therapy for Cryptogenic Stroke (Søndergaard et al., 2017)",
    "source": "Søndergaard L et al. (NEJM 2017;377:1033-1042)",
    "timeline": "Enrolled December 2008 to February 2015; median follow-up 3.2 years (IQR 2.2–4.8); primary analysis April 24, 2017",
    "listCategory": "antiplatelets",
    "listDescription": "Cryptogenic stroke 18–59y with PFO. Gore HELEX/Cardioform closure + antiplatelet vs antiplatelet alone: clinical stroke 1.4% vs 5.4% (HR 0.23, P=0.002, NNT ~28). AF excess 6.6% vs 0.4%.",
    "bottomLineSummary": "In 664 patients 18–59 with cryptogenic ischemic stroke and PFO, transcatheter closure with Gore HELEX or Cardioform Septal Occluder + antiplatelet vs antiplatelet alone (clean antiplatelet comparator, no anticoagulation) reduced recurrent clinical ischemic stroke over median 3.2-year follow-up: 1.4% vs 5.4% (HR 0.23, 95% CI 0.09–0.62, P=0.002; event rates 0.39 vs 1.71 per 100 patient-years; NNT ~28 over 24 months). Atrial fibrillation/flutter 6.6% vs 0.4% (P<0.001); largely transient periprocedural (83% within 45 days, 59% resolved within 2 weeks).",
    "doi": "10.1056/NEJMoa1707404"
  },
  "rescue-bt-trial": {
    "title": "RESCUE BT Trial",
    "legend": {
      "finding": "Pre-EVT IV tirofiban did not improve outcome and raised sICH 9.7% vs 6.4%.",
      "bottomLineTag": "NS / Harm",
      "keyStat": "cOR 1.08 (0.87–1.34)"
    },
    "subtitle": "Intravenous Tirofiban Before Endovascular Thrombectomy",
    "source": "RESCUE BT Investigators (JAMA 2022)",
    "timeline": "Enrolled 2018-2021",
    "listCategory": "thrombectomy",
    "listDescription": "Adjunct pre-EVT tirofiban trial showing no functional benefit.",
    "bottomLineSummary": "Chinese double-blind placebo-controlled trial of peri-procedural IV tirofiban vs placebo during thrombectomy in LVO stroke within 24 hours. Adjusted common OR 1.08 (95% CI 0.87-1.34, P = 0.51): no functional benefit. Symptomatic ICH significantly higher with tirofiban (9.7% vs 6.4%, P = 0.04). Net harm signal.",
    "doi": "10.1001/jama.2022.12584"
  },
  "rescue-japan-limit-trial": {
    "title": "RESCUE-Japan LIMIT Trial",
    "legend": {
      "finding": "EVT for ASPECTS 3-5 LVO improves 90-day mRS 0-3 (31% vs 13%).",
      "bottomLineTag": "NNT 5",
      "keyStat": "RR 2.43 (1.35-4.37)"
    },
    "subtitle": "Endovascular Therapy for Acute Stroke with a Large Ischemic Region",
    "source": "Yoshimura S et al. (NEJM 2022;386:1303-1313)",
    "timeline": "Enrolled November 2018 to September 2021",
    "listCategory": "thrombectomy",
    "listDescription": "First positive large-core EVT trial: ASPECTS 3-5; mRS 0-3 31% vs 13%; NNT 5.",
    "bottomLineSummary": "RESCUE-Japan LIMIT was the first randomized trial to show EVT benefit in large-core stroke (ASPECTS 3-5). Among 203 Japanese patients with ICA or M1 occlusion within 24 hours of LKW, EVT increased mRS 0-3 at 90 days from 12.7% to 31.0% (RR 2.43, 95% CI 1.35-4.37, P=0.002, NNT 5). The any-ICH rate nearly doubled (58.0% vs 31.4%, P<0.001) but symptomatic ICH and 90-day mortality were not significantly different. The trial opened the large-core EVT question that SELECT2, ANGEL-ASPECT, TENSION, and LASTE confirmed. AHA/ASA 2026 §4.7.2 supports Class I large-core EVT based in part on this index trial.",
    "doi": "10.1056/NEJMoa2118191"
  },
  "respect-original-trial": {
    "title": "RESPECT (Original 2013)",
    "legend": {
      "finding": "Original 2013 RESPECT primary publication; ITT primary NOT met at median 2.1y (HR 0.49, P=0.08 borderline). The 2017 extended follow-up later converted the result.",
      "bottomLineTag": "ITT P=0.08",
      "keyStat": "HR 0.49 (0.22–1.11)"
    },
    "subtitle": "Original Primary Publication: PFO Closure with Amplatzer Occluder vs Medical Therapy after Cryptogenic Stroke (Carroll et al., 2013)",
    "source": "Carroll JD et al. (NEJM 2013;368:1092-1100)",
    "timeline": "Enrolled August 2003 to December 2011; original primary analysis published NEJM 2013;368:1092 at median 2.1y",
    "listCategory": "antiplatelets",
    "listDescription": "Original 2013 RESPECT primary publication (DISTINCT from the 2017 long-term extension). N=980, ages 18–60, cryptogenic stroke + PFO. At median 2.1y: ITT primary NOT met (HR 0.49, P=0.08 borderline); per-protocol HR 0.37 (P=0.03), as-treated HR 0.27 (P=0.007). The 2017 extended follow-up (saver-respect-2017) converted the result.",
    "bottomLineSummary": "In 980 patients ages 18–60 with cryptogenic ischemic stroke and TEE-confirmed PFO, transcatheter closure with the Amplatzer PFO Occluder vs medical therapy at median 2.1-year follow-up did NOT meet its primary intention-to-treat endpoint: 9 vs 16 recurrent ischemic stroke or early death events, HR 0.49 (95% CI 0.22–1.11), P=0.08 (borderline). Per-protocol HR 0.37 (95% CI 0.14–0.96, P=0.03); as-treated HR 0.27 (95% CI 0.10–0.75, P=0.007). The 2017 extended follow-up at median 5.9y (Saver JL et al., NEJM 2017;377:1022; catalog entry respect-trial) converted the result (HR 0.55, P=0.046) and supported FDA approval of the device.",
    "doi": "10.1056/NEJMoa1301440"
  },
  "respect-trial": {
    "title": "RESPECT (Long-Term)",
    "legend": {
      "finding": "In cryptogenic stroke 18–60 with PFO, Amplatzer Occluder beat medical therapy on recurrent stroke over a median 5.9-year follow-up.",
      "bottomLineTag": "NNT 42",
      "keyStat": "HR 0.55 (0.31–0.999)"
    },
    "subtitle": "Extended Follow-up of PFO Closure with the Amplatzer Occluder for Cryptogenic Stroke (Saver et al., 2017)",
    "source": "Saver JL et al. (NEJM 2017;377:1022-1032)",
    "timeline": "Enrolled August 2003 to December 2011; original primary analysis reported 2013 at median 2.1y; extended follow-up database lock May 31, 2016, median 5.9y",
    "listCategory": "antiplatelets",
    "listDescription": "Cryptogenic stroke 18–60y with PFO. 5.9-year follow-up of Amplatzer Occluder vs medical therapy: recurrent ischemic stroke 3.6% vs 5.8% (HR 0.55, P=0.046, NNT 42). VTE excess.",
    "bottomLineSummary": "In 980 patients 18–60 with cryptogenic stroke and PFO, transcatheter closure with the Amplatzer PFO Occluder vs medical therapy reduced recurrent ischemic stroke over a median 5.9-year follow-up: 3.6% vs 5.8% (event rates 0.58 vs 1.07 per 100 patient-years, HR 0.55, 95% CI 0.31–0.999, P=0.046; NNT 42). Effect strongest in undetermined-cause (HR 0.38) and cryptogenic-only (HR 0.08) recurrent strokes. Venous thromboembolism higher in closure arm (PE HR 3.48, P=0.04), likely reflecting differential anticoagulation exposure.",
    "doi": "10.1056/NEJMoa1610057"
  },
  "revascat-trial": {
    "title": "REVASCAT Trial",
    "legend": {
      "finding": "Solitaire EVT ≤8 h raised independence from 28% to 44% in anterior LVO.",
      "bottomLineTag": "+16 / 100",
      "keyStat": "cOR 1.7 (1.05–2.8)"
    },
    "subtitle": "Solitaire Thrombectomy Within 8 Hours",
    "source": "Jovin et al. (NEJM 2015)",
    "timeline": "Conducted at 4 centers in Catalonia, Spain",
    "listCategory": "thrombectomy",
    "listDescription": "Spanish registry-embedded RCT confirming Solitaire thrombectomy benefit within 8 hours.",
    "bottomLineSummary": "REVASCAT showed that Solitaire stent-retriever thrombectomy improved 90-day functional outcome in anterior circulation LVO treated within 8 hours, including in patients ineligible for or refractory to IV alteplase. The mRS distribution shifted toward better outcomes despite no mortality reduction.",
    "doi": "10.1056/NEJMoa1503780"
  },
  "right-2-trial": {
    "title": "RIGHT-2 Trial",
    "legend": {
      "finding": "Ultra-acute transdermal GTN for presumed stroke shows no benefit and a harm signal in ICH.",
      "bottomLineTag": "No benefit",
      "keyStat": "OR 1.25"
    },
    "subtitle": "Ultra-Acute Prehospital Glyceryl Trinitrate in Presumed Stroke",
    "source": "RIGHT-2 Investigators (Lancet 2019)",
    "timeline": "United Kingdom; October 2015 to May 2018",
    "bottomLineSummary": "In the RIGHT-2 trial, transdermal glyceryl trinitrate started by paramedics within 4 hours of presumed stroke did not improve 90-day mRS distribution in patients with confirmed stroke or TIA (cohort 1, N=852; adjusted common OR for poor outcome 1.25, 95% CI 0.97 to 1.60, p=0.083). The full ITT result was similarly null (cohort 2, N=1149; OR 1.04, 95% CI 0.84 to 1.29, p=0.69). Safety signals including symptomatic hypotension and larger hematoma with GTN in ICH patients reinforce the case against prehospital nitrates before imaging.",
    "doi": "10.1016/S0140-6736(19)30194-1"
  },
  "sammpris-trial": {
    "title": "SAMMPRIS Trial",
    "legend": {
      "finding": "Wingspan stenting as initial therapy for symptomatic ICAS 70–99% causes harm vs aggressive medical therapy.",
      "bottomLineTag": "Harm",
      "keyStat": "14.7% vs 5.8% 30-d"
    },
    "subtitle": "ICAD Stenting vs Medical",
    "source": "Chimowitz et al. (NEJM 2011;365(11):993–1003)",
    "timeline": "Enrolled 2008-2011 (stopped early)",
    "listCategory": "carotid",
    "listDescription": "Intracranial Wingspan stenting vs aggressive medical therapy for symptomatic 70–99% ICAS; medical management wins.",
    "bottomLineSummary": "SAMMPRIS halted early for harm: 30-day stroke/death 14.7% (PTAS+AMM) vs 5.8% (AMM alone), P=0.002. 1-year: 20.0% vs 12.2% (P=0.009). Periprocedural events drove the harm (25 of 33 PTAS strokes within 24h). sICH 4.5% vs 0%. AHA/ASA 2021 Class III for Wingspan as initial therapy; Class I for AMM. Does NOT apply to asymptomatic ICAS or post-AMM-failure salvage.",
    "doi": "10.1056/NEJMoa1105335"
  },
  "sarode-2013-trial": {
    "title": "Sarode 2013",
    "legend": {
      "finding": "4F-PCC noninferior to FFP on hemostasis, superior on rapid INR reduction; FDA approval of Kcentra.",
      "bottomLineTag": "Non-inferior",
      "keyStat": "+7.1 pp (-5.8 to +19.9)"
    },
    "subtitle": "4-Factor PCC vs FFP for VKA Reversal in Major Bleeding",
    "source": "Sarode R, Milling TJ Jr, Refaai MA, et al. (Circulation 2013;128:1234-1243)",
    "timeline": "Enrolled 2008 to 2012; assessment at 24 hours and through day 45",
    "listCategory": "acute",
    "listDescription": "Phase IIIb open-label RCT in 202 VKA-treated adults with major bleeding. 4F-PCC noninferior to FFP for hemostatic efficacy (+7.1 pp, 95% CI -5.8 to +19.9) and superior for INR target time (+52.6 pp, 95% CI 39.4-65.9). FDA approval of Kcentra.",
    "bottomLineSummary": "Sarode 2013 was the phase IIIb open-label noninferiority RCT that established 4-factor PCC (Kcentra/Beriplex P/N) as noninferior to fresh frozen plasma for hemostatic efficacy at 24 h AND superior for rapid INR reduction in 202 VKA-treated adults with acute major bleeding. Hemostatic efficacy 72.4% vs 65.4% (+7.1 pp, 95% CI -5.8 to +19.9; NI margin -10 pp). INR ≤1.3 at 30 min: 62.2% vs 9.6% (+52.6 pp, 95% CI 39.4-65.9). Mortality and thromboembolic events comparable; fluid overload less with 4F-PCC (2.9% vs 11.9%); median infusion volume 99 mL vs 814 mL. Population was general major bleeding (GI, intracranial, visible). Underwrote FDA approval of Kcentra (April 2013) and AHA/ASA 2022 Class I, Level A for 4F-PCC > FFP in VKA-associated ICH. ICH-specific confirmation: INCH 2016 (Steiner Lancet Neurol).",
    "doi": "10.1161/CIRCULATIONAHA.113.002283"
  },
  "select2-trial": {
    "title": "SELECT2 Trial",
    "legend": {
      "finding": "EVT for anterior LVO with large ischemic core (ASPECTS 3–5 or core ≥50 mL) within 24 h shifts mRS toward less disability.",
      "bottomLineTag": "+13 pp mRS 0–2",
      "keyStat": "gOR 1.51"
    },
    "subtitle": "Large Core Thrombectomy",
    "source": "Sarraj et al. (NEJM 2023;388(14):1259–1271)",
    "timeline": "Enrolled 2019-2022",
    "listCategory": "thrombectomy",
    "listDescription": "Large core thrombectomy (ASPECTS 3–5, 0–6h and extended window).",
    "bottomLineSummary": "SELECT2 establishes EVT for large-core anterior LVO within 24h. Primary ordinal mRS shift: gOR 1.51 (95% CI 1.20–1.89, P<0.001). Secondary mRS 0–2: 20% vs 7% (NNT 7.7 from secondary). sICH 0.6% vs 1.1% (NS). Stopped early at 2nd interim. AHA/ASA 2026 §4.7.2 COR 1.",
    "doi": "10.1056/NEJMoa2214403"
  },
  "skip-trial": {
    "title": "SKIP Trial",
    "legend": {
      "finding": "Direct EVT vs low-dose alteplase + EVT: noninferiority not met; inconclusive.",
      "bottomLineTag": "NI not met",
      "keyStat": "OR 1.09 (0.72–1.64)"
    },
    "subtitle": "Mechanical Thrombectomy Without vs With IV Thrombolysis",
    "source": "Suzuki et al. (JAMA 2021)",
    "timeline": "Enrolled 2017-2019 across 23 networks",
    "listCategory": "thrombectomy",
    "listDescription": "Japanese direct-EVT study that was inconclusive for noninferiority.",
    "bottomLineSummary": "Japanese non-inferiority trial of thrombectomy alone vs low-dose alteplase plus thrombectomy in LVO stroke within 4.5 hours. mRS 0-2 was numerically similar (59.4% vs 57.3%) but non-inferiority was not met (OR 1.09, 95% CI 0.72-1.64, lower bound below 0.75 margin). Lower any-ICH with direct EVT.",
    "doi": "10.1001/jama.2020.23522"
  },
  "socrates-trial": {
    "title": "SOCRATES Trial",
    "legend": {
      "finding": "Ticagrelor monotherapy did not beat aspirin for stroke/MI/death after minor stroke/TIA (P=0.07).",
      "bottomLineTag": "NS",
      "keyStat": "ARR 0.8% (NS)"
    },
    "subtitle": "Ticagrelor vs Aspirin",
    "source": "Johnston et al. (NEJM 2016)",
    "timeline": "Enrolled 2014-2015",
    "listCategory": "antiplatelets",
    "listDescription": "Ticagrelor vs aspirin monotherapy in acute ischemic stroke; not superior.",
    "bottomLineSummary": "In acute non-cardioembolic minor ischemic stroke or high-risk TIA, ticagrelor monotherapy was not superior to aspirin monotherapy for the 90-day composite of stroke, MI, or death (HR 0.89, 95% CI 0.78 to 1.01, P=0.07). Major bleeding was similar between arms. The result supports aspirin as the appropriate monotherapy comparator and does not justify substituting ticagrelor for aspirin outside of a DAPT regimen."
  },
  "sparcl-trial": {
    "title": "SPARCL Trial",
    "legend": {
      "finding": "Atorvastatin 80 mg after non-cardioembolic stroke/TIA reduces recurrent stroke; hemorrhagic-stroke signal HR 1.66.",
      "bottomLineTag": "NNT 53",
      "keyStat": "ARR 1.9%"
    },
    "subtitle": "Statins in Stroke",
    "source": "Amarenco et al. (NEJM 2006)",
    "timeline": "Enrolled 2001-2005",
    "listCategory": "antiplatelets",
    "listDescription": "High-intensity statin (atorvastatin 80mg) for secondary stroke prevention; NNT=53.",
    "bottomLineSummary": "In patients with recent ischemic stroke or TIA and LDL 100 to 190 mg/dL without known coronary heart disease, atorvastatin 80 mg reduced recurrent stroke by 16% relative (NNT=53 over 4.9 years) but significantly increased hemorrhagic stroke risk (HR 1.66, 2.3% vs 1.4%). High-intensity statin therapy is now standard secondary prevention for ischemic stroke; caution is warranted in patients with prior hemorrhagic stroke."
  },
  "sps3-trial": {
    "title": "SPS3 Trial",
    "legend": {
      "finding": "Long-term DAPT (clopidogrel+aspirin) in lacunar stroke increases mortality and bleeding with no stroke reduction.",
      "bottomLineTag": "Harm",
      "keyStat": "No benefit; ↑bleed"
    },
    "subtitle": "DAPT in Lacunar Stroke",
    "source": "SPS3 Investigators (NEJM 2012)",
    "timeline": "Enrolled 2003-2011 (stopped early)",
    "listCategory": "antiplatelets",
    "listDescription": "DAPT not beneficial in lacunar stroke; increased bleeding without stroke reduction.",
    "bottomLineSummary": "In patients with MRI-confirmed symptomatic lacunar infarction, long-term DAPT (aspirin 325 mg plus clopidogrel 75 mg) was stopped early because DAPT did not reduce recurrent stroke (HR 0.92, P=0.48) and significantly increased all-cause mortality (HR 1.52, P=0.004) and major bleeding. Aspirin monotherapy remains the standard of long-term secondary prevention in established lacunar stroke. Short-duration DAPT immediately following TIA or minor stroke is a separate evidence base and is not contraindicated by SPS3."
  },
  "stich-i-trial": {
    "title": "STICH I Trial",
    "legend": {
      "finding": "Early surgery vs conservative care for supratentorial ICH showed no overall functional benefit.",
      "bottomLineTag": "Neutral",
      "keyStat": "OR 0.89"
    },
    "subtitle": "Surgical Treatment of Intracerebral Hemorrhage",
    "source": "Mendelow et al. (Lancet 2005)",
    "timeline": "1,033 patients enrolled; 27 countries; 6-month follow-up",
    "listDescription": "Early surgery vs initial conservative management for supratentorial ICH: no benefit (favorable GOS 26% vs 24%, OR 0.89, CI 0.66–1.19, P=0.414). Post-hoc lobar subgroup signal led to STICH II. Preceded ENRICH (2024).",
    "bottomLineSummary": "STICH I enrolled 1,033 patients with supratentorial ICH from 27 countries. Early surgery showed no significant benefit: favorable GOS at 6 months 26% vs 24% (OR 0.89, CI 0.66–1.19, P=0.414). The equipoise requirement and predominant use of open craniotomy limited the detectable benefit. Post-hoc lobar subgroup signal led to STICH II. ENRICH (2024) later showed benefit with minimally invasive trans-sulcal surgery in selected lobar ICH.",
    "doi": "10.1016/S0140-6736(05)17826-X"
  },
  "stich-ii-trial": {
    "title": "STICH II Trial",
    "legend": {
      "finding": "Early surgery in superficial lobar ICH (no IVH) did not significantly improve outcomes.",
      "bottomLineTag": "Neutral",
      "keyStat": "OR 0.86"
    },
    "subtitle": "Surgical Treatment of Intracerebral Hemorrhage II: Superficial Lobar ICH",
    "source": "Mendelow et al. (Lancet 2013)",
    "timeline": "601 patients enrolled; full enrollment target achieved",
    "listDescription": "Early surgery vs conservative management for superficial lobar ICH (10–100 mL, within 1 cm of cortex): no significant benefit (unfavorable outcome 59% surgery vs 62% conservative, OR 0.86, CI 0.62–1.20, P=0.367). STICH I lobar subgroup signal not confirmed. Preceded ENRICH (2024).",
    "bottomLineSummary": "STICH II enrolled 601 patients with superficial lobar ICH to test the STICH I lobar subgroup signal. Primary (unfavorable outcome at 6 months): 59% surgery vs 62% conservative (OR 0.86, CI 0.62–1.20, P=0.367). Not significant. The STICH I hypothesis was not confirmed. ENRICH (2024) subsequently demonstrated benefit using minimally invasive trans-sulcal surgery, suggesting technique was the critical variable.",
    "doi": "10.1016/S0140-6736(13)60986-1"
  },
  "swift-direct-trial": {
    "title": "SWIFT DIRECT Trial",
    "legend": {
      "finding": "EVT alone failed NI vs bridging; entire CI favored alteplase + EVT.",
      "bottomLineTag": "NI not met",
      "keyStat": "−7.3% (−14.0 to −0.6)"
    },
    "subtitle": "Thrombectomy Alone vs Alteplase Plus Thrombectomy",
    "source": "Fischer et al. (Lancet 2022)",
    "timeline": "Enrolled 2017-2021",
    "listCategory": "thrombectomy",
    "listDescription": "Western direct-EVT trial that missed noninferiority and had lower reperfusion without alteplase.",
    "bottomLineSummary": "European and Canadian non-inferiority trial of stent-retriever thrombectomy alone vs alteplase 0.9 mg/kg plus thrombectomy in anterior-circulation LVO within 4.5 hours. mRS 0-2: 57.0% vs 65.0%; adjusted RD -7.3% (95% CI -14.0% to -0.6%). Non-inferiority not met; the entire CI favors bridging. TICI 2b-3 reperfusion was significantly lower without alteplase.",
    "doi": "10.1016/S0140-6736(22)00537-2"
  },
  "swift-prime-trial": {
    "title": "SWIFT PRIME Trial",
    "legend": {
      "finding": "Solitaire EVT after IV tPA raised independence from 35% to 60% in anterior LVO ≤6 h.",
      "bottomLineTag": "+25 / 100",
      "keyStat": "cOR 2.75 (1.53–4.95)"
    },
    "subtitle": "Stent-Retriever EVT Plus IV tPA vs IV tPA Alone",
    "source": "Saver et al. (NEJM 2015)",
    "timeline": "Stopped early for efficacy after 196 patients",
    "listCategory": "thrombectomy",
    "listDescription": "Solitaire thrombectomy trial showing large gains over IV tPA alone.",
    "bottomLineSummary": "SWIFT PRIME showed that adding Solitaire stent-retriever thrombectomy to IV alteplase in anterior circulation LVO patients within 6 hours of onset shifted the entire mRS distribution toward better outcomes and raised functional independence from 35% to 60%. The trial was stopped early for efficacy.",
    "doi": "10.1056/NEJMoa1415061"
  },
  "synthesis-expansion-trial": {
    "title": "SYNTHESIS Expansion Trial",
    "legend": {
      "finding": "Endovascular therapy alone (no IV tPA, ≤6 h) did not improve mRS 0–1 vs IV tPA (pre-stent-retriever era).",
      "bottomLineTag": "Neutral",
      "keyStat": "OR 0.71"
    },
    "subtitle": "Endovascular Therapy Alone Versus IV Alteplase for Acute Ischemic Stroke",
    "source": "Ciccone et al. (NEJM 2013)",
    "timeline": "362 patients enrolled; planned sample size achieved",
    "listCategory": "thrombectomy",
    "listDescription": "Endovascular therapy alone (no IV tPA first) vs IV alteplase: no superiority (mRS 0-1 30.4% vs 34.8%, OR 0.71, 95% CI 0.44-1.14, p=0.16). Historical predecessor; ESCAPE (2015) established modern EVT.",
    "bottomLineSummary": "SYNTHESIS Expansion randomized 362 patients with ischemic stroke to endovascular therapy alone (no IV tPA, window up to 6 hours) or standard IV alteplase within 4.5 hours. Disability-free survival (mRS 0-1) at 90 days: 30.4% endovascular vs 34.8% alteplase (adjusted OR 0.71, 95% CI 0.44-1.14, p=0.16). Endovascular therapy did not demonstrate superiority. The trial used older devices and did not require confirmed vessel occlusion.",
    "doi": "10.1056/NEJMoa1213701"
  },
  "taste-trial": {
    "title": "TASTE Trial",
    "legend": {
      "finding": "Tenecteplase in perfusion-selected early-window stroke met per-protocol NI; ITT borderline.",
      "bottomLineTag": "NI (PP)",
      "keyStat": "RD +3%"
    },
    "subtitle": "Tenecteplase vs Alteplase with Perfusion-Imaging Selection",
    "source": "TASTE Investigators (Lancet Neurol 2024)",
    "timeline": "Eight countries; March 2014 to October 2023",
    "listCategory": "thrombolysis",
    "listDescription": "Tenecteplase vs alteplase in perfusion-selected early-window stroke; NI met in per-protocol analysis only.",
    "bottomLineSummary": "TASTE demonstrated non-inferiority of tenecteplase 0.25 mg/kg to alteplase in the per-protocol analysis (57% vs 55% mRS 0-1, SRD 0.05, NI p=0.01) in perfusion-selected early-window stroke, but the ITT result was borderline. Stopped early at 680 of 832 patients. Adds to the tenecteplase evidence base without changing current practice.",
    "doi": "10.1016/S1474-4422(24)00206-0"
  },
  "tension-trial": {
    "title": "TENSION Trial",
    "legend": {
      "finding": "Large-core EVT (ASPECTS 3–5) by NCCT shifted median mRS 5→4; mortality 51%→40%.",
      "bottomLineTag": "Superior",
      "keyStat": "cOR 2.58 (1.60–4.15)"
    },
    "subtitle": "EVT for Large-Core Stroke Selected Mainly by Non-Contrast CT",
    "source": "Bendszus et al. (Lancet 2023)",
    "timeline": "Enrolled 2018-2023; stopped early for efficacy",
    "listCategory": "thrombectomy",
    "listDescription": "Large-core EVT trial using pragmatic non-contrast CT selection rather than perfusion imaging.",
    "bottomLineSummary": "TENSION showed that endovascular thrombectomy benefits anterior circulation LVO patients with large established infarcts (ASPECTS 3 to 5) selected mainly by non-contrast CT and treated within 12 hours, shifting median 90-day mRS from 5 to 4 and lowering mortality from 51% to 40% with no increase in symptomatic hemorrhage."
  },
  "thales-trial": {
    "title": "THALES Trial",
    "legend": {
      "finding": "Ticagrelor+aspirin × 30 d cuts stroke/death after minor stroke/TIA but increases severe bleeding 5×.",
      "bottomLineTag": "NNT 91",
      "keyStat": "ARR 1.1%"
    },
    "subtitle": "Ticagrelor + Aspirin vs Aspirin Alone After Minor Stroke or TIA",
    "source": "Johnston SC, et al. (NEJM 2020)",
    "timeline": "Enrolled 2018–2019; published NEJM 2020",
    "listCategory": "antiplatelets",
    "listDescription": "Ticagrelor + aspirin vs aspirin alone; AHA 2026 COR 3: No Benefit. NNT=91, bleeding 5× higher.",
    "bottomLineSummary": "Ticagrelor plus aspirin for 30 days statistically reduced composite stroke or death versus aspirin alone after minor stroke or TIA (HR 0.83, P=0.02, NNT=91), but severe hemorrhage was 5x higher (0.5% vs 0.1%). AHA/ASA 2026 guidelines rate ticagrelor DAPT COR 3: No Benefit for the general population given unfavorable risk-benefit versus clopidogrel-based DAPT. Clopidogrel plus aspirin remains the preferred DAPT regimen; ticagrelor is considered only in confirmed CYP2C19 poor metabolizers (COR 2b).",
    "doi": "10.1056/NEJMoa1916870"
  },
  "thaws-trial": {
    "title": "THAWS Trial",
    "legend": {
      "finding": "Japan-specific 0.6 mg/kg alteplase for DWI-FLAIR mismatch wake-up stroke showed no benefit; underpowered.",
      "bottomLineTag": "Neutral",
      "keyStat": "−1.2% mRS 0–1"
    },
    "subtitle": "Low-Dose Alteplase for Unknown-Onset Ischemic Stroke",
    "source": "Koga et al. (Stroke 2020)",
    "timeline": "Stopped early at 131 of planned 300 patients",
    "listCategory": "thrombolysis",
    "listDescription": "Low-dose alteplase 0.6 mg/kg for MRI-selected unknown-onset stroke; stopped early after WAKE-UP, inconclusive.",
    "bottomLineSummary": "THAWS found no benefit of low-dose alteplase 0.6 mg/kg vs standard medical treatment in DWI-FLAIR mismatch wake-up stroke (47.1% vs 48.3%, P=0.892), but was stopped at 44% of planned enrollment after WAKE-UP demonstrated efficacy of 0.9 mg/kg. Results are inconclusive due to severe underpowering. The 0.6 mg/kg dose is specific to Japanese practice guidelines.",
    "doi": "10.1161/STROKEAHA.119.028127"
  },
  "theia-trial": {
    "title": "THEIA Trial",
    "legend": {
      "finding": "First phase 3 RCT of IV alteplase vs aspirin for CRAO within 4.5h; directional but underpowered; safety reassuring.",
      "bottomLineTag": "No benefit",
      "keyStat": "66% vs 48%, p=0.95"
    },
    "subtitle": "IV Alteplase vs Oral Aspirin for Acute Non-Arteritic CRAO within 4.5 Hours",
    "source": "Préterre et al. (Lancet Neurology 2025)",
    "timeline": "Enrolled 8 June 2018 – 2 October 2023; published Lancet Neurology November 2025.",
    "listCategory": "thrombolysis",
    "listDescription": "First phase 3 RCT of IV alteplase for CRAO within 4.5h. Neutral on visual acuity vs aspirin; underpowered (N=70); safety reassuring.",
    "bottomLineSummary": "THEIA enrolled 70 patients with acute non-arteritic CRAO (Snellen <20/400) within 4.5h across 16 French stroke units and randomised them to IV alteplase 0.9 mg/kg or 300 mg oral aspirin. Visual acuity improvement of at least 0.3 LogMAR at 1 month occurred in 19/29 (66%) alteplase vs 13/27 (48%) aspirin patients; adjusted OR 1.10 (95% CI 0.07–18.39), p=0.95. The trial was explicitly underpowered (sized for a 30 pp difference; observed difference 17 pp). Safety was reassuring: 0 symptomatic ICH, 0 major bleeding related to study treatment, 1 asymptomatic incidental haematoma in the alteplase arm. Functional reading vision (Snellen 20/63) was achieved in only 14% alteplase and 7% aspirin patients, consistent with the hypothesis that retinal ischaemic tolerance may be much shorter than 4.5h. Authors call for an individual-patient-data meta-analysis combining THEIA + TenCRAOS (NCT04526951) + REVISION (NCT04965038) to produce level 1 evidence.",
    "doi": "10.1016/S1474-4422(25)00308-4"
  },
  "thrace-trial": {
    "title": "THRACE Trial",
    "legend": {
      "finding": "Bridging EVT after IV tPA raised independence from 42% to 53% in proximal LVO ≤5 h.",
      "bottomLineTag": "NNT 9",
      "keyStat": "OR 1.55 (1.05–2.30)"
    },
    "subtitle": "Bridging Thrombectomy After Alteplase",
    "source": "Bracard et al. (Lancet Neurol 2016)",
    "timeline": "Enrolled 2010-2015",
    "listCategory": "thrombectomy",
    "listDescription": "French bridging-therapy trial showing benefit from adding thrombectomy to alteplase.",
    "bottomLineSummary": "THRACE showed that adding mechanical thrombectomy to IV alteplase in proximal anterior circulation LVO patients treated within 5 hours raised functional independence from 42% to 53% at 3 months, without increasing mortality or symptomatic hemorrhage."
  },
  "timeless-trial": {
    "title": "TIMELESS Trial",
    "legend": {
      "finding": "IV tenecteplase 4.5–24 h with perfusion mismatch did not improve mRS shift; not a verdict against late IVT broadly.",
      "bottomLineTag": "Neutral",
      "keyStat": "OR 1.13"
    },
    "subtitle": "Tenecteplase 4.5-24 Hours with Perfusion-Imaging Selection",
    "source": "Albers GW, et al. (NEJM 2024)",
    "timeline": "NEJM 2024",
    "bottomLineSummary": "In perfusion-selected LVO patients treated 4.5-24 hours after stroke onset, tenecteplase 0.25 mg/kg before planned thrombectomy (77% of patients) did not improve 90-day mRS distribution (adjusted cOR 1.13, 95% CI 0.82-1.57, p=0.45). Functional independence occurred in 46.0% vs 42.4%. Symptomatic ICH was 2.0% vs 2.2%. TIMELESS and TRACE-III together define the role of late-window IVT: benefit only when EVT is unavailable.",
    "doi": "10.1056/NEJMoa2310392"
  },
  "timing-trial": {
    "title": "TIMING Trial",
    "legend": {
      "finding": "Early DOAC (≤4 d) after AF-related ischemic stroke noninferior to delayed start.",
      "bottomLineTag": "NI met",
      "keyStat": "RD −1.79%"
    },
    "subtitle": "Early vs Delayed NOAC Initiation After AF-Related Ischemic Stroke",
    "source": "Oldgren et al. (Circulation 2022)",
    "timeline": "Swedish Stroke Register, 2017-2020",
    "listCategory": "acute",
    "bottomLineSummary": "Registry-based randomized noninferiority trial of 888 patients with AF-related stroke. Early NOAC within 4 days was non-inferior to delayed (5-10 days) for the 90-day composite of recurrent stroke, sICH, or death (6.89% vs 8.68%, risk difference -1.79 pp, P for NI = 0.004). Zero sICH in either arm. Noninferiority met; superiority not tested. Published Circulation 2022."
  },
  "trace-2-trial": {
    "title": "TRACE-2 Trial",
    "legend": {
      "finding": "Tenecteplase 0.25 mg/kg non-inferior to alteplase in EVT-ineligible standard-window stroke (sICH 2% both arms).",
      "bottomLineTag": "NI met",
      "keyStat": "RR 1.07"
    },
    "subtitle": "Tenecteplase vs Alteplase in EVT-Ineligible Stroke",
    "source": "Wang Y, et al. (Lancet 2023)",
    "timeline": "China; June 2021 to May 2022",
    "listCategory": "thrombolysis",
    "listDescription": "Tenecteplase vs alteplase (N=1430) in EVT-ineligible stroke; non-inferiority confirmed.",
    "bottomLineSummary": "TRACE-2 confirmed non-inferiority of tenecteplase 0.25 mg/kg to alteplase 0.9 mg/kg for mRS 0-1 at 90 days in EVT-ineligible stroke patients (62% vs 58%, RR 1.07, 95% CI 0.98-1.16, NI P confirmed). Safety was similar (sICH 2% each). TRACE-2 is a key pillar of the tenecteplase evidence base alongside AcT and ATTEST-2.",
    "doi": "10.1016/S0140-6736(22)02600-9"
  },
  "trace-iii-trial": {
    "title": "TRACE-III Trial",
    "legend": {
      "finding": "IV tenecteplase 4.5–24 h with perfusion mismatch in EVT-ineligible LVO improves mRS 0–1 at 90 d.",
      "bottomLineTag": "NNT 11",
      "keyStat": "+8.8% mRS 0–1"
    },
    "subtitle": "Tenecteplase for Ischemic Stroke 4.5-24 Hours Without Thrombectomy",
    "source": "Xiong et al. (NEJM 2024)",
    "timeline": "Published 2024",
    "listCategory": "thrombolysis",
    "listDescription": "Late-window tenecteplase 4.5-24h for ICA/MCA occlusion without EVT access; POSITIVE, NNT 11.",
    "bottomLineSummary": "TRACE-III showed tenecteplase 0.25 mg/kg improved functional independence at 90 days versus standard medical treatment in perfusion-selected LVO patients treated 4.5-24 hours after stroke onset when EVT was unavailable (33.0% vs 24.2%, relative rate 1.37, P=0.03, NNT 11). sICH was higher (3.0% vs 0.8%). Results apply specifically to EVT-unavailable settings with LVO confirmed on imaging.",
    "doi": "10.1056/NEJMoa2402980"
  },
  "triage-stroke-trial": {
    "title": "TRIAGE-STROKE Trial",
    "legend": {
      "finding": "TRIAGE-STROKE stopped early; cannot provide definitive guidance on bypass strategy.",
      "bottomLineTag": "Inconclusive",
      "keyStat": "OR 1.42"
    },
    "subtitle": "PSC-First vs CSC-First Routing in IVT-Eligible Suspected LVO",
    "source": "Behrndtz A, et al. (Stroke 2023)",
    "timeline": "Denmark; September 2018 to May 2022",
    "bottomLineSummary": "In IVT-eligible patients with suspected LVO within 4 hours of onset, direct routing to a CSC versus PSC-first transport did not significantly improve 90-day functional outcome in the acute ischemic stroke population (ordinal OR 1.42, 95% CI 0.72-2.82, p=0.31). The trial was stopped early at 171 of a planned 424 patients. Direct CSC routing shortened onset-to-groin time by 35 minutes; PSC-first shortened onset-to-needle time by 30 minutes.",
    "doi": "10.1161/STROKEAHA.123.043875"
  },
  "twist-trial": {
    "title": "TWIST Trial",
    "legend": {
      "finding": "Non-contrast CT-only selection of wake-up stroke for tenecteplase failed to show benefit.",
      "bottomLineTag": "Neutral",
      "keyStat": "OR 1.18"
    },
    "subtitle": "Wake-Up Stroke Treated with Tenecteplase Selected by Non-Contrast CT",
    "source": "Roaldsen MB, et al. (Lancet Neurol 2023)",
    "timeline": "Ten countries; June 2017 to September 2021",
    "bottomLineSummary": "In wake-up stroke patients selected by non-contrast CT (ASPECTS 4 or higher), tenecteplase 0.25 mg/kg within 4.5 hours of awakening did not significantly improve 90-day mRS distribution compared with no thrombolysis (adjusted OR 1.18, 95% CI 0.88-1.58, p=0.27). mRS 0-1 was achieved in 45% vs 38% (exploratory). Symptomatic ICH was 2% vs 1%. TWIST does not support non-contrast CT as the sole imaging modality for wake-up stroke thrombolytic selection.",
    "doi": "10.1016/S1474-4422(22)00484-7"
  },
  "wake-up-trial": {
    "title": "WAKE-UP Trial",
    "legend": {
      "finding": "Alteplase guided by DWI-FLAIR mismatch in wake-up stroke improves mRS 0–1 at 90 d.",
      "bottomLineTag": "NNT 9",
      "keyStat": "+11.5% mRS 0–1"
    },
    "subtitle": "MRI-Guided Thrombolysis for Stroke with Unknown Time of Onset",
    "source": "Thomalla et al. (NEJM 2018)",
    "timeline": "Enrolled Sep 2012 – Jun 2017",
    "listCategory": "thrombolysis",
    "listDescription": "MRI DWI-FLAIR mismatch for thrombolysis in unknown-onset stroke.",
    "bottomLineSummary": "In wake-up stroke and unknown-onset ischemic stroke selected by DWI-FLAIR mismatch on MRI, IV alteplase improved excellent functional outcome at 90 days compared with placebo. The trial stopped early due to funding constraints rather than a prespecified stopping rule, so estimates are imprecise and the numerical excess in mortality warrants discussion during consent.",
    "doi": "10.1056/NEJMoa1804355"
  },
  "weave-trial": {
    "title": "WEAVE Trial",
    "legend": {
      "finding": "Wingspan stenting met FDA safety threshold (2.6% periprocedural stroke/death) in highly selected ICAS failures.",
      "bottomLineTag": "Safety met",
      "keyStat": "2.6% (target <4%)"
    },
    "subtitle": "Wingspan Stent System Post-Market Surveillance",
    "source": "Alexander et al. (Stroke 2019;50:889-894)",
    "timeline": "Enrolled 2014 to 2017",
    "listCategory": "carotid",
    "listDescription": "FDA-mandated post-market surveillance: on-label Wingspan stenting met the 4% periprocedural safety benchmark.",
    "bottomLineSummary": "In 152 consecutive patients with symptomatic intracranial atherosclerotic stenosis undergoing Wingspan stenting under strict on-label criteria at experienced centers, the 72-hour periprocedural stroke or death rate was 2.6% (4 events; 95% CI 0.7 to 6.6%), meeting the FDA pre-specified safety benchmark of below 4%. WEAVE does not assess efficacy versus medical therapy; it provides regulatory safety evidence for stenting in a highly selected, refractory population only.",
    "doi": "10.1161/STROKEAHA.118.023996"
  }
};
