import React from 'react';
import RotatingCarousel from './RotatingCarousel';

const SpotifyJukebox: React.FC = () => {
  return (
    <div 
      className="w-full h-full relative"
      style={{
        background: 'linear-gradient(180deg, rgba(30, 215, 96, 0.08) 0%, #121212 100%)'
      }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <RotatingCarousel />
      </div>
    </div>
  );
};

export default SpotifyJukebox;
