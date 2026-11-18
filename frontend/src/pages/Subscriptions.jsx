
import { useEffect, useState } from "react";
import  api  from "../services/api";
import "./Subscriptions.css";

function Subscriptions() {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError("");

      const [plansResponse, currentResponse, historyResponse] =
        await Promise.all([
          api.get("/subscriptions/"),
          api.get("/subscriptions/current").catch((err) => {
            if (err.response?.status === 404) return { data: null };
            throw err;
          }),
          api.get("/subscriptions/history"),
        ]);

      setPlans(plansResponse.data);
      setCurrentPlan(currentResponse.data);
      setHistory(historyResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load subscription information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const handleSubscribe = async (plan) => {
    const confirmed = window.confirm(
      `Do you want to subscribe to the ${plan.name} plan?`
    );

    if (!confirmed) return;

    try {
      setSubscribing(plan.id);
      setMessage("");
      setError("");

      await api.post(`/subscriptions/${plan.id}/subscribe`);

      setMessage(
        `You have successfully switched to the ${plan.name} plan.`
      );

      await loadSubscriptionData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to activate this subscription."
      );
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return <div className="subscription-page">Loading subscriptions...</div>;
  }

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <div>
          <span className="subscription-eyebrow">FITTRACK MEMBERSHIP</span>
          <h1>Choose Your Subscription</h1>
          <p>
            Select a plan that supports your fitness and nutrition goals.
          </p>
        </div>
      </div>

      {message && <div className="subscription-success">{message}</div>}
      {error && <div className="subscription-error">{error}</div>}

      {currentPlan && (
        <section className="current-subscription">
          <div>
            <span className="subscription-eyebrow">YOUR CURRENT PLAN</span>
            <h2>{currentPlan.subscription.name}</h2>
            <p>{currentPlan.subscription.description}</p>
          </div>

          <div className="current-plan-details">
            <span>
              Status: <strong>{currentPlan.status}</strong>
            </span>
            <span>
              Expires:{" "}
              <strong>
                {new Date(currentPlan.end_date).toLocaleDateString()}
              </strong>
            </span>
          </div>
        </section>
      )}

      <section className="subscription-plans">
        {plans.map((plan) => {
          const isCurrent =
            currentPlan?.subscription_id === plan.id &&
            currentPlan?.status === "ACTIVE";

          return (
            <article
              className={`subscription-card ${
                plan.name === "Premium" ? "subscription-featured" : ""
              }`}
              key={plan.id}
            >
              {plan.name === "Premium" && (
                <span className="popular-label">POPULAR</span>
              )}

              <h2>{plan.name}</h2>
              <p className="plan-description">{plan.description}</p>

              <div className="plan-price">
                <strong>₹{Number(plan.price).toLocaleString("en-IN")}</strong>
                <span> / {plan.duration} days</span>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <span className="feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`subscribe-button ${
                  isCurrent ? "current-plan-button" : ""
                }`}
                disabled={isCurrent || subscribing !== null}
                onClick={() => handleSubscribe(plan)}
              >
                {isCurrent
                  ? "Current Plan"
                  : subscribing === plan.id
                  ? "Activating..."
                  : currentPlan
                  ? "Switch Plan"
                  : "Subscribe Now"}
              </button>
            </article>
          );
        })}
      </section>

      <section className="subscription-history">
        <h2>Subscription History</h2>

        {history.length === 0 ? (
          <p className="empty-history">No subscription history available.</p>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {history.map((record) => (
                  <tr key={record.id}>
                    <td>{record.subscription.name}</td>
                    <td>
                      {new Date(record.start_date).toLocaleDateString()}
                    </td>
                    <td>
                      {new Date(record.end_date).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={`history-status ${record.status.toLowerCase()}`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Subscriptions;
