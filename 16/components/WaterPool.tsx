import React, { useEffect, useRef, useState } from "react";
import { PoolConfig, Ripple } from "../types";
import { CHARACTERS } from "../constants";

interface WaterPoolProps {
  config: PoolConfig;
  resetTrigger: number;
}

interface GridItem {
  char: string;
  color: string;
}

// Helper to get random char
const getRandomChar = () =>
  CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];

// Distance helper
const dist = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

// Pool logical dimensions
const POOL_WIDTH = 600;
const POOL_HEIGHT = 350;
const DECK_PADDING = 30;
// Total width for scaling calculation (Pool + Padding on both sides)
const TOTAL_WIDTH = POOL_WIDTH + DECK_PADDING * 2;

// Float Physics Constants
const FLOAT_RADIUS = 45; // 90px width / 2
const FLOAT_FRICTION = 0.96;
const FLOAT_MASS = 3.0;

const WaterPool: React.FC<WaterPoolProps> = ({ config, resetTrigger }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const ripplesRef = useRef<Ripple[]>([]);

  // Scale state for responsive resizing
  const [scale, setScale] = useState(1);

  // Float Physics State ref (mutable for performance)
  const floatPhysicsRef = useRef({
    x: POOL_WIDTH / 2,
    y: POOL_HEIGHT / 2,
    vx: 0,
    vy: 0,
    rotation: 0,
    vRotation: 0,
  });

  // Refs for DOM elements
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const floatRef = useRef<HTMLDivElement>(null);
  const floatShadowRef = useRef<HTMLDivElement>(null);

  // State to force re-render of grid items when density changes
  const [gridItems, setGridItems] = useState<GridItem[]>([]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const margin = 32; // Safety margin (e.g., 16px on each side)
      const availableWidth = window.innerWidth - margin;

      // Calculate scale to fit width
      // We use TOTAL_WIDTH to ensure the deck padding is included in the fit
      const newScale = Math.min(1, availableWidth / TOTAL_WIDTH);
      setScale(newScale);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial calculation

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize or update grid
  useEffect(() => {
    const totalItems = config.gridDensity * config.gridDensity;
    const newItems = Array.from({ length: totalItems }, () => ({
      char: getRandomChar(),
      color: `rgba(255, 255, 255, ${0.4 + Math.random() * 0.6})`,
    }));
    setGridItems(newItems);
    letterRefs.current = new Array(totalItems).fill(null);
  }, [config.gridDensity, resetTrigger]);

  // Handle Mouse/Touch Interaction
  const handleInteraction = (
    e: React.MouseEvent | React.TouchEvent,
    clientX?: number,
    clientY?: number
  ) => {
    if (!containerRef.current) return;

    // Border widths defined in styles (logical pixels)
    const borderLeft = 10;
    const borderTop = 12;

    let inputX, inputY;

    if ("nativeEvent" in e && e.nativeEvent instanceof MouseEvent) {
      inputX = e.nativeEvent.clientX;
      inputY = e.nativeEvent.clientY;
    } else if (clientX !== undefined && clientY !== undefined) {
      inputX = clientX;
      inputY = clientY;
    } else {
      return;
    }

    if (inputX === undefined || inputY === undefined) return;

    const rect = containerRef.current.getBoundingClientRect();

    // Calculate mapping from Visual space (which might be scaled) to Logical space (fixed 600x350)
    // rect.width is the visual width on screen
    const scaleX = POOL_WIDTH / rect.width;
    const scaleY = POOL_HEIGHT / rect.height;

    // Relative visual position
    const visualRelX = inputX - rect.left;
    const visualRelY = inputY - rect.top;

    // Convert to Logical Coordinates
    let logicalX = visualRelX * scaleX;
    let logicalY = visualRelY * scaleY;

    // Adjust for the logical borders manually since our logical coordinate system 0,0 is inside the content box
    // but the rect includes the border.
    logicalX -= borderLeft;
    logicalY -= borderTop;

    // Bounds check
    if (
      logicalX < 0 ||
      logicalX > POOL_WIDTH ||
      logicalY < 0 ||
      logicalY > POOL_HEIGHT
    )
      return;

    const now = Date.now();

    ripplesRef.current.push({
      id: Math.random(),
      x: logicalX,
      y: logicalY,
      startTime: now,
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleInteraction(e);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleInteraction(e, touch.clientX, touch.clientY);
  };

  // Animation Loop
  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const { rippleSpeed, rippleIntensity, propagationDistance, gridDensity } =
        config;

      // Filter out dead ripples
      ripplesRef.current = ripplesRef.current.filter((r) => {
        const age = now - r.startTime;
        const radius = age * rippleSpeed;
        return radius < propagationDistance + 100 && age < 4000;
      });

      const activeRipples = ripplesRef.current;
      const letters = letterRefs.current;

      // --- 1. Update Grid Letters ---
      const cellWidth = POOL_WIDTH / gridDensity;
      const cellHeight = POOL_HEIGHT / gridDensity;

      for (let i = 0; i < letters.length; i++) {
        const el = letters[i];
        if (!el) continue;

        const row = Math.floor(i / gridDensity);
        const col = i % gridDensity;

        const originX = col * cellWidth + cellWidth / 2;
        const originY = row * cellHeight + cellHeight / 2;

        let totalX = 0;
        let totalY = 0;
        let totalScale = 1;

        for (const ripple of activeRipples) {
          const age = now - ripple.startTime;
          const radius = age * rippleSpeed;
          const d = dist(originX, originY, ripple.x, ripple.y);
          const distFromWaveFront = d - radius;
          const waveWidth = 40;

          if (Math.abs(distFromWaveFront) < waveWidth) {
            const angle = (distFromWaveFront / waveWidth) * Math.PI * 2;
            const displacement = Math.sin(angle);
            const distanceDecay = Math.max(0, 1 - d / propagationDistance);
            const strength = displacement * rippleIntensity * distanceDecay;

            const dx = d === 0 ? 0 : (originX - ripple.x) / d;
            const dy = d === 0 ? 0 : (originY - ripple.y) / d;

            totalX += dx * strength;
            totalY += dy * strength;

            totalScale += (strength / rippleIntensity) * 0.3;
          }
        }

        const finalScale = Math.max(0.5, Math.min(1.5, totalScale));

        el.style.transform = `translate3d(${totalX.toFixed(
          2
        )}px, ${totalY.toFixed(2)}px, 0) scale(${finalScale.toFixed(2)})`;
        el.style.opacity = Math.min(1, finalScale).toFixed(2);
      }

      // --- 2. Update Pool Float Physics ---
      const float = floatPhysicsRef.current;

      // Apply friction
      float.vx *= FLOAT_FRICTION;
      float.vy *= FLOAT_FRICTION;
      float.vRotation *= 0.9;

      // Interaction with ripples
      for (const ripple of activeRipples) {
        const age = now - ripple.startTime;
        const radius = age * rippleSpeed;
        const d = dist(float.x, float.y, ripple.x, ripple.y);
        const waveWidth = 60;

        if (Math.abs(d - radius) < waveWidth) {
          const dx = float.x - ripple.x;
          const dy = float.y - ripple.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const distanceDecay = Math.max(
            0,
            1 - d / (propagationDistance * 1.5)
          );
          const pushFactor =
            (0.4 * rippleIntensity * distanceDecay) / FLOAT_MASS;

          if (pushFactor > 0.01) {
            float.vx += (dx / len) * pushFactor;
            float.vy += (dy / len) * pushFactor;
            float.vRotation += (Math.random() - 0.5) * pushFactor * 0.5;
          }
        }
      }

      // Update position
      float.x += float.vx;
      float.y += float.vy;
      float.rotation +=
        float.vRotation + Math.sqrt(float.vx ** 2 + float.vy ** 2) * 0.1;

      // Boundary Collisions (Bounce)
      if (float.x < FLOAT_RADIUS) {
        float.x = FLOAT_RADIUS;
        float.vx *= -0.4;
      }
      if (float.x > POOL_WIDTH - FLOAT_RADIUS) {
        float.x = POOL_WIDTH - FLOAT_RADIUS;
        float.vx *= -0.4;
      }
      if (float.y < FLOAT_RADIUS) {
        float.y = FLOAT_RADIUS;
        float.vy *= -0.4;
      }
      if (float.y > POOL_HEIGHT - FLOAT_RADIUS) {
        float.y = POOL_HEIGHT - FLOAT_RADIUS;
        float.vy *= -0.4;
      }

      // Apply Float Transform
      if (floatRef.current) {
        floatRef.current.style.transform = `translate3d(${
          float.x - FLOAT_RADIUS
        }px, ${float.y - FLOAT_RADIUS}px, 5px) rotate(${float.rotation}deg)`;
      }

      // Update Float Shadow
      if (floatShadowRef.current) {
        const shadowOffsetX = float.x * 0.1;
        const shadowOffsetY = float.y * 0.057;
        floatShadowRef.current.style.transform = `translate3d(${
          float.x - 40 + shadowOffsetX
        }px, ${float.y - 40 + shadowOffsetY}px, 0)`;
      }

      animationFrameRef.current = requestAnimationFrame(update);
    };

    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [config, gridItems.length]);

  const deckShadow =
    Array.from(
      { length: 16 },
      (_, i) => `${i + 1}px ${i + 1}px 0px #9ca3af`
    ).join(", ") + ", 30px 30px 40px rgba(0,0,0,0.2)";

  return (
    <div
      className="relative flex items-center justify-center pointer-events-none"
      style={{
        perspective: "1000px", // Hardcoded perspective since ViewConfig is removed
        width: "100%",
        height: "100%",
      }}
    >
      {/* 
         Scaled Wrapper for Responsiveness 
         This wrapper scales the entire pool (including deck) to fit within the viewport width.
      */}
      <div
        className="relative transition-transform duration-300 ease-out pointer-events-auto origin-center"
        style={{
          transform: `scale(${scale})`,
          width: TOTAL_WIDTH, // Ensure logic pixels match scale basis
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Shadow Casting (The ground shadow) */}
        <div className="absolute inset-0 bg-black/20 translate-y-12 translate-x-8 blur-xl rounded-2xl -z-10" />

        {/* The Concrete Deck */}
        <div
          className="bg-gray-200 rounded-lg relative"
          style={{
            transformStyle: "preserve-3d",
            padding: `${DECK_PADDING}px`,
            boxShadow: deckShadow,
            backgroundImage: `linear-gradient(#d1d5db 1px, transparent 1px), linear-gradient(90deg, #d1d5db 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
            backgroundColor: "#f3f4f6",
          }}
        >
          {/* Ladder - Darker Silver */}
          <div
            className="absolute top-2 left-24 z-30 pointer-events-none"
            style={{ transform: "translateZ(20px)" }}
          >
            <div className="relative">
              <div className="absolute top-0 w-2 h-20 bg-gray-300 rounded-t-full shadow-md left-0 border border-gray-300"></div>
              <div className="absolute top-0 w-2 h-20 bg-gray-300 rounded-t-full shadow-md left-12 border border-gray-300"></div>
              {[1, 2].map((step) => (
                <div
                  key={step}
                  className="absolute h-1.5 bg-gray-300 shadow-sm border border-gray-300/50"
                  style={{
                    left: "8px",
                    width: "40px",
                    top: `${30 + step * 12}px`,
                    borderRadius: "2px",
                  }}
                />
              ))}
              <div className="absolute -top-1 left-0 w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
              <div className="absolute -top-1 left-12 w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
            </div>
          </div>

          {/* Water Surface Container */}
          <div
            ref={containerRef}
            className="relative select-none cursor-crosshair touch-none overflow-hidden rounded-sm"
            onMouseMove={onMouseMove}
            onTouchMove={onTouchMove}
            style={{
              width: `${POOL_WIDTH}px`,
              height: `${POOL_HEIGHT}px`,
              transformStyle: "preserve-3d",
              backgroundColor: "#1E88E5",

              borderTop: "12px solid #9ca3af",
              borderLeft: "10px solid #858b94",
              borderRight: "1px solid rgba(255,255,255,0.3)",
              borderBottom: "1px solid rgba(255,255,255,0.3)",

              boxShadow: "inset 0 0 60px rgba(0,0,40,0.4)",
            }}
          >
            {/* Caustics / Shimmer Overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-0 opacity-30 mix-blend-screen"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)",
              }}
            />

            {/* Water Highlight Gradient (Surface reflection) */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none z-10" />

            {/* Float Shadow */}
            <div
              ref={floatShadowRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "black",
                opacity: 0.5,
                filter: "blur(5px)",
                maskImage: "radial-gradient(transparent 30%, black 31%)",
                WebkitMaskImage: "radial-gradient(transparent 30%, black 31%)",
                pointerEvents: "none",
                zIndex: 15,
                willChange: "transform",
              }}
            />

            {/* Interactive Pool Float */}
            <div
              ref={floatRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background:
                  "repeating-conic-gradient(from 0deg, #FFC107 0deg 30deg, #FFFFFF 30deg 60deg)",
                maskImage: "radial-gradient(transparent 30%, black 31%)",
                WebkitMaskImage: "radial-gradient(transparent 30%, black 31%)",
                boxShadow: `
                  inset -3px -3px 8px rgba(0,0,0,0.25),
                  inset 3px 3px 8px rgba(255,255,255,0.6),
                  0 6px 12px rgba(0,0,0,0.3),
                  0 3px 6px rgba(0,0,0,0.2)
                `,
                pointerEvents: "none",
                zIndex: 30,
                willChange: "transform",
              }}
            />

            {/* Grid */}
            <div
              className="relative z-20"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${config.gridDensity}, 1fr)`,
                width: "100%",
                height: "100%",
                gap: "0px",
              }}
            >
              {gridItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center overflow-visible pointer-events-none"
                >
                  <span
                    ref={(el) => {
                      letterRefs.current[i] = el;
                    }}
                    style={{
                      fontSize: `${config.letterSize}px`,
                      color: item.color,
                      willChange: "transform, opacity",
                      transformOrigin: "center center",
                      textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                    className="font-medium inline-block"
                  >
                    {item.char}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterPool;
