import React from 'react';
import { Search, Mic } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useSpeech } from '../../hooks/useSpeech';

export default function GlobalHeader({ searchQuery, setSearchQuery, onSearch, onVoiceResult }) {
  const { language } = useApp();
  const { farmerName, isLoggedIn } = useAuth();
  const { listen } = useSpeech();

  const handleVoice = () => {
    listen((txt) => {
      setSearchQuery(txt);
      if (onVoiceResult) onVoiceResult(txt);
      else if (onSearch) onSearch(txt);
    }, language);
  };

  const pills = language === 'KN'
    ? ['ಜೇಡಿಮಣ್ಣಿನಲ್ಲಿ ಗೋಧಿ ಬೆಳೆಗೆ ಗೊಬ್ಬರ','ಟೊಮೇಟೊ ಎಲೆ ರೋಗ ಪತ್ತೆ','ನನ್ನ ಜಮೀನಿನ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ','ಪ್ರಸ್ತುತ ಗೋಧಿ ಮಂಡಿ ಬೆಲೆಗಳು','ಸಣ್ಣ ರೈತರಿಗೆ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು']
    : ['Best fertilizer for wheat in clay soil','Tomato leaf disease detection','Weather forecast for my farm','Current wheat mandi prices','Government schemes for small farmers'];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <form onSubmit={(e) => { e.preventDefault(); onSearch?.(searchQuery); }} className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'KN' ? "ಉದಾ: 'ಜೇಡಿಮಣ್ಣಿನಲ್ಲಿ ಗೋಧಿ ಬೆಳೆಗೆ ಉತ್ತಮ ರಸಗೊಬ್ಬರ'" : "e.g., 'Best fertilizer for wheat in clay soil'"}
            className="w-full pl-10 pr-10 py-2 text-sm bg-[#f7f9f6] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48a956] focus:bg-white transition"
          />
          <button type="button" onClick={handleVoice} title="Speak" className="absolute right-3.5 top-2.5 text-gray-400 hover:text-[#22592d] transition">
            <Mic className="w-4 h-4" />
          </button>
        </form>
        <button onClick={() => {}} className="w-8 h-8 rounded-full bg-[#22592d] text-white flex items-center justify-center font-bold text-xs shadow-sm" title={isLoggedIn ? farmerName : 'Guest'}>
          {isLoggedIn ? farmerName.trim()[0].toUpperCase() : '?'}
        </button>
      </div>
      <div className="max-w-7xl mx-auto flex items-center gap-4 mt-2.5 overflow-x-auto text-xs text-gray-500 pb-1 scrollbar-none">
        {pills.map((pill, idx) => (
          <span key={idx} onClick={() => { setSearchQuery(pill); onSearch?.(pill); }} className="cursor-pointer hover:text-[#22592d] whitespace-nowrap bg-[#f7f9f6] hover:bg-green-50 px-2 py-0.5 rounded border border-gray-100 transition">{pill}</span>
        ))}
      </div>
    </header>
  );
}
