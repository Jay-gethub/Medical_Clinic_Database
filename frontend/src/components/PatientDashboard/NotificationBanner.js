import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/NotificationBanner.css';

const NotificationBanner = ({ patientId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // FIXED: Added await and assigned to res
        const res = await axios.get(`http://localhost:5000/api/patient/${patientId}/notifications`);
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [patientId]);

  const dismissNotifications = async () => {
    try {
      const ids = notifications.map(n => n.notification_id);
      await axios.put(`http://localhost:5000/api/patient/notifications/mark-seen`, {
        notificationIds: ids,
      });
      setNotifications([]);
    } catch (err) {
      console.error('Failed to dismiss notifications', err);
    }
  };

  if (!notifications.length) return null;

  return (
    <div className="notification-banner">
      <div className="notification-header">
        <strong>🔔 You have {notifications.length} new notification{notifications.length > 1 ? 's' : ''}:</strong>
        <button className="dismiss-btn" onClick={dismissNotifications}>Dismiss</button>
      </div>
      <ul>
        {notifications.map(n => (
          <li key={n.notification_id}>{n.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationBanner;
