
import React, { useState, useCallback, useEffect } from 'react';
import * as mm from 'music-metadata-browser';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { RawView } from './components/RawView';
import { AnalysisView } from './components/AnalysisView';
import { IntelligenceView } from './components/IntelligenceView';
import { StatsCard } from './components/StatsCard';
import { Onboarding } from './components/Onboarding';
import { AppMode, RawFile, AnalyzedMetadata, AppStats } from './types';
import { isMusicFile, extractHeuristics } from './utils';
import { Loader2, Music2 } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.RAW);
  const [rawFiles, setRawFiles] = useState<RawFile[]>([]);
  const [analyzedMetadata, setAnalyzedMetadata] = useState<AnalyzedMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [stats, setStats] = useState<AppStats>({
    totalFiles: 0,
    totalSize: 0,
    analyzedCount: 0,
    genreSignals: {},
    bpmDistribution: {}
  });

  useEffect(() => {
    const completed = localStorage.getItem('lemon6_onboarding_complete');
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('lemon6_onboarding_complete', 'true');
    setShowOnboarding(false);
  };

  const resetApp = () => {
    setRawFiles([]);
    setAnalyzedMetadata([]);
    setProgress(0);
    setStats({ totalFiles: 0, totalSize: 0, analyzedCount: 0, genreSignals: {}, bpmDistribution: {} });
  };

  const updateTrack = (id: string, updates: Partial<AnalyzedMetadata>) => {
    setAnalyzedMetadata(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const processFiles = useCallback(async (fileList: FileList) => {
    setIsProcessing(true);
    setProgress(0);
    
    const validFiles: File[] = [];
    let totalSize = 0;

    for (let i = 0; i < fileList.length; i++) {
      if (isMusicFile(fileList[i].name)) {
        validFiles.push(fileList[i]);
        totalSize += fileList[i].size;
      }
    }

    if (validFiles.length === 0) {
      alert("No valid music files found in this directory.");
      setIsProcessing(false);
      return;
    }

    const raw: RawFile[] = validFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      name: f.name,
      relativePath: (f as any).webkitRelativePath || f.name,
      size: f.size,
      type: f.type,
      lastModified: f.lastModified
    }));

    setRawFiles(raw);
    
    const analyzed: AnalyzedMetadata[] = [];
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const relativePath = (file as any).webkitRelativePath || file.name;
      const heuristics = extractHeuristics(relativePath);
      
      try {
        const metadata = await mm.parseBlob(file);
        analyzed.push({
          id: Math.random().toString(36).substr(2, 9),
          title: metadata.common.title,
          artist: metadata.common.artist,
          album: metadata.common.album,
          genre: metadata.common.genre,
          year: metadata.common.year,
          bpm: metadata.common.bpm,
          duration: metadata.format.duration,
          sampleRate: metadata.format.sampleRate,
          bitrate: metadata.format.bitrate,
          format: metadata.format.container || 'Unknown',
          fileSize: file.size,
          fileName: file.name,
          relativePath: relativePath,
          heuristics: heuristics
        });
      } catch (err) {
        analyzed.push({
          id: Math.random().toString(36).substr(2, 9),
          format: file.name.split('.').pop()?.toUpperCase() || '???',
          fileSize: file.size,
          fileName: file.name,
          relativePath: relativePath,
          heuristics: heuristics
        });
      }
      
      const currentProgress = Math.round(((i + 1) / validFiles.length) * 100);
      setProgress(currentProgress);
      
      if ((i + 1) % 50 === 0 || i === validFiles.length - 1) {
        setAnalyzedMetadata([...analyzed]);
        setStats({
          totalFiles: raw.length,
          totalSize: totalSize,
          analyzedCount: analyzed.length,
          genreSignals: {},
          bpmDistribution: {}
        });
      }
    }

    setIsProcessing(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-charcoal text-white selection:bg-lemon selection:text-charcoal">
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      
      <Header 
        mode={mode} 
        setMode={setMode} 
        onReset={resetApp} 
        onShowOnboarding={() => setShowOnboarding(true)}
      />
      
      <main className="flex-1 p-8 lg:p-12 max-w-[1600px] mx-auto w-full flex flex-col gap-10">
        {rawFiles.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
            <div className="text-center mb-16 space-y-4">
              <h1 className="text-6xl font-black tracking-tightest text-white uppercase drop-shadow-2xl">
                Ready to Map your <span className="text-lemon">Library?</span>
              </h1>
              <p className="text-gray-400 text-xl font-medium max-w-2xl mx-auto">
                Select your root music folder. Lemon 6 scans recursively, extracting professional metadata and deriving genre insights from your folder structure.
              </p>
            </div>
            <FileUploader onFilesSelected={processFiles} isProcessing={isProcessing} />
            <div className="mt-16 flex gap-12 text-[10px] font-black text-gray-600 uppercase tracking-widest">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-lemon"/> Local Only Processing</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-lemon"/> AI-Ready Exports</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-lemon"/> Recursive Scanning</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10 animate-in slide-in-from-bottom-4 duration-500">
            <StatsCard stats={stats} />
            
            {isProcessing && (
              <div className="bg-darkgray border border-lemon/20 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                  <div className="h-full bg-lemon animate-pulse" style={{ width: '100%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-lemon/10 flex items-center justify-center">
                      <Loader2 className="animate-spin text-lemon" size={24} />
                    </div>
                    <div>
                      <h4 className="text-white font-black uppercase tracking-widest text-sm">Extracting Metadata</h4>
                      <p className="text-gray-500 text-xs font-mono">Scanning deep directory structures...</p>
                    </div>
                  </div>
                  <span className="text-lemon text-2xl font-black font-mono">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div 
                    className="h-full bg-lemon transition-all duration-500 ease-out shadow-[0_0_15px_#CCFF00]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 min-h-[700px]">
              {mode === AppMode.RAW ? (
                <RawView files={rawFiles} />
              ) : mode === AppMode.ANALYSIS ? (
                <AnalysisView data={analyzedMetadata} />
              ) : (
                <IntelligenceView data={analyzedMetadata} onUpdateTrack={updateTrack} />
              )}
            </div>

            <footer className="flex justify-between items-center py-6 border-t border-white/5 text-[10px] font-black tracking-[0.3em] text-gray-600 uppercase">
              <span className="flex items-center gap-3">
                <Music2 size={14} className="text-lemon" />
                Lemon_6_Studio_Edition_Stable
              </span>
              <span className="flex items-center gap-3">
                <span className="w-2 h-2 bg-lemon rounded-full animate-pulse shadow-[0_0_8px_#CCFF00]" />
                System_Latent_Optimal
              </span>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
