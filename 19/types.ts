export interface Song {
  id: number;
  name: string;
  artist: string;
  albumArt: string;
  audio: string;
}

export interface CardProps {
  song: Song;
  angle: number;
  isFrontCard: boolean;
  isLeftCard: boolean;
  isRightCard: boolean;
  onAudioPlay: (songId: number) => void;
  onCardClick: (direction: 'left' | 'right') => void;
  registerAudioRef: (songId: number, audioElement: HTMLAudioElement | null) => void;
  isPlaying: boolean;
}