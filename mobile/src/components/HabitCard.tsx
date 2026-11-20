import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WEEK_DAYS, addDays, toKey } from '@/lib/dates';
import { Habit, currentStreak, isDone, isScheduled } from '@/lib/habits';
import { useTheme } from '@/lib/theme';

type Props = {
  habit: Habit;
  today: Date;
  onToggle: (date: Date) => void;
  onEdit: () => void;
};

export function HabitCard({ habit, today, onToggle, onEdit }: Props) {
  const t = useTheme();
  const done = isDone(habit, today);
  const streak = currentStreak(habit, today);
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  const press = (d: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onToggle(d);
  };

  return (
    <Pressable
      onPress={onEdit}
      style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}
      accessibilityLabel={`Modifier ${habit.name}`}
    >
      <View style={styles.row}>
        <View style={[styles.emojiBox, { backgroundColor: habit.color + '26' }]}>
          <Text style={styles.emoji}>{habit.emoji}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: t.text }]} numberOfLines={1}>
            {habit.name}
          </Text>
          <Text style={{ color: t.muted, fontSize: 13 }}>
            🔥 {streak} {streak > 1 ? 'jours' : 'jour'} de suite
          </Text>
        </View>
        <Pressable
          onPress={() => press(today)}
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
          accessibilityLabel={`Marquer ${habit.name} comme fait aujourd'hui`}
          style={[
            styles.check,
            done
              ? { backgroundColor: habit.color, borderColor: habit.color }
              : { borderColor: t.track },
          ]}
        >
          {done && <Ionicons name="checkmark" size={22} color="#fff" />}
        </Pressable>
      </View>

      <View style={styles.week}>
        {last7.map((d) => {
          const on = isDone(habit, d);
          const planned = isScheduled(habit, d);
          const label = WEEK_DAYS.find((w) => w.day === d.getDay())!.short;
          return (
            <Pressable
              key={toKey(d)}
              onPress={() => press(d)}
              style={styles.dayCol}
              accessibilityLabel={`${d.toLocaleDateString('fr-FR')} ${on ? 'fait' : 'non fait'}`}
            >
              <Text style={{ color: t.muted, fontSize: 11 }}>{label}</Text>
              <View
                style={[
                  styles.dot,
                  on
                    ? { backgroundColor: habit.color }
                    : { backgroundColor: t.track, opacity: planned ? 1 : 0.35 },
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
  card: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emojiBox: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 24 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 17, fontWeight: '600' },
  check: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingHorizontal: 4 },
  dayCol: { alignItems: 'center', gap: 4, minWidth: 32 },
  dot: { width: 20, height: 20, borderRadius: 10 },
});
