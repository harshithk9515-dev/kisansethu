import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, subtitle, children, maxWidth = 'max-w-sm' }) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl ${maxWidth} w-full shadow-2xl border border-gray-100 overflow-hidden`} onClick={(e) => e.stopPropagation()}>
        {(title || subtitle) && (
          <div className="bg-gradient-to-r from-[#22592d] to-[#2d6a36] p-4 text-white flex items-center justify-between">
            <div>
              {title && <h3 className="text-sm font-bold">{title}</h3>}
              {subtitle && <p className="text-[11px] text-green-100">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
