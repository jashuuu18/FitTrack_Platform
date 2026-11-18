
import { useEffect, useState } from "react";
import api from "../services/api";
import "./DietNotifications.css";

function DietNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setError("");

      const [notificationResponse, countResponse] = await Promise.all([
        api.get("/notifications/"),
        api.get("/notifications/unread-count")
      ]);

      setNotifications(notificationResponse.data);
      setUnreadCount(countResponse.data.unread_count);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      await fetchNotifications();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to update notification."
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      await fetchNotifications();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to mark notifications as read."
      );
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Delete this notification?")) {
      return;
    }

    try {
      await api.delete(`/notifications/${id}`);
      await fetchNotifications();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to delete notification."
      );
    }
  };

  const formatDate = (value) => {
    return new Date(value).toLocaleString();
  };

  return (
    <div className="diet-notifications-page">
      <header className="diet-notifications-header">
        <div>
          <span>FITTRACK NUTRITION</span>
          <h1>Notifications</h1>
          <p>Stay updated with your fitness and nutrition activities.</p>
        </div>

        <div className="diet-notification-count">
          <strong>{unreadCount}</strong>
          <span>Unread</span>
        </div>
      </header>

      {error && (
        <div className="diet-notification-error">{error}</div>
      )}

      <section className="diet-notification-card">
        <div className="diet-notification-toolbar">
          <div>
            <h2>Your Notifications</h2>
            <p>
              {notifications.length} total notifications
            </p>
          </div>

          <div className="diet-notification-actions">
            <button
              type="button"
              onClick={fetchNotifications}
              className="diet-notification-refresh"
            >
              ↻ Refresh
            </button>

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="diet-notification-read-all"
            >
              Mark all as read
            </button>
          </div>
        </div>

        {loading ? (
          <div className="diet-notification-empty">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="diet-notification-empty">
            <span>🔔</span>
            <h3>No notifications yet</h3>
            <p>Your reminders and important updates will appear here.</p>
          </div>
        ) : (
          <div className="diet-notification-list">
            {notifications.map((notification) => (
              <article
                className={`diet-notification-item ${
                  notification.is_read ? "read" : "unread"
                }`}
                key={notification.id}
              >
                <div className="diet-notification-icon">
                  🔔
                </div>

                <div className="diet-notification-content">
                  <div className="diet-notification-title-row">
                    <h3>{notification.title}</h3>

                    {!notification.is_read && (
                      <span className="diet-notification-new">
                        New
                      </span>
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <small>
                    {formatDate(notification.created_at)}
                  </small>
                </div>

                <div className="diet-notification-item-actions">
                  {!notification.is_read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </button>
                  )}

                  <button
                    type="button"
                    className="diet-notification-delete"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DietNotifications;
