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

export default function MultipleSclerosis() {
  return (
    <ArticleLayout
      category="Neuroimmunology"
      categoryPath="/guide"
      title="Multiple Sclerosis"
      subtitle="Diagnosis, relapse treatment, and DMTs"
      leadText={
        <>
          <Term detail="CNS demyelinating disease — relapses and progression">Multiple sclerosis (MS)</Term> is diagnosed by dissemination in space and time. Relapses are treated with high-dose steroids; <Term detail="disease-modifying therapy">DMTs</Term> reduce relapses and disability.
        </>
      }
      relatedLinks={[
        { title: 'Weakness Workup', href: '/guide/weakness-workup' },
        { title: 'Meningitis', href: '/guide/meningitis' },
      ]}
    >
      {(viewMode) => (
        <>
          <Section number={1} title="Diagnosis" />

          <Paragraph
            viewMode={viewMode}
            detail="2017 McDonald: dissemination in space (≥1 lesion in ≥2 typical areas) and time (new lesion on follow-up or simultaneous enhancing and non-enhancing). MRI, CSF (OCBs), and clinical. Rule out mimics: NMO, ADEM, sarcoid, Lyme, etc."
          >
            <Term detail="lesions in ≥2 CNS regions">Dissemination in space</Term> and <Term detail="new lesion over time or enhancing + non-enhancing">time</Term> (McDonald 2017). MRI, CSF (OCBs). Exclude NMO, ADEM, sarcoid, infection.
          </Paragraph>

          <Section number={2} title="MS Relapse" />

          <SubSection title="Definition" />

          <Paragraph
            viewMode={viewMode}
            detail="New or worsened neurologic deficit, typical of demyelination, lasting &gt;24 h, in absence of fever or infection. Pseudo-relapse: worsening from heat, infection, stress — not a true relapse."
          >
            New or worse deficit, demyelinating pattern, <Value>&gt;24 h</Value>, no fever/infection. <Term detail="worsening from heat, infection, stress — not new inflammation">Pseudo-relapse</Term>: do not treat with steroids.
          </Paragraph>

          <SubSection title="Treatment" />

          <Paragraph
            viewMode={viewMode}
            detail="Methylprednisolone 500–1000 mg IV × 3–5 days. Or oral prednisone at equivalent dose. Speeds recovery; does not change long-term disability. Use for disabling relapses. Mild (sensory only, no function impact): often observe."
          >
            <strong>High-dose steroids:</strong> Methylprednisolone <Value>500–1000 mg IV × 3–5 days</Value>. Speeds recovery; minimal effect on long-term disability. Use for disabling relapses. Mild, non-disabling: often observe.
          </Paragraph>

          <Paragraph viewMode={viewMode} detail="If steroids fail or very severe: PLEX. 5–7 exchanges. Consider for TM, severe optic neuritis, or steroid-resistant relapse.">
            Steroid failure or very severe: <Term detail="plasma exchange">PLEX</Term> (5–7 exchanges). Consider for transverse myelitis, severe optic neuritis.
          </Paragraph>

          <Section number={3} title="Disease-Modifying Therapy" />

          <Paragraph viewMode={viewMode} detail="Start DMT early in RRMS. Options: injectables (interferon, glatiramer), orals (fingolimod, dimethyl fumarate, teriflunomide, etc.), infusions (ocrelizumab, natalizumab, etc.). Choice by efficacy, risk, pregnancy plans.">
            DMT reduces relapses and disability. Start early in <Term detail="relapsing-remitting MS">RRMS</Term>. Choice by efficacy, safety, pregnancy. Injectables, orals, infusions — discuss with patient and neuro.
          </Paragraph>
        </>
      )}
    </ArticleLayout>
  );
}
