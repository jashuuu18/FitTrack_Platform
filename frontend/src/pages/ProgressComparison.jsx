import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./ProgressComparison.css";

const formatChange = (value) => {
  if (value === null || value === undefined) {
    return "No previous data";
  }

  if (value > 0) return `↑ ${value}%`;
  if (value < 0) return `↓ ${Math.abs(value)}%`;

  return "No change";
};

function StatCard({ title, current, previous, change, unit }) {
  return (
    <div className="comparison-stat-card">
      <p className="comparison-stat-title">{title}</p>

      <h2>
        {current} <span>{unit}</span>
      </h2>

      <p className="comparison-previous">
        Previous period: {previous} {unit}
      </p>

      <p className="comparison-change">
        {formatChange(change)}
      </p>
    </div>
  );
}

function DailyChart({ current, previous }) {
  const maximum = Math.max(
    1,
    ...current.daily.map((item) => item.calories),
    ...previous.daily.map((item) => item.calories)
  );

  return (
    <div className="comparison-chart">
      <h3>Daily Calories Comparison</h3>

      <div className="comparison-legend">
        <span>
          <i className="legend-current" /> Selected period
        </span>
        <span>
          <i className="legend-previous" /> Previous period
        </span>
      </div>

      <div className="comparison-bars">
        {current.daily.map((day, index) => {
          const previousDay = previous.daily[index];

          const currentHeight = (day.calories / maximum) * 100;
          const previousHeight =
            ((previousDay?.calories || 0) / maximum) * 100;

          return (
            <div className="comparison-day" key={day.date}>
              <div className="comparison-bar-group">
                <div className="comparison-bar-column">
                  <span>{day.calories}</span>
                  <div
                    className="comparison-bar current-bar"
                    style={{ height: `${Math.max(currentHeight, 2)}%` }}
                  />
                </div>

                <div className="comparison-bar-column">
                  <span>{previousDay?.calories || 0}</span>
                  <div
                    className="comparison-bar previous-bar"
                    style={{
                      height: `${Math.max(previousHeight, 2)}%`
                    }}
                  />
                </div>
              </div>

              <small>
                {new Date(`${day.date}T00:00:00`).toLocaleDateString(
                  undefined,
                  { weekday: "short", day: "numeric" }
                )}
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProgressComparison() {
  const [period, setPeriod] = useState("weekly");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadComparison = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/progress-comparison/${period}`
      );

      setData(response.data);
    } catch (err) {
      console.error("Progress comparison error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load progress comparison."
      );
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadComparison();
  }, [loadComparison]);

  if (loading) {
    return (
      <div className="comparison-page">
        <p>Loading progress comparison...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comparison-page">
        <h2>Progress Comparison</h2>
        <p className="comparison-error">{error}</p>
        <button onClick={loadComparison}>Try Again</button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="comparison-page">
        <p>No comparison data available.</p>
      </div>
    );
  }

  const { current, previous, change } = data;

  return (
    <div className="comparison-page">
      <div className="comparison-header">
        <div>
          <h1>Progress Comparison</h1>
          <p>Track your fitness improvement over time.</p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          aria-label="Comparison period"
        >
          <option value="weekly">Weekly Comparison</option>
          <option value="monthly">Monthly Comparison</option>
        </select>
      </div>

      <div className="comparison-periods">
        <div>
          <strong>Selected period</strong>
          <p>{current.start_date} to {current.end_date}</p>
        </div>

        <div>
          <strong>Previous period</strong>
          <p>{previous.start_date} to {previous.end_date}</p>
        </div>
      </div>

      <div className="comparison-stat-grid">
        <StatCard
          title="Total Workouts"
          current={current.total_workouts}
          previous={previous.total_workouts}
          change={change.workouts}
          unit="workouts"
        />

        <StatCard
          title="Calories Burned"
          current={current.total_calories}
          previous={previous.total_calories}
          change={change.calories}
          unit="kcal"
        />

        <StatCard
          title="Workout Duration"
          current={current.total_duration}
          previous={previous.total_duration}
          change={change.duration}
          unit="minutes"
        />
      </div>

      <DailyChart current={current} previous={previous} />

      <div className="comparison-insight">
        <h3>Your Progress Insight</h3>

        {current.total_workouts > previous.total_workouts ? (
          <p>
            Great work! You completed more workouts in the selected
            period than in the previous period.
          </p>
        ) : current.total_workouts < previous.total_workouts ? (
          <p>
            Your workout count decreased. Try setting a manageable
            workout schedule for the next period.
          </p>
        ) : current.total_workouts === 0 ? (
          <p>
            No workouts have been recorded in this period yet.
            Add a workout to start tracking your progress.
          </p>
        ) : (
          <p>
            You matched your previous workout count. Keep building
            your consistency!
          </p>
        )}
      </div>
    </div>
  );
}