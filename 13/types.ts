export interface AsciiSettings {
  emoji: string;
  resolution: number;
  contrast: number;
}

export const DEFAULT_SETTINGS: AsciiSettings = {
  emoji: '🍄',
  resolution: 100,
  contrast: 1.0,
};