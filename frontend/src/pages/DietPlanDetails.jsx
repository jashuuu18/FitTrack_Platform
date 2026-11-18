import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./DietPlanDetails.css";

function DietPlanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/diet-plans/${id}`);
        setPlan(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Unable to load diet plan."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  const handleAssign = async () => {
    try {
      setAssigning(true);
      setError("");
      setSuccess("");

      await api.post(`/diet-plans/${id}/assign`);

      setSuccess("Diet plan assigned successfully!");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to assign diet plan."
      );
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return <div className="diet-details-page">Loading diet plan...</div>;
  }

  if (error && !plan) {
    return (
      <div className="diet-details-page">
        <div className="diet-details-error">{error}</div>
        <button onClick={() => navigate("/diet-plans")}>
          Back to Diet Plans
        </button>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="diet-details-page">
      <button
        className="diet-back-button"
        onClick={() => navigate("/diet-plans")}
      >
        ← Back to Diet Plans
      </button>

      <section className="diet-details-card">
        <div className="diet-details-icon">🥗</div>

        <span className="diet-details-label">DIET PLAN DETAILS</span>

        <h1>{plan.title}</h1>

        <span className="diet-details-goal">{plan.goal_type}</span>

        <p className="diet-details-description">
          {plan.description}
        </p>

        <div className="diet-details-stats">
          <div>
            <strong>{plan.daily_calories}</strong>
            <span>Daily Calories</span>
          </div>

          <div>
            <strong>{plan.duration}</strong>
            <span>Duration (Days)</span>
          </div>
        </div>

        {error && <div className="diet-details-error">{error}</div>}
        {success && <div className="diet-details-success">{success}</div>}

        <button
          className="diet-assign-button"
          onClick={handleAssign}
          disabled={assigning}
        >
          {assigning ? "Assigning..." : "Assign This Diet Plan"}
        </button>

        {success && (
          <button
            className="diet-my-plans-button"
            onClick={() => navigate("/my-diet-plans")}
          >
            View My Assigned Plans
          </button>
        )}
      </section>
    </div>
  );
}

export default DietPlanDetails;