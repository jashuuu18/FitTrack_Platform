
from app.database import SessionLocal
from app.models import Subscription
import json


plans = [
    {
        "name": "Free",
        "price": 0,
        "duration": 365,
        "description": "Get started with basic fitness and nutrition tracking.",
        "features": [
            "Basic workout tracking",
            "Basic nutrition tracking",
            "Daily progress tracking",
            "Basic diet plans"
        ]
    },
    {
        "name": "Premium",
        "price": 499,
        "duration": 30,
        "description": "Improve your fitness journey with advanced features.",
        "features": [
            "Everything in Free",
            "All available diet plans",
            "Advanced nutrition analytics",
            "Nutritionist consultation booking",
            "Priority support"
        ]
    },
    {
        "name": "Pro",
        "price": 999,
        "duration": 30,
        "description": "Get the complete fitness and nutrition experience.",
        "features": [
            "Everything in Premium",
            "Advanced fitness insights",
            "Priority nutritionist consultation",
            "Doctor appointment access",
            "Personalized recommendations"
        ]
    }
]


db = SessionLocal()

try:
    for item in plans:
        existing = (
            db.query(Subscription)
            .filter(Subscription.name == item["name"])
            .first()
        )

        if existing:
            print(f"{item['name']} plan already exists. Skipping.")
            continue

        plan = Subscription(
            name=item["name"],
            price=item["price"],
            duration=item["duration"],
            description=item["description"],
            features=json.dumps(item["features"]),
            is_active=True
        )

        db.add(plan)

    db.commit()
    print("Subscription plans seeded successfully.")

except Exception as error:
    db.rollback()
    print("Error:", error)

finally:
    db.close()
