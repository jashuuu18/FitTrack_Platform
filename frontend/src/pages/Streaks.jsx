import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./Streaks.css";

export default function Streaks() {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStreak = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/streaks/me");
      setStreak(response.data);
    } catch (err) {
      console.error("Streak loading error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load your streak information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  if (loading) {
    return (
      <div className="streak-page">
        <p>Loading your streak...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="streak-page">
        <h1>Streak Tracking</h1>
        <p className="streak-error">{error}</p>
        <button onClick={loadStreak}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="streak-page">
      <div className="streak-header">
        <div>
          <h1>Streak Tracking</h1>
          <p>Build consistency, one workout day at a time.</p>
        </div>

        <div className="streak-header-icon">🔥</div>
      </div>

      <div className="streak-highlight">
        <div className="streak-flame">🔥</div>
        <p className="streak-label">CURRENT STREAK</p>

        <h2>
          {streak?.current_streak ?? 0}
          <span> days</span>
        </h2>

        <p>{streak?.message}</p>
      </div>

      <div className="streak-stats">
        <div className="streak-card">
          <div className="streak-card-icon">🔥</div>
          <p>Current Streak</p>
          <h2>{streak?.current_streak ?? 0} days</h2>
          <small>Your consecutive workout days</small>
        </div>

        <div className="streak-card">
          <div className="streak-card-icon">🏆</div>
          <p>Longest Streak</p>
          <h2>{streak?.longest_streak ?? 0} days</h2>
          <small>Your personal best</small>
        </div>

        <div className="streak-card">
          <div className="streak-card-icon">📅</div>
          <p>Last Workout</p>
          <h2 className="streak-date">
            {streak?.last_workout_date
              ? new Date(
                  `${streak.last_workout_date}T00:00:00`
                ).toLocaleDateString()
              : "No workouts"}
          </h2>
          <small>Most recent recorded workout date</small>
        </div>
      </div>

      <div className="streak-tips">
        <h3>Tips to Maintain Your Streak</h3>

        <ul>
          <li>Schedule a workout at a convenient time each day.</li>
          <li>Choose manageable activities to stay consistent.</li>
          <li>Record your workout after completing it.</li>
          <li>Focus on consistency rather than workout duration.</li>
        </ul>
      </div>

      <button className="streak-refresh" onClick={loadStreak}>
        Refresh Streak
      </button>
    </div>
  );
}