/**
 * Shared stroke dosing utilities.
 * Single source of truth for tPA and TNK dosing — import from here,
 * never re-implement inline.  (MED-02: DRY fix)
 */

export interface TpaDoses {
  total: number;
  bolus: number;
  infusion: number;
}

/**
 * Calculate TNK dose in mg based on weight (kg).
 * AHA/ASA 2026: 0.25 mg/kg in weight-tiered steps, max 25 mg.
 */
export function getTNKDose(weightKg: number): number {
  if (weightKg < 60) return 15;
  if (weightKg < 70) return 17.5;
  if (weightKg < 80) return 20;
  if (weightKg < 90) return 22.5;
  return 25;
}

/**
 * Calculate tPA doses in mg based on weight (kg).
 * AHA/ASA 2026: 0.9 mg/kg max 90 mg; 10% bolus + 90% over 60 min.
 */
export function getTpaDoses(weightKg: number): TpaDoses {
  const total = Math.min(Math.round(weightKg * 0.9 * 10) / 10, 90);
  const bolus = Math.round(total * 0.1 * 10) / 10;
  const infusion = Math.round(total * 0.9 * 10) / 10;
  return { total, bolus, infusion };
}

/**
 * Normalise weight to kg regardless of input unit.
 */
export function toKg(value: number, unit: 'kg' | 'lbs'): number {
  if (value === 0) return 0;
  return unit === 'kg'
    ? Math.round(value * 10) / 10
    : Math.round((value / 2.205) * 10) / 10;
}
