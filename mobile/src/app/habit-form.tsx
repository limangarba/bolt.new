import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Switch,
  TextInput,
  View,
} from 'react-native';

import { ALL_DAYS, WEEK_DAYS } from '@/lib/dates';
import { HABIT_COLORS, HABIT_EMOJIS } from '@/lib/habits';
import { ensurePermission, formatTime, remindersSupported } from '@/lib/notifications';
import { useHabits } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function HabitFormScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { habits, addHabit, updateHabit, deleteHabit } = useHabits();
  const existing = habits.find((h) => h.id === id);

  const [name, setName] = useState(existing?.name ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? HABIT_EMOJIS[0]);
  const [color, setColor] = useState(existing?.color ?? HABIT_COLORS[0]);
  const [days, setDays] = useState<number[]>(existing?.days ?? ALL_DAYS);

  const [reminder, setReminder] = useState<{ hour: number; minute: number } | null>(
    existing?.reminder ?? null,
  );

  const toggleReminder = async (on: boolean) => {
    if (!on) return setReminder(null);
    if (await ensurePermission()) {
      setReminder({ hour: 8, minute: 0 });
    } else {
      Alert.alert(
        'Notifications désactivées',
        'Autorisez les notifications pour cette application dans les réglages du téléphone afin de recevoir des rappels.',
      );
    }
  };

  const shift = (dh: number, dm: number) =>
    setReminder((r) => {
      if (!r) return r;
      const total = (((r.hour * 60 + r.minute + dh * 60 + dm) % 1440) + 1440) % 1440;
      return { hour: Math.floor(total / 60), minute: total % 60 };
    });

  const valid = name.trim().length > 0 && days.length > 0;

  const toggleDay = (d: number) =>
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const save = () => {
    if (!valid) return;
    const input = { name: name.trim(), emoji, color, days, reminder };
    if (existing) updateHabit(existing.id, input);
    else addHabit(input);
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    const doDelete = () => {
      deleteHabit(existing.id);
      router.back();
    };
    if (Platform.OS === 'web') {
      doDelete();
      return;
    }
    Alert.alert('Supprimer cette habitude ?', 'Tout son historique sera perdu.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: doDelete },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: existing ? 'Modifier' : 'Nouvelle habitude' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: t.muted }]}>Nom</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex. Boire 2 L d'eau"
          placeholderTextColor={t.muted}
          maxLength={40}
          style={[styles.input, { backgroundColor: t.card, borderColor: t.border, color: t.text }]}
        />

        <Text style={[styles.label, { color: t.muted }]}>Icône</Text>
        <View style={styles.wrap}>
          {HABIT_EMOJIS.map((e) => (
            <Pressable
              key={e}
              onPress={() => setEmoji(e)}
              style={[
                styles.emojiBtn,
                { backgroundColor: t.card, borderColor: e === emoji ? color : t.border },
              ]}
            >
              <Text style={{ fontSize: 24 }}>{e}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: t.muted }]}>Couleur</Text>
        <View style={styles.wrap}>
          {HABIT_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              accessibilityLabel={`Couleur ${c}`}
              style={[
                styles.colorBtn,
                { backgroundColor: c, borderColor: c === color ? t.text : 'transparent' },
              ]}
            />
          ))}
        </View>

        <Text style={[styles.label, { color: t.muted }]}>Jours</Text>
        <View style={styles.daysRow}>
          {WEEK_DAYS.map((w) => {
            const on = days.includes(w.day);
            return (
              <Pressable
                key={w.day}
                onPress={() => toggleDay(w.day)}
                accessibilityLabel={w.long}
                accessibilityState={{ selected: on }}
                style={[
                  styles.dayBtn,
                  on
                    ? { backgroundColor: color, borderColor: color }
                    : { backgroundColor: t.card, borderColor: t.border },
                ]}
              >
                <Text style={{ color: on ? '#fff' : t.text, fontWeight: '600' }}>{w.short}</Text>
              </Pressable>
            );
          })}
        </View>

        {remindersSupported && (
          <>
            <Text style={[styles.label, { color: t.muted }]}>Rappel</Text>
            <View style={[styles.reminderBox, { backgroundColor: t.card, borderColor: t.border }]}>
              <View style={styles.reminderRow}>
                <Text style={{ color: t.text, fontSize: 16 }}>Me rappeler chaque jour prévu</Text>
                <Switch
                  value={!!reminder}
                  onValueChange={toggleReminder}
                  trackColor={{ true: color }}
                />
              </View>
              {reminder && (
                <View style={styles.timeRow}>
                  <Stepper label="heure" onMinus={() => shift(-1, 0)} onPlus={() => shift(1, 0)} />
                  <Text style={[styles.time, { color: t.text }]}>
                    {formatTime(reminder.hour, reminder.minute)}
                  </Text>
                  <Stepper label="minutes" onMinus={() => shift(0, -5)} onPlus={() => shift(0, 5)} />
                </View>
              )}
            </View>
          </>
        )}

        <Pressable
          onPress={save}
          disabled={!valid}
          style={[styles.save, { backgroundColor: color, opacity: valid ? 1 : 0.4 }]}
        >
          <Text style={styles.saveText}>{existing ? 'Enregistrer' : 'Créer'}</Text>
        </Pressable>

        {existing && (
          <Pressable onPress={remove} style={styles.delete}>
            <Text style={{ color: '#EF4444', fontWeight: '600' }}>Supprimer l'habitude</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Stepper({
  label,
  onMinus,
  onPlus,
}: {
  label: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  const t = useTheme();
  const btn = [styles.stepBtn, { borderColor: t.border }];
  return (
    <View style={styles.stepper}>
      <Pressable onPress={onMinus} style={btn} accessibilityLabel={`Moins ${label}`}>
        <Text style={{ color: t.text, fontSize: 20 }}>−</Text>
      </Pressable>
      <Pressable onPress={onPlus} style={btn} accessibilityLabel={`Plus ${label}`}>
        <Text style={{ color: t.text, fontSize: 20 }}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  reminderBox: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 14 },
  reminderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { fontSize: 32, fontWeight: '700', fontVariant: ['tabular-nums'] },
  stepper: { flexDirection: 'row', gap: 8 },
  stepBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 48 },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginTop: 20, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 17 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  emojiBtn: { width: 48, height: 48, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  colorBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  save: { marginTop: 32, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  delete: { marginTop: 16, alignItems: 'center', padding: 12 },
});
