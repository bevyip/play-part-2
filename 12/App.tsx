import React, { useState, useDeferredValue } from 'react';
import Controls from './components/Controls';
import SnowflakeCanvas from './components/SnowflakeCanvas';
import { SnowflakeConfig } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<SnowflakeConfig>({
    word: 'ICE',
    branches: 6,
    density: 24,
    spread: 40,
    fontSize: 12,
    spurAngle: 60,
    rotationSpeed: 0,
    opacity: 0.8,
    isRotating: true,
  });

  // Defer the configuration passed to the canvas to keep UI responsive
  const deferredConfig = useDeferredValue(config);

  const toggleRotation = () => {
    setConfig(prev => ({ ...prev, isRotating: !prev.isRotating }));
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-black overflow-hidden">
      
      {/* Visual Section: Top on Mobile, Right on Desktop */}
      <div className="relative order-1 md:order-2 w-full h-[40vh] md:h-full md:flex-1 bg-black">
        <SnowflakeCanvas config={deferredConfig} />
        
        {/* Rotation Toggle Button - Floating in the visual area */}
        <button
          onClick={toggleRotation}
          className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-white/40 group focus:outline-none pointer-events-auto z-20"
          aria-label={config.isRotating ? "Pause Rotation" : "Start Rotation"}
        >
          {config.isRotating ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 text-white/80 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 text-white/80 group-hover:text-white pl-0.5" viewBox="0 0 24 24" fill="currentColor">
               <path d="M8 5v14l11-7z" />
             </svg>
          )}
        </button>
      </div>

      {/* Controls Section: Bottom on Mobile, Left on Desktop */}
      <div className="relative order-2 md:order-1 w-full h-[60vh] md:h-full md:w-[450px] z-10 bg-[#0a0a0a] md:bg-transparent border-t border-white/10 md:border-t-0 md:border-r shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-none">
         <Controls config={config} onChange={setConfig} />
      </div>

    </div>
  );
};

export default App;