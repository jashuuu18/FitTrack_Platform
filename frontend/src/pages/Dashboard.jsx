
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

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: "⌂" },
    { name: "Workouts", path: "/workouts", icon: "🏋️" },
    { name: "Daily Progress", path: "/progress", icon: "📈" },
    { name: "My Goals", path: "/goals", icon: "🎯" },
    { name: "Reports & Analytics", path: "/reports", icon: "📊" },
    { name: "Notifications", path: "/notifications", icon: "🔔" },
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
        <header className="fittrack-topbar">
          <div>
            <span className="topbar-subtitle">FITNESS OVERVIEW</span>
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
            <span className="hero-tag">YOUR FITNESS JOURNEY</span>

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
            <p>Everything you need to manage your fitness journey.</p>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="fittrack-feature-grid">
          {/* Workout Card */}
          <article className="fittrack-feature-card workout-card">
            <div className="feature-card-top">
              <div className="feature-icon workout-icon">🏋️</div>
              <span className="feature-number">01</span>
            </div>

            <h3>Workout Management</h3>

            <p>
              Record your exercises, manage workout sessions,
              and keep your training history organized.
            </p>

            <Link to="/workouts" className="feature-link">
              Explore Workouts <span>→</span>
            </Link>
          </article>

          {/* Progress Card */}
          <article className="fittrack-feature-card progress-card">
            <div className="feature-card-top">
              <div className="feature-icon progress-icon">📊</div>
              <span className="feature-number">02</span>
            </div>

            <h3>Daily Progress</h3>

            <p>
              Review your daily workout activity and calories
              burned to understand your progress.
            </p>

            <Link to="/progress" className="feature-link">
              View Progress <span>→</span>
            </Link>
          </article>

          {/* Goals Card */}
          <article className="fittrack-feature-card goals-card">
            <div className="feature-card-top">
              <div className="feature-icon goals-icon">🎯</div>
              <span className="feature-number">03</span>
            </div>

            <h3>Fitness Goals</h3>

            <p>
              Set personal targets, update your progress,
              and celebrate your fitness achievements.
            </p>

            <Link to="/goals" className="feature-link">
              Manage Goals <span>→</span>
            </Link>
          </article>

          {/* Reports Card */}
          <article className="fittrack-feature-card reports-card">
            <div className="feature-card-top">
              <div className="feature-icon reports-icon">📈</div>
              <span className="feature-number">04</span>
            </div>

            <h3>Reports & Analytics</h3>

            <p>
              Analyze your weekly and monthly fitness activity,
              calorie burn, workout categories, and goal performance.
            </p>

            <Link to="/reports" className="feature-link">
              View Reports <span>→</span>
            </Link>
          </article>

          {/* Notifications Card */}
          <article className="fittrack-feature-card notifications-card">
            <div className="feature-card-top">
              <div className="feature-icon notifications-icon">🔔</div>
              <span className="feature-number">05</span>
            </div>

            <h3>Notifications</h3>

            <p>
              Stay updated with workout activities, goal achievements,
              and important fitness reminders.
            </p>

            <Link to="/notifications" className="feature-link">
              View Notifications <span>→</span>
            </Link>
          </article>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Choose what you want to do next.</p>
            </div>
          </div>

          <div className="quick-actions-grid">
            <Link to="/workouts" className="quick-action">
              <span className="quick-action-icon">＋</span>

              <span>
                <strong>Add Workout</strong>
                <small>Record a new session</small>
              </span>

              <span className="quick-arrow">→</span>
            </Link>

            <Link to="/progress" className="quick-action">
              <span className="quick-action-icon">↗</span>

              <span>
                <strong>Check Progress</strong>
                <small>Review your daily activity</small>
              </span>

              <span className="quick-arrow">→</span>
            </Link>

            <Link to="/goals" className="quick-action">
              <span className="quick-action-icon">◎</span>

              <span>
                <strong>Update Goals</strong>
                <small>Track your targets</small>
              </span>

              <span className="quick-arrow">→</span>
            </Link>

            <Link to="/reports" className="quick-action">
              <span className="quick-action-icon">📊</span>

              <span>
                <strong>View Reports</strong>
                <small>Analyze your fitness performance</small>
              </span>

              <span className="quick-arrow">→</span>
            </Link>

            <Link to="/notifications" className="quick-action">
              <span className="quick-action-icon">🔔</span>

              <span>
                <strong>View Notifications</strong>
                <small>Check your latest updates</small>
              </span>

              <span className="quick-arrow">→</span>
            </Link>
          </div>
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
