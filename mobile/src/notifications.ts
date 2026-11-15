import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Habit, Reminder } from './types';

/** Les notifications locales n'existent que sur iOS et Android. */
export const remindersSupported = Platform.OS === 'ios' || Platform.OS === 'android';

const CHANNEL_ID = 'rappels';
const PREFIX = 'habit-';

export function formatTime({ hour, minute }: Reminder): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** À appeler une fois au démarrage : affichage des rappels même app ouverte. */
export function configureNotifications(): void {
  if (!remindersSupported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Rappels quotidiens',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

export type PermissionResult = 'granted' | 'denied' | 'unsupported';

/** Demande l'autorisation si nécessaire (uniquement quand l'utilisateur active un rappel). */
export async function ensurePermission(): Promise<PermissionResult> {
  if (!remindersSupported) return 'unsupported';
  // Sur Android 13+, le canal doit exister pour que la demande s'affiche.
  await ensureAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  if (!current.canAskAgain) return 'denied';
  const asked = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return asked.granted ? 'granted' : 'denied';
}

/**
 * Aligne les notifications programmées sur la liste des habitudes :
 * supprime les anciens rappels de l'app puis reprogramme un rappel quotidien
 * par habitude qui en a un.
 */
export async function syncReminders(habits: Habit[]): Promise<void> {
  if (!remindersSupported) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );

  const withReminder = habits.filter((h) => h.reminder);
  if (withReminder.length === 0) return;

  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return;

  await ensureAndroidChannel();
  for (const habit of withReminder) {
    const { hour, minute } = habit.reminder!;
    await Notifications.scheduleNotificationAsync({
      identifier: `${PREFIX}${habit.id}`,
      content: {
        title: `${habit.emoji} ${habit.name}`,
        body: "C'est le moment ! Pensez à cocher votre habitude du jour.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: CHANNEL_ID,
      },
    });
  }
}

/** Clé qui ne change que si un rappel (ou son texte) change, pas à chaque coche. */
export function remindersSignature(habits: Habit[]): string {
  return JSON.stringify(
    habits.map((h) => [h.id, h.name, h.emoji, h.reminder ? formatTime(h.reminder) : null]),
  );
}
