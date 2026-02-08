
import React from 'react';
import { ScanHistory, Language } from '../types';
import { Clock, History, FolderOpen } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface HistoryViewProps {
  history: ScanHistory[];
  lang: Language;
  onReopen: (scanId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, lang, onReopen }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div className="p-3 bg-lemon/10 rounded-xl text-lemon">
          <History size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">{t.lastScans}</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{t.pastScansDesc}</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white/5 border border-white/5 border-dashed rounded-3xl p-32 text-center">
          <p className="text-gray-600 uppercase font-black tracking-[0.4em] opacity-30 italic">
            {t.noHistory}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((scan) => (
            <div 
              key={scan.id}
              onClick={() => onReopen(scan.id)}
              className="bg-darkgray p-6 rounded-3xl border border-white/5 hover:border-lemon/30 transition-all cursor-pointer group shadow-xl relative overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-lemon/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-lemon/10 transition-colors" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/5 rounded-lg text-gray-400 group-hover:text-lemon transition-colors">
                    <FolderOpen size={20} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono bg-black/20 px-3 py-1 rounded-full">
                    <Clock size={12} />
                    {new Date(scan.timestamp).toLocaleDateString()}
                  </div>
                </div>

                <h4 className="text-white font-black text-xl mb-1 truncate group-hover:text-lemon transition-colors">
                  {scan.folderName}
                </h4>
                
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-8">
                  {scan.fileCount.toLocaleString()} {t.tracksMapped}
                </p>

                <button className="mt-auto w-full py-3.5 rounded-2xl bg-lemon text-charcoal text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-white active:scale-95 shadow-lg">
                  <span className="uppercase tracking-widest font-black">{t.reopen}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
