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
    section: '§4.5',
    url: 'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke',
    last_reviewed: '2026-05-19',
    quoted_text: 'Intensive glucose control to a target of 80–130 mg/dL provides no benefit over standard control (140–180 mg/dL) and increases hypoglycemia risk (Class III: No Benefit, Level A).',
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
    last_reviewed: '2026-05-19',
    quoted_text: 'Endovascular thrombectomy is recommended for patients with anterior-circulation large vessel occlusion and ASPECTS 3–5 within 24 hours of last known well (Class I, Level A). For ASPECTS 0–2 within 6 hours, thrombectomy is reasonable in selected patients (Class IIa, Level B-R).',
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
};
