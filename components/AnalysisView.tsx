
import React, { useState, useMemo } from 'react';
import { AnalyzedMetadata, Language, RawFile } from '../types';
import { downloadCsv, downloadTxt } from '../utils';
import { Download, Table, Search, ChevronUp, ChevronDown, Folder, Music, BarChart3, ChevronRight, FileJson, FileText } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface AnalysisViewProps {
  data: AnalyzedMetadata[];
  lang: Language;
  rawFiles: RawFile[];
}

type SortKey = keyof AnalyzedMetadata;

export const AnalysisView: React.FC<AnalysisViewProps> = ({ data, lang, rawFiles }) => {
  const t = TRANSLATIONS[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Deduplication logic: Hide duplicates from UI but they remain in original array
  const dedupedData = useMemo(() => {
    const seen = new Set<string>();
    return data.filter(item => {
      const artist = (item.artist || 'Unknown Artist').toLowerCase().trim();
      const title = (item.title || item.fileName.split('.')[0]).toLowerCase().trim();
      const key = `${artist}-${title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data]);

  const stats = useMemo(() => {
    const folders = new Set<string>();
    const folderCounts: Record<string, number> = {};
    
    // Use deduped data for stats counts if needed, but original for folders
    dedupedData.forEach(item => {
      const parts = item.relativePath.split('/');
      parts.pop();
      const folderPath = parts.join('/') || 'Root';
      folders.add(folderPath);
      folderCounts[folderPath] = (folderCounts[folderPath] || 0) + 1;
    });

    let topFolder = 'N/A';
    let maxFiles = 0;
    Object.entries(folderCounts).forEach(([path, count]) => {
      if (count > maxFiles) {
        maxFiles = count;
        topFolder = path;
      }
    });

    return {
      totalTracks: dedupedData.length,
      totalFolders: folders.size,
      topFolder,
      maxFiles
    };
  }, [dedupedData]);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredData = useMemo(() => {
    let result = [...dedupedData];
    
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.fileName.toLowerCase().includes(lowSearch) ||
        (item.artist || '').toLowerCase().includes(lowSearch) ||
        (item.title || '').toLowerCase().includes(lowSearch)
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        
        if (valA === valB) return 0;
        const comparison = valA < valB ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [dedupedData, searchTerm, sortConfig]);

  const TableHeader = ({ label, sortKey, className = "" }: { label: string; sortKey: SortKey; className?: string }) => (
    <th 
      className={`px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 cursor-pointer hover:text-lemon transition-colors ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {label}
        {sortConfig?.key === sortKey && (
          sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>
        )}
      </div>
    </th>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-lemon/10 flex items-center justify-center text-lemon">
            <Music size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{t.totalTracks}</p>
            <p className="text-2xl font-black text-white">{stats.totalTracks}</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Folder size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{t.totalFolders}</p>
            <p className="text-2xl font-black text-white">{stats.totalFolders}</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <BarChart3 size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{t.topFolder} ({stats.maxFiles} files)</p>
            <p className="text-xl font-black text-white truncate">{stats.topFolder}</p>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="flex flex-col h-[700px] bg-charcoal rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="p-6 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-6 backdrop-blur-md relative z-20">
          <div className="flex items-center gap-3 text-lemon">
            <Table size={20} />
            <h3 className="font-black text-sm uppercase tracking-widest">{t.minhaDiscografia}</h3>
          </div>
          
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text"
              placeholder={t.search}
              className="w-full bg-black/20 border border-white/5 rounded-xl px-12 py-3 text-xs font-bold text-white focus:outline-none focus:border-lemon transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white text-xs font-black rounded-xl hover:bg-lemon hover:text-charcoal transition-all shadow-lg active:scale-95"
            >
              <Download size={14} />
              {t.export}
              <ChevronDown size={14} className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-charcoal border border-white/10 rounded-xl shadow-2xl py-2 z-30 animate-in fade-in zoom-in duration-200">
                <button 
                  onClick={() => { downloadTxt(rawFiles); setShowExportMenu(false); }}
                  className="w-full text-left px-4 py-3 text-xs font-black text-gray-300 hover:bg-lemon hover:text-charcoal flex items-center gap-3 transition-colors"
                >
                  <FileText size={14} />
                  {t.exportAsTxt}
                </button>
                <button 
                  onClick={() => { downloadCsv(dedupedData); setShowExportMenu(false); }}
                  className="w-full text-left px-4 py-3 text-xs font-black text-gray-300 hover:bg-lemon hover:text-charcoal flex items-center gap-3 transition-colors"
                >
                  <FileJson size={14} />
                  {t.exportAsCsv}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto scrollbar-thin">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-charcoal/95 backdrop-blur-md shadow-xl z-10 border-b border-white/5">
              <tr>
                <TableHeader label={t.artist} sortKey="artist" />
                <TableHeader label={t.trackName} sortKey="title" />
                <TableHeader label={t.folder} sortKey="relativePath" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {sortedAndFilteredData.map((item, idx) => {
                const folder = item.heuristics.map(h => h.value).join('/') || 'Root';
                return (
                  <tr key={idx} className="hover:bg-lemon/5 transition-colors group">
                    <td className="px-6 py-4 text-white font-black uppercase tracking-tighter truncate max-w-[200px]">
                      {item.artist || 'Unknown Artist'}
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-bold truncate max-w-[300px]">
                      {item.title || item.fileName.split('.')[0]}
                    </td>
                    <td className="px-6 py-4 text-gray-500 italic truncate max-w-[300px]">
                      {folder}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sortedAndFilteredData.length === 0 && (
            <div className="p-32 text-center text-gray-600 uppercase font-black tracking-[0.4em] opacity-30">
              Database Empty
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
