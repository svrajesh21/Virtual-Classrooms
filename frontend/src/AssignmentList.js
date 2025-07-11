import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AssignmentList.css"; // Correct CSS import

const TeacherView = () => {
    const [teacherAssignments, setTeacherAssignments] = useState([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [message, setMessage] = useState("");

    // Retrieve the logged-in teacher's email from localStorage
    const teacherEmail = localStorage.getItem("teacherEmail");

    // Fetch assignments created by the logged-in teacher
    useEffect(() => {
        const fetchTeacherAssignments = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/teacherAssignments", {
                    params: { teacherEmail }, // Pass teacherEmail as a query parameter
                });
                setTeacherAssignments(res.data);
            } catch (error) {
                console.error("Error fetching teacher assignments:", error);
                setMessage("Error fetching teacher assignments.");
            }
        };
        fetchTeacherAssignments();
    }, [teacherEmail]);

    // Fetch submissions for the selected assignment
    const fetchSubmissions = async (assignmentId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submissions/${assignmentId}`, {
                params: { teacherEmail }, // Pass teacherEmail as a query parameter
            });
            setSubmissions(res.data);
        } catch (error) {
            console.error("Error fetching submissions:", error);
            setMessage("Error fetching submissions.");
        }
    };

    // Handle assignment selection
    const handleAssignmentSelect = (assignmentId) => {
        setSelectedAssignmentId(assignmentId);
        fetchSubmissions(assignmentId);
    };

    return (
        <div className="assignment-list-container">
            <h2>Teacher View: Submitted Assignments</h2>
            {message && <p className="message">{message}</p>}

            {/* List of Assignments */}
            <h3>Your Assignments</h3>
            {teacherAssignments.length > 0 ? (
                <ul className="assignments-list">
                    {teacherAssignments.map((assignment) => (
                        <li key={assignment._id}>
                            <strong>{assignment.title}</strong> - {assignment.description} (Due: {assignment.dueDate})
                            <button onClick={() => handleAssignmentSelect(assignment._id)}>View Submissions</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-data-message">No assignments posted yet.</p>
            )}

            {/* List of Submissions for Selected Assignment */}
            {selectedAssignmentId && (
                <div>
                    <h3>Submissions for Selected Assignment</h3>
                    {submissions.length > 0 ? (
                        <ul className="submissions-list">
                            {submissions.map((submission) => (
                                <li key={submission._id}>
                                    <strong>{submission.assignmentTitle}</strong> - Submitted by: {submission.email}
                                    <a href={`http://localhost:5000/api/download/${submission.fileName}`} download>
                                        <button>Download</button>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-data-message">No submissions yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeacherView;