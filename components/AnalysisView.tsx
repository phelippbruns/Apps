
import React, { useState, useMemo } from 'react';
import { AnalyzedMetadata } from '../types';
import { downloadCsv, formatBytes, formatDuration } from '../utils';
import { Download, Table, Search, ChevronUp, ChevronDown } from 'lucide-react';

interface AnalysisViewProps {
  data: AnalyzedMetadata[];
}

type SortKey = keyof AnalyzedMetadata;

export const AnalysisView: React.FC<AnalysisViewProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredData = useMemo(() => {
    let result = [...data];
    
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.fileName.toLowerCase().includes(lowSearch) ||
        item.artist?.toLowerCase().includes(lowSearch) ||
        item.title?.toLowerCase().includes(lowSearch) ||
        item.album?.toLowerCase().includes(lowSearch) ||
        item.genre?.some(g => g.toLowerCase().includes(lowSearch))
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        
        if (valA === valB) return 0;
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;
        
        const comparison = valA < valB ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  const TableHeader = ({ label, sortKey, className = "" }: { label: string; sortKey: SortKey; className?: string }) => (
    <th 
      className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-lemon transition-colors ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortConfig?.key === sortKey && (
          sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>
        )}
      </div>
    </th>
  );

  return (
    <div className="flex flex-col h-full bg-darkgray rounded-xl overflow-hidden border border-white/5 shadow-2xl">
      <div className="p-4 bg-black/20 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-lemon">
          <Table size={20} />
          <h3 className="font-black text-sm uppercase tracking-widest">Metadata Analysis Engine</h3>
        </div>
        
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text"
            placeholder="FILTER BY ARTIST, TRACK, GENRE..."
            className="w-full bg-charcoal border border-white/10 rounded px-10 py-2 text-xs font-bold text-white focus:outline-none focus:border-lemon transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button 
          onClick={() => downloadCsv(data)}
          className="flex items-center gap-2 px-4 py-2 bg-lemon text-charcoal text-xs font-black rounded hover:bg-white transition-colors"
        >
          <Download size={14} />
          EXPORT .CSV
        </button>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-lemon scrollbar-track-transparent">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 bg-darkgray shadow-md z-10">
            <tr>
              <TableHeader label="File" sortKey="fileName" />
              <TableHeader label="Title" sortKey="title" />
              <TableHeader label="Artist" sortKey="artist" />
              <TableHeader label="Album" sortKey="album" />
              <TableHeader label="BPM" sortKey="bpm" className="text-center" />
              <TableHeader label="Len" sortKey="duration" />
              <TableHeader label="Format" sortKey="format" />
              <TableHeader label="Size" sortKey="fileSize" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium">
            {sortedAndFilteredData.map((item, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors group">
                <td className="px-4 py-3 text-gray-400 group-hover:text-white truncate max-w-[200px]">
                  {item.fileName}
                </td>
                <td className={`px-4 py-3 ${item.title ? 'text-white' : 'text-gray-600 italic'}`}>
                  {item.title || 'Unknown'}
                  {!item.title && <span className="ml-1 text-[8px] bg-red-500/20 text-red-400 px-1 rounded uppercase">Derived</span>}
                </td>
                <td className={`px-4 py-3 ${item.artist ? 'text-white font-bold' : 'text-gray-600'}`}>
                  {item.artist || '--'}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {item.album || '--'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-1.5 py-0.5 rounded font-bold ${item.bpm ? 'bg-lemon/10 text-lemon' : 'text-gray-600'}`}>
                    {item.bpm || '--'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono">
                  {formatDuration(item.duration)}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 uppercase font-bold">
                    {item.format}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono">
                  {formatBytes(item.fileSize)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedAndFilteredData.length === 0 && (
          <div className="p-20 text-center text-gray-500 uppercase font-black tracking-widest opacity-20">
            No metadata entries found
          </div>
        )}
      </div>
    </div>
  );
};
