import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TakeQuiz.css"
const TakeQuiz = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/quizzes");
                setQuizzes(response.data);
            } catch (error) {
                console.error("Error fetching quizzes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    const handleQuizClick = (quizId) => {
        navigate(`/quiz/${quizId}`); // Navigate to the Quiz component with quizId
    };

    if (loading) return <p>Loading quizzes...</p>;
    if (quizzes.length === 0) return <p>No quizzes available</p>;

    return (
        <div className="quiz-list">
            <h1>Available Quizzes</h1>
            <ul>
                {quizzes.map((quiz) => (
                    <li key={quiz._id} onClick={() => handleQuizClick(quiz._id)}>
                        {quiz.title} (Course: {quiz.course})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TakeQuiz;