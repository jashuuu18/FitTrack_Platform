
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Progress from "./pages/Progress";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import WorkoutPlans from "./pages/WorkoutPlans";
import Exercises from "./pages/Exercises";
import ProgressComparison from "./pages/ProgressComparison";
import Streaks from "./pages/Streaks";
import Badges from "./pages/Badges";
import PersonalizedDashboard from "./pages/PersonalizedDashboard";


function App() {

    return (

        <AuthProvider>

            <BrowserRouter>

                <Routes>

                    <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />


                    <Route element={<ProtectedRoute />}>

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/workouts"
                            element={<Workouts />}
                        />

                        <Route
                            path="/progress"
                            element={<Progress />}
                        />

                        <Route
                            path="/goals"
                            element={<Goals />}
                        />

                        <Route
                            path="/reports"
                            element={<Reports />}
                        />
                        

                        <Route path="/notifications" element={<Notifications />} />

                        <Route
                            path="/workout-plans"
                            element={<WorkoutPlans />}
                        />

                        <Route
                            path="/exercises"
                            element={<Exercises />}
                        />

                    </Route>


                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />

                    <Route
                        path="/progress-comparison"
                        element={<ProgressComparison />}
                    />

                    <Route path="/streaks" element={<Streaks />} />
                    <Route path="/badges" element={<Badges />} />
                    <Route
                        path="/personalized-dashboard"
                        element={<PersonalizedDashboard />}
                    />

                </Routes>

            </BrowserRouter>

        </AuthProvider>

    );
}

export default App;
