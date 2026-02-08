
import React from 'react';
import { AppMode } from '../types';

interface HeaderProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, setMode, onReset }) => {
  return (
    <header className="bg-charcoal border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div 
          onClick={onReset}
          className="text-lemon font-black text-2xl tracking-tighter cursor-pointer flex items-center gap-2 select-none hover:opacity-80 transition-opacity"
        >
          <span className="text-3xl">🍋</span>
          LEMON 6
        </div>
        <div className="h-6 w-px bg-white/20 mx-2" />
        <nav className="flex bg-darkgray p-1 rounded-lg">
          <button
            onClick={() => setMode(AppMode.RAW)}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
              mode === AppMode.RAW 
                ? 'bg-lemon text-charcoal shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            RAW
          </button>
          <button
            onClick={() => setMode(AppMode.ANALYSIS)}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
              mode === AppMode.ANALYSIS 
                ? 'bg-lemon text-charcoal shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ANALYSIS
          </button>
          <button
            onClick={() => setMode(AppMode.INTELLIGENCE)}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
              mode === AppMode.INTELLIGENCE 
                ? 'bg-lemon text-charcoal shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            INTELLIGENCE
          </button>
        </nav>
      </div>
      
      <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
        <span className="hidden md:inline">V1.1.0_INTEL_STABLE</span>
        <div className="w-2 h-2 rounded-full bg-lemon animate-pulse" />
      </div>
    </header>
  );
};
