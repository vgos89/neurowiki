import { useEffect, useState } from 'react';
import {
  type ConsentRegion,
  regionForCountry,
  getCachedCountry,
  setCachedCountry,
} from '../lib/consent';

/**
 * useConsentRegion — resolves the visitor's consent region (strict opt-in vs
 * default-on) for the analytics-consent gate.
 *
 * Reads a cached country synchronously (no flash on return visits). On the first
 * visit it fetches /api/geo once (deduped across consumers), caches the country,
 * and updates. Until it resolves, region is 'unknown' which the consent logic
 * treats as strict (the fail-safe: never default analytics on for an
 * unidentified visitor). `resolved` lets callers hold the analytics UI until the
 * region is known, so an opt-in control never flashes before flipping.
 */

let inflight: Promise<string | null> | null = null;

function fetchCountry(): Promise<string | null> {
  if (inflight) return inflight;
  inflight = fetch('/api/geo')
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (d && typeof d.country === 'string' ? d.country : null))
    .catch(() => null);
  return inflight;
}

export function useConsentRegion(): { region: ConsentRegion; resolved: boolean } {
  const cachedCountry = getCachedCountry();
  const [region, setRegion] = useState<ConsentRegion>(
    cachedCountry ? regionForCountry(cachedCountry) : 'unknown',
  );
  const [resolved, setResolved] = useState<boolean>(cachedCountry != null);

  useEffect(() => {
    if (cachedCountry != null) return; // already known synchronously
    let alive = true;
    fetchCountry().then((country) => {
      if (!alive) return;
      if (country) setCachedCountry(country);
      setRegion(regionForCountry(country));
      setResolved(true);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { region, resolved };
}
