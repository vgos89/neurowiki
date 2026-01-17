
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useParams } from 'react-router-dom';
import { CalculatorDefinition } from '../types';
import { Calculator, ChevronRight, RefreshCw, ArrowLeft, AlertCircle, Scan, Skull, Timer, Zap, Brain, Activity, Star, ChevronLeft, Settings2, UserCog, AlertTriangle, Copy, Check, ChevronDown } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { NIHSS_ITEMS, calculateTotal, getItemWarning } from '../utils/nihssShortcuts';
import NihssItemRow from '../components/NihssItemRow';

// --- CALCULATOR DEFINITIONS (Non-NIHSS kept as is) ---

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
    if (values.hypertension === false) score++;
    if (values.diabetes === false) score++;
    if (values.stroke === false) score++;
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
  // NIHSS is now handled separately but we keep a dummy entry for filtering if needed
  { id: 'nihss', name: 'NIH Stroke Scale (NIHSS)', description: 'Standardized quantification of stroke severity. Total score 0-42.', inputs: [], calculate: () => ({score: 0, interpretation: ''}) },
  ABCD2_CALC, 
  ICH_CALC, 
  HAS_BLED_CALC, 
  GCS_CALC, 
  ROPE_CALC
];

const Calculators: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { id: paramId } = useParams<{ id: string }>();
  
  // Prioritize path param (clean url), fallback to query param (legacy/compatibility)
  const activeId = paramId || searchParams.get('id');
  
  // Dedicated state for NIHSS
  const [nihssValues, setNihssValues] = useState<Record<string, number>>({});
  const [nihssMode, setNihssMode] = useState<'rapid' | 'detailed'>('rapid');
  const [userMode, setUserMode] = useState<'resident' | 'attending'>('resident');
  const [activePearl, setActivePearl] = useState<string | null>(null);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);

  // Generic State
  const activeCalc = activeId === 'nihss' ? null : CALCULATORS.find(c => c.id === activeId);
  const [values, setValues] = useState<Record<string, any>>({});
  const [result, setResult] = useState<{ score: number | string; interpretation: any } | null>(null);
  
  // Favorites
  const { toggleFavorite, isFavorite } = useFavorites();
  const [viewFilter, setViewFilter] = useState<'all' | 'favorites'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValues({});
    setResult(null);
    setNihssValues({});
    setIsHeaderCompact(false);
    inputRefs.current = [];
    
    // Snap to top of the main scrollable area
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo(0, 0);
  }, [activeId]);

  // Scroll listener for minimizing header
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    const handleScroll = () => {
        if (main.scrollTop > 60 && !isHeaderCompact) {
            setIsHeaderCompact(true);
        } else if (main.scrollTop < 10 && isHeaderCompact) {
            setIsHeaderCompact(false);
        }
    };

    main.addEventListener('scroll', handleScroll);
    return () => main.removeEventListener('scroll', handleScroll);
  }, [isHeaderCompact]);

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
                inputRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 300);
    }
  };

  const handleFavToggle = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowFav = toggleFavorite(id);
    setToastMessage(isNowFav ? `Saved ${name}` : `Removed ${name}`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // --- NIHSS Logic ---
  const handleNihssChange = (id: string, val: number) => {
    setNihssValues(prev => ({ ...prev, [id]: val }));
    
    // Auto-advance logic: Enabled for BOTH Rapid and Detailed modes
    // We snap to the next section when any selection is made
    const idx = NIHSS_ITEMS.findIndex(i => i.id === id);
    if (idx < NIHSS_ITEMS.length - 1) {
      setTimeout(() => {
        const el = document.getElementById(`nihss-row-${NIHSS_ITEMS[idx + 1].id}`);
        if (el) {
            // Use 'start' alignment because detailed rows might be tall
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    }
  };

  const setAllMotor = (val: number) => {
    setNihssValues(prev => ({
      ...prev,
      '5a': val, '5b': val, '6a': val, '6b': val
    }));
  };

  const copyNihss = () => {
    const total = calculateTotal(nihssValues);
    const breakdown = NIHSS_ITEMS.map(i => {
      const val = nihssValues[i.id] ?? 0;
      return `${i.shortName}: ${val}`;
    }).join('\n');
    const text = `NIHSS Total: ${total}\n\n${breakdown}`;
    navigator.clipboard.writeText(text);
    setToastMessage("Copied to Clipboard");
    setTimeout(() => setToastMessage(null), 2000);
  };

  // --- Specialized Pathways & Tools List ---
  const SPECIAL_TOOLS = [
    { id: 'aspects', name: 'ASPECTS Calculator', path: '/calculators/aspects', icon: Scan, desc: 'Interactive brain map for scoring early ischemic changes.', color: 'rose' },
    { id: 'migraine-pathway', name: 'Migraine & Headache', path: '/calculators/migraine-pathway', icon: Skull, desc: 'Evidence-based ED & Inpatient management.', color: 'indigo' },
    { id: 'se-pathway', name: 'Status Epilepticus', path: '/calculators/se-pathway', icon: Timer, desc: 'Comorbidity-aware decision support for Stage 1-3 SE.', color: 'red' },
    { id: 'evt-pathway', name: 'Thrombectomy Pathway', path: '/calculators/evt-pathway', icon: Zap, desc: 'Eligibility for Early (0-6h) and Late (6-24h) EVT.', color: 'neuro' },
    { id: 'elan-pathway', name: 'ELAN Protocol', path: '/calculators/elan-pathway', icon: Brain, desc: 'Timing of DOAC initiation after ischemic stroke with AF.', color: 'purple' },
    { id: 'gca-pathway', name: 'GCA / PMR Pathway', path: '/calculators/gca-pathway', icon: Activity, desc: 'Guided decision aid for suspected GCA/PMR.', color: 'slate' },
  ];

  const renderSpecialTool = (tool: typeof SPECIAL_TOOLS[0]) => {
    const isFav = isFavorite(tool.id);
    const colorMap: Record<string, string> = {
       rose: 'from-rose-900 to-rose-800 border-rose-700 text-rose-200 fill-white group-hover:fill-rose-900',
       indigo: 'from-indigo-900 to-indigo-800 border-indigo-700 text-indigo-200 fill-white group-hover:fill-indigo-900',
       red: 'from-red-900 to-red-800 border-red-700 text-red-200 fill-white group-hover:fill-red-900',
       neuro: 'from-neuro-900 to-neuro-800 border-neuro-700 text-neuro-200 fill-white group-hover:fill-neuro-900',
       purple: 'from-purple-900 to-purple-800 border-purple-700 text-purple-200 fill-white group-hover:fill-purple-900',
       slate: 'from-slate-900 to-slate-800 border-slate-700 text-slate-400 fill-white group-hover:fill-slate-900',
    };
    const c = colorMap[tool.color];

    return (
        <Link key={tool.id} to={tool.path} className={`relative group flex items-center justify-between bg-gradient-to-br ${c} p-6 rounded-2xl shadow-lg border hover:shadow-xl hover:scale-[1.01] transition-all active:scale-[0.98]`}>
            <div className="flex items-center space-x-5 flex-1 pr-8">
                <div className={`p-3 bg-white/10 rounded-xl text-white group-hover:bg-white transition-all shadow-inner flex-shrink-0 ${tool.color === 'rose' ? 'group-hover:text-rose-900' : tool.color === 'indigo' ? 'group-hover:text-indigo-900' : tool.color === 'red' ? 'group-hover:text-red-900' : tool.color === 'neuro' ? 'group-hover:text-neuro-900' : tool.color === 'purple' ? 'group-hover:text-purple-900' : 'group-hover:text-slate-900'}`}>
                    <tool.icon size={24} />
                </div>
                <div><h3 className="text-lg font-bold text-white mb-1">{tool.name}</h3><p className="text-sm font-medium leading-snug opacity-90">{tool.desc}</p></div>
            </div>
            <button onClick={(e) => handleFavToggle(e, tool.id, tool.name)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all z-10"><Star size={20} className={`transition-colors ${isFav ? 'text-yellow-400 fill-yellow-400' : 'text-white/30 hover:text-white'}`} /></button>
            <div className="text-white/50 group-hover:text-white transition-colors"><ChevronRight size={20} /></div>
        </Link>
    );
  };

  const renderStandardCalc = (calc: CalculatorDefinition) => {
      const isFav = isFavorite(calc.id);
      return (
        <Link key={calc.id} to={`/calculators/${calc.id}`} className="relative group flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-neuro-100 transition-all active:scale-[0.98]">
            <div className="flex items-center space-x-5 flex-1 pr-8">
                <div className="p-3 bg-neuro-50 rounded-xl text-neuro-600 group-hover:bg-neuro-600 group-hover:text-white transition-all shadow-inner flex-shrink-0"><Calculator size={24} /></div>
                <div><h3 className="text-lg font-bold text-slate-900 group-hover:text-neuro-700 transition-colors">{calc.name}</h3><p className="text-slate-500 text-sm font-medium leading-snug">{calc.description}</p></div>
            </div>
            <button onClick={(e) => handleFavToggle(e, calc.id, calc.name)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-50 active:scale-90 transition-all z-10"><Star size={20} className={`transition-colors ${isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 hover:text-slate-400'}`} /></button>
            <div className="text-gray-300 group-hover:text-neuro-500 transition-colors"><ChevronRight size={20} /></div>
        </Link>
      );
  };

  // --- VIEW: NIHSS CALCULATOR (DEDICATED) ---
  if (activeId === 'nihss') {
    const isFav = isFavorite('nihss');

    return (
      <div className="max-w-xl mx-auto pb-32">
        {/* Header - Collapsible */}
        <div 
            className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300 ease-in-out px-4 overflow-hidden ${isHeaderCompact ? 'py-2 cursor-pointer' : 'py-3'}`}
            onClick={() => isHeaderCompact && setIsHeaderCompact(false)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
                <Link to="/calculators" onClick={(e) => e.stopPropagation()} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"><ArrowLeft size={20} /></Link>
                <h1 className={`font-black text-slate-900 ml-2 transition-all ${isHeaderCompact ? 'text-lg' : 'text-xl'}`}>NIHSS</h1>
            </div>
            
            {/* When compact, show score for context */}
            {isHeaderCompact && (
                <div className="text-sm font-black text-slate-900 animate-in fade-in">
                    Score: {calculateTotal(nihssValues)}
                </div>
            )}

            {/* When expanded, show Favorite */}
            {!isHeaderCompact && (
                <button onClick={(e) => handleFavToggle(e, 'nihss', 'NIHSS')} className="p-2 rounded-full hover:bg-slate-100 transition-colors"><Star size={20} className={isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} /></button>
            )}
            
            {/* When compact, show expand indicator instead of star? Or allow star to persist? 
                Let's simplify: Click anywhere expands. Star is hidden when compact to save space for score.
            */}
          </div>
          
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isHeaderCompact ? 'max-h-0 opacity-0' : 'max-h-40 opacity-100 mt-4'}`}>
             <div className="flex flex-col gap-3 pb-1">
                 {/* Rapid / Detailed Toggle */}
                 <div className="flex items-center bg-slate-100 rounded-lg p-1 w-full" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setNihssMode('rapid')} className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${nihssMode === 'rapid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Rapid</button>
                    <button onClick={() => setNihssMode('detailed')} className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${nihssMode === 'detailed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Detailed</button>
                 </div>
                 
                 {/* Resident/Attending Sliding Toggle */}
                 <div className="relative flex bg-slate-100 rounded-lg p-1 h-9 cursor-pointer w-full" onClick={(e) => {e.stopPropagation(); setUserMode(m => m === 'resident' ? 'attending' : 'resident')}}>
                    {/* Sliding Background */}
                    <div 
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-white shadow-sm transition-all duration-300 ease-out border border-black/5 ${userMode === 'resident' ? 'left-1' : 'left-[calc(50%+0px)]'}`}
                    />
                    <button 
                        onClick={(e) => {e.stopPropagation(); setUserMode('resident')}} 
                        className={`relative z-10 flex-1 flex items-center justify-center px-2 text-[10px] font-bold transition-colors ${userMode === 'resident' ? 'text-slate-900' : 'text-slate-500'}`}
                    >
                        <UserCog size={12} className={`mr-1.5 ${userMode === 'resident' ? 'text-neuro-600' : ''}`} /> Resident
                    </button>
                    <button 
                        onClick={(e) => {e.stopPropagation(); setUserMode('attending')}} 
                        className={`relative z-10 flex-1 flex items-center justify-center px-2 text-[10px] font-bold transition-colors ${userMode === 'attending' ? 'text-slate-900' : 'text-slate-500'}`}
                    >
                        <Zap size={12} className={`mr-1.5 ${userMode === 'attending' ? 'text-amber-500' : ''}`} /> Attending
                    </button>
                 </div>
             </div>
          </div>
          
          {/* Subtle indicator when compact */}
          {isHeaderCompact && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50"></div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* List Layout used for BOTH modes now */}
          <div className="space-y-6">
            {NIHSS_ITEMS.map((item, idx) => {
              // Calculate specific warning if in Resident mode
              const warning = userMode === 'resident' ? getItemWarning(item.id, nihssValues[item.id] ?? 0, nihssValues) : null;

              // Force show pearl if in Resident mode (Rapid OR Detailed), otherwise follow toggle state (Attending)
              const showPearl = userMode === 'resident' || (activePearl === item.id);

              // Insert Header before Motor Items
              if (item.id === '5a') {
                return (
                  <React.Fragment key="motor-header">
                    <div className="flex justify-between items-end border-b border-gray-100 pb-2 mt-8 mb-4">
                      <h3 className="font-black text-sm text-slate-400 uppercase tracking-widest">Motor</h3>
                      <button onClick={() => setAllMotor(0)} className="text-xs font-bold text-neuro-600 bg-neuro-50 px-2 py-1 rounded hover:bg-neuro-100">Normal Exam</button>
                    </div>
                    <NihssItemRow 
                      key={item.id} 
                      item={item} 
                      value={nihssValues[item.id] ?? 0} 
                      onChange={(v) => handleNihssChange(item.id, v)} 
                      mode={nihssMode}
                      userMode={userMode}
                      showPearl={showPearl} 
                      onShowPearl={() => setActivePearl(prev => prev === item.id ? null : item.id)}
                      warning={warning}
                    />
                  </React.Fragment>
                );
              }
              return (
                <NihssItemRow 
                  key={item.id} 
                  item={item} 
                  value={nihssValues[item.id] ?? 0} 
                  onChange={(v) => handleNihssChange(item.id, v)} 
                  mode={nihssMode}
                  userMode={userMode}
                  showPearl={showPearl} 
                  onShowPearl={() => setActivePearl(prev => prev === item.id ? null : item.id)}
                  warning={warning}
                />
              );
            })}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 safe-area-bottom shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
           <div className="max-w-xl mx-auto flex justify-between items-center">
              <div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Score</div>
                 <div className="text-3xl font-black text-slate-900">{calculateTotal(nihssValues)}</div>
              </div>
              <div className="flex space-x-3">
                 <button onClick={() => setNihssValues({})} className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"><RefreshCw size={20} /></button>
                 <button onClick={copyNihss} className="px-6 py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 active:scale-95 flex items-center transition-all"><Copy size={18} className="mr-2" /> Copy</button>
              </div>
           </div>
        </div>

        {/* Toast */}
        {toastMessage && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl text-sm font-bold animate-in fade-in zoom-in-95 duration-200 z-[60] whitespace-nowrap">
                {toastMessage}
            </div>
        )}
      </div>
    );
  }

  // --- List View ---
  const favoritesList = [...SPECIAL_TOOLS, ...CALCULATORS.map(c => ({...c, path: `/calculators/${c.id}`, icon: Calculator}))].filter(c => isFavorite(c.id));
  const hasFavorites = favoritesList.length > 0;

  return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Clinical Calculators</h1>
                <p className="text-slate-500 mt-3 font-medium text-lg">Evidence-based scoring systems for neurological assessment.</p>
              </div>
              
              <div className="bg-slate-100 p-1 rounded-xl flex">
                  <button onClick={() => setViewFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>All Tools</button>
                  <button onClick={() => setViewFilter('favorites')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${viewFilter === 'favorites' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Star size={14} className={`mr-1.5 ${hasFavorites ? 'fill-yellow-400 text-yellow-400' : ''}`} /> Favorites</button>
              </div>
          </div>

          {toastMessage && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl text-sm font-bold animate-in fade-in zoom-in-95 duration-200 z-50 whitespace-nowrap">
                {toastMessage}
            </div>
          )}

          {viewFilter === 'favorites' ? (
              <div className="space-y-4">
                  {favoritesList.length > 0 ? (
                      favoritesList.map(item => {
                          const calcDef = CALCULATORS.find(c => c.id === item.id);
                          if (calcDef) return renderStandardCalc(calcDef);
                          const toolDef = SPECIAL_TOOLS.find(t => t.id === item.id);
                          if (toolDef) return renderSpecialTool(toolDef);
                          return null;
                      })
                  ) : (
                      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200"><div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><Star size={32} /></div><h3 className="text-lg font-bold text-slate-900">No favorites yet</h3><p className="text-slate-500 text-sm mt-1">Tap the star icon on any calculator to save it here.</p><button onClick={() => setViewFilter('all')} className="mt-6 text-neuro-600 font-bold text-sm hover:underline">Browse all calculators</button></div>
                  )}
              </div>
          ) : (
              <div className="space-y-4">
                  {hasFavorites && (
                      <div className="mb-8">
                          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center"><Star size={12} className="mr-1.5 fill-slate-400" /> Favorited</h2>
                          <div className="space-y-4">
                              {favoritesList.map(item => {
                                  const calcDef = CALCULATORS.find(c => c.id === item.id);
                                  if (calcDef) return renderStandardCalc(calcDef);
                                  const toolDef = SPECIAL_TOOLS.find(t => t.id === item.id);
                                  if (toolDef) return renderSpecialTool(toolDef);
                                  return null;
                              })}
                          </div>
                          <div className="my-8 border-t border-slate-200"></div>
                      </div>
                  )}
                  {SPECIAL_TOOLS.map(tool => renderSpecialTool(tool))}
                  {CALCULATORS.map(calc => renderStandardCalc(calc))}
              </div>
          )}
      </div>
  );
};

export default Calculators;
