
import { RawFile, AnalyzedMetadata, HeuristicSignal } from './types';
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

export const downloadTxt = (files: RawFile[]) => {
  const content = files.map(f => f.relativePath).join('\n');
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
  // Remove the filename itself
  parts.pop();
  return parts.map((part, index) => ({
    level: index,
    value: part,
    source: 'folder_name' as const
  }));
};

/**
 * Fixed: Implemented responseSchema using Type from @google/genai for reliable JSON responses.
 * Follows the standard Google GenAI SDK practices for complex text tasks.
 */
export const getGeminiSetSuggestions = async (tracks: AnalyzedMetadata[], intent: string) => {
  // Always initialize with apiKey from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Minimal data to save tokens and context
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
              trackId: {
                type: Type.STRING,
                description: 'The unique ID of the track provided in the list.',
              },
              transitionReason: {
                type: Type.STRING,
                description: 'Reasoning behind the transition from the previous track.',
              },
              energy: {
                type: Type.NUMBER,
                description: 'Musical energy level on a scale of 1-10.',
              },
              grouping: {
                type: Type.STRING,
                description: 'A cluster or thematic group name for the track.',
              },
            },
            required: ["trackId", "transitionReason", "energy", "grouping"],
            propertyOrdering: ["trackId", "transitionReason", "energy", "grouping"],
          }
        },
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    // Accessing .text property directly (not a method)
    const jsonStr = response.text?.trim() || '[]';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return [];
  }
};
