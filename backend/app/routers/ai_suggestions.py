
from collections import Counter
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Workout, Goal, Streak, Exercise
from app.schemas import (
    WorkoutSuggestionsResponse,
    ExerciseSuggestionItem,
)

router = APIRouter(
    prefix="/api/v1/ai-suggestions",
    tags=["AI Workout Suggestions"]
)


def determine_goal_focus(goals):
    """
    Identify the user's main fitness focus from their goals.
    """

    goal_text = " ".join(
        str(goal.goal_type).lower()
        for goal in goals
    )

    if any(word in goal_text for word in ["weight", "loss", "fat"]):
        return "Weight Management", ["Cardio", "Strength", "Yoga"]

    if any(word in goal_text for word in ["muscle", "strength"]):
        return "Muscle Building", ["Strength", "Cardio", "Yoga"]

    if any(word in goal_text for word in ["flexibility", "yoga", "mobility"]):
        return "Flexibility", ["Yoga", "Strength", "Cardio"]

    if any(word in goal_text for word in ["endurance", "stamina", "fitness"]):
        return "Endurance", ["Cardio", "Strength", "Yoga"]

    return "General Fitness", ["Cardio", "Strength", "Yoga"]


@router.get(
    "/",
    response_model=WorkoutSuggestionsResponse
)
def get_workout_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate personalized exercise suggestions for the logged-in user.
    """

    # 1. Get the user's goals.
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id)
        .all()
    )

    goal_focus, preferred_categories = determine_goal_focus(goals)

    # 2. Get workouts from the last 14 days.
    cutoff_date = date.today() - timedelta(days=13)

    recent_workouts = (
        db.query(Workout)
        .filter(
            Workout.user_id == current_user.id,
            Workout.workout_date >= cutoff_date,
            Workout.workout_date <= date.today(),
        )
        .all()
    )

    recent_workouts_count = len(recent_workouts)

    # 3. Analyze the user's recent workout categories.
    category_counts = Counter(
        str(workout.category).lower()
        for workout in recent_workouts
    )

    # 4. Get the user's streak.
    streak_record = (
        db.query(Streak)
        .filter(Streak.user_id == current_user.id)
        .first()
    )

    current_streak = (
        streak_record.current_streak
        if streak_record
        else 0
    )

    # 5. Get exercises from the existing exercise library.
    exercises = (
        db.query(Exercise)
        .order_by(Exercise.name.asc())
        .all()
    )

    # 6. Sort categories by goal relevance and recent activity.
    def category_score(category):
        normalized = str(category).lower()

        try:
            goal_rank = preferred_categories.index(category)
        except ValueError:
            goal_rank = len(preferred_categories)

        recent_count = category_counts.get(normalized, 0)

        return (goal_rank, recent_count)

    # Keep the goal-relevant categories first.
    ordered_categories = sorted(
        preferred_categories,
        key=category_score
    )

    # 7. Select a maximum of five exercises.
    recommendations = []

    for category in ordered_categories:
        matching_exercises = [
            exercise
            for exercise in exercises
            if str(exercise.category).lower() == category.lower()
        ]

        for exercise in matching_exercises:
            recommendations.append(
                ExerciseSuggestionItem(
                    id=exercise.id,
                    name=exercise.name,
                    category=exercise.category,
                    description=exercise.description,
                    duration=exercise.duration,
                )
            )

            if len(recommendations) >= 5:
                break

        if len(recommendations) >= 5:
            break

    # If the preferred categories have no exercises,
    # use the remaining exercises in the library.
    if not recommendations:
        for exercise in exercises[:5]:
            recommendations.append(
                ExerciseSuggestionItem(
                    id=exercise.id,
                    name=exercise.name,
                    category=exercise.category,
                    description=exercise.description,
                    duration=exercise.duration,
                )
            )

    # 8. Create personalized explanations.
    if recent_workouts_count == 0:
        reasoning = (
            "You have no recorded workouts in the last 14 days. "
            "Start with manageable exercises and build a consistent routine."
        )
    elif recent_workouts_count < 4:
        reasoning = (
            f"You completed {recent_workouts_count} workouts in the last "
            "14 days. Try gradually increasing your weekly activity."
        )
    else:
        reasoning = (
            f"You completed {recent_workouts_count} workouts in the last "
            "14 days. Keep up your consistency and vary your exercises."
        )

    if current_streak > 0:
        reasoning += (
            f" Your current workout streak is {current_streak} day(s)."
        )

    if current_streak >= 7:
        weekly_tip = (
            "Excellent consistency! Maintain your routine and include "
            "recovery days when needed."
        )
    elif recent_workouts_count == 0:
        weekly_tip = (
            "Start with short, comfortable sessions. Focus on building "
            "a sustainable habit."
        )
    else:
        weekly_tip = (
            "Aim for a balanced routine this week. Increase exercise "
            "duration or intensity gradually."
        )

    if not recommendations:
        reasoning += (
            " Your Exercise Library is currently empty. Add exercises "
            "to receive personalized recommendations."
        )

    return WorkoutSuggestionsResponse(
        goal_focus=goal_focus,
        reasoning=reasoning,
        weekly_tip=weekly_tip,
        current_streak=current_streak,
        recent_workouts_count=recent_workouts_count,
        recommendations=recommendations,
    )
