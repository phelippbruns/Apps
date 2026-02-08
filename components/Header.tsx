
import React, { useState } from 'react';
import { AppMode, Language } from '../types';
import { Info, Globe, ChevronDown, Check } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface HeaderProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  onReset: () => void;
  onShowOnboarding: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  hasFiles: boolean;
  hasHistory: boolean;
}

export const Header: React.FC<HeaderProps> = ({ mode, setMode, onReset, onShowOnboarding, lang, setLang, hasFiles, hasHistory }) => {
  const t = TRANSLATIONS[lang];
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages: Language[] = ['en', 'pt', 'es'];

  return (
    <header className="bg-charcoal border-b border-white/5 px-8 py-5 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="flex items-center gap-8">
        <div 
          onClick={onReset}
          className="text-lemon font-black text-3xl tracking-tighter cursor-pointer flex items-center gap-3 select-none hover:opacity-80 transition-opacity"
        >
          <span className="text-4xl drop-shadow-[0_0_15px_rgba(204,255,0,0.5)]">🍋</span>
          LEMON 6
        </div>
        
        <nav className="flex bg-black/40 p-1 rounded-xl border border-white/5">
          {[
            { id: AppMode.RAW, label: t.raw, disabled: false },
            { id: AppMode.HISTORY, label: t.lastScans, disabled: !hasHistory },
            { id: AppMode.ANALYSIS, label: t.myTracks, disabled: !hasFiles },
            { id: AppMode.INTELLIGENCE, label: t.intelligence, disabled: !hasFiles }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => !m.disabled && setMode(m.id)}
              disabled={m.disabled}
              className={`px-6 py-2 rounded-lg text-xs font-black tracking-widest transition-all ${
                mode === m.id 
                  ? 'bg-lemon text-charcoal shadow-2xl scale-105' 
                  : m.disabled ? 'text-gray-700 cursor-not-allowed opacity-50' : 'text-gray-500 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <div className="relative">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            onBlur={() => setTimeout(() => setShowLangMenu(false), 200)}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-lemon hover:border-lemon/50 transition-all group"
          >
            <Globe size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-tighter hidden md:inline">
              {lang.toUpperCase()}
            </span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-charcoal border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    setShowLangMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                    lang === l ? 'bg-lemon/10 text-lemon' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-widest">
                    {TRANSLATIONS[l].langName}
                  </span>
                  {lang === l && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={onShowOnboarding}
          className="p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-lemon hover:border-lemon/50 transition-all group"
          title="App Info"
        >
          <Info size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <div className="hidden lg:flex items-center gap-4 text-[10px] font-black tracking-[0.2em] text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
          <span>V1.5.0_PRO_READY</span>
          <div className="w-2 h-2 rounded-full bg-lemon animate-pulse shadow-[0_0_8px_#CCFF00]" />
        </div>
      </div>
    </header>
  );
};
