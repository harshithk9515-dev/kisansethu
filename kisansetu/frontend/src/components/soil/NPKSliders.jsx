import React from 'react';
import { useApp } from '../../context/AppContext';

export default function NPKSliders({ soilInput, setSoilInput, onAnalyze, isAnalyzing }) {
  const { language } = useApp();
  const Slider = ({ label, labelKn, value, min, max, step = 1, field }) => (
    <div className="p-4 bg-[#f7f9f6] rounded-xl border border-gray-100">
      <label className="text-xs font-bold text-gray-600">{language === 'KN' ? labelKn : label}: {value} {field === 'ph' ? '' : 'kg/ha'}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => setSoilInput({ ...soilInput, [field]: parseFloat(e.target.value) })} className="w-full mt-2 accent-[#22592d]" />
    </div>
  );
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Slider label="Nitrogen (N)" labelKn="ಸಾರಜನಕ (N)" value={soilInput.nitrogen} min={0} max={150} field="nitrogen" />
        <Slider label="Phosphorus (P)" labelKn="ರಂಜಕ (P)" value={soilInput.phosphorus} min={0} max={120} field="phosphorus" />
        <Slider label="Potassium (K)" labelKn="ಪೊಟ್ಯಾಶ್ (K)" value={soilInput.potassium} min={0} max={150} field="potassium" />
        <Slider label="Soil pH" labelKn="ಮಣ್ಣಿನ pH" value={soilInput.ph} min={4} max={9} step={0.1} field="ph" />
      </div>
      <div className="flex justify-end mb-6">
        <button onClick={onAnalyze} disabled={isAnalyzing} className="bg-[#48a956] hover:bg-[#22592d] disabled:opacity-50 text-white px-5 py-2 rounded-lg text-xs font-bold transition">
          {isAnalyzing ? (language === 'KN' ? 'ಲೆಕ್ಕಾಚಾರ...' : 'Calculating...') : (language === 'KN' ? 'ಕೊರತೆಯನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ' : 'Calculate Deficiencies')}
        </button>
      </div>
    </>
  );
}
