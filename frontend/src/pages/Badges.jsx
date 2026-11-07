import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./Badges.css";

export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [newlyAwarded, setNewlyAwarded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBadges = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // This endpoint also checks and awards newly qualified badges.
      const response = await api.get("/badges/me");

      setBadges(response.data.badges || []);
      setTotalEarned(response.data.total_earned || 0);
      setNewlyAwarded(response.data.newly_awarded || []);
    } catch (err) {
      console.error("Badge loading error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load achievement badges."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  const earnedIds = new Set(badges.map((badge) => badge.id));

  const [allBadges, setAllBadges] = useState([]);

  const loadAllBadges = useCallback(async () => {
    try {
      const response = await api.get("/badges/");
      setAllBadges(response.data || []);
    } catch (err) {
      console.error("Unable to load all badges:", err);
    }
  }, []);

  useEffect(() => {
    loadAllBadges();
  }, [loadAllBadges]);

  if (loading) {
    return (
      <div className="badges-page">
        <p>Loading achievement badges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="badges-page">
        <h1>Achievement Badges</h1>
        <p className="badges-error">{error}</p>
        <button onClick={loadBadges}>Try Again</button>
      </div>
    );
  }

  const earnedBadges = allBadges.filter(
    (badge) => earnedIds.has(badge.id) || badge.is_earned
  );

  const lockedBadges = allBadges.filter(
    (badge) => !earnedIds.has(badge.id) && !badge.is_earned
  );

  return (
    <div className="badges-page">
      <div className="badges-header">
        <div>
          <h1>Achievement Badges</h1>
          <p>Celebrate every milestone in your fitness journey.</p>
        </div>

        <div className="badges-header-icon">🏆</div>
      </div>

      <div className="badges-summary">
        <div>
          <span className="badges-summary-icon">🏅</span>
          <div>
            <h2>{totalEarned}</h2>
            <p>Badges Earned</p>
          </div>
        </div>

        <div>
          <span className="badges-summary-icon">🎯</span>
          <div>
            <h2>{allBadges.length}</h2>
            <p>Total Badges</p>
          </div>
        </div>
      </div>

      {newlyAwarded.length > 0 && (
        <div className="badge-success">
          <h3>🎉 Congratulations!</h3>
          <p>You just earned:</p>
          {newlyAwarded.map((name) => (
            <strong key={name}>{name}</strong>
          ))}
        </div>
      )}

      <section className="badge-section">
        <h2>Earned Badges</h2>

        {earnedBadges.length === 0 ? (
          <p className="badge-empty">
            No badges earned yet. Complete a workout to earn your first badge!
          </p>
        ) : (
          <div className="badge-grid">
            {earnedBadges.map((badge) => (
              <div className="badge-card earned" key={badge.id}>
                <div className="badge-icon">{badge.icon}</div>
                <h3>{badge.name}</h3>
                <p>{badge.description}</p>
                <span className="badge-status">✓ Earned</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="badge-section">
        <h2>Locked Badges</h2>

        <div className="badge-grid">
          {lockedBadges.map((badge) => (
            <div className="badge-card locked" key={badge.id}>
              <div className="badge-icon">{badge.icon}</div>
              <h3>{badge.name}</h3>
              <p>{badge.description}</p>
              <span className="badge-status">🔒 Not earned</span>
            </div>
          ))}
        </div>
      </section>

      <button className="badge-refresh" onClick={loadBadges}>
        Refresh Achievements
      </button>
    </div>
  );
}