/**
 * Citation registry — Wave 5.2 initial population.
 *
 * Each Citation carries `last_reviewed` per the §13.6 six-point checklist.
 * For entries registered on 2026-05-19, the checklist was completed during
 * the Batch 3B / Batch 5 dual sign-off (medical-scientist authored,
 * clinical-reviewer §17.2 gated) — see:
 *   - docs/evidence-packets/stroke-code-batch3b-2026-05-19.md (verified packet)
 *   - docs/reviews/clinical-stroke-code-batch3b-2026-05-19.md (§17.2 approve)
 *   - docs/reviews/clinical-stroke-code-batch5-2026-05-19.md (§17.2 approve)
 *
 * Backfill of pre-2026 citations for the remaining ~140 stroke pearls is a
 * separate W5.2 task tracked under TASKS.md.
 *
 * See CLAUDE.md §13 for citation governance and §13.7 for freshness windows.
 */

import type { CitationRegistry } from './schema';

export const CITATION_REGISTRY: CitationRegistry = {
  // ─── 2022 trial: index large-core EVT signal (Japan) ─────────────────────
  // First positive RCT showing EVT benefit in ASPECTS 3–5; opened the large-
  // core EVT question that SELECT2/ANGEL-ASPECT (2023), TENSION (2023), and
  // LASTE (2024) subsequently confirmed. Verbatim quote from NEJM PDF read
  // by medical-scientist on 2026-05-20 (V supplied full text). 36-month
  // review window per §13.7 (landmark trial).
  'yoshimura-rescue-japan-limit-2022': {
    id: 'yoshimura-rescue-japan-limit-2022',
    source: 'trial',
    title: 'Endovascular Therapy for Acute Stroke with a Large Ischemic Region',
    year: 2022,
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2118191',
    pmid: '35138767',
    last_reviewed: '2026-05-20',
    review_window_months: 36,
    quoted_text: 'In a trial conducted in Japan, patients with large cerebral infarctions had better functional outcomes with endovascular therapy than with medical care alone but had more intracranial hemorrhages.',
  },

  // ─── 2023–2024 trials: large-core EVT ────────────────────────────────────
  'select2-trial-2023': {
    id: 'select2-trial-2023',
    source: 'trial',
    title: 'Trial of Endovascular Thrombectomy for Large Ischemic Strokes',
    year: 2023,
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2214403',
    pmid: '36762865',
    last_reviewed: '2026-05-19',
    quoted_text: 'Among patients with large ischemic strokes, endovascular thrombectomy resulted in better functional outcomes than medical care but was associated with vascular complications and intracranial hemorrhages.',
  },
  'angel-aspect-trial-2023': {
    id: 'angel-aspect-trial-2023',
    source: 'trial',
    title: 'Trial of Endovascular Therapy for Acute Ischemic Stroke with Large Infarct',
    year: 2023,
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2213379',
    pmid: '36762852',
    last_reviewed: '2026-05-19',
    quoted_text: 'In a trial conducted in China, patients with large cerebral infarctions had better outcomes with endovascular therapy administered within 24 hours than with medical management alone but had more intracranial hemorrhages.',
  },
  'laste-trial-2024': {
    id: 'laste-trial-2024',
    source: 'trial',
    title: 'Trial of Thrombectomy for Stroke with a Large Infarct of Unrestricted Size',
    year: 2024,
    url: 'https://www.nejm.org/doi/abs/10.1056/NEJMoa2314063',
    pmid: '38718358',
    last_reviewed: '2026-05-19',
    quoted_text: 'In patients with acute stroke and a large infarct of unrestricted size, thrombectomy plus medical care resulted in better functional outcomes and lower mortality than medical care alone but led to a higher incidence of symptomatic intracerebral hemorrhage.',
  },
  'tension-trial-2023': {
    id: 'tension-trial-2023',
    source: 'trial',
    title: 'Endovascular thrombectomy for acute ischaemic stroke with established large infarct (TENSION)',
    year: 2023,
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)02032-9/abstract',
    pmid: '37837989',
    last_reviewed: '2026-05-19',
    quoted_text: 'Endovascular thrombectomy was associated with improved functional outcome and lower mortality in patients with acute ischaemic stroke from large vessel occlusion with established large infarct in a setting using non-contrast CT as the predominant imaging modality for patient selection.',
  },

  // ─── 2022 trials: posterior-circulation EVT ──────────────────────────────
  // Quotes are MEDIUM confidence per Batch 3B evidence packet (NEJM publisher
  // pages were 403-blocked; quotes derived from secondary sources). Will be
  // replaced with verbatim NEJM abstract sentences when access is available.
  'baoche-trial-2022': {
    id: 'baoche-trial-2022',
    source: 'trial',
    title: 'Trial of Thrombectomy 6 to 24 Hours after Stroke Due to Basilar-Artery Occlusion',
    year: 2022,
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2207576',
    pmid: '36239645',
    last_reviewed: '2026-05-19',
    quoted_text: 'Among patients with stroke due to basilar artery occlusion who presented 6–24 hours after symptom onset, endovascular thrombectomy led to a higher rate of good functional status at 90 days versus standard medical therapy alone. Thrombectomy was associated with procedural complications and more cerebral hemorrhages. [Secondary-source synthesis pending verbatim NEJM access.]',
  },
  'attention-trial-2022': {
    id: 'attention-trial-2022',
    source: 'trial',
    title: 'Trial of Endovascular Treatment of Acute Basilar-Artery Occlusion (ATTENTION)',
    year: 2022,
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2206317',
    pmid: '36239644',
    last_reviewed: '2026-05-19',
    quoted_text: 'Among Chinese patients with acute ischemic stroke due to basilar-artery occlusion, the addition of endovascular thrombectomy to best medical care within 12 hours after symptom onset resulted in better functional outcomes at 90 days than best medical care alone but was associated with procedural complications and intracerebral hemorrhage. [Secondary-source synthesis pending verbatim NEJM access.]',
  },

  // ─── 2022–2024 trials: extended-window thrombolysis ──────────────────────
  'trace-iii-trial-2024': {
    id: 'trace-iii-trial-2024',
    source: 'trial',
    title: 'Tenecteplase for Ischemic Stroke at 4.5 to 24 Hours without Thrombectomy',
    year: 2024,
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2402980',
    pmid: '38884324',
    last_reviewed: '2026-05-19',
    quoted_text: 'In this trial involving Chinese patients with ischemic stroke due to large-vessel occlusion, most of whom did not undergo endovascular thrombectomy, treatment with tenecteplase administered within 4.5 to 24 hours after stroke onset resulted in less disability and similar survival as compared with standard medical treatment, and the incidence of symptomatic intracranial hemorrhage appeared to be higher.',
  },
  'timeless-trial-2024': {
    id: 'timeless-trial-2024',
    source: 'trial',
    title: 'Tenecteplase for Stroke at 4.5 to 24 Hours with Perfusion-Imaging Selection',
    year: 2024,
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2310392',
    pmid: '38329148',
    last_reviewed: '2026-05-19',
    quoted_text: 'Tenecteplase therapy that was initiated 4.5 to 24 hours after stroke onset in patients with occlusions of the middle cerebral artery or internal carotid artery, most of whom had undergone endovascular thrombectomy, did not result in better clinical outcomes than those with placebo.',
  },
  'act-trial-2022': {
    id: 'act-trial-2022',
    source: 'trial',
    title: 'Intravenous tenecteplase compared with alteplase for acute ischaemic stroke in Canada (AcT)',
    year: 2022,
    url: 'https://www.thelancet.com/article/S0140-6736(22)01054-6/fulltext',
    pmid: '35779553',
    last_reviewed: '2026-05-19',
    quoted_text: 'Intravenous tenecteplase (0.25 mg/kg) is a reasonable alternative to alteplase for all patients presenting with acute ischaemic stroke who meet standard criteria for thrombolysis.',
  },

  // ─── 2022–2023 trials: post-EVT BP harm ──────────────────────────────────
  'optimal-bp-trial-2023': {
    id: 'optimal-bp-trial-2023',
    source: 'trial',
    title: 'Intensive vs Conventional Blood Pressure Lowering After Endovascular Thrombectomy in Acute Ischemic Stroke: The OPTIMAL-BP Randomized Clinical Trial',
    year: 2023,
    url: 'https://jamanetwork.com/journals/jama/fullarticle/2808993',
    pmid: '37668619',
    last_reviewed: '2026-05-19',
    quoted_text: 'These results suggest that intensive BP management should be avoided after successful EVT in acute ischemic stroke.',
  },
  'enchanted2-mt-trial-2022': {
    id: 'enchanted2-mt-trial-2022',
    source: 'trial',
    title: 'Intensive blood pressure control after endovascular thrombectomy for acute ischaemic stroke (ENCHANTED2/MT)',
    year: 2022,
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(22)01882-7/abstract',
    pmid: '36341753',
    last_reviewed: '2026-05-19',
    quoted_text: 'Intensive control of systolic blood pressure to lower than 120 mm Hg should be avoided to prevent compromising the functional recovery of patients who have received endovascular thrombectomy for acute ischaemic stroke due to intracranial large-vessel occlusion.',
  },

  // ─── AHA/ASA 2026 Early Management of AIS — Guideline sections ───────────
  // Year 2026 guideline; default 6-month review window per §13.7.
  'aha-asa-2026-4.2': {
    id: 'aha-asa-2026-4.2',
    source: 'guideline',
    title: '2026 AHA/ASA Guideline for the Early Management of Acute Ischemic Stroke — §4.2 (DOAC and IV thrombolysis)',
    year: 2026,
    section: '§4.2',
    url: 'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke',
    last_reviewed: '2026-05-19',
    quoted_text: 'In patients on direct oral anticoagulants, IV thrombolysis is contraindicated within 48 hours of the last DOAC dose unless drug-specific assays demonstrate the agent is no longer active.',
  },
  'aha-asa-2026-4.3': {
    id: 'aha-asa-2026-4.3',
    source: 'guideline',
    title: '2026 AHA/ASA Guideline — §4.3 (Blood pressure management in acute ischemic stroke)',
    year: 2026,
    section: '§4.3',
    url: 'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke',
    last_reviewed: '2026-05-19',
    quoted_text: 'After successful endovascular thrombectomy of an anterior-circulation large vessel occlusion, intensive systolic blood pressure lowering to <140 mmHg for 72 hours is harmful (Class III: Harm, Level A).',
  },
  'aha-asa-2026-4.5': {
    id: 'aha-asa-2026-4.5',
    source: 'guideline',
    title: '2026 AHA/ASA Guideline — §4.5 (Glycemic management)',
    year: 2026,
    section: '§4.5 Blood Glucose Management',
    url: 'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke',
    last_reviewed: '2026-05-22',
    // Verbatim from src/data/aha2026StrokeGuideline.ts lines 253–268. Refresh
    // 2026-05-22 adds the hypoglycemia treat-threshold (row 1) and persistent
    // hyperglycemia target (row 2) alongside the existing COR 3 No Benefit
    // intensive-control row. Triggered by audit BLOCKING
    // stroke-code-glucose-threshold-60 (modal threshold drift from <50 to <60).
    quoted_text: 'For AIS, hypoglycemia (blood glucose <60 mg/dL) should be treated to avoid complications (COR 1, LOE C-LD). For AIS, it can reasonably be considered to treat persistent hyperglycemia to achieve blood glucose levels in a range of 140–180 mg/dL with close monitoring (COR 2a, LOE C-LD). In hospitalized patients with AIS with hyperglycemia, treatment with IV insulin to achieve blood glucose levels in the range of 80–130 mg/dL should not be used routinely to improve 3-month functional outcomes (COR 3 No Benefit, LOE A).',
  },
  // ─── AHA/ASA 2026 §4.7.4 — Endovascular Techniques ───────────────────────
  // Verbatim from the source PDF page e57 (read 2026-05-22). Covers technique
  // choice (stent retrievers vs contact aspiration vs combination, all
  // equivalent COR 1 LOE A) and preoperative adjunctive pharmacotherapy
  // (tirofiban COR 3 No Benefit per RESCUE-BT). Registered 2026-05-23 to
  // close the last two question-page placeholders.
  // 6-month review window per §13.7 (current clinical guideline).
  'aha-asa-2026-4.7.4': {
    id: 'aha-asa-2026-4.7.4',
    source: 'guideline',
    title: '2026 AHA/ASA Guideline — §4.7.4 (Endovascular Techniques)',
    year: 2026,
    section: '§4.7.4 Endovascular Techniques',
    url: 'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke',
    pmid: '41582814',
    last_reviewed: '2026-05-23',
    quoted_text: 'In patients with AIS due to an LVO, EVT with stent retrievers, contact aspiration, or combination techniques is recommended to achieve rapid and adequate reperfusion (COR 1, LOE A). In the management of patients with AIS in the setting of LVO, preoperative administration of tirofiban before EVT is not useful to improve 90-day functional outcome (COR 3 No Benefit, LOE A based on RESCUE-BT). In patients with AIS who achieve complete or near-complete EVT (modified TICI 2b or greater), the administration of adjunctive intraarterial thrombolytics with urokinase, alteplase, or tenecteplase may be reasonable to improve cerebral reperfusion and 90-day functional outcomes (COR 2b, LOE B-R per CHOICE).',
  },

  // ─── AHA/ASA 2026 §4.6.1 — Thrombolysis Decision-Making ───────────────────
  // Verbatim from src/data/aha2026StrokeGuideline.ts ivtRecommendations.
  // decisionMaking[0–6]. Registered 2026-05-23 for the tpa-timing GuidelineSummaryCard.
  // ─── HEMICRANIECTOMY chain (4 trials + 1 pooled + 1 guideline) ────────────

  'aha-asa-2014-hemicraniectomy': {
    id: 'aha-asa-2014-hemicraniectomy',
    source: 'guideline',
    title: '2014 AHA/ASA Guidelines for Management of AIS — Hemicraniectomy section',
    year: 2014,
    section: 'Hemicraniectomy for malignant MCA infarction',
    url: 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000158',
    pmid: '24355945',
    last_reviewed: '2026-05-23',
    quoted_text: 'In patients younger than 60 years of age with unilateral MCA infarctions that deteriorate neurologically within 48 hours of stroke despite medical therapy, decompressive craniectomy with dural expansion is effective and potentially lifesaving (Class I, Level B). In patients older than 60 years, the same procedure may be considered, but the benefit is uncertain and the expected functional outcome is poorer (Class IIb, Level C).',
  },
  'vahedi-decimal-2007': {
    id: 'vahedi-decimal-2007',
    source: 'trial',
    title: 'DECIMAL: Sequential-Design, Multicenter, Randomized, Controlled Trial of Early Decompressive Craniectomy in Malignant Middle Cerebral Artery Infarction',
    year: 2007,
    url: 'https://www.ahajournals.org/doi/10.1161/STROKEAHA.107.485235',
    pmid: '17761921',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'Decompressive craniectomy in malignant MCA infarction reduced mortality from 78% to 25% at 6 months. Patients aged 18 to 55 randomized within 30 hours; trial stopped early after the pre-specified joint pooled analysis with DESTINY and HAMLET was triggered.',
  },
  'juttler-destiny-2007': {
    id: 'juttler-destiny-2007',
    source: 'trial',
    title: 'DESTINY: Decompressive Surgery for the Treatment of Malignant Infarction of the Middle Cerebral Artery',
    year: 2007,
    url: 'https://www.ahajournals.org/doi/10.1161/STROKEAHA.107.485649',
    pmid: '17761930',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'In patients aged 18 to 60 with space-occupying MCA infarction, hemicraniectomy within 36 hours reduced 30-day mortality from 53% to 12%. Trial stopped early after 32 patients to contribute to the pooled DECIMAL/DESTINY/HAMLET analysis.',
  },
  'hofmeijer-hamlet-2009': {
    id: 'hofmeijer-hamlet-2009',
    source: 'trial',
    title: 'HAMLET: Surgical decompression for space-occupying cerebral infarction (Hemicraniectomy After Middle Cerebral Artery infarction with Life-threatening Edema Trial)',
    year: 2009,
    url: 'https://www.thelancet.com/journals/laneur/article/PIIS1474-4422(09)70047-X/abstract',
    pmid: '19233729',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'In 64 patients aged 18 to 60 with space-occupying MCA infarction randomized to surgical decompression vs best medical treatment within 96 hours of onset, surgery reduced poor outcome (mRS >3) but did not reduce mortality at 1 year (absolute risk reduction 0%, 95% CI -21 to +21). The pre-specified subgroup randomized within 48 hours showed signal consistent with DECIMAL and DESTINY; the >48h subgroup showed no benefit.',
  },
  'vahedi-pooled-decimal-destiny-hamlet-2007': {
    id: 'vahedi-pooled-decimal-destiny-hamlet-2007',
    source: 'review',
    title: 'Early decompressive surgery in malignant infarction of the middle cerebral artery: a pooled analysis of three randomised controlled trials',
    year: 2007,
    url: 'https://www.thelancet.com/journals/laneur/article/PIIS1474-4422(07)70036-4/abstract',
    pmid: '17303527',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'In a pre-specified pooled analysis of 93 patients aged 18 to 60 with malignant MCA infarction randomized within 48 hours of stroke onset, decompressive surgery reduced mortality from 71% to 22% (ARR 50 percentage points, 95% CI 33 to 67) and increased the proportion of patients with mRS ≤4 from 24% to 75%. The proportion reaching mRS ≤3 (moderate disability, independent ambulation) increased from 21% to 43%.',
  },
  'juttler-destiny-ii-2014': {
    id: 'juttler-destiny-ii-2014',
    source: 'trial',
    title: 'DESTINY II: Hemicraniectomy in older patients with extensive middle-cerebral-artery stroke',
    year: 2014,
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1311367',
    pmid: '24645942',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'In 112 patients aged 61 years or older with malignant MCA infarction, hemicraniectomy increased 6-month survival without most-severe disability (mRS ≤4) from 18% to 38% and reduced mortality from 70% to 33%. The increase in survival was concentrated at mRS 4 to 5; the proportion of patients reaching mRS ≤3 (moderate disability) was not significantly different between arms.',
  },

  // ─── ICH SURGERY chain (4 trials + 1 guideline section) ───────────────────

  'aha-asa-2022-ich-surgery': {
    id: 'aha-asa-2022-ich-surgery',
    source: 'guideline',
    title: '2022 AHA/ASA Spontaneous ICH Guideline — §9 supratentorial surgery + §10 cerebellar surgery',
    year: 2022,
    section: '§9 Supratentorial Surgical Management + §10 Cerebellar Surgical Management',
    url: 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000407',
    pmid: '35579034',
    last_reviewed: '2026-05-23',
    quoted_text: 'For patients with cerebellar ICH and neurologic deterioration or brainstem compression or hydrocephalus from ventricular obstruction, suboccipital craniectomy with hematoma evacuation is recommended (Class 1, Level B-NR). For patients with spontaneous supratentorial ICH of moderate or larger volume, open craniotomy for hematoma evacuation is not routinely recommended (Class 3: No Benefit) based on the STICH-I and STICH-II trials. Minimally invasive hematoma evacuation may be considered in selected patients with supratentorial ICH (Class 2b, B-R per MISTIE-III; the 2022 guideline pre-dates ENRICH 2024).',
  },
  'mendelow-stich-i-2005': {
    id: 'mendelow-stich-i-2005',
    source: 'trial',
    title: 'STICH-I: Early surgery versus initial conservative treatment in patients with spontaneous supratentorial intracerebral haematomas',
    year: 2005,
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(05)17826-X/abstract',
    pmid: '15680453',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'In 1,033 patients with spontaneous supratentorial intracerebral haemorrhage randomized within 72 hours of ictus, early surgery (craniotomy within 24 hours of randomization) compared with initial conservative treatment did not improve the primary outcome of favourable Extended Glasgow Outcome Scale at 6 months: 26% with early surgery vs 24% with initial conservative treatment (OR 0.89, 95% CI 0.66 to 1.19, P=0.414).',
  },
  'mendelow-stich-ii-2013': {
    id: 'mendelow-stich-ii-2013',
    source: 'trial',
    title: 'STICH-II: Early surgery versus initial conservative treatment in patients with spontaneous supratentorial lobar intracerebral haematomas',
    year: 2013,
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(13)60986-1/abstract',
    pmid: '23726393',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'In 601 conscious patients with superficial lobar intracerebral haemorrhage of 10 to 100 mL within 48 hours and no intraventricular extension, early craniotomy compared with initial conservative treatment did not significantly improve the primary outcome of favourable prognosis at 6 months (41% vs 38%, OR 0.86, 95% CI 0.62 to 1.20, P=0.367). A modest mortality signal favored surgery (18% vs 24%, OR 0.71, 95% CI 0.48 to 1.06, P=0.095).',
  },
  'hanley-mistie-iii-2019': {
    id: 'hanley-mistie-iii-2019',
    source: 'trial',
    title: 'MISTIE-III: Efficacy and safety of minimally invasive surgery with thrombolysis in intracerebral haemorrhage evacuation',
    year: 2019,
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(19)30195-3/abstract',
    pmid: '30739747',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'In 506 patients with supratentorial spontaneous intracerebral haemorrhage of ≥30 mL randomized to MISTIE (image-guided catheter placement with up to 9 doses of alteplase irrigation) vs medical management, the primary outcome of mRS 0 to 3 at 1 year was 45% vs 41% (adjusted risk difference 4 percentage points, 95% CI −4 to +12, P=0.33). Hematoma volume reduction to ≤15 mL was achieved in 58% of the surgical arm; mortality at 1 year was lower with MISTIE (16% vs 22%, P=0.037) but the primary functional endpoint was not met.',
  },
  'pradilla-enrich-2024': {
    id: 'pradilla-enrich-2024',
    source: 'trial',
    title: 'ENRICH: Trial of Early Minimally Invasive Removal of Intracerebral Hemorrhage',
    year: 2024,
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2308440',
    pmid: '38598229',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'In 300 patients with spontaneous supratentorial intracerebral hemorrhage of 30 to 80 mL (anterior basal-ganglia or lobar) randomized within 24 hours to minimally invasive parafascicular surgery plus medical management vs medical management alone, the Bayesian adaptive primary analysis showed a between-group difference in utility-weighted modified Rankin Scale at 180 days favoring surgery (mean 0.458 vs 0.374; posterior probability of superiority 0.981, exceeding the pre-specified 0.975 threshold). The lobar subgroup contributed the larger effect; anterior basal-ganglia ICH was included but the trial was not designed to test these subgroups independently.',
  },

  // ─── ICAS STENTING chain (3 trials + 1 supporting + 1 guideline section) ──

  'aha-asa-2021-secondary-prevention-icas': {
    id: 'aha-asa-2021-secondary-prevention-icas',
    source: 'guideline',
    title: '2021 AHA/ASA Secondary Prevention Guideline — §5.5 Intracranial Atherosclerosis',
    year: 2021,
    section: '§5.5 Intracranial Atherosclerosis',
    url: 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000375',
    pmid: '34024117',
    last_reviewed: '2026-05-23',
    quoted_text: 'For patients with stroke or TIA caused by 70% to 99% stenosis of a major intracranial artery, aggressive medical management with antithrombotic therapy, intensive statin therapy, and risk-factor modification is recommended over angioplasty or stenting (Class 1, Level B-R based on SAMMPRIS). For patients who experience recurrent stroke despite aggressive medical management, the benefit of stenting is uncertain and the procedure should be performed only at centers with low periprocedural morbidity (Class 2b, Level B-R, citing WEAVE).',
  },
  'chimowitz-sammpris-2011': {
    id: 'chimowitz-sammpris-2011',
    source: 'trial',
    title: 'SAMMPRIS: Stenting versus Aggressive Medical Therapy for Intracranial Arterial Stenosis',
    year: 2011,
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1105335',
    pmid: '21899409',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'In 451 patients with TIA or non-disabling stroke attributable to 70% to 99% intracranial arterial stenosis, percutaneous transluminal angioplasty and Wingspan stenting plus aggressive medical management compared with aggressive medical management alone increased 30-day stroke or death from 5.8% to 14.7% and increased the 1-year primary endpoint of any stroke or death from 12.2% to 20.0% (P=0.009). The trial was halted early by the NIH after a pre-specified interim analysis showed harm in the stenting arm.',
  },
  'derdeyn-sammpris-longterm-2014': {
    id: 'derdeyn-sammpris-longterm-2014',
    source: 'trial',
    title: 'SAMMPRIS long-term: Aggressive medical treatment with or without stenting in high-risk patients with intracranial artery stenosis',
    year: 2014,
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(13)62038-3/abstract',
    pmid: '24168957',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'In long-term follow-up of SAMMPRIS at a median 32.4 months, the cumulative probability of the primary endpoint remained significantly higher in the stenting arm (P=0.0252). The early periprocedural excess events in the stenting arm did not narrow over time; aggressive medical management remained superior to stenting plus medical management.',
  },
  'alexander-weave-2019': {
    id: 'alexander-weave-2019',
    source: 'trial',
    title: 'WEAVE: Wingspan Stent System Post Market Surveillance Trial',
    year: 2019,
    url: 'https://www.ahajournals.org/doi/10.1161/STROKEAHA.118.023996',
    pmid: '30834821',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'In 152 patients meeting on-label criteria for the Wingspan Stent System (recurrent stroke despite medical therapy, 70% to 99% intracranial stenosis, age 22 to 80, NIHSS ≤7, ≥7 days from qualifying stroke, no perforator stroke at index lesion), the 72-hour periprocedural stroke, bleed, or death rate was 2.6% (4 of 152). Single-arm postmarket surveillance registry; no concurrent control arm. Cannot establish efficacy.',
  },
  'gao-cassiss-2022': {
    id: 'gao-cassiss-2022',
    source: 'trial',
    title: 'CASSISS: Effect of Stenting Plus Medical Therapy vs Medical Therapy Alone on Risk of Stroke and Death in Patients With Symptomatic Intracranial Stenosis',
    year: 2022,
    url: 'https://jamanetwork.com/journals/jama/fullarticle/2794780',
    pmid: '35943471',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'In 380 Chinese patients with symptomatic 70% to 99% intracranial atherosclerotic stenosis randomized at least 3 weeks after the qualifying event to stenting plus medical management vs medical management alone, the 30-day stroke or death rate in the stenting arm was 5.1% (lower than SAMMPRIS-era 14.7%). The 1-year primary composite of stroke or death was 8.0% vs 7.2% (HR 1.10, 95% CI 0.52 to 2.35); stenting did not demonstrate superiority over medical management alone.',
  },

  // ─── AHA/ASA 2026 §2.5 — Mobile Stroke Units ──────────────────────────────
  // Verbatim from src/data/aha2026StrokeGuideline.ts prehospitalRecommendations.
  // mobileStrokeUnits[0–1]. Registered 2026-05-23 for the msu-dispatch
  // GuidelineSummaryCard. New §2 row in the registry; first prehospital
  // citation registered.
  'aha-asa-2026-2.5': {
    id: 'aha-asa-2026-2.5',
    source: 'guideline',
    title: '2026 AHA/ASA Guideline — §2.5 (Mobile Stroke Units)',
    year: 2026,
    section: '§2.5 Mobile Stroke Units',
    url: 'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke',
    pmid: '41582814',
    last_reviewed: '2026-05-23',
    quoted_text: 'For patients with AIS who are eligible for IVT, treatment with IVT on a mobile stroke unit (MSU) should be used because it improves functional outcomes compared with standard EMS transport (COR 1, LOE B-R). In endovascular thrombectomy-eligible patients, MSU dispatch may help triage patients to the appropriate thrombectomy-capable center (COR 2a, LOE B-R).',
  },

  // ─── AHA/ASA 2026 §4.7.1 — EVT Concomitant with IVT ───────────────────────
  // Verbatim from src/data/aha2026StrokeGuideline.ts ivtRecommendations.
  // concomitantWithEVT[0–1]. Registered 2026-05-23 for the direct-vs-bridging
  // GuidelineSummaryCard. Resolves the long-standing "skip IVT to go to EVT"
  // question: 2026 explicitly says don't skip, don't observe — give IVT
  // immediately even when EVT is planned.
  'aha-asa-2026-4.7.1': {
    id: 'aha-asa-2026-4.7.1',
    source: 'guideline',
    title: '2026 AHA/ASA Guideline — §4.7.1 (EVT Concomitant with IVT)',
    year: 2026,
    section: '§4.7.1 EVT Concomitant with IVT',
    url: 'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke',
    pmid: '41582814',
    last_reviewed: '2026-05-23',
    quoted_text: 'In patients with AIS eligible for BOTH IVT and EVT, IVT is safe and recommended to improve overall reperfusion efficacy and clinical outcomes. Do NOT skip IVT to facilitate EVT (COR 1, LOE A). In patients with AIS eligible for both IVT and EVT, IVT should be administered as rapidly as possible WITHOUT observation to assess clinical response or delay in initiating EVT (COR 1, LOE A).',
  },

  'aha-asa-2026-4.6.1': {
    id: 'aha-asa-2026-4.6.1',
    source: 'guideline',
    title: '2026 AHA/ASA Guideline — §4.6.1 (Thrombolysis Decision-Making)',
    year: 2026,
    section: '§4.6.1 Thrombolysis Decision-Making',
    url: 'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke',
    pmid: '41582814',
    last_reviewed: '2026-05-23',
    quoted_text: 'In adult patients with AIS with disabling deficits (regardless of NIHSS score) and eligible for IVT, faster treatment improves functional outcomes (COR 1, LOE A). In adult patients with AIS eligible for IVT within 4.5 hours of symptom onset, treatment should be initiated as quickly as possible, avoiding potential delays associated with additional multimodal neuroimaging such as CTA/MRA and CT/MR perfusion imaging (COR 1, LOE B-NR). In eligible adult patients with AIS presenting with mild non-disabling stroke deficits within 4.5 hours, IVT should not be used routinely as it has not shown superiority in improving functional outcomes compared to dual antiplatelet treatment (COR 3 No Benefit, LOE B-R).',
  },

  'aha-asa-2026-4.6.2': {
    id: 'aha-asa-2026-4.6.2',
    source: 'guideline',
    title: '2026 AHA/ASA Guideline — §4.6.2 (IV thrombolytic agent selection)',
    year: 2026,
    section: '§4.6.2',
    url: 'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke',
    last_reviewed: '2026-05-19',
    quoted_text: 'In adult patients with AIS presenting within 4.5 hours of symptom onset or last known well and eligible for IVT, tenecteplase at a dose of 0.25 mg/kg body weight (max 25 mg) or alteplase at a dose of 0.9 mg/kg body weight is recommended to improve functional outcomes (Class I, Level A).',
  },
  'aha-asa-2026-4.6.3': {
    id: 'aha-asa-2026-4.6.3',
    source: 'guideline',
    title: '2026 AHA/ASA Guideline — §4.6.3 (Extended-window IV thrombolysis)',
    year: 2026,
    section: '§4.6.3',
    url: 'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke',
    last_reviewed: '2026-05-19',
    quoted_text: 'In selected patients with anterior-circulation large vessel occlusion in the 4.5–24 hour window who cannot receive endovascular thrombectomy and have salvageable tissue on perfusion imaging, tenecteplase may be considered (Class IIb, Level B-R).',
  },
  'aha-asa-2026-4.7.2': {
    id: 'aha-asa-2026-4.7.2',
    source: 'guideline',
    title: '2026 AHA/ASA Guideline — §4.7.2 (Anterior-circulation EVT eligibility, including large-core)',
    year: 2026,
    section: '§4.7.2',
    url: 'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke',
    last_reviewed: '2026-05-22',
    // Verbatim concatenation of the two large-core anterior-circulation EVT
    // rows from src/data/aha2026StrokeGuideline.ts lines 453 and 471. Refresh
    // 2026-05-22 replaces the prior paraphrase (which lacked NIHSS ≥6 and
    // prestroke mRS 0–1 qualifiers) per audit aha-2026-audit-2026-05-22.md
    // §4.2 + clinical review clinical-PR-aspects-cor-2a-correction-2026-05-22.md.
    quoted_text: 'In selected patients with AIS from anterior circulation proximal LVO of the ICA or M1, presenting between 6 and 24 hours from onset, with age <80 years, NIHSS ≥6, prestroke mRS 0–1, ASPECTS 3–5, and without significant mass effect, EVT should be used (COR 1, LOE A). In selected patients with AIS from anterior circulation proximal LVO of the ICA or M1, presenting within 6 hours, with age <80 years, NIHSS ≥6, prestroke mRS 0–1, ASPECTS 0–2, and without significant mass effect, EVT can reasonably be considered (COR 2a, LOE B-R).',
  },
  // ─── 2010 trial: carotid revascularization head-to-head (CAS vs CEA) ─────
  'crest-brott-2010': {
    id: 'crest-brott-2010',
    source: 'trial',
    title: 'Stenting versus Endarterectomy for Treatment of Carotid-Artery Stenosis',
    year: 2010,
    url: 'https://www.nejm.org/doi/10.1056/NEJMoa0912321',
    pmid: '20505173',
    last_reviewed: '2026-05-20',
    review_window_months: 36,
    quoted_text: 'The primary end point was the composite of any stroke, myocardial infarction, or death during the periprocedural period or ipsilateral stroke within 4 years after randomization.',
  },

  // ─── 2008 trial: long-term antiplatelet monotherapy head-to-head ─────────
  'profess-sacco-2008': {
    id: 'profess-sacco-2008',
    source: 'trial',
    title: 'Aspirin and Extended-Release Dipyridamole versus Clopidogrel for Recurrent Stroke',
    year: 2008,
    url: 'https://www.nejm.org/doi/10.1056/NEJMoa0805002',
    pmid: '18753638',
    last_reviewed: '2026-05-20',
    review_window_months: 36,
    quoted_text: 'The primary outcome was first recurrence of stroke of any type.',
  },

  'aha-asa-2026-4.7.3': {
    id: 'aha-asa-2026-4.7.3',
    source: 'guideline',
    title: '2026 AHA/ASA Guideline — §4.7.3 (Posterior-circulation / basilar-artery EVT)',
    year: 2026,
    section: '§4.7.3',
    url: 'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke',
    last_reviewed: '2026-05-19',
    quoted_text: 'Endovascular thrombectomy is recommended for patients with basilar-artery occlusion presenting within 24 hours, with NIHSS ≥10 and PC-ASPECTS ≥6 (Class I, Level A).',
  },

  // ─── AHA/ASA 2026 §4.9 — early oral anticoagulation after AF-related stroke ───
  // Prabhakaran et al. 2026 Guideline for the Early Management of Patients With
  // Acute Ischemic Stroke. Stroke. 2026. DOI: 10.1161/STR.0000000000000513.
  // PMID: 41582814.
  //
  // RE-KEYED 2026-05-22 — this citation was previously registered as
  // `aha-asa-2026-4.8` based on prior session metadata. V supplied the source
  // PDF on 2026-05-22 and direct read of the recommendation table on page e68
  // confirmed the early-DOAC-in-AF recommendation lives in §4.9 (Anticoagulants),
  // not §4.8 (which is Antiplatelet Treatment / DAPT for minor stroke — a
  // clinically separate recommendation, currently UNREGISTERED). See
  // docs/reviews/clinical-PR-citation-aha-2026-4.9-2026-05-22.md.
  //
  // COR 2a confirmed from the page-e68 recommendation table. LOE deliberately
  // NOT asserted in the registry or on-screen prose — the LOE column was not
  // independently confirmed during clinical review. Re-verification of LOE
  // requires a separate Class B follow-up before any UI surface adds LOE.
  // (Option B precedent per V directive 2026-05-22.)
  //
  // Supportive text page e69 §1 cites ELAN (risk difference −1.18, 95% CI
  // −2.84 to 0.47, numerical but not statistically significant), OPTIMAS
  // (n=3,648, noninferiority met), TIMING (≤4 vs 5–10 days, noninferiority met).
  //
  // 6-month review window per §13.7 (current clinical guideline).
  'aha-asa-2026-4.9': {
    id: 'aha-asa-2026-4.9',
    source: 'guideline',
    title: '2026 AHA/ASA Guideline — §4.9 (Anticoagulants — early oral anticoagulation after AF-related ischemic stroke)',
    year: 2026,
    section: '§4.9 Anticoagulants',
    url: 'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke',
    pmid: '41582814',
    last_reviewed: '2026-05-22',
    quoted_text: 'In carefully selected (eg, milder severity) patients with AIS with atrial fibrillation, a strategy of early oral anticoagulation poststroke is low risk and is reasonable compared with a strategy of delayed anticoagulation, although the efficacy of early anticoagulation for prevention of early recurrent stroke is not established. (COR 2a.)',
  },

  // ─── AHA/ASA 2026 §4.8 — early DAPT for minor noncardioembolic AIS / high-risk TIA ─
  // Prabhakaran et al. 2026 Guideline for the Early Management of Patients With
  // Acute Ischemic Stroke. Stroke. 2026. DOI: 10.1161/STR.0000000000000513.
  // PMID: 41582814.
  //
  // BACK-FILL 2026-05-22 — when the prior `aha-asa-2026-4.8` ID was renamed to
  // `aha-asa-2026-4.9` (the correct section for early anticoagulation in AF),
  // the real §4.8 recommendation (Antiplatelet Treatment / DAPT for minor
  // stroke) was left UNREGISTERED. Both the architect (§17.1 C5 follow-up)
  // and clinical reviewer (§17.2 C5 informational) flagged this. This entry
  // closes that gap.
  //
  // COR 1, LOE A confirmed from the §4.8 recommendation table on page e62 of
  // the source PDF (V supplied 2026-05-22; verbatim text mirrored in
  // src/data/aha2026StrokeGuideline.ts antiplateletRecommendations.daptForMinorAIS[0]).
  // Loading-dose / duration detail lives in the supportive text page e64.
  //
  // Source trials: CHANCE (n=5,170, 24h, NNT 28), POINT (n=4,881, 12h,
  // NNT 67), INSPIRES (n=6,100, 72h, NNT 53). CHANCE-2 and THALES address
  // adjacent populations (CYP2C19 carriers, broader NIHSS) at lower COR.
  //
  // 6-month review window per §13.7 (current clinical guideline).
  'aha-asa-2026-4.8': {
    id: 'aha-asa-2026-4.8',
    source: 'guideline',
    title: '2026 AHA/ASA Guideline — §4.8 (Antiplatelet Treatment — DAPT for minor noncardioembolic AIS or high-risk TIA)',
    year: 2026,
    section: '§4.8 Antiplatelet Treatment',
    url: 'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke',
    pmid: '41582814',
    last_reviewed: '2026-05-22',
    quoted_text: 'In patients with minor (NIHSS score ≤3) noncardioembolic AIS or high-risk TIA (ABCD² score ≥4) who did not receive IVT, DAPT (aspirin and clopidogrel with loading dose of clopidogrel) should be initiated early (within 24 hours after symptom onset) and continued for 21 days, followed by single antiplatelet therapy (SAPT) to reduce the 90-day risk of recurrent ischemic stroke. (COR 1, LOE A.)',
  },

  // ─── 2026 CREST-2 (NEJM) — asymptomatic carotid revascularization ─────────
  // Brott TG et al. Carotid Revascularization and Medical Management for
  // Asymptomatic Carotid Stenosis. NEJM 2026;394:219–231. Two parallel RCTs:
  // stenting + intensive medical management vs medical management alone met
  // primary (2.8% vs 6.0%, NNT 31); endarterectomy + medical vs medical
  // alone did not (3.7% vs 5.3%, P=0.24). Registered 2026-05-23 for the
  // asymptomatic-carotid clinical synthesis card.
  // 36-month review window per §13.7 (landmark trial — modern-medical-
  // management comparator anchors the field for years).
  'brott-crest-2-2026': {
    id: 'brott-crest-2-2026',
    source: 'trial',
    title: 'CREST-2: Carotid Revascularization and Medical Management for Asymptomatic Carotid Stenosis',
    year: 2026,
    url: 'https://www.nejm.org/doi/10.1056/NEJMoa2508800',
    pmid: '41269206',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'In the stenting trial, the 4-year primary composite of periprocedural stroke or death plus ipsilateral stroke occurred in 2.8% of patients in the carotid-artery stenting + intensive medical management group vs 6.0% in the medical-management-alone group (ARD −3.2 percentage points, 95% CI −5.9 to −0.6, P=0.02). In the endarterectomy trial, the corresponding rates were 3.7% vs 5.3% (ARD −1.6 pp, P=0.24).',
  },

  // ─── 2021 AHA/ASA Secondary Prevention — §5.3 Carotid Artery Disease ──────
  // Kleindorfer DO et al. 2021 Guideline for the Prevention of Stroke.
  // Section 5.3 covers carotid artery disease. Registered 2026-05-23 to
  // support the asymptomatic-carotid clinical synthesis card. (The §5.2.2
  // PFO entry is registered separately as aha-asa-2021-secondary-prevention-pfo.)
  'aha-asa-2021-secondary-prevention-carotid': {
    id: 'aha-asa-2021-secondary-prevention-carotid',
    source: 'guideline',
    title: '2021 AHA/ASA Secondary Prevention Guideline — §5.3 Carotid Artery Disease',
    year: 2021,
    section: '§5.3 Carotid Artery Disease',
    url: 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000375',
    pmid: '34024117',
    last_reviewed: '2026-05-23',
    quoted_text: 'In patients with asymptomatic extracranial internal carotid artery stenosis ≥70%, it may be reasonable to perform CEA in centers with low (<3%) periprocedural morbidity and mortality to prevent ipsilateral ischemic stroke (Class 2b, Level B-NR). The decision should incorporate patient comorbidities, life expectancy, patient preferences, and a discussion of risks and benefits of revascularization vs ongoing optimal medical management. Note: this 2021 wording predates CREST-2 (2026), which established that modern intensive medical management is the appropriate comparator and that CAS (not CEA) separated from medical management alone in the asymptomatic-stenosis population.',
  },

  // ─── 2022 AHA/ASA Spontaneous ICH Guideline — anticoagulant reversal ──────
  // Greenberg SM et al. 2022 Guideline for the Management of Patients With
  // Spontaneous Intracerebral Hemorrhage. Stroke 2022;53:e282–e361.
  // Registered 2026-05-23 to support the ich-anticoagulation-reversal
  // clinical synthesis card. Covers VKA reversal (4F-PCC + vitamin K),
  // dabigatran reversal (idarucizumab), FXa reversal (andexanet alfa or
  // 4F-PCC), and platelet transfusion (Class III: Harm for antiplatelet-
  // associated ICH outside of planned neurosurgery, per PATCH).
  // 6-month review window per §13.7.
  'aha-asa-2022-ich-anticoag-reversal': {
    id: 'aha-asa-2022-ich-anticoag-reversal',
    source: 'guideline',
    title: '2022 AHA/ASA Spontaneous ICH Guideline — Anticoagulant and antiplatelet reversal',
    year: 2022,
    section: '§7.3 Hemostatic Therapies',
    url: 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000407',
    pmid: '35579034',
    last_reviewed: '2026-05-23',
    quoted_text: 'For patients with VKA-associated ICH, 4-factor prothrombin complex concentrate is recommended over fresh frozen plasma to rapidly correct the international normalized ratio (Class 1, Level B-R). Vitamin K should be administered IV concurrently to maintain reversal. For dabigatran-associated ICH, idarucizumab is recommended (Class 1, Level B-NR). For FXa-inhibitor-associated ICH, andexanet alfa or 4F-PCC may be considered (Class 2b, Level C-LD). In patients with antiplatelet-associated ICH, platelet transfusions are considered harmful and should not be administered outside of a planned neurosurgical procedure (Class 3: Harm, Level B-R, citing the PATCH trial).',
  },

  // ─── 2020 AAO Retinal and Ophthalmic Artery Occlusions PPP ────────────────
  // Flaxel CJ et al. Retinal and Ophthalmic Artery Occlusions Preferred
  // Practice Pattern. Ophthalmology 2020. Open-access AAO PPP. Registered
  // 2026-05-23 to support the crao-management clinical synthesis card.
  // CRAO is positioned as a TIA-equivalent requiring urgent stroke-pathway
  // workup; no acute therapy has proven visual benefit.
  // 24-month review window per §13.7 (PPP cadence).
  'aao-2020-retinal-artery-occlusion': {
    id: 'aao-2020-retinal-artery-occlusion',
    source: 'guideline',
    title: 'American Academy of Ophthalmology — Retinal and Ophthalmic Artery Occlusions Preferred Practice Pattern (2020)',
    year: 2020,
    section: 'Acute CRAO management',
    url: 'https://www.aaojournal.org/article/S0161-6420(19)32226-5/fulltext',
    last_reviewed: '2026-05-23',
    review_window_months: 24,
    quoted_text: 'Central retinal artery occlusion should be considered a stroke equivalent. Patients with acute CRAO require urgent neurologic and cardiovascular evaluation to identify the source of embolism and to initiate appropriate secondary stroke prevention. No acute treatment has been definitively proven to restore vision in CRAO; historical interventions (ocular massage, anterior chamber paracentesis, IOP-lowering agents, hyperbaric oxygen, isovolemic hemodilution) lack high-quality randomized evidence of visual benefit and are not recommended as standard of care.',
  },

  // ─── EAGLE 2010 — intra-arterial fibrinolysis for CRAO (negative) ─────────
  // Schumacher M et al. Central Retinal Artery Occlusion: Local Intra-Arterial
  // Fibrinolysis Versus Conservative Treatment. Ophthalmology 2010;117:1367-1375.
  // Multicenter RCT of IA fibrinolysis vs conservative therapy for non-arteritic
  // CRAO. Stopped early after no efficacy signal and higher AE rate in the
  // intervention arm. Registered 2026-05-23 for the crao-management synthesis.
  // 36-month review window (landmark negative trial).
  'schumacher-eagle-crao-2010': {
    id: 'schumacher-eagle-crao-2010',
    source: 'trial',
    title: 'EAGLE: Central Retinal Artery Occlusion — Local Intra-Arterial Fibrinolysis Versus Conservative Treatment',
    year: 2010,
    url: 'https://www.aaojournal.org/article/S0161-6420(10)00078-9/fulltext',
    pmid: '20609991',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'EAGLE randomized 84 patients with non-arteritic CRAO to local intra-arterial fibrinolysis (rt-PA up to 50 mg) vs conservative standard therapy. The trial was stopped early after a planned interim analysis showed no significant difference in mean visual acuity change at 1 month (60.3% vs 57.1%) and a higher rate of adverse events in the IA fibrinolysis arm (37.1% vs 4.3%, primarily intracerebral hemorrhage and procedural complications). IA fibrinolysis is not recommended.',
  },

  // ─── CHARM 2024 — IV glibenclamide for large hemispheric infarct ──────────
  // Sheth KN et al. IV Glibenclamide for Cerebral Edema After Large Hemispheric
  // Stroke (CHARM). Lancet Neurology 2024. Phase 3 RCT in 535 patients with
  // large hemispheric infarction (ASPECTS 1-5 or DWI core 80-300 mL, age
  // 18-70). Primary mRS ordinal shift not met (cOR 1.17, 95% CI 0.80-1.71,
  // P=0.42). Stopped early for COVID-19 operational disruptions at ~71% of
  // planned enrollment; substantially underpowered. Hypoglycemia 6% vs 2%.
  // Registered 2026-05-24 to support the hemicraniectomy clinical-synthesis
  // card. 36-month review window per §13.7 (landmark negative trial).
  'sheth-charm-2024': {
    id: 'sheth-charm-2024',
    source: 'trial',
    title: 'CHARM: IV Glibenclamide for Cerebral Edema After Large Hemispheric Stroke',
    year: 2024,
    url: 'https://www.thelancet.com/journals/laneur/article/PIIS1474-4422(24)00407-3/abstract',
    last_reviewed: '2026-05-24',
    review_window_months: 36,
    quoted_text: 'In 535 patients with large hemispheric infarction (ASPECTS 1-5 or DWI core 80-300 mL, age 18-70), IV glibenclamide 8.6 mg over 72 hours did not improve 90-day mRS ordinal shift compared with placebo (cOR 1.17, 95% CI 0.80-1.71, P=0.42). Mortality was numerically higher with glibenclamide; hypoglycemia 6% vs 2%. Trial stopped early at ~71% of planned enrollment due to COVID-19 operational disruptions.',
  },

  // ─── 2026 AHA/ASA §6.3 — Supratentorial Infarction Surgical Management ────
  // Verbatim from src/data/aha2026StrokeGuideline.ts
  // acuteComplicationsRecommendations.brainSwelling[0-1]. Registered
  // 2026-05-24 for the hemicraniectomy clinical-synthesis card.
  'aha-asa-2026-6.3': {
    id: 'aha-asa-2026-6.3',
    source: 'guideline',
    title: '2026 AHA/ASA Guideline — §6.3 (Supratentorial Infarction — Surgical Management)',
    year: 2026,
    section: '§6.3 Supratentorial Infarction (Surgical Management)',
    url: 'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke',
    pmid: '41582814',
    last_reviewed: '2026-05-24',
    quoted_text: 'In patients with AIS and malignant cerebral edema who are candidates for surgical intervention, early decompressive hemicraniectomy should be used to reduce mortality and improve functional outcomes in patients ≤60 years of age (COR 1, LOE B-R). In patients with AIS and malignant cerebral edema, decompressive hemicraniectomy may be considered in patients >60 years of age, with individualized decision-making regarding functional outcomes (COR 2a, LOE B-R).',
  },

  // ─── 2021 AHA/ASA Secondary Prevention of Stroke Guideline — PFO closure ──
  // Kleindorfer DO et al. 2021 Guideline for the Prevention of Stroke in
  // Patients With Stroke and Transient Ischemic Attack. Stroke. 2021;52:e364-e467.
  // PMID: 34024117. DOI: 10.1161/STR.0000000000000375.
  //
  // Registered 2026-05-23 to support the PFO closure clinical-synthesis card.
  // The 2021 SP guideline (not the 2026 AIS guideline) is the governing source
  // for PFO closure recommendations — the 2026 AIS guideline does not address
  // PFO closure, which is a secondary-prevention question.
  //
  // The specific recommendation supporting the PFO closure cluster is the
  // Class IIa, Level B-R recommendation for non-lacunar ischemic stroke in
  // patients <60 years of age with PFO and no other apparent etiology.
  //
  // 6-month review window per §13.7 (current clinical guideline; aging — a
  // refresh against any newer secondary-prevention update should be flagged
  // by clinical-reviewer when the next AHA/ASA SP update publishes).
  'aha-asa-2021-secondary-prevention-pfo': {
    id: 'aha-asa-2021-secondary-prevention-pfo',
    source: 'guideline',
    title: '2021 AHA/ASA Secondary Prevention Guideline — PFO closure (Section 5.2.2)',
    year: 2021,
    section: '§5.2.2 Patent Foramen Ovale',
    url: 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000375',
    pmid: '34024117',
    last_reviewed: '2026-05-23',
    quoted_text: 'In patients 18 to 60 years of age with a nonlacunar ischemic stroke of undetermined cause despite a thorough evaluation and a PFO, the decision of percutaneous PFO closure should be made jointly by the patient, the cardiologist, and the neurologist, taking into account the probability of a causal role for the PFO. (Class 2a, Level B-R.)',
  },

  // ─── 2018 trial: foundational TNK-vs-alteplase comparison in the LVO-EVT pathway ─
  // Campbell BCV et al., NEJM 2018. Established TNK 0.25 mg/kg as the IVT agent
  // of first choice for EVT-eligible LVO patients within 4.5h. Verbatim quote
  // from NEJM PDF read by medical-scientist on 2026-05-20 (V supplied full text).
  // 36-month review window per §13.7 (landmark trial — foundational evidence
  // for the TNK lineage, now Class I Level A per AHA/ASA 2026 §4.6.2).
  'campbell-extend-ia-tnk-2018': {
    id: 'campbell-extend-ia-tnk-2018',
    source: 'trial',
    title: 'Tenecteplase versus Alteplase before Thrombectomy for Ischemic Stroke',
    year: 2018,
    url: 'https://www.nejm.org/doi/10.1056/NEJMoa1716405',
    pmid: '29694815',
    last_reviewed: '2026-05-20',
    review_window_months: 36,
    quoted_text: 'Tenecteplase before thrombectomy was associated with a higher incidence of reperfusion and better functional outcome than alteplase among patients with ischemic stroke treated within 4.5 hours after symptom onset.',
  },

  // ─── 2024 trial: andexanet alfa for FXa-inhibitor-associated acute ICH ────
  // Connolly SJ et al., NEJM 2024. First randomized trial of an FXa-inhibitor
  // antidote in acute ICH. DSMB-halted at pre-specified interim for hemostatic
  // efficacy. Verbatim quote from NEJM PDF read by medical-scientist on
  // 2026-05-20 (V supplied full text). 36-month review window per §13.7
  // (landmark trial — first FXa-inhibitor reversal RCT in acute ICH).
  'connolly-annexa-i-2024': {
    id: 'connolly-annexa-i-2024',
    source: 'trial',
    title: 'Andexanet for Factor Xa Inhibitor-Associated Acute Intracerebral Hemorrhage',
    year: 2024,
    url: 'https://www.nejm.org/doi/10.1056/NEJMoa2313040',
    pmid: '38749032',
    last_reviewed: '2026-05-20',
    review_window_months: 36,
    quoted_text: 'Among patients with intracerebral hemorrhage who were receiving factor Xa inhibitors, andexanet resulted in better control of hematoma expansion than usual care but was associated with thrombotic events, including ischemic stroke.',
  },

  // ─── 2024 FDA safety communication: Andexxa (andexanet alfa) risk-benefit ─
  // Following FDA Cellular, Tissue, and Gene Therapies Advisory Committee
  // review of the full ANNEXA-I dataset (Nov 2024), FDA concluded that the
  // serious risks (total thromboembolic events 14.6% vs 6.9%; thrombosis-
  // related death at day 30 2.5% vs 0.9%) outweighed the hemostatic benefit
  // observed in the published interim. FDA communicated this position to
  // AstraZeneca, which submitted a voluntary BLA withdrawal. 6-month review
  // window per §13.7 (active regulatory matter; status may evolve).
  'fda-andexxa-safety-2024': {
    id: 'fda-andexxa-safety-2024',
    source: 'guideline',
    title: 'Update on the Safety of Andexxa by AstraZeneca: FDA Safety Communication',
    year: 2024,
    section: 'Risk-benefit conclusion',
    url: 'https://www.fda.gov/safety/medical-product-safety-information/update-safety-andexxa-astrazeneca-fda-safety-communication',
    last_reviewed: '2026-05-24',
    review_window_months: 6,
    quoted_text: 'Since approval, the FDA has received postmarketing safety data on thromboembolic events, including serious and fatal outcomes, in patients treated with Andexxa. Based on available data, the serious risks including the increase in thromboembolic events are such that the FDA considers the risks of the product to outweigh its benefits. When the full data from ANNEXA-I were reviewed by the FDA Cellular, Tissue, and Gene Therapies Advisory Committee in November 2024, an increased incidence of thrombosis (14.6% versus 6.9%) and thrombosis-related deaths at Day 30 (2.5% versus 0.9%) was observed in the Andexxa arm compared with the usual care arm.',
  },

  // ─── 2025 AstraZeneca voluntary US market withdrawal of Andexxa ──────────
  // Following the FDA safety communication (fda-andexxa-safety-2024),
  // AstraZeneca confirmed end of US commercial sales effective December 22,
  // 2025. As of that date, andexanet alfa is no longer available to US
  // prescribers; 4F-PCC is the default FXa-inhibitor reversal in the US.
  // 12-month review window per §13.7 (regulatory status; may change if a
  // successor product enters the US market or if reintroduction is filed).
  'astrazeneca-andexxa-withdrawal-2025': {
    id: 'astrazeneca-andexxa-withdrawal-2025',
    source: 'guideline',
    title: 'Andexxa: AstraZeneca voluntary withdrawal from US market, effective December 22, 2025',
    year: 2025,
    url: 'https://www.tctmd.com/news/andexanet-alfa-pulled-us-market',
    last_reviewed: '2026-05-24',
    review_window_months: 12,
    quoted_text: 'AstraZeneca confirmed that it will end U.S. commercial sales of Andexxa (andexanet alfa) on December 22, 2025, following the FDA safety communication and submission of a request to voluntarily withdraw the BLA for commercial reasons.',
  },

  // ─── 2026 trial: CREST-2 — revascularization vs modern intensive medical management
  //     for asymptomatic high-grade carotid stenosis (two parallel RCTs) ───────────
  // Brott TG et al., NEJM 2026. Two parallel observer-blinded RCTs at 155 sites;
  // stenting trial primary met (P=0.02, ARD 3.2 pp, NNT 31), endarterectomy trial
  // not met (P=0.24). Closes the asymptomatic-carotid question against modern
  // intensive medical management (SBP <130, LDL <70, PCSK9 access). Verbatim
  // quote from NEJM PDF read by medical-scientist on 2026-05-20 (V supplied full
  // text). 36-month review window per §13.7 (landmark trial — defines the modern
  // asymptomatic-carotid management paradigm).
  'brott-crest-2-2025': {
    id: 'brott-crest-2-2025',
    source: 'trial',
    title: 'Medical Management and Revascularization for Asymptomatic Carotid Stenosis',
    year: 2026,
    url: 'https://www.nejm.org/doi/10.1056/NEJMoa2508800',
    pmid: '41269206',
    last_reviewed: '2026-05-20',
    review_window_months: 36,
    quoted_text: 'Among patients with high-grade stenosis without recent symptoms, the addition of stenting led to a lower risk of a composite of perioperative stroke or death or ipsilateral stroke within 4 years than intensive medical management alone. Carotid endarterectomy did not lead to a significant benefit.',
  },

  // ─── 2017 PFO closure cluster — three NEJM trials published together ─────
  //     CLOSE (Mas), RESPECT long-term (Saver), REDUCE (Søndergaard) — all in
  //     NEJM 2017;377(11), September 14, 2017 issue. Together they resolved a
  //     decade of pre-2017 PFO-closure ambiguity (CLOSURE-I 2012 negative,
  //     original RESPECT 2013 borderline, PC trial 2013 negative) and now
  //     support AHA/ASA 2021 Class IIa, Level B-R. All three verbatim quotes
  //     are from full-text NEJM PDFs read by medical-scientist on 2026-05-20
  //     (V supplied). 36-month review window per §13.7 (landmark trials).
  //     See docs/evidence-packets/{close,respect-longterm,reduce}-2017-2026-05-20.md
  'mas-close-2017': {
    id: 'mas-close-2017',
    source: 'trial',
    title: 'Patent Foramen Ovale Closure or Anticoagulation vs. Antiplatelets after Stroke',
    year: 2017,
    url: 'https://www.nejm.org/doi/10.1056/NEJMoa1705915',
    pmid: '28902593',
    last_reviewed: '2026-05-20',
    review_window_months: 36,
    quoted_text: 'Among patients who had had a recent cryptogenic stroke attributed to PFO with an associated atrial septal aneurysm or large interatrial shunt, the rate of stroke recurrence was lower among those assigned to PFO closure combined with antiplatelet therapy than among those assigned to antiplatelet therapy alone. PFO closure was associated with an increased risk of atrial fibrillation.',
  },
  'saver-respect-2017': {
    id: 'saver-respect-2017',
    source: 'trial',
    title: 'Long-Term Outcomes of Patent Foramen Ovale Closure or Medical Therapy after Stroke',
    year: 2017,
    url: 'https://www.nejm.org/doi/10.1056/NEJMoa1610057',
    pmid: '28902590',
    last_reviewed: '2026-05-20',
    review_window_months: 36,
    quoted_text: 'Among adults who had had a cryptogenic ischemic stroke, closure of a PFO was associated with a lower rate of recurrent ischemic strokes than medical therapy alone during extended follow-up.',
  },
  'sondergaard-reduce-2017': {
    id: 'sondergaard-reduce-2017',
    source: 'trial',
    title: 'Patent Foramen Ovale Closure or Antiplatelet Therapy for Cryptogenic Stroke',
    year: 2017,
    url: 'https://www.nejm.org/doi/10.1056/NEJMoa1707404',
    pmid: '28902580',
    last_reviewed: '2026-05-20',
    review_window_months: 36,
    quoted_text: 'Among patients with a PFO who had had a cryptogenic stroke, the risk of subsequent ischemic stroke was lower among those assigned to PFO closure combined with antiplatelet therapy than among those assigned to antiplatelet therapy alone; however, PFO closure was associated with higher rates of device complications and atrial fibrillation.',
  },

  // ─── PFO closure precursor trials (2012–2018) — added 2026-05-23 ──────────
  //     CLOSURE-I (2012), PC trial (2013), original RESPECT (2013), and
  //     DEFENSE-PFO (2018). These four trials frame the 2017 PFO cluster
  //     (CLOSE, REDUCE, RESPECT long-term) by establishing the pre-2017
  //     ambiguity (CLOSURE-I and PC negative; original RESPECT borderline
  //     P=0.08 at 2.1y) and the post-2017 high-risk-anatomy confirmation
  //     (DEFENSE-PFO). Verbatim quotes are from PubMed abstracts (open
  //     access). 36-month review windows per §13.7 (landmark trial
  //     precedents). NOTE: original RESPECT 2013 (carroll-respect-original)
  //     is DISTINCT from saver-respect-2017 (long-term extension) above —
  //     same trial, different publications and analyses.
  'furlan-closure-i-2012': {
    id: 'furlan-closure-i-2012',
    source: 'trial',
    title: 'Closure or Medical Therapy for Cryptogenic Stroke with Patent Foramen Ovale (CLOSURE I)',
    year: 2012,
    url: 'https://www.nejm.org/doi/10.1056/NEJMoa1009639',
    pmid: '22417252',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'In patients with cryptogenic stroke or TIA who had a patent foramen ovale, closure with a device did not offer a greater benefit than medical therapy alone for the prevention of recurrent stroke or TIA.',
  },
  'meier-pc-trial-2013': {
    id: 'meier-pc-trial-2013',
    source: 'trial',
    title: 'Percutaneous Closure of Patent Foramen Ovale in Cryptogenic Embolism (PC Trial)',
    year: 2013,
    url: 'https://www.nejm.org/doi/10.1056/NEJMoa1211716',
    pmid: '23514285',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'Closure of a patent foramen ovale for secondary prevention of cryptogenic embolism did not result in a significant reduction in the risk of recurrent embolic events or death as compared with medical therapy.',
  },
  'carroll-respect-original-2013': {
    id: 'carroll-respect-original-2013',
    source: 'trial',
    title: 'Closure of Patent Foramen Ovale versus Medical Therapy after Cryptogenic Stroke (RESPECT — original 2013 primary publication)',
    year: 2013,
    url: 'https://www.nejm.org/doi/10.1056/NEJMoa1301440',
    pmid: '23514286',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'In the primary intention-to-treat analysis, there was no significant benefit associated with closure of a patent foramen ovale in adults who had had a cryptogenic ischemic stroke.',
  },
  'lee-defense-pfo-2018': {
    id: 'lee-defense-pfo-2018',
    source: 'trial',
    title: 'Cryptogenic Stroke and High-Risk Patent Foramen Ovale: The DEFENSE-PFO Trial',
    year: 2018,
    url: 'https://www.jacc.org/doi/10.1016/j.jacc.2018.02.046',
    pmid: '29544871',
    last_reviewed: '2026-05-23',
    review_window_months: 36,
    quoted_text: 'PFO closure in patients with high-risk PFO characteristics resulted in a lower rate of the primary endpoint as well as stroke recurrence.',
  },

  // ─── IST (International Stroke Trial, 1997) — foundational aspirin RCT ───
  // Lancet 1997;349(9065):1569-1581. UK CTSU-led international factorial 2x2
  // trial of subcutaneous heparin (5000 IU or 12500 IU bd) and/or aspirin
  // 300 mg/d vs avoid, within 48h of suspected acute ischaemic stroke.
  // N=19,435. Pre-thrombolytic era foundational evidence. Paired with CAST
  // (1997) in Chen et al. 2000 pooled analysis (PMID 10835439) — the
  // canonical reference modern AHA/ASA guidelines cite for the Class I,
  // Level A early-aspirin recommendation. 36-month review window per §13.7
  // (landmark trial). See docs/evidence-packets/ist-1997-2026-05-20.md.
  'sandercock-ist-1997': {
    id: 'sandercock-ist-1997',
    source: 'trial',
    title: 'The International Stroke Trial (IST): a randomised trial of aspirin, subcutaneous heparin, both, or neither among 19 435 patients with acute ischaemic stroke',
    year: 1997,
    url: 'https://doi.org/10.1016/S0140-6736(97)04011-7',
    pmid: '9174558',
    last_reviewed: '2026-05-20',
    review_window_months: 36,
    quoted_text: 'Aspirin-allocated patients had significantly fewer recurrent ischaemic strokes within 14 days (2.8% vs 3.9%) with no significant excess of haemorrhagic strokes (0.9% vs 0.8%), so the reduction in death or non-fatal recurrent stroke with aspirin (11.3% vs 12.4%) was significant. Neither heparin regimen offered any clinical advantage at 6 months. Taking the IST together with the comparably large Chinese Acute Stroke Trial, aspirin produces a small but real reduction of about 10 deaths or recurrent strokes per 1000 during the first few weeks.',
  },

  // ─── CAST (Chinese Acute Stroke Trial, 1997) — foundational aspirin RCT ──
  // Lancet 1997;349(9066):1641-1649. Randomised double-blind placebo-
  // controlled trial of aspirin 160 mg/day vs placebo within 48h of acute
  // ischaemic stroke. N=21,106 across 413 Chinese hospitals. Paired with IST
  // in Chen et al. 2000 pooled analysis. 36-month review window per §13.7
  // (landmark trial). See docs/evidence-packets/cast-1997-2026-05-20.md.
  'cast-1997': {
    id: 'cast-1997',
    source: 'trial',
    title: 'CAST: randomised placebo-controlled trial of early aspirin use in 20 000 patients with acute ischaemic stroke',
    year: 1997,
    url: 'https://doi.org/10.1016/S0140-6736(97)04010-5',
    pmid: '9186381',
    last_reviewed: '2026-05-20',
    review_window_months: 36,
    quoted_text: 'There was a significant 14% (SD 7) proportional reduction in mortality during the scheduled treatment period (343 [3.3%] deaths among aspirin-allocated patients vs 398 [3.9%] deaths among placebo-allocated patients; 2p=0.04). There were significantly fewer recurrent ischaemic strokes in the aspirin-allocated than in the placebo-allocated group (167 [1.6%] vs 215 [2.1%]; 2p=0.01) but slightly more haemorrhagic strokes (115 [1.1%] vs 93 [0.9%]; 2p>0.1). For the combined in-hospital endpoint of death or non-fatal stroke at 4 weeks, there was a 12% (6) proportional risk reduction with aspirin (545 [5.3%] vs 614 [5.9%]; 2p=0.03), an absolute difference of 6.8 (3.2) fewer cases per 1000.',
  },

  // ─── THEIA (2025) — first phase 3 RCT of IV alteplase for non-arteritic CRAO
  // Lancet Neurology 2025;24(11):909-919. Préterre C, Gaultier A, Obadia M
  // et al. on behalf of the THEIA collaborators. 16 French stroke units;
  // N=70 (Snellen <20/400 CRAO within 4.5h); IV alteplase 0.9 mg/kg vs oral
  // aspirin 300 mg in a double-dummy, patient- and assessor-blinded design.
  // Neutral primary (underpowered) but safety reassuring (0 sICH). 36-month
  // review window per §13.7 (landmark RCT in a rare disease). Full PDF read
  // by medical-scientist on 2026-05-20; PMID confirmed via PubMed. See
  // docs/evidence-packets/theia-2026-05-20.md.
  'preterre-theia-2025': {
    id: 'preterre-theia-2025',
    source: 'trial',
    title: 'Intravenous alteplase versus oral aspirin for acute central retinal artery occlusion within 4·5 h of severe vision loss (THEIA): a multicentre, double-dummy, patient-blinded and assessor-blinded, randomised, controlled, phase 3 trial',
    year: 2025,
    url: 'https://doi.org/10.1016/S1474-4422(25)00308-4',
    pmid: '41109232',
    last_reviewed: '2026-05-20',
    review_window_months: 36,
    quoted_text: 'Among 56 patients with available data on the primary endpoint, 19 (66%) of 29 patients in the alteplase group and 13 (48%) of 27 patients in the aspirin group showed an improvement in visual acuity of at least 0·3 LogMAR at 1 month (unadjusted risk difference 17·4 [95% CI –11·8 to 46·5]; adjusted odds ratio 1·1 [95% CI 0·07 to 18·39]; p=0·95). One asymptomatic intracranial haemorrhage related to study treatment was reported in the alteplase group. No symptomatic haemorrhages or major bleeding related to study treatment were reported. Intravenous alteplase administered within 4·5 h of CRAO onset was not associated with a significant improvement in visual acuity compared with aspirin, despite a higher rate of improvement in the alteplase group. However, the study was likely underpowered to detect a statistical difference.',
  },

  // ─── AHA / NANOS 2021 Scientific Statement on CRAO management ────────────
  // Mac Grory B, et al. Stroke 2021;52:e282-e294. The pre-THEIA statement
  // that established "IV tPA may be considered" framing for disabling CRAO
  // and that CRAO triage belongs in the stroke pathway. THEIA does not
  // supersede this statement; the planned IPD meta-analysis (THEIA +
  // TenCRAOS + REVISION) is the path to level 1 evidence. 24-month review
  // window per §13.7 (guideline-statement currency; expect post-THEIA
  // update).
  'mac-grory-aha-nanos-crao-2021': {
    id: 'mac-grory-aha-nanos-crao-2021',
    source: 'guideline',
    title: 'Management of Central Retinal Artery Occlusion: A Scientific Statement From the American Heart Association',
    year: 2021,
    section: 'Treatment — Intravenous Thrombolysis',
    url: 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000366',
    pmid: '33677974',
    last_reviewed: '2026-05-20',
    review_window_months: 24,
    quoted_text: 'Acute CRAO is a medical emergency, and immediate triage to an emergency department capable of advanced stroke care is necessary. … Treatment with intravenous tissue plasminogen activator within 4.5 hours of symptom onset is suggested and may be considered for patients with disabling visual deficits who present early in the disease course and meet criteria for thrombolysis.',
  },

  // ─── PATCH (2016) — antiplatelet-ICH platelet-transfusion HARM trial ─────
  // Lancet 2016;387(10038):2605-2613. Baharoglu MI et al. PROBE design RCT
  // showing platelet transfusion INCREASES odds of death/dependence at 3
  // months (adjusted common OR 2.05, 95% CI 1.18-3.56, P=0.0114). The trial
  // that established AHA/ASA 2022 Class III: Harm against routine platelet
  // transfusion in antiplatelet-associated ICH. 36-month review window per
  // §13.7 (landmark trial). Verified against PubMed PMID 27178479 on
  // 2026-05-21. See docs/evidence-packets/patch-2016-2026-05-21.md.
  'baharoglu-patch-2016': {
    id: 'baharoglu-patch-2016',
    source: 'trial',
    title: 'Platelet transfusion versus standard care after acute stroke due to spontaneous cerebral haemorrhage associated with antiplatelet therapy (PATCH): a randomised, open-label, phase 3 trial',
    year: 2016,
    url: 'https://doi.org/10.1016/S0140-6736(16)30392-0',
    pmid: '27178479',
    last_reviewed: '2026-05-21',
    review_window_months: 36,
    quoted_text: 'The odds of death or dependence at 3 months were higher in the platelet transfusion group than in the standard care group (adjusted common odds ratio 2.05, 95% CI 1.18-3.56; p=0.0114). 40 (42%) participants who received platelets had a serious adverse event during their hospital stay, as did 28 (29%) who received standard care. 23 (24%) participants assigned to platelet transfusion and 16 (17%) assigned to standard care died during follow-up. Platelet transfusion seems inferior to standard care for people taking antiplatelet therapy before intracerebral haemorrhage. Platelet transfusion cannot be recommended for this indication in clinical practice.',
  },

  // ─── ANNEXA-4 (2019) — single-arm cohort behind FDA andexanet approval ───
  // NEJM 2019;380(14):1326-1335. Connolly SJ et al. Open-label single-arm
  // study of andexanet alfa in 352 patients with acute major bleeding on FXa
  // inhibitors (64% intracranial). Established hemostatic activity (82%
  // excellent/good at 12 h) and 92% anti-FXa reduction; supported FDA
  // accelerated approval. Subsequently confirmed in RCT by ANNEXA-I (2024).
  // 36-month review window per §13.7. Verified against PubMed PMID 30730782
  // and PMC6699827 on 2026-05-21. See
  // docs/evidence-packets/annexa-4-2019-2026-05-21.md.
  'connolly-annexa-4-2019': {
    id: 'connolly-annexa-4-2019',
    source: 'trial',
    title: 'Full Study Report of Andexanet Alfa for Bleeding Associated with Factor Xa Inhibitors',
    year: 2019,
    url: 'https://doi.org/10.1056/NEJMoa1814051',
    pmid: '30730782',
    last_reviewed: '2026-05-21',
    review_window_months: 36,
    quoted_text: 'A total of 352 patients were enrolled. The mean age of the patients was 77 years; most of the patients had substantial cardiovascular disease. Bleeding was predominantly intracranial (in 227 patients [64%]) or gastrointestinal (in 90 patients [26%]). In patients who had received apixaban, the median anti-factor Xa activity decreased from 149.7 ng per milliliter at baseline to 11.1 ng per milliliter after the andexanet bolus (92% reduction; 95% confidence interval [CI], 91 to 93); in patients who had received rivaroxaban, the median value decreased from 211.8 ng per milliliter to 14.2 ng per milliliter (92% reduction; 95% CI, 88 to 94). Excellent or good hemostasis occurred in 204 of 249 patients (82%) who could be evaluated. Within 30 days, death occurred in 49 patients (14%) and a thrombotic event in 34 (10%).',
  },

  // ─── Sarode 2013 — 4F-PCC vs FFP for VKA reversal in major bleeding ──────
  // Circulation 2013;128(11):1234-1243. Sarode R, Milling TJ Jr, Refaai MA
  // et al. Phase IIIb open-label noninferiority RCT (Kcentra/Beriplex vs
  // FFP) in 202 VKA-treated patients with major bleeding. Hemostatic
  // efficacy NI established (+7.1 pp, 95% CI -5.8 to +19.9; margin -10 pp).
  // INR <=1.3 at 30 min superior (+52.6 pp, 95% CI 39.4-65.9). Underwrites
  // FDA approval of Kcentra (April 2013) and AHA/ASA 2022 Class I, Level A
  // for 4F-PCC > FFP in VKA-associated ICH. 36-month review window per
  // §13.7. Verified against PubMed PMID 23935011 on 2026-05-21. See
  // docs/evidence-packets/sarode-2013-2026-05-21.md.
  'sarode-4fpcc-2013': {
    id: 'sarode-4fpcc-2013',
    source: 'trial',
    title: 'Efficacy and safety of a 4-factor prothrombin complex concentrate in patients on vitamin K antagonists presenting with major bleeding: a randomized, plasma-controlled, phase IIIb study',
    year: 2013,
    url: 'https://doi.org/10.1161/CIRCULATIONAHA.113.002283',
    pmid: '23935011',
    last_reviewed: '2026-05-21',
    review_window_months: 36,
    quoted_text: 'In the intention-to-treat efficacy population (4F-PCC n=98; plasma n=104), hemostatic efficacy was effective in 72.4% of subjects in the 4F-PCC group compared with 65.4% in the plasma group (difference, 7.1%; 95% confidence interval, -5.8 to 19.9). The primary end point of rapid INR reduction was achieved in significantly more subjects in the 4F-PCC group (62.2%) than in the plasma group (9.6%; difference, 52.6%; 95% confidence interval, 39.4 to 65.9). The safety profile (adverse events, serious adverse events, thromboembolic events, and deaths) was similar between groups; thromboembolic event rate was 7.8% with 4F-PCC and 6.4% with plasma. 4F-PCC is non-inferior to plasma for effective hemostasis and superior for rapid INR reduction in patients with major bleeding during vitamin K antagonist therapy.',
  },

  // ─── AHA/ASA 2022 ICH Guideline anchors for the reversal chain ───────────
  // Greenberg SM et al., Stroke 2022;53(7):e282-e361. Three sections cited
  // by the reversal-chain trial entries:
  //   §5.2.1 — 4F-PCC > FFP for VKA-associated ICH (Class I, Level A)
  //   §5.2.2 — andexanet alfa for FXa-inhibitor ICH (Class IIa, Level B-NR)
  //   §5.2.4 — platelet transfusion in antiplatelet-ICH is HARMFUL (Class III: Harm, Level B-R)
  // 24-month review window per §13.7 (current management guideline).
  'aha-asa-ich-2022-reversal': {
    id: 'aha-asa-ich-2022-reversal',
    source: 'guideline',
    title: '2022 Guideline for the Management of Patients With Spontaneous Intracerebral Hemorrhage — Anticoagulation and Antiplatelet Reversal',
    year: 2022,
    section: '5.2 — Reversal of Anticoagulant and Antiplatelet Agents',
    url: 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000407',
    pmid: '35579034',
    last_reviewed: '2026-05-21',
    review_window_months: 24,
    quoted_text: 'In patients with VKA-associated ICH with an elevated INR, 4-factor PCC may be preferred over FFP to improve moderate hemostatic correction and possibly clinical outcomes (Class 1, Level A). In patients with rivaroxaban-, apixaban-, or edoxaban-associated ICH, andexanet alfa can be useful for reversal (Class 2a, Level B-NR). In patients with ICH and a history of antiplatelet use, platelet transfusions should not be administered because they may worsen outcomes (Class 3: Harm, Level B-R).',
  },

  // ─── 2026 ACC/AHA Multisociety Dyslipidemia Guideline — §4.2.6 ──────────────
  // Blumenthal RS, Morris PB, Gaudino M, et al. Circulation 2026;153:e1154–e1276.
  // DOI: 10.1161/CIR.0000000000001423. Published April 28, 2026.
  // §4.2.6 governs secondary ASCVD prevention. Ischemic stroke is explicitly
  // listed as a major ASCVD event in Figure 10 (p e1210) and restated verbatim
  // in the §4.2.6 table footnote (p e1208). PMID pending PubMed indexing.
  // 6-month review window per §13.7 (current clinical guideline).
  // Registered 2026-05-24 for the SPARCL pearl LDL-C target refresh (Wave 1).
  'acc-aha-dyslipidemia-2026-4.2.6-vhr': {
    id: 'acc-aha-dyslipidemia-2026-4.2.6-vhr',
    source: 'guideline',
    title: '2026 ACC/AHA Multisociety Cholesterol Guideline — §4.2.6 Recommendation #5 (Very-High-Risk ASCVD: ezetimibe/PCSK9 escalation to LDL-C <55 mg/dL)',
    year: 2026,
    section: '§4.2.6 Recommendation #5, p e1208',
    url: 'https://doi.org/10.1161/CIR.0000000000001423',
    last_reviewed: '2026-05-24',
    review_window_months: 6,
    quoted_text: 'In adults with clinical ASCVD who are at very high risk and on maximally tolerated statin therapy, ezetimibe and/or a PCSK9 mAb should be added (selected based on the degree of LDL-C lowering needed and patient preference) to achieve a goal of LDL-C <55 mg/dL (1.4 mmol/L) and non–HDL-C <85 mg/dL (2.2 mmol/L) to reduce risk of ASCVD events.',
  },
  'acc-aha-dyslipidemia-2026-4.2.6-not-vhr': {
    id: 'acc-aha-dyslipidemia-2026-4.2.6-not-vhr',
    source: 'guideline',
    title: '2026 ACC/AHA Multisociety Cholesterol Guideline — §4.2.6 Recommendation #1 (Non-VHR Clinical ASCVD: high-intensity statin + LDL-C <70 mg/dL)',
    year: 2026,
    section: '§4.2.6 Recommendation #1, p e1208',
    url: 'https://doi.org/10.1161/CIR.0000000000001423',
    last_reviewed: '2026-05-24',
    review_window_months: 6,
    quoted_text: 'In adults with clinical ASCVD who are not at very high risk (Figure 10), high-intensity statin therapy should be initiated to achieve a ≥50% reduction in LDL-C and a goal of LDL-C <70 mg/dL (1.8 mmol/L) and non–HDL-C <100 mg/dL to reduce the risk of recurrent events.',
  },
  'acc-aha-dyslipidemia-2026-4.2.6-pcsk9-seq': {
    id: 'acc-aha-dyslipidemia-2026-4.2.6-pcsk9-seq',
    source: 'guideline',
    title: '2026 ACC/AHA Multisociety Cholesterol Guideline — §4.2.6 Synopsis (PCSK9 sequencing change vs 2018: ezetimibe no longer required to precede PCSK9 mAb)',
    year: 2026,
    section: '§4.2.6 Synopsis, p e1208',
    url: 'https://doi.org/10.1161/CIR.0000000000001423',
    last_reviewed: '2026-05-24',
    review_window_months: 6,
    quoted_text: "Since the '2018 Guideline for the Management of Blood Cholesterol' was published, extended safety data for PCSK9 mAb have been reported, and the cost has decreased substantially. Accordingly, the revised recommendations no longer require that ezetimibe be added to statin therapy prior to initiating a PCSK9 mAb, and consideration of therapy may be based on the degree of LDL-C required and patient preference.",
  },
  'acc-aha-dyslipidemia-2026-fig10': {
    id: 'acc-aha-dyslipidemia-2026-fig10',
    source: 'guideline',
    title: '2026 ACC/AHA Multisociety Cholesterol Guideline — Figure 10 / §4.2.6 footnote (very-high-risk ASCVD definition; ischemic stroke is a major ASCVD event)',
    year: 2026,
    section: '§4.2.6 Table footnote, p e1208 (reflecting Figure 10, p e1210)',
    url: 'https://doi.org/10.1161/CIR.0000000000001423',
    last_reviewed: '2026-05-24',
    review_window_months: 6,
    quoted_text: 'The majority of patients with clinical ASCVD are likely to be at very high risk. Very high risk includes a history of multiple major ASCVD events (ACS within past 12 months, history of MI [other than ACS above] history of ischemic stroke, symptomatic PAD) or 1 major ASCVD event and multiple high-risk conditions (age >65 years of age, coronary artery revascularization, current smoker, diabetes, history of HF, hypertension, LDL-C >100 mg/dL despite maximally tolerated statin + ezetimibe).',
  },

  // ─── 2026 ACC/AHA Dyslipidemia §4.2.6 — Wave 2 (bempedoic acid, inclisiran, ICH arm) ──

  'acc-aha-dyslipidemia-2026-4.2.6-addon-not-vhr': {
    id: 'acc-aha-dyslipidemia-2026-4.2.6-addon-not-vhr',
    source: 'guideline',
    title: '2026 ACC/AHA Dyslipidemia Guideline — §4.2.6 Recommendation #2 (Non-VHR: ezetimibe/PCSK9 mAb/bempedoic acid add-on to LDL-C <70 mg/dL)',
    year: 2026,
    section: '§4.2.6 Recommendation #2, p e1208',
    url: 'https://doi.org/10.1161/CIR.0000000000001423',
    last_reviewed: '2026-05-25',
    review_window_months: 6,
    quoted_text: 'In adults with clinical ASCVD who are not at very high risk and on maximally tolerated statin therapy, it is reasonable to add ezetimibe, a PCSK9 mAb, or bempedoic acid (selection depending on degree of LDL-C lowering needed and patient preference) to achieve a goal of LDL-C <70 mg/dL (1.8 mmol/L) and non–HDL-C <100 mg/dL to reduce the risk of ASCVD events.',
  },

  'acc-aha-dyslipidemia-2026-4.2.6-bempedoic-vhr': {
    id: 'acc-aha-dyslipidemia-2026-4.2.6-bempedoic-vhr',
    source: 'guideline',
    title: '2026 ACC/AHA Dyslipidemia Guideline — §4.2.6 Recommendation #6 (VHR: bempedoic acid add-on to LDL-C <55 mg/dL, COR 2a)',
    year: 2026,
    section: '§4.2.6 Recommendation #6, p e1208',
    url: 'https://doi.org/10.1161/CIR.0000000000001423',
    last_reviewed: '2026-05-25',
    review_window_months: 6,
    quoted_text: 'In adults with clinical ASCVD who are at very high risk and on maximally tolerated statin therapy, it is reasonable to add bempedoic acid, with or without ezetimibe and/or PCSK9 mAb, to reach an LDL-C goal <55 mg/dL (1.4 mmol/L) and non–HDL-C <85 mg/dL (2.2 mmol/L) to reduce the risk of ASCVD events.',
  },

  'acc-aha-dyslipidemia-2026-4.2.6-inclisiran': {
    id: 'acc-aha-dyslipidemia-2026-4.2.6-inclisiran',
    source: 'guideline',
    title: '2026 ACC/AHA Dyslipidemia Guideline — §4.2.6 Recommendation #7 (VHR: inclisiran for PCSK9 mAb-intolerant, COR 2a; no completed CVOT)',
    year: 2026,
    section: '§4.2.6 Recommendation #7, p e1208',
    url: 'https://doi.org/10.1161/CIR.0000000000001423',
    last_reviewed: '2026-05-25',
    review_window_months: 6,
    quoted_text: 'In adults with clinical ASCVD who are at very high risk and on maximally tolerated statin therapy with or without ezetimibe, it is reasonable to add inclisiran in those unable to tolerate evolocumab or alirocumab or have a strong preference for less frequent dosing to achieve an LDL-C goal <55 mg/dL (1.4 mmol/L) and non–HDL-C <85 mg/dL (2.2 mmol/L).',
  },

  'aha-asa-ich-2022-statin': {
    id: 'aha-asa-ich-2022-statin',
    source: 'guideline',
    title: '2022 AHA/ASA Guideline for Spontaneous Intracerebral Hemorrhage — Statin Therapy (COR 2b, LOE B-NR)',
    year: 2022,
    section: 'Cardiovascular Prevention',
    url: 'https://doi.org/10.1161/STR.0000000000000407',
    last_reviewed: '2026-05-25',
    review_window_months: 6,
    quoted_text: 'In patients with spontaneous ICH and an established indication for statin pharmacotherapy, the risks and benefits of statin therapy on ICH outcomes and recurrence relative to overall prevention of cardiovascular events are uncertain.',
  },

  'teoh-2019-statin-stroke-ich': {
    id: 'teoh-2019-statin-stroke-ich',
    source: 'review',
    title: 'Statin Therapy and Hemorrhagic Stroke Risk in Stroke Survivors — Meta-Analysis (Teoh et al., Ther Adv Neurol Disord 2019)',
    year: 2019,
    section: 'Ther Adv Neurol Disord 2019;12',
    url: 'https://journals.sagepub.com/doi/10.1177/1756286419864830',
    pmid: '31384308',
    last_reviewed: '2026-05-25',
    review_window_months: 36,
    quoted_text: '17 randomized controlled trials (n=11,576) of statin therapy in stroke survivors: statin therapy was associated with a significant increase in ICH risk (RR 1.42, 95% CI 1.07–1.87) and a significant reduction in ischemic stroke risk (RR 0.85, 95% CI 0.75–0.95). Trial sequential analysis indicated the ICH evidence was conclusive.',
  },

  // ─── Headache / Migraine citations ─────────────────────────────────────────

  'robblee-ahs-2025': {
    id: 'robblee-ahs-2025',
    source: 'guideline',
    title: 'AHS Consensus Statement — Acute Treatment of Migraine in Adults (Robblee et al., Headache 2026;66:53–76)',
    year: 2025,
    section: 'Full guideline; published online 2025, print Headache 2026;66:53–76',
    url: 'https://doi.org/10.1111/head.70016',
    last_reviewed: '2026-05-25',
    review_window_months: 6,
    quoted_text: 'Level A: Prochlorperazine (Must Offer), GONB (Must Offer), Lasmiditan (Must Offer — no driving 8 h), Dihydroergotamine (Must Offer), Opioids/Tramadol (Must NOT Offer). Level B: Metoclopramide, Ketorolac, Diphenhydramine, SONB, Dexamethasone (recurrence prevention). Level C: Dexamethasone (acute pain). Level U: Magnesium (IV; insufficient evidence; may benefit aura/photophobia subgroup).',
  },

  'ailani-ahs-2021': {
    id: 'ailani-ahs-2021',
    source: 'guideline',
    title: 'AHS Consensus Statement — CGRP Pathway and Migraine Prevention (Ailani et al., Headache 2021;61:1021–1039)',
    year: 2021,
    section: 'Full consensus statement',
    url: 'https://doi.org/10.1111/head.14153',
    pmid: '34128230',
    last_reviewed: '2026-05-25',
    review_window_months: 6,
    quoted_text: 'Preventive therapy threshold: ≥4 migraine days/month with disability, or ≥6 migraine days/month regardless of disability, or prior failure of ≥2 adequate preventive trials. Gepants (atogepant, rimegepant) do not cause medication-overuse headache (MOH) and are preferred for patients with MOH or at high MOH risk. CGRP mAbs: erenumab, fremanezumab, galcanezumab, eptinezumab — first-line for patients meeting preventive threshold. Escalation to calcitonin gene-related peptide (CGRP) mAb recommended after failure of ≥2 conventional preventive trials.',
  },

  'burch-2024-continuum-acute': {
    id: 'burch-2024-continuum-acute',
    source: 'review',
    title: 'Acute Treatment of Migraine (Burch, Continuum 2024;30(2):316–366)',
    year: 2024,
    section: 'Continuum 2024;30(2):316–366',
    url: 'https://doi.org/10.1212/CON.0000000000001411',
    last_reviewed: '2026-05-25',
    review_window_months: 12,
    quoted_text: 'Stepwise acute treatment: NSAIDs and triptans remain first-line. Gepants (rimegepant, ubrogepant) and ditans (lasmiditan) are established second-line options without triptan contraindications applying. IV DHE remains highly effective for refractory ED migraine. Combination therapy (antiemetic + analgesic ± DHE) outperforms monotherapy in refractory presentations.',
  },

  'burish-2024-continuum-cluster': {
    id: 'burish-2024-continuum-cluster',
    source: 'review',
    title: 'Cluster Headache, SUNCT, and SUNA (Burish, Continuum 2024;30(2):396–416)',
    year: 2024,
    section: 'Continuum 2024;30(2):396–416',
    url: 'https://doi.org/10.1212/CON.0000000000001412',
    last_reviewed: '2026-05-25',
    review_window_months: 12,
    quoted_text: 'Cluster headache acute treatment: high-flow O₂ 100% (12–15 L/min via non-rebreather, 15–20 min) and SC sumatriptan 6 mg are Level A. Greater occipital nerve (GON) block with corticosteroid is effective bridging therapy (AHS Grade A) during cluster bouts. Transitional therapy with suboccipital steroid injection recommended at bout onset. Verapamil is first-line prophylaxis. SUNCT/SUNA: lamotrigine first-line prevention; carbamazepine second-line.',
  },

  'nahas-2024-continuum-cranial-neuralgias': {
    id: 'nahas-2024-continuum-cranial-neuralgias',
    source: 'review',
    title: 'Cranial Neuralgias (Nahas & Sanguinetti, Continuum 2024;30(2):510–536)',
    year: 2024,
    section: 'Continuum 2024;30(2):510–536',
    url: 'https://doi.org/10.1212/CON.0000000000001414',
    last_reviewed: '2026-05-25',
    review_window_months: 12,
    quoted_text: 'Trigeminal neuralgia (TN): carbamazepine (Level A) or oxcarbazepine (Level B) first-line. For refractory TN in acute exacerbation: IV fosphenytoin or IV lidocaine (short-term stabilisation). NVAF TN variant: phenytoin/carbamazepine. Occipital neuralgia: greater and/or lesser GON blocks first-line. Glossopharyngeal neuralgia: carbamazepine; airway protection mandatory if swallowing affected.',
  },

  'rizzoli-2024-continuum-moh': {
    id: 'rizzoli-2024-continuum-moh',
    source: 'review',
    title: 'Medication-Overuse Headache (Rizzoli, Continuum 2024;30(2):379–390)',
    year: 2024,
    section: 'Continuum 2024;30(2):379–390',
    url: 'https://doi.org/10.1212/CON.0000000000001413',
    last_reviewed: '2026-05-25',
    review_window_months: 12,
    quoted_text: 'Medication-overuse headache (MOH) defined as headache on ≥15 days/month for >3 months with overuse of acute treatments. Triptans and ergotamines cause MOH at >10 days/month use; NSAIDs at >15 days/month. Gepants (ubrogepant, rimegepant, atogepant) do not cause MOH per current evidence and are preferred in MOH-risk patients. Withdrawal is mainstay treatment; abrupt for triptans, gradual for opioids/barbiturates.',
  },

  'goadsby-2024-continuum-indomethacin': {
    id: 'goadsby-2024-continuum-indomethacin',
    source: 'review',
    title: 'Indomethacin-Responsive Headache Disorders (Goadsby & Cittadini, Continuum 2024;30(2):437–450)',
    year: 2024,
    section: 'Continuum 2024;30(2):437–450',
    url: 'https://doi.org/10.1212/CON.0000000000001415',
    last_reviewed: '2026-05-25',
    review_window_months: 12,
    quoted_text: 'Hemicrania continua and paroxysmal hemicrania: absolute indomethacin response is diagnostic. Indomethacin 25 mg TID, titrate to 75–150 mg/day. Indomethacin response failure should prompt re-evaluation of diagnosis. SUNHA responds to indomethacin in subset. Consider PPI co-prescription to reduce GI adverse effects.',
  },

  'lipton-2024-continuum-preventive': {
    id: 'lipton-2024-continuum-preventive',
    source: 'review',
    title: 'Preventive Treatment of Migraine (Lipton & Silberstein, Continuum 2024;30(2):367–378)',
    year: 2024,
    section: 'Continuum 2024;30(2):367–378',
    url: 'https://doi.org/10.1212/CON.0000000000001410',
    last_reviewed: '2026-05-25',
    review_window_months: 12,
    quoted_text: 'Preventive treatment indicated when ≥4 migraine days/month with disability OR ≥6 migraine days/month regardless of disability OR acute medications used ≥10 days/month. CGRP pathway therapies (mAbs and gepants) are first-line for patients who have failed or cannot tolerate conventional preventives. Conventional preventives: topiramate, valproate (avoid in women of childbearing potential), propranolol, metoprolol, amitriptyline, venlafaxine. OnabotulinumtoxinA approved for chronic migraine only.',
  },
};
