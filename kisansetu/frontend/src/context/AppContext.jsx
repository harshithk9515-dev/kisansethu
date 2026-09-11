import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('disease');
  const [language, setLanguage] = useState('EN');
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
  const [soilInput, setSoilInput] = useState({ nitrogen: 35, phosphorus: 60, potassium: 45, ph: 6.5, crop: 'Tomato' });
  const [soilResult, setSoilResult] = useState({
    status: 'Deficient (Low N)',
    deficiencies: ['Nitrogen deficiency: 35 kg/ha, optimal 80-120 kg/ha'],
    recommendation: 'Apply 25kg Urea per acre before the next irrigation cycle.',
    suitability_score: 72
  });
  const [orchestratedPlan] = useState({
    executive_advisory_en: 'Tomato field in Kolar has optimal moisture but low nitrogen. Mild Septoria leaf spot identified; spray Mancozeb immediately. Kolar mandi rates are up 12%—hold harvest for 3 days to maximize margins.',
    executive_advisory_kn: 'ಕೋಲಾರ ತೋಟದಲ್ಲಿ ತೇವಾಂಶ ಸರಿಯಾಗಿದೆ ಆದರೆ ಸಾರಜನಕದ ಕೊರತೆಯಿದೆ. ಎಲೆ ಚುಕ್ಕೆ ರೋಗಕ್ಕೆ ಮ್ಯಾಂಕೋಜೆಬ್ ಸಿಂಪಡಿಸಿ. ಮಾರುಕಟ್ಟೆ ಬೆಲೆ 12% ಏರಿಕೆಯಾಗಿದೆ, ಮೂರು ದಿನ ಮಾರಾಟ ಮುಂದೂಡಿ.',
    priority_action: 'Foliar Spray Mancozeb 2.5g/L + Hold Harvest'
  });

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab,
      language, setLanguage,
      diagnosis, setDiagnosis,
      soilInput, setSoilInput,
      soilResult, setSoilResult,
      orchestratedPlan,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
