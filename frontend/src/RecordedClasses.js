import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./RecordedClasses.css";

const RecordedClasses = () => {
    const [videos, setVideos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/videos");
            console.log("Videos response:", response.data); // Log the response
            setVideos(response.data);
        } catch (error) {
            console.error("Error fetching videos:", error);
        }
    };

    const handleVideoClick = (videoId) => {
        navigate(`/video-player/${videoId}`);
    };

    return (
        <div className="recorded-classes-container">
    <h2>Recorded Classes</h2>
    <div className="video-grid">
        {videos.map((video) => (
            <div
                key={video._id}
                className="video-box"
                onClick={() => handleVideoClick(video._id)}
            >
                <span className="video-title">{video.title}</span>
                {video.teacherName && (
                    <span className="teacher-name">Uploaded by {video.teacherName}</span>
                )}
            </div>
        ))}
    </div>
</div>
    );
};

export default RecordedClasses;