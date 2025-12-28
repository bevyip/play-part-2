import React, { useEffect, useRef } from 'react';

interface SpriteCanvasProps {
  pixels: string[][];
  label: string;
  scale?: number;
}

const SpriteCanvas: React.FC<SpriteCanvasProps> = ({ pixels, label, scale = 12 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const height = pixels.length;
  const width = pixels[0]?.length || 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get 2D context with transparency support (default, but explicit for clarity)
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Clear canvas to transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw checkered background (ONLY for UI preview - not part of sprite data)
    // This helps visualize transparent pixels in the preview
    // The actual sprite data preserves transparency - no background color needed!
    // Using neutral-800 (#262626) and neutral-900 (#171717)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = '#262626'; 
        } else {
          ctx.fillStyle = '#171717'; 
        }
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }

    // Draw pixels from 2D matrix (transparent pixels are skipped)
    // The sprite data uses "transparent" string to represent transparent pixels
    pixels.forEach((row, y) => {
      row.forEach((color, x) => {
        // Skip transparent pixels - they remain transparent (no background needed)
        if (!color || color === 'transparent' || color === '#00000000') return;
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      });
    });
  }, [pixels, scale, width, height]);

  if (!pixels || pixels.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">{label}</span>
      <div className="p-1.5 bg-neutral-800 rounded-lg border border-neutral-700 shadow-sm">
        <canvas
          ref={canvasRef}
          width={width * scale}
          height={height * scale}
          className="image-pixelated rounded-sm"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
};

export default SpriteCanvas;