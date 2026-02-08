
import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, MessageSquare, Sparkles, Brain } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface PromptModalProps {
  title: string;
  prompt: string;
  showAllShortcuts?: boolean;
  onClose: () => void;
  lang: Language;
}

export const PromptModal: React.FC<PromptModalProps> = ({ title, prompt, showAllShortcuts = false, onClose, lang }) => {
  const t = TRANSLATIONS[lang];
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const aiLinks = [
    { name: t.openChatGPT, url: "https://chat.openai.com", icon: <MessageSquare className="text-lemon" size={18} /> },
    ...(showAllShortcuts ? [
      { name: t.openGemini, url: "https://gemini.google.com", icon: <Sparkles className="text-blue-400" size={18} /> },
      { name: t.openClaude, url: "https://claude.ai", icon: <Brain className="text-orange-400" size={18} /> }
    ] : [])
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <div className="bg-charcoal border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-black uppercase tracking-widest text-sm">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-8 overflow-y-auto scrollbar-thin">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.copyPrompt}</label>
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  copied ? 'bg-green-500/10 text-green-500' : 'bg-lemon text-charcoal hover:bg-white'
                }`}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? t.copied : t.copy}
              </button>
            </div>
            
            <div className="relative group">
              <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-gray-300 font-medium text-xs leading-relaxed italic max-h-64 overflow-y-auto whitespace-pre-wrap">
                {prompt}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.executeAI}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {aiLinks.map((ai) => (
                <a 
                  key={ai.name}
                  href={ai.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-lemon/50 hover:bg-lemon/5 transition-all group"
                >
                  {ai.icon}
                  <span className="text-white font-black text-[10px] uppercase tracking-widest">{ai.name}</span>
                  <ExternalLink size={12} className="text-gray-600 group-hover:text-lemon" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-black/20 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-500 italic">
            {t.tip}
          </p>
        </div>
      </div>
    </div>
  );
};
