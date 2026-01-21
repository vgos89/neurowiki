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

export default function Gbs() {
  return (
    <ArticleLayout
      category="Neuromuscular"
      categoryPath="/guide"
      title="Guillain–Barré Syndrome"
      subtitle="Diagnosis, variants, and when to treat"
      leadText={
        <>
          <Term detail="acute inflammatory demyelinating polyneuropathy — often post-infectious">Guillain–Barré syndrome (GBS)</Term> is an acute, ascending, areflexic weakness. Respiratory and autonomic failure are the main threats.
        </>
      }
      relatedLinks={[
        { title: 'Myasthenia Gravis', href: '/guide/myasthenia-gravis' },
        { title: 'Weakness Workup', href: '/guide/weakness-workup' },
      ]}
    >
      {(viewMode) => (
        <>
          <Section number={1} title="Presentation" />

          <Paragraph
            viewMode={viewMode}
            detail="Progressive, usually ascending, symmetric weakness. Hypo/areflexia. Paresthesias. Preceding URI or GI infection 1–4 weeks. Campylobacter, CMV, EBV, Zika. Miller Fisher: ataxia, areflexia, ophthalmoplegia."
          >
            Ascending, symmetric weakness; <Term detail="reduced or absent reflexes">areflexia</Term>. Paresthesias. Preceding infection 1–4 weeks (e.g. <Term detail="Campylobacter jejuni">Campylobacter</Term>, CMV). <Term detail="ataxia, areflexia, ophthalmoplegia">Miller Fisher</Term> variant.
          </Paragraph>

          <Section number={2} title="Diagnosis" />

          <Paragraph
            viewMode={viewMode}
            detail="CSF: albuminocytologic dissociation — high protein, normal WBC. Can be normal early. NCS/EMG: demyelinating (AIDP) or axonal (AMAN, AMSAN) patterns. LP and EMG support; diagnosis can be clinical in classic cases."
          >
            CSF: <Term detail="elevated protein, normal WBC">albuminocytologic dissociation</Term>. NCS: demyelinating or axonal. LP and EMG support; diagnosis often clinical when classic.
          </Paragraph>

          <Section number={3} title="Respiratory and Autonomic" />

          <Paragraph
            viewMode={viewMode}
            detail="FVC, NIF (MIP) q4–6h. Intubate when FVC &lt;20 ml/kg or dropping fast, or NIF &gt;−30 (less negative). Watch for autonomic: labile BP, arrhythmia, ileus, retention."
          >
            <Critical>FVC and NIF (MIP)</Critical> q4–6h. Intubate when FVC <Value>&lt;20 ml/kg</Value> or NIF &gt;<Value>−30</Value> (or rapid fall). Autonomic: labile BP, arrhythmia, ileus, retention.
          </Paragraph>

          <Section number={4} title="Treatment" />

          <Paragraph
            viewMode={viewMode}
            detail="IVIG 0.4 g/kg/day × 5 days. Or plasma exchange 5 exchanges over ~2 weeks. Equally effective. Start within 2–4 weeks of onset. IVIG often preferred (ease, vascular access)."
          >
            <strong>IVIG</strong> <Value>0.4 g/kg/day × 5 days</Value> or <strong>plasmapheresis</strong> (5 exchanges). Start within 2–4 weeks. Equally effective; IVIG often logistically easier.
          </Paragraph>

          <Paragraph viewMode={viewMode} detail="Steroids alone are not effective in GBS. Don't use as primary therapy.">
            Steroids are <Critical>not</Critical> first-line. No proven benefit as primary treatment.
          </Paragraph>

          <Warning>
            Admit for monitoring. Weakness can progress over days. Respiratory and autonomic failure can develop quickly.
          </Warning>
        </>
      )}
    </ArticleLayout>
  );
}
