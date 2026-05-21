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
};
