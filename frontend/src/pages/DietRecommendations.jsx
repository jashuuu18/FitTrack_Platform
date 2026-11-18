
import { useState } from "react";
import  api  from "../services/api";
import "./DietRecommendations.css";

function DietRecommendations() {
  const [goalType, setGoalType] = useState("Weight Loss");
  const [activityLevel, setActivityLevel] = useState("Moderate");
  const [calorieTarget, setCalorieTarget] = useState(2000);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateRecommendations = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post(
        "/diet-recommendations/generate",
        {
          goal_type: goalType,
          activity_level: activityLevel,
          daily_calorie_target: Number(calorieTarget),
        }
      );

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to generate diet recommendations."
      );
    } finally {
      setLoading(false);
    }
  };

  const progress = (consumed, target) => {
    if (!target || target <= 0) return 0;

    return Math.min((consumed / target) * 100, 100);
  };

  const formatNumber = (value) => Number(value || 0).toFixed(1);

  return (
    <div className="diet-recommendations-page">
      <header className="recommendation-header">
        <div>
          <span className="recommendation-eyebrow">
            SMART NUTRITION ASSISTANT
          </span>
          <h1>Diet Recommendations</h1>
          <p>
            Get nutrition suggestions based on your fitness goals
            and today's recorded meals.
          </p>
        </div>
        <div className="recommendation-header-icon">🥗</div>
      </header>

      <section className="recommendation-form-card">
        <h2>Personalize Your Recommendations</h2>
        <p>
          Choose your goal and activity level, then enter your daily
          calorie target.
        </p>

        <form onSubmit={generateRecommendations}>
          <div className="recommendation-form-grid">
            <div className="recommendation-field">
              <label htmlFor="goalType">Fitness Goal</label>
              <select
                id="goalType"
                value={goalType}
                onChange={(event) => setGoalType(event.target.value)}
              >
                <option value="Weight Loss">Weight Loss</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div className="recommendation-field">
              <label htmlFor="activityLevel">Activity Level</label>
              <select
                id="activityLevel"
                value={activityLevel}
                onChange={(event) => setActivityLevel(event.target.value)}
              >
                <option value="Sedentary">Sedentary</option>
                <option value="Light">Light</option>
                <option value="Moderate">Moderate</option>
                <option value="Active">Active</option>
              </select>
            </div>

            <div className="recommendation-field">
              <label htmlFor="calorieTarget">
                Daily Calorie Target (kcal)
              </label>
              <input
                id="calorieTarget"
                type="number"
                min="1"
                max="10000"
                value={calorieTarget}
                onChange={(event) => setCalorieTarget(event.target.value)}
                required
              />
            </div>
          </div>

          <button
            className="generate-recommendation-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Recommendations"}
          </button>
        </form>

        {error && (
          <div className="recommendation-error">{error}</div>
        )}
      </section>

      {result && (
        <div className="recommendation-results">
          <section className="recommendation-summary">
            <div>
              <span>YOUR SELECTED GOAL</span>
              <h2>{result.goal_type}</h2>
              <p>Activity level: {result.activity_level}</p>
            </div>

            <div className="calorie-summary">
              <span>DAILY CALORIE TARGET</span>
              <strong>
                {formatNumber(result.daily_calorie_target)}
              </strong>
              <small>kcal</small>
            </div>
          </section>

          <section className="nutrition-progress-section">
            <h2>Today's Nutrition Progress</h2>
            <p>
              Based on the meals you have recorded today.
            </p>

            <div className="nutrition-metric-grid">
              <article className="nutrition-metric-card">
                <div className="metric-heading">
                  <span>Calories</span>
                  <span>🔥</span>
                </div>
                <strong>{formatNumber(result.calories_consumed)} kcal</strong>
                <div className="metric-progress">
                  <div
                    style={{
                      width: `${progress(
                        result.calories_consumed,
                        result.daily_calorie_target
                      )}%`,
                    }}
                  />
                </div>
                <small>
                  {formatNumber(result.calories_remaining)} kcal remaining
                </small>
              </article>

              <article className="nutrition-metric-card">
                <div className="metric-heading">
                  <span>Protein</span>
                  <span>💪</span>
                </div>
                <strong>{formatNumber(result.protein_consumed)} g</strong>
                <div className="metric-progress">
                  <div
                    style={{
                      width: `${progress(
                        result.protein_consumed,
                        result.protein_target
                      )}%`,
                    }}
                  />
                </div>
                <small>
                  Target: {formatNumber(result.protein_target)} g
                </small>
              </article>

              <article className="nutrition-metric-card">
                <div className="metric-heading">
                  <span>Carbohydrates</span>
                  <span>🌾</span>
                </div>
                <strong>{formatNumber(result.carbs_consumed)} g</strong>
                <div className="metric-progress">
                  <div
                    style={{
                      width: `${progress(
                        result.carbs_consumed,
                        result.carbs_target
                      )}%`,
                    }}
                  />
                </div>
                <small>
                  Target: {formatNumber(result.carbs_target)} g
                </small>
              </article>

              <article className="nutrition-metric-card">
                <div className="metric-heading">
                  <span>Fats</span>
                  <span>🥑</span>
                </div>
                <strong>{formatNumber(result.fats_consumed)} g</strong>
                <div className="metric-progress">
                  <div
                    style={{
                      width: `${progress(
                        result.fats_consumed,
                        result.fats_target
                      )}%`,
                    }}
                  />
                </div>
                <small>
                  Target: {formatNumber(result.fats_target)} g
                </small>
              </article>
            </div>
          </section>

          <section className="recommendation-content-grid">
            <article className="recommendation-list-card">
              <h2>Smart Recommendations</h2>

              <ul>
                {result.recommendations.map((item, index) => (
                  <li key={index}>
                    <span>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="recommendation-list-card">
              <h2>Suggested Foods</h2>

              <ul>
                {result.food_suggestions.map((item, index) => (
                  <li key={index}>
                    <span>🥗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="activity-tip-card">
            <span>🏃</span>
            <div>
              <h2>Activity Tip</h2>
              <p>{result.activity_tip}</p>
            </div>
          </section>

          <p className="recommendation-disclaimer">
            These are general, rule-based nutrition suggestions, not
            medical advice or a personalized clinical diet. Targets are
            based on the calorie target you entered and should be
            reviewed with a qualified professional when appropriate.
          </p>
        </div>
      )}
    </div>
  );
}

export default DietRecommendations;
