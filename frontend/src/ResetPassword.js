import React, { useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (newPassword !== confirmPassword) {
            return setError("Passwords do not match.");
        }
    
        try {
            console.log(token);
            const res = await axios.post("http://localhost:5000/api/reset-password", { token, newPassword });
            setMessage(res.data.message);
            setError("");
        } catch (err) {
            console.error("Error resetting password:", err.response?.data || err.message);
            setError("Error resetting password. Please try again.");
            setMessage("");
        }
    };

    return (
        <div className="auth-container">
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="inputBox">
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder=" "
                    />
                    <span>New Password</span>
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
                <button type="submit">Reset Password</button>
                {message && <p style={{ color: "green" }}>{message}</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
        </div>
    );
};

export default ResetPassword;