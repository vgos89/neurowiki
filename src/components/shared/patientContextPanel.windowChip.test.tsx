import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PatientContextPanel,
  EMPTY_PATIENT_CONTEXT,
  type PatientContextValues,
} from './PatientContextPanel';

const t = (hh: number, mm: number, dayOffset = 0) => new Date(2026, 2, 10 + dayOffset, hh, mm);

type Mode = 'timing' | 'chip';

function render(values: PatientContextValues, mode: Mode): string {
  return renderToStaticMarkup(
    <PatientContextPanel
      values={values}
      onChange={() => {}}
      defaultExpanded
      showThrombolysisTiming={mode === 'timing'}
      showWindowChip={mode === 'chip'}
    />,
  );
}

/** The tagged chip container's inner text, tags stripped. */
function chipBlock(html: string, claim: string): string | null {
  const m = html.match(new RegExp(`data-claim="${claim}"[^>]*>(.*?)</div>`));
  if (!m) return null;
  // First span is the chip; everything after it is the elapsed line.
  const parts = m[1].match(/^<span[^>]*>(.*?)<\/span>(.*)$/);
  if (!parts) return null;
  const strip = (h: string) => h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return `${strip(parts[2])}|${strip(parts[1])}`;
}

const base = (over: Partial<PatientContextValues>): PatientContextValues => ({
  ...EMPTY_PATIENT_CONTEXT,
  ...over,
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PatientContextPanel window chip', () => {
  const MODES: Mode[] = ['timing', 'chip'];

  it('(a) witnessed 6 h ago: same chip and line in both modes, witnessed claim tag', () => {
    vi.useFakeTimers();
    vi.setSystemTime(t(12, 0));
    const values = base({ lkw: t(6, 0) });
    const [h1, h2] = MODES.map((m) => render(values, m));
    const b1 = chipBlock(h1, 'ivt-window-4.5h');
    expect(b1).toBe('~6 h 0 min since last known well|4.5–9h window');
    expect(chipBlock(h2, 'ivt-window-4.5h')).toBe(b1);
    expect(h1).not.toContain('data-claim="ivt-window-wake-up"');
    expect(h1).not.toContain('Wake-up or unknown onset');
  });

  it('(b) wake-up spec row 3: extended, both clocks shown, wake-up claim tag', () => {
    vi.useFakeTimers();
    vi.setSystemTime(t(7, 0, 1));
    const values = base({ lkw: null, wakeUp: { asleepAt: t(23, 0), wokeAt: t(6, 0, 1) } });
    const [h1, h2] = MODES.map((m) => render(values, m));
    const b1 = chipBlock(h1, 'ivt-window-wake-up');
    expect(b1).toBe('~1 h 0 min since woke · ~4 h 30 min since sleep midpoint|Extended window');
    expect(chipBlock(h2, 'ivt-window-wake-up')).toBe(b1);
    expect(h1).not.toContain('data-claim="ivt-window-4.5h"');
    expect(h1).not.toContain('Wake-up or unknown onset');
  });

  it('(c) wake-up spec row 6: past the wake-up windows', () => {
    vi.useFakeTimers();
    vi.setSystemTime(t(11, 1, 1));
    const values = base({ lkw: null, wakeUp: { asleepAt: t(22, 0), wokeAt: t(6, 0, 1) } });
    const [h1, h2] = MODES.map((m) => render(values, m));
    const b1 = chipBlock(h1, 'ivt-window-wake-up');
    expect(b1).toBe('~5 h 1 min since woke · ~9 h 1 min since sleep midpoint|Past wake-up windows');
    expect(chipBlock(h2, 'ivt-window-wake-up')).toBe(b1);
    expect(h1).toContain('text-rose-700');
  });

  it('(d) wake-up spec row 1: standard tier, since last asleep, Within 4.5h', () => {
    vi.useFakeTimers();
    vi.setSystemTime(t(17, 30));
    const values = base({ lkw: null, wakeUp: { asleepAt: t(14, 0), wokeAt: t(15, 0) } });
    const [h1, h2] = MODES.map((m) => render(values, m));
    const b1 = chipBlock(h1, 'ivt-window-wake-up');
    expect(b1).toBe('~3 h 30 min since last asleep|Within 4.5h');
    expect(chipBlock(h2, 'ivt-window-wake-up')).toBe(b1);
    expect(h1).toContain('text-emerald-700');
  });

  it('(e) unknown onset: sentence only, no chip, in both modes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(t(12, 0));
    const values = base({ lkw: null });
    for (const m of MODES) {
      const html = render(values, m);
      expect(html).toContain('Wake-up or unknown onset, so time since onset is not shown.');
      expect(html).not.toContain('data-claim="ivt-window-4.5h"');
      expect(html).not.toContain('data-claim="ivt-window-wake-up"');
    }
  });

  it('the sentence is absent for a wake-up entry and a witnessed LKW', () => {
    vi.useFakeTimers();
    vi.setSystemTime(t(17, 30));
    const wake = base({ lkw: null, wakeUp: { asleepAt: t(14, 0), wokeAt: t(15, 0) } });
    const wit = base({ lkw: t(15, 0) });
    for (const m of MODES) {
      expect(render(wake, m)).not.toContain('Wake-up or unknown onset');
      expect(render(wit, m)).not.toContain('Wake-up or unknown onset');
    }
  });

  it('countdown chip in the final 30 min, witnessed and wake-up', () => {
    vi.useFakeTimers();
    vi.setSystemTime(t(12, 0));
    expect(chipBlock(render(base({ lkw: t(7, 40) }), 'chip'), 'ivt-window-4.5h')).toBe(
      '~4 h 20 min since last known well|10 min left',
    );
    vi.setSystemTime(t(18, 10));
    expect(
      chipBlock(
        render(base({ lkw: null, wakeUp: { asleepAt: t(14, 0), wokeAt: t(15, 0) } }), 'timing'),
        'ivt-window-wake-up',
      ),
    ).toBe('~4 h 10 min since last asleep|20 min left');
  });

  it('no chip when neither flag is set', () => {
    vi.useFakeTimers();
    vi.setSystemTime(t(12, 0));
    const html = renderToStaticMarkup(
      <PatientContextPanel values={base({ lkw: t(6, 0) })} onChange={() => {}} defaultExpanded />,
    );
    expect(html).not.toContain('data-claim="ivt-window-4.5h"');
    expect(html).not.toContain('Wake-up or unknown onset');
  });
});

describe('PatientContextPanel in-panel BP note', () => {
  const HIGH_BP = { systolic: '190', diastolic: '100' };

  it('Stroke Code (showWindowChip only) keeps the generic note for a witnessed in-window time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(t(12, 0));
    const html = render(base({ lkw: t(9, 0), ...HIGH_BP }), 'chip');
    expect(html).toContain('BP above tPA/TNK threshold. Lower to ≤185/110 before treatment');
    expect(html).not.toContain('If thrombolysis planned');
  });

  it('Stroke Code keeps the generic note out of window and for a wake-up entry too', () => {
    vi.useFakeTimers();
    vi.setSystemTime(t(11, 1, 1));
    const out = render(
      base({ lkw: null, wakeUp: { asleepAt: t(22, 0), wokeAt: t(6, 0, 1) }, ...HIGH_BP }),
      'chip',
    );
    expect(out).toContain('BP above tPA/TNK threshold. Lower to ≤185/110 before treatment');
  });

  it('NIHSS shows the conditional prompt for a wake-up entry in the standard tier', () => {
    vi.useFakeTimers();
    vi.setSystemTime(t(17, 30));
    const html = render(
      base({ lkw: null, wakeUp: { asleepAt: t(14, 0), wokeAt: t(15, 0) }, ...HIGH_BP }),
      'timing',
    );
    expect(html).toContain('If thrombolysis planned: BP goal &lt;185/110');
    expect(html).not.toContain('BP above tPA/TNK threshold');
  });

  it('NIHSS shows no BP note for a wake-up entry in the extended tier', () => {
    vi.useFakeTimers();
    vi.setSystemTime(t(7, 0, 1));
    const html = render(
      base({ lkw: null, wakeUp: { asleepAt: t(23, 0), wokeAt: t(6, 0, 1) }, ...HIGH_BP }),
      'timing',
    );
    expect(html).not.toContain('If thrombolysis planned');
    expect(html).not.toContain('BP above tPA/TNK threshold');
  });
});
