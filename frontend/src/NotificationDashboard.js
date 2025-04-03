import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './NotificationDashboard.css';

const NotificationDashboard = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/notifications');
            setNotifications(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Error loading notifications');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`);
            setNotifications(notifications.map(notification => 
                notification._id === notificationId 
                    ? { ...notification, read: true }
                    : notification
            ));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification._id);
        
        // Handle redirection based on notification type
        switch(notification.type) {
            case 'ASSIGNMENT':
                navigate('/submit-assignment');
                break;
            case 'VIDEO':
                navigate('/recorded-classes');
                break;
            case 'ANNOUNCEMENT':
                // You can add specific announcement page if needed
                // or leave it as is if it doesn't need redirection
                break;
            default:
                // Default action if needed
                break;
        }
        
        // Fallback to notification.link if provided
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const getNotificationIcon = (type) => {
        switch(type) {
            case 'ASSIGNMENT':
                return '📝';
            case 'VIDEO':
                return '🎥';
            case 'ANNOUNCEMENT':
                return '📢';
            default:
                return '🔔';
        }
    };

    const getNotificationTitle = (type, data) => {
        switch(type) {
            case 'ASSIGNMENT':
                return `New Assignment: ${data.title}`;
            case 'VIDEO':
                return `New Video: ${data.title}`;
            case 'ANNOUNCEMENT':
                return `Announcement: ${data.title}`;
            default:
                return 'New Notification';
        }
    };

    const getNotificationMessage = (type, data) => {
        switch(type) {
            case 'ASSIGNMENT':
                return `Due: ${new Date(data.dueDate).toLocaleDateString()}`;
            case 'VIDEO':
                return `Posted by ${data.teacherName}`;
            case 'ANNOUNCEMENT':
                return data.message;
            default:
                return 'Check it out!';
        }
    };

    if (loading) return <div className="loading">Loading notifications...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="notification-dashboard">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
                <div className="no-notifications">No notifications yet</div>
            ) : (
                <div className="notifications-list">
                    {notifications.map((notification) => (
                        <div 
                            key={notification._id} 
                            className={`notification-card ${notification.read ? 'read' : 'unread'}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="notification-icon">
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div className="notification-content">
                                <div className="notification-title">
                                    {getNotificationTitle(notification.type, notification.data)}
                                </div>
                                <div className="notification-message">
                                    {getNotificationMessage(notification.type, notification.data)}
                                </div>
                                <div className="notification-time">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationDashboard;