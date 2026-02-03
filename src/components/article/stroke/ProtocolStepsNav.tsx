import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

export interface Step {
  id: number;
  title: string;
  status: 'completed' | 'active' | 'locked';
}

interface ProtocolStepsNavProps {
  steps: Step[];
  onStepClick?: (stepId: number) => void;
}

export const ProtocolStepsNav: React.FC<ProtocolStepsNavProps> = ({ steps, onStepClick }) => {
  const getStepIcon = (status: Step['status'], stepId: number) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4" />
          </div>
        );
      case 'active':
        return (
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">
            {stepId}
          </div>
        );
      case 'locked':
        return (
          <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center flex-shrink-0 font-bold text-xs">
            {stepId}
          </div>
        );
    }
  };

  const getStepTextColor = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return 'text-gray-600';
      case 'active':
        return 'text-blue-600 font-semibold';
      case 'locked':
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
      {/* Header */}
      <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
        Protocol Steps
      </h3>

      {/* Steps List - 44px touch targets */}
      <div className="space-y-1">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => onStepClick?.(step.id)}
            disabled={step.status === 'locked'}
            className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left ${
              step.status === 'locked'
                ? 'cursor-not-allowed opacity-60'
                : step.status === 'active'
                ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
                : 'hover:bg-gray-50 cursor-pointer'
            }`}
          >
            {getStepIcon(step.status, step.id)}
            <span className={`text-sm flex-1 ${getStepTextColor(step.status)}`}>
              {step.id}. {step.title}
            </span>
            {step.status === 'active' && (
              <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
