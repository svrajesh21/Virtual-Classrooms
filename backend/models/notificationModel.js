const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['ASSIGNMENT', 'VIDEO', 'ANNOUNCEMENT'], 
        required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed }, // Additional data
    link: { type: String }, // Optional link
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);