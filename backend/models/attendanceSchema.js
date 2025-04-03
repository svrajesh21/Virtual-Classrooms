const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    videoId: { type: String, required: true }, // ID of the video/class
    studentEmail: { type: String, required: true }, // Email of the student
    watchPercentage: { type: Number, required: true }, // Percentage of the video watched
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance; // Export the Attendance model