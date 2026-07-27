/**
 * copyToClipboard — resilient copy with an honest failure signal.
 *
 * Two things bite us on iPhone, both reported from the field (2026-07-27,
 * clinician could not copy the NIHSS EMR block):
 *
 *   1. `navigator.clipboard` is simply absent inside the WKWebView-based
 *      in-app browsers (LinkedIn, Facebook, Instagram, some mail clients)
 *      and in any non-secure context. Touching `.writeText` there throws a
 *      synchronous TypeError.
 *   2. WebKit may accept the tap and then reject the write (NotAllowedError),
 *      which previously left callers announcing a success that never happened.
 *
 * Ordering is the whole trick. WebKit only honours `execCommand('copy')`
 * while the user gesture is still live, and awaiting a rejected promise
 * spends that activation. So when we can tell up front that the async API
 * is unavailable we go straight to the legacy path synchronously. When the
 * async API exists but rejects we still try the legacy path, but by then the
 * activation is usually gone — that case degrades to an honest `onFailure`
 * rather than a false "Copied".
 *
 * @param text       Payload to copy.
 * @param onSuccess  Fired only when the text genuinely reached the clipboard.
 * @param onFailure  Fired when every strategy failed. Optional so the twelve
 *                   pre-existing callers keep working unchanged.
 * @returns Promise resolving true on success, false on failure. Never rejects.
 */
export function copyToClipboard(
  text: string,
  onSuccess?: () => void,
  onFailure?: () => void,
): Promise<boolean> {
  const settle = (ok: boolean): boolean => {
    if (ok) onSuccess?.();
    else onFailure?.();
    return ok;
  };

  // Async Clipboard API missing → legacy path *synchronously*, so the calling
  // gesture is still active. Do not await anything before this point.
  if (typeof navigator === 'undefined' || typeof navigator.clipboard?.writeText !== 'function') {
    return Promise.resolve(settle(legacyCopy(text)));
  }

  return navigator.clipboard.writeText(text).then(
    () => settle(true),
    // Rejected (NotAllowedError, private browsing, revoked activation).
    // Legacy is a long shot this late but costs nothing and occasionally wins.
    () => settle(legacyCopy(text)),
  );
}

/**
 * Deprecated `execCommand` path, kept because it is the only mechanism that
 * works in iOS in-app browsers. Must be called inside a live user gesture.
 *
 * iOS ignores `textarea.select()`, so selection goes through a Range plus
 * `setSelectionRange`, and the node must be contentEditable and readOnly —
 * readOnly is what stops the on-screen keyboard from flashing open.
 */
function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') {
    return false;
  }

  const selection = window.getSelection?.();
  // Preserve whatever the clinician had selected so copying does not clobber it.
  const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  const el = document.createElement('textarea');
  el.value = text;
  el.readOnly = true;
  el.contentEditable = 'true';
  el.setAttribute('aria-hidden', 'true');
  // position:fixed keeps iOS from scrolling the page to the offscreen node.
  el.style.cssText =
    'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:none;outline:none;opacity:0;pointer-events:none;';
  document.body.appendChild(el);

  let ok = false;
  try {
    const range = document.createRange();
    range.selectNodeContents(el);
    selection?.removeAllRanges();
    selection?.addRange(range);
    el.setSelectionRange(0, text.length);
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  } finally {
    document.body.removeChild(el);
    selection?.removeAllRanges();
    if (previousRange) selection?.addRange(previousRange);
  }

  return ok;
}
