import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Attendance.css"

const Attendance = () => {
    const [videos, setVideos] = useState([]); // List of all videos (classes)
    const [attendance, setAttendance] = useState({}); // Attendance status for each video
    const studentEmail = localStorage.getItem("studentEmail");

    // Fetch all videos (classes)
    useEffect(() => {
        fetchVideos();
    }, []);

    // Fetch attendance status for the student
    useEffect(() => {
        if (studentEmail) {
            fetchAttendance();
        }
    }, [studentEmail]);

    const fetchVideos = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/videos");
            setVideos(response.data);
        } catch (error) {
            console.error("Error fetching videos:", error);
            alert("Failed to fetch videos. Please try again.");
        }
    };

    const fetchAttendance = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/attendance/student/${studentEmail}`);
            const attendanceData = response.data;

            // Create a map of videoId to attendance status
            const attendanceMap = {};
            attendanceData.forEach((record) => {
                attendanceMap[record.videoId] = "Present";
            });

            setAttendance(attendanceMap);
        } catch (error) {
            console.error("Error fetching attendance:", error);
            alert("Failed to fetch attendance. Please try again.");
        }
    };

    return (
        <div className="student-dashboard">
            <h1>My Classes</h1>
            <div className="video-list">
                {videos.map((video) => (
                    <div key={video._id} className="video-card">
                        <h3>{video.title}</h3>
                        <p>Teacher:{video.teacherName}</p>
                        <p>
                            Attendance:{" "}
                            <span
                                className={
                                    attendance[video._id] ? "attendance-present" : "attendance-absent"
                                }
                            >
                                {attendance[video._id] || "Absent"}
                            </span>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Attendance;