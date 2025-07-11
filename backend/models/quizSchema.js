const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }], // Array of options
    correctAnswer: { type: String, required: true }, // Correct answer
});

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    questions: [questionSchema], // Array of questions
    teacherId: { type: String, required: true }, // ID of the teacher who created the quiz
    course: { type: String, required: true }, // Course associated with the quiz
    createdAt: { type: Date, default: Date.now }, // Timestamp
});


const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;