
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./Nutrition.css";

const initialForm = {
  meal_type: "Breakfast",
  food_name: "",
  calories: "",
  protein: "",
  carbs: "",
  fats: ""
};

function Nutrition() {
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState({
    total_meals: 0,
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fats: 0
  });

  const [form, setForm] = useState(initialForm);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadNutrition = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [mealResponse, summaryResponse] = await Promise.all([
        api.get("/nutrition/meals", {
          params: { selected_date: selectedDate }
        }),
        api.get("/nutrition/summary", {
          params: { selected_date: selectedDate }
        })
      ]);

      setMeals(mealResponse.data);
      setSummary(summaryResponse.data);
    } catch (err) {
      console.error("Nutrition loading error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load nutrition information."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadNutrition();
  }, [loadNutrition]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...form,
        food_name: form.food_name.trim(),
        calories: Number(form.calories),
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fats: Number(form.fats)
      };

      await api.post("/nutrition/meals", payload);

      setForm(initialForm);
      setSuccess("Meal added successfully!");

      await loadNutrition();
    } catch (err) {
      console.error("Meal creation error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to add meal. Please check your information."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (mealId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this meal?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/nutrition/meals/${mealId}`);

      setSuccess("Meal deleted successfully!");

      await loadNutrition();
    } catch (err) {
      console.error("Meal deletion error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to delete meal."
      );
    }
  };

  const mealTypes = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snacks"
  ];

  const mealIcons = {
    Breakfast: "🌅",
    Lunch: "🍱",
    Dinner: "🍽️",
    Snacks: "🍎"
  };

  const groupedMeals = mealTypes.map((type) => ({
    type,
    meals: meals.filter((meal) => meal.meal_type === type)
  }));

  return (
    <div className="nutrition-page">

      <div className="nutrition-header">
        <div>
          <h1>Nutrition Tracker</h1>
          <p>Track your meals and monitor your daily nutrition.</p>
        </div>
      </div>

      <div className="nutrition-date">
        <label htmlFor="nutrition-date">Select Date</label>

        <input
          id="nutrition-date"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />

        <button onClick={loadNutrition}>
          Refresh
        </button>
      </div>

      {error && (
        <div className="nutrition-alert error">
          {typeof error === "string"
            ? error
            : JSON.stringify(error)}
        </div>
      )}

      {success && (
        <div className="nutrition-alert success">
          {success}
        </div>
      )}

      {/* Nutrition summary cards */}

      <div className="nutrition-summary-grid">

        <div className="nutrition-stat calories">
          <span>🔥</span>
          <p>Total Calories</p>
          <h2>{Number(summary.total_calories).toFixed(0)}</h2>
          <small>kcal consumed</small>
        </div>

        <div className="nutrition-stat protein">
          <span>💪</span>
          <p>Protein</p>
          <h2>{Number(summary.total_protein).toFixed(1)} g</h2>
          <small>Daily intake</small>
        </div>

        <div className="nutrition-stat carbs">
          <span>🌾</span>
          <p>Carbohydrates</p>
          <h2>{Number(summary.total_carbs).toFixed(1)} g</h2>
          <small>Daily intake</small>
        </div>

        <div className="nutrition-stat fats">
          <span>🥑</span>
          <p>Fats</p>
          <h2>{Number(summary.total_fats).toFixed(1)} g</h2>
          <small>Daily intake</small>
        </div>

      </div>

      {/* Add meal form */}

      <section className="nutrition-section">
        <div className="nutrition-section-header">
          <h2>Add New Meal</h2>
          <span>{summary.total_meals} meals recorded</span>
        </div>

        <form
          className="nutrition-form"
          onSubmit={handleSubmit}
        >

          <div className="nutrition-form-grid">

            <div className="nutrition-field">
              <label>Meal Type</label>

              <select
                name="meal_type"
                value={form.meal_type}
                onChange={handleChange}
                required
              >
                {mealTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="nutrition-field">
              <label>Food Name</label>

              <input
                type="text"
                name="food_name"
                placeholder="Enter food name"
                value={form.food_name}
                onChange={handleChange}
                minLength={2}
                maxLength={150}
                required
              />
            </div>

            <div className="nutrition-field">
              <label>Calories (kcal)</label>

              <input
                type="number"
                name="calories"
                placeholder="Calories"
                value={form.calories}
                onChange={handleChange}
                min="0"
                max="10000"
                step="0.1"
                required
              />
            </div>

            <div className="nutrition-field">
              <label>Protein (g)</label>

              <input
                type="number"
                name="protein"
                placeholder="Protein"
                value={form.protein}
                onChange={handleChange}
                min="0"
                max="1000"
                step="0.1"
                required
              />
            </div>

            <div className="nutrition-field">
              <label>Carbohydrates (g)</label>

              <input
                type="number"
                name="carbs"
                placeholder="Carbohydrates"
                value={form.carbs}
                onChange={handleChange}
                min="0"
                max="1000"
                step="0.1"
                required
              />
            </div>

            <div className="nutrition-field">
              <label>Fats (g)</label>

              <input
                type="number"
                name="fats"
                placeholder="Fats"
                value={form.fats}
                onChange={handleChange}
                min="0"
                max="1000"
                step="0.1"
                required
              />
            </div>

          </div>

          <button
            className="nutrition-submit"
            type="submit"
            disabled={saving}
          >
            {saving ? "Adding Meal..." : "+ Add Meal"}
          </button>

        </form>
      </section>

      {/* Meal history */}

      <section className="nutrition-section">
        <div className="nutrition-section-header">
          <h2>Daily Meal History</h2>
          <span>{selectedDate}</span>
        </div>

        {loading ? (
          <p className="nutrition-empty">Loading meals...</p>
        ) : meals.length === 0 ? (
          <div className="nutrition-empty">
            <span>🥗</span>
            <h3>No meals recorded</h3>
            <p>Add your first meal using the form above.</p>
          </div>
        ) : (
          <div className="meal-groups">
            {groupedMeals.map((group) => (
              group.meals.length > 0 && (
                <div className="meal-group" key={group.type}>

                  <h3>
                    {mealIcons[group.type]} {group.type}
                  </h3>

                  {group.meals.map((meal) => (
                    <div className="meal-card" key={meal.id}>

                      <div className="meal-info">
                        <h4>{meal.food_name}</h4>
                        <p>
                          {Number(meal.calories).toFixed(0)} kcal
                        </p>

                        <div className="meal-macros">
                          <span>
                            Protein: {meal.protein} g
                          </span>
                          <span>
                            Carbs: {meal.carbs} g
                          </span>
                          <span>
                            Fats: {meal.fats} g
                          </span>
                        </div>
                      </div>

                      <button
                        className="meal-delete"
                        onClick={() => handleDelete(meal.id)}
                      >
                        Delete
                      </button>

                    </div>
                  ))}

                </div>
              )
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default Nutrition;
