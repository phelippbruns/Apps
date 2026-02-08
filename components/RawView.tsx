
import React from 'react';
import { RawFile } from '../types';
import { downloadTxt, formatBytes } from '../utils';
import { Download, FileText } from 'lucide-react';

interface RawViewProps {
  files: RawFile[];
}

export const RawView: React.FC<RawViewProps> = ({ files }) => {
  return (
    <div className="flex flex-col h-full bg-lemon rounded-xl overflow-hidden shadow-2xl">
      <div className="p-4 bg-black/10 border-b border-black/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-charcoal">
          <FileText size={20} />
          <h3 className="font-black text-sm uppercase tracking-widest">Raw Discography Listing</h3>
        </div>
        <button 
          onClick={() => downloadTxt(files)}
          className="flex items-center gap-2 px-4 py-2 bg-charcoal text-lemon text-xs font-black rounded hover:bg-black transition-colors"
        >
          <Download size={14} />
          EXPORT .TXT
        </button>
      </div>

      <div className="flex-1 overflow-auto font-mono text-xs text-charcoal p-4 leading-relaxed">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <p className="font-black uppercase">No files loaded</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {files.map((file, idx) => (
              <li key={file.id} className="flex gap-4 hover:bg-black/5 px-1 rounded transition-colors group">
                <span className="opacity-40 min-w-[30px]">{idx + 1}</span>
                <span className="flex-1 truncate">{file.relativePath}</span>
                <span className="opacity-40 group-hover:opacity-100 transition-opacity uppercase">{formatBytes(file.size)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
