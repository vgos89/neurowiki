
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, RotateCcw, Copy, Info, AlertCircle, ChevronRight, Activity, Zap, XCircle } from 'lucide-react';
import { EVT_CONTENT } from '../data/toolContent';
import { autoLinkReactNodes } from '../internalLinks/autoLink';

// ... (KEEP ALL TYPES AND INTERFACES SAME) ...
type Tri = "yes" | "no" | "unknown";
type AgeGroup = "under_18" | "18_79" | "80_plus" | "unknown";
type TimeWindow = "0_6" | "6_24" | "unknown";
type NIHSSGroup = "0_5" | "6_9" | "10_19" | "20_plus" | "unknown";

type Inputs = {
  lvo: Tri;
  mrs: Tri;
  age: AgeGroup;
  time: TimeWindow;
  nihss: NIHSSGroup;
  aspects: string;
  core: string;
  mismatchVol: string;
  mismatchRatio: string;
};

type Result = {
  eligible: boolean;
  status: "Eligible" | "Not Eligible" | "Consult" | "Clinical Judgment";
  criteriaName?: string;
  reason: string;
  details: string;
  exclusionReason?: string;
};

const STEPS = [
  { id: 1, title: "Triage" },
  { id: 2, title: "Clinical" },
  { id: 3, title: "Imaging" },
  { id: 4, title: "Decision" }
];

const STEP_FIELDS: Record<number, string[]> = {
  1: ['lvo', 'mrs', 'age'],
  2: ['time', 'nihss'],
  3: ['aspects', 'core', 'mismatchVol', 'mismatchRatio']
};

const calculateEvtProtocol = (inputs: Inputs): Result => {
  if (inputs.lvo === 'no') return { eligible: false, status: "Not Eligible", reason: "No Large Vessel Occlusion (LVO)", details: "Thrombectomy is indicated for occlusions of the ICA or MCA (M1).", exclusionReason: "Absence of LVO target." };
  if (inputs.mrs === 'no') return { eligible: false, status: "Not Eligible", reason: "Pre-stroke Disability (mRS > 1)", details: "Standard criteria require pre-stroke functional independence.", exclusionReason: "Poor baseline functional status." };
  if (inputs.age === 'under_18') return { eligible: false, status: "Consult", reason: "Pediatric Patient", details: "Standard guidelines apply to age ≥ 18. Pediatric thrombectomy requires specialized consultation.", exclusionReason: "Age < 18." };

  if (inputs.time === '0_6') {
     const aspects = parseInt(inputs.aspects);
     if (isNaN(aspects)) return { eligible: false, status: "Not Eligible", reason: "Pending Imaging", details: "" };
     if (inputs.nihss === '0_5') return { eligible: true, status: "Clinical Judgment", reason: "Low NIHSS (< 6)", details: "Guidelines recommend EVT if deficit is disabling despite low score (e.g., aphasia, hemianopsia).", criteriaName: "Early Window (Low NIHSS)" };

     if (aspects >= 6) {
         return { eligible: true, status: "Eligible", criteriaName: "Standard Early Window", reason: "ASPECTS ≥ 6", details: EVT_CONTENT.earlyEligible };
     } else if (aspects >= 3) {
         return { eligible: true, status: "Eligible", criteriaName: "Large Core Protocol", reason: "ASPECTS 3-5", details: EVT_CONTENT.largeCore };
     } else {
         return { eligible: false, status: "Consult", reason: "Malignant Profile (ASPECTS 0-2)", details: "Very large core. High risk of futile reperfusion and hemorrhage. Individualized decision.", exclusionReason: "ASPECTS < 3" };
     }
  }

  if (inputs.time === '6_24') {
      const core = parseInt(inputs.core);
      const mmVol = parseInt(inputs.mismatchVol);
      const ratio = parseFloat(inputs.mismatchRatio);
      if (isNaN(core)) return { eligible: false, status: "Not Eligible", reason: "Pending Imaging", details: "" };

      let dawnEligible = false;
      const isAge80Plus = inputs.age === '80_plus';
      const nihssNum = inputs.nihss === '20_plus' ? 25 : (inputs.nihss === '10_19' ? 15 : (inputs.nihss === '6_9' ? 8 : 2));
      
      if (nihssNum >= 10) {
          if (isAge80Plus) { if (core < 21) dawnEligible = true; } 
          else { if (core < 31) dawnEligible = true; else if (core < 51 && nihssNum >= 20) dawnEligible = true; }
      }

      if (dawnEligible) return { eligible: true, status: "Eligible", criteriaName: "DAWN Criteria", reason: "Clinical-Core Mismatch", details: EVT_CONTENT.dawnEligible };

      if (!isNaN(mmVol) && !isNaN(ratio)) {
          if (core < 70 && mmVol >= 15 && ratio >= 1.8) return { eligible: true, status: "Eligible", criteriaName: "DEFUSE-3 Criteria", reason: "Perfusion Mismatch", details: EVT_CONTENT.defuseEligible };
      }

      if (core >= 50) {
           return { eligible: true, status: "Eligible", criteriaName: "Large Core Protocol", reason: `Large Core Volume (${core} ml)`, details: EVT_CONTENT.largeCoreLate };
      }
      
      return { eligible: false, status: "Not Eligible", reason: "No Target Profile", details: EVT_CONTENT.notEligibleLate, exclusionReason: "Imaging criteria not met." };
  }

  return { eligible: false, status: "Not Eligible", reason: "Incomplete Data", details: "" };
};

// ... (KEEP SELECTION CARD COMPONENT SAME) ...
interface SelectionCardProps {
    title: string;
    description?: string;
    selected: boolean;
    onClick: () => void;
    variant?: 'default' | 'danger';
}
const SelectionCard = React.memo(({ title, description, selected, onClick, variant = 'default' }: SelectionCardProps) => (
    <button onClick={onClick} className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden ${selected ? variant === 'danger' ? 'bg-red-50 border-red-500 text-red-900' : 'bg-neuro-50 border-neuro-500 text-neuro-900' : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-slate-700'}`}>
        <div className="flex items-start justify-between relative z-10">
            <div><span className={`block font-bold ${selected ? 'text-current' : 'text-slate-900'}`}>{title}</span>{description && <span className={`text-sm mt-1 block ${selected ? 'opacity-90' : 'text-slate-500'}`}>{description}</span>}</div>
            {selected && <div className={`p-1 rounded-full ${variant === 'danger' ? 'bg-red-500 text-white' : 'bg-neuro-500 text-white'}`}><Check size={14} /></div>}
        </div>
    </button>
));

const EvtPathway: React.FC = () => {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<Inputs>({ lvo: 'unknown', mrs: 'unknown', age: 'unknown', time: 'unknown', nihss: 'unknown', aspects: '', core: '', mismatchVol: '', mismatchRatio: '' });
  const [result, setResult] = useState<Result | null>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => { setResult(calculateEvtProtocol(inputs)); }, [inputs]);
  useEffect(() => { const mainElement = document.querySelector('main'); if (mainElement) mainElement.scrollTo({ top: 0, behavior: 'instant' }); else window.scrollTo(0,0); }, [step]);

  const updateInput = useCallback((field: keyof Inputs, value: any) => {
    setInputs(prev => {
        const next = { ...prev, [field]: value };
        
        // Auto-calculate Mismatch Ratio if Core and MismatchVol are present
        // Ratio = (Core + MismatchVol) / Core, assuming MismatchVol input is the difference (Penumbra)
        if (field === 'core' || field === 'mismatchVol') {
            const coreVal = parseFloat(field === 'core' ? value : prev.core);
            const mmVal = parseFloat(field === 'mismatchVol' ? value : prev.mismatchVol);
            
            if (!isNaN(coreVal) && !isNaN(mmVal) && coreVal > 0) {
                 const ratio = ((mmVal + coreVal) / coreVal).toFixed(1);
                 next.mismatchRatio = ratio;
            }
        }
        return next;
    });

    const currentFields = STEP_FIELDS[step];
    if (currentFields) {
        const idx = currentFields.indexOf(field);
        if (idx >= 0 && idx < currentFields.length - 1) setTimeout(() => fieldRefs.current[currentFields[idx + 1]]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
        else if (idx === currentFields.length - 1) setTimeout(() => document.getElementById('evt-action-bar')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
    }
  }, [step]);

  const handleNext = () => { if (step < 4) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };
  const handleReset = () => { setInputs({ lvo: 'unknown', mrs: 'unknown', age: 'unknown', time: 'unknown', nihss: 'unknown', aspects: '', core: '', mismatchVol: '', mismatchRatio: '' }); setStep(1); };
  const copySummary = () => { if (!result) return; const summary = `EVT Eligibility Assessment\nStatus: ${result.status.toUpperCase()}\nProtocol: ${result.criteriaName || 'Standard Screening'}\n\nClinical Data:\n- Time Window: ${inputs.time === '0_6' ? '0-6h' : '6-24h'}\n- NIHSS: ${inputs.nihss.replace('_', '-').replace('plus', '+')}\n- Age: ${inputs.age.replace('_', '-').replace('plus', '+')}\n\nImaging Data:\n${inputs.time === '0_6' ? `- ASPECTS: ${inputs.aspects}` : `- Core: ${inputs.core}ml | Mismatch: ${inputs.mismatchVol}ml | Ratio: ${inputs.mismatchRatio}`}\n\nReason: ${result.reason}\n${result.details}`.trim(); navigator.clipboard.writeText(summary); alert("Assessment copied to EMR."); };
  const isTriageFail = inputs.lvo === 'no' || inputs.mrs === 'no' || inputs.age === 'under_18';

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 md:pb-20">
      {/* Header and Progress... */}
      <div className="mb-6">
        <Link to="/calculators" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-neuro-600 mb-6 group">
            <div className="bg-white p-1.5 rounded-md border border-gray-200 mr-2 shadow-sm group-hover:shadow-md transition-all"><ArrowLeft size={16} /></div> Back to Calculators
        </Link>
        <div className="flex items-center space-x-3 mb-2"><div className="p-2 bg-neuro-100 text-neuro-700 rounded-lg"><Zap size={24} className="fill-neuro-700" /></div><h1 className="text-2xl font-black text-slate-900 tracking-tight">Thrombectomy Pathway</h1></div>
        <p className="text-slate-500 font-medium">Eligibility screening for Early (0-6h) and Late (6-24h) EVT.</p>
      </div>
      
      <div className="flex items-center space-x-2 mb-8 px-1">{STEPS.map((s, idx) => (<div key={s.id} className="flex-1 flex flex-col items-center relative"><div className={`w-full h-1 absolute top-1/2 -translate-y-1/2 -z-10 ${idx === 0 ? 'hidden' : ''} ${step >= s.id ? 'bg-neuro-500' : 'bg-gray-200'}`}></div><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors z-10 ${step === s.id ? 'bg-white border-neuro-500 text-neuro-600' : step > s.id ? 'bg-neuro-500 border-neuro-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>{step > s.id ? <Check size={14} /> : s.id}</div><span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${step === s.id ? 'text-neuro-600' : 'text-gray-300'}`}>{s.title}</span></div>))}</div>

      <div ref={stepContainerRef} className="space-y-6 min-h-[300px]">
        {/* Step 1: Triage */}
        {step === 1 && (<div className="space-y-6 animate-in slide-in-from-right-4 duration-300"><div ref={el => { fieldRefs.current['lvo'] = el; }}><h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Vessel Status</h3><div className="grid grid-cols-1 gap-3"><SelectionCard title="LVO Confirmed?" description="Occlusion of ICA or MCA (M1) on CTA/MRA." selected={inputs.lvo === 'yes'} onClick={() => updateInput('lvo', 'yes')} /><SelectionCard title="No LVO / Distal Only" description="Standard criteria require proximal LVO." selected={inputs.lvo === 'no'} onClick={() => updateInput('lvo', 'no')} /></div></div>{inputs.lvo === 'yes' && (<div ref={el => { fieldRefs.current['mrs'] = el; }} className="animate-in fade-in slide-in-from-top-2"><h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide mt-6">Functional Baseline</h3><div className="grid grid-cols-1 gap-3"><SelectionCard title="Independent (mRS 0-1)" description="No symptoms or no significant disability prior to stroke." selected={inputs.mrs === 'yes'} onClick={() => updateInput('mrs', 'yes')} /><SelectionCard title="Dependent (mRS > 1)" description="Requires assistance for ADLs prior to stroke." selected={inputs.mrs === 'no'} onClick={() => updateInput('mrs', 'no')} /></div></div>)}{inputs.mrs === 'yes' && (<div ref={el => { fieldRefs.current['age'] = el; }} className="animate-in fade-in slide-in-from-top-2"><h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide mt-6">Age Group</h3><div className="grid grid-cols-3 gap-3"><button onClick={() => updateInput('age', 'under_18')} className={`p-4 rounded-xl border-2 font-bold transition-all ${inputs.age === 'under_18' ? 'border-neuro-500 bg-neuro-50 text-neuro-900' : 'bg-white border-gray-100'}`}>&lt; 18</button><button onClick={() => updateInput('age', '18_79')} className={`p-4 rounded-xl border-2 font-bold transition-all ${inputs.age === '18_79' ? 'border-neuro-500 bg-neuro-50 text-neuro-900' : 'bg-white border-gray-100'}`}>18 - 79</button><button onClick={() => updateInput('age', '80_plus')} className={`p-4 rounded-xl border-2 font-bold transition-all ${inputs.age === '80_plus' ? 'border-neuro-500 bg-neuro-50 text-neuro-900' : 'bg-white border-gray-100'}`}>≥ 80</button></div></div>)}{isTriageFail && (<div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start space-x-3 text-red-800 animate-in zoom-in-95 mt-4"><XCircle className="flex-shrink-0 mt-0.5" size={20} /><div><p className="font-bold">Likely Ineligible</p><p className="text-sm mt-1">{result?.exclusionReason || "Does not meet standard screening criteria."}</p></div></div>)}</div>)}
        
        {/* Step 2: Clinical - UPDATED LATE WINDOW DESCRIPTION */}
        {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div ref={el => { fieldRefs.current['time'] = el; }}>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Time from Last Known Well</h3>
                    <div className="grid grid-cols-1 gap-3">
                        <SelectionCard title="Early Window (0 - 6 Hours)" description="Uses NCCT (ASPECTS) or CTP." selected={inputs.time === '0_6'} onClick={() => updateInput('time', '0_6')} />
                        <SelectionCard title="Late Window (6 - 24 Hours)" description="Perfusion (DAWN/DEFUSE-3) or Large Core (SELECT2/ANGEL-ASPECT)." selected={inputs.time === '6_24'} onClick={() => updateInput('time', '6_24')} />
                    </div>
                </div>
                <div ref={el => { fieldRefs.current['nihss'] = el; }} className="pt-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">NIH Stroke Scale</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <SelectionCard title="0 - 5" description="Mild" selected={inputs.nihss === '0_5'} onClick={() => updateInput('nihss', '0_5')} />
                        <SelectionCard title="6 - 9" description="Moderate" selected={inputs.nihss === '6_9'} onClick={() => updateInput('nihss', '6_9')} />
                        <SelectionCard title="10 - 19" description="Mod-Severe" selected={inputs.nihss === '10_19'} onClick={() => updateInput('nihss', '10_19')} />
                        <SelectionCard title="≥ 20" description="Severe" selected={inputs.nihss === '20_plus'} onClick={() => updateInput('nihss', '20_plus')} />
                    </div>
                </div>
            </div>
        )}

        {/* Step 3: Imaging - TRADEMARKS ADDED & AUTO-CALC RATIO */}
        {step === 3 && (<div className="space-y-6 animate-in slide-in-from-right-4 duration-300">{inputs.time === '0_6' && (<div ref={el => { fieldRefs.current['aspects'] = el; }}><div className="bg-blue-50 p-4 rounded-xl text-blue-900 text-sm mb-6 border border-blue-100"><h4 className="font-bold flex items-center mb-2"><Info size={16} className="mr-2"/> Early Window Imaging</h4><p>Enter ASPECTS score from non-contrast CT.</p></div><label className="block text-sm font-bold text-slate-700 mb-2">ASPECTS Score (0-10)</label><input type="number" min="0" max="10" className="w-full p-4 text-lg bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-neuro-500 outline-none font-bold" placeholder="e.g. 8" value={inputs.aspects} onChange={(e) => updateInput('aspects', e.target.value)} /></div>)}{inputs.time === '6_24' && (<div><div className="bg-purple-50 p-4 rounded-xl text-purple-900 text-sm mb-6 border border-purple-100"><h4 className="font-bold flex items-center mb-2"><Info size={16} className="mr-2"/> Perfusion Imaging Required</h4><p>Enter values from automated software (RAPID™, Viz.ai™, etc).</p></div><div className="space-y-4"><div ref={el => { fieldRefs.current['core'] = el; }}><label className="block text-sm font-bold text-slate-700 mb-2">Ischemic Core Volume (ml)</label><input type="number" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-neuro-500 outline-none font-medium" placeholder="CBF < 30%" value={inputs.core} onChange={(e) => updateInput('core', e.target.value)} /></div><div className="grid grid-cols-2 gap-4"><div ref={el => { fieldRefs.current['mismatchVol'] = el; }}><label className="block text-sm font-bold text-slate-700 mb-2">Mismatch Volume (ml)</label><input type="number" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-neuro-500 outline-none font-medium" placeholder="Volume (ml)" value={inputs.mismatchVol} onChange={(e) => updateInput('mismatchVol', e.target.value)} /></div><div ref={el => { fieldRefs.current['mismatchRatio'] = el; }}><label className="block text-sm font-bold text-slate-700 mb-2">Mismatch Ratio</label><input type="number" step="0.1" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-neuro-500 outline-none font-medium text-slate-600" placeholder="Auto-calc" value={inputs.mismatchRatio} onChange={(e) => updateInput('mismatchRatio', e.target.value)} /></div></div></div></div>)}</div>)}

        {/* Step 4: Decision */}
        {step === 4 && result && (
             <div className="space-y-6 animate-in zoom-in-95 duration-300">
                <div className={`p-8 rounded-3xl relative overflow-hidden shadow-xl text-white ${result.eligible ? 'bg-slate-900' : result.status === 'Consult' ? 'bg-amber-500' : 'bg-red-600'}`}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"><Activity size={12} /><span>Recommendation</span></div>
                        <div className="mb-6"><div className="text-4xl font-black tracking-tight">{result.status}</div>{result.criteriaName && <div className="text-lg font-medium opacity-90 mt-1">{result.criteriaName}</div>}</div>
                        <div className="pt-6 border-t border-white/20">
                             <div className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">Reasoning</div>
                             <div className="text-lg font-bold">{result.reason}</div>
                             {/* AUTO-LINKING APPLIED HERE */}
                             <div className="text-sm opacity-90 mt-1 leading-relaxed">{autoLinkReactNodes(result.details)}</div>
                        </div>
                    </div>
                </div>
                {/* Keep summary card same... */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assessment Summary</h4><ul className="space-y-3 text-sm text-slate-700 font-medium"><li className="flex justify-between border-b border-gray-50 pb-2"><span>Time Window</span><span className="font-bold">{inputs.time === '0_6' ? '0 - 6 Hours' : '6 - 24 Hours'}</span></li><li className="flex justify-between border-b border-gray-50 pb-2"><span>LVO Status</span><span className="font-bold">{inputs.lvo === 'yes' ? 'Confirmed' : 'None'}</span></li><li className="flex justify-between border-b border-gray-50 pb-2"><span>NIHSS</span><span className="font-bold">{inputs.nihss.replace('_', '-').replace('plus', '+')}</span></li>{inputs.time === '0_6' && (<li className="flex justify-between"><span>ASPECTS</span><span className="font-bold">{inputs.aspects || '--'}</span></li>)}{inputs.time === '6_24' && (<><li className="flex justify-between border-b border-gray-50 pb-2"><span>Core Volume</span><span className="font-bold">{inputs.core || '--'} ml</span></li><li className="flex justify-between"><span>Mismatch Ratio</span><span className="font-bold">{inputs.mismatchRatio || '--'}</span></li></>)}</ul></div>
                {/* AUTO-LINKING IN FOOTER */}
                <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-gray-100 text-xs text-slate-500 leading-relaxed"><AlertCircle size={16} className="flex-shrink-0 mt-0.5" /><div><strong>Decision Support Only.</strong><p className="mt-1">{autoLinkReactNodes("Based on AHA/ASA Guidelines and major trials (DAWN, DEFUSE-3, SELECT2). Always verify clinical details.")}</p></div></div>
             </div>
        )}
      </div>

      <div id="evt-action-bar" className="mt-8 pt-4 border-t border-gray-100 scroll-mt-4">
         <div className="flex items-center justify-between gap-4">
             <button onClick={handleBack} disabled={step === 1} className={`px-6 py-3 border border-gray-200 rounded-xl font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'bg-white text-slate-600 hover:bg-slate-50 hover:border-gray-300'}`}>Back</button>
             {step === 4 && (<button onClick={handleReset} className="hidden md:flex items-center text-slate-500 hover:text-neuro-600 font-bold px-4 py-2 rounded-lg transition-colors"><RotateCcw size={16} className="mr-2" /> Start Over</button>)}
             {step < 4 ? (<button onClick={handleNext} className="px-8 py-3 bg-neuro-600 text-white rounded-xl font-bold hover:bg-neuro-700 shadow-lg shadow-neuro-200 transition-all flex items-center transform active:scale-95">Next <ChevronRight size={16} className="ml-2" /></button>) : (<button onClick={copySummary} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg transition-all flex items-center transform active:scale-95"><Copy size={16} className="mr-2" /> Copy to EMR</button>)}
         </div>
         {step === 4 && (<div className="md:hidden mt-4 text-center"><button onClick={handleReset} className="text-sm text-slate-400 font-bold flex items-center justify-center w-full p-2 hover:bg-slate-50 rounded-lg transition-colors"><RotateCcw size={14} className="mr-2" /> Start Over</button></div>)}
      </div>

      {step === 4 && (
          <div className="mt-12 border-t border-gray-100 pt-8 pb-8">
              <h3 className="text-sm font-bold text-slate-900 mb-4">References</h3>
              <ul className="space-y-3 text-xs text-slate-500">
                  <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">1</span>{autoLinkReactNodes("DAWN & DEFUSE 3 Trials (2018): Extended window thrombectomy.")}</li>
                  <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">2</span>{autoLinkReactNodes("SELECT2 & ANGEL-ASPECT (2023): Large core thrombectomy.")}</li>
              </ul>
          </div>
      )}
    </div>
  );
};

export default EvtPathway;
