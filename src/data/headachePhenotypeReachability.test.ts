import { describe, it, expect } from 'vitest';
import { CORE_QUESTIONS, CONDITIONAL_BRANCHES, getActiveQuestions } from './headacheQuestions';
import { evaluateHeadachePhenotypes, HEADACHE_PHENOTYPES, type ChipId } from './clinicHeadacheData';

/**
 * Reachability: an answer path THROUGH THE QUESTION FLOW reaches a strong
 * match. Coverage today: 10 of the 18 engine phenotypes have walks; the
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

  it('W1 (facial-pain expansion): glossopharyngeal presentation reaches full GPN and NEVER a TN match', () => {
    // Persona: pain under the angle of the jaw radiating to the ear, brought on
    // by talking and swallowing, severe, shock-like, each jab under two minutes.
    // The chip whose absence keeps TN out is loc-trigeminal-distribution,
    // contributed from exactly one place (the tn-distribution option) - and this
    // walk never answers it.
    const s = walk([
      ['q-onset', 'recurrent'], ['q-frequency', 'f-ge15'], ['q-duration', 'd-lt15'],
      ['q-attack-count', 'c-gt10'], ['q-chronicity', 'ch-ge3'], ['q-quality', 'qual-shock'],
      ['q-location', 'loc-throat-ear'], ['q-severity', 'sev-sev'], ['q-activity', 'act-none'],
      ['q-glossopharyngeal', 'gpn-brief'], ['q-glossopharyngeal', 'gpn-trigger'],
    ]);
    const out = evaluateHeadachePhenotypes(s);
    const gpn = out.find((x) => x.phenotypeId === 'glossopharyngeal-neuralgia');
    expect(gpn?.matchStrength).toBe('full');
    expect(gpn?.criteriaMet).toBe(2);
    // TN, occipital, primary stabbing and PIFP must be ABSENT from the output
    // entirely (suppress-gates fail), not merely non-full.
    for (const id of ['trigeminal-neuralgia', 'occipital-neuralgia', 'primary-stabbing-headache', 'persistent-idiopathic-facial-pain']) {
      expect(out.find((x) => x.phenotypeId === id), `${id} must be absent`).toBeUndefined();
    }
  });

  it('W8 (pre-gate C1): the loc-face route still reaches GPN via the territory-confirm option, and TN stays out', () => {
    // An angle-of-jaw presentation plausibly files under "In the face: cheek,
    // jaw, or upper lip". Before C1, that patient reached ONLY the TN screen and
    // could collect a confident full TN match while GPN stayed invisible.
    const s = walk([
      ['q-onset', 'recurrent'], ['q-frequency', 'f-ge15'], ['q-duration', 'd-lt15'],
      ['q-attack-count', 'c-gt10'], ['q-chronicity', 'ch-ge3'], ['q-quality', 'qual-shock'],
      ['q-location', 'loc-face'], ['q-severity', 'sev-vsev'], ['q-activity', 'act-none'],
      ['q-glossopharyngeal', 'gpn-territory'], ['q-glossopharyngeal', 'gpn-brief'], ['q-glossopharyngeal', 'gpn-trigger'],
    ]);
    const out = evaluateHeadachePhenotypes(s);
    expect(out.find((x) => x.phenotypeId === 'glossopharyngeal-neuralgia')?.matchStrength).toBe('full');
    expect(out.find((x) => x.phenotypeId === 'trigeminal-neuralgia')).toBeUndefined();
  });

  it('W9: a GPN near-miss (no trigger answered) is silently unclassified, with the safety teach still offered', () => {
    // gpn-B is a composite suppress-gate: 3 of its 4 sub-items met means the
    // phenotype is hidden, not "probable" (no §13.2.1.5 exists). The accepted
    // consequence is tested so it cannot drift silently; the vagal-safety teach
    // string rides the QUESTION, which fired regardless.
    const s = walk([
      ['q-onset', 'recurrent'], ['q-frequency', 'f-ge15'], ['q-duration', 'd-lt15'],
      ['q-attack-count', 'c-gt10'], ['q-chronicity', 'ch-ge3'], ['q-quality', 'qual-shock'],
      ['q-location', 'loc-throat-ear'], ['q-severity', 'sev-sev'], ['q-activity', 'act-none'],
      ['q-glossopharyngeal', 'gpn-brief'],
    ]);
    expect(strengthOf(s, 'glossopharyngeal-neuralgia')).toBeUndefined();
    const q = getActiveQuestions(s).find((x) => x.id === 'q-glossopharyngeal');
    expect(q?.teach).toBeTruthy();
    expect(q?.claimId).toBe('clinic-headache-gpn-vagal-safety');
  });

  it('W3 (facial-pain expansion): PIFP reaches full DESPITE a continuous-headache answer', () => {
    // Persona: constant dull ache across the cheek for a year, hours daily,
    // normal exam, dental workup negative. dur-continuous suppresses the
    // episodic phenotypes; PIFP is deliberately NOT in that suppression list,
    // because it is the daily entity the answer describes.
    const s = walk([
      ['q-onset', 'continuous'], ['q-frequency', 'f-ge15'], ['q-chronicity', 'ch-ge3'],
      ['q-quality', 'qual-press'], ['q-location', 'loc-face'], ['q-severity', 'sev-mod'],
      ['q-activity', 'act-none'],
      ['q-pifp', 'pifp-daily'], ['q-pifp', 'pifp-poorly-loc'], ['q-pifp', 'pifp-quality'],
      ['q-pifp', 'pifp-exam'], ['q-pifp', 'pifp-dental'],
    ]);
    const out = evaluateHeadachePhenotypes(s);
    const pifp = out.find((x) => x.phenotypeId === 'persistent-idiopathic-facial-pain');
    expect(pifp?.matchStrength).toBe('full');
    expect(pifp?.criteriaMet).toBe(5);
    expect(out.find((x) => x.phenotypeId === 'trigeminal-neuralgia')).toBeUndefined();
  });

  it('W10: PIFP without the dental-exclusion answer is silently unclassified, with the workup teach still offered', () => {
    // pifp-E is a deliberate hard gate: surfacing 13.12 before a dental cause is
    // excluded is the failure mode the criterion exists to prevent. The workup
    // requirement reaches the clinician via the q-pifp option label and teach,
    // which fired regardless.
    const s = walk([
      ['q-onset', 'continuous'], ['q-frequency', 'f-ge15'], ['q-chronicity', 'ch-ge3'],
      ['q-quality', 'qual-press'], ['q-location', 'loc-face'], ['q-severity', 'sev-mod'],
      ['q-activity', 'act-none'],
      ['q-pifp', 'pifp-daily'], ['q-pifp', 'pifp-poorly-loc'], ['q-pifp', 'pifp-quality'],
      ['q-pifp', 'pifp-exam'],
    ]);
    expect(strengthOf(s, 'persistent-idiopathic-facial-pain')).toBeUndefined();
    const q = getActiveQuestions(s).find((x) => x.id === 'q-pifp');
    expect(q?.teach).toBeTruthy();
    expect(q?.claimId).toBe('clinic-headache-ichd3-pifp-criteria');
  });

  it('config invariant (W1 premise guard): loc-trigeminal-distribution is contributed ONLY by tn-distribution', () => {
    // W1/W8's safety rests on nothing outside the TN screen contributing the TN
    // territory chip. A persona walk alone would not survive future option edits;
    // this does.
    const contributors: string[] = [];
    const allQuestions = [...CORE_QUESTIONS, ...CONDITIONAL_BRANCHES.map((b) => b.question)];
    for (const q of allQuestions) for (const o of q.options) {
      if (o.chips.includes('loc-trigeminal-distribution')) contributors.push(o.id);
    }
    expect(contributors).toEqual(['tn-distribution']);
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

  it('drift guard (W5): q-location stays an anatomically disjoint partition by keyword ownership', () => {
    // "jaw" legitimately appears in BOTH loc-face (cheek/jaw surface, §13.1) and
    // loc-throat-ear (ANGLE of the jaw, §13.2.1 Note 1), so the guard asserts
    // ownership of the unambiguous anchors instead: loc-face owns cheek and
    // upper lip; loc-throat-ear owns throat, tongue, tonsil and ear. Word
    // boundaries matter: /ear/ without them matches "area" and "near".
    const q = CORE_QUESTIONS.find((x) => x.id === 'q-location')!;
    const label = (id: string) => q.options.find((o) => o.id === id)!.label;
    const face = label('loc-face');
    const throat = label('loc-throat-ear');
    expect(face).toMatch(/cheek/i);
    expect(face).toMatch(/upper lip/i);
    for (const kw of [/\bthroat\b/i, /\btongue\b/i, /\btonsil\b/i, /\bear\b/i]) {
      expect(face).not.toMatch(kw);
      expect(throat).toMatch(kw);
    }
    expect(throat).not.toMatch(/cheek/i);
    expect(throat).not.toMatch(/upper lip/i);
    // Chip pairing: every territory answer also contributes loc-unilateral.
    for (const id of ['loc-orbital', 'loc-face', 'loc-throat-ear']) {
      expect(q.options.find((o) => o.id === id)!.chips).toContain('loc-unilateral');
    }
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
      // Added 2026-09-08 (facial-pain expansion, walks W1/W8 and W3 above).
      'glossopharyngeal-neuralgia', 'persistent-idiopathic-facial-pain',
    ]);
    const UNWALKED_DEBT = new Set([
      'chronic-tth', 'chronic-migraine', 'status-migrainosus', 'hemicrania-continua',
      'paroxysmal-hemicrania', 'sunct-suna', 'ndph', 'primary-stabbing-headache',
    ]);
    const all = HEADACHE_PHENOTYPES.map((p) => p.id);
    expect(all).toHaveLength(18);
    for (const id of all) {
      expect(WALKED.has(id) || UNWALKED_DEBT.has(id), `phenotype "${id}" is neither walked nor tracked as debt`).toBe(true);
    }
    for (const id of [...WALKED, ...UNWALKED_DEBT]) {
      expect(all, `"${id}" is listed in this guard but no longer exists in the engine`).toContain(id);
      expect(WALKED.has(id) && UNWALKED_DEBT.has(id), `"${id}" cannot be both walked and debt`).toBe(false);
    }
  });
});
