
from app.database import SessionLocal
from app.models import Doctor


doctors = [
    {
        "full_name": "Dr. Arjun Kumar",
        "qualification": "MBBS, MD General Medicine",
        "specialization": "General Physician",
        "experience_years": 10,
        "consultation_fee": 500,
        "bio": (
            "Demonstration profile for general health "
            "consultations and routine health concerns."
        )
    },
    {
        "full_name": "Dr. Meera Sharma",
        "qualification": "MBBS, MD Cardiology",
        "specialization": "Cardiology",
        "experience_years": 12,
        "consultation_fee": 800,
        "bio": (
            "Demonstration profile for heart health "
            "and cardiovascular consultations."
        )
    },
    {
        "full_name": "Dr. Rahul Reddy",
        "qualification": "MBBS, MS Orthopedics",
        "specialization": "Orthopedics",
        "experience_years": 8,
        "consultation_fee": 600,
        "bio": (
            "Demonstration profile for bone, joint "
            "and muscle-related consultations."
        )
    },
    {
        "full_name": "Dr. Priya Nair",
        "qualification": "MBBS, MD Dermatology",
        "specialization": "Dermatology",
        "experience_years": 7,
        "consultation_fee": 550,
        "bio": (
            "Demonstration profile for skin and "
            "dermatology consultations."
        )
    },
    {
        "full_name": "Dr. Kiran Rao",
        "qualification": "MBBS, MD Endocrinology",
        "specialization": "Endocrinology",
        "experience_years": 9,
        "consultation_fee": 700,
        "bio": (
            "Demonstration profile for endocrine "
            "and metabolic health consultations."
        )
    }
]


def seed_doctors():
    db = SessionLocal()

    try:
        for doctor_data in doctors:
            existing = (
                db.query(Doctor)
                .filter(
                    Doctor.full_name == doctor_data["full_name"]
                )
                .first()
            )

            if existing:
                print(
                    f"Already exists: {doctor_data['full_name']}"
                )
                continue

            doctor = Doctor(
                **doctor_data,
                is_available=True
            )

            db.add(doctor)

        db.commit()
        print("Doctor profiles seeded successfully.")

    except Exception as error:
        db.rollback()
        print("Error seeding doctors:", error)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_doctors()
