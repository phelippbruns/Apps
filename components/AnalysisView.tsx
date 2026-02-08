
import React, { useState, useMemo } from 'react';
import { AnalyzedMetadata, Language, RawFile } from '../types';
import { downloadCsv, downloadTxt } from '../utils';
import { Download, Table, Search, ChevronUp, ChevronDown, Filter, XCircle } from 'lucide-react';
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
  const [filterArtist, setFilterArtist] = useState('ALL');
  const [filterFolder, setFilterFolder] = useState('ALL');
  const [filterGenre, setFilterGenre] = useState('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Deduplication logic: Hide duplicates from UI
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

  // Extract unique options for filters from dataset
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
  };

  const handleExportTxt = () => {
    const content = sortedAndFilteredData.map(f => f.relativePath).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lemon6_filtered_tracks_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportCsv = () => {
    const headers = ['Artist', 'Track Name', 'Folder', 'Genre'];
    const rows = sortedAndFilteredData.map(m => {
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
    a.download = `lemon6_filtered_analysis_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Table Section */}
      <div className="flex flex-col h-[750px] bg-charcoal rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="p-6 bg-black/40 border-b border-white/5 space-y-6 backdrop-blur-md relative z-20">
          <div className="flex flex-wrap items-center justify-between gap-6">
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
                <Download size={14} className="text-lemon" />
                {t.export}
                <ChevronDown size={14} className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-charcoal border border-white/10 rounded-xl shadow-2xl py-2 z-30 animate-in fade-in zoom-in duration-200">
                  <button onClick={handleExportTxt} className="w-full text-left px-4 py-3 text-xs font-black text-gray-300 hover:bg-lemon hover:text-charcoal flex items-center gap-3 transition-colors">{t.exportAsTxt}</button>
                  <button onClick={handleExportCsv} className="w-full text-left px-4 py-3 text-xs font-black text-gray-300 hover:bg-lemon hover:text-charcoal flex items-center gap-3 transition-colors">{t.exportAsCsv}</button>
                </div>
              )}
            </div>
          </div>

          {/* New Integrated Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Filter size={10} /> {t.filterArtist}
              </label>
              <select 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-gray-300 focus:outline-none focus:border-lemon transition-all appearance-none"
                value={filterArtist}
                onChange={(e) => setFilterArtist(e.target.value)}
              >
                <option value="ALL">ALL ARTISTS</option>
                {filterOptions.artists.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Filter size={10} /> {t.filterFolder}
              </label>
              <select 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-gray-300 focus:outline-none focus:border-lemon transition-all appearance-none"
                value={filterFolder}
                onChange={(e) => setFilterFolder(e.target.value)}
              >
                <option value="ALL">ALL FOLDERS</option>
                {filterOptions.folders.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Filter size={10} /> {t.filterGenre}
              </label>
              <select 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-gray-300 focus:outline-none focus:border-lemon transition-all appearance-none"
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
              >
                <option value="ALL">ALL GENRES</option>
                {filterOptions.genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <button 
              onClick={resetFilters}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-white/5 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <XCircle size={14} /> RESET
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto scrollbar-thin">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-charcoal/95 backdrop-blur-md shadow-xl z-10 border-b border-white/5">
              <tr>
                <TableHeader label={t.artist} sortKey="artist" />
                <TableHeader label={t.trackName} sortKey="title" />
                <TableHeader label={t.folder} sortKey="relativePath" />
                <TableHeader label={t.genre} sortKey="genre" />
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
