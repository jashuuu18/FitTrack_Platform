
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./WorkoutTimer.css";

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} sec`;
  }

  return `${minutes} min ${seconds} sec`;
}

function WorkoutTimer() {
  const [workoutName, setWorkoutName] = useState("My Workout");
  const [category, setCategory] = useState("Cardio");

  const [activeSession, setActiveSession] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [activeResponse, historyResponse] = await Promise.all([
        api.get("/workout-sessions/active"),
        api.get("/workout-sessions/"),
      ]);

      const active = activeResponse.data;

      setActiveSession(active);
      setSessions(historyResponse.data);

      if (active) {
        const startedAt = new Date(active.started_at).getTime();
        const elapsed = Math.max(
          0,
          Math.floor((Date.now() - startedAt) / 1000)
        );

        setElapsedSeconds(elapsed);
        setWorkoutName(active.workout_name);
        setCategory(active.category);
      } else {
        setElapsedSeconds(0);
      }

      setIsPaused(false);
    } catch (err) {
      console.error("Failed to load workout sessions:", err);
      setError(
        err.response?.data?.detail ||
        "Unable to load workout timer data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!activeSession || isPaused) {
      return undefined;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession, isPaused]);

  const startWorkout = async () => {
    if (workoutName.trim().length < 2) {
      setError("Please enter a workout name with at least 2 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await api.post("/workout-sessions/", {
        workout_name: workoutName.trim(),
        category,
      });

      setActiveSession(response.data);
      setElapsedSeconds(0);
      setIsPaused(false);

      setMessage("Your workout has started!");
      await loadHistoryOnly();
    } catch (err) {
      console.error("Failed to start workout:", err);
      setError(
        err.response?.data?.detail ||
        "Unable to start your workout."
      );
    } finally {
      setSaving(false);
    }
  };

  const loadHistoryOnly = async () => {
    try {
      const response = await api.get("/workout-sessions/");
      setSessions(response.data);
    } catch (err) {
      console.error("Unable to refresh workout history:", err);
    }
  };

  const finishWorkout = async () => {
    if (!activeSession || elapsedSeconds < 1) {
      setError("Complete at least one second before finishing.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await api.post(
        `/workout-sessions/${activeSession.id}/finish`,
        {
          duration_seconds: elapsedSeconds,
        }
      );

      setSessions((previous) => [
        response.data,
        ...previous.filter((item) => item.id !== response.data.id),
      ]);

      setActiveSession(null);
      setElapsedSeconds(0);
      setIsPaused(false);

      setMessage("Workout completed and saved successfully!");
    } catch (err) {
      console.error("Failed to finish workout:", err);
      setError(
        err.response?.data?.detail ||
        "Unable to save your workout."
      );
    } finally {
      setSaving(false);
    }
  };

  const pauseWorkout = () => {
    setIsPaused(true);
    setMessage("Workout paused.");
  };

  const resumeWorkout = () => {
    setIsPaused(false);
    setMessage("Workout resumed.");
  };

  if (loading) {
    return (
      <div className="workout-timer-page">
        <div className="timer-loading">Loading workout timer...</div>
      </div>
    );
  }

  return (
    <div className="workout-timer-page">
      <header className="timer-page-header">
        <div>
          <span className="timer-eyebrow">FITNESS TRACKING</span>
          <h1>Workout Timer</h1>
          <p>Start a session, track your time, and save your progress.</p>
        </div>
      </header>

      {error && <div className="timer-alert timer-error">{error}</div>}
      {message && (
        <div className="timer-alert timer-success">{message}</div>
      )}

      <section className="timer-main-card">
        <div className="timer-card-heading">
          <span className="timer-live-icon">⏱️</span>
          <div>
            <h2>{activeSession ? "Workout in Progress" : "Ready to Train?"}</h2>
            <p>
              {activeSession
                ? "Keep moving and track your session."
                : "Choose your workout and start the timer."}
            </p>
          </div>
          {activeSession && (
            <span className={`timer-status ${isPaused ? "paused" : ""}`}>
              {isPaused ? "PAUSED" : "LIVE"}
            </span>
          )}
        </div>

        {!activeSession && (
          <div className="timer-setup">
            <div className="timer-form-group">
              <label htmlFor="workoutName">Workout Name</label>
              <input
                id="workoutName"
                type="text"
                value={workoutName}
                onChange={(event) => setWorkoutName(event.target.value)}
                placeholder="Example: Morning Running"
                maxLength={150}
              />
            </div>

            <div className="timer-form-group">
              <label htmlFor="workoutCategory">Workout Category</label>
              <select
                id="workoutCategory"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="Cardio">Cardio</option>
                <option value="Strength">Strength</option>
                <option value="Yoga">Yoga</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        )}

        {activeSession && (
          <div className="timer-active-details">
            <h3>{activeSession.workout_name}</h3>
            <span>{activeSession.category}</span>
          </div>
        )}

        <div className="timer-display">
          {formatTime(elapsedSeconds)}
        </div>

        <p className="timer-display-caption">
          {isPaused ? "Timer paused" : activeSession ? "Time elapsed" : "Your workout time"}
        </p>

        <div className="timer-controls">
          {!activeSession ? (
            <button
              className="timer-button start"
              onClick={startWorkout}
              disabled={saving}
            >
              {saving ? "Starting..." : "▶ Start Workout"}
            </button>
          ) : (
            <>
              {!isPaused ? (
                <button
                  className="timer-button pause"
                  onClick={pauseWorkout}
                  disabled={saving}
                >
                  Ⅱ Pause
                </button>
              ) : (
                <button
                  className="timer-button resume"
                  onClick={resumeWorkout}
                  disabled={saving}
                >
                  ▶ Resume
                </button>
              )}

              <button
                className="timer-button finish"
                onClick={finishWorkout}
                disabled={saving}
              >
                {saving ? "Saving..." : "■ Finish Workout"}
              </button>
            </>
          )}
        </div>

        {activeSession && (
          <p className="timer-note">
            Your session is saved when you finish it. Paused time is excluded.
          </p>
        )}
      </section>

      <section className="timer-history-section">
        <div className="timer-history-heading">
          <div>
            <h2>Workout Session History</h2>
            <p>Your previously recorded timer sessions.</p>
          </div>
          <span>{sessions.length} Sessions</span>
        </div>

        {sessions.length === 0 ? (
          <div className="timer-empty">
            <span>🏃</span>
            <h3>No workout sessions yet</h3>
            <p>Start your first workout to see your history here.</p>
          </div>
        ) : (
          <div className="timer-history-list">
            {sessions.map((session) => (
              <article className="timer-history-item" key={session.id}>
                <div className="timer-history-icon">💪</div>

                <div className="timer-history-info">
                  <h3>{session.workout_name}</h3>
                  <p>
                    {session.category} ·{" "}
                    {new Date(session.started_at).toLocaleString()}
                  </p>
                </div>

                <div className="timer-history-duration">
                  <strong>
                    {formatDuration(session.duration_seconds)}
                  </strong>
                  <span className={session.status === "completed" ? "completed" : "active"}>
                    {session.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default WorkoutTimer;
