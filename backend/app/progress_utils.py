
from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Workout, Progress


def refresh_daily_progress(
    db: Session,
    user_id: int,
    progress_date: date
):
    """
    Recalculate the daily workout count and calories
    for one user on one specific date.
    """

    result = db.query(
        func.count(Workout.id),
        func.coalesce(
            func.sum(Workout.calories_burned),
            0
        )
    ).filter(
        Workout.user_id == user_id,
        Workout.workout_date == progress_date
    ).one()

    total_workouts = result[0]
    total_calories = result[1]

    progress = db.query(Progress).filter(
        Progress.user_id == user_id,
        Progress.date == progress_date
    ).first()

    if progress is None:

        progress = Progress(
            user_id=user_id,
            total_workouts=total_workouts,
            total_calories=total_calories,
            date=progress_date
        )

        db.add(progress)

    else:

        progress.total_workouts = total_workouts
        progress.total_calories = total_calories

    db.flush()

    return progress
