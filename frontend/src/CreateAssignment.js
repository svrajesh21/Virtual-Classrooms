import React, { useState, useEffect } from "react";
import styles from "./createassignment.module.css"; // Correct import

function CreateAssignment() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [teacherEmail, setTeacherEmail] = useState("");

    useEffect(() => {
        const loggedInTeacherEmail = localStorage.getItem("teacherEmail");
        if (loggedInTeacherEmail) {
            setTeacherEmail(loggedInTeacherEmail);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const assignmentData = { title, description, dueDate, teacherEmail };

        try {
            const response = await fetch("http://localhost:5000/api/create-assignment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(assignmentData),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Assignment Created Successfully");
                setTitle("");
                setDescription("");
                setDueDate("");
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Error creating assignment");
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Create Assignment</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.input}
                    required
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={styles.textarea}
                    required
                />
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={styles.input}
                    required
                />
                <button type="submit" className={styles.button}>
                    Create Assignment
                </button>
            </form>
        </div>
    );
}

export default CreateAssignment;