import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'calculator' | 'pathway';
  path: string;
}

interface ToolManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTools: string[];
  onToolsChange: (toolIds: string[]) => void;
}

// All available tools
const ALL_TOOLS: Tool[] = [
  { id: 'nihss', name: 'NIHSS', description: 'NIH Stroke Scale assessment', category: 'vascular', type: 'calculator', path: '/calculators/nihss' },
  { id: 'evt-pathway', name: 'Thrombectomy Pathway', description: 'EVT eligibility for early and late windows', category: 'vascular', type: 'pathway', path: '/calculators/evt-pathway' },
  { id: 'elan-pathway', name: 'ELAN Protocol', description: 'DOAC timing after ischemic stroke with AF', category: 'vascular', type: 'pathway', path: '/calculators/elan-pathway' },
  { id: 'se-pathway', name: 'Status Epilepticus', description: 'Stage 1–3 SE management pathway', category: 'epilepsy', type: 'pathway', path: '/calculators/se-pathway' },
  { id: 'migraine-pathway', name: 'Migraine & Headache', description: 'ED and inpatient management', category: 'headache', type: 'pathway', path: '/calculators/migraine-pathway' },
  { id: 'gca-pathway', name: 'GCA / PMR Pathway', description: 'Suspected giant cell arteritis workup', category: 'headache', type: 'pathway', path: '/calculators/gca-pathway' },
];

// Category color mapping
const categoryColors: Record<string, string> = {
  vascular: 'bg-red-500',
  epilepsy: 'bg-amber-500',
  headache: 'bg-blue-500',
  neuromuscular: 'bg-emerald-500',
  general: 'bg-slate-400',
};

const ToolManagerModal: React.FC<ToolManagerModalProps> = ({
  isOpen,
  onClose,
  selectedTools,
  onToolsChange,
}) => {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedTools);

  useEffect(() => {
    setLocalSelected(selectedTools);
  }, [selectedTools, isOpen]);

  if (!isOpen) return null;

  const toggleTool = (toolId: string) => {
    setLocalSelected((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleSave = () => {
    onToolsChange(localSelected);
    onClose();
  };

  const handleDelete = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalSelected((prev) => prev.filter((id) => id !== toolId));
  };

  // Group tools by category
  const groupedTools = ALL_TOOLS.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  const selectedToolsList = ALL_TOOLS.filter((tool) => localSelected.includes(tool.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Manage Tools</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Selected Tools Section */}
          {selectedToolsList.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Selected Tools</h3>
              <div className="space-y-2">
                {selectedToolsList.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 ${categoryColors[tool.category] || 'bg-slate-400'} rounded-sm`}></div>
                      <div>
                        <div className="font-medium text-slate-900">{tool.name}</div>
                        <div className="text-xs text-slate-500">{tool.description}</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(tool.id, e)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Remove ${tool.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Tools Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Available Tools</h3>
            <div className="space-y-4">
              {Object.entries(groupedTools).map(([category, tools]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 ${categoryColors[category] || 'bg-slate-400'} rounded-sm`}></div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {category}
                    </span>
                  </div>
                  <div className="space-y-2 pl-4">
                    {tools.map((tool) => {
                      const isSelected = localSelected.includes(tool.id);
                      return (
                        <button
                          key={tool.id}
                          onClick={() => toggleTool(tool.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                            isSelected
                              ? 'bg-neuro-50 border-neuro-200'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-slate-900">{tool.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{tool.description}</div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-neuro-500 border-neuro-500'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-neuro-500 hover:bg-neuro-600 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolManagerModal;
