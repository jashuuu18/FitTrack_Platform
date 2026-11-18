import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./MyDietPlans.css";

function MyDietPlans() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await api.get("/diet-plans/my/assigned");
        setAssignments(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to load your assigned diet plans."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  return (
    <div className="my-diet-page">
      <header className="my-diet-header">
        <div>
          <span>FITTRACK NUTRITION</span>
          <h1>My Assigned Diet Plans</h1>
          <p>Track the diet plans you have selected.</p>
        </div>

        <button onClick={() => navigate("/diet-plans")}>
          + Explore Diet Plans
        </button>
      </header>

      {error && <div className="my-diet-error">{error}</div>}

      {loading ? (
        <div className="my-diet-empty">Loading your plans...</div>
      ) : assignments.length === 0 ? (
        <div className="my-diet-empty">
          <div className="my-diet-icon">🥗</div>
          <h2>No assigned diet plans</h2>
          <p>Explore the available diet plans and choose one to get started.</p>
          <button onClick={() => navigate("/diet-plans")}>
            Explore Diet Plans
          </button>
        </div>
      ) : (
        <div className="my-diet-grid">
          {assignments.map((assignment) => (
            <article className="my-diet-card" key={assignment.id}>
              <div className="my-diet-card-top">
                <span>🥗</span>

                <span
                  className={
                    assignment.is_active
                      ? "my-diet-active"
                      : "my-diet-inactive"
                  }
                >
                  {assignment.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <h2>{assignment.diet_plan.title}</h2>

              <p>{assignment.diet_plan.description}</p>

              <div className="my-diet-stats">
                <div>
                  <strong>{assignment.diet_plan.daily_calories}</strong>
                  <span>Calories / day</span>
                </div>

                <div>
                  <strong>{assignment.diet_plan.duration}</strong>
                  <span>Days</span>
                </div>
              </div>

              <span className="my-diet-goal">
                {assignment.diet_plan.goal_type}
              </span>

              <small>
                Assigned:{" "}
                {new Date(assignment.assigned_at).toLocaleDateString()}
              </small>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyDietPlans;