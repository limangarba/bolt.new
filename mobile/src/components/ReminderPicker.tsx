import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { formatTime, remindersSupported } from '../notifications';
import { colors } from '../theme';
import type { Reminder } from '../types';

export const DEFAULT_REMINDER: Reminder = { hour: 8, minute: 0 };

type Props = {
  value: Reminder | null;
  onChange: (value: Reminder | null) => void;
  accent: string;
};

export function ReminderPicker({ value, onChange, accent }: Props) {
  const enabled = value !== null;
  const time = value ?? DEFAULT_REMINDER;

  const shift = (field: 'hour' | 'minute', delta: number) => {
    if (field === 'hour') {
      onChange({ ...time, hour: (time.hour + delta + 24) % 24 });
    } else {
      onChange({ ...time, minute: (time.minute + delta + 60) % 60 });
    }
  };

  return (
    <View style={styles.box}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Rappel quotidien</Text>
          <Text style={styles.subtitle}>
            {!remindersSupported
              ? 'Disponible sur iPhone et Android'
              : enabled
                ? `Notification chaque jour à ${formatTime(time)}`
                : 'Aucune notification'}
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={(on) => onChange(on ? time : null)}
          trackColor={{ true: accent, false: colors.border }}
          thumbColor="#fff"
          disabled={!remindersSupported}
          accessibilityLabel="Activer le rappel quotidien"
        />
      </View>

      {enabled && (
        <View style={styles.time}>
          <Stepper label="Heures" text={String(time.hour).padStart(2, '0')}
            onMinus={() => shift('hour', -1)} onPlus={() => shift('hour', 1)} />
          <Text style={styles.colon}>:</Text>
          <Stepper label="Minutes" text={String(time.minute).padStart(2, '0')}
            onMinus={() => shift('minute', -5)} onPlus={() => shift('minute', 5)} />
        </View>
      )}
    </View>
  );
}

function Stepper({ label, text, onMinus, onPlus }: {
  label: string; text: string; onMinus: () => void; onPlus: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={onMinus} style={styles.stepButton} hitSlop={6}
        accessibilityLabel={`${label} moins`}>
        <Text style={styles.stepText}>−</Text>
      </Pressable>
      <Text style={styles.value} accessibilityLabel={`${label} ${text}`}>{text}</Text>
      <Pressable onPress={onPlus} style={styles.stepButton} hitSlop={6}
        accessibilityLabel={`${label} plus`}>
        <Text style={styles.stepText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.background, borderRadius: 14, padding: 14, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  time: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  colon: { fontSize: 28, fontWeight: '700', color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepButton: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  stepText: { fontSize: 20, fontWeight: '600', color: colors.text },
  value: {
    fontSize: 28, fontWeight: '700', color: colors.text, minWidth: 44, textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
