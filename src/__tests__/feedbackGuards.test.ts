import { describe, it, expect } from 'vitest';
import {
  hostFromUrl,
  resolveRequestHost,
  isAllowedFeedbackHost,
  isHoneypotTripped,
  isValidOptionalEmail,
  htmlEscape,
  ALLOWED_FEEDBACK_HOSTS,
} from '../../api/feedback';

describe('feedback abuse guards', () => {
  describe('hostFromUrl', () => {
    it('extracts the hostname (no port) from a full URL', () => {
      expect(hostFromUrl('https://neurowiki.ai')).toBe('neurowiki.ai');
      expect(hostFromUrl('https://www.neurowiki.ai/trials')).toBe('www.neurowiki.ai');
      expect(hostFromUrl('http://localhost:5173')).toBe('localhost');
    });
    it('returns null for missing or unparseable values', () => {
      expect(hostFromUrl(undefined)).toBeNull();
      expect(hostFromUrl(null)).toBeNull();
      expect(hostFromUrl('')).toBeNull();
      expect(hostFromUrl('not a url')).toBeNull();
    });
  });

  describe('resolveRequestHost', () => {
    it('prefers Origin over Referer', () => {
      expect(
        resolveRequestHost('https://neurowiki.ai', 'https://evil.example/x'),
      ).toBe('neurowiki.ai');
    });
    it('falls back to Referer when Origin is absent', () => {
      expect(resolveRequestHost(undefined, 'https://www.neurowiki.ai/guide')).toBe(
        'www.neurowiki.ai',
      );
    });
    it('returns null when neither is present (fail closed)', () => {
      expect(resolveRequestHost(undefined, undefined)).toBeNull();
      expect(resolveRequestHost(null, null)).toBeNull();
    });
  });

  describe('isAllowedFeedbackHost', () => {
    it('accepts allow-listed production + dev hosts', () => {
      expect(isAllowedFeedbackHost('neurowiki.ai')).toBe(true);
      expect(isAllowedFeedbackHost('www.neurowiki.ai')).toBe(true);
      expect(isAllowedFeedbackHost('localhost')).toBe(true);
      expect(isAllowedFeedbackHost('127.0.0.1')).toBe(true);
    });
    it('rejects everything else, including null (fail closed)', () => {
      expect(isAllowedFeedbackHost(null)).toBe(false);
      expect(isAllowedFeedbackHost('evil.example')).toBe(false);
      expect(isAllowedFeedbackHost('neurowiki.ai.evil.example')).toBe(false);
      expect(isAllowedFeedbackHost('preview-abc.vercel.app')).toBe(false);
    });
    it('composes with resolveRequestHost end to end', () => {
      expect(
        isAllowedFeedbackHost(resolveRequestHost('https://neurowiki.ai', undefined)),
      ).toBe(true);
      expect(
        isAllowedFeedbackHost(resolveRequestHost('https://evil.example', undefined)),
      ).toBe(false);
      expect(isAllowedFeedbackHost(resolveRequestHost(undefined, undefined))).toBe(false);
    });
    it('exposes the expected allowlist', () => {
      expect(ALLOWED_FEEDBACK_HOSTS.has('neurowiki.ai')).toBe(true);
      expect(ALLOWED_FEEDBACK_HOSTS.size).toBe(4);
    });
  });

  describe('isHoneypotTripped', () => {
    it('is tripped only by a non-whitespace string', () => {
      expect(isHoneypotTripped('Acme Corp')).toBe(true);
      expect(isHoneypotTripped('  x  ')).toBe(true);
    });
    it('is not tripped by empty/whitespace/non-strings', () => {
      expect(isHoneypotTripped('')).toBe(false);
      expect(isHoneypotTripped('   ')).toBe(false);
      expect(isHoneypotTripped(null)).toBe(false);
      expect(isHoneypotTripped(undefined)).toBe(false);
      expect(isHoneypotTripped(0)).toBe(false);
    });
  });

  describe('isValidOptionalEmail', () => {
    it('allows absent/empty (the field is optional)', () => {
      expect(isValidOptionalEmail(null)).toBe(true);
      expect(isValidOptionalEmail(undefined)).toBe(true);
      expect(isValidOptionalEmail('')).toBe(true);
      expect(isValidOptionalEmail('   ')).toBe(true);
    });
    it('accepts a basic well-formed address', () => {
      expect(isValidOptionalEmail('clinician@hospital.org')).toBe(true);
      expect(isValidOptionalEmail('a.b+tag@sub.domain.co')).toBe(true);
    });
    it('rejects CR/LF (header/markup injection) and malformed shapes', () => {
      expect(isValidOptionalEmail('a@b.com\r\nBcc: victim@x.com')).toBe(false);
      expect(isValidOptionalEmail('a@b.com\ninjected')).toBe(false);
      expect(isValidOptionalEmail('not-an-email')).toBe(false);
      expect(isValidOptionalEmail('no@domain')).toBe(false);
      expect(isValidOptionalEmail('@nope.com')).toBe(false);
      expect(isValidOptionalEmail(`${'x'.repeat(255)}@y.com`)).toBe(false);
    });
  });

  describe('htmlEscape', () => {
    it('escapes the five HTML-significant characters', () => {
      expect(htmlEscape('<script>alert("x")</script>')).toBe(
        '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
      );
      expect(htmlEscape("a & b ' c")).toBe('a &amp; b &#39; c');
    });
    it('escapes ampersands before other entities (no double-escape)', () => {
      expect(htmlEscape('&lt;')).toBe('&amp;lt;');
    });
    it('leaves safe text untouched', () => {
      expect(htmlEscape('Plain clinical feedback 123')).toBe('Plain clinical feedback 123');
    });
  });
});
