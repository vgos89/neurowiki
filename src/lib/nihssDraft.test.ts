/**
 * @vitest-environment jsdom
 *
 * The suite default is 'node' (vite.config.ts), which has no sessionStorage.
 * This module's entire job is storage behaviour, so it needs a DOM.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { saveNihssDraft, loadNihssDraft, clearNihssDraft, draftHasContent, type NihssDraft } from './nihssDraft';

const base: Omit<NihssDraft, 'v' | 'savedAt'> = {
  nihssValues: { '1a': 0, '5a': 0 },
  nihssMode: 'rapid',
  hasScored: false,
  performedAt: null,
  patientContext: {
    systolic: '', diastolic: '', glucose: '', anticoag: [], preExistingDeficits: '',
  },
  strokeTimestamps: { 'Code Activation': null },
  disablingChecks: [],
  confirmedNoDisabling: false,
  currentCaseId: null,
};

beforeEach(() => { try { sessionStorage.clear(); } catch { /* jsdom */ } });

describe('nihssDraft round-trip', () => {
  it('returns null when nothing was saved', () => {
    expect(loadNihssDraft()).toBeNull();
  });

  it('round-trips a draft', () => {
    saveNihssDraft({ ...base, hasScored: true, nihssValues: { '1a': 2, '5a': 4 } });
    const d = loadNihssDraft();
    expect(d?.nihssValues).toEqual({ '1a': 2, '5a': 4 });
    expect(d?.hasScored).toBe(true);
  });

  it('clear removes it', () => {
    saveNihssDraft(base);
    clearNihssDraft();
    expect(loadNihssDraft()).toBeNull();
  });

  it('discards a draft written by a different schema version', () => {
    saveNihssDraft(base);
    const raw = JSON.parse(sessionStorage.getItem('neurowiki:nihss-draft:v1')!);
    sessionStorage.setItem('neurowiki:nihss-draft:v1', JSON.stringify({ ...raw, v: 99 }));
    expect(loadNihssDraft()).toBeNull();
  });

  it('survives corrupt JSON rather than throwing', () => {
    sessionStorage.setItem('neurowiki:nihss-draft:v1', '{not json');
    expect(loadNihssDraft()).toBeNull();
  });

  it('stores no patient identifier', () => {
    // Initials are collected by SaveCaseModal at save time and never enter
    // calculator state, so nothing in the payload names a person.
    saveNihssDraft({ ...base, patientContext: { ...base.patientContext, systolic: '180' } });
    const raw = sessionStorage.getItem('neurowiki:nihss-draft:v1')!;
    expect(raw).not.toMatch(/initials/i);
  });
});

describe('draftHasContent', () => {
  const full = (over: Partial<NihssDraft>): NihssDraft =>
    ({ ...base, v: 1, savedAt: 0, ...over }) as NihssDraft;

  it('is false for a pristine all-default draft', () => {
    // Every item defaults to 0 since 2026-09-01, so "has values" is always true
    // and cannot be the restore signal. A pristine draft must not be restored.
    expect(draftHasContent(full({}))).toBe(false);
  });

  it('is true once the clinician has scored anything', () => {
    expect(draftHasContent(full({ hasScored: true }))).toBe(true);
  });

  it.each([
    ['systolic', { patientContext: { ...base.patientContext, systolic: '180' } }],
    ['glucose', { patientContext: { ...base.patientContext, glucose: '90' } }],
    ['weight', { patientContext: { ...base.patientContext, weightValue: 70 } }],
    ['anticoag', { patientContext: { ...base.patientContext, anticoag: ['doac'] } }],
    ['deficits', { patientContext: { ...base.patientContext, preExistingDeficits: 'foot drop' } }],
    ['disabling checks', { disablingChecks: [0] }],
    ['no-disabling confirmation', { confirmedNoDisabling: true }],
    ['a timestamp', { strokeTimestamps: { 'Code Activation': 1_700_000_000_000 } }],
  ])('is true when only %s is present', (_label, over) => {
    expect(draftHasContent(full(over as Partial<NihssDraft>))).toBe(true);
  });

  it('treats an explicit wake-up LKW (null) as content', () => {
    expect(draftHasContent(full({ patientContext: { ...base.patientContext, lkw: null } }))).toBe(true);
  });
});
