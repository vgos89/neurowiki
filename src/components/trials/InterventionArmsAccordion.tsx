/**
 * InterventionArmsAccordion
 *
 * Renders the "Study Arms" card when tm.armDetails is present and non-empty.
 * Renders nothing otherwise — allows graceful degradation for not-yet-migrated trials.
 *
 * Each arm is a collapsible panel (header button + controlled body region).
 * First panel defaults open; others collapsed.
 * Role tag colors: intervention = emerald family, control = slate, comparator = slate.
 *
 * ARIA: each header is a <button> with aria-expanded / aria-controls.
 * Keyboard: Enter/Space toggle panel. Accessibility-specialist will do a full pass.
 *
 * Token rules (design-tokens skill):
 *   - Card: bg-white border border-slate-100 rounded-xl
 *   - Section label: text-[10px] font-bold uppercase tracking-widest text-slate-400 (eyebrow at card header — matches all sibling sections)
 *   - Body text: text-xs text-slate-700 / text-sm text-slate-600
 *   - Intervention role tag: bg-emerald-50 text-emerald-700 border border-emerald-200
 *   - Control / comparator role tag: bg-slate-100 text-slate-600 (slate-500 fails 4.5:1)
 *   - No gray-* / border-2 / shadow-sm / arbitrary values
 */

import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import type { TrialMetadata, ArmDetail } from '../../data/trialData';

// ─── Role tag ────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<ArmDetail['role'], string> = {
  intervention: 'Intervention',
  control: 'Control',
  comparator: 'Comparator',
};

const ROLE_CLASS: Record<ArmDetail['role'], string> = {
  intervention:
    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200',
  // slate-600 (#475569) on slate-100 (#f1f5f9) = 4.7:1 — passes 4.5:1 for normal text
  control:
    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600',
  comparator:
    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600',
};

// ─── Arm panel ───────────────────────────────────────────────────────────────

interface ArmPanelProps {
  arm: ArmDetail;
  defaultOpen?: boolean;
}

const FIELD_LABELS: Array<[keyof ArmDetail, string]> = [
  ['agent', 'Agent'],
  ['dose', 'Dose'],
  ['route', 'Route'],
  ['frequency', 'Frequency'],
  ['duration', 'Duration'],
  ['coInterventions', 'Co-interventions'],
];

function ArmPanel({ arm, defaultOpen = false }: ArmPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  const populatedFields = FIELD_LABELS.filter(
    ([key]) => arm[key] != null && String(arm[key]).trim().length > 0
  );

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      {/* Panel header */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-inset hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm font-medium text-slate-800 leading-snug truncate">
            {arm.arm}
          </span>
          {/* The role text "Intervention" / "Control" / "Comparator" is included in the
              button's computed accessible name via normal text-content accumulation.
              No aria-label on this span is needed or useful here. */}
          <span className={ROLE_CLASS[arm.role]}>
            {ROLE_LABEL[arm.role]}
          </span>
        </div>
        <ChevronDown
          className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        />
      </button>

      {/* Panel body */}
      <div id={bodyId} hidden={!open} className="px-4 pt-3 pb-4">
        {populatedFields.length > 0 && (
          <dl className="space-y-2 mt-1">
            {populatedFields.map(([key, label]) => (
              <div key={key} className="flex gap-3">
                <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400 w-28 flex-shrink-0 pt-0.5">
                  {label}
                </dt>
                <dd className="text-xs text-slate-700 leading-relaxed min-w-0">
                  {String(arm[key])}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {arm.note && (
          <p className="text-xs text-slate-600 leading-relaxed mt-3 pt-3 border-t border-slate-100">
            {arm.note}
          </p>
        )}
        {populatedFields.length === 0 && !arm.note && (
          <p className="text-xs text-slate-500 mt-1">No additional detail available.</p>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface InterventionArmsAccordionProps {
  tm: TrialMetadata;
}

export function InterventionArmsAccordion({ tm }: InterventionArmsAccordionProps) {
  if (!tm.armDetails || tm.armDetails.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      {/* Card header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Study Arms
        </p>
      </div>

      {/* Accordion panels */}
      <div>
        {tm.armDetails.map((arm, i) => (
          <ArmPanel key={i} arm={arm} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
}

