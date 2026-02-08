
import React from 'react';
import { AppStats } from '../types';
import { formatBytes } from '../utils';
import { Activity, Database, Files, Clock } from 'lucide-react';

interface StatsCardProps {
  stats: AppStats;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-darkgray p-6 rounded-3xl border border-white/5 flex items-center gap-6 shadow-xl group hover:border-lemon/20 transition-all">
        <div className="w-14 h-14 rounded-2xl bg-lemon/5 flex items-center justify-center group-hover:bg-lemon/10 transition-colors">
          <Files className="text-lemon" size={28} />
        </div>
        <div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Library Size</p>
          <p className="text-3xl font-black text-white">{stats.totalFiles.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-darkgray p-6 rounded-3xl border border-white/5 flex items-center gap-6 shadow-xl group hover:border-blue-500/20 transition-all">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/5 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
          <Database className="text-blue-500" size={28} />
        </div>
        <div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Disk Usage</p>
          <p className="text-3xl font-black text-white">{formatBytes(stats.totalSize)}</p>
        </div>
      </div>

      <div className="bg-darkgray p-6 rounded-3xl border border-white/5 flex items-center gap-6 shadow-xl group hover:border-purple-500/20 transition-all">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/5 flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
          <Activity className="text-purple-500" size={28} />
        </div>
        <div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Analysis Deep</p>
          <p className="text-3xl font-black text-white">
            {stats.totalFiles > 0 ? Math.round((stats.analyzedCount / stats.totalFiles) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="bg-darkgray p-6 rounded-3xl border border-white/5 flex items-center gap-6 shadow-xl group hover:border-orange-500/20 transition-all">
        <div className="w-14 h-14 rounded-2xl bg-orange-500/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
          <Clock className="text-orange-500" size={28} />
        </div>
        <div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Session Active</p>
          <p className="text-3xl font-black text-white">LIVE</p>
        </div>
      </div>
    </div>
  );
};
