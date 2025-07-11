const Video = require('../models/videoSchema');
const Notification = require('../models/notificationModel');
const notificationController = require('./notificationController');

exports.uploadVideo = async (req, res) => {
    const { title, url, teacherName, teacherId } = req.body;

    if (!title || !url || !teacherName || !teacherId) {
        return res.status(400).json({ message: "Title, URL, teacher name, and teacher ID are required" });
    }

    try {
        const newVideo = new Video({ title, url, teacherName, teacherId });
        await newVideo.save();
        
        // Create notification
        await notificationController.createNotification({
            type: 'VIDEO',
            title: `New Video: ${title}`,
            message: `A new video has been uploaded by ${teacherName}`,
            data: {
                videoId: newVideo._id,
                teacherName,
                title
            },
            link: `/videos/${newVideo._id}`
        });

        res.status(201).json({ message: "Video uploaded successfully", url });
    } catch (error) {
        console.error("Error uploading video:", error);
        res.status(500).json({ message: "Error uploading video" });
    }
};

// Add other video controller methods as needed...