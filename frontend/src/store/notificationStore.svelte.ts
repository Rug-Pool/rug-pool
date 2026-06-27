type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

let notifications = $state<Notification[]>([]);

export function notify(message: string, type: NotificationType = 'info') {
  const id = crypto.randomUUID();
  notifications = [...notifications, { id, message, type }];
  setTimeout(() => {
    dismiss(id);
  }, 3000);
}

export function dismiss(id: string) {
  notifications = notifications.filter((n) => n.id !== id);
}

export function getNotifications() {
  return notifications;
}
