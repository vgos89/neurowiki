/**
 * Reconstructs EMR-style copy text from a SavedCase. Mirrors the live
 * `buildText` logic in NihssCalculator so a saved case round-trips with
 * a stable, documentation-ready format.
 *
 * Stable header → patient-context block (always emitted with "Not entered"
 * / "None" fallbacks) → timestamps block (only filled stamps) → item lines
 * (NIHSS only) → generic payload (when present).
 *
 * V direction 2026-05-19: opening a saved case must show + copy the same
 * format the clinician already shared mid-code, even if some fields were
 * entered later.
 */

import type { SavedCase, SavedCaseData } from './types';

// Stable NIHSS item ID → label map — mirrors NIHSS_ITEMS in
// src/utils/nihssShortcuts.ts. Kept inline to avoid a runtime dependency
// from the cases lib on the calculator utilities.
const NIHSS_ITEM_LABELS: ReadonlyArray<{ id: string; label: string }> = [
  { id: '1a', label: '1a. LOC' },
  { id: '1b', label: '1b. LOC Questions' },
  { id: '1c', label: '1c. LOC Commands' },
  { id: '2',  label: '2. Best Gaze' },
  { id: '3',  label: '3. Visual Fields' },
  { id: '4',  label: '4. Facial Palsy' },
  { id: '5a', label: '5a. Motor L Arm' },
  { id: '5b', label: '5b. Motor R Arm' },
  { id: '6a', label: '6a. Motor L Leg' },
  { id: '6b', label: '6b. Motor R Leg' },
  { id: '7',  label: '7. Limb Ataxia' },
  { id: '8',  label: '8. Sensory' },
  { id: '9',  label: '9. Best Language' },
  { id: '10', label: '10. Dysarthria' },
  { id: '11', label: '11. Extinction/Neglect' },
];

const ANTICOAG_LABELS: Record<string, string> = {
  doac: 'DOAC',
  warfarin: 'Warfarin',
  antiplatelet: 'Antiplatelet',
  heparin: 'Heparin/LMWH',
};

const TIMESTAMP_EVENTS = [
  'Code Activation',
  'Neurology Evaluation',
  'CT Read Time',
  'Thrombolytic Administered',
  'Neuro IR Contacted',
  'NCC/ICU Sign-out',
] as const;

function fmtDateTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function fmtTime(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function nihssSeverityBracket(total: number): string {
  if (total === 0) return 'no stroke symptoms';
  if (total <= 4) return 'minor stroke';
  if (total <= 15) return 'moderate stroke';
  if (total <= 20) return 'moderate-severe stroke';
  return 'severe stroke';
}

/**
 * Build the EMR-style copy text for a saved case. Returns a multi-block
 * string joined by blank lines.
 */
export function formatSavedCaseAsEmrText(c: SavedCase): string {
  const { data, source, initials, note } = c;
  const blocks: string[] = [];

  // ── Header ─────────────────────────────────────────────────────────
  if (data.nihss) {
    blocks.push(`NIHSS — ${data.nihss.score} (${nihssSeverityBracket(data.nihss.score)})`);
  } else {
    // Generic — read headline from payload, fall back to source.title
    const headline = pickGenericHeadline(data);
    blocks.push(headline ?? source.title);
  }

  // ── Patient initials + saved-at line (every case) ─────────────────
  const patientLine = `Patient: ${initials}    Saved: ${fmtDateTime(c.createdAt)}${c.updatedAt !== c.createdAt ? `    Updated: ${fmtDateTime(c.updatedAt)}` : ''}`;
  blocks.push(patientLine);

  // ── Patient context block — always emitted with fallbacks ─────────
  const contextLines: string[] = [];
  if (data.nihss?.performedAt) {
    contextLines.push(`Exam Performed: ${fmtDateTime(data.nihss.performedAt)}`);
  } else if (data.nihss) {
    // NIHSS case but no performedAt captured
    contextLines.push(`Exam Performed: Not entered`);
  }

  const pc = data.patientContext;
  if (pc) {
    contextLines.push(
      pc.lkw === null
        ? `LKW: Unknown / wake-up`
        : typeof pc.lkw === 'number'
        ? `LKW: ${fmtDateTime(pc.lkw)}`
        : `LKW: Not entered`
    );
    contextLines.push(
      pc.systolic && pc.diastolic
        ? `BP: ${pc.systolic}/${pc.diastolic}`
        : `BP: Not entered`
    );
    contextLines.push(
      pc.glucose
        ? `Glucose: ${pc.glucose} mg/dL`
        : `Glucose: Not entered`
    );
    const anticoagList = (pc.anticoag ?? []).filter((k) => k !== 'none');
    if (anticoagList.length > 0) {
      const list = anticoagList.map((k) => ANTICOAG_LABELS[k] ?? k).join(', ');
      contextLines.push(`Anti-Coag/Antiplatelet: ${list}`);
    } else {
      contextLines.push(`Anti-Coag/Antiplatelet: None`);
    }
    if (pc.preExistingDeficits) {
      contextLines.push(`Pre-existing deficits: ${pc.preExistingDeficits}`);
    }
  }
  if (contextLines.length > 0) blocks.push(contextLines.join('\n'));

  // ── Stroke timestamps — branches on storage mode ───────────────────
  //
  //   `absolute` mode (legacy + opt-in): values are Unix ms. Display as
  //     "Code Activation: 03:14 PM" plus elapsed-since-anchor offsets.
  //   `relative` mode (default for new cases as of 2026-05-19): values are
  //     ms offsets from the earliest stamp. No wall-clock time is stored;
  //     display as offsets only ("anchor", "+12m", "+18m").
  //
  //   Mode field absence = legacy case = treat as `absolute`.
  const stamps = data.strokeTimestamps;
  const mode = data.strokeTimestampsMode ?? 'absolute';
  if (stamps) {
    const stampLines: string[] = [];
    if (mode === 'absolute') {
      const anchor = stamps['Code Activation'];
      for (const event of TIMESTAMP_EVENTS) {
        const t = stamps[event];
        if (!t) continue;
        if (event === 'Code Activation' || !anchor) {
          stampLines.push(`${event}: ${fmtTime(t)}`);
        } else {
          const diffMin = Math.max(0, Math.floor((t - anchor) / 60000));
          const hh = Math.floor(diffMin / 60);
          const mm = diffMin % 60;
          const elapsed = hh > 0 ? `+${hh}h ${mm}m` : `+${mm}m`;
          stampLines.push(`${event}: ${fmtTime(t)} (${elapsed})`);
        }
      }
    } else {
      // Relative mode: values are offset-from-earliest in ms. The earliest
      // (value === 0) is the anchor; everything else is positive elapsed.
      // Identify the anchor event for labeling.
      const filled = TIMESTAMP_EVENTS
        .map((event) => [event, stamps[event]] as const)
        .filter((e): e is readonly [typeof TIMESTAMP_EVENTS[number], number] => typeof e[1] === 'number');
      const anchorEntry = filled.find(([, offset]) => offset === 0);
      const anchorEvent = anchorEntry?.[0];
      for (const [event, offset] of filled) {
        if (event === anchorEvent) {
          stampLines.push(`${event}: anchor (relative-only storage)`);
        } else {
          const diffMin = Math.max(0, Math.floor(offset / 60000));
          const hh = Math.floor(diffMin / 60);
          const mm = diffMin % 60;
          const elapsed = hh > 0 ? `+${hh}h ${mm}m` : `+${mm}m`;
          stampLines.push(`${event}: ${elapsed}`);
        }
      }
    }
    if (stampLines.length > 0) {
      blocks.push(`Timestamps:\n${stampLines.join('\n')}`);
    }
  }

  // ── NIHSS item breakdown ──────────────────────────────────────────
  if (data.nihss) {
    const values = data.nihss.values;
    const itemLines = NIHSS_ITEM_LABELS.map(({ id, label }) => {
      const v = values[id];
      if (id === '10' && v === 9) return `${label}: UN`;
      return `${label}: ${v ?? 0}`;
    });
    blocks.push(itemLines.join('\n'));
  }

  // ── Generic payload subline (for non-NIHSS calculators) ───────────
  if (!data.nihss && data.payload) {
    const subline = pickGenericSubline(data);
    if (subline) blocks.push(subline);
  }

  // ── Note ──────────────────────────────────────────────────────────
  if (note) {
    blocks.push(`Note: ${note}`);
  }

  return blocks.join('\n\n');
}

/**
 * Build a short human display label for the case (used in card headers).
 */
export function getSavedCaseHeadline(c: SavedCase): string {
  if (c.data.nihss) {
    return `NIHSS ${c.data.nihss.score} · ${c.data.nihss.severity}`;
  }
  const headline = pickGenericHeadline(c.data);
  return headline ?? c.source.title;
}

/**
 * Build a short subline (e.g., severity, secondary metric).
 */
export function getSavedCaseSubline(c: SavedCase): string | null {
  if (c.data.nihss) {
    return null; // headline already includes severity
  }
  return pickGenericSubline(c.data);
}

function pickGenericHeadline(data: SavedCaseData): string | null {
  if (!data.payload) return null;
  for (const key of Object.keys(data.payload)) {
    const block = data.payload[key];
    if (block?.headline) return String(block.headline);
  }
  return null;
}

function pickGenericSubline(data: SavedCaseData): string | null {
  if (!data.payload) return null;
  for (const key of Object.keys(data.payload)) {
    const block = data.payload[key];
    if (block?.subline) return String(block.subline);
  }
  return null;
}
