
import React from 'react';
import { TRANSLATIONS } from '../translations';
import { Language } from '../types';

interface LemonSliceLoaderProps {
  lang: Language;
}

export const LemonSliceLoader: React.FC<LemonSliceLoaderProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-charcoal/95 backdrop-blur-xl p-6">
      <div className="relative w-48 h-48 mb-12">
        {/* Simple Lemon Slicing Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <style>
              {`
                @keyframes slice-top {
                  0%, 100% { transform: translateY(0) rotate(0); }
                  50% { transform: translateY(-20px) rotate(-5deg); }
                }
                @keyframes slice-bottom {
                  0%, 100% { transform: translateY(0) rotate(0); }
                  50% { transform: translateY(20px) rotate(5deg); }
                }
                @keyframes pulse-lemon {
                  0%, 100% { opacity: 0.8; }
                  50% { opacity: 1; }
                }
                .lemon-top { animation: slice-top 1.5s ease-in-out infinite; }
                .lemon-bottom { animation: slice-bottom 1.5s ease-in-out infinite; }
                .lemon-body { animation: pulse-lemon 2s ease-in-out infinite; fill: #CCFF00; }
              `}
            </style>
            {/* Top half */}
            <path className="lemon-top lemon-body" d="M10,50 Q10,10 50,10 Q90,10 90,50 L10,50 Z" />
            {/* Bottom half */}
            <path className="lemon-bottom lemon-body" d="M10,52 L90,52 Q90,90 50,90 Q10,90 10,52 Z" />
            {/* Slice line */}
            <rect x="5" y="50" width="90" height="2" fill="#1a1a1a" className="opacity-50" />
          </svg>
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter animate-pulse">
          {t.processing}
        </h2>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-lemon animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
};
