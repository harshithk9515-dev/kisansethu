import { useCallback } from 'react';

export function useSpeech() {
  const speak = useCallback((text, lang = 'EN') => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'KN' || /[\u0C80-\u0CFF]/.test(text) ? 'kn-IN' : 'en-US';
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  }, []);

  const stop = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  const listen = useCallback((onResult, lang = 'EN') => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice recognition not supported. Please use Chrome.');
      return;
    }
    const rec = new SR();
    rec.lang = lang === 'KN' ? 'kn-IN' : 'en-IN';
    rec.interimResults = false;
    rec.onresult = (e) => onResult(e.results[0][0].transcript);
    rec.start();
  }, []);

  return { speak, stop, listen };
}
