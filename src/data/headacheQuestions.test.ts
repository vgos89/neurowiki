import { describe, it, expect } from 'vitest';
import {
  CORE_QUESTIONS,
  CONDITIONAL_BRANCHES,
  allQuestionChips,
  getActiveQuestions,
  type HeadacheQuestion,
} from './headacheQuestions';
import { getChip, evaluateHeadachePhenotypes, type ChipId } from './clinicHeadacheData';

// Walk the config and resolve a list of (questionId, optionId) picks into the
// engine `selected` set. Proves the config's answer→chip mappings end-to-end,
// rather than hand-picking chips.
function chipsFor(picks: Array<[string, string]>): Set<ChipId> {
  const all: HeadacheQuestion[] = [...CORE_QUESTIONS, ...CONDITIONAL_BRANCHES.map(b => b.question)];
  const out = new Set<ChipId>();
  for (const [qid, oid] of picks) {
    const q = all.find(x => x.id === qid);
    if (!q) throw new Error(`no question ${qid}`);
    const o = q.options.find(x => x.id === oid);
    if (!o) throw new Error(`no option ${oid} on ${qid}`);
    o.chips.forEach(c => out.add(c));
  }
  return out;
}

describe('headacheQuestions — drift guard (every mapped chip resolves in the engine)', () => {
  it('every chip referenced by any answer option resolves via getChip()', () => {
    const chips = allQuestionChips();
    expect(chips.length).toBeGreaterThan(0);
    const unresolved = chips.filter(c => getChip(c) === undefined);
    expect(unresolved).toEqual([]);
  });

  it('getChip returns the same id it was asked for (no silent remap)', () => {
    for (const c of allQuestionChips()) {
      expect(getChip(c)?.id).toBe(c);
    }
  });

  it('no answer option carries an empty chip list', () => {
    const all = [...CORE_QUESTIONS, ...CONDITIONAL_BRANCHES.map(b => b.question)];
    for (const q of all) {
      for (const o of q.options) {
        expect(o.chips.length, `${q.id}/${o.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('every question and option id is unique within the config', () => {
    const all = [...CORE_QUESTIONS, ...CONDITIONAL_BRANCHES.map(b => b.question)];
    const qids = all.map(q => q.id);
    expect(new Set(qids).size).toBe(qids.length);
    for (const q of all) {
      const oids = q.options.map(o => o.id);
      expect(new Set(oids).size, `dupe option id in ${q.id}`).toBe(oids.length);
    }
  });
});

describe('headacheQuestions — [PAIR] many-to-one preservation (clinical gate Q4)', () => {
  it('"around one eye" contributes BOTH loc-unilateral and loc-orbital-temporal', () => {
    const chips = chipsFor([['q-location', 'loc-orbital']]);
    expect(chips.has('loc-unilateral')).toBe(true);
    expect(chips.has('loc-orbital-temporal')).toBe(true);
  });

  it('attack-count ≥5 options fold in attacks-ge-2 (migraine-with-aura floor, gate Q1)', () => {
    expect(chipsFor([['q-attack-count', 'c-5-10']]).has('attacks-ge-2')).toBe(true);
    expect(chipsFor([['q-attack-count', 'c-gt10']]).has('attacks-ge-2')).toBe(true);
    // "fewer than 5" must NOT assert ≥2
    expect(chipsFor([['q-attack-count', 'c-lt5']]).has('attacks-ge-2')).toBe(false);
  });
});

describe('headacheQuestions — branch fires only on its substrate (clinical gate Q2)', () => {
  const branch = (id: string) => {
    const b = CONDITIONAL_BRANCHES.find(x => x.id === id);
    if (!b) throw new Error(`no branch ${id}`);
    return b;
  };

  it('TAC short-attack detail fires on short + unilateral + autonomic, not otherwise', () => {
    const b = branch('b-tac-detail');
    expect(b.fires(new Set<ChipId>(['dur-lt-15-min', 'loc-unilateral', 'sym-autonomic-ipsilateral']))).toBe(true);
    expect(b.fires(new Set<ChipId>(['dur-lt-15-min', 'loc-unilateral', 'sym-restlessness']))).toBe(true);
    // missing the autonomic/restless substrate → no fire
    expect(b.fires(new Set<ChipId>(['dur-lt-15-min', 'loc-unilateral']))).toBe(false);
    // missing unilateral → no fire
    expect(b.fires(new Set<ChipId>(['dur-lt-15-min', 'sym-autonomic-ipsilateral']))).toBe(false);
  });

  it('indomethacin trial fires on continuous-or-short unilateral autonomic pain', () => {
    const b = branch('b-indomethacin');
    expect(b.fires(new Set<ChipId>(['loc-unilateral', 'sym-restlessness', 'dur-continuous']))).toBe(true);
    expect(b.fires(new Set<ChipId>(['loc-unilateral', 'sym-autonomic-ipsilateral', 'dur-lt-15-min']))).toBe(true);
    expect(b.fires(new Set<ChipId>(['loc-bilateral', 'sym-autonomic-ipsilateral', 'dur-continuous']))).toBe(false);
  });

  it('aura fires when migraine is in contention (pulsating OR migraine assoc features)', () => {
    const b = branch('b-aura');
    expect(b.fires(new Set<ChipId>(['qual-pulsating']))).toBe(true);
    expect(b.fires(new Set<ChipId>(['sym-photophobia']))).toBe(true);
    expect(b.fires(new Set<ChipId>(['sym-nausea-moderate-severe']))).toBe(true);
    // pure tension-type substrate does not summon the aura branch
    expect(b.fires(new Set<ChipId>(['qual-pressing-tightening', 'loc-bilateral']))).toBe(false);
  });

  it('chronic-migraine detail fires at ≥15 days/month WITH migraine features only', () => {
    const b = branch('b-chronic-migraine');
    expect(b.fires(new Set<ChipId>(['freq-ge-15-per-month', 'qual-pulsating']))).toBe(true);
    // frequency alone is not enough (could be chronic TTH)
    expect(b.fires(new Set<ChipId>(['freq-ge-15-per-month']))).toBe(false);
    expect(b.fires(new Set<ChipId>(['freq-ge-15-per-month', 'qual-pressing-tightening']))).toBe(false);
  });

  it('vestibular detail fires when vertigo is reported with the headache', () => {
    const b = branch('b-vestibular');
    expect(b.fires(new Set<ChipId>(['vest-vertigo-migrainous']))).toBe(true);
    expect(b.fires(new Set<ChipId>(['sym-photophobia']))).toBe(false);
  });
});

describe('headacheQuestions — getActiveQuestions composition', () => {
  it('empty selection shows exactly the core spine, no branches', () => {
    const active = getActiveQuestions(new Set<ChipId>());
    expect(active.map(q => q.id)).toEqual(CORE_QUESTIONS.map(q => q.id));
  });

  it('vertigo selection appends the vestibular branch after the core spine', () => {
    const active = getActiveQuestions(new Set<ChipId>(['vest-vertigo-migrainous']));
    expect(active.length).toBe(CORE_QUESTIONS.length + 1);
    expect(active[active.length - 1].id).toBe('q-vestibular');
  });

  it('the core spine covers exactly 6 progress screens', () => {
    const screens = new Set(CORE_QUESTIONS.map(q => q.screen));
    expect([...screens].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('headacheQuestions — engine reachability (clinical gate Q1: spine drives a full match)', () => {
  it('a textbook migraine-without-aura answer set reaches matchStrength "full"', () => {
    // Q1 condition: with the attack-count select folded into the spine, the
    // question flow alone supplies enough substrate for ICHD-3 §1.1 A–D.
    const selected = chipsFor([
      ['q-onset', 'recurrent'],          // onset-recurrent-same
      ['q-frequency', 'f-1-4'],          // freq-1-4-per-month
      ['q-duration', 'd-4-72h'],         // dur-4-to-72-hours  (criterion B)
      ['q-attack-count', 'c-gt10'],      // attacks-gt-10      (criterion A: ≥5)
      ['q-quality', 'qual-throb'],       // qual-pulsating     (criterion C)
      ['q-location', 'loc-one'],         // loc-unilateral     (criterion C)
      ['q-severity', 'sev-mod'],         // sev-moderate       (criterion C)
      ['q-activity', 'act-worse'],       // act-aggravated     (criterion C)
      ['q-associated', 'as-nausea-modsev'], // sym-nausea-moderate-severe (criterion D)
    ]);
    const matches = evaluateHeadachePhenotypes(selected);
    const mig = matches.find(m => m.phenotypeId === 'migraine-without-aura');
    expect(mig?.matchStrength).toBe('full');
  });

  it('an episodic tension-type answer set reaches matchStrength "full"', () => {
    const selected = chipsFor([
      ['q-onset', 'recurrent'],
      ['q-frequency', 'f-1-4'],          // freq-1-4-per-month   (criterion A)
      ['q-duration', 'd-30min-7d'],      // dur-30min-to-7days   (criterion B)
      ['q-attack-count', 'c-gt10'],      // attacks-gt-10        (criterion A)
      ['q-chronicity', 'ch-ge3'],        // pattern-ge-3-months  (criterion A)
      ['q-quality', 'qual-press'],       // qual-pressing-tightening (criterion C)
      ['q-location', 'loc-both'],        // loc-bilateral        (criterion C)
      ['q-severity', 'sev-mild'],        // sev-mild             (criterion C)
      ['q-activity', 'act-none'],        // act-not-aggravated   (criterion C)
      // criterion D satisfied by absence: no nausea/vomiting, no photo/phono
    ]);
    const matches = evaluateHeadachePhenotypes(selected);
    const tth = matches.find(m => m.phenotypeId === 'episodic-tth');
    expect(tth?.matchStrength).toBe('full');
  });
});
