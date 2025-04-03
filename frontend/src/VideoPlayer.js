import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./VideoPlayer.css";

const VideoPlayer = () => {
    const { videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [watchProgress, setWatchProgress] = useState(0);
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [player, setPlayer] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [studentName, setStudentName] = useState("");
    const [isChatOpen, setIsChatOpen] = useState(true);
    const messagesEndRef = useRef(null);
    
    const studentEmail = localStorage.getItem("studentEmail");

    // Extract YouTube Video ID
    const extractYouTubeID = (videoUrl) => {
        const regex = /(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*vi=))([^&\n?#]+)/;
        const match = videoUrl.match(regex);
        return match ? match[1] : null;
    };

    // Fetch video details
    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/videos/${videoId}`);
                setVideo(response.data);
            } catch (error) {
                console.error("Error fetching video:", error);
            }
        };
        fetchVideo();
    }, [videoId]);

    // Fetch student name on component mount
    useEffect(() => {
        const fetchStudentName = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/student/${studentEmail}`);
                setStudentName(response.data.fullName);
            } catch (error) {
                console.error("Error fetching student name:", error);
            }
        };
        
        if (studentEmail) {
            fetchStudentName();
        }
    }, [studentEmail]);

    // Fetch chat messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/chat/${videoId}`);
                setMessages(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        
        fetchMessages();
        
        // Set up polling for new messages (every 3 seconds)
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [videoId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle sending a new message
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        
        try {
            const newChatMessage = {
                videoId,
                studentEmail,
                studentName,
                message: newMessage,
                timestamp: new Date().toISOString(),
            };
            
            // Send the message to the server
            await axios.post("http://localhost:5000/api/chat", newChatMessage);
            
            // Update the messages state immediately
            setMessages((prevMessages) => [...prevMessages, newChatMessage]);
            setNewMessage("");
            
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Mark Attendance (memoized with useCallback)
    const markAttendance = useCallback(async () => {
        if (attendanceMarked || watchProgress < 60) return;

        try {
            await axios.post(`http://localhost:5000/api/videos/${videoId}/attendance`, {
                studentEmail,
                watchPercentage: watchProgress,
            });
            setAttendanceMarked(true);
            console.log("Attendance marked successfully");
        } catch (error) {
            console.error("Error marking attendance:", error);
        }
    }, [attendanceMarked, watchProgress, videoId, studentEmail]);

    // Load YouTube API
    useEffect(() => {
        if (!window.YT) {
            const script = document.createElement("script");
            script.src = "https://www.youtube.com/iframe_api";
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                window.onYouTubeIframeAPIReady = () => {
                    const newPlayer = new window.YT.Player("youtube-player", {
                        events: {
                            onStateChange: onPlayerStateChange,
                        },
                    });
                    setPlayer(newPlayer);
                };
            };
        }
    }, []);

    // Track progress
    useEffect(() => {
        if (!player) return;

        const interval = setInterval(() => {
            if (player.getCurrentTime && player.getDuration) {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                const progress = (currentTime / duration) * 100;

                setWatchProgress(progress);

                if (progress >= 60 && !attendanceMarked) {
                    markAttendance();
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [player, attendanceMarked, markAttendance]);

    // Handle YouTube Player State Changes
    const onPlayerStateChange = (event) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            console.log("Video is playing");
        } else if (event.data === window.YT.PlayerState.PAUSED) {
            console.log("Video paused");
        }
    };

    return (
        <div className="video-player-container">
            <div className="video-content">
                <div className="video-header">
                    <h2>{video?.title}</h2>
                    <button 
                        className="toggle-chat-btn"
                        onClick={() => setIsChatOpen(!isChatOpen)}
                    >
                        {isChatOpen ? "Hide Chat" : "Show Chat"}
                    </button>
                </div>
                
                {video?.url ? (
                    <iframe
                        id="youtube-player"
                        width="100%"
                        height="400"
                        src={`https://www.youtube.com/embed/${extractYouTubeID(video.url)}?enablejsapi=1`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube Video Player"
                    ></iframe>
                ) : (
                    <p>Loading video...</p>
                )}
                
                <div className="video-footer">
                    <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${watchProgress}%` }}></div>
                    </div>
                    <div className="progress-text">Watched: {Math.round(watchProgress)}%</div>
                    {attendanceMarked && <div className="attendance-message">✓ Attendance marked</div>}
                </div>
            </div>
            
            {/* Chat Box */}
            {isChatOpen && (
                <div className="chat-box">
                    <div className="chat-header">
                        <h3>Class Discussion</h3>
                        <span className="online-count">{messages.length} messages</span>
                    </div>
                    <div className="messages-container">
                        {messages.length === 0 ? (
                            <div className="no-messages">No messages yet. Be the first to ask a question!</div>
                        ) : (
                            messages.map((msg, index) => (
                                <div 
                                    key={index} 
                                    className={`message ${msg.studentEmail === studentEmail ? "own-message" : ""}`}
                                >
                                    <div className="message-header">
                                        <strong>{msg.studentName}</strong>
                                        <span className="message-time">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="message-content">{msg.message}</div>
                                    {msg.reply && (
                                        <div className="teacher-reply">
                                            <div className="reply-header">
                                                <strong>Teacher: {msg.reply.teacherName}</strong>
                                                <span className="reply-time">
                                                    {new Date(msg.reply.repliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="reply-content">{msg.reply.text}</div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="message-input">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your question..."
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            disabled={!studentName}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || !studentName}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;