import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function MandiRateGrid({ rates }) {
  const { language } = useApp();
  if (!rates || rates.length === 0) return <p className="text-xs text-gray-500 text-center py-8">{language === 'KN' ? 'ಮಂಡಿ ದರಗಳು ಲಭ್ಯವಿಲ್ಲ' : 'No mandi data'}</p>;
  return (
    <div className="divide-y divide-gray-100">
      {rates.map((m, idx) => (
        <div key={idx} className="py-3.5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800">{m.crop}</h3>
            <p className="text-xs text-gray-500">{m.mandi || m.price || m.modal_price}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{m.price || `₹${m.modal_price}/Q`}</p>
            <span className={`text-xs font-semibold flex items-center gap-0.5 justify-end ${m.trend === 'up' ? 'text-[#22592d]' : m.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
              {m.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : m.trend === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
              {m.change || `${m.change_pct > 0 ? '+' : ''}${m.change_pct}%`}
            </span>
          </div>
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${m.signal === 'HOLD' ? 'bg-amber-100 text-amber-800' : m.signal === 'SELL' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>AI Signal: {m.signal}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
