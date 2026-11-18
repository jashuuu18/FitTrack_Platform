
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
import Nutrition from "./pages/Nutrition";
import WaterTracker from "./pages/WaterTracker";
import AISuggestions from "./pages/AISuggestions";
import WorkoutTimer from "./pages/WorkoutTimer";
import FitnessIntegrations from "./pages/FitnessIntegrations";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import Reminders from "./pages/Reminders";
import DietPlans from "./pages/DietPlans";
import DietPlanDetails from "./pages/DietPlanDetails";
import MyDietPlans from "./pages/MyDietPlans";
import Subscriptions from "./pages/Subscriptions";
import NutritionistConsultations from "./pages/NutritionistConsultations";
import DietRecommendations from "./pages/DietRecommendations";
import DietReminders from "./pages/DietReminders";
import DietNotifications from "./pages/DietNotifications";
import DoctorConsultations from "./pages/DoctorConsultations";


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
                    <Route path="/nutrition" element={<Nutrition />} />
                    <Route path="/water-tracker" element={<WaterTracker />} />
                    <Route path="/ai-suggestions" element={<AISuggestions />} />
                    <Route path="/workout-timer" element={<WorkoutTimer />} />
                    <Route path="/fitness-integrations" element={<FitnessIntegrations />} />
                    <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
                    <Route path="/reminders" element={<Reminders />} />
                    <Route path="/diet-plans" element={<DietPlans />} />
                    <Route path="/diet-plans/:id" element={<DietPlanDetails />} />
                    <Route path="/my-diet-plans" element={<MyDietPlans />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/nutritionist-consultations" element={<NutritionistConsultations />} />
                    <Route path="/diet-recommendations" element={<DietRecommendations />} />
                    <Route path="/diet-reminders" element={<DietReminders />} />
                    <Route path="/diet-notifications" element={<DietNotifications />} />
                    <Route path="/doctor-consultations" element={<DoctorConsultations />} />
                    
                </Routes>

            </BrowserRouter>

        </AuthProvider>

    );
}

export default App;
