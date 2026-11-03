
from datetime import date, timedelta
from calendar import monthrange

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Workout, Goal, User

router = APIRouter(
    prefix="/api/v1/reports",
    tags=["Reports & Analytics"]
)


def get_workout_summary(db: Session, user_id: int, start_date: date, end_date: date):
    result = db.query(
        func.count(Workout.id),
        func.coalesce(func.sum(Workout.calories_burned), 0),
        func.coalesce(func.sum(Workout.duration), 0)
    ).filter(
        Workout.user_id == user_id,
        Workout.workout_date >= start_date,
        Workout.workout_date <= end_date
    ).one()

    return {
        "total_workouts": int(result[0] or 0),
        "total_calories": int(result[1] or 0),
        "total_duration": int(result[2] or 0)
    }


def get_daily_breakdown(db: Session, user_id: int, start_date: date, end_date: date):
    results = db.query(
        Workout.workout_date,
        func.count(Workout.id).label("total_workouts"),
        func.coalesce(func.sum(Workout.calories_burned), 0).label("total_calories"),
        func.coalesce(func.sum(Workout.duration), 0).label("total_duration")
    ).filter(
        Workout.user_id == user_id,
        Workout.workout_date >= start_date,
        Workout.workout_date <= end_date
    ).group_by(
        Workout.workout_date
    ).order_by(
        Workout.workout_date
    ).all()

    daily_data = {
        item.workout_date: {
            "total_workouts": int(item.total_workouts),
            "total_calories": int(item.total_calories),
            "total_duration": int(item.total_duration)
        }
        for item in results
    }

    output = []
    current = start_date

    while current <= end_date:
        data = daily_data.get(current, {
            "total_workouts": 0,
            "total_calories": 0,
            "total_duration": 0
        })

        output.append({
            "date": current.isoformat(),
            **data
        })

        current += timedelta(days=1)

    return output


@router.get("/overview")
def get_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    week_start = today - timedelta(days=6)
    month_start = today.replace(day=1)

    all_time = get_workout_summary(
        db, current_user.id, date(2000, 1, 1), today
    )

    weekly = get_workout_summary(
        db, current_user.id, week_start, today
    )

    monthly = get_workout_summary(
        db, current_user.id, month_start, today
    )

    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).all()

    return {
        "total_workouts": all_time["total_workouts"],
        "total_calories": all_time["total_calories"],
        "total_duration": all_time["total_duration"],
        "weekly_workouts": weekly["total_workouts"],
        "weekly_calories": weekly["total_calories"],
        "weekly_duration": weekly["total_duration"],
        "monthly_workouts": monthly["total_workouts"],
        "monthly_calories": monthly["total_calories"],
        "monthly_duration": monthly["total_duration"],
        "total_goals": len(goals),
        "completed_goals": sum(1 for goal in goals if goal.status == "COMPLETED"),
        "in_progress_goals": sum(1 for goal in goals if goal.status == "IN_PROGRESS"),
        "overdue_goals": sum(1 for goal in goals if goal.status == "OVERDUE")
    }


@router.get("/weekly")
def get_weekly_report(
    start_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    end_date = date.today()
    start_date = start_date or (end_date - timedelta(days=6))

    if start_date > end_date:
        raise HTTPException(
            status_code=422,
            detail="Start date cannot be after today."
        )

    if (end_date - start_date).days > 30:
        raise HTTPException(
            status_code=422,
            detail="Weekly report range cannot exceed 31 days."
        )

    summary = get_workout_summary(
        db, current_user.id, start_date, end_date
    )

    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        **summary,
        "daily_breakdown": get_daily_breakdown(
            db, current_user.id, start_date, end_date
        )
    }


@router.get("/monthly")
def get_monthly_report(
    year: int = Query(default_factory=lambda: date.today().year, ge=2000, le=2100),
    month: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    start_date = date(year, month, 1)
    last_day = monthrange(year, month)[1]
    end_date = min(date(year, month, last_day), date.today())

    if start_date > date.today():
        raise HTTPException(
            status_code=422,
            detail="Future months cannot be reported."
        )

    summary = get_workout_summary(
        db, current_user.id, start_date, end_date
    )

    return {
        "year": year,
        "month": month,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        **summary,
        "daily_breakdown": get_daily_breakdown(
            db, current_user.id, start_date, end_date
        )
    }


@router.get("/categories")
def get_category_report(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    end_date = end_date or date.today()
    start_date = start_date or (end_date - timedelta(days=29))

    if start_date > end_date:
        raise HTTPException(
            status_code=422,
            detail="Start date cannot be after end date."
        )

    results = db.query(
        Workout.category,
        func.count(Workout.id).label("total_workouts"),
        func.coalesce(func.sum(Workout.calories_burned), 0).label("total_calories"),
        func.coalesce(func.sum(Workout.duration), 0).label("total_duration")
    ).filter(
        Workout.user_id == current_user.id,
        Workout.workout_date >= start_date,
        Workout.workout_date <= end_date
    ).group_by(
        Workout.category
    ).all()

    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "categories": [
            {
                "category": item.category,
                "total_workouts": int(item.total_workouts),
                "total_calories": int(item.total_calories),
                "total_duration": int(item.total_duration)
            }
            for item in results
        ]
    }


@router.get("/goals")
def get_goal_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).all()

    today = date.today()
    completed = 0
    overdue = 0
    in_progress = 0

    for goal in goals:
        if goal.goal_type == "Weight Loss":
            is_completed = goal.current_value <= goal.target_value
        else:
            is_completed = goal.current_value >= goal.target_value

        if is_completed:
            completed += 1
        elif goal.deadline < today:
            overdue += 1
        else:
            in_progress += 1

    return {
        "total_goals": len(goals),
        "completed_goals": completed,
        "in_progress_goals": in_progress,
        "overdue_goals": overdue
    }


@router.get("/calories")
def get_calorie_report(
    days: int = Query(default=7, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)

    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "daily_calories": get_daily_breakdown(
            db, current_user.id, start_date, end_date
        )
    }
