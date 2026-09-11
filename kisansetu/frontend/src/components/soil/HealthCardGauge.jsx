import React from 'react';
import { useApp } from '../../context/AppContext';

export default function HealthCardGauge({ result }) {
  const { language } = useApp();
  if (!result) return null;
  const score = result.suitability_score;
  const color = score >= 80 ? 'text-[#22592d] border-[#22592d]' : score >= 60 ? 'text-amber-600 border-amber-500' : 'text-red-600 border-red-500';
  return (
    <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-emerald-900 uppercase">{language === 'KN' ? 'ಕೃಷಿ ತಜ್ಞರ ಶಿಫಾರಸು' : 'Agronomic Soil Recommendation'}</span>
        <span className={`text-xs font-bold px-2 py-0.5 bg-white rounded border ${color}`}>{language === 'KN' ? 'ಸೂಕ್ತತೆಯ ಅಂಕ: ' : 'Suitability Score: '}{score}/100</span>
      </div>
      <p className="text-xs text-emerald-950 font-medium leading-relaxed">{result.recommendation}</p>
      {result.deficiencies?.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-bold text-gray-600 uppercase">Deficiencies</p>
          <ul className="text-xs text-gray-700 list-disc list-inside mt-1">
            {result.deficiencies.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
