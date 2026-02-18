
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, RotateCcw, Copy, Info, AlertCircle, ChevronRight, Activity, Zap, XCircle, AlertTriangle, ShieldAlert, Brain, Star } from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { EVT_CONTENT } from '../data/toolContent';
import { autoLinkReactNodes } from '../internalLinks/autoLink';
import { useTrialModal } from '../contexts/TrialModalContext';
import LearningPearl from '../components/LearningPearl';
import { useFavorites } from '../hooks/useFavorites';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { CollapsibleSection } from '../components/CollapsibleSection';

type Tri = "yes" | "no" | "unknown";
type MrsGroup = "yes" | "mrs2" | "mrs34" | "no" | "unknown"; // yes = mRS 0-1, mrs2 = mRS 2, mrs34 = mRS 3-4, no = mRS >4
type AgeGroup = "under_18" | "18_79" | "80_plus" | "unknown";
type TimeWindow = "0_6" | "6_24" | "unknown";
type NIHSSGroup = "0_5" | "6_9" | "10_19" | "20_plus" | "unknown";
type OcclusionType = "lvo" | "mevo" | "unknown";
type LvoLocation = "anterior" | "basilar" | "unknown";
type MevoLocation = "dominant_m2" | "nondominant_m2" | "distal" | "aca" | "pca" | "unknown";

type Inputs = {
  // Path Selector
  occlusionType: OcclusionType;

  // LVO Inputs
  lvoLocation: LvoLocation;
  lvo: Tri;
  mrs: MrsGroup;
  age: AgeGroup;
  time: TimeWindow;
  nihss: NIHSSGroup;
  aspects: string;
  pcAspects: string; // For Basilar
  massEffect: Tri; // Significant mass effect (AHA 2026: affects ASPECTS 0-2 / 6-24h selection)
  core: string;
  mismatchVol: string;
  mismatchRatio: string;

  // MeVO Inputs
  mevoLocation: MevoLocation;
  mevoDependent: Tri; // "Requires daily nursing care"
  nihssNumeric: string;
  mevoDisabling: Tri;
  mevoSalvageable: Tri; // Used for "Favorable Imaging" (0-6h) OR "Salvageable Tissue" (6-24h)
  mevoTechnical: Tri;
};

type Result = {
  eligible: boolean; // loosely used for "Green/Yellow" status vs "Red"
  status: "Eligible" | "Not Eligible" | "Consult" | "Clinical Judgment" | "EVT Reasonable" | "BMT Preferred" | "High Uncertainty" | "Avoid EVT";
  criteriaName?: string;
  reason: string;
  details: string;
  exclusionReason?: string;
  variant?: 'success' | 'warning' | 'danger' | 'neutral'; // specific color override
};

const STEPS = [
  { id: 1, title: "Triage" },
  { id: 2, title: "Clinical" },
  { id: 3, title: "Imaging" },
  { id: 4, title: "Decision" }
];

/**
 * Returns the name of the next *rendered* field after `field` in the given section,
 * based on the current inputs state.  Only fields that are actually visible in the UI
 * for the current path (LVO/MeVO, Basilar/Anterior, 0-6h/6-24h) are included so that
 * scroll-to-next never lands on an unmounted DOM node.
 */
const getNextRenderedField = (
  field: keyof Inputs,
  section: number,
  inputs: Inputs
): { next: string | null; isLast: boolean } => {
  const isLvo   = inputs.occlusionType === 'lvo';
  const isMevo  = inputs.occlusionType === 'mevo';
  const isBasilar = inputs.lvoLocation === 'basilar';
  const isLate  = inputs.time === '6_24';
  const isEarly = inputs.time === '0_6';

  let ordered: string[] = [];

  if (section === 1) {
    // Triage section — ordered field list depends on occlusion type
    if (isLvo) {
      ordered = ['occlusionType', 'lvoLocation', 'lvo'];
      if (inputs.lvo === 'yes') ordered.push('mrs');
      if (inputs.lvo === 'yes' && inputs.mrs !== 'unknown' && inputs.mrs !== 'no') ordered.push('age');
    } else if (isMevo) {
      ordered = ['occlusionType', 'mevoLocation', 'mevoDependent'];
    } else {
      ordered = ['occlusionType'];
    }
  } else if (section === 2) {
    // Clinical section
    ordered = ['time'];
    if (isLvo)  ordered.push('nihss');
    if (isMevo) ordered.push('nihssNumeric', 'mevoDisabling');
  } else if (section === 3) {
    // Imaging section
    if (isLvo && isBasilar) {
      ordered = ['pcAspects'];
    } else if (isLvo && isEarly) {
      ordered = ['aspects', 'massEffect'];
    } else if (isLvo && isLate) {
      ordered = ['aspects', 'massEffect', 'core', 'mismatchVol', 'mismatchRatio'];
    } else if (isMevo) {
      ordered = ['mevoSalvageable', 'mevoTechnical'];
    }
  }

  const idx = ordered.indexOf(field);
  if (idx < 0) return { next: null, isLast: false };
  if (idx < ordered.length - 1) return { next: ordered[idx + 1], isLast: false };
  return { next: null, isLast: true };
};

const getNihssNumeric = (nihss: NIHSSGroup): number => {
  switch(nihss) {
    case '0_5': return 2;
    case '6_9': return 8;
    case '10_19': return 15;
    case '20_plus': return 25;
    default: return 0;
  }
};

const calculateLvoProtocol = (inputs: Inputs): Result => {
  if (inputs.lvo === 'no') return { eligible: false, status: "Not Eligible", reason: "No Large Vessel Occlusion (LVO)", details: "Thrombectomy is indicated for occlusions of the ICA, MCA (M1), or Basilar Artery.", exclusionReason: "Absence of LVO target.", variant: 'danger' };
  if (inputs.mrs === 'no') return { eligible: false, status: "Not Eligible", reason: "Pre-stroke Disability (mRS > 4)", details: "EVT is not recommended for prestroke mRS > 4. Standard criteria require mRS 0–1, selected mRS 2, or mRS 3–4 (Class IIb in 0–6h with ASPECTS ≥6).", exclusionReason: "Poor baseline functional status.", variant: 'danger' };
  if (inputs.age === 'under_18') return { eligible: false, status: "Consult", reason: "Pediatric Patient", details: "Standard guidelines apply to age ≥ 18. Pediatric thrombectomy requires specialized consultation.", exclusionReason: "Age < 18.", variant: 'warning' };

  // --- BASILAR ARTERY PROTOCOL (2026 AHA/ASA Guidelines — pc-ASPECTS ≥6) ---
  if (inputs.lvoLocation === 'basilar') {
      const pcScore = parseInt(inputs.pcAspects);
      const nihssNum = getNihssNumeric(inputs.nihss);
      
      if (isNaN(pcScore)) return { 
          eligible: false, 
          status: "Not Eligible", 
          reason: "Pending Imaging", 
          details: "", 
          variant: 'neutral' 
      };

      // Class I: pc-ASPECTS ≥6 + NIHSS ≥10 (AHA/ASA 2026 infographic / Section 4.7.2)
      if (pcScore >= 6 && nihssNum >= 10) {
          return { 
              eligible: true, 
              status: "Eligible", 
              criteriaName: "Basilar EVT - Class I",
              reason: `Favorable Imaging (pc-ASPECTS ${pcScore}, NIHSS ${nihssNum})`, 
              details: "Class I recommendation: EVT strongly recommended for Basilar Artery Occlusion within 24h with pc-ASPECTS ≥6 and NIHSS ≥10. Strong evidence from ATTENTION and BAOCHE trials. (2026 AHA/ASA Guidelines)", 
              variant: 'success' 
          };
      }
      
      // Class IIb: pc-ASPECTS ≥6 + NIHSS 6–9 — EVT may be considered (AHA 2026 infographic)
      if (pcScore >= 6 && nihssNum >= 6) {
          return { 
              eligible: true, 
              status: "Clinical Judgment", 
              criteriaName: "Basilar EVT - Class IIb",
              reason: `Moderate Severity (pc-ASPECTS ${pcScore}, NIHSS 6–9)`, 
              details: "Class IIb recommendation: EVT may be considered for Basilar occlusion with pc-ASPECTS ≥6 and NIHSS 6–9. Individualized decision based on clinical context. (2026 AHA/ASA Guidelines)", 
              variant: 'warning' 
          };
      }
      
      // Avoid EVT — pc-ASPECTS < 6
      return { 
          eligible: false, 
          status: "Avoid EVT", 
          reason: `Extensive Infarct (pc-ASPECTS ${pcScore})`, 
          details: "pc-ASPECTS < 6 indicates large established brainstem/cerebellar infarction. EVT is associated with high rates of futile reperfusion and mortality. (2026 Guidelines)", 
          exclusionReason: "pc-ASPECTS < 6",
          variant: 'danger' 
      };
  }

  // --- ANTERIOR CIRCULATION (ICA / M1) — AHA/ASA 2026 Section 4.7.2 ---
  if (inputs.time === '0_6') {
     const aspects = parseInt(inputs.aspects);
     if (isNaN(aspects)) return { eligible: false, status: "Not Eligible", reason: "Pending Imaging", details: "", variant: 'neutral' };
     if (inputs.nihss === '0_5') return { eligible: true, status: "Clinical Judgment", reason: "Low NIHSS (< 6)", details: "Guidelines recommend EVT if deficit is disabling despite low score (e.g., aphasia, hemianopsia).", criteriaName: "Early Window (Low NIHSS)", variant: 'warning' };

     // COR 2a: Prestroke mRS 2 + ASPECTS ≥6 — EVT reasonable (2026 AHA/ASA 4.7.2)
     if (inputs.mrs === 'mrs2') {
         if (aspects >= 6) {
             return {
                 eligible: true,
                 status: "EVT Reasonable",
                 criteriaName: "Early Window mRS 2 - Class IIa",
                 reason: "Prestroke mRS 2, ASPECTS ≥ 6",
                 details: "Class IIa: In patients with NIHSS ≥6 and ASPECTS ≥6 who have prestroke mRS 2, EVT is reasonable to improve functional outcomes and reduce accumulated disability. (AHA/ASA 2026, Section 4.7.2)",
                 variant: 'warning'
             };
         }
         return { eligible: false, status: "Consult", reason: "Prestroke mRS 2, ASPECTS < 6", details: "Evidence for EVT in mRS 2 is limited to ASPECTS ≥6. Individualized decision with Vascular Neurology/Neurointerventional.", exclusionReason: "mRS 2 with large core", variant: 'danger' };
     }

     // COR 2b: Prestroke mRS 3–4 + ASPECTS ≥6 (0–6 h) — EVT may be considered (AHA 2026 infographic)
     if (inputs.mrs === 'mrs34') {
         if (aspects >= 6) {
             return {
                 eligible: true,
                 status: "Clinical Judgment",
                 criteriaName: "Early Window mRS 3-4 - Class IIb",
                 reason: "Prestroke mRS 3–4, ASPECTS ≥ 6",
                 details: "Class IIb: In patients with anterior LVO within 6h, NIHSS ≥6, and ASPECTS ≥6 who have prestroke mRS 3–4, EVT may be considered. Benefits may outweigh risks in selected patients; individualized decision with Vascular Neurology/Neurointerventional. (AHA/ASA 2026 infographic)",
                 variant: 'warning'
             };
         }
         return { eligible: false, status: "Consult", reason: "Prestroke mRS 3–4", details: "Evidence for EVT in mRS 3–4 is limited to 0–6h with ASPECTS ≥6 and NIHSS ≥6. Individualized decision with Vascular Neurology/Neurointerventional.", exclusionReason: "mRS 3–4 criteria not met", variant: 'danger' };
     }

     // COR 1: mRS 0–1, NIHSS ≥6, ASPECTS 3–10 — EVT recommended (2026 AHA/ASA 4.7.2)
     if (aspects >= 3 && aspects <= 10) {
         return {
             eligible: true,
             status: "Eligible",
             criteriaName: "Standard Early Window - Class I",
             reason: "ASPECTS 3–10",
             details: "Class I: EVT is recommended for anterior circulation LVO (ICA/M1) within 6h with NIHSS ≥6, prestroke mRS 0–1, and ASPECTS 3–10 to improve functional outcomes and reduce mortality. (AHA/ASA 2026, Section 4.7.2)",
             variant: 'success'
         };
     }

     // COR 2a: ASPECTS 0–2, age <80, without significant mass effect — EVT reasonable (2026 AHA/ASA 4.7.2)
     const isAgeUnder80 = inputs.age === '18_79';
     if (aspects >= 0 && aspects <= 2 && isAgeUnder80 && inputs.massEffect === 'no') {
         return {
             eligible: true,
             status: "EVT Reasonable",
             criteriaName: "Very Large Core (ASPECTS 0–2) - Class IIa",
             reason: "ASPECTS 0–2, age <80, no significant mass effect",
             details: "Class IIa: In selected patients with anterior LVO within 6h, age <80 years, NIHSS ≥6, mRS 0–1, ASPECTS 0–2, and without significant mass effect, EVT is reasonable. (AHA/ASA 2026, Section 4.7.2)",
             variant: 'warning'
         };
     }

     // ASPECTS 0–2 with mass effect or age ≥80 or mass effect unknown → Consult
     if (aspects >= 0 && aspects <= 2) {
         return { eligible: false, status: "Consult", reason: "Very Large Core (ASPECTS 0–2)", details: "High risk of futile reperfusion. Class IIa applies only to selected patients age <80 without significant mass effect. Individualized decision.", exclusionReason: "ASPECTS 0–2", variant: 'danger' };
     }

     return { eligible: false, status: "Not Eligible", reason: "Incomplete Imaging", details: "", variant: 'neutral' };
  }

  if (inputs.time === '6_24') {
      const core = parseInt(inputs.core);
      const mmVol = parseInt(inputs.mismatchVol);
      const ratio = parseFloat(inputs.mismatchRatio);
      const aspectsLate = parseInt(inputs.aspects);

      const nihssNumLate = getNihssNumeric(inputs.nihss);

      // COR 1 (2026 Rec #2 — LOE A): mRS 0–1, NIHSS ≥6, ASPECTS ≥6 in 6–24h — EVT recommended
      if (inputs.mrs === 'yes' && nihssNumLate >= 6 && !isNaN(aspectsLate) && aspectsLate >= 6) {
          return {
              eligible: true,
              status: "Eligible",
              criteriaName: "Late Window ASPECTS ≥6 - Class I",
              reason: `ASPECTS ${aspectsLate}, NIHSS ≥6, mRS 0–1`,
              details: "Class I (LOE A): In patients with anterior circulation LVO presenting 6–24h from onset with NIHSS ≥6, prestroke mRS 0–1, and ASPECTS ≥6, EVT is recommended to improve functional outcomes and reduce mortality. (AHA/ASA 2026, Section 4.7.2, Rec #2)",
              variant: 'success'
          };
      }

      // COR 1 (2026 Rec #3 — LOE A): Selected patients, mRS 0–1, age <80, NIHSS ≥6, ASPECTS 3–5, no significant mass effect
      if (inputs.mrs === 'yes' && inputs.age === '18_79' && nihssNumLate >= 6 && !isNaN(aspectsLate) && aspectsLate >= 3 && aspectsLate <= 5 && inputs.massEffect === 'no') {
          return {
              eligible: true,
              status: "Eligible",
              criteriaName: "Late Window ASPECTS 3–5 - Class I",
              reason: "ASPECTS 3–5, age <80, NIHSS ≥6, no significant mass effect",
              details: "Class I (LOE A): In selected patients with anterior LVO 6–24h from onset, age <80 years, NIHSS ≥6, mRS 0–1, ASPECTS 3–5, and without significant mass effect, EVT is recommended. (AHA/ASA 2026, Section 4.7.2, Rec #3)",
              variant: 'success'
          };
      }

      if (isNaN(core)) return { eligible: false, status: "Not Eligible", reason: "Pending Imaging", details: "", variant: 'neutral' };

      let dawnEligible = false;
      const isAge80Plus = inputs.age === '80_plus';
      const nihssNum = inputs.nihss === '20_plus' ? 25 : (inputs.nihss === '10_19' ? 15 : (inputs.nihss === '6_9' ? 8 : 2));
      
      if (nihssNum >= 10) {
          if (isAge80Plus) { if (core < 21) dawnEligible = true; } 
          else { if (core < 31) dawnEligible = true; else if (core < 51 && nihssNum >= 20) dawnEligible = true; }
      }

      if (dawnEligible) return { eligible: true, status: "Eligible", criteriaName: "DAWN Criteria", reason: "Clinical-Core Mismatch", details: EVT_CONTENT.dawnEligible, variant: 'success' };

      if (!isNaN(mmVol) && !isNaN(ratio)) {
          if (core < 70 && mmVol >= 15 && ratio >= 1.8) return { eligible: true, status: "Eligible", criteriaName: "DEFUSE-3 Criteria", reason: "Perfusion Mismatch", details: EVT_CONTENT.defuseEligible, variant: 'success' };
      }

      // Class IIb: Large Core 50-100 mL
      if (core >= 50 && core <= 100) {
          return { 
              eligible: true, 
              status: "Clinical Judgment", 
              criteriaName: "Large Core (50-100 mL) - Class IIb", 
              reason: `Large Core Volume (${core} mL)`, 
              details: "Class IIb: EVT MAY be considered for large cores (50-100 mL) in 6-24h window based on SELECT2/ANGEL-ASPECT trials. Higher risk of symptomatic ICH (15-20%) and uncertain functional benefit. Requires individualized assessment and informed consent. (2026 AHA/ASA Guidelines)", 
              variant: 'warning' 
          };
      }

      // Very Large Core >100 mL - Avoid EVT
      if (core > 100) {
          return { 
              eligible: false, 
              status: "Avoid EVT", 
              reason: `Very Large Core (${core} mL)`, 
              details: "Core >100 mL: EVT is NOT recommended due to very high rates of futile reperfusion (>80%), hemorrhagic transformation (>20%), and mortality. Best medical therapy preferred. (2026 AHA/ASA Guidelines)", 
              exclusionReason: "Core volume >100 mL",
              variant: 'danger' 
          };
      }
      
      return { eligible: false, status: "Not Eligible", reason: "No Target Profile", details: EVT_CONTENT.notEligibleLate, exclusionReason: "Imaging criteria not met.", variant: 'danger' };
  }

  return { eligible: false, status: "Not Eligible", reason: "Incomplete Data", details: "", variant: 'neutral' };
};

const calculateMevoProtocol = (inputs: Inputs): Result => {
    const score = parseInt(inputs.nihssNumeric);
    
    // Status D: Avoid EVT - Clinical Hard Stops
    if (inputs.mevoDependent === 'yes') {
        return { eligible: false, status: "Avoid EVT", reason: "Baseline Dependency", details: "Avoid EVT based on baseline dependency (requires daily nursing care).", variant: 'danger' };
    }
    // Low NIHSS / Non-disabling
    if (!isNaN(score) && score < 5 && inputs.mevoDisabling === 'no') {
        return { eligible: false, status: "Avoid EVT", reason: "Non-disabling Deficit", details: "Avoid EVT for low NIHSS (<5) without disabling features.", variant: 'danger' };
    }
    
    // IMAGING CHECK - Now applies to BOTH windows
    // 0-6h: Requires "Favorable Profile" (Small core, collaterals, OR mismatch)
    // 6-24h: Requires "Salvageable Tissue" (Mismatch)
    if (inputs.mevoSalvageable === 'no') {
        return { 
            eligible: false, 
            status: "Avoid EVT", 
            reason: "Unfavorable Imaging", 
            details: inputs.time === '0_6' 
                ? "Avoid EVT. Imaging suggests large established infarct or poor collaterals." 
                : "Avoid EVT. No evidence of salvageable tissue (penumbra) in late window.", 
            variant: 'danger' 
        };
    }

    // Status A: EVT Reasonable (COR 2a per AHA 2026 infographic)
    // Dominant M2: We use favorable imaging + disabling deficit (no explicit ASPECTS 6–10 requirement); outcome = EVT reasonable.
    const hasDeficit = (!isNaN(score) && score >= 5) || inputs.mevoDisabling === 'yes';
    
    if (inputs.mevoLocation === 'dominant_m2' && hasDeficit && inputs.mevoTechnical === 'yes') {
        return { 
            eligible: true, 
            status: "EVT Reasonable", 
            criteriaName: "Selected MeVO",
            reason: "Dominant M2 + Disabling", 
            details: "EVT reasonable for selected MeVO (disabling deficit + favorable imaging + feasible anatomy). Discuss urgently with neurointerventional.", 
            variant: 'success' 
        };
    }

    // Status C: Class III No Benefit — Nondominant M2 / Distal / ACA / PCA
    // 2026 AHA/ASA 4.7.2 Rec #8 (COR 3: No Benefit, LOE A): EVT not recommended for nondominant M2, codominant M2, distal MCA, ACA, PCA
    const isOtherLocation = inputs.mevoLocation !== 'dominant_m2' && inputs.mevoLocation !== 'unknown';
    if (isOtherLocation) {
        return {
            eligible: false,
            status: "Avoid EVT",
            criteriaName: "Class III: No Benefit",
            reason: "Nondominant / Distal Vessel — Not Recommended",
            details: "COR 3: No Benefit (LOE A) — The 2026 AHA/ASA Guidelines do not recommend EVT for nondominant or codominant proximal M2, distal MCA, ACA, or PCA occlusions. Based on ESCAPE-MeVO (2025) and DISTAL (2025), which showed no functional benefit and higher sICH rates. Specialist consultation required for exceptional cases. (AHA/ASA 2026, Section 4.7.2, Rec #8)",
            exclusionReason: "COR 3: No Benefit — nondominant/distal vessel location.",
            variant: 'danger'
        };
    }

    // Status B: BMT Preferred (Default) - e.g. High Technical Risk
    if (inputs.mevoTechnical === 'no') {
        return {
            eligible: false, 
            status: "BMT Preferred", 
            reason: "High Technical Risk", 
            details: "Procedural risks (access, tortuosity, distal location) likely outweigh benefits.", 
            variant: 'neutral'
        };
    }

    return { 
        eligible: false, 
        status: "BMT Preferred", 
        reason: "Standard MeVO Criteria", 
        details: "Best medical therapy preferred for this MeVO pattern; evidence for routine EVT is not established.", 
        variant: 'neutral' 
    };
};

interface SelectionCardProps {
    title: string;
    description?: string;
    selected: boolean;
    onClick: () => void;
    variant?: 'default' | 'danger';
}
const SelectionCard = React.memo(({ title, description, selected, onClick, variant = 'default' }: SelectionCardProps) => (
    <button onClick={onClick} className={`w-full text-left p-5 rounded-2xl border-2 transition-colors duration-150 relative overflow-hidden active:scale-[0.99] transform-gpu touch-manipulation min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${selected ? variant === 'danger' ? 'bg-red-50 border-red-500 text-red-900' : 'bg-neuro-50 border-neuro-500 text-teal-500' : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
        <div className="flex items-start justify-between relative z-10">
            <div className="pr-4">
                <span className={`block text-lg font-bold ${selected ? 'text-current' : 'text-slate-900'}`}>{title}</span>
                {description && <span className={`text-sm mt-1.5 block leading-relaxed ${selected ? 'opacity-90' : 'text-slate-500'}`}>{description}</span>}
            </div>
            {selected && <div className={`p-1.5 rounded-full ${variant === 'danger' ? 'bg-red-500 text-white' : 'bg-neuro-500 text-white'}`}><Check size={16} /></div>}
        </div>
    </button>
));

interface EvtPathwayProps {
  onResultChange?: (result: Result | null) => void;
  hideHeader?: boolean;
  isInModal?: boolean;
  customActionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactElement;
  };
}

const EvtPathway: React.FC<EvtPathwayProps> = ({ onResultChange, hideHeader = false, isInModal = false, customActionButton }) => {
  const [activeSection, setActiveSection] = useState<number>(0);
  const step = activeSection + 1;
  const { getBackPath, getBackLabel } = useNavigationSource();
  const [inputs, setInputs] = useState<Inputs>({ 
      occlusionType: 'unknown',
      lvoLocation: 'unknown',
      lvo: 'unknown', mrs: 'unknown', age: 'unknown', 
      time: 'unknown', nihss: 'unknown', aspects: '', pcAspects: '', massEffect: 'unknown', core: '', mismatchVol: '', mismatchRatio: '',
      mevoLocation: 'unknown', mevoDependent: 'unknown', nihssNumeric: '', mevoDisabling: 'unknown', mevoSalvageable: 'unknown', mevoTechnical: 'unknown'
  });
  const [result, setResult] = useState<Result | null>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevCompleteRef = useRef({ s0: false, s1: false, s2: false });

  // Analytics
  const { trackResult } = useCalculatorAnalytics('evt_pathway');

  // Trial Modal
  const { openTrial } = useTrialModal();

  // Favorites
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showFavToast, setShowFavToast] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const isFav = isFavorite('evt-pathway');

  const handleFavToggle = () => {
      const newVal = toggleFavorite('evt-pathway');
      setShowFavToast(true);
      setTimeout(() => setShowFavToast(false), 2000);
  };

  useEffect(() => { 
      if (inputs.occlusionType === 'lvo') {
          const newResult = calculateLvoProtocol(inputs);
          setResult(newResult);
          if (onResultChange) {
            onResultChange(newResult);
          }
          if (newResult) trackResult(newResult.status);
      } else if (inputs.occlusionType === 'mevo') {
          const newResult = calculateMevoProtocol(inputs);
          setResult(newResult);
          if (onResultChange) {
            onResultChange(newResult);
          }
          if (newResult) trackResult(newResult.status);
      } else {
          setResult(null);
          if (onResultChange) {
            onResultChange(null);
          }
      }
  }, [inputs, trackResult, onResultChange]);

  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (activeSection >= 0 && activeSection <= 3) {
      const el = sectionRefs.current[activeSection];
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
  }, [activeSection]);

  const updateInput = useCallback((field: keyof Inputs, value: any) => {
    setInputs(prev => {
        const next = { ...prev, [field]: value };
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

    // Use the dynamic resolver so we only scroll to fields that are actually rendered
    // for the current path (LVO/MeVO, Basilar/Anterior, time window).
    setInputs(latest => {
      const { next, isLast } = getNextRenderedField(field, activeSection + 1, latest);
      setTimeout(() => {
        if (next && fieldRefs.current[next]) {
          fieldRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (isLast) {
          document.getElementById('evt-action-bar')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 150);
      return latest; // no state change — we're just reading the latest value
    });
  }, [activeSection]);

  const handleNext = () => {
    setActiveSection((prev) => Math.min(3, prev + 1));
  };
  const handleBack = () => { setActiveSection((prev) => Math.max(0, prev - 1)); };

  // Collapse = go to adjacent section (never leave activeSection at -1)
  const handleSectionToggle = (sectionIndex: number) => {
    setActiveSection((prev) => {
      if (prev === sectionIndex) {
        if (sectionIndex === 0) return 1;
        if (sectionIndex === 3) return 2;
        return sectionIndex - 1;
      }
      return sectionIndex;
    });
  };
  
  const handleReset = () => { 
      setInputs({ 
          occlusionType: 'unknown',
          lvoLocation: 'unknown',
          lvo: 'unknown', mrs: 'unknown', age: 'unknown', 
          time: 'unknown', nihss: 'unknown', aspects: '', pcAspects: '', massEffect: 'unknown', core: '', mismatchVol: '', mismatchRatio: '',
          mevoLocation: 'unknown', mevoDependent: 'unknown', nihssNumeric: '', mevoDisabling: 'unknown', mevoSalvageable: 'unknown', mevoTechnical: 'unknown'
      }); 
      setActiveSection(0); 
  };

  const copySummary = () => { 
      if (!result) return; 
      let summary = "";
      if (inputs.occlusionType === 'lvo') {
          const imagingLine = inputs.lvoLocation === 'basilar'
              ? `- pc-ASPECTS: ${inputs.pcAspects}`
              : inputs.time === '0_6'
                  ? `- ASPECTS: ${inputs.aspects}`
                  : [
                      inputs.aspects ? `- ASPECTS: ${inputs.aspects}` : '',
                      inputs.core ? `- Core: ${inputs.core}ml` : '',
                      inputs.mismatchVol ? `- Mismatch: ${inputs.mismatchVol}ml | Ratio: ${inputs.mismatchRatio}` : '',
                    ].filter(Boolean).join('\n');
          summary = `LVO EVT Assessment\nType: ${inputs.lvoLocation === 'basilar' ? 'Basilar' : 'Anterior'}\nStatus: ${result.status.toUpperCase()}\nProtocol: ${result.criteriaName || 'Standard Screening'}\n\nClinical Data:\n- Time Window: ${inputs.time === '0_6' ? '0-6h' : '6-24h'}\n- NIHSS: ${inputs.nihss.replace('_', '-').replace('plus', '+')}\n- Age: ${inputs.age.replace('_', '-').replace('plus', '+')}\n\nImaging Data:\n${imagingLine}\n\nReason: ${result.reason}\n${result.details}`;
      } else {
          summary = `MeVO EVT Assessment\nStatus: ${result.status.toUpperCase()}\nReason: ${result.reason}\n\nClinical Data:\n- Location: ${inputs.mevoLocation.replace('_', ' ').toUpperCase()}\n- NIHSS: ${inputs.nihssNumeric}\n- Disabling: ${inputs.mevoDisabling}\n- Dependent: ${inputs.mevoDependent}\n- Time: ${inputs.time === '0_6' ? '0-6h' : '6-24h'}\n- Favorable Imaging: ${inputs.mevoSalvageable.toUpperCase()}\n\nDetails:\n${result.details}`;
      }
      navigator.clipboard.writeText(summary.trim());
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
  };

  const isLvo = inputs.occlusionType === 'lvo';
  const isMevo = inputs.occlusionType === 'mevo';
  const isBasilar = inputs.lvoLocation === 'basilar';

  const isSection0Complete = useMemo(() => {
    if (inputs.occlusionType === 'unknown') return false;
    if (inputs.occlusionType === 'lvo') {
      return (
        inputs.lvoLocation !== 'unknown' &&
        inputs.lvo !== 'unknown' &&
        (inputs.lvo === 'no' || (inputs.mrs !== 'unknown' && inputs.age !== 'unknown'))
      );
    }
    return inputs.mevoLocation !== 'unknown' && inputs.mevoDependent !== 'unknown';
  }, [inputs]);

  const isSection1Complete = useMemo(() => {
    if (inputs.occlusionType === 'unknown') return false;
    if (inputs.time === 'unknown') return false;
    if (inputs.occlusionType === 'lvo') return inputs.nihss !== 'unknown';
    return inputs.nihssNumeric !== '' && inputs.mevoDisabling !== 'unknown';
  }, [inputs]);

  const isSection2Complete = useMemo(() => {
    if (inputs.occlusionType === 'unknown') return false;
    if (inputs.occlusionType === 'lvo') {
      if (inputs.time === 'unknown') return false;
      if (inputs.lvoLocation === 'basilar') return inputs.pcAspects !== '';
      if (inputs.time === '0_6') return inputs.aspects !== '';
      // 6-24h: complete if core entered, OR ASPECTS ≥6 entered (Class I Rec #2), OR ASPECTS 3-5 + mass effect set (Class I Rec #3)
      const aspectsNum = parseInt(inputs.aspects, 10);
      const hasAspectsClassI_HighScore = !isNaN(aspectsNum) && aspectsNum >= 6; // Rec #2: ASPECTS ≥6, no mass effect needed
      const hasAspectsClassI_LowScore = !isNaN(aspectsNum) && aspectsNum >= 3 && aspectsNum <= 5 && inputs.massEffect !== 'unknown'; // Rec #3: ASPECTS 3-5
      return inputs.core !== '' || hasAspectsClassI_HighScore || hasAspectsClassI_LowScore;
    }
    return inputs.mevoSalvageable !== 'unknown' && inputs.mevoTechnical !== 'unknown';
  }, [inputs]);

  const isSection3Complete = !!result;
  const completedCount = [isSection0Complete, isSection1Complete, isSection2Complete, isSection3Complete].filter(Boolean).length;

  const getSummary = (idx: number) => {
    if (idx === 0) {
      if (inputs.occlusionType === 'unknown') return undefined;
      if (inputs.occlusionType === 'lvo') return `LVO • ${inputs.lvoLocation === 'unknown' ? 'Location?' : inputs.lvoLocation}`;
      return `MeVO • ${inputs.mevoLocation === 'unknown' ? 'Location?' : inputs.mevoLocation.replace('_', ' ')}`;
    }
    if (idx === 1) {
      if (inputs.time === 'unknown') return undefined;
      if (inputs.occlusionType === 'lvo') return `${inputs.time === '0_6' ? '0-6h' : '6-24h'} • NIHSS ${inputs.nihss === 'unknown' ? '?' : inputs.nihss.replace('_', '-').replace('plus', '+')}`;
      return `${inputs.time === '0_6' ? '0-6h' : '6-24h'} • NIHSS ${inputs.nihssNumeric || '?'}`;
    }
    if (idx === 2) {
      if (inputs.occlusionType === 'lvo') {
        if (inputs.lvoLocation === 'basilar') return inputs.pcAspects ? `pc-ASPECTS ${inputs.pcAspects}` : undefined;
        if (inputs.time === '0_6') return inputs.aspects ? `ASPECTS ${inputs.aspects}` : undefined;
        if (inputs.time === '6_24') {
          const a = parseInt(inputs.aspects, 10);
          if (!isNaN(a) && a >= 6) return `ASPECTS ${inputs.aspects}`; // Rec #2 Class I path
          if (!isNaN(a) && a >= 3 && a <= 5 && inputs.massEffect !== 'unknown') return `ASPECTS ${inputs.aspects}`;
          return inputs.core ? `Core ${inputs.core} mL` : undefined;
        }
      }
      const a = inputs.mevoSalvageable === 'unknown' ? '?' : inputs.mevoSalvageable.toUpperCase();
      const t = inputs.mevoTechnical === 'unknown' ? '?' : inputs.mevoTechnical.toUpperCase();
      return `Imaging ${a} • Technical ${t}`;
    }
    if (idx === 3 && result) return `${result.status} • ${result.reason}`;
    return undefined;
  };

  useEffect(() => {
    // Auto-open next step only when current section *just* became complete (not when user clicked Back).
    // Imaging (section 2) does NOT auto-advance to Decision — user must click "Next".
    if (activeSection === 0 && isSection0Complete && !prevCompleteRef.current.s0) {
      prevCompleteRef.current.s0 = true;
      setTimeout(() => setActiveSection(1), 280);
    }
    if (!isSection0Complete) prevCompleteRef.current.s0 = false;

    if (activeSection === 1 && isSection1Complete && !prevCompleteRef.current.s1) {
      prevCompleteRef.current.s1 = true;
      setTimeout(() => setActiveSection(2), 280);
    }
    if (!isSection1Complete) prevCompleteRef.current.s1 = false;

    // Section 2 (Imaging): no auto-advance to Decision; user clicks "Next" to proceed.
  }, [activeSection, isSection0Complete, isSection1Complete, isSection2Complete]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 md:pb-20">
      {!hideHeader && (
        <div className="mb-6 flex items-start justify-between">
          <div>
              <Link to={getBackPath()} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-neuro-500 mb-6 group">
                  <div className="bg-white p-1.5 rounded-md border border-slate-200 mr-2 shadow-sm group-hover:shadow-md transition-colors duration-150"><ArrowLeft size={16} /></div> {getBackLabel()}
              </Link>
              <div className="flex items-center space-x-3 mb-2"><div className="p-2 bg-neuro-100 text-teal-500 rounded-lg"><Zap size={24} className="fill-neuro-700" /></div><h1 className="text-2xl font-black text-slate-900 tracking-tight">Thrombectomy Pathway</h1></div>
              <p className="text-slate-500 font-medium">Eligibility screening for LVO (ICA, M1, Basilar) and MeVO (M2, M3, ACA, PCA).</p>
          </div>
          <button 
              onClick={handleFavToggle}
              className="p-3 rounded-full hover:bg-slate-100 transition-colors"
          >
              <Star size={24} className={isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
          </button>
        </div>
      )}
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-neuro-500 transition-colors duration-150"
            style={{ width: `${(completedCount / 4) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-slate-500">{completedCount}/4 sections completed</div>
      </div>

      <div ref={stepContainerRef} className="space-y-6 min-h-[300px]">
        <div ref={el => { sectionRefs.current[0] = el; }} className="scroll-mt-4">
        <CollapsibleSection
          title="Triage"
          stepNumber={1}
          totalSteps={4}
          isCompleted={isSection0Complete}
          isActive={activeSection === 0}
          onToggle={() => handleSectionToggle(0)}
          summary={getSummary(0)}
        >
            <div className="space-y-6">
                <div ref={el => { fieldRefs.current['occlusionType'] = el; }}>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Occlusion Type</h3>
                    <div className="grid grid-cols-1 gap-3">
                        <SelectionCard title="Large Vessel Occlusion (LVO)" description="Proximal: ICA, M1, or Basilar Artery." selected={inputs.occlusionType === 'lvo'} onClick={() => updateInput('occlusionType', 'lvo')} />
                        <SelectionCard title="Medium/Distal Vessel (MeVO/DMVO)" description="Distal: M2, M3, A2, A3, P2, P3." selected={inputs.occlusionType === 'mevo'} onClick={() => updateInput('occlusionType', 'mevo')} />
                    </div>
                    <LearningPearl 
                        title="Evidence Landscape" 
                        content="LVO has Class I evidence for EVT. MeVO/DMVO is an evolving area; benefit depends on deficit severity, eloquence, and risk." 
                    />
                    <LearningPearl
                        title="Exclusions"
                        content="Hard exclusions: no LVO, pre-stroke dependence (mRS >4), age <18, terminal illness or limited goals of care. Note: mRS 2 is Class IIa and mRS 3–4 is Class IIb per 2026 guidelines — prior disability alone is not an exclusion. When in doubt, discuss with Vascular Neurology and Neurointerventional."
                    />
                </div>

                {isLvo && (
                    <div className="space-y-6 animate-in slide-in-from-top-2">
                        <div ref={el => { fieldRefs.current['lvoLocation'] = el; }} className="pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">LVO Location</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <SelectionCard title="Anterior Circulation" description="ICA or MCA (M1)" selected={inputs.lvoLocation === 'anterior'} onClick={() => updateInput('lvoLocation', 'anterior')} />
                                <SelectionCard title="Posterior Circulation" description="Basilar Artery" selected={inputs.lvoLocation === 'basilar'} onClick={() => updateInput('lvoLocation', 'basilar')} />
                            </div>
                        </div>

                        {inputs.lvoLocation !== 'unknown' && (
                            <div ref={el => { fieldRefs.current['lvo'] = el; }}>
                                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Confirm LVO</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <SelectionCard title="LVO Confirmed on CTA/MRA" selected={inputs.lvo === 'yes'} onClick={() => updateInput('lvo', 'yes')} />
                                    <SelectionCard title="No LVO" selected={inputs.lvo === 'no'} onClick={() => updateInput('lvo', 'no')} />
                                </div>
                            </div>
                        )}
                        {inputs.lvo === 'yes' && (
                            <div ref={el => { fieldRefs.current['mrs'] = el; }}>
                                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Prestroke Functional Status (mRS)</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <SelectionCard title="Independent (mRS 0-1)" description="No significant disability prior to stroke." selected={inputs.mrs === 'yes'} onClick={() => updateInput('mrs', 'yes')} />
                                    <SelectionCard title="Dependent, selected (mRS 2)" description="Requires assistance for ADLs; EVT reasonable if ASPECTS ≥6 (2026 Class IIa)." selected={inputs.mrs === 'mrs2'} onClick={() => updateInput('mrs', 'mrs2')} />
                                    <SelectionCard title="Dependent (mRS 3-4)" description="EVT may be considered if ASPECTS ≥6 in 0-6h (2026 Class IIb)." selected={inputs.mrs === 'mrs34'} onClick={() => updateInput('mrs', 'mrs34')} />
                                    <SelectionCard title="Dependent (mRS > 4)" description="EVT not recommended (mRS 5-6)." selected={inputs.mrs === 'no'} onClick={() => updateInput('mrs', 'no')} variant="danger" />
                                </div>
                            </div>
                        )}
                        {(inputs.mrs === 'yes' || inputs.mrs === 'mrs2' || inputs.mrs === 'mrs34') && (
                            <div ref={el => { fieldRefs.current['age'] = el; }}>
                                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Age Group</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <button onClick={() => updateInput('age', 'under_18')} className={`p-4 rounded-xl border-2 font-bold transition-colors duration-150 touch-manipulation min-h-[44px] active:scale-95 transform-gpu focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${inputs.age === 'under_18' ? 'border-neuro-500 bg-neuro-50 text-teal-500' : 'bg-white border-slate-100'}`}>&lt; 18</button>
                                    <button onClick={() => updateInput('age', '18_79')} className={`p-4 rounded-xl border-2 font-bold transition-colors duration-150 touch-manipulation min-h-[44px] active:scale-95 transform-gpu focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${inputs.age === '18_79' ? 'border-neuro-500 bg-neuro-50 text-teal-500' : 'bg-white border-slate-100'}`}>18 - 79</button>
                                    <button onClick={() => updateInput('age', '80_plus')} className={`p-4 rounded-xl border-2 font-bold transition-colors duration-150 touch-manipulation min-h-[44px] active:scale-95 transform-gpu focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${inputs.age === '80_plus' ? 'border-neuro-500 bg-neuro-50 text-teal-500' : 'bg-white border-slate-100'}`}>≥ 80</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {isMevo && (
                    <div className="space-y-6 animate-in slide-in-from-top-2">
                        <div ref={el => { fieldRefs.current['mevoLocation'] = el; }} className="pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Vessel Location</h3>
                            <div className="space-y-3">
                                <select className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-neuro-500 min-h-[56px] text-base" value={inputs.mevoLocation} onChange={(e) => updateInput('mevoLocation', e.target.value)}>
                                    <option value="unknown">Select Location...</option>
                                    <option value="dominant_m2">Dominant / Proximal M2</option>
                                    <option value="nondominant_m2">Nondominant / Codominant M2</option>
                                    <option value="distal">Distal M2 / M3</option>
                                    <option value="aca">ACA (A2 / A3)</option>
                                    <option value="pca">PCA (P2 / P3)</option>
                                </select>
                            </div>
                        </div>
                        <div ref={el => { fieldRefs.current['mevoDependent'] = el; }}>
                            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Baseline Function</h3>
                            <SelectionCard title="Requires daily nursing care / ADL assistance?" description="If YES, EVT is generally avoided for MeVO." selected={inputs.mevoDependent === 'yes'} onClick={() => updateInput('mevoDependent', 'yes')} variant="danger" />
                            <div className="mt-2"><SelectionCard title="Independent / Minimal Assistance" selected={inputs.mevoDependent === 'no'} onClick={() => updateInput('mevoDependent', 'no')} /></div>
                        </div>
                    </div>
                )}
            </div>
        </CollapsibleSection>
        </div>

        <div ref={el => { sectionRefs.current[1] = el; }} className="scroll-mt-4">
        <CollapsibleSection
          title="Clinical"
          stepNumber={2}
          totalSteps={4}
          isCompleted={isSection1Complete}
          isActive={activeSection === 1}
          onToggle={() => handleSectionToggle(1)}
          summary={getSummary(1)}
        >
            <div className="space-y-6">
                <div ref={el => { fieldRefs.current['time'] = el; }}>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Time from Last Known Well</h3>
                    <div className="grid grid-cols-1 gap-3">
                        <SelectionCard title="Early Window (0 - 6 Hours)" description="Standard window." selected={inputs.time === '0_6'} onClick={() => updateInput('time', '0_6')} />
                        <SelectionCard title="Late Window (6 - 24 Hours)" description="Extended window consideration." selected={inputs.time === '6_24'} onClick={() => updateInput('time', '6_24')} />
                    </div>
                    <LearningPearl
                        title="2026 Guideline Update"
                        content="The 2026 AHA/ASA Guidelines (Section 4.7.2) — Early window (0–6h): Class I for ASPECTS 3–10, NIHSS ≥6, mRS 0–1; Class IIa for ASPECTS 0–2 (age <80, no mass effect) and for mRS 2 with ASPECTS ≥6; Class IIb for mRS 3–4 with ASPECTS ≥6. Late window (6–24h): Class I for ASPECTS ≥6 with NIHSS ≥6 and mRS 0–1 (NEW — Rec #2, LOE A); Class I for ASPECTS 3–5 with age <80, no mass effect (Rec #3); DAWN/DEFUSE-3 criteria apply for perfusion-selected patients."
                    />
                </div>

                {isLvo && (
                    <div ref={el => { fieldRefs.current['nihss'] = el; }} className="pt-4">
                        <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">NIH Stroke Scale</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <SelectionCard title="0 - 5" description="Mild" selected={inputs.nihss === '0_5'} onClick={() => updateInput('nihss', '0_5')} />
                            <SelectionCard title="6 - 9" description="Moderate" selected={inputs.nihss === '6_9'} onClick={() => updateInput('nihss', '6_9')} />
                            <SelectionCard title="10 - 19" description="Mod-Severe" selected={inputs.nihss === '10_19'} onClick={() => updateInput('nihss', '10_19')} />
                            <SelectionCard title="≥ 20" description="Severe" selected={inputs.nihss === '20_plus'} onClick={() => updateInput('nihss', '20_plus')} />
                        </div>
                        <LearningPearl 
                            title="NIHSS Limitations" 
                            content="NIHSS underestimates disability in eloquent territories (aphasia, hemianopia, dominant hand) and posterior circulation (Basilar). Disabling symptoms may justify intervention even with low numeric scores." 
                        />
                    </div>
                )}

                {isMevo && (
                    <div className="pt-4 space-y-6">
                        <div ref={el => { fieldRefs.current['nihssNumeric'] = el; }}>
                            <label className="block text-sm font-bold text-slate-900 mb-2">NIHSS Score (Numeric)</label>
                            <input type="number" min="0" max="42" className="w-full p-4 text-lg bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-neuro-500 outline-none font-bold" placeholder="e.g. 4" value={inputs.nihssNumeric} onChange={(e) => updateInput('nihssNumeric', e.target.value)} />
                        </div>
                        <div ref={el => { fieldRefs.current['mevoDisabling'] = el; }}>
                            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Disabling Deficit?</h3>
                            <div className="bg-neuro-50 p-3 rounded-lg text-xs text-teal-500 mb-3">
                                Examples: Aphasia, hemianopsia, dominant hand weakness, or deficits impacting occupation/lifestyle despite low NIHSS.
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <SelectionCard title="Yes" description="Disabling symptoms present" selected={inputs.mevoDisabling === 'yes'} onClick={() => updateInput('mevoDisabling', 'yes')} />
                                <SelectionCard title="No" description="Non-disabling / Minor" selected={inputs.mevoDisabling === 'no'} onClick={() => updateInput('mevoDisabling', 'no')} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CollapsibleSection>
        </div>

        <div ref={el => { sectionRefs.current[2] = el; }} className="scroll-mt-4">
        <CollapsibleSection
          title="Imaging"
          stepNumber={3}
          totalSteps={4}
          isCompleted={isSection2Complete}
          isActive={activeSection === 2}
          onToggle={() => handleSectionToggle(2)}
          summary={getSummary(2)}
        >
            <div className="space-y-6">
                {isLvo && (
                    <div>
                        {/* Anterior 0-6h: ASPECTS */}
                        {inputs.time === '0_6' && !isBasilar && (
                            <div ref={el => { fieldRefs.current['aspects'] = el; }}>
                                <div className="bg-neuro-50 p-4 rounded-xl text-teal-500 text-sm mb-6 border border-neuro-100">
                                    <h4 className="font-bold flex items-center mb-2"><Info size={16} className="mr-2"/> Early Window Imaging</h4>
                                    <p>Enter ASPECTS score from non-contrast CT.</p>
                                </div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">ASPECTS Score (0-10)</label>
                                <input type="number" min="0" max="10" className="w-full p-4 text-lg bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-neuro-500 outline-none font-bold" placeholder="e.g. 8" value={inputs.aspects} onChange={(e) => updateInput('aspects', e.target.value)} />
                                <div ref={el => { fieldRefs.current['massEffect'] = el; }} className="mt-6">
                                    <h4 className="text-sm font-bold text-slate-900 mb-2">Significant mass effect on imaging?</h4>
                                    <p className="text-xs text-slate-500 mb-3">Relevant for ASPECTS 0–2 (Class IIa requires no significant mass effect per 2026 guidelines).</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <SelectionCard title="No" description="No significant mass effect" selected={inputs.massEffect === 'no'} onClick={() => updateInput('massEffect', 'no')} />
                                        <SelectionCard title="Yes" description="Significant mass effect" selected={inputs.massEffect === 'yes'} onClick={() => updateInput('massEffect', 'yes')} />
                                        <SelectionCard title="Unknown" description="Not assessed" selected={inputs.massEffect === 'unknown'} onClick={() => updateInput('massEffect', 'unknown')} />
                                    </div>
                                </div>
                                <LearningPearl 
                                    title="Understanding ASPECTS" 
                                    content="ASPECTS is a 10-point scoring system for MCA stroke. Start with 10 (normal) and subtract 1 point for early ischemic changes in each of 10 defined regions (Caudate, Lentiform, Internal Capsule, Insula, M1-M6). Scores < 6 typically indicate a large established infarct core." 
                                />
                                <LearningPearl 
                                    title="AHA/ASA 2026 Early Window (Section 4.7.2)" 
                                    content="Class I: EVT recommended for ASPECTS 3–10 with NIHSS ≥6 and mRS 0–1. Class IIa: EVT reasonable for prestroke mRS 2 with ASPECTS ≥6; and for selected patients with ASPECTS 0–2, age <80 years, without significant mass effect. SELECT2/ANGEL-ASPECT support large-core selection." 
                                />
                            </div>
                        )}

                        {/* Basilar (Any Time): pc-ASPECTS */}
                        {isBasilar && (
                            <div ref={el => { fieldRefs.current['pcAspects'] = el; }}>
                                <div className="bg-purple-50 p-4 rounded-xl text-purple-900 text-sm mb-6 border border-purple-100">
                                    <h4 className="font-bold flex items-center mb-2"><Brain size={16} className="mr-2"/> Posterior Circulation Imaging</h4>
                                    <p>Enter <strong>pc-ASPECTS</strong> score (from CTA source images or DWI).</p>
                                </div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">pc-ASPECTS Score (0-10)</label>
                                <input type="number" min="0" max="10" className="w-full p-4 text-lg bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-neuro-500 outline-none font-bold" placeholder="e.g. 8" value={inputs.pcAspects} onChange={(e) => updateInput('pcAspects', e.target.value)} />
                                <LearningPearl 
                                    title="pc-ASPECTS & 2026 Guidelines" 
                                    content="pc-ASPECTS scores the posterior circulation on a 10-point scale: Thalami (1 each), Occipital lobes (1 each), Midbrain (2), Pons (2), Cerebellar hemispheres (1 each). Per AHA/ASA 2026: pc-ASPECTS ≥6 with NIHSS ≥10 → Class I; pc-ASPECTS ≥6 with NIHSS 6–9 → Class IIb (EVT may be considered). pc-ASPECTS <6 → Avoid EVT. ATTENTION and BAOCHE trials support intervention up to 24h." 
                                />
                            </div>
                        )}

                        {/* Anterior 6-24h: Optional ASPECTS + Perfusion */}
                        {inputs.time === '6_24' && !isBasilar && (
                            <div>
                                <div className="bg-purple-50 p-4 rounded-xl text-purple-900 text-sm mb-6 border border-purple-100">
                                    <h4 className="font-bold flex items-center mb-2"><Info size={16} className="mr-2"/> Late Window Imaging (6–24h)</h4>
                                    <p><strong>ASPECTS ≥6 → Class I</strong> (Rec #2, LOE A) — no perfusion required. <strong>ASPECTS 3–5, age &lt;80, no mass effect → Class I</strong> (Rec #3, LOE A). For borderline cases, enter perfusion values (DAWN/DEFUSE-3 criteria below).</p>
                                </div>
                                {/* ASPECTS — primary criterion for Class I in 6-24h (Recs #2 and #3) */}
                                <div ref={el => { fieldRefs.current['aspects'] = el; }} className="mb-6">
                                    <h4 className="text-sm font-bold text-slate-900 mb-2">ASPECTS from NCCT</h4>
                                    <p className="text-xs text-slate-500 mb-2">ASPECTS ≥6 → Class I (no other criteria needed). ASPECTS 3–5 → Class I if age &lt;80 + no mass effect. Enter 0–10 or leave blank to use perfusion criteria instead.</p>
                                    <input type="number" min="0" max="10" className="w-full p-4 text-lg bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-neuro-500 outline-none font-bold" placeholder="e.g. 7" value={inputs.aspects} onChange={(e) => updateInput('aspects', e.target.value)} />
                                    <div ref={el => { fieldRefs.current['massEffect'] = el; }} className="mt-4">
                                        <h4 className="text-sm font-bold text-slate-900 mb-2">Significant mass effect on imaging?</h4>
                                        <div className="grid grid-cols-3 gap-3">
                                            <SelectionCard title="No" description="No significant mass effect" selected={inputs.massEffect === 'no'} onClick={() => updateInput('massEffect', 'no')} />
                                            <SelectionCard title="Yes" description="Significant mass effect" selected={inputs.massEffect === 'yes'} onClick={() => updateInput('massEffect', 'yes')} />
                                            <SelectionCard title="Unknown" description="Not assessed" selected={inputs.massEffect === 'unknown'} onClick={() => updateInput('massEffect', 'unknown')} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div ref={el => { fieldRefs.current['core'] = el; }}>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Ischemic Core Volume (ml)</label>
                                        <input type="number" className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-neuro-500 outline-none font-medium text-lg" placeholder="CBF < 30%" value={inputs.core} onChange={(e) => updateInput('core', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div ref={el => { fieldRefs.current['mismatchVol'] = el; }}>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Mismatch Volume</label>
                                            <input type="number" className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-neuro-500 outline-none font-medium text-lg" placeholder="Volume" value={inputs.mismatchVol} onChange={(e) => updateInput('mismatchVol', e.target.value)} />
                                        </div>
                                        <div ref={el => { fieldRefs.current['mismatchRatio'] = el; }}>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Mismatch Ratio</label>
                                            <input type="number" step="0.1" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-neuro-500 outline-none font-medium text-slate-600 text-lg" placeholder="Ratio" value={inputs.mismatchRatio} onChange={(e) => updateInput('mismatchRatio', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {isMevo && (
                    <div className="space-y-6">
                        <div ref={el => { fieldRefs.current['mevoSalvageable'] = el; }}>
                            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
                                {inputs.time === '0_6' ? "Imaging Profile (0-6h)" : "Salvageable Tissue (6-24h)"}
                            </h3>
                            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 mb-3 border border-slate-200">
                                {inputs.time === '0_6' ? (
                                     <span><strong>Favorable Profile defined as ANY of:</strong><br/>• No large established infarct (NCCT/MRI)<br/>• Moderate/Good Collaterals<br/>• Perfusion Mismatch</span>
                                ) : (
                                     <span><strong>Salvageable Tissue defined as:</strong><br/>• Clinical-Core Mismatch<br/>• Perfusion Mismatch (Penumbra)</span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <SelectionCard 
                                    title="Yes" 
                                    description={inputs.time === '0_6' ? "Favorable profile present" : "Evidence of penumbra"} 
                                    selected={inputs.mevoSalvageable === 'yes'} 
                                    onClick={() => updateInput('mevoSalvageable', 'yes')} 
                                />
                                <SelectionCard 
                                    title="No" 
                                    description={inputs.time === '0_6' ? "Large infarct / Poor collaterals" : "Large core / No mismatch"} 
                                    selected={inputs.mevoSalvageable === 'no'} 
                                    onClick={() => updateInput('mevoSalvageable', 'no')} 
                                />
                            </div>
                            <LearningPearl 
                                title="MeVO Imaging Selection" 
                                content="For MeVO, absence of a large established core may be more important than formal perfusion mismatch in early windows. Editorials emphasize individualized selection rather than strict perfusion thresholds." 
                            />
                        </div>
                        <div ref={el => { fieldRefs.current['mevoTechnical'] = el; }}>
                            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Technical Feasibility</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <SelectionCard title="Low Procedural Risk" description="Accessible anatomy, low tortuosity, operator confidence." selected={inputs.mevoTechnical === 'yes'} onClick={() => updateInput('mevoTechnical', 'yes')} />
                                <SelectionCard title="High Risk / Difficult Access" description="Tortuous anatomy, distal location risk." selected={inputs.mevoTechnical === 'no'} onClick={() => updateInput('mevoTechnical', 'no')} />
                            </div>
                            <LearningPearl 
                                title="Procedural Risks" 
                                content="Distal access increases perforation and hemorrhage risk. Operator experience and device choice significantly influence MeVO outcomes." 
                            />
                        </div>
                    </div>
                )}

                {/* Section 2 complete nudge — prompt user to tap Next */}
                {isSection2Complete && (
                    <div className="mt-5 flex items-center gap-2 px-4 py-3 bg-neuro-50 dark:bg-neuro-900/30 border border-neuro-200 dark:border-neuro-700 rounded-xl text-sm font-semibold text-neuro-700 dark:text-neuro-300 animate-in fade-in duration-300">
                        <ChevronRight size={16} className="flex-shrink-0" />
                        <span>Imaging complete — tap <strong>Next</strong> to see your eligibility result</span>
                    </div>
                )}
            </div>
        </CollapsibleSection>
        </div>

        <div ref={el => { sectionRefs.current[3] = el; }} className="scroll-mt-4">
        <CollapsibleSection
          title="Decision"
          stepNumber={4}
          totalSteps={4}
          isCompleted={isSection3Complete}
          isActive={activeSection === 3}
          onToggle={() => handleSectionToggle(3)}
          summary={getSummary(3)}
        >
             {result && (<div className="space-y-6 animate-in zoom-in-95 duration-300">
                <div className={`p-8 rounded-3xl relative overflow-hidden shadow-xl text-white ${
                    result.variant === 'success' ? 'bg-emerald-600' :
                    result.variant === 'warning' ? 'bg-amber-500' :
                    result.variant === 'danger' ? 'bg-red-600' :
                    result.eligible ? 'bg-slate-900' : 'bg-slate-700'
                }`}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"><Activity size={12} /><span>Recommendation</span></div>
                        <div className="mb-6"><div className="text-4xl font-black tracking-tight">{result.status}</div>{result.criteriaName && <div className="text-lg font-medium opacity-90 mt-1">{result.criteriaName}</div>}</div>
                        <div className="pt-6 border-t border-white/20">
                             <div className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">Reasoning</div>
                             <div className="text-lg font-bold">{result.reason}</div>
                             <div className="text-sm opacity-90 mt-1 leading-relaxed">{autoLinkReactNodes(result.details, openTrial)}</div>
                        </div>
                    </div>
                </div>

                {/* Risk & Evidence Box for MeVO */}
                {isMevo && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center space-x-2 mb-4 text-amber-800">
                            <ShieldAlert size={20} />
                            <h3 className="font-bold text-sm uppercase tracking-wide">MeVO Risk & Evidence</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-amber-900">
                            <li className="flex items-start">
                                <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></span>
                                <span><strong>ESCAPE-MeVO (2025):</strong> No functional benefit at 90d overall. Higher sICH rate and trend toward higher mortality in EVT arm.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></span>
                                <span><strong>DISTAL (2025):</strong> Neutral primary outcome. Higher sICH in EVT arm (5.9% vs 2.6%). Reperfusion rates were lower than typical LVO trials.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></span>
                                <span><strong>Synthesis:</strong> Be cautious in older patients, those with mild deficits, or baseline disability. Benefit is most plausible for dominant M2/M3 occlusions with disabling deficits.</span>
                            </li>
                        </ul>
                    </div>
                )}

                {/* Summary Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assessment Summary</h4>
                    <ul className="space-y-3 text-sm text-slate-700 font-medium">
                        <li className="flex justify-between border-b border-slate-50 pb-2"><span>Type</span><span className="font-bold">{isLvo ? (isBasilar ? 'LVO (Basilar)' : 'LVO (Anterior)') : 'MeVO'}</span></li>
                        <li className="flex justify-between border-b border-slate-50 pb-2"><span>Time</span><span className="font-bold">{inputs.time === '0_6' ? '0-6h' : '6-24h'}</span></li>
                        {isLvo && <li className="flex justify-between border-b border-slate-50 pb-2"><span>NIHSS</span><span className="font-bold">{inputs.nihss.replace('_', '-').replace('plus', '+')}</span></li>}
                        {isMevo && (
                            <>
                                <li className="flex justify-between border-b border-slate-50 pb-2"><span>Location</span><span className="font-bold">{inputs.mevoLocation.replace('_', ' ').toUpperCase()}</span></li>
                                <li className="flex justify-between border-b border-slate-50 pb-2"><span>NIHSS</span><span className="font-bold">{inputs.nihssNumeric}</span></li>
                                <li className="flex justify-between border-b border-slate-50 pb-2"><span>Disabling</span><span className="font-bold capitalize">{inputs.mevoDisabling}</span></li>
                            </>
                        )}
                        {inputs.time === '0_6' && isLvo && !isBasilar && (<li className="flex justify-between"><span>ASPECTS</span><span className="font-bold">{inputs.aspects || '--'}</span></li>)}
                        {inputs.time === '6_24' && isLvo && !isBasilar && (<>
                          {inputs.aspects && <li className="flex justify-between border-b border-slate-50 pb-2"><span>ASPECTS</span><span className="font-bold">{inputs.aspects}</span></li>}
                          {inputs.core && <li className="flex justify-between border-b border-slate-50 pb-2"><span>Core Vol</span><span className="font-bold">{inputs.core} ml</span></li>}
                          {inputs.mismatchRatio && <li className="flex justify-between"><span>Mismatch Ratio</span><span className="font-bold">{inputs.mismatchRatio}</span></li>}
                        </>)}
                        {isBasilar && (<li className="flex justify-between"><span>pc-ASPECTS</span><span className="font-bold">{inputs.pcAspects || '--'}</span></li>)}
                    </ul>
                </div>

                <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <div>
                        <strong>Decision Support Only.</strong>
                        <p className="mt-1">{autoLinkReactNodes("Based on AHA/ASA Guidelines and major trials (DAWN, DEFUSE-3, SELECT2, ESCAPE-MeVO, DISTAL, ATTENTION, BAOCHE). Always verify clinical details.", openTrial)}</p>
                        
                        {/* NEW DISCLAIMERS */}
                        <p className="mt-3 pt-3 border-t border-slate-200">
                             <strong>Clinical Context:</strong> Always discuss with Vascular Neurology and the Neurointerventional/Interventional Neurology team; local protocols and anatomy-specific factors apply.
                        </p>
                    </div>
                </div>
                
                <LearningPearl
                    title="Clinical Context Summary"
                    content={
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong>Evidence:</strong> Strong for LVO (Anterior & Basilar), evolving for MeVO.</li>
                            <li><strong>Selection:</strong> Imaging guides eligibility, but clinical judgment on disability vs risk is paramount.</li>
                            <li><strong>Team:</strong> Multidisciplinary discussion is critical for complex or borderline cases.</li>
                        </ul>
                    }
                />
             </div>)}
        </CollapsibleSection>
        </div>
      </div>

      <div id="evt-action-bar" className={`mt-8 pt-4 md:border-t border-slate-100 scroll-mt-4 ${isInModal ? 'static' : 'fixed bottom-[4.5rem] md:static'} left-0 right-0 ${isInModal ? 'bg-transparent' : 'bg-white/95 backdrop-blur md:bg-transparent'} p-4 md:p-0 border-t md:border-0 ${isInModal ? '' : 'z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none'}`}>
         <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
             <button onClick={handleBack} disabled={activeSection === 0} aria-hidden={activeSection === 0} className={`px-6 py-3 border border-slate-200 rounded-xl font-bold transition-colors duration-150 min-h-[44px] touch-manipulation active:scale-95 transform-gpu focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${activeSection === 0 ? 'opacity-0 pointer-events-none cursor-not-allowed' : 'bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}>Back</button>
             {activeSection === 3 && (<button onClick={handleReset} className="hidden md:flex items-center text-slate-500 hover:text-neuro-500 font-bold px-4 py-2 rounded-lg transition-colors duration-150 min-h-[44px] touch-manipulation active:scale-95 transform-gpu focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"><RotateCcw size={16} className="mr-2" /> Start Over</button>)}
             {activeSection < 3 ? (<button onClick={handleNext} className="flex-1 md:flex-none px-8 py-3 bg-neuro-500 text-white rounded-xl font-bold hover:bg-teal-500 shadow-lg shadow-neuro-200 transition-colors duration-150 flex items-center justify-center active:scale-95 transform-gpu min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">Next <ChevronRight size={16} className="ml-2" /></button>) : (customActionButton ? (
               <button onClick={customActionButton.onClick} className="flex-1 md:flex-none px-8 py-3 bg-neuro-500 text-white rounded-xl font-bold hover:bg-teal-500 shadow-lg shadow-neuro-200 transition-colors duration-150 flex items-center justify-center active:scale-95 transform-gpu min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">
                 {customActionButton.icon && <span className="mr-2">{customActionButton.icon}</span>}
                 {customActionButton.label}
               </button>
             ) : (
               <button onClick={copySummary} className="flex-1 md:flex-none px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg transition-colors duration-150 flex items-center justify-center active:scale-95 transform-gpu min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"><Copy size={16} className="mr-2" /> Copy to EMR</button>
             ))}
         </div>
         {activeSection === 3 && (<div className="md:hidden mt-4 text-center"><button onClick={handleReset} className="text-sm text-slate-400 font-bold flex items-center justify-center w-full p-3 hover:bg-slate-50 rounded-lg transition-colors duration-150 min-h-[44px] touch-manipulation active:scale-95 transform-gpu focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"><RotateCcw size={14} className="mr-2" /> Start Over</button></div>)}
      </div>

      {activeSection === 3 && (
          <div className="mt-12 border-t border-slate-100 pt-8 pb-8">
              <h3 className="text-sm font-bold text-slate-900 mb-4">References</h3>
              <ul className="space-y-3 text-xs text-slate-500">
                  <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">1</span>{autoLinkReactNodes("DAWN & DEFUSE 3 Trials (2018): Extended window thrombectomy.", openTrial)}</li>
                  <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">2</span>{autoLinkReactNodes("SELECT2 & ANGEL-ASPECT (2023): Large core thrombectomy.", openTrial)}</li>
                  <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">3</span>{autoLinkReactNodes("ESCAPE-MeVO & DISTAL Trials (2025): Medium vessel occlusion thrombectomy.", openTrial)}</li>
                  <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">4</span>{autoLinkReactNodes("ATTENTION (2022) & BAOCHE (2022): Basilar Artery Occlusion thrombectomy.", openTrial)}</li>
              </ul>
          </div>
      )}
      {showFavToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-200 z-[60]">
          {isFav ? 'Saved to Favorites' : 'Removed from Favorites'}
        </div>
      )}
      {showCopyToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-200 z-[60]">
          ✓ Assessment copied to clipboard
        </div>
      )}
    </div>
  );
};

export default EvtPathway;
