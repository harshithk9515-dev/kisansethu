import React, { useRef } from 'react';
import { Camera, Upload, Search, Loader2, Leaf } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function DetectCard({ onDetect, isScanning }) {
  const { language, diagnosis } = useApp();
  // Local UI state handled via AppContext or props passed from parent View
  // For enterprise modularity, we expose a controlled component interface via props from App.jsx View

  // This component is intentionally stateless — parent passes plantType/file handlers
  // To keep zero prop-drilling, we also expose a self-contained version that uses context if props omitted
  return null;
}

// Controlled variant used by App.jsx
export function DetectCardControlled({ plantType, setPlantType, imagePreview, fileInputRef, onFileChange, onDetect, isScanning }) {
  const { language } = useApp();
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 text-sm font-semibold text-gray-700">
        <Camera className="w-4 h-4 text-[#22592d]" />
        {language === 'KN' ? 'ರೋಗ ಪತ್ತೆ ಮಾಡಿ' : 'Detect Disease'}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">{language === 'KN' ? 'ಬೆಳೆಯ ವಿಧ' : 'Plant Type'}</label>
          <select value={plantType} onChange={(e) => setPlantType(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#48a956]">
            <option value="Tomato">Tomato (ಟೊಮೇಟೊ)</option>
            <option value="Potato">Potato (ಆಲೂಗಡ್ಡೆ)</option>
            <option value="Wheat">Wheat (ಗೋಧಿ)</option>
            <option value="Cotton">Cotton (ಹತ್ತಿ)</option>
            <option value="Paddy">Paddy (ಭತ್ತ)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">{language === 'KN' ? 'ಎಲೆಯ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Upload Leaf Image'}</label>
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 hover:border-[#22592d] rounded-xl p-6 text-center bg-[#f7f9f6]/50 cursor-pointer transition">
            {imagePreview ? (
              <img src={imagePreview} alt="Leaf preview" className="w-full h-36 object-contain rounded-md mb-2" />
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-green-50 text-[#22592d] flex items-center justify-center mb-2"><Leaf className="w-5 h-5" /></div>
                <p className="text-xs text-gray-500 font-medium">{language === 'KN' ? 'ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಚಿತ್ರವನ್ನು ಎಳೆಯಿರಿ' : 'Drag & drop or click to upload'}</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="flex-1 bg-white border border-gray-300 hover:bg-[#f7f9f6] rounded-lg py-1.5 px-3 text-xs font-medium text-gray-700 flex items-center justify-center gap-1.5 shadow-xs">
                <Upload className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಚಿತ್ರ ಅಪ್‌ಲೋಡ್' : 'Upload Leaf Image'}
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="flex-1 bg-white border border-gray-300 hover:bg-[#f7f9f6] rounded-lg py-1.5 px-3 text-xs font-medium text-gray-700 flex items-center justify-center gap-1.5 shadow-xs">
                <Camera className="w-3.5 h-3.5" /> {language === 'KN' ? 'ಕ್ಯಾಮೆರಾ' : 'Use Camera'}
              </button>
            </div>
          </div>
        </div>
        <button onClick={onDetect} disabled={isScanning} className="w-full bg-[#48a956] hover:bg-[#22592d] disabled:bg-gray-400 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition">
          {isScanning ? <><Loader2 className="w-4 h-4 animate-spin" /> {language === 'KN' ? 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Analyzing with Gemini...'}</> : <><Search className="w-4 h-4" /> {language === 'KN' ? 'ರೋಗ ಪತ್ತೆ ಮಾಡಿ' : 'Detect Disease'}</>}
        </button>
      </div>
    </div>
  );
}
