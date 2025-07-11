const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Title of the video
    url: { type: String, required: true }, // URL of the video
    teacherName: { type: String, required: true }, // Name of the teacher who uploaded the video
    teacherId: { type: String, required: true }, // ID of the teacher who uploaded the video
});

const Video = mongoose.model("Video", videoSchema);

module.exports = Video; // Export the Video model, not Attendance