from sqlalchemy.orm import Session

from app.database import Base, engine
from app.models import Badge


BADGES = [
    {
        "name": "First Workout",
        "description": "Complete your first workout.",
        "icon": "🏅"
    },
    {
        "name": "Workout Beginner",
        "description": "Complete 5 workouts.",
        "icon": "💪"
    },
    {
        "name": "Fitness Enthusiast",
        "description": "Complete 10 workouts.",
        "icon": "🏋️"
    },
    {
        "name": "Workout Champion",
        "description": "Complete 50 workouts.",
        "icon": "🏆"
    },
    {
        "name": "7-Day Streak",
        "description": "Maintain a 7-day workout streak.",
        "icon": "🔥"
    },
    {
        "name": "30-Day Streak",
        "description": "Maintain a 30-day workout streak.",
        "icon": "🌟"
    },
    {
        "name": "Goal Achiever",
        "description": "Complete a fitness goal.",
        "icon": "🎯"
    }
]


def seed_badges():
    Base.metadata.create_all(bind=engine)

    db = Session(bind=engine)

    try:
        added = 0

        for badge_data in BADGES:
            existing = (
                db.query(Badge)
                .filter(Badge.name == badge_data["name"])
                .first()
            )

            if not existing:
                db.add(Badge(**badge_data))
                added += 1

        db.commit()

        total = db.query(Badge).count()

        print(f"Badges added: {added}")
        print(f"Total badges: {total}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_badges()