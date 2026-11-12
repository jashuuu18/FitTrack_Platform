
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, WorkoutSession
from app.schemas import (
    WorkoutSessionCreate,
    WorkoutSessionFinish,
    WorkoutSessionResponse,
)

router = APIRouter(
    prefix="/api/v1/workout-sessions",
    tags=["Workout Timer & Live Tracking"]
)


@router.post(
    "/",
    response_model=WorkoutSessionResponse,
    status_code=status.HTTP_201_CREATED
)
def start_workout_session(
    session_data: WorkoutSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Prevent multiple active sessions for the same user.
    active_session = (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.user_id == current_user.id,
            WorkoutSession.status == "active"
        )
        .first()
    )

    if active_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active workout session. Finish it first."
        )

    new_session = WorkoutSession(
        user_id=current_user.id,
        workout_name=session_data.workout_name,
        category=session_data.category,
        duration_seconds=0,
        status="active"
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session


@router.get(
    "/active",
    response_model=WorkoutSessionResponse | None
)
def get_active_workout_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.user_id == current_user.id,
            WorkoutSession.status == "active"
        )
        .order_by(WorkoutSession.id.desc())
        .first()
    )


@router.get(
    "/",
    response_model=list[WorkoutSessionResponse]
)
def get_workout_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == current_user.id)
        .order_by(WorkoutSession.created_at.desc())
        .all()
    )


@router.post(
    "/{session_id}/finish",
    response_model=WorkoutSessionResponse
)
def finish_workout_session(
    session_id: int,
    finish_data: WorkoutSessionFinish,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.id == session_id,
            WorkoutSession.user_id == current_user.id
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout session not found"
        )

    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This workout session has already been finished."
        )

    session.duration_seconds = finish_data.duration_seconds
    session.ended_at = datetime.now(timezone.utc)
    session.status = "completed"

    db.commit()
    db.refresh(session)

    return session
