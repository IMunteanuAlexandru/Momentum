const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEventReminder(to, event) {
    const subject = `Reminder: ${event.title} începe în curând`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #315659;">Reminder pentru eveniment</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
          <h3 style="color: #2978A0;">${event.title}</h3>
          ${event.description ? `<p>${event.description}</p>` : ''}
          <p><strong>Începe la:</strong> ${new Date(event.start).toLocaleString('ro-RO')}</p>
          ${event.location ? `<p><strong>Locație:</strong> ${event.location}</p>` : ''}
          ${event.category ? `<p><strong>Categorie:</strong> ${event.category}</p>` : ''}
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Acest email a fost trimis automat de aplicația Momentum.
        </p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendTaskReminder(to, task) {
    const subject = `Reminder: Task "${task.title}" are termen limită în curând`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #315659;">Reminder pentru task</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
          <h3 style="color: #2978A0;">${task.title}</h3>
          ${task.description ? `<p>${task.description}</p>` : ''}
          <p><strong>Termen limită:</strong> ${new Date(task.dueDate).toLocaleString('ro-RO')}</p>
          <p><strong>Prioritate:</strong> ${task.priority}</p>
          ${task.category ? `<p><strong>Categorie:</strong> ${task.category}</p>` : ''}
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Acest email a fost trimis automat de aplicația Momentum.
        </p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendEmail(to, subject, html) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Momentum" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html
      });

      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService(); 