import calendar
from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Workout

router = APIRouter(
    prefix="/api/v1/progress-comparison",
    tags=["Progress Comparison"]
)


def get_workout_stats(db: Session, user_id: int, start_date: date, end_date: date):
    """Calculate workout totals and daily statistics for a date range."""

    workouts = (
        db.query(Workout)
        .filter(
            Workout.user_id == user_id,
            Workout.workout_date >= start_date,
            Workout.workout_date <= end_date
        )
        .order_by(Workout.workout_date.asc())
        .all()
    )

    daily_data = {}

    current_date = start_date
    while current_date <= end_date:
        daily_data[current_date] = {
            "date": current_date.isoformat(),
            "workouts": 0,
            "calories": 0,
            "duration": 0
        }
        current_date += timedelta(days=1)

    total_calories = 0
    total_duration = 0

    for workout in workouts:
        day = workout.workout_date

        if day not in daily_data:
            continue

        calories = workout.calories_burned or 0
        duration = workout.duration or 0

        daily_data[day]["workouts"] += 1
        daily_data[day]["calories"] += calories
        daily_data[day]["duration"] += duration

        total_calories += calories
        total_duration += duration

    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "total_workouts": len(workouts),
        "total_calories": total_calories,
        "total_duration": total_duration,
        "daily": list(daily_data.values())
    }


def calculate_change(current: int, previous: int):
    """Return percentage change, or None when there is no previous baseline."""

    if previous == 0:
        return 0 if current == 0 else None

    return round(((current - previous) / previous) * 100, 2)


def build_comparison(current: dict, previous: dict):
    return {
        "current": current,
        "previous": previous,
        "change": {
            "workouts": calculate_change(
                current["total_workouts"],
                previous["total_workouts"]
            ),
            "calories": calculate_change(
                current["total_calories"],
                previous["total_calories"]
            ),
            "duration": calculate_change(
                current["total_duration"],
                previous["total_duration"]
            )
        }
    }


@router.get("/weekly")
def weekly_comparison(
    week_start: date | None = Query(
        default=None,
        description="Monday date of the week to compare"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Default to the Monday of the current week.
    today = date.today()
    start = week_start or (today - timedelta(days=today.weekday()))

    # Normalize a supplied date to the Monday of its week.
    start = start - timedelta(days=start.weekday())

    current_end = start + timedelta(days=6)
    previous_start = start - timedelta(days=7)
    previous_end = start - timedelta(days=1)

    current = get_workout_stats(
        db, current_user.id, start, current_end
    )
    previous = get_workout_stats(
        db, current_user.id, previous_start, previous_end
    )

    return build_comparison(current, previous)


@router.get("/monthly")
def monthly_comparison(
    year: int | None = Query(default=None, ge=2000, le=2100),
    month: int | None = Query(default=None, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    selected_year = year or today.year
    selected_month = month or today.month

    current_start = date(selected_year, selected_month, 1)
    current_last_day = calendar.monthrange(
        selected_year, selected_month
    )[1]
    current_end = date(selected_year, selected_month, current_last_day)

    # Find the previous calendar month.
    if selected_month == 1:
        previous_year = selected_year - 1
        previous_month = 12
    else:
        previous_year = selected_year
        previous_month = selected_month - 1

    previous_start = date(previous_year, previous_month, 1)
    previous_last_day = calendar.monthrange(
        previous_year, previous_month
    )[1]
    previous_end = date(
        previous_year, previous_month, previous_last_day
    )

    current = get_workout_stats(
        db, current_user.id, current_start, current_end
    )
    previous = get_workout_stats(
        db, current_user.id, previous_start, previous_end
    )

    return build_comparison(current, previous)