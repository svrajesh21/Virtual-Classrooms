import React, { useState } from "react";
import axios from "axios";
import "./AdminDashboard.css"; // Import CSS

const AdminDashboard = () => {
    const [adminPassword, setAdminPassword] = useState("");
    const [authenticated, setAuthenticated] = useState(false);

    const [name, setName] = useState("");
    const [dob, setDob] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // Error state

    const ADMIN_PASSWORD = "admin123"; // Change this for security

    const handleAdminLogin = () => {
        if (adminPassword === ADMIN_PASSWORD) {
            setAuthenticated(true);
        } else {
            alert("Incorrect password!");
        }
    };

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Password validation regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const handleRegisterTeacher = async (e) => {
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

        try {
            const res = await axios.post("http://localhost:5000/api/register-teacher", {
                name,
                email,
                password,
                dob,
            });
            alert(res.data.message);
            setName("");
            setEmail("");
            setPassword("");
            setDob("");
        } catch (err) {
            alert("Error registering teacher");
        }
    };

    if (!authenticated) {
        return (
            <div className="auth-container">
                <h2>Admin Access</h2>
                <div className="auth-form">
                    <div className="inputBox">
                        <input
                            type="password"
                            placeholder=" "
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            required
                        />
                        <span>Admin Password</span>
                    </div>
                    <button onClick={handleAdminLogin}>Enter Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <h2>Admin Dashboard - Register Teacher</h2>
            <form className="auth-form" onSubmit={handleRegisterTeacher}>
                <div className="inputBox">
                    <input
                        type="text"
                        placeholder=" "
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <span>Teacher Name</span>
                </div>

                <div className="inputBox">
                    <input
                        type="email"
                        placeholder=" "
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <span>Teacher Email</span>
                </div>

                <div className="inputBox">
                    <input
                        type="password"
                        placeholder=" "
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <span>Password</span>
                </div>

                <div className="inputBox">
                    <input
                        type="date"
                        placeholder=" "
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                    />
                    <span>Date of Birth</span>
                </div>

                {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}

                <button type="submit">Register Teacher</button>
            </form>
        </div>
    );
};

export default AdminDashboard;
