import React from 'react';
import { SnowflakeConfig } from '../types';
import Slider from './Slider';

interface ControlsProps {
  config: SnowflakeConfig;
  onChange: (newConfig: SnowflakeConfig) => void;
}

const Controls: React.FC<ControlsProps> = ({ config, onChange }) => {
  const handleChange = (key: keyof SnowflakeConfig, value: string | number) => {
    let newValue = value;
    if (key === 'word') {
      newValue = String(value).replace(/\s/g, '').slice(0, 12).toUpperCase(); 
    } else {
      newValue = Number(value);
    }
    onChange({ ...config, [key]: newValue });
  };

  return (
    <div className="flex flex-col h-full w-full p-6 md:p-8 overflow-y-auto custom-scrollbar">
      <h1 className="text-xl font-bold mb-6 md:mb-8 tracking-tighter whitespace-nowrap">Create Your Own Snowflake</h1>
      
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-1 md:gap-y-0">
        
        {/* Full width input for Word */}
        <div className="col-span-2 md:col-span-1 mb-6 md:mb-8">
          <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
            Base Word
          </label>
          <input
            type="text"
            value={config.word}
            onChange={(e) => handleChange('word', e.target.value)}
            className="w-full bg-transparent border-b border-gray-700 text-xl py-1 focus:border-white focus:outline-none transition-colors font-bold tracking-wider text-white placeholder-gray-600"
            placeholder="TYPE"
          />
          <p className="text-[10px] text-gray-500 mt-1">Single word only</p>
        </div>

        {/* Sliders Grid: 2 columns on mobile, 1 on desktop */}
        <div className="col-span-1">
          <Slider 
            label="Branches" 
            value={config.branches} 
            min={3} 
            max={12} 
            step={1}
            onChange={(value) => handleChange('branches', value)}
          />
        </div>
        
        <div className="col-span-1">
          <Slider 
            label="Density" 
            value={config.density} 
            min={5} 
            max={100} 
            step={1}
            onChange={(value) => handleChange('density', value)}
          />
        </div>

        <div className="col-span-1">
          <Slider 
            label="Spread" 
            value={config.spread} 
            min={0} 
            max={100} 
            step={1}
            onChange={(value) => handleChange('spread', value)}
          />
        </div>

        <div className="col-span-1">
          <Slider 
            label="Spur Angle" 
            value={config.spurAngle} 
            min={0} 
            max={180} 
            step={1}
            onChange={(value) => handleChange('spurAngle', value)}
          />
        </div>

        <div className="col-span-1">
          <Slider 
            label="Font Size" 
            value={config.fontSize} 
            min={4} 
            max={48} 
            step={1}
            onChange={(value) => handleChange('fontSize', value)}
          />
        </div>

        <div className="col-span-1">
          <Slider 
            label="Opacity" 
            value={config.opacity} 
            min={0.1} 
            max={1} 
            step={0.05}
            onChange={(value) => handleChange('opacity', value)}
          />
        </div>

      </div>
    </div>
  );
};

export default Controls;