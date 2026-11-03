# FitTrack – Fitness & Workout Management Platform

## Project Overview
FitTrack is a full-stack fitness and workout management platform developed to help users manage their workouts, monitor daily fitness progress, set personal goals, analyze performance, and receive notifications.

## Technologies Used

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication
- Pydantic

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Axios
- Recharts
- React Router DOM

## Key Features

- **User Authentication:** Secure registration and login using JWT authentication.
- **Workout Management:** Create, view, update, and delete workout records.
- **Daily Progress Tracking:** Monitor daily workouts, calories burned, and workout duration.
- **Fitness Goals:** Set personal fitness goals and track goal completion.
- **Reports & Analytics:** View weekly and monthly fitness reports using interactive charts.
- **Notifications:** Receive fitness updates, view unread notifications, mark notifications as read, and delete notifications.
- **User Data Security:** Protected API endpoints and user-specific data access.

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
│   │   ├── dependencies.py
│   │   ├── security.py
│   │   └── main.py
│   ├── venv/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

## Installation & Setup

### Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend API: http://127.0.0.1:8000

Swagger Documentation: http://127.0.0.1:8000/docs

### Frontend Setup

Open another terminal:

```bash
cd frontend

npm install

npm install recharts

npm run dev
```

Frontend: http://localhost:5173

## Security

- JWT-based authentication.
- Password hashing.
- Protected API endpoints.
- User-specific workout and fitness data.
- Input validation using Pydantic.
- Authorization checks for protected resources.

## Future Enhancements

- Fitness challenges and leaderboard.
- Wearable device integration.
- Diet and nutrition tracking.
- Workout recommendations.
- Fitness activity reminders.
- Mobile application support.

## Author

Developed as a full-stack web development project using FastAPI and React.

## Project Status

**Completed:** Core fitness management features, including authentication, workout management, progress tracking, goals, reports, and notifications.
