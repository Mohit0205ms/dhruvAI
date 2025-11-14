import { Point, LineAnalysis } from './types';
import { bbox, clamp, variance } from './utils';

const LINE_LENGTH_WEIGHT = 0.45;
const CURVATURE_WEIGHT = 0.30;
const CLARITY_WEIGHT = 0.25;
const BREAK_PENALTY = 0.02;

function computeCurvature(sorted: Point[], orientation: 'horizontal' | 'vertical', boxSize: number) {
  if (sorted.length < 3) return 0.5;
  const start = sorted[0], end = sorted[sorted.length - 1], mid = sorted[Math.floor(sorted.length / 2)];
  const expectedMid = orientation === 'horizontal' ? (start.y + end.y) / 2 : (start.x + end.x) / 2;
  const actualMid = orientation === 'horizontal' ? mid.y : mid.x;
  return clamp(1 - Math.abs(actualMid - expectedMid) / Math.max(boxSize * 0.03, 1), 0.1, 0.95);
}

function detectBreaks(sorted: Point[], axis: 'x' | 'y', thresholdGap: number) {
  if (sorted.length < 2) return 0;
  let br = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = Math.abs((sorted as any)[i][axis] - (sorted as any)[i - 1][axis]);
    if (gap > thresholdGap) br++;
  }
  return br;
}

export function analyzeLine(points: Point[], box: ReturnType<typeof bbox>, orientation: 'horizontal' | 'vertical' = 'horizontal'): LineAnalysis {
  if (!points || points.length === 0) {
    return {
      strength: 'weak',
      lengthPx: 0,
      normalizedLength: 0,
      curvature: 0.5,
      clarity: 0.2,
      breaks: 0,
      forks: 0,
      islands: 0,
      score: 30,
      interpretation: 'No clear line detected.',
      rawPointsCount: 0
    };
  }

  const sorted = [...points].sort((a, b) => orientation === 'horizontal' ? a.x - b.x : a.y - b.y);
  const lengthPx = orientation === 'horizontal' ? Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)) : Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y));
  const normalizedLength = orientation === 'horizontal' ? lengthPx / box.width : lengthPx / box.height;
  const curvature = computeCurvature(sorted, orientation, orientation === 'horizontal' ? box.height : box.width);
  const density = points.length / Math.max(lengthPx, 1);
  const clarity = clamp(density * 6, 0.12, 0.99);
  const axis = orientation === 'horizontal' ? 'x' : 'y';
  const thresholdGap = (orientation === 'horizontal' ? box.width : box.height) * 0.06;
  const breaks = detectBreaks(sorted, axis as any, thresholdGap);
  const orthos = orientation === 'horizontal' ? points.map(p => p.y) : points.map(p => p.x);
  const orthov = variance(orthos);
  const forks = orthov > (orientation === 'horizontal' ? box.height * 0.02 : box.width * 0.02) ? 1 : 0;
  const islands = Math.max(0, breaks);

  const rawScore = (normalizedLength * LINE_LENGTH_WEIGHT + curvature * CURVATURE_WEIGHT + clarity * CLARITY_WEIGHT - breaks * BREAK_PENALTY) * 100;
  const score = Math.round(clamp(rawScore, 0, 100));
  const strength: LineAnalysis['strength'] = score >= 75 ? 'strong' : score >= 55 ? 'moderate' : 'weak';

  const interpretation = strength === 'strong'
    ? 'Line is strong and well-formed.'
    : strength === 'moderate'
      ? 'Line is present with some variation.'
      : 'Line is faint or fragmented in places.';

  return { strength, lengthPx, normalizedLength, curvature, clarity, breaks, forks, islands, score, interpretation, rawPointsCount: points.length };
}

/* Domain wrappers */
export function analyzeLifeLine(points: Point[], box: ReturnType<typeof bbox>) {
  const candidates = points.filter(p => p.x < box.centerX && p.y > box.minY + box.height * 0.12 && p.y < box.maxY - box.height * 0.04);
  return analyzeLine(candidates, box, 'vertical');
}

export function analyzeHeadLine(points: Point[], box: ReturnType<typeof bbox>) {
  const y = box.minY + box.height * 0.45;
  const candidates = points.filter(p => Math.abs(p.y - y) < box.height * 0.07 && p.x > box.minX + box.width * 0.12 && p.x < box.maxX - box.width * 0.12);
  return analyzeLine(candidates, box, 'horizontal');
}

export function analyzeHeartLine(points: Point[], box: ReturnType<typeof bbox>) {
  const y = box.minY + box.height * 0.27;
  const candidates = points.filter(p => Math.abs(p.y - y) < box.height * 0.07 && p.x > box.minX + box.width * 0.08 && p.x < box.maxX - box.width * 0.08);
  return analyzeLine(candidates, box, 'horizontal');
}

export function analyzeFateLine(points: Point[], box: ReturnType<typeof bbox>) {
  const candidates = points.filter(p => Math.abs(p.x - box.centerX) < box.width * 0.12 && p.y > box.minY + box.height * 0.12 && p.y < box.maxY - box.height * 0.05);
  return analyzeLine(candidates, box, 'vertical');
}
