import { PoolConfig } from './types';

export const DEFAULT_CONFIG: PoolConfig = {
  rippleIntensity: 5,
  rippleSpeed: 0.5,
  propagationDistance: 60,
  letterSize: 10,
  gridDensity: 40,
};

/** When embedded in an iframe, use a coarser grid to reduce DOM nodes and CPU. */
export const IFRAME_GRID_DENSITY = 24;

/** Target FPS when in iframe to avoid lagging the parent page. */
export const IFRAME_TARGET_FPS = 30;

export const CHARACTERS = "01";