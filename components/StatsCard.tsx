
import React from 'react';
import { AppStats, Language } from '../types';
import { formatBytes } from '../utils';
import { Database, Files } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface StatsCardProps {
  stats: AppStats;
  lang: Language;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats, lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-darkgray p-6 rounded-3xl border border-white/5 flex items-center gap-6 shadow-xl group hover:border-lemon/20 transition-all">
        <div className="w-14 h-14 rounded-2xl bg-lemon/5 flex items-center justify-center group-hover:bg-lemon/10 transition-colors">
          <Files className="text-lemon" size={28} />
        </div>
        <div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">{t.tracks}</p>
          <p className="text-3xl font-black text-white">{stats.totalFiles.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-darkgray p-6 rounded-3xl border border-white/5 flex items-center gap-6 shadow-xl group hover:border-blue-500/20 transition-all">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/5 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
          <Database className="text-blue-500" size={28} />
        </div>
        <div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">{t.diskUsage}</p>
          <p className="text-3xl font-black text-white">{formatBytes(stats.totalSize)}</p>
        </div>
      </div>
    </div>
  );
};
