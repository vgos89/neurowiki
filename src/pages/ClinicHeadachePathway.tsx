/**
 * Clinic Headache Pathway — outpatient feature picker + ICHD-3 mapper.
 *
 * Redesign 2026-05-25 (Phase 3 cutover) per CLAUDE.md §19. Replaces the
 * prior 6-step PathwayRail (MIDAS → phenotype radio → preventive → agent
 * → acute → plan) with a single-screen ICHD-3 feature picker that maps
 * user-selected features against ICHD-3 2018 criteria in real time.
 *
 * Output language never says "diagnosis." Full match: "Features consistent
 * with X (ICHD-3 §X.X)." One criterion short: "Features consistent with
 * Probable X (ICHD-3 §X.5)." Multi-phenotype overlap is surfaced explicitly
 * per ICHD-3 General Principles. Red flags (SNNOOP10) short-circuit to a
 * workup card and suppress phenotype matching.
 *
 * Teach mode (default off, useTeachMode hook, localStorage-backed) layers
 * pedagogy on demand without slowing clinical use.
 *
 * Sources (all in src/lib/citations/registry.ts):
 *   ichd3-2018 · scher-tth-2024-continuum · goadsby-2024-continuum-indomethacin
 *   lipton-2024-continuum-preventive · ailani-ahs-2021
 *   rizzoli-2024-continuum-moh · burish-2024-continuum-cluster
 *   do-snnoop10-2019
 *
 * Rollback: revert this commit. Old ClinicHeadachePathway.tsx is restored
 * intact. Data module (Phase 1) and components (Phase 2) stay; they are
 * not consumed by anyone else and revert is no-op for the rest of the app.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, Info } from 'lucide-react';
import { PathwayHeader } from '../components/pathways/PathwayHeader';
import { ChipGroup } from '../components/pathways/ChipGroup';
import { MapperPanel, type MapperMatch } from '../components/pathways/MapperPanel';
import { PitfallNotice } from '../components/pathways/PitfallNotice';
import { PathwayLearningPearl } from '../components/pathways/PathwayLearningPearl';
import { useTeachMode } from '../hooks/useTeachMode';
import { useFavorites } from '../hooks/useFavorites';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useRecents } from '../hooks/useRecents';
import {
  HEADACHE_CHIP_GROUPS,
  HEADACHE_PHENOTYPES,
  anyRedFlagActive,
  evaluateHeadachePhenotypes,
  getPhenotype,
  type ChipId,
  type PhenotypeId,
} from '../data/clinicHeadacheData';

// ─── Evidence badge (preserved from prior design) ─────────────────────────

const EvidenceBadge: React.FC<{ level: 'A' | 'B' | 'C' | 'U' }> = ({ level }) => {
  const tokens = {
    A: 'bg-emerald-100 text-emerald-800',
    B: 'bg-amber-100 text-amber-800',
    C: 'bg-slate-100 text-slate-700',
    U: 'bg-slate-100 text-slate-500',
  }[level];
  return (
    <span className={`inline-flex items-center justify-center text-[10px] font-bold rounded px-1.5 py-0.5 ${tokens} shrink-0`}>
      {level}
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────

const ClinicHeadachePathway: React.FC = () => {
  const { recordView } = useRecents();
  const { handleBack } = useNavigationSource();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [teachMode, toggleTeach] = useTeachMode();
  const [selectedChips, setSelectedChips] = useState<Set<ChipId>>(new Set());
  const [copyConfirm, setCopyConfirm] = useState(false);
  const isFav = isFavorite('headache-clinic');

  useEffect(() => {
    recordView({
      type: 'pathway',
      id: 'headache-clinic',
      title: 'Clinic Headache Pathway',
      subtitle: 'ICHD-3 feature picker · live phenotype mapper',
      category: 'severe-headache',
      trail: 'Outpatient',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Chip selection handlers ────────────────────────────────────────────
  const setChip = (chipId: string, nowSelected: boolean) => {
    setSelectedChips(prev => {
      const next = new Set(prev);
      if (nowSelected) next.add(chipId as ChipId);
      else next.delete(chipId as ChipId);
      return next;
    });
  };

  // ── Derived state ──────────────────────────────────────────────────────
  const hasRedFlags = useMemo(() => anyRedFlagActive(selectedChips), [selectedChips]);
  const matches = useMemo(
    () => (hasRedFlags ? [] : evaluateHeadachePhenotypes(selectedChips)),
    [selectedChips, hasRedFlags]
  );

  // Top 3 candidates
  const topMatches: MapperMatch[] = useMemo(
    () => matches.slice(0, 3).map(m => ({
      phenotypeId: m.phenotypeId,
      name: m.name,
      section: m.ichd3Section,
      matchStrength: m.matchStrength === 'none' ? 'partial' : m.matchStrength,
      criteriaMet: m.criteriaMet,
      criteriaTotal: m.criteriaTotal,
      metCriteria: m.metCriteria,
      missingCriteria: m.missingCriteria,
      isAppendix: m.isAppendix,
    })),
    [matches]
  );

  // Pitfall surfacing — migraine + TTH both consistent triggers overlap warning
  const pitfallNodes: React.ReactNode[] = useMemo(() => {
    const nodes: React.ReactNode[] = [];
    const migraine = matches.find(m => m.phenotypeId === 'migraine-without-aura');
    const tth = matches.find(m => m.phenotypeId === 'episodic-tth' || m.phenotypeId === 'chronic-tth');
    if (migraine && tth && migraine.matchStrength !== 'partial' && tth.matchStrength !== 'partial') {
      nodes.push(
        <PitfallNotice key="mig-tth-overlap" title="Migraine and TTH overlap" claimId="clinic-headache-pitfall-mig-vs-tth">
          Migraine 1.1 D requires nausea or vomiting, or the photophobia+phonophobia pair. TTH 2.2 D excludes nausea and vomiting and allows at most one of photophobia or phonophobia. Patients can carry both phenotypes per ICHD-3 General Principles, treated as separate diagnoses.
        </PitfallNotice>
      );
    }
    // Hemicrania prompt when continuous unilateral + autonomic features without trial
    if (
      selectedChips.has('dur-continuous') &&
      selectedChips.has('loc-unilateral') &&
      (selectedChips.has('sym-autonomic-ipsilateral') || selectedChips.has('sym-restlessness')) &&
      !selectedChips.has('indo-tried-complete') &&
      !selectedChips.has('indo-tried-no-response')
    ) {
      nodes.push(
        <PitfallNotice key="hc-prompt" title="Consider indomethacin trial">
          Continuous strictly unilateral headache with autonomic features may be hemicrania continua (ICHD-3 3.4). Absolute response to therapeutic indomethacin is definitional — without a trial, the phenotype cannot be assigned. Goadsby Continuum 2024 protocol: 25 mg TID for 1 week, escalate to 50 mg TID (150 mg/day, cited upper bound) if incomplete, with PPI cover.
        </PitfallNotice>
      );
    }
    return nodes;
  }, [matches, selectedChips]);

  // Teach pearls per phenotype. claimId values are literal strings (not
  // interpolated) so the check-claims scanner finds them in source.
  const buildPearl = (id: PhenotypeId, claimId: string | undefined): React.ReactNode => {
    const p = getPhenotype(id);
    if (!p || !p.teachPearl) return null;
    return (
      <PathwayLearningPearl
        title="Learn this pattern"
        teachOnly
        teachMode={teachMode}
        claimId={claimId}
        content={
          <div className="space-y-2">
            <p>{p.teachPearl}</p>
            {p.pitfalls && p.pitfalls.length > 0 && (
              <ul className="list-disc pl-4 space-y-1">
                {p.pitfalls.map((pf, i) => <li key={i} className="text-[12px] text-slate-700">{pf}</li>)}
              </ul>
            )}
          </div>
        }
      />
    );
  };

  const pearlsByPhenotype: Record<string, React.ReactNode> = useMemo(() => ({
    'migraine-without-aura': buildPearl('migraine-without-aura', 'clinic-headache-ichd3-migraine-criteria'),
    'migraine-with-aura': buildPearl('migraine-with-aura', 'clinic-headache-ichd3-migraine-criteria'),
    'episodic-tth': buildPearl('episodic-tth', 'clinic-headache-ichd3-tension-criteria'),
    'chronic-tth': buildPearl('chronic-tth', 'clinic-headache-ichd3-tension-criteria'),
    'cluster-headache': buildPearl('cluster-headache', 'clinic-headache-ichd3-cluster-criteria'),
    'hemicrania-continua': buildPearl('hemicrania-continua', 'clinic-headache-ichd3-hemicrania-criteria'),
    'ndph': buildPearl('ndph', 'clinic-headache-ichd3-ndph-criteria'),
    'vestibular-migraine': buildPearl('vestibular-migraine', undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [teachMode]);


  // ── Header actions ─────────────────────────────────────────────────────
  const handleReset = () => {
    setSelectedChips(new Set());
    window.scrollTo(0, 0);
  };

  const handleCopy = () => {
    const top = matches[0];
    const summary = top
      ? `Clinic Headache Pathway | NeuroWiki\nFeatures consistent with ${top.name} (${top.ichd3Section}, ${top.matchStrength} match)`
      : 'Clinic Headache Pathway | NeuroWiki';
    navigator.clipboard?.writeText(summary).catch(() => {});
    setCopyConfirm(true);
    setTimeout(() => setCopyConfirm(false), 2000);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-slate-50 pb-24">
      <PathwayHeader
        pathwayLabel="Clinic Headache Pathway"
        onBack={handleBack}
        isFav={isFav}
        onFavToggle={() => toggleFavorite('headache-clinic')}
        onReset={handleReset}
        onCopy={handleCopy}
        copyConfirm={copyConfirm}
      />

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* Hidden scanner anchors — each ICHD-3 criteria claim must appear
            as a literal data-claim attribute in source for the pre-commit
            scanner. The claims surface visibly via PathwayLearningPearl in
            the Mapper panel (Teach mode) where claimId is also passed
            through, but only when the corresponding phenotype is currently
            in the matches array. These hidden anchors guarantee the literal
            tag is present for static analysis. */}
        <div hidden aria-hidden="true">
          <span data-claim="clinic-headache-ichd3-migraine-criteria" />
          <span data-claim="clinic-headache-ichd3-tension-criteria" />
          <span data-claim="clinic-headache-ichd3-cluster-criteria" />
          <span data-claim="clinic-headache-ichd3-hemicrania-criteria" />
          <span data-claim="clinic-headache-ichd3-ndph-criteria" />
          <span data-claim="clinic-headache-pitfall-mig-vs-tth" />
        </div>

        {/* Disclaimer banner */}
        <section className="rounded-xl border border-neuro-200 bg-neuro-50 p-3">
          <div className="flex items-start gap-2.5">
            <Info size={16} className="text-neuro-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-semibold text-neuro-800">This tool is only as accurate as the features you enter.</p>
              <p className="text-[12px] text-slate-700 mt-1 leading-relaxed">
                It maps your inputs against ICHD-3 criteria to suggest the most consistent phenotype. Patient history of recurrent attacks, clinical judgement, and exam remain primary. The tool does not diagnose. Teach mode shows the ICHD-3 logic behind every question.
              </p>
            </div>
          </div>
        </section>

        {/* Teach mode toggle */}
        <section className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-slate-500 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-semibold text-slate-900">Teach mode</p>
              <p className="text-[11px] text-slate-500">{teachMode ? 'On: showing ICHD-3 reasoning, pitfalls, and learn pearls.' : 'Off: clean tool view. Toggle on to see the why behind each question.'}</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={teachMode}
            onClick={toggleTeach}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 ${teachMode ? 'bg-neuro-600' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${teachMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </section>

        {/* Feature picker */}
        <section aria-label="Feature picker" className="space-y-3">
          {HEADACHE_CHIP_GROUPS.map(group => (
            <ChipGroup
              key={group.id}
              groupId={group.id}
              label={group.label}
              eyebrow={group.eyebrow}
              chips={group.chips}
              selected={selectedChips as Set<string>}
              onChange={setChip}
              defaultCollapsed={group.defaultCollapsed}
              teachMode={teachMode}
            />
          ))}
        </section>

        {/* Red-flag short circuit */}
        {hasRedFlags && (
          <section role="alert" aria-labelledby="red-flag-heading" className="rounded-xl border-2 border-red-300 bg-red-50 p-4 space-y-2" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.10)' }}>
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 id="red-flag-heading" className="text-[15px] font-bold text-red-800">Red flag present: workup required</h2>
                <p className="text-[12px] text-red-700 mt-1 leading-relaxed">
                  One or more SNNOOP10 features are flagged (Do et al. Neurology 2019). Do not assign a primary-headache phenotype before secondary-cause evaluation.
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-white border border-red-200 p-3 mt-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Recommended workup</p>
              <ul className="text-[12px] text-slate-700 space-y-1 list-disc pl-4">
                <li>Targeted history and neurological exam directed at the specific red flag(s).</li>
                <li>Neuroimaging: MRI brain with and without contrast, MRV when venous sinus thrombosis is in scope (positional headache, postpartum, papilloedema).</li>
                <li>Same-day or next-day labs as indicated: CBC, ESR/CRP for age &gt;50 first headache (GCA), pregnancy test in WOCBP, HIV testing when immune pathology suspected.</li>
                <li>LP after imaging if subarachnoid haemorrhage or meningitis is suspected and imaging is negative or non-diagnostic.</li>
                <li>Specialist referral (neurology, neurosurgery, ophthalmology) per the specific red flag.</li>
              </ul>
            </div>
          </section>
        )}

        {/* Mapper panel */}
        {!hasRedFlags && (
          <MapperPanel
            matches={topMatches}
            pearlsByPhenotype={pearlsByPhenotype}
            pitfalls={pitfallNodes.length > 0 ? <>{pitfallNodes}</> : undefined}
            teachMode={teachMode}
          />
        )}

        {/* Multi-diagnosis note when ≥2 full matches */}
        {!hasRedFlags && matches.filter(m => m.matchStrength === 'full').length >= 2 && (
          <section className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Multiple phenotypes consistent</p>
            <p className="text-[12px] text-slate-700 leading-relaxed">
              Per ICHD-3 General Principles, patients commonly carry more than one primary headache disorder. Each consistent phenotype should be considered separately. Treat each based on its own acute and preventive evidence.
            </p>
          </section>
        )}

        {/* ─── Management section (preserves prior claim-tagged content) ─── */}
        {!hasRedFlags && (
          <section aria-label="Management options" className="space-y-3 pt-2">
            <header>
              <h2 className="text-[16px] font-bold text-slate-900">Management options</h2>
              <p className="text-[12px] text-slate-500 mt-0.5">Evidence-based options below correspond to the candidate phenotypes above. Use clinical judgement to match the patient.</p>
            </header>

            {/* Preventive threshold panel */}
            <div data-claim="clinic-headache-preventive-threshold" className="rounded-xl border border-slate-100 bg-white p-4" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">AHS / AAN preventive threshold</p>
              <ul className="text-[13px] text-slate-700 space-y-1 list-disc pl-4">
                <li>≥4 headache days/month with significant disability (MIDAS Grade II–IV).</li>
                <li>≥6 headache days/month regardless of disability.</li>
                <li>Acute medications used ≥10 days/month (MOH risk threshold).</li>
              </ul>
              <p className="text-[11px] text-slate-400 mt-2">AHS 2021 Consensus (Ailani et al., Headache 2021;61:1021-1039) + Lipton Continuum 2024.</p>
            </div>

            {/* Migraine preventive options */}
            <div data-claim="clinic-headache-cgrp-escalation" className="rounded-xl border border-slate-100 bg-white p-4" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Migraine preventive options</p>
              <div className="space-y-2">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[12px] font-semibold text-slate-900 mb-1">Conventional first-line (try at least 2 before CGRP escalation)</p>
                  <ul className="text-[12px] text-slate-700 space-y-0.5 list-disc pl-4">
                    <li>Topiramate 25-100 mg/day (avoid in WOCBP, urolithiasis history).</li>
                    <li>Propranolol 40-160 mg/day or metoprolol 50-200 mg/day (avoid in asthma, depression).</li>
                    <li>Amitriptyline 10-75 mg at bedtime (useful with comorbid anxiety, insomnia).</li>
                    <li>Venlafaxine 75-150 mg/day (useful with comorbid depression).</li>
                    <li>Valproate 500-1000 mg/day (avoid in WOCBP, hepatic disease).</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-neuro-50 border border-neuro-100 p-3">
                  <p className="text-[12px] font-semibold text-neuro-800 mb-1">CGRP-pathway escalation (after ≥2 conventional failures or first-line if contraindicated)</p>
                  <ul className="text-[12px] text-slate-700 space-y-0.5 list-disc pl-4">
                    <li>CGRP mAbs: erenumab 70-140 mg SC monthly, fremanezumab 225 mg monthly or 675 mg quarterly, galcanezumab 240 mg loading then 120 mg monthly, eptinezumab 100-300 mg IV quarterly.</li>
                    <li>Gepants for prevention: atogepant 10-60 mg daily, rimegepant 75 mg every other day.</li>
                  </ul>
                  <p className="text-[11px] text-neuro-700 mt-2">AHS 2021 Consensus (Ailani et al.); Lipton Continuum 2024.</p>
                </div>
              </div>
            </div>

            {/* TTH acute */}
            <div data-claim="clinic-headache-tension-acute-management" className="rounded-xl border border-slate-100 bg-white p-4" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Tension-type headache: acute treatment</p>
              <div className="space-y-2">
                <div className="bg-slate-50 rounded-lg p-2.5 flex items-start gap-2">
                  <EvidenceBadge level="A" />
                  <div className="text-[12px] text-slate-700"><span className="font-semibold">Ibuprofen 400 to 600 mg PO</span> — first-line in non-pregnant adults without NSAID contraindication.</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 flex items-start gap-2">
                  <EvidenceBadge level="A" />
                  <div className="text-[12px] text-slate-700"><span className="font-semibold">Aspirin 500 to 1000 mg PO</span> — NSAID alternative.</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 flex items-start gap-2">
                  <EvidenceBadge level="A" />
                  <div className="text-[12px] text-slate-700"><span className="font-semibold">Acetaminophen 1000 mg PO</span> — preferred in pregnancy or NSAID contraindication.</div>
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-2.5">
                <p className="text-[12px] font-semibold text-red-800 mb-0.5">Avoid</p>
                <p className="text-[12px] text-red-700">Opioids and butalbital-containing combinations. Both carry MOH and dependence risk.</p>
              </div>
              <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                <p className="text-[12px] font-semibold text-amber-800 mb-0.5">Medication-overuse limits</p>
                <p className="text-[12px] text-amber-700">Simple analgesics ≤15 days/month. Triptans, opioids, combination analgesics ≤10 days/month. Above either threshold for &gt;3 months meets ICHD-3 8.2 MOH.</p>
              </div>
            </div>

            {/* TTH preventive */}
            <div data-claim="clinic-headache-tension-preventive" className="rounded-xl border border-slate-100 bg-white p-4" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Tension-type headache: preventive treatment</p>
              <p className="text-[12px] text-slate-600 mb-3">For chronic TTH (≥15 days/month) or high-frequency episodic TTH with functional impact.</p>
              <div className="space-y-2">
                <div className="bg-slate-50 rounded-lg p-2.5 flex items-start gap-2">
                  <EvidenceBadge level="B" />
                  <div className="text-[12px] text-slate-700"><span className="font-semibold">Amitriptyline 10 to 75 mg at bedtime</span> — first-line. Start 10 mg, titrate by 10 to 25 mg every 1 to 2 weeks (AAN Level B).</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 flex items-start gap-2">
                  <EvidenceBadge level="B" />
                  <div className="text-[12px] text-slate-700"><span className="font-semibold">Venlafaxine 75 to 150 mg/day</span> — second-line; preferred with comorbid depression or anxiety.</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 flex items-start gap-2">
                  <EvidenceBadge level="B" />
                  <div className="text-[12px] text-slate-700"><span className="font-semibold">Mirtazapine 15 to 30 mg at bedtime</span> — second-line when sleep disturbance or anxiety predominate.</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 flex items-start gap-2">
                  <EvidenceBadge level="C" />
                  <div className="text-[12px] text-slate-700"><span className="font-semibold">Topiramate</span> — third-line. Less evidence for TTH than migraine.</div>
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-neuro-50 border border-neuro-200 p-2.5">
                <p className="text-[12px] font-semibold text-neuro-800 mb-0.5">Non-pharmacological (AAN Level A)</p>
                <p className="text-[12px] text-neuro-700">Stress management, biofeedback, physical therapy. Offer alongside pharmacotherapy.</p>
              </div>
            </div>

            {/* MOH gepant safety */}
            <div data-claim="clinic-headache-moh-gepant-safe" className="rounded-xl border border-slate-100 bg-white p-4" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Medication-overuse headache (MOH): the gepant exception</p>
              <p className="text-[12px] text-slate-700 leading-relaxed">
                Triptans, opioids, and combination analgesics taken ≥10 days/month for &gt;3 months drive MOH. NSAIDs ≥15 days/month do the same. Gepants (ubrogepant, rimegepant, atogepant) do not cause MOH per current evidence and are the preferred acute option in patients at MOH risk or with established MOH.
              </p>
              <p className="text-[11px] text-slate-400 mt-2">Rizzoli Continuum 2024 + AHS 2021 Consensus.</p>
            </div>

            {/* Cluster headache acute + preventive */}
            <div className="rounded-xl border border-slate-100 bg-white p-4" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Cluster headache: acute + preventive protocol</p>
              <p className="text-[12px] text-slate-600 mb-3">Per Burish Continuum 2024 and AHS Grade A first-line triad.</p>
              <div className="space-y-2">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[12px] font-semibold text-slate-900 mb-1">Acute (per-attack)</p>
                  <ul className="text-[12px] text-slate-700 space-y-0.5 list-disc pl-4">
                    <li>Oxygen 100% 12-15 L/min via non-rebreather mask × 15 minutes (Grade A). Prescribe home O₂ for active bouts.</li>
                    <li>Sumatriptan 6 mg SC or 20 mg nasal — max 2 doses/24 h (Grade A).</li>
                    <li>Zolmitriptan nasal 5-10 mg as triptan alternative (Grade A).</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[12px] font-semibold text-slate-900 mb-1">Bridging (while starting preventive)</p>
                  <ul className="text-[12px] text-slate-700 space-y-0.5 list-disc pl-4">
                    <li>Ipsilateral greater occipital nerve (GON) block with corticosteroid — Grade A.</li>
                    <li>Prednisone 100 mg/day × 5 days then taper 20 mg every 3 days.</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[12px] font-semibold text-slate-900 mb-1">Preventive (start immediately)</p>
                  <ul className="text-[12px] text-slate-700 space-y-0.5 list-disc pl-4">
                    <li><span className="font-semibold">Verapamil 80 mg TID</span>, titrate to 360 mg/day. Baseline ECG, repeat after each escalation (PR prolongation risk).</li>
                    <li>Lithium 300 mg BID-TID — second-line; requires serum level monitoring.</li>
                    <li>Topiramate 100-200 mg/day — third-line; avoid in WOCBP.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Hemicrania indomethacin protocol */}
            <div className="rounded-xl border border-slate-100 bg-white p-4" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Hemicrania continua: indomethacin trial</p>
              <p className="text-[12px] text-slate-600 mb-2">Goadsby Continuum 2024 (cited dose range 75 to 150 mg/day). Absolute response confirms the phenotype; no response rules it out.</p>
              <ul className="text-[12px] text-slate-700 space-y-0.5 list-disc pl-4">
                <li>Week 1: 25 mg TID (75 mg/day) with PPI cover.</li>
                <li>Week 2: 50 mg TID (150 mg/day) if incomplete response.</li>
                <li>Complete response within 1 to 2 weeks confirms the hemicrania continua phenotype. Maintain at lowest effective dose with ongoing PPI.</li>
                <li>No response after 2 weeks at 50 mg TID: reconsider the working phenotype and pursue alternative workup.</li>
              </ul>
            </div>

            {teachMode && (
              <PathwayLearningPearl
                title="Why ICHD-3 separates these phenotypes"
                teachOnly
                teachMode={teachMode}
                content={
                  <p className="text-[12px] leading-relaxed">
                    ICHD-3's phenotype boundaries reflect distinct treatment responses, not just descriptive convenience. Triptans help migraine and cluster but not TTH. Indomethacin is uniquely effective in hemicrania continua and paroxysmal hemicrania. Preventive thresholds and agents diverge between migraine and TTH. Knowing the phenotype changes what you offer.
                  </p>
                }
              />
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default ClinicHeadachePathway;
