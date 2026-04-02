import React, { useCallback, useRef, useState } from 'react';
import Slider from './Slider';
import './ControlsPanel.css';

export interface GridDistortionConfig {
  grid: number;
  strength: number;
  mouse: number;
  relaxation: number;
}

interface ControlsProps {
  config: GridDistortionConfig;
  onChange: (newConfig: GridDistortionConfig) => void;
  onImageSrcChange: (src: string) => void;
}

const Controls: React.FC<ControlsProps> = ({ config, onChange, onImageSrcChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (key: keyof GridDistortionConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  const applyFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      onImageSrcChange(url);
    },
    [onImageSrcChange]
  );

  const openFilePicker = () => fileInputRef.current?.click();

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
    e.target.value = '';
  };

  const onDropBoxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFilePicker();
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };

  return (
    <aside className="panel17">
      <div className="panel17-inner controls-scrollbar safe-area-inset-bottom">
        <div className="panel17-mobile-handle" aria-hidden="true">
          <span />
        </div>

        <section className="panel17-group">
          <h2 className="panel17-group-title">Input</h2>
          <div
            className={`panel17-drop${isDragging ? ' is-dragging' : ''}`}
            role="button"
            tabIndex={0}
            aria-label="Upload or drop an image"
            onClick={openFilePicker}
            onKeyDown={onDropBoxKeyDown}
            onDragEnter={onDragOver}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="panel17-drop-title">Upload / Drag &amp; drop</div>
          </div>
          <input
            ref={fileInputRef}
            className="panel17-sr-only"
            type="file"
            accept="image/*"
            onChange={onInputChange}
          />
        </section>

        <section className="panel17-group">
          <h2 className="panel17-group-title">Distortion</h2>
          <Slider
            label="Pixel size"
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
            label="Mouse area"
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
        </section>
      </div>
    </aside>
  );
};

export default Controls;
