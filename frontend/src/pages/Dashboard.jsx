
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const username =
    user?.username || user?.email?.split("@")[0] || "Fitness User";

  // Sidebar Navigation
  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: "⌂" },
    { name: "Workouts", path: "/workouts", icon: "🏋️" },
    { name: "Daily Progress", path: "/progress", icon: "📈" },
    { name: "My Goals", path: "/goals", icon: "🎯" },
    { name: "Reports & Analytics", path: "/reports", icon: "📊" },
    { name: "Notifications", path: "/notifications", icon: "🔔" },
    { name: "Workout Planner", path: "/workout-plans", icon: "📅" },
    { name: "Exercise Library", path: "/exercises", icon: "💪" },
    { name: "Progress Comparison", path: "/progress-comparison", icon: "📉" },
    { name: "Streak Tracking", path: "/streaks", icon: "🔥" },
    { name: "Achievement Badges", path: "/badges", icon: "🏆" },
    { name: "Personalized Dashboard", path: "/personalized-dashboard", icon: "🌟" },
    { name: "Nutrition & Meal Tracking", path: "/nutrition", icon: "🥗" },
    { name: "Water Intake Tracker", path: "/water-tracker", icon: "💧" },
    { name: "AI Workout Suggestions", path: "/ai-suggestions", icon: "🤖" },
    { name: "Workout Timer", path: "/workout-timer", icon: "⏱️" },
    { name: "Fitness Integrations", path: "/fitness-integrations", icon: "🔗" },
    { name: "Advanced Analytics", path: "/advanced-analytics", icon: "📊" },
    { name: "Reminders & Alerts", path: "/reminders", icon: "⏰" },
    { name: "Diet Plans", path: "/diet-plans", icon: "🥗" },
    { name: "My Diet Plans", path: "/my-diet-plans", icon: "🍽️" },
    { name: "Subscriptions", path: "/subscriptions", icon: "💳" },
    { name: "Nutritionist Consultation", path: "/nutritionist-consultations", icon: "👩‍⚕️" },
    { name: "Diet Recommendations", path: "/diet-recommendations", icon: "🥑" },
    { name: "Diet Reminders", path: "/diet-reminders", icon: "⏰" },
    { name: "Diet Notifications", path: "/diet-notifications", icon: "🔔" },
    { name: "Doctor Support", path: "/doctor-consultations", icon: "👨‍⚕️" }

  ];

  // Dashboard Feature Cards
  const features = [
    {
      number: "01",
      title: "Workout Management",
      description:
        "Record your exercises, manage workout sessions, and keep your training history organized.",
      path: "/workouts",
      link: "Explore Workouts",
      icon: "🏋️",
      cardClass: "workout-card",
      iconClass: "workout-icon"
    },
    {
      number: "02",
      title: "Daily Progress",
      description:
        "Review your daily workout activity and calories burned to understand your progress.",
      path: "/progress",
      link: "View Progress",
      icon: "📊",
      cardClass: "progress-card",
      iconClass: "progress-icon"
    },
    {
      number: "03",
      title: "Fitness Goals",
      description:
        "Set personal targets, update your progress, and celebrate your fitness achievements.",
      path: "/goals",
      link: "Manage Goals",
      icon: "🎯",
      cardClass: "goals-card",
      iconClass: "goals-icon"
    },
    {
      number: "04",
      title: "Reports & Analytics",
      description:
        "Analyze your weekly and monthly fitness activity, calorie burn, workout categories, and goal performance.",
      path: "/reports",
      link: "View Reports",
      icon: "📈",
      cardClass: "reports-card",
      iconClass: "reports-icon"
    },
    {
      number: "05",
      title: "Notifications",
      description:
        "Stay updated with workout activities, goal achievements, and important fitness reminders.",
      path: "/notifications",
      link: "View Notifications",
      icon: "🔔",
      cardClass: "notifications-card",
      iconClass: "notifications-icon"
    },
    {
      number: "06",
      title: "Workout Planner",
      description:
        "Schedule your workouts in advance, manage upcoming fitness activities, and organize your training calendar.",
      path: "/workout-plans",
      link: "Open Workout Planner",
      icon: "📅",
      cardClass: "planner-card",
      iconClass: "planner-icon"
    },
    {
      number: "07",
      title: "Exercise Library",
      description:
        "Explore predefined Cardio, Strength, and Yoga exercises. Search exercises and add them to your workout history.",
      path: "/exercises",
      link: "Explore Exercises",
      icon: "💪",
      cardClass: "exercise-card",
      iconClass: "exercise-icon"
    },
    {
      number: "08",
      title: "Progress Comparison",
      description:
        "Compare your weekly and monthly workout performance, calories burned, workout duration, and improvement trends.",
      path: "/progress-comparison",
      link: "Compare Progress",
      icon: "📉",
      cardClass: "comparison-card",
      iconClass: "comparison-icon"
    },
    {
      number: "09",
      title: "Streak Tracking",
      description:
        "Track your current and longest workout streaks. Build consistency and maintain your daily fitness habits.",
      path: "/streaks",
      link: "View My Streaks",
      icon: "🔥",
      cardClass: "streak-card",
      iconClass: "streak-icon"
    },
    {
      number: "10",
      title: "Achievement Badges",
      description:
        "Earn rewards by completing workouts, maintaining workout streaks, and achieving your fitness goals.",
      path: "/badges",
      link: "View My Badges",
      icon: "🏆",
      cardClass: "badges-card",
      iconClass: "badges-icon"
    },
    {
      number: "11",
      title: "Personalized Dashboard",
      description:
        "View your complete fitness overview, workout statistics, goals, streaks, upcoming workouts, and achievements.",
      path: "/personalized-dashboard",
      link: "View My Fitness Overview",
      icon: "🌟",
      cardClass: "personalized-card",
      iconClass: "personalized-icon"
    },
    {
      number: "12",
      title: "Nutrition & Meal Tracking",
      description:
        "Track your daily meals, calories, protein, carbohydrates, and fats to support your fitness goals.",
      path: "/nutrition",
      link: "Track Your Nutrition",
      icon: "🥗",
      cardClass: "nutrition-card",
      iconClass: "nutrition-icon"
    },
    {
      number: "13",
      title: "Water Intake Tracker",
      description:
        "Track your daily water consumption, monitor hydration progress, and stay on top of your daily water goal.",
      path: "/water-tracker",
      link: "Track Water Intake",
      icon: "💧",
      cardClass: "water-card",
      iconClass: "water-icon"
    },
    {
      number: "14",
      title: "AI Workout Suggestions",
      description:
        "Get personalized workout recommendations based on your fitness goals, recent workout activity, and current streak.",
      path: "/ai-suggestions",
      link: "Get Workout Suggestions",
      icon: "🤖",
      cardClass: "ai-suggestions-card",
      iconClass: "ai-suggestions-icon"
    },
    {
      number: "15",
      title: "Workout Timer",
      description:
        "Start, pause, resume, and track your workout sessions in real time. Save completed sessions and view your workout history.",
      path: "/workout-timer",
      link: "Start Workout Timer",
      icon: "⏱️",
      cardClass: "timer-card",
      iconClass: "timer-icon"
    },
    {
      number: "16",
      title: "Fitness Integrations",
      description:
        "Manage connected fitness providers and import external activities from supported fitness platforms.",
      path: "/fitness-integrations",
      link: "Manage Fitness Integrations",
      icon: "🔗",
      cardClass: "integrations-card",
      iconClass: "integrations-icon"
    },
    {
      number: "17",
      title: "Advanced Analytics",
      description:
        "Explore detailed fitness, nutrition, hydration, and workout reports with interactive charts and date filters.",
      path: "/advanced-analytics",
      link: "Explore Advanced Analytics",
      icon: "📊",
      cardClass: "advanced-analytics-card",
      iconClass: "advanced-analytics-icon"
    },
    {
      number: "18",
      title: "Reminders & Alerts",
      description:
        "Schedule workout, water intake, meal, and fitness goal reminders. Receive in-app notifications when reminders become due.",
      path: "/reminders",
      link: "Manage Reminders",
      icon: "⏰",
      cardClass: "reminders-card",
      iconClass: "reminders-icon"
    },
    {
      number: "19",
      title: "Diet Plans",
      description:
        "Explore structured diet plans, check daily calorie requirements, and select a plan that supports your nutrition goals.",
      path: "/diet-plans",
      link: "Explore Diet Plans",
      icon: "🥗",
      cardClass: "diet-plans-card",
      iconClass: "diet-plans-icon"
    },
    {
      number: "20",
      title: "My Assigned Diet Plans",
      description:
        "View your selected diet plans, check their duration and calorie targets, and manage your nutrition journey.",
      path: "/my-diet-plans",
      link: "View My Diet Plans",
      icon: "🍽️",
      cardClass: "my-diet-plans-card",
      iconClass: "my-diet-plans-icon"
    },
    {
      number: "21",
      title: "Subscriptions",
      description:
        "Explore Free, Premium, and Pro membership plans, upgrade or downgrade your subscription, and view your subscription history.",
      path: "/subscriptions",
      link: "Explore Subscription Plans",
      icon: "💳",
      cardClass: "subscriptions-card",
      iconClass: "subscriptions-icon"
    },
    {
      number: "22",
      title: "Nutritionist Consultation",
      description:
        "Connect with nutrition professionals, book consultation sessions, and manage your upcoming and previous bookings.",
      path: "/nutritionist-consultations",
      link: "Book a Consultation",
      icon: "👩‍⚕️",
      cardClass: "consultations-card",
      iconClass: "consultations-icon"
    },
    {
      number: "23",
      title: "Diet Recommendations",
      description: "Get smart nutrition suggestions based on your fitness goals and daily meals.",
      path: "/diet-recommendations",
      link: "View Recommendations",
      icon: "🥑",
      cardClass: "diet-recommendations-card",
      iconClass: "diet-recommendations-icon"
    },
    {
      number: "24",
      title: "Nutrition Reminders",
      description:
        "Schedule reminders for meals, workouts, and water intake.",
      path: "/diet-reminders",
      link: "Manage Diet Reminders",
      icon: "⏰",
      cardClass: "diet-reminders-card",
      iconClass: "diet-reminders-icon"
    },
    {
      number: "25",
      title: "Diet Notifications",
      description:
         "View meal reminders, subscription alerts, and consultation notifications.",
      path: "/diet-notifications",
      link: "View Diet Notifications",
      icon: "🔔",
      cardClass: "diet-notifications-card",
      iconClass: "diet-notifications-icon"
    },
    {
      number: "26",
      title: "Doctor Support",
      description: 
        "Find doctors, book appointments and manage your health consultations.",
      path: "/doctor-consultations",
      link: "Browse Doctors",
      icon: "👨‍⚕️",
      cardClass: "doctor-consultations-card",
      iconClass: "doctor-consultations-icon"
    },

  ];

  

  return (
    <div className="fittrack-layout">

      {/* Sidebar */}
      <aside className="fittrack-sidebar">
        <div className="fittrack-brand">
          <div className="brand-icon">F</div>
          <div>
            <h2>FitTrack</h2>
            <span>FITNESS PLATFORM</span>
          </div>
        </div>

        <div className="sidebar-label">MENU</div>

        <nav className="sidebar-navigation">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${
                item.path === "/dashboard" ? "active" : ""
              }`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="sidebar-user-info">
              <strong>{username}</strong>
              <span>Member</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span>↪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="fittrack-main">

        {/* Top Header */}
        <header className="fittrack-topbar">
          <div>
            <span className="topbar-subtitle">
              FITNESS OVERVIEW
            </span>
            <h1>Dashboard</h1>
          </div>

          <div className="topbar-profile">
            <div className="topbar-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{username}</strong>
              <span>Welcome back!</span>
            </div>
          </div>
        </header>

        {/* Welcome Banner */}
        <section className="fittrack-hero">
          <div className="hero-content">
            <span className="hero-tag">
              YOUR FITNESS JOURNEY
            </span>

            <h2>Welcome back, {username}! 👋</h2>

            <p>
              Every workout brings you one step closer to your goals.
              Stay consistent and keep moving forward.
            </p>

            <Link to="/workouts" className="hero-button">
              Start a Workout <span>→</span>
            </Link>
          </div>

          <div className="hero-decoration" aria-hidden="true">
            <div className="hero-circle circle-one"></div>
            <div className="hero-circle circle-two"></div>
            <div className="hero-figure">💪</div>
          </div>
        </section>

        {/* Section Heading */}
        <section className="dashboard-section-heading">
          <div>
            <h2>Your Fitness Hub</h2>
            <p>
              Everything you need to manage your fitness journey.
            </p>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="fittrack-feature-grid">
          {features.map((feature) => (
            <article
              className={`fittrack-feature-card ${feature.cardClass}`}
              key={feature.path}
            >
              <div className="feature-card-top">
                <div className={`feature-icon ${feature.iconClass}`}>
                  {feature.icon}
                </div>

                <span className="feature-number">
                  {feature.number}
                </span>
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>

              <Link to={feature.path} className="feature-link">
                {feature.link} <span>→</span>
              </Link>
            </article>
          ))}
        </section>

        {/* Footer */}
        <footer className="fittrack-footer">
          <span>© {new Date().getFullYear()} FitTrack</span>
          <span>Stay active. Stay consistent. Stay healthy.</span>
        </footer>

      </main>
    </div>
  );
}

export default Dashboard;
