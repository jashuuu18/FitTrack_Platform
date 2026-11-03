
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";


// Get today's date in local YYYY-MM-DD format
const getToday = () => {
    const d = new Date();

    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0")
    ].join("-");
};


function Progress() {

    const [selectedDate, setSelectedDate] = useState(getToday());

    const [dailyProgress, setDailyProgress] = useState(null);

    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // Fetch daily progress
    const fetchDailyProgress = async () => {

        const response = await api.get(
            "/progress/daily",
            {
                params: {
                    target_date: selectedDate
                }
            }
        );

        setDailyProgress(response.data);
    };


    // Fetch last seven days of progress
    const fetchHistory = async () => {

        const response = await api.get(
            "/progress/history"
        );

        setHistory(response.data);
    };


    // Load dashboard information
    useEffect(() => {

        const loadProgress = async () => {

            setLoading(true);
            setError("");

            try {

                await Promise.all([
                    fetchDailyProgress(),
                    fetchHistory()
                ]);

            } catch (err) {

                setError(
                    err.response?.data?.detail ||
                    "Unable to load progress information"
                );

            } finally {

                setLoading(false);

            }
        };

        loadProgress();

    }, [selectedDate]);


    // Weekly summary calculations
    const weeklyWorkouts = history.reduce(
        (total, item) => total + item.total_workouts,
        0
    );

    const weeklyCalories = history.reduce(
        (total, item) => total + item.total_calories,
        0
    );


    // Format date for display
    const formatDate = (dateString) => {

        return new Date(
            `${dateString}T00:00:00`
        ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };


    return (

        <div className="progress-page">

            {/* Navigation */}

            <header className="dashboard-header">

                <h2>FitTrack</h2>

                <nav className="progress-nav">

                    <Link to="/dashboard">
                        Dashboard
                    </Link>

                    <Link to="/workouts">
                        Workouts
                    </Link>

                </nav>

            </header>


            <main className="progress-content">

                {/* Page heading */}

                <div className="progress-heading">

                    <div>

                        <h1>Daily Progress</h1>

                        <p>
                            Monitor your daily fitness performance.
                        </p>

                    </div>


                    <div className="date-selector">

                        <label>Select Date</label>

                        <input
                            type="date"
                            value={selectedDate}
                            max={getToday()}
                            onChange={(e) =>
                                setSelectedDate(e.target.value)
                            }
                        />

                    </div>

                </div>


                {error && (

                    <div className="error">
                        {error}
                    </div>

                )}


                {loading ? (

                    <div className="progress-loading">
                        Loading your fitness progress...
                    </div>

                ) : (

                    <>

                        {/* Daily summary */}

                        <section>

                            <h2 className="section-title">
                                Daily Summary
                            </h2>


                            <div className="progress-stats">

                                <div className="progress-card">

                                    <div className="progress-icon">
                                        <span>🏋️</span>
                                    </div>

                                    <h3>Total Workouts</h3>

                                    <h2>
                                        {dailyProgress?.total_workouts ?? 0}
                                    </h2>

                                    <p>
                                        Workouts completed
                                    </p>

                                </div>


                                <div className="progress-card">

                                    <div className="progress-icon">
                                        <span>🔥</span>
                                    </div>

                                    <h3>Calories Burned</h3>

                                    <h2>
                                        {dailyProgress?.total_calories ?? 0}
                                    </h2>

                                    <p>
                                        Calories burned (kcal)
                                    </p>

                                </div>


                            </div>

                        </section>


                        {/* Weekly summary */}

                        <section>

                            <h2 className="section-title">
                                Weekly Summary
                            </h2>


                            <div className="progress-stats">

                                <div className="progress-card weekly-card">

                                    <h3>Weekly Workouts</h3>

                                    <h2>
                                        {weeklyWorkouts}
                                    </h2>

                                    <p>
                                        Total workouts in the last 7 days
                                    </p>

                                </div>


                                <div className="progress-card weekly-card">

                                    <h3>Weekly Calories</h3>

                                    <h2>
                                        {weeklyCalories}
                                    </h2>

                                    <p>
                                        Total calories in the last 7 days
                                    </p>

                                </div>

                            </div>

                        </section>


                        {/* Progress history */}

                        <section className="progress-history">

                            <div className="history-heading">

                                <div>

                                    <h2>Daily Progress History</h2>

                                    <p>
                                        Your fitness activity over the last seven days.
                                    </p>

                                </div>

                            </div>


                            {history.length === 0 ? (

                                <p className="empty-message">
                                    No progress records available.
                                </p>

                            ) : (

                                <div className="progress-table-wrapper">

                                    <table className="progress-table">

                                        <thead>

                                            <tr>
                                                <th>Date</th>
                                                <th>Total Workouts</th>
                                                <th>Calories Burned</th>
                                            </tr>

                                        </thead>


                                        <tbody>

                                            {history.map((item) => (

                                                <tr key={item.id}>

                                                    <td>
                                                        {formatDate(item.date)}
                                                    </td>

                                                    <td>
                                                        {item.total_workouts}
                                                    </td>

                                                    <td>
                                                        {item.total_calories} kcal
                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </section>


                    </>

                )}

            </main>

        </div>

    );

}

export default Progress;
