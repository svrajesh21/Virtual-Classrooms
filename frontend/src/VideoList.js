import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./VideoList.css"; // Add styles as needed

const VideoList = () => {
    const [videos, setVideos] = useState([]);
    const [attendance, setAttendance] = useState({});
    const teacherId = localStorage.getItem("teacherId"); // Retrieve teacherId from localStorage
    const navigate = useNavigate();

    // Fetch videos uploaded by the teacher
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/videos");
                // Filter videos by teacherId
                const teacherVideos = response.data.filter(video => video.teacherId === teacherId);
                setVideos(teacherVideos);
            } catch (error) {
                console.error("Error fetching videos:", error);
            }
        };
        fetchVideos();
    }, [teacherId]);

    // Fetch attendance for a specific video
    const fetchAttendance = async (videoId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/attendance/video/${videoId}`);
            setAttendance((prev) => ({ ...prev, [videoId]: response.data }));
        } catch (error) {
            console.error("Error fetching attendance:", error);
        }
    };

    return (
        <div className="video-list-container">
            <h1>Your Uploaded Videos</h1>
            <button onClick={() => navigate("/teacher-dashboard")} className="back-button">
                Back to Dashboard
            </button>
            <div className="videos-grid">
                {videos.map((video) => (
                    <div key={video._id} className="video-card">
                        <h3>{video.title}</h3>
                        <iframe
                            width="100%"
                            height="200"
                            src={`https://www.youtube.com/embed/${video.url.split("v=")[1]}`}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                        <button onClick={() => fetchAttendance(video._id)} className="attendance-button">
                            Show Attendance
                        </button>
                        {attendance[video._id] && (
                            <div className="attendance-list">
                                <h4>Attendance:</h4>
                                <ul>
                                    {attendance[video._id].map((record, index) => (
                                        <li key={index}>{record.studentEmail}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoList;