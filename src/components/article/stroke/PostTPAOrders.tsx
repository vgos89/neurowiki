import React, { useState } from 'react';
import { ClipboardList, BookOpen, ChevronDown, ChevronUp, Printer } from 'lucide-react';

interface Order {
  id: string;
  text: string;
  rationale: string;
  checked: boolean;
}

const ORDERS: Order[] = [
  { id: 'ct_24h', text: 'Repeat CT Brain in 24 hours', rationale: 'Detect hemorrhagic transformation', checked: false },
  { id: 'tele', text: 'Tele monitoring to screen for atrial fibrillation', rationale: 'Identify cardioembolic source', checked: false },
  { id: 'no_lines', text: 'No Foley catheter, NG tube, arterial/central lines × 24h', rationale: 'Minimize bleeding risk from invasive procedures', checked: false },
  { id: 'labs', text: 'Send HbA1C, LDL', rationale: 'Risk factor assessment for secondary prevention', checked: false },
  { id: 'statin', text: 'Start Atorvastatin 80mg qHS (check LFT first)', rationale: 'High-dose statin for secondary prevention', checked: false },
  { id: 'neuro_checks', text: 'Neuro checks and vitals per TNK protocol × 24h', rationale: 'Monitor for complications', checked: false },
  { id: 'no_anticoag', text: 'NO antiplatelet, anticoagulation, SC heparin × 24h', rationale: 'Avoid additional bleeding risk', checked: false },
  { id: 'bp_control', text: 'STRICT BP control: <180/105 × 24 hours', rationale: 'Prevent hemorrhagic transformation', checked: false },
  { id: 'dc_protocol', text: 'D/C TNK and STAT CT if deterioration, headache, BP spike', rationale: 'Early detection of complications', checked: false },
  { id: 'glucose', text: 'Glucose goal <180', rationale: 'Hyperglycemia worsens stroke outcomes', checked: false },
  { id: 'npo', text: 'NPO until swallow screen', rationale: 'Aspiration risk assessment', checked: false },
  { id: 'mri', text: 'MRI brain C- to assess stroke burden', rationale: 'Define extent of infarction', checked: false },
  { id: 'tte', text: 'Transthoracic echocardiogram (TTE)', rationale: 'Evaluate for cardiac source of embolism', checked: false },
  { id: 'antiplatelet', text: 'May start antiplatelet 24h AFTER TNK if no bleeding on f/u imaging', rationale: 'Secondary prevention after safety confirmed', checked: false },
  { id: 'pt_ot', text: 'PT/OT evaluation', rationale: 'Early rehabilitation assessment', checked: false },
];

export const PostTPAOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRationale, setShowRationale] = useState<Record<string, boolean>>({});

  const toggleOrder = (id: string) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, checked: !order.checked } : order
    ));
  };

  const toggleRationale = (id: string) => {
    setShowRationale(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const checkedCount = orders.filter(o => o.checked).length;

  const handlePrint = () => {
    const lines = orders
      .map(order => `[${order.checked ? 'x' : ' '}] ${order.text}`)
      .join('\n');
    const content = `POST-tPA GENERAL ORDERS (${checkedCount}/${orders.length} selected)\n\n${lines}`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(
        `<pre style="font-family:monospace;white-space:pre-wrap;padding:1rem;">${content
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')}</pre>`,
      );
      win.document.close();
      win.print();
      win.close();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
            <ClipboardList className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-900">Post-tPA General Orders</h3>
            <p className="text-sm text-slate-500">
              {checkedCount}/{orders.length} completed
            </p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-3">
          {orders.map(order => (
            <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <label className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={order.checked}
                  onChange={() => toggleOrder(order.id)}
                  className="mt-1 rounded text-blue-600 focus:ring-blue-600 h-5 w-5 flex-shrink-0"
                />
                <div className="flex-1">
                  <div className={`text-sm font-medium ${order.checked ? 'line-through text-gray-400' : 'text-slate-900'}`}>
                    {order.text}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleRationale(order.id);
                    }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                  >
                    <BookOpen className="w-3 h-3" />
                    Why?
                  </button>
                  {showRationale[order.id] && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs text-gray-700">
                      {order.rationale}
                    </div>
                  )}
                </div>
              </label>
            </div>
          ))}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setOrders(prev => prev.map(o => ({ ...o, checked: true })))}
              className="flex-1 py-2 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 transition-colors text-sm"
            >
              Check All
            </button>
            <button
              onClick={() => setOrders(prev => prev.map(o => ({ ...o, checked: false })))}
              className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Order Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
