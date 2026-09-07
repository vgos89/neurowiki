/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  registerWorkInProgressCheck,
  hasWorkInProgress,
  subscribeToPendingUpdate,
  isUpdatePending,
  handleUpdateReady,
  __resetSwUpdateStateForTests,
} from './swUpdate';

let reload: ReturnType<typeof vi.fn>;

beforeEach(() => {
  __resetSwUpdateStateForTests();
  reload = vi.fn();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, reload },
  });
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
});
afterEach(() => vi.restoreAllMocks());

describe('work-in-progress registry', () => {
  it('reports nothing in progress by default', () => {
    expect(hasWorkInProgress()).toBe(false);
  });

  it('reports work when any registered surface says so', () => {
    registerWorkInProgressCheck(() => false);
    registerWorkInProgressCheck(() => true);
    expect(hasWorkInProgress()).toBe(true);
  });

  it('unsubscribes cleanly', () => {
    const off = registerWorkInProgressCheck(() => true);
    expect(hasWorkInProgress()).toBe(true);
    off();
    expect(hasWorkInProgress()).toBe(false);
  });

  it('treats a throwing predicate as work present, never as permission to reload', () => {
    registerWorkInProgressCheck(() => { throw new Error('boom'); });
    expect(hasWorkInProgress()).toBe(true);
  });
});

describe('update policy', () => {
  it('reloads immediately when nothing is in progress', () => {
    handleUpdateReady();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(isUpdatePending()).toBe(false);
  });

  it('holds and marks pending when an exam is in progress', () => {
    registerWorkInProgressCheck(() => true);
    handleUpdateReady();
    expect(reload).not.toHaveBeenCalled();
    expect(isUpdatePending()).toBe(true);
  });

  it('notifies subscribers so the prompt can appear', () => {
    const seen: boolean[] = [];
    subscribeToPendingUpdate((p) => seen.push(p));
    expect(seen).toEqual([false]); // fires immediately with current state
    registerWorkInProgressCheck(() => true);
    handleUpdateReady();
    expect(seen).toEqual([false, true]);
  });

  it('reloads without prompting when the tab is already hidden, even mid-exam', () => {
    // Nobody is looking, so there is no interruption to avoid and no prompt to
    // read. This is the original behaviour, kept as the backstop.
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    registerWorkInProgressCheck(() => true);
    handleUpdateReady();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(isUpdatePending()).toBe(false);
  });

  it('a failing subscriber does not stop the others', () => {
    const good = vi.fn();
    subscribeToPendingUpdate(() => { throw new Error('bad subscriber'); });
    subscribeToPendingUpdate(good);
    registerWorkInProgressCheck(() => true);
    handleUpdateReady();
    expect(good).toHaveBeenCalledWith(true);
  });
});
