import React from 'react';
import SpotifyJukebox from './components/SpotifyJukebox';

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen relative bg-[#121212] overflow-hidden font-sans">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <SpotifyJukebox />
      </div>
    </div>
  );
};

export default App;