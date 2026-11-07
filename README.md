# FitTrack – Fitness & Workout Management Platform

## 1. Project Overview
FitTrack is a fitness and workout management platform developed using FastAPI and React. It helps users manage workouts, track fitness progress, set goals, monitor workout streaks, and earn achievement badges.

## 2. Technologies Used

**Backend**
- Python
- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication
- Pydantic

**Frontend**
- React.js
- Vite
- JavaScript
- HTML
- CSS
- Axios
- React Router DOM

## 3. Key Features

- User registration and login with JWT authentication.
- Workout creation, viewing, updating, and deletion.
- Daily fitness progress tracking.
- Fitness goal creation and progress monitoring.
- Weekly and monthly progress comparison.
- Notifications and activity reminders.
- Workout plans and scheduling.
- Exercise library with search and category filters.
- Current and longest workout streak tracking.
- Achievement badges and rewards.
- Personalized fitness dashboard.
- Protected routes and user-specific data.

## 4. Project Modules

| Module | Description |
|---|---|
| 1 | Authentication |
| 2 | Workout Management |
| 3 | Daily Progress Tracking |
| 4 | Goal Management |
| 5 | Reports & Analytics |
| 6 | Notifications System |
| 7 | Workout Plans & Scheduling |
| 8 | Exercise Library |
| 9 | Progress Comparison |
| 10 | Streak Tracking |
| 11 | Achievement Badges |
| 12 | Personalized Dashboard |

## 5. Project Structure

```text
FitTrack/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   └── main.py
│   │
│   ├── venv/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
└── README.md
```

## 6. Installation and Setup

### Backend Setup

```powershell
cd backend

python -m venv venv

.\venv\Scripts\Activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend URL: http://127.0.0.1:8000

Swagger Documentation: http://127.0.0.1:8000/docs

### Frontend Setup

Open another terminal:

```powershell
cd frontend

npm install

npm run dev
```

Frontend URL: http://localhost:5173

## 7. Database

- SQLite database.
- SQLAlchemy ORM for database operations.
- User-specific records and relationships.
- Database tables for users, workouts, progress, goals, notifications, workout plans, exercises, streaks, badges, and earned badges.

## 8. Security

- JWT-based authentication.
- Password hashing.
- Protected API endpoints.
- User-specific data access.
- Token-based frontend route protection.

## 9. Future Enhancements

- AI-powered workout recommendations.
- Integration with wearable fitness devices.
- Diet and nutrition tracking.
- Workout performance charts.
- Social fitness challenges.
- Mobile application support.

## 10. Conclusion

FitTrack provides a centralized platform for managing workouts and monitoring fitness activities. It demonstrates full-stack development using FastAPI, React, SQLAlchemy, REST APIs, and JWT authentication.
