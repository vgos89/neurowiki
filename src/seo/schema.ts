/**
 * JSON-LD structured data for SEO. Injected per-route to help Google understand
 * medical content and enable rich results (e.g. MedicalWebPage, SoftwareApplication,
 * BreadcrumbList, FAQPage).
 */

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
  description: 'The Digital Neurology Companion — evidence-based protocols, calculators, and clinical guidelines for neurologists and residents.',
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
      description: 'Free, evidence-based neurology calculators for stroke, hemorrhage, TIA, and neurocritical care.',
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
      description: 'Evidence-based neurology protocols and clinical guides for residents, attendings, and medical students.',
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
      name: 'Landmark Neurology Trials — Stroke, EVT & Antiplatelet | NeuroWiki',
      description: 'Summaries of pivotal clinical trials in vascular neurology: DAWN, DEFUSE-3, NINDS, ELAN, CHANCE, POINT, and more.',
      url: `${BASE_URL}/trials`,
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
      answer: 'Per AHA/ASA 2026 guidelines, EVT is indicated for LVO (ICA, M1, M2, basilar artery) with pre-stroke mRS 0–2, within 6 hours (any ASPECTS), or 6–24 hours with clinical-imaging mismatch (DAWN criteria) or perfusion imaging mismatch (DEFUSE-3 criteria). Large core (ASPECTS 3–5) now also eligible (COR 1, SELECT-2, ANGEL-ASPECT).',
    },
    {
      question: 'What is the EVT time window?',
      answer: 'The early window is 0–6 hours from last known well. The extended window is 6–24 hours for patients meeting DAWN criteria (age/NIHSS/infarct core mismatch) or DEFUSE-3 criteria (perfusion mismatch, core <70 mL). Basilar artery occlusion may be treated up to 24 hours (ATTENTION, BAOCHE trials).',
    },
    {
      question: 'What ASPECTS score is required for thrombectomy?',
      answer: 'Early-window EVT has no minimum ASPECTS cutoff per 2026 AHA/ASA guidelines. For large core infarct (ASPECTS 3–5), EVT is now COR 1 based on SELECT-2 and ANGEL-ASPECT trials. ASPECTS 0–2 remains a relative contraindication due to very high hemorrhage risk.',
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

function trialSchema(pathname: string, title: string, description: string, trialLabel: string): object {
  const url = `${BASE_URL}${pathname}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalWebPage',
        name: title,
        description,
        url,
        audience: { '@type': 'MedicalAudience', audienceType: 'Physician, Neurologist, Resident' },
        about: { '@type': 'MedicalScholarlyArticle', name: title },
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
    ],
  };
}

// ── Breadcrumb label maps ─────────────────────────────────────────────────────

/** Calculator display names for schema mainEntity + breadcrumb */
const CALC_NAMES: Record<string, { app: string; breadcrumb: string }> = {
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
  '/trials/ninds-trial':        'NINDS Trial',
  '/trials/ecass3-trial':       'ECASS-3 Trial',
  '/trials/extend-trial':       'EXTEND Trial',
  '/trials/eagle-trial':        'EAGLE Trial',
  '/trials/wake-up-trial':      'WAKE-UP Trial',
  '/trials/dawn-trial':         'DAWN Trial',
  '/trials/defuse-3-trial':     'DEFUSE-3 Trial',
  '/trials/select2-trial':      'SELECT-2 Trial',
  '/trials/angel-aspect-trial': 'ANGEL-ASPECT Trial',
  '/trials/distal-trial':       'DISTAL Trial',
  '/trials/escape-mevo-trial':  'ESCAPE-MEVO Trial',
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
