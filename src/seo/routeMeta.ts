import { DEFAULT_META, STATIC_ROUTE_META_LOOKUP, type MetaData } from '../config/routeManifest';
import { categoryNames, findTrialById } from '../data/trialListData';
import { normalizeTrialSlug } from '../data/trialPayload';

// ── Per-question metadata for /trials/q/:id ───────────────────────────────────
// Titles ≤60 chars, descriptions ≤160 chars.
// Must stay in sync with QUESTION_META in src/seo/schema.ts.
const QUESTION_ROUTE_META: Record<string, Pick<MetaData, 'title' | 'description' | 'keywords'>> = {
  'large-core-evt': {
    title: 'EVT for Large-Core Stroke (Low ASPECTS) · NeuroWiki',
    description: 'Four positive RCTs (LASTE, SELECT2, ANGEL-ASPECT, TENSION) changed EVT practice for low-ASPECTS large-core stroke. Evidence summary.',
    keywords: 'large core EVT, low ASPECTS thrombectomy, LASTE trial, SELECT2 trial, ANGEL-ASPECT trial, TENSION trial, large core infarct EVT',
  },
  'late-window-selection': {
    title: 'Perfusion vs Non-Contrast CT for Late-Window EVT · NeuroWiki',
    description: 'How to select patients for late-window EVT — perfusion mismatch (DAWN, DEFUSE-3) versus plain-CT large-core approach (LASTE, TENSION, SELECT2).',
    keywords: 'late window EVT selection, perfusion imaging thrombectomy, DAWN trial, DEFUSE-3, late window stroke, non-contrast CT EVT selection',
  },
  'aspiration-vs-stentriever': {
    title: 'Aspiration vs Stent Retriever for Thrombectomy · NeuroWiki',
    description: 'Three RCTs (ASTER, COMPASS, ASTER2) comparing direct aspiration first versus stent-retriever-first thrombectomy. No clear winner on functional outcomes.',
    keywords: 'aspiration thrombectomy, stent retriever EVT, ASTER trial, COMPASS trial, ASTER2, direct aspiration first, thrombectomy device comparison',
  },
  'evt-adjunct-pharmacotherapy': {
    title: 'Adjunct Pharmacotherapy During EVT · NeuroWiki',
    description: 'Nerinetide (ESCAPE-NA1), adjunct IA alteplase (CHOICE), and tirofiban (RESCUE BT): evidence on pharmacologic adjuncts to mechanical thrombectomy.',
    keywords: 'EVT adjunct therapy, nerinetide ESCAPE-NA1, CHOICE trial IA alteplase, RESCUE BT tirofiban, neuroprotection thrombectomy, adjunct EVT pharmacotherapy',
  },
  'minor-stroke-choice': {
    title: 'Minor Stroke — tPA, DAPT, or Aspirin? · NeuroWiki',
    description: 'PRISMS, ARAMIS, CHANCE, POINT, and INSPIRES define the evidence for treating minor non-disabling ischemic stroke without thrombolysis.',
    keywords: 'minor stroke treatment, non-disabling stroke tPA, PRISMS trial, ARAMIS trial, CHANCE DAPT minor stroke, minor stroke thrombolysis DAPT',
  },
  'mevo-distal-evt': {
    title: 'EVT for MeVO or Distal Occlusion · NeuroWiki',
    description: 'ESCAPE-MeVO and DISTAL — the first two RCTs in medium-vessel and distal occlusions — both failed their primary endpoints. Evidence summary.',
    keywords: 'MeVO EVT, distal occlusion thrombectomy, ESCAPE-MeVO trial, DISTAL trial, medium vessel occlusion, M2 M3 EVT, distal EVT evidence',
  },
  'post-evt-bp-target': {
    title: 'Post-EVT Blood Pressure Target · NeuroWiki',
    description: 'Four RCTs (BP-TARGET, BEST-II, OPTIMAL-BP, ENCHANTED) on post-EVT blood pressure management. OPTIMAL-BP showed harm from intensive lowering.',
    keywords: 'post EVT blood pressure, thrombectomy BP target, OPTIMAL-BP trial, BP-TARGET trial, BEST-II trial, post thrombectomy hypertension, EVT BP management',
  },
  // 16 entries added 2026-05-22 — sourced from QUESTION_META in
  // src/seo/schema.ts (commit cb0f51b, clinical-reviewer approved). These
  // route metas must stay in sync with QUESTION_META titles + descriptions.
  'tpa-timing': {
    title: 'When to Give IV Thrombolysis for Stroke · NeuroWiki',
    description: 'Evidence for IV thrombolysis windows in acute ischemic stroke: 0–3h (NINDS), 0–4.5h (ECASS-3), wake-up (WAKE-UP), and 4.5–24h (EXTEND, TRACE-III, TIMELESS).',
    keywords: 'IV thrombolysis timing, tPA window stroke, NINDS trial, ECASS-3 trial, late window thrombolysis, WAKE-UP trial, EXTEND trial, TRACE-III trial, TIMELESS trial',
  },
  'lvo-evt': {
    title: 'EVT for Large Vessel Occlusion Stroke · NeuroWiki',
    description: 'Mechanical thrombectomy for LVO stroke: early window (HERMES meta-analysis), late window (DAWN, DEFUSE-3), and large-core (SELECT2, ANGEL-ASPECT, LASTE, TENSION).',
    keywords: 'LVO EVT, large vessel occlusion thrombectomy, HERMES meta-analysis, DAWN trial, DEFUSE-3 trial, SELECT2 trial, ANGEL-ASPECT trial, LASTE trial, TENSION trial',
  },
  'tnk-vs-alteplase': {
    title: 'Tenecteplase vs Alteplase for Stroke Thrombolysis · NeuroWiki',
    description: 'Head-to-head IVT trials from NOR-TEST (2017) to RAISE (2024): tenecteplase 0.25 mg/kg is noninferior to alteplase, easier to administer, and now COR 1 in AHA/ASA 2026.',
    keywords: 'tenecteplase vs alteplase, TNK stroke, NOR-TEST trial, AcT trial, ORIGINAL trial, RAISE trial, TRACE-2 trial, TNK noninferiority, stroke thrombolysis comparison',
  },
  'direct-vs-bridging': {
    title: 'Direct EVT vs Bridging IV Thrombolysis · NeuroWiki',
    description: 'Six RCTs on direct thrombectomy vs IVT-bridging: DIRECT-MT and DEVT met noninferiority; SKIP, MR CLEAN-NO IV, SWIFT-DIRECT, and DIRECT-SAFE did not.',
    keywords: 'direct EVT vs bridging, DIRECT-MT trial, DEVT trial, SKIP trial, MR CLEAN-NO IV, SWIFT-DIRECT trial, DIRECT-SAFE trial, bridging therapy stroke, IVT before thrombectomy',
  },
  'basilar-evt': {
    title: 'EVT for Basilar Artery Occlusion · NeuroWiki',
    description: 'Basilar artery occlusion thrombectomy evidence: BEST and BASICS neutral, ATTENTION and BAOCHE positive. EVT now recommended up to 24 hours.',
    keywords: 'basilar artery occlusion EVT, posterior circulation thrombectomy, BEST trial, BASICS trial, ATTENTION trial, BAOCHE trial, basilar thrombectomy',
  },
  'anticoagulation': {
    title: 'When to Anticoagulate After Stroke · NeuroWiki',
    description: 'Timing of DOAC initiation after cardioembolic stroke: ELAN, TIMING, and OPTIMAS trial framework for AF-related ischemic stroke.',
    keywords: 'anticoagulation timing stroke, DOAC after stroke, ELAN trial, TIMING trial, OPTIMAS trial, AF stroke anticoagulation, post stroke anticoagulation',
  },
  'dapt': {
    title: 'Dual Antiplatelet Therapy After Stroke or TIA · NeuroWiki',
    description: 'Short-course DAPT for minor stroke and TIA: CHANCE, POINT, THALES, CHANCE-2, INSPIRES, and ARAMIS. SPS3 defines the duration boundary.',
    keywords: 'DAPT stroke, dual antiplatelet TIA, CHANCE trial, POINT trial, THALES trial, CHANCE-2 trial, INSPIRES trial, ARAMIS trial, SPS3 trial, short course DAPT',
  },
  'bp-control': {
    title: 'Blood Pressure Targets in Acute Stroke · NeuroWiki',
    description: 'Evidence-based BP targets across the acute stroke continuum: pre-IVT, post-IVT, post-EVT, and ICH (ENCHANTED, INTERACT4, OPTIMAL-BP).',
    keywords: 'BP targets acute stroke, ENCHANTED trial, INTERACT4 trial, OPTIMAL-BP trial, pre IVT BP, post EVT BP, ICH BP control, stroke hypertension management',
  },
  'hemicraniectomy': {
    title: 'Decompressive Hemicraniectomy for Malignant MCA Stroke · NeuroWiki',
    description: 'Evidence for decompressive surgery in malignant MCA infarction: DECIMAL, DESTINY, HAMLET pooled analysis, and DESTINY II for age >60.',
    keywords: 'decompressive hemicraniectomy, malignant MCA infarction, DECIMAL trial, DESTINY trial, HAMLET trial, DESTINY II trial, craniectomy stroke, space occupying stroke',
  },
  'ich-surgery': {
    title: 'Surgical Evacuation for Intracerebral Hemorrhage · NeuroWiki',
    description: 'Four decades of ICH surgery trials: STICH I and STICH II neutral, MISTIE III neutral on function, ENRICH positive for minimally invasive parafascicular surgery.',
    keywords: 'ICH surgery, intracerebral hemorrhage evacuation, STICH trial, MISTIE III trial, ENRICH trial, minimally invasive ICH, hemorrhage surgical evacuation',
  },
  'ich-anticoagulation-reversal': {
    title: 'Anticoagulation Reversal in ICH · NeuroWiki',
    description: 'Four-PCC vs FFP for warfarin (Sarode 2013), platelet HARM in antiplatelet-ICH (PATCH), andexanet for FXa inhibitors (ANNEXA-4, ANNEXA-I).',
    keywords: 'ICH anticoagulation reversal, 4 factor PCC, Sarode 2013, PATCH trial platelet, ANNEXA-4 andexanet, ANNEXA-I trial, FXa inhibitor reversal, warfarin reversal ICH',
  },
  'pfo-closure-cryptogenic': {
    title: 'PFO Closure for Cryptogenic Stroke · NeuroWiki',
    description: 'Three NEJM 2017 RCTs — CLOSE, RESPECT long-term, REDUCE — established benefit of PFO closure for cryptogenic stroke, with excess atrial fibrillation as the trade-off.',
    keywords: 'PFO closure stroke, cryptogenic stroke, CLOSE trial, RESPECT trial, REDUCE trial, patent foramen ovale, PFO recurrent stroke prevention',
  },
  'asymptomatic-carotid': {
    title: 'Carotid Revascularization vs Medical Management · NeuroWiki',
    description: 'CREST (2010) compared CAS vs CEA; CREST-2 (2025) tested both against modern intensive medical management. CAS met its endpoint; CEA did not.',
    keywords: 'asymptomatic carotid stenosis, carotid revascularization, CREST trial, CREST-2 trial, CEA vs CAS, carotid endarterectomy, carotid artery stenting',
  },
  'icas-stenting': {
    title: 'Stenting for Intracranial Atherosclerosis · NeuroWiki',
    description: 'SAMMPRIS established harm from PTAS for symptomatic intracranial atherosclerotic stenosis; WEAVE provides post-market on-label safety data.',
    keywords: 'intracranial atherosclerosis stenting, ICAS, SAMMPRIS trial, WEAVE trial, intracranial stenosis treatment, percutaneous transluminal angioplasty stenting',
  },
  'msu-dispatch': {
    title: 'Mobile Stroke Unit Dispatch · NeuroWiki',
    description: 'Mobile stroke unit evidence: B_PROUD and BEST-MSU both showed improved functional outcomes with prehospital CT-equipped ambulance dispatch.',
    keywords: 'mobile stroke unit, MSU dispatch, B_PROUD trial, BEST-MSU trial, prehospital stroke CT, ambulance based thrombolysis, stroke prehospital triage',
  },
  'crao-management': {
    title: 'CRAO Thrombolysis: EAGLE and THEIA · NeuroWiki',
    description: 'Central retinal artery occlusion: intra-arterial alteplase halted for harm in EAGLE (2010); IV alteplase neutral but directionally favorable in the small THEIA RCT (2025).',
    keywords: 'CRAO management, central retinal artery occlusion, EAGLE trial, THEIA trial, retinal stroke thrombolysis, CRAO IV alteplase',
  },
};

function buildTrialMeta(pathname: string, slug: string): MetaData | null {
  const trialId = normalizeTrialSlug(slug);
  const trial = findTrialById(trialId);

  if (!trial) return null;

  const description = trial.description
    ?? trial.clinicalContext
    ?? `Stroke clinical trial summary for ${trial.name}.`;

  return {
    ...DEFAULT_META,
    title: `${trial.name} — ${categoryNames[trial.category]} | NeuroWiki`,
    description,
    keywords: `${trial.name} trial, ${trial.name} stroke trial, ${trial.name} results, ${categoryNames[trial.category].toLowerCase()}, stroke clinical trial summary`,
  };
}

export const getRouteMeta = (pathname: string): MetaData => {
  if (STATIC_ROUTE_META_LOOKUP[pathname]) {
    return STATIC_ROUTE_META_LOOKUP[pathname];
  }

  if (pathname.startsWith('/calculators/')) {
    const id = pathname.split('/')[2] ?? '';
    const name = id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
    return {
      ...DEFAULT_META,
      title: `${name} Calculator | NeuroWiki`,
      description: `Calculate ${name} score and view clinical interpretation.`,
    };
  }

  if (pathname.startsWith('/trials/q/')) {
    const questionId = pathname.split('/').pop() ?? '';
    const qMeta = QUESTION_ROUTE_META[questionId];
    if (qMeta) {
      return { ...DEFAULT_META, ...qMeta };
    }
    // Fallback for question IDs not yet in the lookup
    const title = questionId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    return {
      ...DEFAULT_META,
      title: `${title} — Clinical Question | NeuroWiki`,
      description: `Evidence summary for the clinical question: ${title}. Stroke trials curated by NeuroWiki.`,
    };
  }

  if (pathname.startsWith('/trials/')) {
    const slug = pathname.split('/').pop() ?? '';
    const meta = buildTrialMeta(pathname, slug);
    if (meta) {
      return meta;
    }
  }

  if (pathname.startsWith('/guide/') || pathname.startsWith('/trials/')) {
    const slug = pathname.split('/').pop() || '';
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    const type = pathname.startsWith('/trials/') ? 'Clinical Trial' : 'Clinical Guide';
    return {
      ...DEFAULT_META,
      title: `${title} - ${type} | NeuroWiki`,
      description: `Detailed ${type.toLowerCase()} summary for ${title}.`,
    };
  }
  return DEFAULT_META;
};
