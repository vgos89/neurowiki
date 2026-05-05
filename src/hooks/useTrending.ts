// HOME_SPEC §1.7.4 — daily-seeded trending trials
// PRNG: mulberry32 seeded from djb2 hash of today's YYYY-MM-DD date string.
// MUST NOT use Math.random() in selection path.
import { useMemo } from 'react';
import { trials, type TrialItem } from '../data/trialListData';

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let z = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

export function useTrending(): TrialItem[] {
  const todayKey = new Date().toISOString().slice(0, 10);

  return useMemo(() => {
    const seed = djb2(todayKey);
    const rand = mulberry32(seed);
    // Clone — never mutate the source catalog.
    const pool = trials.slice();
    // Fisher-Yates shuffle using the deterministic PRNG.
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 5);
  }, [todayKey]);
}
