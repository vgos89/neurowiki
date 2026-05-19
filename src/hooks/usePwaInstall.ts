import { useEffect, useState, useCallback } from 'react';

/**
 * usePwaInstall — manages the "Add NeuroWiki app to your phone" install flow
 * across iOS and Android.
 *
 * Android / desktop Chrome: captures the `beforeinstallprompt` event so we
 * can re-trigger it on our own UI (the browser's native prompt is easy to
 * dismiss; we want a contextual prompt in the disclaimer modal + engagement
 * bubble).
 *
 * iOS Safari: doesn't fire beforeinstallprompt and doesn't allow programmatic
 * install. We detect iOS Safari and surface an instructions sheet instead.
 *
 * Detect already-installed state via `display-mode: standalone` so we never
 * prompt a user who's already added the app.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type InstallStatus = 'installable' | 'ios-manual' | 'already-installed' | 'unsupported';

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect already-installed (standalone mode means app launched from home screen)
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      // @ts-expect-error iOS Safari uses navigator.standalone (non-standard)
      const iosStandalone = window.navigator.standalone === true;
      setIsInstalled(standalone || iosStandalone);
    };
    checkInstalled();

    // Detect iOS Safari (which can't programmatically prompt)
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPhone|iPad|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    setIsIos(isIosDevice && isSafari);

    // Capture beforeinstallprompt for Android / Chrome desktop
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Listen for actual install (some browsers fire this when user accepts)
    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    // Watch display-mode changes (rare but possible)
    const mq = window.matchMedia('(display-mode: standalone)');
    mq.addEventListener('change', checkInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
      mq.removeEventListener('change', checkInstalled);
    };
  }, []);

  /** Trigger the native install prompt (Android/Chrome). Resolves to 'accepted' or 'dismissed'. */
  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return choice.outcome;
    } catch {
      return 'unavailable';
    }
  }, [deferredPrompt]);

  const status: InstallStatus = isInstalled
    ? 'already-installed'
    : deferredPrompt
    ? 'installable'
    : isIos
    ? 'ios-manual'
    : 'unsupported';

  return { status, promptInstall, isInstalled, isIos };
}
