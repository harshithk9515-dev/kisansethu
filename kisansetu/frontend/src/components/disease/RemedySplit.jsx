import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function RemedySplit({ organic, chemical }) {
  const { language } = useApp();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border border-green-100 bg-[#f7f9f6] rounded-xl p-4">
        <h4 className="text-xs font-bold text-[#22592d] flex items-center gap-1.5 mb-2"><ShieldCheck className="w-4 h-4 text-[#48a956]" /> {language === 'KN' ? 'ಸಾವಯವ ಪರಿಹಾರ' : 'Organic Remedy'}</h4>
        <p className="text-xs leading-relaxed text-green-950">{organic}</p>
      </div>
      <div className="border border-red-100 bg-[#fff9f9] rounded-xl p-4">
        <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5 mb-2"><AlertTriangle className="w-4 h-4 text-red-500" /> {language === 'KN' ? 'ರಾಸಾಯನಿಕ ಪರಿಹಾರ' : 'Chemical Remedy'}</h4>
        <p className="text-xs leading-relaxed text-red-950">{chemical}</p>
      </div>
    </div>
  );
}
