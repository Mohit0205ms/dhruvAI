import { PalmPrediction } from './types';
import { bbox } from './utils';
import { analyzeLifeLine, analyzeHeadLine, analyzeHeartLine, analyzeFateLine } from './lineAnalysis';
import { analyzeMounts } from './mountAnalysis';
import { detectMicroFeatures } from './microFeatures';
import { analyzeFingers } from './fingers';
import { analyzeSunLine, analyzeMercuryLine, analyzeMarriageLines } from './sunMercuryMarriage';
import { buildFateLineMessage, buildLineMessage, buildPersonalityDeep, buildHealthDeep, buildCareerDeep, buildRelationshipsDeep, buildSpiritualityDeep, buildGuidanceDeep } from './summary';
import { computeVedicInsights, getDominantGuna } from './vedic';
import { buildTimeline } from './timeline';

export function interpretPalm(prediction: PalmPrediction, meta?: { inferenceId?: string; imageSize?: { w: number; h: number }; ageNow?: number }) {
  const start = Date.now();
  if (!prediction || !prediction.points || prediction.points.length === 0) throw new Error('No points provided');

  const box = bbox(prediction.points);

  // core analyses
  const life = analyzeLifeLine(prediction.points, box);
  const head = analyzeHeadLine(prediction.points, box);
  const heart = analyzeHeartLine(prediction.points, box);
  const fate = analyzeFateLine(prediction.points, box);
  const mounts = analyzeMounts(prediction.points, box);
  const micro = detectMicroFeatures(prediction.points, box);
  const fingers = analyzeFingers(prediction.points, box);
  const sunLine = analyzeSunLine(prediction.points, box);
  const mercuryLine = analyzeMercuryLine(prediction.points, box);
  const marriage = analyzeMarriageLines(prediction.points, box);

  // Derived & dynamic text
  const fateMessage = buildFateLineMessage(fate);
  const lifeMessage = buildLineMessage('Life Line', life);
  const headMessage = buildLineMessage('Head Line', head);
  const heartMessage = buildLineMessage('Heart Line', heart);

  const dominantGuna = getDominantGuna(mounts, life, head, heart);
  const personalityText = buildPersonalityDeep(life, heart, head, mounts, dominantGuna);
  const healthText = buildHealthDeep(life, mounts);
  const careerText = buildCareerDeep(mounts, fate);
  const relationshipsText = buildRelationshipsDeep(heart, mounts);

  const chakras = (() => {
    const root = Math.round(life.score);
    const sacral = Math.round((mounts.venus.score + mounts.moon.score) / 2);
    const solar = Math.round(mounts.sun.score);
    const heartVal = Math.round(heart.score);
    const throat = Math.round(mounts.mercury.score);
    const thirdEye = Math.round(head.score);
    const crown = Math.round((mounts.jupiter.score + mounts.saturn.score) / 2);
    const summary = Object.entries({ root, sacral, solar, heart: heartVal, throat, thirdEye, crown }).filter(([k, v]) => v < 50).map(([k]) => k);
    return { root, sacral, solar, heart: heartVal, throat, thirdEye, crown, summary: summary.length === 0 ? 'All chakras balanced' : `Consider focusing on: ${summary.join(', ')}` };
  })();

  const spiritualityText = buildSpiritualityDeep(chakras, mounts);

  const remedies = {
    immediate: ['Short breathing (5-10 min)', 'Hydration and short walks', 'Mindful 5-minute break daily'],
    shortTerm: ['21-day gratitude journaling', 'Start 10-minute daily meditation', 'Simple sleep routine'],
    longTerm: ['Mentorship & structured study', 'Quarterly retreat or reset', 'Skill building plan (3-6 months)'],
    spiritual: ['Daily 5-minute reflection', 'Weekly longer practice or reading']
  };
  const guidanceText = buildGuidanceDeep(remedies);

  // Vedic
  const vedic = computeVedicInsights(mounts, life.score, head.score, heart.score);
  const timeline = buildTimeline(life, fate, mounts, meta?.ageNow ?? 25);

  // Compose structured outputs for career/health/relationships/spirituality (not only text)
  const healthStructured = {
    overall: Math.round((life.score + mounts.moon.score + mounts.saturn.score) / 3),
    physical: life.strength === 'strong' ? ['Good stamina', 'Quick recovery'] : ['Monitor energy', 'Prioritize sleep and nutrition'],
    mental: head.clarity > 0.6 ? ['Clear thinker'] : ['Try daily micro-meditation'],
    recommendations: remedies.immediate
  };

  const careerStructured = {
    suitableCareers: [
      ...(mounts.sun.score > 70 ? ['Leadership, creative roles'] : []),
      ...(mounts.mercury.score > 70 ? ['Communication, business, writing'] : []),
      ...(mounts.jupiter.score > 70 ? ['Teaching, counseling, strategy'] : []),
      'Roles combining structure with creative problem solving'
    ],
    strengths: ['Reliable', 'Consistent', 'Strategic'],
    challenges: fate.breaks > 0 ? ['Times of transition requiring reskilling'] : [],
    planetaryInfluences: `${mounts.sun.planetaryRuler} & ${mounts.mercury.planetaryRuler}`
  };

  const relationshipStructured = {
    compatibility: Math.round((heart.score + mounts.venus.score) / 2),
    relationshipStyle: heart.strength === 'strong' ? 'Open & caring' : 'Reserved but loyal',
    challenges: heart.strength === 'weak' ? ['Sharing feelings early'] : [],
    recommendations: heart.strength === 'weak' ? ['Practice small daily vulnerability steps', 'Weekly check-ins with partner'] : ['Maintain clear communication']
  };

  const spiritualityStructured = {
    kundalini: chakras.crown,
    chakraBalance: chakras,
    spiritualPath: vedic.chakraAlignment,
    practices: remedies.spiritual
  };

  // Final result object (used by API)
  const result = {
    analysisId: `palm_${prediction.detection_id}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    confidence: prediction.confidence,
    handShape: 'Rectangular',
    handSize: box.height > 600 ? 'Large' : box.height > 350 ? 'Medium' : 'Small',
    skinTexture: 'Smooth',

    // Lines (with dynamic interpretations)
    lifeLine: { ...life, interpretation: lifeMessage, vedicSignificance: 'Vitality and life force indicators.' },
    headLine: { ...head, interpretation: headMessage, vedicSignificance: 'Intellect and decision-making patterns.' },
    heartLine: { ...heart, interpretation: heartMessage, vedicSignificance: 'Emotional style and relationship capacity.' },
    fateLine: { presence: fate.rawPointsCount > 0, analysis: fate.rawPointsCount > 0 ? { ...fate, interpretation: fateMessage, vedicSignificance: 'Career & life-direction markers.' } : undefined },

    marriageLine: marriage,
    sunLine,
    mercuryLine,
    mounts,
    micro,
    fingers,

    // Personality & long-form dynamic texts (Depth C)
    personality: {
      overall: personalityText,
      traits: [], // if you want, you can fill with computed trait arrays
      dominantGuna: getDominantGuna(mounts, life, head, heart),
      strengths: [], weaknesses: []
    },

    health: { ...healthStructured, detailed: healthText },
    career: { ...careerStructured, detailed: careerText },
    relationships: { ...relationshipStructured, detailed: relationshipsText },
    spirituality: { ...spiritualityStructured, detailed: spiritualityText },

    vedicInsights: vedic,
    recommendations: remedies,
    guidance: guidanceText,
    timeline,
    processingTime: Date.now() - start
  };

  return result;
}
