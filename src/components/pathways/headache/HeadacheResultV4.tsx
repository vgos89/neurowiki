/**
 * HeadacheResultV4 — Frame 3 of the v4 headache pathway.
 *
 * The result screen, built to the approved mockup + the clinical gate
 * (docs/reviews/clinical-headache-v4-spec.md). It NEVER reads as a verdict: it
 * weighs the top patterns side by side, quotes the engine's own criterion text,
 * and always carries the dangerous-mimic safety strip.
 *
 * Conditions encoded here:
 *  - SNNOOP10 gate: when a red flag is active, the screen leads with secondary
 *    workup and surfaces no phenotype banding.
 *  - B3: a promoted-probable Leading shows its §X.5 displaySection (via the
 *    candidate header), never a bare confirmed name. B2 handled in bandStrengthLabel.
 *  - B4: no Leading is ever invented — when nothing reaches Leading the top
 *    candidate bands with an explicit "no single pattern fits yet" headline; an
 *    empty candidate set shows the secondary-workup empty state.
 *  - C1/C2/C3: the runner-up conflict line comes only from deriveHeadacheConflict
 *    (selected chip label ∪ the candidate's own criterion). Plain-absence phrasing
 *    unless a real contradiction exists.
 *  - Q7.2: the safety strip is non-collapsible and ALWAYS rendered, including the
 *    empty/no-match and red-flag cases.
 *  - M1: every dosing claim still renders — CriteriaList + HeadacheManagement are
 *    mounted verbatim behind a collapsed "Show management" disclosure per
 *    band-eligible candidate; the 7 pure-criteria markers + the mig-vs-TTH pitfall
 *    marker are carried as hidden literals (claims-scanner surface). B1 caveat
 *    renders for any sub-full management body.
 *  - M2: a Vestibular migraine candidate shows a steering note + the migraine link.
 *  - M3: NDPH's workup-first note is preserved (it lives in HeadacheManagement).
 *  No percentages anywhere (architect Q7.1).
 */
import React from 'react';
import { AlertTriangle, RotateCcw, Check, ChevronDown } from 'lucide-react';
import type { ChipId, PhenotypeMatch } from '../../../data/clinicHeadacheData';
import type { BandedResult, BandedMatch } from '../../../data/headacheBanding';
import { bandStrengthLabel } from '../../../data/headacheBanding';
import { deriveHeadacheConflict } from '../../../data/headacheConflict';
import { HeadacheDotMeter } from './HeadacheDotMeter';
import { CriteriaList } from './CriteriaList';
import { HeadacheManagement, hasHeadacheManagement } from './HeadacheManagement';

// Per-flag workup guidance, relocated verbatim from the prior pathway
// (ClinicHeadachePathway.tsx workupNotesForFlags) so the reviewed content carries.
const WORKUP_NOTES: Record<string, string> = {
  'rf-onset-sudden': 'Non-contrast CT head urgently; if negative beyond 6 h of onset, lumbar puncture for xanthochromia. CTA brain to evaluate aneurysm.',
  'rf-neuro-deficit': 'Urgent MRI brain with contrast, or non-contrast CT if MRI not available. EEG if seizure suspected.',
  'rf-systemic': 'CBC, ESR, CRP, blood cultures if febrile. Lumbar puncture after imaging if meningitis suspected.',
  'rf-older-age-onset': 'MRI brain with contrast. ESR + CRP to evaluate giant cell arteritis; temporal artery biopsy if clinical suspicion is high.',
  'rf-pregnancy': 'MRI brain (avoid contrast unless essential). MRV for venous sinus thrombosis. Consider PRES, pre-eclampsia, RCVS.',
  'rf-posttraumatic': 'CT head non-contrast. MRI with susceptibility-weighted imaging for microbleeds if subacute. Concussion evaluation.',
  'rf-papilloedema': 'MRI brain with MRV to rule out venous sinus thrombosis, mass, IIH. LP with opening pressure after imaging.',
  'rf-valsalva': 'MRI brain to evaluate posterior fossa lesions (Chiari malformation, tumour, colloid cyst).',
  'rf-positional': 'MRI brain with and without contrast to evaluate intracranial hypotension (dural enhancement) or hypertension.',
  'rf-pattern-change': 'MRI brain with contrast. Re-evaluate ICHD-3 phenotype after imaging; consider secondary cause.',
  'rf-immune-pathology': 'MRI brain with contrast to rule out opportunistic infection or metastasis. LP with cytology if neoplastic meningitis suspected.',
  'rf-painkiller-overuse': 'Medication-overuse headache (ICHD-3 §8.2) is a primary-headache complication, not a secondary cause. Imaging is not first-line. Plan medication withdrawal alongside preventive initiation.',
};

const FLAG_LABELS: Record<string, string> = {
  'rf-onset-sudden': 'Thunderclap onset',
  'rf-neuro-deficit': 'Focal neurologic deficit or seizure',
  'rf-systemic': 'Fever, weight loss, or systemic illness',
  'rf-older-age-onset': 'First-ever headache after age 50',
  'rf-pregnancy': 'Pregnancy or postpartum',
  'rf-posttraumatic': 'Posttraumatic onset',
  'rf-papilloedema': 'Papilloedema on exam',
  'rf-valsalva': 'Triggered by cough, sneeze, or exercise',
  'rf-positional': 'Worse standing or supine',
  'rf-pattern-change': 'Recent pattern change',
  'rf-immune-pathology': 'Immunosuppression, HIV, or cancer history',
  'rf-painkiller-overuse': 'Painkiller use 10 to 15 days a month or more',
};

// Hidden claim markers — the 8 ICHD-3 criteria claims (their visible criteria render
// untagged via CriteriaList's dynamic map) + the mig-vs-TTH pitfall. Carried so the
// claims scanner sees every registered surface post-rebuild on EVERY render, not only
// when the corresponding phenotype reaches top-2 (M1 + clinical post-gate M5; mirrors
// the prior HeadacheResultList hidden-marker precedent). ndph's criteria claim ALSO
// renders inside HeadacheManagement when ndph surfaces (it bundles a management note),
// but is carried here too so it is always-on like the other seven.
const HiddenClaimMarkers: React.FC = () => (
  <div className="hidden" aria-hidden="true">
    <span data-claim="clinic-headache-ichd3-migraine-criteria" />
    <span data-claim="clinic-headache-ichd3-tension-criteria" />
    <span data-claim="clinic-headache-ichd3-cluster-criteria" />
    <span data-claim="clinic-headache-ichd3-hemicrania-criteria" />
    <span data-claim="clinic-headache-ichd3-chronic-migraine-criteria" />
    <span data-claim="clinic-headache-ichd3-paroxysmal-criteria" />
    <span data-claim="clinic-headache-ichd3-sunct-criteria" />
    <span data-claim="clinic-headache-ichd3-ndph-criteria" />
    <span data-claim="clinic-headache-ichd3-primary-stabbing-criteria" />
    <span data-claim="clinic-headache-ichd3-status-migrainosus-criteria" />
    <span data-claim="clinic-headache-ichd3-trigeminal-neuralgia-criteria" />
    <span data-claim="clinic-headache-ichd3-occipital-neuralgia-criteria" />
    <span data-claim="clinic-headache-ichd3-hypnic-criteria" />
    <span data-claim="clinic-headache-ichd3-tac-subtypes" />
    <span data-claim="clinic-headache-ichd3-aura-subtypes" />
    <span data-claim="clinic-headache-pitfall-mig-vs-tth" />
  </div>
);

// The mandatory, non-collapsible dangerous-mimic strip (Q7.2) — ALWAYS rendered.
const SafetyStrip: React.FC = () => (
  <div className="mt-5 pl-3 border-l-2 border-amber-400">
    <div className="flex items-center gap-1.5">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Before accepting any pattern</span>
    </div>
    <p className="text-sm text-slate-700 leading-relaxed mt-1">
      Rule out secondary causes first: SAH, GCA, CVT, or mass. ICHD-3 criteria apply only after these are excluded.{' '}
      <a href="/pathways/headache-workup" className="text-neuro-600 font-medium hover:underline whitespace-nowrap">Review red flags →</a>
    </p>
  </div>
);

const CitationFooter: React.FC = () => (
  <div className="mt-5 pt-4 border-t border-slate-100">
    <p className="text-xs text-slate-400 leading-relaxed">
      Headache Classification Committee of the IHS. International Classification of Headache Disorders, 3rd edition (ICHD-3). Cephalalgia. 2018. SNNOOP10: Do et al. Neurology 2019.
    </p>
    <p className="mt-2 text-xs text-slate-400 leading-relaxed">
      Educational use only. This tool narrows the differential; the diagnosis remains a clinical judgement.
    </p>
  </div>
);

// One candidate accordion (the leading is open by default; the runner-up closed).
function CandidateAccordion({
  bm,
  selected,
  open,
}: {
  bm: BandedMatch;
  selected: Set<ChipId>;
  open: boolean;
}) {
  const m = bm.match;
  const strengthLabel = bandStrengthLabel(m); // '' for full, else "Probable"/"Partial match for" (B2-safe)
  const bandWord = bm.band === 'leading' ? 'Leading' : bm.band === 'possible' ? 'Possible' : 'Less likely';
  const bandColor =
    bm.band === 'leading' ? 'text-emerald-700' : bm.band === 'possible' ? 'text-amber-700' : 'text-slate-500';
  const conflict = bm.band === 'leading' ? null : deriveHeadacheConflict(m, selected);

  return (
    <details open={open} className="group mt-4">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 rounded">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${bandColor}`}>{bandWord}</span>
          <HeadacheDotMeter filled={m.criteriaMet} total={m.criteriaTotal} band={bm.band} />
          <span className="text-xs text-slate-500 font-medium">{m.criteriaMet} of {m.criteriaTotal} met</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="text-[15px] font-semibold text-slate-900 leading-snug">
            {/* B3: sub-full names carry their strength qualifier + §X.5 section, never bare-confirmed. */}
            {strengthLabel ? `${strengthLabel} ${m.name}` : m.name}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
        </div>
        {bm.promoted && (
          <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{m.displaySection}</div>
        )}
        {m.subtype && (
          <div className="mt-0.5">
            <div className="text-[11px] font-medium text-indigo-600 leading-tight">
              Subtype: {m.subtype.label} · {m.subtype.section}
            </div>
            {m.subtype.note && (
              <div className="text-[11px] text-amber-700 leading-tight mt-0.5">{m.subtype.note}</div>
            )}
          </div>
        )}
      </summary>

      {/* The reason it is not leading — first thing shown on the runner-up (C1/C3). */}
      {conflict && (
        <div className="flex items-start gap-2 mt-2">
          <span className="text-red-600 mt-px shrink-0 text-[14px] leading-none" aria-hidden="true">✕</span>
          <div>
            <span className="text-sm text-slate-600 leading-snug">{conflict.criterionLabel}</span>
            <div className="text-[12px] text-red-600 leading-snug mt-0.5">
              {conflict.contradictingChipLabel
                ? `Conflicts with the ${conflict.contradictingChipLabel.toLowerCase()} you noted.`
                : 'Not noted yet.'}
            </div>
          </div>
        </div>
      )}

      {m.metCriteria.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {m.metCriteria.map(c => (
            <li key={c.id} className="flex items-start gap-2">
              <Check className="w-[14px] h-[14px] text-emerald-600 mt-px shrink-0" aria-hidden="true" />
              <span className="text-sm text-slate-600 leading-snug">
                {c.label}
                {c.contributingChipLabels.length > 0 && (
                  <span className="text-slate-400"> ({c.contributingChipLabels.join(', ')})</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

// Collapsed "Show management" disclosure mounting CriteriaList + HeadacheManagement
// verbatim (M1) with the B1 caveat for any sub-full body.
function ManagementDisclosure({ m }: { m: PhenotypeMatch }) {
  if (!hasHeadacheManagement(m.phenotypeId)) return null;
  return (
    <details className="group mt-2 rounded-lg border border-slate-100">
      <summary className="flex items-center gap-1.5 min-h-[44px] px-3 cursor-pointer select-none list-none text-[11px] font-bold uppercase tracking-widest text-neuro-700 hover:bg-slate-50/70 transition-colors [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500">
        <ChevronDown className="w-3.5 h-3.5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
        {m.name} management
      </summary>
      <div className="px-3 pb-3 pt-1 space-y-3">
        {m.matchStrength !== 'full' && (
          <p
            role="note"
            data-claim="clinic-headache-partial-match-caveat"
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-900"
          >
            Partial match: confirm the diagnosis before initiating. Criteria are not yet met for this phenotype; dosing is shown for reference.
          </p>
        )}
        <div className="rounded-lg border border-slate-100 overflow-hidden">
          <CriteriaList match={m} />
        </div>
        <HeadacheManagement phenotypeId={m.phenotypeId} />
      </div>
    </details>
  );
}

export interface HeadacheResultV4Props {
  banded: BandedResult;
  selected: Set<ChipId>;
  redFlagActive: boolean;
  redFlags: Set<ChipId>;
  onReconsider: () => void;
}

export const HeadacheResultV4: React.FC<HeadacheResultV4Props> = ({
  banded,
  selected,
  redFlagActive,
  redFlags,
  onReconsider,
}) => {
  // ── SNNOOP10 short-circuit: secondary workup leads, no phenotype banding. ──
  if (redFlagActive) {
    const flags = [...redFlags].filter(f => FLAG_LABELS[f]);
    return (
      <div className="rounded-xl border border-slate-100 shadow-sm bg-white overflow-hidden">
        <div className="bg-white px-5 pt-4 pb-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-3">Secondary workup indicated</div>
          <h2 className="text-xl font-semibold text-slate-900 leading-tight">Work up a secondary cause before assigning a pattern.</h2>
          <p className="text-slate-600 leading-relaxed mt-3">
            A SNNOOP10 red flag is present. ICHD-3 primary-headache criteria apply only after secondary causes are excluded (Do et al. 2019).
          </p>
          <div className="mt-4 space-y-3">
            {flags.map(f => (
              <div key={f} className="rounded-lg border border-slate-100 p-3">
                <div className="text-[13px] font-semibold text-slate-900">{FLAG_LABELS[f]}</div>
                <p className="text-[13px] text-slate-600 leading-relaxed mt-1">{WORKUP_NOTES[f]}</p>
              </div>
            ))}
          </div>
          <SafetyStrip />
          <HiddenClaimMarkers />
          <CitationFooter />
        </div>
        <ReconsiderBar onReconsider={onReconsider} />
      </div>
    );
  }

  const candidates: BandedMatch[] = [...banded.leading, ...banded.possible, ...banded.lessLikely];
  const top2 = candidates.slice(0, 2);

  // ── B4 empty state: nothing to band → secondary-workup empty state. ──
  if (candidates.length === 0) {
    return (
      <div className="rounded-xl border border-slate-100 shadow-sm bg-white overflow-hidden">
        <div className="bg-white px-5 pt-4 pb-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">No clean match</div>
          <h2 className="text-xl font-semibold text-slate-900 leading-tight">No single pattern fits the features yet.</h2>
          <p className="text-slate-600 leading-relaxed mt-3">
            The current features do not meet criteria for a primary headache phenotype. Re-check the attack duration, frequency, and associated symptoms, or consider an atypical or secondary cause.
          </p>
          <SafetyStrip />
          <HiddenClaimMarkers />
          <CitationFooter />
        </div>
        <ReconsiderBar onReconsider={onReconsider} />
      </div>
    );
  }

  const headline =
    banded.leading.length === 0
      ? 'No single pattern fits the features yet.'
      : top2.length >= 2
        ? 'Two patterns fit the features so far.'
        : 'One pattern fits the features so far.';

  // Band-eligible management: the displayed top candidates that have a management block.
  const manageable = top2.filter(bm => hasHeadacheManagement(bm.match.phenotypeId));
  // M2: Vestibular migraine is an ICHD-3 appendix entity with no dedicated dosing —
  // it steers to migraine management rather than mounting a destination-less block.
  const hasVM = top2.some(bm => bm.match.phenotypeId === 'vestibular-migraine');

  return (
    <div className="rounded-xl border border-slate-100 shadow-sm bg-white overflow-hidden">
      <div className="bg-white px-5 pt-4 pb-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
          Differential result · {top2.length === 1 ? '1 pattern' : `${top2.length} patterns`}
        </div>
        <h2 className="text-xl font-semibold text-slate-900 leading-tight">{headline}</h2>

        {top2.map((bm, i) => (
          <CandidateAccordion key={bm.match.phenotypeId} bm={bm} selected={selected} open={i === 0} />
        ))}

        {/* Set-aside tray */}
        {banded.setAside.length > 0 && (
          <details className="group mt-4">
            <summary className="flex items-center gap-2 min-h-[44px] text-[12px] text-slate-500 hover:text-slate-700 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <ChevronDown className="w-3.5 h-3.5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
              <span>
                <span className="font-medium text-slate-600">{banded.setAside.length} more set aside</span> · needs confirmation
              </span>
            </summary>
            <ul className="mt-2 space-y-1.5 pl-5">
              {banded.setAside.map(bm => (
                <li key={bm.match.phenotypeId} className="text-[12px] text-slate-500 leading-snug">
                  {bm.match.name}
                  {bm.match.exclusionReason && <span className="text-slate-400"> · {bm.match.exclusionReason}</span>}
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Mandatory, always-rendered safety strip (Q7.2). */}
        <SafetyStrip />

        {/* Management — collapsed disclosures mount the dosing verbatim (M1). */}
        {(manageable.length > 0 || hasVM) && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Management</div>
            {manageable.map(bm => (
              <ManagementDisclosure key={bm.match.phenotypeId} m={bm.match} />
            ))}
            {/* M2: VM steering note (no dosing authored for the appendix entity). */}
            {hasVM && (
              <p className="mt-2 text-[12px] text-slate-600 leading-relaxed">
                Vestibular migraine is an ICHD-3 appendix research entity with no dedicated dosing. Manage the underlying migraine and refer for vestibular evaluation.
              </p>
            )}
          </div>
        )}

        <HiddenClaimMarkers />
        <CitationFooter />
      </div>
      <ReconsiderBar onReconsider={onReconsider} />
    </div>
  );
};

// Equal-prominence reconsider (anti-anchoring) — rendered just inside the panel base
// so it sits with the result; the page may also expose it in the bottom bar.
const ReconsiderBar: React.FC<{ onReconsider: () => void }> = ({ onReconsider }) => (
  <div className="px-5 pb-5">
    <button
      type="button"
      onClick={onReconsider}
      className="w-full rounded-xl border border-slate-200 bg-white hover:bg-neuro-50 text-neuro-700 text-[13px] font-semibold px-5 min-h-[48px] flex items-center justify-center gap-2 transition-colors"
    >
      <RotateCcw className="w-4 h-4" aria-hidden="true" />
      This doesn&apos;t fit? Reconsider.
    </button>
  </div>
);
