
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./WaterTracker.css";

function WaterTracker() {
  const [entries, setEntries] = useState([]);

  const [summary, setSummary] = useState({
    total_intake: 0,
    daily_goal: 2500,
    remaining: 2500,
    progress_percentage: 0,
    total_entries: 0
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  const [quantity, setQuantity] = useState("250");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadWaterData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [entriesResponse, summaryResponse] = await Promise.all([
        api.get("/water/entries", {
          params: { selected_date: selectedDate }
        }),
        api.get("/water/summary", {
          params: { selected_date: selectedDate }
        })
      ]);

      setEntries(entriesResponse.data);
      setSummary(summaryResponse.data);

    } catch (err) {
      console.error("Water tracker loading error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load water intake information."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadWaterData();
  }, [loadWaterData]);

  const addWater = async (event) => {
    event.preventDefault();

    const amount = Number(quantity);

    if (!Number.isInteger(amount) || amount <= 0 || amount > 10000) {
      setError("Enter a valid water quantity between 1 and 10000 ml.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.post("/water/entries", {
        quantity: amount,
        date: selectedDate
      });

      setSuccess(`${amount} ml of water added successfully!`);

      await loadWaterData();

    } catch (err) {
      console.error("Water entry error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to add water intake."
      );
    } finally {
      setSaving(false);
    }
  };

  const quickAdd = async (amount) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.post("/water/entries", {
        quantity: amount,
        date: selectedDate
      });

      setSuccess(`${amount} ml of water added successfully!`);

      await loadWaterData();

    } catch (err) {
      console.error("Quick add error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to add water intake."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (entryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this water entry?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/water/entries/${entryId}`);

      setSuccess("Water entry deleted successfully!");

      await loadWaterData();

    } catch (err) {
      console.error("Delete water entry error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to delete water entry."
      );
    }
  };

  const litersConsumed = (
    Number(summary.total_intake) / 1000
  ).toFixed(2);

  const goalLiters = (
    Number(summary.daily_goal) / 1000
  ).toFixed(2);

  return (
    <div className="water-page">

      {/* Header */}

      <div className="water-header">
        <div>
          <h1>Water Intake Tracker</h1>
          <p>Stay hydrated and build healthy daily habits.</p>
        </div>

        <div className="water-header-icon">
          💧
        </div>
      </div>

      {/* Date selector */}

      <div className="water-date-row">
        <label htmlFor="water-date">Select Date</label>

        <input
          id="water-date"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />

        <button
          type="button"
          onClick={loadWaterData}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {/* Alerts */}

      {error && (
        <div className="water-alert water-error">
          {typeof error === "string"
            ? error
            : JSON.stringify(error)}
        </div>
      )}

      {success && (
        <div className="water-alert water-success">
          {success}
        </div>
      )}

      {/* Main hydration card */}

      <section className="water-main-card">

        <div className="water-main-info">
          <span className="water-drop">💧</span>

          <div>
            <p>Today's Water Intake</p>

            <h2>
              {litersConsumed}
              <span> L</span>
            </h2>

            <small>
              Daily target: {goalLiters} L
            </small>
          </div>
        </div>

        <div
          className="water-progress-circle"
          style={{
            "--water-progress": `${summary.progress_percentage}%`
          }}
        >
          <div className="water-progress-inner">
            <strong>
              {summary.progress_percentage}%
            </strong>
            <span>Completed</span>
          </div>
        </div>

        <div className="water-progress-details">
          <div>
            <span>Consumed</span>
            <strong>{summary.total_intake} ml</strong>
          </div>

          <div>
            <span>Remaining</span>
            <strong>{summary.remaining} ml</strong>
          </div>

          <div>
            <span>Entries</span>
            <strong>{summary.total_entries}</strong>
          </div>
        </div>

        {summary.total_intake >= summary.daily_goal && (
          <div className="water-goal-message">
            🎉 Daily water target reached!
          </div>
        )}

      </section>

      {/* Quick add */}

      <section className="water-section">

        <div className="water-section-heading">
          <h2>Quick Add Water</h2>
          <p>Select an amount to record your water intake.</p>
        </div>

        <div className="water-quick-buttons">

          {[250, 500, 750].map((amount) => (
            <button
              type="button"
              key={amount}
              onClick={() => quickAdd(amount)}
              disabled={saving}
            >
              <span>💧</span>
              + {amount} ml
            </button>
          ))}

        </div>

      </section>

      {/* Custom water entry */}

      <section className="water-section">

        <div className="water-section-heading">
          <h2>Add Custom Water Intake</h2>
          <p>Enter the quantity of water you consumed.</p>
        </div>

        <form
          className="water-form"
          onSubmit={addWater}
        >

          <div className="water-input-group">
            <label htmlFor="water-quantity">
              Water Quantity (ml)
            </label>

            <input
              id="water-quantity"
              type="number"
              min="1"
              max="10000"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Enter quantity in ml"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
          >
            {saving ? "Adding..." : "+ Add Water"}
          </button>

        </form>

      </section>

      {/* Water history */}

      <section className="water-section">

        <div className="water-section-heading">
          <h2>Daily Water History</h2>
          <p>All water entries for {selectedDate}.</p>
        </div>

        {loading ? (
          <div className="water-empty">
            Loading water records...
          </div>
        ) : entries.length === 0 ? (
          <div className="water-empty">
            <span>🥤</span>
            <h3>No water records yet</h3>
            <p>Start tracking your water intake today.</p>
          </div>
        ) : (

          <div className="water-history-list">

            {entries.map((entry) => (
              <div className="water-history-item" key={entry.id}>

                <div className="water-history-icon">
                  💧
                </div>

                <div className="water-history-info">
                  <h3>{entry.quantity} ml</h3>
                  <p>
                    {(
                      Number(entry.quantity) / 1000
                    ).toFixed(2)} litres
                  </p>
                </div>

                <button
                  type="button"
                  className="water-delete-button"
                  onClick={() => deleteEntry(entry.id)}
                >
                  Delete
                </button>

              </div>
            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default WaterTracker;
