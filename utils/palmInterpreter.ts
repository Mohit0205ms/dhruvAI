// app/api/palm-reading/route.ts
// Single-file advanced palmistry interpreter (TypeScript, Expo Router)
// Tone 2: Confident, Direct, Clear. Detail level B (4–6 sentences each).

export interface Point {
  x: number;
  y: number;
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

type Strength = 'weak' | 'moderate' | 'strong';
type Guna = 'sattva' | 'rajas' | 'tamas';

interface LineAnalysis {
  strength: Strength;
  lengthPx: number;
  normalizedLength: number;
  curvature: number;
  clarity: number;
  breaks: number;
  forks: number;
  islands: number;
  score: number;
  interpretation: string;
  rawPointsCount: number;
}

interface MountAnalysis {
  development: 'underdeveloped' | 'balanced' | 'overdeveloped';
  score: number;
  characteristics: string[];
  planetaryRuler: string;
}
interface FingerAnalysis {
  lengthPx: number;
  lengthRatio: number;
  flexibility: number;
  alignment: number;
  type: 'short' | 'average' | 'long';
  significance: string;
  score: number;
}

interface HealthIndicators {
  overall: number;
  physical: string[];
  mental: string[];
  recommendations: string[];
}
interface CareerInsights {
  suitableCareers: string[];
  strengths: string[];
  challenges: string[];
  planetaryInfluences: string;
}
interface RelationshipInsights {
  compatibility: number;
  relationshipStyle: string;
  challenges: string[];
  recommendations: string[];
}
interface SpiritualProfile {
  kundalini: number;
  chakraBalance: Record<string, number>;
  spiritualPath: string;
  practices: string[];
}

export interface PalmReadingResult {
  analysisId: string;
  timestamp: string;
  confidence: number;
  handShape: string;
  handSize: string;
  skinTexture: string;
  lifeLine: LineAnalysis & { vedicSignificance: string };
  heartLine: LineAnalysis & { vedicSignificance: string };
  headLine: LineAnalysis & { vedicSignificance: string };
  fateLine: {
    presence: boolean;
    analysis?: LineAnalysis & { vedicSignificance: string };
  };
  marriageLine: { count: number; quality: string; interpretation: string };
  sunLine: { presence: boolean; analysis?: LineAnalysis };
  mercuryLine: { presence: boolean; analysis?: LineAnalysis };
  mounts: {
    venus: MountAnalysis;
    mars: MountAnalysis;
    jupiter: MountAnalysis;
    saturn: MountAnalysis;
    mercury: MountAnalysis;
    moon: MountAnalysis;
    sun: MountAnalysis;
  };
  fingers: {
    thumb: FingerAnalysis;
    index: FingerAnalysis;
    middle: FingerAnalysis;
    ring: FingerAnalysis;
    pinky: FingerAnalysis;
  };
  personality: {
    overall: string;
    traits: string[];
    dominantGuna: Guna;
    strengths: string[];
    weaknesses: string[];
  };
  health: HealthIndicators;
  career: CareerInsights;
  relationships: RelationshipInsights;
  spirituality: SpiritualProfile;
  vedicInsights: {
    rulingPlanet: string;
    element: 'fire' | 'earth' | 'air' | 'water';
    dosha: 'vata' | 'pitta' | 'kapha';
    chakraAlignment: string;
    karmicLessons: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    spiritual: string[];
  };
  version: string;
  modelUsed: string;
  processingTime: number;
}

/* ====== Utilities ====== */
function clamp(v: number, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, v));
}
function randChoice(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function mean(nums: number[]) {
  return nums.length === 0 ? 0 : nums.reduce((a, b) => a + b, 0) / nums.length;
}
function variance(nums: number[]) {
  if (nums.length === 0) return 0;
  const m = mean(nums);
  return mean(nums.map((n) => (n - m) ** 2));
}
function bbox(points: Point[]) {
  const xs = points.map((p) => p.x),
    ys = points.map((p) => p.y);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const width = Math.max(1, maxX - minX),
    height = Math.max(1, maxY - minY);
  return {
    minX,
    maxX,
    minY,
    maxY,
    width,
    height,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

/* ====== Line analysis core ====== */
const LINE_LENGTH_WEIGHT = 0.45,
  CURVATURE_WEIGHT = 0.3,
  CLARITY_WEIGHT = 0.25,
  BREAK_PENALTY = 0.02;

function computeCurvature(
  sorted: Point[],
  orientation: 'horizontal' | 'vertical',
  boxSize: number,
) {
  if (sorted.length < 3) return 0.5;
  const start = sorted[0],
    end = sorted[sorted.length - 1],
    mid = sorted[Math.floor(sorted.length / 2)];
  const expectedMid =
    orientation === 'horizontal'
      ? (start.y + end.y) / 2
      : (start.x + end.x) / 2;
  const actualMid = orientation === 'horizontal' ? mid.y : mid.x;
  return clamp(
    1 - Math.abs(actualMid - expectedMid) / Math.max(boxSize * 0.03, 1),
    0.1,
    0.95,
  );
}
function detectBreaks(sorted: Point[], axis: 'x' | 'y', thresholdGap: number) {
  if (sorted.length < 2) return 0;
  let br = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = Math.abs(
      (sorted as any)[i][axis] - (sorted as any)[i - 1][axis],
    );
    if (gap > thresholdGap) br++;
  }
  return br;
}
function analyzeLine(
  points: Point[],
  box: ReturnType<typeof bbox>,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
): LineAnalysis {
  if (!points || points.length === 0)
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
      rawPointsCount: 0,
    };
  const sorted = [...points].sort((a, b) =>
    orientation === 'horizontal' ? a.x - b.x : a.y - b.y,
  );
  const lengthPx =
    orientation === 'horizontal'
      ? Math.max(...points.map((p) => p.x)) -
        Math.min(...points.map((p) => p.x))
      : Math.max(...points.map((p) => p.y)) -
        Math.min(...points.map((p) => p.y));
  const normalizedLength =
    orientation === 'horizontal' ? lengthPx / box.width : lengthPx / box.height;
  const curvature = computeCurvature(
    sorted,
    orientation,
    orientation === 'horizontal' ? box.height : box.width,
  );
  const density = points.length / Math.max(lengthPx, 1);
  const clarity = clamp(density * 6, 0.12, 0.99);
  const axis = orientation === 'horizontal' ? 'x' : 'y';
  const thresholdGap =
    (orientation === 'horizontal' ? box.width : box.height) * 0.06;
  const breaks = detectBreaks(sorted, axis as any, thresholdGap);
  const orthos =
    orientation === 'horizontal'
      ? points.map((p) => p.y)
      : points.map((p) => p.x);
  const orthov = variance(orthos);
  const forks =
    orthov >
    (orientation === 'horizontal' ? box.height * 0.02 : box.width * 0.02)
      ? 1
      : 0;
  const islands = Math.max(0, breaks);
  const rawScore =
    (normalizedLength * LINE_LENGTH_WEIGHT +
      curvature * CURVATURE_WEIGHT +
      clarity * CLARITY_WEIGHT -
      breaks * BREAK_PENALTY) *
    100;
  const score = Math.round(clamp(rawScore, 0, 100));
  const strength: Strength =
    score >= 75 ? 'strong' : score >= 55 ? 'moderate' : 'weak';
  // Interpretation placeholder: will be expanded in final summary
  const interpretation =
    strength === 'strong'
      ? 'Strong and clear.'
      : strength === 'moderate'
      ? 'Moderate and reliable.'
      : 'Weak or fragmented.';
  return {
    strength,
    lengthPx,
    normalizedLength,
    curvature,
    clarity,
    breaks,
    forks,
    islands,
    score,
    interpretation,
    rawPointsCount: points.length,
  };
}

/* ====== Domain wrappers ====== */
function analyzeLifeLine(points: Point[], box: ReturnType<typeof bbox>) {
  const candidates = points.filter(
    (p) =>
      p.x < box.centerX &&
      p.y > box.minY + box.height * 0.12 &&
      p.y < box.maxY - box.height * 0.04,
  );
  return analyzeLine(candidates, box, 'vertical');
}
function analyzeHeadLine(points: Point[], box: ReturnType<typeof bbox>) {
  const y = box.minY + box.height * 0.45;
  const candidates = points.filter(
    (p) =>
      Math.abs(p.y - y) < box.height * 0.07 &&
      p.x > box.minX + box.width * 0.12 &&
      p.x < box.maxX - box.width * 0.12,
  );
  return analyzeLine(candidates, box, 'horizontal');
}
function analyzeHeartLine(points: Point[], box: ReturnType<typeof bbox>) {
  const y = box.minY + box.height * 0.27;
  const candidates = points.filter(
    (p) =>
      Math.abs(p.y - y) < box.height * 0.07 &&
      p.x > box.minX + box.width * 0.08 &&
      p.x < box.maxX - box.width * 0.08,
  );
  return analyzeLine(candidates, box, 'horizontal');
}
function analyzeFateLine(points: Point[], box: ReturnType<typeof bbox>) {
  const candidates = points.filter(
    (p) =>
      Math.abs(p.x - box.centerX) < box.width * 0.12 &&
      p.y > box.minY + box.height * 0.12 &&
      p.y < box.maxY - box.height * 0.05,
  );
  return analyzeLine(candidates, box, 'vertical');
}

/* ====== Mount analysis ====== */
function analyzeMounts(points: Point[], box: ReturnType<typeof bbox>) {
  const { minX, maxX, minY, maxY, width, height } = box;
  const regionCount = (x0: number, x1: number, y0: number, y1: number) =>
    points.filter((p) => p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1)
      .length;
  const venusCount = regionCount(
    minX,
    minX + width * 0.28,
    minY + height * 0.6,
    maxY,
  );
  const jupiterCount = regionCount(
    minX + width * 0.08,
    minX + width * 0.32,
    minY,
    minY + height * 0.35,
  );
  const saturnCount = regionCount(
    minX + width * 0.32,
    minX + width * 0.52,
    minY,
    minY + height * 0.4,
  );
  const sunCount = regionCount(
    minX + width * 0.52,
    minX + width * 0.74,
    minY,
    minY + height * 0.4,
  );
  const mercuryCount = regionCount(
    minX + width * 0.7,
    maxX,
    minY + height * 0.56,
    maxY,
  );
  const moonCount = regionCount(
    minX + width * 0.56,
    maxX,
    minY + height * 0.48,
    maxY,
  );
  const marsCount = regionCount(
    minX + width * 0.25,
    minX + width * 0.45,
    minY + height * 0.5,
    minY + height * 0.85,
  );
  const total = Math.max(1, points.length);
  const normalize = (c: number) => clamp((c / total) * 160, 8, 96);
  const make = (ruler: string, score: number, defaults: string[]) => {
    const development =
      score > 78 ? 'overdeveloped' : score > 60 ? 'balanced' : 'underdeveloped';
    const chars = defaults.slice();
    if (score > 82) chars.push('Prominent influence');
    return {
      development,
      score: Math.round(score),
      characteristics: chars,
      planetaryRuler: ruler,
    } as MountAnalysis;
  };
  return {
    venus: make('Venus (Shukra)', normalize(venusCount), [
      'Artistic',
      'Affectionate',
    ]),
    mars: make('Mars (Mangal)', normalize(marsCount), [
      'Courageous',
      'Energetic',
    ]),
    jupiter: make('Jupiter (Guru)', normalize(jupiterCount), [
      'Leadership',
      'Optimistic',
    ]),
    saturn: make('Saturn (Shani)', normalize(saturnCount), [
      'Disciplined',
      'Patient',
    ]),
    mercury: make('Mercury (Budha)', normalize(mercuryCount), [
      'Communicative',
      'Adaptable',
    ]),
    moon: make('Moon (Chandra)', normalize(moonCount), [
      'Intuitive',
      'Imaginative',
    ]),
    sun: make('Sun (Surya)', normalize(sunCount), ['Expressive', 'Creative']),
  };
}

/* ====== Micro features, fingers, sun/mercury/marriage (helpers) ====== */
function detectMicroFeatures(points: Point[], box: ReturnType<typeof bbox>) {
  const gridX = 6,
    gridY = 6;
  const cellW = box.width / gridX,
    cellH = box.height / gridY;
  const grid: number[][] = Array.from({ length: gridY }, () =>
    Array(gridX).fill(0),
  );
  for (const p of points) {
    const gx = Math.min(
      gridX - 1,
      Math.max(0, Math.floor((p.x - box.minX) / cellW)),
    );
    const gy = Math.min(
      gridY - 1,
      Math.max(0, Math.floor((p.y - box.minY) / cellH)),
    );
    grid[gy][gx]++;
  }
  let dense = 0,
    isolated = 0;
  for (let y = 0; y < gridY; y++)
    for (let x = 0; x < gridX; x++) {
      if (grid[y][x] >= 6) dense++;
      if (grid[y][x] > 0 && grid[y][x] <= 2) isolated++;
    }
  return {
    islands: Math.round(isolated / 2),
    stars: dense >= 2 ? Math.min(4, dense) : 0,
    crosses: Math.round(dense / 3),
    branches: Math.round(dense / 2),
    denseCells: dense,
    isolatedCells: isolated,
  };
}
function analyzeFingers(points: Point[], box: ReturnType<typeof bbox>) {
  const regionW = box.width / 6;
  const tops: number[] = [];
  for (let i = 0; i < 5; i++) {
    const x0 = box.minX + regionW * (i + 0.5);
    const cand = points.filter(
      (p) => p.x >= x0 - regionW / 1.1 && p.x <= x0 + regionW / 1.1,
    );
    tops.push(cand.length === 0 ? box.maxY : Math.min(...cand.map((c) => c.y)));
  }
  const palmBottom = box.maxY;
  const fingerLens = tops.map((y) => Math.max(0, palmBottom - y));
  const meanLen = Math.max(1, mean(fingerLens));
  const [thumb, index, middle, ring, pinky] = fingerLens;
  const make = (n: number, label: string) => {
    const ratio = n / meanLen;
    const type: FingerAnalysis['type'] =
      ratio > 1.1 ? 'long' : ratio < 0.9 ? 'short' : 'average';
    const score = Math.round(clamp(ratio, 0.2, 1.4) * 70);
    const sig = `${label} finger: ${type}.`;
    return {
      lengthPx: n,
      lengthRatio: Math.round(ratio * 100) / 100,
      flexibility: 0.7,
      alignment: 0.85,
      type,
      significance: sig,
      score,
    };
  };
  return {
    thumb: make(thumb, 'Thumb'),
    index: make(index, 'Index'),
    middle: make(middle, 'Middle'),
    ring: make(ring, 'Ring'),
    pinky: make(pinky, 'Pinky'),
  };
}
function analyzeSunLine(points: Point[], box: ReturnType<typeof bbox>) {
  const region = points.filter(
    (p) =>
      p.x > box.minX + box.width * 0.48 &&
      p.x < box.maxX - box.width * 0.06 &&
      p.y > box.minY + box.height * 0.28 &&
      p.y < box.maxY - box.height * 0.15,
  );
  if (region.length < 5) return { presence: false } as const;
  const sorted = [...region].sort((a, b) => a.x - b.x);
  let slope = 0;
  for (let i = 1; i < sorted.length; i++)
    slope +=
      (sorted[i].y - sorted[i - 1].y) /
      Math.max(1, sorted[i].x - sorted[i - 1].x);
  const avg = slope / Math.max(1, sorted.length - 1);
  const diag = Math.abs(avg) > 0.2;
  const lengthPx =
    Math.max(...region.map((p) => p.y)) - Math.min(...region.map((p) => p.y));
  const clarity = clamp((region.length / Math.max(lengthPx, 1)) * 6, 0.2, 0.95);
  const score = Math.round(
    (clamp(lengthPx / box.height, 0, 1) * 0.6 + clarity * 0.4) * 100,
  );
  const strength: Strength =
    score >= 75 ? 'strong' : score >= 55 ? 'moderate' : 'weak';
  const interp =
    strength === 'strong'
      ? 'Visible and strong — likely recognition.'
      : strength === 'moderate'
      ? 'Visible — potential with effort.'
      : 'Weak or absent.';
  return {
    presence: diag,
    analysis: {
      strength,
      lengthPx,
      normalizedLength: clamp(lengthPx / box.height, 0, 1),
      curvature: 0.8,
      clarity,
      breaks: 0,
      forks: 0,
      islands: 0,
      score,
      interpretation: interp,
      rawPointsCount: region.length,
    } as LineAnalysis,
  };
}
function analyzeMercuryLine(points: Point[], box: ReturnType<typeof bbox>) {
  const region = points.filter(
    (p) =>
      p.x > box.maxX - box.width * 0.26 &&
      p.y > box.minY + box.height * 0.2 &&
      p.y < box.maxY - box.height * 0.08,
  );
  if (region.length < 4) return { presence: false } as const;
  const sorted = [...region].sort((a, b) => a.y - b.y);
  let cont = 0;
  for (let i = 1; i < sorted.length; i++)
    if (Math.abs(sorted[i].x - sorted[i - 1].x) < box.width * 0.03) cont++;
  const presence = cont >= Math.max(1, Math.floor(sorted.length * 0.4));
  const lengthPx =
    Math.max(...sorted.map((p) => p.y)) - Math.min(...sorted.map((p) => p.y));
  const clarity = clamp((cont / Math.max(1, sorted.length)) * 1.2, 0.2, 0.98);
  const score = Math.round(
    (clamp(lengthPx / box.height, 0, 1) * 0.5 + clarity * 0.5) * 100,
  );
  const strength: Strength =
    score >= 75 ? 'strong' : score >= 55 ? 'moderate' : 'weak';
  const interp =
    strength === 'strong'
      ? 'Clear Mercury line — strong communication.'
      : strength === 'moderate'
      ? 'Mercury line present — practical communication.'
      : 'Mercury line weak or absent.';
  return {
    presence,
    analysis: {
      strength,
      lengthPx,
      normalizedLength: clamp(lengthPx / box.height, 0, 1),
      curvature: 0.6,
      clarity,
      breaks: 0,
      forks: 0,
      islands: 0,
      score,
      interpretation: interp,
      rawPointsCount: sorted.length,
    } as LineAnalysis,
  };
}
function analyzeMarriageLines(points: Point[], box: ReturnType<typeof bbox>) {
  const yBase = box.minY + box.height * 0.2;
  const cand = points.filter(
    (p) =>
      p.x > box.maxX - box.width * 0.28 &&
      Math.abs(p.y - yBase) < box.height * 0.06,
  );
  const ys = Array.from(new Set(cand.map((p) => Math.round(p.y))));
  const count = Math.min(4, Math.max(0, ys.length));
  const quality =
    count >= 2 ? 'harmonious' : count === 1 ? 'balanced' : 'challenging';
  const interp =
    count > 0
      ? `Detected ${count} marriage line(s) — ${quality}.`
      : 'No clear marriage lines detected.';
  return { count, quality, interpretation: interp };
}

/* ====== Vedic helpers ====== */
function getDominantGuna(mounts: Record<string, MountAnalysis>): Guna {
  const sattvaScore = (mounts.jupiter?.score || 0) + (mounts.sun?.score || 0);
  const rajasScore = (mounts.mars?.score || 0) + (mounts.mercury?.score || 0);
  const tamasScore = (mounts.saturn?.score || 0) + (mounts.moon?.score || 0);
  if (sattvaScore >= rajasScore && sattvaScore >= tamasScore) return 'sattva';
  if (rajasScore >= sattvaScore && rajasScore >= tamasScore) return 'rajas';
  return 'tamas';
}

/* ====== High-level message generator (Tone 2, 4-6 sentences) ====== */
function buildLineMessage(
  lineName: string,
  analysis: LineAnalysis,
  simpleLabel: string,
) {
  // Tone 2: confident, direct, clear. 4-6 sentences.
  const strengthText =
    analysis.strength === 'strong'
      ? `${lineName} is strong and well-defined.`
      : analysis.strength === 'moderate'
      ? `${lineName} is clear but not dominant.`
      : `${lineName} is faint or broken in places.`;
  const meaning =
    analysis.strength === 'strong'
      ? `This indicates a clear and reliable trait in the corresponding area.`
      : analysis.strength === 'moderate'
      ? `This suggests reasonable capability with occasional ups and downs.`
      : `This suggests that this area may require more conscious effort.`;
  const nuance =
    analysis.breaks > 0
      ? `There are ${analysis.breaks} small gaps detected — these usually mark temporary stress or transitions rather than permanent problems.`
      : `No significant breaks are detected, which points to steady development.`;
  const takeaway =
    analysis.score >= 70
      ? `Overall: this is a positive sign.`
      : analysis.score >= 50
      ? `Overall: manageable, with room to improve.`
      : `Overall: focus on strengthening this area through practice and routines.`;
  // Compose 4 sentences
  return `${strengthText} ${meaning} ${nuance} ${takeaway}`;
}

/* ====== Derived generators (health/career/relationship/spiritual) - short and direct ====== */
function generatePersonality(
  life: LineAnalysis,
  heart: LineAnalysis,
  head: LineAnalysis,
  mounts: Record<string, MountAnalysis>,
  fatePresent: boolean,
) {
  const primary = Math.round((life.score + heart.score + head.score) / 3);
  const mountList = Object.entries(mounts) as [string, MountAnalysis][];
  const dom = mountList.sort((a, b) => b[1].score - a[1].score)[0];
  const traits: Set<string> = new Set();
  if (life.strength === 'strong') {
    traits.add('Energetic');
    traits.add('Resilient');
  } else traits.add('Cautious');
  if (head.strength === 'strong') {
    traits.add('Analytical');
    traits.add('Decisive');
  } else traits.add('Practical');
  if (heart.strength === 'strong') {
    traits.add('Warm');
    traits.add('Loyal');
  } else traits.add('Reserved');
  if (dom && dom[1].score > 70) traits.add(`${dom[0]}-oriented`);
  const templates = [
    `Direct summary: You are ${Array.from(traits)
      .slice(0, 3)
      .join(', ')} with about ${primary}% balance across the key areas.`,
    `Quick read: Your palm shows ${Array.from(traits)
      .slice(0, 3)
      .join(', ')} tendencies and an overall score near ${primary}%.`,
  ];
  const overall = randChoice(templates);
  const strengths = Array.from(traits);
  const weaknesses: string[] = [];
  if (life.strength !== 'strong')
    weaknesses.push('Work on daily routines to improve vitality.');
  if (head.strength !== 'strong')
    weaknesses.push('Short focused practice to boost concentration.');
  if (heart.strength !== 'strong')
    weaknesses.push('Practice opening up in safe relationships.');
  const dominantGuna = getDominantGuna(mounts);
  return {
    overall,
    traits: Array.from(traits),
    dominantGuna,
    strengths,
    weaknesses,
  };
}

function generateHealth(
  life: LineAnalysis,
  mounts: Record<string, MountAnalysis>,
): HealthIndicators {
  const overall = Math.round(
    (life.score + mounts.moon.score + mounts.saturn.score) / 3,
  );
  const physical =
    life.strength === 'strong'
      ? ['Good stamina', 'Resilient']
      : ['Monitor energy', 'Improve sleep/diet'];
  const mental =
    mounts.mercury.score > 60
      ? ['Clear thinker']
      : ['Try daily short meditations'];
  const recommendations =
    life.strength === 'weak'
      ? ['Start gentle exercise', 'Daily breathing practice']
      : ['Maintain current routines'];
  return { overall, physical, mental, recommendations };
}

function generateCareer(
  mounts: Record<string, MountAnalysis>,
  fate: LineAnalysis,
): CareerInsights {
  const suitable: string[] = [];
  if (mounts.sun.score > 70) suitable.push('Leadership, creative professions');
  if (mounts.mercury.score > 70)
    suitable.push('Business, communication, writing');
  if (mounts.jupiter.score > 70) suitable.push('Teaching, counseling');
  const strengths = ['Adaptability', 'Practical resilience'];
  const challenges =
    fate.score < 50 ? ['Potential uncertainty in direction'] : [];
  const planetary = `${mounts.sun.planetaryRuler} & ${mounts.mercury.planetaryRuler} guide career strengths.`;
  return {
    suitableCareers: suitable,
    strengths,
    challenges,
    planetaryInfluences: planetary,
  };
}

function generateRelationship(
  heart: LineAnalysis,
  mounts: Record<string, MountAnalysis>,
): RelationshipInsights {
  const compatibility = Math.round((heart.score + mounts.venus.score) / 2);
  const style =
    heart.strength === 'strong' ? 'Open and caring' : 'Reserved but loyal';
  const challenges = heart.strength === 'weak' ? ['Expressing feelings'] : [];
  const recommendations =
    heart.strength === 'weak'
      ? ['Practice clear communication', 'Small acts of appreciation']
      : ['Keep boundaries', 'Show appreciation'];
  return {
    compatibility,
    relationshipStyle: style,
    challenges,
    recommendations,
  };
}

function generateSpiritual(
  chakras: any,
  mounts: Record<string, MountAnalysis>,
): SpiritualProfile {
  const kundalini = Math.round((chakras.thirdEye + chakras.crown) / 2);
  const chakraBalance = {
    root: chakras.root,
    sacral: chakras.sacral,
    solar: chakras.solar,
    heart: chakras.heart,
    throat: chakras.throat,
    thirdEye: chakras.thirdEye,
    crown: chakras.crown,
  };
  const path =
    mounts.jupiter.score > mounts.saturn.score
      ? 'Knowledge & study'
      : 'Service & action';
  const practices = ['Meditation', 'Breathing exercises', 'Daily reflection'];
  if (mounts.jupiter.score > 75)
    practices.push('Scripture or philosophical study');
  return { kundalini, chakraBalance, spiritualPath: path, practices };
}

/* ====== Main interpreter ====== */
export function interpretPalmReading(
  prediction: PalmPrediction,
  meta?: {
    inferenceId?: string;
    imageSize?: { w: number; h: number };
    ageNow?: number;
  },
): PalmReadingResult {
  const start = Date.now();
  if (!prediction || !prediction.points || prediction.points.length === 0)
    throw new Error('No points in prediction');
  const box = bbox(prediction.points);

  const life = analyzeLifeLine(prediction.points, box);
  const head = analyzeHeadLine(prediction.points, box);
  const heart = analyzeHeartLine(prediction.points, box);
  const fate = analyzeFateLine(prediction.points, box);
  const mounts = analyzeMounts(prediction.points, box);
  const micros = detectMicroFeatures(prediction.points, box);
  const fingers = analyzeFingers(prediction.points, box);
  const sunLine = analyzeSunLine(prediction.points, box);
  const mercuryLine = analyzeMercuryLine(prediction.points, box);
  const marriage = analyzeMarriageLines(prediction.points, box);

  // Messages (Tone 2, medium length). 4 sentences composed confidently.
  const lifeMsg = buildLineMessage('Life Line', life, 'life');
  const headMsg = buildLineMessage('Head Line', head, 'head');
  const heartMsg = buildLineMessage('Heart Line', heart, 'heart');

  const personality = generatePersonality(
    life,
    heart,
    head,
    mounts,
    fate.rawPointsCount > 0,
  );
  const health = generateHealth(life, mounts);
  const career = generateCareer(mounts, fate);
  const relationships = generateRelationship(heart, mounts);
  const chakras = computeChakraProfile(mounts, life, head, heart);
  const spirituality = generateSpiritual(chakras, mounts);
  const karmicLessons = computeKarmicLessons(mounts, fate);
  const timeline = buildTimeline(life, fate, mounts, meta?.ageNow ?? 25);
  const remedies = suggestRemedies(mounts, life, heart, head);
  const handShapeType = classifyHandShape(box, fingers);

  return {
    analysisId: `palm_${prediction.detection_id}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    confidence: prediction.confidence,
    handShape: handShapeType.handType,
    handSize:
      box.height > 600 ? 'Large' : box.height > 350 ? 'Medium' : 'Small',
    skinTexture: 'Smooth',
    lifeLine: {
      ...life,
      interpretation: lifeMsg,
      vedicSignificance: 'Indicates vitality and life direction.',
    },
    heartLine: {
      ...heart,
      interpretation: heartMsg,
      vedicSignificance: 'Indicates emotional style and relationships.',
    },
    headLine: {
      ...head,
      interpretation: headMsg,
      vedicSignificance: 'Indicates thinking and decision-making.',
    },
    fateLine: {
      presence: fate.rawPointsCount > 0,
      analysis:
        fate.rawPointsCount > 0
          ? { ...fate, vedicSignificance: 'Shows life purpose tendencies.' }
          : undefined,
    },
    marriageLine: marriage,
    sunLine: {
      presence: !!(sunLine as any).presence,
      analysis: (sunLine as any).analysis,
    },
    mercuryLine: {
      presence: !!(mercuryLine as any).presence,
      analysis: (mercuryLine as any).analysis,
    },
    mounts: {
      venus: mounts.venus,
      mars: mounts.mars,
      jupiter: mounts.jupiter,
      saturn: mounts.saturn,
      mercury: mounts.mercury,
      moon: mounts.moon,
      sun: mounts.sun,
    },
    fingers,
    personality,
    health,
    career,
    relationships,
    spirituality,
    vedicInsights: {
      rulingPlanet: mounts.jupiter.planetaryRuler || 'Jupiter',
      element:
        mounts.sun.score > mounts.moon.score
          ? 'fire'
          : mounts.venus.score > mounts.mercury.score
          ? 'water'
          : 'air',
      dosha:
        mounts.moon.score > mounts.sun.score
          ? 'kapha'
          : mounts.sun.score > mounts.moon.score
          ? 'pitta'
          : 'vata',
      chakraAlignment: personality.overall.includes('Warm')
        ? 'Heart'
        : 'Third Eye',
      karmicLessons: karmicLessons.lessons,
    },
    recommendations: remedies,
    version: '2.1.0-toned2',
    modelUsed: 'Roboflow Palm Detection',
    processingTime: Date.now() - start,
  };
}

/* ====== Supporting functions used above (charkas/karmic/timeline/remedies/handshape) ====== */
function computeChakraProfile(
  mounts: Record<string, MountAnalysis>,
  life: LineAnalysis,
  head: LineAnalysis,
  heart: LineAnalysis,
) {
  const root = Math.round(life.score);
  const sacral = Math.round((mounts.venus.score + mounts.moon.score) / 2);
  const solar = Math.round(mounts.sun.score);
  const heartVal = Math.round(heart.score);
  const throat = Math.round(mounts.mercury.score);
  const thirdEye = Math.round(head.score);
  const crown = Math.round((mounts.jupiter.score + mounts.saturn.score) / 2);
  const weak = Object.entries({
    root,
    sacral,
    solar,
    heart: heartVal,
    throat,
    thirdEye,
    crown,
  })
    .filter(([k, v]) => v < 50)
    .map(([k]) => k);
  const summary =
    weak.length === 0
      ? 'All chakras show good balance.'
      : `Consider strengthening: ${weak.join(', ')}.`;
  return {
    root,
    sacral,
    solar,
    heart: heartVal,
    throat,
    thirdEye,
    crown,
    summary,
  };
}
function computeKarmicLessons(
  mounts: Record<string, MountAnalysis>,
  fate: LineAnalysis,
) {
  const lessons: string[] = [];
  if (mounts.saturn.score > 75)
    lessons.push('Themes of discipline and duty (Saturn).');
  if (fate.score < 50)
    lessons.push('Life direction may need deliberate focus.');
  if (mounts.moon.score > 70)
    lessons.push('Emotional lessons through relationships.');
  if (lessons.length === 0)
    lessons.push('Karmic trends are subtle; consistent action helps.');
  const pastLifeIndicators =
    mounts.saturn.score > 82 ? ['Past-life responsibility patterns'] : [];
  return { lessons, pastLifeIndicators };
}
function buildTimeline(
  life: LineAnalysis,
  fate: LineAnalysis,
  mounts: Record<string, MountAnalysis>,
  ageNow = 25,
) {
  const timeline: Record<string, string> = {};
  for (let i = 0; i < 20; i++) {
    const age = ageNow + i;
    const events: string[] = [];
    if (i === 2 && life.breaks > 0)
      events.push('Short reassessment period (health/career).');
    if (i === 4 && fate.forks > 0)
      events.push('New direction or study opportunity.');
    if (i === 7 && mounts.sun.score > 75)
      events.push('Career recognition likely.');
    if (i === 10 && mounts.moon.score > 70)
      events.push('Important relationship deepening.');
    if (i === 15 && life.score > 70)
      events.push('Long-term stability consolidates.');
    if (events.length === 0)
      events.push('Steady progress, no major disruptions indicated.');
    timeline[`age${age}`] = events.join(' ');
  }
  return timeline;
}
function suggestRemedies(
  mounts: Record<string, MountAnalysis>,
  life: LineAnalysis,
  heart: LineAnalysis,
  head: LineAnalysis,
) {
  const immediate: string[] = [],
    shortTerm: string[] = [],
    longTerm: string[] = [],
    spiritual: string[] = [];
  if (life.strength === 'weak') {
    immediate.push('Start daily 10-minute breathing practice');
    shortTerm.push('Consult a health professional or Ayurvedic advisor');
  }
  if (heart.strength === 'weak') {
    immediate.push('Practice short heart-breathing exercises');
    shortTerm.push('Start daily gratitude journaling for 21 days');
  }
  if (head.strength === 'weak')
    shortTerm.push('Do short focused concentration exercises');
  if (mounts.mercury.score < 50)
    shortTerm.push('Practice writing and short speaking exercises');
  if (mounts.jupiter.score < 55)
    longTerm.push('Seek mentorship and structured study programs');
  spiritual.push(
    randChoice([
      'Daily brief mantra or grounding practice (5–10 min)',
      'Short daily meditation (5–10 min)',
    ]),
  );
  return { immediate, shortTerm, longTerm, spiritual };
}
function classifyHandShape(box: ReturnType<typeof bbox>, fingers: any) {
  const aspect = box.width / box.height;
  const avgFingerRatio =
    (fingers.index.lengthRatio +
      fingers.middle.lengthRatio +
      fingers.ring.lengthRatio +
      fingers.pinky.lengthRatio) /
    4;
  const handType =
    avgFingerRatio > 1.05
      ? 'Water (long fingers, reflective & intuitive)'
      : avgFingerRatio < 0.95
      ? 'Fire/Earth (shorter fingers, practical & energetic)'
      : 'Air (balanced & communicative)';
  const shape = aspect > 1.05 ? 'Square' : 'Rectangular';
  return { shape, handType };
}
