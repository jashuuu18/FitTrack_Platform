import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./DietPlans.css";

function DietPlans() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [goalType, setGoalType] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (goalType) params.goal_type = goalType;
      if (search.trim()) params.search = search.trim();

      const response = await api.get("/diet-plans/", { params });
      setPlans(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load diet plans."
      );
    } finally {
      setLoading(false);
    }
  }, [goalType, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlans();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchPlans]);

  const getGoalClass = (goal) => {
    if (goal === "Weight Loss") return "weight-loss";
    if (goal === "Muscle Gain") return "muscle-gain";
    return "maintenance";
  };

  return (
    <div className="diet-plans-page">
      <header className="diet-plans-header">
        <div>
          <span className="diet-eyebrow">FITTRACK NUTRITION</span>
          <h1>Explore Diet Plans</h1>
          <p>
            Find a structured diet plan that supports your fitness goals.
          </p>
        </div>

        <button
          className="my-diet-button"
          onClick={() => navigate("/my-diet-plans")}
        >
          My Assigned Plans
        </button>
      </header>

      <section className="diet-filter-section">
        <input
          type="text"
          placeholder="Search diet plans..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={goalType}
          onChange={(event) => setGoalType(event.target.value)}
        >
          <option value="">All Goals</option>
          <option value="Weight Loss">Weight Loss</option>
          <option value="Muscle Gain">Muscle Gain</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </section>

      {error && <div className="diet-error">{error}</div>}

      {loading ? (
        <div className="diet-empty">Loading diet plans...</div>
      ) : plans.length === 0 ? (
        <div className="diet-empty">
          <h3>No diet plans found</h3>
          <p>Try changing your search or goal filter.</p>
        </div>
      ) : (
        <section className="diet-plan-grid">
          {plans.map((plan) => (
            <article className="diet-plan-card" key={plan.id}>
              <div className="diet-card-top">
                <span className={`diet-goal ${getGoalClass(plan.goal_type)}`}>
                  {plan.goal_type}
                </span>
                <span className="diet-card-icon">🥗</span>
              </div>

              <h2>{plan.title}</h2>

              <p className="diet-plan-description">
                {plan.description}
              </p>

              <div className="diet-plan-stats">
                <div>
                  <strong>{plan.daily_calories}</strong>
                  <span>Calories / day</span>
                </div>

                <div>
                  <strong>{plan.duration}</strong>
                  <span>Days</span>
                </div>
              </div>

              <button
                className="diet-view-button"
                onClick={() => navigate(`/diet-plans/${plan.id}`)}
              >
                View Plan Details →
              </button>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default DietPlans;