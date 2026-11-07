
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import (
    User,
    Workout,
    Goal,
    WorkoutPlan,
    Streak,
    UserBadge,
    Badge,
    Notification
)

router = APIRouter(
    prefix="/api/v1/personalized-dashboard",
    tags=["Personalized Dashboard"]
)


@router.get("/")
def get_personalized_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    # 1. Workout statistics
    workouts = (
        db.query(Workout)
        .filter(Workout.user_id == current_user.id)
        .all()
    )

    total_workouts = len(workouts)

    total_calories = sum(
        workout.calories_burned or 0
        for workout in workouts
    )

    total_duration = sum(
        workout.duration or 0
        for workout in workouts
    )

    # 2. Today's workout statistics
    today_workouts = [
        workout for workout in workouts
        if workout.workout_date == today
    ]

    today_calories = sum(
        workout.calories_burned or 0
        for workout in today_workouts
    )

    today_workout_count = len(today_workouts)

    # 3. Fitness goals
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id)
        .order_by(Goal.created_at.desc())
        .all()
    )

    goal_data = []

    for goal in goals:
        target = goal.target_value or 0
        current = goal.current_value or 0

        percentage = (
            min(round((current / target) * 100, 2), 100)
            if target > 0 else 0
        )

        goal_data.append({
            "id": goal.id,
            "goal_type": goal.goal_type,
            "target_value": target,
            "current_value": current,
            "deadline": goal.deadline,
            "status": goal.status,
            "progress_percentage": percentage
        })

    # 4. Streak information
    streak = (
        db.query(Streak)
        .filter(Streak.user_id == current_user.id)
        .first()
    )

    current_streak = streak.current_streak if streak else 0
    longest_streak = streak.longest_streak if streak else 0

    # 5. Upcoming workout plans
    upcoming_plans = (
        db.query(WorkoutPlan)
        .filter(
            WorkoutPlan.user_id == current_user.id,
            WorkoutPlan.scheduled_date >= today
        )
        .order_by(WorkoutPlan.scheduled_date.asc())
        .limit(5)
        .all()
    )

    upcoming_workouts = [
        {
            "id": plan.id,
            "title": plan.title,
            "description": plan.description,
            "scheduled_date": plan.scheduled_date
        }
        for plan in upcoming_plans
    ]

    # 6. Earned badges
    earned_badges = (
        db.query(UserBadge, Badge)
        .join(Badge, UserBadge.badge_id == Badge.id)
        .filter(UserBadge.user_id == current_user.id)
        .order_by(UserBadge.earned_at.desc())
        .limit(5)
        .all()
    )

    badge_data = [
        {
            "id": badge.id,
            "name": badge.name,
            "description": badge.description,
            "icon": badge.icon,
            "earned_at": user_badge.earned_at
        }
        for user_badge, badge in earned_badges
    ]

    # 7. Recent notifications
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(5)
        .all()
    )

    notification_data = [
        {
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "is_read": notification.is_read,
            "created_at": notification.created_at
        }
        for notification in notifications
    ]

    unread_notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
        .count()
    )

    # 8. Final dashboard response
    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email
        },

        "workout_summary": {
            "total_workouts": total_workouts,
            "total_calories": total_calories,
            "total_duration": total_duration
        },

        "today_summary": {
            "workouts": today_workout_count,
            "calories": today_calories
        },

        "streak": {
            "current_streak": current_streak,
            "longest_streak": longest_streak
        },

        "goals": goal_data,

        "upcoming_workouts": upcoming_workouts,

        "earned_badges": badge_data,

        "notifications": {
            "unread_count": unread_notifications,
            "recent": notification_data
        }
    }
