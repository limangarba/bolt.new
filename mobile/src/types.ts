export type Habit = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
  /** Jours réalisés, au format local AAAA-MM-JJ. */
  completions: string[];
};

export type NewHabit = Pick<Habit, 'name' | 'emoji' | 'color'>;
