import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./Quiz.css";

const Quiz = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [score, setScore] = useState(null);
    const [error, setError] = useState(null);
    const [isQuizStarted, setIsQuizStarted] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/quizzes/quiz/${quizId}`);
                setQuiz(response.data);
                setAnswers(new Array(response.data.questions.length).fill(null));
            } catch (error) {
                console.error("Error fetching quiz:", error);
                setError("Failed to load quiz. Please try again later.");
            }
        };
        fetchQuiz();
    }, [quizId]);

    const handleAnswerChange = (questionIndex, selectedAnswer) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = selectedAnswer;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/quizzes/submit", {
                quizId,
                studentEmail: localStorage.getItem("studentEmail"),
                answers,
            });
            setScore(response.data.score);
        } catch (error) {
            console.error("Error submitting quiz:", error);
            if (error.response && error.response.data.message) {
                alert(error.response.data.message);
            } else {
                alert("Failed to submit quiz. Please try again.");
            }
        }
    };

    const handleStartQuiz = () => {
        setIsQuizStarted(true);
    };

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!quiz) return <p>Loading quiz...</p>;

    return (
        <div className="parent-container">
            <div className="quiz-container">
                {!isQuizStarted ? (
                    <div className="start-quiz">
                        <h1>Welcome to the Quiz!</h1>
                        <p>You are about to start: <strong>{quiz.title}</strong></p>
                        <p>Total Questions: {quiz.questions.length}</p>
                        <button onClick={handleStartQuiz}>Start Quiz</button>
                    </div>
                ) : (
                    <>
                        <h1>{quiz.title}</h1>
                        {quiz.questions.map((question, index) => (
                            <div key={index} className="question">
                                <h3>{question.questionText}</h3>
                                {question.options.map((option, i) => (
                                    <div key={i} className="option">
                                        <input
                                            type="radio"
                                            name={`question-${index}`}
                                            value={option}
                                            onChange={() => handleAnswerChange(index, option)}
                                        />
                                        <label>{option}</label>
                                    </div>
                                ))}
                            </div>
                        ))}
                        <button onClick={handleSubmit}>Submit Quiz</button>
                        {score !== null && (
                            <div className="result">
                                <h2>Your Score: {score}/{quiz.questions.length}</h2>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Quiz;