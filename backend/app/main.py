
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, workouts, progress, goals, reports, notifications, workout_plans, exercises, progress_comparison, streaks, badges, personalized_dashboard

# Create all database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="FitTrack API",
    description="Fitness and Workout Management Platform",
    version="1.0.0"
)


# React frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Register API routers
app.include_router(auth.router)
app.include_router(workouts.router)
app.include_router(progress.router)
app.include_router(goals.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(workout_plans.router)
app.include_router(exercises.router)
app.include_router(progress_comparison.router)
app.include_router(streaks.router)
app.include_router(badges.router)
app.include_router(personalized_dashboard.router)

@app.get("/")
def home():
    return {
        "message": "Welcome to FitTrack API",
        "status": "Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
