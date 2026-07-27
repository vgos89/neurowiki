/**
 * @vitest-environment jsdom
 *
 * Cover for the Send button's fallback path. The NIHSS Copy failure toast
 * directs clinicians to Send, so Send must not inherit the same clipboard
 * blind spot that broke Copy (field report 2026-07-27, iPhone).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shareOrCopy } from './shareOrCopy';

const TEXT = 'NIHSS: 7';

function setNav(key: 'clipboard' | 'share' | 'canShare', value: unknown) {
  Object.defineProperty(navigator, key, { value, configurable: true, writable: true });
}

describe('shareOrCopy', () => {
  let execCommand: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    execCommand = vi.fn(() => true);
    (document as unknown as { execCommand: unknown }).execCommand = execCommand;
    vi.spyOn(HTMLTextAreaElement.prototype, 'setSelectionRange').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setNav('clipboard', undefined);
    setNav('share', undefined);
    setNav('canShare', undefined);
  });

  it('returns "shared" when the native share sheet completes', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setNav('share', share);
    await expect(shareOrCopy(TEXT, { title: 'NIHSS' })).resolves.toBe('shared');
    expect(share).toHaveBeenCalled();
  });

  it('returns "cancelled" when the clinician dismisses the sheet', async () => {
    setNav('share', vi.fn().mockRejectedValue(new DOMException('abort', 'AbortError')));
    await expect(shareOrCopy(TEXT)).resolves.toBe('cancelled');
    // A dismissal must not silently copy behind the clinician's back.
    expect(execCommand).not.toHaveBeenCalled();
  });

  it('falls back to the legacy copy when neither share nor clipboard exists', async () => {
    // The in-app WebView case. Before this fix, Send returned "failed" here.
    setNav('share', undefined);
    setNav('clipboard', undefined);
    await expect(shareOrCopy(TEXT)).resolves.toBe('copied');
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('falls back to the legacy copy when the share sheet errors non-abort', async () => {
    setNav('share', vi.fn().mockRejectedValue(new Error('not allowed')));
    setNav('clipboard', undefined);
    await expect(shareOrCopy(TEXT)).resolves.toBe('copied');
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('returns "failed" only when every strategy is exhausted', async () => {
    setNav('share', undefined);
    setNav('clipboard', { writeText: vi.fn().mockRejectedValue(new Error('denied')) });
    execCommand.mockReturnValue(false);
    await expect(shareOrCopy(TEXT)).resolves.toBe('failed');
  });

  it('returns "failed" on empty text without touching the clipboard', async () => {
    await expect(shareOrCopy('')).resolves.toBe('failed');
    expect(execCommand).not.toHaveBeenCalled();
  });
});
