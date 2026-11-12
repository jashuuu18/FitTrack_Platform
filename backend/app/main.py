
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

from app.database import Base, engine
from app.reminder_scheduler import process_due_reminders

from app.routers import (
    auth,
    workouts,
    progress,
    goals,
    reports,
    notifications,
    workout_plans,
    exercises,
    progress_comparison,
    streaks,
    badges,
    personalized_dashboard,
    nutrition,
    water_tracking,
    ai_suggestions,
    workout_sessions,
    fitness_integrations,
    advanced_analytics,
    reminders,
)


# Create all database tables
Base.metadata.create_all(bind=engine)


# Initialize FastAPI
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
app.include_router(nutrition.router)
app.include_router(water_tracking.router)
app.include_router(ai_suggestions.router)
app.include_router(workout_sessions.router)
app.include_router(fitness_integrations.router)
app.include_router(advanced_analytics.router)
app.include_router(reminders.router)


# Initialize reminder scheduler
reminder_scheduler = BackgroundScheduler(timezone="UTC")


@app.on_event("startup")
def start_reminder_scheduler():
    if not reminder_scheduler.running:
        reminder_scheduler.add_job(
            process_due_reminders,
            trigger="interval",
            seconds=30,
            id="fittrack_reminder_processor",
            replace_existing=True,
            max_instances=1,
            coalesce=True
        )

        reminder_scheduler.start()

        print("FitTrack reminder scheduler started successfully.")


@app.on_event("shutdown")
def stop_reminder_scheduler():
    if reminder_scheduler.running:
        reminder_scheduler.shutdown(wait=False)

        print("FitTrack reminder scheduler stopped.")


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to FitTrack API",
        "status": "Running"
    }


# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
