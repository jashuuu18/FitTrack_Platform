
from datetime import date

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Query
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Workout, User
from app.schemas import WorkoutCreate, WorkoutResponse
from app.dependencies import get_current_user

from app.progress_utils import refresh_daily_progress
from app.notification_utils import create_notification


router = APIRouter(
    prefix="/api/v1/workouts",
    tags=["Workout Management"]
)


# =================================
# 1. CREATE WORKOUT
# =================================

@router.post(
    "/",
    response_model=WorkoutResponse,
    status_code=status.HTTP_201_CREATED
)
def create_workout(
    workout_data: WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_workout = Workout(
        user_id=current_user.id,
        workout_name=workout_data.workout_name,
        category=workout_data.category,
        duration=workout_data.duration,
        calories_burned=workout_data.calories_burned,
        workout_date=workout_data.workout_date
    )

    try:
        db.add(new_workout)
        db.flush()

        # Refresh daily progress
        refresh_daily_progress(
            db,
            current_user.id,
            workout_data.workout_date
        )

        # Create workout notification
        create_notification(
            db=db,
            user_id=current_user.id,
            title="Workout Added Successfully!",
            message=(
                f"Your workout '{new_workout.workout_name}' "
                "has been recorded successfully."
            )
        )

        db.commit()
        db.refresh(new_workout)

        return new_workout

    except Exception:
        db.rollback()
        raise


# =================================
# 2. GET USER WORKOUTS
# =================================

@router.get(
    "/",
    response_model=list[WorkoutResponse]
)
def get_workouts(
    category: str | None = Query(default=None),
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if category and category not in [
        "Cardio",
        "Strength",
        "Yoga"
    ]:
        raise HTTPException(
            status_code=422,
            detail="Invalid workout category"
        )

    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=422,
            detail="Start date cannot be after end date"
        )

    query = db.query(Workout).filter(
        Workout.user_id == current_user.id
    )

    if category:
        query = query.filter(
            Workout.category == category
        )

    if start_date:
        query = query.filter(
            Workout.workout_date >= start_date
        )

    if end_date:
        query = query.filter(
            Workout.workout_date <= end_date
        )

    return query.order_by(
        Workout.workout_date.desc(),
        Workout.id.desc()
    ).all()


# =================================
# 3. UPDATE WORKOUT
# =================================

@router.put(
    "/{workout_id}",
    response_model=WorkoutResponse
)
def update_workout(
    workout_id: int,
    workout_data: WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()

    if not workout:
        raise HTTPException(
            status_code=404,
            detail="Workout not found"
        )

    old_date = workout.workout_date

    try:
        workout.workout_name = workout_data.workout_name
        workout.category = workout_data.category
        workout.duration = workout_data.duration
        workout.calories_burned = workout_data.calories_burned
        workout.workout_date = workout_data.workout_date

        db.flush()

        # Refresh the original workout date
        refresh_daily_progress(
            db,
            current_user.id,
            old_date
        )

        # Refresh the new date if the date changed
        if old_date != workout_data.workout_date:
            refresh_daily_progress(
                db,
                current_user.id,
                workout_data.workout_date
            )

        db.commit()
        db.refresh(workout)

        return workout

    except Exception:
        db.rollback()
        raise


# =================================
# 4. DELETE WORKOUT
# =================================

@router.delete(
    "/{workout_id}"
)
def delete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()

    if not workout:
        raise HTTPException(
            status_code=404,
            detail="Workout not found"
        )

    workout_date = workout.workout_date

    try:
        db.delete(workout)
        db.flush()

        refresh_daily_progress(
            db,
            current_user.id,
            workout_date
        )

        db.commit()

        return {
            "message": "Workout deleted successfully",
            "workout_id": workout_id
        }

    except Exception:
        db.rollback()
        raise
