import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UploadClasses.css";

const UploadClasses = () => {
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const teacherName = localStorage.getItem("teacherName");
    const teacherId = localStorage.getItem("teacherId");

    // Function to extract YouTube Video ID
    const extractYouTubeID = (videoUrl) => {
        const regex = /(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*vi=))([^&\n?#]+)/;
        const match = videoUrl.match(regex);
        return match ? match[1] : null;
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !url) {
            setMessage("Please fill in all fields.");
            return;
        }

        const videoId = extractYouTubeID(url);
        if (!videoId) {
            setMessage("Invalid YouTube URL. Please enter a valid link.");
            return;
        }

        const embedUrl = `https://www.youtube.com/embed/${videoId}`;

        try {
            console.log("Uploading:", { title, embedUrl, teacherName, teacherId });

            const response = await axios.post("http://localhost:5000/api/videos", {
                title,
                url: embedUrl, // Store embed URL in DB
                teacherName,
                teacherId,
            });

            if (response.status === 200) {
                setMessage("Video uploaded successfully!");
                setTitle("");
                setUrl("");
            }
        } catch (error) {
            setMessage("Error uploading video. Please try again.");
            console.error("Upload error:", error.response || error);
        }
    };

    return (
        <div className="upload-classes-container">
            <h2>Upload YouTube Class</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label>Video URL (YouTube):</label>
                    <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
                </div>
                <button type="submit">⬆ Upload</button>
            </form>
            {message && <p>{message}</p>}
            <button className="back-button" onClick={() => navigate("/teacher-dashboard")}>Back</button>
        </div>
    );
};

export default UploadClasses;
