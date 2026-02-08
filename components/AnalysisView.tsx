
import React, { useState, useMemo } from 'react';
import { AnalyzedMetadata, Language, RawFile } from '../types';
import { TRANSLATIONS } from '../translations';
import { Download, Table, Search, ChevronUp, ChevronDown, Filter, X, Zap, CheckSquare, Square } from 'lucide-react';

interface AnalysisViewProps {
  data: AnalyzedMetadata[];
  lang: Language;
  rawFiles: RawFile[];
  onIntelligenceJump: (tracks: AnalyzedMetadata[]) => void;
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

type SortKey = keyof AnalyzedMetadata;

export const AnalysisView: React.FC<AnalysisViewProps> = ({ data, lang, rawFiles, onIntelligenceJump, selectedIds, setSelectedIds }) => {
  const t = TRANSLATIONS[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArtist, setFilterArtist] = useState('ALL');
  const [filterFolder, setFilterFolder] = useState('ALL');
  const [filterGenre, setFilterGenre] = useState('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const filterOptions = useMemo(() => {
    const artists = new Set<string>();
    const folders = new Set<string>();
    const genres = new Set<string>();

    dedupedData.forEach(item => {
      if (item.artist) artists.add(item.artist);
      
      const parts = item.relativePath.split('/');
      parts.pop();
      const folderPath = parts.join('/') || 'Root';
      folders.add(folderPath);

      if (item.genre) {
        item.genre.forEach(g => genres.add(g));
      }
    });

    return {
      artists: Array.from(artists).sort(),
      folders: Array.from(folders).sort(),
      genres: Array.from(genres).sort()
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
        (item.title || '').toLowerCase().includes(lowSearch) ||
        (item.genre?.join(', ') || '').toLowerCase().includes(lowSearch)
      );
    }

    if (filterArtist !== 'ALL') {
      result = result.filter(item => item.artist === filterArtist);
    }

    if (filterFolder !== 'ALL') {
      result = result.filter(item => {
        const parts = item.relativePath.split('/');
        parts.pop();
        const folderPath = parts.join('/') || 'Root';
        return folderPath === filterFolder;
      });
    }

    if (filterGenre !== 'ALL') {
      result = result.filter(item => item.genre?.includes(filterGenre));
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
  }, [dedupedData, searchTerm, filterArtist, filterFolder, filterGenre, sortConfig]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedAndFilteredData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedAndFilteredData.map(d => d.id)));
    }
  };

  const getActiveTracks = () => {
    if (selectedIds.size > 0) {
      return dedupedData.filter(d => selectedIds.has(d.id));
    }
    return sortedAndFilteredData;
  };

  const handleCopySelection = () => {
    const tracks = getActiveTracks();
    const content = tracks.map(f => {
        const artist = f.artist || 'Unknown Artist';
        const title = f.title || f.fileName.split('.')[0];
        return `${artist} - ${title}`;
    }).join('\n');
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowExportMenu(false);
    }, 2000);
  };

  const handleExportTxt = () => {
    const tracks = getActiveTracks();
    const content = tracks.map(f => {
        const artist = f.artist || 'Unknown Artist';
        const title = f.title || f.fileName.split('.')[0];
        return `${artist} - ${title}`;
    }).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lemon6_tracks_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportCsv = () => {
    const tracks = getActiveTracks();
    const headers = ['Artist', 'Track Name', 'Folder', 'Genre'];
    const rows = tracks.map(m => {
      const artist = m.artist || 'Unknown Artist';
      const title = m.title || m.fileName.split('.')[0];
      const folder = m.heuristics.map(h => h.value).join('/') || 'Root';
      const genre = m.genre?.join(', ') || '';
      return [artist, title, folder, genre].map(val => `"${val}"`).join(',');
    });
    const content = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lemon6_analysis_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleZap = () => {
    const tracks = getActiveTracks();
    onIntelligenceJump(tracks);
  };

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

  const resetFilters = () => {
    setFilterArtist('ALL');
    setFilterFolder('ALL');
    setFilterGenre('ALL');
    setSearchTerm('');
    setSelectedIds(new Set()); // Reset selections as requested
  };

  const ExportButton = ({ onClick, label }: { onClick: () => void, label: string }) => (
    <button 
      onClick={onClick} 
      className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-charcoal hover:bg-black/10 transition-colors"
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col h-[750px] bg-charcoal rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="p-6 bg-black/40 border-b border-white/5 space-y-6 backdrop-blur-md relative z-20">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-lemon">
              <Table size={20} />
              <h3 className="font-black text-sm uppercase tracking-widest">{t.minhaDiscografia}</h3>
            </div>
          </div>

          <div className="flex items-end gap-3 w-full">
            <div className="flex-1 space-y-2">
              <label className="text-[9px] font-black text-lemon uppercase tracking-widest flex items-center gap-2">
                <Search size={10} /> {t.search}
              </label>
              <input 
                type="text"
                placeholder={t.search}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold text-gray-300 focus:outline-none focus:border-lemon transition-all h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[9px] font-black text-lemon uppercase tracking-widest flex items-center gap-2">
                <Filter size={10} /> {t.filterArtist}
              </label>
              <select 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-gray-300 focus:outline-none focus:border-lemon transition-all appearance-none h-10"
                value={filterArtist}
                onChange={(e) => setFilterArtist(e.target.value)}
              >
                <option value="ALL">ALL ARTISTS</option>
                {filterOptions.artists.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[9px] font-black text-lemon uppercase tracking-widest flex items-center gap-2">
                <Filter size={10} /> {t.filterFolder}
              </label>
              <select 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-gray-300 focus:outline-none focus:border-lemon transition-all appearance-none h-10"
                value={filterFolder}
                onChange={(e) => setFilterFolder(e.target.value)}
              >
                <option value="ALL">ALL FOLDERS</option>
                {filterOptions.folders.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[9px] font-black text-lemon uppercase tracking-widest flex items-center gap-2">
                <Filter size={10} /> {t.filterGenre}
              </label>
              <select 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-gray-300 focus:outline-none focus:border-lemon transition-all appearance-none h-10"
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
              >
                <option value="ALL">ALL GENRES</option>
                {filterOptions.genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            
            <div className="flex items-center gap-2 pb-1">
              <div className="relative group/reset">
                <button 
                  onClick={resetFilters}
                  className="w-8 h-8 bg-lemon text-charcoal rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                >
                  <X size={16} strokeWidth={3} />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-lemon text-charcoal font-black text-[10px] uppercase tracking-widest rounded whitespace-nowrap opacity-0 group-hover/reset:opacity-100 pointer-events-none transition-opacity">
                  {t.resetTooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-lemon" />
                </div>
              </div>

              <div className="relative group/zap">
                <button 
                  onClick={handleZap}
                  className="w-8 h-8 bg-lemon text-charcoal rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg active:scale-95"
                >
                  <Zap size={16} fill="currentColor" />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-lemon text-charcoal font-black text-[10px] uppercase tracking-widest rounded whitespace-nowrap opacity-0 group-hover/zap:opacity-100 pointer-events-none transition-opacity">
                  IA Mode
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-lemon" />
                </div>
              </div>

              <div 
                className="relative group/export"
                onMouseEnter={() => setShowExportMenu(true)}
                onMouseLeave={() => setShowExportMenu(false)}
              >
                <button 
                  className="w-8 h-8 bg-lemon text-charcoal rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg active:scale-95"
                >
                  <Download size={16} />
                </button>
                
                {!showExportMenu && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-lemon text-charcoal font-black text-[10px] uppercase tracking-widest rounded whitespace-nowrap opacity-0 group-hover/export:opacity-100 pointer-events-none transition-opacity">
                    {t.export}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-lemon" />
                  </div>
                )}
                
                {showExportMenu && (
                  <div className="absolute right-0 top-full pt-2 z-30">
                    <div className="bg-lemon rounded-xl shadow-2xl py-2 w-48 animate-in fade-in zoom-in duration-200 overflow-hidden">
                      <ExportButton onClick={handleCopySelection} label={copied ? t.copied : t.copySelection} />
                      <ExportButton onClick={handleExportTxt} label={t.exportAsTxt} />
                      <ExportButton onClick={handleExportCsv} label={t.exportAsCsv} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto scrollbar-thin">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-charcoal/95 backdrop-blur-md shadow-xl z-10 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                   <button onClick={toggleSelectAll} className="text-gray-500 hover:text-lemon transition-colors">
                     {selectedIds.size === sortedAndFilteredData.length && sortedAndFilteredData.length > 0 
                       ? <CheckSquare size={16} className="text-lemon" /> 
                       : <Square size={16} />
                     }
                   </button>
                </th>
                <TableHeader label={t.artist} sortKey="artist" />
                <TableHeader label={t.trackName} sortKey="title" />
                <TableHeader label={t.folder} sortKey="relativePath" />
                <TableHeader label={t.genre} sortKey="genre" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {sortedAndFilteredData.map((item, idx) => {
                const isSelected = selectedIds.has(item.id);
                const folder = item.heuristics.map(h => h.value).join('/') || 'Root';
                return (
                  <tr 
                    key={idx} 
                    className={`transition-colors group cursor-pointer ${isSelected ? 'bg-lemon/10' : 'hover:bg-lemon/5'}`}
                    onClick={() => toggleSelect(item.id)}
                  >
                    <td className="px-6 py-4 text-center">
                       <div className={`transition-colors flex justify-center ${isSelected ? 'text-lemon' : 'text-gray-600'}`}>
                         {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-white font-black uppercase tracking-tighter truncate max-w-[200px]">
                      {item.artist || 'Unknown Artist'}
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-bold truncate max-w-[300px]">
                      {item.title || item.fileName.split('.')[0]}
                    </td>
                    <td className="px-6 py-4 text-gray-500 italic truncate max-w-[300px]">
                      {folder}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-[9px] tracking-tight uppercase">
                      {item.genre?.join(', ') || ''}
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
