
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Workouts() {

    const initialForm = {
        workout_name: "",
        category: "Cardio",
        duration: "",
        calories_burned: "",
        workout_date: new Date().toLocaleDateString("en-CA")
    };

    const [workouts, setWorkouts] = useState([]);

    const [form, setForm] = useState(initialForm);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");

    const [filter, setFilter] = useState("All");


    // Load workouts when page opens
    useEffect(() => {
        fetchWorkouts();
    }, []);


    // Fetch workouts from backend
    
const fetchWorkouts = async () => {
    setLoading(true);
    setError("");

    try {
        const response = await api.get("/workouts/");

        console.log("Workout API Response:", response.data);

        if (Array.isArray(response.data)) {
            setWorkouts(response.data);
        } else {
            setWorkouts([]);
            setError("Unexpected workout response format");
        }

    } catch (err) {
        console.error("Workout Fetch Error:", err);

        setError(
            err.response?.data?.detail ||
            err.message ||
            "Unable to load workouts"
        );

    } finally {
        setLoading(false);
    }
};


    // Handle input changes
    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });
    };


    // Add or update workout
    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setMessage("");
        setSaving(true);

        const payload = {
            ...form,
            duration: Number(form.duration),
            calories_burned: Number(form.calories_burned)
        };

        try {

            if (editingId) {

                await api.put(
                    `/workouts/${editingId}`,
                    payload
                );

                setMessage("Workout updated successfully!");

            } else {

                await api.post(
                    "/workouts/",
                    payload
                );

                setMessage("Workout added successfully!");

            }

            setForm({
                ...initialForm,
                workout_date: new Date().toLocaleDateString("en-CA")
            });

            setEditingId(null);

            await fetchWorkouts();

        } catch (err) {

            setError(
                err.response?.data?.detail ||
                "Something went wrong"
            );

        } finally {

            setSaving(false);

        }
    };


    // Load workout details into form
    const handleEdit = (workout) => {

        setEditingId(workout.id);

        setForm({
            workout_name: workout.workout_name,
            category: workout.category,
            duration: String(workout.duration),
            calories_burned: String(workout.calories_burned),
            workout_date: workout.workout_date
        });

        setMessage("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // Delete workout
    const handleDelete = async (workoutId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this workout?"
        );

        if (!confirmed) return;

        setError("");
        setMessage("");

        try {

            await api.delete(
                `/workouts/${workoutId}`
            );

            setMessage("Workout deleted successfully!");

            if (editingId === workoutId) {
                cancelEdit();
            }

            await fetchWorkouts();

        } catch (err) {

            setError(
                err.response?.data?.detail ||
                "Unable to delete workout"
            );

        }
    };


    // Cancel editing
    const cancelEdit = () => {

        setEditingId(null);

        setForm({
            ...initialForm,
            workout_date: new Date().toLocaleDateString("en-CA")
        });

        setError("");
    };


    // Category filter
    const filteredWorkouts = workouts.filter((workout) => {

        if (filter === "All") return true;

        return workout.category === filter;
    });


    // Summary calculations
    const totalWorkouts = workouts.length;

    const totalCalories = workouts.reduce(
        (total, workout) => total + workout.calories_burned,
        0
    );

    const totalDuration = workouts.reduce(
        (total, workout) => total + workout.duration,
        0
    );


    return (

        <div className="workout-page">

            <header className="dashboard-header">

                <h2>FitTrack</h2>

                <nav className="workout-nav">
                    <Link to="/dashboard">Dashboard</Link>
                </nav>

            </header>


            <main className="workout-content">

                <div className="page-heading">

                    <div>
                        <h1>Workout Management</h1>

                        <p>
                            Record and manage your fitness activities.
                        </p>
                    </div>

                </div>


                {/* Summary cards */}

                <div className="workout-stats">

                    <div className="workout-stat-card">
                        <h3>Total Workouts</h3>
                        <h2>{totalWorkouts}</h2>
                    </div>

                    <div className="workout-stat-card">
                        <h3>Calories Burned</h3>
                        <h2>{totalCalories}</h2>
                    </div>

                    <div className="workout-stat-card">
                        <h3>Total Duration</h3>
                        <h2>{totalDuration} min</h2>
                    </div>

                </div>


                {/* Add/Edit workout form */}

                <section className="workout-form-card">

                    <h2>
                        {editingId
                            ? "Edit Workout"
                            : "Add New Workout"}
                    </h2>

                    {message && (
                        <div className="success">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="error">
                            {error}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        <div className="form-grid">

                            <div>
                                <label>Workout Name</label>

                                <input
                                    type="text"
                                    name="workout_name"
                                    value={form.workout_name}
                                    onChange={handleChange}
                                    placeholder="Example: Morning Running"
                                    minLength={2}
                                    maxLength={100}
                                    required
                                />
                            </div>


                            <div>
                                <label>Workout Category</label>

                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                >
                                    <option value="Cardio">
                                        Cardio
                                    </option>

                                    <option value="Strength">
                                        Strength
                                    </option>

                                    <option value="Yoga">
                                        Yoga
                                    </option>

                                </select>
                            </div>


                            <div>
                                <label>Duration (Minutes)</label>

                                <input
                                    type="number"
                                    name="duration"
                                    value={form.duration}
                                    onChange={handleChange}
                                    placeholder="30"
                                    min="1"
                                    max="1440"
                                    required
                                />
                            </div>


                            <div>
                                <label>Calories Burned</label>

                                <input
                                    type="number"
                                    name="calories_burned"
                                    value={form.calories_burned}
                                    onChange={handleChange}
                                    placeholder="250"
                                    min="0"
                                    max="100000"
                                    required
                                />
                            </div>


                            <div>
                                <label>Workout Date</label>

                                <input
                                    type="date"
                                    name="workout_date"
                                    value={form.workout_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                        </div>


                        <div className="form-buttons">

                            <button
                                type="submit"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                    ? "Update Workout"
                                    : "Add Workout"}
                            </button>


                            {editingId && (

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={cancelEdit}
                                >
                                    Cancel
                                </button>

                            )}

                        </div>

                    </form>

                </section>


                {/* Workout history */}

                <section className="workout-list-section">

                    <div className="list-heading">

                        <div>
                            <h2>Workout History</h2>

                            <p>
                                Your recorded fitness activities.
                            </p>
                        </div>


                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Cardio">Cardio</option>
                            <option value="Strength">Strength</option>
                            <option value="Yoga">Yoga</option>
                        </select>

                    </div>


                    {loading ? (

                        <p className="empty-message">
                            Loading workouts...
                        </p>

                    ) : filteredWorkouts.length === 0 ? (

                        <p className="empty-message">
                            No workouts found. Add your first workout!
                        </p>

                    ) : (

                        <div className="workout-table-wrapper">

                            <table className="workout-table">

                                <thead>
                                    <tr>
                                        <th>Workout</th>
                                        <th>Category</th>
                                        <th>Duration</th>
                                        <th>Calories</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>


                                <tbody>

                                    {filteredWorkouts.map((workout) => (

                                        <tr key={workout.id}>

                                            <td>
                                                {workout.workout_name}
                                            </td>

                                            <td>
                                                <span className="category-badge">
                                                    {workout.category}
                                                </span>
                                            </td>

                                            <td>
                                                {workout.duration} min
                                            </td>

                                            <td>
                                                {workout.calories_burned} kcal
                                            </td>

                                            <td>
                                                {workout.workout_date}
                                            </td>

                                            <td>

                                                <div className="action-buttons">

                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => handleEdit(workout)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDelete(workout.id)}
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

        </div>

    );
}

export default Workouts;
