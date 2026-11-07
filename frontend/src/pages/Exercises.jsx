
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./Exercises.css";

function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Exercises() {
  const [exercises, setExercises] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedExercise, setSelectedExercise] = useState(null);

  const [formData, setFormData] = useState({
    workout_date: getToday(),
    duration: "",
    calories_burned: 0,
  });

  const loadExercises = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/exercises/", {
        params: {
          search: search.trim() || undefined,
          category: category || undefined,
        },
      });

      setExercises(response.data);
    } catch (err) {
      console.error("Exercise loading error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load exercises."
      );
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const openAddWorkout = (exercise) => {
    setSelectedExercise(exercise);

    setFormData({
      workout_date: getToday(),
      duration: exercise.duration,
      calories_burned: 0,
    });

    setSuccess("");
    setError("");
  };

  const closeModal = () => {
    setSelectedExercise(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addToWorkout = async (e) => {
    e.preventDefault();

    if (!selectedExercise) return;

    try {
      setError("");
      setSuccess("");

      const payload = {
        workout_date: formData.workout_date,
        duration: Number(formData.duration),
        calories_burned: Number(formData.calories_burned),
      };

      await api.post(
        `/exercises/${selectedExercise.id}/add-to-workout`,
        payload
      );

      setSuccess(
        `${selectedExercise.name} was successfully added to your workouts!`
      );

      closeModal();
    } catch (err) {
      console.error("Add workout error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to add exercise to your workouts."
      );
    }
  };

  const getCategoryClass = (value) => {
    return value.toLowerCase();
  };

  return (
    <div className="exercises-page">

      {/* PAGE HEADER */}

      <div className="exercises-header">
        <div>
          <h1>Exercise Library</h1>

          <p>
            Explore exercises and add them to your workout records.
          </p>
        </div>
      </div>

      {/* ALERTS */}

      {error && (
        <div className="exercise-error">
          {error}
        </div>
      )}

      {success && (
        <div className="exercise-success">
          {success}
        </div>
      )}

      {/* SEARCH AND FILTER */}

      <div className="exercise-filter-section">

        <div className="exercise-search">
          <input
            type="search"
            placeholder="Search exercises by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="exercise-category-filter">

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Cardio">Cardio</option>
            <option value="Strength">Strength</option>
            <option value="Yoga">Yoga</option>
          </select>

        </div>

      </div>

      {/* EXERCISE COUNT */}

      <div className="exercise-results-header">
        <h2>Available Exercises</h2>

        <span>
          {exercises.length} exercises found
        </span>
      </div>

      {/* EXERCISE LIST */}

      {loading ? (
        <div className="exercise-loading">
          Loading exercises...
        </div>
      ) : exercises.length === 0 ? (
        <div className="exercise-empty">
          <h3>No Exercises Found</h3>

          <p>
            Try another search term or select a different category.
          </p>
        </div>
      ) : (

        <div className="exercise-grid">

          {exercises.map((exercise) => (

            <div
              className="exercise-card"
              key={exercise.id}
            >

              <div className="exercise-card-top">

                <span
                  className={`exercise-category ${getCategoryClass(
                    exercise.category
                  )}`}
                >
                  {exercise.category}
                </span>

                <span className="exercise-duration">
                  {exercise.duration} min
                </span>

              </div>

              <h3>{exercise.name}</h3>

              <p className="exercise-description">
                {exercise.description}
              </p>

              <div className="exercise-card-footer">

                <span>
                  Recommended duration
                </span>

                <button
                  onClick={() => openAddWorkout(exercise)}
                >
                  Add to Workout
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

      {/* ADD TO WORKOUT MODAL */}

      {selectedExercise && (

        <div className="exercise-modal-overlay">

          <div className="exercise-modal">

            <div className="exercise-modal-header">

              <div>
                <h2>Add to Workout</h2>

                <p>{selectedExercise.name}</p>
              </div>

              <button
                type="button"
                className="exercise-close-btn"
                onClick={closeModal}
              >
                &times;
              </button>

            </div>

            <form onSubmit={addToWorkout}>

              <label>Workout Date</label>

              <input
                type="date"
                name="workout_date"
                value={formData.workout_date}
                onChange={handleFormChange}
                max={getToday()}
                required
              />

              <label>Duration (minutes)</label>

              <input
                type="number"
                name="duration"
                min="1"
                value={formData.duration}
                onChange={handleFormChange}
                required
              />

              <label>Calories Burned</label>

              <input
                type="number"
                name="calories_burned"
                min="0"
                value={formData.calories_burned}
                onChange={handleFormChange}
                required
              />

              <p className="exercise-modal-note">
                The exercise will be saved in your existing workout history.
                Calories are entered manually.
              </p>

              <div className="exercise-modal-actions">

                <button
                  type="button"
                  className="exercise-cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="exercise-save-btn"
                >
                  Add Workout
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Exercises;
