
import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { TRANSLATIONS } from '../translations';
import { Language } from '../types';

interface OnboardingProps {
  onComplete: () => void;
  lang: Language;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, lang }) => {
  const t = TRANSLATIONS[lang];
  const slides = t.onboarding;
  const [current, setCurrent] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const next = () => {
    if (current === slides.length - 1) onComplete();
    else setCurrent(c => c + 1);
  };

  const back = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onComplete();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className="bg-charcoal border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className="flex h-1 bg-white/5">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`flex-1 transition-all duration-500 ${idx <= current ? 'bg-lemon' : 'bg-transparent'}`} 
            />
          ))}
        </div>

        <div className="p-12 flex flex-col items-center text-center">
          <div className="text-7xl mb-8 animate-bounce">
            {slides[current].icon}
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">
            {slides[current].title}
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-md">
            {slides[current].description}
          </p>
        </div>

        <div className="bg-black/20 p-6 flex items-center justify-between border-t border-white/5">
          <button 
            onClick={onComplete}
            className="text-gray-500 hover:text-white text-sm font-black uppercase tracking-widest transition-colors"
          >
            {t.skip}
          </button>
          
          <div className="flex gap-4">
            {current > 0 && (
              <button 
                onClick={back}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 text-white transition-all"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <button 
              onClick={next}
              className="px-8 h-12 rounded-full bg-lemon text-charcoal font-black flex items-center gap-2 hover:bg-white transition-all transform active:scale-95"
            >
              {current === slides.length - 1 ? (
                <><span className="uppercase tracking-widest">{t.letsGo}</span> <Check size={20} /></>
              ) : (
                <><span className="uppercase tracking-widest">{t.next}</span> <ChevronRight size={20} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
