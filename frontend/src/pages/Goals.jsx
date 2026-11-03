
import { useEffect, useState } from "react";
import api from "../services/api";

const today = new Date().toLocaleDateString("en-CA");

const initialForm = {
  goal_type: "Weight Loss",
  target_value: "",
  current_value: "",
  deadline: "",
};

function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [progressValues, setProgressValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/goals/");
      setGoals(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load your goals."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      Number(form.target_value) <= 0 ||
      Number(form.current_value) < 0
    ) {
      setError("Enter a valid target and current value.");
      return;
    }

    if (!form.deadline) {
      setError("Please select a deadline.");
      return;
    }

    const payload = {
      goal_type: form.goal_type,
      target_value: Number(form.target_value),
      current_value: Number(form.current_value),
      deadline: form.deadline,
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/goals/${editingId}`, payload);
        setMessage("Goal updated successfully.");
      } else {
        await api.post("/goals/", payload);
        setMessage("Goal created successfully.");
      }

      resetForm();
      await fetchGoals();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to save the goal."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingId(goal.id);

    setForm({
      goal_type: goal.goal_type,
      target_value: String(goal.target_value),
      current_value: String(goal.current_value),
      deadline: goal.deadline,
    });

    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProgressUpdate = async (goalId) => {
    const value = progressValues[goalId];

    if (value === undefined || value === "") {
      setError("Enter a new progress value first.");
      return;
    }

    if (Number(value) < 0) {
      setError("Progress cannot be negative.");
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.patch(`/goals/${goalId}/progress`, {
        current_value: Number(value),
      });

      setMessage("Goal progress updated successfully.");

      setProgressValues((previous) => ({
        ...previous,
        [goalId]: "",
      }));

      await fetchGoals();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to update progress."
      );
    }
  };

  const handleDelete = async (goalId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this goal?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await api.delete(`/goals/${goalId}`);

      setMessage("Goal deleted successfully.");
      await fetchGoals();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to delete the goal."
      );
    }
  };

  const getUnit = (goalType) => {
    if (goalType === "Weight Loss") return "kg";
    if (goalType === "Muscle Gain") return "kg";
    return "steps";
  };

  const getStatusClass = (status) => {
    if (status === "COMPLETED") return "goal-status completed";
    if (status === "OVERDUE") return "goal-status overdue";
    return "goal-status in-progress";
  };

  const completedCount = goals.filter(
    (goal) => goal.status === "COMPLETED"
  ).length;

  const activeCount = goals.filter(
    (goal) => goal.status === "IN_PROGRESS"
  ).length;

  const overdueCount = goals.filter(
    (goal) => goal.status === "OVERDUE"
  ).length;

  return (
    <div className="goals-page">
      <div className="goals-header">
        <div>
          <h1>My Fitness Goals</h1>
          <p>Create goals and track your fitness journey.</p>
        </div>
      </div>

      {error && <div className="goals-alert error">{error}</div>}
      {message && (
        <div className="goals-alert success">{message}</div>
      )}

      <section className="goal-summary">
        <div className="goal-summary-card">
          <span>Total Goals</span>
          <strong>{goals.length}</strong>
        </div>

        <div className="goal-summary-card">
          <span>In Progress</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="goal-summary-card">
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </div>

        <div className="goal-summary-card">
          <span>Overdue</span>
          <strong>{overdueCount}</strong>
        </div>
      </section>

      <section className="goal-form-section">
        <h2>{editingId ? "Edit Goal" : "Create a New Goal"}</h2>

        <form className="goal-form" onSubmit={handleSubmit}>
          <div className="goal-form-grid">
            <div>
              <label htmlFor="goal_type">Goal Type</label>
              <select
                id="goal_type"
                name="goal_type"
                value={form.goal_type}
                onChange={handleChange}
                required
              >
                <option value="Weight Loss">Weight Loss</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Steps">Steps</option>
              </select>
            </div>

            <div>
              <label htmlFor="target_value">
                Target Value ({getUnit(form.goal_type)})
              </label>
              <input
                id="target_value"
                type="number"
                name="target_value"
                min="0.01"
                step="any"
                value={form.target_value}
                onChange={handleChange}
                placeholder="Enter target value"
                required
              />
            </div>

            <div>
              <label htmlFor="current_value">
                Current Value ({getUnit(form.goal_type)})
              </label>
              <input
                id="current_value"
                type="number"
                name="current_value"
                min="0"
                step="any"
                value={form.current_value}
                onChange={handleChange}
                placeholder="Enter current value"
                required
              />
            </div>

            <div>
              <label htmlFor="deadline">Deadline</label>
              <input
                id="deadline"
                type="date"
                name="deadline"
                min={today}
                value={form.deadline}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="goal-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                ? "Update Goal"
                : "Create Goal"}
            </button>

            {editingId && (
              <button
                type="button"
                className="goal-cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="goal-list-section">
        <h2>Your Goals</h2>

        {loading ? (
          <p>Loading goals...</p>
        ) : goals.length === 0 ? (
          <div className="goal-empty">
            <h3>No goals created yet</h3>
            <p>Create your first fitness goal using the form above.</p>
          </div>
        ) : (
          <div className="goal-grid">
            {goals.map((goal) => (
              <article className="goal-card" key={goal.id}>
                <div className="goal-card-header">
                  <h3>{goal.goal_type}</h3>
                  <span className={getStatusClass(goal.status)}>
                    {goal.status.replace("_", " ")}
                  </span>
                </div>

                <div className="goal-values">
                  <div>
                    <span>Current</span>
                    <strong>
                      {goal.current_value} {getUnit(goal.goal_type)}
                    </strong>
                  </div>

                  <div>
                    <span>Target</span>
                    <strong>
                      {goal.target_value} {getUnit(goal.goal_type)}
                    </strong>
                  </div>
                </div>

                <div className="goal-progress-heading">
                  <span>Progress</span>
                  <strong>{goal.progress_percentage}%</strong>
                </div>

                <div className="goal-progress-track">
                  <div
                    className="goal-progress-fill"
                    style={{
                      width: `${goal.progress_percentage}%`,
                    }}
                  />
                </div>

                <p className="goal-deadline">
                  Deadline: {goal.deadline}
                </p>

                {goal.status !== "COMPLETED" && (
                  <div className="goal-update-progress">
                    <label htmlFor={`progress-${goal.id}`}>
                      Update current value ({getUnit(goal.goal_type)})
                    </label>

                    <div className="goal-progress-input">
                      <input
                        id={`progress-${goal.id}`}
                        type="number"
                        min="0"
                        step="any"
                        value={progressValues[goal.id] ?? ""}
                        onChange={(event) =>
                          setProgressValues((previous) => ({
                            ...previous,
                            [goal.id]: event.target.value,
                          }))
                        }
                        placeholder="New value"
                      />

                      <button
                        type="button"
                        onClick={() => handleProgressUpdate(goal.id)}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                )}

                <div className="goal-card-actions">
                  <button
                    type="button"
                    className="goal-edit-button"
                    onClick={() => handleEdit(goal)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="goal-delete-button"
                    onClick={() => handleDelete(goal.id)}
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

export default Goals;
