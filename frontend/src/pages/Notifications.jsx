
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      setError("");

      const [notificationResponse, countResponse] = await Promise.all([
        api.get("/notifications/"),
        api.get("/notifications/unread-count"),
      ]);

      setNotifications(notificationResponse.data);
      setUnreadCount(countResponse.data.unread_count);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError(
        err.response?.data?.detail || "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      await loadNotifications();
    } catch (err) {
      alert(err.response?.data?.detail || "Unable to mark as read.");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      await loadNotifications();
    } catch (err) {
      alert("Unable to mark all notifications as read.");
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      await api.delete(`/notifications/${id}`);
      await loadNotifications();
    } catch (err) {
      alert(err.response?.data?.detail || "Unable to delete notification.");
    }
  };

  if (loading) {
    return <div className="notifications-loading">Loading notifications...</div>;
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your fitness activities.</p>
        </div>

        <button
          className="notification-refresh-btn"
          onClick={loadNotifications}
        >
          Refresh
        </button>
      </div>

      <div className="notification-summary">
        <div className="notification-summary-card">
          <span>Total Notifications</span>
          <h2>{notifications.length}</h2>
        </div>

        <div className="notification-summary-card unread-summary">
          <span>Unread Notifications</span>
          <h2>{unreadCount}</h2>
        </div>
      </div>

      {error && <div className="notification-error">{error}</div>}

      <div className="notification-list-header">
        <h2>Your Notifications</h2>

        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="mark-all-btn"
        >
          Mark All as Read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="notification-empty">
          <h3>No Notifications Yet</h3>
          <p>You're all caught up! New updates will appear here.</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${
                notification.is_read ? "read" : "unread"
              }`}
            >
              <div className="notification-content">
                <div className="notification-title-row">
                  <h3>{notification.title}</h3>

                  {!notification.is_read && (
                    <span className="unread-badge">New</span>
                  )}
                </div>

                <p>{notification.message}</p>

                <small>
                  {new Date(notification.created_at).toLocaleString("en-IN")}
                </small>
              </div>

              <div className="notification-actions">
                {!notification.is_read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="mark-read-btn"
                  >
                    Mark Read
                  </button>
                )}

                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="delete-notification-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
