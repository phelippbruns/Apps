
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  progress: number;
  processedCount: number;
  totalCount: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, processedCount, totalCount }) => {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-charcoal/95 backdrop-blur-xl p-6">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="relative inline-block">
          <Loader2 className="animate-spin text-lemon w-24 h-24" strokeWidth={1} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lemon font-black text-sm">{progress}%</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Processing your music library...</h2>
          <p className="text-gray-400 font-mono text-sm">
            {processedCount} / {totalCount} files mapped
          </p>
        </div>

        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-lemon transition-all duration-300 shadow-[0_0_15px_#CCFF00]" 
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] animate-pulse">
          Optimizing metadata buffers
        </p>
      </div>
    </div>
  );
};
