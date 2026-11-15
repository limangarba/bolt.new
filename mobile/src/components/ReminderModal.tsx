import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import type { Habit, Reminder } from '../types';
import { ReminderPicker } from './ReminderPicker';

type Props = {
  habit: Habit | null;
  onClose: () => void;
  onSave: (habitId: string, reminder: Reminder | null) => void;
};

/** Réglage du rappel d'une habitude existante. */
export function ReminderModal({ habit, onClose, onSave }: Props) {
  const [reminder, setReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    if (habit) setReminder(habit.reminder ?? null);
  }, [habit]);

  return (
    <Modal visible={habit !== null} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        {habit && (
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>{habit.emoji} {habit.name}</Text>
            <ReminderPicker value={reminder} onChange={setReminder} accent={habit.color} />
            <View style={styles.actions}>
              <Pressable onPress={onClose} style={[styles.button, styles.secondary]}>
                <Text style={styles.secondaryText}>Annuler</Text>
              </Pressable>
              <Pressable
                onPress={() => onSave(habit.id, reminder)}
                style={[styles.button, { backgroundColor: habit.color }]}
              >
                <Text style={styles.primaryText}>Enregistrer</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36, gap: 14,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  secondary: { backgroundColor: colors.background },
  secondaryText: { fontSize: 16, fontWeight: '600', color: colors.text },
  primaryText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
