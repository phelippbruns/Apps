
import { RawFile, AnalyzedMetadata, HeuristicSignal, AIProvider } from './types';
import { GoogleGenAI, Type } from "@google/genai";

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatDuration = (seconds?: number) => {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getRawDiscographyText = (files: RawFile[]) => {
  return files.map(f => f.relativePath).join('\n');
};

export const downloadTxt = (files: RawFile[]) => {
  const content = getRawDiscographyText(files);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lemon6_raw_discography_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadCsv = (data: AnalyzedMetadata[]) => {
  const headers = [
    'filepath', 'filename', 'title', 'artist', 'album', 
    'genre', 'folder_signals', 'bpm', 'duration', 'format', 'filesize'
  ];
  
  const rows = data.map(m => [
    m.relativePath,
    m.fileName,
    m.title || '',
    m.artist || '',
    m.album || '',
    (m.genre || []).join(';'),
    m.heuristics.map(h => h.value).join('|'),
    m.bpm || '',
    m.duration?.toFixed(2) || '',
    m.format,
    m.fileSize
  ].map(val => `"${val}"`).join(','));

  const content = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lemon6_analysis_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const isMusicFile = (fileName: string) => {
  const ext = fileName.toLowerCase().split('.').pop();
  return ['mp3', 'wav', 'flac', 'aiff', 'm4a', 'ogg'].includes(ext || '');
};

export const extractHeuristics = (path: string): HeuristicSignal[] => {
  const parts = path.split('/');
  parts.pop();
  return parts.map((part, index) => ({
    level: index,
    value: part,
    source: 'folder_name' as const
  }));
};

export const generateExternalAIPrompt = (provider: AIProvider, libraryText: string, intent: string) => {
  const systemRole = "You are a world-class DJ music curator and library organization expert.";
  const task = `Based on the following music library list, please: ${intent || 'analyze the collection and suggest a creative 1-hour set with transition reasoning'}.`;
  
  return `[${provider} Prompt Mode]
${systemRole}

${task}

LIBRARY DATA:
---
${libraryText.slice(0, 15000)}${libraryText.length > 15000 ? '\n... (truncated for context limits)' : ''}
---

Output format requested: Structured list of tracks with BPM, Key, and "Why this works" descriptions.`;
};

export const getGeminiSetSuggestions = async (tracks: AnalyzedMetadata[], intent: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const trackSnapshot = tracks.map(t => ({
    id: t.id,
    name: t.fileName,
    folder: t.heuristics.map(h => h.value).join('/'),
    bpm: t.bpm,
    key: t.key
  })).slice(0, 50);

  const prompt = `Act as a world-class DJ music curator. 
Analyze these tracks and suggest a set list for this intent: "${intent}".
Track list:
${JSON.stringify(trackSnapshot)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              trackId: { type: Type.STRING },
              transitionReason: { type: Type.STRING },
              energy: { type: Type.NUMBER },
              grouping: { type: Type.STRING },
            },
            required: ["trackId", "transitionReason", "energy", "grouping"],
          }
        },
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const jsonStr = response.text?.trim() || '[]';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return [];
  }
};
