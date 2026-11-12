
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./FitnessIntegrations.css";

const providers = [
  {
    id: "health_connect",
    name: "Google Health Connect",
    icon: "❤️",
    description: "Android health and fitness data integration.",
  },
  {
    id: "apple_health",
    name: "Apple Health",
    icon: "🍎",
    description: "Health and workout data from Apple devices.",
  },
];

function getLocalDateTime() {
  const now = new Date();
  const local = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );
  return local.toISOString().slice(0, 16);
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) return `${remainingSeconds} sec`;

  return `${minutes} min ${remainingSeconds} sec`;
}

function FitnessIntegrations() {
  const [connections, setConnections] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    provider: "health_connect",
    external_record_id: "",
    activity_type: "Walking",
    duration_seconds: "1800",
    calories_burned: "120",
    steps: "3500",
    distance_meters: "2500",
    started_at: getLocalDateTime(),
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [connectionResponse, activityResponse] = await Promise.all([
        api.get("/fitness-integrations/providers"),
        api.get("/fitness-integrations/activities"),
      ]);

      setConnections(connectionResponse.data);
      setActivities(activityResponse.data);
    } catch (err) {
      console.error("Failed to load fitness integrations:", err);
      setError(
        err.response?.data?.detail ||
        "Unable to load fitness integration information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getConnection = (providerId) =>
    connections.find((item) => item.provider === providerId);

  const isConnected = (providerId) =>
    getConnection(providerId)?.status === "connected";

  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const changeConnection = async (providerId) => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const connected = isConnected(providerId);

      if (connected) {
        await api.post(
          `/fitness-integrations/providers/${providerId}/disconnect`
        );
        setMessage("Provider disconnected successfully.");
      } else {
        await api.post(
          `/fitness-integrations/providers/${providerId}/connect`
        );
        setMessage("Provider registered successfully.");
      }

      await loadData();
    } catch (err) {
      console.error("Provider update failed:", err);
      setError(
        err.response?.data?.detail ||
        "Unable to update provider connection."
      );
    } finally {
      setSaving(false);
    }
  };

  const importActivity = async (event) => {
    event.preventDefault();

    if (!isConnected(form.provider)) {
      setError("Connect the selected provider before importing activities.");
      return;
    }

    if (!form.external_record_id.trim()) {
      setError("Please enter an external activity record ID.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        provider: form.provider,
        external_record_id: form.external_record_id.trim(),
        activity_type: form.activity_type.trim(),
        duration_seconds: Number(form.duration_seconds),
        calories_burned: Number(form.calories_burned),
        steps: form.steps === "" ? null : Number(form.steps),
        distance_meters:
          form.distance_meters === ""
            ? null
            : Number(form.distance_meters),
        started_at: new Date(form.started_at).toISOString(),
      };

      await api.post(
        "/fitness-integrations/activities/import",
        payload
      );

      setMessage("Activity imported successfully!");

      setForm((previous) => ({
        ...previous,
        external_record_id: "",
        started_at: getLocalDateTime(),
      }));

      await loadData();
    } catch (err) {
      console.error("Activity import failed:", err);
      setError(
        err.response?.data?.detail ||
        "Unable to import this activity."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fitness-integrations-page">
        <p className="integration-loading">Loading integrations...</p>
      </div>
    );
  }

  return (
    <div className="fitness-integrations-page">
      <header className="integration-header">
        <div>
          <span className="integration-eyebrow">CONNECTED FITNESS</span>
          <h1>Fitness Integrations</h1>
          <p>
            Manage fitness providers and import your external workout
            activities into FitTrack.
          </p>
        </div>
        <span className="integration-header-icon">🔗</span>
      </header>

      {error && <div className="integration-alert error">{error}</div>}
      {message && (
        <div className="integration-alert success">{message}</div>
      )}

      <section className="integration-section">
        <div className="integration-section-heading">
          <div>
            <h2>Fitness Providers</h2>
            <p>Manage your provider registrations.</p>
          </div>
        </div>

        <div className="provider-grid">
          {providers.map((provider) => {
            const connected = isConnected(provider.id);

            return (
              <article className="provider-card" key={provider.id}>
                <div className="provider-card-top">
                  <span className="provider-icon">{provider.icon}</span>
                  <span
                    className={`provider-status ${
                      connected ? "connected" : "disconnected"
                    }`}
                  >
                    {connected ? "Connected" : "Not connected"}
                  </span>
                </div>

                <h3>{provider.name}</h3>
                <p>{provider.description}</p>

                <button
                  className={`provider-button ${
                    connected ? "disconnect" : "connect"
                  }`}
                  onClick={() => changeConnection(provider.id)}
                  disabled={saving}
                >
                  {connected ? "Disconnect" : "Connect Provider"}
                </button>
              </article>
            );
          })}
        </div>

        <p className="integration-notice">
          <strong>Integration status:</strong> These buttons register or
          disconnect a provider in FitTrack. They do not request access to
          Google Health Connect or Apple Health data on your device.
        </p>
      </section>

      <section className="integration-section import-section">
        <div className="integration-section-heading">
          <div>
            <h2>Import External Activity</h2>
            <p>
              Add activity data obtained from a connected fitness provider.
            </p>
          </div>
        </div>

        <form className="integration-form" onSubmit={importActivity}>
          <div className="integration-form-grid">
            <div className="integration-field">
              <label htmlFor="provider">Fitness Provider</label>
              <select
                id="provider"
                name="provider"
                value={form.provider}
                onChange={updateForm}
              >
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="integration-field">
              <label htmlFor="external_record_id">
                External Record ID
              </label>
              <input
                id="external_record_id"
                name="external_record_id"
                value={form.external_record_id}
                onChange={updateForm}
                placeholder="Example: HC-WORKOUT-001"
                maxLength={150}
                required
              />
            </div>

            <div className="integration-field">
              <label htmlFor="activity_type">Activity Type</label>
              <input
                id="activity_type"
                name="activity_type"
                value={form.activity_type}
                onChange={updateForm}
                placeholder="Walking, Running, Cycling..."
                maxLength={100}
                required
              />
            </div>

            <div className="integration-field">
              <label htmlFor="duration_seconds">
                Duration (seconds)
              </label>
              <input
                id="duration_seconds"
                name="duration_seconds"
                type="number"
                min="1"
                max="86400"
                value={form.duration_seconds}
                onChange={updateForm}
                required
              />
            </div>

            <div className="integration-field">
              <label htmlFor="calories_burned">
                Calories Burned
              </label>
              <input
                id="calories_burned"
                name="calories_burned"
                type="number"
                min="0"
                step="0.1"
                value={form.calories_burned}
                onChange={updateForm}
                required
              />
            </div>

            <div className="integration-field">
              <label htmlFor="steps">Steps (optional)</label>
              <input
                id="steps"
                name="steps"
                type="number"
                min="0"
                value={form.steps}
                onChange={updateForm}
              />
            </div>

            <div className="integration-field">
              <label htmlFor="distance_meters">
                Distance (meters, optional)
              </label>
              <input
                id="distance_meters"
                name="distance_meters"
                type="number"
                min="0"
                step="0.1"
                value={form.distance_meters}
                onChange={updateForm}
              />
            </div>

            <div className="integration-field">
              <label htmlFor="started_at">Activity Date and Time</label>
              <input
                id="started_at"
                name="started_at"
                type="datetime-local"
                value={form.started_at}
                onChange={updateForm}
                required
              />
            </div>
          </div>

          <button
            className="import-activity-button"
            type="submit"
            disabled={saving}
          >
            {saving ? "Processing..." : "Import Activity"}
          </button>
        </form>
      </section>

      <section className="integration-section">
        <div className="integration-section-heading">
          <div>
            <h2>Imported Activity History</h2>
            <p>Your external fitness activities.</p>
          </div>
          <span className="activity-count">
            {activities.length} Activities
          </span>
        </div>

        {activities.length === 0 ? (
          <div className="integration-empty">
            <span>📊</span>
            <h3>No imported activities</h3>
            <p>Import an activity to see it listed here.</p>
          </div>
        ) : (
          <div className="external-activity-list">
            {activities.map((activity) => (
              <article className="external-activity-card" key={activity.id}>
                <div className="external-activity-icon">🏃</div>

                <div className="external-activity-info">
                  <h3>{activity.activity_type}</h3>
                  <p>
                    {activity.provider === "health_connect"
                      ? "Google Health Connect"
                      : "Apple Health"}
                    {" · "}
                    {new Date(activity.started_at).toLocaleString()}
                  </p>
                  <small>Record: {activity.external_record_id}</small>
                </div>

                <div className="external-activity-stats">
                  <strong>{formatDuration(activity.duration_seconds)}</strong>
                  <span>{activity.calories_burned} kcal</span>
                  {activity.steps !== null && (
                    <span>{activity.steps} steps</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default FitnessIntegrations;
