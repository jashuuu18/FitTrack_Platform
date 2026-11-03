
import { useEffect, useState } from "react";
import api from "../services/api";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#9333ea"];

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
}

function Reports() {
  const now = new Date();

  const [overview, setOverview] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [categories, setCategories] = useState([]);
  const [goalReport, setGoalReport] = useState(null);
  const [calories, setCalories] = useState([]);

  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedDays, setSelectedDays] = useState(7);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        overviewResponse,
        weeklyResponse,
        monthlyResponse,
        categoryResponse,
        goalResponse,
        calorieResponse,
      ] = await Promise.all([
        api.get("/reports/overview"),
        api.get("/reports/weekly"),
        api.get("/reports/monthly", {
          params: {
            year: selectedYear,
            month: selectedMonth,
          },
        }),
        api.get("/reports/categories"),
        api.get("/reports/goals"),
        api.get("/reports/calories", {
          params: { days: selectedDays },
        }),
      ]);

      setOverview(overviewResponse.data);
      setWeekly(weeklyResponse.data);
      setMonthly(monthlyResponse.data);
      setCategories(categoryResponse.data.categories);
      setGoalReport(goalResponse.data);
      setCalories(calorieResponse.data.daily_calories);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load reports. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedYear, selectedMonth, selectedDays]);

  const weeklyChartData = (weekly?.daily_breakdown || []).map(
    (item) => ({
      ...item,
      day: formatDate(item.date),
    })
  );

  const monthlyChartData = (monthly?.daily_breakdown || []).map(
    (item) => ({
      ...item,
      day: formatDate(item.date),
    })
  );

  const calorieChartData = calories.map((item) => ({
    ...item,
    day: formatDate(item.date),
  }));

  const goalChartData = goalReport
    ? [
        {
          name: "Completed",
          value: goalReport.completed_goals,
        },
        {
          name: "In Progress",
          value: goalReport.in_progress_goals,
        },
        {
          name: "Overdue",
          value: goalReport.overdue_goals,
        },
      ].filter((item) => item.value > 0)
    : [];

  if (loading && !overview) {
    return <div className="reports-page">Loading reports...</div>;
  }

  if (error && !overview) {
    return (
      <div className="reports-page">
        <div className="report-alert error">{error}</div>
        <button onClick={loadReports}>Retry</button>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Analyze your fitness activity and track your performance.</p>
        </div>

        <button
          className="report-refresh-button"
          onClick={loadReports}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Reports"}
        </button>
      </div>

      {error && <div className="report-alert error">{error}</div>}

      {/* Overall summary */}
      <section className="report-section">
        <h2>Overall Fitness Summary</h2>

        <div className="report-summary-grid">
          <div className="report-summary-card">
            <span>Total Workouts</span>
            <strong>{overview?.total_workouts ?? 0}</strong>
          </div>

          <div className="report-summary-card">
            <span>Total Calories Burned</span>
            <strong>{overview?.total_calories ?? 0}</strong>
          </div>

          <div className="report-summary-card">
            <span>Total Workout Minutes</span>
            <strong>{overview?.total_duration ?? 0}</strong>
          </div>

          <div className="report-summary-card">
            <span>Goals Completed</span>
            <strong>
              {overview?.completed_goals ?? 0}/
              {overview?.total_goals ?? 0}
            </strong>
          </div>
        </div>
      </section>

      {/* Weekly summary */}
      <section className="report-section">
        <h2>Weekly Summary</h2>

        <div className="report-summary-grid">
          <div className="report-summary-card">
            <span>Weekly Workouts</span>
            <strong>{overview?.weekly_workouts ?? 0}</strong>
          </div>

          <div className="report-summary-card">
            <span>Weekly Calories</span>
            <strong>{overview?.weekly_calories ?? 0}</strong>
          </div>

          <div className="report-summary-card">
            <span>Weekly Duration</span>
            <strong>{overview?.weekly_duration ?? 0} min</strong>
          </div>
        </div>
      </section>

      {/* Weekly calorie chart */}
      <section className="report-section report-chart-card">
        <h2>Weekly Calorie Tracking</h2>
        <p>Calories burned each day over the last seven days.</p>

        <div className="report-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total_calories"
                name="Calories"
                stroke="#2563eb"
                strokeWidth={3}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Monthly report */}
      <section className="report-section report-chart-card">
        <div className="report-filter-header">
          <div>
            <h2>Monthly Workout Report</h2>
            <p>Compare workouts and calories during the selected month.</p>
          </div>

          <div className="report-filters">
            <select
              value={selectedMonth}
              onChange={(event) =>
                setSelectedMonth(Number(event.target.value))
              }
              aria-label="Select month"
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {new Date(2000, index, 1).toLocaleString("en-IN", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(event) =>
                setSelectedYear(Number(event.target.value))
              }
              aria-label="Select year"
            >
              {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2]
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="report-summary-grid report-month-summary">
          <div className="report-summary-card">
            <span>Monthly Workouts</span>
            <strong>{monthly?.total_workouts ?? 0}</strong>
          </div>

          <div className="report-summary-card">
            <span>Monthly Calories</span>
            <strong>{monthly?.total_calories ?? 0}</strong>
          </div>

          <div className="report-summary-card">
            <span>Monthly Duration</span>
            <strong>{monthly?.total_duration ?? 0} min</strong>
          </div>
        </div>

        <div className="report-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="total_workouts"
                name="Workouts"
                fill="#16a34a"
              />
              <Bar
                dataKey="total_calories"
                name="Calories"
                fill="#f59e0b"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Workout categories */}
      <section className="report-section report-two-column">
        <div className="report-chart-card">
          <h2>Workout Category Analysis</h2>
          <p>Distribution of your workout activities.</p>

          {categories.length === 0 ? (
            <p className="report-empty">No workout category data yet.</p>
          ) : (
            <>
              <div className="report-chart report-pie-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="total_workouts"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {categories.map((item, index) => (
                        <Cell
                          key={item.category}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="report-category-list">
                {categories.map((item) => (
                  <div key={item.category}>
                    <strong>{item.category}</strong>
                    <span>
                      {item.total_workouts} workouts ·{" "}
                      {item.total_calories} calories
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="report-chart-card">
          <h2>Goal Progress Analysis</h2>
          <p>See how your fitness goals are progressing.</p>

          {goalReport?.total_goals === 0 ? (
            <p className="report-empty">
              Create goals to see your goal analytics.
            </p>
          ) : (
            <>
              <div className="report-chart report-pie-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={goalChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {goalChartData.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="report-category-list">
                <div>
                  <strong>Total Goals</strong>
                  <span>{goalReport?.total_goals ?? 0}</span>
                </div>
                <div>
                  <strong>Completed</strong>
                  <span>{goalReport?.completed_goals ?? 0}</span>
                </div>
                <div>
                  <strong>In Progress</strong>
                  <span>{goalReport?.in_progress_goals ?? 0}</span>
                </div>
                <div>
                  <strong>Overdue</strong>
                  <span>{goalReport?.overdue_goals ?? 0}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Calorie filter */}
      <section className="report-section report-chart-card">
        <div className="report-filter-header">
          <div>
            <h2>Calorie Burn History</h2>
            <p>View daily calories burned over a selected period.</p>
          </div>

          <select
            value={selectedDays}
            onChange={(event) =>
              setSelectedDays(Number(event.target.value))
            }
            aria-label="Select calorie report period"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        <div className="report-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={calorieChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="total_calories"
                name="Calories Burned"
                fill="#9333ea"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default Reports;
