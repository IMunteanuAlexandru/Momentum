import axios from 'axios';

class EmailService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }

  async sendNotification(type, data) {
    try {
      const response = await axios.post(`${this.apiUrl}/api/notifications/email`, {
        type,
        data,
        to: localStorage.getItem('userEmail'),
        template: 'notification',
      });
      return response.data;
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  }

  async sendEventReminder(event) {
    return this.sendNotification('event', {
      title: event.title,
      description: event.description,
      start: event.start,
      location: event.location,
      category: event.category
    });
  }

  async sendTaskReminder(task) {
    return this.sendNotification('task', {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      category: task.category
    });
  }
}

export const emailService = new EmailService();
export default emailService; 