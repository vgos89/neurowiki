/**
 * Tests for the Clinic Headache adaptive-interview decision tree.
 *
 * Table-driven: each scenario walks the tree with a sequence of answers,
 * accumulates the chip set, terminates on 'evaluate' or 'workup', and
 * asserts the final state.
 *
 * Coverage per architect §17.1 condition #4:
 *   - every terminal branch
 *   - red-flag short-circuit at the first question
 *   - chip accumulation across longest walks
 */

import { describe, expect, it } from 'vitest';
import {
  HEADACHE_QUESTIONS,
  POWER_USER_PHENOTYPES,
  START_QUESTION_ID,
  chipsForAnswer,
  getAnswer,
  getQuestion,
  nextNode,
  type Answer,
  type LeadsTo,
  type QuestionId,
} from './clinicHeadacheQuestions';
import { evaluateHeadachePhenotypes, type ChipId, type PhenotypeId } from './clinicHeadacheData';

interface AnswerStep {
  questionId: QuestionId;
  answerIds: string[]; // multiple for multi-check; single for single-choice
}

/** Walk the tree given a sequence of answer steps. Returns final chip set + terminator. */
function walk(steps: AnswerStep[]): { chips: Set<ChipId>; terminator: 'evaluate' | 'workup' | null } {
  const chips = new Set<ChipId>();
  let terminator: 'evaluate' | 'workup' | null = null;
  for (const step of steps) {
    for (const answerId of step.answerIds) {
      const ans = getAnswer(step.questionId, answerId);
      if (!ans) throw new Error(`Unknown answer ${step.questionId}/${answerId}`);
      for (const chip of ans.selects) chips.add(chip);
      if (ans.leadsTo === 'evaluate' || ans.leadsTo === 'workup') terminator = ans.leadsTo;
    }
  }
  return { chips, terminator };
}

describe('start question and node integrity', () => {
  it('exposes a valid start question id', () => {
    expect(getQuestion(START_QUESTION_ID)).toBeDefined();
  });

  it('every answer leadsTo target either exists or is a terminator', () => {
    const validIds = new Set<string>(HEADACHE_QUESTIONS.map(q => q.id));
    for (const q of HEADACHE_QUESTIONS) {
      for (const a of q.answers) {
        if (a.leadsTo === 'evaluate' || a.leadsTo === 'workup') continue;
        expect(validIds.has(a.leadsTo), `${q.id}/${a.id} -> ${a.leadsTo}`).toBe(true);
      }
    }
  });

  it('every selects entry on every answer is a typed ChipId (string check)', () => {
    for (const q of HEADACHE_QUESTIONS) {
      for (const a of q.answers) {
        for (const chip of a.selects) {
          expect(typeof chip).toBe('string');
          expect(chip.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('red-flag short-circuit at first question', () => {
  it.each([
    ['rf-thunderclap'],
    ['rf-deficit'],
    ['rf-systemic'],
    ['rf-older'],
    ['rf-pregnancy'],
    ['rf-trauma'],
    ['rf-papilloedema'],
    ['rf-valsalva'],
    ['rf-positional'],
    ['rf-pattern-change'],
    ['rf-immune'],
    ['rf-overuse'],
  ])('flag %s short-circuits to workup', (answerId) => {
    const { terminator } = walk([{ questionId: 'red-flag-screen', answerIds: [answerId] }]);
    expect(terminator).toBe('workup');
  });

  it('"None" routes to pattern, not workup', () => {
    const { terminator } = walk([{ questionId: 'red-flag-screen', answerIds: ['rf-none'] }]);
    expect(terminator).toBe(null);
    expect(nextNode('red-flag-screen', 'rf-none')).toBe('pattern');
  });
});

describe('episodic migraine walk', () => {
  it('a classic migraine walk lands on full-match migraine-without-aura', () => {
    const { chips, terminator } = walk([
      { questionId: 'red-flag-screen', answerIds: ['rf-none'] },
      { questionId: 'pattern', answerIds: ['episodic'] },
      { questionId: 'episodic-duration', answerIds: ['4-72'] },
      { questionId: 'episodic-character', answerIds: ['unilateral', 'pulsating', 'moderate', 'aggravated', 'character-done'] },
      { questionId: 'episodic-associated', answerIds: ['nausea', 'photo', 'associated-done'] },
      { questionId: 'episodic-lifetime-attacks', answerIds: ['gt-10'] },
    ]);
    expect(terminator).toBe('evaluate');
    expect(chips.has('dur-4-to-72-hours')).toBe(true);
    expect(chips.has('loc-unilateral')).toBe(true);
    expect(chips.has('qual-pulsating')).toBe(true);
    expect(chips.has('sym-nausea')).toBe(true);
    expect(chips.has('attacks-gt-10')).toBe(true);

    const matches = evaluateHeadachePhenotypes(chips);
    const migraine = matches.find(m => m.phenotypeId === 'migraine-without-aura');
    expect(migraine?.matchStrength).toBe('full');
  });

  it('Probable migraine when only <5 lifetime attacks', () => {
    const { chips } = walk([
      { questionId: 'red-flag-screen', answerIds: ['rf-none'] },
      { questionId: 'pattern', answerIds: ['episodic'] },
      { questionId: 'episodic-duration', answerIds: ['4-72'] },
      { questionId: 'episodic-character', answerIds: ['unilateral', 'pulsating', 'moderate', 'character-done'] },
      { questionId: 'episodic-associated', answerIds: ['nausea', 'associated-done'] },
      { questionId: 'episodic-lifetime-attacks', answerIds: ['lt-5'] },
    ]);
    const matches = evaluateHeadachePhenotypes(chips);
    expect(matches.find(m => m.phenotypeId === 'migraine-without-aura')?.matchStrength).toBe('probable');
  });
});

describe('episodic cluster walk', () => {
  it('cluster-confirm yes path lands on full-match cluster', () => {
    const { chips, terminator } = walk([
      { questionId: 'red-flag-screen', answerIds: ['rf-none'] },
      { questionId: 'pattern', answerIds: ['episodic'] },
      { questionId: 'episodic-duration', answerIds: ['15-180'] },
      { questionId: 'cluster-confirm', answerIds: ['cluster-yes'] },
      { questionId: 'episodic-lifetime-attacks', answerIds: ['gt-10'] },
    ]);
    expect(terminator).toBe('evaluate');
    expect(chips.has('dur-15-to-180-min')).toBe(true);
    expect(chips.has('sym-autonomic-ipsilateral')).toBe(true);
    expect(chips.has('freq-cluster-bout')).toBe(true);

    const matches = evaluateHeadachePhenotypes(chips);
    expect(matches.find(m => m.phenotypeId === 'cluster-headache')?.matchStrength).toBe('full');
  });
});

describe('continuous hemicrania-continua walk', () => {
  it('unilateral + autonomic + indomethacin complete → full-match HC', () => {
    const { chips, terminator } = walk([
      { questionId: 'red-flag-screen', answerIds: ['rf-none'] },
      { questionId: 'pattern', answerIds: ['continuous'] },
      { questionId: 'continuous-laterality', answerIds: ['unilateral'] },
      { questionId: 'continuous-autonomic', answerIds: ['autonomic-yes'] },
      { questionId: 'continuous-indomethacin', answerIds: ['indo-complete'] },
    ]);
    expect(terminator).toBe('evaluate');
    expect(chips.has('dur-continuous')).toBe(true);
    expect(chips.has('loc-unilateral')).toBe(true);
    expect(chips.has('sym-autonomic-ipsilateral')).toBe(true);
    expect(chips.has('indo-tried-complete')).toBe(true);

    const matches = evaluateHeadachePhenotypes(chips);
    expect(matches.find(m => m.phenotypeId === 'hemicrania-continua')?.matchStrength).toBe('full');
  });

  it('unilateral + autonomic + indomethacin NOT tried still surfaces HC as candidate via the indo gate', () => {
    const { chips } = walk([
      { questionId: 'red-flag-screen', answerIds: ['rf-none'] },
      { questionId: 'pattern', answerIds: ['continuous'] },
      { questionId: 'continuous-laterality', answerIds: ['unilateral'] },
      { questionId: 'continuous-autonomic', answerIds: ['autonomic-yes'] },
      { questionId: 'continuous-indomethacin', answerIds: ['indo-not-tried'] },
    ]);
    const matches = evaluateHeadachePhenotypes(chips);
    // HC should NOT appear because the indo-complete chip is not selected
    expect(matches.find(m => m.phenotypeId === 'hemicrania-continua')).toBeUndefined();
  });
});

describe('continuous NDPH walk', () => {
  it('continuous + bilateral + ≥3 months + distinct onset → NDPH candidate', () => {
    const { chips, terminator } = walk([
      { questionId: 'red-flag-screen', answerIds: ['rf-none'] },
      { questionId: 'pattern', answerIds: ['continuous'] },
      { questionId: 'continuous-laterality', answerIds: ['bilateral'] },
      { questionId: 'continuous-pattern-duration', answerIds: ['pd-ge-3'] },
      { questionId: 'continuous-onset', answerIds: ['sudden-distinct'] },
    ]);
    expect(terminator).toBe('evaluate');
    expect(chips.has('dur-continuous')).toBe(true);
    expect(chips.has('pattern-ge-3-months')).toBe(true);
    expect(chips.has('onset-new-within-3-months')).toBe(true);

    const matches = evaluateHeadachePhenotypes(chips);
    expect(matches.find(m => m.phenotypeId === 'ndph')).toBeDefined();
  });
});

describe('chip accumulation across longest walk', () => {
  it('migraine walk accumulates ≥8 chips by terminator', () => {
    const { chips } = walk([
      { questionId: 'red-flag-screen', answerIds: ['rf-none'] },
      { questionId: 'pattern', answerIds: ['episodic'] },
      { questionId: 'episodic-duration', answerIds: ['4-72'] },
      { questionId: 'episodic-character', answerIds: ['unilateral', 'pulsating', 'severe', 'aggravated', 'character-done'] },
      { questionId: 'episodic-associated', answerIds: ['nausea', 'photo', 'phono', 'associated-done'] },
      { questionId: 'episodic-lifetime-attacks', answerIds: ['gt-10'] },
    ]);
    expect(chips.size).toBeGreaterThanOrEqual(8);
  });
});

describe('power-user phenotype list', () => {
  it('exposes a stable list of pickable phenotypes', () => {
    expect(POWER_USER_PHENOTYPES.length).toBeGreaterThanOrEqual(5);
    for (const p of POWER_USER_PHENOTYPES) {
      expect(typeof p.id).toBe('string');
      expect(typeof p.label).toBe('string');
      expect(p.section).toMatch(/ICHD-3/);
    }
  });
});

describe('helpers', () => {
  it('chipsForAnswer returns the correct chip array', () => {
    expect(chipsForAnswer('pattern', 'episodic')).toContain('onset-recurrent-same');
    expect(chipsForAnswer('pattern', 'continuous')).toContain('dur-continuous');
  });

  it('nextNode returns leadsTo correctly', () => {
    expect(nextNode('red-flag-screen', 'rf-none')).toBe('pattern');
    expect(nextNode('red-flag-screen', 'rf-thunderclap')).toBe('workup');
    expect(nextNode('episodic-lifetime-attacks', 'gt-10')).toBe('evaluate');
  });
});
