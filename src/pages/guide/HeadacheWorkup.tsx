import React from 'react';
import {
  ArticleLayout,
  Section,
  SubSection,
  Paragraph,
  Term,
  Critical,
  Value,
  Warning,
} from '../../components/article';

export default function HeadacheWorkup() {
  return (
    <ArticleLayout
      category="General Neurology"
      categoryPath="/guide"
      title="Headache Workup"
      subtitle="Red flags, when to image, and when to tap"
      leadText={
        <>
          Most headaches are primary (migraine, tension, cluster). Red flags: sudden worst-ever, thunderclap, fever, focal deficit, <Term detail="papilledema, vision loss">papilledema</Term>, or immunosuppression. Work up before symptomatic treatment.
        </>
      }
      relatedLinks={[
        { title: 'Migraine Pathway', href: '/calculators/migraine-pathway' },
        { title: 'Meningitis', href: '/guide/meningitis' },
      ]}
    >
      {(viewMode) => (
        <>
          <Section number={1} title="Red Flags" />

          <Paragraph
            viewMode={viewMode}
            detail="Thunderclap = SAH until proven otherwise. Worst headache of life, sudden onset. Fever + headache = meningitis. Focal deficit, AMS, papilledema, immunosuppression, cancer, age &gt;50 with new headache."
          >
            <Critical>Thunderclap</Critical> — SAH until ruled out. Worst-ever, sudden. Fever. Focal deficit, AMS, papilledema. Immunosuppression, cancer. New headache <Value>&gt;50</Value> y.
          </Paragraph>

          <Section number={2} title="Imaging" />

          <Paragraph
            viewMode={viewMode}
            detail="Thunderclap: NCCT first (sensitive for SAH in first 6–12 h). If negative and high suspicion, LP for xanthochromia. CT plus CTA if dissecting aneurysm possible. Mass, hemorrhage, hydro: CT or MRI."
          >
            Thunderclap: NCCT (SAH). LP if CT negative and high suspicion. CTA if dissection/aneurysm. Mass, hemorrhage: CT or MRI.
          </Paragraph>

          <Section number={3} title="LP" />

          <Paragraph
            viewMode={viewMode}
            detail="Opening pressure. Cell count, protein, glucose, culture, Gram stain. Xanthochromia for SAH if CT negative. Consider HSV, cryptococcal Ag, VDRL, cytology if indicated."
          >
            OP, cells, protein, glucose, culture. Xanthochromia if SAH suspected and CT negative. HSV PCR, cryptococcal Ag, etc. as needed.
          </Paragraph>

          <Warning>
            Do not treat with triptans or opioid-only until SAH, meningitis, mass, and other dangerous causes are considered or ruled out.
          </Warning>
        </>
      )}
    </ArticleLayout>
  );
}
