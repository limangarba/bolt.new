const pad = (n: number) => String(n).padStart(2, '0');

/** Clé de jour locale au format YYYY-MM-DD. */
export const toKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const daysBetween = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);

/** Jours de la semaine, du lundi au dimanche (day = Date.getDay()). */
export const WEEK_DAYS = [
  { day: 1, short: 'L', long: 'Lundi' },
  { day: 2, short: 'M', long: 'Mardi' },
  { day: 3, short: 'M', long: 'Mercredi' },
  { day: 4, short: 'J', long: 'Jeudi' },
  { day: 5, short: 'V', long: 'Vendredi' },
  { day: 6, short: 'S', long: 'Samedi' },
  { day: 0, short: 'D', long: 'Dimanche' },
] as const;

export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export const formatLongDate = (d: Date) => {
  const s = d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
};
