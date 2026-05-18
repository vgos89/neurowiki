/**
 * shareOrCopy — Send-to share with graceful clipboard fallback.
 *
 * On mobile devices that support the Web Share API (iOS Safari + Chrome,
 * Android Chrome / Edge / Samsung Internet), this opens the native share
 * sheet so the clinician can pick Messages, WhatsApp, AirDrop, Mail, or
 * any installed app — handy when a resident wants to send the case note
 * to an attending without copy-paste friction.
 *
 * On desktop or browsers without Web Share (older Firefox, etc.), this
 * falls back to writing to the clipboard. The button label is "Send to…"
 * but the action is always something useful for the clinician.
 *
 * Built 2026-05-17 per V direction to give every Copy surface a Send
 * sibling action. Used by ShareButton primitive + CalculatorHeader.
 *
 * @param text  The plain-text payload to share or copy.
 * @param options.title  Optional title for the share sheet (e.g. "NIHSS").
 * @returns 'shared' | 'copied' | 'cancelled'
 */
export type ShareOrCopyResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export interface ShareOrCopyOptions {
  title?: string;
}

export async function shareOrCopy(
  text: string,
  options: ShareOrCopyOptions = {}
): Promise<ShareOrCopyResult> {
  if (typeof navigator === 'undefined' || !text) return 'failed';

  // Web Share API preferred when present + supports the text payload.
  const shareData: ShareData = { text };
  if (options.title) shareData.title = options.title;

  const supportsShare =
    typeof navigator.share === 'function' &&
    (typeof navigator.canShare !== 'function' || navigator.canShare(shareData));

  if (supportsShare) {
    try {
      await navigator.share(shareData);
      return 'shared';
    } catch (err) {
      const error = err as Error;
      // User dismissed the share sheet — don't fall through to clipboard.
      if (error?.name === 'AbortError') return 'cancelled';
      // Any other error → fall through to clipboard fallback below.
    }
  }

  // Clipboard fallback.
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
