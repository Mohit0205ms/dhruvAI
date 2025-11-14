export interface Point { x: number; y: number; }

export type Strength = 'weak' | 'moderate' | 'strong';
export type Guna = 'sattva' | 'rajas' | 'tamas';

export interface LineAnalysis {
  strength: Strength;
  lengthPx: number;
  normalizedLength: number;
  curvature: number;
  clarity: number;
  breaks: number;
  forks: number;
  islands: number;
  score: number; // 0..100
  interpretation: string;
  rawPointsCount: number;
}

export interface MountAnalysis {
  development: 'underdeveloped' | 'balanced' | 'overdeveloped';
  score: number;
  characteristics: string[];
  planetaryRuler: string;
}

export interface FingerAnalysis {
  lengthPx: number;
  lengthRatio: number;
  flexibility: number;
  alignment: number;
  type: 'short' | 'average' | 'long';
  significance: string;
  score: number;
}

export interface PalmPrediction {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  points: Point[];
  class_id: number;
  detection_id: string;
}
