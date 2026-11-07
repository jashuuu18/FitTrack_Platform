
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./WorkoutPlans.css";

function dateToString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function WorkoutPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    dateToString(new Date())
  );

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduled_date: dateToString(new Date()),
  });

  const loadPlans = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/workout-plans/");
      setPlans(response.data);
    } catch (err) {
      console.error("Workout plans error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load workout plans."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      scheduled_date: selectedDate,
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        scheduled_date: formData.scheduled_date,
      };

      if (!payload.title) {
        setError("Please enter a workout plan title.");
        return;
      }

      if (editingId) {
        await api.put(
          `/workout-plans/${editingId}`,
          payload
        );
      } else {
        await api.post("/workout-plans/", payload);
      }

      setSelectedDate(payload.scheduled_date);

      const selected = new Date(
        `${payload.scheduled_date}T00:00:00`
      );

      setCurrentMonth(
        new Date(selected.getFullYear(), selected.getMonth(), 1)
      );

      resetForm();
      await loadPlans();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to save workout plan."
      );
    }
  };

  const handleEdit = (plan) => {
    setEditingId(plan.id);

    setFormData({
      title: plan.title,
      description: plan.description || "",
      scheduled_date: plan.scheduled_date,
    });

    setSelectedDate(plan.scheduled_date);

    const selected = new Date(
      `${plan.scheduled_date}T00:00:00`
    );

    setCurrentMonth(
      new Date(selected.getFullYear(), selected.getMonth(), 1)
    );

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this workout plan?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/workout-plans/${id}`);
      await loadPlans();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to delete workout plan."
      );
    }
  };

  const handleAddPlan = () => {
    setEditingId(null);

    setFormData({
      title: "",
      description: "",
      scheduled_date: selectedDate,
    });

    setShowForm(true);
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(dateToString(new Date(year, month, day)));
    }

    return cells;
  }, [currentMonth]);

  const selectedPlans = plans.filter(
    (plan) => plan.scheduled_date === selectedDate
  );

  const upcomingPlans = [...plans]
    .filter((plan) => plan.scheduled_date >= dateToString(new Date()))
    .sort((a, b) =>
      a.scheduled_date.localeCompare(b.scheduled_date)
    );

  const monthName = currentMonth.toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );

  if (loading) {
    return (
      <div className="workout-plans-loading">
        Loading workout plans...
      </div>
    );
  }

  return (
    <div className="workout-plans-page">

      <div className="workout-plans-header">
        <div>
          <h1>Workout Planner</h1>
          <p>Plan and schedule your fitness activities.</p>
        </div>

        <button
          className="add-plan-btn"
          onClick={handleAddPlan}
        >
          + Schedule Workout
        </button>
      </div>

      {error && (
        <div className="workout-plan-error">
          {error}
        </div>
      )}

      <div className="workout-plans-layout">

        {/* CALENDAR */}

        <section className="calendar-section">

          <div className="calendar-header">
            <button onClick={previousMonth}>
              &#8592;
            </button>

            <h2>{monthName}</h2>

            <button onClick={nextMonth}>
              &#8594;
            </button>
          </div>

          <div className="calendar-grid">

            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div className="calendar-weekday" key={day}>
                  {day}
                </div>
              )
            )}

            {calendarDays.map((day, index) => {
              if (!day) {
                return (
                  <div
                    className="calendar-empty"
                    key={`empty-${index}`}
                  />
                );
              }

              const dayPlans = plans.filter(
                (plan) => plan.scheduled_date === day
              );

              const isSelected = selectedDate === day;

              const isToday =
                dateToString(new Date()) === day;

              return (
                <button
                  key={day}
                  className={`calendar-day ${
                    isSelected ? "selected-day" : ""
                  } ${isToday ? "today-day" : ""}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <span>{Number(day.slice(-2))}</span>

                  {dayPlans.length > 0 && (
                    <span className="calendar-plan-indicator">
                      {dayPlans.length} plan
                      {dayPlans.length > 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              );
            })}

          </div>
        </section>

        {/* SELECTED DATE PLANS */}

        <section className="selected-date-section">

          <h2>
            Scheduled Workouts
          </h2>

          <p className="selected-date-label">
            {new Date(
              `${selectedDate}T00:00:00`
            ).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {selectedPlans.length === 0 ? (
            <div className="no-plans">
              <h3>No Workouts Scheduled</h3>
              <p>Schedule a workout for this date.</p>

              <button onClick={handleAddPlan}>
                Create Workout Plan
              </button>
            </div>
          ) : (
            <div className="selected-plan-list">
              {selectedPlans.map((plan) => (
                <div
                  className="workout-plan-card"
                  key={plan.id}
                >
                  <h3>{plan.title}</h3>

                  <p>
                    {plan.description || "No description provided."}
                  </p>

                  <div className="plan-card-actions">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="edit-plan-btn"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="delete-plan-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </section>
      </div>

      {/* UPCOMING WORKOUTS */}

      <section className="upcoming-plans-section">

        <h2>Upcoming Workouts</h2>

        {upcomingPlans.length === 0 ? (
          <p className="no-upcoming-plans">
            No upcoming workouts. Start scheduling your workouts!
          </p>
        ) : (
          <div className="upcoming-plan-list">

            {upcomingPlans.map((plan) => (
              <div
                className="upcoming-plan-card"
                key={plan.id}
              >
                <div>
                  <h3>{plan.title}</h3>

                  <p>
                    {plan.scheduled_date}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedDate(plan.scheduled_date);

                    const selected = new Date(
                      `${plan.scheduled_date}T00:00:00`
                    );

                    setCurrentMonth(
                      new Date(
                        selected.getFullYear(),
                        selected.getMonth(),
                        1
                      )
                    );
                  }}
                >
                  View
                </button>
              </div>
            ))}

          </div>
        )}

      </section>

      {/* CREATE / EDIT FORM */}

      {showForm && (
        <div className="workout-plan-modal-overlay">

          <div className="workout-plan-modal">

            <div className="workout-plan-modal-header">
              <h2>
                {editingId
                  ? "Edit Workout Plan"
                  : "Schedule New Workout"}
              </h2>

              <button
                onClick={resetForm}
                className="close-modal-btn"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <label>Workout Title</label>

              <input
                type="text"
                name="title"
                placeholder="Example: Morning Cardio"
                value={formData.title}
                onChange={handleChange}
                minLength={2}
                maxLength={150}
                required
              />

              <label>Description</label>

              <textarea
                name="description"
                placeholder="Describe your planned workout..."
                value={formData.description}
                onChange={handleChange}
                maxLength={2000}
                rows={4}
              />

              <label>Scheduled Date</label>

              <input
                type="date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                min={dateToString(new Date())}
                required
              />

              <div className="workout-plan-form-actions">

                <button
                  type="button"
                  onClick={resetForm}
                  className="cancel-plan-btn"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-plan-btn"
                >
                  {editingId ? "Update Plan" : "Save Plan"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default WorkoutPlans;
