
import React, { useState, useCallback } from 'react';
import * as mm from 'music-metadata-browser';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { RawView } from './components/RawView';
import { AnalysisView } from './components/AnalysisView';
import { IntelligenceView } from './components/IntelligenceView';
import { StatsCard } from './components/StatsCard';
import { AppMode, RawFile, AnalyzedMetadata, AppStats } from './types';
import { isMusicFile, extractHeuristics } from './utils';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.RAW);
  const [rawFiles, setRawFiles] = useState<RawFile[]>([]);
  const [analyzedMetadata, setAnalyzedMetadata] = useState<AnalyzedMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<AppStats>({
    totalFiles: 0,
    totalSize: 0,
    analyzedCount: 0,
    genreSignals: {},
    bpmDistribution: {}
  });

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
    
    // Start background analysis
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
    <div className="min-h-screen flex flex-col font-sans">
      <Header mode={mode} setMode={setMode} onReset={resetApp} />
      
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        {rawFiles.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <FileUploader onFilesSelected={processFiles} isProcessing={isProcessing} />
          </div>
        ) : (
          <>
            <StatsCard stats={stats} />
            
            {isProcessing && (
              <div className="bg-charcoal border border-lemon/20 rounded-xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-lemon font-bold">
                    <Loader2 className="animate-spin" size={18} />
                    ANALYZING LIBRARY METADATA...
                  </div>
                  <span className="text-gray-400 font-mono">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-lemon transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 h-[60vh] min-h-[500px]">
              {mode === AppMode.RAW ? (
                <RawView files={rawFiles} />
              ) : mode === AppMode.ANALYSIS ? (
                <AnalysisView data={analyzedMetadata} />
              ) : (
                <IntelligenceView data={analyzedMetadata} onUpdateTrack={updateTrack} />
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-gray-500 uppercase">
              <span>LEMON_6_UTILITY_V1.1_AI_ENABLED</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-lemon rounded-full animate-pulse" />
                SYSTEM_READY_INTEL_READY
              </span>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
