
import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, FileAudio, Database, Github } from 'lucide-react';
import { Language } from '../types';

interface SecurityModalProps {
  onClose: () => void;
  lang: Language;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div 
        className="bg-charcoal border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-lemon" size={24} />
            <h3 className="text-white font-black uppercase tracking-widest text-sm">Security & Privacy</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-8 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lemon">
                <Lock size={18} />
                <h4 className="font-black text-xs uppercase tracking-widest">Your Data is Safe</h4>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                LEMON 6 operates entirely in your browser. No data is uploaded to external servers. All file scanning and analysis happens locally on your device.
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lemon">
                <EyeOff size={18} />
                <h4 className="font-black text-xs uppercase tracking-widest">What We Access</h4>
              </div>
              <ul className="text-gray-400 text-xs leading-relaxed list-disc list-inside space-y-1">
                <li>Read-only access to audio files you select</li>
                <li>File metadata (title, artist, album, etc.)</li>
                <li>Browser local storage for preferences</li>
              </ul>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lemon">
                <ShieldCheck size={18} />
                <h4 className="font-black text-xs uppercase tracking-widest">What We Don't Do</h4>
              </div>
              <ul className="text-gray-400 text-xs leading-relaxed list-disc list-inside space-y-1">
                <li>No data collection or tracking</li>
                <li>No external API calls</li>
                <li>No cloud uploads or storage</li>
                <li>No sharing of library info</li>
              </ul>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lemon">
                <FileAudio size={18} />
                <h4 className="font-black text-xs uppercase tracking-widest">File Security</h4>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Only audio files are processed (.mp3, .flac, .wav, .m4a, .aac). File size is limited to 500MB per file. Metadata is sanitized. Original files are never modified.
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lemon">
                <Database size={18} />
                <h4 className="font-black text-xs uppercase tracking-widest">Local Storage</h4>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Preferences stored locally in your browser. Clear browser data to remove all LEMON 6 information. No server-side backups exist.
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lemon">
                <Github size={18} />
                <h4 className="font-black text-xs uppercase tracking-widest">Open Source</h4>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                This project is privacy-first and transparent. You can review the source code on GitHub to verify our local-only processing claims.
              </p>
            </section>
          </div>
        </div>

        <div className="p-6 bg-black/20 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-500 italic uppercase tracking-widest">
            Privacy First • Local Only • Secured
          </p>
        </div>
      </div>
    </div>
  );
};
