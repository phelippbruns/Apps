
import React, { useState, useMemo } from 'react';
import { AnalyzedMetadata } from '../types';
import { getGeminiSetSuggestions, formatDuration } from '../utils';
import { Brain, LayoutDashboard, ListMusic, Loader2, Sparkles, ChevronRight, Zap } from 'lucide-react';

interface IntelligenceViewProps {
  data: AnalyzedMetadata[];
  onUpdateTrack: (id: string, updates: Partial<AnalyzedMetadata>) => void;
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({ data, onUpdateTrack }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai'>('dashboard');
  const [intent, setIntent] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestedSet, setSuggestedSet] = useState<any[]>([]);

  // Dashboard Stats
  const stats = useMemo(() => {
    const genreSignals: Record<string, number> = {};
    const bpmBuckets: Record<string, number> = { '80-100': 0, '100-120': 0, '120-130': 0, '130-140': 0, '140+': 0 };
    
    data.forEach(track => {
      // Use level 0 folder as main genre heuristic
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

  return (
    <div className="flex flex-col h-full bg-charcoal rounded-xl overflow-hidden border border-white/5 shadow-2xl">
      {/* Tab Selector */}
      <div className="flex bg-black/40 p-1 border-b border-white/5">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'dashboard' ? 'text-lemon border-b-2 border-lemon bg-lemon/5' : 'text-gray-500 hover:text-white'
          }`}
        >
          <LayoutDashboard size={16} />
          Library Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'ai' ? 'text-lemon border-b-2 border-lemon bg-lemon/5' : 'text-gray-500 hover:text-white'
          }`}
        >
          <Brain size={16} />
          AI Set Builder
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'dashboard' ? (
          <div className="space-y-8">
            {/* Genre Heuristic Distribution */}
            <div>
              <h4 className="text-white text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-lemon" />
                Folder-Derived Genre Distribution (Heuristic)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Fixed: Cast Object.entries result to [string, number][] to ensure arithmetic operations are valid */}
                {(Object.entries(stats.genreSignals) as [string, number][]).sort((a,b) => b[1] - a[1]).map(([genre, count]) => (
                  <div key={genre} className="bg-white/5 p-4 rounded-lg border border-white/5 group hover:border-lemon/30 transition-colors">
                    <p className="text-gray-400 text-[10px] uppercase font-black tracking-tighter mb-1">{genre}</p>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-black text-white">{count}</span>
                      <span className="text-lemon text-[10px] font-mono">{Math.round((count / data.length) * 100)}%</span>
                    </div>
                    <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-lemon transition-all" 
                        style={{ width: `${(count / data.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BPM Map */}
            <div>
              <h4 className="text-white text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-blue-500" />
                Library Tempo Density (BPM)
              </h4>
              <div className="flex items-end gap-2 h-48 bg-black/20 p-4 rounded-xl">
                {/* Fixed: Cast Object.entries result to [string, number][] to ensure arithmetic operations are valid */}
                {(Object.entries(stats.bpmBuckets) as [string, number][]).map(([range, count]) => (
                  <div key={range} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-blue-500/20 group-hover:bg-blue-500/40 transition-colors rounded-t relative flex items-end justify-center" 
                         style={{ height: `${(count / data.length) * 100 * 2}%` }}>
                      <span className="absolute -top-6 text-[10px] text-blue-400 font-bold">{count}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono rotate-45 mt-4">{range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-6">
            <div className="bg-black/20 p-6 rounded-xl border border-white/5">
              <label className="text-lemon text-xs font-black uppercase tracking-widest mb-3 block">
                Define Set Intent / Mood
              </label>
              <div className="flex gap-4">
                <input 
                  type="text"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  placeholder="E.g. Dark high-energy techno set with heavy transitions..."
                  className="flex-1 bg-charcoal border border-white/10 rounded px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-lemon"
                />
                <button 
                  onClick={handleGenerateSet}
                  disabled={isAiLoading || !intent}
                  className="px-6 py-3 bg-lemon text-charcoal font-black rounded flex items-center gap-2 hover:bg-white disabled:opacity-50 transition-all"
                >
                  {isAiLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  GENERATE TRANSITIONS
                </button>
              </div>
              <p className="mt-4 text-[10px] text-gray-500 font-medium">
                LEMON 6 will process your top 50 tracks and suggest optimal groupings and transition rationale using Gemini-3-Pro.
              </p>
            </div>

            <div className="flex-1 space-y-4">
              {suggestedSet.length > 0 ? (
                suggestedSet.map((item, idx) => {
                  const track = data.find(t => t.id === item.trackId);
                  return (
                    <div key={idx} className="group flex items-start gap-4 bg-white/5 p-4 rounded-lg border-l-4 border-lemon hover:bg-white/10 transition-colors">
                      <div className="w-8 h-8 rounded bg-lemon text-charcoal flex items-center justify-center font-black text-xs shrink-0 mt-1">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="text-white font-black truncate">{track?.fileName || 'Unknown Track'}</h5>
                          <div className="flex items-center gap-3">
                            {item.energy && (
                              <div className="flex items-center gap-1 text-orange-400 text-[10px] font-black uppercase">
                                <Zap size={12} />
                                Energy {item.energy}
                              </div>
                            )}
                            <span className="text-lemon text-[10px] font-mono px-1.5 py-0.5 border border-lemon/30 rounded">
                              {track?.bpm || '--'} BPM
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-xs italic line-clamp-2">
                          {item.transitionReason}
                        </p>
                        {item.grouping && (
                          <div className="mt-2 text-[8px] bg-white/10 text-gray-300 inline-block px-2 py-0.5 rounded uppercase tracking-widest font-black">
                            {item.grouping}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="text-white/10 group-hover:text-lemon mt-2 shrink-0" size={20} />
                    </div>
                  );
                })
              ) : (
                !isAiLoading && (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                    <ListMusic size={48} className="mb-4" />
                    <p className="font-black uppercase text-sm tracking-widest">Awaiting Intent Input</p>
                  </div>
                )
              )}

              {isAiLoading && (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <Loader2 className="animate-spin text-lemon" size={40} />
                  <p className="text-lemon font-black text-xs uppercase animate-pulse">Consulting Gemini AI...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
