/**
 * Read the Scan — Non-contrast CT head (v1 ImagingModule instance).
 *
 * Search choreography follows the "Blood Can Be Very Bad" mnemonic:
 *   Blood -> Cisterns -> Brain -> Ventricles -> Bone.
 *
 * Governance:
 *  - Every clinician-actionable ClinicalNote (normal / abnormal / pitfalls)
 *    carries a claimId registered in src/lib/citations/claims.ts against a
 *    DATA_SURFACE. Purely definitional terminology entries reference the
 *    glossary and carry no clinical claim.
 *  - The ASPECTS -> EVT eligibility statement REUSES the existing registered
 *    claim aspects-evt-eligibility-2026 (AHA/ASA 2026 §4.7.2); it is not
 *    re-registered here.
 *  - Do not write a quoted claim-tag literal inside a comment in this file:
 *    the pre-commit scanner does not strip comments.
 *  - User-visible strings contain no em-dash character (CLAUDE.md §10.3); the
 *    en-dash is used only for numeric ranges.
 *
 * Evidence source: docs/evidence-packets/imaging-read-ct-head.md (2026-07-09).
 * Image manifest:  docs/imaging/ct-head-image-manifest.md.
 */

import type { ImagingModule, TeachingImage } from './types';

// ── Shared teaching figures ─────────────────────────────────────────────────

const schHematomaShapes: TeachingImage = {
  id: 'sch-hematoma-shapes',
  kind: 'schematic',
  src: '/imaging/schematics/hematoma-shapes.svg',
  alt: 'Line art comparing a biconvex epidural collection with a crescentic subdural collection over the skull.',
  caption: 'Epidural (biconvex, stops at sutures) versus subdural (crescentic, crosses sutures) relative to the skull and dura.',
  license: { source: 'original', license: 'original', attribution: 'NeuroWiki original illustration' },
  status: 'ready',
};

const schBasalCisterns: TeachingImage = {
  id: 'sch-basal-cisterns',
  kind: 'schematic',
  src: '/imaging/schematics/basal-cisterns.svg',
  alt: 'Axial line art marking the suprasellar, interpeduncular, ambient, quadrigeminal, and prepontine cisterns.',
  caption: 'The key basal cisterns on an axial section: suprasellar, interpeduncular, ambient, quadrigeminal, prepontine.',
  license: { source: 'original', license: 'original', attribution: 'NeuroWiki original illustration' },
  status: 'ready',
};

const schVentricles: TeachingImage = {
  id: 'sch-ventricles',
  kind: 'schematic',
  src: '/imaging/schematics/ventricles.svg',
  alt: 'Line art map of the ventricular system: lateral ventricles, third ventricle, aqueduct, fourth ventricle.',
  caption: 'Ventricular system map: lateral ventricles (horns, body, atrium), foramen of Monro, third ventricle, cerebral aqueduct, fourth ventricle.',
  license: { source: 'original', license: 'original', attribution: 'NeuroWiki original illustration' },
  status: 'ready',
};

const schWindowing: TeachingImage = {
  id: 'sch-windowing',
  kind: 'schematic',
  src: '/imaging/schematics/windowing.svg',
  alt: 'Line art showing the same CT section rendered on brain, stroke, subdural, and bone windows.',
  caption: 'How window width and level change what is visible: brain, narrow stroke, subdural, and bone windows on one section.',
  license: { source: 'original', license: 'original', attribution: 'NeuroWiki original illustration' },
  status: 'ready',
};

// Photo candidates (Wikimedia). Binaries not yet dropped in; render as a
// labelled placeholder until the asset lands. Byline confirmed at drop-in.
const photoEpidural: TeachingImage = {
  id: 'photo-epidural',
  kind: 'photo',
  src: '/imaging/photos/photo-epidural.jpg',
  alt: 'Non-contrast CT showing a biconvex hyperdense extra-axial collection.',
  caption: 'Epidural hematoma: biconvex hyperdense collection that does not cross the suture.',
  license: {
    source: 'wikimedia',
    license: 'CC-BY-SA-4.0',
    author: 'Wikimedia Commons contributor (byline to be confirmed at drop-in)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:EpiduralHematoma.jpg',
    attribution: 'Wikimedia Commons, CC BY-SA 4.0 (author byline to be confirmed at drop-in)',
  },
  status: 'pending',
};

const photoSubdural: TeachingImage = {
  id: 'photo-subdural',
  kind: 'photo',
  src: '/imaging/photos/photo-subdural.jpg',
  alt: 'Non-contrast CT showing a crescentic hyperdense extra-axial collection over the convexity.',
  caption: 'Subdural hematoma: crescentic collection that crosses sutures but not the midline.',
  license: {
    source: 'wikimedia',
    license: 'CC-BY-SA-4.0',
    author: 'Wikimedia Commons contributor (byline to be confirmed at drop-in)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ct-scan_of_the_brain_with_an_subdural_hematoma.jpg',
    attribution: 'Wikimedia Commons, CC BY-SA 4.0 (author byline to be confirmed at drop-in)',
  },
  status: 'pending',
};

const photoSah: TeachingImage = {
  id: 'photo-sah',
  kind: 'photo',
  src: '/imaging/photos/photo-sah.png',
  alt: 'Non-contrast CT showing hyperdense material filling the basal cisterns.',
  caption: 'Subarachnoid hemorrhage: hyperdensity in the sulci and basal cisterns.',
  license: {
    source: 'wikimedia',
    license: 'CC-BY-4.0',
    author: 'Wikimedia Commons contributor (byline to be confirmed at drop-in)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:CT_of_subarachnoid_hemorrhage.png',
    attribution: 'Wikimedia Commons, CC BY 4.0 (author byline to be confirmed at drop-in)',
  },
  status: 'pending',
};

const photoIch: TeachingImage = {
  id: 'photo-ich',
  kind: 'photo',
  src: '/imaging/photos/photo-ich.jpg',
  alt: 'Non-contrast CT showing a hyperdense intraparenchymal hematoma.',
  caption: 'Intraparenchymal hemorrhage: hyperdense clot within the brain parenchyma.',
  license: {
    source: 'wikimedia',
    license: 'CC-BY-SA-4.0',
    author: 'Wikimedia Commons contributor (byline to be confirmed at drop-in)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Intracerebral_hemorrage_(CT_scan).jpg',
    attribution: 'Wikimedia Commons, CC BY-SA 4.0 (author byline to be confirmed at drop-in)',
  },
  status: 'pending',
};

const photoBrainNormal: TeachingImage = {
  id: 'photo-brain-normal',
  kind: 'photo',
  src: '/imaging/photos/photo-brain-normal.png',
  alt: 'Non-contrast CT of a normal brain with crisp gray-white differentiation.',
  caption: 'Normal reference: crisp, symmetric gray-white differentiation and visible sulci.',
  license: {
    source: 'wikimedia',
    license: 'CC-BY-SA-4.0',
    author: 'Wikimedia Commons contributor (byline to be confirmed at drop-in)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Computed_tomography_of_human_brain_-_large.png',
    attribution: 'Wikimedia Commons, CC BY-SA 4.0 (author byline to be confirmed at drop-in)',
  },
  status: 'pending',
};

const photoMcaInfarct: TeachingImage = {
  id: 'photo-mca-infarct',
  kind: 'photo',
  src: '/imaging/photos/photo-mca-infarct.jpg',
  alt: 'Non-contrast CT showing loss of gray-white differentiation in the MCA territory.',
  caption: 'Early MCA infarct: loss of gray-white differentiation and insular ribbon.',
  license: {
    source: 'wikimedia',
    license: 'CC-BY-SA-4.0',
    author: 'Wikimedia Commons contributor (byline to be confirmed at drop-in)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/Category:CT_of_cerebral_infarction',
    attribution: 'Wikimedia Commons, CC BY-SA 4.0 (author byline to be confirmed at drop-in)',
  },
  status: 'pending',
};

const photoSkullFracture: TeachingImage = {
  id: 'photo-skull-fracture',
  kind: 'photo',
  src: '/imaging/photos/photo-skull-fracture.jpg',
  alt: 'Non-contrast CT on bone window showing a lucent nonanatomic skull fracture line.',
  caption: 'Skull fracture on bone window: sharp lucent line crossing a suture.',
  license: {
    source: 'wikimedia',
    license: 'CC-BY-SA-4.0',
    author: 'Wikimedia Commons contributor (byline to be confirmed at drop-in)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/Category:CT_of_skull_fractures',
    attribution: 'Wikimedia Commons, CC BY-SA 4.0 (author byline to be confirmed at drop-in)',
  },
  status: 'pending',
};

// ── Module ──────────────────────────────────────────────────────────────────

export const CT_HEAD_MODULE: ImagingModule = {
  id: 'ct-head',
  modality: 'Non-contrast CT head',
  routeSlug: 'ct-head',
  summary: 'A structured way to read a non-contrast CT head at the bedside, working through blood, cisterns, brain, ventricles, and bone.',
  mnemonic: {
    phrase: 'Blood Can Be Very Bad',
    expansion: ['Blood', 'Cisterns', 'Brain', 'Ventricles', 'Bone'],
  },
  steps: [
    // ── Step 1 — Blood ──────────────────────────────────────────────────────
    {
      id: 'blood',
      order: 1,
      mnemonicLetter: 'B',
      bedsideLabel: 'Blood',
      bedsidePrompt: 'Look for hyperdensity in the extra-axial spaces, sulci, cisterns, ventricles, and parenchyma.',
      anatomy: [
        { structure: 'Epidural space', glossaryRef: 'hyperdense', note: 'Potential space between skull and dura; arterial epidural bleeds sit here.' },
        { structure: 'Subdural space', note: 'Between dura and arachnoid; bridging-vein bleeds track along the convexity.' },
        { structure: 'Subarachnoid space (sulci and cisterns)', note: 'CSF space where subarachnoid blood collects.' },
        { structure: 'Brain parenchyma', note: 'Site of intraparenchymal hematoma.' },
        { structure: 'Ventricular system', note: 'Dependent horns are where intraventricular blood layers.' },
        { structure: 'Dural venous sinuses', note: 'Normally mildly dense; do not mistake for clot.' },
      ],
      learn: {
        terminology: [
          { term: 'Hyperdense', def: 'Brighter (denser) than normal brain on CT, as with acute blood, bone, or calcification.', glossaryRef: 'hyperdense' },
          { term: 'Hypodense', def: 'Darker (less dense) than normal brain, as with CSF, edema, or an established infarct.', glossaryRef: 'hypodense' },
          { term: 'Isodense', def: 'The same density as adjacent brain, which can make a subacute collection hard to see.', glossaryRef: 'isodense' },
          { term: 'Hounsfield unit', def: 'The CT density scale: water is 0, air is about -1000, and dense bone is several hundred to over a thousand.', glossaryRef: 'hounsfield-unit' },
          { term: 'Hyperdense MCA sign', def: 'A dense middle cerebral artery caused by acute thrombus within the vessel.', glossaryRef: 'hyperdense-mca-sign' },
        ],
        normal: {
          text: 'No hyperdense collection should sit in the extra-axial spaces, sulci, cisterns, ventricles, or parenchyma; flowing blood in vessels and dural sinuses is only mildly dense.',
          claimId: 'ct-blood-normal-absent',
        },
        abnormal: [
          {
            text: 'Acute clot is hyperdense relative to brain, commonly cited around 50–70 Hounsfield units, though hyperacute unclotted blood may read lower and exact values vary by source and by hematocrit and clot retraction.',
            claimId: 'ct-blood-acute-hyperdense-range',
          },
          {
            text: 'Blood density falls over time: hyperdense acutely, roughly isodense to cortex at about 1–3 weeks, then hypodense in the chronic phase.',
            claimId: 'ct-blood-temporal-evolution',
          },
          {
            text: 'An epidural hematoma is biconvex (lens-shaped) and does not cross suture lines, although it can cross the falx or tentorium; it usually reflects arterial bleeding between skull and dura.',
            claimId: 'ct-blood-epidural-biconvex',
          },
          {
            text: 'A subdural hematoma is crescentic, crosses suture lines, and does not cross the midline, tracking along the inner skull over the convexity.',
            claimId: 'ct-blood-subdural-crescent',
          },
          {
            text: 'Subarachnoid hemorrhage appears as hyperdensity filling sulci and basal cisterns rather than a focal mass.',
            claimId: 'ct-blood-sah-cisterns-sulci',
          },
          {
            text: 'A hyperdense middle cerebral artery reflects acute thrombus within the vessel and can be an early sign of large-vessel occlusion.',
            claimId: 'ct-blood-hyperdense-mca-sign',
          },
        ],
        pitfalls: [
          {
            text: 'Read with a fixed search order rather than scanning ad hoc: a structured search pattern improved resident CT interpretation accuracy in a controlled educational study.',
            claimId: 'ct-search-pattern-accuracy',
          },
          {
            text: 'Physiologic calcification of the choroid plexus, pineal gland, and falx is hyperdense and should not be mistaken for acute blood.',
            claimId: 'ct-blood-calcification-mimic',
          },
        ],
      },
      images: [schHematomaShapes, photoEpidural, photoSubdural, photoSah, photoIch],
      crossCuttingRefs: ['win-brain', 'win-subdural', 'win-stroke'],
    },

    // ── Step 2 — Cisterns ───────────────────────────────────────────────────
    {
      id: 'cisterns',
      order: 2,
      mnemonicLetter: 'C',
      bedsideLabel: 'Cisterns',
      bedsidePrompt: 'Confirm the basal cisterns are open and symmetric and hold no blood.',
      anatomy: [
        { structure: 'Suprasellar cistern', glossaryRef: 'basal-cisterns', note: 'Star-shaped space above the sella; the circle of Willis sits here.' },
        { structure: 'Quadrigeminal cistern', glossaryRef: 'basal-cisterns', note: 'Behind the midbrain; effaced early with rising pressure.' },
        { structure: 'Ambient cistern', glossaryRef: 'basal-cisterns', note: 'Wraps the midbrain; carries the posterior cerebral artery and CN III.' },
        { structure: 'Interpeduncular cistern', glossaryRef: 'basal-cisterns', note: 'Between the cerebral peduncles.' },
        { structure: 'Prepontine cistern', glossaryRef: 'basal-cisterns', note: 'In front of the pons; effaced with tonsillar or central herniation.' },
      ],
      learn: {
        terminology: [
          { term: 'Basal cisterns', def: 'CSF spaces at the skull base that surround the midbrain and brainstem.', glossaryRef: 'basal-cisterns' },
          { term: 'Effacement', def: 'Loss of a normally visible CSF space from swelling or mass effect.', glossaryRef: 'effacement' },
        ],
        normal: {
          text: 'The basal cisterns should be open and symmetric, containing low-density CSF around the midbrain and brainstem.',
          claimId: 'ct-cisterns-normal-patent',
        },
        abnormal: [
          {
            text: 'Effacement of the basal cisterns is a sign of raised intracranial pressure or mass effect and warrants urgent attention.',
            claimId: 'ct-cisterns-effacement-raised-icp',
          },
          {
            text: 'Hyperdensity filling the basal cisterns indicates subarachnoid hemorrhage, classically in a star-shaped suprasellar pattern.',
            claimId: 'ct-cisterns-sah-basal',
          },
          {
            text: 'Uncal (descending transtentorial) herniation pushes the uncus medially into the suprasellar cistern and can compress the third cranial nerve and the posterior cerebral artery.',
            claimId: 'ct-cisterns-uncal-herniation',
          },
          {
            text: 'Tonsillar herniation displaces the cerebellar tonsils inferiorly through the foramen magnum and effaces the cisterns around the medulla.',
            claimId: 'ct-cisterns-tonsillar-herniation',
          },
        ],
        pitfalls: [
          {
            text: 'Cistern effacement can be subtle; compare side to side and against the expected CSF density before calling the cisterns open.',
          },
        ],
      },
      images: [schBasalCisterns],
      crossCuttingRefs: ['win-brain'],
    },

    // ── Step 3 — Brain ──────────────────────────────────────────────────────
    {
      id: 'brain',
      order: 3,
      mnemonicLetter: 'B',
      bedsideLabel: 'Brain',
      bedsidePrompt: 'Check gray-white differentiation, symmetry, and the insular ribbon for early ischemic change.',
      anatomy: [
        { structure: 'Gray-white junction', glossaryRef: 'gray-white-differentiation', note: 'Crispness here is lost early in ischemia.' },
        { structure: 'Insular ribbon', glossaryRef: 'insular-ribbon-sign', note: 'Insular cortex gray-white margin; an early MCA-infarct marker.' },
        { structure: 'Basal ganglia (caudate, lentiform nucleus)', note: 'Lentiform obscuration is an early MCA sign and an ASPECTS region.' },
        { structure: 'Internal capsule', note: 'ASPECTS region; watch for early hypodensity.' },
        { structure: 'Thalamus', note: 'Posterior-circulation and deep territory landmark.' },
        { structure: 'Cortical sulci', glossaryRef: 'effacement', note: 'Sulcal effacement flags swelling or early infarct.' },
      ],
      learn: {
        terminology: [
          { term: 'Gray-white differentiation', def: 'The normal density contrast between gray and white matter; loss of it is an early ischemia sign.', glossaryRef: 'gray-white-differentiation' },
          { term: 'Insular ribbon sign', def: 'Loss of the normal gray-white margin at the insular cortex, an early MCA-infarct sign.', glossaryRef: 'insular-ribbon-sign' },
          { term: 'Cytotoxic edema', def: 'Cellular swelling from early ischemia that effaces the gray-white junction and sulci.', glossaryRef: 'cytotoxic-edema' },
          { term: 'Vasogenic edema', def: 'Fluid from blood-brain-barrier breakdown (tumor, later injury) that is finger-like and spares overlying cortex.', glossaryRef: 'vasogenic-edema' },
        ],
        normal: {
          text: 'Gray matter is slightly denser than white matter, so the gray-white junction should look crisp and symmetric, with visible symmetric sulci.',
          claimId: 'ct-brain-normal-graywhite',
        },
        abnormal: [
          {
            text: 'Loss of gray-white differentiation is an early sign of ischemic infarction and can appear within hours, before frank hypodensity develops.',
            claimId: 'ct-brain-loss-graywhite-early-infarct',
          },
          {
            text: 'Loss of the insular ribbon (blurring of the gray-white margin at the insular cortex) is one of the earliest CT signs of middle cerebral artery infarction.',
            claimId: 'ct-brain-insular-ribbon',
          },
          {
            text: 'ASPECTS divides the MCA territory into 10 regions (caudate, lentiform, internal capsule, insular ribbon, and M1 to M6 cortical regions); one point is subtracted for each region showing early ischemic change.',
            claimId: 'ct-brain-aspects-regions',
          },
          {
            text: 'A lower ASPECTS reflects a larger established core; ASPECTS informs endovascular thrombectomy selection per AHA/ASA 2026 (see the ASPECTS calculator for the eligibility thresholds).',
            claimId: 'aspects-evt-eligibility-2026',
          },
          {
            text: 'Subfalcine herniation, the most common pattern, displaces the cingulate gyrus under the falx and can compress the anterior cerebral artery.',
            claimId: 'ct-brain-subfalcine-herniation',
          },
          {
            text: 'Central (transtentorial) herniation displaces the diencephalon downward through the tentorial notch.',
            claimId: 'ct-brain-central-herniation',
          },
        ],
        pitfalls: [
          {
            text: 'Early ischemic change is subtle on the standard brain window; a narrow stroke window improves detection (see the stroke-window card).',
            claimId: 'ct-brain-stroke-window-benefit',
          },
        ],
      },
      images: [photoBrainNormal, photoMcaInfarct],
      crossCuttingRefs: ['win-brain', 'win-stroke'],
    },

    // ── Step 4 — Ventricles ─────────────────────────────────────────────────
    {
      id: 'ventricles',
      order: 4,
      mnemonicLetter: 'V',
      bedsideLabel: 'Ventricles',
      bedsidePrompt: 'Check ventricular size, symmetry, and dependent horns for blood or transependymal flow.',
      anatomy: [
        { structure: 'Lateral ventricles (frontal, temporal, occipital horns, body, atrium)', note: 'Occipital horns are where IVH layers; temporal horns dilate early with obstruction.' },
        { structure: 'Foramen of Monro', note: 'Connects lateral and third ventricles; obstruction dilates the lateral ventricles.' },
        { structure: 'Third ventricle', note: 'Midline; bows or shifts with mass effect.' },
        { structure: 'Cerebral aqueduct', note: 'Narrowest point; obstruction causes triventricular hydrocephalus.' },
        { structure: 'Fourth ventricle', note: 'Posterior fossa; effaced by cerebellar mass or blood.' },
      ],
      learn: {
        terminology: [
          { term: 'Evans index', def: 'Ratio of maximal frontal-horn width to maximal inner-skull width; above 0.30 indicates ventricular enlargement.', glossaryRef: 'evans-index' },
          { term: 'Transependymal flow', def: 'Periventricular low attenuation from CSF forced across the ependyma in acute or decompensated hydrocephalus.', glossaryRef: 'transependymal-flow' },
        ],
        normal: {
          text: 'The ventricles should be symmetric and age-appropriate in size, with CSF density and no periventricular low attenuation.',
          claimId: 'ct-ventricles-normal-symmetric',
        },
        abnormal: [
          {
            text: 'Hyperdense material layering in the dependent ventricles, often the occipital horns, indicates intraventricular hemorrhage.',
            claimId: 'ct-ventricles-ivh',
          },
          {
            text: 'Ventricular enlargement with an Evans index greater than 0.30, plus temporal-horn dilation and periventricular transependymal flow, indicates hydrocephalus.',
            claimId: 'ct-ventricles-hydrocephalus-evans',
          },
        ],
        pitfalls: [
          {
            text: 'Temporal-horn dilation is a sensitive early sign of obstructive hydrocephalus and may precede enlargement of the frontal horns.',
            claimId: 'ct-ventricles-temporal-horn-early-sign',
          },
          {
            text: 'Ventricles enlarge with age and atrophy, so enlarged ventricles are not always obstructive hydrocephalus; ex-vacuo enlargement lacks transependymal flow and temporal-horn rounding.',
            claimId: 'ct-ventricles-exvacuo-vs-obstructive',
          },
        ],
      },
      images: [schVentricles],
      crossCuttingRefs: ['win-brain'],
    },

    // ── Step 5 — Bone ───────────────────────────────────────────────────────
    {
      id: 'bone',
      order: 5,
      mnemonicLetter: 'B',
      bedsideLabel: 'Bone',
      bedsidePrompt: 'Switch to the bone window and trace the calvarium, skull base, sinuses, and scalp.',
      anatomy: [
        { structure: 'Calvarium', note: 'Trace the outline for a lucent fracture line.' },
        { structure: 'Cranial sutures', note: 'Corticated, zigzag, symmetric; do not mistake for a fracture.' },
        { structure: 'Skull base', note: 'Basilar fractures are subtle; look for indirect signs.' },
        { structure: 'Paranasal sinuses and mastoid air cells', glossaryRef: 'pneumocephalus', note: 'Air-fluid levels can be an indirect basilar-fracture sign.' },
        { structure: 'Scalp soft tissues', note: 'Focal swelling localizes the side of impact.' },
      ],
      learn: {
        terminology: [
          { term: 'Pneumocephalus', def: 'Air inside the cranium, which implies a breach of the skull, sinuses, or dura.', glossaryRef: 'pneumocephalus' },
          { term: 'Window width', def: 'The range of Hounsfield units displayed as shades of gray; wide for bone, narrow for subtle soft-tissue contrast.', glossaryRef: 'window-width' },
          { term: 'Window level', def: 'The center of the displayed density range, set high for bone and near soft tissue for brain.', glossaryRef: 'window-level' },
        ],
        normal: {
          text: 'On the bone window the calvarium is continuous and the sutures are corticated and in expected anatomic locations.',
          claimId: 'ct-bone-normal',
        },
        abnormal: [
          {
            text: 'A fracture is a sharp, lucent, nonanatomic line that may cross suture lines, unlike a suture, which is corticated, zigzag, and in a known anatomic location.',
            claimId: 'ct-bone-fracture-vs-suture',
          },
          {
            text: 'A depressed fracture shows an inwardly displaced bone fragment and warrants neurosurgical evaluation.',
            claimId: 'ct-bone-depressed-fracture',
          },
          {
            text: 'Intracranial air (pneumocephalus) indicates a breach of the skull, sinuses, or dura.',
            claimId: 'ct-bone-pneumocephalus',
          },
          {
            text: 'A paranasal-sinus or mastoid air-fluid level can be an indirect sign of a basilar skull fracture.',
            claimId: 'ct-bone-sinus-air-fluid',
          },
        ],
        pitfalls: [
          {
            text: 'Fractures and intracranial air are best seen on a wide bone window and can be missed on the brain window.',
            claimId: 'ct-bone-window-required',
          },
          {
            text: 'Scalp soft-tissue swelling localizes the side of impact and can direct the search for an underlying fracture or contrecoup injury.',
            claimId: 'ct-bone-scalp-localizes-impact',
          },
        ],
      },
      images: [photoSkullFracture],
      crossCuttingRefs: ['win-bone'],
    },
  ],

  crossCutting: [
    {
      kind: 'window',
      id: 'win-brain',
      name: 'Brain window',
      widthLevel: 'WW ~80 / WL ~40',
      purpose: {
        text: 'The default soft-tissue window, roughly width 80 and level 40 Hounsfield units, used to assess brain parenchyma, blood, and CSF.',
        claimId: 'ct-window-brain',
      },
      images: [schWindowing],
    },
    {
      kind: 'window',
      id: 'win-stroke',
      name: 'Stroke window',
      widthLevel: 'WW ~40 / WL ~40',
      purpose: {
        text: 'A narrow stroke window, roughly width 40 and level 40, improves detection sensitivity for early ischemic change: in a single-center reader study early ischemic changes were seen in 18% of cases on the standard window versus 70% on the narrow window. The benefit reflects narrow-width windowing rather than a stroke-specific magic setting.',
        claimId: 'ct-window-stroke-detection',
      },
      images: [schWindowing],
    },
    {
      kind: 'window',
      id: 'win-subdural',
      name: 'Subdural window',
      widthLevel: 'intermediate width',
      purpose: {
        text: 'A wider intermediate window unmasks a thin subdural hematoma that blends with the adjacent dense calvarium on the standard brain window.',
        claimId: 'ct-window-subdural',
      },
      images: [schWindowing],
    },
    {
      kind: 'window',
      id: 'win-bone',
      name: 'Bone window',
      widthLevel: 'WW ~2000–4000',
      purpose: {
        text: 'A very wide bone window is used to assess fractures, sutures, and intracranial air; it is too wide to evaluate brain parenchyma.',
        claimId: 'ct-window-bone',
      },
      images: [schWindowing],
    },
  ],

  reviewedOn: '2026-07-09',
};
