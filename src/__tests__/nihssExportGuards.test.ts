import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * V direction 2026-09-01: the Late IVT and LVO pathway shortcuts on the NIHSS
 * calculator show their determination on screen "for the reference of the user",
 * but that determination must NOT "copy-paste over in the template".
 *
 * The NIHSS export documents the clinician's own exam and the patient context
 * they entered. A pathway's conclusion is a different artifact, reached in a
 * different tool, and pasting it into a NIHSS note would attribute a decision to
 * an exam that did not make it.
 *
 * Nothing about the type system prevents a future edit from adding
 * `ivtVerdict` to buildText, so this asserts it at the source level. It is
 * deliberately a text assertion: the property being protected is "this data does
 * not flow into that string", which no runtime test on buildText's output could
 * prove for every possible pathway state.
 */

const SRC = resolve(__dirname, '../pages/NihssCalculator.tsx');
const source = readFileSync(SRC, 'utf-8');

/** Extract the body of `const buildText = () => { ... };` by brace matching. */
function extractBuildText(src: string): string {
  const start = src.indexOf('const buildText = () => {');
  if (start === -1) throw new Error('buildText not found — did it get renamed?');
  let depth = 0;
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error('unbalanced braces while extracting buildText');
}

describe('NIHSS export guards', () => {
  const buildText = extractBuildText(source);

  it('extracts a plausible buildText body', () => {
    expect(buildText.length).toBeGreaterThan(500);
    expect(buildText).toContain('NIHSS:');
  });

  it.each(['ivtVerdict', 'evtVerdict', 'PathwayVerdict', 'activePathwayModal'])(
    'buildText does not reference %s',
    (symbol) => {
      expect(buildText).not.toContain(symbol);
    },
  );

  it('buildText emits no pathway verdict wording', () => {
    for (const phrase of ['Path C', 'Path A', 'Path B', 'EVT Preferred', 'Outside Path C Scope']) {
      expect(buildText).not.toContain(phrase);
    }
  });

  it('the verdict state exists and is documented as reference-only', () => {
    // Guards against the test silently passing because the feature was removed.
    expect(source).toContain('const [ivtVerdict, setIvtVerdict]');
    expect(source).toContain('const [evtVerdict, setEvtVerdict]');
    expect(source).toContain('REFERENCE ONLY');
  });

  it('a reset clears both pathway verdicts so a new patient cannot inherit them', () => {
    const start = source.indexOf('const handleReset = () => {');
    expect(start).toBeGreaterThan(-1);
    const body = source.slice(start, start + 2000);
    expect(body).toContain('setIvtVerdict(null)');
    expect(body).toContain('setEvtVerdict(null)');
  });
});
