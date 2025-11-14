import { Point } from './types';
import { bbox, clamp } from './utils';
import { MountAnalysis } from './types';

export function analyzeMounts(points: Point[], box: ReturnType<typeof bbox>) {
  const { minX, maxX, minY, maxY, width, height } = box;

  const regionCount = (x0: number, x1: number, y0: number, y1: number) =>
    points.filter(p => p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1).length;

  const venusCount = regionCount(minX, minX + width * 0.28, minY + height * 0.6, maxY);
  const jupiterCount = regionCount(minX + width * 0.08, minX + width * 0.32, minY, minY + height * 0.35);
  const saturnCount = regionCount(minX + width * 0.32, minX + width * 0.52, minY, minY + height * 0.4);
  const sunCount = regionCount(minX + width * 0.52, minX + width * 0.74, minY, minY + height * 0.4);
  const mercuryCount = regionCount(minX + width * 0.7, maxX, minY + height * 0.56, maxY);
  const moonCount = regionCount(minX + width * 0.56, maxX, minY + height * 0.48, maxY);
  const marsCount = regionCount(minX + width * 0.25, minX + width * 0.45, minY + height * 0.5, minY + height * 0.85);

  const total = Math.max(1, points.length);
  const normalize = (c: number) => clamp((c / total) * 160, 8, 96);

  function make(ruler: string, score: number, defaults: string[]): MountAnalysis {
    const development = score > 78 ? 'overdeveloped' : score > 60 ? 'balanced' : 'underdeveloped';
    const characteristics = defaults.slice();
    if (score > 82) characteristics.push('Prominent influence');
    return { development, score: Math.round(score), characteristics, planetaryRuler: ruler };
  }

  return {
    venus: make('Venus (Shukra)', normalize(venusCount), ['Artistic', 'Affectionate']),
    mars: make('Mars (Mangal)', normalize(marsCount), ['Courageous', 'Energetic']),
    jupiter: make('Jupiter (Guru)', normalize(jupiterCount), ['Leadership', 'Optimistic']),
    saturn: make('Saturn (Shani)', normalize(saturnCount), ['Disciplined', 'Patient']),
    mercury: make('Mercury (Budha)', normalize(mercuryCount), ['Communicative', 'Adaptable']),
    moon: make('Moon (Chandra)', normalize(moonCount), ['Intuitive', 'Imaginative']),
    sun: make('Sun (Surya)', normalize(sunCount), ['Expressive', 'Creative'])
  } as Record<string, MountAnalysis>;
}
