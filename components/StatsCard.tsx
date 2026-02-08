
import React from 'react';
import { AppStats, Language } from '../types';
import { formatBytes } from '../utils';
import { Database, Files, Layers, Folder, BarChart3, Target } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface StatsCardProps {
  stats: AppStats;
  lang: Language;
  isCustomSelection?: boolean;
  isIAMode?: boolean;
  onToggleContext?: () => void;
  useSelectionIfAvailable?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  stats, 
  lang, 
  isCustomSelection, 
  isIAMode, 
  onToggleContext,
  useSelectionIfAvailable 
}) => {
  const t = TRANSLATIONS[lang];

  const isClickable = isIAMode && isCustomSelection;
  const activeLabel = (isIAMode && isCustomSelection && useSelectionIfAvailable) 
    ? t.customSelection 
    : t.highestTrackCount;

  return (
    <div className="flex flex-col gap-3">
      {/* Top Section - More compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-darkgray px-4 py-3 rounded-2xl border border-white/5 flex items-center gap-3 shadow-xl group hover:border-lemon/20 transition-all">
          <div className="w-8 h-8 rounded-xl bg-lemon/5 flex items-center justify-center group-hover:bg-lemon/10 transition-colors">
            <Layers className="text-lemon" size={16} />
          </div>
          <div>
            <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">{t.tracks}</p>
            <p className="text-lg font-black text-white">{stats.totalFiles.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-darkgray px-4 py-3 rounded-2xl border border-white/5 flex items-center gap-3 shadow-xl group hover:border-lemon/20 transition-all">
          <div className="w-8 h-8 rounded-xl bg-lemon/5 flex items-center justify-center group-hover:bg-lemon/10 transition-colors">
            <Files className="text-lemon" size={16} />
          </div>
          <div>
            <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">{t.totalTracks}</p>
            <p className="text-lg font-black text-white">{stats.totalFiles.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Bottom Section - More compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-darkgray px-4 py-2.5 rounded-2xl border border-white/5 flex items-center gap-3 shadow-lg group hover:border-lemon/20 transition-all">
          <div className="w-7 h-7 rounded-lg bg-lemon/5 flex items-center justify-center group-hover:bg-lemon/10 transition-colors">
            <Database className="text-lemon" size={14} />
          </div>
          <div>
            <p className="text-[7px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">{t.diskUsage}</p>
            <p className="text-xs font-black text-white">{formatBytes(stats.totalSize)}</p>
          </div>
        </div>
        <div className="bg-darkgray px-4 py-2.5 rounded-2xl border border-white/5 flex items-center gap-3 shadow-lg group hover:border-lemon/20 transition-all">
          <div className="w-7 h-7 rounded-lg bg-lemon/5 flex items-center justify-center group-hover:bg-lemon/10 transition-colors">
            <Folder className="text-lemon" size={14} />
          </div>
          <div>
            <p className="text-[7px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">{t.totalFolders}</p>
            <p className="text-xs font-black text-white">{stats.totalFolders.toLocaleString()}</p>
          </div>
        </div>

        {/* This card is now interactive in IA mode when a selection exists */}
        <div 
          onClick={isClickable ? onToggleContext : undefined}
          className={`bg-darkgray px-4 py-2.5 rounded-2xl border flex items-center gap-3 shadow-lg group transition-all ${
            isClickable 
              ? 'border-lemon/40 cursor-pointer hover:bg-lemon/5 hover:border-lemon active:scale-[0.98]' 
              : 'border-white/5 hover:border-lemon/20'
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            isClickable && useSelectionIfAvailable ? 'bg-lemon text-charcoal' : 'bg-lemon/5 text-lemon group-hover:bg-lemon/10'
          }`}>
            {(isCustomSelection && (isIAMode ? useSelectionIfAvailable : true)) ? <Target size={14} /> : <BarChart3 size={14} />}
          </div>
          <div className="min-w-0">
            <p className={`text-[7px] font-black uppercase tracking-[0.2em] mb-0.5 ${
              isClickable ? 'text-lemon' : 'text-gray-500'
            }`}>
              {activeLabel}
            </p>
            <p className="text-xs font-black text-white truncate">
              {(isIAMode && isCustomSelection && useSelectionIfAvailable) ? t.customSelection : stats.topFolder}
            </p>
          </div>
          {isClickable && (
            <div className="ml-auto text-[8px] font-black text-lemon/40 uppercase tracking-tighter animate-pulse hidden group-hover:block">
              Click to Toggle
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
