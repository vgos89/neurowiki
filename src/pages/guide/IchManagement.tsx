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

export default function IchManagement() {
  return (
    <ArticleLayout
      category="Vascular Neurology"
      categoryPath="/guide"
      title="ICH Management"
      subtitle="Acute intracerebral hemorrhage — BP, reversal, and ICU care"
      leadText={
        <>
          <Term detail="intracerebral hemorrhage — parenchymal bleed">ICH</Term> mortality is high in the first 48 h. Goals: stop expansion, reverse anticoagulation, control BP, and prevent herniation.
        </>
      }
      relatedLinks={[
        { title: 'ICH Score', href: '/calculators?id=ich' },
        { title: 'Anticoagulation Reversal', href: '/guide/anticoagulation-reversal' },
        { title: 'Stroke Basics', href: '/guide/stroke-basics' },
      ]}
    >
      {(viewMode) => (
        <>
          <Section number={1} title="Immediate Assessment" />

          <Paragraph
            viewMode={viewMode}
            detail="ABCs. GCS, pupil check. NIHSS or similar. Get last known well. On anticoagulants? Which one, last dose."
          >
            Stabilize ABCs. Baseline exam (GCS, pupils, focal deficits). <Critical>Anticoagulant history</Critical> — agent and last dose.
          </Paragraph>

          <Section number={2} title="Imaging" />

          <Paragraph viewMode={viewMode} detail="NCCT for location, size, IVH, midline shift. Volume = ABC/2 or planimetry. CTA if concern for vascular cause (young, lobar, no HTN).">
            <strong>NCCT head</strong>: location, volume (<Term detail="length×width×height/2 in cm">ABC/2</Term>), <Term detail="intraventricular hemorrhage">IVH</Term>, midline shift. CTA if vascular etiology possible (young, lobar, no HTN).
          </Paragraph>

          <Section number={3} title="Anticoagulation Reversal" />

          <Paragraph viewMode={viewMode} detail="Warfarin: 4-factor PCC + IV vitamin K. Dabigatran: idarucizumab. Xa inhibitors: andexanet. DOAC within 48h without assay: consider andexanet for apixaban/rivaroxaban; idarucizumab for dabigatran.">
            <strong>Warfarin:</strong> 4-factor <Term detail="prothrombin complex concentrate">PCC</Term> + IV vitamin K. <strong>Dabigatran:</strong> <Term detail="idarucizumab">idarucizumab</Term>. <strong>Xa inhibitors:</strong> <Term detail="andexanet alfa">andexanet</Term>. Do not wait for labs when the history is clear.
          </Paragraph>

          <Section number={4} title="Blood Pressure" />

          <Paragraph
            viewMode={viewMode}
            detail="INTERACT2/ATACH-2: SBP &lt;140 may reduce expansion and improve function. Start early. Nicardipine or labetalol. Avoid drops &gt;90 mmHg in 1 h."
          >
            SBP <Value>&lt;140 mmHg</Value> when feasible. Nicardipine or labetalol. Avoid rapid drop (e.g. &gt;<Value>90</Value> mmHg in 1 h).
          </Paragraph>

          <Section number={5} title="ICP and Herniation" />

          <Paragraph viewMode={viewMode} detail="HOB 30°. Hyperosmolar: mannitol 1 g/kg or 3% saline. Hyperventilation for imminent herniation only. Consider EVD for hydrocephalus from IVH.">
            HOB <Value>30°</Value>. Hyperosmolar therapy (mannitol, 3% saline). Hyperventilation as bridge only. <Term detail="extraventricular drain">EVD</Term> if hydrocephalus from IVH.
          </Paragraph>

          <SubSection title="Surgery" />

          <Paragraph
            viewMode={viewMode}
            detail="STICH: no benefit for most. STICH II: lobar ICH 10–100 ml, GCS 5–14, superficial, no IVH — surgery within 12 h had small benefit. Cerebellar &gt;3 cm or brainstem compression: evacuate. Consider decompression for dominant hemispheric with shift."
          >
            Most supratentorial ICH: medical. <Term detail="superficial lobar, 10–100 ml">STICH II</Term>-type — consider evacuation. Cerebellar <Value>&gt;3 cm</Value> or brainstem compression: <Critical>evacuate</Critical>.
          </Paragraph>

          <Section number={6} title="ICU and Complications" />

          <Paragraph viewMode={viewMode} detail="Seizure: benzos then AED if clinical. Prophylaxis not standard. DVT: SCDs; chemoprophylaxis when stable, typically 24–48 h after stability. Glucose 140–180. Fever: treat.">
            Seizure: treat if clinical; no routine prophylaxis. DVT: SCDs; chemoprophylaxis after 24–48 h if stable. Glucose <Value>140–180</Value>. Treat fever.
          </Paragraph>

          <Warning>
            Do not give tPA or antiplatelets in acute ICH. Reverse anticoagulation before any elective procedure.
          </Warning>
        </>
      )}
    </ArticleLayout>
  );
}
