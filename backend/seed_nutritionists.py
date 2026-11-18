
from app.database import SessionLocal
from app.models import Nutritionist


nutritionists = [
    {
        "full_name": "Dr. Ananya Sharma",
        "qualification": "M.Sc. Clinical Nutrition",
        "specialization": "Weight Management",
        "experience_years": 8,
        "consultation_fee": 500,
        "bio": "Specializes in practical nutrition plans and healthy weight management."
    },
    {
        "full_name": "Dr. Rahul Verma",
        "qualification": "M.Sc. Sports Nutrition",
        "specialization": "Sports and Muscle Nutrition",
        "experience_years": 6,
        "consultation_fee": 700,
        "bio": "Helps active individuals improve nutrition, recovery, and muscle development."
    },
    {
        "full_name": "Dr. Priya Reddy",
        "qualification": "M.Sc. Food and Nutrition",
        "specialization": "Healthy Lifestyle and Meal Planning",
        "experience_years": 5,
        "consultation_fee": 400,
        "bio": "Focuses on balanced eating habits and practical everyday meal planning."
    }
]


db = SessionLocal()

try:
    for item in nutritionists:
        existing = (
            db.query(Nutritionist)
            .filter(Nutritionist.full_name == item["full_name"])
            .first()
        )

        if existing:
            print(f"{item['full_name']} already exists. Skipping.")
            continue

        db.add(
            Nutritionist(
                **item,
                is_available=True
            )
        )

    db.commit()
    print("Sample nutritionists added successfully.")

except Exception as error:
    db.rollback()
    print("Error:", error)

finally:
    db.close()
