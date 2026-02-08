
import React, { useState, useCallback, useEffect } from 'react';
import * as mm from 'music-metadata-browser';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { RawView } from './components/RawView';
import { AnalysisView } from './components/AnalysisView';
import { IntelligenceView } from './components/IntelligenceView';
import { HistoryView } from './components/HistoryView';
import { StatsCard } from './components/StatsCard';
import { Onboarding } from './components/Onboarding';
import { LemonSliceLoader } from './components/LemonSliceLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppMode, RawFile, AnalyzedMetadata, AppStats, Language, ScanHistory } from './types';
import { isMusicFile, extractHeuristics, parseArtistTitle, sanitizeString, validateFile, generateId } from './utils';
import { Music2, CheckCircle2 } from 'lucide-react';
import { TRANSLATIONS } from './translations';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.RAW);
  const [rawFiles, setRawFiles] = useState<RawFile[]>([]);
  const [analyzedMetadata, setAnalyzedMetadata] = useState<AnalyzedMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [intelligenceContext, setIntelligenceContext] = useState<AnalyzedMetadata[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [useSelectionIfAvailable, setUseSelectionIfAvailable] = useState(true);
  
  const [stats, setStats] = useState<AppStats>({
    totalFiles: 0,
    totalSize: 0,
    analyzedCount: 0,
    totalFolders: 0,
    topFolder: '',
    maxFiles: 0
  });

  useEffect(() => {
    if (selectedIds.size > 0) {
      const selectedTracks = analyzedMetadata.filter(d => selectedIds.has(d.id));
      setIntelligenceContext(selectedTracks);
    } else {
      setIntelligenceContext(null);
    }
  }, [selectedIds, analyzedMetadata]);

  useEffect(() => {
    if (mode === AppMode.ANALYSIS && selectedIds.size === 0) {
      setIntelligenceContext(null);
    }
  }, [mode, selectedIds.size]);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('lemon6_lang');
      if (savedLang) setLang(savedLang as Language);

      const savedHistory = localStorage.getItem('lemon6_scan_history');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          setHistory(parsedHistory);
        }
      }

      const completed = localStorage.getItem('lemon6_onboarding_complete');
      if (!completed) {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.warn('Failed to restore data from local storage:', err);
    }
  }, []);

  const changeLanguage = (l: Language) => {
    setLang(l);
    localStorage.setItem('lemon6_lang', l);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('lemon6_onboarding_complete', 'true');
    setShowOnboarding(false);
  };

  const resetApp = () => {
    setRawFiles([]);
    setAnalyzedMetadata([]);
    setIntelligenceContext(null);
    setSelectedIds(new Set());
    setUseSelectionIfAvailable(true);
    setStats({ totalFiles: 0, totalSize: 0, analyzedCount: 0, totalFolders: 0, topFolder: '', maxFiles: 0 });
    setMode(AppMode.RAW);
  };

  const reopenScan = (id: string) => {
    const scan = history.find(h => h.id === id);
    if (scan) {
      setRawFiles(scan.files);
      setAnalyzedMetadata(scan.metadata);
      setIntelligenceContext(null);
      setSelectedIds(new Set());
      setUseSelectionIfAvailable(true);
      setMode(AppMode.ANALYSIS);
    }
  };

  const handleIntelligenceJump = (tracks: AnalyzedMetadata[]) => {
    if (selectedIds.size === 0) {
      setIntelligenceContext(tracks);
    }
    setMode(AppMode.INTELLIGENCE);
  };

  const handleToggleIAContext = () => {
    if (mode === AppMode.INTELLIGENCE && selectedIds.size > 0) {
      setUseSelectionIfAvailable(!useSelectionIfAvailable);
    }
  };

  const processFiles = useCallback(async (fileList: FileList) => {
    setIsProcessing(true);
    setSuccessMessage(null);
    
    const validFiles: File[] = [];
    const encounteredFileNames = new Set<string>();
    let totalSize = 0;

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const validation = validateFile(file);
        
        if (validation.valid) {
          if (encounteredFileNames.has(file.name)) continue;
          validFiles.push(file);
          encounteredFileNames.add(file.name);
          totalSize += file.size;
        } else {
          console.warn(`Skipping file: ${file.name} - ${validation.error}`);
        }
      }

      if (validFiles.length === 0) {
        alert("No valid music files (max 500MB) found in this selection.");
        setIsProcessing(false);
        return;
      }

      const raw: RawFile[] = validFiles.map(f => ({
        id: generateId(),
        name: sanitizeString(f.name),
        relativePath: sanitizeString((f as any).webkitRelativePath || f.name),
        size: f.size,
        type: sanitizeString(f.type),
        lastModified: f.lastModified
      }));

      setRawFiles(raw);
      const analyzed: AnalyzedMetadata[] = [];
      const folders = new Set<string>();

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const relativePath = (file as any).webkitRelativePath || file.name;
        const heuristics = extractHeuristics(relativePath);
        const folderPath = relativePath.split('/').slice(0, -1).join('/') || 'Root';
        folders.add(folderPath);
        const parsed = parseArtistTitle(file.name);
        
        try {
          const metadata = await mm.parseBlob(file);
          analyzed.push({
            id: raw[i].id,
            title: sanitizeString(metadata.common.title || parsed.title),
            artist: sanitizeString(metadata.common.artist || parsed.artist),
            album: sanitizeString(metadata.common.album),
            genre: metadata.common.genre?.map(g => sanitizeString(g)),
            year: metadata.common.year,
            bpm: metadata.common.bpm,
            duration: metadata.format.duration,
            sampleRate: metadata.format.sampleRate,
            bitrate: metadata.format.bitrate,
            format: sanitizeString(metadata.format.container || file.name.split('.').pop()?.toUpperCase() || 'Unknown'),
            fileSize: file.size,
            fileName: sanitizeString(file.name),
            relativePath: sanitizeString(relativePath),
            heuristics: heuristics
          });
        } catch (err) {
          analyzed.push({
            id: raw[i].id,
            title: parsed.title,
            artist: parsed.artist,
            genre: undefined,
            format: sanitizeString(file.name.split('.').pop()?.toUpperCase() || '???'),
            fileSize: file.size,
            fileName: sanitizeString(file.name),
            relativePath: sanitizeString(relativePath),
            heuristics: heuristics
          });
        }
      }

      const rootFolderName = raw[0]?.relativePath.split('/')[0] || 'root';

      setAnalyzedMetadata(analyzed);
      setStats({
        totalFiles: raw.length,
        totalSize: totalSize,
        analyzedCount: analyzed.length,
        totalFolders: folders.size,
        topFolder: rootFolderName,
        maxFiles: raw.length
      });

      const newScan: ScanHistory = {
        id: generateId(),
        timestamp: Date.now(),
        folderName: sanitizeString(rootFolderName),
        fileCount: raw.length,
        files: raw,
        metadata: analyzed
      };
      const updatedHistory = [newScan, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('lemon6_scan_history', JSON.stringify(updatedHistory));

      setIsProcessing(false);
      setSuccessMessage(TRANSLATIONS[lang].uploadSuccess);
      setTimeout(() => {
        setSuccessMessage(null);
        setMode(AppMode.ANALYSIS);
      }, 1500);
    } catch (globalErr) {
      console.error('Critical library processing failure:', globalErr);
      setIsProcessing(false);
      alert('Failed to process library. Check file access permissions.');
    }
  }, [history, lang]);

  const t = TRANSLATIONS[lang];

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col font-sans bg-charcoal text-white selection:bg-lemon selection:text-charcoal">
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} lang={lang} />}
        {isProcessing && <LemonSliceLoader lang={lang} />}
        {successMessage && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[210] animate-in slide-in-from-top-4 duration-300">
            <div className="bg-lemon text-charcoal px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-3 border border-lemon/20">
              <CheckCircle2 size={24} />
              {successMessage}
            </div>
          </div>
        )}

        <Header 
          mode={mode} 
          setMode={setMode} 
          onReset={resetApp} 
          onShowOnboarding={() => setShowOnboarding(true)}
          lang={lang}
          setLang={changeLanguage}
          hasFiles={rawFiles.length > 0}
          hasHistory={history.length > 0}
        />
        
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-8">
          {mode === AppMode.RAW && rawFiles.length === 0 ? (
            <div className="flex-1 flex flex-col gap-8 animate-in fade-in duration-700">
              <div className="flex flex-col items-center justify-center pt-8 pb-12">
                <div className="text-center mb-10 space-y-3">
                  <h1 className="text-5xl font-black tracking-tightest text-white uppercase drop-shadow-2xl">
                    {t.readyToMap} <span className="text-lemon">{t.library}</span>
                  </h1>
                  <p className="text-gray-400 text-lg font-medium max-w-2xl mx-auto opacity-80">
                    {t.selectFolderDesc}
                  </p>
                </div>
                <FileUploader onFilesSelected={processFiles} isProcessing={isProcessing} lang={lang} />
                <div className="mt-10 flex gap-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-lemon"/> {t.localOnly}</span>
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-lemon"/> {t.aiReady}</span>
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-lemon"/> {t.recursive}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {rawFiles.length > 0 && mode !== AppMode.HISTORY && (
                <StatsCard 
                  stats={stats} 
                  lang={lang} 
                  isCustomSelection={selectedIds.size > 0 && mode !== AppMode.RAW} 
                  isIAMode={mode === AppMode.INTELLIGENCE}
                  onToggleContext={handleToggleIAContext}
                  useSelectionIfAvailable={useSelectionIfAvailable}
                />
              )}
              
              <div className="flex-1 min-h-[700px]">
                {mode === AppMode.RAW ? (
                  <RawView files={rawFiles} analyzedMetadata={analyzedMetadata} lang={lang} />
                ) : mode === AppMode.HISTORY ? (
                  <HistoryView history={history} lang={lang} onReopen={reopenScan} />
                ) : mode === AppMode.ANALYSIS ? (
                  <AnalysisView 
                    data={analyzedMetadata} 
                    lang={lang} 
                    rawFiles={rawFiles} 
                    onIntelligenceJump={handleIntelligenceJump}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                  />
                ) : (
                  <IntelligenceView 
                    data={analyzedMetadata} 
                    lang={lang} 
                    contextData={intelligenceContext} 
                    useSelectionIfAvailable={useSelectionIfAvailable}
                  />
                )}
              </div>

              <footer className="flex justify-between items-center py-6 border-t border-white/5 text-[10px] font-black tracking-[0.3em] text-gray-600 uppercase">
                <span className="flex items-center gap-3">
                  <Music2 size={14} className="text-lemon" />
                  {t.stableEdition}
                </span>
                
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-lemon rounded-full animate-pulse shadow-[0_0_8px_#CCFF00]" />
                    {t.systemLatent}
                  </span>
                </div>
              </footer>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
