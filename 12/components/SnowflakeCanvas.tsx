import React, { useRef, useEffect, useState } from 'react';
import { SnowflakeConfig } from '../types';

interface SnowflakeCanvasProps {
  config: SnowflakeConfig;
}

const SnowflakeCanvas: React.FC<SnowflakeCanvasProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number>(0);
  const angleRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle Resize using ResizeObserver to fit parent container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        // Use contentRect for precise pixel dimensions of the content box
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Update Buffer (Draw Static Snowflake)
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    // Initialize or resize buffer
    if (!bufferRef.current) {
      bufferRef.current = document.createElement('canvas');
    }
    const buffer = bufferRef.current;
    if (buffer.width !== dimensions.width || buffer.height !== dimensions.height) {
      buffer.width = dimensions.width;
      buffer.height = dimensions.height;
    }

    const ctx = buffer.getContext('2d');
    if (!ctx) return;

    // Clear buffer (transparent)
    ctx.clearRect(0, 0, buffer.width, buffer.height);

    const { 
      word, 
      branches, 
      density, 
      spread, 
      fontSize, 
      spurAngle, 
      opacity 
    } = config;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    // Dynamically calculate radius to fit the container nicely (35% of the smallest dimension)
    const minDimension = Math.min(dimensions.width, dimensions.height);
    const radius = minDimension * 0.35;

    // SCALING FIX: 
    // Calculate a responsive scale factor based on a reference screen size (e.g., 800px).
    // This ensures the text scales down with the snowflake, preserving density/spacing.
    const responsiveScale = Math.max(minDimension / 800, 0.3); // Prevent it from getting microscopic
    const scaledFontSize = fontSize * responsiveScale;

    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.font = `${scaledFontSize}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.save();
    ctx.translate(centerX, centerY);

    // Draw branches
    for (let i = 0; i < branches; i++) {
      ctx.save();
      const angle = (Math.PI * 2 * i) / branches;
      ctx.rotate(angle);

      // Draw the main spine
      for (let j = 1; j <= density; j++) {
        const progress = j / density; 
        const r = progress * radius;
        
        ctx.fillText(word, 0, -r);

        // Draw Spurs
        if (j % 3 === 0 && j > 5) {
            const spurLen = (1 - progress) * spread * 2; 
            if (spurLen > 5) {
                // Left spur
                ctx.save();
                ctx.translate(0, -r);
                ctx.rotate((spurAngle * Math.PI) / 180);
                for(let k=1; k < spurLen / 10; k++) {
                    // Use scaledFontSize for spur spacing to maintain proportions
                    ctx.fillText(word, 0, -k * (scaledFontSize * 0.8));
                }
                ctx.restore();

                // Right spur
                ctx.save();
                ctx.translate(0, -r);
                ctx.rotate(-(spurAngle * Math.PI) / 180);
                for(let k=1; k < spurLen / 10; k++) {
                    // Use scaledFontSize for spur spacing to maintain proportions
                    ctx.fillText(word, 0, -k * (scaledFontSize * 0.8));
                }
                ctx.restore();
            }
        }
      }
      ctx.restore();
    }
    ctx.restore();

  }, [config, dimensions]);

  // Animation Loop (Rotation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sync canvas dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const animate = () => {
        // Clear main canvas with background color
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (bufferRef.current) {
             const cx = canvas.width / 2;
             const cy = canvas.height / 2;
             
             // Constant rotation speed
             if (config.isRotating) {
                angleRef.current += 0.005;
             } else {
                // Reset to facing forward (0 radians) when not rotating
                angleRef.current = 0;
             }

             ctx.save();
             ctx.translate(cx, cy);
             
             // Simulate Y-axis rotation (3D spin)
             // Math.cos cycles between 1 and -1, creating the perspective compression and flipping
             const scaleX = Math.cos(angleRef.current);
             ctx.scale(scaleX, 1);
             
             ctx.translate(-cx, -cy);
             
             // Draw the pre-rendered snowflake
             ctx.drawImage(bufferRef.current, 0, 0);
             ctx.restore();
        }
        
        requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
        cancelAnimationFrame(requestRef.current);
    };
  }, [dimensions, config.isRotating]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block"
    />
  );
};

export default React.memo(SnowflakeCanvas);