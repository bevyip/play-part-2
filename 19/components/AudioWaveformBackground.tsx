import React, { useEffect, useRef } from 'react';

interface AudioWaveformBackgroundProps {
  audioData: Uint8Array | null;
}

interface Flower {
  x: number;
  y: number;
  baseScale: number;
  currentScale: number;
  clumpId: number;
}

const AudioWaveformBackground: React.FC<AudioWaveformBackgroundProps> = ({ audioData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const flowersRef = useRef<Flower[]>([]);
  const clumpScalesRef = useRef<{ [clumpId: number]: number }>({});
  const lastBassVolumeRef = useRef<number>(0);
  const lastVocalVolumeRef = useRef<number>(0);
  const clumpGlowIntensitiesRef = useRef<{ [clumpId: number]: number }>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', () => {
      resizeCanvas();
      // Reinitialize flowers when canvas resizes
      flowersRef.current = [];
    });

    let time = 0;
    const flowerSize = 40; // Base size of each flower
    const spacing = 80; // Space between flowers

    // Initialize flowers in a tiled pattern
    const initializeFlowers = () => {
      const flowers: Flower[] = [];
      const cols = Math.ceil(canvas.width / spacing) + 1;
      const rows = Math.ceil(canvas.height / spacing) + 1;
      
      // Create clumps - group nearby flowers together
      const clumps: { [key: string]: number } = {};
      let clumpIdCounter = 0;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * spacing;
          const y = row * spacing;
          
          // Determine clump - group flowers in 3x3 grids
          const clumpRow = Math.floor(row / 3);
          const clumpCol = Math.floor(col / 3);
          const clumpKey = `${clumpRow}-${clumpCol}`;
          
          if (!clumps[clumpKey]) {
            clumps[clumpKey] = clumpIdCounter++;
          }
          
          flowers.push({
            x,
            y,
            baseScale: 1,
            currentScale: 1,
            clumpId: clumps[clumpKey]
          });
        }
      }
      
      flowersRef.current = flowers;
    };

    // Draw a simple flower (circle center + 5 rounded petals)
    const drawFlower = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale: number
    ) => {
      const size = flowerSize * scale;
      const centerRadius = size * 0.12;
      const petalLength = size * 0.35; // Distance from center to petal tip
      const petalWidth = size * 0.22; // Width of petal at its widest point
      
      // Draw 5 rounded petals (more circular than teardrop, but still connected to center)
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2; // Start from top
        const petalTipX = x + Math.cos(angle) * petalLength;
        const petalTipY = y + Math.sin(angle) * petalLength;
        
        // Draw rounded petal (more circular, less teardrop-like)
        ctx.beginPath();
        // Start from center
        ctx.moveTo(x, y);
        // Use smoother curves for rounder appearance
        const controlX1 = x + Math.cos(angle) * (petalLength * 0.5) + Math.cos(angle + Math.PI / 2) * (petalWidth * 0.4);
        const controlY1 = y + Math.sin(angle) * (petalLength * 0.5) + Math.sin(angle + Math.PI / 2) * (petalWidth * 0.4);
        const controlX2 = petalTipX + Math.cos(angle + Math.PI / 2) * (petalWidth * 0.6);
        const controlY2 = petalTipY + Math.sin(angle + Math.PI / 2) * (petalWidth * 0.6);
        ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, petalTipX, petalTipY);
        // Curve back to center (other side of petal) - smoother and rounder
        const controlX3 = petalTipX + Math.cos(angle - Math.PI / 2) * (petalWidth * 0.6);
        const controlY3 = petalTipY + Math.sin(angle - Math.PI / 2) * (petalWidth * 0.6);
        const controlX4 = x + Math.cos(angle) * (petalLength * 0.5) + Math.cos(angle - Math.PI / 2) * (petalWidth * 0.4);
        const controlY4 = y + Math.sin(angle) * (petalLength * 0.5) + Math.sin(angle - Math.PI / 2) * (petalWidth * 0.4);
        ctx.bezierCurveTo(controlX3, controlY3, controlX4, controlY4, x, y);
        ctx.closePath();
        ctx.stroke();
      }
      
      // Draw center circle (outline only)
      ctx.beginPath();
      ctx.arc(x, y, centerRadius, 0, Math.PI * 2);
      ctx.stroke();
    };

    const draw = () => {
      // Clear canvas with transparent background so gradient shows through
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Initialize flowers on first draw or if canvas size changed
      if (flowersRef.current.length === 0) {
        initializeFlowers();
      }

      // Update clump scales based on bass (beats) and vocal detection
      if (audioData && audioData.length > 0) {
        const bufferLength = audioData.length;
        
        // Bass detection (beats/kicks) - lower frequencies
        const bassRange = Math.floor(bufferLength * 0.15);
        let bassSum = 0;
        for (let i = 0; i < bassRange; i++) {
          bassSum += audioData[i];
        }
        const bassVolume = bassSum / bassRange;
        const isBeat = bassVolume > lastBassVolumeRef.current * 1.4;
        lastBassVolumeRef.current = lastBassVolumeRef.current * 0.85 + bassVolume * 0.15;
        
        // Vocal detection (wider frequency range - includes lower and mid frequencies)
        const vocalStart = Math.floor(bufferLength * 0.1); // Start from lower frequencies
        const vocalEnd = Math.floor(bufferLength * 0.85); // Extend to higher frequencies
        let vocalSum = 0;
        for (let i = vocalStart; i < vocalEnd; i++) {
          vocalSum += audioData[i];
        }
        const vocalVolume = vocalSum / (vocalEnd - vocalStart);
        const isVocalPeak = vocalVolume > lastVocalVolumeRef.current * 1.25;
        lastVocalVolumeRef.current = lastVocalVolumeRef.current * 0.9 + vocalVolume * 0.1;
        
        // Calculate intensities (0 to 1)
        const bassIntensity = bassVolume / 255;
        const vocalIntensity = vocalVolume / 255;
        
        // Update all clumps with bass-based scaling and vocal-based glow
        const numClumps = Math.max(...flowersRef.current.map(f => f.clumpId)) + 1;
        
        // Randomly select clumps to respond (creates dynamic, organic feel)
        const activeClumps = Math.floor(numClumps * 0.5); // 50% of clumps respond
        const selectedClumps = new Set<number>();
        
        // Select random clumps to respond
        while (selectedClumps.size < activeClumps) {
          selectedClumps.add(Math.floor(Math.random() * numClumps));
        }
        
        // Calculate target scale from bass (1.0 to 2.0x, higher on beats)
        const baseScale = 1 + (bassIntensity * 0.8); // Increased from 0.6 to 0.8 (1.0 to 1.8x)
        const beatScale = isBeat ? 2.0 : baseScale; // Increased from 1.8 to 2.0
        
        // Update selected clumps
        selectedClumps.forEach(clumpId => {
          // Scale based on bass/beats
          const targetScale = beatScale;
          const currentScale = clumpScalesRef.current[clumpId] || 1;
          // Smooth transition, but faster on beats
          const smoothing = isBeat ? 0.5 : 0.7;
          clumpScalesRef.current[clumpId] = currentScale * smoothing + targetScale * (1 - smoothing);
          
          // Glow intensity based on vocals (0 to 1)
          const targetGlow = vocalIntensity;
          const currentGlow = clumpGlowIntensitiesRef.current[clumpId] || 0;
          // Boost glow on vocal peaks
          const vocalGlow = isVocalPeak ? Math.min(vocalIntensity * 1.5, 1) : targetGlow;
          clumpGlowIntensitiesRef.current[clumpId] = currentGlow * 0.8 + vocalGlow * 0.2;
        });
        
        // Decay non-active clumps
        Object.keys(clumpScalesRef.current).forEach(clumpIdStr => {
          const clumpId = Number(clumpIdStr);
          if (!selectedClumps.has(clumpId)) {
            const currentScale = clumpScalesRef.current[clumpId];
            if (currentScale > 1) {
              clumpScalesRef.current[clumpId] = currentScale * 0.9; // Decay towards 1
              if (clumpScalesRef.current[clumpId] < 1.01) {
                clumpScalesRef.current[clumpId] = 1;
              }
            }
            // Decay glow
            const currentGlow = clumpGlowIntensitiesRef.current[clumpId] || 0;
            if (currentGlow > 0) {
              clumpGlowIntensitiesRef.current[clumpId] = currentGlow * 0.9;
              if (clumpGlowIntensitiesRef.current[clumpId] < 0.01) {
                clumpGlowIntensitiesRef.current[clumpId] = 0;
              }
            }
          }
        });
      } else {
        // No audio - decay all clumps
        lastBassVolumeRef.current = 0;
        lastVocalVolumeRef.current = 0;
        Object.keys(clumpScalesRef.current).forEach(clumpIdStr => {
          const clumpId = Number(clumpIdStr);
          clumpScalesRef.current[clumpId] = (clumpScalesRef.current[clumpId] || 1) * 0.95;
          if (clumpScalesRef.current[clumpId] < 1.01) {
            clumpScalesRef.current[clumpId] = 1;
          }
          // Decay glow
          const currentGlow = clumpGlowIntensitiesRef.current[clumpId] || 0;
          if (currentGlow > 0) {
            clumpGlowIntensitiesRef.current[clumpId] = currentGlow * 0.95;
            if (clumpGlowIntensitiesRef.current[clumpId] < 0.01) {
              clumpGlowIntensitiesRef.current[clumpId] = 0;
            }
          }
        });
      }

      // Draw all flowers with their clump scales and vocal-based glow
      ctx.fillStyle = 'transparent';

      flowersRef.current.forEach(flower => {
        const clumpScale = clumpScalesRef.current[flower.clumpId] || 1;
        const vocalGlow = clumpGlowIntensitiesRef.current[flower.clumpId] || 0;
        
        // Base minimal glow + vocal-based glow intensity
        const baseGlow = 0.15; // Minimal base glow
        const vocalGlowIntensity = vocalGlow; // 0 to 1 based on vocals
        // Base minimal glow (very small) + dynamic glow from vocals - increased max intensity
        const shadowBlur = 3 + (vocalGlowIntensity * 30); // 3 to 33 blur (increased from 23)
        const shadowOpacity = baseGlow + (vocalGlowIntensity * 0.85); // 0.15 to 1.0 opacity (increased from 0.85)
        
        // Draw with dynamic glow effect - reduced base opacity
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; // Reduced from 1 to 0.7
        ctx.lineWidth = 1.5 + (vocalGlowIntensity * 0.8); // Thicker when vocals are strong
        ctx.shadowBlur = shadowBlur;
        ctx.shadowColor = `rgba(255, 255, 255, ${shadowOpacity})`;
        
        drawFlower(ctx, flower.x, flower.y, clumpScale);
      });

      time += 0.02;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioData]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default AudioWaveformBackground;
