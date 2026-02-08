
import React, { useState } from 'react';
import { AnalyzedMetadata, Language } from '../types';
import { PromptModal } from './PromptModal';
import { Sparkles, Library, Zap, Activity } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface IntelligenceViewProps {
  data: AnalyzedMetadata[];
  lang: Language;
  contextData?: AnalyzedMetadata[] | null;
  useSelectionIfAvailable: boolean;
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({ 
  data, 
  lang, 
  contextData,
  useSelectionIfAvailable 
}) => {
  const t = TRANSLATIONS[lang];
  const [activePrompt, setActivePrompt] = useState<{ title: string; prompt: string; showAllShortcuts?: boolean } | null>(null);

  const effectiveData = (useSelectionIfAvailable && contextData && contextData.length > 0) ? contextData : data;

  // Deduplicate for prompt list
  const dedupedTracks = (() => {
    const seen = new Set<string>();
    return effectiveData.filter(item => {
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
      desc: t.featPlaylistDesc, 
      icon: <Library size={32} />, 
      handler: handlePlaylistPrompt,
      color: "lemon"
    },
    { 
      title: t.discoverTracks, 
      desc: t.featDiscoveryDesc, 
      icon: <Sparkles size={32} />, 
      handler: handleDiscoveryPrompt,
      color: "blue-500"
    },
    { 
      title: t.generateSetFlow, 
      desc: t.featSetFlowDesc, 
      icon: <Activity size={32} />, 
      handler: handleSetFlowPrompt,
      color: "purple-500"
    },
    { 
      title: t.setBuilder, 
      desc: t.featSetBuilderDesc, 
      icon: <Zap size={32} />, 
      handler: handleSetBuilderPrompt,
      color: "orange-500"
    }
  ];

  const hasSelection = contextData && contextData.length > 0;

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 animate-in fade-in duration-500 flex flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
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

      <div className="text-center mt-12 space-y-4 opacity-80">
        <p className="text-gray-400 max-w-lg mx-auto font-medium text-xs leading-relaxed">
          {t.intelligenceDesc}
        </p>
        <div className="inline-block px-5 py-2 rounded-full bg-lemon/10 border border-lemon/20">
           <span className="text-lemon font-black text-[10px] uppercase tracking-widest">
             {useSelectionIfAvailable && hasSelection 
               ? `(${t.useSelection}: ${contextData.length} tracks - ${t.customSelection})` 
               : `(${t.useTotal}: ${data.length} tracks - ${t.highestTrackCount})`}
           </span>
        </div>
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
