
import React, { useState } from 'react';
import { RawFile, Language } from '../types';
import { downloadTxt, formatBytes, getRawDiscographyText } from '../utils';
import { Download, FileText, Copy, Check } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface RawViewProps {
  files: RawFile[];
  lang: Language;
}

export const RawView: React.FC<RawViewProps> = ({ files, lang }) => {
  const t = TRANSLATIONS[lang];
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = getRawDiscographyText(files);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Main Raw List */}
      <div className="flex flex-col bg-charcoal rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-[750px]">
        <div className="p-6 bg-black/40 border-b border-white/5 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3 text-lemon">
            <div className="p-2 bg-lemon/10 rounded-lg">
              <FileText size={20} />
            </div>
            <h3 className="font-black text-sm uppercase tracking-widest">{t.rawListing}</h3>
          </div>
          {files.length > 0 && (
            <div className="flex gap-3">
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-6 py-3 text-xs font-black rounded-xl transition-all transform active:scale-95 shadow-xl ${
                  copied ? 'bg-green-500 text-white' : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {t.copyAll}
              </button>
              <button 
                onClick={() => downloadTxt(files)}
                className="flex items-center gap-2 px-6 py-3 bg-lemon text-charcoal text-xs font-black rounded-xl hover:bg-white transition-all transform active:scale-95 shadow-xl shadow-lemon/10"
              >
                <Download size={14} />
                {t.downloadTxt}
              </button>
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
