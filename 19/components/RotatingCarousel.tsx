import React, { useState, useRef, useEffect } from 'react';
import { SONGS } from '../constants';
import SpotifyCard from './SpotifyCard';
import AudioWaveformBackground from './AudioWaveformBackground';

const RotatingCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingSongId, setPlayingSongId] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRefs = useRef<{ [key: number]: MediaElementAudioSourceNode | null }>({});

  // Set up audio analysis
  useEffect(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256; // Smaller = faster response to beats
        analyserRef.current.smoothingTimeConstant = 0.3; // Lower = more responsive to sudden changes (beats)
      } catch (error) {
        console.error('Error creating audio context:', error);
      }
    }

    let animationFrameId: number;
    
    // Update audio data continuously
    const updateAudioData = () => {
      if (analyserRef.current && playingSongId !== null && !isPaused) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        // Only update if we have valid data
        if (dataArray.length > 0) {
          setAudioData(dataArray);
        }
      } else {
        // Don't set to null immediately, let it fade out smoothly
        setAudioData(null);
      }
      animationFrameId = requestAnimationFrame(updateAudioData);
    };
    updateAudioData();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [playingSongId, isPaused]);

  // Handle audio end events
  useEffect(() => {
    if (playingSongId === null) return;

    const audio = audioRefs.current[playingSongId];
    if (!audio) return;

    const handleEnded = () => {
      setPlayingSongId(null);
      setIsPaused(false);
      setAudioData(null);
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playingSongId]);

  // Calculate rotation based on current index
  // Each card is 360 / totalCards degrees apart
  const anglePerCard = 360 / SONGS.length;
  const rotation = -currentIndex * anglePerCard; // Negative to rotate correctly

  const handlePrevious = () => {
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handleCardClick = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      handlePrevious();
    } else {
      handleNext();
    }
  };


  const handleAudioPlay = (songId: number) => {
    const audio = audioRefs.current[songId];
    if (!audio) return;

    // If clicking the same song that's playing, toggle pause/play
    if (playingSongId === songId && !audio.paused) {
      audio.pause();
      setIsPaused(true);
      return;
    }

    // If clicking the same song that's paused, resume
    if (playingSongId === songId && audio.paused) {
      // Resume audio context if suspended
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(console.error);
      }
      audio.play().catch((error) => {
        console.error('Error resuming audio:', error);
      });
      setIsPaused(false);
      return;
    }

    // Stop all other audio
    Object.keys(audioRefs.current).forEach((id) => {
      const otherAudio = audioRefs.current[Number(id)];
      if (otherAudio && Number(id) !== songId) {
        otherAudio.pause();
        otherAudio.currentTime = 0;
      }
    });

    // Resume audio context if suspended (required by browsers)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(console.error);
    }

    // Connect audio to analyzer (only if not already connected)
    if (audioContextRef.current && analyserRef.current && !sourceRefs.current[songId]) {
      try {
        const source = audioContextRef.current.createMediaElementSource(audio);
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        sourceRefs.current[songId] = source;
      } catch (error) {
        // If connection fails (e.g., already connected), just continue
        console.warn('Audio connection warning:', error);
      }
    }

    // Play the selected audio
    audio.volume = 0.5;
    const playPromise = audio.play();
    
    // Handle play promise (required for some browsers)
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setPlayingSongId(songId);
          setIsPaused(false);
        })
        .catch((error) => {
          console.error('Error playing audio:', error);
        });
    } else {
      setPlayingSongId(songId);
      setIsPaused(false);
    }
  };

  const registerAudioRef = (songId: number, audioElement: HTMLAudioElement | null) => {
    audioRefs.current[songId] = audioElement;
  };

  return (
    <div className="carousel-container">
      <AudioWaveformBackground audioData={audioData} />
      {/* Carousel Circle Container */}
      <div className="carousel-circle-container">
        <div
          className="carousel-scene"
          style={{
            transform: `rotateY(${rotation}deg)`,
          }}
        >
          {SONGS.map((song, index) => {
            const angle = (360 / SONGS.length) * index;
            // Use modulo to determine front card, but allow index to grow unbounded
            const normalizedIndex = ((currentIndex % SONGS.length) + SONGS.length) % SONGS.length;
            const isFrontCard = index === normalizedIndex;
            
            // Determine left and right adjacent cards
            const leftIndex = ((normalizedIndex - 1) + SONGS.length) % SONGS.length;
            const rightIndex = ((normalizedIndex + 1) + SONGS.length) % SONGS.length;
            const isLeftCard = index === leftIndex;
            const isRightCard = index === rightIndex;
            
            return (
              <SpotifyCard
                key={song.id}
                song={song}
                angle={angle}
                isFrontCard={isFrontCard}
                isLeftCard={isLeftCard}
                isRightCard={isRightCard}
                onAudioPlay={handleAudioPlay}
                onCardClick={handleCardClick}
                registerAudioRef={registerAudioRef}
                isPlaying={playingSongId === song.id && !isPaused}
              />
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default RotatingCarousel;
