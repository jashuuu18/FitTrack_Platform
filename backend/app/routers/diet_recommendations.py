
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Meal
from app.schemas import (
    DietRecommendationRequest,
    DietRecommendationResponse
)

router = APIRouter(
    prefix="/api/v1/diet-recommendations",
    tags=["Diet Recommendations"]
)


# Macro distribution percentages for each fitness goal.
MACRO_DISTRIBUTION = {
    "Weight Loss": {
        "protein": 0.30,
        "carbs": 0.40,
        "fats": 0.30
    },
    "Muscle Gain": {
        "protein": 0.30,
        "carbs": 0.45,
        "fats": 0.25
    },
    "Maintenance": {
        "protein": 0.25,
        "carbs": 0.50,
        "fats": 0.25
    }
}


@router.post(
    "/generate",
    response_model=DietRecommendationResponse
)
def generate_diet_recommendations(
    request: DietRecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate the fitness goal.
    valid_goals = [
        "Weight Loss",
        "Muscle Gain",
        "Maintenance"
    ]

    if request.goal_type not in valid_goals:
        raise HTTPException(
            status_code=400,
            detail="Invalid goal. Choose Weight Loss, Muscle Gain, or Maintenance."
        )

    # Validate activity level.
    valid_activity_levels = [
        "Sedentary",
        "Light",
        "Moderate",
        "Active"
    ]

    if request.activity_level not in valid_activity_levels:
        raise HTTPException(
            status_code=400,
            detail="Invalid activity level."
        )

    # Read today's meals for the logged-in user.
    today = datetime.now().date()

    meals = (
        db.query(Meal)
        .filter(
            Meal.user_id == current_user.id,
            Meal.created_at >= datetime.combine(
                today, datetime.min.time()
            ),
            Meal.created_at < datetime.combine(
                today, datetime.max.time()
            )
        )
        .all()
    )

    calories_consumed = sum(
        float(meal.calories or 0) for meal in meals
    )

    protein_consumed = sum(
        float(meal.protein or 0) for meal in meals
    )

    carbs_consumed = sum(
        float(meal.carbs or 0) for meal in meals
    )

    fats_consumed = sum(
        float(meal.fats or 0) for meal in meals
    )

    # Calculate daily macro targets.
    distribution = MACRO_DISTRIBUTION[request.goal_type]

    calorie_target = request.daily_calorie_target

    protein_target = (
        calorie_target * distribution["protein"] / 4
    )

    carbs_target = (
        calorie_target * distribution["carbs"] / 4
    )

    fats_target = (
        calorie_target * distribution["fats"] / 9
    )

    calories_remaining = calorie_target - calories_consumed

    recommendations = []
    food_suggestions = []

    # Calorie-based recommendations.
    if calories_consumed == 0:
        recommendations.append(
            "You have not recorded any meals today. Start by logging your breakfast."
        )

    elif calories_remaining > 0:
        recommendations.append(
            f"You have approximately {calories_remaining:.0f} calories remaining in your daily target."
        )

    elif calories_remaining < 0:
        recommendations.append(
            f"You have exceeded your daily calorie target by {abs(calories_remaining):.0f} calories. Avoid trying to compensate by skipping meals."
        )

    else:
        recommendations.append(
            "You have reached your daily calorie target."
        )

    # Protein recommendations.
    if protein_consumed < protein_target:
        protein_gap = protein_target - protein_consumed

        recommendations.append(
            f"Your protein intake is approximately {protein_gap:.1f} g below your calculated target."
        )

        food_suggestions.extend([
            "Eggs or Greek yogurt",
            "Paneer or tofu",
            "Dal, chickpeas, or beans"
        ])
    else:
        recommendations.append(
            "Your recorded protein intake has reached your calculated daily target."
        )

    # Carbohydrate recommendations.
    if carbs_consumed < carbs_target:
        recommendations.append(
            f"You have approximately {carbs_target - carbs_consumed:.1f} g of carbohydrates remaining in your target."
        )

        food_suggestions.extend([
            "Oats",
            "Brown rice",
            "Whole-grain roti"
        ])
    else:
        recommendations.append(
            "Your recorded carbohydrate intake has reached or exceeded your calculated target."
        )

    # Fat recommendations.
    if fats_consumed < fats_target:
        recommendations.append(
            f"You have approximately {fats_target - fats_consumed:.1f} g of fats remaining in your target."
        )

        food_suggestions.extend([
            "Almonds and walnuts",
            "Seeds",
            "Moderate portions of healthy oils"
        ])
    else:
        recommendations.append(
            "Your recorded fat intake has reached or exceeded your calculated target."
        )

    # Goal-based suggestions.
    if request.goal_type == "Weight Loss":
        recommendations.append(
            "Focus on balanced meals, vegetables, adequate protein, and sustainable portions."
        )

        food_suggestions.extend([
            "Vegetable salad",
            "Grilled vegetables",
            "Lentil soup"
        ])

    elif request.goal_type == "Muscle Gain":
        recommendations.append(
            "Support muscle development with sufficient food, protein, and recovery."
        )

        food_suggestions.extend([
            "Milk or unsweetened soy milk",
            "Paneer and rice",
            "Peanut butter with whole-grain bread"
        ])

    else:
        recommendations.append(
            "Maintain a varied and balanced diet with vegetables, fruits, whole grains, and protein sources."
        )

    # Activity-level suggestions.
    activity_tips = {
        "Sedentary": (
            "Consider adding short walking breaks and gradually increasing "
            "daily movement."
        ),
        "Light": (
            "Maintain your regular light activity and include consistent "
            "walking or gentle exercise."
        ),
        "Moderate": (
            "Continue your balanced exercise routine and support recovery "
            "with regular meals and hydration."
        ),
        "Active": (
            "Support your activity with adequate meals, hydration, and "
            "recovery time."
        )
    }

    # Remove duplicate food suggestions while preserving order.
    food_suggestions = list(dict.fromkeys(food_suggestions))

    return {
        "goal_type": request.goal_type,
        "activity_level": request.activity_level,
        "daily_calorie_target": calorie_target,

        "calories_consumed": round(calories_consumed, 2),
        "calories_remaining": round(calories_remaining, 2),

        "protein_consumed": round(protein_consumed, 2),
        "protein_target": round(protein_target, 2),

        "carbs_consumed": round(carbs_consumed, 2),
        "carbs_target": round(carbs_target, 2),

        "fats_consumed": round(fats_consumed, 2),
        "fats_target": round(fats_target, 2),

        "recommendations": recommendations,
        "food_suggestions": food_suggestions,
        "activity_tip": activity_tips[request.activity_level]
    }
