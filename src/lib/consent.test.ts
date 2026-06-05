import { describe, it, expect } from 'vitest';
import {
  isDisclaimerAccepted,
  installApplies,
  buildDisclaimerRecord,
  DISCLAIMER_VERSION,
  regionForCountry,
  analyticsEnabled,
} from './consent';

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

describe('regionForCountry — geo-gated consent bucket', () => {
  it('maps EU / EEA / UK / Switzerland / Brazil to strict (opt-in)', () => {
    for (const c of ['DE', 'FR', 'IT', 'IE', 'NO', 'IS', 'LI', 'GB', 'CH', 'BR']) {
      expect(regionForCountry(c)).toBe('strict');
    }
  });

  it('maps the US, India, and other countries to default-on', () => {
    for (const c of ['US', 'IN', 'AU', 'JP', 'SG', 'CA']) {
      expect(regionForCountry(c)).toBe('default-on');
    }
  });

  it('is case-insensitive', () => {
    expect(regionForCountry('de')).toBe('strict');
    expect(regionForCountry('us')).toBe('default-on');
  });

  it('returns unknown for missing country (fail-safe)', () => {
    expect(regionForCountry(null)).toBe('unknown');
    expect(regionForCountry(undefined)).toBe('unknown');
    expect(regionForCountry('')).toBe('unknown');
  });
});

describe('analyticsEnabled — consent x region matrix', () => {
  it("explicit 'accepted' enables analytics in every region", () => {
    for (const r of ['strict', 'default-on', 'unknown'] as const) {
      expect(analyticsEnabled('accepted', r)).toBe(true);
    }
  });

  it("explicit 'declined' disables analytics in every region", () => {
    for (const r of ['strict', 'default-on', 'unknown'] as const) {
      expect(analyticsEnabled('declined', r)).toBe(false);
    }
  });

  it('no choice (null): on for default-on, off for strict and unknown', () => {
    expect(analyticsEnabled(null, 'default-on')).toBe(true);
    expect(analyticsEnabled(null, 'strict')).toBe(false);
    expect(analyticsEnabled(null, 'unknown')).toBe(false);
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
