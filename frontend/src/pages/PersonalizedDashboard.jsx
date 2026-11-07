
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./PersonalizedDashboard.css";

function PersonalizedDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/personalized-dashboard/"
      );

      setDashboard(response.data);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load personalized dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <div className="pd-loading">Loading your dashboard...</div>;
  }

  if (error) {
    return (
      <div className="pd-error">
        <p>{error}</p>
        <button onClick={loadDashboard}>Try Again</button>
      </div>
    );
  }

  if (!dashboard) return null;

  const summary = dashboard.workout_summary;
  const today = dashboard.today_summary;
  const streak = dashboard.streak;

  return (
    <div className="personal-dashboard">

      <div className="pd-header">
        <div>
          <h1>Welcome, {dashboard.user.username}!</h1>
          <p>Here is your personal fitness overview.</p>
        </div>

        <button onClick={loadDashboard}>
          Refresh
        </button>
      </div>

      {/* Workout statistics */}
      <div className="pd-stats-grid">

        <div className="pd-stat-card">
          <span>🏋️</span>
          <h3>Total Workouts</h3>
          <strong>{summary.total_workouts}</strong>
        </div>

        <div className="pd-stat-card">
          <span>🔥</span>
          <h3>Calories Burned</h3>
          <strong>{summary.total_calories}</strong>
        </div>

        <div className="pd-stat-card">
          <span>⏱️</span>
          <h3>Total Duration</h3>
          <strong>{summary.total_duration} min</strong>
        </div>

        <div className="pd-stat-card">
          <span>⚡</span>
          <h3>Current Streak</h3>
          <strong>{streak.current_streak} days</strong>
        </div>

      </div>

      {/* Today's activity */}
      <section className="pd-section">
        <h2>Today's Activity</h2>

        <div className="pd-today-card">
          <p>Workouts completed: <strong>{today.workouts}</strong></p>
          <p>Calories burned: <strong>{today.calories}</strong></p>
        </div>
      </section>

      {/* Streak */}
      <section className="pd-section">
        <h2>Streak Performance</h2>

        <div className="pd-streak-card">
          <div>
            <h3>🔥 Current Streak</h3>
            <strong>{streak.current_streak} days</strong>
          </div>

          <div>
            <h3>🏆 Longest Streak</h3>
            <strong>{streak.longest_streak} days</strong>
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="pd-section">
        <h2>My Fitness Goals</h2>

        {dashboard.goals.length === 0 ? (
          <p className="pd-empty">No fitness goals available.</p>
        ) : (
          <div className="pd-list">
            {dashboard.goals.map((goal) => (
              <div className="pd-item" key={goal.id}>
                <h3>{goal.goal_type}</h3>

                <p>
                  {goal.current_value} / {goal.target_value}
                </p>

                <div className="pd-progress-track">
                  <div
                    className="pd-progress-fill"
                    style={{
                      width: `${goal.progress_percentage}%`
                    }}
                  />
                </div>

                <small>
                  {goal.progress_percentage}% completed
                </small>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming workouts */}
      <section className="pd-section">
        <h2>Upcoming Workouts</h2>

        {dashboard.upcoming_workouts.length === 0 ? (
          <p className="pd-empty">No upcoming workouts scheduled.</p>
        ) : (
          <div className="pd-list">
            {dashboard.upcoming_workouts.map((workout) => (
              <div className="pd-item" key={workout.id}>
                <h3>{workout.title}</h3>
                <p>{workout.description || "No description"}</p>
                <small>
                  Scheduled: {workout.scheduled_date}
                </small>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Badges */}
      <section className="pd-section">
        <h2>Recent Achievements</h2>

        {dashboard.earned_badges.length === 0 ? (
          <p className="pd-empty">No badges earned yet. Keep going!</p>
        ) : (
          <div className="pd-badges">
            {dashboard.earned_badges.map((badge) => (
              <div className="pd-badge" key={badge.id}>
                <span>{badge.icon}</span>
                <h3>{badge.name}</h3>
                <p>{badge.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Notifications */}
      <section className="pd-section">
        <h2>
          Recent Notifications
          <span className="pd-notification-count">
            {dashboard.notifications.unread_count} unread
          </span>
        </h2>

        {dashboard.notifications.recent.length === 0 ? (
          <p className="pd-empty">No recent notifications.</p>
        ) : (
          <div className="pd-list">
            {dashboard.notifications.recent.map((notification) => (
              <div className="pd-item" key={notification.id}>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <small>
                  {notification.is_read ? "Read" : "Unread"}
                </small>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default PersonalizedDashboard;
