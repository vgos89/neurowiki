import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HeadacheResultV4, showLeadingGapNote, ALL_CLAIM_MARKERS } from './HeadacheResultV4';
import { HeadacheManagement, hasHeadacheManagement } from './HeadacheManagement';
import { HEADACHE_PHENOTYPES } from '../../../data/clinicHeadacheData';
import { bandPhenotypes } from '../../../data/headacheBanding';
import type { BandedMatch } from '../../../data/headacheBanding';
import { evaluateHeadachePhenotypes, type ChipId } from '../../../data/clinicHeadacheData';

const SAFETY_STRIP_MARKER = 'Before accepting any pattern';

const MIGRAINE_FULL: Set<ChipId> = new Set<ChipId>([
  'onset-recurrent-same',
  'freq-1-4-per-month',
  'dur-4-to-72-hours',
  'attacks-gt-10',
  'qual-pulsating',
  'loc-unilateral',
  'sev-moderate',
  'act-aggravated',
  'sym-nausea-moderate-severe',
]);

function render(props: Partial<React.ComponentProps<typeof HeadacheResultV4>> & {
  banded: React.ComponentProps<typeof HeadacheResultV4>['banded'];
}) {
  return renderToStaticMarkup(
    <HeadacheResultV4
      selected={props.selected ?? new Set()}
      redFlagActive={props.redFlagActive ?? false}
      redFlags={props.redFlags ?? new Set()}
      onReconsider={() => {}}
      banded={props.banded}
    />,
  );
}

describe('HeadacheResultV4 — mandatory safety strip always renders (architect Q7.2)', () => {
  it('renders the safety strip in the red-flag workup case', () => {
    const html = render({ banded: bandPhenotypes([]), redFlagActive: true, redFlags: new Set<ChipId>(['rf-onset-sudden']) });
    expect(html).toContain(SAFETY_STRIP_MARKER);
  });

  it('renders the safety strip in the empty / no-match case', () => {
    const html = render({ banded: bandPhenotypes([]) });
    expect(html).toContain(SAFETY_STRIP_MARKER);
  });

  it('renders the safety strip in the normal differential case', () => {
    const banded = bandPhenotypes(evaluateHeadachePhenotypes(MIGRAINE_FULL));
    expect(banded.leading.length).toBeGreaterThan(0);
    const html = render({ banded, selected: MIGRAINE_FULL });
    expect(html).toContain(SAFETY_STRIP_MARKER);
  });
});

describe('HeadacheResultV4 — no-percentages invariant (architect Q7.1)', () => {
  it('the rendered result contains no percent sign and no fraction-as-percent', () => {
    const banded = bandPhenotypes(evaluateHeadachePhenotypes(MIGRAINE_FULL));
    const html = render({ banded, selected: MIGRAINE_FULL });
    // No "42%"-style displayed percentage. Excludes Tailwind arbitrary widths
    // (max-w-[40%]) carried by the verbatim-mounted management cards: those are
    // always `%]`, a displayed percent is `%` followed by a tag/space.
    expect(html).not.toMatch(/\d%(?!\])/);
  });
});

describe('v4 source carries no displayed-percentage or percentage math', () => {
  const FILES = [
    'src/components/pathways/headache/HeadacheResultV4.tsx',
    'src/components/pathways/headache/HeadacheDifferentialPanel.tsx',
    'src/components/pathways/headache/HeadacheDotMeter.tsx',
    'src/components/pathways/headache/HeadacheQuestion.tsx',
    'src/components/pathways/headache/HeadacheSafetyScreen.tsx',
    'src/pages/ClinicHeadachePathwayV4.tsx',
  ];

  it('no file uses `{expr}%`, toFixed, or `* 100` percentage math', () => {
    for (const f of FILES) {
      const src = readFileSync(f, 'utf8');
      expect(src, `${f} displays a percentage`).not.toMatch(/\}%/);
      expect(src, `${f} uses toFixed`).not.toMatch(/toFixed/);
      expect(src, `${f} computes * 100`).not.toMatch(/\*\s*100\b/);
    }
  });
});

describe('HeadacheResultV4 — leading-gap note (BC-8 / architect condition 3)', () => {
  // Hypnic headache (no management module) leads; episodic TTH (has a module)
  // is the runner-up. Chip set verified against the live engine 2026-09-08.
  const GAP_CHIPS: Set<ChipId> = new Set<ChipId>([
    'onset-only-during-sleep-waking', 'freq-ge-10-per-month', 'pattern-ge-3-months', 'dur-15min-to-4h',
    'freq-ge-15-per-month', 'loc-bilateral', 'qual-pressing-tightening', 'sev-mild', 'act-not-aggravated',
  ]);

  it('top-ranked pattern without a module: the note renders, names both phenotypes, and instructs', () => {
    const banded = bandPhenotypes(evaluateHeadachePhenotypes(GAP_CHIPS));
    const candidates = [...banded.leading, ...banded.possible, ...banded.lessLikely];
    // Self-checking premises: a data change that hollows this scenario must
    // fail here, not silently pass an empty render.
    expect(candidates[0]?.match.phenotypeId).toBe('hypnic-headache');
    expect(hasHeadacheManagement(candidates[0].match.phenotypeId)).toBe(false);
    expect(candidates.slice(0, 2).some(bm => hasHeadacheManagement(bm.match.phenotypeId))).toBe(true);
    const html = render({ banded });
    expect(html).toContain('No management module for Hypnic headache yet.');
    expect(html).toContain('Do not apply it to Hypnic headache.');
  });

  it('predicate: silent when nothing manageable renders, and when vestibular migraine leads', () => {
    const fake = (id: string, name: string) => ({ match: { phenotypeId: id, name } }) as unknown as BandedMatch;
    // No manageable block below → the note must not point at nothing (BC-8 gate).
    expect(showLeadingGapNote([fake('hypnic-headache', 'Hypnic headache')], [])).toBe(false);
    // VM leads → VM deliberately steers to the migraine block; "do not apply"
    // would contradict the M2 steering paragraph.
    expect(showLeadingGapNote(
      [fake('vestibular-migraine', 'Vestibular migraine'), fake('migraine-without-aura', 'Migraine without aura')],
      [fake('migraine-without-aura', 'Migraine without aura')],
    )).toBe(false);
  });
});

describe('MANAGED / switch sync + claim-marker pin (architect 2026-09-08, condition 7)', () => {
  it('every phenotype renders a management body if and only if it is MANAGED', () => {
    // Both directions: a MANAGED id whose switch arm is missing renders nothing
    // (false amber note + silent card loss); a switch arm outside MANAGED never
    // renders (dead clinical prose). One new phenotype sits on each side of the
    // boundary by design (GPN managed, PIFP deliberately not), which is exactly
    // when this drift becomes likely.
    for (const p of HEADACHE_PHENOTYPES) {
      const html = renderToStaticMarkup(<HeadacheManagement phenotypeId={p.id} />);
      const hasBody = html.trim().length > 0;
      expect(hasBody, `${p.id}: rendered=${hasBody} but MANAGED=${hasHeadacheManagement(p.id)}`)
        .toBe(hasHeadacheManagement(p.id));
    }
  });

  it('the literal HiddenClaimMarkers spans render exactly ALL_CLAIM_MARKERS', () => {
    // The spans must stay LITERAL (scripts/check-claims.ts reads source
    // statically), so the typed Record cannot render them. This pin makes an
    // omitted or stray literal span a test failure in both directions.
    const html = render({ banded: bandPhenotypes([]), redFlagActive: true, redFlags: new Set<ChipId>(['rf-onset-sudden']) });
    const rendered = Array.from(html.matchAll(/data-claim="([^"]+)"/g)).map((m) => m[1]);
    const hidden = rendered.filter((id) => ALL_CLAIM_MARKERS.includes(id));
    expect([...new Set(hidden)].sort()).toEqual([...ALL_CLAIM_MARKERS].sort());
  });

  it('PIFP top-ranked with a manageable runner-up: the leading-gap note names both (architect rec 12)', () => {
    // PIFP is deliberately outside MANAGED (no held treatment source), so a
    // leading PIFP with a managed runner-up MUST fire the note.
    const fake = (id: string, name: string) => ({ match: { phenotypeId: id, name } }) as unknown as BandedMatch;
    const top2 = [fake('persistent-idiopathic-facial-pain', 'Persistent idiopathic facial pain'), fake('migraine-without-aura', 'Migraine without aura')];
    expect(showLeadingGapNote(top2, [top2[1]])).toBe(true);
  });
});
