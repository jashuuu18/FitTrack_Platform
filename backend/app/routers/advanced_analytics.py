
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import (
    User,
    Workout,
    Goal,
    Streak,
    Meal,
    WaterTracking,
    ExternalActivity,
)

router = APIRouter(
    prefix="/api/v1/advanced-analytics",
    tags=["Advanced Analytics"]
)


def get_record_date(value):
    """Convert a date or datetime value into a date."""
    if isinstance(value, datetime):
        return value.date()

    return value


@router.get("/")
def get_advanced_analytics(
    start_date: date = Query(
        default=None,
        description="Start date in YYYY-MM-DD format"
    ),
    end_date: date = Query(
        default=None,
        description="End date in YYYY-MM-DD format"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    selected_end = end_date or today
    selected_start = start_date or (selected_end - timedelta(days=29))

    if selected_start > selected_end:
        raise HTTPException(
            status_code=400,
            detail="Start date cannot be after end date."
        )

    if (selected_end - selected_start).days > 365:
        raise HTTPException(
            status_code=400,
            detail="Please select a date range of 366 days or less."
        )

    user_id = current_user.id

    # -------------------------------------------------
    # 1. Fetch workouts in the selected date range
    # -------------------------------------------------
    workouts = (
        db.query(Workout)
        .filter(
            Workout.user_id == user_id,
            Workout.workout_date >= selected_start,
            Workout.workout_date <= selected_end,
        )
        .all()
    )

    # -------------------------------------------------
    # 2. Fetch nutrition records in the selected range
    # -------------------------------------------------
    meals = (
        db.query(Meal)
        .filter(
            Meal.user_id == user_id,
            func.date(Meal.created_at) >= selected_start.isoformat(),
            func.date(Meal.created_at) <= selected_end.isoformat(),
        )
        .all()
    )

    # -------------------------------------------------
    # 3. Fetch water intake records
    # -------------------------------------------------
    water_entries = (
        db.query(WaterTracking)
        .filter(
            WaterTracking.user_id == user_id,
            WaterTracking.date >= selected_start,
            WaterTracking.date <= selected_end,
        )
        .all()
    )

    # -------------------------------------------------
    # 4. Fetch imported fitness activities
    # -------------------------------------------------
    imported_activities = (
        db.query(ExternalActivity)
        .filter(
            ExternalActivity.user_id == user_id
        )
        .all()
    )

    imported_activities = [
        item for item in imported_activities
        if selected_start <= get_record_date(item.started_at) <= selected_end
    ]

    # -------------------------------------------------
    # 5. Fetch goals and streak
    # -------------------------------------------------
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == user_id)
        .all()
    )

    streak = (
        db.query(Streak)
        .filter(Streak.user_id == user_id)
        .first()
    )

    # -------------------------------------------------
    # 6. Calculate workout summary
    # -------------------------------------------------
    total_workouts = len(workouts)

    total_calories_burned = round(
        sum(float(item.calories_burned or 0) for item in workouts),
        2
    )

    total_workout_minutes = sum(
        int(item.duration or 0) for item in workouts
    )

    # -------------------------------------------------
    # 7. Calculate nutrition summary
    # -------------------------------------------------
    total_meal_calories = round(
        sum(float(item.calories or 0) for item in meals),
        2
    )

    total_protein = round(
        sum(float(item.protein or 0) for item in meals),
        2
    )

    total_carbs = round(
        sum(float(item.carbs or 0) for item in meals),
        2
    )

    total_fats = round(
        sum(float(item.fats or 0) for item in meals),
        2
    )

    # -------------------------------------------------
    # 8. Calculate water summary
    # -------------------------------------------------
    total_water_ml = sum(
        int(item.quantity or 0) for item in water_entries
    )

    # -------------------------------------------------
    # 9. Calculate imported activity summary
    # -------------------------------------------------
    total_imported_activities = len(imported_activities)

    imported_calories = round(
        sum(float(item.calories_burned or 0)
            for item in imported_activities),
        2
    )

    imported_duration_minutes = sum(
        int(item.duration_seconds or 0)
        for item in imported_activities
    ) // 60

    imported_steps = sum(
        int(item.steps or 0)
        for item in imported_activities
    )

    # -------------------------------------------------
    # 10. Calculate goals summary
    # -------------------------------------------------
    completed_goals = sum(
        1 for goal in goals
        if str(goal.status).lower() in ("completed", "complete")
    )

    active_goals = sum(
        1 for goal in goals
        if str(goal.status).lower() == "active"
    )

    average_goal_progress = (
        round(
            sum(
                min(
                    float(goal.current_value or 0)
                    / float(goal.target_value) * 100,
                    100
                )
                for goal in goals
                if float(goal.target_value or 0) > 0
            ) / len([
                goal for goal in goals
                if float(goal.target_value or 0) > 0
            ]),
            2
        )
        if any(float(goal.target_value or 0) > 0 for goal in goals)
        else 0
    )

    # -------------------------------------------------
    # 11. Create daily analytics records
    # -------------------------------------------------
    daily_data = {}

    current_day = selected_start

    while current_day <= selected_end:
        day_key = current_day.isoformat()

        daily_data[day_key] = {
            "date": day_key,
            "workouts": 0,
            "calories_burned": 0,
            "workout_minutes": 0,
            "meal_calories": 0,
            "protein": 0,
            "carbs": 0,
            "fats": 0,
            "water_ml": 0,
            "imported_activities": 0,
        }

        current_day += timedelta(days=1)

    for workout in workouts:
        key = get_record_date(workout.workout_date).isoformat()

        daily_data[key]["workouts"] += 1
        daily_data[key]["calories_burned"] += float(
            workout.calories_burned or 0
        )
        daily_data[key]["workout_minutes"] += int(
            workout.duration or 0
        )

    for meal in meals:
        meal_day = get_record_date(meal.created_at)

        if meal_day:
            key = meal_day.isoformat()

            if key in daily_data:
                daily_data[key]["meal_calories"] += float(
                    meal.calories or 0
                )
                daily_data[key]["protein"] += float(
                    meal.protein or 0
                )
                daily_data[key]["carbs"] += float(
                    meal.carbs or 0
                )
                daily_data[key]["fats"] += float(
                    meal.fats or 0
                )

    for entry in water_entries:
        key = entry.date.isoformat()
        daily_data[key]["water_ml"] += int(entry.quantity or 0)

    for activity in imported_activities:
        activity_day = get_record_date(activity.started_at)
        key = activity_day.isoformat()

        if key in daily_data:
            daily_data[key]["imported_activities"] += 1

    daily_trends = list(daily_data.values())

    # Round decimal values for cleaner chart output.
    for item in daily_trends:
        for field in (
            "calories_burned",
            "meal_calories",
            "protein",
            "carbs",
            "fats",
        ):
            item[field] = round(item[field], 2)

    # -------------------------------------------------
    # 12. Workout category distribution
    # -------------------------------------------------
    category_counts = {}

    for workout in workouts:
        category = workout.category or "Other"

        category_counts[category] = (
            category_counts.get(category, 0) + 1
        )

    category_breakdown = [
        {
            "category": category,
            "count": count,
        }
        for category, count in category_counts.items()
    ]

    # -------------------------------------------------
    # 13. Return analytics response
    # -------------------------------------------------
    return {
        "date_range": {
            "start_date": selected_start.isoformat(),
            "end_date": selected_end.isoformat(),
        },

        "summary": {
            "total_workouts": total_workouts,
            "total_calories_burned": total_calories_burned,
            "total_workout_minutes": total_workout_minutes,
            "total_meal_calories": total_meal_calories,
            "total_protein": total_protein,
            "total_carbs": total_carbs,
            "total_fats": total_fats,
            "total_water_ml": total_water_ml,
            "total_imported_activities": total_imported_activities,
            "imported_calories": imported_calories,
            "imported_duration_minutes": imported_duration_minutes,
            "imported_steps": imported_steps,
            "total_goals": len(goals),
            "completed_goals": completed_goals,
            "active_goals": active_goals,
            "average_goal_progress": average_goal_progress,
            "current_streak": streak.current_streak if streak else 0,
            "longest_streak": streak.longest_streak if streak else 0,
        },

        "daily_trends": daily_trends,

        "category_breakdown": category_breakdown,
    }
