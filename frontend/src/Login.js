import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Student"); // Default to Student
    const [error, setError] = useState(""); // State for error messages
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            console.log('Attempting login with:', { email, password, role });
            const response = await axios.post('http://localhost:5000/api/login', {
                email,
                password,
                role
            });

            console.log('Login response:', response.data);

            if (response.data.success) {
                // Store user information in localStorage
                localStorage.setItem('userEmail', response.data.email);
                localStorage.setItem('userRole', response.data.role);
                
                if (response.data.role === "Teacher") {
                    localStorage.setItem('teacherEmail', response.data.email);
                    localStorage.setItem('teacherName', response.data.name);
                    localStorage.setItem('teacherId', response.data.id);
                    console.log('Stored teacher info:', {
                        email: response.data.email,
                        name: response.data.name,
                        id: response.data.id
                    });
                } else {
                    // Store student information
                    localStorage.setItem('studentEmail', response.data.email);
                    localStorage.setItem('studentName', response.data.fullName);
                    localStorage.setItem('studentId', response.data.id);
                    localStorage.setItem('studentCourse', response.data.course);
                    console.log('Stored student info:', {
                        email: response.data.email,
                        fullName: response.data.fullName,
                        id: response.data.id,
                        course: response.data.course
                    });
                }

                // Redirect based on role
                if (response.data.role === "Teacher") {
                    navigate('/teacher-dashboard');
                } else {
                    navigate('/student-dashboard');
                }
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
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