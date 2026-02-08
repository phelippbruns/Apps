
export enum AppMode {
  RAW = 'RAW',
  ANALYSIS = 'ANALYSIS',
  INTELLIGENCE = 'INTELLIGENCE'
}

export type Language = 'en' | 'pt' | 'es';

/**
 * Supported AI Providers for prompt generation
 */
export type AIProvider = 'ChatGPT' | 'Gemini' | 'Claude';

export interface RawFile {
  id: string;
  name: string;
  relativePath: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface HeuristicSignal {
  level: number;
  value: string;
  source: 'folder_name';
}

export interface AnalyzedMetadata {
  id: string;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string[];
  year?: number;
  bpm?: number;
  key?: string;
  duration?: number;
  sampleRate?: number;
  bitrate?: number;
  format: string;
  fileSize: number;
  fileName: string;
  relativePath: string;
  heuristics: HeuristicSignal[];
}

export interface ScanHistory {
  id: string;
  timestamp: number;
  folderName: string;
  fileCount: number;
  files: RawFile[];
  metadata: AnalyzedMetadata[];
}

export interface AppStats {
  totalFiles: number;
  totalSize: number;
  analyzedCount: number;
  totalFolders: number;
  topFolder: string;
  maxFiles: number;
}
