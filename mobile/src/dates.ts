/** Clé de jour en heure locale (AAAA-MM-JJ), indépendante du fuseau UTC. */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Les `count` derniers jours, du plus ancien à aujourd'hui. */
export function lastDays(count: number, today: Date = new Date()): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(today, i - (count - 1)));
}

/**
 * Série en cours : jours consécutifs réalisés jusqu'à aujourd'hui.
 * Si aujourd'hui n'est pas encore coché, la série d'hier reste valable.
 */
export function currentStreak(completions: string[], today: Date = new Date()): number {
  const done = new Set(completions);
  let cursor = done.has(dayKey(today)) ? today : addDays(today, -1);
  let streak = 0;
  while (done.has(dayKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Meilleure série historique. */
export function bestStreak(completions: string[]): number {
  const days = [...new Set(completions)].sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const key of days) {
    const expected = previous ? dayKey(addDays(parseKey(previous), 1)) : null;
    run = expected === key ? run + 1 : 1;
    best = Math.max(best, run);
    previous = key;
  }
  return best;
}

function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const WEEKDAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
export function weekdayLetter(date: Date): string {
  return WEEKDAYS[date.getDay()];
}

export function formatToday(date: Date = new Date()): string {
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août',
    'septembre', 'octobre', 'novembre', 'décembre'];
  const label = `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}
