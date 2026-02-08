
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
      <div className="relative w-64 h-64 mb-12">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <style>
            {`
              @keyframes slice-open-top {
                from { transform: translateY(0); }
                to { transform: translateY(-15px); }
              }
              @keyframes slice-open-bottom {
                from { transform: translateY(0); }
                to { transform: translateY(15px); }
              }
              .lemon-cut-top { 
                animation: slice-open-top 1s ease-out forwards; 
                fill: #CCFF00;
              }
              .lemon-cut-bottom { 
                animation: slice-open-bottom 1s ease-out forwards; 
                fill: #CCFF00;
              }
              .fade-in-text {
                animation: fade-in 1s ease-in forwards;
              }
              @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}
          </style>
          {/* Top Half of Cut Lemon */}
          <g className="lemon-cut-top">
             <path d="M10,50 Q10,10 50,10 Q90,10 90,50 L10,50 Z" />
             {/* Lemon details */}
             <path d="M50,20 L50,50" stroke="#1a1a1a" strokeWidth="1" opacity="0.3" />
             <path d="M30,30 L50,50" stroke="#1a1a1a" strokeWidth="1" opacity="0.3" />
             <path d="M70,30 L50,50" stroke="#1a1a1a" strokeWidth="1" opacity="0.3" />
          </g>
          {/* Bottom Half of Cut Lemon */}
          <g className="lemon-cut-bottom">
             <path d="M10,52 L90,52 Q90,90 50,90 Q10,90 10,52 Z" />
             <path d="M50,52 L50,80" stroke="#1a1a1a" strokeWidth="1" opacity="0.3" />
             <path d="M30,70 L50,52" stroke="#1a1a1a" strokeWidth="1" opacity="0.3" />
             <path d="M70,70 L50,52" stroke="#1a1a1a" strokeWidth="1" opacity="0.3" />
          </g>
        </svg>
      </div>
      
      <div className="text-center space-y-4 fade-in-text">
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
