import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addDays, toKey } from '@/lib/dates';
import { bestStreak, completionRate, currentStreak } from '@/lib/habits';
import { useHabits } from '@/lib/store';
import { useTheme } from '@/lib/theme';

const WEEKS = 8;

export default function StatsScreen() {
  const t = useTheme();
  const { habits } = useHabits();
  const today = new Date();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: t.text }]}>Statistiques</Text>
        {habits.length === 0 && (
          <Text style={{ color: t.muted }}>
            Les statistiques apparaîtront dès que vous aurez ajouté une habitude.
          </Text>
        )}
        {habits.map((h) => {
          const done = new Set(h.completions);
          const rate = Math.round(completionRate(h, 30, today) * 100);
          // Grille calendrier : WEEKS colonnes (semaines), 7 lignes (lundi → dimanche).
          const monday = addDays(today, -((today.getDay() + 6) % 7));
          const first = addDays(monday, -(WEEKS - 1) * 7);
          return (
            <View
              key={h.id}
              style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}
            >
              <Text style={[styles.name, { color: t.text }]}>
                {h.emoji} {h.name}
              </Text>
              <View style={styles.kpis}>
                <Kpi label="Série" value={`${currentStreak(h, today)}`} color={h.color} />
                <Kpi label="Record" value={`${bestStreak(h, today)}`} color={h.color} />
                <Kpi label="30 jours" value={`${rate}%`} color={h.color} />
                <Kpi label="Total" value={`${h.completions.length}`} color={h.color} />
              </View>
              <View style={styles.grid}>
                {Array.from({ length: WEEKS }, (_, w) => (
                  <View key={w} style={styles.gridCol}>
                    {Array.from({ length: 7 }, (_, d) => {
                      const day = addDays(first, w * 7 + d);
                      const future = day > today;
                      const on = done.has(toKey(day));
                      return (
                        <View
                          key={d}
                          style={[
                            styles.cell,
                            {
                              backgroundColor: on ? h.color : t.track,
                              opacity: future ? 0.15 : 1,
                            },
                          ]}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color: string }) {
  const t = useTheme();
  return (
    <View style={styles.kpi}>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      <Text style={{ color: t.muted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  title: { fontSize: 30, fontWeight: '700', marginBottom: 6 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  name: { fontSize: 17, fontWeight: '600' },
  kpis: { flexDirection: 'row', justifyContent: 'space-between' },
  kpi: { alignItems: 'center', flex: 1 },
  kpiValue: { fontSize: 22, fontWeight: '700' },
  grid: { flexDirection: 'row', gap: 5, justifyContent: 'center' },
  gridCol: { gap: 5 },
  cell: { width: 20, height: 20, borderRadius: 5 },
});
