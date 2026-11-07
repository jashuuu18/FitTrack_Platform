
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import WorkoutPlan, User
from app.schemas import (
    WorkoutPlanCreate,
    WorkoutPlanUpdate,
    WorkoutPlanResponse
)

router = APIRouter(
    prefix="/api/v1/workout-plans",
    tags=["Workout Plans"]
)


# =================================
# CREATE WORKOUT PLAN
# =================================

@router.post(
    "/",
    response_model=WorkoutPlanResponse,
    status_code=status.HTTP_201_CREATED
)
def create_workout_plan(
    plan_data: WorkoutPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if plan_data.scheduled_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Scheduled date cannot be in the past"
        )

    new_plan = WorkoutPlan(
        user_id=current_user.id,
        title=plan_data.title.strip(),
        description=plan_data.description,
        scheduled_date=plan_data.scheduled_date
    )

    if not new_plan.title:
        raise HTTPException(
            status_code=422,
            detail="Workout plan title cannot be empty"
        )

    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    return new_plan


# =================================
# VIEW UPCOMING WORKOUT PLANS
# =================================

@router.get(
    "/upcoming",
    response_model=list[WorkoutPlanResponse]
)
def get_upcoming_workout_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(default=10, ge=1, le=100)
):
    return (
        db.query(WorkoutPlan)
        .filter(
            WorkoutPlan.user_id == current_user.id,
            WorkoutPlan.scheduled_date >= date.today()
        )
        .order_by(WorkoutPlan.scheduled_date.asc())
        .limit(limit)
        .all()
    )


# =================================
# VIEW ALL WORKOUT PLANS
# =================================

@router.get(
    "/",
    response_model=list[WorkoutPlanResponse]
)
def get_workout_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200)
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=422,
            detail="Start date cannot be after end date"
        )

    query = db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id
    )

    if start_date:
        query = query.filter(
            WorkoutPlan.scheduled_date >= start_date
        )

    if end_date:
        query = query.filter(
            WorkoutPlan.scheduled_date <= end_date
        )

    return (
        query
        .order_by(WorkoutPlan.scheduled_date.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# =================================
# VIEW SINGLE WORKOUT PLAN
# =================================

@router.get(
    "/{plan_id}",
    response_model=WorkoutPlanResponse
)
def get_workout_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.id == plan_id,
        WorkoutPlan.user_id == current_user.id
    ).first()

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Workout plan not found"
        )

    return plan


# =================================
# UPDATE WORKOUT PLAN
# =================================

@router.put(
    "/{plan_id}",
    response_model=WorkoutPlanResponse
)
def update_workout_plan(
    plan_id: int,
    plan_data: WorkoutPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.id == plan_id,
        WorkoutPlan.user_id == current_user.id
    ).first()

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Workout plan not found"
        )

    update_data = plan_data.model_dump(exclude_unset=True)

    if "title" in update_data:
        if update_data["title"] is None:
            raise HTTPException(
                status_code=422,
                detail="Title cannot be null"
            )

        update_data["title"] = update_data["title"].strip()

        if not update_data["title"]:
            raise HTTPException(
                status_code=422,
                detail="Title cannot be empty"
            )

    if "description" in update_data:
        if update_data["description"] is None:
            update_data["description"] = None

    if "scheduled_date" in update_data:
        if update_data["scheduled_date"] is None:
            raise HTTPException(
                status_code=422,
                detail="Scheduled date cannot be null"
            )

        if update_data["scheduled_date"] < date.today():
            raise HTTPException(
                status_code=400,
                detail="Scheduled date cannot be in the past"
            )

    for field, value in update_data.items():
        setattr(plan, field, value)

    db.commit()
    db.refresh(plan)

    return plan


# =================================
# DELETE WORKOUT PLAN
# =================================

@router.delete("/{plan_id}")
def delete_workout_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.id == plan_id,
        WorkoutPlan.user_id == current_user.id
    ).first()

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Workout plan not found"
        )

    db.delete(plan)
    db.commit()

    return {
        "message": "Workout plan deleted successfully"
    }
