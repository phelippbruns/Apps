
import React, { useState, useMemo } from 'react';
import { AnalyzedMetadata, AIProvider } from '../types';
import { getGeminiSetSuggestions, generateExternalAIPrompt, getRawDiscographyText } from '../utils';
import { Brain, LayoutDashboard, ListMusic, Loader2, Sparkles, ChevronRight, Zap, Copy, Check, MessageSquare } from 'lucide-react';

interface IntelligenceViewProps {
  data: AnalyzedMetadata[];
  onUpdateTrack: (id: string, updates: Partial<AnalyzedMetadata>) => void;
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({ data, onUpdateTrack }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'external'>('dashboard');
  const [intent, setIntent] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestedSet, setSuggestedSet] = useState<any[]>([]);
  
  // External AI states
  const [provider, setProvider] = useState<AIProvider>('ChatGPT');
  const [copyStatus, setCopyStatus] = useState(false);

  const stats = useMemo(() => {
    const genreSignals: Record<string, number> = {};
    const bpmBuckets: Record<string, number> = { '80-100': 0, '100-120': 0, '120-130': 0, '130-140': 0, '140+': 0 };
    
    data.forEach(track => {
      const mainGenre = track.heuristics[0]?.value || 'Unorganized';
      genreSignals[mainGenre] = (genreSignals[mainGenre] || 0) + 1;
      if (track.bpm) {
        if (track.bpm < 100) bpmBuckets['80-100']++;
        else if (track.bpm < 120) bpmBuckets['100-120']++;
        else if (track.bpm < 130) bpmBuckets['120-130']++;
        else if (track.bpm < 140) bpmBuckets['130-140']++;
        else bpmBuckets['140+']++;
      }
    });
    return { genreSignals, bpmBuckets };
  }, [data]);

  const handleGenerateSet = async () => {
    if (!intent) return;
    setIsAiLoading(true);
    const suggestions = await getGeminiSetSuggestions(data, intent);
    setSuggestedSet(suggestions);
    setIsAiLoading(false);
  };

  const handleCopyPrompt = () => {
    const libraryText = data.map(d => d.relativePath).join('\n');
    const prompt = generateExternalAIPrompt(provider, libraryText, intent);
    navigator.clipboard.writeText(prompt);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-charcoal rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
      <div className="flex bg-black/40 p-1 border-b border-white/5">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Library Insights' },
          { id: 'ai', icon: Brain, label: 'AI Set Builder' },
          { id: 'external', icon: MessageSquare, label: 'External AI Prompter' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'text-lemon bg-lemon/5 border-b-2 border-lemon' : 'text-gray-500 hover:text-white'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'dashboard' ? (
          <div className="space-y-12">
            <div>
              <header className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-lemon rounded-full" />
                <h4 className="text-white text-sm font-black uppercase tracking-widest">Top Genre Heuristics</h4>
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(Object.entries(stats.genreSignals) as [string, number][]).sort((a,b) => b[1] - a[1]).map(([genre, count]) => (
                  <div key={genre} className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-lemon/30 transition-all">
                    <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest mb-2">{genre}</p>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black text-white">{count}</span>
                      <span className="text-lemon text-xs font-mono">{Math.round((count / data.length) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <header className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                <h4 className="text-white text-sm font-black uppercase tracking-widest">Library Tempo Density</h4>
              </header>
              <div className="flex items-end gap-3 h-56 bg-black/20 p-8 rounded-2xl border border-white/5">
                {(Object.entries(stats.bpmBuckets) as [string, number][]).map(([range, count]) => (
                  <div key={range} className="flex-1 flex flex-col items-center gap-4 group">
                    <div className="w-full bg-blue-500/10 group-hover:bg-blue-500/40 transition-all rounded-t-lg relative flex items-end justify-center" 
                         style={{ height: `${Math.max(4, (count / (data.length || 1)) * 100 * 2.5)}%` }}>
                      <span className="absolute -top-6 text-[10px] text-blue-400 font-bold">{count}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono tracking-tighter">{range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'ai' ? (
          <div className="flex flex-col h-full gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-inner">
              <label className="text-lemon text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">
                Define Set Curation Intent
              </label>
              <div className="flex gap-4">
                <input 
                  type="text"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  placeholder="E.g. Transition from house to melodic techno over 1 hour..."
                  className="flex-1 bg-charcoal border border-white/10 rounded-xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-lemon shadow-xl"
                />
                <button 
                  onClick={handleGenerateSet}
                  disabled={isAiLoading || !intent}
                  className="px-8 bg-lemon text-charcoal font-black rounded-xl flex items-center gap-3 hover:bg-white disabled:opacity-50 transition-all shadow-xl active:scale-95"
                >
                  {isAiLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  GENERATE
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {suggestedSet.length > 0 ? (
                suggestedSet.map((item, idx) => {
                  const track = data.find(t => t.id === item.trackId);
                  return (
                    <div key={idx} className="group flex items-start gap-6 bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-lemon/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-lemon text-charcoal flex items-center justify-center font-black text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-white font-black truncate text-lg tracking-tight">{track?.fileName || 'Unknown Track'}</h5>
                          <div className="flex items-center gap-4">
                            {item.energy && (
                              <div className="flex items-center gap-1.5 text-orange-400 text-[10px] font-black uppercase bg-orange-400/10 px-2 py-1 rounded-lg">
                                <Zap size={12} />
                                {item.energy}
                              </div>
                            )}
                            <span className="text-lemon text-[10px] font-mono px-2 py-1 bg-lemon/10 rounded-lg">
                              {track?.bpm || '--'} BPM
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm italic leading-relaxed">
                          {item.transitionReason}
                        </p>
                      </div>
                      <ChevronRight className="text-white/10 group-hover:text-lemon transition-colors mt-2" size={24} />
                    </div>
                  );
                })
              ) : !isAiLoading && (
                <div className="h-64 flex flex-col items-center justify-center opacity-10 text-center">
                  <ListMusic size={64} className="mb-6" />
                  <p className="font-black uppercase text-lg tracking-[0.3em]">Awaiting Instruction</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
              <h3 className="text-white text-xl font-black mb-2 tracking-tight">External AI Prompter</h3>
              <p className="text-gray-400 text-sm mb-8">
                Generate professional prompts for your personal AI accounts. 
                We'll include a snapshot of your library (top 200 files) and your intent.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                    Choose AI Provider
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['ChatGPT', 'Gemini', 'Claude', 'Custom'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setProvider(p as AIProvider)}
                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                          provider === p ? 'bg-lemon text-charcoal' : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                    What should the AI do?
                  </label>
                  <textarea 
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    placeholder="E.g. Create a tracklist for a beach sunset house set using deep and organic sounds from my library."
                    className="w-full bg-charcoal border border-white/10 rounded-xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-lemon h-32"
                  />
                </div>

                <button 
                  onClick={handleCopyPrompt}
                  className="w-full py-4 bg-white text-charcoal font-black rounded-xl flex items-center justify-center gap-3 hover:bg-lemon transition-all active:scale-[0.98]"
                >
                  {copyStatus ? <Check size={20} /> : <Copy size={20} />}
                  {copyStatus ? 'PROMPT COPIED!' : 'COPY AI PROMPT'}
                </button>
              </div>
            </div>

            <div className="p-8 bg-black/40 rounded-3xl border border-dashed border-white/10 text-center">
              <p className="text-gray-500 text-xs italic">
                Pro Tip: Open {provider} in a new tab, paste the prompt, and watch it curate your set list.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
