from app.database import SessionLocal
from app.models import DietPlan


diet_plans = [
    {
        "title": "Healthy Weight Loss Plan",
        "description": (
            "A balanced calorie-controlled diet with vegetables, "
            "fruits, whole grains and lean protein."
        ),
        "goal_type": "Weight Loss",
        "daily_calories": 1800,
        "duration": 30
    },
    {
        "title": "High Protein Muscle Gain Plan",
        "description": (
            "A protein-focused meal plan with eggs, pulses, "
            "milk, lean protein and complex carbohydrates."
        ),
        "goal_type": "Muscle Gain",
        "daily_calories": 2500,
        "duration": 30
    },
    {
        "title": "Balanced Maintenance Plan",
        "description": (
            "A balanced everyday meal plan designed to support "
            "energy, recovery and weight maintenance."
        ),
        "goal_type": "Maintenance",
        "daily_calories": 2200,
        "duration": 30
    },
    {
        "title": "Vegetarian Fitness Diet",
        "description": (
            "A vegetarian meal plan featuring lentils, beans, "
            "paneer, vegetables, fruits and whole grains."
        ),
        "goal_type": "Muscle Gain",
        "daily_calories": 2300,
        "duration": 45
    },
    {
        "title": "Simple Healthy Eating Plan",
        "description": (
            "A practical meal plan with balanced portions "
            "and a variety of nutritious foods."
        ),
        "goal_type": "Maintenance",
        "daily_calories": 2000,
        "duration": 30
    }
]


def seed_diet_plans():
    db = SessionLocal()

    try:
        for plan_data in diet_plans:
            existing_plan = (
                db.query(DietPlan)
                .filter(DietPlan.title == plan_data["title"])
                .first()
            )

            if not existing_plan:
                db.add(DietPlan(**plan_data))

        db.commit()
        print("Diet plans seeded successfully!")

    except Exception as error:
        db.rollback()
        print("Error seeding diet plans:", error)

    finally:
        db.close()


if __name__ == "__main__":
    seed_diet_plans()