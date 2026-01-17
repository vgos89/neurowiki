
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Check, RotateCcw, Copy, Info, AlertCircle, ChevronRight, Activity, Star } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';

// --- Types ---
type Tri = "no" | "yes" | "unknown";
type MarkerLevel = "normal" | "mild" | "marked" | "unknown";

type Inputs = {
  age50: Tri;
  visual: Tri;
  jawClaudication: Tri;
  headacheOrScalpTenderness: Tri;
  pmrSymptoms: Tri;
  constitutional: Tri;
  crpEsr: MarkerLevel;
  imagingTemporal: Tri;
  imagingAortic: Tri;
  imagingShoulderHip: Tri;
};

type Result = {
  score: number;
  tier: "Low" | "Intermediate" | "High";
  phenotype: "Cranial GCA" | "Large-vessel GCA" | "PMR-dominant" | "Unclear";
  action: string;
  reasons: { label: string; points: number }[];
  notes: string[];
};

// Define field order for auto-scrolling
const STEP_FIELDS: Record<number, string[]> = {
  1: ['age50', 'visual', 'jawClaudication'],
  2: ['headacheOrScalpTenderness', 'pmrSymptoms', 'constitutional'],
  3: ['crpEsr', 'imagingTemporal', 'imagingAortic', 'imagingShoulderHip']
};

// --- Logic ---
const calculateGcaDecision = (inputs: Inputs): Result => {
  let score = 0;
  const reasons: { label: string; points: number }[] = [];
  const notes: string[] = [];

  // 1. Red Flags
  if (inputs.visual === 'yes') {
    score += 6;
    reasons.push({ label: "Visual symptoms/vision loss", points: 6 });
    notes.push("Visual symptoms are an emergency; prioritize immediate treatment.");
  }
  if (inputs.jawClaudication === 'yes') {
    score += 4;
    reasons.push({ label: "Jaw claudication", points: 4 });
  }

  // 2. Phenotype Symptoms
  if (inputs.headacheOrScalpTenderness === 'yes') {
    score += 2;
    reasons.push({ label: "New headache or scalp tenderness", points: 2 });
  }
  if (inputs.pmrSymptoms === 'yes') {
    score += 2;
    reasons.push({ label: "PMR features (proximal pain/stiffness)", points: 2 });
  }
  if (inputs.constitutional === 'yes') {
    score += 1;
    reasons.push({ label: "Constitutional symptoms", points: 1 });
  }

  // 3. Objective Data
  if (inputs.crpEsr === 'marked') {
    score += 3;
    reasons.push({ label: "Markedly elevated CRP/ESR", points: 3 });
  } else if (inputs.crpEsr === 'mild') {
    score += 1;
    reasons.push({ label: "Mildly elevated CRP/ESR", points: 1 });
  } else if (inputs.crpEsr === 'normal') {
    notes.push("Normal CRP/ESR does not exclude GCA, especially early or treated disease.");
  }

  if (inputs.imagingTemporal === 'yes') {
    score += 4;
    reasons.push({ label: "Positive Temporal Artery imaging", points: 4 });
  }
  if (inputs.imagingAortic === 'yes') {
    score += 3;
    reasons.push({ label: "Positive Aortic/Branch imaging", points: 3 });
  }
  if (inputs.imagingShoulderHip === 'yes') {
    score += 1;
    reasons.push({ label: "Shoulder/Hip inflammation", points: 1 });
  }

  // Age Note
  if (inputs.age50 === 'no') {
    notes.push("GCA is uncommon under age 50; consider alternative diagnoses.");
  }

  // Tier Logic
  let tier: Result['tier'] = "Low";
  
  if (score >= 12) {
    tier = "High";
  } else if (score >= 4) {
    // Merged previous "High" (8-11) and "Intermediate" (4-7) into Intermediate
    // to align with the updated, less aggressive guidance for the top tier.
    tier = "Intermediate";
  } else {
    tier = "Low";
  }

  // Hard Override
  if (inputs.visual === 'yes') {
    tier = "High";
  }

  // Action Mapping
  let action = "";
  switch (tier) {
    case "High":
      action = "Consider confirmatory testing and specialist evaluation.";
      break;
    case "Intermediate":
      action = "Intermediate suspicion: obtain vascular imaging (US/MRA/PET per availability) and re-assess promptly. Provide safety-net instructions for visual symptoms.";
      break;
    case "Low":
      action = "Lower suspicion: consider PMR or alternative diagnoses. If treating as PMR, counsel on red flags and reassess if cranial/visual symptoms develop.";
      break;
  }

  // Phenotype Logic
  let phenotype: Result['phenotype'] = "Unclear";
  if (inputs.imagingAortic === 'yes') {
    phenotype = "Large-vessel GCA";
  } else if (inputs.imagingTemporal === 'yes' || inputs.jawClaudication === 'yes' || inputs.headacheOrScalpTenderness === 'yes') {
    phenotype = "Cranial GCA";
  } else if (inputs.pmrSymptoms === 'yes' || inputs.imagingShoulderHip === 'yes') {
    phenotype = "PMR-dominant";
  }

  return { score, tier, phenotype, action, reasons, notes };
};

const STEPS = [
  { id: 1, title: "Red Flags" },
  { id: 2, title: "Phenotype" },
  { id: 3, title: "Objective" },
  { id: 4, title: "Results" }
];

// --- Components ---

interface TriButtonProps {
    field: keyof Inputs;
    label: string;
    value: Tri;
    onChange: (field: keyof Inputs, val: Tri) => void;
    registerRef: (el: HTMLDivElement | null) => void;
}

const TriButton = React.memo(({ field, label, value, onChange, registerRef }: TriButtonProps) => (
    <div 
        ref={registerRef}
        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-neuro-100 scroll-mt-32"
    >
      <label className="block text-base font-bold text-slate-800 mb-4">{label}</label>
      <div className="flex bg-slate-100 rounded-lg p-1.5 h-16">
        {(['yes', 'no', 'unknown'] as Tri[]).map(val => (
          <button
            key={val}
            onClick={() => onChange(field, val)}
            className={`flex-1 rounded-md text-sm font-bold capitalize transition-all duration-200 touch-manipulation ${
              value === val
                ? val === 'yes' 
                    ? 'bg-neuro-600 text-white shadow-md' 
                    : val === 'no' 
                        ? 'bg-white text-slate-700 shadow-md ring-1 ring-black/5'
                        : 'bg-white text-slate-400 shadow-md ring-1 ring-black/5'
                : 'text-slate-400 hover:text-slate-600 hover:bg-black/5'
            }`}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
));

const GCAPathway: React.FC = () => {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<Inputs>({
    age50: 'unknown',
    visual: 'unknown',
    jawClaudication: 'unknown',
    headacheOrScalpTenderness: 'unknown',
    pmrSymptoms: 'unknown',
    constitutional: 'unknown',
    crpEsr: 'unknown',
    imagingTemporal: 'unknown',
    imagingAortic: 'unknown',
    imagingShoulderHip: 'unknown'
  });

  const [result, setResult] = useState<Result | null>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Favorites
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showFavToast, setShowFavToast] = useState(false);
  const isFav = isFavorite('gca-pathway');

  const handleFavToggle = () => {
      const newVal = toggleFavorite('gca-pathway');
      setShowFavToast(true);
      setTimeout(() => setShowFavToast(false), 2000);
  };

  useEffect(() => {
    setResult(calculateGcaDecision(inputs));
  }, [inputs]);

  useEffect(() => {
     const mainElement = document.querySelector('main');
     if (mainElement) {
        mainElement.scrollTo({ top: 0, behavior: 'instant' });
     } else {
        window.scrollTo(0,0);
     }
  }, [step]);

  const updateInput = (field: keyof Inputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleFieldChange = useCallback((field: keyof Inputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));

    // Auto-scroll (snap) logic
    const currentFields = STEP_FIELDS[step];
    if (currentFields) {
        const idx = currentFields.indexOf(field as string);
        
        // If there is a next field, scroll to it
        if (idx >= 0 && idx < currentFields.length - 1) {
            const nextField = currentFields[idx + 1];
            // Small timeout to allow state update to process
            setTimeout(() => {
                const nextEl = fieldRefs.current[nextField];
                if (nextEl) {
                    nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        } 
        // If it's the last field, scroll to the action bar
        else if (idx === currentFields.length - 1) {
            setTimeout(() => {
                const actionBar = document.getElementById('gca-action-bar');
                if (actionBar) {
                    actionBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 300);
        }
    }
  }, [step]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleReset = () => {
    setInputs({
        age50: 'unknown',
        visual: 'unknown',
        jawClaudication: 'unknown',
        headacheOrScalpTenderness: 'unknown',
        pmrSymptoms: 'unknown',
        constitutional: 'unknown',
        crpEsr: 'unknown',
        imagingTemporal: 'unknown',
        imagingAortic: 'unknown',
        imagingShoulderHip: 'unknown'
    });
    setStep(1);
  };

  const copySummary = () => {
    if (!result) return;
    const summary = `
GCA/PMR Decision Aid Summary:
Tier: ${result.tier} (Score: ${result.score})
Phenotype: ${result.phenotype}
Action: ${result.action}

Drivers:
${result.reasons.map(r => `- ${r.label} (+${r.points})`).join('\n')}

Notes:
${result.notes.join('\n')}
    `.trim();
    navigator.clipboard.writeText(summary);
    alert("Summary copied to clipboard.");
  };

  const markerOptions = [
    { value: 'normal', label: 'Normal', desc: 'ESR normal for age / CRP < 10 mg/L' },
    { value: 'mild', label: 'Mildly Elevated', desc: 'ESR > normal but < 50 / CRP 10–50 mg/L' },
    { value: 'marked', label: 'Markedly Elevated', desc: 'ESR ≥ 50 mm/hr or CRP ≥ 50 mg/L' },
    { value: 'unknown', label: 'Unknown', desc: 'Results pending' },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 md:pb-20">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
            <Link to="/calculators" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-neuro-600 mb-6 group">
                <div className="bg-white p-1.5 rounded-md border border-gray-200 mr-2 shadow-sm group-hover:shadow-md transition-all">
                    <ArrowLeft size={16} />
                </div>
                Back to Calculators
            </Link>
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-neuro-100 text-neuro-700 rounded-lg">
                    <Activity size={24} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">GCA / PMR Clinical Pathway</h1>
            </div>
            <p className="text-slate-500 font-medium">Guided decision aid for suspected GCA/PMR; not a substitute for clinical judgment.</p>
        </div>
        <button 
            onClick={handleFavToggle}
            className="p-3 rounded-full hover:bg-slate-100 transition-colors"
        >
            <Star size={24} className={isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center space-x-2 mb-8 px-1">
         {STEPS.map((s, idx) => (
             <div key={s.id} className="flex-1 flex flex-col items-center relative">
                 <div className={`w-full h-1 absolute top-1/2 -translate-y-1/2 -z-10 ${idx === 0 ? 'hidden' : ''} ${step >= s.id ? 'bg-neuro-500' : 'bg-gray-200'}`}></div>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors z-10 ${
                     step === s.id ? 'bg-white border-neuro-500 text-neuro-600' : 
                     step > s.id ? 'bg-neuro-500 border-neuro-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-400'
                 }`}>
                     {step > s.id ? <Check size={14} /> : s.id}
                 </div>
                 <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${step === s.id ? 'text-neuro-600' : 'text-gray-300'}`}>{s.title}</span>
             </div>
         ))}
      </div>

      {/* Step 1: Red Flags */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <TriButton field="age50" label="Age ≥ 50 years?" value={inputs.age50} onChange={handleFieldChange} registerRef={el => fieldRefs.current['age50'] = el} />
            <TriButton field="visual" label="Visual symptoms or transient vision loss?" value={inputs.visual} onChange={handleFieldChange} registerRef={el => fieldRefs.current['visual'] = el} />
            <TriButton field="jawClaudication" label="Jaw claudication?" value={inputs.jawClaudication} onChange={handleFieldChange} registerRef={el => fieldRefs.current['jawClaudication'] = el} />
        </div>
      )}

      {/* Step 2: Phenotype */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <TriButton field="headacheOrScalpTenderness" label="New headache or scalp tenderness?" value={inputs.headacheOrScalpTenderness} onChange={handleFieldChange} registerRef={el => fieldRefs.current['headacheOrScalpTenderness'] = el} />
             <TriButton field="pmrSymptoms" label="PMR features (proximal pain/stiffness, morning stiffness)?" value={inputs.pmrSymptoms} onChange={handleFieldChange} registerRef={el => fieldRefs.current['pmrSymptoms'] = el} />
             <TriButton field="constitutional" label="Constitutional symptoms (fever/weight loss/night sweats)?" value={inputs.constitutional} onChange={handleFieldChange} registerRef={el => fieldRefs.current['constitutional'] = el} />
        </div>
      )}

      {/* Step 3: Objective */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div 
                ref={el => { fieldRefs.current['crpEsr'] = el; }}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-neuro-100 transition-all scroll-mt-32"
            >
                <label className="block text-base font-bold text-slate-800 mb-4">CRP/ESR Level</label>
                <div className="flex flex-col space-y-3">
                    {markerOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => handleFieldChange('crpEsr', opt.value)}
                            className={`flex items-center justify-between p-4 rounded-xl text-sm transition-all duration-200 border touch-manipulation active:scale-[0.98] ${
                                inputs.crpEsr === opt.value
                                    ? 'bg-neuro-600 text-white border-neuro-600 shadow-md ring-2 ring-neuro-100'
                                    : 'bg-slate-50 text-slate-600 border-transparent hover:bg-white hover:border-gray-200'
                            }`}
                        >
                            <span className="font-bold text-base">{opt.label}</span>
                            <span className={`text-xs ${inputs.crpEsr === opt.value ? 'text-neuro-100' : 'text-slate-400'}`}>{opt.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mt-8 mb-2 px-2">Imaging Findings</h3>
            <TriButton field="imagingTemporal" label="Temporal Artery (Halo sign/Biopsy)?" value={inputs.imagingTemporal} onChange={handleFieldChange} registerRef={el => fieldRefs.current['imagingTemporal'] = el} />
            <TriButton field="imagingAortic" label="Aortic/Branch Involvement (Large Vessel)?" value={inputs.imagingAortic} onChange={handleFieldChange} registerRef={el => fieldRefs.current['imagingAortic'] = el} />
            <TriButton field="imagingShoulderHip" label="Shoulder/Hip Inflammation (PMR)?" value={inputs.imagingShoulderHip} onChange={handleFieldChange} registerRef={el => fieldRefs.current['imagingShoulderHip'] = el} />
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && result && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
             {/* Tier Card */}
             <div className={`p-8 rounded-3xl text-white relative overflow-hidden shadow-xl ${
                 result.tier === 'High' ? 'bg-red-600 shadow-red-200' :
                 result.tier === 'Intermediate' ? 'bg-amber-500 shadow-amber-200' : 'bg-emerald-500 shadow-emerald-200'
             }`}>
                 <div className="relative z-10">
                     <div className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Likelihood Tier</div>
                     <div className="text-4xl font-black tracking-tight mb-2">{result.tier} Suspicion</div>
                     <div className="text-lg font-medium opacity-90 border-t border-white/20 pt-4 mt-2">{result.action}</div>
                 </div>
                 {/* Decorative blob */}
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-20 rounded-full blur-3xl"></div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Phenotype */}
                 <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Most Likely Phenotype</h4>
                     <div className="text-xl font-bold text-slate-900">{result.phenotype}</div>
                 </div>

                 {/* Drivers */}
                 <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Drivers (+Points)</h4>
                     <ul className="space-y-2">
                         {result.reasons.length > 0 ? result.reasons.map((r, i) => (
                             <li key={i} className="text-sm font-medium text-slate-700 flex justify-between items-center border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                                 <span>{r.label}</span>
                                 <span className="font-bold text-neuro-600 bg-neuro-50 px-2 py-0.5 rounded ml-2">+{r.points}</span>
                             </li>
                         )) : <span className="text-sm text-slate-400 italic">No specific positive drivers selected.</span>}
                     </ul>
                 </div>
             </div>

             {/* Notes */}
             {result.notes.length > 0 && (
                 <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-blue-900 text-sm shadow-sm">
                     <div className="flex items-center font-bold mb-2">
                         <Info size={16} className="mr-2" /> Clinical Notes
                     </div>
                     <ul className="list-disc list-inside space-y-1 opacity-80">
                         {result.notes.map((note, i) => (
                             <li key={i}>{note}</li>
                         ))}
                     </ul>
                 </div>
             )}

             {/* Disclaimer */}
             <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-gray-100 text-xs text-slate-500 leading-relaxed">
                 <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                 <div>
                     <strong>Decision Support Only. Not Medical Advice.</strong>
                     <p className="mt-1">Visual symptoms/vision loss are an emergency—seek urgent evaluation. This tool does not replace clinical judgment or local protocols.</p>
                 </div>
             </div>
          </div>
      )}

      {/* Sticky Actions Bar */}
      <div id="gca-action-bar" className="mt-8 pt-4 md:border-t border-gray-100 scroll-mt-4 fixed bottom-[4.5rem] md:static left-0 right-0 bg-white/95 backdrop-blur md:bg-transparent p-4 md:p-0 border-t md:border-0 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none">
         <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
             {/* Back Button */}
             <button 
                onClick={handleBack} 
                disabled={step === 1}
                className={`px-6 py-3 border border-gray-200 rounded-xl font-bold transition-all ${
                    step === 1 
                    ? 'opacity-0 pointer-events-none' 
                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:border-gray-300'
                }`}
             >
                Back
             </button>

             {/* Desktop Start Over for Step 4 */}
             {step === 4 && (
                <button onClick={handleReset} className="hidden md:flex items-center text-slate-500 hover:text-neuro-600 font-bold px-4 py-2 rounded-lg transition-colors">
                    <RotateCcw size={16} className="mr-2" /> Start Over
                </button>
             )}

             {/* Next / Copy Button */}
             {step < 4 ? (
                 <button onClick={handleNext} className="flex-1 md:flex-none px-8 py-3 bg-neuro-600 text-white rounded-xl font-bold hover:bg-neuro-700 shadow-lg shadow-neuro-200 transition-all flex items-center justify-center transform active:scale-95">
                     Next <ChevronRight size={16} className="ml-2" />
                 </button>
             ) : (
                 <button onClick={copySummary} className="flex-1 md:flex-none px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg transition-all flex items-center justify-center transform active:scale-95">
                     <Copy size={16} className="mr-2" /> Copy
                 </button>
             )}
         </div>
      </div>
      
      {/* Mobile Start Over Spacer & Button */}
      {step === 4 && (
        <div className="md:hidden mt-20 text-center pb-8">
            <button onClick={handleReset} className="text-sm text-slate-400 font-bold flex items-center justify-center w-full p-4 hover:bg-slate-50 rounded-lg transition-colors">
                <RotateCcw size={14} className="mr-2" /> Start Over
            </button>
        </div>
      )}

      {/* References */}
      {step === 4 && (
          <div className="mt-12 border-t border-gray-100 pt-8 pb-8">
              <h3 className="text-sm font-bold text-slate-900 mb-4">References</h3>
              <ul className="space-y-3 text-xs text-slate-500">
                  <li className="flex items-start">
                      <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">1</span>
                      2021 ACR/Vasculitis Foundation guideline for management of Giant Cell Arteritis (GCA) and Takayasu arteritis.
                  </li>
                  <li className="flex items-start">
                      <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">2</span>
                      2023 EULAR imaging recommendations for large-vessel vasculitis (supports early imaging such as ultrasound/MRA/CTA/PET).
                  </li>
                  <li className="flex items-start">
                      <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">3</span>
                      Evidence summaries noting urgent glucocorticoids to reduce risk of vision loss in suspected GCA with visual symptoms (UpToDate, NCBI).
                  </li>
                  <li className="flex items-start">
                      <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">4</span>
                      This calculator is a decision aid and is not a validated prediction rule.
                  </li>
              </ul>
          </div>
      )}
      {showFavToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-200 z-[60]">
          {isFav ? 'Saved to Favorites' : 'Removed from Favorites'}
        </div>
      )}
    </div>
  );
};

export default GCAPathway;
