export interface LetterData {
  id: number;
  char: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface PhysicsConfig {
  gravity: [number, number, number];
  floorY: number;
  wallSize: number;
}