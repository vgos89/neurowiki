// LAYOUT_SPEC §1.2 — Stub. The spec does not describe a drawer in v1.2.
// File reserved for future navigation drawer implementation.
import React from 'react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
    </div>
  );
};
