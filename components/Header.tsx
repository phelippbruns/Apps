
import React from 'react';
import { AppMode } from '../types';
import { Settings, Info } from 'lucide-react';

interface HeaderProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  onReset: () => void;
  onShowOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, setMode, onReset, onShowOnboarding }) => {
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
            { id: AppMode.RAW, label: 'RAW' },
            { id: AppMode.ANALYSIS, label: 'ANALYSIS' },
            { id: AppMode.INTELLIGENCE, label: 'INTELLIGENCE' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-6 py-2 rounded-lg text-xs font-black tracking-widest transition-all ${
                mode === m.id 
                  ? 'bg-lemon text-charcoal shadow-2xl scale-105' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center gap-6">
        <button 
          onClick={onShowOnboarding}
          className="p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-lemon hover:border-lemon/50 transition-all group"
          title="App Info"
        >
          <Info size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <div className="flex items-center gap-4 text-[10px] font-black tracking-[0.2em] text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
          <span className="hidden lg:inline">V1.2.0_ENGINE_READY</span>
          <div className="w-2 h-2 rounded-full bg-lemon animate-pulse shadow-[0_0_8px_#CCFF00]" />
        </div>
      </div>
    </header>
  );
};
