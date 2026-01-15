
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CalculatorDefinition } from '../types';
import { Calculator, ChevronRight, RefreshCw, ArrowLeft, AlertCircle, Activity, Brain, Zap, Timer, Skull } from 'lucide-react';

// --- CALCULATOR DEFINITIONS ---

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
    const mortality = [0, 13, 26, 72, 97, 100, 100];
    const est = mortality[score] || 100;
    return { score, interpretation: `Approx. 30-day mortality: ${est}%` };
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

const ROPE_CALC: CalculatorDefinition = {
  id: 'rope',
  name: 'RoPE Score',
  description: 'Estimates probability that a PFO is the cause of cryptogenic stroke (PFO Attributable Fraction).',
  inputs: [
    { id: 'hypertension', label: 'History of Hypertension', type: 'boolean' },
    { id: 'diabetes', label: 'History of Diabetes', type: 'boolean' },
    { id: 'stroke', label: 'Prior Stroke/TIA', type: 'boolean' },
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
    // RoPE score awards points for the ABSENCE of vascular risk factors.
    // If user selects "No" (false) to History of Hypertension, score +1.
    if (values.hypertension === false) score++;
    if (values.diabetes === false) score++;
    if (values.stroke === false) score++;
    
    // RoPE score awards points for PRESENCE of favorable features.
    // If user selects "Yes" (true) to Non-Smoker, score +1.
    if (values.smoker === true) score++;
    if (values.cortical === true) score++;
    
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

const CALCULATORS = [
  NIHSS_CALC, 
  ABCD2_CALC, 
  ICH_CALC, 
  HAS_BLED_CALC, 
  GCS_CALC, 
  ROPE_CALC
];

const Calculators: React.FC = () => {
  const [searchParams] = useSearchParams();
  const activeId = searchParams.get('id');
  const activeCalc = CALCULATORS.find(c => c.id === activeId);

  const [values, setValues] = useState<Record<string, any>>({});
  const [result, setResult] = useState<{ score: number | string; interpretation: any } | null>(null);

  const inputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValues({});
    setResult(null);
    inputRefs.current = [];
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
        setTimeout(() => {
            const nextIndex = index + 1;
            if (activeCalc && nextIndex < activeCalc.inputs.length) {
                const nextEl = inputRefs.current[nextIndex];
                if (nextEl) {
                    nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
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
                            <div className="mt-6 pt-4 border-t border-white/10 text-center">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center">
                                    <AlertCircle size={10} className="mr-1.5" /> Decision Support Only • Not Medical Advice
                                </span>
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
              {/* Specialized Pathways (Routes) */}
              <Link
                  to="/calculators/migraine-pathway"
                  className="group flex items-center justify-between bg-gradient-to-br from-indigo-900 to-indigo-800 p-5 rounded-2xl shadow-lg border border-indigo-700 hover:shadow-xl hover:scale-[1.01] transition-all"
              >
                  <div className="flex items-center space-x-5">
                      <div className="p-3 bg-white/10 rounded-xl text-white group-hover:bg-white group-hover:text-indigo-900 transition-all shadow-inner flex-shrink-0">
                          <Skull size={24} className="fill-white group-hover:fill-indigo-900 transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Migraine & Headache Pathway</h3>
                        <p className="text-indigo-200 text-sm font-medium leading-snug">Evidence-based ED & Inpatient management.</p>
                      </div>
                  </div>
                  <div className="pl-4 text-indigo-300 group-hover:text-white transition-colors">
                    <ChevronRight size={20} />
                  </div>
              </Link>

              <Link
                  to="/calculators/se-pathway"
                  className="group flex items-center justify-between bg-gradient-to-br from-red-900 to-red-800 p-5 rounded-2xl shadow-lg border border-red-700 hover:shadow-xl hover:scale-[1.01] transition-all"
              >
                  <div className="flex items-center space-x-5">
                      <div className="p-3 bg-white/10 rounded-xl text-white group-hover:bg-white group-hover:text-red-900 transition-all shadow-inner flex-shrink-0">
                          <Timer size={24} className="fill-white group-hover:fill-red-900 transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Status Epilepticus Pathway</h3>
                        <p className="text-red-200 text-sm font-medium leading-snug">Comorbidity-aware decision support for Stage 1-3 SE.</p>
                      </div>
                  </div>
                  <div className="pl-4 text-red-300 group-hover:text-white transition-colors">
                    <ChevronRight size={20} />
                  </div>
              </Link>

              <Link
                  to="/calculators/evt-pathway"
                  className="group flex items-center justify-between bg-gradient-to-br from-neuro-900 to-neuro-800 p-5 rounded-2xl shadow-lg border border-neuro-700 hover:shadow-xl hover:scale-[1.01] transition-all"
              >
                  <div className="flex items-center space-x-5">
                      <div className="p-3 bg-white/10 rounded-xl text-white group-hover:bg-white group-hover:text-neuro-900 transition-all shadow-inner flex-shrink-0">
                          <Zap size={24} className="fill-white group-hover:fill-neuro-900 transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Thrombectomy Pathway</h3>
                        <p className="text-neuro-200 text-sm font-medium leading-snug">Eligibility for Early (0-6h) and Late (6-24h) EVT.</p>
                      </div>
                  </div>
                  <div className="pl-4 text-neuro-300 group-hover:text-white transition-colors">
                    <ChevronRight size={20} />
                  </div>
              </Link>

              <Link
                  to="/calculators/elan-pathway"
                  className="group flex items-center justify-between bg-gradient-to-br from-purple-900 to-purple-800 p-5 rounded-2xl shadow-lg border border-purple-700 hover:shadow-xl hover:scale-[1.01] transition-all"
              >
                  <div className="flex items-center space-x-5">
                      <div className="p-3 bg-white/10 rounded-xl text-white group-hover:bg-white group-hover:text-purple-900 transition-all shadow-inner flex-shrink-0">
                          <Brain size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">ELAN Protocol Pathway</h3>
                        <p className="text-purple-200 text-sm font-medium leading-snug">Timing of DOAC initiation after ischemic stroke with AF.</p>
                      </div>
                  </div>
                  <div className="pl-4 text-purple-300 group-hover:text-white transition-colors">
                    <ChevronRight size={20} />
                  </div>
              </Link>

              <Link
                  to="/calculators/gca-pathway"
                  className="group flex items-center justify-between bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl shadow-lg border border-slate-700 hover:shadow-xl hover:scale-[1.01] transition-all"
              >
                  <div className="flex items-center space-x-5">
                      <div className="p-3 bg-white/10 rounded-xl text-white group-hover:bg-white group-hover:text-slate-900 transition-all shadow-inner flex-shrink-0">
                          <Activity size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Giant Cell Arteritis / PMR Pathway</h3>
                        <p className="text-slate-400 text-sm font-medium leading-snug">Guided decision aid for suspected GCA/PMR.</p>
                      </div>
                  </div>
                  <div className="pl-4 text-slate-500 group-hover:text-white transition-colors">
                    <ChevronRight size={20} />
                  </div>
              </Link>

              {/* Standard Calculators */}
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
