from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Workout, Streak

router = APIRouter(
    prefix="/api/v1/streaks",
    tags=["Streak Tracking"]
)


def calculate_streak(workout_dates, today):
    """
    Calculate current and longest consecutive workout-day streaks.
    Multiple workouts on one date count as one workout day.
    """

    dates = sorted({
        workout_date
        for workout_date in workout_dates
        if workout_date is not None and workout_date <= today
    })

    if not dates:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "last_workout_date": None
        }

    # Calculate the longest consecutive streak.
    longest_streak = 1
    running_streak = 1

    for index in range(1, len(dates)):
        if dates[index] == dates[index - 1] + timedelta(days=1):
            running_streak += 1
        else:
            running_streak = 1

        longest_streak = max(longest_streak, running_streak)

    # Calculate the current streak from the most recent workout date.
    last_workout_date = dates[-1]

    if last_workout_date < today - timedelta(days=1):
        current_streak = 0
    else:
        current_streak = 1

        for index in range(len(dates) - 1, 0, -1):
            if dates[index] == dates[index - 1] + timedelta(days=1):
                current_streak += 1
            else:
                break

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "last_workout_date": last_workout_date
    }


@router.get("/me")
def get_my_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    # Get all distinct workout dates belonging to this user.
    workout_dates = (
        db.query(Workout.workout_date)
        .filter(Workout.user_id == current_user.id)
        .distinct()
        .all()
    )

    dates = [row[0] for row in workout_dates]

    result = calculate_streak(dates, today)

    # Find or create this user's streak record.
    streak = (
        db.query(Streak)
        .filter(Streak.user_id == current_user.id)
        .first()
    )

    if not streak:
        streak = Streak(
            user_id=current_user.id,
            current_streak=result["current_streak"],
            longest_streak=result["longest_streak"],
            last_workout_date=result["last_workout_date"]
        )
        db.add(streak)
    else:
        streak.current_streak = result["current_streak"]
        streak.longest_streak = max(
            streak.longest_streak,
            result["longest_streak"]
        )
        streak.last_workout_date = result["last_workout_date"]

    db.commit()
    db.refresh(streak)

    return {
        "current_streak": streak.current_streak,
        "longest_streak": streak.longest_streak,
        "last_workout_date": streak.last_workout_date,
        "message": (
            "Keep going! You are building a healthy habit."
            if streak.current_streak > 0
            else "Start a workout today to begin your streak!"
        )
    }