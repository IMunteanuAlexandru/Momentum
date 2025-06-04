import { emailService } from './EmailService';

class NotificationService {
  constructor() {
    this.checkInterval = 60000; // Check every minute
    this.intervalId = null;
    this.notifiedEvents = new Set();
  }

  start() {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.checkUpcoming(), this.checkInterval);
      this.checkUpcoming(); // Check immediately on start
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async checkUpcoming() {
    const now = new Date();
    
    // Get events and tasks from localStorage
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const inAppNotificationsEnabled = localStorage.getItem('inAppNotifications') !== 'false';
    const pushNotificationsEnabled = localStorage.getItem('pushNotifications') !== 'false';

    // Check events
    events.forEach(async event => {
      const eventStart = new Date(event.start);
      const timeUntilStart = eventStart - now;

      // 1 hour notification
      if (timeUntilStart > 0 && timeUntilStart <= 3600000 && !this.hasBeenNotified(event.id, '1h')) {
        // Send in-app notification if enabled
        if (inAppNotificationsEnabled && event.notifications?.inApp) {
          this.showInAppNotification(
            'Eveniment în curând',
            {
              title: event.title,
              message: `Evenimentul începe în 1 oră`,
              type: 'event',
              icon: '📅'
            }
          );
        }

        // Send push notification if enabled
        if (pushNotificationsEnabled && event.notifications?.push && 
            ("Notification" in window) && Notification.permission === 'granted') {
          this.showNotification(
            'Eveniment în curând',
            {
              title: event.title,
              time: '1 oră',
              type: 'event',
              description: event.description || '',
              icon: '📅'
            },
            event.id,
            '1h'
          );
        }
      }

      // 10 minutes notification
      if (timeUntilStart > 0 && timeUntilStart <= 600000 && !this.hasBeenNotified(event.id, '10m')) {
        // Send in-app notification if enabled
        if (inAppNotificationsEnabled && event.notifications?.inApp) {
          this.showInAppNotification(
            'Eveniment în curând',
            {
              title: event.title,
              message: `Evenimentul începe în 10 minute`,
              type: 'event',
              icon: '⏰'
            }
          );
        }

        // Send push notification if enabled
        if (pushNotificationsEnabled && event.notifications?.push &&
            ("Notification" in window) && Notification.permission === 'granted') {
          this.showNotification(
            'Eveniment în curând',
            {
              title: event.title,
              time: '10 minute',
              type: 'event',
              description: event.description || '',
              icon: '⏰'
            },
            event.id,
            '10m'
          );
        }
      }
    });

    // Check tasks
    tasks.forEach(async task => {
      if (task.dueDate) {
        const taskDue = new Date(task.dueDate);
        const timeUntilDue = taskDue - now;

        // 1 hour notification
        if (timeUntilDue > 0 && timeUntilDue <= 3600000 && !this.hasBeenNotified(task.id, '1h')) {
          // Send in-app notification if enabled
          if (inAppNotificationsEnabled && task.notifications?.inApp) {
            this.showInAppNotification(
              'Task în curând',
              {
                title: task.title,
                message: `Task-ul se termină în 1 oră`,
                type: 'task',
                icon: '✓'
              }
            );
          }

          // Send push notification if enabled
          if (pushNotificationsEnabled && task.notifications?.push &&
              ("Notification" in window) && Notification.permission === 'granted') {
            this.showNotification(
              'Task în curând',
              {
                title: task.title,
                time: '1 oră',
                type: 'task',
                description: task.description || '',
                icon: '✓'
              },
              task.id,
              '1h'
            );
          }
        }

        // 10 minutes notification
        if (timeUntilDue > 0 && timeUntilDue <= 600000 && !this.hasBeenNotified(task.id, '10m')) {
          // Send in-app notification if enabled
          if (inAppNotificationsEnabled && task.notifications?.inApp) {
            this.showInAppNotification(
              'Task în curând',
              {
                title: task.title,
                message: `Task-ul se termină în 10 minute`,
                type: 'task',
                icon: '⚡'
              }
            );
          }

          // Send push notification if enabled
          if (pushNotificationsEnabled && task.notifications?.push &&
              ("Notification" in window) && Notification.permission === 'granted') {
            this.showNotification(
              'Task în curând',
              {
                title: task.title,
                time: '10 minute',
                type: 'task',
                description: task.description || '',
                icon: '⚡'
              },
              task.id,
              '10m'
            );
          }
        }
      }
    });
  }

  hasBeenNotified(id, timing) {
    const key = `${id}-${timing}`;
    return this.notifiedEvents.has(key);
  }

  showInAppNotification(title, data) {
    if (window.notificationCenter) {
      window.notificationCenter.addNotification({
        title,
        ...data
      });
    }
  }

  showNotification(title, data, id, timing) {
    const options = {
      body: `${data.icon} ${data.title}\n${data.type === 'event' ? 'Începe' : 'Termen limită'} în ${data.time}`,
      icon: data.type === 'event' ? '/event-icon.png' : '/task-icon.png',
      badge: '/badge-icon.png',
      image: data.image,
      vibrate: [200, 100, 200],
      tag: `${id}-${timing}`,
      actions: [
        {
          action: 'view',
          title: 'Vezi detalii',
          icon: '/view-icon.png'
        },
        {
          action: 'dismiss',
          title: 'Închide',
          icon: '/dismiss-icon.png'
        }
      ],
      data: {
        id,
        type: data.type,
        url: data.type === 'event' ? '/events' : '/tasks'
      },
      requireInteraction: true,
      silent: false,
      renotify: true
    };

    const notification = new Notification(title, options);

    // Mark as notified
    this.notifiedEvents.add(`${id}-${timing}`);

    // Clear notification from set after 24 hours
    setTimeout(() => {
      this.notifiedEvents.delete(`${id}-${timing}`);
    }, 24 * 60 * 60 * 1000);

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      const data = notification.data;
      window.focus();
      window.location.href = data.url;
      notification.close();
    };

    // Handle notification action
    navigator.serviceWorker.ready.then(registration => {
      registration.addEventListener('notificationclick', (event) => {
        event.notification.close();
        if (event.action === 'view') {
          clients.openWindow(event.notification.data.url);
        }
      });
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService; 