/**
 * @vitest-environment jsdom
 *
 * Per-file override — the repo default is `node` (vite.config.ts), but the
 * legacy execCommand fallback is DOM-bound. jsdom is already a devDependency,
 * so this adds no new package.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyToClipboard } from './clipboard';

/**
 * Regression cover for the 2026-07-27 iPhone report: NIHSS announced
 * "Copied to clipboard" even when the write had failed, and threw outright
 * inside in-app browsers where navigator.clipboard does not exist.
 */

const TEXT = 'NIHSS: 7\n\n1a. LOC: 0';

/** Swap navigator.clipboard for the duration of a test. */
function setClipboard(value: unknown) {
  Object.defineProperty(navigator, 'clipboard', {
    value,
    configurable: true,
    writable: true,
  });
}

describe('copyToClipboard', () => {
  let execCommand: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    execCommand = vi.fn(() => true);
    // jsdom does not implement execCommand or setSelectionRange on textarea.
    (document as unknown as { execCommand: unknown }).execCommand = execCommand;
    vi.spyOn(HTMLTextAreaElement.prototype, 'setSelectionRange').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setClipboard(undefined);
  });

  it('resolves true and fires onSuccess when the async API succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    const onSuccess = vi.fn();
    const onFailure = vi.fn();

    await expect(copyToClipboard(TEXT, onSuccess, onFailure)).resolves.toBe(true);

    expect(writeText).toHaveBeenCalledWith(TEXT);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onFailure).not.toHaveBeenCalled();
    expect(execCommand).not.toHaveBeenCalled();
  });

  it('falls back to execCommand synchronously when the async API is absent', async () => {
    // The in-app-browser case (LinkedIn / Facebook WKWebView) — this is the
    // path that must not await anything, or iOS revokes the gesture.
    setClipboard(undefined);
    const onSuccess = vi.fn();
    const onFailure = vi.fn();

    const pending = copyToClipboard(TEXT, onSuccess, onFailure);

    // Asserted BEFORE awaiting: if the copy slipped past a microtask boundary
    // iOS would have already revoked the gesture and the fallback would fail
    // on a real device. This ordering is the entire point of the fix.
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(onSuccess).toHaveBeenCalledTimes(1);

    await expect(pending).resolves.toBe(true);
    expect(onFailure).not.toHaveBeenCalled();
  });

  it('does not throw when navigator.clipboard exists but lacks writeText', async () => {
    setClipboard({});
    await expect(copyToClipboard(TEXT)).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('attempts the fallback when the async API rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(
      new DOMException('Write permission denied.', 'NotAllowedError'),
    );
    setClipboard({ writeText });
    const onSuccess = vi.fn();
    const onFailure = vi.fn();

    await expect(copyToClipboard(TEXT, onSuccess, onFailure)).resolves.toBe(true);

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onFailure).not.toHaveBeenCalled();
  });

  it('fires onFailure — never onSuccess — when every strategy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('nope'));
    setClipboard({ writeText });
    execCommand.mockReturnValue(false);
    const onSuccess = vi.fn();
    const onFailure = vi.fn();

    await expect(copyToClipboard(TEXT, onSuccess, onFailure)).resolves.toBe(false);

    // The whole point of the fix: no false "Copied to clipboard".
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it('never rejects, even when execCommand throws', async () => {
    setClipboard(undefined);
    execCommand.mockImplementation(() => {
      throw new Error('blocked');
    });
    const onFailure = vi.fn();

    await expect(copyToClipboard(TEXT, undefined, onFailure)).resolves.toBe(false);
    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it('removes the scratch textarea from the DOM in every path', async () => {
    setClipboard(undefined);
    const before = document.body.childElementCount;

    await copyToClipboard(TEXT);
    expect(document.body.childElementCount).toBe(before);

    execCommand.mockImplementation(() => {
      throw new Error('blocked');
    });
    await copyToClipboard(TEXT);
    expect(document.body.childElementCount).toBe(before);
  });

  it('keeps the existing callers working with no onFailure argument', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    const onSuccess = vi.fn();

    await expect(copyToClipboard(TEXT, onSuccess)).resolves.toBe(true);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
