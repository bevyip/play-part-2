import React, { useEffect, useRef, useState } from "react";
import { PoolConfig, Ripple } from "../types";
import { CHARACTERS } from "../constants";

interface WaterPoolProps {
  config: PoolConfig;
  resetTrigger: number;
}

interface GridCell {
  char: string;
  alpha: number;
  x: number;
  y: number;
}

const POOL_WIDTH = 600;
const POOL_HEIGHT = 350;
const DECK_PADDING = 30;
const TOTAL_WIDTH = POOL_WIDTH + DECK_PADDING * 2;
const BORDER_LEFT = 10;
const BORDER_TOP = 12;

const FLOAT_RADIUS = 45;
const FLOAT_FRICTION = 0.96;
const FLOAT_PUSH = 0.4 / 3;

const RIPPLE_MIN_DIST_SQ = 14 * 14;
const MAX_RIPPLES = 8;
const WAVE_WIDTH = 40;
const FLOAT_WAVE_WIDTH = 60;
const RIPPLE_TAIL = 100;

const RING_MASK = "radial-gradient(transparent 30%, black 31%)";

const DECK_SHADOW =
  Array.from({ length: 16 }, (_, i) => `${i + 1}px ${i + 1}px 0px #9ca3af`).join(
    ", "
  ) + ", 30px 30px 40px rgba(0,0,0,0.2)";

const distSq = (dx: number, dy: number) => dx * dx + dy * dy;

function buildGrid(density: number): GridCell[] {
  const cellW = POOL_WIDTH / density;
  const cellH = POOL_HEIGHT / density;
  return Array.from({ length: density * density }, (_, i) => ({
    char: CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)],
    alpha: 0.4 + Math.random() * 0.6,
    x: (i % density) * cellW + cellW / 2,
    y: Math.floor(i / density) * cellH + cellH / 2,
  }));
}

function clientToLogical(
  container: HTMLElement,
  clientX: number,
  clientY: number
): { x: number; y: number } | null {
  const rect = container.getBoundingClientRect();
  const x = ((clientX - rect.left) * POOL_WIDTH) / rect.width - BORDER_LEFT;
  const y = ((clientY - rect.top) * POOL_HEIGHT) / rect.height - BORDER_TOP;

  if (x < 0 || x > POOL_WIDTH || y < 0 || y > POOL_HEIGHT) return null;
  return { x, y };
}

function sampleWave(
  d: number,
  radius: number,
  waveWidth: number,
  propagationDistance: number,
  intensity: number
): number | null {
  const front = d - radius;
  if (Math.abs(front) >= waveWidth) return null;

  return (
    Math.sin((front / waveWidth) * Math.PI * 2) *
    intensity *
    Math.max(0, 1 - d / propagationDistance)
  );
}

function bounceAxis(pos: number, vel: number, min: number, max: number) {
  if (pos < min) return { pos: min, vel: vel * -0.4 };
  if (pos > max) return { pos: max, vel: vel * -0.4 };
  return { pos, vel };
}

function cellDisplacement(
  cell: GridCell,
  ripples: Ripple[],
  now: number,
  rippleSpeed: number,
  rippleIntensity: number,
  propagationDistance: number
) {
  const reachSq = (propagationDistance + WAVE_WIDTH) ** 2;
  let totalX = 0;
  let totalY = 0;
  let totalScale = 1;

  for (const ripple of ripples) {
    const dx = cell.x - ripple.x;
    const dy = cell.y - ripple.y;
    const d2 = distSq(dx, dy);
    if (d2 > reachSq) continue;

    const d = Math.sqrt(d2);
    const strength = sampleWave(
      d,
      (now - ripple.startTime) * rippleSpeed,
      WAVE_WIDTH,
      propagationDistance,
      rippleIntensity
    );
    if (strength === null) continue;

    const inv = d === 0 ? 0 : 1 / d;
    totalX += dx * inv * strength;
    totalY += dy * inv * strength;
    totalScale += (strength / rippleIntensity) * 0.3;
  }

  return { totalX, totalY, totalScale };
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  grid: GridCell[],
  letterSize: number,
  ripples: Ripple[],
  now: number,
  rippleSpeed: number,
  rippleIntensity: number,
  propagationDistance: number
) {
  ctx.clearRect(0, 0, POOL_WIDTH, POOL_HEIGHT);
  ctx.font = `${letterSize}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  const animating = ripples.length > 0;

  for (const cell of grid) {
    ctx.save();

    if (animating) {
      const { totalX, totalY, totalScale } = cellDisplacement(
        cell,
        ripples,
        now,
        rippleSpeed,
        rippleIntensity,
        propagationDistance
      );
      const scaleVal = Math.max(0.5, Math.min(1.5, totalScale));
      ctx.globalAlpha = Math.min(1, scaleVal) * cell.alpha;
      ctx.translate(cell.x + totalX, cell.y + totalY);
      ctx.scale(scaleVal, scaleVal);
      ctx.fillText(cell.char, 0, 0);
    } else {
      ctx.globalAlpha = cell.alpha;
      ctx.fillText(cell.char, cell.x, cell.y);
    }

    ctx.restore();
  }
}

function updateFloatElements(
  f: { x: number; y: number; rotation: number },
  floatEl: HTMLDivElement | null,
  shadowEl: HTMLDivElement | null
) {
  if (floatEl) {
    floatEl.style.transform = `translate3d(${f.x - FLOAT_RADIUS}px, ${
      f.y - FLOAT_RADIUS
    }px, 5px) rotate(${f.rotation}deg)`;
  }
  if (shadowEl) {
    shadowEl.style.transform = `translate3d(${f.x - 40 + f.x * 0.1}px, ${
      f.y - 40 + f.y * 0.057
    }px, 0)`;
  }
}

const WaterPool: React.FC<WaterPoolProps> = ({ config, resetTrigger }) => {
  const configRef = useRef(config);
  configRef.current = config;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const ripplesRef = useRef<Ripple[]>([]);
  const isVisibleRef = useRef(true);
  const gridRef = useRef<GridCell[]>(buildGrid(config.gridDensity));
  const gridDirtyRef = useRef(true);
  const lastDensityRef = useRef(config.gridDensity);

  const floatRef = useRef({
    x: POOL_WIDTH / 2,
    y: POOL_HEIGHT / 2,
    vx: 0,
    vy: 0,
    rotation: 0,
    vRotation: 0,
  });

  const pointerRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const lastRippleRef = useRef<{ x: number; y: number } | null>(null);

  const floatElRef = useRef<HTMLDivElement>(null);
  const floatShadowElRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const onResize = () => {
      setScale(Math.min(1, (window.innerWidth - 32) / TOTAL_WIDTH));
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (lastDensityRef.current !== config.gridDensity) {
      gridRef.current = buildGrid(config.gridDensity);
      lastDensityRef.current = config.gridDensity;
    }
    gridDirtyRef.current = true;
  }, [config.gridDensity, config.letterSize, resetTrigger]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ensureLoop = () => {
      if (animationFrameRef.current || document.hidden || !isVisibleRef.current) {
        return;
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    const tick = () => {
      if (document.hidden || !isVisibleRef.current) {
        animationFrameRef.current = undefined;
        return;
      }

      const now = Date.now();
      const { rippleSpeed, rippleIntensity, propagationDistance, letterSize } =
        configRef.current;

      const pointer = pointerRef.current;
      if (pointer) {
        const logical = clientToLogical(container, pointer.clientX, pointer.clientY);
        if (logical) {
          const last = lastRippleRef.current;
          if (
            !last ||
            distSq(logical.x - last.x, logical.y - last.y) >= RIPPLE_MIN_DIST_SQ
          ) {
            ripplesRef.current.push({ x: logical.x, y: logical.y, startTime: now });
            if (ripplesRef.current.length > MAX_RIPPLES) ripplesRef.current.shift();
            lastRippleRef.current = logical;
          }
        }
      }

      ripplesRef.current = ripplesRef.current.filter(
        (r) => (now - r.startTime) * rippleSpeed < propagationDistance + RIPPLE_TAIL
      );

      const ripples = ripplesRef.current;

      if (ripples.length > 0 || gridDirtyRef.current) {
        drawGrid(
          ctx,
          gridRef.current,
          letterSize,
          ripples,
          now,
          rippleSpeed,
          rippleIntensity,
          propagationDistance
        );
        gridDirtyRef.current = ripples.length > 0;
      }

      const f = floatRef.current;
      f.vx *= FLOAT_FRICTION;
      f.vy *= FLOAT_FRICTION;
      f.vRotation *= 0.9;

      const floatReachSq = (propagationDistance * 1.5 + FLOAT_WAVE_WIDTH) ** 2;

      for (const ripple of ripples) {
        const dx = f.x - ripple.x;
        const dy = f.y - ripple.y;
        const d2 = distSq(dx, dy);
        if (d2 > floatReachSq) continue;

        const d = Math.sqrt(d2);
        const radius = (now - ripple.startTime) * rippleSpeed;
        if (Math.abs(d - radius) >= FLOAT_WAVE_WIDTH) continue;

        const push =
          FLOAT_PUSH * rippleIntensity * Math.max(0, 1 - d / (propagationDistance * 1.5));
        if (push <= 0.01) continue;

        const inv = d || 1;
        f.vx += (dx / inv) * push;
        f.vy += (dy / inv) * push;
        f.vRotation += (Math.random() - 0.5) * push * 0.5;
      }

      f.x += f.vx;
      f.y += f.vy;
      f.rotation += f.vRotation + Math.hypot(f.vx, f.vy) * 0.1;

      const bound = FLOAT_RADIUS;
      ({ pos: f.x, vel: f.vx } = bounceAxis(f.x, f.vx, bound, POOL_WIDTH - bound));
      ({ pos: f.y, vel: f.vy } = bounceAxis(f.y, f.vy, bound, POOL_HEIGHT - bound));

      updateFloatElements(f, floatElRef.current, floatShadowElRef.current);

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointerRef.current = { clientX: e.clientX, clientY: e.clientY };
    };
    const onPointerLeave = () => {
      pointerRef.current = null;
      lastRippleRef.current = null;
    };

    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        ensureLoop();
      },
      { threshold: 0.01, rootMargin: "50px" }
    );
    observer.observe(container);

    const onVisibilityChange = () => {
      if (!document.hidden) ensureLoop();
      else if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    ensureLoop();

    return () => {
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div
      className="relative flex items-center justify-center pointer-events-none"
      style={{ perspective: "1000px", width: "100%", height: "100%" }}
    >
      <div
        className="relative transition-transform duration-300 ease-out pointer-events-auto origin-center"
        style={{
          transform: `scale(${scale})`,
          width: TOTAL_WIDTH,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/20 translate-y-12 translate-x-8 blur-xl rounded-2xl -z-10" />

        <div
          className="bg-gray-200 rounded-lg relative"
          style={{
            transformStyle: "preserve-3d",
            padding: `${DECK_PADDING}px`,
            boxShadow: DECK_SHADOW,
            backgroundImage: `linear-gradient(#d1d5db 1px, transparent 1px), linear-gradient(90deg, #d1d5db 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
            backgroundColor: "#f3f4f6",
          }}
        >
          <div
            className="absolute top-2 left-24 z-30 pointer-events-none"
            style={{ transform: "translateZ(20px)" }}
          >
            <div className="relative">
              <div className="absolute top-0 w-2 h-20 bg-gray-300 rounded-t-full shadow-md left-0 border border-gray-300" />
              <div className="absolute top-0 w-2 h-20 bg-gray-300 rounded-t-full shadow-md left-12 border border-gray-300" />
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
              <div className="absolute -top-1 left-0 w-2 h-2 bg-gray-400 rounded-full opacity-50" />
              <div className="absolute -top-1 left-12 w-2 h-2 bg-gray-400 rounded-full opacity-50" />
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative select-none cursor-crosshair touch-none overflow-hidden rounded-sm"
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
            <div
              className="absolute inset-0 pointer-events-none z-0 opacity-30 mix-blend-screen"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none z-10" />

            <div
              ref={floatShadowElRef}
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
                maskImage: RING_MASK,
                WebkitMaskImage: RING_MASK,
                pointerEvents: "none",
                zIndex: 15,
                willChange: "transform",
              }}
            />

            <canvas
              ref={canvasRef}
              width={POOL_WIDTH}
              height={POOL_HEIGHT}
              className="absolute inset-0 z-20 pointer-events-none"
              style={{ width: "100%", height: "100%" }}
            />

            <div
              ref={floatElRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background:
                  "repeating-conic-gradient(from 0deg, #FFC107 0deg 30deg, #FFFFFF 30deg 60deg)",
                maskImage: RING_MASK,
                WebkitMaskImage: RING_MASK,
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterPool;
