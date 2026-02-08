
import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, FileAudio, Database, Github } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface SecurityModalProps {
  onClose: () => void;
  lang: Language;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ onClose, lang }) => {
  const t = TRANSLATIONS[lang].securityModal;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div 
        className="bg-charcoal border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-lemon" size={24} />
            <h3 className="text-white font-black uppercase tracking-widest text-sm">{t.title}</h3>
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
                <h4 className="font-black text-xs uppercase tracking-widest">{t.dataSafeTitle}</h4>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                {t.dataSafeDesc}
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lemon">
                <EyeOff size={18} />
                <h4 className="font-black text-xs uppercase tracking-widest">{t.accessTitle}</h4>
              </div>
              <ul className="text-gray-400 text-xs leading-relaxed list-disc list-inside space-y-1">
                {t.accessList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lemon">
                <ShieldCheck size={18} />
                <h4 className="font-black text-xs uppercase tracking-widest">{t.notDoTitle}</h4>
              </div>
              <ul className="text-gray-400 text-xs leading-relaxed list-disc list-inside space-y-1">
                {t.notDoList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lemon">
                <FileAudio size={18} />
                <h4 className="font-black text-xs uppercase tracking-widest">{t.fileSecurityTitle}</h4>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                {t.fileSecurityDesc}
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lemon">
                <Database size={18} />
                <h4 className="font-black text-xs uppercase tracking-widest">{t.localStorageTitle}</h4>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                {t.localStorageDesc}
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-lemon">
                <Github size={18} />
                <h4 className="font-black text-xs uppercase tracking-widest">{t.openSourceTitle}</h4>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                {t.openSourceDesc}
              </p>
            </section>
          </div>
        </div>

        <div className="p-6 bg-black/20 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-500 italic uppercase tracking-widest">
            {t.footer}
          </p>
        </div>
      </div>
    </div>
  );
};
