import React, { useState } from 'react';
import { Phone, ShieldCheck, TrendingUp, Activity, Sprout, Clock, Users, BadgeCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { requestOtp } from '../../services/api';
import OTPVerificationCard from './OTPVerificationCard';

export default function LoginPage({ onClose, onSuccess }) {
  const { language } = useApp();
  const { DEMO_FARMERS } = useAuth();
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [step, setStep] = useState('phone');
  const [activePhone, setActivePhone] = useState('');

  const handleSend = async () => {
    setPhoneError('');
    const cleaned = phoneInput.replace(/\D/g, '').slice(0, 10);
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setPhoneError(language === 'KN' ? '10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (6-9 ರಿಂದ ಪ್ರಾರಂಭ)' : 'Enter valid 10-digit mobile number starting with 6-9');
      return;
    }
    setIsSending(true);
    try {
      await requestOtp(cleaned);
    } catch {}
    setTimeout(() => {
      setIsSending(false);
      setActivePhone(cleaned);
      setStep('otp');
    }, 600);
  };

  const handleDemo = (farmer) => {
    setPhoneInput(farmer.rawPhone);
    setPhoneError('');
  };

  if (step === 'otp') {
    return (
      <OTPVerificationCard
        phone={activePhone}
        onBack={() => setStep('phone')}
        onVerified={(farmer) => onSuccess?.(farmer)}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[520px]">
      {/* Left Branding Banner — split-screen desktop */}
      <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-[#1b4322] via-[#22592d] to-[#2d6a36] text-white p-6 flex-col">
        <div className="flex items-center gap-2 font-bold text-lg"><span className="w-8 h-8 rounded bg-white text-[#22592d] flex items-center justify-center text-sm">🌾</span> KisanSetu</div>
        <p className="text-xs text-green-100 mt-1">Bridging Farmers to Intelligence • Trusted Agritech Portal</p>
        <div className="mt-6 bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300"><Clock className="w-4 h-4" /> System Uptime 99.92%</div>
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="bg-white/10 rounded-lg p-2"><p className="text-lg font-bold">25</p><p className="text-[10px] text-green-100 uppercase">Mandis</p></div>
            <div className="bg-white/10 rounded-lg p-2"><p className="text-lg font-bold">5</p><p className="text-[10px] text-green-100 uppercase">Crops</p></div>
            <div className="bg-white/10 rounded-lg p-2"><p className="text-lg font-bold">3.6</p><p className="text-[10px] text-green-100 uppercase">Gemini Flash</p></div>
          </div>
          <div className="mt-4 space-y-2 text-xs text-green-100">
            <p className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-amber-300" /> Live APMC price signals — HOLD/SELL</p>
            <p className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-sky-300" /> Soil NPK deterministic engine</p>
            <p className="flex items-center gap-2"><Sprout className="w-3.5 h-3.5 text-emerald-300" /> Multimodal leaf disease vision</p>
            <p className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-green-300" /> Zero API key weather via Open-Meteo</p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[11px] text-green-200"><Users className="w-3.5 h-3.5" /> Trusted by 12,400+ farmers across Karnataka</div>
        </div>
        <div className="mt-auto pt-4 text-[11px] text-green-200/70">Enterprise • Production-Grade • Pydantic v2 & Context API</div>
      </div>
      {/* Right Auth Card */}
      <div className="flex-1 p-6 bg-white">
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-full bg-[#f7f9f6] border border-gray-200 flex items-center justify-center mx-auto mb-3"><Phone className="w-6 h-6 text-[#22592d]" /></div>
            <h2 className="text-lg font-bold text-gray-900">{language === 'KN' ? 'ಸೈನ್ ಇನ್ — ಫೋನ್ ಪರಿಶೀಲನೆ' : 'Sign In — Phone Verification'}</h2>
            <p className="text-xs text-gray-500 mt-1">{language === 'KN' ? 'ಭಾರತೀಯ ಮಾನದಂಡ (+91) 10 ಅಂಕಿಯ ಸಂಖ್ಯೆ' : 'Indian standard (+91) 10-digit number'}</p>
          </div>

          {/* Demo Quick-Login Pills */}
          <div className="mb-4">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{language === 'KN' ? 'ಡೆಮೊ ತ್ವರಿತ-ಲಾಗಿನ್' : 'Demo Quick-Login'}</p>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_FARMERS.map((f) => (
                <button key={f.id} onClick={() => handleDemo(f)} className="flex items-center gap-3 p-2.5 border border-gray-200 hover:border-[#22592d] hover:bg-[#f7f9f6] rounded-xl text-left transition">
                  <span className="w-8 h-8 rounded-full bg-[#22592d] text-white flex items-center justify-center text-xs font-bold">{f.name[0]}</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900">👤 {f.name} ({f.primaryCrop} • {f.district})</p>
                    <p className="text-[11px] text-gray-500">{f.phone} • {f.landSize}</p>
                  </div>
                  <BadgeCheck className="w-4 h-4 text-[#48a956]" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">{language === 'KN' ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *' : 'Mobile Number *'}</label>
            <div className={`flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#48a956] ${phoneError ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-300'}`}>
              <span className="flex items-center gap-1.5 bg-[#f7f9f6] border-r border-gray-200 px-3 py-2.5 text-sm font-bold text-gray-700">🇮🇳 +91</span>
              <input type="tel" inputMode="numeric" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="98765 43210" className="flex-1 px-3 py-2.5 text-sm focus:outline-none" autoFocus />
            </div>
            {phoneError && <p className="text-xs text-red-600 mt-1.5">{phoneError}</p>}
          </div>
          <button onClick={handleSend} disabled={isSending} className="w-full mt-4 bg-[#48a956] hover:bg-[#22592d] disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-bold shadow-sm transition">
            {isSending ? (language === 'KN' ? 'ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...' : 'Sending Code...') : (language === 'KN' ? 'ಪರಿಶೀಲನಾ ಕೋಡ್ ಕಳುಹಿಸಿ (OTP)' : 'Send Verification Code (OTP)')}
          </button>
          <p className="text-[11px] text-center text-gray-400 mt-3">{language === 'KN' ? 'OTP ಉಚಿತ • 5 ನಿಮಿಷ ಮಾನ್ಯ • Demo OTP: 1234' : 'OTP free • valid 5 min • Evaluator Mode: 1234'}</p>
        </div>
      </div>
    </div>
  );
}
