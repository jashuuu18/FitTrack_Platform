
import { useCallback, useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import api from "../services/api";
import "./AdvancedAnalytics.css";

const CATEGORY_COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#f59e0b",
  "#16a34a",
  "#ec4899",
  "#8b5cf6",
];

function getDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDefaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return getDateString(date);
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function AdvancedAnalytics() {
  const [startDate, setStartDate] = useState(getDefaultStartDate);
  const [endDate, setEndDate] = useState(() =>
    getDateString(new Date())
  );

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    if (startDate > endDate) {
      setError("Start date cannot be after end date.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/advanced-analytics/", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });

      setAnalytics(response.data);
    } catch (err) {
      console.error("Failed to load advanced analytics:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load analytics. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const summary = analytics?.summary;

  const categoryData = (analytics?.category_breakdown || []).map(
    (item) => ({
      name: item.category,
      value: item.count,
    })
  );

  const dailyData = (analytics?.daily_trends || []).map((item) => ({
    ...item,
    label: item.date.slice(5),
  }));

  const nutritionData = dailyData.filter(
    (item) =>
      item.meal_calories > 0 ||
      item.protein > 0 ||
      item.carbs > 0 ||
      item.fats > 0
  );

  const waterData = dailyData.filter(
    (item) => item.water_ml > 0
  );

  const workoutData = dailyData.filter(
    (item) => item.workouts > 0 || item.calories_burned > 0
  );

  const StatCard = ({ icon, label, value, subtitle }) => (
    <div className="advanced-stat-card">
      <div className="advanced-stat-icon">{icon}</div>
      <div className="advanced-stat-label">{label}</div>
      <h2>{value}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );

  if (loading && !analytics) {
    return (
      <div className="advanced-analytics-page">
        <div className="advanced-loading">
          Loading your advanced analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="advanced-analytics-page">
      <header className="advanced-header">
        <div>
          <span className="advanced-eyebrow">FITTRACK INSIGHTS</span>
          <h1>Advanced Analytics</h1>
          <p>
            Understand your fitness performance with detailed reports
            and visual insights.
          </p>
        </div>

        <div className="advanced-header-icon">📊</div>
      </header>

      <section className="advanced-filter-card">
        <div className="advanced-filter-field">
          <label htmlFor="analyticsStartDate">Start Date</label>
          <input
            id="analyticsStartDate"
            type="date"
            value={startDate}
            max={endDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>

        <div className="advanced-filter-field">
          <label htmlFor="analyticsEndDate">End Date</label>
          <input
            id="analyticsEndDate"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>

        <button
          className="advanced-filter-button"
          onClick={loadAnalytics}
          disabled={loading}
        >
          {loading ? "Loading..." : "Apply Date Filter"}
        </button>
      </section>

      {error && (
        <div className="advanced-error">
          {error}
          <button onClick={loadAnalytics}>Retry</button>
        </div>
      )}

      {analytics && summary && (
        <>
          <section className="advanced-section">
            <div className="advanced-section-heading">
              <h2>Fitness Overview</h2>
              <p>Key performance indicators for your selected period.</p>
            </div>

            <div className="advanced-stats-grid">
              <StatCard
                icon="🏋️"
                label="Total Workouts"
                value={formatNumber(summary.total_workouts)}
                subtitle={`${formatNumber(summary.total_workout_minutes)} minutes`}
              />

              <StatCard
                icon="🔥"
                label="Calories Burned"
                value={formatNumber(summary.total_calories_burned)}
                subtitle="From recorded workouts"
              />

              <StatCard
                icon="🥗"
                label="Meal Calories"
                value={formatNumber(summary.total_meal_calories)}
                subtitle="Recorded food intake"
              />

              <StatCard
                icon="💧"
                label="Water Intake"
                value={`${formatNumber(summary.total_water_ml)} ml`}
                subtitle="Total recorded hydration"
              />

              <StatCard
                icon="🎯"
                label="Completed Goals"
                value={`${summary.completed_goals}/${summary.total_goals}`}
                subtitle={`${formatNumber(summary.average_goal_progress)}% average progress`}
              />

              <StatCard
                icon="🔥"
                label="Current Streak"
                value={`${summary.current_streak} days`}
                subtitle={`Longest: ${summary.longest_streak} days`}
              />
            </div>
          </section>

          <section className="advanced-section">
            <div className="advanced-section-heading">
              <h2>Workout Performance</h2>
              <p>Daily workout frequency and calories burned.</p>
            </div>

            <div className="advanced-chart-grid">
              <div className="advanced-chart-card">
                <h3>Daily Workouts</h3>

                {workoutData.length === 0 ? (
                  <div className="advanced-no-data">
                    No workout data for this period.
                  </div>
                ) : (
                  <div className="advanced-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar
                          dataKey="workouts"
                          name="Workouts"
                          fill="#4f46e5"
                          radius={[5, 5, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="advanced-chart-card">
                <h3>Workout Calories Burned</h3>

                {workoutData.length === 0 ? (
                  <div className="advanced-no-data">
                    No calorie data for this period.
                  </div>
                ) : (
                  <div className="advanced-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="calories_burned"
                          name="Calories"
                          stroke="#f97316"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="advanced-section">
            <div className="advanced-section-heading">
              <h2>Workout Category Distribution</h2>
              <p>Understand which workout categories you practice.</p>
            </div>

            <div className="advanced-chart-card advanced-pie-card">
              {categoryData.length === 0 ? (
                <div className="advanced-no-data">
                  No workout categories recorded.
                </div>
              ) : (
                <div className="advanced-pie-layout">
                  <div className="advanced-pie-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label
                        >
                          {categoryData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={
                                CATEGORY_COLORS[
                                  index % CATEGORY_COLORS.length
                                ]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="advanced-category-list">
                    {categoryData.map((item, index) => (
                      <div
                        className="advanced-category-item"
                        key={item.name}
                      >
                        <span
                          className="advanced-category-dot"
                          style={{
                            background:
                              CATEGORY_COLORS[
                                index % CATEGORY_COLORS.length
                              ],
                          }}
                        />
                        <span>{item.name}</span>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="advanced-section">
            <div className="advanced-section-heading">
              <h2>Nutrition Analytics</h2>
              <p>Track your daily calorie and macronutrient intake.</p>
            </div>

            <div className="advanced-stats-grid nutrition-stats">
              <StatCard
                icon="🥩"
                label="Protein"
                value={`${formatNumber(summary.total_protein)} g`}
              />
              <StatCard
                icon="🍚"
                label="Carbohydrates"
                value={`${formatNumber(summary.total_carbs)} g`}
              />
              <StatCard
                icon="🥑"
                label="Fats"
                value={`${formatNumber(summary.total_fats)} g`}
              />
            </div>

            <div className="advanced-chart-card">
              <h3>Daily Nutrition Trends</h3>

              {nutritionData.length === 0 ? (
                <div className="advanced-no-data">
                  No nutrition records for this period.
                </div>
              ) : (
                <div className="advanced-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="protein"
                        name="Protein (g)"
                        stroke="#16a34a"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="carbs"
                        name="Carbs (g)"
                        stroke="#eab308"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="fats"
                        name="Fats (g)"
                        stroke="#ec4899"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>

          <section className="advanced-section">
            <div className="advanced-section-heading">
              <h2>Hydration Analytics</h2>
              <p>Your daily recorded water intake.</p>
            </div>

            <div className="advanced-chart-card">
              <h3>Daily Water Intake (ml)</h3>

              {waterData.length === 0 ? (
                <div className="advanced-no-data">
                  No water intake records for this period.
                </div>
              ) : (
                <div className="advanced-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="water_ml"
                        name="Water (ml)"
                        fill="#06b6d4"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>

          <section className="advanced-section">
            <div className="advanced-section-heading">
              <h2>Goals and External Activities</h2>
              <p>Additional progress from your fitness records.</p>
            </div>

            <div className="advanced-stats-grid">
              <StatCard
                icon="🎯"
                label="Active Goals"
                value={formatNumber(summary.active_goals)}
              />

              <StatCard
                icon="📈"
                label="Average Goal Progress"
                value={`${formatNumber(summary.average_goal_progress)}%`}
              />

              <StatCard
                icon="🔗"
                label="Imported Activities"
                value={formatNumber(summary.total_imported_activities)}
              />

              <StatCard
                icon="👣"
                label="Imported Steps"
                value={formatNumber(summary.imported_steps)}
              />
            </div>
          </section>

          <div className="advanced-date-note">
            Showing analytics from{" "}
            <strong>{analytics.date_range.start_date}</strong> to{" "}
            <strong>{analytics.date_range.end_date}</strong>.
            Imported activity calories are reported separately from
            workout calories to avoid double counting.
          </div>
        </>
      )}
    </div>
  );
}

export default AdvancedAnalytics;
