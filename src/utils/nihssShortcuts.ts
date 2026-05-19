
export type NihssValue = number;

export interface NihssItemDef {
  id: string;
  name: string;
  shortName: string;
  rapidOptions: { value: number; label: string; color?: string }[];
  plainOptions: { value: number; label: string }[];
  detailedInfo: string;
  pearl: string;
  plainEnglish: string;
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
    plainOptions: [
      { value: 0, label: '0: Awake and alert' },
      { value: 1, label: '1: Sleepy but wakes up easily' },
      { value: 2, label: '2: Hard to wake, needs strong stimulation' },
      { value: 3, label: '3: No real response, may only posture' }
    ],
    detailedInfo: '• 0: Keenly responsive.\n• 1: Drowsy/Somnolent but arouses to minor stimulation.\n• 2: Obtunded; requires strong/painful stimulation to move.\n• 3: Reflex posturing only or totally unresponsive.',
    pearl: 'If patient has a tube, score 1a based on arousal. 3 is reserved for essentially no response (posturing or worse).',
    plainEnglish: "**Testing how awake the patient is**\n\n**How to test:**\n• Start with voice, then gentle shoulder tap\n• Escalate to painful stimulus if needed (don't be shy)\n• Vigorous stimulation is acceptable\n\n**Key point:** Score 3 only if NO purposeful movement - just reflex posturing or complete unresponsiveness."
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
    plainOptions: [
      { value: 0, label: '0: Got both right' },
      { value: 1, label: '1: Got one right' },
      { value: 2, label: '2: Got neither right' }
    ],
    detailedInfo: '• 0: Both questions answered correctly.\n• 1: One question answered correctly.\n• 2: Neither question answered correctly.\n• Ask: Current Month and Age.\n• Must be exact (no partial credit).\n• Aphasic/Stuporous = 2.\n• Intubated/Trauma/Language Barrier = 1.',
    pearl: 'If aphasic, score 2. If intubated/dysarthric/barrier, score 1. Do not coach.',
    plainEnglish: "**Can they answer basic orientation questions?**\n\n**How to test:**\n• Ask \"What month is it?\" and \"How old are you?\"\n• Must be EXACTLY correct - no partial credit\n• Don't give hints with facial expressions or tone\n\n**Watch out:**\n• Birthday ≠ Age (common mistake patients make)\n• Non-English speaker: Get translator or have them write/point to calendar\n• Intubated/trauma/barrier = score 1\n• Aphasic/stuporous = score 2"
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
    plainOptions: [
      { value: 0, label: '0: Did both correctly' },
      { value: 1, label: '1: Did one correctly' },
      { value: 2, label: '2: Did neither correctly' }
    ],
    detailedInfo: '• 0: Both commands performed correctly.\n• 1: One command performed correctly.\n• 2: Neither command performed correctly.\n• Ask: Open/Close eyes & Grip/Release hand.\n• Pantomime is allowed if communication barrier exists.\n• Credit given if attempt is unequivocal but weak.',
    pearl: 'Pantomime is allowed! If they mimic you, they get credit. Focus is on comprehension.',
    plainEnglish: "**Can they follow simple commands?**\n\n**How to test:**\n• Ask \"Close your eyes\" then \"Open your eyes\"\n• Ask \"Make a fist\" or \"Squeeze my hand\"\n• Pantomime is allowed! If they copy you, they get credit\n\n**Key points:**\n• Only need fist on ONE side (let them pick which hand)\n• Weak attempt that's clearly trying = give credit\n• Can substitute commands if hands unusable\n• Focus is on comprehension, not strength"
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
    plainOptions: [
      { value: 0, label: '0: Eyes move normally' },
      { value: 1, label: '1: Eyes drift but can cross midline' },
      { value: 2, label: '2: Eyes stuck to one side' }
    ],
    detailedInfo: '• 0: Normal.\n• 1: Partial gaze palsy OR overcomes deviation with Oculocephalic maneuver.\n• 2: Forced deviation (cannot overcome) OR total gaze paresis.',
    pearl: 'Test oculocephalic reflex (Doll\'s eyes) if unconscious. Forced deviation = 2.',
    plainEnglish: "**Can their eyes move side-to-side together?**\n\n**How to test:**\n• Make sure face is midline first\n• Hold their head still (no turning allowed)\n• Move your finger or face side to side\n• For confused/aphasic: establish eye contact, walk around bed, see if they track you\n\n**Pro trick:** Use a dollar bill - snap it side to side to get attention\n\n**If unconscious:** Test oculocephalic reflex (\"doll's eyes\")"
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
    plainOptions: [
      { value: 0, label: '0: Sees in all directions' },
      { value: 1, label: '1: Misses one quadrant' },
      { value: 2, label: '2: Misses a whole half' },
      { value: 3, label: '3: Blind on both sides' }
    ],
    detailedInfo: '• 0: No visual loss.\n• 1: Partial hemianopia (e.g., quadrantanopia) or extinction.\n• 2: Complete homonymous hemianopia.\n• 3: Bilateral blindness (cortical blindness).',
    pearl: 'In neglect/extinction, score 1 (parietal extinction) if they extinguish on double simultaneous stimulation but have fields intact.',
    plainEnglish: "**Can they see in all four visual quadrants?**\n\n**How to test:**\n• Cover one eye at a time\n• Count fingers if possible (\"How many fingers?\")\n• Use finger wiggling for confused/aphasic patients or those without glasses\n• Test from periphery moving inward in all 4 quadrants\n\n**Key point:** If extinction (ignore one side when both tested), score 1 - this also counts for item 11 (neglect)"
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
    plainOptions: [
      { value: 0, label: '0: Face moves evenly' },
      { value: 1, label: '1: Subtle droop or flat smile line' },
      { value: 2, label: '2: Lower face droops' },
      { value: 3, label: '3: Entire half of face paralyzed' }
    ],
    detailedInfo: '• 0: Normal symmetry.\n• 1: Minor (flattened nasolabial fold, subtle asymmetry).\n• 2: Partial (paralysis of lower face).\n• 3: Complete (paralysis of upper AND lower face).',
    pearl: 'Upper face sparing usually suggests central (stroke) vs peripheral (Bell\'s), but NIHSS captures severity regardless of etiology.',
    plainEnglish: "**Is their face symmetric when they smile?**\n\n**How to test:**\n• Ask: \"Show me your teeth\" or \"Give me a big smile\"\n• Ask: \"Raise your eyebrows\"\n• Ask: \"Close your eyes tight\"\n• Count teeth and wrinkles on each side if subtle\n\n**For unresponsive patients:** Look for grimace with painful stimulation\n\n**Watch out:** Mild upper + mild lower weakness = score 2 (not 1)"
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
    plainOptions: [
      { value: 0, label: '0: Holds arm up the full 10 seconds' },
      { value: 1, label: '1: Drifts down but does not hit bed' },
      { value: 2, label: '2: Falls to bed, some effort against gravity' },
      { value: 3, label: '3: Cannot lift, only moves along the bed' },
      { value: 4, label: '4: No movement at all' }
    ],
    detailedInfo: 'Hold 10 seconds.\n• 0: Holds 10s.\n• 1: Drifts before 10s but does not hit bed.\n• 2: Falls to bed before 10s (some effort).\n• 3: No effort against gravity (shrugs/movements on bed).\n• 4: No movement.',
    pearl: 'Must hold for full 10 seconds. Count out loud.',
    plainEnglish: "**Can they hold arm up for 10 seconds?**\n\n**How to test:**\n• YOU can help lift arm to position (90° sitting, 45° lying)\n• Test is holding, not lifting\n• Count out loud with fingers: \"10...9...8...7...\"\n\n**If arm falls immediately:**\n• Ask to wiggle fingers or shrug shoulder\n• Helps distinguish score 3 (some movement) vs 4 (no movement)\n\n**Key point:** Score what you see - pain/arthritis doesn't get \"extra credit\""
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
    plainOptions: [
      { value: 0, label: '0: Holds arm up the full 10 seconds' },
      { value: 1, label: '1: Drifts down but does not hit bed' },
      { value: 2, label: '2: Falls to bed, some effort against gravity' },
      { value: 3, label: '3: Cannot lift, only moves along the bed' },
      { value: 4, label: '4: No movement at all' }
    ],
    detailedInfo: 'Hold 10 seconds.\n• 0: Holds 10s.\n• 1: Drifts before 10s but does not hit bed.\n• 2: Falls to bed before 10s (some effort).\n• 3: No effort against gravity (shrugs/movements on bed).\n• 4: No movement.',
    pearl: '',
    plainEnglish: "**Can they hold arm up for 10 seconds?**\n\n**How to test:**\n• YOU can help lift arm to position (90° sitting, 45° lying)\n• Test is holding, not lifting\n• Count out loud with fingers: \"10...9...8...7...\"\n\n**If arm falls immediately:**\n• Ask to wiggle fingers or shrug shoulder\n• Helps distinguish score 3 (some movement) vs 4 (no movement)\n\n**Key point:** Score what you see - pain/arthritis doesn't get \"extra credit\""
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
    plainOptions: [
      { value: 0, label: '0: Holds leg up the full 5 seconds' },
      { value: 1, label: '1: Drifts down but does not hit bed' },
      { value: 2, label: '2: Falls to bed, some effort against gravity' },
      { value: 3, label: '3: Cannot lift, only moves along the bed' },
      { value: 4, label: '4: No movement at all' }
    ],
    detailedInfo: 'Hold 5 seconds.\n• 0: Holds 5s.\n• 1: Drifts before 5s but does not hit bed.\n• 2: Falls to bed before 5s.\n• 3: No effort against gravity.\n• 4: No movement.',
    pearl: 'Leg hold is only 5 seconds.',
    plainEnglish: "**Can they hold leg up for 5 seconds?**\n\n**How to test:**\n• Position: 30° from bed if lying (straight out if sitting)\n• Count out loud: \"5...4...3...2...1\"\n• Only 5 seconds (not 10 like arms!)\n\n**If leg falls immediately:**\n• Ask to wiggle toes\n• Helps distinguish score 3 vs 4"
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
    plainOptions: [
      { value: 0, label: '0: Holds leg up the full 5 seconds' },
      { value: 1, label: '1: Drifts down but does not hit bed' },
      { value: 2, label: '2: Falls to bed, some effort against gravity' },
      { value: 3, label: '3: Cannot lift, only moves along the bed' },
      { value: 4, label: '4: No movement at all' }
    ],
    detailedInfo: 'Hold 5 seconds.\n• 0: Holds 5s.\n• 1: Drifts before 5s but does not hit bed.\n• 2: Falls to bed before 5s.\n• 3: No effort against gravity.\n• 4: No movement.',
    pearl: '',
    plainEnglish: "**Can they hold leg up for 5 seconds?**\n\n**How to test:**\n• Position: 30° from bed if lying (straight out if sitting)\n• Count out loud: \"5...4...3...2...1\"\n• Only 5 seconds (not 10 like arms!)\n\n**If leg falls immediately:**\n• Ask to wiggle toes\n• Helps distinguish score 3 vs 4"
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
    plainOptions: [
      { value: 0, label: '0: Movements look smooth' },
      { value: 1, label: '1: Clumsy in one limb' },
      { value: 2, label: '2: Clumsy in two or more limbs' }
    ],
    detailedInfo: '• 0: Absent.\n• 1: Present in one limb.\n• 2: Present in two or more limbs.\n• Finger-nose-finger and Heel-shin.\n• Score ONLY if present out of proportion to weakness.\n• Score 0 if paralyzed or cannot understand.',
    pearl: 'If paralyzed (Motor=4) or unable to understand, score 0. It must be out of proportion to weakness.',
    plainEnglish: "**Are movements clumsy/uncoordinated beyond weakness?**\n\n**How to test:**\n• Arms: Finger-to-nose test\n• Legs: Heel-to-shin test\n\n**Key rules:**\n• ONLY score if out of proportion to weakness\n• If paralyzed (Motor=4) → automatically score 0\n• If can't understand → automatically score 0\n\n**Remember:** Ataxia usually bilateral (posterior circulation), weakness usually unilateral (anterior circulation)"
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
    plainOptions: [
      { value: 0, label: '0: Feels pinprick the same on both sides' },
      { value: 1, label: '1: Pinprick feels duller on one side' },
      { value: 2, label: '2: No feeling on one side, or both sides numb' }
    ],
    detailedInfo: '• 0: Normal.\n• 1: Mild/Moderate (feels less sharp/dull, but aware of touch).\n• 2: Severe/Total (not aware of touch or bilateral loss).',
    pearl: 'Test proximal and distal. Aphasic patients can usually demonstrate withdrawal or grimace.',
    plainEnglish: "**Can they feel pinprick equally on both sides?**\n\n**How to test:**\n• Test face, upper arms, upper legs (NOT hands/feet - avoids neuropathy confusion)\n• Can keep eyes open and tell them which side\n• Use safety pin or neuro-tip\n\n**For aphasic/obtunded patients:** Watch for grimace or withdrawal to stimulus\n\n**Keep it simple:** Normal=0, Any difference=1, Severe loss in arm+leg=2\n\n**Key point:** This is NEVER untestable"
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
    plainOptions: [
      { value: 0, label: '0: Speaks and understands normally' },
      { value: 1, label: '1: Words come out, but some are wrong or missing' },
      { value: 2, label: '2: Only bits of speech, you have to guess' },
      { value: 3, label: '3: No speech, no understanding' }
    ],
    detailedInfo: '• 0: Normal.\n• 1: Mild-Mod Aphasia (loss of fluency/comprehension but ideas conveyed).\n• 2: Severe Aphasia (fragmentary expression, inference needed).\n• 3: Mute/Global (no usable speech/comprehension).',
    pearl: 'Show the picture card, naming sheet, and sentences. Intubated patients cannot be scored 0 unless they can write fluently.',
    plainEnglish: "**Can they understand and express ideas?**\n\n**How to test:**\n• Show picture card (describe what's happening)\n• Name objects (pen, watch, etc.)\n• Read sentences out loud\n• Tests BOTH comprehension AND expression\n\n**Special cases:**\n• No glasses: Have them name objects placed in hand\n• Intubated: Can they write full sentences?\n• Cultural variations okay (\"cactus\" = \"plant\" is fine)\n• Comatose (1a=3) automatically gets 3 here"
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
    plainOptions: [
      { value: 0, label: '0: Speech sounds clear' },
      { value: 1, label: '1: Slurred but you can still understand' },
      { value: 2, label: '2: Too slurred to understand, or cannot speak' },
      { value: 9, label: 'UN: Cannot test (intubated or barrier)' }
    ],
    detailedInfo: '• 0: Normal.\n• 1: Mild-Mod (slurring but understandable).\n• 2: Severe (unintelligible or mute/anarthric).\n• UN: Intubated or physical barrier.',
    pearl: 'If intubated, select UN (score is typically calculated as 0 for total, but noted as Untestable).',
    plainEnglish: "**Is their speech slurred or unclear?**\n\n**How to test:**\n• Have them read tongue-twister words (\"Mama\", \"Tip-top\", etc.)\n• Testing motor function of speech (clarity), not content\n• Don't tell them why you're testing\n\n**Key points:**\n• If dentures normally worn, put them in first\n• For aphasic patients: Listen to ANY words they say for slurring\n• Intubated = UN (untestable)\n\n**Watch out:** Southern accent ≠ dysarthria (use standardized words)"
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
    plainOptions: [
      { value: 0, label: '0: Notices both sides equally' },
      { value: 1, label: '1: Ignores one side when both are tested at once' },
      { value: 2, label: '2: Ignores one side completely, even their own arm' }
    ],
    detailedInfo: '• 0: No abnormality.\n• 1: Visual, tactile, OR spatial inattention (extinction to double simultaneous stimulation).\n• 2: Profound hemi-inattention (does not recognize own hand or orients to only one side).',
    pearl: 'Visual extinction counts as 1. Complete neglect (ignoring left side of room/body) is 2.',
    plainEnglish: "**Do they ignore one side?**\n\n**How to test:**\n• Touch both sides at once (eyes closed) - do they feel both?\n• Show fingers moving on both sides - do they see both?\n• For aphasic: Have them point to which side(s) being touched/moving\n\n**Key scoring:**\n• If they TRY to turn head to attend to neglected side = normal (0)\n• Extinction on double simultaneous testing = 1\n• Profound neglect (ignores entire side of space/body) = 2\n\n**This is NEVER untestable**"
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

export const calculateLvoProbability = (scores: Record<string, number>): { 
  probability: number; 
  label: string; 
  raceScore: number;
  breakdown: {
    facial: number;
    arm: number;
    leg: number;
    gaze: number;
    aphasia: number;
    agnosia: number;
  }
} => {
  // RACE Scale calculation (0-9 points)
  // Based on: Pérez de la Ossa N et al. Stroke. 2014.
  
  // 1. Facial Palsy (0-2 points) - NIHSS item 4
  const facialNihss = scores['4'] || 0;
  let facial = 0;
  if (facialNihss === 0) facial = 0;      // Absent
  else if (facialNihss === 1) facial = 1; // Mild
  else facial = 2;                        // Moderate-Severe (NIHSS 2-3)
  
  // 2. Arm Motor (0-2 points) - NIHSS 5a/5b, take worse side
  const armLeft = scores['5a'] || 0;
  const armRight = scores['5b'] || 0;
  const armNihss = Math.max(armLeft, armRight);
  let arm = 0;
  if (armNihss <= 1) arm = 0;             // Normal to mild (NIHSS 0-1)
  else if (armNihss === 2) arm = 1;       // Moderate (NIHSS 2)
  else arm = 2;                           // Severe (NIHSS 3-4)
  
  // 3. Leg Motor (0-2 points) - NIHSS 6a/6b, take worse side
  const legLeft = scores['6a'] || 0;
  const legRight = scores['6b'] || 0;
  const legNihss = Math.max(legLeft, legRight);
  let leg = 0;
  if (legNihss <= 1) leg = 0;             // Normal to mild (NIHSS 0-1)
  else if (legNihss === 2) leg = 1;       // Moderate (NIHSS 2)
  else leg = 2;                           // Severe (NIHSS 3-4)
  
  // 4. Head & Gaze Deviation (0-2 points) - NIHSS item 2
  const gazeNihss = scores['2'] || 0;
  let gaze = 0;
  if (gazeNihss === 0) gaze = 0;          // Absent
  else gaze = 1;                          // Present (NIHSS 1-2)
  
  // 5. Aphasia (0-2 points) - NIHSS item 9
  const aphasiaNihss = scores['9'] || 0;
  let aphasia = 0;
  if (aphasiaNihss === 0) aphasia = 0;    // Normal
  else if (aphasiaNihss === 1) aphasia = 1; // Moderate
  else aphasia = 2;                       // Severe (NIHSS 2-3)
  
  // 6. Agnosia/Neglect (0-1 points) - NIHSS item 11
  const agnosiaNihss = scores['11'] || 0;
  const agnosia = agnosiaNihss >= 1 ? 1 : 0; // Present if NIHSS 1-2
  
  // Calculate total RACE score (0-9)
  const raceScore = facial + arm + leg + gaze + aphasia + agnosia;
  
  // Determine LVO probability based on RACE score
  let probability = 0;
  let label = 'Low';
  
  if (raceScore >= 7) {
    // RACE 7-9: High probability
    probability = 85;
    label = 'High';
  } else if (raceScore >= 5) {
    // RACE 5-6: Moderate probability
    probability = 55;
    label = 'Moderate';
  } else {
    // RACE 0-4: Low probability
    probability = 20;
    label = 'Low';
  }
  
  return { 
    probability, 
    label, 
    raceScore,
    breakdown: {
      facial,
      arm,
      leg,
      gaze,
      aphasia,
      agnosia
    }
  };
};
