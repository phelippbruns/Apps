
export enum AppMode {
  RAW = 'RAW',
  ANALYSIS = 'ANALYSIS',
  INTELLIGENCE = 'INTELLIGENCE'
}

export type DataSource = 'filesystem' | 'folder_heuristic' | 'analyzed' | 'ai_suggested';

// Added RawFile interface to resolve 'no exported member' errors
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

export interface AISuggestion {
  groupName?: string;
  transitionReason?: string;
  energyEstimate?: number;
  compatibilityScore?: number;
}

export interface AnalyzedMetadata {
  id: string;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string[];
  year?: number;
  bpm?: number;
  key?: string; // Musical key
  duration?: number;
  sampleRate?: number;
  bitrate?: number;
  format: string;
  fileSize: number;
  fileName: string;
  relativePath: string;
  heuristics: HeuristicSignal[];
  aiSuggestions?: AISuggestion;
}

export interface AppStats {
  totalFiles: number;
  totalSize: number;
  analyzedCount: number;
  genreSignals: Record<string, number>;
  bpmDistribution: Record<string, number>;
}
