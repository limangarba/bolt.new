import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Habit } from './habits';

const CHANNEL_ID = 'reminders';
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export const remindersSupported = supported;

export const formatTime = (hour: number, minute: number) =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

/** Demande l'autorisation d'envoyer des notifications. Retourne true si accordée. */
export async function ensurePermission(): Promise<boolean> {
  if (!supported) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Rappels d’habitudes',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

/**
 * Remplace toutes les notifications planifiées par celles correspondant aux
 * habitudes : une notification hebdomadaire par jour planifié, à l'heure choisie.
 */
export async function syncReminders(habits: Habit[]): Promise<void> {
  if (!supported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const withReminder = habits.filter((h) => h.reminder);
    if (withReminder.length === 0) return;
    if (!(await Notifications.getPermissionsAsync()).granted) return;
    await ensureChannel();

    for (const h of withReminder) {
      const { hour, minute } = h.reminder!;
      for (const day of h.days) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${h.emoji} ${h.name}`,
            body: 'C’est l’heure de votre habitude !',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: day + 1, // 1 = dimanche … 7 = samedi
            hour,
            minute,
            channelId: CHANNEL_ID,
          },
        });
      }
    }
  } catch {
    // Les rappels sont un confort : ne jamais faire planter l'app.
  }
}
