
import { useEffect, useState } from "react";
import api from "../services/api";
import "./DietReminders.css";

function DietReminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    message: "",
    reminder_type: "meal",
    scheduled_at: ""
  });

  const fetchReminders = async () => {
    try {
      setError("");
      const response = await api.get("/reminders/");
      setReminders(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load reminders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.scheduled_at) {
      setError("Please select a reminder date and time.");
      return;
    }

    const selectedDate = new Date(form.scheduled_at);

    if (selectedDate <= new Date()) {
      setError("Please select a future date and time.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/reminders/", {
        title: form.title.trim(),
        message: form.message.trim(),
        reminder_type: form.reminder_type,
        scheduled_at: selectedDate.toISOString()
      });

      setSuccess("Reminder created successfully!");

      setForm({
        title: "",
        message: "",
        reminder_type: "meal",
        scheduled_at: ""
      });

      await fetchReminders();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to create reminder."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (reminder) => {
    try {
      setError("");
      setSuccess("");

      await api.patch(`/reminders/${reminder.id}`, {
        is_active: !reminder.is_active
      });

      setSuccess("Reminder status updated successfully.");
      await fetchReminders();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to update reminder."
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reminder?")) {
      return;
    }

    try {
      setError("");

      await api.delete(`/reminders/${id}`);

      setSuccess("Reminder deleted successfully.");
      await fetchReminders();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to delete reminder."
      );
    }
  };

  const formatDate = (value) => {
    return new Date(value).toLocaleString();
  };

  const activeCount = reminders.filter(
    (item) => item.is_active && !item.is_sent
  ).length;

  const sentCount = reminders.filter(
    (item) => item.is_sent
  ).length;

  return (
    <div className="diet-reminders-page">
      <header className="diet-reminders-header">
        <div>
          <span className="diet-reminders-eyebrow">
            FITTRACK NUTRITION
          </span>
          <h1>Reminders & Alerts</h1>
          <p>
            Stay consistent with your workouts, meals, and hydration.
          </p>
        </div>
      </header>

      <section className="diet-reminder-stats">
        <div className="diet-reminder-stat">
          <span>🔔</span>
          <div>
            <h3>{reminders.length}</h3>
            <p>Total Reminders</p>
          </div>
        </div>

        <div className="diet-reminder-stat">
          <span>⏰</span>
          <div>
            <h3>{activeCount}</h3>
            <p>Active Reminders</p>
          </div>
        </div>

        <div className="diet-reminder-stat">
          <span>✓</span>
          <div>
            <h3>{sentCount}</h3>
            <p>Sent Reminders</p>
          </div>
        </div>
      </section>

      <section className="diet-reminder-form-card">
        <h2>Create a New Reminder</h2>
        <p>Schedule an alert to help maintain your daily routine.</p>

        {error && <div className="diet-reminder-error">{error}</div>}
        {success && <div className="diet-reminder-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="diet-reminder-form-grid">
            <div className="diet-reminder-field">
              <label>Reminder Title</label>
              <input
                type="text"
                name="title"
                placeholder="Example: Lunch Time"
                value={form.title}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </div>

            <div className="diet-reminder-field">
              <label>Reminder Type</label>
              <select
                name="reminder_type"
                value={form.reminder_type}
                onChange={handleChange}
                required
              >
                <option value="workout">Workout</option>
                <option value="meal">Meal</option>
                <option value="water">Water Intake</option>
                <option value="subscription">Subscription</option>
                <option value="consultation">Consultation</option>
                <option value="general">General</option>
              </select>
            </div>

            <div className="diet-reminder-field full-width">
              <label>Message</label>
              <textarea
                name="message"
                placeholder="Enter your reminder message..."
                value={form.message}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>

            <div className="diet-reminder-field full-width">
              <label>Scheduled Date & Time</label>
              <input
                type="datetime-local"
                name="scheduled_at"
                value={form.scheduled_at}
                onChange={handleChange}
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                  .toISOString().slice(0, 16)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="diet-reminder-submit"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "+ Create Reminder"}
          </button>
        </form>
      </section>

      <section className="diet-reminder-list-section">
        <div className="diet-reminder-list-heading">
          <div>
            <h2>Your Reminders</h2>
            <p>Manage your scheduled alerts.</p>
          </div>

          <button
            type="button"
            onClick={fetchReminders}
            className="diet-reminder-refresh"
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <p className="diet-reminder-empty">Loading reminders...</p>
        ) : reminders.length === 0 ? (
          <div className="diet-reminder-empty">
            <span>🔔</span>
            <h3>No reminders yet</h3>
            <p>Create your first reminder to stay on track.</p>
          </div>
        ) : (
          <div className="diet-reminder-list">
            {reminders.map((reminder) => (
              <article className="diet-reminder-item" key={reminder.id}>
                <div className="diet-reminder-item-icon">
                  {reminder.reminder_type === "workout" ? "🏋️" :
                    reminder.reminder_type === "meal" ? "🥗" :
                    reminder.reminder_type === "water" ? "💧" :
                    reminder.reminder_type === "consultation" ? "👩‍⚕️" :
                    reminder.reminder_type === "subscription" ? "💳" : "🔔"}
                </div>

                <div className="diet-reminder-item-content">
                  <h3>{reminder.title}</h3>
                  <p>{reminder.message}</p>

                  <span>
                    {formatDate(reminder.scheduled_at)}
                  </span>

                  <small>
                    Type: {reminder.reminder_type}
                  </small>
                </div>

                <div className="diet-reminder-item-actions">
                  <span className={`diet-reminder-status ${
                    reminder.is_sent
                      ? "sent"
                      : reminder.is_active
                      ? "active"
                      : "inactive"
                  }`}>
                    {reminder.is_sent
                      ? "Sent"
                      : reminder.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                  {!reminder.is_sent && (
                    <button
                      type="button"
                      className="diet-reminder-toggle"
                      onClick={() => handleToggle(reminder)}
                    >
                      {reminder.is_active ? "Deactivate" : "Activate"}
                    </button>
                  )}

                  <button
                    type="button"
                    className="diet-reminder-delete"
                    onClick={() => handleDelete(reminder.id)}
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

export default DietReminders;
