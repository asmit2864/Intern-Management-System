const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth.middleware');
const { getMyNotifications, dismissNotification, sendCustomNotification, markAllRead } = require('./notification.controller');

router.get('/', protect, getMyNotifications);
router.post('/custom', protect, sendCustomNotification); // Add this line
router.put('/read-all', protect, markAllRead);
router.delete('/:id', protect, dismissNotification);

module.exports = router;
