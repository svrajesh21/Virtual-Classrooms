// models/Performance.js
const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
    studentEmail: { type: String, required: true, unique: true },
    attendance: {
        totalClassesAvailable: Number,
        totalClassesAttended: Number,
        attendancePercentage: Number
    },
    quizzes: {
        quizResults: [{
            quizId: String,
            score: Number,
            maxScore: Number
        }],
        averageScore: Number
    }
    // other performance metrics...
});

module.exports = mongoose.model('Performance', performanceSchema);