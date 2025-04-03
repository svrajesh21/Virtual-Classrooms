const Notification = require('../models/notificationModel');

// Get all notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { $set: { read: true } },
            { new: true }
        );
        res.status(200).json(notification);
    } catch (err) {
        console.error('Error marking notification as read:', err);
        res.status(500).json({ message: 'Error marking notification as read' });
    }
};

// Create a notification (to be called from other controllers)
exports.createNotification = async (notificationData) => {
    try {
        const notification = new Notification(notificationData);
        await notification.save();
        return notification;
    } catch (err) {
        console.error('Error creating notification:', err);
        throw err;
    }
};