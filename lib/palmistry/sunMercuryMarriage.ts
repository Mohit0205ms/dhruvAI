import { Point } from './types';
import { bbox, clamp } from './utils';
import { LineAnalysis } from './types';

export function analyzeSunLine(points: Point[], box: ReturnType<typeof bbox>) {
  const region = points.filter(p => p.x > box.minX + box.width * 0.48 && p.x < box.maxX - box.width * 0.06 && p.y > box.minY + box.height * 0.28 && p.y < box.maxY - box.height * 0.15);
  if (region.length < 5) return { presence: false } as const;
  const sorted = [...region].sort((a, b) => a.x - b.x);
  let slopeSum = 0;
  for (let i = 1; i < sorted.length; i++) slopeSum += (sorted[i].y - sorted[i - 1].y) / Math.max(1, sorted[i].x - sorted[i - 1].x);
  const avgSlope = slopeSum / Math.max(1, sorted.length - 1);
  const diagonal = Math.abs(avgSlope) > 0.2;
  const lengthPx = Math.max(...region.map(p => p.y)) - Math.min(...region.map(p => p.y));
  const clarity = clamp(region.length / Math.max(lengthPx, 1) * 6, 0.2, 0.95);
  const score = Math.round((clamp(lengthPx / box.height, 0, 1) * 0.6 + clarity * 0.4) * 100);
  const strength: LineAnalysis['strength'] = score >= 75 ? 'strong' : score >= 55 ? 'moderate' : 'weak';
  const interp = strength === 'strong' ? 'Prominent Sun line — potential public recognition or success.' : strength === 'moderate' ? 'Visible Sun line — success possible with effort.' : 'Sun line weak or absent.';
  return { presence: diagonal, analysis: { strength, lengthPx, normalizedLength: clamp(lengthPx / box.height, 0, 1), curvature: 0.8, clarity, breaks: 0, forks: 0, islands: 0, score, interpretation: interp, rawPointsCount: region.length } as LineAnalysis };
}

export function analyzeMercuryLine(points: Point[], box: ReturnType<typeof bbox>) {
  const region = points.filter(p => p.x > box.maxX - box.width * 0.26 && p.y > box.minY + box.height * 0.2 && p.y < box.maxY - box.height * 0.08);
  if (region.length < 4) return { presence: false } as const;
  const sorted = [...region].sort((a, b) => a.y - b.y);
  let verticalContinuity = 0;
  for (let i = 1; i < sorted.length; i++) if (Math.abs(sorted[i].x - sorted[i - 1].x) < box.width * 0.03) verticalContinuity++;
  const presence = verticalContinuity >= Math.max(1, Math.floor(sorted.length * 0.4));
  const lengthPx = Math.max(...sorted.map(p => p.y)) - Math.min(...sorted.map(p => p.y));
  const clarity = clamp(verticalContinuity / Math.max(1, sorted.length) * 1.2, 0.2, 0.98);
  const score = Math.round((clamp(lengthPx / box.height, 0, 1) * 0.5 + clarity * 0.5) * 100);
  const strength: LineAnalysis['strength'] = score >= 75 ? 'strong' : score >= 55 ? 'moderate' : 'weak';
  const interp = strength === 'strong' ? 'Strong Mercury line — excellent communication and practical intelligence.' : strength === 'moderate' ? 'Mercury line present — good practical skills.' : 'Mercury line weak or absent.';
  return { presence, analysis: { strength, lengthPx, normalizedLength: clamp(lengthPx / box.height, 0, 1), curvature: 0.6, clarity, breaks: 0, forks: 0, islands: 0, score, interpretation: interp, rawPointsCount: sorted.length } as LineAnalysis };
}

export function analyzeMarriageLines(points: Point[], box: ReturnType<typeof bbox>) {
  const yBase = box.minY + box.height * 0.2;
  const candidates = points.filter(p => p.x > box.maxX - box.width * 0.28 && Math.abs(p.y - yBase) < box.height * 0.06);
  const ys = Array.from(new Set(candidates.map(p => Math.round(p.y))));
  const count = Math.min(4, Math.max(0, ys.length));
  const quality = count >= 2 ? 'harmonious' : count === 1 ? 'balanced' : 'challenging';
  const interpretation = count > 0 ? `Detected ${count} marriage line(s) — ${quality}.` : 'No clear marriage lines detected.';
  return { count, quality, interpretation };
}
