
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Meal
from app.schemas import (
    MealCreate,
    MealResponse,
    NutritionSummary
)

router = APIRouter(
    prefix="/api/v1/nutrition",
    tags=["Nutrition & Meal Tracking"]
)


# --------------------------------------------------
# ADD A MEAL
# --------------------------------------------------

@router.post(
    "/meals",
    response_model=MealResponse,
    status_code=status.HTTP_201_CREATED
)
def create_meal(
    meal_data: MealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_meal = Meal(
        user_id=current_user.id,
        meal_type=meal_data.meal_type,
        food_name=meal_data.food_name.strip(),
        calories=meal_data.calories,
        protein=meal_data.protein,
        carbs=meal_data.carbs,
        fats=meal_data.fats
    )

    if not new_meal.food_name:
        raise HTTPException(
            status_code=400,
            detail="Food name cannot be empty"
        )

    db.add(new_meal)
    db.commit()
    db.refresh(new_meal)

    return new_meal


# --------------------------------------------------
# GET MEALS FOR A SELECTED DATE
# --------------------------------------------------

@router.get(
    "/meals",
    response_model=list[MealResponse]
)
def get_meals(
    selected_date: date = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_date = selected_date or date.today()

    meals = (
        db.query(Meal)
        .filter(
            Meal.user_id == current_user.id,
            func.date(Meal.created_at) == target_date.isoformat()
        )
        .order_by(Meal.created_at.desc())
        .all()
    )

    return meals


# --------------------------------------------------
# DAILY NUTRITION SUMMARY
# --------------------------------------------------

@router.get(
    "/summary",
    response_model=NutritionSummary
)
def get_nutrition_summary(
    selected_date: date = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_date = selected_date or date.today()

    result = (
        db.query(
            func.count(Meal.id).label("total_meals"),
            func.coalesce(
                func.sum(Meal.calories), 0
            ).label("total_calories"),
            func.coalesce(
                func.sum(Meal.protein), 0
            ).label("total_protein"),
            func.coalesce(
                func.sum(Meal.carbs), 0
            ).label("total_carbs"),
            func.coalesce(
                func.sum(Meal.fats), 0
            ).label("total_fats")
        )
        .filter(
            Meal.user_id == current_user.id,
            func.date(Meal.created_at) == target_date.isoformat()
        )
        .first()
    )

    return {
        "selected_date": target_date.isoformat(),
        "total_meals": result.total_meals,
        "total_calories": round(float(result.total_calories), 2),
        "total_protein": round(float(result.total_protein), 2),
        "total_carbs": round(float(result.total_carbs), 2),
        "total_fats": round(float(result.total_fats), 2)
    }


# --------------------------------------------------
# DELETE A MEAL
# --------------------------------------------------

@router.delete("/meals/{meal_id}")
def delete_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meal = (
        db.query(Meal)
        .filter(
            Meal.id == meal_id,
            Meal.user_id == current_user.id
        )
        .first()
    )

    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )

    db.delete(meal)
    db.commit()

    return {
        "message": "Meal deleted successfully"
    }
