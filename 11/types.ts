export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum EntityType {
  TREE = 'TREE',
  ROCK = 'ROCK',
  FLOWER = 'FLOWER',
  RIVER_SEGMENT = 'RIVER_SEGMENT',
  BRIDGE = 'BRIDGE',
  GRASS_PATCH = 'GRASS_PATCH'
}

export interface Obstacle {
  id: string;
  type: EntityType;
  bounds: Rect; // The collision box
  renderBounds: Rect; // The drawing area (can be larger than collision, e.g., tree top)
  variant: number; // For visual variety
}

export interface Sprite {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string; // Shirt color
  hairColor: string;
  pantsColor: string; // New: Pants color
  skinTone: string;   // New: Skin tone
  interactionCooldown: number;
  bubble?: {
    text: string;
    life: number; // Frames remaining
  };
  facing: 'left' | 'right' | 'front';
  bobOffset: number; // For walking animation
  
  // New state fields
  state: 'idle' | 'moving';
  stateTimer: number; // How long to remain in current state
}

export interface Fish {
  id: number;
  x: number;
  y: number;
  color: string;
  speed: number;
  direction: 1 | -1; // 1 = down, -1 = up
  facingRight: boolean; // Orientation
  wiggleOffset: number;
  riverOffset: number; // Offset from river center to vary position
}

export interface GameState {
  sprites: Sprite[];
  obstacles: Obstacle[];
  fish: Fish[];
}