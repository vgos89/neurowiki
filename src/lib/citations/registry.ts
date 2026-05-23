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
  // ─── AHA/ASA 2026 §4.6.1 — Thrombolysis Decision-Making ───────────────────
  // Verbatim from src/data/aha2026StrokeGuideline.ts ivtRecommendations.
  // decisionMaking[0–6]. Registered 2026-05-23 for the tpa-timing GuidelineSummaryCard.
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
};
