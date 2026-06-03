/**
 * HemorrhageProtocolModal — thin wrapper over ProtocolModal primitive.
 *
 * Migrated 2026-05-17 from 146 LOC bespoke modal to ~40 LOC data-only
 * wrapper consuming ProtocolModal. All clinical text (TITLE, steps
 * mapped from ICH_PROTOCOL_ITEMS, references + full-guideline link)
 * preserved byte-for-byte from the prior implementation — verbatim
 * from 2022 AHA/ASA Guideline for Management of Patients With
 * Spontaneous ICH (INTERACT2, ATACH-2).
 */
import { ProtocolModal, type ProtocolStep } from './ProtocolModal';
import { ICH_PROTOCOL_ITEMS } from './StrokeIchProtocolStep';

// Map ICH_PROTOCOL_ITEMS shape ({ title, detail, evidence }) → ProtocolStep
// shape ({ title, body, evidence }). Preserves all fields verbatim.
const STEPS: ProtocolStep[] = ICH_PROTOCOL_ITEMS.map((item) => ({
  title: item.title,
  body: item.detail,
  evidence: item.evidence,
}));

interface HemorrhageProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopySuccess?: () => void;
}

export function HemorrhageProtocolModal(props: HemorrhageProtocolModalProps) {
  return (
    <ProtocolModal
      {...props}
      id="hemorrhage"
      shortTitle="Hemorrhage Protocol"
      shortSubtitle="AHA/ASA 2022 · Acute ICH management"
      fullTitle="Hemorrhage Protocol (Acute ICH)"
      severity={{
        tone: 'red',
        eyebrow: 'Thrombolysis contraindicated',
        description: 'Do not give tPA/TNK. Follow acute ICH management. Evidence: INTERACT2, ATACH-2, AHA/ASA ICH guidelines.',
      }}
      steps={STEPS}
      references={{
        text: 'References: 2022 AHA/ASA Guideline for Management of Patients With Spontaneous ICH. INTERACT2; ATACH-2.',
        link: {
          href: 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000407',
          label: 'Full guideline',
        },
      }}
    />
  );
}

export default HemorrhageProtocolModal;
