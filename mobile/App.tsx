import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AddHabitModal } from './src/components/AddHabitModal';
import { HabitCard } from './src/components/HabitCard';
import { dayKey, formatToday } from './src/dates';
import { loadHabits, saveHabits } from './src/storage';
import { colors } from './src/theme';
import type { Habit, NewHabit } from './src/types';

function haptic() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}

function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const skipFirstSave = useRef(true);

  useEffect(() => {
    loadHabits().then((stored) => {
      setHabits(stored);
      setLoaded(true);
    });
  }, []);

  // Sauvegarde automatique après chaque modification (pas au chargement initial).
  useEffect(() => {
    if (!loaded) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    saveHabits(habits).catch(() => Alert.alert('Erreur', "Impossible d'enregistrer les données."));
  }, [habits, loaded]);

  const today = dayKey();
  const doneToday = habits.filter((h) => h.completions.includes(today)).length;
  const progress = habits.length ? doneToday / habits.length : 0;

  const toggle = (habitId: string, day: string) => {
    haptic();
    setHabits((list) =>
      list.map((h) => {
        if (h.id !== habitId) return h;
        const has = h.completions.includes(day);
        return {
          ...h,
          completions: has ? h.completions.filter((d) => d !== day) : [...h.completions, day],
        };
      }),
    );
  };

  const addHabit = (input: NewHabit) => {
    const habit: Habit = {
      ...input,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      completions: [],
    };
    setHabits((list) => [...list, habit]);
    setAdding(false);
  };

  const confirmDelete = (habit: Habit) => {
    const remove = () => setHabits((list) => list.filter((h) => h.id !== habit.id));
    if (Platform.OS === 'web') {
      // Alert.alert n'affiche pas de boutons sur le web.
      if (globalThis.confirm?.(`Supprimer « ${habit.name} » ?`)) remove();
      return;
    }
    Alert.alert('Supprimer cette habitude ?', `« ${habit.name} » et tout son historique seront effacés.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: remove },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <FlatList
        data={habits}
        keyExtractor={(h) => h.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.date}>{formatToday()}</Text>
            <Text style={styles.title}>Mes habitudes</Text>
            {habits.length > 0 && (
              <View style={styles.progressBlock}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {doneToday}/{habits.length} aujourd'hui
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loaded ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={styles.emptyTitle}>Aucune habitude pour l'instant</Text>
              <Text style={styles.emptyText}>
                Ajoutez votre première habitude et cochez-la chaque jour pour construire une série.
              </Text>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <HabitCard habit={item} onToggle={toggle} onLongPress={confirmDelete} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={
          habits.length > 0 ? (
            <Text style={styles.hint}>Touchez un jour pour le cocher · appui long pour supprimer</Text>
          ) : undefined
        }
      />

      <Pressable
        onPress={() => setAdding(true)}
        style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.96 }] }]}
        accessibilityRole="button"
        accessibilityLabel="Ajouter une habitude"
      >
        <Text style={styles.fabText}>＋ Nouvelle habitude</Text>
      </Pressable>

      <AddHabitModal visible={adding} onClose={() => setAdding(false)} onSave={addHabit} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <HabitsScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: 20, paddingBottom: 120 },
  header: { marginBottom: 20, gap: 4 },
  date: { fontSize: 14, color: colors.muted },
  title: { fontSize: 32, fontWeight: '800', color: colors.text },
  progressBlock: { marginTop: 14, gap: 6 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.empty, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#2F7D5B' },
  progressText: { fontSize: 13, color: colors.muted },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 21 },
  hint: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 20 },
  fab: {
    position: 'absolute', left: 20, right: 20, bottom: 32,
    backgroundColor: colors.text, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
