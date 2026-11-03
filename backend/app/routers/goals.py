
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Goal, User
from app.schemas import (
    GoalCreate,
    GoalUpdate,
    GoalProgressUpdate,
    GoalResponse,
)
from app.goal_utils import (
    calculate_progress_percentage,
    update_goal_status,
)
from app.notification_utils import create_notification


router = APIRouter(
    prefix="/api/v1/goals",
    tags=["Goal Setting"]
)


# =================================
# HELPER FUNCTIONS
# =================================

def is_goal_completed(goal):
    """Check whether a goal has COMPLETED status."""
    goal_status = getattr(goal.status, "value", goal.status)
    return goal_status == "COMPLETED"


def notify_if_goal_completed(
    db: Session,
    goal: Goal,
    was_completed: bool,
    user_id: int
):
    """Create a notification when a goal first becomes completed."""

    if not was_completed and is_goal_completed(goal):
        create_notification(
            db=db,
            user_id=user_id,
            title="Congratulations! Goal Completed!",
            message=(
                f"You have successfully completed your "
                f"{goal.goal_type} fitness goal."
            )
        )


def prepare_goal_response(goal):
    """Refresh status and calculate percentage for the API response."""
    update_goal_status(goal)

    return {
        "id": goal.id,
        "user_id": goal.user_id,
        "goal_type": goal.goal_type,
        "target_value": goal.target_value,
        "current_value": goal.current_value,
        "starting_value": goal.starting_value,
        "deadline": goal.deadline,
        "status": goal.status,
        "progress_percentage": calculate_progress_percentage(goal),
        "created_at": goal.created_at,
    }


# =================================
# 1. CREATE GOAL
# =================================

@router.post(
    "/",
    response_model=GoalResponse,
    status_code=status.HTTP_201_CREATED
)
def create_goal(
    goal_data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if goal_data.deadline < date.today():
        raise HTTPException(
            status_code=422,
            detail="Deadline cannot be in the past."
        )

    goal = Goal(
        user_id=current_user.id,
        goal_type=goal_data.goal_type,
        target_value=goal_data.target_value,
        current_value=goal_data.current_value,
        starting_value=goal_data.current_value,
        deadline=goal_data.deadline,
        status="IN_PROGRESS"
    )

    update_goal_status(goal)

    try:
        db.add(goal)
        db.commit()
        db.refresh(goal)

        return prepare_goal_response(goal)

    except Exception:
        db.rollback()
        raise


# =================================
# 2. GET ALL USER GOALS
# =================================

@router.get("/", response_model=list[GoalResponse])
def get_my_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id)
        .order_by(Goal.created_at.desc())
        .all()
    )

    # Recalculate status so goals become overdue after their deadline.
    for goal in goals:
        update_goal_status(goal)

    db.commit()

    return [
        prepare_goal_response(goal)
        for goal in goals
    ]


# =================================
# 3. GET SINGLE GOAL
# =================================

@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found."
        )

    update_goal_status(goal)
    db.commit()

    return prepare_goal_response(goal)


# =================================
# 4. UPDATE GOAL
# =================================

@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found."
        )

    if goal_data.deadline < date.today():
        raise HTTPException(
            status_code=422,
            detail="Deadline cannot be in the past."
        )

    try:
        # Recalculate the old status before comparing.
        update_goal_status(goal)
        was_completed = is_goal_completed(goal)

        goal.goal_type = goal_data.goal_type
        goal.target_value = goal_data.target_value
        goal.current_value = goal_data.current_value
        goal.starting_value = goal_data.current_value
        goal.deadline = goal_data.deadline

        update_goal_status(goal)

        # Notify if this update completes the goal.
        notify_if_goal_completed(
            db=db,
            goal=goal,
            was_completed=was_completed,
            user_id=current_user.id
        )

        db.commit()
        db.refresh(goal)

        return prepare_goal_response(goal)

    except Exception:
        db.rollback()
        raise


# =================================
# 5. UPDATE GOAL PROGRESS
# =================================

@router.patch(
    "/{goal_id}/progress",
    response_model=GoalResponse
)
def update_goal_progress(
    goal_id: int,
    progress_data: GoalProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found."
        )

    try:
        # Get the goal's actual previous status.
        update_goal_status(goal)
        was_completed = is_goal_completed(goal)

        # Update progress.
        goal.current_value = progress_data.current_value

        # Recalculate status.
        update_goal_status(goal)

        # Create notification only on transition to COMPLETED.
        notify_if_goal_completed(
            db=db,
            goal=goal,
            was_completed=was_completed,
            user_id=current_user.id
        )

        db.commit()
        db.refresh(goal)

        return prepare_goal_response(goal)

    except Exception:
        db.rollback()
        raise


# =================================
# 6. DELETE GOAL
# =================================

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found."
        )

    try:
        db.delete(goal)
        db.commit()

        return {
            "message": "Goal deleted successfully."
        }

    except Exception:
        db.rollback()
        raise
