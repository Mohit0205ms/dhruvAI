import { LineAnalysis } from './types';
import { MountAnalysis } from './types';

export function buildTimeline(life: LineAnalysis, fate: LineAnalysis, mounts: Record<string, MountAnalysis>, ageNow = 25) {
  const timeline: Record<string, string> = {};
  for (let i = 0; i < 20; i++) {
    const age = ageNow + i;
    const events: string[] = [];
    if (i === 2 && life.breaks > 0) events.push('Short reassessment—possible health or work check.');
    if (i === 4 && fate.forks > 0) events.push('Opportunity for new direction in study or career.');
    if (i === 7 && mounts.sun.score > 75) events.push('Increased visibility and possible recognition.');
    if (i === 10 && mounts.moon.score > 70) events.push('Personal relationship deepening.');
    if (i === 15 && life.score > 70) events.push('Consolidation and long-term stability.');
    if (events.length === 0) events.push('Steady progress with manageable changes.');
    timeline[`age${age}`] = events.join(' ');
  }
  return timeline;
}
