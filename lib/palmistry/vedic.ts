import { LineAnalysis, MountAnalysis, Guna } from './types';
import { clamp } from './utils';

/**
 * Improved, weighted Guna calculation using mounts + line clarity + breaks
 */
export function getDominantGuna(mounts: Record<string, MountAnalysis>, life: LineAnalysis, head: LineAnalysis, heart: LineAnalysis): Guna {
  // normalize helper: 0..1
  const n = (v = 0) => clamp(v / 100, 0, 1);

  const j = n(mounts.jupiter?.score || 0);
  const s = n(mounts.sun?.score || 0);
  const m = n(mounts.moon?.score || 0);
  const ma = n(mounts.mars?.score || 0);
  const me = n(mounts.mercury?.score || 0);
  const sat = n(mounts.saturn?.score || 0);

  const lifeStr = n(life.score);
  const headClr = clamp(head.clarity, 0, 1);
  const heartClr = clamp(heart.clarity, 0, 1);
  const lifeBreakPenalty = Math.min(1, life.breaks * 0.15);

  const sattva =
    j * 0.32 +
    s * 0.18 +
    m * 0.14 +
    heartClr * 0.18 +
    headClr * 0.08 +
    (1 - lifeBreakPenalty) * 0.1;

  const rajas =
    ma * 0.33 +
    me * 0.22 +
    s * 0.12 +
    headClr * 0.13 +
    lifeStr * 0.1 +
    (1 - heartClr) * 0.1;

  const tamas =
    sat * 0.36 +
    (1 - m) * 0.18 +
    lifeBreakPenalty * 0.18 +
    (1 - heartClr) * 0.12 +
    (1 - headClr) * 0.06;

  if (sattva >= rajas && sattva >= tamas) return 'sattva';
  if (rajas >= sattva && rajas >= tamas) return 'rajas';
  return 'tamas';
}

export function computeVedicInsights(mounts: Record<string, MountAnalysis>, lifeScore: number, headScore: number, heartScore: number) {
  const rulingPlanet = mounts.jupiter.score >= mounts.saturn.score ? 'Jupiter' : 'Saturn';
  const element = lifeScore > 70 ? 'fire' : heartScore > 70 ? 'water' : 'air';
  const dosha = lifeScore > 70 ? 'kapha' : headScore > 70 ? 'vata' : 'pitta';
  const chakraAlignment = heartScore > headScore ? 'Heart' : 'Third Eye';
  const karmicLessons = mounts.saturn.score > 75 ? ['Discipline, responsibility and lessons of duty'] : ['Focus on steady growth and service'];
  return { rulingPlanet, element, dosha, chakraAlignment, karmicLessons };
}
