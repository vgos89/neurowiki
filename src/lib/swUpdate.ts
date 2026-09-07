/**
 * When a new build is allowed to take over an open app.
 *
 * BACKGROUND. The service worker uses skipWaiting + clientsClaim, so a new
 * worker activates as soon as it installs. The page it activates over is still
 * running the previous build's code, so something has to reload. The question is
 * only when, and the answer has to respect that this is a bedside tool: a
 * clinician mid-exam must never have the page pulled from under them, and a
 * clinician who just launched the app should not spend a whole session on a
 * build we already replaced.
 *
 * Previously the only rule was "reload once the tab is hidden". Safe, but it
 * meant the entire first session after a deploy ran the old code, which for a
 * clinically meaningful fix is one more patient handled on the old behaviour.
 *
 * THE POLICY, in order:
 *   1. No work in progress  ->  reload immediately. Nothing is lost and the
 *      clinician never sees it; they simply launch into the current build.
 *   2. Work in progress     ->  hold, and surface a prompt so they can take the
 *      update at a moment of their choosing.
 *   3. Either way           ->  if the tab goes hidden while an update is
 *      pending, reload then. This is the original behaviour, kept as the
 *      backstop so a prompt that is never tapped still resolves.
 *
 * WHAT THIS CANNOT DO. A service worker cannot be pushed from the server. There
 * is no mechanism, here or anywhere, to update an app that is not running. Web
 * Push can deliver a notification but cannot make a closed app fetch new code.
 * This narrows the window to "on next launch, or sooner"; it does not remove it.
 */

type PendingListener = (pending: boolean) => void;

const listeners = new Set<PendingListener>();
const workChecks = new Set<() => boolean>();

let updatePending = false;
let hiddenBackstopAttached = false;

/**
 * Register a predicate reporting whether this surface holds unsaved clinical
 * work. Any registered predicate returning true blocks an automatic reload.
 *
 * Opt-in per surface rather than a global guess: a surface knows what "in
 * progress" means for it, and a wrong answer here either interrupts a clinician
 * or strands them on a stale build.
 *
 * Returns an unsubscribe for unmount.
 */
export function registerWorkInProgressCheck(check: () => boolean): () => void {
  workChecks.add(check);
  return () => workChecks.delete(check);
}

/** True when any registered surface reports unsaved work. */
export function hasWorkInProgress(): boolean {
  for (const check of workChecks) {
    try {
      if (check()) return true;
    } catch {
      // A broken predicate must not strand the app on an old build, but it also
      // must not authorise a reload over work we cannot verify. Treat it as
      // "work present": the prompt still gives the clinician a way through.
      return true;
    }
  }
  return false;
}

/** Subscribe to "an update is waiting". Fires immediately with current state. */
export function subscribeToPendingUpdate(fn: PendingListener): () => void {
  listeners.add(fn);
  // The immediate call is wrapped for the same reason notify() is: a subscriber
  // that throws must not take down subscription for everyone after it, which is
  // what an unwrapped call here would do.
  try {
    fn(updatePending);
  } catch {
    // ignore
  }
  return () => listeners.delete(fn);
}

export function isUpdatePending(): boolean {
  return updatePending;
}

/** Apply the waiting update now. */
export function applyPendingUpdate(): void {
  window.location.reload();
}

function notify(): void {
  for (const fn of listeners) {
    try {
      fn(updatePending);
    } catch {
      // one bad subscriber must not stop the others
    }
  }
}

function attachHiddenBackstop(): void {
  if (hiddenBackstopAttached) return;
  hiddenBackstopAttached = true;
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      document.removeEventListener('visibilitychange', onVisibility);
      window.location.reload();
    }
  };
  document.addEventListener('visibilitychange', onVisibility);
}

/**
 * Called when a new worker has taken control and the page would otherwise
 * reload. Decides between reloading now and holding for the clinician.
 */
export function handleUpdateReady(): void {
  if (document.visibilityState === 'hidden') {
    window.location.reload();
    return;
  }
  if (!hasWorkInProgress()) {
    window.location.reload();
    return;
  }
  updatePending = true;
  notify();
  attachHiddenBackstop();
}

/** Test seam. Not used by application code. */
export function __resetSwUpdateStateForTests(): void {
  listeners.clear();
  workChecks.clear();
  updatePending = false;
  hiddenBackstopAttached = false;
}
