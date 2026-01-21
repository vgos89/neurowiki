import React from 'react';
import { Link } from 'react-router-dom';
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

export default function Thrombectomy() {
  return (
    <ArticleLayout
      category="Vascular Neurology"
      categoryPath="/guide"
      title="Mechanical Thrombectomy (EVT)"
      subtitle="Indications, time windows, and procedural management"
      leadText={
        <>
          <Term detail="endovascular thrombectomy — mechanical clot retrieval">EVT</Term> for{' '}
          <Term detail="ICA, M1, M2 dominant, basilar">large vessel occlusion (LVO)</Term> improves outcomes when core is limited and deficit is severe. Use the <Link to="/calculators/evt-pathway" className="text-indigo-600 hover:underline font-medium">Thrombectomy Pathway</Link> to stratify.
        </>
      }
      relatedLinks={[
        { title: 'Stroke Basics', href: '/guide/stroke-basics' },
        { title: 'IV tPA', href: '/guide/iv-tpa' },
        { title: 'EVT Pathway', href: '/calculators/evt-pathway' },
      ]}
    >
      {(viewMode) => (
        <>
          <Section number={1} title="Indications" />

          <Paragraph viewMode={viewMode}>
            <strong>Occlusion:</strong> Proximal LVO (ICA, M1). <strong>Pre-stroke:</strong> <Term detail="modified Rankin Scale 0–1">mRS</Term> 0–1. <strong>Time:</strong> 0–24 h from LKW.
          </Paragraph>

          <Section number={2} title="Selection by Time Window" />

          <SubSection title="Early Window (0–6 h)" />

          <Paragraph
            viewMode={viewMode}
            detail="ASPECTS 6–10 = small core. ASPECTS 3–5 = large core; SELECT2 and ANGEL-ASPECT showed benefit. Don't dismiss based on core alone."
          >
            NCCT <Term detail="Alberta Stroke Program Early CT Score, 0–10">ASPECTS</Term> <Value>≥6</Value> (small core). <Trial name="SELECT2" /> and <Trial name="ANGEL-ASPECT" />: large core (ASPECTS 3–5 or core <Value>&gt;50 ml</Value>) also benefits.
          </Paragraph>

          <SubSection title="Late Window (6–24 h)" />

          <Paragraph
            viewMode={viewMode}
            detail="DAWN uses clinical–core mismatch (age, NIHSS, core volume). DEFUSE-3 uses core &lt;70 ml, mismatch ratio ≥1.8, volume ≥15 ml. Need CTP or MRI."
          >
            <Trial name="DAWN" /> or <Trial name="DEFUSE-3" /> criteria. CTP or MRI to show <Term detail="small core, large deficit or penumbra">clinical–core mismatch</Term>.
          </Paragraph>

          <Section number={3} title="Posterior Circulation and Distal Occlusions" />

          <Paragraph
            viewMode={viewMode}
            detail="Basilar: ATTENTION and BAOCHE. M2/M3, ACA, PCA: consider by technical feasibility and deficit; DISTAL/ESCAPE-MeVO did not show benefit for routine MeVO."
          >
            <strong>Basilar:</strong> EVT up to 24 h (<Trial name="ATTENTION" />, <Trial name="BAOCHE" />). <strong>Distal/MeVO:</strong> M2/M3, ACA, PCA — by feasibility and deficit; evidence for routine EVT is limited.
          </Paragraph>

          <Section number={4} title="Procedural Management" />

          <Paragraph
            viewMode={viewMode}
            detail="Give tPA/TNK if eligible, then move. Don't hold transport for lytic effect. Every minute of reperfusion delay worsens outcome."
          >
            <strong>Bridging:</strong> IV tPA or TNK if eligible. <Critical>Do not delay</Critical> transport to angio for lytic effect.
          </Paragraph>

          <Paragraph viewMode={viewMode} detail="Conscious sedation lets you monitor during the case. GETA if airway at risk or patient agitated.">
            <strong>Anesthesia:</strong> Conscious sedation preferred; GETA if airway or agitation.
          </Paragraph>

          <Paragraph viewMode={viewMode} detail="Low BP before reperfusion can drop collateral flow. Keep SBP &gt;140 until recanalized, then per protocol.">
            <strong>BP:</strong> Avoid hypotension. SBP <Value>&gt;140 mmHg</Value> to support collaterals until reperfusion.
          </Paragraph>

          <Paragraph
            viewMode={viewMode}
            detail="Underlying ICAD may need angioplasty ± stent and antiplatelet (e.g. tirofiban, aspirin). More common in Asian populations."
          >
            <strong>ICAD:</strong> If <Term detail="intracranial atherosclerosis">ICAD</Term> at clot site, may need angioplasty/stent and antiplatelet load.
          </Paragraph>

          <Section number={5} title="Complications" />

          <Paragraph viewMode={viewMode} detail="HT: lower BP post-recanalization, often &lt;140–160 SBP. Groin: hold pressure, check distal pulse. Vessel: dissection, perforation, emboli to new territory.">
            <strong>Reperfusion injury</strong> (hemorrhagic transformation — strict BP). <strong>Groin:</strong> hematoma, retroperitoneal bleed, limb ischemia. <strong>Vessel:</strong> dissection, perforation, embolization to new territory.
          </Paragraph>
        </>
      )}
    </ArticleLayout>
  );
}
