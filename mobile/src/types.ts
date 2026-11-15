export type Habit = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
  /** Jours réalisés, au format local AAAA-MM-JJ. */
  completions: string[];
  /** Rappel quotidien à heure fixe (heure locale), ou null si désactivé. */
  reminder?: Reminder | null;
};

export type Reminder = { hour: number; minute: number };

export type NewHabit = Pick<Habit, 'name' | 'emoji' | 'color' | 'reminder'>;
