
import React, { useState } from 'react';
import { AnalyzedMetadata, Language } from '../types';
import { PromptModal } from './PromptModal';
import { Sparkles, Library, Zap, Activity } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface IntelligenceViewProps {
  data: AnalyzedMetadata[];
  lang: Language;
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({ data, lang }) => {
  const t = TRANSLATIONS[lang];
  const [activePrompt, setActivePrompt] = useState<{ title: string; prompt: string; showAllShortcuts?: boolean } | null>(null);

  // Deduplicate for prompt list
  const dedupedTracks = (() => {
    const seen = new Set<string>();
    return data.filter(item => {
      const artist = (item.artist || 'Unknown Artist').toLowerCase().trim();
      const title = (item.title || item.fileName.split('.')[0]).toLowerCase().trim();
      const key = `${artist}-${title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map(d => `${d.artist || 'Unknown Artist'} - ${d.title || d.fileName.split('.')[0]}`);
  })();

  const fullListText = dedupedTracks.join('\n');

  const handlePlaylistPrompt = () => {
    setActivePrompt({
      title: t.criarPlaylist,
      prompt: t.playlistPrompt.replace('{list}', fullListText),
      showAllShortcuts: false
    });
  };

  const handleDiscoveryPrompt = () => {
    setActivePrompt({
      title: t.discoverTracks,
      prompt: t.discoveryPrompt.replace('{list}', fullListText),
      showAllShortcuts: true
    });
  };

  const handleSetFlowPrompt = () => {
    setActivePrompt({
      title: t.generateSetFlow,
      prompt: t.setFlowPrompt.replace('{list}', fullListText),
      showAllShortcuts: true
    });
  };

  const handleSetBuilderPrompt = () => {
    setActivePrompt({
      title: t.setBuilder,
      prompt: t.setBuilderPrompt.replace('{list}', fullListText),
      showAllShortcuts: true
    });
  };

  const features = [
    { 
      title: t.criarPlaylist, 
      desc: "Curate a specialized track sequence", 
      icon: <Library size={32} />, 
      handler: handlePlaylistPrompt,
      color: "lemon"
    },
    { 
      title: t.discoverTracks, 
      desc: "Find matching music for your vibe", 
      icon: <Sparkles size={32} />, 
      handler: handleDiscoveryPrompt,
      color: "blue-500"
    },
    { 
      title: t.generateSetFlow, 
      desc: "Warm-up to Peak time organization", 
      icon: <Activity size={32} />, 
      handler: handleSetFlowPrompt,
      color: "purple-500"
    },
    { 
      title: t.setBuilder, 
      desc: "Transition compatible pairs & set structure", 
      icon: <Zap size={32} />, 
      handler: handleSetBuilderPrompt,
      color: "orange-500"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 animate-in fade-in duration-500">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">{t.intelligenceMode}</h2>
        <p className="text-gray-500 max-w-xl mx-auto font-medium">
          {t.intelligenceDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <button 
            key={i}
            onClick={f.handler}
            className={`group relative h-64 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-6 hover:border-${f.color}/50 hover:bg-${f.color}/5 transition-all shadow-2xl`}
          >
            <div className={`w-16 h-16 rounded-2xl bg-${f.color}/10 text-${f.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              {f.icon}
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white uppercase tracking-tight leading-tight">{f.title}</h3>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{f.desc}</p>
            </div>
            <div className={`absolute inset-0 border-2 border-${f.color} opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity`} />
          </button>
        ))}
      </div>

      {activePrompt && (
        <PromptModal 
          title={activePrompt.title}
          prompt={activePrompt.prompt}
          showAllShortcuts={activePrompt.showAllShortcuts}
          onClose={() => setActivePrompt(null)}
          lang={lang}
        />
      )}
    </div>
  );
};
