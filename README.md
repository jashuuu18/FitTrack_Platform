# FitTrack – Fitness & Workout Management Platform

## Project Overview
FitTrack is a full-stack fitness management platform developed using **FastAPI and React**. It helps users manage workouts, monitor fitness progress, track nutrition and hydration, set goals, and maintain a healthy lifestyle.

## Technologies Used

**Frontend**
- React.js
- Vite
- HTML, CSS, JavaScript
- Axios
- Recharts

**Backend**
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- APScheduler

**Database**
- SQLite

## Features & Modules

1. User Authentication – Registration, login, JWT authentication.
2. Workout Management – Create and manage workouts.
3. Daily Progress Tracking – Monitor daily fitness activities.
4. Goal Management – Set and track fitness goals.
5. Reports & Analytics – Visualize fitness performance.
6. Notifications System – Manage user notifications.
7. Workout Plans & Scheduling – Plan upcoming workouts.
8. Exercise Library – Browse and add exercises to workouts.
9. Progress Comparison – Compare weekly and monthly performance.
10. Streak Tracking – Track consecutive workout days.
11. Achievement Badges – Reward fitness milestones.
12. Personalized Dashboard – View personalized fitness information.
13. Nutrition & Meal Tracking – Track calories and macronutrients.
14. Water Intake Tracker – Monitor daily water consumption.
15. AI Workout Suggestions – Get personalized workout recommendations.
16. Workout Timer & Live Tracking – Track workout sessions.
17. Third-Party Fitness Integration – Manage fitness provider connections and import activities.
18. Advanced Analytics Dashboard – Analyze workouts, nutrition, hydration, goals, and activity trends.
19. In-App Reminders & Alerts – Schedule reminders and receive notifications.

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd FitTrack
```

### 2. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
```

### 3. Start Backend
```powershell
uvicorn app.main:app --reload
```

Backend URL: `http://127.0.0.1:8000`

API Documentation: `http://127.0.0.1:8000/docs`

### 4. Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Key Functionalities
- Secure user authentication and protected APIs.
- User-specific workout and fitness data.
- Interactive charts and progress reports.
- Nutrition and hydration monitoring.
- Workout scheduling and exercise management.
- Fitness achievements and streak tracking.
- Personalized recommendations.
- Automated in-app reminders and alerts.

## Learning Outcomes
- Full-stack web application development.
- REST API development using FastAPI.
- React frontend integration with backend APIs.
- Database design and SQLAlchemy ORM.
- JWT-based authentication.
- Data visualization using Recharts.
- Background task scheduling.
- Building modular and scalable applications.

## Project Status
**Completed – 19 Modules**

FitTrack provides an integrated platform for workout management, fitness tracking, nutrition monitoring, and user engagement.
