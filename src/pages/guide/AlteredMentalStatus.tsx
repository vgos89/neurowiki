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

export default function AlteredMentalStatus() {
  return (
    <ArticleLayout
      category="General Neurology"
      categoryPath="/guide"
      title="Altered Mental Status"
      subtitle="Structured workup — toxic-metabolic, CNS, and systemic"
      leadText={
        <>
          <Term detail="reduced alertness or cognition">Altered mental status (AMS)</Term> needs a system: glucose, vitals, oxygenation, then toxins and lytes, then CNS and systemic causes.
        </>
      }
      relatedLinks={[
        { title: 'Meningitis', href: '/guide/meningitis' },
        { title: 'Seizure Workup', href: '/guide/seizure-workup' },
        { title: 'Status Epilepticus', href: '/guide/status-epilepticus' },
      ]}
    >
      {(viewMode) => (
        <>
          <Section number={1} title="Immediate" />

          <Paragraph
            viewMode={viewMode}
            detail="Glucose, O2, BP. Hypoglycemia, hypoxia, shock can cause AMS and are fixable. Thiamine before glucose if Wernicke risk (EtOH, malnutrition)."
          >
            <Critical>Glucose</Critical>, O2 sat, BP. Thiamine before D50 if <Term detail="alcohol use, malnutrition">Wernicke</Term> risk.
          </Paragraph>

          <Section number={2} title="Toxic-Metabolic" />

          <Paragraph
            viewMode={viewMode}
            detail="Na (hyponatremia, hypernatremia), Ca, Mg, Phos, BUN/Cr, ammonia, LFTs. ABG: hypo/hypercapnia. Tox: EtOH, illicit, prescribed (sedatives, anticholinergics)."
          >
            Lytes, renal, ammonia, LFTs. ABG. Tox screen, EtOH, medications (sedatives, anticholinergics).
          </Paragraph>

          <Section number={3} title="CNS" />

          <Paragraph
            viewMode={viewMode}
            detail="Stroke, ICH, SAH, mass, infection (meningitis, abscess, encephalitis). Seizure, NCSE. CT first for hemorrhage, mass, herniation. MRI and LP as indicated."
          >
            Stroke, hemorrhage, mass, infection, seizure / <Term detail="nonconvulsive status">NCSE</Term>. CT first. MRI, LP as indicated.
          </Paragraph>

          <Section number={4} title="Systemic" />

          <Paragraph viewMode={viewMode} detail="Sepsis, hypoxia, hypoperfusion. Endocrine: DKA, myxedema, adrenal crisis. Hepatic, uremic encephalopathy.">
            Sepsis, hypoxia, shock. DKA, myxedema, adrenal crisis. Hepatic, uremic encephalopathy.
          </Paragraph>
        </>
      )}
    </ArticleLayout>
  );
}
