import { Pressable, StyleSheet, Text, View } from 'react-native';
import { currentStreak, dayKey, lastDays, weekdayLetter } from '../dates';
import { colors } from '../theme';
import type { Habit } from '../types';

type Props = {
  habit: Habit;
  onToggle: (habitId: string, day: string) => void;
  onLongPress: (habit: Habit) => void;
};

export function HabitCard({ habit, onToggle, onLongPress }: Props) {
  const today = dayKey();
  const done = new Set(habit.completions);
  const doneToday = done.has(today);
  const streak = currentStreak(habit.completions);

  return (
    <Pressable
      onLongPress={() => onLongPress(habit)}
      delayLongPress={350}
      style={styles.card}
      accessibilityHint="Appui long pour supprimer"
    >
      <View style={styles.row}>
        <View style={[styles.emojiBox, { backgroundColor: habit.color + '1A' }]}>
          <Text style={styles.emoji}>{habit.emoji}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
          <Text style={styles.streak}>
            {streak > 0 ? `🔥 ${streak} jour${streak > 1 ? 's' : ''} d'affilée` : 'Pas encore de série'}
          </Text>
        </View>
        <Pressable
          onPress={() => onToggle(habit.id, today)}
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: doneToday }}
          accessibilityLabel={`${habit.name} aujourd'hui`}
          style={[
            styles.check,
            doneToday
              ? { backgroundColor: habit.color, borderColor: habit.color }
              : { borderColor: colors.border },
          ]}
        >
          {doneToday && <Text style={styles.checkMark}>✓</Text>}
        </Pressable>
      </View>

      <View style={styles.week}>
        {lastDays(7).map((date) => {
          const key = dayKey(date);
          const isDone = done.has(key);
          const isToday = key === today;
          return (
            <Pressable
              key={key}
              onPress={() => onToggle(habit.id, key)}
              hitSlop={4}
              style={styles.day}
              accessibilityLabel={`${habit.name}, ${key}`}
              accessibilityState={{ checked: isDone }}
            >
              <Text style={[styles.dayLetter, isToday && styles.dayLetterToday]}>
                {weekdayLetter(date)}
              </Text>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isDone ? habit.color : colors.empty },
                  isToday && !isDone && { borderWidth: 1.5, borderColor: habit.color },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emojiBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 17, fontWeight: '600', color: colors.text },
  streak: { fontSize: 13, color: colors.muted },
  check: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 18, fontWeight: '700' },
  week: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  day: { alignItems: 'center', gap: 6, minWidth: 28 },
  dayLetter: { fontSize: 12, color: colors.muted },
  dayLetterToday: { color: colors.text, fontWeight: '700' },
  dot: { width: 22, height: 22, borderRadius: 11 },
});
