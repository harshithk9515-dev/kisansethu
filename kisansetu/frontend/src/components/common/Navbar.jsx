import React, { useState } from 'react';
import { LayoutDashboard, Activity, Sprout, ScanLine, TrendingUp, Landmark, History, User, Globe, LogOut, BadgeCheck, CloudSun } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onLoginClick }) {
  const { activeTab, setActiveTab, language, setLanguage } = useApp();
  const { isLoggedIn, farmerName, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const Tab = ({ id, icon: Icon, labelEn, labelKn }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-1.5 py-1 transition cursor-pointer ${activeTab === id ? 'text-[#22592d] border-b-2 border-[#22592d] pb-1 font-semibold' : 'text-slate-600 hover:text-[#22592d]'}`}
    >
      <Icon className="w-3.5 h-3.5" /> {language === 'KN' ? labelKn : labelEn}
    </button>
  );

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-medium text-gray-600">
        <div className="flex items-center gap-6">
          <div onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-[#22592d] font-bold text-base tracking-tight cursor-pointer">
            <div className="w-6 h-6 rounded bg-[#22592d] text-white flex items-center justify-center text-xs">🌾</div>
            KisanSetu
          </div>
          <div className="flex items-center gap-5">
            <Tab id="dashboard" icon={LayoutDashboard} labelEn="Dashboard" labelKn="ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" />
            <Tab id="soil" icon={Activity} labelEn="Soil Health" labelKn="ಮಣ್ಣಿನ ಆರೋಗ್ಯ" />
            <Tab id="crop" icon={Sprout} labelEn="Crop Advice" labelKn="ಬೆಳೆ ಸಲಹೆ" />
            <Tab id="disease" icon={ScanLine} labelEn="Disease Scan" labelKn="ರೋಗ ಸ್ಕ್ಯಾನ್" />
            <Tab id="market" icon={TrendingUp} labelEn="Market Prices" labelKn="ಮಾರುಕಟ್ಟೆ ದರ" />
            <Tab id="weather" icon={CloudSun} labelEn="Weather" labelKn="ಹವಾಮಾನ" />
            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-1.5 text-slate-600 hover:text-[#22592d] py-1 transition"><Landmark className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಯೋಜನೆಗಳು' : 'Govt Schemes'}</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 hover:text-[#22592d]"><History className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಇತಿಹಾಸ' : 'History'}</button>
          {!isLoggedIn ? (
            <>
              <button onClick={onLoginClick} className="flex items-center gap-1.5 bg-[#22592d] hover:bg-[#1b4322] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"><User className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಲಾಗಿನ್' : 'Login'}</button>
              <button onClick={onLoginClick} className={`flex items-center gap-1 py-1 ${activeTab === 'profile' ? 'text-[#22592d] border-b-2 border-[#22592d] font-semibold' : 'hover:text-[#22592d]'}`}><User className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಪ್ರೊಫೈಲ್' : 'Profile'}</button>
            </>
          ) : (
            <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-1 py-1 ${activeTab === 'profile' ? 'text-[#22592d] border-b-2 border-[#22592d] font-semibold' : 'hover:text-[#22592d]'}`}><User className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಪ್ರೊಫೈಲ್' : 'Profile'}</button>
          )}
          <button onClick={() => setLanguage(l => l === 'EN' ? 'KN' : 'EN')} className="flex items-center gap-1.5 bg-[#f7f9f6] hover:bg-gray-100 px-2.5 py-1 rounded text-slate-800 font-semibold border border-gray-200 transition">
            <Globe className="w-3.5 h-3.5 text-[#22592d]" /> {language === 'EN' ? 'English (EN)' : 'ಕನ್ನಡ (KN)'}
          </button>
          {isLoggedIn ? (
            <div className="relative">
              <button onClick={() => setShowProfileMenu(v => !v)} className="flex items-center gap-1.5 text-slate-700 font-semibold hover:text-[#22592d]">
                <span className="w-7 h-7 rounded-full bg-[#22592d] text-white flex items-center justify-center text-xs font-bold">{farmerName.trim()[0].toUpperCase()}</span>
                <span className="hidden sm:inline">{farmerName}</span>
                <BadgeCheck className="w-4 h-4 text-[#48a956] hidden sm:inline" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                  <button onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-[#f7f9f6] flex items-center gap-2"><User className="w-3.5 h-3.5" /> {language === 'KN' ? 'ನನ್ನ ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್' : 'My Farm Profile'}</button>
                  <button onClick={() => { logout(); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2"><LogOut className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಸೈನ್ ಔಟ್' : 'Sign Out'}</button>
                </div>
              )}
            </div>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">?</span> <span className="hidden sm:inline">{language === 'KN' ? 'ಅತಿಥಿ' : 'Guest'}</span></span>
          )}
        </div>
      </div>
    </nav>
  );
}
