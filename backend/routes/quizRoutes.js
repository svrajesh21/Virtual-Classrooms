const express = require("express");
const Quiz = require("../models/quizSchema"); // Corrected path
const router = express.Router();
const Result = require("../models/resultSchema"); // Import the Result model
const Attendance = require("../models/attendanceSchema"); // Ensure this path is correct
const Video = require("../models/videoSchema"); // Ensure this path is correct


// Create a new quiz
router.post("/quizzes", async (req, res) => {
    const { title, questions, teacherId, course } = req.body;

    try {
        const newQuiz = new Quiz({ title, questions, teacherId, course });
        await newQuiz.save();
        res.status(201).json({ message: "Quiz created successfully", quiz: newQuiz });
    } catch (error) {
        res.status(500).json({ message: "Error creating quiz", error: error.message });
    }
});

// Get all quizzes for a specific course
router.get("/quizzes", async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching quizzes", error: error.message });
    }
});


// Get a specific quiz by ID
router.get("/quizzes/quiz/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        console.log("Quiz Fetched:", quiz); // Log the quiz data
        res.json(quiz);
    } catch (error) {
        console.error("Error fetching quiz:", error);
        res.status(500).json({ message: "Error fetching quiz", error: error.message });
    }
});


router.post("/quizzes/submit", async (req, res) => {
    const { quizId, studentEmail, answers } = req.body;

    try {
        // Check if the student has already submitted this quiz
        const existingResult = await Result.findOne({ quizId, studentEmail });
        if (existingResult) {
            return res.status(400).json({ message: "You have already submitted this quiz." });
        }

        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // Calculate score
        let score = 0;
        quiz.questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                score++;
            }
        });

        // Save the result in the database
        const result = new Result({
            quizId,
            studentEmail,
            score,
            total: quiz.questions.length,
        });
        await result.save();

        // Return the score and total
        res.json({ message: "Quiz submitted successfully", score, total: quiz.questions.length });
    } catch (error) {
        console.error("Error submitting quiz:", error);

        // Handle duplicate key error (if the unique constraint is violated)
        if (error.code === 11000) {
            return res.status(400).json({ message: "You have already submitted this quiz." });
        }

        res.status(500).json({ message: "Error submitting quiz", error: error.message });
    }
});

// Get all results for a specific student
router.get("/results/:studentEmail", async (req, res) => {
    const { studentEmail } = req.params;

    try {
        const results = await Result.find({ studentEmail });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: "Error fetching results", error: error.message });
    }
});

router.get("/performance/:studentEmail", async (req, res) => {
    const { studentEmail } = req.params;

    try {
        // Fetch attendance data
        const attendanceRecords = await Attendance.find({ studentEmail });
        const totalClassesAttended = attendanceRecords.length;
        const totalClassesAvailable = await Video.countDocuments(); // Assuming each video represents a class
        const attendancePercentage = (totalClassesAttended / totalClassesAvailable) * 100;

        // Fetch quiz data
        const quizResults = await Result.find({ studentEmail });
        const totalQuizzesTaken = quizResults.length;
        const totalScore = quizResults.reduce((sum, result) => sum + result.score, 0);
        const averageScore = totalQuizzesTaken > 0 ? totalScore / totalQuizzesTaken : 0;

        // Prepare the response
        const performanceData = {
            attendance: {
                totalClassesAttended,
                totalClassesAvailable,
                attendancePercentage,
            },
            quizzes: {
                totalQuizzesTaken,
                averageScore,
                quizResults, // Include individual quiz results for detailed analysis
            },
        };

        res.json(performanceData);
    } catch (error) {
        console.error("Error fetching performance data:", error);
        res.status(500).json({ message: "Error fetching performance data", error: error.message });
    }
});

module.exports = router;