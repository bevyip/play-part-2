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
    <div className="absolute top-4 right-4 bottom-4 md:bottom-auto md:max-h-[calc(100vh-2rem)] overflow-y-auto md:overflow-y-visible bg-black/60 backdrop-blur-sm rounded-lg p-4 md:p-6 w-[calc(100vw-2rem)] max-w-xs z-10 border border-white/10 controls-scrollbar">
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
    </div>
  );
};

export default Controls;

