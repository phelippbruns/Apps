
import React, { useState } from 'react';
import { RawFile, Language, AnalyzedMetadata } from '../types';
import { getRawDiscographyText, formatBytes } from '../utils';
import { Download, FileText, Copy, Check } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface RawViewProps {
  files: RawFile[];
  analyzedMetadata: AnalyzedMetadata[];
  lang: Language;
}

export const RawView: React.FC<RawViewProps> = ({ files, analyzedMetadata, lang }) => {
  const t = TRANSLATIONS[lang];
  const [copiedAll, setCopiedAll] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copiedSelection, setCopiedSelection] = useState(false);

  const handleCopyAll = () => {
    const text = getRawDiscographyText(files);
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySelection = () => {
    const content = analyzedMetadata.map(f => {
        const artist = f.artist || 'Unknown Artist';
        const title = f.title || f.fileName.split('.')[0];
        return `${artist} - ${title}`;
    }).join('\n');
    navigator.clipboard.writeText(content);
    setCopiedSelection(true);
    setTimeout(() => {
      setCopiedSelection(false);
      setShowExportMenu(false);
    }, 2000);
  };

  const handleExportTxt = () => {
    const content = analyzedMetadata.map(f => {
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
    const headers = ['Artist', 'Track Name', 'Folder', 'Genre'];
    const rows = analyzedMetadata.map(m => {
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

  const ExportButton = ({ onClick, label }: { onClick: () => void, label: string }) => (
    <button 
      onClick={onClick} 
      className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-charcoal hover:bg-black/10 transition-colors"
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col bg-charcoal rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-[750px]">
        <div className="p-6 bg-black/40 border-b border-white/5 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3 text-lemon">
            <div className="p-2 bg-lemon/10 rounded-lg">
              <FileText size={20} />
            </div>
            <h3 className="font-black text-sm uppercase tracking-widest">{t.rawListing}</h3>
          </div>
          
          {files.length > 0 && (
            <div className="flex gap-2">
              {/* Copy All Button */}
              <div className="relative group/copy">
                <button 
                  onClick={handleCopyAll}
                  className={`w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg active:scale-95 ${
                    copiedAll ? 'bg-green-500 text-white' : 'bg-lemon text-charcoal'
                  }`}
                >
                  {copiedAll ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-lemon text-charcoal font-black text-[10px] uppercase tracking-widest rounded whitespace-nowrap opacity-0 group-hover/copy:opacity-100 pointer-events-none transition-opacity">
                  {t.copyAll}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-lemon" />
                </div>
              </div>

              {/* Export Dropdown Button */}
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
                      <ExportButton onClick={handleCopySelection} label={copiedSelection ? t.copied : t.copySelection} />
                      <ExportButton onClick={handleExportTxt} label={t.exportAsTxt} />
                      <ExportButton onClick={handleExportCsv} label={t.exportAsCsv} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin font-mono text-xs text-gray-400 p-8 leading-loose bg-black/10">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-20">
              <p className="font-black uppercase tracking-[0.4em]">Empty State</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {files.map((file, idx) => (
                <li key={file.id} className="flex gap-6 hover:bg-white/5 p-2 rounded-lg transition-colors group border-b border-white/5 last:border-0 pb-2">
                  <span className="text-gray-600 min-w-[40px] font-black">{idx + 1}.</span>
                  <span className="flex-1 truncate group-hover:text-white transition-colors">{file.relativePath}</span>
                  <span className="text-gray-600 group-hover:text-lemon transition-colors uppercase font-bold">{formatBytes(file.size)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="p-4 bg-black/40 border-t border-white/5 text-[10px] text-gray-600 font-black uppercase tracking-widest text-center">
          {files.length.toLocaleString()} {t.tracksMapped}
        </div>
      </div>
    </div>
  );
};
