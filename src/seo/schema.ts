/**
 * JSON-LD structured data for SEO. Injected per-route to help Google understand
 * medical content and enable rich results (e.g. MedicalWebPage, SoftwareApplication,
 * BreadcrumbList, FAQPage).
 */

import { TRIAL_DATA } from '../data/trialData';

const BASE_URL = 'https://neurowiki.ai';
const LAST_REVIEWED = '2026-02-18';

// ── Shared publisher/provider block ──────────────────────────────────────────
const PUBLISHER = {
  '@type': 'Organization',
  name: 'NeuroWiki',
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.png`,
};

// ── Organization schema (homepage) ───────────────────────────────────────────
const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NeuroWiki',
  description: 'Free neurology protocols, calculators, and clinical guidelines for neurologists and residents. Built on AHA/ASA 2026 stroke guidelines.',
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.png`,
  sameAs: [],
  foundingDate: '2024',
};

// ── Hub page schemas ──────────────────────────────────────────────────────────

const CALCULATORS_HUB_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Neurology Calculators — NIHSS, ICH Score, GCS & More | NeuroWiki',
      description: 'Free online neurology calculators: NIHSS, ICH Score, ABCD2, GCS, HAS-BLED, RoPE, Heidelberg, Boston Criteria 2.0. Stroke and neurocritical care tools for physicians.',
      url: `${BASE_URL}/calculators`,
      audience: { '@type': 'MedicalAudience', audienceType: 'Physician, Neurologist, Resident' },
      publisher: PUBLISHER,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Calculators', item: `${BASE_URL}/calculators` },
      ],
    },
    {
      '@type': 'ItemList',
      name: 'Neurology Clinical Calculators',
      description: 'Free neurology calculators for stroke, hemorrhage, TIA, and neurocritical care.',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'NIHSS Calculator', url: `${BASE_URL}/calculators/nihss` },
        { '@type': 'ListItem', position: 2, name: 'ICH Score Calculator', url: `${BASE_URL}/calculators/ich-score` },
        { '@type': 'ListItem', position: 3, name: 'ABCD² Score Calculator', url: `${BASE_URL}/calculators/abcd2-score` },
        { '@type': 'ListItem', position: 4, name: 'Glasgow Coma Scale', url: `${BASE_URL}/calculators/glasgow-coma-scale` },
        { '@type': 'ListItem', position: 5, name: 'HAS-BLED Score', url: `${BASE_URL}/calculators/has-bled-score` },
        { '@type': 'ListItem', position: 6, name: 'RoPE Score', url: `${BASE_URL}/calculators/rope-score` },
        { '@type': 'ListItem', position: 7, name: 'EVT Eligibility Pathway', url: `${BASE_URL}/calculators/evt-pathway` },
        { '@type': 'ListItem', position: 8, name: 'ELAN Anticoagulation Pathway', url: `${BASE_URL}/calculators/elan-pathway` },
        { '@type': 'ListItem', position: 9, name: 'Status Epilepticus Pathway', url: `${BASE_URL}/calculators/se-pathway` },
      ],
    },
  ],
};

const GUIDE_HUB_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Neurology Resident Guide — Protocols & Clinical Reference | NeuroWiki',
      description: 'Neurology protocols and clinical guides for residents, attendings, and medical students.',
      url: `${BASE_URL}/guide`,
      audience: { '@type': 'MedicalAudience', audienceType: 'Physician, Neurologist, Resident' },
      publisher: PUBLISHER,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Clinical Guides', item: `${BASE_URL}/guide` },
      ],
    },
  ],
};

const TRIALS_HUB_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Stroke Clinical Trials — Evidence Summaries for Neurologists | NeuroWiki',
      description: 'Summaries of 79 landmark stroke clinical trials: DAWN, DEFUSE-3, NINDS, ORIGINAL, MR CLEAN, INSPIRES, ENRICH, TRACE-III, ELAN, CHANCE, POINT, and more. NNT, mRS outcomes, AHA/ASA 2026 guideline recommendations.',
      url: `${BASE_URL}/trials`,
      medicalSpecialty: 'Neurology',
      audience: { '@type': 'MedicalAudience', audienceType: 'Physician, Neurologist, Resident' },
      publisher: PUBLISHER,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Clinical Trials', item: `${BASE_URL}/trials` },
      ],
    },
    {
      '@type': 'ItemList',
      name: 'Landmark Stroke Clinical Trials',
      description: 'Evidence summaries for 79 landmark vascular neurology trials covering thrombolysis, thrombectomy, secondary prevention, and surgical interventions.',
      itemListElement: [
        { '@type': 'ListItem', position: 1,  name: 'NINDS Trial — IV tPA 3-hour window',                  url: `${BASE_URL}/trials/ninds-trial` },
        { '@type': 'ListItem', position: 2,  name: 'DAWN Trial — late-window thrombectomy 6–24h',         url: `${BASE_URL}/trials/dawn-trial` },
        { '@type': 'ListItem', position: 3,  name: 'DEFUSE-3 — perfusion-selected EVT 6–16h',             url: `${BASE_URL}/trials/defuse-3-trial` },
        { '@type': 'ListItem', position: 4,  name: 'ORIGINAL — tenecteplase vs alteplase',                url: `${BASE_URL}/trials/original-trial` },
        { '@type': 'ListItem', position: 5,  name: 'TRACE-III — late-window tenecteplase',                url: `${BASE_URL}/trials/trace-iii-trial` },
        { '@type': 'ListItem', position: 6,  name: 'MR CLEAN — first modern thrombectomy trial',          url: `${BASE_URL}/trials/mr-clean-trial` },
        { '@type': 'ListItem', position: 7,  name: 'SELECT-2 — large core EVT (ASPECTS 3–5)',             url: `${BASE_URL}/trials/select2-trial` },
        { '@type': 'ListItem', position: 8,  name: 'ANGEL-ASPECT — large core EVT',                      url: `${BASE_URL}/trials/angel-aspect-trial` },
        { '@type': 'ListItem', position: 9,  name: 'LASTE — large core thrombectomy',                     url: `${BASE_URL}/trials/laste-trial` },
        { '@type': 'ListItem', position: 10, name: 'TENSION — large core EVT (non-contrast CT)',          url: `${BASE_URL}/trials/tension-trial` },
        { '@type': 'ListItem', position: 11, name: 'ELAN — DOAC timing after cardioembolic stroke',       url: `${BASE_URL}/trials/elan-study` },
        { '@type': 'ListItem', position: 12, name: 'CHANCE — dual antiplatelet minor stroke/TIA',         url: `${BASE_URL}/trials/chance-trial` },
        { '@type': 'ListItem', position: 13, name: 'POINT — clopidogrel + aspirin after TIA',             url: `${BASE_URL}/trials/point-trial` },
        { '@type': 'ListItem', position: 14, name: 'INSPIRES — DAPT within 72h atherosclerotic stroke',   url: `${BASE_URL}/trials/inspires-trial` },
        { '@type': 'ListItem', position: 15, name: 'ENRICH — minimally invasive ICH surgery',             url: `${BASE_URL}/trials/enrich-trial` },
        { '@type': 'ListItem', position: 16, name: 'WAKE-UP — MRI-guided wake-up stroke thrombolysis',    url: `${BASE_URL}/trials/wake-up-trial` },
        { '@type': 'ListItem', position: 17, name: 'ECASS-3 — alteplase 3–4.5h extended window',          url: `${BASE_URL}/trials/ecass3-trial` },
        { '@type': 'ListItem', position: 18, name: 'RAISE — reteplase vs alteplase thrombolysis',         url: `${BASE_URL}/trials/raise-trial` },
        { '@type': 'ListItem', position: 19, name: 'BEST-MSU — mobile stroke unit trial',                 url: `${BASE_URL}/trials/best-msu-trial` },
        { '@type': 'ListItem', position: 20, name: 'SPARCL — high-dose statin after stroke',              url: `${BASE_URL}/trials/sparcl-trial` },
      ],
    },
  ],
};

// ── FAQ data for high-value pages ─────────────────────────────────────────────
const PAGE_FAQS: Record<string, Array<{ question: string; answer: string }>> = {
  '/calculators/nihss': [
    {
      question: 'What is the NIHSS calculator used for?',
      answer: 'The NIHSS (NIH Stroke Scale) calculator quantifies stroke severity across 11 domains — consciousness, gaze, visual fields, facial palsy, motor arm/leg, limb ataxia, sensory, language, dysarthria, and extinction. Scores range 0–42; higher scores indicate greater deficits. It guides tPA and EVT eligibility and predicts outcomes.',
    },
    {
      question: 'What NIHSS score qualifies for IV thrombolysis?',
      answer: 'Most guidelines do not set a minimum NIHSS for tPA eligibility; even minor deficits may be disabling. However, a score of 0–1 with non-disabling symptoms is often treated medically. NIHSS ≥4–6 is typically required for EVT eligibility in the early window.',
    },
    {
      question: 'How often should NIHSS be performed?',
      answer: 'NIHSS should be performed at baseline (prior to treatment), at 24 hours post-treatment, at discharge, and at 90-day follow-up per AHA/ASA guidelines. During active intervention, hourly assessments may be warranted.',
    },
  ],
  '/calculators/evt-pathway': [
    {
      question: 'Who is eligible for EVT (mechanical thrombectomy)?',
      answer: 'Per AHA/ASA 2026 guidelines, EVT is indicated for acute ischemic stroke from a large vessel occlusion (LVO) involving the internal carotid artery, M1 or M2 segment of the middle cerebral artery, or basilar artery, in patients with pre-stroke mRS 0–2. Within the first 6 hours, EVT is indicated regardless of ASPECTS score. In the extended 6–24 hour window, EVT requires clinical-imaging mismatch (DAWN criteria) or perfusion mismatch (DEFUSE-3 criteria). A major 2026 update: large core infarct (ASPECTS 3–5) is now a COR 1 indication based on SELECT-2 and ANGEL-ASPECT trials, demonstrating benefit even with large established infarcts. NIHSS ≥6 is a common practical threshold, though lower scores with disabling deficits may also qualify. Patient age alone is not an exclusion criterion.',
    },
    {
      question: 'What is the EVT time window for stroke thrombectomy?',
      answer: 'The EVT time window has two phases. The early window (0–6 hours from last known well) permits thrombectomy for any LVO without perfusion imaging requirements; ASPECTS does not preclude eligibility. The extended window (6–24 hours) requires additional imaging: DAWN criteria (clinical-imaging mismatch — infarct core ≤51 mL for age ≥80 or ≤31 mL for NIHSS ≥10 and age <80) or DEFUSE-3 criteria (core <70 mL, mismatch ratio ≥1.8, mismatch volume ≥15 mL). For basilar artery occlusion, EVT can be considered up to 24 hours based on ATTENTION and BAOCHE trials. Wake-up stroke with favorable perfusion imaging also qualifies at experienced centers. Every 30-minute reduction in time-to-reperfusion significantly improves functional outcomes — time is neurons.',
    },
    {
      question: 'What ASPECTS score is required for mechanical thrombectomy?',
      answer: 'ASPECTS (Alberta Stroke Program Early CT Score) quantifies early ischemic changes across 10 MCA territory regions on non-contrast CT, scored 0–10 (lower = larger core). For early window EVT (0–6 hours), the 2026 AHA/ASA guidelines set no minimum ASPECTS cutoff; even low-ASPECTS patients may benefit. For the extended window, ASPECTS ≥6 was required in the original DAWN and DEFUSE-3 trials. A landmark update: large core infarct (ASPECTS 3–5) is now COR 1 based on SELECT-2 (NEJM 2023) and ANGEL-ASPECT (NEJM 2023), which showed clinical benefit despite large established infarcts. ASPECTS 0–2 remains a relative contraindication given very high hemorrhage risk. CT perfusion or MRI DWI provides more accurate core volume assessment than ASPECTS alone in borderline cases.',
    },
    {
      question: 'Should IV tPA be given before EVT (bridging therapy)?',
      answer: 'IV thrombolysis before EVT — known as bridging therapy — is recommended when the patient is eligible for both treatments. Per AHA/ASA 2026 guidelines, IV alteplase or tenecteplase should not be withheld in tPA-eligible patients who also qualify for EVT. Giving tPA first does not significantly delay thrombectomy and may improve recanalization of distal emboli. Multiple trials (MR CLEAN-NOIV, SKIP, DIRECT-MT) tested direct EVT versus bridging; pooled data favor bridging for most patients. Tenecteplase is increasingly preferred over alteplase for its single-bolus administration and superior vessel recanalization. Door-to-needle target is <60 minutes and must not delay door-to-puncture target of <90 minutes. In patients with clear tPA contraindications (recent surgery, therapeutic anticoagulation), direct EVT is performed without bridging.',
    },
    {
      question: 'What is the procedure for mechanical thrombectomy (EVT)?',
      answer: 'Mechanical thrombectomy is a minimally invasive endovascular procedure performed by a neurointerventionalist under fluoroscopic guidance. A microcatheter is advanced through the femoral or radial artery into the occluded intracranial vessel. A stent retriever or aspiration catheter captures and extracts the clot, restoring cerebral blood flow. The procedure takes 30–90 minutes from groin puncture to reperfusion. Success is measured by modified TICI score: TICI 2b–3 (successful reperfusion) is achieved in approximately 80–85% of modern cases. Conscious sedation is generally preferred over general anesthesia to avoid delays and allow neurological monitoring. Post-procedure care in a stroke or neurological ICU for 24–48 hours monitors for hemorrhagic transformation, manages blood pressure, and assesses neurological recovery with serial NIHSS assessments.',
    },
  ],
  '/calculators/late-window-ivt': [
    {
      question: 'What is late window IVT and who is eligible?',
      answer: 'Late window IVT refers to IV thrombolysis beyond the standard 4.5-hour window. Eligibility depends on imaging and timing: DWI-FLAIR mismatch on MRI for unknown-onset stroke within 4.5 hours of symptom recognition (COR 2a, WAKE-UP), perfusion mismatch in the 4.5–9 hour window (COR 2a, EXTEND), or selected patients with LVO, salvageable penumbra, no feasible rapid EVT pathway, and expert thrombolytic stroke oversight in the late window up to 24 hours from last known well (COR 2b, TRACE-3/TIMELESS).',
    },
    {
      question: 'How is wake-up stroke treated with thrombolysis?',
      answer: 'Wake-up stroke can be treated with IV thrombolysis if MRI shows DWI-FLAIR mismatch and treatment can start within 4.5 hours of symptom recognition, consistent with the WAKE-UP trial and the 2026 AHA/ASA COR 2a recommendation. If MRI criteria are not met, patients with a known last-known-well time may still be considered for later LVO-only pathways using perfusion imaging and EVT/expertise screening.',
    },
    {
      question: 'What is the difference between COR 2a and COR 2b for late window thrombolysis?',
      answer: 'COR 2a applies when imaging selection strongly favors treatment, such as DWI-FLAIR mismatch for wake-up stroke or perfusion mismatch in the 4.5–9 hour window. COR 2b applies to a narrower late-window group: patients with AIS due to LVO, salvageable penumbra, no feasible rapid EVT option, and treatment directed by clinicians with expertise in thrombolytic stroke care.',
    },
  ],
  '/calculators/elan-pathway': [
    {
      question: 'When should anticoagulation be started after stroke with atrial fibrillation?',
      answer: 'Per the ELAN trial (NEJM 2023) and AHA/ASA 2026 guidelines: TIA/minor stroke (NIHSS 0–5) — within 48 hours; moderate stroke (NIHSS 6–15) — day 3–5; severe stroke (NIHSS ≥16) — day 6–7. These are for direct oral anticoagulants (DOACs). Prior anticoagulation may reduce window.',
    },
    {
      question: 'What is the ELAN trial and why does it matter?',
      answer: 'The ELAN trial (2023, NEJM) randomized AF stroke patients to early vs. late DOAC initiation and found no significant difference in stroke recurrence or bleeding. This supports earlier anticoagulation than previously practiced, with the timing based on stroke severity rather than fixed calendar days.',
    },
    {
      question: 'Can anticoagulation be started if there is hemorrhagic transformation?',
      answer: 'Hemorrhagic infarction (HI1, HI2) on the Heidelberg classification is generally not a contraindication to anticoagulation initiation but may prompt a short delay. Parenchymal hemorrhage (PH1, PH2) warrants postponing anticoagulation until imaging stability is confirmed, typically at 7+ days.',
    },
  ],
  '/calculators/em-billing': [
    {
      question: 'How do I choose between CPT 99205 and 99215?',
      answer: '99205 is for new patients with high-complexity MDM or 60+ minutes of total time. 99215 is for established patients with high-complexity MDM or 54+ minutes. Both require high-complexity medical decision-making: typically a problem with threat to life or bodily function, extensive data review, and high-risk management (e.g., starting/adjusting a high-risk medication, IV drug therapy, or a major surgery decision). For established patients, 99213 (low), 99214 (moderate), and 99215 (high) map to the same MDM levels as 99203, 99204, and 99205 for new patients.',
    },
    {
      question: 'What is the 2021 AMA E/M MDM framework?',
      answer: 'Since January 2021, outpatient E/M codes (99202–99215) are selected based on Medical Decision-Making (MDM) or total time — not documentation of history and physical exam. MDM has three elements: (1) Number and complexity of problems addressed, (2) Amount and/or complexity of data reviewed and analyzed, and (3) Risk of complications and/or morbidity or mortality of patient management. The overall MDM level is determined by meeting at least 2 of 3 elements at a given level (minimal, low, moderate, or high).',
    },
    {
      question: 'What CPT codes do hospitalists use for inpatient billing?',
      answer: 'Hospitalists use 99221–99223 for initial hospital care (low/moderate/high MDM or 40–75+ minutes) and 99231–99233 for subsequent hospital care (low/moderate/high MDM or 25–50+ minutes). Discharge day management uses 99238 (≤30 minutes) or 99239 (>30 minutes). For critical care, 99291 covers the first 30–74 minutes and 99292 each additional 30 minutes.',
    },
    {
      question: 'Can I bill E/M codes by time in 2023?',
      answer: 'Yes. Since 2021, total physician time on the date of service is a valid sole basis for E/M level selection for office and outpatient visits (99202–99215). For inpatient and subsequent visits (99221–99233), time-based billing is also permitted. Emergency department visits (99281–99285) are the exception — per 2023 AMA guidelines, time is not a valid basis for ED E/M code selection; MDM must be used.',
    },
    {
      question: 'What is the difference between MDM-based and time-based E/M billing?',
      answer: 'MDM-based billing selects the CPT code based on problem complexity, data reviewed, and management risk — regardless of how long the visit takes. Time-based billing selects the CPT code based on total physician time on the date of the encounter (including pre-charting, exam, counseling, and documentation). You may choose whichever method supports the highest code for any given encounter. Neither method requires documenting that you chose it — simply meet the criteria for the level you are billing.',
    },
    {
      question: 'What is a -GC modifier and when is it used for E/M billing?',
      answer: 'The -GC modifier (Teaching Physician performed or supervised service) is added to an E/M code when a resident is present and the attending physician personally performs the key or critical portion of the service and is present during the resident\'s key portions. The attestation must document the attending\'s personal participation and evaluation, not merely supervisory presence. In the primary care exception (PCTE), supervision rules are relaxed for certain low-complexity office visits.',
    },
  ],
  '/calculators/se-pathway': [
    {
      question: 'What is the first-line treatment for status epilepticus?',
      answer: 'Benzodiazepines are first-line for all types of status epilepticus. Lorazepam 0.1 mg/kg IV (max 4 mg) is preferred; diazepam 0.15–0.2 mg/kg IV or IM midazolam 10 mg (>40 kg) are alternatives. Repeat once if seizure continues after 5 minutes.',
    },
    {
      question: 'What are second-line agents for status epilepticus?',
      answer: 'Per the ESETT trial (NEJM 2019), levetiracetam 60 mg/kg IV (max 4500 mg), valproate 40 mg/kg IV (max 3000 mg), and fosphenytoin 20 mg PE/kg IV are equally effective second-line options with similar rates of seizure termination and adverse effects.',
    },
    {
      question: 'How is refractory status epilepticus managed?',
      answer: 'Refractory SE (failed 2+ AEDs) requires ICU admission and continuous EEG monitoring. Anesthetic agents are used: propofol infusion, midazolam infusion, or ketamine infusion. Target burst-suppression or seizure termination on EEG. Treat underlying cause in parallel.',
    },
  ],
  '/guide/iv-tpa': [
    {
      question: 'What is the dose of alteplase for ischemic stroke?',
      answer: 'Alteplase (tPA) is dosed at 0.9 mg/kg (maximum 90 mg) for ischemic stroke. 10% is given as an IV bolus over 1 minute, and the remaining 90% infused over 60 minutes.',
    },
    {
      question: 'What is the dose of tenecteplase for ischemic stroke?',
      answer: 'Tenecteplase (TNK) is dosed as a single IV bolus at 0.25 mg/kg (maximum 25 mg). Per AHA/ASA 2026 guidelines, tenecteplase is considered equivalent to alteplase (both COR 1) for acute ischemic stroke thrombolysis.',
    },
    {
      question: 'What are absolute contraindications to IV tPA in stroke?',
      answer: 'Absolute contraindications include: significant head trauma or prior stroke in last 3 months, intracranial neoplasm/AVM/aneurysm, recent intracranial surgery, active internal bleeding, BP >185/110 despite treatment, platelet count <100,000, INR >1.7, or current use of direct thrombin/Xa inhibitors with elevated drug levels.',
    },
    {
      question: 'What is the time window for IV tPA in stroke?',
      answer: 'Standard window is 0–3 hours from symptom onset (or last known well). Extended window is 3–4.5 hours with additional exclusions (age >80, NIHSS >25, prior stroke + diabetes, anticoagulation use). Beyond 4.5 hours, perfusion-guided tPA is possible in selected patients (EXTEND trial, 4.5–9 hours).',
    },
  ],
  '/guide/stroke-basics': [
    {
      question: 'What is a stroke code?',
      answer: 'A stroke code (or stroke alert) is a rapid hospital response protocol activated when a patient presents with acute stroke symptoms. It mobilizes the stroke team, neuroimaging, pharmacy, and interventional teams simultaneously to minimize time to treatment (door-to-needle <60 minutes for tPA, door-to-puncture <90 minutes for EVT).',
    },
    {
      question: 'What imaging is needed for acute stroke?',
      answer: 'Non-contrast CT head to rule out hemorrhage (CT takes ~5 minutes). CT angiography head and neck to detect LVO if EVT candidate. CT perfusion or MRI DWI/FLAIR for extended window patients or when diagnosis uncertain. Do not delay tPA for MRI if CT excludes hemorrhage.',
    },
    {
      question: 'What blood pressure targets should be used in acute ischemic stroke?',
      answer: 'For tPA-eligible patients: lower BP to <185/110 mmHg before giving tPA, maintain <180/105 mmHg for 24 hours after. For non-tPA patients: permissive hypertension up to 220/120 mmHg unless other indications. Post-EVT: intensive BP lowering (<130 mmHg) is HARMFUL per 2026 AHA/ASA guidelines; target <180 mmHg.',
    },
  ],
};

// ── Calculator schema ─────────────────────────────────────────────────────────

function calculatorSchema(
  pathname: string,
  title: string,
  description: string,
  calculatorName: string,
  breadcrumbLabel: string
): object {
  const url = `${BASE_URL}${pathname}`;
  const faqs = PAGE_FAQS[pathname];

  const graph: object[] = [
    {
      '@type': 'MedicalWebPage',
      name: title,
      description,
      url,
      audience: {
        '@type': 'MedicalAudience',
        audienceType: 'Physician, Neurologist, Emergency Medicine, Resident',
      },
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: calculatorName,
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      publisher: PUBLISHER,
      lastReviewed: LAST_REVIEWED,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Calculators', item: `${BASE_URL}/calculators` },
        { '@type': 'ListItem', position: 3, name: breadcrumbLabel, item: url },
      ],
    },
  ];

  if (faqs) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

// ── Guide schema ──────────────────────────────────────────────────────────────

function guideSchema(pathname: string, title: string, description: string, guideLabel: string): object {
  const url = `${BASE_URL}${pathname}`;
  const faqs = PAGE_FAQS[pathname];

  const graph: object[] = [
    {
      '@type': 'MedicalWebPage',
      name: title,
      description,
      url,
      audience: { '@type': 'MedicalAudience', audienceType: 'Physician, Neurologist, Resident' },
      publisher: PUBLISHER,
      lastReviewed: LAST_REVIEWED,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Clinical Guides', item: `${BASE_URL}/guide` },
        { '@type': 'ListItem', position: 3, name: guideLabel, item: url },
      ],
    },
  ];

  if (faqs) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

// ── Trial schema ──────────────────────────────────────────────────────────────

/** Dynamically generates FAQs from TRIAL_DATA for any trial page — enables Google FAQ rich snippets. */
function generateTrialFAQs(trialId: string): Array<{ question: string; answer: string }> | null {
  const trial = TRIAL_DATA[trialId];
  if (!trial) return null;

  const faqs: Array<{ question: string; answer: string }> = [];

  // Q1: What did the trial show? (always present — uses verified conclusion field)
  faqs.push({
    question: `What did the ${trial.title} show?`,
    answer: trial.conclusion,
  });

  // Q2: Primary outcome / efficacy numbers
  if (trial.efficacyResults) {
    const { treatment, control } = trial.efficacyResults;
    const ep =
      trial.stats?.primaryEndpoint?.value ??
      trial.trialDesign?.primaryEndpoint?.value ??
      'the primary endpoint';
    const pVal = trial.stats?.pValue?.value ? `, p ${trial.stats.pValue.value}` : '';
    const nntLine = trial.calculations?.nntExplanation
      ? ` NNT: ${trial.calculations.nntExplanation}.`
      : '';
    faqs.push({
      question: `What were the key results of ${trial.title}?`,
      answer: `${trial.title} enrolled ${trial.stats?.sampleSize?.value ?? 'participants'}. The primary outcome (${ep}) was achieved in ${treatment.percentage}% of the ${treatment.name} group vs ${control.percentage}% of the ${control.name} group${pVal}.${nntLine}`,
    });
  }

  // Q3: Trial design and intervention
  if (trial.intervention) {
    const tx =
      typeof trial.intervention.treatment === 'string'
        ? trial.intervention.treatment
        : `${trial.intervention.treatment.name}: ${trial.intervention.treatment.description}`;
    const ctrl =
      typeof trial.intervention.control === 'string'
        ? trial.intervention.control
        : `${trial.intervention.control.name}: ${trial.intervention.control.description}`;
    const designType = trial.trialDesign?.type?.[0] ?? '';
    faqs.push({
      question: `What was the design of ${trial.title}?`,
      answer: `${trial.title} (${trial.source}) compared ${tx} versus ${ctrl}. ${designType ? `${designType}. ` : ''}${trial.clinicalContext}`,
    });
  }

  // Q4: Clinical application or key pearls
  if (trial.clinicalApplication) {
    faqs.push({
      question: `How should ${trial.title} change clinical practice?`,
      answer: trial.clinicalApplication,
    });
  } else if (trial.pearls?.length) {
    faqs.push({
      question: `What are the key clinical takeaways from ${trial.title}?`,
      answer: trial.pearls.slice(0, 3).join(' '),
    });
  }

  return faqs.length > 0 ? faqs : null;
}

function trialSchema(pathname: string, title: string, description: string, trialLabel: string): object {
  const url = `${BASE_URL}${pathname}`;
  const trialId = pathname.split('/').pop() ?? '';
  const faqs = generateTrialFAQs(trialId);

  const graph: object[] = [
    {
      '@type': 'MedicalWebPage',
      name: title,
      description,
      url,
      medicalSpecialty: 'Neurology',
      audience: { '@type': 'MedicalAudience', audienceType: 'Physician, Neurologist, Resident' },
      about: { '@type': 'MedicalScholarlyArticle', name: trialLabel, url },
      publisher: PUBLISHER,
      lastReviewed: LAST_REVIEWED,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Clinical Trials', item: `${BASE_URL}/trials` },
        { '@type': 'ListItem', position: 3, name: trialLabel, item: url },
      ],
    },
  ];

  if (faqs) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

// ── Breadcrumb label maps ─────────────────────────────────────────────────────

/** Calculator display names for schema mainEntity + breadcrumb */
const CALC_NAMES: Record<string, { app: string; breadcrumb: string }> = {
  '/calculators/aspects-score':                   { app: 'ASPECTS Score Calculator', breadcrumb: 'ASPECTS Score' },
  '/calculators/nihss':                           { app: 'NIHSS Calculator', breadcrumb: 'NIHSS Calculator' },
  '/calculators/ich-score':                       { app: 'ICH Score Calculator', breadcrumb: 'ICH Score' },
  '/calculators/abcd2-score':                     { app: 'ABCD² Score Calculator', breadcrumb: 'ABCD² Score' },
  '/calculators/has-bled-score':                  { app: 'HAS-BLED Score Calculator', breadcrumb: 'HAS-BLED Score' },
  '/calculators/rope-score':                      { app: 'RoPE Score Calculator', breadcrumb: 'RoPE Score' },
  '/calculators/glasgow-coma-scale':              { app: 'Glasgow Coma Scale Calculator', breadcrumb: 'Glasgow Coma Scale' },
  '/calculators/heidelberg-bleeding-classification': { app: 'Heidelberg Bleeding Classification', breadcrumb: 'Heidelberg Classification' },
  '/calculators/boston-criteria-caa':             { app: 'Boston Criteria 2.0 for CAA', breadcrumb: 'Boston Criteria 2.0' },
  '/calculators/evt-pathway':                     { app: 'EVT Thrombectomy Pathway', breadcrumb: 'EVT Pathway' },
  '/calculators/elan-pathway':                    { app: 'ELAN Anticoagulation Pathway', breadcrumb: 'ELAN Pathway' },
  '/calculators/late-window-ivt':                 { app: 'Late Window IVT Pathway', breadcrumb: 'Late Window IVT' },
  '/calculators/se-pathway':                      { app: 'Status Epilepticus Pathway', breadcrumb: 'SE Pathway' },
  '/calculators/migraine-pathway':                { app: 'Migraine Pathway', breadcrumb: 'Migraine Pathway' },
  '/calculators/gca-pathway':                     { app: 'GCA Pathway', breadcrumb: 'GCA Pathway' },
  '/calculators/em-billing':                      { app: 'E/M Billing Calculator', breadcrumb: 'E/M Billing' },
};

const GUIDE_LABELS: Record<string, string> = {
  '/guide/stroke-basics':       'Stroke Basics',
  '/guide/iv-tpa':              'IV tPA Protocol',
  '/guide/tpa-eligibility':     'tPA Eligibility',
  '/guide/thrombectomy':        'Mechanical Thrombectomy',
  '/guide/acute-stroke-mgmt':  'Acute Stroke Management',
  '/guide/ich-management':      'ICH Management',
  '/guide/status-epilepticus':  'Status Epilepticus',
  '/guide/meningitis':          'Bacterial Meningitis',
  '/guide/altered-mental-status': 'Altered Mental Status',
  '/guide/gbs':                 'Guillain-Barré Syndrome',
  '/guide/myasthenia-gravis':   'Myasthenia Gravis',
  '/guide/multiple-sclerosis':  'Multiple Sclerosis',
  '/guide/seizure-workup':      'Seizure Workup',
  '/guide/headache-workup':     'Headache Workup',
  '/guide/vertigo':             'Vertigo',
  '/guide/weakness-workup':     'Weakness Workup',
};

const TRIAL_LABELS: Record<string, string> = {
  // Legacy trials
  '/trials/ninds-trial':        'NINDS Trial',
  '/trials/ecass3-trial':       'ECASS-3 Trial',
  '/trials/extend-trial':       'EXTEND Trial',
  '/trials/thaws-trial':        'THAWS Trial',
  '/trials/trace-iii-trial':    'TRACE-III Trial',
  '/trials/eagle-trial':        'EAGLE Trial',
  '/trials/original-trial':     'ORIGINAL Trial',
  '/trials/wake-up-trial':      'WAKE-UP Trial',
  '/trials/dawn-trial':         'DAWN Trial',
  '/trials/defuse-3-trial':     'DEFUSE-3 Trial',
  '/trials/select2-trial':      'SELECT-2 Trial',
  '/trials/angel-aspect-trial': 'ANGEL-ASPECT Trial',
  '/trials/distal-trial':       'DISTAL Trial',
  '/trials/escape-mevo-trial':  'ESCAPE-MeVO Trial',
  '/trials/attention-trial':    'ATTENTION Trial',
  '/trials/baoche-trial':       'BAOCHE Trial',
  '/trials/chance-trial':       'CHANCE Trial',
  '/trials/point-trial':        'POINT Trial',
  '/trials/sammpris-trial':     'SAMMPRIS Trial',
  '/trials/weave-trial':        'WEAVE Trial',
  '/trials/socrates-trial':     'SOCRATES Trial',
  '/trials/sps3-trial':         'SPS3 Trial',
  '/trials/sparcl-trial':       'SPARCL Trial',
  '/trials/elan-study':         'ELAN Study',
  '/trials/thales-trial':       'THALES Trial',
  '/trials/inspires-trial':     'INSPIRES Trial',
  '/trials/chance-2-trial':     'CHANCE-2 Trial',
  '/trials/enrich-trial':       'ENRICH Trial',
  // Prehospital & Triage
  '/trials/b-proud-trial':           'B_PROUD Trial',
  '/trials/best-msu-trial':          'BEST-MSU Trial',
  '/trials/racecat-trial':           'RACECAT Trial',
  '/trials/triage-stroke-trial':     'TRIAGE-STROKE Trial',
  '/trials/right-2-trial':           'RIGHT-2 Trial',
  '/trials/mr-asap-trial':           'MR ASAP Trial',
  '/trials/interact4-trial':         'INTERACT4 Trial',
  // IVT
  '/trials/timeless-trial':          'TIMELESS Trial',
  '/trials/prisms-trial':            'PRISMS Trial',
  '/trials/aramis-trial':            'ARAMIS Trial',
  '/trials/act-trial':               'AcT Trial',
  '/trials/attest-2-trial':          'ATTEST-2 Trial',
  '/trials/nor-test-trial':          'NOR-TEST Trial',
  '/trials/nor-test-2-part-a-trial': 'NOR-TEST 2 (Part A) Trial',
  '/trials/trace-2-trial':           'TRACE-2 Trial',
  '/trials/taste-trial':             'TASTE Trial',
  '/trials/twist-trial':             'TWIST Trial',
  '/trials/raise-trial':             'RAISE Trial',
  '/trials/prost-trial':             'PROST Trial',
  '/trials/prost-2-trial':           'PROST-2 Trial',
  // EVT
  '/trials/mr-clean-trial':          'MR CLEAN Trial',
  '/trials/escape-trial':            'ESCAPE Trial',
  '/trials/revascat-trial':          'REVASCAT Trial',
  '/trials/extend-ia-trial':         'EXTEND-IA Trial',
  '/trials/swift-prime-trial':       'SWIFT PRIME Trial',
  '/trials/thrace-trial':            'THRACE Trial',
  '/trials/direct-mt-trial':         'DIRECT-MT Trial',
  '/trials/devt-trial':              'DEVT Trial',
  '/trials/skip-trial':              'SKIP Trial',
  '/trials/mr-clean-no-iv-trial':    'MR CLEAN-NO IV Trial',
  '/trials/direct-safe-trial':       'DIRECT-SAFE Trial',
  '/trials/swift-direct-trial':      'SWIFT DIRECT Trial',
  '/trials/laste-trial':             'LASTE Trial',
  '/trials/tension-trial':           'TENSION Trial',
  '/trials/compass-trial':           'COMPASS Trial',
  '/trials/aster-trial':             'ASTER Trial',
  '/trials/aster2-trial':            'ASTER2 Trial',
  '/trials/choice-trial':            'CHOICE Trial',
  '/trials/rescue-bt-trial':         'RESCUE BT Trial',
  // Acute Management
  '/trials/enchanted-trial':         'ENCHANTED Trial',
  '/trials/best-ii-trial':           'BEST-II Trial',
  '/trials/bp-target-trial':         'BP-TARGET Trial',
  '/trials/optimal-bp-trial':        'OPTIMAL-BP Trial',
  '/trials/charm-trial':             'CHARM Trial',
  '/trials/escape-na1-trial':        'ESCAPE-NA1 Trial',
  // Surgical Interventions
  '/trials/decimal-trial':           'DECIMAL Trial',
  '/trials/destiny-trial':           'DESTINY Trial',
  '/trials/hamlet-trial':            'HAMLET Trial',
  '/trials/destiny-ii-trial':        'DESTINY II Trial',
  // Secondary Prevention
  '/trials/timing-trial':            'TIMING Trial',
  '/trials/optimas-trial':           'OPTIMAS Trial',
};

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Returns JSON-LD object for the given pathname and meta. Used by Seo component to inject script.
 */
export function getSchemaForRoute(
  pathname: string,
  meta: { title: string; description: string }
): object | null {
  if (pathname === '/') return ORGANIZATION_SCHEMA;
  if (pathname === '/calculators') return CALCULATORS_HUB_SCHEMA;
  if (pathname === '/guide') return GUIDE_HUB_SCHEMA;
  if (pathname === '/trials') return TRIALS_HUB_SCHEMA;

  if (pathname.startsWith('/calculators/')) {
    const entry = CALC_NAMES[pathname];
    const appName = entry?.app ?? pathname.split('/').pop()?.replace(/-/g, ' ') ?? 'Calculator';
    const breadcrumb = entry?.breadcrumb ?? appName;
    return calculatorSchema(pathname, meta.title, meta.description, appName, breadcrumb);
  }

  if (pathname.startsWith('/guide/')) {
    const label = GUIDE_LABELS[pathname] ?? pathname.split('/').pop()?.replace(/-/g, ' ') ?? 'Guide';
    return guideSchema(pathname, meta.title, meta.description, label);
  }

  if (pathname.startsWith('/trials/')) {
    const label = TRIAL_LABELS[pathname] ?? pathname.split('/').pop()?.replace(/-/g, ' ') ?? 'Trial';
    return trialSchema(pathname, meta.title, meta.description, label);
  }

  return null;
}
