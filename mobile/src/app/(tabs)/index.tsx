import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HabitCard } from '@/components/HabitCard';
import { formatLongDate } from '@/lib/dates';
import { isDone, isScheduled } from '@/lib/habits';
import { useHabits } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function TodayScreen() {
  const t = useTheme();
  const { habits, loaded, toggle } = useHabits();
  const today = useMemo(() => new Date(), []);

  const planned = habits.filter((h) => isScheduled(h, today));
  const doneCount = planned.filter((h) => isDone(h, today)).length;
  const ratio = planned.length ? doneCount / planned.length : 0;
  // Habitudes non planifiées aujourd'hui, affichées en bas.
  const others = habits.filter((h) => !isScheduled(h, today));
  const list = [...planned, ...others];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['top']}>
      <FlatList
        data={loaded ? list : []}
        keyExtractor={(h) => h.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.date, { color: t.muted }]}>{formatLongDate(today)}</Text>
            <Text style={[styles.title, { color: t.text }]}>Mes habitudes</Text>
            {planned.length > 0 && (
              <View style={styles.progressWrap}>
                <View style={[styles.track, { backgroundColor: t.track }]}>
                  <View
                    style={[styles.fill, { backgroundColor: t.primary, width: `${ratio * 100}%` }]}
                  />
                </View>
                <Text style={{ color: t.muted, fontSize: 13 }}>
                  {doneCount}/{planned.length} aujourd'hui
                  {ratio === 1 ? ' — bravo ! 🎉' : ''}
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loaded ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>🌱</Text>
              <Text style={[styles.emptyTitle, { color: t.text }]}>Aucune habitude</Text>
              <Text style={{ color: t.muted, textAlign: 'center' }}>
                Ajoutez votre première habitude pour commencer votre série.
              </Text>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <HabitCard
            habit={item}
            today={today}
            onToggle={(d) => toggle(item.id, d)}
            onEdit={() => router.push({ pathname: '/habit-form', params: { id: item.id } })}
          />
        )}
      />
      <Pressable
        onPress={() => router.push('/habit-form')}
        style={[styles.fab, { backgroundColor: t.primary }]}
        accessibilityRole="button"
        accessibilityLabel="Ajouter une habitude"
      >
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 110 },
  header: { marginBottom: 18, gap: 4 },
  date: { fontSize: 14 },
  title: { fontSize: 30, fontWeight: '700' },
  progressWrap: { marginTop: 10, gap: 6 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 60, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
