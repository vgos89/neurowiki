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
  Warning,
} from '../../components/article';

export default function IvTpa() {
  return (
    <ArticleLayout
      category="Vascular Neurology"
      categoryPath="/guide"
      title="IV Thrombolytic Protocol"
      subtitle="tPA and tenecteplase eligibility, dosing, and BP management"
      leadText={
        <>
          <Term detail="recombinant tissue plasminogen activator">Alteplase (tPA)</Term> and{' '}
          <Term detail="single-bolus thrombolytic, non-inferior to tPA">tenecteplase (TNK)</Term>{' '}
          are the two IV thrombolytics for acute ischemic stroke. Door-to-needle <Value>&lt;45 min</Value>.
        </>
      }
      relatedLinks={[
        { title: 'Stroke Basics', href: '/guide/stroke-basics' },
        { title: 'Thrombectomy Pathway', href: '/calculators/evt-pathway' },
        { title: 'NIHSS', href: '/calculators?id=nihss' },
      ]}
    >
      {(viewMode) => (
        <>
          <Section number={1} title="Thrombolytic Agents" />

          <Paragraph
            viewMode={viewMode}
            detail="10% bolus over 1 min, then 90% over 60 min. Max 90 mg. Have BP meds ready before you start — you can't pause the infusion."
          >
            <strong>Alteplase (tPA):</strong> <Value>0.9 mg/kg</Value> (max <Value>90 mg</Value>). Bolus 10% IV push over 1 min; remaining 90% over 60 min.
          </Paragraph>

          <Paragraph
            viewMode={viewMode}
            detail="Single bolus. Better for drip-and-ship: one push before transfer, no pump on the ambulance. Avoid in extended window — less data."
          >
            <strong>Tenecteplase (TNK):</strong> <Value>0.25 mg/kg</Value> (max <Value>25 mg</Value>) single IV bolus. Non-inferior to alteplase; preferred for LVO when transferring for thrombectomy.
          </Paragraph>

          <Section number={2} title="Blood Pressure Management" />

          <Paragraph
            viewMode={viewMode}
            detail="Labetalol 10–20 mg IV, repeat as needed. Nicardipine 5 mg/hr, titrate to 15. If you can't get under 185/110 with aggressive dosing, do not give lytics."
          >
            <strong>Pre-treatment:</strong> BP must be <Value>&lt;185/110 mmHg</Value>. Labetalol 10–20 mg IV push (may repeat) or Nicardipine infusion 5–15 mg/hr.
          </Paragraph>

          <Warning>
            If BP remains refractory despite aggressive treatment, <Critical>do not give tPA</Critical>. Treating above 185/110 increases sICH risk.
          </Warning>

          <Paragraph
            viewMode={viewMode}
            detail="SBP 180–230: labetalol 10 mg IV. SBP &gt;230 or DBP 121–140: labetalol 10 mg or nicardipine. DBP &gt;140: nicardipine. Recheck q15min."
          >
            <strong>Post-treatment (24h):</strong> Maintain <Value>&lt;180/105 mmHg</Value>. Monitor q15min × 2h, then q30min × 6h, then q1h × 16h.
          </Paragraph>

          <Section number={3} title="Inclusion Criteria" />

          <Paragraph viewMode={viewMode}>
            Clinical diagnosis of ischemic stroke with <Critical>disabling</Critical> deficit; LKW <Value>&lt;4.5 h</Value>; age <Value>≥18</Value>.
          </Paragraph>

          <Section number={4} title="Key Exclusions (Do Not Give)" />

          <Paragraph viewMode={viewMode} detail="Any blood on CT = stop. Subarachnoid, intraparenchymal, subdural — all absolute.">
            <strong>Hemorrhage:</strong> Any ICH or SAH on CT.
          </Paragraph>

          <Paragraph
            viewMode={viewMode}
            detail="Get coags before tPA when possible, but don't delay for INR if not on anticoagulants. Platelets &lt;100k or INR &gt;1.7 = do not give."
          >
            <strong>Coagulopathy:</strong> Platelets <Value>&lt;100,000</Value>, INR <Value>&gt;1.7</Value>, PTT <Value>&gt;40 s</Value>.
          </Paragraph>

          <Paragraph
            viewMode={viewMode}
            detail="For DOACs: get last dose time. If within 48h, need normal TT/anti-Xa or specific reversal before tPA. Idarucizumab for dabigatran; andexanet for Xa inhibitors."
          >
            <strong>Anticoagulants:</strong> Therapeutic LMWH within 24h. DOAC within 48h unless normal thrombin time/anti-Xa confirmed.
          </Paragraph>

          <Paragraph viewMode={viewMode} detail="ICH, head trauma, or stroke in last 3 months. Major brain or spine surgery in last 3 months.">
            <strong>Head history:</strong> Severe head trauma or stroke within 3 months. Major intracranial/intraspinal surgery within 3 months.
          </Paragraph>

          <Paragraph viewMode={viewMode} detail="GI bleed, aortic dissection, active internal bleeding. &gt;1/3 MCA = large established core, high hemorrhage risk.">
            <strong>Bleeding risk:</strong> GI malignancy or bleed within 21 days; aortic arch dissection; active internal bleeding. CT hypodensity <Value>&gt;1/3 MCA</Value> territory.
          </Paragraph>

          <Section number={5} title="Relative Exclusions" />

          <Paragraph
            viewMode={viewMode}
            detail="If the deficit would prevent them from working or living independently, treat. 'Mild' with isolated aphasia or dominant-hand weakness can be disabling."
          >
            Minor or rapidly improving symptoms — treat if <Critical>disabling</Critical>. Major surgery or trauma &lt;14 days. Seizure at onset — treat if imaging confirms stroke. Pregnancy. Recent MI (&lt;3 months).
          </Paragraph>

          <Section number={6} title="Wake-Up / Unknown Onset" />

          <Paragraph
            viewMode={viewMode}
            detail="DWI bright, FLAIR dark = likely &lt;4.5h. WAKE-UP used this. Perfusion mismatch (core &lt;70 ml, penumbra &gt;10 ml, ratio &gt;1.2) qualifies for extended-window trials like EXTEND."
          >
            Eligible if: <strong>MRI</strong> DWI+ and FLAIR− suggests onset <Value>&lt;4.5 h</Value>; or <strong>CTP</strong> favorable penumbral profile per <Trial name="WAKE-UP" path="/trials/wake-up" /> / <Trial name="EXTEND" path="/trials/extend-trial" />.
          </Paragraph>
        </>
      )}
    </ArticleLayout>
  );
}
