import React from 'react';
import Slider from './Slider';

export interface GridDistortionConfig {
  grid: number;
  strength: number;
  mouse: number;
  relaxation: number;
}

interface ControlsProps {
  config: GridDistortionConfig;
  onChange: (newConfig: GridDistortionConfig) => void;
}

const Controls: React.FC<ControlsProps> = ({ config, onChange }) => {
  const handleChange = (key: keyof GridDistortionConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-4 md:top-4 md:max-h-[calc(100vh-2rem)] max-h-[55vh] overflow-y-auto md:overflow-y-visible bg-black/80 backdrop-blur-md rounded-t-2xl md:rounded-lg p-4 md:p-6 pb-5 md:pb-6 w-full md:w-auto md:max-w-xs z-10 border-t md:border border-white/10 md:border-white/10 controls-scrollbar safe-area-inset-bottom shadow-2xl md:shadow-lg">
      {/* Drag handle indicator for mobile */}
      <div className="md:hidden flex justify-center mb-3">
        <div className="w-12 h-1 bg-white/30 rounded-full"></div>
      </div>
      <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-white">Controls</h2>
      
      <Slider 
        label="Pixel Size" 
        value={config.grid} 
        min={5} 
        max={50} 
        step={1}
        onChange={(value) => handleChange('grid', value)}
      />
      
      <Slider 
        label="Strength" 
        value={config.strength} 
        min={0.01} 
        max={0.5} 
        step={0.01}
        onChange={(value) => handleChange('strength', value)}
      />
      
      <Slider 
        label="Mouse Area" 
        value={config.mouse} 
        min={0.05} 
        max={0.5} 
        step={0.01}
        onChange={(value) => handleChange('mouse', value)}
      />
      
      <Slider 
        label="Relaxation" 
        value={config.relaxation} 
        min={0.5} 
        max={0.99} 
        step={0.01}
        onChange={(value) => handleChange('relaxation', value)}
      />
      
      {/* Extra padding at bottom for safe area on mobile */}
      <div className="md:hidden h-2"></div>
    </div>
  );
};

export default Controls;

