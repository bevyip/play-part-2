export interface PoolConfig {
  rippleIntensity: number; // Amplitude of the wave
  rippleSpeed: number; // How fast the wave spreads
  propagationDistance: number; // How far the wave travels (decay)
  letterSize: number; // Font size in pixels
  gridDensity: number; // Number of columns/rows
}

export interface Ripple {
  id: number;
  x: number;
  y: number;
  startTime: number;
}
