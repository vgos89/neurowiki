export function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStorageItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function getStorageJson<T>(key: string, fallback: T): T {
  const stored = getStorageItem(key);
  if (stored === null) return fallback;

  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}
