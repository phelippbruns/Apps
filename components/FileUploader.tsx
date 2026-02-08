
import React, { useRef } from 'react';
import { Upload, FolderOpen } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: FileList) => void;
  isProcessing: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, isProcessing }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!isProcessing) {
      inputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-lemon/30 rounded-2xl bg-charcoal hover:border-lemon/60 transition-all cursor-pointer group"
         onClick={handleClick}>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleChange}
      />
      
      <div className="w-20 h-20 bg-lemon/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <FolderOpen className="text-lemon w-10 h-10" />
      </div>
      
      <h2 className="text-2xl font-black text-white mb-2">SELECT MUSIC DIRECTORY</h2>
      <p className="text-gray-400 text-center max-w-sm">
        Click to browse or drag your music folder here. <br/>
        We'll map your library and extract professional DJ tags.
      </p>
      
      <button className="mt-8 px-8 py-3 bg-lemon text-charcoal font-black rounded-full flex items-center gap-2 hover:bg-white transition-colors">
        <Upload size={20} />
        SELECT FOLDER
      </button>

      <div className="mt-6 flex gap-4">
        {['MP3', 'WAV', 'FLAC', 'AIFF'].map(ext => (
          <span key={ext} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400 font-mono">
            *.{ext}
          </span>
        ))}
      </div>
    </div>
  );
};

// Fix: Corrected module augmentation to properly add non-standard directory attributes to React.InputHTMLAttributes.
// The 'extends' clause was removed because declaration merging automatically includes existing members of the interface,
// which also fixes the 'Cannot find name HTMLAttributes' error.
declare module 'react' {
  interface InputHTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}
