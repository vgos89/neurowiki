/**
 * JSON-LD structured data for SEO. Injected per-route to help Google understand
 * medical content and enable rich results (e.g. MedicalWebPage, SoftwareApplication,
 * BreadcrumbList, FAQPage).
 */


const BASE_URL = 'https://www.neurowiki.ai';

// Build-time date injected via vite.config.ts `define`. Replaces previous
// hardcoded '2026-02-18' which staled on every release. Fresh on each
// deploy. Per the 2026-05-21 SEO audit Finding 8b: every MedicalWebPage
// schema needs an accurate freshness signal for Google E-E-A-T quality.
// Per-route lastmod refinement is a future enhancement once routeManifest
// gains a lastmod field.
declare const __BUILD_DATE__: string;
const LAST_REVIEWED = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '2026-05-21';
const DATE_PUBLISHED = '2025-09-01';
const DATE_MODIFIED = LAST_REVIEWED;

// ── Shared publisher/provider block ──────────────────────────────────────────
const PUBLISHER = {
  '@type': 'Organization',
  name: 'NeuroWiki',
  alternateName: ['Neuro Wiki', 'Neurology Resident Guide'],
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.png`,
};

// ── Organization schema (homepage) ───────────────────────────────────────────
const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NeuroWiki',
  alternateName: ['Neuro Wiki', 'Neurology Resident Guide'],
  description: 'A neurology resident and attending guide. Free protocols, calculators, and clinical guidelines built on AHA/ASA 2026 stroke guidelines.',
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.png`,
  audience: {
    '@type': 'MedicalAudience',
    audienceType: 'Neurology Resident, Neurology Fellow, Neurology Attending, Physician',
  },
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
        { '@type': 'ListItem', position: 7, name: 'EVT Eligibility Pathway', url: `${BASE_URL}/pathways/evt` },
        { '@type': 'ListItem', position: 8, name: 'ELAN Anticoagulation Pathway', url: `${BASE_URL}/pathways/elan-pathway` },
        { '@type': 'ListItem', position: 9, name: 'Status Epilepticus Pathway', url: `${BASE_URL}/pathways/se-pathway` },
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
      name: 'Stroke Clinical Trials | Evidence Summaries for Neurologists | NeuroWiki',
      description: '79 landmark stroke trials summarized for the bedside. NNT, mRS-shift outcomes, AHA/ASA 2026 recommendations. DAWN, DEFUSE-3, NINDS, MR CLEAN, ELAN, CHANCE, POINT, INSPIRES, ENRICH, TRACE-III all covered.',
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
//
// This registry feeds two surfaces — JSON-LD FAQPage schema (machine-readable,
// fed via getSchemaForRoute) AND the visible DiscreteFAQ accordion at the
// bottom of each page (human-readable, fed via getFAQsForPath). Both must
// stay in sync: Google's FAQ-rich-result eligibility requires the FAQ
// content to be visible to the user on page load (which a closed-by-default
// native `<details>` accordion satisfies).
//
// Source: V approval 2026-05-21 (Option A — single bottom accordion).
const PAGE_FAQS: Record<string, Array<{ question: string; answer: string }>> = {
  '/': [
    {
      question: 'What is NeuroWiki?',
      answer: 'NeuroWiki (also written Neuro Wiki) is a free neurology resident and attending guide. It bundles bedside calculators, clinical pathways, and landmark stroke trial summaries built on AHA/ASA 2026 guidelines.',
    },
    {
      question: 'Who is NeuroWiki for?',
      answer: 'Neurology residents, fellows, attendings, and other physicians caring for stroke and neurology patients at the bedside.',
    },
    {
      question: 'Is NeuroWiki free to use?',
      answer: 'Yes. All calculators, pathways, guides, and trial pages are free. No account or sign-up is required.',
    },
    {
      question: 'What does NeuroWiki cover?',
      answer: 'NIHSS, ICH Score, ASPECTS, GCS, ABCD2, HAS-BLED and other neurology calculators; stroke code, EVT, late-window IVT, status epilepticus, and migraine pathways; 101 landmark stroke trial summaries; and clinical guides for residents.',
    },
  ],
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
  '/pathways/evt': [
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
  '/pathways/late-window-ivt': [
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
  '/pathways/elan-pathway': [
    {
      question: 'When should anticoagulation be started after stroke with atrial fibrillation?',
      answer: 'The 2026 AHA/ASA guideline gives a broad Class 2a recommendation that earlier DOAC initiation is reasonable in carefully selected patients with AF-related stroke. NeuroWiki operationalizes that recommendation using the ELAN trial framework: TIA/minor/moderate events within 48 hours, and major stroke on day 6–7, with a later comparator of day 3–4 for TIA/minor, day 6–7 for moderate, and day 12–14 for major stroke.',
    },
    {
      question: 'What is the ELAN trial and why does it matter?',
      answer: 'The ELAN trial (2023, NEJM) randomized AF stroke patients to earlier versus later DOAC initiation and found that earlier treatment was low risk, with no excess symptomatic intracranial hemorrhage. It matters because it provides the specific timing framework many clinicians now use to operationalize the broader AHA/ASA recommendation for earlier anticoagulation.',
    },
    {
      question: 'Can anticoagulation be started if there is hemorrhagic transformation?',
      answer: 'Hemorrhagic infarction (HI1, HI2) on the Heidelberg classification is generally not a contraindication to anticoagulation initiation but may prompt a short delay. Parenchymal hemorrhage (PH1, PH2) warrants postponing anticoagulation until imaging stability is confirmed, typically at 7+ days.',
    },
  ],
  '/calculators/glasgow-coma-scale': [
    {
      question: 'What is a normal GCS score?',
      answer: 'A total Glasgow Coma Scale of 15 is the maximum and indicates full eye-opening, oriented verbal response, and obeys-commands motor response. A GCS of 15 does not exclude neurologic injury — focal deficits, confusion that scores 4 verbal, or subtle motor signs can coexist with a 15, which is why component scores (E, V, M) should always be reported separately, not just the total.',
    },
    {
      question: 'What GCS score indicates coma?',
      answer: 'Coma is conventionally defined as GCS ≤8 in the original Teasdale-Jennett framework, and this is also the most commonly cited threshold to consider endotracheal intubation for airway protection in head injury. However, the clinical decision to intubate is not driven by GCS alone — gag reflex, secretions, expected trajectory, and the cause of the depressed consciousness all factor in. A GCS of 8 from a reversible cause (postictal, intoxication) is managed differently than a GCS of 8 from intracerebral hemorrhage.',
    },
    {
      question: 'How do you score GCS in an intubated patient?',
      answer: 'When the patient cannot speak because of an endotracheal tube, the verbal component is recorded as "1T" (1 with a T suffix) or simply not testable. The total is reported with the T notation, e.g., "GCS 7T (E2 V1T M4)". Do not assign a verbal score of 5 because the patient cannot demonstrate it. Many published thresholds (e.g., intubation criteria) were derived in non-intubated patients, so use the component scores rather than the total when comparing to prognostic literature.',
    },
    {
      question: 'What are the GCS severity bands for traumatic brain injury?',
      answer: 'Per the Brain Trauma Foundation and AANS classification: mild TBI is GCS 13-15, moderate is GCS 9-12, and severe is GCS 3-8. These bands inform imaging decisions, ICU triage, and prognostic discussions but are not rigid management cutoffs. A GCS 13 with anticoagulation, focal deficit, or vomiting still warrants CT and observation; a GCS 8 from a reversible cause may have a much better trajectory than the band implies.',
    },
    {
      question: 'Why report E, V, and M separately instead of just the total?',
      answer: 'The same total score can come from very different neurologic patterns. A GCS 10 with E4 V1 M5 (alert, aphasic, follows commands) is clinically distinct from a GCS 10 with E2 V3 M5 (drowsy, confused, follows commands) — the first suggests an aphasic stroke, the second a metabolic encephalopathy. Component scores communicate the localization and trajectory that the total obscures. Modern reporting standards (and most trial inclusion criteria) require all three components, not just the sum.',
    },
    {
      question: 'How is pediatric GCS different from adult GCS?',
      answer: 'The Pediatric Glasgow Coma Scale modifies the verbal and (in some versions) motor components to account for pre-verbal children. Verbal scoring substitutes age-appropriate behaviors: 5 = coos/babbles, 4 = irritable crying, 3 = cries to pain, 2 = moans to pain, 1 = none. Eye and adult motor components are largely unchanged. Use the pediatric scale for children under ~2 years and the standard adult scale for older children; clinical judgment applies in the transitional range.',
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
  '/pathways/se-pathway': [
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
  '/guide/meningitis': [
    {
      question: 'What is the empiric antibiotic regimen for bacterial meningitis?',
      answer: 'Empiric therapy for community-acquired bacterial meningitis is vancomycin (15–20 mg/kg IV q8–12h, target trough 15–20 µg/mL) plus a third-generation cephalosporin — ceftriaxone 2 g IV q12h (or cefotaxime 2 g IV q4–6h). Add ampicillin 2 g IV q4h to cover Listeria monocytogenes for patients >50 years, immunocompromised, pregnant, or with alcohol use disorder. Substitute meropenem 2 g IV q8h for the cephalosporin if Pseudomonas is suspected (post-neurosurgical, penetrating head trauma, CSF shunt). Antibiotics should be given within 60 minutes of presentation; do not delay for LP or imaging if access is delayed.',
    },
    {
      question: 'When should dexamethasone be given in bacterial meningitis?',
      answer: 'Dexamethasone 0.15 mg/kg IV every 6 hours for 4 days, started 10–20 minutes before — or concurrently with — the first dose of antibiotics. Adjunctive dexamethasone reduces mortality and unfavorable outcomes in pneumococcal meningitis (de Gans & van de Beek, NEJM 2002; IDSA 2004 guidelines). Continue only if CSF Gram stain or culture confirms Streptococcus pneumoniae or Haemophilus influenzae. If a different pathogen is identified or cultures are negative, dexamethasone is generally discontinued. Do not start dexamethasone after antibiotics have already been given — the meningeal inflammatory effect that the steroid blunts has already occurred.',
    },
    {
      question: 'When is LP contraindicated before antibiotics, and what should I do instead?',
      answer: 'Obtain CT head before LP if any of the following are present: immunocompromised state, history of CNS disease, new-onset seizure within 1 week, papilledema, abnormal level of consciousness (GCS <10), or focal neurologic deficit (IDSA 2004). In these patients, the sequence is: draw blood cultures → give empiric antibiotics and dexamethasone immediately → then obtain CT → then LP if no mass effect. Antibiotics must not be delayed waiting for imaging. CSF Gram stain remains positive for several hours after antibiotic administration, and culture yield drops only modestly within the first 2–4 hours.',
    },
  ],
  '/guide/gbs': [
    {
      question: 'What CSF findings support a diagnosis of Guillain-Barré syndrome?',
      answer: 'The classic CSF finding in GBS is albumino-cytologic dissociation — elevated protein (typically >45 mg/dL, often 100–1000 mg/dL) with a normal or only minimally elevated white cell count (<10 cells/µL, predominantly mononuclear). This pattern develops over the first week of illness: CSF protein is normal in approximately 50% of patients within the first 3 days, rises in 75% by the end of week 1, and exceeds 80–90% by week 2. A normal CSF protein early in the course does not exclude GBS. WBC >50 cells/µL should prompt evaluation for alternative diagnoses including HIV seroconversion, Lyme, sarcoidosis, or carcinomatous meningitis.',
    },
    {
      question: 'When should IVIG versus plasmapheresis be used in Guillain-Barré syndrome?',
      answer: 'IVIG and plasma exchange are equally effective for GBS — neither is superior on disability at 4 weeks (Hughes Cochrane review). IVIG 0.4 g/kg/day for 5 days is the most common first-line treatment because it is more widely available, easier to administer, and does not require central venous access. Plasma exchange (5 sessions over 1–2 weeks, total exchange volume ~250 mL/kg) is preferred when IVIG is contraindicated (IgA deficiency, severe renal failure, hypercoagulable state) or when cardiac instability makes the volume load of IVIG hazardous. Combining IVIG with plasmapheresis offers no additional benefit and is not recommended. Treatment should begin within 2–4 weeks of symptom onset; benefit is greatest when started in patients still able to walk independently.',
    },
    {
      question: 'What respiratory monitoring is required in Guillain-Barré syndrome?',
      answer: 'Bedside pulmonary mechanics should be checked every 4 hours during the progressive phase. Intubate when any of the 20/30/40 criteria are met: forced vital capacity <20 mL/kg, maximum inspiratory pressure (NIF) less negative than -30 cmH2O, or maximum expiratory pressure <40 cmH2O. Other indications for intubation include rapid decline (>30% drop in FVC in 24 hours), bulbar dysfunction with aspiration risk, or autonomic instability with cardiovascular collapse. Elective intubation in a controlled setting is strongly preferred over emergent intubation after respiratory failure. Approximately 20–30% of GBS patients require mechanical ventilation; the Erasmus GBS Respiratory Insufficiency Score (EGRIS) can help risk-stratify at admission.',
    },
  ],
  '/guide/multiple-sclerosis': [
    {
      question: 'How are the McDonald 2017 criteria used to diagnose multiple sclerosis?',
      answer: 'McDonald 2017 criteria diagnose MS by demonstrating dissemination in space (DIS) and dissemination in time (DIT). DIS requires ≥1 T2 lesion in ≥2 of 4 CNS locations: periventricular, cortical/juxtacortical, infratentorial, or spinal cord. DIT requires either simultaneous gadolinium-enhancing and non-enhancing lesions on a single MRI, a new T2 or gadolinium-enhancing lesion on follow-up MRI, or CSF-specific oligoclonal bands. For a typical clinically isolated syndrome (CIS), MS can be diagnosed at the first clinical event if DIS is met on MRI plus either DIT on MRI or positive CSF oligoclonal bands. The 2017 revision added cortical lesions and symptomatic lesions as contributors to DIS and lowered the threshold to first attack with appropriate paraclinical evidence.',
    },
    {
      question: 'What is the treatment for an acute multiple sclerosis relapse?',
      answer: 'Acute MS relapses with new disabling neurologic deficit are treated with high-dose corticosteroids: methylprednisolone 1 g IV daily for 3–5 days, or oral methylprednisolone 1000 mg daily for 3–5 days (oral and IV are equivalent per multiple RCTs and the 2018 AAN guideline). An oral prednisone taper is not routinely required. Steroids shorten the duration of relapse but do not alter long-term disability. Plasma exchange (5–7 exchanges over 10–14 days) is the standard of care for steroid-refractory, severely disabling relapses (AAN 2011, Class I, Level A) — particularly tumefactive demyelination, severe optic neuritis, or transverse myelitis with paraplegia. IVIG is not recommended for acute MS relapse treatment.',
    },
    {
      question: 'What are the high-efficacy disease-modifying therapies for multiple sclerosis?',
      answer: 'High-efficacy DMTs for relapsing MS include the anti-CD20 monoclonals ocrelizumab and ofatumumab, natalizumab (anti-VLA-4), alemtuzumab (anti-CD52), and cladribine. Recent evidence — including the TREAT-MS trial and large registry analyses — supports an early high-efficacy strategy (starting one of these agents at diagnosis) over the traditional escalation approach (starting an injectable platform therapy and escalating only after breakthrough activity). Choice among high-efficacy agents balances efficacy, safety monitoring requirements (JC virus serology for natalizumab, immunoglobulin levels for anti-CD20s, autoimmunity surveillance for alemtuzumab), and patient factors (pregnancy planning, infection risk, vaccination status).',
    },
  ],
  '/guide/headache-workup': [
    {
      question: 'What are the SNOOP4 red flags for secondary headache?',
      answer: 'SNOOP4 is a mnemonic for red flags suggesting secondary headache: S — Systemic symptoms (fever, weight loss) or Secondary risk factors (HIV, cancer); N — Neurologic signs or symptoms (focal deficit, papilledema, altered mental status); O — Onset sudden (thunderclap, peaking in <1 minute); O — Older age at onset (>50 years suggests temporal arteritis); P — Pattern change (progressive, change from prior pattern), Positional (worse lying down → ICP), Precipitated by Valsalva (cough, exertion, sexual activity), Progressive, Pregnancy or Postpartum (cerebral venous thrombosis, PRES, RCVS). Any positive red flag warrants neuroimaging and targeted workup; thunderclap onset specifically mandates evaluation for subarachnoid hemorrhage.',
    },
    {
      question: 'When is lumbar puncture indicated after a negative CT for thunderclap headache?',
      answer: 'Non-contrast CT performed within 6 hours of thunderclap headache onset, interpreted by an attending radiologist on a modern scanner, has approximately 100% sensitivity for aneurysmal subarachnoid hemorrhage (Perry, BMJ 2011). Beyond 6 hours, CT sensitivity drops progressively (~85% at 24 h, <50% at 1 week), and LP is required to exclude SAH in patients with continued clinical suspicion. CSF findings supporting SAH include elevated RBC count that does not clear between tubes 1 and 4, and xanthochromia on spectrophotometry (best detected 12 hours to 2 weeks after bleed). If LP is negative, consider CTA or MRA to evaluate for unruptured aneurysm, RCVS, or cervical artery dissection as alternative causes of thunderclap headache.',
    },
    {
      question: 'What imaging is preferred for suspected subarachnoid hemorrhage?',
      answer: 'Non-contrast CT head is the first-line imaging study for suspected SAH — fast, widely available, and ~100% sensitive within 6 hours of symptom onset. If CT confirms SAH, CT angiography of the head and neck identifies the aneurysm or other vascular cause in >95% of cases and guides definitive treatment (clipping vs coiling). If CT is negative but clinical suspicion remains, LP for RBC count and xanthochromia is the standard next step beyond 6 hours from onset. MRI with FLAIR and gradient-echo sequences is useful in subacute SAH (>1 week) when CT sensitivity has dropped, and is preferred in pregnancy to limit ionizing radiation, paired with MRA for vascular evaluation. Catheter angiography remains the gold standard when CTA is negative but suspicion for aneurysm remains high.',
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
      datePublished: DATE_PUBLISHED,
      dateModified: DATE_MODIFIED,
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

// ── Pathway schema ────────────────────────────────────────────────────────────

function pathwaySchema(
  pathname: string,
  title: string,
  description: string,
  pathwayName: string,
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
        name: pathwayName,
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      publisher: PUBLISHER,
      lastReviewed: LAST_REVIEWED,
      datePublished: DATE_PUBLISHED,
      dateModified: DATE_MODIFIED,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Pathways', item: `${BASE_URL}/pathways` },
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
      datePublished: DATE_PUBLISHED,
      dateModified: DATE_MODIFIED,
      // Upgrade 2026-05-18: MedicalGuideline mainEntity per schema.org spec.
      // Structural only — does NOT populate evidenceLevel/evidenceOrigin
      // (those would be clinical claims requiring per-page registration).
      mainEntity: {
        '@type': 'MedicalGuideline',
        name: guideLabel,
        url,
      },
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

// ── Clinical question schema (/trials/q/:questionId) ──────────────────────────

/**
 * Per-question metadata for /trials/q/:id pages.
 * title: ≤60 chars, description: ≤160 chars, answer: concise synthesis for FAQPage JSON-LD.
 */
const QUESTION_META: Record<string, { title: string; description: string; answer: string }> = {
  'large-core-evt': {
    title: 'EVT for Large-Core Stroke (Low ASPECTS) · NeuroWiki',
    description: 'Four positive RCTs (LASTE, SELECT2, ANGEL-ASPECT, TENSION) changed EVT practice for low-ASPECTS large-core stroke. Evidence summary.',
    answer: 'EVT is now supported for large-core stroke (ASPECTS 3–5) by four positive RCTs published 2022–2023: LASTE, SELECT2, ANGEL-ASPECT, and TENSION. Each showed functional benefit despite large established infarcts. The 2026 AHA/ASA guidelines rate large-core EVT COR 1.',
  },
  'late-window-selection': {
    title: 'Perfusion vs Non-Contrast CT for Late-Window EVT · NeuroWiki',
    description: 'How to select patients for late-window EVT — perfusion mismatch (DAWN, DEFUSE-3) versus plain-CT large-core approach (LASTE, TENSION, SELECT2).',
    answer: 'Late-window EVT selection evolved from mandatory perfusion imaging in DAWN and DEFUSE-3 (6–24 h) to plain non-contrast CT for large-core trials (LASTE, TENSION, SELECT2, ANGEL-ASPECT). Both strategies show benefit; choice depends on imaging availability, time, and core size.',
  },
  'aspiration-vs-stentriever': {
    title: 'Aspiration vs Stent Retriever for Thrombectomy · NeuroWiki',
    description: 'Three RCTs (ASTER, COMPASS, ASTER2) comparing direct aspiration first versus stent-retriever-first thrombectomy. No clear winner on functional outcomes.',
    answer: 'Three RCTs — ASTER, COMPASS, and ASTER2 — found no statistically significant difference in functional outcomes between aspiration-first and stent-retriever-first strategies. Reperfusion rates were similar. Device choice is largely operator-dependent.',
  },
  'evt-adjunct-pharmacotherapy': {
    title: 'Adjunct Pharmacotherapy During EVT · NeuroWiki',
    description: 'Nerinetide (ESCAPE-NA1), adjunct IA alteplase (CHOICE), and tirofiban (RESCUE BT): evidence on pharmacologic adjuncts to mechanical thrombectomy.',
    answer: 'ESCAPE-NA1 found nerinetide neutral overall. CHOICE showed adjunct intra-arterial alteplase after successful EVT may improve excellent outcomes. RESCUE BT found tirofiban did not improve functional outcomes globally, though signals emerged in non-large-artery atherosclerosis.',
  },
  'minor-stroke-choice': {
    title: 'Minor Stroke — tPA, DAPT, or Aspirin? · NeuroWiki',
    description: 'PRISMS, ARAMIS, CHANCE, POINT, and INSPIRES define the evidence for treating minor non-disabling ischemic stroke without thrombolysis.',
    answer: 'PRISMS showed alteplase did not outperform aspirin in minor non-disabling stroke and caused more symptomatic ICH. ARAMIS confirmed DAPT was noninferior to alteplase. CHANCE and POINT established short-course DAPT; INSPIRES extended DAPT to atherosclerotic minor stroke within 72 h.',
  },
  'mevo-distal-evt': {
    title: 'EVT for MeVO or Distal Occlusion · NeuroWiki',
    description: 'ESCAPE-MeVO and DISTAL — the first two RCTs in medium-vessel and distal occlusions — both failed their primary endpoints. Evidence summary.',
    answer: 'ESCAPE-MeVO (M2/M3, ACA, PCA) and DISTAL both failed their primary functional outcome endpoints, suggesting that EVT benefit does not extend reliably to medium-vessel and distal occlusions under current evidence. Routine EVT for MeVO cannot be recommended based on these RCTs.',
  },
  'post-evt-bp-target': {
    title: 'Post-EVT Blood Pressure Target · NeuroWiki',
    description: 'Four RCTs (BP-TARGET, BEST-II, OPTIMAL-BP, ENCHANTED) on post-EVT blood pressure management. OPTIMAL-BP showed harm from intensive lowering.',
    answer: 'Post-EVT BP evidence from four RCTs does not support intensive BP lowering after successful thrombectomy. OPTIMAL-BP showed early harm with intensive targets. BP-TARGET and BEST-II were neutral. Current guidance (AHA/ASA 2026) recommends avoiding aggressive BP lowering to below 130 mmHg post-EVT.',
  },
  // ─── Phase 2c additions (2026-05-21) — 16 new question pages ────────────────
  'tpa-timing': {
    title: 'When to Give IV Thrombolysis for Stroke · NeuroWiki',
    description: 'Evidence for IV thrombolysis windows in acute ischemic stroke: 0–3h (NINDS), 0–4.5h (ECASS-3), wake-up (WAKE-UP), and 4.5–24h (EXTEND, TRACE-III, TIMELESS).',
    answer: 'IV thrombolysis is established 0–3 h (NINDS 1995) and 3–4.5 h (ECASS-3 2008). MRI DWI-FLAIR mismatch supports treatment for wake-up or unknown-onset stroke within 4.5 h of recognition (WAKE-UP 2018). Perfusion-imaging selection extends the window to 4.5–9 h (EXTEND 2019). Late-window tenecteplase for LVO when EVT is unavailable is supported by TRACE-III (2024) and TIMELESS (2024). Tenecteplase 0.25 mg/kg single bolus is COR 1 alongside alteplase in the 2026 AHA/ASA guideline.',
  },
  'lvo-evt': {
    title: 'EVT for Large Vessel Occlusion Stroke · NeuroWiki',
    description: 'Mechanical thrombectomy for LVO stroke: early window (HERMES meta-analysis), late window (DAWN, DEFUSE-3), and large-core (SELECT2, ANGEL-ASPECT, LASTE, TENSION).',
    answer: 'EVT is COR 1 for ICA, M1, or basilar occlusion within 6 h based on HERMES meta-analysis (MR CLEAN, ESCAPE, EXTEND-IA, SWIFT PRIME, REVASCAT). Late-window EVT (6–24 h) requires clinical-imaging mismatch (DAWN) or perfusion mismatch (DEFUSE-3). Large-core EVT (ASPECTS 3–5) is now COR 1 based on five positive RCTs — RESCUE-Japan LIMIT, SELECT2, ANGEL-ASPECT, TENSION, and LASTE. ESCAPE-MeVO and DISTAL did not establish benefit for medium-vessel or distal occlusions.',
  },
  'anticoagulation': {
    title: 'When to Anticoagulate After Stroke · NeuroWiki',
    description: 'Timing of DOAC initiation after cardioembolic stroke: ELAN, TIMING, and OPTIMAS trial framework for AF-related ischemic stroke.',
    answer: 'ELAN (2023), TIMING (2022), and OPTIMAS (2024) showed that earlier DOAC initiation after AF-related stroke does not increase symptomatic ICH compared with later starts. ELAN suggested earlier treatment may reduce recurrent ischemic events. NeuroWiki operationalizes earlier-start using the ELAN framework: TIA/minor stroke within 48 h, moderate stroke around day 3–4, and major stroke at day 6–7, with imaging confirmation that hemorrhagic transformation is limited (HI1/HI2 acceptable; PH1/PH2 prompts delay).',
  },
  'hemicraniectomy': {
    title: 'Decompressive Hemicraniectomy for Malignant MCA Stroke · NeuroWiki',
    description: 'Evidence for decompressive surgery in malignant MCA infarction: DECIMAL, DESTINY, HAMLET pooled analysis, and DESTINY II for age >60.',
    answer: 'Decompressive hemicraniectomy within 48 h of malignant MCA infarction reduces mortality from approximately 70% to 20–30% in patients ≤60 years (pooled DECIMAL, DESTINY, HAMLET — Vahedi Lancet Neurology 2007). In patients >60 years, DESTINY II showed survival benefit but with most survivors at mRS 4–5; the decision is individualized around acceptable disability outcomes. CHARM (2024) tested glibenclamide for malignant edema prevention as an adjunct in the same population. The 2026 AHA/ASA guideline supports hemicraniectomy as COR 1 for patients ≤60 years and COR 2a for older patients with appropriate goals-of-care discussion.',
  },
  'bp-control': {
    title: 'Blood Pressure Targets in Acute Stroke · NeuroWiki',
    description: 'Evidence-based BP targets across the acute stroke continuum: pre-IVT, post-IVT, post-EVT, and ICH (ENCHANTED, INTERACT4, OPTIMAL-BP).',
    answer: 'Pre-tPA BP must be lowered to <185/110 mmHg before treatment and maintained <180/105 mmHg for 24 h post-tPA. ENCHANTED (2019) found no benefit and a numerical excess of disability with intensive (<140 mmHg) BP lowering during alteplase. Post-EVT, OPTIMAL-BP (2022) showed harm from intensive (<140 mmHg) targets; BP-TARGET and BEST-II were neutral. Prehospital BP lowering is not beneficial (RIGHT-2, MR ASAP, INTERACT4). For acute ICH, INTERACT-2 and ATACH-2 support SBP <140 mmHg within 1 hour without excess harm.',
  },
  'dapt': {
    title: 'Dual Antiplatelet Therapy After Stroke or TIA · NeuroWiki',
    description: 'Short-course DAPT for minor stroke and TIA: CHANCE, POINT, THALES, CHANCE-2, INSPIRES, and ARAMIS. SPS3 defines the duration boundary.',
    answer: 'Short-course DAPT (clopidogrel + aspirin for 21 days, then aspirin monotherapy) reduces 90-day stroke recurrence by approximately 25% in minor ischemic stroke (NIHSS ≤3) or high-risk TIA (ABCD2 ≥4) — established by CHANCE (2013, China) and confirmed by POINT (2018, North America). THALES (2020) showed ticagrelor + aspirin also works. CHANCE-2 (2021) addressed CYP2C19 loss-of-function carriers with ticagrelor. INSPIRES (2024) extended DAPT to atherosclerotic minor stroke/TIA within 72 h. SPS3 (2012) showed long-term DAPT for lacunar stroke causes net harm — duration must be limited to ~21 days.',
  },
  'basilar-evt': {
    title: 'EVT for Basilar Artery Occlusion · NeuroWiki',
    description: 'Basilar artery occlusion thrombectomy evidence: BEST and BASICS neutral, ATTENTION and BAOCHE positive. EVT now recommended up to 24 hours.',
    answer: 'Early basilar EVT trials BEST (2020, stopped early; substantial crossover) and BASICS (2021, neutral; 80% of controls received IV alteplase) did not establish benefit. Two later Chinese trials — ATTENTION (2022, 0–12 h) and BAOCHE (2022, 6–24 h, stopped early for benefit) — both showed improved functional outcomes with EVT. AHA/ASA 2026 endorses basilar EVT within 24 h based on ATTENTION and BAOCHE; BAOCHE was stopped early and effect size may be overestimated.',
  },
  'ich-surgery': {
    title: 'Surgical Evacuation for Intracerebral Hemorrhage · NeuroWiki',
    description: 'Four decades of ICH surgery trials: STICH I and STICH II neutral, MISTIE III neutral on function, ENRICH positive for minimally invasive parafascicular surgery.',
    answer: 'STICH I (2005) and STICH II (2013) found no overall benefit from open craniotomy for supratentorial ICH, though STICH II suggested directional benefit in superficial lobar hemorrhage. MISTIE III (2019) showed minimally invasive catheter aspiration plus tPA reduced clot volume but did not improve mRS at 1 year. ENRICH (2024) — using a Bayesian design — showed minimally invasive parafascicular surgery improved 180-day utility-weighted mRS for lobar and anterior basal ganglia ICH. ENRICH supports a new role for minimally invasive surgery in selected ICH; AHA/ASA 2022 guidelines pre-date ENRICH and rate minimally invasive surgery COR 2b.',
  },
  'msu-dispatch': {
    title: 'Mobile Stroke Unit Dispatch · NeuroWiki',
    description: 'Mobile stroke unit evidence: B_PROUD and BEST-MSU both showed improved functional outcomes with prehospital CT-equipped ambulance dispatch.',
    answer: 'B_PROUD (Berlin, 2021) and BEST-MSU (US, 2021) both demonstrated improved 90-day functional outcomes with mobile stroke unit dispatch versus conventional EMS. B_PROUD used a quasi-experimental design with ordinal mRS shift (common OR 0.71). BEST-MSU used alternating-week cluster randomization with utility-weighted mRS as the primary outcome. Both gain comes primarily from earlier tPA delivery. Implementation is constrained by cost and population density; the optimal MSU operational model and value-per-population threshold remain open questions.',
  },
  'icas-stenting': {
    title: 'Stenting for Intracranial Atherosclerosis · NeuroWiki',
    description: 'SAMMPRIS established harm from PTAS for symptomatic intracranial atherosclerotic stenosis; WEAVE provides post-market on-label safety data.',
    answer: 'SAMMPRIS (2011) was stopped early for harm and futility: percutaneous transluminal angioplasty and stenting with the Wingspan stent showed 14.7% 30-day stroke or death versus 5.8% with aggressive medical management for symptomatic 70–99% intracranial stenosis. WEAVE (2019) — an FDA-mandated post-market registry of on-label Wingspan use — reported a 2.6% 72-hour periprocedural event rate, much lower than SAMMPRIS, supporting that careful patient selection improves safety. Stenting is not first-line for symptomatic intracranial atherosclerosis; aggressive medical management with DAPT and statin remains the standard.',
  },
  'tnk-vs-alteplase': {
    title: 'Tenecteplase vs Alteplase for Stroke Thrombolysis · NeuroWiki',
    description: 'Head-to-head IVT trials from NOR-TEST (2017) to RAISE (2024): tenecteplase 0.25 mg/kg is noninferior to alteplase, easier to administer, and now COR 1 in AHA/ASA 2026.',
    answer: 'Tenecteplase 0.25 mg/kg single bolus is noninferior to alteplase across multiple RCTs — AcT (2022, Canada), TRACE-2 (2023, China), ORIGINAL (2024, China) — and showed superior angiographic reperfusion in EXTEND-IA TNK (2018) for LVO patients prior to EVT. NOR-TEST 2 Part A (2022) showed harm with high-dose 0.4 mg/kg TNK; the dose ceiling is 0.25 mg/kg. RAISE (2024) found reteplase superior to alteplase, expanding the agent-choice landscape. The 2026 AHA/ASA guideline lists tenecteplase 0.25 mg/kg as COR 1 alongside alteplase 0.9 mg/kg; tenecteplase is preferred operationally for its single-bolus administration.',
  },
  'direct-vs-bridging': {
    title: 'Direct EVT vs Bridging IV Thrombolysis · NeuroWiki',
    description: 'Six RCTs on direct thrombectomy vs IVT-bridging: DIRECT-MT and DEVT met noninferiority; SKIP, MR CLEAN-NO IV, SWIFT-DIRECT, and DIRECT-SAFE did not.',
    answer: 'Six RCTs tested whether direct EVT is noninferior to IV-thrombolysis-bridging in tPA-eligible LVO patients. DIRECT-MT (2020, China) and DEVT (2020, China) met noninferiority. SKIP (2020, Japan), MR CLEAN-NO IV (2021, Europe), SWIFT-DIRECT (2022, Europe), and DIRECT-SAFE (2022, multinational) did not meet noninferiority. Pooled evidence favors bridging for most tPA-eligible patients; AHA/ASA 2026 recommends IV thrombolysis should not be withheld in patients eligible for both treatments. Direct EVT is reasonable when tPA is contraindicated.',
  },
  'pfo-closure-cryptogenic': {
    title: 'PFO Closure for Cryptogenic Stroke · NeuroWiki',
    description: 'Three NEJM 2017 RCTs — CLOSE, RESPECT long-term, REDUCE — established benefit of PFO closure for cryptogenic stroke, with excess atrial fibrillation as the trade-off.',
    answer: 'Three RCTs published in NEJM 2017 established benefit of PFO closure for cryptogenic stroke in patients <60 years. CLOSE required atrial septal aneurysm or large shunt (NNT ~20 over 5 y). RESPECT long-term follow-up showed HR 0.55 for stroke recurrence (NNT ~42). REDUCE used a clean antiplatelet comparator and showed HR 0.23 (NNT ~28). All three trials demonstrated excess atrial fibrillation — typically transient and periprocedural — as a consistent trade-off. The earlier CLOSURE-I (2012) and original RESPECT (2013) were neutral; refined patient selection (RoPE score, shunt size, septal aneurysm) was needed for benefit.',
  },
  'asymptomatic-carotid': {
    title: 'Carotid Revascularization vs Medical Management · NeuroWiki',
    description: 'CREST (2010) compared CAS vs CEA; CREST-2 (2025) tested both against modern intensive medical management. CAS met its endpoint; CEA did not.',
    answer: 'CREST (2010) compared carotid artery stenting (CAS) with carotid endarterectomy (CEA) in mixed symptomatic and asymptomatic stenosis and found no difference in the composite primary endpoint, though periprocedural stroke favored CEA and periprocedural MI favored CAS. CREST-2 (2025) tested CAS and CEA separately against intensive medical management for asymptomatic ≥70% stenosis: stenting met its primary endpoint (P=0.02), while CEA did not (P=0.24). Intensive medical management — high-intensity statin, antiplatelet, BP and glycemic targets — has substantially narrowed the margin for revascularization in asymptomatic carotid stenosis.',
  },
  'ich-anticoagulation-reversal': {
    title: 'Anticoagulation Reversal in ICH · NeuroWiki',
    description: 'Four-PCC vs FFP for warfarin (Sarode 2013), platelet HARM in antiplatelet-ICH (PATCH), andexanet for FXa inhibitors (ANNEXA-4, ANNEXA-I).',
    answer: 'For warfarin-associated ICH, Sarode (2013) established 4-factor PCC as noninferior to FFP for hemostasis with faster INR correction — underwriting the AHA/ASA Class I, Level A recommendation. Dose 25–50 units/kg IV with vitamin K 10 mg IV. PATCH (2016) showed platelet transfusion in antiplatelet-associated ICH caused HARM (COR 3: Harm per AHA/ASA 2022 ICH guideline). ANNEXA-4 (2019) — the single-arm cohort behind FDA approval of andexanet alfa for FXa-inhibitor reversal — reported good hemostasis in ~80%. ANNEXA-I (2024) was the first RCT specifically in FXa-inhibitor-associated ICH and showed andexanet improved hemostasis versus usual care, with a small excess of ischemic events (notably ischemic stroke) as the trade-off. Idarucizumab 5 g IV is first-line for dabigatran reversal.',
  },
  'crao-management': {
    title: 'CRAO Thrombolysis: EAGLE and THEIA · NeuroWiki',
    description: 'Central retinal artery occlusion: intra-arterial alteplase halted for harm in EAGLE (2010); IV alteplase neutral but directionally favorable in the small THEIA RCT (2025).',
    answer: 'EAGLE (2010) — intra-arterial alteplase within 24 h of CRAO — was halted for harm versus conservative management; intra-arterial thrombolysis is not recommended. THEIA (2025) was the first RCT of IV alteplase versus aspirin in CRAO within 4.5 h. The trial was small (N=70) and neutral on the primary endpoint, but directionally favored alteplase. Evidence is insufficient to recommend systemic thrombolysis routinely for CRAO; treatment within a 4.5 h ischemia window, weighed against hemorrhagic risk, is reasonable on a case-by-case basis at centers familiar with stroke thrombolysis. CRAO is a stroke equivalent and warrants full stroke workup.',
  },
};

function questionSchema(
  pathname: string,
  _questionId: string,
  title: string,
  description: string,
  answer: string
): object {
  const url = `${BASE_URL}${pathname}`;

  const graph: object[] = [
    {
      '@type': 'MedicalWebPage',
      name: title,
      description,
      url,
      medicalSpecialty: 'Neurology',
      audience: { '@type': 'MedicalAudience', audienceType: 'Physician, Neurologist, Resident' },
      publisher: PUBLISHER,
      lastReviewed: LAST_REVIEWED,
      datePublished: DATE_PUBLISHED,
      dateModified: DATE_MODIFIED,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Clinical Trials', item: `${BASE_URL}/trials` },
        { '@type': 'ListItem', position: 3, name: 'Clinical Questions', item: `${BASE_URL}/trials` },
        { '@type': 'ListItem', position: 4, name: title.replace(' · NeuroWiki', ''), item: url },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: title.replace(' · NeuroWiki', ''),
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer,
          },
        },
      ],
    },
  ];

  return { '@context': 'https://schema.org', '@graph': graph };
}

// ── Trial schema ──────────────────────────────────────────────────────────────

function trialSchema(pathname: string, title: string, description: string, trialLabel: string): object {
  const url = `${BASE_URL}${pathname}`;

  const graph: object[] = [
    {
      '@type': 'MedicalWebPage',
      name: title,
      description,
      url,
      medicalSpecialty: 'Neurology',
      audience: { '@type': 'MedicalAudience', audienceType: 'Physician, Neurologist, Resident' },
      // Upgrade 2026-05-18: dual @about — MedicalStudy is the more specific
      // schema.org type for clinical trials (vs MedicalScholarlyArticle which
      // is a write-up of any medical scholarship). Both kept for backwards
      // compatibility with crawlers that haven't picked up MedicalStudy.
      // Structural only — does NOT populate phase/enrollment/studyDesign
      // (those are per-trial data, would require per-page registration).
      about: [
        { '@type': 'MedicalStudy', name: trialLabel, url, studyLocation: { '@type': 'AdministrativeArea', name: 'Multi-center' } },
        { '@type': 'MedicalScholarlyArticle', name: trialLabel, url },
      ],
      publisher: PUBLISHER,
      lastReviewed: LAST_REVIEWED,
      datePublished: DATE_PUBLISHED,
      dateModified: DATE_MODIFIED,
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

  return { '@context': 'https://schema.org', '@graph': graph };
}

// ── Breadcrumb label maps ─────────────────────────────────────────────────────

/** Calculator display names for schema mainEntity + breadcrumb */
const CALC_NAMES: Record<string, { app: string; breadcrumb: string }> = {
  '/calculators/aspects-score':                      { app: 'ASPECTS Score Calculator', breadcrumb: 'ASPECTS Score' },
  '/calculators/nihss':                              { app: 'NIHSS Calculator', breadcrumb: 'NIHSS Calculator' },
  '/calculators/ich-score':                          { app: 'ICH Score Calculator', breadcrumb: 'ICH Score' },
  '/calculators/abcd2-score':                        { app: 'ABCD² Score Calculator', breadcrumb: 'ABCD² Score' },
  '/calculators/has-bled-score':                     { app: 'HAS-BLED Score Calculator', breadcrumb: 'HAS-BLED Score' },
  '/calculators/rope-score':                         { app: 'RoPE Score Calculator', breadcrumb: 'RoPE Score' },
  '/calculators/glasgow-coma-scale':                 { app: 'Glasgow Coma Scale Calculator', breadcrumb: 'Glasgow Coma Scale' },
  '/calculators/heidelberg-bleeding-classification': { app: 'Heidelberg Bleeding Classification', breadcrumb: 'Heidelberg Classification' },
  '/calculators/boston-criteria-caa':                { app: 'Boston Criteria 2.0 for CAA', breadcrumb: 'Boston Criteria 2.0' },
  '/calculators/em-billing':                         { app: 'E/M Billing Calculator', breadcrumb: 'E/M Billing' },
  '/calculators/chads-vasc':                         { app: 'CHA₂DS₂-VASc Score Calculator', breadcrumb: 'CHA₂DS₂-VASc Score' },
};

/** Pathway display names for schema mainEntity + breadcrumb */
const PATHWAY_NAMES: Record<string, { app: string; breadcrumb: string }> = {
  '/pathways/stroke-code':    { app: 'Stroke Code Pathway', breadcrumb: 'Stroke Code' },
  '/pathways/evt':            { app: 'EVT Thrombectomy Pathway', breadcrumb: 'EVT Pathway' },
  '/pathways/elan-pathway':   { app: 'ELAN Anticoagulation Pathway', breadcrumb: 'ELAN Pathway' },
  '/pathways/late-window-ivt': { app: 'Late Window IVT Pathway', breadcrumb: 'Late Window IVT' },
  '/pathways/se-pathway':     { app: 'Status Epilepticus Pathway', breadcrumb: 'SE Pathway' },
  '/pathways/migraine-pathway': { app: 'Migraine Pathway', breadcrumb: 'Migraine Pathway' },
};

const GUIDE_LABELS: Record<string, string> = {
  '/guide/stroke-basics':       'Stroke Basics',
  '/guide/iv-tpa':              'IV tPA Protocol',
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
  '/guide/aha-2026-guideline':  '2026 AHA/ASA Stroke Guideline Mindmap',
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
  // Added 2026-05-20
  '/trials/profess-trial':           'PRoFESS Trial',
  '/trials/crest-trial':             'CREST Trial',
};

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Returns JSON-LD object for the given pathname and meta. Used by Seo component to inject script.
 */
export function getSchemaForRoute(
  pathname: string,
  meta: { title: string; description: string }
): object | null {
  if (pathname === '/') {
    // Homepage gets Organization + FAQPage in a single @graph so the
    // homepage FAQs only inject on / (previously they were inlined into
    // index.html, which embedded a duplicate FAQPage on every route —
    // GSC flagged this as a "duplicate FAQ" critical error on the GCS
    // calculator page and likely on every other per-route FAQ page).
    const homepageFaqs = PAGE_FAQS['/'];
    return {
      '@context': 'https://schema.org',
      '@graph': [
        { '@context': undefined, ...ORGANIZATION_SCHEMA },
        ...(homepageFaqs && homepageFaqs.length > 0
          ? [
              {
                '@type': 'FAQPage',
                mainEntity: homepageFaqs.map((f) => ({
                  '@type': 'Question',
                  name: f.question,
                  acceptedAnswer: { '@type': 'Answer', text: f.answer },
                })),
              },
            ]
          : []),
      ],
    };
  }
  if (pathname === '/calculators') return CALCULATORS_HUB_SCHEMA;
  if (pathname === '/guide') return GUIDE_HUB_SCHEMA;
  if (pathname === '/trials') return TRIALS_HUB_SCHEMA;
  // /pathways hub — placeholder schema until Prompt 5e builds the full hub
  if (pathname === '/pathways') return null;

  if (pathname.startsWith('/calculators/')) {
    const entry = CALC_NAMES[pathname];
    const appName = entry?.app ?? pathname.split('/').pop()?.replace(/-/g, ' ') ?? 'Calculator';
    const breadcrumb = entry?.breadcrumb ?? appName;
    return calculatorSchema(pathname, meta.title, meta.description, appName, breadcrumb);
  }

  if (pathname.startsWith('/pathways/')) {
    const entry = PATHWAY_NAMES[pathname];
    const appName = entry?.app ?? pathname.split('/').pop()?.replace(/-/g, ' ') ?? 'Pathway';
    const breadcrumb = entry?.breadcrumb ?? appName;
    return pathwaySchema(pathname, meta.title, meta.description, appName, breadcrumb);
  }

  if (pathname.startsWith('/guide/')) {
    const label = GUIDE_LABELS[pathname] ?? pathname.split('/').pop()?.replace(/-/g, ' ') ?? 'Guide';
    return guideSchema(pathname, meta.title, meta.description, label);
  }

  if (pathname.startsWith('/trials/q/')) {
    const questionId = pathname.split('/').pop() ?? '';
    const qMeta = QUESTION_META[questionId];
    if (qMeta) {
      return questionSchema(pathname, questionId, qMeta.title, qMeta.description, qMeta.answer);
    }
    // Fallback for question IDs not yet in QUESTION_META: generic MedicalWebPage
    return {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: meta.title,
      description: meta.description,
      url: `${BASE_URL}${pathname}`,
      medicalSpecialty: 'Neurology',
      audience: { '@type': 'MedicalAudience', audienceType: 'Physician, Neurologist, Resident' },
      publisher: PUBLISHER,
    };
  }

  if (pathname.startsWith('/trials/')) {
    const label = TRIAL_LABELS[pathname] ?? pathname.split('/').pop()?.replace(/-/g, ' ') ?? 'Trial';
    return trialSchema(pathname, meta.title, meta.description, label);
  }

  return null;
}

/**
 * Returns the FAQ items for a given route (for rendering in the visible
 * DiscreteFAQ accordion). The same data is already fed into JSON-LD
 * FAQPage schema via getSchemaForRoute — both surfaces share PAGE_FAQS.
 *
 * Returns an empty array when the route has no FAQ entry. Pages decide
 * whether to render the accordion based on whether the returned array
 * is non-empty.
 */
export function getFAQsForPath(
  pathname: string
): Array<{ question: string; answer: string }> {
  return PAGE_FAQS[pathname] ?? [];
}
