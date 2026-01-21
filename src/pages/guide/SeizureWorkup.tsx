import React from 'react';
import {
  ArticleLayout,
  Section,
  SubSection,
  Paragraph,
  Term,
  Critical,
  Value,
} from '../../components/article';

export default function SeizureWorkup() {
  return (
    <ArticleLayout
      category="Epilepsy"
      categoryPath="/guide"
      title="Seizure Workup"
      subtitle="First seizure and new-onset seizure — labs, imaging, EEG"
      leadText={
        <>
          First seizure: rule out provokeers (metabolic, toxin, infection, mass). If unprovoked, work up for <Term detail="epilepsy — ≥2 unprovoked seizures or 1 plus high recurrence risk">epilepsy</Term> and decide on driving and treatment.
        </>
      }
      relatedLinks={[
        { title: 'Status Epilepticus', href: '/guide/status-epilepticus' },
        { title: 'Status Pathway', href: '/calculators/se-pathway' },
      ]}
    >
      {(viewMode) => (
        <>
          <Section number={1} title="Acute: Rule Out Provoked" />

          <Paragraph
            viewMode={viewMode}
            detail="Glucose, lytes (Na, Ca, Mg, Phos), creatinine, LFTs. AED levels if on therapy. Tox screen, EtOH. LP if febrile, immunocompromised, or no clear cause. CT head if focal, persistent AMS, or trauma."
          >
            Labs: glucose, lytes, renal, LFTs, AED levels, tox, EtOH. LP if febrile or immunocompromised. CT if focal deficit, AMS, or trauma.
          </Paragraph>

          <Section number={2} title="Imaging" />

          <Paragraph
            viewMode={viewMode}
            detail="CT for acute ( hemorrhage, mass, big stroke). MRI brain for etiology: T2/FLAIR, DWI, susceptibility. Look for mesial temporal sclerosis, focal cortical dysplasia, cavernoma, tumor."
          >
            <strong>CT</strong> acute. <strong>MRI brain</strong> for etiology (T2/FLAIR, DWI, SWI). Mesial temporal sclerosis, focal dysplasia, cavernoma, tumor.
          </Paragraph>

          <Section number={3} title="EEG" />

          <Paragraph
            viewMode={viewMode}
            detail="Routine EEG: spikes, sharp waves, slowing. Normal does not rule out epilepsy. Sleep-deprived or long-term increases yield. Ambulatory or LTM if spells are frequent."
          >
            Routine EEG: epileptiform discharges, focal slowing. Normal EEG common in epilepsy. Sleep-deprived or prolonged if needed.
          </Paragraph>

          <Section number={4} title="After First Unprovoked Seizure" />

          <Paragraph
            viewMode={viewMode}
            detail="Recurrence ~40% at 2 years. Higher if abnormal EEG, imaging lesion, or nocturnal. Discuss driving laws. Many start AED after first if high risk or if a second would be devastating; others wait for recurrence."
          >
            Recurrence ~40% at 2 y. Higher if abnormal EEG, lesion, or nocturnal. <Critical>Driving</Critical> — counsel. AED after first vs after second: shared decision (risk, job, laws).
          </Paragraph>
        </>
      )}
    </ArticleLayout>
  );
}
