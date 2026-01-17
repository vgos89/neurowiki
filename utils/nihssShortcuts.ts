
export type NihssValue = number;

export interface NihssItemDef {
  id: string;
  name: string;
  shortName: string;
  rapidOptions: { value: number; label: string; color?: string }[];
  detailedInfo: string;
  pearl: string;
}

export const NIHSS_ITEMS: NihssItemDef[] = [
  {
    id: '1a',
    name: '1a. Level of Consciousness',
    shortName: 'LOC',
    rapidOptions: [
      { value: 0, label: '0: Alert' },
      { value: 1, label: '1: Drowsy' },
      { value: 2, label: '2: Stupor' },
      { value: 3, label: '3: Coma' }
    ],
    detailedInfo: '• 0: Keenly responsive.\n• 1: Drowsy/Somnolent but arouses to minor stimulation.\n• 2: Obtunded; requires strong/painful stimulation to move.\n• 3: Reflex posturing only or totally unresponsive.',
    pearl: 'If patient has a tube, score 1a based on arousal. 3 is reserved for essentially no response (posturing or worse).'
  },
  {
    id: '1b',
    name: '1b. LOC Questions',
    shortName: 'Questions',
    rapidOptions: [
      { value: 0, label: '0: Both Correct' },
      { value: 1, label: '1: One Correct' },
      { value: 2, label: '2: None Correct' }
    ],
    detailedInfo: '• Ask: Current Month and Age.\n• Must be exact (no partial credit).\n• Aphasic/Stuporous = 2.\n• Intubated/Trauma/Language Barrier = 1.',
    pearl: 'If aphasic, score 2. If intubated/dysarthric/barrier, score 1. Do not coach.'
  },
  {
    id: '1c',
    name: '1c. LOC Commands',
    shortName: 'Commands',
    rapidOptions: [
      { value: 0, label: '0: Both Correct' },
      { value: 1, label: '1: One Correct' },
      { value: 2, label: '2: None Correct' }
    ],
    detailedInfo: '• Ask: Open/Close eyes & Grip/Release hand.\n• Pantomime is allowed if communication barrier exists.\n• Credit given if attempt is unequivocal but weak.',
    pearl: 'Pantomime is allowed! If they mimic you, they get credit. Focus is on comprehension.'
  },
  {
    id: '2',
    name: '2. Best Gaze',
    shortName: 'Gaze',
    rapidOptions: [
      { value: 0, label: '0: Normal' },
      { value: 1, label: '1: Partial Palsy' },
      { value: 2, label: '2: Forced Dev' }
    ],
    detailedInfo: '• 0: Normal.\n• 1: Partial gaze palsy OR overcomes deviation with Oculocephalic maneuver.\n• 2: Forced deviation (cannot overcome) OR total gaze paresis.',
    pearl: 'Test oculocephalic reflex (Doll\'s eyes) if unconscious. Forced deviation = 2.'
  },
  {
    id: '3',
    name: '3. Visual Fields',
    shortName: 'Visual',
    rapidOptions: [
      { value: 0, label: '0: No Loss' },
      { value: 1, label: '1: Partial' },
      { value: 2, label: '2: Complete' },
      { value: 3, label: '3: Bilateral' }
    ],
    detailedInfo: '• 0: No visual loss.\n• 1: Partial hemianopia (e.g., quadrantanopia) or extinction.\n• 2: Complete homonymous hemianopia.\n• 3: Bilateral blindness (cortical blindness).',
    pearl: 'In neglect/extinction, score 1 (parietal extinction) if they extinguish on double simultaneous stimulation but have fields intact.'
  },
  {
    id: '4',
    name: '4. Facial Palsy',
    shortName: 'Face',
    rapidOptions: [
      { value: 0, label: '0: Normal' },
      { value: 1, label: '1: Minor' },
      { value: 2, label: '2: Partial' },
      { value: 3, label: '3: Complete' }
    ],
    detailedInfo: '• 0: Normal symmetry.\n• 1: Minor (flattened nasolabial fold, subtle asymmetry).\n• 2: Partial (paralysis of lower face).\n• 3: Complete (paralysis of upper AND lower face).',
    pearl: 'Upper face sparing usually suggests central (stroke) vs peripheral (Bell\'s), but NIHSS captures severity regardless of etiology.'
  },
  {
    id: '5a',
    name: '5a. Motor Left Arm',
    shortName: 'L Arm',
    rapidOptions: [
      { value: 0, label: '0: No Drift' },
      { value: 1, label: '1: Drift' },
      { value: 2, label: '2: Can\'t Hold' },
      { value: 3, label: '3: No Gravity' },
      { value: 4, label: '4: No Move' }
    ],
    detailedInfo: 'Hold 10 seconds.\n• 0: Holds 10s.\n• 1: Drifts before 10s but does not hit bed.\n• 2: Falls to bed before 10s (some effort).\n• 3: No effort against gravity (shrugs/movements on bed).\n• 4: No movement.',
    pearl: 'Must hold for full 10 seconds. Count out loud.'
  },
  {
    id: '5b',
    name: '5b. Motor Right Arm',
    shortName: 'R Arm',
    rapidOptions: [
      { value: 0, label: '0: No Drift' },
      { value: 1, label: '1: Drift' },
      { value: 2, label: '2: Can\'t Hold' },
      { value: 3, label: '3: No Gravity' },
      { value: 4, label: '4: No Move' }
    ],
    detailedInfo: 'Hold 10 seconds. Same scoring as Left Arm.',
    pearl: ''
  },
  {
    id: '6a',
    name: '6a. Motor Left Leg',
    shortName: 'L Leg',
    rapidOptions: [
      { value: 0, label: '0: No Drift' },
      { value: 1, label: '1: Drift' },
      { value: 2, label: '2: Can\'t Hold' },
      { value: 3, label: '3: No Gravity' },
      { value: 4, label: '4: No Move' }
    ],
    detailedInfo: 'Hold 5 seconds.\n• 0: Holds 5s.\n• 1: Drifts before 5s but does not hit bed.\n• 2: Falls to bed before 5s.\n• 3: No effort against gravity.\n• 4: No movement.',
    pearl: 'Leg hold is only 5 seconds.'
  },
  {
    id: '6b',
    name: '6b. Motor Right Leg',
    shortName: 'R Leg',
    rapidOptions: [
      { value: 0, label: '0: No Drift' },
      { value: 1, label: '1: Drift' },
      { value: 2, label: '2: Can\'t Hold' },
      { value: 3, label: '3: No Gravity' },
      { value: 4, label: '4: No Move' }
    ],
    detailedInfo: 'Hold 5 seconds. Same scoring as Left Leg.',
    pearl: ''
  },
  {
    id: '7',
    name: '7. Limb Ataxia',
    shortName: 'Ataxia',
    rapidOptions: [
      { value: 0, label: '0: Absent' },
      { value: 1, label: '1: Present (1 limb)' },
      { value: 2, label: '2: Present (2+)' }
    ],
    detailedInfo: '• Finger-nose-finger and Heel-shin.\n• Score ONLY if present out of proportion to weakness.\n• Score 0 if paralyzed or cannot understand.',
    pearl: 'If paralyzed (Motor=4) or unable to understand, score 0. It must be out of proportion to weakness.'
  },
  {
    id: '8',
    name: '8. Sensory',
    shortName: 'Sensory',
    rapidOptions: [
      { value: 0, label: '0: Normal' },
      { value: 1, label: '1: Mild Loss' },
      { value: 2, label: '2: Severe Loss' }
    ],
    detailedInfo: '• 0: Normal.\n• 1: Mild/Moderate (feels less sharp/dull, but aware of touch).\n• 2: Severe/Total (not aware of touch or bilateral loss).',
    pearl: 'Test proximal and distal. Aphasic patients can usually demonstrate withdrawal or grimace.'
  },
  {
    id: '9',
    name: '9. Best Language',
    shortName: 'Language',
    rapidOptions: [
      { value: 0, label: '0: Normal' },
      { value: 1, label: '1: Mild-Mod' },
      { value: 2, label: '2: Severe' },
      { value: 3, label: '3: Mute/Global' }
    ],
    detailedInfo: '• 0: Normal.\n• 1: Mild-Mod Aphasia (loss of fluency/comprehension but ideas conveyed).\n• 2: Severe Aphasia (fragmentary expression, inference needed).\n• 3: Mute/Global (no usable speech/comprehension).',
    pearl: 'Show the picture card, naming sheet, and sentences. Intubated patients cannot be scored 0 unless they can write fluently.'
  },
  {
    id: '10',
    name: '10. Dysarthria',
    shortName: 'Dysarthria',
    rapidOptions: [
      { value: 0, label: '0: Normal' },
      { value: 1, label: '1: Mild-Mod' },
      { value: 2, label: '2: Severe' },
      { value: 9, label: 'UN: Intubated' } // Using 9 internally for UN
    ],
    detailedInfo: '• 0: Normal.\n• 1: Mild-Mod (slurring but understandable).\n• 2: Severe (unintelligible or mute/anarthric).\n• UN: Intubated or physical barrier.',
    pearl: 'If intubated, select UN (score is typically calculated as 0 for total, but noted as Untestable).'
  },
  {
    id: '11',
    name: '11. Extinction/Inattention',
    shortName: 'Neglect',
    rapidOptions: [
      { value: 0, label: '0: None' },
      { value: 1, label: '1: Partial' },
      { value: 2, label: '2: Complete' }
    ],
    detailedInfo: '• 0: No abnormality.\n• 1: Visual, tactile, OR spatial inattention (extinction to double simultaneous stimulation).\n• 2: Profound hemi-inattention (does not recognize own hand or orients to only one side).',
    pearl: 'Visual extinction counts as 1. Complete neglect (ignoring left side of room/body) is 2.'
  }
];

export const getItemWarning = (itemId: string, score: number, allScores: Record<string, number>): string | null => {
  // Aphasia checks
  if (itemId === '9' && score >= 2) {
    if ((allScores['1c'] || 0) === 0) {
      return "Alert: You selected Severe Aphasia, but 'Commands' (1c) is scored as Normal. Usually severe aphasia impairs command following.";
    }
  }

  // Motor vs Ataxia
  if (itemId === '7' && score > 0) {
    // Check if any limb is 4 (paralyzed)
    const isParalyzed = 
      (allScores['5a'] === 4) || (allScores['5b'] === 4) || 
      (allScores['6a'] === 4) || (allScores['6b'] === 4);
    
    if (isParalyzed) {
      return "Alert: Ataxia cannot be scored (must be 0) in a fully paralyzed limb (Motor=4).";
    }
  }

  // Dysarthria checks
  if (itemId === '10' && score === 2) {
    if ((allScores['9'] || 0) === 0 && (allScores['4'] || 0) === 0) {
      return "Alert: Severe/Anarthric dysarthria is uncommon without Facial Palsy (4) or Aphasia (9). Verify patient isn't aphasic.";
    }
  }

  return null;
};

export const calculateTotal = (scores: Record<string, number>) => {
  let total = 0;
  Object.values(scores).forEach(v => {
    if (v !== 9) total += v; // 9 is UN
  });
  return total;
};
