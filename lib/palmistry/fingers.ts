import { Point } from './types';
import { bbox, mean, clamp } from './utils';
import { FingerAnalysis } from './types';

export function analyzeFingers(points: Point[], box: ReturnType<typeof bbox>) {
  const regionW = box.width / 6;
  const fingerTopYs: number[] = [];
  for (let i = 0; i < 5; i++) {
    const x0 = box.minX + regionW * (i + 0.5);
    const candidates = points.filter(p => p.x >= x0 - regionW / 1.1 && p.x <= x0 + regionW / 1.1);
    if (candidates.length === 0) fingerTopYs.push(box.maxY); else fingerTopYs.push(Math.min(...candidates.map(c => c.y)));
  }
  const palmBottom = box.maxY;
  const fingerLengths = fingerTopYs.map(y => Math.max(0, palmBottom - y));
  const meanLen = Math.max(1, mean(fingerLengths));
  const [thumb, index, middle, ring, pinky] = fingerLengths;

  function make(n: number, label: string): FingerAnalysis {
    const ratio = n / meanLen;
    const type: FingerAnalysis['type'] = ratio > 1.1 ? 'long' : ratio < 0.9 ? 'short' : 'average';
    const score = Math.round(clamp(ratio, 0.2, 1.4) * 70);
    const significance = `${label} finger: ${type}. ${label === 'Thumb' ? 'Associated with willpower.' : label === 'Index' ? 'Linked to leadership.' : label === 'Middle' ? 'Shows responsibility.' : label === 'Ring' ? 'Shows creative / relational leanings.' : 'Shows communication ability.'}`;
    return { lengthPx: n, lengthRatio: Math.round(ratio * 100) / 100, flexibility: 0.7, alignment: 0.85, type, significance, score };
  }

  return {
    thumb: make(thumb, 'Thumb'),
    index: make(index, 'Index'),
    middle: make(middle, 'Middle'),
    ring: make(ring, 'Ring'),
    pinky: make(pinky, 'Pinky')
  } as Record<string, FingerAnalysis>;
}
