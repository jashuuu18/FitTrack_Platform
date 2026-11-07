
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import (
    User,
    Workout,
    Goal,
    Badge,
    UserBadge,
    Streak
)

router = APIRouter(
    prefix="/api/v1/badges",
    tags=["Achievement Badges"]
)


def calculate_current_streak(workout_dates):
    """Calculate consecutive workout days ending today or yesterday."""

    today = date.today()

    dates = sorted({
        workout_date
        for workout_date in workout_dates
        if workout_date is not None and workout_date <= today
    })

    if not dates:
        return 0

    last_date = dates[-1]

    # Streak is active if the last workout was today or yesterday.
    if last_date < today - timedelta(days=1):
        return 0

    streak = 1

    for index in range(len(dates) - 1, 0, -1):
        if dates[index] == dates[index - 1] + timedelta(days=1):
            streak += 1
        else:
            break

    return streak


def get_user_earned_badge_ids(db, user_id):
    """Get all badge IDs already earned by a user."""

    records = (
        db.query(UserBadge.badge_id)
        .filter(UserBadge.user_id == user_id)
        .all()
    )

    return {record[0] for record in records}


def award_badges(db, user):
    """Check badge conditions and award new badges."""

    badges = db.query(Badge).all()

    # Count the user's completed workout records.
    workout_count = (
        db.query(Workout)
        .filter(Workout.user_id == user.id)
        .count()
    )

    # Get all unique workout dates.
    workout_dates = [
        row[0]
        for row in (
            db.query(Workout.workout_date)
            .filter(Workout.user_id == user.id)
            .distinct()
            .all()
        )
    ]

    # Calculate current streak.
    current_streak = calculate_current_streak(workout_dates)

    # Get the user's stored streak record.
    streak_record = (
        db.query(Streak)
        .filter(Streak.user_id == user.id)
        .first()
    )

    # Use the stored longest streak when available.
    longest_streak = (
        streak_record.longest_streak
        if streak_record
        else current_streak
    )

    # Compare current and longest streak.
    best_streak = max(current_streak, longest_streak or 0)

    # Check whether the user has achieved any goal.
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == user.id)
        .all()
    )

    goal_achieved = any(
        (
            goal.target_value is not None
            and goal.current_value is not None
            and goal.current_value >= goal.target_value
        )
        or str(goal.status or "").upper() in (
            "COMPLETED",
            "ACHIEVED"
        )
        for goal in goals
    )

    # Get badges already earned.
    earned_ids = get_user_earned_badge_ids(db, user.id)

    newly_awarded = []

    # Badge eligibility rules.
    badge_rules = {
        "First Workout": workout_count >= 1,
        "Workout Beginner": workout_count >= 5,
        "Fitness Enthusiast": workout_count >= 10,
        "Workout Champion": workout_count >= 50,
        "7-Day Streak": best_streak >= 7,
        "30-Day Streak": best_streak >= 30,
        "Goal Achiever": goal_achieved
    }

    # Award qualifying badges only once.
    for badge in badges:

        qualifies = badge_rules.get(badge.name, False)

        if qualifies and badge.id not in earned_ids:

            award = UserBadge(
                user_id=user.id,
                badge_id=badge.id
            )

            db.add(award)

            newly_awarded.append(badge.name)

    db.commit()

    return newly_awarded


@router.get("/")
def get_all_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all predefined badges and whether the user has earned them."""

    award_badges(db, current_user)

    earned_ids = get_user_earned_badge_ids(
        db,
        current_user.id
    )

    badges = (
        db.query(Badge)
        .order_by(Badge.id.asc())
        .all()
    )

    result = []

    for badge in badges:
        result.append({
            "id": badge.id,
            "name": badge.name,
            "description": badge.description,
            "icon": badge.icon,
            "is_earned": badge.id in earned_ids
        })

    return result


@router.get("/me")
def get_my_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the current user's earned badges."""

    newly_awarded = award_badges(db, current_user)

    earned = (
        db.query(UserBadge, Badge)
        .join(
            Badge,
            UserBadge.badge_id == Badge.id
        )
        .filter(UserBadge.user_id == current_user.id)
        .order_by(UserBadge.earned_at.desc())
        .all()
    )

    return {
        "total_earned": len(earned),
        "newly_awarded": newly_awarded,
        "badges": [
            {
                "id": badge.id,
                "name": badge.name,
                "description": badge.description,
                "icon": badge.icon,
                "earned_at": user_badge.earned_at
            }
            for user_badge, badge in earned
        ]
    }
