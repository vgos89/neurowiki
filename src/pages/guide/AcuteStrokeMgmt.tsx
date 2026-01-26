import React from 'react';
import {
  ArticleLayout,
  Section,
  SubSection,
  Paragraph,
  Term,
  Trial,
  Critical,
  Value,
} from '../../components/article';

export default function AcuteStrokeMgmt() {
  return (
    <ArticleLayout
      category="Vascular Neurology"
      categoryPath="/guide"
      title="Acute Management of LVO Stroke"
      subtitle="Post-thrombectomy ICU care, complications, and secondary prevention"
      leadText={
        <>
          After <Term detail="endovascular thrombectomy">EVT</Term>, the focus is preventing secondary injury: BP, glucose, fever, edema, and hemorrhagic transformation.
        </>
      }
      relatedLinks={[
        { title: 'Stroke Basics', href: '/guide/stroke-basics' },
        { title: 'Thrombectomy', href: '/guide/thrombectomy' },
        { title: 'EVT Pathway', href: '/calculators/evt-pathway' },
      ]}
    >
      {(viewMode) => (
        <>
          <Section number={1} title="Thrombectomy Selection" />

          <Paragraph viewMode={viewMode}>
            Late window (6–24 h): <Trial name="DAWN" path="/trials/dawn-trial" /> / <Trial name="DEFUSE-3" path="/trials/defuse-3-trial" />. Large core: <Trial name="SELECT2" path="/trials/select2-trial" /> / <Trial name="ANGEL-ASPECT" path="/trials/angel-aspect-trial" /> (ASPECTS 3–5). Distal occlusions: by feasibility and deficit.
          </Paragraph>

          <Section number={2} title="Neuro-ICU Monitoring" />

          <SubSection title="Exams and Hemodynamics" />

          <Paragraph
            viewMode={viewMode}
            detail="Every 15 min until stable, then space to q1–2h by 8 h. Any decline = stat CT to rule out hemorrhage or edema."
          >
            <strong>Neuro exams:</strong> q15min early, then q1–2h by 8 h post-EVT.
          </Paragraph>

          <Paragraph
            viewMode={viewMode}
            detail="If not recanalized, permissive hypertension up to ~220 systolic can support penumbra. If recanalized, typical target &lt;140–160 to reduce HT risk."
          >
            <strong>BP:</strong> Avoid swings. Non-recanalized: permissive hypertension up to <Value>220</Value> systolic. Recanalized: per protocol (often <Value>&lt;140–160</Value>).
          </Paragraph>

          <SubSection title="Metabolic Targets" />

          <Paragraph
            viewMode={viewMode}
            detail="SHINE: intensive glucose control (80–130) did not improve outcomes and increased hypoglycemia. Target 140–180. Below 60 is dangerous."
          >
            <strong>Glucose:</strong> <Value>140–180 mg/dL</Value> (<Trial name="SHINE" path="/trials/shine-trial" />). Avoid hypoglycemia <Value>&lt;60 mg/dL</Value>.
          </Paragraph>

          <Paragraph viewMode={viewMode} detail="Fever worsens infarct. Acetaminophen, cooling. Work up infection if persistent.">
            <strong>Temperature:</strong> Treat hyperthermia <Value>&gt;37.5°C</Value>.
          </Paragraph>

          <Section number={3} title="Post-Thrombectomy Complications" />

          <Paragraph viewMode={viewMode} detail="Check groin, distal pulse, Hct. Retroperitoneal can present with hypotension, flank pain, falling Hgb.">
            <strong>Access site:</strong> Groin hematoma, retroperitoneal bleed, limb ischemia.
          </Paragraph>

          <Paragraph
            viewMode={viewMode}
            detail="NIHSS &gt;20, carotid T, early CT hypodensity = high risk. HOB 30°, mannitol or 3% saline. Hemicraniectomy within 24–48 h for &lt;60 y with midline shift — can be life-saving."
          >
            <strong>Malignant edema:</strong> ~80% mortality untreated. Risk: <Term detail="NIH Stroke Scale">NIHSS</Term> <Value>&gt;20</Value>, carotid T, early hypodensity. HOB <Value>&gt;30°</Value>, hyperosmolar therapy. <Critical>Hemicraniectomy</Critical> within 24–48 h if &lt;60 y.
          </Paragraph>

          <Paragraph
            viewMode={viewMode}
            detail="Heidelberg: HI1/2 (hemorrhagic infarction), PH1/2 (parenchymal). PH2 with mass effect has worst 90-day prognosis."
          >
            <strong>Hemorrhagic transformation:</strong> Heidelberg (HI1/2, PH1/2). PH2 with mass effect — worst prognosis.
          </Paragraph>

          <Section number={4} title="Secondary Prevention and Rehab" />

          <Paragraph viewMode={viewMode} detail="Etiology: AF, carotid, ICAD. Antithrombotics: balance ischemic risk vs hemorrhage in damaged tissue. Start when stable.">
            Protocolized etiology workup. Antithrombotics: balance recurrence vs hemorrhage. Early PT/OT/SLP; bedrest often 24 h then mobilize.
          </Paragraph>
        </>
      )}
    </ArticleLayout>
  );
}
