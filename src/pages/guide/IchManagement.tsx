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

          <Paragraph viewMode={viewMode} detail="Warfarin: 4-factor PCC 25-50 units/kg IV + Vitamin K 10 mg IV (goal INR <1.4). If PCC unavailable, FFP. Dabigatran: idarucizumab 5 g IV. Xa inhibitors: andexanet or PCC. 2022 AHA/ASA ICH, Class I, Level B.">
            <strong>Warfarin:</strong> 4-factor <Term detail="prothrombin complex concentrate">PCC</Term> 25-50 units/kg IV + Vitamin K 10 mg IV (goal INR &lt;1.4). If PCC unavailable, FFP 10-15 mL/kg. <strong>Dabigatran:</strong> <Term detail="idarucizumab">idarucizumab</Term> 5 g IV. <strong>Xa inhibitors:</strong> <Term detail="andexanet alfa">andexanet</Term> alfa or 4-factor PCC. Do not wait for labs when the history is clear. (2022 AHA/ASA ICH, Class I, Level B.)
          </Paragraph>

          <Section number={4} title="Blood Pressure" />

          <Paragraph
            viewMode={viewMode}
            detail="INTERACT-2, ATACH-2: SBP <140 within 1 h when feasible (Class I, Level A). Avoid SBP <110. Nicardipine or labetalol. Avoid rapid drop >90 mmHg in 1 h."
          >
            SBP <Value>&lt;140 mmHg</Value> within 1 hour when feasible (Class I, Level A). Nicardipine or labetalol. Avoid SBP &lt;110 mmHg; avoid rapid drop (e.g. &gt;<Value>90</Value> mmHg in 1 h). Evidence: INTERACT-2, ATACH-2; 2022 AHA/ASA ICH Guidelines.
          </Paragraph>

          <Section number={5} title="ICP and Herniation" />

          <Paragraph viewMode={viewMode} detail="HOB 30°. Hyperosmolar: mannitol 1 g/kg or 3% saline. Hyperventilation for imminent herniation only. Consider EVD for hydrocephalus from IVH.">
            HOB <Value>30°</Value>. Hyperosmolar therapy (mannitol, 3% saline). Hyperventilation as bridge only. <Term detail="extraventricular drain">EVD</Term> if hydrocephalus from IVH.
          </Paragraph>

          <SubSection title="Surgery" />

          <Paragraph
            viewMode={viewMode}
            detail="STICH: no benefit for most. STICH II: lobar ICH 10–100 ml, GCS 5–14, superficial, no IVH — surgery within 12 h had small benefit. Cerebellar >3 cm with neurological decline or brainstem compression or hydrocephalus: evacuate (Class I, Level B). EVD for hydrocephalus from IVH."
          >
            Most supratentorial ICH: medical. <Term detail="superficial lobar, 10–100 ml">STICH II</Term>-type — consider evacuation. Cerebellar hemorrhage <Value>&gt;3 cm</Value> with neurological decline or brainstem compression or hydrocephalus: <Critical>evacuate</Critical> (Class I, Level B). EVD for hydrocephalus from IVH.
          </Paragraph>

          <Section number={6} title="ICU and Complications" />

          <Paragraph viewMode={viewMode} detail="Seizure: benzos then AED if clinical. Prophylaxis not standard. DVT: SCDs; chemoprophylaxis when stable, typically 24–48 h after stability. Glucose 140–180. Fever: treat.">
            Seizure: treat if clinical; no routine prophylaxis. DVT: SCDs; chemoprophylaxis after 24–48 h if stable. Glucose <Value>140–180</Value>. Treat fever.
          </Paragraph>

          <Warning>
            Do not give tPA or antiplatelets in acute ICH. Reverse anticoagulation before any elective procedure.
          </Warning>

          <Paragraph viewMode={viewMode} detail="2022 AHA/ASA ICH Guideline reference.">
            References: 2022 AHA/ASA Guideline for the Management of Patients With Spontaneous Intracerebral Hemorrhage.{' '}
            <a href="https://www.ahajournals.org/doi/10.1161/STR.0000000000000407" target="_blank" rel="noopener noreferrer">Stroke. 2022</a>.
          </Paragraph>
        </>
      )}
    </ArticleLayout>
  );
}
