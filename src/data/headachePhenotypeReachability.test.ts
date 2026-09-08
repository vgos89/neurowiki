import { describe, it, expect } from 'vitest';
import { CORE_QUESTIONS, CONDITIONAL_BRANCHES, getActiveQuestions } from './headacheQuestions';
import { evaluateHeadachePhenotypes, HEADACHE_PHENOTYPES, type ChipId } from './clinicHeadacheData';

/**
 * Reachability: an answer path THROUGH THE QUESTION FLOW reaches a strong
 * match. Coverage today: 8 of the 16 engine phenotypes have walks; the
 * inventory guard at the bottom tracks the other 8 as explicit debt
 * (TASKS.md, headache reachability walks follow-up) and fails when a new
 * phenotype is added without being walked or listed.
 *
 * The older reachability tests injected chips directly, which proves the
 * criteria evaluate correctly but not that a clinician can produce those chips
 * by answering questions. That distinction is exactly how the 2026-09-07 review
 * findings survived: trigeminal neuralgia was fully diagnosable in the data and
 * unreachable behind a single quality answer, and retinal migraine sat behind
 * an aura screen that a retinal presentation never opened.
 *
 * walk() simulates the UI contract: at each step the question must be OFFERED
 * given everything selected so far (core spine, or a branch whose `fires`
 * predicate passes). An option answered on a screen the clinician would never
 * have seen fails the walk, which is the property that matters.
 */
function walk(path: ReadonlyArray<readonly [string, string]>): Set<ChipId> {
  const selected = new Set<ChipId>();
  const answeredSingle = new Map<string, string>();
  for (const [qid, optId] of path) {
    const active = getActiveQuestions(selected);
    const q = active.find((x) => x.id === qid);
    expect(q, `question "${qid}" was not offered at this point in the flow`).toBeTruthy();
    const opt = q!.options.find((o) => o.id === optId);
    expect(opt, `option "${optId}" does not exist on "${qid}"`).toBeTruthy();
    // Single-select fidelity (architect review 2026-09-08, condition 6): the
    // UI replaces a single-select answer, it never stacks two. A walk that
    // answers one twice asserts an unproducible chip set. State that is not
    // producible through the UI (restored or merged drafts) is modelled by
    // direct chip injection AFTER the walk, never by double-answering.
    if (q!.select === 'single') {
      expect(
        answeredSingle.has(qid),
        `single-select "${qid}" answered twice ("${answeredSingle.get(qid)}" then "${optId}") — not producible in the UI; inject chips directly instead`,
      ).toBe(false);
      answeredSingle.set(qid, optId);
    }
    opt!.chips.forEach((c) => selected.add(c));
  }
  return selected;
}

function strengthOf(selected: Set<ChipId>, phenotypeId: string) {
  return evaluateHeadachePhenotypes(selected).find((m) => m.phenotypeId === phenotypeId)?.matchStrength;
}

// A migraine-without-aura spine, reused as the substrate several branches need.
const MIGRAINE_SPINE: ReadonlyArray<readonly [string, string]> = [
  ['q-onset', 'recurrent'], ['q-frequency', 'f-1-4'], ['q-duration', 'd-4-72h'],
  ['q-attack-count', 'c-gt10'], ['q-chronicity', 'ch-ge3'], ['q-quality', 'qual-throb'],
  ['q-location', 'loc-one'], ['q-severity', 'sev-mod'], ['q-activity', 'act-worse'],
  ['q-associated', 'as-nausea-modsev'],
];

describe('phenotype reachability walks through the question flow', () => {
  it('sanity: the walk itself enforces offering (a branch option cannot be answered cold)', () => {
    // q-trigeminal must NOT be offered before any quality/location answer.
    const offered = getActiveQuestions(new Set()).some((q) => q.id === 'q-trigeminal');
    expect(offered).toBe(false);
  });

  it('migraine without aura — full, spine only', () => {
    expect(strengthOf(walk(MIGRAINE_SPINE), 'migraine-without-aura')).toBe('full');
  });

  it('migraine with aura — full, aura branch opens on migraine features', () => {
    const s = walk([...MIGRAINE_SPINE,
      ['q-aura', 'aura-visual'], ['q-aura', 'aura-reversible'], ['q-aura', 'aura-onesided'],
      ['q-aura', 'aura-spread'], ['q-aura', 'aura-5-60'], ['q-aura', 'aura-then-ha'],
    ]);
    expect(strengthOf(s, 'migraine-with-aura')).toBe('full');
  });

  it('REGRESSION (finding 2): the aura branch opens on reported neuro symptoms alone, with a non-migrainous headache', () => {
    // Reversible-neuro presentation with monocular visual aura: mild pressing
    // bilateral headache, no nausea, no photophobia. Before 2026-09-07 the aura
    // screen never fired here and the patient exited as probable tension-type.
    // The full 1.2 match rests on ICHD-3 1.2 C requiring only "headache", not a
    // 1.1-meeting headache. This walk is the amaurosis-fugax-SHAPED presentation,
    // so the retinal subtype's exclusion steer MUST ride along (clinical review
    // BC-11): asserting the match without the steer would bless false reassurance.
    const s = walk([
      ['q-onset', 'recurrent'], ['q-frequency', 'f-1-4'], ['q-duration', 'd-4-72h'],
      ['q-attack-count', 'c-gt10'], ['q-chronicity', 'ch-ge3'], ['q-quality', 'qual-press'],
      ['q-location', 'loc-both'], ['q-severity', 'sev-mild'], ['q-activity', 'act-none'],
      ['q-associated', 'as-reversible-neuro'],
      ['q-aura', 'aura-retinal'], ['q-aura', 'aura-reversible'], ['q-aura', 'aura-onesided'],
      ['q-aura', 'aura-spread'], ['q-aura', 'aura-5-60'], ['q-aura', 'aura-then-ha'],
    ]);
    const m = evaluateHeadachePhenotypes(s).find((x) => x.phenotypeId === 'migraine-with-aura');
    expect(m?.matchStrength).toBe('full');
    expect(m?.subtype?.id).toBe('retinal-migraine');
    expect(m?.subtype?.note).toContain('amaurosis fugax');
  });

  it('REGRESSION (finding 3): trigeminal neuralgia — full, via the facial location answer with a NON-sharp quality', () => {
    // The premise this walk needs is only that the TN screen opens WITHOUT the
    // sharp-quality answer; a pressing quality establishes that without the
    // internal contradiction of one pain described as both throbbing and
    // shock-like (clinical review BC-11). Before 2026-09-07 the TN screen only
    // opened on the sharp-stabbing answer, so this walk failed at q-trigeminal.
    const s = walk([
      ['q-onset', 'recurrent'], ['q-frequency', 'f-ge15'], ['q-duration', 'd-lt15'],
      ['q-attack-count', 'c-gt10'], ['q-chronicity', 'ch-ge3'], ['q-quality', 'qual-press'],
      ['q-location', 'loc-face'], ['q-severity', 'sev-sev'], ['q-activity', 'act-none'],
      ['q-trigeminal', 'tn-distribution'], ['q-trigeminal', 'tn-shock'],
      ['q-trigeminal', 'tn-brief'], ['q-trigeminal', 'tn-trigger'],
    ]);
    expect(strengthOf(s, 'trigeminal-neuralgia')).toBe('full');
  });

  it('trigeminal neuralgia — full, via the new electric-shock quality answer', () => {
    const s = walk([
      ['q-onset', 'recurrent'], ['q-frequency', 'f-ge15'], ['q-duration', 'd-lt15'],
      ['q-attack-count', 'c-gt10'], ['q-chronicity', 'ch-ge3'], ['q-quality', 'qual-shock'],
      ['q-location', 'loc-one'], ['q-severity', 'sev-sev'], ['q-activity', 'act-none'],
      ['q-trigeminal', 'tn-distribution'], ['q-trigeminal', 'tn-brief'], ['q-trigeminal', 'tn-trigger'],
    ]);
    expect(strengthOf(s, 'trigeminal-neuralgia')).toBe('full');
  });

  it('REGRESSION (U1): trigeminal neuralgia — full, when severity is answered "very severe"', () => {
    // TN is routinely described as among the most severe pains known, so "very
    // severe" is the EXPECTED answer. Before 2026-09-07 tn-B accepted only
    // sev-severe: this walk completed the whole TN screen and matched nothing.
    const s = walk([
      ['q-onset', 'recurrent'], ['q-frequency', 'f-ge15'], ['q-duration', 'd-lt15'],
      ['q-attack-count', 'c-gt10'], ['q-chronicity', 'ch-ge3'], ['q-quality', 'qual-shock'],
      ['q-location', 'loc-one'], ['q-severity', 'sev-vsev'], ['q-activity', 'act-none'],
      ['q-trigeminal', 'tn-distribution'], ['q-trigeminal', 'tn-brief'], ['q-trigeminal', 'tn-trigger'],
    ]);
    expect(strengthOf(s, 'trigeminal-neuralgia')).toBe('full');
  });

  it('drift guard (BC-6): only the orbital option on q-location may mention the eye', () => {
    // q-location is single-select, and cluster-B / ph-B demote-gates require
    // loc-orbital-temporal, which only the orbital option contributes. A second
    // option whose label mentions the eye siphons periorbital patients off that
    // chip and silently caps cluster and paroxysmal hemicrania at Probable.
    const q = CORE_QUESTIONS.find((x) => x.id === 'q-location')!;
    const eyeMentions = q.options.filter((o) => /\beye\b|orbit/i.test(o.label));
    expect(eyeMentions.map((o) => o.id)).toEqual(['loc-orbital']);
  });

  it('episodic tension-type — full, spine only', () => {
    const s = walk([
      ['q-onset', 'recurrent'], ['q-frequency', 'f-1-4'], ['q-duration', 'd-30min-7d'],
      ['q-attack-count', 'c-gt10'], ['q-chronicity', 'ch-ge3'], ['q-quality', 'qual-press'],
      ['q-location', 'loc-both'], ['q-severity', 'sev-mild'], ['q-activity', 'act-none'],
    ]);
    expect(strengthOf(s, 'episodic-tth')).toBe('full');
  });

  it('cluster headache — full via the ORBITAL answer (BC-6: periorbital patients must keep this path)', () => {
    const s = walk([
      ['q-onset', 'recurrent'], ['q-frequency', 'f-ge15'], ['q-duration', 'd-15-180'],
      ['q-attack-count', 'c-gt10'], ['q-chronicity', 'ch-ge3'], ['q-quality', 'qual-sharp'],
      ['q-location', 'loc-orbital'], ['q-severity', 'sev-vsev'], ['q-activity', 'act-none'],
      ['q-associated', 'as-lacrimation'], ['q-associated', 'as-restless'],
      ['q-cluster-detail', 'cluster-bout-freq'], ['q-cluster-subtype', 'cluster-episodic'],
    ]);
    const m = evaluateHeadachePhenotypes(s).find((x) => x.phenotypeId === 'cluster-headache');
    expect(m?.matchStrength).toBe('full');
    expect(m?.subtype?.id).toBe('cluster-episodic');
  });

  it('REGRESSION (BC-9): contradictory episodic + chronic cluster answers assert NO subtype', () => {
    // The subtype question is single-select in the UI, but restored or merged
    // state can still carry both chips; the resolver must not silently pick
    // episodic. The parent 3.1 match stands, unqualified.
    const s = walk([
      ['q-onset', 'recurrent'], ['q-frequency', 'f-ge15'], ['q-duration', 'd-15-180'],
      ['q-attack-count', 'c-gt10'], ['q-chronicity', 'ch-ge3'], ['q-quality', 'qual-sharp'],
      ['q-location', 'loc-orbital'], ['q-severity', 'sev-vsev'], ['q-activity', 'act-none'],
      ['q-associated', 'as-lacrimation'], ['q-associated', 'as-restless'],
      ['q-cluster-detail', 'cluster-bout-freq'],
      ['q-cluster-subtype', 'cluster-episodic'],
    ]);
    // Direct chip injection: the contradictory pair is NOT producible through
    // the UI (q-cluster-subtype is single-select and walk() rejects a second
    // answer). It models restored or merged draft state — the exact input the
    // resolver guard exists for.
    s.add('cluster-no-remission-or-lt-3mo');
    const m = evaluateHeadachePhenotypes(s).find((x) => x.phenotypeId === 'cluster-headache');
    expect(m?.matchStrength).toBe('full');
    expect(m?.subtype).toBeUndefined();
  });

  it('occipital neuralgia — full via the sharp-quality branch (binary full-or-hidden: all criteria are suppress-gates)', () => {
    const s = walk([
      ['q-onset', 'recurrent'], ['q-frequency', 'f-ge15'], ['q-duration', 'd-lt15'],
      ['q-attack-count', 'c-gt10'], ['q-chronicity', 'ch-ge3'], ['q-quality', 'qual-sharp'],
      ['q-location', 'loc-one'], ['q-severity', 'sev-sev'], ['q-activity', 'act-none'],
      ['q-occipital', 'on-loc'], ['q-occipital', 'on-dur'], ['q-occipital', 'on-dysaes'], ['q-occipital', 'on-tender'], ['q-occipital', 'on-block'],
    ]);
    expect(strengthOf(s, 'occipital-neuralgia')).toBe('full');
  });

  it('vestibular migraine — full once vertigo is reported (binary full-or-hidden)', () => {
    const s = walk([...MIGRAINE_SPINE,
      ['q-associated', 'as-vertigo'],
      ['q-vestibular', 'vest-ge5'], ['q-vestibular', 'vest-intensity'], ['q-vestibular', 'vest-duration'],
      ['q-vestibular', 'vest-migr-half'], ['q-vestibular', 'vest-history'],
    ]);
    expect(strengthOf(s, 'vestibular-migraine')).toBe('full');
  });

  it('hypnic headache — reachable from the sleep-only onset answer', () => {
    const s = walk([
      ['q-onset', 'sleep-only'], ['q-frequency', 'f-ge15'], ['q-duration', 'd-lt15'],
      ['q-attack-count', 'c-gt10'], ['q-chronicity', 'ch-ge3'], ['q-quality', 'qual-press'],
      ['q-location', 'loc-both'], ['q-severity', 'sev-mild'], ['q-activity', 'act-none'],
      ['q-hypnic', 'hypnic-freq'], ['q-hypnic', 'hypnic-3mo'], ['q-hypnic', 'hypnic-dur'],
    ]);
    expect(['full', 'probable']).toContain(strengthOf(s, 'hypnic-headache'));
  });

  it('inventory guard: every engine phenotype is either walked above or explicitly tracked as debt', () => {
    // Iterates HEADACHE_PHENOTYPES, the source of truth. The previous guard
    // iterated evaluateHeadachePhenotypes(new Set()), which returns [] (no
    // positive evidence), so its loop body never ran and it could never fail
    // (clinical review BC-10). When a phenotype is added, this now fails until
    // it is walked here or listed as debt. Debt walks are tracked in TASKS.md
    // (headache reachability walks follow-up, 2026-09-07), prioritising the
    // indomethacin- and autonomic-gated shapes that hid the original defects.
    const WALKED = new Set([
      'migraine-without-aura', 'migraine-with-aura', 'episodic-tth',
      'cluster-headache', 'trigeminal-neuralgia', 'occipital-neuralgia',
      'vestibular-migraine', 'hypnic-headache',
    ]);
    const UNWALKED_DEBT = new Set([
      'chronic-tth', 'chronic-migraine', 'status-migrainosus', 'hemicrania-continua',
      'paroxysmal-hemicrania', 'sunct-suna', 'ndph', 'primary-stabbing-headache',
    ]);
    const all = HEADACHE_PHENOTYPES.map((p) => p.id);
    expect(all).toHaveLength(16);
    for (const id of all) {
      expect(WALKED.has(id) || UNWALKED_DEBT.has(id), `phenotype "${id}" is neither walked nor tracked as debt`).toBe(true);
    }
    for (const id of [...WALKED, ...UNWALKED_DEBT]) {
      expect(all, `"${id}" is listed in this guard but no longer exists in the engine`).toContain(id);
      expect(WALKED.has(id) && UNWALKED_DEBT.has(id), `"${id}" cannot be both walked and debt`).toBe(false);
    }
  });
});
