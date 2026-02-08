
import { RawFile, AnalyzedMetadata, HeuristicSignal, AIProvider } from './types';

/**
 * Safely generates a unique ID checking for crypto support
 */
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

/**
 * Sanitizes strings to prevent basic XSS and injection
 */
export const sanitizeString = (str: string | undefined): string => {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

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
  const headers = ['Artist', 'Track Name', 'Folder'];
  
  const rows = data.map(m => {
    const artist = m.artist || 'Unknown Artist';
    const title = m.title || m.fileName.split('.')[0];
    const folder = m.heuristics.map(h => h.value).join('/') || 'Root';
    return [artist, title, folder].map(val => `"${val}"`).join(',');
  });

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
  return ['mp3', 'wav', 'flac', 'aiff', 'm4a', 'aac', 'ogg'].includes(ext || '');
};

/**
 * Validates a file before processing
 * Checks size (max 500MB) and music extension
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 500MB limit' };
  }
  if (!isMusicFile(file.name)) {
    return { valid: false, error: 'Unsupported file format' };
  }
  return { valid: true };
};

export const extractHeuristics = (path: string): HeuristicSignal[] => {
  const parts = path.split('/');
  parts.pop();
  return parts.map((part, index) => ({
    level: index,
    value: sanitizeString(part),
    source: 'folder_name' as const
  }));
};

/**
 * Parsing rule: "Artist - Track Name"
 * Also cleans artist names by removing "_" and "."
 */
export const parseArtistTitle = (fileName: string) => {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
  let artist: string | undefined;
  let title: string = nameWithoutExt.trim();

  if (nameWithoutExt.includes(" - ")) {
    const parts = nameWithoutExt.split(" - ");
    artist = parts[0].trim();
    title = parts.slice(1).join(" - ").trim();
  }

  // Clean artist name if exists
  if (artist) {
    artist = artist.replace(/[_\.]/g, ' ').trim();
  }

  return { 
    artist: sanitizeString(artist), 
    title: sanitizeString(title) 
  };
};

export const generateExternalAIPrompt = (provider: AIProvider, libraryText: string, intent: string) => {
  const systemRole = "You are a world-class DJ music curator and library organization expert.";
  const task = `Based on the following music library list, please: ${intent || 'analyze the collection and suggest a creative 1-hour set with transition reasoning'}.`;
  
  return `[${provider} Prompt Mode]
${systemRole}

${task}

LIBRARY DATA:
---
${libraryText}
---

Output format requested: Structured list of tracks with BPM, Key, and "Why this works" descriptions.`;
};
