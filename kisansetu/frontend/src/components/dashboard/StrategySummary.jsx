import React from 'react';
import { ScanLine, Activity, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function StrategySummary({ onNavigate }) {
  const { language, diagnosis, soilResult } = useApp();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div onClick={() => onNavigate('disease')} className="p-5 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-[#22592d] transition shadow-sm">
        <ScanLine className="w-6 h-6 text-[#22592d] mb-2" />
        <h3 className="font-bold text-sm text-gray-800">{language === 'KN' ? 'ಎಲೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' : 'Scan Crop Leaves'}</h3>
        <p className="text-xs text-gray-500 mt-1">{diagnosis.disease} ({diagnosis.severity})</p>
      </div>
      <div onClick={() => onNavigate('soil')} className="p-5 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-[#22592d] transition shadow-sm">
        <Activity className="w-6 h-6 text-[#22592d] mb-2" />
        <h3 className="font-bold text-sm text-gray-800">{language === 'KN' ? 'ಮಣ್ಣಿನ ಸ್ಥಿತಿ' : 'Check Soil Health'}</h3>
        <p className="text-xs text-gray-500 mt-1">{soilResult.status} ({soilResult.suitability_score}/100)</p>
      </div>
      <div onClick={() => onNavigate('market')} className="p-5 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-[#22592d] transition shadow-sm">
        <TrendingUp className="w-6 h-6 text-[#22592d] mb-2" />
        <h3 className="font-bold text-sm text-gray-800">{language === 'KN' ? 'ಮಂಡಿ ಬೆಲೆ ಸೂಚನೆ' : 'Mandi Price Surge'}</h3>
        <p className="text-xs text-gray-500 mt-1">Tomato up +12% in Kolar. Signal: HOLD.</p>
      </div>
    </div>
  );
}
