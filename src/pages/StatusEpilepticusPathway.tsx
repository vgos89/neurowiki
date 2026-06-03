
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, Activity, AlertTriangle, Syringe } from 'lucide-react';
import { PathwayHeader } from '../components/pathways/PathwayHeader';
import { SE_CONTENT } from '../data/toolContent';
import { autoLinkReactNodes } from '../internalLinks/autoLink';
import { useFavorites } from '../hooks/useFavorites';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { PathwayRailStep } from '../components/pathways/PathwayRail';
import { PathwayCategoryRow, type CategoryOption } from '../components/pathways/PathwayCategoryRow';
import { PathwayBranchChip } from '../components/pathways/PathwayBranchChip';
import { PathwayLearningPearl } from '../components/pathways/PathwayLearningPearl';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useRecents } from '../hooks/useRecents';
import DiscreteFAQ from '../components/seo/DiscreteFAQ';
import { getFAQsForPath } from '../seo/schema';

// --- Types & Logic ---
type Agent = "levetiracetam" | "fosphenytoin" | "valproate" | "lacosamide" | "phenobarbital";
// PatientData.convulsive removed per CLIN-2 / Architect NCSE-1 — this pathway covers
// convulsive SE only; non-convulsive SE is routed out to the cEEG-guided NCSE workup.
type GlucoseStatus = 'unchecked' | 'checked' | 'hypoTreated';
interface PatientData { weight: number; ivAccess: boolean; glucoseStatus: GlucoseStatus; }
// Cardiac flag split (CLIN-2): cardiacAvBlock → AVOID phenytoin/fosphenytoin/lacosamide;
// cardiacElderly → slower infusion only (no absolute contraindication).
interface Comorbidities { hypotension: boolean; respiratory: boolean; cardiacAvBlock: boolean; cardiacElderly: boolean; liver: boolean; pancreatitis: boolean; pregnancy: boolean; renal: boolean; carbapenem: boolean; }
interface Step3Checklist { benzoAdequate: boolean; stage2Adequate: boolean; glucoseTreated: boolean; eegConsidered: boolean; }
interface RenalState { crcl: string; dialysis: 'no' | 'yes' | 'unknown'; levForm: 'ir' | 'keppra_xr' | 'elepsia_xr'; lcmForm: 'vimpat' | 'motpoly_xr'; }

// RAMPART fixed-dose IM midazolam (Silbergleit 2012, PMID 22335736).
// "Intramuscular midazolam in a fixed dose of 10 mg (>40 kg) or 5 mg (13–40 kg)
// was at least as effective as intravenous lorazepam" — RAMPART.
const calculateBzdFixedDose = (agent: string, weight: number, route: 'IV' | 'IM' = 'IV'): string => {
  if (weight <= 0) return "Enter weight";
  if (agent === "midazolam") {
    if (route === 'IM') {
      if (weight < 13) return "Consult pediatrics (RAMPART fixed-dose IM not validated <13 kg)";
      if (weight >= 13 && weight <= 40) return "5 mg IM fixed (RAMPART, 13–40 kg)";
      return "10 mg IM fixed (RAMPART, >40 kg)";
    }
    // IV — weight-based per AES 2016
    return `${Math.min(10, Math.round(0.2 * weight * 10) / 10)} mg IV (0.2 mg/kg, max 10 mg)`;
  }
  return "-";
};

const calculateDose = (agent: string, weight: number): string => {
  if (weight <= 0) return "Enter weight";
  switch(agent) {
    case "lorazepam": return `${Math.min(4, Math.round(0.1 * weight * 10) / 10)} mg IV (0.1 mg/kg, max 4mg)`;
    // Default midazolam display covers both routes — RAMPART fixed IM scheme via calculateBzdFixedDose
    case "midazolam": return `${Math.min(10, Math.round(0.2 * weight * 10) / 10)} mg IV (0.2 mg/kg, max 10mg) — or IM fixed 10 mg (>40 kg) / 5 mg (13–40 kg) per RAMPART`;
    case "diazepam": return `${Math.min(10, Math.round(0.15 * weight * 10) / 10)} mg IV (0.15 mg/kg, max 10mg)`;
    case "levetiracetam": return `${Math.min(4500, Math.round(60 * weight))} mg IV (60 mg/kg, max 4500mg)`;
    case "fosphenytoin": return `${Math.min(1500, Math.round(20 * weight))} mg PE IV (20 mg PE/kg, max 1500mg PE)`;
    case "valproate": return `${Math.min(3000, Math.round(40 * weight))} mg IV (40 mg/kg, max 3000mg)`;
    // Lacosamide cap = 400 mg per FDA label (Vossler 2025). Use as Stage 3 add-on only, NOT Stage 2.
    case "lacosamide": return `${Math.min(400, Math.round(8 * weight))} mg IV (8 mg/kg, max 400mg per FDA label)`;
    // Phenobarbital 15 mg/kg per Vossler 2025 (was 20 mg/kg).
    case "phenobarbital": return `${Math.round(15 * weight)} mg IV (15 mg/kg, rate <60mg/min)`;
    case "midazolam_inf": return `Load: ${Math.round(0.2 * weight * 10)/10} mg (0.2 mg/kg)`;
    case "propofol_inf": return `Load: ${Math.round(1 * weight)} - ${Math.round(2 * weight)} mg (1-2 mg/kg)`;
    // Ketamine load 1–2.5 mg/kg per Vossler 2025 Table 5-3 (was 1.5–4.5 mg/kg).
    case "ketamine_inf": return `Load: ${Math.round(1 * weight)} - ${Math.round(2.5 * weight)} mg (1-2.5 mg/kg)`;
    case "pentobarb_inf": return `Load: ${Math.round(5 * weight)} - ${Math.round(15 * weight)} mg (5-15 mg/kg)`;
    default: return "-";
  }
};

const StatusEpilepticusPathway: React.FC = () => {
  const { recordView } = useRecents();
  useEffect(() => {
    recordView({
      type: 'pathway',
      id: 'se-pathway',
      title: 'SE Pathway',
      subtitle: 'Stage 1–3 status epilepticus management',
      category: 'status-epilepticus',
      trail: '4 steps',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [activeSection, setActiveSection] = useState<number>(0);
  const step = activeSection + 1;
  const { handleBack, getBackLabel } = useNavigationSource();
  const [patient, setPatient] = useState<PatientData>({ weight: 0, ivAccess: true, glucoseStatus: 'unchecked' });
  const [stage1Agent, setStage1Agent] = useState<"lorazepam" | "diazepam" | "midazolam" | null>(null);
  const [stage1FirstDoseGiven, setStage1FirstDoseGiven] = useState(false);
  const [stage1SecondDoseGiven, setStage1SecondDoseGiven] = useState(false);
  const [stage1Success, setStage1Success] = useState<boolean | null>(null); 
  const [comorbidities, setComorbidities] = useState<Comorbidities>({ hypotension: false, respiratory: false, cardiacAvBlock: false, cardiacElderly: false, liver: false, pancreatitis: false, pregnancy: false, renal: false, carbapenem: false });
  const [renalState, setRenalState] = useState<RenalState>({ crcl: '', dialysis: 'no', levForm: 'ir', lcmForm: 'vimpat' });
  const [stage2Agent, setStage2Agent] = useState<Agent | "auto">("auto");
  const [stage2Success, setStage2Success] = useState<boolean | null>(null);
  const [stage2ActualAgent, setStage2ActualAgent] = useState<Agent | null>(null);
  const [step3Checklist, setStep3Checklist] = useState<Step3Checklist>({ benzoAdequate: false, stage2Adequate: false, glucoseTreated: false, eegConsidered: false });
  const [stage3Agent, setStage3Agent] = useState<string | null>(null); 
  
  const topRef = useRef<HTMLDivElement>(null);
  const stage1DoseRef = useRef<HTMLDivElement>(null);
  const stage2DoseRef = useRef<HTMLDivElement>(null);
  const stage3DoseRef = useRef<HTMLDivElement>(null);

  // Analytics
  const { trackResult } = useCalculatorAnalytics('status_epilepticus');

  // Favorites
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showFavToast, setShowFavToast] = useState(false);
  const [copyConfirm, setCopyConfirm] = useState(false);
  const isFav = isFavorite('se-pathway');

  const handleFavToggle = () => {
      const newVal = toggleFavorite('se-pathway');
      setShowFavToast(true);
      setTimeout(() => setShowFavToast(false), 2000);
  };

  // Track when user reaches stage 3 (refractory management)
  useEffect(() => {
    if (step === 3 && stage3Agent) {
      trackResult(stage3Agent);
    }
  }, [step, stage3Agent, trackResult]);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { if (step > 1 && topRef.current) setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }, [step]);

  // ESETT (Kapur 2019, NEJM) showed levetiracetam, fosphenytoin, and valproate are equivalent
  // for benzodiazepine-refractory status epilepticus. This function returns ALL THREE Tier-1
  // agents with per-comorbidity status flags rather than a hierarchical pick. Lacosamide is
  // NOT a Stage 2 agent — it belongs as a Stage 3 add-on per AES 2016 / Vossler 2025.
  type AgentStatus = 'preferred' | 'caution' | 'avoid';
  interface AgentOption { agent: Agent; status: AgentStatus; note?: string; }
  const getEsettOptions = (): { options: AgentOption[]; defaultAgent: Agent; warnings: string[]; pearl: string } => {
    const warnings: string[] = [];
    const pearl = "ESETT (Kapur 2019, NEJM): levetiracetam, fosphenytoin, and valproate are equivalent for benzodiazepine-refractory status epilepticus.";
    const avoidValproate = comorbidities.liver || comorbidities.pancreatitis || comorbidities.pregnancy || comorbidities.carbapenem;
    const avoidPhenytoin = comorbidities.cardiacAvBlock; // 2°/3° AV block — AVOID, not caution
    const cautionPhenytoin = comorbidities.hypotension || comorbidities.cardiacElderly;
    const cautionLevetiracetam = comorbidities.renal;
    if (comorbidities.pregnancy) warnings.push("Pregnancy: Valproate avoided (teratogenic — neural tube defects, cognitive risk).");
    if (comorbidities.liver) warnings.push("Liver disease: Valproate avoided (hepatotoxicity, hyperammonemia).");
    if (comorbidities.pancreatitis) warnings.push("Pancreatitis history: Valproate avoided.");
    if (comorbidities.carbapenem) warnings.push("Carbapenem co-administration: Lowers valproate levels — avoid combination.");
    if (comorbidities.cardiacAvBlock) warnings.push("2°/3° AV block without pacemaker: AVOID phenytoin, fosphenytoin, lacosamide (Vossler 2025: lacosamide is contraindicated in patients with second- or third-degree AV block without pacemaker).");
    if (comorbidities.cardiacElderly) warnings.push("Elderly without conduction disease: Use slower fosphenytoin infusion rate (≤100 mg PE/min).");
    if (comorbidities.hypotension) warnings.push("Hypotension: Caution with phenytoin/fosphenytoin (slower infusion); avoid phenobarbital.");
    if (comorbidities.renal) warnings.push("Renal impairment: Levetiracetam maintenance dose reduction required.");

    const lev: AgentOption = { agent: "levetiracetam", status: cautionLevetiracetam ? 'caution' : 'preferred', note: cautionLevetiracetam ? "Adjust maintenance for CrCl" : undefined };
    const fos: AgentOption = { agent: "fosphenytoin", status: avoidPhenytoin ? 'avoid' : (cautionPhenytoin ? 'caution' : 'preferred'), note: avoidPhenytoin ? "AVOID: 2°/3° AV block" : (cautionPhenytoin ? "Slower infusion rate" : undefined) };
    const vpa: AgentOption = { agent: "valproate", status: avoidValproate ? 'avoid' : 'preferred', note: avoidValproate ? "AVOID: liver/pregnancy/pancreatitis/carbapenem" : undefined };
    const options: AgentOption[] = [lev, fos, vpa];

    // Default = first 'preferred' agent; if none preferred, first 'caution'; else lev as fallback.
    const preferred = options.find(o => o.status === 'preferred');
    const cautionFallback = options.find(o => o.status === 'caution');
    const defaultAgent: Agent = (preferred?.agent ?? cautionFallback?.agent ?? "levetiracetam");
    return { options, defaultAgent, warnings, pearl };
  };

  const esett = getEsettOptions();
  const stage2Recommendation = { agent: esett.defaultAgent, reason: "ESETT-equivalent (lev/fos/VPA)", warnings: esett.warnings };
  const finalStage2 = stage2Agent === "auto" ? stage2Recommendation.agent : stage2Agent;
  
  const handleReset = () => { 
      setActiveSection(0); 
      setPatient({ weight: 0, ivAccess: true, glucoseStatus: 'unchecked' });
      setStage1Agent(null); 
      setStage1FirstDoseGiven(false); 
      setStage1SecondDoseGiven(false); 
      setStage1Success(null); 
      setComorbidities({ hypotension: false, respiratory: false, cardiacAvBlock: false, cardiacElderly: false, liver: false, pancreatitis: false, pregnancy: false, renal: false, carbapenem: false });
      setStage2Agent("auto"); 
      setStage2Success(null); 
      setStage2ActualAgent(null); 
      setStep3Checklist({ benzoAdequate: false, stage2Adequate: false, glucoseTreated: false, eegConsidered: false }); 
      setStage3Agent(null);
  };

  const generateEMRText = () => { 
    const parts = []; 
    if (stage1Agent) { 
      let s1Text = `Stage 1: ${stage1Agent} ${calculateDose(stage1Agent, patient.weight)}`; 
      if (stage1SecondDoseGiven) s1Text += " x2 doses"; 
      if (stage1Success === true) s1Text += " (Responsive)"; 
      else if (stage1Success === false) s1Text += " (Refractory)"; 
      parts.push(s1Text); 
    } 
    if (stage1Success === false && step >= 3) { 
      let s2Text = `Stage 2: ${stage2ActualAgent || finalStage2} ${calculateDose(stage2ActualAgent || finalStage2, patient.weight)}`;
      if (stage2Success === true) s2Text += " (Responsive)";
      else if (stage2Success === false) s2Text += " (Refractory)";
      parts.push(s2Text);
    }
    if (stage2Success === false && step >= 4) {
        parts.push(`Stage 3: Refractory Management Initiated`);
        if (stage3Agent) parts.push(`Infusion Selected: ${stage3Agent} ${calculateDose(stage3Agent, patient.weight)}`);
    }
    return `Status Epilepticus — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\nWeight: ${patient.weight} kg\n\n${parts.join('\n\n')}`;
  };

  const copySummary = useCallback(() => {
    navigator.clipboard.writeText(generateEMRText());
    setCopyConfirm(true);
    setTimeout(() => setCopyConfirm(false), 2000);
  }, [generateEMRText]);

  const STEPS = [{id:1, title:"Patient"}, {id:2, title:"BZD"}, {id:3, title:"Urgent"}, {id:4, title:"Refractory"}];

  // Section completion helpers
  const isSection0Complete = patient.weight > 0;
  const isSection1Complete = isSection0Complete && stage1Agent !== null && stage1Success !== null;
  // Step 3 (Urgent Control) is complete once the user has picked an outcome (stopped or refractory).
  // stage2Agent defaults to "auto" so we check stage2Success !== null to mean "acted on".
  const isSection2Complete = isSection1Complete && stage1Success === false && stage2Success !== null;
  const isSection3Complete = isSection2Complete && stage2Success === false && stage3Agent !== null;

  // Summary chips per step
  const getSummary = (idx: number): string | undefined => {
    if (idx === 0) return patient.weight > 0 ? `Weight: ${patient.weight} kg · ${patient.ivAccess ? 'IV access' : 'No IV'}` : undefined;
    if (idx === 1) return stage1Agent ? `${stage1Agent}${stage1Success === true ? ' · Stopped' : stage1Success === false ? ' · Refractory' : ''}` : undefined;
    if (idx === 2) return stage2ActualAgent ? `${stage2ActualAgent} · ${stage2Success === true ? 'Stopped' : stage2Success === false ? 'Refractory' : 'Pending'}` : undefined;
    if (idx === 3) return stage3Agent ? `Infusion: ${stage3Agent}` : undefined;
    return undefined;
  };

  // Auto scroll effects
  useEffect(() => {
      if (stage1Agent && stage1DoseRef.current) {
          setTimeout(() => stage1DoseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
      }
  }, [stage1Agent]);

  useEffect(() => {
      if (step === 3 && stage2DoseRef.current) {
          setTimeout(() => stage2DoseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
      }
  }, [step]);

  useEffect(() => {
      if (stage3Agent && stage3DoseRef.current) {
          setTimeout(() => stage3DoseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
      }
  }, [stage3Agent]);

  // BZD agent options for PathwayCategoryRow
  const bzdOptions: CategoryOption[] = [
    { value: 'lorazepam', label: 'Lorazepam', description: '0.1 mg/kg IV (max 4 mg) — preferred IV agent' },
    { value: 'midazolam', label: 'Midazolam', description: patient.ivAccess ? '0.2 mg/kg IV (max 10 mg)' : 'IM fixed dose per RAMPART — preferred without IV access' },
    { value: 'diazepam', label: 'Diazepam', description: '0.15 mg/kg IV (max 10 mg)' },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 md:pb-20">
      {/* Sticky compact header — PathwayHeader primitive (PATHWAY_SPEC §2 anatomy) */}
      <PathwayHeader
        pathwayLabel="SE Pathway"
        onBack={handleBack}
        isFav={isFav}
        onFavToggle={handleFavToggle}
        onReset={handleReset}
        onCopy={copySummary}
        copyConfirm={copyConfirm}
        shareText={generateEMRText}
        shareTitle="Status Epilepticus Pathway"
        onShareResult={(r) => {
          if (r === 'shared') { setCopyConfirm(true); setTimeout(() => setCopyConfirm(false), 2000); }
          else if (r === 'copied') { setCopyConfirm(true); setTimeout(() => setCopyConfirm(false), 2000); }
        }}
      />

      <div ref={topRef} className="space-y-0 min-h-[300px] px-1 pt-4">

        {/* ── Step 1: Patient / Stabilization ───────────────────────────── */}
        <PathwayRailStep
          stepNumber={1}
          title="PATIENT"
          iconKey="triage"
          nodeState={isSection0Complete ? 'completed' : activeSection === 0 ? 'active' : 'locked'}
          segmentAboveTraversed={false}
          lockedAriaLabel="Step 1 Patient, locked"
        >
          {isSection0Complete && activeSection !== 0 && getSummary(0) && (
            <div className="mb-3">
              <PathwayBranchChip
                targetFieldId="field-weight"
                label={getSummary(0)!}
                onClick={() => setActiveSection(0)}
              />
            </div>
          )}

          {(activeSection === 0 || !isSection0Complete) && (
            <div className="space-y-1 bg-white border border-slate-100 rounded-xl p-4">
              {/* Weight input */}
              <div id="field-weight" className="pb-3 border-b border-slate-100">
                <label htmlFor="patient-weight" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Patient Weight (kg)</label>
                <div className="flex items-center gap-3">
                  <input
                    id="patient-weight"
                    type="number"
                    inputMode="decimal"
                    className="w-32 p-3 text-lg bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-neuro-500 outline-none font-bold"
                    value={patient.weight || ''}
                    onChange={e => setPatient({...patient, weight: parseFloat(e.target.value)})}
                    placeholder="kg"
                    min="0"
                  />
                  <span className="text-sm text-slate-400">Used for all dose calculations</span>
                </div>
              </div>

              {/* IV Access toggle */}
              <PathwayCategoryRow
                label="IV Access"
                options={[
                  { value: 'yes', label: 'IV Access Established', description: 'Enables IV benzodiazepines' },
                  { value: 'no', label: 'No IV Access', description: 'Use IM midazolam (RAMPART fixed dose)' },
                ] as CategoryOption[]}
                value={patient.ivAccess ? 'yes' : 'no'}
                onChange={(v) => setPatient({...patient, ivAccess: v === 'yes'})}
                stepCompleted={isSection0Complete && activeSection !== 0}
              />

              {/* Glucose check — §4.2 tri-button group */}
              <div className="pt-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Fingerstick Glucose</label>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Glucose check status">
                  {([
                    { v: 'unchecked', label: 'Not Checked' },
                    { v: 'checked', label: 'Checked' },
                    { v: 'hypoTreated', label: 'Hypoglycemia Treated' },
                  ] as { v: GlucoseStatus; label: string }[]).map(opt => {
                    const selected = patient.glucoseStatus === opt.v;
                    return (
                      <button
                        key={opt.v}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setPatient({...patient, glucoseStatus: opt.v})}
                        className={`min-h-[44px] px-3 py-2 rounded-full text-sm font-medium border transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none active:scale-[0.98] transform-gpu ${
                          selected
                            ? 'bg-neuro-50 border-neuro-500 text-neuro-700 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stabilization pearls */}
              <div className="pt-2 border-t border-slate-100 space-y-1 mt-2">
                <PathwayLearningPearl
                  title="Stabilization adjuncts (0–5 min)"
                  content={
                    <ul className="space-y-1.5">
                      <li>• <strong>Thiamine 100 mg IV</strong> if alcohol use disorder or malnutrition suspected — give before glucose.</li>
                      <li>• <strong>Pyridoxine 50–100 mg IV</strong> if isoniazid (INH) overdose or pediatric idiopathic SE suspected.</li>
                      <li>• <strong>Pregnancy + active seizure: consider eclampsia → magnesium 4 g IV over 5–10 min, then 1 g/h</strong> (NOT benzo first). Benzodiazepine escalation is NOT first-line for eclamptic seizures (Mullhi 2025).</li>
                    </ul>
                  }
                />
                <PathwayLearningPearl
                  title="Convulsive SE only — NCSE route-out"
                  content="NCSE without coma is an active condition but does not mandate ICU-level care or anesthetic infusion (Vossler 2025). Route to cEEG-guided NCSE workup rather than continuing this convulsive-SE pathway."
                />
              </div>

              {patient.weight > 0 && (
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setActiveSection(1)}
                    className="px-4 py-2 bg-neuro-500 hover:bg-neuro-600 text-white rounded-full text-sm font-medium transition-colors min-h-[44px] inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none active:scale-[0.98] transform-gpu touch-manipulation"
                  >
                    Proceed to BZD Stage
                  </button>
                </div>
              )}
            </div>
          )}
        </PathwayRailStep>

        {/* ── Step 2: Benzodiazepines ────────────────────────────────────── */}
        <PathwayRailStep
          stepNumber={2}
          title="BENZODIAZEPINES"
          iconKey="clinical"
          nodeState={isSection1Complete ? 'completed' : activeSection === 1 ? 'active' : 'locked'}
          segmentAboveTraversed={isSection0Complete}
          lockedAriaLabel="Step 2 Benzodiazepines, locked — awaiting Step 1"
        >
          {isSection1Complete && activeSection !== 1 && getSummary(1) && (
            <div className="mb-3">
              <PathwayBranchChip
                targetFieldId="field-bzd-agent"
                label={getSummary(1)!}
                onClick={() => setActiveSection(1)}
              />
            </div>
          )}

          {(activeSection === 1 || (!isSection1Complete && isSection0Complete)) && (
            <div className="space-y-1 bg-white border border-slate-100 rounded-xl p-4">
              {/* Context notice */}
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span><strong>Initial Therapy / BZD (5–20 min).</strong> Underdosing is the most common cause of BZD failure (Glauser 2016). Repeat dose if seizure persists 5 min after first dose.</span>
                </div>
              </div>

              {/* BZD agent selection */}
              <div id="field-bzd-agent">
                <PathwayCategoryRow
                  label="First-line BZD Agent"
                  options={bzdOptions}
                  value={stage1Agent}
                  onChange={(v) => setStage1Agent(v as "lorazepam" | "diazepam" | "midazolam")}
                  stepCompleted={isSection1Complete && activeSection !== 1}
                  defaultOpen={stage1Agent === null}
                />
              </div>

              {stage1Agent && (
                <div ref={stage1DoseRef} className="border-t border-b border-slate-200 px-5 py-3 -mx-5 my-2">{/* Dose Result Row — PATHWAY_SPEC §4.8 */}
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calculated Dose</div>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <span className="text-sm text-slate-600">{stage1Agent.charAt(0).toUpperCase()}{stage1Agent.slice(1)}</span>
                    <span className="text-base font-mono font-semibold text-slate-900">
                      {stage1Agent === 'midazolam' && !patient.ivAccess
                        ? calculateBzdFixedDose('midazolam', patient.weight, 'IM')
                        : calculateDose(stage1Agent, patient.weight)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Computed from {patient.weight} kg patient</div>
                  {stage1Agent === 'midazolam' && !patient.ivAccess && (
                    <p className="text-xs text-slate-600 italic mt-1">
                      RAMPART (Silbergleit 2012, PMID 22335736): Intramuscular midazolam in a fixed dose of 10 mg (&gt;40 kg) or 5 mg (13–40 kg) was at least as effective as intravenous lorazepam.
                    </p>
                  )}
                </div>
              )}

              {/* Dose given / seizure status flow */}
              {stage1Agent && (
                <div className="pt-1">
                  {!stage1FirstDoseGiven ? (
                    <button
                      onClick={() => setStage1FirstDoseGiven(true)}
                      className="px-4 py-2 bg-neuro-500 hover:bg-neuro-600 text-white rounded-full text-sm font-medium transition-colors min-h-[44px] inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none active:scale-[0.98] transform-gpu touch-manipulation"
                    >
                      Mark First Dose Given
                    </button>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold">
                        <Check size={16} /> First dose administered
                      </div>
                      {!stage1SecondDoseGiven && stage1Success === null && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Seizure status after first dose?</div>
                          {/* Outcome Row — PATHWAY_SPEC §4.7 */}
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <button
                              type="button"
                              onClick={() => setStage1Success(true)}
                              className="min-h-[60px] rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none active:scale-[0.98] transform-gpu touch-manipulation transition-colors"
                            >
                              Stopped
                            </button>
                            <button
                              type="button"
                              onClick={() => setStage1SecondDoseGiven(true)}
                              className="min-h-[60px] rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-sm hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none active:scale-[0.98] transform-gpu touch-manipulation transition-colors"
                            >
                              Persists — Repeat Dose
                            </button>
                          </div>
                        </div>
                      )}
                      {stage1SecondDoseGiven && stage1Success === null && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 animate-in fade-in">
                          <div className="flex items-center gap-2 text-sm text-slate-700 font-semibold mb-2">
                            <Syringe size={15} /> Second dose administered
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Seizure status after second dose?</div>
                          {/* Outcome Row — PATHWAY_SPEC §4.7 */}
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <button
                              type="button"
                              onClick={() => setStage1Success(true)}
                              className="min-h-[60px] rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none active:scale-[0.98] transform-gpu touch-manipulation transition-colors"
                            >
                              Stopped
                            </button>
                            <button
                              type="button"
                              onClick={() => { setStage1Success(false); setActiveSection(2); }}
                              className="min-h-[60px] rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-sm hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none active:scale-[0.98] transform-gpu touch-manipulation transition-colors"
                            >
                              Persists — Refractory
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {stage1Success === true && (
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl text-center animate-in zoom-in-95 mt-2">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2"><Check size={20} /></div>
                  <h3 className="text-base font-bold text-emerald-900">Seizure Controlled</h3>
                  <p className="text-sm text-emerald-700 mb-3">Monitor ABCs. Consider maintenance ASM therapy.</p>
                  <button onClick={copySummary} className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-sm active:scale-95 transform-gpu min-h-[44px] touch-manipulation text-sm focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">Copy Summary</button>
                </div>
              )}

              {/* BZD pearls */}
              {stage1Agent && (
                <div className="pt-2 border-t border-slate-100 space-y-1 mt-2">
                  <PathwayLearningPearl
                    title="RAMPART — IM midazolam"
                    content="Intramuscular midazolam in a fixed dose of 10 mg (>40 kg) or 5 mg (13–40 kg) was at least as effective as intravenous lorazepam (Silbergleit 2012, PMID 22335736). IM route is preferred when IV access is not yet established."
                  />
                </div>
              )}
            </div>
          )}
        </PathwayRailStep>

        {/* ── Step 3: Urgent Control (Established SE) ───────────────────── */}
        <PathwayRailStep
          stepNumber={3}
          title="URGENT CONTROL"
          iconKey="imaging"
          nodeState={isSection2Complete ? 'completed' : activeSection === 2 ? 'active' : 'locked'}
          segmentAboveTraversed={isSection1Complete}
          lockedAriaLabel="Step 3 Urgent Control, locked — awaiting BZD stage"
        >
          {isSection2Complete && activeSection !== 2 && getSummary(2) && (
            <div className="mb-3">
              <PathwayBranchChip
                targetFieldId="field-stage2-agent"
                label={getSummary(2)!}
                onClick={() => setActiveSection(2)}
              />
            </div>
          )}

          {(activeSection === 2 || (!isSection2Complete && isSection1Complete && stage1Success === false)) && (
            <div className="space-y-1 bg-white border border-slate-100 rounded-xl p-4">
              {/* Context notice */}
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span><strong>Established SE (20–40 min).</strong> Seizure persisting despite adequate BZD therapy (Glauser 2016). Risk of neuronal injury rises with duration.</span>
                </div>
              </div>

              {/* ESETT equivalence pearl — CLIN-2 verbatim phrase preserved */}
              <div className="py-1">
                <PathwayLearningPearl
                  title="ESETT equivalence (Kapur 2019, NEJM)"
                  content={
                    <>
                      <p>{esett.pearl}</p>
                      <p className="mt-2 text-xs italic text-slate-500">Lacosamide is NOT a Stage 2 ESETT-equivalent option — reserve for Stage 3 add-on per AES 2016 / Vossler 2025.</p>
                    </>
                  }
                  visible={true}
                />
              </div>

              {/* Comorbidities */}
              <div className="pt-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Comorbidities — affects drug choice</div>
                <div className="flex flex-wrap gap-1.5">
                  {([
                    { key: 'hypotension', label: 'Hypotension' },
                    { key: 'respiratory', label: 'Respiratory' },
                    { key: 'cardiacAvBlock', label: 'AV Block (2°/3°)' },
                    { key: 'cardiacElderly', label: 'Elderly (no block)' },
                    { key: 'liver', label: 'Liver' },
                    { key: 'pancreatitis', label: 'Pancreatitis' },
                    { key: 'pregnancy', label: 'Pregnancy' },
                    { key: 'renal', label: 'Renal' },
                    { key: 'carbapenem', label: 'Carbapenem' },
                  ] as { key: keyof Comorbidities; label: string }[]).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setComorbidities({...comorbidities, [key]: !comorbidities[key]})}
                      className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-colors duration-150 active:scale-[0.98] transform-gpu touch-manipulation min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${comorbidities[key] ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warnings from ESETT logic */}
              {stage2Recommendation.warnings.length > 0 && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 mt-1">
                  <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    {stage2Recommendation.warnings.map((w, i) => <div key={i} className="text-xs text-amber-800">{w}</div>)}
                  </div>
                </div>
              )}

              {/* ESETT agent selection — label shortened per D-7; "(ESETT-equivalent)" qualifier lives in option descriptions */}
              <div id="field-stage2-agent" ref={stage2DoseRef}>
                {/* Dose Result Row — PATHWAY_SPEC §4.8 — placed above agent row (D-6 fix).
                    aria-live region (added 2026-05-23) so screen readers announce
                    the computed agent + dose when inputs update. role=status keeps
                    the announcement polite (does not interrupt). */}
                <div
                  className="border-t border-b border-slate-200 px-5 py-3 -mx-5 my-2"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calculated Dose</div>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <span className="text-sm text-slate-600">{finalStage2.charAt(0).toUpperCase()}{finalStage2.slice(1)}</span>
                    <span className="text-base font-mono font-semibold text-slate-900">{calculateDose(finalStage2, patient.weight)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Computed from {patient.weight} kg patient</div>
                </div>
                <PathwayCategoryRow
                  label="Stage 2 Agent"
                  options={esett.options.map(opt => ({
                    value: opt.agent,
                    label: `${opt.agent.charAt(0).toUpperCase()}${opt.agent.slice(1)}${opt.status === 'avoid' ? ' — AVOID' : opt.status === 'caution' ? ' — Caution' : ''}`,
                    description: opt.note ?? (opt.status === 'preferred' ? 'ESETT-equivalent (lev/fos/VPA)' : undefined),
                  }) as CategoryOption)}
                  value={stage2Agent === 'auto' ? esett.defaultAgent : stage2Agent}
                  onChange={(v) => setStage2Agent(v as Agent | 'auto')}
                  stepCompleted={isSection2Complete && activeSection !== 2}
                />
              </div>

              {/* Outcome Row — PATHWAY_SPEC §4.7 */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStage1Success(true)}
                  className="min-h-[60px] rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none active:scale-[0.98] transform-gpu touch-manipulation transition-colors"
                >
                  Seizure Stopped
                </button>
                <button
                  type="button"
                  onClick={() => { setStage2Success(false); setStage2ActualAgent(finalStage2); setActiveSection(3); }}
                  className="min-h-[60px] rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-sm hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none active:scale-[0.98] transform-gpu touch-manipulation transition-colors"
                >
                  Persists — Refractory
                </button>
              </div>

              {/* Lacosamide safety pearl */}
              <div className="pt-2 border-t border-slate-100 space-y-1 mt-2">
                <PathwayLearningPearl
                  title="Lacosamide contraindication"
                  content="lacosamide is contraindicated in patients with second- or third-degree AV block without pacemaker (Vossler 2025). Lacosamide is NOT a Stage 2 option — reserve as Stage 3 add-on. Obtain ECG before loading."
                />
              </div>
            </div>
          )}
        </PathwayRailStep>

        {/* ── Step 4: Refractory SE ──────────────────────────────────────── */}
        <PathwayRailStep
          stepNumber={4}
          title="REFRACTORY"
          iconKey="decision"
          nodeState={isSection3Complete ? 'completed' : activeSection === 3 ? 'active' : 'locked'}
          segmentAboveTraversed={isSection2Complete}
          lockedAriaLabel="Step 4 Refractory, locked — awaiting Stage 2"
        >
          {isSection3Complete && activeSection !== 3 && getSummary(3) && (
            <div className="mb-3">
              <PathwayBranchChip
                targetFieldId="field-stage3-agent"
                label={getSummary(3)!}
                onClick={() => setActiveSection(3)}
              />
            </div>
          )}

          {(activeSection === 3 || (!isSection3Complete && isSection2Complete && stage2Success === false)) && (
            <div className="space-y-1 bg-white border border-slate-100 rounded-xl p-4">
              {/* Context notice */}
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-start gap-2 text-sm text-slate-700 bg-slate-900 text-white rounded-lg px-4 py-3">
                  <Activity size={15} className="shrink-0 mt-0.5 opacity-70" />
                  <span><strong>Refractory SE — Stage 3</strong> (40+ min from onset OR 1 BZD + 1 non-BZD ASM failure, per Glauser 2016). Intubation and continuous EEG required.</span>
                </div>
              </div>

              {/* NORSE/FIRES pearl */}
              <div className="py-1">
                <PathwayLearningPearl
                  title="NORSE / FIRES consideration"
                  content="If new-onset RSE without obvious cause, consider NORSE/FIRES. Expert consensus supports empiric immunotherapy within 72 hours and an autoimmune/paraneoplastic workup in parallel with anesthetic management."
                />
              </div>

              {/* Continuous infusion selection */}
              <div id="field-stage3-agent" ref={stage3DoseRef}>
                <PathwayCategoryRow
                  label="Continuous Infusion"
                  options={[
                    { value: 'midazolam_inf', label: 'Midazolam Infusion', description: 'Load 0.2 mg/kg · Maint 0.1–2 mg/kg/hr' },
                    { value: 'propofol_inf', label: 'Propofol Infusion', description: 'Load 1–2 mg/kg · Maint 20–200 mcg/kg/min · Caution PRIS' },
                    { value: 'ketamine_inf', label: 'Ketamine Infusion', description: 'Load 1–2.5 mg/kg (Vossler 2025) · Maint 1–10 mg/kg/hr · Hemodynamically stable' },
                  ] as CategoryOption[]}
                  value={stage3Agent && ['midazolam_inf','propofol_inf','ketamine_inf'].includes(stage3Agent) ? stage3Agent : null}
                  onChange={(v) => setStage3Agent(v)}
                  stepCompleted={isSection3Complete && activeSection !== 3}
                  defaultOpen={stage3Agent === null}
                />
              </div>

              {/* Stage 3 ASM add-on — lacosamide (CLIN-2 / A1) */}
              <div className="pt-1">
                <PathwayCategoryRow
                  label="Stage 3 ASM Add-on"
                  options={[
                    { value: 'lacosamide', label: 'Lacosamide (add-on alongside infusion)', description: `${calculateDose("lacosamide", patient.weight)} · Pre-load ECG required` },
                  ] as CategoryOption[]}
                  value={stage3Agent === 'lacosamide' ? 'lacosamide' : null}
                  onChange={(v) => setStage3Agent(v)}
                  stepCompleted={isSection3Complete && activeSection !== 3}
                />
              </div>

              {/* Dose Result Row — PATHWAY_SPEC §4.8 — aria-live so screen readers
                  announce the computed Stage 3 load when the agent updates (RH8,
                  matches the Stage 2 row above). */}
              {stage3Agent && (
                <div
                  className="border-t border-b border-slate-200 px-5 py-3 -mx-5 my-2 animate-in zoom-in-95"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calculated Load</div>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <span className="text-sm text-slate-600">{stage3Agent.charAt(0).toUpperCase()}{stage3Agent.slice(1).replace('_inf', ' Infusion').replace('_', ' ')}</span>
                    <span className="text-base font-mono font-semibold text-slate-900">{calculateDose(stage3Agent, patient.weight)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Computed from {patient.weight} kg patient</div>
                </div>
              )}

              {/* Lacosamide AV block safety notice */}
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 text-xs text-amber-800">
                <strong>Pre-load ECG safety:</strong> lacosamide is contraindicated in patients with second- or third-degree AV block without pacemaker (Vossler 2025). Obtain ECG; verify PR interval.
              </div>

              {/* Stage 4 — Super-Refractory SE */}
              <div className="pt-2 border-t border-slate-100 mt-2">
                <PathwayLearningPearl
                  title="Super-Refractory SE (Stage 4 — 24h+ on anesthetic)"
                  content={
                    <>
                      <p className="text-xs italic text-slate-500 mb-2">Framed as workup/checklist — expert consensus only. AES 2020 notes insufficient evidence to grade specific recommendations for super-refractory SE.</p>
                      <ul className="space-y-1.5 text-sm text-slate-700">
                        <li>• Re-image brain (MRI with contrast); rule out evolving lesion or cerebritis.</li>
                        <li>• Repeat LP; consider autoimmune encephalitis panel (NMDA-R, LGI1, GABA-B, etc.) and paraneoplastic workup.</li>
                        <li>• Consider empiric immunotherapy (steroids, IVIG, or PLEX) if NORSE/FIRES suspected.</li>
                        <li>• Consider ketogenic diet within 7 days for cryptogenic super-refractory cases.</li>
                        <li>• Consider alternative anesthetic (ketamine, thiopental/pentobarbital, isoflurane) if midazolam/propofol fail.</li>
                        <li>• Transfer to tertiary neurocritical care center if not already.</li>
                      </ul>
                    </>
                  }
                  visible={true}
                />
              </div>

              {stage3Agent && (
                <div className="pt-3">
                  <button onClick={copySummary} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-sm active:scale-95 transform-gpu min-h-[44px] touch-manipulation text-sm focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">Copy Full Pathway Note</button>
                </div>
              )}

              {/* References */}
              {activeSection === 3 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">References</h3>
                  <ul className="space-y-2 text-xs text-slate-500">
                    <li className="flex items-start gap-2"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono shrink-0">1</span>{autoLinkReactNodes("Glauser T et al. Evidence-based guideline: treatment of convulsive status epilepticus in children and adults. Epilepsy Curr 2016 (AES Guidelines).")}</li>
                    <li className="flex items-start gap-2"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono shrink-0">2</span>{autoLinkReactNodes("Kapur J et al. Randomized trial of three anticonvulsant medications for status epilepticus. N Engl J Med 2019 (ESETT Trial).")}</li>
                    <li className="flex items-start gap-2"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono shrink-0">3</span>{autoLinkReactNodes("Silbergleit R et al. Intramuscular versus intravenous therapy for prehospital status epilepticus. N Engl J Med 2012 (RAMPART). PMID 22335736.")}</li>
                    <li className="flex items-start gap-2"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono shrink-0">4</span>{autoLinkReactNodes("Treiman DM et al. A comparison of four treatments for generalized convulsive status epilepticus. VA Cooperative SE Trial. N Engl J Med 1998. PMID 9738086.")}</li>
                    <li className="flex items-start gap-2"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono shrink-0">5</span>{autoLinkReactNodes("Alldredge BK et al. A comparison of lorazepam, diazepam, and placebo for the treatment of out-of-hospital status epilepticus (PHTSE). N Engl J Med 2001. PMID 11547716.")}</li>
                    <li className="flex items-start gap-2"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono shrink-0">6</span>{autoLinkReactNodes("Lyttle MD et al. Levetiracetam versus phenytoin for second-line treatment of paediatric convulsive status epilepticus (EcLiPSE). Lancet 2019. PMID 31005386.")}</li>
                    <li className="flex items-start gap-2"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono shrink-0">7</span>{autoLinkReactNodes("Dalziel SR et al. Levetiracetam versus phenytoin for second-line treatment of convulsive status epilepticus in children (ConSEPT). Lancet 2019. PMID 31005385.")}</li>
                    <li className="flex items-start gap-2"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono shrink-0">8</span>{autoLinkReactNodes("Vossler DG. Status epilepticus in adults. Continuum (Minneap Minn) 2025;31(1):95–124.")}</li>
                    <li className="flex items-start gap-2"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono shrink-0">9</span>{autoLinkReactNodes("Rubinos C et al. Acute symptomatic seizures and status epilepticus. Continuum (Minneap Minn) 2024;30(3):682–720.")}</li>
                    <li className="flex items-start gap-2"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono shrink-0">10</span>{autoLinkReactNodes("Mullhi RK et al. Management of eclampsia and status epilepticus in pregnancy. J Intensive Care Soc 2025. DOI 10.1177/17511437251321338.")}</li>
                    <li className="flex items-start gap-2"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono shrink-0">11</span>{autoLinkReactNodes(SE_CONTENT.stage2Note)}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </PathwayRailStep>

      </div>

      {/* Discrete FAQ — V approval 2026-05-21 Option A. Same data feeds JSON-LD FAQPage schema via getSchemaForRoute. */}
      <DiscreteFAQ items={getFAQsForPath('/pathways/se-pathway')} />

      {showFavToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-200 z-[60]">
          {isFav ? 'Saved to Favorites' : 'Removed from Favorites'}
        </div>
      )}
    </div>
  );
};

export default StatusEpilepticusPathway;

// @medical-scientist 2026-05-16 — clinical fixes applied per docs/audits/2026-05-16/status-epilepticus-pathway-fix-manifest.md (Patches 1-6; ship-blockers A1/A2 addressed; CLIN-2 verbatim phrases preserved).
// @ui-architect 2026-05-16 — SE JSX shell rewrite to Pattern A. Clinical content + interpretation function + CLIN-2 verbatim phrases preserved. Composes PathwayRailStep + PathwayCategoryRow + PathwayBranchChip + PathwayLearningPearl. PathwayCascadeNotice skipped — SE has no meaningful upstream cascade scenarios (stage flow is linear; no orphan-state transparency benefit). PathwayBottomDrawer not applicable (no live-interpretation result panel in SE).
