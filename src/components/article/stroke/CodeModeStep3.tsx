import React, { useState } from 'react';
import { Copy, Check, Printer } from 'lucide-react';
import type { Step1Data } from './CodeModeStep1';
import type { Step2Data } from './CodeModeStep2';
import { ShareButton } from '../../calculators/ShareButton';

/** GWTG-aligned milestones (matches workflow GWTGMilestones) */
export interface MilestonesInput {
  doorTime?: Date | null;
  doorToData?: Date;
  doorToCT?: Date;
  doorToNeedle?: Date;
  lkwTime?: Date | null;
  symptomDiscoveryTime?: Date | null;
  neurologistEvaluationTime?: Date | null;
  ctOrderedTime?: Date | null;
  ctFirstImageTime?: Date | null;
  ctInterpretedTime?: Date | null;
  tpaBolusTime?: Date | null;
  groinPunctureTime?: Date | null;
  firstDeviceTime?: Date | null;
  firstReperfusionTime?: Date | null;
  neuroIrContactedTime?: Date | null;
  nccIcuSignoutTime?: Date | null;
}

interface CodeModeStep3Props {
  step1Data: Step1Data;
  step2Data: Step2Data;
  step4Orders?: string[];
  milestones?: MilestonesInput;
  timerStartTime?: Date;
  thrombectomyRecommendation?: string;
  /** Extended IVT verdict captured from the in-page modal, when launched
   *  from inside Stroke Code. Added 2026-05-17 per V direction so the
   *  late-window outcome is part of the summary + EMR copy. */
  extendedIvtRecommendation?: string;
  /** Called after code summary is successfully copied to clipboard (for toast) */
  onCopySuccess?: () => void;
}

function formatTime(date: Date | undefined): string {
  if (!date) return '—';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function minutesFromStart(start: Date | undefined, end: Date | undefined): number | null {
  if (!start || !end) return null;
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

export const CodeModeStep3: React.FC<CodeModeStep3Props> = ({
  step1Data,
  step2Data,
  step4Orders = [],
  milestones = {},
  timerStartTime,
  thrombectomyRecommendation,
  extendedIvtRecommendation,
  onCopySuccess
}) => {
  const [copied, setCopied] = useState(false);

  const hasStep1 = step1Data && (step1Data.nihssScore != null || step1Data.systolicBP != null);
  const hasStep2 = step2Data && step2Data.ctResult;

  const doorTime = milestones?.doorTime ?? timerStartTime;
  const doorToCTMin = doorTime && milestones?.ctFirstImageTime
    ? minutesFromStart(doorTime, milestones.ctFirstImageTime)
    : doorTime && milestones?.doorToCT
      ? minutesFromStart(doorTime, milestones.doorToCT)
      : null;
  const doorToNeedleMin = doorTime && milestones?.doorToNeedle
    ? minutesFromStart(doorTime, milestones.doorToNeedle)
    : null;
  const doorToCTOrderedMin = doorTime && milestones?.ctOrderedTime ? minutesFromStart(doorTime, milestones.ctOrderedTime) : null;
  const doorToCTInterpretedMin = doorTime && milestones?.ctInterpretedTime ? minutesFromStart(doorTime, milestones.ctInterpretedTime) : null;
  const lkwToNeedleMin = step1Data?.lkwTimestamp && milestones?.doorToNeedle
    ? minutesFromStart(step1Data.lkwTimestamp, milestones.doorToNeedle)
    : null;
  const arriveBy35TreatBy45 = step1Data?.lkwTimestamp && milestones?.doorToNeedle
    ? (minutesFromStart(step1Data.lkwTimestamp, doorTime ?? undefined) ?? 0) <= 210 && (lkwToNeedleMin ?? 0) <= 270
    : null;
  const doorToGroinMin = doorTime && milestones?.groinPunctureTime ? minutesFromStart(doorTime, milestones.groinPunctureTime) : null;

  const totalDurationMin = doorTime
    ? Math.round((new Date().getTime() - doorTime.getTime()) / 60000)
    : timerStartTime
      ? Math.round((new Date().getTime() - timerStartTime.getTime()) / 60000)
      : null;

  const ctFirstImageMetTarget = doorToCTMin != null && doorToCTMin <= 25;
  const ctInterpretedMetTarget = doorToCTInterpretedMin != null && doorToCTInterpretedMin <= 45;
  const needleMetTarget = doorToNeedleMin != null && doorToNeedleMin <= 60;
  const needleOptimal = doorToNeedleMin != null && doorToNeedleMin <= 45;
  const needleBest = doorToNeedleMin != null && doorToNeedleMin <= 30;

  const treatmentLabel = step2Data?.treatmentGiven === 'none' || !step2Data?.treatmentGiven
    ? 'None'
    : step2Data.treatmentGiven === 'tpa'
      ? `tPA ${step2Data.tpaDose ?? ''} mg`
      : step2Data.treatmentGiven === 'tnk'
        ? `TNK ${step2Data.tnkDose ?? ''} mg`
        : (step2Data.treatmentGiven ?? 'None').toUpperCase();

  const generateEMRNote = (): string => {
    const door = doorTime ?? timerStartTime;
    let note = '';
    note += `Stroke Code Summary: ${door ? door.toLocaleString() : new Date().toLocaleString()}\n\n`;

    note += '1. LKW:\n';
    // Em-dash placeholders replaced with "Not entered" so the EMR-paste
    // text reads naturally when fields are blank. (V feedback 2026-05-20.)
    const lkwLine = step1Data?.lkwUnknown
      ? '- LKW: Unknown (wake-up/unwitnessed)\n'
      : step1Data?.lkwTimestamp
        ? `- LKW: ${step1Data.lkwTimestamp.toLocaleString()}\n`
        : step1Data?.lkwHours !== undefined && step1Data.lkwHours !== null
          ? `- LKW: ${step1Data.lkwHours.toFixed(1)} hours ago\n`
          : '- LKW: Not entered\n';
    note += lkwLine;
    if (step1Data?.symptomDiscoveryTime && !step1Data?.lkwUnknown) {
      note += `- Time of symptom discovery: ${step1Data.symptomDiscoveryTime.toLocaleString()}\n`;
    }
    if (step1Data?.lowGlucoseGuidanceViewed) {
      note += '- Low glucose (<50) guidance reviewed: treat with dextrose, recheck glucose, reassess for tPA if symptoms persist (AHA).\n';
    }
    note += '\n';

    note += '2. Door Time:\n';
    note += `- Door time: ${door ? door.toLocaleString() : 'Not entered'}\n\n`;

    note += '3. Neurologist Evaluation:\n';
    note += `- Neurologist evaluation: ${milestones?.neurologistEvaluationTime ? milestones.neurologistEvaluationTime.toLocaleString() : 'Not entered'}\n`;
    note += `- Neuro IR contacted: ${milestones?.neuroIrContactedTime ? milestones.neuroIrContactedTime.toLocaleString() : 'Not entered'}\n`;
    note += `- NCC/ICU sign-out: ${milestones?.nccIcuSignoutTime ? milestones.nccIcuSignoutTime.toLocaleString() : 'Not entered'}\n\n`;

    note += '4. Brain Imaging:\n';
    note += `- CT ordered: ${milestones?.ctOrderedTime ? milestones.ctOrderedTime.toLocaleString() + (doorToCTOrderedMin != null ? ` (${doorToCTOrderedMin} min from door)` : '') : 'Not entered'}\n`;
    const ctFirstImageSuffix = doorToCTMin != null
      ? ' (' + doorToCTMin + ' min from door' + (ctFirstImageMetTarget ? ', target ≤25)' : ')')
      : '';
    const ctFirstImageStr = milestones?.ctFirstImageTime
      ? milestones.ctFirstImageTime.toLocaleString() + ctFirstImageSuffix
      : doorToCTMin != null ? doorToCTMin + ' min from door' : 'Not entered';
    note += `- CT first image: ${ctFirstImageStr}\n`;
    const ctInterpretedSuffix = doorToCTInterpretedMin != null
      ? ' (' + doorToCTInterpretedMin + ' min from door' + (ctInterpretedMetTarget ? ', target ≤45)' : ')')
      : '';
    const ctInterpretedStr = milestones?.ctInterpretedTime
      ? milestones.ctInterpretedTime.toLocaleString() + ctInterpretedSuffix
      : 'Not entered';
    note += `- CT interpreted: ${ctInterpretedStr}\n`;
    note += `- CT Result: ${step2Data?.ctResult === 'bleed' ? 'Bleed/ICH' : step2Data?.ctResult === 'no-bleed' ? 'No acute hemorrhage' : step2Data?.ctResult ?? 'Not entered'}\n`;
    note += `- CTA: ${step2Data?.ctaOrdered ? 'Ordered' : 'Not ordered'}\n`;
    note += `- LVO: ${step2Data?.lvoPresent === true ? 'Yes' : step2Data?.lvoPresent === false ? 'No' : step2Data?.thrombectomyPlan ?? 'Not entered'}\n\n`;

    note += '5. Treatment Times:\n';
    note += `- Door-to-Needle: ${doorToNeedleMin != null ? `${doorToNeedleMin} min (target ≤60${needleBest ? ', best ≤30' : needleOptimal ? ', optimal ≤45' : ''})` : 'Not entered'}\n`;
    if (step1Data?.lkwTimestamp && lkwToNeedleMin != null) {
      note += `- LKW-to-Needle: ${lkwToNeedleMin} min (must be ≤4.5h for standard IV tPA)\n`;
      if (arriveBy35TreatBy45 !== null) {
        note += `- Arrive by 3.5h, treat by 4.5h (GWTG): ${arriveBy35TreatBy45 ? 'Met' : 'Not met'}\n`;
      }
    }
    note += `- Agent: ${treatmentLabel}\n\n`;

    note += '6. Thrombectomy:\n';
    if (milestones?.groinPunctureTime || milestones?.firstDeviceTime || milestones?.firstReperfusionTime) {
      note += `- Door to groin puncture: ${doorToGroinMin != null ? `${doorToGroinMin} min` : 'Not entered'}\n`;
      note += `- First device deployment: ${milestones?.firstDeviceTime ? milestones.firstDeviceTime.toLocaleString() : 'Not entered'}\n`;
      note += `- First reperfusion: ${milestones?.firstReperfusionTime ? milestones.firstReperfusionTime.toLocaleString() : 'Not entered'}\n`;
    } else {
      note += '- Not applicable / not recorded\n';
    }
    note += '\n';

    note += '7. Orders Placed:\n';
    if (step4Orders?.length) {
      step4Orders.forEach((order) => {
        note += `- ${order}\n`;
      });
    } else {
      note += '- None selected\n';
    }
    note += '\n';

    if (thrombectomyRecommendation) {
      note += 'Thrombectomy / Next Steps:\n';
      note += `${thrombectomyRecommendation}\n\n`;
    }

    if (extendedIvtRecommendation) {
      note += 'Extended IVT Assessment:\n';
      note += `${extendedIvtRecommendation}\n`;
    }

    if (totalDurationMin != null) {
      note += `\nTotal code duration: ${totalDurationMin} minutes from door.\n`;
    }
    return note;
  };

  const handleCopyToEMR = async () => {
    try {
      await navigator.clipboard.writeText(generateEMRNote());
      setCopied(true);
      onCopySuccess?.();
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    const content = generateEMRNote();
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<pre style="font-family:monospace;white-space:pre-wrap;padding:1rem;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`);
      win.document.close();
      win.print();
      win.close();
    }
  };

  return (
    <div className="space-y-3 px-1">

      {/* Header status — chassis-aligned 2026-05-24 */}
      <div className="rounded-xl bg-white border border-slate-100 overflow-hidden">
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 min-h-[40px]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Code Summary</p>
          {totalDurationMin != null && (
            <span className="text-xs font-semibold text-slate-500">{totalDurationMin} min from door</span>
          )}
        </div>
        <div className="px-4 py-3 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-900">Code complete — ready to document</p>
        </div>
      </div>

      {/* Clinical summary — chassis-aligned 2026-05-24 */}
      {hasStep1 && (
        <div className="rounded-xl bg-white border border-slate-100 overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 min-h-[40px] flex items-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Clinical Summary</p>
          </div>
          <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">LKW</p>
              <p className="text-sm font-medium text-slate-900">
                {step1Data?.lkwUnknown ? 'Unknown' : step1Data?.lkwTimestamp ? step1Data.lkwTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${step1Data?.lkwHours?.toFixed(1) ?? '—'}h ago`}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">NIHSS</p>
              <p className="text-sm font-medium text-slate-900">{step1Data?.nihssScore ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">BP</p>
              <p className="text-sm font-medium text-slate-900">{step1Data?.systolicBP ?? '—'}/{step1Data?.diastolicBP ?? '—'} mmHg</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Glucose</p>
              <p className="text-sm font-medium text-slate-900">{step1Data?.glucose ?? '—'} mg/dL</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Weight</p>
              <p className="text-sm font-medium text-slate-900">{step1Data?.weightValue ?? '—'} {step1Data?.weightUnit ?? 'kg'}</p>
            </div>
            {hasStep2 && (
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">CT Result</p>
                <p className="text-sm font-medium text-slate-900">
                  {step2Data?.ctResult === 'bleed' ? 'ICH' : step2Data?.ctResult === 'no-bleed' ? 'No hemorrhage' : step2Data?.ctResult ?? '—'}
                </p>
              </div>
            )}
            {hasStep2 && (
              <div className="col-span-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Treatment</p>
                <p className="text-sm font-semibold text-neuro-700">{treatmentLabel}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Milestones — chassis-aligned 2026-05-24. Time-metric pill badges
          (Met / Missed) intentionally kept on their existing flooded
          treatment per PM-spec exception #3 (status pill class). */}
      {(doorToCTMin != null || doorToNeedleMin != null || doorToGroinMin != null || milestones?.ctOrderedTime || milestones?.ctInterpretedTime) && (
        <div className="rounded-xl bg-white border border-slate-100 overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 min-h-[40px] flex items-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">GWTG Milestones</p>
          </div>
          <div className="px-4 py-3 space-y-2">
            {milestones?.ctOrderedTime && doorToCTOrderedMin != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">CT ordered</span>
                <span className="text-sm font-mono text-slate-500">{doorToCTOrderedMin} min</span>
              </div>
            )}
            {doorToCTMin != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">CT first image</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  ctFirstImageMetTarget ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {doorToCTMin} min {ctFirstImageMetTarget ? <Check className="w-3 h-3 inline -mt-0.5" aria-label="met target" /> : '· target ≤25'}
                </span>
              </div>
            )}
            {milestones?.ctInterpretedTime && doorToCTInterpretedMin != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">CT interpreted</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  ctInterpretedMetTarget ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {doorToCTInterpretedMin} min {ctInterpretedMetTarget ? <Check className="w-3 h-3 inline -mt-0.5" aria-label="met target" /> : '· target ≤45'}
                </span>
              </div>
            )}
            {doorToNeedleMin != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Door-to-Needle</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  needleMetTarget ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {doorToNeedleMin} min {needleMetTarget ? <Check className="w-3 h-3 inline -mt-0.5" aria-label="met target" /> : '· target ≤60'}
                </span>
              </div>
            )}
            {lkwToNeedleMin != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">LKW-to-Needle</span>
                <span className="text-sm font-mono text-slate-500">{lkwToNeedleMin} min</span>
              </div>
            )}
            {doorToGroinMin != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Door to groin</span>
                <span className="text-sm font-mono text-slate-500">{doorToGroinMin} min</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Placed — chassis-aligned 2026-05-24 */}
      {step4Orders?.length > 0 && (
        <div className="rounded-xl bg-white border border-slate-100 overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 min-h-[40px] flex items-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Orders Placed</p>
          </div>
          <ul className="px-4 py-3 space-y-1.5">
            {step4Orders.map((order, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-slate-300 mt-0.5">•</span>
                <span>{order}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Thrombectomy / Next Steps — chassis-aligned 2026-05-24 with
          neuro-tinted header bar (this is the branded / primary
          recommendation surface per PM-spec). */}
      {thrombectomyRecommendation && (
        <div className="rounded-xl bg-white border border-slate-100 overflow-hidden">
          <div className="px-4 py-2 bg-neuro-50 border-b border-neuro-100 min-h-[40px] flex items-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neuro-700">Thrombectomy / Next Steps</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{thrombectomyRecommendation}</p>
          </div>
        </div>
      )}

      {/* Extended IVT recommendation — captured when clinician completed
          the Extended IVT modal from inside Stroke Code (added 2026-05-17).
          Chassis-aligned 2026-05-24 to mirror the alert pattern used
          across Steps 1 and 2 (white card + tinted eyebrow header bar
          + slate body). */}
      {extendedIvtRecommendation && (
        <div className="rounded-xl bg-white border border-slate-100 overflow-hidden">
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Extended IVT / Late Window</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{extendedIvtRecommendation}</p>
          </div>
        </div>
      )}

      {/* EMR Note — chassis-aligned 2026-05-24 */}
      <div className="rounded-xl bg-white border border-slate-100 overflow-hidden">
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 min-h-[40px] flex items-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">EMR Note</p>
        </div>
        <div className="px-4 py-3">
          <pre className="text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap mb-3">
            {generateEMRNote()}
          </pre>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopyToEMR}
            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neuro-500 hover:bg-neuro-600 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy to EMR
              </>
            )}
          </button>
          <ShareButton
            text={generateEMRNote}
            title="Stroke Code Summary"
            onResult={(r) => { if (r === 'shared' || r === 'copied') onCopySuccess?.(); }}
            variant="pill"
            label="Send"
          />
          <button
            type="button"
            onClick={handlePrint}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
        </div>
      </div>

    </div>
  );
};
