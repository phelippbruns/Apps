
import React, { useState, useCallback, useEffect } from 'react';
import * as mm from 'music-metadata-browser';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { RawView } from './components/RawView';
import { AnalysisView } from './components/AnalysisView';
import { IntelligenceView } from './components/IntelligenceView';
import { StatsCard } from './components/StatsCard';
import { Onboarding } from './components/Onboarding';
import { LemonSliceLoader } from './components/LemonSliceLoader';
import { AppMode, RawFile, AnalyzedMetadata, AppStats, Language, ScanHistory } from './types';
import { isMusicFile, extractHeuristics, parseArtistTitle } from './utils';
import { Music2, Clock, CheckCircle2 } from 'lucide-react';
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
  
  const [stats, setStats] = useState<AppStats>({
    totalFiles: 0,
    totalSize: 0,
    analyzedCount: 0,
    totalFolders: 0,
    topFolder: '',
    maxFiles: 0
  });

  // Load language and history
  useEffect(() => {
    const savedLang = localStorage.getItem('lemon6_lang');
    if (savedLang) setLang(savedLang as Language);

    const savedHistory = localStorage.getItem('lemon6_scan_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const completed = localStorage.getItem('lemon6_onboarding_complete');
    if (!completed) {
      setShowOnboarding(true);
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
    setStats({ totalFiles: 0, totalSize: 0, analyzedCount: 0, totalFolders: 0, topFolder: '', maxFiles: 0 });
    setMode(AppMode.RAW);
  };

  const reopenScan = (id: string) => {
    const scan = history.find(h => h.id === id);
    if (scan) {
      setRawFiles(scan.files);
      setAnalyzedMetadata(scan.metadata);
      setMode(AppMode.ANALYSIS);
    }
  };

  const processFiles = useCallback(async (fileList: FileList) => {
    setIsProcessing(true);
    setSuccessMessage(null);
    
    const validFiles: File[] = [];
    const encounteredFileNames = new Set<string>();
    let totalSize = 0;

    for (let i = 0; i < fileList.length; i++) {
      if (isMusicFile(fileList[i].name)) {
        // Automatically ignore duplicated track names
        if (encounteredFileNames.has(fileList[i].name)) continue;
        
        validFiles.push(fileList[i]);
        encounteredFileNames.add(fileList[i].name);
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
    const folderCounts: Record<string, number> = {};
    const folders = new Set<string>();

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const relativePath = (file as any).webkitRelativePath || file.name;
      const heuristics = extractHeuristics(relativePath);
      
      const folderPath = relativePath.split('/').slice(0, -1).join('/') || 'Root';
      folders.add(folderPath);
      folderCounts[folderPath] = (folderCounts[folderPath] || 0) + 1;

      const parsed = parseArtistTitle(file.name);
      
      try {
        const metadata = await mm.parseBlob(file);
        analyzed.push({
          id: Math.random().toString(36).substr(2, 9),
          title: metadata.common.title || parsed.title,
          artist: metadata.common.artist || parsed.artist,
          album: metadata.common.album,
          genre: metadata.common.genre,
          year: metadata.common.year,
          bpm: metadata.common.bpm,
          duration: metadata.format.duration,
          sampleRate: metadata.format.sampleRate,
          bitrate: metadata.format.bitrate,
          format: metadata.format.container || file.name.split('.').pop()?.toUpperCase() || 'Unknown',
          fileSize: file.size,
          fileName: file.name,
          relativePath: relativePath,
          heuristics: heuristics
        });
      } catch (err) {
        analyzed.push({
          id: Math.random().toString(36).substr(2, 9),
          title: parsed.title,
          artist: parsed.artist,
          format: file.name.split('.').pop()?.toUpperCase() || '???',
          fileSize: file.size,
          fileName: file.name,
          relativePath: relativePath,
          heuristics: heuristics
        });
      }
    }

    let topFolder = 'N/A';
    let maxFiles = 0;
    Object.entries(folderCounts).forEach(([path, count]) => {
      if (count > maxFiles) {
        maxFiles = count;
        topFolder = path;
      }
    });

    setAnalyzedMetadata(analyzed);
    setStats({
      totalFiles: raw.length,
      totalSize: totalSize,
      analyzedCount: analyzed.length,
      totalFolders: folders.size,
      topFolder,
      maxFiles
    });

    // Save to history
    const rootName = raw[0]?.relativePath.split('/')[0] || 'Unknown Folder';
    const newScan: ScanHistory = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      folderName: rootName,
      fileCount: raw.length,
      files: raw,
      metadata: analyzed
    };
    const updatedHistory = [newScan, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('lemon6_scan_history', JSON.stringify(updatedHistory));

    setIsProcessing(false);
    
    // Success notification and redirect
    setSuccessMessage(TRANSLATIONS[lang].uploadSuccess);
    setTimeout(() => {
      setSuccessMessage(null);
      setMode(AppMode.ANALYSIS);
    }, 1500);
  }, [history, lang]);

  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-charcoal text-white selection:bg-lemon selection:text-charcoal">
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      
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
        disabledTabs={rawFiles.length === 0}
      />
      
      <main className="flex-1 p-8 lg:p-12 max-w-[1600px] mx-auto w-full flex flex-col gap-10">
        {rawFiles.length === 0 ? (
          <div className="flex-1 flex flex-col gap-10 animate-in fade-in duration-700">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-center mb-16 space-y-4">
                <h1 className="text-6xl font-black tracking-tightest text-white uppercase drop-shadow-2xl">
                  {t.readyToMap} <span className="text-lemon">{t.library}</span>
                </h1>
                <p className="text-gray-400 text-xl font-medium max-w-2xl mx-auto">
                  {t.selectFolderDesc}
                </p>
              </div>
              <FileUploader onFilesSelected={processFiles} isProcessing={isProcessing} />
              <div className="mt-16 flex gap-12 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-lemon"/> {t.localOnly}</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-lemon"/> {t.aiReady}</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-lemon"/> {t.recursive}</span>
              </div>
            </div>

            {history.length > 0 && (
               <div className="bg-darkgray p-8 rounded-3xl border border-white/5 space-y-6">
                 <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-3">
                   <Clock size={16} /> {t.lastScans}
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {history.map(scan => (
                     <div 
                       key={scan.id} 
                       onClick={() => reopenScan(scan.id)}
                       className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:border-lemon/30 transition-all cursor-pointer group"
                     >
                       <p className="text-white font-black text-lg mb-1 truncate">{scan.folderName}</p>
                       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">
                         {scan.fileCount} TRACKS
                       </p>
                       <button className="w-full py-3 rounded-xl bg-white/5 group-hover:bg-lemon group-hover:text-charcoal text-[10px] font-black uppercase tracking-widest transition-all">
                         {t.reopen}
                       </button>
                     </div>
                   ))}
                 </div>
               </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <StatsCard stats={stats} lang={lang} />
            
            <div className="flex-1 min-h-[700px]">
              {mode === AppMode.RAW ? (
                <RawView files={rawFiles} history={history} lang={lang} onReopen={reopenScan} />
              ) : mode === AppMode.ANALYSIS ? (
                <AnalysisView data={analyzedMetadata} lang={lang} rawFiles={rawFiles} />
              ) : (
                <IntelligenceView data={analyzedMetadata} lang={lang} />
              )}
            </div>

            <footer className="flex justify-between items-center py-6 border-t border-white/5 text-[10px] font-black tracking-[0.3em] text-gray-600 uppercase">
              <span className="flex items-center gap-3">
                <Music2 size={14} className="text-lemon" />
                Lemon_6_Studio_Edition_Stable
              </span>
              
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-lemon rounded-full animate-pulse shadow-[0_0_8px_#CCFF00]" />
                  System_Latent_Optimal
                </span>
              </div>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
