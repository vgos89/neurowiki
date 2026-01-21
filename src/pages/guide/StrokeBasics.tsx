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
  Warning 
} from '../../components/article';

export default function StrokeBasics() {
  return (
    <ArticleLayout
      category="Vascular Neurology"
      categoryPath="/guide/vascular"
      title="Stroke Basics"
      subtitle="Acute ischemic stroke recognition and initial management"
      leadText={
        <>
          Acute stroke management is time-critical. The phrase{' '}
          <Term detail="every minute = ~1.9 million neurons lost">"time is brain"</Term>{' '}
          guides all initial decisions.
        </>
      }
      relatedLinks={[
        { title: 'NIHSS Calculator', href: '/calculators?id=nihss' },
        { title: 'IV tPA', href: '/guide/iv-tpa' },
        { title: 'Thrombectomy Pathway', href: '/calculators/evt-pathway' },
      ]}
    >
      {(viewMode) => (
        <>
          <Section number="1" title="Immediate Assessment" />
          
          <p className="text-sm text-slate-500 italic mb-4">The "Golden Hour"</p>

          <Paragraph
            viewMode={viewMode}
            detail="'Yesterday' isn't good enough. Get exact times from family, EMS, witnesses. Work backwards if found down: when did they go to bed?"
          >
            Establish{' '}
            <Term detail="last time patient was at neurologic baseline">Last Known Well (LKW)</Term>{' '}
            immediately — <Critical>critical for treatment eligibility</Critical>. For wake-up strokes, LKW is the time last seen normal before sleep.
          </Paragraph>

          <Paragraph
            viewMode={viewMode}
            detail={<>Hypoglycemia <Value>&lt;50 mg/dL</Value> mimics stroke perfectly. 30% of code strokes are mimics. Check glucose first — takes 10 seconds.</>}
          >
            Obtain vitals (BP, HR, O₂ sat, temp) and{' '}
            <Term detail="rule out hypoglycemia — common mimic">POC glucose</Term> immediately.
          </Paragraph>

          <Paragraph
            viewMode={viewMode}
            detail="Look for disabling deficits even if total score is low. Isolated aphasia, visual field cuts, hand weakness — devastating despite low NIHSS."
          >
            Perform baseline{' '}
            <Term detail="NIH Stroke Scale — standardized neuro exam, 0-42">NIHSS</Term>{' '}
            by a certified examiner.
          </Paragraph>

          <Paragraph
            viewMode={viewMode}
            detail="For anticoagulants, get exact last dose time. 'This morning' isn't enough. DOACs within 48h may need reversal."
          >
            Screen for trauma, recent surgery (&lt;14 days), active bleeding, and anticoagulant use.
          </Paragraph>

          <Section number="2" title="Acute Imaging Protocol" />

          <p className="text-slate-600 italic mb-5">
            Goal: "Imaging is Brain" — initiate within <Value>25 minutes</Value> of arrival.
          </p>

          <SubSection title="Standard Protocol (0–6 hours)" />

          <Paragraph
            viewMode={viewMode}
            detail="Look for hyperdense vessel sign (clot), loss of grey-white differentiation, sulcal effacement. ASPECTS ≤5 = large established infarct."
          >
            <strong>NCCT Head</strong> to rule out hemorrhage and assess{' '}
            <Term detail="Alberta Stroke Program Early CT Score">ASPECTS</Term>.
          </Paragraph>

          <Paragraph
            viewMode={viewMode}
            detail="Also check for carotid webs, dissection, tandem lesions. LVO found? Alert IR immediately — don't wait."
          >
            <strong>CTA Head and Neck</strong> to identify{' '}
            <Term detail="ICA, MCA (M1/M2), PCA, or basilar occlusion">large vessel occlusion</Term>{' '}
            and evaluate carotid pathology.
          </Paragraph>

          <SubSection title="Extended Window / Wake-up Protocol" />

          <Paragraph
            viewMode={viewMode}
            detail="Small core + large penumbra (mismatch) = good outcomes with thrombectomy even at 24 hours."
          >
            <strong>CT Perfusion</strong> required for 6–24h window per <Trial name="DAWN" /> and <Trial name="DEFUSE-3" /> criteria.
          </Paragraph>

          <Paragraph
            viewMode={viewMode}
            detail="DWI positive, FLAIR negative = likely recent (<4.5h). DWI is your friend in the posterior fossa — CT lies there."
          >
            <strong>MRI Brain</strong> — DWI/FLAIR mismatch identifies wake-up strokes likely within <Value>&lt;4.5h</Value>.
          </Paragraph>

          <Section number="3" title="Laboratory Workup" />

          <Paragraph
            viewMode={viewMode}
            detail="Only glucose required before tPA in most cases. Don't wait for coags unless on anticoagulants."
          >
            <strong>Stat labs:</strong> Glucose, INR/PT/PTT, CBC with platelets, Troponin.
          </Paragraph>

          <Warning>
            <strong>Do not delay tPA or EVT for lab results</strong> unless suspicion of coagulopathy or known anticoagulant use.
          </Warning>

          <Paragraph
            viewMode={viewMode}
            detail="These are for secondary prevention, not acute decisions. They wait until stable."
          >
            <strong>Secondary labs:</strong> A1c, lipid panel, tox screen, pregnancy test (if applicable).
          </Paragraph>

          <Section number="4" title="Cardiac Evaluation" />

          <Paragraph
            viewMode={viewMode}
            detail="Stroke and MI occur together. Anterior STEMI causes LV thrombus. Acute stroke causes stress cardiomyopathy."
          >
            <strong>ECG</strong> for{' '}
            <Term detail="major cause of cardioembolic stroke">atrial fibrillation</Term>{' '}
            and concurrent STEMI.
          </Paragraph>

          <Paragraph
            viewMode={viewMode}
            detail="Many cryptogenic strokes show paroxysmal AF later. Consider loop recorder for unexplained strokes."
          >
            <strong>Telemetry</strong> minimum 24 hours for paroxysmal AF (<Trial name="STROKE-AF" />).
          </Paragraph>

          <SubSection title="Echocardiography" />

          <Paragraph
            viewMode={viewMode}
            detail="TEE if TTE non-diagnostic and high embolic suspicion — especially younger patients without risk factors."
          >
            <strong>TTE</strong> for routine screening.{' '}
            <strong>TEE</strong> for LA appendage thrombus, PFO, aortic arch disease.
          </Paragraph>
        </>
      )}
    </ArticleLayout>
  );
}
