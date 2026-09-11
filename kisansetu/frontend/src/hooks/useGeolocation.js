import { useState, useCallback } from 'react';

const KOLAR_FALLBACK = { lat: 13.1378, lon: 78.1291, name: 'Kolar, Karnataka (Default Agro-Climatic Zone)' };

export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | locating | granted | denied | fallback
  const [error, setError] = useState(null);

  const request = useCallback(() => new Promise((resolve) => {
    if (!navigator.geolocation) {
      setStatus('fallback');
      setCoords(KOLAR_FALLBACK);
      resolve({ ...KOLAR_FALLBACK, status: 'fallback' });
      return;
    }
    setStatus('locating');
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lon: pos.coords.longitude, name: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` };
        setCoords(c);
        setStatus('granted');
        resolve({ ...c, status: 'granted' });
      },
      (err) => {
        setStatus(err.code === 1 ? 'denied' : 'fallback');
        setError(err.message);
        setCoords(KOLAR_FALLBACK);
        resolve({ ...KOLAR_FALLBACK, status: err.code === 1 ? 'denied' : 'fallback' });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  }), []);

  return { coords, status, error, request, fallback: KOLAR_FALLBACK };
}
