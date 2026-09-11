import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const DEMO_FARMERS = [
  { id: 'FARM-9021', name: 'Rajesh Kumar', phone: '+91 98765 43210', rawPhone: '9876543210', district: 'Kolar', state: 'Karnataka', landSize: '3.5 Acres', primaryCrop: 'Tomato', acres: 3.5 },
  { id: 'FARM-9044', name: 'Suresh Patel', phone: '+91 98765 43211', rawPhone: '9876543211', district: 'Raichur', state: 'Karnataka', landSize: '5.0 Acres', primaryCrop: 'Cotton', acres: 5.0 },
];

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem('kisansetu_auth');
      if (raw) return JSON.parse(raw);
    } catch {}
    return { isLoggedIn: false, farmer: null };
  });
  const [userLegacy, setUserLegacy] = useState(() => {
    try {
      const raw = localStorage.getItem('kisansetu_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const farmer = auth?.farmer || null;
  const isLoggedIn = !!auth?.isLoggedIn && !!farmer;
  const farmerName = farmer?.name || userLegacy?.name || '';
  const location = farmer ? `${farmer.district}, ${farmer.state}` : 'Kolar, Karnataka';
  const phone = farmer?.phone || (userLegacy?.phone ? `+91 ${userLegacy.phone}` : '');
  const landSize = farmer?.landSize || (userLegacy?.acres ? `${userLegacy.acres} Acres` : '3.5 Acres');
  const acres = farmer?.acres ?? userLegacy?.acres ?? 3.5;
  const primaryCrop = farmer?.primaryCrop || 'Tomato';

  useEffect(() => {
    try {
      if (auth?.isLoggedIn) localStorage.setItem('kisansetu_auth', JSON.stringify(auth));
      else localStorage.removeItem('kisansetu_auth');
    } catch {}
  }, [auth]);

  const login = useCallback((farmerProfile) => {
    const next = { isLoggedIn: true, farmer: farmerProfile };
    setAuth(next);
    // seed legacy for dosage calculators
    if (!userLegacy) {
      const legacy = { name: farmerProfile.name, age: 34, acres: farmerProfile.acres, phone: farmerProfile.rawPhone };
      localStorage.setItem('kisansetu_user', JSON.stringify(legacy));
      setUserLegacy(legacy);
    }
  }, [userLegacy]);

  const logout = useCallback(() => {
    localStorage.removeItem('kisansetu_auth');
    localStorage.removeItem('kisansetu_user');
    setAuth({ isLoggedIn: false, farmer: null });
    setUserLegacy(null);
  }, []);

  const quickLogin = useCallback((phoneDigits) => {
    const found = DEMO_FARMERS.find(f => f.rawPhone === phoneDigits);
    if (found) login(found);
  }, [login]);

  return (
    <AuthContext.Provider value={{
      auth, farmer, isLoggedIn, farmerName, location, phone, landSize, acres, primaryCrop,
      userLegacy, setUserLegacy,
      login, logout, quickLogin, DEMO_FARMERS,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
