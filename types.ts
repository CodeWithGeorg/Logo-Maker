
export interface GenerationHistoryItem {
  id: string;
  originalImage?: string;
  generatedImage: string;
  prompt: string;
  mode: AppMode;
  timestamp: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type AppMode = 'modernize' | 'create';
