import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateQuiz.css"; 

const CreateQuiz = () => {
    const [quiz, setQuiz] = useState({
        title: "",
        course: "",
        questions: [],
    });
    const [newQuestion, setNewQuestion] = useState({
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
    });
    const teacherId = localStorage.getItem("teacherId");
    const navigate = useNavigate();

    const handleQuizChange = (e) => {
        setQuiz({ ...quiz, [e.target.name]: e.target.value });
    };

    const handleQuestionChange = (e, index) => {
        const { name, value } = e.target;
        if (name === "questionText" || name === "correctAnswer") {
            setNewQuestion({ ...newQuestion, [name]: value });
        } else if (name.startsWith("option")) {
            const optionIndex = parseInt(name.replace("option", ""), 10);
            const updatedOptions = [...newQuestion.options];
            updatedOptions[optionIndex] = value;
            setNewQuestion({ ...newQuestion, options: updatedOptions });
        }
    };

    const addQuestion = () => {
        if (!newQuestion.questionText || !newQuestion.correctAnswer || newQuestion.options.some(opt => !opt)) {
            alert("Please fill all fields for the question.");
            return;
        }
        setQuiz({
            ...quiz,
            questions: [...quiz.questions, newQuestion],
        });
        setNewQuestion({
            questionText: "",
            options: ["", "", "", ""],
            correctAnswer: "",
        });
    };

    const handleSubmit = async () => {
        if (!quiz.title || !quiz.course || quiz.questions.length === 0) {
            alert("Please fill all fields and add at least one question.");
            return;
        }
        try {
            await axios.post("http://localhost:5000/api/quizzes", {
                ...quiz,
                teacherId,
            });
            alert("Quiz created successfully!");
            navigate("/teacher-dashboard");
        } catch (error) {
            console.error("Error creating quiz:", error);
            alert("Failed to create quiz. Please try again.");
        }
    };

    return (
        <div className="create-quiz-container">
            <h1>Create Quiz</h1>
            <div className="quiz-form">
                <div className="form-group">
                    <label>Quiz Title</label>
                    <input type="text" name="title" value={quiz.title} onChange={handleQuizChange} placeholder="Enter quiz title" />
                </div>
                <div className="form-group">
                    <label>Course</label>
                    <input type="text" name="course" value={quiz.course} onChange={handleQuizChange} placeholder="Enter course name" />
                </div>
                <div className="questions-section">
                    <h2>Add Questions</h2>
                    <div className="question-form">
                        <div className="form-group">
                            <label>Question Text</label>
                            <input type="text" name="questionText" value={newQuestion.questionText} onChange={handleQuestionChange} placeholder="Enter question text" />
                        </div>
                        <div className="form-group">
                            <label>Options</label>
                            {newQuestion.options.map((option, index) => (
                                <input key={index} type="text" name={`option${index}`} value={option} onChange={(e) => handleQuestionChange(e, index)} placeholder={`Option ${index + 1}`} />
                            ))}
                        </div>
                        <div className="form-group">
                            <label>Correct Answer</label>
                            <input type="text" name="correctAnswer" value={newQuestion.correctAnswer} onChange={handleQuestionChange} placeholder="Enter correct answer" />
                        </div>
                        <button type="button" onClick={addQuestion}>Add Question</button>
                    </div>
                </div>
                <div className="quiz-preview">
                    <h2>Quiz Preview</h2>
                    {quiz.questions.map((question, index) => (
                        <div key={index} className="question-preview">
                            <h3>Question {index + 1}: {question.questionText}</h3>
                            <ul>
                                {question.options.map((option, i) => (
                                    <li key={i}>{option}</li>
                                ))}
                            </ul>
                            <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={handleSubmit}>Create Quiz</button>
            </div>
        </div>
    );
};

export default CreateQuiz;
