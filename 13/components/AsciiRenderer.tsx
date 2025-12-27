import { useEffect, useState } from 'react';
import { AsciiSettings } from '../types';

interface AsciiRendererProps {
  settings: AsciiSettings;
}

const DENSITY = 'Ñ@#W$9876543210?!abc;:+=-,._ ';

export const AsciiRenderer = ({ settings }: AsciiRendererProps) => {
  const [asciiArt, setAsciiArt] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(10);
  
  // Responsive scaling logic
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Reserve space for controls at bottom and ensure margins
      const availableWidth = width - 40; 
      const availableHeight = height * 0.7; 
      
      const cols = settings.resolution * 2;
      const rows = settings.resolution;
      
      // Aspect ratio calc: 0.6 is approx char width/height ratio
      const sizeW = availableWidth / (cols * 0.6);
      const sizeH = availableHeight / (rows * 0.6); // 0.6 line-height match
      
      let size = Math.min(sizeW, sizeH);
      
      // Clamp size to ensure visibility
      size = Math.max(2, Math.min(80, size));
      
      setFontSize(size);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [settings.resolution]);

  // Generate ASCII from Emoji
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) return;

    const sampleSize = 128; 
    canvas.width = sampleSize;
    canvas.height = sampleSize;

    // Clear and draw emoji
    ctx.clearRect(0, 0, sampleSize, sampleSize);
    ctx.font = `${sampleSize * 0.8}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white'; 
    // Draw emoji slightly lower than center to account for baseline
    ctx.fillText(settings.emoji, sampleSize / 2, sampleSize / 2 + (sampleSize * 0.05));

    const { resolution, contrast } = settings;
    
    const rows = resolution;
    const cols = Math.floor(resolution * 2.0); // Double width for character aspect ratio
    
    const cellWidth = sampleSize / cols;
    const cellHeight = sampleSize / rows;
    
    const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
    const data = imageData.data;
    const densityLen = DENSITY.length - 1;
    
    let frame = '';

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Sample center of cell
        const posX = Math.floor((x + 0.5) * cellWidth);
        const posY = Math.floor((y + 0.5) * cellHeight);
        
        const index = (posY * sampleSize + posX) * 4;
        
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        if (a < 20) {
            frame += '&nbsp;';
            continue;
        }

        // Calculate brightness
        let brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        brightness = Math.pow(brightness, contrast);

        const charIndex = Math.floor((1 - brightness) * densityLen);
        const safeIndex = Math.max(0, Math.min(densityLen, charIndex));
        const char = DENSITY[safeIndex];
        
        if (char === ' ') {
            frame += '&nbsp;';
        } else {
            const alpha = (a / 255).toFixed(2);
            frame += `<span style="color: rgba(${r},${g},${b},${alpha})">${char}</span>`;
        }
      }
      frame += '<br/>';
    }

    setAsciiArt(frame);

  }, [settings.emoji, settings.resolution, settings.contrast]);

  return (
    <div className="flex items-center justify-center w-full h-full pb-32 overflow-hidden bg-black">
      <div 
        className="font-mono leading-[0.6] text-center whitespace-nowrap select-none pointer-events-none"
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: asciiArt }}
      />
    </div>
  );
};