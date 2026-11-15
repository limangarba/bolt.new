import { useState } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { colors, habitColors, habitEmojis } from '../theme';
import type { NewHabit, Reminder } from '../types';
import { ReminderPicker } from './ReminderPicker';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (habit: NewHabit) => void;
};

export function AddHabitModal({ visible, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(habitEmojis[0]);
  const [color, setColor] = useState(habitColors[0]);
  const [reminder, setReminder] = useState<Reminder | null>(null);

  const trimmed = name.trim();

  const reset = () => {
    setName('');
    setEmoji(habitEmojis[0]);
    setColor(habitColors[0]);
    setReminder(null);
  };

  const handleSave = () => {
    if (!trimmed) return;
    onSave({ name: trimmed, emoji, color, reminder });
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Nouvelle habitude</Text>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex. : Boire 2 L d'eau"
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoFocus
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          <Text style={styles.label}>Icône</Text>
          <View style={styles.grid}>
            {habitEmojis.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                style={[styles.emojiChoice, e === emoji && { borderColor: color, backgroundColor: color + '1A' }]}
                accessibilityLabel={`Icône ${e}`}
                accessibilityState={{ selected: e === emoji }}
              >
                <Text style={styles.emoji}>{e}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Couleur</Text>
          <View style={styles.colors}>
            {habitColors.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[styles.colorRing, c === color && { borderColor: c }]}
                accessibilityLabel={`Couleur ${c}`}
                accessibilityState={{ selected: c === color }}
              >
                <View style={[styles.colorChoice, { backgroundColor: c }]} />
              </Pressable>
            ))}
          </View>

          <ReminderPicker value={reminder} onChange={setReminder} accent={color} />
          </ScrollView>

          <View style={styles.actions}>
            <Pressable onPress={handleClose} style={[styles.button, styles.secondary]}>
              <Text style={styles.secondaryText}>Annuler</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={!trimmed}
              style={[styles.button, { backgroundColor: color, opacity: trimmed ? 1 : 0.4 }]}
            >
              <Text style={styles.primaryText}>Ajouter</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36, gap: 12,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  scroll: { maxHeight: 520 },
  scrollContent: { gap: 12 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiChoice: {
    width: 48, height: 48, borderRadius: 12, borderWidth: 2, borderColor: 'transparent',
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background,
  },
  emoji: { fontSize: 22 },
  colors: { flexDirection: 'row', gap: 6 },
  colorRing: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, borderColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
  },
  colorChoice: { width: 32, height: 32, borderRadius: 16 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  secondary: { backgroundColor: colors.background },
  secondaryText: { fontSize: 16, fontWeight: '600', color: colors.text },
  primaryText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
