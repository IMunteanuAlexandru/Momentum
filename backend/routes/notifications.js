const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const auth = require('../middleware/auth');

router.post('/email', auth, async (req, res) => {
  try {
    const { type, data, to } = req.body;

    if (!to) {
      return res.status(400).json({ message: 'Email recipient is required' });
    }

    if (!type || !data) {
      return res.status(400).json({ message: 'Notification type and data are required' });
    }

    let result;
    if (type === 'event') {
      result = await emailService.sendEventReminder(to, data);
    } else if (type === 'task') {
      result = await emailService.sendTaskReminder(to, data);
    } else {
      return res.status(400).json({ message: 'Invalid notification type' });
    }

    res.json({ message: 'Email sent successfully', result });
  } catch (error) {
    console.error('Error sending email notification:', error);
    res.status(500).json({ message: 'Failed to send email notification' });
  }
});

module.exports = router; 