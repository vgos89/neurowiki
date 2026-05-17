/**
 * OrolingualEdemaProtocolModal — thin wrapper over ProtocolModal primitive.
 *
 * Migrated 2026-05-17 from 152 LOC bespoke modal to 37 LOC data-only
 * wrapper consuming ProtocolModal. All clinical text (TITLE, STEPS,
 * references) preserved byte-for-byte from the prior implementation
 * — verbatim from AHA/ASA 2026, Table 6; Refs 53–54.
 */
import React from 'react';
import { ProtocolModal, type ProtocolStep } from './ProtocolModal';

const STEPS: ProtocolStep[] = [
  { title: 'Maintain airway', body: 'Awake fiberoptic intubation preferred. Nasal-tracheal route carries epistaxis risk. Cricothyroidotomy rarely needed.' },
  { title: 'Discontinue thrombolytic and hold ACE inhibitors', body: 'Stop IV thrombolytic immediately. Hold ACE inhibitors (ACEi-induced angioedema).' },
  { title: 'Medications', body: 'Methylprednisolone 125 mg IV, Diphenhydramine 50 mg IV, Ranitidine 50 mg IV OR Famotidine 20 mg IV.' },
  { title: 'If progression', body: 'Epinephrine 0.1% (1 mg/mL) 0.3 mL SC, OR 0.5 mg nebulized.' },
  { title: 'Advanced (if available)', body: 'Icatibant 30 mg SC (repeat q6h, max 3 doses/24 h), OR C1 esterase inhibitor 20 IU/kg.' },
  { title: 'Supportive care', body: 'Continue airway and hemodynamic support as needed.' },
];

interface OrolingualEdemaProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopySuccess?: () => void;
}

export function OrolingualEdemaProtocolModal(props: OrolingualEdemaProtocolModalProps) {
  return (
    <ProtocolModal
      {...props}
      id="orolingual"
      shortTitle="Orolingual Edema"
      shortSubtitle="AHA/ASA 2026 · Table 6 · Post-thrombolysis"
      fullTitle="Orolingual Angioedema Protocol (Post-Thrombolysis)"
      severity={{
        tone: 'amber',
        eyebrow: 'Airway risk',
        description: (
          <>
            <strong>Lower risk:</strong> Anterior tongue/lips only.{' '}
            <strong>Higher risk:</strong> Larynx, palate, floor of mouth, oropharynx, or rapid progression (&lt;30 min).
          </>
        ),
      }}
      steps={STEPS}
      references={{
        text: 'References: AHA/ASA 2026, Table 6; Refs 53–54.',
      }}
    />
  );
}

export default OrolingualEdemaProtocolModal;
