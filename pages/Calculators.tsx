
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CalculatorDefinition } from '../types';
import { Calculator, ChevronRight, RefreshCw, ArrowLeft } from 'lucide-react';

// --- CALCULATOR DEFINITIONS ---
const GCS_CALC: CalculatorDefinition = {
  id: 'gcs',
  name: 'Glasgow Coma Scale (GCS)',
  description: 'Assess level of consciousness',
  inputs: [
    {
      id: 'eye',
      label: 'Eye Opening Response',
      type: 'select',
      options: [
        { value: 4, label: 'Spontaneously (4)' },
        { value: 3, label: 'To speech (3)' },
        { value: 2, label: 'To pain (2)' },
        { value: 1, label: 'No response (1)' }
      ]
    },
    {
      id: 'verbal',
      label: 'Verbal Response',
      type: 'select',
      options: [
        { value: 5, label: 'Oriented to time, place, and person (5)' },
        { value: 4, label: 'Confused (4)' },
        { value: 3, label: 'Inappropriate words (3)' },
        { value: 2, label: 'Incomprehensible sounds (2)' },
        { value: 1, label: 'No response (1)' }
      ]
    },
    {
      id: 'motor',
      label: 'Motor Response',
      type: 'select',
      options: [
        { value: 6, label: 'Obeys commands (6)' },
        { value: 5, label: 'Moves to localized pain (5)' },
        { value: 4, label: 'Flexion withdrawal from pain (4)' },
        { value: 3, label: 'Abnormal flexion (decorticate) (3)' },
        { value: 2, label: 'Abnormal extension (decerebrate) (2)' },
        { value: 1, label: 'No response (1)' }
      ]
    }
  ],
  calculate: (values) => {
    const score = (Number(values.eye) || 0) + (Number(values.verbal) || 0) + (Number(values.motor) || 0);
    let interp = "Severe Brain Injury (Coma)";
    if (score >= 13) interp = "Minor Brain Injury";
    else if (score >= 9) interp = "Moderate Brain Injury";
    return { score, interpretation: interp };
  }
};

const ABCD2_CALC: CalculatorDefinition = {
  id: 'abcd2',
  name: 'ABCD² Score for TIA',
  description: 'Estimates the risk of stroke within 2 days after a Transient Ischemic Attack (TIA).',
  inputs: [
    { id: 'age', label: 'Age >= 60 years', type: 'boolean' },
    { id: 'bp', label: 'BP >= 140/90 mmHg', type: 'boolean' },
    {
      id: 'clinical',
      label: 'Clinical Features',
      type: 'select',
      options: [
        { value: 2, label: 'Unilateral weakness (2)' },
        { value: 1, label: 'Speech impairment without weakness (1)' },
        { value: 0, label: 'Other symptoms (0)' }
      ]
    },
    {
      id: 'duration',
      label: 'Duration of Symptoms',
      type: 'select',
      options: [
        { value: 2, label: '>= 60 minutes (2)' },
        { value: 1, label: '10-59 minutes (1)' },
        { value: 0, label: '< 10 minutes (0)' }
      ]
    },
    { id: 'diabetes', label: 'Diabetes', type: 'boolean' }
  ],
  calculate: (values) => {
    let score = 0;
    if (values.age) score += 1;
    if (values.bp) score += 1;
    if (values.diabetes) score += 1;
    score += Number(values.clinical || 0);
    score += Number(values.duration || 0);
    let risk = "Low Risk (1.0% 2-day stroke risk)";
    if (score >= 6) risk = "High Risk (8.1% 2-day stroke risk)";
    else if (score >= 4) risk = "Moderate Risk (4.1% 2-day stroke risk)";
    return { score, interpretation: risk };
  }
};

const NIHSS_CALC: CalculatorDefinition = {
  id: 'nihss',
  name: 'NIH Stroke Scale (NIHSS)',
  description: 'Standardized quantification of stroke severity. Total score 0-42.',
  inputs: [
    {
      id: '1a',
      label: '1a. Level of Consciousness',
      type: 'select',
      options: [
        { value: 0, label: '0 - Alert' },
        { value: 1, label: '1 - Not alert; aroused with minor stimulation' },
        { value: 2, label: '2 - Not alert; requires repeated stimulation' },
        { value: 3, label: '3 - Unresponsive or reflex movements only' }
      ]
    },
    {
        id: '1b',
        label: '1b. LOC Questions (Month, Age)',
        type: 'select',
        options: [
            { value: 0, label: '0 - Answers both correctly' },
            { value: 1, label: '1 - Answers one correctly' },
            { value: 2, label: '2 - Answers neither correctly' }
        ]
    },
    {
        id: '1c',
        label: '1c. LOC Commands (Open/Close Eyes, Grip)',
        type: 'select',
        options: [
            { value: 0, label: '0 - Performs both tasks correctly' },
            { value: 1, label: '1 - Performs one task correctly' },
            { value: 2, label: '2 - Performs neither task correctly' }
        ]
    },
    {
        id: '2',
        label: '2. Best Gaze',
        type: 'select',
        options: [
            { value: 0, label: '0 - Normal' },
            { value: 1, label: '1 - Partial gaze palsy' },
            { value: 2, label: '2 - Forced deviation' }
        ]
    },
    {
        id: '3',
        label: '3. Visual Fields',
        type: 'select',
        options: [
            { value: 0, label: '0 - No visual loss' },
            { value: 1, label: '1 - Partial hemianopia' },
            { value: 2, label: '2 - Complete hemianopia' },
            { value: 3, label: '3 - Bilateral hemianopia (Blind)' }
        ]
    },
    {
        id: '4',
        label: '4. Facial Palsy',
        type: 'select',
        options: [
            { value: 0, label: '0 - Normal symmetry' },
            { value: 1, label: '1 - Minor paralysis (flat nasolabial fold)' },
            { value: 2, label: '2 - Partial paralysis (lower face)' },
            { value: 3, label: '3 - Complete paralysis (upper and lower)' }
        ]
    },
    {
        id: '5a',
        label: '5a. Motor Left Arm',
        type: 'select',
        options: [
            { value: 0, label: '0 - No drift' },
            { value: 1, label: '1 - Drift' },
            { value: 2, label: '2 - Some effort against gravity' },
            { value: 3, label: '3 - No effort against gravity' },
            { value: 4, label: '4 - No movement' }
        ]
    },
    {
        id: '5b',
        label: '5b. Motor Right Arm',
        type: 'select',
        options: [
            { value: 0, label: '0 - No drift' },
            { value: 1, label: '1 - Drift' },
            { value: 2, label: '2 - Some effort against gravity' },
            { value: 3, label: '3 - No effort against gravity' },
            { value: 4, label: '4 - No movement' }
        ]
    },
    {
        id: '6a',
        label: '6a. Motor Left Leg',
        type: 'select',
        options: [
            { value: 0, label: '0 - No drift' },
            { value: 1, label: '1 - Drift' },
            { value: 2, label: '2 - Some effort against gravity' },
            { value: 3, label: '3 - No effort against gravity' },
            { value: 4, label: '4 - No movement' }
        ]
    },
    {
        id: '6b',
        label: '6b. Motor Right Leg',
        type: 'select',
        options: [
            { value: 0, label: '0 - No drift' },
            { value: 1, label: '1 - Drift' },
            { value: 2, label: '2 - Some effort against gravity' },
            { value: 3, label: '3 - No effort against gravity' },
            { value: 4, label: '4 - No movement' }
        ]
    },
    {
        id: '7',
        label: '7. Limb Ataxia',
        type: 'select',
        options: [
            { value: 0, label: '0 - Absent' },
            { value: 1, label: '1 - Present in one limb' },
            { value: 2, label: '2 - Present in two limbs' }
        ]
    },
    {
        id: '8',
        label: '8. Sensory',
        type: 'select',
        options: [
            { value: 0, label: '0 - Normal' },
            { value: 1, label: '1 - Mild-to-moderate loss' },
            { value: 2, label: '2 - Severe to total sensory loss' }
        ]
    },
    {
        id: '9',
        label: '9. Best Language',
        type: 'select',
        options: [
            { value: 0, label: '0 - No aphasia' },
            { value: 1, label: '1 - Mild-to-moderate aphasia' },
            { value: 2, label: '2 - Severe aphasia' },
            { value: 3, label: '3 - Mute / Global aphasia' }
        ]
    },
    {
        id: '10',
        label: '10. Dysarthria',
        type: 'select',
        options: [
            { value: 0, label: '0 - Normal' },
            { value: 1, label: '1 - Mild-to-moderate dysarthria' },
            { value: 2, label: '2 - Severe dysarthria / Anarthria' }
        ]
    },
    {
        id: '11',
        label: '11. Extinction and Inattention',
        type: 'select',
        options: [
            { value: 0, label: '0 - No neglect' },
            { value: 1, label: '1 - Partial neglect (Visual or Tactile)' },
            { value: 2, label: '2 - Complete neglect (Visual and Tactile)' }
        ]
    }
  ],
  calculate: (values) => {
    let score = 0;
    // Sum all keys
    Object.keys(values).forEach(key => {
        score += Number(values[key] || 0);
    });
    
    let interpretation = "";
    if (score === 0) interpretation = "No stroke symptoms";
    else if (score <= 4) interpretation = "Minor stroke";
    else if (score <= 15) interpretation = "Moderate stroke";
    else if (score <= 20) interpretation = "Moderate to severe stroke";
    else interpretation = "Severe stroke";

    return { score, interpretation };
  }
};

const ICH_CALC: CalculatorDefinition = {
  id: 'ich',
  name: 'ICH Score',
  description: 'Predicts 30-day mortality for intracerebral hemorrhage.',
  inputs: [
    {
      id: 'gcs',
      label: 'GCS Score',
      type: 'select',
      options: [
        { value: 2, label: '3 - 4 (2 points)' },
        { value: 1, label: '5 - 12 (1 point)' },
        { value: 0, label: '13 - 15 (0 points)' }
      ]
    },
    { id: 'volume', label: 'ICH Volume ≥ 30 cm³', type: 'boolean' },
    { id: 'ivh', label: 'Intraventricular Hemorrhage (IVH)', type: 'boolean' },
    { id: 'infra', label: 'Infratentorial Origin', type: 'boolean' },
    { id: 'age', label: 'Age ≥ 80 years', type: 'boolean' }
  ],
  calculate: (values) => {
    let score = (Number(values.gcs) || 0);
    if (values.volume) score += 1;
    if (values.ivh) score += 1;
    if (values.infra) score += 1;
    if (values.age) score += 1;
    
    const mortality = [0, 13, 26, 72, 97, 100, 100]; // approx %
    const est = mortality[score] || 100;
    
    return { score, interpretation: `Approx. 30-day mortality: ${est}%` };
  }
};

const EVT_CALC: CalculatorDefinition = {
  id: 'evt',
  name: 'Thrombectomy Eligibility',
  description: 'Screening tool for Endovascular Thrombectomy (EVT) including Late Window (DAWN/DEFUSE-3) perfusion criteria.',
  inputs: [
    {
      id: 'age',
      label: 'Age Group',
      type: 'select',
      options: [
        { value: 0, label: '< 18 years' },
        { value: 1, label: '18 - 79 years' },
        { value: 2, label: '≥ 80 years' }
      ]
    },
    {
      id: 'nihss',
      label: 'NIHSS Score Range',
      type: 'select',
      options: [
        { value: 0, label: '0 - 5 (Minor)' },
        { value: 1, label: '6 - 9 (Moderate)' },
        { value: 2, label: '10 - 19 (Moderate-Severe)' },
        { value: 3, label: '≥ 20 (Severe)' }
      ]
    },
    { id: 'lvo', label: 'LVO Confirmed (ICA or M1)', type: 'boolean' },
    { id: 'mrs', label: 'Pre-stroke mRS 0-1 (Independent)', type: 'boolean' },
    {
        id: 'time',
        label: 'Time from Last Known Well',
        type: 'select',
        options: [
            { value: 0, label: '0 - 6 Hours' },
            { value: 1, label: '6 - 24 Hours' }
        ]
    },
    { id: 'aspects', label: 'ASPECTS Score (0-6h)', type: 'number', min: 0, max: 10 },
    { id: 'core', label: 'CTP Core Volume (ml) (6-24h)', type: 'number', min: 0 },
    { id: 'mismatch', label: 'CTP Mismatch Volume (ml) (6-24h)', type: 'number', min: 0 },
    { id: 'ratio', label: 'CTP Mismatch Ratio (6-24h)', type: 'number', min: 0 }
  ],
  calculate: (values) => {
    const ageCat = Number(values.age); // 0: <18, 1: 18-79, 2: >=80
    const nihssCat = Number(values.nihss); // 0: <6, 1: 6-9, 2: 10-19, 3: >=20
    const time = Number(values.time); // 0: 0-6h, 1: 6-24h
    const lvo = values.lvo;
    const mrs = values.mrs;
    
    if (!lvo) return { score: 'Excluded', interpretation: 'No Large Vessel Occlusion (LVO) identified.' };
    if (!mrs) return { score: 'Excluded', interpretation: 'Pre-stroke disability (mRS > 1).' };
    if (ageCat === 0) return { score: 'Excluded', interpretation: 'Age < 18.' };
    
    // 0-6h
    if (time === 0) {
        const aspects = values.aspects !== undefined && values.aspects !== "" ? Number(values.aspects) : null;
        if (aspects === null) return { score: 'Pending', interpretation: 'Enter ASPECTS score.' };
        
        if (nihssCat === 0) return { score: 'Clinical Judgment', interpretation: 'NIHSS < 6. Standard criteria require ≥ 6, but may treat if deficit is disabling.' };
        
        if (aspects >= 6) return { score: 'Eligible (Class I)', interpretation: 'Meets standard Early Window criteria (ASPECTS ≥ 6).' };
        if (aspects >= 3) return { 
            score: 'Eligible (Large Core)', 
            interpretation: (
                <span>
                    Large Core (ASPECTS 3-5). Supported by <a href="https://www.nejm.org/doi/full/10.1056/NEJMoa2214403" target="_blank" rel="noreferrer" className="underline hover:text-white font-bold">SELECT2</a> and <a href="https://www.nejm.org/doi/full/10.1056/NEJMoa2213379" target="_blank" rel="noreferrer" className="underline hover:text-white font-bold">ANGEL-ASPECT</a>.
                </span>
            )
        };
        return { score: 'Consult', interpretation: 'Very Large Core (ASPECTS < 3). Benefit uncertain.' };
    }
    
    // 6-24h
    if (time === 1) {
        const core = values.core !== undefined && values.core !== "" ? Number(values.core) : null;
        if (core === null) return { score: 'Pending', interpretation: 'Enter CTP Core Volume.' };
        
        if (nihssCat === 0) return { score: 'Not Eligible', interpretation: 'NIHSS < 6. Does not meet DAWN (≥10) or DEFUSE-3 (≥6) inclusion.' };
        
        // DAWN (6-24h)
        let dawn = false;
        // Group A: Age >= 80 (cat 2), NIHSS >= 10 (cat 2,3), Core < 21
        if (ageCat === 2 && nihssCat >= 2 && core < 21) dawn = true;
        
        // Group B: Age < 80 (cat 1), NIHSS >= 10 (cat 2,3), Core < 31
        else if (ageCat === 1 && nihssCat >= 2 && core < 31) dawn = true;
        
        // Group C: Age < 80 (cat 1), NIHSS >= 20 (cat 3), Core < 51
        else if (ageCat === 1 && nihssCat === 3 && core < 51) dawn = true;
        
        if (dawn) return { 
            score: 'Eligible (DAWN)', 
            interpretation: (
                <span>
                    Meets <a href="https://www.nejm.org/doi/full/10.1056/NEJMoa1713973" target="_blank" rel="noreferrer" className="underline hover:text-white font-bold">DAWN</a> criteria (Clinical-Core Mismatch).
                </span>
            )
        };

        // DEFUSE 3 (6-16h) - apply generally
        const mismatch = values.mismatch !== undefined && values.mismatch !== "" ? Number(values.mismatch) : 0;
        const ratio = values.ratio !== undefined && values.ratio !== "" ? Number(values.ratio) : 0;
        
        if (core < 70 && mismatch >= 15 && ratio >= 1.8) {
            return { 
                score: 'Eligible (DEFUSE-3)', 
                interpretation: (
                    <span>
                        Meets <a href="https://www.nejm.org/doi/full/10.1056/NEJMoa1706442" target="_blank" rel="noreferrer" className="underline hover:text-white font-bold">DEFUSE-3</a> criteria (Core &lt; 70ml, Mismatch &ge; 15ml, Ratio &ge; 1.8).
                    </span>
                )
            };
        }
        
        return { score: 'Not Eligible', interpretation: 'Does not meet DAWN or DEFUSE-3 perfusion criteria.' };
    }
    
    return { score: 'Incomplete', interpretation: 'Select a time window.' };
  }
};

const HAS_BLED_CALC: CalculatorDefinition = {
  id: 'has-bled',
  name: 'HAS-BLED Score',
  description: 'Estimates 1-year major bleeding risk for atrial fibrillation patients on anticoagulation.',
  inputs: [
    { id: 'hypertension', label: 'Hypertension (Systolic > 160 mmHg)', type: 'boolean' },
    { id: 'renal', label: 'Abnormal Renal Function (Dialysis, Cr > 2.26 mg/dL)', type: 'boolean' },
    { id: 'liver', label: 'Abnormal Liver Function (Cirrhosis, Bilirubin > 2x normal)', type: 'boolean' },
    { id: 'stroke', label: 'History of Stroke', type: 'boolean' },
    { id: 'bleeding', label: 'History of Bleeding or Predisposition', type: 'boolean' },
    { id: 'labile', label: 'Labile INR (TTR < 60%)', type: 'boolean' },
    { id: 'elderly', label: 'Elderly (Age > 65)', type: 'boolean' },
    { id: 'drugs', label: 'Drugs (Antiplatelets or NSAIDs)', type: 'boolean' },
    { id: 'alcohol', label: 'Alcohol Excess', type: 'boolean' }
  ],
  calculate: (values) => {
    let score = 0;
    if (values.hypertension) score++;
    if (values.renal) score++;
    if (values.liver) score++;
    if (values.stroke) score++;
    if (values.bleeding) score++;
    if (values.labile) score++;
    if (values.elderly) score++;
    if (values.drugs) score++;
    if (values.alcohol) score++;

    let risk = "Low Risk (approx 1% risk/year)";
    if (score >= 3) risk = "High Risk (Consider alternatives or closer monitoring)";
    
    return { score, interpretation: risk };
  }
};

const ROPE_CALC: CalculatorDefinition = {
  id: 'rope',
  name: 'RoPE Score',
  description: 'Estimates probability that a PFO is the cause of cryptogenic stroke (PFO Attributable Fraction).',
  inputs: [
    { id: 'hypertension', label: 'No History of Hypertension', type: 'boolean' },
    { id: 'diabetes', label: 'No History of Diabetes', type: 'boolean' },
    { id: 'stroke', label: 'No Prior Stroke/TIA', type: 'boolean' },
    { id: 'smoker', label: 'Non-Smoker', type: 'boolean' },
    { id: 'cortical', label: 'Cortical Infarct on Imaging', type: 'boolean' },
    {
      id: 'age',
      label: 'Age Group',
      type: 'select',
      options: [
        { value: 5, label: '18 - 29 years (5 pts)' },
        { value: 4, label: '30 - 39 years (4 pts)' },
        { value: 3, label: '40 - 49 years (3 pts)' },
        { value: 2, label: '50 - 59 years (2 pts)' },
        { value: 1, label: '60 - 69 years (1 pt)' },
        { value: 0, label: '≥ 70 years (0 pts)' }
      ]
    }
  ],
  calculate: (values) => {
    let score = 0;
    if (values.hypertension) score++;
    if (values.diabetes) score++;
    if (values.stroke) score++;
    if (values.smoker) score++;
    if (values.cortical) score++;
    score += Number(values.age || 0);

    let interp = "0% PFO Attributable Fraction (Incidental PFO)";
    if (score === 4) interp = "38% PFO Attributable Fraction";
    else if (score === 5) interp = "34% PFO Attributable Fraction";
    else if (score === 6) interp = "62% PFO Attributable Fraction";
    else if (score === 7) interp = "72% PFO Attributable Fraction (Likely Pathogenic)";
    else if (score === 8) interp = "84% PFO Attributable Fraction (Likely Pathogenic)";
    else if (score >= 9) interp = "88% PFO Attributable Fraction (Likely Pathogenic)";

    return { score, interpretation: interp };
  }
};

const ELAN_CALC: CalculatorDefinition = {
  id: 'elan',
  name: 'ELAN Protocol (DOAC Timing)',
  description: 'Timing of anticoagulation in acute ischemic stroke with Atrial Fibrillation based on imaging-based stroke size classification (ELAN Trial).',
  inputs: [
    {
      id: 'classification',
      label: 'Stroke Size Classification (Imaging Based)',
      type: 'select',
      options: [
        { 
            value: 0, 
            label: 'Minor: Lesion ≤ 1.5 cm (Ant/Post) or TIA. (Includes multiple tiny embolic spots)' 
        },
        { 
            value: 1, 
            label: 'Moderate: Cortical superficial branch (ACA/MCA/PCA), MCA deep branch, or Internal border zone. (2 minor = Moderate)' 
        },
        { 
            value: 2, 
            label: 'Major: Whole territory (ACA/MCA/PCA), ≥2 MCA cortical, MCA cort+deep, or Brainstem/Cerebellum ≥ 1.5 cm. (2 moderate = Major)' 
        }
      ]
    },
    { id: 'hemorrhage', label: 'Significant Hemorrhagic Transformation on Imaging?', type: 'boolean' }
  ],
  calculate: (values) => {
    if (values.hemorrhage) {
      return {
        score: 'Contraindicated',
        interpretation: 'Significant hemorrhagic transformation was an exclusion criteria. Delay anticoagulation and repeat imaging.'
      };
    }

    const type = Number(values.classification);
    let early = "";
    let late = "";

    if (type === 0) {
      early = "< 48 hours";
      late = "Day 3-4";
    } else if (type === 1) {
      early = "Day 2";
      late = "Day 6-7";
    } else if (type === 2) {
      early = "Day 6-7";
      late = "Day 12-14";
    } else {
      return { score: '-', interpretation: 'Select stroke severity.' };
    }

    return {
      score: 'Start Timing',
      interpretation: (
        <div className="text-sm">
          <p className="mb-2"><strong className="text-neuro-200">Early Strategy (Recommended):</strong> Start <strong>{early}</strong>.</p>
          <p className="mb-2 text-slate-400">Late Strategy (Control): Start {late}.</p>
          <p className="italic text-xs text-slate-400 mt-3 border-t border-white/10 pt-2">
            The <a href="https://www.nejm.org/doi/full/10.1056/NEJMoa2303048" target="_blank" rel="noreferrer" className="underline hover:text-white">ELAN Trial</a> found early initiation was safe and non-inferior to late initiation.
            Classification is based on imaging (CT/MRI) size and location.
          </p>
        </div>
      )
    };
  }
};

const CALCULATORS = [GCS_CALC, NIHSS_CALC, ABCD2_CALC, ICH_CALC, EVT_CALC, HAS_BLED_CALC, ROPE_CALC, ELAN_CALC];

const Calculators: React.FC = () => {
  const [searchParams] = useSearchParams();
  const activeId = searchParams.get('id');
  const activeCalc = CALCULATORS.find(c => c.id === activeId);

  const [values, setValues] = useState<Record<string, any>>({});
  const [result, setResult] = useState<{ score: number | string; interpretation: any } | null>(null);

  // References for scrolling
  const inputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValues({});
    setResult(null);
    inputRefs.current = []; // Reset refs on calc change
    
    // Scroll to top
    const mainScroller = document.querySelector('main');
    if (mainScroller) {
        mainScroller.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo(0, 0);
  }, [activeId]);

  useEffect(() => {
    if (activeCalc) {
        try {
            const res = activeCalc.calculate(values);
            setResult(res);
        } catch (e) {
            console.error(e);
        }
    }
  }, [values, activeCalc]);

  const handleInputChange = (id: string, value: any, index: number, autoScroll: boolean = false) => {
    setValues(prev => ({ ...prev, [id]: value }));

    if (autoScroll) {
        // Use a small timeout to allow visual feedback (like ripple/active state) before scrolling
        setTimeout(() => {
            const nextIndex = index + 1;
            // Check if there is a next question
            if (activeCalc && nextIndex < activeCalc.inputs.length) {
                const nextEl = inputRefs.current[nextIndex];
                if (nextEl) {
                    nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                // If it's the last question, scroll to the result
                if (resultRef.current) {
                    resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        }, 200);
    }
  };

  if (activeCalc) {
      return (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Link to="/calculators" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-neuro-600 mb-6 group">
                  <div className="bg-white p-1.5 rounded-md border border-gray-200 mr-2 shadow-sm group-hover:shadow-md transition-all">
                      <ArrowLeft size={16} />
                  </div>
                  Back to Calculators
              </Link>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-8 border-b border-gray-100 bg-slate-50/50">
                      <div className="flex items-center space-x-4 mb-3">
                          <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-neuro-600">
                              <Calculator size={28} />
                          </div>
                          <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{activeCalc.name}</h1>
                            <p className="text-slate-500 font-medium">{activeCalc.description}</p>
                          </div>
                      </div>
                  </div>

                  <div className="p-8 grid gap-8">
                      <div className="space-y-6">
                          {activeCalc.inputs.map((input, index) => (
                              <div 
                                key={input.id} 
                                ref={(el) => { inputRefs.current[index] = el; }}
                                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-neuro-100 scroll-mt-24"
                              >
                                  <label className="block text-sm font-bold text-slate-800 mb-3">{input.label}</label>
                                  
                                  {input.type === 'select' && input.options && (
                                      <div className="grid gap-2">
                                          {input.options.map(opt => (
                                              <button
                                                  key={opt.value}
                                                  onClick={() => handleInputChange(input.id, opt.value, index, true)}
                                                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                                                      values[input.id] === opt.value
                                                          ? 'bg-neuro-600 text-white border-neuro-600 shadow-lg shadow-neuro-200'
                                                          : 'bg-slate-50 text-slate-600 border-transparent hover:bg-white hover:border-gray-200'
                                                  }`}
                                              >
                                                  {opt.label}
                                              </button>
                                          ))}
                                      </div>
                                  )}

                                  {input.type === 'boolean' && (
                                      <div className="flex p-1 bg-slate-100 rounded-xl">
                                          <button
                                              onClick={() => handleInputChange(input.id, true, index, true)}
                                              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                                  values[input.id] === true
                                                      ? 'bg-white text-neuro-600 shadow-sm'
                                                      : 'text-slate-400 hover:text-slate-600'
                                              }`}
                                          >
                                              Yes
                                          </button>
                                          <button
                                              onClick={() => handleInputChange(input.id, false, index, true)}
                                              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                                  values[input.id] === false
                                                      ? 'bg-white text-neuro-600 shadow-sm'
                                                      : 'text-slate-400 hover:text-slate-600'
                                              }`}
                                          >
                                              No
                                          </button>
                                      </div>
                                  )}

                                  {input.type === 'number' && (
                                    <input
                                      type="number"
                                      className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neuro-500 font-medium text-slate-900"
                                      placeholder="Enter value..."
                                      min={input.min}
                                      max={input.max}
                                      value={values[input.id] || ''}
                                      onChange={(e) => handleInputChange(input.id, e.target.value, index, false)}
                                    />
                                  )}
                              </div>
                          ))}
                      </div>

                      <div ref={resultRef} className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-neuro-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Calculated Result</span>
                                <button onClick={() => setValues({})} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white" title="Reset">
                                    <RefreshCw size={16} />
                                </button>
                            </div>
                            <div className="flex items-baseline space-x-4 mb-2">
                                <div className="text-6xl font-black tracking-tighter text-white">
                                    {result?.score !== undefined ? result.score : '-'}
                                </div>
                            </div>
                            <div className="text-lg font-medium text-neuro-200 border-t border-white/10 pt-4 mt-2">
                                {result?.interpretation || 'Complete all fields to see interpretation'}
                            </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-10">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Clinical Calculators</h1>
              <p className="text-slate-500 mt-3 font-medium text-lg">Evidence-based scoring systems for neurological assessment.</p>
          </div>

          <div className="space-y-4">
              {CALCULATORS.map(calc => (
                  <Link
                      key={calc.id}
                      to={`/calculators?id=${calc.id}`}
                      className="group flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-neuro-100 transition-all"
                  >
                      <div className="flex items-center space-x-5">
                          <div className="p-3 bg-neuro-50 rounded-xl text-neuro-600 group-hover:bg-neuro-600 group-hover:text-white transition-all shadow-inner flex-shrink-0">
                              <Calculator size={24} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-neuro-700 transition-colors">{calc.name}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-snug">{calc.description}</p>
                          </div>
                      </div>
                      <div className="pl-4 text-gray-300 group-hover:text-neuro-500 transition-colors">
                        <ChevronRight size={20} />
                      </div>
                  </Link>
              ))}
          </div>
      </div>
  );
};

export default Calculators;
