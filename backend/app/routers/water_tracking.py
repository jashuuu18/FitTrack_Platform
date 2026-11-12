
from datetime import date

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status
)
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, WaterTracking
from app.schemas import (
    WaterTrackingCreate,
    WaterTrackingResponse,
    WaterSummaryResponse
)

router = APIRouter(
    prefix="/api/v1/water",
    tags=["Water Intake Tracking"]
)

# Default daily water target: 2.5 litres
DEFAULT_DAILY_GOAL_ML = 2500


# --------------------------------------------------
# ADD WATER INTAKE
# --------------------------------------------------

@router.post(
    "/entries",
    response_model=WaterTrackingResponse,
    status_code=status.HTTP_201_CREATED
)
def create_water_entry(
    water_data: WaterTrackingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_entry = WaterTracking(
        user_id=current_user.id,
        quantity=water_data.quantity,
        date=water_data.date or date.today()
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return new_entry


# --------------------------------------------------
# GET WATER ENTRIES FOR A DATE
# --------------------------------------------------

@router.get(
    "/entries",
    response_model=list[WaterTrackingResponse]
)
def get_water_entries(
    selected_date: date = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_date = selected_date or date.today()

    entries = (
        db.query(WaterTracking)
        .filter(
            WaterTracking.user_id == current_user.id,
            WaterTracking.date == target_date
        )
        .order_by(
            WaterTracking.created_at.desc(),
            WaterTracking.id.desc()
        )
        .all()
    )

    return entries


# --------------------------------------------------
# DAILY WATER SUMMARY
# --------------------------------------------------

@router.get(
    "/summary",
    response_model=WaterSummaryResponse
)
def get_water_summary(
    selected_date: date = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_date = selected_date or date.today()

    result = (
        db.query(
            func.coalesce(
                func.sum(WaterTracking.quantity), 0
            ).label("total_intake"),
            func.count(WaterTracking.id).label("total_entries")
        )
        .filter(
            WaterTracking.user_id == current_user.id,
            WaterTracking.date == target_date
        )
        .first()
    )

    total_intake = int(result.total_intake or 0)

    remaining = max(
        DEFAULT_DAILY_GOAL_ML - total_intake,
        0
    )

    percentage = min(
        round(
            (total_intake / DEFAULT_DAILY_GOAL_ML) * 100,
            2
        ),
        100
    )

    return {
        "selected_date": target_date,
        "total_intake": total_intake,
        "daily_goal": DEFAULT_DAILY_GOAL_ML,
        "remaining": remaining,
        "progress_percentage": percentage,
        "total_entries": result.total_entries
    }


# --------------------------------------------------
# DELETE WATER ENTRY
# --------------------------------------------------

@router.delete("/entries/{entry_id}")
def delete_water_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = (
        db.query(WaterTracking)
        .filter(
            WaterTracking.id == entry_id,
            WaterTracking.user_id == current_user.id
        )
        .first()
    )

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Water entry not found"
        )

    db.delete(entry)
    db.commit()

    return {
        "message": "Water intake entry deleted successfully"
    }
