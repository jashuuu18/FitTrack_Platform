
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Exercise, Workout, User
from app.schemas import (
    ExerciseResponse,
    ExerciseWorkoutCreate,
    ExerciseWorkoutResponse
)

router = APIRouter(
    prefix="/api/v1/exercises",
    tags=["Exercise Library"]
)


# =================================
# VIEW AND SEARCH EXERCISES
# =================================

@router.get("/", response_model=list[ExerciseResponse])
def get_exercises(
    search: str | None = Query(default=None, max_length=150),
    category: Literal["Cardio", "Strength", "Yoga"] | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Exercise)

    if search and search.strip():
        query = query.filter(
            Exercise.name.ilike(f"%{search.strip()}%")
        )

    if category:
        query = query.filter(
            Exercise.category == category
        )

    return (
        query
        .order_by(Exercise.category.asc(), Exercise.name.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# =================================
# VIEW SINGLE EXERCISE
# =================================

@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id
    ).first()

    if not exercise:
        raise HTTPException(
            status_code=404,
            detail="Exercise not found"
        )

    return exercise


# =================================
# ADD EXERCISE TO USER WORKOUTS
# =================================

@router.post(
    "/{exercise_id}/add-to-workout",
    response_model=ExerciseWorkoutResponse,
    status_code=201
)
def add_exercise_to_workout(
    exercise_id: int,
    workout_data: ExerciseWorkoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id
    ).first()

    if not exercise:
        raise HTTPException(
            status_code=404,
            detail="Exercise not found"
        )

    workout = Workout(
        user_id=current_user.id,
        workout_name=exercise.name,
        category=exercise.category,
        duration=workout_data.duration or exercise.duration,
        calories_burned=workout_data.calories_burned,
        workout_date=workout_data.workout_date
    )

    db.add(workout)
    db.commit()
    db.refresh(workout)

    return workout
