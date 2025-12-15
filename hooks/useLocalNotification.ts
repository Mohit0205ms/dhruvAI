import { requestNotificationPermission } from '../services/notifications/permissions';
import { scheduleLocalNotification } from '../services/notifications/localNotification';

export function useLocalNotification() {
  const triggerNotification = async ({
    title,
    body,
    second = 0,
  }: {
    title: string;
    body: string;
    second?: number;
  }) => {
    const granted = await requestNotificationPermission();
    if (!granted) return;
    await scheduleLocalNotification(title, body, second);
  };
  return { triggerNotification };
}
