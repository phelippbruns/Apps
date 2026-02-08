
import React from 'react';
import { AppStats } from '../types';
import { formatBytes } from '../utils';
import { Activity, Database, Files } from 'lucide-react';

interface StatsCardProps {
  stats: AppStats;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-darkgray p-4 rounded-xl border border-white/5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-lemon/10 flex items-center justify-center">
          <Files className="text-lemon" />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Tracks</p>
          <p className="text-2xl font-black text-white">{stats.totalFiles.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-darkgray p-4 rounded-xl border border-white/5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <Database className="text-blue-500" />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Storage Footprint</p>
          <p className="text-2xl font-black text-white">{formatBytes(stats.totalSize)}</p>
        </div>
      </div>

      <div className="bg-darkgray p-4 rounded-xl border border-white/5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Activity className="text-purple-500" />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Analysis Health</p>
          <p className="text-2xl font-black text-white">
            {stats.totalFiles > 0 ? Math.round((stats.analyzedCount / stats.totalFiles) * 100) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
};
