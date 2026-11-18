# FitTrack – Fitness & Workout Management Platform

## Project Overview
FitTrack is a full-stack fitness and health management platform built to help users manage workouts, track fitness progress, monitor nutrition, create diet plans, and access health consultation services.

## Technologies Used

**Frontend**
- React.js
- Vite
- HTML, CSS, JavaScript
- Recharts

**Backend**
- Python
- FastAPI
- SQLAlchemy
- JWT Authentication
- Bcrypt Password Hashing

**Database & Tools**
- SQLite
- REST APIs
- APScheduler
- Git & GitHub

## Modules

1. User Registration and Login
2. Workout Management
3. Daily Progress Tracking
4. Fitness Goals Management
5. Reports and Analytics
6. In-App Notifications
7. Workout Plans and Scheduling
8. Exercise Library
9. Progress Comparison
10. Streak Tracking System
11. Achievement Badges
12. Personalized Dashboard
13. Nutrition and Meal Tracking
14. Water Intake Tracker
15. AI-Based Workout Suggestions
16. Workout Timer and Live Tracking
17. Third-Party Fitness Integration
18. Advanced Analytics Dashboard
19. In-App Reminders and Alerts
20. Authentication Integration
21. Diet Plans Management
22. Meal and Nutrition Tracking
23. Subscription Plans Management
24. Nutritionist Consultation System
25. Basic AI-Based Diet Recommendations
26. Notifications and Reminders
27. Doctor Support and Appointment Booking

## Key Features

- Secure user authentication and authorization.
- Workout creation, scheduling, and tracking.
- Fitness goals, progress reports, and analytics.
- Water intake and nutrition monitoring.
- Personalized workout and diet recommendations.
- Achievement badges and workout streaks.
- Diet plans and subscription management.
- Nutritionist and doctor appointment booking.
- Automated in-app reminders and notifications.
- Interactive and user-friendly dashboard.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd FitTrack
```

### 2. Backend Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend URL: http://127.0.0.1:8000

API Documentation: http://127.0.0.1:8000/docs

### 3. Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL: http://localhost:5173

## Project Structure

```text
FitTrack/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   ├── main.py
│   │   └── reminder_scheduler.py
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

## Future Enhancements

- Online payment gateway integration.
- Real-time wearable device synchronization.
- Advanced AI-based personalized health recommendations.
- Email and SMS notifications.
- Doctor and nutritionist management portals.
- Mobile application integration.

## Project Objective

To develop a comprehensive fitness and health management platform that combines workout tracking, nutrition management, personalized recommendations, and consultation services in one application.
