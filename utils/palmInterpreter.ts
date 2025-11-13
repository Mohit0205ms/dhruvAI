/**
 * Advanced Palm Reading Interpreter based on Vedic Palmistry
 * This module provides comprehensive interpretations of palm lines, mounts, and features
 * according to traditional Vedic astrology and palmistry principles.
 *
 * Designed for scalability and service-oriented architecture.
 */

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

export interface LineAnalysis {
  strength: 'weak' | 'moderate' | 'strong';
  length: number;
  curvature: number;
  clarity: number;
  interpretation: string;
  vedicSignificance: string;
  score: number; // 0-100 scale
}

export interface MountAnalysis {
  development: 'underdeveloped' | 'balanced' | 'overdeveloped';
  influence: string;
  planetaryRuler: string;
  characteristics: string[];
  score: number;
}

export interface FingerAnalysis {
  length: number;
  flexibility: number;
  alignment: number;
  significance: string;
  score: number;
}

export interface HealthIndicators {
  overall: number;
  physical: string[];
  mental: string[];
  recommendations: string[];
}

export interface CareerInsights {
  suitableCareers: string[];
  strengths: string[];
  challenges: string[];
  planetaryInfluences: string;
}

export interface RelationshipInsights {
  compatibility: number;
  relationshipStyle: string;
  challenges: string[];
  recommendations: string[];
}

export interface SpiritualProfile {
  kundalini: number;
  chakraBalance: Record<string, number>;
  spiritualPath: string;
  practices: string[];
}

export interface PalmReadingResult {
  // Basic Information
  analysisId: string;
  timestamp: string;
  confidence: number;

  // Physical Characteristics
  handShape: string;
  handSize: string;
  skinTexture: string;

  // Major Lines
  lifeLine: LineAnalysis;
  heartLine: LineAnalysis;
  headLine: LineAnalysis;
  fateLine: {
    presence: boolean;
    analysis?: LineAnalysis;
  };
  marriageLine: {
    count: number;
    quality: string;
    interpretation: string;
  };
  sunLine: {
    presence: boolean;
    analysis?: LineAnalysis;
  };
  mercuryLine: {
    presence: boolean;
    analysis?: LineAnalysis;
  };

  // Mounts Analysis
  mounts: {
    venus: MountAnalysis;
    mars: MountAnalysis;
    jupiter: MountAnalysis;
    saturn: MountAnalysis;
    mercury: MountAnalysis;
    moon: MountAnalysis;
    sun: MountAnalysis;
  };

  // Finger Analysis
  fingers: {
    thumb: FingerAnalysis;
    index: FingerAnalysis;
    middle: FingerAnalysis;
    ring: FingerAnalysis;
    pinky: FingerAnalysis;
  };

  // Derived Insights
  personality: {
    overall: string;
    traits: string[];
    dominantGuna: 'sattva' | 'rajas' | 'tamas';
    strengths: string[];
    weaknesses: string[];
  };

  health: HealthIndicators;
  career: CareerInsights;
  relationships: RelationshipInsights;
  spirituality: SpiritualProfile;

  // Vedic Correlations
  vedicInsights: {
    rulingPlanet: string;
    element: 'fire' | 'earth' | 'air' | 'water';
    dosha: 'vata' | 'pitta' | 'kapha';
    chakraAlignment: string;
    karmicLessons: string[];
  };

  // Recommendations
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    spiritual: string[];
  };

  // Service Metadata
  version: string;
  modelUsed: string;
  processingTime: number;
}

/**
 * Calculates the Euclidean distance between two points
 */
function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Finds the bounding box of the palm from points
 */
function getPalmBounds(points: Point[]): { minX: number; maxX: number; minY: number; maxY: number } {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys)
  };
}

/**
 * Analyzes the life line based on Vedic principles
 */
function analyzeLifeLine(points: Point[], bounds: any): LineAnalysis {
  // Life line typically runs from between thumb and index finger down to wrist
  // In Vedic palmistry, a strong life line indicates vitality and longevity

  const palmHeight = bounds.maxY - bounds.minY;
  const palmWidth = bounds.maxX - bounds.minX;

  // Approximate life line length (this is a simplified analysis)
  const lifeLineLength = palmHeight * 0.7; // Estimated based on typical palm proportions
  const curvature = Math.random() * 0.5 + 0.5; // Simulated curvature analysis
  const clarity = Math.random() * 0.4 + 0.6; // Simulated clarity

  let strength: 'weak' | 'moderate' | 'strong' = 'moderate';
  let interpretation = '';
  let vedicSignificance = '';
  let score = 50;

  if (lifeLineLength > palmHeight * 0.8) {
    strength = 'strong';
    score = 85;
    interpretation = 'You possess excellent vitality and strong life force. According to Vedic principles, this indicates good health, longevity, and resilience.';
    vedicSignificance = 'Strong prana (life force) flow, indicating balanced doshas and good karmic health.';
  } else if (lifeLineLength > palmHeight * 0.6) {
    strength = 'moderate';
    score = 65;
    interpretation = 'Your life force is balanced. You have good health but should maintain wellness practices for optimal vitality.';
    vedicSignificance = 'Moderate prana flow, suggesting need for regular pranayama and Ayurvedic routines.';
  } else {
    strength = 'weak';
    score = 35;
    interpretation = 'Your life line suggests you need to focus on health and vitality. Consider Ayurvedic practices and lifestyle adjustments.';
    vedicSignificance = 'Weak prana flow, indicating need for detoxification and spiritual healing practices.';
  }

  return {
    strength,
    length: lifeLineLength,
    curvature,
    clarity,
    interpretation,
    vedicSignificance,
    score
  };
}

/**
 * Analyzes the heart line based on Vedic principles
 */
function analyzeHeartLine(points: Point[], bounds: any): LineAnalysis {
  const palmWidth = bounds.maxX - bounds.minX;
  const heartLineLength = palmWidth * 0.8;
  const curvature = Math.random() * 0.3 + 0.7;
  const clarity = Math.random() * 0.4 + 0.6;

  let strength: 'weak' | 'moderate' | 'strong' = 'moderate';
  let interpretation = '';
  let vedicSignificance = '';
  let score = 50;

  if (heartLineLength > palmWidth * 0.9) {
    strength = 'strong';
    score = 85;
    interpretation = 'You have a deep capacity for love and emotional connection. This indicates strong relationships and emotional intelligence.';
    vedicSignificance = 'Strong Anahata (heart) chakra activation, indicating balanced emotions and loving nature.';
  } else if (heartLineLength > palmWidth * 0.7) {
    strength = 'moderate';
    score = 65;
    interpretation = 'Your emotional nature is balanced. You form meaningful relationships and have good emotional awareness.';
    vedicSignificance = 'Moderate heart chakra development, suggesting need for emotional healing practices.';
  } else {
    strength = 'weak';
    score = 35;
    interpretation = 'You may experience emotional challenges. Focus on heart chakra practices and emotional healing.';
    vedicSignificance = 'Blocked heart chakra, indicating need for emotional healing and compassion practices.';
  }

  return {
    strength,
    length: heartLineLength,
    curvature,
    clarity,
    interpretation,
    vedicSignificance,
    score
  };
}

/**
 * Analyzes the head line based on Vedic principles
 */
function analyzeHeadLine(points: Point[], bounds: any): LineAnalysis {
  const palmWidth = bounds.maxX - bounds.minX;
  const headLineLength = palmWidth * 0.75;
  const curvature = Math.random() * 0.4 + 0.6;
  const clarity = Math.random() * 0.4 + 0.6;

  let strength: 'weak' | 'moderate' | 'strong' = 'moderate';
  let interpretation = '';
  let vedicSignificance = '';
  let score = 50;

  if (headLineLength > palmWidth * 0.85) {
    strength = 'strong';
    score = 85;
    interpretation = 'You possess excellent intellect and wisdom. This indicates strong mental capacity and learning ability.';
    vedicSignificance = 'Strong Ajna (third eye) chakra influence, indicating high intelligence and wisdom.';
  } else if (headLineLength > palmWidth * 0.65) {
    strength = 'moderate';
    score = 65;
    interpretation = 'Your mental faculties are well-balanced. You have good reasoning and analytical skills.';
    vedicSignificance = 'Balanced mental energy, suggesting good concentration and learning capacity.';
  } else {
    strength = 'weak';
    score = 35;
    interpretation = 'You may benefit from mental exercises and meditation to strengthen your intellectual capacity.';
    vedicSignificance = 'Weak mental energy, indicating need for meditation and mental discipline practices.';
  }

  return {
    strength,
    length: headLineLength,
    curvature,
    clarity,
    interpretation,
    vedicSignificance,
    score
  };
}

/**
 * Analyzes the fate line presence and strength
 */
function analyzeFateLine(points: Point[], bounds: any): { presence: boolean; analysis?: LineAnalysis } {
  const palmHeight = bounds.maxY - bounds.minY;
  const centerX = (bounds.minX + bounds.maxX) / 2;

  const verticalPoints = points.filter(p => Math.abs(p.x - centerX) < palmHeight * 0.1);
  const presence = verticalPoints.length > palmHeight * 0.3;

  if (presence) {
    const strength: 'weak' | 'moderate' | 'strong' = verticalPoints.length > palmHeight * 0.5 ? 'strong' : 'moderate';
    const score = strength === 'strong' ? 80 : 60;

    return {
      presence: true,
      analysis: {
        strength,
        length: verticalPoints.length,
        curvature: 0.8,
        clarity: 0.7,
        interpretation: strength === 'strong'
          ? 'Your fate line is prominent, indicating a clear life purpose and strong destiny. You are guided by dharma.'
          : 'Your fate line is present but moderate, suggesting a balanced approach to life\'s journey with some flexibility in destiny.',
        vedicSignificance: 'Strong karmic line indicating life purpose and dharma alignment.',
        score
      }
    };
  } else {
    return {
      presence: false
    };
  }
}

/**
 * Analyzes the mounts based on Vedic principles
 */
function analyzeMounts(points: Point[], bounds: any): PalmReadingResult['mounts'] {
  const palmHeight = bounds.maxY - bounds.minY;
  const palmWidth = bounds.maxX - bounds.minX;

  // Venus mount (base of thumb) - love, beauty, harmony
  const venus: MountAnalysis = {
    development: 'balanced',
    influence: 'Love, beauty, creativity, and sensual pleasure',
    planetaryRuler: 'Venus (Shukra)',
    characteristics: ['Artistic', 'Romantic', 'Harmonious', 'Creative'],
    score: 75
  };

  // Mars mounts - courage, energy
  const mars: MountAnalysis = {
    development: 'balanced',
    influence: 'Courage, energy, and protective instincts',
    planetaryRuler: 'Mars (Mangal)',
    characteristics: ['Courageous', 'Energetic', 'Protective', 'Determined'],
    score: 70
  };

  // Jupiter mount (under index finger) - wisdom, leadership
  const jupiter: MountAnalysis = {
    development: 'balanced',
    influence: 'Wisdom, leadership, and spiritual growth',
    planetaryRuler: 'Jupiter (Guru)',
    characteristics: ['Wise', 'Leadership', 'Spiritual', 'Optimistic'],
    score: 80
  };

  // Saturn mount (under middle finger) - discipline, spirituality
  const saturn: MountAnalysis = {
    development: 'balanced',
    influence: 'Discipline, introspection, and spiritual depth',
    planetaryRuler: 'Saturn (Shani)',
    characteristics: ['Disciplined', 'Introspective', 'Spiritual', 'Patient'],
    score: 75
  };

  // Mercury mount (under pinky) - communication, intellect
  const mercury: MountAnalysis = {
    development: 'balanced',
    influence: 'Communication, intellect, and business acumen',
    planetaryRuler: 'Mercury (Budha)',
    characteristics: ['Communicative', 'Intelligent', 'Business-minded', 'Adaptable'],
    score: 70
  };

  // Moon mount (outer palm) - intuition, emotions
  const moon: MountAnalysis = {
    development: 'balanced',
    influence: 'Intuition, emotions, and imagination',
    planetaryRuler: 'Moon (Chandra)',
    characteristics: ['Intuitive', 'Emotional', 'Imaginative', 'Nurturing'],
    score: 75
  };

  // Sun mount (under ring finger) - success, vitality
  const sun: MountAnalysis = {
    development: 'balanced',
    influence: 'Success, vitality, and self-expression',
    planetaryRuler: 'Sun (Surya)',
    characteristics: ['Successful', 'Vital', 'Creative', 'Confident'],
    score: 78
  };

  return { venus, mars, jupiter, saturn, mercury, moon, sun };
}

/**
 * Analyzes marriage lines based on Vedic principles
 */
function analyzeMarriageLine(points: Point[], bounds: any): { count: number; quality: string; interpretation: string } {
  // Marriage lines are typically found on the side of the palm near the Mercury mount
  const marriageLineCount = Math.floor(Math.random() * 3) + 1; // Simulated analysis
  const quality = marriageLineCount > 2 ? 'harmonious' : marriageLineCount > 1 ? 'balanced' : 'challenging';
  const interpretation = `You have ${marriageLineCount} marriage line(s), indicating ${quality} relationship patterns in your life.`;

  return { count: marriageLineCount, quality, interpretation };
}

/**
 * Analyzes sun line presence and strength
 */
function analyzeSunLine(points: Point[], bounds: any): { presence: boolean; analysis?: LineAnalysis } {
  // Sun line represents success and fame
  const presence = Math.random() > 0.5;

  if (presence) {
    return {
      presence: true,
      analysis: {
        strength: 'moderate',
        length: bounds.maxX - bounds.minX * 0.6,
        curvature: 0.7,
        clarity: 0.8,
        interpretation: 'Your sun line indicates potential for success and recognition in your chosen field.',
        vedicSignificance: 'Strong solar influence suggesting leadership and creative success.',
        score: 75
      }
    };
  }
  return { presence: false };
}

/**
 * Analyzes mercury line presence and strength
 */
function analyzeMercuryLine(points: Point[], bounds: any): { presence: boolean; analysis?: LineAnalysis } {
  // Mercury line represents communication and business
  const presence = Math.random() > 0.4;

  if (presence) {
    return {
      presence: true,
      analysis: {
        strength: 'moderate',
        length: bounds.maxY - bounds.minY * 0.5,
        curvature: 0.6,
        clarity: 0.7,
        interpretation: 'Your mercury line suggests strong communication skills and business acumen.',
        vedicSignificance: 'Balanced Mercury influence indicating good intellect and adaptability.',
        score: 70
      }
    };
  }
  return { presence: false };
}

/**
 * Analyzes finger characteristics
 */
function analyzeFingers(bounds: any): PalmReadingResult['fingers'] {
  const thumb: FingerAnalysis = {
    length: bounds.maxY - bounds.minY * 0.3,
    flexibility: 0.8,
    alignment: 0.9,
    significance: 'Strong thumb indicates willpower and determination.',
    score: 80
  };

  const index: FingerAnalysis = {
    length: bounds.maxY - bounds.minY * 0.35,
    flexibility: 0.7,
    alignment: 0.85,
    significance: 'Index finger represents leadership and ambition.',
    score: 75
  };

  const middle: FingerAnalysis = {
    length: bounds.maxY - bounds.minY * 0.4,
    flexibility: 0.75,
    alignment: 0.9,
    significance: 'Middle finger indicates responsibility and discipline.',
    score: 78
  };

  const ring: FingerAnalysis = {
    length: bounds.maxY - bounds.minY * 0.35,
    flexibility: 0.8,
    alignment: 0.85,
    significance: 'Ring finger represents creativity and relationships.',
    score: 76
  };

  const pinky: FingerAnalysis = {
    length: bounds.maxY - bounds.minY * 0.25,
    flexibility: 0.9,
    alignment: 0.8,
    significance: 'Pinky finger indicates communication and adaptability.',
    score: 72
  };

  return { thumb, index, middle, ring, pinky };
}

/**
 * Generates comprehensive health indicators
 */
function generateHealthIndicators(result: PalmReadingResult): HealthIndicators {
  const overall = (result.lifeLine.score + result.heartLine.score + result.headLine.score) / 3;

  const physical = [];
  const mental = [];
  const recommendations = [];

  if (result.lifeLine.strength === 'weak') {
    physical.push('Low energy levels', 'Susceptibility to illness');
    recommendations.push('Daily pranayama practice', 'Ayurvedic detoxification');
  } else {
    physical.push('Good vitality', 'Strong immune system');
  }

  if (result.heartLine.strength === 'weak') {
    mental.push('Emotional sensitivity', 'Relationship challenges');
    recommendations.push('Heart chakra meditation', 'Emotional healing practices');
  } else {
    mental.push('Emotional stability', 'Good relationship skills');
  }

  return { overall, physical, mental, recommendations };
}

/**
 * Generates career insights
 */
function generateCareerInsights(result: PalmReadingResult): CareerInsights {
  const suitableCareers = [];
  const strengths = [];
  const challenges = [];

  if (result.headLine.strength === 'strong') {
    suitableCareers.push('Research', 'Education', 'Consulting');
    strengths.push('Analytical thinking', 'Problem-solving');
  }

  if (result.mounts.mercury.score > 70) {
    suitableCareers.push('Business', 'Communication', 'Sales');
    strengths.push('Communication skills', 'Adaptability');
  }

  if (result.mounts.jupiter.score > 75) {
    suitableCareers.push('Leadership', 'Teaching', 'Counseling');
    strengths.push('Leadership', 'Wisdom');
  }

  if (result.fateLine.presence) {
    strengths.push('Clear life direction', 'Purpose-driven');
  } else {
    challenges.push('Career uncertainty', 'Need for self-direction');
  }

  return {
    suitableCareers,
    strengths,
    challenges,
    planetaryInfluences: 'Strong Jupiter and Mercury influences suggest success in communication and leadership roles.'
  };
}

/**
 * Generates relationship insights
 */
function generateRelationshipInsights(result: PalmReadingResult): RelationshipInsights {
  const compatibility = (result.heartLine.score + result.mounts.venus.score) / 2;
  const relationshipStyle = result.heartLine.strength === 'strong' ? 'nurturing' : 'independent';
  const challenges = result.heartLine.strength === 'weak' ? ['Emotional intimacy', 'Trust issues'] : [];
  const recommendations = result.heartLine.strength === 'weak'
    ? ['Open communication', 'Emotional vulnerability exercises']
    : ['Maintain healthy boundaries', 'Express appreciation'];

  return { compatibility, relationshipStyle, challenges, recommendations };
}

/**
 * Generates spiritual profile
 */
function generateSpiritualProfile(result: PalmReadingResult): SpiritualProfile {
  const kundalini = (result.mounts.jupiter.score + result.mounts.saturn.score) / 2;
  const chakraBalance = {
    root: result.lifeLine.score,
    sacral: result.mounts.venus.score,
    solar: result.mounts.sun.score,
    heart: result.heartLine.score,
    throat: result.mounts.mercury.score,
    thirdEye: result.headLine.score,
    crown: result.mounts.jupiter.score
  };

  const spiritualPath = result.fateLine.presence ? 'Karma Yoga' : 'Jnana Yoga';
  const practices = ['Daily meditation', 'Mantra recitation', 'Pranayama'];

  if (result.mounts.jupiter.score > 75) {
    practices.push('Scripture study', 'Teaching');
  }

  return { kundalini, chakraBalance, spiritualPath, practices };
}

/**
 * Generates Vedic correlations
 */
function generateVedicInsights(result: PalmReadingResult): PalmReadingResult['vedicInsights'] {
  const rulingPlanet = result.mounts.jupiter.score > result.mounts.saturn.score ? 'Jupiter' : 'Saturn';
  const element = result.lifeLine.strength === 'strong' ? 'fire' : result.heartLine.strength === 'strong' ? 'water' : 'air';
  const dosha = result.lifeLine.score > 70 ? 'kapha' : result.headLine.score > 70 ? 'vata' : 'pitta';
  const chakraAlignment = `Strong ${result.heartLine.strength === 'strong' ? 'heart' : result.headLine.strength === 'strong' ? 'third eye' : 'root'} chakra`;
  const karmicLessons = result.fateLine.presence
    ? ['Life purpose fulfillment', 'Dharma alignment']
    : ['Self-determination', 'Karma yoga practice'];

  return { rulingPlanet, element, dosha, chakraAlignment, karmicLessons };
}

/**
 * Generates comprehensive recommendations
 */
function generateRecommendations(result: PalmReadingResult): PalmReadingResult['recommendations'] {
  const immediate = [];
  const shortTerm = [];
  const longTerm = [];
  const spiritual = [];

  if (result.lifeLine.strength === 'weak') {
    immediate.push('Start daily pranayama practice');
    shortTerm.push('Consult Ayurvedic practitioner');
  }

  if (result.heartLine.strength === 'weak') {
    immediate.push('Practice heart chakra meditation');
    shortTerm.push('Journal emotional patterns');
  }

  if (result.headLine.strength === 'weak') {
    immediate.push('Begin meditation practice');
    shortTerm.push('Study Vedic philosophy');
  }

  longTerm.push('Deepen spiritual practice');
  longTerm.push('Align career with life purpose');

  spiritual.push('Daily mantra recitation');
  spiritual.push('Regular puja practice');
  spiritual.push('Study sacred texts');

  return { immediate, shortTerm, longTerm, spiritual };
}

/**
 * Main function to interpret palm reading from Roboflow prediction data
 */
export function interpretPalmReading(prediction: PalmPrediction): PalmReadingResult {
  const startTime = Date.now();
  const bounds = getPalmBounds(prediction.points);

  // Analyze all components
  const lifeLine = analyzeLifeLine(prediction.points, bounds);
  const heartLine = analyzeHeartLine(prediction.points, bounds);
  const headLine = analyzeHeadLine(prediction.points, bounds);
  const fateLine = analyzeFateLine(prediction.points, bounds);
  const marriageLine = analyzeMarriageLine(prediction.points, bounds);
  const sunLine = analyzeSunLine(prediction.points, bounds);
  const mercuryLine = analyzeMercuryLine(prediction.points, bounds);
  const mounts = analyzeMounts(prediction.points, bounds);
  const fingers = analyzeFingers(bounds);

  // Generate derived insights
  const result: PalmReadingResult = {
    // Basic Information
    analysisId: `palm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    confidence: prediction.confidence,

    // Physical Characteristics
    handShape: 'Rectangular', // Could be analyzed from points
    handSize: 'Medium',
    skinTexture: 'Smooth',

    // Major Lines
    lifeLine,
    heartLine,
    headLine,
    fateLine,
    marriageLine,
    sunLine,
    mercuryLine,

    // Mounts Analysis
    mounts,

    // Finger Analysis
    fingers,

    // Derived Insights
    personality: {
      overall: generateOverallPersonality(lifeLine, heartLine, headLine, fateLine),
      traits: ['Determined', 'Intuitive', 'Spiritual'],
      dominantGuna: 'sattva',
      strengths: ['Wisdom', 'Compassion', 'Resilience'],
      weaknesses: ['Perfectionism', 'Sensitivity']
    },

    health: {} as HealthIndicators,
    career: {} as CareerInsights,
    relationships: {} as RelationshipInsights,
    spirituality: {} as SpiritualProfile,

    // Vedic Correlations
    vedicInsights: {} as PalmReadingResult['vedicInsights'],

    // Recommendations
    recommendations: {} as PalmReadingResult['recommendations'],

    // Service Metadata
    version: '1.0.0',
    modelUsed: 'Roboflow Palm Detection',
    processingTime: 0
  };

  // Generate comprehensive insights
  result.health = generateHealthIndicators(result);
  result.career = generateCareerInsights(result);
  result.relationships = generateRelationshipInsights(result);
  result.spirituality = generateSpiritualProfile(result);
  result.vedicInsights = generateVedicInsights(result);
  result.recommendations = generateRecommendations(result);
  result.processingTime = Date.now() - startTime;

  return result;
}

/**
 * Generates overall personality description
 */
function generateOverallPersonality(
  lifeLine: LineAnalysis,
  heartLine: LineAnalysis,
  headLine: LineAnalysis,
  fateLine: { presence: boolean; analysis?: LineAnalysis }
): string {
  const strengths = [];
  const areas = [];

  if (lifeLine.strength === 'strong') strengths.push('vitality');
  else areas.push('physical health');

  if (heartLine.strength === 'strong') strengths.push('emotional depth');
  else areas.push('emotional balance');

  if (headLine.strength === 'strong') strengths.push('intellectual capacity');
  else areas.push('mental clarity');

  if (fateLine.presence) strengths.push('life purpose');
  else areas.push('direction');

  let personality = 'You are a ';
  if (strengths.length > 0) {
    personality += strengths.join(', ') + ' focused individual';
  }
  if (areas.length > 0) {
    personality += '. Areas for growth include ' + areas.join(', ') + '.';
  }

  return personality + ' According to Vedic palmistry, your unique combination of lines indicates a journey of self-discovery and spiritual evolution.';
}
