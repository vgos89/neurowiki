import React, { useState } from 'react';
import { Info, CheckCircle, Copy, Check, Printer } from 'lucide-react';
import type { Step1Data } from './CodeModeStep1';
import type { Step2Data } from './CodeModeStep2';

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
}

interface CodeModeStep3Props {
  step1Data: Step1Data;
  step2Data: Step2Data;
  step4Orders?: string[];
  milestones?: MilestonesInput;
  timerStartTime?: Date;
  thrombectomyRecommendation?: string;
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
    note += 'GWTG STROKE CODE SUMMARY (Get With The Guidelines)\n';
    note += '==================================================\n\n';

    note += '1. LAST KNOWN WELL (LKW) / LAST KNOWN NORMAL (LKN):\n';
    note += step1Data?.lkwUnknown ? '- LKW: Unknown (wake-up/unwitnessed)\n' : `- LKW: ${step1Data?.lkwTimestamp ? step1Data.lkwTimestamp.toLocaleString() : `${step1Data?.lkwHours?.toFixed(1) ?? '—'} hours ago`}\n`;
    if (step1Data?.symptomDiscoveryTime && !step1Data?.lkwUnknown) {
      note += `- Time of symptom discovery: ${step1Data.symptomDiscoveryTime.toLocaleString()}\n`;
    }
    if (step1Data?.lowGlucoseGuidanceViewed) {
      note += '- Low glucose (<50) guidance reviewed: treat with dextrose, recheck glucose, reassess for tPA if symptoms persist (AHA).\n';
    }
    note += '\n';

    note += '2. HOSPITAL ARRIVAL (DOOR TIME):\n';
    note += `- Door time: ${door ? door.toLocaleString() : '—'}\n\n`;

    note += '3. NEUROLOGIST EVALUATION:\n';
    note += `- Neurologist evaluation: ${milestones?.neurologistEvaluationTime ? milestones.neurologistEvaluationTime.toLocaleString() : '—'}\n\n`;

    note += '4. BRAIN IMAGING TIMES:\n';
    note += `- CT ordered: ${milestones?.ctOrderedTime ? milestones.ctOrderedTime.toLocaleString() + (doorToCTOrderedMin != null ? ` (${doorToCTOrderedMin} min from door)` : '') : '—'}\n`;
    const ctFirstImageSuffix = doorToCTMin != null
      ? ' (' + doorToCTMin + ' min from door' + (ctFirstImageMetTarget ? ', target ≤25)' : ')')
      : '';
    const ctFirstImageStr = milestones?.ctFirstImageTime
      ? milestones.ctFirstImageTime.toLocaleString() + ctFirstImageSuffix
      : doorToCTMin != null ? doorToCTMin + ' min from door' : '—';
    note += `- CT first image: ${ctFirstImageStr}\n`;
    const ctInterpretedSuffix = doorToCTInterpretedMin != null
      ? ' (' + doorToCTInterpretedMin + ' min from door' + (ctInterpretedMetTarget ? ', target ≤45)' : ')')
      : '';
    const ctInterpretedStr = milestones?.ctInterpretedTime
      ? milestones.ctInterpretedTime.toLocaleString() + ctInterpretedSuffix
      : '—';
    note += `- CT interpreted: ${ctInterpretedStr}\n`;
    note += `- CT Result: ${step2Data?.ctResult === 'bleed' ? 'Bleed/ICH' : step2Data?.ctResult === 'no-bleed' ? 'No acute hemorrhage' : step2Data?.ctResult ?? '—'}\n`;
    note += `- CTA: ${step2Data?.ctaOrdered ? 'Ordered' : 'Not ordered'}\n`;
    note += `- LVO: ${step2Data?.lvoPresent === true ? 'Yes' : step2Data?.lvoPresent === false ? 'No' : step2Data?.thrombectomyPlan ?? '—'}\n\n`;

    note += '5. TREATMENT TIMES:\n';
    note += `- Door-to-Needle: ${doorToNeedleMin != null ? `${doorToNeedleMin} min (target ≤60${needleBest ? ', best ≤30' : needleOptimal ? ', optimal ≤45' : ''})` : '—'}\n`;
    if (step1Data?.lkwTimestamp && lkwToNeedleMin != null) {
      note += `- LKW-to-Needle: ${lkwToNeedleMin} min (must be ≤4.5h for standard IV tPA)\n`;
      if (arriveBy35TreatBy45 !== null) {
        note += `- Arrive by 3.5h, treat by 4.5h (GWTG): ${arriveBy35TreatBy45 ? 'Met' : 'Not met'}\n`;
      }
    }
    note += `- Agent: ${treatmentLabel}\n\n`;

    note += '6. THROMBECTOMY (if applicable):\n';
    if (milestones?.groinPunctureTime || milestones?.firstDeviceTime || milestones?.firstReperfusionTime) {
      note += `- Door to groin puncture: ${doorToGroinMin != null ? `${doorToGroinMin} min` : '—'}\n`;
      note += `- First device deployment: ${milestones?.firstDeviceTime ? milestones.firstDeviceTime.toLocaleString() : '—'}\n`;
      note += `- First reperfusion: ${milestones?.firstReperfusionTime ? milestones.firstReperfusionTime.toLocaleString() : '—'}\n`;
    } else {
      note += '- Not applicable / not recorded\n';
    }
    note += '\n';

    note += '7. ORDERS PLACED:\n';
    if (step4Orders?.length) {
      step4Orders.forEach((order) => {
        note += `- ${order}\n`;
      });
    } else {
      note += '- None selected\n';
    }
    note += '\n';

    if (thrombectomyRecommendation) {
      note += 'THROMBECTOMY / NEXT STEPS:\n';
      note += `${thrombectomyRecommendation}\n`;
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
    <div className="space-y-6">
      {/* Incomplete data warning */}
      {(!hasStep1 || !hasStep2) && (
        <div className="rounded-lg p-4 bg-amber-50 border border-amber-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Incomplete data</p>
            <p className="text-sm text-amber-800 mt-1">
              Some fields are missing from earlier steps. You can still copy a partial note to EMR.
            </p>
          </div>
        </div>
      )}

      {/* 1. Code Summary Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Stroke Code Summary & Documentation
        </h3>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {doorTime && (
            <span>Door: {doorTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          )}
          {milestones?.neurologistEvaluationTime && (
            <span>Neuro eval: {milestones.neurologistEvaluationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
          {totalDurationMin != null && (
            <span className="font-mono font-semibold text-slate-800">
              Duration: {totalDurationMin} min
            </span>
          )}
        </div>
      </div>

      {/* 2. Clinical Data Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900 mb-3">Clinical Data</h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-slate-500">LKW</dt>
            <dd className="font-medium text-slate-900">
              {step1Data?.lkwUnknown ? 'Unknown' : step1Data?.lkwTimestamp ? step1Data.lkwTimestamp.toLocaleString() : `${step1Data?.lkwHours?.toFixed(1) ?? '—'}h ago`}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">NIHSS</dt>
            <dd className="font-medium text-slate-900">{step1Data?.nihssScore ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">BP</dt>
            <dd className="font-medium text-slate-900">
              {step1Data?.systolicBP ?? '—'}/{step1Data?.diastolicBP ?? '—'} mmHg
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Glucose</dt>
            <dd className="font-medium text-slate-900">{step1Data?.glucose ?? '—'} mg/dL</dd>
          </div>
          <div>
            <dt className="text-slate-500">Weight</dt>
            <dd className="font-medium text-slate-900">
              {step1Data?.weightValue ?? '—'} {step1Data?.weightUnit ?? 'kg'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">CT Result</dt>
            <dd className="font-medium text-slate-900">
              {step2Data?.ctResult === 'bleed' ? 'Bleed/ICH' : step2Data?.ctResult === 'no-bleed' ? 'No acute hemorrhage' : step2Data?.ctResult ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Treatment</dt>
            <dd className="font-medium text-slate-900">{treatmentLabel}</dd>
          </div>
        </dl>
      </div>

      {/* 3. Milestones Timeline */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900 mb-3">Milestones</h4>
        <ul className="space-y-2">
          {milestones?.ctOrderedTime && doorToCTOrderedMin != null && (
            <li className="flex items-center justify-between gap-4">
              <span className="text-slate-700">CT ordered</span>
              <span className="font-mono text-sm text-slate-600">{doorToCTOrderedMin} min from door</span>
            </li>
          )}
          {doorToCTMin != null && (
            <li className="flex items-center justify-between gap-4">
              <span className="text-slate-700">CT first image</span>
              <span
                className={`font-mono font-semibold px-2 py-1 rounded ${
                  ctFirstImageMetTarget
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {doorToCTMin} min {ctFirstImageMetTarget ? '✓' : '(target ≤25)'}
              </span>
            </li>
          )}
          {milestones?.ctInterpretedTime && doorToCTInterpretedMin != null && (
            <li className="flex items-center justify-between gap-4">
              <span className="text-slate-700">CT interpreted</span>
              <span
                className={`font-mono font-semibold px-2 py-1 rounded ${
                  ctInterpretedMetTarget
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {doorToCTInterpretedMin} min {ctInterpretedMetTarget ? '✓' : '(target ≤45)'}
              </span>
            </li>
          )}
          {doorToNeedleMin != null && (
            <li className="flex items-center justify-between gap-4">
              <span className="text-slate-700">Door-to-Needle</span>
              <span
                className={`font-mono font-semibold px-2 py-1 rounded ${
                  needleMetTarget
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {doorToNeedleMin} min {needleMetTarget ? '✓' : '(target ≤60)'}
              </span>
            </li>
          )}
          {lkwToNeedleMin != null && (
            <li className="flex items-center justify-between gap-4">
              <span className="text-slate-700">LKW-to-Needle</span>
              <span className="font-mono text-sm text-slate-600">{lkwToNeedleMin} min (≤4.5h)</span>
            </li>
          )}
          {doorToGroinMin != null && (
            <li className="flex items-center justify-between gap-4">
              <span className="text-slate-700">Door to groin puncture</span>
              <span className="font-mono text-sm text-slate-600">{doorToGroinMin} min</span>
            </li>
          )}
          {doorToCTMin == null && doorToNeedleMin == null && doorToGroinMin == null && (
            <li className="text-slate-500 text-sm">No milestone times recorded.</li>
          )}
        </ul>
      </div>

      {/* 4. Orders Summary */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900 mb-3">Orders Summary</h4>
        {step4Orders?.length ? (
          <ul className="space-y-1.5 text-sm text-slate-700">
            {step4Orders.map((order, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>{order}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No orders selected.</p>
        )}
      </div>

      {/* 5. Thrombectomy recommendation */}
      {thrombectomyRecommendation && (
        <div className="rounded-lg p-4 bg-purple-50 border border-purple-200">
          <h4 className="text-sm font-semibold text-purple-900 mb-2">Thrombectomy / Next Steps</h4>
          <p className="text-sm text-purple-800 whitespace-pre-wrap">{thrombectomyRecommendation}</p>
        </div>
      )}

      {/* 6. EMR Note Preview & Action Buttons */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900 mb-3">EMR Note</h4>
        <pre className="text-xs font-mono text-slate-700 bg-white p-4 rounded-lg border border-slate-200 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
          {generateEMRNote()}
        </pre>
        <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-900">Code complete</p>
            <p className="text-sm text-emerald-800">Copy to EMR for handoff.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            type="button"
            onClick={handleCopyToEMR}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
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
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Summary
          </button>
        </div>
      </div>
    </div>
  );
};
