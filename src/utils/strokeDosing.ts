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

/**
 * Volume of reconstituted tenecteplase to administer, in mL, per the weight band.
 *
 * Transcribed directly from 2026 AHA/ASA Table 7 rather than derived from the
 * mg figure, so a future change to either column cannot silently desynchronise
 * them. Table 7: <60 kg 15 mg / 3 mL; 60 to <70 17.5 / 3.5; 70 to <80 20 / 4;
 * 80 to <90 22.5 / 4.5; >=90 25 / 5.
 *
 * A nurse draws a volume, not a mass, so surfacing this alongside the dose
 * removes a bedside conversion step.
 */
export function getTNKVolumeMl(weightKg: number): number {
  if (weightKg < 60) return 3;
  if (weightKg < 70) return 3.5;
  if (weightKg < 80) return 4;
  if (weightKg < 90) return 4.5;
  return 5;
}

/**
 * True when the 2026 AHA/ASA Table 7 low-weight footnote applies.
 *
 * Footnote dagger, verbatim: "If <50kg and accurate weight is known, dosing per
 * 1-kg band may be used. Do not delay thrombolysis to obtain exact weight,
 * timely treatment is critical. With estimated weights, dosing per 1-kg band is
 * not necessarily safer than 10-kg band dosing."
 *
 * The banded dose gives every patient under 60 kg a flat 15 mg, so a 45 kg
 * patient receives 0.33 mg/kg against the recommended 0.25. The guideline
 * permits finer banding there; this flags when to consider it.
 */
export function isLowWeightBandCaveat(weightKg: number): boolean {
  return weightKg > 0 && weightKg < 50;
}
