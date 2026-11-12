
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./AISuggestions.css";

function AISuggestions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/ai-suggestions/");
      setData(response.data);
    } catch (err) {
      console.error("Failed to load workout suggestions:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load workout suggestions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  if (loading) {
    return (
      <div className="ai-suggestions-page">
        <div className="ai-loading">Generating your workout suggestions...</div>
      </div>
    );
  }

  return (
    <div className="ai-suggestions-page">
      <div className="ai-page-header">
        <div>
          <span className="ai-eyebrow">SMART FITNESS</span>
          <h1>AI Workout Suggestions</h1>
          <p>
            Discover workout recommendations based on your fitness activity
            and goals.
          </p>
        </div>

        <button
          className="ai-refresh-button"
          onClick={loadSuggestions}
          disabled={loading}
        >
          ↻ Refresh Suggestions
        </button>
      </div>

      {error && (
        <div className="ai-error">
          {error}
          <button onClick={loadSuggestions}>Try Again</button>
        </div>
      )}

      {data && (
        <>
          <div className="ai-overview-grid">
            <div className="ai-overview-card">
              <span className="ai-card-icon">🎯</span>
              <p>Fitness Focus</p>
              <h2>{data.goal_focus}</h2>
            </div>

            <div className="ai-overview-card">
              <span className="ai-card-icon">🔥</span>
              <p>Current Streak</p>
              <h2>{data.current_streak} Days</h2>
            </div>

            <div className="ai-overview-card">
              <span className="ai-card-icon">🏋️</span>
              <p>Recent Workouts</p>
              <h2>{data.recent_workouts_count}</h2>
              <small>Last 14 days</small>
            </div>
          </div>

          <section className="ai-insight-card">
            <div className="ai-section-heading">
              <span>✨</span>
              <h2>Your Fitness Insights</h2>
            </div>

            <p>{data.reasoning}</p>

            <div className="ai-weekly-tip">
              <strong>💡 Weekly Tip</strong>
              <p>{data.weekly_tip}</p>
            </div>
          </section>

          <section className="ai-recommendations-section">
            <div className="ai-section-heading">
              <div>
                <h2>Recommended Exercises</h2>
                <p>Exercises selected from your FitTrack Exercise Library.</p>
              </div>
            </div>

            {data.recommendations.length === 0 ? (
              <div className="ai-empty-state">
                <span>📚</span>
                <h3>No exercises available</h3>
                <p>
                  Add exercises to your Exercise Library to receive
                  personalized recommendations.
                </p>
              </div>
            ) : (
              <div className="ai-exercise-grid">
                {data.recommendations.map((exercise) => (
                  <article className="ai-exercise-card" key={exercise.id}>
                    <div className="ai-exercise-top">
                      <span className="ai-exercise-icon">
                        {exercise.category?.toLowerCase() === "cardio"
                          ? "🏃"
                          : exercise.category?.toLowerCase() === "strength"
                          ? "🏋️"
                          : "🧘"}
                      </span>

                      <span className="ai-category">
                        {exercise.category}
                      </span>
                    </div>

                    <h3>{exercise.name}</h3>

                    <p className="ai-exercise-description">
                      {exercise.description ||
                        "A recommended exercise for your fitness routine."}
                    </p>

                    <div className="ai-exercise-duration">
                      <span>⏱️</span>
                      <strong>{exercise.duration} minutes</strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="ai-disclaimer">
            <strong>About these suggestions:</strong> FitTrack uses your
            recorded goals, workout history, streak, and exercise library
            with a rule-based recommendation system. Suggestions are general
            fitness guidance, not medical advice.
          </div>
        </>
      )}
    </div>
  );
}

export default AISuggestions;
