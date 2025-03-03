import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const Signup = () => {
    const [fullName, setFullName] = useState("");
    const [dob, setDob] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [course, setCourse] = useState("Computer Science");
    const [error, setError] = useState(""); // Error state
    const navigate = useNavigate();

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Password validation regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Email validation
        if (!emailRegex.test(email)) {
            setError("Invalid email format.");
            return;
        }

        // Password validation
        if (!passwordRegex.test(password)) {
            setError("Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.");
            return;
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/api/signup", { 
                fullName, dob, email, password, course, role: "student" 
            });
            alert(res.data.message);
            navigate("/login");
        } catch (err) {
            alert("Error registering user");
        }
    };

    return (
        <div className="signup-container">
            <h2>Student Signup</h2>
            <form className="signup-form" onSubmit={handleSubmit}>
                <div className="inputBox">
                    <input 
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        required 
                        placeholder=" " 
                    />
                    <span>Full Name</span>
                </div>

                <div className="inputBox">
                    <label className="dob-label">Date of Birth</label>
                    <input 
                        type="date" 
                        value={dob} 
                        onChange={(e) => setDob(e.target.value)} 
                        required 
                    />
                </div>

                <div className="inputBox">
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        placeholder=" " 
                    />
                    <span>Email</span>
                </div>

                <div className="inputBox">
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        placeholder=" " 
                    />
                    <span>Password</span>
                </div>

                <div className="inputBox">
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                        placeholder=" " 
                    />
                    <span>Confirm Password</span>
                </div>

                <div className="inputBox">
                    <select value={course} onChange={(e) => setCourse(e.target.value)} required>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Engineering">Engineering</option>
                    </select>
                    <span>Course</span>
                </div>

                {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}

                <button type="submit">Signup</button>
            </form>
        </div>
    );
};

export default Signup;
