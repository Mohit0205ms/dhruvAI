import { LineAnalysis, MountAnalysis } from './types';
import { randChoice, clamp } from './utils';
import { Guna } from './types';

/**
 * Fully dynamic text generator.
 * Each "deep" builder returns a long paragraph (10-14 sentences) composed from templates and conditional clauses.
 * Tone: 2 (Confident, Direct, Clear) + Depth C (premium).
 */

/* --- Helper smaller templates --- */
function sentenceArrayToParagraph(sentences: string[]) {
  // ensure 10-14 sentences — if fewer, pad with sensible closing sentences.
  while (sentences.length < 10) {
    sentences.push('Overall, these patterns suggest steady growth when you follow consistent habits.');
  }
  // trim if more than 14
  if (sentences.length > 14) sentences = sentences.slice(0, 14);
  return sentences.join(' ');
}

function scoreLabel(score: number) {
  if (score >= 75) return 'strong';
  if (score >= 55) return 'moderate';
  return 'weak';
}

/* Fate Line message (Tone B professional) */
export function buildFateLineMessage(analysis: LineAnalysis) {
  const parts: string[] = [];
  parts.push(analysis.strength === 'strong'
    ? 'The Fate Line is strong and continuous, indicating a clear and sustained sense of direction in your public life and responsibilities.'
    : analysis.strength === 'moderate'
      ? 'The Fate Line is present but not dominant; it suggests a life path that is influenced both by your choices and external circumstances.'
      : 'The Fate Line is faint or interrupted, which commonly reflects changes in career, relocations, or shifts in priorities rather than an absence of purpose.'
  );
  parts.push('In palm tradition this line maps to career paths, public roles, and how external events shape your journey; it offers a practical map rather than fixed destiny.');
  if (analysis.breaks > 0) {
    parts.push(`We detected ${analysis.breaks} break(s) which typically mark transition periods — job switches, new responsibilities, or personal reinvention phases.`);
  } else {
    parts.push('A continuous line suggests longer periods of stability in vocation or life calling.');
  }
  parts.push('Forks or splits suggest that at some key moments you had several viable directions; these are opportunities rather than failures.');
  parts.push('Takeaway: treat this line as a guide for timing and pivoting — deliberate choices and preparation influence outcomes strongly.');
  return parts.join(' ');
}

/* Generic line message for Life/Head/Heart */
export function buildLineMessage(lineName: string, analysis: LineAnalysis) {
  const parts: string[] = [];
  parts.push(analysis.strength === 'strong' ? `${lineName} is strong and well-defined.` : analysis.strength === 'moderate' ? `${lineName} is present with normal variation.` : `${lineName} is faint or fragmented in parts.`);
  parts.push(analysis.strength === 'strong' ? 'This represents a reliable and stable quality in that area.' : analysis.strength === 'moderate' ? 'This indicates capability, with periodic variability.' : 'This points to an area that benefits from intentional care and routine.');
  if (analysis.breaks > 0) parts.push(`Detected ${analysis.breaks} small break(s) — often temporary stress points or transitions rather than permanent problems.`);
  else parts.push('No notable breaks were detected, suggesting steady development.');
  parts.push(analysis.score >= 70 ? 'Overall: a strong and consistent sign.' : analysis.score >= 50 ? 'Overall: functional with clear opportunities for growth.' : 'Overall: focus on building steady habits in this area.');
  return parts.join(' ');
}

/* ---------- DEEP builders (dynamic) ---------- */

export function buildPersonalityDeep(life: LineAnalysis, heart: LineAnalysis, head: LineAnalysis, mounts: Record<string, MountAnalysis>, dominantGuna: Guna) {
  const s: string[] = [];

  // Opening
  s.push('Your personality profile shows a steady core with layered tendencies that shape how you act, think, and relate.');

  // Energy & endurance
  if (life.strength === 'strong') s.push('You demonstrate reliable energy and resilience; when you commit to a path you follow through consistently.');
  else s.push('Energy fluctuates across your days; you perform best when you follow a structured routine that conserves and renews energy.');

  // Cognition & decision style
  if (head.strength === 'strong') s.push('Your thinking is clear and decisive; you can analyze details and make timely decisions.');
  else s.push('You are practical and grounded in thought; focusing on small steps helps you avoid overload and improves decision making.');

  // Emotions & relationships
  if (heart.strength === 'strong') s.push('Emotionally, you are engaged and warm; you connect deeply with people and sustain long-term bonds.');
  else s.push('You tend to be cautious with emotional expression and often choose stability and loyalty over immediate openness.');

  // Mount-based nuance
  const prominentMount = Object.entries(mounts).sort((a, b) => b[1].score - a[1].score)[0];
  if (prominentMount) s.push(`A prominent influence from ${prominentMount[0]} (score ${prominentMount[1].score}) colors your temperament — it gives you specific strengths such as ${prominentMount[1].characteristics.slice(0,2).join(' and ')}.`);

  // Guna influence
  s.push(dominantGuna === 'sattva' ? 'Sattva-dominant features show a tendency toward clarity, learning, and a balanced outlook.' : dominantGuna === 'rajas' ? 'Rajas-dominant features show activity, ambition and a drive for visible results.' : 'Tamas-dominant features show a patient, practical, and sometimes inward nature emphasizing stability.');

  // Stress response
  if (life.breaks > 0 || head.breaks > 0) s.push('Under stress you may withdraw into routines; intentional short resets (breathing, short walks) are highly effective.');
  else s.push('You recover well from pressure and generally restore balance swiftly with simple routines.');

  // Growth advice
  s.push('A practical practice that helps you: weekly review + a small creativity or learning goal each month to keep momentum and prevent stagnation.');

  // Social style
  s.push('In groups you are seen as dependable and pragmatic; people look to you for steady counsel and realistic planning.');

  // Closing
  s.push('Overall: steady, capable, and growth-oriented — use small consistent practices to amplify your natural strengths.');

  return sentenceArrayToParagraph(s);
}

export function buildHealthDeep(life: LineAnalysis, mounts: Record<string, MountAnalysis>) {
  const s: string[] = [];
  s.push('Your health profile indicates baseline resilience with specific areas that respond strongly to routine.');
  if (life.strength === 'strong') s.push('Physically you have good stamina and bounce back from short-term fatigue.');
  else s.push('Energy management is critical for you; consistent sleep and nutrition make disproportionate improvements.');

  s.push('Digestive, sleep, and immune markers are sensitive to stress in your profile — when pressure rises, these systems may show first signs of imbalance.');
  if (mounts.saturn.score > 70) s.push('Saturn influence hints at the need for regular rest and slow, steady recovery rather than high-pressure sprints.');
  if (mounts.mercury.score < 50) s.push('Lower Mercury suggests practicing brief mental breaks and communication around stress rather than internalizing it.');

  s.push('Mental clarity maps with head-line strength; short concentration practices (10-15 minutes) raise daily performance significantly.');
  s.push('Simple daily habits — morning hydration, short walks, and a 5-10 minute breathing routine — create large compound benefits for you.');

  s.push('If you have chronic concerns, combine palm insights with medical testing; the palm helps prioritize what to monitor rather than replace diagnostics.');
  s.push('Prevention is your most powerful tool: consistent small actions beat intermittent large fixes.');

  s.push('Long-term plan: pick one small health habit for 30 days, then add the next; this builds sustainable resilience and fits your personality.');
  s.push('Overall: your body responds well to regularity and small daily investments — invest in routines and you will see steady improvements.');

  return sentenceArrayToParagraph(s);
}

export function buildCareerDeep(mounts: Record<string, MountAnalysis>, fate: LineAnalysis) {
  const s: string[] = [];
  s.push('Your career profile blends steady reliability with moments where deliberate pivoting produces the largest gains.');

  // strengths by mount
  if (mounts.sun.score > 70) s.push('A strong Sun mount indicates a talent for visibility, leadership, or creative roles that show your work to others.');
  if (mounts.mercury.score > 70) s.push('A strong Mercury suggests abilities in communication, business, writing, or trades that require adaptability and quick learning.');
  if (mounts.jupiter.score > 70) s.push('Jupiter prominence suits teaching, mentorship, or roles where long-term planning and guidance are valued.');

  s.push('The Fate Line gives context: a continuous fate line supports steady promotion, while breaks suggest intentional re-skilling or role changes at key ages.');
  if (fate.breaks > 0) s.push(`Detected ${fate.breaks} break(s) in the Fate line — plan transitions with a 3-6 month buffer and treat them as intentional pivots rather than crises.`);

  s.push('Your best fit: roles combining structure and creative problem solving — project leadership in technical or strategic areas fits particularly well.');
  s.push('For immediate action: identify one high-impact skill you can learn in 3 months and one mentor-type person to provide feedback.');

  s.push('For salary and recognition: measure quarterly wins and build a short portfolio of concrete outcomes; this turns consistent delivery into visible career currency.');
  s.push('Avoid quick changes without skill alignment — your profile favors staged growth and evidence-based pivots.');

  s.push('Overall: steady growth with strategic, planned transitions will maximize both satisfaction and recognition over time.');

  return sentenceArrayToParagraph(s);
}

export function buildRelationshipsDeep(heart: LineAnalysis, mounts: Record<string, MountAnalysis>) {
  const s: string[] = [];
  s.push('Your relational profile values trust, reliability, and clarity of expectations.');

  if (heart.strength === 'strong') s.push('You experience depth in relationships and invest in long-term bonds; you show care through actions and consistency.');
  else s.push('You may appear reserved initially and prefer to show commitment through steady presence rather than immediate emotional displays.');

  s.push('Conflict style: you tend to manage problems practically; when under stress, you may prioritize solutions over emotional expression — this helps with logistics but sometimes leaves emotional needs unspoken.');
  s.push('Small daily practices (naming one feeling, expressing one appreciation each day) significantly increase intimacy and reduce misunderstandings.');

  if (mounts.venus.score > 70) s.push('A strong Venus mount enhances warmth, attraction, and creative expression in partnerships.');
  if (mounts.moon.score > 70) s.push('A strong Moon heightens sensitivity and emotional responsiveness; prioritize clear communication to prevent overwhelm.');

  s.push('If relationship challenges appear, targeted work on communication patterns yields the fastest improvements: structured check-ins, active listening, and small shared rituals.');
  s.push('For long-term partnership: clarity in roles, shared routines, and honesty about expectations create durable bonds for you.');

  s.push('Overall: you are dependable and committed — practicing small vulnerability steps deepens intimacy without destabilizing your natural steadiness.');

  return sentenceArrayToParagraph(s);
}

export function buildSpiritualityDeep(chakras: any, mounts: Record<string, MountAnalysis>) {
  const s: string[] = [];
  s.push('Your spiritual profile is pragmatic and inward-facing: you prefer practices that produce practical inner change rather than symbolic rituals.');

  if (mounts.jupiter.score > mounts.saturn.score) s.push('A Jupiter tilt points to an intellectual curiosity — study, reflection, and philosophical reading deepen your sense of meaning.');
  if (mounts.moon.score > mounts.mercury.score) s.push('A Moon tilt suggests a path that is felt more than analyzed — journaling, reflective retreats, and devotional practices resonate.');

  s.push('Chakra map reveals where energy is steady and where focused practice yields results; low-scoring areas are practical places to start targeted exercises.');
  s.push('Short daily practices (5-10 minutes) are far more effective for you than sporadic long sessions; this supports integration into busy life.');

  s.push('When you face doubts, treat them as information rather than failure: experiment with small practices for a month and observe changes.');
  s.push('Combine study with service: learning plus real-world application anchors spiritual insights into daily life.');

  s.push('Over time, these small daily actions accumulate into deeper inner stability and clearer values; the palm suggests sustainable, long-term growth rather than sudden awakenings.');
  s.push('Overall: a practical, evidence-based spiritual approach fits you best — consistent practice, inquiry, and service will yield steady inner progress.');

  return sentenceArrayToParagraph(s);
}

export function buildGuidanceDeep(remedies: { immediate: string[]; shortTerm: string[]; longTerm: string[]; spiritual: string[]; }) {
  const s: string[] = [];
  s.push('Guidance is tactical and time-based: immediate steps should be short, measurable, and easy to repeat daily.');
  s.push(`Immediate: ${remedies.immediate.slice(0,3).join('; ')}.`);
  s.push(`Short-term: ${remedies.shortTerm.slice(0,3).join('; ')}.`);
  s.push(`Long-term: ${remedies.longTerm.slice(0,3).join('; ')}.`);
  s.push('Spiritual practices: keep them short and practical — brief daily reflection and occasional deeper sessions work best.');
  s.push('When planning change, prefer staged experiments (3 months) and measure outcomes; small wins compound into major life shifts.');
  s.push('Avoid dramatic overhauls unless you have clear support systems; incremental change is far more sustainable for lasting growth.');
  s.push('For accountability, use weekly reviews, a mentor, or a peer group to course-correct quickly.');
  s.push('Overall: choose small consistent actions, measure results, and treat change as a sequence of intentional pivots rather than a single event.');

  return sentenceArrayToParagraph(s);
}
