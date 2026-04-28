/**
 * DEV-ONLY — /dev/rct-chain-test
 *
 * Verifies RCTChainSection rendering with the ESCAPE EVT chain mockup.
 * Tests: chain narrative, 5-card cap + expand, stub footnote (no trialId),
 * current trial card cobalt styling.
 *
 * NOT rendered in production. Gated by import.meta.env.DEV in App.tsx.
 */

import React from 'react';
import { RCTChainSection, type RCTChainData } from '../../components/trials/RCTChainSection';

// ---------------------------------------------------------------------------
// Mock data — ESCAPE chain (EVT 2015 wave)
// ---------------------------------------------------------------------------

const ESCAPE_CHAIN: RCTChainData = {
  chainName: 'EVT 2015 Wave',
  chainNarrative:
    'Three simultaneous RCTs published in early 2013 (IMS-III, SYNTHESIS Expansion, MR RESCUE) all failed to show benefit for intra-arterial thrombectomy over IV tPA alone. The shared flaw: first-generation devices with low recanalization rates, absent or inconsistent penumbral selection, and delays from imaging to groin puncture. ESCAPE used modern stent retrievers, rigorous CT perfusion selection, and a median 51-minute door-to-puncture time -- and stopped early for overwhelming benefit.',
  predecessors: [
    {
      // no trialId -- tests stub rendering
      trialName: 'PROACT II',
      year: 1999,
      journal: 'JAMA',
      n: 180,
      designNotes: 'Phase 3 RCT — intra-arterial urokinase',
      keyResult:
        'mRS 0-2 at 90 days: 40% IA vs 25% IV heparin (p=0.04); 2× higher symptomatic ICH rate.',
      whatWasMissing:
        'Urokinase not widely available; no stent retrievers; no modern imaging selection; not practice-changing.',
    },
    {
      // no trialId -- tests stub rendering
      trialName: 'IMS-III',
      year: 2013,
      journal: 'NEJM',
      n: 656,
      designNotes: 'Open-label RCT',
      keyResult:
        'No difference in mRS 0-2 at 90 days: 40.8% EVT vs 38.7% IV tPA alone (adjusted OR 1.07, p=0.52).',
      whatWasMissing:
        'First-generation MERCI/Penumbra devices; low confirmed large-vessel occlusion rate (~47%); no penumbral imaging selection; stopped early for futility.',
    },
    {
      // no trialId -- tests stub rendering
      trialName: 'SYNTHESIS Expansion',
      year: 2013,
      journal: 'NEJM',
      n: 362,
      designNotes: 'Open-label RCT',
      keyResult:
        'No difference in mRS 0-1 at 90 days: 30.4% EVT vs 34.8% IV tPA (adjusted OR 0.71, p=0.16).',
      whatWasMissing:
        'EVT arm received no IV tPA first; outdated devices; no vessel occlusion confirmation required; excessive onset-to-puncture time (mean 225 min).',
    },
    {
      // no trialId -- tests stub rendering
      trialName: 'MR RESCUE',
      year: 2013,
      journal: 'NEJM',
      n: 118,
      designNotes: 'RCT with MRI penumbral stratification',
      keyResult:
        'No difference in mean mRS at 90 days in any penumbral stratum (embolectomy 3.9 vs standard care 3.9).',
      whatWasMissing:
        'Underpowered; long time to treatment (mean 6.4 h); MERCI/Penumbra devices; penumbral mismatch did not predict benefit.',
    },
    {
      // 5th predecessor — tests 5-card cap; this one hidden behind expand button
      // no trialId -- also tests stub in hidden card
      trialName: 'IMS-I / IMS-II (Pilot)',
      year: 2004,
      journal: 'Stroke',
      n: 80,
      designNotes: 'Non-randomized phase I/II pilot',
      keyResult: 'Recanalization 56%; 90-day mRS 0-2 in 43%. Feasibility signal only.',
      whatWasMissing:
        'No control arm; pilot design; set unrealistic expectations for subsequent trials using inferior devices.',
    },
  ],
  currentTrialResult:
    'mRS 0-2 at 90 days: 53.0% EVT vs 29.3% standard care (adjusted OR 2.6, 95% CI 1.7--3.8). Stopped early for efficacy.',
  whatChanged:
    'Stent retrievers (Solitaire/Trevo) instead of MERCI/Penumbra; mandatory large-vessel occlusion confirmation; CT perfusion penumbral selection; median door-to-puncture 51 min.',
};

// ---------------------------------------------------------------------------
// Test variants
// ---------------------------------------------------------------------------

/** Single-predecessor test — verifies no connector, no cap, no expand button */
const SINGLE_PRED_CHAIN: RCTChainData = {
  chainName: 'Minimal chain',
  chainNarrative: 'Single predecessor test. No connector below the predecessor card; no expand button.',
  predecessors: [
    {
      trialName: 'Solo Predecessor',
      year: 2010,
      journal: 'Lancet',
      n: 200,
      keyResult: 'Primary endpoint met (p=0.03).',
      whatWasMissing: 'Too small to be definitive.',
    },
  ],
  currentTrialResult: 'Confirmatory RCT result.',
  whatChanged: 'Larger sample and updated dosing protocol.',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const RCTChainTest: React.FC = () => {
  return (
    <div
      style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '24px 16px 64px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Dev banner */}
      <div
        style={{
          background: '#fef9c3',
          border: '1px solid #fde047',
          borderRadius: 8,
          padding: '8px 12px',
          marginBottom: 24,
          fontSize: 12,
          color: '#713f12',
        }}
      >
        <strong>DEV ROUTE</strong> — /dev/rct-chain-test — not visible in production
      </div>

      <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
        RCTChainSection test
      </h1>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 32 }}>
        Verify: 5-card cap + expand, stub footnote, cobalt current-trial card, single-predecessor variant.
      </p>

      {/* ── Test 1: ESCAPE chain (5 predecessors — tests cap) ── */}
      <h2 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
        Test 1 — 5-card cap (5 predecessors; card 5 hidden behind expand)
      </h2>
      <RCTChainSection
        chain={ESCAPE_CHAIN}
        currentTrialName="ESCAPE"
        currentTrialYear={2015}
      />

      <div style={{ height: 40 }} />

      {/* ── Test 2: Single predecessor ── */}
      <h2 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
        Test 2 — Single predecessor (no connector, no cap)
      </h2>
      <RCTChainSection
        chain={SINGLE_PRED_CHAIN}
        currentTrialName="Confirmation Trial"
        currentTrialYear={2016}
      />

      {/* 375px viewport note */}
      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 40, textAlign: 'center' }}>
        Resize to 375px to verify mobile behaviour (year column 44px, connector hidden).
      </p>
    </div>
  );
};

export default RCTChainTest;
