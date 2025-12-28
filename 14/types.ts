export interface SpriteMatrix {
  front: string[][];
  back: string[][];
  left: string[][];
  right: string[][];
}

export interface SpriteResult {
  matrix: SpriteMatrix;
  type: 'humanoid' | 'object' | 'wide_object' | 'tall_object' | 'square_object';
  dimensions: {
    width: number;
    height: number;
  };
  palette: string[];
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ProcessingState {
  status: ProcessingStatus;
  error?: string;
}