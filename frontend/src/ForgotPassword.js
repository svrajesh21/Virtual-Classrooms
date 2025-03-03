import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            return setError("Please enter your email address.");
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            return setError("Please enter a valid email address.");
        }

        setLoading(true); // Start loading
        setError("");
        setMessage("");

        try {
            const res = await axios.post("http://localhost:5000/api/forgot-password", { email });
            setMessage(res.data.message);
            setTimeout(() => {
                setMessage("");
            }, 5000); // Clear message after 5 seconds
        } catch (err) {
            console.error("Error sending reset link:", err);
            if (err.response && err.response.data.message) {
                setError(err.response.data.message); // Display backend error message
            } else {
                setError("Error sending reset link. Please try again.");
            }
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className="auth-container">
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="inputBox">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (!/\S+@\S+\.\S+/.test(e.target.value)) {
                                setError("Please enter a valid email address.");
                            } else {
                                setError("");
                            }
                        }}
                        required
                        placeholder=" "
                    />
                    <span>Email</span>
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
                {message && <p style={{ color: "green" }}>{message}</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                <p className="toggle-text" onClick={() => navigate("/login")}>
                    Back to Login
                </p>
            </form>
        </div>
    );
};

export default ForgotPassword;