import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { toKey } from './dates';
import { Habit, newId } from './habits';

const STORAGE_KEY = 'habits.v1';

type HabitInput = Pick<Habit, 'name' | 'emoji' | 'color' | 'days'>;

type Store = {
  habits: Habit[];
  loaded: boolean;
  addHabit: (input: HabitInput) => void;
  updateHabit: (id: string, input: HabitInput) => void;
  deleteHabit: (id: string) => void;
  toggle: (id: string, date: Date) => void;
};

const Ctx = createContext<Store | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setHabits(JSON.parse(raw) as Habit[]);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits)).catch(() => {});
  }, [habits, loaded]);

  const addHabit = useCallback((input: HabitInput) => {
    setHabits((hs) => [
      ...hs,
      { ...input, id: newId(), createdAt: toKey(new Date()), completions: [] },
    ]);
  }, []);

  const updateHabit = useCallback((id: string, input: HabitInput) => {
    setHabits((hs) => hs.map((h) => (h.id === id ? { ...h, ...input } : h)));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((hs) => hs.filter((h) => h.id !== id));
  }, []);

  const toggle = useCallback((id: string, date: Date) => {
    const key = toKey(date);
    setHabits((hs) =>
      hs.map((h) =>
        h.id !== id
          ? h
          : {
              ...h,
              completions: h.completions.includes(key)
                ? h.completions.filter((c) => c !== key)
                : [...h.completions, key],
            },
      ),
    );
  }, []);

  const value = useMemo(
    () => ({ habits, loaded, addHabit, updateHabit, deleteHabit, toggle }),
    [habits, loaded, addHabit, updateHabit, deleteHabit, toggle],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHabits() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useHabits doit être utilisé dans HabitsProvider');
  return v;
}
