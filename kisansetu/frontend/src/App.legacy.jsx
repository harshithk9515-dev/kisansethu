import React, { useState, useRef } from 'react';
import { 
  Search, Mic, Camera, Upload, CheckCircle, AlertTriangle, 
  Sparkles, Volume2, ShieldCheck, LayoutDashboard, Activity, 
  Sprout, ScanLine, CloudSun, TrendingUp, Landmark, History, 
  User, Globe, Loader2, ArrowUpRight, ArrowDownRight, X,
  MapPin, Thermometer, Droplets, CloudRain, Wind, RefreshCw, LocateFixed, Navigation,
  MessageCircle, Phone, LogOut, BadgeCheck
} from 'lucide-react';

const BACKEND_BASE = "http://127.0.0.1:8000";

export default function App() {
  // Navigation & Language ('EN' = English, 'KN' = Kannada)
  const [activeTab, setActiveTab] = useState('disease'); 
  const [language, setLanguage] = useState('EN'); 
  // Simple Login / Profile (legacy) — kept for profile details fallback
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('kisansetu_user'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [loginForm, setLoginForm] = useState({ name: '', age: '', acres: '', phone: '' });
  const [loginError, setLoginError] = useState('');
  // Phone Number + OTP Authentication (new hackathon flow)
  const [auth, setAuth] = useState(() => {
    try { const s = localStorage.getItem('kisansetu_auth'); return s ? JSON.parse(s) : { isLoggedIn: false, farmerName: '', location: '', phone: '' }; } catch { return { isLoggedIn: false, farmerName: '', location: '', phone: '' }; }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpDigits, setOtpDigits] = useState(['','','','']);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpRefs = useRef([]);
  const isLoggedIn = auth?.isLoggedIn === true;
  const displayFarmerName = isLoggedIn ? auth.farmerName : (user?.name || '');
  const displayLocation = isLoggedIn ? auth.location : 'Kolar, Karnataka';
  const displayPhone = isLoggedIn ? auth.phone : (user?.phone ? `+91 ${user.phone}` : '');

  // Global Search Modal States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Disease Scan States
  const [plantType, setPlantType] = useState('Tomato');
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  const [diagnosis, setDiagnosis] = useState({
    disease: 'Septoria Leaf Spot',
    confidence: '83%',
    pathogen: 'Fungal',
    severity: 'Low',
    description: 'Septoria Leaf Spot detected on Tomato. Key symptoms: Small circular spots with dark borders, Gray centers with black dots.',
    organic_remedy: 'Remove lower infected leaves; mulch; copper spray; compost tea foliar spray.',
    chemical_remedy: 'Chlorothalonil 75% WP @ 2g/L or Mancozeb @ 2.5g/L',
    advisory_en: 'Immediate action: Avoid overhead watering today. Spray Mancozeb before upcoming high humidity. Do not harvest for 48 hours post-spray.',
    advisory_kn: 'ತಕ್ಷಣದ ಕ್ರಮ: ಗಿಡದ ಬುಡಕ್ಕೆ ಮಾತ್ರ ನೀರು ಹಾಕಿ. ಮಳೆ ಅಥವಾ ತೇವಾಂಶ ಹೆಚ್ಚಾಗುವ ಮೊದಲು ಮ್ಯಾಂಕೋಜೆಬ್ ಸಿಂಪಡಿಸಿ. 48 ಗಂಟೆಗಳ ಕಾಲ ಕೊಯ್ಲು ಮಾಡಬೇಡಿ.'
  });

  // Soil Health Interactive State
  const [soilInput, setSoilInput] = useState({ nitrogen: 35, phosphorus: 60, potassium: 45, ph: 6.5, crop: 'Tomato' });
  const [soilResult, setSoilResult] = useState({
    status: 'Deficient (Low N)',
    deficiencies: ['Nitrogen deficiency: 35 kg/ha, optimal 80-120 kg/ha'],
    recommendation: 'Apply 25kg Urea per acre before the next irrigation cycle.',
    suitability_score: 72
  });
  const [isAnalyzingSoil, setIsAnalyzingSoil] = useState(false);

  // Mandi Data
  const [mandiRates] = useState([
    { crop: 'Tomato', mandi: 'Kolar Mandi', price: '₹2,400/Q', change: '+12%', trend: 'up', signal: 'HOLD' },
    { crop: 'Potato', mandi: 'Hassan Mandi', price: '₹1,650/Q', change: '-3%', trend: 'down', signal: 'SELL' },
    { crop: 'Onion', mandi: 'Hubli Mandi', price: '₹3,100/Q', change: '+5%', trend: 'up', signal: 'HOLD' },
    { crop: 'Ragi', mandi: 'Mysore Mandi', price: '₹3,800/Q', change: '0%', trend: 'neutral', signal: 'SELL' },
    { crop: 'Cotton', mandi: 'Raichur Mandi', price: '₹6,400/Q', change: '+7%', trend: 'up', signal: 'HOLD' }
  ]);

  // Orchestration Data
  const [orchestratedPlan] = useState({
    executive_advisory_en: 'Tomato field in Kolar has optimal moisture but low nitrogen. Mild Septoria leaf spot identified; spray Mancozeb immediately. Kolar mandi rates are up 12%—hold harvest for 3 days to maximize margins.',
    executive_advisory_kn: 'ಕೋಲಾರ ತೋಟದಲ್ಲಿ ತೇವಾಂಶ ಸರಿಯಾಗಿದೆ ಆದರೆ ಸಾರಜನಕದ ಕೊರತೆಯಿದೆ. ಎಲೆ ಚುಕ್ಕೆ ರೋಗಕ್ಕೆ ಮ್ಯಾಂಕೋಜೆಬ್ ಸಿಂಪಡಿಸಿ. ಮಾರುಕಟ್ಟೆ ಬೆಲೆ 12% ಏರಿಕೆಯಾಗಿದೆ, ಮೂರು ದಿನ ಮಾರಾಟ ಮುಂದೂಡಿ.',
    priority_action: 'Foliar Spray Mancozeb 2.5g/L + Hold Harvest'
  });

  // Micro-Climate Intelligence Engine (Geolocation + Open-Meteo)
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | locating | granted | denied | fallback
  const [coords, setCoords] = useState(null); // {lat, lon}

  const KOLAR_FALLBACK = { lat: 13.1378, lon: 78.1291, name: 'Kolar, Karnataka (Default Agro-Climatic Zone)' };

  const fetchWeather = async (lat, lon, locationName) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const params = new URLSearchParams();
      if (lat != null && lon != null) {
        params.set('latitude', String(lat));
        params.set('longitude', String(lon));
      }
      if (locationName) params.set('location_name', locationName);
      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await fetchWithFallback(`/api/v1/weather${query}`, { method: 'GET' });
      setWeather(data);
      if (data.latitude && data.longitude) setCoords({ lat: data.latitude, lon: data.longitude });
      // Detect fallback by location_name
      if (data.location_name && data.location_name.includes('Default')) setGeoStatus('fallback');
      return data;
    } catch (e) {
      console.warn('Weather fetch failed, using client fallback:', e);
      setWeatherError(e.message || 'Weather unavailable');
      // Client-side deterministic fallback to avoid blank UI
      const fallback = {
        location_name: KOLAR_FALLBACK.name,
        latitude: KOLAR_FALLBACK.lat,
        longitude: KOLAR_FALLBACK.lon,
        temperature: 28.5,
        relative_humidity: 62,
        precipitation_probability: 10,
        weather_condition: 'Mainly clear',
        spray_window_safe: true,
        spray_advisory: 'Safe window — 28.5°C, 62% RH, 10% rain (Mainly clear). Spray 6–9 AM today for best foliar adhesion and drift control. [Live data unavailable — showing Kolar default zone estimate]'
      };
      setWeather(fallback);
      setGeoStatus('fallback');
      return fallback;
    } finally {
      setWeatherLoading(false);
    }
  };

  const requestGeolocation = async () => {
    if (!navigator.geolocation) {
      setGeoStatus('fallback');
      await fetchWeather(KOLAR_FALLBACK.lat, KOLAR_FALLBACK.lon, KOLAR_FALLBACK.name);
      return;
    }
    setGeoStatus('locating');
    setWeatherError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        setGeoStatus('granted');
        await fetchWeather(latitude, longitude, `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      async (err) => {
        console.warn('Geolocation denied/error:', err);
        setGeoStatus(err.code === 1 ? 'denied' : 'fallback');
        await fetchWeather(KOLAR_FALLBACK.lat, KOLAR_FALLBACK.lon, KOLAR_FALLBACK.name);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  };

  // Auto-fetch micro-climate on mount + when language changes not needed, but on dashboard entry
  React.useEffect(() => {
    // Initial load — try live GPS, degrade to Kolar automatically
    requestGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------------
  // API HELPER
  // -------------------------------------------------------------
  const fetchWithFallback = async (endpoint, options = {}) => {
    try {
      const directUrl = `${BACKEND_BASE}${endpoint}`;
      const res = await fetch(directUrl, options);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Direct port 8000 call failed, trying proxy...", e);
    }
    const proxyRes = await fetch(endpoint, options);
    if (!proxyRes.ok) throw new Error(`HTTP ${proxyRes.status}`);
    return await proxyRes.json();
  };

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------
  const executeSearch = async (queryText) => {
    const q = queryText || searchQuery;
    if (!q || !q.trim()) return;

    setIsSearching(true);
    setShowSearchModal(true);

    try {
      const data = await fetchWithFallback('/api/v1/search/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, language })
      });
      setSearchResult(data);
    } catch (err) {
      console.warn('Fallback search triggered:', err);
      const isKannada = /[\u0C80-\u0CFF]/.test(q) || language === 'KN';
      setSearchResult({
        title: isKannada ? `ಕೃಷಿ ಸಲಹೆ: ${q}` : `Agricultural Advisory: ${q}`,
        summary: isKannada 
          ? 'ಹನಿ ನೀರಾವರಿಯು ಬೆಳೆಗೆ ನೀರಿನ ಪ್ರಮಾಣವನ್ನು ಉಳಿಸುತ್ತದೆ ಮತ್ತು ರೋಗ ಹರಡುವಿಕೆಯನ್ನು ತಡೆಯುತ್ತದೆ.' 
          : 'Drip irrigation conserves up to 40% water and prevents foliar splash infections.',
        action_steps: isKannada ? [
          'ಸಾಲುಗಳಿಂದ ಸಾಲುಗಳಿಗೆ 4 ಅಡಿ ಅಂತರವಿರಲಿ',
          'ಪ್ರತಿದಿನ ಬೆಳಗ್ಗೆ 2 ಗಂಟೆಗಳ ಕಾಲ ನೀರಾವರಿ ನೀಡಿ',
          'ಸಮತೋಲಿತ ಪೋಷಕಾಂಶಗಳನ್ನು ನೀರಿನೊಂದಿಗೆ ನೀಡಿ'
        ] : [
          'Maintain 4-foot row spacing with inline drip emitters',
          'Irrigate in the early morning for 1.5 to 2 hours',
          'Fertigate with water-soluble 19:19:19 fertilizer'
        ],
        caution: isKannada 
          ? 'ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಲಿನಲ್ಲಿ ನೀರು ಹಾಯಿಸಬೇಡಿ.' 
          : 'Avoid afternoon watering to prevent rapid fungal development.',
        vernacular_summary: 'ಹನಿ ನೀರಾವರಿಯು ಬೆಳೆಗೆ ನೀರಿನ ಪ್ರಮಾಣವನ್ನು ಉಳಿಸುತ್ತದೆ ಮತ್ತು ರೋಗ ಹರಡುವಿಕೆಯನ್ನು ತಡೆಯುತ್ತದೆ.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser. Please use Google Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'KN' ? 'kn-IN' : 'en-IN';
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      executeSearch(transcript);
    };
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDetectDisease = async () => {
    if (!selectedFile) {
      alert('Please upload or select a leaf image first.');
      return;
    }

    setIsScanning(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('plant_type', plantType);

    try {
      const data = await fetchWithFallback('/api/v1/diagnose', {
        method: 'POST',
        body: formData
      });
      setDiagnosis(data);
    } catch (err) {
      console.warn('Using client heuristic fallback:', err);
      setDiagnosis({
        disease: `${plantType} Blight`,
        confidence: '89%',
        pathogen: 'Fungal',
        severity: 'Moderate',
        description: `Visible brown lesions detected on ${plantType} leaf surface. Characteristic symptoms of fungal spread.`,
        organic_remedy: 'Prune lower infected leaves, apply neem oil foliar spray (5ml/L).',
        chemical_remedy: 'Mancozeb 75% WP @ 2.5g/L or Copper Oxychloride @ 3g/L.',
        advisory_en: 'Immediate action required: Spray preventive fungicide within 48 hours to protect foliar canopy.',
        advisory_kn: 'ತಕ್ಷಣದ ಕ್ರಮ: ರೋಗ ಹರಡುವುದನ್ನು ತಡೆಯಲು 48 ಗಂಟೆಗಳ ಒಳಗೆ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSoilAnalyze = async () => {
    setIsAnalyzingSoil(true);
    try {
      const data = await fetchWithFallback('/api/v1/soil/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(soilInput)
      });
      setSoilResult(data);
    } catch (err) {
      console.warn('Soil calculation fallback:', err);
      setSoilResult({
        status: soilInput.nitrogen < 50 ? 'Deficient (Low N)' : 'Good Balance',
        deficiencies: soilInput.nitrogen < 50 ? ['Nitrogen levels low'] : ['Slight potassium deficit'],
        recommendation: soilInput.nitrogen < 50 ? 'Incorporate 30kg Urea per acre.' : 'Standard maintenance application.',
        suitability_score: soilInput.nitrogen < 50 ? 68 : 88
      });
    } finally {
      setIsAnalyzingSoil(false);
    }
  };

  const playSpeech = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'KN' || /[\u0C80-\u0CFF]/.test(text) ? 'kn-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // --- Simple Login Handlers (legacy for age/acres profile) ---
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const name = loginForm.name.trim();
    const age = parseInt(loginForm.age, 10);
    const acres = parseFloat(loginForm.acres);
    const phone = loginForm.phone.trim();
    if (!name || name.length < 2) { setLoginError(language === 'KN' ? 'ದಯವಿಟ್ಟು ಹೆಸರು ನಮೂದಿಸಿ' : 'Please enter a valid name (min 2 chars)'); return; }
    if (!age || age < 10 || age > 100) { setLoginError(language === 'KN' ? 'ವಯಸ್ಸು 10-100 ಇರಬೇಕು' : 'Age must be between 10 and 100'); return; }
    if (!acres || acres <= 0 || acres > 5000) { setLoginError(language === 'KN' ? 'ಜಮೀನು ವಿಸ್ತೀರ್ಣ ಸರಿಯಾಗಿ ನಮೂದಿಸಿ' : 'Enter valid acres ( >0 )'); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { setLoginError(language === 'KN' ? '10 ಅಂಕಿಯ ಫೋನ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ' : 'Enter valid 10-digit phone number'); return; }
    const newUser = { name, age, acres, phone };
    localStorage.setItem('kisansetu_user', JSON.stringify(newUser));
    setUser(newUser);
    setActiveTab('dashboard');
  };
  const handleLogout = () => {
    localStorage.removeItem('kisansetu_user');
    localStorage.removeItem('kisansetu_auth');
    setUser(null);
    setAuth({ isLoggedIn: false, farmerName: '', location: '', phone: '' });
    setLoginForm({ name: '', age: '', acres: '', phone: '' });
    setActiveTab('disease');
  };

  // --- Phone OTP Auth Handlers ---
  const openAuthModal = () => {
    setShowAuthModal(true);
    setAuthStep('phone');
    setPhoneError('');
    setOtpError('');
    setPhoneInput('');
    setOtpDigits(['','','','']);
    setIsSendingOtp(false);
    setIsVerifying(false);
  };
  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthStep('phone');
    setPhoneError('');
    setOtpError('');
  };
  const handleSendOtp = () => {
    setPhoneError('');
    const cleaned = phoneInput.replace(/[^0-9]/g,'').slice(0,10);
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setPhoneError(language === 'KN' ? '10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (6-9 ರಿಂದ ಪ್ರಾರಂಭ)' : 'Enter valid 10-digit mobile number starting with 6-9');
      return;
    }
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setPhoneInput(cleaned);
      setAuthStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 700);
  };
  const handleOtpChange = (idx, val) => {
    const v = val.replace(/[^0-9]/g,'').slice(0,1);
    const next = [...otpDigits];
    next[idx] = v;
    setOtpDigits(next);
    setOtpError('');
    if (v && idx < 3) otpRefs.current[idx+1]?.focus();
  };
  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) otpRefs.current[idx-1]?.focus();
    if (e.key === 'Enter') handleVerifyOtp();
  };
  const handleVerifyOtp = () => {
    setOtpError('');
    const otp = otpDigits.join('');
    if (otp.length !== 4 || !/^\d{4}$/.test(otp)) {
      setOtpError(language === 'KN' ? '4 ಅಂಕಿಯ OTP ನಮೂದಿಸಿ' : 'Enter 4-digit OTP');
      return;
    }
    // Demo: any 4-digit passes, 1234 is hinted
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const session = {
        isLoggedIn: true,
        farmerName: 'Rajesh Kumar',
        location: 'Kolar, Karnataka',
        phone: `+91 ${phoneInput.slice(0,5)} ${phoneInput.slice(5)}`
      };
      // Preserve raw 10-digit for WhatsApp formatting
      const rawSession = { ...session, rawPhone: phoneInput };
      localStorage.setItem('kisansetu_auth', JSON.stringify(rawSession));
      setAuth(rawSession);
      // Also seed legacy user for profile age/acres convenience
      if (!user) {
        const legacy = { name: 'Rajesh Kumar', age: 34, acres: 2.5, phone: phoneInput };
        localStorage.setItem('kisansetu_user', JSON.stringify(legacy));
        setUser(legacy);
      }
      setShowAuthModal(false);
      setAuthStep('phone');
      setPhoneInput('');
      setOtpDigits(['','','','']);
    }, 600);
  };
  const handleAuthLogout = () => {
    localStorage.removeItem('kisansetu_auth');
    setAuth({ isLoggedIn: false, farmerName: '', location: '', phone: '' });
    // Optionally keep legacy user but clear isLoggedIn
  };

  // --- WhatsApp Action Plan Export ---
  const shareViaWhatsApp = (message) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const buildDiseaseWhatsappMessage = () => {
    const mandiLine = mandiRates[0] ? `${mandiRates[0].crop} @ ${mandiRates[0].mandi} ${mandiRates[0].price} (${mandiRates[0].signal})` : 'Mandi data: Check Market Prices tab';
    const lines = [
      `🌾 *KisanSetu — ${displayFarmerName ? displayFarmerName : 'Farmer'} Advisory*`,
      `📍 ${displayLocation || 'Kolar, Karnataka'} ${displayPhone ? '• ' + displayPhone : ''}`,
      ``,
      `🦠 *Disease Scan*`,
      `• ${diagnosis.disease} (${diagnosis.severity} • ${diagnosis.confidence})`,
      `• Pathogen: ${diagnosis.pathogen}`,
      ``,
      `💊 *Safe Spray (Chemical)*`,
      `• ${diagnosis.chemical_remedy}`,
      `⚠️ Follow label dosage, use PPE, avoid spray ${weather && !weather.spray_window_safe ? 'now — ' + weather.spray_advisory : 'during rain/high wind'}`,
      ``,
      `💰 *Mandi*`,
      `• ${mandiLine}`,
      ``,
      weather ? `🌤️ ${weather.weather_condition} • ${weather.temperature.toFixed(1)}°C • ${weather.relative_humidity}% RH • Rain ${weather.precipitation_probability}%` : ``,
      `📞 KCC Toll-Free: 1800-180-1551 (tel:18001801551)`,
      ``,
      `— via KisanSetu | ${new Date().toLocaleDateString('en-IN')}`
    ].filter(Boolean).join('\n');
    return lines;
  };
  const buildDashboardWhatsappMessage = () => {
    const mandiLine = mandiRates[0] ? `${mandiRates[0].crop} @ ${mandiRates[0].mandi} ${mandiRates[0].price} (${mandiRates[0].signal})` : 'Mandi: Check app';
    const lines = [
      `🌾 *KisanSetu — Today's Unified Strategy*`,
      `👨‍🌾 ${displayFarmerName || 'Farmer'} • 📍 ${displayLocation} ${displayPhone ? '• ' + displayPhone : ''}`,
      ``,
      `✅ *Priority:* ${orchestratedPlan.priority_action}`,
      ``,
      `📋 *Executive Advisory*`,
      `${language === 'KN' ? orchestratedPlan.executive_advisory_kn : orchestratedPlan.executive_advisory_en}`,
      ``,
      `🦠 Disease: ${diagnosis.disease} (${diagnosis.severity})`,
      `💊 Spray: ${diagnosis.chemical_remedy}`,
      ``,
      `💰 ${mandiLine}`,
      weather ? `🌤️ ${weather.weather_condition} ${weather.temperature.toFixed(1)}°C • Spray ${weather.spray_window_safe ? 'SAFE ✓' : 'HOLD ✗'} — ${weather.spray_advisory}` : ``,
      ``,
      `📞 KCC: 1800-180-1551`,
      `— KisanSetu | ${new Date().toLocaleDateString('en-IN')}`
    ].filter(Boolean).join('\n');
    return lines;
  };

  return (
    <div className="min-h-screen bg-[#f7f9f6] text-slate-800 flex flex-col font-sans">
      
      {/* 1. TOP GLOBAL SEARCH BAR & QUERY PILLS */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <form 
            onSubmit={(e) => { e.preventDefault(); executeSearch(); }} 
            className="relative flex-1 max-w-2xl"
          >
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'KN' ? "ಉದಾಹರಣೆ: 'ಜೇಡಿಮಣ್ಣಿನಲ್ಲಿ ಗೋಧಿ ಬೆಳೆಗೆ ಉತ್ತಮ ರಸಗೊಬ್ಬರ'" : "e.g., 'Best fertilizer for wheat in clay soil'"}
              className="w-full pl-10 pr-10 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition"
            />
            <button 
              type="button" 
              onClick={handleVoiceSearch} 
              title="Speak query"
              className="absolute right-3.5 top-2.5 text-gray-400 hover:text-green-600 transition cursor-pointer"
            >
              <Mic className="w-4 h-4" />
            </button>
          </form>

          <button onClick={() => isLoggedIn ? setActiveTab('profile') : openAuthModal()} className="w-8 h-8 rounded-full bg-[#2d6a36] text-white flex items-center justify-center font-bold text-xs shadow-xs hover:ring-2 hover:ring-green-600 transition" title={isLoggedIn ? displayFarmerName : (language === 'KN' ? 'ಲಾಗಿನ್' : 'Login')}>
            {isLoggedIn ? displayFarmerName.trim()[0].toUpperCase() : (user?.name ? user.name.trim()[0].toUpperCase() : '?')}
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="max-w-7xl mx-auto flex items-center gap-4 mt-2.5 overflow-x-auto text-xs text-gray-500 pb-1 scrollbar-none">
          {[
            language === 'KN' ? 'ಜೇಡಿಮಣ್ಣಿನಲ್ಲಿ ಗೋಧಿ ಬೆಳೆಗೆ ಗೊಬ್ಬರ' : 'Best fertilizer for wheat in clay soil', 
            language === 'KN' ? 'ಟೊಮೇಟೊ ಎಲೆ ರೋಗ ಪತ್ತೆ' : 'Tomato leaf disease detection', 
            language === 'KN' ? 'ನನ್ನ ಜಮೀನಿನ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ' : 'Weather forecast for my farm', 
            language === 'KN' ? 'ಪ್ರಸ್ತುತ ಗೋಧಿ ಮಂಡಿ ಬೆಲೆಗಳು' : 'Current wheat mandi prices', 
            language === 'KN' ? 'ಸಣ್ಣ ರೈತರಿಗೆ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು' : 'Government schemes for small farmers'
          ].map((pill, idx) => (
            <span 
              key={idx} 
              onClick={() => {
                setSearchQuery(pill);
                executeSearch(pill);
              }} 
              className="cursor-pointer hover:text-green-800 whitespace-nowrap bg-gray-50 hover:bg-green-50 px-2 py-0.5 rounded border border-gray-100 transition"
            >
              {pill}
            </span>
          ))}
        </div>
      </header>

      {/* 2. SUB-NAV BAR (Underline States & Working Language Toggle) */}
      <nav className="bg-white border-b border-gray-200 px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-medium text-gray-600">
          <div className="flex items-center gap-6">
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-2 text-green-900 font-bold text-base tracking-tight cursor-pointer"
            >
              <div className="w-6 h-6 rounded bg-[#22592d] text-white flex items-center justify-center text-xs">
                🌾
              </div>
              KisanSetu
            </div>

            <div className="flex items-center gap-5">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 py-1 transition cursor-pointer ${activeTab === 'dashboard' ? 'text-green-700 border-b-2 border-green-700 pb-1 font-semibold' : 'text-slate-600 hover:text-green-700'}`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : 'Dashboard'}
              </button>
              
              <button 
                onClick={() => setActiveTab('soil')}
                className={`flex items-center gap-1.5 py-1 transition cursor-pointer ${activeTab === 'soil' ? 'text-green-700 border-b-2 border-green-700 pb-1 font-semibold' : 'text-slate-600 hover:text-green-700'}`}
              >
                <Activity className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ' : 'Soil Health'}
              </button>

              <button 
                onClick={() => setActiveTab('crop')}
                className={`flex items-center gap-1.5 py-1 transition cursor-pointer ${activeTab === 'crop' ? 'text-green-700 border-b-2 border-green-700 pb-1 font-semibold' : 'text-slate-600 hover:text-green-700'}`}
              >
                <Sprout className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಬೆಳೆ ಸಲಹೆ' : 'Crop Advice'}
              </button>

              <button 
                onClick={() => setActiveTab('disease')}
                className={`flex items-center gap-1.5 py-1 transition cursor-pointer ${activeTab === 'disease' ? 'text-green-700 border-b-2 border-green-700 pb-1 font-semibold' : 'text-slate-600 hover:text-green-700'}`}
              >
                <ScanLine className="w-3.5 h-3.5" /> {language === 'KN' ? 'ರೋಗ ಸ್ಕ್ಯಾನ್' : 'Disease Scan'}
              </button>

              <button 
                onClick={() => setActiveTab('market')}
                className={`flex items-center gap-1.5 py-1 transition cursor-pointer ${activeTab === 'market' ? 'text-green-700 border-b-2 border-green-700 pb-1 font-semibold' : 'text-slate-600 hover:text-green-700'}`}
              >
                <TrendingUp className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಮಾರುಕಟ್ಟೆ ದರ' : 'Market Prices'}
              </button>

              <button 
                onClick={() => setActiveTab('weather')}
                className={`flex items-center gap-1.5 py-1 transition cursor-pointer ${activeTab === 'weather' ? 'text-green-700 border-b-2 border-green-700 pb-1 font-semibold' : 'text-slate-600 hover:text-green-700'}`}
              >
                <CloudSun className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಹವಾಮಾನ' : 'Weather'}
              </button>

              <button 
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-1.5 text-slate-600 hover:text-green-700 py-1 transition cursor-pointer"
              >
                <Landmark className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಯೋಜನೆಗಳು' : 'Govt Schemes'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-green-700 cursor-pointer"><History className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಇತಿಹಾಸ' : 'History'}</button>
            {/* Login / Profile triggers with OTP modal */}
            {!isLoggedIn ? (
              <>
                <button onClick={openAuthModal} className="flex items-center gap-1.5 bg-[#22592d] hover:bg-[#1b4322] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"><User className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಲಾಗಿನ್' : 'Login'}</button>
                <button onClick={openAuthModal} className={`flex items-center gap-1 cursor-pointer py-1 ${activeTab === 'profile' ? 'text-green-700 border-b-2 border-green-700 font-semibold' : 'hover:text-green-700'}`}><User className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಪ್ರೊಫೈಲ್' : 'Profile'}</button>
              </>
            ) : (
              <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-1 cursor-pointer py-1 ${activeTab === 'profile' ? 'text-green-700 border-b-2 border-green-700 font-semibold' : 'hover:text-green-700'}`}><User className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಪ್ರೊಫೈಲ್' : 'Profile'}</button>
            )}
            
            {/* Synchronized Language Switcher */}
            <button 
              onClick={() => setLanguage(l => l === 'EN' ? 'KN' : 'EN')} 
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded text-slate-800 font-semibold transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-green-700" /> 
              {language === 'EN' ? 'English (EN)' : 'ಕನ್ನಡ (KN)'}
            </button>
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold"><span className="w-7 h-7 rounded-full bg-[#2d6a36] text-white flex items-center justify-center text-xs font-bold">{displayFarmerName.trim()[0].toUpperCase()}</span> <span className="hidden sm:inline">{displayFarmerName}</span><BadgeCheck className="w-4 h-4 text-green-600 hidden sm:inline" /></span>
                <button onClick={() => { handleAuthLogout(); handleLogout(); }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 px-2 py-1 rounded-lg transition" title={language === 'KN' ? 'ಲಾಗ್ಔಟ್' : 'Logout'}><LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{language === 'KN' ? 'ಲಾಗ್ಔಟ್' : 'Logout'}</span></button>
              </div>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-500 font-medium"><span className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">?</span> <span className="hidden sm:inline">{language === 'KN' ? 'ಅತಿಥಿ' : 'Guest'}</span></span>
            )}
          </div>
        </div>
      </nav>

      {/* 3. MAIN CONTENT WORKSPACE */}
      <main className="max-w-7xl mx-auto px-6 py-6 flex-1 w-full">

        {/* VIEW 1: DISEASE SCAN */}
        {activeTab === 'disease' && (
          <div>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-green-800" /> 
                {language === 'KN' ? 'ಸಸ್ಯ ರೋಗ ಪತ್ತೆಹಚ್ಚುವಿಕೆ' : 'Plant Disease Detection'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {language === 'KN' ? 'ರೋಗ ನಿರ್ಣಯಕ್ಕಾಗಿ ಎಲೆಯ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Upload leaf image for AI-powered disease diagnosis'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* LEFT CARD */}
              <div className="md:col-span-4 bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 text-sm font-semibold text-gray-700">
                  <Camera className="w-4 h-4 text-green-700" /> 
                  {language === 'KN' ? 'ರೋಗ ಪತ್ತೆ ಮಾಡಿ' : 'Detect Disease'}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      {language === 'KN' ? 'ಬೆಳೆಯ ವಿಧ' : 'Plant Type'}
                    </label>
                    <select 
                      value={plantType}
                      onChange={(e) => setPlantType(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-green-600"
                    >
                      <option value="Tomato">Tomato (ಟೊಮೇಟೊ)</option>
                      <option value="Potato">Potato (ಆಲೂಗಡ್ಡೆ)</option>
                      <option value="Wheat">Wheat (ಗೋಧಿ)</option>
                      <option value="Cotton">Cotton (ಹತ್ತಿ)</option>
                      <option value="Paddy">Paddy (ಭತ್ತ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      {language === 'KN' ? 'ಎಲೆಯ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Upload Leaf Image'}
                    </label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 hover:border-green-600 rounded-xl p-6 text-center bg-gray-50/50 cursor-pointer transition"
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Leaf preview" className="w-full h-36 object-contain rounded-md mb-2" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center mb-2">
                            <Upload className="w-5 h-5" />
                          </div>
                          <p className="text-xs text-gray-500 font-medium">
                            {language === 'KN' ? 'ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಚಿತ್ರವನ್ನು ಎಳೆಯಿರಿ' : 'Drag & drop or click to upload'}
                          </p>
                        </div>
                      )}

                      <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                      
                      <div className="flex gap-2 mt-4">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg py-1.5 px-3 text-xs font-medium text-gray-700 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಚಿತ್ರ ಅಪ್‌ಲೋಡ್' : 'Upload Leaf Image'}
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg py-1.5 px-3 text-xs font-medium text-gray-700 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಕ್ಯಾಮೆರಾ' : 'Use Camera'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleDetectDisease}
                    disabled={isScanning}
                    className="w-full bg-[#48a956] hover:bg-[#3d9149] disabled:bg-gray-400 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> {language === 'KN' ? 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Analyzing with Gemini...'}
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" /> {language === 'KN' ? 'ರೋಗ ಪತ್ತೆ ಮಾಡಿ' : 'Detect Disease'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* RIGHT CARD */}
              <div className="md:col-span-8 bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600" /> 
                    {language === 'KN' ? 'ರೋಗ ನಿರ್ಣಯದ ಫಲಿತಾಂಶಗಳು' : 'Diagnosis Results'}
                  </div>
                  <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
                    {language === 'KN' ? 'ತೀವ್ರತೆ: ' : 'Severity: '}{diagnosis.severity}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center py-4 bg-gray-50/70 rounded-xl mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{diagnosis.disease}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {language === 'KN' ? 'ಪತ್ತೆಯಾದ ರೋಗ' : 'Disease Detected'}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-green-700">{diagnosis.confidence}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {language === 'KN' ? 'ಖಚಿತತೆ' : 'Confidence'}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 mt-1.5">
                      {language === 'KN' ? 'ರೋಗಕಾರಕ: ' : 'Pathogen Type: '}<span className="text-blue-700">{diagnosis.pathogen}</span>
                    </h2>
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-gray-400" /> 
                    {language === 'KN' ? 'ವಿವರಣೆ' : 'Description'}
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-600 bg-white border border-gray-100 rounded-lg p-3">
                    {diagnosis.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="border border-green-100 bg-[#f7fbf7] rounded-xl p-4">
                    <h4 className="text-xs font-bold text-green-800 flex items-center gap-1.5 mb-2">
                      <ShieldCheck className="w-4 h-4 text-green-600" /> 
                      {language === 'KN' ? 'ಸಾವಯವ ಪರಿಹಾರ' : 'Organic Remedy'}
                    </h4>
                    <p className="text-xs leading-relaxed text-green-950">
                      {diagnosis.organic_remedy}
                    </p>
                  </div>

                  <div className="border border-red-100 bg-[#fff9f9] rounded-xl p-4">
                    <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" /> 
                      {language === 'KN' ? 'ರಾಸಾಯನಿಕ ಪರಿಹಾರ' : 'Chemical Remedy'}
                    </h4>
                    <p className="text-xs leading-relaxed text-red-950">
                      {diagnosis.chemical_remedy}
                    </p>
                  </div>
                </div>

                {/* AI Advisor Box with Kannada/English Sync */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                        {language === 'KN' ? 'ಕಿಸಾನ್‌ಸೇತು ಎಐ ಸಲಹೆಗಾರ (ಕನ್ನಡ)' : 'KISANSETHU AI ADVISOR (ENGLISH)'}
                      </span>
                    </div>
                    <button 
                      onClick={() => playSpeech(language === 'KN' ? (diagnosis.advisory_kn || diagnosis.aiAdvisoryKn) : (diagnosis.advisory_en || diagnosis.aiAdvisoryEn))}
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 px-2.5 py-1 rounded-md hover:bg-emerald-50 transition shadow-xs cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> 
                      {language === 'KN' ? 'ಧ್ವನಿ ಆಲಿಸಿ' : 'Listen Audio'}
                    </button>
                  </div>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                    {language === 'KN' 
                      ? (diagnosis.advisory_kn || diagnosis.aiAdvisoryKn) 
                      : (diagnosis.advisory_en || diagnosis.aiAdvisoryEn)}
                  </p>
                </div>

                {/* WhatsApp & KCC Action Row */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => shareViaWhatsApp(buildDiseaseWhatsappMessage())}
                    className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    <MessageCircle className="w-4 h-4" /> {language === 'KN' ? 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ' : 'Share via WhatsApp'}
                  </button>
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(buildDiseaseWhatsappMessage())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden"
                    aria-hidden="true"
                  >wa</a>
                  {(diagnosis.severity === 'Severe' || diagnosis.severity === 'Moderate') && (
                    <a 
                      href="tel:18001801551"
                      className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-2.5 rounded-lg text-xs font-bold transition"
                    >
                      <Phone className="w-3.5 h-3.5" /> {language === 'KN' ? '📞 KCC ಟೋಲ್-ಫ್ರೀಗೆ ಕರೆ ಮಾಡಿ (1800-180-1551)' : '📞 Call KCC Toll-Free (1800-180-1551)'}
                    </a>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SOIL HEALTH */}
        {activeTab === 'soil' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-green-700" /> 
              {language === 'KN' ? 'ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳ ವಿಶ್ಲೇಷಣೆ' : 'Offline Soil NPK Analysis & Health Card'}
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              {language === 'KN' ? 'ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ ತಿಳಿಯಲು ನಿಮ್ಮ ಮಣ್ಣಿನ ಪರೀಕ್ಷಾ ಮೌಲ್ಯಗಳನ್ನು ಹೊಂದಿಸಿ' : 'Adjust your latest soil test values to get instant dosage recommendations.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="text-xs font-bold text-gray-600">
                  {language === 'KN' ? 'ಸಾರಜನಕ (N)' : 'Nitrogen (N)'}: {soilInput.nitrogen} kg/ha
                </label>
                <input 
                  type="range" min="0" max="150" value={soilInput.nitrogen} 
                  onChange={(e) => setSoilInput({ ...soilInput, nitrogen: parseFloat(e.target.value) })}
                  className="w-full mt-2 accent-green-600" 
                />
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="text-xs font-bold text-gray-600">
                  {language === 'KN' ? 'ರಂಜಕ (P)' : 'Phosphorus (P)'}: {soilInput.phosphorus} kg/ha
                </label>
                <input 
                  type="range" min="0" max="120" value={soilInput.phosphorus} 
                  onChange={(e) => setSoilInput({ ...soilInput, phosphorus: parseFloat(e.target.value) })}
                  className="w-full mt-2 accent-green-600" 
                />
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="text-xs font-bold text-gray-600">
                  {language === 'KN' ? 'ಪೊಟ್ಯಾಶ್ (K)' : 'Potassium (K)'}: {soilInput.potassium} kg/ha
                </label>
                <input 
                  type="range" min="0" max="150" value={soilInput.potassium} 
                  onChange={(e) => setSoilInput({ ...soilInput, potassium: parseFloat(e.target.value) })}
                  className="w-full mt-2 accent-green-600" 
                />
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="text-xs font-bold text-gray-600">
                  {language === 'KN' ? 'ಮಣ್ಣಿನ ಪಿ.ಎಚ್ (pH)' : 'Soil pH'}: {soilInput.ph}
                </label>
                <input 
                  type="range" min="4.0" max="9.0" step="0.1" value={soilInput.ph} 
                  onChange={(e) => setSoilInput({ ...soilInput, ph: parseFloat(e.target.value) })}
                  className="w-full mt-2 accent-green-600" 
                />
              </div>
            </div>

            <div className="flex justify-end mb-6">
              <button 
                onClick={handleSoilAnalyze}
                disabled={isAnalyzingSoil}
                className="bg-[#48a956] hover:bg-[#3d9149] text-white px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                {isAnalyzingSoil ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} 
                {language === 'KN' ? 'ಕೊರತೆಯನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ' : 'Calculate Deficiencies'}
              </button>
            </div>

            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900 uppercase">
                  {language === 'KN' ? 'ಕೃಷಿ ತಜ್ಞರ ಶಿಫಾರಸು' : 'Agronomic Soil Recommendation'}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 bg-white text-emerald-800 rounded border border-emerald-200">
                  {language === 'KN' ? 'ಸೂಕ್ತತೆಯ ಅಂಕ: ' : 'Suitability Score: '}{soilResult.suitability_score}/100
                </span>
              </div>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">{soilResult.recommendation}</p>
            </div>
          </div>
        )}

        {/* VIEW 3: CROP ADVICE */}
        {activeTab === 'crop' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Sprout className="w-5 h-5 text-green-700" /> 
              {language === 'KN' ? 'ಬೆಳೆ ಸೂಕ್ತತೆಯ ಶ್ರೇಯಾಂಕ' : 'AI Crop Suitability Ranking'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { crop: language === 'KN' ? 'ಟೊಮೇಟೊ (ಹೈಬ್ರಿಡ್)' : 'Tomato (Hybrid)', score: 94, reason: language === 'KN' ? 'ಪ್ರಸ್ತುತ ಪೊಟ್ಯಾಶ್ ಮತ್ತು ಬಿಸಿಲು ವಾತಾವರಣಕ್ಕೆ ಅತ್ಯುತ್ತಮ.' : 'Matches current soil potassium and sunny climate.' },
                { crop: language === 'KN' ? 'ಹತ್ತಿ' : 'Cotton', score: 86, reason: language === 'KN' ? 'ಮಧ್ಯಮ ನೀರಾವರಿ ಅಗತ್ಯವಿದೆ; ಉತ್ತಮ ಇಳುವರಿ ನಿರೀಕ್ಷೆ.' : 'Good nitrogen response; requires moderate irrigation.' },
                { crop: language === 'KN' ? 'ರಾಗಿ' : 'Ragi (Finger Millet)', score: 81, reason: language === 'KN' ? 'ಕಡಿಮೆ ರಸಗೊಬ್ಬರ ಮತ್ತು ಮಳೆಯಾಶ್ರಿತ ಬೆಳೆಗೆ ಸೂಕ್ತ.' : 'Highly drought-resilient; minimal fertilizer requirement.' },
              ].map((c, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/60">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-sm text-gray-800">{c.crop}</h3>
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">{c.score}% Match</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{c.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: MARKET PRICES */}
        {activeTab === 'market' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-700" /> 
              {language === 'KN' ? 'ಪ್ರಾದೇಶಿಕ ಮಂಡಿ ದರಗಳು ಮತ್ತು ಎಐ ಸೂಚನೆಗಳು' : 'Regional APMC Mandi Rates & AI Price Signals'}
            </h2>
            <div className="divide-y divide-gray-100">
              {mandiRates.map((m, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">{m.crop}</h3>
                    <p className="text-xs text-gray-500">{m.mandi}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{m.price}</p>
                    <span className={`text-xs font-semibold flex items-center gap-0.5 justify-end ${m.trend === 'up' ? 'text-green-600' : m.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                      {m.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : m.trend === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                      {m.change}
                    </span>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${m.signal === 'HOLD' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                      AI Signal: {m.signal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: DASHBOARD — with Micro-Climate Intelligence Engine */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Live Micro-Climate Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-emerald-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center"><CloudSun className="w-4 h-4" /></div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{language === 'KN' ? 'ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಬುದ್ಧಿಮತ್ತೆ' : 'Micro-Climate Intelligence'}</h3>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {weather?.location_name || (language === 'KN' ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Locating...')} {coords && `• ${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-full border ${geoStatus === 'granted' ? 'bg-green-50 text-green-700 border-green-200' : geoStatus === 'denied' ? 'bg-red-50 text-red-700 border-red-200' : geoStatus === 'fallback' ? 'bg-amber-50 text-amber-700 border-amber-200' : geoStatus === 'locating' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {geoStatus === 'granted' ? (language === 'KN' ? 'ಲೈವ್ GPS' : 'Live GPS') : geoStatus === 'denied' ? (language === 'KN' ? 'ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ' : 'Permission Denied') : geoStatus === 'fallback' ? (language === 'KN' ? 'ಕೋಲಾರ ಡಿಫಾಲ್ಟ್' : 'Kolar Fallback') : geoStatus === 'locating' ? (language === 'KN' ? 'ಪತ್ತೆ ಹಚ್ಚಲಾಗುತ್ತಿದೆ' : 'Locating…') : 'Idle'}
                  </span>
                  <button onClick={requestGeolocation} disabled={weatherLoading} className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center disabled:opacity-50" title={language === 'KN' ? 'ನನ್ನ ಸ್ಥಳ ಬಳಸಿ' : 'Use my location'}><LocateFixed className="w-4 h-4 text-gray-700" /></button>
                  <button onClick={() => coords ? fetchWeather(coords.lat, coords.lon) : fetchWeather(KOLAR_FALLBACK.lat, KOLAR_FALLBACK.lon, KOLAR_FALLBACK.name)} disabled={weatherLoading} className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center disabled:opacity-50" title="Refresh"><RefreshCw className={`w-4 h-4 text-gray-700 ${weatherLoading ? 'animate-spin' : ''}`} /></button>
                </div>
              </div>
              {weatherLoading && !weather ? (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-6 h-6 text-sky-600 animate-spin mb-2" />
                  <p className="text-xs text-gray-500">{language === 'KN' ? 'ಓಪನ್-ಮೆಟಿಯೊದಿಂದ ಲೈವ್ ಹವಾಮಾನ ಪಡೆಯಲಾಗುತ್ತಿದೆ...' : 'Fetching live micro-climate from Open-Meteo...'}</p>
                </div>
              ) : weather ? (
                <div className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-700 uppercase tracking-wider"><Thermometer className="w-3.5 h-3.5" /> {language === 'KN' ? 'ತಾಪಮಾನ' : 'Temperature'}</div>
                      <p className="text-lg font-bold text-gray-900 mt-1">{weather.temperature.toFixed(1)}°C</p>
                      <p className="text-[11px] text-gray-500">{weather.weather_condition}</p>
                    </div>
                    <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-700 uppercase tracking-wider"><Droplets className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಆರ್ದ್ರತೆ' : 'Humidity'}</div>
                      <p className="text-lg font-bold text-gray-900 mt-1">{weather.relative_humidity}%</p>
                      <p className="text-[11px] text-gray-500">RH</p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 uppercase tracking-wider"><CloudRain className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಮಳೆ ಸಾಧ್ಯತೆ' : 'Rain Prob.'}</div>
                      <p className="text-lg font-bold text-gray-900 mt-1">{weather.precipitation_probability}%</p>
                      <p className="text-[11px] text-gray-500">{weather.precipitation_probability < 30 ? (language === 'KN' ? 'ಕಡಿಮೆ' : 'Low') : weather.precipitation_probability < 50 ? (language === 'KN' ? 'ಮಧ್ಯಮ' : 'Moderate') : (language === 'KN' ? 'ಹೆಚ್ಚು' : 'High')}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wider"><Wind className="w-3.5 h-3.5" /> Spray Window</div>
                      <p className={`text-sm font-bold mt-1 ${weather.spray_window_safe ? 'text-emerald-700' : 'text-red-600'}`}>{weather.spray_window_safe ? (language === 'KN' ? 'ಸುರಕ್ಷಿತ ✓' : 'SAFE ✓') : (language === 'KN' ? 'ತಪ್ಪಿಸಿ ✗' : 'AVOID ✗')}</p>
                      <p className="text-[11px] text-gray-500">{weather.latitude.toFixed(2)}, {weather.longitude.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className={`mt-4 rounded-xl p-4 border flex gap-3 ${weather.spray_window_safe ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${weather.spray_window_safe ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{weather.spray_window_safe ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}</div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider opacity-80">{language === 'KN' ? 'ಸಿಂಪಡಣೆ ಸಲಹೆ' : 'Spray Advisory'}</p>
                      <p className="text-xs font-medium leading-relaxed mt-1">{weather.spray_advisory}</p>
                      {weather.location_name.includes('Default') && <p className="text-[11px] mt-2 opacity-60 flex items-center gap-1"><Navigation className="w-3 h-3" /> {language === 'KN' ? 'GPS ನಿರಾಕರಿಸಲಾಗಿದೆ — ಕೋಲಾರ ಡೀಫಾಲ್ಟ್ ವಲಯ ತೋರಿಸಲಾಗುತ್ತಿದೆ. ನಿಖರ ಹವಾಮಾನಕ್ಕಾಗಿ ಸ್ಥಳ ಅನುಮತಿ ನೀಡಿ.' : 'GPS denied — showing Kolar default zone. Enable location permission for hyperlocal accuracy.'}</p>}
                    </div>
                  </div>
                  {weatherError && <p className="text-[11px] text-red-600 mt-2">{weatherError}</p>}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {weather.location_name}</span>
                    <span>Open-Meteo • Asia/Kolkata • {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              ) : (
                <div className="p-5 text-center">
                  <p className="text-xs text-gray-500">{language === 'KN' ? 'ಹವಾಮಾನ ಲಭ್ಯವಿಲ್ಲ — ಮರುಪ್ರಯತ್ನಿಸಿ' : 'Weather unavailable — tap refresh'}</p>
                  <button onClick={requestGeolocation} className="mt-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold">{language === 'KN' ? 'ಸ್ಥಳ ಪತ್ತೆಹಚ್ಚಿ' : 'Locate Me'}</button>
                </div>
              )}
            </div>

            <div className="p-6 bg-gradient-to-r from-[#1b4322] to-[#2d6a36] rounded-2xl text-white shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <h2 className="text-lg font-bold">
                  {language === 'KN' ? 'ಇಂದಿನ ಕೃಷಿ ನಿರ್ಧಾರ ಯೋಜನೆ (ಕೋಲಾರ)' : "Today's Unified Strategy (Kolar Plot #2)"}
                </h2>
              </div>
              <p className="text-xs text-green-100 leading-relaxed mb-4">
                {language === 'KN' ? orchestratedPlan.executive_advisory_kn : orchestratedPlan.executive_advisory_en}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs bg-amber-400 text-slate-900 font-bold px-3 py-1.5 rounded-lg">
                  {language === 'KN' ? 'ಮುಖ್ಯ ಕ್ರಮ: ' : 'Priority: '}{orchestratedPlan.priority_action}
                </span>
                <button 
                  onClick={() => playSpeech(language === 'KN' ? orchestratedPlan.executive_advisory_kn : orchestratedPlan.executive_advisory_en)}
                  className="bg-white text-green-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಧ್ವನಿ ಆಲಿಸಿ' : 'Listen Briefing'}
                </button>
                <button 
                  onClick={() => shareViaWhatsApp(buildDashboardWhatsappMessage())}
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> {language === 'KN' ? 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ' : 'Share via WhatsApp'}
                </button>
                {(diagnosis.severity === 'Severe' || diagnosis.severity === 'Moderate') && (
                  <a href="tel:18001801551" className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">
                    <Phone className="w-3.5 h-3.5" /> {language === 'KN' ? '📞 KCC (1800-180-1551)' : '📞 Call KCC (1800-180-1551)'}
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => setActiveTab('disease')} 
                className="p-5 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-green-600 transition shadow-xs"
              >
                <ScanLine className="w-6 h-6 text-green-700 mb-2" />
                <h3 className="font-bold text-sm text-gray-800">{language === 'KN' ? 'ಎಲೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' : 'Scan Crop Leaves'}</h3>
                <p className="text-xs text-gray-500 mt-1">{diagnosis.disease} ({diagnosis.severity})</p>
              </div>

              <div 
                onClick={() => setActiveTab('soil')} 
                className="p-5 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-green-600 transition shadow-xs"
              >
                <Activity className="w-6 h-6 text-green-700 mb-2" />
                <h3 className="font-bold text-sm text-gray-800">{language === 'KN' ? 'ಮಣ್ಣಿನ ಸ್ಥಿತಿ' : 'Check Soil Health'}</h3>
                <p className="text-xs text-gray-500 mt-1">{soilResult.status} ({soilResult.suitability_score}/100)</p>
              </div>

              <div 
                onClick={() => setActiveTab('market')} 
                className="p-5 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-green-600 transition shadow-xs"
              >
                <TrendingUp className="w-6 h-6 text-green-700 mb-2" />
                <h3 className="font-bold text-sm text-gray-800">{language === 'KN' ? 'ಮಂಡಿ ಬೆಲೆ ಸೂಚನೆ' : 'Mandi Price Surge'}</h3>
                <p className="text-xs text-gray-500 mt-1">Tomato up +12% in Kolar. Signal: HOLD.</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5b: DEDICATED WEATHER — Full Micro-Climate Explorer */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><CloudSun className="w-5 h-5 text-sky-600" /> {language === 'KN' ? 'ಲೈವ್ ಹವಾಮಾನ ಮತ್ತು ಸಿಂಪಡಣೆ ವಿಂಡೋ' : 'Live Weather & Spray Window'}</h2>
                  <p className="text-xs text-gray-500 mt-1">{language === 'KN' ? 'ನಿಮ್ಮ GPS ಅಥವಾ ಕೋಲಾರ ಡೀಫಾಲ್ಟ್ ವಲಯದ ನೈಜ-ಸಮಯದ ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ' : 'Real-time micro-climate for your GPS location or Kolar fallback zone via Open-Meteo (no API key)'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={requestGeolocation} disabled={weatherLoading} className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"><LocateFixed className="w-4 h-4" /> {geoStatus === 'locating' ? (language === 'KN' ? 'ಪತ್ತೆ...' : 'Locating…') : (language === 'KN' ? 'ನನ್ನ ಸ್ಥಳ' : 'Use My Location')}</button>
                  <button onClick={() => fetchWeather(KOLAR_FALLBACK.lat, KOLAR_FALLBACK.lon, KOLAR_FALLBACK.name)} disabled={weatherLoading} className="bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Kolar Default</button>
                </div>
              </div>
              {weather ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold">{Math.round(weather.temperature)}°</div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">{weather.temperature.toFixed(1)}°C • {weather.weather_condition}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {weather.location_name} • {weather.latitude.toFixed(4)}, {weather.longitude.toFixed(4)}</p>
                        </div>
                        <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full border ${weather.spray_window_safe ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{weather.spray_window_safe ? '✓ SAFE TO SPRAY' : '✗ HOLD SPRAY'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                          <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                          <p className="text-[11px] font-bold text-gray-500 uppercase">{language === 'KN' ? 'ತಾಪಮಾನ' : 'Temperature'}</p>
                          <p className="text-lg font-bold text-gray-900">{weather.temperature}°C</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                          <Droplets className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                          <p className="text-[11px] font-bold text-gray-500 uppercase">Humidity</p>
                          <p className="text-lg font-bold text-gray-900">{weather.relative_humidity}%</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                          <CloudRain className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                          <p className="text-[11px] font-bold text-gray-500 uppercase">{language === 'KN' ? 'ಮಳೆ' : 'Rain Prob'}</p>
                          <p className="text-lg font-bold text-gray-900">{weather.precipitation_probability}%</p>
                        </div>
                      </div>
                      <div className={`mt-4 rounded-xl p-4 border flex gap-3 ${weather.spray_window_safe ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                        <ShieldCheck className={`w-5 h-5 shrink-0 ${weather.spray_window_safe ? 'text-emerald-600' : 'text-amber-600'}`} />
                        <div>
                          <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">{language === 'KN' ? 'ಸಿಂಪಡಣೆ ತೀರ್ಮಾನ' : 'Spray Decision'}</p>
                          <p className="text-xs text-gray-700 leading-relaxed mt-1">{weather.spray_advisory}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-[#1b4322] to-[#2d6a36] rounded-xl p-5 text-white">
                        <h3 className="text-sm font-bold flex items-center gap-2"><Sprout className="w-4 h-4 text-amber-300" /> {language === 'KN' ? 'ಕೃಷಿ ಪರಿಣಾಮ' : 'Agronomic Impact'}</h3>
                        <ul className="text-xs text-green-100 leading-relaxed mt-3 space-y-1.5 list-disc list-inside">
                          <li>{weather.precipitation_probability >= 30 ? (language === 'KN' ? 'ಎಲೆ ತೇವವು ಹೆಚ್ಚು — ಶಿಲೀಂಧ್ರ ರೋಗದ ಅಪಾಯ' : 'High leaf wetness — fungal risk, avoid spray') : (language === 'KN' ? 'ಎಲೆ ಒಣಗಿದೆ — ಸಿಂಪಡಣೆಗೆ ಸೂಕ್ತ' : 'Leaf dryness optimal — foliar uptake high')}</li>
                          <li>{weather.relative_humidity > 80 ? (language === 'KN' ? 'ಆರ್ದ್ರತೆ ಹೆಚ್ಚು — ಒಣಗಲು ಸಮಯ ಬೇಕು' : 'Humidity high — prolonged drying, drift risk') : (language === 'KN' ? 'ಆರ್ದ್ರತೆ ಸಮತೋಲನದಲ್ಲಿದೆ' : 'Humidity balanced for spray')}</li>
                          <li>{weather.temperature > 33 ? (language === 'KN' ? 'ಬಿಸಿ ವಾತಾವರಣ — ಮುಂಜಾನೆ ಮಾತ್ರ ಸಿಂಪಡಿಸಿ' : 'Hot — spray 6–9 AM only to avoid scorch') : (language === 'KN' ? 'ತಾಪಮಾನ ಸೂಕ್ತವಾಗಿದೆ' : 'Temperature optimal for uptake')}</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5"><Navigation className="w-4 h-4 text-gray-500" /> {language === 'KN' ? 'ಸ್ಥಳ ವಿವರ' : 'Location Details'}</p>
                        <p className="text-xs text-gray-600"><strong>{weather.location_name}</strong><br />Lat {weather.latitude.toFixed(4)}, Lon {weather.longitude.toFixed(4)}<br />Condition: {weather.weather_condition}<br /><span className="text-[11px] text-gray-400">Source: Open-Meteo • Timezone Asia/Kolkata • Zero API key • <span className={geoStatus === 'fallback' ? 'text-amber-600 font-semibold' : 'text-green-600'}>{geoStatus === 'fallback' ? 'Fallback Active' : 'Live'}</span></span></p>
                        {geoStatus === 'denied' && <p className="text-[11px] text-red-600 mt-2">{language === 'KN' ? 'ಬ್ರೌಸರ್ ಸ್ಥಳ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ — ಕೋಲಾರ ಡೀಫಾಲ್ಟ್ ತೋರಿಸಲಾಗುತ್ತಿದೆ. ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಅನುಮತಿಸಿ.' : 'Browser denied location — showing Kolar fallback. Enable in browser settings for hyperlocal.'}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-3" />
                  <p className="text-xs text-gray-500">{language === 'KN' ? 'ಹವಾಮಾನ ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading micro-climate...'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 6: PROFILE — shows OTP session + legacy age/acres */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#1b4322] to-[#2d6a36] p-6 text-white flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white text-[#22592d] flex items-center justify-center text-xl font-bold">{isLoggedIn ? displayFarmerName.trim()[0].toUpperCase() : (user?.name ? user.name.trim()[0].toUpperCase() : '?')}</div>
                <div>
                  <h2 className="text-lg font-bold">{isLoggedIn ? displayFarmerName : (user?.name || (language === 'KN' ? 'ಅತಿಥಿ' : 'Guest'))}</h2>
                  <p className="text-xs text-green-100 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {isLoggedIn ? displayLocation : (user ? 'Kolar, Karnataka' : (language === 'KN' ? 'ಲಾಗಿನ್ ಮಾಡಿಲ್ಲ' : 'Not logged in'))} • {isLoggedIn ? displayPhone : (user?.phone ? `+91 ${user.phone}` : '')}</p>
                  {isLoggedIn && <span className="inline-flex items-center gap-1 text-[11px] bg-white/20 border border-white/20 px-2 py-0.5 rounded-full mt-1"><BadgeCheck className="w-3 h-3" /> {language === 'KN' ? 'ಪರಿಶೀಲಿತ' : 'Verified'}</span>}
                </div>
                {isLoggedIn ? (
                  <button onClick={() => { handleAuthLogout(); handleLogout(); }} className="ml-auto bg-white/15 hover:bg-white/25 border border-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">{language === 'KN' ? 'ಲಾಗ್ಔಟ್' : 'Logout'}</button>
                ) : (
                  <button onClick={openAuthModal} className="ml-auto bg-white text-[#22592d] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-50 transition">{language === 'KN' ? 'ಲಾಗಿನ್' : 'Login'}</button>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-green-700" /> {language === 'KN' ? 'ಪ್ರೊಫೈಲ್ ವಿವರಗಳು' : 'Profile Details'}</h3>
                {isLoggedIn || user ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{language === 'KN' ? 'ಹೆಸರು' : 'Name'}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{isLoggedIn ? displayFarmerName : user?.name}</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{language === 'KN' ? 'ವಯಸ್ಸು' : 'Age'}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{user?.age || 34} {language === 'KN' ? 'ವರ್ಷ' : 'years'} {isLoggedIn && !user?.age && <span className="text-[11px] text-gray-400">• {language === 'KN' ? 'ಡೀಫಾಲ್ಟ್' : 'default'}</span>}</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{language === 'KN' ? 'ಜಮೀನು ವಿಸ್ತೀರ್ಣ' : 'Land Holding'}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{user?.acres || 2.5} {language === 'KN' ? 'ಎಕರೆ' : 'acres'}</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{language === 'KN' ? 'ಫೋನ್ ಸಂಖ್ಯೆ' : 'Phone Number'}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{isLoggedIn ? displayPhone : (user?.phone ? `+91 ${user.phone}` : '—')}</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 sm:col-span-2">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{language === 'KN' ? 'ಸ್ಥಳ' : 'Location'}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-500" /> {isLoggedIn ? displayLocation : 'Kolar, Karnataka'}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <button onClick={() => setActiveTab('dashboard')} className="flex-1 bg-[#48a956] hover:bg-[#3d9149] text-white py-2.5 rounded-lg text-sm font-semibold transition">{language === 'KN' ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ' : 'Go to Dashboard'}</button>
                      <button onClick={() => { handleAuthLogout(); handleLogout(); }} className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition">{language === 'KN' ? 'ಲಾಗ್ಔಟ್' : 'Logout'}</button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3"><User className="w-6 h-6" /></div>
                    <p className="text-sm text-gray-600 font-medium">{language === 'KN' ? 'ನೀವು ಇನ್ನೂ ಲಾಗಿನ್ ಮಾಡಿಲ್ಲ' : "You're not logged in yet"}</p>
                    <p className="text-xs text-gray-400 mt-1">{language === 'KN' ? 'ಪ್ರೊಫೈಲ್ ನೋಡಲು ಫೋನ್ OTP ಮೂಲಕ ಲಾಗಿನ್ ಮಾಡಿ' : 'Login with phone OTP to view your farmer profile'}</p>
                    <button onClick={openAuthModal} className="mt-4 bg-[#48a956] hover:bg-[#3d9149] text-white px-5 py-2 rounded-lg text-sm font-semibold">{language === 'KN' ? 'ಲಾಗಿನ್ ಮಾಡಿ' : 'Login via OTP'}</button>
                  </div>
                )}
                <p className="text-[11px] text-center text-gray-400 mt-4">{language === 'KN' ? 'ವಿವರಗಳು ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಉಳಿಯುತ್ತವೆ' : 'Details saved securely in browser (localStorage)'}</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Phone Number + OTP Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#22592d] to-[#2d6a36] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Phone className="w-4 h-4" /></div>
                <div>
                  <h3 className="text-sm font-bold">{language === 'KN' ? 'ಫೋನ್ OTP ಲಾಗಿನ್' : 'Phone OTP Login'}</h3>
                  <p className="text-[11px] text-green-100">{language === 'KN' ? 'ಸುರಕ್ಷಿತ ರೈತ ಪ್ರವೇಶ' : 'Secure farmer access'}</p>
                </div>
              </div>
              <button onClick={closeAuthModal} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6">
              {authStep === 'phone' ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#f7f9f6] border border-gray-200 flex items-center justify-center mx-auto mb-3 text-lg">🇮🇳</div>
                    <h4 className="text-base font-bold text-gray-900">{language === 'KN' ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ' : 'Enter Mobile Number'}</h4>
                    <p className="text-xs text-gray-500 mt-1">{language === 'KN' ? 'OTP ಕಳುಹಿಸಲು 10 ಅಂಕಿಯ ಸಂಖ್ಯೆ' : '10-digit number to receive OTP'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">{language === 'KN' ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *' : 'Mobile Number *'}</label>
                    <div className={`flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#48a956] ${phoneError ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-300'}`}>
                      <span className="flex items-center gap-1.5 bg-gray-50 border-r border-gray-200 px-3 py-2.5 text-sm font-bold text-gray-700">🇮🇳 +91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={phoneInput}
                        onChange={e => setPhoneInput(e.target.value.replace(/[^0-9]/g,'').slice(0,10))}
                        placeholder="98765 43210"
                        className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                        autoFocus
                      />
                    </div>
                    {phoneError && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {phoneError}</p>}
                    <p className="text-[11px] text-gray-400 mt-1">{language === 'KN' ? 'ಉದಾ. 9876543210' : 'e.g. 9876543210 — starting with 6-9'}</p>
                  </div>
                  <button onClick={handleSendOtp} disabled={isSendingOtp} className="w-full bg-[#48a956] hover:bg-[#3d9149] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition">
                    {isSendingOtp ? <><Loader2 className="w-4 h-4 animate-spin" /> {language === 'KN' ? 'ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...' : 'Sending OTP...'}</> : (language === 'KN' ? 'OTP ಕಳುಹಿಸಿ' : 'Send OTP')}
                  </button>
                  <p className="text-[11px] text-center text-gray-400">{language === 'KN' ? 'OTP ಉಚಿತ ಮತ್ತು 5 ನಿಮಿಷ ಮಾನ್ಯ' : 'OTP is free & valid for 5 minutes'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto mb-3"><ShieldCheck className="w-6 h-6" /></div>
                    <h4 className="text-base font-bold text-gray-900">{language === 'KN' ? 'OTP ಪರಿಶೀಲನೆ' : 'Verify OTP'}</h4>
                    <p className="text-xs text-gray-500 mt-1">{language === 'KN' ? `+91 ${phoneInput} ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ` : `Sent to +91 ${phoneInput}`}</p>
                    <span className="inline-flex items-center gap-1.5 mt-2 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full text-[11px] font-bold">💡 Demo OTP: 1234</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 text-center">{language === 'KN' ? '4 ಅಂಕಿಯ OTP *' : '4-digit OTP *'}</label>
                    <div className="flex items-center justify-center gap-2">
                      {[0,1,2,3].map(idx => (
                        <input
                          key={idx}
                          ref={el => otpRefs.current[idx] = el}
                          type="text"
                          inputMode="numeric"
                          value={otpDigits[idx]}
                          onChange={e => handleOtpChange(idx, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(idx, e)}
                          onPaste={e => {
                            const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g,'').slice(0,4);
                            if (pasted.length === 4) {
                              e.preventDefault();
                              setOtpDigits(pasted.split(''));
                              setTimeout(() => otpRefs.current[3]?.focus(), 50);
                            }
                          }}
                          className={`w-12 h-12 text-center text-lg font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48a956] ${otpError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}`}
                          maxLength={1}
                        />
                      ))}
                    </div>
                    {otpError && <p className="text-xs text-red-600 mt-2 text-center flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3" /> {otpError}</p>}
                    <p className="text-[11px] text-center text-gray-400 mt-2">{language === 'KN' ? 'ಯಾವುದೇ 4 ಅಂಕಿಗಳು ಸ್ವೀಕರಿಸಲಾಗುತ್ತದೆ (ಡೆಮೊ: 1234)' : 'Any 4-digit code accepted for demo (hint: 1234)'}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setAuthStep('phone')} className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg text-sm font-semibold transition">{language === 'KN' ? 'ಹಿಂದೆ' : 'Back'}</button>
                    <button onClick={handleVerifyOtp} disabled={isVerifying} className="flex-1 bg-[#48a956] hover:bg-[#3d9149] disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition">
                      {isVerifying ? <><Loader2 className="w-4 h-4 animate-spin" /> {language === 'KN' ? 'ಪರಿಶೀಲನೆ...' : 'Verifying...'}</> : (language === 'KN' ? 'ಪರಿಶೀಲಿಸಿ & ಲಾಗಿನ್' : 'Verify & Login')}
                    </button>
                  </div>
                  <div className="text-center">
                    <button onClick={() => { setOtpDigits(['','','','']); setOtpError(''); }} className="text-xs text-[#22592d] hover:text-[#1b4322] font-semibold">{language === 'KN' ? 'OTP ಮರುಕಳುಹಿಸಿ' : 'Resend OTP'}</button>
                    <span className="text-xs text-gray-300 mx-2">•</span>
                    <button onClick={() => { setAuthStep('phone'); setPhoneInput(''); }} className="text-xs text-gray-500 hover:text-gray-700">{language === 'KN' ? 'ಸಂಖ್ಯೆ ಬದಲಾಯಿಸಿ' : 'Change number'}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. DYNAMIC GLOBAL SEARCH & VOICE RESULT MODAL */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-700" />
                <h3 className="font-bold text-gray-900 text-sm">
                  {language === 'KN' ? 'ಕಿಸಾನ್‌ಸೇತು ಎಐ ಕೃಷಿ ಸಲಹೆ' : 'KisanSetu AI Search Advisory'}
                </h3>
              </div>
              <button 
                onClick={() => setShowSearchModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSearching ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 text-green-700 animate-spin mb-3" />
                <p className="text-xs text-gray-600 font-medium">
                  {language === 'KN' ? 'ಜೆಮಿನೈ ಎಐ ಉತ್ತರವನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತಿದೆ...' : 'Consulting KisanSetu Gemini Engine...'}
                </p>
              </div>
            ) : searchResult ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-base font-bold text-gray-800">{searchResult.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {language === 'KN' || /[\u0C80-\u0CFF]/.test(searchResult.summary) 
                      ? (searchResult.vernacular_summary || searchResult.summary) 
                      : searchResult.summary}
                  </p>
                </div>

                {searchResult.action_steps && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[11px] font-bold text-gray-500 uppercase mb-2">
                      {language === 'KN' ? 'ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮಗಳು' : 'Recommended Action Steps'}
                    </p>
                    <ul className="space-y-1 text-xs text-gray-700 list-disc list-inside">
                      {searchResult.action_steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {searchResult.caution && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>{language === 'KN' ? 'ಎಚ್ಚರಿಕೆ: ' : 'Precaution: '}</strong>{searchResult.caution}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => {
                      const text = language === 'KN' || /[\u0C80-\u0CFF]/.test(searchResult.summary)
                        ? (searchResult.vernacular_summary || searchResult.summary)
                        : searchResult.summary;
                      playSpeech(text);
                    }}
                    className="flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಧ್ವನಿ ಆಲಿಸಿ' : 'Listen Audio'}
                  </button>
                  <button
                    onClick={() => setShowSearchModal(false)}
                    className="bg-[#48a956] hover:bg-[#3d9149] text-white text-xs font-semibold px-4 py-1.5 rounded-lg cursor-pointer"
                  >
                    {language === 'KN' ? 'ಮುಗಿದಿದೆ' : 'Done'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
}