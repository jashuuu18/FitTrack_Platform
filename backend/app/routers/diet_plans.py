from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models import DietPlan, UserDietPlan, User
from app.schemas import DietPlanResponse, UserDietPlanResponse


router = APIRouter(
    prefix="/api/v1/diet-plans",
    tags=["Diet Plans"]
)


# -------------------------------------------------
# 1. VIEW ALL DIET PLANS
# -------------------------------------------------

@router.get("/", response_model=list[DietPlanResponse])
def get_diet_plans(
    goal_type: str | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DietPlan)

    if goal_type:
        allowed_goals = [
            "Weight Loss",
            "Muscle Gain",
            "Maintenance"
        ]

        if goal_type not in allowed_goals:
            raise HTTPException(
                status_code=400,
                detail="Invalid diet goal type"
            )

        query = query.filter(DietPlan.goal_type == goal_type)

    if search:
        query = query.filter(
            DietPlan.title.ilike(f"%{search.strip()}%")
        )

    return query.order_by(DietPlan.id.asc()).all()


# -------------------------------------------------
# 2. VIEW DIET PLAN DETAILS
# -------------------------------------------------

@router.get("/{diet_plan_id}", response_model=DietPlanResponse)
def get_diet_plan_details(
    diet_plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    diet_plan = (
        db.query(DietPlan)
        .filter(DietPlan.id == diet_plan_id)
        .first()
    )

    if not diet_plan:
        raise HTTPException(
            status_code=404,
            detail="Diet plan not found"
        )

    return diet_plan


# -------------------------------------------------
# 3. ASSIGN DIET PLAN TO CURRENT USER
# -------------------------------------------------

@router.post(
    "/{diet_plan_id}/assign",
    response_model=UserDietPlanResponse
)
def assign_diet_plan(
    diet_plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    diet_plan = (
        db.query(DietPlan)
        .filter(DietPlan.id == diet_plan_id)
        .first()
    )

    if not diet_plan:
        raise HTTPException(
            status_code=404,
            detail="Diet plan not found"
        )

    existing_assignment = (
        db.query(UserDietPlan)
        .options(joinedload(UserDietPlan.diet_plan))
        .filter(
            UserDietPlan.user_id == current_user.id,
            UserDietPlan.diet_plan_id == diet_plan_id,
            UserDietPlan.is_active.is_(True)
        )
        .first()
    )

    if existing_assignment:
        return existing_assignment

    # Deactivate the user's previous active plan.
    previous_assignments = (
        db.query(UserDietPlan)
        .filter(
            UserDietPlan.user_id == current_user.id,
            UserDietPlan.is_active.is_(True)
        )
        .all()
    )

    for assignment in previous_assignments:
        assignment.is_active = False

    new_assignment = UserDietPlan(
        user_id=current_user.id,
        diet_plan_id=diet_plan_id,
        is_active=True
    )

    db.add(new_assignment)
    db.commit()

    db.refresh(new_assignment)

    return (
        db.query(UserDietPlan)
        .options(joinedload(UserDietPlan.diet_plan))
        .filter(UserDietPlan.id == new_assignment.id)
        .first()
    )


# -------------------------------------------------
# 4. VIEW MY ASSIGNED DIET PLANS
# -------------------------------------------------

@router.get(
    "/my/assigned",
    response_model=list[UserDietPlanResponse]
)
def get_my_assigned_diet_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assignments = (
        db.query(UserDietPlan)
        .options(joinedload(UserDietPlan.diet_plan))
        .filter(UserDietPlan.user_id == current_user.id)
        .order_by(UserDietPlan.assigned_at.desc())
        .all()
    )

    return assignments