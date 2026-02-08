
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, X, Check } from 'lucide-react';

interface Slide {
  title: string;
  description: string;
  icon: string;
}

const slides: Slide[] = [
  {
    title: "Welcome to LEMON 6",
    description: "The ultimate utility for DJs to map, organize, and analyze high-performance music libraries instantly.",
    icon: "🍋"
  },
  {
    title: "Step 1: Folder Selection",
    description: "Point us to your local music directory. We scan subfolders to derive genre heuristics from your organization.",
    icon: "📂"
  },
  {
    title: "Step 2: Metadata Extraction",
    description: "Our engine extracts BPM, Keys, and high-fidelity tags from MP3, FLAC, WAV, and AIFF files in the background.",
    icon: "⚙️"
  },
  {
    title: "Step 3: Intelligence Mode",
    description: "Generate professional set transitions or copy library prompts to your favorite AI tools for custom curation.",
    icon: "🧠"
  },
  {
    title: "Ready to Mix",
    description: "All analysis is local. No data leaves your machine unless you choose to use external AI providers.",
    icon: "🎧"
  }
];

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current === slides.length - 1) onComplete();
    else setCurrent(c => c + 1);
  };

  const back = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      <div className="bg-charcoal border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col">
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
            Skip
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
                <>LET'S GO <Check size={20} /></>
              ) : (
                <>NEXT <ChevronRight size={20} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
