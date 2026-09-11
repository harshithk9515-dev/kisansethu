import React, { useState } from 'react';
import { CheckCircle, ShieldCheck, AlertTriangle, Sparkles, Volume2, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useSpeech } from '../../hooks/useSpeech';

function DosageCalculator({ chemical }) {
  const { language } = useApp();
  const { acres } = useAuth();
  const [localAcres, setLocalAcres] = useState(acres || 3.5);
  // Deterministic: 200L per acre, Mancozeb 2.5g/L, cost ~₹445/kg
  const waterLiters = Math.round(localAcres * 200);
  const mancozebKg = Number(((waterLiters * 2.5) / 1000).toFixed(2));
  const cost = Math.round(mancozebKg * 445);
  return (
    <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
      <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2">💰 {language === 'KN' ? 'ಪ್ರಮಾಣ ಮತ್ತು ವೆಚ್ಚ ಕ್ಯಾಲ್ಕುಲೇಟರ್' : 'Dosage & Cost Calculator'}</h4>
      <div className="flex items-center gap-2 mb-3">
        <label className="text-xs font-semibold text-gray-700">{language === 'KN' ? 'ಎಕರೆ:' : 'Acres:'}</label>
        <input type="range" min="0.5" max="10" step="0.5" value={localAcres} onChange={(e) => setLocalAcres(parseFloat(e.target.value))} className="flex-1 accent-[#22592d]" />
        <span className="text-xs font-bold text-[#22592d] bg-white border border-amber-200 px-2 py-1 rounded">{localAcres} {language === 'KN' ? 'ಎಕರೆ' : 'Acres'}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white border border-amber-100 rounded-lg p-2">
          <p className="text-[10px] font-bold text-gray-500 uppercase">{language === 'KN' ? 'ನೀರು' : 'Water'}</p>
          <p className="text-sm font-bold text-gray-900">{waterLiters} L</p>
        </div>
        <div className="bg-white border border-amber-100 rounded-lg p-2">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Mancozeb</p>
          <p className="text-sm font-bold text-gray-900">{mancozebKg} kg</p>
        </div>
        <div className="bg-white border border-amber-100 rounded-lg p-2">
          <p className="text-[10px] font-bold text-gray-500 uppercase">{language === 'KN' ? 'ವೆಚ್ಚ' : 'Cost'}</p>
          <p className="text-sm font-bold text-[#22592d]">~₹{cost}</p>
        </div>
      </div>
      <p className="text-[11px] text-gray-500 mt-2">{language === 'KN' ? `2.5g/L × ${waterLiters}L • ಮಾರುಕಟ್ಟೆ ದರ ₹445/kg` : `2.5g/L × ${waterLiters}L • Market ₹445/kg`} • {chemical?.slice(0, 40)}</p>
    </div>
  );
}

export default function DiagnosisResultCard({ diagnosis, weather, mandiRates, onWhatsApp }) {
  const { language } = useApp();
  const { speak } = useSpeech();

  if (!diagnosis) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="py-12 text-center text-xs text-gray-500">No diagnosis yet</div>
      </div>
    );
  }

  const buildMessage = () => {
    const mandiLine = mandiRates?.[0] ? `${mandiRates[0].crop} @ ${mandiRates[0].mandi} ${mandiRates[0].price} (${mandiRates[0].signal})` : 'Mandi: Check Market Prices';
    return [
      `🌾 KisanSetu — Diagnosis`,
      `🦠 ${diagnosis.disease} (${diagnosis.severity} • ${diagnosis.confidence}) • ${diagnosis.pathogen}`,
      `💊 ${diagnosis.chemical_remedy}`,
      `💰 ${mandiLine}`,
      weather ? `🌤️ ${weather.weather_condition} ${weather.temperature}°C` : '',
      `📞 KCC: 1800-180-1551`,
    ].filter(Boolean).join('\n');
  };

  const share = () => {
    const msg = onWhatsApp ? onWhatsApp() : buildMessage();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <CheckCircle className="w-4 h-4 text-[#48a956]" /> {language === 'KN' ? 'ರೋಗ ನಿರ್ಣಯದ ಫಲಿತಾಂಶಗಳು' : 'Diagnosis Results'}
        </div>
        <span className="text-xs font-semibold text-[#22592d] bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
          {language === 'KN' ? 'ತೀವ್ರತೆ: ' : 'Severity: '}{diagnosis.severity}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center py-4 bg-[#f7f9f6] rounded-xl mb-5">
        <div><h2 className="text-xl font-bold text-gray-900">{diagnosis.disease}</h2><p className="text-xs text-gray-500 mt-0.5">{language === 'KN' ? 'ಪತ್ತೆಯಾದ ರೋಗ' : 'Disease Detected'}</p></div>
        <div><h2 className="text-xl font-bold text-[#22592d]">{diagnosis.confidence}</h2><p className="text-xs text-gray-500 mt-0.5">{language === 'KN' ? 'ಖಚಿತತೆ' : 'Confidence'}</p></div>
        <div><h2 className="text-sm font-bold text-gray-800 mt-1.5">{language === 'KN' ? 'ರೋಗಕಾರಕ: ' : 'Pathogen Type: '}<span className="text-blue-700">{diagnosis.pathogen}</span></h2></div>
      </div>

      <div className="mb-5">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-gray-400" /> {language === 'KN' ? 'ವಿವರಣೆ' : 'Description'}</h3>
        <p className="text-xs leading-relaxed text-gray-600 bg-white border border-gray-100 rounded-lg p-3">{diagnosis.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="border border-green-100 bg-[#f7f9f6] rounded-xl p-4">
          <h4 className="text-xs font-bold text-[#22592d] flex items-center gap-1.5 mb-2"><ShieldCheck className="w-4 h-4 text-[#48a956]" /> {language === 'KN' ? 'ಸಾವಯವ ಪರಿಹಾರ' : 'Organic Remedy'}</h4>
          <p className="text-xs leading-relaxed text-green-950">{diagnosis.organic_remedy}</p>
        </div>
        <div className="border border-red-100 bg-[#fff9f9] rounded-xl p-4">
          <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5 mb-2"><AlertTriangle className="w-4 h-4 text-red-500" /> {language === 'KN' ? 'ರಾಸಾಯನಿಕ ಪರಿಹಾರ' : 'Chemical Remedy'}</h4>
          <p className="text-xs leading-relaxed text-red-950">{diagnosis.chemical_remedy}</p>
        </div>
      </div>

      <DosageCalculator chemical={diagnosis.chemical_remedy} />

      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 rounded-xl p-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" /><span className="text-xs font-bold uppercase tracking-wider text-emerald-900">{language === 'KN' ? 'ಕಿಸಾನ್‌ಸೇತು ಎಐ ಸಲಹೆಗಾರ (ಕನ್ನಡ)' : 'KISANSETHU AI ADVISOR (ENGLISH)'}</span></div>
          <button onClick={() => speak(language === 'KN' ? diagnosis.advisory_kn : diagnosis.advisory_en, language)} className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 px-2.5 py-1 rounded-md hover:bg-emerald-50 transition"><Volume2 className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಧ್ವನಿ ಆಲಿಸಿ' : 'Listen Audio'}</button>
        </div>
        <p className="text-xs text-emerald-950 font-medium leading-relaxed">{language === 'KN' ? diagnosis.advisory_kn : diagnosis.advisory_en}</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button onClick={share} className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-sm transition">
          <MessageCircle className="w-4 h-4" /> {language === 'KN' ? 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ' : 'Share via WhatsApp'}
        </button>
        {(diagnosis.severity === 'Severe' || diagnosis.severity === 'Moderate') && (
          <a href="tel:18001801551" className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-2.5 rounded-lg text-xs font-bold transition">
            <Phone className="w-3.5 h-3.5" /> {language === 'KN' ? '📞 KCC ಟೋಲ್-ಫ್ರೀಗೆ ಕರೆ ಮಾಡಿ (1800-180-1551)' : '📞 Call KCC Toll-Free (1800-180-1551)'}
          </a>
        )}
      </div>
    </div>
  );
}
