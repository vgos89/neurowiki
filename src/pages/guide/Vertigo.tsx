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

export default function Vertigo() {
  return (
    <ArticleLayout
      category="General Neurology"
      categoryPath="/guide"
      title="Vertigo"
      subtitle="Peripheral vs central — HINTS and when to image"
      leadText={
        <>
          <Term detail="illusion of motion — often spinning">Vertigo</Term> is peripheral (labyrinth, vestibular nerve) or central (brainstem, cerebellum). Acute, persistent vertigo with nausea and nystagmus: rule out stroke with HINTS.
        </>
      }
      relatedLinks={[
        { title: 'Headache Workup', href: '/guide/headache-workup' },
        { title: 'Weakness Workup', href: '/guide/weakness-workup' },
      ]}
    >
      {(viewMode) => (
        <>
          <Section number={1} title="Peripheral vs Central" />

          <Paragraph
            viewMode={viewMode}
            detail="Peripheral: vestibular neuritis, BPPV, Meniere's. Central: stroke (AICA, PICA), demyelination, tumor. Central: any one of HINTS-plus positive, or vertical/torsional nystagmus that doesn't suppress with fixation, or skew, or new hearing loss plus vascular risk."
          >
            <strong>Peripheral:</strong> vestibular neuritis, <Term detail="benign paroxysmal positional vertigo">BPPV</Term>, Meniere's. <strong>Central:</strong> stroke (AICA/PICA), MS, mass. <Term detail="head impulse, nystagmus, test of skew">HINTS</Term> helps distinguish.
          </Paragraph>

          <Section number={2} title="HINTS" />

          <Paragraph
            viewMode={viewMode}
            detail="Head Impulse: normal (corrective saccade) = peripheral; abnormal (no saccade) = central. Nystagmus: direction-changing in eccentric gaze or vertical = central. Skew (vertical misalignment): central. Plus: acute hearing loss + vascular risk = stroke. One central finding = image."
          >
            <strong>Head impulse</strong> normal → peripheral; abnormal → central. <strong>Nystagmus</strong> direction-changing or vertical → central. <strong>Skew</strong> → central. <strong>Plus:</strong> hearing loss + vascular risk → stroke. One central finding: <Critical>image</Critical>.
          </Paragraph>

          <Section number={3} title="Imaging and Workup" />

          <Paragraph viewMode={viewMode} detail="MRI with DWI for posterior fossa stroke; CT misses most. Audiometry if hearing loss. Dix-Hallpike for BPPV. VDRL, TSH if indicated.">
            MRI brain with DWI for stroke; CT insufficient. Audiometry if hearing loss. Dix-Hallpike for BPPV.
          </Paragraph>

          <Section number={4} title="BPPV" />

          <Paragraph viewMode={viewMode} detail="Positional, seconds. Dix-Hallpike: posterior canal. Epley for posterior canal BPPV. Horizontal canal: roll maneuver.">
            <Term detail="benign paroxysmal positional vertigo">BPPV</Term>: brief, positional. Dix-Hallpike; Epley for posterior canal. Horizontal: roll.
          </Paragraph>
        </>
      )}
    </ArticleLayout>
  );
}
