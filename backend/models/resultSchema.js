const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
    quizId: { type: String, required: true }, // ID of the quiz
    studentEmail: { type: String, required: true }, // Email of the student
    score: { type: Number, required: true }, // Score obtained by the student
    total: { type: Number, required: true }, // Total number of questions
    submittedAt: { type: Date, default: Date.now }, // Timestamp of submission
});

// Add a unique compound index on quizId and studentEmail
resultSchema.index({ quizId: 1, studentEmail: 1 }, { unique: true });

const Result = mongoose.model("Result", resultSchema);

module.exports = Result;