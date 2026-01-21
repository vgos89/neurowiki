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

export default function MyastheniaGravis() {
  return (
    <ArticleLayout
      category="Neuromuscular"
      categoryPath="/guide"
      title="Myasthenia Gravis"
      subtitle="Diagnosis, exacerbations, and myasthenic crisis"
      leadText={
        <>
          <Term detail="autoimmune disorder — antibodies to AChR or MuSK at the NMJ">Myasthenia gravis (MG)</Term> causes fatigable weakness (eyes, bulbar, limbs). <Term detail="severe exacerbation with respiratory failure">Myasthenic crisis</Term> requires ICU and often plasma exchange or IVIG.
        </>
      }
      relatedLinks={[
        { title: 'GBS', href: '/guide/gbs' },
        { title: 'Weakness Workup', href: '/guide/weakness-workup' },
      ]}
    >
      {(viewMode) => (
        <>
          <Section number={1} title="Presentation" />

          <Paragraph
            viewMode={viewMode}
            detail="Fatigable ptosis, diplopia, dysarthria, dysphagia, limb weakness. Worse with use, better with rest. Can be generalized or ocular. Thymoma in ~10–15%."
          >
            Fatigable ptosis, diplopia, dysarthria, dysphagia, proximal limbs. Worse with activity. Ocular or generalized. Thymoma in ~10–15%.
          </Paragraph>

          <Section number={2} title="Diagnosis" />

          <Paragraph viewMode={viewMode} detail="AChR binding Ab: ~85% sensitive. MuSK Ab: many of the rest. Ice pack on ptotic eyelid can improve (cooling). Edrophonium: rarely used now. EMG: decrement on RNS, increased jitter on SFEMG.">
            <Term detail="acetylcholine receptor">AChR</Term> antibodies (~85%). <Term detail="muscle-specific kinase">MuSK</Term> in some seronegative. Ice test, EMG (RNS decrement, SFEMG jitter) support.
          </Paragraph>

          <Section number={3} title="Myasthenic Crisis" />

          <SubSection title="Definition and Triggers" />

          <Paragraph
            viewMode={viewMode}
            detail="Respiratory failure or severe bulbar weakness requiring intubation or NIV. Triggers: infection, surgery, drugs (aminoglycosides, macrolides, Mg, beta-blockers, botulinum), poor compliance, rapid steroid taper."
          >
            Respiratory or severe bulbar failure. Triggers: infection, surgery, drugs (e.g. aminoglycosides, Mg, beta-blockers), steroid taper, noncompliance.
          </Paragraph>

          <SubSection title="Management" />

          <Paragraph
            viewMode={viewMode}
            detail="ICU. FVC, NIF q2–4h. Intubate when FVC &lt;20 or NIF &gt;−30 or rapid decline. Hold cholinesterase inhibitors when intubated (secretions). PLEX or IVIG — PLEX often faster. Treat infection. Avoid precipitant drugs."
          >
            ICU. FVC, NIF q2–4h. Intubate when FVC <Value>&lt;20 ml/kg</Value> or NIF &gt;<Value>−30</Value>. Hold <Term detail="pyridostigmine">Mestinon</Term> when intubated. <Critical>Plasma exchange (PLEX)</Critical> or <strong>IVIG</strong> — PLEX often works faster. Treat infection. Avoid precipitant drugs.
          </Paragraph>

          <Warning>
            Do not use magnesium, aminoglycosides, or fluoroquinolones in known MG. They can worsen weakness and precipitate crisis.
          </Warning>

          <Section number={4} title="Chronic Treatment" />

          <Paragraph viewMode={viewMode} detail="Pyridostigmine for symptoms. Immunosuppression: prednisone, azathioprine, mycophenolate, etc. Thymectomy for thymoma; consider in AChR+ generalized. IVIG or PLEX for exacerbations.">
            Pyridostigmine. Immunosuppression (steroids, azathioprine, etc.). Thymectomy for thymoma; consider in AChR+ generalized. IVIG or PLEX for exacerbations.
          </Paragraph>
        </>
      )}
    </ArticleLayout>
  );
}
