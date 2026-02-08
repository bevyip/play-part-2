import React, { useState, useEffect } from 'react';
import { CardProps } from '../types';

const SpotifyCard: React.FC<CardProps> = ({ 
  song, 
  angle,
  isFrontCard,
  isLeftCard,
  isRightCard,
  onAudioPlay,
  onCardClick,
  registerAudioRef,
  isPlaying
}) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      registerAudioRef(song.id, audioRef.current);
    }
    return () => {
      registerAudioRef(song.id, null);
    };
  }, [song.id, registerAudioRef]);
  // Calculate responsive translateZ based on viewport width
  const [translateZ, setTranslateZ] = useState(() => {
    if (typeof window === 'undefined') return 500;
    const width = window.innerWidth;
    if (width <= 480) return 300;
    if (width <= 768) return 400;
    return 500;
  });

  useEffect(() => {
    const updateTranslateZ = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setTranslateZ(300);
      } else if (width <= 768) {
        setTranslateZ(400);
      } else {
        setTranslateZ(500);
      }
    };

    window.addEventListener('resize', updateTranslateZ);
    return () => window.removeEventListener('resize', updateTranslateZ);
  }, []);

  const handleClick = () => {
    if (!isFrontCard) return;
    onAudioPlay(song.id);
  };

  const handleCardWrapperClick = (e: React.MouseEvent) => {
    // Only handle clicks on adjacent cards (not the front card)
    if (isFrontCard) return;
    
    // Prevent event from bubbling to play button
    e.stopPropagation();
    
    if (isLeftCard) {
      onCardClick('left');
    } else if (isRightCard) {
      onCardClick('right');
    }
  };

  const isAdjacentCard = isLeftCard || isRightCard;

  return (
    <div
      className="card-wrapper"
      style={{
        transform: `rotateY(${angle}deg) translateZ(${translateZ}px)`,
        transformStyle: 'preserve-3d',
        pointerEvents: (isFrontCard || isAdjacentCard) ? 'auto' : 'none',
        cursor: isAdjacentCard ? 'pointer' : 'default',
      }}
      onClick={handleCardWrapperClick}
    >
      <div 
        className="card"
        style={{
          transform: isFrontCard ? 'scale(1)' : 'scale(0.8)',
          cursor: isAdjacentCard ? 'pointer' : 'default',
        }}
      >
        <img
          src={song.albumArt}
          alt={`${song.name} by ${song.artist}`}
        />
        <div className="artist-name">
          {song.artist}
        </div>
        {isFrontCard && (
          <button 
            key={song.id}
            className="play-button"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            aria-label={isPlaying ? "Pause song" : "Play song"}
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={song.audio}
        preload="metadata"
      />
      {/* Song name displayed below card when in front view */}
      {isFrontCard && (
        <div key={song.id} className="song-name">
          {song.name}
        </div>
      )}
    </div>
  );
};

export default SpotifyCard;
