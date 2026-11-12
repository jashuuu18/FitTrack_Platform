import React, { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./Reminders.css";

const emptyForm = {
  title: "",
  message: "",
  reminder_type: "general",
  scheduled_at: "",
};

function formatDate(value) {
  if (!value) return "Not scheduled";

  // The backend stores UTC-naive values. Interpret them as UTC.
  const date = new Date(
    value.endsWith("Z") ? value : `${value}Z`
  );

  return date.toLocaleString();
}

function toLocalDateTimeMin() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReminders = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.scheduled_at) {
      setError("Please select a reminder date and time.");
      return;
    }

    const selectedDate = new Date(form.scheduled_at);

    if (Number.isNaN(selectedDate.getTime())) {
      setError("Please enter a valid date and time.");
      return;
    }

    if (selectedDate <= new Date()) {
      setError("Please select a future date and time.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/reminders/", {
        title: form.title.trim(),
        message: form.message.trim(),
        reminder_type: form.reminder_type,
        scheduled_at: selectedDate.toISOString(),
      });

      setForm(emptyForm);
      setSuccess("Reminder created successfully!");
      await fetchReminders();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to create reminder."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleReminder = async (reminder) => {
    setError("");
    setSuccess("");

    try {
      await api.patch(`/reminders/${reminder.id}`, {
        is_active: !reminder.is_active,
      });

      setSuccess(
        reminder.is_active
          ? "Reminder deactivated."
          : "Reminder activated."
      );

      await fetchReminders();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to update reminder."
      );
    }
  };

  const deleteReminder = async (reminderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reminder?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/reminders/${reminderId}`);
      setSuccess("Reminder deleted successfully.");
      await fetchReminders();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to delete reminder."
      );
    }
  };

  const getStatus = (reminder) => {
    if (reminder.is_sent) return "Sent";
    if (!reminder.is_active) return "Inactive";
    return "Scheduled";
  };

  return (
    <div className="reminders-page">
      <div className="reminders-header">
        <div>
          <p className="reminders-eyebrow">FITNESS ROUTINE</p>
          <h1>Reminders & Alerts</h1>
          <p>
            Schedule helpful reminders to stay consistent with your fitness
            goals.
          </p>
        </div>

        <button
          className="reminders-refresh"
          type="button"
          onClick={fetchReminders}
        >
          ↻ Refresh
        </button>
      </div>

      {error && <div className="reminder-alert error">{error}</div>}
      {success && <div className="reminder-alert success">{success}</div>}

      <div className="reminders-layout">
        <section className="reminder-form-card">
          <h2>Create a Reminder</h2>
          <p className="reminder-section-description">
            Choose what you want to be reminded about and when.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="reminder-title">Reminder Title</label>
            <input
              id="reminder-title"
              name="title"
              type="text"
              placeholder="Example: Evening workout"
              value={form.title}
              onChange={handleChange}
              maxLength={150}
              required
            />

            <label htmlFor="reminder-message">Message</label>
            <textarea
              id="reminder-message"
              name="message"
              placeholder="Example: It's time to complete your workout."
              value={form.message}
              onChange={handleChange}
              rows={4}
              required
            />

            <label htmlFor="reminder-type">Reminder Category</label>
            <select
              id="reminder-type"
              name="reminder_type"
              value={form.reminder_type}
              onChange={handleChange}
            >
              <option value="workout">Workout</option>
              <option value="water">Water Intake</option>
              <option value="meal">Meal</option>
              <option value="goal">Fitness Goal</option>
              <option value="general">General</option>
            </select>

            <label htmlFor="reminder-date">Date and Time</label>
            <input
              id="reminder-date"
              name="scheduled_at"
              type="datetime-local"
              min={toLocalDateTimeMin()}
              value={form.scheduled_at}
              onChange={handleChange}
              required
            />

            <button
              className="reminder-submit"
              type="submit"
              disabled={saving}
            >
              {saving ? "Creating..." : "+ Create Reminder"}
            </button>
          </form>
        </section>

        <section className="reminder-list-card">
          <div className="reminder-list-heading">
            <div>
              <h2>Your Reminders</h2>
              <p className="reminder-section-description">
                Manage your upcoming fitness alerts.
              </p>
            </div>

            <span className="reminder-count">{reminders.length}</span>
          </div>

          {loading ? (
            <div className="reminder-empty">Loading reminders...</div>
          ) : reminders.length === 0 ? (
            <div className="reminder-empty">
              <span className="reminder-empty-icon">🔔</span>
              <h3>No reminders yet</h3>
              <p>Create your first reminder to stay on track.</p>
            </div>
          ) : (
            <div className="reminder-items">
              {reminders.map((reminder) => (
                <article className="reminder-item" key={reminder.id}>
                  <div className="reminder-item-top">
                    <div>
                      <span
                        className={`reminder-category ${reminder.reminder_type}`}
                      >
                        {reminder.reminder_type}
                      </span>

                      <h3>{reminder.title}</h3>
                    </div>

                    <span
                      className={`reminder-status ${
                        reminder.is_sent
                          ? "sent"
                          : reminder.is_active
                          ? "scheduled"
                          : "inactive"
                      }`}
                    >
                      {getStatus(reminder)}
                    </span>
                  </div>

                  <p className="reminder-message">{reminder.message}</p>

                  <p className="reminder-time">
                    <span>◷</span> {formatDate(reminder.scheduled_at)}
                  </p>

                  <div className="reminder-actions">
                    {!reminder.is_sent && (
                      <button
                        type="button"
                        className="reminder-toggle"
                        onClick={() => toggleReminder(reminder)}
                      >
                        {reminder.is_active ? "Deactivate" : "Activate"}
                      </button>
                    )}

                    <button
                      type="button"
                      className="reminder-delete"
                      onClick={() => deleteReminder(reminder.id)}
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
    </div>
  );
}

export default Reminders;