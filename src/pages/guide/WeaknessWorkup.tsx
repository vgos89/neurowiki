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

export default function WeaknessWorkup() {
  return (
    <ArticleLayout
      category="General Neurology"
      categoryPath="/guide"
      title="Weakness Workup"
      subtitle="Localizing and working up acute and subacute weakness"
      leadText={
        <>
          Weakness: upper motor neuron (CNS: cortex, subcortex, cord) vs lower motor neuron (root, plexus, nerve, NMJ, muscle). Pattern and tempo narrow the cause.
        </>
      }
      relatedLinks={[
        { title: 'GBS', href: '/guide/gbs' },
        { title: 'Myasthenia Gravis', href: '/guide/myasthenia-gravis' },
        { title: 'Stroke Basics', href: '/guide/stroke-basics' },
      ]}
    >
      {(viewMode) => (
        <>
          <Section number={1} title="Localization" />

          <Paragraph
            viewMode={viewMode}
            detail="UMN: hyperreflexia, spasticity, upgoing toes, pattern by vascular or cord level. LMN: hyporeflexia, atrophy, fasciculations. Distal symmetric: polyneuropathy. Ascending: GBS. Proximal: myopathy, MG. Fatigable: MG. Bulbar: MG, ALS, brainstem."
          >
            <Term detail="cortex, cord — hyperreflexia, spasticity">UMN</Term> vs <Term detail="root, nerve, NMJ, muscle — hyporeflexia, atrophy">LMN</Term>. Pattern: hemibody (stroke), level (cord), distal symmetric (polyneuropathy), ascending (GBS), proximal (myopathy, MG), fatigable (MG).
          </Paragraph>

          <Section number={2} title="Acute Weakness" />

          <Paragraph
            viewMode={viewMode}
            detail="Stroke: sudden, vascular territory. Cord: back pain, level, sensory. GBS: ascending, areflexia. Myasthenic crisis: known MG, bulbar/respiratory. Tick paralysis, botulism, diphtheria: rare. Imaging (CT/MRI), LP, EMG, AchR/MuSK, Edrophonium as indicated."
          >
            Sudden: stroke, cord. Ascending + areflexia: <Term detail="Guillain–Barré">GBS</Term>. Known MG + worsening: crisis. Image (brain, spine), LP, EMG, MG antibodies, tox as needed.
          </Paragraph>

          <Section number={3} title="Subacute and Chronic" />

          <Paragraph
            viewMode={viewMode}
            detail="ALS: UMN+LMN, bulbar, respiratory. Myopathy: CK, EMG, possibly biopsy. Polyneuropathy: diabetes, EtOH, B12, paraprotein, toxins. MG: fatigable, AChR/MuSK, RNS."
          >
            ALS: UMN and LMN. Myopathy: CK, EMG. Polyneuropathy: glucose, B12, SPEP, EtOH, tox. MG: AChR, MuSK, RNS.
          </Paragraph>
        </>
      )}
    </ArticleLayout>
  );
}
