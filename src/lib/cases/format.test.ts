import { describe, it, expect } from 'vitest';
import { formatBpLine, formatSavedCaseAsEmrText } from './format';
import type { SavedCase } from './types';

// ── formatBpLine ────────────────────────────────────────────────────────────
//
// A number the clinician entered must never be reported as missing. Only a
// fully blank BP reads "Not entered".

describe('formatBpLine', () => {
  it('prints both values when both are entered', () => {
    expect(formatBpLine('180', '95')).toBe('BP: 180/95');
  });

  it('keeps a lone systolic instead of discarding it', () => {
    expect(formatBpLine('180', '')).toBe('BP: 180 systolic (diastolic not entered)');
  });

  it('keeps a lone diastolic instead of discarding it', () => {
    expect(formatBpLine('', '95')).toBe('BP: 95 diastolic (systolic not entered)');
  });

  it('reads "Not entered" only when both halves are blank', () => {
    expect(formatBpLine('', '')).toBe('BP: Not entered');
    expect(formatBpLine(undefined, undefined)).toBe('BP: Not entered');
  });

  it('treats whitespace as blank', () => {
    expect(formatBpLine('  ', '  ')).toBe('BP: Not entered');
  });
});

// ── formatSavedCaseAsEmrText — patient-context block ─────────────────────────

function makeCase(patientContext: Record<string, unknown> = {}): SavedCase {
  return {
    id: 'test-id',
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_000_000,
    initials: 'AB',
    source: { type: 'calculator', id: 'nihss', title: 'NIHSS' },
    schemaVersion: 1,
    data: {
      nihss: { score: 0, values: {}, mode: 'rapid', severity: 'none' },
      patientContext,
    },
  } as SavedCase;
}

describe('formatSavedCaseAsEmrText — empty patient context', () => {
  const text = formatSavedCaseAsEmrText(makeCase());

  it('emits every patient-context field as "Not entered"', () => {
    expect(text).toContain('Exam Performed: Not entered');
    expect(text).toContain('LKW: Not entered');
    expect(text).toContain('BP: Not entered');
    expect(text).toContain('Glucose: Not entered');
    expect(text).toContain('Pre-stroke mRS: Not entered');
    expect(text).toContain('Pre-existing deficits: Not entered');
  });

  it('never asserts the patient is on no anticoagulant when nobody answered', () => {
    expect(text).toContain('Anti-Coag/Antiplatelet: Not entered');
    expect(text).not.toContain('Anti-Coag/Antiplatelet: None');
  });

  it('emits no per-drug lines when no drug class was selected', () => {
    expect(text).not.toContain('DOAC:');
    expect(text).not.toContain('Warfarin INR:');
    expect(text).not.toContain('Heparin/LMWH aPTT:');
  });
});

describe('formatSavedCaseAsEmrText — selected drug class, no value entered', () => {
  it('marks a selected DOAC with no detail as "Not entered"', () => {
    const text = formatSavedCaseAsEmrText(makeCase({ anticoag: ['doac'] }));
    expect(text).toContain('DOAC: Not entered');
  });

  it('marks a selected warfarin with no INR as "Not entered"', () => {
    const text = formatSavedCaseAsEmrText(makeCase({ anticoag: ['warfarin'] }));
    expect(text).toContain('Warfarin INR: Not entered');
  });

  it('marks a selected heparin with no aPTT as "Not entered"', () => {
    const text = formatSavedCaseAsEmrText(makeCase({ anticoag: ['heparin'] }));
    expect(text).toContain('Heparin/LMWH aPTT: Not entered');
  });
});

describe('formatSavedCaseAsEmrText — entered values still render', () => {
  const text = formatSavedCaseAsEmrText(
    makeCase({
      systolic: '176',
      diastolic: '94',
      glucose: '112',
      anticoag: ['doac', 'warfarin', 'heparin'],
      doacDrug: 'apixaban',
      doacTiming: 'lt48h',
      warfarinInr: 'gt1_7',
      heparinAptt: 'le40s',
      prestrokeMrs: 2,
      preExistingDeficits: 'chronic left foot drop',
    }),
  );

  it('renders the entered values, not the fallbacks', () => {
    expect(text).toContain('BP: 176/94');
    expect(text).toContain('Glucose: 112 mg/dL');
    expect(text).toContain('DOAC: apixaban, last dose <48 h');
    expect(text).toContain('Warfarin INR: >1.7');
    expect(text).toContain('Heparin/LMWH aPTT: ≤40 s');
    expect(text).toContain('Pre-stroke mRS: 2');
    expect(text).toContain('Pre-existing deficits: chronic left foot drop');
  });

  it('reports a wake-up onset as unknown rather than not entered', () => {
    const wake = formatSavedCaseAsEmrText(makeCase({ lkw: null }));
    expect(wake).toContain('LKW: Unknown / wake-up');
  });
});

describe('formatSavedCaseAsEmrText — untestable items', () => {
  it('prints UN rather than the internal 9, on every item that offers it', () => {
    const c = makeCase();
    c.data.nihss = {
      score: 2,
      values: { '5a': 9, '6a': 9, '7': 9, '10': 9, '1a': 2 },
      mode: 'rapid',
      severity: 'minor',
    };
    const text = formatSavedCaseAsEmrText(c);
    expect(text).toContain('5a. Motor L Arm: UN');
    expect(text).toContain('6a. Motor L Leg: UN');
    expect(text).toContain('7. Limb Ataxia: UN');
    expect(text).toContain('10. Dysarthria: UN');
    expect(text).not.toContain(': 9');
  });
});
