
export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  public notify(title: string, options?: NotificationOptions) {
    if (typeof window === 'undefined') return;

    // Use built-in alert as fallback if Notification API is blocked/denied
    if (!('Notification' in window) || this.permission !== 'granted') {
      alert(`🚨 ${title}\n\n${options?.body || ''}`);
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: 'https://apula-capstone.github.io/APULA-MAIN/logo.svg',
        badge: 'https://apula-capstone.github.io/APULA-MAIN/logo.svg',
        vibrate: [500, 100, 500, 100, 500],
        requireInteraction: true,
        ...options
      });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('Error sending notification:', error);
      }
  }
}

export const notificationService = NotificationService.getInstance();
