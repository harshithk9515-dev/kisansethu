import React from 'react';
import { Sparkles, Volume2, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSpeech } from '../../hooks/useSpeech';

export default function UnifiedDecisionHero({ weather, onWhatsApp }) {
  const { language, orchestratedPlan, diagnosis } = useApp();
  const { speak } = useSpeech();
  const advisory = language === 'KN' ? orchestratedPlan.executive_advisory_kn : orchestratedPlan.executive_advisory_en;
  const share = () => {
    const mandiLine = 'Tomato @ Kolar ₹2,400/Q (HOLD)';
    const msg = [
      `🌾 KisanSetu — Today's Unified Strategy`,
      `📋 ${advisory}`,
      `✅ Priority: ${orchestratedPlan.priority_action}`,
      `🦠 ${diagnosis.disease} (${diagnosis.severity}) • 💊 ${diagnosis.chemical_remedy}`,
      `💰 ${mandiLine}`,
      weather ? `🌤️ ${weather.weather_condition} ${weather.temperature}°C` : '',
      `📞 KCC: 1800-180-1551`,
    ].filter(Boolean).join('\n');
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(onWhatsApp ? onWhatsApp() : msg)}`;
    window.open(url, '_blank');
  };
  return (
    <div className="p-6 bg-gradient-to-r from-[#1b4322] to-[#22592d] rounded-2xl text-white shadow-md">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        <h2 className="text-lg font-bold">{language === 'KN' ? 'ಇಂದಿನ ಕೃಷಿ ನಿರ್ಧಾರ ಯೋಜನೆ (ಕೋಲಾರ)' : "Today's Unified Strategy (Kolar Plot #2)"}</h2>
      </div>
      <p className="text-xs text-green-100 leading-relaxed mb-4">{advisory}</p>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs bg-amber-400 text-slate-900 font-bold px-3 py-1.5 rounded-lg">{language === 'KN' ? 'ಮುಖ್ಯ ಕ್ರಮ: ' : 'Priority: '}{orchestratedPlan.priority_action}</span>
        <button onClick={() => speak(advisory, language)} className="bg-white text-[#22592d] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#f7f9f6] flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಧ್ವನಿ ಆಲಿಸಿ' : 'Listen Briefing'}</button>
        <button onClick={share} className="bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> {language === 'KN' ? 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ' : 'Share via WhatsApp'}</button>
        {(diagnosis.severity === 'Severe' || diagnosis.severity === 'Moderate') && (
          <a href="tel:18001801551" className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold"><Phone className="w-3.5 h-3.5" /> {language === 'KN' ? '📞 KCC (1800-180-1551)' : '📞 Call KCC (1800-180-1551)'}</a>
        )}
      </div>
    </div>
  );
}
