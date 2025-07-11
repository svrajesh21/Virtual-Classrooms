import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeacherQuestions.css';

const TeacherQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    useEffect(() => {
        console.log('Component mounted, starting to fetch questions');
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            // Get teacher email from localStorage
            const teacherEmail = localStorage.getItem('teacherEmail');
            console.log('Teacher email from localStorage:', teacherEmail);

            if (!teacherEmail) {
                setError('Teacher email not found. Please login again.');
                setLoading(false);
                return;
            }

            // Fetch questions using email directly
            const response = await axios.get(`http://localhost:5000/api/teacher1/unanswered-questions/${teacherEmail}`);
            console.log('Questions response:', response.data);
            
            // Fetch video details for each question
            const questionsWithVideoDetails = await Promise.all(
                response.data.map(async (question) => {
                    try {
                        const videoResponse = await axios.get(`http://localhost:5000/api/videos/${question.videoId}`);
                        return {
                            ...question,
                            videoTitle: videoResponse.data.title
                        };
                    } catch (err) {
                        console.error('Error fetching video details:', err);
                        return {
                            ...question,
                            videoTitle: 'Unknown Video'
                        };
                    }
                })
            );
            
            setQuestions(questionsWithVideoDetails);
            setLoading(false);
        } catch (err) {
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError(err.response?.data?.message || 'Error fetching questions');
            setLoading(false);
        }
    };

    const handleReply = async (questionId) => {
        try {
            const teacherName = localStorage.getItem('teacherName');
            if (!teacherName) {
                setError('Teacher name not found');
                return;
            }

            await axios.post(`http://localhost:5000/api/teacher/questions/${questionId}/reply`, {
                reply: replyText,
                teacherName: teacherName
            });

            // Refresh questions after reply
            fetchQuestions();
            setReplyText('');
            setSelectedQuestion(null);
        } catch (err) {
            console.error('Error submitting reply:', err);
            setError(err.response?.data?.message || 'Error submitting reply');
        }
    };

    if (loading) return <div className="loading">Loading questions...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="teacher-questions-container">
            <h2>Student Questions</h2>
            {questions.length === 0 ? (
                <div className="no-questions">No unanswered questions found.</div>
            ) : (
                <div className="questions-list">
                    {questions.map((question) => (
                        <div key={question._id} className="question-card">
                            <div className="question-header">
                                <span className="student-name">{question.studentName}</span>
                                <span className="video-title1">{question.videoTitle}</span>
                                <span className="question-time">
                                    {new Date(question.timestamp).toLocaleString()}
                                </span>
                            </div>
                            <div className="question-content">{question.message}</div>
                            {selectedQuestion === question._id ? (
                                <div className="reply-section">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Enter your reply..."
                                    />
                                    <div className="reply-actions">
                                        <button 
                                            onClick={() => handleReply(question._id)}
                                            disabled={!replyText.trim()}
                                        >
                                            Submit Reply
                                        </button>
                                        <button 
                                            className="cancel-btn"
                                            onClick={() => {
                                                setSelectedQuestion(null);
                                                setReplyText('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    className="reply-btn"
                                    onClick={() => setSelectedQuestion(question._id)}
                                >
                                    Reply
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeacherQuestions;