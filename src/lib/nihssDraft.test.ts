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
    systolic: '', diastolic: '', glucose: '', anticoag: [],
  },
  strokeTimestamps: { 'Code Activation': null },
  disablingChecks: [],
  confirmedNoDisabling: false,
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

// ── Compliance-review fixes, 2026-09-01 ─────────────────────────────────────

describe('cross-patient safety', () => {
  it('never persists a saved-case id', () => {
    // The draft used to carry currentCaseId. Restoring it onto a new patient
    // silently re-targeted the next Save at the PREVIOUS patient's stored
    // record, overwriting it. A restored draft must always be detached.
    saveNihssDraft({ ...base, hasScored: true });
    const raw = sessionStorage.getItem('neurowiki:nihss-draft:v1')!;
    expect(raw).not.toMatch(/caseId/i);
    expect(Object.keys(JSON.parse(raw))).not.toContain('currentCaseId');
  });

  it('never persists the free-text deficits field', () => {
    // Unconstrained, dictation-enabled, no identifier warning, and this app
    // already removed a free-text Note field in May 2026 for the same reason.
    saveNihssDraft({
      ...base,
      // @ts-expect-error deliberately attempting to smuggle the field in
      patientContext: { ...base.patientContext, preExistingDeficits: 'John Smith, room 4' },
    });
    const raw = sessionStorage.getItem('neurowiki:nihss-draft:v1')!;
    expect(raw).not.toMatch(/John Smith/);
    expect(raw).not.toMatch(/preExistingDeficits/);
  });
});

describe('draft expiry', () => {
  it('discards a draft older than the 4 hour ceiling', () => {
    saveNihssDraft({ ...base, hasScored: true });
    const raw = JSON.parse(sessionStorage.getItem('neurowiki:nihss-draft:v1')!);
    raw.savedAt = Date.now() - (4 * 60 * 60 * 1000 + 1000);
    sessionStorage.setItem('neurowiki:nihss-draft:v1', JSON.stringify(raw));
    expect(loadNihssDraft()).toBeNull();
  });

  it('keeps a draft inside the ceiling', () => {
    saveNihssDraft({ ...base, hasScored: true });
    const raw = JSON.parse(sessionStorage.getItem('neurowiki:nihss-draft:v1')!);
    raw.savedAt = Date.now() - 60 * 60 * 1000; // an hour old
    sessionStorage.setItem('neurowiki:nihss-draft:v1', JSON.stringify(raw));
    expect(loadNihssDraft()).not.toBeNull();
  });

  it('discards a draft with no savedAt at all', () => {
    saveNihssDraft(base);
    const raw = JSON.parse(sessionStorage.getItem('neurowiki:nihss-draft:v1')!);
    delete raw.savedAt;
    sessionStorage.setItem('neurowiki:nihss-draft:v1', JSON.stringify(raw));
    expect(loadNihssDraft()).toBeNull();
  });
});
