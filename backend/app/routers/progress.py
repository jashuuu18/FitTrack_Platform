
from datetime import date, timedelta

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import ProgressResponse
from app.dependencies import get_current_user

from app.progress_utils import refresh_daily_progress


router = APIRouter(
    prefix="/api/v1/progress",
    tags=["Daily Progress Tracking"]
)


# =================================
# 1. GET DAILY PROGRESS
# =================================

@router.get(
    "/daily",
    response_model=ProgressResponse
)
def get_daily_progress(
    target_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    selected_date = target_date or date.today()

    try:

        progress = refresh_daily_progress(
            db,
            current_user.id,
            selected_date
        )

        db.commit()
        db.refresh(progress)

        return progress

    except Exception:
        db.rollback()
        raise


# =================================
# 2. GET PROGRESS HISTORY
# =================================

@router.get(
    "/history",
    response_model=list[ProgressResponse]
)
def get_progress_history(
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    today = date.today()

    # Default history: last 7 calendar days
    if end_date is None:
        end_date = today

    if start_date is None:
        start_date = end_date - timedelta(days=6)

    if start_date > end_date:
        raise HTTPException(
            status_code=422,
            detail="Start date cannot be after end date"
        )

    if (end_date - start_date).days > 365:
        raise HTTPException(
            status_code=422,
            detail="Date range cannot exceed 366 calendar days"
        )

    progress_records = []

    current_date = start_date

    try:

        while current_date <= end_date:

            progress = refresh_daily_progress(
                db,
                current_user.id,
                current_date
            )

            progress_records.append(progress)

            current_date += timedelta(days=1)

        db.commit()

        for progress in progress_records:
            db.refresh(progress)

        return progress_records

    except Exception:
        db.rollback()
        raise
