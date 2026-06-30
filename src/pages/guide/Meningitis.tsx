import {
  useEffect } from 'react';
import {
  ArticleLayout,
  Section,
  Paragraph,
  Term,
  Critical,
  Value,
  Warning,
  CalcRef,
} from '../../components/article';
import { useRecents } from '../../hooks/useRecents';
import DiscreteFAQ from '../../components/seo/DiscreteFAQ';
import { getFAQsForPath } from '../../seo/schema';

export default function Meningitis() {
  const { recordView } = useRecents();
  useEffect(() => {
    recordView({
      id: 'guide-meningitis',
      type: 'guide',
      title: 'Bacterial Meningitis',
      subtitle: 'Neurocritical Care',
      category: 'neurocritical',
      trail: '6 min read',
    });
  }, [recordView]);

  return (
    <>
    <ArticleLayout
      category="Neurocritical Care"
      categoryPath="/guide"
      title="Meningitis"
      subtitle="Empiric therapy, LP, and when to image first"
      leadText={
        <>
          <Term detail="inflammation of the meninges — bacterial, viral, fungal">Meningitis</Term> is a clinical diagnosis. Empiric antibiotics before LP when bacterial is suspected; don't delay for imaging unless there are signs of mass or herniation.
        </>
      }
      relatedLinks={[
        { title: 'Altered Mental Status', href: '/guide/altered-mental-status' },
        { title: 'Seizure Workup', href: '/guide/seizure-workup' },
      ]}
    >
      {(viewMode) => (
        <>
          <Section number={1} title="When to Suspect" />

          <Paragraph
            viewMode={viewMode}
            detail="Fever, headache, neck stiffness, photophobia. Altered mental status, seizures. Immunocompromised, recent sinus/ear infection, neurosurgery. Rash: think meningococcus."
          >
            Fever, headache, <Term detail="neck rigidity on flexion">nuchal rigidity</Term>, photophobia. AMS, seizures. Immunocompromise, sinus/ear/neuro surgery. Petechial rash: <Critical>meningococcus</Critical>.
          </Paragraph>

          <Section number={2} title="Imaging Before LP" />

          <Paragraph
            viewMode={viewMode}
            detail="Image first if: focal deficit, papilledema, GCS &lt;10, immunocompromised, seizure, known mass. Otherwise LP can come first. If you image and it delays abx &gt;1 h, give abx before the scan."
          >
            CT before LP if: focal deficit, papilledema, <CalcRef name="GCS" path="/calculators/glasgow-coma-scale">GCS</CalcRef> <Value>&lt;10</Value>, immunocompromised, seizure, known mass. Otherwise LP first. If imaging delays antibiotics &gt;1 h, give antibiotics before the scan.
          </Paragraph>

          <Section number={3} title="LP and CSF" />

          <Paragraph
            viewMode={viewMode}
            detail="Opening pressure. Tubes: cell count, protein, glucose, Gram stain, culture. Add HSV PCR, cryptococcal Ag, VDRL, AFB/fungal if indicated. Hold 1–2 ml for repeat or send-out."
          >
            Opening pressure. Send: cell count, protein, glucose, Gram stain, culture. Add HSV PCR, cryptococcal Ag, VDRL, AFB/fungal as indicated.
          </Paragraph>

          <Paragraph
            viewMode={viewMode}
            detail="Bacterial: high WBC (often PMN), low glucose, high protein. Viral: lymphocytic, normal or near-normal glucose. TB/fungal: lymphocytic, low glucose. Partially treated: can blur the picture."
          >
            Bacterial: high WBC (PMN-predominant), low glucose, high protein. Viral: lymphocytic, glucose often normal. TB/fungal: lymphocytic, low glucose.
          </Paragraph>

          <Section number={4} title="Empiric Therapy" />

          <Paragraph
            viewMode={viewMode}
            detail="Vancomycin + third-gen cephalosporin (ceftriaxone or cefotaxime). Add ampicillin if &gt;50 y, immunocompromised, or Listeria concern. Dexamethasone with or before first dose for suspected pneumococcal (adults) — check current ID guidance."
          >
            <strong>Empiric:</strong> Vancomycin + ceftriaxone (or cefotaxime). Add ampicillin if <Value>&gt;50</Value> y, immunocompromised, or <Term detail="Listeria monocytogenes">Listeria</Term> risk. Dexamethasone with first dose for suspected pneumococcal (adults).
          </Paragraph>

          <Paragraph viewMode={viewMode} detail="Acyclovir 10 mg/kg q8h for HSV. Start if viral or unclear; stop when HSV PCR negative and alternative found.">
            <strong>HSV:</strong> Acyclovir <Value>10 mg/kg IV q8h</Value> until HSV PCR negative and another cause found.
          </Paragraph>

          <Warning>
            Give empiric antibiotics as soon as bacterial meningitis is suspected. Do not wait for LP or imaging if that would delay by more than ~1 hour.
          </Warning>
        </>
      )}
    </ArticleLayout>
    {/* Discrete FAQ — V approval 2026-05-21 Option A. Same data feeds JSON-LD FAQPage schema via getSchemaForRoute. */}
    <div className="max-w-2xl mx-auto px-5 md:px-8">
      <DiscreteFAQ items={getFAQsForPath('/guide/meningitis')} />
    </div>
    </>
  );
}
