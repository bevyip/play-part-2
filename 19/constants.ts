import { Song } from './types';

// Import images - Vite will handle these as URLs
import arianaImg from './img/ariana.jfif';
import impalaImg from './img/impala.jpg';
import kehlaniImg from './img/kehlani.jpg';
import laufeyImg from './img/laufey.png';
import madisonImg from './img/madison.jpg';
import maroonImg from './img/maroon.jpg';
import mileyImg from './img/miley.jfif';
import oliviaImg from './img/olivia.jfif';
import sabrinaImg from './img/sabrina.jpg';
import zaraImg from './img/zara.jpg';

// Import audio files
import bittersweetAudio from './audio/bittersweet.mp3';
import maroonAudio from './audio/maroon.mp3';
import zaraAudio from './audio/zara.mp3';
import laufeyAudio from './audio/laufey.mp3';
import impalaAudio from './audio/impala.mp3';
import arianaAudio from './audio/ariana.mp3';
import oliviaAudio from './audio/olivia.mp3';
import mileyAudio from './audio/miley.mp3';
import kehlaniAudio from './audio/kehlani.mp3';
import sabrinaAudio from './audio/sabrina.mp3';

export const RADIUS = 6;
export const CARD_WIDTH = 3;
export const CARD_HEIGHT = 3;

// Top 10 Popular Songs Mock Data
export const SONGS: Song[] = [
  { id: 4, name: "Dracula", artist: "Tame Impala", albumArt: impalaImg, audio: impalaAudio },
  { id: 5, name: "Bittersweet", artist: "Madison Beer", albumArt: madisonImg, audio: bittersweetAudio },
  { id: 1, name: "Lips On You", artist: "Maroon 5", albumArt: maroonImg, audio: maroonAudio },
  { id: 2, name: "Midnight Sun", artist: "Zara Larsson", albumArt: zaraImg, audio: zaraAudio },
  { id: 3, name: "Forget Me Not", artist: "Laufey", albumArt: laufeyImg, audio: laufeyAudio },
  { id: 6, name: "Hampstead", artist: "Ariana Grande", albumArt: arianaImg, audio: arianaAudio },
  { id: 7, name: "Lacy", artist: "Olivia Rodrigo", albumArt: oliviaImg, audio: oliviaAudio },
  { id: 8, name: "Easy Lover", artist: "Miley Cyrus", albumArt: mileyImg, audio: mileyAudio },
  { id: 9, name: "Folded", artist: "Kehlani", albumArt: kehlaniImg, audio: kehlaniAudio },
  { id: 10, name: "When Did You Get Hot", artist: "Sabrina Carpenter", albumArt: sabrinaImg, audio: sabrinaAudio },
];