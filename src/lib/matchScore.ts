import { Product, UserProfile } from '../types';

/**
 * Transparent product-to-user match scoring.
 *
 * This is a deliberately simple, explainable rules engine — not a black-box
 * "AI score". Every point comes from one of the reasons listed below, and the
 * reasons can be shown to the user ("Why 96%?"). No fabricated precision: the
 * same input always produces the same score.
 */

export type MatchResult = {
  score: number;
  reasons: string[];
};

const GOAL_CATEGORY_MAP: Record<string, string[]> = {
  'Joint & Tendon Recovery': ['Recovery'],
  'Muscle Growth & Strength': ['Nutrition'],
  'Fat Loss & Body Composition': ['Nutrition', 'Hydration'],
  'Sleep Optimization': ['Recovery'],
  'Cognitive Enhancement': ['Nootropic', 'Executive Stack'],
  'Longevity & Biomarker Optimization': ['Diagnostics', 'Longevity Core'],
  'Energy & Mitochondria': ['Nutrition', 'Executive Stack'],
};

const PERSONA_CATEGORY_AFFINITY: Record<UserProfile['lifestylePersona'], string[]> = {
  'High-Stress Executive / Zero-Time': ['Executive Stack', 'Nootropic', 'Recovery'],
  'Peak Endurance Athlete': ['Nutrition', 'Hydration', 'Recovery'],
  'Biohacking Enthusiast': ['Peptide', 'Diagnostics', 'Nootropic'],
  'Recreational Maintenance': ['Nutrition', 'Recovery'],
};

export function computeMatch(product: Product, user: UserProfile): MatchResult {
  const reasons: string[] = [];
  let score = 50;

  // 1) Persona affinity
  const personaCategories = PERSONA_CATEGORY_AFFINITY[user.lifestylePersona] ?? [];
  if (personaCategories.includes(product.category)) {
    score += 18;
    reasons.push(`Fits your ${user.lifestylePersona.split(' / ')[0].toLowerCase()} profile`);
  }

  // 2) Stated goals
  const goals = Array.isArray(user.goals) ? user.goals : [];
  for (const goal of goals) {
    const mapped = GOAL_CATEGORY_MAP[goal] ?? [];
    if (mapped.includes(product.category)) {
      score += 12;
      reasons.push(`Matches your goal: ${goal.toLowerCase()}`);
      break;
    }
  }

  // 3) Clinical recommendations attached to the product by the intake rules
  if (product.tailoredReason) {
    score += 10;
    reasons.push(product.tailoredReason.length > 90 ? 'Clinically recommended for your baseline data' : product.tailoredReason);
  }

  // 4) Evidence quality
  if (product.evidenceData?.grade === 'A') {
    score += 6;
    reasons.push('Grade-A human-trial evidence');
  }

  // 5) Data completeness: users with lab data get more from diagnostics
  if (product.category === 'Diagnostics' && user.baselineDiagnostics) {
    score += 6;
    reasons.push('You have baseline data worth comparing against');
  }

  // 6) Existing regimen overlap
  if (user.inventory.some((item) => item.id === product.id)) {
    score += 8;
    reasons.push('Complements what you already take');
  }

  // 7) Risk dampening for cautious profiles
  if (product.riskLevel === 'high' && user.lifestylePersona === 'Recreational Maintenance') {
    score -= 12;
    reasons.push('Higher-risk compound — flagged for your maintenance profile');
  }

  const clamped = Math.max(42, Math.min(97, Math.round(score)));
  return { score: clamped, reasons: reasons.slice(0, 3) };
}

export const GOAL_OPTIONS = Object.keys(GOAL_CATEGORY_MAP);
