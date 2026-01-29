const Notification = require('./notification.model');

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 });

        res.json({ success: true, count: notifications.length, notifications });
    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

// @desc    Dismiss (delete) a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.dismissNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // Ensure user owns the notification
        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await notification.deleteOne();

        res.json({ success: true, message: 'Notification dismissed' });
    } catch (error) {
        console.error('Dismiss Notification Error:', error);
        res.status(500).json({ error: 'Failed to dismiss notification' });
    }
};
// @desc    Send custom notification (Manager)
// @route   POST /api/notifications/custom
// @access  Manager/Admin
exports.sendCustomNotification = async (req, res) => {
    try {
        const { candidateId, title, message } = req.body;

        // Resolve Candidate to User
        const Candidate = require('../candidates/candidate.model');
        const User = require('../auth/user.model');

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

        const user = await User.findOne({ email: candidate.email });
        if (!user) return res.status(404).json({ error: 'Candidate has no associated user account' });

        const notification = await Notification.create({
            recipient: user._id,
            title: title || 'New Message',
            message: message,
            type: 'info' // Default generic type
        });

        res.json({ success: true, notification });
    } catch (error) {
        console.error('Send Custom Notification Error:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
};
// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark All Read Error:', error);
        res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
};
