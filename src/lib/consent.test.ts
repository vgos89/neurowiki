import { describe, it, expect } from 'vitest';
import { isDisclaimerAccepted, installApplies, buildDisclaimerRecord, DISCLAIMER_VERSION } from './consent';

describe('isDisclaimerAccepted — no-re-prompt + re-acceptance', () => {
  it('returns false for a missing record (first visit → bar shows)', () => {
    expect(isDisclaimerAccepted(null)).toBe(false);
  });

  it('returns true for a current-version record (returning user NOT re-prompted)', () => {
    const raw = JSON.stringify({ version: DISCLAIMER_VERSION, acceptedAt: '2026-06-01T00:00:00.000Z', userAgent: 'x' });
    expect(isDisclaimerAccepted(raw)).toBe(true);
  });

  it('returns false for a stale version (material change → re-surface the gate)', () => {
    const raw = JSON.stringify({ version: '2.0', acceptedAt: '2026-01-01T00:00:00.000Z', userAgent: 'x' });
    expect(isDisclaimerAccepted(raw)).toBe(false);
  });

  it('returns false for a malformed record (corrupt → bar shows, fail safe)', () => {
    expect(isDisclaimerAccepted('{not json')).toBe(false);
    expect(isDisclaimerAccepted('null')).toBe(false);
    expect(isDisclaimerAccepted('{}')).toBe(false);
  });

  it('honours an explicit version argument', () => {
    const raw = JSON.stringify({ version: '9.9', acceptedAt: 'x', userAgent: 'x' });
    expect(isDisclaimerAccepted(raw, '9.9')).toBe(true);
    expect(isDisclaimerAccepted(raw, '3.0')).toBe(false);
  });
});

describe('installApplies — install affordance gating', () => {
  it('applies for installable + both iOS variants', () => {
    expect(installApplies('installable')).toBe(true);
    expect(installApplies('ios-manual')).toBe(true);
    expect(installApplies('ios-other-browser')).toBe(true);
  });

  it('does NOT apply for desktop/unsupported or already-installed', () => {
    expect(installApplies('unsupported')).toBe(false);
    expect(installApplies('already-installed')).toBe(false);
  });
});

describe('buildDisclaimerRecord', () => {
  it('stamps the current version and preserves the JSON shape', () => {
    const rec = buildDisclaimerRecord('2026-06-05T12:00:00.000Z', 'UA/1.0');
    expect(rec).toEqual({ version: DISCLAIMER_VERSION, acceptedAt: '2026-06-05T12:00:00.000Z', userAgent: 'UA/1.0' });
    // round-trips back through isDisclaimerAccepted
    expect(isDisclaimerAccepted(JSON.stringify(rec))).toBe(true);
  });
});
