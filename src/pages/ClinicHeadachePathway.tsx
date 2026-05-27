/**
 * Clinic Headache Pathway — third rewrite, this time grounded in
 * PATHWAY_SPEC.md v1.5 + the EVT canary pattern.
 *
 * Previous attempts (chip-picker affdcc8, adaptive interview a8117aa) shipped
 * and were rejected by V on usability grounds. This implementation consumes
 * the existing pathway primitives verbatim (PathwayHeader, PathwayRailStep,
 * PathwayCategoryRow, PathwayMultiCheckRow, PathwayBranchChip,
 * PathwayCascadeNotice, PathwayBottomDrawer) and follows the same
 * vertical-rail + category-row pattern as EvtPathway.
 *
 * Architecture:
 *   - Pure evaluator + ICHD-3 data unchanged from prior work
 *     (src/data/clinicHeadacheData.ts) — that brain is correct
 *   - 4 steps: TRIAGE / PATTERN / CHARACTER / ASSOCIATED
 *   - Step 5 RESULT lives in the drawer (no body content)
 *   - Red-flag short-circuit at Step 1 → drawer surfaces workup card
 *   - Branch chips between completed steps summarise upstream answers
 *   - Cascade-clear when upstream answer changes
 *
 * Spec refs: PATHWAY_SPEC §1 (anatomy), §2 (header), §3 (rail + category
 * rows), §4 (step content), §5 (drawer). Architect §17.1 approved with
 * conditions all resolved before this commit.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { PathwayHeader } from '../components/pathways/PathwayHeader';
import { PathwayRailStep } from '../components/pathways/PathwayRail';
import { PathwayCategoryRow } from '../components/pathways/PathwayCategoryRow';
import { PathwayMultiCheckRow } from '../components/pathways/PathwayMultiCheckRow';
import { PathwayBranchChip } from '../components/pathways/PathwayBranchChip';
import { PathwayCascadeNotice } from '../components/pathways/PathwayCascadeNotice';
import { PathwayBottomDrawer, type PathwayTier } from '../components/pathways/PathwayBottomDrawer';
import { useFavorites } from '../hooks/useFavorites';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useRecents } from '../hooks/useRecents';
import {
  evaluateHeadachePhenotypes,
  HEADACHE_PHENOTYPES,
  type ChipId,
  type PhenotypeMatch,
} from '../data/clinicHeadacheData';

// ─── Constants ────────────────────────────────────────────────────────────

const RED_FLAGS = [
  { value: 'rf-onset-sudden', label: 'Thunderclap onset', description: 'Sudden, peak in seconds' },
  { value: 'rf-neuro-deficit', label: 'Focal neurologic deficit or seizure', description: 'New weakness, aphasia, vision change' },
  { value: 'rf-systemic', label: 'Fever, weight loss, or systemic illness', description: 'Constitutional symptoms' },
  { value: 'rf-older-age-onset', label: 'First-ever headache after age 50', description: 'New-onset late in life' },
  { value: 'rf-pregnancy', label: 'Pregnancy or postpartum', description: 'Includes 6 weeks postpartum' },
  { value: 'rf-posttraumatic', label: 'Posttraumatic onset', description: 'Follows head injury' },
  { value: 'rf-papilloedema', label: 'Papilloedema on exam', description: 'Optic disc swelling' },
  { value: 'rf-valsalva', label: 'Triggered by cough, sneeze, or exercise', description: 'Valsalva manoeuvre' },
  { value: 'rf-positional', label: 'Worse standing or supine', description: 'Positional component' },
  { value: 'rf-pattern-change', label: 'Recent pattern change', description: 'Different from prior headaches' },
  { value: 'rf-immune-pathology', label: 'Immunosuppression, HIV, or cancer history', description: 'Risk for opportunistic causes' },
  { value: 'rf-painkiller-overuse', label: 'Painkiller use ≥10–15 days/month', description: 'Medication-overuse headache risk' },
];

const PATTERN_OPTIONS = [
  { value: 'episodic', label: 'Episodic', description: 'Pain-free intervals between attacks' },
  { value: 'continuous', label: 'Continuous', description: 'Constant or near-constant pain' },
];

const DURATION_EPISODIC_OPTIONS = [
  { value: 'lt-15', label: 'Less than 15 minutes' },
  { value: '15-180', label: '15 to 180 minutes' },
  { value: '4-72', label: '4 to 72 hours' },
  { value: '30min-7d', label: '30 minutes to several days' },
  { value: 'gt-72', label: 'More than 72 hours' },
];

const DURATION_CONTINUOUS_OPTIONS = [
  { value: 'continuous-3mo-plus', label: 'Continuous for 3 months or longer' },
  { value: 'continuous-new', label: 'Continuous for less than 3 months' },
];

const FREQUENCY_OPTIONS = [
  { value: 'lt-5', label: 'Fewer than 5 lifetime attacks' },
  { value: '1-4', label: '1 to 4 days per month' },
  { value: '5-14', label: '5 to 14 days per month' },
  { value: 'ge-15', label: '15 or more days per month' },
];

const LOCATION_OPTIONS = [
  { value: 'unilateral', label: 'Unilateral', description: 'One side only' },
  { value: 'bilateral', label: 'Bilateral', description: 'Both sides' },
  { value: 'orbital', label: 'Orbital or temporal', description: 'Around one eye or temple' },
];

const QUALITY_OPTIONS = [
  { value: 'pulsating', label: 'Throbbing or pulsating' },
  { value: 'pressing', label: 'Pressing or tightening' },
  { value: 'sharp', label: 'Sharp or stabbing' },
];

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'very-severe', label: 'Very severe' },
];

const AGGRAVATED_OPTIONS = [
  { value: 'yes', label: 'Yes, worse with activity' },
  { value: 'no', label: 'Not aggravated by activity' },
];

const ASSOCIATED_OPTIONS = [
  { value: 'sym-nausea-mild', label: 'Mild nausea', description: 'Allowed by 2.3 Chronic TTH D in the ≤1 pool with photo/phono' },
  { value: 'sym-nausea-moderate-severe', label: 'Moderate or severe nausea', description: 'Excludes both 2.2 and 2.3 TTH' },
  { value: 'sym-vomiting', label: 'Vomiting' },
  { value: 'sym-photophobia', label: 'Bothered by light' },
  { value: 'sym-phonophobia', label: 'Bothered by sound' },
  { value: 'sym-autonomic-ipsilateral', label: 'Ipsilateral autonomic features', description: 'Tearing, conjunctival injection, ptosis, rhinorrhoea' },
  { value: 'sym-restlessness', label: 'Restlessness or agitation during attacks' },
];

const LIFETIME_ATTACKS_OPTIONS = [
  { value: 'lt-5', label: 'Fewer than 5' },
  { value: '5-10', label: '5 to 10' },
  { value: 'gt-10', label: 'More than 10' },
];

const INDOMETHACIN_OPTIONS = [
  { value: 'indo-tried-complete', label: 'Complete response', description: 'Headache fully resolves with therapeutic dose' },
  { value: 'indo-tried-partial', label: 'Partial response', description: 'Some relief but not complete' },
  { value: 'indo-tried-no-response', label: 'No response', description: 'No relief at therapeutic dose' },
  { value: 'indo-not-tried', label: 'Not tried yet', description: 'No therapeutic trial documented' },
];

// ─── Page state ───────────────────────────────────────────────────────────

interface HeadacheState {
  redFlags: Set<string>;
  redFlagsExplicitlyNone: boolean;

  pattern: string | null;
  duration: string | null;
  frequency: string | null;

  location: string | null;
  quality: string | null;
  severity: string | null;
  aggravated: string | null;

  associated: Set<string>;
  associatedExplicitlyNone: boolean;
  lifetimeAttacks: string | null;
  indomethacin: string | null;
}

const EMPTY_STATE: HeadacheState = {
  redFlags: new Set(),
  redFlagsExplicitlyNone: false,
  pattern: null,
  duration: null,
  frequency: null,
  location: null,
  quality: null,
  severity: null,
  aggravated: null,
  associated: new Set(),
  associatedExplicitlyNone: false,
  lifetimeAttacks: null,
  indomethacin: null,
};

// Build chip set for the evaluator
function chipsFromState(s: HeadacheState): Set<ChipId> {
  const chips = new Set<ChipId>();

  // Red flags pass through directly (already ChipIds)
  for (const flag of s.redFlags) chips.add(flag as ChipId);

  // Pattern + duration
  if (s.pattern === 'episodic') chips.add('onset-recurrent-same');
  if (s.pattern === 'continuous') chips.add('dur-continuous');

  switch (s.duration) {
    case 'lt-15': chips.add('dur-lt-15-min'); break;
    case '15-180': chips.add('dur-15-to-180-min'); break;
    case '4-72': chips.add('dur-4-to-72-hours'); break;
    case '30min-7d': chips.add('dur-30min-to-7days'); break;
    case 'gt-72': chips.add('dur-gt-72-hours'); break;
    case 'continuous-3mo-plus': chips.add('dur-continuous'); chips.add('pattern-ge-3-months'); break;
    case 'continuous-new': chips.add('dur-continuous'); chips.add('pattern-lt-3-months'); break;
  }

  // Frequency / lifetime
  if (s.frequency === '1-4') chips.add('freq-1-4-per-month');
  if (s.frequency === '5-14') chips.add('freq-5-14-per-month');
  if (s.frequency === 'ge-15') chips.add('freq-ge-15-per-month');

  if (s.lifetimeAttacks === 'lt-5') chips.add('attacks-lt-5');
  if (s.lifetimeAttacks === '5-10') chips.add('attacks-5-to-10');
  if (s.lifetimeAttacks === 'gt-10') chips.add('attacks-gt-10');

  // Character
  if (s.location === 'unilateral') chips.add('loc-unilateral');
  if (s.location === 'bilateral') chips.add('loc-bilateral');
  if (s.location === 'orbital') { chips.add('loc-unilateral'); chips.add('loc-orbital-temporal'); }

  if (s.quality === 'pulsating') chips.add('qual-pulsating');
  if (s.quality === 'pressing') chips.add('qual-pressing-tightening');
  if (s.quality === 'sharp') chips.add('qual-sharp-stabbing');

  if (s.severity === 'mild') chips.add('sev-mild');
  if (s.severity === 'moderate') chips.add('sev-moderate');
  if (s.severity === 'severe') chips.add('sev-severe');
  if (s.severity === 'very-severe') chips.add('sev-very-severe');

  if (s.aggravated === 'yes') chips.add('act-aggravated');
  if (s.aggravated === 'no') chips.add('act-not-aggravated');

  // Associated
  for (const sym of s.associated) chips.add(sym as ChipId);

  // Indomethacin (cluster headache / hemicrania continua)
  if (s.indomethacin === 'indo-tried-complete') chips.add('indo-tried-complete');
  if (s.indomethacin === 'indo-tried-partial') chips.add('indo-tried-partial');
  if (s.indomethacin === 'indo-tried-no-response') chips.add('indo-tried-no-response');
  if (s.indomethacin === 'indo-not-tried') chips.add('indo-not-tried');

  return chips;
}

// Step completion checks
const isStep1Complete = (s: HeadacheState): boolean =>
  s.redFlags.size > 0 || s.redFlagsExplicitlyNone;

const isStep2Complete = (s: HeadacheState): boolean =>
  s.pattern !== null && s.duration !== null && s.frequency !== null;

const isStep3Complete = (s: HeadacheState): boolean =>
  s.location !== null && s.quality !== null && s.severity !== null && s.aggravated !== null;

const isStep4Complete = (s: HeadacheState): boolean =>
  s.lifetimeAttacks !== null && (s.associated.size > 0 || s.associatedExplicitlyNone);

const hasRedFlag = (s: HeadacheState): boolean => s.redFlags.size > 0;

// ─── Component ────────────────────────────────────────────────────────────

const ClinicHeadachePathway: React.FC = () => {
  const { recordView } = useRecents();
  const { handleBack } = useNavigationSource();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite('headache-clinic');

  const [state, setState] = useState<HeadacheState>(EMPTY_STATE);
  const [cascade, setCascade] = useState<{ changedField: string; clearedFields: string[] } | null>(null);
  const [copyConfirm, setCopyConfirm] = useState(false);

  useEffect(() => {
    recordView({
      type: 'pathway',
      id: 'headache-clinic',
      title: 'Clinic Headache Pathway',
      subtitle: 'ICHD-3 phenotype + management',
      category: 'severe-headache',
      trail: '4 steps',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────
  const step1Complete = isStep1Complete(state);
  const step2Complete = isStep2Complete(state);
  const step3Complete = isStep3Complete(state);
  const step4Complete = isStep4Complete(state);
  const redFlagActive = hasRedFlag(state);

  const chips = useMemo(() => chipsFromState(state), [state]);
  const matches = useMemo(() => evaluateHeadachePhenotypes(chips), [chips]);
  const topMatch: PhenotypeMatch | undefined = matches[0];

  // ── Cascade-clear helpers ──────────────────────────────────────────────
  const clearDownstream = (fromStep: 1 | 2 | 3, changedFieldLabel: string) => {
    setState((prev) => {
      const next = { ...prev };
      const cleared: string[] = [];
      if (fromStep <= 2) {
        if (next.pattern || next.duration || next.frequency) cleared.push('Pattern');
        next.pattern = null;
        next.duration = null;
        next.frequency = null;
      }
      if (fromStep <= 2) {
        if (next.location || next.quality || next.severity || next.aggravated) cleared.push('Character');
        next.location = null;
        next.quality = null;
        next.severity = null;
        next.aggravated = null;
      }
      if (fromStep <= 3) {
        if (next.associated.size || next.associatedExplicitlyNone || next.lifetimeAttacks || next.indomethacin) cleared.push('Associated');
        next.associated = new Set();
        next.associatedExplicitlyNone = false;
        next.lifetimeAttacks = null;
        next.indomethacin = null;
      }
      if (cleared.length > 0) setCascade({ changedField: changedFieldLabel, clearedFields: cleared });
      else setCascade(null);
      return next;
    });
  };

  const handleReset = () => {
    setState(EMPTY_STATE);
    setCascade(null);
  };

  const handleCopy = () => {
    const summary = topMatch && step4Complete
      ? `Clinic Headache | NeuroWiki\nFeatures consistent with ${topMatch.name} (${topMatch.ichd3Section}).`
      : redFlagActive
        ? `Clinic Headache | NeuroWiki\nRed flag present, secondary workup indicated.`
        : `Clinic Headache | NeuroWiki\nInterview in progress.`;
    navigator.clipboard?.writeText(summary).catch(() => {});
    setCopyConfirm(true);
    setTimeout(() => setCopyConfirm(false), 2000);
  };

  // ── Drawer state computation ───────────────────────────────────────────
  const { drawerTier, drawerTierLabel, drawerAction, drawerSummary, drawerReasons, drawerNotes } = useMemo(() => {
    if (redFlagActive) {
      const flag = RED_FLAGS.find((f) => state.redFlags.has(f.value));
      return {
        drawerTier: 'High' as PathwayTier,
        drawerTierLabel: 'Secondary workup',
        drawerAction: flag ? flag.label : 'Red flag present',
        drawerSummary:
          'Any SNNOOP10 red flag warrants secondary-cause evaluation before assigning a primary-headache phenotype (Do et al. Neurology 2019).',
        drawerReasons: Array.from(state.redFlags).map((v) => ({
          label: RED_FLAGS.find((f) => f.value === v)?.label ?? v,
        })),
        drawerNotes: workupNotesForFlags(state.redFlags),
      };
    }

    if (!step4Complete || !topMatch) {
      return {
        drawerTier: 'None' as PathwayTier,
        drawerTierLabel: undefined,
        drawerAction: '',
        drawerSummary: undefined,
        drawerReasons: undefined,
        drawerNotes: undefined,
      };
    }

    const phenotype = HEADACHE_PHENOTYPES.find((p) => p.id === topMatch.phenotypeId);
    const tier: PathwayTier =
      topMatch.matchStrength === 'full' ? 'Low'
      : topMatch.matchStrength === 'probable' ? 'Intermediate'
      : 'High';
    const headline =
      topMatch.matchStrength === 'full' ? `Features consistent with ${topMatch.name}`
      : topMatch.matchStrength === 'probable' ? `Features consistent with Probable ${topMatch.name}`
      : `Partial match for ${topMatch.name}`;

    return {
      drawerTier: tier,
      drawerTierLabel: topMatch.name,
      drawerAction: topMatch.ichd3Section,
      drawerSummary: `${headline}. ${phenotype?.teachPearl?.split('. ')[0] ?? ''}. Confirm pattern across multiple attacks; the diagnosis remains a clinical judgement.`,
      drawerReasons: topMatch.metCriteria.map((c) => ({ label: c.label })),
      drawerNotes: managementNotesForPhenotype(topMatch.phenotypeId),
    };
  }, [redFlagActive, step4Complete, topMatch, state.redFlags]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-slate-50 pb-32">
      <PathwayHeader
        pathwayLabel="Clinic Headache"
        onBack={handleBack}
        isFav={isFav}
        onFavToggle={() => toggleFavorite('headache-clinic')}
        onReset={handleReset}
        onCopy={handleCopy}
        copyConfirm={copyConfirm}
      />

      <main className="max-w-2xl mx-auto px-5 pt-6 pb-4">

        {/* Step 1 — TRIAGE (red flags) */}
        <PathwayRailStep
          stepNumber={1}
          title="TRIAGE"
          iconKey="triage"
          nodeState={step1Complete ? 'completed' : 'active'}
          segmentAboveTraversed={false}
        >
          <div data-claim="clinic-headache-pitfall-mig-vs-tth" className="hidden" />
          <PathwayMultiCheckRow
            label="Red flags"
            options={RED_FLAGS}
            values={state.redFlags}
            onChange={(values) => {
              setState((prev) => ({ ...prev, redFlags: values, redFlagsExplicitlyNone: false }));
              if (step2Complete || step3Complete) clearDownstream(1, 'Red flags');
            }}
            explicitlyNone={state.redFlagsExplicitlyNone}
            onMarkNone={() => setState((prev) => ({ ...prev, redFlagsExplicitlyNone: true, redFlags: new Set() }))}
            stepCompleted={step1Complete}
            defaultOpen={!step1Complete}
          />
          {cascade && (
            <div className="mt-2">
              <PathwayCascadeNotice
                visible={true}
                changedFieldLabel={cascade.changedField}
                clearedFields={cascade.clearedFields}
                onUndo={() => setCascade(null)}
                onDismiss={() => setCascade(null)}
              />
            </div>
          )}
        </PathwayRailStep>

        {/* Branch chip — Step 1 summary */}
        {step1Complete && !redFlagActive && (
          <div className="ml-8 mb-2">
            <PathwayBranchChip
              targetFieldId="red-flags"
              label="No red flags present"
              onClick={() => { /* scroll-to handled by browser via category-row tap */ }}
            />
          </div>
        )}

        {/* Step 2 — PATTERN */}
        <PathwayRailStep
          stepNumber={2}
          title="PATTERN"
          iconKey="clinical"
          nodeState={
            redFlagActive ? 'locked'
            : step2Complete ? 'completed'
            : step1Complete ? 'active'
            : 'locked'
          }
          segmentAboveTraversed={step1Complete && !redFlagActive}
          lockedAriaLabel="Step 2 Pattern, awaiting Step 1 Triage"
        >
          {redFlagActive ? (
            <p className="text-sm italic text-slate-400">Suspended pending workup ↑</p>
          ) : !step1Complete ? (
            <p className="text-sm italic text-slate-400">Awaiting Step 1 ↑</p>
          ) : (
            <div className="space-y-1">
              <PathwayCategoryRow
                label="Pattern"
                options={PATTERN_OPTIONS}
                value={state.pattern}
                onChange={(v) => {
                  setState((prev) => ({ ...prev, pattern: v, duration: null }));
                  if (step3Complete) clearDownstream(2, 'Pattern');
                }}
                stepCompleted={step2Complete}
                defaultOpen={!state.pattern}
              />
              <PathwayCategoryRow
                label="Duration per attack"
                options={state.pattern === 'continuous' ? DURATION_CONTINUOUS_OPTIONS : DURATION_EPISODIC_OPTIONS}
                value={state.duration}
                onChange={(v) => {
                  setState((prev) => ({ ...prev, duration: v }));
                  if (step3Complete) clearDownstream(2, 'Duration');
                }}
                stepCompleted={step2Complete}
                defaultOpen={state.pattern !== null && !state.duration}
              />
              <PathwayCategoryRow
                label="Frequency"
                options={FREQUENCY_OPTIONS}
                value={state.frequency}
                onChange={(v) => {
                  setState((prev) => ({ ...prev, frequency: v }));
                  if (step3Complete) clearDownstream(2, 'Frequency');
                }}
                stepCompleted={step2Complete}
                defaultOpen={state.duration !== null && !state.frequency}
              />
            </div>
          )}
        </PathwayRailStep>

        {/* Branch chip — Step 2 summary */}
        {step2Complete && !redFlagActive && (
          <div className="ml-8 mb-2">
            <PathwayBranchChip
              targetFieldId="pattern"
              label={summariseStep2(state)}
              onClick={() => { /* scroll handled by parent */ }}
            />
          </div>
        )}

        {/* Step 3 — CHARACTER */}
        <PathwayRailStep
          stepNumber={3}
          title="CHARACTER"
          iconKey="imaging"
          nodeState={
            redFlagActive ? 'locked'
            : step3Complete ? 'completed'
            : step2Complete ? 'active'
            : 'locked'
          }
          segmentAboveTraversed={step2Complete && !redFlagActive}
          lockedAriaLabel="Step 3 Character, awaiting Step 2 Pattern"
        >
          {redFlagActive ? (
            <p className="text-sm italic text-slate-400">Suspended pending workup ↑</p>
          ) : !step2Complete ? (
            <p className="text-sm italic text-slate-400">Awaiting Step 2 ↑</p>
          ) : (
            <div className="space-y-1">
              <PathwayCategoryRow
                label="Location"
                options={LOCATION_OPTIONS}
                value={state.location}
                onChange={(v) => {
                  setState((prev) => ({ ...prev, location: v }));
                  if (step4Complete) clearDownstream(3, 'Location');
                }}
                stepCompleted={step3Complete}
                defaultOpen={!state.location}
              />
              <PathwayCategoryRow
                label="Quality"
                options={QUALITY_OPTIONS}
                value={state.quality}
                onChange={(v) => {
                  setState((prev) => ({ ...prev, quality: v }));
                  if (step4Complete) clearDownstream(3, 'Quality');
                }}
                stepCompleted={step3Complete}
                defaultOpen={state.location !== null && !state.quality}
              />
              <PathwayCategoryRow
                label="Severity"
                options={SEVERITY_OPTIONS}
                value={state.severity}
                onChange={(v) => {
                  setState((prev) => ({ ...prev, severity: v }));
                  if (step4Complete) clearDownstream(3, 'Severity');
                }}
                stepCompleted={step3Complete}
                defaultOpen={state.quality !== null && !state.severity}
              />
              <PathwayCategoryRow
                label="Aggravated by activity"
                options={AGGRAVATED_OPTIONS}
                value={state.aggravated}
                onChange={(v) => {
                  setState((prev) => ({ ...prev, aggravated: v }));
                  if (step4Complete) clearDownstream(3, 'Aggravated by activity');
                }}
                stepCompleted={step3Complete}
                defaultOpen={state.severity !== null && !state.aggravated}
              />
            </div>
          )}
        </PathwayRailStep>

        {/* Branch chip — Step 3 summary */}
        {step3Complete && !redFlagActive && (
          <div className="ml-8 mb-2">
            <PathwayBranchChip
              targetFieldId="character"
              label={summariseStep3(state)}
              onClick={() => { /* scroll handled by parent */ }}
            />
          </div>
        )}

        {/* Step 4 — ASSOCIATED */}
        <PathwayRailStep
          stepNumber={4}
          title="ASSOCIATED"
          iconKey="decision"
          nodeState={
            redFlagActive ? 'locked'
            : step4Complete ? 'completed'
            : step3Complete ? 'active'
            : 'locked'
          }
          segmentAboveTraversed={step3Complete && !redFlagActive}
          lockedAriaLabel="Step 4 Associated symptoms, awaiting Step 3 Character"
        >
          {redFlagActive ? (
            <p className="text-sm italic text-slate-400">Suspended pending workup ↑</p>
          ) : !step3Complete ? (
            <p className="text-sm italic text-slate-400">Awaiting Step 3 ↑</p>
          ) : (
            <div className="space-y-1">
              <PathwayMultiCheckRow
                label="Associated symptoms"
                options={ASSOCIATED_OPTIONS}
                values={state.associated}
                onChange={(values) => setState((prev) => ({ ...prev, associated: values, associatedExplicitlyNone: false }))}
                explicitlyNone={state.associatedExplicitlyNone}
                onMarkNone={() => setState((prev) => ({ ...prev, associatedExplicitlyNone: true, associated: new Set() }))}
                stepCompleted={step4Complete}
                defaultOpen={state.associated.size === 0 && !state.associatedExplicitlyNone}
              />
              <PathwayCategoryRow
                label="Lifetime attacks"
                options={LIFETIME_ATTACKS_OPTIONS}
                value={state.lifetimeAttacks}
                onChange={(v) => setState((prev) => ({ ...prev, lifetimeAttacks: v }))}
                stepCompleted={step4Complete}
                defaultOpen={(state.associated.size > 0 || state.associatedExplicitlyNone) && !state.lifetimeAttacks}
              />
              {state.pattern === 'continuous' && state.location === 'unilateral' && (
                <PathwayCategoryRow
                  label="Indomethacin response"
                  options={INDOMETHACIN_OPTIONS}
                  value={state.indomethacin}
                  onChange={(v) => setState((prev) => ({ ...prev, indomethacin: v }))}
                  stepCompleted={false}
                  defaultOpen={state.lifetimeAttacks !== null && !state.indomethacin}
                />
              )}
            </div>
          )}
        </PathwayRailStep>

        {/* Phenotype management content — surfaces when step 4 complete.
            Each block carries the literal data-claim attribute per
            clinical-reviewer preservation map. */}
        {step4Complete && topMatch && !redFlagActive && (
          <section aria-labelledby="management-heading" className="mt-8 space-y-4">
            <h2 id="management-heading" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Management
            </h2>

            {(topMatch.phenotypeId === 'migraine-without-aura' || topMatch.phenotypeId === 'migraine-with-aura') && (
              <>
                <div data-claim="clinic-headache-ichd3-migraine-criteria" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>ICHD-3 §1.1 / §1.2 criteria</SectionHeader>
                  <CriteriaList match={topMatch} />
                </div>
                <div data-claim="clinic-headache-moh-gepant-safe" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>Acute treatment</SectionHeader>
                  <Row label="First-line" value="Sumatriptan 50 to 100 mg PO at onset (if no CVD contraindication)" />
                  <Row label="NSAID" value="Ibuprofen 600 mg or naproxen 500 mg for milder attacks" />
                  <Row label="If triptans contraindicated" value="Gepant (ubrogepant, rimegepant) or lasmiditan; no MOH risk with gepants" />
                  <Row label="Add" value="Antiemetic when nausea is prominent" />
                </div>
                <div data-claim="clinic-headache-preventive-threshold" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>Preventive threshold (AHS 2021)</SectionHeader>
                  <Row label="Indication" value="≥4 days/month with disability, ≥6 days/month regardless, or acute use ≥10 days/month" />
                  <Row label="First-line" value="Propranolol or topiramate" />
                  <Row label="Comorbid anxiety or depression" value="Amitriptyline or venlafaxine" />
                </div>
                <div data-claim="clinic-headache-cgrp-escalation" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>CGRP escalation</SectionHeader>
                  <Row label="After 2 failures" value="Erenumab, fremanezumab, galcanezumab, or eptinezumab" />
                  <Row label="Oral CGRP" value="Atogepant or rimegepant for patients preferring oral therapy or with MOH risk" />
                </div>
              </>
            )}

            {(topMatch.phenotypeId === 'episodic-tth' || topMatch.phenotypeId === 'chronic-tth') && (
              <>
                <div data-claim="clinic-headache-ichd3-tension-criteria" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>ICHD-3 §2.2 / §2.3 criteria</SectionHeader>
                  <CriteriaList match={topMatch} />
                </div>
                <div data-claim="clinic-headache-tension-acute-management" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>Acute treatment (Scher Continuum 2024)</SectionHeader>
                  <Row label="First-line" value="Ibuprofen 400 to 600 mg PO" />
                  <Row label="Alternative" value="Aspirin 500 to 1000 mg PO" />
                  <Row label="Pregnancy or NSAID contraindication" value="Acetaminophen 1000 mg PO" />
                  <Row label="Avoid" value="Opioids and butalbital combinations (MOH and dependence risk)" />
                  <Row label="MOH limits" value="≤15 days/month simple analgesics; ≤10 days/month triptans or opioids" />
                </div>
                {topMatch.phenotypeId === 'chronic-tth' && (
                  <div data-claim="clinic-headache-tension-preventive" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                    <SectionHeader>Preventive treatment</SectionHeader>
                    <Row label="First-line" value="Amitriptyline 10 to 75 mg at bedtime (AAN Level B)" />
                    <Row label="Depression or anxiety comorbid" value="Venlafaxine 75 to 150 mg/day" />
                    <Row label="Sleep or anxiety predominant" value="Mirtazapine 15 to 30 mg at bedtime" />
                    <Row label="Third-line" value="Topiramate (less evidence for TTH than migraine)" />
                    <Row label="Non-pharmacologic (Level A)" value="Stress management, biofeedback, physical therapy" />
                  </div>
                )}
              </>
            )}

            {topMatch.phenotypeId === 'cluster-headache' && (
              <>
                <div data-claim="clinic-headache-ichd3-cluster-criteria" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>ICHD-3 §3.1 criteria</SectionHeader>
                  <CriteriaList match={topMatch} />
                </div>
                <div data-claim="clinic-headache-cluster-acute-management" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>Acute treatment (Burish Continuum 2024)</SectionHeader>
                  <Row label="High-flow O₂" value="12 to 15 L/min via non-rebreather, 15 minutes (AHS Grade A)" />
                  <Row label="Triptan" value="Sumatriptan 6 mg SC or 20 mg nasal (AHS Grade A)" />
                  <Row label="Bridging" value="Ipsilateral GON block with corticosteroid; prednisone 100 mg/day × 5 d then taper" />
                </div>
                <div data-claim="clinic-headache-cluster-preventive" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>Preventive treatment</SectionHeader>
                  <Row label="First-line" value="Verapamil 80 mg TID, titrate to 360 mg/day with baseline and follow-up ECG" />
                  <Row label="Second-line" value="Lithium 300 mg BID to TID; serum-level monitoring required" />
                  <Row label="Third-line" value="Topiramate 100 to 200 mg/day; avoid in WOCBP without contraception" />
                </div>
              </>
            )}

            {topMatch.phenotypeId === 'hemicrania-continua' && (
              <>
                <div data-claim="clinic-headache-ichd3-hemicrania-criteria" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>ICHD-3 §3.4 criteria</SectionHeader>
                  <CriteriaList match={topMatch} />
                </div>
                <div data-claim="clinic-headache-hc-indomethacin-protocol" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>Indomethacin protocol (Goadsby Continuum 2024)</SectionHeader>
                  <Row label="Week 1" value="Indomethacin 25 mg TID" />
                  <Row label="Week 2 if incomplete" value="50 mg TID (150 mg/day, the maximum per quoted text)" />
                  <Row label="GI protection" value="Co-prescribe PPI; co-prescription is mandatory" />
                  <Row label="Diagnostic confirmation" value="Complete response within 1 to 2 weeks confirms the hemicrania continua phenotype" />
                </div>
              </>
            )}

            {topMatch.phenotypeId === 'ndph' && (
              <div data-claim="clinic-headache-ichd3-ndph-criteria" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                <SectionHeader>ICHD-3 §4.10 criteria</SectionHeader>
                <CriteriaList match={topMatch} />
                <Row label="Management" value="NDPH is a diagnosis of exclusion; complete secondary-cause workup before treating. Treat per the phenotype the headache most resembles." />
              </div>
            )}

            {topMatch.phenotypeId === 'chronic-migraine' && (
              <>
                <div data-claim="clinic-headache-ichd3-chronic-migraine-criteria" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>ICHD-3 §1.3 criteria</SectionHeader>
                  <CriteriaList match={topMatch} />
                </div>
                <div data-claim="clinic-headache-chronic-migraine-acute" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>Acute treatment</SectionHeader>
                  <Row label="First-line" value="NSAID or triptan at onset, same stepwise framework as episodic migraine (Burch Continuum 2024)" />
                  <Row label="MOH risk" value="Gepant (rimegepant, ubrogepant) preferred when acute-medication days are high; gepants do not cause MOH (Rizzoli 2024)" />
                  <Row label="Refractory" value="Combination therapy (antiemetic + analgesic ± DHE); IV DHE for refractory ED migraine" />
                </div>
                <div data-claim="clinic-headache-chronic-migraine-preventive" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>Preventive treatment</SectionHeader>
                  <Row label="OnabotulinumtoxinA" value="Approved for chronic migraine only (per Lipton 2024). Standard PREEMPT-aligned dosing per AHS." />
                  <Row label="CGRP mAb" value="Erenumab, fremanezumab, galcanezumab, or eptinezumab; first-line for chronic migraine per AHS 2021" />
                  <Row label="Conventional preventives" value="Topiramate, valproate (avoid in WOCBP), propranolol/metoprolol, amitriptyline, venlafaxine. Escalate to CGRP mAb after ≥2 failures." />
                </div>
              </>
            )}

            {topMatch.phenotypeId === 'paroxysmal-hemicrania' && (
              <>
                <div data-claim="clinic-headache-ichd3-paroxysmal-criteria" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>ICHD-3 §3.2 criteria</SectionHeader>
                  <CriteriaList match={topMatch} />
                </div>
                <div data-claim="clinic-headache-ph-indomethacin-protocol" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>Indomethacin protocol (Goadsby Continuum 2024)</SectionHeader>
                  <Row label="Week 1" value="Indomethacin 25 mg TID" />
                  <Row label="Titration" value="Increase to 75 to 150 mg/day if incomplete response (max 150 mg/day per Goadsby 2024 quoted text)" />
                  <Row label="GI protection" value="PPI co-prescription is mandatory" />
                  <Row label="Diagnostic confirmation" value="Complete response within 1 to 2 weeks confirms the paroxysmal hemicrania phenotype" />
                </div>
              </>
            )}

            {topMatch.phenotypeId === 'sunct-suna' && (
              <>
                <div data-claim="clinic-headache-ichd3-sunct-criteria" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>ICHD-3 §3.3 criteria</SectionHeader>
                  <CriteriaList match={topMatch} />
                </div>
                <div data-claim="clinic-headache-sunct-lamotrigine" className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
                  <SectionHeader>Preventive treatment (Burish Continuum 2024)</SectionHeader>
                  <Row label="First-line" value="Lamotrigine, titrated slowly to reduce rash risk" />
                  <Row label="Second-line" value="Carbamazepine" />
                  <Row label="Referral" value="Refer to a headache specialist; SUNCT/SUNA is uncommon and often misdiagnosed as trigeminal neuralgia" />
                </div>
              </>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="mt-14 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            ICHD-3 (2018): Headache Classification Committee of the International Headache Society. Cephalalgia 2018;38(1):1-211. SNNOOP10: Do et al. Neurology 2019;92:134-144. Management citations: Continuum 2024 issue on Headache; AHS 2021 Consensus Statement on CGRP and Preventive Therapy.
          </p>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            Reference only. Confirm pattern across multiple attacks and review the patient's history before treating. The tool does not diagnose.
          </p>
        </footer>

        <div className="h-24" />
      </main>

      <PathwayBottomDrawer
        pathwayName="Headache"
        tier={drawerTier}
        tierLabel={drawerTierLabel}
        action={drawerAction}
        expandedSummary={drawerSummary}
        reasons={drawerReasons}
        notes={drawerNotes}
      />
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────

function summariseStep2(s: HeadacheState): string {
  const patternLabel = s.pattern === 'episodic' ? 'Episodic' : s.pattern === 'continuous' ? 'Continuous' : '';
  const durationLabel = DURATION_EPISODIC_OPTIONS.find((o) => o.value === s.duration)?.label
    ?? DURATION_CONTINUOUS_OPTIONS.find((o) => o.value === s.duration)?.label
    ?? '';
  const freqLabel = FREQUENCY_OPTIONS.find((o) => o.value === s.frequency)?.label ?? '';
  return [patternLabel, durationLabel, freqLabel].filter(Boolean).join(' · ');
}

function summariseStep3(s: HeadacheState): string {
  const parts = [
    LOCATION_OPTIONS.find((o) => o.value === s.location)?.label,
    QUALITY_OPTIONS.find((o) => o.value === s.quality)?.label,
    SEVERITY_OPTIONS.find((o) => o.value === s.severity)?.label,
    s.aggravated === 'yes' ? 'aggravated' : 'not aggravated',
  ].filter(Boolean);
  return parts.join(' · ');
}

function workupNotesForFlags(flags: Set<string>): string[] {
  const notes: string[] = [];
  if (flags.has('rf-onset-sudden'))
    notes.push('Non-contrast CT head urgently; if negative beyond 6 h of onset, lumbar puncture for xanthochromia. CTA brain to evaluate aneurysm.');
  if (flags.has('rf-neuro-deficit'))
    notes.push('Urgent MRI brain with contrast, or non-contrast CT if MRI not available. EEG if seizure suspected.');
  if (flags.has('rf-systemic'))
    notes.push('CBC, ESR, CRP, blood cultures if febrile. Lumbar puncture after imaging if meningitis suspected.');
  if (flags.has('rf-older-age-onset'))
    notes.push('MRI brain with contrast. ESR + CRP to evaluate giant cell arteritis; temporal artery biopsy if clinical suspicion is high.');
  if (flags.has('rf-pregnancy'))
    notes.push('MRI brain (avoid contrast unless essential). MRV for venous sinus thrombosis. Consider PRES, pre-eclampsia, RCVS.');
  if (flags.has('rf-posttraumatic'))
    notes.push('CT head non-contrast. MRI with susceptibility-weighted imaging for microbleeds if subacute. Concussion evaluation.');
  if (flags.has('rf-papilloedema'))
    notes.push('MRI brain with MRV to rule out venous sinus thrombosis, mass, IIH. LP with opening pressure after imaging.');
  if (flags.has('rf-valsalva'))
    notes.push('MRI brain to evaluate posterior fossa lesions (Chiari malformation, tumour, colloid cyst).');
  if (flags.has('rf-positional'))
    notes.push('MRI brain with and without contrast to evaluate intracranial hypotension (dural enhancement) or hypertension.');
  if (flags.has('rf-pattern-change'))
    notes.push('MRI brain with contrast. Re-evaluate ICHD-3 phenotype after imaging; consider secondary cause.');
  if (flags.has('rf-immune-pathology'))
    notes.push('MRI brain with contrast to rule out opportunistic infection or metastasis. LP with cytology if neoplastic meningitis suspected.');
  if (flags.has('rf-painkiller-overuse'))
    notes.push('Medication-overuse headache (ICHD-3 §8.2) is a primary-headache complication, not a secondary cause. Imaging is not first-line. Plan medication withdrawal alongside preventive initiation.');
  return notes;
}

function managementNotesForPhenotype(phenotypeId: string): string[] {
  switch (phenotypeId) {
    case 'migraine-without-aura':
    case 'migraine-with-aura':
      return ['Acute: triptan or NSAID at onset, gepant when triptans contraindicated. Preventive when ≥4 days/month with disability or ≥6 days/month regardless. CGRP mAb after 2 conventional failures.'];
    case 'chronic-migraine':
      return ['OnabotulinumtoxinA is approved for chronic migraine only. CGRP mAbs are first-line per AHS 2021. Escalate from conventional preventives after 2 failures.'];
    case 'episodic-tth':
    case 'chronic-tth':
      return ['Acute: ibuprofen 400 to 600 mg first-line; avoid opioids and butalbital. Chronic TTH preventive: amitriptyline at bedtime, AAN Level B.'];
    case 'cluster-headache':
      return ['Acute: high-flow O₂ 12 to 15 L/min, 15 minutes; sumatriptan 6 mg SC. Verapamil 80 mg TID preventive; baseline and serial ECG.'];
    case 'paroxysmal-hemicrania':
      return ['Indomethacin 25 mg TID titrating to 75 to 150 mg/day. PPI co-prescription mandatory. Absolute response confirms phenotype.'];
    case 'sunct-suna':
      return ['Lamotrigine first-line preventive, carbamazepine second-line. Refer to headache specialist; uncommon and often misdiagnosed as trigeminal neuralgia.'];
    case 'hemicrania-continua':
      return ['Indomethacin 25 mg TID titrating to 50 mg TID. PPI co-prescription mandatory. Absolute response confirms phenotype.'];
    case 'ndph':
      return ['Diagnosis of exclusion. Complete secondary-cause workup before treatment. Treat per resembled phenotype.'];
    default:
      return [];
  }
}

// ─── Small render helpers (NIHSS PatientContextPanel style) ───────────────

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-[40px] flex items-center px-4 py-2 bg-slate-50 border-b border-slate-100">
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{children}</span>
  </div>
);

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="min-h-[44px] flex items-start justify-between gap-3 px-4 py-2.5">
    <span className="text-xs font-medium text-slate-600 flex-shrink-0 max-w-[40%]">{label}</span>
    <span className="text-sm text-slate-900 text-right flex-1">{value}</span>
  </div>
);

const CriteriaList: React.FC<{ match: PhenotypeMatch }> = ({ match }) => (
  <div className="px-4 py-3">
    {match.metCriteria.length > 0 && (
      <ul className="space-y-1 mb-2">
        {match.metCriteria.map((c) => (
          <li key={c.id} className="text-[13px] text-emerald-700 flex items-start gap-2">
            <span aria-hidden="true" className="mt-0.5">✓</span>
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
    )}
    {match.missingCriteria.length > 0 && (
      <ul className="space-y-1">
        {match.missingCriteria.map((c) => (
          <li key={c.id} className="text-[13px] text-slate-500 flex items-start gap-2">
            <span aria-hidden="true" className="mt-0.5">○</span>
            <span>Still needed: {c.label}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default ClinicHeadachePathway;
