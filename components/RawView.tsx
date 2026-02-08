
import React from 'react';
import { RawFile, ScanHistory, Language } from '../types';
import { downloadTxt, formatBytes } from '../utils';
import { Download, FileText, History, Clock, ArrowRight } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface RawViewProps {
  files: RawFile[];
  history: ScanHistory[];
  lang: Language;
  onReopen: (scanId: string) => void;
}

export const RawView: React.FC<RawViewProps> = ({ files, history, lang, onReopen }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* History Sidebar */}
      <div className="lg:col-span-1 bg-darkgray rounded-2xl border border-white/5 flex flex-col overflow-hidden h-[700px]">
        <div className="p-6 bg-black/40 border-b border-white/5 flex items-center gap-3">
          <History size={18} className="text-gray-500" />
          <h3 className="font-black text-sm uppercase tracking-widest">{t.lastScans}</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-20 text-gray-600 text-[10px] font-black uppercase italic">
              {t.noHistory}
            </div>
          ) : (
            history.map((scan) => (
              <div 
                key={scan.id}
                className="bg-white/5 border border-white/5 rounded-xl p-4 hover:border-lemon/30 transition-all group cursor-pointer"
                onClick={() => onReopen(scan.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-bold text-xs truncate max-w-[150px]">{scan.folderName}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                    <Clock size={10} />
                    {new Date(scan.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-black uppercase">{scan.fileCount} {t.tracksMapped}</span>
                  <button className="text-lemon opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-black uppercase">
                    {t.reopen} <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Raw List */}
      <div className="lg:col-span-2 flex flex-col bg-charcoal rounded-2xl overflow-hidden border border-white/10 shadow-2xl h-[700px]">
        <div className="p-6 bg-black/40 border-b border-white/5 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3 text-lemon">
            <FileText size={20} />
            <h3 className="font-black text-sm uppercase tracking-widest">{t.rawListing}</h3>
          </div>
          {files.length > 0 && (
            <button 
              onClick={() => downloadTxt(files)}
              className="flex items-center gap-2 px-6 py-3 bg-lemon text-charcoal text-xs font-black rounded-xl hover:bg-white transition-all transform active:scale-95 shadow-xl shadow-lemon/10"
            >
              <Download size={14} />
              {t.downloadTxt}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin font-mono text-xs text-gray-400 p-8 leading-loose bg-black/20">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-20">
              <p className="font-black uppercase tracking-[0.2em]">{t.noHistory}</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {files.map((file, idx) => (
                <li key={file.id} className="flex gap-6 hover:bg-white/5 p-2 rounded-lg transition-colors group">
                  <span className="text-gray-600 min-w-[40px] font-black">{idx + 1}.</span>
                  <span className="flex-1 truncate group-hover:text-white transition-colors">{file.relativePath}</span>
                  <span className="text-gray-600 group-hover:text-lemon transition-colors uppercase font-bold">{formatBytes(file.size)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="p-4 bg-black/40 border-t border-white/5 text-[10px] text-gray-600 font-black uppercase tracking-widest text-center">
          {files.length} {t.tracksMapped}
        </div>
      </div>
    </div>
  );
};
