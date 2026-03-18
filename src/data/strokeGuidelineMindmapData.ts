/**
 * Stroke Guideline Mindmap Data
 * Structures the 2026 AHA/ASA Acute Ischemic Stroke Guideline into a
 * hierarchical tree for the interactive mindmap page.
 *
 * All recommendation text sourced from aha2026StrokeGuideline.ts
 */

import {
  prehospitalRecommendations,
  imagingRecommendations,
  bloodPressureRecommendations,
  temperatureRecommendations,
  glucoseRecommendations,
  ivtRecommendations,
  evtRecommendations,
  antiplateletRecommendations,
  anticoagulationRecommendations,
  inHospitalManagementRecommendations,
  acuteComplicationsRecommendations,
} from './aha2026StrokeGuideline';

export type GuidelineRec = {
  cor: string;
  loe: string;
  text: string;
};

export type NodeColor = 'neuro' | 'emerald' | 'amber' | 'violet' | 'rose' | 'slate';

export type MindmapNode = {
  id: string;
  label: string;
  description?: string;
  color: NodeColor;
  children?: MindmapNode[];
  recommendations?: GuidelineRec[];
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function toRec(r: { cor: string; loe: string; text: string }): GuidelineRec {
  return { cor: r.cor, loe: r.loe, text: r.text };
}

// ─── Tree ───────────────────────────────────────────────────────────────────

export const mindmapRoot: MindmapNode = {
  id: 'root',
  label: '2026 AHA/ASA\nAcute Ischemic\nStroke Guideline',
  color: 'neuro',
  children: [
    // ── 1. STROKE SYSTEMS OF CARE ──────────────────────────────────────────
    {
      id: 'systems',
      label: 'Stroke Systems\nof Care',
      color: 'neuro',
      description: 'Public education, EMS infrastructure, and hospital capabilities to maximize access to time-sensitive stroke therapies.',
      children: [
        {
          id: 'awareness',
          label: 'Stroke Awareness',
          color: 'neuro',
          description: 'Public and professional education programs to improve stroke recognition across all demographics.',
          recommendations: prehospitalRecommendations.strokeAwareness.map(toRec),
        },
        {
          id: 'ems',
          label: 'EMS & Prehospital',
          color: 'neuro',
          description: 'EMS triage protocols, advance hospital notification, destination decisions, and mobile stroke units.',
          recommendations: [
            ...prehospitalRecommendations.emsSystems.map(toRec),
            ...prehospitalRecommendations.prehospitalAssessment.map(toRec),
            ...prehospitalRecommendations.emsDestination.map(toRec),
            ...prehospitalRecommendations.mobileStrokeUnits.map(toRec),
          ],
        },
        {
          id: 'hospital-capabilities',
          label: 'Hospital Capabilities',
          color: 'neuro',
          description: 'External certification, standardized protocols, and interhospital transfer agreements to ensure rapid access to EVT.',
          recommendations: [
            {
              cor: '1',
              loe: 'B-NR',
              text: 'Health care policy makers should establish regional systems of stroke care (SSOC) to increase access to time-sensitive therapies, including determination of IVT-capable and EVT-capable centers.',
            },
            {
              cor: '2a',
              loe: 'B-NR',
              text: 'Stroke centers should undergo external certification and implement standardized stroke care order sets and protocols to improve patient outcomes.',
            },
            {
              cor: '2a',
              loe: 'B-NR',
              text: 'Interhospital transfer agreements and rapid door-in door-out (DIDO) protocols should be maintained to minimize delays for EVT at thrombectomy-capable centers.',
            },
          ],
        },
      ],
    },

    // ── 2. EMERGENCY EVALUATION ────────────────────────────────────────────
    {
      id: 'evaluation',
      label: 'Emergency\nEvaluation',
      color: 'violet',
      description: 'Rapid clinical assessment and neuroimaging to identify stroke, exclude hemorrhage, and select reperfusion therapy.',
      children: [
        {
          id: 'assessment',
          label: 'Assessment Tools',
          color: 'violet',
          description: 'Validated clinical tools and specialist resources for rapid stroke severity grading and decision-making.',
          recommendations: [
            {
              cor: '1',
              loe: 'A',
              text: 'In patients with suspected stroke transported by ambulance, use of a brief stroke assessment tool (e.g. RACE, LAMS, NIHSS) by prehospital personnel is recommended to improve early stroke identification, including large vessel occlusion (LVO) stroke.',
            },
            {
              cor: '1',
              loe: 'B-NR',
              text: 'The NIH Stroke Scale (NIHSS) is recommended as a validated, standardized neurological severity scale for all patients with acute ischemic stroke to guide therapy decisions and prognosis.',
            },
            {
              cor: '2a',
              loe: 'B-NR',
              text: 'Telestroke consultation is reasonable to extend stroke expertise to hospitals without on-site stroke specialists, enabling faster IVT administration and appropriate EVT triage.',
            },
            {
              cor: '2a',
              loe: 'B-NR',
              text: 'A multidisciplinary stroke team — including neurology, nursing, pharmacy, and radiology — is recommended to coordinate rapid evaluation and treatment.',
            },
          ],
        },
        {
          id: 'imaging',
          label: 'Imaging Approaches',
          color: 'violet',
          description: 'Neuroimaging strategies to exclude hemorrhage, detect ischemia, identify LVO, and select patients for extended time-window therapies.',
          recommendations: [
            ...imagingRecommendations.initial.map(toRec),
            ...imagingRecommendations.vascular.map(toRec),
            {
              cor: '2a',
              loe: 'B-R',
              text: 'CT perfusion (CTP) or MR perfusion imaging can be beneficial to select patients with AIS for late-window IVT (4.5–9 h) or EVT (6–24 h) by identifying salvageable ischemic penumbra.',
            },
            {
              cor: '2a',
              loe: 'B-R',
              text: 'DWI-FLAIR mismatch on MRI is reasonable to identify patients with unknown stroke onset who may benefit from IVT within 4.5 hours of symptom recognition.',
            },
          ],
        },
      ],
    },

    // ── 3. ACUTE MANAGEMENT ────────────────────────────────────────────────
    {
      id: 'management',
      label: 'Acute\nManagement',
      color: 'emerald',
      description: 'Reperfusion therapies (IVT and EVT) and supportive care interventions during the acute hospitalization.',
      children: [
        {
          id: 'ivt',
          label: 'IV Thrombolysis\n(IVT)',
          color: 'emerald',
          description: 'Alteplase or tenecteplase for eligible patients within 4.5 hours, with extended windows in select patients.',
          children: [
            {
              id: 'ivt-agents',
              label: 'Agent Selection\n& Dosing',
              color: 'emerald',
              description: 'Tenecteplase and alteplase are both first-line options; choose based on institutional availability.',
              recommendations: ivtRecommendations.agentChoice.map(toRec),
            },
            {
              id: 'ivt-standard',
              label: 'Standard Window\n(≤4.5 hours)',
              color: 'emerald',
              description: 'IVT for patients with disabling deficits presenting within 4.5 hours of last known well.',
              recommendations: ivtRecommendations.decisionMaking.map(toRec),
            },
            {
              id: 'ivt-extended',
              label: 'Extended Window\n(4.5–9 hours)',
              color: 'emerald',
              description: 'DWI-FLAIR mismatch or perfusion-guided IVT for wake-up stroke and late-presenting patients.',
              recommendations: ivtRecommendations.extendedWindows.map(toRec),
            },
            {
              id: 'ivt-evt',
              label: 'IVT + EVT\n(Bridging)',
              color: 'emerald',
              description: 'When patients are eligible for both IVT and EVT, IVT should not be withheld.',
              recommendations: ivtRecommendations.concomitantWithEVT.map(toRec),
            },
            {
              id: 'ivt-special',
              label: 'Special\nCircumstances',
              color: 'emerald',
              description: 'IVT considerations in antiplatelet users, patients with microbleeds, sickle cell disease, and pediatrics.',
              recommendations: [
                ...ivtRecommendations.specialCircumstances.map(toRec),
                ...ivtRecommendations.contraindicated.map(toRec),
              ],
            },
          ],
        },
        {
          id: 'evt',
          label: 'Endovascular\nThrombectomy (EVT)',
          color: 'emerald',
          description: 'Mechanical thrombectomy for LVO — anterior and posterior circulation, including large core infarcts.',
          children: [
            {
              id: 'evt-anterior',
              label: 'Anterior\nCirculation LVO',
              color: 'emerald',
              description: 'ICA and M1 occlusions: 0–6 h (ASPECTS 3–10) and 6–24 h windows, including large core (ASPECTS 3–5).',
              recommendations: evtRecommendations.adults.map(toRec),
            },
            {
              id: 'evt-posterior',
              label: 'Basilar Artery\nOcclusion',
              color: 'emerald',
              description: 'EVT for basilar artery occlusion within 6 hours (COR 1) and 6–24 hours (COR 2a).',
              recommendations: evtRecommendations.posteriorCirculation.map(toRec),
            },
          ],
        },
        {
          id: 'supportive',
          label: 'Supportive Care',
          color: 'emerald',
          description: 'Blood pressure targets, glucose management, temperature control, and antiplatelet/anticoagulation therapy.',
          children: [
            {
              id: 'bp',
              label: 'Blood Pressure\nManagement',
              color: 'amber',
              description: 'BP targets before reperfusion, after IVT, and after EVT — including critical post-EVT harm signal.',
              recommendations: [
                ...bloodPressureRecommendations.general.map(toRec),
                ...bloodPressureRecommendations.beforeReperfusion.map(toRec),
                ...bloodPressureRecommendations.afterIVT.map(toRec),
                ...bloodPressureRecommendations.afterEVT.map(toRec),
              ],
            },
            {
              id: 'glucose',
              label: 'Glycemic Control\n(140–180 mg/dL)',
              color: 'amber',
              description: 'Target 140–180 mg/dL for hyperglycemia; treat hypoglycemia (<60 mg/dL) immediately.',
              recommendations: glucoseRecommendations.map(toRec),
            },
            {
              id: 'temperature',
              label: 'Temperature\nManagement',
              color: 'amber',
              description: 'Treat hyperthermia; induced hypothermia is not recommended.',
              recommendations: temperatureRecommendations.map(toRec),
            },
            {
              id: 'antiplatelet',
              label: 'Antiplatelet\nTherapy (DAPT)',
              color: 'amber',
              description: 'Aspirin within 48 h; DAPT for minor AIS/high-risk TIA for 21 days then SAPT.',
              recommendations: [
                ...antiplateletRecommendations.general.map(toRec),
                ...antiplateletRecommendations.daptForMinorAIS.map(toRec),
              ],
            },
            {
              id: 'anticoag',
              label: 'Anticoagulation',
              color: 'amber',
              description: 'Early DOAC initiation is safe for AF-related stroke; routine early anticoagulation is not recommended.',
              recommendations: anticoagulationRecommendations.map(toRec),
            },
          ],
        },
        {
          id: 'inhospital',
          label: 'In-Hospital\nManagement',
          color: 'emerald',
          description: 'Stroke unit care, dysphagia screening, VTE prevention, depression screening, and early mobilization.',
          children: [
            {
              id: 'stroke-unit',
              label: 'Stroke Unit Care',
              color: 'emerald',
              description: 'Organized interdisciplinary stroke care units reduce death and dependency.',
              recommendations: inHospitalManagementRecommendations.strokeUnit.map(toRec),
            },
            {
              id: 'dysphagia',
              label: 'Dysphagia\nScreening',
              color: 'emerald',
              description: 'Bedside swallow screen before oral intake; PES reduces aspiration in patients with dysphagia.',
              recommendations: inHospitalManagementRecommendations.dysphagia.map(toRec),
            },
            {
              id: 'vte',
              label: 'VTE Prevention',
              color: 'emerald',
              description: 'Intermittent pneumatic compression for immobile patients; compression stockings are harmful.',
              recommendations: inHospitalManagementRecommendations.vtePrevention.map(toRec),
            },
            {
              id: 'complications',
              label: 'Acute\nComplications',
              color: 'rose',
              description: 'Malignant edema (hemicraniectomy), cerebellar infarction, and seizure management.',
              recommendations: [
                ...acuteComplicationsRecommendations.brainSwelling.map(toRec),
                ...acuteComplicationsRecommendations.cerebellarInfarction.map(toRec),
                ...acuteComplicationsRecommendations.seizures.map(toRec),
              ],
            },
          ],
        },
      ],
    },

    // ── 4. SPECIAL POPULATIONS ─────────────────────────────────────────────
    {
      id: 'special',
      label: 'Special\nPopulations',
      color: 'amber',
      description: 'Pediatric stroke and other patient subgroups requiring adapted diagnostic and treatment strategies.',
      children: [
        {
          id: 'pediatric',
          label: 'Pediatrics',
          color: 'amber',
          description: 'Stroke recognition, imaging, IVT (alteplase), and EVT in children aged 28 days to 18 years.',
          recommendations: [
            ...imagingRecommendations.pediatric.map(toRec),
            ...ivtRecommendations.specialCircumstances
              .filter((r) => r.text.includes('pediatric') || r.text.includes('28 days'))
              .map(toRec),
            ...evtRecommendations.pediatric.map(toRec),
          ],
        },
        {
          id: 'sickle-cell',
          label: 'Sickle Cell\nDisease',
          color: 'amber',
          description: 'IVT is beneficial in sickle cell disease patients with AIS who are otherwise eligible.',
          recommendations: ivtRecommendations.specialCircumstances
            .filter((r) => r.text.includes('sickle'))
            .map(toRec),
        },
      ],
    },

    // ── 5. QUALITY IMPROVEMENT ─────────────────────────────────────────────
    {
      id: 'quality',
      label: 'Quality\nImprovement',
      color: 'slate',
      description: 'Data registries, performance benchmarking, and feedback loops to continuously improve stroke outcomes.',
      recommendations: [
        {
          cor: '1',
          loe: 'B-NR',
          text: 'Participation in organized stroke data registries with performance benchmarking is recommended to identify gaps in care, implement best practices, and improve patient outcomes.',
        },
        {
          cor: '1',
          loe: 'B-NR',
          text: 'Stroke programs should use standardized risk-adjustment methods (including NIHSS) to enable fair comparison of outcomes across centers.',
        },
        {
          cor: '2a',
          loe: 'B-NR',
          text: 'Continuous quality feedback loops — including regular case review, door-to-needle time audits, and protocol updates — are reasonable to sustain improvements in stroke care delivery.',
        },
        {
          cor: '2a',
          loe: 'B-NR',
          text: 'Performance metrics for IVT and EVT (door-to-needle, door-to-groin, TICI scores, 90-day mRS) should be tracked and reported to guide quality improvement initiatives.',
        },
      ],
    },
  ],
};

// ─── Flat node index for search / filter ─────────────────────────────────────

export function flattenNodes(node: MindmapNode, result: MindmapNode[] = []): MindmapNode[] {
  result.push(node);
  node.children?.forEach((child) => flattenNodes(child, result));
  return result;
}

export const allNodes = flattenNodes(mindmapRoot);
