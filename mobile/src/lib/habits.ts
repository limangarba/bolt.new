import { addDays, daysBetween, fromKey, startOfDay, toKey } from './dates';

export type Habit = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  /** Jours planifiés (0 = dimanche … 6 = samedi). */
  days: number[];
  /** Jour de création (YYYY-MM-DD). */
  createdAt: string;
  /** Jours accomplis (YYYY-MM-DD). */
  completions: string[];
};

export const isScheduled = (h: Habit, d: Date) => h.days.includes(d.getDay());

export const isDone = (h: Habit, d: Date) => h.completions.includes(toKey(d));

/** Série en cours : jours planifiés consécutifs accomplis. Aujourd'hui non fait ne casse pas la série. */
export function currentStreak(h: Habit, today = new Date()): number {
  const done = new Set(h.completions);
  let streak = 0;
  for (let i = 0; i < 1000; i++) {
    const d = addDays(today, -i);
    if (!isScheduled(h, d)) continue;
    if (done.has(toKey(d))) streak++;
    else if (i === 0) continue;
    else break;
  }
  return streak;
}

/** Meilleure série historique. */
export function bestStreak(h: Habit, today = new Date()): number {
  if (h.completions.length === 0) return 0;
  const done = new Set(h.completions);
  const first = [h.createdAt, ...h.completions].sort()[0];
  const span = daysBetween(fromKey(first), today);
  let best = 0;
  let run = 0;
  for (let i = 0; i <= span; i++) {
    const d = addDays(fromKey(first), i);
    if (!isScheduled(h, d)) continue;
    if (done.has(toKey(d))) {
      run++;
      best = Math.max(best, run);
    } else if (toKey(d) !== toKey(today)) {
      run = 0;
    }
  }
  return best;
}

/** Taux de réussite (0–1) sur les `window` derniers jours, depuis la création. */
export function completionRate(h: Habit, window = 30, today = new Date()): number {
  const done = new Set(h.completions);
  const start = startOfDay(addDays(today, -(window - 1)));
  const created = fromKey(h.createdAt);
  let scheduled = 0;
  let hit = 0;
  for (let i = 0; i < window; i++) {
    const d = addDays(start, i);
    if (d < created || !isScheduled(h, d)) continue;
    scheduled++;
    if (done.has(toKey(d))) hit++;
  }
  return scheduled === 0 ? 0 : hit / scheduled;
}

export const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const HABIT_COLORS = [
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#EF4444',
  '#14B8A6',
  '#64748B',
];

export const HABIT_EMOJIS = [
  '💧', '🏃', '📚', '🧘', '🥗', '😴', '✍️', '🎯',
  '💪', '🚶', '🎸', '🧹', '💊', '🙏', '🌱', '💻',
];
