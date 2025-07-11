import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./submitassignment.module.css";

const SubmitAssignment = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [teacherAssignments, setTeacherAssignments] = useState([]);
    const [submittedAssignments, setSubmittedAssignments] = useState([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [selectedAssignmentTitle, setSelectedAssignmentTitle] = useState("");

    useEffect(() => {
        const loggedInEmail = localStorage.getItem("studentEmail"); // Use correct key
        if (loggedInEmail) {
            setEmail(loggedInEmail);
            fetchAssignments(loggedInEmail);
        } else {
            setMessage("User not logged in.");
        }
        fetchTeacherAssignments();
    }, []);
    

    const fetchTeacherAssignments = async () => {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        const userRole = loggedInUser?.role;
        const teacherEmail = loggedInUser?.email;

        try {
            const res = await axios.get("http://localhost:5000/api/teacherAssignments", {
                params: { role: userRole, teacherEmail: userRole === "Teacher" ? teacherEmail : undefined },
            });
            setTeacherAssignments(res.data);
        } catch (error) {
            console.error("Error fetching teacher assignments:", error);
            setMessage("Error fetching teacher assignments.");
        }
    };

    const fetchAssignments = async (email) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/assignments/${email}`);
            setSubmittedAssignments(res.data);
        } catch (error) {
            setMessage("Error fetching assignments.");
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleAssignmentSelect = (assignmentId, assignmentTitle) => {
        // Toggle selection: if the same assignment is clicked again, deselect it
        if (selectedAssignmentId === assignmentId) {
            setSelectedAssignmentId(null);
            setSelectedAssignmentTitle("");
        } else {
            setSelectedAssignmentId(assignmentId);
            setSelectedAssignmentTitle(assignmentTitle);
        }
    };
const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedAssignmentId || !selectedAssignmentTitle) {
        setMessage("Error: No file selected or assignment chosen.");
        return;
    }

    // Get the logged-in user's email from localStorage
    const loggedInUserEmail = localStorage.getItem("studentEmail");

    if (!loggedInUserEmail) {
        setMessage("Error: No email found. Please log in again.");
        return;
    }

    const formData = new FormData();
    formData.append("assignmentFile", file);
    formData.append("assignmentId", selectedAssignmentId);
    formData.append("assignmentTitle", selectedAssignmentTitle);

    try {
        const res = await axios.post("http://localhost:5000/api/submit-assignment", formData, {
            headers: { 
                "Content-Type": "multipart/form-data",
                "User-Email": loggedInUserEmail, // Send email in headers
            },
        });
        setMessage(res.data.message);
        fetchAssignments(loggedInUserEmail);
    } catch (err) {
        console.error("Error uploading assignment:", err);
        setMessage("Error uploading assignment.");
    }
};
    
    return (
        <div className={styles.container}>
            {/* Left Container: Assignments to be Submitted */}
            <div className={styles.leftContainer}>
                <h1>Assignments to Submit</h1>
                {email ? <p>Logged in as: <strong>{email}</strong></p> : <p className={styles.error}>Login required!</p>}

                <h3>Assignments from Teachers</h3>
                {teacherAssignments.length > 0 ? (
                    <ul className={styles.assignmentList}>
                        {teacherAssignments.map((assignment) => (
                            <li key={assignment._id} className={styles.assignmentItem}>
                            <div className={styles.assignmentContent}>
                            📚<strong>{assignment.title}</strong> - {assignment.description} (Due: {assignment.dueDate})
                            </div>

                                <button
                                    className={styles.selectButton}
                                    onClick={() => handleAssignmentSelect(assignment._id, assignment.title)}
                                >
                                    {selectedAssignmentId === assignment._id ? "select" : "Select"}
                                </button>
                                {selectedAssignmentId === assignment._id && (
                                    <div>
                                        <label
                                            htmlFor={`file-upload-${assignment._id}`}
                                            className={styles.fileUploadLabel}
                                        >
                                            📂 Upload
                                        </label>
                                        <input
                                            id={`file-upload-${assignment._id}`}
                                            type="file"
                                            onChange={handleFileChange}
                                            required
                                        />
                                        <button className={styles.submitButton} onClick={handleSubmit}>
                                            Submit
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No assignments posted yet.</p>
                )}
            </div>

            {/* Right Container: Submitted Assignments */}
            <div className={styles.rightContainer}>
                <h1>Submitted Assignments</h1>
                {submittedAssignments.length > 0 ? (
                    <ul className={styles.assignmentList}>
                        {submittedAssignments.map((assignment) => (
                            <li key={assignment._id} className={styles.assignmentItem}>
                                <div className={styles.assignmentContent}>
                                📚<strong>{assignment.assignmentTitle}</strong> - {assignment.fileName}
                                </div>
                                <a href={`http://localhost:5000/api/download/${assignment.fileName}`} download>
                                    <button className={styles.downloadButton}>⬇️</button>
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No assignments submitted yet.</p>
                )}
            </div>
        </div>
    );
};

export default SubmitAssignment;