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

export default function StatusEpilepticus() {
  return (
    <ArticleLayout
      category="Epilepsy"
      categoryPath="/guide"
      title="Status Epilepticus"
      subtitle="Phased treatment from first-line benzos to refractory and super-refractory"
      leadText={
        <>
          <Term detail="T1=when to treat; T2=when neuronal injury risk rises">ILAE 2015</Term>: convulsive SE — treat at <Value>5 min</Value>, control by <Value>30 min</Value>. Underdosing benzos is the most common cause of failure.
        </>
      }
      relatedLinks={[
        { title: 'Status Epilepticus Pathway', href: '/calculators/se-pathway' },
        { title: 'Seizure Workup', href: '/guide/seizure-workup' },
      ]}
    >
      {(viewMode) => (
        <>
          <Section number={1} title="Definition and Classification" />

          <Paragraph viewMode={viewMode}>
            <strong>T1 (time to treat):</strong> <Value>5 min</Value> convulsive — treat. <strong>T2 (time to damage):</strong> <Value>30 min</Value> — must be controlled. <Term detail="seizures on EEG without prominent motor activity">Non-convulsive SE (NCSE)</Term>. <Term detail="fails 2 adequate agents (benzo + AED)">Refractory</Term>. <Term detail="continues &gt;24h despite anesthesia">Super-refractory</Term>.
          </Paragraph>

          <Section number={2} title="Phase I: Initial Therapy (0–10 min)" />

          <Paragraph viewMode={viewMode} detail="Stop the seizure. Don't wait for EEG. ABCs, glucose. Thiamine 100 mg + D50 if glucose &lt;60.">
            <Critical>Benzodiazepines first.</Critical> Do not delay for EEG. ABCs. Check glucose — Thiamine 100 mg + D50 if <Value>&lt;60 mg/dL</Value>.
          </Paragraph>

          <SubSection title="Preferred Agents (Choose One)" />

          <Paragraph viewMode={viewMode} detail="4 mg IV, repeat once. Preferred when IV available.">
            <strong>Lorazepam:</strong> <Value>4 mg IV</Value> (0.1 mg/kg). May repeat once.
          </Paragraph>

          <Paragraph viewMode={viewMode} detail="First line when no IV: 10 mg IM &gt;40 kg, 5 mg IM &lt;40 kg. Works in 1–2 min.">
            <strong>Midazolam IM:</strong> <Value>10 mg</Value> (&gt;40 kg) or <Value>5 mg</Value> (&lt;40 kg). First line pre-hospital or no IV.
          </Paragraph>

          <Paragraph viewMode={viewMode} detail="10 mg IV, 0.15 mg/kg. Redistribution causes short duration; follow with a second-line AED.">
            <strong>Diazepam:</strong> <Value>10 mg IV</Value> (0.15 mg/kg).
          </Paragraph>

          <Section number={3} title="Phase II: Urgent Control (10–30 min)" />

          <Paragraph viewMode={viewMode} detail="ESETT: LEV, fosphenytoin, valproate ~50% each. Pick one. Start as soon as Phase I fails — don't wait.">
            <Trial name="ESETT" path="/trials/esett" />: <Term detail="levetiracetam">Levetiracetam</Term>, <Term detail="phenytoin prodrug">Fosphenytoin</Term>, and <Term detail="valproic acid">Valproate</Term> equally effective (~50% cessation). Start if seizure continues after Phase I.
          </Paragraph>

          <SubSection title="Agents (Choose One)" />

          <Paragraph viewMode={viewMode} detail="60 mg/kg IV, max 4500 mg, over 15 min. No major drug interactions, no cardiac monitoring.">
            <strong>Levetiracetam:</strong> <Value>60 mg/kg IV</Value> (max <Value>4500 mg</Value>), over 15 min.
          </Paragraph>

          <Paragraph viewMode={viewMode} detail="20 mg PE/kg, max 1500 mg PE. Up to 150 mg PE/min. Cardiac monitor. Avoid in phenytoin allergy.">
            <strong>Fosphenytoin:</strong> <Value>20 mg PE/kg</Value> (max <Value>1500 mg PE</Value>). Up to 150 mg PE/min. Cardiac monitoring.
          </Paragraph>

          <Paragraph viewMode={viewMode} detail="40 mg/kg IV, max 3000 mg, over 10 min. Avoid in liver disease, pregnancy.">
            <strong>Valproic Acid:</strong> <Value>40 mg/kg IV</Value> (max <Value>3000 mg</Value>), over 10 min. Avoid in liver disease, pregnancy.
          </Paragraph>

          <Paragraph viewMode={viewMode} detail="15 mg/kg IV. Hypotension and respiratory depression common. Third-line.">
            <strong>Phenobarbital:</strong> <Value>15 mg/kg IV</Value>. Risk of hypotension, respiratory depression.
          </Paragraph>

          <Section number={4} title="Phase III: Refractory (30–60 min)" />

          <Paragraph viewMode={viewMode} detail="Intubate. cEEG to titrate to burst suppression or seizure suppression. Midazolam, propofol, or ketamine. Pentobarbital if others fail.">
            Anesthetic infusion. Intubation usually required. <Critical>Continuous EEG</Critical> to titrate.
          </Paragraph>

          <SubSection title="Continuous Infusions" />

          <Paragraph viewMode={viewMode}>Midazolam: load <Value>0.2 mg/kg</Value>, then <Value>0.1–2 mg/kg/h</Value>. Propofol: load <Value>1–2 mg/kg</Value>, <Value>20–200 mcg/kg/min</Value> (watch <Term detail="propofol infusion syndrome">PRIS</Term>). Ketamine: load <Value>1.5–4.5 mg/kg</Value>, <Value>1–10 mg/kg/h</Value> (hemodynamically stable, NMDA). Pentobarbital: load <Value>5–15 mg/kg</Value>, <Value>0.5–5 mg/kg/h</Value> (hypotension common).</Paragraph>

          <Section number={5} title="Phase IV: Super-Refractory (&gt;24 h)" />

          <Paragraph
            viewMode={viewMode}
            detail="Add ketamine if not used. NORSE: consider high-dose steroids, IVIG. Ketogenic diet, hypothermia, VNS — evidence mixed."
          >
            Ketamine. If <Term detail="new-onset refractory SE without clear cause">NORSE</Term>: empiric steroids (e.g. methylprednisolone 1 g × 3–5 d) or IVIG. Ketogenic diet, hypothermia, VNS — mixed evidence.
          </Paragraph>

          <Section number={6} title="Diagnostic Workup" />

          <Paragraph viewMode={viewMode} detail="Glucose, lytes (Ca, Mg, Phos), AED levels, tox. CT head acute; MRI for etiology. LP if febrile or immunocompromised. Stroke, infection, metabolic, withdrawal, autoimmune encephalitis.">
            Stat: glucose, lytes, AED levels, tox. CT then MRI. LP if febrile or immunocompromised. Rule out: stroke, infection, metabolic, withdrawal, autoimmune encephalitis.
          </Paragraph>

          <Warning>
            Do not delay Phase I or II for workup. Treat first, then diagnose.
          </Warning>
        </>
      )}
    </ArticleLayout>
  );
}
