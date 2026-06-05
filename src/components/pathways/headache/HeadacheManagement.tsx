import React from 'react';

/**
 * HeadacheManagement — per-phenotype treatment/management cards for the clinic
 * headache pathway result, rendered inside each result row's opt-in
 * "Show management" disclosure (HeadacheResultList).
 *
 * BESPOKE, single-surface (architect §17.1 Stage One-b condition): this is the
 * home for the relocated clinic-headache dosing cards, not a general management
 * renderer. If a second pathway needs per-phenotype management cards, revisit
 * for a shared shape (mirrors the HeadacheResultList fork note).
 *
 * Stage One-b scope: every dosing card below is relocated BYTE-FOR-BYTE from
 * ClinicHeadachePathway.tsx (the former inline treatment block). No dosing,
 * threshold, grade, drug, or qualifier text is changed; verbatim relocation is
 * a hard requirement of the clinical-review gate
 * (docs/reviews/clinical-headache-treatment-onrow-expander.md). The ICHD-3
 * criteria cards are intentionally NOT here: criteria render once in the row
 * above; the 7 pure-criteria claims are carried as hidden literal markers in
 * HeadacheResultList, and the ndph criteria claim (which bundled a management
 * note) is tagged here on the management card.
 *
 * Markup (a11y, WCAG 1.3.1 Info and Relationships): each card is an <h4> section
 * heading followed by a <dl>; each Row is a <dt> label paired with its <dd>
 * value, so the label/value relationship is programmatically exposed. Dosing
 * values are left-aligned so long strings wrap legibly on narrow viewports.
 * Visual styling (dividers, padding, font sizes, card chrome) is unchanged.
 */

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="min-h-[40px] flex items-center px-4 py-2 m-0 bg-slate-50 border-b border-slate-100">
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{children}</span>
  </h4>
);

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="min-h-[44px] flex items-start justify-between gap-3 px-4 py-2.5">
    <dt className="text-xs font-medium text-slate-600 flex-shrink-0 max-w-[40%]">{label}</dt>
    <dd className="text-sm text-slate-900 text-left flex-1 m-0">{value}</dd>
  </div>
);

const CARD = 'bg-white border border-slate-100 rounded-xl divide-y divide-slate-50';
const DL = 'm-0 divide-y divide-slate-50';

// Phenotypes that carry a management block (the 10 that had inline treatment in
// the former page block). The 11th engine phenotype had no treatment card and
// gets no "Show management" disclosure (preserves prior behaviour).
const MANAGED = new Set<string>([
  'migraine-without-aura', 'migraine-with-aura',
  'episodic-tth', 'chronic-tth',
  'cluster-headache', 'hemicrania-continua', 'ndph',
  'chronic-migraine', 'paroxysmal-hemicrania', 'sunct-suna',
]);

export const hasHeadacheManagement = (phenotypeId: string): boolean => MANAGED.has(phenotypeId);

export const HeadacheManagement: React.FC<{ phenotypeId: string }> = ({ phenotypeId }) => {
  switch (phenotypeId) {
    case 'migraine-without-aura':
    case 'migraine-with-aura':
      return (
        <div className="space-y-3">
          <div data-claim="clinic-headache-moh-gepant-safe" className={CARD}>
            <SectionHeader>Acute treatment</SectionHeader>
            <dl className={DL}>
              <Row label="First-line" value="Sumatriptan 50 to 100 mg PO at onset (if no CVD contraindication)" />
              <Row label="NSAID" value="Ibuprofen 600 mg or naproxen 500 mg for milder attacks" />
              <Row label="If triptans contraindicated" value="Gepant (ubrogepant, rimegepant) or lasmiditan; no MOH risk with gepants" />
              <Row label="Add" value="Antiemetic when nausea is prominent" />
            </dl>
          </div>
          <div data-claim="clinic-headache-preventive-threshold" className={CARD}>
            <SectionHeader>Preventive threshold (AHS 2021)</SectionHeader>
            <dl className={DL}>
              <Row label="Indication" value="≥4 days/month with disability, ≥6 days/month regardless, or acute use ≥10 days/month" />
              <Row label="First-line" value="Propranolol or topiramate" />
              <Row label="Comorbid anxiety or depression" value="Amitriptyline or venlafaxine" />
            </dl>
          </div>
          <div data-claim="clinic-headache-cgrp-escalation" className={CARD}>
            <SectionHeader>CGRP escalation</SectionHeader>
            <dl className={DL}>
              <Row label="After 2 failures" value="Erenumab, fremanezumab, galcanezumab, or eptinezumab" />
              <Row label="Oral CGRP" value="Atogepant or rimegepant for patients preferring oral therapy or with MOH risk" />
            </dl>
          </div>
        </div>
      );

    case 'episodic-tth':
    case 'chronic-tth':
      return (
        <div className="space-y-3">
          <div data-claim="clinic-headache-tension-acute-management" className={CARD}>
            <SectionHeader>Acute treatment (Scher Continuum 2024)</SectionHeader>
            <dl className={DL}>
              <Row label="First-line" value="Ibuprofen 400 to 600 mg PO" />
              <Row label="Alternative" value="Aspirin 500 to 1000 mg PO" />
              <Row label="Pregnancy or NSAID contraindication" value="Acetaminophen 1000 mg PO" />
              <Row label="Avoid" value="Opioids and butalbital combinations (MOH and dependence risk)" />
              <Row label="MOH limits" value="≤15 days/month simple analgesics; ≤10 days/month triptans or opioids" />
            </dl>
          </div>
          {phenotypeId === 'chronic-tth' && (
            <div data-claim="clinic-headache-tension-preventive" className={CARD}>
              <SectionHeader>Preventive treatment</SectionHeader>
              <dl className={DL}>
                <Row label="First-line" value="Amitriptyline 10 to 75 mg at bedtime (AAN Level B)" />
                <Row label="Depression or anxiety comorbid" value="Venlafaxine 75 to 150 mg/day" />
                <Row label="Sleep or anxiety predominant" value="Mirtazapine 15 to 30 mg at bedtime" />
                <Row label="Third-line" value="Topiramate (less evidence for TTH than migraine)" />
                <Row label="Non-pharmacologic (Level A)" value="Stress management, biofeedback, physical therapy" />
              </dl>
            </div>
          )}
        </div>
      );

    case 'cluster-headache':
      return (
        <div className="space-y-3">
          <div data-claim="clinic-headache-cluster-acute-management" className={CARD}>
            <SectionHeader>Acute treatment (Burish Continuum 2024)</SectionHeader>
            <dl className={DL}>
              <Row label="High-flow O₂" value="12 to 15 L/min via non-rebreather, 15 minutes (AHS Grade A)" />
              <Row label="Triptan" value="Sumatriptan 6 mg SC or 20 mg nasal (AHS Grade A)" />
              <Row label="Bridging" value="Ipsilateral GON block with corticosteroid; prednisone 100 mg/day × 5 d then taper" />
            </dl>
          </div>
          <div data-claim="clinic-headache-cluster-preventive" className={CARD}>
            <SectionHeader>Preventive treatment</SectionHeader>
            <dl className={DL}>
              <Row label="First-line" value="Verapamil 80 mg TID, titrate to 360 mg/day with baseline and follow-up ECG" />
              <Row label="Second-line" value="Lithium 300 mg BID to TID; serum-level monitoring required" />
              <Row label="Third-line" value="Topiramate 100 to 200 mg/day; avoid in WOCBP without contraception" />
            </dl>
          </div>
        </div>
      );

    case 'hemicrania-continua':
      return (
        <div className="space-y-3">
          <div data-claim="clinic-headache-hc-indomethacin-protocol" className={CARD}>
            <SectionHeader>Indomethacin protocol (Goadsby Continuum 2024)</SectionHeader>
            <dl className={DL}>
              <Row label="Week 1" value="Indomethacin 25 mg TID" />
              <Row label="Week 2 if incomplete" value="50 mg TID (150 mg/day, the maximum per quoted text)" />
              <Row label="GI protection" value="Co-prescribe PPI; co-prescription is mandatory" />
              <Row label="Diagnostic confirmation" value="Complete response within 1 to 2 weeks confirms the hemicrania continua phenotype" />
            </dl>
          </div>
        </div>
      );

    case 'ndph':
      // ndph's only management content was an inline Row under its criteria
      // claim in the page; relocated here verbatim. The ndph criteria claim is
      // tagged on this management card (where its management note renders), so
      // ndph needs no hidden criteria marker, unlike the 7 pure-criteria claims.
      return (
        <div className="space-y-3">
          <div data-claim="clinic-headache-ichd3-ndph-criteria" className={CARD}>
            <SectionHeader>Management</SectionHeader>
            <dl className={DL}>
              <Row label="Management" value="NDPH is a diagnosis of exclusion; complete secondary-cause workup before treating. Treat per the phenotype the headache most resembles." />
            </dl>
          </div>
        </div>
      );

    case 'chronic-migraine':
      return (
        <div className="space-y-3">
          <div data-claim="clinic-headache-chronic-migraine-acute" className={CARD}>
            <SectionHeader>Acute treatment</SectionHeader>
            <dl className={DL}>
              <Row label="First-line" value="NSAID or triptan at onset, same stepwise framework as episodic migraine (Burch Continuum 2024)" />
              <Row label="MOH risk" value="Gepant (rimegepant, ubrogepant) preferred when acute-medication days are high; gepants do not cause MOH (Rizzoli 2024)" />
              <Row label="Refractory" value="Combination therapy (antiemetic + analgesic ± DHE); IV DHE for refractory ED migraine" />
            </dl>
          </div>
          <div data-claim="clinic-headache-chronic-migraine-preventive" className={CARD}>
            <SectionHeader>Preventive treatment</SectionHeader>
            <dl className={DL}>
              <Row label="OnabotulinumtoxinA" value="Approved for chronic migraine only (per Lipton 2024). Standard PREEMPT-aligned dosing per AHS." />
              <Row label="CGRP mAb" value="Erenumab, fremanezumab, galcanezumab, or eptinezumab; first-line for chronic migraine per AHS 2021" />
              <Row label="Conventional preventives" value="Topiramate, valproate (avoid in WOCBP), propranolol/metoprolol, amitriptyline, venlafaxine. Escalate to CGRP mAb after ≥2 failures." />
            </dl>
          </div>
        </div>
      );

    case 'paroxysmal-hemicrania':
      return (
        <div className="space-y-3">
          <div data-claim="clinic-headache-ph-indomethacin-protocol" className={CARD}>
            <SectionHeader>Indomethacin protocol (Goadsby Continuum 2024)</SectionHeader>
            <dl className={DL}>
              <Row label="Week 1" value="Indomethacin 25 mg TID" />
              <Row label="Titration" value="Increase to 75 to 150 mg/day if incomplete response (max 150 mg/day per Goadsby 2024 quoted text)" />
              <Row label="GI protection" value="PPI co-prescription is mandatory" />
              <Row label="Diagnostic confirmation" value="Complete response within 1 to 2 weeks confirms the paroxysmal hemicrania phenotype" />
            </dl>
          </div>
        </div>
      );

    case 'sunct-suna':
      return (
        <div className="space-y-3">
          <div data-claim="clinic-headache-sunct-lamotrigine" className={CARD}>
            <SectionHeader>Preventive treatment (Burish Continuum 2024)</SectionHeader>
            <dl className={DL}>
              <Row label="First-line" value="Lamotrigine, titrated slowly to reduce rash risk" />
              <Row label="Second-line" value="Carbamazepine" />
              <Row label="Referral" value="Refer to a headache specialist; SUNCT/SUNA is uncommon and often misdiagnosed as trigeminal neuralgia" />
            </dl>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default HeadacheManagement;
