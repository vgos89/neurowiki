/**
 * HeadacheSafetyScreen — Frame 1 of the v4 headache pathway.
 *
 * The SNNOOP10 safety gate, built to the approved mockup + PM spec §5.3
 * "read-then-decide": the warning signs render as a READABLE list inside the
 * house amber caution card (PitfallNotice idiom), never tap-to-select, with
 * exactly two primary actions below — a dominant "None of these, continue" and
 * a secondary "One or more present, go to workup."
 *
 * Tapping the secondary reveals the workup specifier (PM spec §2a): NOW the
 * flags are legitimately multi-check chips (the clinician has committed to
 * "flags present" and is tagging which), and the selected `rf-*` ChipIds flow
 * up so the page's `anyRedFlagActive(selected)` short-circuit routes to the
 * secondary-workup result (clinical gate: SNNOOP10 gate runs before any
 * pattern question).
 *
 * SNNOOP10 content is the reviewed set from the prior pathway (12 flags), held
 * verbatim so the existing clinical review carries; surfaced as Do et al. 2019
 * per the clinical gate (the mockup's "Mitsikostas 2017" display copy was an
 * editorial slip). No data-claim tags: these are elicitation labels, not
 * registered claims, matching the prior page.
 */
import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import type { ChipId } from '../../../data/clinicHeadacheData';

interface SnnoopFlag {
  chipId: ChipId;
  title: string;
  detail: string;
}

// 12 SNNOOP10 warning signs, verbatim from the reviewed prior pathway
// (rf-* ChipIds match the engine's red-flag group; anyRedFlagActive consumes them).
const SNNOOP10_FLAGS: SnnoopFlag[] = [
  { chipId: 'rf-onset-sudden', title: 'Thunderclap onset', detail: 'Sudden, peak in seconds' },
  { chipId: 'rf-neuro-deficit', title: 'Focal neurologic deficit or seizure', detail: 'New weakness, aphasia, vision change' },
  { chipId: 'rf-systemic', title: 'Fever, weight loss, or systemic illness', detail: 'Constitutional symptoms' },
  { chipId: 'rf-older-age-onset', title: 'First-ever headache after age 50', detail: 'New onset late in life' },
  { chipId: 'rf-pregnancy', title: 'Pregnancy or postpartum', detail: 'Includes 6 weeks postpartum' },
  { chipId: 'rf-posttraumatic', title: 'Posttraumatic onset', detail: 'Follows head injury' },
  { chipId: 'rf-papilloedema', title: 'Papilloedema on exam', detail: 'Optic disc swelling' },
  { chipId: 'rf-valsalva', title: 'Triggered by cough, sneeze, or exercise', detail: 'Valsalva manoeuvre' },
  { chipId: 'rf-positional', title: 'Worse standing or supine', detail: 'Positional component' },
  { chipId: 'rf-pattern-change', title: 'Recent pattern change', detail: 'Different from prior headaches' },
  { chipId: 'rf-immune-pathology', title: 'Immunosuppression, HIV, or cancer history', detail: 'Risk for opportunistic causes' },
  { chipId: 'rf-painkiller-overuse', title: 'Painkiller use 10 to 15 days a month or more', detail: 'Medication-overuse headache risk' },
];

export interface HeadacheSafetyScreenProps {
  /** No red flags — advance to the pattern questions. */
  onNoFlags: () => void;
  /** One or more flags tagged — route to secondary workup with these rf-* chips. */
  onFlagsConfirmed: (flags: Set<ChipId>) => void;
}

export const HeadacheSafetyScreen: React.FC<HeadacheSafetyScreenProps> = ({ onNoFlags, onFlagsConfirmed }) => {
  const [mode, setMode] = useState<'read' | 'specify'>('read');
  const [selected, setSelected] = useState<Set<ChipId>>(new Set());

  const toggle = (chipId: ChipId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(chipId)) next.delete(chipId);
      else next.add(chipId);
      return next;
    });
  };

  if (mode === 'specify') {
    return (
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Step 1 · Workup</div>
        <h2 className="text-[22px] font-medium tracking-[-0.01em] text-slate-900 leading-snug mt-2">
          Which warning signs are present?
        </h2>
        <p className="text-sm text-slate-600 leading-[1.55] mt-1.5">
          Tag each one that applies. The workup recommendation is built from what you select.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {SNNOOP10_FLAGS.map(flag => {
            const on = selected.has(flag.chipId);
            return (
              <button
                key={flag.chipId}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(flag.chipId)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-full text-[13px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 ${
                  on
                    ? 'bg-neuro-500 border-neuro-500 text-white font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 font-medium hover:bg-slate-50'
                }`}
              >
                {flag.title}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            disabled={selected.size === 0}
            onClick={() => onFlagsConfirmed(selected)}
            className="w-full bg-neuro-500 hover:bg-neuro-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[15px] font-semibold rounded-xl px-5 min-h-[52px] flex items-center justify-center gap-1.5 transition-colors"
          >
            Continue to workup
            <ChevronRight className="w-[18px] h-[18px]" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setMode('read')}
            className="w-full bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl px-5 min-h-[48px] flex items-center justify-center gap-2 border border-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            Back to the list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Step 1 of ~6 · Safety check</div>
      <h2 className="text-[22px] font-medium tracking-[-0.01em] text-slate-900 leading-snug mt-2">
        Before pattern-matching: any of these red flags?
      </h2>
      <p className="text-sm text-slate-600 leading-[1.55] mt-1.5">
        Read the list. These point to a secondary cause that needs workup before any pattern fits.
      </p>

      {/* Readable SNNOOP10 list inside the house amber caution card (PitfallNotice idiom).
          Informational, NOT tap-to-select. */}
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <div className="flex items-center gap-1.5 px-1 pb-1">
          <AlertTriangle className="w-[14px] h-[14px] text-amber-600 shrink-0" aria-hidden="true" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">SNNOOP10 warning signs</span>
        </div>
        <ul>
          {SNNOOP10_FLAGS.map((flag, i) => (
            <li
              key={flag.chipId}
              className={`px-1 py-2.5 ${i < SNNOOP10_FLAGS.length - 1 ? 'border-b border-amber-200/60' : ''}`}
            >
              <div className="text-[14px] font-medium text-amber-900 leading-snug">{flag.title}</div>
              <div className="text-[12px] text-amber-800 leading-snug mt-0.5">{flag.detail}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Two primary actions — dominant continue + amber workup escape. */}
      <div className="mt-6 space-y-2.5">
        <button
          type="button"
          onClick={onNoFlags}
          className="w-full bg-neuro-500 hover:bg-neuro-600 text-white text-[15px] font-semibold rounded-xl px-5 min-h-[52px] flex items-center justify-center gap-1.5 transition-colors"
        >
          None of these, continue
          <ChevronRight className="w-[18px] h-[18px]" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setMode('specify')}
          className="w-full bg-white hover:bg-slate-50 text-amber-700 text-sm font-medium rounded-xl px-5 min-h-[48px] flex items-center justify-center gap-2 border border-slate-200 transition-colors"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
          One or more present, go to workup
        </button>
      </div>

      <p className="text-[11.5px] text-slate-400 leading-relaxed mt-5 text-center px-2">
        For reading, not selecting. SNNOOP10 warning signs (Do et al. 2019).
      </p>
    </div>
  );
};
