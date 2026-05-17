/**
 * TpaReversalProtocolModal — thin wrapper over ProtocolModal primitive.
 *
 * Migrated 2026-05-17 from 153 LOC bespoke modal to 36 LOC data-only
 * wrapper consuming ProtocolModal. All clinical text (TITLE, STEPS,
 * references) preserved byte-for-byte from the prior implementation
 * — verbatim from AHA/ASA 2026 Acute Ischemic Stroke Guideline,
 * Table 5.
 */
import React from 'react';
import { ProtocolModal, type ProtocolStep } from './ProtocolModal';

const STEPS: ProtocolStep[] = [
  { title: 'Stop thrombolytic', body: 'Stop alteplase infusion or tenecteplase immediately.' },
  { title: 'Emergent labs', body: 'CBC, PT (INR), aPTT, fibrinogen, type & cross.' },
  { title: 'Emergent nonenhanced head CT', body: 'Obtain stat to confirm and assess hemorrhage.' },
  { title: 'Cryoprecipitate', body: '10 units IV over 10–30 min; goal fibrinogen ≥150 mg/dL.' },
  { title: 'Antifibrinolytic', body: 'Tranexamic acid 1000 mg IV over 10 min, OR ε-aminocaproic acid 4–5 g IV over 1 h, then 1 g IV until bleeding controlled.' },
  { title: 'Consults', body: 'Hematology, Neurosurgery.' },
  { title: 'Supportive care', body: 'BP, ICP, CPP, MAP, temperature, glucose control. Do not use platelet transfusion routinely; reserve for severe thrombocytopenia or planned surgery. Trend fibrinogen until goal; repeat CT as clinically indicated.' },
];

interface TpaReversalProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopySuccess?: () => void;
}

export function TpaReversalProtocolModal(props: TpaReversalProtocolModalProps) {
  return (
    <ProtocolModal
      {...props}
      id="tpa-reversal"
      shortTitle="tPA/TNK Reversal"
      shortSubtitle="AHA/ASA 2026 · Act in sequence, do not delay"
      fullTitle="tPA/TNK Reversal Protocol (Symptomatic Intracranial Hemorrhage)"
      severity={{
        tone: 'red',
        eyebrow: 'Life-threatening',
        description: 'Follow steps in order. Do not delay imaging or reversal.',
      }}
      steps={STEPS}
      references={{
        text: 'References: AHA/ASA 2026 Acute Ischemic Stroke Guideline, Table 5.',
      }}
    />
  );
}

export default TpaReversalProtocolModal;
