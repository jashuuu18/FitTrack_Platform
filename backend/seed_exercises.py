
from sqlalchemy.orm import Session

from app.database import Base, engine
from app.models import Exercise


EXERCISES = [
    # CARDIO
    {
        "name": "Running",
        "category": "Cardio",
        "description": "Run at a steady or comfortable pace to improve cardiovascular endurance.",
        "duration": 30
    },
    {
        "name": "Cycling",
        "category": "Cardio",
        "description": "Ride a stationary or outdoor bicycle to improve stamina.",
        "duration": 30
    },
    {
        "name": "Jumping Jacks",
        "category": "Cardio",
        "description": "Perform repeated jumping movements to increase heart rate.",
        "duration": 15
    },
    {
        "name": "Skipping",
        "category": "Cardio",
        "description": "Jump over a skipping rope at a steady rhythm.",
        "duration": 15
    },
    {
        "name": "Brisk Walking",
        "category": "Cardio",
        "description": "Walk at a faster pace to improve general fitness.",
        "duration": 30
    },

    # STRENGTH
    {
        "name": "Push Ups",
        "category": "Strength",
        "description": "Use a controlled push-up movement to train the chest, shoulders and arms.",
        "duration": 15
    },
    {
        "name": "Squats",
        "category": "Strength",
        "description": "Perform controlled squats to strengthen the lower body.",
        "duration": 15
    },
    {
        "name": "Plank",
        "category": "Strength",
        "description": "Hold a stable plank position to strengthen core muscles.",
        "duration": 5
    },
    {
        "name": "Lunges",
        "category": "Strength",
        "description": "Perform alternating lunges to train the legs and glutes.",
        "duration": 15
    },
    {
        "name": "Dumbbell Curls",
        "category": "Strength",
        "description": "Perform controlled dumbbell curls to train the biceps.",
        "duration": 15
    },

    # YOGA
    {
        "name": "Sun Salutation",
        "category": "Yoga",
        "description": "Practice a sequence of yoga poses coordinated with breathing.",
        "duration": 15
    },
    {
        "name": "Tree Pose",
        "category": "Yoga",
        "description": "Practice a standing balance pose to improve stability.",
        "duration": 5
    },
    {
        "name": "Child's Pose",
        "category": "Yoga",
        "description": "Practice a resting pose to relax and gently stretch the body.",
        "duration": 5
    },
    {
        "name": "Cobra Pose",
        "category": "Yoga",
        "description": "Practice a gentle backbend to stretch the front of the body.",
        "duration": 5
    },
    {
        "name": "Warrior Pose",
        "category": "Yoga",
        "description": "Practice a standing pose to develop balance and strength.",
        "duration": 10
    }
]


def seed_exercises():
    # Create missing tables using the imported model metadata.
    Base.metadata.create_all(bind=engine)

    db = Session(bind=engine)

    try:
        added = 0

        for item in EXERCISES:
            existing = db.query(Exercise).filter(
                Exercise.name == item["name"]
            ).first()

            if not existing:
                db.add(Exercise(**item))
                added += 1

        db.commit()

        print(f"Exercise seeding completed. Added {added} exercises.")

        total = db.query(Exercise).count()
        print(f"Total exercises in database: {total}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_exercises()
