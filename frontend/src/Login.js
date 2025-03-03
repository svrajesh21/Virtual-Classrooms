import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Student"); // Default to Student
    const [error, setError] = useState(""); // State for error messages
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Reset error message

        try {
            const res = await axios.post("http://localhost:5000/api/login", { email, password, role });
            alert(res.data.message);
            if (res.data.success) {
                // Save email to localStorage based on role
                localStorage.setItem(`${role.toLowerCase()}Email`, email);

                // Navigate to the appropriate dashboard
                navigate(`/${role.toLowerCase()}-dashboard`);
            }
        } catch (err) {
            setError("Invalid credentials or something went wrong!");
            alert(error); // Display error message
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                {/* Role Selection */}
                <div className="radio-group">
                    <label className="checkbox-container">
                        Student
                        <input
                            type="radio"
                            name="role"
                            value="Student"
                            checked={role === "Student"}
                            onChange={() => setRole("Student")}
                            className="custom-checkbox"
                        />
                        <span className="checkmark"></span>
                    </label>

                    <label className="checkbox-container">
                        Teacher
                        <input
                            type="radio"
                            name="role"
                            value="Teacher"
                            checked={role === "Teacher"}
                            onChange={() => setRole("Teacher")}
                            className="custom-checkbox"
                        />
                        <span className="checkmark"></span>
                    </label>
                </div>

                {/* Email Input */}
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

                {/* Password Input */}
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

                {/* Login Button */}
                <button type="submit">Login</button>

                {/* Toggle Text for Signup and Admin */}
                <p className="toggle-text" onClick={() => navigate("/signup")}>
                    Don't have an account? <b>Sign up</b>
                </p>
                <p className="toggle-text" onClick={() => navigate("/forgot-password")}>
                    Forgot Password? <b>Click here</b>
                </p>
                <p className="toggle-text" onClick={() => navigate("/admin")}>
                    Are you an Admin? <b>Go to Admin Dashboard</b>
                </p>

                {/* Display error message if any */}
                {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}
            </form>
        </div>
    );
};

export default Login;