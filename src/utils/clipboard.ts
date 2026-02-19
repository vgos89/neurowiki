/**
 * Copy text to clipboard and invoke an optional callback on success.
 * Returns a promise that resolves to true on success, false on failure.
 */
export async function copyToClipboard(text: string, onSuccess?: () => void): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess?.();
    return true;
  } catch {
    return false;
  }
}
