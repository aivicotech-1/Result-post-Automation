import { DEFAULT_STAR_RULES } from '../config/defaults.js';

export function getStars(marks, total, rules = DEFAULT_STAR_RULES) {
  if (!Number.isFinite(Number(marks)) || !Number.isFinite(Number(total)) || Number(total) <= 0) {
    return 1;
  }

  const pct = (Number(marks) / Number(total)) * 100;

  for (const rule of rules) {
    if (pct <= rule.maxPct) {
      return rule.stars;
    }
  }

  return 5;
}

export function getTier(pct) {
  if (pct >= 85) return 'excellent';
  if (pct >= 60) return 'good';
  return 'practice';
}

export function formatScore(marks, total) {
  const normalizedMarks = Number(marks);
  const value = Number.isInteger(normalizedMarks) ? normalizedMarks : Number(normalizedMarks.toFixed(2));
  return `${value}/${total}`;
}

export function calculatePct(marks, total) {
  if (!Number.isFinite(Number(marks)) || !Number.isFinite(Number(total)) || Number(total) <= 0) {
    return 0;
  }
  return (Number(marks) / Number(total)) * 100;
}
